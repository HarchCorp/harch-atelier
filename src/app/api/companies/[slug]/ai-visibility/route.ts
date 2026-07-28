import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

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

    // Fetch recent records then de-duplicate by platform (keep latest)
    const records = await prisma.aIVisibility.findMany({
      where: { companyId: company.id },
      orderBy: { checkedAt: "desc" },
      take: 200,
    });

    const latestByPlatform: Record<string, unknown> = {};
    for (const r of records) {
      if (!latestByPlatform[r.platform]) {
        latestByPlatform[r.platform] = {
          id: r.id,
          platform: r.platform,
          cited: r.cited,
          position: r.position,
          sentiment: r.sentiment,
          confidence: r.confidence,
          summary: r.summary,
          checkedAt: r.checkedAt,
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        platforms: Object.values(latestByPlatform),
        count: Object.keys(latestByPlatform).length,
      },
    });
  } catch (error) {
    console.error("[API] /companies/[slug]/ai-visibility GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch AI visibility" },
      { status: 500 }
    );
  }
}
