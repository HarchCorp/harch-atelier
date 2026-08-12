import { createZAI } from "@/lib/zai-wrapper";
// ═══════════════════════════════════════════════════════════════
//  POST /api/admin/whatsapp-import
//
//  KILLER FEATURE — WhatsApp conversation → AI-extracted account
//  creation form.
//
//  Flow:
//    1. Admin pastes a raw WhatsApp conversation text (often a forwarded
//       chat with a potential client).
//    2. The text is sent to GLM-4 via z-ai-web-dev-sdk with a strict
//       extraction prompt.
//    3. GLM-4 returns ONLY valid JSON:
//         {
//           "company_name":   string | null,
//           "contact_name":   string | null,
//           "email":          string | null,
//           "phone":          string | null,
//           "plan_tier":      "emergence" | "corporate" | "sovereign" | "custom" | null,
//           "pricing_mad":    number | null,        // monthly price in MAD
//           "topics":         string[],             // what they want monitored
//           "competitors":    string[],             // who they want tracked
//           "use_case":       string | null,        // free-form summary
//           "notes":          string | null         // anything else relevant
//         }
//    4. The structured data is returned to the admin UI, which fills
//       a review form (editable) and a second "Create Account" call
//       hits /api/admin/create-account.
//
//  Auth: admin only (session.user.role === "admin").
//
//  SERVER-SIDE ONLY — z-ai-web-dev-sdk is dynamically imported so
//  the bundler never ships it to a client component.
//
//  Task ID: ADMIN-1
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { logInfo, logError } from "@/lib/logger";
import { logAudit, extractIp, extractUserAgent } from "@/lib/harchiq/audit-log";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

// ─── TYPES ────────────────────────────────────────────────────────

export type PlanTier = "emergence" | "corporate" | "sovereign" | "custom";

export interface WhatsAppExtraction {
  company_name: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  plan_tier: PlanTier | null;
  pricing_mad: number | null;
  topics: string[];
  competitors: string[];
  use_case: string | null;
  notes: string | null;
}

interface ExtractionResponse {
  success: true;
  extraction: WhatsAppExtraction;
  rawConversationChars: number;
  model: string;
  generatedAt: string;
}

// ─── SYSTEM PROMPT ────────────────────────────────────────────────
//  Strict instructions — GLM-4 must return ONLY a JSON object. No
//  markdown fences, no prose, no leading/trailing text.

const SYSTEM_PROMPT = `You are an assistant that extracts structured information from WhatsApp conversations between a SaaS vendor (Harch Atelier — an AI Reputation Intelligence platform for Morocco & Africa) and a potential client.

Extract the following fields from the conversation:
- company_name: the prospect's company name (null if not mentioned)
- contact_name: the prospect's full name (null if not mentioned)
- email: the prospect's email address (null if not mentioned)
- phone: the prospect's phone number, including country code if present (null if not mentioned)
- plan_tier: the plan tier discussed. Must be one of: "emergence" (entry, ~15K MAD/mo), "corporate" (~40K MAD/mo), "sovereign" (~75K MAD/mo), "custom" (bespoke pricing). null if not discussed.
- pricing_mad: the monthly price discussed in Moroccan Dirham (MAD), as a number (e.g. 50000 for 50K). null if not discussed.
- topics: an array of topics the prospect wants monitored (e.g. ["brand reputation", "ESG narrative", "boycott risk"]). Empty array if none mentioned.
- competitors: an array of competitor names the prospect wants tracked (e.g. ["Attijariwafa", "Bank of Africa"]). Empty array if none mentioned.
- use_case: a 1-2 sentence summary of what the prospect wants to achieve with Harch Atelier. null if unclear.
- notes: any other relevant information (timeline, decision-makers, constraints, next steps). null if nothing notable.

Rules:
- Return ONLY valid JSON. No markdown fences, no prose, no leading or trailing text.
- If a field is not mentioned in the conversation, set it to null (or empty array for topics/competitors).
- Normalize phone numbers to international format if possible.
- Normalize email addresses to lowercase.
- For topics and competitors, deduplicate and trim whitespace. Each entry should be a short label (max 60 chars).
- Do NOT invent information. If something is ambiguous, set the field to null and add a note in "notes".`;

// ─── HELPERS ──────────────────────────────────────────────────────

function safeString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function safeNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v) && v >= 0) return Math.round(v);
  if (typeof v === "string") {
    // Accept "50000", "50K", "50,000", "50 000"
    const cleaned = v.replace(/[,\s]/g, "").replace(/k$/i, "000");
    const n = Number(cleaned);
    if (Number.isFinite(n) && n >= 0) return Math.round(n);
  }
  return null;
}

function safeStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  const out: string[] = [];
  for (const item of v) {
    const s = safeString(item);
    if (s && s.length <= 80 && !out.includes(s)) out.push(s);
  }
  return out.slice(0, 30); // cap to 30 entries
}

function normalizePlanTier(v: unknown): PlanTier | null {
  const s = safeString(v).toLowerCase();
  if (!s) return null;
  if (s.includes("emerg") || s.includes("starter") || s.includes("entry")) return "emergence";
  if (s.includes("corporate") || s.includes("pro") || s.includes("business")) return "corporate";
  if (s.includes("sovereign") || s.includes("enterprise") || s.includes("premium")) return "sovereign";
  if (s.includes("custom") || s.includes("bespoke") || s.includes("tailored")) return "custom";
  return null;
}

function extractJsonFromText(raw: string): unknown {
  // GLM-4 sometimes wraps JSON in markdown fences despite instructions.
  // Strip them. Also handle the case where the model prepends prose.
  let text = raw.trim();

  // Remove ```json ... ``` fences
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  // Find the first { and the last } — extract that slice.
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No JSON object found in LLM response");
  }
  const jsonSlice = text.slice(firstBrace, lastBrace + 1);

  try {
    return JSON.parse(jsonSlice);
  } catch (err) {
    throw new Error(
      `Failed to parse JSON: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

function coerceExtraction(parsed: unknown): WhatsAppExtraction {
  if (!parsed || typeof parsed !== "object") {
    throw new Error("LLM returned a non-object");
  }
  const obj = parsed as Record<string, unknown>;
  return {
    company_name: safeString(obj.company_name) || null,
    contact_name: safeString(obj.contact_name) || null,
    email: safeString(obj.email).toLowerCase() || null,
    phone: safeString(obj.phone) || null,
    plan_tier: normalizePlanTier(obj.plan_tier),
    pricing_mad: safeNumber(obj.pricing_mad),
    topics: safeStringArray(obj.topics),
    competitors: safeStringArray(obj.competitors),
    use_case: safeString(obj.use_case) || null,
    notes: safeString(obj.notes) || null,
  };
}

// ─── ROUTE HANDLER ────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. AUTH — admin only.
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin" && session.user?.role !== "super_admin") {
    return NextResponse.json(
      { error: "Forbidden — admin only" },
      { status: 403 },
    );
  }

  const adminId = session.user?.id;

  // 2. BODY VALIDATION
  let conversation: string;
  try {
    const body = await req.json();
    conversation = typeof body.conversation === "string" ? body.conversation.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (conversation.length < 30) {
    return NextResponse.json(
      { error: "Conversation too short — paste at least 30 characters." },
      { status: 400 },
    );
  }
  if (conversation.length > 20000) {
    return NextResponse.json(
      { error: "Conversation too long — max 20,000 characters." },
      { status: 413 },
    );
  }

  // 3. CALL GLM-4 via z-ai-web-dev-sdk (SERVER-SIDE ONLY).
  //    The SDK is dynamically imported so it never ends up in a client bundle.
  const userPrompt = `Extract the structured information from the following WhatsApp conversation. Return ONLY a JSON object.

WHATSAPP CONVERSATION:
"""
${conversation}
"""

Remember: return ONLY valid JSON, no markdown, no prose.`;

  let rawText = "";
  const modelName = "glm-4";
  try {
    const zai = await createZAI();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2, // low temp — extraction should be deterministic
      max_tokens: 1500,
      thinking: { type: "disabled" as const },
    });
    rawText = completion?.choices?.[0]?.message?.content ?? "";
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError("admin.whatsapp-import", `LLM call failed: ${msg}`);
    return NextResponse.json(
      { error: "AI extraction failed", detail: msg },
      { status: 502 },
    );
  }

  if (!rawText.trim()) {
    logError("admin.whatsapp-import", "LLM returned an empty response");
    return NextResponse.json(
      { error: "AI returned an empty response — try again." },
      { status: 502 },
    );
  }

  // 4. PARSE + COERCE
  let extraction: WhatsAppExtraction;
  try {
    const parsed = extractJsonFromText(rawText);
    extraction = coerceExtraction(parsed);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError("admin.whatsapp-import", `JSON parse failed: ${msg}`);
    return NextResponse.json(
      {
        error: "Failed to parse AI response",
        detail: msg,
        rawPreview: rawText.slice(0, 500),
      },
      { status: 502 },
    );
  }

  // 5. AUDIT LOG — the admin probed a conversation through the LLM.
  //    Loi 09-08 / CNDP compliance — every AI call is traceable.
  await logAudit({
    userId: adminId,
    action: "ai_probe",
    resource: "admin:whatsapp-import",
    result: "success",
    ipAddress: extractIp(req),
    userAgent: extractUserAgent(req),
    metadata: {
      conversationChars: conversation.length,
      extractedCompany: extraction.company_name,
      extractedEmail: extraction.email,
      planTier: extraction.plan_tier,
      pricingMAD: extraction.pricing_mad,
      topicsCount: extraction.topics.length,
      competitorsCount: extraction.competitors.length,
    },
  });

  logInfo(
    "admin.whatsapp-import",
    `Extraction complete — company=${extraction.company_name ?? "?"}, email=${extraction.email ?? "?"}, plan=${extraction.plan_tier ?? "?"}`,
  );

  const response: ExtractionResponse = {
    success: true,
    extraction,
    rawConversationChars: conversation.length,
    model: modelName,
    generatedAt: new Date().toISOString(),
  };

  return NextResponse.json(response);
}
