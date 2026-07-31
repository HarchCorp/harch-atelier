// ═══════════════════════════════════════════════════════════════
//  COMPANY SESSION HELPER — resolve the logged-in user's company
//
//  Replaces the old `prisma.company.findFirst({ orderBy: { createdAt:
//  "asc" } })` pattern that leaked OCP data to every user.
//
//  Usage in API routes:
//
//    import { requireUserCompany } from "@/lib/harchiq/company-session";
//
//    const result = await requireUserCompany();
//    if (!result.ok) return result.response;     // 401 / 403
//    const { user, company } = result.data;       // typed, safe
//
//  Behaviour:
//    • No session              → 401 Unauthorized
//    • No user.id              → 401 (NextAuth JWT missing id claim)
//    • No companyId on user    → 403 with { redirect: "/atelier/onboarding" }
//    • Company row missing     → 404 (DB integrity issue)
//
//  Admins (role === "admin") are NOT auto-bypassed — they must still
//  have a companyId to see company data. The /atelier/admin dashboard
//  doesn't use this helper.
//
//  Task: user-company-onboarding
// ═══════════════════════════════════════════════════════════════

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";

export interface UserCompanyOk {
  ok: true;
  data: {
    userId: string;
    /** True for the four executive demo accounts. Drives demoFilter. */
    isDemo: boolean;
    /**
     * Prisma where-clause fragment that isolates demo data from real
     * data. Spread into every Article / AIVisibility / RiskAssessment
     * / ReputationScore / Portfolio / Dossier / Notification query
     * the caller makes for this user.
     *
     *   demo users  →  { isDemo: true }   (see ONLY demo data)
     *   real users  →  { isDemo: false }  (see ONLY real data)
     *
     * Task: domain-matching-demo-isolation
     */
    demoFilter: { isDemo: boolean };
    user: {
      id: string;
      email: string;
      name: string | null;
      role: string;
      accountType: string;
      companyId: string;
    };
    company: {
      id: string;
      slug: string;
      name: string;
      sector: string;
      ticker: string | null;
    };
  };
}

export interface UserCompanyErr {
  ok: false;
  response: NextResponse;
}

export type UserCompanyResult = UserCompanyOk | UserCompanyErr;

/**
 * Resolve the logged-in user's company. Returns a discriminated
 * union — callers MUST check `.ok` before using `.data`.
 */
export async function requireUserCompany(): Promise<UserCompanyResult> {
  const session = await getServerSession(authOptions);

  // ─── 1. Auth check ──────────────────────────────────────────────
  if (!session?.user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const userId = session.user.id;
  if (!userId) {
    // The JWT didn't carry user.id — the IDOR patch (commit 57f0723)
    // is supposed to set this in the jwt callback. Reject hard so
    // we never silently fall back to findFirst again.
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Session missing user id claim" },
        { status: 401 },
      ),
    };
  }

  // ─── 2. Fetch the user row ─────────────────────────────────────
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      accountType: true,
      companyId: true,
      onboardingCompleted: true,
      isDemo: true,
    },
  });

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "User not found" }, { status: 404 }),
    };
  }

  // ─── Task: domain-matching-demo-isolation ──────────────────────
  // Build the demo isolation filter. Demo users (the four executive
  // demo accounts) see ONLY isDemo:true data. Real users (everyone
  // else, including admins) see ONLY isDemo:false data. This is the
  // single chokepoint — callers spread `demoFilter` into every
  // Article / AIVisibility / RiskAssessment / ReputationScore /
  // Portfolio / Dossier / Notification where clause.
  const isDemo = user.isDemo === true;
  const demoFilter: { isDemo: boolean } = { isDemo };

  // ─── 3. Company check ──────────────────────────────────────────
  // No companyId → the user hasn't completed onboarding. Return a 403
  // with a redirect hint so the client can bounce them to /atelier/onboarding
  // without an extra round-trip.
  if (!user.companyId) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "No company associated — complete onboarding first",
          redirect: "/atelier/onboarding",
          onboardingCompleted: user.onboardingCompleted,
        },
        { status: 403 },
      ),
    };
  }

  // ─── 4. Fetch the company row ──────────────────────────────────
  const company = await prisma.company.findUnique({
    where: { id: user.companyId },
    select: {
      id: true,
      slug: true,
      name: true,
      sector: true,
      ticker: true,
    },
  });

  if (!company) {
    // companyId was set but the Company row is gone (deleted?). Treat
    // as onboarding-required — the user needs to re-pick a company.
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Associated company no longer exists — re-onboard",
          redirect: "/atelier/onboarding",
        },
        { status: 404 },
      ),
    };
  }

  return {
    ok: true,
    data: {
      userId: user.id,
      isDemo,
      demoFilter,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        accountType: user.accountType,
        companyId: user.companyId,
      },
      company,
    },
  };
}

// ═══════════════════════════════════════════════════════════════
//  DEMO FILTER HELPER — for routes that don't go through
//  requireUserCompany() (e.g. the admin ?company=<slug> preview
//  path, or routes that only need the filter without the full
//  company resolution).
//
//  Reads isDemo from the NextAuth session JWT (populated in
//  auth.config.ts). Falls back to false if the claim is missing —
//  the safe default is "real user" so a malformed session never
//  accidentally exposes demo data.
//
//  Task: domain-matching-demo-isolation
// ═══════════════════════════════════════════════════════════════

interface SessionLike {
  user?: { isDemo?: boolean } | null;
}

/**
 * Build a `{ isDemo: boolean }` Prisma filter from a NextAuth session.
 *
 *   demo users   →  { isDemo: true }
 *   real users   →  { isDemo: false }
 *   missing/jwt  →  { isDemo: false }   (safe default — real user view)
 */
export function demoFilterFromSession(session: SessionLike | null | undefined): { isDemo: boolean } {
  return { isDemo: session?.user?.isDemo === true };
}
