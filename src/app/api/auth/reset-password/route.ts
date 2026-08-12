// ═══════════════════════════════════════════════════════════════
//  /api/auth/reset-password
//
//  POST: Request a password reset (sends email with reset link)
//    Body: { email }
//    - Always returns 200 (don't leak whether email exists)
//    - If email exists: creates a reset token (Invitation with
//      role="password-reset", expires in 1 hour) + sends email
//
//  PATCH: Execute the password reset (set new password)
//    Body: { token, password }
//    - Validates token (must exist, not used, not expired)
//    - Updates user.passwordHash
//    - Marks token as used
//    - Returns 200 on success
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email/send";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

// ─── POST: Request reset ───────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email } = z.object({ email: z.string().email() }).parse(body);

    // Always return 200 — don't leak whether email exists
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // Create a reset token (reuse Invitation model with special role)
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.invitation.create({
        data: {
          token,
          email: user.email,
          name: user.name ?? "",
          passwordHash: "", // not used for reset
          accountType: user.accountType ?? "essential",
          role: "password-reset",
          company: null,
          companyId: user.companyId,
          message: "Password reset request",
          expiresAt,
        },
      });

      const baseUrl = process.env.NEXTAUTH_URL ?? "https://atelier.harchcorp.com";
      const resetUrl = `${baseUrl}/atelier/reset-password?token=${token}`;

      void sendPasswordResetEmail({
        email: user.email,
        name: user.name ?? "",
        resetUrl,
      });
    }

    return NextResponse.json({
      ok: true,
      message: "Si cet email existe, un lien de réinitialisation a été envoyé.",
    });
  } catch (err) {
    logError("auth.reset-password", `POST error: ${err}`);
    return NextResponse.json({ ok: true }); // Don't leak errors
  }
}

// ─── PATCH: Execute reset ──────────────────────────────────────

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { token, password } = z.object({
      token: z.string().min(1),
      password: z.string().min(8).max(100),
    }).parse(body);

    const invitation = await prisma.invitation.findUnique({ where: { token } });

    if (!invitation || invitation.role !== "password-reset") {
      return NextResponse.json({ error: "Token invalide" }, { status: 404 });
    }

    if (invitation.usedAt) {
      return NextResponse.json({ error: "Ce lien a déjà été utilisé" }, { status: 410 });
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({ error: "Ce lien a expiré" }, { status: 410 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { email: invitation.email },
      data: { passwordHash },
    });

    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { usedAt: new Date() },
    });

    return NextResponse.json({ ok: true, message: "Mot de passe réinitialisé" });
  } catch (err) {
    logError("auth.reset-password", `PATCH error: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Réinitialisation échouée" },
      { status: 500 },
    );
  }
}
