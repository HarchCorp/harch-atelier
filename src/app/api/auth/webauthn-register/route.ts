import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import {
  generateWebAuthnChallenge,
  bufToBase64Url,
  getRpId,
  storeWebAuthnChallenge,
} from "@/lib/auth/zkp-passkeys";

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
    const existingCreds = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { useCaseNote: true },
    });

    let excludeCredentials: { id: string; type: "public-key" }[] = [];
    if (existingCreds?.useCaseNote) {
      try {
        const parsed = JSON.parse(existingCreds.useCaseNote);
        if (parsed.webauthnCredentials && Array.isArray(parsed.webauthnCredentials)) {
          excludeCredentials = parsed.webauthnCredentials.map((c: { id: string }) => ({
            id: c.id,
            type: "public-key" as const,
          }));
        }
      } catch {}
    }

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

  // Fetch current user to append the credential
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { useCaseNote: true },
  });

  let existingData: Record<string, unknown> = {};
  if (user?.useCaseNote) {
    try { existingData = JSON.parse(user.useCaseNote); } catch {}
  }

  const credentials = Array.isArray(existingData.webauthnCredentials)
    ? existingData.webauthnCredentials
    : [];

  credentials.push({
    id: credentialId,
    publicKey,
    counter: 0,
    transports: transports || [],
    deviceType: deviceType || "Unknown",
    createdAt: new Date().toISOString(),
  });

  existingData.webauthnCredentials = credentials;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { useCaseNote: JSON.stringify(existingData) },
  });

  return NextResponse.json({
    ok: true,
    message: "Passkey registered. You can now sign in with your biometric.",
    credentialId,
  });
}
