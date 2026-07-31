import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { requireUserCompany } from "@/lib/harchiq/company-session";

// ═══════════════════════════════════════════════════════════════
//  GET /api/console/influencers?range=7d|30d
//
//  Influencer Scoring — aggregates recent alerts/articles by source
//  and computes a Klear/Meltwater-style influence score per source.
//
//  Formula (per spec):
//    reachScore       = min(100, mentionCount * 2)
//    sentimentImpact  = avg(sentimentScore) * -1     // neg = high impact
//    authorityTier    = "elite"  | top 3 sources by volume
//                       "high"   | top 10
//                       "medium" | top 30
//                       "low"    | rest
//    consistency      = uniqueDays / totalDaysInRange
//    influenceScore   =  reachScore * 0.4
//                     +  abs(sentimentImpact) * 100 * 0.3
//                     +  consistency * 100 * 0.3
//
//  Auth: requires session (brand-monitor | market-competitor |
//  investment-bank | admin).
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

interface InfluencerRow {
  source: string;
  mentionCount: number;
  reachScore: number;
  sentimentImpact: number;
  authorityTier: "elite" | "high" | "medium" | "low";
  consistency: number;
  influenceScore: number;
  avgSentiment: number;
  trend: "up" | "down" | "stable";
  lastMention: string | null;
}

type RangeKey = "7d" | "30d";
const RANGE_DAYS: Record<RangeKey, number> = { "7d": 7, "30d": 30 };

// Tier lookup by rank (1-indexed) in the volume-sorted source list.
function tierForRank(rank: number): "elite" | "high" | "medium" | "low" {
  if (rank <= 3) return "elite";
  if (rank <= 10) return "high";
  if (rank <= 30) return "medium";
  return "low";
}

// Trend: split mentions into first half vs second half by publishedAt
// midpoint. If second-half daily rate >= +20% vs first half -> "up";
// <= -20% -> "down"; else "stable".
function trendOf(stamps: number[]): "up" | "down" | "stable" {
  if (stamps.length < 4) return "stable";
  const sorted = stamps.slice().sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  if (max <= min) return "stable";
  const mid = (min + max) / 2;
  const firstHalf = sorted.filter((t) => t <= mid).length;
  const secondHalf = sorted.length - firstHalf;
  if (firstHalf === 0) return secondHalf > 0 ? "up" : "stable";
  const ratio = secondHalf / firstHalf;
  if (ratio >= 1.2) return "up";
  if (ratio <= 0.8) return "down";
  return "stable";
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const allowedTypes = ["brand-monitor", "market-competitor", "investment-bank"];
  if (!allowedTypes.includes(session.user.accountType || "") && session.user.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden — influencers are for brand-monitor, market-competitor and investment-bank accounts only" },
      { status: 403 },
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const rangeParam = (searchParams.get("range") || "7d") as RangeKey;
    const days = RANGE_DAYS[rangeParam] ?? 7;
    const range: RangeKey = days === 30 ? "30d" : "7d";

    const companySlug = searchParams.get("company");
    let company;
    if (companySlug) {
      if (session.user.role !== "admin") {
        return NextResponse.json(
          { error: "Forbidden — can only view your own company" },
          { status: 403 },
        );
      }
      company = await prisma.company.findUnique({ where: { slug: companySlug } });
    } else {
      const result = await requireUserCompany();
      if (!result.ok) return result.response;
      company = await prisma.company.findUnique({ where: { id: result.data.company.id } });
    }

    if (!company) {
      return NextResponse.json({ range, influencers: [] });
    }

    const since = new Date();
    since.setDate(since.getDate() - days);

    // Same alert corpus as /api/console/narratives — recent articles
    // + active risks. We only need source / sentiment / publishedAt
    // here, but the query is symmetric so cross-dashboard
    // attribution stays consistent.
    const [articles, risks] = await Promise.all([
      prisma.article.findMany({
        where: {
          companyId: company.id,
          publishedAt: { gte: since },
        },
        orderBy: { publishedAt: "desc" },
        take: 1000,
        select: {
          id: true,
          source: true,
          sentimentScore: true,
          publishedAt: true,
        },
      }),
      prisma.riskAssessment.findMany({
        where: {
          companyId: company.id,
          riskLevel: { in: ["high", "critical"] },
          assessedAt: { gte: since },
        },
        orderBy: { assessedAt: "desc" },
        take: 30,
        select: {
          id: true,
          riskLevel: true,
          assessedAt: true,
        },
      }),
    ]);

    // Aggregate per source.
    interface SourceAgg {
      source: string;
      mentionCount: number;
      sentimentSum: number;
      sentimentCount: number;
      daySet: Set<string>;
      lastMs: number;
      stamps: number[];
    }
    const agg = new Map<string, SourceAgg>();

    const bucket = (source: string, sentiment: number | null, at: Date | null) => {
      const key = (source ?? "Unknown").trim() || "Unknown";
      let a = agg.get(key);
      if (!a) {
        a = {
          source: key,
          mentionCount: 0,
          sentimentSum: 0,
          sentimentCount: 0,
          daySet: new Set<string>(),
          lastMs: 0,
          stamps: [],
        };
        agg.set(key, a);
      }
      a.mentionCount += 1;
      if (sentiment !== null && sentiment !== undefined) {
        a.sentimentSum += sentiment;
        a.sentimentCount += 1;
      }
      if (at) {
        const ms = at.getTime();
        const dayKey = at.toISOString().slice(0, 10);
        a.daySet.add(dayKey);
        if (ms > a.lastMs) a.lastMs = ms;
        a.stamps.push(ms);
      }
    };

    for (const art of articles) {
      bucket(art.source, art.sentimentScore, art.publishedAt);
    }
    for (const r of risks) {
      // Risks are attributed to the HarchIQ Risk Engine pseudo-source
      // so they don't pollute organic media influence scores.
      const sentiment = r.riskLevel === "critical" ? -0.8 : -0.5;
      bucket("HarchIQ Risk Engine", sentiment, r.assessedAt);
    }

    if (agg.size === 0) {
      return NextResponse.json({
        range,
        company: { name: company.name, slug: company.slug },
        influencers: [],
        totalMentions: 0,
      });
    }

    // Sort by mention volume desc -> assign authority tiers by rank.
    const sortedByVolume = Array.from(agg.values()).sort((a, b) => b.mentionCount - a.mentionCount);

    const totalMentions = sortedByVolume.reduce((s, a) => s + a.mentionCount, 0);

    const influencers: InfluencerRow[] = sortedByVolume.map((a, idx) => {
      const rank = idx + 1;
      const avgSentiment = a.sentimentCount > 0
        ? Math.round((a.sentimentSum / a.sentimentCount) * 100) / 100
        : 0;
      const reachScore = Math.min(100, a.mentionCount * 2);
      const sentimentImpact = Math.round(avgSentiment * -100) / 100; // negative sentiment -> positive impact
      const consistency = days > 0 ? Math.round((a.daySet.size / days) * 100) / 100 : 0;
      const influenceScore = Math.round(
        reachScore * 0.4 + Math.abs(sentimentImpact) * 100 * 0.3 + consistency * 100 * 0.3,
      );

      return {
        source: a.source,
        mentionCount: a.mentionCount,
        reachScore,
        sentimentImpact,
        authorityTier: tierForRank(rank),
        consistency,
        influenceScore,
        avgSentiment,
        trend: trendOf(a.stamps),
        lastMention: a.lastMs > 0 ? new Date(a.lastMs).toISOString().slice(0, 10) : null,
      };
    });

    // Final sort: influenceScore desc. This is the canonical order
    // the UI table/chart will render.
    influencers.sort((a, b) => b.influenceScore - a.influenceScore);

    return NextResponse.json({
      range,
      company: { name: company.name, slug: company.slug },
      influencers,
      totalMentions,
      sourceCount: influencers.length,
    });
  } catch (err) {
    console.error("Influencers API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
