import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logInfo, logError } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ═══════════════════════════════════════════════════════════════
//  GET /api/harch100/latest
//
//  Public endpoint: returns the most recently published Harch 100
//  snapshot. Consumed by the public /atelier/harch-100 page and
//  any external reader that wants the current monthly ranking.
//
//  A snapshot is "published" when its publishedAt field is non-null.
//  We order by publishedAt desc and return the top row.
//
//  Auth: none — this is intentionally public.
// ═══════════════════════════════════════════════════════════════

export async function GET() {
  try {
    const snapshot = await prisma.harch100Snapshot.findFirst({
      where: { publishedAt: { not: null } },
      orderBy: { publishedAt: "desc" },
    });

    if (!snapshot) {
      logInfo("harch100", "latest: no published snapshot found");
      return NextResponse.json(
        { ok: false, published: false, message: "No published snapshot yet" },
        { status: 404 },
      );
    }

    logInfo("harch100", `latest: returning snapshot period=${snapshot.period} id=${snapshot.id}`);

    return NextResponse.json({
      ok: true,
      published: true,
      snapshot: {
        id: snapshot.id,
        period: snapshot.period,
        rankings: snapshot.rankings,
        generatedAt: snapshot.generatedAt.toISOString(),
        publishedAt: snapshot.publishedAt?.toISOString() ?? null,
      },
    });
  } catch (err) {
    logError("harch100", `latest error: ${err}`);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch latest snapshot", detail: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
