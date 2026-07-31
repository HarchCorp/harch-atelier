// ═══════════════════════════════════════════════════════════════
//  COMPANY DOMAIN LOOKUP — real-time validation for the signup form
//
//  GET /api/companies/lookup-domain?email=med.alami@attijariwafa.com
//
//  Returns the matching REAL company (isDemo:false) for the email's
//  domain, or a structured "unknown" / "disposable" status. Used by
//  the /atelier/request-access form to show inline feedback as the
//  user types their work email:
//
//    • Disposable  →  "Please use your work email address."
//    • Unknown     →  "Your company isn't registered yet. Request access."
//    • Known       →  "Great! You're joining [Company Name]."
//
//  Auth: PUBLIC — the lookup is needed before the user has an account.
//  We only return the company name + slug (never internal ids, never
//  demo companies).
//
//  Task: domain-matching-demo-isolation
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { extractDomainFromEmail } from "@/lib/harchiq/domain-extract";

export const dynamic = "force-dynamic";

type LookupStatus = "known" | "unknown" | "disposable" | "invalid";

interface LookupResponse {
  status: LookupStatus;
  domain: string | null;
  company: { name: string; slug: string; sector: string } | null;
  hasSubscription: boolean;
  message: string;
}

export async function GET(req: NextRequest) {
  const emailParam = req.nextUrl.searchParams.get("email") ?? "";
  const email = emailParam.trim().toLowerCase();

  if (!email) {
    const response: LookupResponse = {
      status: "invalid",
      domain: null,
      company: null,
      hasSubscription: false,
      message: "Enter your work email to continue.",
    };
    return NextResponse.json(response, { status: 200 });
  }

  const domain = extractDomainFromEmail(email);

  if (!domain) {
    // Either malformed or a disposable provider. We don't distinguish
    // between the two at the API level — the client shows the same
    // "use your work email" message either way. The disposable list
    // is enforced server-side in /api/auth/register-company.
    const isProbablyEmail = email.includes("@");
    const response: LookupResponse = {
      status: isProbablyEmail ? "disposable" : "invalid",
      domain: null,
      company: null,
      hasSubscription: false,
      message: isProbablyEmail
        ? "Please use your work email address. Personal providers (Gmail, Yahoo, ...) are not accepted."
        : "Enter a valid email address.",
    };
    return NextResponse.json(response, { status: 200 });
  }

  // Look up the REAL company (isDemo:false) by domain.
  const company = await prisma.company.findUnique({
    where: { domain },
    select: {
      id: true,
      name: true,
      slug: true,
      sector: true,
      isDemo: true,
    },
  });

  // If the row is a demo company, treat as unknown — we don't want
  // a real user to attach to a demo company.
  if (!company || company.isDemo) {
    const response: LookupResponse = {
      status: "unknown",
      domain,
      company: null,
      hasSubscription: false,
      message: `Your company isn't registered yet. Request access and our team will contact you.`,
    };
    return NextResponse.json(response, { status: 200 });
  }

  // Check whether the company has an active subscription (CompanySettings
  // exists). We surface this so the form can tell the user "your company
  // is registered but you'll need your admin to enable access".
  const settings = await prisma.companySettings.findUnique({
    where: { companyId: company.id },
    select: { id: true },
  });
  const hasSubscription = settings !== null;

  const response: LookupResponse = {
    status: "known",
    domain,
    company: {
      name: company.name,
      slug: company.slug,
      sector: company.sector,
    },
    hasSubscription,
    message: hasSubscription
      ? `Great! You're joining ${company.name}. Create your password to continue.`
      : `${company.name} is registered but doesn't have an active subscription yet. Contact your administrator.`,
  };
  return NextResponse.json(response, { status: 200 });
}
