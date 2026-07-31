import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";

// ═══════════════════════════════════════════════════════════════
//  GET /api/trader/stream?tickers=OCP,IAM,ATW
//
//  Real-time price ticker snapshot (simulated via random walk).
//  Designed to be polled every 2-3 seconds by the Alpha Desk
//  ticker tape. Returns a single snapshot of all requested tickers
//  with: current price (random walk ±0.5%/call), change since
//  last call, timestamp, mini sentiment score (random walk ±0.05),
//  and a synthetic volume.
//
//  Auth: requires session + accountType === "harch-alpha"
//  (admins can preview).
//
//  State is held in a module-level Map so successive polls of the
//  same ticker continue the random walk from the last known price.
//  This is a deliberate simulation — when we move to a real
//  WebSocket gateway (socket.io) the same response shape will be
//  pushed to subscribers and this Map will be replaced by the
//  exchange feed.
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

// ─── Per-ticker walk state ─────────────────────────────────────
interface TickerState {
  price: number;
  prevPrice: number;       // price at the previous poll (for `change`)
  sentiment: number;       // current sentiment score in [-1, 1]
  volume: number;          // rolling synthetic volume
}

const streamState = new Map<string, TickerState>();

// Seed prices for tickers we have never seen before. In a real
// system these would come from the exchange; here we use a
// deterministic-ish fallback table for the most common BVC tickers
// and a generic baseline for the rest. The first poll always
// resolves the seed against the database (latestPrice) when
// available, so the walk starts from a real anchor.
const SEED_PRICES: Record<string, number> = {
  OCP: 850,
  IAM: 92,
  ATW: 540,
  BCP: 180,
  BMCE: 190,
  CIMAR: 1700,
  COSUMAR: 200,
  INVOC: 9,
  LBANK: 1100,
  MAGH: 110,
  MASI: 13000,
  RISAM: 30,
  SFA: 1000,
  SNG: 220,
  SOCHA: 6000,
  TQM: 70,
  WAUL: 200,
};

function seedPriceFor(ticker: string): number {
  if (SEED_PRICES[ticker]) return SEED_PRICES[ticker];
  // Hash the ticker to a stable baseline between 50 and 500 so
  // each unknown ticker starts at a reproducible price.
  let h = 0;
  for (let i = 0; i < ticker.length; i++) h = (h * 31 + ticker.charCodeAt(i)) | 0;
  const base = 50 + (Math.abs(h) % 450);
  return base;
}

function seedSentimentFor(ticker: string): number {
  // Stable starting sentiment in [-0.2, 0.2]
  let h = 0;
  for (let i = 0; i < ticker.length; i++) h = (h * 17 + ticker.charCodeAt(i)) | 0;
  return (Math.abs(h) % 400) / 1000 - 0.2;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

// Advance the random walk for a single ticker. Called on every
// poll. Returns the new state.
function advanceTicker(ticker: string, dbAnchor: number | null): TickerState {
  const prev = streamState.get(ticker);
  if (!prev) {
    const seed = dbAnchor ?? seedPriceFor(ticker);
    const initial: TickerState = {
      price: seed,
      prevPrice: seed,
      sentiment: seedSentimentFor(ticker),
      volume: 50_000 + Math.floor(Math.random() * 100_000),
    };
    streamState.set(ticker, initial);
    return initial;
  }
  // ±0.5% random walk on price
  const drift = (Math.random() - 0.5) * 0.01; // -0.5% .. +0.5%
  const nextPrice = Math.max(0.01, prev.price * (1 + drift));
  // ±0.05 random walk on sentiment, clamped to [-1, 1]
  const sentDrift = (Math.random() - 0.5) * 0.1;
  const nextSent = clamp(prev.sentiment + sentDrift, -1, 1);
  // Volume: random walk up/down a few %, floored at 1k
  const volDrift = (Math.random() - 0.45) * 0.05;
  const nextVol = Math.max(1000, Math.round(prev.volume * (1 + volDrift)));
  const next: TickerState = {
    price: nextPrice,
    prevPrice: prev.price,
    sentiment: nextSent,
    volume: nextVol,
  };
  streamState.set(ticker, next);
  return next;
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
    // Cap to 50 tickers to keep the response small + the random
    // walk bounded under a worst-case flood of polls.
    .slice(0, 50);

  if (tickers.length === 0) {
    return NextResponse.json(
      { error: "Missing or invalid `tickers` query param" },
      { status: 400 },
    );
  }

  // Resolve DB anchors in a single round-trip so tickers we have
  // never seen start their walk from a real latestPrice. Only the
  // tickers not yet in streamState need a DB lookup; the rest
  // continue their walk from memory.
  const needLookup = tickers.filter((t) => !streamState.has(t));
  const dbAnchors: Record<string, number | null> = {};
  if (needLookup.length > 0) {
    try {
      const rows = await prisma.asset.findMany({
        where: { ticker: { in: needLookup } },
        select: {
          ticker: true,
          prices: { orderBy: { tradedAt: "desc" }, take: 1, select: { price: true } },
        },
      });
      for (const r of rows) {
        dbAnchors[r.ticker] = r.prices[0]?.price ?? null;
      }
    } catch {
      // DB is optional for the simulation — fall back to seed prices.
    }
  }

  const out = tickers.map((t) => {
    const st = advanceTicker(t, dbAnchors[t] ?? null);
    const change = st.prevPrice === 0
      ? 0
      : ((st.price - st.prevPrice) / st.prevPrice) * 100;
    return {
      ticker: t,
      price: Number(st.price.toFixed(2)),
      change: Number(change.toFixed(2)),
      sentiment: Number(st.sentiment.toFixed(2)),
      volume: st.volume,
    };
  });

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    tickers: out,
  });
}
