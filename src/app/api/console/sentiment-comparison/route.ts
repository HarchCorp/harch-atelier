// ═══════════════════════════════════════════════════════════════
//  GET /api/console/sentiment-comparison
//
//  Pro Dashboard — Sentiment comparison table.
//
//  Returns sentiment breakdown (positive / neutral / negative %,
//  total mentions) for the user's company vs up to 3 competitors
//  in the same sector, over the last 30 days.
//
//  Shape:
//    {
//      range: "30d",
//      companies: [{
//        name: string,
//        isYou: boolean,
//        positive: number,    // %
//        neutral: number,     // %
//        negative: number,    // %
//        totalMentions: number,
//        avgSentiment: number // -1..1
//      }],
//      source: "neon" | "demo"
//    }
//
//  Auth: requires session (brand-monitor | market-competitor |
//  investment-bank | admin).
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { isDemoEmail } from "@/lib/demo-session";
import { prisma } from "@/lib/db";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

interface SentimentRow {
  name: string;
  isYou: boolean;
  positive: number;
  neutral: number;
  negative: number;
  totalMentions: number;
  avgSentiment: number;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.isDemo || isDemoEmail(session.user.email)) {
    return NextResponse.json(buildDemo());
  }

  try {
    const companyId = session.user.companyId;
    if (!companyId) return NextResponse.json(buildDemo());

    const myCompany = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true, sector: true },
    });
    if (!myCompany) return NextResponse.json(buildDemo());

    const competitors = await prisma.company.findMany({
      where: { sector: myCompany.sector, id: { not: companyId } },
      take: 3,
      select: { id: true, name: true },
      orderBy: { createdAt: "asc" },
    });

    const allCompanies = [
      { id: myCompany.id, name: myCompany.name, isYou: true },
      ...competitors.map((c) => ({ id: c.id, name: c.name, isYou: false })),
    ];

    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

    const rows: SentimentRow[] = await Promise.all(
      allCompanies.map(async (c) => {
        const [agg, count, avgAgg] = await Promise.all([
          prisma.article.groupBy({
            by: ["sentimentLabel"],
            where: { companyId: c.id, publishedAt: { gte: thirtyDaysAgo } },
            _count: { _all: true },
          }),
          prisma.article.count({
            where: { companyId: c.id, publishedAt: { gte: thirtyDaysAgo } },
          }),
          prisma.article.aggregate({
            where: { companyId: c.id, publishedAt: { gte: thirtyDaysAgo } },
            _avg: { sentimentScore: true },
          }),
        ]);

        const posCount = agg.find((a) => a.sentimentLabel === "positive")?._count._all ?? 0;
        const neuCount = agg.find((a) => a.sentimentLabel === "neutral")?._count._all ?? 0;
        const negCount = agg.find((a) => a.sentimentLabel === "negative")?._count._all ?? 0;

        const total = count || 1;
        return {
          name: c.name,
          isYou: c.isYou,
          positive: Math.round((posCount / total) * 100),
          neutral: Math.round((neuCount / total) * 100),
          negative: Math.round((negCount / total) * 100),
          totalMentions: count,
          avgSentiment: Math.round((avgAgg._avg.sentimentScore ?? 0) * 100) / 100,
        };
      }),
    );

    return NextResponse.json({
      range: "30d",
      companies: rows,
      source: "neon",
    });
  } catch (err) {
    logError("console.sentiment-comparison", `[sentiment-comparison] error: ${err}`);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

function buildDemo() {
  const rows: SentimentRow[] = [
    { name: "Attijariwafa Bank", isYou: true, positive: 68, neutral: 22, negative: 10, totalMentions: 2847, avgSentiment: 0.34 },
    { name: "Bank of Africa", isYou: false, positive: 71, neutral: 19, negative: 10, totalMentions: 2103, avgSentiment: 0.38 },
    { name: "BCP", isYou: false, positive: 45, neutral: 28, negative: 27, totalMentions: 1876, avgSentiment: -0.05 },
    { name: "CIH Bank", isYou: false, positive: 52, neutral: 30, negative: 18, totalMentions: 1245, avgSentiment: 0.12 },
  ];
  return { range: "30d", companies: rows, source: "demo" };
}
