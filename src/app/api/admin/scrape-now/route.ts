// ═══════════════════════════════════════════════════════════════
//  POST /api/admin/scrape-now
//
//  Admin-only endpoint that triggers an immediate RSS scrape run
//  across all 10 Moroccan media feeds. Used by the "Scrape now"
//  button in the admin Data Sources panel.
//
//  Auth: admin session (NOT CRON_SECRET — admin uses session cookie).
//
//  Returns the same ScrapeSummary shape as /api/cron/scrape-rss so
//  the admin UI can render per-feed results inline.
//
//  Task ID: real-rss-scrapers
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { logInfo, logError } from "@/lib/logger";
import { runRssScrape } from "@/lib/scrapers/run-scrape";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Allow up to 5 min — the scrape itself caps each feed at 15s and
// runs all 10 in parallel, so 5 min is generous headroom for slow
// networks.
export const maxDuration = 300;

export async function POST() {
  // 1. AUTH — admin only
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json(
      { success: false, error: "Forbidden — admin only" },
      { status: 403 },
    );
  }

  logInfo("admin.scrape-now", `Manual scrape triggered by ${session.user?.email || "(unknown)"}`);

  try {
    const summary = await runRssScrape();
    return NextResponse.json({ success: true, ...summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logError("admin.scrape-now", `Manual scrape failed: ${message}`);
    return NextResponse.json(
      { success: false, error: "Scrape failed", detail: message },
      { status: 500 },
    );
  }
}
