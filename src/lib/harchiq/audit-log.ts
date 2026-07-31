// ═══════════════════════════════════════════════════════════════
//  AUDIT LOG SERVICE — Loi 09-08 (CNDP Maroc) compliance
//
//  Every sensitive action performed by a user (sanctions screening,
//  dossier view, report export, settings change, user suspension,
//  AI probing, briefing generation, login, ...) MUST be recorded
//  in the AuditLog table for traceability.
//
//  CRITICAL CONTRACT:
//    1. logAudit() MUST NEVER throw — audit logging must not crash
//       the request it's auditing. All errors are swallowed and
//       logged to stderr.
//    2. logAudit() is fire-and-forget-friendly: callers can either
//       `await` it (preferred — the audit row is committed before
//       the response is sent) OR not (the call is non-blocking).
//    3. userId / ipAddress / userAgent are all optional — the
//       AuditLog table allows nulls so anonymous actions (e.g.
//       failed login with a non-existent email) can still be
//       recorded.
//
//  Task: audit-log-enforcement
// ═══════════════════════════════════════════════════════════════

import { prisma } from "@/lib/db";

export type AuditAction =
  | "sanctions_screen"
  | "dossier_view"
  | "report_export"
  | "data_export_csv"
  | "portfolio_import"
  | "company_settings_update"
  | "user_invite"
  | "user_suspend"
  | "demo_access"
  | "login"
  | "login_failed"
  | "onboarding_complete"
  | "ai_probe"
  | "briefing_generate";

export type AuditResult = "success" | "denied" | "error";

export interface LogAuditParams {
  userId?: string | null;
  action: AuditAction;
  /** What was accessed (e.g. "company:attijariwafa-bank" or "report:abc123"). */
  resource: string;
  result: AuditResult;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Persist a single audit log entry.
 *
 * NEVER throws — on failure, logs to stderr and returns void so the
 * caller's request continues unaffected. This is mandated by the
 * audit-trail contract: a failure to log must not break the action
 * being audited (otherwise attackers could DoS the audit pipeline
 * by inducing log failures).
 */
export async function logAudit(params: LogAuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId ?? null,
        action: params.action,
        resource: params.resource,
        result: params.result,
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
        // Prisma treats `undefined` as "skip this field" — fine for an
        // optional Json column. We pass an actual value when metadata
        // is provided so the row is queryable.
        metadata: params.metadata ?? undefined,
      },
    });
  } catch (err) {
    console.error(
      "[audit-log] failed to write audit entry",
      params.action,
      params.resource,
      err instanceof Error ? err.message : err,
    );
  }
}

/**
 * Extract the client IP from request headers.
 *
 * Honours `x-forwarded-for` (preferred — first hop is the client)
 * then `x-real-ip` (set by some reverse proxies). Returns undefined
 * if neither is present (e.g. localhost dev).
 */
export function extractIp(req: Request): string | undefined {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return undefined;
}

/**
 * Extract the User-Agent string from request headers.
 */
export function extractUserAgent(req: Request): string | undefined {
  return req.headers.get("user-agent") ?? undefined;
}
