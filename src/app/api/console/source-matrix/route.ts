import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import {
  requireUserCompany,
  demoFilterFromSession,
} from "@/lib/harchiq/company-session";

// ═══════════════════════════════════════════════════════════════
//  GET /api/console/source-matrix
//
//  Returns a matrix of source × sentiment × volume for heatmap
//  charts. Each row is a media source with the count of articles
//  by sentiment bucket plus a total.
//
//  Query params:
//    - company  : company slug (default: first company in DB)
//    - range    : 7d | 30d | 365d (default 30d)
//    - limit    : max sources to return (default 20, after sorting
//                 by total volume desc)
//
//  Auth: requires session (brand-monitor | market-competitor |
//  investment-bank | admin).
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

const RANGE_DAYS: Record<string, number> = {
  "7d": 7,
  "30d": 30,
  "365d": 365,
};

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowedTypes = ["brand-monitor", "market-competitor", "investment-bank"];
  if (!allowedTypes.includes(session.user.accountType || "") && session.user.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden — this data is for brand-monitor, market-competitor and investment-bank accounts only" },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const rangeParam = searchParams.get("range") || "30d";
    const days = RANGE_DAYS[rangeParam] ?? 30;
    const limitParam = parseInt(searchParams.get("limit") || "20", 10);
    const limit = Math.min(Math.max(limitParam || 20, 1), 100);

    const companySlug = searchParams.get("company");
    // Task: domain-matching-demo-isolation
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
      company = await prisma.company.findUnique({ where: { id: result.data.company.id } });
    }

    if (!company) {
      return NextResponse.json({
        sources: [],
        sentiments: ["positive", "neutral", "negative"],
        matrix: [],
      });
    }

    const since = new Date();
    since.setDate(since.getDate() - days);

    const articles = await prisma.article.findMany({
      where: {
        companyId: company.id,
        publishedAt: { gte: since },
        ...demoFilter,
      },
      select: {
        source: true,
        sentimentLabel: true,
      },
    });

    const matrixMap = new Map<
      string,
      { source: string; positive: number; neutral: number; negative: number; total: number }
    >();

    for (const a of articles) {
      if (!matrixMap.has(a.source)) {
        matrixMap.set(a.source, { source: a.source, positive: 0, neutral: 0, negative: 0, total: 0 });
      }
      const row = matrixMap.get(a.source)!;
      row.total += 1;
      if (a.sentimentLabel === "positive") row.positive += 1;
      else if (a.sentimentLabel === "negative") row.negative += 1;
      else row.neutral += 1;
    }

    const matrix = Array.from(matrixMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);

    const sources = matrix.map((m) => m.source);

    return NextResponse.json({
      company: { name: company.name, slug: company.slug },
      range: rangeParam,
      sources,
      sentiments: ["positive", "neutral", "negative"],
      matrix,
      totalArticles: articles.length,
      totalSources: matrixMap.size,
    });
  } catch (err) {
    console.error("Source matrix API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
