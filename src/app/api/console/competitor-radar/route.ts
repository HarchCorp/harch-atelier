import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { isDemoEmail } from "@/lib/demo-session";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.isDemo || isDemoEmail(session.user.email)) return NextResponse.json(buildDemo());

  try {
    const companyId = session.user.companyId;
    if (!companyId) return NextResponse.json(buildDemo());

    const myCompany = await prisma.company.findUnique({ where: { id: companyId }, select: { id: true, name: true, sector: true } });
    if (!myCompany) return NextResponse.json(buildDemo());

    const competitors = await prisma.company.findMany({ where: { sector: myCompany.sector, id: { not: companyId } }, take: 2, select: { id: true, name: true } });
    const allBrands = [{ id: companyId, name: myCompany.name, isYou: true }, ...competitors.map(c => ({ id: c.id, name: c.name, isYou: false }))];

    const brandsData = await Promise.all(allBrands.map(async (b) => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
      const [articles, scores, aiVis, risks] = await Promise.all([
        prisma.article.count({ where: { companyId: b.id, publishedAt: { gte: thirtyDaysAgo } } }),
        prisma.reputationScore.findFirst({ where: { companyId: b.id }, orderBy: { calculatedAt: "desc" } }),
        prisma.aIVisibility.count({ where: { companyId: b.id, cited: true } }),
        prisma.riskAssessment.count({ where: { companyId: b.id } }),
      ]);
      const negativeArticles = await prisma.article.count({ where: { companyId: b.id, sentimentLabel: "negative", publishedAt: { gte: thirtyDaysAgo } } });
      const sentimentAgg = await prisma.article.aggregate({ where: { companyId: b.id, publishedAt: { gte: thirtyDaysAgo } }, _avg: { sentimentScore: true } });
      
      const totalArticles = await prisma.article.count({ where: { publishedAt: { gte: thirtyDaysAgo } } });
      const sov = totalArticles > 0 ? Math.round((articles / totalArticles) * 100) : 0;
      const avgSentiment = sentimentAgg._avg.sentimentScore ?? 0;
      const sentimentScore = Math.max(0, Math.min(100, Math.round((avgSentiment + 1) * 50)));
      const aiScore = Math.min(100, aiVis);
      const crisisResilience = Math.max(0, 100 - Math.round((negativeArticles / Math.max(articles, 1)) * 100));
      const mediaReach = Math.min(100, Math.round(articles / 10));

      return {
        name: b.name,
        color: b.isYou ? "#1e3a5f" : competitors.indexOf(competitors.find(c => c.id === b.id)!) === 0 ? "#4a7b5f" : "#a0524b",
        isYou: b.isYou,
        scores: { sentiment: sentimentScore, shareOfVoice: sov, aiVisibility: aiScore, influencerAuthority: Math.min(100, Math.round(scores?.overall ?? 50)), crisisResilience, mediaReach },
      };
    }));

    return NextResponse.json({ brands: brandsData, source: "neon" });
  } catch (err) {
    console.error("[competitor-radar] error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

function buildDemo() {
  return {
    brands: [
      { name: "Attijariwafa", color: "#1e3a5f", isYou: true, scores: { sentiment: 62, shareOfVoice: 78, aiVisibility: 72, influencerAuthority: 65, crisisResilience: 58, mediaReach: 84 } },
      { name: "Bank of Africa", color: "#4a7b5f", isYou: false, scores: { sentiment: 71, shareOfVoice: 65, aiVisibility: 68, influencerAuthority: 70, crisisResilience: 72, mediaReach: 70 } },
      { name: "BCP", color: "#a0524b", isYou: false, scores: { sentiment: 45, shareOfVoice: 58, aiVisibility: 54, influencerAuthority: 60, crisisResilience: 50, mediaReach: 62 } },
    ],
    source: "demo",
  };
}
