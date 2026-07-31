// ═══════════════════════════════════════════════════════════════
//  HARCH ATELIER — WhatsApp Alerts Cron Endpoint
//
//  GET /api/cron/whatsapp-alerts
//
//  Called by Vercel Cron every 5 minutes. Secured by CRON_SECRET
//  (Authorization: Bearer <CRON_SECRET> — same pattern as
//  /api/cron/refresh).
//
//  Flow:
//    1. Verify CRON_SECRET.
//    2. Query negative Articles + high/critical RiskAssessments
//       from the last 15 minutes.
//    3. For each user with whatsappAlerts = true AND a valid
//       whatsappNumber, filter the alerts by their
//       alertSeverityThreshold and send each matching alert via
//       Twilio WhatsApp.
//    4. Return a JSON log of every send attempt (sent / failed /
//       skipped) so the operator can audit delivery from the
//       Vercel cron log.
//
//  Demo mode: when Twilio env vars are missing, the cron still runs
//  but every send returns { sent: false, reason: "TWILIO_NOT_CONFIGURED" }.
//  This lets the feature ship to staging without real credentials.
//
//  Resilience: a Twilio error on one recipient NEVER crashes the
//  route — `sendWhatsAppMessage` swallows errors and returns a
//  SendResult, so we keep iterating the remaining users.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  formatAlertMessage,
  isTwilioConfigured,
  sendWhatsAppMessage,
  severityMeetsThreshold,
  type AlertPayload,
  type Severity,
} from "@/lib/whatsapp/twilio";

export const dynamic = "force-dynamic";

// ─── Auth ──────────────────────────────────────────────────────────
function authorize(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${expected}`;
}

// ─── Severity derivation ───────────────────────────────────────────
//
// Articles don't have a `severity` column — we derive it from the
// sentiment score so users can pick a threshold (low/medium/high/
// critical) and the cron will only push alerts at or above it.
//
//   score <  -0.70   → critical
//   score <  -0.40   → high
//   score <  -0.15   → medium
//   score <=  0.00   → low      (mild negative)
//
// RiskAssessments carry their own riskLevel (high | critical).
function severityFromScore(score: number | null | undefined): Severity {
  if (score === null || score === undefined) return "medium";
  if (score < -0.7) return "critical";
  if (score < -0.4) return "high";
  if (score < -0.15) return "medium";
  return "low";
}

function severityFromRiskLevel(level: string): Severity {
  if (level === "critical") return "critical";
  if (level === "high") return "high";
  if (level === "medium") return "medium";
  return "low";
}

// ─── GET (the only method this cron uses) ──────────────────────────
export async function GET(req: NextRequest) {
  // Auth check — fail fast and quiet.
  if (!process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 },
    );
  }
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = new Date();
  const startTime = Date.now();
  const twilioReady = isTwilioConfigured();

  // ── 1. Collect alerts from the last 15 minutes ──────────────────
  //
  // We pull a wider window (15 min) than the cron interval (5 min)
  // so a single missed cron doesn't drop alerts. To avoid sending
  // duplicates on the next run we cap by publishedAt <= now and
  // dedupe per-user inside the loop using a Set of article IDs.
  const fifteenMinAgo = new Date(startedAt.getTime() - 15 * 60 * 1000);

  type RawAlert = {
    id: string;
    title: string;
    source: string;
    sentimentLabel: string | null;
    sentimentScore: number | null;
    detectedAt: Date | null;
    severity: Severity;
    kind: "article" | "risk";
  };

  let rawAlerts: RawAlert[] = [];

  try {
    const [articles, risks] = await Promise.all([
      prisma.article.findMany({
        where: {
          sentimentLabel: "negative",
          // Use scrapedAt as the freshness signal because publishedAt
          // can be null for some sources; scrapedAt is always set.
          scrapedAt: { gte: fifteenMinAgo },
        },
        orderBy: { scrapedAt: "desc" },
        take: 50,
        select: {
          id: true,
          title: true,
          source: true,
          sentimentLabel: true,
          sentimentScore: true,
          publishedAt: true,
          scrapedAt: true,
        },
      }),
      prisma.riskAssessment.findMany({
        where: {
          riskLevel: { in: ["high", "critical"] },
          assessedAt: { gte: fifteenMinAgo },
        },
        orderBy: { assessedAt: "desc" },
        take: 20,
        select: {
          id: true,
          category: true,
          riskLevel: true,
          riskScore: true,
          assessedAt: true,
        },
      }),
    ]);

    rawAlerts = [
      ...articles.map<RawAlert>((a) => ({
        id: a.id,
        title: a.title,
        source: a.source,
        sentimentLabel: a.sentimentLabel,
        sentimentScore: a.sentimentScore,
        detectedAt: a.publishedAt ?? a.scrapedAt,
        severity: severityFromScore(a.sentimentScore),
        kind: "article",
      })),
      ...risks.map<RawAlert>((r) => ({
        id: r.id,
        title: `${r.category} risk — ${r.riskLevel}`,
        source: "HarchIQ Risk Engine",
        sentimentLabel: null,
        sentimentScore: null,
        detectedAt: r.assessedAt,
        severity: severityFromRiskLevel(r.riskLevel),
        kind: "risk",
      })),
    ];
  } catch (err) {
    console.error("[whatsapp-alerts] failed to query alerts:", err);
    return NextResponse.json(
      {
        timestamp: startedAt.toISOString(),
        ok: false,
        error: err instanceof Error ? err.message : "query_failed",
      },
      { status: 500 },
    );
  }

  // ── 2. Load all users with WhatsApp alerts enabled ──────────────
  let users: Array<{
    id: string;
    name: string | null;
    whatsappNumber: string | null;
    alertSeverityThreshold: string;
  }> = [];

  try {
    users = await prisma.user.findMany({
      where: {
        whatsappAlerts: true,
        NOT: { whatsappNumber: null },
      },
      select: {
        id: true,
        name: true,
        whatsappNumber: true,
        alertSeverityThreshold: true,
      },
    });
  } catch (err) {
    console.error("[whatsapp-alerts] failed to query users:", err);
    return NextResponse.json(
      {
        timestamp: startedAt.toISOString(),
        ok: false,
        error: err instanceof Error ? err.message : "users_query_failed",
      },
      { status: 500 },
    );
  }

  // ── 3. For each user, filter + send ─────────────────────────────
  const log: Array<{
    userId: string;
    to: string;
    alertId: string;
    alertTitle: string;
    severity: Severity;
    sent: boolean;
    reason?: string;
    error?: string;
    messageSid?: string;
  }> = [];

  let totalSent = 0;
  let totalFailed = 0;
  let totalSkipped = 0;

  for (const user of users) {
    if (!user.whatsappNumber) continue; // safety check (filtered above)

    const threshold = user.alertSeverityThreshold as Severity;
    // Per-user dedupe set: never send the same alert twice in one run.
    const sentIds = new Set<string>();

    for (const alert of rawAlerts) {
      if (sentIds.has(alert.id)) continue;

      if (!severityMeetsThreshold(alert.severity, threshold)) {
        totalSkipped++;
        continue;
      }

      const payload: AlertPayload = {
        severity: alert.severity,
        title: alert.title,
        source: alert.source,
        sentimentLabel: alert.sentimentLabel,
        sentimentScore: alert.sentimentScore,
        detectedAt: alert.detectedAt,
      };

      const body = formatAlertMessage(payload);
      const result = await sendWhatsAppMessage(user.whatsappNumber, body);

      sentIds.add(alert.id);

      log.push({
        userId: user.id,
        to: user.whatsappNumber,
        alertId: alert.id,
        alertTitle: alert.title,
        severity: alert.severity,
        sent: result.sent,
        reason: result.reason,
        error: result.error,
        messageSid: result.messageSid,
      });

      if (result.sent) totalSent++;
      else totalFailed++;
    }
  }

  const finishedAt = new Date();
  return NextResponse.json({
    ok: true,
    timestamp: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs: Date.now() - startTime,
    twilioConfigured: twilioReady,
    alertsConsidered: rawAlerts.length,
    usersConsidered: users.length,
    summary: {
      sent: totalSent,
      failed: totalFailed,
      skipped: totalSkipped,
    },
    log,
  });
}
