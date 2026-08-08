import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  generateWebAuthnChallenge,
  getRpId,
  storeWebAuthnChallenge,
  consumeWebAuthnChallenge,
  verifyWebAuthnAssertion,
} from "@/lib/auth/zkp-passkeys";
import {
  listWebAuthnCredentials,
  findWebAuthnCredential,
  touchWebAuthnCredential,
} from "@/lib/auth/credential-store";
import { logAudit, extractIp, extractUserAgent } from "@/lib/harchiq/audit-log";
import { logInfo } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ═══════════════════════════════════════════════════════════════
//  POST /api/auth/webauthn-verify
//
//  Step 1: Client requests a verification challenge.
//  Body: { email }
//  Returns: { challengeId, challenge, rpId, allowCredentials }
//
//  Step 2: Client calls navigator.credentials.get() with the
//  challenge, then POSTs the assertion back.
//  Body: { challengeId, credentialId, authenticatorData,
//          clientDataJSON, signature }
//  Returns: { ok: true, authenticated: true, user: {...} }
//
//  NEMESIS defense: the payload contains ONLY binary blobs
//  (authenticatorData, clientDataJSON, signature). No password,
//  no hash, no secret. The private key is hardware-bound.
// ═══════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const rpId = getRpId(req);

  // ─── Step 1: Generate challenge ──────────────────────────────
  if (!body.credentialId) {
    const { email } = body;
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, status: true },
    });

    if (!user) {
      // Anti-enumeration: return dummy challenge with same timing
      const dummyChallenge = generateWebAuthnChallenge();
      const challengeId = `wa_ver_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      return NextResponse.json({
        challengeId,
        challenge: dummyChallenge,
        rpId,
        allowCredentials: [],
        userVerification: "required" as const,
      });
    }

    // Load stored credentials — dedicated WebAuthnCredential table
    // (Task REAL-AUTH) with transparent useCaseNote fallback.
    const credentials = await listWebAuthnCredentials(user.id);

    if (credentials.length === 0) {
      // Anti-enumeration: same shape as "user has no creds" — return
      // a dummy challenge so timing doesn't leak account existence.
      const dummyChallenge = generateWebAuthnChallenge();
      const challengeId = `wa_ver_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      return NextResponse.json({
        challengeId,
        challenge: dummyChallenge,
        rpId,
        allowCredentials: [],
        userVerification: "required" as const,
      });
    }

    const challenge = generateWebAuthnChallenge();
    const challengeId = `wa_ver_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    storeWebAuthnChallenge(challengeId, email, challenge, "verification", user.id);

    return NextResponse.json({
      challengeId,
      challenge,
      rpId,
      allowCredentials: credentials.map((c) => ({
        id: c.credentialId,
        type: "public-key" as const,
        transports: c.transports,
      })),
      userVerification: "required" as const,
    });
  }

  // ─── Step 2: Verify the assertion ────────────────────────────
  const { challengeId, credentialId, authenticatorData, clientDataJSON, signature } = body;

  if (!challengeId || !credentialId || !authenticatorData || !clientDataJSON || !signature) {
    return NextResponse.json({ error: "Missing assertion fields" }, { status: 400 });
  }

  const challengeEntry = consumeWebAuthnChallenge(challengeId);
  if (!challengeEntry) {
    return NextResponse.json({ error: "Challenge expired or invalid" }, { status: 401 });
  }

  // Fetch the user
  const user = await prisma.user.findUnique({
    where: { email: challengeEntry.email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      accountType: true,
      status: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  // Find the matching credential — dedicated table with useCaseNote fallback.
  // We scope the lookup to this user's id so a credential from a different
  // account can never authenticate here.
  const storedCredential = await findWebAuthnCredential(credentialId, user.id);
  if (!storedCredential) {
    return NextResponse.json({ error: "Credential not found" }, { status: 404 });
  }

  // Verify the assertion
  const expectedOrigin = `${req.nextUrl.protocol}//${req.nextUrl.host}`;
  const isValid = await verifyWebAuthnAssertion(
    storedCredential.publicKey,
    authenticatorData,
    clientDataJSON,
    signature,
    challengeEntry.challenge,
    expectedOrigin,
    rpId,
  );

  if (!isValid) {
    await logAudit({
      userId: user.id,
      action: "login_failed",
      resource: `webauthn:${user.email}`,
      result: "denied",
      ipAddress: extractIp(req),
      userAgent: extractUserAgent(req),
      metadata: { reason: "invalid_assertion" },
    });
    return NextResponse.json({ error: "Invalid assertion" }, { status: 401 });
  }

  if (user.status === "suspended") {
    return NextResponse.json({ error: "Account suspended" }, { status: 403 });
  }

  await logAudit({
    userId: user.id,
    action: "login",
    resource: `webauthn:${user.email}`,
    result: "success",
    ipAddress: extractIp(req),
    userAgent: extractUserAgent(req),
    metadata: { method: "webauthn", credentialId: credentialId.slice(0, 16) },
  });

  logInfo("webauthn-verify", `WebAuthn login for ${user.email} — biometric verified, no password used`);

  // Bump the counter + lastUsedAt (replay protection).
  // Fire-and-forget — don't block the response on the counter write.
  touchWebAuthnCredential(credentialId, (storedCredential.counter ?? 0) + 1).catch(() => {
    // Best-effort: a failed counter bump shouldn't fail the login.
  });

  return NextResponse.json({
    ok: true,
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      accountType: user.accountType,
    },
    message: "WebAuthn authentication successful — biometric verified",
  });
}
