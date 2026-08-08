import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { logError } from "@/lib/logger";
import {
  requireUserCompany,
  demoFilterFromSession,
} from "@/lib/harchiq/company-session";

// ═══════════════════════════════════════════════════════════════
//  GET /api/console/entity-network
//
//  Returns entity relationships for force-directed graph charts.
//  Nodes = entities (with mention count + avg sentiment), links =
//  co-occurrence weight (entities mentioned together in the same
//  article).
//
//  Source of entities:
//   1. EntityMention records (linked to Entity.name) — preferred,
//      gives proper co-occurrence via articleId.
//   2. Fallback: extract proper-noun tokens from article titles
//      using a simple regex (Capitalised word sequences of length
//      >= 3). This guarantees a usable graph even when the
//      entity-extraction pipeline hasn't run.
//
//  Query params:
//    - company : company slug (default: first company in DB)
//    - range   : 7d | 30d | 365d (default 30d)
//    - limit   : max nodes to return (default 30, sorted by count)
//
//  Auth: requires session (brand-monitor | market-competitor |
//  investment-bank | admin).
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

const RANGE_DAYS: Record<string, number> = {
  "7d": 7,
  "30d": 30,
  "365d": 365,
};

// Common French + English stopwords to exclude from the title fallback
// extractor. Single-letter tokens are also excluded by the regex.
const STOPWORDS = new Set([
  "The", "A", "An", "And", "Or", "But", "For", "To", "Of", "In", "On",
  "At", "By", "With", "From", "As", "Is", "Are", "Was", "Were", "Be",
  "Been", "Being", "Have", "Has", "Had", "Do", "Does", "Did", "Will",
  "Would", "Could", "Should", "May", "Might", "Can", "This", "That",
  "These", "Those", "It", "Its", "He", "She", "They", "We", "You", "I",
  "Le", "La", "Les", "Un", "Une", "Des", "Du", "De", "Et", "Ou", "Mais",
  "Pour", "En", "Dans", "Sur", "Au", "Aux", "Par", "Avec", "Comme",
  "Qui", "Que", "Quoi", "Dont", "Où", "Ce", "Cette", "Ces", "Cet",
  "Il", "Elle", "Ils", "Elles", "Nous", "Vous", "Je", "Son", "Sa",
  "Ses", "Leur", "Leurs", "Notre", "Nos", "Votre", "Vos", "Mon", "Ma",
  "Mes", "Ton", "Ta", "Tes", "Y", "Ne", "Pas", "Plus", "Très", "Trop",
]);

function extractEntitiesFromTitle(title: string): string[] {
  // Match sequences of capitalised words (1 to 4 tokens), at least one
  // token of length >= 3, ignoring all-caps acronyms shorter than 2.
  // Examples we want to capture:
  //   "OCP"            -> "OCP"
  //   "Maroc"          -> "Maroc"
  //   "Bank of Africa" -> "Bank of Africa"
  //   "Attijariwafa"   -> "Attijariwafa"
  const matches = title.match(/\b(?:[A-Z][a-zA-Z]{2,}|[A-Z]{2,6})\b(?:\s+(?:of|de|du|des|the|la|le)\s+[A-Z][a-zA-Z]{2,})?\b/g);
  if (!matches) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of matches) {
    const token = raw.trim();
    if (!token) continue;
    if (STOPWORDS.has(token)) continue;
    if (token.length < 3) continue;
    if (seen.has(token)) continue;
    seen.add(token);
    out.push(token);
  }
  return out;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowedTypes = ["brand-monitor", "market-competitor", "investment-bank"];
  if (!allowedTypes.includes(session.user.accountType || "") && session.user.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden — this data is for brand-monitor, market-competitor and investment-bank accounts only" },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const rangeParam = searchParams.get("range") || "30d";
    const days = RANGE_DAYS[rangeParam] ?? 30;
    const limitParam = parseInt(searchParams.get("limit") || "30", 10);
    const limit = Math.min(Math.max(limitParam || 30, 5), 100);

    const companySlug = searchParams.get("company");
    // Task: domain-matching-demo-isolation
    const demoFilter = demoFilterFromSession(session);
    let company;
    if (companySlug) {
      if (session.user.role !== "admin") {
        return NextResponse.json(
          { error: "Forbidden — can only view your own company" },
          { status: 403 },
        );
      }
      company = await prisma.company.findUnique({ where: { slug: companySlug } });
    } else {
      const result = await requireUserCompany();
      if (!result.ok) return result.response;
      company = await prisma.company.findUnique({ where: { id: result.data.company.id } });
    }

    if (!company) {
      return NextResponse.json({ nodes: [], links: [] });
    }

    const since = new Date();
    since.setDate(since.getDate() - days);

    const articles = await prisma.article.findMany({
      where: {
        companyId: company.id,
        publishedAt: { gte: since },
        ...demoFilter,
      },
      select: {
        id: true,
        title: true,
        sentimentScore: true,
      },
      orderBy: { publishedAt: "desc" },
      take: 500,
    });

    // Try the proper entity pipeline first.
    const articleIds = articles.map((a) => a.id);
    const mentions = articleIds.length
      ? await prisma.entityMention.findMany({
          where: { companyId: company.id, articleId: { in: articleIds } },
          select: { articleId: true, entity: { select: { name: true } }, sentimentScore: true },
        })
      : [];

    // articleId -> Set<entityName>
    const perArticle = new Map<string, Set<string>>();
    // articleId -> article sentimentScore (for avg sentiment per node)
    const articleSentiment = new Map<string, number | null>();
    for (const a of articles) {
      articleSentiment.set(a.id, a.sentimentScore ?? null);
    }

    const useFallback = mentions.length === 0;

    if (!useFallback) {
      for (const m of mentions) {
        if (!m.articleId) continue;
        const name = m.entity?.name;
        if (!name) continue;
        if (!perArticle.has(m.articleId)) perArticle.set(m.articleId, new Set());
        perArticle.get(m.articleId)!.add(name);
      }
    } else {
      // Fallback: extract from article titles.
      for (const a of articles) {
        const ents = extractEntitiesFromTitle(a.title || "");
        if (ents.length === 0) continue;
        perArticle.set(a.id, new Set(ents));
      }
    }

    // Aggregate node stats + co-occurrence links.
    const nodeCount = new Map<string, number>();
    const nodeSentimentSum = new Map<string, number>();
    const nodeSentimentSamples = new Map<string, number>();
    const linkWeight = new Map<string, number>();

    for (const [articleId, ents] of perArticle.entries()) {
      const sent = articleSentiment.get(articleId) ?? null;
      const entsArr = Array.from(ents);
      for (const e of entsArr) {
        nodeCount.set(e, (nodeCount.get(e) || 0) + 1);
        if (sent !== null) {
          nodeSentimentSum.set(e, (nodeSentimentSum.get(e) || 0) + sent);
          nodeSentimentSamples.set(e, (nodeSentimentSamples.get(e) || 0) + 1);
        }
      }
      // Pairs — sorted to dedupe (A,B) vs (B,A).
      for (let i = 0; i < entsArr.length; i++) {
        for (let j = i + 1; j < entsArr.length; j++) {
          const [a, b] = [entsArr[i], entsArr[j]].sort();
          const key = `${a}\u0000${b}`;
          linkWeight.set(key, (linkWeight.get(key) || 0) + 1);
        }
      }
    }

    // Top-N nodes by count.
    const topNodes = Array.from(nodeCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name]) => name);
    const topSet = new Set(topNodes);

    const nodes = topNodes.map((id) => {
      const count = nodeCount.get(id) || 0;
      const sum = nodeSentimentSum.get(id) || 0;
      const samples = nodeSentimentSamples.get(id) || 0;
      const avgSentiment = samples > 0 ? Math.round((sum / samples) * 1000) / 1000 : 0;
      return { id, count, avgSentiment };
    });

    const links: { source: string; target: string; weight: number }[] = [];
    for (const [key, weight] of linkWeight.entries()) {
      const [source, target] = key.split("\u0000");
      if (!topSet.has(source) || !topSet.has(target)) continue;
      links.push({ source, target, weight });
    }
    // Sort links by weight desc so the chart can cut at a threshold.
    links.sort((a, b) => b.weight - a.weight);

    return NextResponse.json({
      company: { name: company.name, slug: company.slug },
      range: rangeParam,
      source: useFallback ? "title-extraction" : "entity-mentions",
      nodes,
      links,
      stats: {
        articleCount: articles.length,
        entityCount: nodeCount.size,
        linkCount: links.length,
      },
    });
  } catch (err) {
    logError("console.entity-network", `Entity network API error: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
