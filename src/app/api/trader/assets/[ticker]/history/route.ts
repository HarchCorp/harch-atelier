import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { logError } from "@/lib/logger";

// ═══════════════════════════════════════════════════════════════
//  GET /api/trader/assets/[ticker]/history?window=7|30|90
//
//  Returns historical price + sentiment data for a specific asset.
//  Each row is one day:
//    - date       : YYYY-MM-DD
//    - price      : AssetPrice.price
//    - sentiment  : AssetSentiment.score (-1..1)
//    - volume     : AssetPrice.volume (nullable)
//
//  Stats (over the window):
//    - priceChange      : % difference between last and first price
//    - sentimentChange  : delta between last and first sentiment
//    - correlation      : Pearson r between sentiment and price
//                         daily change (only days with both)
//    - volatility       : stddev of daily price changes / mean price
//
//  Auth: requires session + accountType === "harch-alpha" (admin
//  can preview).
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

function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function round(v: number, decimals = 4): number {
  const f = 10 ** decimals;
  return Math.round(v * f) / f;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
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
    const windowParam = parseInt(url.searchParams.get("window") || "30", 10);
    const window = Math.min(Math.max(windowParam || 30, 7), 90);

    const asset = await prisma.asset.findUnique({
      where: { ticker },
      select: { id: true, ticker: true, name: true, assetType: true, exchange: true },
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const since = new Date();
    since.setDate(since.getDate() - window);
    since.setHours(0, 0, 0, 0);

    const [prices, sentiments] = await Promise.all([
      prisma.assetPrice.findMany({
        where: { assetId: asset.id, tradedAt: { gte: since } },
        orderBy: { tradedAt: "asc" },
        select: { price: true, volume: true, changePct: true, tradedAt: true },
      }),
      prisma.assetSentiment.findMany({
        where: { assetId: asset.id, calculatedAt: { gte: since } },
        orderBy: { calculatedAt: "asc" },
        select: { score: true, articleCount: true, calculatedAt: true },
      }),
    ]);

    const priceByDate = new Map<string, { price: number; volume: number | null; changePct: number | null }>();
    for (const p of prices) {
      const key = p.tradedAt.toISOString().slice(0, 10);
      // If multiple points per day, keep the last (closing).
      priceByDate.set(key, { price: p.price, volume: p.volume, changePct: p.changePct });
    }

    const sentimentByDate = new Map<string, { score: number; articleCount: number }>();
    for (const s of sentiments) {
      const key = s.calculatedAt.toISOString().slice(0, 10);
      // Keep the latest calculation of the day.
      sentimentByDate.set(key, { score: s.score, articleCount: s.articleCount });
    }

    // Build a continuous series of days so chart x-axis is gap-free.
    const data: {
      date: string;
      price: number | null;
      sentiment: number | null;
      volume: number | null;
    }[] = [];

    const today = new Date();
    for (let d = new Date(since); d <= today; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      const priceRow = priceByDate.get(key) ?? null;
      const sentRow = sentimentByDate.get(key) ?? null;
      data.push({
        date: key,
        price: priceRow ? round(priceRow.price, 2) : null,
        sentiment: sentRow ? round(sentRow.score, 4) : null,
        volume: priceRow && priceRow.volume !== null ? round(priceRow.volume, 2) : null,
      });
    }

    // Stats.
    const priceSeries = data.map((d) => d.price).filter((p): p is number => p !== null);
    const sentimentSeries = data.map((d) => d.sentiment).filter((s): s is number => s !== null);

    const firstPrice = priceSeries.length > 0 ? priceSeries[0] : null;
    const lastPrice = priceSeries.length > 0 ? priceSeries[priceSeries.length - 1] : null;
    const priceChange =
      firstPrice !== null && lastPrice !== null && firstPrice !== 0
        ? round(((lastPrice - firstPrice) / firstPrice) * 100, 2)
        : 0;

    const firstSent = sentimentSeries.length > 0 ? sentimentSeries[0] : null;
    const lastSent = sentimentSeries.length > 0 ? sentimentSeries[sentimentSeries.length - 1] : null;
    const sentimentChange =
      firstSent !== null && lastSent !== null ? round(lastSent - firstSent, 4) : 0;

    // Correlation: align sentiment with price daily % change.
    const corrX: number[] = [];
    const corrY: number[] = [];
    for (const d of data) {
      if (d.sentiment !== null && d.price !== null) {
        // Use the next-day price change if available; otherwise skip.
        // Simpler: use stored changePct when present.
        const priceRow = priceByDate.get(d.date);
        if (priceRow && priceRow.changePct !== null && priceRow.changePct !== undefined) {
          corrX.push(d.sentiment);
          corrY.push(priceRow.changePct);
        }
      }
    }
    const correlation = round(pearsonCorrelation(corrX, corrY), 4);

    // Volatility: stddev of price returns (changePct) normalised to mean
    // price — i.e. coefficient of variation of returns.
    const returns: number[] = [];
    for (const p of prices) {
      if (p.changePct !== null && p.changePct !== undefined) returns.push(p.changePct);
    }
    const meanPrice = priceSeries.length > 0
      ? priceSeries.reduce((a, b) => a + b, 0) / priceSeries.length
      : 0;
    const volatility = meanPrice > 0 ? round(stddev(returns) / 100, 4) : 0;

    return NextResponse.json({
      ticker: asset.ticker,
      name: asset.name,
      assetType: asset.assetType,
      exchange: asset.exchange,
      window,
      data,
      stats: {
        priceChange,
        sentimentChange,
        correlation,
        volatility,
        dataPoints: data.filter((d) => d.price !== null || d.sentiment !== null).length,
        pricePoints: priceSeries.length,
        sentimentPoints: sentimentSeries.length,
      },
    });
  } catch (err) {
    logError("trader.assets.ticker.history", `Trader asset history error: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
