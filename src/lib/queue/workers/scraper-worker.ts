// ═══════════════════════════════════════════════════════════════
//  SCRAPER WORKER — AEGIS v4.0
//
//  Consumes jobs from `scraper-queue`. Each job asks the worker to
//  collect every article about a single company from:
//    1. Google News RSS (query = company name, locale = MA / fr)
//    2. Every active direct RSS source in src/lib/scrapers/sources-config.ts
//
//  Articles are upserted by `urlHash` (SHA-256 of the cleaned URL) so
//  the same story seen via Google News + a direct feed collapses to a
//  single row. A ScraperLog row is written per source for the audit
//  dashboard at /api/admin/scraper-logs.
//
//  Job payload:  { companyName: string; companySlug: string }
//  Returns:      { articlesFound: number; articlesNew: number }
//
//  This file is a plain TypeScript worker — it must be bootstrapped by
//  a long-running Node.js / Bun process (e.g. `bun run src/lib/queue/
//  workers/start.ts`) on a VPS. It does NOT run on Vercel.
// ═══════════════════════════════════════════════════════════════

import { Worker, type Job } from "bullmq";
import { prisma } from "../../db";
import { redisConnection } from "../connection";
import { QUEUE_NAMES } from "../index";
import {
  scrapeGoogleNewsRSS,
  scrapeDirectRSS,
  fetchArticleContent,
  type ScrapedArticle,
} from "../../scrapers/rss-scraper";
import { RSS_SOURCES, getCompanyBySlug } from "../../scrapers/sources-config";
import { logInfo, logError, logWarn } from "@/lib/logger";

// ─── JOB PAYLOAD / RESULT TYPES ──────────────────────────────────

export interface ScraperJobPayload {
  companyName: string;
  companySlug: string;
}

export interface ScraperJobResult {
  articlesFound: number;
  articlesNew: number;
}

// ─── HELPERS ─────────────────────────────────────────────────────

/**
 * Find or create a Company row matching `companySlug`. The Company
 * table is the foreign key target for Article / SentimentScore / etc,
 * so it must exist before we start upserting articles.
 *
 * NOTE: the actual DB schema stores `aliases` as a TEXT column holding
 * a JSON-encoded array (not a Postgres array column). We therefore
 * JSON.stringify the aliases when writing and JSON.parse when reading.
 */
async function ensureCompany(payload: ScraperJobPayload) {
  const cfg = getCompanyBySlug(payload.companySlug);

  // Look up by slug first — covers re-runs for tracked Moroccan companies.
  const existing = await prisma.company.findUnique({
    where: { slug: payload.companySlug },
  });
  if (existing) return existing;

  return prisma.company.create({
    data: {
      slug: payload.companySlug,
      name: cfg?.name ?? payload.companyName,
      // aliases is a native String[] column in the Postgres schema.
      aliases: cfg?.aliases ?? [payload.companyName],
      sector: cfg?.sector ?? "Unknown",
      ticker: cfg?.ticker,
      foundedYear: cfg?.foundedYear,
      headquarters: cfg?.headquarters,
      website: cfg?.website,
      description: cfg?.description,
    },
  });
}

/**
 * Persist a ScrapedArticle into Prisma, fetching the full article body
 * on first sight. Uses `upsert` keyed on `urlHash` so duplicate scrapes
 * (Google News + direct feed, or two consecutive runs) are idempotent.
 *
 * Returns true if a new row was created (used to compute `articlesNew`).
 */
async function upsertArticle(
  article: ScrapedArticle,
  companyId: string,
): Promise<boolean> {
  const existing = await prisma.article.findUnique({
    where: { urlHash: article.urlHash },
    select: { id: true, content: true },
  });

  if (existing) {
    // Already seen — keep the row but bump nothing. (We could update
    // `scrapedAt` to track re-sightings, but that distorts freshness
    // signals downstream. Leave it untouched.)
    return false;
  }

  // First sighting — fetch the full article body for downstream NLP.
  // If fetchArticleContent fails (403, timeout, paywall), fall back to
  // the RSS description so the article still enters the pipeline.
  let content = article.description || "";
  try {
    const full = await fetchArticleContent(article.url);
    if (full && full.length > content.length) content = full;
  } catch (err) {
    logWarn("scraper-worker", `fetchArticleContent failed for ${article.url}: ${err instanceof Error ? err.message : err}`);
  }

  await prisma.article.create({
    data: {
      companyId,
      title: article.title,
      url: article.url,
      source: article.source,
      sourceId: article.source.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 30),
      publishedAt: article.publishedAt,
      content,
      summary: (article.description || "").slice(0, 500) || null,
      language: article.language,
      urlHash: article.urlHash,
      // No `processed` column on the actual Article table — we use
      // `sentimentLabel IS NULL` as the "unprocessed" sentinel in
      // the NLP worker. Once sentiment runs, the label is set and the
      // article is considered processed.
    },
  });

  return true;
}

/**
 * Batch-parallel article upsert. Processes `articles` in concurrent
 * chunks of BATCH_SIZE so we don't hold a single DB connection for the
 * whole sequential loop. Each `upsertArticle` call is independent
 * (keyed on a unique urlHash), so parallelism is safe — the only
 * shared resource is the Prisma connection pool (default 10), and a
 * chunk size of 5 leaves headroom for the NLP worker + API routes.
 *
 * Failures are isolated: one article that throws (e.g. a transient
 * Postgres error) is logged and skipped, the rest of the batch still
 * completes. Returns the count of newly-created rows.
 *
 * Task: perf-parallel-upserts (crawler-technique objective #13)
 */
const UPSERT_BATCH_SIZE = 5;

async function upsertArticlesBatch(
  articles: ScrapedArticle[],
  companyId: string,
): Promise<{ found: number; created: number }> {
  let created = 0;
  for (let i = 0; i < articles.length; i += UPSERT_BATCH_SIZE) {
    const chunk = articles.slice(i, i + UPSERT_BATCH_SIZE);
    const results = await Promise.allSettled(
      chunk.map((a) => upsertArticle(a, companyId)),
    );
    for (const r of results) {
      if (r.status === "fulfilled" && r.value) created++;
      else if (r.status === "rejected") {
        const msg =
          r.reason instanceof Error ? r.reason.message : String(r.reason);
        logWarn("scraper-worker", `upsertArticle rejected: ${msg}`);
      }
    }
  }
  return { found: articles.length, created };
}

/**
 * Write a ScraperLog row for a single source. Wrapped in try/catch so
 * logging failures never crash the worker — the articles themselves
 * have already been persisted by the time we get here.
 */
async function logScrape(params: {
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  status: "ok" | "error";
  articlesFound: number;
  articlesNew: number;
  durationMs: number;
  errorMessage?: string;
}): Promise<void> {
  try {
    await prisma.scraperLog.create({
      data: {
        sourceId: params.sourceId,
        sourceName: params.sourceName,
        sourceUrl: params.sourceUrl,
        status: params.status,
        articlesFound: params.articlesFound,
        articlesNew: params.articlesNew,
        durationMs: params.durationMs,
        errorMessage: params.errorMessage,
        completedAt: new Date(),
      },
    });
  } catch (err) {
    logError("scraper-worker", `ScraperLog write failed: ${err instanceof Error ? err.message : err}`);
  }
}

// ─── JOB HANDLER ─────────────────────────────────────────────────

async function processScraperJob(
  job: Job<ScraperJobPayload>,
): Promise<ScraperJobResult> {
  const { companyName, companySlug } = job.data;
  const startedAt = Date.now();

  logInfo(
    "scraper-worker",
    `▶ job ${job.id} — scraping "${companyName}" (slug: ${companySlug})`,
  );

  const company = await ensureCompany({ companyName, companySlug });
  let articlesFound = 0;
  let articlesNew = 0;

  // ─── 1. GOOGLE NEWS RSS ──────────────────────────────────────
  try {
    const t0 = Date.now();
    const googleArticles = await scrapeGoogleNewsRSS({
      query: companyName,
      language: "fr",
      country: "MA",
      maxArticles: 50,
    });

    // Batch-parallel upsert (5 concurrent) instead of sequential await.
    const { found: gFound, created: gNew } = await upsertArticlesBatch(
      googleArticles,
      company.id,
    );

    articlesFound += gFound;
    articlesNew += gNew;

    await logScrape({
      sourceId: "google-news-ma",
      sourceName: "Google News Morocco",
      sourceUrl: `https://news.google.com/rss/search?q=${encodeURIComponent(companyName)}`,
      status: "ok",
      articlesFound: gFound,
      articlesNew: gNew,
      durationMs: Date.now() - t0,
    });

    logInfo("scraper-worker", `Google News: ${gFound} found, ${gNew} new`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError("scraper-worker", `Google News scrape failed: ${msg}`);
    await logScrape({
      sourceId: "google-news-ma",
      sourceName: "Google News Morocco",
      sourceUrl: `https://news.google.com/rss/search?q=${encodeURIComponent(companyName)}`,
      status: "error",
      articlesFound: 0,
      articlesNew: 0,
      durationMs: 0,
      errorMessage: msg,
    });
  }

  // ─── 2. DIRECT RSS SOURCES ───────────────────────────────────
  // Loop through every active direct RSS source (TelQuel, Medias24,
  // Bank Al-Maghrib, …). Each feed is scraped sequentially with the
  // per-source rate-limit honoured so we don't get IP-banned.
  const directSources = RSS_SOURCES.filter(
    (s) => s.isActive && s.url.includes("://") && !s.url.includes("news.google.com"),
  );

  for (const src of directSources) {
    const t0 = Date.now();
    try {
      const articles = await scrapeDirectRSS(src.url, companyName, {
        maxArticles: 30,
        rateLimitMs: src.rateLimitMs,
      });

      // Batch-parallel upsert (5 concurrent).
      const { found: dFound, created: dNew } = await upsertArticlesBatch(
        articles,
        company.id,
      );

      articlesFound += dFound;
      articlesNew += dNew;

      await logScrape({
        sourceId: src.id,
        sourceName: src.name,
        sourceUrl: src.url,
        status: "ok",
        articlesFound: dFound,
        articlesNew: dNew,
        durationMs: Date.now() - t0,
      });

      logInfo("scraper-worker", `${src.name}: ${dFound} found, ${dNew} new`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logError("scraper-worker", `${src.name} scrape failed: ${msg}`);
      await logScrape({
        sourceId: src.id,
        sourceName: src.name,
        sourceUrl: src.url,
        status: "error",
        articlesFound: 0,
        articlesNew: 0,
        durationMs: Date.now() - t0,
        errorMessage: msg,
      });
    }
  }

  const elapsed = Date.now() - startedAt;
  logInfo("scraper-worker", `✔ job ${job.id} done in ${elapsed}ms — ${articlesFound} found / ${articlesNew} new`);

  return { articlesFound, articlesNew };
}

// ─── WORKER INSTANCE ─────────────────────────────────────────────
// Exported so a long-running bootstrap script (workers/start.ts) can
// reference it for graceful shutdown. The Worker binds to the same
// Redis connection as the queues — required by BullMQ.

export const scraperWorker = new Worker<ScraperJobPayload, ScraperJobResult>(
  QUEUE_NAMES.scraper,
  processScraperJob,
  {
    connection: redisConnection,
    // Scraping is network-bound + I/O-bound — a modest concurrency
    // cap keeps the worker from melting Upstash's REST gateway or
    // hammering Moroccan publishers' RSS endpoints.
    concurrency: 3,
  },
);

scraperWorker.on("completed", (job, result) => {
  logInfo("scraper-worker", `✓ job ${job.id} completed — ${result ?? "(no result)"}`);
});

scraperWorker.on("failed", (job, err) => {
  logError("scraper-worker", `✗ job ${job?.id ?? "?"} failed: ${err.message}`);
});

scraperWorker.on("error", (err) => {
  logError("scraper-worker", `worker error: ${err.message}`);
});
