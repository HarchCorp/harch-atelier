import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════════
//  POST /api/access-request
//
//  Public route — anyone can submit an access request.
//  Admin reviews and creates invitations from these requests.
//
//  Body: { email, name, company?, role?, message? }
// ═══════════════════════════════════════════════════════════════

const Schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  company: z.string().max(200).optional(),
  role: z.string().max(100).optional(),
  message: z.string().max(2000).optional(),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = Schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { email, name, company, role, message } = parsed.data;

    // Check if email already has a pending request
    const existing = await prisma.accessRequest.findFirst({
      where: { email, status: "pending" },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You already have a pending request. We'll get back to you soon." },
        { status: 409 }
      );
    }

    // Check if email already has an account
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account already exists with this email. Please contact us if you've lost access." },
        { status: 409 }
      );
    }

    const request = await prisma.accessRequest.create({
      data: { email, name, company, role, message },
    });

    return NextResponse.json({
      status: "submitted",
      id: request.id,
      message: "Your request has been received. The Harch Atelier team will review it and send you an access link if approved.",
    });
  } catch (err) {
    console.error("Access request error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Request failed" },
      { status: 500 }
    );
  }
}
