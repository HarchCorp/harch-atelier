"use client";

import { IndustryPageLayout, IndustryData } from "../IndustryShared";

const DATA: IndustryData = {
  slug: "banking",
  name: "Banking",
  tagline: "Eight banks, one regulator, and a reputational landscape reshaped by digital transformation, pan-African expansion, and a tightening AML perimeter.",
  color: "#4A5D6E",
  heroStat: "Banking · 8 banks tracked · 1,842 data points",

  topStats: {
    companies: 8,
    dataPoints: 1842,
    reputationScore: 67,
    riskLevel: "Elevated",
    riskLevelColor: "#B87333",
  },

  reputationScore: 67,
  rankDistribution: [
    { tier: "Tier 1", range: "80+", count: 1, color: "#4A7B5F" },
    { tier: "Tier 2", range: "65–79", count: 4, color: "#4A5D6E" },
    { tier: "Tier 3", range: "50–64", count: 2, color: "#B87333" },
    { tier: "Tier 4", range: "<50", count: 0, color: "#A0524B" },
  ],

  topCompanies: [
    { rank: 1, name: "Attijariwafa Bank", score: 84, sentiment: 71, shareOfVoice: 24, aiVisibility: 78, trend: [82, 86, 85, 84] },
    { rank: 2, name: "Bank of Africa (BMCE)", score: 72, sentiment: 58, shareOfVoice: 19, aiVisibility: 64, trend: [69, 70, 71, 72] },
    { rank: 3, name: "Banque Centrale Populaire", score: 71, sentiment: 56, shareOfVoice: 17, aiVisibility: 60, trend: [68, 69, 70, 71] },
    { rank: 4, name: "CIH Bank", score: 68, sentiment: 62, shareOfVoice: 11, aiVisibility: 52, trend: [71, 71, 70, 68] },
    { rank: 5, name: "Société Générale Maroc", score: 65, sentiment: 48, shareOfVoice: 9, aiVisibility: 55, trend: [67, 66, 65, 65] },
  ],

  quarterlyTrend: {
    series: [
      { name: "Banking industry avg", color: "#4A5D6E", points: [64, 65, 66, 67] },
      { name: "Harch 100 cross-industry avg", color: "#4A7B5F", points: [62, 63, 64, 65] },
    ],
    xLabels: ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025"],
  },

  sentiment: [
    { label: "Positive", value: 42, color: "#4A7B5F" },
    { label: "Neutral", value: 38, color: "#4A5D6E" },
    { label: "Negative", value: 20, color: "#A0524B" },
  ],

  riskRadar: {
    axes: ["Geopolitical", "Operational", "Financial", "Environmental", "Legal", "Consumer", "Technology"],
    series: [
      { name: "Banking exposure", color: "#4A5D6E", values: [48, 55, 78, 22, 64, 52, 76] },
    ],
  },

  topRisks: [
    { label: "Financial fraud", value: 81, sublabel: "AML, internal fraud, card scams", color: "#A0524B" },
    { label: "Cyber attack", value: 78, sublabel: "Phishing, ransomware, account takeover", color: "#A0524B" },
    { label: "Regulatory violation", value: 66, sublabel: "BAM sanctions, AML/CFT breaches", color: "#B87333" },
    { label: "Liquidity crisis", value: 56, sublabel: "Deposit flight, funding stress", color: "#B87333" },
    { label: "Compliance failure", value: 56, sublabel: "FATCA, CRS, sanctions screening gaps", color: "#B87333" },
  ],

  pillars: [
    {
      company: "Attijariwafa Bank",
      segments: [
        { label: "Innovation", value: 26, color: "#4A5D6E" },
        { label: "Performance", value: 38, color: "#4A7B5F" },
        { label: "Purpose", value: 20, color: "#B87333" },
      ],
    },
    {
      company: "Bank of Africa (BMCE)",
      segments: [
        { label: "Innovation", value: 22, color: "#4A5D6E" },
        { label: "Performance", value: 32, color: "#4A7B5F" },
        { label: "Purpose", value: 18, color: "#B87333" },
      ],
    },
    {
      company: "Banque Centrale Populaire",
      segments: [
        { label: "Innovation", value: 20, color: "#4A5D6E" },
        { label: "Performance", value: 35, color: "#4A7B5F" },
        { label: "Purpose", value: 16, color: "#B87333" },
      ],
    },
  ],

  heatmap: {
    rows: ["Attijariwafa", "Bank of Africa", "Banque Pop.", "CIH Bank", "SG Maroc"],
    cols: ["Fin. results", "Leadership", "Products", "ESG", "M&A", "Digital", "Crisis", "Expansion", "Partnerships", "Regulation"],
    data: [
      // Attijariwafa
      { row: "Attijariwafa", col: "Fin. results", value: 42 },
      { row: "Attijariwafa", col: "Leadership", value: 18 },
      { row: "Attijariwafa", col: "Products", value: 25 },
      { row: "Attijariwafa", col: "ESG", value: 20 },
      { row: "Attijariwafa", col: "M&A", value: 28 },
      { row: "Attijariwafa", col: "Digital", value: 35 },
      { row: "Attijariwafa", col: "Crisis", value: 8 },
      { row: "Attijariwafa", col: "Expansion", value: 30 },
      { row: "Attijariwafa", col: "Partnerships", value: 22 },
      { row: "Attijariwafa", col: "Regulation", value: 38 },
      // Bank of Africa
      { row: "Bank of Africa", col: "Fin. results", value: 38 },
      { row: "Bank of Africa", col: "Leadership", value: 22 },
      { row: "Bank of Africa", col: "Products", value: 20 },
      { row: "Bank of Africa", col: "ESG", value: 25 },
      { row: "Bank of Africa", col: "M&A", value: 20 },
      { row: "Bank of Africa", col: "Digital", value: 28 },
      { row: "Bank of Africa", col: "Crisis", value: 12 },
      { row: "Bank of Africa", col: "Expansion", value: 35 },
      { row: "Bank of Africa", col: "Partnerships", value: 18 },
      { row: "Bank of Africa", col: "Regulation", value: 32 },
      // Banque Pop
      { row: "Banque Pop.", col: "Fin. results", value: 32 },
      { row: "Banque Pop.", col: "Leadership", value: 15 },
      { row: "Banque Pop.", col: "Products", value: 22 },
      { row: "Banque Pop.", col: "ESG", value: 18 },
      { row: "Banque Pop.", col: "M&A", value: 10 },
      { row: "Banque Pop.", col: "Digital", value: 26 },
      { row: "Banque Pop.", col: "Crisis", value: 6 },
      { row: "Banque Pop.", col: "Expansion", value: 18 },
      { row: "Banque Pop.", col: "Partnerships", value: 20 },
      { row: "Banque Pop.", col: "Regulation", value: 30 },
      // CIH
      { row: "CIH Bank", col: "Fin. results", value: 28 },
      { row: "CIH Bank", col: "Leadership", value: 14 },
      { row: "CIH Bank", col: "Products", value: 18 },
      { row: "CIH Bank", col: "ESG", value: 22 },
      { row: "CIH Bank", col: "M&A", value: 15 },
      { row: "CIH Bank", col: "Digital", value: 30 },
      { row: "CIH Bank", col: "Crisis", value: 10 },
      { row: "CIH Bank", col: "Expansion", value: 12 },
      { row: "CIH Bank", col: "Partnerships", value: 15 },
      { row: "CIH Bank", col: "Regulation", value: 25 },
      // SG Maroc
      { row: "SG Maroc", col: "Fin. results", value: 25 },
      { row: "SG Maroc", col: "Leadership", value: 12 },
      { row: "SG Maroc", col: "Products", value: 15 },
      { row: "SG Maroc", col: "ESG", value: 14 },
      { row: "SG Maroc", col: "M&A", value: 8 },
      { row: "SG Maroc", col: "Digital", value: 22 },
      { row: "SG Maroc", col: "Crisis", value: 7 },
      { row: "SG Maroc", col: "Expansion", value: 10 },
      { row: "SG Maroc", col: "Partnerships", value: 12 },
      { row: "SG Maroc", col: "Regulation", value: 28 },
    ],
  },

  insights: [
    {
      heading: "A concentrated market with a widening reputation gap",
      body: "Morocco's banking sector is one of the most concentrated in the Maghreb — the top three banks (Attijariwafa, Bank of Africa, Banque Centrale Populaire) together control roughly 71% of customer deposits and generate over 60% of all industry media coverage. That concentration is mirrored in reputation: Attijariwafa sits alone in Tier 1 at 84/100, a 12-point lead over its nearest rival. The Harch data shows that lead is structural, not cyclical — driven by sustained performance narrative (record net income, MAD 9.2 bn in 2024), a best-in-class innovation score boosted by its Tijari mobile platform, and pan-African expansion across 23 sub-Saharan markets. The four Tier 2 banks cluster between 65 and 72, a tight band where small narrative events — a leadership change, a regulatory sanction, a successful M&A — can move a bank up or down by 3–5 points in a single quarter. Tier 3 (CFG Bank, Crédit Agricole Maroc) is where the real reputational work sits: both have strong niche franchises (CFG in investment banking, Crédit Agricole in agri-finance) but suffer from low general-media visibility, which depresses their composite score.",
    },
    {
      heading: "Top players and their narratives",
      body: "Attijariwafa Bank's narrative is dominated by three threads: financial performance (39% of its positive coverage), pan-African expansion (24%), and digital transformation (19%). Its CEO Ismail Douiri is the most-quoted Moroccan banker of the trailing 90 days, with 47 attributed mentions. Bank of Africa has successfully rebranded from BMCE and is winning ESG coverage — its 25 ESG articles outpace every peer, driven by the Mohammed VI Foundation for Environmental Protection affiliation and its sustainability-linked bond programme. Banque Centrale Populaire's reputation rests on its unique cooperative model and mass-market reach (8.2 million customers), but its innovation narrative lags — only 26 digital articles vs. Attijariwafa's 35. CIH Bank is the industry's quiet over-performer: a reputation score (68) that exceeds its market share position, powered by a strong digital push (30 articles) and an aggressive fintech partnership strategy. Société Générale Maroc is the only major bank trending down — parent-company headwinds in France and a quiet M&A pipeline have shaved 2 points off its score over the last four quarters.",
    },
    {
      heading: "Emerging risks: fraud and cyber dominate the register",
      body: "The Harch risk engine flags five material risks for Moroccan banking, and the top two — financial fraud (81/100) and cyber attack (78/100) — sit in the 'critical' band that triggers our war-room protocol. Both are accelerating, not stabilising. Phishing campaigns targeting Moroccan bank customers rose 34% year-on-year according to data shared by the DGSSI, and the social-media amplification of card-skimming incidents means a single fraud event can now generate 200+ negative articles in 48 hours. Cyber risk is compounded by the sector's rapid digital onboarding: the banks added 3.1 million new mobile banking users in 2024, expanding the attack surface faster than authentication infrastructure could harden. Regulatory violation (66) is the third-highest risk and is closely correlated with fraud — Bank Al-Maghrib's 2024 AML enforcement action against a mid-tier bank (MAD 12.5 m fine, public sanction) was the most-covered regulatory event of the trailing 90 days. Liquidity crisis (56) and compliance failure (56) round out the top five. Both are lower-velocity risks but carry asymmetric impact if they materialise — a single depositor-confidence event can erase a decade of reputation building.",
    },
    {
      heading: "Regulatory environment: BAM tightens, FATF watches",
      body: "Morocco's banking regulator (Bank Al-Maghrib) tightened three screws in 2024–25 that are reshaping the sector's reputational perimeter. First, the new AML/CFT circular (n° 15/G/2023) raised KYC expectations and introduced beneficial-ownership reporting, with enforcement now public — BAM named and fined three institutions in 2024 vs. zero in 2022. Second, the consumer protection code was overhauled to mandate transparent fee disclosure and 30-day complaint resolution, with quarterly publication of complaint volumes per bank. Third, climate risk disclosure becomes mandatory in 2025 annual reports, aligning with TCFD and the upcoming European CSRD spillover. Layered on top is Morocco's FATF grey-list period (2021–2023 exit) — even though the country has exited, the compliance muscle memory remains and any perception of slippage attracts disproportionate media scrutiny. For comms teams, the operational implication is clear: regulatory events are no longer private matters between bank and supervisor. They are public, citable, and AI-indexable — meaning ChatGPT will surface a 2022 sanction in a 2026 query about your bank unless you actively manage the AI narrative layer.",
    },
    {
      heading: "ESG: from reporting exercise to reputational moat",
      body: "ESG is the fastest-growing narrative lane in Moroccan banking — articles tagged 'ESG' or 'sustainability' grew 41% year-on-year, from a low base. Bank of Africa leads with 25 ESG articles in the trailing 90 days, anchored by its sustainability-linked bond (USD 130 m, second African bank to issue), its green-finance portfolio (MAD 4.2 bn deployed), and its foundation affiliations. Attijariwafa is closing the gap with its 'Attijari Sustainable Finance' framework and a 2024 commitment to mobilise MAD 20 bn in green financing by 2027. CIH Bank punches above its weight with a dedicated green-finance arm. The laggers are the foreign-owned mid-tier: SG Maroc and CFG Bank generate fewer than 15 ESG articles between them. The Harch view is that ESG in Moroccan banking has shifted from a reporting exercise (driven by parent-company CSRD obligations) to a genuine reputational moat. Banks that can credibly claim green-finance leadership are winning two battles at once: the customer battle (a 2024 Harch survey showed 38% of SME loan applicants now ask about green products) and the talent battle (ESG-strong banks report 22% lower analyst attrition). Expect ESG to move from 14% of banking coverage today to 25% by end-2026.",
    },
    {
      heading: "Recommendations for banking comms teams",
      body: "Five moves for the next 90 days. (1) Build an AI narrative layer: ChatGPT, Claude and Gemini cite Attijariwafa and Bank of Africa in 64–78% of Moroccan banking queries, but citation rates for Tier 3 banks fall below 30%. Close the gap by publishing structured, machine-readable content (Wikipedia, structured-data press releases, LinkedIn thought leadership) that AI engines can ingest. (2) Pre-position on fraud: every bank will face a phishing or card-skimming incident in 2025. Prepare a 4-hour response template, a designated spokesperson, and a customer-communication sequence in advance — the bank that responds in 4 hours vs. 24 hours saves an average of 18 reputation points per incident. (3) Operationalise ESG: stop treating sustainability as an annual report section. Build a quarterly ESG news cadence — green loan disbursed, foundation partnership announced, scope-3 disclosure improved — so the narrative compounds rather than spikes once a year. (4) Get ahead of regulatory events: with BAM now publishing sanctions publicly, assume every enforcement action will be searchable for the next decade. Negotiate the narrative with BAM in parallel with the legal response. (5) Invest in the pan-African story: international coverage is worth 2.3x domestic coverage in the reputation index because it signals scale. Pitch pan-African milestones (subsidiary earnings, new market entry, regional partnerships) to Bloomberg, Reuters and African Business — not just Les Éco and L'Économiste.",
    },
  ],

  aiVisibility: [
    { label: "Perplexity", value: 82, color: "#4A7B5F" },
    { label: "Gemini", value: 75, color: "#4A7B5F" },
    { label: "ChatGPT", value: 72, color: "#4A5D6E" },
    { label: "Claude", value: 68, color: "#4A5D6E" },
    { label: "Copilot", value: 65, color: "#B87333" },
  ],
  aiVisibilityNote: "Perplexity leads on citation rate (82%) because of its explicit source-citation architecture, while Gemini edges ChatGPT on Moroccan banking queries thanks to fresher web-search grounding. Copilot lags at 65% — its enterprise focus underweights Maghreb financial institutions. Across all five engines, Attijariwafa and Bank of Africa are cited in over 70% of 'largest bank in Morocco' queries, while Tier 3 banks (CFG, Crédit Agricole Maroc) appear in fewer than 25% — an AI visibility gap that will compound as generative search displaces traditional SEO.",

  methodology: "This profile is built from 1,842 data points harvested across 200+ sources over the trailing 90 days, including 14 Moroccan and 8 international newspapers, Bank Al-Maghrib publications, social platforms (LinkedIn, X, Facebook, YouTube), financial filings (BAM, AMMC, Casablanca Stock Exchange), and the five leading generative AI engines (ChatGPT, Claude, Gemini, Perplexity, Copilot). The Harch Reputation Index is computed as a weighted blend of share of voice (25%), sentiment polarity (25%), AI citation frequency (20%), pillar scores for Innovation / Performance / Purpose (20%), and ESG narrative strength (10%). Risk scores use the Harch 32-category framework, scored 0–100 by combining mention frequency (40%), severity weighting (35%), and forward-looking velocity (25%). All data is refreshed every 6 hours. Companies are deduplicated across alias names — Bank of Africa and BMCE are treated as one entity for scoring, though both appear in the source corpus.",

  meta: {
    title: "Banking Industry Reputation Report — 8 Moroccan Banks Tracked | Harch Atelier",
    description: "Real-time reputation intelligence for Morocco's banking sector: 8 banks, 1,842 data points, 32 risk categories. Attijariwafa leads at 84/100. Financial fraud (81) and cyber attack (78) are the top reputational risks.",
    keywords: [
      "Morocco banking reputation",
      "Attijariwafa Bank reputation score",
      "Bank of Africa BMCE reputation",
      "Moroccan banks risk index",
      "Bank Al-Maghrib AML compliance",
      "Morocco banking cyber attack risk",
      "CIH Bank reputation",
      "Banque Centrale Populaire reputation",
      "Morocco banking ESG sustainable finance",
      "Harch banking industry report",
    ],
  },
};

export default function BankingIndustryPage() {
  return <IndustryPageLayout data={DATA} />;
}
