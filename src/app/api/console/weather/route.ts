import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";

// ═══════════════════════════════════════════════════════════════
//  GET /api/console/weather
//
//  Returns the "Weather" data for the Console:
//  - Overall reputation score (the "temperature")
//  - Sky description (sentiment metaphor)
//  - Breakdown (positive / neutral / negative %)
//  - Today's signals (recent articles)
//  - Main sources (media outlets with article counts)
//
//  Auth: requires session (Console is private)
//
//  Query params:
//  - company: company slug (default: first company in DB)
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Auth check — STRICT (no anonymous access)
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ACCOUNT TYPE GATE — only enterprise + investor accounts can see
  // company reputation data. Traders monitor markets, not companies.
  const allowedTypes = ["enterprise", "investor"];
  if (!allowedTypes.includes(session.user?.accountType || "")) {
    return NextResponse.json(
      { error: "Forbidden — this data is for enterprise and investor accounts only" },
      { status: 403 }
    );
  }

  try {
    const url = new URL(req.url);
    const companySlug = url.searchParams.get("company");

    // Get company (specified or first)
    const company = companySlug
      ? await prisma.company.findUnique({ where: { slug: companySlug } })
      : await prisma.company.findFirst({ orderBy: { createdAt: "asc" } });

    if (!company) {
      return NextResponse.json(
        { error: "No company found. Run the seed script first." },
        { status: 404 }
      );
    }

    // Get latest reputation score
    const reputationScore = await prisma.reputationScore.findFirst({
      where: { companyId: company.id },
      orderBy: { calculatedAt: "desc" },
    });

    // Get recent articles (last 30 days) for sentiment breakdown
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentArticles = await prisma.article.findMany({
      where: {
        companyId: company.id,
        publishedAt: { gte: thirtyDaysAgo },
      },
      orderBy: { publishedAt: "desc" },
      take: 50,
    });

    // Calculate sentiment breakdown
    const total = recentArticles.length;
    const positive = recentArticles.filter((a) => a.sentimentLabel === "positive").length;
    const negative = recentArticles.filter((a) => a.sentimentLabel === "negative").length;
    const neutral = recentArticles.filter((a) => a.sentimentLabel === "neutral").length;

    const positivePct = total > 0 ? Math.round((positive / total) * 100) : 0;
    const neutralPct = total > 0 ? Math.round((neutral / total) * 100) : 0;
    const negativePct = total > 0 ? Math.round((negative / total) * 100) : 0;

    // Determine "sky" description based on score
    const score = reputationScore?.overall ?? 50;
    let sky: string;
    let skyDescription: string;
    if (score >= 80) {
      sky = "Clear skies";
      skyDescription = "Strong positive sentiment across all monitored sources.";
    } else if (score >= 65) {
      sky = "Partly cloudy";
      skyDescription = "Overall positive sentiment, with a few areas of attention.";
    } else if (score >= 50) {
      sky = "Cloudy";
      skyDescription = "Mixed sentiment. Watch for emerging negative narratives.";
    } else if (score >= 35) {
      sky = "Stormy";
      skyDescription = "Negative sentiment dominates. Crisis comms recommended.";
    } else {
      sky = "Severe weather";
      skyDescription = "Critical reputation risk. Immediate action required.";
    }

    // Today's signals (last 5 articles with sentiment)
    const todaySignals = recentArticles.slice(0, 5).map((a) => {
      const weight: "strong" | "medium" | "low" =
        Math.abs(a.sentimentScore ?? 0) > 0.6 ? "strong" :
        Math.abs(a.sentimentScore ?? 0) > 0.3 ? "medium" : "low";

      const time = a.publishedAt
        ? new Date(a.publishedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
        : "--:--";

      return {
        time,
        source: a.source,
        title: a.title,
        weight,
        sentiment: a.sentimentLabel,
      };
    });

    // Main sources (group by source name, count articles)
    const sourceMap = new Map<string, { articles: number; sentiment: string }>();
    for (const a of recentArticles) {
      const existing = sourceMap.get(a.source);
      if (existing) {
        existing.articles++;
      } else {
        sourceMap.set(a.source, {
          articles: 1,
          sentiment: a.sentimentLabel ?? "neutral",
        });
      }
    }
    const mainSources = Array.from(sourceMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.articles - a.articles)
      .slice(0, 6);

    // Trend (compare to previous period — mock for now, real implementation
    // would compare to 30-60 days ago)
    const trend = (reputationScore?.trend as "up" | "down" | "stable") ?? "stable";
    const trendValue =
      trend === "up" ? "+2 pts vs last month" :
      trend === "down" ? "-3 pts vs last month" :
      "stable vs last month";

    return NextResponse.json({
      company: {
        id: company.id,
        slug: company.slug,
        name: company.name,
        sector: company.sector,
      },
      score,
      trend,
      trendValue,
      sky,
      skyDescription,
      breakdown: {
        positive: positivePct,
        neutral: neutralPct,
        negative: negativePct,
      },
      todaySignals,
      mainSources,
      articleCount: total,
    });
  } catch (err) {
    console.error("Weather API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
