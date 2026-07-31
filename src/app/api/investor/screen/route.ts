// ═══════════════════════════════════════════════════════════════
//  POST /api/investor/screen
//  GET  /api/investor/screen
//
//  Real sanctions screening against OFAC / EU / UN lists.
//
//  POST body:
//    {
//      name: string,                              // entity or person to screen
//      type?: "individual" | "entity" | "vessel",
//      threshold?: number,                        // default 0.82
//      includeHoldings?: boolean,                 // default true — also screen all portfolio holdings
//    }
//
//  POST response:
//    {
//      adHoc: ScreeningResult,                    // result for the `name` provided in the body
//      holdings?: AggregateScreeningResult,       // if includeHoldings, screening of every portfolio holding
//      cache: CacheStatus,                        // OFAC/EU/UN cache freshness + entry counts
//      stale: boolean,                            // true if any cached list was >24h old
//      warnings: string[]                         // non-fatal issues (fallback source used, etc.)
//    }
//
//  GET response:
//    {
//      holdings: AggregateScreeningResult | null, // screening of all holdings (empty when no portfolios)
//      cache: CacheStatus,
//      stale: boolean,
//      warnings: string[]
//    }
//
//  Auth: requires session + accountType === "investment-bank" (or admin).
//  Server-side only — the full sanctions list NEVER leaves the
//  server; only matched entries (similarity >= threshold) are
//  returned to the client.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { getSanctionsLists, flattenLists, getCacheStatus } from "@/lib/sanctions/cache";
import {
  screenName,
  screenNames,
  type ScreeningResult,
  type AggregateScreeningResult,
  type AggregateScreeningInput,
} from "@/lib/sanctions/matcher";
import { logInfo, logWarn } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
// Cold-start may download OFAC (50MB) + EU (14MB) + UN (2.2MB) — give
// it headroom. Subsequent calls hit the cache and finish in <1s.
export const maxDuration = 120;

// ─── Auth guard ──────────────────────────────────────────────────

async function authorize() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { ok: false as const, status: 401, error: "Unauthorized" };
  }
  if (
    session.user?.accountType !== "investment-bank" &&
    session.user?.role !== "admin"
  ) {
    return {
      ok: false as const,
      status: 403,
      error: "Forbidden — investment-bank account required",
    };
  }
  return { ok: true as const, userId: session.user.id as string };
}

// ─── Load all portfolio holdings for the user (for aggregate screening) ──

interface HoldingForScreening {
  holdingId: string;
  name: string;
  type: "individual" | "entity" | "vessel";
  weight: number;
  sector: string;
  companyName: string;
}

async function loadUserHoldings(
  userId: string,
): Promise<HoldingForScreening[]> {
  const portfolios = await prisma.portfolio.findMany({
    where: { userId },
    include: {
      holdings: {
        include: {
          company: { select: { name: true, sector: true, slug: true } },
          asset: { select: { name: true, ticker: true } },
        },
      },
    },
  });

  const out: HoldingForScreening[] = [];
  for (const p of portfolios) {
    for (const h of p.holdings) {
      const companyName = h.company?.name || h.asset?.name || "";
      if (!companyName) continue;
      out.push({
        holdingId: h.id,
        name: companyName,
        type: "entity", // portfolio holdings are always corporate entities
        weight: h.weight,
        sector: h.company?.sector || "",
        companyName,
      });
    }
  }
  return out;
}

// ─── POST handler ────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const auth = await authorize();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: {
    name?: string;
    type?: "individual" | "entity" | "vessel";
    threshold?: number;
    includeHoldings?: boolean;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = (body.name || "").trim();
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (name.length > 500) {
    return NextResponse.json(
      { error: "name too long (max 500 chars)" },
      { status: 400 },
    );
  }

  const threshold =
    typeof body.threshold === "number" && body.threshold > 0 && body.threshold < 1
      ? body.threshold
      : 0.86;
  const includeHoldings = body.includeHoldings !== false; // default true
  const typeFilter = body.type;

  // Load all 3 cached lists (cold-start downloads if missing).
  const cachedLists = await getSanctionsLists();
  const allEntries = flattenLists(cachedLists);
  if (allEntries.length === 0) {
    return NextResponse.json(
      {
        error: "Sanctions lists unavailable — all 3 caches empty. Run /api/cron/refresh-sanctions to populate.",
        warnings: cachedLists.warnings,
      },
      { status: 503 },
    );
  }

  // Ad-hoc screening of the requested name.
  const adHoc: ScreeningResult = screenName(name, allEntries, {
    threshold,
    typeFilter,
  });

  // Aggregate screening of all portfolio holdings (if requested).
  let holdings: AggregateScreeningResult | null = null;
  if (includeHoldings) {
    const userHoldings = await loadUserHoldings(auth.userId);
    const inputs: AggregateScreeningInput[] = userHoldings.map((h) => ({
      name: h.name,
      type: h.type,
      context: `holding:${h.companyName}`,
    }));
    holdings = screenNames(inputs, allEntries, { threshold });
  }

  const cacheStatus = getCacheStatus(cachedLists);
  const stale = cachedLists.staleLists.length > 0;
  const warnings = cachedLists.warnings;

  logInfo(
    "sanctions-screen",
    `Screened "${name}"${typeFilter ? ` (${typeFilter})` : ""}: ${adHoc.matches.length} matches (threshold=${threshold})${
      holdings ? `, ${holdings.flaggedCount}/${holdings.totalScreened} holdings flagged` : ""
    }`,
  );
  if (adHoc.matches.length > 0) {
    logWarn(
      "sanctions-screen",
      `SANCTIONS MATCH for "${name}": ${adHoc.matches
        .slice(0, 5)
        .map((m) => `${m.list}:${m.name}(${m.similarity})`)
        .join(", ")}`,
    );
  }

  return NextResponse.json({
    adHoc,
    holdings,
    cache: cacheStatus,
    stale,
    warnings,
  });
}

// ─── GET handler (screen all holdings, no ad-hoc name) ───────────

export async function GET() {
  const auth = await authorize();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const cachedLists = await getSanctionsLists();
  const allEntries = flattenLists(cachedLists);
  if (allEntries.length === 0) {
    return NextResponse.json(
      {
        error: "Sanctions lists unavailable — all 3 caches empty. Run /api/cron/refresh-sanctions to populate.",
        warnings: cachedLists.warnings,
      },
      { status: 503 },
    );
  }

  const userHoldings = await loadUserHoldings(auth.userId);
  const inputs: AggregateScreeningInput[] = userHoldings.map((h) => ({
    name: h.name,
    type: h.type,
    context: `holding:${h.companyName}`,
  }));
  const holdings = screenNames(inputs, allEntries, { threshold: 0.86 });

  const cacheStatus = getCacheStatus(cachedLists);
  const stale = cachedLists.staleLists.length > 0;
  const warnings = cachedLists.warnings;

  return NextResponse.json({
    holdings,
    cache: cacheStatus,
    stale,
    warnings,
  });
}
