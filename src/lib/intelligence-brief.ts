/**
 * Harch Atelier — Intelligence Brief generator (V22.0)
 *
 * Synthesizes a deterministic "Daily Intelligence Brief" from the existing
 * mock-data datasets. Produces a structured brief object with narrative
 * sections, data chips, and recommended actions — the kind of morning brief
 * a Palantir-grade platform auto-generates for its analysts.
 *
 * The brief is role-aware: each account type gets a personalized executive
 * summary + recommended actions scoped to their function.
 *
 * Deterministic: same seed → same brief. `regenerate(seed)` produces a fresh
 * variant by shifting the seed (used by the "Regenerate" button).
 */

import {
  riskEvents,
  watchlistSignals,
  shareOfVoice,
  coverage30d,
  sentiment12m,
  headlineKpis,
  type RiskEvent,
  type RiskPillar,
  type Severity,
  type AccountType,
} from "@/lib/mock-data";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface BriefChip {
  label: string;
  value: string;
  tone: "positive" | "negative" | "neutral" | "warning" | "info";
}

export interface BriefItem {
  id: string;
  title: string;
  detail: string;
  severity?: Severity;
  pillar?: RiskPillar;
  metric?: string;
  tone: "positive" | "negative" | "neutral" | "warning";
}

export interface BriefSection {
  id: string;
  title: string;
  icon: string; // lucide icon name
  narrative: string;
  items: BriefItem[];
  chips: BriefChip[];
}

export interface IntelligenceBrief {
  generatedAt: string; // ISO
  dateLabel: string; // "Monday, January 29, 2025"
  seed: number;
  role: AccountType;
  headline: string;
  executiveSummary: string;
  riskLevel: "elevated" | "high" | "critical" | "stable";
  riskScore: number;
  sections: BriefSection[];
  recommendedActions: BriefItem[];
  /** Stable id for React keys + dedupe. */
  briefId: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(arr: readonly T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function formatDateLabel(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Severity weight for ranking. */
const severityWeight: Record<Severity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

/* ------------------------------------------------------------------ */
/*  Role-aware executive summaries                                     */
/* ------------------------------------------------------------------ */

const execSummaryByRole: Record<AccountType, (brief: { riskScore: number; criticalCount: number; negShare: number }) => string> = {
  admin: (b) =>
    `Composite risk index stands at ${b.riskScore.toFixed(1)}/100, ${b.riskScore > 70 ? "elevated and trending upward" : "within normal range"}. ${b.criticalCount} critical signal${b.criticalCount === 1 ? "" : "s"} require immediate triage across the platform. Negative coverage share is ${b.negShare}% — ${b.negShare > 45 ? "above the 40% watch threshold" : "within tolerance"}. All ingestion pipelines are nominal; no source health incidents in the last 24h.`,
  trader: (b) =>
    `Risk environment is ${b.riskScore > 70 ? "elevated" : "stable"} at ${b.riskScore.toFixed(1)}/100. ${b.criticalCount} critical risk event${b.criticalCount === 1 ? "" : "s"} are active and may impact HarchCorp positions. Watchlist signals show ${b.negShare > 45 ? "deteriorating" : "stable"} sentiment — review position exposure to affected entities before the open.`,
  legal: (b) =>
    `Regulatory and compliance posture is ${b.riskScore > 70 ? "under pressure" : "stable"} at ${b.riskScore.toFixed(1)}/100. ${b.criticalCount} critical matter${b.criticalCount === 1 ? "" : "s"} need attention. Negative coverage at ${b.negShare}% — monitor for regulatory pickup. No new hold notices issued in the last 24h; 3 upcoming filing deadlines this week.`,
  market: (b) =>
    `Market intelligence signals ${b.riskScore > 70 ? "elevated" : "stable"} risk at ${b.riskScore.toFixed(1)}/100. Share-of-voice analysis shows HarchCorp leading peers, but negative coverage share is ${b.negShare}%. ${b.criticalCount} critical event${b.criticalCount === 1 ? "" : "s"} are driving coverage — assess sentiment impact on investor positioning.`,
  pr: (b) =>
    `Reputation environment is ${b.riskScore > 70 ? "strained" : "stable"} at ${b.riskScore.toFixed(1)}/100. Negative coverage share at ${b.negShare}% ${b.negShare > 45 ? "exceeds the comms watch threshold" : "is within tolerance"}. ${b.criticalCount} critical narrative${b.criticalCount === 1 ? "" : "s"} are active — coordinate response strategy with the comms desk.`,
  self: (b) =>
    `Your tracked entities show ${b.riskScore > 70 ? "elevated" : "stable"} risk at ${b.riskScore.toFixed(1)}/100. ${b.criticalCount} critical signal${b.criticalCount === 1 ? "" : "s"} on your watchlist need review. Negative coverage at ${b.negShare}%. Review your pinned entities and acknowledge outstanding alerts.`,
};

const recommendedActionsByRole: Record<AccountType, BriefItem[]> = {
  admin: [
    { id: "ra-admin-1", title: "Triage critical alerts", detail: "3 threshold breaches awaiting acknowledgement in the alerts queue.", tone: "warning", metric: "3 open" },
    { id: "ra-admin-2", title: "Review source health", detail: "Bloomberg feed latency spiked to 4.2s overnight — verify pipeline.", tone: "neutral", metric: "1 degraded" },
    { id: "ra-admin-3", title: "Approve new user provision", detail: "2 pending access requests for the Legal Counsel role.", tone: "neutral", metric: "2 pending" },
  ],
  trader: [
    { id: "ra-trader-1", title: "Reduce position exposure", detail: "HarchCorp (HRCH) sentiment delta -3.4 on SEC inquiry — review holding size.", tone: "negative", metric: "Δ -3.4" },
    { id: "ra-trader-2", title: "Monitor BVC open", detail: "MASI futures indicate a flat-to-negative open; watch banking sector.", tone: "neutral", metric: "MASI -0.2%" },
    { id: "ra-trader-3", title: "Hedge cyber-risk exposure", detail: "Ransomware claim on logistics data may impact supply-chain counterparties.", tone: "warning", metric: "2 counterparty" },
  ],
  legal: [
    { id: "ra-legal-1", title: "Issue litigation hold", detail: "SEC inquiry EVT-9821 triggered a hold-notice recommendation — coordinate with e-discovery.", tone: "warning", metric: "1 hold" },
    { id: "ra-legal-2", title: "File AMMC disclosure", detail: "Quarterly obligations register shows 1 filing due in 4 business days.", tone: "warning", metric: "4 days" },
    { id: "ra-legal-3", title: "Brief external counsel", detail: "Export-control probe EVT-9802 requires outside counsel briefing by EOW.", tone: "neutral", metric: "EOW" },
  ],
  market: [
    { id: "ra-market-1", title: "Update IR talking points", detail: "Negative coverage on revenue recognition — prepare Q&A for investor calls.", tone: "warning", metric: "86 articles" },
    { id: "ra-market-2", title: "Brief analyst relations", detail: "Board refresh op-ed pickup is growing — pre-empt analyst questions.", tone: "neutral", metric: "47 articles" },
    { id: "ra-market-3", title: "Monitor peer SoV shift", detail: "Northwind share-of-voice gained 2.1pp overnight — assess competitive positioning.", tone: "neutral", metric: "+2.1pp" },
  ],
  pr: [
    { id: "ra-pr-1", title: "Draft holding statement", detail: "Ransomware claim is gaining tier-1 pickup — prepare a holding statement within 2h.", tone: "negative", metric: "74 articles" },
    { id: "ra-pr-2", title: "Engage social listening", detail: "Sentiment on X/Twitter is skewing negative on the SEC inquiry — monitor virality.", tone: "warning", metric: "Δ -3.4" },
    { id: "ra-pr-3", title: "Schedule CEO briefing", detail: "Board composition criticism requires a coordinated CEO response — brief by EOD.", tone: "neutral", metric: "EOD" },
  ],
  self: [
    { id: "ra-self-1", title: "Acknowledge critical alerts", detail: "2 unacknowledged critical alerts on your pinned entities.", tone: "warning", metric: "2 open" },
    { id: "ra-self-2", title: "Review watchlist signals", detail: "HRCH watchlist shows 4 down signals — assess your tracked exposure.", tone: "negative", metric: "4 down" },
    { id: "ra-self-3", title: "Export your digest", detail: "Your daily activity digest is ready for export (CSV/JSON).", tone: "neutral", metric: "ready" },
  ],
};

/* ------------------------------------------------------------------ */
/*  Brief generator                                                    */
/* ------------------------------------------------------------------ */

/**
 * Generate a deterministic intelligence brief.
 * @param role The account type to personalize for.
 * @param seed Optional seed (default = day-of-year). Change to regenerate.
 */
export function generateBrief(role: AccountType, seed?: number): IntelligenceBrief {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000,
  );
  const s = seed ?? dayOfYear * 1000 + now.getHours();
  const rng = mulberry32(s);

  // --- Top risks (sort by severity weight × articles) ---
  const topRisks = [...riskEvents]
    .sort((a, b) => severityWeight[b.severity] * b.articles - severityWeight[a.severity] * a.articles)
    .slice(0, 5);

  const criticalCount = riskEvents.filter((e) => e.severity === "critical").length;
  const riskScore = headlineKpis.riskIndex;
  const negShare = headlineKpis.negativeShare;

  const riskLevel: IntelligenceBrief["riskLevel"] =
    riskScore > 80 || criticalCount >= 3 ? "critical" : riskScore > 70 ? "high" : riskScore > 55 ? "elevated" : "stable";

  // --- Coverage pulse (last 7 days) ---
  const last7 = coverage30d.slice(0, 7);
  const pos7 = last7.reduce((s, d) => s + d.positive, 0);
  const neg7 = last7.reduce((s, d) => s + d.negative, 0);
  const negPct7 = Math.round((neg7 / (pos7 + neg7)) * 100);
  const prev7 = coverage30d.slice(7, 14);
  const prevTotal = prev7.reduce((s, d) => s + d.positive + d.negative, 0);
  const currTotal = pos7 + neg7;
  const coverageDelta = prevTotal > 0 ? Math.round(((currTotal - prevTotal) / prevTotal) * 100) : 0;

  // --- Sentiment trend (last 3 months) ---
  const last3 = sentiment12m.slice(-3);
  const last3Pos = last3.reduce((s, m) => s + m.positive, 0);
  const last3Neg = last3.reduce((s, m) => s + m.negative, 0);
  const sentTrend = last3Neg > last3Pos ? "deteriorating" : last3Pos > last3Neg ? "improving" : "stable";

  // --- Share of Voice ---
  const totalSov = shareOfVoice.reduce((s, x) => s + x.value, 0);
  const harchSov = shareOfVoice.find((x) => x.isTarget)?.value ?? 0;
  const harchSovPct = Math.round((harchSov / totalSov) * 100);
  const topCompetitor = shareOfVoice.filter((x) => !x.isTarget).sort((a, b) => b.value - a.value)[0];

  // --- Watchlist ---
  const wlDown = watchlistSignals.filter((s) => s.delta < 0);
  const wlCritical = watchlistSignals.filter((s) => s.severity === "critical");

  // --- Build sections ---
  const sections: BriefSection[] = [];

  // Section 1: Top Risk Signals
  sections.push({
    id: "top-risks",
    title: "Top Risk Signals",
    icon: "AlertTriangle",
    narrative: `${criticalCount} critical and ${riskEvents.filter((e) => e.severity === "high").length} high-severity events are active. The most material signal is "${topRisks[0].title}" (${topRisks[0].articles} articles, ${topRisks[0].pillar}). Regulatory and Cyber pillars account for ${Math.round((topRisks.filter((r) => r.pillar === "Regulatory" || r.pillar === "Cyber").length / topRisks.length) * 100)}% of top-5 risk volume.`,
    items: topRisks.map((e) => ({
      id: e.id,
      title: e.title,
      detail: `${e.pillar} · ${e.region} · ${e.articles} articles · ${e.sentiment}`,
      severity: e.severity,
      pillar: e.pillar,
      metric: e.severity.toUpperCase(),
      tone: e.severity === "critical" || e.severity === "high" ? "negative" : e.severity === "medium" ? "warning" : "neutral",
    })),
    chips: [
      { label: "Critical", value: `${criticalCount}`, tone: "negative" },
      { label: "Risk index", value: `${riskScore.toFixed(1)}/100`, tone: riskScore > 70 ? "negative" : "neutral" },
      { label: "Active events", value: `${riskEvents.length}`, tone: "info" },
    ],
  });

  // Section 2: Coverage & Sentiment Pulse
  sections.push({
    id: "coverage-pulse",
    title: "Coverage & Sentiment Pulse",
    icon: "Newspaper",
    narrative: `Last 7 days produced ${currTotal.toLocaleString()} articles — ${coverageDelta >= 0 ? "up" : "down"} ${Math.abs(coverageDelta)}% vs the prior week. Negative share is ${negPct7}%, ${negPct7 > 45 ? "above the 40% watch threshold" : "within tolerance"}. 3-month sentiment trend is ${sentTrend}.`,
    items: [
      { id: "cov-1", title: "7-day coverage volume", detail: `${currTotal.toLocaleString()} articles (${coverageDelta >= 0 ? "+" : ""}${coverageDelta}% WoW)`, metric: `${currTotal.toLocaleString()}`, tone: coverageDelta > 15 ? "warning" : coverageDelta < -10 ? "positive" : "neutral" },
      { id: "cov-2", title: "Negative share (7d)", detail: `${negPct7}% of coverage classified negative by GLM-4`, metric: `${negPct7}%`, tone: negPct7 > 45 ? "negative" : "neutral" },
      { id: "cov-3", title: "Sentiment trend (3m)", detail: `3-month positive vs negative balance: ${sentTrend}`, metric: sentTrend, tone: sentTrend === "improving" ? "positive" : sentTrend === "deteriorating" ? "negative" : "neutral" },
      { id: "cov-4", title: "Total coverage (30d)", detail: `${headlineKpis.coverage30d.toLocaleString()} articles across 1,840 sources`, metric: `${(headlineKpis.coverage30d / 1000).toFixed(1)}k`, tone: "info" },
    ],
    chips: [
      { label: "7d volume", value: `${currTotal.toLocaleString()}`, tone: "info" },
      { label: "WoW Δ", value: `${coverageDelta >= 0 ? "+" : ""}${coverageDelta}%`, tone: coverageDelta > 15 ? "negative" : coverageDelta < 0 ? "positive" : "neutral" },
      { label: "Neg share", value: `${negPct7}%`, tone: negPct7 > 45 ? "negative" : "neutral" },
      { label: "Trend", value: sentTrend, tone: sentTrend === "improving" ? "positive" : sentTrend === "deteriorating" ? "negative" : "neutral" },
    ],
  });

  // Section 3: Share of Voice
  sections.push({
    id: "sov",
    title: "Share of Voice",
    icon: "PieChart",
    narrative: `HarchCorp commands ${harchSovPct}% of monitored coverage (${harchSov.toLocaleString()} articles), leading all peers. Nearest competitor ${topCompetitor.name} holds ${Math.round((topCompetitor.value / totalSov) * 100)}% (${topCompetitor.value.toLocaleString()} articles). The gap ${harchSov > topCompetitor.value * 1.5 ? "is comfortable" : "is narrowing — monitor competitive narrative activity"}.`,
    items: shareOfVoice.slice(0, 5).map((s) => ({
      id: `sov-${s.name}`,
      title: s.name,
      detail: s.isTarget ? "Target entity (monitored)" : "Competitor / peer",
      metric: `${Math.round((s.value / totalSov) * 100)}%`,
      tone: s.isTarget ? "positive" : "neutral",
    })),
    chips: [
      { label: "HarchCorp SoV", value: `${harchSovPct}%`, tone: "positive" },
      { label: "Top competitor", value: topCompetitor.name, tone: "neutral" },
      { label: "Gap", value: `${Math.round((harchSov - topCompetitor.value) / totalSov * 100)}pp`, tone: harchSov > topCompetitor.value * 1.5 ? "positive" : "warning" },
    ],
  });

  // Section 4: Watchlist Signals
  sections.push({
    id: "watchlist",
    title: "Watchlist Signals",
    icon: "Radio",
    narrative: `${watchlistSignals.length} tracked signals on HarchCorp. ${wlDown.length} are trending negative, ${wlCritical.length} are critical severity. The steepest drop is "${wlDown.sort((a, b) => a.delta - b.delta)[0]?.signal}" at Δ ${wlDown.sort((a, b) => a.delta - b.delta)[0]?.delta.toFixed(1)}.`,
    items: watchlistSignals.slice(0, 5).map((s) => ({
      id: s.id,
      title: s.signal,
      detail: `${s.pillar} · ${s.severity} · ${s.articles} articles`,
      severity: s.severity,
      pillar: s.pillar,
      metric: `Δ ${s.delta >= 0 ? "+" : ""}${s.delta.toFixed(1)}`,
      tone: s.delta < -2 ? "negative" : s.delta < 0 ? "warning" : "positive",
    })),
    chips: [
      { label: "Signals", value: `${watchlistSignals.length}`, tone: "info" },
      { label: "Down", value: `${wlDown.length}`, tone: "negative" },
      { label: "Critical", value: `${wlCritical.length}`, tone: "negative" },
    ],
  });

  // --- Headline + exec summary ---
  const headline = riskLevel === "critical"
    ? "Critical risk environment — immediate action required"
    : riskLevel === "high"
      ? "Elevated risk environment — heightened vigilance advised"
      : riskLevel === "elevated"
        ? "Moderate risk elevation — monitor closely"
        : "Stable risk environment — routine monitoring";

  const execSummary = execSummaryByRole[role]({ riskScore, criticalCount, negShare });
  const recommendedActions = recommendedActionsByRole[role];

  return {
    generatedAt: now.toISOString(),
    dateLabel: formatDateLabel(now),
    seed: s,
    role,
    headline,
    executiveSummary: execSummary,
    riskLevel,
    riskScore,
    sections,
    recommendedActions,
    briefId: `brief-${role}-${s}`,
  };
}

/** Risk-level → tone + label metadata for UI. */
export const riskLevelMeta: Record<IntelligenceBrief["riskLevel"], { label: string; tone: string; color: string; icon: string }> = {
  stable: { label: "Stable", tone: "positive", color: "emerald", icon: "ShieldCheck" },
  elevated: { label: "Elevated", tone: "warning", color: "amber", icon: "AlertCircle" },
  high: { label: "High", tone: "negative", color: "orange", icon: "AlertTriangle" },
  critical: { label: "Critical", tone: "negative", color: "rose", icon: "ShieldAlert" },
};

/** Tone → Tailwind classes for chips. */
export const chipToneClass: Record<BriefChip["tone"], string> = {
  positive: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  negative: "bg-rose-50 text-rose-700 ring-rose-200",
  neutral: "bg-slate-100 text-slate-600 ring-slate-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  info: "bg-sky-50 text-sky-700 ring-sky-200",
};

/** Tone → Tailwind classes for item left-borders + text. */
export const itemToneClass: Record<BriefItem["tone"], string> = {
  positive: "border-l-emerald-400",
  negative: "border-l-rose-400",
  neutral: "border-l-slate-300",
  warning: "border-l-amber-400",
};
