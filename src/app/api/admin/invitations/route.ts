import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { logAudit, extractIp, extractUserAgent } from "@/lib/harchiq/audit-log";

// ═══════════════════════════════════════════════════════════════
//  GET /api/admin/invitations — list all invitations (admin only)
//  POST /api/admin/invitations — create a new invitation (admin only)
//
//  POST body: { email, name, accountType, role?, company?, message?, requestId? }
//  Returns: { invitation: { id, token, url, email, name, password } }
//
//  The password is auto-generated (12 chars, secure random).
//  The admin can copy the URL + password and send them to the user
//  via their preferred channel (email, WhatsApp, etc.).
// ═══════════════════════════════════════════════════════════════

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let password = "";
  const bytes = crypto.randomBytes(12);
  for (let i = 0; i < 12; i++) {
    password += chars[bytes[i] % chars.length];
  }
  return password;
}

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
  }

  try {
    const invitations = await prisma.invitation.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        token: true,
        email: true,
        name: true,
        accountType: true,
        role: true,
        company: true,
        companyId: true,
        message: true,
        createdAt: true,
        expiresAt: true,
        usedAt: true,
        acceptedById: true,
      },
    });

    return NextResponse.json({ invitations });
  } catch (err) {
    console.error("Admin invitations GET error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { email, name, role, company, message, requestId, accountType, companyId } = body;

    if (!email || !name) {
      return NextResponse.json({ error: "Email and name are required" }, { status: 400 });
    }

    // Validate accountType
    const validAccountTypes = ["brand-monitor", "market-competitor", "investment-bank", "harch-alpha"];
    const finalAccountType = validAccountTypes.includes(accountType) ? accountType : "brand-monitor";

    // Validate role — super-admin can create any role.
    // (company-admin role implies the new user will be attached to the
    // specified companyId on activation.)
    const validRoles = ["user", "admin", "company-admin"];
    const finalRole = validRoles.includes(role) ? role : "user";

    // If companyId is provided, verify it exists
    if (companyId) {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { id: true, name: true },
      });
      if (!company) {
        return NextResponse.json(
          { error: "Specified companyId does not exist" },
          { status: 400 },
        );
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 409 });
    }

    // Check if there's an unused invitation for this email
    const existingInvitation = await prisma.invitation.findFirst({
      where: { email, usedAt: null },
    });
    if (existingInvitation) {
      return NextResponse.json({
        error: "An unused invitation already exists for this email",
        existingToken: existingInvitation.token,
      }, { status: 409 });
    }

    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7-day expiry

    // NO temporary password — user creates their own on the access page
    // We store a placeholder hash (will be replaced when user activates)
    const placeholderHash = await bcrypt.hash(generatePassword(), 12);

    const invitation = await prisma.invitation.create({
      data: {
        token,
        email,
        name,
        passwordHash: placeholderHash,  // placeholder — replaced on activation
        accountType: finalAccountType,
        role: finalRole,
        company,
        message,
        createdById: session.user?.id,
        expiresAt,
        companyId: companyId || null,
      },
    });

    // If this was created from an access request, link + mark as accepted
    if (requestId) {
      await prisma.accessRequest.update({
        where: { id: requestId },
        data: {
          status: "accepted",
          invitationId: invitation.id,
        },
      });
    }

    // Build the access URL
    const baseUrl = process.env.NEXTAUTH_URL || "https://atelier.harchcorp.com";
    const accessUrl = `${baseUrl}/atelier/access?token=${token}`;

    // ─── Audit log (Loi 09-08) — admin-created invitation ────────
    await logAudit({
      userId: session.user?.id,
      action: "user_invite",
      resource: `invitation:${invitation.id}`,
      result: "success",
      ipAddress: extractIp(req),
      userAgent: extractUserAgent(req),
      metadata: {
        invitedEmail: email,
        invitedName: name,
        invitedRole: invitation.role,
        invitedAccountType: finalAccountType,
        companyId: invitation.companyId ?? null,
        requestId: requestId ?? null,
      },
    });

    return NextResponse.json({
      status: "created",
      invitation: {
        id: invitation.id,
        token,
        url: accessUrl,
        email,
        name,
        accountType: finalAccountType,
        role: invitation.role,
        companyId: invitation.companyId,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (err) {
    console.error("Admin invitations POST error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
