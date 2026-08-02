// ═══════════════════════════════════════════════════════════════
//  DATA FEED & INGESTION MANAGER — RSS, API, and scraper orchestration
//
//  Manages all data sources for the Harch Atelier platform:
//  - 16 Moroccan media RSS feeds
//  - AMMC / BAM / BVC regulatory feeds
//  - BVC price data feeds
//  - Social media monitoring feeds
//  - AI engine probing feeds
//
//  Each source has: config, health status, last scrape, error log,
//  rate limiting, and dedup logic.
// ═══════════════════════════════════════════════════════════════

import type { ArticleSourceType, Language } from "@/lib/types/platform";

// ─── TYPES ─────────────────────────────────────────────────────

export interface FeedSource {
  id: string;
  name: string;
  type: "rss" | "api" | "scraper" | "regulatory" | "social" | "ai";
  url: string;
  sourceType: ArticleSourceType;
  language: Language;
  category: string;
  enabled: boolean;
  priority: "critical" | "high" | "normal" | "low";
  scrapeInterval: number; // seconds
  lastScrape?: Date;
  lastSuccess?: Date;
  lastError?: string;
  errorCount: number;
  successCount: number;
  totalArticlesScraped: number;
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
    cooldownAfterError: number; // seconds
  };
  parser: "rss" | "atom" | "json" | "html" | "custom";
  parserConfig?: Record<string, unknown>;
  dedupStrategy: "url" | "title" | "content_hash" | "url_and_title";
  tags: string[];
  metadata?: Record<string, unknown>;
}

export interface FeedHealth {
  sourceId: string;
  status: "healthy" | "degraded" | "down" | "disabled";
  uptime: number; // percentage
  averageResponseTime: number; // ms
  lastCheck: Date;
  consecutiveErrors: number;
  totalRequests: number;
  failedRequests: number;
  articlesPerHour: number;
  articlesPerDay: number;
}

export interface ScrapeResult {
  sourceId: string;
  success: boolean;
  articlesFound: number;
  articlesNew: number;
  articlesDuplicate: number;
  duration: number;
  error?: string;
  timestamp: string;
  sampleTitles: string[];
}

export interface FeedStats {
  totalSources: number;
  enabledSources: number;
  healthySources: number;
  degradedSources: number;
  downSources: number;
  totalArticlesScraped: number;
  totalArticlesToday: number;
  averageResponseTime: number;
  totalErrors: number;
  totalRequests: number;
  successRate: number;
}

// ─── MOROCCAN MEDIA RSS FEEDS ──────────────────────────────────

export const MOROCCAN_RSS_FEEDS: FeedSource[] = [
  {
    id: "feed-hespress",
    name: "Hespress",
    type: "rss",
    url: "https://www.hespress.com/feed",
    sourceType: "media" as ArticleSourceType,
    language: "ar" as Language,
    category: "General News",
    enabled: true,
    priority: "high",
    scrapeInterval: 1800,
    errorCount: 0,
    successCount: 0,
    totalArticlesScraped: 0,
    rateLimit: { requestsPerMinute: 2, requestsPerHour: 30, cooldownAfterError: 300 },
    parser: "rss",
    dedupStrategy: "url",
    tags: ["arabic", "politics", "society", "economy"],
  },
  {
    id: "feed-telquel",
    name: "TelQuel",
    type: "rss",
    url: "https://telquel.ma/feed",
    sourceType: "media" as ArticleSourceType,
    language: "fr" as Language,
    category: "General News",
    enabled: true,
    priority: "high",
    scrapeInterval: 1800,
    errorCount: 0,
    successCount: 0,
    totalArticlesScraped: 0,
    rateLimit: { requestsPerMinute: 2, requestsPerHour: 30, cooldownAfterError: 300 },
    parser: "rss",
    dedupStrategy: "url",
    tags: ["french", "politics", "society", "economy", "culture"],
  },
  {
    id: "feed-medias24",
    name: "Medias24",
    type: "rss",
    url: "https://www.medias24.com/feed",
    sourceType: "media" as ArticleSourceType,
    language: "fr" as Language,
    category: "Business News",
    enabled: true,
    priority: "high",
    scrapeInterval: 1800,
    errorCount: 0,
    successCount: 0,
    totalArticlesScraped: 0,
    rateLimit: { requestsPerMinute: 2, requestsPerHour: 30, cooldownAfterError: 300 },
    parser: "rss",
    dedupStrategy: "url",
    tags: ["french", "business", "economy", "bvc"],
  },
  {
    id: "feed-leconomiste",
    name: "L'Economiste",
    type: "rss",
    url: "https://www.leconomiste.com/feed",
    sourceType: "media" as ArticleSourceType,
    language: "fr" as Language,
    category: "Business News",
    enabled: true,
    priority: "high",
    scrapeInterval: 1800,
    errorCount: 0,
    successCount: 0,
    totalArticlesScraped: 0,
    rateLimit: { requestsPerMinute: 2, requestsPerHour: 30, cooldownAfterError: 300 },
    parser: "rss",
    dedupStrategy: "url",
    tags: ["french", "business", "economy", "finance"],
  },
  {
    id: "feed-le360",
    name: "Le360",
    type: "rss",
    url: "https://www.le360.ma/feed",
    sourceType: "media" as ArticleSourceType,
    language: "fr" as Language,
    category: "General News",
    enabled: true,
    priority: "normal",
    scrapeInterval: 1800,
    errorCount: 0,
    successCount: 0,
    totalArticlesScraped: 0,
    rateLimit: { requestsPerMinute: 2, requestsPerHour: 30, cooldownAfterError: 300 },
    parser: "rss",
    dedupStrategy: "url",
    tags: ["french", "politics", "society"],
  },
  {
    id: "feed-aujourdhui",
    name: "Aujourdhui Le Maroc",
    type: "rss",
    url: "https://www.aujourdhui.ma/feed",
    sourceType: "media" as ArticleSourceType,
    language: "fr" as Language,
    category: "General News",
    enabled: true,
    priority: "normal",
    scrapeInterval: 1800,
    errorCount: 0,
    successCount: 0,
    totalArticlesScraped: 0,
    rateLimit: { requestsPerMinute: 2, requestsPerHour: 30, cooldownAfterError: 300 },
    parser: "rss",
    dedupStrategy: "url",
    tags: ["french", "politics", "society", "economy"],
  },
  {
    id: "feed-lematin",
    name: "Le Matin",
    type: "rss",
    url: "https://www.lematin.ma/feed",
    sourceType: "media" as ArticleSourceType,
    language: "fr" as Language,
    category: "General News",
    enabled: true,
    priority: "normal",
    scrapeInterval: 1800,
    errorCount: 0,
    successCount: 0,
    totalArticlesScraped: 0,
    rateLimit: { requestsPerMinute: 2, requestsPerHour: 30, cooldownAfterError: 300 },
    parser: "rss",
    dedupStrategy: "url",
    tags: ["french", "politics", "society"],
  },
  {
    id: "feed-leseco",
    name: "LesEco",
    type: "rss",
    url: "https://www.leseco.ma/feed",
    sourceType: "media" as ArticleSourceType,
    language: "fr" as Language,
    category: "Business News",
    enabled: true,
    priority: "normal",
    scrapeInterval: 1800,
    errorCount: 0,
    successCount: 0,
    totalArticlesScraped: 0,
    rateLimit: { requestsPerMinute: 2, requestsPerHour: 30, cooldownAfterError: 300 },
    parser: "rss",
    dedupStrategy: "url",
    tags: ["french", "business", "economy", "finance"],
  },
  {
    id: "feed-jeuneafrique",
    name: "Jeune Afrique",
    type: "rss",
    url: "https://www.jeuneafrique.com/feed",
    sourceType: "media" as ArticleSourceType,
    language: "fr" as Language,
    category: "Pan-African News",
    enabled: true,
    priority: "high",
    scrapeInterval: 1800,
    errorCount: 0,
    successCount: 0,
    totalArticlesScraped: 0,
    rateLimit: { requestsPerMinute: 1, requestsPerHour: 15, cooldownAfterError: 600 },
    parser: "rss",
    dedupStrategy: "url",
    tags: ["french", "africa", "politics", "economy"],
  },
  {
    id: "feed-lavieeco",
    name: "La Vie Eco",
    type: "rss",
    url: "https://www.lavieeco.com/feed",
    sourceType: "media" as ArticleSourceType,
    language: "fr" as Language,
    category: "Business News",
    enabled: true,
    priority: "normal",
    scrapeInterval: 1800,
    errorCount: 0,
    successCount: 0,
    totalArticlesScraped: 0,
    rateLimit: { requestsPerMinute: 2, requestsPerHour: 30, cooldownAfterError: 300 },
    parser: "rss",
    dedupStrategy: "url",
    tags: ["french", "business", "economy"],
  },
  {
    id: "feed-lopinion",
    name: "L'Opinion",
    type: "rss",
    url: "https://www.lopinion.ma/feed",
    sourceType: "media" as ArticleSourceType,
    language: "fr" as Language,
    category: "General News",
    enabled: true,
    priority: "low",
    scrapeInterval: 3600,
    errorCount: 0,
    successCount: 0,
    totalArticlesScraped: 0,
    rateLimit: { requestsPerMinute: 1, requestsPerHour: 15, cooldownAfterError: 300 },
    parser: "rss",
    dedupStrategy: "url",
    tags: ["french", "politics"],
  },
  {
    id: "feed-albayane",
    name: "Al Bayane",
    type: "rss",
    url: "https://www.albayane.ma/feed",
    sourceType: "media" as ArticleSourceType,
    language: "fr" as Language,
    category: "General News",
    enabled: true,
    priority: "low",
    scrapeInterval: 3600,
    errorCount: 0,
    successCount: 0,
    totalArticlesScraped: 0,
    rateLimit: { requestsPerMinute: 1, requestsPerHour: 15, cooldownAfterError: 300 },
    parser: "rss",
    dedupStrategy: "url",
    tags: ["french", "politics", "society"],
  },
  {
    id: "feed-barlamane",
    name: "Barlamane",
    type: "rss",
    url: "https://www.barlamane.com/feed",
    sourceType: "media" as ArticleSourceType,
    language: "fr" as Language,
    category: "General News",
    enabled: true,
    priority: "low",
    scrapeInterval: 3600,
    errorCount: 0,
    successCount: 0,
    totalArticlesScraped: 0,
    rateLimit: { requestsPerMinute: 1, requestsPerHour: 15, cooldownAfterError: 300 },
    parser: "rss",
    dedupStrategy: "url",
    tags: ["french", "politics"],
  },
  {
    id: "feed-moroccoworldnews",
    name: "Morocco World News",
    type: "rss",
    url: "https://www.moroccoworldnews.com/feed",
    sourceType: "media" as ArticleSourceType,
    language: "en" as Language,
    category: "General News",
    enabled: true,
    priority: "normal",
    scrapeInterval: 1800,
    errorCount: 0,
    successCount: 0,
    totalArticlesScraped: 0,
    rateLimit: { requestsPerMinute: 2, requestsPerHour: 30, cooldownAfterError: 300 },
    parser: "rss",
    dedupStrategy: "url",
    tags: ["english", "politics", "economy", "international"],
  },
  {
    id: "feed-yabiladi",
    name: "Yabiladi",
    type: "rss",
    url: "https://www.yabiladi.com/feed",
    sourceType: "media" as ArticleSourceType,
    language: "fr" as Language,
    category: "General News",
    enabled: true,
    priority: "low",
    scrapeInterval: 3600,
    errorCount: 0,
    successCount: 0,
    totalArticlesScraped: 0,
    rateLimit: { requestsPerMinute: 1, requestsPerHour: 15, cooldownAfterError: 300 },
    parser: "rss",
    dedupStrategy: "url",
    tags: ["french", "society", "community"],
  },
  {
    id: "feed-map",
    name: "MAP (Maghreb Arabe Presse)",
    type: "rss",
    url: "https://www.mapnews.ma/feed",
    sourceType: "media" as ArticleSourceType,
    language: "fr" as Language,
    category: "State Media",
    enabled: true,
    priority: "high",
    scrapeInterval: 1800,
    errorCount: 0,
    successCount: 0,
    totalArticlesScraped: 0,
    rateLimit: { requestsPerMinute: 2, requestsPerHour: 30, cooldownAfterError: 300 },
    parser: "rss",
    dedupStrategy: "url",
    tags: ["french", "state-media", "official"],
  },
];

// ─── REGULATORY FEEDS ──────────────────────────────────────────

export const REGULATORY_FEEDS: FeedSource[] = [
  {
    id: "feed-ammc",
    name: "AMMC (Autorité Marocaine du Marché des Capitaux)",
    type: "regulatory",
    url: "https://www.ammc.ma/fr/actualites/feed",
    sourceType: "regulatory" as ArticleSourceType,
    language: "fr" as Language,
    category: "Regulatory",
    enabled: true,
    priority: "critical",
    scrapeInterval: 86400,
    errorCount: 0,
    successCount: 0,
    totalArticlesScraped: 0,
    rateLimit: { requestsPerMinute: 1, requestsPerHour: 5, cooldownAfterError: 600 },
    parser: "rss",
    dedupStrategy: "url",
    tags: ["french", "regulatory", "ammc", "capital-markets"],
  },
  {
    id: "feed-bam",
    name: "Bank Al-Maghrib (Central Bank)",
    type: "regulatory",
    url: "https://www.bkam.ma/feed",
    sourceType: "regulatory" as ArticleSourceType,
    language: "fr" as Language,
    category: "Regulatory",
    enabled: true,
    priority: "critical",
    scrapeInterval: 86400,
    errorCount: 0,
    successCount: 0,
    totalArticlesScraped: 0,
    rateLimit: { requestsPerMinute: 1, requestsPerHour: 5, cooldownAfterError: 600 },
    parser: "rss",
    dedupStrategy: "url",
    tags: ["french", "regulatory", "bam", "central-bank", "monetary-policy"],
  },
  {
    id: "feed-bvc",
    name: "Bourse des Valeurs de Casablanca",
    type: "regulatory",
    url: "https://www.casablanca-bourse.com/feed",
    sourceType: "regulatory" as ArticleSourceType,
    language: "fr" as Language,
    category: "Market",
    enabled: true,
    priority: "critical",
    scrapeInterval: 86400,
    errorCount: 0,
    successCount: 0,
    totalArticlesScraped: 0,
    rateLimit: { requestsPerMinute: 1, requestsPerHour: 5, cooldownAfterError: 600 },
    parser: "rss",
    dedupStrategy: "url",
    tags: ["french", "regulatory", "bvc", "stock-exchange", "market"],
  },
];

// ─── BVC PRICE FEEDS ───────────────────────────────────────────

export const BVC_PRICE_FEEDS: FeedSource[] = [
  {
    id: "feed-bvc-prices",
    name: "BVC Daily Closing Prices",
    type: "api",
    url: "https://www.casablanca-bourse.com/api/prices",
    sourceType: "market" as ArticleSourceType,
    language: "fr" as Language,
    category: "Market Data",
    enabled: true,
    priority: "critical",
    scrapeInterval: 86400,
    errorCount: 0,
    successCount: 0,
    totalArticlesScraped: 0,
    rateLimit: { requestsPerMinute: 1, requestsPerHour: 5, cooldownAfterError: 600 },
    parser: "json",
    dedupStrategy: "url",
    tags: ["prices", "bvc", "market-data"],
    metadata: { tickers: ["OCP", "IAM", "ATW", "BAO", "BCP", "CIH", "CFG", "LAS", "CSU", "MNG", "LHM"] },
  },
];

// ─── AI ENGINE FEEDS ───────────────────────────────────────────

export const AI_ENGINE_FEEDS: FeedSource[] = [
  {
    id: "feed-chatgpt",
    name: "ChatGPT Visibility Prober",
    type: "ai",
    url: "https://api.openai.com/v1/chat/completions",
    sourceType: "ai" as ArticleSourceType,
    language: "en" as Language,
    category: "AI Visibility",
    enabled: true,
    priority: "normal",
    scrapeInterval: 86400,
    errorCount: 0,
    successCount: 0,
    totalArticlesScraped: 0,
    rateLimit: { requestsPerMinute: 1, requestsPerHour: 10, cooldownAfterError: 300 },
    parser: "json",
    dedupStrategy: "url",
    tags: ["ai", "chatgpt", "openai"],
    metadata: { model: "gpt-4", prompt: "What do you know about {company}?" },
  },
  {
    id: "feed-claude",
    name: "Claude Visibility Prober",
    type: "ai",
    url: "https://api.anthropic.com/v1/messages",
    sourceType: "ai" as ArticleSourceType,
    language: "en" as Language,
    category: "AI Visibility",
    enabled: true,
    priority: "normal",
    scrapeInterval: 86400,
    errorCount: 0,
    successCount: 0,
    totalArticlesScraped: 0,
    rateLimit: { requestsPerMinute: 1, requestsPerHour: 10, cooldownAfterError: 300 },
    parser: "json",
    dedupStrategy: "url",
    tags: ["ai", "claude", "anthropic"],
    metadata: { model: "claude-sonnet-4-20250514", prompt: "What do you know about {company}?" },
  },
  {
    id: "feed-gemini",
    name: "Gemini Visibility Prober",
    type: "ai",
    url: "https://generativelanguage.googleapis.com/v1beta/models",
    sourceType: "ai" as ArticleSourceType,
    language: "en" as Language,
    category: "AI Visibility",
    enabled: true,
    priority: "normal",
    scrapeInterval: 86400,
    errorCount: 0,
    successCount: 0,
    totalArticlesScraped: 0,
    rateLimit: { requestsPerMinute: 1, requestsPerHour: 10, cooldownAfterError: 300 },
    parser: "json",
    dedupStrategy: "url",
    tags: ["ai", "gemini", "google"],
    metadata: { model: "gemini-2.5-flash", prompt: "What do you know about {company}?" },
  },
  {
    id: "feed-perplexity",
    name: "Perplexity Visibility Prober",
    type: "ai",
    url: "https://api.perplexity.ai/chat/completions",
    sourceType: "ai" as ArticleSourceType,
    language: "en" as Language,
    category: "AI Visibility",
    enabled: true,
    priority: "normal",
    scrapeInterval: 86400,
    errorCount: 0,
    successCount: 0,
    totalArticlesScraped: 0,
    rateLimit: { requestsPerMinute: 1, requestsPerHour: 10, cooldownAfterError: 300 },
    parser: "json",
    dedupStrategy: "url",
    tags: ["ai", "perplexity"],
    metadata: { model: "pplx-70b-online", prompt: "What do you know about {company}?" },
  },
  {
    id: "feed-copilot",
    name: "Copilot Visibility Prober",
    type: "ai",
    url: "https://api.githubcopilot.com/chat/completions",
    sourceType: "ai" as ArticleSourceType,
    language: "en" as Language,
    category: "AI Visibility",
    enabled: true,
    priority: "normal",
    scrapeInterval: 86400,
    errorCount: 0,
    successCount: 0,
    totalArticlesScraped: 0,
    rateLimit: { requestsPerMinute: 1, requestsPerHour: 10, cooldownAfterError: 300 },
    parser: "json",
    dedupStrategy: "url",
    tags: ["ai", "copilot", "microsoft"],
    metadata: { model: "gpt-4-turbo", prompt: "What do you know about {company}?" },
  },
  {
    id: "feed-mistral",
    name: "Mistral Visibility Prober",
    type: "ai",
    url: "https://api.mistral.ai/v1/chat/completions",
    sourceType: "ai" as ArticleSourceType,
    language: "en" as Language,
    category: "AI Visibility",
    enabled: true,
    priority: "normal",
    scrapeInterval: 86400,
    errorCount: 0,
    successCount: 0,
    totalArticlesScraped: 0,
    rateLimit: { requestsPerMinute: 1, requestsPerHour: 10, cooldownAfterError: 300 },
    parser: "json",
    dedupStrategy: "url",
    tags: ["ai", "mistral"],
    metadata: { model: "mistral-large-latest", prompt: "What do you know about {company}?" },
  },
  {
    id: "feed-grok",
    name: "Grok Visibility Prober",
    type: "ai",
    url: "https://api.x.ai/v1/chat/completions",
    sourceType: "ai" as ArticleSourceType,
    language: "en" as Language,
    category: "AI Visibility",
    enabled: true,
    priority: "normal",
    scrapeInterval: 86400,
    errorCount: 0,
    successCount: 0,
    totalArticlesScraped: 0,
    rateLimit: { requestsPerMinute: 1, requestsPerHour: 10, cooldownAfterError: 300 },
    parser: "json",
    dedupStrategy: "url",
    tags: ["ai", "grok", "x"],
    metadata: { model: "grok-beta", prompt: "What do you know about {company}?" },
  },
  {
    id: "feed-llama",
    name: "Llama Visibility Prober",
    type: "ai",
    url: "http://localhost:11434/api/generate",
    sourceType: "ai" as ArticleSourceType,
    language: "en" as Language,
    category: "AI Visibility",
    enabled: true,
    priority: "normal",
    scrapeInterval: 86400,
    errorCount: 0,
    successCount: 0,
    totalArticlesScraped: 0,
    rateLimit: { requestsPerMinute: 2, requestsPerHour: 20, cooldownAfterError: 60 },
    parser: "json",
    dedupStrategy: "url",
    tags: ["ai", "llama", "meta", "local"],
    metadata: { model: "llama-3.2-3b-instruct", prompt: "What do you know about {company}?" },
  },
];

// ─── ALL FEEDS COMBINED ────────────────────────────────────────

export const ALL_FEED_SOURCES: FeedSource[] = [
  ...MOROCCAN_RSS_FEEDS,
  ...REGULATORY_FEEDS,
  ...BVC_PRICE_FEEDS,
  ...AI_ENGINE_FEEDS,
];

// ─── FEED MANAGER ──────────────────────────────────────────────

export class FeedManager {
  private sources: Map<string, FeedSource> = new Map();
  private healthRecords: Map<string, FeedHealth> = new Map();
  private scrapeResults: Map<string, ScrapeResult[]> = new Map();
  private rateLimitCounters: Map<string, { minute: number; hour: number; lastReset: Date }> = new Map();

  constructor() {
    for (const source of ALL_FEED_SOURCES) {
      this.sources.set(source.id, { ...source });
      this.healthRecords.set(source.id, {
        sourceId: source.id,
        status: source.enabled ? "healthy" : "disabled",
        uptime: 100,
        averageResponseTime: 0,
        lastCheck: new Date(),
        consecutiveErrors: 0,
        totalRequests: 0,
        failedRequests: 0,
        articlesPerHour: 0,
        articlesPerDay: 0,
      });
      this.scrapeResults.set(source.id, []);
      this.rateLimitCounters.set(source.id, { minute: 0, hour: 0, lastReset: new Date() });
    }
  }

  getSource(id: string): FeedSource | undefined {
    return this.sources.get(id);
  }

  getAllSources(): FeedSource[] {
    return [...this.sources.values()];
  }

  getEnabledSources(): FeedSource[] {
    return [...this.sources.values()].filter(s => s.enabled);
  }

  getSourcesByType(type: FeedSource["type"]): FeedSource[] {
    return [...this.sources.values()].filter(s => s.type === type);
  }

  getSourcesByCategory(category: string): FeedSource[] {
    return [...this.sources.values()].filter(s => s.category === category);
  }

  getSourcesByPriority(priority: FeedSource["priority"]): FeedSource[] {
    return [...this.sources.values()].filter(s => s.priority === priority);
  }

  getSourcesByLanguage(language: Language): FeedSource[] {
    return [...this.sources.values()].filter(s => s.language === language);
  }

  enableSource(id: string): boolean {
    const source = this.sources.get(id);
    if (!source) return false;
    source.enabled = true;
    return true;
  }

  disableSource(id: string): boolean {
    const source = this.sources.get(id);
    if (!source) return false;
    source.enabled = false;
    return true;
  }

  addSource(source: FeedSource): void {
    this.sources.set(source.id, source);
    this.healthRecords.set(source.id, {
      sourceId: source.id,
      status: source.enabled ? "healthy" : "disabled",
      uptime: 100,
      averageResponseTime: 0,
      lastCheck: new Date(),
      consecutiveErrors: 0,
      totalRequests: 0,
      failedRequests: 0,
      articlesPerHour: 0,
      articlesPerDay: 0,
    });
  }

  removeSource(id: string): boolean {
    const deleted = this.sources.delete(id);
    this.healthRecords.delete(id);
    this.scrapeResults.delete(id);
    this.rateLimitCounters.delete(id);
    return deleted;
  }

  canScrape(id: string): boolean {
    const source = this.sources.get(id);
    if (!source || !source.enabled) return false;

    const health = this.healthRecords.get(id);
    if (health && health.consecutiveErrors >= 5) return false;

    const counter = this.rateLimitCounters.get(id);
    if (!counter) return true;

    const now = new Date();
    const elapsed = now.getTime() - counter.lastReset.getTime();

    if (elapsed >= 60000) counter.minute = 0;
    if (elapsed >= 3600000) counter.hour = 0;
    counter.lastReset = now;

    if (counter.minute >= source.rateLimit.requestsPerMinute) return false;
    if (counter.hour >= source.rateLimit.requestsPerHour) return false;

    counter.minute++;
    counter.hour++;

    return true;
  }

  recordScrapeResult(result: ScrapeResult): void {
    const source = this.sources.get(result.sourceId);
    const health = this.healthRecords.get(result.sourceId);
    const results = this.scrapeResults.get(result.sourceId);

    if (!source || !health) return;

    source.lastScrape = new Date(result.timestamp);
    source.totalArticlesScraped += result.articlesNew;

    if (result.success) {
      source.lastSuccess = new Date(result.timestamp);
      source.successCount++;
      health.consecutiveErrors = 0;
      health.status = "healthy";
    } else {
      source.lastError = result.error || "Unknown error";
      source.errorCount++;
      health.consecutiveErrors++;
      health.status = health.consecutiveErrors >= 5 ? "down" : "degraded";
    }

    health.totalRequests++;
    if (!result.success) health.failedRequests++;
    health.lastCheck = new Date();
    health.uptime = (health.totalRequests - health.failedRequests) / health.totalRequests * 100;

    if (results) {
      results.unshift(result);
      if (results.length > 100) results.length = 100;
    }
  }

  getHealth(id: string): FeedHealth | undefined {
    return this.healthRecords.get(id);
  }

  getAllHealth(): FeedHealth[] {
    return [...this.healthRecords.values()];
  }

  getStats(): FeedStats {
    const sources = [...this.sources.values()];
    const healths = [...this.healthRecords.values()];

    const enabled = sources.filter(s => s.enabled);
    const healthy = healths.filter(h => h.status === "healthy");
    const degraded = healths.filter(h => h.status === "degraded");
    const down = healths.filter(h => h.status === "down");

    const totalArticles = sources.reduce((sum, s) => sum + s.totalArticlesScraped, 0);
    const totalRequests = healths.reduce((sum, h) => sum + h.totalRequests, 0);
    const failedRequests = healths.reduce((sum, h) => sum + h.failedRequests, 0);
    const avgResponseTime = healths.reduce((sum, h) => sum + h.averageResponseTime, 0) / (healths.length || 1);

    return {
      totalSources: sources.length,
      enabledSources: enabled.length,
      healthySources: healthy.length,
      degradedSources: degraded.length,
      downSources: down.length,
      totalArticlesScraped: totalArticles,
      totalArticlesToday: 0,
      averageResponseTime: avgResponseTime,
      totalErrors: failedRequests,
      totalRequests: totalRequests,
      successRate: totalRequests > 0 ? ((totalRequests - failedRequests) / totalRequests) * 100 : 100,
    };
  }

  getSourcesNeedingScrape(): FeedSource[] {
    const now = Date.now();
    return this.getEnabledSources().filter(source => {
      if (!source.lastScrape) return true;
      const elapsed = now - source.lastScrape.getTime();
      return elapsed >= source.scrapeInterval * 1000;
    });
  }

  getRecentResults(id: string, limit: number = 10): ScrapeResult[] {
    const results = this.scrapeResults.get(id);
    return results ? results.slice(0, limit) : [];
  }

  resetErrors(id: string): boolean {
    const source = this.sources.get(id);
    const health = this.healthRecords.get(id);
    if (!source || !health) return false;
    source.errorCount = 0;
    source.lastError = undefined;
    health.consecutiveErrors = 0;
    health.status = source.enabled ? "healthy" : "disabled";
    return true;
  }

  resetAllErrors(): void {
    for (const id of this.sources.keys()) {
      this.resetErrors(id);
    }
  }
}

// ─── RSS PARSER ────────────────────────────────────────────────

export interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate?: string;
  guid?: string;
  categories?: string[];
  author?: string;
  enclosure?: {
    url: string;
    type: string;
    length?: number;
  };
}

export interface RSSFeed {
  title: string;
  link: string;
  description: string;
  language?: string;
  lastBuildDate?: string;
  items: RSSItem[];
}

export class RSSParser {
  static parse(xml: string): RSSFeed | null {
    try {
      const title = this.extractTag(xml, "title");
      const link = this.extractTag(xml, "link");
      const description = this.extractTag(xml, "description");
      const language = this.extractTag(xml, "language");
      const lastBuildDate = this.extractTag(xml, "lastBuildDate");

      const items: RSSItem[] = [];
      const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
      let match;

      while ((match = itemRegex.exec(xml)) !== null) {
        const itemXml = match[1];
        items.push({
          title: this.extractTag(itemXml, "title") || "",
          link: this.extractTag(itemXml, "link") || "",
          description: this.stripHtml(this.extractTag(itemXml, "description") || ""),
          pubDate: this.extractTag(itemXml, "pubDate"),
          guid: this.extractTag(itemXml, "guid"),
          categories: this.extractAllTags(itemXml, "category"),
          author: this.extractTag(itemXml, "author") || this.extractTag(itemXml, "dc:creator"),
          enclosure: this.parseEnclosure(itemXml),
        });
      }

      return { title, link, description, language, lastBuildDate, items };
    } catch {
      return null;
    }
  }

  static parseAtom(xml: string): RSSFeed | null {
    try {
      const title = this.extractTag(xml, "title");
      const link = this.extractTag(xml, "link");
      const subtitle = this.extractTag(xml, "subtitle");
      const updated = this.extractTag(xml, "updated");

      const items: RSSItem[] = [];
      const entryRegex = /<entry[^>]*>([\s\S]*?)<\/entry>/gi;
      let match;

      while ((match = entryRegex.exec(xml)) !== null) {
        const entryXml = match[1];
        items.push({
          title: this.extractTag(entryXml, "title") || "",
          link: this.extractTag(entryXml, "link") || this.extractAttr(entryXml, "link", "href"),
          description: this.stripHtml(this.extractTag(entryXml, "summary") || this.extractTag(entryXml, "content") || ""),
          pubDate: this.extractTag(entryXml, "published") || this.extractTag(entryXml, "updated"),
          guid: this.extractTag(entryXml, "id"),
          categories: this.extractAllTags(entryXml, "category"),
          author: this.extractTag(entryXml, "name"),
        });
      }

      return { title, link, description: subtitle, lastBuildDate: updated, items };
    } catch {
      return null;
    }
  }

  private static extractTag(xml: string, tag: string): string {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
    const match = xml.match(regex);
    return match ? match[1].trim() : "";
  }

  private static extractAllTags(xml: string, tag: string): string[] {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(xml)) !== null) {
      matches.push(match[1].trim());
    }
    return matches;
  }

  private static extractAttr(xml: string, tag: string, attr: string): string {
    const regex = new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, "i");
    const match = xml.match(regex);
    return match ? match[1] : "";
  }

  private static parseEnclosure(xml: string): RSSItem["enclosure"] | undefined {
    const regex = /<enclosure[^>]*url="([^"]*)"[^>]*type="([^"]*)"[^>]*>/i;
    const match = xml.match(regex);
    if (!match) return undefined;
    const lengthMatch = xml.match(/length="(\d+)"/i);
    return {
      url: match[1],
      type: match[2],
      length: lengthMatch ? parseInt(lengthMatch[1], 10) : undefined,
    };
  }

  private static stripHtml(html: string): string {
    return html
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ")
      .trim();
  }
}

// ─── DEDUPLICATION ─────────────────────────────────────────────

export class Deduplicator {
  private seenUrls: Set<string> = new Set();
  private seenTitles: Map<string, number> = new Map();
  private seenContentHashes: Set<string> = new Set();

  isDuplicate(item: RSSItem, strategy: FeedSource["dedupStrategy"]): boolean {
    switch (strategy) {
      case "url":
        if (this.seenUrls.has(item.link)) return true;
        this.seenUrls.add(item.link);
        return false;

      case "title":
        const titleKey = item.title.toLowerCase().trim();
        if (this.seenTitles.has(titleKey)) return true;
        this.seenTitles.set(titleKey, 1);
        return false;

      case "content_hash":
        const contentHash = this.hashContent(item.title + item.description);
        if (this.seenContentHashes.has(contentHash)) return true;
        this.seenContentHashes.add(contentHash);
        return false;

      case "url_and_title":
        if (this.seenUrls.has(item.link)) return true;
        const titleKey2 = item.title.toLowerCase().trim();
        if (this.seenTitles.has(titleKey2)) return true;
        this.seenUrls.add(item.link);
        this.seenTitles.set(titleKey2, 1);
        return false;

      default:
        return false;
    }
  }

  private hashContent(text: string): string {
    const normalized = text.toLowerCase().replace(/\s+/g, " ").trim().slice(0, 500);
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return hash.toString(16);
  }

  clear(): void {
    this.seenUrls.clear();
    this.seenTitles.clear();
    this.seenContentHashes.clear();
  }

  getStats(): { urls: number; titles: number; hashes: number } {
    return {
      urls: this.seenUrls.size,
      titles: this.seenTitles.size,
      hashes: this.seenContentHashes.size,
    };
  }
}

// ─── SCRAPE ORCHESTRATOR ───────────────────────────────────────

export class ScrapeOrchestrator {
  private feedManager: FeedManager;
  private deduplicator: Deduplicator;

  constructor(feedManager?: FeedManager) {
    this.feedManager = feedManager || new FeedManager();
    this.deduplicator = new Deduplicator();
  }

  getFeedManager(): FeedManager {
    return this.feedManager;
  }

  async scrapeSource(sourceId: string): Promise<ScrapeResult> {
    const source = this.feedManager.getSource(sourceId);
    if (!source) {
      return {
        sourceId,
        success: false,
        articlesFound: 0,
        articlesNew: 0,
        articlesDuplicate: 0,
        duration: 0,
        error: "Source not found",
        timestamp: new Date().toISOString(),
        sampleTitles: [],
      };
    }

    if (!this.feedManager.canScrape(sourceId)) {
      return {
        sourceId,
        success: false,
        articlesFound: 0,
        articlesNew: 0,
        articlesDuplicate: 0,
        duration: 0,
        error: "Rate limited or source disabled",
        timestamp: new Date().toISOString(),
        sampleTitles: [],
      };
    }

    const startTime = Date.now();

    try {
      // In production, this would actually fetch the feed
      // For now, simulate a successful scrape
      const articlesFound = Math.floor(Math.random() * 20) + 1;
      const articlesNew = Math.floor(articlesFound * 0.7);
      const articlesDuplicate = articlesFound - articlesNew;

      const sampleTitles = Array.from({ length: Math.min(3, articlesNew) }, (_, i) =>
        `${source.name} article #${i + 1}`
      );

      const duration = Date.now() - startTime;

      const result: ScrapeResult = {
        sourceId,
        success: true,
        articlesFound,
        articlesNew,
        articlesDuplicate,
        duration,
        timestamp: new Date().toISOString(),
        sampleTitles,
      };

      this.feedManager.recordScrapeResult(result);
      return result;
    } catch (err) {
      const duration = Date.now() - startTime;
      const result: ScrapeResult = {
        sourceId,
        success: false,
        articlesFound: 0,
        articlesNew: 0,
        articlesDuplicate: 0,
        duration,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
        sampleTitles: [],
      };

      this.feedManager.recordScrapeResult(result);
      return result;
    }
  }

  async scrapeAllDue(): Promise<ScrapeResult[]> {
    const due = this.feedManager.getSourcesNeedingScrape();
    const results: ScrapeResult[] = [];

    for (const source of due) {
      const result = await this.scrapeSource(source.id);
      results.push(result);
    }

    return results;
  }

  async scrapeByType(type: FeedSource["type"]): Promise<ScrapeResult[]> {
    const sources = this.feedManager.getSourcesByType(type).filter(s => s.enabled);
    const results: ScrapeResult[] = [];

    for (const source of sources) {
      const result = await this.scrapeSource(source.id);
      results.push(result);
    }

    return results;
  }

  async scrapeByPriority(priority: FeedSource["priority"]): Promise<ScrapeResult[]> {
    const sources = this.feedManager.getSourcesByPriority(priority).filter(s => s.enabled);
    const results: ScrapeResult[] = [];

    for (const source of sources) {
      const result = await this.scrapeSource(source.id);
      results.push(result);
    }

    return results;
  }

  getStats(): FeedStats {
    return this.feedManager.getStats();
  }
}

// ─── SINGLETON INSTANCE ────────────────────────────────────────

let orchestratorInstance: ScrapeOrchestrator | null = null;

export function getScrapeOrchestrator(): ScrapeOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new ScrapeOrchestrator();
  }
  return orchestratorInstance;
}

// ─── FEED SOURCE HELPERS ───────────────────────────────────────

export function getFeedSourceCount(): number {
  return ALL_FEED_SOURCES.length;
}

export function getRSSFeedCount(): number {
  return MOROCCAN_RSS_FEEDS.length;
}

export function getRegulatoryFeedCount(): number {
  return REGULATORY_FEEDS.length;
}

export function getAIFeedCount(): number {
  return AI_ENGINE_FEEDS.length;
}

export function getFeedSourceById(id: string): FeedSource | undefined {
  return ALL_FEED_SOURCES.find(s => s.id === id);
}

export function getFeedSourcesByLanguage(language: Language): FeedSource[] {
  return ALL_FEED_SOURCES.filter(s => s.language === language);
}

export function getFeedSourcesByCategory(category: string): FeedSource[] {
  return ALL_FEED_SOURCES.filter(s => s.category === category);
}

export function getFeedSourcesByType(type: FeedSource["type"]): FeedSource[] {
  return ALL_FEED_SOURCES.filter(s => s.type === type);
}

export function getEnabledFeedSources(): FeedSource[] {
  return ALL_FEED_SOURCES.filter(s => s.enabled);
}

export function getCriticalFeedSources(): FeedSource[] {
  return ALL_FEED_SOURCES.filter(s => s.priority === "critical");
}

export function getHighPriorityFeedSources(): FeedSource[] {
  return ALL_FEED_SOURCES.filter(s => s.priority === "high");
}

export function getTotalScrapeIntervalSeconds(): number {
  return ALL_FEED_SOURCES.reduce((sum, s) => sum + s.scrapeInterval, 0);
}

export function getAverageScrapeIntervalSeconds(): number {
  return getTotalScrapeIntervalSeconds() / (ALL_FEED_SOURCES.length || 1);
}

export function getFeedSourceStats(): {
  total: number;
  byType: Record<string, number>;
  byLanguage: Record<string, number>;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  enabled: number;
  disabled: number;
} {
  const byType: Record<string, number> = {};
  const byLanguage: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  const byPriority: Record<string, number> = {};

  for (const source of ALL_FEED_SOURCES) {
    byType[source.type] = (byType[source.type] || 0) + 1;
    byLanguage[source.language] = (byLanguage[source.language] || 0) + 1;
    byCategory[source.category] = (byCategory[source.category] || 0) + 1;
    byPriority[source.priority] = (byPriority[source.priority] || 0) + 1;
  }

  return {
    total: ALL_FEED_SOURCES.length,
    byType,
    byLanguage,
    byCategory,
    byPriority,
    enabled: ALL_FEED_SOURCES.filter(s => s.enabled).length,
    disabled: ALL_FEED_SOURCES.filter(s => !s.enabled).length,
  };
}
