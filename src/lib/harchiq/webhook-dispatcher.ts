// ═══════════════════════════════════════════════════════════════
//  WEBHOOK DISPATCHER
//  Task: signal-enterprise-platform
//
//  Fans out outbound webhook deliveries to every registered,
//  active, subscribed endpoint for a given (companyId, event) pair.
//
//  Public API (called by cron jobs and other producers):
//
//    dispatchAlertEvent({ companyId, alert })
//      → looks up webhooks for the company subscribed to
//        alert.critical or alert.high (based on alert.severity),
//        then fires each in parallel.
//
//    dispatchEvent({ companyId, event, payload })
//      → generic helper for any event name (e.g. report.ready,
//        reputation.drop, screening.match).
//
//    dispatchWebhook({ webhook, event, payload, maxRetries? })
//      → single-webhook delivery with retry + signing + logging.
//      Public so /api/webhooks/[id]/test can reuse it.
//
//  Retry policy: 3 attempts with exponential backoff
//    attempt 1 → immediate
//    attempt 2 → after 2 s
//    attempt 3 → after 4 s
//  A delivery is considered successful when the receiver returns
//  2xx. 3xx/4xx/5xx and network errors all trigger a retry.
//
//  Signing: if webhook.secret is set, the dispatcher adds an
//  `X-Harch-Signature` header with hex(HMAC-SHA256(secret, body)).
//  Receivers should verify this signature to authenticate the
//  delivery.
//
//  Logging: every attempt writes a WebhookDelivery row. After the
//  final attempt (success or failure), the Webhook row's
//  lastDelivery* fields are stamped so the admin UI can render a
//  status badge without joining deliveries.
//
//  SERVER-SIDE ONLY — never import from a client component.
// ═══════════════════════════════════════════════════════════════

import { createHmac } from "crypto";
import { prisma } from "@/lib/db";

// ─── Types ───────────────────────────────────────────────────────

export interface WebhookTarget {
  id: string;
  url: string;
  secret: string | null;
  isActive: boolean;
}

export interface WebhookDeliveryResult {
  webhookId: string;
  event: string;
  status: "success" | "failed";
  attempts: number;
  httpStatus: number | null;
  errorMessage: string | null;
  durationMs: number;
}

export interface AlertEventPayload {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  source: string;
  url: string | null;
  detectedAt: string | null;
  sentimentScore: number | null;
  details?: string;
  company: {
    id: string;
    name: string;
    slug: string;
  };
}

// ─── Backoff timing ──────────────────────────────────────────────
//
//  Exponential backoff: 2s, 4s, 8s... Capped at 30s so a totally
//  dead receiver doesn't pin a Vercel function for minutes.

const INITIAL_BACKOFF_MS = 2000;
const MAX_BACKOFF_MS = 30_000;

function backoffMs(attempt: number): number {
  return Math.min(INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1), MAX_BACKOFF_MS);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── Signing ─────────────────────────────────────────────────────

function signBody(secret: string, body: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

// ─── Single-webhook delivery with retries ────────────────────────

export interface DispatchWebhookParams {
  webhook: WebhookTarget;
  event: string;
  payload: unknown;
  maxRetries?: number; // default 3
}

export async function dispatchWebhook(
  params: DispatchWebhookParams,
): Promise<WebhookDeliveryResult> {
  const { webhook, event, payload } = params;
  const maxRetries = params.maxRetries ?? 3;

  // Short-circuit: inactive webhook (admin paused it).
  if (!webhook.isActive) {
    return {
      webhookId: webhook.id,
      event,
      status: "failed",
      attempts: 0,
      httpStatus: null,
      errorMessage: "webhook inactive (paused by admin)",
      durationMs: 0,
    };
  }

  const bodyStr = JSON.stringify({
    event,
    deliveredAt: new Date().toISOString(),
    data: payload,
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "HarchAtelier-Webhook/1.0",
    "X-Harch-Event": event,
    "X-Harch-Webhook-Id": webhook.id,
  };
  if (webhook.secret) {
    headers["X-Harch-Signature"] = signBody(webhook.secret, bodyStr);
  }

  let attempt = 0;
  let lastStatus: number | null = null;
  let lastError: string | null = null;
  const startedAt = Date.now();

  while (attempt < maxRetries) {
    attempt++;
    const attemptStart = Date.now();
    let deliveryId: string | null = null;

    // Pre-create the delivery row so we have a paper trail even if
    // the fetch hangs forever (timeout). Status = "pending" until
    // we mark it completed.
    try {
      const row = await prisma.webhookDelivery.create({
        data: {
          webhookId: webhook.id,
          event,
          payload: bodyStr,
          attempt,
          status: "pending",
          startedAt: new Date(attemptStart),
        },
        select: { id: true },
      });
      deliveryId = row.id;
    } catch {
      // If we can't even write the log row, abort — but still try
      // to deliver so the user's receiver gets pinged.
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);
      const res = await fetch(webhook.url, {
        method: "POST",
        headers,
        body: bodyStr,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      lastStatus = res.status;
      const snippet = (await res.text().catch(() => "")).slice(0, 500);
      const durationMs = Date.now() - attemptStart;

      if (res.status >= 200 && res.status < 300) {
        // Success — mark delivery completed and stamp the webhook.
        await prisma.webhookDelivery.update({
          where: { id: deliveryId ?? "" },
          data: {
            status: "success",
            httpStatus: res.status,
            responseSnippet: snippet || null,
            durationMs,
            completedAt: new Date(),
          },
        }).catch(() => {
          /* swallow — log write failure must not break the delivery */
        });

        await stampWebhookLastDelivery(webhook.id, {
          status: "success",
          message: `HTTP ${res.status}`,
          at: new Date(),
        });

        return {
          webhookId: webhook.id,
          event,
          status: "success",
          attempts: attempt,
          httpStatus: res.status,
          errorMessage: null,
          durationMs: Date.now() - startedAt,
        };
      }

      // Non-2xx — capture the snippet and retry.
      lastError = `HTTP ${res.status}: ${snippet.slice(0, 200)}`;
      await prisma.webhookDelivery.update({
        where: { id: deliveryId ?? "" },
        data: {
          status: "failed",
          httpStatus: res.status,
          responseSnippet: snippet || null,
          errorMessage: lastError,
          durationMs,
          completedAt: new Date(),
        },
      }).catch(() => {
        /* swallow */
      });
    } catch (err) {
      // Network error, DNS failure, timeout, etc.
      lastStatus = null;
      lastError = err instanceof Error ? err.message : String(err);
      const durationMs = Date.now() - attemptStart;
      await prisma.webhookDelivery.update({
        where: { id: deliveryId ?? "" },
        data: {
          status: "failed",
          httpStatus: null,
          errorMessage: lastError,
          durationMs,
          completedAt: new Date(),
        },
      }).catch(() => {
        /* swallow */
      });
    }

    // Back off before the next attempt (unless this was the last one).
    if (attempt < maxRetries) {
      await sleep(backoffMs(attempt));
    }
  }

  // All retries exhausted — mark the webhook as failed.
  await stampWebhookLastDelivery(webhook.id, {
    status: "failed",
    message: lastError ?? "all retries failed",
    at: new Date(),
  });

  return {
    webhookId: webhook.id,
    event,
    status: "failed",
    attempts: attempt,
    httpStatus: lastStatus,
    errorMessage: lastError,
    durationMs: Date.now() - startedAt,
  };
}

// ─── Stamp the Webhook row with the latest delivery result ───────

async function stampWebhookLastDelivery(
  webhookId: string,
  info: { status: "success" | "failed"; message: string; at: Date },
): Promise<void> {
  try {
    await prisma.webhook.update({
      where: { id: webhookId },
      data: {
        lastDeliveryAt: info.at,
        lastDeliveryStatus: info.status,
        lastDeliveryMessage: info.message.slice(0, 256),
      },
    });
  } catch {
    /* best-effort */
  }
}

// ─── Fan-out helpers ─────────────────────────────────────────────

/**
 * Load every active webhook subscribed to `event` for a given
 * company, parse its events array, and dispatch the payload to
 * each in parallel. Returns the per-webhook results so callers
 * (e.g. a cron) can log the outcome.
 */
export async function dispatchEvent(params: {
  companyId: string;
  event: string;
  payload: unknown;
  maxRetries?: number;
}): Promise<WebhookDeliveryResult[]> {
  const rows = await prisma.webhook.findMany({
    where: { companyId: params.companyId, isActive: true },
    select: { id: true, url: true, secret: true, events: true },
  });

  const subscribed = rows.filter((r) => {
    try {
      const events = JSON.parse(r.events) as string[];
      return Array.isArray(events) && events.includes(params.event);
    } catch {
      return false;
    }
  });

  if (subscribed.length === 0) return [];

  const results = await Promise.allSettled(
    subscribed.map((w) =>
      dispatchWebhook({
        webhook: {
          id: w.id,
          url: w.url,
          secret: w.secret,
          isActive: true,
        },
        event: params.event,
        payload: params.payload,
        maxRetries: params.maxRetries,
      }),
    ),
  );

  return results.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : {
          webhookId: subscribed[i].id,
          event: params.event,
          status: "failed" as const,
          attempts: 0,
          httpStatus: null,
          errorMessage: r.reason instanceof Error ? r.reason.message : String(r.reason),
          durationMs: 0,
        },
  );
}

/**
 * Convenience wrapper for alert events. Derives the event name from
 * the alert severity (alert.critical | alert.high) and calls
 * dispatchEvent with the alert payload.
 */
export async function dispatchAlertEvent(params: {
  companyId: string;
  company: { id: string; name: string; slug: string };
  alert: AlertEventPayload;
}): Promise<WebhookDeliveryResult[]> {
  const event =
    params.alert.severity === "critical" ? "alert.critical" : "alert.high";
  return dispatchEvent({
    companyId: params.companyId,
    event,
    payload: params.alert,
  });
}
