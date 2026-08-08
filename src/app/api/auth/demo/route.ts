// ═══════════════════════════════════════════════════════════════
//  EXECUTIVE DEMO GATEWAY — Auth bypass for Comex presentations
//
//  POST /api/auth/demo
//  Body: { accountType: string, setupToken: string }
//
//  When Amine opens his laptop in a client's office (Attijariwafa,
//  Al Mada, OCP, etc.), he can't afford login friction or an empty
//  dashboard. This route validates a shared demo secret and either
//  creates or reuses a per-offer demo user, then returns the
//  credentials the client-side signIn() call needs.
//
//  Security:
//    - SETUP_TOKEN must match process.env.SETUP_TOKEN
//    - accountType is validated against the 4 known offers
//    - Demo users are clearly marked (email pattern demo-<type>@harch.atelier)
//    - Password is a fixed, non-secret string - the demo user has no
//      real account value, and the email pattern lets any admin
//      audit / revoke demo access at any time.
//
//  Auth flow:
//    1. Client POSTs { accountType, setupToken }
//    2. This route validates + upserts the demo user
//    3. Returns { ok, email, password, redirect }
//    4. Client calls signIn("credentials", { email, password,
//       redirect: true, callbackUrl: "/atelier/console" })
//    5. NextAuth issues a JWT and redirects to the console
//
//  Why client-side signIn? NextAuth v4 doesn't expose a server-side
//  signIn() for the Credentials provider (it would require the
//  HTTP request context that only the [...nextauth] route owns).
//  Returning credentials to the client is safe here because the
//  demo user has no password-gated value - the SETUP_TOKEN is the
//  only real gate, and it's already validated server-side.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { logInfo, logWarn, logError } from "@/lib/logger";
import { logAudit, extractIp, extractUserAgent } from "@/lib/harchiq/audit-log";

export const dynamic = "force-dynamic";

const VALID_ACCOUNT_TYPES = [
  "brand-monitor",
  "market-competitor",
  "investment-bank",
  "harch-alpha",
] as const;
type DemoAccountType = (typeof VALID_ACCOUNT_TYPES)[number];

const DEMO_PASSWORD = "demo-no-password-needed";

interface DemoRequestBody {
  accountType?: unknown;
  setupToken?: unknown;
}

export async function POST(req: NextRequest) {
  // ─── Parse + validate body ────────────────────────────────────
  let body: DemoRequestBody;
  try {
    body = (await req.json()) as DemoRequestBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { accountType, setupToken } = body;

  // ─── Validate setup token ─────────────────────────────────────
  // SETUP_TOKEN is the only real gate. The demo user it provisions
  // has no password-gated value (it's an empty shell until the seed
  // route populates data), so plain string equality is acceptable
  // here - the value is documented as a low-security demo secret.
  const expected = process.env.SETUP_TOKEN;
  if (!expected || typeof setupToken !== "string" || setupToken !== expected) {
    logWarn("auth.demo", "Demo access rejected - invalid SETUP_TOKEN");
    return NextResponse.json(
      { ok: false, error: "Invalid token" },
      { status: 401 },
    );
  }

  // ─── Validate accountType ─────────────────────────────────────
  if (
    typeof accountType !== "string" ||
    !VALID_ACCOUNT_TYPES.includes(accountType as DemoAccountType)
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Invalid account type - must be one of: " +
          VALID_ACCOUNT_TYPES.join(", "),
      },
      { status: 400 },
    );
  }

  const typedAccountType = accountType as DemoAccountType;

  // ─── Upsert demo user ─────────────────────────────────────────
  // Email pattern `demo-<type>@harch.atelier` makes demo accounts
  // trivially auditable (admin can list/filter by this prefix).
  const demoEmail = `demo-${typedAccountType}@harch.atelier`;
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // ─── Task: user-company-onboarding ─────────────────────────────
  // Demo users skip the onboarding wizard — they share the FIRST
  // company in the DB as their company scope (the demo-seed route
  // populates data for that same company). Traders (harch-alpha)
  // don't actually call the company-scoped console APIs, so the
  // fallback company is harmless for them.
  // We resolve the fallback company once, before the upsert, so the
  // update + create branches can both reference it.
  const fallbackCompany = await prisma.company.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true },
  });
  const demoCompanyId = fallbackCompany?.id ?? null;
  if (!demoCompanyId) {
    logWarn("auth.demo", "No companies in DB — demo user will not have a companyId");
  } else {
    logInfo("auth.demo", `Demo user attached to company: ${fallbackCompany?.name}`);
  }

  try {
    const user = await prisma.user.upsert({
      where: { email: demoEmail },
      update: {
        // Refresh the password hash + accountType on each demo
        // request so a previously-revoked demo user is re-enabled
        // cleanly without manual DB surgery.
        accountType: typedAccountType,
        role: "user",
        passwordHash,
        // Demo user is opted-out of WhatsApp alerts by default -
        // the demo console hides the WhatsApp button entirely.
        whatsappAlerts: false,
        alertSeverityThreshold: "critical",
        // ─── Task: user-company-onboarding ────────────────────────
        // Demo users skip the wizard (onboardingCompleted = true) and
        // are auto-attached to the first company in the DB so the
        // company-scoped console APIs (/weather, /alerts, etc.) work
        // without forcing the user through onboarding first.
        companyId: demoCompanyId,
        onboardingCompleted: true,
        // ─── Task: domain-matching-demo-isolation ─────────────────
        // Mark the demo user as isDemo so the company-session helper
        // builds demoFilter = { isDemo: true } for every console API
        // call. Demo users see ONLY demo data, never real data.
        isDemo: true,
      },
      create: {
        email: demoEmail,
        name: "Executive Demo",
        accountType: typedAccountType,
        role: "user",
        passwordHash,
        whatsappAlerts: false,
        alertSeverityThreshold: "critical",
        companyId: demoCompanyId,
        onboardingCompleted: true,
        isDemo: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        accountType: true,
        role: true,
      },
    });

    logInfo(
      "auth.demo",
      `Demo user ready: ${user.email} (accountType=${user.accountType})`,
    );

    // ─── Audit log (Loi 09-08) — demo access granted ────────────
    await logAudit({
      userId: user.id,
      action: "demo_access",
      resource: `demo:${typedAccountType}`,
      result: "success",
      ipAddress: extractIp(req),
      userAgent: extractUserAgent(req),
      metadata: {
        demoEmail: user.email,
        accountType: typedAccountType,
        companyId: demoCompanyId,
      },
    });

    // ─── Return credentials for client-side signIn ──────────────
    // The client (DemoPage.tsx) calls signIn("credentials", ...)
    // with these values. The redirect target is /atelier/console,
    // which auto-routes to the correct per-offer dashboard.
    return NextResponse.json({
      ok: true,
      email: demoEmail,
      password: DEMO_PASSWORD,
      redirect: "/atelier/console",
      accountType: typedAccountType,
    });
  } catch (err) {
    logWarn(
      "auth.demo",
      `Demo user upsert failed: ${err instanceof Error ? err.message : "unknown"}`,
    );
    return NextResponse.json(
      { ok: false, error: "Failed to provision demo user" },
      { status: 500 },
    );
  }
}
