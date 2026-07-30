import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";

// ═══════════════════════════════════════════════════════════════
//  GET /api/console/ai-visibility
//
//  Returns AI visibility data for the primary company:
//  - Which AI engines cite the company (ChatGPT, Perplexity, Gemini, Claude)
//  - Position in AI responses
//  - Sentiment of the citation
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
      { error: "Forbidden — this data is for brand-monitor, market-competitor and investment-bank accounts only" },
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

    const aiVisibility = await prisma.aIVisibility.findMany({
      where: { companyId: company.id },
      orderBy: { checkedAt: "desc" },
    });

    // Group by platform — keep only the latest per platform
    const platformMap = new Map<string, typeof aiVisibility[0]>();
    for (const av of aiVisibility) {
      if (!platformMap.has(av.platform)) {
        platformMap.set(av.platform, av);
      }
    }

    const platforms = Array.from(platformMap.values()).map((av) => ({
      platform: av.platform,
      cited: av.cited,
      position: av.position,
      sentiment: av.sentiment,
      confidence: av.confidence,
      summary: av.summary,
      checkedAt: av.checkedAt,
    }));

    const citedCount = platforms.filter((p) => p.cited).length;
    const totalCount = platforms.length;

    return NextResponse.json({
      company: { name: company.name, slug: company.slug },
      platforms,
      citedCount,
      totalCount,
      visibilityScore: totalCount > 0 ? Math.round((citedCount / totalCount) * 100) : 0,
    });
  } catch (err) {
    console.error("AI visibility API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
