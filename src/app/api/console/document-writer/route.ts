// ═══════════════════════════════════════════════════════════════
//  POST /api/console/document-writer
//
//  Skill 6 — HarchIQ Document Writer (the killer feature).
//
//  The user types a free-form French request:
//    "Analyse ma réputation vs Marjane"
//    "Prépare un brief pour le COMEX"
//    "Résume l'actualité de la semaine"
//
//  We detect intent from the prompt, fetch REAL data from the
//  intelligence stack (brand-health, articles, sentiment, sources,
//  competitors, risk themes), and assemble a 4-6 section structured
//  document with French prose. Each section is delivered as plain
//  paragraphs (strings) so the React popup can TYPE them out
//  character-by-character — that's the live-document effect.
//
//  Two text-generation paths:
//    • If ZAI_API_KEY is set  → GLM-4 rewrites the body paragraphs
//      (intro, analysis, weekly narratives, conclusion) using the
//      real data as context, producing richer analytical French.
//    • Otherwise              → rule-based French prose derived
//      directly from the metrics (always available, always real).
//
//  This is NOT chat. This is a deliverable that writes itself.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { logInfo, logError } from "@/lib/logger";
import { createZAI } from "@/lib/zai-wrapper";

export const dynamic = "force-dynamic";
export const maxDuration = 45;

// ─── RESPONSE TYPES (returned to client) ─────────────────────────

export type DocumentSectionType =
  | "heading"
  | "body"
  | "data"
  | "recommendation";

export interface DocumentMetric {
  label: string;
  value: string;
  trend?: string;
  sentiment?: "positive" | "negative" | "neutral";
}

export interface DocumentSection {
  title: string;
  type: DocumentSectionType;
  paragraphs: string[];
  metrics?: DocumentMetric[];
}

export interface DocumentWriterResponse {
  meta: {
    companyName: string;
    sector: string | null;
    generatedAt: string;
    date: string;
    prompt: string;
    mode: DetectedMode;
    enhancedByLLM: boolean;
  };
  sections: DocumentSection[];
}

// ─── INTENT DETECTION ─────────────────────────────────────────────

type DetectedMode =
  | "competitor"
  | "comex"
  | "weekly"
  | "crisis"
  | "sentiment"
  | "reputation";

interface DetectedIntent {
  mode: DetectedMode;
  competitorHint: string | null;
}

function detectIntent(prompt: string): DetectedIntent {
  const p = prompt.toLowerCase();

  // Competitor hint — extract a brand name if mentioned
  const knownBrands = [
    "marjane", "maroc telecom", "iam",
    "attijari", "attijariwafa", "bmce", "bank of africa", "boa",
    "bcp", "banque centrale populaire", "cih",
    "inwi", "orange maroc", "saham", "wana",
    "ocp", "managem", "cosumar", "laprophan",
  ];
  let competitorHint: string | null = null;
  for (const b of knownBrands) {
    if (p.includes(b)) {
      competitorHint = b.replace(/\b\w/g, (c) => c.toUpperCase());
      break;
    }
  }

  if (
    p.includes("concurrent") ||
    p.includes("concurrence") ||
    p.includes("compétit") ||
    p.includes("benchmark") ||
    p.includes("versus") ||
    p.includes(" vs ") ||
    p.includes("comparatif") ||
    competitorHint
  ) {
    return { mode: "competitor", competitorHint };
  }
  if (
    p.includes("comex") ||
    p.includes("codir") ||
    p.includes("comité de direction") ||
    p.includes("conseil d'administration") ||
    p.includes("board") ||
    p.includes("exécutif") ||
    p.includes("direction générale") ||
    p.includes("comité exec")
  ) {
    return { mode: "comex", competitorHint };
  }
  if (
    p.includes("crise") ||
    p.includes("alerte") ||
    p.includes("risque") ||
    p.includes("négatif") ||
    p.includes("incident") ||
    p.includes("attaque") ||
    p.includes("bad buzz")
  ) {
    return { mode: "crisis", competitorHint };
  }
  if (
    p.includes("semaine") ||
    p.includes("hebdo") ||
    p.includes("résumé") ||
    p.includes("resume") ||
    p.includes("actualité") ||
    p.includes("actualite") ||
    p.includes("revue de presse") ||
    p.includes("rapport hebdo")
  ) {
    return { mode: "weekly", competitorHint };
  }
  if (
    p.includes("sentiment") ||
    p.includes("tonalité") ||
    p.includes("tonalite") ||
    p.includes("perception") ||
    p.includes("image")
  ) {
    return { mode: "sentiment", competitorHint };
  }
  return { mode: "reputation", competitorHint };
}

// ─── POST HANDLER ─────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companyId = session.user.companyId;
  if (!companyId) {
    return NextResponse.json({ error: "No company linked" }, { status: 400 });
  }

  let prompt = "";
  try {
    const body = await req.json();
    prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!prompt) {
    return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
  }
  if (prompt.length > 500) {
    return NextResponse.json({ error: "Prompt too long (max 500 chars)" }, { status: 400 });
  }

  const intent = detectIntent(prompt);

  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
    const oneDayAgo = new Date(now.getTime() - 86400000);

    // ─── Parallel data fetch (real intelligence stack) ─────────
    const [
      company,
      reputationScore,
      articles30d,
      articles7d,
      articles24hCount,
      totalCompanyArticles,
      negativeAlerts,
      topSources,
      topArticles,
      riskAssessments,
      competitorsRaw,
      totalSectorArticles,
    ] = await Promise.all([
      prisma.company.findUnique({
        where: { id: companyId },
        select: { id: true, name: true, sector: true },
      }),
      prisma.reputationScore.findFirst({
        where: { companyId },
        orderBy: { calculatedAt: "desc" },
      }),
      prisma.article.findMany({
        where: { companyId, publishedAt: { gte: thirtyDaysAgo } },
        select: {
          sentimentScore: true,
          sentimentLabel: true,
          publishedAt: true,
          source: true,
          title: true,
        },
        orderBy: { publishedAt: "asc" },
        take: 5000,
      }),
      prisma.article.findMany({
        where: { companyId, publishedAt: { gte: sevenDaysAgo } },
        select: {
          sentimentLabel: true,
          sentimentScore: true,
          source: true,
          title: true,
          url: true,
          publishedAt: true,
          summary: true,
        },
        orderBy: { publishedAt: "desc" },
        take: 1000,
      }),
      prisma.article.count({
        where: { companyId, publishedAt: { gte: oneDayAgo } },
      }),
      prisma.article.count({ where: { companyId } }),
      prisma.article.findMany({
        where: {
          companyId,
          sentimentLabel: "negative",
          publishedAt: { gte: sevenDaysAgo },
        },
        orderBy: { publishedAt: "desc" },
        take: 6,
        select: {
          title: true,
          source: true,
          publishedAt: true,
          url: true,
          sentimentScore: true,
        },
      }),
      prisma.article.groupBy({
        by: ["source"],
        where: { companyId, publishedAt: { gte: sevenDaysAgo } },
        _count: true,
        orderBy: { _count: { source: "desc" } },
        take: 5,
      }),
      prisma.article.findMany({
        where: { companyId },
        orderBy: { publishedAt: "desc" },
        select: {
          title: true,
          source: true,
          publishedAt: true,
          url: true,
          sentimentLabel: true,
          summary: true,
        },
        take: 8,
      }),
      prisma.riskAssessment.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { category: true, articleCount: true, riskScore: true },
      }),
      // Sector competitors (incl. self) — same pattern as comex-report
      (async () => {
        const me = await prisma.company.findUnique({
          where: { id: companyId },
          select: { id: true, name: true, sector: true },
        });
        if (!me) return [];
        const others = await prisma.company.findMany({
          where: { sector: me.sector, id: { not: companyId } },
          take: 4,
          select: { id: true, name: true },
        });
        return [
          { id: me.id, name: me.name, isYou: true },
          ...others.map((c) => ({ id: c.id, name: c.name, isYou: false })),
        ];
      })(),
      prisma.article.count({
        where: { publishedAt: { gte: thirtyDaysAgo } },
      }),
    ]);

    // ─── Derived metrics ───────────────────────────────────────
    const positive7d = articles7d.filter((a) => a.sentimentLabel === "positive").length;
    const negative7d = articles7d.filter((a) => a.sentimentLabel === "negative").length;
    const neutral7d = articles7d.filter((a) => a.sentimentLabel === "neutral").length;
    const total7d = articles7d.length || 1;
    const posPct = Math.round((positive7d / total7d) * 100);
    const neutralPct = Math.round((neutral7d / total7d) * 100);
    const negPct = Math.round((negative7d / total7d) * 100);
    const sentimentIndex = posPct - negPct;

    const negativeShare = negative7d / total7d;
    const crisisScore = Math.min(
      100,
      Math.round(negativeShare * 60 + Math.min(25, (articles24hCount / 50) * 25)),
    );
    const crisisLevel: "safe" | "watch" | "warning" | "critical" =
      crisisScore >= 75 ? "critical"
      : crisisScore >= 50 ? "warning"
      : crisisScore >= 25 ? "watch"
      : "safe";

    const score = reputationScore?.overall ?? 50;
    const scoreTrend =
      reputationScore?.trend === "up" ? 2
      : reputationScore?.trend === "down" ? -3
      : 0;

    // ─── Competitor SOV (only if competitor mode) ──────────────
    let competitors: Array<{
      name: string;
      mentions: number;
      sentiment: number;
      shareOfVoice: number;
      isYou: boolean;
    }> = [];
    let yourRank = 0;
    let yourShare = 0;
    if (intent.mode === "competitor" || intent.mode === "comex") {
      const competitorCounts = await Promise.all(
        competitorsRaw.map(async (c) => {
          const count = await prisma.article.count({
            where: { companyId: c.id, publishedAt: { gte: thirtyDaysAgo } },
          });
          const sentimentAgg = await prisma.article.aggregate({
            where: { companyId: c.id, publishedAt: { gte: thirtyDaysAgo } },
            _avg: { sentimentScore: true },
          });
          return {
            name: c.name,
            isYou: c.isYou,
            mentions: count,
            sentiment: sentimentAgg._avg.sentimentScore ?? 0,
          };
        }),
      );
      const totalMentions = competitorCounts.reduce((s, c) => s + c.mentions, 0) || 1;
      competitors = competitorCounts
        .map((c) => ({
          name: c.name,
          mentions: c.mentions,
          sentiment: Math.round(c.sentiment * 100) / 100,
          shareOfVoice: Math.round((c.mentions / totalMentions) * 1000) / 10,
          isYou: c.isYou,
        }))
        .sort((a, b) => b.mentions - a.mentions);
      const yourIdx = competitors.findIndex((c) => c.isYou);
      yourRank = yourIdx >= 0 ? yourIdx + 1 : 0;
      yourShare = yourIdx >= 0 ? competitors[yourIdx].shareOfVoice : 0;
    }

    // ─── Context payload (passed to rule-based + LLM) ──────────
    const ctx: DocumentContext = {
      companyName: company?.name ?? "Votre entreprise",
      sector: company?.sector ?? null,
      prompt,
      mode: intent.mode,
      competitorHint: intent.competitorHint,
      score,
      scoreTrend,
      posPct,
      neutralPct,
      negPct,
      sentimentIndex,
      totalArticles30d: articles30d.length,
      totalArticles7d: articles7d.length,
      totalArticles24h: articles24hCount,
      totalCompanyArticles,
      crisisScore,
      crisisLevel,
      negativeAlerts: negativeAlerts.map((a) => ({
        title: a.title,
        source: a.source,
        date: a.publishedAt?.toISOString() ?? null,
      })),
      topSources: topSources.map((s) => ({ source: s.source, count: s._count })),
      topArticles: topArticles.slice(0, 5).map((a) => ({
        title: a.title,
        source: a.source,
        date: a.publishedAt?.toISOString() ?? null,
        sentiment: a.sentimentLabel ?? "neutral",
        summary: a.summary ?? null,
      })),
      riskThemes: riskAssessments
        .filter((r) => (r.articleCount ?? 0) > 0)
        .slice(0, 3)
        .map((r) => ({
          category: r.category,
          articleCount: r.articleCount ?? 0,
          riskScore: r.riskScore ?? 0,
        })),
      competitors,
      yourRank,
      yourShare,
      competitorCount: competitors.length,
      sectorCoverage: totalSectorArticles,
      generatedAt: now.toISOString(),
      date: now.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    };

    // ─── Build sections (rule-based, always available) ─────────
    let sections = buildSections(ctx);

    // ─── Optional GLM-4 enhancement of body paragraphs ─────────
    let enhancedByLLM = false;
    if (process.env.ZAI_API_KEY) {
      try {
        const enhanced = await enhanceBodySectionsWithLLM(sections, ctx);
        if (enhanced) {
          sections = enhanced;
          enhancedByLLM = true;
        }
      } catch (err) {
        logError(
          "document-writer",
          `LLM enhancement failed, falling back to rule-based: ${err}`,
        );
      }
    }

    const response: DocumentWriterResponse = {
      meta: {
        companyName: ctx.companyName,
        sector: ctx.sector,
        generatedAt: ctx.generatedAt,
        date: ctx.date,
        prompt,
        mode: intent.mode,
        enhancedByLLM,
      },
      sections,
    };

    logInfo(
      "document-writer",
      `Document generated for ${ctx.companyName}: mode=${intent.mode}, sections=${sections.length}, llm=${enhancedByLLM}, articles=${totalCompanyArticles}`,
    );

    return NextResponse.json(response);
  } catch (err) {
    logError("document-writer", `Generate failed: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}

// ═══════════════════════════════════════════════════════════════
//  DOCUMENT CONTEXT (shared by rule-based + LLM generators)
// ═══════════════════════════════════════════════════════════════

interface DocumentContext {
  companyName: string;
  sector: string | null;
  prompt: string;
  mode: DetectedMode;
  competitorHint: string | null;
  score: number;
  scoreTrend: number;
  posPct: number;
  neutralPct: number;
  negPct: number;
  sentimentIndex: number;
  totalArticles30d: number;
  totalArticles7d: number;
  totalArticles24h: number;
  totalCompanyArticles: number;
  crisisScore: number;
  crisisLevel: "safe" | "watch" | "warning" | "critical";
  negativeAlerts: Array<{ title: string; source: string; date: string | null }>;
  topSources: Array<{ source: string; count: number }>;
  topArticles: Array<{
    title: string;
    source: string;
    date: string | null;
    sentiment: string;
    summary: string | null;
  }>;
  riskThemes: Array<{ category: string; articleCount: number; riskScore: number }>;
  competitors: Array<{
    name: string;
    mentions: number;
    sentiment: number;
    shareOfVoice: number;
    isYou: boolean;
  }>;
  yourRank: number;
  yourShare: number;
  competitorCount: number;
  sectorCoverage: number;
  generatedAt: string;
  date: string;
}

// ═══════════════════════════════════════════════════════════════
//  RULE-BASED SECTION BUILDER (always runs, real data)
// ═══════════════════════════════════════════════════════════════

function buildSections(ctx: DocumentContext): DocumentSection[] {
  const sections: DocumentSection[] = [];

  // 1. TITLE (heading) — paragraphs[0] is the H1 title, paragraphs[1] is the
  //    subtitle line. Both are typed char-by-char by the client; having them
  //    in the paragraphs array (rather than just `title`) gives each its own
  //    typing cursor/counter.
  const title = documentTitle(ctx);
  const subtitle = documentSubtitle(ctx);
  sections.push({
    title,
    type: "heading",
    paragraphs: [title, subtitle],
  });

  // 2. INTRODUCTION (body)
  sections.push({
    title: "Introduction",
    type: "body",
    paragraphs: introParagraphs(ctx),
  });

  // 3. WEEKLY NARRATIVES (body) — for weekly / comex modes
  if (ctx.mode === "weekly" || ctx.mode === "comex") {
    sections.push({
      title: "Narratifs de la semaine",
      type: "body",
      paragraphs: weeklyNarrativesParagraphs(ctx),
    });
  }

  // 4. KEY DATA (data)
  sections.push({
    title: "Données clés",
    type: "data",
    paragraphs: dataCaption(ctx),
    metrics: dataMetrics(ctx),
  });

  // 5. COMPETITOR ANALYSIS (data + body) — for competitor mode
  if (ctx.mode === "competitor") {
    sections.push({
      title: "Analyse concurrentielle",
      type: "data",
      paragraphs: competitorParagraphs(ctx),
      metrics: competitorMetrics(ctx),
    });
  }

  // 6. CRISIS WATCH (data) — for crisis mode
  if (ctx.mode === "crisis") {
    sections.push({
      title: "Veille crise",
      type: "data",
      paragraphs: crisisParagraphs(ctx),
      metrics: crisisMetrics(ctx),
    });
  }

  // 7. ANALYSIS (body)
  sections.push({
    title: "Analyse",
    type: "body",
    paragraphs: analysisParagraphs(ctx),
  });

  // 8. RECOMMENDATIONS (recommendation)
  sections.push({
    title: "Recommandations HarchIQ",
    type: "recommendation",
    paragraphs: recommendationParagraphs(ctx),
  });

  // 9. CONCLUSION (body)
  sections.push({
    title: "Conclusion",
    type: "body",
    paragraphs: conclusionParagraphs(ctx),
  });

  return sections;
}

// ─── TITLE & SUBTITLE ────────────────────────────────────────────

function documentTitle(ctx: DocumentContext): string {
  switch (ctx.mode) {
    case "competitor":
      return ctx.competitorHint
        ? `Analyse concurrentielle — ${ctx.companyName} vs ${ctx.competitorHint}`
        : `Analyse concurrentielle — ${ctx.companyName}`;
    case "comex":
      return `Brief COMEX — ${ctx.companyName}`;
    case "weekly":
      return `Revue de presse hebdomadaire — ${ctx.companyName}`;
    case "crisis":
      return `Veille crise — ${ctx.companyName}`;
    case "sentiment":
      return `Analyse de sentiment — ${ctx.companyName}`;
    case "reputation":
    default:
      return `Analyse de réputation — ${ctx.companyName}`;
  }
}

function documentSubtitle(ctx: DocumentContext): string {
  const articleLabel =
    ctx.totalCompanyArticles === 0
      ? "collecte en cours"
      : `${ctx.totalCompanyArticles} articles analysés`;
  return `${ctx.date} · ${articleLabel} · Généré par HarchIQ`;
}

// ─── INTRODUCTION ────────────────────────────────────────────────

function introParagraphs(ctx: DocumentContext): string[] {
  if (ctx.totalCompanyArticles === 0) {
    return [
      `Ce document présente une analyse de la réputation de ${ctx.companyName} à partir de la demande exprimée. La collecte d'articles est en cours d'initialisation: les premières mentions seront agrégées sous 24 à 48 heures.`,
      `À ce stade, le moteur HarchIQ a indexé ${ctx.sectorCoverage} articles sectoriels sur les 30 derniers jours. Dès que le volume minimum sera atteint pour ${ctx.companyName}, ce document sera alimenté automatiquement par les données réelles.`,
    ];
  }

  const scope = scopeLabel(ctx);
  return [
    `Demande: « ${ctx.prompt} ». Ce document synthétise ${ctx.totalArticles7d} mentions collectées sur les 7 derniers jours (${ctx.totalArticles30d} sur 30 jours) et ${ctx.totalArticles24h} articles dans les dernières 24 heures. ${scope}.`,
    `L'analyse s'appuie sur le moteur d'intelligence HarchIQ, qui agrège presse en ligne, sources réglementaires et flux sociaux, puis applique un scoring de sentiment et une détection de narratifs. Les recommandations en fin de document sont priorisées en fonction du contexte détecté.`,
  ];
}

function scopeLabel(ctx: DocumentContext): string {
  switch (ctx.mode) {
    case "competitor":
      return ctx.competitorHint
        ? `Comparaison focalisée sur ${ctx.competitorHint} et le secteur ${ctx.sector ?? "non spécifié"}`
        : `Comparaison avec ${ctx.competitorCount} concurrents sectoriels`;
    case "comex":
      return "Format synthétique adapté à un comité de direction";
    case "weekly":
      return "Périmètre hebdomadaire, focus sur les narratifs émergents";
    case "crisis":
      return "Priorité aux signaux négatifs et alertes actives";
    case "sentiment":
      return "Focus sur la tonalité et la répartition sentimentale";
    case "reputation":
    default:
      return "Périmètre réputationnel global";
  }
}

// ─── WEEKLY NARRATIVES ───────────────────────────────────────────

function weeklyNarrativesParagraphs(ctx: DocumentContext): string[] {
  if (ctx.topSources.length === 0) {
    return [
      `Aucune source majeure détectée sur la période. La veille continue alimente automatiquement cette section dès qu'un volume suffisant est atteint.`,
    ];
  }
  const sources = ctx.topSources
    .slice(0, 3)
    .map((s, i) => `${i + 1}. ${s.source} (${s.count} mentions)`)
    .join(" · ");
  const topArticle = ctx.topArticles[0];
  const topLine = topArticle
    ? `Le titre le plus repris cette semaine: « ${topArticle.title} » (${topArticle.source}).`
    : "";
  return [
    `Les sources dominantes sur 7 jours sont: ${sources}. La concentration médiatique indique les relais prioritaires pour toute action de communication.`,
    `${topLine} La diversité des sources reste un indicateur de santé réputationnelle: une concentration excessive sur une seule source augmente la vulnérabilité aux narratifs unilatéraux.`,
  ];
}

// ─── DATA SECTION (KPIs) ─────────────────────────────────────────

function dataCaption(ctx: DocumentContext): string[] {
  if (ctx.totalCompanyArticles === 0) {
    return [
      `Les indicateurs ci-dessous reflètent l'état de collecte. Ils seront alimentés automatiquement dès que le volume minimum d'articles sera atteint.`,
    ];
  }
  return [
    `Indicateurs calculés en temps réel sur les 7 derniers jours. Le score de réputation est un composite HarchIQ (sentiment, volume, viralité, sources) normalisé sur 100.`,
  ];
}

function dataMetrics(ctx: DocumentContext): DocumentMetric[] {
  const healthLabel =
    ctx.score >= 70 ? "Solide"
    : ctx.score >= 50 ? "Stable"
    : ctx.score >= 30 ? "Fragile"
    : "Critique";
  return [
    {
      label: "Score de réputation",
      value: `${ctx.score}/100`,
      trend: ctx.scoreTrend !== 0 ? `${ctx.scoreTrend > 0 ? "+" : ""}${ctx.scoreTrend} pts` : undefined,
      sentiment: ctx.score >= 60 ? "positive" : ctx.score >= 40 ? "neutral" : "negative",
    },
    {
      label: "Mentions 7 jours",
      value: String(ctx.totalArticles7d),
      trend: ctx.totalArticles24h > 0 ? `${ctx.totalArticles24h} dernières 24h` : undefined,
      sentiment: "neutral",
    },
    {
      label: "Sentiment positif",
      value: `${ctx.posPct}%`,
      sentiment: "positive",
    },
    {
      label: "Sentiment négatif",
      value: `${ctx.negPct}%`,
      trend: ctx.crisisLevel === "safe" ? "sous contrôle" : "à surveiller",
      sentiment: ctx.negPct > 30 ? "negative" : "neutral",
    },
    {
      label: "Indice de sentiment",
      value: ctx.sentimentIndex > 0 ? `+${ctx.sentimentIndex}` : String(ctx.sentimentIndex),
      sentiment: ctx.sentimentIndex > 5 ? "positive" : ctx.sentimentIndex < -5 ? "negative" : "neutral",
    },
    {
      label: "Niveau de crise",
      value: crisisLabelFr(ctx.crisisLevel),
      sentiment: ctx.crisisLevel === "safe" ? "positive" : ctx.crisisLevel === "watch" ? "neutral" : "negative",
    },
    {
      label: "État de santé",
      value: healthLabel,
      sentiment: ctx.score >= 60 ? "positive" : ctx.score >= 40 ? "neutral" : "negative",
    },
  ];
}

function crisisLabelFr(level: string): string {
  switch (level) {
    case "critical": return "Critique";
    case "warning": return "Alerte";
    case "watch": return "Vigilance";
    default: return "Sous contrôle";
  }
}

// ─── COMPETITOR ANALYSIS ─────────────────────────────────────────

function competitorParagraphs(ctx: DocumentContext): string[] {
  if (ctx.competitors.length === 0) {
    return [
      `Aucun concurrent sectoriel identifié dans la base. La détection concurrentielle s'appuie sur le champ "sector" défini pour ${ctx.companyName}. Ajoutez des concurrents dans les paramètres pour activer le benchmarking.`,
    ];
  }
  const leader = ctx.competitors[0];
  const youLine =
    ctx.yourRank > 0
      ? `${ctx.companyName} se positionne au rang ${ctx.yourRank}/${ctx.competitorCount} avec ${ctx.yourShare}% de part de voix.`
      : `${ctx.companyName} n'est pas encore positionnée dans le benchmark sectoriel.`;
  return [
    `${youLine} Le leader sectoriel sur 30 jours est ${leader.name} avec ${leader.mentions} mentions (${leader.shareOfVoice}% de part de voix).`,
    ctx.competitorHint
      ? `Concurrent ciblé demandé: ${ctx.competitorHint}. La comparaison s'appuie sur les données sectorielles disponibles dans la base HarchIQ. Pour une analyse approfondie de ce concurrent spécifique, ajoutez-le au suivi entreprise.`
      : `L'écart de sentiment entre ${ctx.companyName} et la moyenne sectorielle constitue le premier signal d'action. Un écart supérieur à 10 points justifie une stratégie de communication différenciée.`,
  ];
}

function competitorMetrics(ctx: DocumentContext): DocumentMetric[] {
  return ctx.competitors.slice(0, 5).map((c) => ({
    label: c.isYou ? `${c.name} (vous)` : c.name,
    value: `${c.shareOfVoice}% SOV`,
    trend: `${c.mentions} mentions`,
    sentiment: c.sentiment > 0.1 ? "positive" : c.sentiment < -0.1 ? "negative" : "neutral",
  }));
}

// ─── CRISIS WATCH ────────────────────────────────────────────────

function crisisParagraphs(ctx: DocumentContext): string[] {
  if (ctx.negativeAlerts.length === 0) {
    return [
      `Aucune mention négative détectée sur les 7 derniers jours. Le niveau de crise est ${crisisLabelFr(ctx.crisisLevel).toLowerCase()} (${ctx.crisisScore}/100). La veille continue reste active.`,
    ];
  }
  const alerts = ctx.negativeAlerts
    .slice(0, 3)
    .map((a, i) => `${i + 1}. ${a.title} — ${a.source}`)
    .join("\n");
  return [
    `${ctx.negativeAlerts.length} mentions négatives détectées sur 7 jours. Niveau de crise: ${crisisLabelFr(ctx.crisisLevel)} (${ctx.crisisScore}/100). Les principales alertes:`,
    alerts,
  ];
}

function crisisMetrics(ctx: DocumentContext): DocumentMetric[] {
  return [
    {
      label: "Score de crise",
      value: `${ctx.crisisScore}/100`,
      sentiment: ctx.crisisLevel === "safe" ? "positive" : ctx.crisisLevel === "critical" ? "negative" : "neutral",
    },
    {
      label: "Niveau",
      value: crisisLabelFr(ctx.crisisLevel),
      sentiment: ctx.crisisLevel === "safe" ? "positive" : "negative",
    },
    {
      label: "Mentions négatives 7j",
      value: String(ctx.negativeAlerts.length),
      sentiment: ctx.negativeAlerts.length === 0 ? "positive" : "negative",
    },
    {
      label: "Articles 24h",
      value: String(ctx.totalArticles24h),
      sentiment: ctx.totalArticles24h > 10 ? "negative" : "neutral",
    },
  ];
}

// ─── ANALYSIS ────────────────────────────────────────────────────

function analysisParagraphs(ctx: DocumentContext): string[] {
  if (ctx.totalCompanyArticles === 0) {
    return [
      `L'analyse approfondie sera disponible dès que le volume d'articles sera suffisant. Le moteur HarchIQ requiert un minimum de 10 mentions pour produire une analyse robuste du sentiment et des narratifs.`,
    ];
  }

  const sentimentLine =
    ctx.sentimentIndex > 10
      ? `Le bilan sentimental est positif (+${ctx.sentimentIndex}), porté par ${ctx.posPct}% de mentions favorables.`
      : ctx.sentimentIndex < -10
      ? `Le bilan sentimental est négatif (${ctx.sentimentIndex}), avec ${ctx.negPct}% de mentions défavorables.`
      : `Le bilan sentimental est équilibré (${ctx.sentimentIndex > 0 ? "+" : ""}${ctx.sentimentIndex}), avec une répartition ${ctx.posPct}% positif / ${ctx.negPct}% négatif.`;

  const crisisLine =
    ctx.crisisLevel === "critical"
      ? ` Le niveau de crise critique impose une réponse coordonnée immédiate.`
      : ctx.crisisLevel === "warning"
      ? ` Le niveau d'alerte justifie une vigilance renforcée et un brief Dircom.`
      : ctx.crisisLevel === "watch"
      ? ` Une vigilance de routine est maintenue.`
      : ` Aucun signal de crise actif détecté.`;

  const riskLine =
    ctx.riskThemes.length > 0
      ? ` Les thématiques à risque identifiées: ${ctx.riskThemes
          .map((r) => `${r.category} (${r.articleCount} articles)`)
          .join(", ")}.`
      : ` Aucune thématique à risque structurelle détectée sur la période.`;

  return [
    `${sentimentLine}${crisisLine} Le score composite de réputation s'établit à ${ctx.score}/100${ctx.scoreTrend !== 0 ? ` (${ctx.scoreTrend > 0 ? "+" : ""}${ctx.scoreTrend} pts vs période précédente)` : ""}.`,
    `${riskLine} La diversité des sources (${ctx.topSources.length} sources principales sur 7 jours) et le volume de mention (${ctx.totalArticles24h} articles 24h) indiquent un niveau d'attention médiatique ${ctx.totalArticles24h > 10 ? "élevé" : "modéré"}.`,
  ];
}

// ─── RECOMMENDATIONS ─────────────────────────────────────────────

function recommendationParagraphs(ctx: DocumentContext): string[] {
  const recs: string[] = [];

  if (ctx.totalCompanyArticles === 0) {
    recs.push(
      `Patienter 24-48h pour atteindre le volume minimum d'articles. Activer les sources RSS sectorielles et les flux sociaux si nécessaire.`,
    );
    recs.push(
      `Configurer les concurrents et les thématiques surveillées dans les paramètres du console pour enrichir le benchmarking.`,
    );
    return recs;
  }

  if (ctx.crisisLevel === "critical") {
    recs.push(
      `P0 — Activer la cellule de crise. ${ctx.negPct}% de mentions négatives sur 7 jours. Préparer un communiqué public et coordonner la réponse Dircom + juridique sous 24h.`,
    );
  } else if (ctx.crisisLevel === "warning") {
    recs.push(
      `P0 — Brief Dircom préparatoire. ${ctx.negPct}% de sentiment négatif détecté. Préparer une stratégie de communication préventive et activer la veille renforcée 24/7.`,
    );
  }

  if (ctx.negPct > 30 && ctx.crisisLevel !== "critical") {
    recs.push(
      `P1 — Neutraliser les narratifs négatifs. ${ctx.negPct}% des mentions sont négatives. Cartographier les sources critiques et préparer une stratégie de réponse ciblée.`,
    );
  }

  if (ctx.mode === "competitor" && ctx.yourShare > 0 && ctx.yourShare < 20) {
    recs.push(
      `P1 — Renforcer la présence média. Part de voix à ${ctx.yourShare}% (rang ${ctx.yourRank}/${ctx.competitorCount}). Investir dans les relations presse et le contenu pour gagner 5-10 points de SOV sur le trimestre.`,
    );
  }

  if (ctx.posPct > 50 && ctx.crisisLevel === "safe") {
    recs.push(
      `P2 — Capitaliser sur le momentum positif. ${ctx.posPct}% de sentiment positif. Préparer un communiqué de succès et amplifier via les canaux favorables.`,
    );
  } else if (ctx.score < 50 && ctx.crisisLevel !== "critical") {
    recs.push(
      `P2 — Audit de réputation approfondi. Score à ${ctx.score}/100. Commander un audit qualitatif des narratifs et définir une feuille de route semestrielle.`,
    );
  }

  if (ctx.topSources.length > 0) {
    recs.push(
      `P2 — Cultiver les sources favorables. ${ctx.topSources[0].source} est la source principale (${ctx.topSources[0].count} mentions). Établir un contact privilégié pour amplifier les narratifs positifs.`,
    );
  }

  recs.push(
    `P3 — Revue mensuelle des KPIs réputationnels. Suivre l'évolution du score composite et ajuster la stratégie de communication en fonction des tendances observées.`,
  );

  return recs.slice(0, 5);
}

// ─── CONCLUSION ──────────────────────────────────────────────────

function conclusionParagraphs(ctx: DocumentContext): string[] {
  if (ctx.totalCompanyArticles === 0) {
    return [
      `Document préliminaire. La collecte est en cours d'initialisation. Régénérez ce document sous 48h pour une analyse complète basée sur les données réelles agrégées par le moteur HarchIQ.`,
    ];
  }

  const healthWord =
    ctx.score >= 70 ? "solide"
    : ctx.score >= 50 ? "stable"
    : ctx.score >= 30 ? "fragile"
    : "critique";

  return [
    `${ctx.companyName} présente une réputation ${healthWord} (${ctx.score}/100) sur la période analysée. ${ctx.totalArticles7d} mentions collectées sur 7 jours, ${ctx.totalArticles30d} sur 30 jours. Le moteur HarchIQ maintient une veille continue et mettra à jour ce document à chaque régénération.`,
    `Pour approfondir: activez le Briefing Matinal quotidien, configurez les alertes WhatsApp en cas de détection de crise, et consultez le rapport COMEX hebdomadaire pour une vue board-ready.`,
  ];
}

// ═══════════════════════════════════════════════════════════════
//  GLM-4 ENHANCEMENT (optional, real-data-grounded)
//
//  Replaces body paragraphs (intro / weekly narratives / analysis /
//  conclusion) with LLM-generated French prose that still cites the
//  exact metrics. Data + recommendation sections are kept rule-based
//  (they're structured, no prose benefit).
// ═══════════════════════════════════════════════════════════════

async function enhanceBodySectionsWithLLM(
  sections: DocumentSection[],
  ctx: DocumentContext,
): Promise<DocumentSection[] | null> {
  const zai = await createZAI();

  const bodySections = sections.filter((s) => s.type === "body");
  const bodySpec = bodySections.map((s, i) => ({
    index: i,
    title: s.title,
    currentParagraphs: s.paragraphs,
  }));

  const contextBlock = `ENTREPRISE: ${ctx.companyName}
SECTEUR: ${ctx.sector ?? "non spécifié"}
MODE DEMANDÉ: ${ctx.mode}
DEMANDE UTILISATEUR: ${ctx.prompt}
SCORE DE RÉPUTATION: ${ctx.score}/100 (tendance ${ctx.scoreTrend > 0 ? "+" : ""}${ctx.scoreTrend} pts)
MENTIONS 7 JOURS: ${ctx.totalArticles7d}
MENTIONS 30 JOURS: ${ctx.totalArticles30d}
ARTICLES 24H: ${ctx.totalArticles24h}
SENTIMENT POSITIF: ${ctx.posPct}%
SENTIMENT NEUTRE: ${ctx.neutralPct}%
SENTIMENT NÉGATIF: ${ctx.negPct}%
INDICE DE SENTIMENT: ${ctx.sentimentIndex}
NIVEAU DE CRISE: ${crisisLabelFr(ctx.crisisLevel)} (${ctx.crisisScore}/100)
SOURCES PRINCIPALES: ${ctx.topSources.map((s) => `${s.source} (${s.count})`).join(", ") || "aucune"}
THÉMATIQUES À RISQUE: ${ctx.riskThemes.map((r) => `${r.category} (${r.articleCount})`).join(", ") || "aucune"}
CONCURRENTS: ${ctx.competitors.map((c) => `${c.name} ${c.isYou ? "(vous)" : ""} ${c.shareOfVoice}% SOV`).join(", ") || "aucun"}
RANG CONCURRENTIEL: ${ctx.yourRank > 0 ? `${ctx.yourRank}/${ctx.competitorCount}` : "non positionné"}`;

  const userPrompt = `Tu es un analyste en intelligence réputationnelle. Réécris les paragraphes des sections "body" ci-dessous en français professionnel, concis, analytique. Garde TOUS les chiffres exacts. Pas d'émojis, pas de markdown, juste du texte brut. Chaque section doit avoir 1 à 3 paragraphes de 150 à 350 caractères maximum.

${contextBlock}

SECTIONS À RÉÉCRIRE (JSON):
${JSON.stringify(bodySpec, null, 2)}

Réponds UNIQUEMENT avec un JSON valide de la forme:
{"sections": [{"index": 0, "paragraphs": ["...", "..."]}, ...]}`;

  try {
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "Tu es un assistant qui rédige des documents d'analyse réputationnelle en français. Tu réponds uniquement avec du JSON valide, aucun texte autour.",
        },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
      max_tokens: 1800,
      thinking: { type: "disabled" as const },
    });

    const raw = (completion?.choices?.[0]?.message?.content as string | undefined)?.trim();
    if (!raw) return null;

    // Strip markdown code fences if present
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned) as {
      sections: Array<{ index: number; paragraphs: string[] }>;
    };
    if (!parsed?.sections || !Array.isArray(parsed.sections)) return null;

    // Map LLM output back onto body sections
    const enhancedMap = new Map<number, string[]>();
    for (const s of parsed.sections) {
      if (
        typeof s.index === "number" &&
        Array.isArray(s.paragraphs) &&
        s.paragraphs.every((p) => typeof p === "string" && p.length > 0)
      ) {
        enhancedMap.set(s.index, s.paragraphs.slice(0, 3));
      }
    }
    if (enhancedMap.size === 0) return null;

    let bodyIdx = 0;
    const enhanced = sections.map((section) => {
      if (section.type !== "body") return section;
      const newParagraphs = enhancedMap.get(bodyIdx);
      bodyIdx += 1;
      if (!newParagraphs) return section;
      return { ...section, paragraphs: newParagraphs };
    });

    return enhanced;
  } catch (err) {
    logError("document-writer", `LLM parse failed: ${err}`);
    return null;
  }
}
