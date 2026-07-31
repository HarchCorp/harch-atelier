// ═══════════════════════════════════════════════════════════════
//  GET /api/cron/refresh-bvc-prices
//
//  Vercel Cron job — runs every 15 minutes during BVC trading
//  hours (Mon–Fri 09:00–17:00 Casablanca, = 08:00–16:00 UTC).
//  Schedule is declared in `vercel.json`:
//      "*/15 9-16 * * 1-5"
//  (UTC. 9–16 is the safe overlap with 8–16 UTC BVC open.)
//
//  For each Asset with `exchange === "BVC"`:
//    1. Call `fetchBVCQuote(ticker)` (Yahoo → Investing → null).
//    2. If a real price comes back → insert a new AssetPrice row.
//    3. If null → SKIP. The last cached price stays. We do NOT
//       fabricate a price. We log the miss so the operator can
//       see which tickers need a manual upload.
//
//  Auth: `Authorization: Bearer ${CRON_SECRET}`.
//  Idempotency: a single cron tick never inserts more than one
//  row per asset (it reads the latest cached price first and
//  only inserts when the new price differs by ≥0.001 MAD, to
//  avoid duplicate-every-15-min rows when Yahoo returns the same
//  last close across the whole trading day).
//
//  Returns a JSON summary:
//    { ts, tradingOpen, fetched, updated, unchanged, failed, details[] }
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  fetchBVCQuote,
  isBVCTradingOpen,
  type BVCQuote,
} from "@/lib/scrapers/bvc-prices";

export const dynamic = "force-dynamic";
// Vercel cron runs at most every minute on the Hobby plan; the
// 15-min cadence is enforced by the schedule in `vercel.json`.
export const maxDuration = 60;

type Detail = {
  ticker: string;
  status: "live" | "unchanged" | "no-source" | "error";
  source?: BVCQuote["source"];
  price?: number | null;
  message?: string;
};

export async function GET(req: NextRequest) {
  // ─── Auth ────────────────────────────────────────────────
  const authHeader = req.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 },
    );
  }
  if (authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ts = new Date().toISOString();
  const tradingOpen = isBVCTradingOpen(new Date());

  // ─── Skip when market is closed ─────────────────────────
  // The cron still fires per the schedule, but we exit early so
  // we don't burn Yahoo rate-limit quota on a closed market.
  if (!tradingOpen) {
    return NextResponse.json({
      ts,
      tradingOpen: false,
      fetched: 0,
      updated: 0,
      unchanged: 0,
      failed: 0,
      details: [],
      message: "BVC is closed (outside Mon–Fri 09:00–17:00 Casablanca). Skipping.",
    });
  }

  // ─── Load all BVC assets ────────────────────────────────
  const assets = await prisma.asset.findMany({
    where: { exchange: "BVC" },
    select: {
      id: true,
      ticker: true,
      name: true,
      prices: {
        orderBy: { tradedAt: "desc" },
        take: 1,
        select: { price: true, tradedAt: true },
      },
    },
  });

  const details: Detail[] = [];
  let updated = 0;
  let unchanged = 0;
  let failed = 0;

  for (const asset of assets) {
    try {
      const quote = await fetchBVCQuote(asset.ticker);

      // No live source — skip and log. Last cached price stays.
      if (!quote) {
        failed += 1;
        details.push({
          ticker: asset.ticker,
          status: "no-source",
          price: asset.prices[0]?.price ?? null,
          message:
            asset.prices[0]
              ? `No live source — keeping cached price (${asset.prices[0].price})`
              : "No live source AND no cached price — needs manual upload",
        });
        continue;
      }

      // Idempotency: if the new price is within 0.001 MAD of the
      // latest cached price AND the latest cached price is from
      // the same UTC day, treat it as "unchanged" and skip the
      // insert. Yahoo returns the same `regularMarketPrice` for
      // the whole trading day, so without this guard we would
      // insert ~32 identical rows per asset per day.
      const lastPrice = asset.prices[0]?.price ?? null;
      const lastTradedAt = asset.prices[0]?.tradedAt;
      const sameDay =
        lastTradedAt &&
        lastTradedAt.getUTCFullYear() === new Date().getUTCFullYear() &&
        lastTradedAt.getUTCMonth() === new Date().getUTCMonth() &&
        lastTradedAt.getUTCDate() === new Date().getUTCDate();
      const samePrice =
        lastPrice !== null && Math.abs(quote.price - lastPrice) < 0.001;

      if (sameDay && samePrice) {
        unchanged += 1;
        details.push({
          ticker: asset.ticker,
          status: "unchanged",
          source: quote.source,
          price: quote.price,
          message: "Same price as last tick — skipped insert",
        });
        continue;
      }

      // Insert the real price.
      await prisma.assetPrice.create({
        data: {
          assetId: asset.id,
          price: Number(quote.price.toFixed(4)),
          changePct: Number(quote.changePct.toFixed(4)),
          volume: quote.volume ?? null,
          tradedAt: quote.fetchedAt,
        },
      });
      updated += 1;
      details.push({
        ticker: asset.ticker,
        status: "live",
        source: quote.source,
        price: quote.price,
        message: `Updated from ${quote.source} (${quote.exchange} ${quote.currency})`,
      });
    } catch (err) {
      failed += 1;
      details.push({
        ticker: asset.ticker,
        status: "error",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return NextResponse.json({
    ts,
    tradingOpen: true,
    assets: assets.length,
    fetched: assets.length,
    updated,
    unchanged,
    failed,
    details,
  });
}
