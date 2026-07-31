// ═══════════════════════════════════════════════════════════════
//  GET /api/cron/refresh-sanctions
//
//  Daily cron — downloads all 3 sanctions lists (OFAC SDN, EU FSF,
//  UN Consolidated), parses them, and upserts the result into the
//  SanctionsCache table.
//
//  Schedule: 03:00 UTC daily (configured in vercel.json).
//  Auth: CRON_SECRET via `Authorization: Bearer <secret>` header
//  (shared with the other /api/cron/* routes — see lib/auth/cron.ts).
//
//  Response:
//    {
//      ofac: { entries, downloaded, sourceUrl, warnings, error? },
//      eu:   { entries, downloaded, sourceUrl, warnings, error? },
//      un:   { entries, downloaded, sourceUrl, warnings, error? },
//      totalEntries,
//      refreshedAt
//    }
//
//  Each list downloads independently in parallel — a single list
//  failure does NOT abort the others. Failures are logged with the
//  error message and surfaced in the response (`error` field) so the
//  caller can see which lists need attention.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { authorizeCron } from "@/lib/auth/cron";
import { refreshAllSanctionsLists } from "@/lib/sanctions/cache";
import { logInfo, logError } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
// The OFAC mirror is ~50MB and EU XML is ~14MB. With parallel
// downloads + parsing + DB upsert, 120s gives generous headroom.
export const maxDuration = 120;

export async function GET(req: NextRequest) {
  if (!authorizeCron(req)) {
    return NextResponse.json(
      { error: "Unauthorized — CRON_SECRET missing or invalid" },
      { status: 401 },
    );
  }

  const startedAt = Date.now();
  logInfo("sanctions-cron", "Daily sanctions refresh starting...");

  try {
    const summary = await refreshAllSanctionsLists();
    const elapsedMs = Date.now() - startedAt;
    logInfo(
      "sanctions-cron",
      `Daily sanctions refresh complete in ${elapsedMs}ms — OFAC=${summary.ofac.entries} EU=${summary.eu.entries} UN=${summary.un.entries} (total ${summary.totalEntries})`,
    );

    // Surface individual list failures as 200 with `error` fields so
    // the cron monitor can distinguish "everything OK" from "partial
    // failure" by inspecting the body. We only return 500 when ALL
    // three failed.
    const allFailed =
      !summary.ofac.downloaded && !summary.eu.downloaded && !summary.un.downloaded;
    const status = allFailed ? 500 : 200;
    return NextResponse.json(summary, { status });
  } catch (err) {
    const elapsedMs = Date.now() - startedAt;
    const msg = (err as Error).message;
    logError("sanctions-cron", `Daily sanctions refresh failed after ${elapsedMs}ms: ${msg}`);
    return NextResponse.json(
      {
        error: msg,
        refreshedAt: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
