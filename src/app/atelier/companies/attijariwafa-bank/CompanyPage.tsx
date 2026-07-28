"use client";

import { CompanyPageLayout, CompanyData } from "../CompanyShared";

const DATA: CompanyData = {
  slug: "attijariwafa-bank",
  name: "Attijariwafa Bank",
  shortName: "Attijariwafa",
  sector: "Banking",
  color: "#4A5D6E",
  logoInitial: "A",
  tagline:
    "Morocco's largest bank by assets ranks #2 in the Harch 100 with a 84/100 reputation score, anchored by regional expansion across 23 African countries, digital transformation, and a consistent financial-performance narrative that few domestic competitors can match.",
  heroDescription:
    "Attijariwafa Bank is Morocco's largest bank by total assets (MAD 645 bn at end-2024) and the country's most geographically diversified lender, with operations in 23 countries. Its reputation is driven by a 35% innovation weighting (Tijari digital bank, mobile money, AI-powered advisory), a 41% performance weighting (record Q2 2025 results, 14% ROE), and a 24% purpose weighting (ESG leadership, financial inclusion, Attijariwafa Foundation).",
  analysisBody:
    "Attijariwafa Bank is Morocco's most reputable financial institution and the #2 company in the Harch 100 — behind only OCP Group. Its 84/100 score reflects three reinforcing strengths. First, scale: with MAD 645 billion in total assets, 12.4 million customers, and 4,200 branches across 23 countries, Attijariwafa is the dominant financial brand in the Maghreb and a top-5 African banking group. Second, geographic diversification: the bank earns 38% of its net banking income from international operations, with particularly strong franchises in Côte d'Ivoire, Egypt, and Tunisia — a structural hedge against domestic cyclicality that gives its performance narrative unusual stability. Third, digital leadership: the Tijari mobile platform, launched in 2022, has crossed 4.2 million active users and processes 71% of retail transactions — a transformation story that anchors the bank's innovation narrative. The trend, however, is downward (-1 point vs previous month) — the first quarterly decline since Q1 2024. Two factors are at play: (1) the announced succession of long-time CEO Ismail Douiri is generating leadership-continuity questions in the financial press, and (2) the elevated risk register — financial fraud at 62, cyber attack at 58, regulatory violation at 50 — is dragging on the score. The cyber-attack risk is the most strategically important: as Morocco's largest digital bank, Attijariwafa's attack surface is the largest in the sector, and a single major breach would erase 6–8 reputation points and trigger regulatory scrutiny that compounds for 24 months. The succession narrative is manageable — Douiri's exit is well-flagged and the successor (Khalid El Ghazzaf, currently Deputy CEO) is a known quantity — but it must be actively managed with a clear 100-day communication plan.",

  rank: 2,
  score: 84,
  prevScore: 85,
  trend: "down",
  change: "-1",
  industryRank: 1,
  industryTotal: 7,

  topStats: {
    articles: 287,
    sources: 24,
    aiCitations: 4,
    aiCitationsTotal: 4,
    shareOfVoice: 27,
  },

  pillars: {
    innovation: { weight: 35, score: 79 },
    performance: { weight: 41, score: 89 },
    purpose: { weight: 24, score: 76 },
  },

  radar: {
    axes: ["Collaborations", "Products", "Technology", "Governance", "Growth", "Operations", "CSR", "Culture", "Sustainability"],
    series: [
      { name: "Attijariwafa", color: "#4A5D6E", values: [80, 84, 86, 87, 88, 90, 78, 76, 75] },
      { name: "Industry average", color: "#4A7B5F", values: [68, 72, 70, 74, 72, 76, 66, 64, 68] },
    ],
  },

  sentimentSplit: [
    { label: "Positive", value: 72, color: "#4A7B5F" },
    { label: "Neutral", value: 22, color: "#4A5D6E" },
    { label: "Negative", value: 6, color: "#A0524B" },
  ],

  sentimentByLanguage: [
    { label: "FR", value: 152, color: "#4A5D6E" },
    { label: "AR", value: 78, color: "#4A7B5F" },
    { label: "EN", value: 57, color: "#B87333" },
  ],

  topSources: [
    { label: "L'Économiste", value: 34, sublabel: "Positive-leaning", color: "#4A7B5F" },
    { label: "Bloomberg", value: 28, sublabel: "Neutral", color: "#4A5D6E" },
    { label: "Le Matin", value: 26, sublabel: "Positive-leaning", color: "#4A7B5F" },
    { label: "Medias24", value: 24, sublabel: "Neutral", color: "#4A5D6E" },
    { label: "Financial Afrik", value: 22, sublabel: "Positive-leaning", color: "#4A7B5F" },
    { label: "Jeune Afrique", value: 20, sublabel: "Positive-leaning", color: "#4A7B5F" },
    { label: "Les Échos", value: 18, sublabel: "Neutral", color: "#4A5D6E" },
    { label: "Aujourd'hui le Maroc", value: 18, sublabel: "Positive-leaning", color: "#4A7B5F" },
    { label: "TelQuel", value: 12, sublabel: "Negative-leaning", color: "#A0524B" },
    { label: "Reuters", value: 14, sublabel: "Neutral", color: "#4A5D6E" },
  ],

  quarterly: {
    series: [
      { name: "Attijariwafa", color: "#4A5D6E", points: [82, 86, 85, 84] },
      { name: "Banking industry avg", color: "#4A7B5F", points: [70, 71, 72, 73] },
    ],
    xLabels: ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025"],
  },

  narratives: [
    {
      statement: "Q2 2025 results exceed expectations — net banking income up 11%, ROE at 14.2%, beating analyst consensus.",
      strength: 90,
      sentiment: 0.82,
      articles: 46,
      trajectory: "peak",
    },
    {
      statement: "Regional expansion — Egypt subsidiary hits profitability milestone, Côte d'Ivoire leads West African growth.",
      strength: 84,
      sentiment: 0.74,
      articles: 38,
      trajectory: "growing",
    },
    {
      statement: "Digital transformation — Tijari mobile platform crosses 4.2 million active users, processes 71% of retail transactions.",
      strength: 82,
      sentiment: 0.78,
      articles: 34,
      trajectory: "growing",
    },
    {
      statement: "ESG leadership — first Moroccan bank to issue sustainable bond, MAD 2 bn, oversubscribed 3.2x.",
      strength: 78,
      sentiment: 0.71,
      articles: 28,
      trajectory: "emerging",
    },
    {
      statement: "Executive succession — Ismail Douiri transition plan announced, Khalid El Ghazzaf named Deputy CEO and successor.",
      strength: 68,
      sentiment: 0.12,
      articles: 24,
      trajectory: "declining",
    },
  ],

  risks: [
    {
      label: "Financial fraud",
      category: "Financial",
      frequency: 48,
      impact: 92,
      velocity: 72,
      composite: 62,
      trajectory: "rising",
      mitigation: "Zero-fraud-tolerance public posture. Quarterly fraud-prevention transparency report. Customer-education campaign on phishing, social engineering, account-takeover. Coordinate with Bank Al-Maghrib on sector-wide response.",
    },
    {
      label: "Cyber attack",
      category: "Technology",
      frequency: 44,
      impact: 95,
      velocity: 82,
      composite: 58,
      trajectory: "rising",
      mitigation: "Invest in 24/7 SOC, red-team exercises, customer-facing security communications. Pre-position breach-response protocol with Bank Al-Maghrib, ANRT, and CERT-MJ. Tijari platform is the #1 attack surface — quarterly penetration testing.",
    },
    {
      label: "Regulatory violation",
      category: "Legal",
      frequency: 38,
      impact: 78,
      velocity: 45,
      composite: 50,
      trajectory: "stable",
      mitigation: "Maintain proactive dialogue with Bank Al-Maghrib, AMMC, and OECD anti-bribery conventions. Compliance dashboard published annually. AML/KYC narrative must be visible, not just operational.",
    },
    {
      label: "Liquidity crisis",
      category: "Financial",
      frequency: 28,
      impact: 88,
      velocity: 48,
      composite: 42,
      trajectory: "stable",
      mitigation: "Maintain LCR > 130% and NSFR > 110%. Diversify funding base — international bonds, interbank lines, retail deposits. Stress-test communication: market should know Attijariwafa can absorb a 30% deposit outflow.",
    },
    {
      label: "Compliance failure",
      category: "Legal",
      frequency: 30,
      impact: 80,
      velocity: 40,
      composite: 40,
      trajectory: "falling",
      mitigation: "Investment in compliance tech (RegTech, transaction monitoring, sanctions screening). Correspondent-banking due diligence is critical for USD clearing — sanctions lapse would be existential for international business.",
    },
  ],

  aiEngines: [
    { name: "ChatGPT", cited: true, position: "#1", sentiment: 0.74 },
    { name: "Perplexity", cited: true, position: "#2", sentiment: 0.68 },
    { name: "Gemini", cited: true, position: "#2", sentiment: 0.66 },
    { name: "Claude", cited: true, position: "#1", sentiment: 0.72 },
  ],

  topicHeatmap: {
    rows: [
      "Q2 results",
      "Regional expansion",
      "Tijari digital",
      "Sustainable bond",
      "Executive succession",
      "Financial inclusion",
      "Cyber & fraud",
      "Egypt subsidiary",
      "Mobile money",
      "Branch network",
    ],
    cols: ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025"],
    data: [
      { row: "Q2 results", col: "Q1 2025", value: 14 },
      { row: "Q2 results", col: "Q2 2025", value: 22 },
      { row: "Q2 results", col: "Q3 2025", value: 38 },
      { row: "Q2 results", col: "Q4 2025", value: 46 },
      { row: "Regional expansion", col: "Q1 2025", value: 16 },
      { row: "Regional expansion", col: "Q2 2025", value: 20 },
      { row: "Regional expansion", col: "Q3 2025", value: 28 },
      { row: "Regional expansion", col: "Q4 2025", value: 38 },
      { row: "Tijari digital", col: "Q1 2025", value: 22 },
      { row: "Tijari digital", col: "Q2 2025", value: 26 },
      { row: "Tijari digital", col: "Q3 2025", value: 30 },
      { row: "Tijari digital", col: "Q4 2025", value: 34 },
      { row: "Sustainable bond", col: "Q1 2025", value: 8 },
      { row: "Sustainable bond", col: "Q2 2025", value: 12 },
      { row: "Sustainable bond", col: "Q3 2025", value: 18 },
      { row: "Sustainable bond", col: "Q4 2025", value: 28 },
      { row: "Executive succession", col: "Q1 2025", value: 4 },
      { row: "Executive succession", col: "Q2 2025", value: 6 },
      { row: "Executive succession", col: "Q3 2025", value: 16 },
      { row: "Executive succession", col: "Q4 2025", value: 24 },
      { row: "Financial inclusion", col: "Q1 2025", value: 14 },
      { row: "Financial inclusion", col: "Q2 2025", value: 16 },
      { row: "Financial inclusion", col: "Q3 2025", value: 18 },
      { row: "Financial inclusion", col: "Q4 2025", value: 20 },
      { row: "Cyber & fraud", col: "Q1 2025", value: 8 },
      { row: "Cyber & fraud", col: "Q2 2025", value: 10 },
      { row: "Cyber & fraud", col: "Q3 2025", value: 14 },
      { row: "Cyber & fraud", col: "Q4 2025", value: 18 },
      { row: "Egypt subsidiary", col: "Q1 2025", value: 10 },
      { row: "Egypt subsidiary", col: "Q2 2025", value: 14 },
      { row: "Egypt subsidiary", col: "Q3 2025", value: 18 },
      { row: "Egypt subsidiary", col: "Q4 2025", value: 22 },
      { row: "Mobile money", col: "Q1 2025", value: 12 },
      { row: "Mobile money", col: "Q2 2025", value: 14 },
      { row: "Mobile money", col: "Q3 2025", value: 16 },
      { row: "Mobile money", col: "Q4 2025", value: 18 },
      { row: "Branch network", col: "Q1 2025", value: 8 },
      { row: "Branch network", col: "Q2 2025", value: 8 },
      { row: "Branch network", col: "Q3 2025", value: 10 },
      { row: "Branch network", col: "Q4 2025", value: 12 },
    ],
  },

  competitorRadar: {
    axes: ["Score", "Sentiment", "AI visibility", "Share of voice", "Risk (inv.)", "Narrative"],
    series: [
      { name: "Attijariwafa", color: "#4A5D6E", values: [84, 72, 95, 88, 65, 84] },
      { name: "Bank of Africa", color: "#4A7B5F", values: [72, 68, 75, 68, 58, 72] },
      { name: "CIH Bank", color: "#B87333", values: [68, 65, 60, 55, 60, 58] },
      { name: "Banque Populaire", color: "#A0524B", values: [71, 64, 68, 62, 62, 66] },
    ],
  },

  competitorsList: [
    { name: "Bank of Africa", score: 72 },
    { name: "Banque Populaire", score: 71 },
    { name: "CIH Bank", score: 68 },
  ],

  recentArticles: [
    {
      title: "Attijariwafa Bank Q2 2025: net banking income up 11%, ROE at 14.2%, beating consensus",
      source: "Bloomberg",
      date: "Dec 5, 2025",
      sentiment: "positive",
      relevance: 96,
    },
    {
      title: "Attijariwafa Egypt subsidiary reaches profitability milestone after 7-year investment cycle",
      source: "Financial Afrik",
      date: "Nov 28, 2025",
      sentiment: "positive",
      relevance: 89,
    },
    {
      title: "Tijari mobile platform crosses 4.2 million active users — 71% of retail transactions now digital",
      source: "L'Économiste",
      date: "Nov 18, 2025",
      sentiment: "positive",
      relevance: 85,
    },
    {
      title: "Attijariwafa issues MAD 2 bn sustainable bond, oversubscribed 3.2x — first Moroccan bank",
      source: "Jeune Afrique",
      date: "Nov 8, 2025",
      sentiment: "positive",
      relevance: 88,
    },
    {
      title: "Ismail Douiri transition plan: Khalid El Ghazzaf named Deputy CEO and successor",
      source: "Medias24",
      date: "Oct 24, 2025",
      sentiment: "neutral",
      relevance: 82,
    },
    {
      title: "Attijariwafa announces MAD 500 million financial-inclusion fund for rural Morocco",
      source: "Le Matin",
      date: "Oct 14, 2025",
      sentiment: "positive",
      relevance: 76,
    },
    {
      title: "Moroccan banks face rising cyber-attack risk — Attijariwafa most exposed, analysts warn",
      source: "TelQuel",
      date: "Oct 5, 2025",
      sentiment: "negative",
      relevance: 78,
    },
    {
      title: "Attijariwafa Côte d'Ivoire leads West African growth with 18% deposit increase YoY",
      source: "Reuters",
      date: "Sep 26, 2025",
      sentiment: "positive",
      relevance: 80,
    },
  ],

  recommendations: [
    {
      priority: "critical",
      action: "Build a 100-day CEO-transition communication plan now.",
      rationale:
        "Ismail Douiri's succession is the single most-watched leadership event in Moroccan finance. A 100-day plan for incoming CEO Khalid El Ghazzaf — first-week message, first-100-day priorities, first shareholder letter, first major media interview — must be drafted and pressure-tested before the announcement. Ambiguity here costs 2–3 reputation points immediately.",
      timeline: "60 days",
      owner: "Group Communications Director",
    },
    {
      priority: "high",
      action: "Operationalise the cyber-attack narrative before an incident forces it.",
      rationale:
        "Attijariwafa's Tijari platform is the largest digital banking attack surface in Morocco. A single major breach would erase 6–8 reputation points and trigger regulatory scrutiny that compounds for 24 months. Invest in 24/7 SOC, run quarterly red-team exercises, publish a customer-facing security-transparency report, and pre-position breach-response protocols with Bank Al-Maghrib, ANRT, and CERT-MJ.",
      timeline: "90 days",
      owner: "CISO & Group Communications",
    },
    {
      priority: "high",
      action: "Convert the MAD 2 bn sustainable bond from announcement to ongoing impact story.",
      rationale:
        "The first Moroccan-bank sustainable bond was oversubscribed 3.2x — a strong narrative that should not die in a single news cycle. Build a sustained content cadence: where the money went, what it financed (green buildings, SME lending, renewable energy), impact KPIs, second-party opinion. The bond is a platform, not an event.",
      timeline: "120 days",
      owner: "ESG & Sustainable Finance Lead",
    },
    {
      priority: "medium",
      action: "Build a fraud-prevention customer-education campaign at scale.",
      rationale:
        "Financial fraud risk (composite 62, rising) is the bank's most material non-cyber risk. A customer-education campaign — phishing, social engineering, account-takeover — coordinated with Bank Al-Maghrib and competitors reduces both fraud incidence and negative coverage. Make Attijariwafa the visible leader on customer protection.",
      timeline: "120 days",
      owner: "Retail Banking & Communications",
    },
    {
      priority: "medium",
      action: "Brief African financial press on Egypt and Côte d'Ivoire milestones.",
      rationale:
        "International operations now drive 38% of net banking income but get less than 25% of the coverage volume. Brief Financial Afrik, Jeune Afrique, Reuters Africa, and Bloomberg Africa editors on Egypt profitability, Côte d'Ivoire leadership, and the broader pan-African franchise. International narrative = stability narrative.",
      timeline: "90 days",
      owner: "International Communications",
    },
  ],

  methodology:
    "This profile is built from 287 articles analyzed across 24 distinct sources over the trailing 90 days, including Moroccan financial press (L'Économiste, Medias24, Le Matin, Aujourd'hui le Maroc, TelQuel), international wires and finance press (Bloomberg, Reuters, Financial Afrik, Jeune Afrique, Les Échos), Bank Al-Maghrib publications, AMMC filings, Attijariwafa Bank annual report and sustainability report, social platforms (LinkedIn, X, YouTube), and the four leading generative AI engines (ChatGPT, Claude, Gemini, Perplexity). The Harch Reputation Index blends share of voice (25%), sentiment polarity (25%), AI citation frequency (20%), pillar scores for Innovation / Performance / Purpose (20%), and ESG narrative strength (10%) into a single 0–100 composite. Risk scores use the Harch 32-category framework, scored 0–100 by combining mention frequency (40%), severity weighting (35%), and forward-looking velocity (25%). All data is refreshed every 6 hours. Subsidiary entities (Attijariwafa Egypt, Attijariwafa Côte d'Ivoire, Attijariwafa Tunisie, Wafacash, Wafa Assurance) are attributed to Attijariwafa Bank for scoring.",
};

export default function AttijariwafaPage() {
  return <CompanyPageLayout data={DATA} />;
}
