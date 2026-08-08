import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import {
  requireUserCompany,
  demoFilterFromSession,
} from "@/lib/harchiq/company-session";
import { isDemoEmail } from "@/lib/demo-session";
import { demoTopicsResponse } from "@/lib/demo-console-api";
import { logError } from "@/lib/logger";

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
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowedTypes = ["brand-monitor", "market-competitor", "investment-bank"];
  if (!allowedTypes.includes(session.user.accountType || "") && session.user.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  // ─── DEMO BYPASS ─────────────────────────────────────────────
  if (session.user.isDemo || isDemoEmail(session.user.email)) {
    return demoTopicsResponse();
  }

  try {
    const url = new URL(req.url);
    const companySlug = url.searchParams.get("company");

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
      return NextResponse.json({ error: "No company found" }, { status: 404 });
    }

    // Get recent articles and count by sentiment
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const articles = await prisma.article.findMany({
      where: {
        companyId: company.id,
        publishedAt: { gte: thirtyDaysAgo },
        ...demoFilter,
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
      where: { companyId: company.id, ...demoFilter },
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
    logError("console.topics", `Topics API error: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
