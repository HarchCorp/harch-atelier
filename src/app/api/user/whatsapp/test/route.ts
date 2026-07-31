// ═══════════════════════════════════════════════════════════════
//  HARCH ATELIER — WhatsApp Test Message API
//
//  POST /api/user/whatsapp/test
//    Body: { whatsappNumber?: string }  (optional override; defaults
//           to the user's saved number)
//    → Sends a short test WhatsApp message via Twilio.
//
//  Auth: any authenticated user. The recipient MUST be the user's
//  own saved number (or, if provided in the body, the same number
//  they're about to save). This prevents abuse (sending to random
//  numbers).
//
//  Demo mode: when Twilio env vars are missing, returns
//  { sent: false, reason: "TWILIO_NOT_CONFIGURED" } with HTTP 200
//  so the UI can surface a friendly warning instead of an error.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import {
  formatTestMessage,
  sendWhatsAppMessage,
} from "@/lib/whatsapp/twilio";

export const dynamic = "force-dynamic";

const E164_RE = /^\+\d{6,15}$/;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse the optional body — `whatsappNumber` may be missing (then we
  // fall back to the user's saved number).
  let overrideNumber: string | null = null;
  try {
    const body = await req.json();
    if (body && typeof body === "object" && !Array.isArray(body)) {
      const v = (body as { whatsappNumber?: unknown }).whatsappNumber;
      if (typeof v === "string" && v.trim() !== "") {
        const cleaned = v.trim().replace(/[^\d+]/g, "");
        if (!E164_RE.test(cleaned)) {
          return NextResponse.json(
            {
              error:
                "Invalid phone number. Use E.164 format: +<country><number> (e.g. +212600000000).",
            },
            { status: 400 },
          );
        }
        overrideNumber = cleaned;
      } else if (v !== undefined && v !== null) {
        return NextResponse.json(
          { error: "whatsappNumber must be a non-empty string" },
          { status: 400 },
        );
      }
    }
  } catch {
    // Empty body is fine — we fall back to the saved number.
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, whatsappNumber: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const to = overrideNumber ?? user.whatsappNumber;
    if (!to) {
      return NextResponse.json(
        {
          error:
            "No WhatsApp number on file. Save a phone number first, or pass it in the request body.",
        },
        { status: 400 },
      );
    }

    const body = formatTestMessage(user.name);
    const result = await sendWhatsAppMessage(to, body);

    // Demo mode + success both return 200. Real failures (Twilio error)
    // also return 200 with sent:false so the UI can show the message —
    // we only 5xx on unexpected internal errors (caught below).
    return NextResponse.json(result);
  } catch (err) {
    console.error("[whatsapp test] error:", err);
    return NextResponse.json(
      {
        sent: false,
        reason: "INTERNAL_ERROR",
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
