// ═══════════════════════════════════════════════════════════════
//  HARCH ATELIER — WhatsApp inbound messages feed
//
//  GET /api/whatsapp/inbound/messages
//    ?limit=50        — cap (default 50, max 1000)
//    ?phone=...       — filter by sender phone (optional)
//
//  Returns the list of inbound WhatsApp messages + their NLP
//  analysis, newest first. Polled every 5 seconds by the lab page.
//
//  Auth: NextAuth session required (demo accounts OK). The
//  simulate endpoint also requires a session, so the demo page is
//  already authed when it polls this endpoint.
//
//  Task ID: BRICK-2-whatsapp-inbound
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import {
  list,
  listByPhone,
  stats,
  seedDemoMessagesIfEmpty,
  clear as clearStore,
  clearDemoMessages,
} from "@/lib/whatsapp/inbound-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized — sign in to view the inbound feed" },
      { status: 401 },
    );
  }

  const url = req.nextUrl;
  const limitRaw = url.searchParams.get("limit");
  const phone = url.searchParams.get("phone");
  const seed = url.searchParams.get("seed");
  const reset = url.searchParams.get("reset");
  const clearDemo = url.searchParams.get("clearDemo");

  // ?reset=1 — clears the entire store (admin/debug button on the
  // lab page). Useful for demos. Returns the empty state.
  if (reset === "1") {
    clearStore();
    return NextResponse.json({
      messages: [],
      stats: stats(),
      reset: true,
    });
  }

  // ?clearDemo=1 — removes only the demo-seeded messages. Used
  // when the founder wants to "go live" and let real Twilio
  // messages replace the sample data.
  if (clearDemo === "1") {
    const removed = clearDemoMessages();
    return NextResponse.json({
      messages: list(parseLimit(limitRaw)),
      stats: stats(),
      removedDemo: removed,
    });
  }

  // ?seed=1 — explicitly seed demo messages (idempotent if store
  // already has data). Also auto-seeds on every GET if the store
  // is empty, so the lab page never shows a blank feed.
  if (seed === "1" || stats().total === 0) {
    seedDemoMessagesIfEmpty();
  }

  const limit = parseLimit(limitRaw);
  const messages = phone ? listByPhone(phone, limit) : list(limit);

  return NextResponse.json({
    messages,
    stats: stats(),
  });
}

function parseLimit(raw: string | null): number {
  if (!raw) return 50;
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 50;
  return Math.min(1000, n);
}
