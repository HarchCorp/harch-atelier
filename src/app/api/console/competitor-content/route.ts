// ═══════════════════════════════════════════════════════════════
//  POST /api/console/competitor-content
//
//  Skill 15 — Competitor Content Analysis.
//
//  For each competitor (same sector as the user's company, up to 5):
//    - articleCount    : articles published in the last 30 days
//    - frequency       : articles per week (count / 30 * 7, 1 decimal)
//    - avgSentiment    : mean sentimentScore in [-1, +1], 2 decimals
//    - topKeywords     : top 8 tokens by title frequency (FR stopwords
//                        stripped, diacritics folded, len ≥ 4)
//    - recentArticles  : 3 most recent articles (title, source, date,
//                        url, sentimentLabel)
//    - sov             : share of voice = company articles / sector
//                        articles over 30 days (0-100, rounded)
//
//  Returns: { competitors: CompetitorContent[], meta }
//
//  Auth required. Demo users / missing companyId fall back to a
//  realistic Moroccan banking-sector snapshot (same pattern as the
//  competitor-matrix route) so the popup is testable end-to-end.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { isDemoEmail } from "@/lib/demo-session";
import { prisma } from "@/lib/db";
import { logInfo, logError } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

interface RecentArticle {
  title: string;
  source: string;
  date: string | null;
  url: string;
  sentiment: string;
}

interface CompetitorContent {
  name: string;
  articleCount: number;
  frequency: number; // articles per week, 1 decimal
  avgSentiment: number; // -1..+1, 2 decimals
  topKeywords: string[]; // top 8 by frequency
  recentArticles: RecentArticle[]; // 3 most recent
  sov: number; // 0..100
}

// French + generic English stopwords + common news boilerplate tokens.
// Folded to ASCII and lowercased before matching (see extractKeywords).
const STOPWORDS = new Set([
  "le", "la", "les", "un", "une", "des", "du", "de", "et", "a", "au", "aux",
  "en", "dans", "pour", "par", "sur", "avec", "sans", "ou", "ou", "ne", "pas",
  "qui", "que", "quoi", "dont", "ce", "cet", "cette", "ces", "son", "sa", "ses",
  "leur", "leurs", "notre", "votre", "il", "elle", "ils", "elles", "on", "nous",
  "vous", "se", "est", "sont", "ete", "etre", "avoir", "plus", "moins",
  "the", "and", "for", "with", "from", "this", "that", "after", "before",
  "maroc", "marocaine", "marocain", "apres", "avant", "depuis", "entre",
  "vers", "selon", "ainsi", "aussi", "mais", "donc", "car", "comme",
  "tout", "tous", "toute", "toutes", "ans", "mois", "jours", "jour",
  "accueil", "lire", "suite", "video", "direct", "explique",
  "annonce", "nouveaux", "nouvelle", "nouvelles",
]);

function fold(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function extractKeywords(titles: string[], limit = 8): string[] {
  const counts = new Map<string, number>();
  for (const raw of titles) {
    if (!raw) continue;
    const tokens = fold(raw)
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !STOPWORDS.has(w));
    for (const tok of tokens) {
      counts.set(tok, (counts.get(tok) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([k]) => k);
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Demo users (or anyone without a companyId) get the banking-sector
  // demo snapshot so the popup is fully testable without real data.
  if (session.user.isDemo || isDemoEmail(session.user.email)) {
    return NextResponse.json(buildDemo());
  }

  const companyId = session.user.companyId;
  if (!companyId) {
    return NextResponse.json(buildDemo());
  }

  try {
    const myCompany = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true, sector: true },
    });
    if (!myCompany) {
      return NextResponse.json(buildDemo());
    }

    // Up to 5 competitors in the same sector.
    const competitorsDb = await prisma.company.findMany({
      where: { sector: myCompany.sector, id: { not: companyId } },
      take: 5,
      select: { id: true, name: true },
    });

    if (competitorsDb.length === 0) {
      return NextResponse.json(buildDemo());
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

    // Sector denominator for share-of-voice.
    const sectorCompanyIds = (
      await prisma.company.findMany({
        where: { sector: myCompany.sector },
        select: { id: true },
      })
    ).map((c) => c.id);

    const sectorTotalArticles = await prisma.article.count({
      where: {
        companyId: { in: sectorCompanyIds },
        publishedAt: { gte: thirtyDaysAgo },
      },
    });

    const competitors: CompetitorContent[] = await Promise.all(
      competitorsDb.map(async (c) => {
        // Pull the 50 most recent 30-day articles: 3 feed the
        // "recent articles" cards, all 50 feed keyword extraction.
        const [articleCount30d, sentimentAgg, recentRows] = await Promise.all([
          prisma.article.count({
            where: { companyId: c.id, publishedAt: { gte: thirtyDaysAgo } },
          }),
          prisma.article.aggregate({
            where: { companyId: c.id, publishedAt: { gte: thirtyDaysAgo } },
            _avg: { sentimentScore: true },
          }),
          prisma.article.findMany({
            where: { companyId: c.id, publishedAt: { gte: thirtyDaysAgo } },
            orderBy: { publishedAt: "desc" },
            take: 50,
            select: {
              title: true,
              source: true,
              publishedAt: true,
              url: true,
              sentimentLabel: true,
            },
          }),
        ]);

        const rawSentiment = sentimentAgg._avg.sentimentScore ?? 0;
        const avgSentiment = Math.round(rawSentiment * 100) / 100;

        // Frequency: articles per week. 30-day window ≈ 4.286 weeks.
        const frequency = Math.round((articleCount30d / 30) * 7 * 10) / 10;

        const sov =
          sectorTotalArticles > 0
            ? Math.round((articleCount30d / sectorTotalArticles) * 100)
            : 0;

        const topKeywords = extractKeywords(
          recentRows.map((r) => r.title),
          8,
        );

        const recentArticles: RecentArticle[] = recentRows
          .slice(0, 3)
          .map((r) => ({
            title: r.title,
            source: r.source,
            date: r.publishedAt ? r.publishedAt.toISOString() : null,
            url: r.url,
            sentiment: r.sentimentLabel ?? "neutral",
          }));

        return {
          name: c.name,
          articleCount: articleCount30d,
          frequency,
          avgSentiment,
          topKeywords,
          recentArticles,
          sov,
        };
      }),
    );

    logInfo(
      "console.competitor-content",
      `Competitor content generated for ${myCompany.name}: ${competitors.length} competitors (sector=${myCompany.sector})`,
    );

    return NextResponse.json({
      competitors,
      meta: {
        sector: myCompany.sector,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    logError(
      "console.competitor-content",
      `[competitor-content] error: ${err}`,
    );
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// ─── Demo fallback ──────────────────────────────────────────────
// Realistic Moroccan banking-sector snapshot — same 4 competitors
// as the competitor-matrix demo so the two skills stay visually
// consistent when an analyst toggles between them in demo mode.
// Titles are intentionally ASCII (no accents) because the route's
// keyword extractor folds diacritics anyway; the popup displays
// them verbatim.
function buildDemo() {
  const isoNow = new Date().toISOString();
  const competitors: CompetitorContent[] = [
    {
      name: "Bank of Africa",
      articleCount: 184,
      frequency: 42.9,
      avgSentiment: 0.21,
      topKeywords: ["resultats", "benefice", "afrique", "subsidiary", "dividende", "expansion", "rating", "sahel"],
      recentArticles: [
        { title: "Bank of Africa publie un benefice net en hausse de 14% au T3", source: "L'Economiste", date: isoNow, url: "#", sentiment: "positive" },
        { title: "BOA renforce sa presence en Afrique de l'Ouest", source: "Medias24", date: isoNow, url: "#", sentiment: "positive" },
        { title: "La filiale sahelienne de BOA annonce un plan d'investissement", source: "Aujourd'hui Le Maroc", date: isoNow, url: "#", sentiment: "neutral" },
      ],
      sov: 28,
    },
    {
      name: "BCP",
      articleCount: 142,
      frequency: 33.1,
      avgSentiment: -0.08,
      topKeywords: ["resultats", "groupe", "banque", "centrale", "populaire", "rating", "agences", "rural"],
      recentArticles: [
        { title: "BCM : la Banque Centrale Populaire revoit sa strategie digitale", source: "L'Economiste", date: isoNow, url: "#", sentiment: "neutral" },
        { title: "Le groupe BCP etend son reseau en zone rurale", source: "Medias24", date: isoNow, url: "#", sentiment: "positive" },
        { title: "BCP : degradation du rating par Moody's", source: "Les Eco", date: isoNow, url: "#", sentiment: "negative" },
      ],
      sov: 22,
    },
    {
      name: "CIH Bank",
      articleCount: 96,
      frequency: 22.4,
      avgSentiment: 0.15,
      topKeywords: ["tourisme", "digital", "banque", "innovation", "mobile", "startup", "credit", "jeunes"],
      recentArticles: [
        { title: "CIH Bank lance un nouveau service bancaire mobile", source: "Medias24", date: isoNow, url: "#", sentiment: "positive" },
        { title: "La banque des startups : CIH vise le segment tech", source: "L'Economiste", date: isoNow, url: "#", sentiment: "positive" },
        { title: "CIH : financement de 200 MMDH pour le tourisme", source: "Aujourd'hui Le Maroc", date: isoNow, url: "#", sentiment: "neutral" },
      ],
      sov: 15,
    },
    {
      name: "Credit du Maroc",
      articleCount: 78,
      frequency: 18.2,
      avgSentiment: -0.03,
      topKeywords: ["credit", "immobilier", "pme", "financement", "groupe", "holcim", "cession", "resultats"],
      recentArticles: [
        { title: "Credit du Maroc : cession a Holcim finalisee", source: "Les Eco", date: isoNow, url: "#", sentiment: "neutral" },
        { title: "CDM accompagne les PME dans leur transition energetique", source: "L'Economiste", date: isoNow, url: "#", sentiment: "positive" },
        { title: "Resultats en repli pour Credit du Maroc au S1", source: "Medias24", date: isoNow, url: "#", sentiment: "negative" },
      ],
      sov: 12,
    },
  ];

  return {
    competitors,
    meta: {
      sector: "Banque",
      generatedAt: new Date().toISOString(),
    },
  };
}
