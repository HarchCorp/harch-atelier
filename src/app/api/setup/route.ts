import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (!token || token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    // Ensure the plan column exists (schema might not be synced)
    await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "plan" TEXT NOT NULL DEFAULT 'free'`;

    // Check if admin already exists
    const existing = await prisma.$queryRaw`SELECT id, email FROM "User" WHERE email = ${'admin@harchcorp.com'}` as any[];
    if (existing.length > 0) {
      // Update password hash to ensure it's correct
      const passwordHash = await bcrypt.hash("HarchCorp2026!", 12);
      await prisma.$executeRaw`UPDATE "User" SET "passwordHash" = ${passwordHash}, role = ${'admin'} WHERE email = ${'admin@harchcorp.com'}`;
      return NextResponse.json({ status: "updated", email: "admin@harchcorp.com" });
    }

    // Create admin user
    const passwordHash = await bcrypt.hash("HarchCorp2026!", 12);
    const id = `user-${Date.now()}`;
    await prisma.$executeRaw`INSERT INTO "User" (id, email, name, "passwordHash", role, plan, "createdAt", "updatedAt") VALUES (${id}, ${'admin@harchcorp.com'}, ${'Harch Admin'}, ${passwordHash}, ${'admin'}, ${'admin'}, NOW(), NOW())`;
    return NextResponse.json({ status: "initialized", email: "admin@harchcorp.com" });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown" }, { status: 500 });
  }
}
