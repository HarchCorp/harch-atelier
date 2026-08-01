// ═══════════════════════════════════════════════════════════════
//  HARCH CRISIS DETECTOR — anomaly detection over the alert stream
//
//  Computes a real-time "crisis score" (0-100) for a company by
//  comparing the last 24 hours of alerts against the 7-day baseline.
//  Mirrors Dataminr's anomaly-detection signal: surfaces velocity
//  spikes, sentiment drops, source-spread widening, severity
//  escalation, and crisis-keyword clustering.
//
//  Pure function — no DB writes, no side effects. The caller
//  (typically /api/console/crisis) supplies the alerts and the
//  baseline; the detector just runs the math.
//
//  Algorithm:
//   • 5 sub-scores (0-100 each), weighted:
//       velocity     × 0.25   (alerts/hr vs 7-day avg)
//       sentiment    × 0.20   (avg sentiment drop vs baseline)
//       sourceSpread × 0.20   (unique negative sources / 10)
//       severity     × 0.20   (critical share vs recent share)
//       keywords     × 0.15   (crisis keywords in titles)
//   • Final score = weighted sum, clamped 0-100.
//   • Level: 0-30 normal · 31-60 elevated · 61-80 high · 81-100 critical
//
//  Task ID: dataminr-realtime-crisis
// ═══════════════════════════════════════════════════════════════

// ─── Types ─────────────────────────────────────────────────────

export type CrisisLevel = "normal" | "elevated" | "high" | "critical";

export type CrisisFactorKey =
  | "velocity"
  | "sentiment"
  | "sourceSpread"
  | "severity"
  | "keywords";

export interface CrisisFactor {
  key: CrisisFactorKey;
  label: string;
  description: string;
  score: number;          // 0-100 (higher = worse)
  weight: number;         // contribution weight
  raw: Record<string, number | string>;  // metric snapshot
}

export interface CrisisAlert {
  id: string;
  title: string;
  source: string;
  url?: string | null;
  sentimentScore: number | null;
  sentimentLabel?: string | null;
  severity: "critical" | "high" | "medium" | "low";
  publishedAt: Date | null;
}

export interface CrisisDetectorInput {
  recentAlerts: CrisisAlert[];        // last 24h negative articles + high/critical risks
  baselineAlerts: CrisisAlert[];     // 7-day window (excluding last 24h)
  // Optional pre-computed baselines (saves recomputation when the
  // caller already has them). If omitted, computed from baselineAlerts.
  baseline?: {
    avgSentiment?: number;
    alertsPerHour?: number;
    uniqueSources?: number;
    criticalShare?: number;
  };
}

export interface CrisisDetectorResult {
  score: number;                    // 0-100
  level: CrisisLevel;
  factors: CrisisFactor[];
  recommendation: string;
  triggeringAlertIds: string[];     // top alerts that pushed the score up
  computedAt: string;
  inputSize: { recent: number; baseline: number };
}

// ─── Crisis keyword list ───────────────────────────────────────
// Bilingual (EN + FR) — covers financial, regulatory, operational,
// reputational, and ESG crisis signals. Matched case-insensitively
// against alert titles.

export const CRISIS_KEYWORDS: string[] = [
  // English — financial / regulatory
  "scandal", "crisis", "probe", "investigation", "lawsuit", "fraud",
  "arrest", "indictment", "sanction", "embargo", "default", "bankruptcy",
  "explosion", "accident", "strike", "protest", "boycott", "recall",
  "data breach", "cyberattack", "resignation", "fired", "dismissed",
  // English — extensions
  "collapse", "downgrade", "suspend", "halt", "freeze", "fine",
  "violat", "breach", "corrupt", "embezzlement", "money laundering",
  "insolvency", "liquidat", "restructur", "layoff", "shutdown",
  // French — financial / regulatory
  "scandale", "crise", "enquête", "fraude", "faillite", "grève",
  "manifestation", "boycott", "rappel", "démission",
  // French — extensions
  "déclassement", "suspend", "infraction", "corruption", "détournement",
  "blanchiment", "insolvabilité", "licenciement", "fermeture",
  "amende", "poursuite", "inculp", "arrestation", "démission",
];

// ─── Helpers ───────────────────────────────────────────────────

const HOURS_RECENT = 24;
const HOURS_BASELINE = 7 * 24 - HOURS_RECENT; // 7-day window minus the recent 24h

function clamp(v: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, v));
}

function avgSentiment(alerts: CrisisAlert[]): number | null {
  const withScore = alerts.filter((a) => typeof a.sentimentScore === "number");
  if (withScore.length === 0) return null;
  return withScore.reduce((s, a) => s + (a.sentimentScore as number), 0) / withScore.length;
}

function uniqueSources(alerts: CrisisAlert[]): number {
  return new Set(alerts.map((a) => a.source.toLowerCase().trim()).filter(Boolean)).size;
}

function alertsPerHour(alerts: CrisisAlert[], hours: number): number {
  if (hours <= 0) return 0;
  return alerts.length / hours;
}

function criticalShare(alerts: CrisisAlert[]): number {
  if (alerts.length === 0) return 0;
  return alerts.filter((a) => a.severity === "critical").length / alerts.length;
}

function keywordHits(alerts: CrisisAlert[]): { count: number; matchedKeywords: Set<string> } {
  const lower = CRISIS_KEYWORDS.map((k) => k.toLowerCase());
  const matched = new Set<string>();
  let count = 0;
  for (const a of alerts) {
    const t = (a.title ?? "").toLowerCase();
    for (const k of lower) {
      if (t.includes(k)) {
        matched.add(k);
        count++;
        break; // one hit per alert is enough
      }
    }
  }
  return { count, matchedKeywords: matched };
}

// ─── Level mapping ─────────────────────────────────────────────

export function scoreToLevel(score: number): CrisisLevel {
  if (score >= 81) return "critical";
  if (score >= 61) return "high";
  if (score >= 31) return "elevated";
  return "normal";
}

export function levelColor(level: CrisisLevel): {
  bg: string;
  text: string;
  border: string;
  label: string;
} {
  switch (level) {
    case "critical":
      return {
        bg: "#fef2f2",
        text: "#991b1b",
        border: "#dc2626",
        label: "Critical",
      };
    case "high":
      return {
        bg: "#fef2f2",
        text: "#b91c1c",
        border: "#ef4444",
        label: "High",
      };
    case "elevated":
      return {
        bg: "#fffbeb",
        text: "#b45309",
        border: "#f59e0b",
        label: "Elevated",
      };
    case "normal":
    default:
      return {
        bg: "#ecfdf5",
        text: "#047857",
        border: "#10b981",
        label: "Normal",
      };
  }
}

// ─── Recommendation generator ──────────────────────────────────

function buildRecommendation(
  level: CrisisLevel,
  factors: CrisisFactor[],
  recentCount: number,
): string {
  if (level === "normal") {
    return recentCount === 0
      ? "No crisis signals detected in the last 24 hours. Continue routine monitoring."
      : "Alert volume is within the 7-day baseline. Monitor for sudden velocity changes.";
  }

  const top = [...factors].sort((a, b) => b.score - a.score).slice(0, 2);
  const drivers = top.map((f) => f.label.toLowerCase()).join(" and ");

  if (level === "critical") {
    return `Activate crisis protocol now. Primary drivers: ${drivers}. Notify Comms, Legal, and the executive committee within 15 minutes. Issue a holding statement within the hour.`;
  }
  if (level === "high") {
    return `Escalate to the crisis lead. Primary drivers: ${drivers}. Prepare a holding statement and draft Q&A. Brief the executive team within 2 hours.`;
  }
  // elevated
  return `Increase monitoring cadence to 15-minute checks. Watch for ${drivers} to escalate. Pre-draft a holding statement for rapid release if the score rises above 60.`;
}

// ─── Main detector ─────────────────────────────────────────────

export function detectCrisis(input: CrisisDetectorInput): CrisisDetectorResult {
  const { recentAlerts, baselineAlerts } = input;

  // Baseline metrics (pre-computed or derived from baselineAlerts)
  const baselineAvgSentiment =
    input.baseline?.avgSentiment ?? avgSentiment(baselineAlerts) ?? 0;
  const baselinePerHour =
    input.baseline?.alertsPerHour ?? alertsPerHour(baselineAlerts, HOURS_BASELINE);
  const baselineUniqueSources = input.baseline?.uniqueSources ?? uniqueSources(baselineAlerts);
  const baselineCriticalShare =
    input.baseline?.criticalShare ?? criticalShare(baselineAlerts);

  // Recent metrics
  const recentCount = recentAlerts.length;
  const recentPerHour = alertsPerHour(recentAlerts, HOURS_RECENT);
  const recentAvgSentiment = avgSentiment(recentAlerts) ?? baselineAvgSentiment;
  const recentUniqueSources = uniqueSources(recentAlerts);
  const recentCriticalShare = criticalShare(recentAlerts);
  const keywordScan = keywordHits(recentAlerts);

  // ─── Factor 1: velocity (alerts/hr vs baseline) ────────────
  // A 3x spike scores ~70; a 5x spike scores ~90.
  let velocityScore: number;
  if (baselinePerHour <= 0) {
    velocityScore = recentCount > 0 ? 60 : 0;
  } else {
    const ratio = recentPerHour / baselinePerHour;
    // Map ratio to 0-100: ratio 1 → 20, ratio 2 → 45, ratio 3 → 70, ratio 5 → 90
    velocityScore = clamp(20 + (ratio - 1) * 25);
  }
  if (recentCount === 0) velocityScore = 0;

  const velocityFactor: CrisisFactor = {
    key: "velocity",
    label: "Alert Velocity",
    description: `${recentPerHour.toFixed(2)} alerts/hr vs ${baselinePerHour.toFixed(2)} baseline (7d)`,
    score: Math.round(velocityScore),
    weight: 0.25,
    raw: {
      recentPerHour: Number(recentPerHour.toFixed(3)),
      baselinePerHour: Number(baselinePerHour.toFixed(3)),
      ratio: baselinePerHour > 0 ? Number((recentPerHour / baselinePerHour).toFixed(2)) : 0,
      recentCount,
    },
  };

  // ─── Factor 2: sentiment drop ───────────────────────────────
  // 0 baseline drop → score 0; 0.3 drop → ~60; 0.6+ drop → 90+
  const sentimentDrop = Math.max(0, baselineAvgSentiment - recentAvgSentiment);
  // Map drop (0..0.6) to 0..90
  const sentimentScore = clamp(sentimentDrop * 150);
  const sentimentFactor: CrisisFactor = {
    key: "sentiment",
    label: "Sentiment Drop",
    description: `avg ${recentAvgSentiment.toFixed(2)} vs baseline ${baselineAvgSentiment.toFixed(2)} (Δ ${sentimentDrop.toFixed(2)})`,
    score: Math.round(sentimentScore),
    weight: 0.20,
    raw: {
      recentAvg: Number(recentAvgSentiment.toFixed(3)),
      baselineAvg: Number(baselineAvgSentiment.toFixed(3)),
      drop: Number(sentimentDrop.toFixed(3)),
    },
  };

  // ─── Factor 3: source spread ────────────────────────────────
  // 1 source → 10; 3 sources → 30; 5+ sources → 60+; 10+ → 100
  const spreadScore = clamp(recentUniqueSources * 10);
  const sourceSpreadFactor: CrisisFactor = {
    key: "sourceSpread",
    label: "Source Spread",
    description: `${recentUniqueSources} unique sources reporting negatively (baseline ${baselineUniqueSources})`,
    score: Math.round(spreadScore),
    weight: 0.20,
    raw: {
      recentSources: recentUniqueSources,
      baselineSources: baselineUniqueSources,
    },
  };

  // ─── Factor 4: severity escalation ──────────────────────────
  // Compare critical-share now vs baseline. A 30-point jump → ~70.
  const severityDelta = (recentCriticalShare - baselineCriticalShare) * 100;
  // Map delta (-100..100) to 0..100 with 50 = neutral
  const severityScore = clamp(50 + severityDelta * 0.7);
  const severityFactor: CrisisFactor = {
    key: "severity",
    label: "Severity Escalation",
    description: `${Math.round(recentCriticalShare * 100)}% critical now vs ${Math.round(baselineCriticalShare * 100)}% baseline`,
    score: Math.round(severityScore),
    weight: 0.20,
    raw: {
      recentCriticalShare: Number((recentCriticalShare * 100).toFixed(1)),
      baselineCriticalShare: Number((baselineCriticalShare * 100).toFixed(1)),
      delta: Number(severityDelta.toFixed(1)),
    },
  };

  // ─── Factor 5: keyword clustering ───────────────────────────
  // 0 hits → 0; 1 hit → 30; 3 hits → 60; 5+ hits → 90+
  const kwCount = keywordScan.count;
  const kwScore = kwCount === 0 ? 0 : clamp(20 + kwCount * 18);
  const keywordsFactor: CrisisFactor = {
    key: "keywords",
    label: "Crisis Keywords",
    description: `${kwCount} alerts with crisis keywords (${[...keywordScan.matchedKeywords].slice(0, 3).join(", ")}${keywordScan.matchedKeywords.size > 3 ? "…" : ""})`,
    score: Math.round(kwScore),
    weight: 0.15,
    raw: {
      matchedAlerts: kwCount,
      uniqueKeywords: keywordScan.matchedKeywords.size,
      keywords: [...keywordScan.matchedKeywords].slice(0, 8).join("|"),
    },
  };

  const factors = [
    velocityFactor,
    sentimentFactor,
    sourceSpreadFactor,
    severityFactor,
    keywordsFactor,
  ];

  // Weighted sum
  const rawScore = factors.reduce((sum, f) => sum + f.score * f.weight, 0);
  const score = Math.round(clamp(rawScore));
  const level = scoreToLevel(score);

  // Triggering alerts — top 5 by severity then by sentimentScore (most negative first)
  const sevRank: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
  const triggering = [...recentAlerts]
    .sort((a, b) => {
      const sd = (sevRank[b.severity] ?? 0) - (sevRank[a.severity] ?? 0);
      if (sd !== 0) return sd;
      return (a.sentimentScore ?? 0) - (b.sentimentScore ?? 0);
    })
    .slice(0, 5);

  const recommendation = buildRecommendation(level, factors, recentCount);

  return {
    score,
    level,
    factors,
    recommendation,
    triggeringAlertIds: triggering.map((a) => a.id),
    computedAt: new Date().toISOString(),
    inputSize: { recent: recentCount, baseline: baselineAlerts.length },
  };
}

// ─── Convenience: build a CrisisAlert from a Prisma Article row ─
// Keeps the detector pure (no Prisma import).

export function articleToCrisisAlert(a: {
  id: string;
  title: string;
  source: string;
  url: string | null;
  sentimentScore: number | null;
  sentimentLabel: string | null;
  publishedAt: Date | null;
}): CrisisAlert {
  const score = a.sentimentScore ?? 0;
  const severity: CrisisAlert["severity"] =
    score < -0.6 ? "critical" : score < -0.3 ? "high" : "medium";
  return {
    id: a.id,
    title: a.title,
    source: a.source,
    url: a.url,
    sentimentScore: a.sentimentScore,
    sentimentLabel: a.sentimentLabel,
    severity,
    publishedAt: a.publishedAt,
  };
}
