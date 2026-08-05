// ═══════════════════════════════════════════════════════════════
//  PROJECT AEGIS v3.0 — HarchIQ COLLECT STAGE
//  RSS collector — orchestrates ingestion from Google News + the
//  curated direct-feed registry, dedupes by URL hash, and enriches
//  the top articles with their full body text.
//
//  This module is a thin orchestration layer on top of the existing
//  AEGIS-SCRAPER primitives in scrapers/rss-scraper.ts. It adds:
//    • Unified CollectionResult shape (shared with social / financial)
//    • Rate-limit-aware parallel batching (respects per-source rateLimitMs)
//    • URL-hash dedupe across Google News + direct feeds
//    • Full-content enrichment for the top 20 freshest articles
//
//  Downstream stages (UNDERSTAND, CONNECT, PREDICT) consume the
//  CollectionResult[] this module produces — never the raw scraper
//  output — so they don't need to know about RSS vs. social vs.
//  financial provenance.
//
//  Task ID: AEGIS-V3-CORE
//  Module:  harchiq/collect/rss-collector
// ═══════════════════════════════════════════════════════════════

import {
  scrapeGoogleNewsRSS,
  scrapeDirectRSS,
  fetchArticleContent,
  detectLanguage,
  type ScrapedArticle,
} from "../../scrapers/rss-scraper";
import { RSS_SOURCES, getActiveSources } from "../../scrapers/sources-config";
import type { CollectionResult } from "../types";

// Re-export CollectionResult so callers can `import { CollectionResult }`
// directly from this module without reaching into the types package.
export type { CollectionResult } from "../types";

// ─── OPTIONS ──────────────────────────────────────────────────────

/**
 * CollectFromRSSOptions — tuning knobs for collectFromRSS. All fields
 * optional; sensible production defaults are applied in the function.
 */
export interface CollectFromRSSOptions {
  /** ISO-2 country code for the Google News query (default "MA"). */
  country?: string;
  /** Language for the Google News query (default "fr"). */
  language?: "fr" | "ar" | "en";
  /** Max articles to pull from Google News (default 50). */
  maxGoogleNewsArticles?: number;
  /** Max articles to pull per direct feed (default 30). */
  maxDirectArticlesPerFeed?: number;
  /** Max articles to enrich with full content (default 20). */
  maxFullContentFetch?: number;
  /** Per-batch concurrency for direct feeds (default 5). */
  concurrency?: number;
  /** Whether to skip direct feeds and only hit Google News. */
  googleNewsOnly?: boolean;
  /** Optional timeout (ms) for each scrape operation. */
  timeoutMs?: number;
}

// ─── DEFAULTS ─────────────────────────────────────────────────────

const DEFAULTS: Required<
  Omit<CollectFromRSSOptions, "googleNewsOnly" | "timeoutMs">
> & { googleNewsOnly: boolean; timeoutMs: number } = {
  country: "MA",
  language: "fr",
  maxGoogleNewsArticles: 50,
  maxDirectArticlesPerFeed: 30,
  maxFullContentFetch: 20,
  concurrency: 5,
  googleNewsOnly: false,
  timeoutMs: 30_000,
};

// ─── MAIN ENTRY POINT ─────────────────────────────────────────────

/**
 * collectFromRSS — orchestrate RSS collection for a single company.
 *
 * Pipeline:
 *  1. Google News RSS (company name as query) — broadest coverage.
 *  2. Direct RSS feeds from sources-config.ts, filtered to articles
 *     that mention the company. Run in `concurrency`-wide batches,
 *     respecting each source's `rateLimitMs` between calls.
 *  3. Merge + dedupe by URL hash (Google News and direct feeds often
 *     surface the same story — collapse to one row).
 *  4. Enrich the top `maxFullContentFetch` freshest articles with
 *     their full body text via fetchArticleContent.
 *  5. Convert every ScrapedArticle to a CollectionResult and return.
 *
 * The function never throws — collection is best-effort. Per-source
 * failures are logged and skipped; the rest of the pipeline continues.
 *
 * @param companyName the company to collect intelligence on
 * @param options     optional tuning (see CollectFromRSSOptions)
 * @returns CollectionResult[] — one entry per unique article
 */
export async function collectFromRSS(
  companyName: string,
  options: CollectFromRSSOptions = {},
): Promise<CollectionResult[]> {
  if (!companyName || !companyName.trim()) {
    console.warn("[HarchIQ-Collect] collectFromRSS called with empty companyName");
    return [];
  }

  const opts = { ...DEFAULTS, ...options };
  const startedAt = Date.now();
  console.log(
    `[HarchIQ-Collect] RSS collection starting for "${companyName}"`,
  );

  // ── STEP 1: Google News RSS ──────────────────────────────────
  const googleArticles = await collectGoogleNews(companyName, opts);
  console.log(
    `[HarchIQ-Collect] Google News → ${googleArticles.length} articles`,
  );

  // ── STEP 2: Direct RSS feeds (batched, rate-limit-aware) ─────
  let directArticles: ScrapedArticle[] = [];
  if (!opts.googleNewsOnly) {
    directArticles = await collectDirectFeeds(companyName, opts);
    console.log(
      `[HarchIQ-Collect] Direct feeds → ${directArticles.length} articles`,
    );
  }

  // ── STEP 3: Merge + dedupe by URL hash ───────────────────────
  const merged = dedupeByHash([...googleArticles, ...directArticles]);
  console.log(
    `[HarchIQ-Collect] Merged + deduped → ${merged.length} unique articles`,
  );

  // ── STEP 4: Enrich top articles with full content ────────────
  const top = pickTopArticles(merged, opts.maxFullContentFetch);
  const enriched = await enrichWithFullContent(top, opts.timeoutMs);
  console.log(
    `[HarchIQ-Collect] Enriched ${enriched.size}/${top.length} articles with full content`,
  );

  // ── STEP 5: Convert to CollectionResult[] ────────────────────
  const results = merged.map((a) => toCollectionResult(a, enriched.get(a.urlHash)));

  const elapsed = Date.now() - startedAt;
  console.log(
    `[HarchIQ-Collect] RSS collection complete in ${elapsed}ms — ${results.length} results for "${companyName}"`,
  );

  return results;
}

// ─── GOOGLE NEWS SUB-COLLECTOR ────────────────────────────────────

/**
 * collectGoogleNews — single-source helper for Google News RSS.
 * Wrapped in try/catch so a Google News outage doesn't kill the whole
 * collection run.
 */
async function collectGoogleNews(
  companyName: string,
  opts: Required<CollectFromRSSOptions> & {
    timeoutMs: number;
    googleNewsOnly: boolean;
  },
): Promise<ScrapedArticle[]> {
  try {
    return await scrapeGoogleNewsRSS({
      query: companyName,
      language: opts.language,
      country: opts.country,
      maxArticles: opts.maxGoogleNewsArticles,
      timeout: opts.timeoutMs,
    });
  } catch (err) {
    console.error(
      `[HarchIQ-Collect] Google News collection failed for "${companyName}":`,
      err,
    );
    return [];
  }
}

// ─── DIRECT-FEEDS SUB-COLLECTOR ───────────────────────────────────

/**
 * collectDirectFeeds — iterate the curated direct-feed registry in
 * `concurrency`-wide batches, respecting each source's rateLimitMs.
 *
 * Sources whose URL is the Google News template (contains "news.google.com")
 * are skipped here — they're handled by collectGoogleNews.
 */
async function collectDirectFeeds(
  companyName: string,
  opts: Required<CollectFromRSSOptions> & {
    timeoutMs: number;
    googleNewsOnly: boolean;
  },
): Promise<ScrapedArticle[]> {
  const sources = getActiveSources().filter(
    (s) => s.url.includes("://") && !s.url.includes("news.google.com"),
  );

  if (sources.length === 0) {
    console.warn(
      "[HarchIQ-Collect] No active direct feeds in RSS_SOURCES — skipping direct collection",
    );
    return [];
  }

  const all: ScrapedArticle[] = [];
  const batchSize = Math.max(1, opts.concurrency);

  for (let i = 0; i < sources.length; i += batchSize) {
    const batch = sources.slice(i, i + batchSize);
    const settled = await Promise.allSettled(
      batch.map(async (src) => {
        // Respect the per-source rate limit BEFORE the call so a
        // misconfigured aggressive source can't hammer its origin.
        if (src.rateLimitMs > 0) {
          await sleep(src.rateLimitMs);
        }
        return scrapeDirectRSS(src.url, companyName, {
          maxArticles: opts.maxDirectArticlesPerFeed,
          timeout: opts.timeoutMs,
          rateLimitMs: src.rateLimitMs,
        });
      }),
    );

    for (let j = 0; j < settled.length; j++) {
      const r = settled[j];
      if (r.status === "fulfilled") {
        all.push(...r.value);
      } else {
        const src = batch[j];
        console.warn(
          `[HarchIQ-Collect] Direct feed "${src.id}" failed:`,
          r.reason,
        );
      }
    }
  }

  return all;
}

// ─── DEDUPE + RANKING ─────────────────────────────────────────────

/**
 * dedupeByHash — collapse articles that share a URL hash. Google News
 * and a direct feed frequently surface the same story; without this
 * dedupe the UNDERSTAND stage would double-count.
 *
 * On collision the most recent article wins (by publishedAt, falling
 * back to insertion order).
 */
function dedupeByHash(articles: ScrapedArticle[]): ScrapedArticle[] {
  const seen = new Map<string, ScrapedArticle>();
  for (const a of articles) {
    const existing = seen.get(a.urlHash);
    if (!existing) {
      seen.set(a.urlHash, a);
      continue;
    }
    // Prefer the one with the more recent publishedAt.
    const aTime = a.publishedAt?.getTime() ?? 0;
    const bTime = existing.publishedAt?.getTime() ?? 0;
    if (aTime > bTime) seen.set(a.urlHash, a);
  }
  return Array.from(seen.values());
}

/**
 * pickTopArticles — select the `limit` freshest articles for full-content
 * enrichment. Sorts by publishedAt descending (nulls last).
 */
function pickTopArticles(
  articles: ScrapedArticle[],
  limit: number,
): ScrapedArticle[] {
  if (limit <= 0 || articles.length === 0) return [];
  return [...articles]
    .sort((a, b) => {
      const at = a.publishedAt?.getTime() ?? 0;
      const bt = b.publishedAt?.getTime() ?? 0;
      return bt - at;
    })
    .slice(0, limit);
}

// ─── FULL-CONTENT ENRICHMENT ──────────────────────────────────────

/**
 * enrichWithFullContent — fetch the full article body for each URL.
 * Returns a Map<urlHash, fullContent>. Failures are silently skipped
 * (the snippet from the RSS feed is still used downstream).
 *
 * Runs with limited concurrency (5) to avoid hammering publisher sites.
 */
async function enrichWithFullContent(
  articles: ScrapedArticle[],
  timeoutMs: number,
): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  if (articles.length === 0) return out;

  const batchSize = 5;
  for (let i = 0; i < articles.length; i += batchSize) {
    const batch = articles.slice(i, i + batchSize);
    const settled = await Promise.allSettled(
      batch.map(async (a) => ({
        urlHash: a.urlHash,
        content: await fetchArticleContent(a.url, { timeout: timeoutMs }),
      })),
    );
    for (const r of settled) {
      if (r.status === "fulfilled" && r.value.content) {
        out.set(r.value.urlHash, r.value.content);
      }
    }
  }
  return out;
}

// ─── SHAPE CONVERSION ─────────────────────────────────────────────

/**
 * toCollectionResult — convert a ScrapedArticle (scraper internal type)
 * into a CollectionResult (the unified COLLECT-stage payload).
 *
 * Re-detects the language from the snippet+fullContent (when available)
 * because some publishers set the wrong <language> tag in their feed.
 */
function toCollectionResult(
  article: ScrapedArticle,
  fullContent: string | undefined,
): CollectionResult {
  const sourceMeta = RSS_SOURCES.find((s) =>
    article.source.toLowerCase().includes(s.name.toLowerCase()),
  );

  // Re-detect language from the richer text when we have it.
  const langSource = fullContent
    ? `${article.title} ${fullContent.slice(0, 500)}`
    : `${article.title} ${article.description}`;
  const language = detectLanguage(langSource) || article.language;

  return {
    urlHash: article.urlHash,
    title: article.title,
    url: article.url,
    source: article.source,
    publishedAt: article.publishedAt ? article.publishedAt.toISOString() : null,
    snippet: (article.description || "").slice(0, 500),
    fullContent: fullContent ?? null,
    language,
    collector: "rss",
    collectedAt: new Date().toISOString(),
    reliability: sourceMeta?.reliability ?? "medium",
  };
}

// ─── UTIL ─────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
