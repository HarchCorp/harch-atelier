import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Get distinct sectors with company counts
    const companies = await prisma.company.findMany({
      select: { sector: true },
    });

    const sectorMap = new Map<string, number>();
    for (const c of companies) {
      const sector = c.sector || "Unknown";
      sectorMap.set(sector, (sectorMap.get(sector) ?? 0) + 1);
    }

    const sectors = [...sectorMap.entries()]
      .map(([name, companyCount]) => ({
        name,
        slug: encodeURIComponent(name.toLowerCase()),
        companyCount,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      success: true,
      data: sectors,
      pagination: {
        total: sectors.length,
        returned: sectors.length,
      },
    });
  } catch (error) {
    console.error("[API] /industries GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch industries" },
      { status: 500 }
    );
  }
}
