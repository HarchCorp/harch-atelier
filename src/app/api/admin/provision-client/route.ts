// ═══════════════════════════════════════════════════════════════
//  /api/admin/provision-client
//
//  Full client provisioning engine — every HYPER variable the boss
//  asked for:
//    - accountType (essential | pro | enterprise | agency)
//    - customPriceMAD + discount
//    - billingCycle (monthly | quarterly | annual | biennial)
//    - subscriptionStartDate + subscriptionEndDate (or durationDays)
//    - trialDays (0-90) + computed trialEndDate
//    - employeeCount + maxUsers
//    - invitationMode ("boss-invite" | "admin-create-per-employee")
//    - topics / competitors / useCase / notes / assignedCommercialId
//
//  POST    → create the client (Company + User(boss) + CompanySettings
//             with pricing envelope in alertThresholds JSON + Invitation)
//  GET     → list all provisioned clients (parses alertThresholds JSON
//             server-side and surfaces only provisioned envelopes)
//  PATCH   → suspend / reactivate / extend a provisioned client
//
//  Auth: admin / super_admin / commercial (canAccessAdmin from rbac.ts).
//  Revenue figures (GET /revenue) are restricted to admin/super_admin.
//
//  Task ID: BATCAVE-2-PROVISIONING
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { findOrCreateCompany, slugify } from "@/lib/harchiq/company-dedup";
import { logAudit, extractIp, extractUserAgent } from "@/lib/harchiq/audit-log";
import { canAccessAdmin } from "@/lib/auth/rbac";
import { logInfo, logError } from "@/lib/logger";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

// ─── TYPES ────────────────────────────────────────────────────────

type AccountType = "essential" | "pro" | "enterprise" | "agency";
type BillingCycle = "monthly" | "quarterly" | "annual" | "biennial";
type InvitationMode = "boss-invite" | "admin-create-per-employee";

const VALID_ACCOUNT_TYPES = new Set<AccountType>([
  "essential",
  "pro",
  "enterprise",
  "agency",
]);

const VALID_BILLING_CYCLES = new Set<BillingCycle>([
  "monthly",
  "quarterly",
  "annual",
  "biennial",
]);

const VALID_INVITATION_MODES = new Set<InvitationMode>([
  "boss-invite",
  "admin-create-per-employee",
]);

interface ProvisioningEnvelope {
  __provisioned: true;
  accountType: AccountType;
  customPriceMAD: number | null;
  billingCycle: BillingCycle;
  discountPct: number;
  discountMAD: number;
  effectivePriceMAD: number | null;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  trialDays: number;
  trialEndDate: string | null;
  employeeCount: number;
  maxUsers: number;
  invitationMode: InvitationMode;
  useCase: string | null;
  notes: string | null;
  assignedCommercialId: string | null;
  sector: string | null;
  country: string | null;
  website: string | null;
  phone: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactRole: string | null;
  provisionedAt: string;
  provisionedById: string | null;
  suspendedAt: string | null;
  status: "trial" | "active" | "expired" | "suspended";
}

interface ProvisionBody {
  email: string;
  name: string;
  companyName: string;
  accountType: AccountType;
  customPriceMAD?: number | string | null;
  billingCycle?: BillingCycle;
  subscriptionStartDate?: string | null;
  subscriptionEndDate?: string | null;
  durationDays?: number | null;
  trialDays?: number;
  employeeCount?: number;
  maxUsers?: number;
  invitationMode?: InvitationMode;
  topics?: string[];
  competitors?: string[];
  useCase?: string | null;
  notes?: string | null;
  assignedCommercialId?: string | null;
  sector?: string | null;
  country?: string | null;
  website?: string | null;
  phone?: string | null;
  contactName?: string | null;
  contactRole?: string | null;
  discountPct?: number;
  discountMAD?: number;
}

interface PatchBody {
  companyId: string;
  action: "suspend" | "reactivate" | "extend";
  extendDays?: number;
  extendDate?: string | null;
}

// ─── HELPERS ──────────────────────────────────────────────────────

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function generatePassword(): string {
  // 12 chars — secure random, avoiding ambiguous glyphs.
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = crypto.randomBytes(12);
  let password = "";
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

function safeString(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t || null;
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

function safeInt(v: unknown, min: number, max: number, def: number): number {
  const n = typeof v === "number" ? v : typeof v === "string" ? parseInt(v, 10) : NaN;
  if (!Number.isFinite(n)) return def;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function computeSubscriptionEnd(
  start: Date,
  durationDays: number | null,
  endDate: string | null,
): Date {
  if (endDate) {
    const d = new Date(endDate);
    if (!Number.isNaN(d.getTime())) return d;
  }
  if (durationDays && durationDays > 0) {
    const d = new Date(start);
    d.setDate(d.getDate() + Math.round(durationDays));
    return d;
  }
  // Default: 1 year
  const d = new Date(start);
  d.setFullYear(d.getFullYear() + 1);
  return d;
}

function computeTrialEnd(start: Date, trialDays: number): string | null {
  if (trialDays <= 0) return null;
  const d = new Date(start);
  d.setDate(d.getDate() + trialDays);
  return d.toISOString();
}

function computeStatus(
  now: Date,
  start: Date,
  end: Date,
  trialEnd: Date | null,
  suspendedAt: string | null,
): "trial" | "active" | "expired" | "suspended" {
  if (suspendedAt) return "suspended";
  if (now < start) return "trial";
  if (trialEnd && now < trialEnd) return "trial";
  if (now > end) return "expired";
  return "active";
}

function parseEnvelope(raw: string | null): ProvisioningEnvelope | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ProvisioningEnvelope>;
    if (parsed.__provisioned !== true) return null;
    return parsed as ProvisioningEnvelope;
  } catch {
    return null;
  }
}

function effectivePrice(
  customPriceMAD: number | null,
  discountPct: number,
  discountMAD: number,
): number | null {
  if (customPriceMAD == null) return null;
  let eff = customPriceMAD;
  if (discountPct > 0) eff = eff * (1 - discountPct / 100);
  if (discountMAD > 0) eff = eff - discountMAD;
  return Math.max(0, Math.round(eff));
}

// EUR approximation (1 EUR ≈ 11 MAD) — display only, never billed.
const EUR_RATE = 11;

function monthlyEquivalent(price: number | null, cycle: BillingCycle): number | null {
  if (price == null) return null;
  switch (cycle) {
    case "monthly": return price;
    case "quarterly": return Math.round(price / 3);
    case "annual": return Math.round(price / 12);
    case "biennial": return Math.round(price / 24);
  }
}

// ─── AUTH GUARD ───────────────────────────────────────────────────

async function authorize(req: NextRequest, requireFinancials = false) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 },
      ),
    };
  }
  const role = session.user.role ?? null;
  if (!canAccessAdmin(role)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Accès réservé admin / super_admin / commercial" },
        { status: 403 },
      ),
    };
  }
  if (requireFinancials && role !== "admin" && role !== "super_admin") {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Données financières réservées admin / super_admin" },
        { status: 403 },
      ),
    };
  }
  return { ok: true as const, session };
}

// ─── POST — create the client ─────────────────────────────────────

export async function POST(req: NextRequest) {
  const guard = await authorize(req);
  if (!guard.ok) return guard.response;
  const session = guard.session;
  const adminId = session.user?.id ?? null;

  let body: ProvisionBody;
  try {
    body = (await req.json()) as ProvisionBody;
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  // ─── Validation ────────────────────────────────────────────────
  const contactEmail = safeString(body.email)?.toLowerCase() ?? null;
  const contactName = safeString(body.name);
  const companyName = safeString(body.companyName);

  if (!contactEmail || !contactEmail.includes("@") || contactEmail.length > 320) {
    return NextResponse.json(
      { error: "Email du contact principal invalide." },
      { status: 400 },
    );
  }
  if (!contactName || contactName.length < 2) {
    return NextResponse.json(
      { error: "Nom du contact requis (min 2 caractères)." },
      { status: 400 },
    );
  }
  if (!companyName || companyName.length < 2) {
    return NextResponse.json(
      { error: "Raison sociale requise." },
      { status: 400 },
    );
  }

  const accountType = VALID_ACCOUNT_TYPES.has(body.accountType)
    ? body.accountType
    : "essential";

  const billingCycle = VALID_BILLING_CYCLES.has(body.billingCycle ?? "monthly")
    ? (body.billingCycle as BillingCycle)
    : "monthly";

  const invitationMode = VALID_INVITATION_MODES.has(body.invitationMode ?? "boss-invite")
    ? (body.invitationMode as InvitationMode)
    : "boss-invite";

  const customPriceMAD = parsePriceMAD(body.customPriceMAD);
  const discountPct = safeInt(body.discountPct, 0, 100, 0);
  const discountMAD = safeInt(body.discountMAD, 0, 1_000_000, 0);
  const effPrice = effectivePrice(customPriceMAD, discountPct, discountMAD);

  const trialDays = safeInt(body.trialDays, 0, 90, 30);

  const now = new Date();
  const startDateRaw = safeString(body.subscriptionStartDate);
  const subscriptionStart = startDateRaw
    ? new Date(startDateRaw)
    : now;
  if (Number.isNaN(subscriptionStart.getTime())) {
    return NextResponse.json(
      { error: "Date de début d'abonnement invalide." },
      { status: 400 },
    );
  }

  const durationDays =
    typeof body.durationDays === "number" && body.durationDays > 0
      ? Math.round(body.durationDays)
      : null;
  const endDateRaw = safeString(body.subscriptionEndDate);
  const subscriptionEnd = computeSubscriptionEnd(
    subscriptionStart,
    durationDays,
    endDateRaw,
  );
  if (subscriptionEnd <= subscriptionStart) {
    return NextResponse.json(
      { error: "La date de fin doit être postérieure à la date de début." },
      { status: 400 },
    );
  }

  const trialEndIso = computeTrialEnd(subscriptionStart, trialDays);

  const employeeCount = safeInt(body.employeeCount, 1, 500, 1);
  const maxUsers = safeInt(body.maxUsers, 1, 1000, employeeCount);
  if (maxUsers < employeeCount) {
    return NextResponse.json(
      { error: "maxUsers ne peut pas être inférieur à employeeCount." },
      { status: 400 },
    );
  }

  const topics = safeStringArray(body.topics);
  const competitors = safeStringArray(body.competitors);
  const useCase = safeString(body.useCase);
  const notes = safeString(body.notes);
  const phone = safeString(body.phone);
  const sector = safeString(body.sector) ?? "Other";
  const country = safeString(body.country);
  const website = safeString(body.website);
  const contactRole = safeString(body.contactRole);

  // assignedCommercialId — must point to a real commercial user if provided.
  const assignedCommercialId = safeString(body.assignedCommercialId);
  if (assignedCommercialId) {
    const comm = await prisma.user.findUnique({
      where: { id: assignedCommercialId },
      select: { id: true, role: true },
    });
    if (!comm || comm.role !== "commercial") {
      return NextResponse.json(
        { error: "Commercial assigné invalide." },
        { status: 400 },
      );
    }
  }

  // ─── Duplicate guards ──────────────────────────────────────────
  const existingUser = await prisma.user.findUnique({
    where: { email: contactEmail },
  });
  if (existingUser) {
    return NextResponse.json(
      { error: "Un utilisateur avec cet email existe déjà." },
      { status: 409 },
    );
  }
  const existingInvitation = await prisma.invitation.findFirst({
    where: { email: contactEmail, usedAt: null },
  });
  if (existingInvitation) {
    return NextResponse.json(
      {
        error:
          "Une invitation non utilisée existe déjà pour cet email. Révoquez-la ou attendez son expiration.",
      },
      { status: 409 },
    );
  }

  // ─── Company ───────────────────────────────────────────────────
  let company;
  try {
    const result = await findOrCreateCompany({
      name: companyName,
      sector,
      website: website ?? undefined,
      headquarters: country ?? undefined,
    });
    company = result.company;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError("admin.provision-client", `findOrCreateCompany failed: ${msg}`);
    return NextResponse.json(
      { error: "Échec création entreprise", detail: msg },
      { status: 500 },
    );
  }

  // ─── User (boss / company-admin) ───────────────────────────────
  const temporaryPassword = generatePassword();
  const passwordHash = await bcrypt.hash(temporaryPassword, 12);

  let user;
  try {
    user = await prisma.user.create({
      data: {
        email: contactEmail,
        name: contactName,
        passwordHash,
        role: "company-admin",
        accountType,
        status: "invited",
        companyId: company.id,
        jobTitle: contactRole ?? undefined,
        topics,
        competitors,
        useCaseNote: useCase ?? undefined,
        onboardingCompleted: false,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError("admin.provision-client", `User.create failed: ${msg}`);
    return NextResponse.json(
      { error: "Échec création utilisateur", detail: msg },
      { status: 500 },
    );
  }

  // ─── CompanySettings — provisioning envelope ───────────────────
  const status = computeStatus(
    now,
    subscriptionStart,
    subscriptionEnd,
    trialEndIso ? new Date(trialEndIso) : null,
    null,
  );

  const envelope: ProvisioningEnvelope = {
    __provisioned: true,
    accountType,
    customPriceMAD,
    billingCycle,
    discountPct,
    discountMAD,
    effectivePriceMAD: effPrice,
    subscriptionStartDate: subscriptionStart.toISOString(),
    subscriptionEndDate: subscriptionEnd.toISOString(),
    trialDays,
    trialEndDate: trialEndIso,
    employeeCount,
    maxUsers,
    invitationMode,
    useCase,
    notes,
    assignedCommercialId,
    sector,
    country,
    website,
    phone,
    contactName,
    contactEmail,
    contactRole,
    provisionedAt: now.toISOString(),
    provisionedById: adminId,
    suspendedAt: null,
    status,
  };

  try {
    const existingSettings = await prisma.companySettings.findUnique({
      where: { companyId: company.id },
    });
    if (existingSettings) {
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
          alertThresholds: JSON.stringify(envelope),
        },
      });
    } else {
      await prisma.companySettings.create({
        data: {
          companyId: company.id,
          topics: JSON.stringify(topics),
          competitors: JSON.stringify(competitors),
          monitoredSources: "[]",
          alertThresholds: JSON.stringify(envelope),
        },
      });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError("admin.provision-client", `CompanySettings upsert failed: ${msg}`);
    // Non-fatal — user + invitation still created.
  }

  // ─── Invitation ────────────────────────────────────────────────
  const token = generateToken();
  const expiresAt = subscriptionEnd; // invitation valid for the whole subscription
  const messageParts: string[] = [
    `Plan: ${accountType}`,
    `Cycle: ${billingCycle}`,
  ];
  if (effPrice != null) {
    messageParts.push(`Prix: ${effPrice.toLocaleString()} MAD`);
  }
  messageParts.push(
    `Abonnement: ${subscriptionStart.toISOString().slice(0, 10)} → ${subscriptionEnd.toISOString().slice(0, 10)}`,
  );
  if (trialDays > 0 && trialEndIso) {
    messageParts.push(`Période d'essai: ${trialDays} jours (jusqu'au ${trialEndIso.slice(0, 10)})`);
  }
  messageParts.push(
    `Équipe: ${employeeCount} employé(s), max ${maxUsers} utilisateur(s)`,
    `Mode invitation: ${invitationMode === "boss-invite" ? "Le chef invite son équipe" : "Liens individuels"}`,
  );
  if (useCase) messageParts.push(`Use case: ${useCase}`);
  if (notes) messageParts.push(`Notes: ${notes}`);
  if (topics.length > 0) messageParts.push(`Sujets: ${topics.join(", ")}`);
  if (competitors.length > 0) {
    messageParts.push(`Concurrents: ${competitors.join(", ")}`);
  }
  const invitationMessage = messageParts.join(" · ");

  let invitation;
  try {
    invitation = await prisma.invitation.create({
      data: {
        token,
        email: contactEmail,
        name: contactName,
        passwordHash,
        accountType,
        role: "company-admin",
        company: company.name,
        companyId: company.id,
        message: invitationMessage,
        createdById: adminId,
        expiresAt,
        acceptedById: user.id,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError("admin.provision-client", `Invitation.create failed: ${msg}`);
    return NextResponse.json(
      {
        error: "Utilisateur créé mais invitation échouée",
        detail: msg,
        userId: user.id,
        companyId: company.id,
      },
      { status: 500 },
    );
  }

  // ─── Audit log ─────────────────────────────────────────────────
  await logAudit({
    userId: adminId,
    action: "client_provisioned",
    resource: `company:${company.id}`,
    result: "success",
    ipAddress: extractIp(req),
    userAgent: extractUserAgent(req),
    metadata: {
      createdEmail: contactEmail,
      createdName: contactName,
      accountType,
      billingCycle,
      customPriceMAD,
      effectivePriceMAD: effPrice,
      discountPct,
      discountMAD,
      subscriptionStartDate: subscriptionStart.toISOString(),
      subscriptionEndDate: subscriptionEnd.toISOString(),
      trialDays,
      trialEndDate: trialEndIso,
      employeeCount,
      maxUsers,
      invitationMode,
      companyId: company.id,
      companyName: company.name,
      assignedCommercialId,
      invitationId: invitation.id,
    },
  });

  logInfo(
    "admin.provision-client",
    `Provisioned ${contactEmail} (${accountType}) @ ${company.name} — price=${effPrice ?? "?"} MAD/${billingCycle}, sub=${subscriptionStart.toISOString().slice(0, 10)}→${subscriptionEnd.toISOString().slice(0, 10)}, trial=${trialDays}d, employees=${employeeCount}/${maxUsers}`,
  );

  // ─── Build URL ─────────────────────────────────────────────────
  const baseUrl =
    process.env.NEXTAUTH_URL || "https://atelier.harchcorp.com";
  const accessUrl = `${baseUrl}/atelier/access?token=${token}`;

  return NextResponse.json(
    {
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
      settings: {
        accountType,
        billingCycle,
        customPriceMAD,
        effectivePriceMAD: effPrice,
        discountPct,
        discountMAD,
        subscriptionStartDate: subscriptionStart.toISOString(),
        subscriptionEndDate: subscriptionEnd.toISOString(),
        trialDays,
        trialEndDate: trialEndIso,
        employeeCount,
        maxUsers,
        invitationMode,
        status,
      },
    },
    { status: 201 },
  );
}

// ─── GET — list provisioned clients ───────────────────────────────

export async function GET(req: NextRequest) {
  const guard = await authorize(req);
  if (!guard.ok) return guard.response;
  const session = guard.session;
  const role = session.user?.role ?? null;
  const isFinancial = role === "admin" || role === "super_admin";

  const url = new URL(req.url);
  const view = url.searchParams.get("view") ?? "list";

  // ─── List view ─────────────────────────────────────────────────
  if (view === "list" || view === "timeline") {
    const allSettings = await prisma.companySettings.findMany({
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            sector: true,
            website: true,
            createdAt: true,
          },
        },
      },
    });

    const now = new Date();
    const rows: Array<{
      companyId: string;
      companyName: string;
      companySlug: string;
      sector: string | null;
      website: string | null;
      createdAt: string;
      contactName: string | null;
      contactEmail: string | null;
      contactRole: string | null;
      phone: string | null;
      country: string | null;
      accountType: AccountType;
      planLabel: string;
      customPriceMAD: number | null;
      effectivePriceMAD: number | null;
      monthlyMAD: number | null;
      eurEstimate: number | null;
      billingCycle: BillingCycle;
      discountPct: number;
      discountMAD: number;
      subscriptionStartDate: string;
      subscriptionEndDate: string;
      trialDays: number;
      trialEndDate: string | null;
      employeeCount: number;
      maxUsers: number;
      invitationMode: InvitationMode;
      useCase: string | null;
      notes: string | null;
      assignedCommercialId: string | null;
      assignedCommercialName: string | null;
      provisionedAt: string;
      provisionedById: string | null;
      suspendedAt: string | null;
      status: "trial" | "active" | "expired" | "suspended";
      daysUntilExpiry: number;
    }> = [];

    // Resolve commercial names in one query if any envelope references one.
    const commercialIds = new Set<string>();
    for (const s of allSettings) {
      const env = parseEnvelope(s.alertThresholds);
      if (env?.assignedCommercialId) commercialIds.add(env.assignedCommercialId);
    }
    const commercials = commercialIds.size
      ? await prisma.user.findMany({
          where: { id: { in: [...commercialIds] } },
          select: { id: true, name: true, email: true },
        })
      : [];
    const commercialMap = new Map(commercials.map((c) => [c.id, c]));

    for (const s of allSettings) {
      const env = parseEnvelope(s.alertThresholds);
      if (!env) continue;

      const start = new Date(env.subscriptionStartDate);
      const end = new Date(env.subscriptionEndDate);
      const trialEnd = env.trialEndDate ? new Date(env.trialEndDate) : null;
      const status = computeStatus(now, start, end, trialEnd, env.suspendedAt);
      const daysUntilExpiry = Math.ceil(
        (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      const monthlyMAD = monthlyEquivalent(env.effectivePriceMAD, env.billingCycle);
      const eurEstimate =
        monthlyMAD != null ? Math.round(monthlyMAD / EUR_RATE) : null;

      const comm = env.assignedCommercialId
        ? commercialMap.get(env.assignedCommercialId)
        : null;

      rows.push({
        companyId: s.companyId,
        companyName: s.company.name,
        companySlug: s.company.slug,
        sector: s.company.sector,
        website: s.company.website,
        createdAt: s.company.createdAt.toISOString(),
        contactName: env.contactName,
        contactEmail: env.contactEmail,
        contactRole: env.contactRole,
        phone: env.phone,
        country: env.country,
        accountType: env.accountType,
        planLabel: PLAN_LABELS[env.accountType],
        customPriceMAD: env.customPriceMAD,
        effectivePriceMAD: env.effectivePriceMAD,
        monthlyMAD,
        eurEstimate,
        billingCycle: env.billingCycle,
        discountPct: env.discountPct,
        discountMAD: env.discountMAD,
        subscriptionStartDate: env.subscriptionStartDate,
        subscriptionEndDate: env.subscriptionEndDate,
        trialDays: env.trialDays,
        trialEndDate: env.trialEndDate,
        employeeCount: env.employeeCount,
        maxUsers: env.maxUsers,
        invitationMode: env.invitationMode,
        useCase: env.useCase,
        notes: env.notes,
        assignedCommercialId: env.assignedCommercialId,
        assignedCommercialName: comm?.name ?? comm?.email ?? null,
        provisionedAt: env.provisionedAt,
        provisionedById: env.provisionedById,
        suspendedAt: env.suspendedAt,
        status,
        daysUntilExpiry,
      });
    }

    rows.sort(
      (a, b) =>
        new Date(b.provisionedAt).getTime() -
        new Date(a.provisionedAt).getTime(),
    );

    if (view === "timeline") {
      return NextResponse.json({ clients: rows });
    }

    return NextResponse.json({
      clients: rows,
      count: rows.length,
      canSeeFinancials: isFinancial,
    });
  }

  // ─── Revenue view (admin/super_admin only) ─────────────────────
  if (view === "revenue") {
    if (!isFinancial) {
      return NextResponse.json(
        { error: "Données financières réservées admin / super_admin" },
        { status: 403 },
      );
    }
    const allSettings = await prisma.companySettings.findMany({
      select: {
        alertThresholds: true,
        company: { select: { name: true, slug: true } },
      },
    });

    const now = new Date();
    let mrr = 0;
    let arr = 0;
    const byPlan: Record<string, number> = {};
    const byCycle: Record<string, number> = {};
    const topClients: Array<{ name: string; slug: string; monthlyMAD: number }> = [];
    let totalClients = 0;
    let cancelled = 0;

    for (const s of allSettings) {
      const env = parseEnvelope(s.alertThresholds);
      if (!env) continue;
      totalClients++;

      const start = new Date(env.subscriptionStartDate);
      const end = new Date(env.subscriptionEndDate);
      const trialEnd = env.trialEndDate ? new Date(env.trialEndDate) : null;
      const status = computeStatus(now, start, end, trialEnd, env.suspendedAt);

      if (status === "suspended" || status === "expired") {
        cancelled++;
        continue;
      }
      // Trial counts toward revenue? Convention: yes — they've signed.
      const monthly = monthlyEquivalent(env.effectivePriceMAD, env.billingCycle);
      if (monthly != null && monthly > 0) {
        mrr += monthly;
        arr += monthly * 12;
        byPlan[env.accountType] = (byPlan[env.accountType] || 0) + monthly;
        byCycle[env.billingCycle] = (byCycle[env.billingCycle] || 0) + monthly;
        topClients.push({
          name: s.company.name,
          slug: s.company.slug,
          monthlyMAD: monthly,
        });
      }
    }

    topClients.sort((a, b) => b.monthlyMAD - a.monthlyMAD);

    // 12-month revenue projection (current MRR * 12 minus expected expiries).
    const projection: Array<{ month: string; revenue: number }> = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const label = d.toLocaleString("fr-FR", { month: "short", year: "2-digit" });
      // Naive projection: MRR held constant (no churn assumed).
      projection.push({ month: label, revenue: mrr });
    }

    return NextResponse.json({
      mrr,
      arr,
      avgPerClient: totalClients > 0 ? Math.round(mrr / Math.max(1, totalClients - cancelled)) : 0,
      totalClients,
      activeClients: totalClients - cancelled,
      cancelled,
      churnRate: totalClients > 0 ? Math.round((cancelled / totalClients) * 1000) / 10 : 0,
      byPlan: Object.entries(byPlan).map(([plan, revenue]) => ({
        plan,
        label: PLAN_LABELS[plan as AccountType] ?? plan,
        revenue,
      })),
      byCycle: Object.entries(byCycle).map(([cycle, revenue]) => ({
        cycle,
        label: CYCLE_LABELS[cycle as BillingCycle] ?? cycle,
        revenue,
      })),
      topClients: topClients.slice(0, 10),
      projection,
    });
  }

  // ─── Commercials list (for the form dropdown) ──────────────────
  if (view === "commercials") {
    const comms = await prisma.user.findMany({
      where: { role: "commercial", status: "active" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ commercials: comms });
  }

  return NextResponse.json({ error: "Vue inconnue" }, { status: 400 });
}

// ─── PATCH — suspend / reactivate / extend ────────────────────────

export async function PATCH(req: NextRequest) {
  const guard = await authorize(req);
  if (!guard.ok) return guard.response;
  const session = guard.session;
  const adminId = session.user?.id ?? null;

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  if (!body.companyId) {
    return NextResponse.json({ error: "companyId requis" }, { status: 400 });
  }
  if (!["suspend", "reactivate", "extend"].includes(body.action)) {
    return NextResponse.json({ error: "action invalide" }, { status: 400 });
  }

  const settings = await prisma.companySettings.findUnique({
    where: { companyId: body.companyId },
  });
  if (!settings) {
    return NextResponse.json(
      { error: "CompanySettings introuvable" },
      { status: 404 },
    );
  }
  const env = parseEnvelope(settings.alertThresholds);
  if (!env) {
    return NextResponse.json(
      { error: "Ce client n'est pas un client provisionné" },
      { status: 400 },
    );
  }

  const now = new Date();
  let newStatus: ProvisioningEnvelope["status"];
  let auditAction: "client_provisioned" | "user_suspend" = "client_provisioned";

  if (body.action === "suspend") {
    env.suspendedAt = now.toISOString();
    newStatus = "suspended";
    auditAction = "user_suspend";
  } else if (body.action === "reactivate") {
    env.suspendedAt = null;
    const start = new Date(env.subscriptionStartDate);
    const end = new Date(env.subscriptionEndDate);
    const trialEnd = env.trialEndDate ? new Date(env.trialEndDate) : null;
    newStatus = computeStatus(now, start, end, trialEnd, null);
  } else {
    // extend
    const currentEnd = new Date(env.subscriptionEndDate);
    let newEnd: Date;
    if (body.extendDate) {
      newEnd = new Date(body.extendDate);
      if (Number.isNaN(newEnd.getTime())) {
        return NextResponse.json(
          { error: "Date d'extension invalide" },
          { status: 400 },
        );
      }
    } else {
      const days =
        typeof body.extendDays === "number" && body.extendDays > 0
          ? Math.round(body.extendDays)
          : 30;
      newEnd = new Date(currentEnd);
      newEnd.setDate(newEnd.getDate() + days);
    }
    env.subscriptionEndDate = newEnd.toISOString();
    const start = new Date(env.subscriptionStartDate);
    const trialEnd = env.trialEndDate ? new Date(env.trialEndDate) : null;
    newStatus = computeStatus(now, start, newEnd, trialEnd, env.suspendedAt);
  }

  env.status = newStatus;

  await prisma.companySettings.update({
    where: { companyId: body.companyId },
    data: { alertThresholds: JSON.stringify(env) },
  });

  // If suspended, also flip the user.status to "suspended" so they can't log in.
  if (body.action === "suspend") {
    await prisma.user
      .updateMany({
        where: { companyId: body.companyId, role: "company-admin" },
        data: { status: "suspended" },
      })
      .catch((err) => {
        logError(
          "admin.provision-client",
          `Failed to suspend company-admin: ${err instanceof Error ? err.message : err}`,
        );
      });
  } else if (body.action === "reactivate") {
    await prisma.user
      .updateMany({
        where: { companyId: body.companyId, role: "company-admin" },
        data: { status: "active" },
      })
      .catch(() => {
        /* best-effort */
      });
  }

  await logAudit({
    userId: adminId,
    action: auditAction,
    resource: `company:${body.companyId}`,
    result: "success",
    ipAddress: extractIp(req),
    userAgent: extractUserAgent(req),
    metadata: {
      action: body.action,
      companyId: body.companyId,
      newStatus,
      extendDays: body.extendDays ?? null,
      extendDate: body.extendDate ?? null,
    },
  });

  return NextResponse.json({
    success: true,
    companyId: body.companyId,
    status: newStatus,
    subscriptionEndDate: env.subscriptionEndDate,
    suspendedAt: env.suspendedAt,
  });
}

// ─── LABELS (shared with the dashboard) ───────────────────────────

export const PLAN_LABELS: Record<AccountType, string> = {
  essential: "Essentiel",
  pro: "Pro",
  enterprise: "Grandes Entreprises",
  agency: "Agences",
};

export const CYCLE_LABELS: Record<BillingCycle, string> = {
  monthly: "Mensuel",
  quarterly: "Trimestriel",
  annual: "Annuel",
  biennial: "Biennal",
};
