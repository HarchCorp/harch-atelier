import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const sector = searchParams.get("sector") || undefined;
    const q = searchParams.get("q") || undefined;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

    const validSortFields = ["name", "sector", "createdAt"] as const;
    const sortField = validSortFields.includes(sortBy as typeof validSortFields[number])
      ? (sortBy as typeof validSortFields[number])
      : "createdAt";

    // ─── Task: user-company-onboarding ─────────────────────────────
    // Support ?q= free-text search on name + aliases. Used by the
    // onboarding wizard's "pick existing company" step. Case-insensitive
    // contains matching on the name column.
    //
    // Task: domain-matching-demo-isolation — exclude demo companies
    // (created by the executive demo seed) from the public directory
    // and the onboarding picker. Real users should only see real
    // companies. Demo users bypass onboarding entirely (their JWT
    // has onboardingCompleted=true set by /api/auth/demo).
    const where: {
      isDemo: boolean;
      sector?: string;
      OR?: Array<{ name?: { contains: string; mode: "insensitive" }; aliases?: { has: string } }>;
    } = { isDemo: false };
    if (sector) where.sector = sector;
    if (q && q.trim()) {
      const term = q.trim();
      where.OR = [
        { name: { contains: term, mode: "insensitive" } },
        { aliases: { has: term } },
      ];
    }
    const skip = (page - 1) * limit;

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortField]: sortOrder },
      }),
      prisma.company.count({ where }),
    ]);

    const data = companies.map((c) => ({
      ...c,
      aliases: c.aliases ?? [],
    }));

    return NextResponse.json({
      success: true,
      data,
      companies: data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[API] /companies GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}
