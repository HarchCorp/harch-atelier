import { NextResponse } from "next/server";
import {
  requireAgencyAdmin,
  AgencyAuthError,
} from "@/lib/agency/agency-session";
import { getUsageStats } from "@/lib/agency/quota";
import { logError } from "@/lib/logger";

// ═══════════════════════════════════════════════════════════════
//  GET /api/agency/quota
//
//  Returns the quota + current usage for the active sub-client
//  workspace (as set by the `activeAgencyClientId` cookie).
//
//  Auth: agency-admin (or super-admin). If no workspace is active,
//  returns 200 with { activeAgencyClientId: null, message: "..." } —
//  the dashboard uses this to know whether to render the usage bars
//  or the "switch workspace" prompt.
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const ctx = await requireAgencyAdmin();

    if (!ctx.activeAgencyClientId) {
      return NextResponse.json({
        activeAgencyClientId: null,
        message: "No active sub-client workspace — switch from the agency dashboard",
        agency: ctx.agency,
      });
    }

    const stats = await getUsageStats(ctx.activeAgencyClientId);
    if (!stats) {
      return NextResponse.json(
        { error: "Quota not found for the active agency client" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      activeAgencyClientId: ctx.activeAgencyClientId,
      agency: ctx.agency,
      stats,
    });
  } catch (err) {
    if (err instanceof AgencyAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    logError("agency.quota", `[/api/agency/quota] error: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
