import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";

// ═══════════════════════════════════════════════════════════════
//  GET /api/console/reports
//
//  Returns monthly report summary for the primary company:
//  - Reputation score trend (current vs previous month)
//  - Article count by sentiment
//  - Top sources
//  - AI visibility summary
//  - Risk summary
//
//  Auth: requires session (brand-monitor, market-competitor, investment-bank)
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allowedTypes = ["brand-monitor", "market-competitor", "investment-bank"];
  if (!allowedTypes.includes(session.user?.accountType || "") && session.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const url = new URL(req.url);
    const companySlug = url.searchParams.get("company");
    const company = companySlug
      ? await prisma.company.findUnique({ where: { slug: companySlug } })
      : await prisma.company.findFirst({ orderBy: { createdAt: "asc" } });

    if (!company) return NextResponse.json({ error: "No company found" }, { status: 404 });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [articles, reputationScore, aiVisibility, risks] = await Promise.all([
      prisma.article.findMany({
        where: { companyId: company.id, publishedAt: { gte: thirtyDaysAgo } },
        select: { sentimentLabel: true, source: true },
      }),
      prisma.reputationScore.findFirst({
        where: { companyId: company.id },
        orderBy: { calculatedAt: "desc" },
      }),
      prisma.aIVisibility.findMany({
        where: { companyId: company.id },
        orderBy: { checkedAt: "desc" },
        select: { platform: true, cited: true, position: true, sentiment: true },
      }),
      prisma.riskAssessment.findMany({
        where: { companyId: company.id },
        orderBy: { riskScore: "desc" },
        take: 5,
        select: { category: true, riskLevel: true, riskScore: true },
      }),
    ]);

    const positive = articles.filter((a) => a.sentimentLabel === "positive").length;
    const negative = articles.filter((a) => a.sentimentLabel === "negative").length;
    const neutral = articles.filter((a) => a.sentimentLabel === "neutral").length;

    const sourceMap = new Map<string, number>();
    for (const a of articles) sourceMap.set(a.source, (sourceMap.get(a.source) || 0) + 1);
    const topSources = Array.from(sourceMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const citedEngines = aiVisibility.filter((a) => a.cited).length;

    return NextResponse.json({
      company: { name: company.name, slug: company.slug, sector: company.sector },
      reportPeriod: "Last 30 days",
      generatedAt: new Date().toISOString(),
      reputation: {
        score: reputationScore?.overall ?? 0,
        trend: reputationScore?.trend ?? "stable",
        shareOfVoice: reputationScore?.shareOfVoice ?? 0,
      },
      articles: {
        total: articles.length,
        positive,
        negative,
        neutral,
        positivePct: articles.length > 0 ? Math.round((positive / articles.length) * 100) : 0,
        negativePct: articles.length > 0 ? Math.round((negative / articles.length) * 100) : 0,
      },
      topSources,
      aiVisibility: {
        citedEngines,
        totalEngines: aiVisibility.length,
        visibilityScore: aiVisibility.length > 0 ? Math.round((citedEngines / aiVisibility.length) * 100) : 0,
      },
      risks: risks.map((r) => ({ category: r.category, level: r.riskLevel, score: r.riskScore })),
      ready: true,
      pdfUrl: null, // TODO: generate actual PDF
    });
  } catch (err) {
    console.error("Reports API error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
