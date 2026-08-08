import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import {
  requireUserCompany,
  demoFilterFromSession,
} from "@/lib/harchiq/company-session";
import { isDemoEmail } from "@/lib/demo-session";
import { demoWeatherResponse } from "@/lib/demo-console-api";
import { withQuotaCheck } from "@/lib/agency/quota";
import { logError } from "@/lib/logger";

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

// Brick 8 — wrap the GET handler with quota enforcement. The wrapper
// is a no-op for regular users (no active agency workspace); for
// agency-admins switched into a sub-client workspace, it checks the
// apiRequest quota for the current month and returns 429 if exceeded.
export async function getHandler(req: Request) {
  // Auth check — STRICT (no anonymous access)
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ACCOUNT TYPE GATE — only brand-monitor + market-competitor + investment-bank accounts can see
  // company reputation data. Traders monitor markets, not companies.
  const allowedTypes = ["brand-monitor", "market-competitor", "investment-bank"];
  if (!allowedTypes.includes(session.user.accountType || "") && session.user.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden — this data is for brand-monitor, market-competitor and investment-bank accounts only" },
      { status: 403 }
    );
  }

  // ─── DEMO BYPASS ─────────────────────────────────────────────
  // Demo sessions serve in-memory data, skipping Prisma entirely.
  if (session.user.isDemo || isDemoEmail(session.user.email)) {
    return demoWeatherResponse();
  }

  try {
    const url = new URL(req.url);
    const companySlug = url.searchParams.get("company");

    // ─── Company resolution ───────────────────────────────────────
    // The Console used to do `findFirst({ orderBy: { createdAt: "asc" } })`
    // which leaked OCP data to every user. We now resolve the company
    // from the logged-in user's companyId — only fallback to slug
    // lookup when an admin explicitly passes ?company= (preview mode).
    //
    // Task: domain-matching-demo-isolation — derive demoFilter from
    // the session so admin preview path AND normal user path both
    // apply the isDemo filter to every child query.
    const demoFilter = demoFilterFromSession(session);
    let company;
    if (companySlug) {
      if (session.user.role !== "admin") {
        return NextResponse.json(
          { error: "Forbidden — can only view your own company" },
          { status: 403 },
        );
      }
      company = await prisma.company.findUnique({ where: { slug: companySlug } });
    } else {
      const result = await requireUserCompany();
      if (!result.ok) return result.response;
      company = await prisma.company.findUnique({
        where: { id: result.data.company.id },
      });
    }

    if (!company) {
      return NextResponse.json(
        { error: "No company found. Run the seed script first." },
        { status: 404 }
      );
    }

    // Get latest reputation score
    const reputationScore = await prisma.reputationScore.findFirst({
      where: { companyId: company.id, ...demoFilter },
      orderBy: { calculatedAt: "desc" },
    });

    // Get recent articles (last 30 days) for sentiment breakdown
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentArticles = await prisma.article.findMany({
      where: {
        companyId: company.id,
        publishedAt: { gte: thirtyDaysAgo },
        ...demoFilter,
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
    logError("console.weather", `Weather API error: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Brick 8 — exported GET wrapped with quota enforcement (apiRequest resource).
// Regular users (no active agency workspace) pass through unchanged.
export const GET = withQuotaCheck(getHandler, "apiRequest");
