import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const status = searchParams.get("status") || undefined;
    const sourceId = searchParams.get("sourceId") || undefined;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (sourceId) where.sourceId = sourceId;

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.scraperLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startedAt: "desc" },
      }),
      prisma.scraperLog.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[API] /admin/scraper-logs GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch scraper logs" },
      { status: 500 }
    );
  }
}
