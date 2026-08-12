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
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));

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

    // isDemo:false — demo-seeded sentiment scores never exposed publicly.
    // See AUDIT-API-ROUTES P0-2.
    const where = { companyId: company.id, isDemo: false };
    const skip = (page - 1) * limit;

    const [sentiments, total] = await Promise.all([
      prisma.sentimentScore.findMany({
        where,
        skip,
        take: limit,
        orderBy: { calculatedAt: "desc" },
      }),
      prisma.sentimentScore.count({ where }),
    ]);

    const data = sentiments.map((s) => ({
      ...s,
      sourceBreakdown: s.sourceBreakdown,
    }));

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logError("companies.slug.sentiment", `[API] /companies/[slug]/sentiment GET error: ${error}`);
    return NextResponse.json(
      { success: false, error: "Failed to fetch sentiment scores" },
      { status: 500 }
    );
  }
}
