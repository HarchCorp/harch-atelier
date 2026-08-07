import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";

// ═══════════════════════════════════════════════════════════════
//  GET /api/admin/requests
//  Returns all access requests (admin only)
//
//  Query params:
//  - status: filter by status (pending | accepted | rejected)
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin" && session.user?.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
  }

  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status");

    const requests = await prisma.accessRequest.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        invitation: {
          select: { id: true, token: true, usedAt: true },
        },
      },
    });

    return NextResponse.json({ requests });
  } catch (err) {
    console.error("Admin requests error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
