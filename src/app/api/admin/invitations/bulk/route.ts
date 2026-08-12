// ═══════════════════════════════════════════════════════════════
//  /api/admin/invitations/bulk
//
//  POST — create multiple invitations at once (Mode 2 "Admin").
//
//  Body: { companyId, count, accountType, role, expirationDays }
//
//  Generates `count` unique invitation tokens in the DB (re-using the
//  existing Invitation model from /api/admin/invitations) and returns
//  an array of { token, url, emailPlaceholder, status, expiresAt }.
//  Each invitation is intentionally NOT pre-bound to a specific email —
//  the admin will distribute the individual URLs to employees and the
//  employee's email is captured when they accept the invitation.
//
//  Auth: admin / super_admin only (canAccessAdmin).
//
//  Cap: count <= 100 per call (safety). expirationDays <= 365.
//
//  Task ID: BATCAVE-3-EMPLOYEES
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { canAccessAdmin } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { logAudit, extractIp, extractUserAgent } from "@/lib/harchiq/audit-log";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

// ─── HELPERS ──────────────────────────────────────────────────────

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

interface BulkInvitationResult {
  token: string;
  url: string;
  emailPlaceholder: string;   // "employe-<n>@<company-slug>.local"
  status: "active";
  expiresAt: string;
}

// ─── POST — bulk invitation creation ─────────────────────────────

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || !canAccessAdmin(session.user.role)) {
    return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
  }

  let body: {
    companyId?: string;
    count?: number;
    accountType?: string;
    role?: string;
    expirationDays?: number;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { companyId, count, accountType, role, expirationDays } = body;

  // ─── Validate ─────────────────────────────────────────────────
  if (!companyId || typeof companyId !== "string") {
    return NextResponse.json({ error: "companyId est requis" }, { status: 400 });
  }
  const n = Math.floor(Number(count) || 0);
  if (!Number.isFinite(n) || n <= 0) {
    return NextResponse.json({ error: "count doit etre un entier positif" }, { status: 400 });
  }
  if (n > 100) {
    return NextResponse.json(
      { error: "count ne peut pas depasser 100 par appel" },
      { status: 400 },
    );
  }

  const expDays = Math.min(Math.max(Math.floor(Number(expirationDays) || 7), 1), 365);

  const validAccountTypes = ["essential", "pro", "enterprise", "agency"];
  const finalAccountType = validAccountTypes.includes(accountType as string)
    ? (accountType as string)
    : "essential";

  const validRoles = ["user", "admin", "company-admin"];
  const finalRole = validRoles.includes(role as string) ? (role as string) : "user";

  // ─── Verify company exists (if Prisma knows about it) ─────────
  let companySlug = "entreprise";
  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true, slug: true },
    });
    if (!company) {
      return NextResponse.json(
        { error: "CompanyId inconnu — provisionnez la societe d'abord" },
        { status: 400 },
      );
    }
    companySlug = company.slug || "entreprise";
  } catch (err) {
    logError("admin.invitations.bulk", `Company lookup failed: ${err}`);
    // Continue with default slug — company may be a localStorage-only entry
  }

  // ─── Generate N invitations ───────────────────────────────────
  const baseUrl = process.env.NEXTAUTH_URL || "https://atelier.harchcorp.com";
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expDays);

  const results: BulkInvitationResult[] = [];

  try {
    // Create sequentially to avoid batch-transaction deadlocks on
    // unique-token constraint (extremely rare with 32-byte random).
    for (let i = 0; i < n; i++) {
      const token = generateToken();
      const placeholderHash = await bcrypt.hash(generatePassword(), 12);
      const emailPlaceholder = `employe-${i + 1}@${companySlug}.bulk`;

      await prisma.invitation.create({
        data: {
          token,
          email: emailPlaceholder,
          name: `Employe ${i + 1}`,
          passwordHash: placeholderHash,
          accountType: finalAccountType,
          role: finalRole,
          company: companySlug,
          createdById: session.user?.id,
          companyId,
          expiresAt,
          // message left null — admin can annotate later via PATCH
        },
      });

      results.push({
        token,
        url: `${baseUrl}/atelier/access?token=${token}`,
        emailPlaceholder,
        status: "active",
        expiresAt: expiresAt.toISOString(),
      });
    }
  } catch (err) {
    logError("admin.invitations.bulk", `Bulk create failed mid-loop: ${err}`);
    return NextResponse.json(
      {
        error: "Erreur creation en masse",
        detail: err instanceof Error ? err.message : String(err),
        partial: results,   // already-created invitations are returned
      },
      { status: 500 },
    );
  }

  // ─── Audit log (one entry per batch, Loi 09-08) ───────────────
  try {
    await logAudit({
      userId: session.user?.id,
      action: "employee_invited",
      resource: `invitation:bulk:${companyId}`,
      result: "success",
      ipAddress: extractIp(req),
      userAgent: extractUserAgent(req),
      metadata: {
        companyId,
        count: n,
        accountType: finalAccountType,
        role: finalRole,
        expirationDays: expDays,
        tokens: results.map((r) => r.token),
      },
    });
  } catch (err) {
    logError("admin.invitations.bulk", `Audit log failed: ${err}`);
  }

  return NextResponse.json({
    ok: true,
    companyId,
    count: results.length,
    accountType: finalAccountType,
    role: finalRole,
    expiresAt: expiresAt.toISOString(),
    invitations: results,
  });
}
