// ═══════════════════════════════════════════════════════════════
//  AGENCY SESSION — Brick 8 — Tier 4 White-Label Engine
//
//  Resolves which AgencyClient (sub-client workspace) the current
//  request is scoped to. Two sources of truth:
//
//    1. COOKIE  `activeAgencyClientId`  — written by POST /api/agency/switch
//       This is the master signal: when an agency admin clicks
//       "Switch workspace", this cookie is what changes. The cookie
//       survives server-side route transitions and is independent
//       of the JWT (so it can change without re-issuing the token).
//
//    2. JWT     `activeAgencyClientId`  — written at sign-in time so
//       the very first render after login already has a workspace
//       pre-selected. Subsequent switches only touch the cookie.
//
//  App-level RLS (Row-Level Security):
//  ─────────────────────────────────────────────────────────────
//  This is NOT database-level PostgreSQL RLS. It is application-level
//  tenant isolation: every Prisma query the agency admin's session
//  triggers is scoped by `companyId` derived from the active
//  AgencyClient. The DB never sees an unscoped query — the chokepoint
//  is `requireUserCompany()` in `src/lib/harchiq/company-session.ts`,
//  which has been extended to consult this module.
//
//  Founder directive (BRICK-8-agency, worklog.md):
//    "Agences RP = canaux/prescripteurs, pas acheteurs directs."
//  → Agencies resell the platform under their own brand. The agency
//    admin manages many sub-clients (Attijariwafa, OCP, Maroc Telecom)
//    but each sub-client's data is strictly isolated.
// ═══════════════════════════════════════════════════════════════

import { getServerSession } from "next-auth";
import { cookies, headers } from "next/headers";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";

export const ACTIVE_AGENCY_CLIENT_COOKIE = "activeAgencyClientId";

/**
 * The agency workspace context for the current request.
 *
 *   agencyId              — the Agency master account the admin belongs to
 *   activeAgencyClientId  — the sub-client workspace they've switched into
 *                           (null if no switch yet — admin is in master view)
 *   companyId             — the Company row id backing the active sub-client
 *                           (passed into requireUserCompany so console APIs
 *                           query the right company)
 *   role                  — "agency-admin" (or "admin" for super-admins)
 *   agency                — the full Agency row (name, slug, commissionPct...)
 */
export interface AgencyContext {
  agencyId: string;
  activeAgencyClientId: string | null;
  companyId: string | null;
  role: "agency-admin" | "admin";
  agency: {
    id: string;
    name: string;
    slug: string;
    commissionPct: number;
    primaryColor: string | null;
    logoUrl: string | null;
    status: string;
  };
}

export class AgencyAuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// ─── Session-like type (avoids importing next-auth types circularly) ──
interface SessionLike {
  user?: {
    id?: string | null;
    role?: string | null;
    email?: string | null;
    activeAgencyClientId?: string | null;
  } | null;
}

/**
 * Read the `activeAgencyClientId` cookie (Next.js `cookies()` helper).
 * Returns null if the cookie is absent or the request is not in a
 * server component / route handler context.
 */
export async function readActiveAgencyClientCookie(): Promise<string | null> {
  try {
    const store = await cookies();
    const v = store.get(ACTIVE_AGENCY_CLIENT_COOKIE)?.value;
    return v && v.length > 0 ? v : null;
  } catch {
    // Outside a request context (e.g. called from a script) — no cookie.
    return null;
  }
}

/**
 * Read the request Host header defensively.
 */
async function readHost(): Promise<string | null> {
  try {
    const h = await headers();
    return h.get("host");
  } catch {
    return null;
  }
}

/**
 * Resolve the agency workspace context for the current request.
 *
 * Behaviour:
 *   • No session                  → returns null (caller decides what to do)
 *   • role !== "agency-admin"     → returns null (regular user — no agency)
 *   • user has no agencyId in DB  → returns null (orphan agency-admin claim)
 *   • agency suspended            → throws AgencyAuthError(403)
 *   • activeAgencyClientId cookie set AND the client belongs to the
 *     agency                       → returns context with that client's companyId
 *   • no active client             → returns context with companyId=null
 *
 * NOTE: This function does ONE DB round-trip in the happy path
 * (agency row + active client row, batched). It is safe to call
 * from every API route and server component.
 */
export async function getAgencyContext(
  session?: SessionLike | null,
): Promise<AgencyContext | null> {
  // Resolve session if not passed (lazy getServerSession).
  const sess = session ?? (await getServerSession(authOptions));
  if (!sess?.user) return null;

  const role = sess.user.role;
  if (role !== "agency-admin" && role !== "admin") return null;

  const userId = sess.user.id;
  if (!userId) return null;

  // Fetch the user row to get the authoritative agencyId. The JWT
  // might be stale (agency-admin was just attached to an agency).
  // We also pick the agency row in the same query via Prisma relation.
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      agencyId: true,
      agency: {
        select: {
          id: true,
          name: true,
          slug: true,
          commissionPct: true,
          primaryColor: true,
          logoUrl: true,
          status: true,
        },
      },
    },
  });
  if (!user || !user.agencyId || !user.agency) return null;
  if (user.agency.status === "suspended" || user.agency.status === "terminated") {
    throw new AgencyAuthError(
      `Agency ${user.agency.slug} is ${user.agency.status} — access denied`,
      403,
    );
  }

  // Active workspace — prefer cookie (latest switch) over JWT claim.
  const cookieVal = await readActiveAgencyClientCookie();
  const activeId = cookieVal ?? sess.user.activeAgencyClientId ?? null;

  let companyId: string | null = null;
  if (activeId) {
    // Verify the active client belongs to this agency (defence in depth:
    // a malicious cookie value must not grant cross-tenant access).
    const client = await prisma.agencyClient.findFirst({
      where: { id: activeId, agencyId: user.agencyId },
      select: { id: true, companyId: true, status: true },
    });
    if (client && client.status === "active") {
      companyId = client.companyId;
    }
    // If the cookie points to a non-existent / suspended / cross-agency
    // client, fall back to companyId=null (master view) — never throw,
    // because the agency dashboard itself is still accessible.
  }

  return {
    agencyId: user.agencyId,
    activeAgencyClientId: activeId,
    companyId,
    role: role as "agency-admin" | "admin",
    agency: user.agency,
  };
}

/**
 * Resolve an AgencyClient from the request Host header.
 *
 * Two matching strategies:
 *   1. Subdomain  → `iq.{subdomain}.harchcorp.com` or `{subdomain}.harchcorp.com`
 *      The leading `iq.` segment is the convention for "intelligence" white-label
 *      portals; we strip it before lookup.
 *   2. Custom domain → `intelligence.attijariwafa.com` — exact match on
 *      AgencyClient.customDomain.
 *
 * Returns null if no match (caller falls back to default Harch branding).
 *
 * This is what powers the public login page branding (GET /api/agency/branding)
 * — it does NOT require auth.
 */
export async function resolveAgencyClientFromHost(
  headerStore?: Headers,
): Promise<{ id: string; agencyId: string; companyId: string; subdomain: string | null; customDomain: string | null } | null> {
  const host = headerStore?.get("host") ?? (await readHost());
  if (!host) return null;

  // Normalise: strip port, lowercase.
  const cleanHost = host.split(":")[0].toLowerCase();

  // 1. Custom domain — exact match.
  const byCustom = await prisma.agencyClient.findFirst({
    where: { customDomain: cleanHost, status: "active" },
    select: { id: true, agencyId: true, companyId: true, subdomain: true, customDomain: true },
  });
  if (byCustom) return byCustom;

  // 2. Subdomain on harchcorp.com — extract the first label.
  //    Accept both `iq.{sub}.harchcorp.com` and `{sub}.harchcorp.com`.
  if (cleanHost.endsWith(".harchcorp.com")) {
    const labels = cleanHost.slice(0, -".harchcorp.com".length).split(".");
    const sub = labels[labels.length - 1]; // last label before harchcorp.com
    if (sub && sub !== "iq" && sub !== "www" && sub !== "atelier") {
      const bySub = await prisma.agencyClient.findFirst({
        where: { subdomain: sub, status: "active" },
        select: { id: true, agencyId: true, companyId: true, subdomain: true, customDomain: true },
      });
      if (bySub) return bySub;
    }
  }

  return null;
}

/**
 * Hard gate for agency-admin-only routes. Returns the validated
 * AgencyContext. Throws AgencyAuthError if the caller is not an
 * agency-admin (or super-admin) with an active agency.
 *
 * Usage:
 *   const ctx = await requireAgencyAdmin();
 *   if (!ctx) return 403;  // (won't reach — requireAgencyAdmin throws)
 */
export async function requireAgencyAdmin(): Promise<AgencyContext> {
  const ctx = await getAgencyContext();
  if (!ctx) {
    throw new AgencyAuthError(
      "Forbidden — agency-admin role required",
      403,
    );
  }
  return ctx;
}

/**
 * Verify that an AgencyClient belongs to the caller's agency.
 * Used by /api/agency/clients/[id] to prevent cross-agency access.
 *
 * Throws AgencyAuthError(403) if the client does not belong to the
 * agency admin's agency, or AgencyAuthError(404) if it doesn't exist.
 */
export async function requireAgencyClientOwnership(
  agencyClientId: string,
): Promise<{ agencyClient: AgencyContext; clientId: string; companyId: string }> {
  const ctx = await requireAgencyAdmin();
  const client = await prisma.agencyClient.findFirst({
    where: { id: agencyClientId, agencyId: ctx.agencyId },
    select: { id: true, companyId: true, status: true },
  });
  if (!client) {
    throw new AgencyAuthError(
      "AgencyClient not found (or does not belong to your agency)",
      404,
    );
  }
  return { agencyClient: ctx, clientId: client.id, companyId: client.companyId };
}

/**
 * Switch the active workspace for the current agency admin.
 *
 * Sets the `activeAgencyClientId` cookie (httpOnly, 30-day expiry,
 * sameSite=lax). The cookie is intentionally NOT bound to a specific
 * path so it works for /atelier/console/* and /atelier/agency/* alike.
 *
 * Does NOT re-issue the JWT — that's the whole point of using a cookie
 * (switching workspace is cheap and doesn't invalidate other sessions).
 *
 * Returns the new context for the caller to use.
 */
export async function switchActiveClient(
  agencyClientId: string,
): Promise<AgencyContext> {
  const ctx = await requireAgencyAdmin();

  // Verify the target client belongs to the agency admin's agency.
  const client = await prisma.agencyClient.findFirst({
    where: { id: agencyClientId, agencyId: ctx.agencyId },
    select: { id: true, companyId: true, status: true },
  });
  if (!client) {
    throw new AgencyAuthError(
      "AgencyClient not found (or does not belong to your agency)",
      404,
    );
  }
  if (client.status !== "active") {
    throw new AgencyAuthError(
      `AgencyClient is ${client.status} — cannot switch`,
      403,
    );
  }

  const store = await cookies();
  store.set(ACTIVE_AGENCY_CLIENT_COOKIE, agencyClientId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return {
    ...ctx,
    activeAgencyClientId: agencyClientId,
    companyId: client.companyId,
  };
}

/**
 * Clear the active workspace cookie (sign out of sub-client view,
 * return to agency master dashboard).
 */
export async function clearActiveClient(): Promise<void> {
  const store = await cookies();
  store.delete(ACTIVE_AGENCY_CLIENT_COOKIE);
}

/**
 * Build a Next.js Set-Cookie header value for `activeAgencyClientId`.
 * Used by API routes that need to return the cookie in the response
 * (alongside a JSON body).
 */
export function buildActiveClientCookieHeader(
  agencyClientId: string,
): string {
  const segments = [
    `${ACTIVE_AGENCY_CLIENT_COOKIE}=${agencyClientId}`,
    "Path=/",
    "SameSite=Lax",
    "HttpOnly",
    `Max-Age=${60 * 60 * 24 * 30}`,
  ];
  if (process.env.NODE_ENV === "production") segments.push("Secure");
  return segments.join("; ");
}
