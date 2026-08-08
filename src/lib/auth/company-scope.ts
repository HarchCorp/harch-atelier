// ═══════════════════════════════════════════════════════════════
//  COMPANY SCOPE AUTH HELPERS
//  Task: company-dedup-enterprise-admin
//
//  Tiny helpers used by /api/company/* routes to enforce the
//  "company-admin can ONLY see/manage their own company" rule.
//
//  Two helpers:
//    • requireCompanyAdmin()  — caller must be role=company-admin
//                                (or super-admin) AND have a companyId.
//                                Returns { userId, companyId, role }.
//    • requireCompanyAdminOrAdmin() — same, but super-admin (role=admin)
//                                is also allowed (used by routes a
//                                super-admin might call, like settings).
// ═══════════════════════════════════════════════════════════════

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { logError } from "@/lib/logger";

export interface CompanyScope {
  userId: string;
  companyId: string;
  role: "company-admin" | "admin";
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/**
 * Verify the caller is a company-admin (or super-admin) AND that
 * they actually belong to a company. Returns the validated scope
 * (userId + companyId + role) so callers don't have to re-read
 * the session.
 *
 * Company-admin: companyId comes from the session JWT (set at
 * sign-in time). We re-fetch the user row to defend against the
 * case where the admin was demoted or moved to another company
 * after the JWT was issued — the DB is the source of truth.
 */
export async function requireCompanyAdmin(): Promise<CompanyScope> {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new AuthError("Unauthorized — sign in required", 401);
  }
  const userId = session.user.id;
  if (!userId) {
    throw new AuthError("Unauthorized — invalid session", 401);
  }

  const role = session.user.role;
  if (role !== "company-admin" && role !== "admin") {
    throw new AuthError("Forbidden — company-admin role required", 403);
  }

  // Re-fetch the user row to get the authoritative companyId (the
  // JWT may be stale if the user was just attached to a company).
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, companyId: true, role: true, status: true },
  });
  if (!user) {
    throw new AuthError("Unauthorized — user not found", 401);
  }
  if (user.status === "suspended") {
    throw new AuthError("Forbidden — account suspended", 403);
  }
  if (!user.companyId) {
    throw new AuthError(
      "Forbidden — your account is not attached to a company",
      403,
    );
  }

  return {
    userId: user.id,
    companyId: user.companyId,
    role: user.role as "company-admin" | "admin",
  };
}

/**
 * Same as requireCompanyAdmin but a super-admin (role=admin) can
 * bypass the companyId requirement by passing a target companyId
 * via the `targetCompanyId` parameter. Used by routes that a
 * super-admin might call on behalf of a company (e.g. settings
 * preview from /atelier/admin).
 */
export async function requireCompanyAdminOrAdmin(
  targetCompanyId?: string,
): Promise<CompanyScope> {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new AuthError("Unauthorized — sign in required", 401);
  }
  const userId = session.user.id;
  if (!userId) {
    throw new AuthError("Unauthorized — invalid session", 401);
  }

  const role = session.user.role;
  if (role !== "company-admin" && role !== "admin") {
    throw new AuthError("Forbidden — admin role required", 403);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, companyId: true, role: true, status: true },
  });
  if (!user) {
    throw new AuthError("Unauthorized — user not found", 401);
  }
  if (user.status === "suspended") {
    throw new AuthError("Forbidden — account suspended", 403);
  }

  // Super-admin: must specify a target company (or have one of their own).
  if (role === "admin") {
    const companyId = targetCompanyId || user.companyId;
    if (!companyId) {
      throw new AuthError(
        "Bad request — target companyId required for super-admin",
        400,
      );
    }
    // Verify the company exists
    const exists = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true },
    });
    if (!exists) {
      throw new AuthError("Not found — company does not exist", 404);
    }
    return { userId: user.id, companyId, role: "admin" };
  }

  // company-admin: targetCompanyId must match their own companyId
  if (targetCompanyId && targetCompanyId !== user.companyId) {
    throw new AuthError(
      "Forbidden — company-admin can only manage their own company",
      403,
    );
  }
  if (!user.companyId) {
    throw new AuthError(
      "Forbidden — your account is not attached to a company",
      403,
    );
  }
  return {
    userId: user.id,
    companyId: user.companyId,
    role: "company-admin",
  };
}

/**
 * Convert an AuthError (or any Error) into a JSON Response with
 * the correct status code. Used as the catch handler in API routes.
 */
export function toErrorResponse(err: unknown): Response {
  if (err instanceof AuthError) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: err.status,
      headers: { "Content-Type": "application/json" },
    });
  }
  logError("lib.auth.company-scope", `[company API] unexpected error: ${err instanceof Error ? err.message : err}`);
  return new Response(
    JSON.stringify({
      error: err instanceof Error ? err.message : "Unknown error",
    }),
    {
      status: 500,
      headers: { "Content-Type": "application/json" },
    },
  );
}
