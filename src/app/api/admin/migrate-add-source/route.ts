// ═══════════════════════════════════════════════════════════════
//  ONE-TIME MIGRATION: Add 'source' column to AccessRequest
//
//  URL: /api/admin/migrate-add-source
//  Auth: super_admin only
//
//  Adds the `source` column to the AccessRequest table that was
//  introduced in the schema but never migrated to the production
//  PostgreSQL database.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden — super_admin only" }, { status: 403 });
  }

  try {
    // Check if column already exists
    const columns = await prisma.$queryRaw`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'AccessRequest' AND column_name = 'source'
    ` as Array<{ column_name: string }>;

    if (columns.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Column 'source' already exists — no migration needed",
        alreadyExists: true,
      });
    }

    // Add the column
    await prisma.$executeRaw`
      ALTER TABLE "AccessRequest" ADD COLUMN "source" TEXT DEFAULT 'contact-page'
    `;

    return NextResponse.json({
      success: true,
      message: "Column 'source' added to AccessRequest table",
      migrated: true,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Migration failed", detail: message },
      { status: 500 }
    );
  }
}
