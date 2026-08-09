// ═══════════════════════════════════════════════════════════════
//  GET /api/console/influencer-mentions
//
//  Pro Dashboard — "Top 5 influenceurs qui ont mentionné l'entreprise".
//
//  Returns the 5 most recent InfluencerMention rows linked to
//  articles/alerts for the caller's company, enriched with the
//  influencer's profile (name, platform, followers).
//
//  Shape:
//    {
//      mentions: [{
//        id, influencerId, influencerName, platform, followers,
//        verified, title, url, sentiment, reach, publishedAt
//      }],
//      total, source
//    }
//
//  Auth: requires session (brand-monitor | market-competitor |
//  investment-bank | admin).
//
//  NOTE — InfluencerMention currently doesn't carry companyId
//  directly. We resolve via the Alert the mention is linked to
//  (alertId → Alert → companyId). If a mention has no alertId it
//  is excluded from the Pro feed (it will surface in the full
//  Influencer Database view instead).
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { isDemoEmail } from "@/lib/demo-session";
import { prisma } from "@/lib/db";
import {
  requireUserCompany,
} from "@/lib/harchiq/company-session";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

interface InfluencerMentionRow {
  id: string;
  influencerId: string;
  influencerName: string;
  platform: string;
  followers: number;
  verified: boolean;
  title: string;
  url: string | null;
  sentiment: string;
  reach: number;
  publishedAt: string;
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
    const result = await requireUserCompany();
    if (!result.ok) return result.response;
    const companyId = result.data.company.id;

    // Find Alert ids for this company, then mentions linked to them.
    const alerts = await prisma.alert.findMany({
      where: { companyId },
      select: { id: true },
      take: 500,
    });
    const alertIds = alerts.map((a) => a.id);

    if (alertIds.length === 0) {
      return NextResponse.json({ mentions: [], total: 0, source: "neon" });
    }

    const mentions = await prisma.influencerMention.findMany({
      where: { alertId: { in: alertIds } },
      orderBy: { publishedAt: "desc" },
      take: 5,
      include: {
        influencer: {
          select: {
            id: true,
            name: true,
            platform: true,
            followers: true,
            verified: true,
          },
        },
      },
    });

    const rows: InfluencerMentionRow[] = mentions.map((m) => ({
      id: m.id,
      influencerId: m.influencer.id,
      influencerName: m.influencer.name,
      platform: m.influencer.platform,
      followers: m.influencer.followers,
      verified: m.influencer.verified,
      title: m.title,
      url: m.url,
      sentiment: m.sentiment,
      reach: m.reach,
      publishedAt: m.publishedAt.toISOString(),
    }));

    return NextResponse.json({ mentions: rows, total: rows.length, source: "neon" });
  } catch (err) {
    logError("console.influencer-mentions", `[influencer-mentions] error: ${err}`);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

function buildDemo() {
  const now = Date.now();
  const at = (daysAgo: number) => new Date(now - daysAgo * 86400_000).toISOString();

  const mentions: InfluencerMentionRow[] = [
    {
      id: "demo-im-1",
      influencerId: "demo-inf-1",
      influencerName: "Yassine El Mansouri",
      platform: "twitter",
      followers: 184500,
      verified: true,
      title: "Thread sur la digitalisation bancaire au Maroc",
      url: "https://twitter.com/yassine/status/demo-1",
      sentiment: "positive",
      reach: 42100,
      publishedAt: at(1),
    },
    {
      id: "demo-im-2",
      influencerId: "demo-inf-2",
      influencerName: "Salma Chadli",
      platform: "linkedin",
      followers: 96200,
      verified: false,
      title: "Analyse des résultats trimestriels",
      url: "https://linkedin.com/posts/salma-demo-2",
      sentiment: "positive",
      reach: 18700,
      publishedAt: at(3),
    },
    {
      id: "demo-im-3",
      influencerId: "demo-inf-3",
      influencerName: "Karim Tahiri",
      platform: "youtube",
      followers: 312000,
      verified: true,
      title: "Comparatif des banques marocaines en 2026",
      url: "https://youtube.com/watch?v=demo-3",
      sentiment: "neutral",
      reach: 88500,
      publishedAt: at(5),
    },
    {
      id: "demo-im-4",
      influencerId: "demo-inf-4",
      influencerName: "Le360 Économie",
      platform: "press",
      followers: 1240000,
      verified: true,
      title: "Croissance panafricaine : la stratégie qui paie",
      url: "https://le360.ma/article/demo-4",
      sentiment: "positive",
      reach: 215000,
      publishedAt: at(8),
    },
    {
      id: "demo-im-5",
      influencerId: "demo-inf-5",
      influencerName: "Hicham Bouzid",
      platform: "tiktok",
      followers: 267800,
      verified: false,
      title: "Frais bancaires : ce qu'il faut savoir",
      url: "https://tiktok.com/@hicham/video/demo-5",
      sentiment: "negative",
      reach: 64200,
      publishedAt: at(11),
    },
  ];

  return { mentions, total: mentions.length, source: "demo" };
}
