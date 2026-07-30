import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════════
//  /api/setup — Create the first admin user
//
//  This route is ONE-TIME use: it creates the first admin, then
//  refuses to run again (returns 409 Conflict if an admin exists).
//
//  Security:
//  - Protected by SETUP_TOKEN env var (you set it once, use it once)
//  - POST body: { token, email, name, password }
//  - After first admin is created, set SETUP_TOKEN to empty or remove
//    it from env to disable this route entirely
//
//  Usage (after DATABASE_URL is set + prisma db push done):
//    curl -X POST https://atelier.harchcorp.com/api/setup \
//      -H "Content-Type: application/json" \
//      -d '{"token":"YOUR_SETUP_TOKEN","email":"amine@harchcorp.com","name":"Amine Harch El Korane","password":"YOUR_PASSWORD"}'
// ═══════════════════════════════════════════════════════════════

const SetupSchema = z.object({
  token: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  password: z.string().min(8).max(100),
  accountType: z.enum(["brand-monitor", "market-competitor", "investment-bank", "harch-alpha"]).default("brand-monitor"),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SetupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { token, email, name, password, accountType } = parsed.data;

    // Verify SETUP_TOKEN
    const expectedToken = process.env.SETUP_TOKEN;
    if (!expectedToken) {
      return NextResponse.json(
        { error: "SETUP_TOKEN not configured. Set it in your env vars first." },
        { status: 503 }
      );
    }
    if (token !== expectedToken) {
      return NextResponse.json(
        { error: "Invalid setup token" },
        { status: 401 }
      );
    }

    // Check if any admin already exists (one-time use)
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "admin" },
    });
    if (existingAdmin) {
      return NextResponse.json(
        {
          error: "Setup already completed. An admin user exists.",
          adminEmail: existingAdmin.email,
        },
        { status: 409 }
      );
    }

    // Check if email is already taken
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

    // Create the admin
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: "admin",
        accountType,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        accountType: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      status: "created",
      user,
      message: "Admin user created. You can now sign in at /atelier/login. Remove SETUP_TOKEN from your env to disable this route.",
    });
  } catch (err) {
    console.error("Setup error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Setup failed" },
      { status: 500 }
    );
  }
}

// GET — returns setup status (no sensitive info)
export async function GET() {
  try {
    const adminCount = await prisma.user.count({
      where: { role: "admin" },
    });

    return NextResponse.json({
      setupRequired: adminCount === 0,
      adminExists: adminCount > 0,
      setupTokenConfigured: !!process.env.SETUP_TOKEN,
    });
  } catch (err) {
    return NextResponse.json(
      {
        setupRequired: true,
        error: err instanceof Error ? err.message : "DB not reachable",
      },
      { status: 500 }
    );
  }
}
