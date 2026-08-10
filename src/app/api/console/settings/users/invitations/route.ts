// ═══════════════════════════════════════════════════════════════
//  /api/console/settings/users/invitations
//
//  Pending invitations list + resend / cancel operations.
//
//  GET    — list pending (unused) invitations for the caller's team
//  POST   — resend an invitation (bumps expiresAt + sends again)
//  DELETE — cancel an invitation (deletes the row)
//
//  Auth: any signed-in user. Operations are scoped to the caller's
//  companyId (or unrestricted for super_admin / admin).
//
//  Task ID: POSTLOGIN-5-USERS
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface InviteOut {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  expiresAt: string;
}

// ─── GET — list pending ─────────────────────────────────────────
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const caller = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true, companyId: true },
    });
    if (!caller) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isPrivileged =
      caller.role === "admin" ||
      caller.role === "super_admin" ||
      caller.role === "company-admin" ||
      caller.role === "agency-admin";

    if (!isPrivileged) {
      return NextResponse.json({ invitations: [] });
    }

    const where: { usedAt: null; companyId?: string | null } = { usedAt: null };
    if (caller.role !== "super_admin" && caller.companyId) {
      where.companyId = caller.companyId;
    }

    const invitations = await prisma.invitation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    const out: InviteOut[] = invitations.map((i) => ({
      id: i.id,
      email: i.email,
      name: i.name,
      role: i.role,
      createdAt: i.createdAt.toISOString(),
      expiresAt: i.expiresAt.toISOString(),
    }));

    return NextResponse.json({ invitations: out });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError("console.invitations", `[/api/console/settings/users/invitations] GET failed: ${msg}`);
    return NextResponse.json({ error: "Failed to fetch invitations", detail: msg }, { status: 500 });
  }
}

// ─── POST — resend ──────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const caller = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true, companyId: true },
    });
    if (!caller) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isPrivileged =
      caller.role === "admin" ||
      caller.role === "super_admin" ||
      caller.role === "company-admin" ||
      caller.role === "agency-admin";

    if (!isPrivileged) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const invitationId = typeof body.invitationId === "string" ? body.invitationId : "";
    if (!invitationId) {
      return NextResponse.json({ error: "invitationId is required" }, { status: 400 });
    }

    const inv = await prisma.invitation.findUnique({
      where: { id: invitationId },
      select: { id: true, companyId: true, usedAt: true },
    });
    if (!inv) {
      return NextResponse.json({ error: "Invitation introuvable." }, { status: 404 });
    }
    if (inv.usedAt) {
      return NextResponse.json({ error: "Cette invitation a déjà été utilisée." }, { status: 409 });
    }
    if (caller.role !== "super_admin" && caller.companyId && inv.companyId !== caller.companyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Bump expiry by 7 days from now
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + 7);

    await prisma.invitation.update({
      where: { id: invitationId },
      data: { expiresAt: newExpiry },
    });

    // (Real email sending is handled by a background job — not implemented here)

    return NextResponse.json({ ok: true, expiresAt: newExpiry.toISOString() });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError("console.invitations", `[/api/console/settings/users/invitations] POST failed: ${msg}`);
    return NextResponse.json({ error: "Failed to resend invitation", detail: msg }, { status: 500 });
  }
}

// ─── DELETE — cancel ────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const caller = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true, companyId: true },
    });
    if (!caller) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isPrivileged =
      caller.role === "admin" ||
      caller.role === "super_admin" ||
      caller.role === "company-admin" ||
      caller.role === "agency-admin";

    if (!isPrivileged) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const invitationId = typeof body.invitationId === "string" ? body.invitationId : "";
    if (!invitationId) {
      return NextResponse.json({ error: "invitationId is required" }, { status: 400 });
    }

    const inv = await prisma.invitation.findUnique({
      where: { id: invitationId },
      select: { id: true, companyId: true, usedAt: true },
    });
    if (!inv) {
      return NextResponse.json({ error: "Invitation introuvable." }, { status: 404 });
    }
    if (inv.usedAt) {
      return NextResponse.json({ error: "Cette invitation a déjà été utilisée." }, { status: 409 });
    }
    if (caller.role !== "super_admin" && caller.companyId && inv.companyId !== caller.companyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.invitation.delete({ where: { id: invitationId } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError("console.invitations", `[/api/console/settings/users/invitations] DELETE failed: ${msg}`);
    return NextResponse.json({ error: "Failed to cancel invitation", detail: msg }, { status: 500 });
  }
}
