import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logError } from "@/lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const topN = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("top") || "20"))
    );

    const company = await prisma.company.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: "Company not found" },
        { status: 404 }
      );
    }

    // Get all entity mentions for this company with their entities
    const mentions = await prisma.entityMention.findMany({
      where: { companyId: company.id },
      select: {
        entityId: true,
        sentimentScore: true,
        sentimentLabel: true,
        mentionedAt: true,
      },
    });

    // Aggregate mention counts per entity
    const aggregation = new Map<
      string,
      {
        entityId: string;
        mentionCount: number;
        avgSentiment: number;
        lastMentionedAt: Date | null;
      }
    >();

    for (const m of mentions) {
      const entry = aggregation.get(m.entityId) ?? {
        entityId: m.entityId,
        mentionCount: 0,
        avgSentiment: 0,
        lastMentionedAt: null as Date | null,
      };
      entry.mentionCount += 1;
      if (typeof m.sentimentScore === "number") {
        entry.avgSentiment =
          (entry.avgSentiment * (entry.mentionCount - 1) + m.sentimentScore) /
          entry.mentionCount;
      }
      if (
        m.mentionedAt &&
        (!entry.lastMentionedAt || m.mentionedAt > entry.lastMentionedAt)
      ) {
        entry.lastMentionedAt = m.mentionedAt;
      }
      aggregation.set(m.entityId, entry);
    }

    const topEntities = [...aggregation.values()]
      .sort((a, b) => b.mentionCount - a.mentionCount)
      .slice(0, topN);

    const entityIds = topEntities.map((e) => e.entityId);
    const entities = await prisma.entity.findMany({
      where: { id: { in: entityIds } },
    });

    const entityMap = new Map(entities.map((e) => [e.id, e]));

    const data = topEntities.map((e) => {
      const entity = entityMap.get(e.entityId);
      return {
        entityId: e.entityId,
        mentionCount: e.mentionCount,
        avgSentiment: e.avgSentiment,
        lastMentionedAt: e.lastMentionedAt,
        entity: entity
          ? {
              ...entity,
              aliases: entity.aliases ?? [],
              sources: entity.sources ?? [],
              tags: entity.tags ?? [],
              metadata: entity.metadata,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total: aggregation.size,
        returned: data.length,
      },
    });
  } catch (error) {
    logError("companies.slug.entities", `[API] /companies/[slug]/entities GET error: ${error}`);
    return NextResponse.json(
      { success: false, error: "Failed to fetch entities" },
      { status: 500 }
    );
  }
}
