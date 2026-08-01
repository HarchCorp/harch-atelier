import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import {
  generateApiKey,
  HARCH_KEY_PREFIX,
} from "@/lib/auth/api-key";
import { logAudit, extractIp, extractUserAgent } from "@/lib/harchiq/audit-log";

// ═══════════════════════════════════════════════════════════════
//  /api/api-keys
//
//  POST   — mint a new API key for the authenticated user.
//            Body: { name: string, expiresAt?: string (ISO) }
//            Returns the plaintext key ONCE: { key, id, name, prefix, createdAt }
//
//  GET    — list the user's API keys (without the plaintext value).
//            Each row includes: id, name, prefix, tier, lastUsedAt,
//            expiresAt, createdAt, revokedAt.
//
//  Auth: NextAuth browser session. The user must belong to a company
//  (API keys are company-scoped — every public API call resolves the
//  key → user → companyId chain so a key inherits the company's data
//  isolation). Company admins (role=company-admin) AND regular users
//  of a company can mint keys for themselves — the keys belong to the
//  user, not the company, so an offboarding admin can revoke their
//  access by revoking the user.
//
//  Limits: max 5 active (non-revoked) keys per user. This matches
//  GitHub's "fine-grained PAT" cap and keeps the keys manageable.
//
//  Task: signal-enterprise-platform
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

const MAX_KEYS_PER_USER = 5;

// ─── Helpers ─────────────────────────────────────────────────────

async function getSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      companyId: true,
      status: true,
      role: true,
      isDemo: true,
    },
  });
  if (!user) return null;
  if (user.status === "suspended") return null;
  return user;
}

// ─── POST /api/api-keys ──────────────────────────────────────────

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!user.companyId) {
    return NextResponse.json(
      {
        error: "Your account is not attached to a company — complete onboarding first.",
        redirect: "/atelier/onboarding",
      },
      { status: 403 },
    );
  }

  // ─── Parse body ───────────────────────────────────────────────
  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name || name.length < 3 || name.length > 64) {
    return NextResponse.json(
      { error: "Key name must be 3-64 characters." },
      { status: 400 },
    );
  }

  // Optional expiration. Accept ISO strings only; reject anything else
  // so a typo doesn't silently create a never-expiring key.
  let expiresAt: Date | null = null;
  if (body.expiresAt !== undefined && body.expiresAt !== null && body.expiresAt !== "") {
    const parsed = new Date(body.expiresAt);
    if (isNaN(parsed.getTime())) {
      return NextResponse.json(
        { error: "expiresAt must be a valid ISO date string." },
        { status: 400 },
      );
    }
    if (parsed <= new Date()) {
      return NextResponse.json(
        { error: "expiresAt must be in the future." },
        { status: 400 },
      );
    }
    expiresAt = parsed;
  }

  // ─── Enforce max-keys cap ─────────────────────────────────────
  const activeCount = await prisma.apiKey.count({
    where: { userId: user.id, revokedAt: null },
  });
  if (activeCount >= MAX_KEYS_PER_USER) {
    return NextResponse.json(
      {
        error: `You already have ${activeCount} active API keys. Revoke one before creating a new key (max ${MAX_KEYS_PER_USER}).`,
        limit: MAX_KEYS_PER_USER,
        activeCount,
      },
      { status: 409 },
    );
  }

  // ─── Mint the key ─────────────────────────────────────────────
  const generated = generateApiKey();

  const apiKey = await prisma.apiKey.create({
    data: {
      userId: user.id,
      keyHash: generated.hash,
      keyPrefix: generated.prefix,
      name,
      tier: "pro", // default tier; super-admin can elevate via /api/admin/* (TBD)
      expiresAt,
    },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      tier: true,
      expiresAt: true,
      createdAt: true,
    },
  });

  // ─── Audit (Loi 09-08) ────────────────────────────────────────
  await logAudit({
    userId: user.id,
    action: "api_key.create" as never,
    resource: `apikey:${apiKey.id}`,
    result: "success",
    ipAddress: extractIp(req),
    userAgent: extractUserAgent(req),
    metadata: {
      name,
      prefix: generated.prefix,
      expiresAt: expiresAt?.toISOString() ?? null,
    },
  });

  // ─── Return the plaintext key ONCE ────────────────────────────
  return NextResponse.json({
    key: generated.plaintext, // NEVER returned again after this response
    id: apiKey.id,
    name: apiKey.name,
    prefix: apiKey.keyPrefix,
    tier: apiKey.tier,
    expiresAt: apiKey.expiresAt,
    createdAt: apiKey.createdAt,
    warning:
      "This key won't be shown again. Store it securely — anyone with this string can call the Harch Atelier API on your behalf.",
    keyFormat: `${HARCH_KEY_PREFIX}<32 hex chars>`,
  });
}

// ─── GET /api/api-keys ───────────────────────────────────────────

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = await prisma.apiKey.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      tier: true,
      lastUsedAt: true,
      expiresAt: true,
      createdAt: true,
      revokedAt: true,
    },
  });

  // Annotate each row with a derived `status` field so the UI doesn't
  // have to recompute it (active | expired | revoked).
  const now = new Date();
  const annotated = keys.map((k) => {
    let status: "active" | "expired" | "revoked" = "active";
    if (k.revokedAt) status = "revoked";
    else if (k.expiresAt && k.expiresAt < now) status = "expired";
    return { ...k, status };
  });

  return NextResponse.json({
    keys: annotated,
    total: annotated.length,
    active: annotated.filter((k) => k.status === "active").length,
    limit: MAX_KEYS_PER_USER,
  });
}
