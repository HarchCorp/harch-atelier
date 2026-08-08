import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import {
  requireUserCompany,
  demoFilterFromSession,
} from "@/lib/harchiq/company-session";
import { isDemoEmail } from "@/lib/demo-session";
import { demoNeighborsResponse } from "@/lib/demo-console-api";
import { logError } from "@/lib/logger";

// ═══════════════════════════════════════════════════════════════
//  GET /api/console/neighbors
//
//  Returns the "Neighbors" data for the Console:
//  - Competitor companies in the same sector
//  - Their reputation scores
//  - Score delta vs the "primary" company
//  - Recent moves (articles from each neighbor)
//
//  The Neighbor Index ranks competitors by proximity:
//  - Rank 1: same sector + similar size (direct competitor)
//  - Rank 2: same sector + smaller/larger (indirect)
//  - Rank 3: adjacent sector (peripheral)
//
//  Auth: requires session (Console is private)
//
//  Query params:
//  - company: company slug (the "you" — default: first company)
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

// Simple rank assignment based on score proximity
function assignRank(yourScore: number, theirScore: number): 1 | 2 | 3 {
  const delta = Math.abs(theirScore - yourScore);
  if (delta <= 10) return 1;  // Close competitor
  if (delta <= 20) return 2;  // Mid-distance
  return 3;                    // Far
}

function impactLevel(rank: 1 | 2 | 3, sentimentScore: number | null): 1 | 2 | 3 {
  // Negative sentiment from rank 1 neighbor = high impact
  if (sentimentScore === null) return 1;
  const isNegative = sentimentScore < -0.3;
  const isStrong = Math.abs(sentimentScore) > 0.6;

  if (rank === 1 && isNegative && isStrong) return 3;
  if (rank === 1 && (isNegative || isStrong)) return 2;
  if (rank === 2 && isNegative && isStrong) return 2;
  return 1;
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ACCOUNT TYPE GATE — competitors data is brand-monitor + market-competitor + investment-bank only
  const allowedTypes = ["brand-monitor", "market-competitor", "investment-bank"];
  if (!allowedTypes.includes(session.user.accountType || "") && session.user.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden — competitor data is for brand-monitor, market-competitor and investment-bank accounts only" },
      { status: 403 }
    );
  }

  // ─── DEMO BYPASS ─────────────────────────────────────────────
  if (session.user.isDemo || isDemoEmail(session.user.email)) {
    return demoNeighborsResponse();
  }

  try {
    const url = new URL(req.url);
    const companySlug = url.searchParams.get("company");

    // Get the primary company (the "you")
    // Task: domain-matching-demo-isolation — the demoFilter is applied
    // to every child query (neighbor companies, their reputation
    // scores, their articles) so a real user never sees the demo
    // competitor companies created by the executive demo seed, and
    // a demo user never sees real competitor companies.
    const demoFilter = demoFilterFromSession(session);
    let primaryCompany;
    if (companySlug) {
      if (session.user.role !== "admin") {
        return NextResponse.json(
          { error: "Forbidden — can only view your own company" },
          { status: 403 },
        );
      }
      primaryCompany = await prisma.company.findUnique({ where: { slug: companySlug } });
    } else {
      const result = await requireUserCompany();
      if (!result.ok) return result.response;
      primaryCompany = await prisma.company.findUnique({ where: { id: result.data.company.id } });
    }

    if (!primaryCompany) {
      return NextResponse.json(
        { error: "No company found. Run the seed script first." },
        { status: 404 }
      );
    }

    // Get primary company's reputation score
    const primaryScore = await prisma.reputationScore.findFirst({
      where: { companyId: primaryCompany.id, ...demoFilter },
      orderBy: { calculatedAt: "desc" },
    });
    const yourScore = primaryScore?.overall ?? 50;

    // Get all OTHER companies in the same sector as neighbors.
    // Filter by isDemo so demo competitor companies (created by the
    // demo seed) never show up for a real user, and vice-versa.
    const sameSectorNeighbors = await prisma.company.findMany({
      where: {
        id: { not: primaryCompany.id },
        sector: primaryCompany.sector,
        ...demoFilter,
      },
      include: {
        reputationScores: {
          where: demoFilter,
          orderBy: { calculatedAt: "desc" },
          take: 1,
        },
      },
    });

    // Also get companies from adjacent sectors (for rank 3 neighbors)
    const adjacentSectorNeighbors = await prisma.company.findMany({
      where: {
        id: { not: primaryCompany.id },
        sector: { not: primaryCompany.sector },
        ...demoFilter,
      },
      include: {
        reputationScores: {
          where: demoFilter,
          orderBy: { calculatedAt: "desc" },
          take: 1,
        },
      },
      take: 5, // limit adjacent neighbors
    });

    const allNeighbors = [...sameSectorNeighbors, ...adjacentSectorNeighbors];

    // Build neighbor objects with recent moves
    const neighbors = await Promise.all(
      allNeighbors.map(async (n) => {
        const theirScore = n.reputationScores[0]?.overall ?? 50;
        const rank = assignRank(yourScore, theirScore);
        const delta = theirScore - yourScore;

        // Get recent articles for this neighbor (their "moves")
        const recentArticles = await prisma.article.findMany({
          where: { companyId: n.id, ...demoFilter },
          orderBy: { publishedAt: "desc" },
          take: 3,
        });

        const recentMoves = recentArticles.map((a) => {
          const impact = impactLevel(rank, a.sentimentScore);
          const publishedAt = a.publishedAt ? new Date(a.publishedAt) : null;
          const daysAgo = publishedAt
            ? Math.floor((Date.now() - publishedAt.getTime()) / (1000 * 60 * 60 * 24))
            : 0;
          const dateStr = daysAgo === 0 ? "today" :
                          daysAgo === 1 ? "1 day ago" :
                          daysAgo < 7 ? `${daysAgo} days ago` :
                          daysAgo < 30 ? `${Math.floor(daysAgo / 7)} weeks ago` :
                          `${Math.floor(daysAgo / 30)} months ago`;

          let impactDescription = "";
          if (rank === 1) {
            impactDescription = `Rank 1 neighbor. `;
            if (a.sentimentScore && a.sentimentScore > 0.3) {
              impactDescription += `Strong positive coverage may overshadow your narrative. Consider timing your next announcement around theirs.`;
            } else if (a.sentimentScore && a.sentimentScore < -0.3) {
              impactDescription += `Negative coverage on a direct competitor. Your positive trajectory stands out by contrast — leverage this in comms.`;
            } else {
              impactDescription += `Neutral coverage. Watch for analyst comparisons.`;
            }
          } else if (rank === 2) {
            impactDescription = `Rank 2 neighbor. `;
            if (a.sentimentScore && a.sentimentScore > 0.3) {
              impactDescription += `Positive innovation narrative. If you have a similar story, expect comparison articles.`;
            } else {
              impactDescription += `Coverage to monitor but lower direct comparison risk.`;
            }
          } else {
            impactDescription = `Rank 3 neighbor. Different sector, low direct comparison risk.`;
          }

          return {
            title: a.title,
            date: dateStr,
            impactLevel: impact,
            impactDescription,
          };
        });

        return {
          id: n.id,
          name: n.name,
          sector: n.sector,
          rank,
          reputationScore: theirScore,
          yourScore,
          delta,
          recentMoves,
        };
      })
    );

    // Sort by rank (1 first), then by delta (largest gap first)
    neighbors.sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      return Math.abs(b.delta) - Math.abs(a.delta);
    });

    return NextResponse.json({
      company: {
        id: primaryCompany.id,
        slug: primaryCompany.slug,
        name: primaryCompany.name,
        sector: primaryCompany.sector,
        yourScore,
      },
      neighbors,
      totalTracked: neighbors.length,
    });
  } catch (err) {
    logError("console.neighbors", `Neighbors API error: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
