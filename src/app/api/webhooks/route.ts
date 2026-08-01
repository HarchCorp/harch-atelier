import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { logAudit, extractIp, extractUserAgent } from "@/lib/harchiq/audit-log";
import { dispatchWebhook } from "@/lib/harchiq/webhook-dispatcher";

// ═══════════════════════════════════════════════════════════════
//  /api/webhooks
//
//  POST   — register a new webhook for the caller's company.
//            Body: { url: string, events: string[], description?, secret? }
//  GET    — list the caller's webhooks (with last delivery info).
//
//  Auth: NextAuth session. The caller must belong to a company —
//  webhooks are company-scoped (every webhook fires for alerts in
//  the owning company). Both regular users and company-admins can
//  register webhooks for their company; revocation follows the same
//  ownership rules as API keys.
//
//  Task: signal-enterprise-platform
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

// ─── Allowed events ──────────────────────────────────────────────
//
//  Centralised list so we can validate at registration time AND
//  surface in the API docs. Adding a new event means:
//    1. Add it here.
//    2. Emit it from the relevant cron/job.
//    3. Document the payload shape in /atelier/api-docs.

export const ALLOWED_WEBHOOK_EVENTS = [
  "alert.critical",
  "alert.high",
  "report.ready",
  "reputation.drop",
  "screening.match",
] as const;

export type WebhookEvent = (typeof ALLOWED_WEBHOOK_EVENTS)[number];

const MAX_WEBHOOKS_PER_COMPANY = 10;

// ─── Helpers ─────────────────────────────────────────────────────

async function getSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      companyId: true,
      status: true,
      role: true,
    },
  });
  if (!user) return null;
  if (user.status === "suspended") return null;
  return user;
}

function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    // Only allow https in production. http is allowed on localhost
    // for testing (e.g. http://localhost:3000/webhook-receiver).
    if (u.protocol === "https:") return true;
    if (u.protocol === "http:" && (u.hostname === "localhost" || u.hostname === "127.0.0.1")) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ─── POST /api/webhooks ──────────────────────────────────────────

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!user.companyId) {
    return NextResponse.json(
      {
        error: "Your account is not attached to a company — complete onboarding first.",
        redirect: "/atelier/onboarding",
      },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const url = typeof body.url === "string" ? body.url.trim() : "";
  const eventsRaw = Array.isArray(body.events) ? body.events : [];
  const description =
    typeof body.description === "string" ? body.description.trim().slice(0, 256) : null;
  const secret =
    typeof body.secret === "string" && body.secret.length > 0
      ? body.secret.slice(0, 256)
      : null;

  // ─── Validate URL ─────────────────────────────────────────────
  if (!url || url.length > 2048) {
    return NextResponse.json(
      { error: "url is required and must be under 2048 characters." },
      { status: 400 },
    );
  }
  if (!isValidUrl(url)) {
    return NextResponse.json(
      { error: "url must be a valid https:// URL (http:// allowed only for localhost)." },
      { status: 400 },
    );
  }

  // ─── Validate events ──────────────────────────────────────────
  const events = eventsRaw.filter((e): e is WebhookEvent =>
    (ALLOWED_WEBHOOK_EVENTS as readonly string[]).includes(e as string),
  );
  if (events.length === 0) {
    return NextResponse.json(
      {
        error: "events must be a non-empty array of allowed event names.",
        allowed: ALLOWED_WEBHOOK_EVENTS,
      },
      { status: 400 },
    );
  }

  // ─── Enforce per-company cap ──────────────────────────────────
  const existing = await prisma.webhook.count({
    where: { companyId: user.companyId },
  });
  if (existing >= MAX_WEBHOOKS_PER_COMPANY) {
    return NextResponse.json(
      {
        error: `Your company already has ${existing} webhooks. Remove one before adding another (max ${MAX_WEBHOOKS_PER_COMPANY}).`,
        limit: MAX_WEBHOOKS_PER_COMPANY,
        existing,
      },
      { status: 409 },
    );
  }

  const webhook = await prisma.webhook.create({
    data: {
      userId: user.id,
      companyId: user.companyId,
      url,
      events: JSON.stringify(events),
      secret,
      description,
      isActive: true,
    },
    select: {
      id: true,
      url: true,
      events: true,
      description: true,
      isActive: true,
      createdAt: true,
    },
  });

  await logAudit({
    userId: user.id,
    action: "webhook.create" as never,
    resource: `webhook:${webhook.id}`,
    result: "success",
    ipAddress: extractIp(req),
    userAgent: extractUserAgent(req),
    metadata: { url, events, description },
  });

  return NextResponse.json({
    webhook: {
      ...webhook,
      events: JSON.parse(webhook.events),
    },
  });
}

// ─── GET /api/webhooks ───────────────────────────────────────────

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!user.companyId) {
    return NextResponse.json({ webhooks: [], total: 0 });
  }

  // Company admins can see ALL webhooks for their company; regular
  // users see only their own. This matches the GitHub model where
  // org owners can audit every webhook on the org.
  const isCompanyAdmin = user.role === "company-admin" || user.role === "admin";
  const where = isCompanyAdmin
    ? { companyId: user.companyId }
    : { userId: user.id, companyId: user.companyId };

  const webhooks = await prisma.webhook.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      url: true,
      events: true,
      description: true,
      isActive: true,
      secret: true,
      lastDeliveryAt: true,
      lastDeliveryStatus: true,
      lastDeliveryMessage: true,
      createdAt: true,
      _count: { select: { deliveries: true } },
    },
  });

  const annotated = webhooks.map((w) => ({
    ...w,
    events: JSON.parse(w.events) as string[],
    hasSecret: !!w.secret,
    secret: undefined,
    deliveryCount: w._count.deliveries,
    _count: undefined,
  }));

  return NextResponse.json({
    webhooks: annotated,
    total: annotated.length,
  });
}

// ─── Export the dispatcher for the test endpoint ─────────────────
// (kept here so the route file is the single import surface for the
// webhook subsystem; the actual implementation lives in
// src/lib/harchiq/webhook-dispatcher.ts)
export { dispatchWebhook };
