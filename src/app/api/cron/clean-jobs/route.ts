// ═══════════════════════════════════════════════════════════════
//  CRON — CLEAN-JOBS — HARCH ATELIER v4.1
//
//  Triggered by Vercel Cron every hour (`0 * * * *`).
//  Evicts stale Job and GLMAnalysis rows older than 24 hours.
//
//  Rationale:
//   • Job rows hold the RawIntelligenceReport payload in `result`.
//     Past 24h they have no analytical value to the user (the JSON
//     download has already happened) and they bloat the `Job` table.
//   • GLMAnalysis rows are the 24h cache for the intelligenceReport
//     prompt. Past 24h the cache is stale (the underlying news
//     corpus has shifted) and should be evicted so the next audit
//     re-runs GLM against fresh input.
//
//  Auth: Authorization: Bearer ${CRON_SECRET} (timing-safe compare
//  via authorizeCron). Without it the route 401s — this is the only
//  thing preventing external callers from running the cleanup on
//  demand and racing with concurrent audits.
//
//  Idempotent: re-running it is a no-op. Returns the count of rows
//  deleted in this invocation for observability.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authorizeCron } from "@/lib/auth/cron";
import { logInfo, logWarn } from "@/lib/logger";

export const dynamic = "force-dynamic";
// Vercel Cron routes are invoked server-side and must never be
// cached — every invocation should run a fresh DELETE.
export const revalidate = 0;

const RETENTION_HOURS = 24;

// ─── POST /api/cron/clean-jobs ────────────────────────────────────
// GET is also wired to POST so the route works with both Vercel
// Cron (which uses GET by default) and any external scheduler that
// prefers POST.

async function handleCleanup(req: Request) {
  if (!authorizeCron(req)) {
    logWarn("cron.clean-jobs", "Unauthorized cron invocation attempt");
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const cutoff = new Date(Date.now() - RETENTION_HOURS * 60 * 60 * 1000);

  // Run both deletions in parallel — they touch different tables
  // with no FK between them, so there's no ordering constraint.
  const [jobsDelete, glmDelete] = await Promise.all([
    prisma.job.deleteMany({
      where: { createdAt: { lt: cutoff } },
    }),
    prisma.gLMAnalysis.deleteMany({
      where: { createdAt: { lt: cutoff } },
    }),
  ]);

  const payload = {
    deleted: {
      jobs: jobsDelete.count,
      glmCache: glmDelete.count,
    },
    cutoff: cutoff.toISOString(),
    retentionHours: RETENTION_HOURS,
  };

  logInfo("cron.clean-jobs", "Cleanup completed", payload);

  return NextResponse.json({ success: true, data: payload });
}

export async function POST(req: Request) {
  return handleCleanup(req);
}

export async function GET(req: Request) {
  return handleCleanup(req);
}
