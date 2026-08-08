import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { logAudit, extractIp, extractUserAgent } from "@/lib/harchiq/audit-log";
import { demoFilterFromSession } from "@/lib/harchiq/company-session";
import { logError } from "@/lib/logger";

// ═══════════════════════════════════════════════════════════════
//  GET /api/investor/dossiers
//
//  Returns all due diligence dossiers for the logged-in investor.
//
//  Auth: requires session + accountType === "investor"
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized — session invalid" },
      { status: 401 },
    );
  }
  const userId = session.user.id;
  // Admin can access any API (to preview what investors see)
  if (session.user?.accountType !== "investment-bank" && session.user?.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden — investment-bank account required" },
      { status: 403 }
    );
  }

  // Task: domain-matching-demo-isolation — demo investors see demo
  // dossiers only, real investors see real dossiers only.
  const demoFilter = demoFilterFromSession(session);
  const isDemo = demoFilter.isDemo;

  // For demo users: show ALL demo dossiers (shared across demo users).
  // For real users: strict userId filter.
  const dossierFilter = isDemo
    ? { ...demoFilter }
    : { userId, ...demoFilter };

  try {
    const dossiers = await prisma.dossier.findMany({
      where: dossierFilter,
      orderBy: { updatedAt: "desc" },
      include: {
        company: {
          select: {
            slug: true,
            name: true,
            sector: true,
            reputationScores: { where: demoFilter, orderBy: { calculatedAt: "desc" }, take: 1 },
            riskAssessments: { where: { riskLevel: "high", ...demoFilter } },
          },
        },
      },
    });

    // Derive riskScore + riskBand from the linked company's latest
    // reputation score (repScore 0-100 -> riskScore = 100 - repScore).
    const formatted = dossiers.map((d) => {
      const repScore = d.company?.reputationScores?.[0]?.overall ?? null;
      const riskScore = repScore !== null ? Math.round(100 - repScore) : 50;
      const riskBand: "low" | "medium" | "high" | "critical" =
        riskScore >= 70 ? "critical" :
        riskScore >= 50 ? "high" :
        riskScore >= 30 ? "medium" : "low";
      const highRiskCount = d.company?.riskAssessments?.length ?? 0;
      return {
        id: d.id,
        title: d.title,
        status: d.status,                   // draft | generating | ready | archived
        target: d.company?.name ?? d.title,
        targetType: "company" as const,
        summary: d.company
          ? `${d.company.name} \u2014 ${d.company.sector}`
          : d.title,
        riskScore,
        riskBand,
        threats: highRiskCount,
        opportunities: repScore !== null && repScore >= 60 ? 1 : 0,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
        company: d.company
          ? {
              slug: d.company.slug,
              name: d.company.name,
              sector: d.company.sector,
              reputationScore: repScore,
            }
          : null,
      };
    });

    // ─── Audit log (Loi 09-08) — dossier list was viewed ─────────
    await logAudit({
      userId,
      action: "dossier_view",
      resource: "dossier:list",
      result: "success",
      ipAddress: extractIp(req),
      userAgent: extractUserAgent(req),
      metadata: { count: formatted.length },
    });

    return NextResponse.json({ dossiers: formatted });
  } catch (err) {
    logError("investor.dossiers", `Investor dossiers error: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
