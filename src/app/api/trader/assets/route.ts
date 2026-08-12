import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { logError } from "@/lib/logger";
import { isAccountTypeAllowed } from "@/lib/auth/rbac";

// ═══════════════════════════════════════════════════════════════
//  GET /api/trader/assets
//
//  Returns all assets the trader can monitor (stocks on BVC, crypto,
//  commodities, FX). Links to Company when the asset is a listed stock.
//
//  Auth: requires session + accountType === "trader"
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Admin can access any API (to preview what users see)
  if (!isAccountTypeAllowed(session, ["agency"])) {
    return NextResponse.json(
      { error: "Forbidden — agency account required" },
      { status: 403 }
    );
  }

  try {
    const assets = await prisma.asset.findMany({
      orderBy: [{ assetType: "asc" }, { ticker: "asc" }],
      include: {
        company: {
          select: { slug: true, name: true, sector: true },
        },
        sentiments: {
          orderBy: { calculatedAt: "desc" },
          take: 1,
        },
        prices: {
          orderBy: { tradedAt: "desc" },
          take: 1,
        },
      },
    });

    const formatted = assets.map((a) => ({
      id: a.id,
      ticker: a.ticker,
      name: a.name,
      assetType: a.assetType,
      exchange: a.exchange,
      company: a.company
        ? { slug: a.company.slug, name: a.company.name, sector: a.company.sector }
        : null,
      latestPrice: a.prices[0]?.price ?? null,
      latestChange: a.prices[0]?.changePct ?? null,
      latestSentiment: a.sentiments[0]?.score ?? null,
      sentimentArticleCount: a.sentiments[0]?.articleCount ?? 0,
    }));

    return NextResponse.json({ assets: formatted });
  } catch (err) {
    logError("trader.assets", `Trader assets error: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
