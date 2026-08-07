// ═══════════════════════════════════════════════════════════════
//  CORE ANALYTICS ENGINE — Unified sentiment + risk + NLP facade
//
//  This module is the SINGLE entry point for all sentiment analysis,
//  risk scoring, and reputation calculation in HarchIQ. It replaces
//  the scattered imports from:
//    • src/lib/harchiq/sentiment-analyzer.ts  (lexicon, sync)
//    • src/lib/analyzers/sentiment-analyzer.ts (GLM-4, async)
//    • src/lib/analyzers/orchestrator-v2.ts    (orchestration)
//
//  Strategy pattern: callers pick the engine at call time.
//    import { CoreAnalyticsEngine } from '@/lib/engine/CoreAnalyticsEngine';
//    const result = await CoreAnalyticsEngine.analyzeSentiment(text, {
//      engine: 'lexicon', // or 'glm' for GLM-4
//    });
//
//  Task 11 — Step X (Refactor & Fusion): this is the unified module.
//  Old modules are kept as re-exports for backward compatibility —
//  callers can migrate incrementally without breaking.
// ═══════════════════════════════════════════════════════════════

// ─── Re-export types from both analyzers ──────────────────────────
export type { SentimentAnalysis, DetectedLanguage, Token } from "@/lib/harchiq/sentiment-analyzer";
export type { SentimentResult, TrendResult, CompanyReputationScore } from "@/lib/analyzers/sentiment-analyzer";

// ─── Re-export the underlying functions (backward compat) ─────────
export {
  analyzeSentiment as analyzeSentimentLexicon,
  analyzeArticleSentiment,
  detectLanguage,
  tokenise,
  LEXICON_STATS,
} from "@/lib/harchiq/sentiment-analyzer";

export {
  analyzeSentiment as analyzeSentimentGLM,
  analyzeArticles,
  detectTrends,
  calculateReputationScore,
} from "@/lib/analyzers/sentiment-analyzer";

// ─── Engine strategy types ────────────────────────────────────────

export type AnalyticsEngine = "lexicon" | "glm";

export interface AnalyzeSentimentOptions {
  /** Which engine to use: 'lexicon' (instant, local) or 'glm' (LLM, async). */
  engine?: AnalyticsEngine;
  /** For GLM engine: the company name to track (extracts entity sentiment). */
  trackedCompany?: string;
  /** For GLM engine: the article URL + title (needed for Article interface). */
  articleUrl?: string;
  articleTitle?: string;
  articlePublishedAt?: Date;
}

export interface UnifiedSentimentResult {
  /** The sentiment score: lexicon returns -1..+1, GLM returns -1..+1. */
  score: number;
  /** Human-readable label: positive | neutral | negative. */
  label: "positive" | "neutral" | "negative";
  /** Confidence 0..1 (lexicon always 1.0, GLM returns its own). */
  confidence: number;
  /** Which engine produced this result. */
  engine: AnalyticsEngine;
  /** Key phrases extracted (lexicon) or reasoning (GLM). */
  keyPhrases?: string[];
  /** Per-entity sentiment (GLM only). */
  entitySentiments?: Record<string, "positive" | "neutral" | "negative">;
}

// ─── The Engine facade ────────────────────────────────────────────

export const CoreAnalyticsEngine = {
  /**
   * Unified sentiment analysis — picks the engine based on options.
   *
   * - engine: 'lexicon' (default) → instant, local, no API call
   * - engine: 'glm' → GLM-4 LLM call (async, needs ZAI_API_KEY)
   *
   * Returns a normalized UnifiedSentimentResult regardless of engine.
   */
  async analyzeSentiment(
    text: string,
    options: AnalyzeSentimentOptions = {},
  ): Promise<UnifiedSentimentResult> {
    const engine = options.engine ?? "lexicon";

    if (engine === "lexicon") {
      const { analyzeSentiment } = await import("@/lib/harchiq/sentiment-analyzer");
      const result = analyzeSentiment(text);
      return {
        score: result.score,
        label: result.label,
        confidence: 1.0,
        engine: "lexicon",
        keyPhrases: result.keyPhrases,
      };
    }

    // GLM engine
    const { analyzeSentiment: analyzeGLM } = await import("@/lib/analyzers/sentiment-analyzer");
    const article = {
      title: options.articleTitle ?? text.slice(0, 200),
      url: options.articleUrl ?? "",
      content: text,
      publishedAt: options.articlePublishedAt ?? new Date(),
    } as any; // Article interface adapter
    const result = await analyzeGLM(article, options.trackedCompany ?? "");
    return {
      score: result.score,
      label: result.sentiment,
      confidence: result.relevanceScore / 100,
      engine: "glm",
      keyPhrases: result.topics,
      entitySentiments: Object.fromEntries(
        result.entities.map((e: string) => [e, result.sentiment])
      ),
    };
  },

  /**
   * Batch analyze multiple texts — picks engine per-call.
   * For lexicon: sequential (instant, <1ms each).
   * For GLM: uses the analyzeArticles batch function.
   */
  async analyzeBatch(
    texts: string[],
    options: AnalyzeSentimentOptions = {},
  ): Promise<UnifiedSentimentResult[]> {
    const engine = options.engine ?? "lexicon";
    if (engine === "lexicon") {
      const { analyzeSentiment } = await import("@/lib/harchiq/sentiment-analyzer");
      return texts.map((text) => {
        const r = analyzeSentiment(text);
        return {
          score: r.score,
          label: r.label,
          confidence: 1.0,
          engine: "lexicon" as const,
          keyPhrases: r.keyPhrases,
        };
      });
    }
    // GLM batch
    const { analyzeArticles } = await import("@/lib/analyzers/sentiment-analyzer");
    const articles = texts.map((t, i) => ({
      title: t.slice(0, 200),
      url: "",
      content: t,
      publishedAt: new Date(),
    })) as any[];
    const results = await analyzeArticles(articles, options.trackedCompany ?? "");
    return results.map((r) => ({
      score: r.score,
      label: r.sentiment,
      confidence: r.relevanceScore / 100,
      engine: "glm" as const,
      keyPhrases: r.topics,
      entitySentiments: Object.fromEntries(
        r.entities.map((e: string) => [e, r.sentiment])
      ),
    }));
  },

  /**
   * Detect language — delegates to the lexicon analyzer (instant).
   */
  detectLanguage(text: string): "fr" | "ar" | "en" {
    // Sync import — the lexicon module is always available
    const { detectLanguage } = require("@/lib/harchiq/sentiment-analyzer");
    return detectLanguage(text);
  },

  /**
   * Calculate company reputation score — delegates to GLM analyzer.
   */
  async calculateReputation(
    articles: Array<{ title: string; content: string; publishedAt: Date; url: string }>,
    companyName: string,
  ) {
    const { calculateReputationScore } = await import("@/lib/analyzers/sentiment-analyzer");
    return calculateReputationScore(articles as any, companyName);
  },
};

// ─── Backward-compat default export ───────────────────────────────
// Allows: import { CoreAnalyticsEngine } from '@/lib/engine/CoreAnalyticsEngine'
// AND:    import CoreEngine from '@/lib/engine/CoreAnalyticsEngine'
export default CoreAnalyticsEngine;
