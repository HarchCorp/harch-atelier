// ═══════════════════════════════════════════════════════════════
//  HYBRID INFERENCE ENGINE — Cost optimization layer
//
//  Front 1: Eradiquer l'utilisation aveugle des gros LLM pour chaque
//  article. Pipeline à 3 niveaux:
//
//    Level 0 (FREE, local): Lexicon Darija — instant, 0 MAD/article
//    Level 1 (CHEAP, local): Heuristic classifier — keyword + source
//      authority + recency. 0 MAD/article. Filtre 80% du bruit.
//    Level 2 (EXPENSIVE, GLM-4): Full LLM analysis — summary, NER,
//      topics, risk. ~0.05 MAD/article. Seulement pour les articles
//      qui passent Level 1 avec un score de risque > seuil.
//
//  Coût par article: de ~0.05 MAD (tout GLM) à ~0.01 MAD (hybride).
//  Sur 10 000 articles/mois: économie de ~400 MAD/mois.
//  Sur 100 000 articles/mois: économie de ~4 000 MAD/mois.
// ═══════════════════════════════════════════════════════════════

import { analyzeSentiment } from "@/lib/harchiq/sentiment-analyzer";

export type InferenceLevel = 0 | 1 | 2;

export interface InferenceResult {
  level: InferenceLevel;
  sentimentScore: number;
  sentimentLabel: string;
  language: string;
  riskScore: number;
  shouldEscalate: boolean;
  summary?: string;
  topics?: string[];
  entities?: string[];
  cost: number; // MAD
}

// ─── Level 0: Lexicon (FREE, instant) ─────────────────────────────

function level0Lexicon(text: string): { score: number; label: string; language: string } {
  const result = analyzeSentiment(text);
  return {
    score: result.score,
    label: result.label,
    language: result.language || "unknown",
  };
}

// ─── Level 1: Heuristic classifier (FREE, local) ──────────────────

const HIGH_AUTHORITY_SOURCES = new Set([
  "telquel", "medias24", "hespress", "le360", "leconomiste",
  "aujourdhui", "lesiteinfo", "infomediaire", "financialafrik",
  "lavieeco", "lematin", "lopinion",
]);

const CRISIS_KEYWORDS = [
  // French
  "scandale", "fraude", "corruption", "boycott", "crise", "démission",
  "enquête", "tribunal", "poursuites", "blanchiment", "licenciement",
  "manifestation", "colère", "indignation", "polémique", "controversé",
  // Arabic transliteration
  "azma", "boikot", "fasad", "tasrib", "ihtikak",
  // English
  "scandal", "fraud", "corruption", "crisis", "resign", "investigation",
  "lawsuit", "embargo", "sanction", "protest", "outrage",
];

function level1Heuristic(
  text: string,
  source: string,
  publishedAt: Date,
  lexiconScore: number,
): { riskScore: number; shouldEscalate: boolean } {
  let risk = 0;

  // 1. Sentiment-based risk (40% weight)
  if (lexiconScore < -0.5) risk += 40;
  else if (lexiconScore < -0.2) risk += 20;
  else if (lexiconScore < 0) risk += 10;

  // 2. Source authority (20% weight)
  const sourceLower = source.toLowerCase();
  const isHighAuthority = Array.from(HIGH_AUTHORITY_SOURCES).some((s) =>
    sourceLower.includes(s),
  );
  if (isHighAuthority) risk += 20;

  // 3. Crisis keywords (25% weight)
  const textLower = text.toLowerCase();
  const keywordHits = CRISIS_KEYWORDS.filter((k) => textLower.includes(k));
  risk += Math.min(25, keywordHits.length * 8);

  // 4. Recency (15% weight) — newer articles are more urgent
  const hoursOld = (Date.now() - publishedAt.getTime()) / 3600000;
  if (hoursOld < 6) risk += 15;
  else if (hoursOld < 24) risk += 10;
  else if (hoursOld < 72) risk += 5;

  // Escalation threshold: articles with risk > 40 go to Level 2 (GLM-4)
  const shouldEscalate = risk >= 40;

  return { riskScore: Math.min(100, risk), shouldEscalate };
}

// ─── Level 2: GLM-4 (EXPENSIVE, full analysis) ────────────────────

async function level2GLM(
  text: string,
  companyName: string,
): Promise<{ summary: string; topics: string[]; entities: string[]; sentimentScore: number }> {
  const { CoreAnalyticsEngine } = await import("@/lib/engine/CoreAnalyticsEngine");
  const result = await CoreAnalyticsEngine.analyzeSentiment(text, {
    engine: "glm",
    trackedCompany: companyName,
  });

  return {
    summary: result.keyPhrases?.join(". ") || "",
    topics: result.keyPhrases || [],
    entities: Object.keys(result.entitySentiments || {}),
    sentimentScore: result.score,
  };
}

// ─── The Hybrid Pipeline ──────────────────────────────────────────

/**
 * Analyze an article through the hybrid pipeline.
 * Level 0 (lexicon) → Level 1 (heuristic) → Level 2 (GLM-4) if needed.
 *
 * Cost optimization:
 *   - 80% of articles stop at Level 0+1 (cost: 0 MAD)
 *   - 20% escalate to Level 2 (cost: ~0.05 MAD)
 *   - Average cost per article: ~0.01 MAD (vs 0.05 MAD if all GLM-4)
 */
export async function analyzeArticleHybrid(
  text: string,
  source: string,
  publishedAt: Date,
  companyName: string,
): Promise<InferenceResult> {
  // Level 0: Lexicon (FREE)
  const l0 = level0Lexicon(text);

  // Level 1: Heuristic (FREE)
  const l1 = level1Heuristic(text, source, publishedAt, l0.score);

  // Decision: escalate to Level 2?
  if (!l1.shouldEscalate) {
    return {
      level: 1,
      sentimentScore: l0.score,
      sentimentLabel: l0.label,
      language: l0.language,
      riskScore: l1.riskScore,
      shouldEscalate: false,
      cost: 0,
    };
  }

  // Level 2: GLM-4 (EXPENSIVE — but only for high-risk articles)
  try {
    const l2 = await level2GLM(text, companyName);
    return {
      level: 2,
      sentimentScore: l2.sentimentScore,
      sentimentLabel: l2.sentimentScore < -0.2 ? "negative" : l2.sentimentScore > 0.2 ? "positive" : "neutral",
      language: l0.language,
      riskScore: l1.riskScore,
      shouldEscalate: true,
      summary: l2.summary,
      topics: l2.topics,
      entities: l2.entities,
      cost: 0.05, // MAD per GLM-4 call
    };
  } catch {
    // GLM-4 failed — fall back to Level 1 result
    return {
      level: 1,
      sentimentScore: l0.score,
      sentimentLabel: l0.label,
      language: l0.language,
      riskScore: l1.riskScore,
      shouldEscalate: false,
      cost: 0,
    };
  }
}

// ─── Batch cost estimator ─────────────────────────────────────────

export function estimateBatchCost(
  articleCount: number,
  escalationRate: number = 0.2,
): { totalCost: number; glmCalls: number; freeAnalysis: number; savings: number } {
  const glmCalls = Math.ceil(articleCount * escalationRate);
  const freeAnalysis = articleCount - glmCalls;
  const totalCost = glmCalls * 0.05;
  const allGlmcost = articleCount * 0.05;
  const savings = allGlmcost - totalCost;

  return { totalCost, glmCalls, freeAnalysis, savings };
}
