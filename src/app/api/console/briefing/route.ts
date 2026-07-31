// ═══════════════════════════════════════════════════════════════
//  GET /api/console/briefing?date=YYYY-MM-DD&regenerate=1
//
//  Returns the daily HarchIQ briefing for the authenticated user.
//
//  Behaviour:
//    • Auth required (any accountType — brand-monitor, market-competitor,
//      investment-bank, harch-alpha, admin).
//    • `date` defaults to today in Africa/Casablanca tz.
//    • Tries the cached Briefing row for (userId, date) first.
//    • If no cache OR `regenerate=1`, generates a fresh briefing via
//      the LLM, persists it, and returns the payload.
//    • For past dates, if no cache exists we return 404 (no way to
//      regenerate a window that's already closed) unless `regenerate=1`
//      is explicitly passed (in which case we use rolling 24h ending
//      now — useful for debugging).
//
//  The LLM is called server-side via z-ai-web-dev-sdk. Citations are
//  mapped back to REAL Article/RiskAssessment ids before the response
//  is returned — no hallucinated sources reach the client.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import {
  generateBriefing,
  loadCachedBriefing,
  persistBriefing,
  briefingDateKey,
  getPrimaryCompanyForUser,
  type BriefingPayload,
} from "@/lib/harchiq/briefing";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 45; // LLM call can take 5–15s in cold start

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const requestedDate = url.searchParams.get("date");
  const regenerate = url.searchParams.get("regenerate") === "1";

  // Validate date format (YYYY-MM-DD) if provided.
  let dateKey: string;
  if (requestedDate) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) {
      return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD." }, { status: 400 });
    }
    // Reject impossible dates (e.g. 2026-13-45).
    const parsed = new Date(`${requestedDate}T12:00:00Z`);
    if (Number.isNaN(parsed.getTime())) {
      return NextResponse.json({ error: "Invalid date." }, { status: 400 });
    }
    dateKey = requestedDate;
  } else {
    dateKey = briefingDateKey();
  }

  // 1. Return cached briefing for this date unless regeneration forced.
  if (!regenerate) {
    const cached = await loadCachedBriefing(session.user.id, dateKey);
    if (cached) {
      return NextResponse.json({ briefing: cached, cached: true, date: dateKey });
    }
    // Past date with no cache → 404 (don't fabricate old intel).
    const todayKey = briefingDateKey();
    if (dateKey < todayKey) {
      return NextResponse.json(
        { error: `No cached briefing for ${dateKey}.`, date: dateKey, cached: false },
        { status: 404 },
      );
    }
  }

  // 2. Resolve the primary company for this user (same heuristic as
  //    /api/console/alerts and /api/cron/generate-reports).
  const company = await getPrimaryCompanyForUser({
    id: session.user.id,
    accountType: session.user.accountType ?? "brand-monitor",
  });
  if (!company) {
    return NextResponse.json(
      { error: "No company configured for briefing generation." },
      { status: 404 },
    );
  }

  // 3. Generate fresh (LLM call + citation mapping).
  try {
    const payload: BriefingPayload = await generateBriefing({
      userId: session.user.id,
      companyId: company.id,
      companyName: company.name,
      dateKey,
    });

    // 4. Persist for next time (fire-and-forget — don't block the response).
    persistBriefing(session.user.id, company.id, dateKey, payload).catch((err) => {
      logError("briefing.persist", `userId=${session.user?.id} date=${dateKey}: ${(err as Error).message}`);
    });

    return NextResponse.json({ briefing: payload, cached: false, date: dateKey });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    logError("briefing.route", `userId=${session.user.id} date=${dateKey}: ${msg}`);
    return NextResponse.json(
      { error: "Couldn't generate briefing. Try again.", detail: msg, date: dateKey },
      { status: 500 },
    );
  }
}

// ─── POST — explicit regenerate endpoint (same handler) ─────────
// Convenience for the UI "Regenerate" button — same behaviour as
// GET ?regenerate=1 but lets the client call it as an action.

export async function POST(req: Request) {
  // Reuse the GET logic with regenerate forced.
  const url = new URL(req.url);
  url.searchParams.set("regenerate", "1");
  const newReq = new Request(url, { method: "GET" });
  return GET(newReq);
}
