// ═══════════════════════════════════════════════════════════════════
//  HARCHIQ QUOTA — P1-4 FIX (KAEL — Protocole Leverage Maximal)
//
//  Server-side enforcement of HarchIQ AI question quotas.
//  Previously client-side only (useState in dashboards) — bypassable
//  by refresh/multi-tab. Now enforced at the API route level.
//
//  Quotas by accountType (normalized via rbac.ts):
//    essential  → 50 questions/day
//    pro        → 200 questions/day
//    enterprise → unlimited (Integer.MAX_SAFE_INTEGER)
//    agency     → 200 questions/day (per agency-admin, not per sub-client)
//
//  Tracking: AuditLog table (action="harchiq_ask", userId, createdAt).
//  Count queries the last 24h of AuditLog entries for this userId+action.
//
//  Admins bypass the quota (full access).
// ═══════════════════════════════════════════════════════════════════

import { prisma } from "@/lib/db";
import { normalizeAccountType } from "@/lib/auth/rbac";

export const HARCHIQ_QUOTAS: Record<string, number> = {
  essential: 50,
  pro: 200,
  enterprise: Number.MAX_SAFE_INTEGER, // illimité
  agency: 200,
};

export interface QuotaCheckResult {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
  resetAt: Date; // next midnight (24h rolling window)
}

/**
 * Check if a user can ask another HarchIQ question today.
 * Does NOT increment the counter — call recordHarchIQQuestion() after
 * the question succeeds to persist the audit trail.
 */
export async function checkHarchIQQuota(
  userId: string,
  accountType: string | null | undefined,
  role: string | null | undefined,
): Promise<QuotaCheckResult> {
  // Admins bypass quota
  if (role === "admin" || role === "super_admin") {
    return {
      allowed: true,
      used: 0,
      limit: Number.MAX_SAFE_INTEGER,
      remaining: Number.MAX_SAFE_INTEGER,
      resetAt: getNextMidnight(),
    };
  }

  const normalized = normalizeAccountType(accountType) ?? "essential";
  const limit = HARCHIQ_QUOTAS[normalized] ?? 50;

  // Count questions in the last 24h (rolling window)
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const used = await prisma.auditLog.count({
    where: {
      userId,
      action: "harchiq_ask",
      createdAt: { gte: twentyFourHoursAgo },
    },
  });

  const remaining = Math.max(0, limit - used);
  return {
    allowed: used < limit,
    used,
    limit,
    remaining,
    resetAt: getNextMidnight(),
  };
}

/**
 * Record a successful HarchIQ question in the audit log.
 * Fire-and-forget — must NEVER throw (audit logging is non-blocking).
 */
export async function recordHarchIQQuestion(params: {
  userId: string;
  question: string;
  accountType: string | null | undefined;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: "harchiq_ask",
        resource: "harchiq-ai",
        result: "success",
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
        metadata: {
          questionPreview: params.question.slice(0, 200),
          accountType: normalizeAccountType(params.accountType) ?? "unknown",
          questionLength: params.question.length,
        },
      },
    });
  } catch {
    // Audit logging must never crash the route — fail silently.
  }
}

function getNextMidnight(): Date {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
}
