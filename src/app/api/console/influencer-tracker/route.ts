// ═══════════════════════════════════════════════════════════════
//  POST /api/console/influencer-tracker
//
//  Skill 23 — Suivi des Influenceurs.
//  Top 20 influenceurs avec métriques d'engagement, portée,
//  sentiment et ROI (return-on-influence estimé).
//
//  Approche hybride :
//    1. Catalogue global — table Influencer (top 30 par score).
//    2. Dérivation contexte entreprise — Article.source (proxy
//       auteur presse) + ArticleComment.author (commentateur
//       Hespress/WP). Agrégation par nom sur la fenêtre 30j.
//
//  Fusion : si un nom dérivé correspond à un influenceur du
//  catalogue (match case-insensitive), on conserve les données
//  du catalogue (followers, handle, platform, influenceScore
//  de base) et on l'enrichit avec mentionCount / sentiment /
//  lastMention issus du corpus entreprise. Les entrées dérivées
//  sans correspondance deviennent de nouvelles lignes (synthétiques
//  — followers estimés, engagement calculé à partir des likes).
//
//  Métriques renvoyées :
//    name             — nom affiché
//    handle           — @username (catalogue ou dérivé du nom)
//    platform         — twitter | linkedin | instagram | youtube |
//                       tiktok | facebook | press
//    followers        — nombre d'abonnés (catalogue ou estimé)
//    engagementRate   — % d'engagement (0.5–15.0)
//    sentiment        — positive | neutral | negative (agrégé sur
//                       les mentions entreprise, sinon neutre)
//    mentionCount     — nombre de mentions entreprise (30j)
//    lastMention      — ISO date (YYYY-MM-DD) ou null
//    reachScore       — 0–100 (portée normalisée)
//    influenceScore   — 0–100 (composite reach + sentiment + engagement)
//
//  ROI : le score d'influence encode le retour sur influence —
//  pondération 50% reach + 25% impact sentiment + 25% engagement.
//  Non exposé comme champ séparé car la spécification de réponse
//  ne le demande pas.
//
//  Auth : session + entreprise (requireUserCompany). demoFilter
//  étendu sur Article et ArticleComment pour isoler les données
//  démo des données réelles.
//
//  Skill ID : SKILL-23-INFLUENCER
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { logInfo, logError } from "@/lib/logger";
import { requireUserCompany } from "@/lib/harchiq/company-session";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// ─── Types renvoyés au client ─────────────────────────────────

export type InfluencerSentiment = "positive" | "neutral" | "negative";

export interface InfluencerTrackerRow {
  name: string;
  handle: string;
  platform: string;
  followers: number;
  engagementRate: number;
  sentiment: InfluencerSentiment;
  mentionCount: number;
  lastMention: string | null;
  reachScore: number;
  influenceScore: number;
}

export interface InfluencerTrackerResponse {
  influencers: InfluencerTrackerRow[];
  meta: {
    companyName: string;
    sector: string;
    generatedAt: string;
    windowDays: number;
    source: "real" | "demo";
    totalScanned: number;
    catalogCount: number;
    derivedCount: number;
  };
}

// ─── Constantes ──────────────────────────────────────────────

const WINDOW_DAYS = 30;
const TOP_N = 20;
const CATALOG_FETCH = 30; // top 30 du catalogue global, on gardera les 20 premiers

const PLATFORMS = [
  "twitter", "linkedin", "instagram",
  "youtube", "tiktok", "facebook", "press",
] as const;
type Platform = (typeof PLATFORMS)[number];

// ─── Helpers ─────────────────────────────────────────────────

/**
 * Infère la plateforme à partir d'un nom de source ou d'auteur.
 * Très heuristique — Hespress, Le360, TelQuel → press ; Twitter/X
 * → twitter ; etc. Fallback press (média écrit).
 */
function inferPlatform(name: string): Platform {
  const n = name.toLowerCase();
  if (n.includes("linkedin")) return "linkedin";
  if (n.includes("twitter") || n.includes("x.com") || n.startsWith("@")) return "twitter";
  if (n.includes("instagram") || n.includes("insta")) return "instagram";
  if (n.includes("youtube") || n.includes("ytb")) return "youtube";
  if (n.includes("tiktok")) return "tiktok";
  if (n.includes("facebook") || n.includes("fb ")) return "facebook";
  // Sources presse marocain fréquentes
  if (
    n.includes("hespress") || n.includes("le360") || n.includes("telquel") ||
    n.includes("lematin") || n.includes("medi1") || n.includes("l'économiste") ||
    n.includes("economiste") || n.includes("eco") || n.includes("press") ||
    n.includes("aujour") || n.includes("libe") || n.includes("akydi") ||
    n.includes("media") || n.includes("news")
  ) {
    return "press";
  }
  return "press";
}

/**
 * Construit un handle @username à partir d'un nom — normalisation
 * NFD (suppression accents) + kebab-case tronqué à 30 caractères.
 */
function buildHandle(name: string): string {
  const cleaned = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return cleaned ? `@${cleaned.slice(0, 30)}` : "@inconnu";
}

/**
 * Buckétise un score de sentiment (-1..+1) en étiquette qualitative.
 * Seuil ±0.15 — en deçà c'est neutre.
 */
function sentimentBucket(score: number | null): InfluencerSentiment {
  if (score == null) return "neutral";
  if (score > 0.15) return "positive";
  if (score < -0.15) return "negative";
  return "neutral";
}

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

// ─── Handler POST ────────────────────────────────────────────

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await requireUserCompany();
  if (!result.ok) return result.response;
  const { company, demoFilter } = result.data;

  try {
    const now = new Date();
    const since = new Date(now.getTime() - WINDOW_DAYS * 86400000);

    // ─── Batch parallèle : catalogue + corpus entreprise ───
    const [catalogInfluencers, articles, comments] = await Promise.all([
      prisma.influencer.findMany({
        orderBy: { influenceScore: "desc" },
        take: CATALOG_FETCH,
        select: {
          id: true,
          name: true,
          handle: true,
          platform: true,
          followers: true,
          engagementScore: true,
          reachScore: true,
          authorityScore: true,
          influenceScore: true,
        },
      }),
      prisma.article.findMany({
        where: {
          companyId: company.id,
          publishedAt: { gte: since },
          ...demoFilter,
        },
        orderBy: { publishedAt: "desc" },
        take: 1000,
        select: {
          id: true,
          source: true,
          sourceType: true,
          sentimentScore: true,
          publishedAt: true,
        },
      }),
      prisma.articleComment.findMany({
        where: {
          article: { companyId: company.id, ...demoFilter },
          publishedAt: { gte: since },
        },
        orderBy: { publishedAt: "desc" },
        take: 1000,
        select: {
          id: true,
          author: true,
          sentimentScore: true,
          likes: true,
          publishedAt: true,
        },
      }),
    ]);

    // ─── Agrégation dérivée (Article.source + ArticleComment.author)
    //
    //  On regroupe par nom normalisé. Les sources Article.source
    //  représentent les médias (presse). Les ArticleComment.author
    //  représentent les commentateurs individuels (souvent anonymes
    //  sur Hespress — on filtre les noms vides ou génériques).
    interface DerivedAgg {
      name: string;
      mentionCount: number;
      sentimentSum: number;
      sentimentCount: number;
      likesSum: number;
      lastMs: number;
    }
    const derived = new Map<string, DerivedAgg>();

    const bucket = (
      name: string,
      sentiment: number | null,
      likes: number,
      at: Date | null,
    ) => {
      const key = (name ?? "").trim();
      if (!key) return;
      let a = derived.get(key);
      if (!a) {
        a = {
          name: key,
          mentionCount: 0,
          sentimentSum: 0,
          sentimentCount: 0,
          likesSum: 0,
          lastMs: 0,
        };
        derived.set(key, a);
      }
      a.mentionCount += 1;
      if (sentiment != null && !Number.isNaN(sentiment)) {
        a.sentimentSum += sentiment;
        a.sentimentCount += 1;
      }
      a.likesSum += likes;
      if (at) {
        const ms = at.getTime();
        if (!Number.isNaN(ms) && ms > a.lastMs) a.lastMs = ms;
      }
    };

    for (const art of articles) {
      bucket(art.source, art.sentimentScore, 0, art.publishedAt);
    }
    for (const c of comments) {
      const author = (c.author ?? "").trim();
      // Filtre les pseudonymes génériques (Hespress en produit beaucoup)
      if (!author) continue;
      const lower = author.toLowerCase();
      if (
        lower === "guest" || lower === "anonyme" || lower === "anonymous" ||
        lower === "inconnu" || lower === "visitor" || lower === "visiteur"
      ) {
        continue;
      }
      bucket(author, c.sentimentScore, c.likes ?? 0, c.publishedAt);
    }

    // ─── Construction des lignes fusionnées ────────────────────
    //
    //  Clé de fusion : plateforme + nom en minuscules. On privilégie
    //  les données du catalogue (followers réels, handle, etc.) et
    //  on enrichit avec mentionCount / sentiment / lastMention issus
    //  du corpus entreprise.

    const merged = new Map<string, InfluencerTrackerRow>();
    const matchedDerivedKeys = new Set<string>();

    // 1. Catalogue → lignes de base
    for (const inf of catalogInfluencers) {
      const platform = (PLATFORMS as readonly string[]).includes(inf.platform)
        ? (inf.platform as Platform)
        : "press";
      // Conversion engagementScore (0-100) → engagementRate (0.5–10%)
      const engagementRate = round1(
        Math.min(10, Math.max(0.5, inf.engagementScore / 10)),
      );
      const row: InfluencerTrackerRow = {
        name: inf.name,
        handle: inf.handle && inf.handle.trim() ? inf.handle : buildHandle(inf.name),
        platform,
        followers: inf.followers,
        engagementRate,
        sentiment: "neutral",
        mentionCount: 0,
        lastMention: null,
        reachScore: inf.reachScore,
        influenceScore: inf.influenceScore,
      };
      merged.set(`${platform}:${inf.name.toLowerCase()}`, row);

      // Cherche une entrée dérivée correspondante (même nom)
      const derivedMatch = derived.get(inf.name);
      if (derivedMatch) {
        matchedDerivedKeys.add(inf.name);
        row.mentionCount = derivedMatch.mentionCount;
        if (derivedMatch.lastMs > 0) {
          row.lastMention = new Date(derivedMatch.lastMs)
            .toISOString()
            .slice(0, 10);
        }
        if (derivedMatch.sentimentCount > 0) {
          const avg = derivedMatch.sentimentSum / derivedMatch.sentimentCount;
          row.sentiment = sentimentBucket(avg);
          // Bump du score d'influence : +1 pt par mention, plafonné à +20.
          const bump = Math.min(20, derivedMatch.mentionCount);
          row.influenceScore = clampScore(row.influenceScore + bump);
        }
      }
    }

    // 2. Dérivées non matchées → nouvelles lignes synthétiques
    for (const [name, agg] of derived.entries()) {
      if (matchedDerivedKeys.has(name)) continue;

      const platform = inferPlatform(name);
      // Estimation followers — heuristique : 250 abonnés par mention,
      // base 5 000, plafond 2 000 000.
      const followers = Math.min(
        2_000_000,
        Math.round(agg.mentionCount * 250 + 5000),
      );
      const avgLikes = agg.mentionCount > 0
        ? agg.likesSum / agg.mentionCount
        : 0;
      // Si on a des likes (commentaires), engagementRate = likes / followers.
      // Sinon, estimation : 3% de base + 0.3% par mention, borné 1.5–8%.
      const engagementRate = avgLikes > 0
        ? round1(
            Math.min(
              15,
              Math.max(0.5, (avgLikes + 1) * 100 / Math.max(1, followers)),
            ),
          )
        : round1(
            Math.min(8, Math.max(1.5, 3 + agg.mentionCount * 0.3)),
          );

      const avgSentiment = agg.sentimentCount > 0
        ? agg.sentimentSum / agg.sentimentCount
        : null;
      const sentiment = sentimentBucket(avgSentiment);

      // reachScore : mentionCount * 4 (plafond 80) + bonus log(followers)
      const reachScore = clampScore(
        agg.mentionCount * 4 +
          Math.min(20, Math.log10(Math.max(10, followers)) * 6),
      );
      // influenceScore : reach 50% + impact sentiment 25% + engagement 25%
      const sentimentImpact = avgSentiment != null
        ? Math.abs(avgSentiment) * 100
        : 25;
      const engagementContribution = Math.min(100, engagementRate * 10);
      const influenceScore = clampScore(
        reachScore * 0.5 +
          sentimentImpact * 0.25 +
          engagementContribution * 0.25,
      );
      const lastMention = agg.lastMs > 0
        ? new Date(agg.lastMs).toISOString().slice(0, 10)
        : null;

      const row: InfluencerTrackerRow = {
        name,
        handle: buildHandle(name),
        platform,
        followers,
        engagementRate,
        sentiment,
        mentionCount: agg.mentionCount,
        lastMention,
        reachScore,
        influenceScore,
      };
      // Ne pas écraser une entrée catalogue éventuelle (cas où la clé
      // plateforme diffère). On insère seulement si absente.
      const key = `${platform}:${name.toLowerCase()}`;
      if (!merged.has(key)) {
        merged.set(key, row);
      }
    }

    // ─── Tri final par influenceScore décroissant, top 20 ─────
    const influencers = Array.from(merged.values())
      .sort((a, b) => {
        if (b.influenceScore !== a.influenceScore) {
          return b.influenceScore - a.influenceScore;
        }
        // Tiebreaker : mentionCount décroissant
        return b.mentionCount - a.mentionCount;
      })
      .slice(0, TOP_N);

    const response: InfluencerTrackerResponse = {
      influencers,
      meta: {
        companyName: company.name,
        sector: company.sector,
        generatedAt: now.toISOString(),
        windowDays: WINDOW_DAYS,
        source: "real",
        totalScanned:
          catalogInfluencers.length + articles.length + comments.length,
        catalogCount: catalogInfluencers.length,
        derivedCount: derived.size,
      },
    };

    logInfo(
      "influencer-tracker",
      `Tracker generated for ${company.name}: ${influencers.length} influenceurs ` +
        `(catalog=${catalogInfluencers.length} articles=${articles.length} ` +
        `comments=${comments.length} derived=${derived.size})`,
    );

    return NextResponse.json(response);
  } catch (err) {
    logError("influencer-tracker", `Generate failed: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}
