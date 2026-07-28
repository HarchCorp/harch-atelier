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

    // The [slug] param is the URL-encoded sector name
    const sector = decodeURIComponent(slug);

    const where = { sector };
    const skip = (page - 1) * limit;

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
      }),
      prisma.company.count({ where }),
    ]);

    const data = companies.map((c) => ({
      ...c,
      aliases: c.aliases ?? [],
    }));

    return NextResponse.json({
      success: true,
      data: {
        sector,
        companies: data,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[API] /industries/[slug] GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch companies for sector" },
      { status: 500 }
    );
  }
}
