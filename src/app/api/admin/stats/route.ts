import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { logError } from "@/lib/logger";

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
  if (!session || session.user?.role !== "admin" && session.user?.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
  }

  try {
    const [
      totalUsers,
      essentialUsers,
      proUsers,
      enterpriseUsers,
      agencyUsers,
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
      prisma.user.count({ where: { accountType: "essential" } }),
      prisma.user.count({ where: { accountType: "pro" } }),
      prisma.user.count({ where: { accountType: "enterprise" } }),
      prisma.user.count({ where: { accountType: "agency" } }),
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
        "essential": essentialUsers,
        "pro": proUsers,
        "enterprise": enterpriseUsers,
        "agency": agencyUsers,
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
    logError("admin.stats", `Admin stats error: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
