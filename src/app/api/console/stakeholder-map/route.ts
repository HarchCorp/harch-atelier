// ═══════════════════════════════════════════════════════════════
//  POST /api/console/stakeholder-map
//
//  Builds a stakeholder map — 8 categories mapped on an
//  Influence (1-5) × Sentiment (-1..+1) scatter grid with bubble
//  size = engagement level (0-100).
//
//  The 8 categories:
//    1. Gouvernement      — derived from regulatory articles whose
//                           source mentions a government body
//                           (ministère, gouvernement, présidence).
//    2. Régulateurs       — Article.sourceType = "regulatory"
//                           (BAM, AMMC, BVC, ONSSA, ANRT).
//    3. Médias            — Article.sourceType = "media"
//                           (default news / RSS feed articles).
//    4. Investisseurs     — Article.sourceType in ("market","financial")
//                           + ReputationScore.sentiment if present.
//    5. Employés          — InboundWhatsAppMessage internal stream
//                           (the IKEA loop — Dircom-flagged signals).
//    6. Clients           — ArticleComment (Hespress etc.) +
//                           WhatsApp inbound that isn't flagged-crisis.
//    7. ONG               — Article.title/content keyword detection
//                           (ONG, association, transparence, greenpeace,
//                           amnesty, anti-corruption).
//    8. Concurrents       — same-sector Company.findMany +
//                           CompanySettings.competitors list.
//
//  For each category returns:
//    { category, influence (1-5), sentiment (-1..1), engagement (0-100),
//      contact, lastInteraction (ISO), description }
//
//  Auth: requires session + company (requireUserCompany). Demo
//  sessions flow through the same path — demoFilter is spread into
//  every Article/Risk/Reputation query so demo data is isolated.
//
//  Skill ID: SKILL-9-STAKEHOLDER-MAP
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { logInfo, logError } from "@/lib/logger";
import { requireUserCompany } from "@/lib/harchiq/company-session";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// ─── Types (returned to the client) ─────────────────────────────

export type StakeholderCategory =
  | "Gouvernement"
  | "Régulateurs"
  | "Médias"
  | "Investisseurs"
  | "Employés"
  | "Clients"
  | "ONG"
  | "Concurrents";

export interface StakeholderRow {
  category: StakeholderCategory;
  influence: number;        // 1-5
  sentiment: number;        // -1..1
  engagement: number;       // 0-100
  contact: string;          // keyContact (human-readable)
  lastInteraction: string;  // ISO date or "—"
  description: string;
}

export interface StakeholderMapResponse {
  stakeholders: StakeholderRow[];
  meta: {
    companyName: string;
    sector: string | null;
    generatedAt: string;
    windowDays: number;
    source: "real" | "demo";
  };
}

// ─── Defaults per category ─────────────────────────────────────
// When real data is sparse (early-stage company, no articles yet),
// we fall back to these industry-standard defaults so the map is
// always informative.

const DEFAULTS: Record<
  StakeholderCategory,
  {
    influence: number;
    sentiment: number;
    engagement: number;
    contact: string;
    description: string;
  }
> = {
  Gouvernement: {
    influence: 5,
    sentiment: 0,
    engagement: 35,
    contact: "Ministère de l'Économie et des Finances",
    description:
      "Pouvoir exécutif — orientations sectorielles, lois de finances, audiences stratégiques.",
  },
  Régulateurs: {
    influence: 5,
    sentiment: 0,
    engagement: 40,
    contact: "AMMC · BAM · BVC · ONSSA",
    description:
      "Autorités de tutelle — conformité, transparence financière, décisions impacting le secteur.",
  },
  Médias: {
    influence: 4,
    sentiment: 0,
    engagement: 60,
    contact: "Rédactions nationales & presse économique",
    description:
      "Sources médiatiques grand public et spécialisées — relais du narratif public.",
  },
  Investisseurs: {
    influence: 5,
    sentiment: 0,
    engagement: 55,
    contact: "Actionnaires · Analystes · Investisseurs institutionnels",
    description:
      "Marchés financiers et détenteurs du capital — perception de la valeur et du risque.",
  },
  Employés: {
    influence: 3,
    sentiment: 0,
    engagement: 50,
    contact: "Directions RH & communication interne",
    description:
      "Collaborateurs et représentants du personnel — relais interne de la marque employeur.",
  },
  Clients: {
    influence: 4,
    sentiment: 0,
    engagement: 65,
    contact: "Service client & communauté digitale",
    description:
      "Utilisateurs finaux et clients B2B/B2C — voix du marché et bad-buzz organique.",
  },
  ONG: {
    influence: 3,
    sentiment: 0,
    engagement: 25,
    contact: "Transparency Maroc · réseaux associatifs",
    description:
      "Organisations non gouvernementales — vigilance RSE, droits humains, environnement.",
  },
  Concurrents: {
    influence: 4,
    sentiment: 0,
    engagement: 45,
    contact: "Concurrents directs du secteur",
    description:
      "Acteurs en concurrence directe — comparaison permanente, prises de parole rivales.",
  },
};

const WINDOW_DAYS = 30;

// ─── POST handler ──────────────────────────────────────────────

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

    // ─── Parallel batch 1: every category's raw signal at once ───
    const [
      companyRow,
      regulatoryArticles,
      mediaArticles,
      financialArticles,
      whatsappInbound,
      comments,
      ongArticles,
      competitors,
      competitorSettings,
      reputationScore,
    ] = await Promise.all([
      prisma.company.findUnique({
        where: { id: company.id },
        select: { name: true, sector: true, ticker: true },
      }),
      // Régulateurs + Gouvernement share the regulatory sourceType
      prisma.article.findMany({
        where: {
          sourceType: "regulatory",
          publishedAt: { gte: windowAgo },
          ...demoFilter,
        },
        orderBy: { publishedAt: "desc" },
        take: 50,
        select: {
          id: true, source: true, title: true, summary: true, content: true,
          sentimentScore: true, publishedAt: true,
        },
      }),
      // Médias
      prisma.article.findMany({
        where: {
          companyId: company.id,
          sourceType: "media",
          publishedAt: { gte: windowAgo },
          ...demoFilter,
        },
        orderBy: { publishedAt: "desc" },
        take: 200,
        select: {
          source: true, sentimentScore: true, publishedAt: true,
        },
      }),
      // Investisseurs (market + financial sourceTypes)
      prisma.article.findMany({
        where: {
          companyId: company.id,
          sourceType: { in: ["market", "financial"] },
          publishedAt: { gte: windowAgo },
          ...demoFilter,
        },
        orderBy: { publishedAt: "desc" },
        take: 100,
        select: { source: true, sentimentScore: true, publishedAt: true },
      }),
      // Employés + Clients (WhatsApp inbound). NB: InboundWhatsAppMessage
      // has no isDemo column — it's a per-message table, not a
      // company-scoped one. We do NOT spread demoFilter here.
      prisma.inboundWhatsAppMessage.findMany({
        orderBy: { receivedAt: "desc" },
        take: 100,
        select: {
          id: true, fromName: true, body: true, status: true,
          sentimentScore: true, crisisScore: true, receivedAt: true,
        },
      }),
      // Clients — ArticleComment (Hespress etc.)
      prisma.articleComment.findMany({
        where: {
          article: { companyId: company.id, ...demoFilter },
        },
        orderBy: { publishedAt: "desc" },
        take: 200,
        select: { sentimentScore: true, publishedAt: true, language: true },
      }),
      // ONG — keyword search on company articles
      prisma.article.findMany({
        where: {
          companyId: company.id,
          publishedAt: { gte: windowAgo },
          OR: [
            { title: { contains: "ONG", mode: "insensitive" } },
            { title: { contains: "association", mode: "insensitive" } },
            { title: { contains: "transparence", mode: "insensitive" } },
            { title: { contains: "greenpeace", mode: "insensitive" } },
            { title: { contains: "amnesty", mode: "insensitive" } },
            { title: { contains: "anticorruption", mode: "insensitive" } },
            { title: { contains: "anti-corruption", mode: "insensitive" } },
            { title: { contains: "droits humains", mode: "insensitive" } },
            { content: { contains: "ONG", mode: "insensitive" } },
            { content: { contains: "association", mode: "insensitive" } },
            { content: { contains: "transparence", mode: "insensitive" } },
            { content: { contains: "greenpeace", mode: "insensitive" } },
            { content: { contains: "amnesty", mode: "insensitive" } },
          ],
          ...demoFilter,
        },
        orderBy: { publishedAt: "desc" },
        take: 30,
        select: {
          source: true, title: true, sentimentScore: true, publishedAt: true,
        },
      }),
      // Concurrents — same-sector companies (excluding self). Uses
      // company.sector (the requireUserCompany-guaranteed field) rather
      // than the awaited companyRow, since both are inside Promise.all.
      prisma.company.findMany({
        where: {
          sector: company.sector,
          id: { not: company.id },
        },
        take: 4,
        select: { id: true, name: true },
      }),
      // CompanySettings.competitors (configured list)
      prisma.companySettings.findUnique({
        where: { companyId: company.id },
        select: { competitors: true, monitoredSources: true },
      }),
      // Latest reputation score (sentiment component)
      prisma.reputationScore.findFirst({
        where: { companyId: company.id, ...demoFilter },
        orderBy: { calculatedAt: "desc" },
        select: { overall: true, sentiment: true, calculatedAt: true },
      }),
    ]);

    // ─── Build each stakeholder row ─────────────────────────────

    const stakeholders: StakeholderRow[] = [];

    // 1. Gouvernement — regulatory articles whose source/title hints
    //    at a government body (ministère, gouvernement, présidence,
    //    palais, parlement, chef du gouvernement). Falls back to
    //    defaults if none.
    {
      const govArticles = regulatoryArticles.filter((a) => {
        const hay = `${a.source ?? ""} ${a.title ?? ""}`.toLowerCase();
        return (
          hay.includes("minist") ||
          hay.includes("gouvernement") ||
          hay.includes("présidence") ||
          hay.includes("presidence") ||
          hay.includes("palais") ||
          hay.includes("parlement") ||
          hay.includes("chef du gouvernement")
        );
      });
      const def = DEFAULTS.Gouvernement;
      const sentiment = avgSentiment(govArticles) ?? def.sentiment;
      const last = lastDate(govArticles.map((a) => a.publishedAt));
      stakeholders.push({
        category: "Gouvernement",
        influence: def.influence,
        sentiment: round(sentiment, 2),
        engagement: clampEngagement(30 + govArticles.length * 6),
        contact: def.contact,
        lastInteraction: last ?? "—",
        description: def.description,
      });
    }

    // 2. Régulateurs — regulatory articles NOT classified as
    //    gouvernement. The regulator name is derived from the source.
    {
      const regArticles = regulatoryArticles.filter((a) => {
        const hay = `${a.source ?? ""} ${a.title ?? ""}`.toLowerCase();
        return !(
          hay.includes("minist") ||
          hay.includes("gouvernement") ||
          hay.includes("présidence") ||
          hay.includes("presidence") ||
          hay.includes("palais") ||
          hay.includes("parlement")
        );
      });
      const def = DEFAULTS.Régulateurs;
      const sentiment = avgSentiment(regArticles) ?? def.sentiment;
      const last = lastDate(regArticles.map((a) => a.publishedAt));
      const topRegulator = deriveRegulatorName(
        regArticles[0]?.source ?? "",
      );
      stakeholders.push({
        category: "Régulateurs",
        influence: def.influence,
        sentiment: round(sentiment, 2),
        engagement: clampEngagement(35 + regArticles.length * 5),
        contact: topRegulator,
        lastInteraction: last ?? "—",
        description: def.description,
      });
    }

    // 3. Médias — media-type articles. Influence depends on source
    //    diversity (more distinct sources = higher influence).
    {
      const sources = new Set(
        mediaArticles
          .map((a) => a.source?.toLowerCase().trim())
          .filter((s): s is string => Boolean(s)),
      );
      const def = DEFAULTS.Médias;
      const sentiment = avgSentiment(mediaArticles) ?? def.sentiment;
      const last = lastDate(mediaArticles.map((a) => a.publishedAt));
      const influence = clamp(
        3 + Math.min(2, Math.floor(sources.size / 5)),
        1,
        5,
      );
      const topSource = topSourceName(
        mediaArticles.map((a) => a.source),
      );
      stakeholders.push({
        category: "Médias",
        influence,
        sentiment: round(sentiment, 2),
        engagement: clampEngagement(40 + Math.min(40, mediaArticles.length)),
        contact: topSource ?? def.contact,
        lastInteraction: last ?? "—",
        description: def.description,
      });
    }

    // 4. Investisseurs — market+financial articles + reputation score.
    {
      const def = DEFAULTS.Investisseurs;
      const artSentiment = avgSentiment(financialArticles);
      const repSentiment = reputationScore?.sentiment ?? null;
      // Prefer reputationScore.sentiment (already -1..1) when present;
      // else article avg; else default.
      const sentiment =
        repSentiment != null
          ? repSentiment / 100
          : artSentiment ?? def.sentiment;
      const last = lastDate(financialArticles.map((a) => a.publishedAt));
      const influence = def.influence;
      stakeholders.push({
        category: "Investisseurs",
        influence,
        sentiment: round(sentiment, 2),
        engagement: clampEngagement(
          30 + Math.min(50, financialArticles.length * 3),
        ),
        contact: def.contact,
        lastInteraction:
          last ?? reputationScore?.calculatedAt?.toISOString() ?? "—",
        description: def.description,
      });
    }

    // 5. Employés — WhatsApp inbound flagged as "internal" signal.
    //    We treat WhatsApp messages as a proxy for employé word-of-mouth
    //    (the IKEA loop is the Dircom forwarding internal-group signals).
    {
      const def = DEFAULTS.Employés;
      const empMessages = whatsappInbound.filter(
        (m) => m.status === "responded" || m.crisisScore < 40,
      );
      const sentiment =
        empMessages.length > 0
          ? empMessages.reduce((s, m) => s + m.sentimentScore, 0) /
            empMessages.length
          : def.sentiment;
      const last = lastDate(empMessages.map((m) => m.receivedAt));
      stakeholders.push({
        category: "Employés",
        influence: def.influence,
        sentiment: round(sentiment, 2),
        engagement: clampEngagement(30 + Math.min(40, empMessages.length * 4)),
        contact: def.contact,
        lastInteraction: last ?? "—",
        description: def.description,
      });
    }

    // 6. Clients — ArticleComment sentiment + flagged WhatsApp.
    {
      const def = DEFAULTS.Clients;
      const cliMessages = whatsappInbound.filter(
        (m) => m.status === "flagged" || m.crisisScore >= 40,
      );
      // Mix comments + flagged WhatsApp as "client voice"
      const allSentiments: number[] = [
        ...comments.map((c) => c.sentimentScore),
        ...cliMessages.map((m) => m.sentimentScore),
      ];
      const sentiment =
        allSentiments.length > 0
          ? allSentiments.reduce((s, v) => s + v, 0) / allSentiments.length
          : def.sentiment;
      const lastDates: (Date | null)[] = [
        ...comments.map((c) => c.publishedAt),
        ...cliMessages.map((m) => m.receivedAt),
      ];
      const last = lastDate(lastDates);
      stakeholders.push({
        category: "Clients",
        influence: def.influence,
        sentiment: round(sentiment, 2),
        engagement: clampEngagement(40 + Math.min(40, allSentiments.length)),
        contact: def.contact,
        lastInteraction: last ?? "—",
        description: def.description,
      });
    }

    // 7. ONG — keyword-detected articles about NGOs/associations.
    {
      const def = DEFAULTS.ONG;
      const sentiment = avgSentiment(ongArticles) ?? def.sentiment;
      const last = lastDate(ongArticles.map((a) => a.publishedAt));
      // If no NGO mentions, ONG engagement is minimal (dormant).
      const engagement =
        ongArticles.length === 0
          ? 15
          : clampEngagement(25 + ongArticles.length * 8);
      const influence = ongArticles.length === 0 ? 2 : def.influence;
      stakeholders.push({
        category: "ONG",
        influence,
        sentiment: round(sentiment, 2),
        engagement,
        contact: def.contact,
        lastInteraction: last ?? "—",
        description: def.description,
      });
    }

    // 8. Concurrents — top same-sector competitor (real) + the
    //    configured competitors list.
    {
      const def = DEFAULTS.Concurrents;
      const configuredList = parseCompetitors(competitorSettings?.competitors);
      const topCompetitorName =
        competitors[0]?.name ?? configuredList[0] ?? def.contact;
      // Sentiment: we use the company's own reputation overall as a
      // proxy inverted (if our rep is high, competitors are
      // "negative" toward us, and vice versa). This avoids an extra
      // round-trip per competitor.
      const competitorPressure =
        competitors.length + configuredList.length;
      const influence = clamp(
        3 + Math.min(2, Math.floor(competitorPressure / 2)),
        1,
        5,
      );
      const sentiment =
        reputationScore?.overall != null
          ? -((reputationScore.overall - 50) / 100)
          : def.sentiment;
      stakeholders.push({
        category: "Concurrents",
        influence,
        sentiment: round(sentiment, 2),
        engagement: clampEngagement(35 + competitorPressure * 4),
        contact: topCompetitorName,
        lastInteraction: "—",
        description: def.description,
      });
    }

    const response: StakeholderMapResponse = {
      stakeholders,
      meta: {
        companyName: companyRow?.name ?? company.name,
        sector: companyRow?.sector ?? company.sector,
        generatedAt: now.toISOString(),
        windowDays: WINDOW_DAYS,
        source: "real",
      },
    };

    logInfo(
      "stakeholder-map",
      `Stakeholder map generated for ${company.name}: ${stakeholders.length} categories, sector=${company.sector}`,
    );

    return NextResponse.json(response);
  } catch (err) {
    logError("stakeholder-map", `Generate failed: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}

// ─── Helpers ───────────────────────────────────────────────────

interface Sentimented {
  sentimentScore: number | null;
}

function avgSentiment<T extends Sentimented>(rows: T[]): number | null {
  const valid = rows.filter((r) => r.sentimentScore != null);
  if (valid.length === 0) return null;
  return (
    valid.reduce((s, r) => s + (r.sentimentScore as number), 0) / valid.length
  );
}

function lastDate(dates: (Date | null)[]): string | null {
  const valid = dates.filter((d): d is Date => d != null);
  if (valid.length === 0) return null;
  const max = valid.reduce(
    (m, d) => (d.getTime() > m.getTime() ? d : m),
    valid[0],
  );
  return max.toISOString();
}

function topSourceName(sources: (string | null)[]): string | null {
  const counts = new Map<string, number>();
  for (const s of sources) {
    if (!s) continue;
    const k = s.trim();
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  if (counts.size === 0) return null;
  let best = "";
  let bestCount = 0;
  for (const [k, v] of counts) {
    if (v > bestCount) {
      best = k;
      bestCount = v;
    }
  }
  return best;
}

function deriveRegulatorName(source: string): string {
  const s = source.toLowerCase();
  if (s.includes("bam")) return "Bank Al-Maghrib (BAM)";
  if (s.includes("ammc")) return "Autorité Marocaine du Marché des Capitaux (AMMC)";
  if (s.includes("bvc")) return "Bourse des Valeurs de Casablanca (BVC)";
  if (s.includes("onssa")) return "Office National de Sécurité Sanitaire (ONSSA)";
  if (s.includes("anrt")) return "Agence Nationale de Réglementation des Télécoms (ANRT)";
  return source || DEFAULTS.Régulateurs.contact;
}

function parseCompetitors(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((x): x is string => typeof x === "string");
    }
  } catch {
    // Not JSON — split on commas as a fallback
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function clampEngagement(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function round(n: number, decimals: number): number {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}
