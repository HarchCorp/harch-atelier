/**
 * Harch Atelier — Mock intelligence dataset (V12.0)
 *
 * Stand-in data for the Enterprise Risk Intelligence UI. In production these
 * shapes are populated by the GLMAnalysis / Alert / Watchlist tables via the
 * API. Here they are deterministic so every chart renders on first paint.
 *
 * Strict typing — no `any`.
 */

export type AccountType =
  | "admin"
  | "trader"
  | "legal"
  | "market"
  | "self"
  | "pr";

export type Sentiment = "positive" | "negative" | "neutral";

export type Severity = "critical" | "high" | "medium" | "low";

/** A single risk signal plotted on the Risk Matrix. */
export interface RiskPoint {
  id: string;
  name: string;
  /** 0–100, how frequently the signal recurs in coverage. */
  frequency: number;
  /** 0–100, estimated media / reputational impact. */
  mediaImpact: number;
  /** Volume of articles backing this signal in the last 30d. */
  articles: number;
  severity: Severity;
  pillar: RiskPillar;
  /** Region code — used by the drawer breadcrumb for scatter-bubble events. */
  region: string;
}

export type RiskPillar =
  | "Regulatory"
  | "Cyber"
  | "Financial"
  | "ESG"
  | "Geopolitical"
  | "Reputational";

export interface ShareOfVoiceSlice {
  name: string;
  value: number; // article count
  isTarget: boolean;
}

export interface CoverageDay {
  date: string; // ISO short
  positive: number;
  negative: number;
}

export interface SentimentMonth {
  month: string; // short label
  positive: number;
  negative: number;
}

export interface RiskEvent {
  id: string;
  date: string; // ISO short
  pillar: RiskPillar;
  title: string;
  articles: number;
  sentiment: Sentiment;
  severity: Severity;
  /** Region code (NA, EU, APAC, MEA, LATAM) — used for geographic filtering + breadcrumb. */
  region: string;
}

export interface WatchlistSignal {
  id: string;
  ticker: string;
  entity: string;
  signal: string;
  pillar: RiskPillar;
  severity: Severity;
  delta: number; // sentiment delta vs previous session
  articles: number;
  updatedAt: string;
}

/* ------------------------------------------------------------------ */
/*  Risk Matrix                                                        */
/* ------------------------------------------------------------------ */

export const riskPoints: RiskPoint[] = [
  { id: "RSK-0481", name: "SEC 10-K restatement inquiry", frequency: 78, mediaImpact: 91, articles: 412, severity: "critical", pillar: "Regulatory", region: "NA" },
  { id: "RSK-0472", name: "Ransomware payload on EU logistics", frequency: 64, mediaImpact: 88, articles: 327, severity: "critical", pillar: "Cyber", region: "EU" },
  { id: "RSK-0455", name: "Insider trading allegations", frequency: 41, mediaImpact: 84, articles: 238, severity: "high", pillar: "Financial", region: "NA" },
  { id: "RSK-0448", name: "Scope-3 emissions misreporting", frequency: 33, mediaImpact: 76, articles: 191, severity: "high", pillar: "ESG", region: "EU" },
  { id: "RSK-0431", name: "Export-control probe (APAC)", frequency: 57, mediaImpact: 71, articles: 286, severity: "high", pillar: "Geopolitical", region: "APAC" },
  { id: "RSK-0419", name: "CEO social-media controversy", frequency: 49, mediaImpact: 69, articles: 174, severity: "high", pillar: "Reputational", region: "NA" },
  { id: "RSK-0402", name: "Supplier labor-law lawsuit", frequency: 28, mediaImpact: 63, articles: 132, severity: "medium", pillar: "ESG", region: "APAC" },
  { id: "RSK-0388", name: "Patent infringement (District Ct.)", frequency: 22, mediaImpact: 58, articles: 98, severity: "medium", pillar: "Financial", region: "NA" },
  { id: "RSK-0375", name: "Cloud region outage — US-East", frequency: 38, mediaImpact: 44, articles: 119, severity: "medium", pillar: "Cyber", region: "NA" },
  { id: "RSK-0361", name: "FX hedging disclosure gap", frequency: 19, mediaImpact: 51, articles: 77, severity: "medium", pillar: "Financial", region: "EU" },
  { id: "RSK-0349", name: "Board composition criticism", frequency: 12, mediaImpact: 47, articles: 54, severity: "low", pillar: "Reputational", region: "NA" },
  { id: "RSK-0333", name: "Trade-secret claim (supplier)", frequency: 9, mediaImpact: 38, articles: 41, severity: "low", pillar: "Financial", region: "NA" },
  { id: "RSK-0320", name: "Diversity report backlash", frequency: 16, mediaImpact: 29, articles: 63, severity: "low", pillar: "ESG", region: "NA" },
  { id: "RSK-0308", name: "Sanctions list naming error", frequency: 71, mediaImpact: 24, articles: 221, severity: "medium", pillar: "Geopolitical", region: "APAC" },
  { id: "RSK-0294", name: "App-store policy complaint", frequency: 53, mediaImpact: 18, articles: 158, severity: "low", pillar: "Reputational", region: "NA" },
  { id: "RSK-0281", name: "Greenwashing op-ed pickup", frequency: 84, mediaImpact: 33, articles: 264, severity: "medium", pillar: "ESG", region: "EU" },
];

/* ------------------------------------------------------------------ */
/*  Share of Voice (target vs competitors)                             */
/* ------------------------------------------------------------------ */

export const shareOfVoice: ShareOfVoiceSlice[] = [
  { name: "HarchCorp", value: 1284, isTarget: true },
  { name: "Northwind", value: 842, isTarget: false },
  { name: "Vela Dynamics", value: 617, isTarget: false },
  { name: "Orbital Systems", value: 438, isTarget: false },
  { name: "Kessler & Vale", value: 293, isTarget: false },
  { name: "Other", value: 412, isTarget: false },
];

/* ------------------------------------------------------------------ */
/*  Media Coverage — last 30 days                                      */
/* ------------------------------------------------------------------ */

function isoDaysAgo(days: number): string {
  const d = new Date(2025, 0, 31); // anchored reference date for deterministic output
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export const coverage30d: CoverageDay[] = Array.from({ length: 30 }, (_, i) => {
  const day = 29 - i;
  // deterministic pseudo-pattern so the chart looks alive but is stable
  const positive = Math.round(38 + 22 * Math.sin(i / 2.3) + 14 * Math.cos(i / 1.1) + (i % 5));
  const negative = Math.round(26 + 19 * Math.sin(i / 1.7 + 1) + 11 * Math.cos(i / 3.1) - (i % 4));
  return {
    date: isoDaysAgo(day),
    positive: Math.max(8, positive),
    negative: Math.max(4, negative),
  };
});

/* ------------------------------------------------------------------ */
/*  Sentiment Trend — 12 months                                        */
/* ------------------------------------------------------------------ */

const monthLabels = ["Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan"];

export const sentiment12m: SentimentMonth[] = monthLabels.map((month, i) => {
  const positive = Math.round(120 + 55 * Math.sin(i / 1.4) + 20 * Math.cos(i / 2.6));
  const negative = Math.round(95 + 48 * Math.sin(i / 1.9 + 0.8) + 16 * Math.cos(i / 3.3));
  return { month, positive: Math.max(40, positive), negative: Math.max(30, negative) };
});

/* ------------------------------------------------------------------ */
/*  Risk Events Table                                                  */
/* ------------------------------------------------------------------ */

export const riskEvents: RiskEvent[] = [
  { id: "EVT-9821", date: "2025-01-29", pillar: "Regulatory", title: "SEC opens informal inquiry into Q4 revenue recognition", articles: 86, sentiment: "negative", severity: "critical", region: "NA" },
  { id: "EVT-9814", date: "2025-01-29", pillar: "Cyber", title: "Ransomware affiliate claims exfiltration of 2.1 TB logistics data", articles: 74, sentiment: "negative", severity: "critical", region: "EU" },
  { id: "EVT-9802", date: "2025-01-28", pillar: "Geopolitical", title: "Export-control authority requests documentation on APAC shipments", articles: 63, sentiment: "negative", severity: "high", region: "APAC" },
  { id: "EVT-9795", date: "2025-01-28", pillar: "ESG", title: "NGO report disputes Scope-3 emissions methodology in annual filing", articles: 58, sentiment: "negative", severity: "high", region: "EU" },
  { id: "EVT-9783", date: "2025-01-27", pillar: "Reputational", title: "Major outlet runs op-ed critical of board refresh process", articles: 47, sentiment: "negative", severity: "medium", region: "NA" },
  { id: "EVT-9771", date: "2025-01-27", pillar: "Financial", title: "Analyst downgrade cites margin compression in services segment", articles: 41, sentiment: "negative", severity: "medium", region: "NA" },
  { id: "EVT-9764", date: "2025-01-26", pillar: "Cyber", title: "Cloud region outage triggers SLA breach notices for enterprise tier", articles: 39, sentiment: "neutral", severity: "medium", region: "NA" },
  { id: "EVT-9758", date: "2025-01-26", pillar: "Regulatory", title: "EU privacy regulator extends retention-period review by 60 days", articles: 34, sentiment: "neutral", severity: "low", region: "EU" },
  { id: "EVT-9749", date: "2025-01-25", pillar: "ESG", title: "Supplier labor audit publishes conditional pass with remediation plan", articles: 31, sentiment: "positive", severity: "low", region: "APAC" },
  { id: "EVT-9736", date: "2025-01-25", pillar: "Financial", title: "Patent infringement ruling partially overturned on appeal", articles: 28, sentiment: "positive", severity: "medium", region: "NA" },
  { id: "EVT-9722", date: "2025-01-24", pillar: "Geopolitical", title: "Sanctions screening vendor confirms false-positive naming error", articles: 26, sentiment: "positive", severity: "low", region: "APAC" },
  { id: "EVT-9710", date: "2025-01-24", pillar: "Reputational", title: "Trade publication names CTO to annual innovation list", articles: 22, sentiment: "positive", severity: "low", region: "NA" },
  { id: "EVT-9704", date: "2025-01-23", pillar: "Financial", title: "Insider trading complaint amended; named individual departs firm", articles: 19, sentiment: "negative", severity: "high", region: "NA" },
  { id: "EVT-9691", date: "2025-01-23", pillar: "ESG", title: "Regional minister endorses water-stewardship pilot at facility 04", articles: 17, sentiment: "positive", severity: "low", region: "MEA" },
];

/* ------------------------------------------------------------------ */
/*  Watchlist Signals (trader view)                                    */
/* ------------------------------------------------------------------ */

export const watchlistSignals: WatchlistSignal[] = [
  { id: "WL-001", ticker: "HRCH", entity: "HarchCorp", signal: "SEC inquiry — revenue recognition", pillar: "Regulatory", severity: "critical", delta: -3.4, articles: 86, updatedAt: "12m ago" },
  { id: "WL-002", ticker: "HRCH", entity: "HarchCorp", signal: "Ransomware claim — logistics data", pillar: "Cyber", severity: "critical", delta: -2.1, articles: 74, updatedAt: "24m ago" },
  { id: "WL-003", ticker: "HRCH", entity: "HarchCorp", signal: "Analyst downgrade — services margin", pillar: "Financial", severity: "high", delta: -1.7, articles: 41, updatedAt: "1h ago" },
  { id: "WL-004", ticker: "HRCH", entity: "HarchCorp", signal: "Export-control documentation request", pillar: "Geopolitical", severity: "high", delta: -0.9, articles: 63, updatedAt: "2h ago" },
  { id: "WL-005", ticker: "HRCH", entity: "HarchCorp", signal: "NGO Scope-3 methodology dispute", pillar: "ESG", severity: "high", delta: -0.6, articles: 58, updatedAt: "3h ago" },
  { id: "WL-006", ticker: "HRCH", entity: "HarchCorp", signal: "Patent ruling partially overturned", pillar: "Financial", severity: "medium", delta: +1.2, articles: 28, updatedAt: "5h ago" },
  { id: "WL-007", ticker: "HRCH", entity: "HarchCorp", signal: "Supplier labor audit — conditional pass", pillar: "ESG", severity: "low", delta: +0.4, articles: 31, updatedAt: "6h ago" },
  { id: "WL-008", ticker: "HRCH", entity: "HarchCorp", signal: "Innovation list — CTO named", pillar: "Reputational", severity: "low", delta: +0.3, articles: 22, updatedAt: "8h ago" },
];

/* ------------------------------------------------------------------ */
/*  Severity / sentiment color tokens (single source of truth)         */
/* ------------------------------------------------------------------ */

export const severityColor: Record<Severity, { text: string; bg: string; dot: string; ring: string }> = {
  critical: { text: "text-rose-700", bg: "bg-rose-50", dot: "bg-rose-500", ring: "ring-rose-200" },
  high: { text: "text-orange-700", bg: "bg-orange-50", dot: "bg-orange-500", ring: "ring-orange-200" },
  medium: { text: "text-amber-700", bg: "bg-amber-50", dot: "bg-amber-400", ring: "ring-amber-200" },
  low: { text: "text-slate-600", bg: "bg-slate-100", dot: "bg-slate-400", ring: "ring-slate-200" },
};

export const sentimentColor: Record<Sentiment, { text: string; bg: string; dot: string }> = {
  positive: { text: "text-emerald-700", bg: "bg-emerald-50", dot: "bg-emerald-500" },
  negative: { text: "text-rose-700", bg: "bg-rose-50", dot: "bg-rose-500" },
  neutral: { text: "text-slate-600", bg: "bg-slate-100", dot: "bg-slate-400" },
};

/* ------------------------------------------------------------------ */
/*  Aggregate headline KPIs (top strip)                                */
/* ------------------------------------------------------------------ */

export const headlineKpis = {
  riskIndex: 72.4,
  riskIndexDelta: +4.1,
  coverage30d: coverage30d.reduce((s, d) => s + d.positive + d.negative, 0),
  coverageDelta: +12.3,
  negativeShare: Math.round(
    (coverage30d.reduce((s, d) => s + d.negative, 0) /
      coverage30d.reduce((s, d) => s + d.positive + d.negative, 0)) *
      100,
  ),
  negativeShareDelta: +2.8,
  activeAlerts: 17,
  alertsDelta: +5,
};

export const navByAccountType: Record<AccountType, { label: string; href: string }[]> = {
  admin: [
    { label: "Overview", href: "#overview" },
    { label: "Risk Matrix", href: "#matrix" },
    { label: "Coverage", href: "#coverage" },
    { label: "Alerts", href: "#alerts" },
    { label: "Entities", href: "#entities" },
    { label: "Audit Log", href: "#audit" },
    { label: "Settings", href: "#settings" },
  ],
  trader: [
    { label: "Signals", href: "#signals" },
    { label: "Risk Matrix", href: "#matrix" },
    { label: "Coverage", href: "#coverage" },
    { label: "Watchlist", href: "#watchlist" },
    { label: "Alerts", href: "#alerts" },
  ],
  legal: [
    { label: "Overview", href: "#overview" },
    { label: "Regulatory", href: "#regulatory" },
    { label: "Matters", href: "#matters" },
    { label: "Hold Notices", href: "#holds" },
    { label: "Alerts", href: "#alerts" },
  ],
  market: [
    { label: "Overview", href: "#overview" },
    { label: "Risk Matrix", href: "#matrix" },
    { label: "Coverage", href: "#coverage" },
    { label: "Sentiment", href: "#sentiment" },
    { label: "Share of Voice", href: "#sov" },
    { label: "Alerts", href: "#alerts" },
  ],
  self: [
    { label: "Overview", href: "#overview" },
    { label: "Coverage", href: "#coverage" },
    { label: "Alerts", href: "#alerts" },
  ],
  pr: [
    { label: "Overview", href: "#overview" },
    { label: "Sentiment", href: "#sentiment" },
    { label: "Share of Voice", href: "#sov" },
    { label: "Coverage", href: "#coverage" },
    { label: "Alerts", href: "#alerts" },
  ],
};

/* ------------------------------------------------------------------ */
/*  Articles — drill-down dataset for the RiskEventDrawer              */
/* ------------------------------------------------------------------ */

export type ArticleTier = "tier1" | "tier2" | "tier3";

export interface Article {
  id: string;
  eventId: string;
  headline: string;
  source: string;
  /** outlet tier — tier1 = top-tier financial/legacy press. */
  tier: ArticleTier;
  url: string;
  publishedAt: string; // ISO
  sentiment: Sentiment;
  reach: number; // estimated readers / followers
  language: "en" | "fr" | "de" | "es" | "zh";
}

const outlets = [
  { name: "Financial Times", tier: "tier1" as const, reach: 4_200_000 },
  { name: "Reuters", tier: "tier1" as const, reach: 8_900_000 },
  { name: "Bloomberg", tier: "tier1" as const, reach: 6_100_000 },
  { name: "Wall Street Journal", tier: "tier1" as const, reach: 3_800_000 },
  { name: "The Economist", tier: "tier1" as const, reach: 1_650_000 },
  { name: "Le Monde", tier: "tier1" as const, reach: 2_100_000 },
  { name: "Handelsblatt", tier: "tier2" as const, reach: 980_000 },
  { name: "TechCrunch", tier: "tier2" as const, reach: 1_400_000 },
  { name: "The Information", tier: "tier2" as const, reach: 320_000 },
  { name: "S&P Global", tier: "tier2" as const, reach: 760_000 },
  { name: "GlobalData", tier: "tier3" as const, reach: 180_000 },
  { name: "OSINT Wire", tier: "tier3" as const, reach: 95_000 },
  { name: "Sector Monitor", tier: "tier3" as const, reach: 140_000 },
];

const headlineBank: Record<RiskPillar, string[]> = {
  Regulatory: [
    "Regulator confirms informal inquiry into Q4 revenue recognition practices",
    "Compliance filing reveals expanded scope of disclosure review",
    "Securities authority requests additional documentation on segment reporting",
    "Legal counsel issues statement on cooperative posture with inquiry",
  ],
  Cyber: [
    "Ransomware affiliate posts sample data as proof of exfiltration",
    "Security researchers link incident to known threat-actor cluster",
    "Incident response firm engaged; containment timeline under review",
    "Customer notification drafted; regulator briefed within 72h window",
  ],
  Financial: [
    "Sell-side analyst downgrades on margin compression signals",
    "Earnings revision cites services-segment softness and FX headwinds",
    "Bondholders seek clarification on covenant headroom",
    "Hedge funds build defensive positions ahead of print",
  ],
  ESG: [
    "NGO report challenges methodology behind Scope-3 disclosure",
    "Investor coalition files shareholder proposal on transition plan",
    "Audit firm issues conditional pass with remediation milestones",
    "Regional minister endorses water-stewardship pilot at facility",
  ],
  Geopolitical: [
    "Export-control authority requests documentation on APAC shipments",
    "Sanctions screening vendor confirms false-positive naming error",
    "Trade ministry requests briefing on dual-use classification",
    "Customs hold lifted pending classification review",
  ],
  Reputational: [
    "Op-ed criticizes board refresh cadence and independence",
    "Trade publication names CTO to annual innovation list",
    "Social-media controversy drives spike in negative mentions",
    "Diversity report draws mixed coverage across outlets",
  ],
};

const languages: Article["language"][] = ["en", "en", "en", "en", "fr", "de", "es", "zh"];

function buildArticlesForEvent(ev: RiskEvent, count: number): Article[] {
  const heads = headlineBank[ev.pillar];
  return Array.from({ length: count }, (_, i) => {
    const outlet = outlets[(i + ev.title.length) % outlets.length];
    const head = heads[(i + ev.id.length) % heads.length];
    const daysAgo = i % 6;
    const d = new Date(2025, 0, 29 - daysAgo, 8 + (i % 10), (i * 7) % 60);
    const sentimentRoll = (i + ev.articles) % 10;
    const sentiment: Sentiment =
      ev.sentiment === "negative"
        ? sentimentRoll < 7
          ? "negative"
          : sentimentRoll < 9
            ? "neutral"
            : "positive"
        : ev.sentiment === "positive"
          ? sentimentRoll < 7
            ? "positive"
            : "neutral"
          : "neutral";
    return {
      id: `ART-${ev.id.replace("EVT-", "")}-${String(i + 1).padStart(3, "0")}`,
      eventId: ev.id,
      headline: head,
      source: outlet.name,
      tier: outlet.tier,
      url: "#",
      publishedAt: d.toISOString(),
      sentiment,
      reach: outlet.reach - (i % 5) * 12000,
      language: languages[(i + ev.pillar.length) % languages.length],
    };
  });
}

/** Pre-computed article pool keyed by event id — stable across renders. */
export const articlesByEvent: Record<string, Article[]> = Object.fromEntries(
  riskEvents.map((ev) => [ev.id, buildArticlesForEvent(ev, Math.min(12, ev.articles))]),
);

/** Affected entities per event (for the drawer chips). */
export const entitiesByEvent: Record<string, string[]> = Object.fromEntries(
  riskEvents.map((ev, i) => [
    ev.id,
    ["HarchCorp", "HarchCorp Logistics", "HarchCorp Capital", "HarchCorp Labs", "Facility 04", "APAC Sub"]
      .slice(0, ((i % 3) + 2)),
  ]),
);

/** Reverse index: entity name → list of related risk events. Powers the EntityProfileDialog. */
export const entityIndex: Map<string, RiskEvent[]> = (() => {
  const m = new Map<string, RiskEvent[]>();
  for (const ev of riskEvents) {
    const ents = entitiesByEvent[ev.id] ?? [];
    for (const e of ents) {
      if (!m.has(e)) m.set(e, []);
      m.get(e)!.push(ev);
    }
  }
  return m;
})();

/** Sorted list of all entity names (for the command palette search). */
export const entitiesList: string[] = [...entityIndex.keys()].sort();

/** Get genuinely related events for an entity (no heuristic). */
export function getEventsForEntity(entity: string): RiskEvent[] {
  return entityIndex.get(entity) ?? [];
}

const _articlesCache = new Map<string, Article[]>();
const _entitiesCache = new Map<string, string[]>();

/** Memoized article fetcher — works for any RiskEvent-shaped object (incl. synthesized from a RiskPoint). */
export function getArticlesFor(ev: RiskEvent): Article[] {
  const cached = _articlesCache.get(ev.id) ?? articlesByEvent[ev.id];
  if (cached) return cached;
  const fresh = buildArticlesForEvent(ev, Math.min(12, ev.articles));
  _articlesCache.set(ev.id, fresh);
  return fresh;
}

/** Memoized entity fetcher. */
export function getEntitiesFor(ev: RiskEvent, index = 0): string[] {
  const cached = _entitiesCache.get(ev.id) ?? entitiesByEvent[ev.id];
  if (cached) return cached;
  const fresh = ["HarchCorp", "HarchCorp Logistics", "HarchCorp Capital", "HarchCorp Labs", "Facility 04", "APAC Sub"]
    .slice(0, ((index % 3) + 2));
  _entitiesCache.set(ev.id, fresh);
  return fresh;
}

/** Convert a RiskPoint (scatter bubble) into a RiskEvent so the drawer can render it. */
export function riskPointToEvent(p: RiskPoint, index = 0): RiskEvent {
  const sentiment: Sentiment =
    p.severity === "critical" || p.severity === "high"
      ? "negative"
      : p.severity === "medium"
        ? "neutral"
        : "positive";
  const d = new Date(2025, 0, 30 - (index % 5));
  return {
    id: p.id,
    date: d.toISOString().slice(0, 10),
    pillar: p.pillar,
    title: p.name,
    articles: p.articles,
    sentiment,
    severity: p.severity,
    region: p.region,
  };
}

/* ------------------------------------------------------------------ */
/*  Risk pillar aggregation (for the new RiskPillars widget)           */
/* ------------------------------------------------------------------ */

export interface PillarAgg {
  pillar: RiskPillar;
  events: number;
  articles: number;
  /** weighted 0–100 exposure score. */
  exposure: number;
  /** -100..+100 net sentiment skew. */
  sentimentSkew: number;
}

export const pillarAgg: PillarAgg[] = (() => {
  const map = new Map<RiskPillar, PillarAgg>();
  for (const p of [
    "Regulatory",
    "Cyber",
    "Financial",
    "ESG",
    "Geopolitical",
    "Reputational",
  ] as RiskPillar[]) {
    map.set(p, { pillar: p, events: 0, articles: 0, exposure: 0, sentimentSkew: 0 });
  }
  for (const e of riskEvents) {
    const row = map.get(e.pillar)!;
    row.events += 1;
    row.articles += e.articles;
    row.sentimentSkew +=
      e.sentiment === "negative" ? -1 : e.sentiment === "positive" ? 1 : 0;
  }
  const maxArticles = Math.max(...[...map.values()].map((r) => r.articles), 1);
  for (const row of map.values()) {
    // exposure = weighted blend of volume + severity-weighted event count
    const criticalHits = riskEvents.filter(
      (e) => e.pillar === row.pillar && (e.severity === "critical" || e.severity === "high"),
    ).length;
    row.exposure = Math.min(
      100,
      Math.round((row.articles / maxArticles) * 60 + criticalHits * 12 + row.events * 3),
    );
    row.sentimentSkew = Math.max(-100, Math.min(100, Math.round((row.sentimentSkew / Math.max(row.events, 1)) * 100)));
  }
  return [...map.values()].sort((a, b) => b.exposure - a.exposure);
})();

/* ------------------------------------------------------------------ */
/*  Top sources (for the new TopSources widget)                        */
/* ------------------------------------------------------------------ */

export interface SourceAgg {
  source: string;
  tier: ArticleTier;
  articles: number;
  positive: number;
  negative: number;
  neutral: number;
  reach: number;
}

export const topSources: SourceAgg[] = [
  { source: "Reuters", tier: "tier1", articles: 312, positive: 98, negative: 154, neutral: 60, reach: 8_900_000 },
  { source: "Bloomberg", tier: "tier1", articles: 284, positive: 86, negative: 142, neutral: 56, reach: 6_100_000 },
  { source: "Financial Times", tier: "tier1", articles: 241, positive: 79, negative: 118, neutral: 44, reach: 4_200_000 },
  { source: "Wall Street Journal", tier: "tier1", articles: 198, positive: 61, negative: 102, neutral: 35, reach: 3_800_000 },
  { source: "Le Monde", tier: "tier1", articles: 156, positive: 48, negative: 84, neutral: 24, reach: 2_100_000 },
  { source: "TechCrunch", tier: "tier2", articles: 143, positive: 72, negative: 51, neutral: 20, reach: 1_400_000 },
  { source: "The Economist", tier: "tier1", articles: 119, positive: 34, negative: 68, neutral: 17, reach: 1_650_000 },
  { source: "Handelsblatt", tier: "tier2", articles: 96, positive: 28, negative: 52, neutral: 16, reach: 980_000 },
];

/* ------------------------------------------------------------------ */
/*  Time-range slicing helpers for Media Coverage                      */
/* ------------------------------------------------------------------ */

export type CoverageRange = "7d" | "30d" | "90d";

export function sliceCoverage(range: CoverageRange): CoverageDay[] {
  if (range === "30d") return coverage30d;
  if (range === "7d") return coverage30d.slice(-7);
  // 90d — synthesize by repeating the 30d pattern twice more with a slight drift
  const base = coverage30d;
  const extended: CoverageDay[] = [];
  for (let cycle = 2; cycle >= 0; cycle--) {
    for (let i = 0; i < base.length; i++) {
      const drift = cycle * 0.85;
      extended.push({
        date: base[i].date,
        positive: Math.round(base[i].positive * drift + (cycle * 4)),
        negative: Math.round(base[i].negative * drift + (cycle * 3)),
      });
    }
  }
  // re-anchor dates so the 90d window ends "today"
  const today = new Date(2025, 0, 31);
  return extended.map((d, idx) => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() - (extended.length - 1 - idx));
    return { ...d, date: dt.toISOString().slice(0, 10) };
  });
}

/* ------------------------------------------------------------------ */
/*  Geographic distribution (for the GeoDistribution widget)          */
/* ------------------------------------------------------------------ */

export interface GeoRegion {
  /** ISO-ish region code used as a key. */
  code: string;
  name: string;
  /** 0–100 intensity for the heatmap tile. */
  intensity: number;
  signals: number;
  articles: number;
  sentimentSkew: number; // -100..+100
  topPillar: RiskPillar;
}

export const geoRegions: GeoRegion[] = [
  { code: "NA", name: "North America", intensity: 82, signals: 14, articles: 487, sentimentSkew: -28, topPillar: "Regulatory" },
  { code: "EU", name: "Europe", intensity: 74, signals: 11, articles: 392, sentimentSkew: -14, topPillar: "Regulatory" },
  { code: "APAC", name: "Asia-Pacific", intensity: 63, signals: 9, articles: 271, sentimentSkew: -41, topPillar: "Geopolitical" },
  { code: "MEA", name: "Middle East & Africa", intensity: 38, signals: 4, articles: 118, sentimentSkew: -8, topPillar: "Cyber" },
  { code: "LATAM", name: "Latin America", intensity: 29, signals: 3, articles: 84, sentimentSkew: +12, topPillar: "ESG" },
];

/**
 * Precomputed indices for O(1) event filtering by source / region.
 * Avoids scanning every event's article pool on each filter change.
 */
export const sourceIndex: Map<string, Set<string>> = (() => {
  const m = new Map<string, Set<string>>();
  for (const ev of riskEvents) {
    const arts = getArticlesFor(ev);
    for (const a of arts) {
      if (!m.has(a.source)) m.set(a.source, new Set());
      m.get(a.source)!.add(ev.id);
    }
  }
  return m;
})();

export const regionIndex: Map<string, Set<string>> = (() => {
  const m = new Map<string, Set<string>>();
  for (const ev of riskEvents) {
    if (!m.has(ev.region)) m.set(ev.region, new Set());
    m.get(ev.region)!.add(ev.id);
  }
  return m;
})();

/** Region code → display name. */
export const regionNames: Record<string, string> = Object.fromEntries(
  geoRegions.map((r) => [r.code, r.name]),
);

/* ------------------------------------------------------------------ */
/*  Risk trend timeline (90d risk-index with peak markers)            */
/* ------------------------------------------------------------------ */

export interface RiskTrendPoint {
  /** day offset from the start of the 90d window (0 = oldest). */
  day: number;
  /** ISO date short. */
  date: string;
  /** composite risk index 0–100. */
  index: number;
  /** short label for any annotated peak (undefined if none). */
  peak?: string;
}

function buildRiskTrend90d(): RiskTrendPoint[] {
  const points: RiskTrendPoint[] = [];
  const today = new Date();
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const t = 89 - i; // 0..89
    // Smooth pseudo-random walk centered around 65 with occasional spikes.
    const base = 62 + 8 * Math.sin(t / 7.5) + 6 * Math.cos(t / 13.2);
    const noise = ((t * 9301 + 49297) % 233280) / 233280 * 8 - 4;
    const index = Math.max(18, Math.min(96, Math.round(base + noise)));
    const point: RiskTrendPoint = {
      day: 89 - i,
      date: d.toISOString().slice(0, 10),
      index,
    };
    // Mark the 3 highest peaks.
    if (t === 17) point.peak = "SEC inquiry leak";
    if (t === 44) point.peak = "Ransomware claim";
    if (t === 71) point.peak = "Analyst downgrade";
    points.push(point);
  }
  return points;
}

export const riskTrend90d: RiskTrendPoint[] = buildRiskTrend90d();

/** Maps a timeline peak label to the corresponding risk event ID (for click-through). */
export const peakToEventId: Record<string, string> = {
  "SEC inquiry leak": "EVT-9821",
  "Ransomware claim": "EVT-9814",
  "Analyst downgrade": "EVT-9771",
};

/* ------------------------------------------------------------------ */
/*  Alert feed (for the bell popover)                                 */
/* ------------------------------------------------------------------ */

export type AlertStatus = "new" | "acknowledged" | "escalated";

export interface AlertItem {
  id: string;
  eventId?: string;
  title: string;
  pillar: RiskPillar;
  severity: Severity;
  /** ISO timestamp. */
  triggeredAt: string;
  status: AlertStatus;
  /** short human label like "2m ago" — kept fresh by the popover. */
}

function isoMinutesAgo(min: number): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - min);
  return d.toISOString();
}

export const alertItems: AlertItem[] = [
  { id: "ALT-5012", eventId: "EVT-9821", title: "SEC inquiry — Q4 revenue recognition", pillar: "Regulatory", severity: "critical", triggeredAt: isoMinutesAgo(2), status: "new" },
  { id: "ALT-5011", eventId: "EVT-9814", title: "Ransomware affiliate claims exfiltration", pillar: "Cyber", severity: "critical", triggeredAt: isoMinutesAgo(8), status: "new" },
  { id: "ALT-5010", eventId: "EVT-9802", title: "Export-control documentation request", pillar: "Geopolitical", severity: "high", triggeredAt: isoMinutesAgo(21), status: "new" },
  { id: "ALT-5009", eventId: "EVT-9795", title: "NGO Scope-3 methodology dispute", pillar: "ESG", severity: "high", triggeredAt: isoMinutesAgo(37), status: "new" },
  { id: "ALT-5008", eventId: "EVT-9783", title: "Op-ed critical of board refresh", pillar: "Reputational", severity: "medium", triggeredAt: isoMinutesAgo(54), status: "acknowledged" },
  { id: "ALT-5007", eventId: "EVT-9771", title: "Analyst downgrade — services margin", pillar: "Financial", severity: "medium", triggeredAt: isoMinutesAgo(73), status: "acknowledged" },
  { id: "ALT-5006", eventId: "EVT-9764", title: "Cloud region outage — SLA breach", pillar: "Cyber", severity: "medium", triggeredAt: isoMinutesAgo(96), status: "escalated" },
  { id: "ALT-5005", eventId: "EVT-9704", title: "Insider trading complaint amended", pillar: "Financial", severity: "high", triggeredAt: isoMinutesAgo(128), status: "escalated" },
];
