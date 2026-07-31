// ═══════════════════════════════════════════════════════════════
//  GET /api/cron/generate-briefings
//
//  Daily cron — runs at 07:00 UTC (matches the vercel.json schedule).
//  For every active user (any accountType) generates the morning
//  HarchIQ briefing, persists it as a Briefing row keyed by
//  (userId, today's YYYY-MM-DD in Africa/Casablanca), so the user
//  sees an instant cached briefing the first time they open the
//  Console.
//
//  Auth: `Authorization: Bearer ${CRON_SECRET}` (timing-safe compare).
//
//  Idempotent: re-running for the same day upserts the cached
//  briefing instead of duplicating it.
//
//  Add to vercel.json:
//    { "path": "/api/cron/generate-briefings", "schedule": "0 7 * * *" }
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authorizeCron } from "@/lib/auth/cron";
import {
  generateBriefing,
  persistBriefing,
  briefingDateKey,
  getPrimaryCompanyForUser,
} from "@/lib/harchiq/briefing";
import { logInfo, logError } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60; // batches up to ~50 users sequentially

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}

async function handle(req: NextRequest) {
  // 1. CRON_SECRET auth.
  if (!authorizeCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();
  const dateKey = briefingDateKey(); // today in Casablanca tz
  const results = {
    date: dateKey,
    usersProcessed: 0,
    briefingsCreated: 0,
    briefingsUpdated: 0,
    skipped: 0,
    errors: [] as string[],
  };

  logInfo("cron.generate-briefings", `start date=${dateKey}`);

  try {
    // 2. Active users — every accountType (traders also get a daily
    //    briefing based on the primary Company's intel).
    const users = await prisma.user.findMany({
      where: { role: { not: "admin" } },
      select: { id: true, email: true, name: true, accountType: true },
    });

    for (const user of users) {
      results.usersProcessed++;
      try {
        const company = await getPrimaryCompanyForUser({
          id: user.id,
          accountType: user.accountType ?? "brand-monitor",
        });
        if (!company) {
          results.skipped++;
          continue;
        }

        // Check if we already have a "ready" briefing for today.
        const existing = await prisma.briefing.findUnique({
          where: { userId_date: { userId: user.id, date: dateKey } },
          select: { id: true, status: true },
        });
        if (existing && existing.status === "ready") {
          results.skipped++;
          continue;
        }

        // 3. Generate the briefing via the LLM (or heuristic fallback).
        const payload = await generateBriefing({
          userId: user.id,
          companyId: company.id,
          companyName: company.name,
          dateKey,
        });

        // 4. Persist (upsert on [userId, date]).
        await persistBriefing(user.id, company.id, dateKey, payload);
        if (existing) {
          results.briefingsUpdated++;
        } else {
          results.briefingsCreated++;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        results.errors.push(`user ${user.email}: ${msg}`);
        logError("cron.generate-briefings", `user ${user.email} failed: ${msg}`);

        // Persist a failed-status row so the console can show why.
        try {
          await prisma.briefing.upsert({
            where: { userId_date: { userId: user.id, date: dateKey } },
            create: {
              userId: user.id,
              date: dateKey,
              title: `Daily Intelligence Briefing — ${dateKey}`,
              summary: "Briefing generation failed.",
              sections: { error: msg } as object,
              status: "failed",
              error: msg,
              alertCount: 0,
              citedCount: 0,
            },
            update: {
              status: "failed",
              error: msg,
              summary: "Briefing generation failed.",
              sections: { error: msg } as object,
            },
          });
        } catch {
          /* swallow — the failure log is enough */
        }
      }
    }

    const durationMs = Date.now() - startedAt;
    logInfo("cron.generate-briefings", `complete in ${durationMs}ms`, results);

    return NextResponse.json({
      status: "ok",
      durationMs,
      ...results,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError("cron.generate-briefings", `fatal: ${msg}`);
    return NextResponse.json(
      { status: "error", error: msg, ...results },
      { status: 500 },
    );
  }
}
