// ═══════════════════════════════════════════════════════════════
//  HARCHIQ — DAILY BRIEFING GENERATOR
//
//  Shared by:
//    • GET /api/console/briefing       (on-demand, per-user)
//    • GET /api/cron/generate-briefings (daily cron cache)
//
//  Pipeline:
//    1. Fetch the last 24h of intelligence (negative articles +
//       high/critical risk assessments + AI visibility + topics +
//       neighbors context).
//    2. Build a compact, indexed prompt (1-based alert indices
//       matching the order of the unified alert array).
//    3. Call the LLM via z-ai-web-dev-sdk (SERVER-SIDE ONLY).
//    4. Parse the JSON response and MAP every cited `alertIndex`
//       back to a REAL alert id from the original array.
//       • Any LLM-hallucinated index (out of range) is DROPPED.
//       • Any cited id that doesn't exist in our alert array is
//         DROPPED. This guarantees `citedAlertIds` only contains
//         real Article/RiskAssessment ids.
//    5. Return a BriefingPayload ready to be JSON-stringified to
//       the wire or persisted in `Briefing.sections`.
//
//  Time zone: Casablanca (Africa/Casablanca). The "current date"
//  used as the briefing cache key is computed in that tz so the
//  07:00 cron and a user opening the console at 08:00 see the same
//  `YYYY-MM-DD` row.
// ═══════════════════════════════════════════════════════════════

import { prisma } from "@/lib/db";
import { logInfo, logError } from "@/lib/logger";

// ─── Types ──────────────────────────────────────────────────────

export interface BriefingAlert {
  id: string;
  kind: "negative_article" | "risk_assessment" | "positive_article";
  title: string;
  source: string;
  url: string | null;
  severity: "critical" | "high" | "medium" | "low";
  sentiment: "positive" | "neutral" | "negative";
  publishedAt: Date | null;
  details?: string;
}

export interface BriefingCitedItem {
  title: string;
  alertId: string;
  alertIndex: number; // 1-based index in the prompt
  reason: string;
  source: string;
  url: string | null;
  severity: string;
  /** Confidence 0..1 — derived from data volume + sentiment strength +
   *  source authority, clamped and rounded to 2 decimals. */
  confidence: number;
  /** Human-readable timeline context (e.g. "Volume is up 23% vs the
   *  trailing 7-day average"). Computed server-side from real data. */
  timelineContext: string;
  /** Human-readable competitive benchmark (e.g. "Sentiment -0.15 is
   *  below the sector average of +0.08"). Computed server-side. */
  benchmark: string;
}

export interface BriefingSourceRef {
  id: string;
  title: string;
  source: string;
  url: string | null;
  severity: string;
  publishedAt: string | null;
}

export interface BriefingRecommendedAction {
  /** The action text — concrete, owner-attributed, time-bound. */
  text: string;
  /** Which cited alert id (or null for general) this action addresses. */
  alertId?: string | null;
  /** Suggested owner role (Dircom, CRO, Compliance, ...). */
  owner?: string;
  /** Suggested deadline window in hours. */
  slaHours?: number;
}

export interface BriefingPayload {
  executiveSummary: string;
  topThreats: BriefingCitedItem[];
  topOpportunities: BriefingCitedItem[];
  sentimentShift: string;
  /** Competitive benchmark vs sector peers. */
  competitiveBenchmark: string;
  /** System-computed timeline context — % delta vs 7-day average. */
  timelineContext: string;
  recommendedActions: BriefingRecommendedAction[];
  citedAlertIds: string[];
  sources: BriefingSourceRef[];
  /** Overall briefing confidence 0..1 — weighted average of cited
   *  item confidences plus grounding ratio. */
  confidence: number;
  metadata: {
    alertCount: number;
    citedCount: number;
    model: string;
    generatedAt: string;
    windowStart: string;
    windowEnd: string;
    companyName: string;
    dateKey: string;
    /** Average sentiment over the last 7 days (baseline). */
    sentimentBaseline7d: number | null;
    /** Today's average sentiment. */
    sentimentToday: number | null;
    /** Sector average sentiment across the company's peers. */
    sectorAverage: number | null;
    /** Number of alerts vs the 7-day average volume. */
    volumeDeltaPct: number | null;
  };
}

// Raw shape the LLM is asked to return. After parsing we validate
// every `alertIndex` against our real alert array.
interface RawLLMResponse {
  executiveSummary?: unknown;
  topThreats?: unknown;
  topOpportunities?: unknown;
  sentimentShift?: unknown;
  recommendedActions?: unknown;
  citedAlertIds?: unknown;
}

// ─── Casablanca date key helper ────────────────────────────────

const CASABLANCA_TZ = "Africa/Casablanca";

export function briefingDateKey(d: Date = new Date()): string {
  // Returns YYYY-MM-DD in Africa/Casablanca tz.
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: CASABLANCA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(d); // en-CA gives YYYY-MM-DD
}

// ─── Alert fetcher (last 24h) ──────────────────────────────────

async function fetchLast24hAlerts(
  companyId: string,
  windowEnd: Date,
  demoFilter: { isDemo: boolean },
): Promise<BriefingAlert[]> {
  const since = new Date(windowEnd.getTime() - 24 * 60 * 60 * 1000);

  const [negativeArticles, positiveArticles, highRisks] = await Promise.all([
    prisma.article.findMany({
      where: {
        companyId,
        sentimentLabel: "negative",
        publishedAt: { gte: since, lte: windowEnd },
        ...demoFilter,
      },
      orderBy: { publishedAt: "desc" },
      take: 40,
      select: {
        id: true,
        title: true,
        source: true,
        url: true,
        sentimentScore: true,
        publishedAt: true,
      },
    }),
    prisma.article.findMany({
      where: {
        companyId,
        sentimentLabel: "positive",
        publishedAt: { gte: since, lte: windowEnd },
        ...demoFilter,
      },
      orderBy: { publishedAt: "desc" },
      take: 20,
      select: {
        id: true,
        title: true,
        source: true,
        url: true,
        sentimentScore: true,
        publishedAt: true,
      },
    }),
    prisma.riskAssessment.findMany({
      where: {
        companyId,
        riskLevel: { in: ["high", "critical"] },
        assessedAt: { gte: since, lte: windowEnd },
        ...demoFilter,
      },
      orderBy: { riskScore: "desc" },
      take: 8,
      select: {
        id: true,
        category: true,
        riskLevel: true,
        riskScore: true,
        trajectory: true,
        articleCount: true,
        assessedAt: true,
      },
    }),
  ]);

  const negAlerts: BriefingAlert[] = negativeArticles.map((a) => ({
    id: a.id,
    kind: "negative_article",
    title: a.title,
    source: a.source,
    url: a.url,
    severity: (a.sentimentScore ?? 0) < -0.6 ? "critical" : "high",
    sentiment: "negative",
    publishedAt: a.publishedAt,
  }));

  const posAlerts: BriefingAlert[] = positiveArticles.map((a) => ({
    id: a.id,
    kind: "positive_article",
    title: a.title,
    source: a.source,
    url: a.url,
    severity: "low",
    sentiment: "positive",
    publishedAt: a.publishedAt,
  }));

  const riskAlerts: BriefingAlert[] = highRisks.map((r) => ({
    id: r.id,
    kind: "risk_assessment",
    title: `${r.category} risk — ${r.riskLevel}`,
    source: "HarchIQ Risk Engine",
    url: null,
    severity: r.riskLevel === "critical" ? "critical" : "high",
    sentiment: "negative",
    publishedAt: r.assessedAt,
    details: `Score: ${r.riskScore}/100 · Trajectory: ${r.trajectory} · ${r.articleCount ?? 0} articles`,
  }));

  // Order: most urgent first — risks > negative articles > positive articles.
  // Within each group the DB already returned them ordered by severity/date.
  return [...riskAlerts, ...negAlerts, ...posAlerts];
}

// ─── Previous-day sentiment fetcher (for "sentimentShift") ─────

async function fetchPreviousDaySentiment(
  companyId: string,
  windowEnd: Date,
  demoFilter: { isDemo: boolean },
): Promise<{
  positivePct: number;
  negativePct: number;
  neutralPct: number;
  total: number;
}> {
  const since = new Date(windowEnd.getTime() - 48 * 60 * 60 * 1000);
  const until = new Date(windowEnd.getTime() - 24 * 60 * 60 * 1000);

  const articles = await prisma.article.findMany({
    where: {
      companyId,
      publishedAt: { gte: since, lt: until },
      ...demoFilter,
    },
    select: { sentimentLabel: true },
  });

  const total = articles.length;
  if (total === 0) return { positivePct: 0, negativePct: 0, neutralPct: 0, total: 0 };
  const pos = articles.filter((a) => a.sentimentLabel === "positive").length;
  const neg = articles.filter((a) => a.sentimentLabel === "negative").length;
  const neu = articles.filter((a) => a.sentimentLabel === "neutral").length;
  return {
    positivePct: Math.round((pos / total) * 100),
    negativePct: Math.round((neg / total) * 100),
    neutralPct: Math.round((neu / total) * 100),
    total,
  };
}

// ─── 7-day baseline + sector benchmark (Task: dataminr-briefings-compliance) ──
//
//  Surpasses Dataminr by computing REAL comparison context that the
//  LLM cannot hallucinate:
//    • sentimentBaseline7d — mean sentimentScore across the last 7
//      days (excluding today's window). Null when no telemetry.
//    • sentimentToday — mean sentimentScore inside the 24h window.
//    • sectorAverage — mean sentimentScore across every OTHER
//      company in the same sector (last 7 days). Null when no peers.
//    • volumeDeltaPct — % delta between today's alert count and the
//      average daily alert count over the last 7 days.
//
//  These are passed into the prompt as GROUND TRUTH and stamped
//  verbatim into the final payload (the LLM is asked to reference
//  them, never to recompute them).

export interface BriefingBaseline {
  sentimentBaseline7d: number | null;
  sentimentToday: number | null;
  sectorAverage: number | null;
  volumeDeltaPct: number | null;
}

async function fetchBaselineContext(
  companyId: string,
  sector: string,
  windowEnd: Date,
  demoFilter: { isDemo: boolean },
): Promise<BriefingBaseline> {
  const dayMs = 24 * 60 * 60 * 1000;
  const todayStart = new Date(windowEnd.getTime() - dayMs);
  const sevenDaysAgo = new Date(windowEnd.getTime() - 7 * dayMs);

  const [todayRows, baselineRows, sectorRows] = await Promise.all([
    prisma.article.findMany({
      where: {
        companyId,
        publishedAt: { gte: todayStart, lte: windowEnd },
        sentimentScore: { not: null },
        ...demoFilter,
      },
      select: { sentimentScore: true },
    }),
    prisma.article.findMany({
      where: {
        companyId,
        publishedAt: { gte: sevenDaysAgo, lt: todayStart },
        sentimentScore: { not: null },
        ...demoFilter,
      },
      select: { sentimentScore: true, publishedAt: true },
    }),
    prisma.article.findMany({
      where: {
        // Same sector, OTHER companies (exclude self), real or demo
        // matching the caller's demoFilter so demo companies never
        // pull real peers into the average and vice-versa.
        company: { sector, isDemo: demoFilter.isDemo },
        companyId: { not: companyId },
        publishedAt: { gte: sevenDaysAgo, lte: windowEnd },
        sentimentScore: { not: null },
      },
      select: { sentimentScore: true },
    }),
  ]);

  const mean = (xs: number[]): number | null => {
    if (xs.length === 0) return null;
    return xs.reduce((a, b) => a + b, 0) / xs.length;
  };

  const sentimentToday = mean(todayRows.map((r) => r.sentimentScore ?? 0));
  const sentimentBaseline7d = mean(baselineRows.map((r) => r.sentimentScore ?? 0));
  const sectorAverage = mean(sectorRows.map((r) => r.sentimentScore ?? 0));

  // Volume delta — compare today's count vs the average daily count
  // over the last 7 days. We bucket baseline rows by day to compute
  // a daily mean.
  const buckets = new Map<string, number>();
  for (const r of baselineRows) {
    if (!r.publishedAt) continue;
    const key = r.publishedAt.toISOString().slice(0, 10);
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  const dailyCounts = Array.from(buckets.values());
  let volumeDeltaPct: number | null = null;
  if (dailyCounts.length > 0) {
    const avgDaily = dailyCounts.reduce((a, b) => a + b, 0) / dailyCounts.length;
    if (avgDaily > 0) {
      volumeDeltaPct = Math.round(((todayRows.length - avgDaily) / avgDaily) * 100);
    }
  }

  return { sentimentBaseline7d, sentimentToday, sectorAverage, volumeDeltaPct };
}

// ─── Per-alert confidence scoring ──────────────────────────────
//
//  Combines:
//    • sentiment strength — |score| (negative alerts with stronger
//      negative score are higher-confidence threats).
//    • source authority — a small whitelist of high-authority
//      Moroccan / international outlets. Falls back to 0.5 for
//      unknown sources.
//    • data volume bonus — alerts whose source appears 3+ times in
//      the current 24h window get a small bump (corroboration).
//
//  Returns a number in [0,1], rounded to 2 decimals.

const SOURCE_AUTHORITY: Record<string, number> = {
  // International wire — high authority.
  reuters: 0.95,
  afp: 0.9,
  bloomberg: 0.95,
  "financial times": 0.9,
  // Moroccan press — established outlets.
  hespress: 0.7,
  lematin: 0.7,
  lereporter: 0.7,
  "le matin": 0.7,
  "aujour hui": 0.6,
  "aujourdhui.ma": 0.6,
  medias24: 0.75,
  "l'economiste": 0.75,
  economieconfidentielle: 0.7,
  challenge: 0.65,
  telquel: 0.75,
  lakome: 0.6,
  barlamane: 0.6,
  yabiladi: 0.55,
  h24: 0.55,
  // Regulatory bodies — very high authority.
  ammc: 0.95,
  bam: 0.95,
  "bank al-maghrib": 0.95,
  // Risk engine — internal, treated as authoritative.
  harchiq: 0.85,
};

function sourceAuthority(source: string): number {
  if (!source) return 0.5;
  const lower = source.toLowerCase().trim();
  for (const key of Object.keys(SOURCE_AUTHORITY)) {
    if (lower.includes(key)) return SOURCE_AUTHORITY[key]!;
  }
  return 0.5;
}

function computeCitedItemConfidence(
  alert: BriefingAlert,
  sourceCounts: Map<string, number>,
): number {
  const authority = sourceAuthority(alert.source);
  // Strength derived from severity — risk_assessment alerts carry
  // a severity in {critical,high,medium,low}; articles inherit
  // the severity the fetcher stamped on them.
  const severityStrength =
    alert.severity === "critical"
      ? 1
      : alert.severity === "high"
        ? 0.8
        : alert.severity === "medium"
          ? 0.6
          : 0.4;
  // Negative-sentiment alerts get a small bump when corroborated by
  // the same source 3+ times in the 24h window.
  const corroboration = (sourceCounts.get(alert.source) ?? 0) >= 3 ? 0.1 : 0;
  // Weighted blend — authority (50%), severity (40%), corroboration (10%).
  const raw = 0.5 * authority + 0.4 * severityStrength + 0.1 * (0.5 + corroboration);
  return Math.max(0, Math.min(1, Math.round(raw * 100) / 100));
}

function buildTimelineContext(
  alert: BriefingAlert,
  baseline: BriefingBaseline,
): string {
  if (baseline.volumeDeltaPct === null) {
    return "No 7-day baseline available — insufficient historical telemetry to compute a volume delta.";
  }
  const dir = baseline.volumeDeltaPct >= 0 ? "up" : "down";
  const absPct = Math.abs(baseline.volumeDeltaPct);
  return `Coverage volume is ${dir} ${absPct}% vs the trailing 7-day average (${alert.source}).`;
}

function buildBenchmark(
  alert: BriefingAlert,
  baseline: BriefingBaseline,
  sector: string,
): string {
  const today = baseline.sentimentToday;
  const sectorAvg = baseline.sectorAverage;
  if (today === null || sectorAvg === null) {
    return `No sector benchmark available for ${sector} — peer telemetry is insufficient.`;
  }
  const delta = today - sectorAvg;
  const dir = delta >= 0 ? "above" : "below";
  return `Today's sentiment (${today.toFixed(2)}) is ${dir} the ${sector} sector average (${sectorAvg.toFixed(2)}).`;
}

// ─── AI visibility fetcher (last 24h) ──────────────────────────

async function fetchAiVisibilityContext(
  companyId: string,
  windowEnd: Date,
  demoFilter: { isDemo: boolean },
): Promise<string> {
  const since = new Date(windowEnd.getTime() - 24 * 60 * 60 * 1000);
  const rows = await prisma.aIVisibility.findMany({
    where: { companyId, checkedAt: { gte: since, lte: windowEnd }, ...demoFilter },
    orderBy: { checkedAt: "desc" },
    take: 8,
    select: { platform: true, cited: true, position: true, sentiment: true, summary: true },
  });
  if (rows.length === 0) return "No AI engine visibility probes were recorded in the last 24h.";
  return rows
    .map((r) => `${r.platform}: ${r.cited ? `cited (pos ${r.position ?? "?"}, ${r.sentiment ?? "?"})` : "not cited"}`)
    .join(" | ");
}

// ─── Prompt builder ────────────────────────────────────────────

function buildPrompt(opts: {
  dateKey: string;
  companyName: string;
  sector: string;
  alerts: BriefingAlert[];
  aiVisibilityContext: string;
  prevDay: { positivePct: number; negativePct: number; neutralPct: number; total: number };
  baseline: BriefingBaseline;
}): string {
  const { dateKey, companyName, sector, alerts, aiVisibilityContext, prevDay, baseline } = opts;

  const alertLines = alerts
    .map((a, i) => {
      const time = a.publishedAt ? a.publishedAt.toISOString() : "unknown";
      return `[${i + 1}] [${a.severity.toUpperCase()}] [${a.sentiment}] ${a.title} — ${a.source}${a.details ? ` — ${a.details}` : ""} — ${time}${a.url ? ` — ${a.url}` : ""}`;
    })
    .join("\n");

  const sentimentTodayStr =
    baseline.sentimentToday !== null ? baseline.sentimentToday.toFixed(2) : "n/a";
  const baseline7dStr =
    baseline.sentimentBaseline7d !== null ? baseline.sentimentBaseline7d.toFixed(2) : "n/a";
  const sectorAvgStr =
    baseline.sectorAverage !== null ? baseline.sectorAverage.toFixed(2) : "n/a";
  const volumeDeltaStr =
    baseline.volumeDeltaPct !== null
      ? `${baseline.volumeDeltaPct >= 0 ? "+" : ""}${baseline.volumeDeltaPct}%`
      : "n/a";

  return `You are HarchIQ, the senior intelligence analyst generating the morning briefing for ${companyName} (sector: ${sector}), dated ${dateKey}.

You are working from the unified alert feed below — it combines high/critical risk assessments, negative-coverage articles, and positive-coverage articles from the last 24 hours. Each alert has a [N] index. WHENEVER you reference an alert, use its index number — NEVER invent indices that are not in the list, and NEVER describe an alert that is not in the list.

AI VISIBILITY (last 24h):
${aiVisibilityContext}

PREVIOUS-DAY SENTIMENT BASELINE (24h–48h ago):
${prevDay.total} articles — positive ${prevDay.positivePct}% · neutral ${prevDay.neutralPct}% · negative ${prevDay.negativePct}%

GROUND TRUTH METRICS (use these numbers verbatim — do NOT recompute them):
  • Today's mean sentiment:    ${sentimentTodayStr}
  • 7-day mean sentiment:      ${baseline7dStr}
  • ${sector} sector average:  ${sectorAvgStr}
  • Volume delta vs 7-day avg: ${volumeDeltaStr}

ALERTS (last 24h, ${alerts.length} total):
${alertLines || "(no alerts in the last 24h — note this explicitly in the executive summary)"}

Generate a JSON object with EXACTLY this structure:
{
  "executiveSummary": "2-3 sentence overview of the past 24h. Mention the company name, the most material shift vs the 7-day baseline, and how today's sentiment compares to the sector average. Cite the volume delta as a percentage.",
  "topThreats": [
    { "title": "Short headline for the threat", "alertIndex": <1-based index from the list above>, "reason": "1 sentence why this is the top threat and what it implies — reference the 7-day baseline or sector benchmark when relevant" }
  ],
  "topOpportunities": [
    { "title": "Short headline for the opportunity", "alertIndex": <1-based index>, "reason": "1 sentence why this is the top opportunity and how to capitalise" }
  ],
  "sentimentShift": "1-2 sentences comparing today's sentiment (${sentimentTodayStr}) to the previous-day baseline and the 7-day average (${baseline7dStr}). Cite the sector average (${sectorAvgStr}) when the company is diverging from peers.",
  "recommendedActions": [
    { "text": "Concrete, owner-attributed, time-bound action. Start with a verb (Draft, Brief, Convene, Escalate, Publish). Name the owner role and the deadline window.", "owner": "Dircom | CRO | Compliance | CEO | Legal", "slaHours": <integer 1..168>, "alertIndex": <1-based index, or omit if general> }
  ],
  "citedAlertIds": []
}

Rules:
- Pick 1 to 3 topThreats (use the most severe alerts first).
- Pick 1 to 3 topOpportunities (prefer positive articles).
- Provide 3 to 5 recommendedActions. Each MUST be specific — avoid generic phrasing like "monitor the situation" or "stay vigilant". Each action must name a concrete deliverable (holding statement, board memo, compliance escalation, customer FAQ) and a deadline.
- Every alertIndex MUST be a valid integer between 1 and ${alerts.length}. If you cannot find a real alert for a slot, omit the slot rather than inventing one.
- Leave citedAlertIds as an empty array — the server populates it from the indices you used.
- Return ONLY valid JSON. No markdown fences, no commentary, no trailing commas.`;
}

// ─── JSON extraction ───────────────────────────────────────────

function extractJsonObject(text: string): string {
  // Strip markdown fences if the LLM ignored the "no markdown" instruction.
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced && fenced[1]) return fenced[1].trim();
  // Otherwise, find the first {...} block.
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return text;
  return text.slice(start, end + 1);
}

function parseLlmResponse(raw: string): RawLLMResponse | null {
  try {
    const jsonStr = extractJsonObject(raw);
    return JSON.parse(jsonStr) as RawLLMResponse;
  } catch {
    return null;
  }
}

// ─── Citation mapper (drops hallucinated indices) ──────────────

function mapCitedItem(
  rawItem: unknown,
  alerts: BriefingAlert[],
  sourceCounts: Map<string, number>,
  baseline: BriefingBaseline,
  sector: string,
): BriefingCitedItem | null {
  if (!rawItem || typeof rawItem !== "object") return null;
  const obj = rawItem as Record<string, unknown>;
  const title = typeof obj.title === "string" ? obj.title : "";
  const reason = typeof obj.reason === "string" ? obj.reason : "";
  // alertIndex must be a positive integer in range.
  let alertIndex = -1;
  if (typeof obj.alertIndex === "number" && Number.isFinite(obj.alertIndex)) {
    alertIndex = Math.floor(obj.alertIndex);
  } else if (typeof obj.alertIndex === "string") {
    const parsed = parseInt(obj.alertIndex, 10);
    if (!Number.isNaN(parsed)) alertIndex = parsed;
  }
  if (alertIndex < 1 || alertIndex > alerts.length) return null; // hallucinated index → drop
  const alert = alerts[alertIndex - 1];
  if (!alert) return null;
  return {
    title: title || alert.title,
    alertId: alert.id,
    alertIndex,
    reason: reason || "(no reason provided)",
    source: alert.source,
    url: alert.url,
    severity: alert.severity,
    confidence: computeCitedItemConfidence(alert, sourceCounts),
    timelineContext: buildTimelineContext(alert, baseline),
    benchmark: buildBenchmark(alert, baseline, sector),
  };
}

// ─── Recommended-action parser ─────────────────────────────────
//
//  The LLM is asked to return a JSON array of objects with
//  { text, owner, slaHours, alertIndex }. We tolerate strings too
//  (older prompt) by coercing them into { text }.

function parseRecommendedActions(
  raw: unknown,
  alerts: BriefingAlert[],
): BriefingRecommendedAction[] {
  if (!Array.isArray(raw)) return [];
  const out: BriefingRecommendedAction[] = [];
  for (const item of raw) {
    if (typeof item === "string" && item.trim().length > 0) {
      out.push({ text: item.trim() });
      continue;
    }
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    const text = typeof obj.text === "string" ? obj.text.trim() : "";
    if (!text) continue;
    const owner = typeof obj.owner === "string" && obj.owner.trim() ? obj.owner.trim() : undefined;
    let slaHours: number | undefined;
    if (typeof obj.slaHours === "number" && Number.isFinite(obj.slaHours)) {
      slaHours = Math.max(1, Math.min(168, Math.round(obj.slaHours)));
    } else if (typeof obj.slaHours === "string") {
      const parsed = parseInt(obj.slaHours, 10);
      if (!Number.isNaN(parsed)) slaHours = Math.max(1, Math.min(168, parsed));
    }
    // Map alertIndex (1-based) → alertId when present.
    let alertId: string | null | undefined = undefined;
    let alertIndex = -1;
    if (typeof obj.alertIndex === "number" && Number.isFinite(obj.alertIndex)) {
      alertIndex = Math.floor(obj.alertIndex);
    } else if (typeof obj.alertIndex === "string") {
      const parsed = parseInt(obj.alertIndex, 10);
      if (!Number.isNaN(parsed)) alertIndex = parsed;
    }
    if (alertIndex >= 1 && alertIndex <= alerts.length) {
      alertId = alerts[alertIndex - 1]?.id ?? null;
    }
    out.push({
      text,
      owner,
      slaHours,
      alertId: alertId === undefined ? null : alertId,
    });
    if (out.length >= 5) break;
  }
  return out;
}

// ─── Main entry point ──────────────────────────────────────────

export interface GenerateBriefingOptions {
  userId: string;
  companyId: string;
  companyName: string;
  dateKey?: string; // defaults to today (Casablanca)
  windowEnd?: Date; // defaults to now
  forceRefresh?: boolean;
  /** Task: domain-matching-demo-isolation — when true, only demo
   *  telemetry (isDemo:true) is fetched. When false/undefined, only
   *  real telemetry (isDemo:false) is fetched. */
  isDemo?: boolean;
}

export async function generateBriefing(opts: GenerateBriefingOptions): Promise<BriefingPayload> {
  const dateKey = opts.dateKey ?? briefingDateKey();
  const windowEnd = opts.windowEnd ?? new Date();
  const windowStart = new Date(windowEnd.getTime() - 24 * 60 * 60 * 1000);
  const demoFilter = { isDemo: opts.isDemo === true };

  // 1. Resolve the company's sector so we can compute a sector benchmark.
  //    Falls back to "Unknown" when the company row is missing — the
  //    benchmark will be skipped in that case.
  const companyRow = await prisma.company.findUnique({
    where: { id: opts.companyId },
    select: { sector: true },
  });
  const sector = companyRow?.sector ?? "Unknown";

  // 2. Fetch all telemetry in parallel — alerts, AI visibility,
  //    previous-day baseline, AND the new 7-day baseline + sector
  //    benchmark context.
  //    Task: domain-matching-demo-isolation — pass demoFilter so the
  //    LLM is grounded ONLY in the data the caller is allowed to see.
  const [alerts, aiVisibilityContext, prevDay, baseline] = await Promise.all([
    fetchLast24hAlerts(opts.companyId, windowEnd, demoFilter),
    fetchAiVisibilityContext(opts.companyId, windowEnd, demoFilter),
    fetchPreviousDaySentiment(opts.companyId, windowEnd, demoFilter),
    fetchBaselineContext(opts.companyId, sector, windowEnd, demoFilter),
  ]);

  // Pre-compute the source-corroboration map once per generation.
  const sourceCounts = new Map<string, number>();
  for (const a of alerts) {
    sourceCounts.set(a.source, (sourceCounts.get(a.source) ?? 0) + 1);
  }

  // 3. Build the prompt — includes the new ground-truth metrics.
  const prompt = buildPrompt({
    dateKey,
    companyName: opts.companyName,
    sector,
    alerts,
    aiVisibilityContext,
    prevDay,
    baseline,
  });

  // 4. Call the LLM (SERVER-SIDE ONLY — never imported from a client component).
  let modelName = "heuristic-fallback";
  let rawText = "";
  try {
    const ZAI = (await import("z-ai-web-dev-sdk")).default;
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 1100,
      thinking: { type: "disabled" as const },
    });
    rawText = completion?.choices?.[0]?.message?.content ?? "";
    modelName = "glm-4";
  } catch (err) {
    logError("briefing.generate", `LLM call failed, using heuristic fallback: ${(err as Error).message}`);
    rawText = heuristicBriefing(opts.companyName, sector, dateKey, alerts, prevDay, baseline);
    modelName = "heuristic-fallback";
  }

  // 5. Parse + map citations to REAL alert ids.
  const parsed = parseLlmResponse(rawText);

  const topThreats: BriefingCitedItem[] = [];
  const topOpportunities: BriefingCitedItem[] = [];
  let executiveSummary = `Daily intelligence briefing for ${opts.companyName} covering ${dateKey}. ${alerts.length} alerts were processed in the last 24 hours.`;
  let sentimentShift = `Sentiment baseline: previous 24h had ${prevDay.positivePct}% positive / ${prevDay.negativePct}% negative across ${prevDay.total} articles.`;
  let recommendedActions: BriefingRecommendedAction[] = [];

  if (parsed) {
    if (typeof parsed.executiveSummary === "string" && parsed.executiveSummary.trim().length > 0) {
      executiveSummary = parsed.executiveSummary.trim();
    }
    if (typeof parsed.sentimentShift === "string" && parsed.sentimentShift.trim().length > 0) {
      sentimentShift = parsed.sentimentShift.trim();
    }
    recommendedActions = parseRecommendedActions(parsed.recommendedActions, alerts);
    if (Array.isArray(parsed.topThreats)) {
      for (const item of parsed.topThreats) {
        const mapped = mapCitedItem(item, alerts, sourceCounts, baseline, sector);
        if (mapped) topThreats.push(mapped);
        if (topThreats.length >= 3) break;
      }
    }
    if (Array.isArray(parsed.topOpportunities)) {
      for (const item of parsed.topOpportunities) {
        const mapped = mapCitedItem(item, alerts, sourceCounts, baseline, sector);
        if (mapped) topOpportunities.push(mapped);
        if (topOpportunities.length >= 3) break;
      }
    }
  } else {
    // Final fallback — produce a deterministic briefing from the alerts.
    rawText = heuristicBriefing(opts.companyName, sector, dateKey, alerts, prevDay, baseline);
    const retry = parseLlmResponse(rawText);
    if (retry) {
      if (typeof retry.executiveSummary === "string") executiveSummary = retry.executiveSummary;
      if (typeof retry.sentimentShift === "string") sentimentShift = retry.sentimentShift;
      recommendedActions = parseRecommendedActions(retry.recommendedActions, alerts);
      if (Array.isArray(retry.topThreats)) {
        for (const item of retry.topThreats) {
          const mapped = mapCitedItem(item, alerts, sourceCounts, baseline, sector);
          if (mapped) topThreats.push(mapped);
          if (topThreats.length >= 3) break;
        }
      }
      if (Array.isArray(retry.topOpportunities)) {
        for (const item of retry.topOpportunities) {
          const mapped = mapCitedItem(item, alerts, sourceCounts, baseline, sector);
          if (mapped) topOpportunities.push(mapped);
          if (topOpportunities.length >= 3) break;
        }
      }
    }
  }

  // 6. Build citedAlertIds (unique, real) + sources list.
  const citedSet = new Set<string>();
  for (const item of [...topThreats, ...topOpportunities]) {
    citedSet.add(item.alertId);
  }
  const citedAlertIds = Array.from(citedSet);
  const sources: BriefingSourceRef[] = citedAlertIds
    .map((id) => alerts.find((a) => a.id === id))
    .filter((a): a is BriefingAlert => a !== null)
    .map((a) => ({
      id: a.id,
      title: a.title,
      source: a.source,
      url: a.url,
      severity: a.severity,
      publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
    }));

  if (recommendedActions.length === 0) {
    recommendedActions = defaultRecommendedActions(alerts, prevDay);
  }

  // 7. Overall briefing confidence — weighted average of cited item
  //    confidences (60%) plus the grounding ratio = cited/alerts (40%).
  //    Falls back to 0.3 when no items were cited (low-confidence
  //    briefing — the LLM may have hallucinated every index).
  const citedConfidence =
    citedAlertIds.length > 0
      ? [...topThreats, ...topOpportunities].reduce((s, i) => s + i.confidence, 0) /
        [...topThreats, ...topOpportunities].length
      : 0.3;
  const groundingRatio = alerts.length > 0 ? citedAlertIds.length / alerts.length : 0;
  const overallConfidence = Math.max(
    0,
    Math.min(1, Math.round((0.6 * citedConfidence + 0.4 * groundingRatio) * 100) / 100),
  );

  // 8. Top-level competitive benchmark + timeline context strings
  //    (computed from real data, never LLM-generated).
  const competitiveBenchmark =
    baseline.sentimentToday !== null && baseline.sectorAverage !== null
      ? `Today's mean sentiment (${baseline.sentimentToday.toFixed(2)}) is ${baseline.sentimentToday >= baseline.sectorAverage ? "above" : "below"} the ${sector} sector average (${baseline.sectorAverage.toFixed(2)}).`
      : `No sector benchmark available for ${sector} — peer telemetry is insufficient.`;
  const timelineContext =
    baseline.volumeDeltaPct !== null
      ? `Coverage volume is ${baseline.volumeDeltaPct >= 0 ? "up" : "down"} ${Math.abs(baseline.volumeDeltaPct)}% vs the trailing 7-day average.`
      : "No 7-day baseline available — insufficient historical telemetry to compute a volume delta.";

  logInfo("briefing.generate", `ok alerts=${alerts.length} cited=${citedAlertIds.length} model=${modelName} date=${dateKey} confidence=${overallConfidence}`);

  return {
    executiveSummary,
    topThreats,
    topOpportunities,
    sentimentShift,
    competitiveBenchmark,
    timelineContext,
    recommendedActions,
    citedAlertIds,
    sources,
    confidence: overallConfidence,
    metadata: {
      alertCount: alerts.length,
      citedCount: citedAlertIds.length,
      model: modelName,
      generatedAt: new Date().toISOString(),
      windowStart: windowStart.toISOString(),
      windowEnd: windowEnd.toISOString(),
      companyName: opts.companyName,
      dateKey,
      sentimentBaseline7d: baseline.sentimentBaseline7d,
      sentimentToday: baseline.sentimentToday,
      sectorAverage: baseline.sectorAverage,
      volumeDeltaPct: baseline.volumeDeltaPct,
    },
  };
}

// ─── Heuristic fallback (when the SDK is unavailable) ──────────

function heuristicBriefing(
  companyName: string,
  sector: string,
  dateKey: string,
  alerts: BriefingAlert[],
  prevDay: { positivePct: number; negativePct: number; total: number },
  baseline: BriefingBaseline,
): string {
  const neg = alerts.filter((a) => a.sentiment === "negative");
  const pos = alerts.filter((a) => a.sentiment === "positive");
  const risks = alerts.filter((a) => a.kind === "risk_assessment");
  const topThreats = (risks.length > 0 ? risks : neg).slice(0, 3);
  const topOps = pos.slice(0, 3);
  const sentimentTodayStr =
    baseline.sentimentToday !== null ? baseline.sentimentToday.toFixed(2) : "n/a";
  const sectorAvgStr =
    baseline.sectorAverage !== null ? baseline.sectorAverage.toFixed(2) : "n/a";
  const summary =
    `Heuristic briefing for ${companyName} (${sector}), ${dateKey}. ${alerts.length} alerts in the last 24h ` +
    `(${neg.length} negative, ${pos.length} positive, ${risks.length} risk assessments). ` +
    `Previous-day baseline: ${prevDay.positivePct}% positive across ${prevDay.total} articles. ` +
    `Today's sentiment ${sentimentTodayStr} vs sector ${sectorAvgStr}.`;
  const actions = defaultRecommendedActions(alerts, prevDay);
  const buildItems = (items: BriefingAlert[]) =>
    items.map((a, i) => ({
      title: a.title,
      alertIndex: alerts.indexOf(a) + 1,
      reason: `Auto-flagged as a top ${a.sentiment === "negative" ? "threat" : "opportunity"} (${a.severity}).`,
    }));
  return JSON.stringify({
    executiveSummary: summary,
    topThreats: buildItems(topThreats),
    topOpportunities: buildItems(topOps),
    sentimentShift: `Sentiment delta vs previous 24h baseline (${prevDay.positivePct}% positive): ${pos.length} positive vs ${neg.length} negative alerts today.`,
    recommendedActions: actions.map((a) => ({
      text: a.text,
      owner: a.owner,
      slaHours: a.slaHours,
      alertIndex: undefined,
    })),
    citedAlertIds: [],
  });
}

function defaultRecommendedActions(
  alerts: BriefingAlert[],
  prevDay: { positivePct: number; negativePct: number; total: number },
): BriefingRecommendedAction[] {
  const recs: BriefingRecommendedAction[] = [];
  const critical = alerts.filter((a) => a.severity === "critical").length;
  if (critical > 0) {
    recs.push({
      text: `Address ${critical} critical alert(s) within 24 hours — convene the crisis comms cell, draft a holding statement, and brief the CEO before the next trading window.`,
      owner: "Dircom",
      slaHours: 24,
      alertId: null,
    });
  }
  if (prevDay.negativePct > 30) {
    recs.push({
      text: `Negative coverage is elevated at ${prevDay.negativePct}% — the Dircom should personally brief the top 3 negative outlets' beat reporters within 48 hours and offer a 1:1 with the CEO.`,
      owner: "Dircom",
      slaHours: 48,
      alertId: null,
    });
  } else {
    recs.push({
      text: `Negative coverage is contained at ${prevDay.negativePct}% — maintain the current media engagement cadence but pre-draft a FAQ for the next product launch.`,
      owner: "Comms",
      slaHours: 72,
      alertId: null,
    });
  }
  recs.push({
    text: "Schedule a 30-minute review at the start of the next cycle to measure progress against these actions and update the board memo before the monthly governance meeting.",
    owner: "CRO",
    slaHours: 24,
    alertId: null,
  });
  return recs;
}

// ─── Persist + load cached briefings ───────────────────────────

export async function loadCachedBriefing(userId: string, dateKey: string): Promise<BriefingPayload | null> {
  const row = await prisma.briefing.findUnique({
    where: { userId_date: { userId, date: dateKey } },
    select: { sections: true, status: true, error: true },
  });
  if (!row || row.status !== "ready") return null;
  return row.sections as unknown as BriefingPayload;
}

export async function persistBriefing(
  userId: string,
  companyId: string | null,
  dateKey: string,
  payload: BriefingPayload,
  status: "ready" | "failed" = "ready",
  errorMsg: string | null = null,
): Promise<void> {
  const title = `Daily Intelligence Briefing — ${dateKey}`;
  const data = {
    userId,
    companyId,
    date: dateKey,
    title,
    summary: payload.executiveSummary,
    sections: payload as unknown as object,
    model: payload.metadata.model,
    alertCount: payload.metadata.alertCount,
    citedCount: payload.metadata.citedCount,
    status,
    error: errorMsg,
  };
  // Upsert on [userId, date] so re-running the cron for the same day
  // refreshes the cached briefing instead of creating a duplicate.
  await prisma.briefing.upsert({
    where: { userId_date: { userId, date: dateKey } },
    create: data,
    update: data,
  });
}

// ─── Primary company helper (same heuristic as /api/console/alerts) ─

export async function getPrimaryCompanyForUser(user: {
  id: string;
  accountType: string;
  isDemo?: boolean;
}): Promise<{ id: string; name: string } | null> {
  // Trader (harch-alpha) accounts have no primary Company — they monitor
  // Assets instead. For briefings we still surface company-level intel
  // from the user's own company (resolved via User.companyId), falling
  // back to the first REAL company in the DB (isDemo:false) so demo
  // companies never leak into a real user's briefing, and vice-versa.
  //
  // Task: domain-matching-demo-isolation
  const isDemo = user.isDemo === true;
  const demoFilter = { isDemo };

  // 1. Try the user's companyId first (the onboarding-attached company).
  if (user.id) {
    const userRow = await prisma.user.findUnique({
      where: { id: user.id },
      select: { companyId: true },
    });
    if (userRow?.companyId) {
      const c = await prisma.company.findUnique({
        where: { id: userRow.companyId },
        select: { id: true, name: true, isDemo: true },
      });
      if (c && c.isDemo === isDemo) {
        return { id: c.id, name: c.name };
      }
    }
  }

  // 2. Fallback: first company matching the demoFilter.
  const company = await prisma.company.findFirst({
    where: demoFilter,
    orderBy: { createdAt: "asc" },
  });
  if (!company) return null;
  return { id: company.id, name: company.name };
}
