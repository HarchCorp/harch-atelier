// ═══════════════════════════════════════════════════════════════
//  test-bvc-tickers.ts
//  Run: `bun --ts scripts/test-bvc-tickers.ts`
//
//  Probes the BVC price fetcher against the 10 canonical BVC
//  tickers from the brief. For each ticker we report:
//
//    ticker           BVC symbol under test
//    yahoo            "OK <price> <currency> <exchange>" | "MISS"
//    investing        "OK <price>" | "BLOCKED 403" | "SKIP"
//    final            which source fetchBVCQuote resolved to
//    price            numeric price or null
//    cached           last known price in the DB (or null)
//    source           "yahoo" | "investing" | "manual" | "none"
//
//  The output is the empirical basis for the documentation in
//  `src/lib/scrapers/bvc-prices.ts` — re-run after any change to
//  Yahoo's coverage / Investing.com scraping / proxy to refresh
//  the truth table.
//
//  NOTE: this script does NOT touch the database write path. It
//  only reads `asset.prices[0]` to display the cached price; no
//  inserts, no updates.
// ═══════════════════════════════════════════════════════════════

import { prisma } from "../src/lib/db";
import {
  fetchBVCQuote,
  fetchYahooQuote,
  fetchInvestingQuote,
} from "../src/lib/scrapers/bvc-prices";

const TICKERS = [
  "IAM",
  "OCP",
  "ATW",
  "BCP",
  "CIH",
  "CFG",
  "LAS",
  "CSU",
  "MNG",
  "LHM",
];

interface Row {
  ticker: string;
  yahoo: string;
  investing: string;
  final: string;
  price: number | null;
  cached: number | null;
  source: string;
}

function fmtPrice(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

async function main() {
  console.log("");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  BVC PRICE FETCHER — live probe");
  console.log("  Tests Yahoo Finance (.PA / .L GDRs) + Investing.com scraping");
  console.log("  against the 10 canonical BVC tickers from the brief.");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("");

  // Cache the latest DB price for each ticker (single round-trip).
  const cachedByTicker = new Map<string, number | null>();
  try {
    const assets = await prisma.asset.findMany({
      where: { ticker: { in: TICKERS } },
      select: {
        ticker: true,
        exchange: true,
        prices: {
          orderBy: { tradedAt: "desc" },
          take: 1,
          select: { price: true },
        },
      },
    });
    for (const a of assets) {
      cachedByTicker.set(a.ticker, a.prices[0]?.price ?? null);
    }
  } catch (err) {
    console.log(
      "  (DB lookup failed — running without cached prices: " +
        (err instanceof Error ? err.message : "unknown") +
        ")",
    );
    console.log("");
  }

  const rows: Row[] = [];
  for (const ticker of TICKERS) {
    // Yahoo first (parallel-friendly but we run sequentially to
    // stay well under Yahoo's rate limit during a one-off probe).
    const y = await fetchYahooQuote(ticker);
    const yahoo = y
      ? `OK ${fmtPrice(y.price)} ${y.currency} ${y.exchange}`
      : "MISS";

    const inv = await fetchInvestingQuote(ticker);
    const investing = inv
      ? `OK ${fmtPrice(inv.price)}`
      : "BLOCKED 403";

    const quote = await fetchBVCQuote(ticker);
    const price = quote?.price ?? null;
    const source = quote?.source ?? "none";
    const final = quote ? `RESOLVED → ${source}` : "NO SOURCE (would use cached or N/A)";

    rows.push({
      ticker,
      yahoo,
      investing,
      final,
      price,
      cached: cachedByTicker.get(ticker) ?? null,
      source,
    });

    // Print one line per ticker so the operator sees progress.
    console.log(`  ${ticker.padEnd(5)} | yahoo: ${yahoo.padEnd(34)} | investing: ${investing.padEnd(14)}`);
  }

  console.log("");
  console.log("── Final resolution (fetchBVCQuote) ───────────────────────────");
  console.log("");
  for (const r of rows) {
    console.log(`  ${r.ticker.padEnd(5)} | ${r.final.padEnd(36)} | price: ${fmtPrice(r.price).padStart(12)} | cached: ${fmtPrice(r.cached).padStart(12)}`);
  }

  console.log("");
  console.log("── Summary ───────────────────────────────────────────────────");
  const liveYahoo = rows.filter((r) => r.source === "yahoo").length;
  const liveInv = rows.filter((r) => r.source === "investing").length;
  const none = rows.filter((r) => r.source === "none").length;
  console.log(`  Yahoo live:    ${liveYahoo}/${rows.length}`);
  console.log(`  Investing live: ${liveInv}/${rows.length}`);
  console.log(`  No live source: ${none}/${rows.length}  (these need cached DB prices or manual CSV upload)`);
  console.log("");

  // List which tickers worked and which didn't, so the operator
  // can decide what to upload via the admin CSV route.
  const working = rows.filter((r) => r.source !== "none").map((r) => r.ticker);
  const failing = rows.filter((r) => r.source === "none").map((r) => r.ticker);
  console.log(`  Working tickers (live source available):  ${working.length ? working.join(", ") : "(none)"}`);
  console.log(`  Failing tickers (need cached/manual):     ${failing.length ? failing.join(", ") : "(none)"}`);
  console.log("");
  console.log("═══════════════════════════════════════════════════════════════");
}

main()
  .catch((err) => {
    console.error("FATAL:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
