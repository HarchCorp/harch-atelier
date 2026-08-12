import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  requireCompanyAdmin,
  toErrorResponse,
} from "@/lib/auth/company-scope";
import { logAudit, extractIp, extractUserAgent } from "@/lib/harchiq/audit-log";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { isDemoEmail } from "@/lib/demo-session";
import { demoCompanyTeamResponse, demoCompanyTeamPatchResponse, demoCompanyTeamDeleteResponse } from "@/lib/demo-console-api";

// ═══════════════════════════════════════════════════════════════
//  GET /api/company/team
//    Returns all users attached to the caller's company.
//    Includes last login (lastLoginAt) + status.
//
//  PATCH /api/company/team
//    Body: { userId, role?, accountType?, status? }
//    Update a teammate's role/accountType/status within the caller's
//    company. Cannot touch users outside the company.
//    Cannot promote to "admin" (super-admin only — use /api/admin/*).
//    Cannot demote yourself (would lock the panel).
//
//  DELETE /api/company/team?userId=XXX
//    Suspend a user (set status="suspended"). Does NOT delete the
//    row — preserves audit history. Reversible via PATCH.
//
//  Auth: company-admin only (scoped to their own companyId).
//
//  Task: company-dedup-enterprise-admin
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export async function GET() {
  // ─── DEMO BYPASS ─────────────────────────────────────────────
  const demoSession = await getServerSession(authOptions);
  if (demoSession?.user?.isDemo || isDemoEmail(demoSession?.user?.email)) {
    return demoCompanyTeamResponse();
  }
  try {
    const scope = await requireCompanyAdmin();

    const [users, invitations] = await Promise.all([
      prisma.user.findMany({
        where: { companyId: scope.companyId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          accountType: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
          whatsappAlerts: true,
          whatsappNumber: true,
        },
      }),
      prisma.invitation.count({
        where: {
          companyId: scope.companyId,
          usedAt: null,
          expiresAt: { gte: new Date() },
        },
      }),
    ]);

    return NextResponse.json({
      users,
      companyId: scope.companyId,
      pendingInvitations: invitations,
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function PATCH(req: NextRequest) {
  // ─── DEMO BYPASS ─────────────────────────────────────────────
  const demoSession = await getServerSession(authOptions);
  if (demoSession?.user?.isDemo || isDemoEmail(demoSession?.user?.email)) {
    const demoBody = await req.json().catch(() => ({}));
    return demoCompanyTeamPatchResponse(demoBody);
  }
  try {
    const scope = await requireCompanyAdmin();

    const body = await req.json().catch(() => ({}));
    const { userId, role, accountType, status } = body as {
      userId?: string;
      role?: string;
      accountType?: string;
      status?: string;
    };

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    // Verify the target belongs to the caller's company
    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, companyId: true, role: true },
    });
    if (!target) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }
    if (target.companyId !== scope.companyId) {
      return NextResponse.json(
        { error: "Forbidden — user is not in your company" },
        { status: 403 },
      );
    }

    // Cannot demote yourself (would lock the panel)
    if (userId === scope.userId && role && role !== "company-admin") {
      return NextResponse.json(
        {
          error:
            "You cannot demote yourself — ask another company-admin or the super-admin.",
        },
        { status: 400 },
      );
    }

    // Cannot promote to super-admin (role=admin) — only /api/admin/* can.
    if (role === "admin") {
      return NextResponse.json(
        {
          error:
            'Cannot promote to super-admin ("admin") — use the super-admin panel.',
        },
        { status: 400 },
      );
    }

    // Validate accountType — accept both new canonical types
    // (essential/pro/enterprise/agency) and legacy types
    // (brand-monitor/market-competitor/investment-bank/harch-alpha)
    // during the migration window.
    const validAccountTypes = [
      "essential", "pro", "enterprise", "agency",
      "essential", "pro", "enterprise", "agency", "brand-monitor", "market-competitor", "investment-bank", "harch-alpha",
    ];
    const finalAccountType =
      accountType && validAccountTypes.includes(accountType)
        ? accountType
        : undefined;

    // Validate role (only "user" or "company-admin")
    const validRoles = ["user", "company-admin"];
    const finalRole =
      role && validRoles.includes(role) ? role : undefined;

    // Validate status
    const validStatuses = ["active", "suspended"];
    const finalStatus =
      status && validStatuses.includes(status) ? status : undefined;

    const data: Record<string, string> = {};
    if (finalRole) data.role = finalRole;
    if (finalAccountType) data.accountType = finalAccountType;
    if (finalStatus) data.status = finalStatus;

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        accountType: true,
        status: true,
        lastLoginAt: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function DELETE(req: NextRequest) {
  // ─── DEMO BYPASS ─────────────────────────────────────────────
  const demoSession = await getServerSession(authOptions);
  if (demoSession?.user?.isDemo || isDemoEmail(demoSession?.user?.email)) {
    return demoCompanyTeamDeleteResponse();
  }
  try {
    const scope = await requireCompanyAdmin();

    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json(
        { error: "userId query param is required" },
        { status: 400 },
      );
    }

    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, companyId: true, role: true },
    });
    if (!target) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }
    if (target.companyId !== scope.companyId) {
      return NextResponse.json(
        { error: "Forbidden — user is not in your company" },
        { status: 403 },
      );
    }

    // Cannot suspend yourself
    if (userId === scope.userId) {
      return NextResponse.json(
        { error: "You cannot suspend your own account" },
        { status: 400 },
      );
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { status: "suspended" },
      select: { id: true, status: true },
    });

    // ─── Audit log (Loi 09-08) — user suspended ──────────────────
    await logAudit({
      userId: scope.userId,
      action: "user_suspend",
      resource: `user:${userId}`,
      result: "success",
      ipAddress: extractIp(req),
      userAgent: extractUserAgent(req),
      metadata: {
        suspendedUserId: userId,
        companyId: scope.companyId,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (err) {
    return toErrorResponse(err);
  }
}
