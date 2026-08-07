import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { hasPermission } from "@/lib/auth/rbac";
import { logAudit, extractIp, extractUserAgent } from "@/lib/harchiq/audit-log";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ═══════════════════════════════════════════════════════════════
//  POST /api/admin/revoke-session
//
//  Body: { userId: string }
//
//  Bumps the user's sessionVersion → all existing JWTs become invalid.
//  The user is forced to re-sign-in on their next request.
//
//  Auth: requires admin or super_admin role (users:write permission).
//
//  Task ID: YGGDRASIL-N40 (Revocation temps réel)
// ═══════════════════════════════════════════════════════════════

const Schema = z.object({
  userId: z.string().min(1).max(100),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Permission check: admin or super_admin can revoke sessions
  const canRevoke = hasPermission(session.user.role as any, "users:write");
  if (!canRevoke) {
    return NextResponse.json(
      { error: "Forbidden — admin role required to revoke sessions" },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { userId } = parsed.data;

  // Prevent self-revocation (admin shouldn't lock themselves out)
  if (userId === session.user.id) {
    return NextResponse.json(
      { error: "Cannot revoke your own session. Ask another admin." },
      { status: 409 },
    );
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, sessionVersion: true },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Bump sessionVersion — existing JWTs with the old version will be rejected
  const newVersion = targetUser.sessionVersion + 1;
  await prisma.user.update({
    where: { id: userId },
    data: { sessionVersion: newVersion },
  });

  await logAudit({
    userId: session.user.id,
    action: "session_revoked",
    resource: `user:${userId}`,
    result: "success",
    ipAddress: extractIp(req),
    userAgent: extractUserAgent(req),
    metadata: {
      targetUser: targetUser.email,
      targetRole: targetUser.role,
      newSessionVersion: newVersion,
    },
  });

  return NextResponse.json({
    ok: true,
    message: `Session revoked for ${targetUser.email}. User must re-sign-in.`,
    userId,
    newSessionVersion: newVersion,
  });
}
