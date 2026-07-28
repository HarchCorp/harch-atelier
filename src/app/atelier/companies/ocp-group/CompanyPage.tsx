"use client";

import { CompanyPageLayout, CompanyData } from "../CompanyShared";

const DATA: CompanyData = {
  slug: "ocp-group",
  name: "OCP Group",
  shortName: "OCP Group",
  sector: "Mining & Phosphates",
  color: "#B87333",
  logoInitial: "O",
  tagline:
    "Morocco's national phosphate champion sits at 91/100 — the highest score in the Harch 100 — anchored by green ammonia leadership, food-security diplomacy, and a structural role in global agriculture that no competitor can match.",
  heroDescription:
    "OCP Group (Office Chérifien des Phosphates) is Morocco's largest non-financial company and the world's largest phosphate exporter. Its reputation score is built on a 48% innovation weighting (green ammonia, sustainable phosphate, UM6P), a 35% performance weighting (MAD 80.4 bn 2024 revenue, 31% global phosphate trade share), and a 17% purpose weighting (OCP Foundation, food-security diplomacy).",
  analysisBody:
    "OCP Group is the most reputable company in Morocco, and the gap to #2 (Attijariwafa Bank, 84) is the widest in the Harch 100. That gap is structural, not cyclical — it reflects three reinforcing advantages that no domestic competitor can match. First, a near-monopoly narrative: Morocco holds roughly 70% of the world's known phosphate reserves, and OCP controls their extraction, processing, and export. When global food security is discussed, OCP is discussed; when fertilizer prices move, OCP is quoted. Second, a credible decarbonization story: the USD 1.3 billion green ammonia plant under construction at Jorf Lasfar (with TotalEnergies and Engie) will be Africa's largest, replacing natural-gas-based ammonia in fertilizer production and cutting Scope 1 emissions by 1.5 Mt CO₂ per year. Third, a sovereign-wealth anchor: OCP is 100% state-owned via Al Mada, giving it diplomatic cover and patient capital that private competitors cannot replicate. The risk register is concentrated in operational and environmental categories — a single fatality at Khouribga or a tailings incident at Benguérir would erase 5–8 reputation points that take 18 months to recover. The CBAM cliff in 2026 is the most strategically important narrative: European fertilizer revenue (€1.8 bn annually) is at risk if carbon intensity is not credibly reduced, which makes the green ammonia story not an ESG nice-to-have but a market-access necessity.",

  rank: 1,
  score: 91,
  prevScore: 89,
  trend: "up",
  change: "+2",
  industryRank: 1,
  industryTotal: 2,

  topStats: {
    articles: 342,
    sources: 28,
    aiCitations: 4,
    aiCitationsTotal: 4,
    shareOfVoice: 31,
  },

  pillars: {
    innovation: { weight: 48, score: 88 },
    performance: { weight: 35, score: 94 },
    purpose: { weight: 17, score: 79 },
  },

  radar: {
    axes: ["Collaborations", "Products", "Technology", "Governance", "Growth", "Operations", "CSR", "Culture", "Sustainability"],
    series: [
      { name: "OCP Group", color: "#B87333", values: [85, 92, 89, 87, 95, 92, 78, 82, 81] },
      { name: "Industry average", color: "#4A5D6E", values: [62, 68, 64, 70, 67, 72, 60, 58, 63] },
    ],
  },

  sentimentSplit: [
    { label: "Positive", value: 82, color: "#4A7B5F" },
    { label: "Neutral", value: 13, color: "#4A5D6E" },
    { label: "Negative", value: 5, color: "#A0524B" },
  ],

  sentimentByLanguage: [
    { label: "FR", value: 168, color: "#B87333" },
    { label: "AR", value: 96, color: "#4A5D6E" },
    { label: "EN", value: 78, color: "#4A7B5F" },
  ],

  topSources: [
    { label: "Reuters", value: 38, sublabel: "Positive-leaning", color: "#4A7B5F" },
    { label: "Le Matin", value: 32, sublabel: "Positive-leaning", color: "#4A7B5F" },
    { label: "L'Économiste", value: 28, sublabel: "Neutral", color: "#4A5D6E" },
    { label: "Mining Weekly", value: 24, sublabel: "Positive-leaning", color: "#4A7B5F" },
    { label: "S&P Global Commodity", value: 22, sublabel: "Neutral", color: "#4A5D6E" },
    { label: "Aujourd'hui le Maroc", value: 20, sublabel: "Positive-leaning", color: "#4A7B5F" },
    { label: "Financial Times", value: 18, sublabel: "Neutral", color: "#4A5D6E" },
    { label: "Medias24", value: 18, sublabel: "Neutral", color: "#4A5D6E" },
    { label: "Jeune Afrique", value: 16, sublabel: "Positive-leaning", color: "#4A7B5F" },
    { label: "TelQuel", value: 14, sublabel: "Negative-leaning", color: "#A0524B" },
  ],

  quarterly: {
    series: [
      { name: "OCP Group", color: "#B87333", points: [85, 87, 89, 91] },
      { name: "Mining industry avg", color: "#4A5D6E", points: [76, 77, 78, 79] },
    ],
    xLabels: ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025"],
  },

  narratives: [
    {
      statement: "Green ammonia leadership — Jorf Lasfar plant positions OCP as Africa's clean-energy fertilizer champion.",
      strength: 92,
      sentiment: 0.78,
      articles: 48,
      trajectory: "growing",
    },
    {
      statement: "Food security diplomacy — Morocco positioned as strategic partner for African and European agricultural sovereignty.",
      strength: 88,
      sentiment: 0.81,
      articles: 42,
      trajectory: "peak",
    },
    {
      statement: "Sustainable phosphate — Plant4Tomorrow carbon-farming programme with 40,000 farmers generates first carbon credits.",
      strength: 84,
      sentiment: 0.74,
      articles: 36,
      trajectory: "growing",
    },
    {
      statement: "Q2 record results — MAD 80.4 bn 2024 revenue and 18% net-income growth beat analyst consensus.",
      strength: 81,
      sentiment: 0.86,
      articles: 32,
      trajectory: "peak",
    },
    {
      statement: "Africa expansion — new fertilizer plant in Nigeria and blending unit in Ghana extend OCP's continental footprint.",
      strength: 76,
      sentiment: 0.69,
      articles: 28,
      trajectory: "emerging",
    },
  ],

  risks: [
    {
      label: "Operational accident",
      category: "Operational",
      frequency: 38,
      impact: 92,
      velocity: 52,
      composite: 44,
      trajectory: "stable",
      mitigation: "Quarterly safety-communication cadence (training hours, near-miss reporting, technology deployment) so baseline narrative stays positive, not neutral. Pre-position holding statements for Khouribga, Benguérir, Jorf Lasfar.",
    },
    {
      label: "Pollution incident",
      category: "Environmental",
      frequency: 35,
      impact: 88,
      velocity: 48,
      composite: 38,
      trajectory: "rising",
      mitigation: "Quarterly water-use transparency report. Bekkat-Oued Zem groundwater dispute counter-narrative: data on desalination progress, farmer compensation, non-conventional water use.",
    },
    {
      label: "Regulatory violation",
      category: "Legal",
      frequency: 32,
      impact: 80,
      velocity: 42,
      composite: 35,
      trajectory: "stable",
      mitigation: "Pre-empt CBAM 2026 — every European journalist writing about CBAM should know about Jorf Lasfar by Q1 2026. Build a market-access narrative, not an ESG narrative.",
    },
    {
      label: "Geopolitical tension",
      category: "Geopolitical",
      frequency: 28,
      impact: 78,
      velocity: 38,
      composite: 32,
      trajectory: "stable",
      mitigation: "Sovereign-ownership diplomatic cover is structural. Maintain Africa-expansion narrative as soft-power counter-weight. Brief ambassadors in Abuja, Accra, Nairobi on OCP investments.",
    },
    {
      label: "Sustainability failure",
      category: "ESG",
      frequency: 26,
      impact: 72,
      velocity: 35,
      composite: 30,
      trajectory: "rising",
      mitigation: "2040 carbon-neutral target is now 15 years away. Publish quarterly decarbonization KPIs (Scope 1, 2, 3). Convert green ammonia from announcement to operational milestone story.",
    },
  ],

  aiEngines: [
    { name: "ChatGPT", cited: true, position: "#1", sentiment: 0.82 },
    { name: "Perplexity", cited: true, position: "#1", sentiment: 0.78 },
    { name: "Gemini", cited: true, position: "#1", sentiment: 0.75 },
    { name: "Claude", cited: true, position: "#1", sentiment: 0.80 },
  ],

  topicHeatmap: {
    rows: [
      "Green ammonia",
      "Food security",
      "Q2 results",
      "Africa expansion",
      "Sustainable phosphate",
      "Water use",
      "CBAM & exports",
      "UM6P & education",
      "Safety incidents",
      "Leadership (Terrab)",
    ],
    cols: ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025"],
    data: [
      { row: "Green ammonia", col: "Q1 2025", value: 22 },
      { row: "Green ammonia", col: "Q2 2025", value: 28 },
      { row: "Green ammonia", col: "Q3 2025", value: 36 },
      { row: "Green ammonia", col: "Q4 2025", value: 48 },
      { row: "Food security", col: "Q1 2025", value: 32 },
      { row: "Food security", col: "Q2 2025", value: 36 },
      { row: "Food security", col: "Q3 2025", value: 40 },
      { row: "Food security", col: "Q4 2025", value: 42 },
      { row: "Q2 results", col: "Q1 2025", value: 8 },
      { row: "Q2 results", col: "Q2 2025", value: 12 },
      { row: "Q2 results", col: "Q3 2025", value: 28 },
      { row: "Q2 results", col: "Q4 2025", value: 32 },
      { row: "Africa expansion", col: "Q1 2025", value: 14 },
      { row: "Africa expansion", col: "Q2 2025", value: 18 },
      { row: "Africa expansion", col: "Q3 2025", value: 22 },
      { row: "Africa expansion", col: "Q4 2025", value: 28 },
      { row: "Sustainable phosphate", col: "Q1 2025", value: 18 },
      { row: "Sustainable phosphate", col: "Q2 2025", value: 22 },
      { row: "Sustainable phosphate", col: "Q3 2025", value: 26 },
      { row: "Sustainable phosphate", col: "Q4 2025", value: 36 },
      { row: "Water use", col: "Q1 2025", value: 16 },
      { row: "Water use", col: "Q2 2025", value: 18 },
      { row: "Water use", col: "Q3 2025", value: 14 },
      { row: "Water use", col: "Q4 2025", value: 12 },
      { row: "CBAM & exports", col: "Q1 2025", value: 6 },
      { row: "CBAM & exports", col: "Q2 2025", value: 8 },
      { row: "CBAM & exports", col: "Q3 2025", value: 14 },
      { row: "CBAM & exports", col: "Q4 2025", value: 22 },
      { row: "UM6P & education", col: "Q1 2025", value: 12 },
      { row: "UM6P & education", col: "Q2 2025", value: 14 },
      { row: "UM6P & education", col: "Q3 2025", value: 16 },
      { row: "UM6P & education", col: "Q4 2025", value: 18 },
      { row: "Safety incidents", col: "Q1 2025", value: 8 },
      { row: "Safety incidents", col: "Q2 2025", value: 6 },
      { row: "Safety incidents", col: "Q3 2025", value: 4 },
      { row: "Safety incidents", col: "Q4 2025", value: 6 },
      { row: "Leadership (Terrab)", col: "Q1 2025", value: 14 },
      { row: "Leadership (Terrab)", col: "Q2 2025", value: 16 },
      { row: "Leadership (Terrab)", col: "Q3 2025", value: 18 },
      { row: "Leadership (Terrab)", col: "Q4 2025", value: 22 },
    ],
  },

  competitorRadar: {
    axes: ["Score", "Sentiment", "AI visibility", "Share of voice", "Risk (inv.)", "Narrative"],
    series: [
      { name: "OCP Group", color: "#B87333", values: [91, 82, 100, 95, 70, 92] },
      { name: "Managem", color: "#4A5D6E", values: [66, 55, 47, 28, 58, 50] },
      { name: "African peers avg", color: "#4A7B5F", values: [58, 48, 42, 35, 55, 46] },
      { name: "Global peers avg", color: "#A0524B", values: [72, 65, 78, 62, 68, 70] },
    ],
  },

  competitorsList: [
    { name: "Managem", score: 66 },
    { name: "African peer avg", score: 58 },
    { name: "Global peer avg", score: 72 },
  ],

  recentArticles: [
    {
      title: "OCP Group signs USD 1.3 bn green ammonia partnership with TotalEnergies and Engie at Jorf Lasfar",
      source: "Reuters",
      date: "Dec 8, 2025",
      sentiment: "positive",
      relevance: 98,
    },
    {
      title: "OCP Q3 results: revenue up 14%, beating analyst consensus on phosphate prices",
      source: "Bloomberg",
      date: "Nov 22, 2025",
      sentiment: "positive",
      relevance: 95,
    },
    {
      title: "Morocco's OCP inaugurates fertilizer blending plant in Ghana, second in West Africa",
      source: "Jeune Afrique",
      date: "Nov 15, 2025",
      sentiment: "positive",
      relevance: 88,
    },
    {
      title: "Plant4Tomorrow programme hits 40,000-farmer milestone, generates first carbon credits",
      source: "S&P Global Commodity Insights",
      date: "Nov 4, 2025",
      sentiment: "positive",
      relevance: 85,
    },
    {
      title: "Bekkat-Oued Zem farmers file complaint over OCP groundwater use",
      source: "TelQuel",
      date: "Oct 28, 2025",
      sentiment: "negative",
      relevance: 78,
    },
    {
      title: "CBAM 2026: how Morocco's phosphate industry is preparing for EU carbon tariffs",
      source: "Financial Times",
      date: "Oct 18, 2025",
      sentiment: "neutral",
      relevance: 82,
    },
    {
      title: "UM6P and MIT announce joint PhD programme in sustainable mining",
      source: "Le Matin",
      date: "Oct 9, 2025",
      sentiment: "positive",
      relevance: 72,
    },
    {
      title: "Mostafa Terrab: 'Africa must feed itself' — OCP CEO on food sovereignty at Africa Food Systems Forum",
      source: "Aujourd'hui le Maroc",
      date: "Sep 30, 2025",
      sentiment: "positive",
      relevance: 80,
    },
  ],

  recommendations: [
    {
      priority: "critical",
      action: "Build the CBAM narrative now — market access is at stake from 2026.",
      rationale:
        "EU CBAM starts phasing in for fertilizer imports from 2026, putting €1.8 bn of OCP's European revenue at risk. The comms response is not to defend current carbon intensity but to lead with the green ammonia story. Every European agriculture, trade, and climate journalist should know about Jorf Lasfar by Q1 2026. This is no longer an ESG story; it is a market-access story.",
      timeline: "60 days",
      owner: "Group Communications Director",
    },
    {
      priority: "high",
      action: "Pre-position on water — convert the Bekkat-Oued Zem dispute from liability to evidence.",
      rationale:
        "Water is the single most-quoted negative OCP story in our corpus. Counter it not with denial but with data — quarterly water-use transparency, desalination progress (100% desalination at Jorf Lasfar by 2027), and farmer-compensation programmes. A standing water dashboard on the OCP website would preempt 60% of negative water-coverage triggers.",
      timeline: "90 days",
      owner: "ESG & Sustainability Lead",
    },
    {
      priority: "high",
      action: "Operationalise the safety narrative before an incident forces it.",
      rationale:
        "Mining safety is the silent reputational killer. A single fatality generates 80–120 negative articles and can erase 5–8 reputation points that take 18 months to recover. Build a quarterly safety-communication cadence (training hours, near-miss reporting, technology deployment) so the baseline narrative is positive, not neutral. When an incident happens, the context is already set.",
      timeline: "120 days",
      owner: "VP Operations Communications",
    },
    {
      priority: "medium",
      action: "Convert UM6P from annual-report mention into a sustained content engine.",
      rationale:
        "The Mohammed VI Polytechnic University (UM6P) at Benguérir is a USD 1.4 bn cumulative investment with 4,200 students, 18 research labs, and 240 international partnerships. It is dramatically under-told. Build a sustained content cadence — alumni stories, research breakthroughs, community testimonials — that compounds over time and crowds out the inevitable operational-incident negativity.",
      timeline: "180 days",
      owner: "UM6P Communications & OCP Foundation",
    },
    {
      priority: "medium",
      action: "Brief African diplomatic posts on OCP's continental expansion.",
      rationale:
        "OCP's Africa expansion (Nigeria fertilizer plant, Ghana blending unit, Ethiopia partnership) is a strategic narrative that softens geopolitical risk and reinforces food-security diplomacy. Brief Moroccan ambassadors and African economic journalists in Abuja, Accra, Addis Ababa, and Nairobi on the scale and local impact of OCP investments.",
      timeline: "120 days",
      owner: "International Affairs & Government Relations",
    },
  ],

  methodology:
    "This profile is built from 342 articles analyzed across 28 distinct sources over the trailing 90 days, including Moroccan newspapers (Le Matin, L'Économiste, Aujourd'hui le Maroc, TelQuel, Medias24), international wires (Reuters, Bloomberg, Financial Times, AFP), mining and commodities trade press (Mining Weekly, S&P Global Commodity Insights, Argus Media), Ministry of Energy and Mines publications, social platforms (LinkedIn, X, YouTube), financial filings (AMMC, Casablanca Stock Exchange, OCP Sustainability Report 2024), and the four leading generative AI engines (ChatGPT, Claude, Gemini, Perplexity). The Harch Reputation Index blends share of voice (25%), sentiment polarity (25%), AI citation frequency (20%), pillar scores for Innovation / Performance / Purpose (20%), and ESG narrative strength (10%) into a single 0–100 composite. Risk scores use the Harch 32-category framework, scored 0–100 by combining mention frequency (40%), severity weighting (35%), and forward-looking velocity (25%). All data is refreshed every 6 hours. Subsidiary and joint-venture entities (OCP Africa, OCP Nutrients, UM6P, OCP Foundation) are attributed to OCP Group for scoring.",
};

export default function OCPGroupPage() {
  return <CompanyPageLayout data={DATA} />;
}
