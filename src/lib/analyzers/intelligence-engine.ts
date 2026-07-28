// ═══════════════════════════════════════════════════════════════
//  HARCH INTELLIGENCE ENGINE v2
//  Institutional-grade reputation intelligence system
//  
//  Inspired by:
//  - Signal AI (entity-level sentiment, risk matrix, narrative tracking)
//  - Meltwater (media monitoring, share of voice)
//  - mghrib-news-engine (CAMeL-Lab BERT for Arabic sentiment)
//  - Brandwatch (social listening, topic clustering)
//  
//  Architecture: Scrape → Extract → Analyze → Score → Rank → Alert
// ═══════════════════════════════════════════════════════════════

import { Article } from "../scrapers/rss-scraper";

// ─── TYPES ───────────────────────────────────────────────────────

export interface EntitySentiment {
  entity: string;        // Company name
  sentiment: "positive" | "neutral" | "negative";
  score: number;         // -1 to 1
  confidence: number;    // 0 to 1
  context: string;       // The sentence containing the entity
}

export interface TopicCluster {
  topic: string;
  label: string;         // Human-readable label
  articleIds: string[];
  articleCount: number;
  sentimentDistribution: { positive: number; neutral: number; negative: number };
  velocity24h: number;   // % change
  velocity7d: number;
  trend: "rising" | "falling" | "stable";
  riskLevel: "low" | "medium" | "high" | "critical";
}

export interface NarrativeArc {
  narrative: string;     // e.g. "Bank of Africa is expanding in Africa"
  strength: number;      // 0-100, how dominant this narrative is
  sentiment: number;     // -1 to 1
  articleCount: number;
  firstSeen: string;     // ISO date
  lastSeen: string;
  trend: "emerging" | "growing" | "peak" | "declining";
}

export interface CompetitorBenchmark {
  companyName: string;
  score: number;
  scoreDelta: number;    // Change from previous period
  shareOfVoice: number;  // % of total coverage
  sentimentGap: number;  // Difference in positive sentiment vs tracked company
  aiVisibilityGap: number; // Difference in AI citations
  topStrength: string;   // What they're doing well
  topWeakness: string;   // Where they're vulnerable
}

export interface RiskAssessment {
  overallRisk: number;   // 0-100
  riskLevel: "low" | "moderate" | "elevated" | "high" | "critical";
  activeRisks: {
    topic: string;
    severity: number;    // 0-100
    probability: number; // 0-100
    velocity: number;    // % increase
    articlesAffected: number;
    recommendation: string;
  }[];
  emergingRisks: {
    topic: string;
    velocity: number;
    firstDetected: string;
    estimatedImpact: "low" | "medium" | "high";
  }[];
}

export interface ReputationScoreV2 {
  companyName: string;
  score: number;           // 0-100 composite
  scoreComponents: {
    sentiment: number;     // 0-100 (40% weight)
    aiVisibility: number;  // 0-100 (30% weight)
    volume: number;        // 0-100 (20% weight)
    authority: number;     // 0-100 (10% weight) — source quality
  };
  sentiment: {
    positive: number;      // %
    neutral: number;
    negative: number;
    trend30d: number;      // Score change over 30 days
  };
  mediaMetrics: {
    totalArticles: number;
    totalMentions: number;
    uniqueSources: number;
    avgArticleRelevance: number;
  };
  aiMetrics: {
    chatgpt: { cited: boolean; position: string; sentiment: string };
    perplexity: { cited: boolean; position: string; sentiment: string };
    googleAI: { cited: boolean; position: string; sentiment: string };
    glm: { cited: boolean; position: string; sentiment: string };
    totalCitations: number;
    avgPosition: string;
  };
  risk: RiskAssessment;
  narratives: NarrativeArc[];
  topTopics: TopicCluster[];
  competitorBenchmarks: CompetitorBenchmark[];
  emergingOpportunities: string[];
  recommendations: {
    priority: "critical" | "high" | "medium" | "low";
    action: string;
    rationale: string;
    timeline: string;
  }[];
  generatedAt: string;
  dataRange: { from: string; to: string };
}

// ─── ENHANCED SENTIMENT LEXICONS ─────────────────────────────────
// Expanded from mghrib-news-engine's SimpleSentimentAnalyzer
// 3 languages: French, Arabic (MSA + Darija), English

const POSITIVE_LEXICON = {
  fr: [
    "succès", "croissance", "excellent", "positif", "innovation", "progression",
    "réussite", "performance", "leader", "prix", "award", "investissement",
    "expansion", "lancement", "partenariat", "record", "bénéfice", "gain",
    "victoire", "amélioration", "qualité", "fiabilité", "confiance", "transparence",
    "stratégie", "vision", "ambition", "excellence", "premier", "référence",
    "pionnier", "rupture", "disruption", "transformation", "modernisation",
    "digitalisation", "compétitivité", "attractivité", "développement", "renforcement",
  ],
  ar: [
    "نجاح", "تطور", "ممتاز", "إيجابي", "ابتكار", "تقدم", "نمو", "فوز",
    "أداء", "ريادة", "جائزة", "استثمار", "توسع", "إطلاق", "شراكة", "رقم قياسي",
    "ربح", "تحسن", "جودة", "ثقة", "شفافية", "استراتيجية", "رؤية", "طموح",
    "تميز", "الأول", "مرجع", "رائد", "تحول", "تنمية", "تعزيز", "تنافسية",
  ],
  en: [
    "success", "growth", "excellent", "positive", "innovation", "progress",
    "achievement", "performance", "leader", "award", "investment", "expansion",
    "launch", "partnership", "record", "profit", "gain", "victory", "improvement",
    "quality", "reliability", "trust", "transparency", "strategy", "vision",
    "ambition", "excellence", "first", "reference", "pioneer", "breakthrough",
    "transformation", "modernization", "digitization", "competitiveness",
  ],
};

const NEGATIVE_LEXICON = {
  fr: [
    "crise", "perte", "échec", "négatif", "controversé", "scandale",
    "corruption", "fraude", "licenciement", "faillite", "procès", "enquête",
    "condamnation", "amende", "déclin", "chute", "baisse", "problème",
    "détérioration", "récession", "inquiétude", "menace", "risque", "vulnérabilité",
    "retard", "annulation", "fermeture", "restructuration", "plan social",
    "dette", "déficit", "dégradation", "mécontentement", "grève", "manifestation",
    "boycott", "pétition", "plainte", "critique", "polémique", "dérapage",
    "difficulté", "turbulence", "incertitude", "doute", "méfiance", "désaccord",
    "conflit", "tension", "litige", "sanction", "interdiction", "suspension",
    "racket", "blanchiment", "évasion fiscale", "malversation", "népotisme",
    "favoritisme", "détournement", "abus", "violation", "infraction",
    "déception", "insatisfaction", "réclamation", "dysfonctionnement",
    "panne", "bug", "faille", "piratage", "cyberattaque", "fuite de données",
    "récession", "inflation", "chômage", "pauvreté", "exclusion",
  ],
  ar: [
    "أزمة", "خسارة", "فشل", "سلبي", "جدل", "فضيحة", "فساد", "احتيال",
    "تسريح", "إفلاس", "محاكمة", "تحقيق", "إدانة", "غرامة", "تراجع", "سقوط",
    "انخفاض", "مشكلة", "تدهور", "ركود", "قلق", "تهديد", "خطر", "ضعف",
    "تأخير", "إلغاء", "إغلاق", "إعادة هيكلة", "دين", "عجز", "استياء", "إضراب",
    "تظاهر", "مقاطعة", "شكوى", "انتقاد", "جدل", "زلّة", "صعوبة", "اضطراب",
    "شك", "ريبة", "خلاف", "نزاع", "توتر", "نزاع", "عقوبة", "منع", "تعليق",
    "ابتزاز", "تبييض أموال", "تهرب ضريبي", "اختلاس", "محسوبية",
    "محاباة", "اختلاس", "انتهاك", "مخالفة", "خيبة أمل", "استياء",
    "عطل", "خطأ", "ثغرة", "اختراق", "هجوم إلكتروني", "تسريب بيانات",
  ],
  en: [
    "crisis", "loss", "failure", "negative", "controversial", "scandal",
    "corruption", "fraud", "layoff", "bankruptcy", "lawsuit", "investigation",
    "conviction", "fine", "decline", "fall", "drop", "problem", "deterioration",
    "recession", "concern", "threat", "risk", "vulnerability", "delay",
    "cancellation", "closure", "restructuring", "debt", "deficit", "discontent",
    "strike", "protest", "boycott", "petition", "complaint", "criticism",
    "controversy", "gaffe", "difficulty", "turbulence", "uncertainty", "doubt",
    "mistrust", "disagreement", "conflict", "tension", "dispute", "litigation",
    "sanction", "ban", "suspension", "extortion", "money laundering",
    "tax evasion", "embezzlement", "nepotism", "favoritism", "misappropriation",
    "abuse", "violation", "infraction", "disappointment", "dissatisfaction",
    "outage", "bug", "vulnerability", "breach", "cyberattack", "data leak",
  ],
};

// ─── RISK KEYWORDS (for crisis detection) ────────────────────────

const RISK_KEYWORDS = [
  "crise", "crisis", "scandale", "scandal", "fraude", "fraud",
  "corruption", "faillite", "bankruptcy", "licenciement", "layoff",
  "procès", "lawsuit", "enquête", "investigation", "condamnation",
  "amende", "fine", "boycott", "manifestation", "protest", "grève", "strike",
  "houthis", "terrorisme", "terrorism", "attaque", "attack",
  "cyberattaque", "cyberattack", "fuite", "leak", "data breach",
  "أزمة", "فضيحة", "احتيال", "فساد", "إفلاس", "تسريح", "محاكمة",
];

// ─── ENTITY EXTRACTION ───────────────────────────────────────────

const KNOWN_ENTITIES = [
  // Banks
  "Bank of Africa", "BMCE", "Attijariwafa", "CIH Bank", "CIH",
  "Banque Populaire", "BP", "Crédit Agricole", "CFG Bank", "Société Générale Maroc",
  // Telecom
  "Maroc Telecom", "IAM", "Inwi", "Orange Maroc",
  // Industry
  "OCP", "OCP Group", "Managem", "LafargeHolcim", "Holcim Maroc", "Sonasid",
  "Cosumar", "LesieurCristal", "Lesieur Cristal", "Label'Vie", "Marjane",
  "Lydec", "Amendis", "Total Maroc", "Shell Maroc",
  // Other
  "Royal Air Maroc", "RAM", "ONCF", "ONEE", "ANCFCC",
];

export function extractEntities(text: string): string[] {
  const found: string[] = [];
  const lowerText = text.toLowerCase();

  for (const entity of KNOWN_ENTITIES) {
    if (lowerText.includes(entity.toLowerCase())) {
      found.push(entity);
    }
  }

  return [...new Set(found)]; // Deduplicate
}

// ─── ENHANCED SENTIMENT ANALYSIS ─────────────────────────────────

export function analyzeSentimentV2(
  text: string,
  trackedEntity: string
): EntitySentiment {
  const lowerText = text.toLowerCase();
  
  let positiveCount = 0;
  let negativeCount = 0;
  let context = "";

  // Count positive/negative words across all 3 languages
  for (const lang of ["fr", "ar", "en"] as const) {
    for (const word of POSITIVE_LEXICON[lang]) {
      if (lowerText.includes(word.toLowerCase())) {
        positiveCount++;
        // Extract context (sentence containing the word)
        if (!context) {
          const idx = lowerText.indexOf(word.toLowerCase());
          const start = Math.max(0, idx - 50);
          const end = Math.min(text.length, idx + word.length + 50);
          context = text.substring(start, end).trim();
        }
      }
    }
    for (const word of NEGATIVE_LEXICON[lang]) {
      if (lowerText.includes(word.toLowerCase())) {
        negativeCount++;
        if (!context) {
          const idx = lowerText.indexOf(word.toLowerCase());
          const start = Math.max(0, idx - 50);
          const end = Math.min(text.length, idx + word.length + 50);
          context = text.substring(start, end).trim();
        }
      }
    }
  }

  const total = positiveCount + negativeCount;
  
  let sentiment: "positive" | "neutral" | "negative";
  let score: number;
  let confidence: number;

  if (total === 0) {
    sentiment = "neutral";
    score = 0;
    confidence = 0.4; // Low confidence when no sentiment words found
  } else {
    score = (positiveCount - negativeCount) / total;
    confidence = Math.min(0.5 + (total / 10), 0.95); // More words = more confident
    
    if (score > 0.15) {
      sentiment = "positive";
    } else if (score < -0.15) {
      sentiment = "negative";
    } else {
      sentiment = "neutral";
    }
  }

  return {
    entity: trackedEntity,
    sentiment,
    score,
    confidence,
    context: context || text.substring(0, 150),
  };
}

// ─── TOPIC CLUSTERING ────────────────────────────────────────────

const TOPIC_KEYWORDS: Record<string, string[]> = {
  "financial_results": ["résultats", "chiffre d'affaires", "bénéfice", "profit", "pertes", "bilan", "results", "revenue"],
  "leadership_change": ["CEO", "PDG", "direction", "nomination", "départ", "nouveau président", "restructuration"],
  "product_launch": ["lancement", "nouveau produit", "innovation", "nouveau service", "launch", "new product"],
  "regulation": ["réglementation", "loi", "BAM", "AMMC", "conformité", "sanction", "amende", "regulation"],
  "esg": ["ESG", "environnement", "social", "gouvernance", "green", "durabilité", "RSE", "carbon"],
  "mergers_acquisitions": ["acquisition", "fusion", "rachat", "merger", "acquisition", "M&A"],
  "digital_transformation": ["digital", "digitalisation", "transformation", "plateforme", "app", "fintech"],
  "crisis": ["crise", "scandale", "fraude", "controversé", "boycott", "strike", "protest"],
  "expansion": ["expansion", "Afrique", "international", "nouveau marché", "growth", "expansion"],
  "partnership": ["partenariat", "accord", "collaboration", "alliance", "partnership", "agreement"],
};

export function clusterTopics(articles: Article[]): TopicCluster[] {
  const clusters: Record<string, TopicCluster> = {};

  for (const article of articles) {
    const text = `${article.title} ${article.summary}`.toLowerCase();

    for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
      const matches = keywords.some(kw => text.includes(kw.toLowerCase()));
      if (!matches) continue;

      if (!clusters[topic]) {
        clusters[topic] = {
          topic,
          label: topic.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
          articleIds: [],
          articleCount: 0,
          sentimentDistribution: { positive: 0, neutral: 0, negative: 0 },
          velocity24h: 0,
          velocity7d: 0,
          trend: "stable",
          riskLevel: "low",
        };
      }

      clusters[topic].articleIds.push(article.id);
      clusters[topic].articleCount++;

      // Sentiment distribution
      if (article.sentiment === "positive") clusters[topic].sentimentDistribution.positive++;
      else if (article.sentiment === "negative") clusters[topic].sentimentDistribution.negative++;
      else clusters[topic].sentimentDistribution.neutral++;
    }
  }

  // Calculate risk levels
  const result = Object.values(clusters);
  for (const cluster of result) {
    const negativeRate = cluster.articleCount > 0
      ? cluster.sentimentDistribution.negative / cluster.articleCount
      : 0;

    if (cluster.topic === "crisis" || negativeRate > 0.5) {
      cluster.riskLevel = "critical";
    } else if (negativeRate > 0.3) {
      cluster.riskLevel = "high";
    } else if (negativeRate > 0.15) {
      cluster.riskLevel = "medium";
    } else {
      cluster.riskLevel = "low";
    }
  }

  return result.sort((a, b) => b.articleCount - a.articleCount);
}

// ─── NARRATIVE DETECTION ─────────────────────────────────────────

export function detectNarratives(articles: Article[], trackedEntity: string): NarrativeArc[] {
  const narratives: NarrativeArc[] = [];
  
  // Group by topic clusters to identify dominant narratives
  const clusters = clusterTopics(articles);
  
  for (const cluster of clusters.slice(0, 5)) { // Top 5 narratives
    const positiveRate = cluster.articleCount > 0
      ? cluster.sentimentDistribution.positive / cluster.articleCount
      : 0;
    const negativeRate = cluster.articleCount > 0
      ? cluster.sentimentDistribution.negative / cluster.articleCount
      : 0;

    const sentiment = positiveRate - negativeRate;
    const strength = Math.min(100, cluster.articleCount * 10);

    const dates = cluster.articleIds
      .map(id => articles.find(a => a.id === id)?.publishedAt)
      .filter(Boolean)
      .sort();

    const trend: NarrativeArc["trend"] = 
      cluster.articleCount > 10 ? "peak" :
      cluster.articleCount > 5 ? "growing" :
      cluster.articleCount > 2 ? "emerging" : "declining";

    narratives.push({
      narrative: `${trackedEntity} — ${cluster.label}`,
      strength,
      sentiment,
      articleCount: cluster.articleCount,
      firstSeen: dates[0] || new Date().toISOString(),
      lastSeen: dates[dates.length - 1] || new Date().toISOString(),
      trend,
    });
  }

  return narratives;
}

// ─── RISK ASSESSMENT ─────────────────────────────────────────────

export function assessRisk(articles: Article[], trends: TopicCluster[]): RiskAssessment {
  const activeRisks: RiskAssessment["activeRisks"] = [];
  const emergingRisks: RiskAssessment["emergingRisks"] = [];

  // Check for crisis articles
  const crisisArticles = articles.filter(a => {
    const text = `${a.title} ${a.summary}`.toLowerCase();
    return RISK_KEYWORDS.some(kw => text.includes(kw.toLowerCase()));
  });

  // Group crisis articles by topic
  const crisisByTopic: Record<string, Article[]> = {};
  for (const article of crisisArticles) {
    const clusters = clusterTopics([article]);
    for (const cluster of clusters) {
      if (!crisisByTopic[cluster.topic]) crisisByTopic[cluster.topic] = [];
      crisisByTopic[cluster.topic].push(article);
    }
  }

  for (const [topic, topicArticles] of Object.entries(crisisByTopic)) {
    const negativeCount = topicArticles.filter(a => a.sentiment === "negative").length;
    const severity = Math.min(100, (negativeCount / topicArticles.length) * 100 + topicArticles.length * 5);
    const probability = Math.min(100, topicArticles.length * 15);
    
    activeRisks.push({
      topic: topic.replace(/_/g, " "),
      severity: Math.round(severity),
      probability: Math.round(probability),
      velocity: trends.find(t => t.topic === topic)?.velocity24h || 0,
      articlesAffected: topicArticles.length,
      recommendation: getRiskRecommendation(topic, severity),
    });
  }

  // Check for emerging risks (rising trends with negative sentiment)
  for (const trend of trends) {
    if (trend.riskLevel === "high" || trend.riskLevel === "critical") {
      if (trend.velocity24h > 30) {
        emergingRisks.push({
          topic: trend.label,
          velocity: trend.velocity24h,
          firstDetected: new Date().toISOString(),
          estimatedImpact: trend.riskLevel === "critical" ? "high" : "medium",
        });
      }
    }
  }

  // Calculate overall risk
  const riskScore = activeRisks.length > 0
    ? Math.min(100, activeRisks.reduce((sum, r) => sum + r.severity, 0) / activeRisks.length + emergingRisks.length * 10)
    : emergingRisks.length * 15;

  const riskLevel: RiskAssessment["riskLevel"] = 
    riskScore >= 80 ? "critical" :
    riskScore >= 60 ? "high" :
    riskScore >= 40 ? "elevated" :
    riskScore >= 20 ? "moderate" : "low";

  return {
    overallRisk: Math.round(riskScore),
    riskLevel,
    activeRisks: activeRisks.sort((a, b) => b.severity - a.severity),
    emergingRisks: emergingRisks.sort((a, b) => b.velocity - a.velocity),
  };
}

function getRiskRecommendation(topic: string, severity: number): string {
  if (topic === "crisis" && severity > 70) {
    return "Immediate crisis response required. Prepare holding statement and activate crisis communication protocol within 2 hours.";
  }
  if (topic === "regulation" && severity > 50) {
    return "Regulatory risk detected. Legal team should review and prepare compliance statement within 24 hours.";
  }
  if (severity > 60) {
    return `High-severity ${topic} issue detected. Monitor closely and prepare response within 12 hours.`;
  }
  return `Moderate ${topic} activity. Monitor for escalation. Weekly review recommended.`;
}

// ─── COMPETITOR BENCHMARKING ─────────────────────────────────────

export function benchmarkCompetitors(
  trackedCompany: string,
  trackedScore: number,
  allScores: { name: string; score: number; articles: number; positive: number }[]
): CompetitorBenchmark[] {
  const benchmarks: CompetitorBenchmark[] = [];
  
  for (const comp of allScores.filter(c => c.name !== trackedCompany)) {
    const scoreDelta = comp.score - trackedScore;
    const totalArticles = allScores.reduce((sum, c) => sum + c.articles, 0);
    const shareOfVoice = totalArticles > 0 ? (comp.articles / totalArticles) * 100 : 0;
    
    benchmarks.push({
      companyName: comp.name,
      score: comp.score,
      scoreDelta,
      shareOfVoice: Math.round(shareOfVoice),
      sentimentGap: comp.positive - (allScores.find(c => c.name === trackedCompany)?.positive || 0),
      aiVisibilityGap: 0, // Would come from AI visibility data
      topStrength: comp.score > 80 ? "Strong positive sentiment" : comp.score > 60 ? "Solid media presence" : "Improving trajectory",
      topWeakness: comp.positive < 50 ? "Negative sentiment exposure" : "Limited AI visibility",
    });
  }

  return benchmarks.sort((a, b) => b.score - a.score);
}

// ─── MASTER SCORE CALCULATION v2 ─────────────────────────────────

export function calculateReputationScoreV2(
  companyName: string,
  articles: Article[],
  aiMetrics: ReputationScoreV2["aiMetrics"],
  competitors: { name: string; score: number; articles: number; positive: number }[],
  historicalScore?: number
): ReputationScoreV2 {
  
  // 1. SENTIMENT COMPONENT (40%)
  const positive = articles.filter(a => a.sentiment === "positive").length;
  const negative = articles.filter(a => a.sentiment === "negative").length;
  const neutral = articles.filter(a => a.sentiment === "neutral").length;
  const total = articles.length || 1;

  const positiveRate = positive / total;
  const negativeRate = negative / total;
  const sentimentRaw = (positiveRate - negativeRate + 1) / 2; // 0 to 1
  const sentimentScore = Math.round(sentimentRaw * 100);

  // 2. AI VISIBILITY COMPONENT (30%)
  const engines = [aiMetrics.chatgpt, aiMetrics.perplexity, aiMetrics.googleAI, aiMetrics.glm];
  const citedEngines = engines.filter(e => e.cited).length;
  const aiScore = Math.round((citedEngines / 4) * 100);

  // 3. VOLUME COMPONENT (20%)
  const volumeScore = Math.min(100, Math.round((articles.length / 50) * 100));

  // 4. AUTHORITY COMPONENT (10%) — based on source quality
  const uniqueSources = new Set(articles.map(a => a.sourceId)).size;
  const authorityScore = Math.min(100, Math.round((uniqueSources / 10) * 100));

  // COMPOSITE SCORE
  const compositeScore = Math.round(
    sentimentScore * 0.4 +
    aiScore * 0.3 +
    volumeScore * 0.2 +
    authorityScore * 0.1
  );

  // RISK ASSESSMENT
  const topicClusters = clusterTopics(articles);
  const risk = assessRisk(articles, topicClusters);

  // NARRATIVES
  const narratives = detectNarratives(articles, companyName);

  // COMPETITORS
  const competitorBenchmarks = benchmarkCompetitors(companyName, compositeScore, competitors);

  // RECOMMENDATIONS
  const recommendations = generateRecommendations(
    compositeScore,
    sentimentScore,
    aiScore,
    risk,
    narratives,
    historicalScore
  );

  // EMERGING OPPORTUNITIES
  const emergingOpportunities = generateOpportunities(narratives, competitorBenchmarks, aiScore);

  return {
    companyName,
    score: Math.min(100, Math.max(0, compositeScore)),
    scoreComponents: {
      sentiment: sentimentScore,
      aiVisibility: aiScore,
      volume: volumeScore,
      authority: authorityScore,
    },
    sentiment: {
      positive: Math.round(positiveRate * 100),
      neutral: Math.round((neutral / total) * 100),
      negative: Math.round(negativeRate * 100),
      trend30d: historicalScore ? compositeScore - historicalScore : 0,
    },
    mediaMetrics: {
      totalArticles: articles.length,
      totalMentions: articles.length * 5, // Estimate
      uniqueSources,
      avgArticleRelevance: 65, // Would calculate from relevanceScore
    },
    aiMetrics,
    risk,
    narratives,
    topTopics: topicClusters.slice(0, 10),
    competitorBenchmarks,
    emergingOpportunities,
    recommendations,
    generatedAt: new Date().toISOString(),
    dataRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      to: new Date().toISOString(),
    },
  };
}

// ─── RECOMMENDATION ENGINE ───────────────────────────────────────

function generateRecommendations(
  score: number,
  sentimentScore: number,
  aiScore: number,
  risk: RiskAssessment,
  narratives: NarrativeArc[],
  historicalScore?: number
): ReputationScoreV2["recommendations"] {
  const recs: ReputationScoreV2["recommendations"] = [];

  // Critical risk
  if (risk.riskLevel === "critical") {
    recs.push({
      priority: "critical",
      action: "Activate crisis communication protocol immediately",
      rationale: `${risk.activeRisks.length} active risk(s) detected with ${risk.overallRisk}/100 overall risk score`,
      timeline: "Within 2 hours",
    });
  }

  // AI visibility gap — ALWAYS trigger if below 75
  if (aiScore < 75) {
    const missingEngines = 4 - Math.round((aiScore / 100) * 4);
    recs.push({
      priority: aiScore < 50 ? "high" : "medium",
      action: `Improve AI visibility — ${missingEngines} engine(s) not citing the company`,
      rationale: `AI visibility score: ${aiScore}/100. When prospects ask AI for recommendations, the company is not mentioned. Competitors are being cited instead.`,
      timeline: "2-4 weeks",
    });
  }

  // Sentiment decline
  if (historicalScore && score < historicalScore - 5) {
    recs.push({
      priority: "high",
      action: "Address sentiment decline — score dropped from previous period",
      rationale: `Score dropped ${historicalScore - score} points. Investigate negative coverage drivers.`,
      timeline: "1 week",
    });
  }

  // Negative narrative — trigger even with moderate negative sentiment
  const negativeNarratives = narratives.filter(n => n.sentiment < -0.1 && n.strength > 20);
  if (negativeNarratives.length > 0) {
    recs.push({
      priority: "high",
      action: `Counter negative narrative: "${negativeNarratives[0].narrative}"`,
      rationale: `Dominant narrative has ${Math.round(negativeNarratives[0].sentiment * 100)}% negative sentiment with ${negativeNarratives[0].strength}/100 strength`,
      timeline: "1-2 weeks",
    });
  }

  // Emerging risk
  if (risk.emergingRisks.length > 0) {
    recs.push({
      priority: "medium",
      action: `Monitor emerging risk: "${risk.emergingRisks[0].topic}"`,
      rationale: `Velocity +${risk.emergingRisks[0].velocity}% in 24h. Estimated impact: ${risk.emergingRisks[0].estimatedImpact}.`,
      timeline: "Ongoing monitoring",
    });
  }

  // Low volume — score penalized by lack of coverage
  if (score < 60 && sentimentScore > 60) {
    recs.push({
      priority: "medium",
      action: "Increase media engagement to amplify positive sentiment",
      rationale: `Sentiment is strong (${sentimentScore}/100) but overall score is ${score}/100. More coverage would improve volume and authority scores.`,
      timeline: "Ongoing",
    });
  }

  // Score below 50 — general improvement needed
  if (score < 50) {
    recs.push({
      priority: "high",
      action: "Comprehensive reputation improvement program needed",
      rationale: `Overall reputation score is ${score}/100. Multiple areas need attention: sentiment, AI visibility, and media coverage volume.`,
      timeline: "1-3 months",
    });
  }

  // If no recommendations generated, add a default
  if (recs.length === 0) {
    recs.push({
      priority: "low",
      action: "Continue monitoring — reputation is stable",
      rationale: `Score: ${score}/100, Risk: ${risk.riskLevel}. No immediate action required. Maintain current strategy.`,
      timeline: "Monthly review",
    });
  }

  return recs;
}

function generateOpportunities(
  narratives: NarrativeArc[],
  competitors: CompetitorBenchmark[],
  aiScore: number
): string[] {
  const opportunities: string[] = [];

  // Positive narrative to amplify
  const positiveNarratives = narratives.filter(n => n.sentiment > 0.3);
  if (positiveNarratives.length > 0) {
    opportunities.push(`Amplify positive narrative: "${positiveNarratives[0].narrative}" through PR and social media`);
  }

  // Competitor weakness
  const weakCompetitors = competitors.filter(c => c.topWeakness.includes("Negative"));
  if (weakCompetitors.length > 0) {
    opportunities.push(`${weakCompetitors[0].companyName} has negative sentiment exposure — opportunity to capture share of voice`);
  }

  // AI visibility gap
  if (aiScore < 75) {
    opportunities.push("AI visibility can be improved with structured content and entity optimization");
  }

  // Emerging narrative
  const emerging = narratives.filter(n => n.trend === "emerging");
  if (emerging.length > 0) {
    opportunities.push(`Emerging topic: "${emerging[0].narrative}" — position as thought leader early`);
  }

  return opportunities;
}
