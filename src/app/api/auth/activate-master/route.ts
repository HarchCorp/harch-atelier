import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";
import { logAudit, extractUserAgent } from "@/lib/harchiq/audit-log";
import { validateMasterCode } from "@/lib/auth/master-code";
import { UserRole } from "@/lib/auth/rbac";
import { logError } from "@/lib/logger";

// ═══════════════════════════════════════════════════════════════
//  POST /api/auth/activate-master
//
//  Activate the super_admin role on the authenticated user by
//  consuming a one-time Master Code.
//
//  Body: { code: string, userId?: string }
//    - code:   the HARCH-XXXXX-XXXXX-XXXXX plaintext (required)
//    - userId: optional — defaults to the session user's id. If
//              provided, it MUST match the session user's id (you
//              cannot activate super_admin on someone else's account).
//
//  Auth: requires an authenticated NextAuth session. The session
//  user is the one upgraded — an unauthenticated caller cannot
//  activate a code.
//
//  Anti-brute-force: 5 attempts per IP per 10 minutes. On the 6th
//  attempt within the window, returns 429 with Retry-After.
//
//  Responses:
//    200 — { ok: true, message: "super_admin activated" }
//    400 — invalid body (Zod error)
//    401 — not authenticated
//    403 — code invalid / already used / expired / user already super_admin
//    409 — userId in body does not match session user
//    429 — rate-limited
//    500 — internal error
//
//  Task ID: YGGDRASIL-rbac (ÉTAPE 5)
// ═══════════════════════════════════════════════════════════════

// ─── ANTI-BRUTE-FORCE ───────────────────────────────────────────
// 5 attempts per IP per 10 minutes. The window is generous because
// a legitimate operator may mis-transcribe a character or two, but
// tight enough that an automated 10k-attempt enumeration is reduced
// to ~5 attempts per IP per 10 min — combined with the 24h TTL and
// the 15-char random space (32^15 ≈ 3.7e22), brute-force is
// computationally infeasible.
const activateMasterLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  maxRequests: 5,
});

// ─── BODY SCHEMA ────────────────────────────────────────────────
const ActivateMasterSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .max(100, "Code too long"),
  userId: z.string().max(100).optional(),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // ─── 1. RATE LIMIT (by IP, before any work) ──────────────────
  const ip = getClientIp(req);
  const rl = activateMasterLimiter.check(ip);
  if (!rl.allowed) {
    const retryAfterSec = Math.ceil((rl.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      {
        ok: false,
        error: "Too many activation attempts. Try again later.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSec) },
      },
    );
  }

  // ─── 2. AUTHENTICATE ─────────────────────────────────────────
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json(
      { ok: false, error: "Authentication required." },
      { status: 401 },
    );
  }

  // Demo accounts cannot activate a master code (they're in-memory
  // only, so an upgrade would silently vanish on the next request).
  if (session.user.isDemo) {
    await logAudit({
      userId: session.user.id,
      action: "master_code_failed",
      resource: "master-code:demo-blocked",
      result: "denied",
      ipAddress: ip,
      userAgent: extractUserAgent(req),
      metadata: { reason: "demo_account_blocked" },
    });
    return NextResponse.json(
      {
        ok: false,
        error: "Demo accounts cannot be promoted to super_admin.",
      },
      { status: 403 },
    );
  }

  // ─── 3. PARSE + VALIDATE BODY ───────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const parsed = ActivateMasterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid input.",
        details: parsed.error.issues,
      },
      { status: 400 },
    );
  }

  const { code, userId: bodyUserId } = parsed.data;

  // ─── 4. ENFORCE userId MATCHES SESSION ──────────────────────
  // The caller cannot upgrade someone else — the userId in the body
  // (if provided) must match the authenticated session user's id.
  if (bodyUserId && bodyUserId !== session.user.id) {
    await logAudit({
      userId: session.user.id,
      action: "master_code_failed",
      resource: `master-code:userid-mismatch:${bodyUserId}`,
      result: "denied",
      ipAddress: ip,
      userAgent: extractUserAgent(req),
      metadata: {
        reason: "body_userId_does_not_match_session",
        targetUserId: bodyUserId,
      },
    });
    return NextResponse.json(
      {
        ok: false,
        error: "You can only activate a master code on your own account.",
      },
      { status: 409 },
    );
  }

  const targetUserId = session.user.id;

  // ─── 5. FETCH THE USER FROM DB (authoritative role check) ──
  // The session's `role` claim may be stale (cached in JWT). We
  // re-read the user's current role from the DB to make the
  // already_super_admin decision authoritative.
  let dbUser;
  try {
    dbUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, email: true, role: true, status: true },
    });
  } catch (err) {
    logError("auth.activate-master", `[activate-master] DB error fetching user — ${err}`);
    return NextResponse.json(
      { ok: false, error: "Database unavailable." },
      { status: 500 },
    );
  }

  if (!dbUser) {
    await logAudit({
      userId: targetUserId,
      action: "master_code_failed",
      resource: "master-code:user-not-found",
      result: "denied",
      ipAddress: ip,
      userAgent: extractUserAgent(req),
      metadata: { reason: "user_not_found" },
    });
    return NextResponse.json(
      { ok: false, error: "User not found." },
      { status: 403 },
    );
  }

  if (dbUser.status === "suspended") {
    await logAudit({
      userId: targetUserId,
      action: "master_code_failed",
      resource: "master-code:suspended",
      result: "denied",
      ipAddress: ip,
      userAgent: extractUserAgent(req),
      metadata: { reason: "user_suspended" },
    });
    return NextResponse.json(
      { ok: false, error: "Account is suspended." },
      { status: 403 },
    );
  }

  // ─── 6. VALIDATE THE CODE (atomic mark-used + user upgrade) ─
  const result = await validateMasterCode(code, {
    id: dbUser.id,
    email: dbUser.email,
    role: dbUser.role,
  });

  if (!result.ok) {
    // Map the granular reason to a user-facing message. We never
    // leak which specific failure occurred (invalid_format vs
    // not_found vs already_used) — all return the same generic
    // "invalid code" message to avoid enumeration side-channels.
    const httpReason: Record<typeof result.reason, string> = {
      invalid_format: "Invalid code.",
      not_found: "Invalid code.",
      already_used: "Invalid code.",
      expired: "Invalid code.",
      user_not_found: "User not found.",
      already_super_admin: "Account is already super_admin.",
      db_error: "Database unavailable.",
    };

    const status =
      result.reason === "db_error"
        ? 500
        : result.reason === "already_super_admin"
          ? 409
          : 403;

    return NextResponse.json(
      { ok: false, error: httpReason[result.reason] },
      { status },
    );
  }

  // ─── 7. SUCCESS ─────────────────────────────────────────────
  // validateMasterCode has already:
  //   - marked the code as used (usedAt + usedByUserId)
  //   - upgraded the user to super_admin
  //   - emitted an audit log entry
  //
  // We return a 200 with a clear message. The frontend should force
  // a sign-out + sign-in to refresh the JWT (which now carries
  // role="super_admin").
  return NextResponse.json({
    ok: true,
    message:
      "super_admin activated. Please sign out and sign back in to refresh your session.",
    codeId: result.codeId,
    newRole: UserRole.SUPER_ADMIN,
  });
}
