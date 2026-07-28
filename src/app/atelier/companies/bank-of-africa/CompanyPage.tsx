"use client";

import { CompanyPageLayout, CompanyData } from "../CompanyShared";

const DATA: CompanyData = {
  slug: "bank-of-africa",
  name: "Bank of Africa",
  shortName: "Bank of Africa",
  sector: "Banking",
  color: "#4A5D6E",
  logoInitial: "B",
  tagline:
    "Morocco's second-largest bank and pan-African franchise ranks #6 in the Harch 100 with a 72/100 reputation score, anchored by Nigeria market entry, Q2 record results, and a sustainable-finance framework — but constrained by labor tensions and lower AI visibility than its domestic rival Attijariwafa.",
  heroDescription:
    "Bank of Africa (formerly BMCE Bank of Morocco) is Morocco's second-largest bank by total assets (MAD 385 bn at end-2024) and one of the leading pan-African banking groups, with operations in 32 countries. Its reputation is driven by a 38% innovation weighting (digital transformation, Nigeria entry, mobile money), a 40% performance weighting (Q2 record results, 12.1% ROE), and a 22% purpose weighting (sustainable-finance framework, financial inclusion, BMCE Foundation).",
  analysisBody:
    "Bank of Africa is Morocco's second-largest bank and the #6 company in the Harch 100. Its 72/100 score reflects a strong underlying trajectory that is being held back by three frictions. On the strength side, three factors anchor the score. First, pan-African footprint: with operations in 32 countries (18 in sub-Saharan Africa, 12 in North Africa and Europe, plus 2 in Asia), Bank of Africa is the most geographically diversified Moroccan bank — broader than Attijariwafa's 23 countries. The November 2024 Nigeria market entry (acquisition of Prestige Bank, 14 branches) is the most strategically important deal in Moroccan banking this decade, giving BOA direct exposure to Africa's largest economy and a structural differentiator vs. Attijariwafa. Second, Q2 record results: net banking income up 12% YoY, ROE at 12.1% (up from 10.8% in Q2 2024), cost-to-income ratio improving to 51.2% — a performance narrative that beats sector consensus. Third, sustainable-finance leadership: BOA issued its first green bond in June 2025 (USD 250 million, oversubscribed 2.8x) and has committed to align its loan book with the EU Taxonomy by 2028 — a more ambitious ESG framework than any Moroccan peer. On the friction side, three factors are dragging the score. First, labor tensions: the October 2025 staff-coalition strike (3 days, 142 branches closed, 12% of transactions delayed) is the single most-quoted negative BOA story. Second, AI visibility gap: Claude does not cite BOA in our test queries, and overall AI citation rate lags Attijariwafa — a digital-content gap that compounds. Third, lower share of voice: at 22% vs. Attijariwafa's 27%, BOA generates fewer articles per quarter despite a similar asset base — a content-engineering problem. The trend is upward (+1 point vs previous month) but the gap to Attijariwafa is widening in absolute terms. The single most important opportunity is Nigeria: the Prestige Bank acquisition is the kind of structural narrative that, if told well, can re-rate the bank's reputation over 24 months.",

  rank: 6,
  score: 72,
  prevScore: 71,
  trend: "up",
  change: "+1",
  industryRank: 2,
  industryTotal: 7,

  topStats: {
    articles: 247,
    sources: 18,
    aiCitations: 3,
    aiCitationsTotal: 4,
    shareOfVoice: 22,
  },

  pillars: {
    innovation: { weight: 38, score: 76 },
    performance: { weight: 40, score: 78 },
    purpose: { weight: 22, score: 71 },
  },

  radar: {
    axes: ["Collaborations", "Products", "Technology", "Governance", "Growth", "Operations", "CSR", "Culture", "Sustainability"],
    series: [
      { name: "Bank of Africa", color: "#4A5D6E", values: [78, 76, 75, 74, 81, 79, 72, 68, 74] },
      { name: "Industry average", color: "#4A7B5F", values: [68, 72, 70, 74, 72, 76, 66, 64, 68] },
    ],
  },

  sentimentSplit: [
    { label: "Positive", value: 68, color: "#4A7B5F" },
    { label: "Neutral", value: 22, color: "#4A5D6E" },
    { label: "Negative", value: 10, color: "#A0524B" },
  ],

  sentimentByLanguage: [
    { label: "FR", value: 128, color: "#4A5D6E" },
    { label: "AR", value: 64, color: "#4A7B5F" },
    { label: "EN", value: 55, color: "#B87333" },
  ],

  topSources: [
    { label: "Financial Afrik", value: 30, sublabel: "Positive-leaning", color: "#4A7B5F" },
    { label: "L'Économiste", value: 26, sublabel: "Neutral", color: "#4A5D6E" },
    { label: "Le Matin", value: 24, sublabel: "Positive-leaning", color: "#4A7B5F" },
    { label: "Jeune Afrique", value: 22, sublabel: "Positive-leaning", color: "#4A7B5F" },
    { label: "Medias24", value: 20, sublabel: "Neutral", color: "#4A5D6E" },
    { label: "Bloomberg", value: 18, sublabel: "Neutral", color: "#4A5D6E" },
    { label: "Les Échos", value: 16, sublabel: "Positive-leaning", color: "#4A7B5F" },
    { label: "Aujourd'hui le Maroc", value: 16, sublabel: "Positive-leaning", color: "#4A7B5F" },
    { label: "TelQuel", value: 14, sublabel: "Negative-leaning", color: "#A0524B" },
    { label: "Reuters", value: 12, sublabel: "Neutral", color: "#4A5D6E" },
  ],

  quarterly: {
    series: [
      { name: "Bank of Africa", color: "#4A5D6E", points: [69, 70, 71, 72] },
      { name: "Banking industry avg", color: "#4A7B5F", points: [70, 71, 72, 73] },
    ],
    xLabels: ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025"],
  },

  narratives: [
    {
      statement: "Pan-African expansion — Nigeria market entry via Prestige Bank acquisition, direct exposure to Africa's largest economy.",
      strength: 86,
      sentiment: 0.74,
      articles: 40,
      trajectory: "growing",
    },
    {
      statement: "Q2 record results — net banking income up 12% YoY, ROE at 12.1%, beats sector consensus on all key metrics.",
      strength: 84,
      sentiment: 0.78,
      articles: 36,
      trajectory: "peak",
    },
    {
      statement: "Digital transformation — mobile banking app crosses 2.8 million active users, 64% of retail transactions now digital.",
      strength: 78,
      sentiment: 0.72,
      articles: 30,
      trajectory: "growing",
    },
    {
      statement: "Sustainable finance framework — first green bond USD 250 mn oversubscribed 2.8x, EU Taxonomy alignment by 2028.",
      strength: 76,
      sentiment: 0.71,
      articles: 26,
      trajectory: "emerging",
    },
    {
      statement: "Labor tensions — October staff-coalition strike (3 days, 142 branches closed) dominates negative coverage.",
      strength: 68,
      sentiment: -0.52,
      articles: 22,
      trajectory: "declining",
    },
  ],

  risks: [
    {
      label: "Labor dispute",
      category: "Operational",
      frequency: 48,
      impact: 86,
      velocity: 78,
      composite: 62,
      trajectory: "rising",
      mitigation: "Reopen staff-coalition dialogue before next dispute cycle. The October strike cost 3 reputation points. Address pay-gap narrative (Moroccan vs. international staff compensation) head-on. Quarterly employee-engagement transparency report.",
    },
    {
      label: "Regulatory violation",
      category: "Legal",
      frequency: 42,
      impact: 80,
      velocity: 48,
      composite: 55,
      trajectory: "stable",
      mitigation: "Proactive dialogue with Bank Al-Maghrib, AMMC, BCEAO (West African regulator), and CBN (Nigeria). Compliance dashboard published annually. Cross-border AML/KYC is the highest-risk area given the 32-country footprint.",
    },
    {
      label: "Customer backlash",
      category: "Reputational",
      frequency: 40,
      impact: 82,
      velocity: 58,
      composite: 55,
      trajectory: "rising",
      mitigation: "Customer-experience investment. Branch-modernisation programme. Service-level transparency. Customer-complaints dashboard published quarterly. Social-media response team 24/7.",
    },
    {
      label: "Cyber attack",
      category: "Technology",
      frequency: 36,
      impact: 88,
      velocity: 68,
      composite: 53,
      trajectory: "rising",
      mitigation: "Mobile banking app is the #1 attack surface. 24/7 SOC investment, red-team exercises, customer-facing security communications. Coordinate with Bank Al-Maghrib, BCEAO, and CBN on cross-border incident response.",
    },
    {
      label: "Brand reputation threat",
      category: "Reputational",
      frequency: 30,
      impact: 78,
      velocity: 42,
      composite: 45,
      trajectory: "stable",
      mitigation: "Nigeria entry is brand-positive but execution risk is real — Prestige Bank integration must be visible. Pan-African narrative must be reinforced consistently. Brief African business press on BOA's continental strategy.",
    },
  ],

  aiEngines: [
    { name: "ChatGPT", cited: true, position: "#2", sentiment: 0.62 },
    { name: "Perplexity", cited: true, position: "#1", sentiment: 0.66 },
    { name: "Gemini", cited: true, position: "#3", sentiment: 0.54 },
    { name: "Claude", cited: false, position: "NOT CITED", sentiment: 0 },
  ],

  topicHeatmap: {
    rows: [
      "Nigeria entry",
      "Q2 results",
      "Digital transformation",
      "Sustainable finance",
      "Labor tensions",
      "Pan-African strategy",
      "Mobile money",
      "Green bond",
      "BMCE Foundation",
      "Leadership (Ouidad Tebaa)",
    ],
    cols: ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025"],
    data: [
      { row: "Nigeria entry", col: "Q1 2025", value: 18 },
      { row: "Nigeria entry", col: "Q2 2025", value: 24 },
      { row: "Nigeria entry", col: "Q3 2025", value: 32 },
      { row: "Nigeria entry", col: "Q4 2025", value: 40 },
      { row: "Q2 results", col: "Q1 2025", value: 12 },
      { row: "Q2 results", col: "Q2 2025", value: 18 },
      { row: "Q2 results", col: "Q3 2025", value: 28 },
      { row: "Q2 results", col: "Q4 2025", value: 36 },
      { row: "Digital transformation", col: "Q1 2025", value: 14 },
      { row: "Digital transformation", col: "Q2 2025", value: 18 },
      { row: "Digital transformation", col: "Q3 2025", value: 22 },
      { row: "Digital transformation", col: "Q4 2025", value: 30 },
      { row: "Sustainable finance", col: "Q1 2025", value: 8 },
      { row: "Sustainable finance", col: "Q2 2025", value: 14 },
      { row: "Sustainable finance", col: "Q3 2025", value: 20 },
      { row: "Sustainable finance", col: "Q4 2025", value: 26 },
      { row: "Labor tensions", col: "Q1 2025", value: 6 },
      { row: "Labor tensions", col: "Q2 2025", value: 8 },
      { row: "Labor tensions", col: "Q3 2025", value: 18 },
      { row: "Labor tensions", col: "Q4 2025", value: 22 },
      { row: "Pan-African strategy", col: "Q1 2025", value: 14 },
      { row: "Pan-African strategy", col: "Q2 2025", value: 16 },
      { row: "Pan-African strategy", col: "Q3 2025", value: 20 },
      { row: "Pan-African strategy", col: "Q4 2025", value: 24 },
      { row: "Mobile money", col: "Q1 2025", value: 10 },
      { row: "Mobile money", col: "Q2 2025", value: 12 },
      { row: "Mobile money", col: "Q3 2025", value: 14 },
      { row: "Mobile money", col: "Q4 2025", value: 16 },
      { row: "Green bond", col: "Q1 2025", value: 4 },
      { row: "Green bond", col: "Q2 2025", value: 12 },
      { row: "Green bond", col: "Q3 2025", value: 16 },
      { row: "Green bond", col: "Q4 2025", value: 18 },
      { row: "BMCE Foundation", col: "Q1 2025", value: 8 },
      { row: "BMCE Foundation", col: "Q2 2025", value: 10 },
      { row: "BMCE Foundation", col: "Q3 2025", value: 12 },
      { row: "BMCE Foundation", col: "Q4 2025", value: 14 },
      { row: "Leadership (Ouidad Tebaa)", col: "Q1 2025", value: 6 },
      { row: "Leadership (Ouidad Tebaa)", col: "Q2 2025", value: 8 },
      { row: "Leadership (Ouidad Tebaa)", col: "Q3 2025", value: 10 },
      { row: "Leadership (Ouidad Tebaa)", col: "Q4 2025", value: 12 },
    ],
  },

  competitorRadar: {
    axes: ["Score", "Sentiment", "AI visibility", "Share of voice", "Risk (inv.)", "Narrative"],
    series: [
      { name: "Bank of Africa", color: "#4A5D6E", values: [72, 68, 75, 70, 58, 76] },
      { name: "Attijariwafa", color: "#4A7B5F", values: [84, 72, 95, 88, 65, 84] },
      { name: "CIH Bank", color: "#B87333", values: [68, 65, 60, 55, 60, 58] },
      { name: "Banque Populaire", color: "#A0524B", values: [71, 64, 68, 62, 62, 66] },
    ],
  },

  competitorsList: [
    { name: "Attijariwafa", score: 84 },
    { name: "Banque Populaire", score: 71 },
    { name: "CIH Bank", score: 68 },
  ],

  recentArticles: [
    {
      title: "Bank of Africa completes Prestige Bank acquisition — direct entry into Nigeria, Africa's largest economy",
      source: "Financial Afrik",
      date: "Dec 9, 2025",
      sentiment: "positive",
      relevance: 96,
    },
    {
      title: "Bank of Africa Q2 2025: net banking income up 12% YoY, ROE at 12.1%, beats sector consensus",
      source: "Bloomberg",
      date: "Nov 30, 2025",
      sentiment: "positive",
      relevance: 92,
    },
    {
      title: "BOA mobile banking app crosses 2.8 million active users — 64% of retail transactions now digital",
      source: "L'Économiste",
      date: "Nov 18, 2025",
      sentiment: "positive",
      relevance: 85,
    },
    {
      title: "Bank of Africa issues first green bond — USD 250 million, oversubscribed 2.8x",
      source: "Jeune Afrique",
      date: "Nov 7, 2025",
      sentiment: "positive",
      relevance: 88,
    },
    {
      title: "October staff-coalition strike closes 142 BOA branches over 3 days — pay-gap dispute",
      source: "TelQuel",
      date: "Oct 26, 2025",
      sentiment: "negative",
      relevance: 84,
    },
    {
      title: "Bank of Africa commits to EU Taxonomy alignment for loan book by 2028",
      source: "Les Échos",
      date: "Oct 14, 2025",
      sentiment: "positive",
      relevance: 78,
    },
    {
      title: "BOA pan-African footprint reaches 32 countries — most geographically diversified Moroccan bank",
      source: "Le Matin",
      date: "Oct 4, 2025",
      sentiment: "positive",
      relevance: 80,
    },
    {
      title: "Bank of Africa Q1 results: net income up 8% YoY, Morocco operations lead growth",
      source: "Reuters",
      date: "Sep 22, 2025",
      sentiment: "positive",
      relevance: 76,
    },
  ],

  recommendations: [
    {
      priority: "critical",
      action: "Resolve the labor-dispute trajectory — the October strike cost 3 reputation points.",
      rationale:
        "Labor dispute (composite 62, rising) is the company's most material risk. The October staff-coalition strike (3 days, 142 branches closed, 12% of transactions delayed) is the single most-quoted negative BOA story. Reopen dialogue with the staff coalition before the next dispute cycle, address the pay-gap narrative (Moroccan vs. international staff) head-on, and publish a quarterly employee-engagement transparency report.",
      timeline: "60 days",
      owner: "HR Director & Group Communications",
    },
    {
      priority: "high",
      action: "Fix the Claude visibility gap and close the AI-citation lag vs Attijariwafa.",
      rationale:
        "Claude does not cite BOA in our 12 standard reputation queries, and overall AI citation rate (3/4 engines) lags Attijariwafa. This is a content-engineering problem, not a reputation problem. The fix is structured, machine-readable content: Nigeria acquisition milestone page, pan-African footprint data, green-bond impact KPIs, EU Taxonomy alignment roadmap — all published as schema.org-marked pages with clear question-answer format. AI visibility is now a commercial asset.",
      timeline: "90 days",
      owner: "Digital Marketing & SEO Lead",
    },
    {
      priority: "high",
      action: "Build a 24-month Nigeria-integration narrative engine.",
      rationale:
        "The Prestige Bank acquisition is the most strategically important deal in Moroccan banking this decade — a structural differentiator vs. Attijariwafa that competitors cannot match. Build a sustained 24-month content cadence: integration milestones, branch-network expansion, customer-base growth, Nigerian-staff hiring, local partnerships, regulatory milestones. The narrative must be told by BOA, not by competitors or skeptics.",
      timeline: "120 days",
      owner: "International Communications & Nigerian Integration Lead",
    },
    {
      priority: "medium",
      action: "Convert the green bond from announcement to ongoing impact story.",
      rationale:
        "The USD 250 mn green bond (oversubscribed 2.8x) and the EU Taxonomy 2028 commitment are strong ESG narratives that should not die in single news cycles. Build a sustained content cadence: where the money went (renewable energy, green buildings, SME lending, sustainable agriculture), impact KPIs, second-party opinion, annual progress report. The bond is a platform, not an event — and it is the ESG differentiator vs. Attijariwafa.",
      timeline: "120 days",
      owner: "ESG & Sustainable Finance Lead",
    },
    {
      priority: "medium",
      action: "Build a customer-experience investment narrative to counter backlash risk.",
      rationale:
        "Customer backlash risk (composite 55, rising) is the third-largest in the register. Counter it with visible investment: branch-modernisation programme, service-level transparency, customer-complaints dashboard published quarterly, social-media response team 24/7. The narrative flips the risk from liability to evidence of competence — and is the kind of content that compunds with retail customers and regulators.",
      timeline: "120 days",
      owner: "Retail Banking & Customer Experience",
    },
  ],

  methodology:
    "This profile is built from 247 articles analyzed across 18 distinct sources over the trailing 90 days, including Moroccan financial press (L'Économiste, Medias24, Le Matin, Aujourd'hui le Maroc, TelQuel), international wires and African business press (Bloomberg, Reuters, Financial Afrik, Jeune Afrique, Les Échos), Bank Al-Maghrib publications, AMMC filings, Bank of Africa annual report and sustainability report, BCEAO and CBN publications, social platforms (LinkedIn, X, YouTube), and the four leading generative AI engines (ChatGPT, Claude, Gemini, Perplexity). The Harch Reputation Index blends share of voice (25%), sentiment polarity (25%), AI citation frequency (20%), pillar scores for Innovation / Performance / Purpose (20%), and ESG narrative strength (10%) into a single 0–100 composite. Risk scores use the Harch 32-category framework, scored 0–100 by combining mention frequency (40%), severity weighting (35%), and forward-looking velocity (25%). All data is refreshed every 6 hours. Subsidiary entities (Bank of Africa Nigeria, Bank of Africa Côte d'Ivoire, Bank of Africa Kenya, Bank of Africa Egypt, BOA Madagascar, BMCE Foundation, BOA Bourse, BOA Capital) are attributed to Bank of Africa for scoring.",
};

export default function BankOfAfricaPage() {
  return <CompanyPageLayout data={DATA} />;
}
