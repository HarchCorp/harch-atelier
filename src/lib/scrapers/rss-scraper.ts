// ═══════════════════════════════════════════════════════════════
//  RSS SCRAPER v3 — AEGIS-SCRAPER reinforced edition
//  Project AEGIS remediation: hardened RSS / Google News ingestion
//
//  Highlights:
//  • 15 User-Agent rotation to defeat naive bot blocking
//  • 30 s request timeout via AbortController (no more hung scrapes)
//  • Exponential backoff retry (3 attempts) on transient failures
//  • Direct-feed scraper with 403-aware UA fallback (TelQuel, Medias24)
//  • Full article content fetcher with HTML sanitization (5 000 char cap
//    to respect GLM-4 context window)
//  • Lightweight language detection (ar / fr / en)
//  • SHA-256 URL hashing for stable dedupe keys
//  • Backward-compatible exports: Article / scrapeForCompany / scrapeAllSources
//    so orchestrator-v2.ts, sentiment-analyzer.ts and route handlers keep working
// ═══════════════════════════════════════════════════════════════

import { createHash } from "crypto";

// ─── CORE TYPES ───────────────────────────────────────────────────

/**
 * ScrapedArticle — the reinforced article payload produced by the new
 * scraping primitives (scrapeGoogleNewsRSS / scrapeDirectRSS).
 */
export interface ScrapedArticle {
  title: string;
  url: string;
  source: string;
  publishedAt: Date | null;
  rawContent: string;
  language: "ar" | "fr" | "en" | string;
  urlHash: string;
}

/**
 * ScrapeOptions — tuning knobs for every scrape primitive in this module.
 */
export interface ScrapeOptions {
  query: string;
  language: "fr" | "ar" | "en";
  country: string; // ISO-2 e.g. MA, FR
  maxArticles: number;
  timeout: number; // ms
  retryCount: number;
}

// ─── USER-AGENT ROTATION POOL (15 strings) ────────────────────────
// Realistic, up-to-date UA strings spanning Chrome / Firefox / Safari /
// Edge on desktop + mobile. Rotating these drastically reduces the
// chance of being blocked by Cloudflare-style bot filters (the main
// failure mode of the previous scraper on TelQuel / Medias24).

export const USER_AGENTS: readonly string[] = [
  // Chrome — desktop
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  // Chrome — mobile
  "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) CriOS/125.0.0.0 Mobile/15E148 Safari/604.1",
  // Firefox — desktop
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14.4; rv:125.0) Gecko/20100101 Firefox/125.0",
  "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0",
  // Firefox — mobile
  "Mozilla/5.0 (Android 14; Mobile; rv:125.0) Gecko/125.0 Firefox/125.0",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/125.0 Mobile/15E148 Safari/605.1.15",
  // Safari — desktop & mobile
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
  // Edge — desktop
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0",
] as const;

/**
 * Randomly select one of the USER_AGENTS. Each call yields a fresh pick
 * so retry attempts naturally rotate UAs.
 */
export function getRandomUserAgent(): string {
  const idx = Math.floor(Math.random() * USER_AGENTS.length);
  return USER_AGENTS[idx];
}

// ─── URL HASHING (stable dedupe key) ──────────────────────────────

/**
 * SHA-256 hash of a URL — used as a stable primary key for articles so
 * the same story seen via Google News + a direct feed collapses to a
 * single row in the DB.
 */
export function hashUrl(url: string): string {
  return createHash("sha256").update(url).digest("hex");
}

// ─── RSS DATE PARSING ─────────────────────────────────────────────

/**
 * Parse the many date formats RSS feeds throw at us.
 * Handles RFC-822 (pubDate), ISO-8601 (dc:date), and falls back to
 * Date.parse for anything else. Returns null on failure so callers can
 * decide whether to keep or discard the article.
 */
export function parseRSSDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();

  // RFC-822 with optional named day: "Sat, 20 Jul 2024 13:45:00 GMT"
  const rfc822Match = trimmed.match(
    /^(?:[A-Za-z]{3},\s*)?(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s*(?:([+-]\d{4})|([A-Z]{3}))?$/,
  );
  if (rfc822Match) {
    const iso = `${rfc822Match[3]}-${monthNum(rfc822Match[2])}-${pad(
      rfc822Match[1],
    )}T${pad(rfc822Match[4])}:${rfc822Match[5]}:${rfc822Match[6]}${
      rfc822Match[7] ? rfc822Match[7].slice(0, 3) + ":" + rfc822Match[7].slice(3) : "Z"
    }`;
    const d = new Date(iso);
    if (!isNaN(d.getTime())) return d;
  }

  // Try generic Date.parse as a last resort (handles ISO-8601 & most edge cases)
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) return d;

  return null;
}

function monthNum(name: string): string {
  const months: Record<string, string> = {
    jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
    jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
  };
  return months[name.toLowerCase().slice(0, 3)] || "01";
}

function pad(n: string | number): string {
  return String(n).padStart(2, "0");
}

// ─── HTML / ENTITY CLEANING ───────────────────────────────────────

/**
 * Strip HTML to plain text:
 *  • Unwrap CDATA sections
 *  • Decode the common XML / HTML entities
 *  • Drop all tags
 *  • Collapse whitespace
 */
export function stripHtml(html: string): string {
  if (!html) return "";

  let out = html;

  // Unwrap CDATA
  out = out.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, (_m, c) => c);

  // Decode named / numeric entities (covers everything RSS feeds throw at us)
  out = out
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&laquo;/g, "«")
    .replace(/&raquo;/g, "»")
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&rdquo;/g, "”")
    .replace(/&ldquo;/g, "“")
    .replace(/&hellip;/g, "…")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&#(\d+);/g, (_m, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, code) => String.fromCharCode(parseInt(code, 16)));

  // Drop all tags
  out = out.replace(/<[^>]+>/g, " ");

  // Collapse whitespace
  out = out.replace(/\s+/g, " ").trim();

  return out;
}

// ─── LANGUAGE DETECTION (heuristic) ───────────────────────────────

/**
 * Cheap heuristic language detection:
 *  • Arabic letters (U+0600–U+06FF) > 15 % → "ar"
 *  • French accented chars (àâçéèêëîïôûùüœ) > 2 % → "fr"
 *  • Otherwise → "en"
 * Good enough for routing articles to the right GLM-4 prompt.
 */
export function detectLanguage(text: string): "ar" | "fr" | "en" {
  if (!text) return "en";
  const sample = text.slice(0, 2000);
  const total = sample.length || 1;

  const arabicMatches = sample.match(/[\u0600-\u06FF]/g);
  const arabicRatio = (arabicMatches?.length || 0) / total;
  if (arabicRatio > 0.15) return "ar";

  const frenchMatches = sample.match(/[àâçéèêëîïôûùüœæ]/gi);
  const frenchRatio = (frenchMatches?.length || 0) / total;
  if (frenchRatio > 0.02) return "fr";

  return "en";
}

// ─── XML PARSING ──────────────────────────────────────────────────

/**
 * Parse an RSS XML string into ScrapedArticle[].
 *
 * Uses regex (not a DOM parser) because:
 *  • RSS feeds in the MA / African media landscape are notoriously malformed
 *  • We only need <item> children (title, link, pubDate, source, description)
 *  • Regex survives broken entity declarations that crash XML parsers
 *
 * @param xml raw RSS XML
 * @param maxArticles hard cap on returned items
 */
export function parseRSSXML(xml: string, maxArticles: number): ScrapedArticle[] {
  const articles: ScrapedArticle[] = [];
  if (!xml) return articles;

  const itemRegex = /<item[\s\S]*?<\/item>/gi;
  const items = xml.match(itemRegex) || [];

  for (const item of items.slice(0, maxArticles)) {
    try {
      const title = stripHtml(extractTag(item, "title") || "");

      // <link> can appear either as <link>URL</link> or as
      // <link href="URL" /> (Atom-style). Handle both.
      let link = extractTag(item, "link");
      if (!link) {
        const linkAttr = item.match(/<link[^>]*href="([^"]+)"/i);
        link = linkAttr ? linkAttr[1] : "";
      }

      // Google News exposes the real publisher in <source url="…">Name</source>
      let source = "Google News";
      const sourceTag = item.match(/<source[^>]*>([^<]+)<\/source>/i);
      if (sourceTag) {
        source = sourceTag[1].trim();
      } else {
        // Fallback: Google News titles look like "Headline - Publisher"
        const titleParts = title.split(" - ");
        if (titleParts.length >= 2) {
          source = titleParts[titleParts.length - 1].trim();
        }
      }

      const description = stripHtml(
        extractCDATA(item, "description") || extractTag(item, "description") || "",
      );
      const pubDateRaw =
        extractTag(item, "pubDate") ||
        extractTag(item, "published") ||
        extractTag(item, "dc:date") ||
        "";
      const publishedAt = pubDateRaw ? parseRSSDate(pubDateRaw) : null;

      if (!title || !link) continue;

      // Clean Google News redirect URLs ("https://news.google.com/rss/articles/…")
      // back to the underlying publisher URL when possible.
      const cleanUrl = normalizeGoogleNewsUrl(link);

      articles.push({
        title,
        url: cleanUrl,
        source,
        publishedAt,
        rawContent: description,
        language: detectLanguage(`${title} ${description}`),
        urlHash: hashUrl(cleanUrl),
      });
    } catch {
      // Malformed <item> — skip, never crash the whole batch
      continue;
    }
  }

  return articles;
}

/** Extract the inner text of <tag>…</tag> (first match, case-insensitive). */
function extractTag(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

/** Extract CDATA-wrapped content of <tag><![CDATA[…]]></tag>. */
function extractCDATA(xml: string, tag: string): string | null {
  const regex = new RegExp(
    `<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`,
    "i",
  );
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

/** Best-effort decode of Google News article URLs. */
function normalizeGoogleNewsUrl(url: string): string {
  // Google News links look like:
  //   https://news.google.com/rss/articles/CBM…?oc=5
  // We can't decode them client-side, but we keep them as-is — the URL
  // hash is still stable and downstream consumers can follow the redirect.
  return url.trim();
}

// ─── HTTP FETCH PRIMITIVE (retry + UA rotation + timeout) ─────────

interface FetchResult {
  ok: boolean;
  status: number;
  body: string;
}

/**
 * Resilient HTTP GET with:
 *  • random User-Agent per attempt
 *  • AbortController timeout (default 30 s)
 *  • exponential backoff across `retryCount` attempts
 *  • 403 special-cased: immediately rotate UA on the next attempt
 */
async function resilientFetch(
  url: string,
  opts: { timeout?: number; retryCount?: number; accept?: string } = {},
): Promise<FetchResult> {
  const timeout = opts.timeout ?? 30_000;
  const retryCount = opts.retryCount ?? 3;
  const accept =
    opts.accept ?? "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";

  let lastStatus = 0;
  let lastBody = "";

  for (let attempt = 0; attempt < retryCount; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": getRandomUserAgent(),
          Accept: accept,
          "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8,ar;q=0.7",
          "Cache-Control": "no-cache",
        },
        signal: controller.signal,
        // Next.js fetch extension — opt out of caching for live scraping
        // @ts-ignore — Next.js fetch supports this
        cache: "no-store",
        redirect: "follow",
      });

      clearTimeout(timer);
      lastStatus = response.status;

      if (response.ok) {
        lastBody = await response.text();
        return { ok: true, status: response.status, body: lastBody };
      }

      // 403 / 429 → rotate UA immediately and back off before retrying
      if (response.status === 403 || response.status === 429) {
        console.warn(
          `[scraper-v3] HTTP ${response.status} on attempt ${attempt + 1}/${retryCount} — rotating UA, backing off`,
        );
      } else {
        // 4xx other than 403/429: probably permanent, give up early
        if (response.status >= 400 && response.status < 500) {
          return { ok: false, status: response.status, body: "" };
        }
      }
    } catch (err: unknown) {
      clearTimeout(timer);
      const name = (err as { name?: string })?.name;
      if (name === "AbortError") {
        console.warn(`[scraper-v3] timeout on attempt ${attempt + 1}/${retryCount}`);
      } else {
        console.warn(
          `[scraper-v3] fetch error on attempt ${attempt + 1}/${retryCount}:`,
          err,
        );
      }
    }

    // Exponential backoff: 500ms, 1s, 2s, 4s…
    if (attempt < retryCount - 1) {
      const backoff = 500 * Math.pow(2, attempt);
      await sleep(backoff);
    }
  }

  return { ok: false, status: lastStatus, body: lastBody };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── GOOGLE NEWS RSS SCRAPER ──────────────────────────────────────

/**
 * Scrape Google News RSS for a search query.
 *
 * URL format:
 *   https://news.google.com/rss/search?q={query}&hl={lang}&gl={country}&ceid={country}:{lang}
 *
 * @returns ScrapedArticle[] (deduplicated by URL hash)
 */
export async function scrapeGoogleNewsRSS(
  options: Partial<ScrapeOptions> & { query: string },
): Promise<ScrapedArticle[]> {
  const {
    query,
    language = "fr",
    country = "MA",
    maxArticles = 50,
    timeout = 30_000,
    retryCount = 3,
  } = options;

  if (!query) return [];

  const url =
    `https://news.google.com/rss/search?q=${encodeURIComponent(query)}` +
    `&hl=${language}&gl=${country}&ceid=${country}:${language}`;

  console.log(`[scraper-v3] Google News RSS → ${url}`);

  const result = await resilientFetch(url, { timeout, retryCount });
  if (!result.ok) {
    console.error(`[scraper-v3] Google News fetch failed (HTTP ${result.status})`);
    return [];
  }

  const articles = parseRSSXML(result.body, maxArticles);
  console.log(`[scraper-v3] Google News parsed ${articles.length} articles`);

  return dedupeByHash(articles);
}

// ─── DIRECT RSS FEED SCRAPER ──────────────────────────────────────

/**
 * Scrape a direct RSS feed (TelQuel, Medias24, Bank Al-Maghrib, …).
 *
 * Differences vs. Google News:
 *  • No <source> tag — publisher is the feed itself
 *  • 403 is common (TelQuel Cloudflare rule) — we retry with a fresh UA
 *  • Articles are filtered to those that mention `companyName`
 *  • Optional `rateLimitMs` is respected before returning
 *
 * @param feedUrl      RSS endpoint
 * @param companyName  filter articles by company mention (case-insensitive,
 *                     matches the company name OR any of its aliases via
 *                     matchCompanyInText in sources-config.ts — but to keep
 *                     this module dependency-free we accept a simple string)
 * @param options      optional ScrapeOptions overrides
 */
export async function scrapeDirectRSS(
  feedUrl: string,
  companyName: string,
  options: Partial<ScrapeOptions> & { rateLimitMs?: number } = {},
): Promise<ScrapedArticle[]> {
  const {
    maxArticles = 50,
    timeout = 30_000,
    retryCount = 3,
    rateLimitMs = 0,
  } = options;

  if (!feedUrl) return [];

  console.log(`[scraper-v3] Direct RSS → ${feedUrl}`);

  const result = await resilientFetch(url(feedUrl), {
    timeout,
    retryCount,
    accept: "application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.5",
  });

  // Respect rate-limit even on failure (be polite)
  if (rateLimitMs > 0) await sleep(rateLimitMs);

  if (!result.ok) {
    console.error(
      `[scraper-v3] Direct RSS fetch failed for ${feedUrl} (HTTP ${result.status})`,
    );
    return [];
  }

  let articles = parseRSSXML(result.body, maxArticles);

  // Override the source name — direct feeds don't carry per-item <source>
  articles = articles.map((a) => ({ ...a, source: hostnameOf(feedUrl) }));

  // Filter to articles that mention the company (title + rawContent)
  if (companyName) {
    const needle = companyName.toLowerCase();
    articles = articles.filter((a) => {
      const haystack = `${a.title} ${a.rawContent}`.toLowerCase();
      return haystack.includes(needle);
    });
  }

  console.log(
    `[scraper-v3] ${feedUrl} → ${articles.length} articles mentioning "${companyName}"`,
  );

  return dedupeByHash(articles);
}

function url(u: string): string {
  return u;
}

function hostnameOf(u: string): string {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
}

// ─── FULL ARTICLE CONTENT FETCHER ─────────────────────────────────

/**
 * Fetch the full HTML of an article URL and extract readable text.
 *
 * Sanitization steps:
 *  1. Remove <script>, <style>, <nav>, <footer>, <header>, <aside>,
 *     <noscript> blocks entirely
 *  2. Strip remaining HTML tags
 *  3. Decode HTML / XML entities
 *  4. Collapse whitespace
 *  5. Truncate to 5 000 chars (GLM-4 context window budget)
 *
 * @returns extracted plain text (max 5 000 chars). Returns "" on failure.
 */
export async function fetchArticleContent(
  articleUrl: string,
  options: Partial<ScrapeOptions> = {},
): Promise<string> {
  if (!articleUrl) return "";

  const { timeout = 30_000, retryCount = 2 } = options;

  const result = await resilientFetch(articleUrl, {
    timeout,
    retryCount,
    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  });

  if (!result.ok || !result.body) return "";

  let html = result.body;

  // 1. Drop non-content blocks
  html = html.replace(
    /<(script|style|nav|footer|header|aside|noscript|iframe|svg|form|button)\b[\s\S]*?<\/\1>/gi,
    " ",
  );

  // 2. Convert <br>, <p>, <div> to whitespace before stripping tags so
  //    words from adjacent blocks don't merge.
  html = html.replace(/<br\s*\/?>/gi, " ");
  html = html.replace(/<\/(p|div|h[1-6]|li|tr|td)>/gi, " ");

  // 3. Strip tags + decode entities
  const text = stripHtml(html);

  // 4. Cap at 5 000 chars (GLM-4 budget)
  return text.slice(0, 5000);
}

// ─── DEDUP HELPER ─────────────────────────────────────────────────

/**
 * Deduplicate articles by their URL hash (newest wins on collision).
 */
function dedupeByHash(articles: ScrapedArticle[]): ScrapedArticle[] {
  const seen = new Map<string, ScrapedArticle>();
  for (const a of articles) {
    if (!seen.has(a.urlHash)) seen.set(a.urlHash, a);
  }
  return Array.from(seen.values());
}

// ═══════════════════════════════════════════════════════════════
//  BACKWARD-COMPATIBLE LAYER
//  The functions below preserve the old public API consumed by
//  orchestrator-v2.ts, orchestrator.ts, sentiment-analyzer.ts,
//  risk-intelligence.ts, intelligence-engine.ts and the
//  /api/atelier/scrape + /api/atelier/whatsapp route handlers.
//  They internally delegate to the reinforced v3 primitives.
// ═══════════════════════════════════════════════════════════════

/**
 * Article — legacy article shape (v2) preserved for downstream analyzers.
 * The new ScrapedArticle interface is preferred for new code.
 */
export interface Article {
  id: string;
  sourceId: string;
  sourceName: string;
  title: string;
  url: string;
  summary: string;
  content?: string;
  author?: string;
  publishedAt: string; // ISO string (legacy contract)
  language: string;
  country: string;
  fetchedAt: string;
  sentiment?: "positive" | "neutral" | "negative";
  sentimentScore?: number;
  entities?: string[];
  topics?: string[];
  relevanceScore?: number;
}

/**
 * Convert a reinforced ScrapedArticle into the legacy Article shape.
 */
function toLegacyArticle(s: ScrapedArticle, country: string): Article {
  const sourceId = s.source.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 30);
  return {
    id: `${sourceId}-${s.urlHash.slice(0, 12)}`,
    sourceId,
    sourceName: s.source,
    title: s.title,
    url: s.url,
    summary: s.rawContent.slice(0, 500),
    publishedAt: s.publishedAt ? s.publishedAt.toISOString() : new Date().toISOString(),
    language: s.language,
    country,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * SCRAPE FOR COMPANY (legacy entry point — kept for orchestrator v1/v2
 * and /api/atelier/scrape + /api/atelier/whatsapp).
 *
 * Strategy:
 *  1. Google News RSS with the company name as query (PRIMARY)
 *  2. All direct RSS feeds from RSS_SOURCES in parallel (5-wide batches)
 *  3. Merge, filter by company mention, dedupe by URL
 */
export async function scrapeForCompany(companyName: string): Promise<Article[]> {
  console.log(`[scraper-v3] scrapeForCompany → ${companyName}`);
  const startTime = Date.now();

  // STEP 1: Google News company-specific RSS
  const googleArticles = await scrapeGoogleNewsRSS({
    query: companyName,
    language: "fr",
    country: "MA",
    maxArticles: 50,
  });
  console.log(`[scraper-v3] Google News: ${googleArticles.length} articles`);

  // STEP 2: Direct RSS feeds — pulled lazily so this file does not
  //         hard-depend on sources-config.ts at module load time.
  let directArticles: ScrapedArticle[] = [];
  try {
    const { RSS_SOURCES } = await import("./sources-config");
    const activeFeeds = RSS_SOURCES.filter(
      (s) => s.isActive && s.url.includes("://") && !s.url.includes("news.google.com"),
    );

    const batchSize = 5;
    for (let i = 0; i < activeFeeds.length; i += batchSize) {
      const batch = activeFeeds.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map((src) =>
          scrapeDirectRSS(src.url, companyName, {
            maxArticles: 30,
            rateLimitMs: src.rateLimitMs,
          }),
        ),
      );
      for (const r of results) {
        if (r.status === "fulfilled") directArticles.push(...r.value);
      }
    }
    console.log(`[scraper-v3] Direct RSS: ${directArticles.length} articles`);
  } catch (err) {
    // sources-config.ts might not be present in some stripped-down
    // deployments — Google News alone is still a working fallback.
    console.warn("[scraper-v3] sources-config unavailable, skipping direct feeds:", err);
  }

  // STEP 3: Merge + filter by company mention + dedupe
  const all = [...googleArticles, ...directArticles];
  const needle = companyName.toLowerCase();
  const filtered = all.filter((a) => {
    const hay = `${a.title} ${a.rawContent}`.toLowerCase();
    return hay.includes(needle);
  });
  const unique = dedupeByHash(filtered);

  const elapsed = Date.now() - startTime;
  console.log(
    `[scraper-v3] scrapeForCompany done in ${elapsed}ms — ${unique.length} unique articles for ${companyName}`,
  );

  return unique.map((s) => toLegacyArticle(s, "MA"));
}

/**
 * SCRAPE ALL SOURCES (legacy entry point — kept for orchestrator v1/v2).
 *
 * Pulls Google News Morocco (general "Maroc" query) plus all configured
 * direct feeds, returns a single deduplicated Article[] list.
 */
export async function scrapeAllSources(): Promise<Article[]> {
  console.log("[scraper-v3] scrapeAllSources starting");
  const startTime = Date.now();

  const googleArticles = await scrapeGoogleNewsRSS({
    query: "Maroc",
    language: "fr",
    country: "MA",
    maxArticles: 100,
  });

  let directArticles: ScrapedArticle[] = [];
  try {
    const { RSS_SOURCES } = await import("./sources-config");
    const activeFeeds = RSS_SOURCES.filter(
      (s) => s.isActive && s.url.includes("://") && !s.url.includes("news.google.com"),
    );

    const batchSize = 5;
    for (let i = 0; i < activeFeeds.length; i += batchSize) {
      const batch = activeFeeds.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map((src) =>
          scrapeDirectRSS(src.url, "", {
            maxArticles: 30,
            rateLimitMs: src.rateLimitMs,
          }),
        ),
      );
      for (const r of results) {
        if (r.status === "fulfilled") directArticles.push(...r.value);
      }
    }
  } catch (err) {
    console.warn("[scraper-v3] sources-config unavailable:", err);
  }

  const all = [...googleArticles, ...directArticles];
  const unique = dedupeByHash(all);

  console.log(
    `[scraper-v3] scrapeAllSources done in ${Date.now() - startTime}ms — ${unique.length} unique articles`,
  );
  return unique.map((s) => toLegacyArticle(s, "MA"));
}
