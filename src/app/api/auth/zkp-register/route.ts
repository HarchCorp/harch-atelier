import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { upsertZKPVerifier } from "@/lib/auth/credential-store";
import { logAudit, extractIp, extractUserAgent } from "@/lib/harchiq/audit-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ═══════════════════════════════════════════════════════════════
//  POST /api/auth/zkp-register
//
//  Body: { email, publicKey (JWK), salt (base64), iterations }
//
//  Stores the public key (verifier) + salt on the user's record.
//  The password was NEVER transmitted — the client derived the
//  keypair locally and sends only the public key.
//
//  NEMESIS defense: inspect the payload — you'll find NO password,
//  NO hash, NO bcrypt digest. Only a JWK public key + salt + iterations.
// ═══════════════════════════════════════════════════════════════

const Schema = z.object({
  email: z.string().email().max(255),
  publicKey: z.object({
    kty: z.string(),
    crv: z.string(),
    x: z.string(),
    y: z.string(),
    ext: z.boolean().optional(),
  }),
  salt: z.string().min(20).max(100),
  iterations: z.number().min(10000).max(1000000),
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

  const { email, publicKey, salt, iterations } = parsed.data;

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    return NextResponse.json(
      { error: "Account not found. An admin must create your account first." },
      { status: 404 },
    );
  }

  // Store the ZKP verifier (public key + salt + iterations) — dedicated
  // ZKPVerifier table (Task REAL-AUTH) with transparent useCaseNote
  // fallback when the table doesn't exist yet on the DB.
  await upsertZKPVerifier({
    userId: existing.id,
    publicKey: publicKey as JsonWebKey,
    salt,
    iterations,
  });

  await logAudit({
    userId: existing.id,
    action: "login",
    resource: `zkp:register:${email}`,
    result: "success",
    ipAddress: extractIp(req),
    userAgent: extractUserAgent(req),
    metadata: { iterations, saltPrefix: salt.slice(0, 8) },
  });

  return NextResponse.json({
    ok: true,
    message: "ZKP verifier registered. The server never received your password.",
  });
}
