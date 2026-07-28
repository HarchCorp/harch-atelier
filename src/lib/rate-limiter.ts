// ═══════════════════════════════════════════════════════════════
//  RATE LIMITER (REDIS) — HARCH ATELIER v4.1
//
//  Redis-backed fixed-window counter using INCR + EXPIRE. Shared
//  across every Vercel instance so the limit is enforced globally
//  per identifier, not per-process.
//
//  Usage:
//    const { allowed, remaining, resetAt } = await checkRateLimit(
//      `audit:${userId}`,
//      3,        // limit: 3 requests
//      86_400,   // windowSeconds: 24h
//    );
//    if (!allowed) return res.status(429).json({ error, remaining, resetAt });
//
//  NOTE: this is a FIXED window counter. The first request in each
//  window opens the window and sets the TTL; subsequent requests
//  in the same window just INCR. A small race exists between INCR
//  and EXPIRE on the very first request, but BullMQ/Upstash's
//  single-threaded Redis semantics make it negligible in practice.
//
//  File-name note: this is distinct from the existing in-memory
//  `rate-limit.ts` (Map-based, per-process). That file remains in
//  use for low-stakes public endpoints (contact, quote, PDF). This
//  Redis-backed limiter is reserved for authenticated, plan-gated
//  routes where the limit MUST be enforced globally.
// ═══════════════════════════════════════════════════════════════

import { redisConnection } from "./queue/connection";

export interface RateLimitResult {
  /** True if the caller is within the allowed quota. */
  allowed: boolean;
  /** Remaining requests in the current window (>= 0). */
  remaining: number;
  /** Epoch ms when the current window resets. */
  resetAt: number;
}

/**
 * Fixed-window rate limit check. Atomically increments a Redis
 * counter for the given identifier and returns whether the caller
 * is still within the allowed quota.
 *
 * The identifier should be namespaced by both the route and the
 * principal (e.g. `audit:user_abc123`). Bare IP identifiers are
 * permitted but should be paired with a tighter window since NAT
 * makes them coarse.
 *
 * @param identifier    Stable per-principal key (e.g. `audit:${userId}`)
 * @param limit         Max requests allowed in the window
 * @param windowSeconds Window size in seconds (e.g. 86_400 for 24h)
 */
export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const key = `ratelimit:${identifier}`;

  // INCR is atomic in Redis — even under concurrency, every caller
  // gets a distinct, monotonically increasing count.
  const current = await redisConnection.incr(key);

  // First request in the window opens it and sets the TTL. All
  // subsequent requests in the same window will see current > 1 and
  // skip the EXPIRE call — the original TTL is preserved.
  if (current === 1) {
    await redisConnection.expire(key, windowSeconds);
  }

  // TTL is queried fresh on every call so `resetAt` reflects the
  // actual window end (not a stale calculation). -1 (no expiry) and
  // -2 (key missing) are both treated as "no window" → reset now.
  const ttl = await redisConnection.ttl(key);
  const resetAt =
    ttl > 0 ? Date.now() + ttl * 1000 : Date.now() + windowSeconds * 1000;

  return {
    allowed: current <= limit,
    remaining: Math.max(0, limit - current),
    resetAt,
  };
}
