// ═══════════════════════════════════════════════════════════════
//  CRON — AI VISIBILITY — PROJECT AEGIS v4.0
//
//  Triggered by Vercel Cron once a day at 06:00 UTC (`0 6 * * *`).
//  Enqueues one AI-visibility probe per company onto
//  `ai-visibility-queue`.
//
//  The worker (Docker VPS) asks GLM-4 whether the model "knows"
//  each company, ranks it, and records the framing. Daily cadence
//  is enough because LLM weights don't shift within a single day.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { aiVisibilityQueue } from "@/lib/queue";
import { COMPANIES } from "@/lib/scrapers/sources-config";
import { authorizeCron } from "@/lib/auth/cron";
import { logInfo, logWarn, logError } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  if (!authorizeCron(req)) {
    logWarn("cron.ai-visibility", "Unauthorized cron invocation attempt");
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const jobs = COMPANIES.map((c) => ({
      name: `ai-visibility:${c.slug}`,
      data: {
        companyName: c.name,
        companySlug: c.slug,
        sector: c.sector,
      },
    }));

    const enqueued = await aiVisibilityQueue.addBulk(jobs);

    logInfo(
      "cron.ai-visibility",
      `Enqueued ${enqueued.length} AI-visibility jobs`,
      { companyCount: enqueued.length },
    );

    return NextResponse.json({
      success: true,
      data: {
        enqueued: enqueued.length,
        queue: "ai-visibility-queue",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logError(
      "cron.ai-visibility",
      `Failed to enqueue AI-visibility jobs: ${message}`,
      { err: message },
    );
    return NextResponse.json(
      { success: false, error: "Failed to enqueue jobs" },
      { status: 500 },
    );
  }
}

export const GET = POST;
