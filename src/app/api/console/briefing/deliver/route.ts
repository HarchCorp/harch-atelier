// ═══════════════════════════════════════════════════════════════
//  POST /api/console/briefing/deliver
//
//  Generates + delivers a daily HarchIQ briefing via every channel
//  the user has enabled:
//    • WhatsApp (if user.whatsappAlerts === true && whatsappNumber set)
//    • Email    (placeholder — fires a webhook to a configured email
//                service URL when BRIEFING_EMAIL_WEBHOOK is set)
//    • In-app   (always creates a Notification row — visible in the
//                console bell + the Briefing Archive)
//    • Webhook  (fans out a `briefing.ready` event to every active
//                webhook subscribed to that event for the company)
//
//  Auth: requires session. The body may specify a `dateKey`
//  (YYYY-MM-DD) — defaults to today in Casablanca tz. The body may
//  also specify `channels: ["whatsapp","email","in_app","webhook"]`
//  to override the auto-detected set (useful for the "Re-deliver"
//  button in BriefingArchive which forces WhatsApp).
//
//  Idempotent: re-running for the same (userId, date) upserts the
//  cached briefing and re-sends the WhatsApp + in-app notification.
//
//  Task: dataminr-briefings-compliance
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import {
  generateBriefing,
  persistBriefing,
  loadCachedBriefing,
  briefingDateKey,
  getPrimaryCompanyForUser,
  type BriefingPayload,
  type BriefingCitedItem,
} from "@/lib/harchiq/briefing";
import { sendWhatsAppMessage } from "@/lib/whatsapp/twilio";
import { dispatchEvent } from "@/lib/harchiq/webhook-dispatcher";
import { logInfo, logError } from "@/lib/logger";
import { logAudit, extractIp, extractUserAgent } from "@/lib/harchiq/audit-log";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 45;

type Channel = "whatsapp" | "email" | "in_app" | "webhook";

interface DeliverBody {
  dateKey?: string;
  channels?: Channel[];
  forceRegenerate?: boolean;
}

interface ChannelResult {
  channel: Channel;
  status: "sent" | "skipped" | "failed";
  reason?: string;
  detail?: string;
}

// ─── WhatsApp message formatter ────────────────────────────────
//
//  Builds a compact plain-text WhatsApp body from the briefing
//  payload. Twilio WhatsApp messages can be up to 4096 chars but we
//  keep it under ~1500 for readability on small screens.

function formatBriefingWhatsApp(payload: BriefingPayload, companyName: string): string {
  const lines: string[] = [];
  lines.push("HarchIQ Daily Briefing");
  lines.push("");
  lines.push(`${companyName} — ${payload.metadata.dateKey}`);
  lines.push("");
  lines.push("EXECUTIVE SUMMARY");
  // Truncate the executive summary to keep the message readable.
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

// ─── Email webhook placeholder ─────────────────────────────────
//
//  If BRIEFING_EMAIL_WEBHOOK is set, POST the briefing payload to
//  that URL so an external email service (SendGrid / Postmark / SES)
//  can render and deliver it. Best-effort — failures are logged but
//  don't fail the whole delivery.

async function deliverEmail(
  payload: BriefingPayload,
  userEmail: string,
  userName: string | null,
): Promise<ChannelResult> {
  const webhookUrl = process.env.BRIEFING_EMAIL_WEBHOOK;
  if (!webhookUrl) {
    return {
      channel: "email",
      status: "skipped",
      reason: "BRIEFING_EMAIL_WEBHOOK not configured",
    };
  }
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        to: userEmail,
        recipientName: userName,
        subject: `HarchIQ Daily Briefing — ${payload.metadata.dateKey}`,
        companyName: payload.metadata.companyName,
        briefing: payload,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      return {
        channel: "email",
        status: "failed",
        reason: `webhook returned ${res.status}`,
        detail: (await res.text().catch(() => "")).slice(0, 200),
      };
    }
    return { channel: "email", status: "sent" };
  } catch (err) {
    return {
      channel: "email",
      status: "failed",
      reason: "webhook fetch error",
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}

// ─── Main POST handler ─────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  let body: DeliverBody = {};
  try {
    const text = await req.text();
    if (text.trim().length > 0) body = JSON.parse(text) as DeliverBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const dateKey = body.dateKey ?? briefingDateKey();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return NextResponse.json({ error: "Invalid dateKey. Use YYYY-MM-DD." }, { status: 400 });
  }

  // 1. Resolve the primary company for this user.
  const company = await getPrimaryCompanyForUser({
    id: userId,
    accountType: session.user.accountType ?? "brand-monitor",
    isDemo: session.user.isDemo,
  });
  if (!company) {
    return NextResponse.json(
      { error: "No company configured for briefing delivery." },
      { status: 404 },
    );
  }

  // 2. Load or generate the briefing payload.
  let payload: BriefingPayload | null = null;
  if (!body.forceRegenerate) {
    payload = await loadCachedBriefing(userId, dateKey);
  }
  if (!payload) {
    try {
      payload = await generateBriefing({
        userId,
        companyId: company.id,
        companyName: company.name,
        dateKey,
        isDemo: session.user.isDemo,
      });
      persistBriefing(userId, company.id, dateKey, payload).catch((err) => {
        logError("briefing.deliver.persist", `userId=${userId} date=${dateKey}: ${(err as Error).message}`);
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      logError("briefing.deliver.generate", `userId=${userId} date=${dateKey}: ${msg}`);
      return NextResponse.json(
        { error: "Couldn't generate briefing.", detail: msg },
        { status: 500 },
      );
    }
  }

  // 3. Load the user row to resolve WhatsApp prefs + email/name.
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      name: true,
      whatsappNumber: true,
      whatsappAlerts: true,
      alertSeverityThreshold: true,
      isDemo: true,
    },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // 4. Resolve the channel set.
  //    Body channels override auto-detection. Otherwise:
  //    • WhatsApp — only if user.whatsappAlerts && whatsappNumber
  //    • Email    — always (the webhook placeholder will skip if not configured)
  //    • In-app   — always
  //    • Webhook  — always (the dispatcher is a no-op when no webhooks subscribe)
  const channels: Channel[] = body.channels ?? (() => {
    const set: Channel[] = ["in_app", "email", "webhook"];
    if (user.whatsappAlerts && user.whatsappNumber) set.push("whatsapp");
    return set;
  })();

  const results: ChannelResult[] = [];

  // 5. WhatsApp delivery.
  if (channels.includes("whatsapp")) {
    if (!user.whatsappAlerts || !user.whatsappNumber) {
      results.push({
        channel: "whatsapp",
        status: "skipped",
        reason: "WhatsApp alerts disabled or number not set",
      });
    } else {
      const message = formatBriefingWhatsApp(payload, company.name);
      const sendResult = await sendWhatsAppMessage(user.whatsappNumber, message);
      results.push({
        channel: "whatsapp",
        status: sendResult.sent ? "sent" : "failed",
        reason: sendResult.sent ? undefined : sendResult.reason,
        detail: sendResult.sent
          ? sendResult.messageSid
          : sendResult.error,
      });
    }
  }

  // 6. Email delivery (placeholder — fires a webhook).
  if (channels.includes("email")) {
    const emailResult = await deliverEmail(payload, user.email, user.name);
    results.push(emailResult);
  }

  // 7. In-app notification — always create a Notification row so the
  //    bell badge picks it up + the Briefing Archive can list it.
  if (channels.includes("in_app")) {
    try {
      await prisma.notification.create({
        data: {
          userId,
          type: "alert",
          title: `HarchIQ Daily Briefing — ${dateKey}`,
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
      results.push({ channel: "in_app", status: "sent" });
    } catch (err) {
      results.push({
        channel: "in_app",
        status: "failed",
        reason: "db insert failed",
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // 8. Webhook fan-out — dispatch `briefing.ready` to subscribed
  //    endpoints. Best-effort: failures are logged in WebhookDelivery.
  if (channels.includes("webhook")) {
    try {
      const deliveryResults = await dispatchEvent({
        companyId: company.id,
        event: "briefing.ready",
        payload: {
          date: dateKey,
          companyName: company.name,
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
          briefingUrl: `/atelier/console`,
        },
      });
      results.push({
        channel: "webhook",
        status: "sent",
        detail: `${deliveryResults.length} webhook(s) notified`,
      });
    } catch (err) {
      results.push({
        channel: "webhook",
        status: "failed",
        reason: "dispatch error",
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // 9. Audit log.
  await logAudit({
    userId,
    action: "briefing_generate",
    resource: `briefing:${dateKey}`,
    result: "success",
    ipAddress: extractIp(req),
    userAgent: extractUserAgent(req),
    metadata: {
      companyId: company.id,
      date: dateKey,
      channels: results.map((r) => `${r.channel}:${r.status}`),
      forceRegenerate: !!body.forceRegenerate,
    },
  });

  logInfo(
    "briefing.deliver",
    `userId=${userId} date=${dateKey} channels=${results.map((r) => `${r.channel}=${r.status}`).join(",")}`,
  );

  return NextResponse.json({
    status: "ok",
    date: dateKey,
    companyName: company.name,
    confidence: payload.confidence,
    channels: results,
  });
}
