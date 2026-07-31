// ═══════════════════════════════════════════════════════════════
//  GET /api/admin/scraper-status
//
//  Returns per-feed scraper health for the admin "Data Sources" panel:
//   • Last scrape time per feed (from ScraperLog)
//   • Articles ingested per feed (count grouped by source)
//   • Error count (last 24h ScraperLog rows with status='error')
//   • Total real articles in DB
//   • Real vs seed split (articles with a urlHash that came from a real
//     feed — identified by source ∈ MOROCCAN_FEEDS names)
//
//  Auth: admin only.
//
//  Task ID: real-rss-scrapers
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { MOROCCAN_FEEDS } from "@/lib/scrapers/rss-scraper";

export const dynamic = "force-dynamic";

interface FeedStatus {
  name: string;
  url: string;
  language: "ar" | "fr" | "en";
  category: "news" | "business" | "tech";
  status: "ok" | "error" | "never";
  lastScrapeAt: string | null;
  lastDurationMs: number | null;
  lastArticlesFound: number;
  lastArticlesNew: number;
  lastError: string | null;
  articlesIngested: number; // total in DB for this source
  errorCount24h: number;
}

export async function GET() {
  // 1. AUTH — admin only
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden — admin only" },
      { status: 403 },
    );
  }

  try {
    // 2. PARALLEL QUERIES
    //    a) latest ScraperLog per feed (raw SQL — Prisma doesn't have
    //       a clean "distinct on" pattern for "latest row per sourceId").
    //    b) article counts grouped by source.
    //    c) error counts in the last 24h.
    //    d) total article count (for the headline KPI).
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [latestLogs, articleCounts, errorCounts, totalArticles, totalRealArticles, last24hNew] =
      await Promise.all([
        // a) Latest ScraperLog per sourceId — use Prisma findMany with
        //    a window-ish pattern: pull the most recent N logs per
        //    source by grouping in JS after fetching recent rows.
        prisma.scraperLog.findMany({
          where: {
            startedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
          orderBy: { startedAt: "desc" },
          take: 500, // generous cap, then dedupe in JS
        }),
        // b) Article counts grouped by source
        prisma.article.groupBy({
          by: ["source"],
          _count: { _all: true },
        }),
        // c) Error count per source in the last 24h
        prisma.scraperLog.groupBy({
          by: ["sourceName"],
          where: {
            status: "error",
            startedAt: { gte: since24h },
          },
          _count: { _all: true },
        }),
        // d) Total articles
        prisma.article.count(),
        // e) Real articles (from real-feeds sources)
        prisma.article.count({
          where: {
            source: { in: MOROCCAN_FEEDS.map((f) => f.name) },
          },
        }),
        // f) New articles in last 24h (any source)
        prisma.article.count({
          where: { scrapedAt: { gte: since24h } },
        }),
      ]);

    // 3. BUILD PER-FEED STATUS
    //    Index latestLogs by sourceId so we can grab the most recent
    //    row per feed in O(1).
    type ScraperLogRow = (typeof latestLogs)[number];
    const latestBySource = new Map<string, ScraperLogRow>();
    for (const log of latestLogs) {
      if (!latestBySource.has(log.sourceId)) {
        latestBySource.set(log.sourceId, log);
      }
    }

    const articleCountMap = new Map<string, number>();
    for (const row of articleCounts) {
      articleCountMap.set(row.source, row._count._all);
    }

    const errorCountMap = new Map<string, number>();
    for (const row of errorCounts) {
      errorCountMap.set(row.sourceName, row._count._all);
    }

    const feeds: FeedStatus[] = MOROCCAN_FEEDS.map((feed) => {
      const sourceId = feed.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
      const latest = latestBySource.get(sourceId);
      const ingested = articleCountMap.get(feed.name) || 0;
      const errCount = errorCountMap.get(feed.name) || 0;

      return {
        name: feed.name,
        url: feed.url,
        language: feed.language,
        category: feed.category,
        status: latest
          ? latest.status === "error"
            ? "error"
            : "ok"
          : "never",
        lastScrapeAt: latest ? latest.startedAt.toISOString() : null,
        lastDurationMs: latest?.durationMs ?? null,
        lastArticlesFound: latest?.articlesFound ?? 0,
        lastArticlesNew: latest?.articlesNew ?? 0,
        lastError: latest?.errorMessage ?? null,
        articlesIngested: ingested,
        errorCount24h: errCount,
      };
    });

    // 4. SUMMARY
    const summary = {
      feedsActive: feeds.filter((f) => f.status === "ok").length,
      feedsError: feeds.filter((f) => f.status === "error").length,
      feedsNever: feeds.filter((f) => f.status === "never").length,
      totalFeeds: feeds.length,
      totalArticles,
      totalRealArticles,
      totalSeedArticles: totalArticles - totalRealArticles,
      newArticles24h: last24hNew,
    };

    return NextResponse.json({
      success: true,
      summary,
      feeds,
    });
  } catch (err) {
    console.error("[/api/admin/scraper-status] error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
