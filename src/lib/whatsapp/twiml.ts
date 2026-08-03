// ═══════════════════════════════════════════════════════════════
//  HARCH ATELIER — TwiML helpers (WhatsApp inbound)
//
//  Twilio's WhatsApp sandbox + production numbers POST to our
//  webhook and expect a TwiML (XML) response back so the sender's
//  phone shows a confirmation bubble. These helpers build those
//  TwiML responses for two stages:
//
//    1. Receipt — sent synchronously the moment a webhook arrives.
//       "Reçu. Analyse en cours. Réponse dans 60 secondes."
//
//    2. Analysis — sent asynchronously (fire-and-forget via the
//       outbound `sendWhatsAppMessage` helper) once the NLP
//       pipeline has produced a verdict. Tailored to severity:
//         critical → "⚠️ Alerte critique détectée. Notre équipe
//                     analyse. Réponse complète dans 5 minutes."
//         normal   → "✓ Reçu et analysé. Sentiment neutre. Aucune
//                     action requise."
//
//  Why TwiML (not JSON)? Twilio's webhook contract is:
//    Content-Type: text/xml (or application/xml)
//    Body:          <Response>...</Response>
//  Returning JSON would make Twilio log a 502.
//
//  Task ID: BRICK-2-whatsapp-inbound
// ═══════════════════════════════════════════════════════════════

// ─── XML escaping (defensive — never trust user input) ────────────

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ─── 1. Receipt response ─────────────────────────────────────────
//
//  Sent synchronously to Twilio. Acknowledges the inbound message
//  and tells the sender a full analysis is coming. The original
//  message is echoed back (truncated) so the sender can confirm
//  Harch received the right thing — that's the "user-feels-they-
//  put-the-data-in" loop the founder described.
//
//  `originalMessage` is the sender's text (already sanitized by the
//  NLP prompt-injection scanner upstream). We truncate to 80 chars
//  so the bubble stays under WhatsApp's preview limit.

export function buildReceiptResponse(originalMessage: string): string {
  const snippet =
    originalMessage && originalMessage.trim().length > 0
      ? escapeXml(originalMessage.slice(0, 80))
      : "";
  const echoLine = snippet ? `<Message>Reçu : « ${snippet}… »</Message>` : "";
  // Receipt body: French (Moroccan Dircom's working language), with
  // a clear promise of the follow-up timing.
  const receiptBody =
    "Harch Atelier — Reçu. Analyse en cours. Réponse dans 60 secondes.";
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${echoLine}<Message>${escapeXml(
    receiptBody,
  )}</Message></Response>`;
}

// ─── 2. Analysis response ────────────────────────────────────────
//
//  Sent asynchronously via the outbound `sendWhatsAppMessage`
//  helper (not as a TwiML response — Twilio only accepts TwiML
//  synchronously in response to a webhook). This is the second
//  WhatsApp message the Dircom receives: the actual risk verdict.
//
//  Severity buckets (mirrors the resilience matrix / cron-alerts):
//    crisisScore >= 75  → critical
//    crisisScore >= 45  → elevated (warning)
//    crisisScore >= 15  → mild
//    crisisScore <  15  → normal
//
//  Returns the body text (plain UTF-8) for the outbound message.
//  Also exposes a TwiML wrapper for cases where the caller wants
//  to bundle the analysis into a synchronous webhook response.

export interface AnalysisSummary {
  sentiment: number; // -1..+1
  sarcasmDetected: boolean;
  injectionDetected: boolean;
  crisisScore: number; // 0..100
}

export type AnalysisSeverity = "critical" | "warning" | "mild" | "normal";

export function severityFromCrisisScore(crisisScore: number): AnalysisSeverity {
  if (crisisScore >= 75) return "critical";
  if (crisisScore >= 45) return "warning";
  if (crisisScore >= 15) return "mild";
  return "normal";
}

interface SeverityCopy {
  body: string;
  twimlMessage: string;
}

const SEVERITY_COPY: Record<AnalysisSeverity, SeverityCopy> = {
  critical: {
    body:
      "⚠️ Harch Atelier — Alerte critique détectée.\n\n" +
      "Notre équipe crise analyse le contenu et le contexte. " +
      "Réponse complète dans 5 minutes maximum.\n\n" +
      "Ne pas relayer le contenu en l'état. Préparer un holding statement.",
    twimlMessage:
      "⚠️ Alerte critique détectée. Notre équipe analyse. Réponse complète dans 5 minutes.",
  },
  warning: {
    body:
      "🔶 Harch Atelier — Signalement modéré.\n\n" +
      "Sentiment négatif détecté. Surveillance renforcée activée. " +
      "Synthèse détaillée envoyée au tableau de bord.",
    twimlMessage:
      "🔶 Signalement modéré. Sentiment négatif détecté. Surveillance renforcée activée.",
  },
  mild: {
    body:
      "Harch Atelier — Reçu et analysé.\n\n" +
      "Léger signal négatif détecté. Ajouté au flux de veille. " +
      "Aucune action immédiate requise.",
    twimlMessage:
      "Reçu et analysé. Léger signal négatif. Aucune action immédiate requise.",
  },
  normal: {
    body:
      "✓ Harch Atelier — Reçu et analysé.\n\n" +
      "Sentiment neutre. Aucune action requise.\n\n" +
      "Merci de votre veille.",
    twimlMessage:
      "✓ Reçu et analysé. Sentiment neutre. Aucune action requise.",
  },
};

/**
 * Returns the outbound WhatsApp body text for the analysis,
 * tailored to the severity bucket. This is what gets sent via
 * `sendWhatsAppMessage` in the fire-and-forget follow-up.
 */
export function buildAnalysisBody(analysis: AnalysisSummary): string {
  // Prompt-injection attempts always get the critical track —
  // they're explicitly blocked at the NLP layer and we want the
  // Dircom to know someone tried to manipulate the system.
  if (analysis.injectionDetected) {
    return (
      "⚠️ Harch Atelier — Tentative de manipulation détectée.\n\n" +
      "Le message entrant contenait un motif d'injection de prompt. " +
      "Il a été bloqué et n'a pas été transmis au moteur d'analyse. " +
      "Aucune action de votre part requise."
    );
  }
  const severity = severityFromCrisisScore(analysis.crisisScore);
  return SEVERITY_COPY[severity].body;
}

/**
 * Returns a TwiML <Response> wrapping the analysis summary message.
 * Used when the caller wants to bundle the analysis into a
 * synchronous webhook response (rare — usually we send the analysis
 * as a separate outbound message via `sendWhatsAppMessage`).
 */
export function buildAnalysisResponse(analysis: AnalysisSummary): string {
  const severity = analysis.injectionDetected
    ? "critical"
    : severityFromCrisisScore(analysis.crisisScore);
  const message =
    analysis.injectionDetected
      ? "⚠️ Tentative de manipulation détectée. Message bloqué."
      : SEVERITY_COPY[severity].twimlMessage;
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(
    message,
  )}</Message></Response>`;
}

// ─── 3. Error response (still valid TwiML) ───────────────────────
//
//  Twilio will retry a webhook that returns a non-2xx, but if we
//  return 2xx with an empty TwiML body the sender gets no bubble.
//  This helper builds a "something went wrong" TwiML response so
//  the Dircom knows the message didn't silently disappear.

export function buildErrorResponse(detail?: string): string {
  const safe = detail ? escapeXml(detail.slice(0, 120)) : "Erreur interne.";
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Message>Harch Atelier — ${safe} Notre équipe a été notifiée.</Message></Response>`;
}
