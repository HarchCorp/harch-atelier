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

    // Fetch the latest reputation record per pillar by getting recent records
    // and grouping by the pillar-like fields we expose.
    const records = await prisma.reputationScore.findMany({
      where: { companyId: company.id },
      orderBy: { calculatedAt: "desc" },
      take: 100,
    });

    // De-duplicate per pillar: keep the latest record that has a non-null value for each pillar.
    const pillars = [
      "sentiment",
      "aiVisibility",
      "volume",
      "authority",
      "innovationScore",
      "performanceScore",
      "purposeScore",
      "shareOfVoice",
    ] as const;

    const latestByPillar: Record<string, unknown> = {};
    for (const pillar of pillars) {
      const match = records.find((r) => r[pillar] !== null && r[pillar] !== undefined);
      if (match) {
        latestByPillar[pillar] = {
          value: match[pillar],
          weight:
            pillar === "innovationScore"
              ? match.innovationWeight
              : pillar === "performanceScore"
                ? match.performanceWeight
                : pillar === "purposeScore"
                  ? match.purposeWeight
                  : null,
          calculatedAt: match.calculatedAt,
        };
      } else {
        latestByPillar[pillar] = null;
      }
    }

    const latestOverall = records[0] ?? null;

    return NextResponse.json({
      success: true,
      data: {
        overall: latestOverall
          ? {
              value: latestOverall.overall,
              trend: latestOverall.trend,
              calculatedAt: latestOverall.calculatedAt,
            }
          : null,
        pillars: latestByPillar,
        latestRecord: latestOverall,
      },
    });
  } catch (error) {
    console.error("[API] /companies/[slug]/reputation GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reputation scores" },
      { status: 500 }
    );
  }
}
