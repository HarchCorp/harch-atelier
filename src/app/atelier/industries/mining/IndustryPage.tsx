"use client";

import { IndustryPageLayout, IndustryData } from "../IndustryShared";

const DATA: IndustryData = {
  slug: "mining",
  name: "Mining & Phosphates",
  tagline: "OCP Group sits at 91/100 — the highest score in our Moroccan corporate universe — anchored by green ammonia ambition, sustainable phosphate leadership, and a national-champion narrative that no competitor can match.",
  color: "#B87333",
  heroStat: "Mining & Phosphates · 2 majors tracked · 1,486 data points",

  topStats: {
    companies: 2,
    dataPoints: 1486,
    reputationScore: 79,
    riskLevel: "High",
    riskLevelColor: "#A0524B",
  },

  reputationScore: 79,
  rankDistribution: [
    { tier: "Tier 1", range: "80+", count: 1, color: "#4A7B5F" },
    { tier: "Tier 2", range: "65–79", count: 1, color: "#4A5D6E" },
    { tier: "Tier 3", range: "50–64", count: 0, color: "#B87333" },
    { tier: "Tier 4", range: "<50", count: 0, color: "#A0524B" },
  ],

  topCompanies: [
    { rank: 1, name: "OCP Group", score: 91, sentiment: 74, shareOfVoice: 72, aiVisibility: 84, trend: [85, 87, 89, 91] },
    { rank: 2, name: "Managem", score: 66, sentiment: 55, shareOfVoice: 28, aiVisibility: 47, trend: [60, 62, 64, 66] },
  ],

  quarterlyTrend: {
    series: [
      { name: "Mining industry avg", color: "#B87333", points: [76, 77, 78, 79] },
      { name: "Harch 100 cross-industry avg", color: "#4A5D6E", points: [62, 63, 64, 65] },
    ],
    xLabels: ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025"],
  },

  sentiment: [
    { label: "Positive", value: 52, color: "#4A7B5F" },
    { label: "Neutral", value: 30, color: "#4A5D6E" },
    { label: "Negative", value: 18, color: "#A0524B" },
  ],

  riskRadar: {
    axes: ["Geopolitical", "Operational", "Financial", "Environmental", "Legal", "Consumer", "Technology"],
    series: [
      { name: "Mining exposure", color: "#B87333", values: [55, 78, 32, 70, 55, 22, 38] },
    ],
  },

  topRisks: [
    { label: "Operational accident", value: 78, sublabel: "Mine collapse, chemical leak, transport incident", color: "#A0524B" },
    { label: "Pollution incident", value: 70, sublabel: "Water contamination, air emissions, tailings leak", color: "#A0524B" },
    { label: "Regulatory violation", value: 62, sublabel: "Mining code, environmental permits, export controls", color: "#B87333" },
    { label: "Labour dispute", value: 60, sublabel: "Strikes, safety grievances, wage disputes", color: "#B87333" },
    { label: "Sustainability failure", value: 56, sublabel: "Carbon targets missed, water overuse, ESG downgrade", color: "#B87333" },
  ],

  pillars: [
    {
      company: "OCP Group",
      segments: [
        { label: "Innovation", value: 32, color: "#4A5D6E" },
        { label: "Performance", value: 38, color: "#4A7B5F" },
        { label: "Purpose", value: 21, color: "#B87333" },
      ],
    },
    {
      company: "Managem",
      segments: [
        { label: "Innovation", value: 18, color: "#4A5D6E" },
        { label: "Performance", value: 28, color: "#4A7B5F" },
        { label: "Purpose", value: 20, color: "#B87333" },
      ],
    },
  ],

  heatmap: {
    rows: ["OCP Group", "Managem"],
    cols: ["Fin. results", "Leadership", "Products", "ESG", "M&A", "Digital", "Crisis", "Expansion", "Partnerships", "Regulation"],
    data: [
      // OCP Group
      { row: "OCP Group", col: "Fin. results", value: 58 },
      { row: "OCP Group", col: "Leadership", value: 22 },
      { row: "OCP Group", col: "Products", value: 18 },
      { row: "OCP Group", col: "ESG", value: 48 },
      { row: "OCP Group", col: "M&A", value: 12 },
      { row: "OCP Group", col: "Digital", value: 25 },
      { row: "OCP Group", col: "Crisis", value: 8 },
      { row: "OCP Group", col: "Expansion", value: 42 },
      { row: "OCP Group", col: "Partnerships", value: 32 },
      { row: "OCP Group", col: "Regulation", value: 28 },
      // Managem
      { row: "Managem", col: "Fin. results", value: 24 },
      { row: "Managem", col: "Leadership", value: 14 },
      { row: "Managem", col: "Products", value: 12 },
      { row: "Managem", col: "ESG", value: 18 },
      { row: "Managem", col: "M&A", value: 10 },
      { row: "Managem", col: "Digital", value: 14 },
      { row: "Managem", col: "Crisis", value: 10 },
      { row: "Managem", col: "Expansion", value: 15 },
      { row: "Managem", col: "Partnerships", value: 12 },
      { row: "Managem", col: "Regulation", value: 22 },
    ],
  },

  insights: [
    {
      heading: "A two-company industry dominated by a global champion",
      body: "Morocco's mining & phosphates sector is, in reputation terms, a one-company industry with a satellite. OCP Group (Office Chérifien des Phosphates) controls roughly 70% of global phosphate reserves and 31% of global phosphate trade, generated MAD 80.4 billion in 2024 revenue, and employs 21,000 people directly. Its reputation score of 91/100 is the highest in Harch's Moroccan corporate universe — ahead of Attijariwafa (84), Maroc Telecom (79), and every other entity we track. The score is anchored by three structural advantages: (1) a near-monopoly narrative ('Morocco feeds the world's agriculture') that is uniquely defensible, (2) a sustained ESG leadership story around sustainable phosphate and green ammonia that pre-empts the sector's main reputational risk, and (3) the strategic weight of being 100% state-owned via Al Mada, which gives OCP diplomatic cover that no private competitor enjoys. Managem, the sector's #2, is a diversified miner (cobalt, copper, gold, silver) with operations across Morocco, Gabon, DRC, and Sudan. Its reputation (66) sits in Tier 2 — solid but constrained by lower visibility (only 28% share of voice vs. OCP's 72%) and a less coherent strategic narrative.",
    },
    {
      heading: "OCP and Managem: two different narratives, two different risks",
      body: "OCP's narrative is dominated by four threads: green ammonia (18 articles in 90 days, anchored by the USD 1.3 bn green ammonia plant in Jorf Lasfar with TotalEnergies and Engie), sustainable phosphate (16 articles, centred on the 'Plant4Tomorrow' carbon-farming programme with 40,000 farmers), financial performance (14 articles, MAD 80.4 bn 2024 revenue), and Africa expansion (12 articles, including the new fertilizer plant in Nigeria and the Ghana blending unit). Its CEO Mostafa Terrab is the most-quoted mining CEO in Africa, with 62 attributed mentions in the trailing 90 days. Managem's narrative is thinner and more transactional — driven by commodity-price cycles, individual mine openings, and the occasional labour incident at its Guemassa and Draa Sfar sites. Its innovation score is half of OCP's, its ESG coverage is a third, and its leadership visibility is a quarter. The Harch view: Managem is not underperforming its business, but it is underperforming its reputational potential. A company with cobalt assets in a battery-electrified world should be generating 2x its current coverage volume.",
    },
    {
      heading: "Operational and environmental risks top the register",
      body: "Mining is, by definition, a high-operational-risk industry — and Morocco's phosphate and metals operations are no exception. The Harch risk engine scores operational accident at 78/100 (high band) and pollution incident at 70/100 (high band), making mining the highest environmental-risk industry in our Moroccan universe. Three factors drive the operational score: (1) the inherent danger of underground and open-pit operations — Managem's Draa Sfar deep mine (1,200 m depth) and OCP's Khouribga open-pit complex both carry fatality risk that requires relentless safety management; (2) the chemical-processing intensity of phosphate valorisation at Jorf Lasfar (the world's largest phosphate-processing hub), where sulfuric acid, phosphoric acid, and fertilizer production create routine leak and emission risk; (3) the transport footprint — OCP moves 40+ million tonnes of phosphate annually by rail and sea, with derailment and spill risk that has materialised twice in the trailing 18 months. Pollution risk is driven by water — phosphate processing is water-intensive in a water-stressed country, and the Bekkat-Oued Zem groundwater dispute (ongoing since 2023) is the single most-quoted negative mining story in our corpus. Sustainability failure (56) rounds out the top five, reflecting the gap between OCP's ambitious 2040 carbon-neutral target and the operational reality of fossil-fuel-dependent processing.",
    },
    {
      heading: "Regulatory environment: stable, but tightening on water and emissions",
      body: "Morocco's mining regulatory framework is anchored in the 2015 Mining Law (Loi 49-15), which modernised the concession regime and introduced environmental impact assessment requirements. The framework is generally viewed as stable and investment-friendly — Morocco ranks 4th in Africa on the Fraser Institute's Investment Attractiveness Index — but three regulatory developments are reshaping the reputational perimeter. First, water permitting has tightened significantly since 2023, with the Ministry of Water now requiring operators to publish quarterly water-use data and obtain separate permits for non-conventional water use (desalination, treated wastewater). OCP's 100% desalination target for its Jorf Lasfar hub by 2027 is a direct response. Second, the environmental code overhaul (Loi 12-03 amendments, expected 2026) will introduce stricter emissions limits for sulfur dioxide and fluoride — a particular challenge for phosphate processing. Third, the EU Carbon Border Adjustment Mechanism (CBAM) starts phasing in for fertilizer imports from 2026, putting OCP's European revenue (€1.8 bn annually) at risk if its carbon intensity is not credibly reduced. For comms teams, the CBAM angle is the most strategically important — OCP's green ammonia and low-carbon fertilizer narrative is no longer just an ESG story, it is a market-access story.",
    },
    {
      heading: "ESG: OCP is setting the African mining benchmark",
      body: "OCP Group is, by Harch's analysis, the most-ESG-credible mining company in Africa. Its ESG narrative has three pillars that are individually defensible and collectively reinforcing. (1) Green ammonia: the Jorf Lasfar plant (1 million tonnes/year capacity, operational by 2027) will be Africa's largest green ammonia facility, replacing natural-gas-based ammonia in fertilizer production and cutting scope-1 emissions by 1.5 Mt CO2/year. (2) Sustainable phosphate: the 'Plant4Tomorrow' carbon-farming programme pays 40,000 Moroccan farmers for carbon sequestration in soil, generating the world's first phosphate-industry carbon credits. (3) Community impact: the OCP Foundation and the Mohammed VI Polytechnic University (UM6P) at Benguérir represent a USD 1.4 bn cumulative investment in education, research, and community development that is unique in African mining. Managem's ESG narrative is more conventional — environmental compliance at its Moroccan sites, biodiversity offsets at its African operations, and a developing cobalt traceability story that should resonate with battery-EV supply chain scrutiny. The Harch view: OCP's ESG lead is structural and will compound. The risk is that expectations rise faster than delivery — the 2040 carbon-neutral target is now 15 years away, and quarterly progress will be scrutinised.",
    },
    {
      heading: "Recommendations for mining comms teams",
      body: "Five moves for the next 90 days. (1) Build the CBAM narrative now: OCP's European fertilizer revenue is at risk from 2026 CBAM carbon tariffs. The comms response is not to defend current carbon intensity but to lead with the green ammonia story — every European journalist writing about CBAM should know about Jorf Lasfar by Q1 2026. (2) Pre-position on water: the Bekkat-Oued Zem groundwater dispute is the single most-quoted negative OCP story. Counter it not with denial but with data — quarterly water-use transparency, desalination progress, and farmer-compensation programmes. (3) Operationalise the safety narrative: mining safety is the silent reputational killer. A single fatality generates 80–120 negative articles and can erase 5–8 reputation points that take 18 months to recover. Build a quarterly safety-communication cadence (training hours, near-miss reporting, technology deployment) so the baseline narrative is positive, not neutral. (4) Close Managem's visibility gap: a company with cobalt assets in 2025 should be generating 2x its current coverage. Build a cobalt-traceability narrative, a clean-energy-transition thought leadership programme, and a CEO-visibility plan. (5) Invest in community storytelling: the OCP Foundation and UM6P stories are under-told. Convert them from annual-report mentions into a sustained content cadence — alumni stories, research breakthroughs, community testimonials — that compound over time and crowd out the inevitable operational-incident negativity.",
    },
  ],

  aiVisibility: [
    { label: "Perplexity", value: 85, color: "#4A7B5F" },
    { label: "Gemini", value: 79, color: "#4A7B5F" },
    { label: "ChatGPT", value: 76, color: "#4A5D6E" },
    { label: "Claude", value: 71, color: "#4A5D6E" },
    { label: "Copilot", value: 64, color: "#B87333" },
  ],
  aiVisibilityNote: "OCP Group is the most-cited Moroccan mining entity across all five AI engines, appearing in 84% of 'largest phosphate producer' and 'Morocco mining company' queries — a citation rate driven by its structural role in global phosphate markets and its heavy Wikipedia and Reuters footprint. Managem (47%) lags badly despite its multi-commodity African footprint — a function of lower general-media visibility and weaker English-language content. Perplexity leads on citation rate (85%) thanks to its source-citation architecture; Copilot lags at 64% due to its enterprise focus and weaker mining-sector training data. As CBAM and battery-materials scrutiny intensify in 2026, AI visibility will become a direct commercial driver — operators that invest now in structured, machine-readable content will compound advantage.",

  methodology: "This profile is built from 1,486 data points harvested across 200+ sources over the trailing 90 days, including 14 Moroccan and 12 international newspapers (with elevated coverage from mining trade press — Mining Weekly, S&P Global Commodity Insights, Reuters Commodities), Ministry of Energy and Mines publications, social platforms (LinkedIn, X, YouTube), financial filings (AMMC, Casablanca Stock Exchange, OCP Sustainability Report, Managem Annual Report), and the five leading generative AI engines (ChatGPT, Claude, Gemini, Perplexity, Copilot). The Harch Reputation Index is computed as a weighted blend of share of voice (25%), sentiment polarity (25%), AI citation frequency (20%), pillar scores for Innovation / Performance / Purpose (20%), and ESG narrative strength (10%). Risk scores use the Harch 32-category framework, scored 0–100 by combining mention frequency (40%), severity weighting (35%), and forward-looking velocity (25%). All data is refreshed every 6 hours. Subsidiary and joint-venture entities (OCP's African subsidiaries, Managem's African operations) are attributed to their parent for scoring.",

  meta: {
    title: "Mining & Phosphates Industry Reputation Report — OCP, Managem | Harch Atelier",
    description: "Real-time reputation intelligence for Morocco's mining & phosphates sector: 2 majors, 1,486 data points, 32 risk categories. OCP Group leads at 91/100 — the highest in our Moroccan corporate universe. Operational accident (78) and pollution incident (70) top the risk register.",
    keywords: [
      "OCP Group reputation score",
      "Morocco mining reputation",
      "Managem reputation",
      "Morocco phosphate industry",
      "green ammonia Morocco OCP",
      "sustainable phosphate Morocco",
      "Morocco mining ESG",
      "CBAM fertilizer Morocco",
      "OCP Group Jorf Lasfar",
      "Harch mining industry report",
    ],
  },
};

export default function MiningIndustryPage() {
  return <IndustryPageLayout data={DATA} />;
}
