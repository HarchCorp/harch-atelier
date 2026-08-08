import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { logError } from "@/lib/logger";

// ═══════════════════════════════════════════════════════════════
//  GET /api/console/influencers-db/[id]
//
//  Influencer detail + 30-day mention history.
//
//  Auth: same rules as the list endpoint (brand-monitor /
//  market-competitor / investment-bank / admin).
//
//  Returns:
//    {
//      influencer: { …all list fields, plus full bio },
//      mentions: [{ id, title, url, sentiment, reach, publishedAt }],
//      mentionTrend: [{ date, count, positive, negative, neutral }],
//      scoreBreakdown: { reach, engagement, authority, consistency, relevance }
//    }
//
//  `scoreBreakdown.consistency` = unique days with mentions / 30.
//  `scoreBreakdown.relevance`   = (mentions count / 30) clamped to 100.
//  Both are derived from the mention history (no mock data).
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

function safeParseArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
      return parsed;
    }
  } catch {
    /* fall through */
  }
  return [];
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const allowedTypes = ["brand-monitor", "market-competitor", "investment-bank"];
  const accountType = session.user?.accountType ?? "";
  if (!allowedTypes.includes(accountType) && session.user?.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden — Influencer Database is for brand-monitor, market-competitor and investment-bank accounts only" },
      { status: 403 },
    );
  }

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const influencer = await prisma.influencer.findUnique({
      where: { id },
      include: {
        mentions: {
          orderBy: { publishedAt: "desc" },
          take: 100,
        },
      },
    });

    if (!influencer) {
      return NextResponse.json({ error: "Influencer not found" }, { status: 404 });
    }

    // ─── Mention trend (last 30 days, daily buckets) ──────────────
    const since = new Date();
    since.setDate(since.getDate() - 29);
    since.setHours(0, 0, 0, 0);

    // Build a 30-day bucket map keyed by YYYY-MM-DD.
    const bucketMap = new Map<
      string,
      { count: number; positive: number; negative: number; neutral: number }
    >();
    for (let i = 0; i < 30; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      bucketMap.set(dateKey(d), { count: 0, positive: 0, negative: 0, neutral: 0 });
    }
    for (const m of influencer.mentions) {
      const key = dateKey(m.publishedAt);
      const b = bucketMap.get(key);
      if (!b) continue;
      b.count += 1;
      if (m.sentiment === "positive") b.positive += 1;
      else if (m.sentiment === "negative") b.negative += 1;
      else b.neutral += 1;
    }
    const mentionTrend = Array.from(bucketMap.entries()).map(([date, b]) => ({
      date,
      count: b.count,
      positive: b.positive,
      negative: b.negative,
      neutral: b.neutral,
    }));

    // ─── Derived sub-scores ──────────────────────────────────────
    // consistency = unique days with mentions / 30
    // relevance   = mentions count clamped to 100
    const uniqueDays = new Set(
      influencer.mentions
        .filter((m) => m.publishedAt >= since)
        .map((m) => dateKey(m.publishedAt)),
    ).size;
    const consistency = Math.round((uniqueDays / 30) * 100);
    const relevance = Math.min(100, influencer.mentions.length * 10);

    return NextResponse.json({
      influencer: {
        id: influencer.id,
        name: influencer.name,
        handle: influencer.handle,
        platform: influencer.platform,
        bio: influencer.bio,
        followers: influencer.followers,
        following: influencer.following,
        verified: influencer.verified,
        location: influencer.location,
        languages: safeParseArray(influencer.languages),
        topics: safeParseArray(influencer.topics),
        reachScore: influencer.reachScore,
        engagementScore: influencer.engagementScore,
        authorityScore: influencer.authorityScore,
        influenceScore: influencer.influenceScore,
        lastAnalyzed: influencer.lastAnalyzed ? influencer.lastAnalyzed.toISOString() : null,
      },
      mentions: influencer.mentions.map((m) => ({
        id: m.id,
        title: m.title,
        url: m.url,
        sentiment: m.sentiment,
        reach: m.reach,
        publishedAt: m.publishedAt.toISOString(),
      })),
      mentionTrend,
      scoreBreakdown: {
        reach: influencer.reachScore,
        engagement: influencer.engagementScore,
        authority: influencer.authorityScore,
        consistency,
        relevance,
      },
    });
  } catch (err) {
    logError("console.influencers-db.id", `Influencer detail API error: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
