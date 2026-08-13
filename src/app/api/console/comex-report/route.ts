// ═══════════════════════════════════════════════════════════════
//  POST /api/console/comex-report
//
//  Generates a 4-page board-ready weekly COMEX report from real
//  data. Compiles:
//    • brand-health        — reputation score, crisis level, SOV
//    • sentiment-trend 30d — daily sentiment sparkline
//    • topics              — top narratives (sources + risk themes)
//    • source-distribution — media mix
//    • crisis-alerts       — last 7d negative mentions + WhatsApp
//    • share-of-voice      — competitor benchmarking (page 3)
//
//  Output structure: 4 board sections.
//    a. Executive Summary   — paragraph + 3 KPIs
//    b. Tendance 30 jours   — sentiment evolution + top narratives
//    c. Analyse concurrentielle — SOV + positioning
//    d. Recommandations     — 3-5 priority-ranked action items
//
//  This is NOT chat. This is a structured deliverable for the C-suite.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { logInfo, logError } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// ─── TYPES (returned to client) ──────────────────────────────────

type Priority = "P0" | "P1" | "P2" | "P3";
type Momentum = "rising" | "falling" | "stable";

interface ComexReport {
  meta: {
    companyName: string;
    sector: string | null;
    generatedAt: string;
    weekLabel: string;
    plan: string;
  };
  executiveSummary: {
    score: number;
    scoreTrend: number;
    sentimentIndex: number; // -100..+100
    totalMentions: number;
    mentions30d: number;
    summary: string;
  };
  tendance: {
    sparkline: Array<{ date: string; value: number }>;
    delta: number;
    narratives: Array<{
      label: string;
      momentum: Momentum;
      sentiment: number;
      volume: number;
    }>;
  };
  competitorAnalysis: {
    competitors: Array<{
      name: string;
      shareOfVoice: number;
      mentions: number;
      sentiment: number;
      isYou: boolean;
    }>;
    totalMentions: number;
    yourRank: number;
    yourShare: number;
  };
  recommendations: Array<{
    priority: Priority;
    title: string;
    description: string;
    deadlineDays: number;
  }>;
}

// ═══════════════════════════════════════════════════════════════
//  POST HANDLER
// ═══════════════════════════════════════════════════════════════

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companyId = session.user.companyId;
  if (!companyId) {
    return NextResponse.json({ error: "No company linked" }, { status: 400 });
  }

  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
    const oneDayAgo = new Date(now.getTime() - 86400000);

    // ─── Parallel fetch of all underlying data ──────────────────
    const [
      company,
      reputationScore,
      articles30d,
      articles7dSentiment,
      articles24hCount,
      totalCompanyArticles,
      negativeAlerts,
      topSources,
      riskAssessments,
      competitorsRaw,
      totalSectorArticles,
    ] = await Promise.all([
      prisma.company.findUnique({
        where: { id: companyId },
        select: { name: true, sector: true },
      }),
      prisma.reputationScore.findFirst({
        where: { companyId },
        orderBy: { calculatedAt: "desc" },
      }),
      prisma.article.findMany({
        where: { companyId, publishedAt: { gte: thirtyDaysAgo } },
        select: {
          sentimentScore: true,
          sentimentLabel: true,
          publishedAt: true,
          source: true,
        },
        orderBy: { publishedAt: "asc" },
        take: 5000,
      }),
      prisma.article.findMany({
        where: { companyId, publishedAt: { gte: sevenDaysAgo } },
        select: { sentimentLabel: true, sentimentScore: true, source: true },
        take: 1000,
      }),
      prisma.article.count({
        where: { companyId, publishedAt: { gte: oneDayAgo } },
      }),
      prisma.article.count({ where: { companyId } }),
      prisma.article.findMany({
        where: {
          companyId,
          sentimentLabel: "negative",
          publishedAt: { gte: sevenDaysAgo },
        },
        orderBy: { publishedAt: "desc" },
        take: 8,
        select: {
          title: true,
          source: true,
          publishedAt: true,
          url: true,
          sentimentScore: true,
        },
      }),
      prisma.article.groupBy({
        by: ["source"],
        where: { companyId, publishedAt: { gte: thirtyDaysAgo } },
        _count: true,
        orderBy: { _count: { source: "desc" } },
        take: 6,
      }),
      prisma.riskAssessment.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { category: true, articleCount: true, riskScore: true },
      }),
      // Sector competitors (max 5 incl. self)
      (async () => {
        const me = await prisma.company.findUnique({
          where: { id: companyId },
          select: { id: true, name: true, sector: true },
        });
        if (!me) return [];
        const others = await prisma.company.findMany({
          where: { sector: me.sector, id: { not: companyId } },
          take: 4,
          select: { id: true, name: true },
        });
        return [
          { id: me.id, name: me.name, isYou: true },
          ...others.map((c) => ({ id: c.id, name: c.name, isYou: false })),
        ];
      })(),
      prisma.article.count({
        where: { publishedAt: { gte: thirtyDaysAgo } },
      }),
    ]);

    // ─── 1. EXECUTIVE SUMMARY ───────────────────────────────────
    const positive7d = articles7dSentiment.filter((a) => a.sentimentLabel === "positive").length;
    const negative7d = articles7dSentiment.filter((a) => a.sentimentLabel === "negative").length;
    const total7d = articles7dSentiment.length || 1;
    const posPct = (positive7d / total7d) * 100;
    const negPct = (negative7d / total7d) * 100;
    const sentimentIndex = Math.round(posPct - negPct); // -100..+100

    const negativeShare = negative7d / total7d;
    const crisisScore = Math.min(
      100,
      Math.round(negativeShare * 60 + Math.min(25, (articles24hCount / 50) * 25)),
    );
    const crisisLevel =
      crisisScore >= 75 ? "critical" : crisisScore >= 50 ? "warning" : crisisScore >= 25 ? "watch" : "safe";

    const score = reputationScore?.overall ?? 50;
    const scoreTrend = reputationScore?.trend === "up" ? 2 : reputationScore?.trend === "down" ? -3 : 0;

    const summary = buildExecutiveSummary(
      company?.name ?? "votre entreprise",
      score,
      crisisLevel,
      posPct,
      negPct,
      articles30d.length,
      articles24hCount,
    );

    // ─── 2. TENDANCE 30 JOURS ──────────────────────────────────
    const bucket = new Map<string, { date: string; sum: number; count: number }>();
    const start = new Date(thirtyDaysAgo);
    start.setHours(0, 0, 0, 0);
    for (let d = new Date(start); d <= now; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      bucket.set(key, { date: key, sum: 0, count: 0 });
    }
    for (const a of articles30d) {
      if (!a.publishedAt) continue;
      const key = a.publishedAt.toISOString().slice(0, 10);
      const b = bucket.get(key);
      if (!b) continue;
      b.count += 1;
      b.sum += a.sentimentScore ?? 0;
    }
    const sparkline = Array.from(bucket.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((b) => ({
        date: b.date,
        value: b.count > 0 ? Math.round((b.sum / b.count) * 1000) / 1000 : 0,
      }));

    // Delta = last day vs first day with data
    const firstWithValue = sparkline.find((p) => p.value !== 0);
    const lastWithValue = [...sparkline].reverse().find((p) => p.value !== 0);
    const delta =
      firstWithValue && lastWithValue
        ? Math.round((lastWithValue.value - firstWithValue.value) * 1000) / 1000
        : 0;

    // Narratives — top sources + risk themes as "narratives"
    const sourceMap = new Map<string, { count: number; sentimentSum: number; sentimentCount: number }>();
    for (const a of articles7dSentiment) {
      const src = a.source || "unknown";
      const e = sourceMap.get(src) ?? { count: 0, sentimentSum: 0, sentimentCount: 0 };
      e.count += 1;
      if (typeof a.sentimentScore === "number") {
        e.sentimentSum += a.sentimentScore;
        e.sentimentCount += 1;
      }
      sourceMap.set(src, e);
    }
    const sourceNarratives = Array.from(sourceMap.entries())
      .map(([label, e]) => {
        const avgSentiment = e.sentimentCount > 0 ? Math.round((e.sentimentSum / e.sentimentCount) * 100) / 100 : 0;
        return {
          label,
          volume: e.count,
          sentiment: avgSentiment,
          momentum: deriveMomentum(avgSentiment),
        };
      })
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 3);

    const riskNarratives = riskAssessments
      .filter((r) => (r.articleCount ?? 0) > 0)
      .slice(0, 2)
      .map((r) => ({
        label: r.category,
        volume: r.articleCount ?? 0,
        sentiment: -Math.abs((r.riskScore ?? 0) / 100),
        momentum: "rising" as Momentum,
      }));

    // Prefer source narratives; fall back to risk themes if sparse
    const narratives = (sourceNarratives.length >= 3
      ? sourceNarratives
      : [...sourceNarratives, ...riskNarratives]
    ).slice(0, 3);

    // ─── 3. ANALYSE CONCURRENTIELLE ────────────────────────────
    const competitorCounts = await Promise.all(
      competitorsRaw.map(async (c) => {
        const count = await prisma.article.count({
          where: { companyId: c.id, publishedAt: { gte: thirtyDaysAgo } },
        });
        const sentimentAgg = await prisma.article.aggregate({
          where: { companyId: c.id, publishedAt: { gte: thirtyDaysAgo } },
          _avg: { sentimentScore: true },
        });
        return {
          name: c.name,
          isYou: c.isYou,
          mentions: count,
          sentiment: sentimentAgg._avg.sentimentScore ?? 0,
        };
      }),
    );

    const totalCompetitorMentions = competitorCounts.reduce((s, c) => s + c.mentions, 0) || 1;
    const competitors = competitorCounts
      .map((c) => ({
        name: c.name,
        mentions: c.mentions,
        sentiment: Math.round(c.sentiment * 100) / 100,
        shareOfVoice: Math.round((c.mentions / totalCompetitorMentions) * 1000) / 10, // 1 decimal
        isYou: c.isYou,
      }))
      .sort((a, b) => b.mentions - a.mentions);

    const yourIdx = competitors.findIndex((c) => c.isYou);
    const yourRank = yourIdx >= 0 ? yourIdx + 1 : 0;
    const yourShare = yourIdx >= 0 ? competitors[yourIdx].shareOfVoice : 0;

    // ─── 4. RECOMMANDATIONS (3-5, priority-ranked) ─────────────
    const recommendations = buildRecommendations({
      crisisLevel,
      crisisScore,
      score,
      sentimentIndex,
      negPct,
      posPct,
      totalMentions30d: articles30d.length,
      yourShare,
      yourRank,
      competitorCount: competitors.length,
      topAlertCount: negativeAlerts.length,
      sectorCoverage: totalSectorArticles,
    });

    // ─── Week label (fr) ───────────────────────────────────────
    const weekStart = new Date(now.getTime() - 7 * 86400000);
    const fmt = (d: Date) =>
      d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
    const weekLabel = `Semaine du ${fmt(weekStart)} au ${fmt(now)}`;

    const report: ComexReport = {
      meta: {
        companyName: company?.name ?? "Votre entreprise",
        sector: company?.sector ?? null,
        generatedAt: now.toISOString(),
        weekLabel,
        plan: session.user.accountType ?? "essential",
      },
      executiveSummary: {
        score,
        scoreTrend,
        sentimentIndex,
        totalMentions: totalCompanyArticles,
        mentions30d: articles30d.length,
        summary,
      },
      tendance: {
        sparkline,
        delta,
        narratives,
      },
      competitorAnalysis: {
        competitors,
        totalMentions: totalCompetitorMentions,
        yourRank,
        yourShare,
      },
      recommendations,
    };

    logInfo(
      "comex-report",
      `COMEX report generated for ${company?.name}: score=${score}, mentions30d=${articles30d.length}, competitors=${competitors.length}, recs=${recommendations.length}`,
    );

    return NextResponse.json(report);
  } catch (err) {
    logError("comex-report", `Generate failed: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════

function deriveMomentum(avgSentiment: number): Momentum {
  if (avgSentiment > 0.05) return "rising";
  if (avgSentiment < -0.05) return "falling";
  return "stable";
}

function buildExecutiveSummary(
  companyName: string,
  score: number,
  crisisLevel: string,
  posPct: number,
  negPct: number,
  mentions30d: number,
  mentions24h: number,
): string {
  if (mentions30d === 0) {
    return `${companyName} est en phase de collecte. Les premières mentions seront disponibles sous 24-48h. Ce rapport sera alimenté automatiquement dès que le volume minimum sera atteint.`;
  }

  const healthLabel =
    score >= 70 ? "solide" : score >= 50 ? "stable" : score >= 30 ? "fragile" : "critique";

  if (crisisLevel === "critical") {
    return `${companyName} traverse une période critique. ${Math.round(
      negPct,
    )}% des mentions sur 7 jours sont négatives (${mentions30d} mentions sur 30 jours, ${mentions24h} dans les dernières 24h). Le COMEX doit activer la cellule de crise et préparer une réponse publique coordonnée dans les 24h.`;
  }

  if (crisisLevel === "warning") {
    return `${companyName} présente une réputation ${healthLabel} (${score}/100) avec une dégradation observable: ${Math.round(
      negPct,
    )}% de sentiment négatif. ${mentions30d} mentions collectées sur 30 jours. Une vigilance renforcée est recommandée ainsi qu'un brief Dircom préparatoire.`;
  }

  if (score >= 70) {
    return `${companyName} affiche une réputation ${healthLabel} (${score}/100) avec ${Math.round(
      posPct,
    )}% de sentiment positif. ${mentions30d} mentions collectées sur 30 jours, ${mentions24h} dans les dernières 24h. Le momentum est favorable: capitaliser via une communication de succès et identifier les alliés média.`;
  }

  return `${companyName} présente une réputation ${healthLabel} (${score}/100). ${mentions30d} mentions collectées sur 30 jours (${Math.round(
    posPct,
  )}% positif, ${Math.round(
    negPct,
  )}% négatif). Le COMEX doit valider une stratégie de communication corrective et prioriser les narratifs à neutraliser.`;
}

interface RecommendationInput {
  crisisLevel: string;
  crisisScore: number;
  score: number;
  sentimentIndex: number;
  negPct: number;
  posPct: number;
  totalMentions30d: number;
  yourShare: number;
  yourRank: number;
  competitorCount: number;
  topAlertCount: number;
  sectorCoverage: number;
}

function buildRecommendations(input: RecommendationInput): ComexReport["recommendations"] {
  const recs: ComexReport["recommendations"] = [];

  // P0 — Crisis override
  if (input.crisisLevel === "critical") {
    recs.push({
      priority: "P0",
      title: "Activer la cellule de crise",
      description:
        "Niveau critique atteint. Convoquer la cellule de crise, préparer un communiqué public et coordonner la réponse Dircom + juridique dans les 24h.",
      deadlineDays: 1,
    });
  } else if (input.crisisLevel === "warning") {
    recs.push({
      priority: "P0",
      title: "Brief Dircom préparatoire",
      description:
        "Niveau d'alerte élevé. Préparer un brief de communication préventive et identifier les porte-parole. Activer la veille renforcée 24/7.",
      deadlineDays: 3,
    });
  }

  // P1 — Sentiment negative > 30%
  if (input.negPct > 30) {
    recs.push({
      priority: "P1",
      title: "Neutraliser les narratifs négatifs",
      description: `${Math.round(
        input.negPct,
      )}% des mentions sont négatives. Cartographier les sources critiques et préparer une stratégie de réponse ciblée (fact-checking, droite de réponse, contre-narratif).`,
      deadlineDays: 7,
    });
  }

  // P1 — Share of voice weak
  if (input.yourShare > 0 && input.yourShare < 20) {
    recs.push({
      priority: "P1",
      title: "Renforcer la présence média",
      description: `Part de voix à ${input.yourShare}% (rang ${input.yourRank}/${input.competitorCount}). Investir dans les relations presse et la production de contenu pour gagner 5-10 points de SOV sur le trimestre.`,
      deadlineDays: 30,
    });
  }

  // P2 — Capitalize on positive momentum
  if (input.posPct > 50 && input.crisisLevel === "safe") {
    recs.push({
      priority: "P2",
      title: "Capitaliser sur le momentum positif",
      description: `${Math.round(
        input.posPct,
      )}% de sentiment positif. Préparer un communiqué de succès, identifier les alliés média et amplifier via les canaux sociaux favorables.`,
      deadlineDays: 14,
    });
  }

  // P2 — Reputation score low
  if (input.score < 50 && input.crisisLevel !== "critical") {
    recs.push({
      priority: "P2",
      title: "Audit de réputation approfondi",
      description: `Score de réputation à ${input.score}/100. Commander un audit qualitatif des narratifs, identifier les angles morts médiatiques et définir une feuille de route semestrielle.`,
      deadlineDays: 21,
    });
  }

  // P3 — Standing recommendations
  if (recs.length < 4) {
    recs.push({
      priority: "P3",
      title: "Revue trimestrielle des KPIs",
      description:
        "Présenter ce rapport en COMEX trimestriel. Comparer l'évolution sur 90 jours et ajuster la stratégie de communication en fonction des tendances observées.",
      deadlineDays: 90,
    });
  }

  if (recs.length < 3) {
    recs.push({
      priority: "P3",
      title: "Renforcement de la veille Darija",
      description:
        "Étendre la couverture aux plateformes Darija (Hespress, TikTok Maroc, WhatsApp). Le marché marocain nécessite une écoute linguistique continue.",
      deadlineDays: 45,
    });
  }

  // Sort by priority P0 > P1 > P2 > P3
  const priorityOrder: Record<Priority, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };
  return recs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]).slice(0, 5);
}
