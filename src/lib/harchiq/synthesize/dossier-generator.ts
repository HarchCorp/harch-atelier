// ═══════════════════════════════════════════════════════════════
//  PROJECT AEGIS v3.0 — HarchIQ SYNTHESIZE STAGE
//  Intelligence dossier generator.
//
//  The SYNTHESIZE stage takes everything UNDERSTAND, CONNECT, and
//  PREDICT produced and rolls it up into a single board-ready
//  IntelligenceDossier. This is the flagship artefact of the HarchIQ
//  engine — what our clients actually read.
//
//  Pipeline (7 steps, each isolated so a GLM failure degrades
//  gracefully rather than aborting the dossier):
//
//    1. Prepare article summaries for GLM (ArticleInput[])
//    2. assessReputation()           → pillar scores + outlook
//    3. detectNarratives()           → dominant storylines
//    4. generateRecommendations()    → strategic advice
//    5. generateDossier()            → SWOT + relationships + outlooks
//    6. checkAIVisibility()          → AI-engine presence
//    7. Compile everything into IntelligenceDossier
//
//  Every GLM call is wrapped in try/catch with a safe fallback so a
//  transient GLM outage still produces a usable (if thinner) dossier.
//
//  Task ID: AEGIS-V3-ENGINE
//  Module:  harchiq/synthesize/dossier-generator
// ═══════════════════════════════════════════════════════════════

import {
  assessReputation,
  detectNarratives,
  generateDossier,
  checkAIVisibility,
  type ArticleInput,
  type ReputationResult,
  type NarrativeResult,
  type DossierResult,
  type AIVisibilityResult,
  type DossierInputData,
} from "../../ai/glm-orchestrator";
import type {
  IntelligenceDossier,
  SWOTAnalysis,
  RiskAssessment,
  RiskCategoryScore,
} from "../types";
import type { ProcessedArticle } from "../understand/nlp-pipeline";
import type { CompanyThreatAssessment } from "../predict/threat-scoring";
import type { Entity, Relationship } from "../connect/graph-engine";

// ─── TYPES ────────────────────────────────────────────────────────

/**
 * DossierGenerationOptions — optional tunables for
 * `generateIntelligenceDossier`.
 */
export interface DossierGenerationOptions {
  /** Use the premium GLM model (glm-4) instead of glm-4-flash. */
  usePremiumModel?: boolean;
  /** Sector hint — improves AI-visibility accuracy. */
  sector?: string;
}

// ─── MAIN ENTRY POINT ─────────────────────────────────────────────

/**
 * generateIntelligenceDossier — the SYNTHESIZE stage's main function.
 *
 * Runs the 7-step pipeline described at the top of this file and
 * compiles the results into a single `IntelligenceDossier`. Every
 * GLM call is wrapped in try/catch with a safe fallback so a
 * transient GLM outage still produces a usable dossier.
 *
 * @param companyName       the company this dossier covers
 * @param processedArticles the ProcessedArticle[] from UNDERSTAND
 * @param threatAssessment  optional CompanyThreatAssessment from PREDICT
 * @param options           optional tunables (model tier, sector)
 * @returns                 IntelligenceDossier (never throws)
 */
export async function generateIntelligenceDossier(
  companyName: string,
  processedArticles: ProcessedArticle[],
  threatAssessment?: CompanyThreatAssessment | null,
  options?: DossierGenerationOptions,
): Promise<IntelligenceDossier> {
  console.log(
    `[HarchIQ-Synthesize] ═══ Dossier generation starting for "${companyName}" ═══`,
  );
  const startTime = Date.now();
  const usePremium = options?.usePremiumModel ?? false;

  // ─── STEP 1/7: PREPARE ARTICLE SUMMARIES FOR GLM ─────────
  const articleInputs: ArticleInput[] = processedArticles.map((pa) => ({
    title: pa.article.title,
    // Prefer the GLM summary over the raw article summary — it's cleaner.
    summary: pa.summary?.summary || pa.article.summary,
    content: pa.article.content,
    url: pa.article.url,
    sourceName: pa.article.source,
    publishedAt: pa.article.publishedAt,
  }));
  console.log(
    `[HarchIQ-Synthesize] Step 1/7: Prepared ${articleInputs.length} article inputs for GLM`,
  );

  // ─── STEP 2/7: ASSESS REPUTATION ─────────────────────────
  let reputation: ReputationResult;
  try {
    reputation = await assessReputation(companyName, articleInputs, usePremium);
    console.log(
      `[HarchIQ-Synthesize] Step 2/7: ✓ Reputation score: ${reputation.overall_score}/100 (outlook: ${reputation.outlook})`,
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(
      `[HarchIQ-Synthesize] Step 2/7: ✗ Reputation assessment failed: ${msg}`,
    );
    reputation = defaultReputation(companyName);
  }

  // ─── STEP 3/7: DETECT NARRATIVES ─────────────────────────
  let narratives: NarrativeResult;
  try {
    narratives = await detectNarratives(articleInputs, usePremium);
    console.log(
      `[HarchIQ-Synthesize] Step 3/7: ✓ Detected ${narratives.narratives.length} narratives (dominant: "${narratives.dominant_narrative || "none"}")`,
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(
      `[HarchIQ-Synthesize] Step 3/7: ✗ Narrative detection failed: ${msg}`,
    );
    narratives = defaultNarratives();
  }

  // ─── STEP 4/7: RECOMMENDATIONS (V4.1: SKIPPED — no advisory content) ───
  const recommendations = null;
  console.log("[HarchIQ-Synthesize] Step 4/7: ⊘ Recommendations (SKIPPED — V4.1 Raw Intelligence mode)");

  // ─── STEP 5/7: GENERATE COMPREHENSIVE DOSSIER ────────────
  let dossier: DossierResult;
  try {
    const dossierData: DossierInputData = {
      summaries: processedArticles.map((pa) => pa.summary),
      sentiments: processedArticles.map((pa) => pa.sentiment),
      entities: processedArticles.map((pa) => pa.entities),
      topics: processedArticles.map((pa) => pa.topics),
      risks: null, // PREDICT stage handles threat scoring separately
      narratives,
      reputation,
      aiVisibility: null, // populated in step 6 — dossier gets it later
      recommendations,
    };
    dossier = await generateDossier(companyName, dossierData, usePremium);
    console.log(`[HarchIQ-Synthesize] Step 5/7: ✓ Dossier generated`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(
      `[HarchIQ-Synthesize] Step 5/7: ✗ Dossier generation failed: ${msg}`,
    );
    dossier = defaultDossier(companyName);
  }

  // ─── STEP 6/7: CHECK AI VISIBILITY ───────────────────────
  let aiVisibility: AIVisibilityResult;
  try {
    aiVisibility = await checkAIVisibility(
      companyName,
      options?.sector,
      usePremium,
    );
    console.log(
      `[HarchIQ-Synthesize] Step 6/7: ✓ AI visibility: ${aiVisibility.known ? "known" : "unknown"} (position #${aiVisibility.estimated_position})`,
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(
      `[HarchIQ-Synthesize] Step 6/7: ✗ AI visibility check failed: ${msg}`,
    );
    aiVisibility = defaultAIVisibility(companyName);
  }

  // ─── STEP 7/7: COMPILE INTO IntelligenceDossier ─────────
  console.log(`[HarchIQ-Synthesize] Step 7/7: Compiling IntelligenceDossier`);

  const executiveSummary = compileExecutiveSummary(
    companyName,
    processedArticles,
    reputation,
    threatAssessment ?? null,
  );

  const swotAnalysis = compileSWOT(reputation, dossier);

  // Key relationships: prefer the dossier's GLM-extracted relationships.
  // (CONNECT-stage entity IDs would be merged in here if a graph were
  // supplied — see `compileKeyRelationships`.)
  const keyRelationships: string[] = (dossier.key_relationships ?? [])
    .map((r) => r.entity)
    .filter(Boolean);

  const riskAssessment = buildRiskAssessment(
    threatAssessment ?? null,
    dossier,
    processedArticles,
  );

  // Recommendations as plain strings (the IntelligenceDossier shape
  // calls for string[] — we format priority + category + title).
  const recommendationsList: string[] = [];

  const confidenceLevel = assessConfidenceLevel(processedArticles);
  const informationGaps = identifyInformationGaps(processedArticles);

  // Append an AI-visibility gap if the company is unknown to AI engines.
  if (!aiVisibility.known) {
    informationGaps.push(
      `${companyName} is not currently recognized by major AI engines — AI-visibility optimization is required.`,
    );
  }

  const generatedAt = new Date().toISOString();
  const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);

  const output: IntelligenceDossier = {
    company: companyName,
    executiveSummary,
    swotAnalysis,
    keyRelationships,
    riskAssessment,
    reputationScore: reputation.overall_score ?? 50,
    recommendations: recommendationsList,
    generatedAt,
    confidenceLevel,
    informationGaps,
  };

  console.log(
    `[HarchIQ-Synthesize] ═══ Dossier compiled in ${elapsedSec}s | reputation=${output.reputationScore}/100 | risk=${output.riskAssessment.overall}/100 | confidence=${(output.confidenceLevel * 100).toFixed(0)}% | gaps=${output.informationGaps.length} ═══`,
  );

  return output;
}

// ─── COMPILATION HELPERS ──────────────────────────────────────────

/**
 * compileExecutiveSummary — produce a 5-7 sentence executive summary
 * from the available signals. Pure function (no GLM call) so it
 * always succeeds even if every upstream GLM call failed.
 *
 * Sentences cover:
 *   1. Company + article count + reputation score + outlook
 *   2. Sentiment distribution (positive / neutral / negative counts)
 *   3. Reputation strengths (if any)
 *   4. Reputation weaknesses (if any)
 *   5. Threat assessment (level + trajectory)
 *   6. Top threats count (if any)
 *   7. Closing call-to-action for the next collection cycle
 */
export function compileExecutiveSummary(
  companyName: string,
  articles: ProcessedArticle[],
  reputation: ReputationResult | null,
  threats: CompanyThreatAssessment | null,
): string {
  const sentences: string[] = [];
  const n = articles.length;

  // Sentence 1 — overview.
  const repScore = reputation?.overall_score ?? 50;
  const outlook = reputation?.outlook ?? "stable";
  sentences.push(
    `${companyName} is currently tracked across ${n} intelligence source${n === 1 ? "" : "s"} with an overall reputation score of ${repScore}/100 and an outlook rated "${outlook}".`,
  );

  // Sentence 2 — sentiment distribution.
  const positive = articles.filter(
    (a) => a.sentiment?.overall_sentiment === "positive",
  ).length;
  const neutral = articles.filter(
    (a) => a.sentiment?.overall_sentiment === "neutral",
  ).length;
  const negative = articles.filter(
    (a) => a.sentiment?.overall_sentiment === "negative",
  ).length;
  sentences.push(
    `Media sentiment is distributed as ${positive} positive, ${neutral} neutral, and ${negative} negative article${n === 1 ? "" : "s"}.`,
  );

  // Sentence 3 — reputation strengths.
  if (reputation?.strengths && reputation.strengths.length > 0) {
    const s = reputation.strengths.slice(0, 2).join(" and ");
    sentences.push(`Reputation strengths center on ${s}.`);
  } else {
    sentences.push(
      `No dominant reputation strengths were identified in the current coverage.`,
    );
  }

  // Sentence 4 — reputation weaknesses.
  if (reputation?.weaknesses && reputation.weaknesses.length > 0) {
    const w = reputation.weaknesses.slice(0, 2).join(" and ");
    sentences.push(
      `Conversely, ${w} represent the most material reputation weaknesses.`,
    );
  }

  // Sentence 5 — threat assessment.
  if (threats) {
    sentences.push(
      `The aggregated threat level is ${threats.level.toUpperCase()} (score ${threats.overallScore}/100) with a ${threats.trajectory} trajectory.`,
    );
  } else {
    sentences.push(
      `No dedicated threat assessment was performed for this cycle.`,
    );
  }

  // Sentence 6 — top threats.
  const topCount = threats?.topThreats?.length ?? 0;
  if (topCount > 0) {
    sentences.push(
      `${topCount} article${topCount === 1 ? "" : "s"} triggered elevated threat alerts and warrant analyst attention.`,
    );
  }

  // Sentence 7 — closing.
  sentences.push(
    `Analysts should monitor the next collection cycle to verify trajectory and validate emerging narratives.`,
  );

  return sentences.join(" ");
}

/**
 * compileSWOT — extract a SWOTAnalysis from the GLM dossier + reputation
 * results. The dossier's GLM-generated SWOT takes priority; reputation
 * strengths/weaknesses are merged in as a fallback supplement.
 *
 * Dedupes case-sensitively and trims whitespace.
 */
export function compileSWOT(
  reputation: ReputationResult | null,
  dossier: DossierResult | null,
): SWOTAnalysis {
  const dossierSWOT = dossier?.swot;

  const strengths = [
    ...(dossierSWOT?.strengths ?? []),
    ...(reputation?.strengths ?? []),
  ];
  const weaknesses = [
    ...(dossierSWOT?.weaknesses ?? []),
    ...(reputation?.weaknesses ?? []),
  ];
  const opportunities = dossierSWOT?.opportunities ?? [];
  const threats = dossierSWOT?.threats ?? [];

  const dedupe = (arr: string[]): string[] => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const s of arr) {
      const trimmed = (s ?? "").trim();
      if (!trimmed || seen.has(trimmed)) continue;
      seen.add(trimmed);
      out.push(trimmed);
    }
    return out;
  };

  return {
    strengths: dedupe(strengths),
    weaknesses: dedupe(weaknesses),
    opportunities: dedupe(opportunities),
    threats: dedupe(threats),
  };
}

/**
 * compileKeyRelationships — format entity relationships for the
 * dossier. Returns the top 10 entity IDs by total relationship
 * strength (sum of strengths across all edges touching the entity).
 *
 * The IntelligenceDossier.keyRelationships field is `string[]` of
 * entity IDs — so this function returns IDs, not full entity objects.
 *
 * @param entities       all entities in the graph (from CONNECT stage)
 * @param relationships  all relationships in the graph
 * @returns              top 10 entity IDs by total strength, descending
 */
export function compileKeyRelationships(
  entities: Entity[],
  relationships: Relationship[],
): string[] {
  // Sum relationship strengths per entity (either as source or target).
  const strengthByEntity = new Map<string, number>();
  for (const rel of relationships) {
    const s = Math.max(0, Math.min(1, rel.strength ?? 0));
    strengthByEntity.set(
      rel.sourceId,
      (strengthByEntity.get(rel.sourceId) ?? 0) + s,
    );
    strengthByEntity.set(
      rel.targetId,
      (strengthByEntity.get(rel.targetId) ?? 0) + s,
    );
  }

  // Sort entities by total strength descending; only include entities
  // that have at least one relationship.
  const ranked = entities
    .filter((e) => strengthByEntity.has(e.id))
    .map((e) => ({ id: e.id, strength: strengthByEntity.get(e.id) ?? 0 }))
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 10);

  return ranked.map((r) => r.id);
}

// ─── CONFIDENCE & GAP ANALYSIS ────────────────────────────────────

/**
 * assessConfidenceLevel — compute an overall dossier confidence in
 * [0,1] based on three signals:
 *
 *   1. Article volume (40% weight)
 *        1-5 → 0.30, 6-10 → 0.50, 11-20 → 0.70, 21+ → 0.90
 *   2. Source diversity (30% weight)
 *        unique sources / total articles, clamped to [0,1]
 *   3. Mean sentiment confidence (30% weight)
 *        average of SentimentResult.confidence across articles
 *
 * Returns 0 if no articles were processed.
 */
export function assessConfidenceLevel(
  processedArticles: ProcessedArticle[],
): number {
  if (processedArticles.length === 0) return 0;

  const n = processedArticles.length;

  // Factor 1: article volume.
  let articleFactor: number;
  if (n <= 5) articleFactor = 0.3;
  else if (n <= 10) articleFactor = 0.5;
  else if (n <= 20) articleFactor = 0.7;
  else articleFactor = 0.9;

  // Factor 2: source diversity.
  const sources = new Set(
    processedArticles
      .map((pa) => pa.article?.source)
      .filter((s): s is string => Boolean(s)),
  );
  const sourceFactor = Math.min(1, sources.size / Math.max(1, n));

  // Factor 3: mean sentiment confidence.
  const sentimentConfs = processedArticles
    .map((pa) => pa.sentiment?.confidence)
    .filter((c): c is number => typeof c === "number" && !Number.isNaN(c));
  const avgSentimentConf =
    sentimentConfs.length > 0
      ? sentimentConfs.reduce((a, b) => a + b, 0) / sentimentConfs.length
      : 0;

  // Weighted blend.
  const confidence =
    articleFactor * 0.4 + sourceFactor * 0.3 + avgSentimentConf * 0.3;

  return Math.max(0, Math.min(1, confidence));
}

/**
 * identifyInformationGaps — list what's missing or unreliable in the
 * current corpus. Drives the next COLLECT cycle.
 *
 * Checks performed:
 *  • Empty corpus
 *  • Low article volume (<5)
 *  • Low source diversity (<3 unique sources)
 *  • Majority low-confidence sentiment
 *  • Missing summaries
 *  • Missing entities (NER)
 *  • Missing topics
 *  • Per-article processing errors
 *  • All-neutral sentiment (possible model degradation)
 */
export function identifyInformationGaps(
  processedArticles: ProcessedArticle[],
): string[] {
  const gaps: string[] = [];

  if (processedArticles.length === 0) {
    gaps.push(
      "No articles were collected for this entity — the intelligence picture is empty.",
    );
    return gaps;
  }

  const n = processedArticles.length;

  // Article volume.
  if (n < 5) {
    gaps.push(
      `Article volume is low (${n} article${n === 1 ? "" : "s"}) — increase collection breadth to reduce sampling bias.`,
    );
  }

  // Source diversity.
  const sources = new Set(
    processedArticles
      .map((pa) => pa.article?.source)
      .filter((s): s is string => Boolean(s)),
  );
  if (sources.size < 3) {
    gaps.push(
      `Source diversity is limited (${sources.size} unique source${sources.size === 1 ? "" : "s"}) — risk of single-source bias.`,
    );
  }

  // Sentiment confidence.
  const lowConfCount = processedArticles.filter(
    (pa) => (pa.sentiment?.confidence ?? 0) < 0.5,
  ).length;
  if (lowConfCount > n / 2) {
    gaps.push(
      `${lowConfCount} of ${n} articles have low sentiment confidence (<0.5) — verification required.`,
    );
  }

  // Missing summaries.
  const noSummaryCount = processedArticles.filter(
    (pa) => !pa.summary?.summary || pa.summary.summary.trim().length === 0,
  ).length;
  if (noSummaryCount > 0) {
    gaps.push(
      `${noSummaryCount} article${noSummaryCount === 1 ? "" : "s"} lack${noSummaryCount === 1 ? "s" : ""} proper summarization — content extraction may have failed.`,
    );
  }

  // Missing entities.
  const noEntitiesCount = processedArticles.filter(
    (pa) => !pa.entities?.entities || pa.entities.entities.length === 0,
  ).length;
  if (noEntitiesCount > n / 3) {
    gaps.push(
      `${noEntitiesCount} of ${n} articles have no extracted entities — the NER pipeline may need attention.`,
    );
  }

  // Missing topics.
  const noTopicsCount = processedArticles.filter(
    (pa) => !pa.topics?.topics || pa.topics.topics.length === 0,
  ).length;
  if (noTopicsCount > 0) {
    gaps.push(
      `${noTopicsCount} article${noTopicsCount === 1 ? "" : "s"} have no classified topics — the topic model may have failed.`,
    );
  }

  // Processing errors.
  const withErrorsCount = processedArticles.filter(
    (pa) => pa.errors && pa.errors.length > 0,
  ).length;
  if (withErrorsCount > 0) {
    gaps.push(
      `${withErrorsCount} article${withErrorsCount === 1 ? "" : "s"} had processing errors — partial data may be unreliable.`,
    );
  }

  // All-neutral sentiment (possible model degradation).
  const allNeutral = processedArticles.every(
    (pa) => pa.sentiment?.overall_sentiment === "neutral",
  );
  if (allNeutral && n >= 3) {
    gaps.push(
      "All articles are classified as neutral sentiment — possible NLP model degradation or genuine low-salience coverage.",
    );
  }

  return gaps;
}

// ─── RISK ASSESSMENT BUILDER ──────────────────────────────────────

/**
 * buildRiskAssessment — synthesize a RiskAssessment object from the
 * threat assessment + dossier + processed articles.
 *
 * The dossier's GLM-generated `risk_outlook` provides the narrative.
 * The 7 RiskCategoryScore entries are derived from the overall threat
 * score with category-specific offsets (operational < reputational
 * because we have less direct evidence for it, etc.).
 */
function buildRiskAssessment(
  threatAssessment: CompanyThreatAssessment | null,
  dossier: DossierResult | null,
  processedArticles: ProcessedArticle[],
): RiskAssessment {
  const overall = threatAssessment?.overallScore ?? 30;
  const articleCount = processedArticles.length;

  // Map threat trajectory to risk trend.
  const trajectoryToTrend = (
    t: ThreatTrajectory | undefined,
  ): RiskCategoryScore["trend"] => {
    if (t === "rising") return "deteriorating";
    if (t === "declining") return "improving";
    return "stable";
  };
  const overallTrend = trajectoryToTrend(threatAssessment?.trajectory);

  const categories: RiskCategoryScore[] = [
    {
      category: "reputational",
      score: overall,
      trend: overallTrend,
      rationale: `Aggregated threat score from ${articleCount} article${articleCount === 1 ? "" : "s"}. This is the best-evidenced category (drives the overall score).`,
    },
    {
      category: "operational",
      score: Math.max(0, overall - 15),
      trend: "stable",
      rationale:
        "No specific operational risk indicators detected in current OSINT coverage. Score inferred from overall threat level.",
    },
    {
      category: "financial",
      score: Math.max(0, overall - 20),
      trend: "stable",
      rationale:
        "Financial risk inferred from sentiment; no direct financial filings or stock-price data collected this cycle.",
    },
    {
      category: "regulatory",
      score: Math.max(0, overall - 10),
      trend: "stable",
      rationale:
        "Regulatory risk inferred from topic classification. Verify with BAM / AMMC regulatory filings in the next cycle.",
    },
    {
      category: "cyber",
      score: 20,
      trend: "stable",
      rationale:
        "No cyber-specific indicators in current OSINT corpus. Baseline 20/100 reflects sector-typical exposure.",
    },
    {
      category: "geopolitical",
      score: 15,
      trend: "stable",
      rationale:
        "No geopolitical indicators in current corpus. Baseline 15/100 reflects regional exposure.",
    },
    {
      category: "esg",
      score: 25,
      trend: "stable",
      rationale:
        "ESG risk inferred from sentiment. Conduct a dedicated ESG audit (environmental filings, social media, governance disclosures) for an accurate score.",
    },
  ];

  const narrative =
    dossier?.risk_outlook ||
    `Overall risk level ${threatAssessment?.level ?? "low"} with a ${threatAssessment?.trajectory ?? "stable"} trajectory based on ${articleCount} intelligence source${articleCount === 1 ? "" : "s"}.`;

  return { overall, categories, narrative };
}

// ─── FALLBACK DEFAULTS ────────────────────────────────────────────
// Mirror the orchestrator's defaults so a GLM outage still produces
// a usable (if thinner) dossier. Kept local so this module doesn't
// add to the orchestrator's surface area.

type ThreatTrajectory = "rising" | "stable" | "declining";

function defaultReputation(companyName: string): ReputationResult {
  const emptyPillar = { score: 50, evidence: "No data — GLM call failed." };
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

function defaultNarratives(): NarrativeResult {
  return {
    narratives: [],
    dominant_narrative: "",
    emerging_narratives: [],
  };
}

// V4.1: defaultRecommendations removed — no advisory content in Raw Intelligence mode
function defaultRecommendations(_companyName: string): null {
  return null;
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
    recommendation:
      "Retry AI visibility assessment when GLM is available.",
  };
}
