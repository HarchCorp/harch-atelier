// ═══════════════════════════════════════════════════════════════
//  Harch Atelier — Cron endpoint for automated data refresh
//
//  Secured by CRON_SECRET env var (set in Vercel). Called by Vercel
//  Cron every 15 minutes.
//
//  HONEST DATA POLICY (no fabrication):
//  ─────────────────────────────────────────────────────────────
//  • AssetPrice ticks are created ONLY from real quotes fetched
//    via `fetchBVCQuote(ticker)` (Yahoo GDR mapping + manual CSV
//    uploads). If no live quote is available for an asset, the
//    tick is SKIPPED — we never inject `Math.random()` drift.
//  • AssetSentiment snapshots are computed by aggregating the
//    REAL `Article.sentimentScore` rows from the last 24h for
//    the asset's linked company. No score is fabricated.
//  • Cleanup tasks (expired invitations, old notifications) always
//    run regardless of market hours.
//
//  Task ID: bugfix-1 (crawler-technique objective #1)
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fetchBVCQuote, isBVCTradingOpen } from "@/lib/scrapers/bvc-prices";
import { logInfo, logError } from "@/lib/logger";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }

  if (authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  const results = {
    timestamp: new Date().toISOString(),
    tasks: [] as Array<{ task: string; status: "ok" | "error" | "skip"; detail?: string }>,
  };

  // ─── Task 1: AssetPrice ticks (REAL quotes only) ──────────────
  try {
    const assets = await prisma.asset.findMany({
      select: { id: true, ticker: true, name: true, assetType: true, exchange: true },
    });

    const marketOpen = isBVCTradingOpen(new Date());
    let created = 0;
    let skipped = 0;
    const now = new Date();

    for (const asset of assets) {
      // Only attempt live quotes for stocks. Crypto/fx/commodity have
      // no connector yet — skip honestly rather than fabricate.
      if (asset.assetType !== "stock") {
        skipped++;
        continue;
      }
      // Outside BVC hours, skip live fetches for BVC-listed assets
      // (the market is closed, no new ticks). Non-BVC stocks (e.g.
      // international GDRs) are still attempted since their exchanges
      // may be open.
      if (asset.exchange === "BVC" && !marketOpen) {
        skipped++;
        continue;
      }

      let quote;
      try {
        quote = await fetchBVCQuote(asset.ticker);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "unknown";
        logError("cron.refresh", `fetchBVCQuote(${asset.ticker}) failed: ${msg}`);
        skipped++;
        continue;
      }

      if (!quote) {
        // No live source available — SKIP. Do not fabricate.
        skipped++;
        continue;
      }

      // changePct vs last cached price (for context only)
      const lastPrice = await prisma.assetPrice.findFirst({
        where: { assetId: asset.id },
        orderBy: { tradedAt: "desc" },
        select: { price: true },
      });
      const changePct =
        lastPrice && lastPrice.price > 0
          ? ((quote.price - lastPrice.price) / lastPrice.price) * 100
          : quote.changePct ?? 0;

      await prisma.assetPrice.create({
        data: {
          assetId: asset.id,
          price: parseFloat(quote.price.toFixed(2)),
          volume: quote.volume ?? null,
          changePct: parseFloat(changePct.toFixed(2)),
          tradedAt: quote.fetchedAt || now,
        },
      });
      created++;
    }

    results.tasks.push({
      task: "asset-prices",
      status: "ok",
      detail: `${created} real ticks created, ${skipped} skipped (no live source / market closed)`,
    });
    logInfo("cron.refresh", `asset-prices: ${created} created, ${skipped} skipped`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "unknown";
    results.tasks.push({ task: "asset-prices", status: "error", detail: msg });
    logError("cron.refresh", `asset-prices error: ${msg}`);
  }

  // ─── Task 2: AssetSentiment snapshots (REAL article aggregation) ─
  try {
    const assets = await prisma.asset.findMany({
      select: { id: true, companyId: true, ticker: true },
    });
    let created = 0;
    let skipped = 0;
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    for (const asset of assets) {
      if (!asset.companyId) {
        // No linked company → no articles to aggregate → skip honestly.
        skipped++;
        continue;
      }

      // Aggregate REAL Article.sentimentScore rows for this asset's
      // company, published in the last 24h.
      const articles = await prisma.article.findMany({
        where: {
          companyId: asset.companyId,
          publishedAt: { gte: since },
          sentimentScore: { not: null },
        },
        select: { sentimentScore: true },
      });

      if (articles.length === 0) {
        // No recent scored articles — skip rather than fabricate a
        // neutral snapshot. The previous tick remains the latest.
        skipped++;
        continue;
      }

      const scores = articles
        .map((a) => a.sentimentScore)
        .filter((s): s is number => typeof s === "number" && Number.isFinite(s));

      if (scores.length === 0) {
        skipped++;
        continue;
      }

      const avg = scores.reduce((acc, s) => acc + s, 0) / scores.length;
      // Bucket by sentiment label using the same thresholds as the
      // harchiq sentiment-analyzer (>=0.15 positive, <=-0.15 negative).
      const positive = scores.filter((s) => s >= 0.15).length;
      const negative = scores.filter((s) => s <= -0.15).length;
      const neutral = scores.length - positive - negative;
      const total = scores.length;

      await prisma.assetSentiment.create({
        data: {
          assetId: asset.id,
          score: parseFloat(avg.toFixed(3)),
          positivePct: parseFloat(((positive / total) * 100).toFixed(1)),
          neutralPct: parseFloat(((neutral / total) * 100).toFixed(1)),
          negativePct: parseFloat(((negative / total) * 100).toFixed(1)),
          articleCount: total,
        },
      });
      created++;
    }

    results.tasks.push({
      task: "sentiment-snapshot",
      status: "ok",
      detail: `${created} real sentiment snapshots (from Article aggregation), ${skipped} skipped (no company / no recent scored articles)`,
    });
    logInfo("cron.refresh", `sentiment-snapshot: ${created} created, ${skipped} skipped`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "unknown";
    results.tasks.push({ task: "sentiment-snapshot", status: "error", detail: msg });
    logError("cron.refresh", `sentiment-snapshot error: ${msg}`);
  }

  // ─── Task 3: Clean up expired invitations ─────────────────────
  try {
    const expired = await prisma.invitation.deleteMany({
      where: {
        usedAt: null,
        expiresAt: { lt: new Date() },
      },
    });
    results.tasks.push({
      task: "cleanup-invitations",
      status: "ok",
      detail: `${expired.count} expired invitations removed`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "unknown";
    results.tasks.push({ task: "cleanup-invitations", status: "error", detail: msg });
  }

  // ─── Task 4: Clean up old read notifications ──────────────────
  try {
    const oldNotifs = await prisma.notification.deleteMany({
      where: {
        read: true,
        createdAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    });
    results.tasks.push({
      task: "cleanup-notifications",
      status: "ok",
      detail: `${oldNotifs.count} old notifications removed`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "unknown";
    results.tasks.push({ task: "cleanup-notifications", status: "error", detail: msg });
  }

  results.tasks.push({
    task: "cron-log",
    status: "ok",
    detail: `completed in ${Date.now() - startTime}ms`,
  });

  return NextResponse.json(results);
}
