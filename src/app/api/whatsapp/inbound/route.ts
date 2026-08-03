// ═══════════════════════════════════════════════════════════════
//  HARCH ATELIER — WhatsApp inbound webhook (Twilio)
//
//  POST /api/whatsapp/inbound
//
//  This is the endpoint Twilio hits when a WhatsApp user sends a
//  message to Harch's dedicated number (configured in the Twilio
//  console under Phone Numbers → WhatsApp Sandbox → "When a
//  message comes in").
//
//  Twilio POSTs the payload as `application/x-www-form-urlencoded`
//  with these fields (the ones we use):
//    • From                — "whatsapp:+2126XXXXXXX"
//    • To                  — "whatsapp:+14155238886"
//    • Body                — text body (empty for image-only)
//    • MediaUrl0           — Twilio-hosted image URL (24h TTL)
//    • MediaContentType0   — "image/jpeg"
//    • ProfileName         — sender's WhatsApp profile name
//    • WaId                 — sender's WhatsApp ID (phone, no prefix)
//    • MessageSid          — Twilio message SID
//    • NumMedia            — number of attached media items
//
//  Auth:
//    • If TWILIO_AUTH_TOKEN is set → validate the X-Twilio-Signature
//      header using Twilio's `validateRequest` helper. Reject 403
//      on mismatch.
//    • If TWILIO_AUTH_TOKEN is NOT set → dev-mode: accept any
//      request, but log a warning each time. This is the only way
//      the simulate endpoint and the demo page can exercise the
//      webhook without real Twilio credentials.
//
//  Response:
//    • 200 OK with Content-Type: text/xml — TwiML <Response> body
//      confirming receipt ("Reçu. Analyse en cours. Réponse dans
//      60 secondes.")
//    • 403 on signature failure
//    • 500 on internal error (returns TwiML error too, so Twilio
//      doesn't crash the sender's app)
//
//  After responding, we fire-and-forget an outbound WhatsApp
//  message to the sender with the analysis verdict. This is the
//  Dircom's "answer in 60 seconds" — same IKEA-effect loop.
//
//  Task ID: BRICK-2-whatsapp-inbound
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { runInboundPipeline, sendOutboundFollowup } from "@/lib/whatsapp/inbound-pipeline";
import { buildReceiptResponse, buildErrorResponse } from "@/lib/whatsapp/twiml";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
// Twilio expects a synchronous TwiML response within 15s. We run
// the NLP pipeline synchronously (it's pure JS, ~5ms) and the
// outbound follow-up is fire-and-forget so we never block on it.
export const maxDuration = 15;

// ─── Twilio signature validation ─────────────────────────────────
//
//  Twilio signs every webhook with HMAC-SHA1 over the URL + sorted
//  params, using the auth token as the key. The signature is in
//  the `X-Twilio-Signature` header (base64).
//
//  In dev mode (no TWILIO_AUTH_TOKEN in env), we skip validation
//  and log a one-line warning per request so the operator sees
//  the webhook is reachable but unauthenticated.

interface TwilioValidateResult {
  ok: boolean;
  reason: "validated" | "dev-mode" | "missing-header" | "mismatch";
  isDev: boolean;
}

async function validateTwilioSignature(
  req: NextRequest,
  params: Record<string, string>,
): Promise<TwilioValidateResult> {
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  // Dev mode — no token configured. Allow the request through.
  if (!authToken) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[whatsapp/inbound] DEV MODE: TWILIO_AUTH_TOKEN not set — " +
          "skipping signature validation. Set it in production to " +
          "enforce Twilio signature checks.",
      );
    }
    return { ok: true, reason: "dev-mode", isDev: true };
  }

  const signature = req.headers.get("x-twilio-signature");
  if (!signature) {
    return { ok: false, reason: "missing-header", isDev: false };
  }

  // Reconstruct the URL Twilio signed. We use the protocol + host
  // Twilio saw when it called us, which is what we configured in
  // the Twilio console. We can't trust req.url alone because the
  // Vercel/Next proxy can rewrite the protocol header.
  //
  // Heuristic: prefer x-forwarded-proto if present (Vercel sets
  // this), then fall back to req.nextUrl.protocol.
  const proto =
    req.headers.get("x-forwarded-proto") ??
    (req.nextUrl.protocol === "https:" ? "https" : "http");
  const host =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  const path = req.nextUrl.pathname;
  const fullUrl = `${proto}://${host}${path}`;

  try {
    // Dynamic import — twilio is a heavy Node-only SDK.
    const webhooks = (await import("twilio/lib/webhooks/webhooks")) as {
      validateRequest: (
        authToken: string,
        twilioHeader: string,
        url: string,
        params: Record<string, string>,
      ) => boolean;
    };
    const valid = webhooks.validateRequest(authToken, signature, fullUrl, params);
    return valid
      ? { ok: true, reason: "validated", isDev: false }
      : { ok: false, reason: "mismatch", isDev: false };
  } catch (err) {
    console.error("[whatsapp/inbound] signature validation error:", err);
    // Fail-closed in production: if we can't validate, reject.
    return { ok: false, reason: "mismatch", isDev: false };
  }
}

// ─── TwiML response helpers ──────────────────────────────────────

function twimlResponse(body: string, status = 200): NextResponse {
  return new NextResponse(body, {
    status,
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

// ─── POST handler ────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── 1. Parse the body as x-www-form-urlencoded (Twilio's format)
  let params: Record<string, string> = {};
  const contentType = req.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/x-www-form-urlencoded")) {
      // Next 16 / Web ReadableStream → text
      const text = await req.text();
      const sp = new URLSearchParams(text);
      params = Object.fromEntries(sp.entries());
    } else if (contentType.includes("application/json")) {
      // The /api/whatsapp/simulate endpoint posts JSON internally
      // for convenience. We accept it as a fallback.
      const json = (await req.json()) as Record<string, unknown>;
      for (const [k, v] of Object.entries(json)) {
        if (typeof v === "string") params[k] = v;
        else if (v !== null && v !== undefined) params[k] = String(v);
      }
    } else {
      // Best-effort: try form-urlencoded first, then JSON.
      const text = await req.text();
      try {
        const sp = new URLSearchParams(text);
        params = Object.fromEntries(sp.entries());
      } catch {
        return twimlResponse(
          buildErrorResponse("Unsupported content-type"),
          415,
        );
      }
    }
  } catch (err) {
    console.error("[whatsapp/inbound] body parse error:", err);
    return twimlResponse(buildErrorResponse("Body parse error"), 400);
  }

  // ── 2. Validate Twilio signature (or allow in dev mode)
  const validation = await validateTwilioSignature(req, params);
  if (!validation.ok) {
    console.warn(
      `[whatsapp/inbound] rejecting webhook: ${validation.reason}`,
    );
    return twimlResponse(buildErrorResponse("Signature invalide"), 403);
  }

  // ── 3. Extract Twilio fields
  const from = params["From"] ?? "";
  const to = params["To"] ?? "";
  const body = params["Body"] ?? "";
  const fromName = params["ProfileName"] ?? null;
  const waId = params["WaId"] ?? null;
  const messageSid = params["MessageSid"] ?? null;
  const mediaUrl = params["MediaUrl0"] ?? null;
  const mediaContentType = params["MediaContentType0"] ?? null;

  if (!from) {
    return twimlResponse(buildErrorResponse("Champ From manquant"), 400);
  }

  // ── 4. Run the NLP pipeline (synchronous, ~5ms for typical texts)
  let pipelineResult;
  try {
    pipelineResult = runInboundPipeline({
      from,
      fromName,
      to: to || null,
      body,
      mediaUrl,
      mediaContentType,
      twilioMessageSid: messageSid,
      twilioWaId: waId,
      isDemo: false,
    });
  } catch (err) {
    console.error("[whatsapp/inbound] pipeline crashed:", err);
    return twimlResponse(
      buildErrorResponse("Erreur d'analyse"),
      500,
    );
  }

  // ── 5. Respond synchronously to Twilio with the receipt TwiML
  //         (this is what the sender sees as the immediate reply).
  const receiptXml = buildReceiptResponse(body);

  // ── 6. Fire-and-forget the outbound analysis message.
  //         Not awaited — Twilio's webhook must return < 15s and
  //         the outbound send can take 200-2000ms (network latency
  //         to Twilio's API). In dev mode this is a no-op.
  void sendOutboundFollowup(from, pipelineResult.outboundBody).catch(
    (err) => {
      console.error("[whatsapp/inbound] outbound followup failed:", err);
    },
  );

  return twimlResponse(receiptXml);
}

// ─── GET (docs) ──────────────────────────────────────────────────

export async function GET() {
  return NextResponse.json({
    endpoint: "POST /api/whatsapp/inbound",
    description:
      "Twilio WhatsApp webhook receiver. Receives a WhatsApp message, " +
      "runs the Harch NLP pipeline (sentiment + sarcasm + injection + " +
      "fakeness + language), and responds with a TwiML receipt.",
    auth:
      "Twilio signature validation (X-Twilio-Signature header) when " +
      "TWILIO_AUTH_TOKEN is set. Dev-mode: no validation when the " +
      "token is missing (with a warning log).",
    contentType: "application/x-www-form-urlencoded (Twilio default)",
    fields: {
      From: "string — sender's WhatsApp address (whatsapp:+E.164)",
      To: "string — Harch's dedicated WhatsApp number",
      Body: "string — text body (may be empty for image-only)",
      MediaUrl0: "string? — Twilio-hosted image URL",
      MediaContentType0: "string? — e.g. image/jpeg",
      ProfileName: "string? — sender's WhatsApp profile name",
      WaId: "string? — sender's WhatsApp ID (phone digits only)",
      MessageSid: "string? — Twilio message SID",
      NumMedia: "string? — number of attached media items",
    },
    response:
      "200 OK with TwiML XML <Response><Message>Reçu. Analyse en cours. Réponse dans 60 secondes.</Message></Response>",
    sideEffects:
      "Stores the message + analysis in the in-memory inbound store. " +
      "Fire-and-forget sends an outbound WhatsApp message to the " +
      "sender with the verdict (severity-tailored body).",
    usedBy:
      "Twilio WhatsApp sandbox/production AND the demo page at " +
      "/atelier/lab/whatsapp-inbound (via the /api/whatsapp/simulate endpoint).",
  });
}
