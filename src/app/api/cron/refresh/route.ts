// Harch Atelier — Cron endpoint for automated data refresh
// Secured by CRON_SECRET env var (set in Vercel)
// Called by Vercel Cron every 15 minutes

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  // Auth: Vercel Cron sends Authorization: Bearer <CRON_SECRET>
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

  // Task 1: Update asset prices (simulate market tick for BVC/NYSE/NASDAQ assets)
  try {
    const assets = await prisma.asset.findMany({ select: { id: true, ticker: true, lastPrice: true } });
    let updated = 0;
    for (const asset of assets) {
      const drift = (Math.random() - 0.5) * 0.02;
      const newPrice = Math.max(0.01, asset.lastPrice * (1 + drift));
      const change = ((newPrice - asset.lastPrice) / asset.lastPrice) * 100;
      await prisma.asset.update({
        where: { id: asset.id },
        data: {
          lastPrice: parseFloat(newPrice.toFixed(2)),
          change24h: parseFloat(change.toFixed(2)),
          updatedAt: new Date(),
        },
      });
      updated++;
    }
    results.tasks.push({ task: "asset-prices", status: "ok", detail: `${updated} assets updated` });
  } catch (err: any) {
    results.tasks.push({ task: "asset-prices", status: "error", detail: err.message });
  }

  // Task 2: Create a price point snapshot for each asset (daily history)
  try {
    const assets = await prisma.asset.findMany({ select: { id: true, lastPrice: true } });
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const existing = await prisma.pricePoint.findMany({
      where: { timestamp: { gte: startOfDay } },
      select: { assetId: true },
    });
    const existingIds = new Set(existing.map((p) => p.assetId));
    const toCreate = assets.filter((a) => !existingIds.has(a.id));
    if (toCreate.length > 0) {
      await prisma.pricePoint.createMany({
        data: toCreate.map((a) => ({ assetId: a.id, price: a.lastPrice, timestamp: now })),
      });
    }
    results.tasks.push({ task: "price-snapshot", status: "ok", detail: `${toCreate.length} new snapshots` });
  } catch (err: any) {
    results.tasks.push({ task: "price-snapshot", status: "error", detail: err.message });
  }

  // Task 3: Create sentiment point snapshots
  try {
    const assets = await prisma.asset.findMany({ select: { id: true } });
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const existing = await prisma.sentimentPoint.findMany({
      where: { timestamp: { gte: startOfDay } },
      select: { assetId: true },
    });
    const existingIds = new Set(existing.map((p) => p.assetId));
    const toCreate = assets.filter((a) => !existingIds.has(a.id));
    if (toCreate.length > 0) {
      await prisma.sentimentPoint.createMany({
        data: toCreate.map((a) => ({
          assetId: a.id,
          score: parseFloat((Math.random() * 2 - 1).toFixed(3)),
          volume: Math.floor(Math.random() * 200) + 10,
          source: "harchiq",
          timestamp: now,
        })),
      });
    }
    results.tasks.push({ task: "sentiment-snapshot", status: "ok", detail: `${toCreate.length} new snapshots` });
  } catch (err: any) {
    results.tasks.push({ task: "sentiment-snapshot", status: "error", detail: err.message });
  }

  // Task 4: Clean up old invitations (expired > 7 days)
  try {
    const expired = await prisma.invitation.deleteMany({
      where: {
        status: "pending",
        expiresAt: { lt: new Date() },
      },
    });
    results.tasks.push({ task: "cleanup-invitations", status: "ok", detail: `${expired.count} expired invitations removed` });
  } catch (err: any) {
    results.tasks.push({ task: "cleanup-invitations", status: "error", detail: err.message });
  }

  results.tasks.push({ task: "cron-log", status: "ok", detail: `completed in ${Date.now() - startTime}ms` });

  return NextResponse.json(results);
}
