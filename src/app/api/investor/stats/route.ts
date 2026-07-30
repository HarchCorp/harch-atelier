import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";

// ═══════════════════════════════════════════════════════════════
//  GET /api/investor/stats
//
//  Returns KPI strip data for the investor console:
//  - Total portfolios
//  - Total holdings across all portfolios
//  - Average reputation across portfolio companies
//  - Total high-risk items
//  - Dossiers (by status: draft/ready)
//
//  Auth: investor or admin
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user?.accountType !== "investor" && session.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden — investor account required" }, { status: 403 });
  }

  try {
    // For admin, show all portfolios; for investor, show only theirs
    const whereClause = session.user?.role === "admin"
      ? {}
      : { userId: session.user.id };

    const portfolios = await prisma.portfolio.findMany({
      where: whereClause,
      include: {
        holdings: {
          include: {
            company: {
              include: {
                reputationScores: { orderBy: { calculatedAt: "desc" }, take: 1 },
                riskAssessments: { where: { riskLevel: "high" } },
              },
            },
          },
        },
      },
    });

    const totalPortfolios = portfolios.length;
    const allHoldings = portfolios.flatMap((p) => p.holdings);
    const totalHoldings = allHoldings.length;

    // Average reputation across all companies in portfolios
    const companyHoldings = allHoldings.filter((h) => h.company);
    const reputationScores = companyHoldings
      .map((h) => h.company?.reputationScores[0]?.overall)
      .filter((s): s is number => s !== undefined);
    const avgReputation = reputationScores.length > 0
      ? Math.round(reputationScores.reduce((sum, s) => sum + s, 0) / reputationScores.length)
      : null;

    // Total high risks
    const totalHighRisks = companyHoldings.reduce(
      (sum, h) => sum + (h.company?.riskAssessments.length ?? 0),
      0
    );

    // Dossiers
    const dossierWhere = session.user?.role === "admin" ? {} : { userId: session.user.id };
    const [totalDossiers, readyDossiers, draftDossiers] = await Promise.all([
      prisma.dossier.count({ where: dossierWhere }),
      prisma.dossier.count({ where: { ...dossierWhere, status: "ready" } }),
      prisma.dossier.count({ where: { ...dossierWhere, status: "draft" } }),
    ]);

    // Unique companies tracked
    const uniqueCompanyIds = new Set(
      companyHoldings.map((h) => h.company?.id).filter((id): id is string => !!id)
    );

    return NextResponse.json({
      portfolios: totalPortfolios,
      holdings: totalHoldings,
      companiesTracked: uniqueCompanyIds.size,
      avgReputation,
      totalHighRisks,
      dossiers: {
        total: totalDossiers,
        ready: readyDossiers,
        draft: draftDossiers,
      },
    });
  } catch (err) {
    console.error("Investor stats error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
