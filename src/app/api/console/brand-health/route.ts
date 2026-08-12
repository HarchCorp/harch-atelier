import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { isDemoEmail } from "@/lib/demo-session";
import { prisma } from "@/lib/db";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.isDemo || isDemoEmail(session.user.email)) {
    return NextResponse.json(buildDemoResponse());
  }

  try {
    const companyId = session.user.companyId;
    if (!companyId) return NextResponse.json(buildDemoResponse());

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
    const oneDayAgo = new Date(now.getTime() - 86400000);

    const [reputationScore, articles24h, articles7d, aiVis, competitors, companyInfo, totalCompanyArticles] = await Promise.all([
      prisma.reputationScore.findFirst({ where: { companyId }, orderBy: { calculatedAt: "desc" } }),
      prisma.article.count({ where: { companyId, publishedAt: { gte: oneDayAgo } } }),
      prisma.article.findMany({ where: { companyId, publishedAt: { gte: sevenDaysAgo } }, select: { sentimentLabel: true, sentimentScore: true }, take: 500 }),
      prisma.aIVisibility.findMany({ where: { companyId }, orderBy: { checkedAt: "desc" }, take: 4, select: { platform: true, confidence: true, cited: true, mentions: true, rank: true, shareOfVoice: true } }),
      prisma.company.findMany({ where: { id: { not: companyId } }, take: 5, select: { id: true, name: true } }),
      prisma.company.findUnique({ where: { id: companyId }, select: { name: true } }),
      prisma.article.count({ where: { companyId } }),
    ]);

    // HONEST EMPTY STATES — no fake score 50 when there's no data
    if (totalCompanyArticles === 0) {
      return NextResponse.json({
        score: null,
        status: "no_data",
        message: `Nous collectons des articles sur ${companyInfo?.name ?? "votre entreprise"}. Premiers résultats sous 24-48h.`,
        companyName: companyInfo?.name ?? "",
        trend: 0,
        sentiment: { positive: 0, neutral: 0, negative: 0 },
        shareOfVoice: 0,
        competitiveRank: 0,
        totalCompetitors: competitors.length,
        mentionCount24h: 0,
        mentionVelocity: 0,
        crisisLevel: "safe",
        crisisScore: 0,
        topNarrative: null,
        aiVisibility: [],
        recommendation: "Collecte en cours.",
        lastUpdated: new Date().toISOString(),
        source: "neon",
      });
    }

    const positive = articles7d.filter(a => a.sentimentLabel === "positive").length;
    const negative = articles7d.filter(a => a.sentimentLabel === "negative").length;
    const neutral = articles7d.filter(a => a.sentimentLabel === "neutral").length;
    const total = articles7d.length || 1;

    const totalAllArticles = await prisma.article.count({ where: { publishedAt: { gte: sevenDaysAgo } } });
    const sov = totalAllArticles > 0 ? Math.round((articles7d.length / totalAllArticles) * 100) : 0;

    const negativeShare = negative / total;
    const crisisScore = Math.min(100, Math.round(negativeShare * 60 + Math.min(25, (articles24h / 50) * 25)));
    const score = reputationScore?.overall ?? 50;
    const trend = reputationScore?.trend === "up" ? 2 : -3;

    return NextResponse.json({
      score, trend,
      sentiment: { positive: Math.round((positive/total)*100), neutral: Math.round((neutral/total)*100), negative: Math.round((negative/total)*100) },
      shareOfVoice: sov,
      competitiveRank: 1,
      totalCompetitors: competitors.length,
      mentionCount24h: articles24h,
      mentionVelocity: Math.round((articles24h/24)*10)/10,
      crisisLevel: crisisScore >= 75 ? "critical" : crisisScore >= 50 ? "warning" : crisisScore >= 25 ? "watch" : "safe",
      crisisScore,
      topNarrative: { label: negativeShare > 0.3 ? "Negative sentiment spike" : "Stable reputation", momentum: negativeShare > 0.3 ? "rising" : "stable", sentiment: -(negativeShare) },
      aiVisibility: aiVis.length > 0 ? aiVis.map(a => ({ engine: a.platform, score: Math.round((a.confidence ?? 0) * 100) })) : [{engine:"ChatGPT",score:0},{engine:"Claude",score:0},{engine:"Gemini",score:0},{engine:"Perplexity",score:0}],
      recommendation: crisisScore >= 75 ? "CRITICAL — Activate crisis workflow." : crisisScore >= 50 ? "WARNING — Prepare Dircom brief." : "Nominal.",
      lastUpdated: new Date().toISOString(),
      status: totalCompanyArticles < 10 ? "limited" : undefined,
      warning: totalCompanyArticles < 10 ? `Données limitées (${totalCompanyArticles} articles). Collecte en cours.` : undefined,
      companyName: companyInfo?.name ?? "",
      source: "neon",
    });
  } catch (err) {
    logError("console.brand-health", `[brand-health] error: ${err}`);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

function buildDemoResponse() {
  return {
    score: 74, trend: -3,
    sentiment: { positive: 42, neutral: 28, negative: 30 },
    shareOfVoice: 34, competitiveRank: 2, totalCompetitors: 5,
    mentionCount24h: 1247, mentionVelocity: 18.4,
    crisisLevel: "warning", crisisScore: 52,
    topNarrative: { label: "Frais bancaires excessifs", momentum: "rising", sentiment: -0.58 },
    aiVisibility: [{engine:"ChatGPT",score:72},{engine:"Claude",score:68},{engine:"Gemini",score:64},{engine:"Perplexity",score:71}],
    recommendation: "Le narrative 'Frais bancaires excessifs' gagne du momentum en Darija (+28% en 24h). Surveiller la vélocité MSA/Français.",
    lastUpdated: new Date().toISOString(),
    source: "demo",
  };
}
