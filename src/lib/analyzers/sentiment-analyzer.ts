// ═══════════════════════════════════════════════════════════════
//  GLM-4 ANALYZER — Sentiment analysis, entity extraction, trends
//  Uses Zernio API (GLM-4) for natural language processing
// ═══════════════════════════════════════════════════════════════

import { Article } from "../scrapers/rss-scraper";

export interface SentimentResult {
  sentiment: "positive" | "neutral" | "negative";
  score: number; // -1 (very negative) to 1 (very positive)
  entities: string[]; // company names mentioned
  topics: string[];
  summary: string; // 1-2 sentence summary
  relevanceScore: number; // 0-100, how relevant to tracked company
}

export interface TrendResult {
  topic: string;
  velocity: number; // % increase in 24h
  articleCount24h: number;
  articleCountPrev24h: number;
  trend: "rising" | "falling" | "stable";
  alert: boolean; // true if velocity > threshold
}

export interface CompanyReputationScore {
  companyName: string;
  score: number; // 0-100
  sentimentPositive: number; // %
  sentimentNeutral: number; // %
  sentimentNegative: number; // %
  totalArticles: number;
  totalMentions: number;
  aiCitations: number;
  aiRank: string;
  topCompetitor: string;
  topCompetitorScore: number;
  emergingRisk: string;
  riskIncrease: number;
  trend: "up" | "down" | "stable";
  trendChange: number;
}

// ─── GLM-4 API WRAPPER ───────────────────────────────────────────

const ZERNIO_KEY = process.env.ZERNIO_API_KEY;
const ZERNIO_BASE = "https://zernio.com/api/v1";

async function callGLM4(prompt: string, systemPrompt?: string): Promise<string> {
  // In production, use Zernio API or direct ZAI SDK
  // For now, use the z-ai-web-dev-sdk if available
  // Fallback: use a local heuristic analyzer

  try {
    // Try Zernio API first (if key is available)
    if (ZERNIO_KEY) {
      const response = await fetch(`${ZERNIO_BASE}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${ZERNIO_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "glm-4",
          messages: [
            ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
            { role: "user", content: prompt },
          ],
          temperature: 0.3, // Low temperature for consistent analysis
          max_tokens: 500,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices?.[0]?.message?.content || "";
      }
    }

    // Fallback to heuristic analysis
    return heuristicAnalysis(prompt);
  } catch (error) {
    console.error("[analyzer] GLM-4 call failed, using heuristic:", error);
    return heuristicAnalysis(prompt);
  }
}

// ─── HEURISTIC FALLBACK ──────────────────────────────────────────

const POSITIVE_WORDS = [
  "succès", "croissance", "excellent", "positif", "innovation", "progression",
  "réussite", "performance", "leader", "prix", "award", "investissement",
  "expansion", "lancement", "partenariat", "record", "bénéfice", "gain",
  "success", "growth", "excellent", "positive", "innovation", "progress",
  "achievement", "performance", "leader", "award", "investment", "expansion",
  "launch", "partnership", "record", "profit", "gain",
];

const NEGATIVE_WORDS = [
  "crise", "perte", "échec", "négatif", "controversé", "scandale",
  "corruption", "fraude", "licenciement", "faillite", "procès", "enquête",
  "condamnation", "amiende", "déclin", "chute", "baisse", "problème",
  "crisis", "loss", "failure", "negative", "controversial", "scandal",
  "corruption", "fraud", "layoff", "bankruptcy", "lawsuit", "investigation",
  "conviction", "fine", "decline", "fall", "drop", "problem",
];

function heuristicAnalysis(text: string): string {
  const lower = text.toLowerCase();
  let positiveCount = 0;
  let negativeCount = 0;

  for (const word of POSITIVE_WORDS) {
    if (lower.includes(word)) positiveCount++;
  }
  for (const word of NEGATIVE_WORDS) {
    if (lower.includes(word)) negativeCount++;
  }

  if (positiveCount > negativeCount) return JSON.stringify({ sentiment: "positive", score: 0.5 });
  if (negativeCount > positiveCount) return JSON.stringify({ sentiment: "negative", score: -0.5 });
  return JSON.stringify({ sentiment: "neutral", score: 0 });
}

// ─── SENTIMENT ANALYSIS ──────────────────────────────────────────

export async function analyzeSentiment(
  article: Article,
  trackedCompany: string
): Promise<SentimentResult> {
  const text = `${article.title}. ${article.summary}`;

  const systemPrompt = `You are a reputation intelligence analyst. Analyze the sentiment of the following article about ${trackedCompany}. Return ONLY a JSON object with fields: sentiment (positive/neutral/negative), score (-1 to 1), entities (array of company names mentioned), topics (array of topics), summary (1-2 sentences), relevanceScore (0-100).`;

  const result = await callGLM4(
    `Analyze this article:\n\nTitle: ${article.title}\nSummary: ${article.summary}\nSource: ${article.sourceName}\nDate: ${article.publishedAt}\n\nReturn JSON only.`,
    systemPrompt
  );

  try {
    // Try to parse JSON from response
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        sentiment: parsed.sentiment || "neutral",
        score: parsed.score || 0,
        entities: parsed.entities || [trackedCompany],
        topics: parsed.topics || [],
        summary: parsed.summary || article.summary.slice(0, 200),
        relevanceScore: parsed.relevanceScore || 50,
      };
    }
  } catch (e) {
    // JSON parse failed — use heuristic
  }

  // Fallback: heuristic
  const lower = text.toLowerCase();
  let positiveCount = 0;
  let negativeCount = 0;

  for (const word of POSITIVE_WORDS) {
    if (lower.includes(word)) positiveCount++;
  }
  for (const word of NEGATIVE_WORDS) {
    if (lower.includes(word)) negativeCount++;
  }

  const sentiment = positiveCount > negativeCount ? "positive" : negativeCount > positiveCount ? "negative" : "neutral";
  const score = positiveCount > negativeCount ? 0.5 : negativeCount > positiveCount ? -0.5 : 0;

  return {
    sentiment,
    score,
    entities: [trackedCompany],
    topics: [],
    summary: article.summary.slice(0, 200),
    relevanceScore: 60,
  };
}

// ─── BATCH ANALYSIS ──────────────────────────────────────────────

export async function analyzeArticles(
  articles: Article[],
  trackedCompany: string
): Promise<Article[]> {
  console.log(`[analyzer] Analyzing ${articles.length} articles for ${trackedCompany}`);

  const analyzed: Article[] = [];

  // Process in batches of 10 to avoid rate limits
  const batchSize = 10;
  for (let i = 0; i < articles.length; i += batchSize) {
    const batch = articles.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(async (article) => {
        const sentiment = await analyzeSentiment(article, trackedCompany);
        return {
          ...article,
          sentiment: sentiment.sentiment,
          sentimentScore: sentiment.score,
          entities: sentiment.entities,
          topics: sentiment.topics,
          relevanceScore: sentiment.relevanceScore,
        };
      })
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        analyzed.push(result.value);
      }
    }

    // Small delay between batches
    if (i + batchSize < articles.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log(`[analyzer] Analyzed ${analyzed.length}/${articles.length} articles`);
  return analyzed;
}

// ─── TREND DETECTION ─────────────────────────────────────────────

export function detectTrends(articles: Article[], threshold = 30): TrendResult[] {
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const prev24h = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  // Group articles by topic
  const topicGroups: Record<string, Article[]> = {};
  for (const article of articles) {
    const topics = article.topics || [];
    for (const topic of topics) {
      if (!topicGroups[topic]) topicGroups[topic] = [];
      topicGroups[topic].push(article);
    }
  }

  const trends: TrendResult[] = [];

  for (const [topic, topicArticles] of Object.entries(topicGroups)) {
    const articles24h = topicArticles.filter(a => new Date(a.publishedAt) >= last24h).length;
    const articlesPrev24h = topicArticles.filter(a => {
      const date = new Date(a.publishedAt);
      return date >= prev24h && date < last24h;
    }).length;

    if (articles24h === 0) continue;

    const velocity = articlesPrev24h > 0
      ? ((articles24h - articlesPrev24h) / articlesPrev24h) * 100
      : articles24h * 100; // New topic

    trends.push({
      topic,
      velocity: Math.round(velocity),
      articleCount24h: articles24h,
      articleCountPrev24h: articlesPrev24h,
      trend: velocity > threshold ? "rising" : velocity < -threshold ? "falling" : "stable",
      alert: velocity > threshold,
    });
  }

  // Sort by velocity descending
  return trends.sort((a, b) => b.velocity - a.velocity);
}

// ─── REPUTATION SCORE CALCULATION ────────────────────────────────

export function calculateReputationScore(
  companyName: string,
  articles: Article[],
  aiCitations: number = 0,
  aiRank: string = "#1",
  competitorName: string = "",
  competitorScore: number = 0
): CompanyReputationScore {
  const totalArticles = articles.length;

  const positive = articles.filter(a => a.sentiment === "positive").length;
  const negative = articles.filter(a => a.sentiment === "negative").length;
  const neutral = articles.filter(a => a.sentiment === "neutral").length;

  const sentimentPositive = totalArticles > 0 ? Math.round((positive / totalArticles) * 100) : 0;
  const sentimentNeutral = totalArticles > 0 ? Math.round((neutral / totalArticles) * 100) : 0;
  const sentimentNegative = totalArticles > 0 ? Math.round((negative / totalArticles) * 100) : 0;

  // Composite score (0-100)
  // 40% sentiment, 30% AI visibility, 20% volume, 10% social
  const sentimentScore = sentimentPositive - sentimentNegative; // -100 to 100
  const normalizedSentiment = (sentimentScore + 100) / 2; // 0 to 100

  const aiScore = Math.min(100, aiCitations * 5); // 20 citations = 100

  const volumeScore = Math.min(100, totalArticles * 2); // 50 articles = 100

  const socialScore = 50; // Placeholder — would come from social monitoring

  const score = Math.round(
    normalizedSentiment * 0.4 +
    aiScore * 0.3 +
    volumeScore * 0.2 +
    socialScore * 0.1
  );

  // Find emerging risk (highest velocity topic that's negative)
  const trends = detectTrends(articles);
  const negativeTrends = trends.filter(t => t.alert);
  const emergingRisk = negativeTrends[0]?.topic || "None detected";
  const riskIncrease = negativeTrends[0]?.velocity || 0;

  return {
    companyName,
    score: Math.min(100, Math.max(0, score)),
    sentimentPositive,
    sentimentNeutral,
    sentimentNegative,
    totalArticles,
    totalMentions: totalArticles * 5, // Estimate: each article generates ~5 social mentions
    aiCitations,
    aiRank,
    topCompetitor: competitorName,
    topCompetitorScore: competitorScore,
    emergingRisk,
    riskIncrease,
    trend: score > 70 ? "up" : score < 50 ? "down" : "stable",
    trendChange: 0, // Would compare to previous period
  };
}
