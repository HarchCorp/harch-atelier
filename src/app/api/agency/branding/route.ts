import { NextResponse } from "next/server";
import { getBrandingFromHost, buildBrandingPayload } from "@/lib/agency/branding";
import { logError } from "@/lib/logger";

// ═══════════════════════════════════════════════════════════════
//  GET /api/agency/branding
//
//  PUBLIC endpoint — no auth required. Returns the white-label
//  branding payload for the current request host (subdomain or
//  custom domain). Used by the login page (so the login page can
//  show the sub-client's brand before the user even signs in).
//
//  Resolution:
//    1. Subdomain `iq.{sub}.harchcorp.com` → AgencyClient by subdomain
//    2. Custom domain → AgencyClient by customDomain
//    3. Unknown host → Harch default branding
//
//  Cache: 60 seconds at the CDN layer (Surrogate-Control) — branding
//  changes are rare, and even a stale branding payload is harmless
//  (the next refresh picks up the new colors).
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const branding = await getBrandingFromHost();
    const payload = buildBrandingPayload(branding);
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    logError("agency.branding", `[/api/agency/branding] error: ${err}`);
    // Fall back to Harch default — never 500 on a branding lookup.
    const payload = buildBrandingPayload({
      agencyClientId: null,
      agencyId: null,
      resolvedFrom: "host-unknown",
      logoUrl: null,
      primaryColor: "#0A0A0A",
      accentColor: "#10b981",
      fontFamily: "'Inter', system-ui, sans-serif",
      faviconUrl: null,
      loginTitle: "HarchIQ Console",
      loginSubtitle: "Sign in to your reputation intelligence workspace.",
      footerText: null,
      hideHarchBadge: false,
      displayName: null,
    });
    return NextResponse.json(payload);
  }
}
