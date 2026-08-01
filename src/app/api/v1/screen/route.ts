import { NextRequest, NextResponse } from "next/server";
import {
  authenticateApiKey,
  unauthorizedResponse,
} from "@/lib/auth/api-key";
import {
  screenName,
  type ScreeningResult,
} from "@/lib/sanctions/matcher";
import {
  getSanctionsLists,
  flattenLists,
  getCacheStatus,
} from "@/lib/sanctions/cache";
import { logAudit, extractIp, extractUserAgent } from "@/lib/harchiq/audit-log";

// ═══════════════════════════════════════════════════════════════
//  GET /api/v1/screen?name=<entity>&threshold=0.86&type=individual
//
//  Sanctions screening of an arbitrary name against the cached
//  OFAC + EU + UN consolidated lists. Same engine as
//  /api/investor/screen but authenticated via API key and scoped
//  to the key's company for audit logging.
//
//  Query params:
//    name       — required, the entity / individual / vessel name
//    threshold  — optional, default 0.86, range 0.5-0.99
//    type       — optional, "individual" | "entity" | "vessel"
//
//  Response:
//    {
//      query, normalizedQuery, matches: SanctionsMatch[],
//      clean: boolean, threshold, screenedAt, listsScreened,
//      totalEntriesScreened, cacheStatus
//    }
//
//  Auth: Bearer harch_<key>. The key resolves to a company so we
//  can audit who screened what.
//
//  Task: signal-enterprise-platform
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const identity = await authenticateApiKey(req);
  if (!identity) return unauthorizedResponse();

  const url = new URL(req.url);
  const name = (url.searchParams.get("name") || "").trim();
  if (!name || name.length < 2) {
    return NextResponse.json(
      { error: "Query parameter `name` is required (min 2 chars)." },
      { status: 400 },
    );
  }
  if (name.length > 256) {
    return NextResponse.json(
      { error: "Query parameter `name` must be under 256 characters." },
      { status: 400 },
    );
  }

  const thresholdParam = parseFloat(url.searchParams.get("threshold") || "0.86");
  const threshold =
    Number.isFinite(thresholdParam) &&
    thresholdParam >= 0.5 &&
    thresholdParam <= 0.99
      ? thresholdParam
      : 0.86;

  const typeParam = url.searchParams.get("type");
  const typeFilter =
    typeParam === "individual" || typeParam === "entity" || typeParam === "vessel"
      ? typeParam
      : undefined;

  // ─── Load cached sanctions lists ──────────────────────────────
  let cachedLists;
  try {
    cachedLists = await getSanctionsLists();
  } catch (err) {
    console.error("[/api/v1/screen] failed to load sanctions lists:", err);
    return NextResponse.json(
      { error: "Sanctions lists unavailable. Try again later." },
      { status: 503 },
    );
  }
  const allEntries = flattenLists(cachedLists);
  if (allEntries.length === 0) {
    return NextResponse.json(
      {
        error:
          "Sanctions lists unavailable — all 3 caches empty. Run /api/cron/refresh-sanctions to populate.",
        warnings: cachedLists.warnings,
      },
      { status: 503 },
    );
  }

  // ─── Screen ───────────────────────────────────────────────────
  const result: ScreeningResult = screenName(name, allEntries, {
    threshold,
    typeFilter,
  });

  const cacheStatus = getCacheStatus(cachedLists);

  // ─── Audit (Loi 09-08) — record who screened what ────────────
  await logAudit({
    userId: identity.userId,
    action: "sanctions_screen" as never,
    resource: `screen:${name}`,
    result: result.clean ? "success" : "success",
    ipAddress: extractIp(req),
    userAgent: extractUserAgent(req),
    metadata: {
      via: "api_key",
      apiKeyId: identity.apiKeyId,
      apiKeyName: identity.apiKeyName,
      companyId: identity.companyId,
      threshold,
      typeFilter: typeFilter ?? null,
      matchCount: result.matches.length,
      clean: result.clean,
    },
  });

  return NextResponse.json({
    ...result,
    cacheStatus,
    warnings: cachedLists.warnings,
  });
}
