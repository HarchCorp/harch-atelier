// ═══════════════════════════════════════════════════════════════════
//  BOSS BOOTSTRAP — One-time super_admin creation endpoint
//
//  URL: /api/admin/bootstrap-boss
//  Security: ONLY works if no super_admin exists in the DB. Once the
//  first super_admin is created, this endpoint locks itself (403 forever).
//
//  This is the "Bat Cave" key — the boss uses this ONCE to create
//  their account, then it's sealed.
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { logAudit, extractIp, extractUserAgent } from "@/lib/harchiq/audit-log";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // ─── LOCK: if any super_admin exists, this endpoint is sealed ───
    const existingBoss = await prisma.user.findFirst({
      where: { role: "super_admin" },
      select: { id: true, email: true },
    });
    if (existingBoss) {
      return NextResponse.json(
        { error: "Bootstrap sealed — a super_admin already exists. Contact the boss." },
        { status: 403 },
      );
    }

    // ─── BODY VALIDATION ───
    const body = await req.json();
    const { email, name, password, masterKey } = body as {
      email?: string;
      name?: string;
      password?: string;
      masterKey?: string;
    };

    if (!email || !name || !password || !masterKey) {
      return NextResponse.json(
        { error: "Missing fields: email, name, password, masterKey all required" },
        { status: 400 },
      );
    }

    // ─── MASTER KEY CHECK ───
    // The boss must know this key to bootstrap. Change it in production
    // via environment variable HARCH_BOSS_BOOTSTRAP_KEY.
    const expectedKey = process.env.HARCH_BOSS_BOOTSTRAP_KEY ?? "HARCH-BOSS-2026-KAEL-VANCE-7F3A9B";
    if (masterKey !== expectedKey) {
      return NextResponse.json(
        { error: "Invalid master key" },
        { status: 401 },
      );
    }

    if (password.length < 12) {
      return NextResponse.json(
        { error: "Password must be at least 12 characters" },
        { status: 400 },
      );
    }

    // ─── CHECK email not taken ───
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered — use a different email" },
        { status: 409 },
      );
    }

    // ─── CREATE THE BOSS ───
    const passwordHash = await bcrypt.hash(password, 12);
    const boss = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: "super_admin",
        accountType: "enterprise",
        status: "active",
        onboardingCompleted: true,
      },
      select: { id: true, email: true, name: true, role: true },
    });

    // ─── AUDIT TRAIL ───
    await logAudit({
      userId: boss.id,
      action: "boss_bootstrap",
      resource: "auth",
      result: "success",
      ipAddress: extractIp(req),
      userAgent: extractUserAgent(req),
      metadata: { email, name, method: "bootstrap-boss" },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      boss: { id: boss.id, email: boss.email, name: boss.name, role: boss.role },
      message: "Boss account created. Login at /atelier/admin-x7k2m9",
      loginUrl: "/atelier/admin-x7k2m9",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Bootstrap failed", detail: message },
      { status: 500 },
    );
  }
}

// GET — check if bootstrap is still available
export async function GET() {
  try {
    const existingBoss = await prisma.user.findFirst({
      where: { role: "super_admin" },
      select: { id: true },
    });
    return NextResponse.json({
      bootstrapAvailable: !existingBoss,
      message: existingBoss
        ? "Bootstrap sealed — boss account exists"
        : "Bootstrap available — POST to create the first super_admin",
    });
  } catch {
    return NextResponse.json({ bootstrapAvailable: false, error: "DB check failed" });
  }
}
