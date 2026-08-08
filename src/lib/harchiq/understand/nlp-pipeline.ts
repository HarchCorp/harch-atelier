// ═══════════════════════════════════════════════════════════════
//  PROJECT AEGIS v3.0 — HarchIQ UNDERSTAND STAGE
//  NLP pipeline — turns raw ArticleEntity inputs into enriched
//  ProcessedArticle outputs by routing each article through four
//  GLM-backed analysis steps:
//
//      1. summarizeArticle     → SummarizationResult
//      2. analyzeSentiment     → SentimentResult
//      3. extractEntities      → NERResult
//      4. classifyTopics       → TopicResult
//
//  Design principles:
//  • Each step is independent — a failure in one step does NOT abort
//    the others. Errors are captured per-article in `errors[]`.
//  • Batch processing honours GLM's 20-article per-request ceiling
//    and applies a polite inter-article delay for rate-limit safety.
//  • Every step logs its progress so operators can monitor pipeline
//    health from the dev server log.
//  • All GLM calls share the orchestrator's cache + token-bucket rate
//    limiter (see ai/glm-client.ts) — no extra throttling needed.
//
//  Task ID: AEGIS-V3-ENGINE
//  Module:  harchiq/understand/nlp-pipeline
// ═══════════════════════════════════════════════════════════════

import {
  summarizeArticle,
  analyzeSentiment,
  extractEntities,
  classifyTopics,
  type SummarizationResult,
  type SentimentResult,
  type NERResult,
  type TopicResult,
  type ArticleInput,
} from "../../ai/glm-orchestrator";
import type { ArticleEntity } from "../types";
import { logInfo, logError } from "@/lib/logger";

// ─── RESULT INTERFACES ────────────────────────────────────────────

/**
 * ProcessedArticle — the UNDERSTAND stage's primary output. Wraps the
 * original ArticleEntity together with the four GLM-derived analyses
 * and a per-article error log.
 *
 * Downstream stages (CONNECT, PREDICT, SYNTHESIZE) consume this shape.
 */
export interface ProcessedArticle {
  /** The original article, unchanged. */
  article: ArticleEntity;
  /** GLM summary — key points, figures, language detection. */
  summary: SummarizationResult;
  /** GLM sentiment — polarity, score, confidence, key phrases. */
  sentiment: SentimentResult;
  /** GLM NER — extracted entities (PERSON, ORG, LOCATION, …). */
  entities: NERResult;
  /** GLM topic classification — primary topic + scores. */
  topics: TopicResult;
  /** ISO-8601 processing timestamp. */
  processedAt: string;
  /** Per-step error messages (empty array on full success). */
  errors: string[];
}

/**
 * NLPBatchOptions — tunable knobs for `processArticles`. All fields
 * optional with sensible defaults.
 */
export interface NLPBatchOptions {
  /** Use the premium GLM model (glm-4) instead of glm-4-flash. */
  usePremiumModel?: boolean;
  /** Hard cap on articles processed per batch (default 20 = GLM limit). */
  maxArticles?: number;
  /** Polite delay between articles in ms (default 500). */
  rateLimitMs?: number;
  /** Log a progress line every N articles (default 5). */
  logEveryN?: number;
}

/**
 * NLPBatchResult — processed articles + aggregate stats. Returned by
 * callers that want batch-level metrics alongside the per-article
 * results. Use `summarizeBatch` to wrap a `ProcessedArticle[]`.
 */
export interface NLPBatchResult {
  /** All processed articles (including partial failures). */
  processed: ProcessedArticle[];
  /** Aggregate batch statistics. */
  stats: {
    /** Total articles attempted. */
    total: number;
    /** Articles with at least one successful step. */
    succeeded: number;
    /** Articles where every step failed. */
    failed: number;
    /** Wall-clock duration in ms. */
    durationMs: number;
  };
  /** Flat list of per-article errors for quick triage. */
  errors: Array<{ articleUrl: string; step: string; error: string }>;
}

// ─── INTERNAL HELPERS ─────────────────────────────────────────────

/**
 * Build the concatenated text blob sent to GLM for a single article.
 * Title + summary + content, filtered for truthy values.
 */
function articleToText(article: ArticleEntity): string {
  return [article.title, article.summary, article.content]
    .filter(Boolean)
    .join("\n\n");
}

/**
 * Convert an ArticleEntity to the lighter ArticleInput shape that
 * `assessReputation` / `detectNarratives` expect.
 */
export function toArticleInput(article: ArticleEntity): ArticleInput {
  return {
    title: article.title,
    summary: article.summary,
    content: article.content,
    url: article.url,
    sourceName: article.source,
    publishedAt: article.publishedAt,
  };
}

/** Promise-based sleep — used for inter-article rate limiting. */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Default SummarizationResult returned when GLM fails. */
function fallbackSummary(text: string): SummarizationResult {
  return {
    summary: text.slice(0, 300),
    key_points: [],
    entities: [],
    figures: [],
    language: "fr",
  };
}

/** Default SentimentResult returned when GLM fails. */
function fallbackSentiment(companyName: string): SentimentResult {
  return {
    overall_sentiment: "neutral",
    score: 0,
    confidence: 0,
    entity_sentiments: { [companyName]: "neutral" },
    key_phrases: [],
    reasoning: "Sentiment analysis unavailable — GLM call failed.",
  };
}

/** Default NERResult returned when GLM fails. */
function fallbackNER(): NERResult {
  return {
    entities: [],
    summary: {
      person_count: 0,
      organization_count: 0,
      location_count: 0,
      money_total_mad: null,
    },
  };
}

/** Default TopicResult returned when GLM fails. */
function fallbackTopics(): TopicResult {
  return {
    topics: [],
    primary_topic: "",
    scores: {},
    rejected_topics: [],
  };
}

// ─── SINGLE-ARTICLE PIPELINE ──────────────────────────────────────

/**
 * processArticle — run a single article through the four-step NLP
 * pipeline. Each step is isolated in its own try/catch so a failure
 * in one step does NOT abort the others.
 *
 * @param article     the ArticleEntity to process
 * @param companyName the company this article concerns (sentiment context)
 * @returns           ProcessedArticle with all four analyses populated
 *                    (defaults filled in for any step that failed)
 */
export async function processArticle(
  article: ArticleEntity,
  companyName: string,
): Promise<ProcessedArticle> {
  const errors: string[] = [];
  const text = articleToText(article);
  const usePremium = false; // standard model by default; batch opts override

  logInfo("HarchIQ-Understand", `→ NLP pipeline for article: "${article.title.slice(0, 80)}"`);

  // ─── STEP 1/4: SUMMARIZE ──────────────────────────────────
  let summary: SummarizationResult;
  try {
    summary = await summarizeArticle(text, usePremium);
    logInfo("HarchIQ-Understand", `  1/4 ✓ Summarized (${summary.summary.length} chars)`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`summarize: ${msg}`);
    logError("HarchIQ-Understand", `  1/4 ✗ Summarize failed: ${msg}`);
    summary = fallbackSummary(text);
  }

  // ─── STEP 2/4: SENTIMENT ──────────────────────────────────
  let sentiment: SentimentResult;
  try {
    sentiment = await analyzeSentiment(text, companyName, usePremium);
    logInfo("HarchIQ-Understand", `  2/4 ✓ Sentiment: ${sentiment.overall_sentiment} (score=${sentiment.score}, conf=${sentiment.confidence.toFixed(2)})`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`sentiment: ${msg}`);
    logError("HarchIQ-Understand", `  2/4 ✗ Sentiment failed: ${msg}`);
    sentiment = fallbackSentiment(companyName);
  }

  // ─── STEP 3/4: ENTITIES (NER) ─────────────────────────────
  let entities: NERResult;
  try {
    entities = await extractEntities(text, usePremium);
    logInfo("HarchIQ-Understand", `  3/4 ✓ NER: ${entities.entities.length} entities (P=${entities.summary.person_count}, O=${entities.summary.organization_count}, L=${entities.summary.location_count})`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`entities: ${msg}`);
    logError("HarchIQ-Understand", `  3/4 ✗ NER failed: ${msg}`);
    entities = fallbackNER();
  }

  // ─── STEP 4/4: TOPICS ─────────────────────────────────────
  let topics: TopicResult;
  try {
    topics = await classifyTopics(text, usePremium);
    logInfo("HarchIQ-Understand", `  4/4 ✓ Topics: ${topics.topics.length} (primary="${topics.primary_topic}")`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`topics: ${msg}`);
    logError("HarchIQ-Understand", `  4/4 ✗ Topics failed: ${msg}`);
    topics = fallbackTopics();
  }

  return {
    article,
    summary,
    sentiment,
    entities,
    topics,
    processedAt: new Date().toISOString(),
    errors,
  };
}

// ─── BATCH PIPELINE ───────────────────────────────────────────────

/**
 * processArticles — batch-process up to 20 articles (GLM's per-request
 * ceiling) with rate limiting, progress logging, and resilient error
 * collection.
 *
 * Behaviour:
 *  • Truncates input to `maxArticles` (default 20, hard-capped at 20).
 *  • Applies a `rateLimitMs` delay between articles (default 500ms).
 *  • Logs a progress line every `logEveryN` articles (default 5).
 *  • Per-article errors are captured inside each ProcessedArticle.errors
 *    AND in the returned `NLPBatchResult.errors` flat list (via the
 *    `summarizeBatch` wrapper).
 *  • NEVER throws — batch-level failures are logged and the article is
 *    skipped (with a record in the batch errors).
 *
 * @param articles    raw ArticleEntity[] from the COLLECT stage
 * @param companyName the company these articles concern
 * @param options     optional batch tuning knobs
 * @returns           ProcessedArticle[] (length <= maxArticles)
 */
export async function processArticles(
  articles: ArticleEntity[],
  companyName: string,
  options?: NLPBatchOptions,
): Promise<ProcessedArticle[]> {
  const usePremium = options?.usePremiumModel ?? false;
  // Hard cap at 20 — GLM's effective per-corpus ceiling.
  const maxArticles = Math.min(options?.maxArticles ?? 20, 20);
  const rateLimitMs = options?.rateLimitMs ?? 500;
  const logEveryN = options?.logEveryN ?? 5;

  const truncated = articles.slice(0, maxArticles);
  const processed: ProcessedArticle[] = [];
  const batchErrors: Array<{ articleUrl: string; step: string; error: string }> =
    [];

  logInfo("HarchIQ-Understand", `═══ NLP batch starting for "${companyName}" ═══`);
  logInfo("HarchIQ-Understand", `Input: ${articles.length} articles | Processing: ${truncated.length} | Model: ${usePremium ? "premium" : "standard"} | Rate limit: ${rateLimitMs}ms`);

  const startTime = Date.now();

  for (let i = 0; i < truncated.length; i++) {
    const article = truncated[i];

    try {
      const result = await processArticle(article, companyName);

      // Note: processArticle swallows per-step errors into result.errors.
      // Surface them in the batch-level error list too.
      for (const e of result.errors) {
        const [step, ...rest] = e.split(":");
        batchErrors.push({
          articleUrl: article.url,
          step: step?.trim() || "unknown",
          error: rest.join(":").trim(),
        });
      }

      processed.push(result);
    } catch (err) {
      // Catastrophic failure — processArticle itself threw (shouldn't
      // normally happen, but we never let one bad article kill the batch).
      const msg = err instanceof Error ? err.message : String(err);
      logError("HarchIQ-Understand", `Article ${i + 1} failed catastrophically: ${msg}`);
      batchErrors.push({
        articleUrl: article.url,
        step: "processArticle",
        error: msg,
      });
    }

    // Polite delay between articles (skip after the last one).
    if (i < truncated.length - 1 && rateLimitMs > 0) {
      await sleep(rateLimitMs);
    }

    // Progress log every N articles, plus the final article.
    if ((i + 1) % logEveryN === 0 || i + 1 === truncated.length) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      logInfo("HarchIQ-Understand", `Progress: ${i + 1}/${truncated.length} articles processed (${elapsed}s elapsed)`);
    }
  }

  const durationMs = Date.now() - startTime;
  const errored = processed.filter((p) => p.errors.length > 0).length;
  logInfo("HarchIQ-Understand", `═══ NLP batch complete in ${(durationMs / 1000).toFixed(1)}s | processed=${processed.length} | with-errors=${errored} | batch-errors=${batchErrors.length} ═══`);

  return processed;
}

// ─── BATCH SUMMARIZER ─────────────────────────────────────────────

/**
 * summarizeBatch — wrap a `ProcessedArticle[]` with batch-level stats
 * to produce an `NLPBatchResult`. Useful for callers that need the
 * aggregate metrics (total / succeeded / failed / duration) alongside
 * the per-article results.
 *
 * "Succeeded" = article has at least one successful step (errors.length
 * may be > 0 but is < 4). "Failed" = every step errored.
 *
 * @param processed  the ProcessedArticle[] returned by processArticles
 * @param durationMs optional wall-clock duration; if omitted, computed
 *                   from the spread of processedAt timestamps.
 * @returns          NLPBatchResult with stats + flat error list
 */
export function summarizeBatch(
  processed: ProcessedArticle[],
  durationMs?: number,
): NLPBatchResult {
  const total = processed.length;
  const failed = processed.filter((p) => p.errors.length >= 4).length;
  const succeeded = total - failed;

  // Compute duration from timestamps if not provided.
  let computedDuration = durationMs ?? 0;
  if (durationMs === undefined && processed.length > 0) {
    const timestamps = processed
      .map((p) => Date.parse(p.processedAt))
      .filter((t) => !Number.isNaN(t));
    if (timestamps.length > 0) {
      const min = Math.min(...timestamps);
      const max = Math.max(...timestamps);
      computedDuration = Math.max(0, max - min);
    }
  }

  const errors: Array<{ articleUrl: string; step: string; error: string }> = [];
  for (const p of processed) {
    for (const e of p.errors) {
      const [step, ...rest] = e.split(":");
      errors.push({
        articleUrl: p.article.url,
        step: step?.trim() || "unknown",
        error: rest.join(":").trim(),
      });
    }
  }

  return {
    processed,
    stats: {
      total,
      succeeded,
      failed,
      durationMs: computedDuration,
    },
    errors,
  };
}
