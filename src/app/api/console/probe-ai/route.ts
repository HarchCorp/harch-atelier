// ═══════════════════════════════════════════════════════════════
//  POST /api/console/probe-ai
//
//  Triggers a real AI-visibility probe for the given company:
//    • 10 probe queries × 8 engines (1 real + 7 simulated) = 80 LLM calls
//    • Max 5 concurrent LLM calls (see src/lib/harchiq/ai-probe.ts)
//    • Results persisted to AIVisibility with a shared batchId
//    • Returns a fully-aggregated ProbeSummary
//
//  Body: { companyName: string, aliases?: string[] }
//
//  Auth: requires session (any accountType — brand-monitor,
//  market-competitor, investment-bank, harch-alpha, admin).
//
//  SERVER-SIDE ONLY — z-ai-web-dev-sdk is dynamically imported from
//  inside ai-probe.ts so the bundler never ships it to the client.
//
//  Honesty contract:
//    • "HarchIQ-LLM" rows are real LLM responses.
//    • All other engines are labeled "(simulated)" in the response
//      payload AND persisted with simulated=true in the DB. The UI
//      surfaces this flag so the user is never misled.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { probeCompany, loadLatestProbeBatch, type ProbeSummary } from "@/lib/harchiq/ai-probe";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
// 80 LLM calls × up to 20s timeout each, with max 5 concurrent →
// worst case ~16 batches × 20s = 320s. Cap at 240s so the route
// still returns before Vercel's default 300s hard limit.
export const maxDuration = 240;

interface ProbeRequestBody {
  companyName?: unknown;
  aliases?: unknown;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse + validate the body.
  let body: ProbeRequestBody;
  try {
    body = (await req.json()) as ProbeRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const companyName =
    typeof body.companyName === "string" ? body.companyName.trim() : "";
  if (!companyName) {
    return NextResponse.json({ error: "companyName is required." }, { status: 400 });
  }

  const aliases: string[] = Array.isArray(body.aliases)
    ? body.aliases.filter((a): a is string => typeof a === "string" && a.trim().length > 0)
    : [];

  // Try to resolve a Company row matching this name (so we can persist
  // with a proper companyId). Fall back to the user's primary company.
  let companyId: string | undefined;
  try {
    const byName = await prisma.company.findFirst({
      where: { name: { equals: companyName, mode: "insensitive" } },
      select: { id: true, aliases: true },
    });
    if (byName) {
      companyId = byName.id;
      // Merge the DB aliases with the user-supplied ones (DB wins on dupes).
      const merged = new Set<string>([...byName.aliases, ...aliases]);
      aliases.push(...Array.from(merged));
    } else {
      // No exact match — fall back to the user's primary company so we
      // can still persist the probe (the dashboard's companyName label
      // will reflect what the user typed, not the DB row's name).
      const primary = await prisma.company.findFirst({
        orderBy: { createdAt: "asc" },
        select: { id: true },
      });
      companyId = primary?.id;
    }
  } catch (err) {
    logError("probe-ai.resolve", `companyName="${companyName}": ${(err as Error).message}`);
    // Continue without a companyId — the probe runs but doesn't persist.
  }

  try {
    const summary: ProbeSummary = await probeCompany({
      companyName,
      aliases,
      companyId,
    });
    return NextResponse.json({ summary, live: summary.live });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    logError("probe-ai.route", `companyName="${companyName}": ${msg}`);
    return NextResponse.json(
      { error: "Probe failed. Try again.", detail: msg },
      { status: 500 },
    );
  }
}

// ═══════════════════════════════════════════════════════════════
//  GET /api/console/probe-ai?company=<slug>
//
//  Returns the most recent probe batch for the primary company
//  (or the one specified by `company` slug). Used by the dashboard
//  to load historical data without re-running the probe.
// ═══════════════════════════════════════════════════════════════

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const companySlug = url.searchParams.get("company");

    const company = companySlug
      ? await prisma.company.findUnique({
          where: { slug: companySlug },
          select: { id: true, name: true, aliases: true },
        })
      : await prisma.company.findFirst({
          orderBy: { createdAt: "asc" },
          select: { id: true, name: true, aliases: true },
        });

    if (!company) {
      return NextResponse.json({ error: "No company found." }, { status: 404 });
    }

    const summary = await loadLatestProbeBatch(company.id);
    if (!summary) {
      return NextResponse.json({ summary: null });
    }
    // Fill the companyName on the summary (loadLatestProbeBatch leaves it blank).
    summary.companyName = company.name;
    return NextResponse.json({ summary });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    logError("probe-ai.get", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
