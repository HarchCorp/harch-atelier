// ═══════════════════════════════════════════════════════════════
//  TEMPLATE DATA SYSTEM — Fill templates with real data
//  Agents collect data → fill templates → deliver
// ═══════════════════════════════════════════════════════════════

// Template types
export type TemplateType = 
  | "reputation-audit"
  | "competitor-benchmark"
  | "ai-visibility"
  | "monthly-report"
  | "crisis-alert"
  | "whatsapp-daily"
  | "cold-email";

// Data schema for each template type
export interface ReputationAuditData {
  companyName: string;
  reportDate: string;
  reputationScore: number;
  sentimentPositive: number;
  sentimentNeutral: number;
  sentimentNegative: number;
  totalArticles: number;
  totalMentions: number;
  aiCitations: number;
  aiRank: string;
  topCompetitor: string;
  topCompetitorScore: number;
  emergingRisk: string;
  riskIncrease: number;
  detailedFindings: string[];
  competitorAnalysis: { name: string; score: number; sentiment: string }[];
  aiVisibilityDetails: { engine: string; cited: boolean; position: string }[];
  recommendations: string[];
  timeline: { week: string; milestone: string }[];
}

export interface WhatsAppDigestData {
  companyName: string;
  date: string;
  articles: number;
  positive: number;
  neutral: number;
  negative: number;
  mentions: number;
  aiRank: string;
  alertTopic: string;
  alertIncrease: number;
  competitor: string;
}

// ─── SAMPLE DATA (for demo/teaser mode) ──────────────────────────
export const SAMPLE_DATA: Record<string, ReputationAuditData | WhatsAppDigestData> = {
  bank_of_africa: {
    companyName: "Bank of Africa",
    reportDate: "July 2026",
    reputationScore: 78,
    sentimentPositive: 68,
    sentimentNeutral: 22,
    sentimentNegative: 10,
    totalArticles: 247,
    totalMentions: 1240,
    aiCitations: 12,
    aiRank: "#2",
    topCompetitor: "Attijariwafa Bank",
    topCompetitorScore: 84,
    emergingRisk: "Banking fees discussion",
    riskIncrease: 47,
    detailedFindings: [],
    competitorAnalysis: [],
    aiVisibilityDetails: [],
    recommendations: [],
    timeline: [],
  } as ReputationAuditData,
  
  maroc_telecom: {
    companyName: "Maroc Telecom",
    reportDate: "July 2026",
    reputationScore: 72,
    sentimentPositive: 64,
    sentimentNeutral: 25,
    sentimentNegative: 11,
    totalArticles: 189,
    totalMentions: 980,
    aiCitations: 8,
    aiRank: "#1",
    topCompetitor: "Inwi",
    topCompetitorScore: 69,
    emergingRisk: "Network outage complaints",
    riskIncrease: 32,
    detailedFindings: [],
    competitorAnalysis: [],
    aiVisibilityDetails: [],
    recommendations: [],
    timeline: [],
  } as ReputationAuditData,
  
  whatsapp_boa: {
    companyName: "Bank of Africa",
    date: "18/07",
    articles: 12,
    positive: 8,
    neutral: 3,
    negative: 1,
    mentions: 340,
    aiRank: "#2",
    alertTopic: "frais bancaires",
    alertIncrease: 47,
    competitor: "Attijariwafa",
  } as WhatsAppDigestData,
};

// ─── TEMPLATE REGISTRY ───────────────────────────────────────────
export const TEMPLATE_REGISTRY = {
  "reputation-audit": {
    name: "Reputation Audit Report",
    description: "15-page PDF with score, sentiment, competitor analysis, AI visibility, recommendations",
    pages: 15,
    teaserPages: 2, // Pages visible in teaser mode (rest is blurred)
    outputFormat: "PDF",
    deliveryTime: "7 days",
  },
  "competitor-benchmark": {
    name: "Competitor Benchmark Report",
    description: "Side-by-side comparison of 5 competitors across 10 metrics",
    pages: 8,
    teaserPages: 1,
    outputFormat: "PDF",
    deliveryTime: "5 days",
  },
  "ai-visibility": {
    name: "AI Visibility Report",
    description: "What ChatGPT, Perplexity, Gemini, Claude say about you across 200+ queries",
    pages: 10,
    teaserPages: 2,
    outputFormat: "PDF",
    deliveryTime: "5 days",
  },
  "monthly-report": {
    name: "Monthly Reputation Report",
    description: "Board-ready PDF with trends, sentiment evolution, crisis review, recommendations",
    pages: 20,
    teaserPages: 0, // Full report, no teaser (paying clients)
    outputFormat: "PDF",
    deliveryTime: "Monthly",
  },
  "crisis-alert": {
    name: "Crisis Alert",
    description: "Immediate WhatsApp + email alert when negative sentiment exceeds threshold",
    pages: 0,
    teaserPages: 0,
    outputFormat: "WhatsApp + Email",
    deliveryTime: "Real-time",
  },
  "whatsapp-daily": {
    name: "WhatsApp Daily Digest",
    description: "Daily 7am summary: articles, sentiment, AI citations, alerts",
    pages: 0,
    teaserPages: 0,
    outputFormat: "WhatsApp",
    deliveryTime: "Daily 7am",
  },
  "cold-email": {
    name: "Cold Outreach Email",
    description: "Personalized email with recipient's reputation score + blurred full report CTA",
    pages: 0,
    teaserPages: 0,
    outputFormat: "Email",
    deliveryTime: "On-demand",
  },
} as const;

// ─── DATA COLLECTION INSTRUCTIONS FOR AGENTS ─────────────────────
export const DATA_COLLECTION_SPECS = {
  "reputation-audit": {
    sources: [
      "30+ Moroccan media (Hespress, Le360, Medias24, TelQuel, L'Economiste, etc.)",
      "Social media (Twitter/X, LinkedIn, Facebook public)",
      "AI engines (ChatGPT, Perplexity, Gemini, Claude) — 200+ queries",
    ],
    metrics: [
      "Article count (30 days)",
      "Sentiment per article (positive/neutral/negative)",
      "Entity-level sentiment (company vs competitors in same article)",
      "AI citation count (4 engines × 200 queries)",
      "AI rank position",
      "Emerging topic detection (velocity > 30% in 24h)",
      "Competitor share of voice",
    ],
    output: "ReputationAuditData object → ReputationAuditTemplate component → PDF",
  },
  
  "whatsapp-daily": {
    sources: ["Same as reputation-audit, daily refresh"],
    metrics: [
      "Article count (last 24h)",
      "Sentiment breakdown (last 24h)",
      "Total mentions (last 24h)",
      "AI rank (if changed)",
      "Alert topics (velocity > 30%)",
      "Competitor daily movement",
    ],
    output: "WhatsAppDigestData → WhatsAppDigestTemplate → WhatsApp bot",
  },
  
  "cold-email": {
    sources: ["Pre-collected reputation data for target company"],
    metrics: [
      "Reputation score (pre-computed)",
      "Sentiment positive %",
      "Top competitor + score",
      "Emerging risk topic + increase %",
    ],
    output: "EmailTemplateProps → ColdOutreachEmail → Email send",
  },
} as const;
