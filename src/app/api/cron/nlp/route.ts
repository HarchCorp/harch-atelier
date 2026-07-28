// ═══════════════════════════════════════════════════════════════
//  CRON — NLP — PROJECT AEGIS v4.0
//
//  Triggered by Vercel Cron every 4 hours, 30 min after the scrape
//  cron (`30 */4 * * *`). Enqueues one NLP job per company that
//  has unprocessed articles onto `nlp-queue`.
//
//  The NLP worker (Docker VPS) consumes each job and runs the
//  GLM-4 pipeline (summarize / sentiment / NER / topics) over the
//  matching Article rows.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { nlpQueue } from "@/lib/queue";
import { authorizeCron } from "@/lib/auth/cron";
import { logInfo, logWarn, logError } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  if (!authorizeCron(req)) {
    logWarn("cron.nlp", "Unauthorized cron invocation attempt");
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    // Find every company that has at least one unprocessed Article.
    // Grouping by companyId + slug lets us enqueue one job per
    // company rather than one per article — keeps the queue shallow
    // and matches the NLP worker's contract ({ companySlug }).
    const unprocessed = await prisma.article.findMany({
      where: { processed: false },
      select: {
        companyId: true,
        company: { select: { slug: true, name: true } },
      },
      distinct: ["companyId"],
    });

    if (unprocessed.length === 0) {
      logInfo("cron.nlp", "No unprocessed articles — nothing to enqueue");
      return NextResponse.json({
        success: true,
        data: {
          enqueued: 0,
          queue: "nlp-queue",
          timestamp: new Date().toISOString(),
        },
      });
    }

    const jobs = unprocessed.map((row) => ({
      name: `nlp:${row.company.slug}`,
      data: { companySlug: row.company.slug },
    }));

    const enqueued = await nlpQueue.addBulk(jobs);

    logInfo("cron.nlp", `Enqueued ${enqueued.length} NLP jobs`, {
      companyCount: enqueued.length,
    });

    return NextResponse.json({
      success: true,
      data: {
        enqueued: enqueued.length,
        queue: "nlp-queue",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logError("cron.nlp", `Failed to enqueue NLP jobs: ${message}`, {
      err: message,
    });
    return NextResponse.json(
      { success: false, error: "Failed to enqueue jobs" },
      { status: 500 },
    );
  }
}

export const GET = POST;
