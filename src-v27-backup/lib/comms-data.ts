/**
 * Harch Atelier — Communications & PR dataset (V17.0 pr role)
 *
 * Deterministic, strictly-typed mock data for the Communications category
 * sections owned by the PR role:
 *   comms-overview, comms-sentiment, comms-sov, comms-coverage,
 *   comms-campaigns, comms-reputation, comms-press, comms-social.
 *
 * Conventions:
 *   - Deterministic seeded PRNG (mulberry32) so first paint is stable.
 *   - HarchCorp-flavoured + Morocco-aware: real-feeling outlets
 *     (Le Matin, L'Économiste, Aujourd'hui le Maroc, Medias24, Hespress,
 *     TelQuel, HuffPost Maroc, La Vie Éco, Challenge.ma), FR/AR/EN language
 *     split, Moroccan influencers, MASI-listed competitors.
 *   - No `any`. All entities exported with strict interfaces.
 *   - Anchored to 2025-11-15T10:30:00Z (same as admin/legal).
 *   - PR role tint = rose-700 (per project palette; primary chart color).
 */

/* ------------------------------------------------------------------ */
/*  Deterministic PRNG                                                 */
/* ------------------------------------------------------------------ */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20251117);

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rnd() * arr.length)];
}

function isoDaysAgo(days: number, hourOffset = 0): string {
  const d = new Date("2025-11-15T10:30:00Z");
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hourOffset);
  return d.toISOString();
}

function isoHoursAgo(hours: number): string {
  const d = new Date("2025-11-15T10:30:00Z");
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

function isoDaysAhead(days: number): string {
  const d = new Date("2025-11-15T10:30:00Z");
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

/* ------------------------------------------------------------------ */
/*  Shared helpers                                                     */
/* ------------------------------------------------------------------ */

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export function formatUSD(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function formatMAD(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0,
  });
}

export function formatPct(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return `${n}`;
}

export function relativeTime(iso: string | null, now = "2025-11-15T10:30:00Z"): string {
  if (!iso) return "—";
  const diffMs = Date.parse(now) - Date.parse(iso);
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toISOString().slice(0, 10);
}

export function formatDate(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

/** Tint map for sentiment chips/badges. */
export const sentimentTint = {
  positive: { text: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200", dot: "bg-emerald-500" },
  neutral: { text: "text-slate-600", bg: "bg-slate-100", ring: "ring-slate-200", dot: "bg-slate-400" },
  negative: { text: "text-rose-700", bg: "bg-rose-50", ring: "ring-rose-200", dot: "bg-rose-500" },
} as const;

export type Sentiment = "positive" | "neutral" | "negative";

/* ================================================================== */
/*  1. REPUTATION (comms-reputation + comms-overview)                  */
/* ================================================================== */

export type StakeholderGroup =
  | "Investors"
  | "Customers"
  | "Employees"
  | "Regulators"
  | "Media"
  | "Analysts"
  | "Communities";

export interface ReputationTrendPoint {
  /** ISO short label. */
  day: string;
  /** 0–100 net reputation index. */
  index: number;
  /** -100..+100 net sentiment skew. */
  sentiment: number;
}

export const reputationTrend30d: ReputationTrendPoint[] = (() => {
  const out: ReputationTrendPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date("2025-11-15T00:00:00Z");
    d.setDate(d.getDate() - i);
    const drift = 64 + 4 * Math.sin(i / 4.2) + (rnd() - 0.5) * 2.4 + (29 - i) * 0.18;
    out.push({
      day: d.toISOString().slice(5, 10),
      index: Math.round(Math.max(40, Math.min(85, drift)) * 10) / 10,
      sentiment: Math.round((drift - 35) * 10) / 10,
    });
  }
  return out;
})();

export interface ReputationMonth {
  /** Short month label. */
  month: string;
  /** 0–100 net reputation index. */
  index: number;
  /** Net sentiment -100..+100. */
  sentiment: number;
}

const monthLabels = ["Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];

export const reputationTrend12m: ReputationMonth[] = monthLabels.map((month, i) => {
  const base = 62 + 6 * Math.sin(i / 1.6) + 4 * Math.cos(i / 2.7);
  const index = Math.round(Math.max(45, Math.min(82, base)) * 10) / 10;
  const sentiment = Math.round((index - 38) * 10) / 10;
  return { month, index, sentiment };
});

export interface ExecutiveRep {
  name: string;
  title: string;
  sentiment: number;
  delta: number;
  mentions: number;
  negative: number;
}

export const executiveReps: ExecutiveRep[] = [
  { name: "Alessandro Marchetti", title: "Group CEO", sentiment: 74, delta: +3.4, mentions: 486, negative: 16 },
  { name: "Sofia Dubois", title: "Group CFO", sentiment: 67, delta: -1.6, mentions: 312, negative: 24 },
  { name: "Youssef Haddad", title: "COO, Logistics EU", sentiment: 72, delta: +1.4, mentions: 198, negative: 12 },
  { name: "Inès Mansouri", title: "Chief Sustainability Officer", sentiment: 80, delta: +5.1, mentions: 156, negative: 6 },
  { name: "Mehdi Benali", title: "Chief Compliance Officer", sentiment: 63, delta: -0.9, mentions: 104, negative: 20 },
  { name: "Camille Petit", title: "General Counsel", sentiment: 76, delta: +2.7, mentions: 92, negative: 8 },
];

export interface StakeholderSentiment {
  stakeholder: StakeholderGroup;
  positive: number;
  neutral: number;
  negative: number;
}

export const stakeholderSentiment: StakeholderSentiment[] = [
  { stakeholder: "Investors", positive: 50, neutral: 30, negative: 20 },
  { stakeholder: "Customers", positive: 58, neutral: 27, negative: 15 },
  { stakeholder: "Employees", positive: 54, neutral: 29, negative: 17 },
  { stakeholder: "Regulators", positive: 40, neutral: 42, negative: 18 },
  { stakeholder: "Media", positive: 36, neutral: 36, negative: 28 },
  { stakeholder: "Analysts", positive: 46, neutral: 34, negative: 20 },
  { stakeholder: "Communities", positive: 32, neutral: 40, negative: 28 },
];

/** Stakeholder × month reputation heatmap (7 stakeholders × 6 months). */
export interface ReputationHeatmapCell {
  stakeholder: StakeholderGroup;
  cells: { month: string; score: number }[];
}

const heatmapMonths = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
const heatmapStakeholders: StakeholderGroup[] = [
  "Investors",
  "Customers",
  "Employees",
  "Regulators",
  "Media",
  "Analysts",
  "Communities",
];

export const reputationHeatmap: ReputationHeatmapCell[] = heatmapStakeholders.map((stakeholder, sIdx) => ({
  stakeholder,
  cells: heatmapMonths.map((month, mIdx) => {
    const base = 58 + sIdx * 1.5 + (5 - mIdx) * 1.2 + Math.sin((sIdx + mIdx) / 1.7) * 8;
    return { month, score: Math.round(Math.max(28, Math.min(88, base))) };
  }),
}));

export interface ReputationDriver {
  id: string;
  topic: string;
  /** -100..+100 sentiment contribution. */
  impact: number;
  /** Article + mention volume behind the driver. */
  volume: number;
  trend: "up" | "down" | "flat";
  type: "driver" | "pain";
}

export const reputationDrivers: ReputationDriver[] = [
  { id: "DRV-001", topic: "Sustainability leadership — water stewardship pilot", impact: +42, volume: 312, trend: "up", type: "driver" },
  { id: "DRV-002", topic: "Q3 earnings beat — margin guidance reaffirmed", impact: +34, volume: 248, trend: "up", type: "driver" },
  { id: "DRV-003", topic: "Innovation list — CTO named to Top 50", impact: +21, volume: 86, trend: "up", type: "driver" },
  { id: "DRV-004", topic: "Casablanca Free Zone expansion — 1,200 jobs", impact: +18, volume: 142, trend: "flat", type: "driver" },
  { id: "DRV-005", topic: "Tangier Med port — logistics partnership", impact: +14, volume: 96, trend: "flat", type: "driver" },
  { id: "PAN-001", topic: "CFG Bank AML inquiry — analyst note pickup", impact: -38, volume: 184, trend: "down", type: "pain" },
  { id: "PAN-002", topic: "Cyber incident — customer PII coverage", impact: -32, volume: 226, trend: "up", type: "pain" },
  { id: "PAN-003", topic: "Executive pay disclosure — social backlash", impact: -22, volume: 142, trend: "flat", type: "pain" },
  { id: "PAN-004", topic: "Casablanca port incident — contractor safety", impact: -18, volume: 88, trend: "down", type: "pain" },
];

export const reputationSummary = {
  current: 68,
  delta30d: +2.6,
  delta90d: -1.1,
  nps: 42,
  npsDelta: +5,
  avgExecutive: Math.round(executiveReps.reduce((s, e) => s + e.sentiment, 0) / executiveReps.length),
  trend30d: reputationTrend30d,
};

/* ================================================================== */
/*  2. SENTIMENT (comms-sentiment)                                     */
/* ================================================================== */

export type ArticleTier = "tier1" | "tier2" | "tier3";
export type Language = "fr" | "ar" | "en";
export type Channel = "print" | "online" | "social" | "broadcast";

export interface SentimentTrendMonth {
  month: string;
  positive: number;
  neutral: number;
  negative: number;
}

export const sentimentTrend12m: SentimentTrendMonth[] = monthLabels.map((month, i) => {
  const positive = Math.round(140 + 60 * Math.sin(i / 1.4) + 22 * Math.cos(i / 2.6));
  const neutral = Math.round(80 + 18 * Math.cos(i / 2.1) + (i % 5));
  const negative = Math.round(95 + 48 * Math.sin(i / 1.9 + 0.8) + 16 * Math.cos(i / 3.3));
  return {
    month,
    positive: Math.max(60, positive),
    neutral: Math.max(40, neutral),
    negative: Math.max(30, negative),
  };
});

export interface SentimentByTier {
  tier: ArticleTier;
  positive: number;
  neutral: number;
  negative: number;
}

export const sentimentByTier: SentimentByTier[] = [
  { tier: "tier1", positive: 38, neutral: 32, negative: 30 },
  { tier: "tier2", positive: 44, neutral: 36, negative: 20 },
  { tier: "tier3", positive: 51, neutral: 30, negative: 19 },
];

export interface SentimentByLanguage {
  language: Language;
  label: string;
  positive: number;
  neutral: number;
  negative: number;
  articles: number;
}

export const sentimentByLanguage: SentimentByLanguage[] = [
  { language: "fr", label: "Français", positive: 44, neutral: 33, negative: 23, articles: 1284 },
  { language: "ar", label: "العربية", positive: 38, neutral: 30, negative: 32, articles: 612 },
  { language: "en", label: "English", positive: 52, neutral: 28, negative: 20, articles: 896 },
];

export interface SentimentByChannel {
  channel: Channel;
  positive: number;
  neutral: number;
  negative: number;
}

export const sentimentByChannel: SentimentByChannel[] = [
  { channel: "print", positive: 41, neutral: 38, negative: 21 },
  { channel: "online", positive: 46, neutral: 32, negative: 22 },
  { channel: "social", positive: 38, neutral: 22, negative: 40 },
  { channel: "broadcast", positive: 48, neutral: 34, negative: 18 },
];

export interface SentimentDriver {
  id: string;
  topic: string;
  /** -100..+100 sentiment skew. */
  sentiment: number;
  mentions: number;
  /** Percentage-point change in the last 30d. */
  delta: number;
  pillar: "Regulatory" | "Financial" | "ESG" | "Cyber" | "Reputational" | "Operational";
}

export const sentimentDrivers: SentimentDriver[] = [
  { id: "SDR-001", topic: "Q3 earnings results — margin beat", sentiment: +64, mentions: 412, delta: +12.4, pillar: "Financial" },
  { id: "SDR-002", topic: "Water stewardship pilot — facility 04", sentiment: +58, mentions: 218, delta: +9.6, pillar: "ESG" },
  { id: "SDR-003", topic: "Tangier Med partnership announcement", sentiment: +46, mentions: 184, delta: +6.2, pillar: "Operational" },
  { id: "SDR-004", topic: "Innovation list — CTO named", sentiment: +42, mentions: 96, delta: +3.4, pillar: "Reputational" },
  { id: "SDR-005", topic: "Cyber incident — customer PII", sentiment: -52, mentions: 286, delta: -8.1, pillar: "Cyber" },
  { id: "SDR-006", topic: "CFG Bank AML inquiry pickup", sentiment: -48, mentions: 224, delta: -6.8, pillar: "Regulatory" },
  { id: "SDR-007", topic: "Executive pay — social backlash", sentiment: -34, mentions: 156, delta: -4.2, pillar: "Reputational" },
  { id: "SDR-008", topic: "Casablanca port contractor safety", sentiment: -28, mentions: 88, delta: -2.1, pillar: "Operational" },
];

export const sentimentSummary = {
  totalArticles: sentimentByLanguage.reduce((s, l) => s + l.articles, 0),
  positiveShare: Math.round(
    (sentimentByLanguage.reduce((s, l) => s + (l.positive * l.articles) / 100, 0) /
      sentimentByLanguage.reduce((s, l) => s + l.articles, 0)) *
      100,
  ),
  negativeShare: Math.round(
    (sentimentByLanguage.reduce((s, l) => s + (l.negative * l.articles) / 100, 0) /
      sentimentByLanguage.reduce((s, l) => s + l.articles, 0)) *
      100,
  ),
  get netSentiment() {
    return this.positiveShare - this.negativeShare;
  },
  avgMonthlyVolume: Math.round(
    sentimentTrend12m.reduce((s, m) => s + m.positive + m.neutral + m.negative, 0) / sentimentTrend12m.length,
  ),
  tier1Count: sentimentByTier[0].positive + sentimentByTier[0].neutral + sentimentByTier[0].negative,
};

/* ================================================================== */
/*  3. SHARE OF VOICE (comms-sov)                                      */
/* ================================================================== */

export interface SovSlice {
  name: string;
  value: number;
  isTarget: boolean;
}

export const sovDistribution: SovSlice[] = [
  { name: "HarchCorp", value: 1284, isTarget: true },
  { name: "Northwind", value: 842, isTarget: false },
  { name: "Vela Dynamics", value: 617, isTarget: false },
  { name: "Orbital Systems", value: 438, isTarget: false },
  { name: "Kessler & Vale", value: 293, isTarget: false },
  { name: "Atlas Holdings", value: 218, isTarget: false },
  { name: "Other", value: 412, isTarget: false },
];

export interface SovTrendDay {
  day: string;
  HarchCorp: number;
  Northwind: number;
  Vela: number;
  Orbital: number;
}

export const sovTrend30d: SovTrendDay[] = (() => {
  const out: SovTrendDay[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date("2025-11-15T00:00:00Z");
    d.setDate(d.getDate() - i);
    const t = 29 - i;
    out.push({
      day: d.toISOString().slice(5, 10),
      HarchCorp: Math.round(38 + 6 * Math.sin(t / 4.1) + (rnd() - 0.5) * 4),
      Northwind: Math.round(28 + 5 * Math.cos(t / 3.7) + (rnd() - 0.5) * 3),
      Vela: Math.round(20 + 4 * Math.sin(t / 3.2 + 1) + (rnd() - 0.5) * 3),
      Orbital: Math.round(14 + 3 * Math.cos(t / 2.8) + (rnd() - 0.5) * 2),
    });
  }
  return out;
})();

export type MediaType = "owned" | "earned" | "shared";

export interface SovByMedia {
  type: MediaType;
  HarchCorp: number;
  Northwind: number;
  Vela: number;
  Orbital: number;
}

export const sovByMedia: SovByMedia[] = [
  { type: "owned", HarchCorp: 412, Northwind: 286, Vela: 168, Orbital: 124 },
  { type: "earned", HarchCorp: 624, Northwind: 412, Vela: 318, Orbital: 218 },
  { type: "shared", HarchCorp: 248, Northwind: 144, Vela: 131, Orbital: 96 },
];

export interface SovByTier {
  tier: ArticleTier;
  HarchCorp: number;
  Northwind: number;
  Vela: number;
  Orbital: number;
}

export const sovByTier: SovByTier[] = [
  { tier: "tier1", HarchCorp: 384, Northwind: 312, Vela: 196, Orbital: 142 },
  { tier: "tier2", HarchCorp: 512, Northwind: 318, Vela: 248, Orbital: 178 },
  { tier: "tier3", HarchCorp: 388, Northwind: 212, Vela: 173, Orbital: 118 },
];

export interface CompetitorMention {
  name: string;
  ticker: string;
  mentions: number;
  reach: number;
  sentimentShare: number;
  sov: number;
  delta30d: number;
}

export const competitorMentions: CompetitorMention[] = [
  { name: "HarchCorp", ticker: "HRCH", mentions: 1284, reach: 12_400_000, sentimentShare: 62, sov: 33.2, delta30d: +4.1 },
  { name: "Northwind Capital", ticker: "NWD", mentions: 842, reach: 9_800_000, sentimentShare: 58, sov: 21.8, delta30d: -1.4 },
  { name: "Vela Dynamics", ticker: "VDYN", mentions: 617, reach: 6_200_000, sentimentShare: 54, sov: 16.0, delta30d: +0.8 },
  { name: "Orbital Systems", ticker: "ORBS", mentions: 438, reach: 4_400_000, sentimentShare: 51, sov: 11.3, delta30d: -0.6 },
  { name: "Kessler & Vale", ticker: "KSVL", mentions: 293, reach: 2_900_000, sentimentShare: 49, sov: 7.6, delta30d: +0.2 },
  { name: "Atlas Holdings", ticker: "ATLS", mentions: 218, reach: 2_100_000, sentimentShare: 47, sov: 5.6, delta30d: -0.3 },
];

export const sovSummary = {
  harchShare: 33.2,
  harchDelta30d: +4.1,
  rank: 1,
  totalMentions: sovDistribution.reduce((s, x) => s + x.value, 0),
  competitors: sovDistribution.filter((s) => !s.isTarget && s.name !== "Other").length,
  ownedShare: Math.round(
    (sovByMedia.reduce((s, m) => s + m.HarchCorp, 0) /
      sovByMedia.reduce((s, m) => s + m.HarchCorp + m.Northwind + m.Vela + m.Orbital, 0)) *
      100,
  ),
};

/* ================================================================== */
/*  4. COVERAGE (comms-coverage)                                       */
/* ================================================================== */

export type Region = "Morocco" | "EU" | "US" | "MENA" | "SSA" | "APAC" | "LATAM";

export interface CoverageArticle {
  id: string;
  headline: string;
  outlet: string;
  tier: ArticleTier;
  publishedAt: string;
  sentiment: Sentiment;
  reach: number;
  language: Language;
  region: Region;
  url: string;
  author: string;
}

/** Moroccan + international outlets for realistic coverage feed. */
const outletsBank: { name: string; tier: ArticleTier; reach: number; language: Language; region: Region }[] = [
  { name: "L'Économiste", tier: "tier1", reach: 1_180_000, language: "fr", region: "Morocco" },
  { name: "Le Matin", tier: "tier1", reach: 1_640_000, language: "fr", region: "Morocco" },
  { name: "Aujourd'hui le Maroc", tier: "tier1", reach: 920_000, language: "fr", region: "Morocco" },
  { name: "Medias24", tier: "tier1", reach: 680_000, language: "fr", region: "Morocco" },
  { name: "TelQuel", tier: "tier2", reach: 540_000, language: "fr", region: "Morocco" },
  { name: "Hespress", tier: "tier2", reach: 2_100_000, language: "ar", region: "Morocco" },
  { name: "La Vie Éco", tier: "tier2", reach: 410_000, language: "fr", region: "Morocco" },
  { name: "Les Inspirations ÉCO", tier: "tier3", reach: 220_000, language: "fr", region: "Morocco" },
  { name: "Challenge.ma", tier: "tier3", reach: 180_000, language: "fr", region: "Morocco" },
  { name: "Morocco World News", tier: "tier3", reach: 320_000, language: "en", region: "Morocco" },
  { name: "Le360", tier: "tier3", reach: 480_000, language: "fr", region: "Morocco" },
  { name: "HesFoot", tier: "tier3", reach: 280_000, language: "ar", region: "Morocco" },
  { name: "Financial Times", tier: "tier1", reach: 4_200_000, language: "en", region: "EU" },
  { name: "Reuters", tier: "tier1", reach: 8_900_000, language: "en", region: "US" },
  { name: "Bloomberg", tier: "tier1", reach: 6_100_000, language: "en", region: "US" },
  { name: "Le Monde", tier: "tier1", reach: 2_100_000, language: "fr", region: "EU" },
  { name: "Wall Street Journal", tier: "tier1", reach: 3_800_000, language: "en", region: "US" },
  { name: "The Africa Report", tier: "tier2", reach: 540_000, language: "en", region: "SSA" },
  { name: "Jeune Afrique", tier: "tier2", reach: 1_240_000, language: "fr", region: "MENA" },
  { name: "S&P Global", tier: "tier2", reach: 760_000, language: "en", region: "US" },
];

const headlines = [
  "HarchCorp posts Q3 beat, reaffirms margin guidance",
  "Tangier Med partnership expands Casablanca Free Zone footprint",
  "Water stewardship pilot earns regional minister endorsement",
  "CFG Bank AML inquiry prompts analyst note on HarchCorp exposure",
  "Cyber incident response: 72h notification filed with CNPDP",
  "Innovation list names HarchCorp CTO to annual Top 50",
  "HarchCorp Capital closes €240M green bond offering",
  "Sustainability report — Scope 3 methodology defended",
  "Executive compensation disclosure draws social-media scrutiny",
  "Casablanca port incident: contractor safety under review",
  "Logistics EU subcontractor dispute reaches mediation",
  "Moroccan Competition Council clears Marocaine de Distribution merger",
  "HarchCorp Labs announces AI co-innovation with OCP subsidiary",
  "Regional minister endorses water-stewardship pilot at facility 04",
  "Board refresh cadence questioned in op-ed",
  "Patent ruling partially overturned on appeal",
  "HarchCorp signs 4-year sourcing deal with Attijariwafa",
  "Earnings call — analyst pushback on services-segment margin",
  "Cyber incident response — customer notification drafted",
  "Insider-trading complaint amended; named individual departs",
  "HarchCorp Logistics opens Tangier automated distribution hub",
  "Banque Populaire partnership expands trade-finance facility",
  "OCP joint venture — phosphate processing R&D center",
  "Sustainability-linked loan upsized to €180M",
  "Greenwashing op-ed pickup challenges ESG narrative",
];

const authors = [
  "S. Bennani", "K. Idrissi", "M. Tazi", "L. Alaoui", "Y. Berrada",
  "N. Cherkaoui", "R. El Fassi", "A. Lahlou", "F. Saadi", "P. Wagner",
  "J. Caldwell", "E. Marchand", "C. Rossi",
];

function buildCoverageArticles(): CoverageArticle[] {
  const out: CoverageArticle[] = [];
  for (let i = 0; i < 24; i++) {
    const outlet = outletsBank[(i * 7 + 3) % outletsBank.length];
    const headline = headlines[(i * 5 + 2) % headlines.length];
    const author = authors[(i * 3 + 1) % authors.length];
    const daysAgo = (i * 31) % 28;
    const hoursAgo = (i * 7) % 24;
    const sentimentRoll = (i + 5) % 10;
    let sentiment: Sentiment;
    if (sentimentRoll < 5) sentiment = "positive";
    else if (sentimentRoll < 8) sentiment = "neutral";
    else sentiment = "negative";
    // Override for crisis-spike rows to feel realistic
    if (i === 3 || i === 4 || i === 8 || i === 18) sentiment = "negative";
    if (i === 0 || i === 2 || i === 13) sentiment = "positive";
    out.push({
      id: `COV-${String(i + 1).padStart(4, "0")}`,
      headline,
      outlet: outlet.name,
      tier: outlet.tier,
      publishedAt: isoDaysAgo(daysAgo, hoursAgo),
      sentiment,
      reach: outlet.reach - (i % 6) * 12000,
      language: outlet.language,
      region: outlet.region,
      url: "#",
      author,
    });
  }
  return out.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

export const coverageArticles: CoverageArticle[] = buildCoverageArticles();

/** Coverage volume 30d area-chart data (positive vs negative). */
export interface CoverageVolumeDay {
  day: string;
  positive: number;
  neutral: number;
  negative: number;
}

export const coverageVolume30d: CoverageVolumeDay[] = (() => {
  const out: CoverageVolumeDay[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date("2025-11-15T00:00:00Z");
    d.setDate(d.getDate() - i);
    const t = 29 - i;
    // Day 8-10 = crisis spike (cyber incident wave)
    const spike = t === 8 || t === 9 || t === 10 ? 18 : 0;
    out.push({
      day: d.toISOString().slice(5, 10),
      positive: Math.round(28 + 14 * Math.sin(t / 2.3) + 8 * Math.cos(t / 1.1) + (t % 4) + spike / 2),
      neutral: Math.round(18 + 8 * Math.cos(t / 2.0) + (t % 3)),
      negative: Math.round(22 + 12 * Math.sin(t / 1.7 + 1) + 7 * Math.cos(t / 3.1) + spike),
    });
  }
  return out;
})();

export interface TopOutlet {
  outlet: string;
  tier: ArticleTier;
  articles: number;
  reach: number;
}

export const topOutlets: TopOutlet[] = (() => {
  const counts = new Map<string, { outlet: string; tier: ArticleTier; articles: number; reach: number }>();
  for (const a of coverageArticles) {
    const existing = counts.get(a.outlet);
    if (existing) {
      existing.articles += 1;
    } else {
      const meta = outletsBank.find((o) => o.name === a.outlet)!;
      counts.set(a.outlet, { outlet: a.outlet, tier: a.tier, articles: 1, reach: meta.reach });
    }
  }
  return [...counts.values()].sort((a, b) => b.reach - a.reach).slice(0, 10);
})();

export const coverageSummary = {
  totalArticles: coverageArticles.length,
  totalReach: coverageArticles.reduce((s, a) => s + a.reach, 0),
  positive: coverageArticles.filter((a) => a.sentiment === "positive").length,
  negative: coverageArticles.filter((a) => a.sentiment === "negative").length,
  neutral: coverageArticles.filter((a) => a.sentiment === "neutral").length,
  tier1: coverageArticles.filter((a) => a.tier === "tier1").length,
  morocco: coverageArticles.filter((a) => a.region === "Morocco").length,
  crisisSpikes: 1, // the day-8 cyber spike
  fr: coverageArticles.filter((a) => a.language === "fr").length,
  ar: coverageArticles.filter((a) => a.language === "ar").length,
  en: coverageArticles.filter((a) => a.language === "en").length,
};

/* ================================================================== */
/*  5. CAMPAIGNS (comms-campaigns)                                     */
/* ================================================================== */

export type CampaignStatus = "active" | "scheduled" | "completed" | "paused";
export type CampaignChannel = "press" | "social" | "events" | "digital" | "investor" | "internal";

export interface Campaign {
  id: string;
  name: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  /** Estimated reach (impressions). */
  reach: number;
  /** Total engagement (likes, shares, comments, click-throughs). */
  engagement: number;
  /** Sentiment lift in pp vs pre-campaign baseline. */
  sentimentLift: number;
  /** Share-of-voice lift in pp vs pre-campaign baseline. */
  sovLift: number;
  /** Total cost in USD. */
  cost: number;
  /** Days elapsed. */
  daysElapsed: number;
  /** Total duration planned. */
  duration: number;
}

export const campaigns: Campaign[] = [
  {
    id: "CMP-001",
    name: "Q3 Earnings Roadshow — Casablanca + Paris + London",
    channel: "investor",
    status: "active",
    reach: 4_280_000,
    engagement: 86_400,
    sentimentLift: +6.2,
    sovLift: +4.1,
    cost: 480_000,
    daysElapsed: 22,
    duration: 35,
  },
  {
    id: "CMP-002",
    name: "Tangier Med Partnership Launch",
    channel: "press",
    status: "active",
    reach: 6_120_000,
    engagement: 142_800,
    sentimentLift: +8.4,
    sovLift: +5.6,
    cost: 320_000,
    daysElapsed: 12,
    duration: 30,
  },
  {
    id: "CMP-003",
    name: "Sustainability Leadership Series — Water Stewardship",
    channel: "events",
    status: "active",
    reach: 2_140_000,
    engagement: 58_200,
    sentimentLift: +11.2,
    sovLift: +3.4,
    cost: 240_000,
    daysElapsed: 38,
    duration: 90,
  },
  {
    id: "CMP-004",
    name: "Cyber Incident Response — Customer Trust Recovery",
    channel: "digital",
    status: "active",
    reach: 1_840_000,
    engagement: 42_600,
    sentimentLift: -2.1,
    sovLift: +1.8,
    cost: 540_000,
    daysElapsed: 9,
    duration: 45,
  },
  {
    id: "CMP-005",
    name: "Innovation List — CTO Top 50 Amplification",
    channel: "social",
    status: "completed",
    reach: 980_000,
    engagement: 28_400,
    sentimentLift: +4.6,
    sovLift: +1.2,
    cost: 86_000,
    daysElapsed: 21,
    duration: 21,
  },
  {
    id: "CMP-006",
    name: "Marocaine de Distribution Merger Clearance Comms",
    channel: "press",
    status: "scheduled",
    reach: 0,
    engagement: 0,
    sentimentLift: 0,
    sovLift: 0,
    cost: 180_000,
    daysElapsed: 0,
    duration: 60,
  },
  {
    id: "CMP-007",
    name: "Internal Town Hall — Q4 Strategy Alignment",
    channel: "internal",
    status: "completed",
    reach: 4_200,
    engagement: 1_860,
    sentimentLift: +3.8,
    sovLift: 0,
    cost: 42_000,
    daysElapsed: 14,
    duration: 14,
  },
];

/** ROI = (sentimentLift * 8_000 + sovLift * 12_000 + engagement * 4) / cost */
export function campaignRoi(c: Campaign): number {
  if (c.cost <= 0) return 0;
  const benefit = c.sentimentLift * 8_000 + c.sovLift * 12_000 + c.engagement * 4;
  return Math.round((benefit / c.cost) * 100) / 100;
}

export interface CampaignTimelinePhase {
  phase: string;
  campaign: string;
  startDay: number;
  duration: number;
  status: CampaignStatus;
}

export const campaignTimeline: CampaignTimelinePhase[] = [
  { phase: "Internal Town Hall", campaign: "CMP-007", startDay: -28, duration: 14, status: "completed" },
  { phase: "Innovation List", campaign: "CMP-005", startDay: -21, duration: 21, status: "completed" },
  { phase: "Sustainability Series", campaign: "CMP-003", startDay: -38, duration: 90, status: "active" },
  { phase: "Q3 Earnings Roadshow", campaign: "CMP-001", startDay: -22, duration: 35, status: "active" },
  { phase: "Tangier Med Launch", campaign: "CMP-002", startDay: -12, duration: 30, status: "active" },
  { phase: "Cyber Trust Recovery", campaign: "CMP-004", startDay: -9, duration: 45, status: "active" },
  { phase: "MdD Merger Comms", campaign: "CMP-006", startDay: 7, duration: 60, status: "scheduled" },
];

export const campaignStatusTint: Record<CampaignStatus, { text: string; bg: string; ring: string; dot: string }> = {
  active: { text: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200", dot: "bg-emerald-500" },
  scheduled: { text: "text-sky-700", bg: "bg-sky-50", ring: "ring-sky-200", dot: "bg-sky-500" },
  completed: { text: "text-slate-600", bg: "bg-slate-100", ring: "ring-slate-200", dot: "bg-slate-400" },
  paused: { text: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-200", dot: "bg-amber-500" },
};

export const campaignChannelColor: Record<CampaignChannel, string> = {
  press: "#0ea5e9",
  social: "#a855f7",
  events: "#10b981",
  digital: "#f59e0b",
  investor: "#f43f5e",
  internal: "#64748b",
};

export const campaignsSummary = {
  active: campaigns.filter((c) => c.status === "active").length,
  scheduled: campaigns.filter((c) => c.status === "scheduled").length,
  completed: campaigns.filter((c) => c.status === "completed").length,
  totalReach: campaigns.reduce((s, c) => s + c.reach, 0),
  totalEngagement: campaigns.reduce((s, c) => s + c.engagement, 0),
  totalCost: campaigns.reduce((s, c) => s + c.cost, 0),
  avgRoi:
    Math.round(
      (campaigns.filter((c) => c.cost > 0).reduce((s, c) => s + campaignRoi(c), 0) /
        campaigns.filter((c) => c.cost > 0).length) *
        100,
    ) / 100,
  avgSentimentLift:
    Math.round(
      (campaigns.filter((c) => c.status !== "scheduled").reduce((s, c) => s + c.sentimentLift, 0) /
        campaigns.filter((c) => c.status !== "scheduled").length) *
        10,
    ) / 10,
};

/* ================================================================== */
/*  6. PRESS RELEASES (comms-press)                                    */
/* ================================================================== */

export type PressStatus = "draft" | "scheduled" | "published" | "embargoed";

export interface PressRelease {
  id: string;
  title: string;
  status: PressStatus;
  /** Publish ISO date (or scheduled). */
  publishDate: string;
  /** Distribution list size (outlets + journalists + wires). */
  distribution: number;
  /** Number of pickups (articles quoting the release). */
  pickups: number;
  /** Distinct outlets that picked up. */
  outletsReached: number;
  sentiment: Sentiment;
  /** Embargo lift time, if any. */
  embargoLift?: string;
  author: string;
  language: Language;
}

export const pressReleases: PressRelease[] = [
  {
    id: "PR-024",
    title: "HarchCorp reports Q3 2025 results — margin beat, guidance reaffirmed",
    status: "published",
    publishDate: isoDaysAgo(8),
    distribution: 248,
    pickups: 64,
    outletsReached: 42,
    sentiment: "positive",
    author: "P. Novak",
    language: "en",
  },
  {
    id: "PR-023",
    title: "Tangier Med partnership — HarchCorp Logistics expands Casablanca Free Zone footprint",
    status: "published",
    publishDate: isoDaysAgo(14),
    distribution: 312,
    pickups: 88,
    outletsReached: 56,
    sentiment: "positive",
    author: "P. Novak",
    language: "fr",
  },
  {
    id: "PR-022",
    title: "HarchCorp Capital closes €240M green bond offering",
    status: "published",
    publishDate: isoDaysAgo(21),
    distribution: 186,
    pickups: 38,
    outletsReached: 24,
    sentiment: "positive",
    author: "S. Dubois",
    language: "en",
  },
  {
    id: "PR-021",
    title: "Sustainability report 2025 — Scope 3 methodology and water stewardship update",
    status: "published",
    publishDate: isoDaysAgo(34),
    distribution: 224,
    pickups: 52,
    outletsReached: 38,
    sentiment: "neutral",
    author: "I. Mansouri",
    language: "fr",
  },
  {
    id: "PR-020",
    title: "Cyber incident response — customer notification and CNPDP 72h disclosure",
    status: "published",
    publishDate: isoDaysAgo(11),
    distribution: 412,
    pickups: 96,
    outletsReached: 72,
    sentiment: "negative",
    author: "P. Novak",
    language: "fr",
  },
  {
    id: "PR-019",
    title: "Innovation list — CTO named to annual Top 50",
    status: "published",
    publishDate: isoDaysAgo(28),
    distribution: 142,
    pickups: 28,
    outletsReached: 18,
    sentiment: "positive",
    author: "P. Novak",
    language: "en",
  },
  {
    id: "PR-025",
    title: "Marocaine de Distribution merger clearance — phase II notification",
    status: "embargoed",
    publishDate: isoDaysAhead(3),
    embargoLift: isoDaysAhead(3),
    distribution: 296,
    pickups: 0,
    outletsReached: 0,
    sentiment: "neutral",
    author: "C. Petit",
    language: "fr",
  },
  {
    id: "PR-026",
    title: "OCP joint venture — phosphate processing R&D center announcement",
    status: "scheduled",
    publishDate: isoDaysAhead(9),
    distribution: 218,
    pickups: 0,
    outletsReached: 0,
    sentiment: "positive",
    author: "I. Mansouri",
    language: "fr",
  },
  {
    id: "PR-027",
    title: "Q4 sustainability-linked loan upsizing — €180M facility signed",
    status: "draft",
    publishDate: isoDaysAhead(14),
    distribution: 0,
    pickups: 0,
    outletsReached: 0,
    sentiment: "neutral",
    author: "S. Dubois",
    language: "en",
  },
  {
    id: "PR-028",
    title: "Internal town hall — Q4 strategy alignment summary",
    status: "draft",
    publishDate: isoDaysAhead(2),
    distribution: 0,
    pickups: 0,
    outletsReached: 0,
    sentiment: "neutral",
    author: "P. Novak",
    language: "fr",
  },
  {
    id: "PR-029",
    title: "HarchCorp Labs — AI co-innovation partnership with OCP subsidiary",
    status: "draft",
    publishDate: isoDaysAhead(21),
    distribution: 0,
    pickups: 0,
    outletsReached: 0,
    sentiment: "positive",
    author: "P. Novak",
    language: "fr",
  },
];

export const pressStatusTint: Record<PressStatus, { text: string; bg: string; ring: string; dot: string }> = {
  draft: { text: "text-slate-600", bg: "bg-slate-100", ring: "ring-slate-200", dot: "bg-slate-400" },
  scheduled: { text: "text-sky-700", bg: "bg-sky-50", ring: "ring-sky-200", dot: "bg-sky-500" },
  published: { text: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200", dot: "bg-emerald-500" },
  embargoed: { text: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-200", dot: "bg-amber-500" },
};

/** Counts for status donut. */
export const pressStatusCounts = (["draft", "scheduled", "published", "embargoed"] as PressStatus[]).map((s) => ({
  status: s,
  count: pressReleases.filter((r) => r.status === s).length,
}));

export interface PickupByOutlet {
  outlet: string;
  pickups: number;
}

export const pickupByOutlet: PickupByOutlet[] = [
  { outlet: "Reuters", pickups: 28 },
  { outlet: "L'Économiste", pickups: 24 },
  { outlet: "Bloomberg", pickups: 22 },
  { outlet: "Le Matin", pickups: 18 },
  { outlet: "Medias24", pickups: 16 },
  { outlet: "Hespress", pickups: 14 },
  { outlet: "Financial Times", pickups: 12 },
  { outlet: "Aujourd'hui le Maroc", pickups: 11 },
  { outlet: "TelQuel", pickups: 9 },
  { outlet: "Morocco World News", pickups: 8 },
];

export const pressSummary = {
  total: pressReleases.length,
  published: pressReleases.filter((r) => r.status === "published").length,
  drafts: pressReleases.filter((r) => r.status === "draft").length,
  scheduled: pressReleases.filter((r) => r.status === "scheduled").length,
  embargoed: pressReleases.filter((r) => r.status === "embargoed").length,
  totalPickups: pressReleases.reduce((s, r) => s + r.pickups, 0),
  totalOutlets: pressReleases.reduce((s, r) => s + r.outletsReached, 0),
  avgDistribution: Math.round(pressReleases.filter((r) => r.distribution > 0).reduce((s, r) => s + r.distribution, 0) / pressReleases.filter((r) => r.distribution > 0).length),
  /** Pickups per 100 distributed copies (published releases only). */
  pickupRate: (() => {
    const published = pressReleases.filter((r) => r.status === "published");
    const totalDist = published.reduce((s, r) => s + r.distribution, 0);
    const totalPickups = published.reduce((s, r) => s + r.pickups, 0);
    if (totalDist <= 0) return 0;
    return Math.round((totalPickups / totalDist) * 1000) / 10;
  })(),
};

/* ================================================================== */
/*  7. SOCIAL LISTENING (comms-social)                                 */
/* ================================================================== */

export type Platform = "twitter" | "linkedin" | "facebook" | "instagram" | "youtube" | "tiktok";

export interface SocialMention {
  id: string;
  platform: Platform;
  author: string;
  handle: string;
  /** Snippet of the post content. */
  content: string;
  timestamp: string;
  reach: number;
  engagement: number;
  sentiment: Sentiment;
  /** 0–100 virality score. */
  virality: number;
}

const mentionsBank: { platform: Platform; author: string; handle: string; content: string; sentiment: Sentiment }[] = [
  { platform: "twitter", author: "Yassine El Idrissi", handle: "@yelidrissi", content: "HarchCorp's Q3 results are strong — margin beat + reaffirmed guidance. Logistics EU segment carrying the print. 📈", sentiment: "positive" },
  { platform: "linkedin", author: "Salma Bennani", handle: "@salma-bennani", content: "Pleased to see HarchCorp's water stewardship pilot earn regional endorsement. Sustainability leadership in action.", sentiment: "positive" },
  { platform: "twitter", author: "Marc Petit", handle: "@marcpetit", content: "The CFG Bank AML inquiry is broader than the company admits. Net exposure could be material. Watching closely.", sentiment: "negative" },
  { platform: "facebook", author: "Hespress Reader", handle: "@hespress_reader", content: "Cyber incident + PII concerns — HarchCorp needs to be more transparent with customers. The 72h notification should have been clearer.", sentiment: "negative" },
  { platform: "instagram", author: "Casablanca Daily", handle: "@casa.daily", content: "Behind the scenes at HarchCorp's Tangier Med automated distribution hub — 1,200 new jobs incoming. 🏭", sentiment: "positive" },
  { platform: "youtube", author: "Finance Maroc", handle: "@finance-maroc", content: "Analyse des résultats Q3 HarchCorp — battage médiatique ou vraie performance? On décompose segment par segment.", sentiment: "neutral" },
  { platform: "linkedin", author: "Mehdi Tazi", handle: "@mehdi-tazi", content: "Innovation list naming HarchCorp CTO to Top 50 — well deserved. The AI co-innovation with OCP subsidiary is the real story.", sentiment: "positive" },
  { platform: "twitter", author: "Priya Nair", handle: "@priya_nair", content: "Executive pay disclosure at HarchCorp is striking. Worker-to-CEO ratio wider than European peers. Board should respond.", sentiment: "negative" },
  { platform: "tiktok", author: "Casa Vibes", handle: "@casavibes", content: "HarchCorp just opened the Tangier Med hub — full tour in 60 seconds! #Casablanca #TangierMed", sentiment: "positive" },
  { platform: "twitter", author: "Karim Berrada", handle: "@kberrada", content: "Re: Q3 earnings — services-segment margin is the question. Roadshow narrative is good but analyst pushback on guidance is real.", sentiment: "neutral" },
  { platform: "linkedin", author: "Inès Mansouri", handle: "@ines-mansouri", content: "Proud of the HarchCorp team — sustainability-linked loan upsized to €180M. Strong demand from ESG-focused investors.", sentiment: "positive" },
  { platform: "facebook", author: "Aujourd'hui le Maroc Reader", handle: "@aujourdhui_reader", content: "Marocaine de Distribution merger clearance — phase II notification suggests the Competition Council has concerns. Watching.", sentiment: "neutral" },
  { platform: "instagram", author: "Morocco World News", handle: "@moroccoworldnews", content: "HarchCorp Capital closes €240M green bond — largest corporate green bond from a Moroccan issuer this year. 🌱", sentiment: "positive" },
  { platform: "twitter", author: "Sofia Rossi", handle: "@sofia_rossi", content: "Cyber incident response at HarchCorp looks competent — 72h CNPDP notification filed, customer notification drafted. Good crisis comms.", sentiment: "positive" },
  { platform: "youtube", author: "L'Économiste TV", handle: "@leconomiste-tv", content: "Spécial HarchCorp — édition du jour: résultats Q3, partenariat Tangier Med, et mise au point sur l'incident cyber.", sentiment: "neutral" },
  { platform: "twitter", author: "Omar Cherkaoui", handle: "@ocherkaoui", content: "Patent ruling partially overturned — HarchCorp IP position stronger than expected. Underreported story this week.", sentiment: "positive" },
  { platform: "linkedin", author: "Camille Petit", handle: "@camille-petit", content: "Internal town hall Q4 strategy alignment — clear messaging from leadership on cyber response + Tangier Med expansion.", sentiment: "positive" },
];

function buildSocialMentions(): SocialMention[] {
  return mentionsBank.map((m, i) => {
    const hoursAgo = (i * 47) % 96;
    const reachBase = m.platform === "twitter" ? 18_000 : m.platform === "linkedin" ? 12_000 : m.platform === "facebook" ? 24_000 : m.platform === "instagram" ? 32_000 : m.platform === "youtube" ? 56_000 : 88_000;
    const reach = reachBase + ((i * 137) % reachBase);
    const engagement = Math.round(reach * (0.02 + ((i % 5) * 0.008)));
    const virality = Math.min(100, Math.round(20 + (engagement / Math.max(1, reach)) * 200 + (i % 7) * 4));
    return {
      id: `SOC-${String(i + 1).padStart(4, "0")}`,
      platform: m.platform,
      author: m.author,
      handle: m.handle,
      content: m.content,
      timestamp: isoHoursAgo(hoursAgo),
      reach,
      engagement,
      sentiment: m.sentiment,
      virality,
    };
  }).sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
}

export const socialMentions: SocialMention[] = buildSocialMentions();

export interface MentionsByPlatform {
  platform: Platform;
  mentions: number;
  reach: number;
  engagement: number;
}

export const mentionsByPlatform: MentionsByPlatform[] = (() => {
  const map = new Map<Platform, MentionsByPlatform>();
  for (const m of socialMentions) {
    const ex = map.get(m.platform);
    if (ex) {
      ex.mentions += 1;
      ex.reach += m.reach;
      ex.engagement += m.engagement;
    } else {
      map.set(m.platform, { platform: m.platform, mentions: 1, reach: m.reach, engagement: m.engagement });
    }
  }
  // Ensure all 6 platforms appear (even if zero in the sample)
  const allPlatforms: Platform[] = ["twitter", "linkedin", "facebook", "instagram", "youtube", "tiktok"];
  for (const p of allPlatforms) {
    if (!map.has(p)) map.set(p, { platform: p, mentions: 0, reach: 0, engagement: 0 });
  }
  return allPlatforms.map((p) => map.get(p)!);
})();

export interface TopInfluencer {
  handle: string;
  name: string;
  platform: Platform;
  followers: number;
  mentions: number;
  avgSentiment: number; // -100..+100
}

export const topInfluencers: TopInfluencer[] = [
  { handle: "@finance-maroc", name: "Finance Maroc", platform: "youtube", followers: 248_000, mentions: 14, avgSentiment: +12 },
  { handle: "@leconomiste-tv", name: "L'Économiste TV", platform: "youtube", followers: 186_000, mentions: 11, avgSentiment: +6 },
  { handle: "@casavibes", name: "Casa Vibes", platform: "tiktok", followers: 412_000, mentions: 9, avgSentiment: +38 },
  { handle: "@casa.daily", name: "Casablanca Daily", platform: "instagram", followers: 318_000, mentions: 8, avgSentiment: +28 },
  { handle: "@moroccoworldnews", name: "Morocco World News", platform: "instagram", followers: 524_000, mentions: 7, avgSentiment: +18 },
  { handle: "@mehdi-tazi", name: "Mehdi Tazi", platform: "linkedin", followers: 86_000, mentions: 6, avgSentiment: +44 },
  { handle: "@ines-mansouri", name: "Inès Mansouri", platform: "linkedin", followers: 64_000, mentions: 5, avgSentiment: +52 },
  { handle: "@yelidrissi", name: "Yassine El Idrissi", platform: "twitter", followers: 42_000, mentions: 6, avgSentiment: +36 },
  { handle: "@kberrada", name: "Karim Berrada", platform: "twitter", followers: 38_000, mentions: 5, avgSentiment: +4 },
  { handle: "@sofia_rossi", name: "Sofia Rossi", platform: "twitter", followers: 28_000, mentions: 4, avgSentiment: +22 },
];

export interface ViralityDay {
  day: string;
  volume: number;
  highVirality: number;
}

export const viralityTimeline7d: ViralityDay[] = (() => {
  const out: ViralityDay[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date("2025-11-15T00:00:00Z");
    d.setDate(d.getDate() - i);
    const t = 6 - i;
    const spike = t === 3 ? 24 : 0; // mid-week spike
    out.push({
      day: d.toISOString().slice(5, 10),
      volume: Math.round(180 + 40 * Math.sin(t / 1.4) + (t % 3) * 18 + spike),
      highVirality: Math.round(28 + 14 * Math.cos(t / 1.7) + (t % 4) * 6 + spike / 2),
    });
  }
  return out;
})();

export interface Hashtag {
  tag: string;
  count: number;
  sentiment: Sentiment;
}

export const topHashtags: Hashtag[] = [
  { tag: "#HarchCorp", count: 1284, sentiment: "positive" },
  { tag: "#TangierMed", count: 642, sentiment: "positive" },
  { tag: "#CasablancaFreeZone", count: 486, sentiment: "positive" },
  { tag: "#Q3Results", count: 412, sentiment: "neutral" },
  { tag: "#CyberIncident", count: 388, sentiment: "negative" },
  { tag: "#CFG", count: 318, sentiment: "negative" },
  { tag: "#Sustainability", count: 296, sentiment: "positive" },
  { tag: "#GreenBond", count: 248, sentiment: "positive" },
  { tag: "#OCP", count: 218, sentiment: "neutral" },
  { tag: "#ExecPay", count: 184, sentiment: "negative" },
  { tag: "#InnovationList", count: 162, sentiment: "positive" },
  { tag: "#AML", count: 142, sentiment: "negative" },
];

export const platformMeta: Record<Platform, { label: string; color: string }> = {
  twitter: { label: "Twitter / X", color: "#0f172a" },
  linkedin: { label: "LinkedIn", color: "#0ea5e9" },
  facebook: { label: "Facebook", color: "#3b82f6" },
  instagram: { label: "Instagram", color: "#a855f7" },
  youtube: { label: "YouTube", color: "#f43f5e" },
  tiktok: { label: "TikTok", color: "#14b8a6" },
};

export const socialSummary = {
  totalMentions: socialMentions.length,
  totalReach: socialMentions.reduce((s, m) => s + m.reach, 0),
  totalEngagement: socialMentions.reduce((s, m) => s + m.engagement, 0),
  positive: socialMentions.filter((m) => m.sentiment === "positive").length,
  negative: socialMentions.filter((m) => m.sentiment === "negative").length,
  highVirality: socialMentions.filter((m) => m.virality >= 60).length,
  topInfluencers: topInfluencers.length,
};

/* ================================================================== */
/*  8. EMERGING TOPICS (comms-overview)                                */
/* ================================================================== */

export interface EmergingTopic {
  id: string;
  topic: string;
  /** Volume in the last 7 days. */
  volume7d: number;
  /** % change vs prior 7d. */
  delta: number;
  sentiment: Sentiment;
  pillar: "Regulatory" | "Financial" | "ESG" | "Cyber" | "Reputational" | "Operational";
}

export const emergingTopics: EmergingTopic[] = [
  { id: "ETP-001", topic: "Tangier Med automated hub tour", volume7d: 486, delta: +186, sentiment: "positive", pillar: "Operational" },
  { id: "ETP-002", topic: "Cyber incident — customer PII", volume7d: 412, delta: +124, sentiment: "negative", pillar: "Cyber" },
  { id: "ETP-003", topic: "Q3 earnings beat — margin reaffirmed", volume7d: 388, delta: +96, sentiment: "positive", pillar: "Financial" },
  { id: "ETP-004", topic: "CFG Bank AML — analyst note pickup", volume7d: 312, delta: +68, sentiment: "negative", pillar: "Regulatory" },
  { id: "ETP-005", topic: "Water stewardship pilot endorsement", volume7d: 248, delta: +52, sentiment: "positive", pillar: "ESG" },
];

/* ------------------------------------------------------------------ */
/*  Aggregate comms overview summary                                   */
/* ------------------------------------------------------------------ */

export const commsOverview = {
  reputationScore: reputationSummary.current,
  reputationDelta: reputationSummary.delta30d,
  netSentiment: sentimentSummary.netSentiment,
  sovHarch: sovSummary.harchShare,
  sovDelta: sovSummary.harchDelta30d,
  coverage30d: coverageVolume30d.reduce((s, d) => s + d.positive + d.neutral + d.negative, 0),
  activeCampaigns: campaignsSummary.active,
  socialMentions: socialSummary.totalMentions,
  socialReach: socialSummary.totalReach,
  publishedReleases: pressSummary.published,
  draftReleases: pressSummary.drafts,
  nps: reputationSummary.nps,
};
