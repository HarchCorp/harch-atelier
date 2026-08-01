// ═══════════════════════════════════════════════════════════════
//  POST /api/console/alerts/push
//
//  Internal endpoint that pushes new alerts to the WebSocket
//  mini-service (mini-services/alert-service, port 3003) so connected
//  console clients receive them in real-time.
//
//  Called by:
//   • /api/cron/scrape-rss after ingesting new articles
//   • /api/cron/whatsapp-alerts before fan-out
//   • any internal "article ingested" hook
//
//  Auth:
//   • Authorization: Bearer ${CRON_SECRET}  (preferred)
//   • Authorization: Bearer ${SETUP_TOKEN}  (dev fallback)
//   Both checked via `authorizeInternal`. Without a valid token the
//   route returns 401 — this endpoint is never exposed to browsers.
//
//  Body modes:
//   • `{ alert: AlertPayload }`         — push one synthetic alert
//   • `{ articleIds: string[] }`        — push those articles (by id)
//   • `{ sinceMinutes: number }`        — push every negative article
//                                         ingested in the last N minutes
//   • `{}` (empty body)                 — defaults to sinceMinutes=5
//
//  Returns: `{ pushed: number, failed: boolean, alertIds: string[] }`
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/db";
import { logInfo, logWarn } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// ─── Auth ──────────────────────────────────────────────────────
function authorizeInternal(req: Request): boolean {
  const auth = req.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ")) return false;
  const provided = auth.slice("Bearer ".length).trim();
  if (!provided) return false;

  const candidates = [
    process.env.CRON_SECRET,
    process.env.SETUP_TOKEN,
    process.env.ALERT_PUSH_SECRET,
  ].filter((s): s is string => !!s && s.length > 0);

  for (const secret of candidates) {
    if (provided.length !== secret.length) continue;
    try {
      if (timingSafeEqual(Buffer.from(provided), Buffer.from(secret))) {
        return true;
      }
    } catch {
      /* try next */
    }
  }
  return false;
}

// ─── Alert shape (matches the WS server's AlertPayload) ────────
interface PushAlert {
  id: string;
  type: "negative_article" | "risk_assessment" | "regulatory" | "signal";
  title: string;
  source: string;
  url?: string | null;
  sentiment?: "positive" | "neutral" | "negative" | null;
  sentimentScore?: number | null;
  severity: "critical" | "high" | "medium" | "low";
  timestamp: string;
  details?: string;
  companyId?: string;
  companySlug?: string;
}

// ─── Push helper ───────────────────────────────────────────────
const ALERT_SERVICE_URL = process.env.ALERT_SERVICE_URL ?? "http://localhost:3003";

async function pushToService(alert: PushAlert): Promise<boolean> {
  const secret =
    process.env.ALERT_PUSH_SECRET ??
    process.env.CRON_SECRET ??
    process.env.SETUP_TOKEN ??
    "";
  try {
    const res = await fetch(`${ALERT_SERVICE_URL}/api/push`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: secret ? `Bearer ${secret}` : "",
      },
      body: JSON.stringify({ alert, channel: "alerts" }),
      // Don't hang the cron if the WS service is down.
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch (err) {
    logWarn("alerts.push", `WS push failed: ${(err as Error).message}`);
    return false;
  }
}

// ─── Article → Alert formatter ─────────────────────────────────
function articleToAlert(a: {
  id: string;
  title: string;
  source: string;
  url: string | null;
  sentimentScore: number | null;
  sentimentLabel: string | null;
  publishedAt: Date | null;
  companyId: string | null;
  company?: { slug: string } | null;
}): PushAlert {
  const score = a.sentimentScore ?? 0;
  const severity: PushAlert["severity"] = score < -0.6 ? "critical" : score < -0.3 ? "high" : "medium";
  return {
    id: a.id,
    type: "negative_article",
    title: a.title,
    source: a.source,
    url: a.url,
    sentiment: (a.sentimentLabel as PushAlert["sentiment"]) ?? "negative",
    sentimentScore: a.sentimentScore,
    severity,
    timestamp: (a.publishedAt ?? new Date()).toISOString(),
    companyId: a.companyId ?? undefined,
    companySlug: a.company?.slug ?? undefined,
  };
}

// ─── POST ──────────────────────────────────────────────────────
export async function POST(req: Request) {
  if (!authorizeInternal(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    alert?: PushAlert;
    articleIds?: string[];
    sinceMinutes?: number;
  } = {};

  try {
    const text = await req.text();
    if (text.trim()) body = JSON.parse(text) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const alerts: PushAlert[] = [];

  // Mode 1: explicit alert payload
  if (body.alert) {
    if (!body.alert.id || !body.alert.title) {
      return NextResponse.json(
        { error: "Alert must have at least id + title" },
        { status: 400 },
      );
    }
    alerts.push({
      ...body.alert,
      timestamp: body.alert.timestamp ?? new Date().toISOString(),
    });
  }

  // Mode 2: explicit article IDs
  if (body.articleIds && body.articleIds.length > 0) {
    const articles = await prisma.article.findMany({
      where: { id: { in: body.articleIds } },
      select: {
        id: true,
        title: true,
        source: true,
        url: true,
        sentimentScore: true,
        sentimentLabel: true,
        publishedAt: true,
        companyId: true,
        company: { select: { slug: true } },
      },
    });
    for (const a of articles) alerts.push(articleToAlert(a));
  }

  // Mode 3: sinceMinutes (default when nothing else specified)
  const sinceMinutes =
    body.sinceMinutes ?? (alerts.length === 0 ? 5 : 0);
  if (sinceMinutes > 0) {
    const cutoff = new Date(Date.now() - sinceMinutes * 60_000);
    const recent = await prisma.article.findMany({
      where: {
        publishedAt: { gte: cutoff },
        sentimentLabel: "negative",
      },
      orderBy: { publishedAt: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        source: true,
        url: true,
        sentimentScore: true,
        sentimentLabel: true,
        publishedAt: true,
        companyId: true,
        company: { select: { slug: true } },
      },
    });
    for (const a of recent) {
      if (!alerts.some((x) => x.id === a.id)) alerts.push(articleToAlert(a));
    }
  }

  if (alerts.length === 0) {
    return NextResponse.json({ pushed: 0, failed: false, alertIds: [] });
  }

  // Fan out — fire all pushes in parallel, but tolerate individual failures.
  const results = await Promise.all(alerts.map((a) => pushToService(a)));
  const pushed = results.filter(Boolean).length;
  const failed = pushed < alerts.length;

  logInfo(
    "alerts.push",
    `Pushed ${pushed}/${alerts.length} alerts to WS service`,
    { failed, sample: alerts[0]?.id },
  );

  return NextResponse.json({
    pushed,
    failed,
    alertIds: alerts.map((a) => a.id),
  });
}

// ─── GET (health probe) ────────────────────────────────────────
export async function GET(req: Request) {
  if (!authorizeInternal(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Probe the WS service.
  try {
    const res = await fetch(`${ALERT_SERVICE_URL}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    const json = await res.json();
    return NextResponse.json({
      ok: res.ok,
      service: json,
      url: ALERT_SERVICE_URL,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message, url: ALERT_SERVICE_URL },
      { status: 502 },
    );
  }
}
