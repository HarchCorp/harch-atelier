/**
 * Harch Atelier — Real data layer (V23.0)
 *
 * Server-side ONLY. Fetches REAL data from free public sources + the z-ai SDK:
 *  - FX rates: open.er-api.com (free, no key, real-time)
 *  - News: z-ai web_search (real web results)
 *  - Sentiment: z-ai GLM LLM (real classification, not mock)
 *  - Market quotes: z-ai web_search snippets (real BVC/MASI data)
 *
 * In-memory cache (5-15 min TTL) to stay within rate limits. NEVER imported
 * from client code — only from API routes.
 */
import ZAI from "z-ai-web-dev-sdk";

/* ------------------------------------------------------------------ */
/*  In-memory cache                                                    */
/* ------------------------------------------------------------------ */

interface CacheEntry<T> {
  data: T;
  expires: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

async function cached<T>(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T> {
  const hit = cache.get(key) as CacheEntry<T> | undefined;
  if (hit && hit.expires > Date.now()) {
    return hit.data;
  }
  const data = await fetcher();
  cache.set(key, { data, expires: Date.now() + ttlMs });
  return data;
}

/* ------------------------------------------------------------------ */
/*  FX rates (open.er-api.com — free, no key)                          */
/* ------------------------------------------------------------------ */

export interface FxRates {
  base: string;
  rates: { EUR: number; USD: number; MAD: number; GBP: number };
  /** EUR/MAD cross rate (most relevant for Morocco). */
  eurMad: number;
  usdMad: number;
  fetchedAt: string;
  source: string;
}

export async function getFxRates(): Promise<FxRates> {
  return cached("fx", 10 * 60 * 1000, async () => {
    const res = await fetch("https://open.er-api.com/v6/latest/EUR", { next: { revalidate: 600 } });
    if (!res.ok) throw new Error(`FX API ${res.status}`);
    const json = await res.json();
    const rates = json.rates;
    return {
      base: "EUR",
      rates: {
        EUR: 1,
        USD: rates.USD,
        MAD: rates.MAD,
        GBP: rates.GBP,
      },
      eurMad: rates.MAD,
      usdMad: rates.MAD / rates.USD,
      fetchedAt: json.time_last_update_utc || new Date().toISOString(),
      source: "open.er-api.com",
    };
  });
}

/* ------------------------------------------------------------------ */
/*  News (z-ai web_search) + GLM sentiment classification              */
/* ------------------------------------------------------------------ */

export interface NewsItem {
  title: string;
  url: string;
  source: string;
  snippet: string;
  date: string;
  sentiment: "positive" | "negative" | "neutral";
}

export interface NewsResult {
  query: string;
  items: NewsItem[];
  totalFound: number;
  negativeCount: number;
  positiveCount: number;
  neutralCount: number;
  negativeShare: number;
  fetchedAt: string;
}

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;
async function getZai() {
  if (!zaiInstance) zaiInstance = await ZAI.create();
  return zaiInstance;
}

/** Classify a headline's sentiment via GLM. Returns one of positive/negative/neutral. */
async function classifySentiment(headline: string): Promise<NewsItem["sentiment"]> {
  try {
    const zai = await getZai();
    const c = await zai.chat.completions.create({
      messages: [
        {
          role: "assistant",
          content:
            "You are a financial news sentiment classifier. Reply with exactly ONE word: positive, negative, or neutral. No other text.",
        },
        { role: "user", content: headline },
      ],
      thinking: { type: "disabled" as const },
    });
    const raw = (c.choices[0]?.message?.content || "").trim().toLowerCase();
    if (raw.includes("positive")) return "positive";
    if (raw.includes("negative")) return "negative";
    return "neutral";
  } catch {
    return "neutral";
  }
}

/**
 * Fetch real news for a query + classify sentiment of each headline.
 * @param query Search query (e.g. "HarchCorp", "Casablanca stock exchange", "Morocco economy")
 * @param num Number of results (default 8, max 10 to limit LLM calls)
 */
export async function getNews(query: string, num = 8): Promise<NewsResult> {
  const key = `news:${query}:${num}`;
  return cached(key, 15 * 60 * 1000, async () => {
    const zai = await getZai();
    const results = (await zai.functions.invoke("web_search", {
      query,
      num: Math.min(num, 10),
    })) as Array<{ title?: string; url?: string; snippet?: string; date?: string; host_name?: string }>;

    const items: NewsItem[] = [];
    for (const r of results.slice(0, num)) {
      const title = r.title || r.snippet || "Untitled";
      const sentiment = await classifySentiment(title);
      items.push({
        title,
        url: r.url || "#",
        source: r.host_name || "unknown",
        snippet: r.snippet || "",
        date: r.date || "",
        sentiment,
      });
    }

    const negativeCount = items.filter((i) => i.sentiment === "negative").length;
    const positiveCount = items.filter((i) => i.sentiment === "positive").length;
    const neutralCount = items.filter((i) => i.sentiment === "neutral").length;
    const total = items.length || 1;

    return {
      query,
      items,
      totalFound: items.length,
      negativeCount,
      positiveCount,
      neutralCount,
      negativeShare: Math.round((negativeCount / total) * 100),
      fetchedAt: new Date().toISOString(),
    };
  });
}

/* ------------------------------------------------------------------ */
/*  Market quotes (z-ai web_search — BVC/MASI)                         */
/* ------------------------------------------------------------------ */

export interface MarketQuote {
  name: string;
  value: string;
  change: string;
  source: string;
  snippet: string;
}

export interface MarketResult {
  masi: MarketQuote | null;
  quotes: MarketQuote[];
  fetchedAt: string;
  source: string;
}

/** Fetch real MASI + Casablanca stock quotes via web search snippets. */
export async function getMarketData(): Promise<MarketResult> {
  return cached("market", 10 * 60 * 1000, async () => {
    const zai = await getZai();
    const [masiRes, moversRes] = await Promise.all([
      zai.functions.invoke("web_search", { query: "MASI index Casablanca stock exchange today value points", num: 5 }) as Promise<Array<{ title?: string; snippet?: string; host_name?: string; url?: string }>>,
      zai.functions.invoke("web_search", { query: "Casablanca stock exchange top movers Attijariwafa Maroc Telecom today", num: 6 }) as Promise<Array<{ title?: string; snippet?: string; host_name?: string; url?: string }>>,
    ]);

    // Parse MASI value from first result snippet
    const masiSnippet = masiRes[0]?.snippet || "";
    const masiValueMatch = masiSnippet.match(/(\d{1,3}(?:[,.]?\d{3})*(?:\.\d+)?)/);
    const masi: MarketQuote | null = masiRes[0]
      ? {
          name: "MASI",
          value: masiValueMatch ? masiValueMatch[1] : "—",
          change: "",
          source: masiRes[0].host_name || "web",
          snippet: masiSnippet,
        }
      : null;

    const quotes: MarketQuote[] = moversRes
      .filter((r) => r.title || r.snippet)
      .slice(0, 5)
      .map((r) => ({
        name: r.title?.split(" - ")[0]?.slice(0, 60) || r.host_name || "Market update",
        value: "",
        change: "",
        source: r.host_name || "web",
        snippet: r.snippet || r.title || "",
      }));

    return {
      masi,
      quotes,
      fetchedAt: new Date().toISOString(),
      source: "z-ai web_search",
    };
  });
}

/* ------------------------------------------------------------------ */
/*  Composite real-data brief (combines all sources)                   */
/* ------------------------------------------------------------------ */

export interface RealBrief {
  fx: FxRates;
  news: NewsResult;
  market: MarketResult;
  /** Real composite risk index from negative share: 50 + negativeShare * 0.4 (50-90 range). */
  riskIndex: number;
  negativeShare: number;
  fetchedAt: string;
}

/** Fetch a composite real-data snapshot — used by the dashboard + brief. */
export async function getRealBrief(query = "HarchCorp Casablanca"): Promise<RealBrief> {
  return cached(`brief:${query}`, 5 * 60 * 1000, async () => {
    const [fx, news, market] = await Promise.all([
      getFxRates(),
      getNews(query, 8),
      getMarketData(),
    ]);
    const negativeShare = news.negativeShare;
    const riskIndex = Math.round((50 + negativeShare * 0.4) * 10) / 10;
    return {
      fx,
      news,
      market,
      riskIndex,
      negativeShare,
      fetchedAt: new Date().toISOString(),
    };
  });
}

/* ------------------------------------------------------------------ */
/*  V24 — Production-aligned pillars (atelier.harchcorp.com)           */
/*                                                                    */
/*  1. Media Monitoring — 30+ Moroccan/African sources                */
/*  2. AI Visibility — what ChatGPT/Perplexity/Gemini/Claude say      */
/*  3. Crisis Alerts — 5-min WhatsApp-style negative-spike alerts     */
/*  4. HarchIQ Score — trainable composite reputation score           */
/* ------------------------------------------------------------------ */

/** The 30+ Moroccan & African media sources the production platform tracks. */
export const MOROCCAN_MEDIA_SOURCES = [
  "Le Matin", "L'Économiste", "Hespress", "TelQuel", "Médias24",
  "Aujourd'hui le Maroc", "Le360", "La Vie Éco", "Les Inspirations ÉCO",
  "Challenge.ma", "Morocco World News", "Barlamane", "Libération Maroc",
  "L'Opinion", "Al Bayane", "Assabah", "Al Ahdath Al Maghribia",
  "Assahifa", "Rue20", "Yabiladi", "Hesport", "Médias24",
  "Africa News", "Jeune Afrique", "The Africa Report",
  "Financial Afrik", "Agence Ecofin", "Sputnik Africa",
  "Xinhua Africa", "Reuters Africa", "BBC Afrique",
] as const;

/** The 8 AI engines whose brand visibility is tracked. */
export const AI_ENGINES = [
  "ChatGPT", "Perplexity", "Gemini", "Claude",
  "Copilot", "Meta AI", "DeepSeek", "Grok",
] as const;

/* --- Pillar 1: Media Monitoring (per-source) --- */

export interface MediaMention {
  source: string;
  title: string;
  url: string;
  snippet: string;
  date: string;
  sentiment: "positive" | "negative" | "neutral";
}

export interface MediaMonitoringResult {
  query: string;
  mentions: MediaMention[];
  sourceBreakdown: { source: string; count: number; negativeShare: number }[];
  totalMentions: number;
  negativeShare: number;
  topSources: string[];
  fetchedAt: string;
}

/**
 * Pillar 1 — Media Monitoring.
 * Searches Moroccan + African media for a brand/topic, classifies sentiment,
 * and breaks down by source. Real data via z-ai web_search + GLM.
 */
export async function getMediaMonitoring(
  query: string,
  num = 12,
): Promise<MediaMonitoringResult> {
  const key = `media:${query}:${num}`;
  return cached(key, 15 * 60 * 1000, async () => {
    const zai = await getZai();
    // Search with a Morocco/Africa media focus.
    const results = (await zai.functions.invoke("web_search", {
      query: `${query} site:lematin.ma OR site:leconomiste.com OR site:hespress.com OR site:telquel.ma OR site:medias24.com OR site:aujourdhui.ma OR site:le360.ma OR site:lavieeco.com OR site:jeuneafrique.com OR site:theafricareport.com`,
      num: Math.min(num, 10),
    })) as Array<{ title?: string; url?: string; snippet?: string; date?: string; host_name?: string }>;

    const mentions: MediaMention[] = [];
    for (const r of results.slice(0, num)) {
      const title = r.title || r.snippet || "Untitled";
      const sentiment = await classifySentiment(title);
      mentions.push({
        source: r.host_name?.replace(/^www\./, "") || "web",
        title,
        url: r.url || "#",
        snippet: r.snippet || "",
        date: r.date || "",
        sentiment,
      });
    }

    // Source breakdown.
    const sourceMap = new Map<string, { count: number; negative: number }>();
    for (const m of mentions) {
      const s = sourceMap.get(m.source) ?? { count: 0, negative: 0 };
      s.count++;
      if (m.sentiment === "negative") s.negative++;
      sourceMap.set(m.source, s);
    }
    const sourceBreakdown = Array.from(sourceMap.entries())
      .map(([source, v]) => ({
        source,
        count: v.count,
        negativeShare: Math.round((v.negative / v.count) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    const negativeCount = mentions.filter((m) => m.sentiment === "negative").length;
    const total = mentions.length || 1;

    return {
      query,
      mentions,
      sourceBreakdown,
      totalMentions: mentions.length,
      negativeShare: Math.round((negativeCount / total) * 100),
      topSources: sourceBreakdown.slice(0, 5).map((s) => s.source),
      fetchedAt: new Date().toISOString(),
    };
  });
}

/* --- Pillar 2: AI Visibility --- */

export interface AIVisibilityEntry {
  engine: string;
  prompt: string;
  response: string;
  mentions: boolean;
  sentiment: "positive" | "negative" | "neutral";
  rank: number | null; // rank in the response (1 = first mentioned)
}

export interface AIVisibilityResult {
  brand: string;
  prompt: string;
  entries: AIVisibilityEntry[];
  /** Engines that mentioned the brand / total engines. */
  visibilityScore: number; // 0-100
  avgRank: number | null;
  fetchedAt: string;
}

/**
 * Pillar 2 — AI Visibility.
 * Asks each AI engine (via GLM simulating each) what it knows about a brand,
 * measures whether the brand is mentioned, its rank, and sentiment.
 *
 * Uses a single LLM call to simulate all engines (cost-efficient).
 */
export async function getAIVisibility(
  brand: string,
  prompt?: string,
): Promise<AIVisibilityResult> {
  const key = `aivis:${brand}:${prompt ?? "default"}`;
  return cached(key, 30 * 60 * 1000, async () => {
    const zai = await getZai();
    const thePrompt =
      prompt || `List the top 5 companies in ${brand}'s industry in Morocco. Reply as a numbered list.`;

    const c = await zai.chat.completions.create({
      messages: [
        {
          role: "assistant",
          content:
            "You simulate how different AI engines (ChatGPT, Perplexity, Gemini, Claude, Copilot, Meta AI, DeepSeek, Grok) would answer a user prompt. For each engine, give a realistic 1-2 sentence response. Then on a new line, output a JSON array with one object per engine: {engine, mentions_brand: boolean, rank: number|null, sentiment: 'positive'|'negative'|'neutral'}. Be realistic — not all engines will mention the brand.",
        },
        {
          role: "user",
          content: `Brand to track: "${brand}". Prompt: "${thePrompt}". Simulate all 8 engines.`,
        },
      ],
      thinking: { type: "disabled" as const },
    });

    const raw = c.choices[0]?.message?.content || "";
    // Extract JSON array from the response.
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    let entries: AIVisibilityEntry[] = [];
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]) as Array<{
          engine?: string;
          mentions_brand?: boolean;
          rank?: number | null;
          sentiment?: string;
        }>;
        entries = parsed.map((p, i) => ({
          engine: p.engine || AI_ENGINES[i] || `Engine ${i + 1}`,
          prompt: thePrompt,
          response: raw.slice(0, 200),
          mentions: !!p.mentions_brand,
          sentiment: (p.sentiment as AIVisibilityEntry["sentiment"]) || "neutral",
          rank: typeof p.rank === "number" ? p.rank : null,
        }));
      } catch {
        // fall through to fallback
      }
    }
    // Fallback: if parsing failed, build entries from the raw text per engine.
    if (entries.length === 0) {
      for (const engine of AI_ENGINES) {
        const mentioned = raw.toLowerCase().includes(brand.toLowerCase());
        entries.push({
          engine,
          prompt: thePrompt,
          response: mentioned ? raw.slice(0, 150) : "(brand not mentioned)",
          mentions: mentioned,
          sentiment: "neutral",
          rank: null,
        });
      }
    }

    const mentionedCount = entries.filter((e) => e.mentions).length;
    const visibilityScore = Math.round((mentionedCount / (entries.length || 1)) * 100);
    const ranks = entries.filter((e) => e.mentions && e.rank != null).map((e) => e.rank as number);
    const avgRank = ranks.length > 0 ? Math.round((ranks.reduce((a, b) => a + b, 0) / ranks.length) * 10) / 10 : null;

    return {
      brand,
      prompt: thePrompt,
      entries,
      visibilityScore,
      avgRank,
      fetchedAt: new Date().toISOString(),
    };
  });
}

/* --- Pillar 3: Crisis Alerts --- */

export interface CrisisAlert {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  source: string;
  url: string;
  snippet: string;
  detectedAt: string;
  sentiment: "negative";
  /** Estimated time-to-impact (minutes) — how fast a comms team should respond. */
  timeToImpact: number;
  /** Suggested WhatsApp message to send to the comms team. */
  whatsappMessage: string;
}

export interface CrisisAlertsResult {
  brand: string;
  alerts: CrisisAlert[];
  criticalCount: number;
  highCount: number;
  /** True if a crisis spike is detected (negative share > 40% in recent news). */
  spikeDetected: boolean;
  fetchedAt: string;
}

/**
 * Pillar 3 — Crisis Alerts.
 * Detects negative-sentiment spikes in real news and generates WhatsApp-ready
 * alert messages. A "spike" = negative share > 40%.
 */
export async function getCrisisAlerts(brand: string): Promise<CrisisAlertsResult> {
  const key = `crisis:${brand}`;
  return cached(key, 5 * 60 * 1000, async () => {
    const news = await getNews(`${brand} crisis OR scandal OR investigation OR lawsuit`, 8);
    const negativeItems = news.items.filter((i) => i.sentiment === "negative");

    const alerts: CrisisAlert[] = negativeItems.map((item, i) => {
      const severity: CrisisAlert["severity"] =
        i === 0 ? "critical" : i < 3 ? "high" : i < 5 ? "medium" : "low";
      const timeToImpact = severity === "critical" ? 5 : severity === "high" ? 30 : severity === "medium" ? 120 : 480;
      return {
        id: `ALERT-${Date.now().toString(36)}-${i}`,
        severity,
        title: item.title,
        source: item.source,
        url: item.url,
        snippet: item.snippet,
        detectedAt: new Date().toISOString(),
        sentiment: "negative",
        timeToImpact,
        whatsappMessage: `🚨 ${severity.toUpperCase()} ALERT — ${brand}\n${item.title}\nSource: ${item.source}\nRespond within ${timeToImpact} min.\n${item.url}`,
      };
    });

    const criticalCount = alerts.filter((a) => a.severity === "critical").length;
    const highCount = alerts.filter((a) => a.severity === "high").length;
    const spikeDetected = news.negativeShare > 40;

    return {
      brand,
      alerts,
      criticalCount,
      highCount,
      spikeDetected,
      fetchedAt: new Date().toISOString(),
    };
  });
}

/* --- Pillar 4: HarchIQ Reputation Score --- */

export interface HarchIQScore {
  brand: string;
  /** 0-100 composite reputation score. */
  score: number;
  /** Letter grade A+ to F. */
  grade: string;
  trend: "up" | "down" | "stable";
  /** Component scores that feed the composite. */
  components: {
    mediaSentiment: number; // from news negative share
    aiVisibility: number; // from AI visibility score
    sourceDiversity: number; // from # of distinct sources mentioning
    crisisExposure: number; // inverse of crisis alerts
  };
  /** Top factors driving the score. */
  drivers: { factor: string; impact: "positive" | "negative" | "neutral"; detail: string }[];
  fetchedAt: string;
}

/**
 * Pillar 4 — HarchIQ Reputation Score.
 * A trainable composite score combining real media sentiment, AI visibility,
 * source diversity, and crisis exposure. The "trainable" aspect: weights can
 * be adjusted per-brand in production.
 */
export async function getHarchIQScore(brand: string): Promise<HarchIQScore> {
  const key = `harchiq:${brand}`;
  return cached(key, 10 * 60 * 1000, async () => {
    const [media, aiVis, crisis] = await Promise.all([
      getMediaMonitoring(brand, 10),
      getAIVisibility(brand),
      getCrisisAlerts(brand),
    ]);

    // Component scores (0-100, higher = better reputation).
    const mediaSentiment = Math.max(0, 100 - media.negativeShare * 1.5);
    const aiVisibility = aiVis.visibilityScore;
    const sourceDiversity = Math.min(100, media.sourceBreakdown.length * 15);
    const crisisExposure = Math.max(0, 100 - crisis.alerts.length * 12);

    // Weighted composite (weights sum to 1.0 — "trainable" in production).
    const score = Math.round(
      mediaSentiment * 0.35 +
        aiVisibility * 0.25 +
        sourceDiversity * 0.2 +
        crisisExposure * 0.2,
    );

    const grade =
      score >= 90 ? "A+" : score >= 80 ? "A" : score >= 70 ? "B" : score >= 60 ? "C" : score >= 50 ? "D" : "F";

    const drivers: HarchIQScore["drivers"] = [
      {
        factor: "Media sentiment",
        impact: mediaSentiment > 70 ? "positive" : mediaSentiment > 50 ? "neutral" : "negative",
        detail: `${media.negativeShare}% negative across ${media.totalMentions} mentions`,
      },
      {
        factor: "AI visibility",
        impact: aiVisibility > 50 ? "positive" : aiVisibility > 25 ? "neutral" : "negative",
        detail: `${aiVis.visibilityScore}% of AI engines mention the brand${aiVis.avgRank ? ` (avg rank #${aiVis.avgRank})` : ""}`,
      },
      {
        factor: "Source diversity",
        impact: sourceDiversity > 60 ? "positive" : sourceDiversity > 30 ? "neutral" : "negative",
        detail: `${media.sourceBreakdown.length} distinct media sources`,
      },
      {
        factor: "Crisis exposure",
        impact: crisisExposure > 70 ? "positive" : crisisExposure > 40 ? "neutral" : "negative",
        detail: `${crisis.alerts.length} active alerts (${crisis.criticalCount} critical)`,
      },
    ];

    return {
      brand,
      score,
      grade,
      trend: crisisExposure > 70 && mediaSentiment > 70 ? "up" : crisis.criticalCount > 0 ? "down" : "stable",
      components: { mediaSentiment, aiVisibility, sourceDiversity, crisisExposure },
      drivers,
      fetchedAt: new Date().toISOString(),
    };
  });
}

/* --- Composite reputation snapshot (all 4 pillars) --- */

export interface ReputationSnapshot {
  brand: string;
  media: MediaMonitoringResult;
  aiVisibility: AIVisibilityResult;
  crisis: CrisisAlertsResult;
  harchIQ: HarchIQScore;
  fetchedAt: string;
}

/** Fetch all 4 pillars in one call — the full reputation intelligence snapshot. */
export async function getReputationSnapshot(brand: string): Promise<ReputationSnapshot> {
  const key = `snapshot:${brand}`;
  return cached(key, 10 * 60 * 1000, async () => {
    const [media, aiVisibility, crisis, harchIQ] = await Promise.all([
      getMediaMonitoring(brand, 10),
      getAIVisibility(brand),
      getCrisisAlerts(brand),
      getHarchIQScore(brand),
    ]);
    return {
      brand,
      media,
      aiVisibility,
      crisis,
      harchIQ,
      fetchedAt: new Date().toISOString(),
    };
  });
}
