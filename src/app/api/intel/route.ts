import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/data-store";

export const dynamic = "force-dynamic";

/** Intelligence API — exposes agent-scraped data to the dashboard. */
export async function GET(req: NextRequest) {
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
