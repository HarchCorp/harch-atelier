// ═══════════════════════════════════════════════════════════════
//  POST /api/console/narrative-tracker
//
//  Narrative Arc Tracker — Track how narratives/stories about the
//  brand evolve over time (emerging → growing → peak → declining).
//
//  Analyse les articles publiés sur les 30 derniers jours, extrait
//  les 5 récits dominants (clusters de mots-clés thématiques),
//  calcule leur force (0-100), leur sentiment, leur volume, leur
//  position dans le cycle de vie, et leur vélocité.
//
//  Cycle de vie (trend) :
//    • emerging   — récit récent, faible volume, apparition ≤ 10j.
//    • growing    — volume croissant sur 3 paliers de 10 jours.
//    • peak       — volume maximal, palier médian dominant.
//    • declining  — volume décroissant sur les derniers jours.
//
//  Vélocité = (articles 7 derniers jours) − (articles 7j précédents).
//  Signe positif = prise de momentum, négatif = essoufflement.
//
//  Signaux utilisés :
//    • Article (titre + contenu + summary) — recherche par clusters.
//    • Article.sentimentScore (-1..1) — polarité moyenne.
//    • Article.publishedAt — bucketing temporel (6 × 5 jours).
//
//  Auth : session + entreprise (requireUserCompany). Le filtre
//  demoFilter ({ isDemo: boolean }) est étendu dans la clause where
//  Article pour isoler les données démo des données réelles.
//
//  Skill ID : SKILL-24-NARRATIVE
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

export type NarrativeTrend = "emerging" | "growing" | "peak" | "declining";
export type NarrativeSentiment = "positive" | "neutral" | "negative";

export interface Narrative {
  label: string;                // libellé du récit (FR)
  strength: number;             // 0-100
  sentiment: NarrativeSentiment;
  articleCount: number;         // volume sur 30j
  firstSeen: string;            // ISO — première mention
  lastSeen: string;             // ISO — dernière mention
  trend: NarrativeTrend;        // position dans le cycle de vie
  velocity: number;             // delta articles/sem (last7 - prev7)
  timeline: number[];           // 6 buckets × 5 jours (pour sparkline)
}

export interface NarrativeTrackerResponse {
  narratives: Narrative[];      // top 5, trié par force décroissante
  meta: {
    companyName: string;
    sector: string;
    generatedAt: string;
    windowDays: number;
    totalArticles: number;      // volume global analysé
    source: "real" | "demo";
  };
}

// ─── Cartographies de récits ──────────────────────────────────
// 10 clusters thématiques FR. Chaque cluster contient une liste de
// mots-clés (formes accentuées + non-accentuées). Le top 5 par force
// est renvoyé au client.

interface NarrativeCluster {
  label: string;
  keywords: string[];
}

const NARRATIVE_CLUSTERS: NarrativeCluster[] = [
  {
    label: "Performance financière",
    keywords: [
      "résultat", "resultat", "chiffre d'affaires", "chiffre d affaires",
      "bénéfice", "benefice", "marge", "sogg", "dividende", "bilan",
      "guidance", "ebitda", "rentabilité", "rentabilite", "profit",
      "recettes", "exercice", "résultats annuels",
    ],
  },
  {
    label: "Innovation & technologie",
    keywords: [
      "innovation", "technologie", "digital", "numérique", "numerique",
      "intelligence artificielle", "ia ", "transformation digitale",
      "r&d", "recherche et développement", "startup", "plateforme",
      "algorithme", "automatisation", "cloud", "data",
    ],
  },
  {
    label: "Responsabilité sociétale (RSE)",
    keywords: [
      "rse", "responsabilité sociétale", "environnement", "développement durable",
      "developpement durable", "carbone", "climat", "écologie", "ecologie",
      "empreinte", "biodiversité", "biodiversite", "transition énergétique",
      "transition energetique", "durabilité", "durabilite",
    ],
  },
  {
    label: "Stratégie & croissance",
    keywords: [
      "stratégie", "strategie", "croissance", "expansion", "acquisition",
      "fusion", "partenariat", "plan stratégique", "plan strategie",
      "déploiement", "deploiement", "international", "nouveau marché",
      "nouveau marche", "ambition", "feuille de route",
    ],
  },
  {
    label: "Gouvernance & conformité",
    keywords: [
      "gouvernance", "conseil d administration", "conseil d'administration",
      "administrateur", "comité", "comite", "éthique", "ethique",
      "conformité", "conformite", "régulateur", "regulateur", "ammc",
      "bam", "bvc", "transparence", "audit", "indépendance", "independance",
    ],
  },
  {
    label: "Crise & controverse",
    keywords: [
      "crise", "polémique", "polemique", "scandale", "controverse",
      "litige", "affaire", "sanction", "amende", "poursuite", "enquête",
      "enquete", "défaillance", "defaillance", "incident", "dérapage",
      "derapage", "réputation", "image",
    ],
  },
  {
    label: "Produits & lancements",
    keywords: [
      "lancement", "produit", "service", "nouveauté", "nouveaute",
      "offre", "innovation produit", "collection", "gamme", "version",
      "commercialisation", "mise sur le marché", "mise sur le marche",
      "inauguration", "ouverture", "première", "premiere",
    ],
  },
  {
    label: "Social & ressources humaines",
    keywords: [
      "emploi", "recrutement", "salarié", "salarie", "collaborateur",
      "grève", "greve", "syndicat", "licenciement", "formation",
      "marque employeur", "rémunération", "remuneration", "talent",
      "parité", "parite", "diversité", "diversite", "conditions de travail",
    ],
  },
  {
    label: "Concurrence & marché",
    keywords: [
      "concurrent", "concurrence", "part de marché", "part de marche",
      "positionnement", "duel", "rival", "leadership", "leaders",
      "guerre des prix", "bataille", "concurrentiel", "secteur",
      "tendances du marché", "tendances du marche",
    ],
  },
  {
    label: "Réglementation & cadre légal",
    keywords: [
      "loi", "réglementation", "reglementation", "décret", "decret",
      "texte", "cadre légal", "cadre legal", "norme", "directive",
      "application", "projet de loi", "réforme", "reforme", "obligation",
      "compliance", "législatif", "legislatif",
    ],
  },
];

// ─── Constantes de fenêtre ────────────────────────────────────
const WINDOW_DAYS = 30;
const BUCKET_DAYS = 5;        // 6 buckets × 5 jours = 30 jours
const BUCKET_COUNT = WINDOW_DAYS / BUCKET_DAYS; // 6
const SENTIMENT_POS_THRESHOLD = 0.15;
const SENTIMENT_NEG_THRESHOLD = -0.15;

// ─── Helpers ──────────────────────────────────────────────────

interface ArticleRow {
  title: string;
  content: string | null;
  summary: string | null;
  sentimentScore: number | null;
  sentimentLabel: string | null;
  publishedAt: Date | null;
}

/**
 * Texte concatené (titre + résumé + contenu) passé en minuscules
 * pour la recherche par mots-clés. On évite les .toLowerCase()
 * répétés en le calculant une fois par article.
 */
function articleText(a: ArticleRow): string {
  const parts = [a.title || "", a.summary || "", a.content || ""];
  return parts.join(" \n ").toLowerCase();
}

function matchesCluster(text: string, keywords: string[]): boolean {
  for (const kw of keywords) {
    if (text.includes(kw.toLowerCase())) return true;
  }
  return false;
}

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * Bucketise un article dans l'un des 6 buckets de 5 jours.
 * Bucket 0 = le plus ancien (j-30 → j-25), bucket 5 = le plus
 * récent (j-5 → maintenant). Retourne -1 si la date est nulle
 * ou hors fenêtre.
 */
function bucketIndex(publishedAt: Date | null, now: Date): number {
  if (!publishedAt) return -1;
  const diffMs = now.getTime() - publishedAt.getTime();
  if (diffMs < 0) return BUCKET_COUNT - 1; // future → dernier bucket
  const diffDays = diffMs / 86400000;
  if (diffDays >= WINDOW_DAYS) return -1;
  return Math.min(BUCKET_COUNT - 1, Math.floor((WINDOW_DAYS - diffDays) / BUCKET_DAYS));
}

/**
 * Classifie la polarité moyenne en 3 buckets. Si pas de score
 * numérique, on retombe sur sentimentLabel (string).
 */
function classifySentiment(
  avgScore: number | null,
  sentimentLabel: string | null,
): NarrativeSentiment {
  if (avgScore != null) {
    if (avgScore > SENTIMENT_POS_THRESHOLD) return "positive";
    if (avgScore < SENTIMENT_NEG_THRESHOLD) return "negative";
    return "neutral";
  }
  if (sentimentLabel) {
    const lbl = sentimentLabel.toLowerCase();
    if (lbl.includes("pos")) return "positive";
    if (lbl.includes("neg")) return "negative";
  }
  return "neutral";
}

/**
 * Force 0-100 d'un récit. Combine 3 signaux :
 *   • Volume      (50 %)  — min(1, articles/20) × 50
 *   • Récence     (25 %)  — proximité du lastSeen avec maintenant
 *   • Amplitude   (25 %)  — magnitude du sentiment (polarisation =
 *                            récit plus marquant), |avg| × 2 plafonné à 1
 *
 * Si aucun signal sentiment, l'amplitude retombe à 25 % de son max
 * (neutre mais non nul) pour ne pas pénaliser les récits peu
 * polarisés mais volumineux.
 */
function computeStrength(
  articleCount: number,
  lastSeen: Date | null,
  now: Date,
  avgSentiment: number | null,
): number {
  const volumeScore = Math.min(1, articleCount / 20) * 50;
  let recencyScore = 0;
  if (lastSeen) {
    const daysSince = (now.getTime() - lastSeen.getTime()) / 86400000;
    recencyScore = Math.max(0, 1 - daysSince / WINDOW_DAYS) * 25;
  }
  let magnitudeScore: number;
  if (avgSentiment != null) {
    magnitudeScore = Math.min(1, Math.abs(avgSentiment) * 2) * 25;
  } else {
    magnitudeScore = 0.25 * 25; // 6.25 pts — signal neutre
  }
  return clampScore(volumeScore + recencyScore + magnitudeScore);
}

/**
 * Classifie le cycle de vie à partir des 3 paliers de 10 jours
 * (agrégation des 6 buckets × 5j en 3 × 10j).
 *   b1 = ancien  (j-30 → j-20)
 *   b2 = médian  (j-20 → j-10)
 *   b3 = récent  (j-10 → maintenant)
 *
 * Règles (par ordre de priorité) :
 *   1. total ≤ 1                       → emerging
 *   2. b1 = 0 et b2 = 0                → emerging (apparu récemment)
 *   3. b1 = 0, b2 > 0, b3 ≥ b2         → emerging (transition vers growing)
 *   4. b3 > b2 ≥ b1                    → growing
 *   5. b2 > b1 et b2 ≥ b3              → peak (palier médian dominant)
 *   6. b3 < b2                         → declining
 *   7. b1 = b2 = b3 > 0                → peak (plateau stable)
 *   8. fallback                        → peak
 */
function classifyTrend(buckets: number[]): NarrativeTrend {
  // buckets = 6 valeurs (5j chacune). On agrège en 3 paliers de 10j.
  const b1 = (buckets[0] || 0) + (buckets[1] || 0);
  const b2 = (buckets[2] || 0) + (buckets[3] || 0);
  const b3 = (buckets[4] || 0) + (buckets[5] || 0);
  const total = b1 + b2 + b3;

  if (total <= 1) return "emerging";
  if (b1 === 0 && b2 === 0) return "emerging";
  if (b1 === 0 && b2 > 0 && b3 >= b2) return "emerging";
  if (b3 > b2 && b2 >= b1) return "growing";
  if (b2 > b1 && b2 >= b3) return "peak";
  if (b3 < b2) return "declining";
  if (b1 === b2 && b2 === b3 && total > 0) return "peak";
  return "peak";
}

/**
 * Vélocité = (articles 7 derniers jours) − (articles 7j précédents).
 * Signé : positif = prise de momentum, négatif = essoufflement.
 *
 * buckets[5] = j-5..now, buckets[4] = j-10..j-5, buckets[3] = j-15..j-10.
 * Approximation linéaire :
 *   last7 ≈ buckets[5] + 0.4 × buckets[4]
 *   prev7 ≈ 0.6 × buckets[4] + 0.4 × buckets[3]
 */
function computeVelocity(buckets: number[]): number {
  const last7 = (buckets[5] || 0) + 0.4 * (buckets[4] || 0);
  const prev7 = 0.6 * (buckets[4] || 0) + 0.4 * (buckets[3] || 0);
  return Math.round(last7 - prev7);
}

// ─── Handler POST ─────────────────────────────────────────────

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
    const windowAgo = new Date(now.getTime() - WINDOW_DAYS * 86400000);

    // ─── Batch parallèle : entreprise + articles 30j ───
    const [companyRow, articles] = await Promise.all([
      prisma.company.findUnique({
        where: { id: company.id },
        select: { name: true, sector: true, ticker: true },
      }),
      prisma.article.findMany({
        where: {
          companyId: company.id,
          publishedAt: { gte: windowAgo },
          ...demoFilter,
        },
        select: {
          title: true,
          content: true,
          summary: true,
          sentimentScore: true,
          sentimentLabel: true,
          publishedAt: true,
        },
        take: 400,
        orderBy: { publishedAt: "desc" },
      }),
    ]);

    // ─── Pré-calcul du texte concatené pour chaque article ───
    const enriched: Array<ArticleRow & { text: string }> = articles.map((a) => ({
      ...a,
      text: articleText(a),
    }));

    // ─── Pour chaque cluster : collecter articles + métriques ───
    const narratives: Narrative[] = [];
    for (const cluster of NARRATIVE_CLUSTERS) {
      const matched = enriched.filter((a) => matchesCluster(a.text, cluster.keywords));
      if (matched.length === 0) continue;

      // Bucketing temporel (6 × 5j)
      const buckets: number[] = new Array(BUCKET_COUNT).fill(0);
      let firstSeen: Date | null = null;
      let lastSeen: Date | null = null;
      let sentimentSum = 0;
      let sentimentCount = 0;
      let labelPositive = 0;
      let labelNegative = 0;

      for (const a of matched) {
        const idx = bucketIndex(a.publishedAt, now);
        if (idx >= 0) buckets[idx] += 1;

        if (a.publishedAt) {
          if (!firstSeen || a.publishedAt < firstSeen) firstSeen = a.publishedAt;
          if (!lastSeen || a.publishedAt > lastSeen) lastSeen = a.publishedAt;
        }
        if (a.sentimentScore != null) {
          sentimentSum += a.sentimentScore;
          sentimentCount += 1;
        }
        if (a.sentimentLabel) {
          const lbl = a.sentimentLabel.toLowerCase();
          if (lbl.includes("pos")) labelPositive += 1;
          else if (lbl.includes("neg")) labelNegative += 1;
        }
      }

      const avgSentiment = sentimentCount > 0 ? sentimentSum / sentimentCount : null;
      // Fallback label-based si pas de score numérique
      let effectiveSentiment: NarrativeSentiment;
      if (avgSentiment != null) {
        effectiveSentiment = classifySentiment(avgSentiment, null);
      } else if (labelPositive > 0 || labelNegative > 0) {
        effectiveSentiment = labelPositive > labelNegative ? "positive"
          : labelNegative > labelPositive ? "negative"
          : "neutral";
      } else {
        effectiveSentiment = "neutral";
      }

      const strength = computeStrength(matched.length, lastSeen, now, avgSentiment);
      const trend = classifyTrend(buckets);
      const velocity = computeVelocity(buckets);

      narratives.push({
        label: cluster.label,
        strength,
        sentiment: effectiveSentiment,
        articleCount: matched.length,
        firstSeen: (firstSeen ?? windowAgo).toISOString(),
        lastSeen: (lastSeen ?? now).toISOString(),
        trend,
        velocity,
        timeline: buckets,
      });
    }

    // ─── Top 5 par force décroissante ───
    narratives.sort((a, b) => b.strength - a.strength);
    const top5 = narratives.slice(0, 5);

    const response: NarrativeTrackerResponse = {
      narratives: top5,
      meta: {
        companyName: companyRow?.name ?? company.name,
        sector: company.sector,
        generatedAt: now.toISOString(),
        windowDays: WINDOW_DAYS,
        totalArticles: articles.length,
        source: "real",
      },
    };

    logInfo(
      "narrative-tracker",
      `Narrative tracker generated for ${company.name}: ${top5.length} narratives (top: ${top5[0]?.label ?? "none"} @ ${top5[0]?.strength ?? 0}/100) from ${articles.length} articles`,
    );

    return NextResponse.json(response);
  } catch (err) {
    logError("narrative-tracker", `Generate failed: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}
