// ═══════════════════════════════════════════════════════════════
//  GET /api/console/alert-detail?id=<cuid>
//
//  Returns the full record for a single cited alert — Article or
//  RiskAssessment — so the InsightPanel / BriefingArchive modal can
//  render the source behind a citation chip.
//
//  Auth: requires session. The alert MUST belong to the calling
//  user's company (or be visible to admins). Demo isolation applies
//  — demo users can only fetch isDemo:true rows, real users only
//  isDemo:false.
//
//  Task: dataminr-briefings-compliance — clickable source citations
//  that open a modal with the full alert details (Dataminr-parity).
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { demoFilterFromSession } from "@/lib/harchiq/company-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const isAdmin = session.user.role === "admin";

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  const demoFilter = demoFilterFromSession(session);

  // 1. Try Article — covers cited articles from briefings/insights.
  const article = await prisma.article.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      source: true,
      url: true,
      summary: true,
      content: true,
      language: true,
      sentimentLabel: true,
      sentimentScore: true,
      relevanceScore: true,
      publishedAt: true,
      scrapedAt: true,
      companyId: true,
      isDemo: true,
    },
  });

  if (article) {
    // Authorisation: same company OR admin. Demo isolation enforced
    // via the article's isDemo flag vs the session's demoFilter.
    const userCompany = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    });
    if (!isAdmin) {
      if (article.companyId && article.companyId !== userCompany?.companyId) {
        return NextResponse.json({ error: "Forbidden — alert belongs to another company" }, { status: 403 });
      }
      if (article.isDemo !== demoFilter.isDemo) {
        return NextResponse.json({ error: "Forbidden — demo isolation violated" }, { status: 403 });
      }
    }
    return NextResponse.json({
      kind: "article",
      alert: {
        id: article.id,
        title: article.title,
        source: article.source,
        url: article.url,
        summary: article.summary,
        content: article.content,
        language: article.language,
        sentimentLabel: article.sentimentLabel,
        sentimentScore: article.sentimentScore,
        relevanceScore: article.relevanceScore,
        publishedAt: article.publishedAt ? article.publishedAt.toISOString() : null,
        scrapedAt: article.scrapedAt ? article.scrapedAt.toISOString() : null,
        severity:
          article.sentimentScore !== null && article.sentimentScore !== undefined
            ? article.sentimentScore < -0.6
              ? "critical"
              : article.sentimentScore < -0.3
                ? "high"
                : "medium"
            : "info",
      },
    });
  }

  // 2. Try RiskAssessment — covers cited risk assessments.
  const risk = await prisma.riskAssessment.findUnique({
    where: { id },
    select: {
      id: true,
      category: true,
      riskLevel: true,
      riskScore: true,
      trajectory: true,
      articleCount: true,
      overallRisk: true,
      frequency: true,
      impactSeverity: true,
      velocity: true,
      assessedAt: true,
      companyId: true,
      isDemo: true,
    },
  });

  if (risk) {
    const userCompany = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    });
    if (!isAdmin) {
      if (risk.companyId && risk.companyId !== userCompany?.companyId) {
        return NextResponse.json({ error: "Forbidden — alert belongs to another company" }, { status: 403 });
      }
      if (risk.isDemo !== demoFilter.isDemo) {
        return NextResponse.json({ error: "Forbidden — demo isolation violated" }, { status: 403 });
      }
    }
    // RiskAssessment has no `summary` or `mitigation` columns — synthesise
    // a human-readable summary + mitigation hint from the available fields.
    const synthSummary = `${risk.category} risk assessed at ${risk.riskScore}/100 (${risk.riskLevel}). ` +
      `Trajectory: ${risk.trajectory ?? "stable"}. ${risk.articleCount ?? 0} contributing articles. ` +
      `Overall risk: ${risk.overallRisk.toFixed(1)}. Frequency: ${risk.frequency?.toFixed(2) ?? "n/a"}. ` +
      `Impact severity: ${risk.impactSeverity?.toFixed(2) ?? "n/a"}. Velocity: ${risk.velocity?.toFixed(2) ?? "n/a"}.`;
    const synthMitigation =
      risk.riskLevel === "critical"
        ? "Escalate immediately to the CRO and Compliance. Convene the crisis cell within 24 hours. Prepare a board memo and a holding statement for stakeholders."
        : risk.riskLevel === "high"
          ? "Brief the compliance team within 48 hours. Open a dossier and assign an owner. Schedule a follow-up assessment in 7 days."
          : "Monitor for trajectory changes. Re-assess at the next quarterly review.";
    return NextResponse.json({
      kind: "risk_assessment",
      alert: {
        id: risk.id,
        title: `${risk.category} risk — ${risk.riskLevel}`,
        source: "HarchIQ Risk Engine",
        url: null,
        summary: synthSummary,
        content: synthMitigation,
        language: null,
        sentimentLabel: "negative",
        sentimentScore: null,
        relevanceScore: null,
        publishedAt: risk.assessedAt ? risk.assessedAt.toISOString() : null,
        scrapedAt: null,
        severity: risk.riskLevel,
        category: risk.category,
        riskLevel: risk.riskLevel,
        riskScore: risk.riskScore,
        trajectory: risk.trajectory,
        articleCount: risk.articleCount,
        mitigation: synthMitigation,
      },
    });
  }

  // 3. Try AIVisibility — covers cited AI-engine probes.
  const ai = await prisma.aIVisibility.findUnique({
    where: { id },
    select: {
      id: true,
      platform: true,
      cited: true,
      position: true,
      sentiment: true,
      summary: true,
      checkedAt: true,
      companyId: true,
      isDemo: true,
    },
  });

  if (ai) {
    const userCompany = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    });
    if (!isAdmin) {
      if (ai.companyId && ai.companyId !== userCompany?.companyId) {
        return NextResponse.json({ error: "Forbidden — alert belongs to another company" }, { status: 403 });
      }
      if (ai.isDemo !== demoFilter.isDemo) {
        return NextResponse.json({ error: "Forbidden — demo isolation violated" }, { status: 403 });
      }
    }
    return NextResponse.json({
      kind: "ai_visibility",
      alert: {
        id: ai.id,
        title: `${ai.platform} — ${ai.cited ? "cited" : "not cited"}`,
        source: ai.platform,
        url: null,
        summary: ai.summary,
        content: ai.summary,
        language: null,
        sentimentLabel: ai.sentiment ?? "neutral",
        sentimentScore: null,
        relevanceScore: null,
        publishedAt: ai.checkedAt ? ai.checkedAt.toISOString() : null,
        scrapedAt: null,
        severity: ai.cited ? "info" : "watch",
        platform: ai.platform,
        cited: ai.cited,
        position: ai.position,
      },
    });
  }

  return NextResponse.json({ error: "Alert not found" }, { status: 404 });
}
