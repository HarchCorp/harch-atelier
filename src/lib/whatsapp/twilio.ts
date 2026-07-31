// ═══════════════════════════════════════════════════════════════
//  HARCH ATELIER — WhatsApp / Twilio helper (SERVER-SIDE ONLY)
//
//  Centralizes:
//    • Demo-mode detection (Twilio env vars missing → return
//      { sent: false, reason: "TWILIO_NOT_CONFIGURED" } instead of
//      throwing).
//    • Lazy Twilio client construction (so we don't import the SDK
//      on cold starts when credentials are absent).
//    • Message formatting for alerts.
//
//  This file MUST NEVER be imported from client code. The twilio
//  SDK pulls in Node-only modules and the credentials are server
//  secrets.
// ═══════════════════════════════════════════════════════════════

// Twilio v6's default export is a factory function, not a standard class,
// so InstanceType<typeof Twilio> doesn't compile. We use a structural type
// covering only the methods we call (messages.create). This keeps type
// safety on our usage without fighting the SDK's internal typing.
// The SDK is loaded lazily via dynamic import in getTwilioClient().
interface TwilioClient {
  messages: {
    create: (params: {
      from: string;
      to: string;
      body: string;
    }) => Promise<{ sid: string; errorCode?: number; errorMessage?: string }>;
  };
}

// ─── Types ──────────────────────────────────────────────────────────

export type Severity = "low" | "medium" | "high" | "critical";

export interface AlertPayload {
  severity: Severity;
  title: string;
  source: string;
  sentimentLabel: string | null;
  sentimentScore: number | null;
  detectedAt: Date | null;
}

export interface SendResult {
  sent: boolean;
  reason?: string;
  messageSid?: string;
  to?: string;
  error?: string;
}

// ─── Severity ordering (low < medium < high < critical) ────────────
const SEVERITY_RANK: Record<Severity, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

/**
 * Returns true if `alertSeverity` meets or exceeds `threshold`.
 * Both values must be one of low | medium | high | critical.
 */
export function severityMeetsThreshold(
  alertSeverity: Severity,
  threshold: Severity,
): boolean {
  return SEVERITY_RANK[alertSeverity] >= SEVERITY_RANK[threshold];
}

// ─── Demo-mode detection ───────────────────────────────────────────

export function isTwilioConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_WHATSAPP_FROM,
  );
}

// ─── Lazy Twilio client (only created when configured) ─────────────
let _client: TwilioClient | null = null;

async function getTwilioClient(): Promise<TwilioClient> {
  if (_client) return _client;
  // Dynamic import keeps twilio out of bundles that never send.
  const mod = (await import("twilio")) as unknown as {
    default: (sid: string, token: string) => TwilioClient;
  };
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) {
    throw new Error("TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN missing");
  }
  _client = mod.default(sid, token);
  return _client;
}

// ─── Message formatting ────────────────────────────────────────────

/**
 * Format an alert into the concise WhatsApp body text used by the
 * cron job. English, no emojis, ASCII only (Twilio WhatsApp body is
 * plain UTF-8 but we keep it simple for terminal readability).
 */
export function formatAlertMessage(alert: AlertPayload): string {
  const time = alert.detectedAt
    ? `${alert.detectedAt.getUTCFullYear()}-${pad(alert.detectedAt.getUTCMonth() + 1)}-${pad(
        alert.detectedAt.getUTCDate(),
      )} ${pad(alert.detectedAt.getUTCHours())}:${pad(alert.detectedAt.getUTCMinutes())} UTC`
    : "just now";

  const sentiment =
    alert.sentimentLabel && alert.sentimentScore !== null
      ? `${alert.sentimentLabel} (${alert.sentimentScore.toFixed(2)})`
      : alert.sentimentLabel ?? "n/a";

  return [
    "HarchIQ Alert",
    "",
    `[${alert.severity.toUpperCase()}] ${alert.title}`,
    "",
    `Source: ${alert.source}`,
    `Sentiment: ${sentiment}`,
    `Time: ${time}`,
    "",
    "View: https://atelier.harchcorp.com/atelier/console",
  ].join("\n");
}

/**
 * Format a short test message used by the "Test" button in the
 * WhatsApp settings modal.
 */
export function formatTestMessage(userName?: string | null): string {
  const ts = new Date();
  const time = `${ts.getUTCFullYear()}-${pad(ts.getUTCMonth() + 1)}-${pad(
    ts.getUTCDate(),
  )} ${pad(ts.getUTCHours())}:${pad(ts.getUTCMinutes())} UTC`;
  const greeting = userName ? `Hello ${userName},` : "Hello,";
  return [
    "HarchIQ Alert",
    "",
    `${greeting} this is a test message from Harch Atelier.`,
    "",
    `Your WhatsApp alerts are configured and reachable.`,
    `Time: ${time}`,
    "",
    "View: https://atelier.harchcorp.com/atelier/console",
  ].join("\n");
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

// ─── Sending ───────────────────────────────────────────────────────

/**
 * Send a WhatsApp message to `to` (E.164 phone, no `whatsapp:` prefix).
 *
 * Returns a SendResult. NEVER throws — Twilio errors are caught and
 * reported as `{ sent: false, reason: "TWILIO_ERROR", error }` so the
 * caller can keep iterating other recipients.
 */
export async function sendWhatsAppMessage(
  to: string,
  body: string,
): Promise<SendResult> {
  if (!isTwilioConfigured()) {
    return {
      sent: false,
      reason: "TWILIO_NOT_CONFIGURED",
      to,
    };
  }

  const from = process.env.TWILIO_WHATSAPP_FROM!;
  // Twilio WhatsApp addresses look like "whatsapp:+14155238886".
  // Normalize both sides in case the env var already includes the prefix.
  const fromAddr = from.startsWith("whatsapp:") ? from : `whatsapp:${from}`;
  const toAddr = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;

  try {
    const client = await getTwilioClient();
    const msg = await client.messages.create({
      from: fromAddr,
      to: toAddr,
      body,
    });
    return {
      sent: true,
      messageSid: msg.sid,
      to,
    };
  } catch (err) {
    return {
      sent: false,
      reason: "TWILIO_ERROR",
      to,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
