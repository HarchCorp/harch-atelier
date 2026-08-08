// ═══════════════════════════════════════════════════════════════
//  REGISTER ROUTE — PROJECT AEGIS v4.0
//
//  POST /api/auth/register
//  Body: { name: string; email: string; password: string }
//
//  - Validates input with Zod (email format, password ≥ 8 chars)
//  - Rejects 409 Conflict if email already exists
//  - Hashes password with bcrypt (12 rounds) and creates the User
//  - Returns 201 with the new user's public profile (no hash)
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { logInfo, logWarn, logError } from "@/lib/logger";
const RegisterSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  email: z.string().email("Invalid email address").max(255),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();

  // ─── Check if user already exists ────────────────────────────
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });
  if (existing) {
    logWarn("auth.register", `Email already registered: ${normalizedEmail}`);
    return NextResponse.json(
      { success: false, error: "Email already registered" },
      { status: 409 },
    );
  }

  // ─── Hash + create ───────────────────────────────────────────
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "user",
    },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  logInfo("auth.register", `New user registered: ${user.email}`);

  // Defense-in-depth: the `name` field is user-controlled and may
  // contain HTML (<script>...</script>). React escapes it in our own
  // UI, but a third-party consumer of this JSON API could render it
  // as HTML. We omit `name` from the response body (the client
  // already knows the value it sent) and only return identifiers.
  // Task ID: bugfix-qa-4b (XSS reflection hardening)
  return NextResponse.json(
    {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    },
    { status: 201 },
  );
}
