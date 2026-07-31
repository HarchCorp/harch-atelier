// ═══════════════════════════════════════════════════════════════
//  RUN RSS SCRAPE — shared scrape runner
//
//  Single function that:
//   1. Fetches all 10 Moroccan media RSS feeds in parallel
//   2. Dedupes against existing articles (by urlHash)
//   3. Runs the Darija NLP pipeline on new articles
//   4. Matches articles to companies by name + aliases
//   5. Inserts new articles into the DB
//   6. Writes a ScraperLog row per feed
//
//  Called by:
//   • /api/cron/scrape-rss    (CRON_SECRET-secured, Vercel Cron every 30 min)
//   • /api/admin/scrape-now   (admin-session-secured, "Scrape now" button)
//
//  Task ID: real-rss-scrapers
// ═══════════════════════════════════════════════════════════════

import { prisma } from "@/lib/db";
import { logInfo, logWarn, logError } from "@/lib/logger";
import {
  MOROCCAN_FEEDS,
  scrapeFeed,
  type RSSFeed,
  type ScrapedArticle,
} from "@/lib/scrapers/rss-scraper";
import { matchArticleToCompanies } from "@/lib/scrapers/company-matcher";
import {
  analyzeSentiment,
  extractEntities,
  detectLanguage as detectDarijaLanguage,
} from "@/lib/harchiq/darija";

// ─── TYPES ────────────────────────────────────────────────────────

export interface FeedScrapeResult {
  feed: RSSFeed;
  articles: ScrapedArticle[];
  error?: string;
  durationMs: number;
  articlesNew: number;
  articlesMatched: number;
}

export interface ScrapeSummary {
  feedsProcessed: number;
  articlesFound: number;
  articlesNew: number;
  articlesMatched: number;
  errors: { feed: string; message: string }[];
  startedAt: string;
  completedAt: string;
  durationMs: number;
  perFeed: Array<{
    name: string;
    url: string;
    found: number;
    new: number;
    matched: number;
    durationMs: number;
    error?: string;
  }>;
}

// ─── MAIN ─────────────────────────────────────────────────────────

/**
 * Run a full RSS scrape cycle across all 10 Moroccan feeds.
 *
 * Never throws — every feed is wrapped in try/catch and every article
 * insert is wrapped in try/catch. Returns a structured summary.
 */
export async function runRssScrape(): Promise<ScrapeSummary> {
  const startedAt = new Date();
  const startMs = Date.now();
  logInfo("scrape-rss", `Starting RSS scrape — ${MOROCCAN_FEEDS.length} feeds`, {
    feeds: MOROCCAN_FEEDS.map((f) => f.name),
  });

  // 1. SCRAPE ALL FEEDS IN PARALLEL
  const feedResults = await Promise.allSettled(
    MOROCCAN_FEEDS.map(async (feed): Promise<FeedScrapeResult> => {
      const feedStart = Date.now();
      try {
        const articles = await scrapeFeed(feed);
        return {
          feed,
          articles,
          durationMs: Date.now() - feedStart,
          articlesNew: 0,
          articlesMatched: 0,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          feed,
          articles: [],
          error: message,
          durationMs: Date.now() - feedStart,
          articlesNew: 0,
          articlesMatched: 0,
        };
      }
    }),
  );

  const results: FeedScrapeResult[] = feedResults.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    return {
      feed: MOROCCAN_FEEDS[i],
      articles: [],
      error: r.reason instanceof Error ? r.reason.message : String(r.reason),
      durationMs: 0,
      articlesNew: 0,
      articlesMatched: 0,
    };
  });

  // 2. PER-FEED: DEDUP + NLP + COMPANY MATCH + DB INSERT + SCRAPERLOG
  let articlesFoundTotal = 0;
  let articlesNewTotal = 0;
  let articlesMatchedTotal = 0;
  const errors: { feed: string; message: string }[] = [];
  const perFeed: ScrapeSummary["perFeed"] = [];

  for (const result of results) {
    const { feed, articles, error, durationMs } = result;
    articlesFoundTotal += articles.length;

    if (error) {
      errors.push({ feed: feed.name, message: error });
      logWarn("scrape-rss", `Feed ${feed.name} errored: ${error}`);
    }

    let articlesNew = 0;
    let articlesMatched = 0;

    if (articles.length > 0) {
      // 2a. BULK DEDUP — fetch all existing urlHashes for this feed's
      //     articles in ONE query (much faster than N individual checks).
      const hashes = articles.map((a) => a.urlHash);
      const existing = await prisma.article.findMany({
        where: { urlHash: { in: hashes } },
        select: { urlHash: true },
      });
      const existingSet = new Set(existing.map((a) => a.urlHash));
      const newArticles = articles.filter((a) => !existingSet.has(a.urlHash));

      // 2b. PER-NEW-ARTICLE: NLP + COMPANY MATCH + INSERT
      for (const article of newArticles) {
        try {
          const nlpInput = `${article.title} ${article.description}`;

          // ── NLP: detectLanguage → analyzeSentiment → extractEntities ──
          const detected = detectDarijaLanguage(nlpInput);
          const sentiment = analyzeSentiment(nlpInput, detected.language);
          const entities = extractEntities(nlpInput, detected.language);

          // ── COMPANY MATCHING ──
          const matchedCompanyIds = await matchArticleToCompanies(
            article.title,
            article.description,
          );
          if (matchedCompanyIds.length > 0) {
            articlesMatched++;
            articlesMatchedTotal++;
          }

          const companyId = matchedCompanyIds.length > 0 ? matchedCompanyIds[0] : null;

          // ── INSERT ──
          const entitySummary =
            entities.people.length > 0 ||
            entities.organizations.length > 0 ||
            entities.locations.length > 0
              ? `People: ${entities.people.slice(0, 5).join(", ")} | Orgs: ${entities.organizations.slice(0, 5).join(", ")} | Loc: ${entities.locations.slice(0, 5).join(", ")}`
              : null;

          await prisma.article.create({
            data: {
              companyId,
              title: article.title.slice(0, 500),
              url: article.url,
              urlHash: article.urlHash,
              source: feed.name,
              sourceId: feed.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
              publishedAt: article.publishedAt,
              content: article.content || article.description || null,
              summary: entitySummary || article.description.slice(0, 500) || null,
              language: article.language,
              sentimentScore: sentiment.score,
              sentimentLabel: sentiment.label,
              relevanceScore: matchedCompanyIds.length > 0 ? 0.8 : 0.3,
              processed: true,
            },
          });
          articlesNew++;
          articlesNewTotal++;
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logWarn("scrape-rss", `Article insert failed: ${message}`, {
            feed: feed.name,
            url: article.url,
            urlHash: article.urlHash,
          });
        }
      }
    }

    result.articlesNew = articlesNew;
    result.articlesMatched = articlesMatched;

    // 2c. SCRAPERLOG — one row per feed per run.
    try {
      await prisma.scraperLog.create({
        data: {
          sourceId: feed.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          sourceName: feed.name,
          sourceUrl: feed.url,
          status: error ? "error" : "ok",
          articlesFound: articles.length,
          articlesNew,
          errorMessage: error || null,
          durationMs,
          completedAt: new Date(),
        },
      });
    } catch (logErr) {
      logError("scrape-rss", `ScraperLog write failed: ${(logErr as Error).message}`);
    }

    perFeed.push({
      name: feed.name,
      url: feed.url,
      found: articles.length,
      new: articlesNew,
      matched: articlesMatched,
      durationMs,
      error: error || undefined,
    });

    logInfo(
      "scrape-rss",
      `Feed ${feed.name}: ${articles.length} found, ${articlesNew} new, ${articlesMatched} matched`,
      {
        feed: feed.name,
        found: articles.length,
        new: articlesNew,
        matched: articlesMatched,
        durationMs,
        error: error || null,
      },
    );
  }

  const completedAt = new Date();
  const durationMs = Date.now() - startMs;
  const summary: ScrapeSummary = {
    feedsProcessed: MOROCCAN_FEEDS.length,
    articlesFound: articlesFoundTotal,
    articlesNew: articlesNewTotal,
    articlesMatched: articlesMatchedTotal,
    errors,
    startedAt: startedAt.toISOString(),
    completedAt: completedAt.toISOString(),
    durationMs,
    perFeed,
  };

  logInfo(
    "scrape-rss",
    `Done — ${articlesNewTotal} new / ${articlesFoundTotal} found / ${articlesMatchedTotal} matched in ${durationMs}ms`,
    summary as unknown as Record<string, unknown>,
  );

  return summary;
}
