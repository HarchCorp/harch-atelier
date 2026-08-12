import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { store } from "@/lib/data-store";

export const dynamic = "force-dynamic";

/** Intelligence API — exposes agent-scraped data to the dashboard. */
export async function GET(req: NextRequest) {
  // Auth: any logged-in atelier user. The data is consumed by
  // /atelier/dashboard (session-protected) — anonymous access closed
  // per AUDIT-API-ROUTES P0-3 (data-store.ts exposes scraped mentions
  // + alerts + scores + agent heartbeat, never public).
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  const brand = req.nextUrl.searchParams.get("brand") ?? undefined;
  return NextResponse.json({
    mentions: store.getMentions(brand).slice(0, 50),
    alerts: store.getAlerts(brand),
    scores: store.getScores(),
    agents: store.getStatus(),
    totalMentions: store.getMentions().length,
    fetchedAt: new Date().toISOString(),
  });
}
