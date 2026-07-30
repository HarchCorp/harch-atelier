import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";

// ═══════════════════════════════════════════════════════════════
//  GET /api/trader/assets/[ticker]/correlation?window=30d
//
//  Returns the sentiment-to-price correlation for an asset.
//  This is the trader's KILLER FEATURE — no competitor does this
//  for Moroccan stocks.
//
//  Computes Pearson correlation between daily sentiment score and
//  daily price change over the specified window.
//
//  Auth: requires session + accountType === "trader"
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 2) return 0;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
  const sumY2 = y.reduce((acc, yi) => acc + yi * yi, 0);
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  if (denominator === 0) return 0;
  return numerator / denominator;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Admin can access any API (to preview what traders see)
  if (session.user?.accountType !== "harch-alpha" && session.user?.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden — harch-alpha account required" },
      { status: 403 }
    );
  }

  try {
    const { ticker: tickerParam } = await params;
    const ticker = tickerParam.toUpperCase();
    const url = new URL(req.url);
    const windowDays = parseInt(url.searchParams.get("window") || "30", 10);
    const days = Math.min(Math.max(windowDays, 7), 90);

    const asset = await prisma.asset.findUnique({
      where: { ticker },
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const since = new Date();
    since.setDate(since.getDate() - days);

    const [prices, sentiments] = await Promise.all([
      prisma.assetPrice.findMany({
        where: { assetId: asset.id, tradedAt: { gte: since } },
        orderBy: { tradedAt: "asc" },
      }),
      prisma.assetSentiment.findMany({
        where: { assetId: asset.id, calculatedAt: { gte: since } },
        orderBy: { calculatedAt: "asc" },
      }),
    ]);

    const priceByDate = new Map<string, { price: number; changePct: number | null }>();
    for (const p of prices) {
      const dateKey = p.tradedAt.toISOString().slice(0, 10);
      priceByDate.set(dateKey, { price: p.price, changePct: p.changePct });
    }

    const sentimentByDate = new Map<string, number>();
    for (const s of sentiments) {
      const dateKey = s.calculatedAt.toISOString().slice(0, 10);
      sentimentByDate.set(dateKey, s.score);
    }

    const allDates = new Set([...priceByDate.keys(), ...sentimentByDate.keys()]);
    const alignedDates = Array.from(allDates).sort();
    const sentimentArr: number[] = [];
    const priceChangeArr: number[] = [];
    const alignedData: { date: string; sentiment: number | null; price: number | null; changePct: number | null }[] = [];

    for (const date of alignedDates) {
      const sentiment = sentimentByDate.get(date) ?? null;
      const priceData = priceByDate.get(date) ?? null;
      if (sentiment !== null && priceData && priceData.changePct !== null && priceData.changePct !== undefined) {
        sentimentArr.push(sentiment);
        priceChangeArr.push(priceData.changePct);
      }
      alignedData.push({
        date,
        sentiment,
        price: priceData ? priceData.price : null,
        changePct: priceData ? priceData.changePct : null,
      });
    }

    const correlation = pearsonCorrelation(sentimentArr, priceChangeArr);

    let interpretation: string;
    const absCorr = Math.abs(correlation);
    if (absCorr < 0.1) interpretation = "No meaningful correlation — sentiment doesn't predict price.";
    else if (absCorr < 0.3) interpretation = "Weak correlation — sentiment has limited predictive value.";
    else if (absCorr < 0.5) interpretation = "Moderate correlation — sentiment partially predicts price.";
    else if (absCorr < 0.7) interpretation = "Strong correlation — sentiment is a useful price signal.";
    else interpretation = "Very strong correlation — sentiment strongly predicts price moves.";

    const direction = correlation > 0 ? "positive" : "negative";

    return NextResponse.json({
      asset: { ticker: asset.ticker, name: asset.name, assetType: asset.assetType },
      window: `${days} days`,
      correlation,
      direction,
      interpretation,
      dataPoints: sentimentArr.length,
      alignedData,
    });
  } catch (err) {
    console.error("Trader correlation error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
