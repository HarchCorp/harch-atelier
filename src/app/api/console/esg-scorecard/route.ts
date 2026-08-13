// ═══════════════════════════════════════════════════════════════
//  POST /api/console/esg-scorecard
//
//  ESG Scorecard — 3 piliers × 4 sous-métriques, radar 3 axes,
//  benchmark sectoriel, recommandation stratégique.
//
//  Piliers :
//    1. Environnemental — Empreinte carbone, Efficacité énergétique,
//       Gestion des déchets, Biodiversité.
//    2. Social — Conditions de travail, Diversité & inclusion,
//       Engagement communautaire, Santé & sécurité.
//    3. Gouvernance — Indépendance du conseil, Transparence &
//       reporting, Éthique & conformité, Droits des actionnaires.
//
//  Chaque sous-métrique est notée 0-100 et comparée au benchmark
//  sectoriel. Le score global est la moyenne pondérée des 3 piliers.
//  La tendance compare la fenêtre 30j courante à la fenêtre 30j
//  précédente (j-60 → j-30).
//
//  Signaux utilisés :
//    • Article (titre + contenu) — recherche par mots-clés ESG.
//    • Article.sourceType = "regulatory" — proxy gouvernance.
//    • ArticleComment — proxy social (voix des clients).
//    • ReputationScore.sentiment — proxy social (lissage).
//    • RiskAssessment(category ∈ {Réglementaire, ESG}) — pénalité
//      gouvernance.
//
//  Auth : session + entreprise (requireUserCompany). Les sessions
//  démo passent par le même chemin — demoFilter est étendu dans
//  chaque clause where Article / RiskAssessment / ReputationScore
//  pour isoler les données démo des données réelles.
//
//  Skill ID : SKILL-18-ESG
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { logInfo, logError } from "@/lib/logger";
import { requireUserCompany } from "@/lib/harchiq/company-session";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// ─── Types renvoyés au client ─────────────────────────────────

export type EsgPillarName = "Environnemental" | "Social" | "Gouvernance";

export interface EsgSubMetric {
  name: string;
  score: number;        // 0-100
  benchmark: number;    // 0-100 (moyenne sectorielle du pilier)
}

export interface EsgPillar {
  name: EsgPillarName;
  score: number;        // 0-100
  trend: number;        // -10..+10
  subMetrics: EsgSubMetric[];   // 4 par pilier
}

export interface EsgScorecardResponse {
  pillars: EsgPillar[];
  overallScore: number;          // 0-100
  benchmarkSector: string;       // nom du secteur utilisé pour le benchmark
  recommendation: string;        // analyse HarchIQ en français
  meta: {
    companyName: string;
    sector: string;
    generatedAt: string;
    windowDays: number;
    source: "real" | "demo";
  };
}

// ─── Cartographies de mots-clés ───────────────────────────────

const ENV_KEYWORDS = [
  "environnement", "carbone", "co2", "émissions", "emissions",
  "énergie", "energie", "climat", "déchet", "dechet", "recyclage",
  "biodiversité", "biodiversite", "vert", "rse", "décarbonation",
  "decarbonation", "transition énergétique", "transition energetique",
  "empreinte carbone",
];

const SOCIAL_KEYWORDS = [
  "emploi", "salarié", "salarie", "formation", "conditions de travail",
  "diversité", "diversite", "inclusion", "social", "talent",
  "marque employeur", "rémunération", "remuneration", "rse",
  "égalité des chances", "egalite", "handicap", "jeunesse",
  "communauté", "communaute", "santé", "sante", "sécurité", "securite",
];

const GOV_KEYWORDS = [
  "gouvernance", "conseil d administration", "conseil d'administration",
  "audit", "éthique", "ethique", "transparence", "conformité",
  "conformite", "régulateur", "regulateur", "ammc", "bam", "bvc",
  "actionnaire", "assemblée générale", "assemblee generale",
  "indépendance", "independance", "comité", "comite", "administrateur",
  "responsabilité sociétale", "corruption", "anti-corruption",
];

// Sous-métriques — 4 par pilier, chaque bundle a ses propres mots-clés.
const ENV_SUB: Array<{ name: string; keywords: string[] }> = [
  { name: "Empreinte carbone", keywords: ["carbone", "co2", "émissions", "emissions", "empreinte carbone", "décarbonation", "decarbonation"] },
  { name: "Efficacité énergétique", keywords: ["énergie", "energie", "transition énergétique", "transition energetique", "efficacité énergétique", "renouvelable"] },
  { name: "Gestion des déchets", keywords: ["déchet", "dechet", "recyclage", "tri sélectif", "économie circulaire", "economie circulaire"] },
  { name: "Biodiversité", keywords: ["biodiversité", "biodiversite", "écosystème", "ecosysteme", "nature", "espèce", "espece", "forêt", "foret"] },
];

const SOCIAL_SUB: Array<{ name: string; keywords: string[] }> = [
  { name: "Conditions de travail", keywords: ["conditions de travail", "salarié", "salarie", "rémunération", "remuneration", "syndicat", "grève", "greve", "droit social"] },
  { name: "Diversité & inclusion", keywords: ["diversité", "diversite", "inclusion", "égalité", "egalite", "handicap", "femme", "parité", "parite"] },
  { name: "Engagement communautaire", keywords: ["communauté", "communaute", "rse", "social", "jeunesse", "soutien", "mécénat", "mecenat", "fondation", "solidarité"] },
  { name: "Santé & sécurité", keywords: ["santé", "sante", "sécurité", "securite", "sécurité au travail", "prévention", "prevention", "hygiène"] },
];

const GOV_SUB: Array<{ name: string; keywords: string[] }> = [
  { name: "Indépendance du conseil", keywords: ["conseil d administration", "conseil d'administration", "administrateur", "indépendance", "independance", "comité", "comite"] },
  { name: "Transparence & reporting", keywords: ["transparence", "reporting", "publication", "rapport annuel", "information financière"] },
  { name: "Éthique & conformité", keywords: ["éthique", "ethique", "conformité", "conformite", "régulateur", "regulateur", "ammc", "bam", "bvc", "corruption", "anti-corruption"] },
  { name: "Droits des actionnaires", keywords: ["actionnaire", "assemblée générale", "assemblee generale", "dividende", "droit de vote", "gouvernance d'entreprise"] },
];

// ─── Benchmarks sectoriels ────────────────────────────────────
// Valeurs médianes par secteur marocain (estimations publiques
// AMMC / BVC / rapports RSE 2023). Hors table → global par défaut.
const SECTOR_BENCHMARKS: Record<string, { E: number; S: number; G: number }> = {
  "Banque":           { E: 58, S: 72, G: 78 },
  "Assurance":        { E: 55, S: 70, G: 75 },
  "Télécoms":         { E: 62, S: 68, G: 70 },
  "Telecoms":         { E: 62, S: 68, G: 70 },
  "Mines":            { E: 42, S: 58, G: 65 },
  "Énergie":          { E: 40, S: 60, G: 68 },
  "Energie":          { E: 40, S: 60, G: 68 },
  "Distribution":     { E: 60, S: 66, G: 64 },
  "Agroalimentaire":  { E: 56, S: 70, G: 66 },
  "BTP":              { E: 48, S: 58, G: 62 },
  "Transport":        { E: 50, S: 62, G: 64 },
  "Pharmaceutique":   { E: 60, S: 74, G: 80 },
  "Technologie":      { E: 64, S: 72, G: 68 },
  "Loisirs":          { E: 58, S: 64, G: 62 },
};

const GLOBAL_BENCHMARK = { E: 55, S: 65, G: 70 };

// ─── Constantes de fenêtre ────────────────────────────────────
const WINDOW_DAYS = 30;
const TREND_WINDOW_DAYS = 60;

// ─── Helpers ──────────────────────────────────────────────────

interface Sentimented {
  sentimentScore: number | null;
}

function avgSentiment<T extends Sentimented>(rows: T[]): number | null {
  const valid = rows.filter((r) => r.sentimentScore != null);
  if (valid.length === 0) return null;
  return valid.reduce((s, r) => s + (r.sentimentScore as number), 0) / valid.length;
}

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function clampTrend(n: number): number {
  return Math.max(-10, Math.min(10, Math.round(n)));
}

/**
 * Construit un filtre OR sur titre + contenu pour une liste de
 * mots-clés. Les clauses sont étendues dans le where Prisma —
 * Prisma AND-combine les clés de premier niveau.
 */
function keywordWhere(keywords: string[]): { OR: Prisma.ArticleWhereInput[] } {
  const conds: Prisma.ArticleWhereInput[] = [];
  for (const kw of keywords) {
    conds.push({ title: { contains: kw, mode: "insensitive" } });
    conds.push({ content: { contains: kw, mode: "insensitive" } });
  }
  return { OR: conds };
}

/**
 * Score 0-100 d'un ensemble d'articles. Si aucun signal, renvoie
 * le fallback (benchmark sectoriel du pilier). Sinon, blend entre
 * fallback et sentimentScore converti en 0-100, pondéré par le
 * volume (plus de mentions = plus de confiance dans le sentiment).
 */
function scoreForArticles(
  articles: Sentimented[],
  fallback: number,
): number {
  if (articles.length === 0) return fallback;
  const avg = avgSentiment(articles);
  if (avg == null) return fallback;
  const sentimentScore = 50 + avg * 50; // -1..1 → 0..100
  const vol = Math.min(1, articles.length / 12);
  const blended = fallback * (1 - vol) + sentimentScore * vol;
  return clampScore(blended);
}

function trendFromScores(current: number, previous: number): number {
  return clampTrend(current - previous);
}

/**
 * Lookup benchmark sectoriel — match exact puis sous-chaîne
 * insensible à la casse. Fallback global si secteur inconnu.
 */
function sectorBenchmark(sector: string | null | undefined): { E: number; S: number; G: number } {
  if (!sector) return GLOBAL_BENCHMARK;
  if (SECTOR_BENCHMARKS[sector]) return SECTOR_BENCHMARKS[sector];
  const sectorLower = sector.toLowerCase();
  for (const key of Object.keys(SECTOR_BENCHMARKS)) {
    if (sectorLower.includes(key.toLowerCase())) return SECTOR_BENCHMARKS[key];
  }
  return GLOBAL_BENCHMARK;
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
    const trendAgo = new Date(now.getTime() - TREND_WINDOW_DAYS * 86400000);
    // Fenêtre précédente (j-60 → j-30) pour calcul de tendance.
    const prevWindowStart = trendAgo;
    const prevWindowEnd = windowAgo;

    const bench = sectorBenchmark(company.sector);
    const fallbackE = bench.E;
    const fallbackS = bench.S;
    const fallbackG = bench.G;

    // ─── Batch parallèle : tous les signaux en une passe ───
    const [
      companyRow,
      reputationScore,
      // Environnemental — courant + précédent
      envArticlesCur,
      envArticlesPrev,
      // Sous-métriques ENV (courant uniquement)
      envSubCarbone,
      envSubEnergie,
      envSubDechets,
      envSubBio,
      // Social — courant + précédent
      socialArticlesCur,
      socialArticlesPrev,
      socialSubTravail,
      socialSubDiversite,
      socialSubCommunaute,
      socialSubSante,
      // Gouvernance — courant + précédent
      govArticlesCur,
      govArticlesPrev,
      govSubConseil,
      govSubTransparence,
      govSubEthique,
      govSubActionnaires,
      // Articles réglementaires (proxy gouvernance)
      regulatoryCur,
      regulatoryPrev,
      // ArticleComment (proxy social)
      comments,
      // RiskAssessment — catégories Réglementaire + ESG
      govRisks,
    ] = await Promise.all([
      prisma.company.findUnique({
        where: { id: company.id },
        select: { name: true, sector: true, ticker: true },
      }),
      prisma.reputationScore.findFirst({
        where: { companyId: company.id, ...demoFilter },
        orderBy: { calculatedAt: "desc" },
        select: { overall: true, sentiment: true, trend: true, calculatedAt: true },
      }),

      // ─── Environnemental ───
      prisma.article.findMany({
        where: {
          companyId: company.id,
          publishedAt: { gte: windowAgo },
          ...keywordWhere(ENV_KEYWORDS),
          ...demoFilter,
        },
        select: { sentimentScore: true, publishedAt: true },
        take: 200,
      }),
      prisma.article.findMany({
        where: {
          companyId: company.id,
          publishedAt: { gte: prevWindowStart, lt: prevWindowEnd },
          ...keywordWhere(ENV_KEYWORDS),
          ...demoFilter,
        },
        select: { sentimentScore: true },
        take: 200,
      }),
      prisma.article.findMany({
        where: {
          companyId: company.id,
          publishedAt: { gte: windowAgo },
          ...keywordWhere(ENV_SUB[0].keywords),
          ...demoFilter,
        },
        select: { sentimentScore: true },
        take: 100,
      }),
      prisma.article.findMany({
        where: {
          companyId: company.id,
          publishedAt: { gte: windowAgo },
          ...keywordWhere(ENV_SUB[1].keywords),
          ...demoFilter,
        },
        select: { sentimentScore: true },
        take: 100,
      }),
      prisma.article.findMany({
        where: {
          companyId: company.id,
          publishedAt: { gte: windowAgo },
          ...keywordWhere(ENV_SUB[2].keywords),
          ...demoFilter,
        },
        select: { sentimentScore: true },
        take: 100,
      }),
      prisma.article.findMany({
        where: {
          companyId: company.id,
          publishedAt: { gte: windowAgo },
          ...keywordWhere(ENV_SUB[3].keywords),
          ...demoFilter,
        },
        select: { sentimentScore: true },
        take: 100,
      }),

      // ─── Social ───
      prisma.article.findMany({
        where: {
          companyId: company.id,
          publishedAt: { gte: windowAgo },
          ...keywordWhere(SOCIAL_KEYWORDS),
          ...demoFilter,
        },
        select: { sentimentScore: true, publishedAt: true },
        take: 200,
      }),
      prisma.article.findMany({
        where: {
          companyId: company.id,
          publishedAt: { gte: prevWindowStart, lt: prevWindowEnd },
          ...keywordWhere(SOCIAL_KEYWORDS),
          ...demoFilter,
        },
        select: { sentimentScore: true },
        take: 200,
      }),
      prisma.article.findMany({
        where: {
          companyId: company.id,
          publishedAt: { gte: windowAgo },
          ...keywordWhere(SOCIAL_SUB[0].keywords),
          ...demoFilter,
        },
        select: { sentimentScore: true },
        take: 100,
      }),
      prisma.article.findMany({
        where: {
          companyId: company.id,
          publishedAt: { gte: windowAgo },
          ...keywordWhere(SOCIAL_SUB[1].keywords),
          ...demoFilter,
        },
        select: { sentimentScore: true },
        take: 100,
      }),
      prisma.article.findMany({
        where: {
          companyId: company.id,
          publishedAt: { gte: windowAgo },
          ...keywordWhere(SOCIAL_SUB[2].keywords),
          ...demoFilter,
        },
        select: { sentimentScore: true },
        take: 100,
      }),
      prisma.article.findMany({
        where: {
          companyId: company.id,
          publishedAt: { gte: windowAgo },
          ...keywordWhere(SOCIAL_SUB[3].keywords),
          ...demoFilter,
        },
        select: { sentimentScore: true },
        take: 100,
      }),

      // ─── Gouvernance ───
      prisma.article.findMany({
        where: {
          companyId: company.id,
          publishedAt: { gte: windowAgo },
          ...keywordWhere(GOV_KEYWORDS),
          ...demoFilter,
        },
        select: { sentimentScore: true, publishedAt: true },
        take: 200,
      }),
      prisma.article.findMany({
        where: {
          companyId: company.id,
          publishedAt: { gte: prevWindowStart, lt: prevWindowEnd },
          ...keywordWhere(GOV_KEYWORDS),
          ...demoFilter,
        },
        select: { sentimentScore: true },
        take: 200,
      }),
      prisma.article.findMany({
        where: {
          companyId: company.id,
          publishedAt: { gte: windowAgo },
          ...keywordWhere(GOV_SUB[0].keywords),
          ...demoFilter,
        },
        select: { sentimentScore: true },
        take: 100,
      }),
      prisma.article.findMany({
        where: {
          companyId: company.id,
          publishedAt: { gte: windowAgo },
          ...keywordWhere(GOV_SUB[1].keywords),
          ...demoFilter,
        },
        select: { sentimentScore: true },
        take: 100,
      }),
      prisma.article.findMany({
        where: {
          companyId: company.id,
          publishedAt: { gte: windowAgo },
          ...keywordWhere(GOV_SUB[2].keywords),
          ...demoFilter,
        },
        select: { sentimentScore: true },
        take: 100,
      }),
      prisma.article.findMany({
        where: {
          companyId: company.id,
          publishedAt: { gte: windowAgo },
          ...keywordWhere(GOV_SUB[3].keywords),
          ...demoFilter,
        },
        select: { sentimentScore: true },
        take: 100,
      }),

      // ─── Articles réglementaires (proxy gouvernance) ───
      prisma.article.findMany({
        where: {
          companyId: company.id,
          sourceType: "regulatory",
          publishedAt: { gte: windowAgo },
          ...demoFilter,
        },
        select: { sentimentScore: true, publishedAt: true },
        take: 100,
      }),
      prisma.article.findMany({
        where: {
          companyId: company.id,
          sourceType: "regulatory",
          publishedAt: { gte: prevWindowStart, lt: prevWindowEnd },
          ...demoFilter,
        },
        select: { sentimentScore: true },
        take: 100,
      }),

      // ─── ArticleComment (proxy social) ───
      prisma.articleComment.findMany({
        where: { article: { companyId: company.id, ...demoFilter } },
        orderBy: { publishedAt: "desc" },
        take: 200,
        select: { sentimentScore: true, publishedAt: true },
      }),

      // ─── RiskAssessment — pénalité gouvernance ───
      prisma.riskAssessment.findMany({
        where: {
          companyId: company.id,
          category: { in: ["Réglementaire", "ESG"] },
          ...demoFilter,
        },
        orderBy: { assessedAt: "desc" },
        take: 30,
        select: { riskScore: true, category: true, assessedAt: true },
      }),
    ]);

    // ─── Score Environnemental ────────────────────────────────
    const envSentiment = avgSentiment(envArticlesCur);
    const envSentimentScore = envSentiment != null ? 50 + envSentiment * 50 : fallbackE;
    const envVol = Math.min(1, envArticlesCur.length / 15);
    const envScore = clampScore(fallbackE * (1 - envVol) + envSentimentScore * envVol);

    const envPrevSentiment = avgSentiment(envArticlesPrev);
    const envPrevVol = Math.min(1, envArticlesPrev.length / 15);
    const envPrevSentimentScore = envPrevSentiment != null ? 50 + envPrevSentiment * 50 : fallbackE;
    const envPrevScore = clampScore(fallbackE * (1 - envPrevVol) + envPrevSentimentScore * envPrevVol);
    const envTrend = trendFromScores(envScore, envPrevScore);

    // ─── Score Social ─────────────────────────────────────────
    const socialSentiment = avgSentiment(socialArticlesCur);
    const commentsSentiment = comments.length > 0
      ? comments.reduce((s, c) => s + c.sentimentScore, 0) / comments.length
      : null;
    const repSocial = reputationScore?.sentiment != null ? reputationScore.sentiment : null;
    const socialSignals: number[] = [];
    if (socialSentiment != null) socialSignals.push(socialSentiment);
    if (commentsSentiment != null) socialSignals.push(commentsSentiment);
    if (repSocial != null) socialSignals.push(repSocial / 100); // 0-100 → -1..1
    const socialAvg = socialSignals.length > 0
      ? socialSignals.reduce((s, v) => s + v, 0) / socialSignals.length
      : null;
    const socialSentimentScore = socialAvg != null ? 50 + socialAvg * 50 : fallbackS;
    const socialVol = Math.min(1, (socialArticlesCur.length + comments.length) / 20);
    const socialScore = clampScore(fallbackS * (1 - socialVol) + socialSentimentScore * socialVol);

    const socialPrevSentiment = avgSentiment(socialArticlesPrev);
    const socialPrevVol = Math.min(1, socialArticlesPrev.length / 20);
    const socialPrevSentimentScore = socialPrevSentiment != null ? 50 + socialPrevSentiment * 50 : fallbackS;
    const socialPrevScore = clampScore(fallbackS * (1 - socialPrevVol) + socialPrevSentimentScore * socialPrevVol);
    const socialTrend = trendFromScores(socialScore, socialPrevScore);

    // ─── Score Gouvernance ────────────────────────────────────
    const govSentiment = avgSentiment(govArticlesCur);
    const regSentiment = avgSentiment(regulatoryCur);
    const govSignals: number[] = [];
    if (govSentiment != null) govSignals.push(govSentiment);
    if (regSentiment != null) govSignals.push(regSentiment);
    // Risques : corrélation négative (plus de risque = score plus bas).
    const avgGovRisk = govRisks.length > 0
      ? govRisks.reduce((s, r) => s + r.riskScore, 0) / govRisks.length / 100
      : null;
    if (avgGovRisk != null) govSignals.push(-avgGovRisk);

    const govAvg = govSignals.length > 0
      ? govSignals.reduce((s, v) => s + v, 0) / govSignals.length
      : null;
    const govSentimentScore = govAvg != null ? 50 + govAvg * 50 : fallbackG;
    const govVol = Math.min(1, (govArticlesCur.length + regulatoryCur.length) / 12);
    let govScore = clampScore(fallbackG * (1 - govVol) + govSentimentScore * govVol);
    // Pénalité systématique : chaque risque Réglementaire/ESG actif
    // retire jusqu'à 3 points (plafonné à 15).
    if (govRisks.length > 0) {
      govScore = clampScore(govScore - Math.min(15, govRisks.length * 3));
    }

    const govPrevSentiment = avgSentiment(govArticlesPrev);
    const regPrevSentiment = avgSentiment(regulatoryPrev);
    const govPrevSignals: number[] = [];
    if (govPrevSentiment != null) govPrevSignals.push(govPrevSentiment);
    if (regPrevSentiment != null) govPrevSignals.push(regPrevSentiment);
    const govPrevAvg = govPrevSignals.length > 0
      ? govPrevSignals.reduce((s, v) => s + v, 0) / govPrevSignals.length
      : null;
    const govPrevVol = Math.min(1, (govArticlesPrev.length + regulatoryPrev.length) / 12);
    const govPrevSentimentScore = govPrevAvg != null ? 50 + govPrevAvg * 50 : fallbackG;
    const govPrevScore = clampScore(fallbackG * (1 - govPrevVol) + govPrevSentimentScore * govPrevVol);
    const govTrend = trendFromScores(govScore, govPrevScore);

    // ─── Sous-métriques ───────────────────────────────────────
    // Le benchmark de chaque sous-métrique = benchmark du pilier.
    const envSubs: EsgSubMetric[] = [
      { name: ENV_SUB[0].name, score: scoreForArticles(envSubCarbone, fallbackE), benchmark: fallbackE },
      { name: ENV_SUB[1].name, score: scoreForArticles(envSubEnergie, fallbackE), benchmark: fallbackE },
      { name: ENV_SUB[2].name, score: scoreForArticles(envSubDechets, fallbackE), benchmark: fallbackE },
      { name: ENV_SUB[3].name, score: scoreForArticles(envSubBio, fallbackE), benchmark: fallbackE },
    ];
    const socialSubs: EsgSubMetric[] = [
      { name: SOCIAL_SUB[0].name, score: scoreForArticles(socialSubTravail, fallbackS), benchmark: fallbackS },
      { name: SOCIAL_SUB[1].name, score: scoreForArticles(socialSubDiversite, fallbackS), benchmark: fallbackS },
      { name: SOCIAL_SUB[2].name, score: scoreForArticles(socialSubCommunaute, fallbackS), benchmark: fallbackS },
      { name: SOCIAL_SUB[3].name, score: scoreForArticles(socialSubSante, fallbackS), benchmark: fallbackS },
    ];
    const govSubs: EsgSubMetric[] = [
      { name: GOV_SUB[0].name, score: scoreForArticles(govSubConseil, fallbackG), benchmark: fallbackG },
      { name: GOV_SUB[1].name, score: scoreForArticles(govSubTransparence, fallbackG), benchmark: fallbackG },
      { name: GOV_SUB[2].name, score: scoreForArticles(govSubEthique, fallbackG), benchmark: fallbackG },
      { name: GOV_SUB[3].name, score: scoreForArticles(govSubActionnaires, fallbackG), benchmark: fallbackG },
    ];

    // ─── Score global & recommandation ────────────────────────
    const overallScore = clampScore((envScore + socialScore + govScore) / 3);
    const pillars: EsgPillar[] = [
      { name: "Environnemental", score: envScore, trend: envTrend, subMetrics: envSubs },
      { name: "Social", score: socialScore, trend: socialTrend, subMetrics: socialSubs },
      { name: "Gouvernance", score: govScore, trend: govTrend, subMetrics: govSubs },
    ];
    const overallBench = Math.round((fallbackE + fallbackS + fallbackG) / 3);
    const recommendation = buildRecommendation(
      envScore, socialScore, govScore,
      overallScore, overallBench,
      companyRow?.name ?? company.name,
    );

    const response: EsgScorecardResponse = {
      pillars,
      overallScore,
      benchmarkSector: company.sector || "Général",
      recommendation,
      meta: {
        companyName: companyRow?.name ?? company.name,
        sector: company.sector,
        generatedAt: now.toISOString(),
        windowDays: WINDOW_DAYS,
        source: "real",
      },
    };

    logInfo(
      "esg-scorecard",
      `ESG scorecard generated for ${company.name}: E=${envScore} S=${socialScore} G=${govScore} overall=${overallScore} (bench E=${fallbackE} S=${fallbackS} G=${fallbackG})`,
    );

    return NextResponse.json(response);
  } catch (err) {
    logError("esg-scorecard", `Generate failed: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}

// ─── Recommandation stratégique ───────────────────────────────

function buildRecommendation(
  env: number,
  soc: number,
  gov: number,
  overall: number,
  benchmark: number,
  companyName: string,
): string {
  const weakest = [
    { name: "Environnemental", score: env },
    { name: "Social", score: soc },
    { name: "Gouvernance", score: gov },
  ].sort((a, b) => a.score - b.score)[0];

  const diff = overall - benchmark;
  const diffStr = diff >= 0 ? `+${diff}` : `${diff}`;

  if (overall >= 75) {
    return `Performance ESG solide pour ${companyName} (${overall}/100, ${diffStr} pts vs secteur). Capitaliser sur la performance ${weakest.name.toLowerCase()} (${weakest.score}/100) — seul axe sous le seuil d'excellence. Communiquer le score consolidé aux investisseurs et intégrer au rapport RSE annuel.`;
  }
  if (overall >= benchmark) {
    return `${companyName} se positionne au-dessus de la moyenne sectorielle (${overall}/100 vs ${benchmark}). Le pilier ${weakest.name.toLowerCase()} (${weakest.score}/100) reste le point de vigilance. Renforcer la communication sur ce pilier et cibler un plan d'action 12 mois pour rattraper le benchmark.`;
  }
  if (overall >= 50) {
    return `${companyName} est sous la moyenne sectorielle (${overall}/100 vs ${benchmark}). Priorité : le pilier ${weakest.name.toLowerCase()} (${weakest.score}/100) — écart le plus marqué. Construire une feuille de route ESG avec objectifs trimestriels chiffrés. Activer la cellule RSE et préparer une note pour le COMEX.`;
  }
  return `Performance ESG fragile pour ${companyName} (${overall}/100 vs ${benchmark}). Le pilier ${weakest.name.toLowerCase()} (${weakest.score}/100) requiert une action immédiate. Recommandation : audit ESG externe sous 30 jours, plan de redressement présenté au conseil d'administration, et communication proactive auprès des régulateurs et investisseurs.`;
}
