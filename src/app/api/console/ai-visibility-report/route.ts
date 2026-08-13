// ═══════════════════════════════════════════════════════════════
//  POST /api/console/ai-visibility-report
//
//  Skill 13 — AI Visibility Report.
//
//  Builds a one-page deliverable showing how 9 LLMs (ChatGPT, Claude,
//  Gemini, Perplexity, Copilot, Mistral, Grok, Llama, GLM) perceive
//  and cite the brand. Reads the AIVisibility table (one row per
//  engine × probe) and aggregates it into:
//
//    {
//      meta:              { companyName, sector, generatedAt, date },
//      engines:           [{ name, cited, rank, confidence, sentiment,
//                            mentions, lastChecked }],
//      overallScore:      number,   // 0-100
//      trend:             number,   // cited delta vs last month (pts)
//      narrativeSummary:  string,   // French paragraph
//      totalCited:        number,
//      totalEngines:      number,
//    }
//
//  NOTE ON THE 9-ENGINE LIST
//    The mission brief lists 9 LLMs but writes "Gemini" twice. The
//    canonical codebase list (src/lib/constants.ts → AI_ENGINES_FULL)
//    has 8 distinct engines; the 9th is GLM, our in-house model
//    (see src/lib/ai/glm-prompts.ts and the LLM router). We use the
//    8 distinct engines + GLM to reach 9 unique cards — Gemini is
//    NOT duplicated in the UI.
//
//  Auth: requires session + allowed account type.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { logError, logInfo } from "@/lib/logger";
import {
  requireUserCompany,
  demoFilterFromSession,
} from "@/lib/harchiq/company-session";
import { isDemoEmail } from "@/lib/demo-session";
import { isAccountTypeAllowed } from "@/lib/auth/rbac";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// ─── CANONICAL 9 ENGINES (display order) ─────────────────────────
const CANONICAL_ENGINES = [
  "ChatGPT",
  "Claude",
  "Gemini",
  "Perplexity",
  "Copilot",
  "Mistral",
  "Grok",
  "Llama",
  "GLM",
] as const;

const DAY_MS = 86_400_000;

// Parse AIVisibility.position string ("1st" / "top-3" / "not cited" …)
// into a numeric rank. Mirrors ai-visibility-trend/route.ts.
function parseRank(position: string | null | undefined): number | null {
  if (!position) return null;
  const lower = position.toLowerCase().trim();
  if (lower.includes("not cited") || lower === "absent") return null;
  const ordinalMatch = lower.match(/^(\d+)(?:st|nd|rd|th)?$/);
  if (ordinalMatch) return parseInt(ordinalMatch[1], 10);
  const topMatch = lower.match(/top-(\d+)/);
  if (topMatch) return parseInt(topMatch[1], 10);
  const numMatch = lower.match(/(\d+)/);
  if (numMatch) return parseInt(numMatch[1], 10);
  return null;
}

interface EngineAggregate {
  name: string;
  cited: boolean;
  rank: number | null;
  confidence: number; // 0-1
  sentiment: string | null;
  mentions: number; // last 30d probe count where cited
  lastChecked: string | null; // ISO
  visibilityScore: number; // 0-100 per-engine score
}

function engineScore(cited: boolean, rank: number | null, confidence: number): number {
  if (!cited) return 0;
  let s = 50;
  if (rank !== null) {
    if (rank <= 1) s += 35;
    else if (rank <= 3) s += 25;
    else if (rank <= 5) s += 15;
    else if (rank <= 10) s += 8;
  }
  const conf = typeof confidence === "number" && isFinite(confidence) ? confidence : 0;
  s += Math.round(Math.max(0, Math.min(1, conf)) * 15);
  return Math.max(0, Math.min(100, s));
}

function buildNarrativeSummary(params: {
  companyName: string;
  totalEngines: number;
  citedCount: number;
  topEngine: EngineAggregate | null;
  worstEngine: EngineAggregate | null;
  positiveCount: number;
  negativeCount: number;
  trend: number;
  hasPriorMonth: boolean;
}): string {
  const {
    companyName, totalEngines, citedCount,
    topEngine, worstEngine,
    positiveCount, negativeCount,
    trend, hasPriorMonth,
  } = params;

  if (citedCount === 0) {
    return `Aucun des ${totalEngines} moteurs IA analysés ne cite ${companyName} dans ses réponses récentes. La marque est actuellement invisible pour les LLMs — un effort de contenus (articles, fiches structurées, présence sur les sources que ces modèles indexent) est nécessaire pour apparaître dans les réponses générées.`;
  }

  const parts: string[] = [];
  parts.push(
    `Sur ${totalEngines} moteurs IA analysés, ${citedCount} citent ${companyName} dans leurs réponses.`,
  );

  if (topEngine) {
    const rankStr = topEngine.rank ? ` en ${ordinalFr(topEngine.rank)} position` : "";
    const sentimentStr = topEngine.sentiment
      ? ` avec un sentiment ${sentimentFr(topEngine.sentiment)}`
      : "";
    parts.push(
      `${topEngine.name} la positionne${rankStr}${sentimentStr} (score de visibilité ${topEngine.visibilityScore}/100).`,
    );
  }

  if (worstEngine && worstEngine.name !== topEngine?.name) {
    parts.push(
      `À l'inverse, ${worstEngine.name} ne mentionne pas encore la marque ou la classe mal.`,
    );
  }

  if (positiveCount > 0 || negativeCount > 0) {
    parts.push(
      `Sentiment global : ${positiveCount} citation(s) positive(s), ${negativeCount} négative(s).`,
    );
  }

  if (hasPriorMonth) {
    if (trend > 0) {
      parts.push(
        `Sur les 30 derniers jours, la visibilité progresse de +${trend} point(s) — la marque gagne du terrain dans les réponses des LLMs.`,
      );
    } else if (trend < 0) {
      parts.push(
        `Sur les 30 derniers jours, la visibilité recule de ${trend} point(s) — surveiller l'érosion des citations.`,
      );
    } else {
      parts.push(`Sur les 30 derniers jours, la visibilité reste stable.`);
    }
  } else {
    parts.push(`Pas encore d'historique suffisant pour calculer une tendance mensuelle.`);
  }

  return parts.join(" ");
}

function ordinalFr(n: number): string {
  if (n === 1) return "1ère";
  return `${n}ème`;
}

function sentimentFr(s: string): string {
  const lower = s.toLowerCase();
  if (lower.includes("pos")) return "positif";
  if (lower.includes("neg")) return "négatif";
  if (lower.includes("neu")) return "neutre";
  return lower;
}

export async function POST(_req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAccountTypeAllowed(session, ["essential", "pro", "enterprise", "agency"])) {
    return NextResponse.json(
      { error: "Forbidden — insufficient account permissions" },
      { status: 403 },
    );
  }

  // ─── DEMO BYPASS ─────────────────────────────────────────────
  if (session.user.isDemo || isDemoEmail(session.user.email)) {
    return demoReportResponse();
  }

  try {
    const demoFilter = demoFilterFromSession(session);
    const result = await requireUserCompany();
    if (!result.ok) return result.response;
    const companyId = result.data.company.id;

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true, sector: true },
    });

    const now = new Date();
    const since30 = new Date(now.getTime() - 30 * DAY_MS);
    const since60 = new Date(now.getTime() - 60 * DAY_MS);

    // Pull all records for the last 60 days in one query.
    const records = await prisma.aIVisibility.findMany({
      where: {
        companyId,
        checkedAt: { gte: since60 },
        ...demoFilter,
      },
      select: {
        platform: true,
        cited: true,
        position: true,
        rank: true,
        sentiment: true,
        confidence: true,
        mentions: true,
        checkedAt: true,
      },
      orderBy: { checkedAt: "desc" },
    });

    // ─── Per-engine aggregation ─────────────────────────────────
    // Latest record per platform (the "current" state) + a per-engine
    // 30-day mentions tally (count of cited probes in the last 30d).
    const latestByPlatform = new Map<string, (typeof records)[number]>();
    let cited30 = 0;       // cited probes in last 30d (any platform)
    let citedPrev = 0;     // cited probes in 30-60d window (any platform)

    for (const r of records) {
      const p = r.platform;
      if (!latestByPlatform.has(p)) {
        latestByPlatform.set(p, r);
      }
      if (r.checkedAt >= since30) {
        if (r.cited) cited30 += 1;
      } else {
        if (r.cited) citedPrev += 1;
      }
    }

    // Build engines array in canonical order, then append any extra
    // platforms that aren't in CANONICAL_ENGINES (so we never hide data).
    const seenPlatforms = new Set<string>();
    const engines: EngineAggregate[] = [];

    for (const canonical of CANONICAL_ENGINES) {
      seenPlatforms.add(canonical);
      // Try exact match first, then case-insensitive.
      let rec = latestByPlatform.get(canonical);
      if (!rec) {
        for (const [k, v] of latestByPlatform.entries()) {
          if (k.toLowerCase() === canonical.toLowerCase()) {
            rec = v;
            break;
          }
        }
      }
      engines.push(buildEngine(canonical, rec, records, since30));
    }
    for (const [k, v] of latestByPlatform.entries()) {
      if (seenPlatforms.has(k)) continue;
      // Case-insensitive dedupe
      if ([...seenPlatforms].some((s) => s.toLowerCase() === k.toLowerCase())) continue;
      seenPlatforms.add(k);
      engines.push(buildEngine(k, v, records, since30));
    }

    // ─── Overall score ──────────────────────────────────────────
    const enginesWithData = engines.filter((e) => e.lastChecked !== null);
    const overallScore =
      enginesWithData.length === 0
        ? 0
        : Math.round(
            enginesWithData.reduce((acc, e) => acc + e.visibilityScore, 0) /
              enginesWithData.length,
          );

    // ─── Trend (cited probe delta, points) ──────────────────────
    // Use the per-engine cited probe counts: trend = cited30 - citedPrev
    // (clamped to a sensible range). If no prior-month data, signal 0
    // but the narrative will note the absence of history.
    const hasPriorMonth = citedPrev > 0 || records.some((r) => r.checkedAt < since30);
    const trend = hasPriorMonth ? cited30 - citedPrev : 0;

    // ─── Top / worst engine picks ───────────────────────────────
    const citedEngines = engines.filter((e) => e.cited && e.lastChecked !== null);
    const sortedCited = [...citedEngines].sort(
      (a, b) => b.visibilityScore - a.visibilityScore,
    );
    const topEngine = sortedCited[0] ?? null;
    const worstEngine =
      [...citedEngines].sort((a, b) => a.visibilityScore - b.visibilityScore)[0] ?? null;

    const positiveCount = citedEngines.filter(
      (e) => e.sentiment && /pos/i.test(e.sentiment),
    ).length;
    const negativeCount = citedEngines.filter(
      (e) => e.sentiment && /neg/i.test(e.sentiment),
    ).length;

    const narrativeSummary = buildNarrativeSummary({
      companyName: company?.name ?? "Votre entreprise",
      totalEngines: engines.length,
      citedCount: citedEngines.length,
      topEngine,
      worstEngine,
      positiveCount,
      negativeCount,
      trend,
      hasPriorMonth,
    });

    const totalCited = citedEngines.length;

    logInfo(
      "ai-visibility-report",
      `Report built for ${company?.name}: score=${overallScore}, cited=${totalCited}/${engines.length}, trend=${trend}`,
    );

    return NextResponse.json({
      meta: {
        companyName: company?.name ?? "Votre entreprise",
        sector: company?.sector ?? null,
        generatedAt: now.toISOString(),
        date: now.toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      },
      engines,
      overallScore,
      trend,
      narrativeSummary,
      totalCited,
      totalEngines: engines.length,
    });
  } catch (err) {
    logError("console.ai-visibility-report", `Error: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}

// ─── Helpers ─────────────────────────────────────────────────────

function buildEngine(
  name: string,
  latest: {
    cited: boolean;
    position: string | null;
    rank: number | null;
    sentiment: string | null;
    confidence: number | null;
    mentions: number | null;
    checkedAt: Date;
  } | undefined,
  allRecords: Array<{
    platform: string;
    cited: boolean;
    checkedAt: Date;
  }>,
  since30: Date,
): EngineAggregate {
  if (!latest) {
    return {
      name,
      cited: false,
      rank: null,
      confidence: 0,
      sentiment: null,
      mentions: 0,
      lastChecked: null,
      visibilityScore: 0,
    };
  }

  // Prefer the structured `rank` field if present; otherwise parse
  // the legacy `position` string ("1st", "top-3", …).
  const rank =
    typeof latest.rank === "number" && latest.rank > 0
      ? latest.rank
      : parseRank(latest.position);

  const confidence =
    typeof latest.confidence === "number" && isFinite(latest.confidence)
      ? Math.max(0, Math.min(1, latest.confidence))
      : 0;

  // Mentions = number of cited probes for this engine in the last 30d.
  // Falls back to the latest record's `mentions` field when no probes
  // exist in the 30d window.
  let mentions30 = 0;
  for (const r of allRecords) {
    if (r.platform === name && r.checkedAt >= since30 && r.cited) {
      mentions30 += 1;
    }
  }
  const mentions = mentions30 > 0 ? mentions30 : (latest.mentions ?? 0);

  return {
    name,
    cited: latest.cited,
    rank,
    confidence,
    sentiment: latest.sentiment ?? null,
    mentions,
    lastChecked: latest.checkedAt.toISOString(),
    visibilityScore: engineScore(latest.cited, rank, confidence),
  };
}

// ─── DEMO RESPONSE ───────────────────────────────────────────────
// Used for the four executive demo accounts. Mirrors the shape of a
// real report so the popup renders identically in demo mode.
function demoReportResponse() {
  const now = new Date();
  const since = new Date(now.getTime() - 14 * DAY_MS);

  const demoEngines: EngineAggregate[] = [
    { name: "ChatGPT",    cited: true,  rank: 2,    confidence: 0.82, sentiment: "positive", mentions: 5, lastChecked: since.toISOString(), visibilityScore: engineScore(true, 2, 0.82) },
    { name: "Claude",     cited: true,  rank: 4,    confidence: 0.71, sentiment: "neutral",  mentions: 3, lastChecked: new Date(since.getTime() - 1 * DAY_MS).toISOString(), visibilityScore: engineScore(true, 4, 0.71) },
    { name: "Gemini",     cited: true,  rank: 1,    confidence: 0.88, sentiment: "positive", mentions: 6, lastChecked: since.toISOString(), visibilityScore: engineScore(true, 1, 0.88) },
    { name: "Perplexity", cited: true,  rank: 3,    confidence: 0.74, sentiment: "positive", mentions: 4, lastChecked: new Date(since.getTime() - 2 * DAY_MS).toISOString(), visibilityScore: engineScore(true, 3, 0.74) },
    { name: "Copilot",    cited: false, rank: null, confidence: 0.55, sentiment: null,       mentions: 0, lastChecked: new Date(since.getTime() - 3 * DAY_MS).toISOString(), visibilityScore: 0 },
    { name: "Mistral",    cited: true,  rank: 6,    confidence: 0.62, sentiment: "neutral",  mentions: 2, lastChecked: new Date(since.getTime() - 1 * DAY_MS).toISOString(), visibilityScore: engineScore(true, 6, 0.62) },
    { name: "Grok",       cited: false, rank: null, confidence: 0.40, sentiment: null,       mentions: 0, lastChecked: new Date(since.getTime() - 4 * DAY_MS).toISOString(), visibilityScore: 0 },
    { name: "Llama",      cited: true,  rank: 5,    confidence: 0.68, sentiment: "neutral",  mentions: 2, lastChecked: new Date(since.getTime() - 2 * DAY_MS).toISOString(), visibilityScore: engineScore(true, 5, 0.68) },
    { name: "GLM",        cited: true,  rank: 1,    confidence: 0.90, sentiment: "positive", mentions: 7, lastChecked: since.toISOString(), visibilityScore: engineScore(true, 1, 0.90) },
  ];

  const citedEngines = demoEngines.filter((e) => e.cited);
  const overallScore = Math.round(
    demoEngines.reduce((acc, e) => acc + e.visibilityScore, 0) / demoEngines.length,
  );

  const narrativeSummary = buildNarrativeSummary({
    companyName: "Maroc Telecom",
    totalEngines: demoEngines.length,
    citedCount: citedEngines.length,
    topEngine: [...citedEngines].sort((a, b) => b.visibilityScore - a.visibilityScore)[0] ?? null,
    worstEngine: [...citedEngines].sort((a, b) => a.visibilityScore - b.visibilityScore)[0] ?? null,
    positiveCount: citedEngines.filter((e) => e.sentiment && /pos/i.test(e.sentiment)).length,
    negativeCount: citedEngines.filter((e) => e.sentiment && /neg/i.test(e.sentiment)).length,
    trend: 2,
    hasPriorMonth: true,
  });

  return NextResponse.json({
    meta: {
      companyName: "Maroc Telecom",
      sector: "Telecom",
      generatedAt: now.toISOString(),
      date: now.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    },
    engines: demoEngines,
    overallScore,
    trend: 2,
    narrativeSummary,
    totalCited: citedEngines.length,
    totalEngines: demoEngines.length,
  });
}
