// ═══════════════════════════════════════════════════════════════
//  LLM CACHE — unified caching layer for GLM-4 calls
//
//  Two strategies, one contract:
//    • DbGLMCache  — Prisma `GLMAnalysis` table, 24h TTL, persistent
//      across processes (Vercel serverless, workers, cron). Used by
//      glm-orchestrator + full-audit-worker for per-prompt caching.
//    • MemoryCache — in-process Map with per-entry TTL. Used by
//      insight-engine for 15-min persona insight caching (cheaper
//      than a DB round-trip for a transient, user-scoped result).
//
//  Both strategies hash the cache key with SHA-256 so identical
//  inputs collapse to the same row/entry. All operations are
//  non-blocking: a cache failure is logged and the caller proceeds
//  as if it was a miss (the analysis pipeline never breaks).
//
//  Task ID: refactor-llm-cache (crawler-technique objective #8/#9)
// ═══════════════════════════════════════════════════════════════

import { createHash } from "crypto";
import { prisma } from "../db";
import { logError, logInfo } from "../logger";

// ─── Shared key hashing ────────────────────────────────────────────

/**
 * Deterministic SHA-256 of `{ promptType, inputPayload }`.
 * The same inputs always produce the same hash, so a cache row
 * written by one process is found by any other.
 */
export function hashKey(promptType: string, inputPayload: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify({ promptType, inputPayload }))
    .digest("hex");
}

// ─── DB cache (Prisma GLMAnalysis, 24h TTL) ────────────────────────

const DB_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export class DbGLMCache {
  /**
   * Look up a cached GLM result by (promptType, inputPayload).
   * Returns the stored `outputPayload` (as unknown — caller casts)
   * or null on miss / error.
   */
  async get(promptType: string, inputPayload: unknown): Promise<unknown | null> {
    try {
      const hash = hashKey(promptType, inputPayload);
      const cached = await prisma.gLMAnalysis.findFirst({
        where: {
          inputHash: hash,
          createdAt: { gt: new Date(Date.now() - DB_CACHE_TTL_MS) },
        },
      });
      return cached ? cached.outputPayload : null;
    } catch (err) {
      logError(
        "llm-cache.db",
        `get failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      return null;
    }
  }

  /**
   * Persist a GLM result. Non-blocking — a write failure is logged
   * and swallowed so the analysis pipeline continues.
   */
  async set(
    promptType: string,
    inputPayload: unknown,
    outputPayload: unknown,
    model: string,
    latencyMs: number,
  ): Promise<void> {
    try {
      const hash = hashKey(promptType, inputPayload);
      await prisma.gLMAnalysis.create({
        data: {
          inputHash: hash,
          model,
          promptType,
          inputPayload: inputPayload as never,
          outputPayload: outputPayload as never,
          latencyMs,
        },
      });
    } catch (err) {
      logError(
        "llm-cache.db",
        `set failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}

/** Default singleton — shared by glm-orchestrator + full-audit-worker. */
export const dbGLMCache = new DbGLMCache();

// ─── Backward-compatible exports ───────────────────────────────────
// full-audit-worker.ts imports getCachedGLMResult / cacheGLMResult
// directly. These thin wrappers delegate to the singleton so the
// existing imports keep working without a migration.

export async function getCachedGLMResult(
  promptType: string,
  inputPayload: unknown,
): Promise<unknown | null> {
  return dbGLMCache.get(promptType, inputPayload);
}

export async function cacheGLMResult(
  promptType: string,
  inputPayload: unknown,
  outputPayload: unknown,
  model: string,
  latencyMs: number,
): Promise<void> {
  return dbGLMCache.set(promptType, inputPayload, outputPayload, model, latencyMs);
}

// ─── In-memory cache (Map with per-entry TTL) ──────────────────────

export interface MemoryCacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class MemoryCache<T> {
  private store = new Map<string, MemoryCacheEntry<T>>();

  constructor(private defaultTtlMs: number = 15 * 60 * 1000) {}

  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key: string, value: T, ttlMs: number = this.defaultTtlMs): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  /**
   * Clear entries. If `keyPrefix` is given, only entries whose key
   * starts with the prefix are removed (used to invalidate a single
   * user's insights). Returns the number of entries removed.
   */
  clear(keyPrefix?: string): number {
    if (!keyPrefix) {
      const n = this.store.size;
      this.store.clear();
      return n;
    }
    let n = 0;
    for (const k of Array.from(this.store.keys())) {
      if (k.startsWith(keyPrefix)) {
        this.store.delete(k);
        n++;
      }
    }
    return n;
  }

  /** Number of live entries (expired ones are lazily evicted on read). */
  size(): number {
    return this.store.size;
  }
}

// ─── Generic cached-call wrapper ───────────────────────────────────

/**
 * Check cache → call `fn` on miss → persist result.
 *
 * Works with any cache that exposes `get`/`set` (DbGLMCache or a
 * hypothetical Redis adapter). The `step` label is used only for
 * logging (HIT/MISS diagnostics).
 */
export async function cachedCall<T>(
  cache: { get(k: string): Promise<T | null> | (T | null); set(k: string, v: T): Promise<void> | void },
  key: string,
  step: string,
  fn: () => Promise<T>,
  onMiss?: (result: T, latencyMs: number) => Promise<void> | void,
): Promise<T> {
  const cached = await cache.get(key);
  if (cached !== null && cached !== undefined) {
    logInfo("llm-cache", `HIT for ${step}`);
    return cached;
  }
  logInfo("llm-cache", `MISS for ${step}`);
  const start = Date.now();
  const result = await fn();
  const latencyMs = Date.now() - start;
  if (onMiss) await onMiss(result, latencyMs);
  else await cache.set(key, result);
  return result;
}
