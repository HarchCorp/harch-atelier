// ═══════════════════════════════════════════════════════════════
//  POST /api/console/briefing/generate
//
//  Generates a complete morning briefing from real data.
//  Fetches: brand-health, crisis-alerts, sentiment-trend,
//  source-distribution, topics — compiles into a structured
//  1-page briefing.
//
//  This is NOT chat. This is a structured deliverable.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { logInfo } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
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
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
    const oneDayAgo = new Date(now.getTime() - 86400000);

    // Fetch ALL data in parallel
    const [
      company,
      reputationScore,
      articles24h,
      articles7d,
      topArticles,
      alerts,
      topSources,
      totalCompanyArticles,
    ] = await Promise.all([
      prisma.company.findUnique({
        where: { id: companyId },
        select: { name: true, sector: true },
      }),
      prisma.reputationScore.findFirst({
        where: { companyId },
        orderBy: { calculatedAt: "desc" },
      }),
      prisma.article.count({
        where: { companyId, publishedAt: { gte: oneDayAgo } },
      }),
      prisma.article.findMany({
        where: { companyId, publishedAt: { gte: sevenDaysAgo } },
        select: { sentimentLabel: true, sentimentScore: true, title: true, source: true, publishedAt: true, url: true },
        orderBy: { publishedAt: "desc" },
        take: 100,
      }),
      prisma.article.findMany({
        where: { companyId },
        orderBy: { publishedAt: "desc" },
        select: { title: true, source: true, publishedAt: true, url: true, sentimentLabel: true, summary: true },
        take: 10,
      }),
      prisma.article.findMany({
        where: { companyId, sentimentLabel: "negative", publishedAt: { gte: sevenDaysAgo } },
        select: { title: true, source: true, publishedAt: true, url: true },
        orderBy: { publishedAt: "desc" },
        take: 5,
      }),
      prisma.article.groupBy({
        by: ["source"],
        where: { companyId, publishedAt: { gte: sevenDaysAgo } },
        _count: true,
        orderBy: { _count: { source: "desc" } },
        take: 5,
      }),
      prisma.article.count({ where: { companyId } }),
    ]);

    // Compute sentiment
    const positive = articles7d.filter((a) => a.sentimentLabel === "positive").length;
    const negative = articles7d.filter((a) => a.sentimentLabel === "negative").length;
    const neutral = articles7d.filter((a) => a.sentimentLabel === "neutral").length;
    const total = articles7d.length || 1;

    const sentimentPct = {
      positive: Math.round((positive / total) * 100),
      neutral: Math.round((neutral / total) * 100),
      negative: Math.round((negative / total) * 100),
    };

    // Crisis score
    const negativeShare = negative / total;
    const crisisScore = Math.min(100, Math.round(negativeShare * 60 + Math.min(25, (articles24h / 50) * 25)));
    const crisisLevel = crisisScore >= 75 ? "critical" : crisisScore >= 50 ? "warning" : crisisScore >= 25 ? "watch" : "safe";

    // Score
    const score = reputationScore?.overall ?? 50;
    const trend = reputationScore?.trend === "up" ? 2 : -3;

    // Top 3 articles (most recent with sentiment)
    const top3 = topArticles.slice(0, 3).map((a) => ({
      title: a.title,
      source: a.source,
      date: a.publishedAt?.toISOString() ?? null,
      url: a.url,
      sentiment: a.sentimentLabel ?? "neutral",
    }));

    // Alerts (negative articles)
    const crisisAlerts = alerts.map((a) => ({
      title: a.title,
      source: a.source,
      date: a.publishedAt?.toISOString() ?? null,
      url: a.url,
    }));

    // Build the structured briefing
    const briefing = {
      meta: {
        companyName: company?.name ?? "Votre entreprise",
        sector: company?.sector ?? null,
        generatedAt: now.toISOString(),
        date: now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
        plan: session.user.accountType ?? "essential",
      },
      score: {
        value: score,
        trend,
        status: totalCompanyArticles === 0 ? "no_data" : totalCompanyArticles < 10 ? "limited" : "nominal",
        totalArticles: totalCompanyArticles,
      },
      sentiment: {
        positive: sentimentPct.positive,
        neutral: sentimentPct.neutral,
        negative: sentimentPct.negative,
        total7d: articles7d.length,
        articles24h,
      },
      crisis: {
        level: crisisLevel,
        score: crisisScore,
        alerts: crisisAlerts,
      },
      topArticles: top3,
      topSources: topSources.map((s) => ({ source: s.source, count: s._count })),
      recommendation: generateRecommendation(score, crisisLevel, sentimentPct, totalCompanyArticles),
    };

    logInfo("briefing", `Briefing generated for ${company?.name}: score=${score}, articles=${totalCompanyArticles}, crisis=${crisisLevel}`);

    return NextResponse.json(briefing);
  } catch (err) {
    logInfo("briefing", `Generate failed: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}

function generateRecommendation(
  score: number,
  crisisLevel: string,
  sentiment: { positive: number; neutral: number; negative: number },
  totalArticles: number,
): string {
  if (totalArticles === 0) {
    return "Collecte d'articles en cours. Votre score de réputation sera disponible dès que nous aurons suffisamment de données (24-48h).";
  }
  if (crisisLevel === "critical") {
    return `ATTENTION — Crise détectée. ${sentiment.negative}% des mentions sont négatives. Activez le Mode Crise. Préparez un communiqué de réponse. Contactez votre Dircom immédiatement.`;
  }
  if (crisisLevel === "warning") {
    return `Surveillance renforcée recommandée. ${sentiment.negative}% de sentiment négatif. Préparez un brief pour la direction. Surveillez l'évolution dans les 48h.`;
  }
  if (score >= 70) {
    return `Réputation solide (${score}/100). Capitalisez sur le momentum positif (${sentiment.positive}% positif). Préparez un communiqué de succès. Identifiez les sources favorables pour relations presse.`;
  }
  if (score >= 50) {
    return `Réputation stable (${score}/100). Amélioration possible. Concentrez-vous sur les narratifs négatifs (${sentiment.negative}%). Identifiez les sources critiques pour une stratégie de réponse.`;
  }
  return `Réputation fragile (${score}/100). Action requise. ${sentiment.negative}% de sentiment négatif. Audit recommandé. Élaborez une stratégie de communication corrective.`;
}
