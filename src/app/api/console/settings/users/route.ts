// ═══════════════════════════════════════════════════════════════
//  /api/console/settings/users
//
//  Unified team-management endpoint for the console's
//  "Gestion des utilisateurs" page.
//
//  GET    — list current user's team (same companyId) with role/status/lastLogin
//  POST   — invite a new user (creates an Invitation row)
//  PATCH  — update a teammate's role OR status (active | suspended)
//  DELETE — remove a teammate from the team
//
//  Auth: any signed-in user. Operations are scoped to the caller's
//  companyId — you can only see / manage your own teammates.
//  company-admin / admin / super_admin bypass the companyId filter.
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

interface TeamUserOut {
  id: string;
  email: string;
  name: string | null;
  role: string;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
}

// ─── GET — list team ────────────────────────────────────────────
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const caller = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true, companyId: true, accountType: true },
    });
    if (!caller) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isPrivileged =
      caller.role === "admin" ||
      caller.role === "super_admin" ||
      caller.role === "company-admin" ||
      caller.role === "agency-admin";

    // Build the where clause — privileged users see all (or their
    // company's) users. Regular users see only their teammates.
    const where: { companyId?: string | null } = {};
    if (!isPrivileged) {
      // Non-privileged user — only their own company's members.
      if (caller.companyId) {
        where.companyId = caller.companyId;
      } else {
        // No company → they can only see themselves.
        return NextResponse.json({ users: [], count: 0 });
      }
    } else if (caller.role !== "super_admin" && caller.companyId) {
      // company-admin / agency-admin: scoped to their company.
      where.companyId = caller.companyId;
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    const out: TeamUserOut[] = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      status: u.status,
      lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
      createdAt: u.createdAt.toISOString(),
    }));

    return NextResponse.json({ users: out, count: out.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError("console.users", `[/api/console/settings/users] GET failed: ${msg}`);
    return NextResponse.json({ error: "Failed to fetch users", detail: msg }, { status: 500 });
  }
}

// ─── POST — invite a user ───────────────────────────────────────
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

    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const roleRaw = typeof body.role === "string" ? body.role : "member";

    if (!email || !name) {
      return NextResponse.json({ error: "Email and name are required" }, { status: 400 });
    }

    // Map UI role → DB role
    const roleMap: Record<string, string> = {
      admin: caller.role === "super_admin" ? "admin" : "company-admin",
      member: "user",
      viewer: "user",
    };
    const dbRole = roleMap[roleRaw] || "user";

    // Reject if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Un utilisateur avec cet email existe déjà." }, { status: 409 });
    }

    // Reject if there's already a pending invitation
    const existingInv = await prisma.invitation.findFirst({
      where: { email, usedAt: null },
    });
    if (existingInv) {
      return NextResponse.json({ error: "Une invitation est déjà en attente pour cet email." }, { status: 409 });
    }

    // Crypto-safe token + placeholder password (user sets their own on activation)
    const token = cryptoRandomToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Use a random placeholder password hash — user creates their own
    // password on the /atelier/access page when accepting the invitation.
    const placeholder = cryptoRandomToken();
    const bcrypt = await import("bcryptjs");
    const placeholderHash = await bcrypt.hash(placeholder, 12);

    const invitation = await prisma.invitation.create({
      data: {
        token,
        email,
        name,
        passwordHash: placeholderHash,
        accountType: "essential",
        role: dbRole,
        createdById: session.user.id,
        companyId: caller.companyId || null,
        expiresAt,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    return NextResponse.json({
      status: "created",
      invitation,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError("console.users", `[/api/console/settings/users] POST failed: ${msg}`);
    return NextResponse.json({ error: "Failed to send invitation", detail: msg }, { status: 500 });
  }
}

// ─── PATCH — update role OR status ──────────────────────────────
export async function PATCH(req: NextRequest) {
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

    const body = await req.json();
    const userId = typeof body.userId === "string" ? body.userId : "";
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Prevent self-modification (role or suspension)
    if (userId === session.user.id) {
      return NextResponse.json({ error: "Vous ne pouvez pas modifier votre propre compte." }, { status: 409 });
    }

    // Look up the target user — must be in the caller's company (or
    // caller is privileged).
    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, status: true, companyId: true, email: true },
    });
    if (!target) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }

    const isPrivileged =
      caller.role === "admin" ||
      caller.role === "super_admin" ||
      caller.role === "company-admin" ||
      caller.role === "agency-admin";

    if (!isPrivileged) {
      return NextResponse.json({ error: "Forbidden — privilèges insuffisants." }, { status: 403 });
    }

    if (caller.role !== "super_admin" && caller.companyId && target.companyId !== caller.companyId) {
      return NextResponse.json({ error: "Cet utilisateur n'appartient pas à votre équipe." }, { status: 403 });
    }

    const updates: { role?: string; status?: string; sessionVersion?: { increment: number } } = {};

    // Role update
    if (typeof body.role === "string") {
      const roleMap: Record<string, string> = {
        admin: caller.role === "super_admin" ? "admin" : "company-admin",
        member: "user",
        viewer: "user",
      };
      const newRole = roleMap[body.role];
      if (!newRole) {
        return NextResponse.json({ error: `Rôle invalide: ${body.role}` }, { status: 400 });
      }
      updates.role = newRole;
    }

    // Status update (active | suspended)
    if (typeof body.status === "string") {
      const newStatus = body.status === "suspended" ? "suspended" : "active";
      updates.status = newStatus;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Aucune mise à jour spécifiée." }, { status: 400 });
    }

    // Bump sessionVersion so role/status changes take effect on next request
    updates.sessionVersion = { increment: 1 };

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updates,
      select: { id: true, email: true, role: true, status: true, sessionVersion: true },
    });

    return NextResponse.json({ ok: true, user: updated });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError("console.users", `[/api/console/settings/users] PATCH failed: ${msg}`);
    return NextResponse.json({ error: "Failed to update user", detail: msg }, { status: 500 });
  }
}

// ─── DELETE — remove user from team ─────────────────────────────
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

    const body = await req.json();
    const userId = typeof body.userId === "string" ? body.userId : "";
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    if (userId === session.user.id) {
      return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte." }, { status: 409 });
    }

    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, companyId: true, email: true },
    });
    if (!target) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }

    const isPrivileged =
      caller.role === "admin" ||
      caller.role === "super_admin" ||
      caller.role === "company-admin" ||
      caller.role === "agency-admin";

    if (!isPrivileged) {
      return NextResponse.json({ error: "Forbidden — privilèges insuffisants." }, { status: 403 });
    }

    if (caller.role !== "super_admin" && caller.companyId && target.companyId !== caller.companyId) {
      return NextResponse.json({ error: "Cet utilisateur n'appartient pas à votre équipe." }, { status: 403 });
    }

    // Soft-detach instead of hard delete: null companyId so they can no
    // longer access this team's data, but their account stays intact.
    // (Hard-delete would cascade-destruct reports, briefings, etc.)
    await prisma.user.update({
      where: { id: userId },
      data: {
        companyId: null,
        sessionVersion: { increment: 1 },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError("console.users", `[/api/console/settings/users] DELETE failed: ${msg}`);
    return NextResponse.json({ error: "Failed to remove user", detail: msg }, { status: 500 });
  }
}

// ─── Helpers ────────────────────────────────────────────────────
function cryptoRandomToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
