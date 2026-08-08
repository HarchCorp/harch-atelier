import { NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import {
  switchActiveClient,
  clearActiveClient,
  AgencyAuthError,
} from "@/lib/agency/agency-session";

// ═══════════════════════════════════════════════════════════════
//  POST /api/agency/switch
//
//  Body: { agencyClientId: string }   — switch INTO that sub-client workspace
//  Body: { agencyClientId: null }     — switch OUT (return to master view)
//
//  Sets the `activeAgencyClientId` cookie (30-day, httpOnly, sameSite=lax).
//  Does NOT re-issue the JWT — workspace switches are cheap.
//
//  Auth: agency-admin (or super-admin). The target client must belong
//  to the admin's agency — verified by switchActiveClient().
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

interface SwitchBody {
  agencyClientId?: string | null;
}

export async function POST(req: Request) {
  try {
    let body: SwitchBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // Switch out (clear workspace).
    if (body.agencyClientId === null || body.agencyClientId === undefined) {
      await clearActiveClient();
      return NextResponse.json({
        ok: true,
        activeAgencyClientId: null,
        message: "Switched back to agency master view",
      });
    }

    if (typeof body.agencyClientId !== "string" || body.agencyClientId.length === 0) {
      return NextResponse.json(
        { error: "agencyClientId is required (or send null to switch out)" },
        { status: 400 },
      );
    }

    const ctx = await switchActiveClient(body.agencyClientId);
    return NextResponse.json({
      ok: true,
      activeAgencyClientId: ctx.activeAgencyClientId,
      companyId: ctx.companyId,
      agencyId: ctx.agencyId,
      message: "Workspace switched",
    });
  } catch (err) {
    if (err instanceof AgencyAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    logError("agency.switch", `[/api/agency/switch] error: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
