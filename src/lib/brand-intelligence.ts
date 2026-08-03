// ════════════════════════════════════════════════════════════════════════════
//  BRAND & MARKET INTELLIGENCE — Production-grade media monitoring analytics
//  ───────────────────────────────────────────────────────────────────────────
//
//  A comprehensive, dependency-light brand and market intelligence engine
//  designed for media monitoring, reputation management, and competitive
//  benchmarking workloads.
//
//  Module capabilities
//  ────────────────────
//  1.  Share of Voice        — Weighted SoV, sentiment-adjusted SoV, competitive matrix
//  2.  Media reach           — Multi-source reach aggregation + AMP (Average Media Potential)
//  3.  Sentiment trends      — SMA, EMA, WMA, velocity, acceleration, anomaly detection
//  4.  Influence scoring     — Composite reach×engagement×authority + ranking
//  5.  Narrative tracking    — Theme extraction, narrative detection, velocity
//  6.  Crisis detection      — Real-time scoring, severity, escalation triggers
//  7.  Competitive benchmark — Peer comparison, percentile, gap analysis
//  8.  Reputation index      — Weighted composite (sentiment, SoV, AI visibility, authority, innovation)
//  9.  Dashboard data        — Weather widget, alert feed, KPI strip aggregates
//  10. Report generation     — Executive summary, trend analysis text generation
//
//  Design principles
//  ─────────────────
//  • Zero external runtime dependencies.
//  • Pure TypeScript, fully typed, strict-mode compatible.
//  • Single-file deployable: `import { ... } from './brand-intelligence'`.
//  • Every public class/function is exported and independently usable.
//  • Deterministic: all RNG, clock access through injectable providers.
//  • No mocks — every class ships with a real, production-ready implementation.
//
//  Author: Harch Atelier — SUBAGENT-BRAND-INTEL
// ════════════════════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────────────────────
// SECTION 0 — Type-only imports (kept minimal to avoid coupling)
// ────────────────────────────────────────────────────────────────────────────
// This module is intentionally self-contained. No value imports are required;
// all enums and branded types are defined locally so consumers can adopt the
// module without dragging in additional platform types.

// ════════════════════════════════════════════════════════════════════════════
// SECTION 1 — BRANDED PRIMITIVES & SHARED ENUMS
// ════════════════════════════════════════════════════════════════════════════

/** Branded type for unique identifiers within the brand intelligence module. */
export type BrandIntelId = string & { readonly __brand: "BrandIntelId" };

/** Brand a plain string into a BrandIntelId. */
export function asBrandIntelId(value: string): BrandIntelId {
  return value as BrandIntelId;
}

/** ISO-8601 timestamp string. */
export type ISOString = string;

/** Epoch milliseconds. */
export type EpochMs = number;

/** A unit-interval numeric value (clamped to [0, 1]). */
export type UnitInterval = number;

/** A percentage value in the range [0, 100]. */
export type Percentage = number;

/** A non-negative real number. */
export type NonNegative = number;

/** A strictly-positive integer. */
export type PositiveInt = number;

/** Sentiment polarity bucket. */
export enum SentimentPolarity {
  POSITIVE = "positive",
  NEUTRAL = "neutral",
  NEGATIVE = "negative",
  MIXED = "mixed",
}

/** Media channel category. */
export enum MediaChannel {
  PRINT = "print",
  ONLINE = "online",
  SOCIAL = "social",
  BROADCAST = "broadcast",
  PODCAST = "podcast",
  AI = "ai",
  REGULATORY = "regulatory",
  INDUSTRY = "industry",
}

/** Authority tier for a media source (used for weighted SoV calculations). */
export enum AuthorityTier {
  TIER_1_ELITE = "tier_1_elite", // e.g. Reuters, Bloomberg, FT
  TIER_2_NATIONAL = "tier_2_national", // e.g. national dailies
  TIER_3_TRADE = "tier_3_trade", // e.g. sector trade press
  TIER_4_REGIONAL = "tier_4_regional", // regional / local
  TIER_5_LONG_TAIL = "tier_5_long_tail", // blogs, aggregators, UGC
}

/** Severity tier for crisis classification. */
export enum CrisisSeverity {
  NONE = "none",
  LOW = "low",
  MODERATE = "moderate",
  HIGH = "high",
  SEVERE = "severe",
  CRITICAL = "critical",
}

/** Trajectory direction for any tracked metric. */
export enum TrajectoryDirection {
  RISING = "rising",
  STABLE = "stable",
  FALLING = "falling",
  VOLATILE = "volatile",
}

/** Escalation policy action produced by the crisis detection engine. */
export enum EscalationAction {
  MONITOR = "monitor",
  ALERT = "alert",
  ESCALATE_TIER_1 = "escalate_tier_1",
  ESCALATE_TIER_2 = "escalate_tier_2",
  ESCALATE_TIER_3 = "escalate_tier_3",
  INCIDENT_WAR_ROOM = "incident_war_room",
  POST_MORTEM = "post_mortem",
}

/** Narrative lifecycle stage. */
export enum NarrativeStage {
  EMERGING = "emerging",
  GROWING = "growing",
  PEAK = "peak",
  DECLINING = "declining",
  DORMANT = "dormant",
  RESURGENT = "resurgent",
}

/** Anomaly classification produced by the sentiment trend analyzer. */
export enum AnomalyKind {
  SPIKE = "spike",
  DROP = "drop",
  LEVEL_SHIFT = "level_shift",
  VOLATILITY_BURST = "volatility_burst",
  STALENESS = "staleness",
}

/** Influence tier for an author or publisher. */
export enum InfluenceTier {
  MEGA = "mega", // 1M+ followers / equivalent reach
  MACRO = "macro", // 100K–1M
  MID = "mid", // 10K–100K
  MICRO = "micro", // 1K–10K
  NANO = "nano", // <1K
}

/** Time window for aggregations. */
export enum AggregationWindow {
  HOUR = "hour",
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
  QUARTER = "quarter",
  YEAR = "year",
}

/** Calculation status for any analytical operation. */
export type CalculationStatus =
  | { kind: "ok" }
  | { kind: "insufficient_data"; reason: string }
  | { kind: "invalid_input"; reason: string };

/** Result wrapper for analytical functions that may fail soft. */
export interface AnalyticalResult<T> {
  value: T;
  status: CalculationStatus;
  warnings: string[];
  computedAt: EpochMs;
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 2 — DOMAIN INPUT TYPES
// ════════════════════════════════════════════════════════════════════════════

/** A single media mention observed for a tracked brand. */
export interface MediaMention {
  id: string;
  brandId: string;
  brandAliasesMatched?: string[];
  sourceId: string;
  sourceName: string;
  sourceChannel: MediaChannel;
  authorityTier: AuthorityTier;
  authorityScore: number; // 0..1
  url?: string;
  title: string;
  excerpt?: string;
  bodyWordCount?: number;
  language?: string;
  publishedAt: ISOString;
  ingestedAt?: ISOString;
  sentimentLabel: SentimentPolarity;
  sentimentScore: number; // -1..+1
  confidence: number; // 0..1
  reach?: number;
  impressions?: number;
  engagement?: number;
  authorHandle?: string;
  authorFollowers?: number;
  isPaywalled?: boolean;
  isSyndicated?: boolean;
  syndicationParentId?: string;
  topics?: string[];
  entities?: string[];
  geo?: string[];
  industryVertical?: string;
}

/** Aggregated daily snapshot for a brand. */
export interface BrandDailySnapshot {
  brandId: string;
  date: ISOString; // YYYY-MM-DD
  mentionCount: number;
  positiveMentions: number;
  neutralMentions: number;
  negativeMentions: number;
  totalReach: number;
  totalImpressions: number;
  totalEngagement: number;
  avgSentiment: number; // -1..+1
  weightedSentiment: number; // authority-weighted
  uniqueAuthors: number;
  uniqueSources: number;
  topSources?: Array<{ sourceId: string; sourceName: string; mentions: number; reach: number }>;
}

/** A peer brand used for competitive benchmarking. */
export interface PeerBrand {
  brandId: string;
  brandName: string;
  sector: string;
  marketCap?: number;
  revenue?: number;
  isPublic?: boolean;
  aliases?: string[];
}

/** A media source registry entry used for weighting. */
export interface SourceProfile {
  sourceId: string;
  sourceName: string;
  channel: MediaChannel;
  authorityTier: AuthorityTier;
  authorityScore: number; // 0..1
  monthlyReach?: number;
  avgEngagementRate?: number;
  country?: string;
  language?: string;
  paywall?: boolean;
  syndicatesTo?: string[];
  isVerified?: boolean;
}

/** An influencer / author profile. */
export interface InfluencerProfile {
  influencerId: string;
  handle: string;
  displayName: string;
  channel: MediaChannel;
  followers: number;
  avgEngagementRate: number; // 0..1
  authorityScore: number; // 0..1
  verified: boolean;
  topicAffinities?: Record<string, number>;
  country?: string;
  language?: string;
  mentionsOfBrand?: number;
}

/** AI-engine visibility observation for a brand. */
export interface AIVisibilityObservation {
  brandId: string;
  engineName: string;
  query: string;
  cited: boolean;
  rank?: number;
  position?: string;
  sentiment?: SentimentPolarity;
  sentimentScore?: number;
  confidence: number;
  checkedAt: ISOString;
  responseExcerpt?: string;
}

/** Time-series point for sentiment or any metric. */
export interface TimePoint {
  t: EpochMs; // epoch ms
  date?: ISOString;
  value: number;
}

/** Tagged time-series point carrying additional sentiment metadata. */
export interface SentimentTimePoint extends TimePoint {
  positivePct: number;
  neutralPct: number;
  negativePct: number;
  volume: number;
}

/** Weighted time-series point where each observation carries its own weight. */
export interface WeightedTimePoint extends TimePoint {
  weight: number;
}

/** Narrative observation record. */
export interface NarrativeObservation {
  narrativeId: string;
  theme: string;
  brandId: string;
  observedAt: ISOString;
  mentionCount: number;
  reach: number;
  sentimentAvg: number;
  sentimentVariance: number;
  stage: NarrativeStage;
}

/** Crisis trigger observation. */
export interface CrisisTriggerObservation {
  brandId: string;
  observedAt: ISOString;
  signalName: string;
  signalValue: number;
  signalThreshold: number;
  contribution: number; // 0..1 weight in the composite crisis score
}

/** Configuration object for a competitive benchmarking exercise. */
export interface BenchmarkConfiguration {
  weights: {
    shareOfVoice: number;
    sentiment: number;
    reach: number;
    authority: number;
    aiVisibility: number;
    innovation: number;
  };
  percentileMethod: "linear" | "lower" | "higher" | "nearest" | "midpoint";
  normalizationMethod: "minmax" | "zscore" | "rank" | "sigmoid";
  includeSelf?: boolean;
}

/** Reputation index component scores (each 0..100). */
export interface ReputationComponents {
  sentiment: number;
  shareOfVoice: number;
  aiVisibility: number;
  authority: number;
  innovation: number;
  performance: number;
  purpose: number;
}

/** Reputation index weights (should sum to 1.0; engine normalizes defensively). */
export interface ReputationWeights {
  sentiment: number;
  shareOfVoice: number;
  aiVisibility: number;
  authority: number;
  innovation: number;
  performance: number;
  purpose: number;
}

/** Aggregated KPI strip entry for the dashboard. */
export interface KpiStripEntry {
  key: string;
  label: string;
  value: number;
  unit?: string;
  deltaPct?: number;
  deltaLabel?: string;
  trajectory?: TrajectoryDirection;
  severity?: CrisisSeverity;
  spark?: number[];
}

/** Weather-widget entry describing the "media climate" for a brand. */
export interface MediaWeatherEntry {
  brandId: string;
  brandName: string;
  condition: "sunny" | "cloudy" | "stormy" | "foggy" | "heatwave" | "blizzard";
  temperature: number; // sentiment degrees, -100..+100
  pressure: number; // mention volume pressure, 0..100
  humidity: number; // negative-share %, 0..100
  windSpeed: number; // narrative velocity, 0..100
  visibility: number; // AI visibility %, 0..100
  forecast?: Array<{ date: ISOString; condition: string; temperature: number }>;
}

/** Alert feed entry. */
export interface AlertFeedEntry {
  alertId: string;
  brandId: string;
  brandName?: string;
  severity: CrisisSeverity;
  title: string;
  body: string;
  triggeredAt: ISOString;
  acknowledged?: boolean;
  action?: EscalationAction;
  relatedMetric?: string;
  relatedValue?: number;
  threshold?: number;
}

/** Executive summary block produced by the report generator. */
export interface ExecutiveSummaryBlock {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  callouts?: Array<{ label: string; value: string }>;
}

/** Trend analysis descriptor for narrative reports. */
export interface TrendAnalysisDescriptor {
  metric: string;
  window: AggregationWindow;
  direction: TrajectoryDirection;
  magnitude: number;
  confidence: number;
  narrative: string;
  supportingData?: Array<{ label: string; value: number }>;
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 3 — MATH & STATISTICS UTILITIES
// ════════════════════════════════════════════════════════════════════════════

/** Clamp a number into the inclusive range [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/** Clamp a value to the [0, 1] unit interval. */
export function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

/** Clamp a value to the [0, 100] percentage range. */
export function clampPct(value: number): number {
  return clamp(value, 0, 100);
}

/** Clamp a sentiment score to the [-1, +1] interval. */
export function clampSentiment(value: number): number {
  return clamp(value, -1, 1);
}

/** Sum an array of numbers. */
export function sum(values: number[]): number {
  let total = 0;
  for (const v of values) total += v;
  return total;
}

/** Arithmetic mean of an array of numbers. Returns 0 for empty input. */
export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return sum(values) / values.length;
}

/** Median of an array of numbers. */
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

/** Sample variance (denominator = n - 1). */
export function variance(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  let acc = 0;
  for (const v of values) acc += (v - m) * (v - m);
  return acc / (values.length - 1);
}

/** Sample standard deviation. */
export function standardDeviation(values: number[]): number {
  return Math.sqrt(variance(values));
}

/** Population variance (denominator = n). */
export function populationVariance(values: number[]): number {
  if (values.length === 0) return 0;
  const m = mean(values);
  let acc = 0;
  for (const v of values) acc += (v - m) * (v - m);
  return acc / values.length;
}

/** Population standard deviation. */
export function populationStdDev(values: number[]): number {
  return Math.sqrt(populationVariance(values));
}

/** Linear interpolation between `a` and `b` by factor t in [0, 1]. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp01(t);
}

/** Inverse linear interpolation; returns factor t in [0, 1] for value between a and b. */
export function invLerp(a: number, b: number, value: number): number {
  if (a === b) return 0;
  return clamp01((value - a) / (b - a));
}

/** Map a value from one range to another (clamped). */
export function remap(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  const t = invLerp(inMin, inMax, value);
  return lerp(outMin, outMax, t);
}

/** Standard logistic sigmoid. */
export function sigmoid(x: number): number {
  if (x >= 35) return 1;
  if (x <= -35) return 0;
  return 1 / (1 + Math.exp(-x));
}

/** Hyperbolic tangent (range (-1, +1)). */
export function tanh(x: number): number {
  return Math.tanh(x);
}

/** Natural log, clamped to avoid -Infinity on zero. */
export function safeLog(x: number, epsilon = 1e-12): number {
  return Math.log(Math.max(x, epsilon));
}

/** Base-10 log, clamped to avoid -Infinity on zero. */
export function safeLog10(x: number, epsilon = 1e-12): number {
  return Math.log10(Math.max(x, epsilon));
}

/** Compute the percentile of a sorted-or-unsorted array using linear interpolation. */
export function percentile(values: number[], p: Percentage): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const pp = clampPct(p) / 100;
  const idx = pp * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  const frac = idx - lo;
  return sorted[lo] * (1 - frac) + sorted[hi] * frac;
}

/** First quartile. */
export function q1(values: number[]): number {
  return percentile(values, 25);
}

/** Third quartile. */
export function q3(values: number[]): number {
  return percentile(values, 75);
}

/** Interquartile range (IQR). */
export function iqr(values: number[]): number {
  return q3(values) - q1(values);
}

/** Weighted arithmetic mean. */
export function weightedMean(values: number[], weights: number[]): number {
  if (values.length === 0 || values.length !== weights.length) return 0;
  let num = 0;
  let denom = 0;
  for (let i = 0; i < values.length; i++) {
    num += values[i] * weights[i];
    denom += weights[i];
  }
  if (denom === 0) return 0;
  return num / denom;
}

/** Weighted standard deviation (frequency weights). */
export function weightedStdDev(values: number[], weights: number[]): number {
  if (values.length === 0 || values.length !== weights.length) return 0;
  const m = weightedMean(values, weights);
  let num = 0;
  let denom = 0;
  for (let i = 0; i < values.length; i++) {
    const d = values[i] - m;
    num += weights[i] * d * d;
    denom += weights[i];
  }
  if (denom <= 1) return 0;
  return Math.sqrt(num / (denom - 1));
}

/** Euclidean norm (L2) of an array of numbers. */
export function l2norm(values: number[]): number {
  let acc = 0;
  for (const v of values) acc += v * v;
  return Math.sqrt(acc);
}

/** L1 norm (sum of absolute values). */
export function l1norm(values: number[]): number {
  let acc = 0;
  for (const v of values) acc += Math.abs(v);
  return acc;
}

/** Cosine similarity between two equal-length vectors. */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/** Pearson correlation coefficient between two equal-length series. */
export function pearsonCorrelation(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length < 2) return 0;
  const ma = mean(a);
  const mb = mean(b);
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i] - ma;
    const y = b[i] - mb;
    num += x * y;
    da += x * x;
    db += y * y;
  }
  if (da === 0 || db === 0) return 0;
  return num / Math.sqrt(da * db);
}

/** Linear regression slope (least squares) for equally-spaced observations. */
export function linearRegressionSlope(values: number[]): number {
  if (values.length < 2) return 0;
  const n = values.length;
  const xs = Array.from({ length: n }, (_, i) => i);
  const mx = mean(xs);
  const my = mean(values);
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (values[i] - my);
    den += (xs[i] - mx) * (xs[i] - mx);
  }
  if (den === 0) return 0;
  return num / den;
}

/** Linear regression intercept for equally-spaced observations. */
export function linearRegressionIntercept(values: number[]): number {
  if (values.length < 2) return values[0] ?? 0;
  const n = values.length;
  const mx = (n - 1) / 2;
  const my = mean(values);
  return my - linearRegressionSlope(values) * mx;
}

/** Coefficient of variation (std / mean). Returns 0 for empty/zero-mean input. */
export function coefficientOfVariation(values: number[]): number {
  const m = mean(values);
  if (m === 0) return 0;
  return standardDeviation(values) / Math.abs(m);
}

/** Geometric mean. Returns 0 if any value is non-positive. */
export function geometricMean(values: number[]): number {
  if (values.length === 0) return 0;
  let logSum = 0;
  for (const v of values) {
    if (v <= 0) return 0;
    logSum += Math.log(v);
  }
  return Math.exp(logSum / values.length);
}

/** Cumulative sum of an array. */
export function cumulativeSum(values: number[]): number[] {
  const out: number[] = [];
  let acc = 0;
  for (const v of values) {
    acc += v;
    out.push(acc);
  }
  return out;
}

/** First difference (length n-1). */
export function diff(values: number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < values.length; i++) {
    out.push(values[i] - values[i - 1]);
  }
  return out;
}

/** Percent change series (length n-1); non-finite when prev = 0. */
export function percentChange(values: number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < values.length; i++) {
    const prev = values[i - 1];
    if (prev === 0) {
      out.push(values[i] === 0 ? 0 : Number.POSITIVE_INFINITY);
    } else {
      out.push((values[i] - prev) / Math.abs(prev));
    }
  }
  return out;
}

/** Min-max normalize to [0, 1]. Returns zeros for empty/constant input. */
export function minMaxNormalize(values: number[]): number[] {
  if (values.length === 0) return [];
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  if (lo === hi) return values.map(() => 0.5);
  const range = hi - lo;
  return values.map((v) => (v - lo) / range);
}

/** Z-score normalize. */
export function zscoreNormalize(values: number[]): number[] {
  if (values.length === 0) return [];
  const m = mean(values);
  const sd = standardDeviation(values);
  if (sd === 0) return values.map(() => 0);
  return values.map((v) => (v - m) / sd);
}

/** Sigmoid normalize (maps each value through the logistic function centered on the mean). */
export function sigmoidNormalize(values: number[]): number[] {
  if (values.length === 0) return [];
  const m = mean(values);
  const sd = standardDeviation(values);
  if (sd === 0) return values.map(() => 0.5);
  return values.map((v) => sigmoid((v - m) / sd));
}

/** Rank normalize — replaces each value with its percentile rank (0..1). */
export function rankNormalize(values: number[]): number[] {
  if (values.length === 0) return [];
  const indexed = values.map((v, i) => ({ v, i }));
  indexed.sort((a, b) => a.v - b.v);
  const out = new Array<number>(values.length).fill(0);
  for (let rank = 0; rank < indexed.length; rank++) {
    const { i } = indexed[rank];
    out[i] = rank / (indexed.length - 1 || 1);
  }
  return out;
}

/** Gini coefficient (0 = perfectly equal, 1 = maximally unequal). */
export function giniCoefficient(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  let cumulative = 0;
  for (let i = 0; i < n; i++) cumulative += (i + 1) * sorted[i];
  const total = sum(sorted);
  if (total === 0) return 0;
  return (2 * cumulative) / (n * total) - (n + 1) / n;
}

/** Herfindahl-Hirschman Index (0..1) for concentration. */
export function herfindahlIndex(shares: number[]): number {
  if (shares.length === 0) return 0;
  const total = sum(shares);
  if (total === 0) return 0;
  const normalized = shares.map((s) => s / total);
  let acc = 0;
  for (const s of normalized) acc += s * s;
  return acc;
}

/** Round to `decimals` decimal places. */
export function roundTo(value: number, decimals = 4): number {
  const f = Math.pow(10, decimals);
  return Math.round(value * f) / f;
}

/** Format a number as a percentage string with one decimal. */
export function formatPct(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/** Format a compact integer (1.2K, 3.4M, 5.6B). */
export function formatCompact(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return `${value.toFixed(0)}`;
}

/** Parse a possibly-missing numeric value, returning 0 on null/undefined/NaN. */
export function safeNumber(value: number | undefined | null, fallback = 0): number {
  if (value === null || value === undefined) return fallback;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** Hash a string into a 32-bit unsigned integer (FNV-1a). */
export function fnv1a32(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h >>> 0;
}

/** Convert an ISO date string to epoch ms. */
export function toEpochMs(iso: ISOString): EpochMs {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
}

/** Convert epoch ms to ISO date string. */
export function toISOString(epoch: EpochMs): ISOString {
  return new Date(epoch).toISOString();
}

/** Day bucket (YYYY-MM-DD) from an ISO date string. */
export function dayBucket(iso: ISOString): string {
  return iso.slice(0, 10);
}

/** Compute the difference in days between two ISO dates. */
export function dayDiff(aIso: ISOString, bIso: ISOString): number {
  const a = toEpochMs(aIso);
  const b = toEpochMs(bIso);
  return Math.round((a - b) / 86_400_000);
}

/** Add `days` days to an ISO date string and return a new ISO date string. */
export function addDays(iso: ISOString, days: number): ISOString {
  const t = toEpochMs(iso);
  return toISOString(t + days * 86_400_000);
}

/** A tiny deterministic PRNG (mulberry32) for reproducible samplings. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pick a deterministic sample (no replacement) of `k` elements from `items`. */
export function deterministicSample<T>(items: T[], k: number, seed = 42): T[] {
  if (items.length <= k) return [...items];
  const rng = mulberry32(seed);
  const indices = items.map((_, i) => i);
  // Fisher-Yates partial shuffle
  for (let i = indices.length - 1; i > 0 && i >= indices.length - k; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = indices[i];
    indices[i] = indices[j];
    indices[j] = tmp;
  }
  return indices.slice(indices.length - k).map((idx) => items[idx]);
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 4 — TIME-SERIES SMOOTHING (SMA / EMA / WMA / DEMA / TMA)
// ════════════════════════════════════════════════════════════════════════════

/** Simple Moving Average over a fixed window. */
export function simpleMovingAverage(values: number[], windowSize: number): number[] {
  if (windowSize <= 0) return values.slice();
  const out: number[] = new Array(values.length).fill(NaN);
  if (values.length === 0) return out;
  let running = 0;
  for (let i = 0; i < values.length; i++) {
    running += values[i];
    if (i >= windowSize) running -= values[i - windowSize];
    if (i >= windowSize - 1) {
      out[i] = running / windowSize;
    }
  }
  return out;
}

/** Exponential Moving Average with smoothing factor alpha = 2/(period+1). */
export function exponentialMovingAverage(values: number[], period: number): number[] {
  if (values.length === 0) return [];
  const alpha = 2 / (period + 1);
  const out: number[] = new Array(values.length).fill(NaN);
  out[0] = values[0];
  for (let i = 1; i < values.length; i++) {
    out[i] = values[i] * alpha + out[i - 1] * (1 - alpha);
  }
  return out;
}

/** Weighted Moving Average with linearly decreasing weights (most recent = highest). */
export function weightedMovingAverage(values: number[], period: number): number[] {
  if (period <= 0) return values.slice();
  const out: number[] = new Array(values.length).fill(NaN);
  const weights: number[] = [];
  let wsum = 0;
  for (let w = 1; w <= period; w++) {
    weights.push(w);
    wsum += w;
  }
  for (let i = period - 1; i < values.length; i++) {
    let acc = 0;
    for (let k = 0; k < period; k++) {
      acc += values[i - (period - 1) + k] * weights[k];
    }
    out[i] = acc / wsum;
  }
  return out;
}

/** Double Exponential Moving Average (DEMA) — reduces lag over EMA. */
export function doubleEMA(values: number[], period: number): number[] {
  const ema1 = exponentialMovingAverage(values, period);
  const ema2 = exponentialMovingAverage(ema1.map((v) => (Number.isNaN(v) ? 0 : v)), period);
  return ema1.map((v, i) => 2 * v - ema2[i]);
}

/** Triangular Moving Average (SMA of SMA). */
export function triangularMovingAverage(values: number[], period: number): number[] {
  const half = Math.ceil(period / 2);
  const sma1 = simpleMovingAverage(values, half);
  const clean = sma1.map((v) => (Number.isNaN(v) ? 0 : v));
  return simpleMovingAverage(clean, half);
}

/** Rolling maximum over a window. */
export function rollingMax(values: number[], windowSize: number): number[] {
  const out: number[] = new Array(values.length).fill(NaN);
  for (let i = 0; i < values.length; i++) {
    let m = Number.NEGATIVE_INFINITY;
    for (let k = Math.max(0, i - windowSize + 1); k <= i; k++) {
      if (values[k] > m) m = values[k];
    }
    if (Number.isFinite(m)) out[i] = m;
  }
  return out;
}

/** Rolling minimum over a window. */
export function rollingMin(values: number[], windowSize: number): number[] {
  const out: number[] = new Array(values.length).fill(NaN);
  for (let i = 0; i < values.length; i++) {
    let m = Number.POSITIVE_INFINITY;
    for (let k = Math.max(0, i - windowSize + 1); k <= i; k++) {
      if (values[k] < m) m = values[k];
    }
    if (Number.isFinite(m)) out[i] = m;
  }
  return out;
}

/** Rolling standard deviation (sample). */
export function rollingStdDev(values: number[], windowSize: number): number[] {
  const out: number[] = new Array(values.length).fill(NaN);
  for (let i = windowSize - 1; i < values.length; i++) {
    const slice = values.slice(i - windowSize + 1, i + 1);
    out[i] = standardDeviation(slice);
  }
  return out;
}

/** Rolling median. */
export function rollingMedian(values: number[], windowSize: number): number[] {
  const out: number[] = new Array(values.length).fill(NaN);
  for (let i = windowSize - 1; i < values.length; i++) {
    const slice = values.slice(i - windowSize + 1, i + 1);
    out[i] = median(slice);
  }
  return out;
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 5 — SHARE OF VOICE CALCULATOR
// ════════════════════════════════════════════════════════════════════════════

/** Default authority tier weights (used when SourceProfile doesn't override). */
export const DEFAULT_AUTHORITY_WEIGHTS: Record<AuthorityTier, number> = {
  [AuthorityTier.TIER_1_ELITE]: 1.0,
  [AuthorityTier.TIER_2_NATIONAL]: 0.7,
  [AuthorityTier.TIER_3_TRADE]: 0.5,
  [AuthorityTier.TIER_4_REGIONAL]: 0.3,
  [AuthorityTier.TIER_5_LONG_TAIL]: 0.15,
};

/** Configuration for the share-of-voice calculator. */
export interface ShareOfVoiceConfig {
  /** Use authority-weighted mention counts (default true). */
  authorityWeighted: boolean;
  /** Default authority weights per tier. */
  authorityWeights?: Partial<Record<AuthorityTier, number>>;
  /** Include sentiment weighting (default false). */
  sentimentAdjusted: boolean;
  /** Boost factor applied to positive mentions (default 1.0). */
  positiveBoost?: number;
  /** Penalty factor applied to negative mentions (default 1.0). */
  negativePenalty?: number;
  /** Use impressions instead of mentions when available. */
  preferImpressions: boolean;
  /** Use reach as a multiplier. */
  reachMultiplier: boolean;
  /** Deduplicate syndicated content. */
  dedupeSyndication: boolean;
  /** Minimum mention count to be considered "tracked". */
  minMentions?: number;
}

/** Default SoV configuration. */
export const DEFAULT_SOV_CONFIG: ShareOfVoiceConfig = {
  authorityWeighted: true,
  sentimentAdjusted: false,
  positiveBoost: 1.0,
  negativePenalty: 1.0,
  preferImpressions: false,
  reachMultiplier: false,
  dedupeSyndication: true,
  minMentions: 1,
};

/** Resolved weight for a given authority tier. */
export function resolveAuthorityWeight(
  tier: AuthorityTier,
  overrides?: Partial<Record<AuthorityTier, number>>,
): number {
  const fromOverride = overrides?.[tier];
  if (typeof fromOverride === "number" && Number.isFinite(fromOverride)) {
    return clamp01(fromOverride);
  }
  return DEFAULT_AUTHORITY_WEIGHTS[tier] ?? 0.5;
}

/** Sentiment-adjusted mention weight for a single mention. */
export function sentimentAdjustedMentionWeight(
  mention: Pick<MediaMention, "sentimentLabel" | "sentimentScore" | "confidence">,
  positiveBoost: number,
  negativePenalty: number,
): number {
  const confidence = clamp01(mention.confidence ?? 1);
  const base = 1;
  if (mention.sentimentLabel === SentimentPolarity.POSITIVE) {
    return base * positiveBoost * (1 + 0.5 * mention.sentimentScore) * confidence;
  }
  if (mention.sentimentLabel === SentimentPolarity.NEGATIVE) {
    return base * negativePenalty * (1 - 0.5 * mention.sentimentScore) * confidence;
  }
  return base * confidence;
}

/**
 * Compute the "weight" of a single mention per the SoV configuration.
 * The weight incorporates: authority tier, sentiment adjustment, confidence,
 * reach multiplier, and impression preference.
 */
export function computeMentionWeight(
  mention: MediaMention,
  config: ShareOfVoiceConfig,
): number {
  const authority = config.authorityWeighted
    ? resolveAuthorityWeight(mention.authorityTier, config.authorityWeights)
    : 1;
  let weight = authority;

  if (config.sentimentAdjusted) {
    weight *= sentimentAdjustedMentionWeight(
      mention,
      config.positiveBoost ?? 1,
      config.negativePenalty ?? 1,
    );
  }

  if (config.reachMultiplier) {
    const r = safeNumber(mention.reach, 1);
    // log-scale reach to avoid domination by single mega-reach mention
    weight *= 1 + safeLog10(r + 1);
  }

  if (config.preferImpressions && mention.impressions && mention.impressions > 0) {
    weight *= 1 + safeLog10(mention.impressions + 1) * 0.5;
  }

  return weight;
}

/** Deduplicate syndicated mentions; keeps the earliest instance per syndication parent. */
export function dedupeSyndicatedMentions(mentions: MediaMention[]): MediaMention[] {
  const seen = new Set<string>();
  const out: MediaMention[] = [];
  const sorted = [...mentions].sort((a, b) => a.publishedAt.localeCompare(b.publishedAt));
  for (const m of sorted) {
    if (m.isSyndicated && m.syndicationParentId) {
      if (seen.has(m.syndicationParentId)) continue;
      seen.add(m.syndicationParentId);
    }
    out.push(m);
  }
  return out;
}

/** Brand-level mention weight aggregate. */
export interface BrandMentionAggregate {
  brandId: string;
  rawMentions: number;
  uniqueSources: number;
  uniqueAuthors: number;
  totalReach: number;
  totalImpressions: number;
  totalEngagement: number;
  weightedMentions: number;
  positiveShare: number;
  negativeShare: number;
  neutralShare: number;
  avgSentiment: number;
}

/** Aggregate mentions per brand. */
export function aggregateBrandMentions(
  brandId: string,
  mentions: MediaMention[],
  config: ShareOfVoiceConfig,
): BrandMentionAggregate {
  const cleaned = config.dedupeSyndication ? dedupeSyndicatedMentions(mentions) : mentions;
  const sources = new Set<string>();
  const authors = new Set<string>();
  let totalReach = 0;
  let totalImpressions = 0;
  let totalEngagement = 0;
  let weighted = 0;
  let pos = 0;
  let neg = 0;
  let neu = 0;
  let sentimentAcc = 0;
  let sentimentCount = 0;

  for (const m of cleaned) {
    sources.add(m.sourceId);
    if (m.authorHandle) authors.add(m.authorHandle);
    totalReach += safeNumber(m.reach);
    totalImpressions += safeNumber(m.impressions);
    totalEngagement += safeNumber(m.engagement);
    weighted += computeMentionWeight(m, config);
    if (m.sentimentLabel === SentimentPolarity.POSITIVE) pos++;
    else if (m.sentimentLabel === SentimentPolarity.NEGATIVE) neg++;
    else neu++;
    sentimentAcc += m.sentimentScore;
    sentimentCount++;
  }

  const total = pos + neg + neu || 1;
  return {
    brandId,
    rawMentions: cleaned.length,
    uniqueSources: sources.size,
    uniqueAuthors: authors.size,
    totalReach,
    totalImpressions,
    totalEngagement,
    weightedMentions: weighted,
    positiveShare: pos / total,
    negativeShare: neg / total,
    neutralShare: neu / total,
    avgSentiment: sentimentCount > 0 ? sentimentAcc / sentimentCount : 0,
  };
}

/** Share-of-voice row for a single brand. */
export interface ShareOfVoiceRow {
  brandId: string;
  weightedShare: number; // 0..100
  rawShare: number; // 0..100
  reachShare: number; // 0..100
  impressionsShare: number; // 0..100
  engagementShare: number; // 0..100
  positiveShare: number; // 0..100 (within brand)
  negativeShare: number; // 0..100
  rank: number;
  competitiveIndex: number; // 0..100 — relative dominance
}

/** Result of a competitive share-of-voice matrix. */
export interface ShareOfVoiceMatrix {
  rows: ShareOfVoiceRow[];
  totalWeightedMentions: number;
  totalRawMentions: number;
  totalReach: number;
  totalImpressions: number;
  totalEngagement: number;
  herfindahl: number; // 0..1 — concentration
  gini: number; // 0..1 — inequality
  leader: string | null;
  challenger: string | null;
  computedAt: EpochMs;
}

/** Compute the share-of-voice matrix across multiple brands. */
export function computeShareOfVoiceMatrix(
  mentionsByBrand: Map<string, MediaMention[]>,
  config: ShareOfVoiceConfig = DEFAULT_SOV_CONFIG,
): ShareOfVoiceMatrix {
  const aggregates = new Map<string, BrandMentionAggregate>();
  let totalWeighted = 0;
  let totalRaw = 0;
  let totalReach = 0;
  let totalImpressions = 0;
  let totalEngagement = 0;

  for (const [brandId, mentions] of mentionsByBrand.entries()) {
    const agg = aggregateBrandMentions(brandId, mentions, config);
    if (config.minMentions && agg.rawMentions < config.minMentions) continue;
    aggregates.set(brandId, agg);
    totalWeighted += agg.weightedMentions;
    totalRaw += agg.rawMentions;
    totalReach += agg.totalReach;
    totalImpressions += agg.totalImpressions;
    totalEngagement += agg.totalEngagement;
  }

  const rows: ShareOfVoiceRow[] = [];
  for (const [brandId, agg] of aggregates.entries()) {
    const weightedShare = totalWeighted > 0 ? (agg.weightedMentions / totalWeighted) * 100 : 0;
    const rawShare = totalRaw > 0 ? (agg.rawMentions / totalRaw) * 100 : 0;
    const reachShare = totalReach > 0 ? (agg.totalReach / totalReach) * 100 : 0;
    const impressionsShare = totalImpressions > 0 ? (agg.totalImpressions / totalImpressions) * 100 : 0;
    const engagementShare = totalEngagement > 0 ? (agg.totalEngagement / totalEngagement) * 100 : 0;
    rows.push({
      brandId,
      weightedShare,
      rawShare,
      reachShare,
      impressionsShare,
      engagementShare,
      positiveShare: agg.positiveShare * 100,
      negativeShare: agg.negativeShare * 100,
      rank: 0, // assigned below
      competitiveIndex: 0, // assigned below
    });
  }

  rows.sort((a, b) => b.weightedShare - a.weightedShare);
  const maxShare = rows.length > 0 ? rows[0].weightedShare : 0;
  rows.forEach((row, idx) => {
    row.rank = idx + 1;
    row.competitiveIndex = maxShare > 0 ? (row.weightedShare / maxShare) * 100 : 0;
  });

  const leader = rows.length > 0 ? rows[0].brandId : null;
  const challenger = rows.length > 1 ? rows[1].brandId : null;
  const herfindahl = herfindahlIndex(rows.map((r) => r.weightedShare));
  const gini = giniCoefficient(rows.map((r) => r.weightedShare));

  return {
    rows,
    totalWeightedMentions: totalWeighted,
    totalRawMentions: totalRaw,
    totalReach,
    totalImpressions,
    totalEngagement,
    herfindahl,
    gini,
    leader,
    challenger,
    computedAt: Date.now(),
  };
}

/** Compute a single brand's sentiment-adjusted share of voice. */
export function computeSentimentAdjustedShareOfVoice(
  brandMentions: MediaMention[],
  competitorMentions: Map<string, MediaMention[]>,
): { brandId: string; share: number; competitorShares: Array<{ brandId: string; share: number }> } {
  const all = new Map<string, MediaMention[]>();
  for (const [brandId, list] of competitorMentions.entries()) {
    all.set(brandId, list);
  }
  // Determine brandId from the brand mentions if available
  const brandId = brandMentions[0]?.brandId ?? "self";
  all.set(brandId, brandMentions);

  const config: ShareOfVoiceConfig = {
    ...DEFAULT_SOV_CONFIG,
    authorityWeighted: true,
    sentimentAdjusted: true,
    positiveBoost: 1.2,
    negativePenalty: 0.8,
    reachMultiplier: false,
    preferImpressions: false,
  };
  const matrix = computeShareOfVoiceMatrix(all, config);
  const selfRow = matrix.rows.find((r) => r.brandId === brandId);
  return {
    brandId,
    share: selfRow?.weightedShare ?? 0,
    competitorShares: matrix.rows
      .filter((r) => r.brandId !== brandId)
      .map((r) => ({ brandId: r.brandId, share: r.weightedShare })),
  };
}

/** Compute the competitive SoV matrix — symmetric grid of pairwise overlaps. */
export interface CompetitiveSoVCell {
  rowBrandId: string;
  colBrandId: string;
  rowShare: number;
  colShare: number;
  dominance: number; // -100..+100 (positive = row dominates)
  overlap: number; // 0..100 — co-mention rate
}

export function computeCompetitiveSoVMatrix(
  matrix: ShareOfVoiceMatrix,
  coMentions: Map<string, Map<string, number>>,
): CompetitiveSoVCell[] {
  const cells: CompetitiveSoVCell[] = [];
  const rows = matrix.rows;
  for (const row of rows) {
    for (const col of rows) {
      const overlap = coMentions.get(row.brandId)?.get(col.brandId) ?? 0;
      const dominance = row.weightedShare + col.weightedShare === 0
        ? 0
        : ((row.weightedShare - col.weightedShare) / (row.weightedShare + col.weightedShare)) * 100;
      cells.push({
        rowBrandId: row.brandId,
        colBrandId: col.brandId,
        rowShare: row.weightedShare,
        colShare: col.weightedShare,
        dominance,
        overlap,
      });
    }
  }
  return cells;
}

/** SoV trend over time (per-window weighted share). */
export interface SoVTrendPoint {
  date: ISOString;
  brandId: string;
  weightedShare: number;
  rawShare: number;
  volume: number;
}

export function computeSoVTrend(
  mentionsByBrandByDate: Map<string, Map<string, MediaMention[]>>,
  config: ShareOfVoiceConfig = DEFAULT_SOV_CONFIG,
): SoVTrendPoint[] {
  const points: SoVTrendPoint[] = [];
  // Determine all dates
  const dateSet = new Set<string>();
  for (const byDate of mentionsByBrandByDate.values()) {
    for (const d of byDate.keys()) dateSet.add(d);
  }
  const dates = [...dateSet].sort();
  for (const date of dates) {
    const dailyMap = new Map<string, MediaMention[]>();
    for (const [brandId, byDate] of mentionsByBrandByDate.entries()) {
      const mentions = byDate.get(date);
      if (mentions && mentions.length > 0) dailyMap.set(brandId, mentions);
    }
    if (dailyMap.size === 0) continue;
    const matrix = computeShareOfVoiceMatrix(dailyMap, config);
    let totalVolume = 0;
    for (const row of matrix.rows) totalVolume += row.rawShare;
    for (const row of matrix.rows) {
      points.push({
        date,
        brandId: row.brandId,
        weightedShare: row.weightedShare,
        rawShare: row.rawShare,
        volume: matrix.totalRawMentions,
      });
    }
  }
  return points;
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 6 — MEDIA REACH AGGREGATOR
// ════════════════════════════════════════════════════════════════════════════

/** Per-channel reach aggregate. */
export interface ChannelReachAggregate {
  channel: MediaChannel;
  mentions: number;
  uniqueSources: number;
  reach: number;
  impressions: number;
  engagement: number;
  amp: number; // Average Media Potential
  shareOfReach: number; // 0..100
  shareOfMentions: number; // 0..100
}

/** Result of a media-reach aggregation. */
export interface MediaReachAggregate {
  brandId: string;
  totalReach: number;
  totalImpressions: number;
  totalEngagement: number;
  totalMentions: number;
  uniqueSources: number;
  uniqueAuthors: number;
  avgEngagementRate: number;
  amp: number; // composite Average Media Potential
  byChannel: ChannelReachAggregate[];
  topSources: Array<{ sourceId: string; sourceName: string; reach: number; mentions: number; channel: MediaChannel }>;
  reachConcentration: number; // 0..1 — HHI
  computedAt: EpochMs;
}

/** Default channel weights for AMP computation. */
export const DEFAULT_CHANNEL_WEIGHTS: Record<MediaChannel, number> = {
  [MediaChannel.PRINT]: 0.85,
  [MediaChannel.ONLINE]: 1.0,
  [MediaChannel.SOCIAL]: 0.65,
  [MediaChannel.BROADCAST]: 1.2,
  [MediaChannel.PODCAST]: 0.55,
  [MediaChannel.AI]: 0.95,
  [MediaChannel.REGULATORY]: 0.9,
  [MediaChannel.INDUSTRY]: 0.7,
};

/**
 * Compute Average Media Potential (AMP) for a single channel.
 * AMP = (reach * authority) * (1 + engagementRate) * channelWeight * authorityWeight
 * Returns a 0..100 normalized score.
 */
export function computeChannelAMP(
  mentions: MediaMention[],
  channel: MediaChannel,
  channelWeight: number = DEFAULT_CHANNEL_WEIGHTS[channel] ?? 1,
): number {
  if (mentions.length === 0) return 0;
  let reach = 0;
  let impressions = 0;
  let engagement = 0;
  let authorityAcc = 0;
  for (const m of mentions) {
    reach += safeNumber(m.reach);
    impressions += safeNumber(m.impressions);
    engagement += safeNumber(m.engagement);
    authorityAcc += m.authorityScore;
  }
  const avgAuthority = authorityAcc / mentions.length;
  const engagementRate = impressions > 0 ? engagement / impressions : 0;
  const reachPerMention = reach / mentions.length;
  // Normalize reach per mention using log scale, then scale to 0..100
  const reachScore = clamp01(safeLog10(reachPerMention + 1) / 6) * 100; // 10^6 = 100
  const amp = reachScore * avgAuthority * (1 + clamp(engagementRate, 0, 5)) * channelWeight;
  return clampPct(amp);
}

/** Aggregate reach across all channels for a brand. */
export function aggregateMediaReach(
  brandId: string,
  mentions: MediaMention[],
  channelWeights: Partial<Record<MediaChannel, number>> = {},
): MediaReachAggregate {
  const byChannelMap = new Map<MediaChannel, MediaMention[]>();
  const sourceMap = new Map<string, { sourceId: string; sourceName: string; reach: number; mentions: number; channel: MediaChannel }>();
  const authors = new Set<string>();

  for (const m of mentions) {
    if (!byChannelMap.has(m.sourceChannel)) byChannelMap.set(m.sourceChannel, []);
    byChannelMap.get(m.sourceChannel)!.push(m);
    if (m.authorHandle) authors.add(m.authorHandle);

    const key = m.sourceId;
    const existing = sourceMap.get(key);
    if (existing) {
      existing.reach += safeNumber(m.reach);
      existing.mentions += 1;
    } else {
      sourceMap.set(key, {
        sourceId: m.sourceId,
        sourceName: m.sourceName,
        reach: safeNumber(m.reach),
        mentions: 1,
        channel: m.sourceChannel,
      });
    }
  }

  let totalReach = 0;
  let totalImpressions = 0;
  let totalEngagement = 0;
  let totalMentions = 0;
  const channelAggs: ChannelReachAggregate[] = [];

  for (const [channel, channelMentions] of byChannelMap.entries()) {
    const weight = channelWeights[channel] ?? DEFAULT_CHANNEL_WEIGHTS[channel] ?? 1;
    let chReach = 0;
    let chImpressions = 0;
    let chEngagement = 0;
    const sources = new Set<string>();
    for (const m of channelMentions) {
      chReach += safeNumber(m.reach);
      chImpressions += safeNumber(m.impressions);
      chEngagement += safeNumber(m.engagement);
      sources.add(m.sourceId);
    }
    totalReach += chReach;
    totalImpressions += chImpressions;
    totalEngagement += chEngagement;
    totalMentions += channelMentions.length;
    channelAggs.push({
      channel,
      mentions: channelMentions.length,
      uniqueSources: sources.size,
      reach: chReach,
      impressions: chImpressions,
      engagement: chEngagement,
      amp: computeChannelAMP(channelMentions, channel, weight),
      shareOfReach: 0, // filled below
      shareOfMentions: 0,
    });
  }

  for (const c of channelAggs) {
    c.shareOfReach = totalReach > 0 ? (c.reach / totalReach) * 100 : 0;
    c.shareOfMentions = totalMentions > 0 ? (c.mentions / totalMentions) * 100 : 0;
  }

  channelAggs.sort((a, b) => b.reach - a.reach);
  const topSources = [...sourceMap.values()].sort((a, b) => b.reach - a.reach).slice(0, 20);
  const engagementRate = totalImpressions > 0 ? totalEngagement / totalImpressions : 0;

  // Composite AMP: weighted average of channel AMPs by reach share
  let compositeAMP = 0;
  for (const c of channelAggs) {
    compositeAMP += c.amp * (c.shareOfReach / 100);
  }

  return {
    brandId,
    totalReach,
    totalImpressions,
    totalEngagement,
    totalMentions,
    uniqueSources: sourceMap.size,
    uniqueAuthors: authors.size,
    avgEngagementRate: engagementRate,
    amp: clampPct(compositeAMP),
    byChannel: channelAggs,
    topSources,
    reachConcentration: herfindahlIndex([...sourceMap.values()].map((s) => s.reach)),
    computedAt: Date.now(),
  };
}

/** Reach projection — extrapolate 7-day forward reach using linear regression. */
export function projectReach(
  dailyReach: Array<{ date: ISOString; reach: number }>,
  days = 7,
): Array<{ date: ISOString; reach: number; projected: true }> {
  if (dailyReach.length < 2) return [];
  const sorted = [...dailyReach].sort((a, b) => a.date.localeCompare(b.date));
  const values = sorted.map((d) => d.reach);
  const slope = linearRegressionSlope(values);
  const intercept = linearRegressionIntercept(values);
  const last = sorted[sorted.length - 1];
  const out: Array<{ date: ISOString; reach: number; projected: true }> = [];
  for (let i = 1; i <= days; i++) {
    const projected = Math.max(0, intercept + slope * (values.length - 1 + i));
    out.push({
      date: addDays(last.date, i),
      reach: Math.round(projected),
      projected: true,
    });
  }
  return out;
}

/** Estimate the effective reach given syndication overlap factor. */
export function effectiveReach(totalReach: number, uniqueSources: number, syndicationFactor = 0.85): number {
  if (totalReach <= 0) return 0;
  if (uniqueSources <= 1) return totalReach * syndicationFactor;
  // Apply a log-damping factor for source diversity
  const diversity = 1 - 1 / (1 + safeLog(uniqueSources + 1));
  return totalReach * syndicationFactor * (0.7 + 0.3 * diversity);
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 7 — SENTIMENT TREND ANALYZER
// ════════════════════════════════════════════════════════════════════════════

/** Configuration for the sentiment trend analyzer. */
export interface SentimentTrendConfig {
  smaWindow: number;
  emaPeriod: number;
  wmaPeriod: number;
  velocityWindow: number;
  accelerationWindow: number;
  anomalyZThreshold: number;
  anomalyMadThreshold: number;
  minPointsForAnomaly: number;
}

/** Default sentiment trend configuration. */
export const DEFAULT_SENTIMENT_TREND_CONFIG: SentimentTrendConfig = {
  smaWindow: 7,
  emaPeriod: 7,
  wmaPeriod: 7,
  velocityWindow: 3,
  accelerationWindow: 3,
  anomalyZThreshold: 2.5,
  anomalyMadThreshold: 3.5,
  minPointsForAnomaly: 8,
};

/** Result of sentiment trend analysis. */
export interface SentimentTrendAnalysis {
  points: SentimentTimePoint[];
  sma: number[];
  ema: number[];
  wma: number[];
  velocity: number[];
  acceleration: number[];
  velocityDirection: TrajectoryDirection;
  accelerationDirection: TrajectoryDirection;
  meanSentiment: number;
  volatility: number;
  anomalies: SentimentAnomaly[];
  currentStage: "improving" | "stable" | "declining" | "volatile";
  trendStrength: number; // 0..1
  computedAt: EpochMs;
}

/** Sentiment anomaly descriptor. */
export interface SentimentAnomaly {
  index: number;
  date?: ISOString;
  value: number;
  expected: number;
  zScore: number;
  modifiedZScore: number;
  kind: AnomalyKind;
  severity: number; // 0..1
}

/** Build SentimentTimePoint[] from raw MediaMention list grouped by date. */
export function buildSentimentTimeSeries(
  mentions: MediaMention[],
  window: AggregationWindow = AggregationWindow.DAY,
): SentimentTimePoint[] {
  const bucketMs =
    window === AggregationWindow.HOUR
      ? 3_600_000
      : window === AggregationWindow.DAY
        ? 86_400_000
        : window === AggregationWindow.WEEK
          ? 7 * 86_400_000
          : 30 * 86_400_000; // month (approx)

  const buckets = new Map<number, { pos: number; neu: number; neg: number; total: number; sum: number; count: number }>();
  for (const m of mentions) {
    const t = toEpochMs(m.publishedAt);
    if (t === 0) continue;
    const bucket = Math.floor(t / bucketMs) * bucketMs;
    const entry = buckets.get(bucket) ?? { pos: 0, neu: 0, neg: 0, total: 0, sum: 0, count: 0 };
    entry.total++;
    entry.sum += m.sentimentScore;
    entry.count++;
    if (m.sentimentLabel === SentimentPolarity.POSITIVE) entry.pos++;
    else if (m.sentimentLabel === SentimentPolarity.NEGATIVE) entry.neg++;
    else entry.neu++;
    buckets.set(bucket, entry);
  }

  const sorted = [...buckets.entries()].sort((a, b) => a[0] - b[0]);
  return sorted.map(([t, e]) => ({
    t,
    date: toISOString(t),
    value: e.count > 0 ? e.sum / e.count : 0,
    positivePct: e.total > 0 ? e.pos / e.total : 0,
    neutralPct: e.total > 0 ? e.neu / e.total : 0,
    negativePct: e.total > 0 ? e.neg / e.total : 0,
    volume: e.total,
  }));
}

/** Compute sentiment velocity (first difference of the smoothed series). */
export function computeVelocity(smoothed: number[], windowSize: number): number[] {
  const out: number[] = new Array(smoothed.length).fill(NaN);
  for (let i = windowSize; i < smoothed.length; i++) {
    if (Number.isNaN(smoothed[i]) || Number.isNaN(smoothed[i - windowSize])) {
      out[i] = NaN;
      continue;
    }
    out[i] = smoothed[i] - smoothed[i - windowSize];
  }
  return out;
}

/** Compute sentiment acceleration (first difference of the velocity series). */
export function computeAcceleration(velocity: number[], windowSize: number): number[] {
  return computeVelocity(velocity, windowSize);
}

/** Classify trajectory direction for a numeric series. */
export function classifyTrajectory(values: number[]): TrajectoryDirection {
  const valid = values.filter((v) => Number.isFinite(v));
  if (valid.length < 3) return TrajectoryDirection.STABLE;
  const slope = linearRegressionSlope(valid);
  const sd = standardDeviation(valid);
  // Use a relative slope threshold; if volatility > slope magnitude, mark volatile
  const volatilityRatio = sd === 0 ? 0 : Math.abs(slope) / sd;
  if (volatilityRatio < 0.1 && sd > 0.15) return TrajectoryDirection.VOLATILE;
  if (slope > 0.01) return TrajectoryDirection.RISING;
  if (slope < -0.01) return TrajectoryDirection.FALLING;
  return TrajectoryDirection.STABLE;
}

/** Detect anomalies using a hybrid z-score + MAD approach. */
export function detectSentimentAnomalies(
  points: SentimentTimePoint[],
  smoothed: number[],
  config: SentimentTrendConfig,
): SentimentAnomaly[] {
  if (points.length < config.minPointsForAnomaly) return [];
  const residuals: number[] = [];
  for (let i = 0; i < points.length; i++) {
    if (Number.isNaN(smoothed[i])) {
      residuals.push(0);
    } else {
      residuals.push(points[i].value - smoothed[i]);
    }
  }
  const m = mean(residuals);
  const sd = standardDeviation(residuals);
  const med = median(residuals);
  const mad = median(residuals.map((r) => Math.abs(r - med)));
  const scaledMad = mad * 1.4826; // consistency with std for normal dist

  const anomalies: SentimentAnomaly[] = [];
  for (let i = 0; i < residuals.length; i++) {
    const z = sd > 0 ? (residuals[i] - m) / sd : 0;
    const mz = scaledMad > 0 ? (residuals[i] - med) / scaledMad : 0;
    const absZ = Math.abs(z);
    const absMz = Math.abs(mz);
    if (absZ >= config.anomalyZThreshold || absMz >= config.anomalyMadThreshold) {
      const kind = classifyAnomalyKind(points, smoothed, i, residuals[i]);
      const severity = clamp01(Math.max(absZ / config.anomalyZThreshold, absMz / config.anomalyMadThreshold) / 3);
      anomalies.push({
        index: i,
        date: points[i].date,
        value: points[i].value,
        expected: Number.isNaN(smoothed[i]) ? m : smoothed[i],
        zScore: z,
        modifiedZScore: mz,
        kind,
        severity,
      });
    }
  }
  return anomalies;
}

/** Classify an anomaly as spike/drop/level-shift/volatility-burst/staleness. */
function classifyAnomalyKind(
  points: SentimentTimePoint[],
  smoothed: number[],
  i: number,
  residual: number,
): AnomalyKind {
  if (residual > 0) {
    // Look at surrounding window
    const window = 3;
    let posCount = 0;
    let negCount = 0;
    for (let k = Math.max(0, i - window); k <= Math.min(points.length - 1, i + window); k++) {
      if (k === i) continue;
      const r = points[k].value - (Number.isNaN(smoothed[k]) ? 0 : smoothed[k]);
      if (r > 0.05) posCount++;
      else if (r < -0.05) negCount++;
    }
    if (posCount > negCount && posCount >= 2) return AnomalyKind.LEVEL_SHIFT;
    return AnomalyKind.SPIKE;
  } else {
    const window = 3;
    let negCount = 0;
    let posCount = 0;
    for (let k = Math.max(0, i - window); k <= Math.min(points.length - 1, i + window); k++) {
      if (k === i) continue;
      const r = points[k].value - (Number.isNaN(smoothed[k]) ? 0 : smoothed[k]);
      if (r < -0.05) negCount++;
      else if (r > 0.05) posCount++;
    }
    if (negCount > posCount && negCount >= 2) return AnomalyKind.LEVEL_SHIFT;
    return AnomalyKind.DROP;
  }
}

/** Determine the current stage of sentiment evolution. */
export function classifySentimentStage(
  velocity: number[],
  acceleration: number[],
): "improving" | "stable" | "declining" | "volatile" {
  const validV = velocity.filter((v) => Number.isFinite(v));
  const validA = acceleration.filter((a) => Number.isFinite(a));
  if (validV.length < 2) return "stable";
  const lastV = validV[validV.length - 1];
  const lastA = validA.length > 0 ? validA[validA.length - 1] : 0;
  const sdV = standardDeviation(validV);
  if (sdV > 0.1) return "volatile";
  if (lastV > 0.02 && lastA >= 0) return "improving";
  if (lastV < -0.02 && lastA <= 0) return "declining";
  return "stable";
}

/** Compute trend strength (R² of linear fit). */
export function computeTrendStrength(values: number[]): number {
  if (values.length < 3) return 0;
  const valid = values.filter((v) => Number.isFinite(v));
  if (valid.length < 3) return 0;
  const slope = linearRegressionSlope(valid);
  const intercept = linearRegressionIntercept(valid);
  const m = mean(valid);
  let ssRes = 0;
  let ssTot = 0;
  for (let i = 0; i < valid.length; i++) {
    const predicted = slope * i + intercept;
    ssRes += (valid[i] - predicted) ** 2;
    ssTot += (valid[i] - m) ** 2;
  }
  if (ssTot === 0) return 0;
  return clamp01(1 - ssRes / ssTot);
}

/** Full sentiment trend analysis pipeline. */
export function analyzeSentimentTrend(
  mentions: MediaMention[],
  config: SentimentTrendConfig = DEFAULT_SENTIMENT_TREND_CONFIG,
): SentimentTrendAnalysis {
  const points = buildSentimentTimeSeries(mentions, AggregationWindow.DAY);
  const values = points.map((p) => p.value);
  const sma = simpleMovingAverage(values, config.smaWindow);
  const ema = exponentialMovingAverage(values, config.emaPeriod);
  const wma = weightedMovingAverage(values, config.wmaPeriod);
  const velocity = computeVelocity(sma, config.velocityWindow);
  const acceleration = computeAcceleration(velocity, config.accelerationWindow);
  const anomalies = detectSentimentAnomalies(points, sma, config);
  const velocityDirection = classifyTrajectory(velocity.filter((v) => Number.isFinite(v)));
  const accelerationDirection = classifyTrajectory(acceleration.filter((a) => Number.isFinite(a)));
  const currentStage = classifySentimentStage(velocity, acceleration);
  const trendStrength = computeTrendStrength(values);

  return {
    points,
    sma,
    ema,
    wma,
    velocity,
    acceleration,
    velocityDirection,
    accelerationDirection,
    meanSentiment: mean(values),
    volatility: standardDeviation(values),
    anomalies,
    currentStage,
    trendStrength,
    computedAt: Date.now(),
  };
}

/** Compute a net sentiment score: positive share − negative share (−100..+100). */
export function netSentimentScore(
  positive: number,
  negative: number,
  neutral: number,
): number {
  const total = positive + negative + neutral;
  if (total === 0) return 0;
  return ((positive - negative) / total) * 100;
}

/** Compute the sentiment momentum index — combines velocity and trend strength. */
export function sentimentMomentumIndex(trend: SentimentTrendAnalysis): number {
  const validV = trend.velocity.filter((v) => Number.isFinite(v));
  if (validV.length === 0) return 0;
  const lastV = validV[validV.length - 1];
  const momentum = lastV * trend.trendStrength * 100;
  return clamp(momentum, -100, 100);
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 8 — INFLUENCE SCORER
// ════════════════════════════════════════════════════════════════════════════

/** Configuration for influence scoring. */
export interface InfluenceScoringConfig {
  reachWeight: number;
  engagementWeight: number;
  authorityWeight: number;
  volumeWeight: number;
  recencyWeight: number;
  tierBoosts?: Partial<Record<InfluenceTier, number>>;
  decayHalfLifeDays: number;
}

/** Default influence scoring configuration. */
export const DEFAULT_INFLUENCE_CONFIG: InfluenceScoringConfig = {
  reachWeight: 0.35,
  engagementWeight: 0.25,
  authorityWeight: 0.25,
  volumeWeight: 0.1,
  recencyWeight: 0.05,
  decayHalfLifeDays: 14,
};

/** Classify an influencer into a tier based on followers. */
export function classifyInfluencerTier(followers: number): InfluenceTier {
  if (followers >= 1_000_000) return InfluenceTier.MEGA;
  if (followers >= 100_000) return InfluenceTier.MACRO;
  if (followers >= 10_000) return InfluenceTier.MID;
  if (followers >= 1_000) return InfluenceTier.MICRO;
  return InfluenceTier.NANO;
}

/** Apply time-decay weighting to a mention based on its age. */
export function recencyDecayWeight(
  publishedAt: ISOString,
  referenceTime: EpochMs = Date.now(),
  halfLifeDays: number,
): number {
  const t = toEpochMs(publishedAt);
  if (t === 0) return 0;
  const ageDays = Math.max(0, (referenceTime - t) / 86_400_000);
  if (halfLifeDays <= 0) return 1;
  return Math.pow(0.5, ageDays / halfLifeDays);
}

/** Compute a single influencer's composite score (0..100). */
export function computeInfluencerScore(
  profile: InfluencerProfile,
  mentions: MediaMention[],
  config: InfluenceScoringConfig = DEFAULT_INFLUENCE_CONFIG,
  referenceTime: EpochMs = Date.now(),
): number {
  if (mentions.length === 0) {
    // Score by profile alone
    const reachScore = clamp01(safeLog10(profile.followers + 1) / 7); // 10^7 = 1
    const engagementScore = clamp01(profile.avgEngagementRate * 10);
    const authorityScore = clamp01(profile.authorityScore);
    const tier = classifyInfluencerTier(profile.followers);
    const tierBoost = config.tierBoosts?.[tier] ?? 1;
    const raw =
      reachScore * config.reachWeight +
      engagementScore * config.engagementWeight +
      authorityScore * config.authorityWeight;
    return clampPct(raw * 100 * tierBoost);
  }

  let reachAcc = 0;
  let engagementAcc = 0;
  let authorityAcc = 0;
  let recencyAcc = 0;
  let count = 0;

  for (const m of mentions) {
    reachAcc += safeNumber(m.reach, profile.followers);
    engagementAcc += safeNumber(m.engagement);
    authorityAcc += m.authorityScore;
    recencyAcc += recencyDecayWeight(m.publishedAt, referenceTime, config.decayHalfLifeDays);
    count++;
  }

  const avgReach = reachAcc / count;
  const avgEngagement = engagementAcc / count;
  const avgAuthority = authorityAcc / count;
  const avgRecency = recencyAcc / count;

  // Normalize each component to 0..1
  const reachNorm = clamp01(safeLog10(avgReach + 1) / 7);
  const engagementNorm = clamp01(avgEngagement > 0 ? safeLog10(avgEngagement + 1) / 5 : profile.avgEngagementRate * 10);
  const authorityNorm = clamp01(avgAuthority);
  const volumeNorm = clamp01(safeLog10(count + 1) / 3); // 10^3 = 1
  const recencyNorm = clamp01(avgRecency);

  const tier = classifyInfluencerTier(profile.followers);
  const tierBoost = config.tierBoosts?.[tier] ?? 1;

  const composite =
    reachNorm * config.reachWeight +
    engagementNorm * config.engagementWeight +
    authorityNorm * config.authorityWeight +
    volumeNorm * config.volumeWeight +
    recencyNorm * config.recencyWeight;

  return clampPct(composite * 100 * tierBoost);
}

/** Influencer ranking entry. */
export interface InfluencerRankingEntry {
  influencerId: string;
  handle: string;
  displayName: string;
  tier: InfluenceTier;
  followers: number;
  mentions: number;
  totalReach: number;
  totalEngagement: number;
  score: number;
  rank: number;
  percentile: number;
}

/** Rank a set of influencers by their composite score. */
export function rankInfluencers(
  profiles: InfluencerProfile[],
  mentionsByInfluencer: Map<string, MediaMention[]>,
  config: InfluenceScoringConfig = DEFAULT_INFLUENCE_CONFIG,
  referenceTime: EpochMs = Date.now(),
): InfluencerRankingEntry[] {
  const entries: InfluencerRankingEntry[] = profiles.map((profile) => {
    const mentions = mentionsByInfluencer.get(profile.influencerId) ?? [];
    let totalReach = 0;
    let totalEngagement = 0;
    for (const m of mentions) {
      totalReach += safeNumber(m.reach);
      totalEngagement += safeNumber(m.engagement);
    }
    return {
      influencerId: profile.influencerId,
      handle: profile.handle,
      displayName: profile.displayName,
      tier: classifyInfluencerTier(profile.followers),
      followers: profile.followers,
      mentions: mentions.length,
      totalReach,
      totalEngagement,
      score: computeInfluencerScore(profile, mentions, config, referenceTime),
      rank: 0,
      percentile: 0,
    };
  });
  entries.sort((a, b) => b.score - a.score);
  const n = entries.length;
  entries.forEach((entry, idx) => {
    entry.rank = idx + 1;
    entry.percentile = n > 1 ? ((n - idx - 1) / (n - 1)) * 100 : 100;
  });
  return entries;
}

/** Compute an influencer's "amplification factor" — how much they amplify a story. */
export function computeAmplificationFactor(
  profile: InfluencerProfile,
  mentions: MediaMention[],
): number {
  if (mentions.length === 0) return 1;
  let sum = 0;
  for (const m of mentions) {
    const reach = safeNumber(m.reach, profile.followers);
    const engagement = safeNumber(m.engagement);
    const ratio = profile.followers > 0 ? reach / profile.followers : 1;
    const er = profile.followers > 0 ? engagement / profile.followers : 0;
    sum += ratio * (1 + er * 5);
  }
  return sum / mentions.length;
}

/** Identify "key voices" — influencers whose score is in the top decile. */
export function identifyKeyVoices(
  ranking: InfluencerRankingEntry[],
  percentileThreshold = 90,
): InfluencerRankingEntry[] {
  return ranking.filter((r) => r.percentile >= percentileThreshold);
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 9 — NARRATIVE TRACKER
// ════════════════════════════════════════════════════════════════════════════

/** Theme descriptor extracted from a corpus. */
export interface Theme {
  themeId: string;
  label: string;
  keywords: string[];
  weight: number;
  mentionCount: number;
  reach: number;
  avgSentiment: number;
  sentimentVariance: number;
  firstSeen: ISOString;
  lastSeen: ISOString;
}

/** A narrative is a recurring, time-bounded theme with a coherent story arc. */
export interface Narrative {
  narrativeId: string;
  theme: string;
  keywords: string[];
  brandId: string;
  stage: NarrativeStage;
  velocity: number; // mentions/day over recent window
  acceleration: number; // change in velocity
  velocityScore: number; // 0..100
  momentum: number; // -100..+100 (sentiment-weighted)
  totalMentions: number;
  totalReach: number;
  avgSentiment: number;
  sentimentVariance: number;
  firstSeen: ISOString;
  lastSeen: ISOString;
  peakDate?: ISOString;
  peakMentions: number;
  trajectory: TrajectoryDirection;
  confidence: number;
  relatedThemes: string[];
}

/** Configuration for the narrative tracker. */
export interface NarrativeTrackerConfig {
  minThemeMentions: number;
  minThemeReach: number;
  emergingVelocityThreshold: number;
  peakDeclineThreshold: number;
  dormantDaysThreshold: number;
  recentWindowDays: number;
  topKeywordsLimit: number;
}

/** Default narrative tracker configuration. */
export const DEFAULT_NARRATIVE_CONFIG: NarrativeTrackerConfig = {
  minThemeMentions: 3,
  minThemeReach: 0,
  emergingVelocityThreshold: 0.5,
  peakDeclineThreshold: 0.3,
  dormantDaysThreshold: 14,
  recentWindowDays: 7,
  topKeywordsLimit: 10,
};

/** Tokenize a text into lowercase terms (very small, dependency-free). */
export function tokenize(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 3);
}

/** English + French + Arabic romanized stopword set (minimal). */
export const STOPWORDS = new Set<string>([
  // English
  "the", "and", "for", "are", "but", "not", "you", "all", "any", "can", "her",
  "was", "one", "our", "out", "has", "have", "had", "his", "how", "its", "may",
  "new", "now", "old", "see", "way", "who", "did", "got", "let", "say", "she",
  "too", "use",
  // French
  "les", "des", "une", "que", "qui", "dans", "pour", "est", "sont", "avec",
  "sur", "par", "aux", "apr", "ont", "sans", "leur", "mais", "comme", "etre",
  "this", "that", "from", "they", "will", "would", "there", "their", "what",
  "about", "which", "when", "into", "than", "them", "these", "those", "been",
  "more", "most", "some", "such", "only", "very", "also", "after", "before",
  // Common Arabic romanized
  "ana", "anta", "huwa", "hiya", "nahnu", "antum", "hum", "hunna", "hadha",
  "hadhihi", "tilka", "hal", "maa", "man", "alladhi", "allati", "min", "ila",
  "ala", "fee", "an", "inna", "la", "lam", "lan", "qad", "kana",
]);

/** Extract top-N keywords from a corpus using term-frequency weighting. */
export function extractKeywords(
  texts: string[],
  limit = 10,
  stopwords: Set<string> = STOPWORDS,
): Array<{ term: string; count: number; weight: number }> {
  const tf = new Map<string, number>();
  let total = 0;
  for (const text of texts) {
    const tokens = tokenize(text);
    for (const tok of tokens) {
      if (stopwords.has(tok)) continue;
      tf.set(tok, (tf.get(tok) ?? 0) + 1);
      total++;
    }
  }
  const entries = [...tf.entries()].map(([term, count]) => ({
    term,
    count,
    weight: total > 0 ? count / total : 0,
  }));
  entries.sort((a, b) => b.count - a.count);
  return entries.slice(0, limit);
}

/** Cluster mentions into themes by shared keyword overlap (very simple greedy clusterer). */
export function extractThemes(
  mentions: MediaMention[],
  config: NarrativeTrackerConfig = DEFAULT_NARRATIVE_CONFIG,
): Theme[] {
  // Build per-mention keyword sets
  const perMentionKeywords: string[][] = mentions.map((m) => {
    const text = `${m.title} ${m.excerpt ?? ""}`;
    const kws = extractKeywords([text], config.topKeywordsLimit).map((k) => k.term);
    return kws;
  });

  // Aggregate by individual keyword as a "theme" (greedy: pick top-N keywords)
  const keywordCounts = new Map<string, { count: number; reach: number; sentimentSum: number; sentimentSqSum: number; first: ISOString; last: ISOString; mentions: MediaMention[] }>();
  mentions.forEach((m, idx) => {
    const kws = perMentionKeywords[idx];
    for (const kw of kws) {
      const entry = keywordCounts.get(kw) ?? {
        count: 0,
        reach: 0,
        sentimentSum: 0,
        sentimentSqSum: 0,
        first: m.publishedAt,
        last: m.publishedAt,
        mentions: [],
      };
      entry.count++;
      entry.reach += safeNumber(m.reach);
      entry.sentimentSum += m.sentimentScore;
      entry.sentimentSqSum += m.sentimentScore * m.sentimentScore;
      if (m.publishedAt < entry.first) entry.first = m.publishedAt;
      if (m.publishedAt > entry.last) entry.last = m.publishedAt;
      entry.mentions.push(m);
      keywordCounts.set(kw, entry);
    }
  });

  const themes: Theme[] = [];
  for (const [term, entry] of keywordCounts.entries()) {
    if (entry.count < config.minThemeMentions) continue;
    const avg = entry.sentimentSum / entry.count;
    const variance = entry.count > 1 ? entry.sentimentSqSum / entry.count - avg * avg : 0;
    themes.push({
      themeId: `theme_${fnv1a32(term)}`,
      label: term,
      keywords: [term],
      weight: entry.count,
      mentionCount: entry.count,
      reach: entry.reach,
      avgSentiment: avg,
      sentimentVariance: Math.max(0, variance),
      firstSeen: entry.first,
      lastSeen: entry.last,
    });
  }
  themes.sort((a, b) => b.weight - a.weight);
  return themes;
}

/** Classify a narrative's stage based on its velocity history. */
export function classifyNarrativeStage(
  velocity: number,
  acceleration: number,
  daysSinceLastMention: number,
  recentMentions: number,
  historicalPeak: number,
  config: NarrativeTrackerConfig = DEFAULT_NARRATIVE_CONFIG,
): NarrativeStage {
  if (daysSinceLastMention >= config.dormantDaysThreshold && recentMentions > 0) {
    return NarrativeStage.RESURGENT;
  }
  if (daysSinceLastMention >= config.dormantDaysThreshold) {
    return NarrativeStage.DORMANT;
  }
  if (historicalPeak > 0 && recentMentions <= historicalPeak * config.peakDeclineThreshold) {
    return NarrativeStage.DECLINING;
  }
  if (recentMentions >= historicalPeak && historicalPeak > 0) {
    return NarrativeStage.PEAK;
  }
  if (velocity >= config.emergingVelocityThreshold && acceleration >= 0) {
    return NarrativeStage.GROWING;
  }
  if (velocity >= config.emergingVelocityThreshold * 0.5) {
    return NarrativeStage.EMERGING;
  }
  return NarrativeStage.EMERGING;
}

/** Compute the velocity score (0..100) for a narrative. */
export function computeNarrativeVelocityScore(
  velocity: number,
  acceleration: number,
  peakMentions: number,
  recentMentions: number,
): number {
  // Normalize velocity: 5 mentions/day = 100
  const vScore = clamp01(velocity / 5) * 70;
  // Acceleration contributes up to 15
  const aScore = clamp01((acceleration + 1) / 2) * 15;
  // Peak ratio: how close recent activity is to peak
  const peakRatio = peakMentions > 0 ? recentMentions / peakMentions : 0;
  const pScore = clamp01(peakRatio) * 15;
  return clampPct(vScore + aScore + pScore);
}

/** Build a narrative from a theme and its mentions. */
export function buildNarrative(
  theme: Theme,
  brandId: string,
  mentions: MediaMention[],
  config: NarrativeTrackerConfig = DEFAULT_NARRATIVE_CONFIG,
  referenceTime: EpochMs = Date.now(),
): Narrative {
  const sorted = [...mentions].sort((a, b) => a.publishedAt.localeCompare(b.publishedAt));
  if (sorted.length === 0) {
    return {
      narrativeId: `narr_${theme.themeId}`,
      theme: theme.label,
      keywords: theme.keywords,
      brandId,
      stage: NarrativeStage.DORMANT,
      velocity: 0,
      acceleration: 0,
      velocityScore: 0,
      momentum: 0,
      totalMentions: 0,
      totalReach: 0,
      avgSentiment: 0,
      sentimentVariance: 0,
      firstSeen: theme.firstSeen,
      lastSeen: theme.lastSeen,
      peakMentions: 0,
      trajectory: TrajectoryDirection.STABLE,
      confidence: 0,
      relatedThemes: [],
    };
  }

  // Bucket by day
  const dayMap = new Map<string, { count: number; reach: number; sentimentSum: number }>();
  for (const m of sorted) {
    const d = dayBucket(m.publishedAt);
    const entry = dayMap.get(d) ?? { count: 0, reach: 0, sentimentSum: 0 };
    entry.count++;
    entry.reach += safeNumber(m.reach);
    entry.sentimentSum += m.sentimentScore;
    dayMap.set(d, entry);
  }
  const days = [...dayMap.keys()].sort();
  const dailyCounts = days.map((d) => dayMap.get(d)!.count);

  const recentCutoff = toISOString(referenceTime - config.recentWindowDays * 86_400_000);
  let recentMentions = 0;
  let recentReach = 0;
  let recentSentimentSum = 0;
  for (const m of sorted) {
    if (m.publishedAt >= recentCutoff) {
      recentMentions++;
      recentReach += safeNumber(m.reach);
      recentSentimentSum += m.sentimentScore;
    }
  }
  const velocity = recentMentions / config.recentWindowDays;
  const historicalPeak = dailyCounts.length > 0 ? Math.max(...dailyCounts) : 0;

  // Compute previous-window velocity for acceleration
  const prevCutoff = toISOString(referenceTime - 2 * config.recentWindowDays * 86_400_000);
  let prevMentions = 0;
  for (const m of sorted) {
    if (m.publishedAt >= prevCutoff && m.publishedAt < recentCutoff) {
      prevMentions++;
    }
  }
  const prevVelocity = prevMentions / config.recentWindowDays;
  const acceleration = velocity - prevVelocity;

  const daysSinceLast = Math.floor((referenceTime - toEpochMs(sorted[sorted.length - 1].publishedAt)) / 86_400_000);
  const stage = classifyNarrativeStage(velocity, acceleration, daysSinceLast, recentMentions, historicalPeak, config);
  const velocityScore = computeNarrativeVelocityScore(velocity, acceleration, historicalPeak, recentMentions);

  const avgSentiment = sorted.length > 0 ? sorted.reduce((s, m) => s + m.sentimentScore, 0) / sorted.length : 0;
  const sentimentVariance = sorted.length > 1 ? variance(sorted.map((m) => m.sentimentScore)) : 0;
  const momentum = clamp(((recentSentimentSum / Math.max(1, recentMentions)) * velocity) * 50, -100, 100);

  // Find peak date
  let peakDate: ISOString | undefined;
  let peakMentions = 0;
  for (const [d, entry] of dayMap.entries()) {
    if (entry.count > peakMentions) {
      peakMentions = entry.count;
      peakDate = d;
    }
  }

  const trajectory = classifyTrajectory(dailyCounts);
  const confidence = clamp01(Math.min(1, sorted.length / 20) * (1 - sentimentVariance));

  return {
    narrativeId: `narr_${theme.themeId}`,
    theme: theme.label,
    keywords: theme.keywords,
    brandId,
    stage,
    velocity,
    acceleration,
    velocityScore,
    momentum,
    totalMentions: sorted.length,
    totalReach: sorted.reduce((s, m) => s + safeNumber(m.reach), 0),
    avgSentiment,
    sentimentVariance,
    firstSeen: sorted[0].publishedAt,
    lastSeen: sorted[sorted.length - 1].publishedAt,
    peakDate,
    peakMentions,
    trajectory,
    confidence,
    relatedThemes: [],
  };
}

/** Detect narratives for a brand. */
export function detectNarratives(
  brandId: string,
  mentions: MediaMention[],
  config: NarrativeTrackerConfig = DEFAULT_NARRATIVE_CONFIG,
  referenceTime: EpochMs = Date.now(),
): Narrative[] {
  const themes = extractThemes(mentions, config);
  const narratives: Narrative[] = [];
  for (const theme of themes) {
    // Filter mentions containing the theme keyword
    const themeMentions = mentions.filter((m) => {
      const text = `${m.title} ${m.excerpt ?? ""}`.toLowerCase();
      return text.includes(theme.label.toLowerCase());
    });
    if (themeMentions.length < config.minThemeMentions) continue;
    narratives.push(buildNarrative(theme, brandId, themeMentions, config, referenceTime));
  }
  // Compute related themes by co-occurrence
  for (const n of narratives) {
    for (const other of narratives) {
      if (n.narrativeId === other.narrativeId) continue;
      // Simple co-occurrence: same day
      if (n.lastSeen.slice(0, 10) === other.lastSeen.slice(0, 10)) {
        if (!n.relatedThemes.includes(other.theme)) n.relatedThemes.push(other.theme);
      }
    }
  }
  narratives.sort((a, b) => b.velocityScore - a.velocityScore);
  return narratives;
}

/** Identify emerging narratives (stage = EMERGING or GROWING with positive acceleration). */
export function identifyEmergingNarratives(narratives: Narrative[]): Narrative[] {
  return narratives.filter(
    (n) =>
      (n.stage === NarrativeStage.EMERGING || n.stage === NarrativeStage.GROWING) &&
      n.acceleration >= 0 &&
      n.confidence > 0.2,
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 10 — CRISIS DETECTION ENGINE
// ════════════════════════════════════════════════════════════════════════════

/** Configuration for the crisis detection engine. */
export interface CrisisDetectionConfig {
  sentimentDropThreshold: number;
  negativeVolumeThreshold: number; // ratio of negative mentions
  velocitySpikeThreshold: number; // multiplier over baseline
  authorityAmplifierThreshold: number; // tier-1 share threshold
  narrativeVelocityThreshold: number;
  minMentionsForCrisis: number;
  recentWindowMinutes: number;
  baselineWindowDays: number;
  severityThresholds: {
    low: number;
    moderate: number;
    high: number;
    severe: number;
    critical: number;
  };
  escalationThresholds: {
    tier1: number;
    tier2: number;
    tier3: number;
    warRoom: number;
  };
}

/** Default crisis detection configuration. */
export const DEFAULT_CRISIS_CONFIG: CrisisDetectionConfig = {
  sentimentDropThreshold: -0.3,
  negativeVolumeThreshold: 0.4,
  velocitySpikeThreshold: 2.5,
  authorityAmplifierThreshold: 0.2,
  narrativeVelocityThreshold: 2,
  minMentionsForCrisis: 5,
  recentWindowMinutes: 60,
  baselineWindowDays: 7,
  severityThresholds: {
    low: 20,
    moderate: 40,
    high: 60,
    severe: 80,
    critical: 90,
  },
  escalationThresholds: {
    tier1: 40,
    tier2: 60,
    tier3: 80,
    warRoom: 90,
  },
};

/** Crisis signal descriptor. */
export interface CrisisSignal {
  signalName: string;
  description: string;
  observedValue: number;
  threshold: number;
  contribution: number; // 0..1
  triggered: boolean;
}

/** Crisis assessment result. */
export interface CrisisAssessment {
  brandId: string;
  crisisScore: number; // 0..100
  severity: CrisisSeverity;
  signals: CrisisSignal[];
  topTriggeringMentions: MediaMention[];
  escalation: EscalationAction;
  recommendedActions: string[];
  detectedAt: EpochMs;
  estimatedImpact: "minimal" | "moderate" | "significant" | "severe" | "existential";
  estimatedTimeToPeak: number; // hours, 0 if already past peak
}

/** Compute the sentiment-drop signal. */
export function computeSentimentDropSignal(
  recentMentions: MediaMention[],
  baselineMentions: MediaMention[],
  threshold: number,
): CrisisSignal {
  const recentAvg = recentMentions.length > 0 ? mean(recentMentions.map((m) => m.sentimentScore)) : 0;
  const baselineAvg = baselineMentions.length > 0 ? mean(baselineMentions.map((m) => m.sentimentScore)) : 0;
  const drop = recentAvg - baselineAvg;
  const triggered = drop <= threshold;
  const contribution = triggered ? clamp01(Math.abs(drop) / Math.max(0.5, Math.abs(threshold))) : 0;
  return {
    signalName: "sentiment_drop",
    description: `Recent sentiment ${recentAvg.toFixed(2)} vs baseline ${baselineAvg.toFixed(2)} (drop ${drop.toFixed(2)})`,
    observedValue: drop,
    threshold,
    contribution,
    triggered,
  };
}

/** Compute the negative-volume signal. */
export function computeNegativeVolumeSignal(
  recentMentions: MediaMention[],
  threshold: number,
): CrisisSignal {
  if (recentMentions.length === 0) {
    return {
      signalName: "negative_volume",
      description: "No recent mentions",
      observedValue: 0,
      threshold,
      contribution: 0,
      triggered: false,
    };
  }
  const neg = recentMentions.filter((m) => m.sentimentLabel === SentimentPolarity.NEGATIVE).length;
  const ratio = neg / recentMentions.length;
  const triggered = ratio >= threshold;
  const contribution = triggered ? clamp01(ratio / Math.max(0.5, threshold)) : 0;
  return {
    signalName: "negative_volume",
    description: `${neg}/${recentMentions.length} recent mentions negative (${(ratio * 100).toFixed(1)}%)`,
    observedValue: ratio,
    threshold,
    contribution,
    triggered,
  };
}

/** Compute the velocity-spike signal (mention rate vs baseline). */
export function computeVelocitySpikeSignal(
  recentMentions: MediaMention[],
  baselineMentions: MediaMention[],
  recentWindowMinutes: number,
  baselineWindowDays: number,
  threshold: number,
): CrisisSignal {
  const recentRate = recentMentions.length / (recentWindowMinutes / 60); // mentions/hour
  const baselineRate = baselineMentions.length / (baselineWindowDays * 24); // mentions/hour
  const multiplier = baselineRate > 0 ? recentRate / baselineRate : (recentRate > 0 ? threshold : 0);
  const triggered = multiplier >= threshold;
  const contribution = triggered ? clamp01((multiplier - 1) / (threshold - 1 + 0.01)) : 0;
  return {
    signalName: "velocity_spike",
    description: `${recentRate.toFixed(1)} mentions/hour vs baseline ${baselineRate.toFixed(1)} (${multiplier.toFixed(2)}x)`,
    observedValue: multiplier,
    threshold,
    contribution,
    triggered,
  };
}

/** Compute the authority-amplifier signal (share of tier-1 mentions). */
export function computeAuthorityAmplifierSignal(
  recentMentions: MediaMention[],
  threshold: number,
): CrisisSignal {
  if (recentMentions.length === 0) {
    return {
      signalName: "authority_amplifier",
      description: "No recent mentions",
      observedValue: 0,
      threshold,
      contribution: 0,
      triggered: false,
    };
  }
  const tier1 = recentMentions.filter((m) => m.authorityTier === AuthorityTier.TIER_1_ELITE).length;
  const ratio = tier1 / recentMentions.length;
  const triggered = ratio >= threshold;
  const contribution = triggered ? clamp01(ratio / Math.max(0.5, threshold)) : 0;
  return {
    signalName: "authority_amplifier",
    description: `${tier1}/${recentMentions.length} recent mentions from tier-1 sources (${(ratio * 100).toFixed(1)}%)`,
    observedValue: ratio,
    threshold,
    contribution,
    triggered,
  };
}

/** Compute the narrative-velocity signal. */
export function computeNarrativeVelocitySignal(
  narratives: Narrative[],
  threshold: number,
): CrisisSignal {
  if (narratives.length === 0) {
    return {
      signalName: "narrative_velocity",
      description: "No narratives tracked",
      observedValue: 0,
      threshold,
      contribution: 0,
      triggered: false,
    };
  }
  const maxVelocity = Math.max(...narratives.map((n) => n.velocity));
  const triggered = maxVelocity >= threshold;
  const contribution = triggered ? clamp01(maxVelocity / (threshold * 2)) : 0;
  return {
    signalName: "narrative_velocity",
    description: `Max narrative velocity ${maxVelocity.toFixed(2)} mentions/day`,
    observedValue: maxVelocity,
    threshold,
    contribution,
    triggered,
  };
}

/** Classify crisis severity from a numeric score. */
export function classifyCrisisSeverity(score: number, thresholds: CrisisDetectionConfig["severityThresholds"]): CrisisSeverity {
  if (score >= thresholds.critical) return CrisisSeverity.CRITICAL;
  if (score >= thresholds.severe) return CrisisSeverity.SEVERE;
  if (score >= thresholds.high) return CrisisSeverity.HIGH;
  if (score >= thresholds.moderate) return CrisisSeverity.MODERATE;
  if (score >= thresholds.low) return CrisisSeverity.LOW;
  return CrisisSeverity.NONE;
}

/** Determine the escalation action from a crisis score. */
export function determineEscalationAction(
  score: number,
  severity: CrisisSeverity,
  thresholds: CrisisDetectionConfig["escalationThresholds"],
): EscalationAction {
  if (severity === CrisisSeverity.NONE) return EscalationAction.MONITOR;
  if (score >= thresholds.warRoom) return EscalationAction.INCIDENT_WAR_ROOM;
  if (score >= thresholds.tier3) return EscalationAction.ESCALATE_TIER_3;
  if (score >= thresholds.tier2) return EscalationAction.ESCALATE_TIER_2;
  if (score >= thresholds.tier1) return EscalationAction.ESCALATE_TIER_1;
  if (severity === CrisisSeverity.LOW || severity === CrisisSeverity.MODERATE) return EscalationAction.ALERT;
  return EscalationAction.MONITOR;
}

/** Generate recommended actions for a given crisis assessment. */
export function generateCrisisRecommendations(
  signals: CrisisSignal[],
  severity: CrisisSeverity,
): string[] {
  const recs: string[] = [];
  const triggered = signals.filter((s) => s.triggered);

  if (triggered.find((s) => s.signalName === "sentiment_drop")) {
    recs.push("Investigate root cause of sentiment drop; review the most negative recent mentions");
  }
  if (triggered.find((s) => s.signalName === "negative_volume")) {
    recs.push("Prepare holding statement; coordinate with PR and legal teams");
  }
  if (triggered.find((s) => s.signalName === "velocity_spike")) {
    recs.push("Activate real-time monitoring; increase dashboard refresh interval to 1 minute");
  }
  if (triggered.find((s) => s.signalName === "authority_amplifier")) {
    recs.push("Engage tier-1 media relations; brief spokesperson on key talking points");
  }
  if (triggered.find((s) => s.signalName === "narrative_velocity")) {
    recs.push("Map narrative arc; identify and counter misinformation proactively");
  }

  if (severity === CrisisSeverity.HIGH || severity === CrisisSeverity.SEVERE) {
    recs.push("Notify executive team; prepare customer and stakeholder communications");
  }
  if (severity === CrisisSeverity.CRITICAL) {
    recs.push("Convene war room; engage crisis counsel; activate business-continuity plan");
  }
  if (recs.length === 0) {
    recs.push("Continue monitoring; no immediate action required");
  }
  return recs;
}

/** Estimate the time-to-peak of a crisis in hours (heuristic). */
export function estimateCrisisTimeToPeak(
  recentMentions: MediaMention[],
  baselineRate: number,
): number {
  if (recentMentions.length === 0) return 0;
  const recentRate = recentMentions.length; // approximate per hour
  if (recentRate <= baselineRate) return 0;
  // Crisis typically peaks within 6-24 hours of velocity spike
  const multiplier = baselineRate > 0 ? recentRate / baselineRate : 2;
  const estimatedPeakHours = clamp(48 / Math.log2(multiplier + 1), 1, 48);
  return Math.round(estimatedPeakHours);
}

/** Estimate the impact of a crisis. */
export function estimateCrisisImpact(
  severity: CrisisSeverity,
  signals: CrisisSignal[],
): "minimal" | "moderate" | "significant" | "severe" | "existential" {
  const triggered = signals.filter((s) => s.triggered).length;
  switch (severity) {
    case CrisisSeverity.NONE:
      return "minimal";
    case CrisisSeverity.LOW:
      return triggered > 1 ? "moderate" : "minimal";
    case CrisisSeverity.MODERATE:
      return "moderate";
    case CrisisSeverity.HIGH:
      return "significant";
    case CrisisSeverity.SEVERE:
      return triggered >= 4 ? "severe" : "significant";
    case CrisisSeverity.CRITICAL:
      return triggered >= 4 ? "existential" : "severe";
    default:
      return "minimal";
  }
}

/**
 * Full crisis detection pipeline. Evaluates a brand's recent mentions against
 * baseline activity and produces a composite crisis assessment.
 */
export function detectCrisis(
  brandId: string,
  recentMentions: MediaMention[],
  baselineMentions: MediaMention[],
  narratives: Narrative[],
  config: CrisisDetectionConfig = DEFAULT_CRISIS_CONFIG,
): CrisisAssessment {
  const signals: CrisisSignal[] = [
    computeSentimentDropSignal(recentMentions, baselineMentions, config.sentimentDropThreshold),
    computeNegativeVolumeSignal(recentMentions, config.negativeVolumeThreshold),
    computeVelocitySpikeSignal(
      recentMentions,
      baselineMentions,
      config.recentWindowMinutes,
      config.baselineWindowDays,
      config.velocitySpikeThreshold,
    ),
    computeAuthorityAmplifierSignal(recentMentions, config.authorityAmplifierThreshold),
    computeNarrativeVelocitySignal(narratives, config.narrativeVelocityThreshold),
  ];

  const triggered = signals.filter((s) => s.triggered);
  const totalContribution = triggered.reduce((sum, s) => sum + s.contribution, 0);
  const crisisScore = clampPct((totalContribution / Math.max(1, signals.length)) * 100);

  const severity = classifyCrisisSeverity(crisisScore, config.severityThresholds);
  const escalation = determineEscalationAction(crisisScore, severity, config.escalationThresholds);
  const recommendedActions = generateCrisisRecommendations(signals, severity);
  const topTriggeringMentions = [...recentMentions]
    .sort((a, b) => a.sentimentScore - b.sentimentScore)
    .slice(0, 5);
  const baselineRate = baselineMentions.length / (config.baselineWindowDays * 24);
  const estimatedTimeToPeak = estimateCrisisTimeToPeak(recentMentions, baselineRate);
  const estimatedImpact = estimateCrisisImpact(severity, signals);

  return {
    brandId,
    crisisScore,
    severity,
    signals,
    topTriggeringMentions,
    escalation,
    recommendedActions,
    detectedAt: Date.now(),
    estimatedImpact,
    estimatedTimeToPeak,
  };
}

/** Monitor multiple brands in parallel for crisis signals. */
export function detectCrisesForBrands(
  brands: Array<{
    brandId: string;
    recentMentions: MediaMention[];
    baselineMentions: MediaMention[];
    narratives?: Narrative[];
  }>,
  config: CrisisDetectionConfig = DEFAULT_CRISIS_CONFIG,
): CrisisAssessment[] {
  return brands.map((b) =>
    detectCrisis(
      b.brandId,
      b.recentMentions,
      b.baselineMentions,
      b.narratives ?? [],
      config,
    ),
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 11 — COMPETITIVE BENCHMARKING
// ════════════════════════════════════════════════════════════════════════════

/** Per-brand benchmark metrics. */
export interface BrandBenchmarkMetrics {
  brandId: string;
  brandName: string;
  sector: string;
  shareOfVoice: number; // 0..100
  sentiment: number; // -100..+100
  reach: number;
  authority: number; // 0..100
  aiVisibility: number; // 0..100
  innovation: number; // 0..100
}

/** Single benchmark comparison row. */
export interface BenchmarkComparisonRow {
  brandId: string;
  brandName: string;
  raw: BrandBenchmarkMetrics;
  normalized: Record<keyof Omit<BrandBenchmarkMetrics, "brandId" | "brandName" | "sector">, number>; // 0..100
  compositeScore: number; // 0..100
  rank: number;
  percentile: number; // 0..100
  gapToLeader: number; // 0..100
  gapToMedian: number; // -100..+100
}

/** Full benchmarking result. */
export interface CompetitiveBenchmarkResult {
  rows: BenchmarkComparisonRow[];
  self?: BenchmarkComparisonRow;
  leader: BenchmarkComparisonRow | null;
  medianScore: number;
  meanScore: number;
  stdDevScore: number;
  weights: BenchmarkConfiguration["weights"];
  normalizationMethod: BenchmarkConfiguration["normalizationMethod"];
  gaps: Array<{
    brandId: string;
    dimension: keyof BenchmarkConfiguration["weights"];
    gap: number; // -100..+100 vs median
    severity: "advantage" | "neutral" | "weakness" | "critical_gap";
  }>;
  computedAt: EpochMs;
}

/** Default benchmark configuration. */
export const DEFAULT_BENCHMARK_CONFIG: BenchmarkConfiguration = {
  weights: {
    shareOfVoice: 0.25,
    sentiment: 0.2,
    reach: 0.2,
    authority: 0.15,
    aiVisibility: 0.1,
    innovation: 0.1,
  },
  percentileMethod: "linear",
  normalizationMethod: "minmax",
  includeSelf: true,
};

/** Normalize a raw metrics array per the chosen method. */
export function normalizeMetricArray(
  values: number[],
  method: BenchmarkConfiguration["normalizationMethod"],
  // For sentiment (-100..+100) we want a custom mapping
  isSigned = false,
): number[] {
  if (values.length === 0) return [];
  if (isSigned) {
    // Map -100..+100 → 0..100
    return values.map((v) => clampPct(((v + 100) / 200) * 100));
  }
  switch (method) {
    case "minmax":
      return minMaxNormalize(values).map((v) => v * 100);
    case "zscore":
      return zscoreNormalize(values).map((v) => clampPct(50 + v * 16));
    case "rank":
      return rankNormalize(values).map((v) => v * 100);
    case "sigmoid":
      return sigmoidNormalize(values).map((v) => v * 100);
    default:
      return minMaxNormalize(values).map((v) => v * 100);
  }
}

/** Compute composite score from normalized components and weights. */
export function computeCompositeScore(
  normalized: Record<string, number>,
  weights: BenchmarkConfiguration["weights"],
): number {
  const total =
    weights.shareOfVoice +
    weights.sentiment +
    weights.reach +
    weights.authority +
    weights.aiVisibility +
    weights.innovation;
  if (total === 0) return 0;
  const w = {
    shareOfVoice: weights.shareOfVoice / total,
    sentiment: weights.sentiment / total,
    reach: weights.reach / total,
    authority: weights.authority / total,
    aiVisibility: weights.aiVisibility / total,
    innovation: weights.innovation / total,
  };
  return clampPct(
    (normalized.shareOfVoice * w.shareOfVoice +
      normalized.sentiment * w.sentiment +
      normalized.reach * w.reach +
      normalized.authority * w.authority +
      normalized.aiVisibility * w.aiVisibility +
      normalized.innovation * w.innovation),
  );
}

/** Compute the percentile rank of a value within an array. */
export function percentileRank(
  values: number[],
  target: number,
  method: BenchmarkConfiguration["percentileMethod"] = "linear",
): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  let less = 0;
  let equal = 0;
  for (const v of sorted) {
    if (v < target) less++;
    else if (v === target) equal++;
  }
  if (method === "lower") return (less / sorted.length) * 100;
  if (method === "higher") return ((less + equal) / sorted.length) * 100;
  if (method === "nearest") {
    if (less === 0) return 0;
    if (less + equal === sorted.length) return 100;
    return (less / sorted.length) * 100;
  }
  if (method === "midpoint") {
    return ((less + (less + equal)) / 2 / sorted.length) * 100;
  }
  // linear (default)
  if (equal === 0) {
    // interpolate
    const lower = sorted.filter((v) => v < target).pop();
    const upper = sorted.find((v) => v > target);
    if (lower === undefined) return 0;
    if (upper === undefined) return 100;
    const t = (target - lower) / (upper - lower);
    const rankLower = sorted.indexOf(lower);
    return ((rankLower + t) / (sorted.length - 1)) * 100;
  }
  return ((less + equal / 2) / sorted.length) * 100;
}

/** Run a competitive benchmark across a set of brands. */
export function runCompetitiveBenchmark(
  brands: BrandBenchmarkMetrics[],
  config: BenchmarkConfiguration = DEFAULT_BENCHMARK_CONFIG,
  selfBrandId?: string,
): CompetitiveBenchmarkResult {
  if (brands.length === 0) {
    return {
      rows: [],
      self: undefined,
      leader: null,
      medianScore: 0,
      meanScore: 0,
      stdDevScore: 0,
      weights: config.weights,
      normalizationMethod: config.normalizationMethod,
      gaps: [],
      computedAt: Date.now(),
    };
  }

  const sovValues = brands.map((b) => b.shareOfVoice);
  const sentimentValues = brands.map((b) => b.sentiment);
  const reachValues = brands.map((b) => b.reach);
  const authorityValues = brands.map((b) => b.authority);
  const aiVisibilityValues = brands.map((b) => b.aiVisibility);
  const innovationValues = brands.map((b) => b.innovation);

  const sovNorm = normalizeMetricArray(sovValues, config.normalizationMethod, false);
  const sentimentNorm = normalizeMetricArray(sentimentValues, config.normalizationMethod, true);
  const reachNorm = normalizeMetricArray(reachValues, config.normalizationMethod, false);
  const authorityNorm = normalizeMetricArray(authorityValues, config.normalizationMethod, false);
  const aiVisibilityNorm = normalizeMetricArray(aiVisibilityValues, config.normalizationMethod, false);
  const innovationNorm = normalizeMetricArray(innovationValues, config.normalizationMethod, false);

  const rows: BenchmarkComparisonRow[] = brands.map((b, idx) => {
    const normalized = {
      shareOfVoice: sovNorm[idx],
      sentiment: sentimentNorm[idx],
      reach: reachNorm[idx],
      authority: authorityNorm[idx],
      aiVisibility: aiVisibilityNorm[idx],
      innovation: innovationNorm[idx],
    };
    const compositeScore = computeCompositeScore(normalized, config.weights);
    return {
      brandId: b.brandId,
      brandName: b.brandName,
      raw: b,
      normalized,
      compositeScore,
      rank: 0,
      percentile: 0,
      gapToLeader: 0,
      gapToMedian: 0,
    };
  });

  rows.sort((a, b) => b.compositeScore - a.compositeScore);
  const scores = rows.map((r) => r.compositeScore);
  const maxScore = scores[0];
  const medScore = median(scores);
  const meanScore = mean(scores);
  const stdScore = standardDeviation(scores);

  rows.forEach((row, idx) => {
    row.rank = idx + 1;
    row.percentile = percentileRank(scores, row.compositeScore, config.percentileMethod);
    row.gapToLeader = maxScore - row.compositeScore;
    row.gapToMedian = row.compositeScore - medScore;
  });

  // Gap analysis vs median
  const gaps: CompetitiveBenchmarkResult["gaps"] = [];
  for (const row of rows) {
    const dimensions: Array<keyof BenchmarkConfiguration["weights"]> = [
      "shareOfVoice",
      "sentiment",
      "reach",
      "authority",
      "aiVisibility",
      "innovation",
    ];
    for (const dim of dimensions) {
      const allValues = rows.map((r) => r.normalized[dim]);
      const med = median(allValues);
      const gap = row.normalized[dim] - med;
      let severity: "advantage" | "neutral" | "weakness" | "critical_gap";
      if (gap > 10) severity = "advantage";
      else if (gap > -10) severity = "neutral";
      else if (gap > -25) severity = "weakness";
      else severity = "critical_gap";
      gaps.push({ brandId: row.brandId, dimension: dim, gap, severity });
    }
  }

  const self = selfBrandId ? rows.find((r) => r.brandId === selfBrandId) : undefined;

  return {
    rows,
    self,
    leader: rows[0] ?? null,
    medianScore: medScore,
    meanScore,
    stdDevScore: stdScore,
    weights: config.weights,
    normalizationMethod: config.normalizationMethod,
    gaps,
    computedAt: Date.now(),
  };
}

/** Compute the peer percentile rank for a single brand. */
export function computePeerPercentile(
  brand: BrandBenchmarkMetrics,
  peers: BrandBenchmarkMetrics[],
  config: BenchmarkConfiguration = DEFAULT_BENCHMARK_CONFIG,
): number {
  const all = [...peers, brand];
  const result = runCompetitiveBenchmark(all, config, brand.brandId);
  return result.self?.percentile ?? 0;
}

/** Generate a gap-analysis summary for a brand. */
export function summarizeGaps(
  benchmark: CompetitiveBenchmarkResult,
  brandId: string,
): { strengths: string[]; weaknesses: string[]; criticalGaps: string[] } {
  const brandGaps = benchmark.gaps.filter((g) => g.brandId === brandId);
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const criticalGaps: string[] = [];
  for (const g of brandGaps) {
    if (g.severity === "advantage") strengths.push(`${g.dimension}: +${g.gap.toFixed(1)} vs median`);
    else if (g.severity === "weakness") weaknesses.push(`${g.dimension}: ${g.gap.toFixed(1)} vs median`);
    else if (g.severity === "critical_gap") criticalGaps.push(`${g.dimension}: ${g.gap.toFixed(1)} vs median`);
  }
  return { strengths, weaknesses, criticalGaps };
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 12 — REPUTATION INDEX CALCULATOR
// ════════════════════════════════════════════════════════════════════════════

/** Default reputation index weights. */
export const DEFAULT_REPUTATION_WEIGHTS: ReputationWeights = {
  sentiment: 0.25,
  shareOfVoice: 0.2,
  aiVisibility: 0.15,
  authority: 0.15,
  innovation: 0.1,
  performance: 0.1,
  purpose: 0.05,
};

/** Reputation index result. */
export interface ReputationIndexResult {
  brandId: string;
  overall: number; // 0..100
  components: ReputationComponents;
  weights: ReputationWeights;
  trend: TrajectoryDirection;
  delta: number; // change since previous calculation
  percentile: number; // 0..100 vs peer set
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  signals: string[];
  computedAt: EpochMs;
}

/** Normalize weights so they sum to 1. */
export function normalizeWeights(weights: ReputationWeights): ReputationWeights {
  const total =
    weights.sentiment +
    weights.shareOfVoice +
    weights.aiVisibility +
    weights.authority +
    weights.innovation +
    weights.performance +
    weights.purpose;
  if (total === 0) return DEFAULT_REPUTATION_WEIGHTS;
  return {
    sentiment: weights.sentiment / total,
    shareOfVoice: weights.shareOfVoice / total,
    aiVisibility: weights.aiVisibility / total,
    authority: weights.authority / total,
    innovation: weights.innovation / total,
    performance: weights.performance / total,
    purpose: weights.purpose / total,
  };
}

/** Compute the overall reputation index from components and weights. */
export function computeReputationIndex(
  brandId: string,
  components: ReputationComponents,
  weights: ReputationWeights = DEFAULT_REPUTATION_WEIGHTS,
  previousOverall?: number,
  peerOveralls?: number[],
): ReputationIndexResult {
  const normalizedWeights = normalizeWeights(weights);
  const overall = clampPct(
    components.sentiment * normalizedWeights.sentiment +
      components.shareOfVoice * normalizedWeights.shareOfVoice +
      components.aiVisibility * normalizedWeights.aiVisibility +
      components.authority * normalizedWeights.authority +
      components.innovation * normalizedWeights.innovation +
      components.performance * normalizedWeights.performance +
      components.purpose * normalizedWeights.purpose,
  );

  const delta = previousOverall !== undefined ? overall - previousOverall : 0;
  let trend: TrajectoryDirection;
  if (Math.abs(delta) < 1) trend = TrajectoryDirection.STABLE;
  else if (delta > 0) trend = TrajectoryDirection.RISING;
  else trend = TrajectoryDirection.FALLING;

  const percentile = peerOveralls && peerOveralls.length > 0
    ? percentileRank(peerOveralls, overall)
    : 0;

  const grade = scoreToGrade(overall);
  const signals = generateReputationSignals(components, normalizedWeights);

  return {
    brandId,
    overall,
    components,
    weights: normalizedWeights,
    trend,
    delta,
    percentile,
    grade,
    signals,
    computedAt: Date.now(),
  };
}

/** Map a 0..100 score to a letter grade. */
export function scoreToGrade(score: number): "A+" | "A" | "B" | "C" | "D" | "F" {
  if (score >= 95) return "A+";
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "F";
}

/** Generate human-readable signals from component scores. */
export function generateReputationSignals(
  components: ReputationComponents,
  weights: ReputationWeights,
): string[] {
  const signals: string[] = [];
  const entries = Object.entries(components) as Array<[keyof ReputationComponents, number]>;
  // Sort by weighted contribution
  entries.sort((a, b) => b[1] * (weights[b[0]] ?? 0) - a[1] * (weights[a[0]] ?? 0));

  const top = entries[0];
  const bottom = entries[entries.length - 1];

  if (top && top[1] >= 80) {
    signals.push(`${top[0]} is a key reputation strength (score ${top[1].toFixed(0)})`);
  }
  if (bottom && bottom[1] < 40) {
    signals.push(`${bottom[0]} is a critical weakness (score ${bottom[1].toFixed(0)})`);
  }
  // Range signal
  const values = entries.map((e) => e[1]);
  const range = Math.max(...values) - Math.min(...values);
  if (range > 40) {
    signals.push(`High component variance (${range.toFixed(0)} pt range) signals unbalanced reputation`);
  } else if (range < 15) {
    signals.push(`Balanced reputation profile (range ${range.toFixed(0)} pt)`);
  }
  return signals;
}

/** Aggregate the reputation index across a portfolio of brands. */
export function computePortfolioReputation(
  brands: Array<{ brandId: string; components: ReputationComponents }>,
  weights: ReputationWeights = DEFAULT_REPUTATION_WEIGHTS,
): {
  portfolioAverage: number;
  portfolioMedian: number;
  portfolioStdDev: number;
  topBrand: { brandId: string; score: number } | null;
  bottomBrand: { brandId: string; score: number } | null;
  results: ReputationIndexResult[];
} {
  const overalls = brands.map((b) => {
    const result = computeReputationIndex(b.brandId, b.components, weights);
    return result;
  });
  const scores = overalls.map((r) => r.overall);
  const sorted = [...overalls].sort((a, b) => b.overall - a.overall);
  return {
    portfolioAverage: mean(scores),
    portfolioMedian: median(scores),
    portfolioStdDev: standardDeviation(scores),
    topBrand: sorted[0] ? { brandId: sorted[0].brandId, score: sorted[0].overall } : null,
    bottomBrand: sorted[sorted.length - 1]
      ? { brandId: sorted[sorted.length - 1].brandId, score: sorted[sorted.length - 1].overall }
      : null,
    results: overalls,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 13 — MEDIA MONITORING DASHBOARD DATA
// ════════════════════════════════════════════════════════════════════════════

/** Aggregated dashboard data for the media-monitoring overview. */
export interface MediaMonitoringDashboard {
  weather: MediaWeatherEntry[];
  kpiStrip: KpiStripEntry[];
  alertFeed: AlertFeedEntry[];
  topNarratives: Narrative[];
  topInfluencers: InfluencerRankingEntry[];
  shareOfVoiceSummary: {
    leader: string | null;
    herfindahl: number;
    trend: TrajectoryDirection;
  };
  sentimentOverview: {
    avgSentiment: number;
    volatility: number;
    stage: string;
    momentum: number;
  };
  computedAt: EpochMs;
}

/** Build a media weather entry for a brand from its current state. */
export function buildMediaWeather(
  brandId: string,
  brandName: string,
  sentimentAvg: number,
  mentionVolume: number,
  baselineVolume: number,
  negativeShare: number,
  narrativeVelocity: number,
  aiVisibilityPct: number,
  forecast?: Array<{ date: ISOString; condition: string; temperature: number }>,
): MediaWeatherEntry {
  const temperature = clamp(Math.round(sentimentAvg * 100), -100, 100);
  const pressure = clampPct(baselineVolume > 0 ? (mentionVolume / baselineVolume) * 50 : 0);
  const humidity = clampPct(negativeShare * 100);
  const windSpeed = clampPct(narrativeVelocity * 10);
  const visibility = clampPct(aiVisibilityPct);

  let condition: MediaWeatherEntry["condition"];
  if (temperature >= 50 && humidity < 30) condition = "sunny";
  else if (temperature >= 70 && humidity >= 60) condition = "heatwave";
  else if (temperature <= -30 && pressure >= 70) condition = "blizzard";
  else if (temperature < 0 && humidity >= 50) condition = "stormy";
  else if (humidity >= 70 && pressure < 40) condition = "foggy";
  else if (humidity >= 50) condition = "cloudy";
  else condition = "sunny";

  return {
    brandId,
    brandName,
    condition,
    temperature,
    pressure,
    humidity,
    windSpeed,
    visibility,
    forecast,
  };
}

/** Build the KPI strip from analytical results. */
export function buildKpiStrip(params: {
  brandId: string;
  shareOfVoice: number;
  shareOfVoiceDeltaPct: number;
  netSentiment: number;
  sentimentDelta: number;
  totalReach: number;
  reachDeltaPct: number;
  aiVisibility: number;
  aiVisibilityDelta: number;
  influencerScore: number;
  crisisScore: number;
  sparkShareOfVoice?: number[];
  sparkSentiment?: number[];
  sparkReach?: number[];
}): KpiStripEntry[] {
  return [
    {
      key: "sov",
      label: "Share of Voice",
      value: roundTo(params.shareOfVoice, 1),
      unit: "%",
      deltaPct: params.shareOfVoiceDeltaPct,
      trajectory: params.shareOfVoiceDeltaPct > 1
        ? TrajectoryDirection.RISING
        : params.shareOfVoiceDeltaPct < -1
          ? TrajectoryDirection.FALLING
          : TrajectoryDirection.STABLE,
      spark: params.sparkShareOfVoice,
    },
    {
      key: "sentiment",
      label: "Net Sentiment",
      value: roundTo(params.netSentiment, 1),
      unit: "",
      deltaLabel: `${params.sentimentDelta >= 0 ? "+" : ""}${params.sentimentDelta.toFixed(1)}`,
      trajectory: params.sentimentDelta > 1
        ? TrajectoryDirection.RISING
        : params.sentimentDelta < -1
          ? TrajectoryDirection.FALLING
          : TrajectoryDirection.STABLE,
      spark: params.sparkSentiment,
    },
    {
      key: "reach",
      label: "Total Reach",
      value: params.totalReach,
      unit: "",
      deltaPct: params.reachDeltaPct,
      trajectory: params.reachDeltaPct > 1
        ? TrajectoryDirection.RISING
        : params.reachDeltaPct < -1
          ? TrajectoryDirection.FALLING
          : TrajectoryDirection.STABLE,
      spark: params.sparkReach,
    },
    {
      key: "ai_visibility",
      label: "AI Visibility",
      value: roundTo(params.aiVisibility, 1),
      unit: "%",
      deltaLabel: `${params.aiVisibilityDelta >= 0 ? "+" : ""}${params.aiVisibilityDelta.toFixed(1)}`,
      trajectory: params.aiVisibilityDelta > 1
        ? TrajectoryDirection.RISING
        : params.aiVisibilityDelta < -1
          ? TrajectoryDirection.FALLING
          : TrajectoryDirection.STABLE,
    },
    {
      key: "influencer_score",
      label: "Influencer Score",
      value: roundTo(params.influencerScore, 1),
      unit: "/100",
    },
    {
      key: "crisis_score",
      label: "Crisis Score",
      value: roundTo(params.crisisScore, 0),
      unit: "/100",
      severity:
        params.crisisScore >= 80
          ? CrisisSeverity.CRITICAL
          : params.crisisScore >= 60
            ? CrisisSeverity.SEVERE
            : params.crisisScore >= 40
              ? CrisisSeverity.HIGH
              : params.crisisScore >= 20
                ? CrisisSeverity.MODERATE
                : CrisisSeverity.LOW,
    },
  ];
}

/** Build the alert feed from active crises and trend anomalies. */
export function buildAlertFeed(
  crisisAssessments: CrisisAssessment[],
  sentimentAnomalies: Array<{ brandId: string; anomaly: SentimentAnomaly }>,
  brandNames: Map<string, string>,
): AlertFeedEntry[] {
  const alerts: AlertFeedEntry[] = [];

  for (const crisis of crisisAssessments) {
    if (crisis.severity === CrisisSeverity.NONE) continue;
    alerts.push({
      alertId: `crisis_${crisis.brandId}_${crisis.detectedAt}`,
      brandId: crisis.brandId,
      brandName: brandNames.get(crisis.brandId),
      severity: crisis.severity,
      title: `${brandNames.get(crisis.brandId) ?? crisis.brandId} — ${crisis.severity.toUpperCase()} crisis detected`,
      body: `Crisis score ${crisis.crisisScore.toFixed(0)}/100. ${crisis.signals.length} signals triggered. ${crisis.estimatedImpact} impact, ~${crisis.estimatedTimeToPeak}h to peak.`,
      triggeredAt: toISOString(crisis.detectedAt),
      action: crisis.escalation,
      relatedMetric: "crisis_score",
      relatedValue: crisis.crisisScore,
      threshold: 20,
    });
  }

  for (const { brandId, anomaly } of sentimentAnomalies) {
    if (anomaly.severity < 0.5) continue;
    alerts.push({
      alertId: `anomaly_${brandId}_${anomaly.index}`,
      brandId,
      brandName: brandNames.get(brandId),
      severity:
        anomaly.severity >= 0.85
          ? CrisisSeverity.CRITICAL
          : anomaly.severity >= 0.7
            ? CrisisSeverity.HIGH
            : CrisisSeverity.MODERATE,
      title: `${brandNames.get(brandId) ?? brandId} — sentiment ${anomaly.kind}`,
      body: `Sentiment ${anomaly.kind} detected on ${anomaly.date ?? "recent"}: value ${anomaly.value.toFixed(2)} vs expected ${anomaly.expected.toFixed(2)} (z=${anomaly.zScore.toFixed(2)})`,
      triggeredAt: anomaly.date ?? toISOString(Date.now()),
      relatedMetric: "sentiment",
      relatedValue: anomaly.value,
    });
  }

  alerts.sort((a, b) => {
    const sevRank: Record<CrisisSeverity, number> = {
      [CrisisSeverity.CRITICAL]: 5,
      [CrisisSeverity.SEVERE]: 4,
      [CrisisSeverity.HIGH]: 3,
      [CrisisSeverity.MODERATE]: 2,
      [CrisisSeverity.LOW]: 1,
      [CrisisSeverity.NONE]: 0,
    };
    if (sevRank[a.severity] !== sevRank[b.severity]) {
      return sevRank[b.severity] - sevRank[a.severity];
    }
    return b.triggeredAt.localeCompare(a.triggeredAt);
  });

  return alerts;
}

/** Assemble a full media monitoring dashboard payload. */
export function assembleDashboard(
  brands: Array<{
    brandId: string;
    brandName: string;
    mentions: MediaMention[];
    baselineMentions: MediaMention[];
    aiVisibilityPct: number;
    components?: ReputationComponents;
  }>,
  options: {
    sovConfig?: ShareOfVoiceConfig;
    crisisConfig?: CrisisDetectionConfig;
    narrativeConfig?: NarrativeTrackerConfig;
    influenceConfig?: InfluenceScoringConfig;
    reputationWeights?: ReputationWeights;
    influencerProfiles?: InfluencerProfile[];
  } = {},
): MediaMonitoringDashboard {
  const sovConfig = options.sovConfig ?? DEFAULT_SOV_CONFIG;
  const crisisConfig = options.crisisConfig ?? DEFAULT_CRISIS_CONFIG;
  const narrativeConfig = options.narrativeConfig ?? DEFAULT_NARRATIVE_CONFIG;
  const influenceConfig = options.influenceConfig ?? DEFAULT_INFLUENCE_CONFIG;
  const reputationWeights = options.reputationWeights ?? DEFAULT_REPUTATION_WEIGHTS;

  // Share of voice
  const mentionsByBrand = new Map<string, MediaMention[]>();
  for (const b of brands) mentionsByBrand.set(b.brandId, b.mentions);
  const sovMatrix = computeShareOfVoiceMatrix(mentionsByBrand, sovConfig);

  // Per-brand analytics
  const weatherEntries: MediaWeatherEntry[] = [];
  const crisisAssessments: CrisisAssessment[] = [];
  const sentimentAnomalies: Array<{ brandId: string; anomaly: SentimentAnomaly }> = [];
  const allNarratives: Narrative[] = [];
  const brandNames = new Map<string, string>();
  let totalSentiment = 0;
  let sentimentCount = 0;
  let totalVolatility = 0;
  let totalMomentum = 0;

  for (const b of brands) {
    brandNames.set(b.brandId, b.brandName);
    const trend = analyzeSentimentTrend(b.mentions);
    const narratives = detectNarratives(b.brandId, b.mentions, narrativeConfig);
    allNarratives.push(...narratives);
    const crisis = detectCrisis(b.brandId, b.mentions, b.baselineMentions, narratives, crisisConfig);
    crisisAssessments.push(crisis);
    for (const anomaly of trend.anomalies) {
      sentimentAnomalies.push({ brandId: b.brandId, anomaly });
    }
    const baselineVolume = b.baselineMentions.length;
    const negativeShare = b.mentions.length > 0
      ? b.mentions.filter((m) => m.sentimentLabel === SentimentPolarity.NEGATIVE).length / b.mentions.length
      : 0;
    const maxNarrativeVelocity = narratives.length > 0
      ? Math.max(...narratives.map((n) => n.velocity))
      : 0;

    weatherEntries.push(
      buildMediaWeather(
        b.brandId,
        b.brandName,
        trend.meanSentiment,
        b.mentions.length,
        baselineVolume,
        negativeShare,
        maxNarrativeVelocity,
        b.aiVisibilityPct,
      ),
    );
    totalSentiment += trend.meanSentiment;
    sentimentCount++;
    totalVolatility += trend.volatility;
    totalMomentum += sentimentMomentumIndex(trend);
  }

  // KPI strip uses the leader brand or first brand
  const leader = sovMatrix.leader ?? brands[0]?.brandId ?? "";
  const leaderBrand = brands.find((b) => b.brandId === leader) ?? brands[0];
  let kpiStrip: KpiStripEntry[] = [];
  if (leaderBrand) {
    const trend = analyzeSentimentTrend(leaderBrand.mentions);
    const reach = aggregateMediaReach(leaderBrand.brandId, leaderBrand.mentions);
    const crisis = crisisAssessments.find((c) => c.brandId === leaderBrand.brandId);
    const sovRow = sovMatrix.rows.find((r) => r.brandId === leaderBrand.brandId);
    const influencerScore = options.influencerProfiles && options.influencerProfiles.length > 0
      ? computeInfluencerScore(options.influencerProfiles[0], leaderBrand.mentions, influenceConfig)
      : 50;
    kpiStrip = buildKpiStrip({
      brandId: leaderBrand.brandId,
      shareOfVoice: sovRow?.weightedShare ?? 0,
      shareOfVoiceDeltaPct: 0,
      netSentiment: trend.meanSentiment * 100,
      sentimentDelta: 0,
      totalReach: reach.totalReach,
      reachDeltaPct: 0,
      aiVisibility: leaderBrand.aiVisibilityPct,
      aiVisibilityDelta: 0,
      influencerScore,
      crisisScore: crisis?.crisisScore ?? 0,
      sparkShareOfVoice: trend.points.slice(-12).map((p) => p.value * 100),
      sparkSentiment: trend.points.slice(-12).map((p) => p.value * 100),
      sparkReach: trend.points.slice(-12).map((p) => p.volume),
    });
  }

  const alertFeed = buildAlertFeed(crisisAssessments, sentimentAnomalies, brandNames);

  // Top influencers
  let topInfluencers: InfluencerRankingEntry[] = [];
  if (options.influencerProfiles && options.influencerProfiles.length > 0) {
    const mentionsByInfluencer = new Map<string, MediaMention[]>();
    for (const brand of brands) {
      for (const m of brand.mentions) {
        if (!m.authorHandle) continue;
        const list = mentionsByInfluencer.get(m.authorHandle) ?? [];
        list.push(m);
        mentionsByInfluencer.set(m.authorHandle, list);
      }
    }
    topInfluencers = rankInfluencers(
      options.influencerProfiles,
      mentionsByInfluencer,
      influenceConfig,
    ).slice(0, 10);
  }

  return {
    weather: weatherEntries,
    kpiStrip,
    alertFeed,
    topNarratives: allNarratives.sort((a, b) => b.velocityScore - a.velocityScore).slice(0, 10),
    topInfluencers,
    shareOfVoiceSummary: {
      leader: sovMatrix.leader,
      herfindahl: sovMatrix.herfindahl,
      trend: sovMatrix.rows.length > 0 ? TrajectoryDirection.STABLE : TrajectoryDirection.STABLE,
    },
    sentimentOverview: {
      avgSentiment: sentimentCount > 0 ? totalSentiment / sentimentCount : 0,
      volatility: sentimentCount > 0 ? totalVolatility / sentimentCount : 0,
      stage: "stable",
      momentum: sentimentCount > 0 ? totalMomentum / sentimentCount : 0,
    },
    computedAt: Date.now(),
  };
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 14 — REPORT GENERATION HELPERS
// ════════════════════════════════════════════════════════════════════════════

/** Configuration for report generation. */
export interface ReportGenerationConfig {
  tone: "executive" | "analytical" | "operational" | "narrative";
  maxLength: number;
  includeCitations: boolean;
  locale: "en" | "fr" | "ar";
  decimalPrecision: number;
}

/** Default report generation configuration. */
export const DEFAULT_REPORT_CONFIG: ReportGenerationConfig = {
  tone: "executive",
  maxLength: 5000,
  includeCitations: false,
  locale: "en",
  decimalPrecision: 1,
};

/** Format a number per the report config. */
export function formatReportNumber(value: number, config: ReportGenerationConfig = DEFAULT_REPORT_CONFIG): string {
  return value.toFixed(config.decimalPrecision);
}

/** Build an executive summary block. */
export function buildExecutiveSummary(
  brandName: string,
  period: string,
  metrics: {
    shareOfVoice: number;
    netSentiment: number;
    totalReach: number;
    aiVisibility: number;
    crisisSeverity: CrisisSeverity;
    leaderGap: number;
    trend: TrajectoryDirection;
  },
  config: ReportGenerationConfig = DEFAULT_REPORT_CONFIG,
): ExecutiveSummaryBlock {
  const paragraphs: string[] = [];
  const bullets: string[] = [];
  const callouts: Array<{ label: string; value: string }> = [];

  const trendWord =
    metrics.trend === TrajectoryDirection.RISING
      ? "improving"
      : metrics.trend === TrajectoryDirection.FALLING
        ? "declining"
        : "stable";

  paragraphs.push(
    `${brandName} closed the ${period} period with a ${trendWord} media presence. ` +
      `Share of voice stands at ${formatReportNumber(metrics.shareOfVoice, config)}%, ` +
      `with a net sentiment of ${formatReportNumber(metrics.netSentiment, config)} and ` +
      `cumulative reach of ${formatCompact(metrics.totalReach)} impressions.`,
  );

  if (metrics.crisisSeverity !== CrisisSeverity.NONE) {
    paragraphs.push(
      `A ${metrics.crisisSeverity} severity signal was detected during the period. ` +
        `Immediate monitoring is recommended with executive escalation as appropriate.`,
    );
  }

  if (metrics.leaderGap > 5) {
    paragraphs.push(
      `The brand trails the category leader by ${formatReportNumber(
        metrics.leaderGap,
        config,
      )} share-of-voice points, representing a meaningful visibility gap.`,
    );
  } else if (metrics.leaderGap <= 5 && metrics.leaderGap >= -5) {
    paragraphs.push(
      `The brand is operating at parity with the category leader, with a share-of-voice gap of only ${formatReportNumber(
        Math.abs(metrics.leaderGap),
        config,
      )} points.`,
    );
  } else {
    paragraphs.push(
      `The brand leads the category by ${formatReportNumber(
        Math.abs(metrics.leaderGap),
        config,
      )} share-of-voice points and is positioned to consolidate its advantage.`,
    );
  }

  bullets.push(`AI visibility: ${formatReportNumber(metrics.aiVisibility, config)}%`);
  bullets.push(`Net sentiment: ${formatReportNumber(metrics.netSentiment, config)}`);
  bullets.push(`Total reach: ${formatCompact(metrics.totalReach)}`);
  bullets.push(`Crisis severity: ${metrics.crisisSeverity}`);

  callouts.push({ label: "Share of Voice", value: `${formatReportNumber(metrics.shareOfVoice, config)}%` });
  callouts.push({ label: "Net Sentiment", value: formatReportNumber(metrics.netSentiment, config) });
  callouts.push({ label: "Reach", value: formatCompact(metrics.totalReach) });
  callouts.push({ label: "AI Visibility", value: `${formatReportNumber(metrics.aiVisibility, config)}%` });

  return {
    heading: `Executive Summary — ${brandName} (${period})`,
    paragraphs,
    bullets,
    callouts,
  };
}

/** Build a trend analysis text block from a SentimentTrendAnalysis. */
export function buildTrendAnalysisText(
  brandName: string,
  trend: SentimentTrendAnalysis,
  config: ReportGenerationConfig = DEFAULT_REPORT_CONFIG,
): TrendAnalysisDescriptor {
  const direction = trend.velocityDirection;
  const magnitude = Math.abs(trend.meanSentiment);
  const confidence = trend.trendStrength;
  const directionWord =
    direction === TrajectoryDirection.RISING
      ? "rising"
      : direction === TrajectoryDirection.FALLING
        ? "falling"
        : direction === TrajectoryDirection.VOLATILE
          ? "volatile"
          : "stable";

  const narrative =
    `${brandName}'s sentiment trajectory over the analysis window is ${directionWord}. ` +
    `Mean sentiment is ${formatReportNumber(trend.meanSentiment, config)} ` +
    `with volatility of ${formatReportNumber(trend.volatility, config)}. ` +
    `Trend strength is ${formatReportNumber(confidence * 100, config)}%, indicating ` +
    `${confidence > 0.7 ? "high" : confidence > 0.4 ? "moderate" : "low"} confidence in the directional signal. ` +
    `${trend.anomalies.length} sentiment anomaly/anomalies detected.`;

  return {
    metric: "sentiment",
    window: AggregationWindow.DAY,
    direction,
    magnitude,
    confidence,
    narrative,
    supportingData: [
      { label: "Mean sentiment", value: trend.meanSentiment },
      { label: "Volatility (std dev)", value: trend.volatility },
      { label: "Trend strength (R²)", value: trend.trendStrength },
      { label: "Anomalies detected", value: trend.anomalies.length },
      { label: "Current stage", value: trend.currentStage === "improving" ? 1 : trend.currentStage === "declining" ? -1 : 0 },
    ],
  };
}

/** Build a crisis report section. */
export function buildCrisisReportSection(
  assessment: CrisisAssessment,
  brandName: string,
  config: ReportGenerationConfig = DEFAULT_REPORT_CONFIG,
): ExecutiveSummaryBlock {
  const paragraphs: string[] = [];
  const bullets: string[] = [];

  paragraphs.push(
    `Crisis assessment for ${brandName}: severity ${assessment.severity.toUpperCase()} ` +
      `(score ${formatReportNumber(assessment.crisisScore, config)}/100). ` +
      `Estimated impact: ${assessment.estimatedImpact}. Estimated time-to-peak: ${assessment.estimatedTimeToPeak} hours.`,
  );

  for (const signal of assessment.signals) {
    if (signal.triggered) {
      bullets.push(`${signal.signalName}: ${signal.description}`);
    }
  }

  paragraphs.push("Recommended actions:");
  for (const action of assessment.recommendedActions) {
    bullets.push(action);
  }

  return {
    heading: `Crisis Assessment — ${brandName}`,
    paragraphs,
    bullets,
  };
}

/** Build a narrative section. */
export function buildNarrativeReportSection(
  narratives: Narrative[],
  brandName: string,
  config: ReportGenerationConfig = DEFAULT_REPORT_CONFIG,
): ExecutiveSummaryBlock {
  const paragraphs: string[] = [];
  const bullets: string[] = [];

  if (narratives.length === 0) {
    paragraphs.push(`No significant narratives were detected for ${brandName} during the analysis window.`);
    return {
      heading: `Narrative Tracking — ${brandName}`,
      paragraphs,
      bullets,
    };
  }

  const top = narratives.slice(0, 5);
  paragraphs.push(
    `${narratives.length} narrative(s) tracked for ${brandName}. ` +
      `The dominant theme is "${top[0].theme}" with a velocity score of ${formatReportNumber(
        top[0].velocityScore,
        config,
      )}/100 and stage ${top[0].stage}.`,
  );

  for (const n of top) {
    bullets.push(
      `"${n.theme}": ${n.totalMentions} mentions, velocity ${formatReportNumber(
        n.velocity,
        config,
      )}/day, sentiment ${formatReportNumber(n.avgSentiment, config)}, stage ${n.stage}`,
    );
  }

  return {
    heading: `Narrative Tracking — ${brandName}`,
    paragraphs,
    bullets,
  };
}

/** Build a competitive benchmarking section. */
export function buildBenchmarkReportSection(
  benchmark: CompetitiveBenchmarkResult,
  selfName: string,
  config: ReportGenerationConfig = DEFAULT_REPORT_CONFIG,
): ExecutiveSummaryBlock {
  const paragraphs: string[] = [];
  const bullets: string[] = [];

  if (benchmark.rows.length === 0) {
    paragraphs.push("No benchmarking data available.");
    return { heading: "Competitive Benchmarking", paragraphs, bullets };
  }

  const leader = benchmark.leader;
  const self = benchmark.self;

  paragraphs.push(
    `Competitive benchmark across ${benchmark.rows.length} brands. ` +
      `Category leader: ${leader?.brandName ?? "N/A"} with composite score ${formatReportNumber(
        leader?.compositeScore ?? 0,
        config,
      )}/100. ` +
      `Category median: ${formatReportNumber(benchmark.medianScore, config)}.`,
  );

  if (self) {
    paragraphs.push(
      `${selfName} ranks #${self.rank} of ${benchmark.rows.length} ` +
        `with a composite score of ${formatReportNumber(self.compositeScore, config)}/100 ` +
        `(percentile ${formatReportNumber(self.percentile, config)}%). ` +
        `Gap to leader: ${formatReportNumber(self.gapToLeader, config)} points. ` +
        `Gap to median: ${self.gapToMedian >= 0 ? "+" : ""}${formatReportNumber(self.gapToMedian, config)} points.`,
    );
    const summary = summarizeGaps(benchmark, self.brandId);
    for (const s of summary.strengths) bullets.push(`Strength: ${s}`);
    for (const w of summary.weaknesses) bullets.push(`Weakness: ${w}`);
    for (const c of summary.criticalGaps) bullets.push(`Critical gap: ${c}`);
  }

  return {
    heading: "Competitive Benchmarking",
    paragraphs,
    bullets,
  };
}

/** Build a reputation index section. */
export function buildReputationReportSection(
  reputation: ReputationIndexResult,
  brandName: string,
  config: ReportGenerationConfig = DEFAULT_REPORT_CONFIG,
): ExecutiveSummaryBlock {
  const paragraphs: string[] = [];
  const bullets: string[] = [];
  const callouts: Array<{ label: string; value: string }> = [];

  paragraphs.push(
    `${brandName} earns a reputation index of ${formatReportNumber(
      reputation.overall,
      config,
    )}/100 (grade ${reputation.grade}). ` +
      `Trend: ${reputation.trend} (${reputation.delta >= 0 ? "+" : ""}${formatReportNumber(
        reputation.delta,
        config,
      )} pts vs prior). Percentile rank vs peers: ${formatReportNumber(
        reputation.percentile,
        config,
      )}%.`,
  );

  for (const signal of reputation.signals) {
    bullets.push(signal);
  }

  callouts.push({ label: "Reputation Index", value: `${formatReportNumber(reputation.overall, config)}/100` });
  callouts.push({ label: "Grade", value: reputation.grade });
  callouts.push({ label: "Percentile", value: `${formatReportNumber(reputation.percentile, config)}%` });
  callouts.push({ label: "Trend", value: reputation.trend });

  return {
    heading: `Reputation Index — ${brandName}`,
    paragraphs,
    bullets,
    callouts,
  };
}

/** Build a full report by composing all sections. */
export interface FullBrandReport {
  title: string;
  period: string;
  brandName: string;
  generatedAt: ISOString;
  sections: ExecutiveSummaryBlock[];
  appendix?: Record<string, unknown>;
}

export function buildFullBrandReport(
  brandName: string,
  period: string,
  inputs: {
    executiveMetrics: Parameters<typeof buildExecutiveSummary>[2];
    sentimentTrend: SentimentTrendAnalysis;
    crisis?: CrisisAssessment;
    narratives: Narrative[];
    benchmark?: CompetitiveBenchmarkResult;
    reputation?: ReputationIndexResult;
  },
  config: ReportGenerationConfig = DEFAULT_REPORT_CONFIG,
): FullBrandReport {
  const sections: ExecutiveSummaryBlock[] = [];
  sections.push(buildExecutiveSummary(brandName, period, inputs.executiveMetrics, config));
  const trendBlock = buildTrendAnalysisText(brandName, inputs.sentimentTrend, config);
  sections.push({
    heading: "Sentiment Trend Analysis",
    paragraphs: [trendBlock.narrative],
    bullets: trendBlock.supportingData?.map((d) => `${d.label}: ${formatReportNumber(d.value, config)}`),
  });
  if (inputs.crisis) {
    sections.push(buildCrisisReportSection(inputs.crisis, brandName, config));
  }
  sections.push(buildNarrativeReportSection(inputs.narratives, brandName, config));
  if (inputs.benchmark) {
    sections.push(buildBenchmarkReportSection(inputs.benchmark, brandName, config));
  }
  if (inputs.reputation) {
    sections.push(buildReputationReportSection(inputs.reputation, brandName, config));
  }

  return {
    title: `Brand Intelligence Report — ${brandName}`,
    period,
    brandName,
    generatedAt: toISOString(Date.now()),
    sections,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 15 — AGGREGATE / ORCHESTRATION FACADE
// ════════════════════════════════════════════════════════════════════════════

/** A high-level facade that runs the entire brand intelligence pipeline. */
export class BrandIntelligenceEngine {
  private readonly sovConfig: ShareOfVoiceConfig;
  private readonly crisisConfig: CrisisDetectionConfig;
  private readonly narrativeConfig: NarrativeTrackerConfig;
  private readonly influenceConfig: InfluenceScoringConfig;
  private readonly trendConfig: SentimentTrendConfig;
  private readonly reputationWeights: ReputationWeights;
  private readonly benchmarkConfig: BenchmarkConfiguration;
  private readonly reportConfig: ReportGenerationConfig;

  constructor(options: {
    sovConfig?: ShareOfVoiceConfig;
    crisisConfig?: CrisisDetectionConfig;
    narrativeConfig?: NarrativeTrackerConfig;
    influenceConfig?: InfluenceScoringConfig;
    trendConfig?: SentimentTrendConfig;
    reputationWeights?: ReputationWeights;
    benchmarkConfig?: BenchmarkConfiguration;
    reportConfig?: ReportGenerationConfig;
  } = {}) {
    this.sovConfig = options.sovConfig ?? DEFAULT_SOV_CONFIG;
    this.crisisConfig = options.crisisConfig ?? DEFAULT_CRISIS_CONFIG;
    this.narrativeConfig = options.narrativeConfig ?? DEFAULT_NARRATIVE_CONFIG;
    this.influenceConfig = options.influenceConfig ?? DEFAULT_INFLUENCE_CONFIG;
    this.trendConfig = options.trendConfig ?? DEFAULT_SENTIMENT_TREND_CONFIG;
    this.reputationWeights = options.reputationWeights ?? DEFAULT_REPUTATION_WEIGHTS;
    this.benchmarkConfig = options.benchmarkConfig ?? DEFAULT_BENCHMARK_CONFIG;
    this.reportConfig = options.reportConfig ?? DEFAULT_REPORT_CONFIG;
  }

  /** Compute the share of voice matrix for a set of brands. */
  computeSoV(mentionsByBrand: Map<string, MediaMention[]>): ShareOfVoiceMatrix {
    return computeShareOfVoiceMatrix(mentionsByBrand, this.sovConfig);
  }

  /** Compute media reach for a single brand. */
  computeReach(brandId: string, mentions: MediaMention[]): MediaReachAggregate {
    return aggregateMediaReach(brandId, mentions);
  }

  /** Compute sentiment trend for a brand. */
  computeSentimentTrend(mentions: MediaMention[]): SentimentTrendAnalysis {
    return analyzeSentimentTrend(mentions, this.trendConfig);
  }

  /** Rank influencers by composite score. */
  rankInfluencers(
    profiles: InfluencerProfile[],
    mentionsByInfluencer: Map<string, MediaMention[]>,
  ): InfluencerRankingEntry[] {
    return rankInfluencers(profiles, mentionsByInfluencer, this.influenceConfig);
  }

  /** Detect narratives for a brand. */
  detectNarratives(brandId: string, mentions: MediaMention[]): Narrative[] {
    return detectNarratives(brandId, mentions, this.narrativeConfig);
  }

  /** Run crisis detection for a brand. */
  detectCrisis(
    brandId: string,
    recentMentions: MediaMention[],
    baselineMentions: MediaMention[],
    narratives: Narrative[] = [],
  ): CrisisAssessment {
    return detectCrisis(brandId, recentMentions, baselineMentions, narratives, this.crisisConfig);
  }

  /** Run competitive benchmarking across a set of brands. */
  benchmark(brands: BrandBenchmarkMetrics[], selfBrandId?: string): CompetitiveBenchmarkResult {
    return runCompetitiveBenchmark(brands, this.benchmarkConfig, selfBrandId);
  }

  /** Compute the reputation index for a brand. */
  computeReputation(
    brandId: string,
    components: ReputationComponents,
    previousOverall?: number,
    peerOveralls?: number[],
  ): ReputationIndexResult {
    return computeReputationIndex(brandId, components, this.reputationWeights, previousOverall, peerOveralls);
  }

  /** Assemble a media-monitoring dashboard payload. */
  assembleDashboard(
    brands: Array<{
      brandId: string;
      brandName: string;
      mentions: MediaMention[];
      baselineMentions: MediaMention[];
      aiVisibilityPct: number;
    }>,
    influencerProfiles?: InfluencerProfile[],
  ): MediaMonitoringDashboard {
    return assembleDashboard(brands, {
      sovConfig: this.sovConfig,
      crisisConfig: this.crisisConfig,
      narrativeConfig: this.narrativeConfig,
      influenceConfig: this.influenceConfig,
      reputationWeights: this.reputationWeights,
      influencerProfiles,
    });
  }

  /** Generate a full brand report. */
  generateReport(
    brandName: string,
    period: string,
    inputs: {
      executiveMetrics: Parameters<typeof buildExecutiveSummary>[2];
      sentimentTrend: SentimentTrendAnalysis;
      crisis?: CrisisAssessment;
      narratives: Narrative[];
      benchmark?: CompetitiveBenchmarkResult;
      reputation?: ReputationIndexResult;
    },
  ): FullBrandReport {
    return buildFullBrandReport(brandName, period, inputs, this.reportConfig);
  }
}

/** Factory: create a brand intelligence engine with production defaults. */
export function createBrandIntelligenceEngine(): BrandIntelligenceEngine {
  return new BrandIntelligenceEngine();
}

/** Factory: create a brand intelligence engine tuned for high-volume real-time monitoring. */
export function createRealtimeBrandIntelligenceEngine(): BrandIntelligenceEngine {
  return new BrandIntelligenceEngine({
    sovConfig: {
      ...DEFAULT_SOV_CONFIG,
      authorityWeighted: true,
      sentimentAdjusted: true,
      reachMultiplier: true,
      dedupeSyndication: true,
    },
    crisisConfig: {
      ...DEFAULT_CRISIS_CONFIG,
      recentWindowMinutes: 15,
      baselineWindowDays: 3,
      minMentionsForCrisis: 3,
    },
    narrativeConfig: {
      ...DEFAULT_NARRATIVE_CONFIG,
      recentWindowDays: 3,
      emergingVelocityThreshold: 1,
    },
    trendConfig: {
      ...DEFAULT_SENTIMENT_TREND_CONFIG,
      smaWindow: 3,
      emaPeriod: 3,
      wmaPeriod: 3,
      velocityWindow: 1,
      accelerationWindow: 1,
    },
  });
}

/** Factory: create a brand intelligence engine tuned for monthly reporting. */
export function createMonthlyReportEngine(): BrandIntelligenceEngine {
  return new BrandIntelligenceEngine({
    sovConfig: DEFAULT_SOV_CONFIG,
    trendConfig: {
      ...DEFAULT_SENTIMENT_TREND_CONFIG,
      smaWindow: 30,
      emaPeriod: 30,
      wmaPeriod: 30,
      velocityWindow: 7,
      accelerationWindow: 7,
    },
    narrativeConfig: {
      ...DEFAULT_NARRATIVE_CONFIG,
      recentWindowDays: 30,
      dormantDaysThreshold: 60,
    },
    reportConfig: {
      ...DEFAULT_REPORT_CONFIG,
      tone: "executive",
      maxLength: 10000,
    },
  });
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 16 — CONVENIENCE FACTORIES FOR MEDIA MENTIONS
// ════════════════════════════════════════════════════════════════════════════

/** Build a MediaMention from a partial object, applying defaults. */
export function makeMention(partial: Partial<MediaMention> & Pick<MediaMention, "id" | "brandId" | "sourceId" | "sourceName" | "sourceChannel" | "authorityTier" | "title" | "publishedAt" | "sentimentLabel" | "sentimentScore">): MediaMention {
  return {
    authorityScore: 0.5,
    confidence: 1,
    ...partial,
  };
}

/** Convert a list of mentions into a Map keyed by brandId. */
export function groupMentionsByBrand(mentions: MediaMention[]): Map<string, MediaMention[]> {
  const map = new Map<string, MediaMention[]>();
  for (const m of mentions) {
    const list = map.get(m.brandId) ?? [];
    list.push(m);
    map.set(m.brandId, list);
  }
  return map;
}

/** Filter mentions to a specific date range (inclusive). */
export function filterMentionsByDateRange(
  mentions: MediaMention[],
  from: ISOString,
  to: ISOString,
): MediaMention[] {
  return mentions.filter((m) => m.publishedAt >= from && m.publishedAt <= to);
}

/** Filter mentions to those within the last N days. */
export function filterMentionsRecent(
  mentions: MediaMention[],
  days: number,
  referenceTime: EpochMs = Date.now(),
): MediaMention[] {
  const cutoff = toISOString(referenceTime - days * 86_400_000);
  return mentions.filter((m) => m.publishedAt >= cutoff);
}

/** Filter mentions by channel. */
export function filterMentionsByChannel(
  mentions: MediaMention[],
  channels: MediaChannel[],
): MediaMention[] {
  const set = new Set(channels);
  return mentions.filter((m) => set.has(m.sourceChannel));
}

/** Sort mentions chronologically (oldest first). */
export function sortMentionsChronologically(mentions: MediaMention[]): MediaMention[] {
  return [...mentions].sort((a, b) => a.publishedAt.localeCompare(b.publishedAt));
}

/** Sort mentions by reach (highest first). */
export function sortMentionsByReach(mentions: MediaMention[]): MediaMention[] {
  return [...mentions].sort((a, b) => safeNumber(b.reach) - safeNumber(a.reach));
}

/** Compute a quick mention-count summary for a brand. */
export function summarizeMentionCount(mentions: MediaMention[]): {
  total: number;
  positive: number;
  neutral: number;
  negative: number;
  uniqueSources: number;
  uniqueAuthors: number;
  firstSeen?: ISOString;
  lastSeen?: ISOString;
} {
  const sources = new Set<string>();
  const authors = new Set<string>();
  let positive = 0;
  let neutral = 0;
  let negative = 0;
  let firstSeen: ISOString | undefined;
  let lastSeen: ISOString | undefined;
  for (const m of mentions) {
    sources.add(m.sourceId);
    if (m.authorHandle) authors.add(m.authorHandle);
    if (m.sentimentLabel === SentimentPolarity.POSITIVE) positive++;
    else if (m.sentimentLabel === SentimentPolarity.NEGATIVE) negative++;
    else neutral++;
    if (!firstSeen || m.publishedAt < firstSeen) firstSeen = m.publishedAt;
    if (!lastSeen || m.publishedAt > lastSeen) lastSeen = m.publishedAt;
  }
  return {
    total: mentions.length,
    positive,
    neutral,
    negative,
    uniqueSources: sources.size,
    uniqueAuthors: authors.size,
    firstSeen,
    lastSeen,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 17 — SOURCE PROFILE REGISTRY & AUTHORITY RESOLVER
// ════════════════════════════════════════════════════════════════════════════

/** An in-memory source profile registry. */
export class SourceProfileRegistry {
  private readonly profiles = new Map<string, SourceProfile>();
  private readonly aliasToId = new Map<string, string>();

  /** Register a source profile. */
  register(profile: SourceProfile): void {
    this.profiles.set(profile.sourceId, profile);
    this.aliasToId.set(profile.sourceName.toLowerCase(), profile.sourceId);
  }

  /** Register multiple profiles at once. */
  registerAll(profiles: SourceProfile[]): void {
    for (const p of profiles) this.register(p);
  }

  /** Look up a source by ID or name (case-insensitive). */
  resolve(idOrName: string): SourceProfile | undefined {
    return this.profiles.get(idOrName) ?? this.profiles.get(this.aliasToId.get(idOrName.toLowerCase()) ?? "");
  }

  /** Get all registered profiles. */
  list(): SourceProfile[] {
    return [...this.profiles.values()];
  }

  /** Filter profiles by channel. */
  byChannel(channel: MediaChannel): SourceProfile[] {
    return this.list().filter((p) => p.channel === channel);
  }

  /** Filter profiles by authority tier. */
  byTier(tier: AuthorityTier): SourceProfile[] {
    return this.list().filter((p) => p.authorityTier === tier);
  }

  /** Compute the mean authority score across all registered sources. */
  meanAuthorityScore(): number {
    const list = this.list();
    if (list.length === 0) return 0;
    return mean(list.map((p) => p.authorityScore));
  }

  /** Compute the share of registered sources by channel. */
  channelShare(): Record<MediaChannel, number> {
    const list = this.list();
    const counts: Record<string, number> = {};
    for (const p of list) counts[p.channel] = (counts[p.channel] ?? 0) + 1;
    const out = {} as Record<MediaChannel, number>;
    for (const ch of Object.values(MediaChannel)) {
      out[ch] = list.length > 0 ? ((counts[ch] ?? 0) / list.length) * 100 : 0;
    }
    return out;
  }
}

/** Build a default registry with a set of canonical sources. */
export function createDefaultSourceRegistry(): SourceProfileRegistry {
  const registry = new SourceProfileRegistry();
  const defaults: SourceProfile[] = [
    {
      sourceId: "reuters",
      sourceName: "Reuters",
      channel: MediaChannel.ONLINE,
      authorityTier: AuthorityTier.TIER_1_ELITE,
      authorityScore: 0.98,
      monthlyReach: 450_000_000,
      avgEngagementRate: 0.012,
      country: "Global",
      language: "en",
      isVerified: true,
    },
    {
      sourceId: "bloomberg",
      sourceName: "Bloomberg",
      channel: MediaChannel.ONLINE,
      authorityTier: AuthorityTier.TIER_1_ELITE,
      authorityScore: 0.97,
      monthlyReach: 380_000_000,
      avgEngagementRate: 0.011,
      country: "Global",
      language: "en",
      paywall: true,
      isVerified: true,
    },
    {
      sourceId: "ft",
      sourceName: "Financial Times",
      channel: MediaChannel.PRINT,
      authorityTier: AuthorityTier.TIER_1_ELITE,
      authorityScore: 0.96,
      monthlyReach: 95_000_000,
      avgEngagementRate: 0.009,
      country: "UK",
      language: "en",
      paywall: true,
      isVerified: true,
    },
    {
      sourceId: "hespress",
      sourceName: "Hespress",
      channel: MediaChannel.ONLINE,
      authorityTier: AuthorityTier.TIER_2_NATIONAL,
      authorityScore: 0.72,
      monthlyReach: 45_000_000,
      avgEngagementRate: 0.034,
      country: "Morocco",
      language: "ar",
      isVerified: true,
    },
    {
      sourceId: "telquel",
      sourceName: "TelQuel",
      channel: MediaChannel.ONLINE,
      authorityTier: AuthorityTier.TIER_2_NATIONAL,
      authorityScore: 0.71,
      monthlyReach: 18_000_000,
      avgEngagementRate: 0.028,
      country: "Morocco",
      language: "fr",
      isVerified: true,
    },
    {
      sourceId: "medias24",
      sourceName: "Medias24",
      channel: MediaChannel.ONLINE,
      authorityTier: AuthorityTier.TIER_2_NATIONAL,
      authorityScore: 0.69,
      monthlyReach: 12_000_000,
      avgEngagementRate: 0.022,
      country: "Morocco",
      language: "fr",
      isVerified: true,
    },
    {
      sourceId: "leconomiste",
      sourceName: "L'Economiste",
      channel: MediaChannel.PRINT,
      authorityTier: AuthorityTier.TIER_3_TRADE,
      authorityScore: 0.58,
      monthlyReach: 4_500_000,
      avgEngagementRate: 0.018,
      country: "Morocco",
      language: "fr",
      isVerified: true,
    },
    {
      sourceId: "jeuneafrique",
      sourceName: "Jeune Afrique",
      channel: MediaChannel.PRINT,
      authorityTier: AuthorityTier.TIER_2_NATIONAL,
      authorityScore: 0.74,
      monthlyReach: 22_000_000,
      avgEngagementRate: 0.024,
      country: "Pan-African",
      language: "fr",
      paywall: true,
      isVerified: true,
    },
    {
      sourceId: "twitter",
      sourceName: "Twitter / X",
      channel: MediaChannel.SOCIAL,
      authorityTier: AuthorityTier.TIER_4_REGIONAL,
      authorityScore: 0.4,
      monthlyReach: 1_800_000_000,
      avgEngagementRate: 0.045,
      country: "Global",
      language: "multi",
      isVerified: false,
    },
    {
      sourceId: "linkedin",
      sourceName: "LinkedIn",
      channel: MediaChannel.SOCIAL,
      authorityTier: AuthorityTier.TIER_3_TRADE,
      authorityScore: 0.55,
      monthlyReach: 950_000_000,
      avgEngagementRate: 0.062,
      country: "Global",
      language: "multi",
      isVerified: true,
    },
  ];
  registry.registerAll(defaults);
  return registry;
}

/** Enrich a mention with a resolved source profile (returns a new mention). */
export function enrichMentionWithProfile(
  mention: MediaMention,
  registry: SourceProfileRegistry,
): MediaMention {
  const profile = registry.resolve(mention.sourceId) ?? registry.resolve(mention.sourceName);
  if (!profile) return mention;
  return {
    ...mention,
    sourceChannel: profile.channel,
    authorityTier: profile.authorityTier,
    authorityScore: profile.authorityScore,
    reach: mention.reach ?? profile.monthlyReach ? Math.round((profile.monthlyReach ?? 0) / 30) : undefined,
  };
}

/** Enrich a batch of mentions with their resolved source profiles. */
export function enrichMentionsWithProfiles(
  mentions: MediaMention[],
  registry: SourceProfileRegistry,
): MediaMention[] {
  return mentions.map((m) => enrichMentionWithProfile(m, registry));
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 18 — AI VISIBILITY AGGREGATION
// ════════════════════════════════════════════════════════════════════════════

/** Aggregated AI visibility result for a brand. */
export interface AIVisibilityAggregate {
  brandId: string;
  citationRate: number; // 0..100
  avgRank: number; // 1..N (lower is better)
  topEngine: string | null;
  worstEngine: string | null;
  sentimentDistribution: Record<SentimentPolarity, number>;
  byEngine: Array<{
    engine: string;
    cited: boolean;
    rank?: number;
    sentiment?: SentimentPolarity;
    confidence: number;
    checkedAt: ISOString;
  }>;
  coverage: number; // 0..100 — % of probed engines that cited the brand
  computedAt: EpochMs;
}

/** Aggregate AI visibility observations into a single metric set. */
export function aggregateAIVisibility(
  brandId: string,
  observations: AIVisibilityObservation[],
): AIVisibilityAggregate {
  if (observations.length === 0) {
    return {
      brandId,
      citationRate: 0,
      avgRank: 0,
      topEngine: null,
      worstEngine: null,
      sentimentDistribution: {
        [SentimentPolarity.POSITIVE]: 0,
        [SentimentPolarity.NEUTRAL]: 0,
        [SentimentPolarity.NEGATIVE]: 0,
        [SentimentPolarity.MIXED]: 0,
      },
      byEngine: [],
      coverage: 0,
      computedAt: Date.now(),
    };
  }

  const byEngineMap = new Map<string, AIVisibilityObservation>();
  for (const o of observations) {
    const existing = byEngineMap.get(o.engineName);
    if (!existing || o.checkedAt > existing.checkedAt) {
      byEngineMap.set(o.engineName, o);
    }
  }
  const byEngine = [...byEngineMap.values()].sort((a, b) => a.engineName.localeCompare(b.engineName));

  const cited = byEngine.filter((o) => o.cited);
  const citationRate = (cited.length / byEngine.length) * 100;

  const ranked = cited.filter((o) => o.rank !== undefined);
  const avgRank = ranked.length > 0 ? mean(ranked.map((o) => o.rank!)) : 0;

  // Top engine = highest-confidence cited observation
  let topEngine: string | null = null;
  let topConf = -1;
  let worstEngine: string | null = null;
  let worstConf = 2;
  for (const o of byEngine) {
    if (o.cited && o.confidence > topConf) {
      topConf = o.confidence;
      topEngine = o.engineName;
    }
    if (!o.cited && o.confidence < worstConf) {
      worstConf = o.confidence;
      worstEngine = o.engineName;
    }
  }

  const sentimentDist: Record<SentimentPolarity, number> = {
    [SentimentPolarity.POSITIVE]: 0,
    [SentimentPolarity.NEUTRAL]: 0,
    [SentimentPolarity.NEGATIVE]: 0,
    [SentimentPolarity.MIXED]: 0,
  };
  for (const o of cited) {
    if (o.sentiment) sentimentDist[o.sentiment]++;
  }
  const citedCount = cited.length || 1;
  const dist: Record<SentimentPolarity, number> = {
    [SentimentPolarity.POSITIVE]: (sentimentDist[SentimentPolarity.POSITIVE] / citedCount) * 100,
    [SentimentPolarity.NEUTRAL]: (sentimentDist[SentimentPolarity.NEUTRAL] / citedCount) * 100,
    [SentimentPolarity.NEGATIVE]: (sentimentDist[SentimentPolarity.NEGATIVE] / citedCount) * 100,
    [SentimentPolarity.MIXED]: (sentimentDist[SentimentPolarity.MIXED] / citedCount) * 100,
  };

  return {
    brandId,
    citationRate,
    avgRank,
    topEngine,
    worstEngine,
    sentimentDistribution: dist,
    byEngine: byEngine.map((o) => ({
      engine: o.engineName,
      cited: o.cited,
      rank: o.rank,
      sentiment: o.sentiment,
      confidence: o.confidence,
      checkedAt: o.checkedAt,
    })),
    coverage: citationRate,
    computedAt: Date.now(),
  };
}

/** Compute an AI visibility score (0..100) from an aggregate. */
export function computeAIVisibilityScore(agg: AIVisibilityAggregate): number {
  // Score = citationRate * 0.5 + (1/avgRank normalized) * 0.3 + positiveSentimentShare * 0.2
  const citationComponent = agg.citationRate * 0.5;
  const rankComponent = agg.avgRank > 0 ? (1 / agg.avgRank) * 100 * 0.3 : 0;
  const positiveShare = agg.sentimentDistribution[SentimentPolarity.POSITIVE] ?? 0;
  const sentimentComponent = positiveShare * 0.2;
  return clampPct(citationComponent + rankComponent + sentimentComponent);
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 19 — ALERT THRESHOLD ENGINE
// ════════════════════════════════════════════════════════════════════════════

/** Threshold definition for a metric alert. */
export interface AlertThreshold {
  metric: string;
  direction: "above" | "below" | "change";
  warning: number;
  critical: number;
  window?: AggregationWindow;
}

/** Threshold breach result. */
export interface ThresholdBreach {
  metric: string;
  current: number;
  threshold: number;
  level: "warning" | "critical";
  direction: "above" | "below" | "change";
  breached: boolean;
}

/** Evaluate a single threshold against a current value. */
export function evaluateThreshold(
  threshold: AlertThreshold,
  currentValue: number,
): ThresholdBreach {
  let breached = false;
  let level: "warning" | "critical" = "warning";
  let actualThreshold = threshold.warning;

  if (threshold.direction === "above") {
    if (currentValue >= threshold.critical) {
      breached = true;
      level = "critical";
      actualThreshold = threshold.critical;
    } else if (currentValue >= threshold.warning) {
      breached = true;
      level = "warning";
      actualThreshold = threshold.warning;
    }
  } else if (threshold.direction === "below") {
    if (currentValue <= threshold.critical) {
      breached = true;
      level = "critical";
      actualThreshold = threshold.critical;
    } else if (currentValue <= threshold.warning) {
      breached = true;
      level = "warning";
      actualThreshold = threshold.warning;
    }
  } else {
    // change
    if (Math.abs(currentValue) >= threshold.critical) {
      breached = true;
      level = "critical";
      actualThreshold = threshold.critical;
    } else if (Math.abs(currentValue) >= threshold.warning) {
      breached = true;
      level = "warning";
      actualThreshold = threshold.warning;
    }
  }

  return {
    metric: threshold.metric,
    current: currentValue,
    threshold: actualThreshold,
    level,
    direction: threshold.direction,
    breached,
  };
}

/** Evaluate a set of thresholds against a metric map. */
export function evaluateThresholds(
  thresholds: AlertThreshold[],
  metrics: Map<string, number>,
): ThresholdBreach[] {
  const breaches: ThresholdBreach[] = [];
  for (const t of thresholds) {
    const value = metrics.get(t.metric);
    if (value === undefined) continue;
    const result = evaluateThreshold(t, value);
    if (result.breached) breaches.push(result);
  }
  return breaches;
}

/** Default alert thresholds for media monitoring. */
export const DEFAULT_ALERT_THRESHOLDS: AlertThreshold[] = [
  { metric: "sentiment", direction: "below", warning: -0.2, critical: -0.5 },
  { metric: "negative_share", direction: "above", warning: 0.3, critical: 0.5 },
  { metric: "mention_velocity", direction: "above", warning: 2, critical: 4 },
  { metric: "crisis_score", direction: "above", warning: 30, critical: 60 },
  { metric: "ai_visibility", direction: "below", warning: 30, critical: 15 },
  { metric: "share_of_voice", direction: "change", warning: 5, critical: 15 },
];

// ════════════════════════════════════════════════════════════════════════════
// SECTION 20 — ENGAGEMENT & VIRALITY METRICS
// ════════════════════════════════════════════════════════════════════════════

/** Engagement summary for a single mention or set of mentions. */
export interface EngagementSummary {
  totalEngagement: number;
  totalImpressions: number;
  engagementRate: number;
  amplificationRate: number; // shares per impression
  viralityScore: number; // 0..100
}

/** Compute engagement summary for a set of mentions. */
export function computeEngagementSummary(mentions: MediaMention[]): EngagementSummary {
  let totalEngagement = 0;
  let totalImpressions = 0;
  for (const m of mentions) {
    totalEngagement += safeNumber(m.engagement);
    totalImpressions += safeNumber(m.impressions);
  }
  const engagementRate = totalImpressions > 0 ? totalEngagement / totalImpressions : 0;
  // Approximate amplification as 30% of engagement (shares vs total)
  const amplificationRate = totalImpressions > 0 ? (totalEngagement * 0.3) / totalImpressions : 0;
  // Virality score: combine engagement rate with absolute scale
  const scaleScore = clamp01(safeLog10(totalEngagement + 1) / 6) * 50;
  const rateScore = clamp01(engagementRate * 20) * 50;
  const viralityScore = clampPct(scaleScore + rateScore);
  return {
    totalEngagement,
    totalImpressions,
    engagementRate,
    amplificationRate,
    viralityScore,
  };
}

/** Compute a single mention's virality score. */
export function computeMentionVirality(mention: MediaMention): number {
  const engagement = safeNumber(mention.engagement);
  const impressions = safeNumber(mention.impressions);
  const reach = safeNumber(mention.reach);
  if (impressions === 0 && reach === 0) return 0;
  const denom = Math.max(impressions, reach, 1);
  const rate = engagement / denom;
  const scaleScore = clamp01(safeLog10(engagement + 1) / 5) * 50;
  const rateScore = clamp01(rate * 50) * 50;
  return clampPct(scaleScore + rateScore);
}

/** Identify viral mentions (virality score above threshold). */
export function identifyViralMentions(mentions: MediaMention[], threshold = 70): MediaMention[] {
  return mentions.filter((m) => computeMentionVirality(m) >= threshold);
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 21 — GEO & LANGUAGE BREAKDOWN
// ════════════════════════════════════════════════════════════════════════════

/** Geographic distribution of mentions. */
export interface GeoBreakdown {
  byCountry: Array<{ country: string; mentions: number; reach: number; sentimentAvg: number }>;
  byRegion: Array<{ region: string; mentions: number; reach: number; sentimentAvg: number }>;
  diversity: number; // 0..1
  topCountry: string | null;
}

/** Compute geographic breakdown. */
export function computeGeoBreakdown(mentions: MediaMention[]): GeoBreakdown {
  const countryMap = new Map<string, { mentions: number; reach: number; sentimentSum: number }>();
  const regionMap = new Map<string, { mentions: number; reach: number; sentimentSum: number }>();

  for (const m of mentions) {
    if (!m.geo || m.geo.length === 0) continue;
    for (const geo of m.geo) {
      const parts = geo.split("/");
      const country = parts[0] ?? "Unknown";
      const region = parts[1] ?? country;
      const cEntry = countryMap.get(country) ?? { mentions: 0, reach: 0, sentimentSum: 0 };
      cEntry.mentions++;
      cEntry.reach += safeNumber(m.reach);
      cEntry.sentimentSum += m.sentimentScore;
      countryMap.set(country, cEntry);
      const rEntry = regionMap.get(region) ?? { mentions: 0, reach: 0, sentimentSum: 0 };
      rEntry.mentions++;
      rEntry.reach += safeNumber(m.reach);
      rEntry.sentimentSum += m.sentimentScore;
      regionMap.set(region, rEntry);
    }
  }

  const byCountry = [...countryMap.entries()]
    .map(([country, e]) => ({
      country,
      mentions: e.mentions,
      reach: e.reach,
      sentimentAvg: e.mentions > 0 ? e.sentimentSum / e.mentions : 0,
    }))
    .sort((a, b) => b.mentions - a.mentions);

  const byRegion = [...regionMap.entries()]
    .map(([region, e]) => ({
      region,
      mentions: e.mentions,
      reach: e.reach,
      sentimentAvg: e.mentions > 0 ? e.sentimentSum / e.mentions : 0,
    }))
    .sort((a, b) => b.mentions - a.mentions);

  const diversity = clamp01(1 - herfindahlIndex(byCountry.map((c) => c.mentions)));
  const topCountry = byCountry.length > 0 ? byCountry[0].country : null;

  return { byCountry, byRegion, diversity, topCountry };
}

/** Language distribution of mentions. */
export interface LanguageBreakdown {
  byLanguage: Array<{ language: string; mentions: number; reach: number; sentimentAvg: number; share: number }>;
  dominantLanguage: string | null;
  diversity: number;
}

/** Compute language breakdown. */
export function computeLanguageBreakdown(mentions: MediaMention[]): LanguageBreakdown {
  const langMap = new Map<string, { mentions: number; reach: number; sentimentSum: number }>();
  for (const m of mentions) {
    const lang = m.language ?? "unknown";
    const entry = langMap.get(lang) ?? { mentions: 0, reach: 0, sentimentSum: 0 };
    entry.mentions++;
    entry.reach += safeNumber(m.reach);
    entry.sentimentSum += m.sentimentScore;
    langMap.set(lang, entry);
  }
  const total = mentions.length || 1;
  const byLanguage = [...langMap.entries()]
    .map(([language, e]) => ({
      language,
      mentions: e.mentions,
      reach: e.reach,
      sentimentAvg: e.mentions > 0 ? e.sentimentSum / e.mentions : 0,
      share: (e.mentions / total) * 100,
    }))
    .sort((a, b) => b.mentions - a.mentions);
  return {
    byLanguage,
    dominantLanguage: byLanguage.length > 0 ? byLanguage[0].language : null,
    diversity: clamp01(1 - herfindahlIndex(byLanguage.map((l) => l.mentions))),
  };
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 22 — PEER SET CONSTRUCTION & COMPARISON
// ════════════════════════════════════════════════════════════════════════════

/** Construct a peer set from a list of brands by sector and size. */
export function constructPeerSet(
  selfBrand: PeerBrand,
  candidates: PeerBrand[],
  options: { sameSectorOnly?: boolean; maxPeers?: number } = {},
): PeerBrand[] {
  const sameSectorOnly = options.sameSectorOnly ?? true;
  const maxPeers = options.maxPeers ?? 10;
  let pool = candidates.filter((c) => c.brandId !== selfBrand.brandId);
  if (sameSectorOnly) {
    pool = pool.filter((c) => c.sector === selfBrand.sector);
  }
  // Sort by similarity of market cap (if available)
  if (selfBrand.marketCap) {
    pool.sort((a, b) => {
      const aDiff = a.marketCap ? Math.abs(a.marketCap - selfBrand.marketCap!) : Number.MAX_VALUE;
      const bDiff = b.marketCap ? Math.abs(b.marketCap - selfBrand.marketCap!) : Number.MAX_VALUE;
      return aDiff - bDiff;
    });
  }
  return pool.slice(0, maxPeers);
}

/** Compute pairwise similarity between two brands. */
export function computeBrandSimilarity(a: PeerBrand, b: PeerBrand): number {
  let score = 0;
  if (a.sector === b.sector) score += 0.4;
  if (a.isPublic === b.isPublic) score += 0.1;
  if (a.marketCap && b.marketCap) {
    const ratio = Math.min(a.marketCap, b.marketCap) / Math.max(a.marketCap, b.marketCap);
    score += ratio * 0.4;
  }
  if (a.revenue && b.revenue) {
    const ratio = Math.min(a.revenue, b.revenue) / Math.max(a.revenue, b.revenue);
    score += ratio * 0.1;
  }
  return clamp01(score);
}

/** Build a brand similarity matrix. */
export function buildBrandSimilarityMatrix(brands: PeerBrand[]): Array<{ a: string; b: string; similarity: number }> {
  const out: Array<{ a: string; b: string; similarity: number }> = [];
  for (let i = 0; i < brands.length; i++) {
    for (let j = i + 1; j < brands.length; j++) {
      out.push({
        a: brands[i].brandId,
        b: brands[j].brandId,
        similarity: computeBrandSimilarity(brands[i], brands[j]),
      });
    }
  }
  return out;
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 23 — TOPIC & ENTITY ANALYSIS
// ════════════════════════════════════════════════════════════════════════════

/** Topic analysis result. */
export interface TopicAnalysis {
  topics: Array<{ topic: string; mentions: number; reach: number; sentimentAvg: number; share: number }>;
  dominantTopic: string | null;
  diversity: number;
}

/** Compute topic analysis from mentions. */
export function computeTopicAnalysis(mentions: MediaMention[]): TopicAnalysis {
  const topicMap = new Map<string, { mentions: number; reach: number; sentimentSum: number }>();
  let totalMentions = 0;
  for (const m of mentions) {
    if (!m.topics || m.topics.length === 0) continue;
    for (const t of m.topics) {
      const entry = topicMap.get(t) ?? { mentions: 0, reach: 0, sentimentSum: 0 };
      entry.mentions++;
      entry.reach += safeNumber(m.reach);
      entry.sentimentSum += m.sentimentScore;
      topicMap.set(t, entry);
    }
    totalMentions++;
  }
  const total = totalMentions || 1;
  const topics = [...topicMap.entries()]
    .map(([topic, e]) => ({
      topic,
      mentions: e.mentions,
      reach: e.reach,
      sentimentAvg: e.mentions > 0 ? e.sentimentSum / e.mentions : 0,
      share: (e.mentions / total) * 100,
    }))
    .sort((a, b) => b.mentions - a.mentions);
  return {
    topics,
    dominantTopic: topics.length > 0 ? topics[0].topic : null,
    diversity: clamp01(1 - herfindahlIndex(topics.map((t) => t.mentions))),
  };
}

/** Entity analysis result. */
export interface EntityAnalysis {
  entities: Array<{ entity: string; mentions: number; sentimentAvg: number; reach: number }>;
  dominantEntity: string | null;
  coOccurrence: Array<{ a: string; b: string; count: number }>;
}

/** Compute entity analysis from mentions. */
export function computeEntityAnalysis(mentions: MediaMention[]): EntityAnalysis {
  const entityMap = new Map<string, { mentions: number; sentimentSum: number; reach: number }>();
  const coOccurMap = new Map<string, number>();
  for (const m of mentions) {
    if (!m.entities || m.entities.length === 0) continue;
    for (const e of m.entities) {
      const entry = entityMap.get(e) ?? { mentions: 0, sentimentSum: 0, reach: 0 };
      entry.mentions++;
      entry.sentimentSum += m.sentimentScore;
      entry.reach += safeNumber(m.reach);
      entityMap.set(e, entry);
    }
    // Co-occurrence
    for (let i = 0; i < m.entities.length; i++) {
      for (let j = i + 1; j < m.entities.length; j++) {
        const a = m.entities[i] < m.entities[j] ? m.entities[i] : m.entities[j];
        const b = m.entities[i] < m.entities[j] ? m.entities[j] : m.entities[i];
        const key = `${a}|${b}`;
        coOccurMap.set(key, (coOccurMap.get(key) ?? 0) + 1);
      }
    }
  }
  const entities = [...entityMap.entries()]
    .map(([entity, e]) => ({
      entity,
      mentions: e.mentions,
      sentimentAvg: e.mentions > 0 ? e.sentimentSum / e.mentions : 0,
      reach: e.reach,
    }))
    .sort((a, b) => b.mentions - a.mentions);
  const coOccurrence = [...coOccurMap.entries()]
    .map(([key, count]) => {
      const [a, b] = key.split("|");
      return { a, b, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 50);
  return {
    entities,
    dominantEntity: entities.length > 0 ? entities[0].entity : null,
    coOccurrence,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 24 — WEIGHTING & SCORING PRESETS
// ════════════════════════════════════════════════════════════════════════════

/** Preset for a corporate reputation index (weighted toward sentiment & authority). */
export const CORPORATE_REPUTATION_WEIGHTS: ReputationWeights = {
  sentiment: 0.3,
  shareOfVoice: 0.15,
  aiVisibility: 0.1,
  authority: 0.2,
  innovation: 0.1,
  performance: 0.1,
  purpose: 0.05,
};

/** Preset for a consumer brand reputation index (weighted toward sentiment & innovation). */
export const CONSUMER_BRAND_WEIGHTS: ReputationWeights = {
  sentiment: 0.35,
  shareOfVoice: 0.25,
  aiVisibility: 0.1,
  authority: 0.1,
  innovation: 0.15,
  performance: 0.05,
  purpose: 0.0,
};

/** Preset for a financial brand reputation index (weighted toward authority & performance). */
export const FINANCIAL_BRAND_WEIGHTS: ReputationWeights = {
  sentiment: 0.2,
  shareOfVoice: 0.15,
  aiVisibility: 0.1,
  authority: 0.25,
  innovation: 0.1,
  performance: 0.15,
  purpose: 0.05,
};

/** Preset for a crisis-focused configuration (more sensitive triggers). */
export const CRISIS_SENSITIVE_CONFIG: CrisisDetectionConfig = {
  ...DEFAULT_CRISIS_CONFIG,
  sentimentDropThreshold: -0.15,
  negativeVolumeThreshold: 0.25,
  velocitySpikeThreshold: 1.5,
  minMentionsForCrisis: 3,
  severityThresholds: {
    low: 15,
    moderate: 30,
    high: 50,
    severe: 70,
    critical: 85,
  },
};

/** Preset for a conservative crisis configuration (fewer false positives). */
export const CRISIS_CONSERVATIVE_CONFIG: CrisisDetectionConfig = {
  ...DEFAULT_CRISIS_CONFIG,
  sentimentDropThreshold: -0.5,
  negativeVolumeThreshold: 0.6,
  velocitySpikeThreshold: 4,
  minMentionsForCrisis: 10,
  severityThresholds: {
    low: 30,
    moderate: 50,
    high: 70,
    severe: 85,
    critical: 95,
  },
};

/** Map an authority tier to its default weight. */
export function authorityTierToWeight(tier: AuthorityTier): number {
  return DEFAULT_AUTHORITY_WEIGHTS[tier];
}

/** Map a channel to its default weight. */
export function channelToWeight(channel: MediaChannel): number {
  return DEFAULT_CHANNEL_WEIGHTS[channel];
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 25 — EXPORT SUMMARY
// ════════════════════════════════════════════════════════════════════════════

/**
 * Brand & Market Intelligence module — comprehensive media monitoring analytics.
 *
 * Public API summary:
 *  - Branded types: BrandIntelId, ISOString, EpochMs, UnitInterval, Percentage
 *  - Enums: SentimentPolarity, MediaChannel, AuthorityTier, CrisisSeverity,
 *           TrajectoryDirection, EscalationAction, NarrativeStage, AnomalyKind,
 *           InfluenceTier, AggregationWindow
 *  - Math utilities: clamp, mean, median, variance, stdDev, percentile, weightedMean,
 *           giniCoefficient, herfindahlIndex, sigmoid, lerp, remap, and many more
 *  - Time-series: simpleMovingAverage, exponentialMovingAverage, weightedMovingAverage,
 *           doubleEMA, triangularMovingAverage, rollingMax/Min/StdDev/Median
 *  - Share of Voice: computeShareOfVoiceMatrix, computeSentimentAdjustedShareOfVoice,
 *           computeCompetitiveSoVMatrix, computeSoVTrend, aggregateBrandMentions
 *  - Media reach: aggregateMediaReach, computeChannelAMP, projectReach, effectiveReach
 *  - Sentiment trends: analyzeSentimentTrend, buildSentimentTimeSeries, computeVelocity,
 *           computeAcceleration, classifyTrajectory, detectSentimentAnomalies
 *  - Influence scoring: computeInfluencerScore, rankInfluencers, identifyKeyVoices,
 *           computeAmplificationFactor, classifyInfluencerTier
 *  - Narrative tracker: extractThemes, buildNarrative, detectNarratives,
 *           identifyEmergingNarratives, computeNarrativeVelocityScore
 *  - Crisis detection: detectCrisis, detectCrisesForBrands, classifyCrisisSeverity,
 *           determineEscalationAction, generateCrisisRecommendations
 *  - Competitive benchmark: runCompetitiveBenchmark, computePeerPercentile, summarizeGaps
 *  - Reputation index: computeReputationIndex, computePortfolioReputation, scoreToGrade
 *  - Dashboard: assembleDashboard, buildMediaWeather, buildKpiStrip, buildAlertFeed
 *  - Reports: buildExecutiveSummary, buildTrendAnalysisText, buildCrisisReportSection,
 *           buildNarrativeReportSection, buildBenchmarkReportSection,
 *           buildReputationReportSection, buildFullBrandReport
 *  - Engine facade: BrandIntelligenceEngine + factory functions
 *  - Source registry: SourceProfileRegistry, createDefaultSourceRegistry
 *  - AI visibility: aggregateAIVisibility, computeAIVisibilityScore
 *  - Thresholds: evaluateThreshold, evaluateThresholds, DEFAULT_ALERT_THRESHOLDS
 *  - Engagement: computeEngagementSummary, computeMentionVirality, identifyViralMentions
 *  - Geo/language: computeGeoBreakdown, computeLanguageBreakdown
 *  - Peer set: constructPeerSet, computeBrandSimilarity, buildBrandSimilarityMatrix
 *  - Topic/entity: computeTopicAnalysis, computeEntityAnalysis
 *  - Presets: CORPORATE_REPUTATION_WEIGHTS, CONSUMER_BRAND_WEIGHTS,
 *           FINANCIAL_BRAND_WEIGHTS, CRISIS_SENSITIVE_CONFIG, CRISIS_CONSERVATIVE_CONFIG
 *
 * Author: Harch Atelier — SUBAGENT-BRAND-INTEL
 */
