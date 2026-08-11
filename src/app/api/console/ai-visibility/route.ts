import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import {
  requireUserCompany,
  demoFilterFromSession,
} from "@/lib/harchiq/company-session";
import { isDemoEmail } from "@/lib/demo-session";
import { demoAiVisibilityResponse } from "@/lib/demo-console-api";
import { logError } from "@/lib/logger";
import { isAccountTypeAllowed } from "@/lib/auth/rbac";

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
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAccountTypeAllowed(session, ["essential", "pro", "enterprise", "agency"])) {
    return NextResponse.json(
      { error: "Forbidden — insufficient account permissions" },
      { status: 403 }
    );
  }

  // ─── DEMO BYPASS ─────────────────────────────────────────────
  if (session.user.isDemo || isDemoEmail(session.user.email)) {
    return demoAiVisibilityResponse();
  }

  try {
    const url = new URL(req.url);
    const companySlug = url.searchParams.get("company");

    // Task: domain-matching-demo-isolation — demo users see demo
    // AIVisibility rows only (the Brand Monitor demo seeds 8 rows
    // on the first real company; without this filter a real user
    // attached to that company would see the demo citations).
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

    const aiVisibility = await prisma.aIVisibility.findMany({
      where: { companyId: company.id, ...demoFilter },
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
    logError("console.ai-visibility", `AI visibility API error: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
