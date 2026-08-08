// ═══════════════════════════════════════════════════════════════
//  CRON — SCRAPE RSS — REAL MOROCCAN MEDIA PIPELINE
//
//  Triggered by Vercel Cron every 30 minutes (`*/30 * * * *`).
//  Pulls 10 real Moroccan media RSS feeds (Hespress, Le360, TelQuel,
//  Medias24, L'Economiste, Aujourdhui, MWN, Yabiladi, LesEco),
//  parses each one, dedupes by URL hash, runs the Darija NLP pipeline
//  (detectLanguage → analyzeSentiment → extractEntities) on the title
//  + description, matches against the Company table by name/alias,
//  and inserts new articles.
//
//  Auth: the `Authorization: Bearer ${CRON_SECRET}` header must match
//  the CRON_SECRET env var. Without it the route returns 401.
//
//  The actual scrape logic lives in `src/lib/scrapers/run-scrape.ts`
//  so it can be shared with `/api/admin/scrape-now` (the admin
//  "Scrape now" button — session-secured, no bearer needed).
//
//  Task ID: real-rss-scrapers
//  Route:   /api/cron/scrape-rss
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { authorizeCron } from "@/lib/auth/cron";
import { logWarn, logError } from "@/lib/logger";
import { runRssScrape } from "@/lib/scrapers/run-scrape";

export const dynamic = "force-dynamic";
// Vercel Cron routes are invoked server-side and should never be
// cached — every invocation must fetch fresh RSS.
export const revalidate = 0;

// Vercel function timeout — Vercel Hobby tier caps at 60s, Pro at 300s.
// Set to 300s; the scrape itself caps each feed at 15s so 10 feeds in
// parallel finish well under 60s in normal conditions.
export const maxDuration = 300;

export async function POST(req: Request) {
  // 1. AUTH — CRON_SECRET required
  if (!authorizeCron(req)) {
    logWarn("cron.scrape-rss", "Unauthorized cron invocation attempt");
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const summary = await runRssScrape();

    // ── Fan out new negative articles to the WS alert service ──
    // Task: dataminr-realtime-crisis — every scrape cycle pushes the
    // negative articles it just ingested to the WebSocket mini-service
    // (port 3003) so connected console clients see them in real-time,
    // not on the next 30-min refresh. Best-effort: a WS push failure
    // never masks a successful scrape.
    if (summary.articlesNew > 0) {
      try {
        const pushSecret =
          process.env.ALERT_PUSH_SECRET ??
          process.env.CRON_SECRET ??
          process.env.SETUP_TOKEN ??
          "";
        await fetch(`${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/console/alerts/push`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: pushSecret ? `Bearer ${pushSecret}` : "",
          },
          body: JSON.stringify({ sinceMinutes: 5 }),
          signal: AbortSignal.timeout(8000),
        });
      } catch (pushErr) {
        logWarn(
          "cron.scrape-rss",
          `WS push failed (non-fatal): ${(pushErr as Error).message}`,
        );
      }
    }

    return NextResponse.json({ success: true, ...summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: "Scrape failed", detail: message },
      { status: 500 },
    );
  }
}

// Vercel Cron sends GET requests by default for HTTP-triggered jobs
// when the `method` field is omitted. We accept both GET and POST.
export const GET = POST;
