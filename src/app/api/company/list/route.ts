import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";

// ═══════════════════════════════════════════════════════════════
//  GET /api/company/list
//
//  Returns a lightweight list of all companies (id + name + slug +
//  sector + iceNumber + rcNumber). Used by:
//    - Super-admin's "create invitation" modal to pick the company
//      to attach the new user to.
//    - Subsidiary picker (link an existing company as a subsidiary).
//
//  Auth: super-admin (role=admin) only. Company-admins use their
//  own /api/company/settings to see their hierarchy.
//
//  Task: company-dedup-enterprise-admin
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden — admin only" },
      { status: 403 },
    );
  }

  const url = new URL(req.url);
  const search = url.searchParams.get("search")?.trim();
  const limit = Math.min(
    100,
    Math.max(1, parseInt(url.searchParams.get("limit") || "50", 10)),
  );

  try {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { iceNumber: { contains: search, mode: "insensitive" as const } },
            { rcNumber: { contains: search, mode: "insensitive" as const } },
            { slug: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const companies = await prisma.company.findMany({
      where,
      orderBy: { name: "asc" },
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        sector: true,
        iceNumber: true,
        rcNumber: true,
        parentId: true,
        website: true,
      },
    });

    return NextResponse.json({ companies, total: companies.length });
  } catch (err) {
    console.error("[/api/company/list] error:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
