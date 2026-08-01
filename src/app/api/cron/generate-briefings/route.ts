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
  type BriefingPayload,
  type BriefingCitedItem,
} from "@/lib/harchiq/briefing";
import { sendWhatsAppMessage } from "@/lib/whatsapp/twilio";
import { dispatchEvent } from "@/lib/harchiq/webhook-dispatcher";
import { logInfo, logError } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60; // batches up to ~50 users sequentially

// ─── WhatsApp formatter (mirrors /api/console/briefing/deliver) ──
//
//  Kept inline (not imported) so the cron stays self-contained —
//  the route handler version lives in the API route and can drift
//  independently for ad-hoc re-deliveries.

function formatBriefingWhatsApp(payload: BriefingPayload, companyName: string): string {
  const lines: string[] = [];
  lines.push("HarchIQ Daily Briefing");
  lines.push("");
  lines.push(`${companyName} — ${payload.metadata.dateKey}`);
  lines.push("");
  lines.push("EXECUTIVE SUMMARY");
  const summary = payload.executiveSummary.length > 400
    ? payload.executiveSummary.slice(0, 397) + "..."
    : payload.executiveSummary;
  lines.push(summary);
  lines.push("");
  if (payload.timelineContext) {
    lines.push("TIMELINE");
    lines.push(payload.timelineContext);
    lines.push("");
  }
  if (payload.competitiveBenchmark) {
    lines.push("BENCHMARK");
    lines.push(payload.competitiveBenchmark);
    lines.push("");
  }
  if (payload.topThreats.length > 0) {
    lines.push("TOP THREATS");
    payload.topThreats.forEach((t: BriefingCitedItem, i: number) => {
      lines.push(`${i + 1}. ${t.title} [${t.severity.toUpperCase()}]`);
      lines.push(`   ${t.source}`);
    });
    lines.push("");
  }
  if (payload.recommendedActions.length > 0) {
    lines.push("ACTIONS");
    payload.recommendedActions.slice(0, 3).forEach((a, i) => {
      const owner = a.owner ? ` [${a.owner}]` : "";
      lines.push(`${i + 1}. ${a.text}${owner}`);
    });
    lines.push("");
  }
  lines.push(`Confidence: ${Math.round(payload.confidence * 100)}%`);
  lines.push("View: https://atelier.harchcorp.com/atelier/console");
  return lines.join("\n");
}

// ─── Deliver a generated briefing through every channel the user
//  has enabled. Called by the cron after each successful generation.
//  Best-effort: failures are logged but never bubble up — one
//  user's broken WhatsApp number must not block the next user's
//  briefing.

async function deliverBriefing(
  userId: string,
  companyId: string,
  companyName: string,
  payload: BriefingPayload,
): Promise<{ whatsapp: string; inApp: string; webhook: string }> {
  const out = { whatsapp: "skipped", inApp: "skipped", webhook: "skipped" };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      whatsappNumber: true,
      whatsappAlerts: true,
      isDemo: true,
    },
  });
  if (!user) return out;

  // 1. WhatsApp — only if the user opted in AND has a number.
  if (user.whatsappAlerts && user.whatsappNumber) {
    try {
      const msg = formatBriefingWhatsApp(payload, companyName);
      const res = await sendWhatsAppMessage(user.whatsappNumber, msg);
      out.whatsapp = res.sent ? "sent" : `failed:${res.reason ?? "unknown"}`;
    } catch (err) {
      out.whatsapp = `failed:${err instanceof Error ? err.message : String(err)}`;
    }
  }

  // 2. In-app notification — always create a row so the console
  //    bell badge + Briefing Archive pick it up.
  try {
    await prisma.notification.create({
      data: {
        userId,
        type: "alert",
        title: `HarchIQ Daily Briefing — ${payload.metadata.dateKey}`,
        body: payload.executiveSummary.slice(0, 280),
        severity:
          payload.topThreats.some((t) => t.severity === "critical")
            ? "critical"
            : payload.topThreats.some((t) => t.severity === "high")
              ? "warning"
              : "info",
        read: false,
        link: "/atelier/console",
        isDemo: user.isDemo,
      },
    });
    out.inApp = "sent";
  } catch (err) {
    out.inApp = `failed:${err instanceof Error ? err.message : String(err)}`;
  }

  // 3. Webhook fan-out — `briefing.ready` event.
  try {
    const results = await dispatchEvent({
      companyId,
      event: "briefing.ready",
      payload: {
        date: payload.metadata.dateKey,
        companyName,
        confidence: payload.confidence,
        alertCount: payload.metadata.alertCount,
        citedCount: payload.metadata.citedCount,
        executiveSummary: payload.executiveSummary,
        topThreats: payload.topThreats.map((t) => ({
          title: t.title,
          severity: t.severity,
          source: t.source,
          alertId: t.alertId,
        })),
        recommendedActions: payload.recommendedActions,
        briefingUrl: "/atelier/console",
      },
    });
    out.webhook = `sent:${results.length}`;
  } catch (err) {
    out.webhook = `failed:${err instanceof Error ? err.message : String(err)}`;
  }

  return out;
}

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
    deliveries: {
      whatsappSent: 0,
      whatsappSkipped: 0,
      inAppSent: 0,
      webhookSent: 0,
    },
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
          select: { id: true, status: true, sections: true },
        });
        if (existing && existing.status === "ready") {
          // Briefing already cached — still re-deliver so the user gets
          // their WhatsApp push + in-app notification at 07:00 even if
          // they regenerated manually the night before.
          results.skipped++;
          try {
            const payload = existing.sections as unknown as BriefingPayload;
            if (payload && payload.executiveSummary) {
              const delivery = await deliverBriefing(user.id, company.id, company.name, payload);
              if (delivery.whatsapp === "sent") results.deliveries.whatsappSent++;
              else if (delivery.whatsapp.startsWith("skipped")) results.deliveries.whatsappSkipped++;
              if (delivery.inApp === "sent") results.deliveries.inAppSent++;
              if (delivery.webhook.startsWith("sent")) results.deliveries.webhookSent++;
            }
          } catch (err) {
            results.errors.push(`user ${user.email} delivery (cached): ${err instanceof Error ? err.message : String(err)}`);
          }
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

        // 5. Deliver — WhatsApp + in-app + webhook (best-effort).
        const delivery = await deliverBriefing(user.id, company.id, company.name, payload);
        if (delivery.whatsapp === "sent") results.deliveries.whatsappSent++;
        else if (delivery.whatsapp.startsWith("skipped")) results.deliveries.whatsappSkipped++;
        if (delivery.inApp === "sent") results.deliveries.inAppSent++;
        if (delivery.webhook.startsWith("sent")) results.deliveries.webhookSent++;
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
