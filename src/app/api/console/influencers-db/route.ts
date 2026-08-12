import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { logError } from "@/lib/logger";
import { isAccountTypeAllowed } from "@/lib/auth/rbac";

// ═══════════════════════════════════════════════════════════════
//  GET /api/console/influencers-db
//
//  Klear / Meltwater-style influencer directory.
//
//  Query params:
//    platform  — twitter | linkedin | instagram | youtube | tiktok | press
//    minScore  — int 0-100 (filters on influenceScore)
//    location  — case-insensitive partial match (e.g. "Casablanca")
//    topic     — case-insensitive partial match against the topics JSON array
//    q         — free-text search across name / handle / bio
//    limit     — int 1-200 (default 50)
//    offset    — int (default 0)
//
//  Auth: requires session. Brand-monitor, market-competitor,
//  investment-bank accounts and admins are allowed. Harch-alpha
//  (trader) accounts are NOT (different domain).
//
//  Returns:
//    {
//      influencers: [{
//        id, name, handle, platform, bio, followers, verified,
//        location, languages: string[], topics: string[],
//        reachScore, engagementScore, authorityScore, influenceScore,
//        lastAnalyzed, mentionCount
//      }],
//      total, platform, minScore, location, q, limit, offset,
//      platformBreakdown: { press, twitter, linkedin, youtube, tiktok, instagram }
//    }
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

const ALLOWED_PLATFORMS = ["twitter", "linkedin", "instagram", "youtube", "tiktok", "press"] as const;
type Platform = (typeof ALLOWED_PLATFORMS)[number];

interface InfluencerListRow {
  id: string;
  name: string;
  handle: string | null;
  platform: string;
  bio: string | null;
  followers: number;
  following: number;
  verified: boolean;
  location: string | null;
  languages: string[];
  topics: string[];
  reachScore: number;
  engagementScore: number;
  authorityScore: number;
  influenceScore: number;
  lastAnalyzed: string | null;
  mentionCount: number;
}

// Prisma's where clause for JSON-stringified arrays doesn't support
// array operators directly. We do a case-insensitive LIKE on the raw
// topics JSON string. This is honest and predictable for ≤200 rows.
function topicWhere(topic: string): string {
  // Match "Topic" as a quoted element in the JSON array.
  // e.g. topics = ["Politics", "Banking"] → contains "Politics"
  return `%"${topic.replace(/"/g, '\\"')}"%`;
}

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

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAccountTypeAllowed(session, ["essential", "pro", "enterprise", "agency"])) {
    return NextResponse.json(
      { error: "Forbidden — insufficient account permissions" },
      { status: 403 },
    );
  }

  try {
    const { searchParams } = new URL(req.url);

    const platformParam = searchParams.get("platform");
    const platform =
      platformParam && (ALLOWED_PLATFORMS as readonly string[]).includes(platformParam)
        ? (platformParam as Platform)
        : undefined;

    const minScoreParam = searchParams.get("minScore");
    const minScore =
      minScoreParam !== null && /^\d+$/.test(minScoreParam)
        ? Math.max(0, Math.min(100, parseInt(minScoreParam, 10)))
        : 0;

    const location = searchParams.get("location")?.trim() || undefined;
    const topic = searchParams.get("topic")?.trim() || undefined;
    const q = searchParams.get("q")?.trim() || undefined;

    const limitParam = searchParams.get("limit");
    const limit =
      limitParam !== null && /^\d+$/.test(limitParam)
        ? Math.max(1, Math.min(200, parseInt(limitParam, 10)))
        : 50;

    const offsetParam = searchParams.get("offset");
    const offset =
      offsetParam !== null && /^\d+$/.test(offsetParam)
        ? Math.max(0, parseInt(offsetParam, 10))
        : 0;

    // Build the Prisma where clause.
    const where: Record<string, unknown> = {
      influenceScore: { gte: minScore },
    };
    if (platform) where.platform = platform;
    if (location) where.location = { contains: location, mode: "insensitive" };

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { handle: { contains: q, mode: "insensitive" } },
        { bio: { contains: q, mode: "insensitive" } },
      ];
    }
    if (topic) {
      // Prisma JSON-string field search — match against the raw string
      where.topics = { contains: topicWhere(topic), mode: "insensitive" } as never;
    }

    const [rows, total, platformBreakdownRows] = await Promise.all([
      prisma.influencer.findMany({
        where,
        orderBy: { influenceScore: "desc" },
        take: limit,
        skip: offset,
        include: {
          _count: { select: { mentions: true } },
        },
      }),
      prisma.influencer.count({ where }),
      prisma.influencer.groupBy({
        by: ["platform"],
        _count: { _all: true },
      }),
    ]);

    const platformBreakdown: Record<string, number> = {};
    for (const p of ALLOWED_PLATFORMS) platformBreakdown[p] = 0;
    for (const row of platformBreakdownRows) {
      platformBreakdown[row.platform] = row._count._all;
    }

    const influencers: InfluencerListRow[] = rows.map((r) => ({
      id: r.id,
      name: r.name,
      handle: r.handle,
      platform: r.platform,
      bio: r.bio,
      followers: r.followers,
      following: r.following,
      verified: r.verified,
      location: r.location,
      languages: safeParseArray(r.languages),
      topics: safeParseArray(r.topics),
      reachScore: r.reachScore,
      engagementScore: r.engagementScore,
      authorityScore: r.authorityScore,
      influenceScore: r.influenceScore,
      lastAnalyzed: r.lastAnalyzed ? r.lastAnalyzed.toISOString() : null,
      mentionCount: r._count?.mentions ?? 0,
    }));

    return NextResponse.json({
      influencers,
      total,
      platform: platform ?? null,
      minScore,
      location: location ?? null,
      topic: topic ?? null,
      q: q ?? null,
      limit,
      offset,
      platformBreakdown,
    });
  } catch (err) {
    logError("console.influencers-db", `Influencer DB API error: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
