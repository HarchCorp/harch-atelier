// ═══════════════════════════════════════════════════════════════
//  GET /api/admin/users
//
//  Returns the full list of users with their company + last login +
//  status. Used by the Accounts tab of the admin dashboard.
//
//  Optional query params:
//    - q:      free-text search on email + name
//    - role:   filter by role (user | admin | company-admin)
//    - status: filter by status (active | suspended | invited)
//
//  Auth: admin only.
//
//  Task ID: ADMIN-1
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  accountType: string;
  status: string;
  companyId: string | null;
  companyName: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  onboardingCompleted: boolean;
  sessionVersion: number;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user?.role !== "admin" && session.user?.role !== "super_admin")) {
    return NextResponse.json(
      { error: "Forbidden — admin only" },
      { status: 403 },
    );
  }

  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.trim() || undefined;
    const role = url.searchParams.get("role") || undefined;
    const status = url.searchParams.get("status") || undefined;

    const where: {
      OR?: Array<{ email?: { contains: string; mode: "insensitive" }; name?: { contains: string; mode: "insensitive" } }>;
      role?: string;
      status?: string;
    } = {};

    if (q) {
      where.OR = [
        { email: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
      ];
    }
    if (role) where.role = role;
    if (status) where.status = status;

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 500, // safety cap
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        accountType: true,
        status: true,
        companyId: true,
        lastLoginAt: true,
        createdAt: true,
        onboardingCompleted: true,
        sessionVersion: true,
        company: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    const out: AdminUser[] = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      accountType: u.accountType,
      status: u.status,
      companyId: u.companyId,
      companyName: u.company?.name ?? null,
      lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
      createdAt: u.createdAt.toISOString(),
      onboardingCompleted: u.onboardingCompleted,
      sessionVersion: u.sessionVersion,
    }));

    return NextResponse.json({ users: out, count: out.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[/api/admin/users] GET failed:", msg);
    return NextResponse.json(
      { error: "Failed to fetch users", detail: msg },
      { status: 500 },
    );
  }
}

// ═══════════════════════════════════════════════════════════════
//  PATCH /api/admin/users
//
//  Body: { userId, role? }
//
//  Updates a user's role. Bumps sessionVersion to invalidate their
//  current JWT (they must re-sign-in to get a new token with the
//  updated role).
//
//  Auth: admin or super_admin only.
//  Task: YGGDRASIL-N25 (Permission UI)
// ═══════════════════════════════════════════════════════════════

const VALID_ROLES = [
  "super_admin", "admin", "agency-admin", "company-admin",
  "manager", "analyst", "viewer",
  "legacy_user_v1", "legacy_trial", "legacy_beta",
];

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only admin+ can change roles
  if (session.user.role !== "admin" && session.user.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden — admin role required" }, { status: 403 });
  }

  let body: { userId?: string; role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.userId || !body.role) {
    return NextResponse.json({ error: "userId and role are required" }, { status: 400 });
  }

  if (!VALID_ROLES.includes(body.role)) {
    return NextResponse.json({ error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` }, { status: 400 });
  }

  // Prevent self-demotion (admin can't remove their own admin role)
  if (body.userId === session.user.id) {
    return NextResponse.json({ error: "Cannot modify your own role" }, { status: 409 });
  }

  try {
    const updated = await prisma.user.update({
      where: { id: body.userId },
      data: {
        role: body.role,
        // Bump sessionVersion → invalidates current JWT
        // User must re-sign-in to get a token with the new role
        sessionVersion: { increment: 1 },
      },
      select: { id: true, email: true, role: true, sessionVersion: true },
    });

    return NextResponse.json({
      ok: true,
      user: updated,
      message: `Role updated to ${body.role}. User must re-sign-in (sessionVersion bumped).`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Failed to update user", detail: msg }, { status: 500 });
  }
}
