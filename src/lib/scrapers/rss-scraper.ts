// ═══════════════════════════════════════════════════════════════
//  RSS SCRAPER v4 — REAL MOROCCAN MEDIA FEEDS
//
//  Two layers in this module:
//
//  LAYER A — NEW REAL-FEED PIPELINE (Task: real-rss-scrapers)
//  ------------------------------------------------------------
//  • RSSFeed / MOROCCAN_FEEDS  — 10 hand-picked Moroccan media feeds
//    (Hespress, Le360, TelQuel, Medias24, L'Economiste, Aujourdhui,
//    Morocco World News, Yabiladi, LesEco — Arabic / French / English).
//  • scrapeFeed(feed)          — fetches one feed, returns ScrapedArticle[]
//    with description + content + language (Darija NLP) + urlHash.
//  • parseRSS(xml, feed)       — pure XML → ScrapedArticle[] parser.
//    Handles RSS 2.0 <item> AND Atom <entry>. Robust against malformed
//    XML (regex-based extraction, never throws on a single bad item).
//  • URL dedup via SHA-256 urlHash (unique in DB).
//
//  LAYER B — LEGACY v3 ENTRY POINTS (kept for orchestrator-v2.ts,
//  sentiment-analyzer.ts, /api/atelier/scrape, /api/atelier/whatsapp)
//  ------------------------------------------------------------
//  • scrapeForCompany(name)    — Google News RSS + direct feeds → Article[]
//  • scrapeAllSources()        — general "Maroc" Google News + direct feeds
//  • scrapeGoogleNewsRSS / scrapeDirectRSS — reinforced primitives
//  • USER_AGENTS, hashUrl, parseRSSDate, stripHtml, fetchArticleContent…
//
//  The new `ScrapedArticle` interface carries both `description` (the
//  RSS <description> short summary) and `content` (the full article
//  text from <content:encoded> or fetched HTML — may be empty when only
//  the feed is fetched).
// ═══════════════════════════════════════════════════════════════

import { createHash } from "crypto";
import {
  detectLanguage as detectDarijaLanguage,
  type LanguageLabel,
} from "@/lib/harchiq/darija";

// ─── CORE TYPES (NEW SPEC) ────────────────────────────────────────

/**
 * ScrapedArticle — the canonical article payload produced by the new
 * real-feed pipeline.
 */
export interface ScrapedArticle {
  title: string;
  url: string;
  source: string;
  publishedAt: Date | null;
  /** Short summary from the RSS <description> / Atom <summary> tag. */
  description: string;
  /** Full article text — from <content:encoded> or fetched HTML. May be
   *  empty when only the feed was fetched (cron never fetches full body
   *  for speed). */
  content: string;
  /** Language label from the Darija NLP module
   *  (darija | arabic | french | english | mixed). */
  language: string;
  /** SHA-256 of the URL — stable dedupe key (matches DB unique field). */
  urlHash: string;
}

/**
 * RSSFeed — a single Moroccan / African media RSS feed to scrape on
 * schedule.
 *
 * Task: signal-media-monitoring
 *  • `fetchKind` distinguishes direct publisher feeds from Google News
 *    RSS proxies (used for Cloudflare-protected publishers).
 *  • `isActive: false` makes scrapeFeed() skip the feed silently —
 *    used for known-dead sources kept in the registry for history.
 *  • `region` and `notes` power the admin source-health dashboard.
 */
export interface RSSFeed {
  /** Human-readable publisher / feed name. */
  name: string;
  /** RSS or Atom endpoint URL (or Google News RSS URL for proxy feeds). */
  url: string;
  /** Primary feed language. */
  language: "ar" | "fr" | "en";
  /** Editorial category. `regulatory` covers central bank / AMMC / BVC. */
  category: "news" | "business" | "tech" | "finance" | "regulatory";
  /** Geographic region the feed covers. */
  region?: "Morocco" | "Africa" | "France" | "Global";
  /** Whether the URL points directly to the publisher's RSS endpoint
   *  or to a Google News RSS search proxy. Defaults to "direct". */
  fetchKind?: "direct" | "google-news";
  /** When false, scrapeFeed() returns [] immediately — used to keep
   *  dead sources in the registry without wasting fetch budget. */
  isActive?: boolean;
  /** Free-form ops notes (known 403s, anti-bot notes, etc.). */
  notes?: string;
}

// ─── 20 MOROCCAN + AFRICAN MEDIA FEEDS ───────────────────────────
//
//  Task: signal-media-monitoring — verified 2026.
//
//  Two flavours of feeds in this registry:
//
//  DIRECT FEEDS (8) — publisher exposes a working RSS endpoint:
//    TelQuel, Medias24, Aujourd'hui, LesEco, Africa News,
//    Financial Afrik, Infomediaire, Le Site Info.
//
//  GOOGLE NEWS RSS PROXIES (12) — publisher is behind Cloudflare and
//  403s any non-browser UA. We use the Google News RSS aggregator,
//  which:
//    • Already fetched and cached the article
//    • Returns valid RSS XML that the same parser handles
//    • Carries the real publisher in the <source> tag
//  Used for: Hespress, Le360, L'Economiste, MWN, Yabiladi, L'Opinion,
//  Le Desk, MAP, AMMC, BAM, BVC, Jeune Afrique.
//
//  Every URL below was probed from the sandbox with a real browser UA
//  before being added — see scripts/test-rss-feeds.ts for the live
//  health check.

export const MOROCCAN_FEEDS: RSSFeed[] = [
  // ─── DIRECT FEEDS (verified 200 + parseable XML) ───────────────
  {
    name: "TelQuel",
    url: "https://telquel.ma/feed",
    language: "fr",
    category: "news",
    region: "Morocco",
    fetchKind: "direct",
    notes: "Independent weekly — high-volume feed (~100 items).",
  },
  {
    name: "Medias24",
    url: "https://www.medias24.com/feed",
    language: "fr",
    category: "business",
    region: "Morocco",
    fetchKind: "direct",
    notes: "Business / financial news — high signal for listed companies.",
  },
  {
    name: "Aujourdhui Le Maroc",
    url: "https://aujourdhui.ma/feed",
    language: "fr",
    category: "news",
    region: "Morocco",
    fetchKind: "direct",
    notes: "Daily general news.",
  },
  {
    name: "LesEco",
    url: "https://leseco.ma/feed",
    language: "fr",
    category: "business",
    region: "Morocco",
    fetchKind: "direct",
    notes: "Business / markets — ~50 items per fetch.",
  },
  {
    name: "Le Site Info",
    url: "https://www.lesiteinfo.com/feed",
    language: "fr",
    category: "news",
    region: "Morocco",
    fetchKind: "direct",
    notes: "General news — redirects /feed/ → /feed (followed).",
  },
  {
    name: "Infomediaire",
    url: "https://www.infomediaire.net/feed/",
    language: "fr",
    category: "news",
    region: "Morocco",
    fetchKind: "direct",
    notes: "General + business news.",
  },
  {
    name: "Financial Afrik",
    url: "https://www.financialafrik.com/feed/",
    language: "fr",
    category: "finance",
    region: "Africa",
    fetchKind: "direct",
    notes: "Pan-African financial coverage — good for cross-listed groups.",
  },
  {
    name: "Africa News",
    url: "https://www.africanews.com/feed/",
    language: "en",
    category: "news",
    region: "Africa",
    fetchKind: "direct",
    notes: "English-language pan-African coverage (Euronews-backed).",
  },

  // ─── GOOGLE NEWS RSS PROXIES (Cloudflare-protected publishers) ──
  //  URL format: news.google.com/rss/search?q=site:publisher.com
  //  Google News returns valid RSS XML with the real publisher in
  //  <source url="…">Publisher Name</source> — our parser handles it.
  {
    name: "Hespress",
    url: "https://news.google.com/rss/search?q=site:hespress.com&hl=ar&gl=MA&ceid=MA:ar",
    language: "ar",
    category: "news",
    region: "Morocco",
    fetchKind: "google-news",
    notes: "Direct hespress.com/rss returns 403 (Cloudflare). Google News proxy carries the real publisher in <source>.",
  },
  {
    name: "Le360",
    url: "https://news.google.com/rss/search?q=site:le360.ma&hl=fr&gl=MA&ceid=MA:fr",
    language: "fr",
    category: "news",
    region: "Morocco",
    fetchKind: "google-news",
    notes: "Direct fr.le360.ma/rss returns 404. Google News proxy used.",
  },
  {
    name: "L'Economiste",
    url: "https://news.google.com/rss/search?q=site:leconomiste.com&hl=fr&gl=MA&ceid=MA:fr",
    language: "fr",
    category: "business",
    region: "Morocco",
    fetchKind: "google-news",
    notes: "Direct leconomiste.com/rss returns 403 (Cloudflare). Google News proxy used.",
  },
  {
    name: "Morocco World News",
    url: "https://news.google.com/rss/search?q=site:moroccoworldnews.com&hl=en&gl=MA&ceid=MA:en",
    language: "en",
    category: "news",
    region: "Morocco",
    fetchKind: "google-news",
    notes: "Direct MWN /feed returns 403 (Cloudflare). Google News proxy used.",
  },
  {
    name: "Yabiladi",
    url: "https://news.google.com/rss/search?q=site:yabiladi.com&hl=fr&gl=MA&ceid=MA:fr",
    language: "fr",
    category: "news",
    region: "Morocco",
    fetchKind: "google-news",
    notes: "Direct yabiladi.com/rss.xml returns 403. Google News proxy used.",
  },
  {
    name: "L'Opinion",
    url: "https://news.google.com/rss/search?q=site:lopinion.ma&hl=fr&gl=MA&ceid=MA:fr",
    language: "fr",
    category: "news",
    region: "Morocco",
    fetchKind: "google-news",
    notes: "Direct lopinion.ma/feed redirects to /fr/feed which 404s. Google News proxy used.",
  },
  {
    name: "Le Desk",
    url: "https://news.google.com/rss/search?q=site:edesk.ma&hl=fr&gl=MA&ceid=MA:fr",
    language: "fr",
    category: "news",
    region: "Morocco",
    fetchKind: "google-news",
    isActive: false,
    notes: "edesk.ma DNS does not resolve (site defunct). Kept in registry as inactive — scraper skips it.",
  },
  {
    name: "MAP (Maroc Arabe Presse)",
    url: "https://news.google.com/rss/search?q=site:mapnews.ma&hl=fr&gl=MA&ceid=MA:fr",
    language: "fr",
    category: "regulatory",
    region: "Morocco",
    fetchKind: "google-news",
    notes: "Official Moroccan news agency. Direct mapnews.ma returns 403 (Cloudflare). Google News proxy returns limited coverage (few articles indexed).",
  },
  {
    name: "AMMC",
    url: "https://news.google.com/rss/search?q=%22AMMC%22+Maroc&hl=fr&gl=MA&ceid=MA:fr",
    language: "fr",
    category: "regulatory",
    region: "Morocco",
    fetchKind: "google-news",
    notes: "Autorité Marocaine du Marché des Capitaux — capital-markets regulatory filings. Direct ammc.ma times out; using a topical Google News query.",
  },
  {
    name: "Bank Al-Maghrib",
    url: "https://news.google.com/rss/search?q=%22Bank+Al-Maghrib%22&hl=fr&gl=MA&ceid=MA:fr",
    language: "fr",
    category: "regulatory",
    region: "Morocco",
    fetchKind: "google-news",
    notes: "Moroccan central bank. Direct bkam.ma returns 403 (Cloudflare). Topical Google News query used.",
  },
  {
    name: "BVC (Bourse de Casablanca)",
    url: "https://news.google.com/rss/search?q=%22Bourse+de+Casablanca%22&hl=fr&gl=MA&ceid=MA:fr",
    language: "fr",
    category: "regulatory",
    region: "Morocco",
    fetchKind: "google-news",
    notes: "Casablanca Stock Exchange. bvc.ma does not expose RSS. Topical Google News query used.",
  },
  {
    name: "Jeune Afrique",
    url: "https://news.google.com/rss/search?q=site:jeuneafrique.com&hl=fr&gl=FR&ceid=FR:fr",
    language: "fr",
    category: "news",
    region: "Africa",
    fetchKind: "google-news",
    notes: "Pan-African weekly. Direct jeuneafrique.com/feed returns 403. Google News proxy used (gl=FR — main audience).",
  },
];

// ─── POLITE BOT USER-AGENT ───────────────────────────────────────
//
//  Identifies us to publishers so they can throttle / contact us.
//  The cron job is the only caller that uses this UA — the legacy
//  v3 layer keeps its rotating UA pool for adversarial feeds.

const HARCH_BOT_UA =
  "HarchAtelierBot/1.0 (monitoring; contact: amine@harchcorp.com)";

// ─── URL HASHING (stable dedupe key) ──────────────────────────────

/**
 * SHA-256 hash of a URL — used as a stable primary key for articles so
 * the same story seen via Google News + a direct feed collapses to a
 * single row in the DB. Matches the @unique urlHash column on Article.
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
 *  • Decode the common XML / HTML entities (incl. Arabic punctuation)
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

// ─── LANGUAGE DETECTION ───────────────────────────────────────────

/**
 * Cheap heuristic language detection (legacy — used by the v3 layer).
 *  • Arabic letters (U+0600–U+06FF) > 15 % → "ar"
 *  • French accented chars (àâçéèêëîïôûùüœ) > 2 % → "fr"
 *  • Otherwise → "en"
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

// ─── ENHANCED SENTIMENT ANALYSIS (Task: dataminr-geo-multimodal) ──
//
//  The legacy Darija sentiment analyzer was a small lexicon (60 words
//  per language). We now ship a much larger multilingual lexicon
//  (FR 432 / AR 218 / EN 606 words) with proper negation handling
//  ("pas bon" → negative) and intensity modifiers ("très bon" → 1.5×
//  positive). The new analyzer lives in
//  `src/lib/harchiq/sentiment-analyzer.ts`.
//
//  This wrapper exposes a per-article entry point that the run-scrape
//  pipeline calls to populate `Article.sentimentScore` /
//  `Article.sentimentLabel` with the enhanced read.

import {
  analyzeArticleSentiment as analyzeArticleSentimentEnhanced,
  type SentimentAnalysis,
} from "@/lib/harchiq/sentiment-analyzer";

/**
 * Analyse a scraped article's sentiment using the enhanced
 * multilingual lexicon (FR/AR/EN).
 *
 * Operates on the combined title + description (and content when
 * present). Returns:
 *   • score      ∈ [-1, +1]  → stored in `Article.sentimentScore`
 *   • label      ∈ { positive, neutral, negative }
 *                              → stored in `Article.sentimentLabel`
 *   • confidence ∈ [0, 1]
 *   • language   ∈ { fr, ar, en }
 *   • keyPhrases — top 5 n-grams that drove the score
 *
 * Cost: ~1ms per KB of text. No I/O, no LLM round-trip.
 */
export function analyzeArticleSentiment(article: ScrapedArticle): SentimentAnalysis {
  return analyzeArticleSentimentEnhanced(
    article.title || "",
    article.description || article.content || "",
  );
}

/**
 * Detect language via the Darija NLP module — returns the rich label
 * (darija | arabic | french | english | mixed) plus confidence and
 * markers. Falls back to the cheap heuristic if the module throws.
 */
export function detectLanguageRich(text: string): {
  language: LanguageLabel;
  confidence: number;
  markers: string[];
} {
  try {
    const r = detectDarijaLanguage(text || "");
    return {
      language: r.language,
      confidence: r.confidence,
      markers: r.markers,
    };
  } catch {
    const simple = detectLanguage(text || "");
    const map: Record<string, LanguageLabel> = {
      ar: "arabic",
      fr: "french",
      en: "english",
    };
    return { language: map[simple] || "mixed", confidence: 0.4, markers: [] };
  }
}

// ─── XML HELPERS (shared by the new + legacy parsers) ─────────────

/** Extract the inner text of <tag>…</tag> (first match, case-insensitive).
 *  Handles namespaced tags (dc:date, content:encoded) by escaping the
 *  colon in the regex. */
function extractTag(xml: string, tag: string): string | null {
  const safe = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`<${safe}[^>]*>([\\s\\S]*?)<\\/${safe}>`, "i");
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

/** Extract CDATA-wrapped content of <tag><![CDATA[…]]></tag>. */
function extractCDATA(xml: string, tag: string): string | null {
  const safe = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(
    `<${safe}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${safe}>`,
    "i",
  );
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

// ═══════════════════════════════════════════════════════════════
//  LAYER A — NEW REAL-FEED PIPELINE
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch a single RSS / Atom feed and return parsed articles.
 *
 *  • 15-second timeout (AbortSignal.timeout) so slow feeds don't hang
 *    the cron.
 *  • Polite HarchAtelierBot User-Agent.
 *  • Never throws — returns [] on any error (fetch, parse, network).
 *  • Uses the Darija NLP module to detect language per article.
 */
export async function scrapeFeed(feed: RSSFeed): Promise<ScrapedArticle[]> {
  // Skip inactive feeds silently — they're kept in the registry for
  // history but shouldn't waste fetch budget (Task: signal-media-monitoring).
  if (feed.isActive === false) {
    return [];
  }
  try {
    const res = await fetch(feed.url, {
      headers: {
        "User-Agent": HARCH_BOT_UA,
        Accept: "application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.5",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8,ar;q=0.7",
        "Cache-Control": "no-cache",
      },
      // Next.js fetch extension — opt out of caching for live scraping
      // @ts-ignore — Next.js fetch supports this
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      console.warn(
        `[rss-scraper] scrapeFeed(${feed.name}) → HTTP ${res.status} ${res.statusText}`,
      );
      return [];
    }
    const xml = await res.text();
    if (!xml || xml.length < 32) {
      console.warn(`[rss-scraper] scrapeFeed(${feed.name}) → empty body`);
      return [];
    }
    return parseRSS(xml, feed);
  } catch (err: unknown) {
    const name = (err as { name?: string })?.name;
    if (name === "TimeoutError" || name === "AbortError") {
      console.warn(`[rss-scraper] scrapeFeed(${feed.name}) → timeout (15s)`);
    } else {
      console.warn(
        `[rss-scraper] scrapeFeed(${feed.name}) → error:`,
        err instanceof Error ? err.message : String(err),
      );
    }
    return [];
  }
}

/**
 * Pure XML → ScrapedArticle[] parser. Handles BOTH formats:
 *
 *  • RSS 2.0  → <item><title><link><pubDate><description><content:encoded></item>
 *  • Atom 1.0 → <entry><title><link href="…"><updated><summary><content></entry>
 *
 * Robustness:
 *  • Item-level try/catch — one malformed <item> never crashes the batch.
 *  • CDATA sections unwrapped.
 *  • HTML entities decoded (Arabic punctuation included).
 *  • Empty titles or links → item skipped.
 *  • Date falls back to <dc:date>, <published>, <updated>, then null.
 *  • Content pulled from <content:encoded> (RSS) or <content> (Atom).
 *  • Language detected per-article via the Darija NLP module.
 *
 * @param xml  raw RSS / Atom XML
 * @param feed the feed definition (source name, primary language)
 */
export function parseRSS(xml: string, feed: RSSFeed): ScrapedArticle[] {
  const articles: ScrapedArticle[] = [];
  if (!xml) return articles;

  // Detect format: Atom feeds have <entry> tags; RSS 2.0 feeds have <item>.
  const isAtom = /<entry[\s>]/i.test(xml) && !/<item[\s>]/i.test(xml);

  const itemRegex = isAtom
    ? /<entry[\s\S]*?<\/entry>/gi
    : /<item[\s\S]*?<\/item>/gi;
  const items = xml.match(itemRegex) || [];

  for (const item of items) {
    try {
      // ── title ──
      const rawTitle =
        extractCDATA(item, "title") || extractTag(item, "title") || "";
      const title = stripHtml(rawTitle);
      if (!title) continue;

      // ── link ──
      //  RSS:  <link>https://…</link>
      //  Atom: <link href="https://…" />  (prefer rel="alternate", fall back to first)
      let link = extractTag(item, "link");
      if (!link) {
        // Try Atom <link rel="alternate" href="…" />
        const altLink = item.match(
          /<link[^>]*\brel=["']alternate["'][^>]*\bhref=["']([^"']+)["']/i,
        );
        if (altLink) {
          link = altLink[1];
        } else {
          // Fallback: any <link href="…" />
          const linkAttr = item.match(/<link[^>]*\bhref=["']([^"']+)["']/i);
          link = linkAttr ? linkAttr[1] : "";
        }
      }
      if (!link) continue;
      link = link.trim();

      // ── description / summary ──
      //  RSS:  <description>
      //  Atom: <summary>
      const rawDesc =
        extractCDATA(item, "description") ||
        extractTag(item, "description") ||
        extractCDATA(item, "summary") ||
        extractTag(item, "summary") ||
        "";
      const description = stripHtml(rawDesc);

      // ── content (full body) ──
      //  RSS:  <content:encoded>   (namespaced — common in WordPress feeds)
      //  Atom: <content>
      const rawContent =
        extractCDATA(item, "content:encoded") ||
        extractTag(item, "content:encoded") ||
        extractCDATA(item, "content") ||
        extractTag(item, "content") ||
        "";
      const content = stripHtml(rawContent);

      // ── pubDate ──
      //  RSS:  <pubDate> | <dc:date>
      //  Atom: <published> | <updated>
      const pubDateRaw =
        extractTag(item, "pubDate") ||
        extractTag(item, "dc:date") ||
        extractTag(item, "published") ||
        extractTag(item, "updated") ||
        "";
      const publishedAt = pubDateRaw ? parseRSSDate(pubDateRaw) : null;

      // ── language (Darija NLP) ──
      // Run on title + description (cheap, no need for the full body —
      // the cron job calls this on every article, so keep it fast).
      const detected = detectLanguageRich(`${title} ${description}`);
      const language = detected.language;

      // ── urlHash ──
      const cleanUrl = link;
      const urlHash = hashUrl(cleanUrl);

      articles.push({
        title,
        url: cleanUrl,
        source: feed.name,
        publishedAt,
        description,
        content,
        language,
        urlHash,
      });
    } catch {
      // Malformed <item> — skip, never crash the whole batch
      continue;
    }
  }

  return dedupeByHash(articles);
}

// ─── LEGACY v3 PARSER (kept for scrapeGoogleNewsRSS / scrapeDirectRSS) ─

/**
 * Parse an RSS XML string into ScrapedArticle[] (legacy RSS 2.0 only).
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

      const cleanUrl = normalizeGoogleNewsUrl(link);

      articles.push({
        title,
        url: cleanUrl,
        source,
        publishedAt,
        description,
        content: description,
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

/** Best-effort decode of Google News article URLs. */
function normalizeGoogleNewsUrl(url: string): string {
  // Google News links look like:
  //   https://news.google.com/rss/articles/CBM…?oc=5
  // We can't decode them client-side, but we keep them as-is — the URL
  // hash is still stable and downstream consumers can follow the redirect.
  return url.trim();
}

// ─── HTTP FETCH PRIMITIVE (retry + UA rotation + timeout) ─────────

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

  const result = await resilientFetch(feedUrl, {
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

  // Filter to articles that mention the company (title + description)
  if (companyName) {
    const needle = companyName.toLowerCase();
    articles = articles.filter((a) => {
      const haystack = `${a.title} ${a.description}`.toLowerCase();
      return haystack.includes(needle);
    });
  }

  console.log(
    `[scraper-v3] ${feedUrl} → ${articles.length} articles mentioning "${companyName}"`,
  );

  return dedupeByHash(articles);
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
//  LAYER B — LEGACY ENTRY POINTS
//  The functions below preserve the old public API consumed by
//  orchestrator-v2.ts, orchestrator.ts, sentiment-analyzer.ts,
//  risk-intelligence.ts, intelligence-engine.ts and the
//  /api/atelier/scrape + /api/atelier/whatsapp route handlers.
//  They internally delegate to the reinforced v3 primitives.
// ═══════════════════════════════════════════════════════════════

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
    summary: s.description.slice(0, 500),
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
    const hay = `${a.title} ${a.description}`.toLowerCase();
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
