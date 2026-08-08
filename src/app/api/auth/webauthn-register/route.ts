import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import {
  generateWebAuthnChallenge,
  bufToBase64Url,
  getRpId,
  storeWebAuthnChallenge,
} from "@/lib/auth/zkp-passkeys";
import {
  listWebAuthnCredentials,
  createWebAuthnCredential,
} from "@/lib/auth/credential-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ═══════════════════════════════════════════════════════════════
//  POST /api/auth/webauthn-register
//
//  Step 1: Client requests a registration challenge.
//  Body: { email }
//  Returns: { challengeId, challenge, rpId, rpName, userId, userName,
//             userDisplayName, excludeCredentials }
//
//  Step 2: Client calls navigator.credentials.create() with the
//  challenge, then POSTs the result back to this same route.
//  Body: { challengeId, credentialId, publicKey, attestationObject,
//          clientDataJSON, transports }
//  Returns: { ok: true } — the credential is stored.
//
//  The private key NEVER leaves the device. We store only the
//  public key (credential) on the server.
// ═══════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized — must be logged in to register a passkey" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const rpId = getRpId(req);
  const rpName = "HarchIQ Atelier";

  // ─── Step 1: Generate challenge ──────────────────────────────
  if (!body.credentialId) {
    const challenge = generateWebAuthnChallenge();
    const challengeId = `wa_reg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const userId = bufToBase64Url(new TextEncoder().encode(session.user.id));

    // Get existing credentials to exclude (prevent re-registration)
    // Uses dedicated WebAuthnCredential table (Task REAL-AUTH) with
    // transparent useCaseNote fallback when the table doesn't exist yet.
    const existingCreds = await listWebAuthnCredentials(session.user.id);

    const excludeCredentials = existingCreds.map((c) => ({
      id: c.credentialId,
      type: "public-key" as const,
    }));

    storeWebAuthnChallenge(challengeId, session.user.email || "", challenge, "registration", session.user.id);

    return NextResponse.json({
      challengeId,
      challenge,
      rpId,
      rpName,
      userId,
      userName: session.user.email || "",
      userDisplayName: session.user.name || session.user.email || "",
      excludeCredentials,
    });
  }

  // ─── Step 2: Store the credential ────────────────────────────
  const { challengeId, credentialId, publicKey, transports, deviceType } = body;

  if (!challengeId || !credentialId || !publicKey) {
    return NextResponse.json({ error: "Missing credential fields" }, { status: 400 });
  }

  // Consume the challenge (one-time use)
  const { consumeWebAuthnChallenge } = await import("@/lib/auth/zkp-passkeys");
  const challengeEntry = consumeWebAuthnChallenge(challengeId);
  if (!challengeEntry) {
    return NextResponse.json({ error: "Challenge expired or invalid" }, { status: 401 });
  }

  // Persist the credential — dedicated table with useCaseNote fallback
  await createWebAuthnCredential({
    userId: session.user.id,
    credentialId,
    publicKey,
    transports: Array.isArray(transports) ? transports : [],
    deviceType: deviceType || "Unknown",
  });

  return NextResponse.json({
    ok: true,
    message: "Passkey registered. You can now sign in with your biometric.",
    credentialId,
  });
}
