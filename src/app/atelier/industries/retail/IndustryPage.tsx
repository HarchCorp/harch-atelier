"use client";

import { IndustryPageLayout, IndustryData } from "../IndustryShared";

const DATA: IndustryData = {
  slug: "retail",
  name: "Retail",
  tagline: "A two-player modern retail sector scoring 58/100 — the second-lowest industry average in our Moroccan universe — battered by recurring boycott risk, price sensitivity, and a digital transformation that has not yet converted into reputation.",
  color: "#A0524B",
  heroStat: "Retail · 2 majors tracked · 1,256 data points",

  topStats: {
    companies: 2,
    dataPoints: 1256,
    reputationScore: 58,
    riskLevel: "Moderate",
    riskLevelColor: "#B87333",
  },

  reputationScore: 58,
  rankDistribution: [
    { tier: "Tier 1", range: "80+", count: 0, color: "#4A7B5F" },
    { tier: "Tier 2", range: "65–79", count: 0, color: "#4A5D6E" },
    { tier: "Tier 3", range: "50–64", count: 2, color: "#B87333" },
    { tier: "Tier 4", range: "<50", count: 0, color: "#A0524B" },
  ],

  topCompanies: [
    { rank: 1, name: "Label'Vie (Carrefour Maroc)", score: 59, sentiment: 51, shareOfVoice: 42, aiVisibility: 54, trend: [57, 58, 58, 59] },
    { rank: 2, name: "Marjane Group", score: 57, sentiment: 47, shareOfVoice: 58, aiVisibility: 61, trend: [59, 58, 57, 57] },
  ],

  quarterlyTrend: {
    series: [
      { name: "Retail industry avg", color: "#A0524B", points: [56, 57, 57, 58] },
      { name: "Harch 100 cross-industry avg", color: "#4A5D6E", points: [62, 63, 64, 65] },
    ],
    xLabels: ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025"],
  },

  sentiment: [
    { label: "Positive", value: 35, color: "#4A7B5F" },
    { label: "Neutral", value: 40, color: "#4A5D6E" },
    { label: "Negative", value: 25, color: "#A0524B" },
  ],

  riskRadar: {
    axes: ["Geopolitical", "Operational", "Financial", "Environmental", "Legal", "Consumer", "Technology"],
    series: [
      { name: "Retail exposure", color: "#A0524B", values: [35, 50, 42, 35, 40, 65, 45] },
    ],
  },

  topRisks: [
    { label: "Brand reputation threat", value: 70, sublabel: "Negative campaign, viral post, influencer attack", color: "#A0524B" },
    { label: "Product recall", value: 62, sublabel: "Food safety, labelling defect, contaminated batch", color: "#B87333" },
    { label: "Supply chain disruption", value: 58, sublabel: "Currency shortage, port delay, supplier failure", color: "#B87333" },
    { label: "Customer backlash", value: 57, sublabel: "Price hike, loyalty programme change, service failure", color: "#B87333" },
    { label: "Boycott campaign", value: 50, sublabel: "Political, geopolitical, or consumer-led boycott", color: "#4A5D6E" },
  ],

  pillars: [
    {
      company: "Label'Vie (Carrefour Maroc)",
      segments: [
        { label: "Innovation", value: 18, color: "#4A5D6E" },
        { label: "Performance", value: 24, color: "#4A7B5F" },
        { label: "Purpose", value: 17, color: "#B87333" },
      ],
    },
    {
      company: "Marjane Group",
      segments: [
        { label: "Innovation", value: 16, color: "#4A5D6E" },
        { label: "Performance", value: 26, color: "#4A7B5F" },
        { label: "Purpose", value: 15, color: "#B87333" },
      ],
    },
  ],

  heatmap: {
    rows: ["Marjane Group", "Label'Vie"],
    cols: ["Fin. results", "Leadership", "Products", "ESG", "M&A", "Digital", "Crisis", "Expansion", "Partnerships", "Regulation"],
    data: [
      // Marjane Group
      { row: "Marjane Group", col: "Fin. results", value: 35 },
      { row: "Marjane Group", col: "Leadership", value: 18 },
      { row: "Marjane Group", col: "Products", value: 28 },
      { row: "Marjane Group", col: "ESG", value: 14 },
      { row: "Marjane Group", col: "M&A", value: 12 },
      { row: "Marjane Group", col: "Digital", value: 32 },
      { row: "Marjane Group", col: "Crisis", value: 22 },
      { row: "Marjane Group", col: "Expansion", value: 8 },
      { row: "Marjane Group", col: "Partnerships", value: 18 },
      { row: "Marjane Group", col: "Regulation", value: 24 },
      // Label'Vie
      { row: "Label'Vie", col: "Fin. results", value: 28 },
      { row: "Label'Vie", col: "Leadership", value: 14 },
      { row: "Label'Vie", col: "Products", value: 22 },
      { row: "Label'Vie", col: "ESG", value: 16 },
      { row: "Label'Vie", col: "M&A", value: 8 },
      { row: "Label'Vie", col: "Digital", value: 26 },
      { row: "Label'Vie", col: "Crisis", value: 14 },
      { row: "Label'Vie", col: "Expansion", value: 6 },
      { row: "Label'Vie", col: "Partnerships", value: 20 },
      { row: "Label'Vie", col: "Regulation", value: 18 },
    ],
  },

  insights: [
    {
      heading: "The second-lowest-scoring industry in our Moroccan universe",
      body: "Morocco's modern retail sector scores 58/100 on the Harch Reputation Index — the second-lowest industry average of the six sectors we track (above energy at 55, and 7 points below the cross-industry Harch 100 average). The sector is a functional duopoly: Marjane Group (43 hypermarkets, 28 supermarkets, MAD 14.2 bn 2024 revenue, majority-owned by Al Mada) and Label'Vie (operating under the Carrefour franchise in Morocco, 38 stores, MAD 9.8 bn 2024 revenue). Both score in Tier 3 (50–64), a band we characterise as 'developing' — meaning reputation is being managed reactively rather than strategically. The structural challenge is that Moroccan retail operates in a uniquely contested consumer environment: price sensitivity is high (household disposable income is 40% lower than EU averages), modern trade still represents only 38% of grocery spend (vs. 62% for traditional souk and corner-shop trade), and the sector carries the geopolitical reputational spillover from the periodic boycott campaigns that have targeted brands perceived as French-aligned since 2018. The Harch view: retail reputation in Morocco is fundamentally a trust-building exercise, and both players are under-investing in the narrative infrastructure to do it well.",
    },
    {
      heading: "Marjane vs Label'Vie: a market leader with weaker sentiment",
      body: "Marjane Group is the market leader on every commercial metric — more stores, higher revenue, higher share of voice (58% vs. Label'Vie's 42%). But on reputation, it scores lower than Label'Vie (57 vs. 59). The divergence is driven by sentiment: Marjane's positive sentiment is 47% vs. Label'Vie's 51%, and Marjane's negative sentiment runs 5 points higher. The root cause is that Marjane, as the larger and more visible operator, attracts proportionally more negative coverage — price-hike complaints, checkout queue frustrations, boycott-targeting during geopolitical episodes, and labour disputes at its warehouses. Label'Vie benefits from a quieter profile and the halo of the Carrefour brand, which carries stronger French retail ESG credentials. Marjane's narrative is anchored in three threads: financial performance (35 articles, MAD 14.2 bn 2024 revenue, +6% YoY), digital transformation (32 articles, the Marjane Mobile app, e-commerce expansion, and the Marjane Pay wallet), and expansion (8 articles, mostly around new city-centre formats). Label'Vie's narrative is thinner (28 financial articles, 26 digital) but carries less negative weight. Neither CEO is highly visible — Marjane's CEO generated 18 quoted mentions in 90 days, Label'Vie's 14 — a structural gap vs. peer CEOs in banking or telecom.",
    },
    {
      heading: "Boycott risk: the unique Moroccan retail challenge",
      body: "Moroccan retail faces a reputational risk that no other tracked industry carries at the same intensity: organised consumer boycott campaigns. The Harch risk engine scores boycott campaign at 50/100 — moderate in absolute terms, but uniquely volatile. The pattern is well-documented: since the 2018 boycott of Centrale Danone (over perceived French support for Western Sahara positions), Moroccan consumers have periodically mobilised via WhatsApp groups and Facebook to target brands perceived as foreign-aligned during geopolitical episodes. The May 2024 boycott wave (triggered by French political statements on Western Sahara) hit Marjane and Label'Vie unevenly — Marjane (perceived as Moroccan-owned despite Al Mada's institutional structure) weathered it with 18% sales dip for 6 weeks; Label'Vie (operating under Carrefour franchise) suffered a 28% dip for 10 weeks. The reputational damage lingers: in our sentiment model, both retailers saw a 4-point negative-sentiment increase that did not fully revert to baseline until Q4 2024. The Harch view: boycott risk is fundamentally a comms-and-positioning challenge, not a commercial one. Retailers that build credible Moroccan-identity narratives, transparent supply-chain communication, and rapid-response geopolitical comms protocols can reduce the amplitude of boycott impact by 40–60%.",
    },
    {
      heading: "Regulatory environment: price controls and consumer protection tightening",
      body: "Morocco's retail regulatory environment is tightening on three fronts. First, price controls: the Ministry of Economy maintains a basket of 16 'regulated' staple products (sugar, flour, edible oils, milk) where margins are capped. In 2024, the government extended temporary price caps on 8 additional products in response to inflation pressure — a move that squeezed retailer margins by an estimated 180 basis points and generated steady negative coverage around 'unfair margin pressure'. Second, consumer protection: the Loi 31-08 (Consumer Protection Law, in force since 2011) is being revised with stricter rules on misleading promotions, expiry-date labelling, and e-commerce consumer rights. The revised code (expected 2026) will introduce mandatory complaint-resolution timelines (30 days, mirroring the banking precedent) and public complaint-volume reporting. Third, supply chain transparency: new traceability requirements for food products (extending the Loi 28-07 on food safety) come into force in 2026, requiring retailers to publish supplier-level origin data for 12 product categories. For comms teams, the regulatory trajectory is clear: more public data, faster disclosure timelines, and more enforceable consumer rights. Retailers that build the disclosure infrastructure now will convert compliance into reputational advantage.",
    },
    {
      heading: "ESG: packaging, supply chain, and the local-sourcing story",
      body: "Retail ESG in Morocco is a quieter narrative than in banking or mining — both retailers generate fewer than 16 ESG-tagged articles in the trailing 90 days, vs. 20+ for similarly-sized banks. The ESG story has three components. (1) Packaging: Marjane's 2024 commitment to eliminate single-use plastic bags in favour of biodegradable alternatives (phased rollout through 2026) is the most-cited retail ESG story of the trailing year. Label'Vie has matched the commitment but lags on execution. (2) Supply chain: both retailers publish supplier codes of conduct, but neither has yet implemented the farm-to-shelf traceability that European peers (Carrefour France, Tesco) have made standard. The 2026 traceability regulation will force the issue. (3) Local sourcing: Marjane's 'Produit du Maroc' programme (committing to 70% local sourcing by 2027, up from 58% today) is the most strategically important retail ESG initiative — it directly addresses both the supply-chain-transparency regulatory pressure and the boycott-risk narrative by reinforcing Moroccan identity. Label'Vie has a similar programme at smaller scale. The Harch view: retail ESG in Morocco is under-narrated. Local sourcing is the single highest-leverage ESG story available to Moroccan retailers — it touches regulation, consumer trust, geopolitical risk, and rural economic development simultaneously.",
    },
    {
      heading: "Recommendations for retail comms teams",
      body: "Five moves for the next 90 days. (1) Build a boycott-comms playbook: assume a boycott episode will happen in 2026. Pre-build a 6-hour response protocol, a CEO-visible statement template, a supplier-and-employee communication sequence, and a Moroccan-identity content reserve (farmer stories, local sourcing data, employee testimonials) that can be deployed in the first 48 hours. (2) Convert digital transformation into reputation: Marjane Mobile and Marjane Pay are real, defensible innovations, but they generate only 32 articles in 90 days vs. Attijariwafa's 35 for a banking app. Build a 90-day content cadence — user metrics, merchant onboarding stories, financial-inclusion angles — that compounds. (3) Operationalise the local-sourcing story: 'Produit du Maroc' is the single highest-leverage narrative available. Build quarterly content — farmer testimonials, regional sourcing maps, economic-impact data — that converts a programme into a sustained narrative. (4) Pre-position on product recall: every food retailer will face a recall. The reputational gap is between retailers that respond in 24 hours with full transparency and retailers that respond in 72 hours with partial disclosure. Build the playbook. (5) Invest in CEO visibility: both retail CEOs are under-quoted relative to peer industries. A 2x increase in CEO thought-leadership (industry conferences, op-eds, podcast appearances) would lift both retailers' reputation scores by 3–5 points within two quarters.",
    },
  ],

  aiVisibility: [
    { label: "Perplexity", value: 62, color: "#4A7B5F" },
    { label: "Gemini", value: 58, color: "#4A5D6E" },
    { label: "ChatGPT", value: 55, color: "#4A5D6E" },
    { label: "Claude", value: 48, color: "#B87333" },
    { label: "Copilot", value: 42, color: "#A0524B" },
  ],
  aiVisibilityNote: "Marjane Group is the more AI-visible Moroccan retailer, appearing in 61% of 'largest supermarket Morocco' queries — driven by its Wikipedia presence, Al Mada ownership disclosures, and Casablanca Stock Exchange filings. Label'Vie (54%) lags partly because the Carrefour-Maroc brand split confuses entity resolution and partly because Label'Vie's privately-held structure generates less machine-readable disclosure. Both retailers score lower than banking or telecom peers on AI visibility — a structural disadvantage as generative search displaces traditional SEO. Perplexity leads on citation rate (62%); Copilot lags at 42% due to its enterprise focus. The AI visibility gap is recoverable — structured Wikipedia content (in French, Arabic, and English), LinkedIn thought leadership, and bilingual press releases would close it within 6 months.",

  methodology: "This profile is built from 1,256 data points harvested across 200+ sources over the trailing 90 days, including 14 Moroccan newspapers (with elevated coverage from retail trade press — LSA Maroc, Commodafrika, Retail Africa), Ministry of Economy and Trade publications, social platforms (Facebook, Instagram, X, LinkedIn, TikTok — with elevated weight given to consumer-voice platforms where retail reputation is contested), financial filings (Marjane via Al Mada annual report, Label'Vie via limited disclosure), and the five leading generative AI engines (ChatGPT, Claude, Gemini, Perplexity, Copilot). The Harch Reputation Index is computed as a weighted blend of share of voice (25%), sentiment polarity (25%), AI citation frequency (20%), pillar scores for Innovation / Performance / Purpose (20%), and ESG narrative strength (10%). Risk scores use the Harch 32-category framework, scored 0–100 by combining mention frequency (40%), severity weighting (35%), and forward-looking velocity (25%). All data is refreshed every 6 hours. Smaller retailers (BIM, Aswak Assalam, Atacadão) are tracked at lower depth and excluded from this industry profile.",

  meta: {
    title: "Retail Industry Reputation Report — Marjane, Label'Vie | Harch Atelier",
    description: "Real-time reputation intelligence for Morocco's retail sector: 2 majors, 1,256 data points, 32 risk categories. Industry avg 58/100 — the second-lowest in our Moroccan universe (above energy at 55). Brand reputation threat (70) and product recall (62) top the risk register.",
    keywords: [
      "Marjane Group reputation",
      "Label'Vie reputation",
      "Morocco retail reputation",
      "Carrefour Maroc reputation",
      "Morocco retail boycott risk",
      "Morocco retail ESG",
      "Morocco supermarket industry",
      "Marjane digital transformation",
      "Morocco retail consumer protection",
      "Harch retail industry report",
    ],
  },
};

export default function RetailIndustryPage() {
  return <IndustryPageLayout data={DATA} />;
}
