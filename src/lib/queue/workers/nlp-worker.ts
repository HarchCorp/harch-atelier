// ═══════════════════════════════════════════════════════════════
//  NLP WORKER — AEGIS v4.1 (hybrid pipeline)
//
//  Consumes jobs from `nlp-queue`. For every unprocessed Article
//  belonging to the target company, routes through the hybrid
//  inference pipeline (Level 0 → 1 → 2):
//    • Level 0 (FREE, lexicon Darija)  → sentimentScore + label
//    • Level 1 (FREE, heuristic)       → riskScore + escalation flag
//    • Level 2 (~0.05 MAD, GLM-4)      → summary + topics + entities
//      (only if Level 1 shouldEscalate = true, ~20% of articles)
//
//  Per-article persistence:
//  ────────────────────────
//    • Level 1:  Article.sentimentLabel + Article.sentimentScore
//    • Level 2:  same + Article.summary + Entity / EntityMention rows
//
//  Fallback strategy:
//  ──────────────────
//  If `analyzeArticleHybrid` throws (import failure, unexpected
//  crash), the worker falls back to the legacy `runFullAnalysis`
//  batch path — same GLM-4 calls as before, with the same cache.
//  The worker NEVER goes dark.
//
//  Job payload:  { companySlug: string; articleIds?: string[] }
//  Returns:      { articlesProcessed: number; errors: Array<{ articleId: string; error: string }> }
//
//  Runs on a VPS — NOT on Vercel.
// ═══════════════════════════════════════════════════════════════

import { Worker, type Job } from "bullmq";
import { prisma } from "../../db";
import { redisConnection } from "../connection";
import { QUEUE_NAMES } from "../index";
import {
  runFullAnalysis,
  type ArticleInput,
  type FullAnalysisResult,
  type NEREntity,
  type SentimentResult,
  type SummarizationResult,
  type TopicResult,
  type RiskResult,
} from "../../ai/glm-orchestrator";
import {
  analyzeArticleHybrid,
  type InferenceResult,
} from "@/lib/inference/hybrid-pipeline";
import { getCompanyBySlug } from "../../scrapers/sources-config";

// ─── JOB PAYLOAD / RESULT TYPES ──────────────────────────────────

export interface NlpJobPayload {
  companySlug: string;
  /** Optional explicit subset — if omitted, all unprocessed articles
   *  for the company are processed. */
  articleIds?: string[];
}

export interface NlpJobError {
  articleId: string;
  error: string;
}

export interface NlpJobResult {
  articlesProcessed: number;
  errors: NlpJobError[];
}

// ─── HELPERS ─────────────────────────────────────────────────────

/**
 * Build the ArticleInput expected by the GLM orchestrator from a
 * Prisma Article row. We pass title + summary + content (truncated
 * to ~5000 chars to stay within the GLM-4 context window — the
 * scraper already caps content, but we cap defensively here too).
 */
function toArticleInput(a: {
  id: string;
  title: string;
  url: string;
  source: string;
  summary: string | null;
  content: string | null;
  publishedAt: Date | null;
}): ArticleInput {
  return {
    title: a.title,
    url: a.url,
    sourceName: a.source,
    summary: a.summary ?? undefined,
    content: (a.content ?? "").slice(0, 5000),
    publishedAt: a.publishedAt ? a.publishedAt.toISOString() : undefined,
  };
}

/**
 * Upsert an Entity row by (name + entityType). If new, seed its
 * `sources` array with the article's source. Returns the Entity id
 * so we can attach an EntityMention.
 *
 * Entities are GLOBAL across all companies — an ORGANIZATION like
 * "Bank Al-Maghrib" can be mentioned by articles about many of our
 * tracked companies. The per-company link lives on EntityMention.
 *
 * NOTE: `aliases` / `sources` / `tags` are TEXT columns holding
 * JSON-encoded arrays in the actual DB schema. We JSON.stringify on
 * write and JSON.parse on read.
 */
async function upsertEntity(
  entity: NEREntity,
  sourceName: string,
): Promise<string> {
  const existing = await prisma.entity.findFirst({
    where: { name: entity.normalized, entityType: entity.type },
    select: { id: true, sources: true },
  });

  if (existing) {
    // sources is a native String[] column in the Postgres schema.
    const existingSources: string[] = existing.sources ?? [];
    const sources = existingSources.includes(sourceName)
      ? existingSources
      : [...existingSources, sourceName];

    await prisma.entity.update({
      where: { id: existing.id },
      data: {
        lastSeen: new Date(),
        confidence: Math.max(0.5, entity.confidence),
        sources,
      },
    });
    return existing.id;
  }

  const created = await prisma.entity.create({
    data: {
      name: entity.normalized,
      entityType: entity.type,
      aliases: [entity.text],
      confidence: entity.confidence,
      sources: [sourceName],
      tags: [],
    },
  });
  return created.id;
}

/**
 * Persist per-article NLP results back into the Article row.
 * Wrapped in try/catch so a single update failure doesn't roll back
 * the entire batch.
 */
async function updateArticleWithNlp(
  articleId: string,
  summary: SummarizationResult | undefined,
  sentiment: SentimentResult | undefined,
): Promise<void> {
  try {
    await prisma.article.update({
      where: { id: articleId },
      data: {
        summary: summary?.summary ?? null,
        sentimentLabel: sentiment?.overall_sentiment ?? null,
        sentimentScore: sentiment?.score ?? null,
        // Relevance is implicit — every article in our DB already
        // passed the company-mention filter in the scraper. We use
        // the sentiment confidence as a proxy for analytical signal.
        relevanceScore: sentiment?.confidence ?? null,
      },
    });
  } catch (err) {
    console.error(
      `[nlp-worker] updateArticleWithNlp failed for ${articleId}:`,
      err instanceof Error ? err.message : err,
    );
  }
}

/**
 * Persist NER entities + their per-company mentions. We skip entities
 * with too-low confidence (< 0.4) to avoid flooding the graph with
 * noise from GLM hallucinations.
 */
async function persistEntities(
  articleId: string,
  companyId: string,
  sourceName: string,
  mentionText: string,
  entities: NEREntity[],
  sentimentLabel?: string | null,
  sentimentScore?: number | null,
): Promise<void> {
  for (const entity of entities) {
    if (entity.confidence < 0.4) continue;
    try {
      const entityId = await upsertEntity(entity, sourceName);
      await prisma.entityMention.create({
        data: {
          entityId,
          companyId,
          articleId,
          mentionText: entity.text,
          sentimentLabel: sentimentLabel ?? null,
          sentimentScore: sentimentScore ?? null,
        },
      });
    } catch (err) {
      // Entity + EntityMention are analytics-only — never crash the
      // worker on a graph write failure.
      console.error(
        `[nlp-worker] EntityMention write failed for "${entity.text}":`,
        err instanceof Error ? err.message : err,
      );
    }
  }
}

/**
 * Aggregate the per-article sentiment results into a single
 * SentimentScore row for the company. One row per NLP run — historical
 * trend comes from multiple SentimentScore rows over time.
 */
async function persistSentimentScore(
  companyId: string,
  sentiments: Array<SentimentResult | undefined>,
  language: string | null,
): Promise<void> {
  const valid = sentiments.filter(
    (s): s is SentimentResult => s !== undefined,
  );
  if (valid.length === 0) return;

  const positive = valid.filter((s) => s.overall_sentiment === "positive").length;
  const neutral = valid.filter((s) => s.overall_sentiment === "neutral").length;
  const negative = valid.filter((s) => s.overall_sentiment === "negative").length;
  const total = valid.length;

  const avgScore = valid.reduce((sum, s) => sum + (s.score ?? 0), 0) / total;

  try {
    await prisma.sentimentScore.create({
      data: {
        companyId,
        score: avgScore,
        positivePct: (positive / total) * 100,
        neutralPct: (neutral / total) * 100,
        negativePct: (negative / total) * 100,
        articleCount: total,
        language: language ?? "unknown",
        // sourceBreakdown is a native Json column in the Postgres schema.
        sourceBreakdown: {
          positive,
          neutral,
          negative,
          total,
        } as any,
      },
    });
  } catch (err) {
    console.error(
      "[nlp-worker] SentimentScore write failed:",
      err instanceof Error ? err.message : err,
    );
  }
}

/**
 * Persist a RiskAssessment row per detected risk item from the
 * aggregate `risks` step. Each row carries the standard
 * category / frequency / impact / velocity triple used by the
 * Signal-AI-style risk model.
 */
async function persistRiskAssessment(
  companyId: string,
  risks: RiskResult | null,
): Promise<void> {
  if (!risks || !risks.risks || risks.risks.length === 0) return;

  for (const risk of risks.risks) {
    try {
      await prisma.riskAssessment.create({
        data: {
          companyId,
          overallRisk: risks.overall_risk_score,
          riskLevel: risks.overall_risk_level,
          category: risk.category,
          frequency: risk.probability,
          impactSeverity: risk.impact,
          velocity: risk.score,
          riskScore: risk.score,
          trajectory: risk.velocity,
          articleCount: risks.risks.length,
        },
      });
    } catch (err) {
      console.error(
        `[nlp-worker] RiskAssessment write failed for "${risk.category}":`,
        err instanceof Error ? err.message : err,
      );
    }
  }
}

// ─── HYBRID PIPELINE PERSISTERS ──────────────────────────────────

/**
 * Persist a single InferenceResult back into the Article row.
 *   • Level 1 (lexicon only): store just score + label
 *   • Level 2 (GLM-4 ran): also store summary (topics folded into
 *     the SentimentScore sourceBreakdown by `persistHybridSentimentScore`)
 *
 * Wrapped in try/catch so a single update failure doesn't roll back
 * the entire batch.
 */
async function updateArticleWithHybrid(
  articleId: string,
  result: InferenceResult,
): Promise<void> {
  try {
    await prisma.article.update({
      where: { id: articleId },
      data: {
        // Level 1 has no summary — only Level 2 produced one.
        summary: result.level === 2 ? (result.summary ?? null) : null,
        sentimentLabel: result.sentimentLabel,
        sentimentScore: result.sentimentScore,
        // Use the heuristic risk score (0..100) as a relevance proxy.
        // Higher risk → higher analytical signal → higher relevance.
        relevanceScore: result.riskScore / 100,
      },
    });
  } catch (err) {
    console.error(
      `[nlp-worker] updateArticleWithHybrid failed for ${articleId}:`,
      err instanceof Error ? err.message : err,
    );
  }
}

/**
 * Persist entities from a Level 2 result. The hybrid pipeline only
 * returns plain entity NAMES (no NER type / position info — that's
 * a Level-3 feature we may add later), so we wrap each name into a
 * NEREntity with type `"ORGANIZATION"` (the most common entity type
 * in financial news) and confidence 0.6 — above the 0.4 threshold
 * in `persistEntities`, so they actually get persisted.
 */
async function persistHybridEntities(
  articleId: string,
  companyId: string,
  sourceName: string,
  mentionText: string,
  entities: string[],
  sentimentLabel: string,
  sentimentScore: number,
): Promise<void> {
  if (!entities || entities.length === 0) return;

  const nerEntities: NEREntity[] = entities.map((name) => ({
    text: name,
    normalized: name,
    type: "ORGANIZATION",
    start: 0,
    end: name.length,
    confidence: 0.6,
  }));

  await persistEntities(
    articleId,
    companyId,
    sourceName,
    mentionText,
    nerEntities,
    sentimentLabel,
    sentimentScore,
  );
}

/**
 * Aggregate hybrid results into a single SentimentScore rollup for
 * the company. Same shape as `persistSentimentScore`, but consumes
 * the simpler `InferenceResult` type. Topics from all Level 2
 * articles are folded into the sourceBreakdown JSON (so the
 * reputation dashboard can still surface them), plus cost telemetry
 * (totalCostMad, level1Count, level2Count) for the cost dashboard.
 */
async function persistHybridSentimentScore(
  companyId: string,
  results: InferenceResult[],
  language: string | null,
): Promise<void> {
  if (results.length === 0) return;

  const positive = results.filter((r) => r.sentimentLabel === "positive").length;
  const neutral = results.filter((r) => r.sentimentLabel === "neutral").length;
  const negative = results.filter((r) => r.sentimentLabel === "negative").length;
  const total = results.length;
  const avgScore = results.reduce((s, r) => s + r.sentimentScore, 0) / total;

  const topics: string[] = [];
  let totalCost = 0;
  let level2Count = 0;
  for (const r of results) {
    if (r.level === 2) {
      level2Count++;
      if (r.topics) topics.push(...r.topics);
    }
    totalCost += r.cost;
  }

  try {
    await prisma.sentimentScore.create({
      data: {
        companyId,
        score: avgScore,
        positivePct: (positive / total) * 100,
        neutralPct: (neutral / total) * 100,
        negativePct: (negative / total) * 100,
        articleCount: total,
        language: language ?? "unknown",
        sourceBreakdown: {
          positive,
          neutral,
          negative,
          total,
          topics,
          level1Count: total - level2Count,
          level2Count,
          totalCostMad: Number(totalCost.toFixed(4)),
        } as any,
      },
    });
  } catch (err) {
    console.error(
      "[nlp-worker] persistHybridSentimentScore write failed:",
      err instanceof Error ? err.message : err,
    );
  }
}

// ─── JOB HANDLER ─────────────────────────────────────────────────

async function processNlpJob(job: Job<NlpJobPayload>): Promise<NlpJobResult> {
  const { companySlug, articleIds } = job.data;
  const startedAt = Date.now();

  console.log(
    `[nlp-worker] ▶ job ${job.id} — NLP for company "${companySlug}"` +
      (articleIds ? ` (filtered to ${articleIds.length} ids)` : ""),
  );

  // ─── 1. LOAD COMPANY + UNPROCESSED ARTICLES ─────────────────
  const company = await prisma.company.findUnique({
    where: { slug: companySlug },
    select: { id: true, name: true },
  });
  if (!company) {
    throw new Error(`Company not found for slug "${companySlug}"`);
  }

  // NOTE: the actual Article table has no `processed` column. We use
  // `sentimentLabel: null` as the "unprocessed" sentinel — the NLP
  // worker sets sentimentLabel when it processes an article, so any
  // article with a null label is by definition unprocessed.
  const whereClause = articleIds && articleIds.length > 0
    ? { companyId: company.id, sentimentLabel: null, id: { in: articleIds } }
    : { companyId: company.id, sentimentLabel: null };

  const articles = await prisma.article.findMany({
    where: whereClause,
    orderBy: { publishedAt: "desc" },
    take: 100, // hard cap per NLP run — keeps each job under ~5 min
  });

  if (articles.length === 0) {
    console.log(`[nlp-worker] ⊘ no unprocessed articles for ${companySlug}`);
    return { articlesProcessed: 0, errors: [] };
  }

  console.log(
    `[nlp-worker] processing ${articles.length} articles for ${company.name}`,
  );

  // ─── 2. RUN HYBRID PIPELINE (Level 0/1/2) ───────────────────
  // analyzeArticleHybrid routes each article through:
  //   Level 0 (lexicon, FREE) → Level 1 (heuristic, FREE)
  //     → Level 2 (GLM-4, ~0.05 MAD) only if risk ≥ 40
  // ~80% of articles stop at Level 0+1 (cost: 0 MAD).
  // The GLM-4 call inside Level 2 goes through the orchestrator's
  // cachedGLMCall, so re-runs over already-analysed articles are free.
  //
  // If `analyzeArticleHybrid` throws (rare — it has its own internal
  // try/catch around GLM-4), we fall back to the legacy batch path.
  let hybridResults: InferenceResult[] | null = null;
  try {
    hybridResults = [];
    for (const article of articles) {
      const result = await analyzeArticleHybrid(
        (article.content ?? "").slice(0, 5000),
        article.source,
        article.publishedAt ?? new Date(0),
        company.name,
      );
      hybridResults.push(result);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(
      `[nlp-worker] analyzeArticleHybrid crashed (${msg}) — falling back to runFullAnalysis`,
    );
    hybridResults = null;
  }

  // ─── 2a. HYBRID PATH: persist per-article + rollups ─────────
  if (hybridResults !== null) {
    const errors: NlpJobError[] = [];
    let processed = 0;
    let level2Count = 0;
    let totalCost = 0;

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      const result = hybridResults[i];

      try {
        // 2a-1. Update the Article row (Level 1: score + label only,
        //       Level 2: also summary).
        await updateArticleWithHybrid(article.id, result);

        // 2a-2. Persist extracted entities + per-company mentions.
        //       Only Level 2 has entities — Level 1 is lexicon-only.
        if (result.level === 2 && result.entities && result.entities.length > 0) {
          await persistHybridEntities(
            article.id,
            company.id,
            article.source,
            `${article.title} ${article.content ?? ""}`,
            result.entities,
            result.sentimentLabel,
            result.sentimentScore,
          );
        }

        // 2a-3. The article is now "processed" — `updateArticleWithHybrid`
        //       above already set sentimentLabel, which is our
        //       "processed" sentinel (no dedicated column on the actual
        //       Article table). Idempotent re-runs will skip it because
        //       the NLP worker filters on `sentimentLabel: null`.

        if (result.level === 2) level2Count++;
        totalCost += result.cost;
        processed++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(
          `[nlp-worker] per-article persist failed for ${article.id}: ${msg}`,
        );
        errors.push({ articleId: article.id, error: msg });
      }
    }

    // Company-level rollup (one row per NLP run).
    await persistHybridSentimentScore(
      company.id,
      hybridResults,
      articles[0]?.language ?? null,
    );

    const elapsed = Date.now() - startedAt;
    console.log(
      `[nlp-worker] ✔ job ${job.id} done in ${elapsed}ms — ${processed}/${articles.length} processed, ${level2Count} L2, ${errors.length} errors, ~${totalCost.toFixed(2)} MAD`,
    );

    return { articlesProcessed: processed, errors };
  }

  // ─── 2b. FALLBACK PATH: runFullAnalysis (legacy GLM batch) ──
  // Used only if the hybrid pipeline crashed. Preserves the original
  // behaviour so the worker never goes dark. Same skipSteps as before
  // — high-level synthesis is handled by the ai-visibility-worker.
  console.log(`[nlp-worker] ↻ using legacy runFullAnalysis fallback`);
  const articleInputs = articles.map(toArticleInput);
  let analysis: FullAnalysisResult;
  try {
    analysis = await runFullAnalysis(company.name, articleInputs, {
      skipSteps: [
        "narratives",
        "reputation",
        "aiVisibility",
        "recommendations",
        "dossier",
      ],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[nlp-worker] runFullAnalysis failed: ${msg}`);
    return {
      articlesProcessed: 0,
      errors: articles.map((a) => ({ articleId: a.id, error: msg })),
    };
  }

  // ─── 3. PERSIST PER-ARTICLE RESULTS (legacy) ────────────────
  const errors: NlpJobError[] = [];
  let processed = 0;

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    const summary = analysis.steps.summarize[i];
    const sentiment = analysis.steps.sentiment[i];
    const ner = analysis.steps.ner[i];
    // const topics = analysis.steps.topics[i]; // folded into sourceBreakdown

    try {
      // 3a. Update the Article row with summary + sentiment.
      await updateArticleWithNlp(article.id, summary, sentiment);

      // 3b. Persist extracted entities + per-company mentions.
      if (ner?.entities?.length) {
        await persistEntities(
          article.id,
          company.id,
          article.source,
          `${article.title} ${article.content ?? ""}`,
          ner.entities,
          sentiment?.overall_sentiment,
          sentiment?.score,
        );
      }

      processed++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(
        `[nlp-worker] per-article persist failed for ${article.id}: ${msg}`,
      );
      errors.push({ articleId: article.id, error: msg });
    }
  }

  // ─── 4. PERSIST COMPANY-LEVEL ROLLUPS (legacy) ──────────────
  await persistSentimentScore(
    company.id,
    analysis.steps.sentiment,
    articles[0]?.language ?? null,
  );
  await persistRiskAssessment(company.id, analysis.steps.risks);

  const elapsed = Date.now() - startedAt;
  console.log(
    `[nlp-worker] ✔ job ${job.id} done in ${elapsed}ms — ${processed}/${articles.length} processed, ${errors.length} errors (fallback path)`,
  );

  return { articlesProcessed: processed, errors };
}

// ─── WORKER INSTANCE ─────────────────────────────────────────────

export const nlpWorker = new Worker<NlpJobPayload, NlpJobResult>(
  QUEUE_NAMES.nlp,
  processNlpJob,
  {
    connection: redisConnection,
    // GLM calls are network-bound and slow (2–10s each). Running 2 in
    // parallel keeps throughput up without saturating the GLM gateway
    // or Upstash's connection pool.
    concurrency: 2,
  },
);

nlpWorker.on("completed", (job, result) => {
  console.log(
    `[nlp-worker] ✓ job ${job.id} completed —`,
    result ?? "(no result)",
  );
});

nlpWorker.on("failed", (job, err) => {
  console.error(`[nlp-worker] ✗ job ${job?.id ?? "?"} failed: ${err.message}`);
});

nlpWorker.on("error", (err) => {
  console.error("[nlp-worker] worker error:", err.message);
});
