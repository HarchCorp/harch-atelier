"use client";

import { IndustryPageLayout, IndustryData } from "../IndustryShared";

const DATA: IndustryData = {
  slug: "energy",
  name: "Energy",
  tagline: "Four companies, one industry average of 55/100, and a structural split between renewable champion Nareva (72) and a long tail of foreign oil majors weighed down by fuel-price politics and geopolitical exposure.",
  color: "#B87333",
  heroStat: "Energy · 4 companies tracked · 1,348 data points",

  topStats: {
    companies: 4,
    dataPoints: 1348,
    reputationScore: 55,
    riskLevel: "High",
    riskLevelColor: "#A0524B",
  },

  reputationScore: 55,
  rankDistribution: [
    { tier: "Tier 1", range: "80+", count: 0, color: "#4A7B5F" },
    { tier: "Tier 2", range: "65–79", count: 1, color: "#4A5D6E" },
    { tier: "Tier 3", range: "50–64", count: 2, color: "#B87333" },
    { tier: "Tier 4", range: "<50", count: 1, color: "#A0524B" },
  ],

  topCompanies: [
    { rank: 1, name: "Nareva (SIE Group)", score: 72, sentiment: 64, shareOfVoice: 28, aiVisibility: 67, trend: [69, 70, 71, 72] },
    { rank: 2, name: "Afriquia (Akwa Group)", score: 57, sentiment: 51, shareOfVoice: 24, aiVisibility: 45, trend: [55, 56, 57, 57] },
    { rank: 3, name: "Shell Maroc", score: 50, sentiment: 44, shareOfVoice: 22, aiVisibility: 38, trend: [52, 51, 50, 50] },
    { rank: 4, name: "Total Maroc", score: 41, sentiment: 38, shareOfVoice: 26, aiVisibility: 42, trend: [43, 42, 41, 41] },
  ],

  quarterlyTrend: {
    series: [
      { name: "Energy industry avg", color: "#B87333", points: [54, 54, 55, 55] },
      { name: "Harch 100 cross-industry avg", color: "#4A5D6E", points: [62, 63, 64, 65] },
    ],
    xLabels: ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025"],
  },

  sentiment: [
    { label: "Positive", value: 32, color: "#4A7B5F" },
    { label: "Neutral", value: 38, color: "#4A5D6E" },
    { label: "Negative", value: 30, color: "#A0524B" },
  ],

  riskRadar: {
    axes: ["Geopolitical", "Operational", "Financial", "Environmental", "Legal", "Consumer", "Technology"],
    series: [
      { name: "Energy exposure", color: "#B87333", values: [62, 70, 50, 65, 60, 55, 35] },
    ],
  },

  topRisks: [
    { label: "Operational accident", value: 70, sublabel: "Refinery fire, pipeline leak, tanker spill", color: "#A0524B" },
    { label: "Pollution incident", value: 65, sublabel: "Soil contamination, air emissions, water table", color: "#A0524B" },
    { label: "Geopolitical tension", value: 62, sublabel: "Oil price shock, supply disruption, sanctions", color: "#B87333" },
    { label: "Regulatory violation", value: 60, sublabel: "Price cap breach, environmental permit, customs", color: "#B87333" },
    { label: "Climate event", value: 52, sublabel: "Drought, heatwave, extreme weather impact", color: "#4A5D6E" },
  ],

  pillars: [
    {
      company: "Nareva (SIE Group)",
      segments: [
        { label: "Innovation", value: 30, color: "#4A5D6E" },
        { label: "Performance", value: 26, color: "#4A7B5F" },
        { label: "Purpose", value: 16, color: "#B87333" },
      ],
    },
    {
      company: "Afriquia (Akwa Group)",
      segments: [
        { label: "Innovation", value: 14, color: "#4A5D6E" },
        { label: "Performance", value: 28, color: "#4A7B5F" },
        { label: "Purpose", value: 15, color: "#B87333" },
      ],
    },
    {
      company: "Shell Maroc",
      segments: [
        { label: "Innovation", value: 12, color: "#4A5D6E" },
        { label: "Performance", value: 24, color: "#4A7B5F" },
        { label: "Purpose", value: 14, color: "#B87333" },
      ],
    },
  ],

  heatmap: {
    rows: ["Nareva", "Afriquia", "Shell Maroc", "Total Maroc"],
    cols: ["Fin. results", "Leadership", "Products", "ESG", "M&A", "Digital", "Crisis", "Expansion", "Partnerships", "Regulation"],
    data: [
      // Nareva
      { row: "Nareva", col: "Fin. results", value: 32 },
      { row: "Nareva", col: "Leadership", value: 18 },
      { row: "Nareva", col: "Products", value: 22 },
      { row: "Nareva", col: "ESG", value: 38 },
      { row: "Nareva", col: "M&A", value: 12 },
      { row: "Nareva", col: "Digital", value: 24 },
      { row: "Nareva", col: "Crisis", value: 8 },
      { row: "Nareva", col: "Expansion", value: 28 },
      { row: "Nareva", col: "Partnerships", value: 22 },
      { row: "Nareva", col: "Regulation", value: 18 },
      // Afriquia
      { row: "Afriquia", col: "Fin. results", value: 28 },
      { row: "Afriquia", col: "Leadership", value: 14 },
      { row: "Afriquia", col: "Products", value: 18 },
      { row: "Afriquia", col: "ESG", value: 12 },
      { row: "Afriquia", col: "M&A", value: 8 },
      { row: "Afriquia", col: "Digital", value: 18 },
      { row: "Afriquia", col: "Crisis", value: 12 },
      { row: "Afriquia", col: "Expansion", value: 14 },
      { row: "Afriquia", col: "Partnerships", value: 16 },
      { row: "Afriquia", col: "Regulation", value: 20 },
      // Shell Maroc
      { row: "Shell Maroc", col: "Fin. results", value: 22 },
      { row: "Shell Maroc", col: "Leadership", value: 10 },
      { row: "Shell Maroc", col: "Products", value: 14 },
      { row: "Shell Maroc", col: "ESG", value: 14 },
      { row: "Shell Maroc", col: "M&A", value: 6 },
      { row: "Shell Maroc", col: "Digital", value: 12 },
      { row: "Shell Maroc", col: "Crisis", value: 10 },
      { row: "Shell Maroc", col: "Expansion", value: 8 },
      { row: "Shell Maroc", col: "Partnerships", value: 12 },
      { row: "Shell Maroc", col: "Regulation", value: 16 },
      // Total Maroc
      { row: "Total Maroc", col: "Fin. results", value: 24 },
      { row: "Total Maroc", col: "Leadership", value: 12 },
      { row: "Total Maroc", col: "Products", value: 16 },
      { row: "Total Maroc", col: "ESG", value: 10 },
      { row: "Total Maroc", col: "M&A", value: 4 },
      { row: "Total Maroc", col: "Digital", value: 14 },
      { row: "Total Maroc", col: "Crisis", value: 18 },
      { row: "Total Maroc", col: "Expansion", value: 6 },
      { row: "Total Maroc", col: "Partnerships", value: 10 },
      { row: "Total Maroc", col: "Regulation", value: 22 },
    ],
  },

  insights: [
    {
      heading: "A fragmented sector with a structural reputation problem",
      body: "Morocco's energy sector scores 55/100 on the Harch Reputation Index — the lowest of the six industries we track (behind retail at 58), and 10 points below the cross-industry Harch 100 average. The sector is structurally fragmented across four very different business models: Nareva (state-owned renewable-energy champion via SIE/Al Mada, 72/100), Afriquia (privately-held Moroccan fuel distributor via Akwa Group, 57/100), Shell Maroc (subsidiary of the Anglo-Dutch major, 50/100), and Total Maroc (subsidiary of the French major, 41/100 — the lowest score in our Moroccan corporate universe). The 31-point gap between Nareva and Total Maroc is the widest intraday industry gap we track. The structural problem is that three of the four companies are downstream fuel distributors in a market where (1) fuel prices are politically sensitive and partially regulated, (2) the energy transition narrative increasingly frames fossil fuels as legacy, and (3) foreign ownership attracts periodic geopolitical scrutiny. Nareva escapes all three drags by being Moroccan-owned and renewable-native, which is why it scores 21 points above the next-best energy peer. The Harch view: energy reputation in Morocco is fundamentally a transition story, and three of four companies are not yet telling it.",
    },
    {
      heading: "Nareva vs. the foreign oil majors: two different realities",
      body: "Nareva is the only Tier 2 energy company in Morocco — and the only one with a credible energy-transition narrative. Founded in 2005 as a renewable-energy subsidiary of SIE (State Investment Equity, later Al Mada), Nareva operates 1.8 GW of wind and solar capacity (including the 850 MW Taza wind complex and the 480 MW Noor Midelt I hybrid CSP-PV plant), has 3.2 GW under construction, and targets 5 GW by 2030. Its reputation (72) is anchored in three threads: ESG leadership (38 ESG articles, the most of any Moroccan energy company), expansion (28 articles, including the 1 GW Tiskrad wind farm in Western Sahara and the Mauritania interconnection), and partnerships (22 articles, including the Engie and EDF renewables JVs). Its CEO Saïd El Hiri is the most-quoted Moroccan energy executive, with 32 attributed mentions in 90 days. The three foreign oil majors (Total, Shell, Afriquia — Afriquia is Moroccan-owned but operationally a fuel distributor) share a fundamentally different reality: their narrative is dominated by fuel-price politics (a 2024 subsidy reform debate generated 80+ articles), station-closure disputes, and the slow unwinding of the Total-Outremer retail footprint. Total Maroc's score of 41 reflects a particularly acute reputational crisis — the lowest in our Moroccan universe — driven by negative coverage around the parent company's 2024 'force de frappe' marketing campaign that was perceived as tone-deaf in the Moroccan context.",
    },
    {
      heading: "Operational and environmental risks dominate, geopolitics amplifies",
      body: "The Harch risk engine scores operational accident at 70/100 (high band) and pollution incident at 65/100 (high band) — making energy the second-highest environmental-risk industry after mining. The operational score is driven by the inherent danger of fuel storage, transport, and distribution: Morocco has approximately 4,200 service stations, 18 fuel depots, and 1,800 km of product pipeline — each carrying fire, leak, and contamination risk. Geopolitical tension (62) is the third-ranked risk and is uniquely structural for this sector: oil-price volatility (Brent moved between USD 72 and USD 94 in 2024) translates directly into Moroccan fuel-price politics, which translates directly into negative coverage for the distributors who are the public-facing interface. The 2024 subsidy-reform debate (which would have raised petrol prices by 15%) was paused in October 2024 — but its 6-month visibility generated 180+ articles, with Total Maroc and Shell Maroc cited as the most-exposed brands. Climate event (52) rounds out the top five and reflects the growing reputational vulnerability of fossil-fuel distributors to extreme-weather attribution narratives.",
    },
    {
      heading: "Regulatory environment: price caps, transition law, and the hydrogen push",
      body: "Morocco's energy regulatory environment is in structural transition. Three regulatory tracks shape the reputational landscape. First, the fuel-price liberalisation process: Morocco partially liberalised petrol and diesel prices in 2015, but the government retains the ability to cap prices during volatility episodes (invoked three times since 2018). The 2024 subsidy-reform debate (paused, not cancelled) will return to the policy agenda in 2026 — and whichever way it resolves, fuel distributors will face significant media scrutiny. Second, the Loi 13-09 (Renewable Energy Law, amended 2016) is being revised to enable private-sector renewable PPA contracts above 1 MW (currently capped) and to streamline licensing for green-hydrogen projects. The revision (expected 2026) is a direct enabler for Nareva's pipeline and for the international green-hydrogen developers (TotalEnergies, AES, Engie, Ocior) that have signed MoUs with the Moroccan government for the Southern Provinces. Third, the National Hydrogen Commission (established 2023) has awarded 6 green-hydrogen pilot projects across Dakhla, Guelmim, and Tan-Tan — a regulatory track that will generate sustained coverage for the next 3 years. For comms teams, the trajectory is clear: energy transition is now the dominant reputational frame, and companies that sit on the wrong side of it will find their scores capped.",
    },
    {
      heading: "ESG: Nareva leads, fossil majors must pivot or be marginalised",
      body: "Energy ESG is the most polarised of any Moroccan industry — Nareva's 38 ESG articles in 90 days exceed the combined ESG output of Total Maroc, Shell Maroc, and Afriquia. Nareva's ESG story is structurally defensible: it is renewable-native, its growth trajectory is aligned with Morocco's 52% renewable-by-2030 target, and its projects (Tiskrad wind in Southern Provinces, Noor Midelt hybrid CSP-PV) are showcase assets for African energy transition. Its ESG weakness is biodiversity (wind-farm bird-impact debates have generated 8 negative articles in 90 days) and community consultation (Tiskrad siting disputes generated 6 negative articles). The three fossil-fuel distributors face a more fundamental ESG challenge: their core business is structurally misaligned with the transition narrative, and their ESG coverage reflects this — Total Maroc (10 ESG articles, mostly about EV-charging rollouts), Shell Maroc (14 articles, similar EV-charging and biofuel-blending angles), Afriquia (12 articles, including its nascent CNG vehicle-fuel pilot). The Harch view: Nareva's ESG lead is structural and will compound. The fossil majors have a 12–18 month window to articulate a credible transition narrative (EV charging, biofuels, hydrogen distribution,Scope-3 reduction) before the reputational gap becomes irreversible. Companies that wait will find themselves benchmarked against tobacco — a category in decline with structurally capped reputation.",
    },
    {
      heading: "Recommendations for energy comms teams",
      body: "Five moves for the next 90 days. (1) Build a transition narrative now: the three fossil-fuel distributors must articulate a credible 2030 transition story — EV charging infrastructure, biofuel blending, green-hydrogen distribution, scope-3 reduction. Without it, scores will continue to drift down. The story must be specific (numbers, timelines, capex), not aspirational. (2) Pre-position on fuel-price politics: assume the 2024 subsidy-reform debate returns in 2026. Build a 'fair-price' narrative anchored in operational efficiency, transparent margin disclosure, and consumer-education content — so when the policy debate reignites, the company is positioned as part of the solution, not the problem. (3) Operationalise ESG beyond compliance: Total Maroc's EV-charging rollout is real, but generates only 10 ESG articles. Build a 90-day content cadence — first EV fast-charge station, regional rollout milestones, fleet-customer case studies — that converts infrastructure into narrative. (4) Invest in geopolitical comms: the foreign-owned majors (Total, Shell) carry structural geopolitical exposure. Build a Moroccan-identity content programme (local employee stories, supplier-network features, community-impact data) that reinforces the 'we are part of Morocco's economy' frame. (5) Nareva should capitalise: the renewable champion has a 21-point lead over its next-best peer and should be investing aggressively in international visibility — African Business, Reuters Energy Transition, Bloomberg NEF — to convert domestic leadership into continental thought leadership before international competitors (Engie, EDF, Iberdrola) crowd the frame.",
    },
  ],

  aiVisibility: [
    { label: "Perplexity", value: 65, color: "#4A7B5F" },
    { label: "Gemini", value: 60, color: "#4A5D6E" },
    { label: "ChatGPT", value: 58, color: "#4A5D6E" },
    { label: "Claude", value: 52, color: "#B87333" },
    { label: "Copilot", value: 48, color: "#A0524B" },
  ],
  aiVisibilityNote: "Nareva is the most AI-visible Moroccan energy company, appearing in 67% of 'Morocco renewable energy company' queries — driven by its project pipeline visibility, Al Mada ownership disclosures, and structured Wikipedia content. The three fossil-fuel distributors lag badly: Afriquia (45%), Total Maroc (42%), and Shell Maroc (38%) — partly because the parent-company brand dominates AI training data (queries about 'Total in Morocco' often return TotalEnergies SE results, not Total Maroc), and partly because of weaker local Wikipedia depth. Perplexity leads on citation rate (65%); Copilot lags at 48% due to its enterprise focus. The AI visibility gap is a leading indicator of the broader reputational gap — as generative search displaces traditional SEO, companies with weaker AI visibility will lose share of voice even in queries where they are the correct answer. The fix is structured, machine-readable content (Wikipedia, LinkedIn, bilingual press releases) — achievable within 6 months for any company willing to invest.",

  methodology: "This profile is built from 1,348 data points harvested across 200+ sources over the trailing 90 days, including 14 Moroccan and 12 international newspapers (with elevated coverage from energy trade press — S&P Global Platts, Reuters Energy Transition, Argus Media, Middle East Economic Survey), Ministry of Energy and ONEE publications, social platforms (LinkedIn, X, YouTube), financial filings (AMMC, Al Mada annual report, SIE disclosures, parent-company reports for TotalEnergies and Shell), and the five leading generative AI engines (ChatGPT, Claude, Gemini, Perplexity, Copilot). The Harch Reputation Index is computed as a weighted blend of share of voice (25%), sentiment polarity (25%), AI citation frequency (20%), pillar scores for Innovation / Performance / Purpose (20%), and ESG narrative strength (10%). Risk scores use the Harch 32-category framework, scored 0–100 by combining mention frequency (40%), severity weighting (35%), and forward-looking velocity (25%). All data is refreshed every 6 hours. Subsidiary entities (Nareva's JVs with Engie and EDF, Afriquia's Africa Fuel subsidiaries) are attributed to their parent for scoring.",

  meta: {
    title: "Energy Industry Reputation Report — Nareva, Total, Afriquia, Shell | Harch Atelier",
    description: "Real-time reputation intelligence for Morocco's energy sector: 4 companies, 1,348 data points, 32 risk categories. Industry avg 55/100. Nareva leads at 72 (renewable champion); Total Maroc trails at 41 — the lowest score in our Moroccan universe. Operational accident (70) and pollution incident (65) top the risk register.",
    keywords: [
      "Nareva reputation Morocco",
      "Morocco energy industry reputation",
      "Total Maroc reputation",
      "Shell Maroc reputation",
      "Afriquia Akwa Group reputation",
      "Morocco renewable energy transition",
      "Morocco green hydrogen",
      "Morocco fuel price regulation",
      "Morocco energy ESG",
      "Harch energy industry report",
    ],
  },
};

export default function EnergyIndustryPage() {
  return <IndustryPageLayout data={DATA} />;
}
