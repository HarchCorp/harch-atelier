import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  authenticateApiKey,
  unauthorizedResponse,
} from "@/lib/auth/api-key";

// ═══════════════════════════════════════════════════════════════
//  GET /api/v1/alerts
//
//  Returns crisis alerts for the API key's company:
//    - Articles with negative sentiment published in the last 7 days
//    - High/critical risk assessments
//
//  Each alert is normalised to a stable shape:
//    {
//      id, type, title, source, url, severity,
//      sentimentScore, detectedAt, details?
//    }
//
//  Auth: Bearer harch_<key>. The key resolves to a (userId,
//  companyId) — all data is scoped to that company, with the demo
//  isolation filter applied (demo keys see only isDemo:true rows).
//
//  Query params:
//    ?limit=20   — max 100, default 20
//    ?since=ISO  — only alerts after this timestamp
//
//  Task: signal-enterprise-platform
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const identity = await authenticateApiKey(req);
  if (!identity) return unauthorizedResponse();

  const url = new URL(req.url);
  const limitParam = parseInt(url.searchParams.get("limit") || "20", 10);
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : 20;
  const sinceParam = url.searchParams.get("since");
  let since: Date;
  if (sinceParam) {
    const parsed = new Date(sinceParam);
    since = isNaN(parsed.getTime()) ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) : parsed;
  } else {
    since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  }

  const demoFilter = { isDemo: identity.isDemo };

  const [negativeArticles, highRisks] = await Promise.all([
    prisma.article.findMany({
      where: {
        companyId: identity.companyId,
        sentimentLabel: "negative",
        publishedAt: { gte: since },
        ...demoFilter,
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
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
      where: {
        companyId: identity.companyId,
        riskLevel: { in: ["high", "critical"] },
        assessedAt: { gte: since },
        ...demoFilter,
      },
      orderBy: { riskScore: "desc" },
      take: Math.min(limit, 10),
      select: {
        id: true,
        category: true,
        riskLevel: true,
        riskScore: true,
        trajectory: true,
        articleCount: true,
        assessedAt: true,
      },
    }),
  ]);

  const alerts = [
    ...negativeArticles.map((a) => ({
      id: a.id,
      type: "negative_article" as const,
      title: a.title,
      source: a.source,
      url: a.url,
      severity: (a.sentimentScore ?? 0) < -0.6 ? "critical" : ("high" as const),
      sentimentScore: a.sentimentScore,
      detectedAt: a.publishedAt,
    })),
    ...highRisks.map((r) => ({
      id: r.id,
      type: "risk_assessment" as const,
      title: `${r.category} risk — ${r.riskLevel}`,
      source: "HarchIQ Risk Engine",
      url: null,
      severity: r.riskLevel === "critical" ? "critical" : ("high" as const),
      sentimentScore: null,
      detectedAt: r.assessedAt,
      details: `Score: ${r.riskScore}/100 · Trajectory: ${r.trajectory} · ${r.articleCount} articles`,
    })),
  ];

  // Sort by detectedAt desc (nulls last).
  alerts.sort((a, b) => {
    const at = a.detectedAt ? a.detectedAt.getTime() : 0;
    const bt = b.detectedAt ? b.detectedAt.getTime() : 0;
    return bt - at;
  });

  return NextResponse.json({
    company: { id: identity.companyId },
    alerts: alerts.slice(0, limit),
    totalAlerts: alerts.length,
    criticalCount: alerts.filter((a) => a.severity === "critical").length,
    window: { since: since.toISOString(), until: new Date().toISOString() },
  });
}
