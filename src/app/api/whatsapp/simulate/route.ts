// ═══════════════════════════════════════════════════════════════
//  HARCH ATELIER — WhatsApp inbound simulator
//
//  POST /api/whatsapp/simulate
//
//  Lets the /atelier/lab/whatsapp-inbound demo page simulate a
//  Twilio webhook WITHOUT requiring real Twilio credentials. The
//  caller (the lab page) sends a JSON body describing the inbound
//  WhatsApp message; this endpoint runs the same NLP pipeline as
//  the real webhook, stores the result, and returns the analysis.
//
//  Auth: NextAuth session required (demo accounts OK). This is the
//  same gate as /api/scrape/hespress-comments — only logged-in
//  users can simulate.
//
//  Difference vs /api/whatsapp/inbound:
//    • Accepts JSON (not form-urlencoded)
//    • Auth via session, not Twilio signature
//    • Returns JSON { message, analysis } (not TwiML XML)
//    • Does NOT fire-and-forget the outbound send (no real phone
//      to send to in the demo; the lab page displays the body inline)
//    • Marks the stored message with `isDemo: true` so the UI can
//      badge it as simulated (vs a real Twilio arrival)
//
//  Task ID: BRICK-2-whatsapp-inbound
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { isDemoEmail } from "@/lib/demo-session";
import { runInboundPipeline } from "@/lib/whatsapp/inbound-pipeline";
import { persistInboundMessage } from "@/lib/persistence";
import { get as getInboundMessage } from "@/lib/whatsapp/inbound-store";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ─── Body shape ──────────────────────────────────────────────────

interface SimulateBody {
  from?: unknown;
  fromName?: unknown;
  body?: unknown;
  mediaUrl?: unknown;
  mediaContentType?: unknown;
}

// ─── POST handler ────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── 1. AUTH — any logged-in user (real or demo)
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized — sign in to simulate a webhook" },
      { status: 401 },
    );
  }
  const isDemo = isDemoEmail(session.user.email);

  // ── 2. Parse + validate the JSON body
  let payload: SimulateBody;
  try {
    payload = (await req.json()) as SimulateBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // `from` is required — defaults to a sandbox-like address so the
  // Dircom can demo without typing one.
  const fromRaw = typeof payload.from === "string" ? payload.from.trim() : "";
  const from =
    fromRaw !== ""
      ? fromRaw.startsWith("whatsapp:")
        ? fromRaw
        : fromRaw.startsWith("+")
          ? `whatsapp:${fromRaw}`
          : `whatsapp:+${fromRaw.replace(/[^\d]/g, "")}`
      : "whatsapp:+212600000000";

  const fromName =
    typeof payload.fromName === "string" && payload.fromName.trim()
      ? payload.fromName.trim()
      : null;

  const body =
    typeof payload.body === "string" ? payload.body : "";

  const mediaUrl =
    typeof payload.mediaUrl === "string" && payload.mediaUrl.trim()
      ? payload.mediaUrl.trim()
      : null;

  // Default content-type if a media URL was supplied without one.
  const mediaContentType =
    typeof payload.mediaContentType === "string" && payload.mediaContentType.trim()
      ? payload.mediaContentType.trim()
      : mediaUrl
        ? "image/jpeg"
        : null;

  if (!body && !mediaUrl) {
    return NextResponse.json(
      { error: "Either `body` or `mediaUrl` must be provided" },
      { status: 400 },
    );
  }

  if (body.length > 4000) {
    return NextResponse.json(
      { error: "Body too long (max 4000 chars)" },
      { status: 400 },
    );
  }

  // ── 3. Run the pipeline (same code path as the real webhook)
  try {
    const result = runInboundPipeline({
      from,
      fromName,
      to: "whatsapp:+14155238886", // Twilio sandbox number — demo placeholder
      body,
      mediaUrl,
      mediaContentType,
      twilioMessageSid: `SIM_${Date.now().toString(36)}`,
      twilioWaId: from.replace(/[^\d]/g, ""),
      isDemo: true,
    });

    // Re-read from the store so we return the persisted shape
    // (including status, analyzedAt, etc.) rather than the
    // pipeline's intermediate result.
    const persisted = getInboundMessage(result.message.id) ?? result.message;

    // ─── PERSIST to local DB (Brique 5) ─────────────────────
    // Best-effort, fire-and-forget — never blocks the response.
    let dbPersisted = false;
    let dbError: string | undefined;
    try {
      const persistResult = await persistInboundMessage(persisted);
      dbPersisted = persistResult.persisted;
      dbError = persistResult.error;
    } catch (e) {
      dbError = e instanceof Error ? e.message : String(e);
    }

    return NextResponse.json({
      message: persisted,
      analysis: result.analysis,
      outboundBody: result.outboundBody,
      isCritical: result.isCritical,
      injection: {
        isInjection: result.injection.isInjection,
        threats: result.injection.threats,
        action: result.injection.action,
      },
      isDemo,
      dbPersisted,
      dbError,
      // The TwiML the real webhook would have returned — useful
      // for showing the "what Twilio would have seen" in the UI.
      twimlReceipt: `<?xml version="1.0" encoding="UTF-8"?><Response><Message>Reçu. Analyse en cours. Réponse dans 60 secondes.</Message></Response>`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logError("whatsapp.simulate", `[/api/whatsapp/simulate] pipeline crashed: ${message}`);
    return NextResponse.json(
      { error: "Pipeline crashed", message },
      { status: 500 },
    );
  }
}

// ─── GET (docs) ──────────────────────────────────────────────────

export async function GET() {
  return NextResponse.json({
    endpoint: "POST /api/whatsapp/simulate",
    description:
      "Simulate a Twilio WhatsApp webhook without real Twilio " +
      "credentials. Runs the same NLP pipeline as " +
      "/api/whatsapp/inbound and returns the analysis JSON.",
    auth: "NextAuth session required (demo-*@harch.atelier accounts OK)",
    body: {
      from: "string? — E.164 phone (defaults to +212600000000)",
      fromName: "string? — sender's display name",
      body: "string — text body (required unless mediaUrl is set)",
      mediaUrl: "string? — image URL (for screenshot simulation)",
      mediaContentType: "string? — e.g. image/jpeg (defaults to image/jpeg when mediaUrl is set)",
    },
    returns:
      "{ message: InboundMessage, analysis: InboundAnalysis, outboundBody: string, isCritical: boolean, injection: {...}, isDemo: boolean, twimlReceipt: string }",
  });
}
