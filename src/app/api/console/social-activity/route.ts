import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { logError } from "@/lib/logger";
import { isAccountTypeAllowed } from "@/lib/auth/rbac";
import {
  requireUserCompany,
  demoFilterFromSession,
} from "@/lib/harchiq/company-session";

// ═══════════════════════════════════════════════════════════════
//  GET /api/console/social-activity
//
//  Activité Réseau Social — Section 16 du tableau de bord Essentiel.
//  Compte les mentions par jour et par plateforme sociale sur les
//  30 derniers jours, en filtrant les articles dont le sourceType
//  correspond à une plateforme sociale suivie.
//
//  Plateformes: twitter | facebook | instagram | linkedin | tiktok
//
//  Sortie: {
//    days:    [{ date, platform, mentionCount, avgSentiment }]   // plat
//    rollups: [{ date, Facebook, Instagram, Twitter, LinkedIn, TikTok }]  // par jour
//    totals:  { mentionCount }
//  }
//
//  Auth: essential | pro | enterprise | agency (admin bypass).
//  Démo: retourne days: [] — la carte affiche « Aucune donnée ».
//
//  Task ID: P3-ESSENTIAL-REAL-ROUTES
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

const DAYS = 30;

const PLATFORMS = ["twitter", "facebook", "instagram", "linkedin", "tiktok"] as const;
type Platform = (typeof PLATFORMS)[number];

const PLATFORM_LABEL: Record<Platform, string> = {
  twitter: "Twitter",
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
};

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAccountTypeAllowed(session, ["essential", "pro", "enterprise", "agency"])) {
    return NextResponse.json(
      { error: "Forbidden — insufficient account permissions" },
      { status: 403 },
    );
  }

  try {
    const demoFilter = demoFilterFromSession(session);
    const result = await requireUserCompany();
    if (!result.ok) return result.response;
    const company = await prisma.company.findUnique({
      where: { id: result.data.company.id },
      select: { id: true, name: true, slug: true },
    });

    if (!company) {
      return NextResponse.json({
        company: null,
        range: "30d",
        days: [],
        rollups: [],
        totals: { mentionCount: 0 },
        source: "empty",
      });
    }

    const since = new Date();
    since.setDate(since.getDate() - DAYS);
    since.setHours(0, 0, 0, 0);

    const articles = await prisma.article.findMany({
      where: {
        companyId: company.id,
        publishedAt: { gte: since },
        sourceType: { in: [...PLATFORMS] },
        ...demoFilter,
      },
      select: {
        sourceType: true,
        sentimentScore: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: "asc" },
      take: 10000,
    });

    // ─── Initialiser la grille jour × plateforme à zéro ─────────
    //  On garantit un axe X continu sur 30 jours, même si aucune
    //  mention n'a été enregistrée certains jours.
    const bucket = new Map<
      string,
      {
        date: string;
        byPlatform: Record<Platform, { count: number; sum: number; scored: number }>;
      }
    >();

    const today = new Date();
    for (let d = new Date(since); d <= today; d.setDate(d.getDate() + 1)) {
      const key = dateKey(d);
      bucket.set(key, {
        date: key,
        byPlatform: {
          twitter: { count: 0, sum: 0, scored: 0 },
          facebook: { count: 0, sum: 0, scored: 0 },
          instagram: { count: 0, sum: 0, scored: 0 },
          linkedin: { count: 0, sum: 0, scored: 0 },
          tiktok: { count: 0, sum: 0, scored: 0 },
        },
      });
    }

    for (const a of articles) {
      if (!a.publishedAt) continue;
      const key = dateKey(a.publishedAt);
      const b = bucket.get(key);
      if (!b) continue;
      const platform = (PLATFORMS as readonly string[]).includes(a.sourceType)
        ? (a.sourceType as Platform)
        : null;
      if (!platform) continue;
      const p = b.byPlatform[platform];
      p.count += 1;
      if (typeof a.sentimentScore === "number" && !Number.isNaN(a.sentimentScore)) {
        p.sum += a.sentimentScore;
        p.scored += 1;
      }
    }

    // ─── Format: days[] + rollup par plateforme par jour ────────
    //  days[] — une entrée par (jour, plateforme) avec mentionCount > 0
    //  rollups[] — une entrée par jour avec un champ par plateforme
    //  (utilisé directement par l'AreaChart empilé du dashboard)
    const days: Array<{
      date: string;
      platform: string;
      mentionCount: number;
      avgSentiment: number | null;
    }> = [];

    const rollups: Array<{
      date: string;
      Facebook: number;
      Instagram: number;
      Twitter: number;
      LinkedIn: number;
      TikTok: number;
    }> = [];

    let totalMentions = 0;
    for (const b of Array.from(bucket.values()).sort((a, b2) =>
      a.date.localeCompare(b2.date),
    )) {
      const rollup: {
        date: string;
        Facebook: number;
        Instagram: number;
        Twitter: number;
        LinkedIn: number;
        TikTok: number;
      } = {
        date: b.date,
        Facebook: 0,
        Instagram: 0,
        Twitter: 0,
        LinkedIn: 0,
        TikTok: 0,
      };
      for (const p of PLATFORMS) {
        const stat = b.byPlatform[p];
        rollup[PLATFORM_LABEL[p] as "Facebook" | "Instagram" | "Twitter" | "LinkedIn" | "TikTok"] = stat.count;
        totalMentions += stat.count;
        if (stat.count > 0) {
          days.push({
            date: b.date,
            platform: PLATFORM_LABEL[p],
            mentionCount: stat.count,
            avgSentiment:
              stat.scored > 0 ? Math.round((stat.sum / stat.scored) * 1000) / 1000 : null,
          });
        }
      }
      rollups.push(rollup);
    }

    return NextResponse.json({
      company: { name: company.name, slug: company.slug },
      range: "30d",
      days,
      rollups,
      totals: { mentionCount: totalMentions },
      source: "neon",
    });
  } catch (err) {
    logError("console.social-activity", `Social activity API error: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
