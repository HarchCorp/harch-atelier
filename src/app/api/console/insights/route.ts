// ═══════════════════════════════════════════════════════════════
//  GET /api/console/insights?accountType=brand-monitor&force=1
//
//  HarchIQ Insight Engine — contextual, persona-driven insights.
//
//  Auth: any logged-in user (the engine resolves the right company /
//  portfolio context based on the user's accountType + companyId).
//
//  Query params:
//    • accountType — one of brand-monitor | market-competitor |
//      investment-bank | harch-alpha. Defaults to the user's
//      session.accountType, falling back to "brand-monitor".
//    • force=1 — bypass the 15-min cache and regenerate fresh.
//
//  Returns:
//    {
//      insights: Insight[],
//      cached: boolean,
//      accountType: string,
//      generatedAt: string,
//      dataPoints: number,
//      model: string
//    }
//
//  The LLM is called server-side via z-ai-web-dev-sdk. Every cited
//  source id is validated against the real Prisma rows fetched for
//  this user — hallucinated ids are dropped before the response
//  leaves the server.
//
//  Task: signal-aiq-engine
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import {
  generateInsights,
  type InsightAccountType,
} from "@/lib/harchiq/insight-engine";
import { logAudit, extractIp, extractUserAgent } from "@/lib/harchiq/audit-log";
import { logError } from "@/lib/logger";
import { isDemoEmail } from "@/lib/demo-session";
import { demoInsightsResponse } from "@/lib/demo-console-api";
import { isAccountTypeAllowed } from "@/lib/auth/rbac";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
// LLM call can take 5-15s on cold start — give it headroom.
export const maxDuration = 45;

const ALLOWED_ACCOUNT_TYPES: InsightAccountType[] = [
  "brand-monitor",
  "market-competitor",
  "investment-bank",
  "harch-alpha",
];

function isAllowedAccountType(s: string | null | undefined): s is InsightAccountType {
  return !!s && (ALLOWED_ACCOUNT_TYPES as string[]).includes(s);
}

export async function GET(req: NextRequest) {
  // 1. AUTH — any logged-in user.
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized — session invalid" },
      { status: 401 },
    );
  }
  const userId = session.user.id;

  // ─── RBAC — P0-2 FIX (KAEL): accept all 4 new account types ──
  if (!isAccountTypeAllowed(session, ["essential", "pro", "enterprise", "agency"])) {
    return NextResponse.json(
      { error: "Forbidden — insufficient account permissions" },
      { status: 403 },
    );
  }

  // ─── DEMO BYPASS ─────────────────────────────────────────────
  if (session.user.isDemo || isDemoEmail(session.user.email)) {
    return demoInsightsResponse();
  }

  // 2. Parse query.
  const url = new URL(req.url);
  const force = url.searchParams.get("force") === "1";
  const requestedAccountType = url.searchParams.get("accountType");

  // Resolve the accountType: query → session → default.
  let accountType: InsightAccountType;
  if (isAllowedAccountType(requestedAccountType)) {
    accountType = requestedAccountType;
  } else if (isAllowedAccountType(session.user.accountType)) {
    accountType = session.user.accountType as InsightAccountType;
  } else {
    accountType = "brand-monitor";
  }

  // 3. Generate (cache-aware).
  try {
    const result = await generateInsights({
      userId,
      accountType,
      session,
      forceRefresh: force,
    });

    // ─── Audit log (Loi 09-08) — insights generated ──────────────
    await logAudit({
      userId,
      action: "insights_generate",
      resource: `insights:${accountType}`,
      result: "success",
      ipAddress: extractIp(req),
      userAgent: extractUserAgent(req),
      metadata: {
        accountType,
        insightCount: result.insights.length,
        cached: result.cached,
        dataPoints: result.dataPoints,
        model: result.model,
      },
    });

    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    logError("insights.route", `userId=${userId} account=${accountType}: ${msg}`);

    // 401 from requireUserCompany → propagate as 401.
    if (msg === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await logAudit({
      userId,
      action: "insights_generate",
      resource: `insights:${accountType}`,
      result: "error",
      ipAddress: extractIp(req),
      userAgent: extractUserAgent(req),
      metadata: { accountType, error: msg },
    });

    return NextResponse.json(
      { error: "Couldn't generate insights. Try again.", detail: msg },
      { status: 500 },
    );
  }
}

// ─── POST — explicit regenerate endpoint (same handler, force=1) ──
// Convenience for the UI "Generate Fresh Insights" button.
export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  url.searchParams.set("force", "1");
  // Preserve the accountType query if the client sent it in the body.
  try {
    const body = await req.json();
    if (typeof body?.accountType === "string") {
      url.searchParams.set("accountType", body.accountType);
    }
  } catch {
    // Body wasn't JSON — fall through with whatever query was already on the URL.
  }
  const newReq = new NextRequest(url, { method: "GET" });
  return GET(newReq);
}
