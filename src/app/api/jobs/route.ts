// ═══════════════════════════════════════════════════════════════
//  JOBS LIST API — AEGIS v4.0
//  GET /api/jobs
//
//  Paginated list of Job rows with optional filters. Used by the
//  audit dashboard to render the recent-jobs table.
//
//  Query params:
//    page     — 1-indexed page number     (default: 1,    min: 1)
//    limit    — page size                  (default: 20,   max: 100)
//    status   — filter by status           (queued | processing | completed | failed)
//    jobType  — filter by job type         (full-audit | scrape | nlp | ai-visibility)
//
//  Response (200):
//    {
//      jobs:     Array<JobSummary>,
//      page, limit, total, totalPages,
//      hasMore:  boolean
//    }
//
//  NOTE on `progress`:
//  The actual DB schema (see prisma/migrations/.../migration.sql)
//  does NOT have a dedicated `progress` column on Job. Progress is
//  stored inside the `result` TEXT column as `{ progress: N, ... }`
//  by the full-audit-worker. We parse it out here so each job in the
//  list carries a top-level `progress` integer for the dashboard.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// ─── ALLOWED FILTER VALUES ───────────────────────────────────────
// Whitelisting keeps the SQL clean (no string interpolation) and
// makes the API self-documenting via the 400 error path.

const ALLOWED_STATUSES = new Set([
  "queued",
  "processing",
  "completed",
  "failed",
  "pending",
  "cancelled",
]);

const ALLOWED_JOB_TYPES = new Set([
  "full-audit",
  "scrape",
  "nlp",
  "ai-visibility",
]);

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

// ─── JSON STRING NORMALIZER ──────────────────────────────────────

function normalizeJsonField(v: unknown): unknown {
  if (v === null || v === undefined) return null;
  if (typeof v === "string") {
    try {
      return JSON.parse(v);
    } catch {
      return v;
    }
  }
  return v;
}

/**
 * Extract progress from a parsed `result` blob. Falls back to 0 / 100
 * based on status if the result blob doesn't carry an explicit number.
 */
function extractProgress(status: string, parsedResult: unknown): number {
  if (
    parsedResult &&
    typeof parsedResult === "object" &&
    "progress" in parsedResult &&
    typeof (parsedResult as { progress: unknown }).progress === "number"
  ) {
    return (parsedResult as { progress: number }).progress;
  }
  if (status === "completed") return 100;
  return 0;
}

// ─── GET /api/jobs ───────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // ─── PAGINATION ──────────────────────────────────────────
    const pageRaw = parseInt(searchParams.get("page") ?? "1", 10);
    const limitRaw = parseInt(
      searchParams.get("limit") ?? String(DEFAULT_LIMIT),
      10,
    );

    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
    const limit = Math.min(
      Math.max(
        Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : DEFAULT_LIMIT,
        1,
      ),
      MAX_LIMIT,
    );

    // ─── FILTERS ─────────────────────────────────────────────
    const status = searchParams.get("status")?.trim() || null;
    const jobType = searchParams.get("jobType")?.trim() || null;

    if (status && !ALLOWED_STATUSES.has(status)) {
      return NextResponse.json(
        {
          error: `Invalid status filter. Allowed: ${[...ALLOWED_STATUSES].join(", ")}`,
        },
        { status: 400 },
      );
    }
    if (jobType && !ALLOWED_JOB_TYPES.has(jobType)) {
      return NextResponse.json(
        {
          error: `Invalid jobType filter. Allowed: ${[...ALLOWED_JOB_TYPES].join(", ")}`,
        },
        { status: 400 },
      );
    }

    // ─── BUILD WHERE CLAUSE ──────────────────────────────────
    const where: Prisma.JobWhereInput = {};
    if (status) where.status = status;
    if (jobType) where.jobType = jobType;

    // ─── COUNT + FETCH IN PARALLEL ───────────────────────────
    // Two independent queries — running them in parallel shaves a
    // round-trip off the response time on the dashboard.
    const [total, jobs] = await Promise.all([
      prisma.job.count({ where }),
      prisma.job.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        // NOTE: no `progress` field in the actual DB schema — derived
        // from `result` below.
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    // ─── NORMALIZE + DERIVE PROGRESS ─────────────────────────
    const jobsNormalized = jobs.map((j) => {
      const payload = normalizeJsonField(j.payload);
      const result = normalizeJsonField(j.result);
      return {
        ...j,
        payload,
        result,
        progress: extractProgress(j.status, result),
      };
    });

    return NextResponse.json({
      jobs: jobsNormalized,
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
      filters: {
        status: status ?? null,
        jobType: jobType ?? null,
      },
    });
  } catch (error) {
    console.error("[api/jobs] GET error:", error);
    return NextResponse.json(
      {
        error: "Failed to list jobs",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
