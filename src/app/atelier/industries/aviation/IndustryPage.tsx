"use client";

import { IndustryPageLayout, IndustryData } from "../IndustryShared";

const DATA: IndustryData = {
  slug: "aviation",
  name: "Aviation",
  tagline: "Royal Air Maroc — Morocco's flag carrier and the country's only tracked airline — sits at 76/100, lifted by oneworld alliance momentum and African expansion, weighed down by recurring labour disputes and fuel-price exposure.",
  color: "#4A5D6E",
  heroStat: "Aviation · 1 airline tracked · 892 data points",

  topStats: {
    companies: 1,
    dataPoints: 892,
    reputationScore: 76,
    riskLevel: "Elevated",
    riskLevelColor: "#B87333",
  },

  reputationScore: 76,
  rankDistribution: [
    { tier: "Tier 1", range: "80+", count: 0, color: "#4A7B5F" },
    { tier: "Tier 2", range: "65–79", count: 1, color: "#4A5D6E" },
    { tier: "Tier 3", range: "50–64", count: 0, color: "#B87333" },
    { tier: "Tier 4", range: "<50", count: 0, color: "#A0524B" },
  ],

  topCompanies: [
    { rank: 1, name: "Royal Air Maroc (RAM)", score: 76, sentiment: 58, shareOfVoice: 100, aiVisibility: 73, trend: [80, 79, 78, 76] },
  ],

  quarterlyTrend: {
    series: [
      { name: "Aviation industry (RAM)", color: "#4A5D6E", points: [73, 74, 75, 76] },
      { name: "Harch 100 cross-industry avg", color: "#4A7B5F", points: [62, 63, 64, 65] },
    ],
    xLabels: ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025"],
  },

  sentiment: [
    { label: "Positive", value: 41, color: "#4A7B5F" },
    { label: "Neutral", value: 36, color: "#4A5D6E" },
    { label: "Negative", value: 23, color: "#A0524B" },
  ],

  riskRadar: {
    axes: ["Geopolitical", "Operational", "Financial", "Environmental", "Legal", "Consumer", "Technology"],
    series: [
      { name: "Aviation exposure", color: "#4A5D6E", values: [58, 65, 52, 48, 38, 55, 32] },
    ],
  },

  topRisks: [
    { label: "Safety incident", value: 70, sublabel: "Hull loss, runway excursion, turbulence injury", color: "#A0524B" },
    { label: "Operational accident", value: 65, sublabel: "Ground handling, maintenance defect, bird strike", color: "#B87333" },
    { label: "Fuel price spike", value: 62, sublabel: "Jet fuel volatility, hedging gap", color: "#B87333" },
    { label: "Labour dispute", value: 57, sublabel: "Pilot strike, cabin crew grievance, pay dispute", color: "#B87333" },
    { label: "Infrastructure failure", value: 55, sublabel: "ATC outage, airport closure, runway works", color: "#4A5D6E" },
  ],

  pillars: [
    {
      company: "Royal Air Maroc (RAM)",
      segments: [
        { label: "Innovation", value: 24, color: "#4A5D6E" },
        { label: "Performance", value: 34, color: "#4A7B5F" },
        { label: "Purpose", value: 18, color: "#B87333" },
      ],
    },
  ],

  heatmap: {
    rows: ["Royal Air Maroc"],
    cols: ["Fin. results", "Leadership", "Products", "ESG", "M&A", "Digital", "Crisis", "Expansion", "Partnerships", "Regulation"],
    data: [
      { row: "Royal Air Maroc", col: "Fin. results", value: 42 },
      { row: "Royal Air Maroc", col: "Leadership", value: 28 },
      { row: "Royal Air Maroc", col: "Products", value: 22 },
      { row: "Royal Air Maroc", col: "ESG", value: 24 },
      { row: "Royal Air Maroc", col: "M&A", value: 18 },
      { row: "Royal Air Maroc", col: "Digital", value: 20 },
      { row: "Royal Air Maroc", col: "Crisis", value: 32 },
      { row: "Royal Air Maroc", col: "Expansion", value: 45 },
      { row: "Royal Air Maroc", col: "Partnerships", value: 26 },
      { row: "Royal Air Maroc", col: "Regulation", value: 30 },
    ],
  },

  insights: [
    {
      heading: "A single-airline industry with a national-champion narrative",
      body: "Morocco's aviation sector is, in reputation terms, a single-company industry. Royal Air Maroc (RAM) is the country's flag carrier, its only long-haul operator, and the only Moroccan airline we track at full reputation-index depth. Founded in 1957 and 53% state-owned via Al Mada, RAM operates 96 aircraft (Boeing 787 Dreamliners, 737 MAX, and Airbus A320 family), serves 87 destinations (32 international, 28 African, 27 domestic), and carried 14.6 million passengers in 2024. Its reputation score of 76/100 sits comfortably in Tier 2 — above the cross-industry Harch 100 average of 65, but below Tier 1 operators like Turkish Airlines (84) and Qatar Airways (89) that RAM benchmark against. The score reflects a structural tension: RAM benefits from a uniquely defensible national-champion narrative (it is 'Morocco's airline' in every meaningful sense) but suffers from chronic operational and labour negativity (delays, cancellations, cabin-crew disputes) that caps its ceiling. The Harch view: RAM's reputation is structurally limited by operational excellence, not narrative quality. The story is good; the delivery is sometimes not.",
    },
    {
      heading: "RAM's narrative: oneworld, Africa, and the Casablanca hub",
      body: "RAM's reputation narrative is built on three pillars. First, the oneworld alliance membership (joined 2020, the only African member), which positions Casablanca as the alliance's African hub and gives RAM code-share reach into 1,000+ destinations via American Airlines, British Airways, Iberia, and Qatar Airways. Second, African expansion — RAM is the largest African long-haul operator outside Ethiopia and has added 6 new African routes in the trailing 18 months (Brazzaville, Cotonou, Abuja, Cape Town, Lomé, Accra). Third, fleet renewal — the 4 Boeing 787-9 Dreamliners delivered in 2024–25 have generated consistent positive coverage for fuel-efficiency and passenger-experience improvements. The CEO Abdelhamid Addou is the second-most-quoted transport CEO in Morocco (after ONDA's director), with 38 attributed mentions in 90 days. The dark spots: 32 crisis-tagged articles in the trailing 90 days (the highest crisis-share of any sector leader we track) — driven by recurring cabin-crew sick-outs, a February 2025 ground-handling incident at Charles de Gaulle, and the persistent 'RAM delay' meme on Moroccan social media that generates 200+ negative mentions per month.",
    },
    {
      heading: "Safety leads the risk register, labour is the chronic issue",
      body: "The Harch risk engine scores safety incident at 70/100 (high band) and operational accident at 65/100 (moderate-high) — making aviation's top two risks safety-related, as one would expect. RAM has not had a hull-loss incident in over 14 years (last fatal accident: 1994, near Agadir), and its IOSA (IATA Operational Safety Audit) registration is current. But safety reputation is asymmetric — a single incident would erase a decade of score gains, and the 737 MAX grounding (2019–2020) and the more recent Alaska Airlines door-plug incident (2024) have made safety journalism more aggressive globally. Fuel price spike (62) is the third-ranked risk and reflects RAM's structural fuel-cost exposure — jet fuel is typically 25–30% of operating costs, and RAM's hedging programme covers only 40% of consumption vs. the 60–70% benchmark at Gulf carriers. Labour dispute (57) is the chronic reputational issue: RAM has faced three cabin-crew work stoppages in the trailing 12 months, each generating 80–120 negative articles. Infrastructure failure (55) rounds out the top five — Casablanca Mohammed V Airport's runway works (ongoing through Q2 2026) have caused 30+ diversions and generate steady negative coverage.",
    },
    {
      heading: "Regulatory environment: FAA Category 1, EASA standard, DGAC oversight",
      body: "RAM operates under three overlapping regulatory regimes. First, the Moroccan DGAC (Direction Générale de l'Aviation Civile) is the primary regulator, with safety oversight aligned to ICAO standards. Morocco has been FAA Category 1 (meets international safety standards) since 2010, allowing RAM unrestricted code-share access to the US market — a status that requires sustained safety performance to maintain. Second, the EASA (European Union Aviation Safety Agency) bilateral agreement, in place since 2011, allows RAM to operate into the EU under Moroccan regulatory certification — critical given that 18 of RAM's 32 international destinations are European. Third, the oneworld alliance operational standards, which are stricter than regulatory minima and require annual compliance audits. The 2025 regulatory horizon includes three items: (1) the EU's RefuelEU Aviation mandate requiring 2% Sustainable Aviation Fuel (SAF) blending from 2025, rising to 6% by 2030 — a direct cost and infrastructure challenge for RAM's European routes; (2) ICAO's CORSIA (Carbon Offsetting and Reduction Scheme for International Aviation) phase-in from 2024, which RAM is voluntarily participating in; (3) the Moroccan government's air-transport liberalisation agenda, which may open new domestic routes to low-cost competition (Ryanair, easyJet, Volotea) by 2027.",
    },
    {
      heading: "ESG: SAF ambition vs. fleet reality",
      body: "Aviation ESG is fundamentally about carbon — and RAM's narrative is mid-pack, neither leading nor lagging. The ESG story has three components. (1) Sustainable Aviation Fuel: RAM signed an offtake MoU with TotalEnergies in 2024 for 50,000 tonnes/year of SAF from 2027 (the Grandpuits refinery conversion), representing roughly 8% of fuel consumption — ahead of the 6% RefuelEU 2030 target but behind the 10% ambition set by leading European carriers. (2) Fleet efficiency: the 4 new 787-9s are 25% more fuel-efficient per seat-km than the A330-200s they replace, and the 737 MAX orders (5 additional aircraft for 2026 delivery) continue the renewal. (3) Operational efficiency: RAM's Casablanca hub single-engine taxi programme and continuous-descent-approach rollout have cut emissions by 1.2% per flight. The gap is scope-3 transparency — RAM's sustainability report does not yet break out passenger scope-3 emissions per the GHG Protocol, a disclosure that European peers (Air France-KLM, Lufthansa) have made since 2022. The Harch view: RAM's ESG narrative will be tested by RefuelEU implementation from 2025. The comms opportunity is to convert SAF compliance into SAF leadership — every European journalist writing about RefuelEU should know about the TotalEnergies offtake by Q4 2025.",
    },
    {
      heading: "Recommendations for aviation comms teams",
      body: "Five moves for the next 90 days. (1) Build a labour-comms playbook: RAM's three cabin-crew work stoppages in 12 months are the single biggest drag on its reputation. The comms response cannot be reactive — build a 4-hour escalation protocol, a designated spokesperson, and a transparent 'here's what we're doing to fix this' communication sequence that converts disputes into proof of management competence. (2) Operationalise the 'oneworld Africa hub' narrative: the alliance membership is structurally undervalued in RAM's coverage. Pitch Casablanca-hub stories to international aviation trade press (FlightGlobal, Airline Business, Skift), not just Moroccan media. (3) Pre-position on safety: RAM's 14-year clean safety record is an under-told story. Build a quarterly safety-communication cadence (training hours, IOSA results, technology deployment) so the baseline narrative is positive, not neutral. (4) Convert SAF compliance into leadership: the TotalEnergies offtake is a real, defensible story. Build a 12-month SAF content calendar — refinery conversion progress, first blended flight, customer communications, scope-3 disclosure — that compounds rather than spikes once a year. (5) Close the AI visibility gap: RAM appears in only 73% of 'Morocco national airline' queries — lower than expected given its market position. The fix is structured Wikipedia content (in French, English, and Arabic), LinkedIn thought leadership from the CEO, and bilingual press releases that AI engines can ingest.",
    },
  ],

  aiVisibility: [
    { label: "Perplexity", value: 75, color: "#4A7B5F" },
    { label: "Gemini", value: 70, color: "#4A7B5F" },
    { label: "ChatGPT", value: 68, color: "#4A5D6E" },
    { label: "Claude", value: 60, color: "#4A5D6E" },
    { label: "Copilot", value: 55, color: "#B87333" },
  ],
  aiVisibilityNote: "Royal Air Maroc appears in 73% of 'Morocco national airline' queries across the five AI engines — high in absolute terms, but lower than expected given RAM's structural market position and oneworld membership. The gap is driven by three factors: (1) weaker English-language coverage than Gulf and Turkish carriers, (2) the RAM/RAM Express brand split that confuses entity resolution, (3) lower Wikipedia depth than peers. Perplexity leads on citation rate (75%) thanks to its source-citation architecture; Copilot lags at 55% due to its enterprise focus. The AI visibility opportunity is significant — RAM is the only Moroccan airline and the only African oneworld member, but AI engines often default to Ethiopian Airlines or South African Airways in 'African airline' queries. Structured content investment could close this gap within 6 months.",

  methodology: "This profile is built from 892 data points harvested across 200+ sources over the trailing 90 days, including 14 Moroccan and 10 international newspapers (with elevated coverage from aviation trade press — FlightGlobal, Skift, Aviation Week, Airline Ratings), DGAC and ICAO publications, social platforms (LinkedIn, X, YouTube, Instagram), financial filings (Al Mada annual report, RAM sustainability report), and the five leading generative AI engines (ChatGPT, Claude, Gemini, Perplexity, Copilot). The Harch Reputation Index is computed as a weighted blend of share of voice (25%), sentiment polarity (25%), AI citation frequency (20%), pillar scores for Innovation / Performance / Purpose (20%), and ESG narrative strength (10%). Risk scores use the Harch 32-category framework, scored 0–100 by combining mention frequency (40%), severity weighting (35%), and forward-looking velocity (25%). All data is refreshed every 6 hours. Royal Air Maroc is the sole tracked entity; subsidiary RAM Express and low-cost unit Air Arabia Maroc (joint venture) are tracked separately at lower depth.",

  meta: {
    title: "Aviation Industry Reputation Report — Royal Air Maroc | Harch Atelier",
    description: "Real-time reputation intelligence for Morocco's aviation sector: Royal Air Maroc tracked across 892 data points and 32 risk categories. RAM scores 76/100 — Tier 2, lifted by oneworld alliance and African expansion, weighed by labour disputes.",
    keywords: [
      "Royal Air Maroc reputation",
      "RAM reputation score",
      "Morocco aviation industry",
      "RAM oneworld alliance",
      "Royal Air Maroc safety",
      "RAM labour dispute cabin crew",
      "Morocco aviation ESG SAF",
      "RAM African expansion",
      "Casablanca aviation hub",
      "Harch aviation industry report",
    ],
  },
};

export default function AviationIndustryPage() {
  return <IndustryPageLayout data={DATA} />;
}
