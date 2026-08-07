import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { verifyAuditChain } from "@/lib/auth/superadmin-audit";
import { hasPermission } from "@/lib/auth/rbac";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const canAccess = hasPermission(session.user.role as any, "audit:read");
  if (!canAccess) {
    return NextResponse.json({ error: "Forbidden — admin role required" }, { status: 403 });
  }

  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);

  const entries = await prisma.superAdminAudit.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      userId: true,
      userEmail: true,
      action: true,
      resource: true,
      result: true,
      ipAddress: true,
      metadata: true,
      entryHash: true,
      prevHash: true,
      createdAt: true,
    },
  });

  const integrity = await verifyAuditChain();

  const defconFlag = await prisma.systemFlag.findUnique({
    where: { key: "defcon_level" },
  });
  const defcon = defconFlag?.value === "1" ? 1 : 0;

  return NextResponse.json({
    entries,
    integrity: {
      valid: integrity.valid,
      totalEntries: integrity.totalEntries,
      brokenAt: integrity.brokenAt,
    },
    defcon,
    lastChecked: new Date().toISOString(),
  });
}
