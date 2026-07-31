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
}

export interface BriefingSourceRef {
  id: string;
  title: string;
  source: string;
  url: string | null;
  severity: string;
  publishedAt: string | null;
}

export interface BriefingPayload {
  executiveSummary: string;
  topThreats: BriefingCitedItem[];
  topOpportunities: BriefingCitedItem[];
  sentimentShift: string;
  recommendedActions: string[];
  citedAlertIds: string[];
  sources: BriefingSourceRef[];
  metadata: {
    alertCount: number;
    citedCount: number;
    model: string;
    generatedAt: string;
    windowStart: string;
    windowEnd: string;
    companyName: string;
    dateKey: string;
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

async function fetchLast24hAlerts(companyId: string, windowEnd: Date): Promise<BriefingAlert[]> {
  const since = new Date(windowEnd.getTime() - 24 * 60 * 60 * 1000);

  const [negativeArticles, positiveArticles, highRisks] = await Promise.all([
    prisma.article.findMany({
      where: {
        companyId,
        sentimentLabel: "negative",
        publishedAt: { gte: since, lte: windowEnd },
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

async function fetchPreviousDaySentiment(companyId: string, windowEnd: Date): Promise<{
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

// ─── AI visibility fetcher (last 24h) ──────────────────────────

async function fetchAiVisibilityContext(companyId: string, windowEnd: Date): Promise<string> {
  const since = new Date(windowEnd.getTime() - 24 * 60 * 60 * 1000);
  const rows = await prisma.aIVisibility.findMany({
    where: { companyId, checkedAt: { gte: since, lte: windowEnd } },
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
  alerts: BriefingAlert[];
  aiVisibilityContext: string;
  prevDay: { positivePct: number; negativePct: number; neutralPct: number; total: number };
}): string {
  const { dateKey, companyName, alerts, aiVisibilityContext, prevDay } = opts;

  const alertLines = alerts
    .map((a, i) => {
      const time = a.publishedAt ? a.publishedAt.toISOString() : "unknown";
      return `[${i + 1}] [${a.severity.toUpperCase()}] [${a.sentiment}] ${a.title} — ${a.source}${a.details ? ` — ${a.details}` : ""} — ${time}${a.url ? ` — ${a.url}` : ""}`;
    })
    .join("\n");

  return `You are HarchIQ, the senior intelligence analyst generating the morning briefing for ${companyName}, dated ${dateKey}.

You are working from the unified alert feed below — it combines high/critical risk assessments, negative-coverage articles, and positive-coverage articles from the last 24 hours. Each alert has a [N] index. WHENEVER you reference an alert, use its index number — NEVER invent indices that are not in the list, and NEVER describe an alert that is not in the list.

AI VISIBILITY (last 24h):
${aiVisibilityContext}

PREVIOUS-DAY SENTIMENT BASELINE (24h–48h ago):
${prevDay.total} articles — positive ${prevDay.positivePct}% · neutral ${prevDay.neutralPct}% · negative ${prevDay.negativePct}%

ALERTS (last 24h, ${alerts.length} total):
${alertLines || "(no alerts in the last 24h — note this explicitly in the executive summary)"}

Generate a JSON object with EXACTLY this structure:
{
  "executiveSummary": "2-3 sentence overview of the past 24h. Mention the company name and the most material shift vs the previous-day baseline.",
  "topThreats": [
    { "title": "Short headline for the threat", "alertIndex": <1-based index from the list above>, "reason": "1 sentence why this is the top threat and what it implies" }
  ],
  "topOpportunities": [
    { "title": "Short headline for the opportunity", "alertIndex": <1-based index>, "reason": "1 sentence why this is the top opportunity and how to capitalise" }
  ],
  "sentimentShift": "1-2 sentences comparing today's sentiment mix to the previous-day baseline (cite the % delta for positive/negative).",
  "recommendedActions": [
    "Actionable bullet 1 — concrete next step with an owner/timeline where possible.",
    "Actionable bullet 2",
    "Actionable bullet 3"
  ],
  "citedAlertIds": []
}

Rules:
- Pick 1 to 3 topThreats (use the most severe alerts first).
- Pick 1 to 3 topOpportunities (prefer positive articles).
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
  };
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .map((v) => v.trim());
}

// ─── Main entry point ──────────────────────────────────────────

export interface GenerateBriefingOptions {
  userId: string;
  companyId: string;
  companyName: string;
  dateKey?: string; // defaults to today (Casablanca)
  windowEnd?: Date; // defaults to now
  forceRefresh?: boolean;
}

export async function generateBriefing(opts: GenerateBriefingOptions): Promise<BriefingPayload> {
  const dateKey = opts.dateKey ?? briefingDateKey();
  const windowEnd = opts.windowEnd ?? new Date();
  const windowStart = new Date(windowEnd.getTime() - 24 * 60 * 60 * 1000);

  // 1. Fetch all telemetry in parallel.
  const [alerts, aiVisibilityContext, prevDay] = await Promise.all([
    fetchLast24hAlerts(opts.companyId, windowEnd),
    fetchAiVisibilityContext(opts.companyId, windowEnd),
    fetchPreviousDaySentiment(opts.companyId, windowEnd),
  ]);

  // 2. Build the prompt.
  const prompt = buildPrompt({ dateKey, companyName: opts.companyName, alerts, aiVisibilityContext, prevDay });

  // 3. Call the LLM (SERVER-SIDE ONLY — never imported from a client component).
  let modelName = "heuristic-fallback";
  let rawText = "";
  try {
    const ZAI = (await import("z-ai-web-dev-sdk")).default;
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 800,
      thinking: { type: "disabled" as const },
    });
    rawText = completion?.choices?.[0]?.message?.content ?? "";
    modelName = "glm-4";
  } catch (err) {
    logError("briefing.generate", `LLM call failed, using heuristic fallback: ${(err as Error).message}`);
    rawText = heuristicBriefing(opts.companyName, dateKey, alerts, prevDay);
    modelName = "heuristic-fallback";
  }

  // 4. Parse + map citations to REAL alert ids.
  const parsed = parseLlmResponse(rawText);

  const topThreats: BriefingCitedItem[] = [];
  const topOpportunities: BriefingCitedItem[] = [];
  let executiveSummary = `Daily intelligence briefing for ${opts.companyName} covering ${dateKey}. ${alerts.length} alerts were processed in the last 24 hours.`;
  let sentimentShift = `Sentiment baseline: previous 24h had ${prevDay.positivePct}% positive / ${prevDay.negativePct}% negative across ${prevDay.total} articles.`;
  let recommendedActions: string[] = [];

  if (parsed) {
    if (typeof parsed.executiveSummary === "string" && parsed.executiveSummary.trim().length > 0) {
      executiveSummary = parsed.executiveSummary.trim();
    }
    if (typeof parsed.sentimentShift === "string" && parsed.sentimentShift.trim().length > 0) {
      sentimentShift = parsed.sentimentShift.trim();
    }
    recommendedActions = asStringArray(parsed.recommendedActions);
    if (Array.isArray(parsed.topThreats)) {
      for (const item of parsed.topThreats) {
        const mapped = mapCitedItem(item, alerts);
        if (mapped) topThreats.push(mapped);
        if (topThreats.length >= 3) break;
      }
    }
    if (Array.isArray(parsed.topOpportunities)) {
      for (const item of parsed.topOpportunities) {
        const mapped = mapCitedItem(item, alerts);
        if (mapped) topOpportunities.push(mapped);
        if (topOpportunities.length >= 3) break;
      }
    }
  } else {
    // Final fallback — produce a deterministic briefing from the alerts.
    rawText = heuristicBriefing(opts.companyName, dateKey, alerts, prevDay);
    const retry = parseLlmResponse(rawText);
    if (retry) {
      if (typeof retry.executiveSummary === "string") executiveSummary = retry.executiveSummary;
      if (typeof retry.sentimentShift === "string") sentimentShift = retry.sentimentShift;
      recommendedActions = asStringArray(retry.recommendedActions);
      if (Array.isArray(retry.topThreats)) {
        for (const item of retry.topThreats) {
          const mapped = mapCitedItem(item, alerts);
          if (mapped) topThreats.push(mapped);
          if (topThreats.length >= 3) break;
        }
      }
      if (Array.isArray(retry.topOpportunities)) {
        for (const item of retry.topOpportunities) {
          const mapped = mapCitedItem(item, alerts);
          if (mapped) topOpportunities.push(mapped);
          if (topOpportunities.length >= 3) break;
        }
      }
    }
  }

  // 5. Build citedAlertIds (unique, real) + sources list.
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

  logInfo("briefing.generate", `ok alerts=${alerts.length} cited=${citedAlertIds.length} model=${modelName} date=${dateKey}`);

  return {
    executiveSummary,
    topThreats,
    topOpportunities,
    sentimentShift,
    recommendedActions,
    citedAlertIds,
    sources,
    metadata: {
      alertCount: alerts.length,
      citedCount: citedAlertIds.length,
      model: modelName,
      generatedAt: new Date().toISOString(),
      windowStart: windowStart.toISOString(),
      windowEnd: windowEnd.toISOString(),
      companyName: opts.companyName,
      dateKey,
    },
  };
}

// ─── Heuristic fallback (when the SDK is unavailable) ──────────

function heuristicBriefing(
  companyName: string,
  dateKey: string,
  alerts: BriefingAlert[],
  prevDay: { positivePct: number; negativePct: number; total: number },
): string {
  const neg = alerts.filter((a) => a.sentiment === "negative");
  const pos = alerts.filter((a) => a.sentiment === "positive");
  const risks = alerts.filter((a) => a.kind === "risk_assessment");
  const topThreats = (risks.length > 0 ? risks : neg).slice(0, 3);
  const topOps = pos.slice(0, 3);
  const summary =
    `Heuristic briefing for ${companyName}, ${dateKey}. ${alerts.length} alerts in the last 24h ` +
    `(${neg.length} negative, ${pos.length} positive, ${risks.length} risk assessments). ` +
    `Previous-day baseline: ${prevDay.positivePct}% positive across ${prevDay.total} articles.`;
  const actions = defaultRecommendedActions(alerts, prevDay);
  const buildItems = (items: BriefingAlert[]) =>
    items.map((a, i) => ({ title: a.title, alertIndex: alerts.indexOf(a) + 1, reason: `Auto-flagged as a top ${a.sentiment === "negative" ? "threat" : "opportunity"} (${a.severity}).` }));
  return JSON.stringify({
    executiveSummary: summary,
    topThreats: buildItems(topThreats),
    topOpportunities: buildItems(topOps),
    sentimentShift: `Sentiment delta vs previous 24h baseline (${prevDay.positivePct}% positive): ${pos.length} positive vs ${neg.length} negative alerts today.`,
    recommendedActions: actions,
    citedAlertIds: [],
  });
}

function defaultRecommendedActions(
  alerts: BriefingAlert[],
  prevDay: { positivePct: number; negativePct: number; total: number },
): string[] {
  const recs: string[] = [];
  const critical = alerts.filter((a) => a.severity === "critical").length;
  if (critical > 0) {
    recs.push(`Address ${critical} critical alert(s) within 24 hours — convene the crisis comms cell and prepare a holding statement.`);
  }
  if (prevDay.negativePct > 30) {
    recs.push(`Negative coverage is elevated at ${prevDay.negativePct}% — prioritise outreach to the top 3 negative sources.`);
  } else {
    recs.push(`Negative coverage is contained at ${prevDay.negativePct}% — maintain the current media engagement cadence.`);
  }
  recs.push("Schedule a follow-up review at the start of the next cycle to measure progress against these actions.");
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
}): Promise<{ id: string; name: string } | null> {
  // Trader (harch-alpha) accounts have no primary Company — they monitor
  // Assets instead. For briefings we still surface company-level intel
  // from the first Company in the DB (the same convention used by the
  // console's alerts/weather/reports endpoints).
  const company = await prisma.company.findFirst({ orderBy: { createdAt: "asc" } });
  if (!company) return null;
  return { id: company.id, name: company.name };
}
