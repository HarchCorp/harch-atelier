// Harch Atelier — Cron endpoint for automated data refresh
// Secured by CRON_SECRET env var (set in Vercel)
// Called by Vercel Cron every 15 minutes

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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

  // Task 1: Create a new AssetPrice snapshot for each asset (market tick)
  try {
    const assets = await prisma.asset.findMany({ select: { id: true, ticker: true } });
    const now = new Date();
    let created = 0;

    // Get the latest price for each asset to compute drift
    const latestPrices = await prisma.assetPrice.findMany({
      where: { tradedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      orderBy: { tradedAt: "desc" },
      distinct: ["assetId"],
      select: { assetId: true, price: true },
    });
    const priceMap = new Map(latestPrices.map((p) => [p.assetId, p.price]));

    for (const asset of assets) {
      const basePrice = priceMap.get(asset.id) ?? 100; // fallback if no history
      const drift = (Math.random() - 0.5) * 0.02; // ±1% drift
      const newPrice = Math.max(0.01, basePrice * (1 + drift));
      const changePct = ((newPrice - basePrice) / basePrice) * 100;

      await prisma.assetPrice.create({
        data: {
          assetId: asset.id,
          price: parseFloat(newPrice.toFixed(2)),
          volume: Math.floor(Math.random() * 500000) + 10000,
          changePct: parseFloat(changePct.toFixed(2)),
          tradedAt: now,
        },
      });
      created++;
    }
    results.tasks.push({ task: "asset-prices", status: "ok", detail: `${created} price ticks created` });
  } catch (err: any) {
    results.tasks.push({ task: "asset-prices", status: "error", detail: err.message });
  }

  // Task 2: Create an AssetSentiment snapshot for each asset
  try {
    const assets = await prisma.asset.findMany({ select: { id: true } });
    const now = new Date();
    let created = 0;

    for (const asset of assets) {
      const score = (Math.random() * 2 - 1); // -1 to 1
      const positive = score > 0 ? 50 + score * 25 : 50 - Math.abs(score) * 15;
      const negative = score < 0 ? 50 + Math.abs(score) * 25 : 50 - score * 15;
      const neutral = 100 - positive - negative;

      await prisma.assetSentiment.create({
        data: {
          assetId: asset.id,
          score: parseFloat(score.toFixed(3)),
          positivePct: parseFloat(Math.max(0, Math.min(100, positive)).toFixed(1)),
          neutralPct: parseFloat(Math.max(0, Math.min(100, neutral)).toFixed(1)),
          negativePct: parseFloat(Math.max(0, Math.min(100, negative)).toFixed(1)),
          articleCount: Math.floor(Math.random() * 50) + 5,
        },
      });
      created++;
    }
    results.tasks.push({ task: "sentiment-snapshot", status: "ok", detail: `${created} sentiment snapshots created` });
  } catch (err: any) {
    results.tasks.push({ task: "sentiment-snapshot", status: "error", detail: err.message });
  }

  // Task 3: Clean up old invitations (expired and unused)
  try {
    const expired = await prisma.invitation.deleteMany({
      where: {
        usedAt: null, // not yet accepted
        expiresAt: { lt: new Date() },
      },
    });
    results.tasks.push({ task: "cleanup-invitations", status: "ok", detail: `${expired.count} expired invitations removed` });
  } catch (err: any) {
    results.tasks.push({ task: "cleanup-invitations", status: "error", detail: err.message });
  }

  // Task 4: Clean up old notifications (read + older than 30 days)
  try {
    const oldNotifs = await prisma.notification.deleteMany({
      where: {
        read: true,
        createdAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    });
    results.tasks.push({ task: "cleanup-notifications", status: "ok", detail: `${oldNotifs.count} old notifications removed` });
  } catch (err: any) {
    results.tasks.push({ task: "cleanup-notifications", status: "error", detail: err.message });
  }

  results.tasks.push({ task: "cron-log", status: "ok", detail: `completed in ${Date.now() - startTime}ms` });

  return NextResponse.json(results);
}
