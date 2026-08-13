// ═══════════════════════════════════════════════════════════════
//  POST /api/console/competitor-matrix
//
//  Builds a 5×5 competitive comparison matrix.
//  Fetches: the user's company + 4 competitors (same sector) —
//  5 companies total in the matrix (user is column 1, the reference).
//
//  For each company, computes 5 metrics over the last 30 days:
//    - score         (reputation score, fallback to avg of others)
//    - sentiment     (% positive derived from avg sentimentScore)
//    - sov           (share of voice = company articles / sector articles)
//    - aiVisibility  (AI citation presence, 0-100)
//    - reach         (article volume + source diversity, 0-100)
//
//  Returns: { yourCompany, competitors[], meta }
//
//  This is NOT a table dump — it powers a visual color-coded grid.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { isDemoEmail } from "@/lib/demo-session";
import { prisma } from "@/lib/db";
import { logInfo, logError } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

interface CompetitorRow {
  name: string;
  score: number;
  sentiment: number;
  sov: number;
  aiVisibility: number;
  reach: number;
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Demo users (or anyone without a companyId) get a demo matrix so the
  // popup remains testable end-to-end without a real company context.
  if (session.user.isDemo || isDemoEmail(session.user.email)) {
    return NextResponse.json(buildDemo());
  }

  const companyId = session.user.companyId;
  if (!companyId) {
    return NextResponse.json(buildDemo());
  }

  try {
    const myCompany = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true, sector: true },
    });
    if (!myCompany) {
      return NextResponse.json(buildDemo());
    }

    // 4 competitors from the same sector → 5 companies total in the matrix.
    // take: 4 keeps the grid exactly 5×5.
    const competitorsDb = await prisma.company.findMany({
      where: { sector: myCompany.sector, id: { not: companyId } },
      take: 4,
      select: { id: true, name: true },
    });

    const allCompanies = [
      { id: companyId, name: myCompany.name, isYou: true },
      ...competitorsDb.map((c) => ({ id: c.id, name: c.name, isYou: false })),
    ];

    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

    // Share of voice denominator: total articles across the whole sector
    // (all companies sharing myCompany.sector) over the last 30 days.
    const sectorCompanyIds = await prisma.company.findMany({
      where: { sector: myCompany.sector },
      select: { id: true },
    });
    const sectorTotalArticles = await prisma.article.count({
      where: {
        companyId: { in: sectorCompanyIds.map((c) => c.id) },
        publishedAt: { gte: thirtyDaysAgo },
      },
    });

    const companiesData: CompetitorRow[] = await Promise.all(
      allCompanies.map(async (c) => {
        const [
          articleCount30d,
          sentimentAgg,
          repScore,
          aiVisCount,
          distinctSources,
        ] = await Promise.all([
          prisma.article.count({
            where: { companyId: c.id, publishedAt: { gte: thirtyDaysAgo } },
          }),
          prisma.article.aggregate({
            where: { companyId: c.id, publishedAt: { gte: thirtyDaysAgo } },
            _avg: { sentimentScore: true },
          }),
          prisma.reputationScore.findFirst({
            where: { companyId: c.id },
            orderBy: { calculatedAt: "desc" },
          }),
          prisma.aIVisibility.count({
            where: { companyId: c.id, cited: true },
          }),
          prisma.article.findMany({
            where: { companyId: c.id, publishedAt: { gte: thirtyDaysAgo } },
            select: { source: true },
            distinct: ["source"],
          }),
        ]);

        // sentimentScore is stored in [-1, +1]; map to a 0-100 % positive.
        const avgSentiment = sentimentAgg._avg.sentimentScore ?? 0;
        const sentimentPct = Math.max(
          0,
          Math.min(100, Math.round((avgSentiment + 1) * 50)),
        );

        const sov =
          sectorTotalArticles > 0
            ? Math.round((articleCount30d / sectorTotalArticles) * 100)
            : 0;

        // Each cited AI mention contributes 10 pts, capped at 100.
        const aiVisibility = Math.min(100, aiVisCount * 10);

        // Reach = volume (10 pts per article, capped) + source diversity (2 pts each).
        const reach = Math.min(
          100,
          Math.round(articleCount30d / 10) + distinctSources.length * 2,
        );

        // Score: prefer the persisted ReputationScore.overall; if absent,
        // fall back to the average of the 4 derived metrics so the matrix
        // still has a value for every column.
        const score =
          repScore?.overall != null
            ? Math.round(repScore.overall)
            : Math.round(
                (sentimentPct + sov + aiVisibility + reach) / 4,
              );

        return {
          name: c.name,
          score,
          sentiment: sentimentPct,
          sov,
          aiVisibility,
          reach,
        };
      }),
    );

    const yourCompany = companiesData[0];
    const competitors = companiesData.slice(1);

    logInfo(
      "competitor-matrix",
      `Matrix generated for ${myCompany.name}: ${competitors.length} competitors, sector=${myCompany.sector}`,
    );

    return NextResponse.json({
      yourCompany,
      competitors,
      meta: {
        sector: myCompany.sector,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    logError("console.competitor-matrix", `[competitor-matrix] error: ${err}`);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// ─── Demo fallback ──────────────────────────────────────────────
// Realistic Moroccan banking sector snapshot. Powers the popup for
// demo users and unauthenticated sessions without a companyId.
function buildDemo() {
  return {
    yourCompany: {
      name: "Attijariwafa Bank",
      score: 72,
      sentiment: 68,
      sov: 31,
      aiVisibility: 64,
      reach: 78,
    } as CompetitorRow,
    competitors: [
      { name: "Bank of Africa", score: 69, sentiment: 71, sov: 24, aiVisibility: 58, reach: 70 },
      { name: "BCP", score: 58, sentiment: 54, sov: 19, aiVisibility: 45, reach: 62 },
      { name: "CIH Bank", score: 61, sentiment: 63, sov: 14, aiVisibility: 52, reach: 55 },
      { name: "Crédit du Maroc", score: 55, sentiment: 49, sov: 12, aiVisibility: 41, reach: 48 },
    ] as CompetitorRow[],
    meta: {
      sector: "Banque",
      generatedAt: new Date().toISOString(),
    },
  };
}
