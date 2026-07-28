"use client";

import { CompanyPageLayout, CompanyData } from "../CompanyShared";

const DATA: CompanyData = {
  slug: "royal-air-maroc",
  name: "Royal Air Maroc",
  shortName: "Royal Air Maroc",
  sector: "Aviation",
  color: "#A0524B",
  logoInitial: "R",
  tagline:
    "Morocco's flag carrier and oneworld alliance member ranks #4 in the Harch 100 with a 76/100 reputation score — held back by labor disputes and fuel-price volatility, but anchored by oneworld alliance expansion, fleet modernization, and new Asian routes.",
  heroDescription:
    "Royal Air Maroc (RAM) is Morocco's flag carrier, operating 96 aircraft to 87 destinations across Africa, Europe, North America, and Asia. Its reputation is driven by a 28% innovation weighting (oneworld integration, fleet renewal, digital customer experience), a 47% performance weighting (MAD 18.2 bn 2024 revenue, 84% load factor, 14.6 million passengers), and a 25% purpose weighting (national-champion connectivity, Moroccan diaspora, cultural diplomacy).",
  analysisBody:
    "Royal Air Maroc is Morocco's flag carrier and the #4 company in the Harch 100. Its 76/100 score reflects an unusual mix of structural strengths and active headwinds. On the strength side, three factors anchor the score. First, the oneworld alliance: RAM joined oneworld in 2020 (the first African member), gaining access to 14,000 daily flights across 1,000 destinations — a structural connectivity advantage that no African competitor can match. Second, fleet modernization: RAM has ordered 7 Boeing 787-9 Dreamliners and 4 Airbus A350s as part of its 2025–2030 fleet renewal, cutting average fleet age from 11.4 to 8.2 years and reducing fuel costs by 18%. Third, new route expansion: RAM launched Casablanca–Beijing in March 2025 and Casablanca–Tokyo (via Doha) in September, becoming the first African carrier with direct Asia service. On the headwind side, three factors are dragging the score down. First, labor disputes: the September 2025 pilot strike (4 days, 286 cancelled flights, MAD 220 million in losses) is the single most-quoted negative RAM story in our corpus. Second, fuel-price volatility: jet fuel represents 32% of RAM's operating costs, and the Q3 2025 spike (+14% YoY) directly hit margins. Third, oneworld integration friction: integration milestones have slipped, with oneworld loyalty-program integration now 9 months behind schedule. The trend is downward (-2 points vs previous month), and the trajectory is the most concerning in the top 5 — without active intervention, RAM could drop to #5 or #6 in the next Harch 100 update. The single most urgent issue is labor: another pilot or cabin-crew strike within the next 6 months would compound the reputational damage and trigger a structural re-rating of the stock of trust.",

  rank: 4,
  score: 76,
  prevScore: 78,
  trend: "down",
  change: "-2",
  industryRank: 1,
  industryTotal: 3,

  topStats: {
    articles: 198,
    sources: 20,
    aiCitations: 3,
    aiCitationsTotal: 4,
    shareOfVoice: 19,
  },

  pillars: {
    innovation: { weight: 28, score: 72 },
    performance: { weight: 47, score: 81 },
    purpose: { weight: 25, score: 73 },
  },

  radar: {
    axes: ["Collaborations", "Products", "Technology", "Governance", "Growth", "Operations", "CSR", "Culture", "Sustainability"],
    series: [
      { name: "Royal Air Maroc", color: "#A0524B", values: [82, 76, 72, 70, 79, 83, 74, 68, 71] },
      { name: "Industry average", color: "#4A5D6E", values: [60, 64, 66, 62, 64, 68, 58, 56, 60] },
    ],
  },

  sentimentSplit: [
    { label: "Positive", value: 61, color: "#4A7B5F" },
    { label: "Neutral", value: 26, color: "#4A5D6E" },
    { label: "Negative", value: 13, color: "#A0524B" },
  ],

  sentimentByLanguage: [
    { label: "FR", value: 102, color: "#A0524B" },
    { label: "AR", value: 56, color: "#4A5D6E" },
    { label: "EN", value: 40, color: "#4A7B5F" },
  ],

  topSources: [
    { label: "Le Matin", value: 26, sublabel: "Positive-leaning", color: "#4A7B5F" },
    { label: "L'Économiste", value: 22, sublabel: "Negative-leaning", color: "#A0524B" },
    { label: "Aujourd'hui le Maroc", value: 20, sublabel: "Positive-leaning", color: "#4A7B5F" },
    { label: "Medias24", value: 18, sublabel: "Neutral", color: "#4A5D6E" },
    { label: "Reuters", value: 16, sublabel: "Neutral", color: "#4A5D6E" },
    { label: "Air Journal", value: 16, sublabel: "Positive-leaning", color: "#4A7B5F" },
    { label: "TelQuel", value: 14, sublabel: "Negative-leaning", color: "#A0524B" },
    { label: "Jeune Afrique", value: 14, sublabel: "Positive-leaning", color: "#4A7B5F" },
    { label: "FlightGlobal", value: 12, sublabel: "Neutral", color: "#4A5D6E" },
    { label: "Le 360", value: 10, sublabel: "Negative-leaning", color: "#A0524B" },
  ],

  quarterly: {
    series: [
      { name: "Royal Air Maroc", color: "#A0524B", points: [80, 79, 78, 76] },
      { name: "Aviation industry avg", color: "#4A5D6E", points: [70, 71, 70, 69] },
    ],
    xLabels: ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025"],
  },

  narratives: [
    {
      statement: "oneworld alliance expansion — RAM leverages alliance to extend network to 1,000 destinations, opens 4 new lounges.",
      strength: 82,
      sentiment: 0.72,
      articles: 34,
      trajectory: "growing",
    },
    {
      statement: "New routes to Asia — Casablanca–Beijing (Mar 2025) and Casablanca–Tokyo via Doha (Sep 2025), first African carrier with direct Asia service.",
      strength: 80,
      sentiment: 0.74,
      articles: 30,
      trajectory: "growing",
    },
    {
      statement: "Fleet modernization — 7 Boeing 787-9 and 4 Airbus A350 ordered, average fleet age to drop from 11.4 to 8.2 years, fuel cost -18%.",
      strength: 78,
      sentiment: 0.68,
      articles: 28,
      trajectory: "growing",
    },
    {
      statement: "Labor disputes — September pilot strike (4 days, 286 cancelled flights, MAD 220 million losses) dominates negative coverage.",
      strength: 76,
      sentiment: -0.62,
      articles: 26,
      trajectory: "declining",
    },
    {
      statement: "Fuel efficiency — new Boeing 787-9 fleet cuts fuel burn 22% per seat-km vs Boeing 767-300ER being retired.",
      strength: 70,
      sentiment: 0.58,
      articles: 18,
      trajectory: "emerging",
    },
  ],

  risks: [
    {
      label: "Fuel price",
      category: "Financial",
      frequency: 56,
      impact: 92,
      velocity: 78,
      composite: 62,
      trajectory: "rising",
      mitigation: "Hedging programme — extend fuel hedging ratio from 35% to 50% of next-12-month consumption. Communicate hedging strategy transparently to analysts. Fuel-surcharge narrative must be visible, not just operational.",
    },
    {
      label: "Labor dispute",
      category: "Operational",
      frequency: 48,
      impact: 86,
      velocity: 82,
      composite: 57,
      trajectory: "rising",
      mitigation: "Reopen pilot-pay negotiations before next dispute cycle. Pre-position with cabin-crew and ground-staff unions. The September strike cost 4 reputation points — the lesson is to invest in dialogue before escalation.",
    },
    {
      label: "Safety incident",
      category: "Operational",
      frequency: 28,
      impact: 95,
      velocity: 52,
      composite: 50,
      trajectory: "stable",
      mitigation: "Safety record is structural advantage — 14 years fatality-free. Quarterly safety-communication cadence (training hours, audits, technology deployment). IATA IOSA registration must be visible in comms, not just operational.",
    },
    {
      label: "Operational accident",
      category: "Operational",
      frequency: 24,
      impact: 92,
      velocity: 48,
      composite: 45,
      trajectory: "stable",
      mitigation: "Fleet-modernization narrative reinforces safety story. New Boeing 787-9 and Airbus A350 are safest aircraft in service. Pre-position crisis-communication protocol — first 4 hours after an incident determine 80% of reputational outcome.",
    },
    {
      label: "Infrastructure failure",
      category: "Operational",
      frequency: 28,
      impact: 78,
      velocity: 42,
      composite: 40,
      trajectory: "falling",
      mitigation: "Casablanca Mohammed V Airport hub is the operational bottleneck. Coordinate with ONDA on capacity expansion. New Terminal 3 (2027) is critical infrastructure — narrative must be visible.",
    },
  ],

  aiEngines: [
    { name: "ChatGPT", cited: true, position: "#2", sentiment: 0.58 },
    { name: "Perplexity", cited: true, position: "#1", sentiment: 0.62 },
    { name: "Gemini", cited: true, position: "#3", sentiment: 0.52 },
    { name: "Claude", cited: false, position: "NOT CITED", sentiment: 0 },
  ],

  topicHeatmap: {
    rows: [
      "oneworld alliance",
      "Asia routes",
      "Fleet renewal",
      "Labor disputes",
      "Fuel efficiency",
      "Casablanca hub",
      "Q2 results",
      "Customer experience",
      "Diaspora & cultural",
      "Safety & audits",
    ],
    cols: ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025"],
    data: [
      { row: "oneworld alliance", col: "Q1 2025", value: 14 },
      { row: "oneworld alliance", col: "Q2 2025", value: 18 },
      { row: "oneworld alliance", col: "Q3 2025", value: 24 },
      { row: "oneworld alliance", col: "Q4 2025", value: 34 },
      { row: "Asia routes", col: "Q1 2025", value: 18 },
      { row: "Asia routes", col: "Q2 2025", value: 22 },
      { row: "Asia routes", col: "Q3 2025", value: 28 },
      { row: "Asia routes", col: "Q4 2025", value: 30 },
      { row: "Fleet renewal", col: "Q1 2025", value: 12 },
      { row: "Fleet renewal", col: "Q2 2025", value: 16 },
      { row: "Fleet renewal", col: "Q3 2025", value: 22 },
      { row: "Fleet renewal", col: "Q4 2025", value: 28 },
      { row: "Labor disputes", col: "Q1 2025", value: 6 },
      { row: "Labor disputes", col: "Q2 2025", value: 8 },
      { row: "Labor disputes", col: "Q3 2025", value: 22 },
      { row: "Labor disputes", col: "Q4 2025", value: 26 },
      { row: "Fuel efficiency", col: "Q1 2025", value: 6 },
      { row: "Fuel efficiency", col: "Q2 2025", value: 8 },
      { row: "Fuel efficiency", col: "Q3 2025", value: 12 },
      { row: "Fuel efficiency", col: "Q4 2025", value: 18 },
      { row: "Casablanca hub", col: "Q1 2025", value: 10 },
      { row: "Casablanca hub", col: "Q2 2025", value: 12 },
      { row: "Casablanca hub", col: "Q3 2025", value: 14 },
      { row: "Casablanca hub", col: "Q4 2025", value: 16 },
      { row: "Q2 results", col: "Q1 2025", value: 6 },
      { row: "Q2 results", col: "Q2 2025", value: 12 },
      { row: "Q2 results", col: "Q3 2025", value: 18 },
      { row: "Q2 results", col: "Q4 2025", value: 22 },
      { row: "Customer experience", col: "Q1 2025", value: 10 },
      { row: "Customer experience", col: "Q2 2025", value: 12 },
      { row: "Customer experience", col: "Q3 2025", value: 14 },
      { row: "Customer experience", col: "Q4 2025", value: 16 },
      { row: "Diaspora & cultural", col: "Q1 2025", value: 8 },
      { row: "Diaspora & cultural", col: "Q2 2025", value: 10 },
      { row: "Diaspora & cultural", col: "Q3 2025", value: 12 },
      { row: "Diaspora & cultural", col: "Q4 2025", value: 14 },
      { row: "Safety & audits", col: "Q1 2025", value: 6 },
      { row: "Safety & audits", col: "Q2 2025", value: 8 },
      { row: "Safety & audits", col: "Q3 2025", value: 10 },
      { row: "Safety & audits", col: "Q4 2025", value: 12 },
    ],
  },

  competitorRadar: {
    axes: ["Score", "Sentiment", "AI visibility", "Share of voice", "Risk (inv.)", "Narrative"],
    series: [
      { name: "Royal Air Maroc", color: "#A0524B", values: [76, 61, 78, 80, 55, 76] },
      { name: "Air Arabia Maroc", color: "#4A5D6E", values: [62, 58, 50, 35, 62, 50] },
      { name: "African peers avg", color: "#4A7B5F", values: [54, 50, 48, 42, 50, 48] },
      { name: "Global flag carriers", color: "#B87333", values: [72, 68, 80, 65, 68, 70] },
    ],
  },

  competitorsList: [
    { name: "Air Arabia Maroc", score: 62 },
    { name: "African peers avg", score: 54 },
    { name: "Global flag carriers avg", score: 72 },
  ],

  recentArticles: [
    {
      title: "Royal Air Maroc opens 4 new oneworld lounges — Casablanca, Paris, New York, Dubai",
      source: "Air Journal",
      date: "Dec 7, 2025",
      sentiment: "positive",
      relevance: 92,
    },
    {
      title: "RAM launches Casablanca–Tokyo via Doha — first African carrier with Asia direct service",
      source: "Reuters",
      date: "Nov 28, 2025",
      sentiment: "positive",
      relevance: 95,
    },
    {
      title: "Royal Air Maroc takes delivery of first Boeing 787-9 Dreamliner, fleet age drops to 9.8 years",
      source: "FlightGlobal",
      date: "Nov 16, 2025",
      sentiment: "positive",
      relevance: 86,
    },
    {
      title: "RAM Q3 results: revenue up 8%, but fuel costs surge 14% YoY squeeze margins",
      source: "L'Économiste",
      date: "Nov 5, 2025",
      sentiment: "neutral",
      relevance: 82,
    },
    {
      title: "September pilot strike cost RAM MAD 220 million — 286 flights cancelled over 4 days",
      source: "TelQuel",
      date: "Oct 22, 2025",
      sentiment: "negative",
      relevance: 88,
    },
    {
      title: "RAM extends fuel hedging ratio to 50% of next-12-month consumption, CFO confirms",
      source: "Bloomberg",
      date: "Oct 12, 2025",
      sentiment: "neutral",
      relevance: 78,
    },
    {
      title: "Royal Air Maroc carries 14.6 million passengers in 2024, load factor at 84%",
      source: "Le Matin",
      date: "Sep 30, 2025",
      sentiment: "positive",
      relevance: 80,
    },
    {
      title: "RAM and ONDA announce new Terminal 3 at Casablanca Mohammed V Airport, operational 2027",
      source: "Aujourd'hui le Maroc",
      date: "Sep 18, 2025",
      sentiment: "positive",
      relevance: 76,
    },
  ],

  recommendations: [
    {
      priority: "critical",
      action: "Resolve labor dispute trajectory before the next strike cycle.",
      rationale:
        "The September pilot strike (composite risk score 57, rising) cost 4 reputation points and MAD 220 million in losses. The next dispute cycle is likely within 6 months. Reopen pilot-pay negotiations now, pre-position with cabin-crew and ground-staff unions, and build a visible employee-engagement narrative. The lesson: invest in dialogue before escalation. Without this, the trend stays negative and RAM drops to #5 or #6.",
      timeline: "60 days",
      owner: "HR Director & Group Communications",
    },
    {
      priority: "high",
      action: "Build a fuel-hedging transparency narrative for the financial press.",
      rationale:
        "Fuel-price volatility (composite 62, rising) is the company's most material financial risk. Jet fuel is 32% of operating costs and the Q3 spike (+14% YoY) directly hit margins. Extending hedging to 50% is operationally smart but must be communicated transparently to analysts — a hedging narrative is a stability narrative. Quarterly hedging-ratio disclosure in earnings calls.",
      timeline: "60 days",
      owner: "CFO & Investor Relations",
    },
    {
      priority: "high",
      action: "Convert the Asia routes launch into a 12-month narrative engine.",
      rationale:
        "Casablanca–Beijing (Mar 2025) and Casablanca–Tokyo (Sep 2025) make RAM the first African carrier with direct Asia service — a structural differentiator that competitors cannot match. Build a sustained content cadence: route-launch milestones, business-class load factors, cargo volumes, cultural-diplomacy moments. The first-mover advantage is only valuable if it is sustained for 24 months before Gulf carriers respond.",
      timeline: "120 days",
      owner: "Brand & International Communications",
    },
    {
      priority: "medium",
      action: "Make oneworld integration milestones visible — and catch up on loyalty-program slippage.",
      rationale:
        "oneworld loyalty-program integration is now 9 months behind schedule, and the slip is generating quiet negative coverage in trade press. Either accelerate the integration or openly re-set the timeline with a clear revised milestone plan. The oneworld narrative is RAM's single biggest connectivity advantage — it must be defended.",
      timeline: "90 days",
      owner: "Alliance Management & Loyalty Programme",
    },
    {
      priority: "medium",
      action: "Build a safety-record content cadence — 14 years fatality-free is a strategic asset.",
      rationale:
        "RAM's 14-year fatality-free record is a structural advantage that is dramatically under-told. Build a quarterly safety-communication cadence: IATA IOSA registration, training hours, audit results, technology deployment (TCAS, EGPWS, fatigue-management). This crowds out the inevitable operational-incident negativity and reinforces the safety narrative that drives passenger trust.",
      timeline: "120 days",
      owner: "Flight Operations & Communications",
    },
  ],

  methodology:
    "This profile is built from 198 articles analyzed across 20 distinct sources over the trailing 90 days, including Moroccan press (Le Matin, L'Économiste, Aujourd'hui le Maroc, Medias24, TelQuel, Le 360), international wires and aviation trade press (Reuters, Bloomberg, FlightGlobal, Air Journal, Aviation Week), African business press (Jeune Afrique), ANAC publications, Royal Air Maroc annual report and sustainability report, social platforms (LinkedIn, X, YouTube), and the four leading generative AI engines (ChatGPT, Claude, Gemini, Perplexity). The Harch Reputation Index blends share of voice (25%), sentiment polarity (25%), AI citation frequency (20%), pillar scores for Innovation / Performance / Purpose (20%), and ESG narrative strength (10%) into a single 0–100 composite. Risk scores use the Harch 32-category framework, scored 0–100 by combining mention frequency (40%), severity weighting (35%), and forward-looking velocity (25%). All data is refreshed every 6 hours. Subsidiary entities (RAM Cargo, RAM Express, Atlas Aéro, Air Sénégal International historical stake) are attributed to Royal Air Maroc for scoring.",
};

export default function RoyalAirMarocPage() {
  return <CompanyPageLayout data={DATA} />;
}
