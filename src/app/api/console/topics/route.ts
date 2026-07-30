import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";

// ═══════════════════════════════════════════════════════════════
//  GET /api/console/topics
//
//  Returns top topics/themes for the primary company based on
//  article titles and risk assessment categories.
//
//  Auth: requires session (brand-monitor, market-competitor, investment-bank)
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowedTypes = ["brand-monitor", "market-competitor", "investment-bank"];
  if (!allowedTypes.includes(session.user?.accountType || "") && session.user?.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  try {
    const url = new URL(req.url);
    const companySlug = url.searchParams.get("company");

    const company = companySlug
      ? await prisma.company.findUnique({ where: { slug: companySlug } })
      : await prisma.company.findFirst({ orderBy: { createdAt: "asc" } });

    if (!company) {
      return NextResponse.json({ error: "No company found" }, { status: 404 });
    }

    // Get recent articles and count by sentiment
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const articles = await prisma.article.findMany({
      where: {
        companyId: company.id,
        publishedAt: { gte: thirtyDaysAgo },
      },
      select: { sentimentLabel: true, source: true },
    });

    // Build topics from sources (each source = a topic proxy)
    const sourceMap = new Map<string, number>();
    for (const a of articles) {
      sourceMap.set(a.source, (sourceMap.get(a.source) || 0) + 1);
    }

    // Also get risk categories as topics
    const risks = await prisma.riskAssessment.findMany({
      where: { companyId: company.id },
      select: { category: true, articleCount: true },
    });

    const topics = [
      ...Array.from(sourceMap.entries()).map(([name, count]) => ({
        label: name,
        count,
        type: "source" as const,
      })),
      ...risks.map((r) => ({
        label: r.category,
        count: r.articleCount || 0,
        type: "risk" as const,
      })),
    ].sort((a, b) => b.count - a.count).slice(0, 8);

    return NextResponse.json({
      company: { name: company.name, slug: company.slug },
      topics,
      totalArticles: articles.length,
    });
  } catch (err) {
    console.error("Topics API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
