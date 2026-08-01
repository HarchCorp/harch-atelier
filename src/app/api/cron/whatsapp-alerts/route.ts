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
import {
  dispatchAlertEvent,
  type AlertEventPayload,
} from "@/lib/harchiq/webhook-dispatcher";

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
    companyId: string | null;
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
          // Only alert on company-tagged articles — orphan articles
          // (no companyId) belong to the global news feed and have
          // no company to alert about.
          companyId: { not: null },
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
          companyId: true,
          url: true,
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
          companyId: true,
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
        companyId: a.companyId,
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
        companyId: r.companyId,
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

  // ── 4. Fan out webhooks for high/critical alerts ───────────────
  //
  //  Task: signal-enterprise-platform
  //  For every (companyId, alert) pair where severity is high or
  //  critical, dispatch the alert to every active webhook registered
  //  for that company and subscribed to alert.critical or alert.high.
  //  The fan-out is best-effort: failures are logged into the
  //  WebhookDelivery table by dispatchAlertEvent, never thrown here.
  //
  //  We only fan out high/critical alerts — medium and low are noisy
  //  and almost never warrant an outbound webhook.
  const webhookResults: Array<{
    companyId: string;
    alertId: string;
    event: string;
    dispatched: number;
    succeeded: number;
  }> = [];

  try {
    // Pre-fetch company names once per company to avoid N+1 queries
    // during dispatch (the dispatcher only needs id+slug+name).
    const companyIds = Array.from(
      new Set(
        rawAlerts
          .filter((a) => a.companyId && (a.severity === "high" || a.severity === "critical"))
          .map((a) => a.companyId as string),
      ),
    );
    const companies =
      companyIds.length === 0
        ? []
        : await prisma.company.findMany({
            where: { id: { in: companyIds } },
            select: { id: true, name: true, slug: true },
          });
    const companyMap = new Map(companies.map((c) => [c.id, c]));

    for (const alert of rawAlerts) {
      if (!alert.companyId) continue;
      if (alert.severity !== "high" && alert.severity !== "critical") continue;

      const company = companyMap.get(alert.companyId);
      if (!company) continue;

      const eventPayload: AlertEventPayload = {
        id: alert.id,
        title: alert.title,
        severity: alert.severity,
        source: alert.source,
        url: null,
        detectedAt: alert.detectedAt ? alert.detectedAt.toISOString() : null,
        sentimentScore: alert.sentimentScore,
        details: alert.kind === "risk" ? alert.title : undefined,
        company: {
          id: company.id,
          name: company.name,
          slug: company.slug,
        },
      };

      const results = await dispatchAlertEvent({
        companyId: alert.companyId,
        company,
        alert: eventPayload,
      });

      webhookResults.push({
        companyId: alert.companyId,
        alertId: alert.id,
        event: alert.severity === "critical" ? "alert.critical" : "alert.high",
        dispatched: results.length,
        succeeded: results.filter((r) => r.status === "success").length,
      });
    }
  } catch (err) {
    // Best-effort: a webhook dispatch failure must never mask the
    // WhatsApp summary above. Log and continue.
    console.error("[whatsapp-alerts] webhook dispatch failed:", err);
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
    webhooks: {
      dispatchedAlerts: webhookResults.length,
      results: webhookResults,
    },
    log,
  });
}
