import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// ═══════════════════════════════════════════════════════════════
//  GET /api/auth/invite-info?token=XXX
//
//  Returns public info about an invitation (for the set-password page
//  to display "You've been invited by X" without requiring auth).
// ═══════════════════════════════════════════════════════════════

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token || token.length > 200) {
    return NextResponse.json({ valid: false, error: "Invalid token" }, { status: 400 });
  }

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { createdBy: { select: { name: true, email: true } } },
  });

  if (!invitation) {
    return NextResponse.json({ valid: false, error: "Token not found" }, { status: 404 });
  }

  if (invitation.usedAt) {
    return NextResponse.json({ valid: false, error: "Already used" }, { status: 410 });
  }

  if (invitation.expiresAt < new Date()) {
    return NextResponse.json({ valid: false, error: "Expired" }, { status: 410 });
  }

  return NextResponse.json({
    valid: true,
    email: invitation.email,
    name: invitation.name,
    accountType: invitation.accountType,
    role: invitation.role,
    company: invitation.company,
    message: invitation.message,
    invitedBy: invitation.createdBy?.name || "Harch Atelier Team",
    expiresAt: invitation.expiresAt.toISOString(),
  });
}
