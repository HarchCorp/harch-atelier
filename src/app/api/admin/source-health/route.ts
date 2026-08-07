// ═══════════════════════════════════════════════════════════════
//  /api/admin/source-health  — Media Monitoring source health
//
//  Two methods:
//
//  GET  /api/admin/source-health
//    Returns per-source health for every feed in MOROCCAN_FEEDS:
//      • name, url, language, category, region, fetchKind, isActive, notes
//      • lastScrapeAt, lastSuccessAt, lastErrorAt, lastErrorMessage
//      • articlesIngested (count from Article table by source name)
//      • errorCount24h, errorCount7d
//      • avgDurationMs (last 10 runs)
//      • status: active | stale | erroring | dead | never
//    Admin only (session.user.role === 'admin').
//
//  POST /api/admin/source-health?source=Hespress
//    Runs a single-feed scrape for the named source — fetch, parse,
//    NLP, company match, insert new articles into the DB, and write
//    a ScraperLog row. Returns a summary so the admin UI can show
//    the result inline.
//    Admin only (session.user.role === 'admin').
//
//  Task ID: signal-media-monitoring
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { MOROCCAN_FEEDS, scrapeFeed } from "@/lib/scrapers/rss-scraper";
import { matchArticleToCompanies } from "@/lib/scrapers/company-matcher";
import {
  analyzeSentiment,
  extractEntities,
  detectLanguage as detectDarijaLanguage,
} from "@/lib/harchiq/darija";
import { logInfo, logWarn } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ─── TYPES ────────────────────────────────────────────────────────

export type SourceStatus =
  | "active"      // last scrape within 6h, last status = ok
  | "stale"       // last scrape > 6h ago (or never) but feed is active
  | "erroring"    // last scrape status = error
  | "dead"        // isActive = false (intentionally disabled)
  | "never";      // no ScraperLog row exists yet

interface SourceHealth {
  name: string;
  url: string;
  language: "ar" | "fr" | "en";
  category: string;
  region?: string;
  fetchKind?: "direct" | "google-news";
  isActive: boolean;
  notes?: string;

  status: SourceStatus;
  lastScrapeAt: string | null;
  lastSuccessAt: string | null;
  lastErrorAt: string | null;
  lastErrorMessage: string | null;
  lastDurationMs: number | null;
  lastArticlesFound: number;
  lastArticlesNew: number;

  articlesIngested: number;       // total in DB for this source
  errorCount24h: number;
  errorCount7d: number;
  avgDurationMs: number | null;   // mean of last 10 ScraperLog rows
}

interface SourceHealthSummary {
  totalSources: number;
  activeSources: number;
  staleSources: number;
  erroringSources: number;
  deadSources: number;
  neverSources: number;
  totalArticlesIngested: number;
  feedsDirect: number;
  feedsGoogleNews: number;
}

interface TestFeedResult {
  success: boolean;
  source: string;
  articlesFound: number;
  articlesNew: number;
  articlesMatched: number;
  durationMs: number;
  firstTitles: string[];
  error?: string;
  scraperLogId?: string;
}

// ─── HELPERS ──────────────────────────────────────────────────────

const STALE_THRESHOLD_MS = 6 * 60 * 60 * 1000; // 6 hours

function sourceIdOf(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "-");
}

function classifyStatus(opts: {
  isActive: boolean;
  hasLogs: boolean;
  lastStatus: string | null;
  lastStartedAt: Date | null;
}): SourceStatus {
  if (!opts.isActive) return "dead";
  if (!opts.hasLogs || !opts.lastStartedAt) return "never";
  if (opts.lastStatus === "error") return "erroring";
  const ageMs = Date.now() - opts.lastStartedAt.getTime();
  if (ageMs > STALE_THRESHOLD_MS) return "stale";
  return "active";
}

// ─── GET — per-source health ──────────────────────────────────────

export async function GET() {
  // 1. AUTH — admin only
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin" && session.user?.role !== "super_admin") {
    return NextResponse.json(
      { error: "Forbidden — admin only" },
      { status: 403 },
    );
  }

  try {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Parallel queries:
    //  a) all recent ScraperLog rows (last 7d, capped) — index by sourceId in JS
    //  b) article counts grouped by source
    //  c) error counts in 24h and 7d
    //  d) total article count for the headline KPI
    const [recentLogs, articleCounts, errorCounts24h, errorCounts7d, totalArticles] =
      await Promise.all([
        prisma.scraperLog.findMany({
          where: { startedAt: { gte: since7d } },
          orderBy: { startedAt: "desc" },
          take: 1000, // generous cap, then dedupe in JS
        }),
        prisma.article.groupBy({
          by: ["source"],
          _count: { _all: true },
        }),
        prisma.scraperLog.groupBy({
          by: ["sourceName"],
          where: { status: "error", startedAt: { gte: since24h } },
          _count: { _all: true },
        }),
        prisma.scraperLog.groupBy({
          by: ["sourceName"],
          where: { status: "error", startedAt: { gte: since7d } },
          _count: { _all: true },
        }),
        prisma.article.count({
          where: { source: { in: MOROCCAN_FEEDS.map((f) => f.name) } },
        }),
      ]);

    // Index logs by sourceId → keep most recent + last success + last error
    type LogRow = (typeof recentLogs)[number];
    interface LogAgg {
      latest: LogRow;
      lastSuccess: LogRow | null;
      lastError: LogRow | null;
      last10: LogRow[]; // for avgDurationMs
    }
    const logsBySource = new Map<string, LogAgg>();
    for (const log of recentLogs) {
      const existing = logsBySource.get(log.sourceId);
      if (!existing) {
        logsBySource.set(log.sourceId, {
          latest: log,
          lastSuccess: log.status === "ok" ? log : null,
          lastError: log.status === "error" ? log : null,
          last10: [log],
        });
      } else {
        if (!existing.lastSuccess && log.status === "ok") {
          existing.lastSuccess = log;
        }
        if (!existing.lastError && log.status === "error") {
          existing.lastError = log;
        }
        if (existing.last10.length < 10) existing.last10.push(log);
      }
    }

    const articleCountMap = new Map<string, number>();
    for (const row of articleCounts) {
      articleCountMap.set(row.source, row._count._all);
    }
    const err24hMap = new Map<string, number>();
    for (const row of errorCounts24h) {
      err24hMap.set(row.sourceName, row._count._all);
    }
    const err7dMap = new Map<string, number>();
    for (const row of errorCounts7d) {
      err7dMap.set(row.sourceName, row._count._all);
    }

    // Build per-source health
    const sources: SourceHealth[] = MOROCCAN_FEEDS.map((feed) => {
      const sid = sourceIdOf(feed.name);
      const agg = logsBySource.get(sid);
      const latest = agg?.latest;
      const isActive = feed.isActive !== false; // default true

      const status = classifyStatus({
        isActive,
        hasLogs: !!latest,
        lastStatus: latest?.status ?? null,
        lastStartedAt: latest?.startedAt ?? null,
      });

      const last10Durations = (agg?.last10 ?? [])
        .map((l) => l.durationMs)
        .filter((d): d is number => typeof d === "number");
      const avgDurationMs =
        last10Durations.length > 0
          ? Math.round(
              last10Durations.reduce((a, b) => a + b, 0) /
                last10Durations.length,
            )
          : null;

      return {
        name: feed.name,
        url: feed.url,
        language: feed.language,
        category: feed.category,
        region: feed.region,
        fetchKind: feed.fetchKind,
        isActive,
        notes: feed.notes,
        status,
        lastScrapeAt: latest?.startedAt.toISOString() ?? null,
        lastSuccessAt: agg?.lastSuccess?.startedAt.toISOString() ?? null,
        lastErrorAt: agg?.lastError?.startedAt.toISOString() ?? null,
        lastErrorMessage: agg?.lastError?.errorMessage ?? null,
        lastDurationMs: latest?.durationMs ?? null,
        lastArticlesFound: latest?.articlesFound ?? 0,
        lastArticlesNew: latest?.articlesNew ?? 0,
        articlesIngested: articleCountMap.get(feed.name) || 0,
        errorCount24h: err24hMap.get(feed.name) || 0,
        errorCount7d: err7dMap.get(feed.name) || 0,
        avgDurationMs,
      };
    });

    // Summary
    const summary: SourceHealthSummary = {
      totalSources: sources.length,
      activeSources: sources.filter((s) => s.status === "active").length,
      staleSources: sources.filter((s) => s.status === "stale").length,
      erroringSources: sources.filter((s) => s.status === "erroring").length,
      deadSources: sources.filter((s) => s.status === "dead").length,
      neverSources: sources.filter((s) => s.status === "never").length,
      totalArticlesIngested: totalArticles,
      feedsDirect: sources.filter((s) => s.fetchKind === "direct").length,
      feedsGoogleNews: sources.filter((s) => s.fetchKind === "google-news").length,
    };

    return NextResponse.json({ success: true, summary, sources });
  } catch (err) {
    console.error("[/api/admin/source-health] GET error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// ─── POST — test a single feed (admin "Test feed" button) ────────

export async function POST(req: NextRequest) {
  // 1. AUTH — admin only
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin" && session.user?.role !== "super_admin") {
    return NextResponse.json(
      { error: "Forbidden — admin only" },
      { status: 403 },
    );
  }

  // 2. Find the feed by name (exact match first, then case-insensitive)
  const sourceName = req.nextUrl.searchParams.get("source") || "";
  if (!sourceName) {
    return NextResponse.json(
      { success: false, error: "Missing ?source= feed name" },
      { status: 400 },
    );
  }

  const feed =
    MOROCCAN_FEEDS.find((f) => f.name === sourceName) ||
    MOROCCAN_FEEDS.find(
      (f) => f.name.toLowerCase() === sourceName.toLowerCase(),
    );

  if (!feed) {
    return NextResponse.json(
      {
        success: false,
        error: `Unknown source "${sourceName}". Available: ${MOROCCAN_FEEDS.map((f) => f.name).join(", ")}`,
      },
      { status: 404 },
    );
  }

  const startMs = Date.now();
  logInfo("source-health", `Admin-triggered single-feed scrape: ${feed.name}`);

  // 3. Fetch + parse
  let articles: Awaited<ReturnType<typeof scrapeFeed>> = [];
  let fetchError: string | undefined;
  try {
    articles = await scrapeFeed(feed);
  } catch (err) {
    fetchError = err instanceof Error ? err.message : String(err);
    articles = [];
  }

  const durationMs = Date.now() - startMs;
  const result: TestFeedResult = {
    success: !fetchError,
    source: feed.name,
    articlesFound: articles.length,
    articlesNew: 0,
    articlesMatched: 0,
    durationMs,
    firstTitles: articles.slice(0, 3).map((a) => a.title),
  };
  if (fetchError) result.error = fetchError;

  // 4. Dedup + NLP + company match + DB insert (only if we got articles)
  if (articles.length > 0) {
    try {
      const hashes = articles.map((a) => a.urlHash);
      const existing = await prisma.article.findMany({
        where: { urlHash: { in: hashes } },
        select: { urlHash: true },
      });
      const existingSet = new Set(existing.map((a) => a.urlHash));
      const newArticles = articles.filter((a) => !existingSet.has(a.urlHash));

      let articlesNew = 0;
      let articlesMatched = 0;

      for (const article of newArticles) {
        try {
          const nlpInput = `${article.title} ${article.description}`;
          const detected = detectDarijaLanguage(nlpInput);
          const sentiment = analyzeSentiment(nlpInput, detected.language);
          const entities = extractEntities(nlpInput, detected.language);

          const matchedCompanyIds = await matchArticleToCompanies(
            article.title,
            article.description,
          );
          if (matchedCompanyIds.length > 0) {
            articlesMatched++;
          }
          const companyId = matchedCompanyIds.length > 0 ? matchedCompanyIds[0] : null;

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
              sourceId: sourceIdOf(feed.name),
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
        } catch (err) {
          logWarn("source-health", `Article insert failed: ${(err as Error).message}`, {
            source: feed.name,
            url: article.url,
          });
        }
      }

      result.articlesNew = articlesNew;
      result.articlesMatched = articlesMatched;
    } catch (err) {
      result.error = `Ingest failed: ${err instanceof Error ? err.message : String(err)}`;
    }
  }

  // 5. Write a ScraperLog row (status=ok if fetch succeeded, error otherwise)
  try {
    const log = await prisma.scraperLog.create({
      data: {
        sourceId: sourceIdOf(feed.name),
        sourceName: feed.name,
        sourceUrl: feed.url,
        status: fetchError ? "error" : "ok",
        articlesFound: articles.length,
        articlesNew: result.articlesNew,
        errorMessage: fetchError || null,
        durationMs,
        completedAt: new Date(),
      },
    });
    result.scraperLogId = log.id;
  } catch (err) {
    logWarn("source-health", `ScraperLog write failed: ${(err as Error).message}`);
  }

  logInfo(
    "source-health",
    `Test feed "${feed.name}": ${articles.length} found, ${result.articlesNew} new, ${result.articlesMatched} matched in ${durationMs}ms`,
  );

  return NextResponse.json({ success: true, result });
}
