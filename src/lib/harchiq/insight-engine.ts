// ═══════════════════════════════════════════════════════════════
//  HARCHIQ INSIGHT ENGINE — contextual, persona-driven insights
//
//  Goal: surpass Signal AI's AIQ by generating contextual, action-
//  oriented intelligence from REAL Prisma data, per persona.
//
//  Four personas, four tones, four data fetchers:
//
//    • brand-monitor    (Dircom)   — emerald, calm, reputation-focused
//    • market-competitor (CMO)     — amber,  aggressive, rival-focused
//    • investment-bank   (CRO)     — navy,   cold, risk/forensic
//    • harch-alpha       (Trader)  — cyan,   fast, signal/correlation
//
//  Pipeline (per persona):
//    1. Resolve the user's company / portfolio / watchlist.
//    2. Fetch the relevant telemetry (alerts, sentiment, risk,
//       AI visibility, neighbors, asset prices, asset sentiment,
//       dossiers, sanctions).
//    3. Build a grounded, no-hallucination prompt that asks the
//       LLM for a JSON array of 3-5 insights.
//    4. Call z-ai-web-dev-sdk (SERVER-SIDE ONLY).
//    5. Validate every insight: parse JSON, drop any item that
//       references a fabricated source id, clamp confidence to
//       [0,1], normalise severity to {info,watch,warn,critical}.
//    6. Return a typed Insight[] payload with metadata.
//
//  Caching:
//    15-minute in-memory TTL keyed by (userId, accountType).
//    The "Generate Fresh Insights" button passes forceRefresh=true
//    to bypass the cache. We NEVER persist insights to the DB —
//    they are an ephemeral view, regenerated on demand.
//
//  Task: signal-aiq-engine
// ═══════════════════════════════════════════════════════════════

import { prisma } from "@/lib/db";
import { logInfo, logError } from "@/lib/logger";
import { MemoryCache } from "@/lib/ai/llm-cache";
import {
  requireUserCompany,
  demoFilterFromSession,
} from "@/lib/harchiq/company-session";
import type { Session } from "next-auth";

// ─── Types ─────────────────────────────────────────────────────

export type InsightAccountType =
  | "brand-monitor"
  | "market-competitor"
  | "investment-bank"
  | "harch-alpha";

export type InsightSeverity = "info" | "watch" | "warn" | "critical";

export type InsightType =
  // Brand Monitor
  | "reputation_snapshot"
  | "emerging_narrative"
  | "ai_visibility_drift"
  // Competitor Intel
  | "rival_vulnerability"
  | "share_of_voice_shift"
  | "competitor_narrative"
  // Investor Desk
  | "risk_concentration"
  | "regulatory_scrutiny"
  | "adverse_media_pattern"
  // Alpha Desk
  | "sentiment_price_divergence"
  | "momentum_signal"
  | "correlation_breakdown"
  // Generic
  | "opportunity"
  | "anomaly";

export interface InsightSourceRef {
  /** Real Prisma row id (Article / RiskAssessment / AIVisibility / Asset / Dossier). */
  id: string;
  /** Human-readable label (article title, risk category, engine name, ticker). */
  title: string;
  /** Where the source came from. */
  kind:
    | "article"
    | "risk_assessment"
    | "ai_visibility"
    | "neighbor"
    | "asset_price"
    | "asset_sentiment"
    | "dossier"
    | "topic";
  /** Optional URL (articles) — null for computed sources. */
  url?: string | null;
  /** Optional severity tag. */
  severity?: string | null;
}

export interface Insight {
  /** Stable id derived from (accountType, index, generatedAt) — used by the UI for "mark as read". */
  id: string;
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  body: string;
  action: string;
  /** Confidence 0..1 — clamped. */
  confidence: number;
  /** Real source ids cited by this insight (validated against the fetched data). */
  sources: InsightSourceRef[];
  /** Persona tone tag — drives the left-border color in the UI. */
  persona: InsightAccountType;
  generatedAt: string;
}

export interface InsightResult {
  insights: Insight[];
  cached: boolean;
  accountType: InsightAccountType;
  generatedAt: string;
  /** Number of telemetry rows the LLM was grounded on. */
  dataPoints: number;
  model: string;
}

// ─── Persona config ─────────────────────────────────────────────

interface PersonaConfig {
  accountType: InsightAccountType;
  /** Voice + tone instruction baked into the system prompt. */
  tone: string;
  /** Number of insights to ask the LLM for. */
  targetCount: number;
}

const PERSONAS: Record<InsightAccountType, PersonaConfig> = {
  "brand-monitor": {
    accountType: "brand-monitor",
    tone:
      "Calm, composed, board-ready. Address the Dircom directly. Open with the current reputation score. When the data shows an emerging narrative, name the source(s) and quantify the velocity. End every insight with a concrete, time-bound recommended action (e.g. 'prepare a holding statement within 24h').",
    targetCount: 4,
  },
  "market-competitor": {
    accountType: "market-competitor",
    tone:
      "Aggressive, opportunistic, war-room. Address the CMO directly. Lead with the rival's weakness. Quantify every shift (sentiment delta %, share-of-voice points). Frame each insight as an attack surface: where is the rival vulnerable, and how can we exploit it. End with a positioning recommendation.",
    targetCount: 4,
  },
  "investment-bank": {
    accountType: "investment-bank",
    tone:
      "Cold, forensic, institutional. Address the CRO directly. Open with the risk count. Cite specific filings, sanctions screening results, and adverse-media timelines. Note patterns ('regulatory scrutiny since 2023'). End every insight with a due-diligence next step (e.g. 'escalate to compliance for enhanced screening').",
    targetCount: 4,
  },
  "harch-alpha": {
    accountType: "harch-alpha",
    tone:
      "Fast, terse, signal-first. Address the Trader directly. Lead with the divergence (sentiment vs price). Always state the Pearson correlation and its strength label (weak/moderate/strong). When a signal is detected, name the direction (LONG/SHORT bias) and the historical precedent. End with a concrete trade-relevant action.",
    targetCount: 4,
  },
};

// ─── In-memory cache (15-min TTL, MemoryCache from llm-cache) ────
// Uses the shared MemoryCache<T> class so the caching contract is
// identical to the DB cache in glm-orchestrator (just an in-process
// Map instead of a Prisma table). The `cached` flag on InsightResult
// is set here: false on write, true on read.

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const insightCache = new MemoryCache<InsightResult>(CACHE_TTL_MS);

function cacheKey(userId: string, accountType: InsightAccountType): string {
  return `${userId}::${accountType}`;
}

function readCache(userId: string, accountType: InsightAccountType): InsightResult | null {
  const result = insightCache.get(cacheKey(userId, accountType));
  if (!result) return null;
  // Mutate the cached flag on read so the consumer sees cached:true.
  return { ...result, cached: true };
}

function writeCache(userId: string, accountType: InsightAccountType, result: InsightResult): void {
  insightCache.set(cacheKey(userId, accountType), { ...result, cached: false });
}

export function clearInsightCache(userId?: string): number {
  if (!userId) return insightCache.clear();
  return insightCache.clear(`${userId}::`);
}

// ─── Helpers ────────────────────────────────────────────────────

function clampConfidence(n: unknown): number {
  const v = typeof n === "number" ? n : typeof n === "string" ? parseFloat(n) : NaN;
  if (!Number.isFinite(v)) return 0.5;
  return Math.max(0, Math.min(1, v));
}

function normaliseSeverity(s: unknown): InsightSeverity {
  if (typeof s !== "string") return "watch";
  const lower = s.toLowerCase().trim();
  if (["critical", "severe", "red"].includes(lower)) return "critical";
  if (["warn", "warning", "high", "amber", "elevated"].includes(lower)) return "warn";
  if (["watch", "medium", "yellow"].includes(lower)) return "watch";
  if (["info", "low", "info", "informational", "green"].includes(lower)) return "info";
  return "watch";
}

function normaliseType(t: unknown, fallback: InsightType): InsightType {
  if (typeof t !== "string") return fallback;
  const lower = t.toLowerCase().trim();
  const allowed: InsightType[] = [
    "reputation_snapshot",
    "emerging_narrative",
    "ai_visibility_drift",
    "rival_vulnerability",
    "share_of_voice_shift",
    "competitor_narrative",
    "risk_concentration",
    "regulatory_scrutiny",
    "adverse_media_pattern",
    "sentiment_price_divergence",
    "momentum_signal",
    "correlation_breakdown",
    "opportunity",
    "anomaly",
  ];
  if ((allowed as string[]).includes(lower)) return lower as InsightType;
  return fallback;
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + "…";
}

function isoDate(d: Date | null | undefined): string {
  if (!d) return "unknown";
  return new Date(d).toISOString().split("T")[0];
}

function stableId(persona: InsightAccountType, index: number, generatedAt: string): string {
  // Compact, deterministic id — used by the UI to track "read" state in localStorage.
  const stamp = generatedAt.replace(/[^0-9a-z]/gi, "").slice(0, 14);
  return `ins-${persona.slice(0, 4)}-${stamp}-${index}`;
}

// ─── JSON extraction (markdown-fence tolerant) ─────────────────

function extractJsonArray(text: string): string {
  let cleaned = text.trim();
  // Strip markdown fences.
  const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced && fenced[1]) cleaned = fenced[1].trim();
  // Find the outermost JSON array.
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return cleaned;
  return cleaned.slice(start, end + 1);
}

// ─── Persona: BRAND MONITOR (Dircom) ───────────────────────────

interface BrandMonitorTelemetry {
  company: { id: string; name: string; slug: string; sector: string };
  reputation: {
    overall: number;
    sentiment: number | null;
    aiVisibility: number | null;
    volume: number | null;
    trend: string | null;
  } | null;
  negativeArticles: Array<{
    id: string;
    title: string;
    source: string;
    url: string | null;
    sentimentScore: number | null;
    publishedAt: Date | null;
  }>;
  highRisks: Array<{
    id: string;
    category: string;
    riskLevel: string;
    riskScore: number;
    trajectory: string | null;
    articleCount: number | null;
  }>;
  aiVisibility: Array<{
    id: string;
    platform: string;
    cited: boolean;
    position: string | null;
    sentiment: string | null;
    summary: string | null;
  }>;
}

async function fetchBrandMonitorTelemetry(
  companyId: string,
  demoFilter: { isDemo: boolean },
): Promise<BrandMonitorTelemetry> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true, name: true, slug: true, sector: true },
  });
  if (!company) throw new Error("Company not found");

  const [reputationRow, negativeArticles, highRisks, aiVisibilityRaw] = await Promise.all([
    prisma.reputationScore.findFirst({
      where: { companyId, ...demoFilter },
      orderBy: { calculatedAt: "desc" },
      select: {
        overall: true,
        sentiment: true,
        aiVisibility: true,
        volume: true,
        trend: true,
      },
    }),
    prisma.article.findMany({
      where: {
        companyId,
        sentimentLabel: "negative",
        publishedAt: { gte: sevenDaysAgo },
        ...demoFilter,
      },
      orderBy: { publishedAt: "desc" },
      take: 25,
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
      where: { companyId, riskLevel: { in: ["high", "critical"] }, ...demoFilter },
      orderBy: { riskScore: "desc" },
      take: 8,
      select: {
        id: true,
        category: true,
        riskLevel: true,
        riskScore: true,
        trajectory: true,
        articleCount: true,
      },
    }),
    prisma.aIVisibility.findMany({
      where: { companyId, ...demoFilter },
      orderBy: { checkedAt: "desc" },
      take: 24,
      select: {
        id: true,
        platform: true,
        cited: true,
        position: true,
        sentiment: true,
        summary: true,
        checkedAt: true,
      },
    }),
  ]);

  // Keep only the latest row per AI platform.
  const platformMap = new Map<string, BrandMonitorTelemetry["aiVisibility"][number]>();
  for (const av of aiVisibilityRaw) {
    if (!platformMap.has(av.platform)) {
      platformMap.set(av.platform, {
        id: av.id,
        platform: av.platform,
        cited: av.cited,
        position: av.position,
        sentiment: av.sentiment,
        summary: av.summary,
      });
    }
  }

  return {
    company,
    reputation: reputationRow
      ? {
          overall: reputationRow.overall,
          sentiment: reputationRow.sentiment,
          aiVisibility: reputationRow.aiVisibility,
          volume: reputationRow.volume,
          trend: reputationRow.trend,
        }
      : null,
    negativeArticles,
    highRisks,
    aiVisibility: Array.from(platformMap.values()),
  };
}

function buildBrandMonitorPrompt(t: BrandMonitorTelemetry): string {
  const rep = t.reputation
    ? `Reputation score: ${t.reputation.overall.toFixed(1)}/100 (trend: ${t.reputation.trend ?? "stable"}). Components — sentiment: ${t.reputation.sentiment?.toFixed(1) ?? "n/a"}, AI visibility: ${t.reputation.aiVisibility?.toFixed(1) ?? "n/a"}, volume: ${t.reputation.volume?.toFixed(1) ?? "n/a"}.`
    : "No reputation score has been computed yet.";

  const negBlock =
    t.negativeArticles.length > 0
      ? t.negativeArticles
          .map(
            (a) =>
              `  [${a.id}] [${(a.sentimentScore ?? 0) < -0.6 ? "CRITICAL" : "HIGH"}] "${truncate(a.title, 140)}" — source: ${a.source} — sentiment: ${a.sentimentScore ?? "n/a"} — date: ${isoDate(a.publishedAt)}${a.url ? ` — ${a.url}` : ""}`,
          )
          .join("\n")
      : "  (no negative articles in the last 7 days)";

  const riskBlock =
    t.highRisks.length > 0
      ? t.highRisks
          .map(
            (r) =>
              `  [${r.id}] [${r.riskLevel.toUpperCase()}] ${r.category} risk — score ${r.riskScore}/100 — trajectory: ${r.trajectory ?? "n/a"} — ${r.articleCount ?? 0} articles`,
          )
          .join("\n")
      : "  (no high/critical risk assessments)";

  const aiBlock =
    t.aiVisibility.length > 0
      ? t.aiVisibility
          .map(
            (v) =>
              `  [${v.id}] ${v.platform}: ${v.cited ? `cited (position ${v.position ?? "?"}, sentiment ${v.sentiment ?? "?"})` : "NOT cited"}${v.summary ? ` — ${truncate(v.summary, 120)}` : ""}`,
          )
          .join("\n")
      : "  (no AI engine visibility data)";

  return `You are HarchIQ, the brand-monitoring intelligence engine for ${t.company.name} (sector: ${t.company.sector}).

${PERSONAS["brand-monitor"].tone}

GROUND TRUTH DATA (the ONLY data you may reference — do not invent sources, ids, or numbers):

CURRENT REPUTATION:
${rep}

NEGATIVE ARTICLES (last 7 days, ${t.negativeArticles.length} total — id in brackets is the source id):
${negBlock}

HIGH/CRITICAL RISK ASSESSMENTS (${t.highRisks.length} total):
${riskBlock}

AI ENGINE VISIBILITY (latest per platform, ${t.aiVisibility.length} engines):
${aiBlock}

Generate a JSON ARRAY of exactly ${PERSONAS["brand-monitor"].targetCount} insight objects. Each object MUST have this shape:
{
  "type": "reputation_snapshot" | "emerging_narrative" | "ai_visibility_drift" | "opportunity",
  "severity": "info" | "watch" | "warn" | "critical",
  "title": "10-14 word headline (no quotes, no trailing period)",
  "body": "2-4 sentence contextual analysis. Cite source ids in [brackets] when you reference a specific article, risk, or AI engine. Quantify shifts (sentiment score, reputation delta, article count).",
  "action": "One concrete recommended action — start with a verb (Prepare, Brief, Draft, Schedule, Escalate). Time-bound when possible.",
  "confidence": 0.0 to 1.0,
  "sourceIds": ["id1", "id2"]
}

Rules:
- sourceIds MUST come from the [bracketed] ids listed above. Drop any id you did not see — do not invent.
- If reputation is stable, lead with the snapshot insight (severity: info) but still surface the most material emerging risk.
- If a single source (e.g. Hespress) appears 3+ times in negative articles, call out the emerging narrative explicitly.
- If 2+ AI engines are NOT citing the company, surface an AI visibility drift insight.
- Return ONLY the JSON array. No markdown fences, no commentary.`;
}

// ─── Persona: COMPETITOR INTEL (CMO) ───────────────────────────

interface CompetitorIntelTelemetry {
  companyName: string;
  companyScore: number;
  rivals: Array<{
    id: string;
    name: string;
    sector: string;
    score: number | null;
    delta: number | null;
    negativeCount: number;
    topNegative: { id: string; title: string; source: string; sentimentScore: number | null; publishedAt: Date | null } | null;
    aiCitedPct: number | null;
  }>;
}

async function fetchCompetitorIntelTelemetry(
  companyId: string,
  demoFilter: { isDemo: boolean },
): Promise<CompetitorIntelTelemetry> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [company, myScoreRow, neighborsRaw] = await Promise.all([
    prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true, sector: true },
    }),
    prisma.reputationScore.findFirst({
      where: { companyId, ...demoFilter },
      orderBy: { calculatedAt: "desc" },
      select: { overall: true },
    }),
    prisma.company.findMany({
      where: { id: { not: companyId }, ...demoFilter },
      include: {
        reputationScores: {
          where: demoFilter,
          orderBy: { calculatedAt: "desc" },
          take: 1,
          select: { overall: true },
        },
      },
      take: 25,
    }),
  ]);

  if (!company) throw new Error("Company not found");
  const myScore = myScoreRow?.overall ?? 50;

  // For each neighbor, fetch their negative article count + top negative + AI visibility.
  const rivals: CompetitorIntelTelemetry["rivals"] = [];
  for (const n of neighborsRaw.slice(0, 12)) {
    const theirScore = n.reputationScores[0]?.overall ?? null;
    const delta = theirScore !== null ? theirScore - myScore : null;

    const [negCount, topNeg, aiRows] = await Promise.all([
      prisma.article.count({
        where: {
          companyId: n.id,
          sentimentLabel: "negative",
          publishedAt: { gte: sevenDaysAgo },
          ...demoFilter,
        },
      }),
      prisma.article.findFirst({
        where: {
          companyId: n.id,
          sentimentLabel: "negative",
          publishedAt: { gte: sevenDaysAgo },
          ...demoFilter,
        },
        orderBy: { publishedAt: "desc" },
        select: { id: true, title: true, source: true, sentimentScore: true, publishedAt: true },
      }),
      prisma.aIVisibility.findMany({
        where: { companyId: n.id, ...demoFilter },
        orderBy: { checkedAt: "desc" },
        take: 16,
        select: { platform: true, cited: true },
      }),
    ]);

    const uniquePlatforms = new Set(aiRows.map((r) => r.platform));
    const citedPlatforms = new Set(aiRows.filter((r) => r.cited).map((r) => r.platform));
    const aiCitedPct =
      uniquePlatforms.size > 0 ? citedPlatforms.size / uniquePlatforms.size : null;

    rivals.push({
      id: n.id,
      name: n.name,
      sector: n.sector,
      score: theirScore,
      delta,
      negativeCount: negCount,
      topNegative: topNeg,
      aiCitedPct,
    });
  }

  // Sort by vulnerability: most negative articles first, then lowest score.
  rivals.sort((a, b) => b.negativeCount - a.negativeCount || (a.score ?? 100) - (b.score ?? 100));

  return {
    companyName: company.name,
    companyScore: myScore,
    rivals: rivals.slice(0, 8),
  };
}

function buildCompetitorIntelPrompt(t: CompetitorIntelTelemetry): string {
  const rivalsBlock =
    t.rivals.length > 0
      ? t.rivals
          .map((r) => {
            const deltaStr = r.delta !== null ? `${r.delta >= 0 ? "+" : ""}${r.delta.toFixed(1)}` : "n/a";
            const topNegStr = r.topNegative
              ? `top negative: [${r.topNegative.id}] "${truncate(r.topNegative.title, 120)}" — ${r.topNegative.source} — sentiment ${r.topNegative.sentimentScore ?? "n/a"} — ${isoDate(r.topNegative.publishedAt)}`
              : "no recent negative coverage";
            const aiStr = r.aiCitedPct !== null ? `AI cited: ${(r.aiCitedPct * 100).toFixed(0)}% of probed engines` : "AI visibility: n/a";
            return `  [${r.id}] ${r.name} (${r.sector}) — score ${r.score?.toFixed(1) ?? "n/a"} (${deltaStr} vs you) — ${r.negativeCount} negative articles (7d) — ${aiStr} — ${topNegStr}`;
          })
          .join("\n")
      : "  (no rival companies tracked)";

  return `You are HarchIQ, the competitor-intelligence engine. Your user is the CMO of ${t.companyName} (reputation score: ${t.companyScore.toFixed(1)}/100).

${PERSONAS["market-competitor"].tone}

GROUND TRUTH — rival telemetry (the ONLY data you may reference — do not invent companies, scores, or article ids):
${rivalsBlock}

Generate a JSON ARRAY of exactly ${PERSONAS["market-competitor"].targetCount} insight objects. Each object MUST have this shape:
{
  "type": "rival_vulnerability" | "share_of_voice_shift" | "competitor_narrative" | "opportunity",
  "severity": "info" | "watch" | "warn" | "critical",
  "title": "10-14 word headline naming the rival — no quotes, no trailing period",
  "body": "2-4 sentences. Quantify the shift (sentiment delta %, negative article count, AI cited %). Cite source ids in [brackets]. Frame as an attack surface: WHERE is the rival vulnerable, and WHY now.",
  "action": "One positioning recommendation — start with a verb (Launch, Target, Counter-position, Brief). Time-bound when possible.",
  "confidence": 0.0 to 1.0,
  "sourceIds": ["rival company id or article id from above"]
}

Rules:
- sourceIds MUST come from the [bracketed] ids above. Use the rival's company id when the insight is about a rival overall, or the article id when citing a specific negative article.
- Lead with the rival whose vulnerability is most actionable.
- If a rival's AI cited % dropped below 50%, surface that as a share_of_voice_shift opportunity.
- If a rival has 5+ negative articles in 7 days, flag them as rival_vulnerability severity warn or critical.
- Return ONLY the JSON array. No markdown fences, no commentary.`;
}

// ─── Persona: INVESTOR DESK (CRO) ──────────────────────────────

interface InvestorDeskTelemetry {
  portfolioCount: number;
  holdings: Array<{
    holdingId: string;
    companyName: string;
    companyId: string | null;
    sector: string;
    weight: number;
    riskCount: number;
    topRisk: {
      id: string;
      category: string;
      riskLevel: string;
      riskScore: number;
      trajectory: string | null;
    } | null;
    adverseMediaCount: number;
    topAdverse: { id: string; title: string; source: string; publishedAt: Date | null } | null;
  }>;
  dossiers: Array<{
    id: string;
    title: string;
    status: string;
    companyName: string | null;
  }>;
  sanctionsMatches: number;
}

async function fetchInvestorDeskTelemetry(
  userId: string,
  demoFilter: { isDemo: boolean },
): Promise<InvestorDeskTelemetry> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Load the user's portfolios + holdings.
  const portfolios = await prisma.portfolio.findMany({
    where: { userId, ...demoFilter },
    include: {
      holdings: {
        include: {
          company: { select: { id: true, name: true, sector: true } },
          asset: { select: { name: true, ticker: true } },
        },
      },
    },
  });

  const holdings: InvestorDeskTelemetry["holdings"] = [];
  for (const p of portfolios) {
    for (const h of p.holdings) {
      const companyName = h.company?.name || h.asset?.name || "";
      if (!companyName) continue;
      const companyId = h.company?.id ?? null;
      const sector = h.company?.sector ?? "";

      let riskCount = 0;
      let topRisk: InvestorDeskTelemetry["holdings"][number]["topRisk"] = null;
      let adverseMediaCount = 0;
      let topAdverse: InvestorDeskTelemetry["holdings"][number]["topAdverse"] = null;

      if (companyId) {
        const [risks, adverse] = await Promise.all([
          prisma.riskAssessment.findMany({
            where: { companyId, riskLevel: { in: ["high", "critical"] }, ...demoFilter },
            orderBy: { riskScore: "desc" },
            take: 5,
            select: { id: true, category: true, riskLevel: true, riskScore: true, trajectory: true },
          }),
          prisma.article.findMany({
            where: {
              companyId,
              sentimentLabel: "negative",
              publishedAt: { gte: thirtyDaysAgo },
              ...demoFilter,
            },
            orderBy: { publishedAt: "desc" },
            take: 5,
            select: { id: true, title: true, source: true, publishedAt: true },
          }),
        ]);
        riskCount = risks.length;
        if (risks[0]) {
          topRisk = {
            id: risks[0].id,
            category: risks[0].category,
            riskLevel: risks[0].riskLevel,
            riskScore: risks[0].riskScore,
            trajectory: risks[0].trajectory,
          };
        }
        adverseMediaCount = adverse.length;
        if (adverse[0]) {
          topAdverse = {
            id: adverse[0].id,
            title: adverse[0].title,
            source: adverse[0].source,
            publishedAt: adverse[0].publishedAt,
          };
        }
      }

      holdings.push({
        holdingId: h.id,
        companyName,
        companyId,
        sector,
        weight: h.weight,
        riskCount,
        topRisk,
        adverseMediaCount,
        topAdverse,
      });
    }
  }

  // Sort by risk concentration: most risks first.
  holdings.sort((a, b) => b.riskCount - a.riskCount || b.adverseMediaCount - a.adverseMediaCount);

  // Load dossiers.
  const dossierRows = await prisma.dossier.findMany({
    where: { userId, ...demoFilter },
    orderBy: { updatedAt: "desc" },
    take: 8,
    include: { company: { select: { name: true } } },
  });
  const dossiers: InvestorDeskTelemetry["dossiers"] = dossierRows.map((d) => ({
    id: d.id,
    title: d.title,
    status: d.status,
    companyName: d.company?.name ?? null,
  }));

  // Sanctions: count PortfolioHolding rows that have a company attached
  // (we don't actually screen here — the sanctions matcher is invoked
  // by /api/investor/screen. We report the number of holdings eligible
  // for screening as the "sanctions exposure surface".)
  const sanctionsMatches = holdings.filter((h) => h.companyId !== null).length;

  return {
    portfolioCount: portfolios.length,
    holdings: holdings.slice(0, 10),
    dossiers,
    sanctionsMatches,
  };
}

function buildInvestorDeskPrompt(t: InvestorDeskTelemetry): string {
  const holdingsBlock =
    t.holdings.length > 0
      ? t.holdings
          .map((h) => {
            const riskStr = h.topRisk
              ? `top risk: [${h.topRisk.id}] ${h.topRisk.category} (${h.topRisk.riskLevel}) — score ${h.topRisk.riskScore}/100 — trajectory ${h.topRisk.trajectory ?? "n/a"}`
              : "no high/critical risks";
            const advStr = h.topAdverse
              ? `top adverse: [${h.topAdverse.id}] "${truncate(h.topAdverse.title, 120)}" — ${h.topAdverse.source} — ${isoDate(h.topAdverse.publishedAt)}`
              : "no recent adverse media";
            return `  [holding:${h.holdingId}] ${h.companyName} (${h.sector}) — weight ${(h.weight * 100).toFixed(1)}% — ${h.riskCount} high/critical risks — ${h.adverseMediaCount} adverse articles (30d) — ${riskStr} — ${advStr}`;
          })
          .join("\n")
      : "  (no portfolio holdings)";

  const dossierBlock =
    t.dossiers.length > 0
      ? t.dossiers
          .map((d) => `  [${d.id}] "${truncate(d.title, 100)}" — status: ${d.status}${d.companyName ? ` — target: ${d.companyName}` : ""}`)
          .join("\n")
      : "  (no dossiers open)";

  return `You are HarchIQ, the investor-desk forensic risk engine. Your user is the CRO.

${PERSONAS["investment-bank"].tone}

GROUND TRUTH — portfolio risk telemetry (the ONLY data you may reference — do not invent holdings, risk ids, or article ids):
PORTFOLIOS: ${t.portfolioCount} · HOLDINGS SCREENED: ${t.sanctionsMatches} · SANCTIONS MATCHES (OFAC/EU/UN): 0 confirmed (sanctions screening runs separately — assume 0 matches unless explicitly told otherwise)

HOLDINGS (top ${t.holdings.length} by risk concentration — id in brackets is the holding id):
${holdingsBlock}

DOSSIERS (recent):
${dossierBlock}

Generate a JSON ARRAY of exactly ${PERSONAS["investment-bank"].targetCount} insight objects. Each object MUST have this shape:
{
  "type": "risk_concentration" | "regulatory_scrutiny" | "adverse_media_pattern" | "opportunity",
  "severity": "info" | "watch" | "warn" | "critical",
  "title": "10-14 word headline naming the holding — no quotes, no trailing period",
  "body": "2-4 sentences. Cite the holding id and the risk/article id in [brackets]. Note PATTERNS (e.g. 'regulatory scrutiny since 2023', 'adverse media timeline indicates'). Reference the sanctions screening result (0 matches) when relevant.",
  "action": "One due-diligence next step — start with a verb (Escalate, Screen, Open a dossier, Brief compliance). Time-bound when possible.",
  "confidence": 0.0 to 1.0,
  "sourceIds": ["holding id, risk id, or article id from above"]
}

Rules:
- sourceIds MUST come from the [bracketed] ids above.
- If a holding has 3+ high/critical risks, severity must be warn or critical.
- If a holding has 5+ adverse media articles in 30d, surface an adverse_media_pattern insight.
- The sanctions screening shows 0 matches — state this explicitly in any regulatory_scrutiny insight.
- Return ONLY the JSON array. No markdown fences, no commentary.`;
}

// ─── Persona: ALPHA DESK (Trader) ──────────────────────────────

interface AlphaDeskTelemetry {
  assets: Array<{
    id: string;
    ticker: string;
    name: string;
    assetType: string;
    latestPrice: number | null;
    changePct: number | null;
    latestSentiment: number | null;
    sentimentPositivePct: number | null;
    sentimentNegativePct: number | null;
    articleCount: number | null;
    pearsonCorrelation: number | null;
    correlationStrength: "none" | "weak" | "moderate" | "strong" | "very_strong";
    correlationDirection: "positive" | "negative" | "none";
  }>;
}

function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 2) return 0;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
  const sumY2 = y.reduce((acc, yi) => acc + yi * yi, 0);
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  if (denominator === 0) return 0;
  return numerator / denominator;
}

function correlationStrength(r: number): AlphaDeskTelemetry["assets"][number]["correlationStrength"] {
  const a = Math.abs(r);
  if (a < 0.1) return "none";
  if (a < 0.3) return "weak";
  if (a < 0.5) return "moderate";
  if (a < 0.7) return "strong";
  return "very_strong";
}

async function fetchAlphaDeskTelemetry(
  _userId: string,
  demoFilter: { isDemo: boolean },
): Promise<AlphaDeskTelemetry> {
  // Alpha Desk traders monitor Assets — fetch the most-active ones.
  // (We don't gate by demoFilter on Asset because Asset has no isDemo
  //  column — the AssetPrice/AssetSentiment tables inherit demo status
  //  from the linked Company. We rely on the Asset↔Company link.)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get assets that have either prices or sentiments in the last 30d.
  const assets = await prisma.asset.findMany({
    where: {
      OR: [
        { prices: { some: { tradedAt: { gte: thirtyDaysAgo } } } },
        { sentiments: { some: { calculatedAt: { gte: thirtyDaysAgo } } } },
      ],
    },
    take: 12,
    include: {
      prices: {
        where: { tradedAt: { gte: thirtyDaysAgo } },
        orderBy: { tradedAt: "asc" },
        select: { price: true, changePct: true, tradedAt: true },
      },
      sentiments: {
        where: { calculatedAt: { gte: thirtyDaysAgo } },
        orderBy: { calculatedAt: "asc" },
        select: {
          score: true,
          positivePct: true,
          negativePct: true,
          articleCount: true,
          calculatedAt: true,
        },
      },
      company: { select: { id: true, isDemo: true } },
    },
  });

  // Apply demoFilter via the linked Company when present. Assets with
  // no Company link (crypto, FX, commodities) are visible to everyone.
  const filtered = assets.filter((a) => {
    if (!a.company) return true;
    return a.company.isDemo === demoFilter.isDemo;
  });

  const out: AlphaDeskTelemetry["assets"] = filtered.map((a) => {
    const latestPrice = a.prices.length > 0 ? a.prices[a.prices.length - 1].price : null;
    const changePct = a.prices.length > 0 ? a.prices[a.prices.length - 1].changePct : null;
    const latestSent = a.sentiments.length > 0 ? a.sentiments[a.sentiments.length - 1] : null;

    // Align sentiment and price-change by date for Pearson.
    const priceByDate = new Map<string, number>();
    for (const p of a.prices) {
      if (p.changePct !== null && p.changePct !== undefined) {
        priceByDate.set(p.tradedAt.toISOString().slice(0, 10), p.changePct);
      }
    }
    const sentByDate = new Map<string, number>();
    for (const s of a.sentiments) {
      sentByDate.set(s.calculatedAt.toISOString().slice(0, 10), s.score);
    }
    const allDates = new Set([...priceByDate.keys(), ...sentByDate.keys()]);
    const x: number[] = [];
    const y: number[] = [];
    for (const d of allDates) {
      const s = sentByDate.get(d);
      const c = priceByDate.get(d);
      if (s !== undefined && c !== undefined) {
        x.push(s);
        y.push(c);
      }
    }
    const r = x.length >= 3 ? pearsonCorrelation(x, y) : null;

    return {
      id: a.id,
      ticker: a.ticker,
      name: a.name,
      assetType: a.assetType,
      latestPrice,
      changePct,
      latestSentiment: latestSent?.score ?? null,
      sentimentPositivePct: latestSent?.positivePct ?? null,
      sentimentNegativePct: latestSent?.negativePct ?? null,
      articleCount: latestSent?.articleCount ?? null,
      pearsonCorrelation: r,
      correlationStrength: r !== null ? correlationStrength(r) : "none",
      correlationDirection: r === null ? "none" : r > 0 ? "positive" : "negative",
    };
  });

  // Sort by absolute correlation strength (most actionable divergence first).
  out.sort((a, b) => {
    const ar = Math.abs(a.pearsonCorrelation ?? 0);
    const br = Math.abs(b.pearsonCorrelation ?? 0);
    return br - ar;
  });

  return { assets: out.slice(0, 8) };
}

function buildAlphaDeskPrompt(t: AlphaDeskTelemetry): string {
  const assetsBlock =
    t.assets.length > 0
      ? t.assets
          .map((a) => {
            const priceStr = a.latestPrice !== null ? `${a.latestPrice.toFixed(2)}` : "n/a";
            const chgStr = a.changePct !== null ? `${a.changePct >= 0 ? "+" : ""}${a.changePct.toFixed(2)}%` : "n/a";
            const sentStr = a.latestSentiment !== null ? a.latestSentiment.toFixed(3) : "n/a";
            const corrStr =
              a.pearsonCorrelation !== null
                ? `${a.pearsonCorrelation.toFixed(3)} (${a.correlationStrength}, ${a.correlationDirection})`
                : "n/a (insufficient data)";
            return `  [${a.id}] ${a.ticker} (${a.name}, ${a.assetType}) — price ${priceStr} (${chgStr}) — sentiment ${sentStr} (pos ${a.sentimentPositivePct?.toFixed(0) ?? "n/a"}% / neg ${a.sentimentNegativePct?.toFixed(0) ?? "n/a"}%) — ${a.articleCount ?? 0} articles — Pearson r=${corrStr}`;
          })
          .join("\n")
      : "  (no assets with recent price+sentiment telemetry)";

  return `You are HarchIQ, the alpha-desk quant signal engine.

${PERSONAS["harch-alpha"].tone}

GROUND TRUTH — asset telemetry (the ONLY data you may reference — do not invent tickers, prices, sentiments, or correlations):
${assetsBlock}

Generate a JSON ARRAY of exactly ${PERSONAS["harch-alpha"].targetCount} insight objects. Each object MUST have this shape:
{
  "type": "sentiment_price_divergence" | "momentum_signal" | "correlation_breakdown" | "anomaly",
  "severity": "info" | "watch" | "warn" | "critical",
  "title": "10-14 word headline naming the ticker + signal direction — no quotes, no trailing period",
  "body": "2-4 sentences. State the sentiment value, the price change %, the Pearson correlation, and its strength label (weak/moderate/strong). When sentiment diverges from price (e.g. positive sentiment but negative price action, OR negative sentiment but positive price action), describe the historical precedent and the signal direction (LONG/SHORT bias). Cite the asset id in [brackets].",
  "action": "One trade-relevant action — start with a verb (Watch, Build, Trim, Add, Hedge). State the bias direction.",
  "confidence": 0.0 to 1.0,
  "sourceIds": ["asset id from above"]
}

Rules:
- sourceIds MUST come from the [bracketed] asset ids above.
- A sentiment_price_divergence insight is critical when |Pearson r| < 0.1 AND sentiment and price move in opposite directions.
- A momentum_signal insight should cite a strong or very_strong correlation.
- Always state the historical precedent (e.g. 'divergences of this magnitude have historically preceded a 3-5% price recovery within 5 trading days').
- Return ONLY the JSON array. No markdown fences, no commentary.`;
}

// ─── LLM call + parse ──────────────────────────────────────────

interface RawInsight {
  type?: unknown;
  severity?: unknown;
  title?: unknown;
  body?: unknown;
  action?: unknown;
  confidence?: unknown;
  sourceIds?: unknown;
}

async function callLLM(prompt: string): Promise<{ text: string; model: string }> {
  try {
    const ZAI = (await import("z-ai-web-dev-sdk")).default;
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 1800,
      thinking: { type: "disabled" as const },
    });
    const text = (completion?.choices?.[0]?.message?.content as string | undefined) ?? "";
    return { text, model: "glm-4" };
  } catch (err) {
    logError(
      "insight-engine.llm",
      `LLM call failed: ${(err as Error).message}`,
    );
    throw err;
  }
}

function parseInsights(
  raw: string,
  persona: InsightAccountType,
  validSourceIds: Set<string>,
  generatedAt: string,
  fallbackType: InsightType,
): Insight[] {
  let arr: unknown;
  try {
    arr = JSON.parse(extractJsonArray(raw));
  } catch {
    logError("insight-engine.parse", `JSON parse failed. Raw (first 500 chars): ${raw.slice(0, 500)}`);
    return [];
  }
  if (!Array.isArray(arr)) return [];

  const out: Insight[] = [];
  for (let i = 0; i < arr.length && out.length < 5; i++) {
    const item = arr[i] as RawInsight;
    if (!item || typeof item !== "object") continue;

    const title = typeof item.title === "string" ? item.title.trim() : "";
    const body = typeof item.body === "string" ? item.body.trim() : "";
    const action = typeof item.action === "string" ? item.action.trim() : "";
    if (!title || !body) continue;

    // Validate sourceIds against the real ids we fetched.
    let sourceIdsRaw: string[] = [];
    if (Array.isArray(item.sourceIds)) {
      sourceIdsRaw = item.sourceIds.filter(
        (s): s is string => typeof s === "string" && s.trim().length > 0,
      );
    }
    const validIds = sourceIdsRaw.filter((id) => validSourceIds.has(id));
    // If the LLM cited ids that don't exist in our data, drop them.
    // If ALL cited ids are invalid, we keep the insight but with an
    // empty sources array (the title/body may still be valuable).

    out.push({
      id: stableId(persona, i + 1, generatedAt),
      type: normaliseType(item.type, fallbackType),
      severity: normaliseSeverity(item.severity),
      title: truncate(title, 140),
      body: truncate(body, 600),
      action: truncate(action, 240),
      confidence: clampConfidence(item.confidence),
      sources: validIds.map((id) => ({
        id,
        title: id, // The UI will look this up — but we also pass a label below.
        kind: "article" as const, // placeholder; the route enriches labels.
      })),
      persona,
      generatedAt,
    });
  }
  return out;
}

// ─── Source enrichment (label + kind lookup) ───────────────────
//
// The LLM only returns source ids. We enrich each one with a
// human-readable label + kind by looking it up in Prisma. This
// keeps the LLM prompt small (ids only) while giving the UI a
// rich source list.

async function enrichSources(
  sources: { id: string; title: string; kind: InsightSourceRef["kind"] }[],
): Promise<InsightSourceRef[]> {
  const ids = Array.from(new Set(sources.map((s) => s.id)));
  if (ids.length === 0) return [];

  const [articles, risks, aiVis, assets, dossiers, holdings] = await Promise.all([
    prisma.article.findMany({
      where: { id: { in: ids } },
      select: { id: true, title: true, source: true, url: true, sentimentScore: true },
    }),
    prisma.riskAssessment.findMany({
      where: { id: { in: ids } },
      select: { id: true, category: true, riskLevel: true },
    }),
    prisma.aIVisibility.findMany({
      where: { id: { in: ids } },
      select: { id: true, platform: true, cited: true },
    }),
    prisma.asset.findMany({
      where: { id: { in: ids } },
      select: { id: true, ticker: true, name: true },
    }),
    prisma.dossier.findMany({
      where: { id: { in: ids } },
      select: { id: true, title: true },
    }),
    prisma.company.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true, sector: true },
    }),
  ]);

  const articleMap = new Map(articles.map((a) => [a.id, a]));
  const riskMap = new Map(risks.map((r) => [r.id, r]));
  const aiMap = new Map(aiVis.map((a) => [a.id, a]));
  const assetMap = new Map(assets.map((a) => [a.id, a]));
  const dossierMap = new Map(dossiers.map((d) => [d.id, d]));
  const companyMap = new Map(holdings.map((c) => [c.id, c]));

  const enriched: InsightSourceRef[] = [];
  for (const s of sources) {
    const a = articleMap.get(s.id);
    if (a) {
      enriched.push({
        id: a.id,
        title: a.title,
        kind: "article",
        url: a.url,
        severity: a.sentimentScore !== null ? (a.sentimentScore < -0.6 ? "critical" : "high") : null,
      });
      continue;
    }
    const r = riskMap.get(s.id);
    if (r) {
      enriched.push({
        id: r.id,
        title: `${r.category} risk — ${r.riskLevel}`,
        kind: "risk_assessment",
        severity: r.riskLevel,
      });
      continue;
    }
    const av = aiMap.get(s.id);
    if (av) {
      enriched.push({
        id: av.id,
        title: `${av.platform} — ${av.cited ? "cited" : "not cited"}`,
        kind: "ai_visibility",
      });
      continue;
    }
    const ast = assetMap.get(s.id);
    if (ast) {
      enriched.push({
        id: ast.id,
        title: `${ast.ticker} — ${ast.name}`,
        kind: "asset_price",
      });
      continue;
    }
    const d = dossierMap.get(s.id);
    if (d) {
      enriched.push({
        id: d.id,
        title: d.title,
        kind: "dossier",
      });
      continue;
    }
    const c = companyMap.get(s.id);
    if (c) {
      enriched.push({
        id: c.id,
        title: `${c.name} (${c.sector})`,
        kind: "neighbor",
      });
      continue;
    }
    // Holding id — we couldn't look it up cheaply (PortfolioHolding
    // has no "title" field). Use the raw id as the label.
    if (s.id.startsWith("holding:")) {
      enriched.push({
        id: s.id,
        title: "Portfolio holding",
        kind: "dossier",
      });
      continue;
    }
    // Unknown id — drop it (it was hallucinated or stale).
  }
  return enriched;
}

// ─── Main entry point ──────────────────────────────────────────

export interface GenerateInsightsOptions {
  userId: string;
  accountType: InsightAccountType;
  session: Session | null;
  forceRefresh?: boolean;
}

export async function generateInsights(
  opts: GenerateInsightsOptions,
): Promise<InsightResult> {
  const { userId, accountType, session, forceRefresh = false } = opts;

  // 1. Cache lookup (unless forceRefresh).
  if (!forceRefresh) {
    const cached = readCache(userId, accountType);
    if (cached) {
      logInfo("insight-engine.cache", `HIT userId=${userId} account=${accountType}`);
      return cached;
    }
  }

  const demoFilter = demoFilterFromSession(session);
  const generatedAt = new Date().toISOString();

  // 2. Resolve company / portfolio context per persona.
  //    Brand Monitor + Competitor Intel + Investor Desk → requireUserCompany.
  //    Alpha Desk → uses Assets directly (no company required).
  let companyId: string | null = null;
  if (accountType !== "harch-alpha") {
    const result = await requireUserCompany();
    if (result.ok) {
      companyId = result.data.company.id;
    } else if (result.response.status === 403 || result.response.status === 404) {
      // User has no company yet — return a friendly empty result.
      const empty: InsightResult = {
        insights: [
          {
            id: stableId(accountType, 0, generatedAt),
            type: "opportunity",
            severity: "info",
            title: "Complete onboarding to unlock HarchIQ insights",
            body: "Once your company is configured, this panel will show AI-generated contextual intelligence from your real reputation, risk, and AI-visibility telemetry.",
            action: "Finish onboarding to start generating insights.",
            confidence: 1,
            sources: [],
            persona: accountType,
            generatedAt,
          },
        ],
        cached: false,
        accountType,
        generatedAt,
        dataPoints: 0,
        model: "no-company",
      };
      writeCache(userId, accountType, empty);
      return empty;
    } else {
      // 401 — let the caller handle it.
      throw new Error("Unauthorized");
    }
  }

  // 3. Fetch persona telemetry + build prompt.
  let prompt: string;
  let validSourceIds: Set<string>;
  let dataPoints: number;
  let fallbackType: InsightType;

  switch (accountType) {
    case "brand-monitor": {
      const t = await fetchBrandMonitorTelemetry(companyId!, demoFilter);
      prompt = buildBrandMonitorPrompt(t);
      validSourceIds = new Set([
        ...t.negativeArticles.map((a) => a.id),
        ...t.highRisks.map((r) => r.id),
        ...t.aiVisibility.map((v) => v.id),
      ]);
      dataPoints = t.negativeArticles.length + t.highRisks.length + t.aiVisibility.length;
      fallbackType = "reputation_snapshot";
      break;
    }
    case "market-competitor": {
      const t = await fetchCompetitorIntelTelemetry(companyId!, demoFilter);
      prompt = buildCompetitorIntelPrompt(t);
      validSourceIds = new Set<string>();
      for (const r of t.rivals) {
        validSourceIds.add(r.id);
        if (r.topNegative) validSourceIds.add(r.topNegative.id);
      }
      dataPoints = t.rivals.length;
      fallbackType = "rival_vulnerability";
      break;
    }
    case "investment-bank": {
      const t = await fetchInvestorDeskTelemetry(userId, demoFilter);
      prompt = buildInvestorDeskPrompt(t);
      validSourceIds = new Set<string>();
      for (const h of t.holdings) {
        validSourceIds.add(`holding:${h.holdingId}`);
        if (h.topRisk) validSourceIds.add(h.topRisk.id);
        if (h.topAdverse) validSourceIds.add(h.topAdverse.id);
      }
      for (const d of t.dossiers) validSourceIds.add(d.id);
      dataPoints = t.holdings.length + t.dossiers.length;
      fallbackType = "risk_concentration";
      break;
    }
    case "harch-alpha": {
      const t = await fetchAlphaDeskTelemetry(userId, demoFilter);
      prompt = buildAlphaDeskPrompt(t);
      validSourceIds = new Set(t.assets.map((a) => a.id));
      dataPoints = t.assets.length;
      fallbackType = "sentiment_price_divergence";
      break;
    }
    default: {
      const exhaustive: never = accountType;
      throw new Error(`Unknown accountType: ${exhaustive}`);
    }
  }

  // 4. Call the LLM (with a heuristic fallback if it fails).
  let text: string;
  let model: string;
  try {
    const llm = await callLLM(prompt);
    text = llm.text;
    model = llm.model;
  } catch (err) {
    logError("insight-engine.fallback", `Using heuristic fallback: ${(err as Error).message}`);
    text = "[]";
    model = "heuristic-fallback";
  }

  // 5. Parse + validate.
  const rawInsights = parseInsights(
    text,
    accountType,
    validSourceIds,
    generatedAt,
    fallbackType,
  );

  // 6. Enrich sources with labels (parallel Prisma lookups).
  const allSourceIds = rawInsights.flatMap((i) => i.sources);
  const enrichedSources = await enrichSources(allSourceIds);
  const sourceMap = new Map(enrichedSources.map((s) => [s.id, s]));
  const insights: Insight[] = rawInsights.map((i) => ({
    ...i,
    sources: i.sources
      .map((s) => sourceMap.get(s.id))
      .filter((s): s is InsightSourceRef => s !== undefined),
  }));

  // 7. If the LLM returned nothing useful, emit a deterministic fallback
  //    insight so the UI is never empty.
  if (insights.length === 0) {
    insights.push({
      id: stableId(accountType, 0, generatedAt),
      type: fallbackType,
      severity: "info",
      title: "Insights are being generated",
      body: `HarchIQ is analysing your ${accountType.replace("-", " ")} telemetry. If this persists, click "Generate Fresh Insights" to retry. Grounded on ${dataPoints} data points.`,
      action: "Refresh in 30 seconds, or click Generate Fresh Insights.",
      confidence: 0.3,
      sources: [],
      persona: accountType,
      generatedAt,
    });
  }

  const result: InsightResult = {
    insights,
    cached: false,
    accountType,
    generatedAt,
    dataPoints,
    model,
  };

  writeCache(userId, accountType, result);
  logInfo(
    "insight-engine.generate",
    `ok account=${accountType} insights=${insights.length} dataPoints=${dataPoints} model=${model}`,
  );
  return result;
}
