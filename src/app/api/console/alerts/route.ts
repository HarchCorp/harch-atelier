import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import {
  requireUserCompany,
  demoFilterFromSession,
} from "@/lib/harchiq/company-session";
import { isDemoEmail } from "@/lib/demo-session";
import { demoAlertsResponse } from "@/lib/demo-console-api";
import { withQuotaCheck } from "@/lib/agency/quota";
import { logError } from "@/lib/logger";

// ═══════════════════════════════════════════════════════════════
//  GET /api/console/alerts
//
//  Returns crisis alerts for the primary company:
//  - Articles with strong negative sentiment (score < -0.4)
//  - Risk assessments with high/critical level
//  - Recent articles sorted by urgency
//
//  Auth: requires session (brand-monitor, market-competitor, investment-bank)
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

// Brick 8 — wrap the GET handler with quota enforcement (apiRequest resource).
// No-op for regular users; checks + increments usage for agency-admins in
// an active sub-client workspace.
export async function getHandler(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allowedTypes = ["brand-monitor", "market-competitor", "investment-bank", "harch-alpha"];
  if (!allowedTypes.includes(session.user.accountType || "") && session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ─── DEMO BYPASS ─────────────────────────────────────────────
  if (session.user.isDemo || isDemoEmail(session.user.email)) {
    return demoAlertsResponse();
  }

  try {
    const url = new URL(req.url);
    const companySlug = url.searchParams.get("company");

    // Task: domain-matching-demo-isolation — demo users see demo
    // alerts only, real users see real alerts only.
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

    if (!company) return NextResponse.json({ error: "No company found" }, { status: 404 });

    // Get negative articles from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [negativeArticles, highRisks] = await Promise.all([
      prisma.article.findMany({
        where: {
          companyId: company.id,
          sentimentLabel: "negative",
          publishedAt: { gte: sevenDaysAgo },
          ...demoFilter,
        },
        orderBy: { publishedAt: "desc" },
        take: 10,
        select: {
          id: true,
          title: true,
          source: true,
          url: true,
          sentimentScore: true,
          publishedAt: true,
        },
      }),
      prisma.riskAssessment.findMany({
        where: { companyId: company.id, riskLevel: { in: ["high", "critical"] }, ...demoFilter },
        orderBy: { riskScore: "desc" },
        take: 5,
        select: { id: true, category: true, riskLevel: true, riskScore: true, trajectory: true, articleCount: true },
      }),
    ]);

    const alerts = negativeArticles.map((a) => ({
      id: a.id,
      type: "negative_article" as const,
      title: a.title,
      source: a.source,
      url: a.url,
      severity: (a.sentimentScore ?? 0) < -0.6 ? "critical" : "high" as const,
      sentimentScore: a.sentimentScore,
      detectedAt: a.publishedAt,
    }));

    const riskAlerts = highRisks.map((r) => ({
      id: r.id,
      type: "risk_assessment" as const,
      title: `${r.category} risk — ${r.riskLevel}`,
      source: "HarchIQ Risk Engine",
      url: null,
      severity: r.riskLevel === "critical" ? "critical" : "high" as const,
      sentimentScore: null,
      detectedAt: null,
      details: `Score: ${r.riskScore}/100 · Trajectory: ${r.trajectory} · ${r.articleCount} articles`,
    }));

    return NextResponse.json({
      company: { name: company.name, slug: company.slug },
      alerts: [...alerts, ...riskAlerts],
      totalAlerts: alerts.length + riskAlerts.length,
      criticalCount: [...alerts, ...riskAlerts].filter((a) => a.severity === "critical").length,
    });
  } catch (err) {
    logError("console.alerts", `Alerts API error: ${err}`);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}

// Brick 8 — exported GET wrapped with quota enforcement (apiRequest resource).
export const GET = withQuotaCheck(getHandler, "apiRequest");
