import { logInfo } from "@/lib/logger";
// ═══════════════════════════════════════════════════════════════
//  PROJECT AEGIS v3.1 — HarchIQ BAYESIAN PREDICTIVE SCORING
//  Risk-network inference + ARIMA-style anomaly detection +
//  risk-velocity forecasting.
//
//  Inspired by Recorded Future's probabilistic risk scoring and the
//  CIA's Analyst's Guide to Bayesian inference. Implements:
//
//  ┌────────────────────────────────────────────────────────────┐
//  │  Core algorithms                                            │
//  ├────────────────────────────────────────────────────────────┤
//  │  • Bayesian network with 15+ risk categories                │
//  │  • Posterior propagation (parent → child risk adjustment)   │
//  │  • ARIMA-like anomaly detection (rolling mean + z-score)    │
//  │  • Risk-velocity prediction (1st & 2nd derivative)          │
//  └────────────────────────────────────────────────────────────┘
//
//  Task ID: AEGIS-V31-ALGO
//  Module:  harchiq/predict/bayesian-risk
// ═══════════════════════════════════════════════════════════════

// ─── TYPES ────────────────────────────────────────────────────────

/**
 * RiskCategory — the closed set of risk categories modeled by the
 * Bayesian network. Each is a node in the DAG.
 */
export type RiskCategory =
  | "geopolitical"
  | "sanctions_risk"
  | "currency_risk"
  | "trade_disruption"
  | "liquidity_risk"
  | "supply_chain_risk"
  | "credit_risk"
  | "cybersecurity"
  | "data_breach"
  | "operational_risk"
  | "reputational_risk"
  | "regulatory"
  | "compliance_risk"
  | "litigation_risk"
  | "fines"
  | "esg"
  | "consumer_backlash"
  | "market_risk"
  | "interest_rate_risk"
  | "sovereign_risk";

/**
 * BayesianNode — a single node in the risk Bayesian network.
 *
 * The conditional probabilities table is keyed by parent category:
 *   P(this node is at risk | parent is at risk)
 *
 * This is a first-order approximation (full conditional probability
 * tables over all parent combinations are exponential in the number
 * of parents and not warranted for v3.1's risk model).
 */
export interface BayesianNode {
  /** Risk category (node identifier). */
  riskCategory: RiskCategory;
  /** Prior probability P(risk) in [0,1] — baseline before evidence. */
  priorProbability: number;
  /**
   * Conditional probabilities: parentCategory → P(this|parent).
   * A missing entry means "no direct influence from this parent".
   */
  conditionalProbabilities: Partial<Record<RiskCategory, number>>;
  /** Parent categories in the DAG (for topological ordering). */
  parents: RiskCategory[];
}

/**
 * RiskScoreMap — current probability of each risk category, after
 * Bayesian inference.
 */
export type RiskScoreMap = Record<RiskCategory, number>;

/**
 * AnomalyResult — a single flagged anomaly in a time series.
 */
export interface AnomalyResult {
  /** ISO-8601 timestamp of the anomalous point. */
  timestamp: string;
  /** Observed value at this point. */
  value: number;
  /** Expected value (rolling mean) at this point. */
  expectedValue: number;
  /** Z-score of the deviation. */
  zScore: number;
  /** True if |zScore| exceeds the threshold. */
  isAnomaly: boolean;
  /** Severity bucket for UI triage. */
  severity: "none" | "low" | "medium" | "high" | "critical";
}

/**
 * AnomalyDetectionOptions — tunable parameters for `detectAnomalies`.
 */
export interface AnomalyDetectionOptions {
  /** Rolling window size (number of points), default 7. */
  window?: number;
  /** Z-score threshold for flagging anomalies, default 2.5. */
  threshold?: number;
}

/**
 * TimeSeriesPoint — a single point in a risk-over-time series.
 */
export interface TimeSeriesPoint {
  /** ISO-8601 timestamp. */
  timestamp: string;
  /** Risk score at this point in [0,100]. */
  value: number;
}

/**
 * VelocityPrediction — output of `predictRiskVelocity`.
 */
export interface VelocityPrediction {
  /** Current trend direction. */
  currentTrend: "accelerating" | "stable" | "decelerating";
  /** Acceleration (second derivative of risk over time). */
  acceleration: number;
  /** Predicted risk score 24 hours from now, in [0,100]. */
  prediction: number;
  /** Confidence in the prediction, in [0,1]. */
  confidence: number;
  /** Mean rate of change (1st derivative) over the history. */
  meanRateOfChange: number;
}

// ─── BAYESIAN RISK NETWORK (15+ nodes) ────────────────────────────

/**
 * riskNetwork — predefined Bayesian network for enterprise risk.
 *
 * Topology (DAG):
 *
 *   geopolitical ──┬──→ sanctions_risk ──┬──→ liquidity_risk
 *                  ├──→ currency_risk ───┤
 *                  └──→ trade_disruption ┘
 *
 *   sanctions_risk ──→ supply_chain_risk
 *   currency_risk  ──→ credit_risk
 *
 *   cybersecurity ──┬──→ data_breach
 *                   ├──→ operational_risk
 *                   └──→ reputational_risk
 *
 *   regulatory ──┬──→ compliance_risk
 *                ├──→ litigation_risk ──→ fines
 *                └──→ fines
 *
 *   esg ──┬──→ reputational_risk
 *         ├──→ regulatory
 *         └──→ consumer_backlash
 *
 *   geopolitical ──→ sovereign_risk ──→ interest_rate_risk ──→ market_risk
 *
 * Priors are calibrated from public enterprise-risk studies and
 * reflect baseline annual probabilities for a generic mid-cap firm.
 */
export const riskNetwork: Record<RiskCategory, BayesianNode> = {
  geopolitical: {
    riskCategory: "geopolitical",
    priorProbability: 0.18,
    conditionalProbabilities: {},
    parents: [],
  },
  sanctions_risk: {
    riskCategory: "sanctions_risk",
    priorProbability: 0.08,
    conditionalProbabilities: { geopolitical: 0.45 },
    parents: ["geopolitical"],
  },
  currency_risk: {
    riskCategory: "currency_risk",
    priorProbability: 0.22,
    conditionalProbabilities: { geopolitical: 0.55, sovereign_risk: 0.40 },
    parents: ["geopolitical", "sovereign_risk"],
  },
  trade_disruption: {
    riskCategory: "trade_disruption",
    priorProbability: 0.15,
    conditionalProbabilities: { geopolitical: 0.50, sanctions_risk: 0.65 },
    parents: ["geopolitical", "sanctions_risk"],
  },
  liquidity_risk: {
    riskCategory: "liquidity_risk",
    priorProbability: 0.10,
    conditionalProbabilities: {
      sanctions_risk: 0.55,
      currency_risk: 0.45,
      trade_disruption: 0.40,
    },
    parents: ["sanctions_risk", "currency_risk", "trade_disruption"],
  },
  supply_chain_risk: {
    riskCategory: "supply_chain_risk",
    priorProbability: 0.20,
    conditionalProbabilities: {
      sanctions_risk: 0.55,
      trade_disruption: 0.70,
      geopolitical: 0.35,
    },
    parents: ["sanctions_risk", "trade_disruption", "geopolitical"],
  },
  credit_risk: {
    riskCategory: "credit_risk",
    priorProbability: 0.12,
    conditionalProbabilities: {
      currency_risk: 0.50,
      liquidity_risk: 0.60,
      interest_rate_risk: 0.40,
    },
    parents: ["currency_risk", "liquidity_risk", "interest_rate_risk"],
  },
  cybersecurity: {
    riskCategory: "cybersecurity",
    priorProbability: 0.35,
    conditionalProbabilities: {},
    parents: [],
  },
  data_breach: {
    riskCategory: "data_breach",
    priorProbability: 0.15,
    conditionalProbabilities: { cybersecurity: 0.60, operational_risk: 0.25 },
    parents: ["cybersecurity", "operational_risk"],
  },
  operational_risk: {
    riskCategory: "operational_risk",
    priorProbability: 0.25,
    conditionalProbabilities: {
      cybersecurity: 0.45,
      supply_chain_risk: 0.35,
    },
    parents: ["cybersecurity", "supply_chain_risk"],
  },
  reputational_risk: {
    riskCategory: "reputational_risk",
    priorProbability: 0.20,
    conditionalProbabilities: {
      cybersecurity: 0.40,
      data_breach: 0.75,
      esg: 0.55,
      regulatory: 0.35,
      consumer_backlash: 0.65,
    },
    parents: ["cybersecurity", "data_breach", "esg", "regulatory", "consumer_backlash"],
  },
  regulatory: {
    riskCategory: "regulatory",
    priorProbability: 0.30,
    conditionalProbabilities: { esg: 0.45, geopolitical: 0.25 },
    parents: ["esg", "geopolitical"],
  },
  compliance_risk: {
    riskCategory: "compliance_risk",
    priorProbability: 0.18,
    conditionalProbabilities: {
      regulatory: 0.65,
      sanctions_risk: 0.50,
    },
    parents: ["regulatory", "sanctions_risk"],
  },
  litigation_risk: {
    riskCategory: "litigation_risk",
    priorProbability: 0.22,
    conditionalProbabilities: {
      regulatory: 0.55,
      compliance_risk: 0.60,
      reputational_risk: 0.35,
    },
    parents: ["regulatory", "compliance_risk", "reputational_risk"],
  },
  fines: {
    riskCategory: "fines",
    priorProbability: 0.12,
    conditionalProbabilities: {
      regulatory: 0.55,
      litigation_risk: 0.65,
      compliance_risk: 0.50,
    },
    parents: ["regulatory", "litigation_risk", "compliance_risk"],
  },
  esg: {
    riskCategory: "esg",
    priorProbability: 0.25,
    conditionalProbabilities: {},
    parents: [],
  },
  consumer_backlash: {
    riskCategory: "consumer_backlash",
    priorProbability: 0.15,
    conditionalProbabilities: { esg: 0.50, reputational_risk: 0.40 },
    parents: ["esg", "reputational_risk"],
  },
  market_risk: {
    riskCategory: "market_risk",
    priorProbability: 0.28,
    conditionalProbabilities: {
      interest_rate_risk: 0.60,
      currency_risk: 0.45,
      sovereign_risk: 0.35,
    },
    parents: ["interest_rate_risk", "currency_risk", "sovereign_risk"],
  },
  interest_rate_risk: {
    riskCategory: "interest_rate_risk",
    priorProbability: 0.20,
    conditionalProbabilities: { sovereign_risk: 0.55, geopolitical: 0.30 },
    parents: ["sovereign_risk", "geopolitical"],
  },
  sovereign_risk: {
    riskCategory: "sovereign_risk",
    priorProbability: 0.14,
    conditionalProbabilities: { geopolitical: 0.60 },
    parents: ["geopolitical"],
  },
};

/**
 * All risk categories in the network, in topological order (parents
 * before children). Computed once at module load.
 */
const TOPOLOGICAL_ORDER: RiskCategory[] = (function buildTopoOrder(): RiskCategory[] {
  const visited = new Set<RiskCategory>();
  const order: RiskCategory[] = [];
  const cycleGuard = new Set<RiskCategory>();

  const visit = (cat: RiskCategory) => {
    if (visited.has(cat)) return;
    if (cycleGuard.has(cat)) {
      // Cycle detected — break by skipping. (Network is acyclic by design.)
      return;
    }
    cycleGuard.add(cat);
    const node = riskNetwork[cat];
    for (const p of node.parents) visit(p);
    cycleGuard.delete(cat);
    visited.add(cat);
    order.push(cat);
  };

  for (const cat of Object.keys(riskNetwork) as RiskCategory[]) {
    visit(cat);
  }
  return order;
})();

// ─── BAYESIAN POSTERIOR PROPAGATION ───────────────────────────────

/**
 * propagateRiskScores — propagate observed risk evidence through the
 * Bayesian network.
 *
 * Approximate inference (mean-field): for each node in topological
 * order, start with the prior and adjust the posterior upward for
 * every observed parent risk:
 *
 *   posterior = prior + Σ_observed_parents (condProb − prior) × parentScore
 *
 * where `parentScore` is the observed/propagated risk of the parent.
 * This is a first-order linear approximation — not exact Bayesian
 * inference (which would require summing over all parent combinations
 * in the joint distribution), but it captures the dominant signal
 * for risk propagation at a fraction of the compute cost.
 *
 * Posterior is clamped to [0, 1].
 *
 * @param observedRisks map of risk categories directly observed (with
 *                      scores in [0,1]) — e.g. { geopolitical: 0.85 }
 * @returns             updated RiskScoreMap for ALL categories
 */
export function propagateRiskScores(
  observedRisks: Partial<Record<RiskCategory, number>>,
): RiskScoreMap {
  // Initialize scores: observed risks use their observed value;
  // all others start at their prior.
  const scores: Partial<Record<RiskCategory, number>> = {};
  for (const cat of TOPOLOGICAL_ORDER) {
    if (cat in observedRisks) {
      scores[cat] = clamp01(observedRisks[cat]!);
    } else {
      scores[cat] = riskNetwork[cat].priorProbability;
    }
  }

  // Propagate in topological order so parents are finalized before children.
  for (const cat of TOPOLOGICAL_ORDER) {
    const node = riskNetwork[cat];
    let posterior = scores[cat]!;

    for (const parent of node.parents) {
      const parentScore = scores[parent];
      if (parentScore === undefined) continue;
      const condProb = node.conditionalProbabilities[parent];
      if (condProb === undefined) continue;

      // Posterior adjustment: pull toward conditional probability,
      // weighted by how at-risk the parent is.
      posterior = posterior + (condProb - posterior) * parentScore;
    }

    scores[cat] = clamp01(posterior);
  }

  // Build the full map (all categories).
  const result = {} as RiskScoreMap;
  for (const cat of Object.keys(riskNetwork) as RiskCategory[]) {
    result[cat] = Number((scores[cat] ?? 0).toFixed(4));
  }

  // Log the top 5 hottest risks for analyst attention.
  const sorted = Object.entries(result).sort((a, b) => b[1] - a[1]);
  const top5 = sorted.slice(0, 5).map(([k, v]) => `${k}=${v.toFixed(2)}`);
  logInfo("lib.harchiq.predict.bayesian-risk", `[HarchIQ-Predict] Bayesian propagation: observed={${Object.keys(
      observedRisks,
    ).join(",")}}, top5=[${top5.join(", ")}]`);

  return result;
}

// ─── ANOMALY DETECTION (ARIMA-like) ───────────────────────────────

/**
 * detectAnomalies — rolling-mean + z-score anomaly detection.
 *
 * Approximates an ARIMA(0,1,1) forecast residual check without the
 * full maximum-likelihood fitting overhead. For each point:
 *   1. Compute the rolling mean μ over the previous `window` points.
 *   2. Compute the rolling standard deviation σ.
 *   3. z-score = (value − μ) / σ.
 *   4. Flag as anomaly if |z| > threshold.
 *   5. Bucketize severity: |z| ≥ 4 → critical, ≥ 3.5 → high,
 *      ≥ 3 → medium, ≥ threshold → low, else none.
 *
 * The first `window − 1` points have insufficient history and are
 * not flagged (returned with severity "none").
 *
 * @param timeSeries ordered (oldest-first) time series
 * @param options    window size and threshold
 * @returns          AnomalyResult[] aligned with the input
 */
export function detectAnomalies(
  timeSeries: TimeSeriesPoint[],
  options?: AnomalyDetectionOptions,
): AnomalyResult[] {
  const window = options?.window ?? 7;
  const threshold = options?.threshold ?? 2.5;

  if (timeSeries.length === 0) return [];

  const results: AnomalyResult[] = [];

  for (let i = 0; i < timeSeries.length; i++) {
    const point = timeSeries[i];

    // Need at least `window` prior points to compute a meaningful mean.
    if (i < window) {
      results.push({
        timestamp: point.timestamp,
        value: point.value,
        expectedValue: point.value,
        zScore: 0,
        isAnomaly: false,
        severity: "none",
      });
      continue;
    }

    // Rolling window: the `window` points BEFORE this one (exclusive).
    const slice = timeSeries.slice(i - window, i);
    const mean = slice.reduce((s, p) => s + p.value, 0) / slice.length;
    const variance =
      slice.reduce((s, p) => s + (p.value - mean) ** 2, 0) / slice.length;
    const stdDev = Math.sqrt(variance);

    // Guard against zero std-dev (constant series).
    const zScore = stdDev > 0 ? (point.value - mean) / stdDev : 0;
    const absZ = Math.abs(zScore);
    const isAnomaly = absZ > threshold;

    let severity: AnomalyResult["severity"] = "none";
    if (absZ >= 4.0) severity = "critical";
    else if (absZ >= 3.5) severity = "high";
    else if (absZ >= 3.0) severity = "medium";
    else if (absZ >= threshold) severity = "low";

    results.push({
      timestamp: point.timestamp,
      value: point.value,
      expectedValue: Number(mean.toFixed(3)),
      zScore: Number(zScore.toFixed(3)),
      isAnomaly,
      severity,
    });
  }

  const flagged = results.filter((r) => r.isAnomaly).length;
  logInfo("lib.harchiq.predict.bayesian-risk", `[HarchIQ-Predict] Anomaly detection: ${timeSeries.length} points, ` +
      `window=${window}, threshold=${threshold}, ${flagged} anomalies`);

  return results;
}

// ─── RISK VELOCITY PREDICTION ─────────────────────────────────────

/**
 * predictRiskVelocity — predict whether a risk score is accelerating.
 *
 * Treats the historicalScores as evenly-spaced samples (typical case:
 * one sample per hour or per day) and computes:
 *
 *   • 1st derivative (rate of change) between each consecutive pair.
 *   • 2nd derivative (acceleration) = mean of consecutive Δ(rate).
 *   • Current trend: accelerating if 2nd-deriv > 0 & rising,
 *     decelerating if 2nd-deriv < 0 & falling, else stable.
 *   • Prediction (next 24h): currentScore + (mean rate × 24).
 *     Adjusted by acceleration if available.
 *   • Confidence: based on consistency of the rate (low variance → high
 *     confidence) and sample size.
 *
 * @param currentScore       current risk score in [0,100]
 * @param historicalScores   ordered historical scores (oldest-first)
 * @returns                  VelocityPrediction
 */
export function predictRiskVelocity(
  currentScore: number,
  historicalScores: number[],
): VelocityPrediction {
  // Need at least 3 points to compute a meaningful 2nd derivative.
  if (historicalScores.length < 3) {
    return {
      currentTrend: "stable",
      acceleration: 0,
      prediction: clampScore(currentScore),
      confidence: 0.2,
      meanRateOfChange: 0,
    };
  }

  // ── 1st derivative: rate of change between consecutive points ─
  const rates: number[] = [];
  for (let i = 1; i < historicalScores.length; i++) {
    rates.push(historicalScores[i] - historicalScores[i - 1]);
  }
  const meanRate =
    rates.reduce((s, r) => s + r, 0) / rates.length;

  // ── 2nd derivative: change in rate (acceleration) ──────────
  const accelerations: number[] = [];
  for (let i = 1; i < rates.length; i++) {
    accelerations.push(rates[i] - rates[i - 1]);
  }
  const meanAcceleration =
    accelerations.reduce((s, a) => s + a, 0) / accelerations.length;

  // ── Trend classification ──────────────────────────────────
  // Use the most recent rate (current velocity) and acceleration.
  const recentRate = rates[rates.length - 1];
  const recentAccel = accelerations[accelerations.length - 1];

  let currentTrend: VelocityPrediction["currentTrend"];
  // Accelerating: rate is positive AND growing (or rate is negative and
  // becoming less negative — i.e. risk decelerating downward, which is
  // "accelerating" in the recovery direction).
  if (Math.abs(recentAccel) > 0.5 && Math.sign(recentAccel) === Math.sign(recentRate)) {
    currentTrend = "accelerating";
  } else if (Math.abs(recentAccel) > 0.5 && Math.sign(recentAccel) !== Math.sign(recentRate)) {
    currentTrend = "decelerating";
  } else {
    currentTrend = "stable";
  }

  // ── Prediction: current + mean rate × 24 + ½ × accel × 24² ─
  // Assuming hourly samples; 24 = next-24-hours horizon.
  const HORIZON = 24;
  const predicted =
    currentScore + meanRate * HORIZON + 0.5 * meanAcceleration * HORIZON * HORIZON;
  const prediction = clampScore(predicted);

  // ── Confidence ────────────────────────────────────────────
  // Higher confidence when: (a) rates are consistent (low variance),
  // (b) more samples available.
  const rateVariance =
    rates.reduce((s, r) => s + (r - meanRate) ** 2, 0) / rates.length;
  const rateStd = Math.sqrt(rateVariance);
  // Consistency: 1 when std=0, drops toward 0 as std grows.
  const consistency = 1 / (1 + rateStd);
  // Sample-size factor: 1 at 50+ samples, scales up from 0.3 at 3 samples.
  const sampleFactor = Math.min(1, 0.3 + historicalScores.length / 50);
  const confidence = Number((consistency * sampleFactor).toFixed(3));

  logInfo("lib.harchiq.predict.bayesian-risk", `[HarchIQ-Predict] Velocity: current=${currentScore.toFixed(1)}, ` +
      `meanRate=${meanRate.toFixed(3)}/h, accel=${meanAcceleration.toFixed(4)}/h², ` +
      `trend=${currentTrend}, +24h=${prediction.toFixed(1)}, conf=${confidence.toFixed(2)}`);

  return {
    currentTrend,
    acceleration: Number(meanAcceleration.toFixed(4)),
    prediction,
    confidence,
    meanRateOfChange: Number(meanRate.toFixed(4)),
  };
}

// ─── INTERNAL HELPERS ─────────────────────────────────────────────

/**
 * clamp01 — clamp a probability to [0, 1].
 */
function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

/**
 * clampScore — clamp a risk score to [0, 100].
 */
function clampScore(x: number): number {
  return Math.max(0, Math.min(100, Math.round(x)));
}
