import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";

// ═══════════════════════════════════════════════════════════════
//  GET /api/investor/dossiers
//
//  Returns all due diligence dossiers for the logged-in investor.
//
//  Auth: requires session + accountType === "investor"
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Admin can access any API (to preview what investors see)
  if (session.user?.accountType !== "investment-bank" && session.user?.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden — investment-bank account required" },
      { status: 403 }
    );
  }

  try {
    const dossiers = await prisma.dossier.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        company: {
          select: {
            slug: true,
            name: true,
            sector: true,
          },
        },
      },
    });

    return NextResponse.json({ dossiers });
  } catch (err) {
    console.error("Investor dossiers error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
