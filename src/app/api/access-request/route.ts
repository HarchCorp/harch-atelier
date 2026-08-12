import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { logError } from "@/lib/logger";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

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
//
//  ─── SECURITY (Task: SECURITY-RATE-LIMIT) ────────────────────────
//  • Origin allow-list: only the prod domain + localhost dev may POST.
//    Defends against CSRF (evil.com can't submit a fake request from
//    a victim's browser because the browser will send evil.com's
//    Origin header, which we reject with 403).
//  • IP rate limit: 3 requests per IP per hour (in-memory). Blocks
//    DB-fill attacks (an attacker spamming thousands of fake rows).
//  • Email dedup: max 1 pending request per email (409 if duplicate).
//  • XSS sanitization: ALL string inputs have HTML tags stripped
//    via `<[^>]*>` regex before being stored. Defends against stored
//    XSS payloads (e.g. `<script>alert("XSS")</script>` in the name
//    field) from executing in the admin dashboard when rendered.
// ═══════════════════════════════════════════════════════════════

// Normalize free-form source strings sent by legacy clients to the
// canonical enum. Keeps backwards compatibility with the existing
// "contact-page" / "request-access" payloads already shipped.
const SOURCE_ALIASES: Record<string, string> = {
  "request-access": "request-access-page",
};

// ─── XSS sanitization helper ──────────────────────────────────────
// Strip any HTML tags from user input. The regex `<[^>]*>/g` matches
// `<`, then any run of non-`>` chars, then `>`. It's a blunt
// instrument (doesn't decode entities, doesn't handle malformed tags)
// but it's the standard defensive layer for "I just want plain text"
// fields. Combined with React's default escaping on the admin
// dashboard, this prevents stored XSS.
//
// Applied to ALL string fields in the Zod schema below via the
// `sanitized*` helpers.
const stripTags = (s: string): string => s.replace(/<[^>]*>/g, "").trim();

// Required sanitized string: strip tags, then enforce [1, max] length.
// Pre-sanitization max of 500 chars (generous — HTML tags inflate
// length, but we don't want an attacker to send a 10MB payload that
// the regex has to chomp through).
const sanitizedRequired = (max: number) =>
  z
    .string()
    .max(500)
    .transform(stripTags)
    .refine((s) => s.length >= 1 && s.length <= max, {
      message: `Must be 1-${max} chars after sanitization`,
    });

// Optional sanitized string: strip tags if present, enforce [0, max] length.
const sanitizedOptional = (max: number) =>
  z
    .string()
    .max(500)
    .optional()
    .transform((v) => (v ? stripTags(v) : undefined))
    .refine((s) => s === undefined || s.length <= max, {
      message: `Must be <= ${max} chars after sanitization`,
    });

const Schema = z.object({
  email: z.string().email(),
  name: sanitizedRequired(100),
  company: sanitizedOptional(200),
  role: sanitizedOptional(100),
  // Accept any account type string — admin UI normalizes via planLabel.
  // Default to "essential" (canonical Harch Atelier plan).
  accountType: sanitizedOptional(50),
  companySize: z.enum(["startup", "sme", "mid-market", "enterprise"]).optional(),
  useCase: sanitizedOptional(2000),
  budget: sanitizedOptional(50),
  phone: sanitizedOptional(30),
  // Country defaults to "Morocco" — defensive: if the client sends an
  // empty/HTML-only string, fall back to "Morocco".
  country: z
    .string()
    .max(500)
    .optional()
    .transform((v) => {
      if (!v) return "Morocco";
      const cleaned = stripTags(v);
      return cleaned || "Morocco";
    })
    .refine((s) => s.length <= 100, { message: "Country too long" }),
  referralSource: sanitizedOptional(200),
  message: sanitizedOptional(4000),

  // ─── NEW: source page identifier ──────────────────────────────
  source: sanitizedOptional(50),

  // ─── NEW: audit form extra fields ─────────────────────────────
  website: sanitizedOptional(500),
  sector: sanitizedOptional(200),
  competitors: sanitizedOptional(1000),
  sources: z
    .array(sanitizedRequired(100))
    .max(20)
    .optional(),
  goals: sanitizedOptional(2000),

  // ─── Legacy fields accepted from other pages ──────────────────
  // RequestAccessPage sends `fonction` (role) + `plan` (accountType).
  fonction: sanitizedOptional(100),
  plan: sanitizedOptional(50),
});

// ─── SECURITY: Origin allow-list (CSRF defense) ───────────────────
// Only accept POSTs from the legitimate production origin OR
// localhost dev. The check is on the Origin header (sent by the
// browser on cross-origin POSTs); an attacker on evil.com cannot
// forge this header from a victim's browser (CORS / browser same-
// origin policy enforces it).
//
// Implementation: we parse the Origin with `new URL()` and check the
// hostname. This is stricter (and safer) than `startsWith` — a
// naive `origin.startsWith("http://localhost")` would also accept
// "http://localhost.evil.com", which an attacker controls. Parsing
// the URL isolates the hostname component so spoofed suffixes can't
// slip through.
const ALLOWED_PROD_ORIGINS = new Set([
  "https://atelier.harchcorp.com",
]);

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  try {
    const u = new URL(origin);
    // Dev: localhost / 127.0.0.1 on any port (next dev runs on :3000,
    // tunnels can run on other ports).
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") {
      return true;
    }
    // Prod: exact origin match (https, no port, canonical host).
    return ALLOWED_PROD_ORIGINS.has(origin);
  } catch {
    // Malformed Origin header → reject.
    return false;
  }
}

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // ─── SECURITY #1: Origin check (CSRF defense) ─────────────────
    // Cheap check — no body parsing needed. Reject any cross-origin
    // POST before we touch the DB or rate limiter.
    const origin = req.headers.get("origin");
    if (!isAllowedOrigin(origin)) {
      return NextResponse.json(
        { error: "Forbidden — invalid origin" },
        { status: 403 },
      );
    }

    // ─── SECURITY #2: IP rate limit (DB-fill defense) ────────────
    // 3 requests per IP per hour. In-memory Map (resets on cold
    // start — acceptable for Hobby plan). An attacker who wants to
    // fill the DB with fake access requests is capped at 3/hour/IP.
    const ip = getClientIp(req);
    const ipKey = `access-request:${ip}`;
    const ipLimit = checkRateLimit(ipKey, 3, 60 * 60 * 1000); // 3 / hour
    if (!ipLimit.allowed) {
      const minutesLeft = Math.max(
        1,
        Math.ceil((ipLimit.resetAt - Date.now()) / 60_000),
      );
      return NextResponse.json(
        {
          error: `Trop de demandes. Reessayez dans ${minutesLeft} minutes.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.ceil((ipLimit.resetAt - Date.now()) / 1000),
            ),
          },
        },
      );
    }

    const body = await req.json();
    const parsed = Schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 },
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

    // ─── SECURITY #3: email dedup (1 pending request per email) ─
    // An email with a pending request cannot submit another. The
    // admin must approve/reject the existing one first. Prevents
    // both accidental double-submits and targeted DB-fill on a
    // single email.
    const existing = await prisma.accessRequest.findFirst({
      where: { email: data.email, status: "pending" },
    });

    if (existing) {
      return NextResponse.json(
        {
          error:
            "Vous avez deja une demande en cours. Nous vous répondrons rapidement.",
        },
        { status: 409 },
      );
    }

    // Check if email already has an account
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "Un compte existe deja avec cet email. Contactez-nous si vous avez perdu votre acces.",
        },
        { status: 409 },
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
      { status: 500 },
    );
  }
}
