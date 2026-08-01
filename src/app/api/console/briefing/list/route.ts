// ═══════════════════════════════════════════════════════════════
//  GET /api/console/briefing/list
//
//  Returns the calling user's past briefings (newest first), with
//  optional date-range filtering. Used by the BriefingArchive UI.
//
//  Query params:
//    • from=YYYY-MM-DD (inclusive) — optional
//    • to=YYYY-MM-DD   (inclusive) — optional
//    • q=<text>        — full-text search on title/summary — optional
//    • limit=<int>     — default 60, max 365
//
//  Auth: requires session. Returns only the calling user's briefings
//  (admins can pass ?userId=<id> to list another user's briefings).
//
//  Task: dataminr-briefings-compliance
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface BriefingListRow {
  id: string;
  date: string;
  title: string;
  summary: string;
  status: string;
  model: string | null;
  alertCount: number;
  citedCount: number;
  confidence: number | null;
  topThreatCount: number;
  topOpportunityCount: number;
  createdAt: string;
  updatedAt: string;
  companyName: string | null;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const isAdmin = session.user.role === "admin";

  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const q = url.searchParams.get("q")?.trim();
  const limitParam = url.searchParams.get("limit");
  const limit = Math.min(365, Math.max(1, parseInt(limitParam ?? "60", 10) || 60));
  const targetUserId = url.searchParams.get("userId");

  // Admins can list another user's briefings; everyone else is
  // restricted to their own.
  const filterUserId = targetUserId && isAdmin ? targetUserId : userId;

  // Build the where clause.
  const where: {
    userId: string;
    date?: { gte?: string; lte?: string };
    OR?: Array<{ title?: { contains: string }; summary?: { contains: string } }>;
  } = { userId: filterUserId };
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = from;
    if (to) where.date.lte = to;
  }
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { summary: { contains: q } },
    ];
  }

  try {
    const rows = await prisma.briefing.findMany({
      where,
      orderBy: { date: "desc" },
      take: limit,
      select: {
        id: true,
        date: true,
        title: true,
        summary: true,
        status: true,
        model: true,
        alertCount: true,
        citedCount: true,
        sections: true,
        createdAt: true,
        updatedAt: true,
        company: { select: { name: true } },
      },
    });

    const out: BriefingListRow[] = rows.map((r) => {
      // Read confidence + cited-item counts from the sections JSON.
      let confidence: number | null = null;
      let topThreatCount = 0;
      let topOpportunityCount = 0;
      try {
        const sections = r.sections as Record<string, unknown> | null;
        if (sections) {
          if (typeof sections.confidence === "number") {
            confidence = sections.confidence as number;
          }
          if (Array.isArray(sections.topThreats)) {
            topThreatCount = (sections.topThreats as unknown[]).length;
          }
          if (Array.isArray(sections.topOpportunities)) {
            topOpportunityCount = (sections.topOpportunities as unknown[]).length;
          }
        }
      } catch {
        // sections might be a non-object on failed briefings — ignore.
      }
      return {
        id: r.id,
        date: r.date,
        title: r.title,
        summary: r.summary,
        status: r.status,
        model: r.model,
        alertCount: r.alertCount,
        citedCount: r.citedCount,
        confidence,
        topThreatCount,
        topOpportunityCount,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        companyName: r.company?.name ?? null,
      };
    });

    return NextResponse.json({
      briefings: out,
      total: out.length,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
