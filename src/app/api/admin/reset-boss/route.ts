// ═══════════════════════════════════════════════════════════════════
//  BOSS RESET — Set password on the existing super_admin account
//
//  URL: /api/admin/reset-boss
//  Security: requires the HARCH_BOSS_BOOTSTRAP_KEY (now "HarchAmine2727")
//
//  Use case: the bootstrap endpoint is sealed (a super_admin exists),
//  but the boss needs to set/reset their password. This endpoint:
//    1. Verifies the masterKey
//    2. Finds the existing super_admin
//    3. Updates email + name + password (boss takeover)
//    4. Logs to AuditLog
//
//  Can be called again if password is forgotten.
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { logAudit, extractIp, extractUserAgent } from "@/lib/harchiq/audit-log";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, password, masterKey } = body as {
      email?: string;
      name?: string;
      password?: string;
      masterKey?: string;
    };

    if (!email || !password || !masterKey) {
      return NextResponse.json(
        { error: "Missing fields: email, password, masterKey required" },
        { status: 400 },
      );
    }

    const expectedKey = process.env.HARCH_BOSS_BOOTSTRAP_KEY ?? "HARCH-BOSS-2026-KAEL-VANCE-7F3A9B";
    if (masterKey !== expectedKey) {
      return NextResponse.json(
        { error: "Invalid master key" },
        { status: 401 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    // ─── FIND EXISTING SUPER_ADMIN ───
    const existingBoss = await prisma.user.findFirst({
      where: { role: "super_admin" },
      select: { id: true, email: true, name: true },
    });

    const passwordHash = await bcrypt.hash(password, 12);

    if (!existingBoss) {
      // No super_admin exists → create one
      if (!name) {
        return NextResponse.json(
          { error: "No super_admin exists. Provide 'name' to create one." },
          { status: 400 },
        );
      }

      const emailTaken = await prisma.user.findUnique({ where: { email } });
      if (emailTaken) {
        return NextResponse.json(
          { error: "Email already registered to another user" },
          { status: 409 },
        );
      }

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

      await logAudit({
        userId: boss.id,
        action: "boss_bootstrap",
        resource: "auth",
        result: "success",
        ipAddress: extractIp(req),
        userAgent: extractUserAgent(req),
        metadata: { email, name, method: "reset-boss-create" },
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        boss: { id: boss.id, email: boss.email, name: boss.name, role: boss.role },
        message: "Boss account created. Login at /atelier/admin-x7k2m9",
        loginUrl: "/atelier/admin-x7k2m9",
      });
    }

    // ─── UPDATE EXISTING SUPER_ADMIN (boss takeover) ───
    const updated = await prisma.user.update({
      where: { id: existingBoss.id },
      data: {
        email,
        name: name ?? existingBoss.name ?? "Boss",
        passwordHash,
        role: "super_admin",
        accountType: "enterprise",
        status: "active",
        onboardingCompleted: true,
      },
      select: { id: true, email: true, name: true, role: true },
    });

    await logAudit({
      userId: updated.id,
      action: "boss_bootstrap",
      resource: "auth",
      result: "success",
      ipAddress: extractIp(req),
      userAgent: extractUserAgent(req),
      metadata: {
        method: "reset-boss-update",
        oldEmail: existingBoss.email,
        newEmail: email,
        name: name ?? existingBoss.name,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      boss: { id: updated.id, email: updated.email, name: updated.name, role: updated.role },
      message: "Boss account updated. Login at /atelier/admin-x7k2m9",
      loginUrl: "/atelier/admin-x7k2m9",
      note: existingBoss.email !== email
        ? `Email changed from ${existingBoss.email} to ${email}`
        : "Password updated",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Reset failed", detail: message },
      { status: 500 },
    );
  }
}
