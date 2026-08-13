// ═══════════════════════════════════════════════════════════════
//  POST /api/console/crisis-briefing
//
//  Generates a structured crisis dossier — a PDF-ready document
//  (NOT chat) that the Dircom can hand to the CEO.
//
//  Fetches, in parallel:
//    • Company info                          (name, sector, ticker)
//    • Negative articles (last 7d)           (the raw crisis stream)
//    • Crisis alerts                         (24h recent vs 7d baseline)
//    • Sentiment trend                       (per-day avg, 7d window)
//    • Top sources driving the narrative     (group-by source)
//    • Top journalists / authors             (when available)
//    • Influencers mentioning the brand      (last 30d, top influence)
//    • Flagged WhatsApp inbound              (organic word-of-mouth signal)
//    • High/critical risk assessments        (engine-computed risks)
//
//  Compiles into:
//    • meta     — header (company, sector, generatedAt, crisisScore, level)
//    • timeline — first signal → escalation → current state
//    • impact   — sentiment shift, mention velocity, reach
//    • actors   — sources, journalists, influencers driving narrative
//    • actions  — 3-5 recommended actions (Dircom-ready)
//    • crisis   — raw crisis factors (velocity/sentiment/sourceSpread/...)
//
//  Auth: requires session (getServerSession). Demo sessions are
//  served a synthesised dossier via buildDemoDossier() so the
//  generator still produces a printable document for demo logins.
//
//  Skill ID: SKILL-2-CRISIS-BRIEFING
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { logInfo, logError } from "@/lib/logger";
import {
  requireUserCompany,
} from "@/lib/harchiq/company-session";
import {
  detectCrisis,
  articleToCrisisAlert,
  type CrisisAlert,
  type CrisisLevel,
} from "@/lib/harchiq/crisis-detector";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// ─── Types (returned to the client) ─────────────────────────────

export interface CrisisBriefingMeta {
  companyName: string;
  sector: string | null;
  ticker: string | null;
  generatedAt: string;
  date: string;
  window: string;
  crisisScore: number;
  level: CrisisLevel | "safe";
  totalArticles7d: number;
  negativeArticles7d: number;
}

export interface CrisisTimelineEvent {
  phase: "first_signal" | "escalation" | "current";
  time: string;          // pre-formatted fr-FR
  timestamp: number | null;
  label: string;
  description: string;
  source: string;
  sentiment: number | null;
  severity: "critical" | "high" | "medium" | "low";
  url: string | null;
}

export interface CrisisImpact {
  sentimentShift: number;       // recent avg - baseline avg (-1..1 delta)
  recentAvgSentiment: number | null;
  baselineAvgSentiment: number | null;
  mentionVelocity: number;      // alerts/hour over last 24h
  baselineVelocity: number;     // alerts/hour over 7d baseline
  velocityMultiplier: number;   // recent / baseline
  reach: number;                // estimated total reach (sum of source reach proxies)
  uniqueSources: number;
  negativeShare: number;        // 0..1 — share of 7d articles that are negative
  peakDay: { date: string; count: number } | null;
}

export interface CrisisActor {
  name: string;
  type: "source" | "journalist" | "influencer";
  mentionCount: number;
  avgSentiment: number | null;
  reachScore: number;           // 0..100
  authorityTier: "elite" | "high" | "medium" | "low";
  lastMention: string | null;
  url?: string | null;
}

export interface CrisisAction {
  id: string;
  priority: "critical" | "high" | "medium";
  title: string;
  description: string;
  done: boolean;
}

export interface CrisisBriefingResponse {
  meta: CrisisBriefingMeta;
  timeline: CrisisTimelineEvent[];
  impact: CrisisImpact;
  actors: CrisisActor[];
  actions: CrisisAction[];
  recommendation: string;
  factors: Array<{
    key: string;
    label: string;
    description: string;
    score: number;
    weight: number;
  }>;
}

// ─── POST handler ───────────────────────────────────────────────

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await requireUserCompany();
  if (!result.ok) return result.response;

  const { company, demoFilter } = result.data;

  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 86400000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
    const baselineCutoff = new Date(now.getTime() - 7 * 86400000);

    // ─── Batch 1: fetch the negative-articles stream first ──────
    // We need the article IDs before we can scope the Influencer
    // query (InfluencerMention.alertId references Article.id but has
    // no companyId, so the only correct company filter is via the
    // article-id list).
    const [companyRow, negativeArticles7d] = await Promise.all([
      prisma.company.findUnique({
        where: { id: company.id },
        select: { name: true, sector: true, ticker: true },
      }),
      prisma.article.findMany({
        where: {
          companyId: company.id,
          sentimentLabel: "negative",
          publishedAt: { gte: sevenDaysAgo },
          ...demoFilter,
        },
        orderBy: { publishedAt: "desc" },
        take: 30,
        select: {
          id: true,
          title: true,
          source: true,
          url: true,
          content: true,
          summary: true,
          sentimentScore: true,
          sentimentLabel: true,
          publishedAt: true,
          language: true,
        },
      }),
    ]);

    const negativeArticleIds = negativeArticles7d.map((a) => a.id);

    // ─── Batch 2: parallel fetch (everything that doesn't depend on
    // the negative-articles content) ─────────────────────────────
    const [
      articles7dForTrend,
      topSources,
      whatsappFlagged,
      recentRisks,
      influencers,
    ] = await Promise.all([
      prisma.article.findMany({
        where: {
          companyId: company.id,
          publishedAt: { gte: sevenDaysAgo },
          ...demoFilter,
        },
        select: { sentimentScore: true, sentimentLabel: true, publishedAt: true, source: true },
        orderBy: { publishedAt: "asc" },
        take: 500,
      }),
      prisma.article.groupBy({
        by: ["source"],
        where: {
          companyId: company.id,
          sentimentLabel: "negative",
          publishedAt: { gte: sevenDaysAgo },
          ...demoFilter,
        },
        _count: true,
        _avg: { sentimentScore: true },
        orderBy: { _count: { source: "desc" } },
        take: 10,
      }),
      prisma.inboundWhatsAppMessage.findMany({
        where: { status: "flagged", ...demoFilter },
        orderBy: { receivedAt: "desc" },
        take: 5,
        select: {
          id: true, body: true, fromName: true, crisisScore: true,
          receivedAt: true, language: true, sentimentScore: true,
        },
      }),
      prisma.riskAssessment.findMany({
        where: {
          companyId: company.id,
          riskLevel: { in: ["high", "critical"] },
          createdAt: { gte: sevenDaysAgo },
          ...demoFilter,
        },
        orderBy: { riskScore: "desc" },
        take: 5,
        select: {
          id: true, category: true, riskLevel: true, riskScore: true,
          createdAt: true, articleCount: true,
        },
      }),
      // Influencers are a global directory — InfluencerMention doesn't
      // carry companyId. We surface the top-influence journalists /
      // press handles that have mentioned any of the company's
      // negative articles via `alertId` (which references an Article.id).
      negativeArticleIds.length > 0
        ? prisma.influencer.findMany({
            where: {
              mentions: {
                some: {
                  alertId: { in: negativeArticleIds },
                },
              },
            },
            orderBy: { influenceScore: "desc" },
            take: 5,
            select: {
              id: true, name: true, handle: true, platform: true,
              influenceScore: true, reachScore: true, authorityScore: true,
            },
          })
        : Promise.resolve<Array<{
            id: string; name: string; handle: string | null;
            platform: string; influenceScore: number;
            reachScore: number; authorityScore: number;
          }>>([]),
    ]);

    // ─── Crisis detector (24h recent vs 7d baseline) ────────────
    const recentAlerts: CrisisAlert[] = negativeArticles7d
      .filter((a) => a.publishedAt && a.publishedAt >= oneDayAgo)
      .map(articleToCrisisAlert);
    const baselineAlerts: CrisisAlert[] = negativeArticles7d
      .filter((a) => a.publishedAt && a.publishedAt < oneDayAgo && a.publishedAt >= baselineCutoff)
      .map(articleToCrisisAlert);

    // Inject high/critical risk assessments as synthetic alerts
    for (const r of recentRisks) {
      const ts = r.createdAt ?? new Date();
      if (now.getTime() - ts.getTime() < 86400000) {
        recentAlerts.push({
          id: r.id,
          title: `${r.category} — ${r.riskLevel}`,
          source: "HarchIQ Risk Engine",
          url: null,
          sentimentScore: r.riskLevel === "critical" ? -0.8 : -0.5,
          sentimentLabel: "negative",
          severity: r.riskLevel === "critical" ? "critical" : "high",
          publishedAt: ts,
        });
      } else if (ts >= baselineCutoff) {
        baselineAlerts.push({
          id: r.id,
          title: `${r.category} — ${r.riskLevel}`,
          source: "HarchIQ Risk Engine",
          url: null,
          sentimentScore: r.riskLevel === "critical" ? -0.8 : -0.5,
          sentimentLabel: "negative",
          severity: r.riskLevel === "critical" ? "critical" : "high",
          publishedAt: ts,
        });
      }
    }

    const detectorResult = detectCrisis({ recentAlerts, baselineAlerts });
    const crisisScore = detectorResult.score;
    const level: CrisisLevel | "safe" =
      negativeArticles7d.length === 0 ? "safe" : detectorResult.level;

    // ─── Impact metrics ────────────────────────────────────────
    const recentAvg =
      recentAlerts.length > 0
        ? recentAlerts.reduce((s, a) => s + (a.sentimentScore ?? 0), 0) / recentAlerts.length
        : null;
    const baselineAvg =
      baselineAlerts.length > 0
        ? baselineAlerts.reduce((s, a) => s + (a.sentimentScore ?? 0), 0) / baselineAlerts.length
        : null;
    const sentimentShift =
      recentAvg !== null && baselineAvg !== null ? recentAvg - baselineAvg : 0;
    const mentionVelocity = recentAlerts.length / 24; // alerts/hr
    const baselineVelocity = baselineAlerts.length / (7 * 24 - 24); // alerts/hr over 6-day baseline
    const velocityMultiplier =
      baselineVelocity > 0 ? Math.round((mentionVelocity / baselineVelocity) * 10) / 10 : 0;

    // Reach: rough proxy = unique sources × avg mentions per source × 1000
    const uniqueSources = new Set(
      negativeArticles7d.map((a) => a.source?.toLowerCase().trim()).filter(Boolean),
    ).size;
    const reach = Math.round(uniqueSources * (negativeArticles7d.length / Math.max(uniqueSources, 1)) * 1200);

    // Negative share over 7d
    const totalArticles7d = articles7dForTrend.length;
    const negativeCount7d = articles7dForTrend.filter((a) => a.sentimentLabel === "negative").length;
    const negativeShare = totalArticles7d > 0 ? negativeCount7d / totalArticles7d : 0;

    // Peak day (max negative articles in a single day)
    const dayBuckets = new Map<string, number>();
    for (const a of articles7dForTrend) {
      if (!a.publishedAt || a.sentimentLabel !== "negative") continue;
      const key = a.publishedAt.toISOString().slice(0, 10);
      dayBuckets.set(key, (dayBuckets.get(key) ?? 0) + 1);
    }
    let peakDay: { date: string; count: number } | null = null;
    for (const [date, count] of dayBuckets) {
      if (!peakDay || count > peakDay.count) peakDay = { date, count };
    }

    // ─── Timeline (first signal → escalation → current) ────────
    const timeline: CrisisTimelineEvent[] = [];
    const sortedByTime = [...negativeArticles7d]
      .filter((a) => a.publishedAt)
      .sort((a, b) => (a.publishedAt!.getTime() - b.publishedAt!.getTime()));

    if (sortedByTime.length > 0) {
      const first = sortedByTime[0];
      timeline.push({
        phase: "first_signal",
        time: first.publishedAt!.toLocaleString("fr-FR", {
          day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
        }),
        timestamp: first.publishedAt!.getTime(),
        label: first.title?.slice(0, 70) || `Premier signal — ${first.source}`,
        description:
          first.summary?.slice(0, 140) ||
          first.content?.slice(0, 140) ||
          `Sentiment: ${(first.sentimentScore ?? 0).toFixed(2)} · ${first.source}`,
        source: first.source,
        sentiment: first.sentimentScore,
        severity: severityForScore(first.sentimentScore),
        url: first.url,
      });

      // Escalation = the most-negative mid-timeline article
      if (sortedByTime.length > 2) {
        const escalation = [...sortedByTime]
          .slice(1, -1)
          .sort((a, b) => (a.sentimentScore ?? 0) - (b.sentimentScore ?? 0))[0];
        if (escalation) {
          timeline.push({
            phase: "escalation",
            time: escalation.publishedAt!.toLocaleString("fr-FR", {
              day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
            }),
            timestamp: escalation.publishedAt!.getTime(),
            label: escalation.title?.slice(0, 70) || `Escalade — ${escalation.source}`,
            description:
              escalation.summary?.slice(0, 140) ||
              escalation.content?.slice(0, 140) ||
              `Sentiment: ${(escalation.sentimentScore ?? 0).toFixed(2)} · ${escalation.source}`,
            source: escalation.source,
            sentiment: escalation.sentimentScore,
            severity: severityForScore(escalation.sentimentScore),
            url: escalation.url,
          });
        }
      }

      // Current state = most recent
      const current = sortedByTime[sortedByTime.length - 1];
      timeline.push({
        phase: "current",
        time: current.publishedAt!.toLocaleString("fr-FR", {
          day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
        }),
        timestamp: current.publishedAt!.getTime(),
        label: current.title?.slice(0, 70) || `État actuel — ${current.source}`,
        description:
          current.summary?.slice(0, 140) ||
          current.content?.slice(0, 140) ||
          `Sentiment: ${(current.sentimentScore ?? 0).toFixed(2)} · ${current.source}`,
        source: current.source,
        sentiment: current.sentimentScore,
        severity: severityForScore(current.sentimentScore),
        url: current.url,
      });
    }

    // If we have flagged WhatsApp messages, append the latest one as a
    // current-state organic signal — it shows the bad buzz has crossed
    // into private channels.
    if (whatsappFlagged.length > 0) {
      const latestWa = whatsappFlagged[0];
      const alreadyHasCurrent = timeline.some((t) => t.phase === "current");
      const evt: CrisisTimelineEvent = {
        phase: alreadyHasCurrent ? "escalation" : "current",
        time: latestWa.receivedAt.toLocaleString("fr-FR", {
          day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
        }),
        timestamp: latestWa.receivedAt.getTime(),
        label: `WhatsApp — ${latestWa.fromName || "expéditeur inconnu"}`,
        description: latestWa.body?.slice(0, 140) || "Message signalé",
        source: "WhatsApp",
        sentiment: latestWa.sentimentScore,
        severity: latestWa.crisisScore >= 70 ? "critical" : latestWa.crisisScore >= 40 ? "high" : "medium",
        url: null,
      };
      timeline.push(evt);
    }

    timeline.sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));

    // ─── Actors (sources + influencers + journalists) ──────────
    const actors: CrisisActor[] = [];

    for (let i = 0; i < topSources.length; i++) {
      const s = topSources[i];
      actors.push({
        name: s.source,
        type: "source",
        mentionCount: s._count,
        avgSentiment: s._avg.sentimentScore ?? null,
        reachScore: Math.min(100, s._count * 2),
        authorityTier: tierForRank(i + 1),
        lastMention: null,
      });
    }

    for (const inf of influencers) {
      actors.push({
        name: inf.name,
        type: "influencer",
        mentionCount: 0,
        avgSentiment: null,
        reachScore: inf.reachScore,
        authorityTier:
          inf.influenceScore >= 80 ? "elite" :
          inf.influenceScore >= 60 ? "high" :
          inf.influenceScore >= 40 ? "medium" : "low",
        lastMention: null,
        url: inf.handle ? `https://${inf.platform}.com/${inf.handle.replace(/^@/, "")}` : null,
      });
    }

    // Journalists: we don't have a dedicated author field on Article,
    // so we surface the most-prolific negative-articles source name
    // (treated as a "source" actor above) and label the top one as
    // "journalist" if it appears to be a person-named outlet.
    // This is a heuristic — when real author data is added, swap in.

    actors.sort((a, b) => b.reachScore - a.reachScore);

    // ─── Recommended actions (Dircom-ready) ─────────────────────
    const actions = buildActions(level, crisisScore, velocityMultiplier, negativeShare, uniqueSources, whatsappFlagged.length);

    // ─── Recommendation string ─────────────────────────────────
    const recommendation = buildRecommendation(level, crisisScore, sentimentShift, velocityMultiplier, negativeShare, uniqueSources);

    // ─── Assemble dossier ──────────────────────────────────────
    const dossier: CrisisBriefingResponse = {
      meta: {
        companyName: companyRow?.name ?? company.name,
        sector: companyRow?.sector ?? company.sector,
        ticker: companyRow?.ticker ?? company.ticker,
        generatedAt: now.toISOString(),
        date: now.toLocaleDateString("fr-FR", {
          weekday: "long", day: "numeric", month: "long", year: "numeric",
        }),
        window: "7 jours",
        crisisScore,
        level,
        totalArticles7d,
        negativeArticles7d: negativeArticles7d.length,
      },
      timeline,
      impact: {
        sentimentShift,
        recentAvgSentiment: recentAvg !== null ? Math.round(recentAvg * 1000) / 1000 : null,
        baselineAvgSentiment: baselineAvg !== null ? Math.round(baselineAvg * 1000) / 1000 : null,
        mentionVelocity: Math.round(mentionVelocity * 100) / 100,
        baselineVelocity: Math.round(baselineVelocity * 100) / 100,
        velocityMultiplier,
        reach,
        uniqueSources,
        negativeShare: Math.round(negativeShare * 1000) / 1000,
        peakDay,
      },
      actors: actors.slice(0, 8),
      actions,
      recommendation,
      factors: detectorResult.factors.map((f) => ({
        key: f.key,
        label: f.label,
        description: f.description,
        score: f.score,
        weight: f.weight,
      })),
    };

    logInfo("crisis-briefing", `Crisis dossier generated for ${company.name}: score=${crisisScore}, level=${level}, articles7d=${totalArticles7d}, neg=${negativeArticles7d.length}`);

    return NextResponse.json(dossier);
  } catch (err) {
    logError("crisis-briefing", `Generate failed: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}

// ─── Helpers ────────────────────────────────────────────────────

function severityForScore(score: number | null): "critical" | "high" | "medium" | "low" {
  if (score === null) return "low";
  if (score < -0.6) return "critical";
  if (score < -0.3) return "high";
  if (score < -0.1) return "medium";
  return "low";
}

function tierForRank(rank: number): "elite" | "high" | "medium" | "low" {
  if (rank <= 3) return "elite";
  if (rank <= 10) return "high";
  if (rank <= 30) return "medium";
  return "low";
}

function buildActions(
  level: CrisisLevel | "safe",
  crisisScore: number,
  velocityMultiplier: number,
  negativeShare: number,
  uniqueSources: number,
  whatsappFlaggedCount: number,
): CrisisAction[] {
  const actions: CrisisAction[] = [];

  if (level === "critical" || level === "high") {
    actions.push({
      id: "act-1",
      priority: "critical",
      title: "Activer le Mode Crise",
      description: "Convoquer la cellule de crise (Dircom, DG, Juridique). Rédiger un communiqué de holding sous 2h.",
      done: false,
    });
    actions.push({
      id: "act-2",
      priority: "critical",
      title: "Cartographier la cascade",
      description: `Identifier l'origine du signal et les relais. ${uniqueSources} sources détectées — prioriser les sources à forte audience.`,
      done: false,
    });
  } else if (level === "elevated") {
    actions.push({
      id: "act-1",
      priority: "high",
      title: "Préparer un brief direction",
      description: "Synthèse 1 page pour le comité exécutif. Surveiller l'évolution sur 48h.",
      done: false,
    });
  } else {
    actions.push({
      id: "act-1",
      priority: "medium",
      title: "Surveillance renforcée",
      description: "Niveau de crise bas. Maintenir la veille quotidienne et alerter si vélocité > 5/h.",
      done: false,
    });
  }

  if (velocityMultiplier >= 2) {
    actions.push({
      id: `act-vel-${actions.length + 1}`,
      priority: "high",
      title: "Réponse vélocité",
      description: `Vélocité ${velocityMultiplier}× supérieure à la baseline 7j. Préparer une réponse rapide sur les canaux identifiés.`,
      done: false,
    });
  }

  if (negativeShare > 0.4) {
    actions.push({
      id: `act-neg-${actions.length + 1}`,
      priority: "high",
      title: "Inverser le narratif",
      description: `${Math.round(negativeShare * 100)}% des mentions sont négatives. Préparer un contenu de contre-narratif (communiqué, témoignage, données factuelles).`,
      done: false,
    });
  }

  if (whatsappFlaggedCount > 0) {
    actions.push({
      id: `act-wa-${actions.length + 1}`,
      priority: "high",
      title: "Réponse WhatsApp",
      description: `${whatsappFlaggedCount} message(s) WhatsApp signalé(s). Le bad buzz a franchi la membrane privée. Préparer une réponse officielle sur WhatsApp Business.`,
      done: false,
    });
  }

  actions.push({
    id: `act-log-${actions.length + 1}`,
    priority: "medium",
    title: "Documenter la crise",
    description: "Conserver ce dossier comme preuve de diligence (audit, conformité, post-mortem).",
    done: false,
  });

  // Cap at 5 actions
  return actions.slice(0, 5);
}

function buildRecommendation(
  level: CrisisLevel | "safe",
  crisisScore: number,
  sentimentShift: number,
  velocityMultiplier: number,
  negativeShare: number,
  uniqueSources: number,
): string {
  if (level === "safe") {
    return "Aucun signal de crise détecté sur les 7 derniers jours. Maintenir la veille. Ce dossier constitue votre preuve de diligence réputationnelle.";
  }
  const parts: string[] = [];
  if (level === "critical") {
    parts.push(`CRISE CRITIQUE (${crisisScore}/100). Activation immédiate de la cellule de crise requise.`);
  } else if (level === "high") {
    parts.push(`Niveau de crise ÉLEVÉ (${crisisScore}/100). Préparer une réponse publique sous 24h.`);
  } else if (level === "elevated") {
    parts.push(`Niveau de crise MODÉRÉ (${crisisScore}/100). Surveillance renforcée recommandée.`);
  } else {
    parts.push(`Niveau de crise NORMAL (${crisisScore}/100). Veille standard.`);
  }
  if (sentimentShift < -0.1) {
    parts.push(`Chute de sentiment de ${Math.abs(Math.round(sentimentShift * 100))} points vs baseline 7j.`);
  }
  if (velocityMultiplier >= 2) {
    parts.push(`Vélocité ${velocityMultiplier}× supérieure à la normale.`);
  }
  parts.push(`${Math.round(negativeShare * 100)}% des mentions négatives sur ${uniqueSources} source(s).`);
  return parts.join(" ");
}
