// ═══════════════════════════════════════════════════════════════
//  HARCH ATELIER — WhatsApp Settings API
//
//  GET   /api/user/whatsapp       → returns current user's WhatsApp settings
//  PATCH /api/user/whatsapp       → updates whatsappNumber, whatsappAlerts,
//                                    alertSeverityThreshold
//
//  Auth: any authenticated user (any accountType). The session user
//  can only ever touch their own row — we filter by session.user.id.
//
//  Twilio credentials are NEVER exposed here. This endpoint only
//  stores the user's phone number + preferences. Sending is done by
//  /api/cron/whatsapp-alerts (server-side, CRON_SECRET secured) and
//  /api/user/whatsapp/test (uses the user's own credentials at send
//  time, also server-side).
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

// ─── Types ──────────────────────────────────────────────────────────
type SeverityThreshold = "low" | "medium" | "high" | "critical";

const ALLOWED_THRESHOLDS: ReadonlySet<SeverityThreshold> = new Set([
  "low",
  "medium",
  "high",
  "critical",
]);

// ─── Helpers ────────────────────────────────────────────────────────

// Validate E.164 format: +<country><number>, 6-15 digits total after the +.
// Examples: +212600000000, +14155238886, +33612345678
const E164_RE = /^\+\d{6,15}$/;

function normalizePhone(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // Strip spaces, dashes, parentheses — keep the leading + and digits.
  const cleaned = trimmed.replace(/[^\d+]/g, "");
  if (!E164_RE.test(cleaned)) return null;
  return cleaned;
}

// ─── GET ────────────────────────────────────────────────────────────
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized — session invalid" },
      { status: 401 },
    );
  }
  const userId = session.user.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        whatsappNumber: true,
        whatsappAlerts: true,
        alertSeverityThreshold: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      whatsappNumber: user.whatsappNumber ?? "",
      whatsappAlerts: user.whatsappAlerts,
      alertSeverityThreshold: user.alertSeverityThreshold as SeverityThreshold,
      // Surface the demo-mode flag so the UI can warn the user that
      // messages won't actually be sent until Twilio env vars are set.
      twilioConfigured: Boolean(
        process.env.TWILIO_ACCOUNT_SID &&
          process.env.TWILIO_AUTH_TOKEN &&
          process.env.TWILIO_WHATSAPP_FROM,
      ),
    });
  } catch (err) {
    logError("user.whatsapp", `[whatsapp GET] error: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}

// ─── PATCH ──────────────────────────────────────────────────────────
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized — session invalid" },
      { status: 401 },
    );
  }
  const userId = session.user.id;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Narrow the body shape; reject unknown payloads early.
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const payload = body as {
    whatsappNumber?: unknown;
    whatsappAlerts?: unknown;
    alertSeverityThreshold?: unknown;
  };

  const data: {
    whatsappNumber?: string | null;
    whatsappAlerts?: boolean;
    alertSeverityThreshold?: SeverityThreshold;
  } = {};

  // whatsappNumber: accept string or null (to clear). Validate E.164.
  if ("whatsappNumber" in payload) {
    const raw = payload.whatsappNumber;
    if (raw === null || raw === "") {
      data.whatsappNumber = null;
    } else if (typeof raw === "string") {
      const normalized = normalizePhone(raw);
      if (!normalized) {
        return NextResponse.json(
          {
            error:
              "Invalid phone number. Use E.164 format: +<country><number> (e.g. +212600000000).",
          },
          { status: 400 },
        );
      }
      data.whatsappNumber = normalized;
    } else {
      return NextResponse.json(
        { error: "whatsappNumber must be a string or null" },
        { status: 400 },
      );
    }
  }

  // whatsappAlerts: boolean only.
  if ("whatsappAlerts" in payload) {
    const v = payload.whatsappAlerts;
    if (typeof v !== "boolean") {
      return NextResponse.json(
        { error: "whatsappAlerts must be a boolean" },
        { status: 400 },
      );
    }
    data.whatsappAlerts = v;
  }

  // alertSeverityThreshold: must be one of the allowed values.
  if ("alertSeverityThreshold" in payload) {
    const v = payload.alertSeverityThreshold;
    if (typeof v !== "string" || !ALLOWED_THRESHOLDS.has(v as SeverityThreshold)) {
      return NextResponse.json(
        {
          error:
            "alertSeverityThreshold must be one of: low, medium, high, critical",
        },
        { status: 400 },
      );
    }
    data.alertSeverityThreshold = v as SeverityThreshold;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "No updatable fields provided" },
      { status: 400 },
    );
  }

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        whatsappNumber: true,
        whatsappAlerts: true,
        alertSeverityThreshold: true,
      },
    });

    return NextResponse.json({
      whatsappNumber: updated.whatsappNumber ?? "",
      whatsappAlerts: updated.whatsappAlerts,
      alertSeverityThreshold: updated.alertSeverityThreshold as SeverityThreshold,
      twilioConfigured: Boolean(
        process.env.TWILIO_ACCOUNT_SID &&
          process.env.TWILIO_AUTH_TOKEN &&
          process.env.TWILIO_WHATSAPP_FROM,
      ),
    });
  } catch (err) {
    logError("user.whatsapp", `[whatsapp PATCH] error: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
