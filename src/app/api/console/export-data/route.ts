import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { isDemoEmail } from "@/lib/demo-session";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const type = url.searchParams.get("type") || "articles";
  const days = parseInt(url.searchParams.get("days") || "7");
  const since = new Date(Date.now() - days * 86400000);

  if (session.user.isDemo || isDemoEmail(session.user.email)) {
    return NextResponse.json({ rows: [], source: "demo" });
  }

  try {
    const companyId = session.user.companyId;
    if (!companyId) return NextResponse.json({ rows: [], source: "demo" });

    if (type === "articles") {
      const articles = await prisma.article.findMany({
        where: { companyId, publishedAt: { gte: since } },
        orderBy: { publishedAt: "desc" },
        take: 1000,
        select: { title: true, source: true, url: true, publishedAt: true, sentimentLabel: true, sentimentScore: true, language: true },
      });
      return NextResponse.json({ rows: articles.map(a => ({ title: a.title, source: a.source, url: a.url, date: a.publishedAt?.toISOString(), sentiment: a.sentimentLabel, score: a.sentimentScore, language: a.language })), source: "neon" });
    }

    if (type === "alerts") {
      const articles = await prisma.article.findMany({
        where: { companyId, sentimentLabel: "negative", publishedAt: { gte: since } },
        orderBy: { publishedAt: "desc" },
        take: 500,
        select: { title: true, source: true, publishedAt: true, sentimentScore: true },
      });
      return NextResponse.json({ rows: articles.map(a => ({ title: a.title, source: a.source, date: a.publishedAt?.toISOString(), severity: a.sentimentScore && a.sentimentScore < -0.5 ? "critical" : "warning", score: a.sentimentScore })), source: "neon" });
    }

    if (type === "reputation") {
      const scores = await prisma.reputationScore.findMany({
        where: { companyId },
        orderBy: { calculatedAt: "desc" },
        take: 100,
      });
      return NextResponse.json({ rows: scores.map(s => ({ date: s.calculatedAt.toISOString(), overall: s.overall, trend: s.trend, sentiment: s.sentiment, aiVisibility: s.aiVisibility, volume: s.volume })), source: "neon" });
    }

    if (type === "ai_visibility") {
      const vis = await prisma.aIVisibility.findMany({
        where: { companyId },
        orderBy: { checkedAt: "desc" },
        take: 200,
        select: { platform: true, cited: true, confidence: true, sentiment: true, checkedAt: true },
      });
      return NextResponse.json({ rows: vis.map(v => ({ engine: v.platform, cited: v.cited, confidence: v.confidence, sentiment: v.sentiment, date: v.checkedAt.toISOString() })), source: "neon" });
    }

    return NextResponse.json({ rows: [], error: "Unknown type" });
  } catch (err) {
    console.error("[export-data] error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
