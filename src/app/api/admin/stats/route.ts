import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";

// ═══════════════════════════════════════════════════════════════
//  GET /api/admin/stats
//
//  Returns KPI strip data for the admin dashboard:
//  - Total users (by accountType breakdown)
//  - Pending access requests
//  - Active invitations (not used, not expired)
//  - Total articles in DB
//  - Total companies tracked
//  - Total assets tracked
//
//  Auth: admin only
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
  }

  try {
    const [
      totalUsers,
      brandMonitorUsers,
      marketCompetitorUsers,
      investmentBankUsers,
      harchAlphaUsers,
      pendingRequests,
      acceptedRequests,
      activeInvitations,
      usedInvitations,
      totalArticles,
      totalCompanies,
      totalAssets,
      totalPortfolios,
      totalDossiers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { accountType: "brand-monitor" } }),
      prisma.user.count({ where: { accountType: "market-competitor" } }),
      prisma.user.count({ where: { accountType: "investment-bank" } }),
      prisma.user.count({ where: { accountType: "harch-alpha" } }),
      prisma.accessRequest.count({ where: { status: "pending" } }),
      prisma.accessRequest.count({ where: { status: "accepted" } }),
      prisma.invitation.count({ where: { usedAt: null, expiresAt: { gte: new Date() } } }),
      prisma.invitation.count({ where: { usedAt: { not: null } } }),
      prisma.article.count(),
      prisma.company.count(),
      prisma.asset.count(),
      prisma.portfolio.count(),
      prisma.dossier.count(),
    ]);

    return NextResponse.json({
      users: {
        total: totalUsers,
        "brand-monitor": brandMonitorUsers,
        "market-competitor": marketCompetitorUsers,
        "investment-bank": investmentBankUsers,
        "harch-alpha": harchAlphaUsers,
      },
      requests: {
        pending: pendingRequests,
        accepted: acceptedRequests,
      },
      invitations: {
        active: activeInvitations,
        used: usedInvitations,
      },
      data: {
        articles: totalArticles,
        companies: totalCompanies,
        assets: totalAssets,
        portfolios: totalPortfolios,
        dossiers: totalDossiers,
      },
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
