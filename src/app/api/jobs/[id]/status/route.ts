// ═══════════════════════════════════════════════════════════════
//  JOB STATUS API — AEGIS v4.0
//  GET /api/jobs/[id]/status
//
//  Returns the live status of a single Job row. The full-audit-worker
//  writes progress / status / result / error back to this row between
//  every step of the pipeline, so this endpoint is the single source
//  of truth that the client polls.
//
//  NOTE on `progress`:
//  The actual DB schema (see prisma/migrations/.../migration.sql)
//  doesn't have a dedicated `progress` column on the Job table. The
//  full-audit-worker therefore writes progress inside the `result`
//  TEXT column as `{ progress: N, step: "...", ... }`. This endpoint
//  parses it back out and exposes it as a top-level `progress` field
//  so the polling client can render a progress bar transparently.
//
//  Response (200):
//    {
//      id, status, progress, error,
//      startedAt, completedAt, durationMs,
//      jobType, payload, result
//    }
//
//  Response (404): { error: "Job not found" }
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// ─── JSON STRING NORMALIZER ──────────────────────────────────────
// The actual DB schema stores payload / result as TEXT columns
// holding JSON-encoded strings. Prisma returns them as `string`.
// This helper parses them back to objects; on parse failure it
// returns the raw string so the client can at least see what's there.

function normalizeJsonField(v: unknown): unknown {
  if (v === null || v === undefined) return null;
  if (typeof v === "string") {
    try {
      return JSON.parse(v);
    } catch {
      return v;
    }
  }
  // Already parsed (defensive — shouldn't happen with the current
  // schema but keeps the helper idempotent).
  return v;
}

/**
 * Extract the progress integer from a parsed `result` blob. The
 * full-audit-worker writes `{ progress: N, ... }` on every step. If
 * the result is null or doesn't carry a progress field, we fall back
 * to 0 (queued) or 100 (completed) based on the job's status.
 */
function extractProgress(
  status: string,
  parsedResult: unknown,
): number {
  if (
    parsedResult &&
    typeof parsedResult === "object" &&
    "progress" in parsedResult &&
    typeof (parsedResult as { progress: unknown }).progress === "number"
  ) {
    return (parsedResult as { progress: number }).progress;
  }
  if (status === "completed") return 100;
  if (status === "failed") return 0;
  return 0;
}

// ─── GET /api/jobs/[id]/status ───────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Job id is required" },
        { status: 400 },
      );
    }

    const job = await prisma.job.findUnique({
      where: { id },
      // NOTE: do NOT select a `progress` field — it does not exist
      // on the actual Job table. Progress is derived from `result`.
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 },
      );
    }

    const payload = normalizeJsonField(job.payload);
    const result = normalizeJsonField(job.result);
    const progress = extractProgress(job.status, result);

    // Compute durationMs on the fly if the worker hasn't populated it
    // yet (i.e. the job is still running). This lets the client show
    // a live elapsed-time counter before completion.
    let durationMs = job.durationMs;
    if (durationMs === null && job.startedAt !== null) {
      const endTime = job.completedAt ?? new Date();
      durationMs = endTime.getTime() - job.startedAt.getTime();
    }

    return NextResponse.json({
      id: job.id,
      jobType: job.jobType,
      status: job.status,
      progress,
      error: job.error,
      payload,
      result,
      scheduledAt: job.scheduledAt,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      durationMs,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      // Convenience flags for client renderers — saves a switch at
      // every call site.
      isTerminal: job.status === "completed" || job.status === "failed",
      isRunning: job.status === "processing",
    });
  } catch (error) {
    console.error("[api/jobs/[id]/status] GET error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch job status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
