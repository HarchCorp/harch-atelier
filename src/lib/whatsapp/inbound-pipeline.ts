// ═══════════════════════════════════════════════════════════════
//  HARCH ATELIER — WhatsApp inbound NLP pipeline (shared)
//
//  Pure functions used by both:
//    • /api/whatsapp/inbound   (real Twilio webhook, x-www-form-urlencoded)
//    • /api/whatsapp/simulate  (demo endpoint, JSON body, session-authed)
//
//  Centralizing here means the analysis logic is identical whether
//  a message came from a real Dircom's phone or the lab page's
//  "Simulate" button. This is the IKEA-effect loop: the Dircom
//  forwarded something they saw on their phone → Harch analyzes it
//  → returns a verdict they can act on.
//
//  Pipeline:
//    1. Classify message type (text | image | link | unknown)
//    2. Run prompt-injection sanitizer FIRST (Case 029)
//       • If blocked → flag critical, store sanitized body, return
//    3. Run sentiment + sarcasm (Case 021/022/023/027) on the text
//    4. Run Darija language detection (harchiq/darija)
//    5. Run fakeness scoring (Case 030)
//    6. Compute crisisScore (0..100) from sentiment + fakeness + crisis keywords
//    7. Persist to the inbound store, fire-and-forget outbound reply
//
//  Task ID: BRICK-2-whatsapp-inbound
// ═══════════════════════════════════════════════════════════════

import {
  analyzeSentiment,
  scanPromptInjection,
  scoreFakeness,
  type InjectionScanResult,
} from "@/lib/resilience/nlp";
import { detectLanguage } from "@/lib/harchiq/darija";
import {
  CRISIS_KEYWORDS,
} from "@/lib/harchiq/crisis-detector";
import {
  add,
  updateAnalysis,
  flagCritical,
  type InboundAnalysis,
  type InboundMessage,
  type InboundMessageType,
} from "@/lib/whatsapp/inbound-store";
import {
  buildAnalysisBody,
  severityFromCrisisScore,
  type AnalysisSummary,
} from "@/lib/whatsapp/twiml";
import { sendWhatsAppMessage } from "@/lib/whatsapp/twilio";

// ─── URL extraction (for link-type messages) ─────────────────────

const URL_RE = /https?:\/\/[^\s<>"')]+/i;

export function extractFirstUrl(text: string): string | null {
  if (!text) return null;
  const m = text.match(URL_RE);
  return m ? m[0] : null;
}

// ─── Message type classification ─────────────────────────────────

export interface ClassifyResult {
  type: InboundMessageType;
  mediaUrl: string | null;
  mediaContentType: string | null;
  extractedUrl: string | null;
}

export function classifyMessage(
  body: string,
  mediaUrl?: string | null,
  mediaContentType?: string | null,
): ClassifyResult {
  // Image / video / audio takes priority — the body, when present,
  // is the caption.
  if (mediaUrl && mediaContentType) {
    if (mediaContentType.startsWith("image/")) {
      return {
        type: "image",
        mediaUrl,
        mediaContentType,
        extractedUrl: extractFirstUrl(body),
      };
    }
    // Non-image media (audio/video/PDF) — treat as image-type for
    // the store's purposes (manual-review queue). The UI will badge
    // it generically.
    return {
      type: "image",
      mediaUrl,
      mediaContentType,
      extractedUrl: extractFirstUrl(body),
    };
  }
  // No media — text or link.
  const url = extractFirstUrl(body);
  if (url) {
    return {
      type: "link",
      mediaUrl: null,
      mediaContentType: null,
      extractedUrl: url,
    };
  }
  return {
    type: body && body.trim() ? "text" : "unknown",
    mediaUrl: null,
    mediaContentType: null,
    extractedUrl: null,
  };
}

// ─── Crisis score computation ────────────────────────────────────
//
//  Maps sentiment (-1..+1) + fakeness (0..1) + crisis keyword hits
//  to a 0..100 crisis score. The buckets mirror the resilience
//  matrix + the cron-alerts severityFromScore:
//
//    score >= 75  → critical   (red)
//    score >= 45  → warning    (amber)
//    score >= 15  → mild       (light amber)
//    score <  15  → normal     (neutral)
//
//  This is intentionally simpler than `detectCrisis()` in
//  harchiq/crisis-detector.ts — that one works on ARRAYS of alerts
//  over a 24h window with baseline comparison. Here we have a
//  single message and need a single-shot verdict.

export interface CrisisComputation {
  score: number; // 0..100
  level: "normal" | "mild" | "warning" | "critical";
  matchedKeywords: string[];
}

export function computeCrisisScore(
  sentiment: number,
  fakeness: number,
  text: string,
): CrisisComputation {
  // 1. Sentiment contribution (0..60)
  //    sentiment -1.0 → 60, -0.6 → 36, -0.3 → 18, 0 → 0, +1 → 0
  const sentimentComponent = Math.max(0, -sentiment) * 60;

  // 2. Fakeness contribution (0..20)
  const fakenessComponent = fakeness * 20;

  // 3. Crisis keyword contribution (0..20)
  //    1 keyword → 8, 2 → 14, 3+ → 20
  const lower = (text ?? "").toLowerCase();
  const matched: string[] = [];
  for (const kw of CRISIS_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) {
      matched.push(kw);
    }
  }
  const keywordComponent = Math.min(20, matched.length * 8);

  const raw = sentimentComponent + fakenessComponent + keywordComponent;
  const score = Math.max(0, Math.min(100, Math.round(raw)));
  const level: CrisisComputation["level"] =
    score >= 75 ? "critical" : score >= 45 ? "warning" : score >= 15 ? "mild" : "normal";
  return { score, level, matchedKeywords: matched };
}

// ─── Full pipeline entry point ───────────────────────────────────

export interface PipelineInput {
  from: string; // E.164 (whatsapp:+...)
  fromName?: string | null;
  to?: string | null;
  body: string;
  mediaUrl?: string | null;
  mediaContentType?: string | null;
  twilioMessageSid?: string | null;
  twilioWaId?: string | null;
  isDemo?: boolean;
}

export interface PipelineResult {
  message: InboundMessage;
  analysis: InboundAnalysis;
  injection: InjectionScanResult;
  /** The outbound body text that should be sent back to the sender. */
  outboundBody: string;
  /** Whether the message was flagged critical (don't auto-respond). */
  isCritical: boolean;
}

/**
 * Run the full NLP + analysis pipeline on an inbound message.
 *
 *  Side effects:
 *    • Adds the message to the in-memory store (`add`).
 *    • Updates its analysis (`updateAnalysis`).
 *    • Flags critical if injection or crisisScore >= 75.
 *
 *  Does NOT send the outbound message — the caller decides whether
 *  to fire-and-forget (`sendOutboundFollowup`) or return the body
 *  to the client for display.
 */
export function runInboundPipeline(input: PipelineInput): PipelineResult {
  const body = input.body ?? "";
  const isDemo = input.isDemo === true;

  // 1. Classify
  const classify = classifyMessage(
    body,
    input.mediaUrl ?? null,
    input.mediaContentType ?? null,
  );

  // 2. Sanitize for prompt injection FIRST (Case 029)
  //    We always scan even image captions — captions get fed into
  //    the LLM later, so they need the same protection.
  const injection = scanPromptInjection(body);
  const sanitizedBody = injection.isInjection ? injection.sanitized : body;

  // 3. Insert into the store immediately with status "analyzing"
  //    so the lab feed shows the message even if the NLP step is
  //    slow (it isn't, but this is the right pattern). `analyzedAt`
  //    is null until `updateAnalysis()` runs.
  const message = add({
    from: input.from,
    fromName: input.fromName ?? null,
    to: input.to ?? null,
    body: sanitizedBody,
    mediaUrl: classify.mediaUrl,
    mediaContentType: classify.mediaContentType,
    messageType: classify.type,
    analyzedAt: null,
    analysis: null,
    status: "analyzing",
    twilioMessageSid: input.twilioMessageSid ?? null,
    twilioWaId: input.twilioWaId ?? null,
    isDemo,
  });

  // 4. If injection detected → critical flag, skip sentiment analysis
  //    (we don't want the injection payload influencing the lexicon).
  if (injection.isInjection) {
    const analysis: InboundAnalysis = {
      sentiment: 0,
      sentimentLabel: "neutral",
      sarcasmDetected: false,
      injectionDetected: true,
      fakenessScore: 0,
      crisisScore: 100,
      crisisLevel: "critical",
      language: "english",
      languageConfidence: 0.9,
      confidence: 0.95,
      signals: injection.threats.map(
        (t) => `INJECTION BLOCKED: ${t.label} (match: "${t.match}")`,
      ),
      extractedUrl: classify.extractedUrl,
    };
    const updated = updateAnalysis(message.id, analysis) ?? message;
    flagCritical(message.id);

    const outboundBody = buildAnalysisBody({
      sentiment: 0,
      sarcasmDetected: false,
      injectionDetected: true,
      crisisScore: 100,
    });
    return {
      message: updated,
      analysis,
      injection,
      outboundBody,
      isCritical: true,
    };
  }

  // 5. Run sentiment + sarcasm (on the sanitized body)
  const sentiment = analyzeSentiment(sanitizedBody);

  // 6. Run language detection (Darija-aware)
  const lang = detectLanguage(sanitizedBody);

  // 7. Run fakeness scoring
  const fakeness = scoreFakeness(sanitizedBody);

  // 8. Crisis score
  const crisis = computeCrisisScore(
    sentiment.score,
    fakeness.score,
    sanitizedBody,
  );

  const analysis: InboundAnalysis = {
    sentiment: Number(sentiment.score.toFixed(3)),
    sentimentLabel: sentiment.polarity,
    sarcasmDetected: sentiment.sarcasmDetected,
    injectionDetected: false,
    fakenessScore: Number(fakeness.score.toFixed(3)),
    crisisScore: crisis.score,
    crisisLevel: crisis.level,
    language: lang.language,
    languageConfidence: Number(lang.confidence.toFixed(2)),
    confidence: Number(sentiment.confidence.toFixed(2)),
    signals: [
      ...sentiment.signals,
      ...lang.markers.slice(0, 4).map((m) => `lang: ${m}`),
      ...crisis.matchedKeywords.map((k) => `crisis keyword: ${k}`),
    ].slice(0, 12),
    extractedUrl: classify.extractedUrl,
  };

  // 9. Persist the analysis
  const updated = updateAnalysis(message.id, analysis) ?? message;
  if (crisis.level === "critical") {
    flagCritical(message.id);
  }

  const summary: AnalysisSummary = {
    sentiment: analysis.sentiment,
    sarcasmDetected: analysis.sarcasmDetected,
    injectionDetected: false,
    crisisScore: analysis.crisisScore,
  };
  const outboundBody = buildAnalysisBody(summary);
  const isCritical = crisis.level === "critical";

  return {
    message: updated,
    analysis,
    injection,
    outboundBody,
    isCritical,
  };
}

// ─── Fire-and-forget outbound follow-up ──────────────────────────
//
//  In production (Twilio webhook), the caller invokes this AFTER
//  returning the synchronous TwiML receipt to Twilio. We can't
//  return a 2nd response to the same webhook — instead we call
//  `sendWhatsAppMessage` (the outbound helper) to send a follow-up
//  WhatsApp message to the original sender.
//
//  In demo mode (TWILIO_NOT_CONFIGURED), this is a no-op that
//  logs the would-be send — the Dircom's lab page shows the
//  analysis directly without needing the actual phone.

export async function sendOutboundFollowup(
  toPhone: string,
  outboundBody: string,
): Promise<{ sent: boolean; reason?: string; messageSid?: string }> {
  // Normalize: Twilio's From field is "whatsapp:+2126...". The
  // outbound helper accepts either form.
  const normalized = toPhone.startsWith("whatsapp:")
    ? toPhone
    : `whatsapp:${toPhone}`;
  const result = await sendWhatsAppMessage(normalized, outboundBody);
  return {
    sent: result.sent,
    reason: result.reason,
    messageSid: result.messageSid,
  };
}

// ─── Severity re-export (for callers that want the bucket label) ─

export { severityFromCrisisScore };
