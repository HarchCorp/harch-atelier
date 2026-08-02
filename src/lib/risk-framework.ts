// ═══════════════════════════════════════════════════════════════
//  HARCH 32-CATEGORY RISK FRAMEWORK
//
//  The complete risk taxonomy used by Harch Atelier to assess
//  corporate reputation risk. Each category has:
//    - Definition and scope
//    - Scoring criteria (0-100)
//    - Weight (importance in overall risk)
//    - Indicators (what signals to look for)
//    - Mitigation recommendations
//
//  This framework is inspired by:
//    - COSO ERM (Enterprise Risk Management)
//    - ISO 31000 (Risk Management)
//    - NIST Cybersecurity Framework
//    - Moroccan AMMC risk guidelines
//    - World Economic Forum Global Risks Report
// ═══════════════════════════════════════════════════════════════

// ─── TYPES ─────────────────────────────────────────────────────

export interface RiskCategory {
  id: string;
  name: string;
  nameFr: string;
  nameAr: string;
  group: RiskGroup;
  weight: number; // 0.0 to 1.0 — importance in overall score
  definition: string;
  scope: string;
  scoringCriteria: {
    low: string; // 0-29
    moderate: string; // 30-44
    elevated: string; // 45-59
    high: string; // 60-79
    critical: string; // 80-100
  };
  indicators: string[];
  mitigation: string[];
  dataSources: string[];
  refreshCycle: "real-time" | "hourly" | "daily" | "weekly" | "monthly";
}

export type RiskGroup =
  | "governance"
  | "financial"
  | "operational"
  | "strategic"
  | "compliance"
  | "digital"
  | "environmental"
  | "social";

export interface RiskAssessmentResult {
  categoryId: string;
  score: number; // 0-100
  level: RiskLevel;
  trajectory: "rising" | "stable" | "falling";
  confidence: number; // 0.0 to 1.0
  evidence: Array<{
    source: string;
    date: string;
    snippet: string;
    weight: number;
  }>;
  recommendation: string;
}

export type RiskLevel = "low" | "moderate" | "elevated" | "high" | "critical";

// ─── RISK GROUPS ───────────────────────────────────────────────

export const RISK_GROUPS: Record<RiskGroup, { name: string; nameFr: string; color: string; description: string }> = {
  governance: {
    name: "Governance",
    nameFr: "Gouvernance",
    color: "#856914",
    description: "Board structure, executive compensation, shareholder rights, transparency",
  },
  financial: {
    name: "Financial",
    nameFr: "Financier",
    color: "#0369A1",
    description: "Revenue, profitability, debt, liquidity, credit rating, accounting practices",
  },
  operational: {
    name: "Operational",
    nameFr: "Opérationnel",
    color: "#7C3AED",
    description: "Supply chain, production, logistics, human resources, quality control",
  },
  strategic: {
    name: "Strategic",
    nameFr: "Stratégique",
    color: "#BE185D",
    description: "Market position, competitive landscape, innovation, M&A, business model",
  },
  compliance: {
    name: "Compliance",
    nameFr: "Conformité",
    color: "#DC2626",
    description: "Regulatory, legal, sanctions, anti-corruption, data protection",
  },
  digital: {
    name: "Digital",
    nameFr: "Numérique",
    color: "#059669",
    description: "Cybersecurity, data privacy, AI/ML governance, digital transformation",
  },
  environmental: {
    name: "Environmental",
    nameFr: "Environnemental",
    color: "#4A7B5F",
    description: "Emissions, resource use, biodiversity, climate change, ESG",
  },
  social: {
    name: "Social",
    nameFr: "Social",
    color: "#D97706",
    description: "Labor practices, human rights, community relations, diversity, health & safety",
  },
};

// ─── THE 32 RISK CATEGORIES ────────────────────────────────────

export const RISK_CATEGORIES: RiskCategory[] = [
  // ═══ GOVERNANCE (5 categories) ═══════════════════════════════
  {
    id: "GOV-001",
    name: "Board Structure & Independence",
    nameFr: "Structure du Conseil & Indépendance",
    nameAr: "هيئة المجلس والاستقلالية",
    group: "governance",
    weight: 0.08,
    definition: "Assessment of board composition, independence of directors, separation of CEO/Chair roles, and board diversity.",
    scope: "Board structure, director independence, committee composition, governance code adherence",
    scoringCriteria: {
      low: "Independent directors >50%, separate CEO/Chair, active committees",
      moderate: "Independent directors 33-50%, some committee gaps",
      elevated: "Independent directors 25-33%, CEO/Chair combined, weak committees",
      high: "Independent directors <25%, no separation of powers, no committees",
      critical: "No independent directors, family-controlled board, zero transparency",
    },
    indicators: [
      "Board composition (independent vs. executive directors)",
      "CEO/Chairman separation",
      "Audit committee existence and independence",
      "Nomination committee existence",
      "Remuneration committee existence",
      "Board meeting frequency and attendance",
      "Director tenure and rotation",
      "Board diversity (gender, age, expertise)",
    ],
    mitigation: [
      "Appoint independent directors to reach >50% threshold",
      "Separate CEO and Chairman roles",
      "Establish active audit, nomination, and remuneration committees",
      "Publish board charter and governance code",
      "Implement director term limits (max 9 years)",
      "Ensure minimum 30% gender diversity",
    ],
    dataSources: ["AMMC filings", "Company annual reports", "Corporate governance reports", "Proxy statements"],
    refreshCycle: "monthly",
  },
  {
    id: "GOV-002",
    name: "Executive Compensation",
    nameFr: "Rémunération des Dirigeants",
    nameAr: "تعويضات المديرين",
    group: "governance",
    weight: 0.06,
    definition: "Analysis of executive pay packages, pay-for-performance alignment, and compensation transparency.",
    scope: "CEO/CFO pay, bonus structures, equity compensation, severance packages, pay ratios",
    scoringCriteria: {
      low: "Pay aligned with performance, transparent disclosure, reasonable ratios",
      moderate: "Some pay-for-performance gaps, partial disclosure",
      elevated: "Pay exceeds peer median without clear performance link",
      high: "Excessive pay, poor disclosure, no say-on-pay",
      critical: "Outrageous pay, zero transparency, shareholder opposition",
    },
    indicators: [
      "CEO-to-median-worker pay ratio",
      "Bonus as % of total compensation",
      "Equity grant practices",
      "Severance/golden parachute terms",
      "Say-on-pay vote results",
      "Compensation committee independence",
      "Peer benchmarking transparency",
      "Performance metric alignment",
    ],
    mitigation: [
      "Implement say-on-pay annual vote",
      "Cap severance at 2x annual salary",
      "Publish compensation philosophy",
      "Align bonus metrics with long-term strategy",
      "Benchmark against peer group",
      "Disclose pay ratio",
    ],
    dataSources: ["AMMC filings", "Proxy statements", "Company remuneration reports"],
    refreshCycle: "monthly",
  },
  {
    id: "GOV-003",
    name: "Shareholder Rights & Activism",
    nameFr: "Droits des Actionnaires & Activisme",
    nameAr: "حقوق المساهمين والنشاط",
    group: "governance",
    weight: 0.07,
    definition: "Evaluation of shareholder rights, voting mechanisms, and vulnerability to activist campaigns.",
    scope: "Voting rights, proxy access, shareholder proposals, dual-class structures, activist vulnerability",
    scoringCriteria: {
      low: "One share/one vote, easy proxy access, responsive to shareholders",
      moderate: "Standard voting rights, some barriers to proposals",
      elevated: "Staggered board, supermajority requirements",
      high: "Dual-class shares, high proposal thresholds",
      critical: "Concentrated control, no minority protections",
    },
    indicators: [
      "Share class structure (single vs. dual)",
      "Proxy access rules",
      "Shareholder proposal thresholds",
      "Staggered vs. annual board elections",
      "Supermajority voting requirements",
      "Poison pill existence",
      "Activist investor presence",
      "Institutional ownership concentration",
    ],
    mitigation: [
      "Adopt one share/one vote principle",
      "Lower shareholder proposal threshold to 3%",
      "Eliminate staggered board",
      "Remove supermajority requirements",
      "Allow proxy access",
      "Engage proactively with activists",
    ],
    dataSources: ["AMMC filings", "Company bylaws", "Proxy statements", "Institutional ownership filings"],
    refreshCycle: "monthly",
  },
  {
    id: "GOV-004",
    name: "Transparency & Disclosure",
    nameFr: "Transparence & Divulgation",
    nameAr: "الشفافية والإفصاح",
    group: "governance",
    weight: 0.09,
    definition: "Quality and timeliness of corporate disclosure, financial reporting, and stakeholder communication.",
    scope: "Financial reporting quality, timeliness, materiality disclosure, related-party transactions",
    scoringCriteria: {
      low: "Timely, complete, clear disclosure; proactive communication",
      moderate: "Standard disclosure, some delays or gaps",
      elevated: "Frequent late filings, material omissions",
      high: "Restatements, regulatory enforcement, opacity",
      critical: "Fraud, intentional concealment, regulatory sanctions",
    },
    indicators: [
      "Filing timeliness (on-time vs. late)",
      "Financial statement restatements",
      "Related-party transaction disclosure",
      "Management discussion quality",
      "Risk factor specificity",
      "Segment reporting granularity",
      "ESG reporting quality",
      "Analyst guidance accuracy",
    ],
    mitigation: [
      "Implement real-time disclosure portal",
      "Engage independent auditor for quarterly reviews",
      "Publish ESG report aligned with GRI/SASB",
      "Conduct annual disclosure audit",
      "Train IR team on materiality assessment",
      "Publish related-party transaction register",
    ],
    dataSources: ["AMMC filings", "Financial statements", "ESG reports", "Analyst reports"],
    refreshCycle: "daily",
  },
  {
    id: "GOV-005",
    name: "Ethics & Anti-Corruption",
    nameFr: "Éthique & Anti-Corruption",
    nameAr: "الأخلاق ومكافحة الفساد",
    group: "governance",
    weight: 0.10,
    definition: "Assessment of ethics policies, anti-corruption controls, whistleblower protections, and compliance culture.",
    scope: "Code of conduct, anti-bribery policies, whistleblower channels, training, enforcement",
    scoringCriteria: {
      low: "Robust ethics program, anonymous whistleblower, regular training, zero incidents",
      moderate: "Written policies, some training, minor incidents",
      elevated: "Policy gaps, limited training, recurring incidents",
      high: "No whistleblower channel, corruption allegations",
      critical: "Systemic corruption, regulatory convictions, no controls",
    },
    indicators: [
      "Code of conduct existence and quality",
      "Anti-bribery/anti-corruption (ABAC) policy",
      "Whistleblower channel existence and anonymity",
      "Ethics training completion rates",
      "Corruption incidents/reports",
      "Regulatory enforcement actions",
      "Third-party due diligence practices",
      "Political contribution transparency",
    ],
    mitigation: [
      "Implement anonymous whistleblower hotline",
      "Conduct annual ABAC training (100% employees)",
      "Perform third-party due diligence on all agents",
      "Publish ethics annual report",
      "Establish ethics committee with independent oversight",
      "Zero-tolerance enforcement policy",
    ],
    dataSources: ["AMMC filings", "Transparency International", "Court records", "Press reports"],
    refreshCycle: "weekly",
  },

  // ═══ FINANCIAL (5 categories) ════════════════════════════════
  {
    id: "FIN-001",
    name: "Revenue & Profitability",
    nameFr: "Chiffre d'Affaires & Rentabilité",
    nameAr: "الإيرادات والربحية",
    group: "financial",
    weight: 0.08,
    definition: "Analysis of revenue trends, growth, margin stability, and earnings quality.",
    scope: "Revenue growth, gross/operating/net margins, earnings quality, revenue concentration",
    scoringCriteria: {
      low: "Stable growth, margins above peer median, high earnings quality",
      moderate: "Moderate growth, margins in line with peers",
      elevated: "Declining growth, margin compression, earnings quality concerns",
      high: "Revenue decline, negative margins, restatements",
      critical: "Revenue collapse, massive losses, going-concern doubt",
    },
    indicators: [
      "Revenue growth (YoY, 3Y CAGR)",
      "Gross margin trend",
      "Operating margin trend",
      "Net margin trend",
      "EBITDA margin",
      "Revenue concentration (top 10 clients)",
      "Earnings quality (accruals ratio)",
      "Revenue recognition practices",
    ],
    mitigation: [
      "Diversify client base (top 10 < 50% revenue)",
      "Improve cost structure",
      "Implement robust revenue recognition policy",
      "Conduct annual earnings quality audit",
      "Provide transparent forward guidance",
      "Build margin resilience through automation",
    ],
    dataSources: ["Financial statements", "BVC filings", "Analyst reports", "AMMC disclosures"],
    refreshCycle: "daily",
  },
  {
    id: "FIN-002",
    name: "Debt & Leverage",
    nameFr: "Dette & Levier",
    nameAr: "الديون والرفع المالي",
    group: "financial",
    weight: 0.07,
    definition: "Assessment of debt levels, leverage ratios, debt service capacity, and refinancing risk.",
    scope: "Total debt, debt-to-equity, interest coverage, debt maturity profile, credit rating",
    scoringCriteria: {
      low: "Low leverage, strong coverage, investment-grade rating",
      moderate: "Moderate leverage, adequate coverage",
      elevated: "High leverage, thin coverage, near-term maturities",
      high: "Excessive leverage, weak coverage, refinancing risk",
      critical: "Distressed debt, default imminent, junk rating",
    },
    indicators: [
      "Debt-to-equity ratio",
      "Net debt-to-EBITDA",
      "Interest coverage ratio",
      "Debt maturity profile",
      "Credit rating (Moody's/S&P/Fitch)",
      "Refinancing risk (near-term maturities)",
      "Covenant headroom",
      "Off-balance-sheet liabilities",
    ],
    mitigation: [
      "Reduce leverage to target ratio",
      "Extend debt maturity profile",
      "Maintain covenant headroom >20%",
      "Diversify funding sources",
      "Build cash reserves for 6 months operations",
      "Pursue credit rating improvement",
    ],
    dataSources: ["Financial statements", "Credit rating agencies", "Bond prospectuses", "BVC filings"],
    refreshCycle: "daily",
  },
  {
    id: "FIN-003",
    name: "Liquidity & Cash Flow",
    nameFr: "Liquidité & Flux de Trésorerie",
    nameAr: "السيولة والتدفقات النقدية",
    group: "financial",
    weight: 0.06,
    definition: "Evaluation of short-term liquidity, cash flow generation, and working capital management.",
    scope: "Current ratio, quick ratio, cash flow from operations, free cash flow, working capital",
    scoringCriteria: {
      low: "Strong liquidity, positive free cash flow, efficient working capital",
      moderate: "Adequate liquidity, stable cash flows",
      elevated: "Tight liquidity, declining cash flows",
      high: "Negative cash flow, liquidity crisis",
      critical: "Insolvency risk, bank covenant breach",
    },
    indicators: [
      "Current ratio",
      "Quick ratio",
      "Cash conversion cycle",
      "Operating cash flow trend",
      "Free cash flow",
      "Cash and equivalents balance",
      "Unused credit facilities",
      "Working capital ratio",
    ],
    mitigation: [
      "Maintain current ratio >1.5",
      "Improve cash conversion cycle",
      "Secure backup credit facilities",
      "Optimize working capital management",
      "Build emergency cash reserve",
      "Implement cash flow forecasting (13-week)",
    ],
    dataSources: ["Financial statements", "Bank filings", "BVC disclosures"],
    refreshCycle: "daily",
  },
  {
    id: "FIN-004",
    name: "Accounting Quality",
    nameFr: "Qualité Comptable",
    nameAr: "جودة المحاسبة",
    group: "financial",
    weight: 0.07,
    definition: "Assessment of accounting practices, audit quality, and financial statement reliability.",
    scope: "Audit firm quality, restatements, accounting policy aggressiveness, off-balance-sheet items",
    scoringCriteria: {
      low: "Big-4 auditor, clean opinion, conservative policies",
      moderate: "Mid-tier auditor, qualified opinion, standard policies",
      elevated: "Frequent auditor changes, aggressive policies",
      high: "Restatements, material weaknesses, going-concern",
      critical: "Audit failure, fraud, regulatory enforcement",
    },
    indicators: [
      "Auditor reputation (Big-4 vs. mid-tier)",
      "Audit opinion (unqualified/qualified/adverse)",
      "Restatement history",
      "Material weaknesses in internal controls",
      "Accounting policy changes",
      "Revenue recognition aggressiveness",
      "Off-balance-sheet items",
      "Related-party transaction materiality",
    ],
    mitigation: [
      "Engage Big-4 auditor",
      "Implement robust internal controls (SOX-style)",
      "Conservative accounting policies",
      "Annual audit committee review",
      "Transparent related-party disclosure",
      "Eliminate off-balance-sheet structures",
    ],
    dataSources: ["Audit reports", "AMMC filings", "Financial statements"],
    refreshCycle: "monthly",
  },
  {
    id: "FIN-005",
    name: "Market Capitalization & Valuation",
    nameFr: "Capitalisation Boursière & Valorisation",
    nameAr: "القيمة السوقية والتقييم",
    group: "financial",
    weight: 0.05,
    definition: "Analysis of market capitalization, valuation multiples, and stock performance.",
    scope: "Market cap, P/E, P/B, EV/EBITDA, dividend yield, stock volatility",
    scoringCriteria: {
      low: "Reasonable valuation, stable stock, adequate liquidity",
      moderate: "Valuation in line with peers, moderate volatility",
      elevated: "Overvalued, high volatility, thin trading",
      high: "Sharp decline, delisting risk, zero liquidity",
      critical: "Penny stock, delisting imminent, market manipulation",
    },
    indicators: [
      "Market capitalization",
      "P/E ratio (vs. peers)",
      "P/B ratio",
      "EV/EBITDA",
      "Dividend yield",
      "Stock price volatility (beta)",
      "Trading volume/liquidity",
      "Short interest",
    ],
    mitigation: [
      "Maintain minimum free float (25%+)",
      "Engage with sell-side analysts",
      "Implement share buyback program (if undervalued)",
      "Improve IR communication",
      "Diversify shareholder base",
      "Monitor short interest and respond",
    ],
    dataSources: ["BVC data", "Bloomberg", "Reuters", "Company filings"],
    refreshCycle: "daily",
  },

  // ═══ OPERATIONAL (4 categories) ══════════════════════════════
  {
    id: "OPS-001",
    name: "Supply Chain Resilience",
    nameFr: "Résilience de la Chaîne d'Approvisionnement",
    nameAr: "مرونة سلسلة التوريد",
    group: "operational",
    weight: 0.06,
    definition: "Assessment of supply chain diversity, supplier concentration, and disruption resilience.",
    scope: "Supplier concentration, geographic diversity, inventory management, logistics",
    scoringCriteria: {
      low: "Diversified suppliers, multi-sourcing, low concentration",
      moderate: "Some concentration, adequate backup suppliers",
      elevated: "High concentration, single-source dependencies",
      high: "Critical single-source, frequent disruptions",
      critical: "Supply chain collapse, no alternatives",
    },
    indicators: [
      "Supplier concentration (top 5 suppliers %)",
      "Geographic supplier diversity",
      "Single-source dependency",
      "Inventory turnover ratio",
      "Lead time variability",
      "Supplier financial health",
      "Alternative supplier availability",
      "Supply chain insurance coverage",
    ],
    mitigation: [
      "Multi-source critical inputs (minimum 3 suppliers)",
      "Diversify geographically (no single country >40%)",
      "Maintain safety stock (30-60 days)",
      "Implement supplier monitoring program",
      "Develop local supplier network",
      "Secure supply chain insurance",
    ],
    dataSources: ["Company disclosures", "Supplier filings", "Industry reports"],
    refreshCycle: "weekly",
  },
  {
    id: "OPS-002",
    name: "Human Resources & Talent",
    nameFr: "Ressources Humaines & Talents",
    nameAr: "الموارد البشرية والمواهب",
    group: "operational",
    weight: 0.05,
    definition: "Evaluation of workforce stability, talent acquisition, and human capital management.",
    scope: "Employee turnover, skill gaps, training, labor relations, talent pipeline",
    scoringCriteria: {
      low: "Low turnover, strong talent pipeline, positive labor relations",
      moderate: "Average turnover, adequate training programs",
      elevated: "High turnover in key roles, skill gaps",
      high: "Mass exodus, labor disputes, critical skill shortage",
      critical: "Workforce collapse, strikes, no talent pipeline",
    },
    indicators: [
      "Employee turnover rate (voluntary)",
      "Key person dependency",
      "Training spend per employee",
      "Time-to-fill critical positions",
      "Employee satisfaction scores",
      "Labor union relations",
      "Succession planning depth",
      "Compensation competitiveness",
    ],
    mitigation: [
      "Implement retention program for top talent",
      "Develop succession plans for all C-suite",
      "Invest in training (3%+ of payroll)",
      "Conduct annual employee engagement survey",
      "Establish competitive compensation bands",
      "Build talent pipeline with universities",
    ],
    dataSources: ["HR metrics", "Industry surveys", "Glassdoor/LinkedIn data"],
    refreshCycle: "monthly",
  },
  {
    id: "OPS-003",
    name: "Production & Quality Control",
    nameFr: "Production & Contrôle Qualité",
    nameAr: "الإنتاج ومراقبة الجودة",
    group: "operational",
    weight: 0.05,
    definition: "Assessment of production capacity, quality control systems, and operational efficiency.",
    scope: "Capacity utilization, defect rates, quality certifications, process automation",
    scoringCriteria: {
      low: "High quality, low defects, ISO certified, efficient",
      moderate: "Standard quality, some defects, basic certifications",
      elevated: "Quality issues, rising defects, no certifications",
      high: "Frequent recalls, customer complaints, quality failures",
      critical: "Product safety crisis, massive recalls, regulatory action",
    },
    indicators: [
      "Defect rate (PPM)",
      "Capacity utilization",
      "On-time delivery rate",
      "Customer complaint rate",
      "Product recall incidents",
      "ISO 9001 certification",
      "OEE (Overall Equipment Effectiveness)",
      "Quality audit scores",
    ],
    mitigation: [
      "Implement Six Sigma / Lean program",
      "Achieve ISO 9001 certification",
      "Automate quality inspection",
      "Establish quality KPI dashboard",
      "Conduct regular supplier quality audits",
      "Implement root-cause analysis (8D)",
    ],
    dataSources: ["Internal QA data", "Customer feedback", "Regulatory filings"],
    refreshCycle: "weekly",
  },
  {
    id: "OPS-004",
    name: "Business Continuity & Resilience",
    nameFr: "Continuité d'Activité & Résilience",
    nameAr: "استمرارية الأعمال والمرونة",
    group: "operational",
    weight: 0.06,
    definition: "Evaluation of business continuity planning, disaster recovery, and crisis management.",
    scope: "BCP/DR plans, crisis management, pandemic preparedness, geographic redundancy",
    scoringCriteria: {
      low: "Comprehensive BCP, tested DR, crisis team trained",
      moderate: "BCP exists, limited testing, basic DR",
      elevated: "Outdated BCP, untested DR, no crisis team",
      high: "No BCP, no DR, no crisis management",
      critical: "Complete operational failure, no recovery plan",
    },
    indicators: [
      "BCP existence and last update",
      "DR site existence and test frequency",
      "Crisis management team training",
      "RTO (Recovery Time Objective)",
      "RPO (Recovery Point Objective)",
      "Geographic redundancy",
      "Pandemic/epidemic preparedness",
      "Insurance coverage for business interruption",
    ],
    mitigation: [
      "Update BCP annually",
      "Test DR quarterly (full failover)",
      "Train crisis management team (2x/year)",
      "Establish RTO <4 hours for critical systems",
      "Implement geographic redundancy",
      "Secure business interruption insurance",
    ],
    dataSources: ["Internal BCP documents", "Audit reports", "Insurance filings"],
    refreshCycle: "monthly",
  },

  // ═══ STRATEGIC (4 categories) ════════════════════════════════
  {
    id: "STR-001",
    name: "Market Position & Competition",
    nameFr: "Position Marché & Concurrence",
    nameAr: "الموقع التنافسي والمنافسة",
    group: "strategic",
    weight: 0.06,
    definition: "Assessment of market share, competitive position, and barriers to entry.",
    scope: "Market share, competitive moat, differentiation, pricing power",
    scoringCriteria: {
      low: "Market leader, strong moat, pricing power",
      moderate: "Top-3 player, moderate differentiation",
      elevated: "Declining share, eroding moat, price pressure",
      high: "Minor player, no differentiation, price war",
      critical: "Market exit, obsolescence, disruption",
    },
    indicators: [
      "Market share trend",
      "Competitive moat (brand, tech, scale, network)",
      "Customer acquisition cost",
      "Customer lifetime value",
      "Net Promoter Score (NPS)",
      "Pricing power / margin stability",
      "New entrant threat level",
      "Substitute product threat",
    ],
    mitigation: [
      "Invest in differentiation (R&D, brand)",
      "Build switching costs for customers",
      "Expand into adjacent markets",
      "Acquire or partner with competitors",
      "Develop pricing power through innovation",
      "Monitor disruptive threats",
    ],
    dataSources: ["Market research", "Industry reports", "Company strategy documents"],
    refreshCycle: "monthly",
  },
  {
    id: "STR-002",
    name: "Innovation & R&D",
    nameFr: "Innovation & R&D",
    nameAr: "الابتكار والبحث والتطوير",
    group: "strategic",
    weight: 0.05,
    definition: "Evaluation of innovation pipeline, R&D investment, and digital transformation progress.",
    scope: "R&D spend, patent portfolio, innovation pipeline, digital maturity",
    scoringCriteria: {
      low: "High R&D spend, strong patent portfolio, digital leader",
      moderate: "Adequate R&D, some patents, digital progress",
      elevated: "Below-average R&D, limited IP, digital laggard",
      high: "Minimal R&D, no IP, no digital strategy",
      critical: "Zero innovation, obsolete technology, no pipeline",
    },
    indicators: [
      "R&D spend as % of revenue",
      "Patent count and quality",
      "Innovation pipeline (products in development)",
      "Digital transformation maturity",
      "Time-to-market for new products",
      "Technology adoption rate",
      "Innovation ROI",
      "Open innovation partnerships",
    ],
    mitigation: [
      "Increase R&D spend to industry median (min 3% revenue)",
      "Establish innovation lab / incubator",
      "File patents for key innovations",
      "Partner with startups and universities",
      "Implement digital transformation roadmap",
      "Create innovation KPI dashboard",
    ],
    dataSources: ["Financial statements", "Patent databases", "Innovation surveys"],
    refreshCycle: "monthly",
  },
  {
    id: "STR-003",
    name: "M&A and Strategic Partnerships",
    nameFr: "Fusions & Acquisitions et Partenariats",
    nameAr: "الاندماج والاستحواذ والشراكات",
    group: "strategic",
    weight: 0.04,
    definition: "Assessment of M&A track record, integration capability, and partnership strategy.",
    scope: "M&A history, integration success, partnership portfolio, deal pipeline",
    scoringCriteria: {
      low: "Strong M&A track record, successful integrations, strategic partnerships",
      moderate: "Some M&A activity, mixed integration results",
      elevated: "Poor M&A track record, integration failures",
      high: "Value-destroying acquisitions, no integration",
      critical: "Failed mega-merger, write-offs, shareholder revolt",
    },
    indicators: [
      "M&A success rate (value created vs. destroyed)",
      "Integration timeline adherence",
      "Synergy realization vs. promises",
      "Goodwill impairment history",
      "Partnership portfolio quality",
      "Deal pipeline depth",
      "Due diligence quality",
      "Post-merger cultural integration",
    ],
    mitigation: [
      "Establish rigorous M&A diligence process",
      "Create integration playbook",
      "Set synergy targets with accountability",
      "Conduct cultural compatibility assessment",
      "Implement 100-day integration plan",
      "Monitor goodwill for impairment quarterly",
    ],
    dataSources: ["M&A databases", "Company filings", "Press releases"],
    refreshCycle: "monthly",
  },
  {
    id: "STR-004",
    name: "ESG & Sustainability Strategy",
    nameFr: "Stratégie ESG & Développement Durable",
    nameAr: "استراتيجية الحوكمة البيئية والاجتماعية",
    group: "strategic",
    weight: 0.07,
    definition: "Evaluation of ESG strategy, sustainability commitments, and stakeholder engagement.",
    scope: "ESG strategy, carbon footprint, social impact, governance practices, stakeholder engagement",
    scoringCriteria: {
      low: "Comprehensive ESG strategy, net-zero commitment, transparent reporting",
      moderate: "ESG policy exists, some initiatives, basic reporting",
      elevated: "Limited ESG strategy, greenwashing risk",
      high: "No ESG strategy, environmental violations, social controversies",
      critical: "ESG crisis, regulatory action, investor divestment",
    },
    indicators: [
      "ESG strategy existence and quality",
      "Carbon footprint (Scope 1, 2, 3)",
      "Net-zero commitment and timeline",
      "Renewable energy usage",
      "Water and waste management",
      "Diversity and inclusion metrics",
      "Community investment",
      "ESG rating (MSCI/Sustainalytics/ISS)",
    ],
    mitigation: [
      "Develop comprehensive ESG strategy",
      "Set science-based targets (SBTi)",
      "Publish annual ESG report (GRI/SASB)",
      "Achieve ESG rating improvement",
      "Engage stakeholders regularly",
      "Invest in renewable energy",
    ],
    dataSources: ["ESG reports", "MSCI/Sustainalytics ratings", "CDP disclosures"],
    refreshCycle: "monthly",
  },

  // ═══ COMPLIANCE (4 categories) ═══════════════════════════════
  {
    id: "COM-001",
    name: "Regulatory Compliance",
    nameFr: "Conformité Réglementaire",
    nameAr: "الامتثال التنظيمي",
    group: "compliance",
    weight: 0.08,
    definition: "Assessment of compliance with applicable laws, regulations, and industry standards.",
    scope: "Regulatory violations, enforcement actions, fines, compliance program effectiveness",
    scoringCriteria: {
      low: "No violations, robust compliance program, proactive monitoring",
      moderate: "Minor violations, adequate compliance program",
      elevated: "Multiple violations, enforcement actions",
      high: "Major violations, significant fines, regulatory scrutiny",
      critical: "Criminal violations, license revocation, regulatory takeover",
    },
    indicators: [
      "Regulatory violation count",
      "Enforcement action count",
      "Total fines and penalties",
      "Compliance program maturity",
      "Regulatory examination results",
      "Self-reporting frequency",
      "Remediation timeliness",
      "Compliance training completion",
    ],
    mitigation: [
      "Implement robust compliance management system",
      "Conduct annual compliance audit",
      "Establish regulatory liaison",
      "Train all employees on relevant regulations",
      "Implement compliance monitoring dashboard",
      "Self-report violations promptly",
    ],
    dataSources: ["Regulator filings", "AMMC/BAM circulars", "Court records"],
    refreshCycle: "weekly",
  },
  {
    id: "COM-002",
    name: "Sanctions & Export Control",
    nameFr: "Sanctions & Contrôle des Exportations",
    nameAr: "العقوبات ومراقبة الصادرات",
    group: "compliance",
    weight: 0.09,
    definition: "Assessment of sanctions exposure, export control compliance, and restricted party screening.",
    scope: "OFAC/EU/UN sanctions screening, export controls, restricted party lists, dual-use goods",
    scoringCriteria: {
      low: "No sanctioned parties, robust screening, clean supply chain",
      moderate: "Some screening gaps, low-risk exposures",
      elevated: "Sanctioned party exposure, screening failures",
      high: "Direct sanctions violation, export control breach",
      critical: "Criminal sanctions violation, OFAC designation, trade ban",
    },
    indicators: [
      "Sanctions screening coverage (customers, suppliers, partners)",
      "OFAC/EU/UN list matches",
      "Export control license requirements",
      "Dual-use goods exposure",
      "Restricted jurisdiction exposure",
      "Sanctions program knowledge",
      "Screening technology effectiveness",
      "False positive rate",
    ],
    mitigation: [
      "Screen all parties against OFAC/EU/UN lists daily",
      "Implement real-time screening at transaction level",
      "Train staff on sanctions compliance",
      "Establish sanctions compliance officer",
      "Conduct annual sanctions risk assessment",
      "Implement geo-fencing for restricted jurisdictions",
    ],
    dataSources: ["OFAC SDN list", "EU consolidated list", "UN Security Council list"],
    refreshCycle: "daily",
  },
  {
    id: "COM-003",
    name: "Data Protection & Privacy",
    nameFr: "Protection des Données & Vie Privée",
    nameAr: "حماية البيانات والخصوصية",
    group: "compliance",
    weight: 0.08,
    definition: "Assessment of data protection compliance, privacy practices, and data breach history.",
    scope: "GDPR, Moroccan Law 09-08, data breach response, privacy by design, data governance",
    scoringCriteria: {
      low: "Full compliance, robust privacy program, no breaches",
      moderate: "Adequate compliance, minor gaps, no major breaches",
      elevated: "Compliance gaps, breach history, regulatory warnings",
      high: "Major breach, regulatory enforcement, data misuse",
      critical: "Massive breach, criminal investigation, class action",
    },
    indicators: [
      "Data breach incidents (count, severity)",
      "GDPR/Law 09-08 compliance status",
      "Data Protection Officer (DPO) appointment",
      "Privacy impact assessment completion",
      "Data subject request response time",
      "Privacy policy quality",
      "Data retention compliance",
      "Cross-border data transfer safeguards",
    ],
    mitigation: [
      "Appoint qualified DPO",
      "Implement privacy by design framework",
      "Conduct privacy impact assessments for new projects",
      "Establish breach response plan (72-hour notification)",
      "Encrypt all personal data at rest and in transit",
      "Train all employees on data protection",
    ],
    dataSources: ["CNDP filings", "Internal privacy audits", "Breach notifications"],
    refreshCycle: "daily",
  },
  {
    id: "COM-004",
    name: "Anti-Money Laundering (AML)",
    nameFr: "Anti-Blanchiment (AML)",
    nameAr: "مكافحة غسيل الأموال",
    group: "compliance",
    weight: 0.07,
    definition: "Assessment of AML controls, KYC practices, and suspicious transaction reporting.",
    scope: "AML program, KYC/CDD, transaction monitoring, SAR/STR filing, PEP screening",
    scoringCriteria: {
      low: "Robust AML program, effective monitoring, timely SAR filing",
      moderate: "Adequate AML controls, some monitoring gaps",
      elevated: "AML deficiencies, late SAR filing, regulatory warnings",
      high: "AML violation, enforcement action, fine",
      critical: "Money laundering facilitation, criminal charges, license loss",
    },
    indicators: [
      "AML program maturity",
      "KYC/CDD completion rate",
      "Transaction monitoring coverage",
      "SAR/STR filing count and timeliness",
      "PEP (Politically Exposed Person) screening",
      "Beneficial ownership identification",
      "AML training completion",
      "Regulatory examination results",
    ],
    mitigation: [
      "Implement risk-based AML program",
      "Automate transaction monitoring",
      "Complete KYC for all customers (100%)",
      "Screen all PEPs daily",
      "File SAR/STR within 30 days",
      "Conduct annual AML training",
    ],
    dataSources: ["BAM AML circulars", "Internal AML reports", "Court records"],
    refreshCycle: "weekly",
  },

  // ═══ DIGITAL (4 categories) ══════════════════════════════════
  {
    id: "DIG-001",
    name: "Cybersecurity",
    nameFr: "Cybersécurité",
    nameAr: "الأمن السيبراني",
    group: "digital",
    weight: 0.10,
    definition: "Assessment of cybersecurity posture, threat detection, and incident response capability.",
    scope: "Security controls, threat intelligence, incident response, vulnerability management, security awareness",
    scoringCriteria: {
      low: "Strong security, certified (ISO 27001), no incidents",
      moderate: "Adequate controls, minor incidents, basic certification",
      elevated: "Security gaps, frequent incidents, no certification",
      high: "Major breach, data loss, regulatory notification",
      critical: "Ransomware, operational shutdown, existential threat",
    },
    indicators: [
      "Security incidents (count, severity)",
      "ISO 27001 / SOC 2 certification",
      "Vulnerability scan results",
      "Penetration test findings",
      "Security training completion",
      "MFA (Multi-Factor Authentication) coverage",
      "Endpoint protection coverage",
      "Incident response plan tested",
    ],
    mitigation: [
      "Achieve ISO 27001 / SOC 2 certification",
      "Implement zero-trust architecture",
      "Deploy MFA for all access",
      "Conduct quarterly penetration testing",
      "Train all employees (phishing simulation)",
      "Establish 24/7 SOC (Security Operations Center)",
    ],
    dataSources: ["Security audits", "Breach notifications", "Vulnerability scanners"],
    refreshCycle: "daily",
  },
  {
    id: "DIG-002",
    name: "AI & ML Governance",
    nameFr: "Gouvernance de l'IA & ML",
    nameAr: "حوكمة الذكاء الاصطناعي",
    group: "digital",
    weight: 0.06,
    definition: "Assessment of AI/ML model governance, bias detection, and ethical AI practices.",
    scope: "Model validation, bias testing, explainability, AI ethics, regulatory compliance",
    scoringCriteria: {
      low: "Robust AI governance, bias testing, explainable models",
      moderate: "Some AI governance, limited bias testing",
      elevated: "AI governance gaps, bias risk, opacity",
      high: "Biased models, regulatory scrutiny, reputational damage",
      critical: "AI harm, discrimination lawsuit, regulatory ban",
    },
    indicators: [
      "AI governance framework existence",
      "Model validation process",
      "Bias detection and mitigation",
      "Model explainability / interpretability",
      "AI ethics training",
      "Regulatory compliance (EU AI Act, etc.)",
      "Model monitoring and drift detection",
      "Human-in-the-loop oversight",
    ],
    mitigation: [
      "Establish AI governance committee",
      "Implement model validation pipeline",
      "Conduct bias testing before deployment",
      "Ensure model explainability",
      "Train AI developers on ethics",
      "Monitor models for drift post-deployment",
    ],
    dataSources: ["Internal AI documentation", "Regulatory guidance", "Industry frameworks"],
    refreshCycle: "monthly",
  },
  {
    id: "DIG-003",
    name: "Digital Transformation",
    nameFr: "Transformation Numérique",
    nameAr: "التحول الرقمي",
    group: "digital",
    weight: 0.05,
    definition: "Evaluation of digital maturity, technology stack modernity, and digital strategy execution.",
    scope: "Digital strategy, technology stack, cloud adoption, automation, digital skills",
    scoringCriteria: {
      low: "Digital leader, cloud-native, high automation, strong digital skills",
      moderate: "Digital progress, hybrid infrastructure, some automation",
      elevated: "Digital laggard, legacy systems, manual processes",
      high: "Digital obsolescence, no strategy, technical debt",
      critical: "Digital disruption, existential threat from digital natives",
    },
    indicators: [
      "Digital strategy existence and execution",
      "Cloud adoption rate",
      "Automation level (RPA, AI)",
      "Legacy system percentage",
      "Technical debt assessment",
      "Digital skills gap",
      "Customer digital engagement",
      "Digital revenue percentage",
    ],
    mitigation: [
      "Develop 3-year digital transformation roadmap",
      "Migrate to cloud (target 80% workloads)",
      "Automate manual processes (RPA)",
      "Retire legacy systems (annual 20% reduction)",
      "Invest in digital skills training",
      "Establish digital innovation lab",
    ],
    dataSources: ["Digital maturity assessments", "Technology audits", "Industry benchmarks"],
    refreshCycle: "monthly",
  },
  {
    id: "DIG-004",
    name: "Data Governance & Quality",
    nameFr: "Gouvernance des Données & Qualité",
    nameAr: "حوكمة البيانات والجودة",
    group: "digital",
    weight: 0.05,
    definition: "Assessment of data governance framework, data quality, and master data management.",
    scope: "Data governance, data quality, MDM, data lineage, data catalog, data stewardship",
    scoringCriteria: {
      low: "Robust data governance, high quality, comprehensive MDM",
      moderate: "Adequate governance, acceptable quality",
      elevated: "Governance gaps, quality issues, no MDM",
      high: "Poor data quality, no governance, decision risk",
      critical: "Data chaos, no governance, regulatory violation",
    },
    indicators: [
      "Data governance framework existence",
      "Data quality metrics (accuracy, completeness, timeliness)",
      "Master Data Management (MDM) implementation",
      "Data catalog existence",
      "Data lineage documentation",
      "Data steward roles assigned",
      "Data quality dashboards",
      "Data retention policies",
    ],
    mitigation: [
      "Establish data governance council",
      "Implement MDM for critical domains",
      "Deploy data quality monitoring",
      "Create enterprise data catalog",
      "Assign data stewards per domain",
      "Implement data retention schedule",
    ],
    dataSources: ["Data governance audits", "Quality metrics", "Internal assessments"],
    refreshCycle: "monthly",
  },

  // ═══ ENVIRONMENTAL (3 categories) ════════════════════════════
  {
    id: "ENV-001",
    name: "Carbon Footprint & Climate",
    nameFr: "Empreinte Carbone & Climat",
    nameAr: "البصمة الكربونية والمناخ",
    group: "environmental",
    weight: 0.07,
    definition: "Assessment of greenhouse gas emissions, climate risk exposure, and decarbonization strategy.",
    scope: "Scope 1/2/3 emissions, carbon intensity, climate risk, net-zero pathway, TCFD reporting",
    scoringCriteria: {
      low: "Net-zero commitment, declining emissions, TCFD aligned",
      moderate: "Emissions tracked, some reduction targets",
      elevated: "Rising emissions, no targets, no reporting",
      high: "High emissions, regulatory exposure, no plan",
      critical: "Climate litigation, stranded assets, existential risk",
    },
    indicators: [
      "Scope 1 emissions (direct)",
      "Scope 2 emissions (energy)",
      "Scope 3 emissions (value chain)",
      "Carbon intensity (per unit revenue)",
      "Net-zero commitment and target year",
      "Renewable energy percentage",
      "TCFD reporting alignment",
      "Climate risk assessment",
    ],
    mitigation: [
      "Set science-based targets (SBTi)",
      "Commit to net-zero by 2050 (or earlier)",
      "Invest in renewable energy",
      "Implement energy efficiency program",
      "Publish TCFD-aligned report",
      "Conduct climate scenario analysis",
    ],
    dataSources: ["CDP disclosures", "ESG reports", "TCFD reports"],
    refreshCycle: "monthly",
  },
  {
    id: "ENV-002",
    name: "Resource Use & Circular Economy",
    nameFr: "Utilisation des Ressources & Économie Circulaire",
    nameAr: "استخدام الموارد والاقتصاد الدائري",
    group: "environmental",
    weight: 0.04,
    definition: "Assessment of resource efficiency, waste management, and circular economy practices.",
    scope: "Water usage, waste generation, recycling, circular economy, resource efficiency",
    scoringCriteria: {
      low: "High efficiency, circular practices, zero waste to landfill",
      moderate: "Standard efficiency, some recycling",
      elevated: "Resource-intensive, limited recycling",
      high: "Excessive waste, no recycling, resource depletion",
      critical: "Environmental damage, resource exhaustion, regulatory action",
    },
    indicators: [
      "Water consumption and intensity",
      "Waste generation (hazardous, non-hazardous)",
      "Recycling rate",
      "Circular economy initiatives",
      "Resource efficiency metrics",
      "Landfill diversion rate",
      "Packaging sustainability",
      "Supply chain resource efficiency",
    ],
    mitigation: [
      "Implement circular economy framework",
      "Achieve zero waste to landfill",
      "Reduce water consumption (20% by 2030)",
      "Use recycled materials in products",
      "Implement sustainable packaging",
      "Track resource efficiency KPIs",
    ],
    dataSources: ["ESG reports", "Environmental permits", "Waste tracking systems"],
    refreshCycle: "monthly",
  },
  {
    id: "ENV-003",
    name: "Biodiversity & Land Use",
    nameFr: "Biodiversité & Utilisation des Terres",
    nameAr: "التنوع البيولوجي واستخدام الأراضي",
    group: "environmental",
    weight: 0.03,
    definition: "Assessment of biodiversity impact, land use practices, and ecosystem stewardship.",
    scope: "Land use change, deforestation, biodiversity impact, ecosystem services, habitat protection",
    scoringCriteria: {
      low: "Net positive biodiversity, sustainable land use, habitat restoration",
      moderate: "Limited impact, some conservation efforts",
      elevated: "Land degradation, biodiversity loss",
      high: "Deforestation, habitat destruction, regulatory action",
      critical: "Ecosystem collapse, legal action, community displacement",
    },
    indicators: [
      "Land use change",
      "Deforestation footprint",
      "Biodiversity impact assessment",
      "Habitat restoration projects",
      "Conservation area management",
      "Supply chain deforestation risk",
      "TNFD (Taskforce on Nature-related Financial Disclosures) alignment",
      "Ecosystem services valuation",
    ],
    mitigation: [
      "Conduct biodiversity impact assessment",
      "Implement no-deforestation policy",
      "Restore degraded habitats",
      "Source from certified sustainable suppliers",
      "Align with TNFD framework",
      "Invest in conservation projects",
    ],
    dataSources: ["ESG reports", "Environmental impact assessments", "Satellite monitoring"],
    refreshCycle: "monthly",
  },

  // ═══ SOCIAL (3 categories) ═══════════════════════════════════
  {
    id: "SOC-001",
    name: "Labor Practices & Human Rights",
    nameFr: "Pratiques de Travail & Droits Humains",
    nameAr: "ممارسات العمل وحقوق الإنسان",
    group: "social",
    weight: 0.06,
    definition: "Assessment of labor practices, human rights respect, and workplace safety.",
    scope: "Labor rights, working conditions, health & safety, human rights, child labor, forced labor",
    scoringCriteria: {
      low: "Strong labor practices, zero violations, excellent safety record",
      moderate: "Standard practices, minor issues, adequate safety",
      elevated: "Labor disputes, safety incidents, human rights concerns",
      high: "Systematic violations, injuries, regulatory action",
      critical: "Child/forced labor, fatalities, criminal charges",
    },
    indicators: [
      "Labor violation count",
      "Lost time injury rate (LTIFR)",
      "Fatalities",
      "Working hours compliance",
      "Living wage payment",
      "Freedom of association respect",
      "Diversity and inclusion metrics",
      "Human rights due diligence",
    ],
    mitigation: [
      "Implement human rights policy",
      "Conduct human rights due diligence",
      "Achieve zero lost-time injuries",
      "Pay living wage (not just minimum wage)",
      "Respect freedom of association",
      "Regular safety training",
    ],
    dataSources: ["Labor inspections", "Union reports", "OHS statistics", "Human rights reports"],
    refreshCycle: "weekly",
  },
  {
    id: "SOC-002",
    name: "Community Relations & Impact",
    nameFr: "Relations Communautaires & Impact",
    nameAr: "علاقات المجتمع والتأثير",
    group: "social",
    weight: 0.04,
    definition: "Assessment of community engagement, local impact, and social license to operate.",
    scope: "Community investment, local employment, social impact, stakeholder engagement, disputes",
    scoringCriteria: {
      low: "Strong community relations, positive impact, social license secure",
      moderate: "Adequate engagement, some community investment",
      elevated: "Community tensions, negative impact, protests",
      high: "Community opposition, project delays, legal action",
      critical: "Social conflict, project cancellation, license loss",
    },
    indicators: [
      "Community investment ($ and % of profit)",
      "Local employment percentage",
      "Community complaint count",
      "Stakeholder engagement quality",
      "Social impact assessment",
      "Community development programs",
      "Indigenous peoples' rights respect",
      "Land rights disputes",
    ],
    mitigation: [
      "Develop community engagement plan",
      "Invest 1%+ of profit in community programs",
      "Hire locally (target 70%+ local workforce)",
      "Establish community grievance mechanism",
      "Conduct social impact assessments",
      "Respect free, prior, and informed consent (FPIC)",
    ],
    dataSources: ["Community surveys", "Stakeholder feedback", "Social impact reports"],
    refreshCycle: "monthly",
  },
  {
    id: "SOC-003",
    name: "Product Safety & Consumer Protection",
    nameFr: "Sécurité des Produits & Protection des Consommateurs",
    nameAr: "سلامة المنتجات وحماية المستهلك",
    group: "social",
    weight: 0.05,
    definition: "Assessment of product safety, quality, and consumer protection practices.",
    scope: "Product safety, recalls, consumer complaints, misleading advertising, data protection",
    scoringCriteria: {
      low: "Excellent safety record, no recalls, high consumer trust",
      moderate: "Standard safety, occasional recalls, adequate complaint handling",
      elevated: "Safety issues, frequent recalls, consumer complaints",
      high: "Product safety crisis, massive recalls, regulatory action",
      critical: "Consumer harm, fatalities, criminal liability",
    },
    indicators: [
      "Product recall count",
      "Consumer complaint rate",
      "Safety certification compliance",
      "Misleading advertising incidents",
      "Product liability lawsuits",
      "Consumer protection violations",
      "Data protection compliance",
      "Customer satisfaction scores",
    ],
    mitigation: [
      "Implement robust QA/QC program",
      "Establish product safety committee",
      "Create rapid recall capability",
      "Transparent advertising review",
      "Implement consumer feedback loop",
      "Comply with all product safety regulations",
    ],
    dataSources: ["Consumer protection agencies", "Court records", "Recall databases"],
    refreshCycle: "weekly",
  },
];

// ─── SCORING FUNCTIONS ─────────────────────────────────────────

/**
 * Calculate overall risk score from individual category scores.
 */
export function calculateOverallRisk(
  categoryScores: Array<{ categoryId: string; score: number }>
): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const { categoryId, score } of categoryScores) {
    const category = RISK_CATEGORIES.find(c => c.id === categoryId);
    if (category) {
      weightedSum += score * category.weight;
      totalWeight += category.weight;
    }
  }

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

/**
 * Determine risk level from score.
 */
export function getRiskLevel(score: number): RiskLevel {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 45) return "elevated";
  if (score >= 30) return "moderate";
  return "low";
}

/**
 * Get risk level color (hex).
 */
export function getRiskLevelColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    low: "#059669",
    moderate: "#856914",
    elevated: "#D97706",
    high: "#DC2626",
    critical: "#7F1D1D",
  };
  return colors[level];
}

/**
 * Get risk level label (French).
 */
export function getRiskLevelLabelFr(level: RiskLevel): string {
  const labels: Record<RiskLevel, string> = {
    low: "Faible",
    moderate: "Modéré",
    elevated: "Élevé",
    high: "Haut",
    critical: "Critique",
  };
  return labels[level];
}

/**
 * Get risk level label (English).
 */
export function getRiskLevelLabelEn(level: RiskLevel): string {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

/**
 * Get all categories in a specific group.
 */
export function getCategoriesByGroup(group: RiskGroup): RiskCategory[] {
  return RISK_CATEGORIES.filter(c => c.group === group);
}

/**
 * Get category by ID.
 */
export function getCategoryById(id: string): RiskCategory | undefined {
  return RISK_CATEGORIES.find(c => c.id === id);
}

/**
 * Get all risk groups.
 */
export function getAllRiskGroups(): RiskGroup[] {
  return Object.keys(RISK_GROUPS) as RiskGroup[];
}

/**
 * Get total number of categories.
 */
export function getCategoryCount(): number {
  return RISK_CATEGORIES.length;
}

/**
 * Get total weight (should sum to ~1.0).
 */
export function getTotalWeight(): number {
  return RISK_CATEGORIES.reduce((sum, c) => sum + c.weight, 0);
}

/**
 * Get categories sorted by weight (highest first).
 */
export function getCategoriesByWeight(): RiskCategory[] {
  return [...RISK_CATEGORIES].sort((a, b) => b.weight - a.weight);
}

/**
 * Get categories sorted by group.
 */
export function getCategoriesGrouped(): Record<RiskGroup, RiskCategory[]> {
  const grouped: Partial<Record<RiskGroup, RiskCategory[]>> = {};
  for (const category of RISK_CATEGORIES) {
    if (!grouped[category.group]) {
      grouped[category.group] = [];
    }
    grouped[category.group]!.push(category);
  }
  return grouped as Record<RiskGroup, RiskCategory[]>;
}

/**
 * Generate a risk assessment recommendation based on category and score.
 */
export function generateRecommendation(categoryId: string, score: number): string {
  const category = getCategoryById(categoryId);
  if (!category) return "Category not found";

  const level = getRiskLevel(score);

  if (level === "low" || level === "moderate") {
    return `Continue current practices. Monitor ${category.name} indicators regularly.`;
  }

  if (level === "elevated") {
    return `Review ${category.name} practices. Implement mitigation measures within 90 days.`;
  }

  if (level === "high") {
    return `URGENT: Address ${category.name} issues within 30 days. Escalate to board risk committee.`;
  }

  // critical
  return `CRITICAL: Immediate board intervention required for ${category.name}. Engage external experts and notify regulators if applicable.`;
}

/**
 * Calculate risk trajectory (rising/stable/falling) based on historical scores.
 */
export function calculateTrajectory(
  historicalScores: Array<{ date: Date; score: number }>
): "rising" | "stable" | "falling" {
  if (historicalScores.length < 2) return "stable";

  const sorted = [...historicalScores].sort((a, b) => a.date.getTime() - b.date.getTime());
  const recent = sorted.slice(-4); // Last 4 data points
  const avgRecent = recent.reduce((sum, h) => sum + h.score, 0) / recent.length;
  const avgPrevious = sorted.slice(0, -4).reduce((sum, h) => sum + h.score, 0) / Math.max(1, sorted.length - 4);

  const delta = avgRecent - avgPrevious;

  if (delta > 5) return "rising";
  if (delta < -5) return "falling";
  return "stable";
}

/**
 * Get risk summary for a company.
 */
export function getRiskSummary(
  assessments: Array<{ categoryId: string; score: number }>
): {
  overallScore: number;
  overallLevel: RiskLevel;
  topRisks: Array<{ category: RiskCategory; score: number; level: RiskLevel }>;
  improvements: Array<{ category: RiskCategory; score: number; level: RiskLevel }>;
  groupAverages: Array<{ group: RiskGroup; averageScore: number; averageLevel: RiskLevel }>;
} {
  const overallScore = calculateOverallRisk(assessments);
  const overallLevel = getRiskLevel(overallScore);

  // Top risks (highest scores)
  const topRisks = assessments
    .map(a => {
      const category = getCategoryById(a.categoryId);
      return category ? { category, score: a.score, level: getRiskLevel(a.score) } : null;
    })
    .filter((x): x is { category: RiskCategory; score: number; level: RiskLevel } => x !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // Improvements (lowest scores = best managed)
  const improvements = assessments
    .map(a => {
      const category = getCategoryById(a.categoryId);
      return category ? { category, score: a.score, level: getRiskLevel(a.score) } : null;
    })
    .filter((x): x is { category: RiskCategory; score: number; level: RiskLevel } => x !== null)
    .sort((a, b) => a.score - b.score)
    .slice(0, 5);

  // Group averages
  const groupScores: Record<string, Array<{ score: number; weight: number }>> = {};
  for (const a of assessments) {
    const category = getCategoryById(a.categoryId);
    if (category) {
      if (!groupScores[category.group]) {
        groupScores[category.group] = [];
      }
      groupScores[category.group].push({ score: a.score, weight: category.weight });
    }
  }

  const groupAverages = Object.entries(groupScores).map(([group, scores]) => {
    const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
    const weightedAvg = scores.reduce((sum, s) => sum + s.score * s.weight, 0) / totalWeight;
    return {
      group: group as RiskGroup,
      averageScore: Math.round(weightedAvg),
      averageLevel: getRiskLevel(Math.round(weightedAvg)),
    };
  });

  return { overallScore, overallLevel, topRisks, improvements, groupAverages };
}
