// ═══════════════════════════════════════════════════════════════
//  POST /api/console/hespress-digest
//
//  Skill 4 — Hespress Comment Digest.
//  Scrapes Hespress (Morocco's #1 news site, 100k+ comments/day) for
//  the user's company and returns a structured digest:
//    - Top 10 articles mentioning the company
//    - Top 50 comments (sorted by sentiment + likes)
//    - Sentiment breakdown (positive/neutral/negative)
//    - Language breakdown (fr/ar/darija/mixed)
//    - Trending topics extracted from comment corpus
//
//  This is NOT chat. This is a structured deliverable — the REAL
//  pulse of Morocco through Hespress comments.
//
//  Scraping takes 30-60s (10 articles × 1s + comments parsing).
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { logInfo, logError } from "@/lib/logger";
import {
  scrapeHespressForCompany,
  type HespressArticle,
  type HespressComment,
} from "@/lib/scrapers/hespress-scraper";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // scraping 10 articles + comments can take 30-60s

// ─── Types ─────────────────────────────────────────────────────
interface DigestComment {
  id: string;
  text: string;
  author: string;
  likes: number;
  language: "fr" | "ar" | "darija" | "mixed";
  sentiment: "positive" | "neutral" | "negative" | null;
  articleTitle: string;
  articleUrl: string;
}

interface DigestArticle {
  title: string;
  url: string;
  category: string | null;
  publishedAt: string | null;
  commentCount: number;
  sentiment: { positive: number; neutral: number; negative: number };
}

interface HespressDigest {
  meta: {
    companyName: string;
    sector: string | null;
    generatedAt: string;
    date: string;
  };
  stats: {
    articleCount: number;
    commentCount: number;
    positivePct: number;
    neutralPct: number;
    negativePct: number;
  };
  languageBreakdown: {
    fr: number;
    ar: number;
    darija: number;
    mixed: number;
  };
  topArticles: DigestArticle[];
  topComments: DigestComment[];
  topNegative: DigestComment[];
  topPositive: DigestComment[];
  trendingTopics: Array<{ term: string; count: number }>;
}

// ─── Trending topic extraction ─────────────────────────────────
//  Lexicon-free tokenization: extract Latin (4+ chars) and Arabic
//  (3+ chars) word tokens, drop stopwords, count freq, return top 12.
function extractTrendingTopics(
  comments: HespressComment[],
): Array<{ term: string; count: number }> {
  const stopwords = new Set([
    // French stopwords
    "le", "la", "les", "un", "une", "des", "du", "de", "et", "ou", "mais",
    "donc", "car", "que", "qui", "quoi", "dont", "cest", "cela", "ceci",
    "elle", "elles", "eux", "sont", "etre", "avait", "avoir", "cette",
    "pour", "par", "avec", "sans", "sur", "sous", "dans", "entre", "vers",
    "chez", "depuis", "pendant", "plus", "moins", "tres", "trop", "bien",
    "aussi", "encore", "deja", "toujours", "rien", "tout", "tous", "toute",
    "toutes", "fait", "faire", "comme", "alors", "nest", "quand", "comment",
    "pourquoi", "quel", "quelle", "quels", "quelles", "leur", "leurs",
    "notre", "nos", "votre", "vos", "mon", "ma", "mes", "ton", "ta", "tes",
    "son", "sa", "ses",
    // English stopwords
    "the", "and", "but", "for", "with", "from", "this", "that", "have",
    "has", "had", "was", "were", "are", "not", "you", "they", "them",
    "their", "what", "when", "will", "would", "could", "should",
  ]);

  const freq = new Map<string, number>();

  for (const c of comments) {
    const text = c.text.toLowerCase();
    // Latin tokens: 4+ chars (excludes "le", "la", "the"...)
    // Arabic tokens: 3+ chars (Arabic stopwords are usually 2 chars)
    const tokens =
      text.match(/[a-zéèêëàâäïîôöùûüç]{4,}|[\u0600-\u06FF]{3,}/g) ?? [];

    for (const tok of tokens) {
      if (stopwords.has(tok)) continue;
      freq.set(tok, (freq.get(tok) ?? 0) + 1);
    }
  }

  return Array.from(freq.entries())
    .map(([term, count]) => ({ term, count }))
    .filter((t) => t.count >= 2)
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
}

// ─── Map scraper comment → digest comment ──────────────────────
function toDigestComment(
  c: HespressComment,
  articleTitle: string,
  articleUrl: string,
): DigestComment {
  return {
    id: c.id,
    text: c.text,
    author: c.author,
    likes: c.likes,
    language: c.language,
    sentiment: c.sentiment,
    articleTitle,
    articleUrl,
  };
}

// ─── POST handler ──────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companyId = session.user.companyId;
  if (!companyId) {
    return NextResponse.json(
      { error: "No company linked to this account" },
      { status: 400 },
    );
  }

  try {
    // Optional body: { companyName?: string } — override the DB company name
    let body: { companyName?: string } = {};
    try {
      body = await req.json();
    } catch {
      // Body may be empty; fall back to DB company name
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true, sector: true },
    });

    const companyName =
      body.companyName?.trim() || company?.name?.trim() || "";

    if (!companyName) {
      return NextResponse.json(
        { error: "Company name required" },
        { status: 400 },
      );
    }

    logInfo(
      "hespress-digest",
      `Generating digest for "${companyName}" (company ${companyId})`,
    );

    // ─── Scrape (30-60s) ──────────────────────────────────────
    const articles: HespressArticle[] = await scrapeHespressForCompany(
      companyName,
      10,
    );

    const now = new Date();

    // ─── Empty result: still return a structured digest ──────
    if (articles.length === 0) {
      logInfo(
        "hespress-digest",
        `No Hespress articles found for "${companyName}"`,
      );
      const emptyDigest: HespressDigest = {
        meta: {
          companyName,
          sector: company?.sector ?? null,
          generatedAt: now.toISOString(),
          date: now.toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        },
        stats: {
          articleCount: 0,
          commentCount: 0,
          positivePct: 0,
          neutralPct: 0,
          negativePct: 0,
        },
        languageBreakdown: { fr: 0, ar: 0, darija: 0, mixed: 0 },
        topArticles: [],
        topComments: [],
        topNegative: [],
        topPositive: [],
        trendingTopics: [],
      };
      return NextResponse.json(emptyDigest);
    }

    // ─── Flatten comments with article context ───────────────
    type FlattenedComment = HespressComment & {
      articleTitle: string;
      articleUrl: string;
    };
    const allComments: FlattenedComment[] = [];
    for (const article of articles) {
      for (const c of article.comments) {
        allComments.push({
          ...c,
          articleTitle: article.title,
          articleUrl: article.url,
        });
      }
    }

    // ─── Sentiment breakdown (% across all comments) ─────────
    const posCount = allComments.filter((c) => c.sentiment === "positive").length;
    const neuCount = allComments.filter((c) => c.sentiment === "neutral").length;
    const negCount = allComments.filter((c) => c.sentiment === "negative").length;
    const totalComments = allComments.length || 1;

    const sentimentPct = {
      positive: Math.round((posCount / totalComments) * 100),
      neutral: Math.round((neuCount / totalComments) * 100),
      negative: Math.round((negCount / totalComments) * 100),
    };

    // ─── Language breakdown ──────────────────────────────────
    const languageBreakdown = {
      fr: allComments.filter((c) => c.language === "fr").length,
      ar: allComments.filter((c) => c.language === "ar").length,
      darija: allComments.filter((c) => c.language === "darija").length,
      mixed: allComments.filter((c) => c.language === "mixed").length,
    };

    // ─── Top 50 comments (sentiment-weighted + likes) ────────
    //  Score = sentimentWeight × 10 + likes
    //  Positive/negative get weight 2 (polarized = interesting),
    //  Neutral gets weight 0.5 (less interesting).
    const sentimentWeight = (s: HespressComment["sentiment"]): number => {
      if (s === "positive" || s === "negative") return 2;
      if (s === "neutral") return 0.5;
      return 0;
    };

    const topComments: DigestComment[] = [...allComments]
      .sort(
        (a, b) =>
          sentimentWeight(b.sentiment) * 10 + b.likes -
          (sentimentWeight(a.sentiment) * 10 + a.likes),
      )
      .slice(0, 50)
      .map((c) => toDigestComment(c, c.articleTitle, c.articleUrl));

    // ─── Top 5 negative comments (by likes) ──────────────────
    const topNegative: DigestComment[] = [...allComments]
      .filter((c) => c.sentiment === "negative")
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 5)
      .map((c) => toDigestComment(c, c.articleTitle, c.articleUrl));

    // ─── Top 5 positive comments (by likes) ──────────────────
    const topPositive: DigestComment[] = [...allComments]
      .filter((c) => c.sentiment === "positive")
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 5)
      .map((c) => toDigestComment(c, c.articleTitle, c.articleUrl));

    // ─── Top 10 articles ─────────────────────────────────────
    const topArticles: DigestArticle[] = articles.slice(0, 10).map((a) => ({
      title: a.title,
      url: a.url,
      category: a.category,
      publishedAt: a.publishedAt?.toISOString() ?? null,
      commentCount: a.commentCount,
      sentiment: a.sentiment,
    }));

    // ─── Trending topics ─────────────────────────────────────
    const trendingTopics = extractTrendingTopics(allComments);

    const digest: HespressDigest = {
      meta: {
        companyName,
        sector: company?.sector ?? null,
        generatedAt: now.toISOString(),
        date: now.toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      },
      stats: {
        articleCount: articles.length,
        commentCount: allComments.length,
        positivePct: sentimentPct.positive,
        neutralPct: sentimentPct.neutral,
        negativePct: sentimentPct.negative,
      },
      languageBreakdown,
      topArticles,
      topComments,
      topNegative,
      topPositive,
      trendingTopics,
    };

    logInfo(
      "hespress-digest",
      `Digest ready: ${articles.length} articles, ${allComments.length} comments, ${trendingTopics.length} trending topics`,
    );

    return NextResponse.json(digest);
  } catch (err) {
    logError("hespress-digest", `Failed: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}
