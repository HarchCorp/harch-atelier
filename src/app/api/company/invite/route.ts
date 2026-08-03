import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
  requireCompanyAdmin,
  toErrorResponse,
} from "@/lib/auth/company-scope";
import { logAudit, extractIp, extractUserAgent } from "@/lib/harchiq/audit-log";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { isDemoEmail } from "@/lib/demo-session";
import { demoCompanyInvitePostResponse, demoCompanyInviteListResponse } from "@/lib/demo-console-api";

// ═══════════════════════════════════════════════════════════════
//  POST /api/company/invite
//
//  Company-admin (or super-admin) invites a teammate to their
//  company. The invitation is pre-scoped to the caller's companyId
//  so when the invitee activates, they're automatically attached to
//  the right company.
//
//  Body: {
//    email:      string  (required)
//    name:       string  (required)
//    accountType?: "brand-monitor" | "market-competitor" | "investment-bank" | "harch-alpha"
//    role?:      "user" | "company-admin"  (default "user")
//    message?:   string
//  }
//
//  Returns: { invitation: { id, token, url, email, name, accountType, role, expiresAt } }
//
//  Auth: company-admin (scoped to their own companyId) or super-admin
//  (must pass ?companyId=XXX).
//
//  Task: company-dedup-enterprise-admin
// ═══════════════════════════════════════════════════════════════

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function generatePassword(): string {
  // Placeholder password (replaced when the invitee activates).
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let password = "";
  const bytes = crypto.randomBytes(12);
  for (let i = 0; i < 12; i++) {
    password += chars[bytes[i] % chars.length];
  }
  return password;
}

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // ─── DEMO BYPASS ─────────────────────────────────────────────
  const demoSession = await getServerSession(authOptions);
  if (demoSession?.user?.isDemo || isDemoEmail(demoSession?.user?.email)) {
    const demoBody = await req.json().catch(() => ({}));
    return demoCompanyInvitePostResponse(demoBody);
  }
  try {
    const scope = await requireCompanyAdmin();

    const body = await req.json().catch(() => ({}));
    const { email, name, accountType, role, message } = body as {
      email?: string;
      name?: string;
      accountType?: string;
      role?: string;
      message?: string;
    };

    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 },
      );
    }

    // Validate accountType
    const validAccountTypes = [
      "brand-monitor",
      "market-competitor",
      "investment-bank",
      "harch-alpha",
    ];
    const finalAccountType = validAccountTypes.includes(accountType ?? "")
      ? (accountType as string)
      : "brand-monitor";

    // Validate role: company-admin can invite as "user" or "company-admin".
    // (Super-admin goes through /api/admin/invitations for "admin" role.)
    const finalRole = role === "company-admin" ? "company-admin" : "user";

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 409 },
      );
    }

    // Check if there's an unused invitation for this email
    const existingInvitation = await prisma.invitation.findFirst({
      where: { email, usedAt: null },
    });
    if (existingInvitation) {
      return NextResponse.json(
        {
          error: "An unused invitation already exists for this email",
          existingToken: existingInvitation.token,
        },
        { status: 409 },
      );
    }

    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7-day expiry

    // Placeholder hash — replaced on activation
    const placeholderHash = await bcrypt.hash(generatePassword(), 12);

    const invitation = await prisma.invitation.create({
      data: {
        token,
        email,
        name,
        passwordHash: placeholderHash,
        accountType: finalAccountType,
        role: finalRole,
        message,
        createdById: scope.userId,
        expiresAt,
        companyId: scope.companyId, // scoped to caller's company
      },
    });

    const baseUrl =
      process.env.NEXTAUTH_URL || "https://atelier.harchcorp.com";
    const accessUrl = `${baseUrl}/atelier/access?token=${token}`;

    // ─── Audit log (Loi 09-08) — invitation created ──────────────
    await logAudit({
      userId: scope.userId,
      action: "user_invite",
      resource: `invitation:${invitation.id}`,
      result: "success",
      ipAddress: extractIp(req),
      userAgent: extractUserAgent(req),
      metadata: {
        invitedEmail: email,
        invitedName: name,
        invitedRole: finalRole,
        invitedAccountType: finalAccountType,
        companyId: scope.companyId,
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
        role: finalRole,
        companyId: scope.companyId,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}

// ═══════════════════════════════════════════════════════════════
//  GET /api/company/invite
//
//  Returns all invitations scoped to the caller's company.
//  Used by the EnterpriseAdminPanel to show pending invites.
// ═══════════════════════════════════════════════════════════════

export async function GET() {
  // ─── DEMO BYPASS ─────────────────────────────────────────────
  const demoSession = await getServerSession(authOptions);
  if (demoSession?.user?.isDemo || isDemoEmail(demoSession?.user?.email)) {
    return demoCompanyInviteListResponse();
  }
  try {
    const scope = await requireCompanyAdmin();

    const invitations = await prisma.invitation.findMany({
      where: { companyId: scope.companyId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        token: true,
        email: true,
        name: true,
        accountType: true,
        role: true,
        message: true,
        createdAt: true,
        expiresAt: true,
        usedAt: true,
        acceptedById: true,
      },
    });

    return NextResponse.json({ invitations, companyId: scope.companyId });
  } catch (err) {
    return toErrorResponse(err);
  }
}
