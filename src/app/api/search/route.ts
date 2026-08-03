import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// ═══════════════════════════════════════════════════════════════
//  GET /api/search?q={query}&limit={n}&type={type}
//
//  Full-text search across articles, entities, and companies.
//  Uses PostgreSQL ILIKE for case-insensitive matching.
//
//  Parameters:
//    q (required) — Search query string
//    limit (optional, default 20, max 100) — Max results
//    type (optional) — Filter by type: article | entity | company | all
//    companyId (optional) — Filter by company
//    sentiment (optional) — Filter by sentiment: positive | neutral | negative
//    sourceType (optional) — Filter by source type
//    language (optional) — Filter by language
//    dateFrom (optional) — Filter articles published after this date
//    dateTo (optional) — Filter articles published before this date
// ═══════════════════════════════════════════════════════════════

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const type = searchParams.get("type") || "all";
    const companyId = searchParams.get("companyId");
    const sentiment = searchParams.get("sentiment");
    const sourceType = searchParams.get("sourceType");
    const language = searchParams.get("language");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    if (!query.trim()) {
      return NextResponse.json({
        success: true,
        data: [],
        query: "",
        total: 0,
      });
    }

    const results: Array<{
      id: string;
      type: "article" | "entity" | "company";
      title: string;
      subtitle?: string;
      snippet: string;
      url?: string;
      date?: string;
      sentiment?: string;
      source?: string;
      score: number;
    }> = [];

    // ─── SEARCH ARTICLES ───────────────────────────────────────
    if (type === "all" || type === "article") {
      const articleWhere: Record<string, unknown> = {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
          { summary: { contains: query, mode: "insensitive" } },
        ],
      };

      if (companyId) articleWhere.companyId = companyId;
      if (sentiment) articleWhere.sentimentLabel = sentiment;
      if (sourceType) articleWhere.sourceType = sourceType;
      if (language) articleWhere.language = language;
      if (dateFrom || dateTo) {
        articleWhere.publishedAt = {};
        if (dateFrom) (articleWhere.publishedAt as Record<string, unknown>).gte = new Date(dateFrom);
        if (dateTo) (articleWhere.publishedAt as Record<string, unknown>).lte = new Date(dateTo);
      }

      const articles = await prisma.article.findMany({
        where: articleWhere as never,
        select: {
          id: true,
          title: true,
          source: true,
          url: true,
          publishedAt: true,
          sentimentLabel: true,
          sentimentScore: true,
          sourceType: true,
          language: true,
          summary: true,
          content: true,
          companyId: true,
        },
        orderBy: { publishedAt: "desc" },
        take: limit,
      });

      for (const article of articles) {
        const snippet = article.summary || article.content?.slice(0, 200) || "";
        results.push({
          id: article.id,
          type: "article",
          title: article.title,
          subtitle: article.source,
          snippet: snippet.slice(0, 200) + (snippet.length > 200 ? "…" : ""),
          url: article.url,
          date: article.publishedAt?.toISOString(),
          sentiment: article.sentimentLabel || undefined,
          source: article.source,
          score: 1.0,
        });
      }
    }

    // ─── SEARCH ENTITIES (people, orgs) ────────────────────────
    if (type === "all" || type === "entity") {
      const entities = await prisma.entity.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          entityType: true,
          aliases: true,
          tags: true,
          metadata: true,
          confidence: true,
          lastSeen: true,
        },
        take: limit,
      });

      for (const entity of entities) {
        const meta = entity.metadata as { role?: string } | null;
        results.push({
          id: entity.id,
          type: "entity",
          title: entity.name,
          subtitle: entity.entityType,
          snippet: meta?.role || entity.tags.join(", "),
          date: entity.lastSeen?.toISOString(),
          score: entity.confidence,
        });
      }
    }

    // ─── SEARCH COMPANIES ──────────────────────────────────────
    if (type === "all" || type === "company") {
      const companies = await prisma.company.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          sector: true,
          ticker: true,
          description: true,
          headquarters: true,
        },
        take: limit,
      });

      for (const company of companies) {
        results.push({
          id: company.id,
          type: "company",
          title: company.name,
          subtitle: company.sector,
          snippet: company.description?.slice(0, 200) || "",
          url: `/atelier/companies/${company.slug}`,
          score: 1.0,
        });
      }
    }

    // Sort by score (descending)
    results.sort((a, b) => b.score - a.score);

    // Apply limit
    const limited = results.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: limited,
      query,
      total: results.length,
      returned: limited.length,
      filters: {
        type,
        companyId,
        sentiment,
        sourceType,
        language,
        dateFrom,
        dateTo,
      },
    });
  } catch (error) {
    console.error("[API] /search GET error:", error);
    return NextResponse.json(
      { success: false, error: "Search failed" },
      { status: 500 }
    );
  }
}
