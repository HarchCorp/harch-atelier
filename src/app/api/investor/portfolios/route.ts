import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";

// ═══════════════════════════════════════════════════════════════
//  GET /api/investor/portfolios
//
//  Returns all portfolios for the logged-in investor + roll-up stats
//  (reputation avg, ESG risk, top holdings, controversy count).
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
    const portfolios = await prisma.portfolio.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
      include: {
        holdings: {
          include: {
            company: {
              include: {
                reputationScores: { orderBy: { calculatedAt: "desc" }, take: 1 },
                riskAssessments: { where: { riskLevel: "high" }, take: 5 },
              },
            },
            asset: {
              include: {
                prices: { orderBy: { tradedAt: "desc" }, take: 1 },
              },
            },
          },
        },
      },
    });

    const formatted = portfolios.map((p) => {
      const holdings = p.holdings.map((h) => ({
        id: h.id,
        weight: h.weight,
        company: h.company
          ? {
              slug: h.company.slug,
              name: h.company.name,
              sector: h.company.sector,
              reputationScore: h.company.reputationScores[0]?.overall ?? null,
              highRisks: h.company.riskAssessments.length,
            }
          : null,
        asset: h.asset
          ? {
              ticker: h.asset.ticker,
              name: h.asset.name,
              latestPrice: h.asset.prices[0]?.price ?? null,
            }
          : null,
      }));

      // Roll-up stats
      const companyHoldings = p.holdings.filter((h) => h.company);
      const avgReputation = companyHoldings.length > 0
        ? Math.round(
            companyHoldings.reduce((sum, h) => sum + (h.company?.reputationScores[0]?.overall ?? 0), 0) /
              companyHoldings.length
          )
        : null;
      const totalHighRisks = companyHoldings.reduce(
        (sum, h) => sum + (h.company?.riskAssessments.length ?? 0),
        0
      );

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        holdingCount: p.holdings.length,
        avgReputation,
        totalHighRisks,
        holdings,
      };
    });

    return NextResponse.json({ portfolios: formatted });
  } catch (err) {
    console.error("Investor portfolios error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
