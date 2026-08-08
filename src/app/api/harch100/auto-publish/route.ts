import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logInfo, logError } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

// ═══════════════════════════════════════════════════════════════
//  GET /api/harch100/auto-publish
//
//  Front 3: Automated Harch 100 — generates the monthly ranking.
//
//  Runs on the 1st of each month at 06:00 UTC via Vercel Cron.
//  Computes the reputation score for all tracked companies based
//  on the last 30 days of articles, sorts them, and stores the
//  ranking as a published snapshot.
//
//  The ranking is publicly visible at /atelier/harch-100 — this
//  creates the "effect of authority": companies that drop in the
//  ranking feel pressure from their boards.
//
//  Auth: CRON_SECRET header.
// ═══════════════════════════════════════════════════════════════

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const periodStart = new Date(now.getTime() - 30 * 86400000);

    // 1. Get all tracked companies with their article stats for the last 30 days
    const companies = await prisma.company.findMany({
      where: { isDemo: false },
      select: {
        id: true,
        name: true,
        slug: true,
        sector: true,
        articles: {
          where: { publishedAt: { gte: periodStart } },
          select: {
            sentimentScore: true,
            sentimentLabel: true,
            source: true,
          },
        },
      },
    });

    // 2. Compute reputation score for each company
    const ranked = companies
      .map((company) => {
        const articles = company.articles;
        const totalArticles = articles.length;
        if (totalArticles === 0) return null;

        const negativeCount = articles.filter((a) => a.sentimentLabel === "negative").length;
        const positiveCount = articles.filter((a) => a.sentimentLabel === "positive").length;
        const avgSentiment = articles.reduce((s, a) => s + (a.sentimentScore ?? 0), 0) / totalArticles;
        const uniqueSources = new Set(articles.map((a) => a.source)).size;

        // Reputation score formula (0-100):
        // 40% sentiment + 25% positive ratio + 15% volume + 10% source diversity + 10% recency
        const sentimentScore = Math.max(0, Math.min(100, (avgSentiment + 1) * 50));
        const positiveRatio = (positiveCount / totalArticles) * 100;
        const volumeScore = Math.min(100, totalArticles * 2);
        const diversityScore = Math.min(100, uniqueSources * 10);
        const recencyScore = 50; // simplified — all articles are from last 30 days

        const reputationScore = Math.round(
          sentimentScore * 0.4 + positiveRatio * 0.25 + volumeScore * 0.15 + diversityScore * 0.1 + recencyScore * 0.1,
        );

        return {
          companyId: company.id,
          companyName: company.name,
          companySlug: company.slug,
          sector: company.sector,
          rank: 0, // assigned after sorting
          reputationScore,
          totalArticles,
          negativeCount,
          positiveCount,
          avgSentiment: parseFloat(avgSentiment.toFixed(3)),
          uniqueSources,
          periodStart: periodStart.toISOString(),
          periodEnd: now.toISOString(),
        };
      })
      .filter((c): c is NonNullable<typeof c> => c !== null)
      .sort((a, b) => b.reputationScore - a.reputationScore)
      .map((c, i) => ({ ...c, rank: i + 1 }));

    // 3. Store the ranking snapshot
    // Period is "YYYY-MM" for the current month (UTC). One snapshot
    // per month max — upsert updates the existing row if the cron is
    // re-run the same month. `publishedAt` is set immediately because
    // the auto-publish cron is the public-publication path.
    const period = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

    // Prisma's Json field accepts InputJsonValue — cast through unknown
    // because the ranked array includes extra fields (companySlug,
    // avgSentiment, etc.) beyond the documented minimum set.
    const rankingsJson = ranked.slice(0, 100) as unknown as import("@prisma/client").Prisma.InputJsonValue;

    const snapshot = await prisma.harch100Snapshot.upsert({
      where: { period },
      create: {
        period,
        rankings: rankingsJson,
        generatedAt: now,
        publishedAt: now,
      },
      update: {
        rankings: rankingsJson,
        generatedAt: now,
        publishedAt: now,
      },
    });

    logInfo("harch100", `Generated ranking: ${ranked.length} companies. Top 5:`);
    ranked.slice(0, 5).forEach((c) => {
      logInfo("harch100", `  #${c.rank} ${c.companyName} — score: ${c.reputationScore} (${c.totalArticles} articles, ${c.positiveCount} pos, ${c.negativeCount} neg)`);
    });
    logInfo("harch100", `Snapshot persisted: period=${period} id=${snapshot.id}`);

    return NextResponse.json({
      ok: true,
      snapshotId: snapshot.id,
      period,
      generatedAt: now.toISOString(),
      publishedAt: snapshot.publishedAt?.toISOString() ?? null,
      totalCompanies: ranked.length,
      top100: ranked.slice(0, 100),
      top5: ranked.slice(0, 5),
    });
  } catch (err) {
    logError("harch100", `Error: ${err}`);
    return NextResponse.json(
      { error: "Harch 100 generation failed", detail: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
