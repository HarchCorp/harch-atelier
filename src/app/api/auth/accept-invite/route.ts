import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { logAudit, extractIp, extractUserAgent } from "@/lib/harchiq/audit-log";
import { logInfo, logError } from "@/lib/logger";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AcceptInviteSchema = z.object({
  token: z.string().min(1).max(200),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  name: z.string().min(1).max(200).optional(),
});

// ═══════════════════════════════════════════════════════════════
//  POST /api/auth/accept-invite
//
//  Body: { token, password, name? }
//
//  Validates the invitation token, creates a new User with the
//  user-chosen password, marks the invitation as used, and logs
//  the audit trail. The user can then sign in via /atelier/login.
//
//  Security:
//    - Token must exist, not be used, not be expired
//    - Password is bcrypt-hashed (12 rounds) — never stored plaintext
//    - Single-use: once accepted, the token is burned (usedAt set)
//    - Rate-limited: 5 attempts per IP per 10 minutes (anti-brute-force)
//    - Audit logged (Loi 09-08 / CNDP)
//
//  Task ID: YGGDRASIL-N50 (Invitation system)
// ═══════════════════════════════════════════════════════════════

const ipAttempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipAttempts.get(ip);
  if (!entry || entry.resetAt < now) {
    ipAttempts.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = extractIp(req);

  // Rate limit: 5 per IP per 10 min
  if (!checkRateLimit(ip || "unknown")) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again in 10 minutes." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = AcceptInviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { token, password, name } = parsed.data;

  // 1. Find the invitation
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { createdBy: { select: { name: true, email: true } } },
  });

  if (!invitation) {
    return NextResponse.json(
      { error: "Invalid invitation token." },
      { status: 404 },
    );
  }

  // 2. Check if already used
  if (invitation.usedAt) {
    return NextResponse.json(
      { error: "This invitation has already been used." },
      { status: 410 },
    );
  }

  // 3. Check if expired
  if (invitation.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "This invitation has expired. Please request a new one." },
      { status: 410 },
    );
  }

  // 4. Check if user already exists with this email
  const existingUser = await prisma.user.findUnique({
    where: { email: invitation.email },
  });
  if (existingUser) {
    return NextResponse.json(
      { error: "An account with this email already exists. Please sign in instead." },
      { status: 409 },
    );
  }

  // 5. Hash the password + create the user
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const user = await prisma.user.create({
      data: {
        name: name || invitation.name,
        email: invitation.email,
        passwordHash,
        role: invitation.role,
        accountType: invitation.accountType,
        status: "active",
        onboardingCompleted: false, // user must complete onboarding
      },
    });

    // 6. Mark invitation as used
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        usedAt: new Date(),
        acceptedById: user.id,
      },
    });

    // 7. Audit log
    await logAudit({
      userId: user.id,
      action: "invitation_accepted",
      resource: `invitation:${invitation.id}`,
      result: "success",
      ipAddress: ip,
      userAgent: extractUserAgent(req),
      metadata: {
        email: user.email,
        role: user.role,
        accountType: user.accountType,
        invitedBy: invitation.createdBy?.email,
      },
    });

    logInfo("auth.accept-invite", `User ${user.email} accepted invitation from ${invitation.createdBy?.email ?? "unknown"}`);

    return NextResponse.json({
      ok: true,
      message: "Account created successfully. You can now sign in.",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create account", detail: msg },
      { status: 500 },
    );
  }
}
