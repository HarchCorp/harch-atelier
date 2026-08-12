// ═══════════════════════════════════════════════════════════════
//  /api/admin/employee-fiches
//
//  CRUD for employee fiches (Boss → Employee hand-off model).
//
//  • GET    — list fiches for a company (query: ?companyId=xxx)
//  • POST   — create a new fiche (boss fills 3 fields, employee
//              completes the rest on first login)
//  • PATCH  — partial update (boss or employee completes fields)
//
//  Auth: admin / super_admin only (canAccessAdmin).
//
//  STORAGE NOTE (BATCAVE-3-EMPLOYEES):
//  The admin UI persists fiches in localStorage ("admin:employee-fiches")
//  as Record<companyId, Fiche[]> for now. These routes establish the
//  API contract and are ready to be wired to a Prisma model
//  (EmployeeFiche) when the DB migration lands. They validate the
//  payload, emit audit entries, and return the canonical shape so the
//  UI can opt-in to server persistence later without breaking changes.
//
//  Task ID: BATCAVE-3-EMPLOYEES
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { canAccessAdmin } from "@/lib/auth/rbac";
import { logAudit, extractIp, extractUserAgent } from "@/lib/harchiq/audit-log";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ─── TYPES ────────────────────────────────────────────────────────

export interface EmployeeFiche {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: number | null;
  role: string;          // job title (e.g. "Dircom")
  department: string;
  startDate: string | null;  // ISO
  endDate: string | null;    // ISO
  status: "active" | "suspended" | "left";
  notes: string;
  invitation: {
    token: string | null;
    url: string | null;
    status: "not_sent" | "sent" | "accepted" | "expired";
    sentAt: string | null;
    acceptedAt: string | null;
    expiresAt: string | null;
  };
  lastLoginAt: string | null;
  loginCount: number;
  ipHistory: Array<{ ip: string; at: string; userAgent: string }>;
  harchiqQuestions: number;
  reportsGenerated: number;
  lastDashboardView: string | null;
  accountType: string;
  systemRole: "user" | "admin" | "company-admin";
  twoFactorEnabled: boolean;
  passwordLastChanged: string | null;
  activeSessions: number;
  annotations: Array<{ id: string; text: string; author: string; at: string }>;
  createdAt: string;
  updatedAt: string;
}

interface FicheInput {
  companyId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  age?: number | null;
  role?: string;
  department?: string;
  startDate?: string | null;
  endDate?: string | null;
  notes?: string;
  accountType?: string;
  systemRole?: "user" | "admin" | "company-admin";
  status?: "active" | "suspended" | "left";
}

// ─── HELPERS ──────────────────────────────────────────────────────

function genId(): string {
  return "fiche_" + Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
}

function isNonEmpty(s: unknown): s is string {
  return typeof s === "string" && s.trim().length > 0;
}

function makeFiche(companyId: string, input: FicheInput): EmployeeFiche {
  const now = new Date().toISOString();
  return {
    id: genId(),
    companyId,
    firstName: (input.firstName || "").trim(),
    lastName: (input.lastName || "").trim(),
    email: (input.email || "").trim().toLowerCase(),
    phone: (input.phone || "").trim(),
    age: typeof input.age === "number" && input.age > 0 ? input.age : null,
    role: (input.role || "").trim(),
    department: (input.department || "").trim(),
    startDate: input.startDate || null,
    endDate: input.endDate || null,
    status: "active",
    notes: input.notes || "",
    invitation: {
      token: null,
      url: null,
      status: "not_sent",
      sentAt: null,
      acceptedAt: null,
      expiresAt: null,
    },
    lastLoginAt: null,
    loginCount: 0,
    ipHistory: [],
    harchiqQuestions: 0,
    reportsGenerated: 0,
    lastDashboardView: null,
    accountType: input.accountType || "essential",
    systemRole: input.systemRole || "user",
    twoFactorEnabled: false,
    passwordLastChanged: null,
    activeSessions: 0,
    annotations: [],
    createdAt: now,
    updatedAt: now,
  };
}

// ─── GET — list fiches for a company ─────────────────────────────

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || !canAccessAdmin(session.user.role)) {
    return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
  }

  const url = new URL(req.url);
  const companyId = url.searchParams.get("companyId");

  // Without companyId we return an empty list — the admin UI is the
  // source of truth (localStorage). When DB-backed, this would
  // prisma.employeeFiche.findMany({ where: { companyId } }).
  return NextResponse.json({
    fiches: [] as EmployeeFiche[],
    companyId,
    source: "client-localStorage",
    note: "UI persisted in localStorage('admin:employee-fiches'). Server persistence pending DB model.",
  });
}

// ─── POST — create a new fiche ───────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || !canAccessAdmin(session.user.role)) {
    return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
  }

  let body: FicheInput;
  try {
    body = (await req.json()) as FicheInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isNonEmpty(body.companyId)) {
    return NextResponse.json({ error: "companyId est requis" }, { status: 400 });
  }

  // Boss can pre-fill any of these 3 (firstName/lastName, email, role);
  // remaining fields are completed by the employee on first login.
  // We do NOT require email at creation — the boss may create a stub
  // fiche first and send the invitation later.
  const fiche = makeFiche(body.companyId as string, body);

  try {
    await logAudit({
      userId: session.user?.id,
      action: "employee_invited",
      resource: `employee-fiche:${fiche.id}`,
      result: "success",
      ipAddress: extractIp(req),
      userAgent: extractUserAgent(req),
      metadata: {
        companyId: fiche.companyId,
        email: fiche.email || null,
        role: fiche.role || null,
        systemRole: fiche.systemRole,
        accountType: fiche.accountType,
        preFilledFields: [
          fiche.firstName && "firstName",
          fiche.email && "email",
          fiche.role && "role",
        ].filter(Boolean),
      },
    });
  } catch (err) {
    logError("admin.employee-fiches", `Audit log failed (POST): ${err}`);
  }

  return NextResponse.json({
    ok: true,
    fiche,
    source: "client-localStorage",
    note: "Fiche renvoyee — l'UI persiste dans localStorage('admin:employee-fiches'). Persistance serveur en attente du modele Prisma.",
  });
}

// ─── PATCH — partial update (boss fills 3, employee completes rest)

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || !canAccessAdmin(session.user.role)) {
    return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
  }

  let body: { id?: string } & Partial<FicheInput>;
  try {
    body = (await req.json()) as { id?: string } & Partial<FicheInput>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isNonEmpty(body.id)) {
    return NextResponse.json({ error: "id est requis pour le PATCH" }, { status: 400 });
  }

  // Validate numeric age if provided
  if (body.age != null && (typeof body.age !== "number" || body.age <= 0)) {
    return NextResponse.json({ error: "age doit etre un entier positif" }, { status: 400 });
  }

  // Validate status enum if provided
  if (body.status != null && !["active", "suspended", "left"].includes(body.status)) {
    return NextResponse.json(
      { error: "status doit etre active | suspended | left" },
      { status: 400 },
    );
  }

  const { id, ...updates } = body;
  const patch: Partial<EmployeeFiche> = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  try {
    await logAudit({
      userId: session.user?.id,
      action: "request_annotated",
      resource: `employee-fiche:${id}`,
      result: "success",
      ipAddress: extractIp(req),
      userAgent: extractUserAgent(req),
      metadata: {
        companyId: updates.companyId ?? null,
        fields: Object.keys(updates),
      },
    });
  } catch (err) {
    logError("admin.employee-fiches", `Audit log failed (PATCH): ${err}`);
  }

  return NextResponse.json({
    ok: true,
    id,
    patch,
    source: "client-localStorage",
    note: "Patch renvoye — l'UI applique sur localStorage.",
  });
}
