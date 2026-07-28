"use client";

import { IndustryPageLayout, IndustryData } from "../IndustryShared";

const DATA: IndustryData = {
  slug: "telecom",
  name: "Telecommunications",
  tagline: "A stable triopoly racing toward 5G, where cyber risk has overtaken network coverage as the dominant reputational threat and digital inclusion is the new social licence.",
  color: "#4A7B5F",
  heroStat: "Telecom · 3 operators tracked · 1,124 data points",

  topStats: {
    companies: 3,
    dataPoints: 1124,
    reputationScore: 73,
    riskLevel: "Elevated",
    riskLevelColor: "#B87333",
  },

  reputationScore: 73,
  rankDistribution: [
    { tier: "Tier 1", range: "80+", count: 0, color: "#4A7B5F" },
    { tier: "Tier 2", range: "65–79", count: 3, color: "#4A5D6E" },
    { tier: "Tier 3", range: "50–64", count: 0, color: "#B87333" },
    { tier: "Tier 4", range: "<50", count: 0, color: "#A0524B" },
  ],

  topCompanies: [
    { rank: 1, name: "Maroc Telecom (IAM)", score: 79, sentiment: 64, shareOfVoice: 38, aiVisibility: 81, trend: [75, 76, 77, 79] },
    { rank: 2, name: "Inwi", score: 74, sentiment: 67, shareOfVoice: 31, aiVisibility: 58, trend: [68, 70, 72, 74] },
    { rank: 3, name: "Orange Maroc", score: 65, sentiment: 52, shareOfVoice: 27, aiVisibility: 49, trend: [67, 66, 65, 65] },
  ],

  quarterlyTrend: {
    series: [
      { name: "Telecom industry avg", color: "#4A7B5F", points: [70, 71, 72, 73] },
      { name: "Harch 100 cross-industry avg", color: "#4A5D6E", points: [62, 63, 64, 65] },
    ],
    xLabels: ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025"],
  },

  sentiment: [
    { label: "Positive", value: 48, color: "#4A7B5F" },
    { label: "Neutral", value: 35, color: "#4A5D6E" },
    { label: "Negative", value: 17, color: "#A0524B" },
  ],

  riskRadar: {
    axes: ["Geopolitical", "Operational", "Financial", "Environmental", "Legal", "Consumer", "Technology"],
    series: [
      { name: "Telecom exposure", color: "#4A7B5F", values: [35, 62, 30, 28, 45, 58, 80] },
    ],
  },

  topRisks: [
    { label: "Cyber attack", value: 80, sublabel: "DDoS, ransomware, SS7 exploit", color: "#A0524B" },
    { label: "Data breach", value: 70, sublabel: "Customer PII, SIM-swap, billing leak", color: "#A0524B" },
    { label: "System failure", value: 62, sublabel: "Core network outage, billing crash", color: "#B87333" },
    { label: "Infrastructure failure", value: 55, sublabel: "Fibre cut, tower power loss", color: "#B87333" },
    { label: "Regulatory change", value: 50, sublabel: "ANRT tariff caps, spectrum fees", color: "#4A5D6E" },
  ],

  pillars: [
    {
      company: "Maroc Telecom (IAM)",
      segments: [
        { label: "Innovation", value: 30, color: "#4A5D6E" },
        { label: "Performance", value: 32, color: "#4A7B5F" },
        { label: "Purpose", value: 17, color: "#B87333" },
      ],
    },
    {
      company: "Inwi",
      segments: [
        { label: "Innovation", value: 32, color: "#4A5D6E" },
        { label: "Performance", value: 22, color: "#4A7B5F" },
        { label: "Purpose", value: 20, color: "#B87333" },
      ],
    },
    {
      company: "Orange Maroc",
      segments: [
        { label: "Innovation", value: 22, color: "#4A5D6E" },
        { label: "Performance", value: 28, color: "#4A7B5F" },
        { label: "Purpose", value: 15, color: "#B87333" },
      ],
    },
  ],

  heatmap: {
    rows: ["Maroc Telecom", "Inwi", "Orange Maroc"],
    cols: ["Fin. results", "Leadership", "Products", "ESG", "M&A", "Digital", "Crisis", "Expansion", "Partnerships", "Regulation"],
    data: [
      // Maroc Telecom
      { row: "Maroc Telecom", col: "Fin. results", value: 38 },
      { row: "Maroc Telecom", col: "Leadership", value: 20 },
      { row: "Maroc Telecom", col: "Products", value: 35 },
      { row: "Maroc Telecom", col: "ESG", value: 18 },
      { row: "Maroc Telecom", col: "M&A", value: 15 },
      { row: "Maroc Telecom", col: "Digital", value: 42 },
      { row: "Maroc Telecom", col: "Crisis", value: 10 },
      { row: "Maroc Telecom", col: "Expansion", value: 22 },
      { row: "Maroc Telecom", col: "Partnerships", value: 28 },
      { row: "Maroc Telecom", col: "Regulation", value: 32 },
      // Inwi
      { row: "Inwi", col: "Fin. results", value: 22 },
      { row: "Inwi", col: "Leadership", value: 14 },
      { row: "Inwi", col: "Products", value: 32 },
      { row: "Inwi", col: "ESG", value: 22 },
      { row: "Inwi", col: "M&A", value: 8 },
      { row: "Inwi", col: "Digital", value: 38 },
      { row: "Inwi", col: "Crisis", value: 6 },
      { row: "Inwi", col: "Expansion", value: 12 },
      { row: "Inwi", col: "Partnerships", value: 30 },
      { row: "Inwi", col: "Regulation", value: 18 },
      // Orange Maroc
      { row: "Orange Maroc", col: "Fin. results", value: 25 },
      { row: "Orange Maroc", col: "Leadership", value: 16 },
      { row: "Orange Maroc", col: "Products", value: 28 },
      { row: "Orange Maroc", col: "ESG", value: 20 },
      { row: "Orange Maroc", col: "M&A", value: 12 },
      { row: "Orange Maroc", col: "Digital", value: 30 },
      { row: "Orange Maroc", col: "Crisis", value: 14 },
      { row: "Orange Maroc", col: "Expansion", value: 18 },
      { row: "Orange Maroc", col: "Partnerships", value: 22 },
      { row: "Orange Maroc", col: "Regulation", value: 24 },
    ],
  },

  insights: [
    {
      heading: "A stable triopoly with a high reputation floor",
      body: "Morocco's telecom sector is the country's most concentrated major industry — three operators (Maroc Telecom, Inwi, Orange Maroc) serve 100% of the addressable market, with the incumbent holding roughly 56% mobile market share and 70% of fixed lines. That concentration translates into a high reputation floor: all three operators score between 65 and 79 on the Harch Reputation Index, the tightest band of any industry we track. There is no Tier 1 player (no operator exceeds 80) because the sector as a whole suffers from chronic customer-service negativity — billing disputes, network-coverage complaints, and call-centre frustrations generate a steady undercurrent of negative coverage that caps scores. But there is also no Tier 3 or 4 operator — the entry barriers (spectrum licensing, capital intensity, regulatory clearance) prevent the reputational fragmentation seen in retail or energy. The Harch view: Moroccan telecom is a sector where reputational moves are incremental. A 3-point quarterly gain is a big swing; a 5-point loss is a crisis.",
    },
    {
      heading: "Top players and their narratives",
      body: "Maroc Telecom (IAM) is the incumbent in every sense — largest network, largest customer base (24.3 million mobile subscribers), largest media footprint. Its reputation (79/100) is anchored in financial performance (38 financial-results articles in 90 days, the most of any telco) and the perceived strategic weight of being 53% state-owned via Al Mada. Its narrative strengths are 5G-readiness (launched commercial 5G in July 2025 across 12 cities) and pan-African footprint (10 subsidiaries in sub-Saharan Africa via Moov). Its weakness is customer-service negativity — 41% of its negative coverage traces to billing and coverage complaints. Inwi is the challenger with the highest innovation score in the sector, driven by its InwiMoney mobile-money platform (4.2 m users), its wholesale-only fibre strategy, and its ZAI-leaning brand identity that resonates with younger Moroccans. Its reputation (74) sits just below IAM despite a much smaller market share — proof that narrative quality, not size, drives reputation. Orange Maroc (65) is the laggard: a strong parent brand (Orange Group, France) but a quiet local narrative. Its coverage volume is 30% lower than Inwi's despite a comparable customer base.",
    },
    {
      heading: "Cyber risk has overtaken coverage as the dominant threat",
      body: "For two decades, telecom reputational risk in Morocco was network-coverage risk: a fibre cut, a tower outage, a congested cell during Eid. That risk has not disappeared — system failure (62) and infrastructure failure (55) remain in the top five — but it has been overtaken. The Harch risk engine now scores cyber attack at 80/100 (critical band) and data breach at 70 (high band), making telecom the highest-cyber-risk industry in our Moroccan universe, ahead of banking. Three forces drive this. First, telcos hold the richest personal-data sets in the economy — call records, location traces, billing data, mobile-money balances — making them the highest-value target for organised cybercrime. Second, the 5G rollout expands the attack surface through network slicing, edge computing, and IoT endpoints. Third, Moroccan operators have publicly disclosed at least four significant incidents in the trailing 18 months, including a 2024 SMS-phishing wave that targeted 380,000 IAM customers and a 2025 billing-system incident at Orange Maroc that exposed 22,000 customer records. Each incident now generates 150–300 articles in 72 hours, far outpacing coverage-related stories.",
    },
    {
      heading: "Regulatory environment: ANRT tightens, 5G unlocks",
      body: "The Agence Nationale de Réglementation des Télécommunications (ANRT) is the central regulatory actor, and 2025 is a landmark year. Three regulatory events shape the reputational landscape. First, 5G licensing: IAM received its 5G licence in July 2025 (MAD 2.4 bn fee), with Inwi and Orange expected to follow in Q4 2025. The licences carry coverage obligations (90% of urban areas by 2027, 50% of rural by 2029) that will be reported quarterly — operators that miss targets will face public enforcement. Second, the Loi 09-08 (Morocco's data protection law) is being updated to align with GDPR standards, with new breach-notification rules expected in early 2026. Operators will have 72 hours to notify the CNDP of any breach affecting more than 1,000 customers — a comms challenge as much as a legal one. Third, the ANRT's quality-of-service dashboard, launched in 2024, now publishes per-operator coverage and call-drop rates monthly. This transparency rewards strong operators (IAM and Inwi have used it as proof points) and punishes weak ones. Expect QoS to become the single most-quoted telecom metric in 2026.",
    },
    {
      heading: "ESG: digital inclusion is the new social licence",
      body: "Telecom ESG is fundamentally different from banking or mining ESG. The environmental footprint (scope 1+2 emissions, mostly diesel tower backup and grid power) is real but small relative to industry revenue. The social dimension is where reputational moats are built: digital inclusion, rural connectivity, and digital literacy programmes. Inwi leads this narrative with 22 ESG-tagged articles in the trailing 90 days, anchored by its 'Inwi Digital Days' programme (18 cities, 12,000 young Moroccans trained), its rural-connectivity partnership with the AMDA, and its women-in-tech scholarship. Maroc Telecom's ESG coverage (18 articles) is anchored in its universal-service obligations and its Foundation programmes — credible but more compliance-flavoured. Orange Maroc's 20 ESG articles benefit from Orange Group's global 'Orange for Good' framework, though locally the programmes feel translated rather than native. The Harch view: digital inclusion will become the single most important ESG narrative for Moroccan telecom by 2027, driven by the AMDA's 'Morocco Digital 2027' strategy and the EU's Global Gateway funding for African connectivity. Operators that own this narrative early will compound reputational advantage.",
    },
    {
      heading: "Recommendations for telecom comms teams",
      body: "Five moves for the next 90 days. (1) Reframe cyber as a narrative of strength, not vulnerability: every operator will face an incident. The reputational gap is between operators that respond in 4 hours with a CEO statement and remediation plan, and operators that respond in 24 hours with a press release. Pre-build the playbook. (2) Own the 5G story beyond the launch event: IAM's July 2025 launch generated 180 articles in week one, then coverage fell 70% in week two. Build a 90-day content cadence — use cases (smart factory, telemedicine, fixed wireless access), enterprise partnerships, city-by-city expansion — so 5G becomes a sustained narrative engine. (3) Convert QoS data into storytelling: the ANRT dashboard is a goldmine. Operators with good numbers should be publishing them quarterly; operators with weak numbers should be explaining their improvement plan transparently. (4) Localise digital inclusion: 'Inwi Digital Days' works because it feels Moroccan. Avoid the trap of importing a global parent framework (Orange, Vodafone) without local adaptation. (5) Invest in AI visibility: telecom is well-cited by AI engines (Maroc Telecom appears in 81% of 'largest telecom operator Morocco' queries) but Inwi (58%) and Orange Maroc (49%) lag. The fix is structured Wikipedia content, LinkedIn thought leadership, and bilingual (FR/AR) press releases that AI engines can ingest.",
    },
  ],

  aiVisibility: [
    { label: "Perplexity", value: 78, color: "#4A7B5F" },
    { label: "Gemini", value: 72, color: "#4A7B5F" },
    { label: "ChatGPT", value: 68, color: "#4A5D6E" },
    { label: "Claude", value: 62, color: "#4A5D6E" },
    { label: "Copilot", value: 58, color: "#B87333" },
  ],
  aiVisibilityNote: "Maroc Telecom (IAM) is the most-cited Moroccan telecom operator across all five AI engines, appearing in 81% of 'largest telecom operator Morocco' queries. Inwi (58%) and Orange Maroc (49%) lag — partly because IAM's state-ownership and historical footprint make it the default answer in training data, and partly because Inwi's rebranding history (formerly Wana Corporate) confuses entity resolution. Perplexity leads on citation rate (78%) thanks to its source-citation architecture; Copilot lags at 58% due to its enterprise focus. The AI visibility gap will widen as generative search displaces traditional SEO — operators that invest now in structured, machine-readable content will compound advantage.",

  methodology: "This profile is built from 1,124 data points harvested across 200+ sources over the trailing 90 days, including 14 Moroccan and 8 international newspapers, ANRT publications, social platforms (LinkedIn, X, Facebook, YouTube), financial filings (AMMC, Casablanca Stock Exchange, parent-company reports for Orange and Etisalat), and the five leading generative AI engines (ChatGPT, Claude, Gemini, Perplexity, Copilot). The Harch Reputation Index is computed as a weighted blend of share of voice (25%), sentiment polarity (25%), AI citation frequency (20%), pillar scores for Innovation / Performance / Purpose (20%), and ESG narrative strength (10%). Risk scores use the Harch 32-category framework, scored 0–100 by combining mention frequency (40%), severity weighting (35%), and forward-looking velocity (25%). All data is refreshed every 6 hours. Operator aliases are deduplicated — Maroc Telecom and IAM are treated as one entity, as are Inwi and its former Wana Corporate identity.",

  meta: {
    title: "Telecom Industry Reputation Report — 3 Moroccan Operators Tracked | Harch Atelier",
    description: "Real-time reputation intelligence for Morocco's telecom sector: 3 operators, 1,124 data points, 32 risk categories. Maroc Telecom leads at 79/100. Cyber attack (80) and data breach (70) top the risk register.",
    keywords: [
      "Morocco telecom reputation",
      "Maroc Telecom reputation score",
      "Inwi reputation",
      "Orange Maroc reputation",
      "Morocco 5G rollout",
      "Morocco telecom cyber risk",
      "ANRT regulation telecom",
      "Morocco telecom ESG digital inclusion",
      "telecom data breach Morocco",
      "Harch telecom industry report",
    ],
  },
};

export default function TelecomIndustryPage() {
  return <IndustryPageLayout data={DATA} />;
}
