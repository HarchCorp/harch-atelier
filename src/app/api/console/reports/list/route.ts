// ═══════════════════════════════════════════════════════════════
//  GET /api/console/reports/list
//
//  Returns the stored monthly Report records for the calling user,
//  newest first. Admins see all reports.
//
//  Auth: requires session. Allowed accountTypes: brand-monitor,
//  market-competitor, investment-bank (harch-alpha traders don't
//  get monthly reputation reports).
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user?.id;
  const isAdmin = session.user?.role === "admin";
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowedTypes = ["brand-monitor", "market-competitor", "investment-bank"];
  if (!allowedTypes.includes(session.user?.accountType || "") && !isAdmin) {
    return NextResponse.json(
      { error: "Forbidden — monthly reports are only available on enterprise plans." },
      { status: 403 }
    );
  }

  try {
    const reports = await prisma.report.findMany({
      where: isAdmin ? undefined : { userId },
      orderBy: { period: "desc" },
      take: 24, // last 2 years max
      select: {
        id: true,
        title: true,
        period: true,
        summary: true,
        status: true,
        createdAt: true,
        company: { select: { name: true, slug: true } },
      },
    });

    return NextResponse.json({
      reports: reports.map((r) => ({
        id: r.id,
        title: r.title,
        period: r.period,
        summary: r.summary,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
        companyName: r.company?.name ?? null,
        pdfUrl: `/api/console/reports/${r.id}/pdf`,
      })),
      total: reports.length,
    });
  } catch (err) {
    console.error("[reports.list] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
