import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { fetchBVCQuote } from "@/lib/scrapers/bvc-prices";

// ═══════════════════════════════════════════════════════════════
//  GET /api/trader/stream?tickers=OCP,IAM,ATW
//
//  Real-time price ticker snapshot — HONEST data layer (V12).
//
//  Previous versions used a random-walk simulation. We removed
//  that — fabricating prices was dishonest. The new flow:
//
//    1. For each ticker, try to fetch a REAL price via
//       `fetchBVCQuote` (Yahoo → Investing → null).
//    2. If a real price is found → return it with
//       `source: "live"` and write a fresh AssetPrice row so
//       the chart history picks it up.
//    3. If no live source (market closed, Yahoo 404, Investing
//       403) → return the latest cached AssetPrice row with
//       `source: "cached"`.
//    4. If no live AND no cached history → return `price: null`
//       with `source: "unavailable"` and `change: null`. The
//       UI shows an "UNAVAILABLE" badge.
//
//  Sentiment is read from the latest AssetSentiment row (or
//   `null` if there is none). Volume is read from the live or
//  cached row (or `null`).
//
//  Auth: requires session + accountType === "harch-alpha"
//  (admins can preview).
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

// In-memory dedupe: only write one AssetPrice row per ticker per
// UTC day per server process. Yahoo returns the same last close
// for the whole trading day, so without this we would write a
// duplicate row every 3 s when the dashboard polls.
const writtenToday = new Map<string, string>(); // ticker → YYYY-MM-DD

function utcDayKey(d: Date = new Date()): string {
  return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (
    session.user?.accountType !== "harch-alpha" &&
    session.user?.role !== "admin"
  ) {
    return NextResponse.json(
      { error: "Forbidden — harch-alpha account required" },
      { status: 403 },
    );
  }

  const url = new URL(req.url);
  const raw = url.searchParams.get("tickers") ?? "";
  const tickers = raw
    .split(",")
    .map((t) => t.trim().toUpperCase())
    .filter((t) => t.length > 0 && t.length <= 12)
    // Cap to 50 tickers per request — keeps Yahoo rate-limit
    // breathing room (50 sequential calls ≈ 25 s worst case).
    .slice(0, 50);

  if (tickers.length === 0) {
    return NextResponse.json(
      { error: "Missing or invalid `tickers` query param" },
      { status: 400 },
    );
  }

  // ─── Resolve assets + latest cached price + sentiment ────
  // We do this in a single round-trip per ticker (one query with
  // relations) so a 50-ticker poll is 50 small selects, not 150.
  type AssetWithCache = {
    id: string;
    ticker: string;
    exchange: string | null;
    prices: Array<{ price: number; changePct: number | null; volume: number | null; tradedAt: Date }>;
    sentiments: Array<{ score: number; articleCount: number }>;
  };

  const assets = await prisma.asset.findMany({
    where: { ticker: { in: tickers } },
    select: {
      id: true,
      ticker: true,
      exchange: true,
      prices: {
        orderBy: { tradedAt: "desc" },
        take: 1,
        select: {
          price: true,
          changePct: true,
          volume: true,
          tradedAt: true,
        },
      },
      sentiments: {
        orderBy: { calculatedAt: "desc" },
        take: 1,
        select: { score: true, articleCount: true },
      },
    },
  });

  const assetByTicker = new Map<string, AssetWithCache>();
  for (const a of assets) assetByTicker.set(a.ticker, a as AssetWithCache);

  // ─── Per-ticker resolution ───────────────────────────────
  const out = await Promise.all(
    tickers.map(async (ticker) => {
      const asset = assetByTicker.get(ticker) ?? null;
      const cached = asset?.prices[0] ?? null;
      const sentiment = asset?.sentiments[0]?.score ?? null;
      const sentimentArticleCount = asset?.sentiments[0]?.articleCount ?? 0;

      // Try a live fetch. Yahoo has no BVC coverage for most
      // tickers, so this returns null for ~95% of BVC assets —
      // in which case we fall through to the cached row.
      const quote = await fetchBVCQuote(ticker);

      if (quote) {
        // ─── LIVE ───────────────────────────────────────
        // Persist the live price so the chart history grows,
        // but only once per UTC day per ticker per process to
        // avoid duplicate-every-3-s rows when the dashboard
        // polls.
        const dayKey = utcDayKey(quote.fetchedAt);
        if (
          asset &&
          (writtenToday.get(ticker) !== dayKey ||
            cached === null ||
            Math.abs(quote.price - cached.price) >= 0.001)
        ) {
          try {
            await prisma.assetPrice.create({
              data: {
                assetId: asset.id,
                price: Number(quote.price.toFixed(4)),
                changePct: Number(quote.changePct.toFixed(4)),
                volume: quote.volume ?? null,
                tradedAt: quote.fetchedAt,
              },
            });
            writtenToday.set(ticker, dayKey);
          } catch {
            // Insert is best-effort — the response still
            // carries the live price even if persistence fails.
          }
        }

        return {
          ticker,
          price: Number(quote.price.toFixed(4)),
          change: Number(quote.changePct.toFixed(2)),
          sentiment,
          sentimentArticleCount,
          volume: quote.volume ?? null,
          source: "live" as const,
          sourceEngine: quote.source, // "yahoo" | "investing"
          exchange: quote.exchange,
          currency: quote.currency,
          fetchedAt: quote.fetchedAt.toISOString(),
        };
      }

      // ─── CACHED (last known good) ──────────────────────
      if (cached) {
        return {
          ticker,
          price: Number(cached.price.toFixed(4)),
          change: cached.changePct !== null
            ? Number(cached.changePct.toFixed(2))
            : null,
          sentiment,
          sentimentArticleCount,
          volume: cached.volume ?? null,
          source: "cached" as const,
          sourceEngine: null,
          exchange: asset?.exchange ?? null,
          currency: "MAD",
          fetchedAt: cached.tradedAt.toISOString(),
        };
      }

      // ─── UNAVAILABLE ───────────────────────────────────
      // No live source AND no cached history. Be honest:
      // return nulls, the UI shows an UNAVAILABLE badge.
      return {
        ticker,
        price: null,
        change: null,
        sentiment: null,
        sentimentArticleCount: 0,
        volume: null,
        source: "unavailable" as const,
        sourceEngine: null,
        exchange: asset?.exchange ?? null,
        currency: "MAD",
        fetchedAt: null,
      };
    }),
  );

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    tickers: out,
  });
}
