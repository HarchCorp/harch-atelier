import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";

// ═══════════════════════════════════════════════════════════════
//  GET /api/investor/dossiers
//
//  Returns all due diligence dossiers for the logged-in investor.
//
//  Auth: requires session + accountType === "investor"
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Admin can access any API (to preview what investors see)
  if (session.user?.accountType !== "investment-bank" && session.user?.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden — investment-bank account required" },
      { status: 403 }
    );
  }

  try {
    const dossiers = await prisma.dossier.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        company: {
          select: {
            slug: true,
            name: true,
            sector: true,
            reputationScores: { orderBy: { calculatedAt: "desc" }, take: 1 },
            riskAssessments: { where: { riskLevel: "high" } },
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

    return NextResponse.json({ dossiers: formatted });
  } catch (err) {
    console.error("Investor dossiers error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
