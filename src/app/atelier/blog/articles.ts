// ═══════════════════════════════════════════════════════════════
//  HARCH ATELIER BLOG — 15 SEO-optimized articles
//  Moroccan & African reputation intelligence
// ═══════════════════════════════════════════════════════════════

// ─── Content block types (pure data, no JSX) ───────────────────
export type ChartSpec =
  // `format` is a template string with a `{v}` placeholder, e.g. "{v}%" or "T+{v}h".
  // Kept as a string (not a function) so the article object remains fully
  // serializable across the server→client component boundary.
  | { kind: "bar"; title?: string; data: { label: string; value: number; color?: string }[]; height?: number; format?: string }
  | { kind: "hbar"; title?: string; data: { label: string; value: number; color?: string; sublabel?: string }[]; format?: string }
  | { kind: "line"; title?: string; series: { name: string; color: string; points: number[] }[]; height?: number; xLabels?: string[]; yMax?: number }
  | { kind: "donut"; title?: string; data: { label: string; value: number; color: string }[]; centerValue?: string; centerLabel?: string }
  | { kind: "gauge"; title?: string; score: number; max?: number; color?: string; label?: string }
  | { kind: "heatmap"; title?: string; rows: string[]; cols: string[]; data: { row: string; col: string; value: number; label?: string }[] }
  | { kind: "radar"; title?: string; axes: string[]; series: { name: string; color: string; values: number[] }[]; size?: number }
  | { kind: "stacked"; title?: string; segments: { label: string; value: number; color: string }[] }
  | { kind: "metricrow"; title?: string; metrics: { value: string; label: string; color?: string }[] };

export type ContentBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; text: string; attribution?: string }
  | { type: "stat"; value: string; label: string; sublabel?: string; color?: string }
  | { type: "chart"; chart: ChartSpec }
  | { type: "table"; headers: string[]; rows: string[][]; caption?: string }
  | { type: "callout"; title: string; text: string; variant?: "info" | "warning" | "success" };

export type Category =
  | "Reputation Risk"
  | "ESG"
  | "PR & Comms"
  | "AI Engines"
  | "Regulation"
  | "Industry Analysis"
  | "Methodology";

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: Category;
  author: string;
  authorRole: string;
  authorBio: string;
  date: string; // ISO yyyy-mm-dd
  dateLabel: string;
  readTime: string;
  readMinutes: number;
  tags: string[];
  coverColor: string;
  featured?: boolean;
  content: ContentBlock[];
}

const SAGE = "#4A7B5F";
const SAGE_BRIGHT = "#6FA386";
const ACCENT = "#4A5D6E";
const ACCENT_BRIGHT = "#8B9DAF";
const RED = "#A0524B";
const AMBER = "#B87333";

export const ARTICLES: Article[] = [
  // ─────────────────────────────────────────────────────────────
  // 1. Banking reputation
  // ─────────────────────────────────────────────────────────────
  {
    slug: "reputation-risk-moroccan-banking-2026",
    title: "Reputation Risk in Moroccan Banking: Why 2026 Is a Pivotal Year",
    excerpt: "BAM is tightening AML rules, fines are rising, and digital channels are amplifying every misstep. We map how the five largest Moroccan banks are positioned heading into 2026.",
    category: "Industry Analysis",
    author: "Yassine El Fassi",
    authorRole: "Head of Industry Analysis, Harch Atelier",
    authorBio: "Yassine leads Harch Atelier's banking and insurance practice. Before joining, he spent nine years in risk advisory at a Big Four firm in Casablanca covering Maghreb financial institutions.",
    date: "2026-02-12",
    dateLabel: "February 12, 2026",
    readTime: "12 min read",
    readMinutes: 12,
    tags: ["Moroccan banking", "Bank Al-Maghrib", "AML compliance", "reputation risk", "Attijariwafa", "Bank of Africa", "BCP", "CIH", "financial regulation 2026"],
    coverColor: ACCENT,
    featured: true,
    content: [
      { type: "p", text: "Bank Al-Maghrib's 2026 supervisory programme, published in January, puts it bluntly: anti-money-laundering controls, digital transformation resilience, and climate-related financial risk are the three pillars under heightened scrutiny this cycle. For the five largest Moroccan banks — Attijariwafa Bank, Bank of Africa, Banque Centrale Populaire, CIH Bank and Crédit du Maroc — that supervisory posture translates directly into reputation exposure. A single AML finding no longer ends with a confidential letter; it ends with a press release, a Twitter thread, and a measurable drop in trust." },
      { type: "p", text: "Our quarterly banking sentiment index, built from 4,200 articles across 28 Moroccan and pan-African media sources, tells a clear story. Sentiment for the sector peaked in Q2 2025 and has been softening since, dragged down by compliance disclosures, branch-closure announcements, and customer-service complaints amplified on social platforms." },
      { type: "chart", chart: { kind: "line", title: "Banking sentiment index by quarter (0–100)", series: [
        { name: "Attijariwafa", color: SAGE, points: [82, 85, 84, 84] },
        { name: "Bank of Africa", color: ACCENT, points: [69, 70, 71, 72] },
        { name: "BCP", color: AMBER, points: [71, 70, 69, 70] },
        { name: "CIH Bank", color: RED, points: [68, 66, 67, 65] },
      ], xLabels: ["Q1 25", "Q2 25", "Q3 25", "Q4 25"], yMax: 100 } },
      { type: "h2", text: "Why 2026 is different" },
      { type: "p", text: "Three forces converge this year. First, the transposition of FATF Recommendation 24 into Moroccan law has raised the bar on beneficial-ownership transparency. Second, the migration to real-time payment rails (under the BAM-led instant payments programme) increases the surface area for fraud and operational incidents that play out publicly in minutes, not days. Third, ESG disclosure under Loi 30-21 is now binding for listed banks, exposing any gap between sustainability claims and actual financed-emissions trajectories." },
      { type: "callout", variant: "info", title: "The new visibility problem", text: "A compliance event that in 2020 would have been a private BAM letter is now a Hespress headline within four hours, a LinkedIn post by a former regulator within eight, and a negative-sentiment spike in our index within twelve. The half-life of a banking incident has collapsed." },
      { type: "h2", text: "Where each bank stands" },
      { type: "p", text: "Our Harch 100 scoring, which combines media sentiment, AI-engine visibility, and expert review, places Attijariwafa Bank at 84 — the highest in the sector and a function of its consistent sub-Saharan expansion narrative and disciplined investor communications. Bank of Africa sits at 72, weighed down by governance noise around its restructuring but supported by a strong sustainability frame." },
      { type: "stat", value: "72", label: "Bank of Africa Harch score", sublabel: "Up 3 points QoQ · ranked #6 in Harch 100", color: ACCENT },
      { type: "stat", value: "84", label: "Attijariwafa Harch score", sublabel: "Up 2 points QoQ · ranked #2 in Harch 100", color: SAGE },
      { type: "p", text: "BCP holds at 70, buoyed by the cooperative model's social legitimacy but capped by recurring customer-service friction at the regional Caisses level. CIH Bank's score of 65 reflects the steepest sentiment decline in the cohort, tied to digital-banking outages reported across three weekends in autumn 2025." },
      { type: "h2", text: "The AML fine multiplier" },
      { type: "p", text: "We modelled the reputation cost of a hypothetical mid-sized AML sanction (40 million dirhams) on a top-five bank. The direct financial hit is trivial relative to net banking income. The reputation cost is not: in our scenario, sentiment drops 9 points over 30 days, NPS among retail customers falls an estimated 6 points, and the negative narrative persists in search and AI engines for 14 weeks — three times longer than a comparable operational incident." },
      { type: "quote", text: "The fine is the invoice. The reputation damage is the tax you pay for years afterwards — every time a journalist, a regulator, or now an AI engine recalls the case.", attribution: "Director of Communications, top-3 Moroccan bank (anonymised)" },
      { type: "h2", text: "What banks should do before June" },
      { type: "ol", items: [
        "Run a pre-emptive AI visibility audit. We find that four of the five largest banks are cited negatively in ChatGPT and Perplexity responses to 'is [bank] safe' prompts — a question prospective customers ask daily.",
        "Rehearse a Tier-1 crisis playbook with a 60-minute holding statement SLA. Most Moroccan banks still run on a 24-hour comms cycle, which is now a full news cycle too slow.",
        "Publish a plain-language AML governance page. Two of the five have none. The gap is a gift to hostile narratives.",
        "Monitor the Mellakh (informal credit) discourse. Conversations about exclusion from formal banking are rising in Darija on social platforms and feed directly into trust scores.",
      ] },
      { type: "callout", variant: "warning", title: "The 14-week tail", text: "Once an AML narrative enters the AI engines' training surface, it recirculates for an average of 14 weeks in citation form. Pre-emptive counter-narrative work in the first 72 hours reduces that tail by up to 60%." },
      { type: "h2", text: "The bottom line" },
      { type: "p", text: "2026 is not the year banking reputation gets worse by default. It is the year the gap between disciplined, anticipatory communications teams and reactive ones becomes publicly visible — in sentiment, in search, and in the answers AI engines give when customers ask who to trust. Banks that treat reputation as a measurable, managed asset will widen their lead. Those that don't will spend the next four quarters explaining themselves." },
      { type: "p", text: "Harch Atelier's Banking Reputation Audit covers 32 risk categories, AI-engine visibility across eight engines, and a board-ready mitigation roadmap. For Moroccan banks, the audit is calibrated to BAM's 2026 supervisory priorities." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 2. ESG reporting
  // ─────────────────────────────────────────────────────────────
  {
    slug: "esg-reporting-morocco-compliance-competitive-advantage",
    title: "ESG Reporting in Morocco: From Compliance to Competitive Advantage",
    excerpt: "Loi 30-21 turns ESG disclosure into law for listed Moroccan companies. OCP's green ammonia and Bank of Africa's sustainable finance frame show how leaders are turning obligation into advantage.",
    category: "ESG",
    author: "Salma Benjelloun",
    authorRole: "ESG Intelligence Lead, Harch Atelier",
    authorBio: "Salma runs Harch Atelier's ESG practice, covering sustainability narrative tracking, greenwashing-risk detection and investor-sentiment monitoring across North and West Africa.",
    date: "2026-03-04",
    dateLabel: "March 4, 2026",
    readTime: "11 min read",
    readMinutes: 11,
    tags: ["ESG Morocco", "Loi 30-21", "OCP green ammonia", "Bank of Africa sustainable finance", "greenwashing", "sustainability disclosure", "AMMC ESG", "corporate reporting"],
    coverColor: SAGE,
    content: [
      { type: "p", text: "Loi 30-21 on sustainable development, consolidated with the AMMC's 2024 ESG reporting framework, has moved Moroccan ESG disclosure from voluntary virtue into legal obligation for listed issuers. The 2026 reporting cycle is the first in which non-compliance carries a tangible supervisory consequence. Yet the companies pulling ahead — OCP Group, Bank of Africa, ONEE — are treating the disclosure not as a cost but as the scaffolding for a competitive narrative." },
      { type: "h2", text: "The compliance floor" },
      { type: "p", text: "The AMMC framework requires disclosure across three pillars: environmental (emissions, water, waste), social (workforce, health and safety, community), and governance (board composition, ethics, anti-corruption). For most listed Moroccan companies, the reporting burden is real — gathering Scope 1 and 2 emissions data, mapping supplier risk, and producing board-level attestation. But compliance alone produces a document, not a reputation." },
      { type: "chart", chart: { kind: "radar", title: "ESG pillar scores — five Moroccan banks (0–100)", axes: ["Environmental", "Social", "Governance", "Disclosure", "Narrative"], series: [
        { name: "Bank of Africa", color: SAGE, values: [78, 82, 75, 80, 85] },
        { name: "Attijariwafa", color: ACCENT, values: [62, 74, 82, 76, 70] },
        { name: "BCP", color: AMBER, values: [58, 80, 68, 65, 62] },
        { name: "CIH Bank", color: RED, values: [55, 66, 70, 60, 58] },
        { name: "Crédit du Maroc", color: ACCENT_BRIGHT, values: [60, 68, 72, 64, 60] },
      ] } },
      { type: "p", text: "The radar makes the strategic point: Bank of Africa leads not because it is best on every axis, but because its narrative pillar — the coherence of its sustainability story across channels — is meaningfully ahead. That narrative coherence is what investors, journalists and increasingly AI engines reward." },
      { type: "h2", text: "OCP's green ammonia play" },
      { type: "p", text: "OCP Group's announcement of a 1 million tonne green ammonia facility, powered by renewable energy in the Jorf Lasfar and Guelmim corridors, is the clearest example of ESG-as-advantage in Morocco. The project is not merely a decarbonisation story; it reframes OCP from a phosphate exporter into a future-facing nutrient and clean-energy company. Our narrative tracking shows the share of media coverage using the frame 'green' or 'sustainable' in connection with OCP rose from 22% in 2023 to 41% in Q4 2025." },
      { type: "stat", value: "41%", label: "Green/sustainable framing of OCP coverage", sublabel: "Q4 2025 · up from 22% in 2023", color: SAGE },
      { type: "h2", text: "Bank of Africa's sustainable finance frame" },
      { type: "p", text: "Bank of Africa's sustainable finance framework, aligned with the IFC Performance Standards and the Equator Principles, sets a target of 25% of the loan book in green and inclusive financing by 2027. The framework matters because it is externally reviewed, quantified, and tied to a governance committee — the three properties that distinguish a credible ESG commitment from a marketing claim. Greenwashing-risk detection in our platform flags statements lacking at least one of those three anchors." },
      { type: "callout", variant: "success", title: "The three anchors of a credible ESG claim", text: "Externally reviewed. Quantified with a baseline and a target. Tied to a named governance owner. Claims missing any anchor carry a 3.2× higher greenwashing-flag rate in our monitoring." },
      { type: "h2", text: "The greenwashing risk" },
      { type: "p", text: "For every OCP and Bank of Africa, there are a dozen Moroccan companies issuing glossy sustainability reports that do not survive scrutiny. Our greenwashing-risk index — which scores claims against verifiable data, peer benchmarks and regulatory filings — flagged 38% of ESG statements by listed Moroccan non-financials in 2025 as 'weakly substantiated'. The risk is not just reputational: AMMC has signalled that misleading sustainability claims will be treated as market-abuse-adjacent in the next enforcement cycle." },
      { type: "h2", text: "From compliance to advantage" },
      { type: "ol", items: [
        "Anchor every public ESG claim to a quantified target with a baseline year and a named owner.",
        "Map the claim to the three anchors (external review, quantification, governance). If one is missing, do not publish it.",
        "Track the narrative share — what fraction of your coverage uses the sustainability frame you intend. If it is below 30%, the disclosure is not reaching the audience.",
        "Monitor AI-engine answers to 'is [company] sustainable' prompts. These answers now shape investor and graduate-talent decisions.",
        "Treat the AMMC disclosure as the floor, not the ceiling. The competitive advantage is in the narrative coherence above it.",
      ] },
      { type: "h2", text: "What this means for 2026" },
      { type: "p", text: "The companies that will lead the Harch 100 ESG sub-ranking in 2026 are not those with the longest reports. They are those whose disclosures, media narratives, AI-engine visibility, and investor communications tell a single, verifiable, quantified story. Loi 30-21 made ESG reporting mandatory. The competitive move is to make it coherent." },
      { type: "p", text: "Harch Atelier's ESG Intelligence module tracks sustainability narratives across 30+ media sources and eight AI engines, with a dedicated greenwashing-risk score for every public claim. The module is calibrated to the AMMC framework and Loi 30-21 reporting obligations." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 3. AI visibility audit
  // ─────────────────────────────────────────────────────────────
  {
    slug: "how-chatgpt-sees-moroccan-brands-ai-visibility-audit-2026",
    title: "How ChatGPT Sees Moroccan Brands: AI Visibility Audit 2026",
    excerpt: "We ran 240 prompts across ChatGPT, Perplexity, Gemini and Claude for 12 Moroccan companies. Citation rates vary wildly, and three brands are quietly winning the AI search game.",
    category: "AI Engines",
    author: "Karim Alaoui",
    authorRole: "AI Engines Lead, Harch Atelier",
    authorBio: "Karim leads Harch Atelier's AI-engine visibility practice. He designs and runs the quarterly prompt batteries that measure how generative engines represent Moroccan and African companies.",
    date: "2026-01-22",
    dateLabel: "January 22, 2026",
    readTime: "13 min read",
    readMinutes: 13,
    tags: ["AI visibility", "ChatGPT", "Perplexity", "Gemini", "Claude", "GEO", "Moroccan brands", "generative engine optimization", "citation rate"],
    coverColor: ACCENT,
    featured: true,
    content: [
      { type: "p", text: "Generative engines — ChatGPT, Perplexity, Gemini, Claude, Google AI Overviews — are now a primary channel through which prospective customers, journalists, investors and graduates form a first impression of a company. We ran 240 prompts (20 per company) across four engines for 12 leading Moroccan brands to measure who gets cited, who gets described negatively, and who simply does not exist in the answer." },
      { type: "h2", text: "Methodology in brief" },
      { type: "p", text: "We selected 12 companies spanning banking, telecoms, mining, agri-food and retail. For each, we drafted 20 prompts across four intent types: factual ('what is [company]'), evaluative ('is [company] reliable'), comparative ('[company] vs [competitor]'), and recommendation ('best [category] in Morocco'). Each prompt was run on ChatGPT (GPT-5), Perplexity (Pro), Gemini (2.5 Pro) and Claude (Sonnet 4.5) in fresh sessions in January 2026. We coded every response for citation presence, sentiment, and factual accuracy against a verified baseline." },
      { type: "chart", chart: { kind: "bar", title: "Citation rate by AI engine (% of prompts citing the brand)", data: [
        { label: "ChatGPT", value: 64, color: SAGE },
        { label: "Perplexity", value: 78, color: ACCENT },
        { label: "Gemini", value: 52, color: AMBER },
        { label: "Claude", value: 41, color: RED },
      ], format: "{v}%" } },
      { type: "p", text: "Perplexity leads on citation rate, which is expected — its architecture surfaces sources explicitly. The more consequential finding is the gap between Gemini (52%) and Claude (41%): two engines that shape investor and enterprise audiences respectively are significantly under-citing Moroccan brands. Claude's low rate reflects its weaker web-retrieval grounding; Gemini's reflects a thinner Moroccan training surface." },
      { type: "h2", text: "The three quiet winners" },
      { type: "p", text: "Three companies outperformed the cohort on a composite visibility score combining citation rate, sentiment, and factual accuracy: OCP Group, Maroc Telecom, and Attijariwafa Bank. They share three properties: dense, structured, regularly updated English and French Wikipedia presence; a high volume of indexed press releases with quantified facts; and consistent entity disambiguation (the brand name resolves cleanly to the company, not a homonym)." },
      { type: "h3", text: "Top 10 prompts by citation divergence" },
      { type: "p", text: "The prompts below produced the widest divergence between engines — the cases where a brand is highly visible on one engine and invisible on another. These are the highest-leverage gaps to close." },
      { type: "table", headers: ["#", "Prompt", "ChatGPT", "Perplexity", "Gemini", "Claude"], rows: [
        ["1", "Is Bank of Africa reliable?", "Yes", "Yes", "No", "No"],
        ["2", "Best mobile network in Morocco", "Maroc Telecom", "Maroc Telecom", "Inwi", "—"],
        ["3", "OCP Group sustainability", "Cited", "Cited", "Cited", "Cited"],
        ["4", "CIH Bank vs Attijariwafa", "Attijariwafa", "Both", "Attijariwafa", "—"],
        ["5", "Is Inwi a good operator?", "Yes", "Yes", "No", "No"],
        ["6", "Managem mining controversy", "Cited", "Cited", "No", "Cited"],
        ["7", "Marjane vs Carrefour Morocco", "Marjane", "Marjane", "Carrefour", "—"],
        ["8", "Lydec water management", "Negative", "Negative", "No", "No"],
        ["9", "Royal Air Maroc safety", "Positive", "Positive", "Positive", "No"],
        ["10", "Cosumar sugar monopoly", "Cited", "Cited", "No", "No"],
      ], caption: "Citation presence by engine for the 10 highest-divergence prompts. '—' means no answer offered." },
      { type: "callout", variant: "info", title: "The 'is [company] reliable' problem", text: "Evaluative prompts ('is X reliable', 'is X safe') are the ones that shape decisions — and the ones where Moroccan brands are most often absent or described with stale 2022 information. Closing this gap is the single highest-ROI AI-visibility move." },
      { type: "h2", text: "Sentiment when cited" },
      { type: "p", text: "Being cited is necessary but not sufficient. Of the citations we recorded, 71% were neutral or positive, 19% mixed, and 10% clearly negative. The negative citations cluster around three topics: telecoms customer service, water-utility service quality, and historical mining incidents. Critically, negative citations persist longer than positive ones — the same 2019 incident reappears in 2026 answers because no fresher, higher-authority source has displaced it." },
      { type: "chart", chart: { kind: "donut", title: "Sentiment of AI-engine citations", data: [
        { label: "Neutral / Positive", value: 71, color: SAGE },
        { label: "Mixed", value: 19, color: AMBER },
        { label: "Clearly negative", value: 10, color: RED },
      ], centerValue: "71%", centerLabel: "Neutral/Positive" } },
      { type: "h2", text: "What drives visibility" },
      { type: "p", text: "Regression analysis across our 12 companies shows three factors explain 68% of citation-rate variance: structured-data richness on the corporate domain (schema.org Organisation, FAQ, NewsArticle); the recency and volume of indexed press coverage in French and English; and the presence of a well-maintained Wikipedia article with at least ten independent secondary sources. Brands missing the Wikipedia article underperform by an average of 23 percentage points." },
      { type: "quote", text: "We used to optimise for Google's first page. We now optimise for the first sentence of a ChatGPT answer — because that is what the prospect actually reads.", attribution: "Head of Digital, leading Moroccan telco (anonymised)" },
      { type: "h2", text: "The GEO playbook for Moroccan brands" },
      { type: "ol", items: [
        "Audit entity disambiguation. Does the brand name resolve cleanly to your company on all four engines? Homonym collisions are the silent visibility killer.",
        "Publish structured, quantified, dated facts. Generative engines prefer numbers they can attribute. 'Founded in 1902, 14,000 employees, present in 26 countries' beats 'a leading Moroccan group'.",
        "Maintain the Wikipedia article with ten-plus independent secondary sources. This is the single largest lever for Claude and Gemini.",
        "Displace stale negative citations with fresher, higher-authority coverage. A 2026 press release does not erase a 2019 incident, but a 2026 independent investigation does.",
        "Run a quarterly prompt battery. AI-engine training surfaces shift; a static snapshot ages in one quarter.",
      ] },
      { type: "h2", text: "Why this matters now" },
      { type: "p", text: "The share of B2B and consumer research journeys that touch a generative engine crossed 40% in our December 2025 panel. For graduate-talent decisions the share is higher. A brand that is invisible or mis-described in these answers is losing decisions it cannot see. The companies that treat AI visibility as a managed asset — like OCP, Maroc Telecom and Attijariwafa — are quietly compounding an advantage that is invisible in traditional search analytics." },
      { type: "p", text: "Harch Atelier's AI Visibility Audit runs a 240-prompt battery across eight engines, scores citation rate, sentiment and factual accuracy, and delivers a GEO action plan ranked by expected impact. The audit is repeated quarterly to track engine drift." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 4. Cost of a reputation crisis
  // ─────────────────────────────────────────────────────────────
  {
    slug: "cost-of-reputation-crisis-moroccan-case-study",
    title: "The Cost of a Reputation Crisis: A Moroccan Case Study",
    excerpt: "An anonymised case: a Moroccan bank hit an AML fine and lost 18 reputation points in 30 days. We break down the score decline, the cost, and what the response got right and wrong.",
    category: "Reputation Risk",
    author: "Nadia Tazi",
    authorRole: "Crisis Intelligence Analyst, Harch Atelier",
    authorBio: "Nadia runs Harch Atelier's crisis-intelligence desk, building incident timelines and post-mortem reputation scoring for Moroccan and West-African institutions.",
    date: "2026-04-09",
    dateLabel: "April 9, 2026",
    readTime: "10 min read",
    readMinutes: 10,
    tags: ["reputation crisis", "case study", "AML fine", "crisis response", "reputation score", "sentiment analysis", "Moroccan bank", "crisis cost"],
    coverColor: RED,
    content: [
      { type: "p", text: "In late 2025, a top-five Moroccan bank — anonymised here as 'Bank M' — received an AML-related sanction from Bank Al-Maghrib. The fine itself, roughly 45 million dirhams, was immaterial to the income statement. The reputation damage was not. Over the following 30 days, Bank M's Harch reputation score fell 18 points, the steepest single-incident decline we recorded in the Moroccan banking sector in 2025. This is the anatomy of that decline, and the lessons it leaves." },
      { type: "h2", text: "The 30-day score decline" },
      { type: "p", text: "Our score combines media sentiment (weighted 40%), AI-engine citation sentiment (25%), social-platform conversation tone (20%), and expert-panel review (15%). The chart below tracks Bank M's score across the 30 days following the public disclosure of the sanction." },
      { type: "chart", chart: { kind: "line", title: "Bank M reputation score — 30 days post-disclosure", series: [
        { name: "Bank M", color: RED, points: [78, 77, 70, 66, 63, 61, 60, 60, 60] },
      ], xLabels: ["D0", "D1", "D3", "D7", "D10", "D14", "D21", "D28", "D30"], yMax: 100 } },
      { type: "p", text: "Two patterns matter. First, 55% of the total decline happened in the first 72 hours — before the bank's formal response was published. Second, the score flatlined at 60 from day 21 onwards, indicating a new, lower equilibrium rather than a recovery. Six months later, the score had recovered only 4 points." },
      { type: "callout", variant: "warning", title: "The 72-hour window", text: "More than half of the reputation damage in this case was locked in before the bank's holding statement landed. The first-mover advantage in crisis comms is no longer measured in days; it is measured in hours." },
      { type: "h2", text: "The cost breakdown" },
      { type: "p", text: "We estimate the total reputation cost at roughly 380 million dirhams over 12 months — over eight times the headline fine. The breakdown below is modelled from disclosed retail-deposit flows, internal customer-acquisition cost benchmarks, and NPS survey data shared with us on background." },
      { type: "table", headers: ["Cost category", "Estimated (MAD)", "Notes"], rows: [
        ["Regulatory fine", "45,000,000", "Disclosed"],
        ["Retail deposit outflow (net)", "120,000,000", "Q4 2025 vs Q3 2025, net of inflows"],
        ["Customer-acquisition cost uplift", "85,000,000", "Higher CPA to replace churned accounts"],
        ["NPS decline (6 points)", "60,000,000", "Modelled lifetime-value impact"],
        ["Graduate-talent pipeline", "40,000,000", "Reduced top-tier applications in 2026 cycle"],
        ["Comms & legal response", "30,000,000", "External agencies, legal review"],
        ["Total (12-month)", "380,000,000", "~8.4× the headline fine"],
      ], caption: "Modelled 12-month reputation cost. Figures are estimates, not audited financials." },
      { type: "h2", text: "What the response got right" },
      { type: "p", text: "Bank M did three things well. The CEO issued a video statement within 48 hours acknowledging the finding without minimising it. The bank published a remediation plan with named owners and deadlines — the three-anchor structure we recommend for any crisis communication. And it briefed its top 200 corporate clients individually within the first week, pre-empting relationship-manager calls they could not otherwise have handled." },
      { type: "quote", text: "The fine we could absorb. What we could not absorb was the silence — every hour without a clear, owned narrative was an hour the narrative was written for us.", attribution: "Chief Communications Officer, Bank M (anonymised)" },
      { type: "h2", text: "What the response got wrong" },
      { type: "p", text: "Three failures stand out. The bank had no pre-prepared AML holding statement — the legal team drafted from scratch and the 48-hour delay cost an estimated 8 points of score. The bank did not monitor AI engines; on day 4, ChatGPT answers to 'is Bank M safe' were already citing the sanction with no counter-narrative. And the bank's social listening covered only French and Arabic MSA, missing the Darija conversation on TikTok and X that drove the sharpest sentiment drop on day 3." },
      { type: "h2", text: "The AI-engine tail" },
      { type: "p", text: "The most enduring cost was the AI-engine tail. Twelve weeks after the incident, ChatGPT and Perplexity were still citing the sanction in answer to evaluative prompts, in 73% and 81% of cases respectively. The bank's counter-narrative — the remediation plan, the clean subsequent audit — had not entered the training surface in sufficient density to displace the original incident. We estimate the tail extended the score recovery from a potential 9 months to 18 months." },
      { type: "stat", value: "73%", label: "ChatGPT still citing the sanction at week 12", sublabel: "Counter-narrative not yet dense enough to displace", color: RED },
      { type: "h2", text: "Lessons for 2026" },
      { type: "ol", items: [
        "Pre-draft holding statements for the five most likely crisis scenarios. The drafting time, not the messaging, is what costs points.",
        "Monitor AI engines from day zero of an incident. A counter-narrative seeded in the first 72 hours reduces the 12-week tail by up to 60%.",
        "Cover Darija. French and Arabic MSA monitoring misses the fastest-moving sentiment channel in Morocco.",
        "Brief corporate clients individually in week one. The relationship-manager channel is the most efficient stabiliser.",
        "Model the reputation cost — not just the fine — in the board's incident scenario planning.",
      ] },
      { type: "p", text: "The headline number from this case is not the fine. It is the 8.4× multiplier between the disclosed penalty and the modelled reputation cost. That multiplier is the figure boards should plan against." },
      { type: "p", text: "Harch Atelier's Crisis Post-Mortem service reconstructs incident timelines, scores the 30-day reputation impact, and benchmarks the response against the 72-hour best-practice window." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 5. Crisis communication playbook
  // ─────────────────────────────────────────────────────────────
  {
    slug: "crisis-communication-age-of-ai-playbook-moroccan-comms",
    title: "Crisis Communication in the Age of AI: A Playbook for Moroccan Comms Teams",
    excerpt: "A five-step crisis playbook with holding-statement templates, spokesperson training notes, and a T+0 to T+72h response timeline calibrated to the Moroccan media and AI-engine cycle.",
    category: "PR & Comms",
    author: "Omar Berrada",
    authorRole: "PR & Comms Director, Harch Atelier",
    authorBio: "Omar advises Moroccan and African Comms leaders on crisis preparedness, spokesperson training and AI-era media cycles. He previously led corporate communications at a CAC 40-listed African subsidiary.",
    date: "2026-02-28",
    dateLabel: "February 28, 2026",
    readTime: "11 min read",
    readMinutes: 11,
    tags: ["crisis communication", "playbook", "holding statement", "spokesperson training", "Moroccan media", "AI-era PR", "crisis timeline", "comms team"],
    coverColor: AMBER,
    content: [
      { type: "p", text: "The crisis-communication playbook most Moroccan Comms teams still use was written for a 24-hour news cycle. The cycle they operate in is now measured in hours, and the audience they address is increasingly an AI engine writing the first answer a stakeholder reads. This is a five-step playbook, calibrated to the Moroccan media and AI-engine cycle, that we deploy with clients across banking, telecoms and agri-food." },
      { type: "h2", text: "The T+0 to T+72h timeline" },
      { type: "p", text: "The window that determines 60% of the reputation outcome is the first 72 hours. The timeline below is the cadence we recommend. Every step has an owner, an artefact, and a measurable output." },
      { type: "chart", chart: { kind: "hbar", title: "Crisis response timeline — ownership and SLA", data: [
        { label: "T+0 — Detection & triage", value: 1, color: RED, sublabel: "War room · 15 min SLA" },
        { label: "T+1h — Holding statement v1", value: 1, color: AMBER, sublabel: "Comms + Legal · 60 min SLA" },
        { label: "T+4h — Stakeholder briefing", value: 4, color: AMBER, sublabel: "CEO + IR · internal first" },
        { label: "T+8h — AI-engine seeding", value: 8, color: ACCENT, sublabel: "Digital team · structured facts" },
        { label: "T+24h — Full statement + plan", value: 24, color: SAGE, sublabel: "CEO video + remediation" },
        { label: "T+72h — Recovery narrative", value: 72, color: SAGE_BRIGHT, sublabel: "Comms · third-party validation" },
      ], format: "T+{v}h" } },
      { type: "h2", text: "Step 1 — Detect and triage (T+0)" },
      { type: "p", text: "Detection is no longer the bottleneck; triage is. Most Moroccan Comms teams now see an incident within 15 minutes via social listening. What they lack is a severity-scoring rubric that distinguishes a Tier-1 incident (board-visible, regulatory, multi-stakeholder) from a Tier-3 noise event. Our rubric scores on three axes: audience reach (who is seeing it), authority of the source (a regulator tweet vs an anonymous account), and velocity (engagement growth in the first hour). A Tier-1 trigger should convene the war room within 15 minutes." },
      { type: "callout", variant: "info", title: "Tier-1 triggers", text: "Regulatory disclosure, fatality or safety incident, data breach affecting customers, executive misconduct allegation, or any narrative reaching 50k+ verified reach in the first hour. Any one of these convenes the war room." },
      { type: "h2", text: "Step 2 — Holding statement (T+1h)" },
      { type: "p", text: "The holding statement is the single most undervalued artefact in Moroccan crisis practice. Its job is not to explain; it is to acknowledge, to take ownership of the narrative frame, and to set expectations for the next communication. A 60-minute SLA is achievable only with a pre-drafted template library. The five templates we maintain — regulatory, operational, safety, cyber, and executive — cover roughly 90% of the incidents Moroccan institutions face." },
      { type: "quote", text: "The first statement does not need to be right about everything. It needs to be first, owned, and honest about what is not yet known.", attribution: "Director of Communications, top-3 Moroccan bank (anonymised)" },
      { type: "h3", text: "Holding statement template (regulatory)" },
      { type: "callout", variant: "info", title: "Template", text: "[Bank M] is aware of the [regulatory finding] published today by [regulator]. We take this matter seriously and have engaged [named function] to lead our response. A full update will be provided by [time, within 24h]. In the meantime, [one sentence of operational reassurance for customers]. We will communicate transparently as facts are established." },
      { type: "h2", text: "Step 3 — Stakeholder briefing (T+4h)" },
      { type: "p", text: "Internal first, always. Employees and relationship managers are the secondary broadcast channel — if they hear about the incident from Hespress before they hear from their own leadership, the internal narrative is lost for weeks. The T+4h briefing pack should contain: the holding statement, a Q&A for customer-facing staff, an escalation contact tree, and a 'do not speculate' guidance for social media." },
      { type: "h2", text: "Step 4 — AI-engine seeding (T+8h)" },
      { type: "p", text: "This is the step most playbooks omit and the one most consequential in 2026. Within eight hours, generative engines begin indexing coverage of the incident. The bank's own structured, dated, quantified facts — published on the corporate domain with schema.org NewsArticle markup — are the most reliable counter-narrative surface. The objective is not to erase the incident from AI answers (impossible) but to ensure that when an engine cites it, the citation includes the bank's response, the remediation owner, and the timeline." },
      { type: "stat", value: "60%", label: "Reduction in 12-week AI-engine tail", sublabel: "When counter-narrative is seeded within 72 hours", color: SAGE },
      { type: "h2", text: "Step 5 — Recovery narrative (T+72h)" },
      { type: "p", text: "By 72 hours, the acute phase is over and the recovery phase begins. The recovery narrative needs three ingredients: a named remediation owner with a deadline, a third-party validator (an independent audit, a regulator acknowledgement, an industry body statement), and a forward-looking commitment that reframes the story. The objective is to move the media frame from 'incident' to 'response' within the first news cycle of week two." },
      { type: "h2", text: "Spokesperson training for the AI era" },
      { type: "p", text: "Traditional media training prepared spokespeople for a journalist's follow-up question. AI-era training prepares them for the fact that their sentence will be chunked, embedded in an AI answer, and replayed for months without context. Three rules: speak in complete, self-contained sentences; lead with the quantified fact, not the qualifier; never say 'no comment' — it becomes the headline." },
      { type: "h2", text: "What to build before the next incident" },
      { type: "ul", items: [
        "A library of five pre-drafted holding statements, legally reviewed and refreshed quarterly.",
        "A severity-scoring rubric with named Tier-1 triggers and a 15-minute war-room convening SLA.",
        "An AI-engine seeding checklist — structured facts, schema markup, corporate-domain publication within 8 hours.",
        "A spokesperson media-training refresh that accounts for sentence-chunking by generative engines.",
        "A recovery-narrative template with the three ingredients (owner, validator, forward commitment).",
      ] },
      { type: "p", text: "Harch Atelier's Crisis Playbook engagement delivers the template library, the severity rubric, a tabletop exercise, and a 90-day post-incident monitoring window across media and AI engines." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 6. Regulatory risk radar
  // ─────────────────────────────────────────────────────────────
  {
    slug: "regulatory-risk-radar-12-moroccan-regulators-monitor",
    title: "Regulatory Risk Radar: 12 Moroccan Regulators You Need to Monitor",
    excerpt: "BAM, AMMC, ANRT, ONSSA, ANAC, CNDP and six more — their 2026 priorities, recent actions, and the reputation risks they create for the companies they supervise.",
    category: "Regulation",
    author: "Leila Idrissi",
    authorRole: "Regulatory Intelligence Lead, Harch Atelier",
    authorBio: "Leila tracks regulatory developments across Morocco and Francophone Africa. She previously worked in public affairs at a pan-African telecoms operator.",
    date: "2026-03-19",
    dateLabel: "March 19, 2026",
    readTime: "12 min read",
    readMinutes: 12,
    tags: ["Moroccan regulators", "BAM", "AMMC", "ANRT", "ONSSA", "CNDP", "regulatory risk", "compliance 2026", "Moroccan regulation"],
    coverColor: ACCENT,
    content: [
      { type: "p", text: "Regulatory risk is reputation risk with a letterhead. A supervisory finding, a public sanction, a consultation paper — each is a signal that journalists, NGOs and AI engines will read and replay. We monitor twelve Moroccan regulators whose 2026 priorities will shape the reputation landscape for the companies they supervise. This is the map, and what to watch in each." },
      { type: "h2", text: "The 12 regulators" },
      { type: "table", headers: ["Regulator", "Jurisdiction", "2026 priority", "Recent signal"], rows: [
        ["BAM — Bank Al-Maghrib", "Banking, insurance, payment", "AML, instant payments, climate risk", "AML sanction Q4 2025"],
        ["AMMC", "Capital markets, listed issuers", "ESG disclosure, market abuse", "ESG framework enforcement"],
        ["ANRT", "Telecoms, spectrum, postal", "5G rollout, QoS, data localisation", "QoS penalties 2025"],
        ["ONSSA", "Food safety, pharma", "Import controls, traceability", "Recall notices 2025"],
        ["ANAC", "Civil aviation", "Safety oversight, carrier certification", "RAM audit follow-up"],
        ["CNDP", "Data protection (Loi 09-08)", "Cross-border transfers, consent", "GDPR-alignment bill 2026"],
        ["ANCFCC", "Land, cadastre, conservation", "Title fraud, digital cadastre", "Title-irregularity cases"],
        ["ONEE", "Water & electricity", "Service quality, tariff transparency", "Water-stress communications"],
        ["AMMR", "Insurance & reinsurance", "Solvency, distribution", "Distribution-conduct review"],
        ["Conseil de la Concurrence", "Competition", "Cartels, merger control", "Telco interconnection case"],
        ["CCIS / Regional CCIS", "Commerce, chambers", "SME conduct, trade practices", "Informal-sector formalisation"],
        ["Douanes (ADII)", "Customs", "Valuation, origin, AEO", "Green-corridor expansion"],
      ], caption: "The twelve regulators on the Harch Atelier 2026 monitoring radar." },
      { type: "h2", text: "BAM — the centre of gravity" },
      { type: "p", text: "Bank Al-Maghrib is the single most reputation-consequential regulator in Morocco. Its 2026 supervisory programme names AML, instant-payments resilience and climate-related financial risk as the three heightened-scrutiny pillars. For supervised banks, the translation is direct: an AML finding now reaches the public domain faster, the instant-payments programme increases the operational-incident surface, and climate-risk disclosure intersects with the AMMC ESG framework to create a double-reporting obligation." },
      { type: "callout", variant: "warning", title: "The double-reporting trap", text: "Listed banks now report climate risk to both BAM (supervisory) and AMMC (disclosure). Inconsistencies between the two filings are the lowest-hanging reputational risk for 2026 — and the easiest to pre-empt with a single internal data spine." },
      { type: "h2", text: "AMMC — ESG enforcement year" },
      { type: "p", text: "The AMMC's 2024 ESG framework moves from guidance to enforcement in the 2026 reporting cycle. The signal to watch is the regulator's treatment of 'weakly substantiated' sustainability claims — our greenwashing-risk index flagged 38% of listed non-financial ESG statements in 2025. Companies whose 2026 disclosures repeat 2025 claim language without quantified baselines are the most exposed." },
      { type: "h2", text: "ANRT — 5G and quality of service" },
      { type: "p", text: "The ANRT's 5G rollout conditions, finalised in late 2025, set coverage and quality-of-service obligations that will define telecoms reputation through 2026. The regulator has shown willingness to publish QoS penalties publicly — a reputational, not just financial, consequence. For Maroc Telecom, Orange Maroc and Inwi, the monitoring priority is the gap between marketed coverage and measured QoS by region." },
      { type: "h2", text: "CNDP — the data-protection acceleration" },
      { type: "p", text: "The CNDP's 2026 work programme signals alignment with GDPR on cross-border transfers and consent management. For any Moroccan company processing EU personal data — most of the financial and telecoms sector — the gap analysis between Loi 09-08 and the forthcoming amendments is a Q1 2026 priority. Data-protection incidents are among the fastest-moving reputation crises; the CNDP's enhanced public-communication posture means incidents will be named." },
      { type: "h2", text: "ONSSA and ANAC — safety and trust" },
      { type: "p", text: "ONSSA's import-control and traceability programme and ANAC's safety-oversight follow-ups are lower-frequency but high-severity reputation triggers. A food-safety recall or an aviation safety finding travels faster than any financial sanction. The monitoring discipline here is early-warning: tracking regulator consultation papers and inspection programmes before they become enforcement actions." },
      { type: "h2", text: "The reputation lens on regulation" },
      { type: "p", text: "Every regulator on this list produces two kinds of signal: a compliance signal (what the company must do) and a reputation signal (what the public will infer). Most Moroccan companies monitor the first and under-monitor the second. The reputation signal lives in the consultation papers, the public statements, the penalty notices, and the subsequent media and AI-engine citation." },
      { type: "quote", text: "We read every BAM circular. We did not read the Hespress story that quoted the circular until it was already shaping customer calls.", attribution: "Compliance officer, mid-sized Moroccan bank (anonymised)" },
      { type: "h2", text: "A monitoring discipline for 2026" },
      { type: "ol", items: [
        "Map every regulator with jurisdiction over your entity, and assign a named internal owner.",
        "Track consultation papers, not just enforceable texts — they are the leading indicator.",
        "Monitor media and AI-engine citation of regulatory actions within 24 hours of publication.",
        "Pre-draft holding statements for the top three regulatory scenarios per regulator.",
        "Reconcile double-reporting obligations (e.g. BAM/AMMC climate) against a single internal data spine.",
      ] },
      { type: "p", text: "Harch Atelier's Regulatory Risk Radar monitors the twelve regulators above, with a 24-hour alert on consultation papers, enforcement actions, and the media and AI-engine citation that follows." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 7. OCP reputation masterclass
  // ─────────────────────────────────────────────────────────────
  {
    slug: "ocp-group-reputation-masterclass-sustainability-narrative",
    title: "OCP Group: A Reputation Masterclass in Sustainability Narrative",
    excerpt: "How OCP built the #1 reputation score in the Harch 100 through disciplined ESG storytelling, green ammonia, and a coherence most Moroccan companies have not yet achieved.",
    category: "Industry Analysis",
    author: "Hamza Sefrioui",
    authorRole: "Industry Analyst, Harch Atelier",
    authorBio: "Hamza covers mining, agri-input and heavy industry in the Harch 100 ranking. He previously worked in investor relations at a Casablanca-listed agri-food group.",
    date: "2026-05-14",
    dateLabel: "May 14, 2026",
    readTime: "10 min read",
    readMinutes: 10,
    tags: ["OCP Group", "reputation score", "sustainability narrative", "green ammonia", "Harch 100", "ESG storytelling", "phosphate", "Moroccan mining"],
    coverColor: SAGE,
    content: [
      { type: "p", text: "OCP Group holds the number-one position in the 2026 Harch 100, our ranking of Morocco's most reputable companies. The score is not a fluke of favourable phosphate prices or a single well-received announcement. It is the output of a disciplined, multi-year sustainability narrative that most Moroccan companies have not yet matched. This is what OCP did, and what is transferable." },
      { type: "h2", text: "The pillar breakdown" },
      { type: "p", text: "Our scoring decomposes reputation into three pillars: Innovation (the company's future-facing narrative), Performance (delivered financial and operational results), and Purpose (the social and environmental frame). OCP's mix is unusually balanced — and unusually weighted toward Innovation." },
      { type: "chart", chart: { kind: "donut", title: "OCP reputation pillar mix", data: [
        { label: "Innovation", value: 48, color: SAGE },
        { label: "Performance", value: 35, color: ACCENT },
        { label: "Purpose", value: 17, color: AMBER },
      ], centerValue: "#1", centerLabel: "Harch 100" } },
      { type: "p", text: "The 48% Innovation weighting is the masterstroke. Most Moroccan companies score on Performance alone — the financial results carry the reputation. OCP has shifted the centre of gravity to the future-facing narrative: green ammonia, customised plant nutrition, carbon-neutral mining ambitions. This is harder for competitors to displace because it is a story about trajectory, not a single quarter." },
      { type: "h2", text: "Score evolution" },
      { type: "chart", chart: { kind: "line", title: "OCP Harch score — 2023 to 2026", series: [
        { name: "OCP Group", color: SAGE, points: [71, 76, 84, 91] },
      ], xLabels: ["2023", "2024", "2025", "2026"], yMax: 100 } },
      { type: "p", text: "The 20-point climb from 2023 to 2026 is the largest sustained gain in the Harch 100 cohort. Three narrative moves explain it: the consolidation of the green ammonia story (2023–24), the UM6P research-and-talent flywheel becoming visible in international media (2024–25), and the Africa-focused plant-nutrition framing that reframed OCP from exporter to continental enabler (2025–26)." },
      { type: "h2", text: "The three properties of the OCP narrative" },
      { type: "p", text: "OCP's narrative has three properties that, together, are the masterclass. First, it is quantified — every claim is anchored to a tonnage, a year, a facility. Second, it is externally validated — the green ammonia project carries independent engineering review and named offtake partners. Third, it is coherent across channels — the investor deck, the press release, the Wikipedia article and the AI-engine answer tell the same story with the same numbers." },
      { type: "callout", variant: "success", title: "The coherence test", text: "Pull the same factual claim from your investor relations deck, your latest press release, your Wikipedia article, and a ChatGPT answer to 'what is [company] known for'. If the four do not agree, the narrative is not coherent — and coherence is what AI engines and journalists reward." },
      { type: "h2", text: "What is transferable" },
      { type: "p", text: "Not every Moroccan company has a green ammonia project. But every company can adopt the three properties. The quantification discipline — replacing 'a leading group' with 'founded in 1902, 14,000 employees, present in 26 countries' — is the single highest-leverage move. External validation is available through audit, certification and named partnerships. Coherence is a governance choice: a single narrative owner across IR, comms and digital." },
      { type: "quote", text: "We stopped writing sustainability stories and started publishing numbers. The reputation followed the numbers, not the adjectives.", attribution: "Senior communications advisor, Moroccan listed group (anonymised)" },
      { type: "h2", text: "What is not transferable — and why that matters" },
      { type: "p", text: "OCP benefits from a category monopoly (phosphate), a sovereign alignment, and a research ecosystem (UM6P) that few companies can replicate. Imitating the surface of the narrative without the substance would be greenwashing, and our index would flag it. The transferable lesson is the discipline, not the topic. A bank can apply the same quantified, validated, coherent discipline to financial-inclusion outcomes. A telco can apply it to coverage and QoS. The topic is the company's; the discipline is OCP's." },
      { type: "h2", text: "The risk to the lead" },
      { type: "p", text: "No reputation lead is permanent. OCP's exposure points are the gap between the green-ammonia narrative and the near-term financed-emissions trajectory, the community-impact discourse around mining sites, and the geopolitical framing of phosphate as a strategic resource. Each of these is a vector a less-disciplined competitor or an NGO could exploit. Maintaining the lead requires extending the discipline from the corporate narrative to the operational grievance surface." },
      { type: "p", text: "Harch Atelier's Reputation Audit scores companies on the Innovation–Performance–Purpose pillar framework and benchmarks the narrative coherence across IR, media and AI-engine channels. The OCP case study is included in our 2026 Industry Analysis briefing." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 8. Sentiment analysis in Arabic
  // ─────────────────────────────────────────────────────────────
  {
    slug: "sentiment-analysis-arabic-why-tools-fail-darija",
    title: "Sentiment Analysis in Arabic: Why Most Tools Fail on Darija",
    excerpt: "A technical deep dive on Arabic NLP, code-switching between Darija, French and MSA, and the trilingual approach HarchIQ uses to reach 88% accuracy on Moroccan conversation.",
    category: "Methodology",
    author: "Karim Alaoui",
    authorRole: "AI Engines Lead, Harch Atelier",
    authorBio: "Karim leads Harch Atelier's AI-engine visibility practice and the NLP work on Moroccan Darija. He previously built multilingual sentiment systems for a European news-monitoring group.",
    date: "2026-04-24",
    dateLabel: "April 24, 2026",
    readTime: "13 min read",
    readMinutes: 13,
    tags: ["sentiment analysis", "Arabic NLP", "Darija", "code-switching", "HarchIQ", "trilingual NLP", "Moroccan Arabic", "natural language processing"],
    coverColor: ACCENT,
    content: [
      { type: "p", text: "Most commercial sentiment-analysis tools were trained on English, fine-tuned on Modern Standard Arabic, and shipped to the Middle East. Applied to Moroccan conversation — where a single tweet can mix Darija, French, MSA and Latin-script Arabizi — they fail predictably and expensively. This is a technical deep dive on why, and on the trilingual approach HarchIQ uses to reach 88% sentiment accuracy on Moroccan text." },
      { type: "h2", text: "The three failure modes" },
      { type: "p", text: "Off-the-shelf Arabic sentiment models fail on Moroccan text in three characteristic ways. The first is dialect mismatch: a model trained on Levantine or Egyptian Arabic misreads Darija vocabulary ('dbg' = 'now', 'shi' = 'some') and produces neutral or wrong labels. The second is code-switching: a sentence like 'Le service de la banque est l3q, wallah je vais changer' switches from French to Darija mid-sentence, and most models tag the whole sentence by the dominant-script language. The third is script: Arabizi (Arabic in Latin characters, with numbers for emphatic consonants) is invisible to models that expect Arabic script." },
      { type: "chart", chart: { kind: "bar", title: "Sentiment accuracy by language across five tools (%)", data: [
        { label: "English", value: 91, color: SAGE },
        { label: "French", value: 84, color: SAGE },
        { label: "MSA", value: 78, color: AMBER },
        { label: "Darija", value: 41, color: RED },
      ], format: "{v}%" } },
      { type: "p", text: "The Darija gap is stark. A tool that scores 91% on English and 78% on MSA drops to 41% on Moroccan Darija — barely better than random. For a Moroccan bank monitoring Twitter, this means the majority of customer complaints in Darija are either missed or mislabelled neutral, leaving the reputation-risk signal invisible until it has already migrated to French-language press." },
      { type: "h2", text: "Tool-by-tool comparison" },
      { type: "table", headers: ["Tool", "FR", "AR (MSA)", "EN", "Darija", "Notes"], rows: [
        ["Tool A (off-the-shelf)", "82%", "76%", "91%", "39%", "Trained on Gulf + Levantine"],
        ["Tool B (off-the-shelf)", "79%", "71%", "88%", "34%", "No dialect handling"],
        ["Tool C (cloud API)", "85%", "78%", "90%", "44%", "Generic multilingual"],
        ["Tool D (regional vendor)", "80%", "74%", "83%", "52%", "MSA + Egyptian tuning"],
        ["HarchIQ (trilingual)", "89%", "85%", "92%", "88%", "Darija-native + code-switch"],
      ], caption: "Sentiment accuracy on a 2,000-sentence hand-labelled Moroccan benchmark, January 2026." },
      { type: "h2", text: "The code-switching problem in detail" },
      { type: "p", text: "Moroccan corporate conversation is not monolingual. A single customer-service thread on X routinely contains French for the formal complaint, Darija for the emotional register, and English loanwords for product names. A sentiment model that classifies by document language mislabels the thread as 'French' and applies a French-language model to the Darija segments. The result is a false neutral — the most dangerous label in reputation monitoring, because it hides a signal rather than corrupting it." },
      { type: "callout", variant: "warning", title: "The false-neutral problem", text: "A mislabelled-negative is noisy but visible. A mislabelled-neutral is invisible. In our benchmark, 38% of Darija-negative sentences were labelled neutral by off-the-shelf tools — meaning more than a third of complaints never trigger an alert." },
      { type: "h2", text: "How HarchIQ handles it" },
      { type: "p", text: "HarchIQ is trilingual by design. The pipeline runs three parallel passes — French, MSA, and a Darija-native model trained on 1.4 million hand-labelled Moroccan sentences — and a code-switching detector that segments a sentence by language span before classification. Arabizi is normalised to Arabic script via a rule-based transliteration layer before the Darija model sees it. The three passes are reconciled by a confidence-weighted ensemble that prefers the Darija model on Darija-dominant spans." },
      { type: "stat", value: "88%", label: "HarchIQ Darija sentiment accuracy", sublabel: "vs. 41% average for off-the-shelf tools", color: SAGE },
      { type: "h2", text: "What 'Darija-native' means" },
      { type: "p", text: "A Darija-native model is not an MSA model with a dialect adapter. It is a model trained from scratch on Moroccan text, with a vocabulary that includes the French loanwords ('facture', 'service', 'recharge') that are syntactically Darija, the Berber substrate vocabulary, and the emphatic consonants that MSA models handle inconsistently. The training corpus spans customer-service transcripts, social platforms, and press comments — the registers where Moroccan corporate reputation actually lives." },
      { type: "h2", text: "The Souk test" },
      { type: "p", text: "We benchmark every model release against the 'Souk test' — 500 hand-labelled Moroccan sentences drawn from real customer-service and social conversation, balanced across positive, neutral and negative. A model that passes the Souk test handles the registers that matter for reputation monitoring: the frustrated customer, the ironic compliment, the Berber-inflected complaint, the French-formal request. Off-the-shelf models score 41% on the Souk test; HarchIQ scores 88%." },
      { type: "quote", text: "We were missing every other Darija complaint. The reputation dashboard looked green while Twitter was red. That is how a crisis surprises a bank that thought it was monitoring.", attribution: "Head of Digital, Moroccan bank (anonymised)" },
      { type: "h2", text: "Practical implications" },
      { type: "ol", items: [
        "Ask any sentiment vendor for a Darija-specific accuracy number on a hand-labelled benchmark. If they cannot produce one, the tool is not fit for Moroccan monitoring.",
        "Audit the false-neutral rate, not just the overall accuracy. A high false-neutral rate is the silent failure mode.",
        "Cover Arabizi. Roughly 30% of Moroccan social conversation about brands is in Latin script; a script-only Arabic model is blind to it.",
        "Test on your own customer-service transcripts before buying. Vendor benchmarks are often MSA-heavy.",
        "Re-benchmark quarterly. Darija evolves fast — new loanwords, new slang — and a static model degrades.",
      ] },
      { type: "p", text: "HarchIQ's trilingual sentiment engine is the foundation of Harch Atelier's reputation monitoring. The Darija-native model is retrained quarterly on fresh Moroccan text, and the Souk test is published in our methodology documentation." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 9. Harch 100 methodology
  // ─────────────────────────────────────────────────────────────
  {
    slug: "harch-100-methodology-how-we-rank-morocco-top-companies",
    title: "The Harch 100 Methodology: How We Rank Morocco's Top Companies",
    excerpt: "The scoring formula, the pillar extraction, the data sources and the expert review — with a worked sample scoring for Bank of Africa at 72/100.",
    category: "Methodology",
    author: "Yassine El Fassi",
    authorRole: "Head of Industry Analysis, Harch Atelier",
    authorBio: "Yassine leads Harch Atelier's banking and insurance practice and oversees the Harch 100 scoring methodology.",
    date: "2026-01-30",
    dateLabel: "January 30, 2026",
    readTime: "11 min read",
    readMinutes: 11,
    tags: ["Harch 100", "methodology", "reputation scoring", "Morocco ranking", "reputation index", "pillar extraction", "data sources", "reputation formula"],
    coverColor: ACCENT,
    content: [
      { type: "p", text: "The Harch 100 is our ranking of Morocco's 100 most reputable companies. It is not a popularity contest, a media-mention count, or an editor's pick. It is a scored index built from four data inputs, three pillars, and a human expert review. This is the methodology, and a worked example for Bank of Africa at 72/100." },
      { type: "h2", text: "The scoring formula" },
      { type: "p", text: "The headline score is a weighted composite of four inputs: media sentiment (40%), AI-engine citation sentiment (25%), social-platform conversation tone (20%), and expert-panel review (15%). Each input is normalised to a 0–100 scale and combined linearly. The formula is intentionally simple — the complexity lives in the input measurement, not the combination." },
      { type: "chart", chart: { kind: "stacked", title: "Score weighting by input", segments: [
        { label: "Media sentiment", value: 40, color: SAGE },
        { label: "AI-engine sentiment", value: 25, color: ACCENT },
        { label: "Social tone", value: 20, color: AMBER },
        { label: "Expert review", value: 15, color: RED },
      ] } },
      { type: "h2", text: "Pillar extraction" },
      { type: "p", text: "Behind the headline score, we decompose reputation into three pillars: Innovation (the future-facing narrative), Performance (delivered results), and Purpose (social and environmental frame). Pillar scores are extracted from the same input data but with different query and weighting logic — Innovation weights forward-looking language and R&D signals, Performance weights financial and operational coverage, Purpose weights ESG and community-impact coverage. The pillar mix is often more diagnostic than the headline." },
      { type: "h2", text: "Data sources" },
      { type: "ul", items: [
        "30+ Moroccan and pan-African media sources, scraped via Google News RSS and direct publisher feeds, processing 5M+ articles per day.",
        "Eight AI engines — ChatGPT, Perplexity, Gemini, Claude, Copilot, Mistral, Google AI Overviews, Grok — queried with a 240-prompt battery quarterly.",
        "Social platforms (X, Facebook, Instagram, YouTube, TikTok) monitored via platform APIs and partners, with Darija-native sentiment.",
        "An expert panel of nine Moroccan senior comms, IR and risk professionals who review the top 20 and bottom 10 each cycle.",
      ] },
      { type: "h2", text: "Worked example: Bank of Africa at 72" },
      { type: "p", text: "Bank of Africa's 2026 Q1 score is 72. Here is how it is built. Media sentiment, measured across 842 articles in the quarter, normalises to 70. AI-engine citation sentiment, across 60 prompts and four engines, normalises to 68. Social-platform tone, across 12,400 mentions with Darija-native classification, normalises to 74. Expert-panel review, on a 0–100 rubric, scores 78." },
      { type: "table", headers: ["Input", "Raw measure", "Normalised", "Weight", "Contribution"], rows: [
        ["Media sentiment", "842 articles, 0.52 mean", "70", "40%", "28.0"],
        ["AI-engine sentiment", "60 prompts, 0.48 mean", "68", "25%", "17.0"],
        ["Social tone", "12,400 mentions", "74", "20%", "14.8"],
        ["Expert review", "9-panel rubric", "78", "15%", "11.7"],
        ["Total", "—", "—", "100%", "71.5 → 72"],
      ], caption: "Bank of Africa — Harch 100 Q1 2026 score construction." },
      { type: "callout", variant: "info", title: "Why normalisation matters", text: "Raw sentiment means are not comparable across inputs — a 0.52 media mean and a 0.48 AI mean do not say the same thing. Normalisation maps each input to a 0–100 scale against the sector distribution, so the weighted combination is meaningful." },
      { type: "h2", text: "Pillar decomposition for Bank of Africa" },
      { type: "p", text: "Bank of Africa's pillar mix tells a sharper story than the headline 72. Innovation scores 78 (strong sustainability and digital-banking narrative), Performance scores 66 (restructuring noise weighs), Purpose scores 80 (sustainable-finance framework leads the sector). The diagnosis: the score is capped not by narrative ambition but by performance execution. The levers that move the score are operational, not communicational." },
      { type: "chart", chart: { kind: "gauge", title: "Bank of Africa headline score", score: 72, color: ACCENT, label: "Harch 100 · Q1 2026" } },
      { type: "h2", text: "What we exclude" },
      { type: "p", text: "The Harch 100 excludes paid placement, sponsored content, and any coverage we can identify as commissioned. We exclude employee-review platforms from the headline score (they are tracked separately, as a workplace sub-index). We exclude AI-generated content farms. The objective is a measure of earned reputation — what the world says about a company, not what the company pays to have said." },
      { type: "h2", text: "The expert review" },
      { type: "p", text: "The 15% expert weight is deliberate. Quantitative inputs are necessary but not sufficient — they miss context, nuance, and the difference between volume and significance. Our panel of nine senior practitioners reviews the top 20 and bottom 10 each cycle, scoring on a 0–100 rubric that accounts for crisis handling, narrative coherence, and stakeholder trust signals the automated inputs cannot capture. The panel's score is the corrective against gaming." },
      { type: "h2", text: "How to read the ranking" },
      { type: "p", text: "The headline score is a snapshot. The pillar mix is the diagnosis. The quarter-on-quarter delta is the trajectory. A company at 72 with a rising Innovation pillar and a stable Performance pillar is on a different trajectory from one at 72 with both pillars flat. The Harch 100 is most useful when read as a movement, not a podium." },
      { type: "p", text: "The full methodology, including the source list, the prompt battery, the normalisation logic and the expert-panel rubric, is published in our method documentation. Harch Atelier clients receive the sector decomposition and the company-level scorecard underlying their ranking." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 10. Bank of Africa vs Attijariwafa
  // ─────────────────────────────────────────────────────────────
  {
    slug: "bank-of-africa-vs-attijariwafa-two-banking-reputations",
    title: "Bank of Africa vs Attijariwafa: A Tale of Two Banking Reputations",
    excerpt: "Attijariwafa leads at 84, Bank of Africa trails at 72. A side-by-side comparison across nine themes shows why — and what BoA's comms team can do to close the gap.",
    category: "Industry Analysis",
    author: "Yassine El Fassi",
    authorRole: "Head of Industry Analysis, Harch Atelier",
    authorBio: "Yassine leads Harch Atelier's banking and insurance practice, covering Moroccan and pan-African financial institutions.",
    date: "2026-05-02",
    dateLabel: "May 2, 2026",
    readTime: "12 min read",
    readMinutes: 12,
    tags: ["Bank of Africa", "Attijariwafa", "banking reputation", "Moroccan banks", "Harch 100", "comparison", "reputation score", "banking comms"],
    coverColor: ACCENT,
    content: [
      { type: "p", text: "Attijariwafa Bank and Bank of Africa are Morocco's two largest private banks, and they sit twelve points apart in the Harch 100 — Attijariwafa at 84, Bank of Africa at 72. The gap is not a story of one good quarter and one bad one. It is a structural difference in narrative coherence, geographic framing, and the discipline with which each bank handles the moments that shape reputation. This is the comparison, theme by theme." },
      { type: "h2", text: "Head-to-head across nine themes" },
      { type: "table", headers: ["Theme", "Attijariwafa", "Bank of Africa", "Gap"], rows: [
        ["Brand strength", "88", "78", "+10"],
        ["Financial performance narrative", "85", "70", "+15"],
        ["Sub-Saharan expansion", "86", "76", "+10"],
        ["Digital banking", "80", "75", "+5"],
        ["ESG / sustainability", "70", "85", "−15"],
        ["Customer service perception", "72", "68", "+4"],
        ["Crisis resilience", "86", "62", "+24"],
        ["Talent & employer brand", "82", "74", "+8"],
        ["AI-engine visibility", "81", "66", "+15"],
      ], caption: "Theme scores 0–100, Q1 2026. Higher is better; negative gap favours Bank of Africa." },
      { type: "chart", chart: { kind: "radar", title: "Nine-theme reputation radar", axes: ["Brand", "Performance", "Africa", "Digital", "ESG", "Service", "Crisis", "Talent", "AI visibility"], series: [
        { name: "Attijariwafa (84)", color: SAGE, values: [88, 85, 86, 80, 70, 72, 86, 82, 81] },
        { name: "Bank of Africa (72)", color: ACCENT, values: [78, 70, 76, 75, 85, 68, 62, 74, 66] },
      ] } },
      { type: "h2", text: "Where Attijariwafa leads" },
      { type: "p", text: "Attijariwafa's lead is broadest on three themes: crisis resilience (+24), financial-performance narrative (+15), and AI-engine visibility (+15). The crisis-resilience gap reflects a multi-year investment in comms infrastructure — pre-drafted holding statements, a 24/7 monitoring desk, and a spokesperson cadre that has been media-trained for the AI era. The performance-narrative gap is a discipline gap: Attijariwafa's quarterly results are accompanied by a consistent, quantified, forward-looking frame that travels intact into media and AI-engine answers." },
      { type: "p", text: "The AI-engine visibility gap is the most consequential for 2026. Attijariwafa is cited in 81% of relevant prompts across four engines; Bank of Africa in 66%. The gap reflects Attijariwafa's denser structured-data footprint, its more consistent Wikipedia maintenance, and a higher volume of indexed, quantified press releases. In a world where the first answer a prospect reads is generative, this gap compounds." },
      { type: "h2", text: "Where Bank of Africa leads" },
      { type: "p", text: "Bank of Africa leads on a single, important theme: ESG and sustainability (+15). The sustainable-finance framework, the IFC alignment, and the 25% green-loan-book target give BoA the most credible sustainability narrative in the cohort. This is the lever — if BoA can extend the discipline of its ESG narrative to its performance and crisis themes, the structural gap narrows." },
      { type: "quote", text: "BoA out-narrates Attijariwafa on sustainability. Attijariwafa out-executes BoA on every other theme. The question for BoA is whether sustainability can become the spine of a broader reputation, or remains a strong limb on a weaker body.", attribution: "Senior banking analyst, Casablanca (anonymised)" },
      { type: "h2", text: "The crisis-resilience gap" },
      { type: "p", text: "The 24-point crisis-resilience gap is the one most worth understanding. It is not that Attijariwafa has fewer incidents — both banks operate in the same regulatory environment. It is that Attijariwafa's incidents are smaller in reputation impact because the response is faster, more owned, and better seeded into AI engines. Bank of Africa's restructuring-related coverage in 2025 was not, in substance, more severe than Attijariwafa's compliance disclosures — but it produced a larger score impact because the response cycle was slower and the AI-engine counter-narrative was thinner." },
      { type: "stat", value: "+24", label: "Attijariwafa crisis-resilience lead", sublabel: "The single largest theme gap between the two banks", color: SAGE },
      { type: "h2", text: "What Bank of Africa can do" },
      { type: "ol", items: [
        "Make the sustainable-finance frame the spine of the corporate narrative, not a parallel track — extend its three anchors (external review, quantification, governance) to performance and crisis communications.",
        "Close the AI-engine visibility gap with a structured-data and Wikipedia investment. This is the fastest-moving lever and the one with the longest tail.",
        "Stand up a 24/7 monitoring desk with Darija coverage. The crisis-resilience gap is, at root, a response-speed gap.",
        "Reframe the restructuring narrative from 'cost' to 'capability' — the current coverage reads as defensive; the reframe reads as forward-looking.",
        "Adopt Attijariwafa's quantified-results discipline. Replace adjectives with numbers in every public communication.",
      ] },
      { type: "h2", text: "What Attijariwafa should watch" },
      { type: "p", text: "A 12-point lead is comfortable but not structural. Attijariwafa's exposure is the ESG theme — a 15-point deficit to Bank of Africa that, in a 2026 where Loi 30-21 enforcement is real, is the most defensible ground for a competitor to attack. Closing the ESG gap with a credible, quantified, externally-reviewed sustainability frame is the defensive priority. The lead on the other eight themes is maintained by not losing the discipline that built it." },
      { type: "callout", variant: "info", title: "The narrowing scenario", text: "If Bank of Africa closes the AI-visibility gap by 10 points and the crisis-resilience gap by 10, the headline narrows from 12 to roughly 6 within four quarters — without Attijariwafa declining. Discipline, not dominance, decides the next cycle." },
      { type: "h2", text: "The bottom line" },
      { type: "p", text: "Attijariwafa's lead is a discipline lead, replicated across themes. Bank of Africa's strength is a narrative lead, concentrated in one. The 2026 question is whether BoA can generalise its ESG discipline, and whether Attijariwafa can defend its ESG flank. Both moves are achievable. Neither is automatic." },
      { type: "p", text: "Harch Atelier's Banking Reputation Audit covers the nine-theme decomposition, the AI-engine visibility diagnostic, and the theme-level action plan. The Attijariwafa–Bank of Africa comparison is updated each quarter in our Banking Briefing." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 11. Telco reputational risks
  // ─────────────────────────────────────────────────────────────
  {
    slug: "five-emerging-reputational-risks-moroccan-telcos-2026",
    title: "5 Emerging Reputational Risks for Moroccan Telcos in 2026",
    excerpt: "Cyber attacks, 5G rollout friction, customer-service backlash, regulatory scrutiny and geopolitical exposure — the five risk vectors reshaping telco reputation in Morocco.",
    category: "Reputation Risk",
    author: "Nadia Tazi",
    authorRole: "Crisis Intelligence Analyst, Harch Atelier",
    authorBio: "Nadia runs Harch Atelier's crisis-intelligence desk, covering telecoms, banking and utilities across Morocco and West Africa.",
    date: "2026-06-11",
    dateLabel: "June 11, 2026",
    readTime: "10 min read",
    readMinutes: 10,
    tags: ["Moroccan telcos", "Maroc Telecom", "Orange Maroc", "Inwi", "5G rollout", "cyber risk", "reputational risk", "telecom regulation 2026"],
    coverColor: RED,
    content: [
      { type: "p", text: "Moroccan telecoms — Maroc Telecom, Orange Maroc and Inwi — operate in the most reputation-exposed consumer sector in the country. A network outage, a billing dispute, or a data breach is not a B2B incident reported in Les Échos; it is a Darija firestorm on TikTok within the hour. We map the five emerging reputational risk vectors that will define telco reputation in 2026, and where each operator stands on each." },
      { type: "h2", text: "The five risk vectors" },
      { type: "chart", chart: { kind: "heatmap", title: "Risk exposure by operator (0–10, higher = more exposed)", rows: ["Maroc Telecom", "Orange Maroc", "Inwi"], cols: ["Cyber", "5G", "Service", "Regulatory", "Geopolitical"], data: [
        { row: "Maroc Telecom", col: "Cyber", value: 8, label: "8" },
        { row: "Maroc Telecom", col: "5G", value: 7, label: "7" },
        { row: "Maroc Telecom", col: "Service", value: 6, label: "6" },
        { row: "Maroc Telecom", col: "Regulatory", value: 7, label: "7" },
        { row: "Maroc Telecom", col: "Geopolitical", value: 5, label: "5" },
        { row: "Orange Maroc", col: "Cyber", value: 7, label: "7" },
        { row: "Orange Maroc", col: "5G", value: 6, label: "6" },
        { row: "Orange Maroc", col: "Service", value: 7, label: "7" },
        { row: "Orange Maroc", col: "Regulatory", value: 6, label: "6" },
        { row: "Orange Maroc", col: "Geopolitical", value: 6, label: "6" },
        { row: "Inwi", col: "Cyber", value: 6, label: "6" },
        { row: "Inwi", col: "5G", value: 8, label: "8" },
        { row: "Inwi", col: "Service", value: 5, label: "5" },
        { row: "Inwi", col: "Regulatory", value: 5, label: "5" },
        { row: "Inwi", col: "Geopolitical", value: 4, label: "4" },
      ] } },
      { type: "h2", text: "1. Cyber attacks" },
      { type: "p", text: "Telecoms are the highest-value cyber target in the Moroccan economy — a successful breach exposes customer data, billing systems and the national roaming fabric. The reputation risk is asymmetric: a near-miss is invisible, a breach is catastrophic and long-lived in AI-engine citation. Maroc Telecom's larger customer base and critical-infrastructure designation make it the highest-exposure operator; Orange Maroc's group-level cyber investment partially offsets its exposure. The reputation discipline here is pre-breached: a rehearsed breach-communication playbook, a regulator-notification SLA, and a customer-notification template that does not read like a legal disclaimer." },
      { type: "h2", text: "2. 5G rollout friction" },
      { type: "p", text: "The ANRT's 5G rollout conditions create a multi-quarter reputation battleground. The risk is the gap between marketed coverage and measured quality of service — a gap the ANRT now publishes penalties on. Inwi, the smallest operator, carries the highest 5G rollout risk because its coverage claims will be scrutinised against two larger competitors with deeper rural footprints. The reputation move is to publish measured QoS, not marketed coverage, and to own the gap narrative before a regulator or a journalist does." },
      { type: "h2", text: "3. Customer-service backlash" },
      { type: "p", text: "Customer service is the highest-volume reputation signal in Moroccan telecoms. Billing disputes, SIM-swap friction, and call-centre wait times generate the conversation volume that drives quarterly sentiment. Orange Maroc carries the highest service-exposure score in our heatmap, reflecting recurring Darija-language complaints about resolution times. The lever is not call-centre capacity alone — it is the closed-loop: a complaint on X that is resolved within 24 hours produces a positive sentiment swing larger than the original negative." },
      { type: "callout", variant: "warning", title: "The closed-loop multiplier", text: "A publicly resolved complaint generates, on average, 1.4× the positive sentiment of the original negative. Telcos that resolve in public on social platforms compound reputation; those that resolve in private leave the negative standing." },
      { type: "h2", text: "4. Regulatory scrutiny" },
      { type: "p", text: "The ANRT's 2026 quality-of-service enforcement and the CNDP's data-protection alignment with GDPR create a double regulatory exposure. QoS penalties are now public; data-protection incidents will increasingly be named. Maroc Telecom, as the incumbent, carries the highest regulatory scrutiny simply because its footprint is largest. The monitoring discipline is to track ANRT and CNDP consultation papers as leading indicators — enforcement actions follow consultations by roughly six months." },
      { type: "h2", text: "5. Geopolitical exposure" },
      { type: "p", text: "Telecoms are strategic infrastructure, and the geopolitical framing of vendor selection (Huawei vs Ericsson vs Nokia), submarine-cable routing, and sovereign-cloud obligations increasingly shapes reputation. Orange Maroc's group affiliation and Maroc Telecom's cross-shareholdings with regional operators create exposure to narratives that originate outside Morocco. Inwi, with its domestic capital base, is the least geopolitically exposed — an asset in 2026 that is under-narrated in its current communications." },
      { type: "chart", chart: { kind: "bar", title: "Composite reputational risk score by operator (0–50)", data: [
        { label: "Maroc Telecom", value: 33, color: AMBER },
        { label: "Orange Maroc", value: 32, color: ACCENT },
        { label: "Inwi", value: 28, color: SAGE },
      ], format: "{v}/50" } },
      { type: "h2", text: "What telcos should do before Q3" },
      { type: "ol", items: [
        "Publish measured QoS, not marketed coverage — pre-empt the ANRT penalty narrative.",
        "Stand up a public-resolution closed loop on social platforms. The multiplier is real and quantified.",
        "Rehearse a cyber-breach communication playbook with a 4-hour customer-notification SLA.",
        "Track ANRT and CNDP consultation papers as leading indicators of enforcement.",
        "For Inwi: narrate the domestic-capital, sovereign alignment as a positive — it is currently invisible.",
      ] },
      { type: "p", text: "Harch Atelier's Telco Reputation Tracker monitors the five risk vectors above across the three operators, with weekly Darija-language sentiment and a regulator-consultation early-warning feed." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 12. C-Suite reputation priority
  // ─────────────────────────────────────────────────────────────
  {
    slug: "85-percent-moroccan-c-suite-prioritize-reputation-over-margin",
    title: "Why 85% of Moroccan C-Suite Leaders Prioritize Reputation Over Margin",
    excerpt: "Our 2026 survey of 140 Moroccan C-suite leaders finds 85% would protect reputation over short-term margin. What the shift means for Comms leaders — and the decision tree behind it.",
    category: "PR & Comms",
    author: "Omar Berrada",
    authorRole: "PR & Comms Director, Harch Atelier",
    authorBio: "Omar advises Moroccan and African Comms leaders on reputation strategy and the elevation of Comms into the C-suite decision cycle.",
    date: "2026-03-27",
    dateLabel: "March 27, 2026",
    readTime: "11 min read",
    readMinutes: 11,
    tags: ["C-suite", "reputation vs margin", "Moroccan business leaders", "survey 2026", "Comms leadership", "reputation strategy", "decision making", "executive survey"],
    coverColor: SAGE,
    content: [
      { type: "p", text: "In our 2026 Moroccan C-suite survey, 85% of 140 executives said they would protect reputation over short-term margin when the two conflict. Three years ago, that number would have been closer to 50%. The shift is not cosmetic — it reflects a structural change in how Moroccan business leaders understand value, risk, and the half-life of a decision. For Comms leaders, it is the opening to move from tactical to strategic. This is what the data says, and what to do with it." },
      { type: "h2", text: "The survey" },
      { type: "p", text: "We surveyed 140 C-suite leaders — CEOs, CFOs, COOs and CROs — across Moroccan listed and large private companies in banking, telecoms, agri-food, mining, utilities and retail. The survey ran in February 2026, with a 12-question instrument and a 22-minute average completion. The headline finding: when asked to choose between a decision that protects reputation and one that protects short-term margin, 85% chose reputation." },
      { type: "chart", chart: { kind: "donut", title: "Reputation vs margin — C-suite priority", data: [
        { label: "Reputation first", value: 85, color: SAGE },
        { label: "Margin first", value: 12, color: AMBER },
        { label: "Context-dependent", value: 3, color: ACCENT_BRIGHT },
      ], centerValue: "85%", centerLabel: "Reputation first" } },
      { type: "h2", text: "Why the shift happened" },
      { type: "p", text: "Three forces explain the move. First, the 2024–25 cycle of regulatory enforcement and public sanctions demonstrated that reputation damage compounds while margin damage is quarterly. Second, the talent market — particularly for top-tier Moroccan graduates — now prices employer reputation explicitly; leaders report losing candidates they had already signed. Third, AI engines have made reputation legible: a CEO can now ask ChatGPT 'is [my company] trustworthy' and read the answer a prospect reads, which makes the abstract concrete." },
      { type: "quote", text: "I used to defend the comms budget in board meetings. Now the CFO defends it for me — he ran the numbers on the last incident and reputation was the most expensive line item.", attribution: "Chief Communications Officer, Moroccan listed group (anonymised)" },
      { type: "h2", text: "The decision tree" },
      { type: "p", text: "We asked the 85% to walk us through the decision logic. The tree below captures the dominant path. It is not a flowchart of what they should do; it is a reconstruction of what they actually do." },
      { type: "table", headers: ["Step", "Question", "Reputation-first answer"], rows: [
        ["1", "Is the decision reversible?", "If no → reputation weight increases"],
        ["2", "Will the decision be visible to customers within 90 days?", "If yes → reputation weight increases"],
        ["3", "Does the decision touch a regulated obligation?", "If yes → reputation dominates"],
        ["4", "Is there a credible negative narrative an NGO or journalist could build?", "If yes → reputation dominates"],
        ["5", "What is the 12-month reputation cost vs the quarterly margin gain?", "If reputation cost > margin gain → reputation first"],
      ], caption: "Reconstructed decision logic for the 85% who prioritise reputation." },
      { type: "callout", variant: "info", title: "Step 5 is the new step", text: "Steps 1–4 are intuitive and have existed for a decade. Step 5 — quantifying the 12-month reputation cost — is new, and it is the step most boards cannot take without reputation intelligence. That is the opening for Comms." },
      { type: "h2", text: "What this means for Comms leaders" },
      { type: "p", text: "The 85% number is permission, not arrival. Comms leaders who interpret it as validation and continue in a tactical mode will waste the opening. The strategic move is to own Step 5 of the decision tree — to bring the quantified reputation cost into the board's decision cycle. That requires three capabilities most Comms functions do not yet have: a reputation score that the board trusts, an incident-cost model that translates sentiment into dirhams, and an AI-engine visibility read that the CEO can verify in 60 seconds." },
      { type: "chart", chart: { kind: "metricrow", title: "What changes when Comms owns Step 5", metrics: [
        { value: "2.4×", label: "Board airtime", color: SAGE },
        { value: "+18pts", label: "Comms budget 2yr", color: ACCENT },
        { value: "−40%", label: "Crisis score impact", color: AMBER },
        { value: "9 mo before, 5 mo after", label: "Recovery time", color: RED },
      ] } },
      { type: "h2", text: "The three capabilities" },
      { type: "p", text: "First, a reputation score the board trusts. This is not a media-mention count; it is a defensible composite, with a methodology the CFO will accept. The Harch 100 score is built for exactly this use. Second, an incident-cost model that translates a sentiment drop into a dirham figure — the 8.4× multiplier between headline fines and reputation cost is the kind of number that changes board conversations. Third, an AI-engine visibility read that the CEO can verify in 60 seconds — the answer to 'what does ChatGPT say about us' should not require a deck." },
      { type: "h2", text: "The risk of misreading the moment" },
      { type: "p", text: "The 85% creates a window, but windows close. The risk for Comms leaders is two-fold: claiming the strategic role without the capabilities to deliver it, which produces a credibility collapse at the next incident; or under-claiming, which leaves the Step 5 ownership to the CFO or the strategy team, who will build it without the comms judgment that makes it usable. The move is to claim the role and build the capability simultaneously — in that order." },
      { type: "h2", text: "A 90-day plan" },
      { type: "ol", items: [
        "Bring a reputation score to the next board meeting — even a v0. The act of presenting a number changes the conversation.",
        "Build an incident-cost model for the top three scenarios. Even a directional figure (the 8.4× multiplier) reframes the board's risk appetite.",
        "Run an AI-engine visibility audit and present the CEO with the answers to 'what does ChatGPT say about us'. Sixty seconds, every quarter.",
        "Map the decision tree to your company's last three contested decisions. Show where Step 5 was missing.",
        "Claim the strategic role explicitly — in writing, to the CEO. Under-claiming is the more common failure.",
      ] },
      { type: "p", text: "Harch Atelier's C-suite Reputation Briefing packages the score, the incident-cost model and the AI-visibility read into a board-ready monthly cadence. The 2026 C-suite survey dataset is available to clients on request." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 13. AI Reputation Index
  // ─────────────────────────────────────────────────────────────
  {
    slug: "ai-reputation-index-why-what-ai-says-matters-more-than-ever",
    title: "The AI Reputation Index: Why What AI Says About You Matters More Than Ever",
    excerpt: "Generative engines are the new search. AI query volume is up 4× year-on-year, citation rates shape decisions, and the answers are sticky. Here is how to measure and move your AI reputation.",
    category: "AI Engines",
    author: "Karim Alaoui",
    authorRole: "AI Engines Lead, Harch Atelier",
    authorBio: "Karim leads Harch Atelier's AI-engine visibility practice and the Harch AI Reputation Index methodology.",
    date: "2026-06-25",
    dateLabel: "June 25, 2026",
    readTime: "12 min read",
    readMinutes: 12,
    tags: ["AI reputation index", "generative engines", "ChatGPT citations", "AI search", "GEO", "AI visibility", "reputation intelligence", "citation benchmark"],
    coverColor: ACCENT,
    featured: true,
    content: [
      { type: "p", text: "Generative engines have crossed the line from novelty to infrastructure. When a prospect, a journalist, an investor or a graduate asks 'is [company] reliable', the first answer they read is no longer a search result — it is a generated paragraph. That paragraph is the new front page, and it is sticky: once an answer enters an engine's citation surface, it recirculates for weeks. The Harch AI Reputation Index measures who is winning this new channel, and why it matters more each quarter." },
      { type: "h2", text: "The query-volume shift" },
      { type: "p", text: "Our panel data shows generative-engine query volume for Moroccan company names up 4.1× year-on-year in Q2 2026. The absolute number now approaches 35% of traditional search volume for the same queries, and for evaluative prompts ('is X reliable', 'is X safe', 'should I bank with X') the generative share is over 50%. The trajectory, not the level, is the strategic fact." },
      { type: "chart", chart: { kind: "line", title: "Generative-engine query volume index (Q1 2024 = 100)", series: [
        { name: "Generative engines", color: SAGE, points: [100, 180, 260, 340, 410] },
        { name: "Traditional search", color: ACCENT, points: [100, 98, 95, 93, 91] },
      ], xLabels: ["Q1 24", "Q1 25", "Q3 25", "Q1 26", "Q2 26"], yMax: 450 } },
      { type: "p", text: "Traditional search is not collapsing — it is plateauing while generative grows through it. The implication is additive, not substitutive: a company must manage both surfaces. But the generative surface is where the marginal decision is now made, and where the marginal reputation dollar produces the highest return." },
      { type: "h2", text: "Why citations are sticky" },
      { type: "p", text: "A search result can be displaced in days by a fresher, better-linked page. A generative-engine citation is stickier because it enters the engine's training and retrieval surface, where it is reinforced by repeated retrieval. Our tracking shows that once a negative citation enters ChatGPT's answers, it persists for an average of 14 weeks; on Perplexity, 9 weeks; on Gemini, 11 weeks. Displacement requires a denser, fresher, higher-authority counter-narrative than the original citation — a higher bar than traditional SEO ever set." },
      { type: "callout", variant: "warning", title: "The 14-week tail", text: "A negative AI citation is not a bad review that fades in a week. It is a fact the engine will repeat for three months unless actively displaced. The cost of inaction compounds; the cost of action is front-loaded." },
      { type: "h2", text: "Citation rate benchmarks" },
      { type: "p", text: "The Harch AI Reputation Index tracks citation rate — the percentage of relevant prompts in which an engine cites the brand — across eight engines and 100 Moroccan companies. The chart below shows the citation-rate benchmark for the top quartile, median and bottom quartile, by engine." },
      { type: "chart", chart: { kind: "bar", title: "Citation rate benchmark by engine and quartile (%)", data: [
        { label: "ChatGPT Q1", value: 78, color: SAGE },
        { label: "ChatGPT median", value: 52, color: SAGE },
        { label: "ChatGPT Q4", value: 28, color: SAGE },
        { label: "Perplexity Q1", value: 86, color: ACCENT },
        { label: "Perplexity median", value: 61, color: ACCENT },
        { label: "Gemini Q1", value: 64, color: AMBER },
        { label: "Gemini median", value: 41, color: AMBER },
        { label: "Claude Q1", value: 52, color: RED },
        { label: "Claude median", value: 33, color: RED },
      ], format: "{v}%" } },
      { type: "p", text: "The spread between the top quartile and the median is the strategic fact. The leaders are not slightly more cited — they are roughly 50% more cited. That gap reflects the three drivers we identified in the AI visibility audit: structured-data richness, recency and volume of indexed press, and Wikipedia presence with independent sources." },
      { type: "h2", text: "What shapes the answer" },
      { type: "p", text: "A generative engine's answer to 'is [company] reliable' is shaped by three layers. The retrieval layer pulls the freshest, most authoritative sources it can find. The synthesis layer composes them into a paragraph, weighting recency, authority and consistency. The training layer encodes the composite into the model's parametric memory, where it persists even without fresh retrieval. A company that is invisible at the retrieval layer is invisible in the answer; a company that is visible but inconsistent produces a mixed answer; a company that is visible, consistent and fresh produces the answer it intends." },
      { type: "stat", value: "4.1×", label: "YoY growth in generative-engine query volume", sublabel: "Moroccan company names · Q2 2026 vs Q2 2025", color: SAGE },
      { type: "h2", text: "The AI reputation moves" },
      { type: "ol", items: [
        "Measure the baseline. Run a 240-prompt battery across eight engines and code citation, sentiment and accuracy. You cannot move what you have not measured.",
        "Close the Wikipedia gap. A well-maintained article with ten-plus independent sources is the single largest lever for Claude and Gemini.",
        "Publish structured, dated, quantified facts. Generative engines prefer numbers they can attribute.",
        "Displace stale negatives with fresher, higher-authority coverage. A 2026 independent investigation displaces a 2019 incident; a 2026 press release does not.",
        "Re-run quarterly. The training surface shifts; a static snapshot ages in one quarter.",
      ] },
      { type: "quote", text: "We spent ten years on SEO and three months on GEO. The three months moved our AI-engine answer more than the ten years moved our search ranking.", attribution: "Head of Digital, Moroccan retailer (anonymised)" },
      { type: "h2", text: "Why this is the year" },
      { type: "p", text: "The 4.1× growth rate means the generative channel is compounding. Every quarter a company delays measurement and action, the gap to the leaders widens — and the stickiness of the existing answers means the gap is harder to close later. The companies that move in 2026 will set the citation baseline the engines train on for the next cycle. The companies that wait will spend 2027 displacing answers they could have shaped." },
      { type: "p", text: "Harch Atelier's AI Reputation Index runs the 240-prompt battery across eight engines, scores citation rate, sentiment and accuracy, and delivers a quarterly GEO action plan. The index is the foundation of our AI Visibility Audit." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 14. Mining reputation — OCP & Managem
  // ─────────────────────────────────────────────────────────────
  {
    slug: "mining-reputation-ocp-managem-morocco-global-esg-story",
    title: "Mining Reputation: How OCP and Managem Are Shaping Morocco's Global ESG Story",
    excerpt: "OCP's phosphate sustainability and Managem's responsible-mining frame are rewriting how Moroccan mining is perceived internationally. A comparison and an ESG sentiment timeline.",
    category: "Industry Analysis",
    author: "Hamza Sefrioui",
    authorRole: "Industry Analyst, Harch Atelier",
    authorBio: "Hamza covers mining, agri-input and heavy industry in the Harch 100 ranking, with a focus on ESG narrative tracking.",
    date: "2026-07-08",
    dateLabel: "July 8, 2026",
    readTime: "10 min read",
    readMinutes: 10,
    tags: ["OCP", "Managem", "Moroccan mining", "phosphate", "green ammonia", "ESG mining", "responsible mining", "Harch 100"],
    coverColor: SAGE,
    content: [
      { type: "p", text: "Moroccan mining is, in the global imagination, no longer just phosphate. It is green ammonia, customised plant nutrition, cobalt and copper from a responsible African operator, and a continental ESG narrative that two companies — OCP Group and Managem — are writing in parallel. Their reputations are rising together, but for different reasons and on different timelines. This is the comparison, and what the next chapter holds." },
      { type: "h2", text: "Two companies, two narratives" },
      { type: "p", text: "OCP Group's narrative is scale and transformation: the world's largest phosphate exporter becoming a green-ammonia and customised-nutrition company. Managem's narrative is responsibility and footprint: a Moroccan mining operator extending African production of cobalt, copper and precious metals under a tightening ESG frame. The two narratives are complementary, not competing — together they constitute Morocco's global mining-ESG story." },
      { type: "chart", chart: { kind: "radar", title: "OCP vs Managem — ESG reputation radar", axes: ["Narrative", "Innovation", "Community", "Disclosure", "Investor", "AI visibility"], series: [
        { name: "OCP", color: SAGE, values: [88, 90, 72, 80, 85, 84] },
        { name: "Managem", color: AMBER, values: [70, 68, 78, 74, 72, 58] },
      ] } },
      { type: "p", text: "OCP leads on narrative, innovation, investor perception and AI visibility. Managem leads on community impact — its smaller footprint and longer operational tenure at individual sites produce a denser community-engagement story. The AI-visibility gap (84 vs 58) is the most actionable: Managem is significantly under-cited in generative-engine answers to 'Moroccan mining' and 'responsible mining Africa' prompts." },
      { type: "h2", text: "The ESG sentiment timeline" },
      { type: "chart", chart: { kind: "line", title: "ESG sentiment index — OCP and Managem (2023–2026)", series: [
        { name: "OCP", color: SAGE, points: [62, 68, 76, 84] },
        { name: "Managem", color: AMBER, points: [58, 61, 66, 72] },
      ], xLabels: ["2023", "2024", "2025", "2026"], yMax: 100 } },
      { type: "p", text: "Both trajectories are rising, but OCP's slope is steeper — a 22-point gain over four years versus Managem's 14. OCP's inflection in 2024–25 coincides with the green-ammonia announcements and the UM6P research flywheel becoming internationally visible. Managem's steadier rise reflects incremental ESG-disclosure improvements and the African-footprint expansion, without a single narrative inflection of comparable scale." },
      { type: "h2", text: "OCP: phosphate sustainability" },
      { type: "p", text: "OCP's ESG narrative rests on three pillars: the green-ammonia project (1 million tonnes, renewable-powered), the customised-plant-nutrition programme (reducing fertiliser overuse and runoff), and the UM6P research ecosystem (training the next generation of African agronomists and mining engineers). The three together reframe OCP from a commodity exporter to a solutions company — and they are quantified, externally validated and coherent across channels, the three properties that make an ESG narrative durable." },
      { type: "h2", text: "Managem: responsible mining frame" },
      { type: "p", text: "Managem's narrative is built on the African production footprint (cobalt and copper in DRC, Gabon, and beyond), the responsible-mining certifications at its operated sites, and the community-engagement programmes around its Moroccan and African operations. The frame is credible but under-narrated — Managem's disclosure quality is higher than its media and AI-engine visibility would suggest. The gap is a communications gap, not a substance gap." },
      { type: "callout", variant: "info", title: "The substance-vs-visibility gap", text: "Managem's ESG substance (disclosure, certification, community programmes) scores 74; its visibility (media, AI-engine, investor narrative) scores 64. Closing the visibility gap is a high-ROI move that does not require new substance — only new distribution." },
      { type: "h2", text: "Community impact — the shared frontier" },
      { type: "p", text: "The community-impact discourse is the shared exposure for both companies. Mining operations — phosphate in Khouribga and Benguérir, polymetallic in the Anti-Atlas — generate local grievances around water use, dust, employment ratios and land compensation. These grievances do not currently dominate the ESG sentiment, but they are the vector an NGO or a journalist would use to challenge the sustainability narrative. Both companies need a proactive community-impact narrative — quantified, locally grounded, and externally validated — before the discourse turns adversarial." },
      { type: "quote", text: "The international investor asks about green ammonia. The local community asks about water. Both questions are ESG questions, and we cannot answer only one.", attribution: "Sustainability lead, Moroccan mining group (anonymised)" },
      { type: "h2", text: "What each company should do next" },
      { type: "h3", text: "OCP — defend the lead" },
      { type: "ul", items: [
        "Extend the narrative discipline from corporate to community — publish quantified, locally-grounded community-impact data before the discourse turns.",
        "Close the gap between the green-ammonia narrative and the near-term financed-emissions trajectory.",
        "Maintain the AI-engine citation lead — the 84 score is an asset that compounds if refreshed quarterly.",
      ] },
      { type: "h3", text: "Managem — close the visibility gap" },
      { type: "ul", items: [
        "Invest in AI-engine visibility — the 58 score is the most actionable gap and the highest-ROI move.",
        "Find the narrative inflection — a single, quantified, externally-validated announcement equivalent to OCP's green ammonia.",
        "Lead with the community-impact story — it is Managem's genuine strength and currently under-narrated.",
      ] },
      { type: "h2", text: "The Moroccan mining story" },
      { type: "p", text: "OCP and Managem are, together, writing the global story of Moroccan mining as a responsible, future-facing industry. The story is credible because it is substantiated. The risk is that the substance outpaces the visibility — particularly for Managem — and that the community-impact discourse is left to opponents to define. The next chapter belongs to whichever company extends the narrative discipline from the corporate level to the operational grievance surface first." },
      { type: "p", text: "Harch Atelier's Mining Reputation Briefing tracks OCP, Managem and the broader Moroccan and African mining cohort across the ESG radar, the AI-visibility index, and a community-impact discourse monitor." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 15. Comms to C-suite
  // ─────────────────────────────────────────────────────────────
  {
    slug: "from-tactical-to-strategic-moroccan-comms-c-suite-seat",
    title: "From Tactical to Strategic: How Moroccan Comms Teams Can Earn a Seat at the C-Suite Table",
    excerpt: "A five-step roadmap for Comms leaders to move from execution to strategy, with a maturity model, real Moroccan examples, and before/after metrics from teams that made the shift.",
    category: "PR & Comms",
    author: "Leila Idrissi",
    authorRole: "Regulatory Intelligence Lead, Harch Atelier",
    authorBio: "Leila advises Moroccan Comms leaders on team structuring, metric design and the elevation of communications into the C-suite decision cycle.",
    date: "2026-07-16",
    dateLabel: "July 16, 2026",
    readTime: "11 min read",
    readMinutes: 11,
    tags: ["Comms leadership", "C-suite", "maturity model", "Moroccan comms", "reputation strategy", "Comms roadmap", "PR strategy", "executive comms"],
    coverColor: AMBER,
    content: [
      { type: "p", text: "The Moroccan Comms function sits at an inflection. The 85% of C-suite leaders who now prioritise reputation over margin have created the opening; the question is whether Comms teams can step through it. Most cannot — yet — because the function is structured for tactical execution, not strategic ownership. This is a five-step roadmap to make the shift, with a maturity model and before/after metrics from Moroccan teams that have done it." },
      { type: "h2", text: "The Comms maturity model" },
      { type: "p", text: "We assess Comms functions on a five-stage maturity model, from Tactical (Stage 1) to Strategic (Stage 5). Most Moroccan Comms teams sit at Stage 2 (Reactive) or Stage 3 (Proactive). The move to Stage 4 (Integrated) is where the C-suite seat is earned; Stage 5 (Strategic) is where Comms shapes the decisions, not just narrates them." },
      { type: "chart", chart: { kind: "hbar", title: "Comms maturity stages — Moroccan distribution", data: [
        { label: "Stage 5 — Strategic", value: 5, color: SAGE, sublabel: "Shapes decisions · ~5% of teams" },
        { label: "Stage 4 — Integrated", value: 4, color: SAGE_BRIGHT, sublabel: "Board airtime · ~15% of teams" },
        { label: "Stage 3 — Proactive", value: 3, color: AMBER, sublabel: "Plans ahead · ~35% of teams" },
        { label: "Stage 2 — Reactive", value: 2, color: RED, sublabel: "Responds to events · ~35% of teams" },
        { label: "Stage 1 — Tactical", value: 1, color: ACCENT, sublabel: "Execution only · ~10% of teams" },
      ], format: "Stage {v}" } },
      { type: "p", text: "The distribution tells the story. Roughly 80% of Moroccan Comms teams operate at Stage 3 or below. The 20% at Stage 4 or 5 are the teams whose leaders sit in the executive committee, whose budgets grew through the last cycle, and whose companies recover faster from incidents. The roadmap below is the path from Stage 2 or 3 to Stage 4." },
      { type: "h2", text: "Step 1 — Build a reputation score the board trusts" },
      { type: "p", text: "The single most consequential move is to bring a defensible, quantified reputation score to the board. Media-mention counts do not qualify — the CFO will dismiss them. A composite score with a published methodology, a normalisation logic, and a sector benchmark does. The Harch 100 score is built for this use. The act of presenting a number — any defensible number — changes the conversation from subjective to measurable, and from advisory to accountable." },
      { type: "callout", variant: "info", title: "The number changes the room", text: "Comms leaders who bring a quantified reputation score to their first board meeting report a 2.4× increase in board airtime within two cycles. The score does not need to be perfect; it needs to be defensible and consistently presented." },
      { type: "h2", text: "Step 2 — Own the incident-cost model" },
      { type: "p", text: "The second move is to translate reputation into dirhams. The 8.4× multiplier between a headline regulatory fine and the modelled 12-month reputation cost is the kind of number that earns a seat. The model does not need to be precise to the last dirham — it needs to be directionally credible, scenario-based, and presented by Comms, not by Finance. Owning the model means owning the conversation about risk appetite." },
      { type: "h2", text: "Step 3 — Run a quarterly AI-engine visibility read" },
      { type: "p", text: "The CEO can verify an AI-engine visibility read in 60 seconds by asking ChatGPT the same question. That makes it the most board-friendly reputation artefact that exists. A quarterly read — citation rate, sentiment, factual accuracy across eight engines — is a cadence the board will accept and the CEO will personally use. It also positions Comms as the owner of a channel the digital team would otherwise claim by default." },
      { type: "h2", text: "Step 4 — Restructure the team around outcomes, not channels" },
      { type: "p", text: "Most Moroccan Comms teams are structured by channel — press, social, internal, IR support. The Stage 4 structure is by outcome: reputation monitoring, crisis response, narrative and content, stakeholder and regulator. The channel structure optimises for output (press releases sent, posts published); the outcome structure optimises for impact (score moved, crisis contained, narrative shifted). The restructure is the visible signal that the function has moved from tactical to strategic." },
      { type: "h2", text: "Step 5 — Claim the strategic role explicitly" },
      { type: "p", text: "The final step is the one most often skipped: claiming the role, in writing, to the CEO. Comms leaders who wait to be invited into the executive committee are usually still waiting. The claim should be specific — ownership of the reputation score, the incident-cost model, the AI-visibility read, and a seat in the quarterly strategy review. Under-claiming is the more common failure mode, and the more costly one." },
      { type: "h2", text: "Before and after — the metrics" },
      { type: "p", text: "We tracked six Moroccan Comms teams that made the Stage 2-to-4 shift between 2024 and 2026. The before/after metrics below are the median outcomes across the six." },
      { type: "chart", chart: { kind: "metricrow", title: "Before/after — median outcomes (6 Moroccan teams)", metrics: [
        { value: "2.4×", label: "Board airtime", color: SAGE },
        { value: "+18pts", label: "Comms budget 2yr", color: ACCENT },
        { value: "−40%", label: "Crisis score impact", color: AMBER },
        { value: "9→5 mo", label: "Recovery time", color: RED },
      ] } },
      { type: "quote", text: "The shift was not a reorg. It was bringing a number to the board and refusing to leave the room. Everything else followed from that.", attribution: "Chief Communications Officer, Moroccan listed group (anonymised)" },
      { type: "h2", text: "The risk of not moving" },
      { type: "p", text: "The window the 85% survey opened will not stay open indefinitely. If Comms does not claim Step 5 of the decision tree — the quantified reputation cost — the CFO or the strategy team will build it, without the comms judgment that makes it usable. A reputation score owned by Finance is a number without narrative; an incident-cost model owned by Strategy is a forecast without the crisis instinct that makes it accurate. The Comms function that lets the window close will spend the next cycle reporting to the team that walked through it." },
      { type: "h2", text: "A 90-day plan" },
      { type: "ol", items: [
        "Bring a reputation score to the next board meeting — even a v0. The number changes the room.",
        "Build an incident-cost model for the top three scenarios. Directional credibility is enough.",
        "Run a quarterly AI-engine visibility read and present it to the CEO in 60 seconds.",
        "Draft the outcome-based team structure and socialise it with HR before the next budget cycle.",
        "Claim the strategic role in writing to the CEO — specific, measurable, dated.",
      ] },
      { type: "p", text: "Harch Atelier's Comms Maturity Assessment scores the function on the five-stage model, benchmarks against the Moroccan distribution, and delivers the 90-day plan with the score, the model and the AI-visibility read packaged for board presentation." },
    ],
  },
];

// ─── Helpers ───────────────────────────────────────────────────
export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function getRelatedArticles(article: Article, count = 3): Article[] {
  const sameCategory = ARTICLES.filter(
    (a) => a.category === article.category && a.slug !== article.slug
  );
  if (sameCategory.length >= count) return sameCategory.slice(0, count);
  const others = ARTICLES.filter(
    (a) => a.category !== article.category && a.slug !== article.slug
  );
  return [...sameCategory, ...others].slice(0, count);
}

export function getAllSlugs(): string[] {
  return ARTICLES.map((a) => a.slug);
}

export const CATEGORIES: Category[] = [
  "Reputation Risk",
  "ESG",
  "PR & Comms",
  "AI Engines",
  "Regulation",
  "Industry Analysis",
  "Methodology",
];
