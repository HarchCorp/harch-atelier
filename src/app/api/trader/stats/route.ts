import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { logError } from "@/lib/logger";
import { isAccountTypeAllowed } from "@/lib/auth/rbac";

// ═══════════════════════════════════════════════════════════════
//  GET /api/trader/stats
//
//  Returns KPI strip data for the trader console:
//  - Total assets tracked
//  - Average sentiment across watchlist
//  - Top mover (biggest sentiment change 24h)
//  - Active alerts count
//  - Best correlation (strongest sentiment→price)
//
//  Auth: harch-alpha or admin
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAccountTypeAllowed(session, ["agency"])) {
    return NextResponse.json({ error: "Forbidden — agency account required" }, { status: 403 });
  }

  try {
    const assets = await prisma.asset.findMany({
      include: {
        sentiments: { orderBy: { calculatedAt: "desc" }, take: 2 },
        prices: { orderBy: { tradedAt: "desc" }, take: 2 },
      },
    });

    // Calculate stats
    const totalAssets = assets.length;

    // Average sentiment (latest)
    const latestSentiments = assets
      .map((a) => a.sentiments[0]?.score)
      .filter((s): s is number => s !== undefined);
    const avgSentiment = latestSentiments.length > 0
      ? latestSentiments.reduce((sum, s) => sum + s, 0) / latestSentiments.length
      : 0;

    // Top mover (biggest sentiment change between last 2 entries)
    let topMover: { ticker: string; name: string; change: number } | null = null;
    for (const a of assets) {
      if (a.sentiments.length >= 2) {
        const change = a.sentiments[0].score - a.sentiments[1].score;
        if (!topMover || Math.abs(change) > Math.abs(topMover.change)) {
          topMover = { ticker: a.ticker, name: a.name, change };
        }
      }
    }

    // Top gainer/loser by price
    let topGainer: { ticker: string; name: string; changePct: number } | null = null;
    let topLoser: { ticker: string; name: string; changePct: number } | null = null;
    for (const a of assets) {
      if (a.prices.length >= 1 && a.prices[0].changePct !== null) {
        const changePct = a.prices[0].changePct;
        if (!topGainer || changePct > topGainer.changePct) {
          topGainer = { ticker: a.ticker, name: a.name, changePct };
        }
        if (!topLoser || changePct < topLoser.changePct) {
          topLoser = { ticker: a.ticker, name: a.name, changePct };
        }
      }
    }

    // Asset type breakdown
    const typeBreakdown: Record<string, number> = {};
    for (const a of assets) {
      typeBreakdown[a.assetType] = (typeBreakdown[a.assetType] || 0) + 1;
    }

    return NextResponse.json({
      totalAssets,
      avgSentiment: Math.round(avgSentiment * 100) / 100,
      topMover,
      topGainer,
      topLoser,
      typeBreakdown,
      alertsActive: 0, // TODO: implement alert rules
    });
  } catch (err) {
    logError("trader.stats", `Trader stats error: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
