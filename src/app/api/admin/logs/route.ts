import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const level = searchParams.get("level") || undefined;
    const category = searchParams.get("category") || undefined;

    const where: Record<string, unknown> = {};
    if (level) where.level = level;
    if (category) where.category = category;

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.systemLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.systemLog.count({ where }),
    ]);

    const data = logs.map((l) => ({
      ...l,
      metadata: l.metadata,
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
    console.error("[API] /admin/logs GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch system logs" },
      { status: 500 }
    );
  }
}
