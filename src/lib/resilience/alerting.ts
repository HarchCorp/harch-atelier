// ═══════════════════════════════════════════════════════════════
//  RESILIENCE ENGINE — ALERTING & INFRA MODULE
//  Handles HarchAtelier Stress-Cases 006, 009, 042
//
//  Pure functions + in-memory state. Covers: recursive query-depth
//  guard (006), sliding-window rate limiter (009), alert-storm
//  collapse into a single macro alert (042).
// ═══════════════════════════════════════════════════════════════

// ─── Case 006: Recursive query depth guard ──────────────────────

export interface QueryDepthResult {
  depth: number;
  allowed: boolean;
  limit: number;
  rejectionReason?: string;
}

export function measureQueryDepth(query: string): number {
  let depth = 0;
  let max = 0;
  for (const ch of query) {
    if (ch === "{") {
      depth++;
      if (depth > max) max = depth;
    } else if (ch === "(") {
      depth++;
      if (depth > max) max = depth;
    } else if (ch === "}" || ch === ")") {
      depth = Math.max(0, depth - 1);
    }
  }
  return max;
}

export function enforceQueryDepth(query: string, limit = 10): QueryDepthResult {
  const depth = measureQueryDepth(query);
  if (depth > limit) {
    return {
      depth,
      allowed: false,
      limit,
      rejectionReason: `Query nesting depth ${depth} exceeds limit ${limit}. Possible recursive DoS — rejected.`,
    };
  }
  return { depth, allowed: true, limit };
}

// ─── Case 009: Sliding-window rate limiter ──────────────────────

interface RateBucket {
  timestamps: number[];
}

export class RateLimiter {
  private buckets = new Map<string, RateBucket>();
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 60_000
  ) {}

  check(key: string, now: number = Date.now()): { allowed: boolean; remaining: number; retryAfterMs: number; attempts: number } {
    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = { timestamps: [] };
      this.buckets.set(key, bucket);
    }
    const cutoff = now - this.windowMs;
    bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);

    if (bucket.timestamps.length >= this.maxAttempts) {
      const oldest = bucket.timestamps[0];
      const retryAfterMs = oldest + this.windowMs - now;
      return {
        allowed: false,
        remaining: 0,
        retryAfterMs: Math.max(0, retryAfterMs),
        attempts: bucket.timestamps.length,
      };
    }
    bucket.timestamps.push(now);
    return {
      allowed: true,
      remaining: this.maxAttempts - bucket.timestamps.length,
      retryAfterMs: 0,
      attempts: bucket.timestamps.length,
    };
  }

  reset(key: string): void {
    this.buckets.delete(key);
  }

  // For demos / testing — inject a synthetic clock window
  simulate(key: string, attempts: number, intervalMs: number = 1000, startAt: number = Date.now()): Array<{ attempt: number; allowed: boolean; remaining: number; retryAfterMs: number }> {
    const results: Array<{ attempt: number; allowed: boolean; remaining: number; retryAfterMs: number }> = [];
    for (let i = 0; i < attempts; i++) {
      const r = this.check(key, startAt + i * intervalMs);
      results.push({ attempt: i + 1, allowed: r.allowed, remaining: r.remaining, retryAfterMs: r.retryAfterMs });
    }
    return results;
  }
}

// ─── Case 042: Alert storm collapse ─────────────────────────────

export interface RawMention {
  entityId: string;
  sentiment: "negative" | "positive" | "neutral";
  severity: number; // 0..1
  at: number; // epoch ms
  source: string;
  headline: string;
}

export interface MacroAlert {
  alertId: string;
  entityId: string;
  type: "storm" | "single" | "spike";
  mentionCount: number;
  windowStart: number;
  windowEnd: number;
  peakSeverity: number;
  firstHeadline: string;
  representativeHeadline: string;
  uniqueSources: string[];
  collapsed: boolean;
  notificationCount: number; // always 1 for a storm
}

export function collapseAlertStorm(
  mentions: RawMention[],
  opts: { windowMs?: number; stormThreshold?: number } = {}
): MacroAlert[] {
  const windowMs = opts.windowMs ?? 5 * 60 * 1000; // 5 min
  const stormThreshold = opts.stormThreshold ?? 50;

  if (mentions.length === 0) return [];

  // Sort by time
  const sorted = [...mentions].sort((a, b) => a.at - b.at);

  const alerts: MacroAlert[] = [];
  let i = 0;
  while (i < sorted.length) {
    const windowStart = sorted[i].at;
    const windowEnd = windowStart + windowMs;
    let j = i;
    while (j < sorted.length && sorted[j].at <= windowEnd) j++;
    const window = sorted.slice(i, j);

    if (window.length >= stormThreshold) {
      // Collapse into ONE macro alert — never send N notifications
      const peakSeverity = window.reduce((max, m) => Math.max(max, m.severity), 0);
      const sources = Array.from(new Set(window.map((m) => m.source)));
      alerts.push({
        alertId: `storm-${windowStart}-${window[0].entityId}`,
        entityId: window[0].entityId,
        type: "storm",
        mentionCount: window.length,
        windowStart,
        windowEnd: window[window.length - 1].at,
        peakSeverity,
        firstHeadline: window[0].headline,
        representativeHeadline: window[Math.floor(window.length / 2)].headline,
        uniqueSources: sources,
        collapsed: true,
        notificationCount: 1, // the whole point — one notification, not N
      });
    } else if (window.length === 1 && window[0].severity > 0.7) {
      // Single high-severity mention — own alert
      alerts.push({
        alertId: `single-${windowStart}-${window[0].entityId}`,
        entityId: window[0].entityId,
        type: "single",
        mentionCount: 1,
        windowStart,
        windowEnd: windowStart,
        peakSeverity: window[0].severity,
        firstHeadline: window[0].headline,
        representativeHeadline: window[0].headline,
        uniqueSources: [window[0].source],
        collapsed: false,
        notificationCount: 1,
      });
    }
    // sub-threshold noise: no alert at all (debounce)
    i = j;
  }

  return alerts;
}

// ─── Bonus: Case 048 — escalation timer (simplified) ─────────────

export interface EscalationCheck {
  alertCreatedAt: number;
  acknowledgedAt: number | null;
  now: number;
  level1DeadlineMs: number;
  level2DeadlineMs: number;
}

export interface EscalationState {
  currentLevel: 1 | 2 | 3;
  reason: string;
  overdueByMs: number;
}

export function checkEscalation(opts: EscalationCheck): EscalationState {
  const { alertCreatedAt, acknowledgedAt, now, level1DeadlineMs, level2DeadlineMs } = opts;
  if (acknowledgedAt !== null) {
    return { currentLevel: 1, reason: "Acknowledged within SLA — no escalation.", overdueByMs: 0 };
  }
  const elapsed = now - alertCreatedAt;
  if (elapsed > level2DeadlineMs) {
    return {
      currentLevel: 3,
      reason: `Level 2 SLA breached (${Math.round(elapsed / 60000)}min elapsed) — escalated to Comex.`,
      overdueByMs: elapsed - level2DeadlineMs,
    };
  }
  if (elapsed > level1DeadlineMs) {
    return {
      currentLevel: 2,
      reason: `Level 1 SLA breached (${Math.round(elapsed / 60000)}min elapsed) — escalated to management.`,
      overdueByMs: elapsed - level1DeadlineMs,
    };
  }
  return { currentLevel: 1, reason: "Within Level 1 SLA — pending analyst acknowledgement.", overdueByMs: 0 };
}
