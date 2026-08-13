// ═══════════════════════════════════════════════════════════════
//  POST /api/console/audit-timeline
//
//  Skill 19 — Audit Log Timeline.
//  Returns the last 100 AuditLog entries (sorted desc) for the
//  caller's company, enriched with the acting user's display name.
//
//  The AuditLog table doesn't carry a companyId column directly —
//  same pattern as /api/console/team-activity: we resolve all
//  userIds attached to the caller's company first, then filter
//  AuditLog on that set. Entries whose userId is null (e.g. failed
//  login with a non-existent email) are excluded from the
//  company-scoped view.
//
//  Shape:
//    {
//      entries: [{
//        id, action, resource, userId, userName,
//        result, ipAddress, timestamp, metadata
//      }]
//    }
//
//  Auth: requires session (any accountType). Users without a
//  companyId (super-admins, uninvited) receive an empty list —
//  super-admins have their own SuperAdminAudit trail.
//
//  Task ID: SKILL-19-AUDIT-LOG
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

interface AuditEntry {
  id: string;
  action: string;
  resource: string;
  userId: string | null;
  userName: string;
  result: string;
  ipAddress: string | null;
  timestamp: string;
  metadata: Record<string, unknown> | null;
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companyId = session.user.companyId;
  if (!companyId) {
    // No company scope → no audit entries to surface. Super-admins
    // use the SuperAdminAudit trail (separate immutable chain).
    return NextResponse.json({ entries: [] });
  }

  try {
    // Resolve the company's member roster so we can (a) filter
    // AuditLog to this tenant and (b) enrich each entry with the
    // acting user's display name in one shot.
    const users = await prisma.user.findMany({
      where: { companyId },
      select: { id: true, name: true, email: true },
    });
    const userIds = users.map((u) => u.id);
    const nameById = new Map<string, string>();
    for (const u of users) {
      nameById.set(u.id, u.name || u.email);
    }

    const logs = await prisma.auditLog.findMany({
      where: { userId: { in: userIds } },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        userId: true,
        action: true,
        resource: true,
        result: true,
        ipAddress: true,
        metadata: true,
        createdAt: true,
      },
    });

    const entries: AuditEntry[] = logs.map((l) => ({
      id: l.id,
      action: l.action,
      resource: l.resource,
      userId: l.userId,
      userName:
        (l.userId != null && nameById.get(l.userId)) || "Utilisateur supprimé",
      result: l.result,
      ipAddress: l.ipAddress,
      timestamp: l.createdAt.toISOString(),
      metadata: l.metadata == null ? null : (l.metadata as Record<string, unknown>),
    }));

    return NextResponse.json({ entries });
  } catch (err) {
    logError("console.audit-timeline", `[audit-timeline] error: ${err}`);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
