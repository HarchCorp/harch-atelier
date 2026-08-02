// ════════════════════════════════════════════════════════════════════════════
//  HARCH ATELIER — ANALYTICS & METRICS MODULE
//
//  Production-grade analytics engine for the Harch Atelier reputation
//  intelligence platform. Implements every metric, scoring algorithm,
//  statistical primitive, time-series routine, benchmarking function,
//  cohort / funnel helper, KPI definition, dashboard aggregator, report
//  generator, and export formatter used across the three desks.
//
//  Design principles:
//    - Pure functions where possible (no I/O, no global state).
//    - Every public function is documented, typed, and unit-safe.
//    - All numeric routines guard against NaN / Infinity / empty inputs.
//    - Time-series functions accept both Date and ISO string inputs.
//    - Aggregations use weighted means with sensible defaults.
//    - No external dependencies — only std lib + zero-dep math.
//
//  Sections:
//     1. Statistical primitives (mean, median, stddev, percentile, correlation)
//     2. Time-series helpers (sorting, resampling, smoothing)
//     3. Trend detection (linear regression, slope, derivatives)
//     4. Moving averages (SMA, EMA, WMA, Hull, ZLEMA)
//     5. Anomaly detection (z-score, IQR, seasonal, isolation)
//     6. Sentiment analysis & trend
//     7. Share of voice
//     8. AI visibility scoring
//     9. Risk score aggregation
//    10. Influence score (reach × engagement × authority)
//    11. Velocity metrics (mention velocity, alert velocity)
//    12. Reputation score (composite weighted)
//    13. Benchmarking (peer, sector, watchlist)
//    14. Cohort analysis
//    15. Funnel metrics
//    16. KPI definitions and calculators
//    17. Dashboard aggregation functions
//    18. Report generation helpers
//    19. Export data formatters
//    20. Forecasting helpers (simple, naive, seasonally adjusted)
//    21. Volume & distribution helpers
//    22. Weighted index builders
//    23. Normalization & scaling
//    24. Aggregation helpers
//    25. Utility constants
// ════════════════════════════════════════════════════════════════════════════

import type {
  Percentage,
  UnitInterval,
  NonNegativeInt,
  PositiveInt,
  ISODateString,
  UUID,
  RiskLevel,
  RiskGroup,
  RiskTrajectory,
  MentionSentiment,
  SectorCode,
} from "@/lib/types/platform";

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 0 — Local shared types (avoid circular imports)
// ─────────────────────────────────────────────────────────────────────────────

export interface TimePoint {
  date: Date | ISODateString;
  value: number;
}

export interface WeightedTimePoint extends TimePoint {
  weight: number;
}

export interface SentimentTimePoint extends TimePoint {
  positive: number;
  negative: number;
  neutral: number;
  total: number;
}

export interface MentionCountTimePoint extends TimePoint {
  companyId?: UUID;
  channelId?: string;
  outletId?: UUID;
}

export interface ScoreBreakdown {
  component: string;
  label: string;
  labelFr?: string;
  rawValue: number;
  weight: number;
  weightedValue: number;
  normalizedValue: UnitInterval;
  description?: string;
}

export interface MetricResult<T = number> {
  value: T;
  unit: string;
  formatted: string;
  formattedFr?: string;
  confidence?: UnitInterval;
  sampleSize?: number;
  computedAt: ISODateString;
}

export interface BenchmarkResult {
  subjectId: UUID;
  subjectValue: number;
  peerAverage: number;
  peerMedian: number;
  peerMin: number;
  peerMax: number;
  peerStdDev: number;
  peerCount: number;
  percentileRank: UnitInterval;
  zScore: number;
  deltaFromAverage: number;
  deltaFromMedian: number;
  deltaFromBest: number;
  deltaFromWorst: number;
  outliers: Array<{ id: UUID; value: number; zScore: number }>;
}

export interface TrendAnalysisResult {
  slope: number;
  intercept: number;
  rSquared: UnitInterval;
  r: number;
  pValue: number | null;
  standardError: number;
  trend: RiskTrajectory;
  confidence: UnitInterval;
  sampleSize: number;
  forecastNext: number;
  forecastUpper: number;
  forecastLower: number;
  changePercent: number;
  changeAbsolute: number;
}

export interface AnomalyResult {
  date: Date | ISODateString;
  value: number;
  expected: number;
  deviation: number;
  zScore: number;
  severity: "low" | "medium" | "high" | "critical";
  isAnomaly: boolean;
  description: string;
}

export interface SeasonalityResult {
  period: number;
  strength: UnitInterval;
  peaks: Array<{ index: number; value: number }>;
  troughs: Array<{ index: number; value: number }>;
  seasonalComponent: number[];
  trendComponent: number[];
  residualComponent: number[];
}

export interface CohortBucket {
  cohortKey: string;
  cohortDate: Date | ISODateString;
  cohortSize: number;
  periods: Array<{
    periodIndex: number;
    periodLabel: string;
    active: number;
    retentionRate: UnitInterval;
    churnRate: UnitInterval;
    revenue: number | null;
    engagement: number | null;
  }>;
  lifetimeValue: number | null;
  averageLifetime: number | null;
}

export interface FunnelStage {
  stageIndex: number;
  stageName: string;
  stageNameFr?: string;
  entered: number;
  completed: number;
  droppedOff: number;
  conversionRate: UnitInterval;
  cumulativeConversion: UnitInterval;
  dropOffRate: UnitInterval;
  averageTimeSpentSec: number | null;
  medianTimeSpentSec: number | null;
}

export interface KpiDefinition {
  id: string;
  name: string;
  nameFr?: string;
  description: string;
  descriptionFr?: string;
  category: "reputation" | "sentiment" | "risk" | "influence" | "share_of_voice" | "ai_visibility" | "velocity" | "growth" | "engagement" | "quality";
  unit: string;
  format: "number" | "percentage" | "currency" | "decimal" | "duration" | "ratio";
  direction: "higher_better" | "lower_better" | "neutral";
  benchmarkType: "sector" | "peer" | "internal" | "external" | "none";
  target?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  formula: string;
  calculator: (inputs: Record<string, unknown>) => number;
  formatter?: (value: number) => string;
}

export interface KpiResult {
  definition: KpiDefinition;
  value: number;
  formatted: string;
  formattedFr?: string;
  unit: string;
  status: "good" | "watch" | "warning" | "critical";
  deltaFromPrevious?: number;
  deltaPercent?: number;
  benchmark?: number;
  benchmarkDelta?: number;
  trend?: RiskTrajectory;
  confidence?: UnitInterval;
  sampleSize?: number;
  computedAt: ISODateString;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — STATISTICAL PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute the arithmetic mean of a numeric array.
 * Returns 0 for empty arrays; returns NaN if any element is NaN.
 */
export function mean(values: number[]): number {
  if (!Array.isArray(values) || values.length === 0) return 0;
  let sum = 0;
  let count = 0;
  for (const v of values) {
    if (typeof v === "number" && !Number.isNaN(v) && Number.isFinite(v)) {
      sum += v;
      count++;
    }
  }
  return count > 0 ? sum / count : 0;
}

/** Truncated mean — discards the lowest and highest `trimFraction` of values. */
export function truncatedMean(values: number[], trimFraction: UnitInterval = 0.1): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const trimCount = Math.floor(sorted.length * trimFraction);
  if (trimCount * 2 >= sorted.length) return mean(sorted);
  return mean(sorted.slice(trimCount, sorted.length - trimCount));
}

/** Winsorized mean — replaces outliers with the nearest non-outlier value. */
export function winsorizedMean(values: number[], limits: [UnitInterval, UnitInterval] = [0.05, 0.05]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const lowerIdx = Math.floor(sorted.length * limits[0]);
  const upperIdx = Math.ceil(sorted.length * (1 - limits[1])) - 1;
  const lower = sorted[Math.max(0, lowerIdx)];
  const upper = sorted[Math.min(sorted.length - 1, upperIdx)];
  const winsorized = sorted.map(v => Math.max(lower, Math.min(upper, v)));
  return mean(winsorized);
}

/** Geometric mean — useful for growth rates and ratios. */
export function geometricMean(values: number[]): number {
  if (values.length === 0) return 0;
  let product = 1;
  let count = 0;
  for (const v of values) {
    if (typeof v === "number" && v > 0 && Number.isFinite(v)) {
      product *= v;
      count++;
    }
  }
  return count > 0 ? Math.pow(product, 1 / count) : 0;
}

/** Harmonic mean — useful for rates and averages of rates. */
export function harmonicMean(values: number[]): number {
  if (values.length === 0) return 0;
  let sum = 0;
  let count = 0;
  for (const v of values) {
    if (typeof v === "number" && v !== 0 && Number.isFinite(v)) {
      sum += 1 / v;
      count++;
    }
  }
  return count > 0 ? count / sum : 0;
}

/** Compute the median (50th percentile). */
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/** Compute the mode(s) — returns all values with the highest frequency. */
export function mode(values: number[]): number[] {
  if (values.length === 0) return [];
  const freq = new Map<number, number>();
  let maxFreq = 0;
  for (const v of values) {
    const f = (freq.get(v) ?? 0) + 1;
    freq.set(v, f);
    if (f > maxFreq) maxFreq = f;
  }
  if (maxFreq <= 1) return [];
  const modes: number[] = [];
  for (const [v, f] of freq.entries()) {
    if (f === maxFreq) modes.push(v);
  }
  return modes.sort((a, b) => a - b);
}

/** Population variance. */
export function variance(values: number[], population = false): number {
  if (values.length === 0) return 0;
  const m = mean(values);
  const denom = population ? values.length : values.length - 1;
  if (denom <= 0) return 0;
  let sum = 0;
  for (const v of values) {
    const d = v - m;
    sum += d * d;
  }
  return sum / denom;
}

/** Sample variance (Bessel's correction). */
export function sampleVariance(values: number[]): number {
  return variance(values, false);
}

/** Population variance. */
export function populationVariance(values: number[]): number {
  return variance(values, true);
}

/** Standard deviation (sample by default, population if requested). */
export function standardDeviation(values: number[], population = false): number {
  return Math.sqrt(variance(values, population));
}

/** Sample standard deviation. */
export function sampleStdDev(values: number[]): number {
  return standardDeviation(values, false);
}

/** Population standard deviation. */
export function populationStdDev(values: number[]): number {
  return standardDeviation(values, true);
}

/** Mean absolute deviation (robust to outliers). */
export function meanAbsoluteDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const m = mean(values);
  let sum = 0;
  let count = 0;
  for (const v of values) {
    if (typeof v === "number" && Number.isFinite(v)) {
      sum += Math.abs(v - m);
      count++;
    }
  }
  return count > 0 ? sum / count : 0;
}

/** Median absolute deviation (very robust). */
export function medianAbsoluteDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const med = median(values);
  const deviations = values.map(v => Math.abs(v - med));
  return median(deviations);
}

/** Compute the p-th percentile (0..100) using linear interpolation. */
export function percentile(values: number[], p: Percentage): number {
  if (values.length === 0) return 0;
  if (p <= 0) return Math.min(...values);
  if (p >= 100) return Math.max(...values);
  const sorted = [...values].sort((a, b) => a - b);
  const rank = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(rank);
  const upper = Math.ceil(rank);
  if (lower === upper) return sorted[lower];
  const weight = rank - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/** Quartile 1 (25th percentile). */
export function quartile1(values: number[]): number {
  return percentile(values, 25);
}

/** Quartile 3 (75th percentile). */
export function quartile3(values: number[]): number {
  return percentile(values, 75);
}

/** Interquartile range (Q3 - Q1). */
export function interquartileRange(values: number[]): number {
  return quartile3(values) - quartile1(values);
}

/** Compute percentiles for an array of percentile values. */
export function percentiles(values: number[], ps: Percentage[]): number[] {
  return ps.map(p => percentile(values, p));
}

/** Compute the five-number summary: min, Q1, median, Q3, max. */
export function fiveNumberSummary(values: number[]): {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  iqr: number;
  range: number;
} {
  if (values.length === 0) {
    return { min: 0, q1: 0, median: 0, q3: 0, max: 0, iqr: 0, range: 0 };
  }
  const q1 = quartile1(values);
  const q3 = quartile3(values);
  return {
    min: Math.min(...values),
    q1,
    median: median(values),
    q3,
    max: Math.max(...values),
    iqr: q3 - q1,
    range: Math.max(...values) - Math.min(...values),
  };
}

/** Covariance between two arrays. */
export function covariance(a: number[], b: number[], population = false): number {
  if (a.length !== b.length || a.length === 0) return 0;
  const meanA = mean(a);
  const meanB = mean(b);
  const denom = population ? a.length : a.length - 1;
  if (denom <= 0) return 0;
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += (a[i] - meanA) * (b[i] - meanB);
  }
  return sum / denom;
}

/** Pearson correlation coefficient (-1..1). */
export function correlation(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length < 2) return 0;
  const meanA = mean(a);
  const meanB = mean(b);
  let numerator = 0;
  let sumSqA = 0;
  let sumSqB = 0;
  for (let i = 0; i < a.length; i++) {
    const dA = a[i] - meanA;
    const dB = b[i] - meanB;
    numerator += dA * dB;
    sumSqA += dA * dA;
    sumSqB += dB * dB;
  }
  const denominator = Math.sqrt(sumSqA * sumSqB);
  return denominator === 0 ? 0 : numerator / denominator;
}

/** Spearman rank correlation. */
export function spearmanCorrelation(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length < 2) return 0;
  const rankA = rankArray(a);
  const rankB = rankArray(b);
  return correlation(rankA, rankB);
}

/** Kendall's tau rank correlation. */
export function kendallTau(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length < 2) return 0;
  const n = a.length;
  let concordant = 0;
  let discordant = 0;
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const aDiff = a[j] - a[i];
      const bDiff = b[j] - b[i];
      const sign = Math.sign(aDiff) * Math.sign(bDiff);
      if (sign > 0) concordant++;
      else if (sign < 0) discordant++;
    }
  }
  const total = (n * (n - 1)) / 2;
  return total === 0 ? 0 : (concordant - discordant) / total;
}

/** Rank array — average rank for ties. */
export function rankArray(values: number[]): number[] {
  const sorted = [...values]
    .map((v, i) => ({ v, i }))
    .sort((a, b) => a.v - b.v);
  const ranks = new Array(values.length).fill(0);
  let i = 0;
  while (i < sorted.length) {
    let j = i;
    while (j < sorted.length - 1 && sorted[j + 1].v === sorted[i].v) j++;
    const avgRank = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) ranks[sorted[k].i] = avgRank;
    i = j + 1;
  }
  return ranks;
}

/** Skewness (Fisher-Pearson). */
export function skewness(values: number[]): number {
  if (values.length < 3) return 0;
  const m = mean(values);
  const sd = sampleStdDev(values);
  if (sd === 0) return 0;
  let sum = 0;
  for (const v of values) {
    sum += Math.pow((v - m) / sd, 3);
  }
  return (sum / values.length) * Math.sqrt(values.length * (values.length - 1)) / (values.length - 2);
}

/** Excess kurtosis. */
export function kurtosis(values: number[]): number {
  if (values.length < 4) return 0;
  const m = mean(values);
  const sd = sampleStdDev(values);
  if (sd === 0) return 0;
  let sum = 0;
  for (const v of values) {
    sum += Math.pow((v - m) / sd, 4);
  }
  const n = values.length;
  const factor = (n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3));
  const correction = (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3));
  return factor * sum - correction;
}

/** Compute the z-score for a value given a population. */
export function zScore(value: number, values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const sd = sampleStdDev(values);
  return sd === 0 ? 0 : (value - m) / sd;
}

/** Compute the modified z-score using median absolute deviation. */
export function modifiedZScore(value: number, values: number[]): number {
  if (values.length < 2) return 0;
  const med = median(values);
  const mad = medianAbsoluteDeviation(values);
  return mad === 0 ? 0 : 0.6745 * (value - med) / mad;
}

/** Sum helper that ignores NaN/Infinity. */
export function sum(values: number[]): number {
  let s = 0;
  for (const v of values) {
    if (typeof v === "number" && Number.isFinite(v)) s += v;
  }
  return s;
}

/** Min helper. */
export function min(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.min(...values.filter(v => typeof v === "number" && Number.isFinite(v)));
}

/** Max helper. */
export function max(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.max(...values.filter(v => typeof v === "number" && Number.isFinite(v)));
}

/** Range (max - min). */
export function range(values: number[]): number {
  return max(values) - min(values);
}

/** Coefficient of variation (stddev / mean). */
export function coefficientOfVariation(values: number[]): number {
  const m = mean(values);
  if (m === 0) return 0;
  return sampleStdDev(values) / m;
}

/** Weighted mean where each value has a weight. */
export function weightedMean(values: number[], weights: number[]): number {
  if (values.length === 0 || values.length !== weights.length) return 0;
  let sumWeighted = 0;
  let sumWeights = 0;
  for (let i = 0; i < values.length; i++) {
    if (typeof values[i] === "number" && typeof weights[i] === "number"
      && Number.isFinite(values[i]) && Number.isFinite(weights[i])) {
      sumWeighted += values[i] * weights[i];
      sumWeights += weights[i];
    }
  }
  return sumWeights > 0 ? sumWeighted / sumWeights : 0;
}

/** Weighted standard deviation. */
export function weightedStdDev(values: number[], weights: number[]): number {
  if (values.length === 0 || values.length !== weights.length) return 0;
  const wm = weightedMean(values, weights);
  let sumWeighted = 0;
  let sumWeights = 0;
  for (let i = 0; i < values.length; i++) {
    if (Number.isFinite(values[i]) && Number.isFinite(weights[i])) {
      sumWeighted += weights[i] * Math.pow(values[i] - wm, 2);
      sumWeights += weights[i];
    }
  }
  return sumWeights > 0 ? Math.sqrt(sumWeighted / sumWeights) : 0;
}

/** Weighted median. */
export function weightedMedian(values: number[], weights: number[]): number {
  if (values.length === 0 || values.length !== weights.length) return 0;
  const pairs = values
    .map((v, i) => ({ v, w: weights[i] }))
    .filter(p => Number.isFinite(p.v) && Number.isFinite(p.w))
    .sort((a, b) => a.v - b.v);
  if (pairs.length === 0) return 0;
  const totalWeight = pairs.reduce((sum, p) => sum + p.w, 0);
  if (totalWeight <= 0) return 0;
  const halfWeight = totalWeight / 2;
  let cumulative = 0;
  for (const p of pairs) {
    cumulative += p.w;
    if (cumulative >= halfWeight) return p.v;
  }
  return pairs[pairs.length - 1].v;
}

/** Compute the entropy of a discrete distribution. */
export function entropy(probabilities: number[]): number {
  let h = 0;
  for (const p of probabilities) {
    if (p > 0) h -= p * Math.log2(p);
  }
  return h;
}

/** Compute the Gini coefficient (0 = perfect equality, 1 = max inequality). */
export function giniCoefficient(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const sumValues = sum(sorted);
  if (sumValues === 0) return 0;
  let cumulativeSum = 0;
  let weightedSum = 0;
  for (let i = 0; i < n; i++) {
    cumulativeSum += sorted[i];
    weightedSum += (i + 1) * sorted[i];
  }
  return (2 * weightedSum) / (n * cumulativeSum) - (n + 1) / n;
}

/** Compute the Herfindahl-Hirschman Index (concentration). */
export function herfindahlIndex(shares: number[]): number {
  if (shares.length === 0) return 0;
  const total = sum(shares);
  if (total === 0) return 0;
  const normalized = shares.map(s => s / total);
  return sum(normalized.map(s => s * s));
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — TIME-SERIES HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Convert a Date or ISO string to a Date object. */
export function toDate(d: Date | ISODateString): Date {
  return d instanceof Date ? d : new Date(d);
}

/** Convert a Date or ISO string to an ISO string. */
export function toISODate(d: Date | ISODateString): ISODateString {
  return (d instanceof Date ? d.toISOString() : d) as ISODateString;
}

/** Any object that carries a date field. */
export type Dated = { date: Date | ISODateString };

/** Sort time points ascending by date. Returns a new array. */
export function sortByDate<T extends Dated>(points: T[]): T[] {
  return [...points].sort((a, b) => toDate(a.date).getTime() - toDate(b.date).getTime());
}

/** Extract just the values from time points. */
export function extractValues<T extends { value: number }>(points: T[]): number[] {
  return points.map(p => p.value);
}

/** Extract just the dates from time points. */
export function extractDates<T extends Dated>(points: T[]): Date[] {
  return points.map(p => toDate(p.date));
}

/** Resample a time series to a fixed interval (e.g., daily, weekly) using aggregation. */
export function resample<T extends TimePoint>(
  points: T[],
  intervalMs: number,
  aggregator: (values: number[]) => number = mean,
  start?: Date,
  end?: Date,
): TimePoint[] {
  if (points.length === 0) return [];
  const sorted = sortByDate(points);
  const startDate = start ?? toDate(sorted[0].date);
  const endDate = end ?? toDate(sorted[sorted.length - 1].date);
  const result: TimePoint[] = [];
  let currentBucketStart = Math.floor(startDate.getTime() / intervalMs) * intervalMs;
  while (currentBucketStart < endDate.getTime()) {
    const bucketEnd = currentBucketStart + intervalMs;
    const bucketValues = sorted
      .filter(p => {
        const t = toDate(p.date).getTime();
        return t >= currentBucketStart && t < bucketEnd;
      })
      .map(p => p.value);
    if (bucketValues.length > 0) {
      result.push({ date: new Date(currentBucketStart), value: aggregator(bucketValues) });
    } else {
      // forward-fill missing buckets
      const lastValue = result.length > 0 ? result[result.length - 1].value : 0;
      result.push({ date: new Date(currentBucketStart), value: lastValue });
    }
    currentBucketStart = bucketEnd;
  }
  return result;
}

/** Resample to daily intervals. */
export function resampleDaily<T extends TimePoint>(points: T[], aggregator: (values: number[]) => number = mean): TimePoint[] {
  return resample(points, 24 * 60 * 60 * 1000, aggregator);
}

/** Resample to weekly intervals. */
export function resampleWeekly<T extends TimePoint>(points: T[], aggregator: (values: number[]) => number = mean): TimePoint[] {
  return resample(points, 7 * 24 * 60 * 60 * 1000, aggregator);
}

/** Resample to monthly intervals. */
export function resampleMonthly<T extends TimePoint>(points: T[], aggregator: (values: number[]) => number = mean): TimePoint[] {
  if (points.length === 0) return [];
  const sorted = sortByDate(points);
  const buckets = new Map<string, number[]>();
  for (const p of sorted) {
    const d = toDate(p.date);
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(p.value);
  }
  const result: TimePoint[] = [];
  for (const [key, values] of buckets.entries()) {
    const [yearStr, monthStr] = key.split("-");
    const date = new Date(Number(yearStr), Number(monthStr), 1);
    result.push({ date, value: aggregator(values) });
  }
  return sortByDate(result);
}

/** Forward-fill missing values in a series. */
export function forwardFill<T extends TimePoint>(points: T[]): T[] {
  if (points.length === 0) return [];
  const result: T[] = [...points];
  let lastValue = result[0].value;
  for (let i = 0; i < result.length; i++) {
    if (Number.isNaN(result[i].value) || result[i].value === null) {
      result[i] = { ...result[i], value: lastValue };
    } else {
      lastValue = result[i].value;
    }
  }
  return result;
}

/** Backward-fill missing values in a series. */
export function backwardFill<T extends TimePoint>(points: T[]): T[] {
  if (points.length === 0) return [];
  const result: T[] = [...points];
  let lastValue = result[result.length - 1].value;
  for (let i = result.length - 1; i >= 0; i--) {
    if (Number.isNaN(result[i].value) || result[i].value === null) {
      result[i] = { ...result[i], value: lastValue };
    } else {
      lastValue = result[i].value;
    }
  }
  return result;
}

/** Linear interpolation fill for missing values. */
export function linearFill<T extends TimePoint>(points: T[]): T[] {
  if (points.length === 0) return [];
  const result: T[] = [...points];
  for (let i = 0; i < result.length; i++) {
    if (Number.isNaN(result[i].value) || result[i].value === null) {
      let prevIdx = i - 1;
      let nextIdx = i + 1;
      while (prevIdx >= 0 && (Number.isNaN(result[prevIdx].value) || result[prevIdx].value === null)) prevIdx--;
      while (nextIdx < result.length && (Number.isNaN(result[nextIdx].value) || result[nextIdx].value === null)) nextIdx++;
      if (prevIdx >= 0 && nextIdx < result.length) {
        const t = (i - prevIdx) / (nextIdx - prevIdx);
        result[i] = { ...result[i], value: result[prevIdx].value + t * (result[nextIdx].value - result[prevIdx].value) };
      } else if (prevIdx >= 0) {
        result[i] = { ...result[i], value: result[prevIdx].value };
      } else if (nextIdx < result.length) {
        result[i] = { ...result[i], value: result[nextIdx].value };
      }
    }
  }
  return result;
}

/** Difference between consecutive values. */
export function diff(values: number[]): number[] {
  if (values.length < 2) return [];
  const result: number[] = [];
  for (let i = 1; i < values.length; i++) {
    result.push(values[i] - values[i - 1]);
  }
  return result;
}

/** Percentage change between consecutive values. */
export function percentChange(values: number[]): number[] {
  if (values.length < 2) return [];
  const result: number[] = [];
  for (let i = 1; i < values.length; i++) {
    if (values[i - 1] === 0) {
      result.push(values[i] === 0 ? 0 : values[i] > 0 ? Infinity : -Infinity);
    } else {
      result.push((values[i] - values[i - 1]) / Math.abs(values[i - 1]));
    }
  }
  return result;
}

/** Log returns (natural log). */
export function logReturns(values: number[]): number[] {
  if (values.length < 2) return [];
  const result: number[] = [];
  for (let i = 1; i < values.length; i++) {
    if (values[i - 1] <= 0 || values[i] <= 0) {
      result.push(0);
    } else {
      result.push(Math.log(values[i] / values[i - 1]));
    }
  }
  return result;
}

/** Cumulative sum. */
export function cumulativeSum(values: number[]): number[] {
  const result: number[] = [];
  let sum = 0;
  for (const v of values) {
    sum += v;
    result.push(sum);
  }
  return result;
}

/** Cumulative product. */
export function cumulativeProduct(values: number[]): number[] {
  const result: number[] = [];
  let product = 1;
  for (const v of values) {
    product *= v;
    result.push(product);
  }
  return result;
}

/** Cumulative max. */
export function cumulativeMax(values: number[]): number[] {
  const result: number[] = [];
  let currentMax = -Infinity;
  for (const v of values) {
    if (v > currentMax) currentMax = v;
    result.push(currentMax);
  }
  return result;
}

/** Cumulative min. */
export function cumulativeMin(values: number[]): number[] {
  const result: number[] = [];
  let currentMin = Infinity;
  for (const v of values) {
    if (v < currentMin) currentMin = v;
    result.push(currentMin);
  }
  return result;
}

/** Compute rolling window over a series. */
export function rollingWindow<T>(values: T[], windowSize: number): T[][] {
  if (values.length < windowSize || windowSize <= 0) return [];
  const result: T[][] = [];
  for (let i = 0; i <= values.length - windowSize; i++) {
    result.push(values.slice(i, i + windowSize));
  }
  return result;
}

/** Apply a function over a rolling window. */
export function rollingApply<T>(values: T[], windowSize: number, fn: (window: T[]) => number): number[] {
  return rollingWindow(values, windowSize).map(fn);
}

/** Expand a window from 1..n and apply a function. */
export function expandingApply<T>(values: T[], fn: (window: T[]) => number): number[] {
  const result: number[] = [];
  for (let i = 0; i < values.length; i++) {
    result.push(fn(values.slice(0, i + 1)));
  }
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 — TREND DETECTION
// ─────────────────────────────────────────────────────────────────────────────

/** Linear regression (least squares) for a series of values. */
export function linearRegression(values: number[]): {
  slope: number;
  intercept: number;
  rSquared: number;
  r: number;
  standardError: number;
  predictions: number[];
} {
  const n = values.length;
  if (n < 2) {
    return { slope: 0, intercept: values[0] ?? 0, rSquared: 0, r: 0, standardError: 0, predictions: [] };
  }
  const xs = values.map((_, i) => i);
  return linearRegressionXY(xs, values);
}

/** Linear regression with explicit x/y arrays. */
export function linearRegressionXY(xs: number[], ys: number[]): {
  slope: number;
  intercept: number;
  rSquared: number;
  r: number;
  standardError: number;
  predictions: number[];
} {
  const n = xs.length;
  if (n !== ys.length || n < 2) {
    return { slope: 0, intercept: 0, rSquared: 0, r: 0, standardError: 0, predictions: [] };
  }
  const meanX = mean(xs);
  const meanY = mean(ys);
  let sumXY = 0;
  let sumXX = 0;
  let sumYY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    sumXY += dx * dy;
    sumXX += dx * dx;
    sumYY += dy * dy;
  }
  const slope = sumXX === 0 ? 0 : sumXY / sumXX;
  const intercept = meanY - slope * meanX;
  const r = sumXX === 0 || sumYY === 0 ? 0 : sumXY / Math.sqrt(sumXX * sumYY);
  const rSquared = r * r;
  const predictions = xs.map(x => slope * x + intercept);
  let residualSumSquares = 0;
  for (let i = 0; i < n; i++) {
    const residual = ys[i] - predictions[i];
    residualSumSquares += residual * residual;
  }
  const standardError = n > 2 ? Math.sqrt(residualSumSquares / (n - 2)) : 0;
  return { slope, intercept, rSquared, r, standardError, predictions };
}

/** Detect the overall trend direction for a series. */
export function detectTrend(values: number[], threshold = 0.05): RiskTrajectory {
  if (values.length < 2) return "stable";
  const { slope, rSquared } = linearRegression(values);
  const first = values[0];
  const last = values[values.length - 1];
  const changePercent = first === 0 ? 0 : (last - first) / Math.abs(first);
  if (rSquared < 0.1) return "stable";
  if (Math.abs(changePercent) < threshold) return "stable";
  return slope > 0 ? "rising" : "falling";
}

/** Compute first derivative (rate of change) for a series. */
export function firstDerivative(values: number[]): number[] {
  return diff(values);
}

/** Compute second derivative (acceleration) for a series. */
export function secondDerivative(values: number[]): number[] {
  return diff(diff(values));
}

/** Detect inflection points where the second derivative changes sign. */
export function findInflectionPoints(values: number[]): number[] {
  const secondDeriv = secondDerivative(values);
  const points: number[] = [];
  for (let i = 1; i < secondDeriv.length; i++) {
    if (secondDeriv[i - 1] === 0) continue;
    if (Math.sign(secondDeriv[i - 1]) !== Math.sign(secondDeriv[i])) {
      points.push(i);
    }
  }
  return points;
}

/** Detect peaks in a series. */
export function findPeaks(values: number[], options: { minProminence?: number; minDistance?: number } = {}): number[] {
  if (values.length < 3) return [];
  const { minProminence = 0, minDistance = 1 } = options;
  const peaks: Array<{ index: number; prominence: number }> = [];
  for (let i = 1; i < values.length - 1; i++) {
    if (values[i] > values[i - 1] && values[i] > values[i + 1]) {
      let leftMin = values[i];
      for (let j = i - 1; j >= 0; j--) {
        if (values[j] < leftMin) leftMin = values[j];
        if (values[j] > values[i]) break;
      }
      let rightMin = values[i];
      for (let j = i + 1; j < values.length; j++) {
        if (values[j] < rightMin) rightMin = values[j];
        if (values[j] > values[i]) break;
      }
      const prominence = values[i] - Math.max(leftMin, rightMin);
      if (prominence >= minProminence) {
        peaks.push({ index: i, prominence });
      }
    }
  }
  // Apply minimum distance constraint
  peaks.sort((a, b) => b.prominence - a.prominence);
  const selected: number[] = [];
  for (const peak of peaks) {
    if (selected.every(idx => Math.abs(idx - peak.index) >= minDistance)) {
      selected.push(peak.index);
    }
  }
  return selected.sort((a, b) => a - b);
}

/** Detect troughs in a series. */
export function findTroughs(values: number[], options: { minProminence?: number; minDistance?: number } = {}): number[] {
  if (values.length < 3) return [];
  const negated = values.map(v => -v);
  return findPeaks(negated, options);
}

/** Comprehensive trend analysis for a series of values. */
export function analyzeTrend<T extends TimePoint>(points: T[]): TrendAnalysisResult {
  const sorted = sortByDate(points);
  const values = extractValues(sorted);
  const n = values.length;
  if (n < 2) {
    return {
      slope: 0,
      intercept: values[0] ?? 0,
      rSquared: 0,
      r: 0,
      pValue: null,
      standardError: 0,
      trend: "stable",
      confidence: 0,
      sampleSize: n,
      forecastNext: values[0] ?? 0,
      forecastUpper: values[0] ?? 0,
      forecastLower: values[0] ?? 0,
      changePercent: 0,
      changeAbsolute: 0,
    };
  }
  const regression = linearRegression(values);
  const first = values[0];
  const last = values[n - 1];
  const changeAbsolute = last - first;
  const changePercent = first === 0 ? 0 : changeAbsolute / Math.abs(first);
  let trend: RiskTrajectory = "stable";
  if (regression.rSquared >= 0.1) {
    if (Math.abs(changePercent) >= 0.05) {
      trend = regression.slope > 0 ? "rising" : "falling";
    }
  }
  const forecastNext = regression.slope * n + regression.intercept;
  const margin = 1.96 * regression.standardError;
  const confidence = Math.max(0, Math.min(1, regression.rSquared));
  return {
    slope: regression.slope,
    intercept: regression.intercept,
    rSquared: regression.rSquared as UnitInterval,
    r: regression.r,
    pValue: null,
    standardError: regression.standardError,
    trend,
    confidence,
    sampleSize: n,
    forecastNext,
    forecastUpper: forecastNext + margin,
    forecastLower: forecastNext - margin,
    changePercent,
    changeAbsolute,
  };
}

/** Compute the moving average convergence/divergence (MACD). */
export function computeMacd(values: number[], fastPeriod = 12, slowPeriod = 26, signalPeriod = 9): {
  macd: number[];
  signal: number[];
  histogram: number[];
} {
  const fastEma = exponentialMovingAverage(values, fastPeriod);
  const slowEma = exponentialMovingAverage(values, slowPeriod);
  const macd: number[] = [];
  for (let i = 0; i < values.length; i++) {
    const fast = fastEma[i] ?? 0;
    const slow = slowEma[i] ?? 0;
    macd.push(fast - slow);
  }
  const signal = exponentialMovingAverage(macd, signalPeriod);
  const histogram: number[] = [];
  for (let i = 0; i < macd.length; i++) {
    histogram.push(macd[i] - (signal[i] ?? 0));
  }
  return { macd, signal, histogram };
}

/** Compute the Relative Strength Index (RSI). */
export function computeRsi(values: number[], period = 14): number[] {
  if (values.length < period + 1) return new Array(values.length).fill(50);
  const result: number[] = new Array(values.length).fill(50);
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const change = values[i] - values[i - 1];
    if (change > 0) avgGain += change;
    else avgLoss += Math.abs(change);
  }
  avgGain /= period;
  avgLoss /= period;
  result[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  for (let i = period + 1; i < values.length; i++) {
    const change = values[i] - values[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    result[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }
  return result;
}

/** Compute Bollinger Bands. */
export function computeBollingerBands(values: number[], period = 20, multiplier = 2): {
  middle: number[];
  upper: number[];
  lower: number[];
  bandwidth: number[];
  percentB: number[];
} {
  const middle = simpleMovingAverage(values, period);
  const upper: number[] = [];
  const lower: number[] = [];
  const bandwidth: number[] = [];
  const percentB: number[] = [];
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      upper.push(0);
      lower.push(0);
      bandwidth.push(0);
      percentB.push(0.5);
      continue;
    }
    const window = values.slice(i - period + 1, i + 1);
    const sd = sampleStdDev(window);
    upper.push(middle[i] + multiplier * sd);
    lower.push(middle[i] - multiplier * sd);
    bandwidth.push(upper[i] === lower[i] ? 0 : (upper[i] - lower[i]) / middle[i]);
    percentB.push(upper[i] === lower[i] ? 0.5 : (values[i] - lower[i]) / (upper[i] - lower[i]));
  }
  return { middle, upper, lower, bandwidth, percentB };
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4 — MOVING AVERAGES
// ─────────────────────────────────────────────────────────────────────────────

/** Simple Moving Average. */
export function simpleMovingAverage(values: number[], period: number): number[] {
  if (period <= 0) return [...values];
  const result: number[] = new Array(values.length).fill(0);
  let runningSum = 0;
  for (let i = 0; i < values.length; i++) {
    runningSum += values[i];
    if (i >= period) runningSum -= values[i - period];
    if (i >= period - 1) {
      result[i] = runningSum / period;
    } else {
      result[i] = runningSum / (i + 1);
    }
  }
  return result;
}

/** Exponential Moving Average. */
export function exponentialMovingAverage(values: number[], period: number): number[] {
  if (values.length === 0) return [];
  if (period <= 0) return [...values];
  const k = 2 / (period + 1);
  const result: number[] = new Array(values.length).fill(0);
  result[0] = values[0];
  for (let i = 1; i < values.length; i++) {
    result[i] = values[i] * k + result[i - 1] * (1 - k);
  }
  return result;
}

/** Weighted Moving Average (linearly increasing weights). */
export function weightedMovingAverage(values: number[], period: number): number[] {
  if (period <= 0) return [...values];
  const result: number[] = new Array(values.length).fill(0);
  const totalWeight = (period * (period + 1)) / 2;
  for (let i = 0; i < values.length; i++) {
    let sum = 0;
    if (i < period - 1) {
      const actualPeriod = i + 1;
      let actualTotal = 0;
      let actualSum = 0;
      for (let j = 0; j <= i; j++) {
        const w = j + 1;
        actualSum += values[i - j] * w;
        actualTotal += w;
      }
      result[i] = actualTotal === 0 ? 0 : actualSum / actualTotal;
    } else {
      for (let j = 0; j < period; j++) {
        const w = period - j;
        sum += values[i - j] * w;
      }
      result[i] = sum / totalWeight;
    }
  }
  return result;
}

/** Hull Moving Average (smoother, less lag). */
export function hullMovingAverage(values: number[], period: number): number[] {
  if (values.length === 0 || period <= 0) return [...values];
  const halfPeriod = Math.max(1, Math.floor(period / 2));
  const sqrtPeriod = Math.max(1, Math.floor(Math.sqrt(period)));
  const wmaHalf = weightedMovingAverage(values, halfPeriod);
  const wmaFull = weightedMovingAverage(values, period);
  const diff: number[] = values.map((_, i) => 2 * wmaHalf[i] - wmaFull[i]);
  return weightedMovingAverage(diff, sqrtPeriod);
}

/** Zero-Lag Exponential Moving Average. */
export function zeroLagEma(values: number[], period: number): number[] {
  if (values.length === 0) return [];
  const k = 2 / (period + 1);
  const result: number[] = new Array(values.length).fill(0);
  result[0] = values[0];
  for (let i = 1; i < values.length; i++) {
    const lag = Math.max(0, i - period);
    result[i] = k * (2 * values[i] - values[lag]) + (1 - k) * result[i - 1];
  }
  return result;
}

/** Triangular Moving Average (double-smoothed SMA). */
export function triangularMovingAverage(values: number[], period: number): number[] {
  if (period <= 0) return [...values];
  const sma1 = simpleMovingAverage(values, period);
  const halfPeriod = Math.max(1, Math.ceil(period / 2));
  return simpleMovingAverage(sma1, halfPeriod);
}

/** Kaufman Adaptive Moving Average. */
export function kaufmanAdaptiveMovingAverage(values: number[], period: number = 10, fastPeriod: number = 2, slowPeriod: number = 30): number[] {
  if (values.length === 0) return [];
  const result: number[] = new Array(values.length).fill(0);
  result[0] = values[0];
  const fastSC = 2 / (fastPeriod + 1);
  const slowSC = 2 / (slowPeriod + 1);
  for (let i = 1; i < values.length; i++) {
    if (i < period) {
      result[i] = values[i];
      continue;
    }
    let change = Math.abs(values[i] - values[i - period]);
    let volatility = 0;
    for (let j = i - period + 1; j <= i; j++) {
      volatility += Math.abs(values[j] - values[j - 1]);
    }
    const er = volatility === 0 ? 0 : change / volatility;
    const sc = Math.pow(er * (fastSC - slowSC) + slowSC, 2);
    result[i] = result[i - 1] + sc * (values[i] - result[i - 1]);
  }
  return result;
}

/** Wilder's Smoothing Average (used in ATR, RSI, etc.). */
export function wilderSmoothing(values: number[], period: number): number[] {
  if (values.length === 0) return [];
  const result: number[] = new Array(values.length).fill(0);
  if (values.length < period) {
    return simpleMovingAverage(values, values.length);
  }
  let sum = 0;
  for (let i = 0; i < period; i++) sum += values[i];
  result[period - 1] = sum / period;
  for (let i = period; i < values.length; i++) {
    result[i] = (result[i - 1] * (period - 1) + values[i]) / period;
  }
  return result;
}

/** Smooth a time series using a specified method. */
export function smoothSeries<T extends TimePoint>(
  points: T[],
  method: "sma" | "ema" | "wma" | "hull" | "zlema" | "tma" | "kama" | "wilder",
  period: number,
): TimePoint[] {
  const sorted = sortByDate(points);
  const values = extractValues(sorted);
  let smoothed: number[];
  switch (method) {
    case "sma": smoothed = simpleMovingAverage(values, period); break;
    case "ema": smoothed = exponentialMovingAverage(values, period); break;
    case "wma": smoothed = weightedMovingAverage(values, period); break;
    case "hull": smoothed = hullMovingAverage(values, period); break;
    case "zlema": smoothed = zeroLagEma(values, period); break;
    case "tma": smoothed = triangularMovingAverage(values, period); break;
    case "kama": smoothed = kaufmanAdaptiveMovingAverage(values, period); break;
    case "wilder": smoothed = wilderSmoothing(values, period); break;
    default: smoothed = simpleMovingAverage(values, period);
  }
  return sorted.map((p, i) => ({ date: p.date, value: smoothed[i] ?? 0 }));
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5 — ANOMALY DETECTION
// ─────────────────────────────────────────────────────────────────────────────

/** Detect anomalies using z-score. Returns points where |z| > threshold. */
export function detectZScoreAnomalies<T extends TimePoint>(points: T[], threshold = 2.5): AnomalyResult[] {
  if (points.length < 3) return [];
  const sorted = sortByDate(points);
  const values = extractValues(sorted);
  const m = mean(values);
  const sd = sampleStdDev(values);
  if (sd === 0) return [];
  const results: AnomalyResult[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const z = (values[i] - m) / sd;
    if (Math.abs(z) > threshold) {
      const severity: AnomalyResult["severity"] =
        Math.abs(z) > 4 ? "critical" :
        Math.abs(z) > 3.5 ? "high" :
        Math.abs(z) > 3 ? "medium" : "low";
      results.push({
        date: sorted[i].date,
        value: values[i],
        expected: m,
        deviation: values[i] - m,
        zScore: z,
        severity,
        isAnomaly: true,
        description: `Value ${values[i].toFixed(2)} deviates ${z.toFixed(2)}σ from mean ${m.toFixed(2)}`,
      });
    }
  }
  return results;
}

/** Detect anomalies using modified z-score (MAD-based, robust to outliers). */
export function detectModifiedZScoreAnomalies<T extends TimePoint>(points: T[], threshold = 3.5): AnomalyResult[] {
  if (points.length < 3) return [];
  const sorted = sortByDate(points);
  const values = extractValues(sorted);
  const med = median(values);
  const mad = medianAbsoluteDeviation(values);
  if (mad === 0) return [];
  const results: AnomalyResult[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const modifiedZ = 0.6745 * (values[i] - med) / mad;
    if (Math.abs(modifiedZ) > threshold) {
      const severity: AnomalyResult["severity"] =
        Math.abs(modifiedZ) > 8 ? "critical" :
        Math.abs(modifiedZ) > 6 ? "high" :
        Math.abs(modifiedZ) > 4.5 ? "medium" : "low";
      results.push({
        date: sorted[i].date,
        value: values[i],
        expected: med,
        deviation: values[i] - med,
        zScore: modifiedZ,
        severity,
        isAnomaly: true,
        description: `Value ${values[i].toFixed(2)} deviates ${modifiedZ.toFixed(2)} (modified z) from median ${med.toFixed(2)}`,
      });
    }
  }
  return results;
}

/** Detect anomalies using Interquartile Range (IQR) method. */
export function detectIqrAnomalies<T extends TimePoint>(points: T[], multiplier = 1.5): AnomalyResult[] {
  if (points.length < 4) return [];
  const sorted = sortByDate(points);
  const values = extractValues(sorted);
  const q1 = quartile1(values);
  const q3 = quartile3(values);
  const iqr = q3 - q1;
  const lowerBound = q1 - multiplier * iqr;
  const upperBound = q3 + multiplier * iqr;
  const results: AnomalyResult[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (values[i] < lowerBound || values[i] > upperBound) {
      const deviation = values[i] > upperBound ? values[i] - upperBound : lowerBound - values[i];
      const severity: AnomalyResult["severity"] =
        deviation > 3 * iqr ? "critical" :
        deviation > 2 * iqr ? "high" :
        deviation > 1.5 * iqr ? "medium" : "low";
      results.push({
        date: sorted[i].date,
        value: values[i],
        expected: (q1 + q3) / 2,
        deviation,
        zScore: iqr === 0 ? 0 : deviation / iqr,
        severity,
        isAnomaly: true,
        description: `Value ${values[i].toFixed(2)} outside IQR bounds [${lowerBound.toFixed(2)}, ${upperBound.toFixed(2)}]`,
      });
    }
  }
  return results;
}

/** Detect anomalies using a moving-average baseline. */
export function detectMovingAverageAnomalies<T extends TimePoint>(
  points: T[],
  windowSize = 7,
  threshold = 2.5,
): AnomalyResult[] {
  if (points.length < windowSize + 1) return [];
  const sorted = sortByDate(points);
  const values = extractValues(sorted);
  const sma = simpleMovingAverage(values, windowSize);
  const deviations: number[] = values.map((v, i) => v - sma[i]);
  const sd = sampleStdDev(deviations.slice(windowSize));
  if (sd === 0) return [];
  const results: AnomalyResult[] = [];
  for (let i = windowSize; i < sorted.length; i++) {
    const z = deviations[i] / sd;
    if (Math.abs(z) > threshold) {
      const severity: AnomalyResult["severity"] =
        Math.abs(z) > 4 ? "critical" :
        Math.abs(z) > 3.5 ? "high" :
        Math.abs(z) > 3 ? "medium" : "low";
      results.push({
        date: sorted[i].date,
        value: values[i],
        expected: sma[i],
        deviation: deviations[i],
        zScore: z,
        severity,
        isAnomaly: true,
        description: `Value ${values[i].toFixed(2)} deviates ${z.toFixed(2)}σ from ${windowSize}-period MA ${sma[i].toFixed(2)}`,
      });
    }
  }
  return results;
}

/** Detect seasonal anomalies by comparing to the same period in prior cycles. */
export function detectSeasonalAnomalies<T extends TimePoint>(
  points: T[],
  seasonalPeriod: number,
  threshold = 2.5,
): AnomalyResult[] {
  if (points.length < seasonalPeriod * 2) return [];
  const sorted = sortByDate(points);
  const values = extractValues(sorted);
  const results: AnomalyResult[] = [];
  const expectedValues: number[] = [];
  for (let i = 0; i < values.length; i++) {
    if (i < seasonalPeriod) {
      expectedValues.push(values[i]);
    } else {
      const priorValue = values[i - seasonalPeriod];
      expectedValues.push(priorValue);
    }
  }
  const deviations = values.map((v, i) => v - expectedValues[i]);
  const sd = sampleStdDev(deviations.slice(seasonalPeriod));
  if (sd === 0) return [];
  for (let i = seasonalPeriod; i < sorted.length; i++) {
    const z = deviations[i] / sd;
    if (Math.abs(z) > threshold) {
      const severity: AnomalyResult["severity"] =
        Math.abs(z) > 4 ? "critical" :
        Math.abs(z) > 3.5 ? "high" :
        Math.abs(z) > 3 ? "medium" : "low";
      results.push({
        date: sorted[i].date,
        value: values[i],
        expected: expectedValues[i],
        deviation: deviations[i],
        zScore: z,
        severity,
        isAnomaly: true,
        description: `Value ${values[i].toFixed(2)} deviates ${z.toFixed(2)}σ from seasonal expected ${expectedValues[i].toFixed(2)}`,
      });
    }
  }
  return results;
}

/** General anomaly detection dispatcher. */
export function detectAnomalies<T extends TimePoint>(
  points: T[],
  method: "zscore" | "modified_zscore" | "iqr" | "moving_average" | "seasonal" = "zscore",
  options: { threshold?: number; windowSize?: number; seasonalPeriod?: number; multiplier?: number } = {},
): AnomalyResult[] {
  switch (method) {
    case "zscore":
      return detectZScoreAnomalies(points, options.threshold ?? 2.5);
    case "modified_zscore":
      return detectModifiedZScoreAnomalies(points, options.threshold ?? 3.5);
    case "iqr":
      return detectIqrAnomalies(points, options.multiplier ?? 1.5);
    case "moving_average":
      return detectMovingAverageAnomalies(points, options.windowSize ?? 7, options.threshold ?? 2.5);
    case "seasonal":
      return detectSeasonalAnomalies(points, options.seasonalPeriod ?? 7, options.threshold ?? 2.5);
    default:
      return detectZScoreAnomalies(points, options.threshold ?? 2.5);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6 — SENTIMENT ANALYSIS & TREND
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sentiment score [0,1] where 0 = very negative, 1 = very positive.
 * Computed as weighted average of mention sentiments.
 */
export function computeSentimentScore(
  mentions: Array<{ sentimentScore: number; weight?: number }>,
): UnitInterval {
  if (mentions.length === 0) return 0.5;
  const weights = mentions.map(m => m.weight ?? 1);
  const score = weightedMean(
    mentions.map(m => m.sentimentScore),
    weights,
  );
  return Math.max(0, Math.min(1, score)) as UnitInterval;
}

/** Map a continuous [0,1] sentiment score to a discrete label. */
export function sentimentScoreToLabel(score: number): MentionSentiment {
  if (score >= 0.85) return "very_positive";
  if (score >= 0.65) return "positive";
  if (score >= 0.55) return "slightly_positive";
  if (score >= 0.45) return "neutral";
  if (score >= 0.35) return "slightly_negative";
  if (score >= 0.15) return "negative";
  return "very_negative";
}

/** Map a label back to its midpoint score. */
export function sentimentLabelToScore(label: MentionSentiment): number {
  switch (label) {
    case "very_positive": return 0.95;
    case "positive": return 0.75;
    case "slightly_positive": return 0.6;
    case "neutral": return 0.5;
    case "slightly_negative": return 0.4;
    case "negative": return 0.25;
    case "very_negative": return 0.05;
    default: return 0.5;
  }
}

/** Compute the sentiment polarity: (positive - negative) / total. */
export function sentimentPolarity(
  positive: number,
  negative: number,
  neutral: number,
): number {
  const total = positive + negative + neutral;
  if (total === 0) return 0;
  return (positive - negative) / total;
}

/** Net Promoter Score-style sentiment: %positive - %negative. */
export function netSentimentScore(
  positive: number,
  negative: number,
  neutral: number,
): number {
  const total = positive + negative + neutral;
  if (total === 0) return 0;
  const pPos = positive / total;
  const pNeg = negative / total;
  return (pPos - pNeg) * 100;
}

/** Sentiment trend over time using linear regression. */
export function sentimentTrendAnalysis(
  points: SentimentTimePoint[],
): {
  trend: RiskTrajectory;
  slope: number;
  rSquared: number;
  forecastNext: number;
  volatility: number;
  momentum: number;
  acceleration: number;
  anomalies: AnomalyResult[];
  summary: string;
} {
  const sorted = sortByDate(points);
  if (sorted.length < 2) {
    return {
      trend: "stable",
      slope: 0,
      rSquared: 0,
      forecastNext: 0.5,
      volatility: 0,
      momentum: 0,
      acceleration: 0,
      anomalies: [],
      summary: "Insufficient data for trend analysis",
    };
  }
  const values = extractValues(sorted);
  const regression = linearRegression(values);
  const trend = detectTrend(values, 0.05);
  const forecastNext = regression.slope * values.length + regression.intercept;
  const sma = simpleMovingAverage(values, Math.min(7, values.length));
  const momentum = values[values.length - 1] - sma[sma.length - 1];
  const firstDeriv = firstDerivative(values);
  const secondDeriv = secondDerivative(values);
  const acceleration = secondDeriv.length > 0 ? secondDeriv[secondDeriv.length - 1] : 0;
  const anomalies = detectMovingAverageAnomalies(sorted, 7, 2.5);
  const volatility = sampleStdDev(firstDeriv);
  const summary = `Sentiment is ${trend} (slope ${regression.slope.toFixed(4)}/period, R² ${regression.rSquared.toFixed(2)}, ${anomalies.length} anomalies, volatility ${volatility.toFixed(4)})`;
  return {
    trend,
    slope: regression.slope,
    rSquared: regression.rSquared,
    forecastNext,
    volatility,
    momentum,
    acceleration,
    anomalies,
    summary,
  };
}

/** Compute sentiment velocity (rate of change of average sentiment per period). */
export function sentimentVelocity(points: SentimentTimePoint[], windowSize = 7): number {
  if (points.length < windowSize + 1) return 0;
  const sorted = sortByDate(points);
  const values = extractValues(sorted);
  const sma = simpleMovingAverage(values, windowSize);
  const recentSma = sma[sma.length - 1];
  const previousSma = sma[sma.length - 1 - windowSize] ?? sma[0];
  return recentSma - previousSma;
}

/** Compute sentiment acceleration (second derivative of average sentiment). */
export function sentimentAcceleration(points: SentimentTimePoint[], windowSize = 7): number {
  if (points.length < 2 * windowSize + 1) return 0;
  const sorted = sortByDate(points);
  const values = extractValues(sorted);
  const sma = simpleMovingAverage(values, windowSize);
  const recent = sma[sma.length - 1];
  const mid = sma[sma.length - 1 - windowSize] ?? sma[0];
  const older = sma[sma.length - 1 - 2 * windowSize] ?? sma[0];
  return (recent - mid) - (mid - older);
}

/** Compute sentiment distribution (count per label). */
export function sentimentDistribution(mentions: Array<{ sentimentScore: number }>): Record<MentionSentiment, number> {
  const dist: Record<MentionSentiment, number> = {
    very_positive: 0,
    positive: 0,
    slightly_positive: 0,
    neutral: 0,
    slightly_negative: 0,
    negative: 0,
    very_negative: 0,
  };
  for (const m of mentions) {
    const label = sentimentScoreToLabel(m.sentimentScore);
    dist[label]++;
  }
  return dist;
}

/** Compute sentiment distribution as percentages. */
export function sentimentDistributionPercent(
  mentions: Array<{ sentimentScore: number }>,
): Record<MentionSentiment, UnitInterval> {
  const total = mentions.length;
  const dist = sentimentDistribution(mentions);
  if (total === 0) {
    return {
      very_positive: 0,
      positive: 0,
      slightly_positive: 0,
      neutral: 1,
      slightly_negative: 0,
      negative: 0,
      very_negative: 0,
    } as Record<MentionSentiment, UnitInterval>;
  }
  return {
    very_positive: (dist.very_positive / total) as UnitInterval,
    positive: (dist.positive / total) as UnitInterval,
    slightly_positive: (dist.slightly_positive / total) as UnitInterval,
    neutral: (dist.neutral / total) as UnitInterval,
    slightly_negative: (dist.slightly_negative / total) as UnitInterval,
    negative: (dist.negative / total) as UnitInterval,
    very_negative: (dist.very_negative / total) as UnitInterval,
  };
}

/** Compute sentiment-weighted reach: sum of (sentiment × reach) / total reach. */
export function sentimentWeightedReach(
  mentions: Array<{ sentimentScore: number; reachEstimate: number }>,
): number {
  if (mentions.length === 0) return 0.5;
  let weighted = 0;
  let totalReach = 0;
  for (const m of mentions) {
    weighted += m.sentimentScore * m.reachEstimate;
    totalReach += m.reachEstimate;
  }
  return totalReach === 0 ? 0.5 : weighted / totalReach;
}

/** Compute the sentiment gap between two periods. */
export function sentimentGap(
  before: Array<{ sentimentScore: number }>,
  after: Array<{ sentimentScore: number }>,
): number {
  const beforeScore = computeSentimentScore(before);
  const afterScore = computeSentimentScore(after);
  return afterScore - beforeScore;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 7 — SHARE OF VOICE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute Share of Voice for each company.
 * SoV_i = (mentions_i / total_mentions) * 100
 */
export function computeShareOfVoice(
  companies: Array<{ id: UUID; mentionCount: number }>,
): Array<{ id: UUID; shareOfVoice: UnitInterval; rank: number }> {
  const total = sum(companies.map(c => c.mentionCount));
  if (total === 0) {
    return companies.map((c, i) => ({ id: c.id, shareOfVoice: 0 as UnitInterval, rank: i + 1 }));
  }
  const result = companies
    .map(c => ({
      id: c.id,
      shareOfVoice: (c.mentionCount / total) as UnitInterval,
      rawCount: c.mentionCount,
    }))
    .sort((a, b) => b.rawCount - a.rawCount);
  return result.map((r, i) => ({
    id: r.id,
    shareOfVoice: r.shareOfVoice,
    rank: i + 1,
  }));
}

/** Weighted Share of Voice using reach (each mention weighted by reach). */
export function computeWeightedShareOfVoice(
  companies: Array<{ id: UUID; mentions: Array<{ reachEstimate: number }> }>,
): Array<{ id: UUID; shareOfVoice: UnitInterval; rank: number; totalReach: number }> {
  const enriched = companies.map(c => ({
    id: c.id,
    totalReach: sum(c.mentions.map(m => m.reachEstimate)),
  }));
  const total = sum(enriched.map(c => c.totalReach));
  if (total === 0) {
    return enriched.map((c, i) => ({ id: c.id, shareOfVoice: 0 as UnitInterval, rank: i + 1, totalReach: 0 }));
  }
  const sorted = [...enriched].sort((a, b) => b.totalReach - a.totalReach);
  return sorted.map((c, i) => ({
    id: c.id,
    shareOfVoice: (c.totalReach / total) as UnitInterval,
    rank: i + 1,
    totalReach: c.totalReach,
  }));
}

/** Compute SoV delta from previous period. */
export function shareOfVoiceDelta(
  current: Array<{ id: UUID; shareOfVoice: UnitInterval }>,
  previous: Array<{ id: UUID; shareOfVoice: UnitInterval }>,
): Array<{ id: UUID; delta: number; deltaPercent: number; rankChange: number }> {
  const previousMap = new Map(previous.map(p => [p.id, p.shareOfVoice]));
  return current.map(c => {
    const prev = previousMap.get(c.id);
    const delta = prev === undefined ? 0 : c.shareOfVoice - prev;
    const deltaPercent = prev === undefined || prev === 0 ? 0 : delta / prev;
    return {
      id: c.id,
      delta,
      deltaPercent,
      rankChange: 0,
    };
  });
}

/** Compute Share of Voice by channel. */
export function shareOfVoiceByChannel(
  mentions: Array<{ companyId: UUID; channel: string; reachEstimate: number }>,
): Array<{ channel: string; companies: Array<{ companyId: UUID; shareOfVoice: UnitInterval; mentionCount: number }> }> {
  const channelMap = new Map<string, Map<UUID, number>>();
  for (const m of mentions) {
    if (!channelMap.has(m.channel)) channelMap.set(m.channel, new Map());
    const companyMap = channelMap.get(m.channel)!;
    companyMap.set(m.companyId, (companyMap.get(m.companyId) ?? 0) + 1);
  }
  const result: Array<{ channel: string; companies: Array<{ companyId: UUID; shareOfVoice: UnitInterval; mentionCount: number }> }> = [];
  for (const [channel, companyMap] of channelMap.entries()) {
    const total = sum([...companyMap.values()]);
    const companies = [...companyMap.entries()]
      .map(([companyId, count]) => ({
        companyId,
        mentionCount: count,
        shareOfVoice: (count / total) as UnitInterval,
      }))
      .sort((a, b) => b.shareOfVoice - a.shareOfVoice);
    result.push({ channel, companies });
  }
  return result;
}

/** Compute Share of Voice concentration (HHI). */
export function shareOfVoiceConcentration(
  companies: Array<{ shareOfVoice: UnitInterval }>,
): number {
  return herfindahlIndex(companies.map(c => c.shareOfVoice));
}

/** Compute the Share of Voice leadership gap (top - second). */
export function shareOfVoiceLeadershipGap(
  companies: Array<{ id: UUID; shareOfVoice: UnitInterval }>,
): number {
  if (companies.length < 2) return 0;
  const sorted = [...companies].sort((a, b) => b.shareOfVoice - a.shareOfVoice);
  return sorted[0].shareOfVoice - sorted[1].shareOfVoice;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 8 — AI VISIBILITY SCORING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * AI Visibility Score (0..1) — how often a company is mentioned by AI
 * assistants and language models relative to its peers.
 *
 * Inputs:
 *   - aiMentionCount: how many times AI tools mentioned the company
 *   - aiSourceCount: how many distinct AI sources mentioned the company
 *   - totalAiQueries: total queries that touched this company's sector
 *   - positiveShare: % of AI mentions that are positive
 *   - accuracyScore: factual accuracy of AI mentions (0..1)
 *   - freshnessScore: how recent the AI training data is (0..1)
 *   - benchmarkAvg: peer average for normalization
 */
export function computeAiVisibilityScore(input: {
  aiMentionCount: number;
  aiSourceCount: number;
  totalAiQueries: number;
  positiveShare: UnitInterval;
  accuracyScore: UnitInterval;
  freshnessScore: UnitInterval;
  benchmarkAvg: number;
}): UnitInterval {
  const {
    aiMentionCount,
    aiSourceCount,
    totalAiQueries,
    positiveShare,
    accuracyScore,
    freshnessScore,
    benchmarkAvg,
  } = input;
  if (totalAiQueries === 0) return 0;
  const mentionFrequency = Math.min(1, aiMentionCount / Math.max(1, totalAiQueries));
  const sourceDiversity = Math.min(1, aiSourceCount / 10);
  const benchmarkRatio = benchmarkAvg === 0 ? 1 : Math.min(2, aiMentionCount / benchmarkAvg) / 2;
  const score =
    mentionFrequency * 0.30 +
    sourceDiversity * 0.15 +
    positiveShare * 0.15 +
    accuracyScore * 0.20 +
    freshnessScore * 0.10 +
    benchmarkRatio * 0.10;
  return Math.max(0, Math.min(1, score)) as UnitInterval;
}

/** Compute AI visibility trend. */
export function aiVisibilityTrend(
  scores: Array<{ date: Date | ISODateString; score: UnitInterval }>,
): RiskTrajectory {
  return detectTrend(scores.map(s => s.score));
}

/** Compute AI visibility percentile rank against peers. */
export function aiVisibilityPercentileRank(
  companyScore: UnitInterval,
  peerScores: UnitInterval[],
): UnitInterval {
  if (peerScores.length === 0) return 0.5;
  const below = peerScores.filter(s => s < companyScore).length;
  return (below / peerScores.length) as UnitInterval;
}

/** Compute AI mention accuracy rate. */
export function aiMentionAccuracyRate(
  mentions: Array<{ isAccurate: boolean; weight?: number }>,
): UnitInterval {
  if (mentions.length === 0) return 0;
  const weights = mentions.map(m => m.weight ?? 1);
  const accurateWeights = mentions.map((m, i) => (m.isAccurate ? weights[i] : 0));
  const totalWeight = sum(weights);
  if (totalWeight === 0) return 0;
  return (sum(accurateWeights) / totalWeight) as UnitInterval;
}

/** Compute AI hallucination rate. */
export function aiHallucinationRate(
  mentions: Array<{ isHallucination: boolean; weight?: number }>,
): UnitInterval {
  if (mentions.length === 0) return 0;
  const weights = mentions.map(m => m.weight ?? 1);
  const hallucinationWeights = mentions.map((m, i) => (m.isHallucination ? weights[i] : 0));
  const totalWeight = sum(weights);
  if (totalWeight === 0) return 0;
  return (sum(hallucinationWeights) / totalWeight) as UnitInterval;
}

/** Compute AI model coverage — which models mention the company. */
export function aiModelCoverage(
  mentions: Array<{ modelId: string }>,
  allModels: string[],
): { coverage: UnitInterval; modelsCovered: string[]; modelsMissed: string[] } {
  const mentionedModels = new Set(mentions.map(m => m.modelId));
  const modelsCovered = [...mentionedModels].filter(m => allModels.includes(m));
  const modelsMissed = allModels.filter(m => !mentionedModels.has(m));
  const coverage = (modelsCovered.length / Math.max(1, allModels.length)) as UnitInterval;
  return { coverage, modelsCovered, modelsMissed };
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 9 — RISK SCORE AGGREGATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Aggregate risk scores across multiple categories using weighted mean.
 * Returns a percentage [0, 100].
 */
export function aggregateRiskScore(
  categoryScores: Array<{ score: Percentage; weight: number; confidence?: UnitInterval }>,
  options: { normalizeWeights?: boolean; minConfidence?: UnitInterval } = {},
): Percentage {
  const { normalizeWeights = true, minConfidence = 0 } = options;
  const filtered = categoryScores.filter(c =>
    (c.confidence ?? 1) >= minConfidence && c.weight > 0,
  );
  if (filtered.length === 0) return 0;
  let totalWeight = sum(filtered.map(c => c.weight));
  if (normalizeWeights && totalWeight === 0) return 0;
  if (normalizeWeights && totalWeight !== 1) {
    const weights = filtered.map(c => c.weight / totalWeight);
    const weightedSum = sum(filtered.map((c, i) => c.score * weights[i]));
    return Math.max(0, Math.min(100, weightedSum)) as Percentage;
  }
  const weightedSum = sum(filtered.map(c => c.score * c.weight));
  return Math.max(0, Math.min(100, weightedSum / totalWeight)) as Percentage;
}

/** Map a numeric score [0,100] to a RiskLevel. */
export function scoreToRiskLevel(score: Percentage): RiskLevel {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 45) return "elevated";
  if (score >= 30) return "moderate";
  return "low";
}

/** Map a RiskLevel to its midpoint score. */
export function riskLevelToScore(level: RiskLevel): Percentage {
  switch (level) {
    case "low": return 15;
    case "moderate": return 37;
    case "elevated": return 52;
    case "high": return 70;
    case "critical": return 90;
  }
}

/** Map a RiskLevel to a color. */
export function riskLevelToColor(level: RiskLevel): string {
  switch (level) {
    case "low": return "#059669";
    case "moderate": return "#856914";
    case "elevated": return "#D97706";
    case "high": return "#DC2626";
    case "critical": return "#7F1D1D";
  }
}

/** Aggregate risk scores by group. */
export function aggregateRiskByGroup(
  categoryScores: Array<{ categoryId: string; group: RiskGroup; score: Percentage; weight: number }>,
): Array<{ group: RiskGroup; averageScore: Percentage; averageLevel: RiskLevel; totalWeight: number; categoryCount: number }> {
  const groupMap = new Map<RiskGroup, Array<{ score: Percentage; weight: number }>>();
  for (const c of categoryScores) {
    if (!groupMap.has(c.group)) groupMap.set(c.group, []);
    groupMap.get(c.group)!.push({ score: c.score, weight: c.weight });
  }
  const result: Array<{ group: RiskGroup; averageScore: Percentage; averageLevel: RiskLevel; totalWeight: number; categoryCount: number }> = [];
  for (const [group, scores] of groupMap.entries()) {
    const totalWeight = sum(scores.map(s => s.weight));
    const avg = totalWeight === 0 ? 0 : sum(scores.map(s => s.score * s.weight)) / totalWeight;
    const score = Math.max(0, Math.min(100, avg)) as Percentage;
    result.push({
      group,
      averageScore: score,
      averageLevel: scoreToRiskLevel(score),
      totalWeight,
      categoryCount: scores.length,
    });
  }
  return result.sort((a, b) => b.averageScore - a.averageScore);
}

/** Compute the risk trajectory from a series of overall scores. */
export function riskTrajectory(
  scores: Array<{ date: Date | ISODateString; score: Percentage }>,
  threshold = 5,
): RiskTrajectory {
  if (scores.length < 2) return "stable";
  const sorted = sortByDate(scores);
  const recentCount = Math.min(4, sorted.length);
  const recent = sorted.slice(-recentCount);
  const previous = sorted.slice(0, -recentCount);
  if (previous.length === 0) return "stable";
  const recentAvg = mean(recent.map(p => p.score));
  const previousAvg = mean(previous.map(p => p.score));
  const delta = recentAvg - previousAvg;
  if (delta > threshold) return "rising";
  if (delta < -threshold) return "falling";
  return "stable";
}

/** Compute risk velocity (rate of change of risk score per period). */
export function riskVelocity(
  scores: Array<{ date: Date | ISODateString; score: Percentage }>,
  windowSize = 4,
): number {
  if (scores.length < windowSize + 1) return 0;
  const sorted = sortByDate(scores);
  const values = sorted.map(p => p.score);
  const recentSma = simpleMovingAverage(values, windowSize);
  const recent = recentSma[recentSma.length - 1];
  const previous = recentSma[recentSma.length - 1 - windowSize] ?? recentSma[0];
  return recent - previous;
}

/** Compute risk volatility (standard deviation of period-over-period changes). */
export function riskVolatility(
  scores: Array<{ date: Date | ISODateString; score: Percentage }>,
): number {
  if (scores.length < 3) return 0;
  const sorted = sortByDate(scores);
  const values = sorted.map(p => p.score);
  const changes = diff(values);
  return sampleStdDev(changes);
}

/** Compute risk concentration — what % of total risk comes from top N categories. */
export function riskConcentration(
  categoryScores: Array<{ categoryId: string; score: Percentage; weight: number }>,
  topN = 5,
): UnitInterval {
  if (categoryScores.length === 0) return 0;
  const totalRisk = sum(categoryScores.map(c => c.score * c.weight));
  if (totalRisk === 0) return 0;
  const sorted = [...categoryScores].sort((a, b) => (b.score * b.weight) - (a.score * a.weight));
  const topRisk = sum(sorted.slice(0, topN).map(c => c.score * c.weight));
  return (topRisk / totalRisk) as UnitInterval;
}

/** Compute risk confidence based on data freshness, coverage, and source quality. */
export function riskConfidence(input: {
  dataFreshnessHours: number;
  categoryCoverage: UnitInterval;
  sourceDiversity: UnitInterval;
  evidenceCount: number;
}): UnitInterval {
  const { dataFreshnessHours, categoryCoverage, sourceDiversity, evidenceCount } = input;
  const freshnessScore = Math.max(0, 1 - dataFreshnessHours / (24 * 30));
  const evidenceScore = Math.min(1, evidenceCount / 50);
  const score =
    freshnessScore * 0.25 +
    categoryCoverage * 0.30 +
    sourceDiversity * 0.20 +
    evidenceScore * 0.25;
  return Math.max(0, Math.min(1, score)) as UnitInterval;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 10 — INFLUENCE SCORE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Influence Score = reach × engagement × authority.
 * Returns a value in [0, 1].
 */
export function computeInfluenceScore(input: {
  reach: number;
  engagementRate: UnitInterval;
  authorityScore: UnitInterval;
  maxReach?: number;
}): UnitInterval {
  const { reach, engagementRate, authorityScore, maxReach = 1_000_000 } = input;
  const normalizedReach = Math.min(1, reach / maxReach);
  const score = normalizedReach * 0.4 + engagementRate * 0.3 + authorityScore * 0.3;
  return Math.max(0, Math.min(1, score)) as UnitInterval;
}

/** Compute influence for a single mention. */
export function mentionInfluence(mention: {
  reachEstimate: number;
  engagementRate?: UnitInterval;
  likeCount: number;
  shareCount: number;
  commentCount: number;
  viewCount: number;
  authorFollowers?: number;
  authorVerified?: boolean;
  outletCredibility?: UnitInterval;
  maxReach?: number;
}): UnitInterval {
  const reach = mention.reachEstimate || mention.viewCount || mention.authorFollowers || 0;
  const totalEngagement = mention.likeCount + mention.shareCount * 3 + mention.commentCount * 2;
  const engagementRate = reach === 0 ? 0 : Math.min(1, totalEngagement / reach) as UnitInterval;
  let authorityScore = mention.outletCredibility ?? 0.5;
  if (mention.authorVerified) authorityScore = Math.min(1, authorityScore + 0.1);
  if (mention.authorFollowers && mention.authorFollowers > 100_000) authorityScore = Math.min(1, authorityScore + 0.1);
  return computeInfluenceScore({
    reach,
    engagementRate,
    authorityScore,
    maxReach: mention.maxReach,
  });
}

/** Compute aggregate influence for a set of mentions. */
export function aggregateInfluence(
  mentions: Array<{
    reachEstimate: number;
    likeCount: number;
    shareCount: number;
    commentCount: number;
    viewCount: number;
    authorFollowers?: number;
    authorVerified?: boolean;
    outletCredibility?: UnitInterval;
    weight?: number;
  }>,
): UnitInterval {
  if (mentions.length === 0) return 0;
  const weights = mentions.map(m => m.weight ?? 1);
  const influences = mentions.map(m => mentionInfluence(m));
  return Math.max(0, Math.min(1, weightedMean(influences, weights))) as UnitInterval;
}

/** Compute the influence distribution across channels. */
export function influenceByChannel(
  mentions: Array<{ channel: string; reachEstimate: number; likeCount: number; shareCount: number; commentCount: number; viewCount: number }>,
): Array<{ channel: string; influenceScore: UnitInterval; mentionCount: number; totalReach: number }> {
  const channelMap = new Map<string, typeof mentions>();
  for (const m of mentions) {
    if (!channelMap.has(m.channel)) channelMap.set(m.channel, []);
    channelMap.get(m.channel)!.push(m);
  }
  const result: Array<{ channel: string; influenceScore: UnitInterval; mentionCount: number; totalReach: number }> = [];
  for (const [channel, ms] of channelMap.entries()) {
    result.push({
      channel,
      influenceScore: aggregateInfluence(ms),
      mentionCount: ms.length,
      totalReach: sum(ms.map(m => m.reachEstimate)),
    });
  }
  return result.sort((a, b) => b.influenceScore - a.influenceScore);
}

/** Compute the author authority score. */
export function authorAuthorityScore(input: {
  followers: number;
  verified: boolean;
  averageEngagementRate: UnitInterval;
  accountAgeDays: number;
  postCount: number;
  isJournalist: boolean;
  isIndustryExpert: boolean;
  isExecutive: boolean;
}): UnitInterval {
  const { followers, verified, averageEngagementRate, accountAgeDays, postCount, isJournalist, isIndustryExpert, isExecutive } = input;
  const followerScore = Math.min(1, Math.log10(Math.max(1, followers)) / 7);
  const verifiedScore = verified ? 1 : 0.5;
  const ageScore = Math.min(1, accountAgeDays / 3650);
  const activityScore = Math.min(1, postCount / 5000);
  const roleScore = (isExecutive ? 0.4 : 0) + (isJournalist ? 0.3 : 0) + (isIndustryExpert ? 0.3 : 0);
  const score =
    followerScore * 0.25 +
    verifiedScore * 0.10 +
    averageEngagementRate * 0.20 +
    ageScore * 0.10 +
    activityScore * 0.10 +
    roleScore * 0.25;
  return Math.max(0, Math.min(1, score)) as UnitInterval;
}

/** Compute outlet credibility score. */
export function outletCredibilityScore(input: {
  type: string;
  factualityScore: UnitInterval;
  transparencyScore: UnitInterval;
  biasScore: UnitInterval;
  ownershipTransparency: "high" | "medium" | "low" | "unknown";
  isStateOwned: boolean;
  monthlyVisitors: number;
  foundedYear: number;
}): UnitInterval {
  const { factualityScore, transparencyScore, biasScore, ownershipTransparency, isStateOwned, monthlyVisitors, foundedYear, type } = input;
  const ownershipScore =
    ownershipTransparency === "high" ? 1 :
    ownershipTransparency === "medium" ? 0.6 :
    ownershipTransparency === "low" ? 0.3 : 0.5;
  const stateOwnedPenalty = isStateOwned ? -0.1 : 0;
  const trafficScore = Math.min(1, Math.log10(Math.max(1, monthlyVisitors)) / 8);
  const ageScore = Math.min(1, (new Date().getFullYear() - foundedYear) / 100);
  const typeScore =
    type === "wire_service" ? 0.95 :
    type === "national_newspaper" ? 0.85 :
    type === "official_source" ? 0.9 :
    type === "tv" ? 0.75 :
    type === "magazine" ? 0.7 :
    type === "regional_newspaper" ? 0.65 :
    type === "online_portal" ? 0.55 :
    type === "podcast" ? 0.5 :
    type === "newsletter" ? 0.5 :
    type === "radio" ? 0.5 :
    type === "blog" ? 0.35 :
    type === "social_account" ? 0.25 : 0.4;
  const score =
    factualityScore * 0.30 +
    transparencyScore * 0.20 +
    (1 - Math.abs(0.5 - biasScore)) * 0.15 +
    ownershipScore * 0.10 +
    trafficScore * 0.05 +
    ageScore * 0.05 +
    typeScore * 0.15 +
    stateOwnedPenalty;
  return Math.max(0, Math.min(1, score)) as UnitInterval;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 11 — VELOCITY METRICS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mention velocity — change in mention count per period.
 */
export function mentionVelocity(
  counts: Array<{ date: Date | ISODateString; count: number }>,
  windowSize = 7,
): number {
  if (counts.length < windowSize + 1) return 0;
  const sorted = sortByDate(counts);
  const values = sorted.map(p => p.count);
  const recentSma = simpleMovingAverage(values, windowSize);
  const recent = recentSma[recentSma.length - 1];
  const previous = recentSma[recentSma.length - 1 - windowSize] ?? recentSma[0];
  return recent - previous;
}

/** Mention velocity as percentage change. */
export function mentionVelocityPercent(
  counts: Array<{ date: Date | ISODateString; count: number }>,
  windowSize = 7,
): number {
  if (counts.length < windowSize + 1) return 0;
  const sorted = sortByDate(counts);
  const values = sorted.map(p => p.count);
  const recentSma = simpleMovingAverage(values, windowSize);
  const recent = recentSma[recentSma.length - 1];
  const previous = recentSma[recentSma.length - 1 - windowSize] ?? recentSma[0];
  if (previous === 0) return recent === 0 ? 0 : Infinity;
  return (recent - previous) / previous;
}

/** Detect a mention spike — sudden increase above the moving average. */
export function detectMentionSpike(
  counts: Array<{ date: Date | ISODateString; count: number }>,
  threshold = 2.5,
  windowSize = 7,
): Array<{ date: Date | ISODateString; count: number; expected: number; zScore: number; severity: "low" | "medium" | "high" | "critical" }> {
  if (counts.length < windowSize + 1) return [];
  const sorted = sortByDate(counts);
  const values = sorted.map(p => p.count);
  const sma = simpleMovingAverage(values, windowSize);
  const deviations = values.map((v, i) => v - sma[i]);
  const sd = sampleStdDev(deviations.slice(windowSize));
  if (sd === 0) return [];
  const result: Array<{ date: Date | ISODateString; count: number; expected: number; zScore: number; severity: "low" | "medium" | "high" | "critical" }> = [];
  for (let i = windowSize; i < sorted.length; i++) {
    const z = deviations[i] / sd;
    if (z > threshold) {
      const severity: "low" | "medium" | "high" | "critical" =
        z > 5 ? "critical" :
        z > 4 ? "high" :
        z > 3 ? "medium" : "low";
      result.push({
        date: sorted[i].date,
        count: values[i],
        expected: sma[i],
        zScore: z,
        severity,
      });
    }
  }
  return result;
}

/** Alert velocity — change in alert count per period. */
export function alertVelocity(
  alertCounts: Array<{ date: Date | ISODateString; count: number }>,
  windowSize = 7,
): number {
  return mentionVelocity(alertCounts, windowSize);
}

/** Alert severity velocity — change in critical alerts per period. */
export function alertSeverityVelocity(
  alerts: Array<{ date: Date | ISODateString; severity: string }>,
  severities: string[] = ["critical", "high"],
  windowSize = 7,
): number {
  const counts = alerts.reduce((acc, a) => {
    if (!severities.includes(a.severity)) return acc;
    const key = toISODate(a.date).slice(0, 10);
    acc.set(key, (acc.get(key) ?? 0) + 1);
    return acc;
  }, new Map<string, number>());
  const sorted = [...counts.entries()].sort();
  const timeSeries = sorted.map(([key, count]) => ({ date: key as ISODateString, count }));
  return alertVelocity(timeSeries as Array<{ date: Date | ISODateString; count: number }>, windowSize);
}

/** Compute the doubling time for a metric (in periods). */
export function doublingTime(values: number[]): number | null {
  if (values.length < 2) return null;
  const regression = linearRegression(values.map(v => Math.log(Math.max(1, v))));
  if (regression.slope <= 0) return null;
  return Math.log(2) / regression.slope;
}

/** Compute the half-life of a decaying metric (in periods). */
export function halfLife(values: number[]): number | null {
  if (values.length < 2) return null;
  const regression = linearRegression(values.map(v => Math.log(Math.max(1, v))));
  if (regression.slope >= 0) return null;
  return Math.log(2) / Math.abs(regression.slope);
}

/** Compute the cumulative velocity (sum of all velocity contributions). */
export function cumulativeVelocity(velocities: number[]): number {
  return sum(velocities);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 12 — REPUTATION SCORE (COMPOSITE WEIGHTED)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Composite Reputation Score (0..100) — weighted blend of:
 *   - Sentiment score (positive sentiment improves reputation)
 *   - Risk score (lower risk improves reputation)
 *   - Share of voice (higher SoV improves reputation)
 *   - AI visibility (higher visibility improves reputation)
 *   - Influence (higher influence improves reputation)
 *   - Velocity (positive momentum improves reputation)
 */
export function computeReputationScore(input: {
  sentimentScore: UnitInterval;
  riskScore: Percentage;
  shareOfVoice: UnitInterval;
  aiVisibilityScore: UnitInterval;
  influenceScore: UnitInterval;
  velocityScore: UnitInterval; // -1 (declining) to 1 (rising), 0 = stable
  weights?: Partial<ReputationScoreWeights>;
}): Percentage & { breakdown: ScoreBreakdown[] } {
  const weights: ReputationScoreWeights = {
    sentiment: input.weights?.sentiment ?? 0.25,
    risk: input.weights?.risk ?? 0.25,
    shareOfVoice: input.weights?.shareOfVoice ?? 0.15,
    aiVisibility: input.weights?.aiVisibility ?? 0.15,
    influence: input.weights?.influence ?? 0.10,
    velocity: input.weights?.velocity ?? 0.10,
  };
  const sentimentComponent = input.sentimentScore * 100;
  const riskComponent = (100 - input.riskScore);
  const sovComponent = input.shareOfVoice * 100;
  const aiVisibilityComponent = input.aiVisibilityScore * 100;
  const influenceComponent = input.influenceScore * 100;
  const velocityComponent = (input.velocityScore + 1) / 2 * 100;
  const breakdown: ScoreBreakdown[] = [
    {
      component: "sentiment",
      label: "Sentiment",
      labelFr: "Sentiment",
      rawValue: input.sentimentScore,
      weight: weights.sentiment,
      weightedValue: sentimentComponent * weights.sentiment,
      normalizedValue: input.sentimentScore,
      description: "Weighted sentiment of mentions",
    },
    {
      component: "risk",
      label: "Risk (inverted)",
      labelFr: "Risque (inversé)",
      rawValue: riskComponent,
      weight: weights.risk,
      weightedValue: riskComponent * weights.risk,
      normalizedValue: (riskComponent / 100) as UnitInterval,
      description: "Inverse of overall risk score",
    },
    {
      component: "shareOfVoice",
      label: "Share of Voice",
      labelFr: "Part de voix",
      rawValue: input.shareOfVoice,
      weight: weights.shareOfVoice,
      weightedValue: sovComponent * weights.shareOfVoice,
      normalizedValue: input.shareOfVoice,
      description: "Share of mentions in peer group",
    },
    {
      component: "aiVisibility",
      label: "AI Visibility",
      labelFr: "Visibilité IA",
      rawValue: input.aiVisibilityScore,
      weight: weights.aiVisibility,
      weightedValue: aiVisibilityComponent * weights.aiVisibility,
      normalizedValue: input.aiVisibilityScore,
      description: "Visibility in AI assistants",
    },
    {
      component: "influence",
      label: "Influence",
      labelFr: "Influence",
      rawValue: input.influenceScore,
      weight: weights.influence,
      weightedValue: influenceComponent * weights.influence,
      normalizedValue: input.influenceScore,
      description: "Reach × engagement × authority",
    },
    {
      component: "velocity",
      label: "Velocity",
      labelFr: "Vélocité",
      rawValue: input.velocityScore,
      weight: weights.velocity,
      weightedValue: velocityComponent * weights.velocity,
      normalizedValue: ((input.velocityScore + 1) / 2) as UnitInterval,
      description: "Momentum of recent changes",
    },
  ];
  const totalScore = sum(breakdown.map(b => b.weightedValue));
  const totalWeight = sum(breakdown.map(b => b.weight));
  const normalizedScore = totalWeight === 0 ? 0 : totalScore / totalWeight;
  return Object.assign(
    Math.max(0, Math.min(100, normalizedScore)) as Percentage,
    { breakdown },
  );
}

export interface ReputationScoreWeights {
  sentiment: number;
  risk: number;
  shareOfVoice: number;
  aiVisibility: number;
  influence: number;
  velocity: number;
}

/** Default reputation score weights (sum to 1.0). */
export const DEFAULT_REPUTATION_WEIGHTS: ReputationScoreWeights = {
  sentiment: 0.25,
  risk: 0.25,
  shareOfVoice: 0.15,
  aiVisibility: 0.15,
  influence: 0.10,
  velocity: 0.10,
};

/** Compute the reputation trajectory. */
export function reputationTrajectory(
  scores: Array<{ date: Date | ISODateString; score: Percentage }>,
  threshold = 2,
): RiskTrajectory {
  return riskTrajectory(scores, threshold);
}

/** Compute the reputation percentile rank against peers. */
export function reputationPercentileRank(
  companyScore: Percentage,
  peerScores: Percentage[],
): UnitInterval {
  if (peerScores.length === 0) return 0.5;
  const below = peerScores.filter(s => s < companyScore).length;
  return (below / peerScores.length) as UnitInterval;
}

/** Compute the reputation gap to the leader. */
export function reputationGapToLeader(
  companyScore: Percentage,
  peerScores: Percentage[],
): number {
  if (peerScores.length === 0) return 0;
  const leader = Math.max(...peerScores);
  return leader - companyScore;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 13 — BENCHMARKING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Benchmark a subject against a peer group.
 */
export function benchmarkAgainstPeers(
  subjectId: UUID,
  subjectValue: number,
  peerValues: Array<{ id: UUID; value: number }>,
): BenchmarkResult {
  if (peerValues.length === 0) {
    return {
      subjectId,
      subjectValue,
      peerAverage: 0,
      peerMedian: 0,
      peerMin: 0,
      peerMax: 0,
      peerStdDev: 0,
      peerCount: 0,
      percentileRank: 0.5,
      zScore: 0,
      deltaFromAverage: 0,
      deltaFromMedian: 0,
      deltaFromBest: 0,
      deltaFromWorst: 0,
      outliers: [],
    };
  }
  const values = peerValues.map(p => p.value);
  const avg = mean(values);
  const med = median(values);
  const mn = Math.min(...values);
  const mx = Math.max(...values);
  const sd = sampleStdDev(values);
  const z = sd === 0 ? 0 : (subjectValue - avg) / sd;
  const below = values.filter(v => v < subjectValue).length;
  const percentile = (below / values.length) as UnitInterval;
  const outliers = peerValues
    .map(p => ({ id: p.id, value: p.value, zScore: sd === 0 ? 0 : (p.value - avg) / sd }))
    .filter(o => Math.abs(o.zScore) > 2.5);
  return {
    subjectId,
    subjectValue,
    peerAverage: avg,
    peerMedian: med,
    peerMin: mn,
    peerMax: mx,
    peerStdDev: sd,
    peerCount: peerValues.length,
    percentileRank: percentile,
    zScore: z,
    deltaFromAverage: subjectValue - avg,
    deltaFromMedian: subjectValue - med,
    deltaFromBest: subjectValue - mx,
    deltaFromWorst: subjectValue - mn,
    outliers,
  };
}

/** Benchmark a subject against its sector. */
export function benchmarkAgainstSector(
  subjectId: UUID,
  subjectValue: number,
  sectorCompanies: Array<{ id: UUID; value: number }>,
): BenchmarkResult {
  return benchmarkAgainstPeers(subjectId, subjectValue, sectorCompanies);
}

/** Compute peer percentile for a metric. */
export function peerPercentile(
  subjectValue: number,
  peerValues: number[],
): UnitInterval {
  if (peerValues.length === 0) return 0.5;
  const below = peerValues.filter(v => v < subjectValue).length;
  return (below / peerValues.length) as UnitInterval;
}

/** Compute peer z-score. */
export function peerZScore(
  subjectValue: number,
  peerValues: number[],
): number {
  if (peerValues.length < 2) return 0;
  const avg = mean(peerValues);
  const sd = sampleStdDev(peerValues);
  return sd === 0 ? 0 : (subjectValue - avg) / sd;
}

/** Compute peer average. */
export function peerAverage(peerValues: number[]): number {
  return mean(peerValues);
}

/** Compute peer median. */
export function peerMedian(peerValues: number[]): number {
  return median(peerValues);
}

/** Rank an array of values (1 = highest). */
export function rank(values: number[]): number[] {
  const sorted = [...values].sort((a, b) => b - a);
  return values.map(v => sorted.indexOf(v) + 1);
}

/** Compute the percentile rank of a value within a distribution. */
export function percentileRank(value: number, distribution: number[]): UnitInterval {
  if (distribution.length === 0) return 0.5;
  const below = distribution.filter(v => v < value).length;
  const equal = distribution.filter(v => v === value).length;
  return ((below + 0.5 * equal) / distribution.length) as UnitInterval;
}

/** Compute a comparison summary across multiple metrics. */
export function comparisonSummary(
  subject: Record<string, number>,
  peers: Array<Record<string, number>>,
  metrics: string[],
): Array<{
  metric: string;
  subjectValue: number;
  peerAverage: number;
  peerMedian: number;
  peerMin: number;
  peerMax: number;
  percentileRank: UnitInterval;
  zScore: number;
  deltaFromAverage: number;
  status: "above_average" | "below_average" | "at_average";
}> {
  return metrics.map(metric => {
    const subjectValue = subject[metric] ?? 0;
    const peerValues = peers.map(p => p[metric] ?? 0);
    const avg = mean(peerValues);
    const med = median(peerValues);
    const mn = Math.min(...peerValues);
    const mx = Math.max(...peerValues);
    const sd = sampleStdDev(peerValues);
    const z = sd === 0 ? 0 : (subjectValue - avg) / sd;
    const below = peerValues.filter(v => v < subjectValue).length;
    const percentile = (below / peerValues.length) as UnitInterval;
    let status: "above_average" | "below_average" | "at_average" = "at_average";
    if (z > 0.1) status = "above_average";
    else if (z < -0.1) status = "below_average";
    return {
      metric,
      subjectValue,
      peerAverage: avg,
      peerMedian: med,
      peerMin: mn,
      peerMax: mx,
      percentileRank: percentile,
      zScore: z,
      deltaFromAverage: subjectValue - avg,
      status,
    };
  });
}

/** Compute the relative performance index (100 = peer average). */
export function relativePerformanceIndex(
  subjectValue: number,
  peerValues: number[],
): number {
  if (peerValues.length === 0) return 100;
  const avg = mean(peerValues);
  if (avg === 0) return 100;
  return (subjectValue / avg) * 100;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 14 — COHORT ANALYSIS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cohort analysis — group entities by acquisition/start date and track
 * retention, engagement, and revenue over time.
 */
export function cohortAnalysis<T extends { cohortDate: Date | ISODateString; periodsActive: number; revenue?: number; engagement?: number }>(
  entities: T[],
  cohortIntervalMs: number = 30 * 24 * 60 * 60 * 1000,
  maxPeriods: number = 12,
): CohortBucket[] {
  if (entities.length === 0) return [];
  const cohortMap = new Map<string, T[]>();
  for (const e of entities) {
    const cohortKey = cohortKeyForDate(e.cohortDate, cohortIntervalMs);
    if (!cohortMap.has(cohortKey)) cohortMap.set(cohortKey, []);
    cohortMap.get(cohortKey)!.push(e);
  }
  const result: CohortBucket[] = [];
  for (const [cohortKey, members] of cohortMap.entries()) {
    const cohortDate = new Date(parseInt(cohortKey, 10) * cohortIntervalMs);
    const periods: CohortBucket["periods"] = [];
    for (let p = 0; p <= maxPeriods; p++) {
      const activeMembers = members.filter(m => m.periodsActive >= p);
      const retentionRate = members.length === 0 ? 0 : activeMembers.length / members.length;
      periods.push({
        periodIndex: p,
        periodLabel: `Period ${p}`,
        active: activeMembers.length,
        retentionRate: retentionRate as UnitInterval,
        churnRate: (1 - retentionRate) as UnitInterval,
        revenue: activeMembers.reduce((s, m) => s + (m.revenue ?? 0), 0) || null,
        engagement: activeMembers.length > 0
          ? mean(activeMembers.map(m => m.engagement ?? 0))
          : null,
      });
    }
    const lifetimeValue = periods.reduce((s, p) => s + (p.revenue ?? 0), 0) / members.length;
    const averageLifetime = (() => {
      let totalLifetime = 0;
      for (const m of members) totalLifetime += m.periodsActive;
      return members.length === 0 ? 0 : totalLifetime / members.length;
    })();
    result.push({
      cohortKey,
      cohortDate,
      cohortSize: members.length,
      periods,
      lifetimeValue: lifetimeValue || null,
      averageLifetime,
    });
  }
  return result.sort((a, b) => toDate(a.cohortDate).getTime() - toDate(b.cohortDate).getTime());
}

/** Compute the cohort key for a date given an interval. */
export function cohortKeyForDate(date: Date | ISODateString, intervalMs: number): string {
  const t = toDate(date).getTime();
  return Math.floor(t / intervalMs).toString();
}

/** Compute the average retention rate across all cohorts for a given period. */
export function averageRetentionByPeriod(
  cohorts: CohortBucket[],
  periodIndex: number,
): UnitInterval {
  const validCohorts = cohorts.filter(c => periodIndex < c.periods.length);
  if (validCohorts.length === 0) return 0;
  const rates = validCohorts.map(c => c.periods[periodIndex].retentionRate);
  return mean(rates) as UnitInterval;
}

/** Compute the churn rate by period. */
export function churnRateByPeriod(
  cohorts: CohortBucket[],
  periodIndex: number,
): UnitInterval {
  const retention = averageRetentionByPeriod(cohorts, periodIndex);
  return (1 - retention) as UnitInterval;
}

/** Compute the cohort lifetime value. */
export function cohortLifetimeValue(
  cohorts: CohortBucket[],
): number {
  if (cohorts.length === 0) return 0;
  const ltvValues = cohorts
    .map(c => c.lifetimeValue)
    .filter((v): v is number => v !== null);
  return ltvValues.length === 0 ? 0 : mean(ltvValues);
}

/** Compute the cohort average lifetime. */
export function cohortAverageLifetime(
  cohorts: CohortBucket[],
): number {
  if (cohorts.length === 0) return 0;
  const lifetimes = cohorts
    .map(c => c.averageLifetime)
    .filter((v): v is number => v !== null);
  return lifetimes.length === 0 ? 0 : mean(lifetimes);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 15 — FUNNEL METRICS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Funnel analysis — track conversion through multiple stages.
 */
export function analyzeFunnel(
  stages: Array<{
    name: string;
    nameFr?: string;
    entered: number;
    completed: number;
    averageTimeSpentSec?: number[];
  }>,
): FunnelStage[] {
  if (stages.length === 0) return [];
  const result: FunnelStage[] = [];
  const initialSize = stages[0].entered;
  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];
    const droppedOff = stage.entered - stage.completed;
    const conversionRate = stage.entered === 0 ? 0 : stage.completed / stage.entered;
    const cumulativeConversion = initialSize === 0 ? 0 : stage.completed / initialSize;
    const dropOffRate = stage.entered === 0 ? 0 : droppedOff / stage.entered;
    const times = stage.averageTimeSpentSec ?? [];
    result.push({
      stageIndex: i,
      stageName: stage.name,
      stageNameFr: stage.nameFr,
      entered: stage.entered,
      completed: stage.completed,
      droppedOff,
      conversionRate: conversionRate as UnitInterval,
      cumulativeConversion: cumulativeConversion as UnitInterval,
      dropOffRate: dropOffRate as UnitInterval,
      averageTimeSpentSec: times.length > 0 ? mean(times) : null,
      medianTimeSpentSec: times.length > 0 ? median(times) : null,
    });
  }
  return result;
}

/** Compute the overall funnel conversion rate. */
export function funnelOverallConversion(stages: FunnelStage[]): UnitInterval {
  if (stages.length < 2) return 0;
  return stages[stages.length - 1].cumulativeConversion;
}

/** Compute the funnel drop-off rate. */
export function funnelDropOffRate(stages: FunnelStage[]): UnitInterval {
  if (stages.length < 2) return 0;
  return (1 - stages[stages.length - 1].cumulativeConversion) as UnitInterval;
}

/** Identify the biggest bottleneck in the funnel. */
export function funnelBiggestBottleneck(stages: FunnelStage[]): FunnelStage | null {
  if (stages.length === 0) return null;
  let biggest = stages[0];
  for (const stage of stages) {
    if (stage.dropOffRate > biggest.dropOffRate) biggest = stage;
  }
  return biggest;
}

/** Compute the average time to convert (sum of average stage times). */
export function funnelAverageTimeToConvert(stages: FunnelStage[]): number | null {
  const validTimes = stages
    .map(s => s.averageTimeSpentSec)
    .filter((t): t is number => t !== null);
  if (validTimes.length === 0) return null;
  return sum(validTimes);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 16 — KPI DEFINITIONS AND CALCULATORS
// ─────────────────────────────────────────────────────────────────────────────

/** Registry of all KPI definitions. */
export const KPI_DEFINITIONS: KpiDefinition[] = [
  {
    id: "reputation_score",
    name: "Reputation Score",
    nameFr: "Score de réputation",
    description: "Composite weighted reputation score (0-100)",
    descriptionFr: "Score composite de réputation (0-100)",
    category: "reputation",
    unit: "/100",
    format: "number",
    direction: "higher_better",
    benchmarkType: "peer",
    target: 75,
    warningThreshold: 50,
    criticalThreshold: 30,
    formula: "weighted(sentiment, 100-risk, sov, aiVisibility, influence, velocity)",
    calculator: (inputs) => computeReputationScore({
      sentimentScore: (inputs.sentimentScore as number) ?? 0.5,
      riskScore: (inputs.riskScore as number) ?? 50,
      shareOfVoice: (inputs.shareOfVoice as number) ?? 0.1,
      aiVisibilityScore: (inputs.aiVisibilityScore as number) ?? 0.3,
      influenceScore: (inputs.influenceScore as number) ?? 0.3,
      velocityScore: (inputs.velocityScore as number) ?? 0,
    }),
  },
  {
    id: "sentiment_score",
    name: "Sentiment Score",
    nameFr: "Score de sentiment",
    description: "Weighted average sentiment of mentions (0-1)",
    descriptionFr: "Sentiment moyen pondéré des mentions (0-1)",
    category: "sentiment",
    unit: "",
    format: "decimal",
    direction: "higher_better",
    benchmarkType: "peer",
    target: 0.7,
    warningThreshold: 0.45,
    criticalThreshold: 0.3,
    formula: "weightedMean(mention.sentimentScore, mention.weight)",
    calculator: (inputs) => computeSentimentScore(
      ((inputs.mentions as Array<{ sentimentScore: number; weight?: number }>) ?? []).map((m) => ({ sentimentScore: m.sentimentScore, weight: m.weight })),
    ),
  },
  {
    id: "net_sentiment_score",
    name: "Net Sentiment Score",
    nameFr: "Score net de sentiment",
    description: "Percentage positive - percentage negative",
    descriptionFr: "Pourcentage positif - pourcentage négatif",
    category: "sentiment",
    unit: "%",
    format: "percentage",
    direction: "higher_better",
    benchmarkType: "peer",
    target: 40,
    warningThreshold: 0,
    criticalThreshold: -20,
    formula: "(positive/total - negative/total) * 100",
    calculator: (inputs) => netSentimentScore(
      (inputs.positive as number) ?? 0, (inputs.negative as number) ?? 0, (inputs.neutral as number) ?? 0,
    ),
  },
  {
    id: "risk_score",
    name: "Risk Score",
    nameFr: "Score de risque",
    description: "Aggregate weighted risk score (0-100)",
    descriptionFr: "Score de risque agrégé pondéré (0-100)",
    category: "risk",
    unit: "/100",
    format: "number",
    direction: "lower_better",
    benchmarkType: "peer",
    target: 30,
    warningThreshold: 50,
    criticalThreshold: 70,
    formula: "weightedMean(category.score, category.weight)",
    calculator: (inputs) => aggregateRiskScore(
      ((inputs.categoryScores as Array<{ score: number; weight: number; confidence?: number }>) ?? []).map((c) => ({
        score: c.score, weight: c.weight, confidence: c.confidence,
      })),
    ),
  },
  {
    id: "share_of_voice",
    name: "Share of Voice",
    nameFr: "Part de voix",
    description: "Share of mentions relative to peer group (0-1)",
    descriptionFr: "Part des mentions par rapport au groupe de pairs (0-1)",
    category: "share_of_voice",
    unit: "",
    format: "percentage",
    direction: "higher_better",
    benchmarkType: "peer",
    target: 0.2,
    warningThreshold: 0.05,
    criticalThreshold: 0.02,
    formula: "companyMentions / totalMentions",
    calculator: (inputs) => {
      const total = (inputs.totalMentions as number) ?? 0;
      const company = (inputs.companyMentions as number) ?? 0;
      return total === 0 ? 0 : company / total;
    },
  },
  {
    id: "ai_visibility_score",
    name: "AI Visibility Score",
    nameFr: "Score de visibilité IA",
    description: "Visibility in AI assistants (0-1)",
    descriptionFr: "Visibilité dans les assistants IA (0-1)",
    category: "ai_visibility",
    unit: "",
    format: "decimal",
    direction: "higher_better",
    benchmarkType: "peer",
    target: 0.5,
    warningThreshold: 0.2,
    criticalThreshold: 0.1,
    formula: "weighted(mentionFrequency, sourceDiversity, positiveShare, accuracy, freshness)",
    calculator: (inputs) => computeAiVisibilityScore({
      aiMentionCount: (inputs.aiMentionCount as number) ?? 0,
      aiSourceCount: (inputs.aiSourceCount as number) ?? 0,
      totalAiQueries: (inputs.totalAiQueries as number) ?? 0,
      positiveShare: (inputs.positiveShare as number) ?? 0.5,
      accuracyScore: (inputs.accuracyScore as number) ?? 0.7,
      freshnessScore: (inputs.freshnessScore as number) ?? 0.7,
      benchmarkAvg: (inputs.benchmarkAvg as number) ?? 0,
    }),
  },
  {
    id: "influence_score",
    name: "Influence Score",
    nameFr: "Score d'influence",
    description: "Reach × engagement × authority (0-1)",
    descriptionFr: "Portée × engagement × autorité (0-1)",
    category: "influence",
    unit: "",
    format: "decimal",
    direction: "higher_better",
    benchmarkType: "peer",
    target: 0.5,
    warningThreshold: 0.2,
    criticalThreshold: 0.1,
    formula: "reach * engagement * authority",
    calculator: (inputs) => computeInfluenceScore({
      reach: (inputs.reach as number) ?? 0,
      engagementRate: (inputs.engagementRate as number) ?? 0,
      authorityScore: (inputs.authorityScore as number) ?? 0.5,
      maxReach: inputs.maxReach as number | undefined,
    }),
  },
  {
    id: "mention_velocity",
    name: "Mention Velocity",
    nameFr: "Vélocité des mentions",
    description: "Change in mention count per period",
    descriptionFr: "Variation du nombre de mentions par période",
    category: "velocity",
    unit: "/period",
    format: "number",
    direction: "neutral",
    benchmarkType: "internal",
    formula: "sma(recent) - sma(previous)",
    calculator: (inputs) => mentionVelocity(
      ((inputs.counts as Array<{ date: string | Date; count: number }>) ?? []).map((c) => ({ date: c.date as ISODateString, count: c.count })),
      (inputs.windowSize as number) ?? 7,
    ),
  },
  {
    id: "alert_velocity",
    name: "Alert Velocity",
    nameFr: "Vélocité des alertes",
    description: "Change in alert count per period",
    descriptionFr: "Variation du nombre d'alertes par période",
    category: "velocity",
    unit: "/period",
    format: "number",
    direction: "lower_better",
    benchmarkType: "internal",
    formula: "sma(recent_alerts) - sma(previous_alerts)",
    calculator: (inputs) => alertVelocity(
      ((inputs.alertCounts as Array<{ date: string | Date; count: number }>) ?? []).map((c) => ({ date: c.date as ISODateString, count: c.count })),
      (inputs.windowSize as number) ?? 7,
    ),
  },
  {
    id: "engagement_rate",
    name: "Engagement Rate",
    nameFr: "Taux d'engagement",
    description: "Engagement (likes + shares + comments) / reach",
    descriptionFr: "Engagement (likes + partages + commentaires) / portée",
    category: "engagement",
    unit: "",
    format: "percentage",
    direction: "higher_better",
    benchmarkType: "peer",
    target: 0.05,
    warningThreshold: 0.02,
    criticalThreshold: 0.005,
    formula: "(likes + shares + comments) / reach",
    calculator: (inputs) => {
      const reach = (inputs.reach as number) ?? 0;
      if (reach === 0) return 0;
      const total = ((inputs.likes as number) ?? 0) + ((inputs.shares as number) ?? 0) + ((inputs.comments as number) ?? 0);
      return total / reach;
    },
  },
  {
    id: "sentiment_polarity",
    name: "Sentiment Polarity",
    nameFr: "Polarité du sentiment",
    description: "(positive - negative) / total",
    descriptionFr: "(positif - négatif) / total",
    category: "sentiment",
    unit: "",
    format: "decimal",
    direction: "higher_better",
    benchmarkType: "peer",
    target: 0.4,
    warningThreshold: 0,
    criticalThreshold: -0.2,
    formula: "(positive - negative) / total",
    calculator: (inputs) => sentimentPolarity(
      (inputs.positive as number) ?? 0, (inputs.negative as number) ?? 0, (inputs.neutral as number) ?? 0,
    ),
  },
  {
    id: "risk_volatility",
    name: "Risk Volatility",
    nameFr: "Volatilité du risque",
    description: "Standard deviation of risk score changes",
    descriptionFr: "Écart-type des variations du score de risque",
    category: "risk",
    unit: "",
    format: "decimal",
    direction: "lower_better",
    benchmarkType: "internal",
    target: 5,
    warningThreshold: 10,
    criticalThreshold: 20,
    formula: "stddev(diff(riskScores))",
    calculator: (inputs) => riskVolatility(
      ((inputs.scores as Array<{ date: string | Date; score: number }>) ?? []).map((s) => ({ date: s.date as ISODateString, score: s.score })),
    ),
  },
  {
    id: "share_of_voice_concentration",
    name: "SoV Concentration (HHI)",
    nameFr: "Concentration de PdV (HHI)",
    description: "Herfindahl-Hirschman Index of share of voice",
    descriptionFr: "Indice Herfindahl-Hirschman de la part de voix",
    category: "share_of_voice",
    unit: "",
    format: "decimal",
    direction: "neutral",
    benchmarkType: "internal",
    formula: "sum(share^2)",
    calculator: (inputs) => shareOfVoiceConcentration(
      ((inputs.shares as Array<{ shareOfVoice: number }>) ?? []).map((s) => ({ shareOfVoice: s.shareOfVoice })),
    ),
  },
  {
    id: "ai_mention_accuracy_rate",
    name: "AI Mention Accuracy Rate",
    nameFr: "Taux de précision des mentions IA",
    description: "Percentage of AI mentions that are factually accurate",
    descriptionFr: "Pourcentage de mentions IA factuellement correctes",
    category: "ai_visibility",
    unit: "",
    format: "percentage",
    direction: "higher_better",
    benchmarkType: "peer",
    target: 0.9,
    warningThreshold: 0.7,
    criticalThreshold: 0.5,
    formula: "accurate / total",
    calculator: (inputs) => aiMentionAccuracyRate(
      ((inputs.mentions as Array<{ isAccurate: boolean; weight?: number }>) ?? []).map((m) => ({ isAccurate: m.isAccurate, weight: m.weight })),
    ),
  },
  {
    id: "ai_hallucination_rate",
    name: "AI Hallucination Rate",
    nameFr: "Taux d'hallucination IA",
    description: "Percentage of AI mentions that are hallucinated",
    descriptionFr: "Pourcentage de mentions IA hallucinées",
    category: "ai_visibility",
    unit: "",
    format: "percentage",
    direction: "lower_better",
    benchmarkType: "peer",
    target: 0.02,
    warningThreshold: 0.1,
    criticalThreshold: 0.25,
    formula: "hallucinations / total",
    calculator: (inputs) => aiHallucinationRate(
      ((inputs.mentions as Array<{ isHallucination: boolean; weight?: number }>) ?? []).map((m) => ({ isHallucination: m.isHallucination, weight: m.weight })),
    ),
  },
  {
    id: "outlet_credibility_score",
    name: "Outlet Credibility Score",
    nameFr: "Score de crédibilité des médias",
    description: "Weighted credibility of media outlets mentioning the company",
    descriptionFr: "Crédibilité pondérée des médias mentionnant l'entreprise",
    category: "quality",
    unit: "",
    format: "decimal",
    direction: "higher_better",
    benchmarkType: "peer",
    target: 0.7,
    warningThreshold: 0.5,
    criticalThreshold: 0.3,
    formula: "weightedMean(outlet.credibility, mention.weight)",
    calculator: (inputs) => {
      const outlets = (inputs.outlets as Array<{ weight?: number; credibility: number }>) ?? [];
      if (outlets.length === 0) return 0.5;
      const weights = outlets.map((o) => o.weight ?? 1);
      const scores = outlets.map((o) => o.credibility);
      return weightedMean(scores, weights);
    },
  },
  {
    id: "media_reach_total",
    name: "Total Media Reach",
    nameFr: "Portée médiatique totale",
    description: "Sum of reach across all mentions",
    descriptionFr: "Somme de la portée de toutes les mentions",
    category: "engagement",
    unit: "",
    format: "number",
    direction: "higher_better",
    benchmarkType: "peer",
    target: 1_000_000,
    warningThreshold: 100_000,
    criticalThreshold: 10_000,
    formula: "sum(mention.reach)",
    calculator: (inputs) => sum(((inputs.reaches as number[]) ?? []) as number[]),
  },
  {
    id: "media_reach_avg",
    name: "Average Media Reach",
    nameFr: "Portée médiatique moyenne",
    description: "Average reach per mention",
    descriptionFr: "Portée moyenne par mention",
    category: "engagement",
    unit: "",
    format: "number",
    direction: "higher_better",
    benchmarkType: "peer",
    target: 10_000,
    warningThreshold: 1_000,
    criticalThreshold: 100,
    formula: "mean(mention.reach)",
    calculator: (inputs) => mean(((inputs.reaches as number[]) ?? []) as number[]),
  },
  {
    id: "mention_count_total",
    name: "Total Mention Count",
    nameFr: "Nombre total de mentions",
    description: "Total number of mentions in the period",
    descriptionFr: "Nombre total de mentions dans la période",
    category: "engagement",
    unit: "",
    format: "number",
    direction: "higher_better",
    benchmarkType: "peer",
    target: 500,
    warningThreshold: 100,
    criticalThreshold: 20,
    formula: "count(mentions)",
    calculator: (inputs) => (inputs.mentionCount as number) ?? 0,
  },
];

/** Compute a KPI from its definition and inputs. */
export function computeKpi(
  definition: KpiDefinition,
  inputs: Record<string, unknown>,
  options: {
    benchmark?: number;
    previousValue?: number;
    trend?: RiskTrajectory;
    sampleSize?: number;
  } = {},
): KpiResult {
  const value = definition.calculator(inputs);
  let status: KpiResult["status"] = "good";
  if (definition.direction === "higher_better") {
    if (definition.criticalThreshold !== undefined && value <= definition.criticalThreshold) status = "critical";
    else if (definition.warningThreshold !== undefined && value <= definition.warningThreshold) status = "warning";
    else if (definition.target !== undefined && value < definition.target * 0.8) status = "watch";
  } else if (definition.direction === "lower_better") {
    if (definition.criticalThreshold !== undefined && value >= definition.criticalThreshold) status = "critical";
    else if (definition.warningThreshold !== undefined && value >= definition.warningThreshold) status = "warning";
    else if (definition.target !== undefined && value > definition.target * 1.2) status = "watch";
  }
  const formatted = definition.formatter ? definition.formatter(value) : formatMetricValue(value, definition.format);
  const deltaFromPrevious = options.previousValue !== undefined ? value - options.previousValue : undefined;
  const deltaPercent = options.previousValue !== undefined && options.previousValue !== 0
    ? (value - options.previousValue) / Math.abs(options.previousValue)
    : undefined;
  const benchmarkDelta = options.benchmark !== undefined ? value - options.benchmark : undefined;
  return {
    definition,
    value,
    formatted,
    unit: definition.unit,
    status,
    deltaFromPrevious,
    deltaPercent,
    benchmark: options.benchmark,
    benchmarkDelta,
    trend: options.trend,
    sampleSize: options.sampleSize,
    computedAt: new Date().toISOString() as ISODateString,
  };
}

/** Format a metric value according to its format type. */
export function formatMetricValue(value: number, format: KpiDefinition["format"]): string {
  switch (format) {
    case "number":
      return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
    case "percentage":
      return `${(value * 100).toFixed(2)}%`;
    case "currency":
      return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
    case "decimal":
      return value.toFixed(4);
    case "duration":
      return `${value.toFixed(0)}s`;
    case "ratio":
      return value.toFixed(2);
    default:
      return value.toLocaleString("en-US");
  }
}

/** Compute multiple KPIs at once. */
export function computeKpis(
  definitions: KpiDefinition[],
  inputsByKpi: Record<string, Record<string, unknown>>,
  optionsByKpi?: Record<string, { benchmark?: number; previousValue?: number; trend?: RiskTrajectory; sampleSize?: number }>,
): KpiResult[] {
  return definitions.map(def => {
    const inputs = inputsByKpi[def.id] ?? {};
    const opts = optionsByKpi?.[def.id] ?? {};
    return computeKpi(def, inputs, opts);
  });
}

/** Get a KPI definition by ID. */
export function getKpiDefinition(id: string): KpiDefinition | undefined {
  return KPI_DEFINITIONS.find(k => k.id === id);
}

/** Get all KPI definitions in a category. */
export function getKpisByCategory(category: KpiDefinition["category"]): KpiDefinition[] {
  return KPI_DEFINITIONS.filter(k => k.category === category);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 17 — DASHBOARD AGGREGATION FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Aggregate metrics for an executive dashboard.
 */
export function aggregateExecutiveDashboard(input: {
  companyId: UUID;
  mentionCount: number;
  articleCount: number;
  alertCount: number;
  criticalAlertCount: number;
  riskScore: Percentage;
  previousRiskScore: Percentage;
  sentimentScore: UnitInterval;
  previousSentimentScore: UnitInterval;
  shareOfVoice: UnitInterval;
  previousShareOfVoice: UnitInterval;
  aiVisibilityScore: UnitInterval;
  influenceScore: UnitInterval;
  velocityScore: UnitInterval;
  peerRiskScores: Array<{ id: UUID; value: Percentage }>;
  peerSentimentScores: Array<{ id: UUID; value: UnitInterval }>;
}): {
  reputationScore: Percentage;
  reputationLevel: RiskLevel;
  reputationTrend: RiskTrajectory;
  reputationPercentile: UnitInterval;
  riskTrend: RiskTrajectory;
  sentimentTrend: RiskTrajectory;
  shareOfVoiceTrend: RiskTrajectory;
  topKpis: KpiResult[];
  alertsSeverityBreakdown: Record<string, number>;
  executiveSummary: string;
} {
  const reputationScore = computeReputationScore({
    sentimentScore: input.sentimentScore,
    riskScore: input.riskScore,
    shareOfVoice: input.shareOfVoice,
    aiVisibilityScore: input.aiVisibilityScore,
    influenceScore: input.influenceScore,
    velocityScore: input.velocityScore,
  });
  const reputationLevel = scoreToRiskLevel(100 - reputationScore);
  const reputationPercentile = reputationPercentileRank(
    reputationScore,
    input.peerRiskScores.map(p => 100 - p.value),
  );
  const riskTrend = riskTrajectory([
    { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), score: input.previousRiskScore },
    { date: new Date(), score: input.riskScore },
  ]);
  const sentimentTrend = detectTrend([input.previousSentimentScore, input.sentimentScore]);
  const shareOfVoiceTrend = detectTrend([input.previousShareOfVoice, input.shareOfVoice]);
  const topKpis: KpiResult[] = [
    computeKpi(getKpiDefinition("reputation_score")!, {
      sentimentScore: input.sentimentScore,
      riskScore: input.riskScore,
      shareOfVoice: input.shareOfVoice,
      aiVisibilityScore: input.aiVisibilityScore,
      influenceScore: input.influenceScore,
      velocityScore: input.velocityScore,
    }),
    computeKpi(getKpiDefinition("risk_score")!, {
      categoryScores: [{ score: input.riskScore, weight: 1 }],
    }, { previousValue: input.previousRiskScore, trend: riskTrend }),
    computeKpi(getKpiDefinition("sentiment_score")!, {
      mentions: [{ sentimentScore: input.sentimentScore }],
    }, { previousValue: input.previousSentimentScore, trend: sentimentTrend }),
    computeKpi(getKpiDefinition("share_of_voice")!, {
      companyMentions: input.mentionCount,
      totalMentions: input.mentionCount / Math.max(0.001, input.shareOfVoice),
    }, { previousValue: input.previousShareOfVoice, trend: shareOfVoiceTrend }),
    computeKpi(getKpiDefinition("ai_visibility_score")!, {
      aiMentionCount: 0, aiSourceCount: 0, totalAiQueries: 0,
      positiveShare: input.sentimentScore, accuracyScore: 0.7, freshnessScore: 0.7,
      benchmarkAvg: 0,
    }),
  ];
  const alertsSeverityBreakdown: Record<string, number> = {
    info: Math.max(0, input.alertCount - input.criticalAlertCount),
    low: 0,
    moderate: 0,
    elevated: 0,
    high: 0,
    critical: input.criticalAlertCount,
  };
  const executiveSummary = `Reputation score: ${reputationScore.toFixed(1)}/100 (${reputationLevel}). ` +
    `Risk is ${riskTrend} (${input.riskScore.toFixed(1)}/100). ` +
    `Sentiment is ${sentimentTrend} (${(input.sentimentScore * 100).toFixed(1)}%). ` +
    `${input.alertCount} alerts (${input.criticalAlertCount} critical). ` +
    `${input.mentionCount} mentions, ${input.articleCount} articles. ` +
    `Reputation percentile: ${(reputationPercentile * 100).toFixed(0)}%.`;
  return {
    reputationScore,
    reputationLevel,
    reputationTrend: reputationTrajectory([
      { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), score: 100 - input.previousRiskScore },
      { date: new Date(), score: reputationScore },
    ]),
    reputationPercentile,
    riskTrend,
    sentimentTrend,
    shareOfVoiceTrend,
    topKpis,
    alertsSeverityBreakdown,
    executiveSummary,
  };
}

/**
 * Aggregate metrics for an analyst dashboard.
 */
export function aggregateAnalystDashboard(input: {
  companyId: UUID;
  mentions: Array<{ sentimentScore: number; reachEstimate: number; channel: string; date: Date | ISODateString }>;
  articles: Array<{ riskScore: number; publishedAt: Date | ISODateString }>;
  alerts: Array<{ severity: string; triggeredAt: Date | ISODateString }>;
  categoryScores: Array<{ categoryId: string; group: RiskGroup; score: Percentage; weight: number }>;
}): {
  overallRiskScore: Percentage;
  overallRiskLevel: RiskLevel;
  groupAverages: Array<{ group: RiskGroup; averageScore: Percentage; averageLevel: RiskLevel }>;
  sentimentScore: UnitInterval;
  sentimentDistribution: Record<MentionSentiment, number>;
  sentimentTrend: RiskTrajectory;
  mentionCount: number;
  articleCount: number;
  alertCount: number;
  criticalAlertCount: number;
  alertsBySeverity: Record<string, number>;
  reachByChannel: Array<{ channel: string; reach: number; mentionCount: number }>;
  influenceByChannel: Array<{ channel: string; influenceScore: UnitInterval; mentionCount: number; totalReach: number }>;
  riskConcentration: UnitInterval;
  topAnomalies: AnomalyResult[];
  mentionVelocityValue: number;
  mentionSpikeCount: number;
  summary: string;
} {
  const overallRiskScore = aggregateRiskScore(input.categoryScores.map(c => ({ score: c.score, weight: c.weight })));
  const overallRiskLevel = scoreToRiskLevel(overallRiskScore);
  const groupAverages = aggregateRiskByGroup(input.categoryScores);
  const sentimentScore = computeSentimentScore(input.mentions.map(m => ({ sentimentScore: m.sentimentScore })));
  const sentimentDist = sentimentDistribution(input.mentions.map(m => ({ sentimentScore: m.sentimentScore })));
  const sortedMentions = sortByDate(input.mentions.map(m => ({ date: m.date, value: m.sentimentScore })));
  const sentimentTrend = detectTrend(extractValues(sortedMentions));
  const reachByChannel: Array<{ channel: string; reach: number; mentionCount: number }> = [];
  const channelMap = new Map<string, Array<typeof input.mentions[number]>>();
  for (const m of input.mentions) {
    if (!channelMap.has(m.channel)) channelMap.set(m.channel, []);
    channelMap.get(m.channel)!.push(m);
  }
  for (const [channel, ms] of channelMap.entries()) {
    reachByChannel.push({
      channel,
      reach: sum(ms.map(m => m.reachEstimate)),
      mentionCount: ms.length,
    });
  }
  const inflByChannel = influenceByChannel(
    input.mentions.map(m => ({
      channel: m.channel,
      reachEstimate: m.reachEstimate,
      likeCount: 0, shareCount: 0, commentCount: 0, viewCount: m.reachEstimate,
    })),
  );
  const riskConcentrationValue = riskConcentration(input.categoryScores, 5);
  const anomalies = detectMovingAverageAnomalies(sortedMentions, 7, 2.5);
  const counts = input.mentions.reduce((acc, m) => {
    const key = toISODate(m.date).slice(0, 10);
    acc.set(key, (acc.get(key) ?? 0) + 1);
    return acc;
  }, new Map<string, number>());
  const sortedCounts = [...counts.entries()].sort();
  const timeSeries = sortedCounts.map(([key, count]) => ({ date: key as ISODateString, count }));
  const mentionVelocityValue = mentionVelocity(timeSeries);
  const mentionSpikes = detectMentionSpike(timeSeries);
  const alertsBySeverity: Record<string, number> = {};
  for (const a of input.alerts) {
    alertsBySeverity[a.severity] = (alertsBySeverity[a.severity] ?? 0) + 1;
  }
  const summary = `Overall risk: ${overallRiskScore.toFixed(1)}/100 (${overallRiskLevel}). ` +
    `Sentiment: ${(sentimentScore * 100).toFixed(1)}% (${sentimentTrend}). ` +
    `${input.mentions.length} mentions, ${input.articles.length} articles, ${input.alerts.length} alerts. ` +
    `${mentionSpikes.length} mention spikes detected. ${anomalies.length} sentiment anomalies.`;
  return {
    overallRiskScore,
    overallRiskLevel,
    groupAverages,
    sentimentScore,
    sentimentDistribution: sentimentDist,
    sentimentTrend,
    mentionCount: input.mentions.length,
    articleCount: input.articles.length,
    alertCount: input.alerts.length,
    criticalAlertCount: input.alerts.filter(a => a.severity === "critical").length,
    alertsBySeverity,
    reachByChannel,
    influenceByChannel: inflByChannel,
    riskConcentration: riskConcentrationValue,
    topAnomalies: anomalies.slice(0, 10),
    mentionVelocityValue,
    mentionSpikeCount: mentionSpikes.length,
    summary,
  };
}

/**
 * Aggregate metrics for a trader dashboard.
 */
export function aggregateTraderDashboard(input: {
  companyId: UUID;
  stockPrices: Array<{ date: Date | ISODateString; close: number; volume: number }>;
  newsSentiment: UnitInterval;
  alertCount: number;
  criticalAlertCount: number;
  riskScore: Percentage;
  peerRiskScores: Array<{ id: UUID; value: Percentage }>;
}): {
  latestPrice: number;
  priceChange: number;
  priceChangePercent: number;
  volumeAvg: number;
  volatility: number;
  rsi: number;
  macd: number;
  macdSignal: number;
  sentimentPriceCorrelation: number;
  riskAdjustedScore: number;
  summary: string;
} {
  const sorted = sortByDate(input.stockPrices.map(p => ({ date: p.date, value: p.close })));
  const values = extractValues(sorted);
  const volumes = input.stockPrices.map(p => p.volume);
  const latestPrice = values[values.length - 1] ?? 0;
  const firstPrice = values[0] ?? latestPrice;
  const priceChange = latestPrice - firstPrice;
  const priceChangePercent = firstPrice === 0 ? 0 : priceChange / firstPrice;
  const volumeAvg = mean(volumes);
  const volatility = sampleStdDev(percentChange(values));
  const rsiArr = computeRsi(values, 14);
  const rsi = rsiArr[rsiArr.length - 1] ?? 50;
  const macdResult = computeMacd(values);
  const macd = macdResult.macd[macdResult.macd.length - 1] ?? 0;
  const macdSignal = macdResult.signal[macdResult.signal.length - 1] ?? 0;
  const sentimentValues = new Array(values.length).fill(input.newsSentiment);
  const sentimentPriceCorrelation = correlation(sentimentValues, values);
  const riskAdjustedScore = input.riskScore === 0 ? 0 : (100 - input.riskScore) * Math.sqrt(Math.abs(priceChangePercent));
  const summary = `Latest: ${latestPrice.toFixed(2)} (${priceChangePercent >= 0 ? "+" : ""}${(priceChangePercent * 100).toFixed(2)}%). ` +
    `Volatility: ${(volatility * 100).toFixed(2)}%. RSI: ${rsi.toFixed(1)}. ` +
    `Risk: ${input.riskScore.toFixed(1)}/100. ${input.alertCount} alerts (${input.criticalAlertCount} critical). ` +
    `Sentiment-price correlation: ${sentimentPriceCorrelation.toFixed(2)}.`;
  return {
    latestPrice,
    priceChange,
    priceChangePercent,
    volumeAvg,
    volatility,
    rsi,
    macd,
    macdSignal,
    sentimentPriceCorrelation,
    riskAdjustedScore,
    summary,
  };
}

/**
 * Aggregate metrics for an investor dashboard.
 */
export function aggregateInvestorDashboard(input: {
  companyId: UUID;
  financials: Array<{ fiscalYear: number; revenue: number; netIncome: number; totalEquity: number; totalDebt: number }>;
  marketCap: number;
  riskScore: Percentage;
  aiVisibilityScore: UnitInterval;
  sentimentScore: UnitInterval;
  esgScore: UnitInterval | null;
  peerRiskScores: Array<{ id: UUID; value: Percentage }>;
}): {
  revenueGrowth: number;
  revenueCagr3y: number;
  netMarginAvg: number;
  debtToEquityAvg: number;
  roeAvg: number;
  riskPercentile: UnitInterval;
  riskAdjustedReturn: number;
  aiVisibilityPercentile: UnitInterval;
  overallHealthScore: Percentage;
  summary: string;
} {
  const sorted = [...input.financials].sort((a, b) => a.fiscalYear - b.fiscalYear);
  const revenues = sorted.map(f => f.revenue);
  const revenueGrowth = revenues.length >= 2 && revenues[revenues.length - 2] !== 0
    ? (revenues[revenues.length - 1] - revenues[revenues.length - 2]) / Math.abs(revenues[revenues.length - 2])
    : 0;
  const revenueCagr3y = revenues.length >= 4 && revenues[revenues.length - 4] !== 0
    ? Math.pow(revenues[revenues.length - 1] / revenues[revenues.length - 4], 1 / 3) - 1
    : 0;
  const netMargins = sorted.map(f => f.revenue === 0 ? 0 : f.netIncome / f.revenue);
  const netMarginAvg = mean(netMargins);
  const debtToEquityRatios = sorted.map(f => f.totalEquity === 0 ? 0 : f.totalDebt / f.totalEquity);
  const debtToEquityAvg = mean(debtToEquityRatios);
  const roeValues = sorted.map(f => f.totalEquity === 0 ? 0 : f.netIncome / f.totalEquity);
  const roeAvg = mean(roeValues);
  const riskPercentile = peerPercentile(input.riskScore, input.peerRiskScores.map(p => p.value));
  const riskAdjustedReturn = input.riskScore === 0 ? 0 : (roeAvg * 100) / input.riskScore;
  const peerAiScores = input.peerRiskScores.map(_ => 0.5);
  const aiVisibilityPercentile = aiVisibilityPercentileRank(input.aiVisibilityScore, peerAiScores as UnitInterval[]);
  const overallHealthScore = aggregateRiskScore([
    { score: (1 - input.riskScore / 100) * 100, weight: 0.3 },
    { score: input.sentimentScore * 100, weight: 0.2 },
    { score: input.aiVisibilityScore * 100, weight: 0.15 },
    { score: (input.esgScore ?? 0.5) * 100, weight: 0.15 },
    { score: Math.min(100, Math.max(0, revenueCagr3y * 100 + 50)), weight: 0.1 },
    { score: Math.min(100, Math.max(0, roeAvg * 100 + 50)), weight: 0.1 },
  ]);
  const summary = `Revenue growth: ${(revenueGrowth * 100).toFixed(1)}% (3Y CAGR ${(revenueCagr3y * 100).toFixed(1)}%). ` +
    `Avg net margin: ${(netMarginAvg * 100).toFixed(1)}%. Avg ROE: ${(roeAvg * 100).toFixed(1)}%. ` +
    `Debt-to-equity: ${debtToEquityAvg.toFixed(2)}. ` +
    `Risk: ${input.riskScore.toFixed(1)}/100 (${(riskPercentile * 100).toFixed(0)}th percentile). ` +
    `Overall health: ${overallHealthScore.toFixed(1)}/100.`;
  return {
    revenueGrowth,
    revenueCagr3y,
    netMarginAvg,
    debtToEquityAvg,
    roeAvg,
    riskPercentile,
    riskAdjustedReturn,
    aiVisibilityPercentile,
    overallHealthScore,
    summary,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 18 — REPORT GENERATION HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build the data payload for an executive brief report.
 */
export function buildExecutiveBriefData(input: {
  companyId: UUID;
  companyName: string;
  periodStart: ISODateString;
  periodEnd: ISODateString;
  overallRiskScore: Percentage;
  previousOverallRiskScore: Percentage;
  sentimentScore: UnitInterval;
  previousSentimentScore: UnitInterval;
  mentionCount: number;
  articleCount: number;
  alertCount: number;
  criticalAlertCount: number;
  topRisks: Array<{ categoryId: string; categoryName: string; score: Percentage; level: RiskLevel; trajectory: RiskTrajectory }>;
  topImprovements: Array<{ categoryId: string; categoryName: string; score: Percentage; level: RiskLevel; trajectory: RiskTrajectory }>;
  groupAverages: Array<{ group: RiskGroup; averageScore: Percentage; averageLevel: RiskLevel }>;
  recommendations: Array<{ priority: string; title: string; description: string }>;
  peerBenchmark: BenchmarkResult;
}): {
  title: string;
  titleFr: string;
  periodLabel: string;
  executiveSummary: string;
  keyFindings: string[];
  topRisks: typeof input.topRisks;
  topImprovements: typeof input.topImprovements;
  groupAverages: typeof input.groupAverages;
  recommendations: typeof input.recommendations;
  metrics: Record<string, KpiResult>;
  benchmarkSummary: string;
} {
  const periodLabel = `${toISODate(input.periodStart).slice(0, 10)} to ${toISODate(input.periodEnd).slice(0, 10)}`;
  const riskDelta = input.overallRiskScore - input.previousOverallRiskScore;
  const sentimentDelta = input.sentimentScore - input.previousSentimentScore;
  const executiveSummary = `${input.companyName} — ${periodLabel}. ` +
    `Overall risk score: ${input.overallRiskScore.toFixed(1)}/100 (${riskDelta >= 0 ? "+" : ""}${riskDelta.toFixed(1)} vs. previous period). ` +
    `Sentiment: ${(input.sentimentScore * 100).toFixed(1)}% (${sentimentDelta >= 0 ? "+" : ""}${(sentimentDelta * 100).toFixed(1)} pp). ` +
    `${input.mentionCount} mentions, ${input.articleCount} articles. ` +
    `${input.alertCount} alerts triggered (${input.criticalAlertCount} critical). ` +
    `Reputation percentile (peer): ${(input.peerBenchmark.percentileRank * 100).toFixed(0)}%.`;
  const keyFindings: string[] = [];
  if (input.criticalAlertCount > 0) {
    keyFindings.push(`${input.criticalAlertCount} critical alerts require immediate attention.`);
  }
  if (input.topRisks.length > 0 && input.topRisks[0].level === "critical") {
    keyFindings.push(`Top risk: ${input.topRisks[0].categoryName} scored ${input.topRisks[0].score.toFixed(0)}/100 (critical).`);
  }
  if (sentimentDelta < -0.05) {
    keyFindings.push(`Sentiment declined by ${Math.abs(sentimentDelta * 100).toFixed(1)} percentage points.`);
  } else if (sentimentDelta > 0.05) {
    keyFindings.push(`Sentiment improved by ${(sentimentDelta * 100).toFixed(1)} percentage points.`);
  }
  if (input.peerBenchmark.zScore < -1) {
    keyFindings.push(`Risk score is ${Math.abs(input.peerBenchmark.zScore).toFixed(1)}σ below peer average.`);
  } else if (input.peerBenchmark.zScore > 1) {
    keyFindings.push(`Risk score is ${input.peerBenchmark.zScore.toFixed(1)}σ above peer average (concerning).`);
  }
  for (const imp of input.topImprovements.slice(0, 2)) {
    keyFindings.push(`${imp.categoryName} improved (score ${imp.score.toFixed(0)}/100, ${imp.trajectory}).`);
  }
  const benchmarkSummary = `vs. peer group (n=${input.peerBenchmark.peerCount}): ` +
    `subject ${input.peerBenchmark.subjectValue.toFixed(1)}, ` +
    `peer avg ${input.peerBenchmark.peerAverage.toFixed(1)}, ` +
    `peer median ${input.peerBenchmark.peerMedian.toFixed(1)}, ` +
    `percentile ${(input.peerBenchmark.percentileRank * 100).toFixed(0)}%, ` +
    `z-score ${input.peerBenchmark.zScore.toFixed(2)}.`;
  return {
    title: `${input.companyName} — Executive Brief`,
    titleFr: `${input.companyName} — Note de synthèse`,
    periodLabel,
    executiveSummary,
    keyFindings,
    topRisks: input.topRisks,
    topImprovements: input.topImprovements,
    groupAverages: input.groupAverages,
    recommendations: input.recommendations,
    metrics: {},
    benchmarkSummary,
  };
}

/**
 * Build the data payload for a deep dive report.
 */
export function buildDeepDiveData(input: {
  companyId: UUID;
  companyName: string;
  periodStart: ISODateString;
  periodEnd: ISODateString;
  riskAssessment: {
    overallScore: Percentage;
    overallLevel: RiskLevel;
    categoryResults: Array<{
      categoryId: string;
      categoryName: string;
      score: Percentage;
      level: RiskLevel;
      trajectory: RiskTrajectory;
      indicators: Array<{ name: string; value: number; status: string }>;
      mitigation: string[];
    }>;
  };
  mentionTimeline: SentimentTimePoint[];
  topArticles: Array<{ title: string; url: string; publishedAt: ISODateString; sentimentScore: UnitInterval }>;
  peerBenchmark: BenchmarkResult;
}): {
  title: string;
  periodLabel: string;
  riskSummary: string;
  categoryBreakdown: Array<{ name: string; score: Percentage; level: RiskLevel; trajectory: RiskTrajectory }>;
  sentimentAnalysis: ReturnType<typeof sentimentTrendAnalysis>;
  topArticles: typeof input.topArticles;
  peerBenchmark: BenchmarkResult;
  recommendations: string[];
} {
  const periodLabel = `${toISODate(input.periodStart).slice(0, 10)} to ${toISODate(input.periodEnd).slice(0, 10)}`;
  const riskSummary = `Overall risk: ${input.riskAssessment.overallScore.toFixed(1)}/100 (${input.riskAssessment.overallLevel}). ` +
    `${input.riskAssessment.categoryResults.length} categories assessed.`;
  const sentimentAnalysisResult = sentimentTrendAnalysis(input.mentionTimeline);
  const recommendations: string[] = [];
  for (const cat of input.riskAssessment.categoryResults) {
    if (cat.level === "critical" || cat.level === "high") {
      recommendations.push(`URGENT: Address ${cat.categoryName} (score ${cat.score.toFixed(0)}/100). Mitigation: ${cat.mitigation.slice(0, 2).join("; ")}.`);
    }
  }
  if (sentimentAnalysisResult.trend === "falling" && sentimentAnalysisResult.slope < -0.02) {
    recommendations.push(`Sentiment is declining (slope ${sentimentAnalysisResult.slope.toFixed(4)}/period). Investigate root cause and respond.`);
  }
  return {
    title: `${input.companyName} — Deep Dive Analysis`,
    periodLabel,
    riskSummary,
    categoryBreakdown: input.riskAssessment.categoryResults.map(c => ({
      name: c.categoryName,
      score: c.score,
      level: c.level,
      trajectory: c.trajectory,
    })),
    sentimentAnalysis: sentimentAnalysisResult,
    topArticles: input.topArticles,
    peerBenchmark: input.peerBenchmark,
    recommendations,
  };
}

/**
 * Build the data payload for a watchlist digest.
 */
export function buildWatchlistDigestData(input: {
  watchlistId: UUID;
  watchlistName: string;
  periodStart: ISODateString;
  periodEnd: ISODateString;
  companies: Array<{
    id: UUID;
    name: string;
    score: Percentage;
    level: RiskLevel;
    trajectory: RiskTrajectory;
    sentimentScore: UnitInterval;
    mentionCount: number;
    alertCount: number;
  }>;
}): {
  title: string;
  periodLabel: string;
  companyCount: number;
  averageScore: Percentage;
  averageLevel: RiskLevel;
  topRisks: Array<{ id: UUID; name: string; score: Percentage; level: RiskLevel }>;
  topImprovements: Array<{ id: UUID; name: string; score: Percentage; level: RiskLevel }>;
  risingCount: number;
  fallingCount: number;
  stableCount: number;
  summary: string;
} {
  const periodLabel = `${toISODate(input.periodStart).slice(0, 10)} to ${toISODate(input.periodEnd).slice(0, 10)}`;
  const avgScore = mean(input.companies.map(c => c.score)) as Percentage;
  const avgLevel = scoreToRiskLevel(avgScore);
  const sorted = [...input.companies].sort((a, b) => b.score - a.score);
  const topRisks = sorted.slice(0, 5).map(c => ({ id: c.id, name: c.name, score: c.score, level: c.level }));
  const topImprovements = sorted.slice(-5).reverse().map(c => ({ id: c.id, name: c.name, score: c.score, level: c.level }));
  const rising = input.companies.filter(c => c.trajectory === "rising").length;
  const falling = input.companies.filter(c => c.trajectory === "falling").length;
  const stable = input.companies.filter(c => c.trajectory === "stable").length;
  const summary = `${input.watchlistName} — ${periodLabel}. ` +
    `${input.companies.length} companies tracked. ` +
    `Average risk: ${avgScore.toFixed(1)}/100 (${avgLevel}). ` +
    `${rising} rising, ${stable} stable, ${falling} falling. ` +
    `${input.companies.reduce((s, c) => s + c.alertCount, 0)} total alerts.`;
  return {
    title: `${input.watchlistName} — Watchlist Digest`,
    periodLabel,
    companyCount: input.companies.length,
    averageScore: avgScore,
    averageLevel: avgLevel,
    topRisks,
    topImprovements,
    risingCount: rising,
    fallingCount: falling,
    stableCount: stable,
    summary,
  };
}

/**
 * Build the data payload for a monthly summary report.
 */
export function buildMonthlySummaryData(input: {
  companyId: UUID;
  companyName: string;
  year: number;
  month: number;
  riskScoreAvg: Percentage;
  riskScoreMin: Percentage;
  riskScoreMax: Percentage;
  sentimentScoreAvg: UnitInterval;
  mentionCount: number;
  articleCount: number;
  alertCount: number;
  criticalAlertCount: number;
  topEvents: Array<{ title: string; date: ISODateString; impactScore: UnitInterval }>;
}): {
  title: string;
  periodLabel: string;
  summary: string;
  riskScoreRange: string;
  highlights: string[];
  metrics: Record<string, string>;
} {
  const monthName = new Date(input.year, input.month - 1, 1).toLocaleString("en-US", { month: "long" });
  const periodLabel = `${monthName} ${input.year}`;
  const summary = `${input.companyName} — ${periodLabel}. ` +
    `Avg risk: ${input.riskScoreAvg.toFixed(1)}/100 (range ${input.riskScoreMin.toFixed(0)}-${input.riskScoreMax.toFixed(0)}). ` +
    `Avg sentiment: ${(input.sentimentScoreAvg * 100).toFixed(1)}%. ` +
    `${input.mentionCount} mentions, ${input.articleCount} articles, ${input.alertCount} alerts (${input.criticalAlertCount} critical).`;
  const highlights: string[] = [];
  if (input.criticalAlertCount > 0) {
    highlights.push(`${input.criticalAlertCount} critical alerts in ${monthName}.`);
  }
  for (const event of input.topEvents.slice(0, 5)) {
    highlights.push(`${event.title} (${toISODate(event.date).slice(0, 10)}, impact ${(event.impactScore * 100).toFixed(0)}%).`);
  }
  return {
    title: `${input.companyName} — Monthly Summary (${periodLabel})`,
    periodLabel,
    summary,
    riskScoreRange: `${input.riskScoreMin.toFixed(0)} - ${input.riskScoreMax.toFixed(0)}`,
    highlights,
    metrics: {
      avgRiskScore: input.riskScoreAvg.toFixed(1),
      avgSentiment: (input.sentimentScoreAvg * 100).toFixed(1) + "%",
      mentionCount: input.mentionCount.toString(),
      articleCount: input.articleCount.toString(),
      alertCount: input.alertCount.toString(),
      criticalAlertCount: input.criticalAlertCount.toString(),
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 19 — EXPORT DATA FORMATTERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format an array of records for CSV export.
 */
export function formatCsv<T extends Record<string, unknown>>(
  records: T[],
  options: {
    columns?: Array<{ key: keyof T; header: string }>;
    delimiter?: string;
    quoteChar?: string;
    escapeChar?: string;
    lineTerminator?: string;
    includeHeader?: boolean;
    nullValue?: string;
  } = {},
): string {
  const {
    columns,
    delimiter = ",",
    quoteChar = '"',
    escapeChar = '"',
    lineTerminator = "\n",
    includeHeader = true,
    nullValue = "",
  } = options;
  if (records.length === 0) return "";
  const cols = columns ?? Object.keys(records[0]).map(k => ({ key: k as keyof T, header: k as string }));
  const escape = (value: unknown): string => {
    if (value === null || value === undefined) return nullValue;
    const str = typeof value === "object" ? JSON.stringify(value) : String(value);
    if (str.includes(delimiter) || str.includes(quoteChar) || str.includes("\n") || str.includes("\r")) {
      return quoteChar + str.replace(new RegExp(quoteChar, "g"), escapeChar + quoteChar) + quoteChar;
    }
    return str;
  };
  const lines: string[] = [];
  if (includeHeader) {
    lines.push(cols.map(c => escape(c.header)).join(delimiter));
  }
  for (const record of records) {
    lines.push(cols.map(c => escape(record[c.key])).join(delimiter));
  }
  return lines.join(lineTerminator);
}

/**
 * Format an array of records for JSON export.
 */
export function formatJson<T>(records: T[], options: {
  pretty?: boolean;
  includeMetadata?: boolean;
  metadata?: Record<string, unknown>;
} = {}): string {
  const { pretty = true, includeMetadata = false, metadata } = options;
  if (!includeMetadata) {
    return pretty ? JSON.stringify(records, null, 2) : JSON.stringify(records);
  }
  const payload = {
    metadata: metadata ?? { exportedAt: new Date().toISOString(), count: records.length },
    records,
  };
  return pretty ? JSON.stringify(payload, null, 2) : JSON.stringify(payload);
}

/**
 * Format an array of records for Excel-compatible HTML table export.
 */
export function formatHtmlTable<T extends Record<string, unknown>>(
  records: T[],
  options: {
    columns?: Array<{ key: keyof T; header: string }>;
    includeHeader?: boolean;
    tableClass?: string;
    headerClass?: string;
    rowClass?: string;
    cellClass?: string;
  } = {},
): string {
  const {
    columns,
    includeHeader = true,
    tableClass = "harch-export-table",
    headerClass = "harch-export-header",
    rowClass = "harch-export-row",
    cellClass = "harch-export-cell",
  } = options;
  if (records.length === 0) return `<table class="${tableClass}"></table>`;
  const cols = columns ?? Object.keys(records[0]).map(k => ({ key: k as keyof T, header: k as string }));
  const escape = (v: unknown): string => {
    if (v === null || v === undefined) return "";
    const str = typeof v === "object" ? JSON.stringify(v) : String(v);
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };
  const lines: string[] = [];
  lines.push(`<table class="${tableClass}">`);
  if (includeHeader) {
    lines.push(`<thead><tr class="${headerClass}">`);
    for (const c of cols) lines.push(`<th>${escape(c.header)}</th>`);
    lines.push("</tr></thead>");
  }
  lines.push("<tbody>");
  for (const record of records) {
    lines.push(`<tr class="${rowClass}">`);
    for (const c of cols) lines.push(`<td class="${cellClass}">${escape(record[c.key])}</td>`);
    lines.push("</tr>");
  }
  lines.push("</tbody></table>");
  return lines.join("\n");
}

/**
 * Format a time series for chart export (e.g., for Recharts).
 */
export function formatTimeSeriesForChart<T extends TimePoint>(
  points: T[],
  options: {
    includeIsoDate?: boolean;
    includeUnixTimestamp?: boolean;
    valueKey?: string;
    extraFields?: Array<keyof T>;
  } = {},
): Array<Record<string, unknown>> {
  const { includeIsoDate = true, includeUnixTimestamp = false, valueKey = "value", extraFields = [] } = options;
  return points.map(p => {
    const row: Record<string, unknown> = {};
    if (includeIsoDate) row.date = toISODate(p.date);
    if (includeUnixTimestamp) row.timestamp = toDate(p.date).getTime();
    row[valueKey] = p.value;
    for (const f of extraFields) {
      row[f as string] = p[f];
    }
    return row;
  });
}

/**
 * Format benchmark results for tabular export.
 */
export function formatBenchmarkTable(
  benchmark: BenchmarkResult,
  subjectName: string,
): Array<{ metric: string; subject: string; peerAverage: string; peerMedian: string; percentile: string; zScore: string; delta: string }> {
  return [
    { metric: "Value", subject: benchmark.subjectValue.toFixed(2), peerAverage: benchmark.peerAverage.toFixed(2), peerMedian: benchmark.peerMedian.toFixed(2), percentile: `${(benchmark.percentileRank * 100).toFixed(0)}%`, zScore: benchmark.zScore.toFixed(2), delta: benchmark.deltaFromAverage.toFixed(2) },
    { metric: "Min", subject: "", peerAverage: benchmark.peerMin.toFixed(2), peerMedian: "", percentile: "", zScore: "", delta: "" },
    { metric: "Max", subject: "", peerAverage: benchmark.peerMax.toFixed(2), peerMedian: "", percentile: "", zScore: "", delta: "" },
    { metric: "Std Dev", subject: "", peerAverage: benchmark.peerStdDev.toFixed(2), peerMedian: "", percentile: "", zScore: "", delta: "" },
    { metric: "Count", subject: "1", peerAverage: benchmark.peerCount.toString(), peerMedian: "", percentile: "", zScore: "", delta: "" },
    { metric: "Subject", subject: subjectName, peerAverage: "", peerMedian: "", percentile: "", zScore: "", delta: "" },
  ];
}

/**
 * Build a comprehensive export payload combining multiple metrics.
 */
export function buildExportPayload(input: {
  companyId: UUID;
  companyName: string;
  periodStart: ISODateString;
  periodEnd: ISODateString;
  riskAssessment: {
    overallScore: Percentage;
    categoryResults: Array<{ categoryId: string; score: Percentage; weight: number }>;
  };
  mentions: Array<{ sentimentScore: number; reachEstimate: number; channel: string; date: ISODateString }>;
  articles: Array<{ publishedAt: ISODateString; sentimentScore: number; riskScore: number }>;
  alerts: Array<{ severity: string; triggeredAt: ISODateString; status: string }>;
  peerBenchmark: BenchmarkResult;
}): {
  metadata: {
    companyId: UUID;
    companyName: string;
    periodStart: ISODateString;
    periodEnd: ISODateString;
    exportedAt: ISODateString;
    version: string;
  };
  summary: {
    overallRiskScore: Percentage;
    overallRiskLevel: RiskLevel;
    sentimentScore: UnitInterval;
    mentionCount: number;
    articleCount: number;
    alertCount: number;
    criticalAlertCount: number;
    peerPercentile: UnitInterval;
  };
  riskAssessment: {
    overallScore: Percentage;
    categoryResults: Array<{ categoryId: string; score: Percentage; weight: number; normalizedWeight: UnitInterval; weightedContribution: number }>;
  };
  sentiment: {
    score: UnitInterval;
    distribution: Record<MentionSentiment, number>;
    distributionPercent: Record<MentionSentiment, UnitInterval>;
    weightedReach: number;
  };
  mentions: {
    total: number;
    byChannel: Array<{ channel: string; count: number; reach: number; avgSentiment: UnitInterval }>;
    timeline: Array<{ date: ISODateString; count: number; avgSentiment: UnitInterval }>;
  };
  articles: {
    total: number;
    avgSentiment: UnitInterval;
    avgRisk: Percentage;
    timeline: Array<{ date: ISODateString; count: number; avgSentiment: UnitInterval; avgRisk: Percentage }>;
  };
  alerts: {
    total: number;
    bySeverity: Record<string, number>;
    byStatus: Record<string, number>;
    timeline: Array<{ date: ISODateString; count: number }>;
  };
  peerBenchmark: BenchmarkResult;
} {
  const overallRiskLevel = scoreToRiskLevel(input.riskAssessment.overallScore);
  const sentimentScore = computeSentimentScore(input.mentions.map(m => ({ sentimentScore: m.sentimentScore })));
  const sentimentDist = sentimentDistribution(input.mentions.map(m => ({ sentimentScore: m.sentimentScore })));
  const sentimentDistPercent = sentimentDistributionPercent(input.mentions.map(m => ({ sentimentScore: m.sentimentScore })));
  const sentimentWeightedReachVal = sentimentWeightedReach(input.mentions);
  const totalWeight = sum(input.riskAssessment.categoryResults.map(c => c.weight));
  const categoryResults = input.riskAssessment.categoryResults.map(c => ({
    categoryId: c.categoryId,
    score: c.score,
    weight: c.weight,
    normalizedWeight: (totalWeight === 0 ? 0 : c.weight / totalWeight) as UnitInterval,
    weightedContribution: c.score * (totalWeight === 0 ? 0 : c.weight / totalWeight),
  }));
  const channelMap = new Map<string, typeof input.mentions>();
  for (const m of input.mentions) {
    if (!channelMap.has(m.channel)) channelMap.set(m.channel, []);
    channelMap.get(m.channel)!.push(m);
  }
  const mentionsByChannel = [...channelMap.entries()].map(([channel, ms]) => ({
    channel,
    count: ms.length,
    reach: sum(ms.map(m => m.reachEstimate)),
    avgSentiment: computeSentimentScore(ms.map(m => ({ sentimentScore: m.sentimentScore }))) as UnitInterval,
  }));
  const mentionTimelineMap = new Map<string, typeof input.mentions>();
  for (const m of input.mentions) {
    const key = toISODate(m.date).slice(0, 10);
    if (!mentionTimelineMap.has(key)) mentionTimelineMap.set(key, []);
    mentionTimelineMap.get(key)!.push(m);
  }
  const mentionTimeline = [...mentionTimelineMap.entries()]
    .sort()
    .map(([date, ms]) => ({
      date: date as ISODateString,
      count: ms.length,
      avgSentiment: computeSentimentScore(ms.map(m => ({ sentimentScore: m.sentimentScore }))) as UnitInterval,
    }));
  const articleTimelineMap = new Map<string, typeof input.articles>();
  for (const a of input.articles) {
    const key = toISODate(a.publishedAt).slice(0, 10);
    if (!articleTimelineMap.has(key)) articleTimelineMap.set(key, []);
    articleTimelineMap.get(key)!.push(a);
  }
  const articleTimeline = [...articleTimelineMap.entries()]
    .sort()
    .map(([date, as]) => ({
      date: date as ISODateString,
      count: as.length,
      avgSentiment: (mean(as.map(a => a.sentimentScore))) as UnitInterval,
      avgRisk: (mean(as.map(a => a.riskScore))) as Percentage,
    }));
  const alertsBySeverity: Record<string, number> = {};
  const alertsByStatus: Record<string, number> = {};
  for (const a of input.alerts) {
    alertsBySeverity[a.severity] = (alertsBySeverity[a.severity] ?? 0) + 1;
    alertsByStatus[a.status] = (alertsByStatus[a.status] ?? 0) + 1;
  }
  const alertTimelineMap = new Map<string, number>();
  for (const a of input.alerts) {
    const key = toISODate(a.triggeredAt).slice(0, 10);
    alertTimelineMap.set(key, (alertTimelineMap.get(key) ?? 0) + 1);
  }
  const alertTimeline = [...alertTimelineMap.entries()]
    .sort()
    .map(([date, count]) => ({ date: date as ISODateString, count }));
  return {
    metadata: {
      companyId: input.companyId,
      companyName: input.companyName,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      exportedAt: new Date().toISOString() as ISODateString,
      version: "1.0.0",
    },
    summary: {
      overallRiskScore: input.riskAssessment.overallScore,
      overallRiskLevel,
      sentimentScore,
      mentionCount: input.mentions.length,
      articleCount: input.articles.length,
      alertCount: input.alerts.length,
      criticalAlertCount: input.alerts.filter(a => a.severity === "critical").length,
      peerPercentile: input.peerBenchmark.percentileRank,
    },
    riskAssessment: {
      overallScore: input.riskAssessment.overallScore,
      categoryResults,
    },
    sentiment: {
      score: sentimentScore,
      distribution: sentimentDist,
      distributionPercent: sentimentDistPercent,
      weightedReach: sentimentWeightedReachVal,
    },
    mentions: {
      total: input.mentions.length,
      byChannel: mentionsByChannel,
      timeline: mentionTimeline,
    },
    articles: {
      total: input.articles.length,
      avgSentiment: computeSentimentScore(input.articles.map(a => ({ sentimentScore: a.sentimentScore }))) as UnitInterval,
      avgRisk: (mean(input.articles.map(a => a.riskScore))) as Percentage,
      timeline: articleTimeline,
    },
    alerts: {
      total: input.alerts.length,
      bySeverity: alertsBySeverity,
      byStatus: alertsByStatus,
      timeline: alertTimeline,
    },
    peerBenchmark: input.peerBenchmark,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 20 — FORECASTING HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Naive forecast: next value = last value.
 */
export function naiveForecast(values: number[], steps = 1): number[] {
  if (values.length === 0) return [];
  const last = values[values.length - 1];
  return new Array(steps).fill(last);
}

/**
 * Simple moving average forecast.
 */
export function smaForecast(values: number[], period = 7, steps = 1): number[] {
  if (values.length === 0) return [];
  const sma = simpleMovingAverage(values, period);
  const lastSma = sma[sma.length - 1];
  return new Array(steps).fill(lastSma);
}

/**
 * Linear trend forecast using linear regression.
 */
export function linearTrendForecast(values: number[], steps = 1): Array<{ value: number; lower: number; upper: number }> {
  if (values.length < 2) {
    return new Array(steps).fill(0).map(() => ({ value: values[0] ?? 0, lower: values[0] ?? 0, upper: values[0] ?? 0 }));
  }
  const regression = linearRegression(values);
  const result: Array<{ value: number; lower: number; upper: number }> = [];
  const margin = 1.96 * regression.standardError;
  for (let i = 0; i < steps; i++) {
    const forecast = regression.slope * (values.length + i) + regression.intercept;
    result.push({
      value: forecast,
      lower: forecast - margin,
      upper: forecast + margin,
    });
  }
  return result;
}

/**
 * Exponential smoothing forecast (Holt's linear method).
 */
export function holtLinearForecast(
  values: number[],
  steps = 1,
  alpha = 0.5,
  beta = 0.5,
): number[] {
  if (values.length === 0) return [];
  if (values.length === 1) return new Array(steps).fill(values[0]);
  let level = values[0];
  let trend = values[1] - values[0];
  for (let i = 1; i < values.length; i++) {
    const newLevel = alpha * values[i] + (1 - alpha) * (level + trend);
    const newTrend = beta * (newLevel - level) + (1 - beta) * trend;
    level = newLevel;
    trend = newTrend;
  }
  const result: number[] = [];
  for (let i = 1; i <= steps; i++) {
    result.push(level + i * trend);
  }
  return result;
}

/**
 * Seasonal naive forecast: next value = value from one season ago.
 */
export function seasonalNaiveForecast(values: number[], seasonalPeriod: number, steps = 1): number[] {
  if (values.length < seasonalPeriod) return naiveForecast(values, steps);
  const result: number[] = [];
  for (let i = 0; i < steps; i++) {
    const idx = values.length - seasonalPeriod + (i % seasonalPeriod);
    result.push(values[idx] ?? values[values.length - 1]);
  }
  return result;
}

/**
 * Compute a simple seasonal decomposition (additive).
 */
export function seasonalDecompose(values: number[], seasonalPeriod: number): SeasonalityResult {
  if (values.length < seasonalPeriod * 2) {
    return {
      period: seasonalPeriod,
      strength: 0,
      peaks: [],
      troughs: [],
      seasonalComponent: new Array(values.length).fill(0),
      trendComponent: [...values],
      residualComponent: new Array(values.length).fill(0),
    };
  }
  const trend = simpleMovingAverage(values, seasonalPeriod);
  const detrended = values.map((v, i) => v - (trend[i] ?? 0));
  const seasonalAvg = new Array(seasonalPeriod).fill(0);
  const counts = new Array(seasonalPeriod).fill(0);
  for (let i = 0; i < detrended.length; i++) {
    const idx = i % seasonalPeriod;
    seasonalAvg[idx] += detrended[i];
    counts[idx]++;
  }
  for (let i = 0; i < seasonalPeriod; i++) {
    seasonalAvg[i] = counts[i] === 0 ? 0 : seasonalAvg[i] / counts[i];
  }
  const seasonalComponent = values.map((_, i) => seasonalAvg[i % seasonalPeriod]);
  const residualComponent = values.map((v, i) => v - (trend[i] ?? 0) - seasonalComponent[i]);
  const residualVariance = variance(residualComponent);
  const originalVariance = variance(values);
  const strength = originalVariance === 0 ? 0 : Math.max(0, Math.min(1, 1 - residualVariance / originalVariance));
  const seasonalPeaks: Array<{ index: number; value: number }> = [];
  const seasonalTroughs: Array<{ index: number; value: number }> = [];
  for (let i = 0; i < seasonalPeriod; i++) {
    if (i > 0 && i < seasonalPeriod - 1) {
      if (seasonalAvg[i] > seasonalAvg[i - 1] && seasonalAvg[i] > seasonalAvg[i + 1]) {
        seasonalPeaks.push({ index: i, value: seasonalAvg[i] });
      }
      if (seasonalAvg[i] < seasonalAvg[i - 1] && seasonalAvg[i] < seasonalAvg[i + 1]) {
        seasonalTroughs.push({ index: i, value: seasonalAvg[i] });
      }
    }
  }
  return {
    period: seasonalPeriod,
    strength: strength as UnitInterval,
    peaks: seasonalPeaks,
    troughs: seasonalTroughs,
    seasonalComponent,
    trendComponent: trend,
    residualComponent,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 21 — VOLUME & DISTRIBUTION HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Compute total volume. */
export function totalVolume(values: number[]): number {
  return sum(values);
}

/** Compute volume distribution by category. */
export function volumeByCategory<T extends string>(
  items: Array<{ category: T; volume: number }>,
): Array<{ category: T; volume: number; share: UnitInterval }> {
  const total = sum(items.map(i => i.volume));
  return items
    .map(i => ({
      category: i.category,
      volume: i.volume,
      share: (total === 0 ? 0 : i.volume / total) as UnitInterval,
    }))
    .sort((a, b) => b.volume - a.volume);
}

/** Compute the cumulative distribution function for a sample. */
export function cumulativeDistribution(values: number[]): Array<{ value: number; cdf: UnitInterval }> {
  if (values.length === 0) return [];
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  return sorted.map((v, i) => ({ value: v, cdf: ((i + 1) / n) as UnitInterval }));
}

/** Compute the probability density function approximation (histogram). */
export function histogram(values: number[], bins = 10): Array<{ binStart: number; binEnd: number; count: number; density: UnitInterval }> {
  if (values.length === 0) return [];
  const mn = Math.min(...values);
  const mx = Math.max(...values);
  if (mn === mx) {
    return [{ binStart: mn, binEnd: mx, count: values.length, density: 1 as UnitInterval }];
  }
  const binWidth = (mx - mn) / bins;
  const counts = new Array(bins).fill(0);
  for (const v of values) {
    const binIdx = Math.min(bins - 1, Math.floor((v - mn) / binWidth));
    counts[binIdx]++;
  }
  return counts.map((count, i) => ({
    binStart: mn + i * binWidth,
    binEnd: mn + (i + 1) * binWidth,
    count,
    density: (count / values.length) as UnitInterval,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 22 — WEIGHTED INDEX BUILDERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a weighted composite index from multiple normalized indicators.
 */
export function buildWeightedIndex(input: {
  indicators: Array<{
    id: string;
    name: string;
    value: number;
    weight: number;
    direction: "higher_better" | "lower_better";
    normalization: "min_max" | "z_score" | "rank" | "none";
    normalizationParams?: { min?: number; max?: number; mean?: number; stdDev?: number };
  }>;
  defaultNormalization?: "min_max" | "z_score" | "rank" | "none";
}): {
  index: number;
  breakdown: Array<{
    id: string;
    name: string;
    rawValue: number;
    normalizedValue: number;
    weight: number;
    weightedContribution: number;
  }>;
} {
  const totalWeight = sum(input.indicators.map(i => i.weight));
  if (totalWeight === 0) {
    return { index: 0, breakdown: [] };
  }
  const breakdown = input.indicators.map(ind => {
    let normalized = ind.value;
    const method = ind.normalization ?? input.defaultNormalization ?? "none";
    switch (method) {
      case "min_max": {
        const min = ind.normalizationParams?.min ?? 0;
        const max = ind.normalizationParams?.max ?? 100;
        normalized = max === min ? 0.5 : (ind.value - min) / (max - min);
        break;
      }
      case "z_score": {
        const m = ind.normalizationParams?.mean ?? 0;
        const sd = ind.normalizationParams?.stdDev ?? 1;
        normalized = sd === 0 ? 0.5 : 0.5 + (ind.value - m) / (2 * sd);
        break;
      }
      case "rank": {
        normalized = ind.value; // assume already a rank [0, 1]
        break;
      }
      case "none":
      default:
        normalized = ind.value;
    }
    if (ind.direction === "lower_better") normalized = 1 - normalized;
    normalized = Math.max(0, Math.min(1, normalized));
    return {
      id: ind.id,
      name: ind.name,
      rawValue: ind.value,
      normalizedValue: normalized,
      weight: ind.weight,
      weightedContribution: normalized * (ind.weight / totalWeight),
    };
  });
  const index = sum(breakdown.map(b => b.weightedContribution)) * 100;
  return { index, breakdown };
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 23 — NORMALIZATION & SCALING
// ─────────────────────────────────────────────────────────────────────────────

/** Min-max normalize a value to [0, 1]. */
export function minMaxNormalize(value: number, min: number, max: number): UnitInterval {
  if (max === min) return 0.5;
  return Math.max(0, Math.min(1, (value - min) / (max - min))) as UnitInterval;
}

/** Z-score normalize a value. */
export function zScoreNormalize(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}

/** Log-transform a value (log10). */
export function logTransform(value: number, base: "natural" | "log10" | "log2" = "natural"): number {
  if (value <= 0) return 0;
  switch (base) {
    case "log10": return Math.log10(value);
    case "log2": return Math.log2(value);
    case "natural":
    default: return Math.log(value);
  }
}

/** Sigmoid transform: 1 / (1 + e^-x). */
export function sigmoid(x: number): number {
  if (x >= 0) return 1 / (1 + Math.exp(-x));
  const expX = Math.exp(x);
  return expX / (1 + expX);
}

/** Softmax transform. */
export function softmax(values: number[]): number[] {
  if (values.length === 0) return [];
  const maxVal = Math.max(...values);
  const exps = values.map(v => Math.exp(v - maxVal));
  const sumExps = sum(exps);
  return exps.map(e => e / sumExps);
}

/** Normalize an array to [0, 1] using min-max scaling. */
export function normalizeArray(values: number[]): number[] {
  if (values.length === 0) return [];
  const mn = Math.min(...values);
  const mx = Math.max(...values);
  if (mn === mx) return values.map(() => 0.5);
  return values.map(v => (v - mn) / (mx - mn));
}

/** Standardize an array (z-score). */
export function standardizeArray(values: number[]): number[] {
  if (values.length === 0) return [];
  const m = mean(values);
  const sd = sampleStdDev(values);
  if (sd === 0) return values.map(() => 0);
  return values.map(v => (v - m) / sd);
}

/** Clip a value to [min, max]. */
export function clip(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Rescale a value from one range to another. */
export function rescaleValue(value: number, fromMin: number, fromMax: number, toMin: number, toMax: number): number {
  if (fromMax === fromMin) return (toMin + toMax) / 2;
  return toMin + (value - fromMin) * (toMax - toMin) / (fromMax - fromMin);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 24 — AGGREGATION HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Group items by a key function. */
export function groupBy<T, K extends string>(items: T[], keyFn: (item: T) => K): Record<K, T[]> {
  const result = {} as Record<K, T[]>;
  for (const item of items) {
    const key = keyFn(item);
    if (!result[key]) result[key] = [];
    result[key].push(item);
  }
  return result;
}

/** Group items by a numeric key (binned). */
export function binBy<T>(items: T[], valueFn: (item: T) => number, binSize: number): Array<{ binStart: number; binEnd: number; items: T[]; count: number }> {
  if (items.length === 0) return [];
  const bins = new Map<number, T[]>();
  for (const item of items) {
    const value = valueFn(item);
    const binIdx = Math.floor(value / binSize);
    if (!bins.has(binIdx)) bins.set(binIdx, []);
    bins.get(binIdx)!.push(item);
  }
  return [...bins.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([binIdx, items]) => ({
      binStart: binIdx * binSize,
      binEnd: (binIdx + 1) * binSize,
      items,
      count: items.length,
    }));
}

/** Compute a pivot table. */
export function pivotTable<T, R extends string, C extends string>(
  items: T[],
  rowFn: (item: T) => R,
  colFn: (item: T) => C,
  valueFn: (items: T[]) => number = (itms) => itms.length,
): { rows: R[]; cols: C[]; cells: Record<R, Record<C, number>> } {
  const rowsSet = new Set<R>();
  const colsSet = new Set<C>();
  const cells = {} as Record<R, Record<C, number>>;
  const buckets = new Map<string, T[]>();
  for (const item of items) {
    const r = rowFn(item);
    const c = colFn(item);
    rowsSet.add(r);
    colsSet.add(c);
    const key = `${r}||${c}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(item);
  }
  const rows = [...rowsSet];
  const cols = [...colsSet];
  for (const r of rows) {
    cells[r] = {} as Record<C, number>;
    for (const c of cols) {
      const key = `${r}||${c}`;
      const bucket = buckets.get(key) ?? [];
      cells[r][c] = valueFn(bucket);
    }
  }
  return { rows, cols, cells };
}

/** Aggregate items by a key and apply an aggregation function. */
export function aggregateBy<T, K extends string>(
  items: T[],
  keyFn: (item: T) => K,
  valueFn: (item: T) => number,
  aggregation: "sum" | "avg" | "median" | "min" | "max" | "count" | "count_distinct" = "sum",
): Array<{ key: K; value: number; count: number }> {
  const groups = groupBy(items, keyFn);
  return (Object.entries(groups) as Array<[K, T[]]>).map(([key, group]) => {
    const values = group.map(valueFn);
    let value: number;
    switch (aggregation) {
      case "sum": value = sum(values); break;
      case "avg": value = mean(values); break;
      case "median": value = median(values); break;
      case "min": value = Math.min(...values); break;
      case "max": value = Math.max(...values); break;
      case "count": value = values.length; break;
      case "count_distinct": value = new Set(values).size; break;
      default: value = sum(values);
    }
    return { key: key as K, value, count: group.length };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 25 — UTILITY CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

/** One second in milliseconds. */
export const MS_PER_SECOND = 1000;

/** One minute in milliseconds. */
export const MS_PER_MINUTE = 60 * MS_PER_SECOND;

/** One hour in milliseconds. */
export const MS_PER_HOUR = 60 * MS_PER_MINUTE;

/** One day in milliseconds. */
export const MS_PER_DAY = 24 * MS_PER_HOUR;

/** One week in milliseconds. */
export const MS_PER_WEEK = 7 * MS_PER_DAY;

/** One month (30 days) in milliseconds. */
export const MS_PER_MONTH_30 = 30 * MS_PER_DAY;

/** One quarter (91 days) in milliseconds. */
export const MS_PER_QUARTER = 91 * MS_PER_DAY;

/** One year (365 days) in milliseconds. */
export const MS_PER_YEAR = 365 * MS_PER_DAY;

/** Default RSI period. */
export const DEFAULT_RSI_PERIOD = 14;

/** Default MACD periods: [fast, slow, signal]. */
export const DEFAULT_MACD_PERIODS: [number, number, number] = [12, 26, 9];

/** Default Bollinger Bands period. */
export const DEFAULT_BOLLINGER_PERIOD = 20;

/** Default Bollinger Bands multiplier. */
export const DEFAULT_BOLLINGER_MULTIPLIER = 2;

/** Default moving average period. */
export const DEFAULT_MA_PERIOD = 7;

/** Default anomaly detection threshold (z-score). */
export const DEFAULT_ANOMALY_THRESHOLD = 2.5;

/** Default IQR multiplier for anomaly detection. */
export const DEFAULT_IQR_MULTIPLIER = 1.5;

/** Default sentiment smoothing window. */
export const DEFAULT_SENTIMENT_WINDOW = 7;

/** Default risk trajectory threshold. */
export const DEFAULT_RISK_TRAJECTORY_THRESHOLD = 5;

/** Default mention velocity window. */
export const DEFAULT_MENTION_VELOCITY_WINDOW = 7;

/** Default cohort interval (30 days). */
export const DEFAULT_COHORT_INTERVAL = MS_PER_MONTH_30;

/** Default max cohort periods. */
export const DEFAULT_MAX_COHORT_PERIODS = 12;

/** Default max reach for influence scoring. */
export const DEFAULT_MAX_REACH = 1_000_000;

/** Version of the metrics module. */
export const METRICS_MODULE_VERSION = "1.0.0";

// ─────────────────────────────────────────────────────────────────────────────
// END OF FILE — Harch Atelier Analytics & Metrics Module
// ─────────────────────────────────────────────────────────────────────────────
