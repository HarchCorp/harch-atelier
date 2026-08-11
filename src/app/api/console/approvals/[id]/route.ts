// ═══════════════════════════════════════════════════════════════
//  /api/console/approvals/[id]
//
//  Single-approval endpoints — fetch + decide (approve / reject).
//  P2-9-WORKFLOWS — VORTEX (Principal Systems & Security Engineer).
//
//  The :id is the AuditLog row id of the original "approval_requested"
//  entry. Decisions are persisted as a SEPARATE AuditLog row
//  (immutable append-only) keyed to the same approvalId in metadata,
//  so the audit trail stays linear and tamper-evident.
//
//  ─── GET ───────────────────────────────────────────────────────
//  Returns the approval request + its decision (if any).
//  Shape: {
//    id, type, title, description, requestedBy,
//    requesterName, requesterRole, status,
//    createdAt, ageMs,
//    decision: { action: "approved"|"rejected", comment, decidedBy, decidedAt } | null
//  }
//
//  ─── PATCH ─────────────────────────────────────────────────────
//  Body: { decision: "approved" | "rejected", comment?: string }
//  Persists to AuditLog:
//    • action = "approval_approved" | "approval_rejected"
//    • resource = "approval:<id>"
//    • userId = session.user.id (the decider)
//    • metadata = { approvalId, comment, originalTitle, originalType, requestedBy }
//  Returns { id, status, decidedAt }.
//
//  Auth: requires session (enterprise | agency | admin).
//  Idempotency: a second PATCH on an already-decided approval
//  returns 409 (Conflict) without writing.
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

// ─── GET ────────────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  ctx: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAccountTypeAllowed(session, [...ALLOWED_TYPES])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = ctx.params;
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  // Demo session → fabricate a deterministic record.
  if (session.user.isDemo || isDemoEmail(session.user.email)) {
    return NextResponse.json({
      id,
      type: "report",
      title: "Demande d'approbation (démo)",
      description: "Démonstration — aucune persistance backend en mode démo.",
      requestedBy: "Karim B.",
      requesterName: "Karim B.",
      requesterRole: "comms",
      status: "pending",
      createdAt: new Date(Date.now() - 4 * 3600_000).toISOString(),
      ageMs: 4 * 3600_000,
      decision: null,
      source: "demo",
    });
  }

  try {
    const row = await prisma.auditLog.findUnique({
      where: { id },
    });
    if (!row || row.action !== "approval_requested") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Enforce tenant scoping: non-admins can only read approvals
    // raised within their own company.
    if (session.user.role !== "admin" && session.user.role !== "super_admin") {
      const companyId = session.user.companyId;
      const owner = row.userId
        ? await prisma.user.findUnique({
            where: { id: row.userId },
            select: { companyId: true },
          })
        : null;
      if (!owner || owner.companyId !== companyId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Find a decision row (if any).
    const decisionRow = await prisma.auditLog.findFirst({
      where: {
        action: { in: ["approval_approved", "approval_rejected"] },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    // Filter in code — JSON path query is brittle across PG versions.
    let decision: {
      action: "approved" | "rejected";
      comment: string;
      decidedBy: string;
      decidedAt: string;
    } | null = null;

    const candidates = decisionRow
      ? await prisma.auditLog.findMany({
          where: {
            action: { in: ["approval_approved", "approval_rejected"] },
          },
          orderBy: { createdAt: "desc" },
          take: 200,
          select: { id: true, action: true, userId: true, metadata: true, createdAt: true },
        })
      : [];

    const hit = candidates.find((c) => {
      const meta = (c.metadata ?? null) as { approvalId?: string } | null;
      return meta?.approvalId === id;
    });

    if (hit) {
      const decMeta = (hit.metadata ?? {}) as { comment?: string };
      const decider = hit.userId
        ? await prisma.user.findUnique({
            where: { id: hit.userId },
            select: { name: true, email: true },
          })
        : null;
      decision = {
        action: hit.action === "approval_approved" ? "approved" : "rejected",
        comment: decMeta.comment ?? "",
        decidedBy: decider?.name ?? decider?.email ?? "—",
        decidedAt: hit.createdAt.toISOString(),
      };
    }

    const meta = (row.metadata ?? {}) as {
      type?: string;
      title?: string;
      description?: string;
      requestedBy?: string;
    };

    const requester = row.userId
      ? await prisma.user.findUnique({
          where: { id: row.userId },
          select: { name: true, email: true, role: true },
        })
      : null;

    return NextResponse.json({
      id: row.id,
      type: meta.type ?? "report",
      title: meta.title ?? "Demande d'approbation",
      description: meta.description ?? "",
      requestedBy: meta.requestedBy ?? requester?.name ?? requester?.email ?? "—",
      requesterName: requester?.name ?? requester?.email ?? "—",
      requesterRole: requester?.role ?? session.user.role ?? "user",
      status: decision ? decision.action : "pending",
      createdAt: row.createdAt.toISOString(),
      ageMs: Date.now() - row.createdAt.getTime(),
      decision,
      source: "neon",
    });
  } catch (err) {
    logError("console.approvals.get", `[approvals/[id] GET] ${err}`);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// ─── PATCH ──────────────────────────────────────────────────────

export async function PATCH(
  req: NextRequest,
  ctx: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAccountTypeAllowed(session, [...ALLOWED_TYPES])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = ctx.params;
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { decision, comment } = (body ?? {}) as {
    decision?: string;
    comment?: string;
  };
  if (decision !== "approved" && decision !== "rejected") {
    return NextResponse.json(
      { error: "decision must be 'approved' or 'rejected'" },
      { status: 400 },
    );
  }

  // Demo session → no DB write, echo success.
  if (session.user.isDemo || isDemoEmail(session.user.email)) {
    return NextResponse.json({
      id,
      status: decision,
      decidedAt: new Date().toISOString(),
      source: "demo",
    });
  }

  try {
    // Fetch the original request.
    const row = await prisma.auditLog.findUnique({ where: { id } });
    if (!row || row.action !== "approval_requested") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Tenant scoping for non-admins.
    if (session.user.role !== "admin" && session.user.role !== "super_admin") {
      const companyId = session.user.companyId;
      const owner = row.userId
        ? await prisma.user.findUnique({
            where: { id: row.userId },
            select: { companyId: true },
          })
        : null;
      if (!owner || owner.companyId !== companyId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Idempotency: refuse to double-decide.
    const existing = await prisma.auditLog.findMany({
      where: { action: { in: ["approval_approved", "approval_rejected"] } },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { metadata: true },
    });
    const alreadyDecided = existing.some((e) => {
      const meta = (e.metadata ?? null) as { approvalId?: string } | null;
      return meta?.approvalId === id;
    });
    if (alreadyDecided) {
      return NextResponse.json(
        { error: "Approval already decided" },
        { status: 409 },
      );
    }

    const meta = (row.metadata ?? {}) as {
      type?: string;
      title?: string;
      description?: string;
      requestedBy?: string;
    };

    const action = decision === "approved" ? "approval_approved" : "approval_rejected";
    const entry = await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action,
        resource: `approval:${id}`,
        result: decision,
        metadata: {
          approvalId: id,
          comment: (comment ?? "").slice(0, 1000),
          originalTitle: (meta.title ?? "").slice(0, 240),
          originalType: (meta.type ?? "report").slice(0, 40),
          requestedBy: (meta.requestedBy ?? "").slice(0, 120),
          decidedBy: (session.user.name ?? session.user.email ?? "—").slice(0, 120),
        },
      },
    });

    return NextResponse.json({
      id,
      status: decision,
      decidedAt: entry.createdAt.toISOString(),
      source: "neon",
    });
  } catch (err) {
    logError("console.approvals.decide", `[approvals/[id] PATCH] ${err}`);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
