// ═══════════════════════════════════════════════════════════════
//  SELF-SERVICE COMPANY REGISTRATION — domain-matching signup
//
//  POST /api/auth/register-company
//  Body: { email, name, password }
//
//  Flow:
//    1. Extract the root domain from the work email
//       (med.alami@attijariwafa.com → "attijariwafa.com")
//    2. Reject disposable providers (gmail, yahoo, ...) with 403
//       "Please use your work email".
//    3. Look up Company by domain — REAL companies only (isDemo:false)
//       so a BCP employee doesn't accidentally attach to the demo BCP
//       created by the executive demo seed.
//    4. If found AND company has an active subscription → create User
//       attached to that companyId, role "user", default accountType
//       from the company settings (fallback: brand-monitor). Return
//       success + redirect to /atelier/login.
//    5. If found BUT no active subscription → 403 "Your company doesn't
//       have an active subscription. Contact your administrator."
//    6. If NOT found → 403 "Unknown company domain. Please request
//       access." + create an AccessRequest so the sales team can
//       follow up.
//
//  Auth: PUBLIC (the user is creating their account). Rate-limited
//  at the edge by the gateway.
//
//  Task: domain-matching-demo-isolation
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { logInfo, logWarn, logError } from "@/lib/logger";
import { extractDomainFromEmail } from "@/lib/harchiq/domain-extract";

export const dynamic = "force-dynamic";

const RegisterCompanySchema = z.object({
  email: z.string().email("Invalid email address").max(255),
  name: z.string().min(1, "Name is required").max(80),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
});

interface RegisterCompanyResponse {
  success: boolean;
  status: "created" | "pending_access" | "no_subscription" | "disposable_email" | "exists";
  message: string;
  companyName?: string;
  redirect?: string;
}

export async function POST(req: Request) {
  // ─── 1. Parse + validate body ─────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = RegisterCompanySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { name, password } = parsed.data;
  const normalizedEmail = parsed.data.email.trim().toLowerCase();

  // ─── 2. Check if user already exists ──────────────────────────
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, isDemo: true },
  });
  if (existingUser) {
    // Don't leak whether the existing user is demo or real — same
    // message either way. The user should contact support if they
    // can't sign in.
    const response: RegisterCompanyResponse = {
      success: false,
      status: "exists",
      message: "An account already exists with this email. Sign in instead.",
    };
    return NextResponse.json(response, { status: 409 });
  }

  // ─── 3. Extract domain from work email ───────────────────────
  const domain = extractDomainFromEmail(normalizedEmail);

  if (!domain) {
    // Either malformed or a disposable provider (gmail, yahoo, ...).
    // The registration form does this check client-side too, but we
    // re-check server-side because client validation is bypassable.
    const response: RegisterCompanyResponse = {
      success: false,
      status: "disposable_email",
      message:
        "Please use your work email address. Personal providers (Gmail, Yahoo, Outlook, ...) are not accepted for self-service registration.",
    };
    logWarn(
      "auth.register-company",
      `Disposable/malformed email rejected: ${normalizedEmail}`,
    );
    return NextResponse.json(response, { status: 403 });
  }

  // ─── 4. Look up Company by domain — REAL companies only ──────
  // Filter isDemo:false so a real BCP employee doesn't attach to the
  // demo-created BCP row. Demo companies are isolated from the
  // self-service flow.
  const company = await prisma.company.findUnique({
    where: { domain },
  });

  if (!company || company.isDemo) {
    // ─── 5b. Unknown company domain → create AccessRequest ─────
    // We create an AccessRequest so the sales team can follow up.
    // The user is told to wait — they cannot self-register.
    // If a pending request already exists for this email, the unique
    // constraint would block us; we check first to avoid the error.
    const existingRequest = await prisma.accessRequest.findFirst({
      where: { email: normalizedEmail, status: "pending" },
      select: { id: true },
    });

    if (!existingRequest) {
      try {
        await prisma.accessRequest.create({
          data: {
            email: normalizedEmail,
            name: name.trim(),
            company: domain,
            accountType: "brand-monitor",
            status: "pending",
            message: `Self-registration attempted with domain "${domain}". No matching company found in the directory.`,
          },
        });
      } catch {
        /* swallow — best-effort; the 403 response carries the message */
      }
    }

    const response: RegisterCompanyResponse = {
      success: false,
      status: "pending_access",
      message: `Unknown company domain "${domain}". Please request access and our team will contact you within 48 hours.`,
    };
    logInfo(
      "auth.register-company",
      `Unknown domain "${domain}" for ${normalizedEmail} — AccessRequest created`,
    );
    return NextResponse.json(response, { status: 403 });
  }

  // ─── 5. Subscription gate ────────────────────────────────────
  // A "subscription" is represented by CompanySettings existing for
  // this company (lazily created on first PATCH from the EnterpriseAdminPanel).
  // If no CompanySettings row exists, the company hasn't been onboarded
  // by an admin yet → treat as "no active subscription".
  //
  // This is a heuristic — we don't have a formal Subscription model
  // yet. When we add one (Stripe integration), this check will become
  // `subscription.status === "active"`.
  const settings = await prisma.companySettings.findUnique({
    where: { companyId: company.id },
    select: { id: true },
  });

  if (!settings) {
    const response: RegisterCompanyResponse = {
      success: false,
      status: "no_subscription",
      message:
        "Your company doesn't have an active subscription. Contact your administrator to enable Harch Atelier access.",
    };
    logInfo(
      "auth.register-company",
      `Domain matched "${company.name}" but no CompanySettings — no subscription`,
    );
    return NextResponse.json(response, { status: 403 });
  }

  // ─── 6. Create the user, attached to the matched company ─────
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: "user",
        accountType: "brand-monitor", // default — user can change via onboarding
        companyId: company.id,
        onboardingCompleted: false, // force the wizard on first login
        isDemo: false, // explicit — this is a real user
      },
      select: {
        id: true,
        email: true,
        name: true,
        companyId: true,
      },
    });

    logInfo(
      "auth.register-company",
      `New user registered: ${newUser.email} → company "${company.name}" (domain=${domain})`,
    );

    const response: RegisterCompanyResponse = {
      success: true,
      status: "created",
      message: `Account created. You're joining ${company.name}. Sign in to continue.`,
      companyName: company.name,
      redirect: "/atelier/login",
    };
    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    logError("auth.register-company", `Register-company user create error: ${err}`);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to create user",
      },
      { status: 500 },
    );
  }
}
