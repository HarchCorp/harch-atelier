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

// ─── STOCK-PRICE COLLECTOR (stub) ─────────────────────────────────

/**
 * StockPriceData — the shape collectStockPrice will return once the
 * Bourse de Casablanca integration is built. Declared here so the
 * PREDICT stage can already be coded against the future contract.
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
 * collectStockPrice — stub for the Bourse de Casablanca market-data
 * integration.
 *
 * TODO: implement against the Bourse de Casablanca market-data API
 * (or an authorized redistributor). Requirements:
 *   • Licensed market-data feed (BdC Terms prohibit screen-scraping)
 *   • 15-minute delayed quotes are acceptable for OSINT dossiers
 *   • Cache for 5 minutes minimum to respect rate limits
 *
 * Until then, returns null.
 *
 * @param ticker Casablanca Stock Exchange ticker (e.g. "ATW")
 * @returns always null until the integration is built
 */
export async function collectStockPrice(
  ticker: string,
): Promise<StockPriceData | null> {
  // TODO: Bourse de Casablanca API integration planned.
  console.warn(
    `[HarchIQ-Collect] Stock-price collection not yet configured for ticker "${ticker}" (Bourse de Casablanca API planned)`,
  );
  return null;
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
  console.warn(
    `[HarchIQ-Collect] Financial-report collection not yet configured for "${companyName}" (AMMC repository integration planned)`,
  );
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
    console.warn(
      "[HarchIQ-Collect] collectRegulatoryFilings called with empty companyName",
    );
    return [];
  }

  console.log(
    `[HarchIQ-Collect] Regulatory-filing collection starting for "${companyName}"`,
  );
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
    console.warn(
      `[HarchIQ-Collect] BAM RSS fetch failed for "${companyName}":`,
      bamArticles.reason,
    );
  }
  if (ammcArticles.status === "rejected") {
    console.warn(
      `[HarchIQ-Collect] AMMC RSS fetch failed for "${companyName}":`,
      ammcArticles.reason,
    );
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
  console.log(
    `[HarchIQ-Collect] Regulatory-filing collection complete in ${elapsed}ms — BAM: ${bamResults.length}, AMMC: ${ammcResults.length}, merged: ${merged.length}`,
  );

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
    snippet: article.rawContent.slice(0, 500),
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
