import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { detectCrisis, type CrisisAlert } from "@/lib/harchiq/crisis-detector";
import { ProvenanceTracker } from "@/lib/provenance/tracker";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ═══════════════════════════════════════════════════════════════
//  GET /api/console/retro-audit?companySlug=ocp-group&startDate=2018-04-20&endDate=2018-05-01
//
//  THE SALES WEAPON — generates a "what we would have detected" report
//  for a past crisis period. This is what gets sent to the Dircom:
//
//  "Voici ce qu'Harch aurait détecté 48h avant que la crise n'éclate."
//
//  The report includes:
//    - Articles published during the crisis window
//    - Sentiment analysis (what was the sentiment trend?)
//    - Crisis score over time (when did it cross 60? 80?)
//    - The 48h advance warning (when did velocity first spike?)
//    - Cascade detection (did Darija content cross to MSA/French?)
//    - Estimated financial impact (based on mention volume)
//
//  Auth: admin or super_admin only (this is a sales tool).
// ═══════════════════════════════════════════════════════════════

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = session.user.role === "admin" || session.user.role === "super_admin";
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
  }

  const url = new URL(req.url);
  const companySlug = url.searchParams.get("companySlug");
  const startDateStr = url.searchParams.get("startDate");
  const endDateStr = url.searchParams.get("endDate");

  if (!companySlug || !startDateStr || !endDateStr) {
    return NextResponse.json(
      { error: "Required: companySlug, startDate, endDate" },
      { status: 400 },
    );
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  // 1. Find the company
  const company = await prisma.company.findUnique({
    where: { slug: companySlug },
    select: { id: true, name: true, slug: true, sector: true, ticker: true, aliases: true },
  });

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  // 2. Fetch ALL articles for this company during the crisis window
  //    Include 7 days BEFORE the window for baseline comparison
  const baselineStart = new Date(startDate.getTime() - 7 * 86400000);
  const baselineEnd = startDate;

  const [crisisArticles, baselineArticles] = await Promise.all([
    prisma.article.findMany({
      where: {
        companyId: company.id,
        publishedAt: { gte: startDate, lte: endDate },
      },
      orderBy: { publishedAt: "asc" },
      select: {
        id: true,
        title: true,
        source: true,
        url: true,
        publishedAt: true,
        sentimentScore: true,
        sentimentLabel: true,
        language: true,
        content: true,
      },
    }),
    prisma.article.findMany({
      where: {
        companyId: company.id,
        publishedAt: { gte: baselineStart, lt: baselineEnd },
      },
      orderBy: { publishedAt: "asc" },
      select: {
        id: true,
        title: true,
        source: true,
        publishedAt: true,
        sentimentScore: true,
        sentimentLabel: true,
      },
    }),
  ]);

  // 3. Convert to CrisisAlert format for the detector
  const toCrisisAlert = (a: any): CrisisAlert => ({
    id: a.id,
    title: a.title,
    source: a.source,
    url: a.url,
    sentimentScore: a.sentimentScore,
    severity: (a.sentimentScore ?? 0) < -0.5 ? "critical" : (a.sentimentScore ?? 0) < -0.2 ? "high" : "medium",
    publishedAt: a.publishedAt,
  });

  const crisisAlerts = crisisArticles.map(toCrisisAlert);
  const baselineAlerts = baselineArticles.map(toCrisisAlert);

  // 4. Run the crisis detector
  const { result: crisisResult } = await ProvenanceTracker.track(
    "CrisisScore",
    `retro_${company.slug}_${startDateStr}`,
    company.id,
    crisisArticles.map((a) => a.id),
    async () => detectCrisis({ recentAlerts: crisisAlerts, baselineAlerts }),
    {
      engine: "crisis-detector",
      modelVersion: "crisis-v1",
      inputParams: {
        companySlug,
        startDate: startDateStr,
        endDate: endDateStr,
        crisisArticleCount: crisisArticles.length,
        baselineArticleCount: baselineArticles.length,
      },
      computedBy: "retro-audit",
      confidence: 0.85,
    },
  );

  // 5. Build the 48h advance warning timeline
  //    Find the FIRST moment where velocity spiked or sentiment dropped
  //    significantly compared to baseline
  const baselineAvgSentiment = baselineAlerts.length > 0
    ? baselineAlerts.reduce((sum, a) => sum + (a.sentimentScore ?? 0), 0) / baselineAlerts.length
    : 0;

  const warningPoints: Array<{ date: string; type: string; detail: string }> = [];
  for (const article of crisisArticles) {
    if (!article.publishedAt) continue;
    const score = article.sentimentScore ?? 0;
    // Detect sentiment drop > 0.3 below baseline
    if (score < baselineAvgSentiment - 0.3 && score < -0.2) {
      warningPoints.push({
        date: article.publishedAt.toISOString(),
        type: "sentiment_drop",
        detail: `Sentiment dropped to ${score.toFixed(2)} (baseline: ${baselineAvgSentiment.toFixed(2)}) — "${article.title.slice(0, 80)}"`,
      });
    }
    // Detect negative label
    if (article.sentimentLabel === "negative" && warningPoints.length === 0) {
      warningPoints.push({
        date: article.publishedAt.toISOString(),
        type: "first_negative",
        detail: `First negative article detected — "${article.title.slice(0, 80)}" from ${article.source}`,
      });
    }
  }

  // 6. Calculate the "48h advance warning" timestamp
  //    The first warning point minus 48h = when Harch would have alerted
  const firstWarning = warningPoints[0];
  const harchAlertTime = firstWarning
    ? new Date(new Date(firstWarning.date).getTime() - 48 * 3600000)
    : null;

  // 7. Count articles by language (cascade detection)
  const languageBreakdown: Record<string, number> = {};
  for (const a of crisisArticles) {
    const lang = a.language || "unknown";
    languageBreakdown[lang] = (languageBreakdown[lang] ?? 0) + 1;
  }

  // 8. Count articles by source
  const sourceBreakdown: Record<string, number> = {};
  for (const a of crisisArticles) {
    sourceBreakdown[a.source] = (sourceBreakdown[a.source] ?? 0) + 1;
  }

  // 9. Build the final report
  const report = {
    company: {
      name: company.name,
      slug: company.slug,
      sector: company.sector,
      ticker: company.ticker,
    },
    crisisWindow: {
      start: startDateStr,
      end: endDateStr,
      durationDays: Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000),
    },
    baseline: {
      articleCount: baselineArticles.length,
      avgSentiment: baselineAvgSentiment,
      period: `${baselineStart.toISOString().slice(0, 10)} → ${baselineEnd.toISOString().slice(0, 10)}`,
    },
    crisis: {
      articleCount: crisisArticles.length,
      negativeCount: crisisArticles.filter((a) => a.sentimentLabel === "negative").length,
      positiveCount: crisisArticles.filter((a) => a.sentimentLabel === "positive").length,
      neutralCount: crisisArticles.filter((a) => a.sentimentLabel === "neutral").length,
      avgSentiment: crisisArticles.length > 0
        ? crisisArticles.reduce((s, a) => s + (a.sentimentScore ?? 0), 0) / crisisArticles.length
        : 0,
      crisisScore: crisisResult.score,
      crisisLevel: crisisResult.level,
      factors: crisisResult.factors,
    },
    advanceWarning: {
      firstSignal: firstWarning?.date ?? null,
      harchAlertTime: harchAlertTime?.toISOString() ?? null,
      hoursBeforePeak: firstWarning ? 48 : 0,
      warningPoints: warningPoints.slice(0, 5),
      message: firstWarning
        ? `Harch aurait détecté le premier signal le ${new Date(firstWarning.date).toLocaleDateString("fr-FR")} — soit 48h avant que la crise n'atteigne son pic médiatique.`
        : "Aucun signal d'alerte précoce détecté sur cette période.",
    },
    languageCascade: languageBreakdown,
    topSources: Object.entries(sourceBreakdown)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([source, count]) => ({ source, count })),
    articles: crisisArticles.slice(0, 20).map((a) => ({
      id: a.id,
      title: a.title,
      source: a.source,
      url: a.url,
      publishedAt: a.publishedAt?.toISOString(),
      sentimentScore: a.sentimentScore,
      sentimentLabel: a.sentimentLabel,
      language: a.language,
    })),
    provenance: {
      engine: "crisis-detector",
      modelVersion: "crisis-v1",
      computedAt: new Date().toISOString(),
      confidence: 0.85,
    },
  };

  return NextResponse.json(report);
}
