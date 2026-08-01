// ═══════════════════════════════════════════════════════════════
//  CRON — SCRAPE REGULATORY (AMMC + BAM + BVC)
//
//  Triggered by Vercel Cron daily at 06:00 UTC (`0 6 * * *`).
//  Pulls the latest press releases / circulars / market announcements
//  from the three Moroccan regulators, parses each one, dedupes by
//  URL hash, and inserts new items into the Article table with the
//  appropriate sourceType ("regulatory" / "financial" / "market").
//
//  Auth: the `Authorization: Bearer ${CRON_SECRET}` header must match
//  the CRON_SECRET env var. Without it the route returns 401.
//
//  The actual scrape logic lives in
//  `src/lib/scrapers/regulatory-scraper.ts` so it can be shared with
//  the on-demand "Refresh now" action in /api/console/regulatory.
//
//  Task ID: signal-regulatory-feed
//  Route:   /api/cron/scrape-regulatory
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { authorizeCron } from "@/lib/auth/cron";
import { logWarn, logInfo, logError } from "@/lib/logger";
import { prisma } from "@/lib/db";
import {
  REGULATORY_FEEDS,
  scrapeRegulatorySource,
  persistRegulatoryItems,
  type RegulatoryScrapeResult,
} from "@/lib/scrapers/regulatory-scraper";

export const dynamic = "force-dynamic";
// Vercel Cron routes are invoked server-side and should never be
// cached — every invocation must fetch fresh regulatory items.
export const revalidate = 0;

// Vercel function timeout — 3 sources × 12s timeout in parallel ≈ 12s
// worst case, but bump to 300s for headroom against slow regulators.
export const maxDuration = 300;

export async function POST(req: Request) {
  // 1. AUTH — CRON_SECRET required
  if (!authorizeCron(req)) {
    logWarn("cron.scrape-regulatory", "Unauthorized cron invocation attempt");
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const startedAt = new Date();
  const startMs = Date.now();
  logInfo(
    "cron.scrape-regulatory",
    `Starting scrape — ${REGULATORY_FEEDS.length} regulators`,
  );

  // 2. SCRAPE ALL 3 SOURCES IN PARALLEL
  const results: RegulatoryScrapeResult[] = await Promise.all(
    REGULATORY_FEEDS.map((cfg) => scrapeRegulatorySource(cfg)),
  );

  // 3. PERSIST NEW ITEMS + WRITE SCRAPERLOG ROWS
  let itemsFoundTotal = 0;
  let itemsInsertedTotal = 0;
  const errors: { source: string; message: string }[] = [];
  const perSource: Array<{
    source: string;
    strategy: string;
    found: number;
    inserted: number;
    skipped: number;
    durationMs: number;
    error?: string;
  }> = [];

  for (let i = 0; i < REGULATORY_FEEDS.length; i++) {
    const cfg = REGULATORY_FEEDS[i];
    const result = results[i];
    itemsFoundTotal += result.items.length;

    if (result.error) {
      errors.push({ source: cfg.label, message: result.error });
      logWarn(
        "cron.scrape-regulatory",
        `${cfg.label} errored: ${result.error}`,
      );
    }

    // Persist new items (deduped by urlHash).
    let inserted = 0;
    let skipped = 0;
    try {
      const r = await persistRegulatoryItems(result, cfg);
      inserted = r.inserted;
      skipped = r.skipped;
      itemsInsertedTotal += inserted;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logError(
        "cron.scrape-regulatory",
        `Persist failed for ${cfg.label}: ${msg}`,
      );
      errors.push({ source: cfg.label, message: `Persist: ${msg}` });
    }

    // ScraperLog — one row per source per run, mirrors the main RSS
    // pipeline's logging shape.
    try {
      await prisma.scraperLog.create({
        data: {
          sourceId: `regulatory-${cfg.id}`,
          sourceName: cfg.label,
          sourceUrl:
            cfg.rssCandidates[0] || cfg.googleNewsQuery || cfg.htmlCandidates[0] || "",
          status: result.error ? "error" : "ok",
          articlesFound: result.items.length,
          articlesNew: inserted,
          errorMessage: result.error || null,
          durationMs: result.durationMs,
          completedAt: new Date(),
        },
      });
    } catch (logErr) {
      logError(
        "cron.scrape-regulatory",
        `ScraperLog write failed: ${(logErr as Error).message}`,
      );
    }

    perSource.push({
      source: cfg.label,
      strategy: result.strategy,
      found: result.items.length,
      inserted,
      skipped,
      durationMs: result.durationMs,
      error: result.error,
    });

    logInfo(
      "cron.scrape-regulatory",
      `${cfg.label}: ${result.items.length} found, ${inserted} new (strategy: ${result.strategy})`,
    );
  }

  const durationMs = Date.now() - startMs;
  const summary = {
    success: true,
    sourcesProcessed: REGULATORY_FEEDS.length,
    itemsFound: itemsFoundTotal,
    itemsInserted: itemsInsertedTotal,
    errors,
    startedAt: startedAt.toISOString(),
    completedAt: new Date().toISOString(),
    durationMs,
    perSource,
  };

  logInfo(
    "cron.scrape-regulatory",
    `Done — ${itemsInsertedTotal} new / ${itemsFoundTotal} found in ${durationMs}ms`,
  );

  return NextResponse.json(summary);
}

// Vercel Cron sends GET requests by default for HTTP-triggered jobs
// when the `method` field is omitted. We accept both GET and POST.
export const GET = POST;
