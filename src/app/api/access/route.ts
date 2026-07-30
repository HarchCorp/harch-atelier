import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════════
//  POST /api/access?token=XXX
//
//  Public route — accepts an invitation.
//  Creates a user account from the invitation data + the password
//  the user chose on the access page.
//
//  Body: { password } — REQUIRED (user creates their own password,
//  no temporary password anymore)
// ═══════════════════════════════════════════════════════════════

const Schema = z.object({
  password: z.string().min(8).max(100),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const token = new URL(req.url).searchParams.get("token");
    if (!token) {
      return NextResponse.json({ error: "Missing invitation token" }, { status: 400 });
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invalid invitation token" }, { status: 404 });
    }

    if (invitation.usedAt) {
      return NextResponse.json(
        { error: "This invitation has already been used. Please sign in directly." },
        { status: 409 }
      );
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This invitation has expired. Please request a new one." },
        { status: 410 }
      );
    }

    // Check if user already exists (shouldn't happen, but safety)
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account already exists with this email." },
        { status: 409 }
      );
    }

    // Parse REQUIRED password (user creates their own)
    const body = await req.json().catch(() => ({}));
    const parsed = Schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Password is required (min 8 characters)", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    // Create the user
    const user = await prisma.user.create({
      data: {
        email: invitation.email,
        name: invitation.name,
        passwordHash,
        role: invitation.role,
        
        accountType: invitation.accountType,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        
        accountType: true,
      },
    });

    // Mark invitation as used
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        usedAt: new Date(),
        acceptedById: user.id,
      },
    });

    return NextResponse.json({
      status: "created",
      user,
      message: "Your account is ready. You can now sign in.",
    });
  } catch (err) {
    console.error("Access acceptance error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Acceptance failed" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════════
//  GET /api/access?token=XXX
//
//  Returns invitation details (without the password) so the user
//  can review what the admin set up before accepting.
// ═══════════════════════════════════════════════════════════════

export async function GET(req: NextRequest) {
  try {
    const token = new URL(req.url).searchParams.get("token");
    if (!token) {
      return NextResponse.json({ error: "Missing invitation token" }, { status: 400 });
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      select: {
        id: true,
        email: true,
        name: true,
        
        role: true,
        accountType: true,
        company: true,
        message: true,
        createdAt: true,
        expiresAt: true,
        usedAt: true,
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invalid invitation token" }, { status: 404 });
    }

    if (invitation.usedAt) {
      return NextResponse.json({
        ...invitation,
        status: "already_used",
        message: "This invitation has already been used.",
      });
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({
        ...invitation,
        status: "expired",
        message: "This invitation has expired.",
      });
    }

    return NextResponse.json({
      ...invitation,
      status: "valid",
    });
  } catch (err) {
    console.error("Invitation lookup error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lookup failed" },
      { status: 500 }
    );
  }
}
