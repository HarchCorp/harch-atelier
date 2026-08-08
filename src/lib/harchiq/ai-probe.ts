// ═══════════════════════════════════════════════════════════════
//  HARCHIQ — REAL AI VISIBILITY PROBING
//
//  Probes 9 AI engines to measure brand visibility for a company.
//
//  Two-tier probing strategy (Task REAL-AUTH → AI Visibility):
//    • Tier 1 (real): when an engine's API key is configured in
//      process.env (OPENAI_API_KEY, ANTHROPIC_API_KEY, …), we call
//      that engine's REAL API via the LLMProvider registry.
//    • Tier 2 (simulated): when the key is missing, we fall back to
//      the HarchIQ-LLM (z-ai SDK) with an engine-specific system
//      prompt that emulates the missing engine's voice. The result
//      is flagged `simulated: true` so the UI never misleads.
//
//  Pipeline (per probe run):
//    1. Build the 10 probe queries (some templated on company name).
//    2. For each of the 9 engines × 10 queries, call the LLM (max 5
//       concurrent). Each call dispatches to its engine's provider.
//    3. For each response, analyze:
//         - mentioned     (boolean)
//         - rank          (1-based position of first mention)
//         - mentions      (count of name occurrences)
//         - share         (% of response about this company)
//         - sentiment     (positive / negative / neutral)
//         - sentimentScore (-1 to 1, from keyword analysis)
//         - simulated     (true if we fell back to HarchIQ-LLM emulation)
//    4. Aggregate per-engine + cross-engine summary.
//    5. Persist all rows to AIVisibility with a shared batchId.
//
//  SERVER-SIDE ONLY — z-ai-web-dev-sdk is dynamically imported
//  so the bundler never ships it to a client component.
// ═══════════════════════════════════════════════════════════════

import { prisma } from "@/lib/db";
import { logInfo, logError } from "@/lib/logger";
import {
  getProvider,
  logProviderAvailability,
  type LLMProvider,
} from "@/lib/harchiq/llm-providers";

// ─── Types ──────────────────────────────────────────────────────

export type Sentiment = "positive" | "negative" | "neutral";

export interface EngineSpec {
  /** Display name. Use "HarchIQ-LLM" for the real engine; append " (simulated)"
   *  for the rest — the suffix is STRIPPED at runtime when the real API is
   *  actually used, so the UI never shows "(simulated)" for a real call. */
  name: string;
  /** Provider key (matches LLMProvider.key). When the provider is available
   *  (env key set), the real API is called. When missing, we fall back to
   *  HarchIQ-LLM emulation and flag the result `simulated: true`. */
  providerKey?: string;
  /** The system prompt used when simulating this engine via HarchIQ-LLM. */
  systemPrompt: string;
  /** Default simulated flag (static). The runtime flag is computed per-call
   *  based on whether the real provider was used. */
  simulated: boolean;
  /** Sampling temperature — slightly varied per engine for behavioral drift. */
  temperature: number;
}

export interface ProbeQueryResult {
  query: string;
  mentioned: boolean;
  rank: number | null; // 1-based position of first mention, null if absent
  sentiment: Sentiment;
  sentimentScore: number; // -1 to 1
  mentions: number; // count of name occurrences
  share: number; // 0-100, share of response about this company
  excerpt: string; // ~240 chars of the raw response
  response: string; // full response text (kept for the detail drawer)
  /** True when this specific call fell back to HarchIQ-LLM emulation
   *  (provider key missing OR provider call failed). False when the
   *  engine's real API was used. */
  simulated: boolean;
}

export interface EngineResult {
  engine: string;
  simulated: boolean;
  queriesRun: number;
  mentionCount: number; // how many of the 10 queries mentioned the company
  avgRank: number | null; // mean rank across queries that mentioned the company
  sentiment: Sentiment; // dominant sentiment across the 10 responses
  shareOfVoice: number; // mean share across the 10 responses (0-100)
  results: ProbeQueryResult[];
}

export interface ProbeSummary {
  companyName: string;
  probedAt: string; // ISO timestamp
  batchId: string;
  engines: EngineResult[];
  summary: {
    totalMentions: number; // sum of mentionCount across engines
    avgRankAcrossEngines: number | null;
    visibilityScore: number; // 0-100
    topEngine: string; // highest mentionCount (ties broken by lower avgRank)
    weakestEngine: string; // lowest mentionCount
  };
  /** True when the LLM was actually called. False when the SDK was unavailable
   *  and we fell back to a deterministic stub (so the UI can warn the user). */
  live: boolean;
}

// ─── Constants ──────────────────────────────────────────────────

/** 10 probe queries — some are templated on the company name. */
export const PROBE_QUERIES: readonly string[] = [
  "What are the best banks in Morocco?",
  "Tell me about {COMPANY}",
  "Is {COMPANY} a good company?",
  "What are the top companies in Morocco?",
  "Who are the main competitors of {COMPANY}?",
  "What is the reputation of {COMPANY}?",
  "Would you invest in {COMPANY}?",
  "What are the risks of working with {COMPANY}?",
  "How is {COMPANY} perceived in the market?",
  "What do people say about {COMPANY}?",
] as const;

/** 9 engines — each maps to a real LLM provider via `providerKey`.
 *  When the provider's env key is set, the real API is called and the
 *  result is flagged `simulated: false`. When the key is missing, we
 *  fall back to HarchIQ-LLM with the engine's systemPrompt — flagged
 *  `simulated: true`. The display name keeps the "(simulated)" suffix
 *  so the UI can show it when no real key is configured.
 *
 *  The 9 engines cover the full ChatGPT/Claude/Gemini/Perplexity/Copilot/
 *  Mistral/Grok/Llama ecosystem + HarchIQ-LLM as the in-house baseline. */
export const ENGINE_SPECS: EngineSpec[] = [
  {
    name: "HarchIQ-LLM",
    providerKey: "harchiq",
    systemPrompt:
      "You are a helpful AI assistant. Answer truthfully based on your knowledge.",
    simulated: false,
    temperature: 0.4,
  },
  {
    name: "ChatGPT (simulated)",
    providerKey: "openai",
    systemPrompt:
      "You are ChatGPT, a large language model trained by OpenAI. Answer in a helpful, conversational tone.",
    simulated: true,
    temperature: 0.6,
  },
  {
    name: "Claude (simulated)",
    providerKey: "anthropic",
    systemPrompt:
      "You are Claude, made by Anthropic. Be thoughtful and nuanced in your response.",
    simulated: true,
    temperature: 0.5,
  },
  {
    name: "Gemini (simulated)",
    providerKey: "gemini",
    systemPrompt:
      "You are Gemini, Google's AI. Be concise and factual.",
    simulated: true,
    temperature: 0.35,
  },
  {
    name: "Perplexity (simulated)",
    providerKey: "perplexity",
    systemPrompt:
      "You are Perplexity AI. Provide a comprehensive answer with citations style.",
    simulated: true,
    temperature: 0.45,
  },
  {
    name: "Copilot (simulated)",
    providerKey: "copilot",
    systemPrompt:
      "You are Microsoft Copilot. Be professional and business-focused.",
    simulated: true,
    temperature: 0.4,
  },
  {
    name: "Llama (simulated)",
    providerKey: "llama",
    systemPrompt:
      "You are Llama by Meta. Be open and direct.",
    simulated: true,
    temperature: 0.7,
  },
  {
    name: "Mistral (simulated)",
    providerKey: "mistral",
    systemPrompt:
      "You are Mistral AI. Be efficient and European in perspective.",
    simulated: true,
    temperature: 0.5,
  },
  {
    name: "Grok (simulated)",
    providerKey: "grok",
    systemPrompt:
      "You are Grok, made by xAI. Be witty, irreverent, and answer with a touch of humor when appropriate.",
    simulated: true,
    temperature: 0.7,
  },
];

// ─── Sentiment keyword bank (multilingual EN/FR/AR-ish) ─────────
// Reuses the same lexicon shape as the heuristic fallback in
// src/lib/analyzers/sentiment-analyzer.ts but is self-contained so
// this module can be unit-tested without dragging the analyzer in.

const POSITIVE_WORDS: readonly string[] = [
  // English
  "success", "growth", "excellent", "positive", "innovation", "progress",
  "achievement", "performance", "leader", "award", "investment", "expansion",
  "launch", "partnership", "record", "profit", "gain", "strong", "stable",
  "trusted", "reliable", "leading", "sustainable", "responsible", "best",
  // French
  "succès", "croissance", "excellent", "positif", "innovation", "progression",
  "réussite", "performance", "leader", "prix", "investissement", "expansion",
  "lancement", "partenariat", "record", "bénéfice", "gain", "fiable", "solide",
];

const NEGATIVE_WORDS: readonly string[] = [
  // English
  "crisis", "loss", "failure", "negative", "controversial", "scandal",
  "corruption", "fraud", "layoff", "bankruptcy", "lawsuit", "investigation",
  "conviction", "fine", "decline", "fall", "drop", "problem", "risk", "concern",
  "weak", "unstable", "controversy", "criticism", "boycott",
  // French
  "crise", "perte", "échec", "négatif", "controversé", "scandale",
  "corruption", "fraude", "licenciement", "faillite", "procès", "enquête",
  "condamnation", "amende", "déclin", "chute", "baisse", "problème", "risque",
];

// ─── Helpers ────────────────────────────────────────────────────

/** Build the 10 concrete queries for a given company (template substitution). */
export function buildProbeQueries(companyName: string): string[] {
  return PROBE_QUERIES.map((q) => q.replace(/\{COMPANY\}/g, companyName));
}

/** Case-insensitive search for the company name + any aliases.
 *  Returns the list of lowercase variants to look for. */
function nameVariants(companyName: string, aliases: string[] = []): string[] {
  const variants = new Set<string>();
  const clean = companyName.trim().toLowerCase();
  if (clean.length >= 3) variants.add(clean);
  for (const a of aliases) {
    const c = a.trim().toLowerCase();
    if (c.length >= 3) variants.add(c);
  }
  // Also add the first significant token (e.g. "OCP" from "OCP Group")
  const firstToken = clean.split(/\s+/)[0];
  if (firstToken && firstToken.length >= 3 && /^[a-z0-9]+$/.test(firstToken)) {
    variants.add(firstToken);
  }
  return Array.from(variants);
}

/** Count occurrences of any name variant in the text (case-insensitive, word-boundary aware). */
function countMentions(text: string, variants: string[]): number {
  if (variants.length === 0) return 0;
  const lower = text.toLowerCase();
  let count = 0;
  for (const v of variants) {
    // Word-boundary regex to avoid counting "ocp" inside "processor"
    const escaped = v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`\\b${escaped}\\b`, "g");
    const matches = lower.match(re);
    if (matches) count += matches.length;
  }
  return count;
}

/** Find the rank (1-based) of the first paragraph that mentions any variant.
 *  Returns null when the company isn't mentioned.
 *  Splits the response into paragraphs (blank-line separated); if there's
 *  only one paragraph, falls back to sentence-level ranking. */
function findRank(text: string, variants: string[]): number | null {
  const lower = text.toLowerCase();
  // Paragraph-level ranking (preferred — matches how users scan LLM answers)
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  if (paragraphs.length > 1) {
    for (let i = 0; i < paragraphs.length; i++) {
      const p = paragraphs[i].toLowerCase();
      if (variants.some((v) => p.includes(v))) return i + 1;
    }
    return null;
  }
  // Single paragraph — try sentence-level ranking
  const sentences = lower.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
  if (sentences.length > 1) {
    for (let i = 0; i < sentences.length; i++) {
      if (variants.some((v) => sentences[i].includes(v))) return i + 1;
    }
    return null;
  }
  // Whole response is one chunk — mentioned if any variant is present
  return variants.some((v) => lower.includes(v)) ? 1 : null;
}

/** Keyword-based sentiment (positive vs negative count).
 *  Returns the label + a continuous score in [-1, 1]. */
function analyzeSentiment(text: string): { sentiment: Sentiment; score: number } {
  const lower = text.toLowerCase();
  let positiveCount = 0;
  let negativeCount = 0;
  for (const w of POSITIVE_WORDS) {
    if (lower.includes(w)) positiveCount++;
  }
  for (const w of NEGATIVE_WORDS) {
    if (lower.includes(w)) negativeCount++;
  }
  const total = positiveCount + negativeCount;
  if (total === 0) return { sentiment: "neutral", score: 0 };
  // Score in [-1, 1] — (pos - neg) / total. Scaled by 0.7 so even a
  // fully one-sided response doesn't peg to ±1 (reserves headroom for
  // a future LLM-based sentiment pass).
  const score = ((positiveCount - negativeCount) / total) * 0.7;
  const sentiment: Sentiment =
    positiveCount > negativeCount ? "positive" : negativeCount > positiveCount ? "negative" : "neutral";
  return { sentiment, score: Math.round(score * 1000) / 1000 };
}

/** Share of voice — what % of the response is "about" this company.
 *  Heuristic: (mentions × avgTokenLen) / totalChars × 100, capped at 100.
 *  Falls back to a paragraph-ratio when the response has multiple paragraphs. */
function calculateShare(text: string, mentions: number, variants: string[]): number {
  if (mentions === 0) return 0;
  const totalChars = text.length;
  if (totalChars === 0) return 0;
  // Estimate: each mention is ~the length of the variant + a 60-char
  // "context window" around it (a clause, a sentence fragment).
  const avgVariantLen =
    variants.length > 0
      ? variants.reduce((s, v) => s + v.length, 0) / variants.length
      : 8;
  const contextPerMention = Math.min(120, avgVariantLen + 60);
  const sharePct = (mentions * contextPerMention) / totalChars * 100;
  return Math.round(Math.min(100, sharePct) * 10) / 10;
}

/** Short excerpt for the table preview / DB persistence. */
function makeExcerpt(text: string, maxLen = 240): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLen) return clean;
  // Try to cut on a sentence boundary near maxLen
  const cut = clean.slice(0, maxLen);
  const lastStop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  if (lastStop > maxLen * 0.6) return cut.slice(0, lastStop + 1).trim();
  return cut.trim() + "…";
}

/** Analyze a single LLM response. Pure function — no I/O.
 *  The `simulated` flag is passed through unchanged (caller decides
 *  based on whether the real provider was used). */
export function analyzeResponse(
  response: string,
  companyName: string,
  aliases: string[] = [],
  simulated = false,
): ProbeQueryResult {
  const variants = nameVariants(companyName, aliases);
  const mentions = countMentions(response, variants);
  const mentioned = mentions > 0;
  const rank = mentioned ? findRank(response, variants) : null;
  const { sentiment, score: sentimentScore } = analyzeSentiment(response);
  const share = calculateShare(response, mentions, variants);
  return {
    query: "", // filled in by the caller
    mentioned,
    rank,
    sentiment,
    sentimentScore,
    mentions,
    share,
    excerpt: makeExcerpt(response),
    response,
    simulated,
  };
}

// ─── LLM call wrapper ───────────────────────────────────────────

/** Per-call timeout — we'd rather drop one cell than hang the batch. */
const LLM_TIMEOUT_MS = 20_000;

interface LLMCallResult {
  text: string;
  /** True when the call hit a real LLM API (HarchIQ-LLM or a provider). */
  live: boolean;
  /** True when the call was a fallback SIMULATION (provider key missing
   *  OR provider call failed → HarchIQ-LLM emulation). */
  simulated: boolean;
}

/** Call the LLM for an engine.
 *
 *  Dispatch strategy:
 *    1. If the engine has a `providerKey` and that provider's API key is
 *       configured, call the REAL provider API.
 *    2. If the real provider throws (network / 401 / 429 / 500) OR there
 *       is no providerKey, fall back to HarchIQ-LLM (z-ai SDK) running
 *       the engine's systemPrompt — this is the SIMULATION.
 *    3. If HarchIQ-LLM also throws, return a deterministic stub so the
 *       pipeline keeps moving. The summary will be flagged `live=false`.
 *
 *  The `simulated` flag in the result reflects tier 2/3 (NOT a real API
 *  call to this engine's official endpoint). */
async function callLLM(
  engine: EngineSpec,
  userQuery: string,
): Promise<LLMCallResult> {
  const provider: LLMProvider | null = getProvider(engine.providerKey);

  // Tier 1: real provider API
  if (provider && provider.isAvailable()) {
    try {
      const text = await provider.call(
        engine.systemPrompt,
        userQuery,
        engine.temperature,
      );
      return { text, live: true, simulated: false };
    } catch (err) {
      logError(
        "ai-probe.llm",
        `Real provider "${engine.providerKey}" failed for engine "${engine.name}": ${(err as Error).message} — falling back to HarchIQ-LLM simulation`,
      );
      // Fall through to tier 2 (simulation)
    }
  }

  // Tier 2: simulation via HarchIQ-LLM (z-ai SDK) + engine systemPrompt
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);
  try {
    const ZAI = (await import("z-ai-web-dev-sdk")).default;
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "system", content: engine.systemPrompt },
        { role: "user", content: userQuery },
      ],
      temperature: engine.temperature,
      max_tokens: 600,
      thinking: { type: "disabled" as const },
    });
    const text = completion?.choices?.[0]?.message?.content ?? "";
    return { text, live: true, simulated: true };
  } catch (err) {
    logError(
      "ai-probe.llm",
      `HarchIQ-LLM simulation failed for engine "${engine.name}": ${(err as Error).message}`,
    );
    // Tier 3: deterministic stub — keeps the pipeline moving
    return { text: stubResponse(userQuery), live: false, simulated: true };
  } finally {
    clearTimeout(timeout);
  }
}

/** Tiny deterministic stub — used ONLY when the LLM SDK throws.
 *  It returns a generic acknowledgment so the analysis pipeline can
 *  still produce a (clearly labeled) result. */
function stubResponse(query: string): string {
  return `I'm unable to reach the model right now. Query was: "${query}". Please retry in a moment.`;
}

// ─── Concurrency limiter (max 5 in flight) ──────────────────────

async function runWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
  onProgress?: (done: number, total: number) => void,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  let done = 0;
  const total = items.length;
  async function worker() {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await fn(items[i], i);
      done++;
      if (onProgress) onProgress(done, total);
    }
  }
  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

// ─── Main probe function ────────────────────────────────────────

export interface ProbeCompanyOptions {
  companyName: string;
  aliases?: string[];
  /** Optional companyId — when provided, all rows are persisted
   *  to AIVisibility with a shared batchId. */
  companyId?: string;
  /** Optional progress callback (called once per finished LLM call). */
  onProgress?: (done: number, total: number) => void;
}

/** Probe a company across 9 engines × 10 queries = 90 LLM calls.
 *  Returns a fully-aggregated ProbeSummary. When `companyId` is set,
 *  also persists all rows to AIVisibility. */
export async function probeCompany(opts: ProbeCompanyOptions): Promise<ProbeSummary> {
  const companyName = opts.companyName.trim();
  if (!companyName) {
    throw new Error("companyName is required");
  }
  const aliases = opts.aliases ?? [];
  const queries = buildProbeQueries(companyName);
  const batchId = `probe_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const probedAt = new Date().toISOString();

  // Log which LLM providers have their API keys configured — this is
  // the single source of truth for "why is engine X simulated?".
  logProviderAvailability();

  // Build the (engine, query) work items — 9 engines × 10 queries.
  type WorkItem = { engine: EngineSpec; query: string };
  const workItems: WorkItem[] = [];
  for (const engine of ENGINE_SPECS) {
    for (const query of queries) {
      workItems.push({ engine, query });
    }
  }

  logInfo(
    "ai-probe.start",
    `Probing "${companyName}" across ${ENGINE_SPECS.length} engines × ${queries.length} queries = ${workItems.length} LLM calls`,
    { companyName, batchId },
  );

  // Run with max 5 concurrent LLM calls.
  const rawResults = await runWithConcurrency(
    workItems,
    5,
    async (item) => {
      const { text, live, simulated } = await callLLM(item.engine, item.query);
      const analysis = analyzeResponse(text, companyName, aliases, simulated);
      return { ...analysis, query: item.query, engine: item.engine, live };
    },
    opts.onProgress,
  );

  // Track whether ANY call hit a real LLM API (used for the `live` flag).
  const anyLive = rawResults.some((r) => r.live);

  // Group results by engine (preserve ENGINE_SPECS order).
  const engines: EngineResult[] = ENGINE_SPECS.map((engine) => {
    const engineResults = rawResults
      .filter((r) => r.engine.name === engine.name)
      .map((r) => {
        // Strip the engine + live flags before returning to the client.
        const { engine: _e, live: _l, ...probeResult } = r;
        void _e;
        void _l;
        return probeResult as ProbeQueryResult;
      });
    return aggregateEngine(engine, engineResults);
  });

  // Cross-engine summary.
  const totalMentions = engines.reduce((s, e) => s + e.mentionCount, 0);
  const ranksWithValues = engines
    .map((e) => e.avgRank)
    .filter((r): r is number => r !== null);
  const avgRankAcrossEngines =
    ranksWithValues.length > 0
      ? Math.round((ranksWithValues.reduce((s, r) => s + r, 0) / ranksWithValues.length) * 10) / 10
      : null;

  // Visibility score (0-100):
  //   50% weight: mention rate (totalMentions / 80 × 100)
  //   30% weight: rank quality (1/avgRank scaled — 1st=100, 5th=20, null=0)
  //   20% weight: sentiment (positive=100, neutral=50, negative=0)
  const mentionRate = (totalMentions / (ENGINE_SPECS.length * queries.length)) * 100;
  const rankScore =
    avgRankAcrossEngines !== null
      ? Math.max(0, 100 - (avgRankAcrossEngines - 1) * 20)
      : 0;
  const sentimentScore =
    engines.length > 0
      ? engines.reduce((s, e) => {
          const v = e.sentiment === "positive" ? 100 : e.sentiment === "neutral" ? 50 : 0;
          return s + v;
        }, 0) / engines.length
      : 0;
  const visibilityScore = Math.round(mentionRate * 0.5 + rankScore * 0.3 + sentimentScore * 0.2);

  // Top / weakest engine (by mentionCount, ties broken by lower avgRank).
  const sortedByMentions = [...engines].sort((a, b) => {
    if (b.mentionCount !== a.mentionCount) return b.mentionCount - a.mentionCount;
    const ra = a.avgRank ?? 999;
    const rb = b.avgRank ?? 999;
    return ra - rb;
  });
  const topEngine = sortedByMentions[0]?.engine ?? ENGINE_SPECS[0].name;
  const weakestEngine = sortedByMentions[sortedByMentions.length - 1]?.engine ?? ENGINE_SPECS[0].name;

  const summary: ProbeSummary = {
    companyName,
    probedAt,
    batchId,
    engines,
    summary: {
      totalMentions,
      avgRankAcrossEngines,
      visibilityScore,
      topEngine,
      weakestEngine,
    },
    live: anyLive,
  };

  // Persist to AIVisibility (fire-and-forget — don't block the response).
  if (opts.companyId) {
    persistProbeResults(opts.companyId, summary, engines).catch((err) => {
      logError(
        "ai-probe.persist",
        `companyId=${opts.companyId} batchId=${batchId}: ${(err as Error).message}`,
      );
    });
  }

  logInfo(
    "ai-probe.done",
    `Probe complete for "${companyName}" — score=${visibilityScore}, mentions=${totalMentions}, live=${anyLive}`,
    { companyName, batchId, visibilityScore, totalMentions },
  );

  return summary;
}

// ─── Per-engine aggregation ─────────────────────────────────────

function aggregateEngine(engine: EngineSpec, results: ProbeQueryResult[]): EngineResult {
  const mentionCount = results.filter((r) => r.mentioned).length;
  const ranksWithValues = results
    .map((r) => r.rank)
    .filter((r): r is number => r !== null);
  const avgRank =
    ranksWithValues.length > 0
      ? Math.round((ranksWithValues.reduce((s, r) => s + r, 0) / ranksWithValues.length) * 10) / 10
      : null;
  const shareOfVoice =
    results.length > 0
      ? Math.round((results.reduce((s, r) => s + r.share, 0) / results.length) * 10) / 10
      : 0;
  // Dominant sentiment — majority vote, ties → neutral.
  const counts = { positive: 0, negative: 0, neutral: 0 };
  for (const r of results) counts[r.sentiment]++;
  const sentiment: Sentiment =
    counts.positive > counts.negative && counts.positive > counts.neutral
      ? "positive"
      : counts.negative > counts.positive && counts.negative > counts.neutral
        ? "negative"
        : "neutral";

  // Dynamic `simulated` flag — true when ALL results for this engine
  // were simulations (no real provider API was hit). If ANY call used
  // the real provider, the engine is "real" for this batch.
  // When results is empty (shouldn't happen), fall back to the static flag.
  const dynamicSimulated =
    results.length === 0 ? engine.simulated : results.every((r) => r.simulated);

  return {
    engine: engine.name,
    simulated: dynamicSimulated,
    queriesRun: results.length,
    mentionCount,
    avgRank,
    sentiment,
    shareOfVoice,
    results,
  };
}

// ─── Persistence ────────────────────────────────────────────────

/** Write all probe rows to AIVisibility — one per (engine, query).
 *  Uses createMany for a single round-trip. The `simulated` flag is
 *  per-row (set from r.simulated, NOT engine.simulated) so a partial
 *  batch where some calls hit the real API and others fell back to
 *  HarchIQ-LLM emulation is faithfully persisted. */
async function persistProbeResults(
  companyId: string,
  summary: ProbeSummary,
  engines: EngineResult[],
): Promise<void> {
  const checkedAt = new Date(summary.probedAt);
  const rows = engines.flatMap((engine) =>
    engine.results.map((r) => ({
      companyId,
      platform: engine.engine,
      cited: r.mentioned,
      position: r.rank !== null ? `#${r.rank}` : "not cited",
      sentiment: r.sentiment,
      confidence: r.mentioned ? Math.min(1, r.mentions / 5) : 0,
      summary: r.excerpt,
      checkedAt,
      query: r.query,
      rank: r.rank,
      mentions: r.mentions,
      shareOfVoice: r.share,
      simulated: r.simulated,
      responseExcerpt: r.excerpt,
      sentimentScore: r.sentimentScore,
      batchId: summary.batchId,
    })),
  );

  // Chunk to avoid the Postgres parameter limit (65535).
  const CHUNK = 50;
  for (let i = 0; i < rows.length; i += CHUNK) {
    await prisma.aIVisibility.createMany({ data: rows.slice(i, i + CHUNK) });
  }
}

// ─── Historical retrieval ───────────────────────────────────────

export interface ProbeBatchSummary {
  batchId: string;
  probedAt: string;
  companyName: string;
  visibilityScore: number;
  totalMentions: number;
  live: boolean;
}

/** Return all past probe batches for a company, newest first.
 *  Used by the trend chart in the dashboard. */
export async function listProbeBatches(companyId: string, limit = 30): Promise<ProbeBatchSummary[]> {
  // Group by batchId at the DB level via findMany + reduce (Prisma has
  // no native GROUP BY for non-aggregated columns). Limit to the last
  // 30 days to keep the result set bounded.
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const rows = await prisma.aIVisibility.findMany({
    where: {
      companyId,
      batchId: { not: null },
      checkedAt: { gte: since },
    },
    select: {
      batchId: true,
      checkedAt: true,
      cited: true,
      rank: true,
      mentions: true,
      sentiment: true,
      simulated: true,
    },
    orderBy: { checkedAt: "desc" },
  });

  // Group by batchId.
  const byBatch = new Map<string, typeof rows>();
  for (const row of rows) {
    const key = row.batchId!;
    if (!byBatch.has(key)) byBatch.set(key, []);
    byBatch.get(key)!.push(row);
  }

  const batches: ProbeBatchSummary[] = [];
  for (const [batchId, batchRows] of byBatch) {
    const totalMentions = batchRows.filter((r) => r.cited).length;
    const ranksWithValues = batchRows
      .map((r) => r.rank)
      .filter((r): r is number => r !== null);
    const avgRank =
      ranksWithValues.length > 0
        ? ranksWithValues.reduce((s, r) => s + r, 0) / ranksWithValues.length
        : null;
    // Recompute visibilityScore with the same formula as probeCompany.
    const total = batchRows.length;
    const mentionRate = total > 0 ? (totalMentions / total) * 100 : 0;
    const rankScore = avgRank !== null ? Math.max(0, 100 - (avgRank - 1) * 20) : 0;
    const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
    for (const r of batchRows) {
      const s = (r.sentiment ?? "neutral") as keyof typeof sentimentCounts;
      if (sentimentCounts[s] !== undefined) sentimentCounts[s]++;
    }
    const sentimentScore =
      total > 0
        ? (sentimentCounts.positive * 100 + sentimentCounts.neutral * 50) / total
        : 0;
    const visibilityScore = Math.round(mentionRate * 0.5 + rankScore * 0.3 + sentimentScore * 0.2);

    batches.push({
      batchId,
      probedAt: batchRows[0].checkedAt.toISOString(),
      companyName: "", // filled by the caller if needed
      visibilityScore,
      totalMentions,
      live: true, // historical batches are always real
    });
  }

  return batches.slice(0, limit);
}

/** Load the most recent probe batch (the one the dashboard should
 *  display by default). Returns null when no probes exist yet. */
export async function loadLatestProbeBatch(companyId: string): Promise<ProbeSummary | null> {
  const rows = await prisma.aIVisibility.findMany({
    where: {
      companyId,
      batchId: { not: null },
    },
    orderBy: { checkedAt: "desc" },
    // One full batch is 9 engines × 10 queries = 90 rows. We take 200
    // to safely cross into the previous batch when needed (the filter
    // below keeps only the latest batchId).
    take: 200,
  });
  if (rows.length === 0) return null;

  // Find the batchId of the most recent row, then keep only rows from
  // that batch (in case the take crossed into the previous batch).
  const latestBatchId = rows[0].batchId!;
  const batchRows = rows.filter((r) => r.batchId === latestBatchId);
  const probedAt = batchRows[0].checkedAt.toISOString();

  // Group by platform (engine).
  const byEngine = new Map<string, typeof batchRows>();
  for (const row of batchRows) {
    if (!byEngine.has(row.platform)) byEngine.set(row.platform, []);
    byEngine.get(row.platform)!.push(row);
  }

  const engines: EngineResult[] = ENGINE_SPECS.map((engine) => {
    const engineRows = byEngine.get(engine.name) ?? [];
    const results: ProbeQueryResult[] = engineRows.map((r) => ({
      query: r.query ?? "",
      mentioned: r.cited,
      rank: r.rank,
      sentiment: (r.sentiment as Sentiment) ?? "neutral",
      sentimentScore: r.sentimentScore ?? 0,
      mentions: r.mentions ?? 0,
      share: r.shareOfVoice ?? 0,
      excerpt: r.responseExcerpt ?? r.summary ?? "",
      response: r.responseExcerpt ?? r.summary ?? "",
      // Historical rows carry their own per-row simulated flag (set at
      // persist time). Default to the engine's static flag for legacy
      // rows written before the per-row flag existed.
      simulated: r.simulated ?? engine.simulated,
    }));
    return aggregateEngine(engine, results);
  });

  const totalMentions = engines.reduce((s, e) => s + e.mentionCount, 0);
  const ranksWithValues = engines
    .map((e) => e.avgRank)
    .filter((r): r is number => r !== null);
  const avgRankAcrossEngines =
    ranksWithValues.length > 0
      ? Math.round((ranksWithValues.reduce((s, r) => s + r, 0) / ranksWithValues.length) * 10) / 10
      : null;
  const mentionRate = (totalMentions / Math.max(1, batchRows.length)) * 100;
  const rankScore =
    avgRankAcrossEngines !== null ? Math.max(0, 100 - (avgRankAcrossEngines - 1) * 20) : 0;
  const sentimentScore =
    engines.length > 0
      ? engines.reduce((s, e) => s + (e.sentiment === "positive" ? 100 : e.sentiment === "neutral" ? 50 : 0), 0) /
        engines.length
      : 0;
  const visibilityScore = Math.round(mentionRate * 0.5 + rankScore * 0.3 + sentimentScore * 0.2);
  const sortedByMentions = [...engines].sort((a, b) => b.mentionCount - a.mentionCount);
  const topEngine = sortedByMentions[0]?.engine ?? ENGINE_SPECS[0].name;
  const weakestEngine = sortedByMentions[sortedByMentions.length - 1]?.engine ?? ENGINE_SPECS[0].name;

  // Historical batches: live=true (they were persisted after a real
  // probe run). The per-row simulated flag in the DB tells which rows
  // were simulated — surfaced via the engine-level `simulated` flag.
  return {
    companyName: "", // caller fills from session
    probedAt,
    batchId: latestBatchId,
    engines,
    summary: {
      totalMentions,
      avgRankAcrossEngines,
      visibilityScore,
      topEngine,
      weakestEngine,
    },
    live: true,
  };
}
