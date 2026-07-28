/**
 * Simple IP-based rate limiter using an in-memory Map with TTL cleanup.
 *
 * Usage:
 *   const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 5 });
 *   const { allowed, remaining } = limiter.check(ip);
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimiterOptions {
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum requests per window */
  maxRequests: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function createRateLimiter(options: RateLimiterOptions) {
  const { windowMs, maxRequests } = options;
  const store = new Map<string, RateLimitEntry>();

  // Cleanup expired entries every 60 seconds
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now >= entry.resetAt) {
        store.delete(key);
      }
    }
  }, 60_000);

  // Don't prevent process exit
  if (cleanup.unref) {
    cleanup.unref();
  }

  function check(ip: string): RateLimitResult {
    const now = Date.now();
    const entry = store.get(ip);

    if (!entry || now >= entry.resetAt) {
      // New window
      const resetAt = now + windowMs;
      store.set(ip, { count: 1, resetAt });
      return { allowed: true, remaining: maxRequests - 1, resetAt };
    }

    if (entry.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }

    entry.count += 1;
    return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
  }

  return { check };
}

/** Pre-configured rate limiters */
export const contactLimiter = createRateLimiter({ windowMs: 60_000, maxRequests: 5 });
export const quoteLimiter = createRateLimiter({ windowMs: 60_000, maxRequests: 5 });
export const pdfLimiter = createRateLimiter({ windowMs: 60_000, maxRequests: 10 });

/** Extract client IP from request headers */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return 'unknown';
}
