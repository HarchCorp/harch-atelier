// ═══════════════════════════════════════════════════════════════
//  PROJECT AEGIS v3.0 — HarchIQ COLLECT STAGE
//  Financial-data collector — stock prices, financial reports, and
//  regulatory filings from the Moroccan capital-markets authorities
//  (Bank Al-Maghrib + AMMC).
//
//  Three collectors are exposed:
//    • collectStockPrice(ticker)        — stub (Bourse de Casablanca)
//    • collectFinancialReports(company) — stub (AMMC document repository)
//    • collectRegulatoryFilings(company)— LIVE (BAM + AMMC RSS feeds)
//
//  Only collectRegulatoryFilings is implemented today: it scrapes the
//  two Moroccan regulatory RSS feeds (already registered in
//  sources-config.ts as the "bam" and "ammc" sources) and filters to
//  filings that mention the company. The other two return null with
//  TODOs until the upstream APIs are wired up.
//
//  Task ID: AEGIS-V3-CORE
//  Module:  harchiq/collect/financial-collector
// ═══════════════════════════════════════════════════════════════

import { scrapeDirectRSS, type ScrapedArticle } from "../../scrapers/rss-scraper";
import { RSS_SOURCES } from "../../scrapers/sources-config";
import { fetchBVCQuote } from "../../scrapers/bvc-prices";
import { logInfo, logWarn } from "@/lib/logger";
import type { CollectionResult } from "../types";

// Re-export for ergonomic imports from this module.
export type { CollectionResult } from "../types";

// ─── REGULATORY FEED ENDPOINTS ────────────────────────────────────

/**
 * The two Moroccan capital-markets regulatory RSS feeds. These mirror
 * the entries in sources-config.ts but are re-declared here so this
 * module remains self-documenting and survives even if the registry
 * is reorganized.
 */
const BAM_RSS_URL = "https://www.bkam.ma/rss"; // Bank Al-Maghrib (central bank)
const AMMC_RSS_URL = "https://www.ammc.ma/rss"; // Autorité Marocaine du Marché des Capitaux

// ─── STOCK-PRICE COLLECTOR (BVC via Yahoo GDR + manual CSV) ────────

/**
 * StockPriceData — the canonical shape returned by collectStockPrice.
 * The PREDICT stage and the cron refresh both code against this
 * contract.
 */
export interface StockPriceData {
  /** Casablanca Stock Exchange ticker (e.g. "ATW", "OCP", "IAM"). */
  ticker: string;
  /** Last traded price in MAD (Moroccan Dirham). */
  lastPrice: number;
  /** Day open. */
  open: number;
  /** Day high. */
  high: number;
  /** Day low. */
  low: number;
  /** Volume traded (shares). */
  volume: number;
  /** Market capitalization in MAD. */
  marketCap?: number;
  /** ISO-8601 timestamp of the last trade. */
  asOf: string;
  /** Absolute change vs. previous close. */
  change: number;
  /** Percentage change vs. previous close. */
  changePercent: number;
}

/**
 * In-memory 5-minute cache for stock quotes. The BVC has no free
 * real-time API, so every quote goes through `fetchBVCQuote` (Yahoo
 * Finance GDR mapping for the handful of Moroccan issuers listed
 * internationally, e.g. IAM → IAM.PA on Euronext Paris). Caching
 * respects the upstream rate limits and keeps collector latency low
 * for the PREDICT stage which may call this repeatedly.
 *
 * Keyed by uppercase ticker. Entries expire after CACHE_TTL_MS.
 */
const STOCK_PRICE_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const stockPriceCache = new Map<
  string,
  { data: StockPriceData; expiresAt: number }
>();

/**
 * collectStockPrice — fetch the latest Bourse de Casablanca quote for
 * a ticker.
 *
 * Implementation: delegates to `fetchBVCQuote` (in
 * `src/lib/scrapers/bvc-prices.ts`) which chains Yahoo Finance GDR
 * mappings → Investing.com (currently 403) → manual CSV uploads.
 * Returns null honestly when no live source is available — we never
 * fabricate a price.
 *
 * @param ticker Casablanca Stock Exchange ticker (e.g. "ATW", "OCP", "IAM")
 * @returns StockPriceData when a live quote is available, null otherwise
 */
export async function collectStockPrice(
  ticker: string,
): Promise<StockPriceData | null> {
  const key = ticker.toUpperCase();

  // 1. Cache hit?
  const cached = stockPriceCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  // 2. Live fetch via the BVC price fetcher.
  let quote;
  try {
    quote = await fetchBVCQuote(key);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    logWarn("financial-collector", `collectStockPrice(${key}) fetch error: ${msg}`);
    return null;
  }

  if (!quote) {
    // No live source for this ticker — return null honestly.
    // The caller (PREDICT stage / cron refresh) must treat null as
    // "no data" and fall back to the last cached AssetPrice row.
    return null;
  }

  // 3. Map BVCQuote → StockPriceData.
  // Yahoo GDR quotes give us last price + changePct + volume, but
  // not OHLC. We set open/high/low to the last price so the
  // StockPriceData shape is always populated (callers that need
  // true OHLC should query Yahoo's chart endpoint directly).
  const lastPrice = quote.price;
  const changePercent = quote.changePct ?? 0;
  const change = (lastPrice * changePercent) / 100;
  const data: StockPriceData = {
    ticker: key,
    lastPrice,
    open: lastPrice, // Yahoo quote endpoint doesn't expose OHLC for GDRs
    high: lastPrice,
    low: lastPrice,
    volume: quote.volume ?? 0,
    asOf: (quote.fetchedAt instanceof Date ? quote.fetchedAt : new Date()).toISOString(),
    change: parseFloat(change.toFixed(4)),
    changePercent: parseFloat(changePercent.toFixed(2)),
  };

  // 4. Cache + log.
  stockPriceCache.set(key, { data, expiresAt: Date.now() + STOCK_PRICE_CACHE_TTL_MS });
  logInfo(
    "financial-collector",
    `collectStockPrice(${key}) → ${data.lastPrice} ${quote.currency} (${quote.source}, Δ${data.changePercent}%)`,
  );

  return data;
}

/**
 * Clear the stock-price cache. Exposed for the admin "scrape now"
 * endpoint and for tests.
 */
export function clearStockPriceCache(): void {
  stockPriceCache.clear();
}

// ─── FINANCIAL-REPORTS COLLECTOR (stub) ───────────────────────────

/**
 * FinancialReportData — the shape collectFinancialReports will return
 * once the AMMC document-repository integration is built.
 */
export interface FinancialReportData {
  /** Company entity ID or name. */
  company: string;
  /** Report type (annual, semi-annual, quarterly, ad-hoc). */
  reportType: "annual" | "semi_annual" | "quarterly" | "ad_hoc";
  /** Fiscal period (e.g. "FY2024", "Q2-2024"). */
  period: string;
  /** Filing date (ISO-8601). */
  filedAt: string;
  /** Direct URL to the PDF / HTML document. */
  documentUrl: string;
  /** Headline financials extracted from the report. */
  headlineFinancials: {
    revenue?: number;
    netIncome?: number;
    ebitda?: number;
    totalAssets?: number;
    totalEquity?: number;
    currency: "MAD" | "USD" | "EUR";
  };
}

/**
 * collectFinancialReports — stub for the AMMC document-repository
 * integration.
 *
 * TODO: implement against the AMMC document repository (structured
 * filings search). Requirements:
 *   • Parse the AMMC filings index (HTML table or future API)
 *   • Download + OCR the PDF for headline figures
 *   • Cache the parsed financials by (company, period)
 *
 * Until then, returns null.
 *
 * @param companyName the company to fetch financial reports for
 * @returns always null until the integration is built
 */
export async function collectFinancialReports(
  companyName: string,
): Promise<FinancialReportData[] | null> {
  // TODO: AMMC document-repository integration planned.
  logWarn("lib.harchiq.collect.financial-collector", `[HarchIQ-Collect] Financial-report collection not yet configured for "${companyName}" (AMMC repository integration planned)`);
  return null;
}

// ─── REGULATORY-FILINGS COLLECTOR (live) ──────────────────────────

/**
 * collectRegulatoryFilings — scrape the BAM and AMMC RSS feeds for
 * filings that mention the company.
 *
 * This collector is LIVE today because both authorities expose RSS
 * feeds that are already registered in sources-config.ts (the "bam"
 * and "ammc" sources). It reuses scrapeDirectRSS so it inherits the
 * UA rotation, retry, and rate-limit-awareness of the AEGIS-SCRAPER.
 *
 * Pipeline:
 *  1. Scrape BAM RSS  → filter to articles mentioning companyName
 *  2. Scrape AMMC RSS → filter to articles mentioning companyName
 *  3. Merge + dedupe by URL hash
 *  4. Convert to CollectionResult with collector = "bam" | "ammc"
 *
 * @param companyName the company to collect regulatory filings for
 * @returns CollectionResult[] — one entry per matching filing
 */
export async function collectRegulatoryFilings(
  companyName: string,
): Promise<CollectionResult[]> {
  if (!companyName || !companyName.trim()) {
    logWarn("lib.harchiq.collect.financial-collector", "[HarchIQ-Collect] collectRegulatoryFilings called with empty companyName");
    return [];
  }

  logInfo("lib.harchiq.collect.financial-collector", `[HarchIQ-Collect] Regulatory-filing collection starting for "${companyName}"`);
  const startedAt = Date.now();

  // Look up the configured rate limits for the two feeds so we honor
  // the polite-crawl policy declared in sources-config.ts.
  const bamSource = RSS_SOURCES.find((s) => s.id === "bam");
  const ammcSource = RSS_SOURCES.find((s) => s.id === "ammc");

  // Run both feeds in parallel — they're independent.
  const [bamArticles, ammcArticles] = await Promise.allSettled([
    scrapeDirectRSS(BAM_RSS_URL, companyName, {
      maxArticles: 50,
      timeout: 30_000,
      retryCount: 3,
      rateLimitMs: bamSource?.rateLimitMs ?? 5000,
    }),
    scrapeDirectRSS(AMMC_RSS_URL, companyName, {
      maxArticles: 50,
      timeout: 30_000,
      retryCount: 3,
      rateLimitMs: ammcSource?.rateLimitMs ?? 5000,
    }),
  ]);

  const bamResults: ScrapedArticle[] =
    bamArticles.status === "fulfilled" ? bamArticles.value : [];
  const ammcResults: ScrapedArticle[] =
    ammcArticles.status === "fulfilled" ? ammcArticles.value : [];

  if (bamArticles.status === "rejected") {
    logWarn("lib.harchiq.collect.financial-collector", `[HarchIQ-Collect] BAM RSS fetch failed for "${companyName}": ${bamArticles.reason}`);
  }
  if (ammcArticles.status === "rejected") {
    logWarn("lib.harchiq.collect.financial-collector", `[HarchIQ-Collect] AMMC RSS fetch failed for "${companyName}": ${ammcArticles.reason}`);
  }

  // Convert each batch to CollectionResult with the right collector tag.
  const bamCollectionResults = bamResults.map((a) =>
    toRegulatoryResult(a, "bam", bamSource?.reliability ?? "high"),
  );
  const ammcCollectionResults = ammcResults.map((a) =>
    toRegulatoryResult(a, "ammc", ammcSource?.reliability ?? "high"),
  );

  // Merge + dedupe by URL hash (a filing might appear in both feeds
  // in rare cross-publication cases).
  const merged = dedupeByHash([...bamCollectionResults, ...ammcCollectionResults]);

  const elapsed = Date.now() - startedAt;
  logInfo("lib.harchiq.collect.financial-collector", `[HarchIQ-Collect] Regulatory-filing collection complete in ${elapsed}ms — BAM: ${bamResults.length}, AMMC: ${ammcResults.length}, merged: ${merged.length}`);

  return merged;
}

// ─── SHAPE CONVERSION ─────────────────────────────────────────────

/**
 * toRegulatoryResult — convert a ScrapedArticle from a regulatory
 * feed into a CollectionResult tagged with the right collector.
 */
function toRegulatoryResult(
  article: ScrapedArticle,
  collector: "bam" | "ammc",
  reliability: "high" | "medium" | "low",
): CollectionResult {
  return {
    urlHash: article.urlHash,
    title: article.title,
    url: article.url,
    source: article.source,
    publishedAt: article.publishedAt ? article.publishedAt.toISOString() : null,
    snippet: (article.description || "").slice(0, 500),
    // Full content not fetched for regulatory filings — they're usually
    // PDF attachments that fetchArticleContent can't extract. The
    // snippet from the RSS feed is sufficient for dossier generation.
    fullContent: null,
    language: article.language,
    collector,
    collectedAt: new Date().toISOString(),
    reliability,
  };
}

// ─── DEDUPE HELPER ────────────────────────────────────────────────

/**
 * dedupeByHash — collapse CollectionResults that share a URL hash.
 * First-seen wins (regulatory filings don't have a meaningful "most
 * recent" — they're filed once).
 */
function dedupeByHash(results: CollectionResult[]): CollectionResult[] {
  const seen = new Map<string, CollectionResult>();
  for (const r of results) {
    if (!seen.has(r.urlHash)) seen.set(r.urlHash, r);
  }
  return Array.from(seen.values());
}
