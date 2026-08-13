// ═══════════════════════════════════════════════════════════════
//  POST /api/console/sentiment-heatmap
//
//  Carte de Chaleur Sentiment — Skill 27.
//  Grille façon GitHub (13 semaines × 7 jours = 91 cellules, ou
//  26 semaines × 7 jours = 182 cellules) montrant le sentiment
//  quotidien de la presse couvrant l'entreprise.
//
//  Body JSON (optionnel) :
//    { weeks?: 13 | 26, date?: "YYYY-MM-DD" }
//
//  Comportement :
//    • Sans `date`           → renvoie { buckets, meta }
//      buckets : N entrées (N = weeks * 7) ordonnées chronologique-
//                ment (la plus ancienne en premier, aujourd'hui en
//                dernier). Chaque entrée = un jour.
//    • Avec `date` valide    → renvoie { dayDetail }
//      dayDetail : top 3 articles publiés ce jour-là (triés par
//                  relevanceScore desc puis publishedAt desc) plus
//                  le nombre total d'articles du jour.
//
//  Dérivation :
//    • date           → Article.publishedAt tronqué au jour (UTC).
//    • articleCount   → COUNT(*) GROUP BY day.
//    • sentimentScore → moyenne des Article.sentimentScore sur le
//                       jour (null si aucun score). Arrondi à 10⁻³.
//    • dominantSentiment → majorité des Article.sentimentLabel sur
//                       le jour (positif/neutre/négatif). Fallback
//                       par seuil sur sentimentScore si labels
//                       absents (≥+0.20 positif, ≥-0.10 neutre,
//                       sinon négatif).
//
//  Auth : session + entreprise (requireUserCompany). demoFilter
//  isolé dans la clause where Article. Pas de bypass admin.
//
//  Skill ID : SKILL-27-SENT-HEATMAP
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { logInfo, logError } from "@/lib/logger";
import { isAccountTypeAllowed } from "@/lib/auth/rbac";
import { requireUserCompany } from "@/lib/harchiq/company-session";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// ─── Constantes ───────────────────────────────────────────────
const WEEKS_DEFAULT = 13;
const WEEKS_LONG = 26;
const ARTICLE_TAKE = 8000;       // borne anti-déni de service
const DAY_DETAIL_TAKE = 3;       // top 3 articles par jour cliqué

// ─── Types renvoyés au client ─────────────────────────────────

/** Sentiment dominant d'un jour — dérivé des labels agrégés. */
export type DominantSentiment = "positif" | "neutre" | "négatif";

/** Un bucket quotidien (une cellule de la grille). */
export interface SentimentBucket {
  /** Date ISO courte — YYYY-MM-DD (UTC, jour de publishedAt). */
  date: string;
  /** Nombre d'articles publiés ce jour. */
  articleCount: number;
  /** Sentiment moyen -1..+1 (null si aucun article n'a de score). */
  sentimentScore: number | null;
  /** Sentiment dominant du jour (null si aucun article ce jour). */
  dominantSentiment: DominantSentiment | null;
}

export interface SentimentHeatmapMeta {
  companyName: string;
  sector: string;
  generatedAt: string;        // ISO 8601
  weeks: number;              // 13 ou 26
  startDate: string;          // YYYY-MM-DD (premier bucket)
  endDate: string;            // YYYY-MM-DD (dernier bucket = aujourd'hui)
  totalArticles: number;      // somme des articleCount
  activeDays: number;         // jours avec au moins 1 article
  source: "real" | "demo";
}

export interface SentimentHeatmapResponse {
  buckets: SentimentBucket[];
  meta: SentimentHeatmapMeta;
}

/** Article sommaire renvoyé par le day-detail. */
export interface DayDetailArticle {
  id: string;
  title: string;
  url: string;
  source: string;
  /** ISO 8601 (null si publishedAt absent). */
  publishedAt: string | null;
  sentimentLabel: string | null;
  sentimentScore: number | null;
}

export interface DayDetail {
  date: string;               // YYYY-MM-DD
  articleCount: number;       // total articles ce jour
  sentimentScore: number | null;  // -1..+1 (moyenne du jour)
  dominantSentiment: DominantSentiment | null;
  articles: DayDetailArticle[];   // top 3 (ou moins)
}

export interface SentimentDayDetailResponse {
  dayDetail: DayDetail;
}

// ─── Helpers date ─────────────────────────────────────────────

/** YYYY-MM-DD en temps local (la date sert de clé d'agrégation ;
 *  on utilise getUTC* pour rester cohérent avec le stockage Prisma
 *  DateTime qui est en UTC). */
function ymd(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** Parse "YYYY-MM-DD" en Date UTC minuit. Retourne null si invalide. */
function parseYmd(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const dt = new Date(Date.UTC(y, mo - 1, d, 0, 0, 0, 0));
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

// ─── Helpers sentiment ────────────────────────────────────────

/** Normalise un sentimentLabel DB (FR ou EN) → DominantSentiment. */
function labelToDominant(label: string | null): DominantSentiment | null {
  if (!label) return null;
  const l = label.toLowerCase().trim();
  if (l === "positif" || l === "positive" || l === "pos") return "positif";
  if (l === "neutre" || l === "neutral" || l === "neu") return "neutre";
  if (l === "négatif" || l === "negatif" || l === "negative" || l === "neg") return "négatif";
  return null;
}

/** Fallback par seuil quand on n'a que le score. */
function scoreToDominant(score: number | null): DominantSentiment | null {
  if (score == null) return null;
  if (score >= 0.2) return "positif";
  if (score >= -0.1) return "neutre";
  return "négatif";
}

interface DayAgg {
  count: number;
  sentimentSum: number;
  sentimentCount: number;
  labelCounts: Map<DominantSentiment, number>;
}

function newDayAgg(): DayAgg {
  return {
    count: 0,
    sentimentSum: 0,
    sentimentCount: 0,
    labelCounts: new Map(),
  };
}

/** Calcule le sentiment dominant d'un bucket à partir des labels
 *  agrégés (majorité simple). Si égalité ou labels absents,
 *  fallback par seuil sur le score moyen. */
function resolveDominant(agg: DayAgg, score: number | null): DominantSentiment | null {
  if (agg.labelCounts.size > 0) {
    let best: DominantSentiment | null = null;
    let bestN = 0;
    for (const [dom, n] of agg.labelCounts) {
      if (n > bestN) {
        best = dom;
        bestN = n;
      }
    }
    if (best != null && bestN > 0) return best;
  }
  return scoreToDominant(score);
}

// ═══════════════════════════════════════════════════════════════
//  POST — Skill 27 Sentiment Heatmap Generator
// ═══════════════════════════════════════════════════════════════

interface RequestBody {
  weeks?: number;
  date?: string;
}

async function readBody(req: Request): Promise<RequestBody> {
  try {
    const text = await req.text();
    if (!text) return {};
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object") return parsed as RequestBody;
    return {};
  } catch {
    return {};
  }
}

export async function POST(req: Request) {
  // ─── 1. Auth + RBAC ───────────────────────────────────────
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

  // ─── 2. Résolution entreprise ────────────────────────────
  //  POST n'a pas de fast-path fallback : le popup affiche
  //  l'erreur et l'utilisateur peut réessayer.
  const result = await requireUserCompany();
  if (!result.ok) return result.response;
  const { company, demoFilter, isDemo } = result.data;

  // ─── 3. Body optionnel { weeks, date } ──────────────────
  const body = await readBody(req);
  const weeks = body.weeks === WEEKS_LONG ? WEEKS_LONG : WEEKS_DEFAULT;

  // ═══════════════════════════════════════════════════════════
  //  3a. Branche day-detail — `{ date: "YYYY-MM-DD" }`
  //      Renvoie top 3 articles + total count + stats du jour.
  // ═══════════════════════════════════════════════════════════
  if (typeof body.date === "string") {
    const start = parseYmd(body.date);
    if (!start) {
      return NextResponse.json(
        { error: "Invalid date format (expected YYYY-MM-DD)" },
        { status: 400 },
      );
    }
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    end.setUTCMilliseconds(-1); // 23:59:59.999

    try {
      // Requête unique : tous les articles du jour, triés par
      // relevanceScore desc puis publishedAt desc. On prend une
      // marge (jusqu'à 1000) pour pouvoir agréger le sentiment
      // sur la journée entière, puis on garde les 3 premiers pour
      // la section "top articles" du bandeau de détail.
      const allOfDay = await prisma.article.findMany({
        where: {
          companyId: company.id,
          publishedAt: { gte: start, lte: end },
          ...demoFilter,
        },
        select: {
          id: true,
          title: true,
          url: true,
          source: true,
          publishedAt: true,
          sentimentLabel: true,
          sentimentScore: true,
        },
        orderBy: [
          { relevanceScore: "desc" },
          { publishedAt: "desc" },
        ],
        take: 1000,
      });

      const total = allOfDay.length;
      const topArticles = allOfDay.slice(0, DAY_DETAIL_TAKE);

      // Agrégation sentiment sur la journée entière.
      const agg = newDayAgg();
      for (const a of allOfDay) {
        agg.count += 1;
        if (typeof a.sentimentScore === "number" && !Number.isNaN(a.sentimentScore)) {
          agg.sentimentSum += a.sentimentScore;
          agg.sentimentCount += 1;
        }
        const dom = labelToDominant(a.sentimentLabel);
        if (dom) agg.labelCounts.set(dom, (agg.labelCounts.get(dom) ?? 0) + 1);
      }
      const dayScore = agg.sentimentCount > 0
        ? round3(agg.sentimentSum / agg.sentimentCount)
        : null;
      const dayDominant = resolveDominant(agg, dayScore);

      const dayDetail: DayDetail = {
        date: body.date,
        articleCount: total,
        sentimentScore: dayScore,
        dominantSentiment: dayDominant,
        articles: topArticles.map((a) => ({
          id: a.id,
          title: a.title,
          url: a.url,
          source: a.source,
          publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
          sentimentLabel: a.sentimentLabel,
          sentimentScore: a.sentimentScore,
        })),
      };

      logInfo(
        "console.sentiment-heatmap.day-detail",
        `company=${company.slug} date=${body.date} total=${total} returned=${topArticles.length} demo=${isDemo}`,
      );

      const payload: SentimentDayDetailResponse = { dayDetail };
      return NextResponse.json(payload);
    } catch (err) {
      logError("console.sentiment-heatmap.day-detail", `Error: ${err}`);
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Unknown error" },
        { status: 500 },
      );
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  3b. Branche heatmap — pas de `date`.
  //      Renvoie { buckets, meta }.
  // ═══════════════════════════════════════════════════════════
  try {
    const totalDays = weeks * 7;

    // today = fin de journée UTC courante (inclus).
    const today = new Date();
    today.setUTCHours(23, 59, 59, 999);

    // since = aujourd'hui - (totalDays - 1) jours, début de journée.
    const since = new Date(today);
    since.setUTCDate(since.getUTCDate() - (totalDays - 1));
    since.setUTCHours(0, 0, 0, 0);

    // Articles sur la fenêtre. On ne sélectionne que les champs
    // nécessaires à l'agrégation (publishedAt + scores + labels)
    // pour limiter la bande passante.
    const articles = await prisma.article.findMany({
      where: {
        companyId: company.id,
        publishedAt: { gte: since, lte: today },
        ...demoFilter,
      },
      select: {
        publishedAt: true,
        sentimentScore: true,
        sentimentLabel: true,
      },
      orderBy: { publishedAt: "desc" },
      take: ARTICLE_TAKE,
    });

    // Agrégation par jour (Map YYYY-MM-DD → DayAgg).
    const dayMap = new Map<string, DayAgg>();
    for (const a of articles) {
      if (!a.publishedAt) continue;
      const key = ymd(a.publishedAt);
      let agg = dayMap.get(key);
      if (!agg) {
        agg = newDayAgg();
        dayMap.set(key, agg);
      }
      agg.count += 1;
      if (typeof a.sentimentScore === "number" && !Number.isNaN(a.sentimentScore)) {
        agg.sentimentSum += a.sentimentScore;
        agg.sentimentCount += 1;
      }
      const dom = labelToDominant(a.sentimentLabel);
      if (dom) agg.labelCounts.set(dom, (agg.labelCounts.get(dom) ?? 0) + 1);
    }

    // Construction des buckets (remplissage des jours sans
    // article avec articleCount=0, sentimentScore=null,
    // dominantSentiment=null).
    const buckets: SentimentBucket[] = [];
    const cursor = new Date(since);
    let totalArticles = 0;
    let activeDays = 0;
    for (let i = 0; i < totalDays; i++) {
      const key = ymd(cursor);
      const agg = dayMap.get(key);
      if (agg) {
        const score = agg.sentimentCount > 0
          ? round3(agg.sentimentSum / agg.sentimentCount)
          : null;
        const dominant = resolveDominant(agg, score);
        buckets.push({
          date: key,
          articleCount: agg.count,
          sentimentScore: score,
          dominantSentiment: dominant,
        });
        totalArticles += agg.count;
        if (agg.count > 0) activeDays += 1;
      } else {
        buckets.push({
          date: key,
          articleCount: 0,
          sentimentScore: null,
          dominantSentiment: null,
        });
      }
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    const meta: SentimentHeatmapMeta = {
      companyName: company.name,
      sector: company.sector,
      generatedAt: new Date().toISOString(),
      weeks,
      startDate: ymd(since),
      endDate: ymd(today),
      totalArticles,
      activeDays,
      source: isDemo ? "demo" : "real",
    };

    logInfo(
      "console.sentiment-heatmap",
      `company=${company.slug} weeks=${weeks} buckets=${buckets.length} articles=${articles.length} activeDays=${activeDays} demo=${isDemo}`,
    );

    const payload: SentimentHeatmapResponse = { buckets, meta };
    return NextResponse.json(payload);
  } catch (err) {
    logError("console.sentiment-heatmap", `Error: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
