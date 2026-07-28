// ═══════════════════════════════════════════════════════════════
//  QUEUE INDEX — AEGIS v4.0
//
//  Four named BullMQ queues that compose the full reputation audit
//  pipeline. Each queue has a matching Worker in ./workers/. The
//  full-audit-queue orchestrates the other three by enqueueing
//  child jobs and awaiting their completion via QueueEvents.
//
//  Queues:
//   1. scraper-queue       — RSS / Google News ingestion (per company)
//   2. nlp-queue           — GLM summarization / sentiment / NER / topics
//   3. ai-visibility-queue — LLM-as-judge visibility probes
//   4. full-audit-queue    — Top-level coordinator (scraper → nlp → ai-visibility)
//
//  All queues share the same `redisConnection` (see ./connection.ts).
//  This is mandatory — BullMQ maintains internal state per connection
//  and using more than one connection per process causes subscription
//  leaks and missed events.
// ═══════════════════════════════════════════════════════════════

import { Queue } from "bullmq";
import { redisConnection } from "./connection";

// ─── QUEUE NAME CONSTANTS ────────────────────────────────────────
// Exported so workers and route handlers can reference the same name
// without typos. BullMQ keys (bull:<name>:*) are derived from this.

export const QUEUE_NAMES = {
  scraper: "scraper-queue",
  nlp: "nlp-queue",
  aiVisibility: "ai-visibility-queue",
  fullAudit: "full-audit-queue",
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

// ─── QUEUE INSTANCES ─────────────────────────────────────────────
// Each Queue is a producer-side handle. Workers are instantiated
// separately in ./workers/* and bind to the same name + connection.

/**
 * scraper-queue — RSS / Google News ingestion.
 *
 * Job payload: { companyName: string; companySlug: string }
 * Returns:     { articlesFound: number; articlesNew: number }
 */
export const scraperQueue = new Queue(QUEUE_NAMES.scraper, {
  connection: redisConnection,
  defaultJobOptions: {
    // Scraping is idempotent (we upsert by urlHash) so safe to retry
    // automatically on transient Redis / network failures.
    attempts: 3,
    backoff: { type: "exponential", delay: 5_000 },
    removeOnComplete: { count: 500, age: 7 * 24 * 60 * 60 },
    removeOnFail: { count: 200, age: 30 * 24 * 60 * 60 },
  },
});

/**
 * nlp-queue — GLM analysis per article (summarize / sentiment / NER /
 * topics) + per-company aggregate risk assessment.
 *
 * Job payload: { companySlug: string; articleIds?: string[] }
 * Returns:     { articlesProcessed: number; errors: Array<{ articleId: string; error: string }> }
 */
export const nlpQueue = new Queue(QUEUE_NAMES.nlp, {
  connection: redisConnection,
  defaultJobOptions: {
    // GLM calls are cached by input hash — retrying a failed article
    // will hit the cache for any partial work already done.
    attempts: 2,
    backoff: { type: "exponential", delay: 15_000 },
    removeOnComplete: { count: 500, age: 7 * 24 * 60 * 60 },
    removeOnFail: { count: 200, age: 30 * 24 * 60 * 60 },
  },
});

/**
 * ai-visibility-queue — LLM-as-judge visibility probes (single GLM
 * call asking whether the model knows the company + how it frames it).
 *
 * Job payload: { companyName: string; companySlug: string; sector?: string }
 * Returns:     { known: boolean; estimatedPosition: number; framing: string; ... }
 */
export const aiVisibilityQueue = new Queue(QUEUE_NAMES.aiVisibility, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: "exponential", delay: 10_000 },
    removeOnComplete: { count: 500, age: 7 * 24 * 60 * 60 },
    removeOnFail: { count: 200, age: 30 * 24 * 60 * 60 },
  },
});

/**
 * full-audit-queue — Top-level coordinator. Enqueued by the
 * /api/atelier/audit POST handler. Runs scraper → nlp → ai-visibility
 * as child jobs and updates the Job table's status / progress between
 * each step.
 *
 * Job payload: { companySlug: string; companyName: string; jobId: string }
 * Returns:     { articlesFound: number; articlesProcessed: number; aiVisibility: unknown }
 */
export const fullAuditQueue = new Queue(QUEUE_NAMES.fullAudit, {
  connection: redisConnection,
  defaultJobOptions: {
    // The coordinator itself never retries — if it fails, the whole
    // audit is marked failed and the user re-triggers via the API.
    attempts: 1,
    removeOnComplete: { count: 200, age: 30 * 24 * 60 * 60 },
    removeOnFail: { count: 200, age: 90 * 24 * 60 * 60 },
  },
});

// ─── CONVENIENCE EXPORTS ─────────────────────────────────────────

export const queues = {
  [QUEUE_NAMES.scraper]: scraperQueue,
  [QUEUE_NAMES.nlp]: nlpQueue,
  [QUEUE_NAMES.aiVisibility]: aiVisibilityQueue,
  [QUEUE_NAMES.fullAudit]: fullAuditQueue,
} as const;

/**
 * closeAllQueues — graceful shutdown helper for tests / CLI. Resolves
 * once every queue's connection has been closed.
 */
export async function closeAllQueues(): Promise<void> {
  await Promise.allSettled([
    scraperQueue.close(),
    nlpQueue.close(),
    aiVisibilityQueue.close(),
    fullAuditQueue.close(),
  ]);
}
