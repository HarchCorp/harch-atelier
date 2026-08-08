// ═══════════════════════════════════════════════════════════════
//  QUEUE CONNECTION — AEGIS v4.0 (BullMQ + Upstash Redis)
//
//  Single shared ioredis instance for every Queue, Worker and
//  QueueEvents consumer in the AEGIS pipeline.
//
//  CRITICAL — maxRetriesPerRequest: null
//  BullMQ's polling loop issues blocking-style Redis commands
//  (BRPOPLPUSH / BZPOPMIN). Upstash's REST gateway (and any
//  Redis that respects `maxRetriesPerRequest`) will silently
//  reject those commands once the retry budget is exhausted,
//  which makes workers hang indefinitely. Disabling the per-
//  request retry cap is the BullMQ-mandated workaround.
// ═══════════════════════════════════════════════════════════════

import IORedis, { type Redis } from "ioredis";
import { logInfo, logWarn, logError } from "@/lib/logger";

const redisUrl = process.env.REDIS_URL || "";

if (!redisUrl) {
  // We only warn — the workers won't run on Vercel (they need a VPS),
  // but the module must still load so Next.js route handlers can
  // import the queue index without crashing on cold boots.
  logWarn("lib.queue.connection", "[queue/connection] REDIS_URL is not set — BullMQ queues will be inert until a worker process boots with a valid URL.");
}

/**
 * Shared Redis connection. Reused by every Queue / Worker / QueueEvents
 * instance in src/lib/queue. We MUST NOT instantiate more than one
 * ioredis connection per process — BullMQ maintains long-lived
 * subscriptions on the connection and duplicating them wastes file
 * descriptors and risks event-loop contention.
 */
export const redisConnection: Redis = new IORedis(redisUrl, {
  // CRITICAL for BullMQ + Upstash: disables the per-command retry cap
  // so blocking commands (BRPOPLPUSH / BZPOPMIN) used internally by
  // BullMQ never get auto-rejected after `maxRetriesPerRequest` cycles.
  maxRetriesPerRequest: null,
  // Eagerly verify the connection works on boot so we surface auth /
  // network issues before the first job is enqueued.
  enableReadyCheck: true,
  // Linear backoff capped at 5s — keeps reconnect attempts gentle on
  // Upstash's REST gateway while still recovering quickly from blips.
  retryStrategy: (times: number) => Math.min(times * 1000, 5000),
  // Upstash tolerates keepalive; default ioredis settings are fine.
  lazyConnect: false,
});

redisConnection.on("error", (err: Error) => {
  // Log + swallow — BullMQ workers tolerate transient Redis errors and
  // will reconnect automatically. Crashing the process here would take
  // down the whole job runner for a single blip.
  logError("lib.queue.connection", `[queue/connection] Redis error: ${err.message}`);
});

redisConnection.on("connect", () => {
  logInfo("lib.queue.connection", "[queue/connection] Connected to Redis");
});

redisConnection.on("ready", () => {
  logInfo("lib.queue.connection", "[queue/connection] Redis ready (BullMQ commands enabled)");
});

/**
 * Test helper — never used in production hot paths. Resolves to true
 * if a PING/PONG round-trip succeeds within 1s.
 */
export async function pingRedis(): Promise<boolean> {
  try {
    const res = await Promise.race([
      redisConnection.ping(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("ping timeout")), 1000),
      ),
    ]);
    return res === "PONG";
  } catch {
    return false;
  }
}
