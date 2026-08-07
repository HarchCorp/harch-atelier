import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { generateChallenge, storeChallenge } from "@/lib/crypto/zkp/protocol";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ═══════════════════════════════════════════════════════════════
//  POST /api/auth/zkp-challenge
//
//  Body: { email }
//  Returns: { challengeId, challenge (base64), salt, iterations, expiresAt }
//
//  The server issues a random challenge nonce. The client must sign
//  it with the private key (re-derived from the password) and send
//  the signature to /api/auth/zkp-verify.
//
//  NEMESIS defense: the challenge is random 32 bytes. The salt +
//  iterations are returned so the client can re-derive the keypair.
//  NO password or hash is in the payload — just a nonce.
// ═══════════════════════════════════════════════════════════════

const Schema = z.object({
  email: z.string().email().max(255),
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
      { error: "Invalid email" },
      { status: 400 },
    );
  }

  const { email } = parsed.data;

  // Find the user + their ZKP verifier
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, useCaseNote: true },
  });

  if (!user || !user.useCaseNote) {
    // Don't reveal whether the email exists (anti-enumeration)
    // Return a dummy challenge so the timing is the same
    const dummyChallenge = generateChallenge();
    const challengeId = `ch_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    return NextResponse.json({
      challengeId,
      challenge: dummyChallenge,
      salt: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=", // dummy
      iterations: 150000,
      expiresAt: new Date(Date.now() + 60000).toISOString(),
    });
  }

  // Parse the ZKP verifier from useCaseNote
  let verifier: { publicKey: JsonWebKey; salt: string; iterations: number } | null = null;
  try {
    const parsed = JSON.parse(user.useCaseNote);
    verifier = parsed.zkpVerifier;
  } catch {}

  if (!verifier) {
    return NextResponse.json(
      { error: "ZKP not registered for this account" },
      { status: 400 },
    );
  }

  // Generate a challenge
  const challenge = generateChallenge();
  const challengeId = `ch_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  // Store the challenge (in-memory, 60s TTL, one-time use)
  storeChallenge(challengeId, email, challenge);

  return NextResponse.json({
    challengeId,
    challenge,
    salt: verifier.salt,
    iterations: verifier.iterations,
    expiresAt: new Date(Date.now() + 60000).toISOString(),
  });
}
