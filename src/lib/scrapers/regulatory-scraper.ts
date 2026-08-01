// ═══════════════════════════════════════════════════════════════
//  REGULATORY SCRAPER — AMMC + BAM + BVC
//
//  Three Moroccan regulatory sources monitored daily for the Investor
//  Desk "Regulatory" feed:
//
//    AMMC  (Autorité Marocaine du Marché des Capitaux)
//      https://www.ammc.ma  — sanctions, enforcement actions, market
//      alerts, circulars. Type: "regulatory" (navy).
//
//    BAM   (Bank Al-Maghrib — Moroccan central bank)
//      https://www.bkam.ma  — monetary policy, banking regulations,
//      fintech licenses. Type: "financial" (slate).
//
//    BVC   (Bourse des Valeurs de Casablanca)
//      https://www.bvc.ma    — listing changes, trading halts,
//      corporate actions. Type: "market" (emerald).
//
//  Strategy
//  --------
//  1. Try a real publisher RSS endpoint first (some AMMC / BAM pages
//     expose one). Verified 2026.
//  2. If the direct RSS endpoint is dead / 403 / Cloudflare-walled,
//     fall back to a Google News RSS search proxy scoped to the
//     regulator. The proxy returns valid RSS XML with the real
//     publisher in the <source> tag — the existing parseRSS() helper
//     in rss-scraper.ts handles it natively.
//  3. As a final fallback, attempt a tiny HTML scrape of the news /
//     publications listing page (regex-based — never depends on a
//     full DOM parser that isn't shipped with the project).
//
//  Every endpoint has a 12-second timeout (AbortSignal.timeout) and
//  the polite HarchAtelierBot User-Agent. The function never throws —
//  each source is wrapped in try/catch and returned with an `error`
//  field so the cron route can write a clean ScraperLog row.
//
//  Task ID: signal-regulatory-feed
// ═══════════════════════════════════════════════════════════════

import { createHash } from "crypto";
import {
  parseRSS,
  stripHtml,
  hashUrl,
  type ScrapedArticle,
} from "@/lib/scrapers/rss-scraper";
import { logInfo, logWarn } from "@/lib/logger";

// ─── TYPES ────────────────────────────────────────────────────────

/**
 * RegulatorySource — one of the three regulators we monitor.
 *   "ammc" — Autorité Marocaine du Marché des Capitaux
 *   "bam"  — Bank Al-Maghrib
 *   "bvc"  — Bourse des Valeurs de Casablanca
 */
export type RegulatorySource = "ammc" | "bam" | "bvc";

/**
 * RegulatoryType — editorial colour band the UI uses to badge each
 * item. Maps 1:1 to the Article.sourceType column for regulatory rows:
 *   "regulatory"          → AMMC sanctions / circulars / alerts
 *   "financial_regulatory"→ BAM monetary policy / banking rules
 *                           (stored as sourceType="financial" in DB;
 *                            the UI type stays "financial_regulatory")
 *   "market"              → BVC listing / trading / corporate actions
 */
export type RegulatoryType =
  | "regulatory"
  | "financial_regulatory"
  | "market";

/**
 * RegulatoryItem — the canonical payload the API returns and the UI
 * renders. Mirrors a subset of the Article row plus the explicit
 * `source` and `type` discriminators.
 */
export interface RegulatoryItem {
  id: string;
  title: string;
  source: RegulatorySource;
  sourceLabel: string;
  url: string;
  publishedAt: string | null;
  type: RegulatoryType;
  summary: string;
  language: string;
}

/**
 * RegulatoryFeedConfig — describes how to scrape one regulator.
 *
 *  • `rssCandidates` — ordered list of real publisher RSS endpoints
 *    to try before the Google News proxy. The first one that returns
 *    valid XML with ≥1 <item> wins.
 *  • `googleNewsQuery` — the Google News RSS search URL used as a
 *    fallback when every direct candidate fails. The query is scoped
 *    to the regulator's domain (site:ammc.ma) when the regulator has
 *    one; otherwise it's a topical query ("AMMC" Maroc).
 *  • `htmlCandidates` — news / publications listing pages to scrape
 *    as a last resort. Regex-based extraction; we look for links
 *    whose anchor text + href look like press releases.
 *  • `maxItems` — hard cap per source per run (default 25).
 */
interface RegulatoryFeedConfig {
  id: RegulatorySource;
  label: string;
  publisherName: string;
  type: RegulatoryType;
  /** Maps to Article.sourceType (DB column). */
  dbSourceType: "regulatory" | "financial" | "market";
  language: "fr" | "ar" | "en";
  rssCandidates: string[];
  googleNewsQuery: string;
  htmlCandidates: string[];
  /** Optional: only keep items whose title matches one of these
   *  keywords (case-insensitive). Used to filter Google News noise. */
  titleKeywords?: string[];
  maxItems: number;
}

export interface RegulatoryScrapeResult {
  source: RegulatorySource;
  label: string;
  items: RegulatoryItem[];
  durationMs: number;
  articlesFound: number;
  error?: string;
  /** Which strategy actually produced the items (for ScraperLog). */
  strategy: "rss" | "google-news" | "html" | "none";
}

export interface RegulatoryScrapeSummary {
  sourcesProcessed: number;
  itemsFound: number;
  errors: { source: string; message: string }[];
  startedAt: string;
  completedAt: string;
  durationMs: number;
  perSource: RegulatoryScrapeResult[];
}

// ─── 3 REGULATORY FEEDS ──────────────────────────────────────────

/**
 * REGULATORY_FEEDS — the three regulators monitored by the cron.
 *
 * Verified 2026 from the sandbox:
 *   • ammc.ma  — direct RSS endpoint dead (Cloudflare 403). Google
 *                News site:ammc.ma proxy returns recent publications.
 *   • bkam.ma  — direct /rss returns Cloudflare challenge. Google
 *                News site:bkam.ma proxy covers press releases.
 *   • bvc.ma   — no RSS exposed. Google News site:bvc.ma proxy used.
 *
 * The direct `rssCandidates` entries are still probed first so we
 * pick them up automatically the day a regulator publishes a real
 * feed — no code change required.
 */
export const REGULATORY_FEEDS: RegulatoryFeedConfig[] = [
  {
    id: "ammc",
    label: "AMMC",
    publisherName: "Autorité Marocaine du Marché des Capitaux",
    type: "regulatory",
    dbSourceType: "regulatory",
    language: "fr",
    rssCandidates: [
      "https://www.ammc.ma/rss",
      "https://www.ammc.ma/fr/rss",
      "https://www.ammc.ma/en/rss.xml",
    ],
    googleNewsQuery:
      "https://news.google.com/rss/search?q=site:ammc.ma+OR+%22AMMC%22+Maroc&hl=fr&gl=MA&ceid=MA:fr",
    htmlCandidates: [
      "https://www.ammc.ma/fr/actualites",
      "https://www.ammc.ma/fr/publications",
    ],
    titleKeywords: [
      "ammc",
      "sanction",
      "circulaire",
      "avis",
      "communiqué",
      "decision",
      "décision",
      "marché",
      "capitaux",
      "enforcement",
    ],
    maxItems: 25,
  },
  {
    id: "bam",
    label: "BAM",
    publisherName: "Bank Al-Maghrib",
    type: "financial_regulatory",
    dbSourceType: "financial",
    language: "fr",
    rssCandidates: [
      "https://www.bkam.ma/rss",
      "https://www.bkam.fr/rss.xml",
      "https://www.bkam.ma/fr/rss.xml",
    ],
    googleNewsQuery:
      "https://news.google.com/rss/search?q=site:bkam.ma+OR+%22Bank+Al-Maghrib%22&hl=fr&gl=MA&ceid=MA:fr",
    htmlCandidates: [
      "https://www.bkam.ma/fr/Pages/communiques.aspx",
      "https://www.bkam.ma/fr/actualites",
    ],
    titleKeywords: [
      "bank al-maghrib",
      "bam",
      "monétaire",
      "circulaire",
      "communiqué",
      "banking",
      "fintech",
      "regulation",
      "réglementation",
      "dirham",
      "taux",
    ],
    maxItems: 25,
  },
  {
    id: "bvc",
    label: "BVC",
    publisherName: "Bourse des Valeurs de Casablanca",
    type: "market",
    dbSourceType: "market",
    language: "fr",
    rssCandidates: [
      "https://www.bvc.ma/rss",
      "https://www.bvc.ma/fr/rss.xml",
    ],
    googleNewsQuery:
      "https://news.google.com/rss/search?q=site:bvc.ma+OR+%22Bourse+de+Casablanca%22&hl=fr&gl=MA&ceid=MA:fr",
    htmlCandidates: [
      "https://www.bvc.ma/fr/actualites",
      "https://www.bvc.ma/fr/communiques",
    ],
    titleKeywords: [
      "bvc",
      "bourse",
      "casablanca",
      "introduction",
      "cotation",
      "suspension",
      "levée",
      "corporate action",
      "opération sur titre",
      "listing",
      "trading halt",
    ],
    maxItems: 25,
  },
];

// ─── HTTP FETCH (polite bot, 12s timeout) ────────────────────────

const HARCH_BOT_UA =
  "HarchAtelierBot/1.0 (monitoring; contact: amine@harchcorp.com)";

async function fetchText(url: string, timeoutMs = 12_000): Promise<{ ok: boolean; status: number; body: string; error?: string }> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": HARCH_BOT_UA,
        Accept:
          "application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.8, text/html;q=0.7, */*;q=0.5",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8,ar;q=0.7",
        "Cache-Control": "no-cache",
      },
      // @ts-ignore — Next.js fetch supports `cache: "no-store"`.
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) {
      return { ok: false, status: res.status, body: "", error: `HTTP ${res.status} ${res.statusText}` };
    }
    const body = await res.text();
    if (!body || body.length < 32) {
      return { ok: false, status: res.status, body: "", error: "Empty body" };
    }
    return { ok: true, status: res.status, body };
  } catch (err: unknown) {
    const name = (err as { name?: string })?.name;
    if (name === "TimeoutError" || name === "AbortError") {
      return { ok: false, status: 0, body: "", error: `Timeout (${timeoutMs}ms)` };
    }
    return {
      ok: false,
      status: 0,
      body: "",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ─── RSS STRATEGY ────────────────────────────────────────────────

/**
 * Try each `rssCandidates` URL in order. The first one that returns
 * valid RSS / Atom XML with ≥1 item wins. Returns the parsed
 * ScrapedArticle[] or null if every candidate failed.
 *
 * Reuses the production `parseRSS()` helper from rss-scraper.ts so
 * the parsing behaviour (RSS 2.0 + Atom, CDATA, entity decoding,
 * date fallbacks, language detection) is identical to the main
 * media scrape pipeline.
 */
async function tryRssCandidates(
  cfg: RegulatoryFeedConfig,
): Promise<{ articles: ScrapedArticle[]; usedUrl: string } | null> {
  for (const url of cfg.rssCandidates) {
    const r = await fetchText(url);
    if (!r.ok || !r.body) continue;
    // Cheap XML sniff — must look like RSS / Atom, not an HTML 403 page.
    const sniff = r.body.slice(0, 1024).toLowerCase();
    if (!sniff.includes("<rss") && !sniff.includes("<feed") && !sniff.includes("<?xml")) {
      continue;
    }
    const articles = parseRSS(r.body, {
      name: cfg.publisherName,
      url,
      language: cfg.language,
      category: "regulatory",
      region: "Morocco",
      fetchKind: "direct",
    });
    if (articles.length > 0) {
      logInfo("regulatory-scraper", `RSS hit for ${cfg.id}: ${url} → ${articles.length} items`);
      return { articles, usedUrl: url };
    }
  }
  return null;
}

/**
 * Fall back to the Google News RSS proxy. Returns parsed articles or
 * null on failure. The Google News RSS returns valid RSS 2.0 XML so
 * we reuse `parseRSS()` unchanged.
 */
async function tryGoogleNews(
  cfg: RegulatoryFeedConfig,
): Promise<{ articles: ScrapedArticle[]; usedUrl: string } | null> {
  const r = await fetchText(cfg.googleNewsQuery);
  if (!r.ok || !r.body) return null;
  const articles = parseRSS(r.body, {
    name: cfg.publisherName,
    url: cfg.googleNewsQuery,
    language: cfg.language,
    category: "regulatory",
    region: "Morocco",
    fetchKind: "google-news",
  });
  if (articles.length > 0) {
    logInfo("regulatory-scraper", `Google News hit for ${cfg.id}: ${articles.length} items`);
    return { articles, usedUrl: cfg.googleNewsQuery };
  }
  return null;
}

// ─── HTML STRATEGY (last-resort regex scrape) ────────────────────

/**
 * Tiny HTML scrape of a publications / news listing page. We don't
 * ship a full DOM parser (cheerio / linkedom) so this uses two
 * regex passes:
 *
 *   1. Find every <a href="…" …>…</a> anchor.
 *   2. Keep only the ones whose href looks like a press release URL
 *      (contains the regulator domain OR resolves relative) AND whose
 *      text is ≥4 chars (filters out nav links).
 *
 * Date extraction is best-effort: we look for a nearby
 * `DD/MM/YYYY` or `DD MMM YYYY` pattern in the 200 chars after the
 * anchor. Falls back to null when nothing matches.
 */
async function tryHtmlCandidates(
  cfg: RegulatoryFeedConfig,
): Promise<{ articles: ScrapedArticle[]; usedUrl: string } | null> {
  for (const url of cfg.htmlCandidates) {
    const r = await fetchText(url);
    if (!r.ok || !r.body) continue;
    const html = r.body;
    const baseDomain = new URL(url).hostname.replace(/^www\./, "");

    // Anchor extraction. The `href` may be:
    //   • absolute  — https://www.ammc.ma/fr/avis/123
    //   • relative  — /fr/avis/123
    const anchorRe = /<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    const items: ScrapedArticle[] = [];
    let m: RegExpExecArray | null;

    while ((m = anchorRe.exec(html)) !== null && items.length < cfg.maxItems) {
      const href = m[1];
      const rawText = stripHtml(m[2]);
      const text = rawText.replace(/\s+/g, " ").trim();
      if (text.length < 4) continue;

      // Resolve relative URLs against the page origin.
      let absoluteUrl: string;
      try {
        absoluteUrl = href.startsWith("http")
          ? href
          : new URL(href, url).toString();
      } catch {
        continue;
      }

      // Only keep links on the same domain as the listing page
      // (filters out social links, footer partner links, etc.).
      let linkHost = "";
      try {
        linkHost = new URL(absoluteUrl).hostname.replace(/^www\./, "");
      } catch {
        continue;
      }
      if (linkHost !== baseDomain) continue;

      // Skip obvious navigation / footer / utility links.
      const lowerText = text.toLowerCase();
      if (
        /^(accueil|home|contact|newsletter|login|connexion|recherche|search|menu|voir plus|lire la suite|en savoir plus|partager|imprimer)$/i.test(
          lowerText,
        )
      ) {
        continue;
      }
      // Skip very short utility links.
      if (text.length < 12) continue;

      // Look for a nearby date in the 300 chars after the anchor end.
      const afterIdx = m.index + m[0].length;
      const window = html.slice(afterIdx, afterIdx + 300);
      const dateStr = extractDateFromWindow(window);

      items.push({
        title: text.slice(0, 500),
        url: absoluteUrl,
        source: cfg.publisherName,
        publishedAt: dateStr,
        description: text.slice(0, 500),
        content: "",
        language: cfg.language,
        urlHash: hashUrl(absoluteUrl),
      });
    }

    if (items.length > 0) {
      logInfo("regulatory-scraper", `HTML hit for ${cfg.id}: ${url} → ${items.length} items`);
      return { articles: items, usedUrl: url };
    }
  }
  return null;
}

function extractDateFromWindow(window: string): Date | null {
  if (!window) return null;

  // DD/MM/YYYY
  const dmy = window.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/);
  if (dmy) {
    const d = new Date(
      Number(dmy[3]),
      Number(dmy[2]) - 1,
      Number(dmy[1]),
    );
    if (!isNaN(d.getTime())) return d;
  }

  // DD MMM YYYY (French month names)
  const monthsFr: Record<string, number> = {
    janvier: 0, février: 1, fevrier: 1, mars: 2, avril: 3, mai: 4, juin: 5,
    juillet: 6, août: 7, aout: 7, septembre: 8, octobre: 9, novembre: 10,
    décembre: 11, decembre: 11,
    jan: 0, fév: 1, fev: 1, mar: 2, avr: 3, jun: 5, jul: 6, sep: 8, oct: 9,
    nov: 10, déc: 11, dec: 11,
  };
  const dmyText = window.match(
    /\b(\d{1,2})\s+([A-Za-zÀ-ÿ]{3,9})\s+(\d{4})\b/,
  );
  if (dmyText) {
    const monthIdx = monthsFr[dmyText[2].toLowerCase()];
    if (monthIdx !== undefined) {
      const d = new Date(
        Number(dmyText[3]),
        monthIdx,
        Number(dmyText[1]),
      );
      if (!isNaN(d.getTime())) return d;
    }
  }

  // YYYY-MM-DD
  const iso = window.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (iso) {
    const d = new Date(`${iso[0]}T12:00:00Z`);
    if (!isNaN(d.getTime())) return d;
  }

  return null;
}

// ─── SCRAPED ARTICLE → REGULATORY ITEM ───────────────────────────

/**
 * Convert a ScrapedArticle (RSS / HTML output) to a RegulatoryItem
 * the API returns. Applies optional keyword filtering (Google News
 * tends to surface loosely related articles).
 */
function toRegulatoryItem(
  article: ScrapedArticle,
  cfg: RegulatoryFeedConfig,
): RegulatoryItem | null {
  const title = (article.title || "").trim();
  if (!title) return null;

  // Optional keyword filter — keeps the Google News fallback from
  // polluting the feed with off-topic articles.
  if (cfg.titleKeywords && cfg.titleKeywords.length > 0) {
    const haystack = `${title} ${article.description}`.toLowerCase();
    const hit = cfg.titleKeywords.some((kw) => haystack.includes(kw));
    if (!hit) return null;
  }

  const summary = (article.description || article.content || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 600);

  return {
    id: article.urlHash,
    title: title.slice(0, 500),
    source: cfg.id,
    sourceLabel: cfg.label,
    url: article.url,
    publishedAt: article.publishedAt ? article.publishedAt.toISOString() : null,
    type: cfg.type,
    summary,
    language: article.language || cfg.language,
  };
}

// ─── SCRAPE ONE SOURCE ───────────────────────────────────────────

/**
 * Scrape a single regulator. Strategy chain:
 *   1. Direct RSS candidates (if the publisher exposes one).
 *   2. Google News RSS proxy (default for AMMC / BAM / BVC).
 *   3. HTML scrape of the news / publications listing page.
 *
 * Never throws — returns a RegulatoryScrapeResult with `error` set
 * when every strategy failed.
 */
export async function scrapeRegulatorySource(
  cfg: RegulatoryFeedConfig,
): Promise<RegulatoryScrapeResult> {
  const startedAt = Date.now();
  const base: Omit<RegulatoryScrapeResult, "items" | "strategy" | "error" | "durationMs" | "articlesFound"> = {
    source: cfg.id,
    label: cfg.label,
  };

  // 1. Direct RSS
  const rssHit = await tryRssCandidates(cfg);
  if (rssHit) {
    const items = rssHit.articles
      .map((a) => toRegulatoryItem(a, cfg))
      .filter((x): x is RegulatoryItem => x !== null)
      .slice(0, cfg.maxItems);
    return {
      ...base,
      items,
      articlesFound: rssHit.articles.length,
      durationMs: Date.now() - startedAt,
      strategy: "rss",
    };
  }

  // 2. Google News fallback
  const gnHit = await tryGoogleNews(cfg);
  if (gnHit) {
    const items = gnHit.articles
      .map((a) => toRegulatoryItem(a, cfg))
      .filter((x): x is RegulatoryItem => x !== null)
      .slice(0, cfg.maxItems);
    return {
      ...base,
      items,
      articlesFound: gnHit.articles.length,
      durationMs: Date.now() - startedAt,
      strategy: "google-news",
    };
  }

  // 3. HTML last resort
  const htmlHit = await tryHtmlCandidates(cfg);
  if (htmlHit) {
    const items = htmlHit.articles
      .map((a) => toRegulatoryItem(a, cfg))
      .filter((x): x is RegulatoryItem => x !== null)
      .slice(0, cfg.maxItems);
    return {
      ...base,
      items,
      articlesFound: htmlHit.articles.length,
      durationMs: Date.now() - startedAt,
      strategy: "html",
    };
  }

  logWarn("regulatory-scraper", `All strategies failed for ${cfg.id}`);
  return {
    ...base,
    items: [],
    articlesFound: 0,
    durationMs: Date.now() - startedAt,
    strategy: "none",
    error: "All strategies failed (RSS + Google News + HTML)",
  };
}

// ─── SCRAPE ALL THREE SOURCES ────────────────────────────────────

/**
 * Run a full regulatory scrape cycle: AMMC + BAM + BVC in parallel.
 * Used by the daily cron (/api/cron/scrape-regulatory) and by the
 * on-demand "Refresh now" action in the Investor Desk UI.
 */
export async function scrapeAllRegulatory(): Promise<RegulatoryScrapeSummary> {
  const startedAt = new Date();
  const startMs = Date.now();
  logInfo("regulatory-scraper", `Starting scrape — ${REGULATORY_FEEDS.length} regulators`);

  const results = await Promise.all(
    REGULATORY_FEEDS.map((cfg) => scrapeRegulatorySource(cfg)),
  );

  const itemsFound = results.reduce((sum, r) => sum + r.items.length, 0);
  const errors = results
    .filter((r) => r.error)
    .map((r) => ({ source: r.label, message: r.error as string }));

  const summary: RegulatoryScrapeSummary = {
    sourcesProcessed: REGULATORY_FEEDS.length,
    itemsFound,
    errors,
    startedAt: startedAt.toISOString(),
    completedAt: new Date().toISOString(),
    durationMs: Date.now() - startMs,
    perSource: results,
  };

  logInfo(
    "regulatory-scraper",
    `Done — ${itemsFound} items found in ${summary.durationMs}ms`,
  );
  return summary;
}

// ─── DB INSERT HELPER ────────────────────────────────────────────

/**
 * Persist scraped regulatory items into the Article table.
 *
 *  • Dedupe by urlHash (SHA-256 of URL — same column as the main RSS
 *    pipeline so an item seen via Google News + a future direct RSS
 *    collapses to a single row).
 *  • Mark every row with `sourceType` = the regulator's dbSourceType
 *    ("regulatory" / "financial" / "market") so the API can filter
 *    `WHERE sourceType IN (...)`.
 *  • Mark `isDemo: false` — regulatory items are real signals, never
 *    demo seed.
 *  • Never throws — every insert is wrapped in try/catch.
 *
 * Returns counts for ScraperLog.
 */
export async function persistRegulatoryItems(
  result: RegulatoryScrapeResult,
  cfg: RegulatoryFeedConfig,
): Promise<{ inserted: number; skipped: number }> {
  // Lazy import — keeps the scraper module importable without a DB
  // (useful for the standalone test scripts in /scripts).
  const { prisma } = await import("@/lib/db");

  if (result.items.length === 0) {
    return { inserted: 0, skipped: 0 };
  }

  // Bulk dedupe — one query instead of N.
  const hashes = result.items.map((it) => it.id);
  const existing = await prisma.article.findMany({
    where: { urlHash: { in: hashes } },
    select: { urlHash: true },
  });
  const existingSet = new Set(existing.map((a) => a.urlHash));

  let inserted = 0;
  let skipped = 0;

  for (const item of result.items) {
    if (existingSet.has(item.id)) {
      skipped++;
      continue;
    }
    try {
      await prisma.article.create({
        data: {
          title: item.title.slice(0, 500),
          url: item.url,
          urlHash: item.id,
          source: cfg.publisherName,
          sourceId: `regulatory-${cfg.id}`,
          publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
          content: null,
          summary: item.summary || null,
          language: item.language,
          sentimentLabel: null,
          sentimentScore: null,
          relevanceScore: 0.9,
          processed: true,
          isDemo: false,
          sourceType: cfg.dbSourceType,
        },
      });
      inserted++;
    } catch (err) {
      logWarn(
        "regulatory-scraper",
        `Insert failed for ${cfg.id} ${item.url}: ${(err as Error).message}`,
      );
    }
  }

  return { inserted, skipped };
}
