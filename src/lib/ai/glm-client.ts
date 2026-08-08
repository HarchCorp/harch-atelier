// ═══════════════════════════════════════════════════════════════
//  GLM CLIENT — PROJECT AEGIS REMEDIATION
//  Real GLM (Zhipu AI) API client replacing all Math.random() mocks.
//
//  Features:
//  - Token bucket rate limiter (10 tokens max, 2/sec refill)
//  - 24h response cache with TTL eviction
//  - Retry with exponential backoff (3x, 429-aware)
//  - 30s request timeout via AbortController
//  - Structured JSON output with markdown cleanup
//  - Health check + cache stats utilities
//
//  Endpoint: https://open.bigmodel.cn/api/paas/v4/chat/completions
//  Models:   glm-4-flash (free) / glm-4 (premium)
// ═══════════════════════════════════════════════════════════════

import { createHash } from "crypto";
import { logInfo, logError, logWarn } from "@/lib/logger";

// ─── TYPES ────────────────────────────────────────────────────────

export type GLMRole = "system" | "user" | "assistant";

export interface GLMMessage {
  role: GLMRole;
  content: string;
}

export interface GLMRequestOptions {
  model?: string;
  messages: GLMMessage[];
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  retryCount?: number;
}

export interface GLMChoice {
  index: number;
  message: GLMMessage;
  finish_reason: string;
}

export interface GLMUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface GLMResponse {
  id: string;
  model: string;
  choices: GLMChoice[];
  usage: GLMUsage;
}

// ─── CONFIGURATION ────────────────────────────────────────────────

const GLM_API_KEY = process.env.GLM_API_KEY || "";
const GLM_API_BASE_URL =
  process.env.GLM_API_BASE_URL || "https://open.bigmodel.cn/api/paas/v4";
const GLM_MODEL = process.env.GLM_MODEL || "glm-4-flash";
const GLM_MODEL_PREMIUM = process.env.GLM_MODEL_PREMIUM || "glm-4";
const GLM_MAX_TOKENS = Number(process.env.GLM_MAX_TOKENS || 4096);
const GLM_TEMPERATURE = Number(process.env.GLM_TEMPERATURE || 0.3);
const GLM_REQUEST_TIMEOUT = Number(process.env.GLM_REQUEST_TIMEOUT || 30000);

const CHAT_COMPLETIONS_PATH = "/chat/completions";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// ─── RATE LIMITER (Token Bucket) ──────────────────────────────────

export class GLMRateLimiter {
  private maxTokens: number;
  private refillRatePerSec: number;
  private tokens: number;
  private lastRefillTime: number;
  private waitQueue: Array<{ resolve: () => void }> = [];

  constructor(maxTokens = 10, refillRatePerSec = 2) {
    this.maxTokens = maxTokens;
    this.refillRatePerSec = refillRatePerSec;
    this.tokens = maxTokens;
    this.lastRefillTime = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsedMs = now - this.lastRefillTime;
    const refilled = (elapsedMs / 1000) * this.refillRatePerSec;
    if (refilled > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + refilled);
      this.lastRefillTime = now;
    }
  }

  private pumpQueue(): void {
    while (this.waitQueue.length > 0) {
      this.refill();
      if (this.tokens >= 1) {
        this.tokens -= 1;
        const next = this.waitQueue.shift();
        if (next) next.resolve();
      } else {
        break;
      }
    }
  }

  async acquire(): Promise<void> {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }
    await new Promise<void>((resolve) => {
      this.waitQueue.push({ resolve });
      const waitMs = Math.max(100, (1 / this.refillRatePerSec) * 1000);
      setTimeout(() => this.pumpQueue(), waitMs);
    });
  }

  getStats(): { tokens: number; maxTokens: number; refillRatePerSec: number; pending: number } {
    this.refill();
    return {
      tokens: this.tokens,
      maxTokens: this.maxTokens,
      refillRatePerSec: this.refillRatePerSec,
      pending: this.waitQueue.length,
    };
  }
}

const rateLimiter = new GLMRateLimiter(10, 2);

// ─── RESPONSE CACHE ───────────────────────────────────────────────

interface CacheEntry {
  value: GLMResponse;
  expiresAt: number;
}

const responseCache = new Map<string, CacheEntry>();

export function clearGLMCache(): { cleared: number } {
  const count = responseCache.size;
  responseCache.clear();
  logInfo("glm-client", `Cache cleared: ${count} entries removed`);
  return { cleared: count };
}

export function getGLMCacheStats(): {
  size: number;
  maxBytes: number;
  oldestEntryAgeMs: number;
  rateLimiter: { tokens: number; maxTokens: number; refillRatePerSec: number; pending: number };
} {
  const now = Date.now();
  let oldestAge = 0;
  for (const entry of responseCache.values()) {
    const age = now - (entry.expiresAt - CACHE_TTL_MS);
    if (age > oldestAge) oldestAge = age;
  }
  return {
    size: responseCache.size,
    maxBytes: 0,
    oldestEntryAgeMs: oldestAge,
    rateLimiter: rateLimiter.getStats(),
  };
}

function evictExpired(): void {
  const now = Date.now();
  let evicted = 0;
  for (const [key, entry] of responseCache.entries()) {
    if (entry.expiresAt <= now) {
      responseCache.delete(key);
      evicted++;
    }
  }
  if (evicted > 0) {
    logInfo("glm-client", `Evicted ${evicted} expired cache entries`);
  }
}

// ─── CACHE KEY ────────────────────────────────────────────────────

export function generateCacheKey(options: GLMRequestOptions): string {
  const keyPayload = {
    model: options.model || GLM_MODEL,
    messages: options.messages,
    temperature: options.temperature ?? GLM_TEMPERATURE,
    maxTokens: options.maxTokens ?? GLM_MAX_TOKENS,
  };
  const serialized = JSON.stringify(keyPayload);
  return createHash("sha256").update(serialized).digest("hex");
}

// ─── CORE API CALL ────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function callGLM(
  options: GLMRequestOptions
): Promise<GLMResponse> {
  const model = options.model || GLM_MODEL;
  const temperature = options.temperature ?? GLM_TEMPERATURE;
  const maxTokens = options.maxTokens ?? GLM_MAX_TOKENS;
  const timeout = options.timeout ?? GLM_REQUEST_TIMEOUT;
  const maxRetries = options.retryCount ?? 3;

  // ─── Cache lookup ──────────────────────────────────────────
  evictExpired();
  const cacheKey = generateCacheKey(options);
  const cached = responseCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    logInfo("glm-client", `Cache HIT (key=${cacheKey.slice(0, 12)}…)`);
    return cached.value;
  }

  // ─── Validate API key ──────────────────────────────────────
  if (!GLM_API_KEY) {
    throw new Error(
      "GLM_API_KEY is not configured. Set the environment variable to enable real GLM API calls."
    );
  }

  const url = `${GLM_API_BASE_URL}${CHAT_COMPLETIONS_PATH}`;
  const body = JSON.stringify({
    model,
    messages: options.messages,
    temperature,
    max_tokens: maxTokens,
  });

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    // ─── Rate limit ────────────────────────────────────────
    await rateLimiter.acquire();

    // ─── Build AbortController for timeout ──────────────────
    const controller = new AbortController();
    const timeoutTimer = setTimeout(() => controller.abort(), timeout);

    try {
      logInfo(
        "glm-client",
        `→ POST ${url} (model=${model}, attempt=${attempt}/${maxRetries})`,
      );
      const startTime = Date.now();

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GLM_API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body,
        signal: controller.signal,
      });

      clearTimeout(timeoutTimer);
      const latencyMs = Date.now() - startTime;

      // ─── 429: rate limited by upstream → backoff & retry ───
      if (res.status === 429) {
        const retryAfter = Number(res.headers.get("retry-after")) || 0;
        const backoffMs = retryAfter > 0 ? retryAfter * 1000 : Math.pow(2, attempt) * 1000;
        logWarn("glm-client", `429 rate limited — backing off ${backoffMs}ms (attempt ${attempt})`);
        lastError = new Error(`GLM API rate limited (429)`);
        await sleep(backoffMs);
        continue;
      }

      // ─── 5xx: retry with exponential backoff ───────────────
      if (res.status >= 500) {
        const backoffMs = Math.pow(2, attempt) * 1000;
        logWarn("glm-client", `${res.status} server error — retrying in ${backoffMs}ms (attempt ${attempt})`);
        lastError = new Error(`GLM API server error (${res.status})`);
        await sleep(backoffMs);
        continue;
      }

      // ─── Other 4xx: don't retry ────────────────────────────
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(
          `GLM API error (${res.status}): ${errText.slice(0, 500)}`
        );
      }

      const data = (await res.json()) as GLMResponse;

      if (!data.choices || data.choices.length === 0) {
        throw new Error("GLM API returned no choices");
      }

      logInfo("glm-client", `← ${res.status} OK in ${latencyMs}ms (tokens: ${data.usage?.total_tokens ?? "n/a"})`);

      // ─── Cache the successful response ─────────────────────
      responseCache.set(cacheKey, {
        value: data,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });

      return data;
    } catch (err) {
      clearTimeout(timeoutTimer);

      if (err instanceof Error && err.name === "AbortError") {
        logWarn("glm-client", `Request timeout after ${timeout}ms (attempt ${attempt})`);
        lastError = new Error(`GLM API request timeout after ${timeout}ms`);
        if (attempt < maxRetries) {
          await sleep(Math.pow(2, attempt) * 1000);
          continue;
        }
      }

      // Network / fetch errors → retry
      if (err instanceof Error) {
        lastError = err;
        logWarn("glm-client", `Fetch error: ${err.message} (attempt ${attempt}/${maxRetries})`);
        if (attempt < maxRetries) {
          await sleep(Math.pow(2, attempt) * 500);
          continue;
        }
      }

      // Non-retriable errors → throw immediately
      throw err;
    }
  }

  throw lastError || new Error("GLM API call failed after all retries");
}

// ─── CONVENIENCE: SINGLE-TURN PROMPT ───────────────────────────────

export async function promptGLM(
  prompt: string,
  systemPrompt?: string,
  options?: Partial<GLMRequestOptions>
): Promise<string> {
  const messages: GLMMessage[] = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: prompt });

  const response = await callGLM({
    ...options,
    messages,
  });

  return response.choices[0].message.content || "";
}

// ─── STRUCTURED JSON OUTPUT ────────────────────────────────────────

function cleanJSONMarkdown(raw: string): string {
  let cleaned = raw.trim();

  // Strip leading/trailing markdown code fences ```json ... ``` or ``` ... ```
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "");
    cleaned = cleaned.replace(/\n?```\s*$/i, "");
  }

  // Extract the outermost JSON object or array if there's surrounding prose
  const objectMatch = cleaned.match(/\{[\s\S]*\}/);
  const arrayMatch = cleaned.match(/\[[\s\S]*\]/);

  if (objectMatch && arrayMatch) {
    // Prefer whichever appears first
    cleaned =
      objectMatch.index! < arrayMatch.index!
        ? objectMatch[0]
        : arrayMatch[0];
  } else if (objectMatch) {
    cleaned = objectMatch[0];
  } else if (arrayMatch) {
    cleaned = arrayMatch[0];
  }

  return cleaned.trim();
}

export async function promptGLMJSON<T = unknown>(
  prompt: string,
  systemPrompt?: string,
  options?: Partial<GLMRequestOptions>
): Promise<T> {
  const enforcedSystem = [
    systemPrompt || "",
    "",
    "CRITICAL: Respond with a single valid JSON object only. No markdown fences, no commentary, no trailing text.",
  ]
    .filter(Boolean)
    .join("\n");

  const raw = await promptGLM(prompt, enforcedSystem, options);
  const cleaned = cleanJSONMarkdown(raw);

  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    logError("glm-client", `JSON parse failed. Raw output: ${cleaned.slice(0, 1000)}`);
    throw new Error(
      `GLM JSON parse failed: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

// ─── MODEL SELECTOR HELPER ─────────────────────────────────────────

export function selectModel(usePremium = false): string {
  return usePremium ? GLM_MODEL_PREMIUM : GLM_MODEL;
}

// ─── HEALTH CHECK ──────────────────────────────────────────────────

export interface GLMHealthStatus {
  healthy: boolean;
  latencyMs: number | null;
  model: string;
  apiKeyConfigured: boolean;
  cacheSize: number;
  rateLimiter: { tokens: number; maxTokens: number; pending: number };
  error?: string;
}

export async function checkGLMHealth(): Promise<GLMHealthStatus> {
  const cacheStats = getGLMCacheStats();
  const apiKeyConfigured = Boolean(GLM_API_KEY);

  if (!apiKeyConfigured) {
    return {
      healthy: false,
      latencyMs: null,
      model: GLM_MODEL,
      apiKeyConfigured: false,
      cacheSize: cacheStats.size,
      rateLimiter: cacheStats.rateLimiter,
      error: "GLM_API_KEY is not configured",
    };
  }

  const startTime = Date.now();
  try {
    await callGLM({
      model: GLM_MODEL,
      messages: [{ role: "user", content: "ping" }],
      maxTokens: 8,
      retryCount: 1,
      timeout: 10000,
    });
    const latencyMs = Date.now() - startTime;
    return {
      healthy: true,
      latencyMs,
      model: GLM_MODEL,
      apiKeyConfigured: true,
      cacheSize: cacheStats.size,
      rateLimiter: cacheStats.rateLimiter,
    };
  } catch (err) {
    return {
      healthy: false,
      latencyMs: null,
      model: GLM_MODEL,
      apiKeyConfigured: true,
      cacheSize: cacheStats.size,
      rateLimiter: cacheStats.rateLimiter,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ─── EXPORT CONFIG (for debugging / introspection) ─────────────────

export const glmConfig = {
  apiBaseUrl: GLM_API_BASE_URL,
  model: GLM_MODEL,
  modelPremium: GLM_MODEL_PREMIUM,
  maxTokens: GLM_MAX_TOKENS,
  temperature: GLM_TEMPERATURE,
  requestTimeout: GLM_REQUEST_TIMEOUT,
  cacheTtlMs: CACHE_TTL_MS,
  apiKeyConfigured: Boolean(GLM_API_KEY),
};
