"use client";

import { CompanyPageLayout, CompanyData } from "../CompanyShared";

const DATA: CompanyData = {
  slug: "maroc-telecom",
  name: "Maroc Telecom",
  shortName: "Maroc Telecom",
  sector: "Telecommunications",
  color: "#4A7B5F",
  logoInitial: "M",
  tagline:
    "Morocco's incumbent telecom operator ranks #3 in the Harch 100 with a 79/100 reputation score, anchored by 5G rollout leadership, fiber expansion, and digital-inclusion programmes that compound national-champion goodwill across both regulatory and consumer narratives.",
  heroDescription:
    "Maroc Telecom (Itissalat Al-Maghrib) is Morocco's largest telecom operator with 23.4 million mobile subscribers, 4.8 million fixed lines, and 1.9 million FTTH customers at end-2024. Its reputation is driven by a 52% innovation weighting (5G rollout, FTTH expansion, B2B services, AI-powered customer care), a 30% performance weighting (MAD 18.6 bn 2024 revenue, 4.2% EBITDA growth), and an 18% purpose weighting (digital inclusion, rural connectivity, universal-service fund).",
  analysisBody:
    "Maroc Telecom is Morocco's most reputable telecom operator and the #3 company in the Harch 100. Its 79/100 score reflects three structural advantages. First, scale: with 23.4 million mobile subscribers (44% market share), 4.8 million fixed lines (87% market share), and 1.9 million FTTH customers (78% market share), Maroc Telecom is the dominant infrastructure brand in Morocco — the company that connects the country. Second, 5G leadership: Maroc Telecom launched 5G services in November 2024, three months ahead of competitors, and now covers 28% of the population with 5G — a first-mover advantage that anchors its innovation narrative. Third, universal-service legitimacy: the universal-service fund (FST), co-funded by all operators but led by Maroc Telecom, has connected 4,200 rural localities since 2022 — a digital-inclusion story that softens regulatory pressure and reinforces national-champion positioning. The trend is upward (+2 points vs previous month), driven by 5G rollout narrative and the universal-service milestone. The risk register is concentrated in cyber attack (composite 60, rising), system failure (55, stable), and data breach (50, rising) — all technology risks that reflect the inherent attack surface of a telecom incumbent. The single most important gap is AI visibility: Claude does not cite Maroc Telecom in our test queries — a notable absence given that the company's 5G rollout story is exactly the kind of contemporary technology narrative that generative AI engines should surface. The fix is content-engineering: structured, machine-readable content about 5G coverage, FTTH rollout, and universal-service milestones, optimised for AI engine retrieval.",

  rank: 3,
  score: 79,
  prevScore: 77,
  trend: "up",
  change: "+2",
  industryRank: 1,
  industryTotal: 3,

  topStats: {
    articles: 245,
    sources: 22,
    aiCitations: 3,
    aiCitationsTotal: 4,
    shareOfVoice: 24,
  },

  pillars: {
    innovation: { weight: 52, score: 82 },
    performance: { weight: 30, score: 81 },
    purpose: { weight: 18, score: 70 },
  },

  radar: {
    axes: ["Collaborations", "Products", "Technology", "Governance", "Growth", "Operations", "CSR", "Culture", "Sustainability"],
    series: [
      { name: "Maroc Telecom", color: "#4A7B5F", values: [74, 81, 84, 78, 80, 82, 71, 70, 68] },
      { name: "Industry average", color: "#4A5D6E", values: [65, 70, 72, 68, 66, 70, 60, 62, 64] },
    ],
  },

  sentimentSplit: [
    { label: "Positive", value: 64, color: "#4A7B5F" },
    { label: "Neutral", value: 28, color: "#4A5D6E" },
    { label: "Negative", value: 8, color: "#A0524B" },
  ],

  sentimentByLanguage: [
    { label: "FR", value: 128, color: "#4A7B5F" },
    { label: "AR", value: 72, color: "#4A5D6E" },
    { label: "EN", value: 45, color: "#B87333" },
  ],

  topSources: [
    { label: "Le Matin", value: 30, sublabel: "Positive-leaning", color: "#4A7B5F" },
    { label: "L'Économiste", value: 26, sublabel: "Neutral", color: "#4A5D6E" },
    { label: "Aujourd'hui le Maroc", value: 22, sublabel: "Positive-leaning", color: "#4A7B5F" },
    { label: "Medias24", value: 22, sublabel: "Neutral", color: "#4A5D6E" },
    { label: "TelQuel", value: 18, sublabel: "Neutral", color: "#4A5D6E" },
    { label: "Les Écos", value: 16, sublabel: "Positive-leaning", color: "#4A7B5F" },
    { label: "Reuters", value: 14, sublabel: "Neutral", color: "#4A5D6E" },
    { label: "Jeune Afrique", value: 14, sublabel: "Positive-leaning", color: "#4A7B5F" },
    { label: "Hespress", value: 12, sublabel: "Negative-leaning", color: "#A0524B" },
    { label: "Bloomberg", value: 10, sublabel: "Neutral", color: "#4A5D6E" },
  ],

  quarterly: {
    series: [
      { name: "Maroc Telecom", color: "#4A7B5F", points: [75, 76, 77, 79] },
      { name: "Telecom industry avg", color: "#4A5D6E", points: [66, 67, 68, 70] },
    ],
    xLabels: ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025"],
  },

  narratives: [
    {
      statement: "5G rollout leadership — Maroc Telecom covers 28% of population, three months ahead of Inwi and Orange Maroc.",
      strength: 86,
      sentiment: 0.72,
      articles: 42,
      trajectory: "growing",
    },
    {
      statement: "Digital inclusion — universal-service fund connects 4,200 rural localities since 2022, national-champion narrative reinforced.",
      strength: 82,
      sentiment: 0.74,
      articles: 34,
      trajectory: "peak",
    },
    {
      statement: "Network investment — MAD 8.4 bn capex plan for 2024–2026, focused on FTTH and 5G, well-received by analysts.",
      strength: 78,
      sentiment: 0.66,
      articles: 30,
      trajectory: "growing",
    },
    {
      statement: "B2B services — managed services, cloud, cybersecurity arm targeting SMEs and large enterprises.",
      strength: 74,
      sentiment: 0.62,
      articles: 24,
      trajectory: "emerging",
    },
    {
      statement: "Fiber expansion — 1.9 million FTTH customers, 78% market share, MAD 4.2 bn fiber investment programme.",
      strength: 72,
      sentiment: 0.68,
      articles: 22,
      trajectory: "growing",
    },
  ],

  risks: [
    {
      label: "Cyber attack",
      category: "Technology",
      frequency: 46,
      impact: 88,
      velocity: 78,
      composite: 60,
      trajectory: "rising",
      mitigation: "24/7 SOC investment, red-team exercises, customer-facing security communications. Coordinate with ANRT, DGSSI, and CERT-MJ on sector-wide protocols. B2B cybersecurity arm is both attack surface and reputation asset — leverage it.",
    },
    {
      label: "System failure",
      category: "Operational",
      frequency: 42,
      impact: 80,
      velocity: 65,
      composite: 55,
      trajectory: "stable",
      mitigation: "Network-redundancy investment. Pre-position outage-communication protocol: customer SMS, social-media updates, ANRT notification. Last major outage (Mar 2024) cost 2 reputation points — lesson learned.",
    },
    {
      label: "Data breach",
      category: "Technology",
      frequency: 38,
      impact: 82,
      velocity: 62,
      composite: 50,
      trajectory: "rising",
      mitigation: "GDPR-aligned data-protection narrative. Customer-data-transparency report. 23.4 million subscribers = largest personal-data footprint in Morocco — investment in encryption, access controls, breach-detection must be visible.",
    },
    {
      label: "Infrastructure failure",
      category: "Operational",
      frequency: 36,
      impact: 78,
      velocity: 52,
      composite: 45,
      trajectory: "stable",
      mitigation: "FTTH and 5G rollout quality control. Vendor due diligence (Huawei, Ericsson, Nokia). Site-physical-security for critical infrastructure (submarine cable landing stations, fiber backbones).",
    },
    {
      label: "Regulatory changes",
      category: "Legal",
      frequency: 32,
      impact: 76,
      velocity: 42,
      composite: 42,
      trajectory: "falling",
      mitigation: "Proactive dialogue with ANRT on spectrum fees, universal-service contributions, MVNO regulation. Asymmetric-regulation narrative must be visible — Maroc Telecom is held to higher standards than competitors, which is itself a market-position story.",
    },
  ],

  aiEngines: [
    { name: "ChatGPT", cited: true, position: "#1", sentiment: 0.68 },
    { name: "Perplexity", cited: true, position: "#1", sentiment: 0.64 },
    { name: "Gemini", cited: true, position: "#2", sentiment: 0.58 },
    { name: "Claude", cited: false, position: "NOT CITED", sentiment: 0 },
  ],

  topicHeatmap: {
    rows: [
      "5G rollout",
      "Digital inclusion",
      "FTTH expansion",
      "B2B & cloud",
      "Network investment",
      "Cyber & security",
      "Universal service",
      "Mobile money",
      "Q2 results",
      "Leadership (Ghita Lahlou)",
    ],
    cols: ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025"],
    data: [
      { row: "5G rollout", col: "Q1 2025", value: 18 },
      { row: "5G rollout", col: "Q2 2025", value: 24 },
      { row: "5G rollout", col: "Q3 2025", value: 32 },
      { row: "5G rollout", col: "Q4 2025", value: 42 },
      { row: "Digital inclusion", col: "Q1 2025", value: 16 },
      { row: "Digital inclusion", col: "Q2 2025", value: 20 },
      { row: "Digital inclusion", col: "Q3 2025", value: 26 },
      { row: "Digital inclusion", col: "Q4 2025", value: 34 },
      { row: "FTTH expansion", col: "Q1 2025", value: 14 },
      { row: "FTTH expansion", col: "Q2 2025", value: 16 },
      { row: "FTTH expansion", col: "Q3 2025", value: 20 },
      { row: "FTTH expansion", col: "Q4 2025", value: 22 },
      { row: "B2B & cloud", col: "Q1 2025", value: 8 },
      { row: "B2B & cloud", col: "Q2 2025", value: 12 },
      { row: "B2B & cloud", col: "Q3 2025", value: 16 },
      { row: "B2B & cloud", col: "Q4 2025", value: 24 },
      { row: "Network investment", col: "Q1 2025", value: 12 },
      { row: "Network investment", col: "Q2 2025", value: 14 },
      { row: "Network investment", col: "Q3 2025", value: 18 },
      { row: "Network investment", col: "Q4 2025", value: 30 },
      { row: "Cyber & security", col: "Q1 2025", value: 8 },
      { row: "Cyber & security", col: "Q2 2025", value: 10 },
      { row: "Cyber & security", col: "Q3 2025", value: 14 },
      { row: "Cyber & security", col: "Q4 2025", value: 18 },
      { row: "Universal service", col: "Q1 2025", value: 10 },
      { row: "Universal service", col: "Q2 2025", value: 12 },
      { row: "Universal service", col: "Q3 2025", value: 16 },
      { row: "Universal service", col: "Q4 2025", value: 20 },
      { row: "Mobile money", col: "Q1 2025", value: 8 },
      { row: "Mobile money", col: "Q2 2025", value: 10 },
      { row: "Mobile money", col: "Q3 2025", value: 12 },
      { row: "Mobile money", col: "Q4 2025", value: 14 },
      { row: "Q2 results", col: "Q1 2025", value: 8 },
      { row: "Q2 results", col: "Q2 2025", value: 14 },
      { row: "Q2 results", col: "Q3 2025", value: 22 },
      { row: "Q2 results", col: "Q4 2025", value: 28 },
      { row: "Leadership (Ghita Lahlou)", col: "Q1 2025", value: 8 },
      { row: "Leadership (Ghita Lahlou)", col: "Q2 2025", value: 10 },
      { row: "Leadership (Ghita Lahlou)", col: "Q3 2025", value: 12 },
      { row: "Leadership (Ghita Lahlou)", col: "Q4 2025", value: 14 },
    ],
  },

  competitorRadar: {
    axes: ["Score", "Sentiment", "AI visibility", "Share of voice", "Risk (inv.)", "Narrative"],
    series: [
      { name: "Maroc Telecom", color: "#4A7B5F", values: [79, 64, 75, 88, 62, 80] },
      { name: "Inwi", color: "#4A5D6E", values: [74, 68, 70, 60, 70, 72] },
      { name: "Orange Maroc", color: "#B87333", values: [65, 60, 58, 42, 64, 56] },
    ],
  },

  competitorsList: [
    { name: "Inwi", score: 74 },
    { name: "Orange Maroc", score: 65 },
  ],

  recentArticles: [
    {
      title: "Maroc Telecom 5G network reaches 28% population coverage — three months ahead of competitors",
      source: "Le Matin",
      date: "Dec 6, 2025",
      sentiment: "positive",
      relevance: 94,
    },
    {
      title: "Universal-service fund connects 4,200th rural locality — Maroc Telecom leads programme",
      source: "Aujourd'hui le Maroc",
      date: "Nov 29, 2025",
      sentiment: "positive",
      relevance: 90,
    },
    {
      title: "Maroc Telecom Q3 results: revenue up 4.2%, EBITDA margin stable at 50.1%, FTTH drives growth",
      source: "L'Économiste",
      date: "Nov 18, 2025",
      sentiment: "positive",
      relevance: 88,
    },
    {
      title: "Maroc Telecom launches B2B cybersecurity arm targeting Moroccan SMEs and large enterprises",
      source: "Les Écos",
      date: "Nov 8, 2025",
      sentiment: "positive",
      relevance: 82,
    },
    {
      title: "FTTH subscriptions cross 1.9 million — Maroc Telecom maintains 78% market share",
      source: "Medias24",
      date: "Oct 24, 2025",
      sentiment: "positive",
      relevance: 80,
    },
    {
      title: "Maroc Telecom announces MAD 8.4 bn capex plan for 2024–2026, focused on 5G and fiber",
      source: "Bloomberg",
      date: "Oct 12, 2025",
      sentiment: "neutral",
      relevance: 84,
    },
    {
      title: "Cyber-attack risk rising for Moroccan telecoms — Maroc Telecom most exposed, sector report warns",
      source: "Hespress",
      date: "Oct 3, 2025",
      sentiment: "negative",
      relevance: 76,
    },
    {
      title: "Maroc Telecom acquires 5G spectrum in 2.6 GHz and 3.5 GHz bands for MAD 4.2 bn",
      source: "Reuters",
      date: "Sep 22, 2025",
      sentiment: "neutral",
      relevance: 78,
    },
  ],

  recommendations: [
    {
      priority: "critical",
      action: "Fix the Claude visibility gap — content-engineering for AI retrieval.",
      rationale:
        "Claude does not cite Maroc Telecom in our 12 standard reputation queries — a notable absence given the 5G rollout story is exactly the kind of contemporary technology narrative that AI engines should surface. The fix is structured, machine-readable content: 5G coverage maps, FTTH rollout milestones, universal-service KPIs, published as schema.org-marked pages with clear question-answer format. AI visibility is now a commercial asset, not a vanity metric.",
      timeline: "60 days",
      owner: "Digital Marketing & SEO Lead",
    },
    {
      priority: "high",
      action: "Pre-position on cyber attack — the single largest risk in the register.",
      rationale:
        "Cyber attack (composite 60, rising) is the company's most material risk. As Morocco's largest telecom operator, Maroc Telecom's attack surface is the largest in the sector. A single major breach would erase 6–8 reputation points and trigger ANRT regulatory scrutiny that compounds for 18 months. Invest in 24/7 SOC, run quarterly red-team exercises, pre-position breach-response protocol with ANRT, DGSSI, and CERT-MJ.",
      timeline: "90 days",
      owner: "CISO & Group Communications",
    },
    {
      priority: "high",
      action: "Convert the 5G rollout story into a sustained narrative engine.",
      rationale:
        "5G leadership is the company's strongest narrative (strength 86, growing). Do not let it die in a single news cycle. Build a sustained content cadence: quarterly coverage expansion announcements, 5G use-case partnerships (smart cities, Industry 4.0, telemedicine), enterprise customer testimonials. The first-mover advantage is only valuable if it is sustained for 24 months — the typical window before competitors catch up.",
      timeline: "120 days",
      owner: "Brand & Innovation Communications",
    },
    {
      priority: "medium",
      action: "Position the B2B cybersecurity arm as both revenue and reputation asset.",
      rationale:
        "The newly-launched B2B cybersecurity arm is both an attack surface and a reputation asset — it should be visible as evidence of cyber maturity, not just as a product line. Build a thought-leadership cadence: threat reports, customer case studies, sector partnerships. The narrative flips cyber from liability to evidence of competence.",
      timeline: "120 days",
      owner: "B2B Marketing & Communications",
    },
    {
      priority: "medium",
      action: "Build a universal-service quarterly transparency report.",
      rationale:
        "The universal-service fund (4,200 rural localities connected) is a national-champion story that softens regulatory pressure and reinforces legitimacy. Convert it from annual reporting into a quarterly transparency report: localities connected, population served, services available, economic-impact KPIs. This is the kind of ESG-adjacent narrative that compounds with regulators and policymakers.",
      timeline: "90 days",
      owner: "Regulatory Affairs & CSR",
    },
  ],

  methodology:
    "This profile is built from 245 articles analyzed across 22 distinct sources over the trailing 90 days, including Moroccan press (Le Matin, L'Économiste, Aujourd'hui le Maroc, Medias24, TelQuel, Les Écos, Hespress), international wires (Bloomberg, Reuters), African business press (Jeune Afrique, Financial Afrik), ANRT publications and decisions, Maroc Telecom annual report and sustainability report, social platforms (LinkedIn, X, YouTube), and the four leading generative AI engines (ChatGPT, Claude, Gemini, Perplexity). The Harch Reputation Index blends share of voice (25%), sentiment polarity (25%), AI citation frequency (20%), pillar scores for Innovation / Performance / Purpose (20%), and ESG narrative strength (10%) into a single 0–100 composite. Risk scores use the Harch 32-category framework, scored 0–100 by combining mention frequency (40%), severity weighting (35%), and forward-looking velocity (25%). All data is refreshed every 6 hours. Subsidiary entities (Maroc Telecom Mauritanie, Moov Africa, subsidiary operations in Burkina Faso, Gabon, Mali, Côte d'Ivoire, Bénin, Togo, Niger, Central African Republic, Chad) are attributed to Maroc Telecom for scoring.",
};

export default function MarocTelecomPage() {
  return <CompanyPageLayout data={DATA} />;
}
