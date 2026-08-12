// ═══════════════════════════════════════════════════════════════
//  SECURITY — IN-MEMORY RATE LIMITER (Task: SECURITY-RATE-LIMIT)
//
//  Simple fixed-window counter backed by a per-process Map.
//  Acceptable for Hobby plan / single-instance deploys: the counter
//  resets on serverless cold start. For multi-instance needs, prefer
//  the Redis-backed `src/lib/rate-limiter.ts`.
//
//  Two operations:
//    • checkRateLimit(key, max, windowMs) — atomically check + bump.
//        Returns { allowed, remaining, resetAt }.
//        - If the key is new or its window has expired, opens a new
//          window with count = 1.
//        - If the key exists and count < max, increments count and
//          returns allowed=true.
//        - If the key exists and count >= max, returns allowed=false
//          WITHOUT incrementing (the bucket is full).
//    • resetRateLimit(key) — clears the counter (used to forgive a
//      successful login so the next attempt starts fresh).
//
//  Cleanup: expired entries are swept on every checkRateLimit call
//  (amortized — only iterates when the map size exceeds 1024, to
//  avoid O(n) on every hot-path request). This bounds memory growth
//  without requiring a setInterval (which doesn't play well with
//  serverless).
//
//  NOTE: This module is distinct from the legacy in-memory
//  `src/lib/rate-limit.ts` (which uses createRateLimiter factories
//  for low-stakes public endpoints) and the Redis-backed
//  `src/lib/rate-limiter.ts` (for globally-enforced plan-gated
//  routes). This file is the security-focused helper used by the
//  auth credentials provider and the access-request route.
// ═══════════════════════════════════════════════════════════════

interface RateLimitEntry {
  /** Number of requests (or failed attempts) in the current window. */
  count: number;
  /** Epoch ms when the window resets. */
  resetAt: number;
}

export interface RateLimitResult {
  /** True if the caller is within the allowed quota. */
  allowed: boolean;
  /** Remaining slots in the current window (>= 0). */
  remaining: number;
  /** Epoch ms when the current window resets (for Retry-After header). */
  resetAt: number;
}

// Per-process store. Keys are namespaced by the caller (e.g.
// `login:${ip}`, `access-request:${ip}`). The Map is module-scoped
// so all callers on the same instance share state.
const store = new Map<string, RateLimitEntry>();

// Sweep threshold — once the map grows beyond this size, we iterate
// and delete expired entries. Keeps memory bounded without an
// active timer. 1024 is generous for a single-instance Hobby plan.
const SWEEP_THRESHOLD = 1024;

function sweepExpired(now: number): void {
  for (const [k, v] of store) {
    if (now >= v.resetAt) {
      store.delete(k);
    }
  }
}

/**
 * Atomically check + bump the rate limit counter for `key`.
 *
 * @param key      Stable per-principal key (e.g. `login:${ip}`).
 * @param max      Max requests/attempts allowed in the window.
 * @param windowMs Window size in milliseconds.
 * @returns        { allowed, remaining, resetAt }
 */
export function checkRateLimit(
  key: string,
  max: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();

  // Amortized GC — only sweep when the store is getting large.
  if (store.size > SWEEP_THRESHOLD) {
    sweepExpired(now);
  }

  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    // Open a new window with count = 1.
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return {
      allowed: 1 <= max,
      remaining: Math.max(0, max - 1),
      resetAt,
    };
  }

  // Existing, non-expired window.
  if (entry.count >= max) {
    // Bucket full — do NOT increment (avoids unbounded growth).
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: Math.max(0, max - entry.count),
    resetAt: entry.resetAt,
  };
}

/**
 * Clear the rate limit counter for `key`.
 *
 * Used by the auth credentials provider to forgive a successful
 * login so the next sign-in attempt starts from zero.
 */
export function resetRateLimit(key: string): void {
  store.delete(key);
}

/**
 * Extract the client IP from a Request's headers.
 *
 * Honours `x-forwarded-for` (preferred — first hop is the client)
 * then `x-real-ip` (set by some reverse proxies). Returns the
 * literal `"unknown"` if neither is present (e.g. localhost dev)
 * so the caller can still key a rate-limit bucket — every IP-less
 * request shares the same bucket, which is the safest fallback.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp && realIp.trim()) return realIp.trim();
  return "unknown";
}
