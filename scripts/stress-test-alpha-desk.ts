// ═══════════════════════════════════════════════════════════════
//  scripts/stress-test-alpha-desk.ts
//
//  Stress-test seed for the Alpha Desk Dashboard (omega-alpha-desk).
//
//  Generates a high-frequency trading load:
//    - 500 assets across 7 markets (BVC, NYSE, NASDAQ, Euronext, NSE, JSE, EGX)
//    - 50,000 price ticks per asset over 90 days
//    - 50,000 sentiment points per asset over 90 days
//    - Inserted via Prisma in batches of 1000 to keep memory flat
//
//  Total rows inserted:
//    500 assets
//    500 × 50,000 = 25,000,000 AssetPrice rows
//    500 × 50,000 = 25,000,000 AssetSentiment rows
//    = 50,000,000 rows total
//
//  Usage:
//    # Generate + insert (NEON only — Postgres via DATABASE_URL)
//    env -u DATABASE_URL -u DIRECT_URL bun run scripts/stress-test-alpha-desk.ts
//
//    # Cleanup (delete all STRESS_ prefixed assets + their prices/sentiments)
//    env -u DATABASE_URL -u DIRECT_URL bun run scripts/stress-test-alpha-desk.ts --cleanup
//
//  Output: prints elapsed time, total rows inserted, and peak RSS.
// ═══════════════════════════════════════════════════════════════

import { prisma } from "../src/lib/db";

// ─── Configuration ──────────────────────────────────────────────
const ASSET_COUNT = 500;
const TICKS_PER_ASSET = 50_000; // 50k price ticks per asset
const DAYS_SPAN = 90; // spread over 90 days
const BATCH_SIZE = 1000; // Prisma createMany batch size

const MARKETS = ["BVC", "NYSE", "NASDAQ", "Euronext", "NSE", "JSE", "EGX"] as const;
type MarketCode = (typeof MARKETS)[number];

const MARKET_CURRENCY: Record<MarketCode, string> = {
  BVC: "MAD",
  NYSE: "USD",
  NASDAQ: "USD",
  Euronext: "EUR",
  NSE: "USD",
  JSE: "USD",
  EGX: "USD",
};

// Deterministic PRNG (mulberry32) so re-runs produce identical data,
// which makes the stress test reproducible. Seed fixed at 0xALPHA.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  const rem = Math.round(s % 60);
  return `${m}m ${rem}s`;
}

// ─── Cleanup mode ───────────────────────────────────────────────
async function cleanup(): Promise<void> {
  console.log("🧹 Stress-test cleanup — deleting all STRESS_ assets...\n");
  const t0 = Date.now();

  // AssetPrice and AssetSentiment cascade-delete with their parent Asset
  // (see prisma/schema.prisma — onDelete: Cascade on AssetPrice.asset
  // and AssetSentiment.asset).
  const deleted = await prisma.asset.deleteMany({
    where: { ticker: { startsWith: "STRESS_" } },
  });

  const elapsed = Date.now() - t0;
  const mem = process.memoryUsage();
  console.log("┌──────────────────────────────────────────────┐");
  console.log(`│ Deleted assets:        ${String(deleted.count).padStart(10)}    │`);
  console.log(`│ (cascaded prices + sentiments)               │`);
  console.log(`│ Elapsed:               ${formatDuration(elapsed).padStart(10)}    │`);
  console.log(`│ Peak RSS:              ${formatBytes(mem.rss).padStart(10)}    │`);
  console.log("└──────────────────────────────────────────────┘");
}

// ─── Seed mode ──────────────────────────────────────────────────
async function seed(): Promise<void> {
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║  ALPHA DESK STRESS TEST — omega-alpha-desk                  ║");
  console.log(`║  ${ASSET_COUNT} assets × ${TICKS_PER_ASSET.toLocaleString()} ticks × 90d       ║`);
  console.log(`║  Target: 50,000,000 AssetPrice + 50,000,000 AssetSentiment  ║`);
  console.log("╚══════════════════════════════════════════════════════════════╝\n");

  const t0 = Date.now();

  // ─── 1. Create 500 assets across 7 markets ─────────────────────
  console.log(`[1/3] Creating ${ASSET_COUNT} assets across ${MARKETS.length} markets...`);
  const assetsPerMarket = Math.floor(ASSET_COUNT / MARKETS.length);
  const remainder = ASSET_COUNT - assetsPerMarket * MARKETS.length;

  type AssetSpec = {
    ticker: string;
    name: string;
    assetType: string;
    exchange: string;
    basePrice: number;
    volatility: number;
  };

  const assetSpecs: AssetSpec[] = [];
  let idx = 0;
  for (let m = 0; m < MARKETS.length; m++) {
    const market = MARKETS[m];
    const count = assetsPerMarket + (m < remainder ? 1 : 0);
    for (let i = 0; i < count; i++) {
      const ticker = `STRESS_${market}_${String(i).padStart(3, "0")}`;
      const name = `Stress Test Asset ${market} ${i}`;
      // Stocks for equity markets; mix in some crypto/fx/commodity for variety
      const assetType = i % 17 === 0 ? "crypto" : i % 23 === 0 ? "fx" : i % 29 === 0 ? "commodity" : "stock";
      const basePrice =
        assetType === "crypto" ? 30_000 + (i * 137) % 40_000 :
        assetType === "fx" ? 0.8 + (i % 50) / 100 :
        assetType === "commodity" ? 1_500 + (i * 23) % 2_000 :
        50 + (i * 13) % 450;
      const volatility =
        assetType === "crypto" ? 0.05 :
        assetType === "fx" ? 0.005 :
        assetType === "commodity" ? 0.02 :
        0.015;
      assetSpecs.push({ ticker, name, assetType, exchange: market, basePrice, volatility });
      idx++;
    }
  }
  console.log(`     → ${assetSpecs.length} asset specs prepared`);

  // Insert assets in batches of 100 via upsert (skipDuplicates would
  // also work, but upsert lets the script be re-runnable).
  const ASSET_BATCH = 100;
  for (let i = 0; i < assetSpecs.length; i += ASSET_BATCH) {
    const batch = assetSpecs.slice(i, i + ASSET_BATCH);
    await Promise.all(
      batch.map((a) =>
        prisma.asset.upsert({
          where: { ticker: a.ticker },
          update: { name: a.name, assetType: a.assetType, exchange: a.exchange },
          create: {
            ticker: a.ticker,
            name: a.name,
            assetType: a.assetType,
            exchange: a.exchange,
          },
        })
      )
    );
    if ((i / ASSET_BATCH) % 5 === 0) {
      process.stdout.write(`\r     → ${i + batch.length}/${assetSpecs.length} assets created   `);
    }
  }
  console.log(`\r     → ${assetSpecs.length}/${assetSpecs.length} assets created   \n`);

  // Fetch asset IDs (we need them for the price + sentiment inserts)
  const createdAssets = await prisma.asset.findMany({
    where: { ticker: { startsWith: "STRESS_" } },
    select: { id: true, ticker: true },
  });
  const assetById = new Map<string, AssetSpec>();
  for (const a of createdAssets) {
    const spec = assetSpecs.find((s) => s.ticker === a.ticker);
    if (spec) assetById.set(a.id, spec);
  }
  console.log(`     → fetched ${createdAssets.length} asset IDs from DB\n`);

  // ─── 2. Generate + insert price ticks ──────────────────────────
  console.log(`[2/3] Generating ${TICKS_PER_ASSET.toLocaleString()} price ticks per asset...`);
  console.log(`     (batch size: ${BATCH_SIZE}, total target: ${(assetSpecs.length * TICKS_PER_ASSET).toLocaleString()} rows)`);

  let totalPricesInserted = 0;
  const tickSpanMs = DAYS_SPAN * 24 * 60 * 60 * 1000; // 90 days in ms
  const tickIntervalMs = tickSpanMs / TICKS_PER_ASSET; // ms between ticks
  const now = Date.now();

  for (let aIdx = 0; aIdx < createdAssets.length; aIdx++) {
    const asset = createdAssets[aIdx];
    const spec = assetById.get(asset.id);
    if (!spec) continue;
    const rng = mulberry32(0xa1fa ^ (aIdx * 0x9e3779b1));
    let prevPrice = spec.basePrice;

    // Pre-allocate the batch buffer (reused per batch to avoid GC pressure)
    const batch: Array<{
      assetId: string;
      price: number;
      volume: number | null;
      changePct: number | null;
      tradedAt: Date;
    }> = [];

    for (let t = 0; t < TICKS_PER_ASSET; t++) {
      // Random walk with slight mean reversion to keep prices positive
      const shock = (rng() - 0.5) * 2 * spec.volatility;
      const reversion = (spec.basePrice - prevPrice) / spec.basePrice * 0.01;
      const newPrice = prevPrice * (1 + shock + reversion);
      const changePct = ((newPrice - prevPrice) / prevPrice) * 100;
      const tradedAt = new Date(now - tickSpanMs + t * tickIntervalMs);

      batch.push({
        assetId: asset.id,
        price: Math.round(newPrice * 1e6) / 1e6,
        volume: Math.round(rng() * 1_000_000),
        changePct: Math.round(changePct * 1e4) / 1e4,
        tradedAt,
      });

      prevPrice = newPrice;

      if (batch.length >= BATCH_SIZE) {
        await prisma.assetPrice.createMany({ data: batch, skipDuplicates: true });
        totalPricesInserted += batch.length;
        batch.length = 0;
      }
    }
    // Flush the remainder
    if (batch.length > 0) {
      await prisma.assetPrice.createMany({ data: batch, skipDuplicates: true });
      totalPricesInserted += batch.length;
      batch.length = 0;
    }

    if ((aIdx + 1) % 25 === 0 || aIdx === createdAssets.length - 1) {
      const mem = process.memoryUsage();
      process.stdout.write(
        `\r     → asset ${aIdx + 1}/${createdAssets.length} · ` +
        `${totalPricesInserted.toLocaleString()} prices · ` +
        `RSS ${formatBytes(mem.rss)}   `
      );
    }
  }
  console.log("\n");

  // ─── 3. Generate + insert sentiment points ─────────────────────
  console.log(`[3/3] Generating ${TICKS_PER_ASSET.toLocaleString()} sentiment points per asset...`);

  let totalSentimentsInserted = 0;

  for (let aIdx = 0; aIdx < createdAssets.length; aIdx++) {
    const asset = createdAssets[aIdx];
    const spec = assetById.get(asset.id);
    if (!spec) continue;
    const rng = mulberry32(0x5e7c ^ (aIdx * 0x85ebca6b));
    // Bias: crypto more volatile sentiment, fx more neutral
    const sentBias = spec.assetType === "crypto" ? 0 : spec.assetType === "fx" ? 0 : 0.05;

    const batch: Array<{
      assetId: string;
      score: number;
      positivePct: number;
      neutralPct: number;
      negativePct: number;
      articleCount: number;
      calculatedAt: Date;
    }> = [];

    for (let t = 0; t < TICKS_PER_ASSET; t++) {
      // Sentiment in [-1, 1] with a slow random walk + per-asset bias
      const raw = (rng() - 0.5) * 2 * 0.4 + sentBias;
      const score = Math.max(-1, Math.min(1, Math.round(raw * 1e4) / 1e4));
      const positivePct = Math.round(Math.max(0, score) * 100);
      const negativePct = Math.round(Math.max(0, -score) * 100);
      const neutralPct = Math.max(0, 100 - positivePct - negativePct);
      const calculatedAt = new Date(now - tickSpanMs + t * tickIntervalMs);

      batch.push({
        assetId: asset.id,
        score,
        positivePct,
        neutralPct,
        negativePct,
        articleCount: Math.round(rng() * 50),
        calculatedAt,
      });

      if (batch.length >= BATCH_SIZE) {
        await prisma.assetSentiment.createMany({ data: batch, skipDuplicates: true });
        totalSentimentsInserted += batch.length;
        batch.length = 0;
      }
    }
    if (batch.length > 0) {
      await prisma.assetSentiment.createMany({ data: batch, skipDuplicates: true });
      totalSentimentsInserted += batch.length;
      batch.length = 0;
    }

    if ((aIdx + 1) % 25 === 0 || aIdx === createdAssets.length - 1) {
      const mem = process.memoryUsage();
      process.stdout.write(
        `\r     → asset ${aIdx + 1}/${createdAssets.length} · ` +
        `${totalSentimentsInserted.toLocaleString()} sentiments · ` +
        `RSS ${formatBytes(mem.rss)}   `
      );
    }
  }
  console.log("\n");

  // ─── Summary ───────────────────────────────────────────────────
  const elapsed = Date.now() - t0;
  const mem = process.memoryUsage();
  console.log("┌──────────────────────────────────────────────────────────┐");
  console.log(`│ Assets created:        ${String(createdAssets.length).padStart(14)}        │`);
  console.log(`│ AssetPrice rows:       ${String(totalPricesInserted).padStart(14)}        │`);
  console.log(`│ AssetSentiment rows:   ${String(totalSentimentsInserted).padStart(14)}        │`);
  console.log(`│ Total rows inserted:   ${String(totalPricesInserted + totalSentimentsInserted).padStart(14)}        │`);
  console.log(`│ Elapsed:               ${formatDuration(elapsed).padStart(14)}        │`);
  console.log(`│ Throughput:            ${Math.round((totalPricesInserted + totalSentimentsInserted) / (elapsed / 1000)).toLocaleString().padStart(14)} r/s    │`);
  console.log(`│ Peak RSS:              ${formatBytes(mem.rss).padStart(14)}        │`);
  console.log(`│ Heap used:             ${formatBytes(mem.heapUsed).padStart(14)}        │`);
  console.log("└──────────────────────────────────────────────────────────┘");
  console.log("\nStress test data ready. Open the Alpha Desk dashboard to verify:");
  console.log("  /atelier/console/harch-alpha  (login: alpha@harch.test)");
}

// ─── Main ───────────────────────────────────────────────────────
async function main(): Promise<void> {
  const isCleanup = process.argv.includes("--cleanup");
  if (isCleanup) {
    await cleanup();
  } else {
    await seed();
  }
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Stress test failed:", err);
  // eslint-disable-next-line no-process-exit
  process.exit(1);
});
