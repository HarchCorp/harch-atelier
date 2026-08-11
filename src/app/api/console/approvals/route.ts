// ═══════════════════════════════════════════════════════════════
//  /api/console/approvals
//
//  Governance workflow persistence for Enterprise / Agency / Admin.
//  P2-9-WORKFLOWS — VORTEX (Principal Systems & Security Engineer).
//
//  Approvals are persisted as AuditLog rows:
//    • action = "approval_requested"  → pending request (returned by GET)
//    • action = "approval_approved"   → decision row (linked via metadata.approvalId)
//    • action = "approval_rejected"   → decision row (linked via metadata.approvalId)
//
//  A request stays "pending" until a decision row with the same
//  approvalId lands in the log. Once decided, GET excludes it.
//
//  ─── GET ───────────────────────────────────────────────────────
//  Returns pending approvals scoped to the caller's tenant
//  (company users → approvals raised by colleagues in the same
//  company; admins → all). Demo sessions get a deterministic
//  in-memory queue so the Enterprise dashboard never renders empty.
//
//  Shape:
//    {
//      approvals: [{
//        id, type, title, description, requestedBy,
//        requesterName, requesterRole, status,
//        createdAt, ageMs
//      }],
//      count, source
//    }
//
//  ─── POST ──────────────────────────────────────────────────────
//  Body: { type, title, description, requestedBy }
//  Creates a new approval_requested AuditLog row.
//
//  Auth: requires session (enterprise | agency | admin).
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { isAccountTypeAllowed } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db";
import { logError } from "@/lib/logger";
import { isDemoEmail } from "@/lib/demo-session";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES = ["enterprise", "agency", "investment-bank", "harch-alpha"] as const;

const APPROVAL_TYPES = new Set([
  "briefing",
  "crisis",
  "api-key",
  "compliance",
  "report",
]);

// ─── GET ────────────────────────────────────────────────────────

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAccountTypeAllowed(session, [...ALLOWED_TYPES])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Demo session → deterministic in-memory queue.
  if (session.user.isDemo || isDemoEmail(session.user.email)) {
    return NextResponse.json(buildDemoApprovals());
  }

  try {
    const companyId = session.user.companyId;
    // Scope: admins see everything; everyone else is scoped to their company.
    const userWhere = session.user.role === "admin" || session.user.role === "super_admin"
      ? {}
      : companyId
        ? { companyId }
        : { id: session.user.id };

    const users = await prisma.user.findMany({
      where: userWhere,
      select: { id: true, name: true, email: true, role: true },
    });
    const userIds = users.map((u) => u.id);
    const nameById = new Map(users.map((u) => [u.id, u.name || u.email]));
    const roleById = new Map(users.map((u) => [u.id, u.role]));

    const requests = await prisma.auditLog.findMany({
      where: {
        action: "approval_requested",
        userId: userIds.length ? { in: userIds } : undefined,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // Collect IDs of already-decided approvals.
    const requestIds = requests.map((r) => r.id);
    const decisions = requestIds.length
      ? await prisma.auditLog.findMany({
          where: {
            action: { in: ["approval_approved", "approval_rejected"] },
            // metadata.approvalId is matched in code below (JSON path
            // filtering is brittle across PG versions).
          },
          select: { action: true, metadata: true, createdAt: true },
        })
      : [];

    const decidedIds = new Set<string>();
    for (const d of decisions) {
      const meta = (d.metadata ?? null) as { approvalId?: string } | null;
      if (meta?.approvalId) decidedIds.add(meta.approvalId);
    }

    const now = Date.now();
    const approvals = requests
      .filter((r) => !decidedIds.has(r.id))
      .map((r) => {
        const meta = (r.metadata ?? {}) as {
          type?: string;
          title?: string;
          description?: string;
          requestedBy?: string;
        };
        const requesterId = r.userId ?? "";
        return {
          id: r.id,
          type: APPROVAL_TYPES.has(meta.type ?? "") ? (meta.type as string) : "report",
          title: meta.title ?? "Demande d'approbation",
          description: meta.description ?? "",
          requestedBy: meta.requestedBy ?? nameById.get(requesterId) ?? "—",
          requesterName: nameById.get(requesterId) ?? "—",
          requesterRole: roleById.get(requesterId) ?? session.user.role ?? "user",
          status: "pending" as const,
          createdAt: r.createdAt.toISOString(),
          ageMs: now - r.createdAt.getTime(),
        };
      });

    return NextResponse.json({
      approvals,
      count: approvals.length,
      source: "neon",
    });
  } catch (err) {
    logError("console.approvals.list", `[approvals GET] ${err}`);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// ─── POST ───────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAccountTypeAllowed(session, [...ALLOWED_TYPES])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { type, title, description, requestedBy } = (body ?? {}) as {
    type?: string;
    title?: string;
    description?: string;
    requestedBy?: string;
  };

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  const safeType = APPROVAL_TYPES.has(type ?? "") ? (type as string) : "report";

  // Demo session → echo back a pseudo-id (no DB write).
  if (session.user.isDemo || isDemoEmail(session.user.email)) {
    const fakeId = `demo-approval-${Date.now()}`;
    return NextResponse.json({
      id: fakeId,
      status: "pending",
      source: "demo",
    });
  }

  try {
    const entry = await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "approval_requested",
        resource: `approval:${safeType}`,
        result: "pending",
        metadata: {
          type: safeType,
          title: title.trim().slice(0, 240),
          description: (description ?? "").slice(0, 2000),
          requestedBy: (requestedBy ?? session.user.name ?? session.user.email ?? "—").slice(0, 120),
        },
      },
    });

    return NextResponse.json({
      id: entry.id,
      status: "pending",
      source: "neon",
    });
  } catch (err) {
    logError("console.approvals.create", `[approvals POST] ${err}`);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// ─── Demo payload (deterministic) ───────────────────────────────

function buildDemoApprovals() {
  const now = Date.now();
  const at = (msAgo: number) => new Date(now - msAgo).toISOString();
  const approvals = [
    {
      id: "demo-ap-001",
      type: "briefing",
      title: "Briefing COMEX Q3 — publication",
      description: "Validation finale du briefing COMEX avant diffusion au conseil.",
      requestedBy: "Karim B.",
      requesterName: "Karim B.",
      requesterRole: "comms",
      status: "pending" as const,
      createdAt: at(4 * 3600_000),
      ageMs: 4 * 3600_000,
    },
    {
      id: "demo-ap-002",
      type: "api-key",
      title: "Révocation clé API legacy",
      description: "Demande de révocation immédiate d'une clé API obsolète.",
      requestedBy: "Sophie M.",
      requesterName: "Sophie M.",
      requesterRole: "compliance",
      status: "pending" as const,
      createdAt: at(11 * 3600_000),
      ageMs: 11 * 3600_000,
    },
    {
      id: "demo-ap-003",
      type: "report",
      title: "Rapport ESG trimestriel — validation",
      description: "Rapport ESG T3 prêt pour validation comité investisseurs.",
      requestedBy: "Yasmine T.",
      requesterName: "Yasmine T.",
      requesterRole: "ir",
      status: "pending" as const,
      createdAt: at(27 * 3600_000),
      ageMs: 27 * 3600_000,
    },
    {
      id: "demo-ap-004",
      type: "crisis",
      title: "Sortie mode crise DEFCON 4",
      description: "Demande de levée du mode crise après stabilisation.",
      requestedBy: "Karim B.",
      requesterName: "Karim B.",
      requesterRole: "comms",
      status: "pending" as const,
      createdAt: at(49 * 3600_000),
      ageMs: 49 * 3600_000,
    },
  ];
  return { approvals, count: approvals.length, source: "demo" as const };
}
