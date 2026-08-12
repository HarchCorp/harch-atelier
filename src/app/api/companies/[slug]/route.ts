import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logError } from "@/lib/logger";

// Public company profile endpoint — powers the /atelier/companies/[slug]
// marketing pages. INTENTIONALLY PUBLIC (no auth) but filtered to
// isDemo:false so demo-seeded data is never exposed to anonymous
// callers. See AUDIT-API-ROUTES P0-2.
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
          where: { isDemo: false },
          orderBy: { publishedAt: "desc" },
          take: 20,
        },
        riskAssessments: {
          where: { isDemo: false },
          orderBy: { assessedAt: "desc" },
          take: 10,
        },
        sentimentScores: {
          where: { isDemo: false },
          orderBy: { calculatedAt: "desc" },
          take: 1,
        },
        reputationScores: {
          where: { isDemo: false },
          orderBy: { calculatedAt: "desc" },
          take: 1,
        },
        aiVisibility: {
          where: { isDemo: false },
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
    logError("companies.slug", `[API] /companies/[slug] GET error: ${error}`);
    return NextResponse.json(
      { success: false, error: "Failed to fetch company" },
      { status: 500 }
    );
  }
}
