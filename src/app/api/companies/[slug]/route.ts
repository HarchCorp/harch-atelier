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
      include: {
        articles: {
          orderBy: { publishedAt: "desc" },
          take: 20,
        },
        riskAssessments: {
          orderBy: { assessedAt: "desc" },
          take: 10,
        },
        sentimentScores: {
          orderBy: { calculatedAt: "desc" },
          take: 1,
        },
        reputationScores: {
          orderBy: { calculatedAt: "desc" },
          take: 1,
        },
        aiVisibility: {
          orderBy: { checkedAt: "desc" },
          take: 1,
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: "Company not found" },
        { status: 404 }
      );
    }

    const data = {
      ...company,
      aliases: company.aliases ?? [],
      articles: company.articles.map((a) => a),
      riskAssessments: company.riskAssessments,
      latestSentiment: company.sentimentScores[0] ?? null,
      latestReputation: company.reputationScores[0] ?? null,
      latestAIVisibility: company.aiVisibility[0] ?? null,
      sentimentScores: undefined,
      reputationScores: undefined,
      aiVisibility: undefined,
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[API] /companies/[slug] GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch company" },
      { status: 500 }
    );
  }
}
