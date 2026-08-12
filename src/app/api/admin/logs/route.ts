import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { canAccessAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db";
import { logError } from "@/lib/logger";

// Auth: admin only (admin | super_admin | commercial).
// System logs expose operational metadata — never public.
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !canAccessAdmin(session.user.role)) {
    return NextResponse.json(
      { error: "Forbidden — admin only" },
      { status: 403 },
    );
  }

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
    logError("admin.logs", `[API] /admin/logs GET error: ${error}`);
    return NextResponse.json(
      { success: false, error: "Failed to fetch system logs" },
      { status: 500 }
    );
  }
}
