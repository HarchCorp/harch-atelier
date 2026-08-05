// ═══════════════════════════════════════════════════════════════
//  FULL AUDIT WORKER — HARCH ATELIER v4.1 (Raw Intelligence Export)
//
//  V4.1 SURGICAL REWRITE — replaces the 3-sub-queue orchestration
//  (scraper → nlp → ai-visibility) with a SINGLE forensic pipeline:
//
//    Step 1 (progress 10)  → scrape Google News RSS (max 10 articles)
//    Step 2 (progress 30)  → fetch full article text (5 000 char cap)
//    Step 3 (progress 50)  → fetch full article text (5 000 char cap)
//    Step 4 (progress 80)  → HarchIQ: single GLM call → RawIntelligenceReport
//    Step 5 (progress 80)  → persist technical scores (sentiment + risks)
//    Step 6 (progress 100) → store report in Job.result, mark completed
//
//  RÈGLE D'OR (V4.1): NO recommendations, NO dossier, NO advisory.
//  The worker produces a RAW, evidence-quoted intelligence report and
//  stores it verbatim in `Job.result`. Technical scores (SentimentScore,
//  RiskAssessment) are persisted as secondary indices for dashboards but
//  carry no advisory content.
//
//  GLM caching: the intelligenceReport call is wrapped by the DB-backed
//  cache (getCachedGLMResult / cacheGLMResult from glm-orchestrator).
//  Identical { company, articles } inputs resolve to the same cache row
//  for 24h, slashing GLM spend on re-audits.
//
//  Job payload:  { companySlug: string; jobId: string }
//  Returns:      { success: true; report: RawIntelligenceReport }
//
//  Runs on a VPS — NOT on Vercel. Concurrency = 1 (GLM rate limits).
// ═══════════════════════════════════════════════════════════════

import { Worker } from "bullmq";
import { redisConnection } from "../connection";
import { prisma } from "../../db";
import {
  scrapeGoogleNewsRSS,
  fetchArticleContent,
} from "../../scrapers/rss-scraper";
import { getCompanyBySlug } from "../../scrapers/sources-config";
import { callGLM } from "../../ai/glm-client";
import {
  getCachedGLMResult,
  cacheGLMResult,
} from "../../ai/glm-orchestrator";
import {
  PROMPTS,
  type RawIntelligenceReport,
  type IntelligenceReportArticle,
} from "../../ai/glm-prompts";

// ─── JOB PAYLOAD / RESULT TYPES ──────────────────────────────────

export interface FullAuditJobPayload {
  companySlug: string;
  /** Prisma Job.id — used to write progress back to the DB so the
   *  polling endpoint can render a progress bar. */
  jobId: string;
  /** Optional — kept for backward compat with the v4.0 enqueue path. */
  companyName?: string;
}

export interface FullAuditJobResult {
  success: boolean;
  report: RawIntelligenceReport | null;
}

// ─── WORKER INSTANCE ─────────────────────────────────────────────

export const fullAuditWorker = new Worker<FullAuditJobPayload, FullAuditJobResult>(
  "full-audit-queue",
  async (job) => {
    const { companySlug, jobId } = job.data;
    const startedAt = job.timestamp || Date.now();

    console.log(
      `[full-audit-worker] ▶ job ${job.id} (db:${jobId}) — V4.1 raw intelligence audit for slug "${companySlug}"`,
    );

    // ─── STEP 1 (progress 10): VALIDATE + SCRAPE ───────────────
    await prisma.job.update({
      where: { id: jobId },
      data: { status: "processing", progress: 10, startedAt: new Date() },
    });

    // Validate the slug against the known sources registry (gives us
    // the canonical search name + sector metadata).
    const companyConfig = getCompanyBySlug(companySlug);
    if (!companyConfig) {
      throw new Error(`Company not found: ${companySlug}`);
    }

    // Fetch the canonical DB record — we need the Prisma `id` (cuid)
    // for SentimentScore / RiskAssessment foreign keys. The sources
    // config's `id` is a stable slug, NOT the DB cuid.
    const company = await prisma.company.findUnique({
      where: { slug: companySlug },
    });
    if (!company) {
      throw new Error(`Company not found in database: ${companySlug}`);
    }

    const scrapedArticles = await scrapeGoogleNewsRSS({
      query: company.name,
      maxArticles: 10,
    });
    console.log(
      `[full-audit-worker]   ✓ scraped ${scrapedArticles.length} articles for "${company.name}"`,
    );
    await prisma.job.update({ where: { id: jobId }, data: { progress: 30 } });

    // ─── STEP 2 (progress 50): FETCH FULL ARTICLE TEXT ─────────
    // Cap each article at 5 000 chars to respect the GLM-4 context
    // window. Fall back to the RSS snippet if full-text fetch fails.
    const articlesForAnalysis: IntelligenceReportArticle[] = [];
    for (const article of scrapedArticles.slice(0, 10)) {
      let content = article.description || article.title;
      try {
        const fullContent = await fetchArticleContent(article.url);
        if (fullContent && fullContent.length > 200) content = fullContent;
      } catch {
        // Non-fatal — use the RSS snippet as fallback.
      }
      articlesForAnalysis.push({
        title: article.title,
        content: content.substring(0, 5000),
        url: article.url,
        source: article.source,
        publishedAt: article.publishedAt
          ? article.publishedAt.toISOString()
          : new Date().toISOString(),
      });
    }
    console.log(
      `[full-audit-worker]   ✓ prepared ${articlesForAnalysis.length} articles for GLM analysis`,
    );
    await prisma.job.update({ where: { id: jobId }, data: { progress: 50 } });

    // ─── STEP 3 (progress 80): HARCHIQ — SINGLE GLM CALL ───────
    // One forensic prompt replaces the entire advisory stack. Cache
    // first (24h TTL on identical { company, articles } inputs); on
    // miss, call GLM with the intelligenceReport prompt and persist.
    const cacheKeyInput = {
      company: company.name,
      articles: articlesForAnalysis,
    };
    let report: RawIntelligenceReport | null = null;

    try {
      const cached = await getCachedGLMResult(
        "intelligenceReport",
        cacheKeyInput,
      );
      if (cached) {
        console.log("[full-audit] GLM cache HIT");
        report = cached as RawIntelligenceReport;
      } else {
        console.log("[full-audit] GLM cache MISS — calling API");
        const glmStart = Date.now();
        const glmResponse = await callGLM({
          messages: [
            { role: "system", content: PROMPTS.intelligenceReport.system },
            {
              role: "user",
              content: PROMPTS.intelligenceReport.user(
                company.name,
                articlesForAnalysis,
              ),
            },
          ],
          temperature: 0.2,
          maxTokens: 4096,
          timeout: 120000,
          retryCount: 1, // Single retry only — forensic report, no thrash
        });
        const glmLatencyMs = Date.now() - glmStart;

        const rawOutput = glmResponse.choices[0]?.message?.content || "";
        // Strip markdown fences (```json ... ```) if the model wrapped output.
        const cleaned = rawOutput
          .replace(/```json\n?/g, "")
          .replace(/```/g, "")
          .trim();
        report = JSON.parse(cleaned) as RawIntelligenceReport;

        // Persist to the DB cache (non-blocking on failure — the
        // orchestrator helper swallows errors itself).
        await cacheGLMResult(
          "intelligenceReport",
          cacheKeyInput,
          report,
          glmResponse.model || "glm-4-flash",
          glmLatencyMs,
        );
      }
    } catch (error) {
      console.error("[full-audit] GLM analysis failed:", error);
      throw new Error(
        `GLM analysis failed: ${(error as Error).message}`,
      );
    }
    await prisma.job.update({ where: { id: jobId }, data: { progress: 80 } });

    // ─── STEP 4: PERSIST TECHNICAL SCORES (no recommendations) ─
    // Secondary indices for dashboards. The raw report (with evidence
    // quotes) is the primary product and is stored in Job.result below.
    if (report) {
      // SentimentScore — one row per audit run.
      await prisma.sentimentScore.create({
        data: {
          companyId: company.id,
          score: report.sentiment.overall_score,
          positivePct:
            report.sentiment.label === "positive"
              ? 100
              : report.sentiment.label === "mixed"
                ? 50
                : 0,
          neutralPct: report.sentiment.label === "neutral" ? 100 : 0,
          negativePct:
            report.sentiment.label === "negative"
              ? 100
              : report.sentiment.label === "mixed"
                ? 50
                : 0,
          articleCount: articlesForAnalysis.length,
        },
      });

      // RiskAssessment — one row per risk identified in the report.
      for (const risk of report.risks) {
        await prisma.riskAssessment.create({
          data: {
            companyId: company.id,
            overallRisk: risk.score,
            riskLevel: risk.severity,
            category: risk.category,
            riskScore: risk.score,
            trajectory: "stable",
            articleCount: articlesForAnalysis.length,
          },
        });
      }
      console.log(
        `[full-audit-worker]   ✓ persisted 1 sentiment + ${report.risks.length} risk rows`,
      );
    }

    // ─── STEP 5 (progress 100): STORE REPORT + MARK COMPLETED ──
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: "completed",
        progress: 100,
        result: report as any,
        completedAt: new Date(),
        durationMs: Date.now() - startedAt,
      },
    });

    console.log(
      `[full-audit-worker] ✔ job ${job.id} (db:${jobId}) completed in ${Date.now() - startedAt}ms`,
    );

    return { success: true, report };
  },
  {
    connection: redisConnection,
    // Full audits issue a single long-running GLM call (~30–90s).
    // Run them serially per worker to keep GLM rate limits sane.
    concurrency: 1,
  },
);

// ─── EVENT HANDLERS ──────────────────────────────────────────────

fullAuditWorker.on("completed", (job) => {
  console.log(`[full-audit-worker] ✓ job ${job.id} completed`);
});

fullAuditWorker.on("failed", (job, err) => {
  console.error(`[full-audit-worker] ✗ job ${job?.id ?? "?"} failed: ${err.message}`);
  if (job?.data?.jobId) {
    prisma.job
      .update({
        where: { id: job.data.jobId },
        data: { status: "failed", error: err.message },
      })
      .catch(() => {
        // Swallow — we're already in a failure path; best-effort DB update.
      });
  }
});

fullAuditWorker.on("error", (err) => {
  console.error("[full-audit-worker] worker error:", err.message);
});
