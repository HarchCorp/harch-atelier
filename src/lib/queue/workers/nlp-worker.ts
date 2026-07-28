// ═══════════════════════════════════════════════════════════════
//  NLP WORKER — AEGIS v4.0
//
//  Consumes jobs from `nlp-queue`. For every unprocessed Article
//  belonging to the target company, runs the GLM-4 pipeline:
//    • summarize   → updates Article.summary
//    • sentiment   → updates Article.sentimentLabel / sentimentScore
//                    + creates a per-company SentimentScore rollup
//    • NER         → creates Entity + EntityMention rows
//    • topics      → folded into the SentimentScore sourceBreakdown
//
//  Cache strategy:
//  ───────────────
//  Every GLM call goes through the orchestrator's `cachedGLMCall`
//  wrapper, which hashes `{ promptType, inputPayload }` and looks up
//  the GLMAnalysis table BEFORE issuing the call. On a hit the cached
//  `outputPayload` is returned; on a miss the GLM response is
//  persisted back to GLMAnalysis with model + latency metadata. So
//  re-running the worker over already-processed articles is free.
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

  // ─── 2. RUN GLM ANALYSIS (CACHE-AWARE VIA runFullAnalysis) ──
  // runFullAnalysis internally calls cachedGLMCall for every step.
  // cachedGLMCall checks the GLMAnalysis table BEFORE issuing any GLM
  // request, so re-runs over already-analysed articles are free.
  //
  // We skip the high-level synthesis steps (narratives, reputation,
  // aiVisibility, recommendations, dossier) — those are handled by
  // the dedicated ai-visibility-worker and the report generator.
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

  // ─── 3. PERSIST PER-ARTICLE RESULTS ─────────────────────────
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

      // 3c. The article is now "processed" — `updateArticleWithNlp`
      //     above already set sentimentLabel, which is our
      //     "processed" sentinel (no dedicated column on the actual
      //     Article table). Idempotent re-runs will skip it because
      //     the NLP worker filters on `sentimentLabel: null`.

      processed++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(
        `[nlp-worker] per-article persist failed for ${article.id}: ${msg}`,
      );
      errors.push({ articleId: article.id, error: msg });
    }
  }

  // ─── 4. PERSIST COMPANY-LEVEL ROLLUPS ───────────────────────
  // These are aggregate rows — one per NLP run — that drive the
  // historical charts on the company dashboard.
  await persistSentimentScore(
    company.id,
    analysis.steps.sentiment,
    articles[0]?.language ?? null,
  );
  await persistRiskAssessment(company.id, analysis.steps.risks);

  const elapsed = Date.now() - startedAt;
  console.log(
    `[nlp-worker] ✔ job ${job.id} done in ${elapsed}ms — ${processed}/${articles.length} processed, ${errors.length} errors`,
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
