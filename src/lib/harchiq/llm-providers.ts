// ═══════════════════════════════════════════════════════════════
//  HARCHIQ — LLM Providers for AI Visibility probing
//
//  Each provider wraps a real LLM API (OpenAI, Anthropic, Gemini, …).
//  A provider is "available" when its API key is present in process.env.
//  When unavailable, ai-probe.ts falls back to the HarchIQ-LLM (z-ai SDK)
//  to *simulate* that engine via system-prompt variation — flagged
//  `simulated: true` so the UI never misleads the user.
//
//  All HTTP calls use the native `fetch` (Node 18+, Vercel Edge-ready).
//  No extra npm dependencies are installed — keeping the bundle lean.
//
//  Conventions:
//    • Every provider returns a plain string (the model's text output).
//    • On any error (401, 429, 500, timeout, malformed JSON), the
//      provider THROWS — ai-probe.ts catches and falls back to simulation.
//    • Each provider picks a sensible default model (fast + cheap) so
//      a probe run (8 engines × 10 queries = 80 calls) costs < $0.20.
//
//  SERVER-SIDE ONLY — never import this from a client component.
// ═══════════════════════════════════════════════════════════════

import { logInfo } from "@/lib/logger";

// ─── Types ──────────────────────────────────────────────────────

export interface LLMProvider {
  /** Stable identifier (matches EngineSpec.providerKey). */
  readonly key: string;
  /** True when the API key is present in process.env. */
  isAvailable(): boolean;
  /** Human-readable reason when unavailable (for logs/debug). */
  unavailabilityReason(): string;
  /** Make a real LLM call. Throws on any error. */
  call(
    systemPrompt: string,
    userQuery: string,
    temperature: number,
  ): Promise<string>;
}

// ─── Helpers ────────────────────────────────────────────────────

/** Fetch with a hard timeout — aborts via AbortController so a
 *  stalled upstream can't hang the whole probe batch. */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

/** Extract text from an OpenAI-compatible chat completion response. */
function extractOpenAIChoice(json: unknown): string {
  const j = json as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };
  const text = j?.choices?.[0]?.message?.content;
  if (typeof text !== "string") {
    throw new Error(`Malformed OpenAI response: ${JSON.stringify(json).slice(0, 200)}`);
  }
  return text;
}

// ─── OpenAI (ChatGPT) ───────────────────────────────────────────

class OpenAIProvider implements LLMProvider {
  readonly key = "openai";
  private apiKey = process.env.OPENAI_API_KEY ?? "";
  private model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  isAvailable(): boolean {
    return this.apiKey.length > 0;
  }
  unavailabilityReason(): string {
    return "OPENAI_API_KEY not set in environment";
  }
  async call(system: string, user: string, temperature: number): Promise<string> {
    const res = await fetchWithTimeout(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          temperature,
          max_tokens: 600,
        }),
      },
      20_000,
    );
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`OpenAI ${res.status}: ${errText.slice(0, 200)}`);
    }
    return extractOpenAIChoice(await res.json());
  }
}

// ─── Anthropic (Claude) ─────────────────────────────────────────

class AnthropicProvider implements LLMProvider {
  readonly key = "anthropic";
  private apiKey = process.env.ANTHROPIC_API_KEY ?? "";
  private model = process.env.ANTHROPIC_MODEL ?? "claude-3-5-sonnet-20241022";

  isAvailable(): boolean {
    return this.apiKey.length > 0;
  }
  unavailabilityReason(): string {
    return "ANTHROPIC_API_KEY not set in environment";
  }
  async call(system: string, user: string, temperature: number): Promise<string> {
    const res = await fetchWithTimeout(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 600,
          temperature,
          system,
          messages: [{ role: "user", content: user }],
        }),
      },
      20_000,
    );
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Anthropic ${res.status}: ${errText.slice(0, 200)}`);
    }
    const json = (await res.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    const text = json.content?.find((c) => c.type === "text")?.text;
    if (typeof text !== "string") {
      throw new Error(`Malformed Anthropic response: ${JSON.stringify(json).slice(0, 200)}`);
    }
    return text;
  }
}

// ─── Google Gemini ──────────────────────────────────────────────

class GeminiProvider implements LLMProvider {
  readonly key = "gemini";
  private apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? "";
  private model = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";

  isAvailable(): boolean {
    return this.apiKey.length > 0;
  }
  unavailabilityReason(): string {
    return "GEMINI_API_KEY (or GOOGLE_API_KEY) not set in environment";
  }
  async call(system: string, user: string, temperature: number): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const res = await fetchWithTimeout(
      url,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: user }] }],
          generationConfig: { temperature, maxOutputTokens: 600 },
        }),
      },
      20_000,
    );
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Gemini ${res.status}: ${errText.slice(0, 200)}`);
    }
    const json = (await res.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== "string") {
      throw new Error(`Malformed Gemini response: ${JSON.stringify(json).slice(0, 200)}`);
    }
    return text;
  }
}

// ─── Perplexity ─────────────────────────────────────────────────

class PerplexityProvider implements LLMProvider {
  readonly key = "perplexity";
  private apiKey = process.env.PERPLEXITY_API_KEY ?? "";
  private model = process.env.PERPLEXITY_MODEL ?? "sonar";

  isAvailable(): boolean {
    return this.apiKey.length > 0;
  }
  unavailabilityReason(): string {
    return "PERPLEXITY_API_KEY not set in environment";
  }
  async call(system: string, user: string, temperature: number): Promise<string> {
    const res = await fetchWithTimeout(
      "https://api.perplexity.ai/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          temperature,
          max_tokens: 600,
        }),
      },
      20_000,
    );
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Perplexity ${res.status}: ${errText.slice(0, 200)}`);
    }
    return extractOpenAIChoice(await res.json());
  }
}

// ─── Microsoft Copilot (Azure OpenAI) ───────────────────────────
// Copilot doesn't have a direct public API, but Azure OpenAI deployments
// are the standard enterprise path. We require three env vars:
//   AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_DEPLOYMENT
// When all three are set, this provider routes to the deployment URL.

class CopilotProvider implements LLMProvider {
  readonly key = "copilot";
  private apiKey = process.env.AZURE_OPENAI_API_KEY ?? "";
  private endpoint = process.env.AZURE_OPENAI_ENDPOINT ?? "";
  private deployment = process.env.AZURE_OPENAI_DEPLOYMENT ?? "";
  private apiVersion = process.env.AZURE_OPENAI_API_VERSION ?? "2024-06-01";

  isAvailable(): boolean {
    return (
      this.apiKey.length > 0 &&
      this.endpoint.length > 0 &&
      this.deployment.length > 0
    );
  }
  unavailabilityReason(): string {
    return "AZURE_OPENAI_API_KEY + AZURE_OPENAI_ENDPOINT + AZURE_OPENAI_DEPLOYMENT not all set";
  }
  async call(system: string, user: string, temperature: number): Promise<string> {
    // endpoint is like "https://my-resource.openai.azure.com/" (trailing slash optional)
    const base = this.endpoint.replace(/\/+$/, "");
    const url = `${base}/openai/deployments/${this.deployment}/chat/completions?api-version=${this.apiVersion}`;
    const res = await fetchWithTimeout(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": this.apiKey,
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          temperature,
          max_tokens: 600,
        }),
      },
      20_000,
    );
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Azure OpenAI ${res.status}: ${errText.slice(0, 200)}`);
    }
    return extractOpenAIChoice(await res.json());
  }
}

// ─── Mistral ────────────────────────────────────────────────────

class MistralProvider implements LLMProvider {
  readonly key = "mistral";
  private apiKey = process.env.MISTRAL_API_KEY ?? "";
  private model = process.env.MISTRAL_MODEL ?? "mistral-small-latest";

  isAvailable(): boolean {
    return this.apiKey.length > 0;
  }
  unavailabilityReason(): string {
    return "MISTRAL_API_KEY not set in environment";
  }
  async call(system: string, user: string, temperature: number): Promise<string> {
    const res = await fetchWithTimeout(
      "https://api.mistral.ai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          temperature,
          max_tokens: 600,
        }),
      },
      20_000,
    );
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Mistral ${res.status}: ${errText.slice(0, 200)}`);
    }
    return extractOpenAIChoice(await res.json());
  }
}

// ─── Grok (xAI) ─────────────────────────────────────────────────

class GrokProvider implements LLMProvider {
  readonly key = "grok";
  private apiKey = process.env.XAI_API_KEY ?? process.env.GROK_API_KEY ?? "";
  private model = process.env.XAI_MODEL ?? "grok-2-1212";

  isAvailable(): boolean {
    return this.apiKey.length > 0;
  }
  unavailabilityReason(): string {
    return "XAI_API_KEY (or GROK_API_KEY) not set in environment";
  }
  async call(system: string, user: string, temperature: number): Promise<string> {
    const res = await fetchWithTimeout(
      "https://api.x.ai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          temperature,
          max_tokens: 600,
        }),
      },
      20_000,
    );
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`xAI Grok ${res.status}: ${errText.slice(0, 200)}`);
    }
    return extractOpenAIChoice(await res.json());
  }
}

// ─── Llama (via Groq — fast + free tier) ────────────────────────
// Meta doesn't run a hosted Llama API. Groq is the standard fast path.

class LlamaProvider implements LLMProvider {
  readonly key = "llama";
  private apiKey = process.env.GROQ_API_KEY ?? "";
  private model = process.env.GROQ_MODEL ?? "llama-3.1-8b-instant";

  isAvailable(): boolean {
    return this.apiKey.length > 0;
  }
  unavailabilityReason(): string {
    return "GROQ_API_KEY not set in environment (Llama is served via Groq)";
  }
  async call(system: string, user: string, temperature: number): Promise<string> {
    const res = await fetchWithTimeout(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          temperature,
          max_tokens: 600,
        }),
      },
      20_000,
    );
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Groq (Llama) ${res.status}: ${errText.slice(0, 200)}`);
    }
    return extractOpenAIChoice(await res.json());
  }
}

// ─── HarchIQ-LLM (z-ai SDK — the in-house real engine) ──────────

class HarchIQProvider implements LLMProvider {
  readonly key = "harchiq";

  isAvailable(): boolean {
    // The z-ai SDK reads its key from ZAI_API_KEY at create() time.
    // We treat it as always available — if the SDK throws at call time,
    // ai-probe.ts falls back to the deterministic stub.
    return true;
  }
  unavailabilityReason(): string {
    return "z-ai SDK failed to initialize (check ZAI_API_KEY)";
  }
  async call(system: string, user: string, temperature: number): Promise<string> {
    const ZAI = (await import("z-ai-web-dev-sdk")).default;
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature,
      max_tokens: 600,
      thinking: { type: "disabled" as const },
    });
    const text = completion?.choices?.[0]?.message?.content ?? "";
    if (!text) {
      throw new Error("HarchIQ-LLM returned empty content");
    }
    return text;
  }
}

// ─── Provider registry ──────────────────────────────────────────

export const PROVIDERS: Record<string, LLMProvider> = {
  openai: new OpenAIProvider(),
  anthropic: new AnthropicProvider(),
  gemini: new GeminiProvider(),
  perplexity: new PerplexityProvider(),
  copilot: new CopilotProvider(),
  mistral: new MistralProvider(),
  grok: new GrokProvider(),
  llama: new LlamaProvider(),
  harchiq: new HarchIQProvider(),
};

/** Returns the provider for a key, or null when unknown. */
export function getProvider(key: string | undefined): LLMProvider | null {
  if (!key) return null;
  return PROVIDERS[key] ?? null;
}

/** Returns true when at least one of the real LLM providers (besides
 *  HarchIQ-LLM) has its API key configured. Used by the probe summary
 *  to set a "live multi-engine" flag. */
export function anyRealProviderAvailable(): boolean {
  for (const key of Object.keys(PROVIDERS)) {
    if (key === "harchiq") continue;
    if (PROVIDERS[key].isAvailable()) return true;
  }
  return false;
}

/** Log which providers are available — useful for debugging the
 *  "why is everything simulated?" case. Called once per probe run. */
export function logProviderAvailability(): void {
  const status: string[] = [];
  for (const key of Object.keys(PROVIDERS)) {
    const p = PROVIDERS[key];
    status.push(`${key}=${p.isAvailable() ? "available" : "missing"}`);
  }
  logInfo("llm-providers", `Provider availability: ${status.join(", ")}`);
}
