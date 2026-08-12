import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { logError } from "@/lib/logger";

// ═══════════════════════════════════════════════════════════════
//  POST /api/access-request
//
//  Public route — anyone can submit an access request.
//  Admin reviews and creates invitations from these requests.
//
//  Body: { email, name, company?, role?, accountType?, companySize?,
//          useCase?, budget?, phone?, country?, referralSource?, message?,
//          source?, website?, sector?, competitors?, sources[]?, goals?,
//          fonction?, plan? }
//
//  ─── source field (Task: FIX-FORMS-1) ────────────────────────────
//  Identifies which public page produced the submission.
//  Stored in the `source` column of AccessRequest so the admin can
//  filter and triage per origin page.
//  Accepted values:
//    - "audit-page"           → /atelier/audit (3-step audit form)
//    - "contact-page"         → /atelier/contact
//    - "request-access-page"  → /atelier/request-access
//    - "landing-page"         → /atelier (home FinalCTA)
//    - "partner-application"  → /atelier/partners/apply
//  Legacy / alias values are normalized to the canonical enum.
//
//  ─── audit extra fields ──────────────────────────────────────────
//  The audit form collects extra fields that don't have dedicated
//  columns in the AccessRequest schema. We pack them into `message`
//  as formatted text so the admin can read them in the drawer:
//    - website     → packed into message
//    - sector      → packed into message
//    - competitors → packed into message
//    - sources[]   → packed into message (joined list)
//    - goals       → mapped to `useCase` (better fit than message)
// ═══════════════════════════════════════════════════════════════

// Normalize free-form source strings sent by legacy clients to the
// canonical enum. Keeps backwards compatibility with the existing
// "contact-page" / "request-access" payloads already shipped.
const SOURCE_ALIASES: Record<string, string> = {
  "request-access": "request-access-page",
};

const Schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  company: z.string().max(200).optional(),
  role: z.string().max(100).optional(),
  // Accept any account type string — admin UI normalizes via planLabel.
  // Default to "essential" (canonical Harch Atelier plan).
  accountType: z.string().max(50).optional(),
  companySize: z.enum(["startup", "sme", "mid-market", "enterprise"]).optional(),
  useCase: z.string().max(2000).optional(),
  budget: z.string().max(50).optional(),
  phone: z.string().max(30).optional(),
  country: z.string().max(100).default("Morocco"),
  referralSource: z.string().max(200).optional(),
  message: z.string().max(4000).optional(),

  // ─── NEW: source page identifier ──────────────────────────────
  source: z.string().max(50).optional(),

  // ─── NEW: audit form extra fields ─────────────────────────────
  website: z.string().max(500).optional(),
  sector: z.string().max(200).optional(),
  competitors: z.string().max(1000).optional(),
  sources: z.array(z.string().max(100)).max(20).optional(),
  goals: z.string().max(2000).optional(),

  // ─── Legacy fields accepted from other pages ──────────────────
  // RequestAccessPage sends `fonction` (role) + `plan` (accountType).
  fonction: z.string().max(100).optional(),
  plan: z.string().max(50).optional(),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = Schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // ─── Normalize source ──────────────────────────────────────
    let source = (data.source || "contact-page").trim();
    if (SOURCE_ALIASES[source]) source = SOURCE_ALIASES[source];

    // ─── Normalize accountType (legacy / plan fallback) ────────
    // Some clients send `plan` instead of `accountType`; honor it.
    let accountType = data.accountType || data.plan || "essential";

    // ─── Map role from `fonction` fallback ─────────────────────
    const role = data.role || data.fonction || undefined;

    // ─── Pack audit extra fields into message (formatted text) ─
    // The audit form sends website / sector / competitors / sources
    // which don't have dedicated columns. We prepend them to the
    // existing message so the admin can read the full context in
    // the drawer's "Cas d'usage & message" section.
    const packedParts: string[] = [];
    if (data.website) packedParts.push(`Site web: ${data.website}`);
    if (data.sector) packedParts.push(`Secteur: ${data.sector}`);
    if (data.competitors) packedParts.push(`Concurrents: ${data.competitors}`);
    if (data.sources && data.sources.length > 0) {
      packedParts.push(`Sources surveillees: ${data.sources.join(", ")}`);
    }
    let finalMessage = data.message || "";
    if (packedParts.length > 0) {
      const packedBlock = `--- Demande d'audit ---\n${packedParts.join("\n")}\n--- Fin ---`;
      finalMessage = finalMessage
        ? `${packedBlock}\n\n${finalMessage}`
        : packedBlock;
    }

    // ─── useCase: goals takes precedence over useCase ──────────
    // The audit form's `goals` field maps to `useCase` (the column
    // that represents "what they want to monitor / achieve").
    const useCase = data.goals || data.useCase || undefined;

    // ─── referralSource: default to source page if not set ─────
    // Keeps the existing UTM-parsing drawer working: if a client
    // sends a referralSource, we keep it; otherwise we record the
    // source page so the boss can see where the lead came from.
    const referralSource = data.referralSource || source;

    // Check if email already has a pending request
    const existing = await prisma.accessRequest.findFirst({
      where: { email: data.email, status: "pending" },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You already have a pending request. We'll get back to you soon." },
        { status: 409 }
      );
    }

    // Check if email already has an account
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account already exists with this email. Please contact us if you've lost access." },
        { status: 409 }
      );
    }

    const request = await prisma.accessRequest.create({
      data: {
        email: data.email,
        name: data.name,
        company: data.company,
        role,
        accountType,
        companySize: data.companySize,
        useCase,
        budget: data.budget,
        phone: data.phone,
        country: data.country,
        referralSource,
        message: finalMessage || null,
        source,
      },
    });

    return NextResponse.json({
      status: "submitted",
      id: request.id,
      source: request.source,
      message: "Your request has been received. The Harch Atelier team will review it and send you an access link if approved.",
    });
  } catch (err) {
    logError("access-request", `Access request error: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Request failed" },
      { status: 500 }
    );
  }
}
