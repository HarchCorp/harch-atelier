// ═══════════════════════════════════════════════════════════════
//  CRON — SCRAPE — PROJECT AEGIS v4.0
//
//  Triggered by Vercel Cron every 4 hours (`0 */4 * * *`).
//  Enqueues one scrape job per company in src/lib/scrapers/sources-
//  config.ts onto `scraper-queue`. The BullMQ worker (running on
//  the Docker VPS fleet) consumes each job and upserts articles by
//  urlHash.
//
//  Auth: the `Authorization: Bearer ${CRON_SECRET}` header must
//  match the CRON_SECRET env var. Without it the route returns 401
//  and logs the attempt — this is the only thing stopping external
//  callers from running scrape jobs on demand.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { scraperQueue } from "@/lib/queue";
import { COMPANIES } from "@/lib/scrapers/sources-config";
import { authorizeCron } from "@/lib/auth/cron";
import { logInfo, logWarn, logError } from "@/lib/logger";

export const dynamic = "force-dynamic";
// Vercel Cron routes are invoked server-side and should never be
// cached — every invocation must enqueue fresh jobs.
export const revalidate = 0;

export async function POST(req: Request) {
  if (!authorizeCron(req)) {
    logWarn("cron.scrape", "Unauthorized cron invocation attempt");
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const jobs = COMPANIES.map((c) => ({
      name: `scrape:${c.slug}`,
      data: { companyName: c.name, companySlug: c.slug },
    }));

    const enqueued = await scraperQueue.addBulk(jobs);

    logInfo("cron.scrape", `Enqueued ${enqueued.length} scrape jobs`, {
      companyCount: enqueued.length,
    });

    return NextResponse.json({
      success: true,
      data: {
        enqueued: enqueued.length,
        queue: "scraper-queue",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logError("cron.scrape", `Failed to enqueue scrape jobs: ${message}`, {
      err: message,
    });
    return NextResponse.json(
      { success: false, error: "Failed to enqueue jobs" },
      { status: 500 },
    );
  }
}

// Vercel Cron sends GET requests by default for HTTP-triggered jobs
// when the `method` field is omitted. We accept both GET and POST.
export const GET = POST;
