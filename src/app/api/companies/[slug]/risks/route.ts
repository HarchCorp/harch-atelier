import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const severity = searchParams.get("severity") || undefined;
    const category = searchParams.get("category") || undefined;

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

    const where: Record<string, unknown> = { companyId: company.id };
    if (severity) where.riskLevel = severity;
    if (category) where.category = category;

    const skip = (page - 1) * limit;

    const [risks, total] = await Promise.all([
      prisma.riskAssessment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { assessedAt: "desc" },
      }),
      prisma.riskAssessment.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: risks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[API] /companies/[slug]/risks GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch risks" },
      { status: 500 }
    );
  }
}
