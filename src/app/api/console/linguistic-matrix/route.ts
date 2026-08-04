import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { isDemoEmail } from "@/lib/demo-session";
import { prisma } from "@/lib/db";
import {
  LINGUISTIC_MATRIX,
  LINGUISTIC_WEIGHTS_SUMMARY,
  calculateGlobalRiskIndex,
  routeContent,
  type LanguageSentimentSnapshot,
  type ContentType,
} from "@/lib/harchiq/linguistic-matrix";

// ═══════════════════════════════════════════════════════════════
//  GET /api/console/linguistic-matrix
//
//  Returns the definitive linguistic matrix (35/35/20/10), the
//  current Global Risk Index (GRI) for the logged-in company, and
//  the cascade detection status.
//
//  Auth: requires session (brand-monitor, market-competitor, investment-bank)
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowedTypes = ["brand-monitor", "market-competitor", "investment-bank"];
  if (!allowedTypes.includes(session.user.accountType || "") && session.user.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden — linguistic matrix is for brand-monitor, market-competitor and investment-bank accounts" },
      { status: 403 },
    );
  }

  // Demo bypass
  if (session.user.isDemo || isDemoEmail(session.user.email)) {
    return NextResponse.json(buildDemoResponse());
  }

  try {
    // Get the company's recent articles + comments to compute real GRI
    const companyId = session.user.companyId;
    if (!companyId) {
      return NextResponse.json(buildDemoResponse());
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Fetch recent articles grouped by language
    const articles = await prisma.article.findMany({
      where: {
        companyId,
        publishedAt: { gte: sevenDaysAgo },
      },
      select: {
        sentimentLabel: true,
        sentimentScore: true,
        language: true,
        publishedAt: true,
      },
      take: 500,
    });

    // Fetch recent comments grouped by language
    const comments = await prisma.articleComment.findMany({
      where: {
        article: { companyId },
        scrapedAt: { gte: sevenDaysAgo },
      },
      select: {
        sentimentPolarity: true,
        sentimentScore: true,
        language: true,
        scrapedAt: true,
      },
      take: 500,
    });

    // Build language snapshots
    const snapshots = buildSnapshotsFromData(articles, comments);
    const gri = calculateGlobalRiskIndex(snapshots);

    return NextResponse.json({
      matrix: LINGUISTIC_WEIGHTS_SUMMARY,
      matrixDetail: Object.values(LINGUISTIC_MATRIX),
      gri,
      routingExample: {
        contentType: "article" as ContentType,
        result: routeContent("article", "french"),
      },
      contentApplicability: {
        article: LINGUISTIC_MATRIX.msa.code,
        comment: "darija over-indexed",
        regulatory: "msa + french only",
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[linguistic-matrix] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}

// ─── Build snapshots from DB data ──────────────────────────────

function buildSnapshotsFromData(
  articles: Array<{ sentimentLabel: string | null; sentimentScore: number | null; language: string | null; publishedAt: Date | null }>,
  comments: Array<{ sentimentPolarity: string; sentimentScore: number; language: string; scrapedAt: Date }>,
): LanguageSentimentSnapshot[] {
  const now = Date.now();
  const hourMs = 60 * 60 * 1000;
  const sevenHoursAgo = now - 7 * hourMs;

  const langData: Record<string, { mentions: number; negative: number; sentimentSum: number; recentMentions: number }> = {
    msa: { mentions: 0, negative: 0, sentimentSum: 0, recentMentions: 0 },
    french: { mentions: 0, negative: 0, sentimentSum: 0, recentMentions: 0 },
    english: { mentions: 0, negative: 0, sentimentSum: 0, recentMentions: 0 },
    darija: { mentions: 0, negative: 0, sentimentSum: 0, recentMentions: 0 },
  };

  // Process articles (MSA, French, English — NO Darija)
  for (const a of articles) {
    const lang = mapLanguage(a.language);
    if (lang === "darija") continue; // articles never count as darija

    langData[lang].mentions++;
    if (a.sentimentScore !== null) langData[lang].sentimentSum += a.sentimentScore;
    if (a.sentimentLabel === "negative") langData[lang].negative++;
    if (a.publishedAt && a.publishedAt.getTime() > sevenHoursAgo) langData[lang].recentMentions++;
  }

  // Process comments (Darija over-indexed)
  for (const c of comments) {
    const lang = mapLanguage(c.language);
    langData[lang].mentions++;
    langData[lang].sentimentSum += c.sentimentScore;
    if (c.sentimentPolarity === "negative") langData[lang].negative++;
    if (c.scrapedAt.getTime() > sevenHoursAgo) langData[lang].recentMentions++;
  }

  return Object.entries(langData).map(([code, d]) => ({
    language: code as LanguageSentimentSnapshot["language"],
    mentionCount: d.mentions,
    avgSentiment: d.mentions > 0 ? d.sentimentSum / d.mentions : 0,
    negativeShare: d.mentions > 0 ? d.negative / d.mentions : 0,
    velocity: Math.round((d.recentMentions / 7) * 10) / 10, // mentions per hour (avg over 7h)
    trend: "stable" as const,
  }));
}

function mapLanguage(lang: string | null): "msa" | "french" | "english" | "darija" {
  if (!lang) return "french";
  const l = lang.toLowerCase();
  if (l.includes("ar") && !l.includes("darij")) return "msa";
  if (l.includes("darij")) return "darija";
  if (l.includes("fr")) return "french";
  if (l.includes("en")) return "english";
  if (l.includes("mixed")) return "darija"; // mixed counts as darija-weighted
  return "french";
}

// ─── Demo response (coherent with demo-session data) ───────────

function buildDemoResponse() {
  const snapshots: LanguageSentimentSnapshot[] = [
    { language: "msa", mentionCount: 142, avgSentiment: 0.12, negativeShare: 0.28, velocity: 8.4, trend: "stable" },
    { language: "french", mentionCount: 287, avgSentiment: -0.08, negativeShare: 0.38, velocity: 14.2, trend: "up" },
    { language: "english", mentionCount: 64, avgSentiment: 0.21, negativeShare: 0.15, velocity: 3.1, trend: "stable" },
    { language: "darija", mentionCount: 412, avgSentiment: -0.42, negativeShare: 0.58, velocity: 28.7, trend: "up" },
  ];
  const gri = calculateGlobalRiskIndex(snapshots);
  return {
    matrix: LINGUISTIC_WEIGHTS_SUMMARY,
    matrixDetail: Object.values(LINGUISTIC_MATRIX),
    gri,
    routingExample: {
      contentType: "comment" as ContentType,
      result: routeContent("comment", "darija"),
    },
    contentApplicability: {
      article: "msa + french + english (NO darija)",
      comment: "darija over-indexed",
      regulatory: "msa + french only",
    },
    generatedAt: new Date().toISOString(),
  };
}
