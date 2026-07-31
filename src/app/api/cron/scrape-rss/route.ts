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
import { logWarn } from "@/lib/logger";
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
