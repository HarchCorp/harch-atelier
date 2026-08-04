// ═══════════════════════════════════════════════════════════════
//  AGENCY BRANDING — Brick 8 — Tier 4 White-Label Engine
//
//  White-label visual identity per AgencyClient. Powers:
//    • Public login page branding (GET /api/agency/branding — no auth)
//    • Console BrandingProvider (client component that injects CSS vars)
//    • Logo + title + footer overrides
//
//  Branding resolution priority (highest first):
//    1. Explicit AgencyBranding row for the resolved AgencyClient.
//    2. The parent Agency's primaryColor / logoUrl (so even without a
//       per-client AgencyBranding row, the agency's brand still shows).
//    3. Harch default (the C token from tokens.ts).
//
//  Host resolution (`getBrandingFromHost`):
//    • Subdomain `iq.{sub}.harchcorp.com` → resolve AgencyClient by subdomain
//    • Custom domain → resolve AgencyClient by customDomain
//    • Unknown host → return Harch default branding
// ═══════════════════════════════════════════════════════════════

import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { C as TOKENS } from "@/app/atelier/components/tokens";
import { resolveAgencyClientFromHost } from "./agency-session";

export interface Branding {
  /** When null, the request did not resolve to an AgencyClient → Harch default. */
  agencyClientId: string | null;
  agencyId: string | null;
  /** Sub-domain label that resolved this branding (for diagnostics). */
  resolvedFrom: "agency-client" | "agency-master" | "harch-default" | "host-unknown";

  // Visual identity
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  faviconUrl: string | null;

  // Custom copy
  loginTitle: string;
  loginSubtitle: string | null;
  footerText: string | null;

  // Hide Harch branding?
  hideHarchBadge: boolean;

  // Display name (sub-client's display name or the agency's name)
  displayName: string | null;
}

// ─── Harch default branding (used when nothing resolves) ────────────

export const HARCH_DEFAULT_BRANDING: Branding = {
  agencyClientId: null,
  agencyId: null,
  resolvedFrom: "harch-default",
  logoUrl: null,
  primaryColor: TOKENS.text,       // #0A0A0A — neutral-950
  accentColor: TOKENS.cta,         // #10b981 — emerald-500
  fontFamily: TOKENS.fontSans,     // 'Inter', system-ui, sans-serif
  faviconUrl: null,
  loginTitle: "HarchIQ Console",
  loginSubtitle: "Sign in to your reputation intelligence workspace.",
  footerText: null,
  hideHarchBadge: false,
  displayName: null,
};

// ─── Reads ──────────────────────────────────────────────────────────

/**
 * Get branding for a specific AgencyClient. Falls back through:
 *   AgencyBranding row → Agency master colors → Harch default.
 */
export async function getBranding(
  agencyClientId: string,
): Promise<Branding> {
  const client = await prisma.agencyClient.findUnique({
    where: { id: agencyClientId },
    select: {
      id: true,
      agencyId: true,
      displayName: true,
      subdomain: true,
      agency: {
        select: {
          id: true,
          name: true,
          primaryColor: true,
          logoUrl: true,
        },
      },
      branding: {
        select: {
          logoUrl: true,
          primaryColor: true,
          accentColor: true,
          fontFamily: true,
          faviconUrl: true,
          loginTitle: true,
          loginSubtitle: true,
          footerText: true,
          hideHarchBadge: true,
        },
      },
    },
  });

  if (!client) return HARCH_DEFAULT_BRANDING;

  // Start from Harch default, then layer agency master, then per-client branding.
  const merged: Branding = {
    ...HARCH_DEFAULT_BRANDING,
    agencyClientId: client.id,
    agencyId: client.agencyId,
    resolvedFrom: "agency-client",
    displayName: client.displayName,
    // Agency master colors (lower priority than per-client branding below).
    primaryColor: client.agency.primaryColor ?? HARCH_DEFAULT_BRANDING.primaryColor,
    logoUrl: client.agency.logoUrl ?? null,
  };

  // Per-client branding overrides.
  if (client.branding) {
    const b = client.branding;
    merged.logoUrl = b.logoUrl ?? merged.logoUrl;
    if (b.primaryColor) merged.primaryColor = b.primaryColor;
    if (b.accentColor) merged.accentColor = b.accentColor;
    if (b.fontFamily) merged.fontFamily = b.fontFamily;
    if (b.faviconUrl) merged.faviconUrl = b.faviconUrl;
    if (b.loginTitle) merged.loginTitle = b.loginTitle;
    if (b.loginSubtitle !== null && b.loginSubtitle !== undefined) merged.loginSubtitle = b.loginSubtitle;
    if (b.footerText !== null && b.footerText !== undefined) merged.footerText = b.footerText;
    merged.hideHarchBadge = b.hideHarchBadge;
  }

  return merged;
}

/**
 * Resolve branding from the request Host header. Public, no auth.
 * Used by the login page (so a sub-client's login page shows their
 * brand before the user even signs in).
 */
export async function getBrandingFromHost(): Promise<Branding> {
  let host: string | null = null;
  try {
    const h = await headers();
    host = h.get("host");
  } catch {
    host = null;
  }
  if (!host) return { ...HARCH_DEFAULT_BRANDING, resolvedFrom: "host-unknown" };

  const client = await resolveAgencyClientFromHost();
  if (!client) {
    return { ...HARCH_DEFAULT_BRANDING, resolvedFrom: "host-unknown" };
  }
  return getBranding(client.id);
}

// ─── CSS + payload builders ─────────────────────────────────────────

/**
 * Build a CSS custom properties string for the branding.
 * Output looks like:
 *   --brand-primary: #0A0A0A;
 *   --brand-accent: #10b981;
 *   --brand-font: 'Inter', system-ui, sans-serif;
 *   --brand-logo: url("https://...");
 *   --brand-favicon: url("https://...");
 *
 * Suitable for injecting into a `<style>` tag or as inline `style`
 * on a wrapper div.
 */
export function buildCssVars(branding: Branding): string {
  const lines: string[] = [
    `--brand-primary: ${branding.primaryColor};`,
    `--brand-accent: ${branding.accentColor};`,
    `--brand-font: ${branding.fontFamily};`,
  ];
  if (branding.logoUrl) {
    lines.push(`--brand-logo: url("${branding.logoUrl}");`);
  }
  if (branding.faviconUrl) {
    lines.push(`--brand-favicon: url("${branding.faviconUrl}");`);
  }
  return lines.join("\n  ");
}

/**
 * Build a JSON payload suitable for the client-side BrandingProvider.
 * The payload is what gets serialised into the `data-branding`
 * attribute on the wrapper element.
 */
export function buildBrandingPayload(branding: Branding) {
  return {
    agencyClientId: branding.agencyClientId,
    agencyId: branding.agencyId,
    resolvedFrom: branding.resolvedFrom,
    logoUrl: branding.logoUrl,
    primaryColor: branding.primaryColor,
    accentColor: branding.accentColor,
    fontFamily: branding.fontFamily,
    faviconUrl: branding.faviconUrl,
    loginTitle: branding.loginTitle,
    loginSubtitle: branding.loginSubtitle,
    footerText: branding.footerText,
    hideHarchBadge: branding.hideHarchBadge,
    displayName: branding.displayName,
    cssVars: buildCssVars(branding),
  };
}

export type BrandingPayload = ReturnType<typeof buildBrandingPayload>;
