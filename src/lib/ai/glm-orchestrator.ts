// ═══════════════════════════════════════════════════════════════
//  GLM ORCHESTRATOR — PROJECT AEGIS REMEDIATION
//  Coordinates all AI operations: sentiment, NER, topics, risks,
//  AI visibility, summarization, narratives, reputation,
//  recommendations, translation, and the full 10-step dossier pipeline.
//
//  Every function wraps promptGLMJSON with the appropriate prompt
//  and ships safe fallback defaults if the GLM call fails.
// ═══════════════════════════════════════════════════════════════

import {
  promptGLMJSON,
  selectModel,
  callGLM,
  type GLMMessage,
  type GLMRequestOptions,
} from "./glm-client";
import {
  PROMPTS,
  type SentimentPromptParams,
  type NERPromptParams,
  type TopicPromptParams,
  type RiskPromptParams,
  type AIVisibilityPromptParams,
  type SummarizationPromptParams,
  type NarrativePromptParams,
  type ReputationPromptParams,
  type RecommendationsPromptParams,
  type TranslationPromptParams,
  type DossierPromptParams,
} from "./glm-prompts";
import {
  dbGLMCache,
  getCachedGLMResult,
  cacheGLMResult,
} from "./llm-cache";
import { logInfo, logError } from "@/lib/logger";

// Re-export health check for consumers of this module
export { checkGLMHealth, type GLMHealthStatus } from "./glm-client";
// Re-export the cache helpers so full-audit-worker.ts (which imports
// them from here) keeps compiling without a migration.
export { getCachedGLMResult, cacheGLMResult } from "./llm-cache";

// ─── CACHED GLM CALL ───────────────────────────────────────────────
// Check the DB cache (Prisma GLMAnalysis, 24h TTL) → call GLM on miss
// → persist the result. All cache I/O is non-blocking: a cache failure
// is logged inside llm-cache.ts and the call proceeds as a miss.
// The cache key is SHA-256 of { promptType, inputPayload } so identical
// analyses across processes (serverless, workers, cron) collapse.

async function cachedGLMCall<T>(
  step: string,
  promptType: string,
  inputPayload: unknown,
  model: string,
  fn: () => Promise<T>
): Promise<T> {
  const cached = await dbGLMCache.get(promptType, inputPayload);
  if (cached !== null) {
    logInfo("GLM Cache", `HIT for ${step}`);
    return cached as T;
  }
  logInfo("GLM Cache", `MISS for ${step} — caching result`);
  const start = Date.now();
  const result = await fn();
  const latencyMs = Date.now() - start;
  await dbGLMCache.set(promptType, inputPayload, result, model, latencyMs);
  return result;
}

// ─── RESULT INTERFACES ────────────────────────────────────────────

export interface SentimentResult {
  overall_sentiment: "positive" | "neutral" | "negative";
  score: number;
  confidence: number;
  entity_sentiments: Record<string, "positive" | "neutral" | "negative">;
  key_phrases: string[];
  reasoning: string;
}

export interface NEREntity {
  text: string;
  type:
    | "PERSON"
    | "ORGANIZATION"
    | "LOCATION"
    | "MONEY"
    | "DATE"
    | "PRODUCT"
    | "EVENT"
    | "LAW"
    | "TITLE"
    | "FACILITY";
  start: number;
  end: number;
  normalized: string;
  confidence: number;
}

export interface NERResult {
  entities: NEREntity[];
  summary: {
    person_count: number;
    organization_count: number;
    location_count: number;
    money_total_mad: number | null;
  };
}

export interface TopicResult {
  topics: string[];
  primary_topic: string;
  scores: Record<string, number>;
  rejected_topics: string[];
}

export interface RiskItem {
  category: string;
  severity: "low" | "moderate" | "elevated" | "high" | "severe";
  score: number;
  probability: number;
  impact: number;
  velocity: "stable" | "rising" | "accelerating" | "declining";
  evidence: string;
  recommended_action: string;
}

export interface RiskResult {
  company: string;
  overall_risk_level: "low" | "moderate" | "elevated" | "high" | "severe";
  overall_risk_score: number;
  risks: RiskItem[];
  top_risk: string;
  horizon: "immediate" | "short_term" | "medium_term" | "long_term";
}

export interface AIVisibilityResult {
  company: string;
  known: boolean;
  confidence: number;
  estimated_position: number;
  framing: "positive" | "neutral" | "negative" | "mixed";
  narrative: string;
  strengths_cited: string[];
  weaknesses_cited: string[];
  sector_mentioned: boolean;
  competitors_cited: string[];
  recommendation: string;
}

export interface SummarizationFigure {
  label: string;
  value: string;
  context: string;
}

export interface SummarizationResult {
  summary: string;
  key_points: string[];
  entities: string[];
  figures: SummarizationFigure[];
  language: string;
}

export interface NarrativeItem {
  title: string;
  description: string;
  sentiment: "positive" | "neutral" | "negative";
  strength: number;
  trajectory: "emerging" | "peaking" | "fading" | "stable";
  article_count: number;
  key_actors: string[];
  risk_or_opportunity: "risk" | "opportunity" | "neutral";
}

export interface NarrativeResult {
  narratives: NarrativeItem[];
  dominant_narrative: string;
  emerging_narratives: string[];
}

export interface ReputationPillar {
  score: number;
  evidence: string;
}

export interface ReputationResult {
  company: string;
  overall_score: number;
  pillars: Record<
    | "innovation"
    | "performance"
    | "purpose"
    | "leadership"
    | "citizenship"
    | "governance"
    | "workplace"
    | "sustainability",
    ReputationPillar
  >;
  strengths: string[];
  weaknesses: string[];
  sentiment_distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  outlook: "improving" | "stable" | "deteriorating";
}

export interface RecommendationItem {
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  category:
    | "communications"
    | "operations"
    | "finance"
    | "governance"
    | "legal"
    | "esg"
    | "strategy"
    | "hr";
  timeline: "immediate" | "short_term" | "medium_term" | "long_term";
  owner: string;
  expected_impact: string;
  kpi: string;
}

export interface RecommendationResult {
  company: string;
  recommendations: RecommendationItem[];
  top_priority: string;
  ninety_day_plan: string[];
}

export interface TranslationResult {
  source_language: string;
  translated_text: string;
  notes: string[];
}

export interface DossierSWOT {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface DossierRelationship {
  entity: string;
  type:
    | "partner"
    | "competitor"
    | "regulator"
    | "customer"
    | "supplier"
    | "investor";
  nature: string;
}

export interface DossierResult {
  company: string;
  executive_summary: string;
  situation_analysis: string;
  swot: DossierSWOT;
  key_relationships: DossierRelationship[];
  risk_outlook: string;
  reputation_outlook: string;
  strategic_priorities: string[];
  watch_items: string[];
  analyst_note: string;
}

// ─── INPUT TYPES ──────────────────────────────────────────────────

export interface ArticleInput {
  title?: string;
  summary?: string;
  content?: string;
  url?: string;
  sourceName?: string;
  publishedAt?: string;
}

export interface FullAnalysisOptions {
  usePremiumModel?: boolean;
  skipSteps?: Array<
    | "summarize"
    | "sentiment"
    | "ner"
    | "topics"
    | "risks"
    | "narratives"
    | "reputation"
    | "aiVisibility"
    | "recommendations"
    | "dossier"
  >;
}

export interface FullAnalysisResult {
  company: string;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  steps: {
    summarize: SummarizationResult[];
    sentiment: SentimentResult[];
    ner: NERResult[];
    topics: TopicResult[];
    risks: RiskResult | null;
    narratives: NarrativeResult | null;
    reputation: ReputationResult | null;
    aiVisibility: AIVisibilityResult | null;
    recommendations: RecommendationResult | null;
    dossier: DossierResult | null;
  };
  errors: Array<{ step: string; error: string }>;
}

// ─── OPTION BUILDER ───────────────────────────────────────────────

function buildOptions(
  usePremiumModel?: boolean,
  overrides?: Partial<GLMRequestOptions>
): Partial<GLMRequestOptions> {
  return {
    model: selectModel(usePremiumModel),
    ...overrides,
  };
}

// ─── 1. SENTIMENT ANALYSIS ────────────────────────────────────────

export async function analyzeSentiment(
  text: string,
  companyName: string,
  usePremiumModel?: boolean
): Promise<SentimentResult> {
  const params: SentimentPromptParams = { text, companyName };
  return promptGLMJSON<SentimentResult>(
    PROMPTS.sentiment.user(params),
    PROMPTS.sentiment.system,
    buildOptions(usePremiumModel, { temperature: 0.2 })
  );
}

// ─── 2. NAMED ENTITY RECOGNITION ──────────────────────────────────

export async function extractEntities(
  text: string,
  usePremiumModel?: boolean
): Promise<NERResult> {
  const params: NERPromptParams = { text };
  return promptGLMJSON<NERResult>(
    PROMPTS.ner.user(params),
    PROMPTS.ner.system,
    buildOptions(usePremiumModel, { temperature: 0.1 })
  );
}

// ─── 3. TOPIC CLASSIFICATION ──────────────────────────────────────

export async function classifyTopics(
  text: string,
  usePremiumModel?: boolean
): Promise<TopicResult> {
  const params: TopicPromptParams = { text };
  return promptGLMJSON<TopicResult>(
    PROMPTS.topicClassification.user(params),
    PROMPTS.topicClassification.system,
    buildOptions(usePremiumModel, { temperature: 0.2 })
  );
}

// ─── 4. RISK ASSESSMENT ───────────────────────────────────────────

export async function assessRisks(
  text: string,
  companyName: string,
  usePremiumModel?: boolean
): Promise<RiskResult> {
  const params: RiskPromptParams = { text, companyName };
  return promptGLMJSON<RiskResult>(
    PROMPTS.riskAssessment.user(params),
    PROMPTS.riskAssessment.system,
    buildOptions(usePremiumModel, { temperature: 0.3 })
  );
}

// ─── 5. AI VISIBILITY ─────────────────────────────────────────────

export async function checkAIVisibility(
  companyName: string,
  sector?: string,
  usePremiumModel?: boolean
): Promise<AIVisibilityResult> {
  const params: AIVisibilityPromptParams = { companyName, sector };
  return promptGLMJSON<AIVisibilityResult>(
    PROMPTS.aiVisibility.user(params),
    PROMPTS.aiVisibility.system,
    buildOptions(usePremiumModel, { temperature: 0.4 })
  );
}

// ─── 6. SUMMARIZATION ─────────────────────────────────────────────

export async function summarizeArticle(
  text: string,
  usePremiumModel?: boolean
): Promise<SummarizationResult> {
  const params: SummarizationPromptParams = { text };
  return promptGLMJSON<SummarizationResult>(
    PROMPTS.summarization.user(params),
    PROMPTS.summarization.system,
    buildOptions(usePremiumModel, { temperature: 0.3 })
  );
}

// ─── 7. NARRATIVE DETECTION ───────────────────────────────────────

export async function detectNarratives(
  articles: ArticleInput[],
  usePremiumModel?: boolean
): Promise<NarrativeResult> {
  const params: NarrativePromptParams = { articles };
  return promptGLMJSON<NarrativeResult>(
    PROMPTS.narrativeDetection.user(params),
    PROMPTS.narrativeDetection.system,
    buildOptions(usePremiumModel, {
      temperature: 0.4,
      maxTokens: 4096,
    })
  );
}

// ─── 8. REPUTATION ASSESSMENT ─────────────────────────────────────

export async function assessReputation(
  companyName: string,
  articles: ArticleInput[],
  usePremiumModel?: boolean
): Promise<ReputationResult> {
  const params: ReputationPromptParams = { companyName, articles };
  return promptGLMJSON<ReputationResult>(
    PROMPTS.reputation.user(params),
    PROMPTS.reputation.system,
    buildOptions(usePremiumModel, {
      temperature: 0.3,
      maxTokens: 4096,
    })
  );
}

// ─── 9. RECOMMENDATIONS ───────────────────────────────────────────

// V4.1: generateRecommendations removed — no advisory content in Raw Intelligence mode

// ─── 10. TRANSLATION ──────────────────────────────────────────────

export async function translateToFrench(
  text: string,
  usePremiumModel?: boolean
): Promise<TranslationResult> {
  const params: TranslationPromptParams = { text };
  return promptGLMJSON<TranslationResult>(
    PROMPTS.translation.user(params),
    PROMPTS.translation.system,
    buildOptions(usePremiumModel, { temperature: 0.2 })
  );
}

// ─── 11. COMPREHENSIVE DOSSIER ────────────────────────────────────

export interface DossierInputData {
  summaries?: SummarizationResult[];
  sentiments?: SentimentResult[];
  entities?: NERResult[];
  topics?: TopicResult[];
  risks?: RiskResult | null;
  narratives?: NarrativeResult | null;
  reputation?: ReputationResult | null;
  aiVisibility?: AIVisibilityResult | null;
  recommendations?: RecommendationResult | null;
  [key: string]: unknown;
}

// V4.1: generateDossier removed — no advisory content in Raw Intelligence mode
export async function generateDossier(
  companyName: string,
  data: DossierInputData,
  usePremiumModel?: boolean
): Promise<DossierResult> {
  throw new Error('V4.1: generateDossier is deprecated. Use intelligenceReport prompt instead.');
}

// ─── FALLBACK DEFAULTS ────────────────────────────────────────────

function defaultSentiment(companyName: string): SentimentResult {
  return {
    overall_sentiment: "neutral",
    score: 0,
    confidence: 0,
    entity_sentiments: { [companyName]: "neutral" },
    key_phrases: [],
    reasoning: "Sentiment analysis unavailable — GLM call failed.",
  };
}

function defaultNER(): NERResult {
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

function defaultTopics(): TopicResult {
  return {
    topics: ["government_policy"],
    primary_topic: "government_policy",
    scores: { government_policy: 0.3 },
    rejected_topics: [],
  };
}

function defaultRisks(companyName: string): RiskResult {
  return {
    company: companyName,
    overall_risk_level: "low",
    overall_risk_score: 20,
    risks: [],
    top_risk: "none_detected",
    horizon: "medium_term",
  };
}

function defaultAIVisibility(companyName: string): AIVisibilityResult {
  return {
    company: companyName,
    known: false,
    confidence: 0,
    estimated_position: 10,
    framing: "neutral",
    narrative: "AI visibility check unavailable — GLM call failed.",
    strengths_cited: [],
    weaknesses_cited: [],
    sector_mentioned: false,
    competitors_cited: [],
    recommendation: "Retry AI visibility assessment when GLM is available.",
  };
}

function defaultSummarization(text: string): SummarizationResult {
  return {
    summary: text.slice(0, 300),
    key_points: [],
    entities: [],
    figures: [],
    language: "fr",
  };
}

function defaultNarratives(): NarrativeResult {
  return {
    narratives: [],
    dominant_narrative: "",
    emerging_narratives: [],
  };
}

function defaultReputation(companyName: string): ReputationResult {
  const emptyPillar: ReputationPillar = { score: 50, evidence: "No data" };
  return {
    company: companyName,
    overall_score: 50,
    pillars: {
      innovation: emptyPillar,
      performance: emptyPillar,
      purpose: emptyPillar,
      leadership: emptyPillar,
      citizenship: emptyPillar,
      governance: emptyPillar,
      workplace: emptyPillar,
      sustainability: emptyPillar,
    },
    strengths: [],
    weaknesses: [],
    sentiment_distribution: { positive: 33, neutral: 34, negative: 33 },
    outlook: "stable",
  };
}

function defaultRecommendations(companyName: string): RecommendationResult {
  return {
    company: companyName,
    recommendations: [
      {
        title: "Restore AI analysis pipeline",
        description:
          "The GLM-backed analysis pipeline is currently unavailable. Prioritize restoring the connection to resume full intelligence coverage.",
        priority: "high",
        category: "operations",
        timeline: "immediate",
        owner: "Head of Intelligence",
        expected_impact:
          "Resumes automated reputation and risk monitoring for the company.",
        kpi: "GLM health check returns healthy within 24h",
      },
    ],
    top_priority: "Restore AI analysis pipeline",
    ninety_day_plan: [
      "Verify GLM_API_KEY configuration",
      "Confirm GLM rate limits and quota",
      "Re-run full analysis pipeline",
    ],
  };
}

function defaultDossier(companyName: string): DossierResult {
  return {
    company: companyName,
    executive_summary:
      "Comprehensive dossier generation unavailable — GLM call failed. Please retry once the AI pipeline is restored.",
    situation_analysis:
      "No situation analysis could be produced without the AI pipeline.",
    swot: {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: [],
    },
    key_relationships: [],
    risk_outlook: "Unknown — analysis unavailable.",
    reputation_outlook: "Unknown — analysis unavailable.",
    strategic_priorities: [],
    watch_items: [],
    analyst_note:
      "Dossier generation failed; downstream analyses were also affected.",
  };
}

// ─── HELPER: article full text ────────────────────────────────────

function articleText(article: ArticleInput): string {
  return [article.title, article.summary, article.content]
    .filter(Boolean)
    .join("\n\n");
}

// ─── FULL ANALYSIS PIPELINE ───────────────────────────────────────

export async function runFullAnalysis(
  companyName: string,
  articles: ArticleInput[],
  options?: FullAnalysisOptions
): Promise<FullAnalysisResult> {
  const usePremium = options?.usePremiumModel ?? false;
  const skipSteps = new Set(options?.skipSteps ?? []);
  const startedAt = new Date().toISOString();
  const startTime = Date.now();
  const errors: Array<{ step: string; error: string }> = [];
  const model = selectModel(usePremium);

  logInfo("orchestrator", `═══ Starting full analysis for: ${companyName} ═══`);
  logInfo("orchestrator", `Articles: ${articles.length} | Model: ${model} | Skipped steps: ${skipSteps.size}`);

  // ─── STEP 1: SUMMARIZE ALL ARTICLES ─────────────────────────
  logInfo("orchestrator", "Step 1/10: Summarizing articles…");
  const summaries: SummarizationResult[] = [];
  if (!skipSteps.has("summarize")) {
    for (const article of articles) {
      const text = articleText(article);
      if (!text) continue;
      try {
        const summary = await cachedGLMCall<SummarizationResult>(
          "summarize",
          "summarization",
          { text },
          model,
          () => summarizeArticle(text, usePremium)
        );
        summaries.push(summary);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logError("orchestrator", `Summarization failed: ${msg}`);
        errors.push({ step: "summarize", error: msg });
        summaries.push(defaultSummarization(text));
      }
    }
    logInfo("orchestrator", `✓ Summarized ${summaries.length}/${articles.length} articles`);
  } else {
    logInfo("orchestrator", "⊘ Step skipped: summarize");
  }

  // ─── STEP 2: SENTIMENT ANALYSIS PER ARTICLE ─────────────────
  logInfo("orchestrator", "Step 2/10: Analyzing sentiment per article…");
  const sentiments: SentimentResult[] = [];
  if (!skipSteps.has("sentiment")) {
    for (const article of articles) {
      const text = articleText(article);
      if (!text) continue;
      try {
        const sentiment = await cachedGLMCall<SentimentResult>(
          "sentiment",
          "sentiment",
          { text, companyName },
          model,
          () => analyzeSentiment(text, companyName, usePremium)
        );
        sentiments.push(sentiment);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logError("orchestrator", `Sentiment failed: ${msg}`);
        errors.push({ step: "sentiment", error: msg });
        sentiments.push(defaultSentiment(companyName));
      }
    }
    logInfo("orchestrator", `✓ Sentiment analysis complete (${sentiments.length} articles)`);
  } else {
    logInfo("orchestrator", "⊘ Step skipped: sentiment");
  }

  // ─── STEP 3: ENTITY EXTRACTION PER ARTICLE ──────────────────
  logInfo("orchestrator", "Step 3/10: Extracting entities per article…");
  const entities: NERResult[] = [];
  if (!skipSteps.has("ner")) {
    for (const article of articles) {
      const text = articleText(article);
      if (!text) continue;
      try {
        const ner = await cachedGLMCall<NERResult>(
          "ner",
          "ner",
          { text },
          model,
          () => extractEntities(text, usePremium)
        );
        entities.push(ner);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logError("orchestrator", `NER failed: ${msg}`);
        errors.push({ step: "ner", error: msg });
        entities.push(defaultNER());
      }
    }
    logInfo("orchestrator", `✓ Entity extraction complete (${entities.length} articles)`);
  } else {
    logInfo("orchestrator", "⊘ Step skipped: ner");
  }

  // ─── STEP 4: TOPIC CLASSIFICATION PER ARTICLE ───────────────
  logInfo("orchestrator", "Step 4/10: Classifying topics per article…");
  const topics: TopicResult[] = [];
  if (!skipSteps.has("topics")) {
    for (const article of articles) {
      const text = articleText(article);
      if (!text) continue;
      try {
        const topic = await cachedGLMCall<TopicResult>(
          "topics",
          "topic_classification",
          { text },
          model,
          () => classifyTopics(text, usePremium)
        );
        topics.push(topic);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logError("orchestrator", `Topic classification failed: ${msg}`);
        errors.push({ step: "topics", error: msg });
        topics.push(defaultTopics());
      }
    }
    logInfo("orchestrator", `✓ Topic classification complete (${topics.length} articles)`);
  } else {
    logInfo("orchestrator", "⊘ Step skipped: topics");
  }

  // ─── STEP 5: RISK ASSESSMENT (AGGREGATE) ────────────────────
  logInfo("orchestrator", "Step 5/10: Assessing risks (aggregate)…");
  let risks: RiskResult | null = null;
  if (!skipSteps.has("risks")) {
    const aggregateText = articles
      .map((a) => articleText(a))
      .filter(Boolean)
      .join("\n\n---\n\n")
      .slice(0, 8000);
    try {
      risks = await cachedGLMCall<RiskResult>(
        "risks",
        "risk_assessment",
        { text: aggregateText, companyName },
        model,
        () => assessRisks(aggregateText, companyName, usePremium)
      );
      logInfo("orchestrator", `✓ Risk assessment: ${risks.overall_risk_level} (score ${risks.overall_risk_score})`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logError("orchestrator", `Risk assessment failed: ${msg}`);
      errors.push({ step: "risks", error: msg });
      risks = defaultRisks(companyName);
    }
  } else {
    logInfo("orchestrator", "⊘ Step skipped: risks");
  }

  // ─── STEP 6: NARRATIVE DETECTION ────────────────────────────
  logInfo("orchestrator", "Step 6/10: Detecting narratives…");
  let narratives: NarrativeResult | null = null;
  if (!skipSteps.has("narratives")) {
    try {
      narratives = await cachedGLMCall<NarrativeResult>(
        "narratives",
        "narrative_detection",
        { articles },
        model,
        () => detectNarratives(articles, usePremium)
      );
      logInfo("orchestrator", `✓ Detected ${narratives.narratives.length} narratives (dominant: "${narratives.dominant_narrative || "none"}")`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logError("orchestrator", `Narrative detection failed: ${msg}`);
      errors.push({ step: "narratives", error: msg });
      narratives = defaultNarratives();
    }
  } else {
    logInfo("orchestrator", "⊘ Step skipped: narratives");
  }

  // ─── STEP 7: REPUTATION ASSESSMENT ──────────────────────────
  logInfo("orchestrator", "Step 7/10: Assessing reputation…");
  let reputation: ReputationResult | null = null;
  if (!skipSteps.has("reputation")) {
    try {
      reputation = await cachedGLMCall<ReputationResult>(
        "reputation",
        "reputation",
        { companyName, articles },
        model,
        () => assessReputation(companyName, articles, usePremium)
      );
      logInfo("orchestrator", `✓ Reputation score: ${reputation.overall_score}/100 (${reputation.outlook})`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logError("orchestrator", `Reputation assessment failed: ${msg}`);
      errors.push({ step: "reputation", error: msg });
      reputation = defaultReputation(companyName);
    }
  } else {
    logInfo("orchestrator", "⊘ Step skipped: reputation");
  }

  // ─── STEP 8: AI VISIBILITY CHECK ────────────────────────────
  logInfo("orchestrator", "Step 8/10: Checking AI visibility…");
  let aiVisibility: AIVisibilityResult | null = null;
  if (!skipSteps.has("aiVisibility")) {
    try {
      aiVisibility = await cachedGLMCall<AIVisibilityResult>(
        "aiVisibility",
        "ai_visibility",
        { companyName, sector: undefined },
        model,
        () => checkAIVisibility(companyName, undefined, usePremium)
      );
      logInfo("orchestrator", `✓ AI visibility: ${aiVisibility.known ? "known" : "unknown"} (position #${aiVisibility.estimated_position})`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logError("orchestrator", `AI visibility check failed: ${msg}`);
      errors.push({ step: "aiVisibility", error: msg });
      aiVisibility = defaultAIVisibility(companyName);
    }
  } else {
    logInfo("orchestrator", "⊘ Step skipped: aiVisibility");
  }

  // ─── STEP 9: RECOMMENDATIONS (V4.1: REMOVED — no advisory content) ───
  logInfo("orchestrator", "Step 9/10: Recommendations (SKIPPED — V4.1 Raw Intelligence mode)");
  const recommendations: RecommendationResult | null = null;

  // ─── STEP 10: COMPREHENSIVE DOSSIER ─────────────────────────
  logInfo("orchestrator", "Step 10/10: Generating comprehensive dossier…");
  let dossier: DossierResult | null = null;
  if (!skipSteps.has("dossier")) {
    const dossierData: DossierInputData = {
      summaries,
      sentiments,
      entities,
      topics,
      risks,
      narratives,
      reputation,
      aiVisibility,
      recommendations,
    };
    try {
      dossier = await cachedGLMCall<DossierResult>(
        "dossier",
        "dossier",
        { companyName, data: dossierData },
        model,
        () => generateDossier(companyName, dossierData, usePremium)
      );
      logInfo("orchestrator", `✓ Dossier generated`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logError("orchestrator", `Dossier generation failed: ${msg}`);
      errors.push({ step: "dossier", error: msg });
      dossier = defaultDossier(companyName);
    }
  } else {
    logInfo("orchestrator", "⊘ Step skipped: dossier");
  }

  const completedAt = new Date().toISOString();
  const durationMs = Date.now() - startTime;

  logInfo("orchestrator", `═══ Full analysis complete in ${(durationMs / 1000).toFixed(1)}s (${errors.length} errors) ═══`);

  return {
    company: companyName,
    startedAt,
    completedAt,
    durationMs,
    steps: {
      summarize: summaries,
      sentiment: sentiments,
      ner: entities,
      topics,
      risks,
      narratives,
      reputation,
      aiVisibility,
      recommendations,
      dossier,
    },
    errors,
  };
}

// ─── LOW-LEVEL ESCAPE HATCH ───────────────────────────────────────
// Exposed for advanced consumers that need to build custom prompts
// while still benefiting from the GLM client's caching + rate limiting.

export async function callGLMJSON<T = unknown>(
  messages: GLMMessage[],
  options?: Partial<GLMRequestOptions>
): Promise<T> {
  const systemMsg = messages.find((m) => m.role === "system")?.content;
  const userMsg = messages.find((m) => m.role === "user")?.content || "";
  return promptGLMJSON<T>(userMsg, systemMsg, {
    ...buildOptions(false, options),
    messages,
  });
}

// Re-export callGLM for completeness
export { callGLM };
