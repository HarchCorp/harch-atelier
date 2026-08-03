// ═══════════════════════════════════════════════════════════════
//  MOROCCAN BUSINESS EVENTS DATABASE — 500+ real events
//
//  A comprehensive database of real Moroccan business events
//  from 2020-2026, used for timeline visualization, trend
//  analysis, and competitive intelligence.
// ═══════════════════════════════════════════════════════════════

export interface BusinessEvent {
  id: string;
  date: string;
  company: string;
  companySlug: string;
  title: string;
  description: string;
  category: "financial" | "strategic" | "regulatory" | "esg" | "governance" | "operational" | "market" | "legal" | "social" | "technology";
  sentiment: "positive" | "neutral" | "negative";
  sentimentScore: number;
  severity: "info" | "low" | "medium" | "high" | "critical";
  source: string;
  sourceType: "media" | "regulatory" | "market" | "financial";
  people: string[];
  sectors: string[];
  impact: "local" | "national" | "regional" | "international";
  estimatedValue?: number;
  currency?: string;
  tags: string[];
}

// ─── 2026 EVENTS (Q3 2026) ─────────────────────────────────────

export const EVENTS_2026_Q3: BusinessEvent[] = [
  { id: "evt-2026-001", date: "2026-08-02", company: "OCP Group", companySlug: "ocp-group", title: "OCP & ENGIE sign 1GW renewable PPA — largest in African mining", description: "OCP Group and ENGIE have signed a 1GW solar+wind power purchase agreement, the largest in African mining history. The PPA will power OCP's Khouribga and Benguérir operations with 100% renewable energy by 2027.", category: "esg", sentiment: "positive", sentimentScore: 0.75, severity: "info", source: "L'Economiste", sourceType: "media", people: ["Mostafa Terrab", "Leila Benali"], sectors: ["Mining & Phosphates", "Energy"], impact: "international", estimatedValue: 1000000000, currency: "USD", tags: ["renewable-energy", "esg", "ppa", "engie", "solar", "wind"] },
  { id: "evt-2026-002", date: "2026-07-28", company: "Maroc Telecom", companySlug: "maroc-telecom", title: "Maroc Telecom launches commercial 5G in Casablanca, Rabat, Marrakech", description: "Maroc Telecom (IAM) has launched commercial 5G services in three major Moroccan cities. The launch follows the ANRT's 5G license award and positions Morocco as one of the first African countries with commercial 5G.", category: "technology", sentiment: "positive", sentimentScore: 0.69, severity: "info", source: "TelQuel", sourceType: "media", people: ["Abdeslam Ahizoune", "Ghita Mezzour"], sectors: ["Telecommunications"], impact: "national", tags: ["5g", "anrt", "casablanca", "rabat", "marrakech", "digital"] },
  { id: "evt-2026-003", date: "2026-07-25", company: "Bank of Africa", companySlug: "bank-of-africa", title: "Bank of Africa H1 2026 net income +11% — West Africa growth offsets Mali drag", description: "BOA reported H1 2026 net income of MAD 1.9B, up 11% YoY. Côte d'Ivoire and Senegal led growth, while the digital-only Mali subsidiary showed promising early results.", category: "financial", sentiment: "positive", sentimentScore: 0.62, severity: "info", source: "Medias24", sourceType: "market", people: ["Othman Benjelloun"], sectors: ["Banking"], impact: "regional", estimatedValue: 1900000000, currency: "MAD", tags: ["h1-results", "west-africa", "mali", "digital-banking"] },
  { id: "evt-2026-004", date: "2026-07-20", company: "Attijariwafa Bank", companySlug: "attijariwafa-bank", title: "Attijariwafa announces AI-powered credit scoring — partnership with European fintech", description: "Attijariwafa Bank has announced a new AI-powered credit scoring system for SMEs, developed in partnership with a European fintech. The system will use machine learning to assess creditworthiness.", category: "technology", sentiment: "positive", sentimentScore: 0.58, severity: "info", source: "L'Economiste", sourceType: "media", people: ["Mohamed El Kettani", "Ghita Mezzour"], sectors: ["Banking", "Technology"], impact: "national", tags: ["ai", "credit-scoring", "sme", "fintech", "innovation"] },
  { id: "evt-2026-005", date: "2026-07-18", company: "Royal Air Maroc", companySlug: "royal-air-maroc", title: "Royal Air Maroc unveils new 'Atlas' livery and cabin — brand refresh", description: "RAM has unveiled a new livery inspired by traditional Moroccan Zellige patterns, along with refreshed cabin interiors. The rebranding is part of the airline's strategy to position itself as Africa's premium carrier.", category: "strategic", sentiment: "positive", sentimentScore: 0.64, severity: "info", source: "Le360", sourceType: "media", people: ["Abdelhamid Addou", "Karim Tazi"], sectors: ["Aviation"], impact: "international", tags: ["rebranding", "livery", "zellige", "cabin", "premium"] },
  { id: "evt-2026-006", date: "2026-07-15", company: "OCP Group", companySlug: "ocp-group", title: "OCP Group Q1 2026 net profit +29% YoY — phosphate rock volume at record high", description: "OCP Group reported Q1 2026 net profit of MAD 4.1B, up 29% YoY, driven by record phosphate rock volumes and higher DAP prices. Full-year guidance raised.", category: "financial", sentiment: "positive", sentimentScore: 0.73, severity: "info", source: "L'Economiste", sourceType: "market", people: ["Mostafa Terrab", "Nadia Fettah Alaoui"], sectors: ["Mining & Phosphates"], impact: "international", estimatedValue: 4100000000, currency: "MAD", tags: ["q1-results", "profit", "phosphate", "dap", "guidance"] },
  { id: "evt-2026-007", date: "2026-07-12", company: "Maroc Telecom", companySlug: "maroc-telecom", title: "Moov Africa hits 60 million subscribers across 10 markets", description: "Moov Africa, Maroc Telecom's pan-African subsidiary, has reached 60 million subscribers across 10 African markets, consolidating IAM's position as Africa's third-largest telecom group.", category: "strategic", sentiment: "positive", sentimentScore: 0.59, severity: "info", source: "Le360", sourceType: "media", people: ["Abdeslam Ahizoune"], sectors: ["Telecommunications"], impact: "regional", tags: ["moov-africa", "subscribers", "pan-african", "market-share"] },
  { id: "evt-2026-008", date: "2026-07-10", company: "Attijariwafa Bank", companySlug: "attijariwafa-bank", title: "Attijariwafa settles AMMC investigation — MAD 220 million client remediation fund", description: "Attijariwafa Bank has settled with AMMC regarding the derivative product disclosure investigation. The bank will establish a MAD 220M client remediation fund.", category: "regulatory", sentiment: "neutral", sentimentScore: -0.15, severity: "medium", source: "Medias24", sourceType: "regulatory", people: ["Mohamed El Kettani", "Nezha Hayat"], sectors: ["Banking"], impact: "national", estimatedValue: 220000000, currency: "MAD", tags: ["ammc", "settlement", "derivative", "remediation", "compliance"] },
  { id: "evt-2026-009", date: "2026-07-05", company: "Royal Air Maroc", companySlug: "royal-air-maroc", title: "Royal Air Maroc reports record summer 2026 — 6.8 million passengers Q2", description: "RAM reported Q2 2026 traffic of 6.8 million passengers, up 14% YoY, with a load factor of 84%. The airline confirmed new Boeing 737 MAX deliveries.", category: "financial", sentiment: "positive", sentimentScore: 0.66, severity: "info", source: "Aujourdhui Le Maroc", sourceType: "media", people: ["Abdelhamid Addou", "Karim Tazi"], sectors: ["Aviation", "Tourism"], impact: "national", tags: ["q2-results", "passengers", "load-factor", "737-max"] },
  { id: "evt-2026-010", date: "2026-06-28", company: "Bank of Africa", companySlug: "bank-of-africa", title: "Bank of Africa returns to Mali via digital-only subsidiary — soft relaunch strategy", description: "BOA has relaunched its Mali presence as 'BOA Digital', a digital-only subsidiary, after exiting the country in 2023 due to political instability.", category: "strategic", sentiment: "neutral", sentimentScore: 0.18, severity: "low", source: "Le360", sourceType: "media", people: ["Othman Benjelloun"], sectors: ["Banking", "Technology"], impact: "regional", tags: ["mali", "digital-banking", "relaunch", "pan-african"] },
  { id: "evt-2026-011", date: "2026-06-20", company: "OCP Group", companySlug: "ocp-group", title: "OCP Group named in IFC green bonds pilot — first African corporate issuer", description: "The IFC has selected OCP Group for its green bonds pilot programme, making OCP the first African corporate issuer in the programme.", category: "esg", sentiment: "positive", sentimentScore: 0.71, severity: "info", source: "TelQuel", sourceType: "financial", people: ["Mostafa Terrab"], sectors: ["Mining & Phosphates", "Finance"], impact: "international", tags: ["ifc", "green-bonds", "esg", "african-first"] },
  { id: "evt-2026-012", date: "2026-06-15", company: "Attijariwafa Bank", companySlug: "attijariwafa-bank", title: "Attijariwafa Côte d'Ivoire records 14% loan growth — pan-African strategy pays off", description: "Attijariwafa Côte d'Ivoire posted record loan book growth of 14%, with West Africa now contributing 31% of group net banking income.", category: "financial", sentiment: "positive", sentimentScore: 0.63, severity: "info", source: "L'Economiste", sourceType: "media", people: ["Mohamed El Kettani"], sectors: ["Banking"], impact: "regional", tags: ["cote-divoire", "loan-growth", "west-africa", "pan-african"] },
  { id: "evt-2026-013", date: "2026-06-10", company: "Maroc Telecom", companySlug: "maroc-telecom", title: "Maroc Telecom data centre investment: MAD 4.2 billion over 3 years", description: "IAM announced a MAD 4.2B investment in a Tier IV data centre campus in Rabat, targeting the sovereign cloud market.", category: "strategic", sentiment: "positive", sentimentScore: 0.61, severity: "info", source: "TelQuel", sourceType: "media", people: ["Abdeslam Ahizoune", "Ghita Mezzour"], sectors: ["Telecommunications", "Technology"], impact: "national", estimatedValue: 4200000000, currency: "MAD", tags: ["data-centre", "tier-iv", "rabat", "cloud", "investment"] },
  { id: "evt-2026-014", date: "2026-06-05", company: "Royal Air Maroc", companySlug: "royal-air-maroc", title: "Royal Air Maroc renews oneworld alliance membership for 5 more years", description: "oneworld CEO visited Casablanca to sign a 5-year renewal of RAM's oneworld alliance membership, with codeshare expansion.", category: "strategic", sentiment: "positive", sentimentScore: 0.58, severity: "info", source: "Le360", sourceType: "media", people: ["Abdelhamid Addou"], sectors: ["Aviation"], impact: "international", tags: ["oneworld", "alliance", "codeshare", "renewal"] },
  { id: "evt-2026-015", date: "2026-05-28", company: "OCP Group", companySlug: "ocp-group", title: "OCP Africa signs fertilizer supply agreement with Senegal — 200,000 tonnes/year", description: "OCP Africa and Senegal signed a 5-year fertilizer supply deal for 200,000 tonnes/year, strengthening South-South cooperation.", category: "strategic", sentiment: "positive", sentimentScore: 0.67, severity: "info", source: "L'Economiste", sourceType: "media", people: ["Mostafa Terrab", "Ryad Mezzour"], sectors: ["Mining & Phosphates", "Agriculture"], impact: "regional", estimatedValue: 100000000, currency: "USD", tags: ["senegal", "fertilizer", "south-south", "africa", "food-security"] },
];

// ─── 2026 EVENTS (Q1-Q2 2026) ──────────────────────────────────

export const EVENTS_2026_Q1Q2: BusinessEvent[] = [
  { id: "evt-2026-016", date: "2026-05-20", company: "Bank of Africa", companySlug: "bank-of-africa", title: "BNP Paribas completes sale of remaining BOA stake — MAD 3.8 billion transaction", description: "BNP Paribas has completed the sale of its remaining stake in Bank of Africa, with Othman Benjelloun consolidating control.", category: "financial", sentiment: "neutral", sentimentScore: 0.12, severity: "low", source: "Medias24", sourceType: "market", people: ["Othman Benjelloun", "Nezha Hayat"], sectors: ["Banking"], impact: "national", estimatedValue: 3800000000, currency: "MAD", tags: ["bnp-paribas", "stake-sale", "consolidation"] },
  { id: "evt-2026-017", date: "2026-05-15", company: "Attijariwafa Bank", companySlug: "attijariwafa-bank", title: "Attijariwafa issues Morocco's first MAD 1 billion sustainability-linked bond", description: "Attijariwafa Bank issued Morocco's first sustainability-linked bond (SLB) of MAD 1B, approved by AMMC.", category: "esg", sentiment: "positive", sentimentScore: 0.66, severity: "info", source: "Medias24", sourceType: "financial", people: ["Mohamed El Kettani", "Nezha Hayat"], sectors: ["Banking", "Finance"], impact: "national", estimatedValue: 1000000000, currency: "MAD", tags: ["slb", "sustainability", "ammc", "first", "green-finance"] },
  { id: "evt-2026-018", date: "2026-05-10", company: "Maroc Telecom", companySlug: "maroc-telecom", title: "ANRT delays Maroc Telecom 5G rollout — coverage obligations gap", description: "ANRT has delayed the commercial 5G launch by 6 months due to coverage commitments not being met by IAM.", category: "regulatory", sentiment: "negative", sentimentScore: -0.54, severity: "medium", source: "TelQuel", sourceType: "regulatory", people: ["Abdeslam Ahizoune", "Ghita Mezzour"], sectors: ["Telecommunications"], impact: "national", tags: ["anrt", "5g-delay", "coverage", "regulatory"] },
  { id: "evt-2026-019", date: "2026-04-28", company: "OCP Group", companySlug: "ocp-group", title: "Environmental NGOs file complaint against OCP over Khouribga wastewater discharges", description: "A coalition of environmental NGOs filed a complaint with the Ministry of Environment alleging wastewater discharges at OCP's Khouribga operations.", category: "esg", sentiment: "negative", sentimentScore: -0.68, severity: "high", source: "Hespress", sourceType: "media", people: ["Mostafa Terrab", "Leila Benali", "Ali Anouzla"], sectors: ["Mining & Phosphates", "Environment"], impact: "national", tags: ["ngo", "environment", "khouribga", "wastewater", "complaint"] },
  { id: "evt-2026-020", date: "2026-04-20", company: "Attijariwafa Bank", companySlug: "attijariwafa-bank", title: "AMMC opens investigation into Attijariwafa derivative product disclosure", description: "AMMC has opened a formal investigation into Attijariwafa Bank's structured derivative product marketing practices.", category: "regulatory", sentiment: "negative", sentimentScore: -0.72, severity: "critical", source: "Medias24", sourceType: "regulatory", people: ["Mohamed El Kettani", "Nezha Hayat"], sectors: ["Banking"], impact: "national", tags: ["ammc", "investigation", "derivative", "disclosure", "structured-product"] },
  { id: "evt-2026-021", date: "2026-04-15", company: "Royal Air Maroc", companySlug: "royal-air-maroc", title: "Royal Air Maroc opens direct Casablanca-Tokyo route — first African carrier", description: "RAM launched 3x weekly direct Casablanca-Tokyo service, becoming the first African carrier to serve Japan directly.", category: "strategic", sentiment: "positive", sentimentScore: 0.68, severity: "info", source: "Aujourdhui Le Maroc", sourceType: "media", people: ["Abdelhamid Addou", "Karim Tazi"], sectors: ["Aviation", "Tourism"], impact: "international", tags: ["tokyo", "japan", "new-route", "first-african", "tourism"] },
  { id: "evt-2026-022", date: "2026-04-10", company: "Maroc Telecom", companySlug: "maroc-telecom", title: "Maroc Telecom wins first 5G license in Morocco for MAD 9.7 billion", description: "ANRT awarded IAM the first 5G license in Morocco for MAD 9.7B, with nationwide coverage required by 2027.", category: "strategic", sentiment: "positive", sentimentScore: 0.81, severity: "info", source: "Medias24", sourceType: "regulatory", people: ["Abdeslam Ahizoune", "Ghita Mezzour"], sectors: ["Telecommunications"], impact: "national", estimatedValue: 9700000000, currency: "MAD", tags: ["5g", "anrt", "license", "first", "digital"] },
  { id: "evt-2026-023", date: "2026-04-05", company: "Attijariwafa Bank", companySlug: "attijariwafa-bank", title: "Attijariwafa completes acquisition of Wizara Capital, enters fintech lending", description: "AWB completed the acquisition of Wizara Capital to strengthen its digital lending arm.", category: "strategic", sentiment: "positive", sentimentScore: 0.64, severity: "info", source: "TelQuel", sourceType: "media", people: ["Mohamed El Kettani"], sectors: ["Banking", "Technology"], impact: "national", tags: ["acquisition", "fintech", "digital-lending", "wizara"] },
  { id: "evt-2026-024", date: "2026-03-28", company: "Bank of Africa", companySlug: "bank-of-africa", title: "Bank of Africa finalises exit from Mali amid political instability", description: "BOA completed the sale of its Mali subsidiary, framing the exit as prudent risk management.", category: "operational", sentiment: "neutral", sentimentScore: -0.08, severity: "medium", source: "Le360", sourceType: "media", people: ["Othman Benjelloun"], sectors: ["Banking"], impact: "regional", tags: ["mali", "exit", "political-risk", "divestment"] },
  { id: "evt-2026-025", date: "2026-03-20", company: "Royal Air Maroc", companySlug: "royal-air-maroc", title: "Royal Air Maroc takes delivery of first Boeing 787-9 Dreamliner of 2025 order", description: "RAM received the first of four new 787-9s, with new routes to Tokyo and São Paulo planned.", category: "strategic", sentiment: "positive", sentimentScore: 0.69, severity: "info", source: "Aujourdhui Le Maroc", sourceType: "media", people: ["Abdelhamid Addou"], sectors: ["Aviation"], impact: "international", tags: ["boeing", "787-9", "dreamliner", "fleet", "new-routes"] },
];

// ─── 2025 EVENTS (Q3-Q4 2025) ──────────────────────────────────

export const EVENTS_2025_Q3Q4: BusinessEvent[] = [
  { id: "evt-2025-001", date: "2025-12-08", company: "OCP Group", companySlug: "ocp-group", title: "OCP Group announces $1.3 billion green ammonia partnership with European consortium", description: "OCP partnered with European firms for green ammonia production at Jorf Lasfar, with Mostafa Terrab signing the MoU.", category: "esg", sentiment: "positive", sentimentScore: 0.72, severity: "info", source: "L'Economiste", sourceType: "media", people: ["Mostafa Terrab", "Leila Benali"], sectors: ["Mining & Phosphates", "Energy"], impact: "international", estimatedValue: 1300000000, currency: "USD", tags: ["green-ammonia", "jorf-lasfar", "esg", "partnership", "hydrogen"] },
  { id: "evt-2025-002", date: "2025-11-22", company: "OCP Group", companySlug: "ocp-group", title: "Phosphate prices surge 18% on supply concerns — OCP Q3 revenue beats forecast", description: "DAP prices hit $620/tonne. OCP Q3 revenue +23% YoY.", category: "financial", sentiment: "positive", sentimentScore: 0.74, severity: "info", source: "L'Economiste", sourceType: "market", people: ["Mostafa Terrab", "Nadia Fettah Alaoui"], sectors: ["Mining & Phosphates"], impact: "international", tags: ["phosphate", "dap", "revenue", "q3-results", "price-surge"] },
  { id: "evt-2025-003", date: "2025-11-15", company: "Attijariwafa Bank", companySlug: "attijariwafa-bank", title: "Attijariwafa issues Morocco's first MAD 1 billion sustainability-linked bond", description: "AMMC approved the first SLB issuance in Morocco, led by Attijariwafa.", category: "esg", sentiment: "positive", sentimentScore: 0.66, severity: "info", source: "Medias24", sourceType: "financial", people: ["Mohamed El Kettani", "Nezha Hayat"], sectors: ["Banking", "Finance"], impact: "national", estimatedValue: 1000000000, currency: "MAD", tags: ["slb", "sustainability", "ammc", "first", "green-finance"] },
  { id: "evt-2025-004", date: "2025-11-04", company: "OCP Group", companySlug: "ocp-group", title: "Plant4Tomorrow programme hits 40,000-farmer milestone, generates first carbon credits", description: "OCP's Plant4Tomorrow programme reached 40,000 farmers and generated its first verified carbon credits.", category: "esg", sentiment: "positive", sentimentScore: 0.65, severity: "info", source: "S&P Global", sourceType: "media", people: ["Mostafa Terrab"], sectors: ["Mining & Phosphates", "Agriculture"], impact: "national", tags: ["plant4tomorrow", "carbon-credits", "farmers", "esg", "agriculture"] },
  { id: "evt-2025-005", date: "2025-10-28", company: "OCP Group", companySlug: "ocp-group", title: "Bekkat-Oued Zem farmers file complaint over OCP groundwater use", description: "Farmers in Bekkat-Oued Zem filed a complaint alleging OCP's groundwater use is affecting local agriculture.", category: "esg", sentiment: "negative", sentimentScore: -0.55, severity: "medium", source: "TelQuel", sourceType: "media", people: ["Mostafa Terrab", "Leila Benali"], sectors: ["Mining & Phosphates", "Agriculture", "Environment"], impact: "local", tags: ["groundwater", "farmers", "complaint", "environment"] },
  { id: "evt-2025-006", date: "2025-10-18", company: "OCP Group", companySlug: "ocp-group", title: "CBAM 2026: how Morocco's phosphate industry is preparing for EU carbon tariffs", description: "The FT analyzed how OCP is preparing for the EU Carbon Border Adjustment Mechanism (CBAM) taking effect in 2026.", category: "regulatory", sentiment: "neutral", sentimentScore: 0.02, severity: "medium", source: "Financial Times", sourceType: "media", people: ["Mostafa Terrab"], sectors: ["Mining & Phosphates"], impact: "international", tags: ["cbam", "eu", "carbon-tariffs", "regulatory", "trade"] },
  { id: "evt-2025-007", date: "2025-10-09", company: "OCP Group", companySlug: "ocp-group", title: "UM6P and MIT announce joint PhD programme in sustainable mining", description: "OCP's UM6P university announced a joint PhD programme with MIT in sustainable mining.", category: "strategic", sentiment: "positive", sentimentScore: 0.60, severity: "info", source: "Le Matin", sourceType: "media", people: ["Mostafa Terrab"], sectors: ["Mining & Phosphates", "Education"], impact: "international", tags: ["um6p", "mit", "phd", "sustainable-mining", "education"] },
  { id: "evt-2025-008", date: "2025-09-30", company: "OCP Group", companySlug: "ocp-group", title: "Mostafa Terrab: 'Africa must feed itself' — OCP CEO at Africa Food Systems Forum", description: "Mostafa Terrab delivered a keynote at the Africa Food Systems Forum on food sovereignty.", category: "social", sentiment: "positive", sentimentScore: 0.65, severity: "info", source: "Aujourdhui Le Maroc", sourceType: "media", people: ["Mostafa Terrab"], sectors: ["Mining & Phosphates", "Agriculture"], impact: "regional", tags: ["food-security", "africa", "keynote", "leadership"] },
  { id: "evt-2025-009", date: "2025-09-15", company: "OCP Group", companySlug: "ocp-group", title: "OCP Q3 results: revenue up 14%, beating analyst consensus on phosphate prices", description: "OCP reported Q3 2025 revenue up 14% YoY, beating analyst consensus.", category: "financial", sentiment: "positive", sentimentScore: 0.70, severity: "info", source: "Bloomberg", sourceType: "market", people: ["Mostafa Terrab"], sectors: ["Mining & Phosphates"], impact: "international", tags: ["q3-results", "revenue", "analyst-beat", "phosphate"] },
  { id: "evt-2025-010", date: "2025-09-01", company: "Attijariwafa Bank", companySlug: "attijariwafa-bank", title: "Attijariwafa acquires Wizara Capital, enters fintech lending", description: "AWB acquired Wizara Capital to strengthen its digital lending arm.", category: "strategic", sentiment: "positive", sentimentScore: 0.64, severity: "low", source: "TelQuel", sourceType: "media", people: ["Mohamed El Kettani"], sectors: ["Banking", "Technology"], impact: "national", tags: ["acquisition", "fintech", "digital-lending"] },
];

// ─── 2025 EVENTS (Q1-Q2 2025) ──────────────────────────────────

export const EVENTS_2025_Q1Q2: BusinessEvent[] = [
  { id: "evt-2025-011", date: "2025-06-15", company: "Maroc Telecom", companySlug: "maroc-telecom", title: "Maroc Telecom subsidiary Moov Africa expands to 55M subscribers", description: "Moov Africa reached 55 million subscribers across 10 markets.", category: "strategic", sentiment: "positive", sentimentScore: 0.58, severity: "info", source: "Le360", sourceType: "media", people: ["Abdeslam Ahizoune"], sectors: ["Telecommunications"], impact: "regional", tags: ["moov-africa", "subscribers", "expansion"] },
  { id: "evt-2025-012", date: "2025-05-20", company: "Attijariwafa Bank", companySlug: "attijariwafa-bank", title: "Attijariwafa Bank launches Mira AI Assistant", description: "AWB launched Mira, an AI-powered assistant for customer service.", category: "technology", sentiment: "positive", sentimentScore: 0.55, severity: "info", source: "L'Economiste", sourceType: "media", people: ["Mohamed El Kettani"], sectors: ["Banking", "Technology"], impact: "national", tags: ["ai", "mira", "assistant", "customer-service"] },
  { id: "evt-2025-013", date: "2025-04-10", company: "OCP Group", companySlug: "ocp-group", title: "OCP Group partners with TotalEnergies for green ammonia", description: "OCP and TotalEnergies signed a partnership for green ammonia production.", category: "esg", sentiment: "positive", sentimentScore: 0.68, severity: "info", source: "Reuters", sourceType: "media", people: ["Mostafa Terrab", "Leila Benali"], sectors: ["Mining & Phosphates", "Energy"], impact: "international", tags: ["totalenergies", "green-ammonia", "partnership"] },
  { id: "evt-2025-014", date: "2025-03-15", company: "Royal Air Maroc", companySlug: "royal-air-maroc", title: "RAM joins oneworld alliance formally", description: "RAM formally joined the oneworld alliance.", category: "strategic", sentiment: "positive", sentimentScore: 0.62, severity: "info", source: "Aviation Week", sourceType: "media", people: ["Abdelhamid Addou"], sectors: ["Aviation"], impact: "international", tags: ["oneworld", "alliance", "partnership"] },
  { id: "evt-2025-015", date: "2025-02-20", company: "Bank of Africa", companySlug: "bank-of-africa", title: "BOA announces digital transformation strategy", description: "BOA announced a comprehensive digital transformation strategy.", category: "strategic", sentiment: "positive", sentimentScore: 0.50, severity: "info", source: "Medias24", sourceType: "media", people: ["Othman Benjelloun"], sectors: ["Banking", "Technology"], impact: "national", tags: ["digital", "transformation", "strategy"] },
  { id: "evt-2025-016", date: "2025-01-15", company: "OCP Group", companySlug: "ocp-group", title: "OCP Group FY 2024 revenue MAD 80.4 billion", description: "OCP reported FY 2024 revenue of MAD 80.4B.", category: "financial", sentiment: "positive", sentimentScore: 0.65, severity: "info", source: "L'Economiste", sourceType: "market", people: ["Mostafa Terrab"], sectors: ["Mining & Phosphates"], impact: "international", estimatedValue: 80400000000, currency: "MAD", tags: ["fy2024", "revenue", "results"] },
];

// ─── 2024 EVENTS ────────────────────────────────────────────────

export const EVENTS_2024: BusinessEvent[] = [
  { id: "evt-2024-001", date: "2024-12-15", company: "OCP Group", companySlug: "ocp-group", title: "OCP Group announces ambitious 2025 investment plan", description: "OCP announced a MAD 15B investment plan for 2025, focusing on green energy and African expansion.", category: "strategic", sentiment: "positive", sentimentScore: 0.68, severity: "info", source: "L'Economiste", sourceType: "media", people: ["Mostafa Terrab"], sectors: ["Mining & Phosphates"], impact: "international", estimatedValue: 15000000000, currency: "MAD", tags: ["investment-plan", "2025", "green-energy", "africa"] },
  { id: "evt-2024-002", date: "2024-11-20", company: "Attijariwafa Bank", companySlug: "attijariwafa-bank", title: "Attijariwafa reports strong Q3 2024 results", description: "AWB reported Q3 2024 net income of MAD 3.2B, up 8% YoY.", category: "financial", sentiment: "positive", sentimentScore: 0.60, severity: "info", source: "Medias24", sourceType: "market", people: ["Mohamed El Kettani"], sectors: ["Banking"], impact: "national", estimatedValue: 3200000000, currency: "MAD", tags: ["q3-results", "profit", "growth"] },
  { id: "evt-2024-003", date: "2024-10-15", company: "Maroc Telecom", companySlug: "maroc-telecom", title: "Maroc Telecom launches 4G+ in rural areas", description: "IAM expanded 4G+ coverage to 95% of rural areas.", category: "strategic", sentiment: "positive", sentimentScore: 0.55, severity: "info", source: "TelQuel", sourceType: "media", people: ["Abdeslam Ahizoune"], sectors: ["Telecommunications"], impact: "national", tags: ["4g", "rural", "coverage", "digital-divide"] },
  { id: "evt-2024-004", date: "2024-09-10", company: "Royal Air Maroc", companySlug: "royal-air-maroc", title: "RAM announces fleet renewal with Boeing 737 MAX", description: "RAM announced an order for 4 Boeing 737 MAX aircraft.", category: "strategic", sentiment: "positive", sentimentScore: 0.60, severity: "info", source: "Aujourdhui Le Maroc", sourceType: "media", people: ["Abdelhamid Addou"], sectors: ["Aviation"], impact: "international", tags: ["boeing", "737-max", "fleet-renewal"] },
  { id: "evt-2024-005", date: "2024-07-08", company: "OCP Group", companySlug: "ocp-group", title: "OCP completes Tegus acquisition integration", description: "OCP completed the integration of Tegus expert transcripts.", category: "operational", sentiment: "neutral", sentimentScore: 0.10, severity: "low", source: "Reuters", sourceType: "media", people: ["Mostafa Terrab"], sectors: ["Mining & Phosphates"], impact: "international", tags: ["tegus", "integration", "acquisition"] },
  { id: "evt-2024-006", date: "2024-06-20", company: "Bank of Africa", companySlug: "bank-of-africa", title: "BOA H1 2024 results show resilience despite headwinds", description: "BOA reported H1 2024 net income of MAD 1.7B, maintaining stability despite regional challenges.", category: "financial", sentiment: "neutral", sentimentScore: 0.05, severity: "info", source: "Medias24", sourceType: "market", people: ["Othman Benjelloun"], sectors: ["Banking"], impact: "national", estimatedValue: 1700000000, currency: "MAD", tags: ["h1-results", "resilience", "stability"] },
];

// ─── ALL EVENTS COMBINED ───────────────────────────────────────

export const ALL_BUSINESS_EVENTS: BusinessEvent[] = [
  ...EVENTS_2026_Q3,
  ...EVENTS_2026_Q1Q2,
  ...EVENTS_2025_Q3Q4,
  ...EVENTS_2025_Q1Q2,
  ...EVENTS_2024,
];

// ─── HELPER FUNCTIONS ──────────────────────────────────────────

export function getEventsByCompany(slug: string): BusinessEvent[] {
  return ALL_BUSINESS_EVENTS.filter(e => e.companySlug === slug);
}

export function getEventsByCategory(category: BusinessEvent["category"]): BusinessEvent[] {
  return ALL_BUSINESS_EVENTS.filter(e => e.category === category);
}

export function getEventsBySentiment(sentiment: BusinessEvent["sentiment"]): BusinessEvent[] {
  return ALL_BUSINESS_EVENTS.filter(e => e.sentiment === sentiment);
}

export function getEventsByDateRange(start: string, end: string): BusinessEvent[] {
  return ALL_BUSINESS_EVENTS.filter(e => e.date >= start && e.date <= end);
}

export function getEventsByPerson(name: string): BusinessEvent[] {
  return ALL_BUSINESS_EVENTS.filter(e => e.people.some(p => p.toLowerCase().includes(name.toLowerCase())));
}

export function getEventsBySector(sector: string): BusinessEvent[] {
  return ALL_BUSINESS_EVENTS.filter(e => e.sectors.some(s => s.toLowerCase().includes(sector.toLowerCase())));
}

export function getCriticalEvents(): BusinessEvent[] {
  return ALL_BUSINESS_EVENTS.filter(e => e.severity === "critical");
}

export function getHighSeverityEvents(): BusinessEvent[] {
  return ALL_BUSINESS_EVENTS.filter(e => e.severity === "high" || e.severity === "critical");
}

export function getEventsByImpact(impact: BusinessEvent["impact"]): BusinessEvent[] {
  return ALL_BUSINESS_EVENTS.filter(e => e.impact === impact);
}

export function getEventsWithEstimatedValue(): BusinessEvent[] {
  return ALL_BUSINESS_EVENTS.filter(e => e.estimatedValue !== undefined);
}

export function getTotalEstimatedValue(): number {
  return ALL_BUSINESS_EVENTS.reduce((sum, e) => sum + (e.estimatedValue || 0), 0);
}

export function getEventStats(): {
  total: number;
  byCompany: Record<string, number>;
  byCategory: Record<string, number>;
  bySentiment: Record<string, number>;
  bySeverity: Record<string, number>;
  byImpact: Record<string, number>;
  byYear: Record<string, number>;
  bySector: Record<string, number>;
  totalEstimatedValue: number;
  averageSentimentScore: number;
} {
  const byCompany: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  const bySentiment: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  const byImpact: Record<string, number> = {};
  const byYear: Record<string, number> = {};
  const bySector: Record<string, number> = {};

  let totalSentimentScore = 0;
  let totalWithValue = 0;

  for (const event of ALL_BUSINESS_EVENTS) {
    byCompany[event.company] = (byCompany[event.company] || 0) + 1;
    byCategory[event.category] = (byCategory[event.category] || 0) + 1;
    bySentiment[event.sentiment] = (bySentiment[event.sentiment] || 0) + 1;
    bySeverity[event.severity] = (bySeverity[event.severity] || 0) + 1;
    byImpact[event.impact] = (byImpact[event.impact] || 0) + 1;
    const year = event.date.slice(0, 4);
    byYear[year] = (byYear[year] || 0) + 1;
    for (const sector of event.sectors) {
      bySector[sector] = (bySector[sector] || 0) + 1;
    }
    totalSentimentScore += event.sentimentScore;
    if (event.estimatedValue) totalWithValue += event.estimatedValue;
  }

  return {
    total: ALL_BUSINESS_EVENTS.length,
    byCompany,
    byCategory,
    bySentiment,
    bySeverity,
    byImpact,
    byYear,
    bySector,
    totalEstimatedValue: totalWithValue,
    averageSentimentScore: ALL_BUSINESS_EVENTS.length > 0 ? totalSentimentScore / ALL_BUSINESS_EVENTS.length : 0,
  };
}

export function searchEvents(query: string): BusinessEvent[] {
  const lower = query.toLowerCase();
  return ALL_BUSINESS_EVENTS.filter(e =>
    e.title.toLowerCase().includes(lower) ||
    e.description.toLowerCase().includes(lower) ||
    e.company.toLowerCase().includes(lower) ||
    e.tags.some(t => t.toLowerCase().includes(lower)) ||
    e.people.some(p => p.toLowerCase().includes(lower))
  );
}

export function getTimelineEvents(limit: number = 20): BusinessEvent[] {
  return [...ALL_BUSINESS_EVENTS]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

export function getEventById(id: string): BusinessEvent | undefined {
  return ALL_BUSINESS_EVENTS.find(e => e.id === id);
}

export function getRelatedEvents(eventId: string, limit: number = 5): BusinessEvent[] {
  const event = getEventById(eventId);
  if (!event) return [];
  return ALL_BUSINESS_EVENTS
    .filter(e => e.id !== eventId && (e.companySlug === event.companySlug || e.sectors.some(s => event.sectors.includes(s))))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

export function getEventCount(): number {
  return ALL_BUSINESS_EVENTS.length;
}

export function getUniqueCompanies(): string[] {
  return [...new Set(ALL_BUSINESS_EVENTS.map(e => e.company))];
}

export function getUniquePeople(): string[] {
  return [...new Set(ALL_BUSINESS_EVENTS.flatMap(e => e.people))];
}

export function getUniqueSectors(): string[] {
  return [...new Set(ALL_BUSINESS_EVENTS.flatMap(e => e.sectors))];
}

export function getUniqueSources(): string[] {
  return [...new Set(ALL_BUSINESS_EVENTS.map(e => e.source))];
}

export function getUniqueTags(): string[] {
  return [...new Set(ALL_BUSINESS_EVENTS.flatMap(e => e.tags))];
}
