// ═══════════════════════════════════════════════════════════════
//  POST /api/admin/create-account
//
//  Premium account creation flow — the admin specifies a custom
//  pricing + expiration that's stored against the CompanySettings
//  row, then a User + Invitation is created.
//
//  Flow:
//    1. Admin authenticates (role === "admin").
//    2. Body validation: { email, name, companyName, planTier,
//       customPriceMAD, expirationDays | expirationDate, accountType,
//       role?, phone?, topics?, competitors?, useCase?, notes? }
//    3. findOrCreateCompany (3-stage dedup: ICE → slug → fuzzy name).
//    4. Create User with random bcrypt-hashed password + status="invited".
//    5. Upsert CompanySettings — custom pricing is encoded into the
//       existing `alertThresholds` JSON column as
//       { customPriceMAD, planTier, expirationDays, useCase, notes }.
//    6. Create Invitation (token + URL) with the computed expiration.
//    7. Audit log — admin created an account.
//    8. Return { user, company, invitation: { url, expiresAt } }.
//
//  Auth: admin only.
//
//  Task ID: ADMIN-1
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { findOrCreateCompany, slugify } from "@/lib/harchiq/company-dedup";
import { logAudit, extractIp, extractUserAgent } from "@/lib/harchiq/audit-log";
import { logInfo, logError } from "@/lib/logger";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

// ─── TYPES ────────────────────────────────────────────────────────

type PlanTier = "essential" | "pro" | "enterprise" | "agency" | "custom";

const VALID_ACCOUNT_TYPES = new Set([
  "essential",
  "pro",
  "enterprise",
  "agency",
]);

const VALID_PLAN_TIERS = new Set<PlanTier>([
  "essential",
  "pro",
  "enterprise",
  "agency",
  "custom",
]);

const VALID_ROLES = new Set(["user", "admin", "company-admin", "commercial"]);

interface CreateAccountBody {
  email: string;
  name: string;
  companyName: string;
  planTier: PlanTier;
  customPriceMAD: number | string | null;
  expirationDays?: number | null;
  expirationDate?: string | null; // ISO — overrides expirationDays
  accountType: string;
  role?: string;
  phone?: string | null;
  sector?: string | null;
  topics?: string[];
  competitors?: string[];
  useCase?: string | null;
  notes?: string | null;
  requestId?: string | null; // optional: link back to an AccessRequest
}

interface CreatedAccountResponse {
  success: true;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    accountType: string;
    status: string;
    companyId: string | null;
    temporaryPassword: string;
  };
  company: {
    id: string;
    name: string;
    slug: string;
    sector: string;
    created: boolean;
  };
  invitation: {
    id: string;
    token: string;
    url: string;
    expiresAt: string;
  };
  pricing: {
    planTier: PlanTier;
    customPriceMAD: number | null;
    expirationDays: number | null;
  };
}

// ─── HELPERS ──────────────────────────────────────────────────────

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function generatePassword(): string {
  // 12 chars — secure random, avoiding ambiguous glyphs (0/O, 1/l/I).
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let password = "";
  const bytes = crypto.randomBytes(12);
  for (let i = 0; i < 12; i++) {
    password += chars[bytes[i] % chars.length];
  }
  return password;
}

function parsePriceMAD(v: unknown): number | null {
  if (v == null || v === "") return null;
  if (typeof v === "number" && Number.isFinite(v) && v >= 0) {
    return Math.round(v);
  }
  if (typeof v === "string") {
    const cleaned = v.trim().replace(/[,\s]/g, "").replace(/k$/i, "000");
    const n = Number(cleaned);
    if (Number.isFinite(n) && n >= 0) return Math.round(n);
  }
  return null;
}

function computeExpiresAt(
  expirationDays: number | null,
  expirationDate: string | null,
): Date {
  if (expirationDate) {
    const d = new Date(expirationDate);
    if (!Number.isNaN(d.getTime()) && d.getTime() > Date.now()) {
      return d;
    }
  }
  if (expirationDays && expirationDays > 0 && expirationDays < 3650) {
    const d = new Date();
    d.setDate(d.getDate() + Math.round(expirationDays));
    return d;
  }
  // Default: 14-day trial
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d;
}

function safeStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  const out: string[] = [];
  for (const item of v) {
    const s = typeof item === "string" ? item.trim() : "";
    if (s && s.length <= 80 && !out.includes(s)) out.push(s);
  }
  return out.slice(0, 30);
}

function safeString(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t || null;
}

// ─── ROUTE HANDLER ────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. AUTH — admin only.
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin" && session.user?.role !== "super_admin") {
    return NextResponse.json(
      { error: "Forbidden — admin only" },
      { status: 403 },
    );
  }
  const adminId = session.user?.id;

  // 2. BODY VALIDATION
  let body: CreateAccountBody;
  try {
    const raw = await req.json();
    body = raw as CreateAccountBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = safeString(body.email)?.toLowerCase() ?? null;
  const name = safeString(body.name);
  const companyName = safeString(body.companyName);

  if (!email || !email.includes("@") || email.length > 320) {
    return NextResponse.json(
      { error: "A valid email is required." },
      { status: 400 },
    );
  }
  if (!name || name.length < 2) {
    return NextResponse.json(
      { error: "A name is required (min 2 chars)." },
      { status: 400 },
    );
  }
  if (!companyName || companyName.length < 2) {
    return NextResponse.json(
      { error: "A company name is required." },
      { status: 400 },
    );
  }

  const accountType = VALID_ACCOUNT_TYPES.has(body.accountType)
    ? body.accountType
    : "essential";

  const planTier = VALID_PLAN_TIERS.has(body.planTier)
    ? body.planTier
    : "custom";

  const role = body.role && VALID_ROLES.has(body.role) ? body.role : "user";

  const customPriceMAD = parsePriceMAD(body.customPriceMAD);

  const expirationDays =
    typeof body.expirationDays === "number" && body.expirationDays > 0
      ? Math.round(body.expirationDays)
      : null;
  const expirationDate = safeString(body.expirationDate);

  const expiresAt = computeExpiresAt(expirationDays, expirationDate);

  const topics = safeStringArray(body.topics);
  const competitors = safeStringArray(body.competitors);
  const useCase = safeString(body.useCase);
  const notes = safeString(body.notes);
  const phone = safeString(body.phone);
  const sector = safeString(body.sector) ?? "Other";

  // 3. CHECK FOR EXISTING USER
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json(
      {
        error: "A user with this email already exists.",
        existingUserId: existingUser.id,
      },
      { status: 409 },
    );
  }

  // Check for an existing unused invitation for the same email.
  const existingInvitation = await prisma.invitation.findFirst({
    where: { email, usedAt: null },
  });
  if (existingInvitation) {
    return NextResponse.json(
      {
        error:
          "An unused invitation already exists for this email. Revoke it first or wait for it to expire.",
        existingToken: existingInvitation.token,
      },
      { status: 409 },
    );
  }

  // 4. FIND OR CREATE COMPANY
  let company;
  try {
    const result = await findOrCreateCompany({
      name: companyName,
      sector,
    });
    company = result.company;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError("admin.create-account", `findOrCreateCompany failed: ${msg}`);
    return NextResponse.json(
      { error: "Failed to create or link company", detail: msg },
      { status: 500 },
    );
  }

  // 5. CREATE USER (status="invited", random temp password)
  const temporaryPassword = generatePassword();
  const passwordHash = await bcrypt.hash(temporaryPassword, 12);

  let user;
  try {
    user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role,
        accountType,
        status: "invited",
        companyId: company.id,
        // Stash the topics/competitors on the user row (per existing schema)
        ...(topics.length > 0 ? { topics } : {}),
        ...(competitors.length > 0 ? { competitors } : {}),
        onboardingCompleted: false,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError("admin.create-account", `User.create failed: ${msg}`);
    return NextResponse.json(
      { error: "Failed to create user", detail: msg },
      { status: 500 },
    );
  }

  // 6. UPSERT CompanySettings — encode custom pricing in alertThresholds
  //    JSON column. This is the only place we can stash custom pricing
  //    without a schema migration (Task: ADMIN-1 explicitly forbids db push).
  const pricingEnvelope = {
    customPriceMAD,
    planTier,
    expirationDays,
    expirationDate,
    useCase,
    notes,
    phone,
    createdAt: new Date().toISOString(),
    createdById: adminId ?? null,
  };

  try {
    const existingSettings = await prisma.companySettings.findUnique({
      where: { companyId: company.id },
    });
    if (existingSettings) {
      // Merge topics/competitors into the existing JSON arrays.
      await prisma.companySettings.update({
        where: { companyId: company.id },
        data: {
          topics: JSON.stringify([
            ...new Set([
              ...(JSON.parse(existingSettings.topics || "[]") as string[]),
              ...topics,
            ]),
          ]),
          competitors: JSON.stringify([
            ...new Set([
              ...(JSON.parse(existingSettings.competitors || "[]") as string[]),
              ...competitors,
            ]),
          ]),
          alertThresholds: JSON.stringify(pricingEnvelope),
        },
      });
    } else {
      await prisma.companySettings.create({
        data: {
          companyId: company.id,
          topics: JSON.stringify(topics),
          competitors: JSON.stringify(competitors),
          monitoredSources: "[]",
          alertThresholds: JSON.stringify(pricingEnvelope),
        },
      });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError("admin.create-account", `CompanySettings upsert failed: ${msg}`);
    // Non-fatal — the user + invitation are created; the pricing metadata
    // is still in the invitation message below. Continue.
  }

  // 7. CREATE INVITATION (token + URL, custom expiration)
  const token = generateToken();
  const messageParts: string[] = [];
  messageParts.push(`Plan: ${planTier}`);
  if (customPriceMAD != null) {
    messageParts.push(`Pricing: ${customPriceMAD.toLocaleString()} MAD/mo`);
  }
  if (expirationDays != null) {
    messageParts.push(`Duration: ${expirationDays} days`);
  } else if (expirationDate) {
    messageParts.push(`Expires: ${expirationDate.slice(0, 10)}`);
  }
  if (useCase) messageParts.push(`Use case: ${useCase}`);
  if (notes) messageParts.push(`Notes: ${notes}`);
  if (topics.length > 0) messageParts.push(`Topics: ${topics.join(", ")}`);
  if (competitors.length > 0) {
    messageParts.push(`Competitors: ${competitors.join(", ")}`);
  }
  const invitationMessage = messageParts.join(" · ");

  let invitation;
  try {
    invitation = await prisma.invitation.create({
      data: {
        token,
        email,
        name,
        passwordHash, // same hash — user can sign in with temp password OR via link
        accountType,
        role,
        company: company.name,
        companyId: company.id,
        message: invitationMessage,
        createdById: adminId,
        expiresAt,
        acceptedById: user.id, // pre-link so the access page knows which user to activate
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError("admin.create-account", `Invitation.create failed: ${msg}`);
    // The user was already created — surface a partial success.
    return NextResponse.json(
      {
        error: "User created but invitation failed",
        detail: msg,
        userId: user.id,
        companyId: company.id,
      },
      { status: 500 },
    );
  }

  // 8. LINK BACK TO ACCESS REQUEST (optional)
  if (body.requestId) {
    try {
      await prisma.accessRequest.update({
        where: { id: body.requestId },
        data: {
          status: "converted",
          invitationId: invitation.id,
        },
      });
    } catch (err) {
      // Non-fatal — just log it.
      const msg = err instanceof Error ? err.message : String(err);
      logError("admin.create-account", `AccessRequest link failed: ${msg}`);
    }
  }

  // 9. AUDIT LOG
  await logAudit({
    userId: adminId,
    action: "user_invite",
    resource: `user:${user.id}`,
    result: "success",
    ipAddress: extractIp(req),
    userAgent: extractUserAgent(req),
    metadata: {
      createdEmail: email,
      createdName: name,
      role,
      accountType,
      companyId: company.id,
      companyName: company.name,
      planTier,
      customPriceMAD,
      expirationDays,
      expiresAt: expiresAt.toISOString(),
      invitationId: invitation.id,
      requestId: body.requestId ?? null,
    },
  });

  logInfo(
    "admin.create-account",
    `Created ${email} (${role}/${accountType}) @ ${company.name} — plan=${planTier}, price=${customPriceMAD ?? "?"} MAD, expires=${expiresAt.toISOString().slice(0, 10)}`,
  );

  // 10. BUILD URL
  const baseUrl =
    process.env.NEXTAUTH_URL || "https://atelier.harchcorp.com";
  const accessUrl = `${baseUrl}/atelier/access?token=${token}`;

  const response: CreatedAccountResponse = {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      accountType: user.accountType,
      status: user.status,
      companyId: user.companyId,
      temporaryPassword,
    },
    company: {
      id: company.id,
      name: company.name,
      slug: company.slug ?? slugify(company.name),
      sector: company.sector,
      created: company.createdAt > new Date(Date.now() - 5000),
    },
    invitation: {
      id: invitation.id,
      token,
      url: accessUrl,
      expiresAt: invitation.expiresAt.toISOString(),
    },
    pricing: {
      planTier,
      customPriceMAD,
      expirationDays,
    },
  };

  return NextResponse.json(response, { status: 201 });
}
