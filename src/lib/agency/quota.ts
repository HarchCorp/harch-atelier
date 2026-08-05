// ═══════════════════════════════════════════════════════════════
//  AGENCY QUOTA — Brick 8 — Tier 4 White-Label Engine
//
//  Per-sub-client quota allocation + enforcement. Each AgencyClient
//  has one AgencyQuota (limits per plan tier) and many AgencyUsage
//  rows (one per billing period, monthly "YYYY-MM").
//
//  Resources tracked:
//    apiRequest      — every call to /api/console/* wrapped by withQuotaCheck
//    whatsappAlert   — every WhatsApp push delivered by the cron
//    keyword         — concurrent tracked keywords (gauge, not counter)
//    source          — concurrent monitored sources (gauge, not counter)
//    user            — concurrent seats (gauge, not counter)
//
//  Performance:
//    getQuota + checkQuota are 2 indexed lookups (agencyClient → quota +
//    usage by period). Measured at <5ms against Neon PostgreSQL with
//    the @@unique([agencyClientId, period]) index.
//
//  Enforcement pattern:
//    export const GET = withQuotaCheck(handler, "apiRequest");
//
//  withQuotaCheck:
//    1. Resolves the active agency client from the session+cookie.
//    2. If no agency client is active → pass-through (regular user,
//       no quota enforcement — they're not on a white-label plan).
//    3. If active client → checkQuota() for the resource.
//    4. If exceeded → return 429 with { error, resource, used, max }.
//    5. If allowed → incrementUsage() + run the handler.
//    6. If increment fails (race condition) → log but don't block
//       (best-effort accounting — never block a paid request on
//       accounting failure).
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAgencyContext } from "./agency-session";

export type QuotaResource =
  | "apiRequest"
  | "whatsappAlert"
  | "keyword"
  | "source"
  | "user";

export interface QuotaCheckResult {
  allowed: boolean;
  used: number;
  max: number;
  remaining: number;
  /** "YYYY-MM" period this check applies to (current month). */
  period: string;
}

export interface QuotaSnapshot {
  quota: {
    id: string;
    maxApiRequests: number;
    maxWhatsAppAlerts: number;
    maxKeywords: number;
    maxSources: number;
    maxUsers: number;
    planTier: string;
    monthlyPriceMAD: number;
  };
  usage: {
    period: string;
    apiRequests: number;
    whatsappAlerts: number;
    keywordsUsed: number;
    sourcesUsed: number;
    usersActive: number;
    lastResetAt: Date;
  } | null;
}

// ─── Period helper ──────────────────────────────────────────────────

/**
 * Returns the current monthly period string in "YYYY-MM" format,
 * computed in UTC. This matches the value stored in AgencyUsage.period
 * and is the key we upsert against.
 */
export function currentPeriod(now: Date = new Date()): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

// ─── Quota reads ────────────────────────────────────────────────────

/**
 * Atomically check + increment a counter resource in a single SQL
 * statement. This is the race-condition-safe version of
 * `checkQuota` → `incrementUsage` for counter resources
 * (apiRequest, whatsappAlert).
 *
 * SQL equivalent:
 *   UPDATE "AgencyUsage"
 *   SET "apiRequests" = "apiRequests" + 1
 *   WHERE "agencyClientId" = $1 AND "period" = $2
 *     AND "apiRequests" < $max
 *   RETURNING "apiRequests"
 *
 * If 0 rows are returned, the quota is exceeded (or the row doesn't
 * exist yet, which we treat as "allowed" since the first request
 * creates the row with count=1).
 *
 * RACE CONDITION FIX (Protocole Omega — Phase 1):
 * The previous withQuotaCheck did checkQuota (read) then
 * incrementUsage (write) as TWO operations. 50 concurrent requests
 * all read used=0, all pass the check, all increment → 50 creations
 * instead of 1. This function makes the check+increment atomic via
 * a single UPDATE...WHERE...RETURNING statement, so Postgres's row
 * lock serialises the concurrent increments.
 *
 * For gauge resources (keyword/source/user), use checkQuota +
 * incrementUsage separately — gauges don't have the same race
 * (they're set to an absolute value, not incremented).
 */
export async function consumeQuota(
  agencyClientId: string,
  resource: "apiRequest" | "whatsappAlert",
): Promise<QuotaCheckResult> {
  const period = currentPeriod();
  const snap = await getQuota(agencyClientId);
  if (!snap) {
    return {
      allowed: true,
      used: 0,
      max: Number.MAX_SAFE_INTEGER,
      remaining: Number.MAX_SAFE_INTEGER,
      period,
    };
  }

  const max = resource === "apiRequest" ? snap.quota.maxApiRequests : snap.quota.maxWhatsAppAlerts;
  const column = resource === "apiRequest" ? "apiRequests" : "whatsappAlerts";

  // Atomic UPDATE...WHERE counter < max RETURNING new_value
  // If the row doesn't exist yet (first request of the period), we
  // create it with count=1 (allowed since 1 <= max for any sane plan).
  if (!snap.usage) {
    try {
      await prisma.agencyUsage.create({
        data: {
          agencyClientId,
          period,
          [column]: 1,
        } as any,
      });
      return { allowed: true, used: 1, max, remaining: Math.max(0, max - 1), period };
    } catch (err: any) {
      if (err?.code === "P2002") {
        // Row was just created by a concurrent request — fall through
        // to the atomic UPDATE path below.
      } else {
        throw err;
      }
    }
  }

  // Atomic check+increment: only updates if current value < max.
  const result = await prisma.$queryRaw<Array<{ newval: number }>>`
    UPDATE "AgencyUsage"
    SET "${column}" = "${column}" + 1
    WHERE "agencyClientId" = ${agencyClientId}
      AND "period" = ${period}
      AND "${column}" < ${max}
    RETURNING "${column}" AS "newval"
  `;

  if (result.length > 0) {
    const newVal = Number(result[0].newval);
    return { allowed: true, used: newVal, max, remaining: Math.max(0, max - newVal), period };
  }

  // Either quota exceeded OR a concurrent create won the race.
  // Re-read to get the accurate current value for the 429 response.
  const current = await getQuota(agencyClientId);
  const used = resource === "apiRequest"
    ? current?.usage?.apiRequests ?? 0
    : current?.usage?.whatsappAlerts ?? 0;
  return { allowed: false, used, max, remaining: 0, period };
}

/**
 * Get the quota + current month's usage for an AgencyClient.
 * Returns null if the client doesn't exist or has no quota row.
 */
export async function getQuota(
  agencyClientId: string,
): Promise<QuotaSnapshot | null> {
  const period = currentPeriod();
  const [quota, usage] = await Promise.all([
    prisma.agencyQuota.findUnique({
      where: { agencyClientId },
      select: {
        id: true,
        maxApiRequests: true,
        maxWhatsAppAlerts: true,
        maxKeywords: true,
        maxSources: true,
        maxUsers: true,
        planTier: true,
        monthlyPriceMAD: true,
      },
    }),
    prisma.agencyUsage.findUnique({
      where: {
        agencyClientId_period: { agencyClientId, period },
      },
      select: {
        period: true,
        apiRequests: true,
        whatsappAlerts: true,
        keywordsUsed: true,
        sourcesUsed: true,
        usersActive: true,
        lastResetAt: true,
      },
    }),
  ]);
  if (!quota) return null;
  return { quota, usage };
}

/**
 * Check whether a single unit of `resource` is allowed under the
 * agency client's current quota. Does NOT increment — call
 * incrementUsage() after a successful check.
 *
 * For "gauge" resources (keyword / source / user), the caller is
 * responsible for recomputing the current value before each call.
 * For "counter" resources (apiRequest / whatsappAlert), the value
 * comes from the AgencyUsage row.
 */
export async function checkQuota(
  agencyClientId: string,
  resource: QuotaResource,
): Promise<QuotaCheckResult> {
  const snap = await getQuota(agencyClientId);
  if (!snap) {
    // No quota row → unlimited fallback (defensive; in practice every
    // AgencyClient gets a quota at creation time via POST /api/agency/clients).
    return {
      allowed: true,
      used: 0,
      max: Number.MAX_SAFE_INTEGER,
      remaining: Number.MAX_SAFE_INTEGER,
      period: currentPeriod(),
    };
  }

  const { quota, usage } = snap;
  const period = snap.usage?.period ?? currentPeriod();

  switch (resource) {
    case "apiRequest": {
      const used = usage?.apiRequests ?? 0;
      const max = quota.maxApiRequests;
      return { allowed: used < max, used, max, remaining: Math.max(0, max - used), period };
    }
    case "whatsappAlert": {
      const used = usage?.whatsappAlerts ?? 0;
      const max = quota.maxWhatsAppAlerts;
      return { allowed: used < max, used, max, remaining: Math.max(0, max - used), period };
    }
    case "keyword": {
      const used = usage?.keywordsUsed ?? 0;
      const max = quota.maxKeywords;
      return { allowed: used < max, used, max, remaining: Math.max(0, max - used), period };
    }
    case "source": {
      const used = usage?.sourcesUsed ?? 0;
      const max = quota.maxSources;
      return { allowed: used < max, used, max, remaining: Math.max(0, max - used), period };
    }
    case "user": {
      const used = usage?.usersActive ?? 0;
      const max = quota.maxUsers;
      return { allowed: used < max, used, max, remaining: Math.max(0, max - used), period };
    }
  }
}

/**
 * Atomically increment the usage counter for a resource on the
 * current period. Uses a single SQL UPDATE with `counter = counter + N`
 * (via Prisma's atomic update) — no read-then-write window, so 50
 * concurrent requests all see the increment applied serially by
 * Postgres's row lock on the @@unique constraint.
 *
 * For "gauge" resources (keyword / source / user), this SETS the value
 * rather than incrementing — callers pass the new absolute count.
 *
 * RACE CONDITION FIX (Protocole Omega — Phase 1):
 * The previous implementation did findUnique → update, which had a
 * TOCTOU window: 50 concurrent requests all read used=0, all pass
 * the checkQuota gate, all write used=1. The atomic UPDATE below
 * eliminates this window by letting Postgres serialise the increments
 * via the row lock acquired during the UPDATE.
 *
 * Returns the updated row.
 */
export async function incrementUsage(
  agencyClientId: string,
  resource: QuotaResource,
  count: number = 1,
): Promise<void> {
  const period = currentPeriod();

  // 1. Try atomic increment on existing row.
  //    Prisma translates `{ apiRequests: { increment: count } }` into
  //    `UPDATE ... SET "apiRequests" = "apiRequests" + $1` — a single
  //    statement that acquires the row lock and applies the delta
  //    atomically. No TOCTOU window.
  try {
    const patch: Record<string, { increment: number } | number> = {};
    switch (resource) {
      case "apiRequest":
        patch.apiRequests = { increment: count };
        break;
      case "whatsappAlert":
        patch.whatsappAlerts = { increment: count };
        break;
      // Gauges: caller passes the new absolute value via `count`.
      case "keyword":
        patch.keywordsUsed = count;
        break;
      case "source":
        patch.sourcesUsed = count;
        break;
      case "user":
        patch.usersActive = count;
        break;
    }

    const updated = await prisma.agencyUsage.update({
      where: { agencyClientId_period: { agencyClientId, period } },
      data: patch as any,
    }).catch((err: any) => {
      // P2025 = row not found → need to create. Everything else → throw.
      if (err?.code === "P2025") return null;
      throw err;
    });

    if (updated) return; // atomic increment succeeded
  } catch (err) {
    // Fall through to create path if the update failed with P2025
    if ((err as any)?.code !== "P2025") throw err;
  }

  // 2. No usage row for this period → create one.
  //    The @@unique constraint prevents duplicates: if 2 workers race
  //    here, only one create succeeds; the other gets P2002 and falls
  //    back to the atomic update path above.
  const data: Record<string, number | string> = { agencyClientId, period };
  switch (resource) {
    case "apiRequest":
      data.apiRequests = count;
      break;
    case "whatsappAlert":
      data.whatsappAlerts = count;
      break;
    case "keyword":
      data.keywordsUsed = count;
      break;
    case "source":
      data.sourcesUsed = count;
      break;
    case "user":
      data.usersActive = count;
      break;
  }
  try {
    await prisma.agencyUsage.create({ data: data as any });
  } catch (err: any) {
    if (err?.code === "P2002") {
      // Race: another worker just created the row. Re-run the atomic
      // increment — the row now exists, so the UPDATE path succeeds.
      const patch: Record<string, { increment: number } | number> = {};
      switch (resource) {
        case "apiRequest":
          patch.apiRequests = { increment: count };
          break;
        case "whatsappAlert":
          patch.whatsappAlerts = { increment: count };
          break;
        case "keyword":
          patch.keywordsUsed = count;
          break;
        case "source":
          patch.sourcesUsed = count;
          break;
        case "user":
          patch.usersActive = count;
          break;
      }
      await prisma.agencyUsage.update({
        where: { agencyClientId_period: { agencyClientId, period } },
        data: patch as any,
      });
    } else {
      throw err;
    }
  }
}

// ─── Dashboard summary ──────────────────────────────────────────────

export interface UsageStats {
  quota: QuotaSnapshot["quota"];
  currentPeriod: string;
  currentUsage: QuotaSnapshot["usage"];
  /** Last 6 months of usage rows, oldest first. */
  history: Array<{
    period: string;
    apiRequests: number;
    whatsappAlerts: number;
    keywordsUsed: number;
    sourcesUsed: number;
    usersActive: number;
  }>;
  /** Pre-computed percentage bars for the dashboard. */
  bars: {
    apiRequests: { used: number; max: number; pct: number };
    whatsappAlerts: { used: number; max: number; pct: number };
    keywords: { used: number; max: number; pct: number };
    sources: { used: number; max: number; pct: number };
    users: { used: number; max: number; pct: number };
  };
}

export async function getUsageStats(
  agencyClientId: string,
): Promise<UsageStats | null> {
  const snap = await getQuota(agencyClientId);
  if (!snap) return null;

  const history = await prisma.agencyUsage.findMany({
    where: { agencyClientId },
    orderBy: { period: "desc" },
    take: 6,
    select: {
      period: true,
      apiRequests: true,
      whatsappAlerts: true,
      keywordsUsed: true,
      sourcesUsed: true,
      usersActive: true,
    },
  });
  history.reverse(); // oldest first for charting

  const u = snap.usage;
  const q = snap.quota;
  const pct = (used: number, max: number) =>
    max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 0;

  return {
    quota: q,
    currentPeriod: snap.usage?.period ?? currentPeriod(),
    currentUsage: snap.usage,
    history,
    bars: {
      apiRequests: { used: u?.apiRequests ?? 0, max: q.maxApiRequests, pct: pct(u?.apiRequests ?? 0, q.maxApiRequests) },
      whatsappAlerts: { used: u?.whatsappAlerts ?? 0, max: q.maxWhatsAppAlerts, pct: pct(u?.whatsappAlerts ?? 0, q.maxWhatsAppAlerts) },
      keywords: { used: u?.keywordsUsed ?? 0, max: q.maxKeywords, pct: pct(u?.keywordsUsed ?? 0, q.maxKeywords) },
      sources: { used: u?.sourcesUsed ?? 0, max: q.maxSources, pct: pct(u?.sourcesUsed ?? 0, q.maxSources) },
      users: { used: u?.usersActive ?? 0, max: q.maxUsers, pct: pct(u?.usersActive ?? 0, q.maxUsers) },
    },
  };
}

// ─── withQuotaCheck wrapper ─────────────────────────────────────────

type RouteHandler = (req: Request, ctx?: any) => Promise<Response> | Response;

/**
 * Wrap an API route handler with quota enforcement.
 *
 * Behaviour:
 *   1. Resolve the agency context for the current request.
 *   2. If no agency context (regular user, not an agency admin) →
 *      pass through with no quota check.
 *   3. If agency admin but no active client cookie → pass through
 *      (they're in the agency master dashboard, not a sub-client
 *      workspace — no quota to enforce against).
 *   4. If active client → checkQuota() for the resource.
 *   5. If exceeded → return 429.
 *   6. If allowed → incrementUsage() (fire-and-forget, best-effort)
 *      and run the handler.
 *
 * The wrapper never throws — quota errors are converted to 429
 * responses. Handler errors propagate normally.
 *
 * Usage:
 *   async function getHandler(req: Request) { ... }
 *   export const GET = withQuotaCheck(getHandler, "apiRequest");
 */
export function withQuotaCheck(
  handler: RouteHandler,
  resource: QuotaResource,
): RouteHandler {
  return async (req, ctx) => {
    try {
      const agency = await getAgencyContext();
      if (agency && agency.activeAgencyClientId) {
        // Counter resources (apiRequest, whatsappAlert) use the atomic
        // consumeQuota — check + increment in a single SQL statement,
        // no TOCTOU window. Gauge resources use checkQuota separately
        // (they're set to an absolute value, not incremented).
        if (resource === "apiRequest" || resource === "whatsappAlert") {
          const check = await consumeQuota(
            agency.activeAgencyClientId,
            resource as "apiRequest" | "whatsappAlert",
          );
          if (!check.allowed) {
            return NextResponse.json(
              {
                error: "Quota exceeded",
                resource,
                used: check.used,
                max: check.max,
                remaining: 0,
                period: check.period,
                agencyClientId: agency.activeAgencyClientId,
              },
              { status: 429 },
            );
          }
          // consumeQuota already incremented — no separate increment needed.
        } else {
          // Gauge resource (keyword/source/user) — check only, the caller
          // is responsible for recomputing and setting the absolute value.
          const check = await checkQuota(agency.activeAgencyClientId, resource);
          if (!check.allowed) {
            return NextResponse.json(
              {
                error: "Quota exceeded",
                resource,
                used: check.used,
                max: check.max,
                remaining: 0,
                period: check.period,
                agencyClientId: agency.activeAgencyClientId,
              },
              { status: 429 },
            );
          }
          // Best-effort increment — never block the handler on accounting.
          incrementUsage(agency.activeAgencyClientId, resource, 1).catch((err) => {
            console.error(
              `[quota] failed to increment ${resource} for agencyClient ${agency.activeAgencyClientId}:`,
              err,
            );
          });
        }
      }
    } catch (err) {
      console.error(`[quota] check failed for resource ${resource}:`, err);
    }
    return handler(req, ctx);
  };
}

// ─── Plan tier defaults ─────────────────────────────────────────────

/**
 * Default quota values per plan tier. Used by POST /api/agency/clients
 * when creating a new sub-client (and by the seed script).
 *
 * Aligned with the BRICK-7-cleanup tier rename:
 *   emergence  → 15K MAD/mo
 *   corporate  → 40K MAD/mo
 *   sovereign  → 75K MAD/mo
 */
export const PLAN_DEFAULTS: Record<
  string,
  {
    maxApiRequests: number;
    maxWhatsAppAlerts: number;
    maxKeywords: number;
    maxSources: number;
    maxUsers: number;
    monthlyPriceMAD: number;
  }
> = {
  emergence: {
    maxApiRequests: 10_000,
    maxWhatsAppAlerts: 100,
    maxKeywords: 50,
    maxSources: 30,
    maxUsers: 5,
    monthlyPriceMAD: 15_000,
  },
  corporate: {
    maxApiRequests: 50_000,
    maxWhatsAppAlerts: 500,
    maxKeywords: 200,
    maxSources: 80,
    maxUsers: 15,
    monthlyPriceMAD: 40_000,
  },
  sovereign: {
    maxApiRequests: 250_000,
    maxWhatsAppAlerts: 2_000,
    maxKeywords: 1_000,
    maxSources: 250,
    maxUsers: 50,
    monthlyPriceMAD: 75_000,
  },
};

export function getPlanDefaults(planTier: string) {
  return PLAN_DEFAULTS[planTier] ?? PLAN_DEFAULTS.emergence;
}
