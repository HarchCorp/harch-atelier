// ═══════════════════════════════════════════════════════════════
//  PROJECT AEGIS v3.0 — HarchIQ PREDICT STAGE
//  Threat scoring & alerting engine.
//
//  The PREDICT stage converts the qualitative signals produced by
//  UNDERSTAND (sentiment, entities, topics) into a quantitative
//  threat score in [0,100] and, when that score crosses a threshold,
//  emits a ThreatAlert that surfaces in the operator dashboard.
//
//  Scoring model (weighted blend of four factors):
//    ┌─────────────────────┬────────┬───────────────────────────────┐
//    │ Factor              │ Weight │ Source                        │
//    ├─────────────────────┼────────┼───────────────────────────────┤
//    │ Sentiment polarity  │  0.30  │ analyzeSentiment().score      │
//    │ Risk severity       │  0.35  │ assessRisks().overall_score   │
//    │ Source authority    │  0.15  │ ArticleEntity.source          │
//    │ Recency             │  0.20  │ ArticleEntity.publishedAt     │
//    └─────────────────────┴────────┴───────────────────────────────┘
//
//  Alert thresholds:
//    score ≥ 70 → severity = critical
//    score ≥ 50 → severity = high
//    score ≥ 30 → severity = medium
//    score <  30 → no alert
//
//  Task ID: AEGIS-V3-ENGINE
//  Module:  harchiq/predict/threat-scoring
// ═══════════════════════════════════════════════════════════════

import { randomUUID } from "crypto";

import type {
  ArticleEntity,
  ThreatAlert,
  AlertEvidence,
  AlertSeverity,
} from "../types";
import type {
  SentimentResult,
  RiskResult,
} from "../../ai/glm-orchestrator";
import type { ProcessedArticle } from "../understand/nlp-pipeline";
import { logInfo } from "@/lib/logger";

// ─── TYPES ────────────────────────────────────────────────────────

/**
 * ThreatFactor — a single weighted contributor to the overall threat
 * score. Exposed so the UI can render a "why this score?" breakdown.
 */
export interface ThreatFactor {
  /** Machine-readable factor name (e.g. "sentiment", "recency"). */
  name: string;
  /** This factor's contribution to the overall score, in [0,100]. */
  contribution: number;
  /** Weight applied to this contribution when blending, in [0,1]. */
  weight: number;
  /** Human-readable explanation of why this factor scored as it did. */
  rationale: string;
}

/**
 * ThreatScore — the per-article scoring result.
 */
export interface ThreatScore {
  /** Overall blended score in [0,100]. Higher = more threatening. */
  overall: number;
  /** Per-factor breakdown (for UI explanation). */
  factors: ThreatFactor[];
  /** ISO-8601 computation timestamp. */
  computedAt: string;
}

/**
 * ThreatLevel — coarse five-tier bucketization of the overall score.
 * Used by `CompanyThreatAssessment.level`.
 */
export type ThreatLevel =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "negligible";

/**
 * ThreatTrajectory — direction of travel since the last assessment.
 * Computed by comparing the average score of older vs newer articles.
 */
export type ThreatTrajectory = "rising" | "stable" | "declining";

/**
 * TopThreat — a single highest-scoring article, with its score, for
 * the `topThreats` list in `CompanyThreatAssessment`.
 */
export interface TopThreat {
  /** The article that triggered the threat. */
  article: ArticleEntity;
  /** The computed threat score for this article. */
  score: ThreatScore;
}

/**
 * CompanyThreatAssessment — aggregate threat picture across all of a
 * company's processed articles. Returned by `assessCompanyThreatLevel`.
 */
export interface CompanyThreatAssessment {
  /** Company name (derived from most-mentioned ORG entity). */
  companyName: string;
  /** Mean threat score across all articles, in [0,100]. */
  overallScore: number;
  /** Coarse level bucketization of `overallScore`. */
  level: ThreatLevel;
  /** Top 3 highest-scoring articles + their scores. */
  topThreats: TopThreat[];
  /** Direction of travel: rising / stable / declining. */
  trajectory: ThreatTrajectory;
  /** ISO-8601 assessment timestamp. */
  assessedAt: string;
  /** Number of articles assessed. */
  articleCount: number;
}

// ─── CONSTANTS ────────────────────────────────────────────────────

/**
 * RELIABLE_SOURCES — set of publisher names (lowercased) that we
 * consider "high authority". Threats from these sources get a higher
 * source-authority contribution because their reporting is more likely
 * to be picked up and amplified.
 *
 * Moroccan press: Medias24, L'Economiste, TelQuel, LesEco
 * International wires: Reuters, AFP, Bloomberg, FT, WSJ
 * Regulators: Bank Al-Maghrib (BAM), AMMC, Bourse de Casablanca
 */
const RELIABLE_SOURCES: ReadonlySet<string> = new Set([
  // Moroccan press
  "medias24",
  "leseco",
  "l'economiste",
  "economiste",
  "telquel",
  "telquel.ma",
  "aujourdhui.ma",
  "lemag.ma",
  // International wires
  "reuters",
  "afp",
  "bloomberg",
  "financial times",
  "ft",
  "wsj",
  "wall street journal",
  "the economist",
  // Regulators
  "bank al-maghrib",
  "bam",
  "ammc",
  "bourse de casablanca",
  "casablanca stock exchange",
]);

/**
 * Severity thresholds — score breakpoints for alert generation.
 */
const SEVERITY_THRESHOLDS = {
  CRITICAL: 70,
  HIGH: 50,
  MEDIUM: 30,
} as const;

/**
 * Trajectory sensitivity — minimum relative change between older and
 * newer half-averages required to call a trajectory "rising" or
 * "declining" instead of "stable".
 */
const TRAJECTORY_SENSITIVITY = 0.1; // ±10% relative

// ─── PER-ARTICLE SCORING ──────────────────────────────────────────

/**
 * scoreThreat — compute a per-article threat score in [0,100] by
 * blending four weighted factors:
 *
 *   1. Sentiment polarity   (weight 0.30)
 *      Negative sentiment → high contribution; positive → low.
 *      SentimentResult.score is expected in [-1, 1] but we clamp
 *      defensively. The contribution is computed as ((1 - score) / 2)
 *      × 100, so score=-1 → 100, score=0 → 50, score=+1 → 0.
 *
 *   2. Risk severity        (weight 0.35)
 *      Uses RiskResult.overall_risk_score directly (0-100). If no
 *      risk data is available, defaults to 25 (low-ish).
 *
 *   3. Source authority     (weight 0.15)
 *      Reliable sources (RELIABLE_SOURCES) → 80; otherwise → 40.
 *
 *   4. Recency              (weight 0.20)
 *      Linear decay: 0 days old → 100; 90 days old → 0.
 *
 * @param article         the article to score
 * @param sentimentResult GLM sentiment result for this article
 * @param riskResult      GLM aggregate risk result (may be null — we
 *                        use a low default contribution in that case)
 * @returns               ThreatScore with overall + factor breakdown
 */
export function scoreThreat(
  article: ArticleEntity,
  sentimentResult: SentimentResult,
  riskResult: RiskResult | null,
): ThreatScore {
  const factors: ThreatFactor[] = [];

  // ── Factor 1: Sentiment polarity ─────────────────────────
  const rawSentScore = sentimentResult.score ?? 0;
  // Clamp to [-1, 1] defensively — GLM occasionally returns out-of-range.
  const sentimentScore = Math.max(-1, Math.min(1, rawSentScore));
  // Map [-1, 1] → [100, 0]: negative sentiment = high threat.
  const sentimentContribution = Math.round(((1 - sentimentScore) / 2) * 100);
  factors.push({
    name: "sentiment",
    contribution: sentimentContribution,
    weight: 0.3,
    rationale: `Sentiment ${sentimentResult.overall_sentiment} (score=${sentimentScore.toFixed(2)}, confidence=${(sentimentResult.confidence ?? 0).toFixed(2)})`,
  });

  // ── Factor 2: Risk severity ──────────────────────────────
  let riskContribution = 25; // sensible low default when no risk data
  let riskRationale = "No risk data — defaulting to 25/100 (low).";
  if (riskResult) {
    const rs = riskResult.overall_risk_score ?? 0;
    riskContribution = Math.max(0, Math.min(100, Math.round(rs)));
    riskRationale = `Overall risk: ${riskResult.overall_risk_level} (score=${riskContribution}, top_risk="${riskResult.top_risk ?? "none"}")`;
  }
  factors.push({
    name: "risk_severity",
    contribution: riskContribution,
    weight: 0.35,
    rationale: riskRationale,
  });

  // ── Factor 3: Source authority ───────────────────────────
  const sourceLower = (article.source || "").toLowerCase().trim();
  const isReliable =
    RELIABLE_SOURCES.has(sourceLower) ||
    Array.from(RELIABLE_SOURCES).some((s) => sourceLower.includes(s));
  const authorityContribution = isReliable ? 80 : 40;
  factors.push({
    name: "source_authority",
    contribution: authorityContribution,
    weight: 0.15,
    rationale: `Source "${article.source || "unknown"}" reliability: ${isReliable ? "high (tier-1)" : "standard"}.`,
  });

  // ── Factor 4: Recency ────────────────────────────────────
  const publishedMs = article.publishedAt
    ? Date.parse(article.publishedAt)
    : Date.now();
  const safePublished = Number.isNaN(publishedMs) ? Date.now() : publishedMs;
  const ageDays = (Date.now() - safePublished) / (1000 * 60 * 60 * 24);
  // Linear decay: 0 days → 100, 90 days → 0, clamped to [0, 100].
  const recencyContribution = Math.max(
    0,
    Math.min(100, Math.round(100 - (ageDays / 90) * 100)),
  );
  factors.push({
    name: "recency",
    contribution: recencyContribution,
    weight: 0.2,
    rationale: `Article age: ${ageDays.toFixed(1)} days → recency contribution ${recencyContribution}/100.`,
  });

  // ── Blend ────────────────────────────────────────────────
  const overall = Math.round(
    factors.reduce((sum, f) => sum + f.contribution * f.weight, 0),
  );

  return {
    overall: Math.max(0, Math.min(100, overall)),
    factors,
    computedAt: new Date().toISOString(),
  };
}

// ─── ALERT GENERATION ─────────────────────────────────────────────

/**
 * generateAlert — emit a `ThreatAlert` when a `ThreatScore` crosses
 * the threshold. Returns `null` if the score is below 30 (no alert).
 *
 * Alert contents:
 *  • severity: critical (≥70), high (≥50), medium (≥30), else none
 *  • threatType: defaults to "reputational" (the most common case
 *    for OSINT-driven alerts). Future versions can infer the type
 *    from the article's topic classification.
 *  • evidence: the article itself (title + URL + a snippet).
 *  • recommendations: 1-2 short mitigation actions scaled to severity.
 *
 * @param companyName the company this alert concerns
 * @param threatScore the per-article threat score
 * @param article     the article that triggered the alert
 * @returns           a ThreatAlert, or null if below threshold
 */
export function generateAlert(
  companyName: string,
  threatScore: ThreatScore,
  article: ArticleEntity,
): ThreatAlert | null {
  const score = threatScore.overall;
  if (score < SEVERITY_THRESHOLDS.MEDIUM) {
    return null; // below threshold — no alert
  }

  let severity: AlertSeverity;
  if (score >= SEVERITY_THRESHOLDS.CRITICAL) {
    severity = "critical";
  } else if (score >= SEVERITY_THRESHOLDS.HIGH) {
    severity = "high";
  } else {
    severity = "medium";
  }

  // Build evidence from the article + the sentiment factor's key phrases.
  const sentimentFactor = threatScore.factors.find(
    (f) => f.name === "sentiment",
  );

  const evidence: AlertEvidence[] = [
    {
      kind: "article",
      refId: article.id,
      snippet: article.title,
      url: article.url,
    },
  ];

  // Add an extra snippet evidence if the article has a non-empty summary.
  if (article.summary && article.summary.trim().length > 0) {
    evidence.push({
      kind: "snippet",
      refId: article.id,
      snippet: article.summary.slice(0, 500),
      url: article.url,
    });
  }

  // Severity-scaled recommendations.
  const recommendations: string[] = [];
  if (severity === "critical") {
    recommendations.push(
      "Activate crisis communications protocol within 24 hours.",
    );
    recommendations.push(
      "Brief the executive committee and prepare a holding statement.",
    );
    recommendations.push(
      "Engage legal counsel to assess disclosure obligations.",
    );
  } else if (severity === "high") {
    recommendations.push(
      "Monitor situation hourly for escalation signals.",
    );
    recommendations.push(
      "Pre-draft a holding statement and brief the spokesdesk.",
    );
  } else {
    recommendations.push(
      "Add to the daily watchlist for continued monitoring.",
    );
    recommendations.push(
      "Cross-reference with the next collection cycle to confirm trajectory.",
    );
  }

  // Title — short headline capped at 120 chars per the ThreatAlert spec.
  const titleBase = `${severity.toUpperCase()} threat — ${article.title}`;
  const title = titleBase.length > 120 ? titleBase.slice(0, 117) + "…" : titleBase;

  // Description — 1-2 paragraphs with the score breakdown.
  const factorSummary = threatScore.factors
    .map((f) => `${f.name}=${f.contribution}`)
    .join(", ");
  const description =
    `Threat score ${score}/100 for ${companyName}, triggered by an article ` +
    `from "${article.source}" published ${article.publishedAt || "unknown date"}. ` +
    `Factor breakdown: ${factorSummary}. ` +
    `${sentimentFactor?.rationale ?? ""}`.trim();

  return {
    id: randomUUID(),
    companyId: companyName,
    threatType: "reputational", // default; future: infer from topics
    severity,
    title,
    description,
    evidence,
    detectedAt: new Date().toISOString(),
    status: "active",
    recommendations,
  };
}

// ─── AGGREGATE ASSESSMENT ─────────────────────────────────────────

/**
 * assessCompanyThreatLevel — aggregate per-article threat scores into
 * a single company-level assessment.
 *
 * Pipeline:
 *  1. Score every ProcessedArticle using its sentiment result + null
 *     risk (risk is computed at corpus level by the orchestrator, not
 *     per-article, so we pass null and use the low default).
 *  2. Compute the mean overall score.
 *  3. Pick the top 3 highest-scoring articles as `topThreats`.
 *  4. Sort articles by date and split into older/newer halves. Compare
 *     mean scores to determine trajectory (rising / stable / declining).
 *  5. Derive `companyName` from the most-mentioned ORGANIZATION entity
 *     across all articles (so the caller doesn't need to pass it).
 *
 * @param processedArticles  the ProcessedArticle[] from UNDERSTAND
 * @returns                  CompanyThreatAssessment (never throws)
 */
export function assessCompanyThreatLevel(
  processedArticles: ProcessedArticle[],
): CompanyThreatAssessment {
  const assessedAt = new Date().toISOString();
  const companyName = deriveCompanyName(processedArticles);

  // Empty input → trivial assessment.
  if (processedArticles.length === 0) {
    return {
      companyName,
      overallScore: 0,
      level: "negligible",
      topThreats: [],
      trajectory: "stable",
      assessedAt,
      articleCount: 0,
    };
  }

  // 1. Score every article.
  const scored = processedArticles.map((pa) => ({
    pa,
    score: scoreThreat(pa.article, pa.sentiment, null),
  }));

  // 2. Mean overall score.
  const overallScore = Math.round(
    scored.reduce((sum, s) => sum + s.score.overall, 0) / scored.length,
  );

  // 3. Top 3 threats (highest scoring).
  const topThreats: TopThreat[] = scored
    .slice()
    .sort((a, b) => b.score.overall - a.score.overall)
    .slice(0, 3)
    .map((s) => ({ article: s.pa.article, score: s.score }));

  // 4. Trajectory — compare older half vs newer half.
  const trajectory = computeTrajectory(scored);

  // 5. Coarse level bucket.
  const level = scoreToLevel(overallScore);

  logInfo("lib.harchiq.predict.threat-scoring", `[HarchIQ-Predict] Company threat assessment: ${companyName} → score=${overallScore}/100, level=${level}, trajectory=${trajectory}, top=${topThreats.length}`);

  return {
    companyName,
    overallScore,
    level,
    topThreats,
    trajectory,
    assessedAt,
    articleCount: processedArticles.length,
  };
}

// ─── INTERNAL HELPERS ─────────────────────────────────────────────

/**
 * deriveCompanyName — pick the most-mentioned ORGANIZATION entity
 * across all processed articles. Falls back to "unknown" if no ORG
 * entities were extracted.
 */
function deriveCompanyName(processedArticles: ProcessedArticle[]): string {
  const orgCounts = new Map<string, number>();
  for (const pa of processedArticles) {
    const ents = pa.entities?.entities ?? [];
    for (const e of ents) {
      if (e.type === "ORGANIZATION") {
        const name = (e.normalized || e.text || "").trim();
        if (!name) continue;
        orgCounts.set(name, (orgCounts.get(name) ?? 0) + 1);
      }
    }
  }

  let best = "";
  let bestCount = 0;
  for (const [name, count] of orgCounts) {
    if (count > bestCount) {
      best = name;
      bestCount = count;
    }
  }
  return best || "unknown";
}

/**
 * computeTrajectory — sort scored articles by published date, split
 * into older and newer halves, compare mean scores.
 *
 * Returns "rising" if the newer half's mean is at least 10% higher,
 * "declining" if at least 10% lower, otherwise "stable".
 */
function computeTrajectory(
  scored: Array<{ pa: ProcessedArticle; score: ThreatScore }>,
): ThreatTrajectory {
  if (scored.length < 2) return "stable";

  // Sort by publishedAt ascending (oldest first).
  const sorted = scored.slice().sort((a, b) => {
    const ta = Date.parse(a.pa.article.publishedAt || "");
    const tb = Date.parse(b.pa.article.publishedAt || "");
    if (Number.isNaN(ta) && Number.isNaN(tb)) return 0;
    if (Number.isNaN(ta)) return 1; // unknown dates go last
    if (Number.isNaN(tb)) return -1;
    return ta - tb;
  });

  const midpoint = Math.floor(sorted.length / 2);
  const older = sorted.slice(0, midpoint);
  const newer = sorted.slice(midpoint);
  // Guard against empty halves (happens when length === 1).
  if (older.length === 0 || newer.length === 0) return "stable";

  const mean = (arr: Array<{ score: ThreatScore }>) =>
    arr.reduce((sum, x) => sum + x.score.overall, 0) / arr.length;

  const olderMean = mean(older);
  const newerMean = mean(newer);

  // If olderMean is ~0, any positive newerMean is "rising".
  if (olderMean === 0) {
    if (newerMean > 5) return "rising";
    return "stable";
  }

  const relativeChange = (newerMean - olderMean) / olderMean;
  if (relativeChange >= TRAJECTORY_SENSITIVITY) return "rising";
  if (relativeChange <= -TRAJECTORY_SENSITIVITY) return "declining";
  return "stable";
}

/**
 * scoreToLevel — bucketize a [0,100] score into a ThreatLevel.
 *
 *   ≥ 70 → critical
 *   ≥ 50 → high
 *   ≥ 30 → medium
 *   ≥ 10 → low
 *   <  10 → negligible
 */
function scoreToLevel(score: number): ThreatLevel {
  if (score >= 70) return "critical";
  if (score >= 50) return "high";
  if (score >= 30) return "medium";
  if (score >= 10) return "low";
  return "negligible";
}
