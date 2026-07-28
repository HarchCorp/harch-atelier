// ═══════════════════════════════════════════════════════════════
//  AUDIT API v4 — ASYNC (BullMQ + Upstash Redis)
//  POST /api/atelier/audit  Body: { companyName: string }
//
//  PROJECT AEGIS v4.0 — EXIGENCE 2
//  ───────────────────────────────────────────────────────────────
//  The POST handler no longer blocks on the synchronous
//  `runFullAuditV2` call. Instead it:
//    1. Resolves the company slug (from COMPANIES config or by
//       slugifying the provided name).
//    2. Creates a Job row in Prisma (status: "queued").
//    3. Enqueues a job on `full-audit-queue`.
//    4. Returns HTTP 202 with { jobId, status, pollUrl }.
//
//  The full-audit-worker (running on a VPS) picks the job up,
//  coordinates scraper → nlp → ai-visibility, and writes progress
//  back to the Job row. The client polls GET /api/jobs/[id]/status
//  until status === "completed" | "failed".
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { fullAuditQueue } from "@/lib/queue";
import {
  COMPANIES,
  getCompanyBySlug,
  matchCompanyInText,
} from "@/lib/scrapers/sources-config";
import { authOptions } from "@/lib/auth/auth.config";
import { checkRateLimit } from "@/lib/rate-limiter";

// ─── SLUG HELPER ─────────────────────────────────────────────────
// Matches the COMPANIES[].slug convention: lowercase, accents
// stripped, non-alphanumerics → "-", no leading/trailing "-".

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Resolve the canonical company slug for a free-form `companyName`.
 *
 * Resolution order:
 *   1. Exact match against COMPANIES[].name (case-insensitive)
 *   2. Match against any alias in COMPANIES (handles "Wafa Bank" →
 *      "attijariwafa-bank", "OCP" → "ocp-group", …)
 *   3. Fallback: slugify the provided name
 *
 * We also persist the slug on the Job payload so the worker doesn't
 * have to re-resolve — and so multiple audits for the same company
 * collapse to the same Company row in Prisma.
 */
function resolveCompanySlug(companyName: string): string {
  const trimmed = companyName.trim();

  // 1. Exact name match
  const byName = COMPANIES.find(
    (c) => c.name.toLowerCase() === trimmed.toLowerCase(),
  );
  if (byName) return byName.slug;

  // 2. Alias / substring match (covers Arabic spellings, tickers,
  //    common short forms — matchCompanyInText already does the
  //    heavy lifting here).
  const matched = matchCompanyInText(trimmed).find(Boolean);
  if (matched) return matched.slug;

  // 3. Fallback — slugify the free-form name
  const slug = slugify(trimmed);
  return slug || `company-${Date.now()}`;
}

// ─── PLAN → RATE LIMIT MAP ────────────────────────────────────────
// The directive mandates Free = 3/day, Pro = 50/day. Any unrecognized
// plan is downgraded to Free so a misconfigured user can't bypass the
// quota by setting an arbitrary plan string on their User row.

const PLAN_LIMITS: Record<string, number> = {
  free: 3,
  pro: 50,
};

const RATE_LIMIT_WINDOW_SECONDS = 86_400; // 24 hours

// ─── POST: enqueue async audit ───────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // ─── AUTH (V4.1 STEP 5.2) ──────────────────────────────────
    // The audit endpoint is gated behind a NextAuth session. We do
    // NOT trust the JWT's `id` claim alone because the auth.config
    // session callback doesn't explicitly copy `token.sub` into
    // `session.user.id` — instead we resolve the canonical User row
    // by email so we get both the DB cuid and the authoritative
    // `plan` value.
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, plan: true, role: true },
    });
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // ─── RATE LIMIT (V4.1 STEP 5.2) ───────────────────────────
    // The counter is namespaced by user ID so each principal gets
    // their own daily quota, independent of which device or browser
    // they're on. Admins bypass the check (they're internal users
    // running ops / debugging).
    if (user.role !== "admin") {
      const planKey = (user.plan || "free").toLowerCase();
      const limit = PLAN_LIMITS[planKey] ?? PLAN_LIMITS.free;

      const rl = await checkRateLimit(
        `audit:${user.id}`,
        limit,
        RATE_LIMIT_WINDOW_SECONDS,
      );
      if (!rl.allowed) {
        const retryAfterSec = Math.max(
          1,
          Math.ceil((rl.resetAt - Date.now()) / 1000),
        );
        return NextResponse.json(
          {
            error: "Rate limit exceeded",
            remaining: rl.remaining,
            resetAt: rl.resetAt,
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(retryAfterSec),
              "X-RateLimit-Limit": String(limit),
              "X-RateLimit-Remaining": String(rl.remaining),
              "X-RateLimit-Reset": String(rl.resetAt),
            },
          },
        );
      }
    }

    const body = await request.json();
    const { companyName } = body;

    if (!companyName || typeof companyName !== "string") {
      return NextResponse.json(
        { error: "companyName is required" },
        { status: 400 },
      );
    }

    const companySlug = resolveCompanySlug(companyName);
    const cfg = getCompanyBySlug(companySlug);
    const effectiveName = cfg?.name ?? companyName.trim();

    // 1. Create the Job row in Prisma. The payload records the
    //    resolved slug + canonical name so the worker doesn't have
    //    to re-resolve. The payload column is TEXT in the actual DB
    //    schema (Prisma String?) — we JSON.stringify the object.
    //    Progress is stored inside the `result` JSON blob (also a
    //    TEXT column) as `{ progress: N, ... }` since the actual DB
    //    schema doesn't have a dedicated `progress` column.
    const job = await prisma.job.create({
      data: {
        jobType: "full-audit",
        status: "queued",
        payload: JSON.stringify({
          companyName: effectiveName,
          companySlug,
          sourceConfigId: cfg?.id ?? null,
          sector: cfg?.sector ?? null,
        }),
        result: JSON.stringify({ progress: 0, step: "queued" }),
      },
    });

    // 2. Enqueue on full-audit-queue. We pass the Prisma Job.id so
    //    the worker can write progress back to the same row.
    await fullAuditQueue.add(
      "run-full-audit",
      {
        companyName: effectiveName,
        companySlug,
        jobId: job.id,
      },
      // The Prisma Job row is the source of truth for status — we
      // keep the BullMQ job around for a week so it can be inspected
      // via the BullMQ dashboard if needed.
      {
        jobId: job.id, // BullMQ job ID mirrors Prisma Job ID for tracing
      },
    );

    // 3. Return 202 Accepted + the poll URL the client should hit.
    return NextResponse.json(
      {
        jobId: job.id,
        status: "queued",
        pollUrl: `/api/jobs/${job.id}/status`,
        company: {
          name: effectiveName,
          slug: companySlug,
          tracked: Boolean(cfg),
        },
      },
      { status: 202 },
    );
  } catch (error) {
    console.error("[api/audit] POST error:", error);
    return NextResponse.json(
      {
        error: "Failed to enqueue audit",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// ─── GET: endpoint description (unchanged from v2) ───────────────

export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/atelier/audit",
    version: "v4-async",
    description:
      "POST with { companyName: string } to enqueue an async reputation audit. " +
      "Returns 202 + { jobId, pollUrl } — poll GET /api/jobs/[id]/status for progress.",
    pipeline: [
      "scraper-queue → RSS + Google News ingestion (10%)",
      "nlp-queue → GLM summarize / sentiment / NER / topics (40%)",
      "ai-visibility-queue → LLM-as-judge visibility probe (70%)",
      "full-audit-queue → marks Job completed (100%)",
    ],
    features: [
      "Async — POST returns immediately with a jobId",
      "Live progress via GET /api/jobs/[id]/status",
      "GLMAnalysis cache table — re-runs over the same input are free",
      "Article dedup via urlHash (SHA-256 of normalized URL)",
      "Per-source ScraperLog entries for audit dashboard",
    ],
  });
}
