import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { findZKPVerifier } from "@/lib/auth/credential-store";
import { consumeChallenge, verifySignature } from "@/lib/crypto/zkp/protocol";
import { logAudit, extractIp, extractUserAgent } from "@/lib/harchiq/audit-log";
import { logInfo, logError } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ═══════════════════════════════════════════════════════════════
//  POST /api/auth/zkp-verify
//
//  Body: { email, challengeId, signature (base64) }
//
//  Verifies the signature against the stored public key. If valid,
//  the user is authenticated. The password was NEVER on the network.
//
//  NEMESIS defense: the payload contains ONLY { email, challengeId,
//  signature }. No password, no hash, no secret. The signature is
//  a cryptographic proof that the client possesses the private key
//  (derived from the password) — without revealing the key itself.
// ═══════════════════════════════════════════════════════════════

const Schema = z.object({
  email: z.string().email().max(255),
  challengeId: z.string().min(1).max(100),
  signature: z.string().min(1).max(500),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { email, challengeId, signature } = parsed.data;

  // 1. Consume the challenge (one-time use)
  const challengeEntry = consumeChallenge(challengeId);
  if (!challengeEntry) {
    await logAudit({
      userId: null,
      action: "login_failed",
      resource: `zkp:${email}`,
      result: "denied",
      ipAddress: extractIp(req),
      userAgent: extractUserAgent(req),
      metadata: { reason: "challenge_expired_or_invalid", challengeId },
    });
    return NextResponse.json(
      { error: "Challenge expired or invalid" },
      { status: 401 },
    );
  }

  // 2. Verify the email matches the challenge
  if (challengeEntry.email !== email) {
    await logAudit({
      userId: null,
      action: "login_failed",
      resource: `zkp:${email}`,
      result: "denied",
      ipAddress: extractIp(req),
      userAgent: extractUserAgent(req),
      metadata: { reason: "email_mismatch" },
    });
    return NextResponse.json(
      { error: "Email does not match the challenge" },
      { status: 401 },
    );
  }

  // 3. Fetch the user (we only need identity fields — the ZKP
  //    verifier is loaded separately via the credential store).
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true, accountType: true, status: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  // Load the ZKP verifier — dedicated ZKPVerifier table (Task REAL-AUTH)
  // with transparent useCaseNote fallback when the table doesn't exist.
  const verifier = await findZKPVerifier(user.id);

  if (!verifier) {
    return NextResponse.json(
      { error: "ZKP not registered" },
      { status: 400 },
    );
  }

  // 4. Verify the signature
  const isValid = await verifySignature(
    verifier.publicKey,
    signature,
    challengeEntry.challenge,
  ).catch((err) => {
    logError("zkp-verify", `Signature verification error: ${err}`);
    return false;
  });

  if (!isValid) {
    await logAudit({
      userId: user.id,
      action: "login_failed",
      resource: `zkp:${email}`,
      result: "denied",
      ipAddress: extractIp(req),
      userAgent: extractUserAgent(req),
      metadata: { reason: "invalid_signature" },
    });
    return NextResponse.json(
      { error: "Invalid signature — authentication failed" },
      { status: 401 },
    );
  }

  // 5. Check account status
  if (user.status === "suspended") {
    return NextResponse.json(
      { error: "Account suspended" },
      { status: 403 },
    );
  }

  // 6. SUCCESS — the client proved they know the password without
  //    ever transmitting it. Issue a session (NextAuth signIn).
  //    For this ZKP flow, we return a session token directly.
  await logAudit({
    userId: user.id,
    action: "login",
    resource: `zkp:${email}`,
    result: "success",
    ipAddress: extractIp(req),
    userAgent: extractUserAgent(req),
    metadata: { method: "zkp", challengeId },
  });

  logInfo("zkp-verify", `ZKP login successful for ${email} — password never transmitted`);

  // Return user info (the client will use this to set up a NextAuth session
  // via a separate callback, or we issue a JWT directly here)
  return NextResponse.json({
    ok: true,
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      accountType: user.accountType,
    },
    message: "ZKP authentication successful — password never touched the network",
  });
}
