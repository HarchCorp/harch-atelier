// ═══════════════════════════════════════════════════════════════
//  HARCH RISK INTELLIGENCE ENGINE
//  Signal AI-style: 30+ Risk Event Categories, Industry Risk Mapping,
//  Predictive Scoring (Frequency × Impact × Velocity)
//
//  Inspired by Signal AI Global Risk Tracker methodology:
//  - 30+ Risk Event Categories (Geopolitical, Operational, Financial,
//    Environmental, Legal, Consumer, Technology)
//  - Industry-Specific Risk Mapping
//  - Real-time Risk Evolution (trajectory + momentum)
//  - Predictive scoring (not reactive)
// ═══════════════════════════════════════════════════════════════

import { Article } from "../scrapers/rss-scraper";

// ─── 30+ RISK EVENT CATEGORIES (Signal AI methodology) ──────────

export type RiskCategory =
  | "geopolitical"
  | "operational"
  | "financial"
  | "environmental"
  | "legal"
  | "consumer"
  | "technology";

export interface RiskEventCategory {
  id: string;
  label: string;
  category: RiskCategory;
  keywords: string[]; // FR + AR + EN
  defaultSeverity: number; // 0-100, baseline severity if detected
}

export const RISK_CATEGORIES: RiskEventCategory[] = [
  // ─── GEOPOLITICAL (5) ────────────────────────────────────
  {
    id: "political_unrest",
    label: "Political Unrest",
    category: "geopolitical",
    keywords: ["manifestation", "émeute", "protest", "riot", "تظاهر", "احتجاج", "hirak", "mouvement social"],
    defaultSeverity: 75,
  },
  {
    id: "trade_tensions",
    label: "Trade Tensions",
    category: "geopolitical",
    keywords: ["guerre commerciale", "tarif", "trade war", "sanction", "embargo", "حظر", "قيود تجارية"],
    defaultSeverity: 65,
  },
  {
    id: "regulatory_changes",
    label: "Regulatory Changes",
    category: "geopolitical",
    keywords: ["réglementation", "loi", "reforme", "regulation", "reform", "قانون", "إصلاح", "BAM", "AMMC", "ANRT"],
    defaultSeverity: 55,
  },
  {
    id: "geopolitical_tension",
    label: "Geopolitical Tension",
    category: "geopolitical",
    keywords: ["conflit", "tension", "war", "guerre", "confrontation", "صراع", "توتر", "sahel", "western sahara"],
    defaultSeverity: 80,
  },
  {
    id: "sovereign_risk",
    label: "Sovereign Risk",
    category: "geopolitical",
    keywords: ["notation", "rating", "downgrade", "dette souveraine", "sovereign debt", "تصنيف ائتماني"],
    defaultSeverity: 70,
  },

  // ─── OPERATIONAL (5) ─────────────────────────────────────
  {
    id: "supply_chain_disruption",
    label: "Supply Chain Disruption",
    category: "operational",
    keywords: ["chaîne d'approvisionnement", "supply chain", "rupture", "shortage", "penuria", "نقص", "انقطاع"],
    defaultSeverity: 70,
  },
  {
    id: "cyber_attack",
    label: "Cyber Attack",
    category: "operational",
    keywords: ["cyberattaque", "cyberattack", "piratage", "hack", "ransomware", "اختراق", "هجوم إلكتروني"],
    defaultSeverity: 85,
  },
  {
    id: "infrastructure_failure",
    label: "Infrastructure Failure",
    category: "operational",
    keywords: ["panne", "outage", "breakdown", "infrastructure", "coupure", "انقطاع", "عطل", "blackout"],
    defaultSeverity: 65,
  },
  {
    id: "labor_dispute",
    label: "Labor Dispute",
    category: "operational",
    keywords: ["grève", "strike", "syndicat", "union", "collective bargaining", "إضراب", "نقابة"],
    defaultSeverity: 55,
  },
  {
    id: "operational_accident",
    label: "Operational Accident",
    category: "operational",
    keywords: ["accident", "incident", "explosion", "fire", "incendie", "حادث", "انفجار", "حريق"],
    defaultSeverity: 75,
  },

  // ─── FINANCIAL (5) ───────────────────────────────────────
  {
    id: "market_volatility",
    label: "Market Volatility",
    category: "financial",
    keywords: ["volatilité", "volatility", "turbulence", "marché", "market crash", "تذبذب", "اهتزاز"],
    defaultSeverity: 60,
  },
  {
    id: "currency_fluctuation",
    label: "Currency Fluctuation",
    category: "financial",
    keywords: ["devise", "currency", "exchange rate", "taux de change", "dirham", "depreciation", "devaluation", "عملة", "صرف"],
    defaultSeverity: 50,
  },
  {
    id: "credit_risk",
    label: "Credit Risk",
    category: "financial",
    keywords: ["crédit", "credit", "default", "défaut", "impayé", "non-performing loan", "NPL", "ديون متعثرة"],
    defaultSeverity: 70,
  },
  {
    id: "financial_fraud",
    label: "Financial Fraud",
    category: "financial",
    keywords: ["fraude", "fraud", "blanchiment", "money laundering", "évasion fiscale", "tax evasion", "احتيال", "تبييض أموال"],
    defaultSeverity: 90,
  },
  {
    id: "liquidity_crisis",
    label: "Liquidity Crisis",
    category: "financial",
    keywords: ["liquidité", "liquidity", "trésorerie", "cash flow", "bank run", "سيولة", "نقدية"],
    defaultSeverity: 85,
  },

  // ─── ENVIRONMENTAL (4) ───────────────────────────────────
  {
    id: "climate_event",
    label: "Climate Event",
    category: "environmental",
    keywords: ["climate", "sécheresse", "drought", "inondation", "flood", "canicule", "heatwave", "جفاف", "فيضان", "حرارة"],
    defaultSeverity: 70,
  },
  {
    id: "natural_disaster",
    label: "Natural Disaster",
    category: "environmental",
    keywords: ["séisme", "earthquake", "tsunami", "tempête", "storm", "زلازل", "عاصفة"],
    defaultSeverity: 90,
  },
  {
    id: "pollution_incident",
    label: "Pollution Incident",
    category: "environmental",
    keywords: ["pollution", "spill", "déversement", "contamination", "emission", "تلوث", "انبعاثات"],
    defaultSeverity: 65,
  },
  {
    id: "sustainability_failure",
    label: "Sustainability Failure",
    category: "environmental",
    keywords: ["ESG", "durabilité", "sustainability", "carbon", "net zero", "greenwashing", "استدامة", "كربون"],
    defaultSeverity: 50,
  },

  // ─── LEGAL (4) ───────────────────────────────────────────
  {
    id: "regulatory_violation",
    label: "Regulatory Violation",
    category: "legal",
    keywords: ["infraction", "violation", "non-conformité", "compliance failure", "مخالفة", "انتهاك"],
    defaultSeverity: 70,
  },
  {
    id: "litigation",
    label: "Litigation",
    category: "legal",
    keywords: ["procès", "lawsuit", "litige", "tribunal", "court", "محاكمة", "دعوى", "قضية"],
    defaultSeverity: 60,
  },
  {
    id: "compliance_failure",
    label: "Compliance Failure",
    category: "legal",
    keywords: ["conformité", "compliance", "AML", "KYC", "GDPR", "متطلبات", "امتثال"],
    defaultSeverity: 65,
  },
  {
    id: "antitrust",
    label: "Antitrust",
    category: "legal",
    keywords: ["concurrence", "antitrust", "monopoly", "abuse of dominance", "منافسة", "احتكار"],
    defaultSeverity: 70,
  },

  // ─── CONSUMER (4) ────────────────────────────────────────
  {
    id: "product_recall",
    label: "Product Recall",
    category: "consumer",
    keywords: ["rappel", "recall", "retrait", "withdrawal", "defective", "استدعاء", "سحب"],
    defaultSeverity: 75,
  },
  {
    id: "safety_incident",
    label: "Safety Incident",
    category: "consumer",
    keywords: ["sécurité", "safety", "accident", "blessure", "injury", "danger", "سلامة", "خطر"],
    defaultSeverity: 80,
  },
  {
    id: "brand_reputation_threat",
    label: "Brand Reputation Threat",
    category: "consumer",
    keywords: ["boycott", "polémique", "controversé", "scandal", "outcry", "مقاطعة", "جدل", "فضيحة"],
    defaultSeverity: 75,
  },
  {
    id: "customer_backlash",
    label: "Customer Backlash",
    category: "consumer",
    keywords: ["mécontentement", "complaint", "réclamation", "backlash", "outrage", "استياء", "شكاوى"],
    defaultSeverity: 55,
  },

  // ─── TECHNOLOGY (4) ──────────────────────────────────────
  {
    id: "data_breach",
    label: "Data Breach",
    category: "technology",
    keywords: ["fuite de données", "data breach", "leak", "vol de données", "تسريب بيانات", "اختراق بيانات"],
    defaultSeverity: 90,
  },
  {
    id: "system_failure",
    label: "System Failure",
    category: "technology",
    keywords: ["panne", "system failure", "downtime", "bug", "crash", "عطل", "انهيار"],
    defaultSeverity: 65,
  },
  {
    id: "innovation_disruption",
    label: "Innovation Disruption",
    category: "technology",
    keywords: ["disruption", "obsolescence", "AI threat", "disruptive", "تبديد", "تهديد تقني"],
    defaultSeverity: 55,
  },
  {
    id: "ai_misuse",
    label: "AI Misuse",
    category: "technology",
    keywords: ["AI ethics", "bias", "hallucination", "deepfake", "تحيز", "أخلاقيات الذكاء الاصطناعي"],
    defaultSeverity: 60,
  },

  // ─── GOVERNANCE (3) ──────────────────────────────────────
  {
    id: "governance_failure",
    label: "Governance Failure",
    category: "legal",
    keywords: ["gouvernance", "governance", "board", "conseil d'administration", "مجلس إدارة", "حوكمة"],
    defaultSeverity: 70,
  },
  {
    id: "executive_misconduct",
    label: "Executive Misconduct",
    category: "legal",
    keywords: ["PDG", "CEO", "executive", "misconduct", "scandal", "résignation", "إدارة", "سلوك"],
    defaultSeverity: 85,
  },
  {
    id: "corruption",
    label: "Corruption",
    category: "legal",
    keywords: ["corruption", "bribe", "pot-de-vin", "népotisme", "favoritisme", "فساد", "رشوة", "محسوبية"],
    defaultSeverity: 95,
  },
];

// ─── INDUSTRY RISK PROFILES (Industry-Specific Risk Mapping) ────

export interface IndustryRiskProfile {
  industry: string;
  topRisks: { riskId: string; weight: number }[]; // 1.0 = neutral, >1.0 = amplified
  riskAppetite: "low" | "moderate" | "high";
}

export const INDUSTRY_RISK_PROFILES: IndustryRiskProfile[] = [
  {
    industry: "Banking",
    riskAppetite: "low",
    topRisks: [
      { riskId: "financial_fraud", weight: 1.8 },
      { riskId: "regulatory_violation", weight: 1.7 },
      { riskId: "cyber_attack", weight: 1.6 },
      { riskId: "liquidity_crisis", weight: 1.5 },
      { riskId: "credit_risk", weight: 1.4 },
      { riskId: "compliance_failure", weight: 1.4 },
      { riskId: "data_breach", weight: 1.3 },
    ],
  },
  {
    industry: "Telecommunications",
    riskAppetite: "moderate",
    topRisks: [
      { riskId: "cyber_attack", weight: 1.7 },
      { riskId: "system_failure", weight: 1.6 },
      { riskId: "data_breach", weight: 1.6 },
      { riskId: "regulatory_changes", weight: 1.3 },
      { riskId: "infrastructure_failure", weight: 1.4 },
    ],
  },
  {
    industry: "Mining",
    riskAppetite: "high",
    topRisks: [
      { riskId: "operational_accident", weight: 1.7 },
      { riskId: "environmental_pollution", weight: 1.6 },
      { riskId: "regulatory_violation", weight: 1.4 },
      { riskId: "labor_dispute", weight: 1.4 },
      { riskId: "sustainability_failure", weight: 1.3 },
      { riskId: "geopolitical_tension", weight: 1.3 },
    ],
  },
  {
    industry: "Retail",
    riskAppetite: "moderate",
    topRisks: [
      { riskId: "product_recall", weight: 1.6 },
      { riskId: "brand_reputation_threat", weight: 1.7 },
      { riskId: "customer_backlash", weight: 1.5 },
      { riskId: "supply_chain_disruption", weight: 1.4 },
      { riskId: "boycott", weight: 1.4 },
    ],
  },
  {
    industry: "Aviation",
    riskAppetite: "low",
    topRisks: [
      { riskId: "safety_incident", weight: 2.0 },
      { riskId: "operational_accident", weight: 1.8 },
      { riskId: "infrastructure_failure", weight: 1.5 },
      { riskId: "labor_dispute", weight: 1.4 },
      { riskId: "fuel_price", weight: 1.3 },
    ],
  },
  {
    industry: "Energy",
    riskAppetite: "high",
    topRisks: [
      { riskId: "operational_accident", weight: 1.7 },
      { riskId: "pollution_incident", weight: 1.6 },
      { riskId: "regulatory_violation", weight: 1.5 },
      { riskId: "geopolitical_tension", weight: 1.4 },
      { riskId: "climate_event", weight: 1.3 },
    ],
  },
  {
    industry: "Agro-industry",
    riskAppetite: "moderate",
    topRisks: [
      { riskId: "product_recall", weight: 1.6 },
      { riskId: "supply_chain_disruption", weight: 1.5 },
      { riskId: "climate_event", weight: 1.5 },
      { riskId: "safety_incident", weight: 1.4 },
      { riskId: "brand_reputation_threat", weight: 1.3 },
    ],
  },
  {
    industry: "Cement",
    riskAppetite: "high",
    topRisks: [
      { riskId: "pollution_incident", weight: 1.6 },
      { riskId: "operational_accident", weight: 1.5 },
      { riskId: "sustainability_failure", weight: 1.5 },
      { riskId: "regulatory_violation", weight: 1.3 },
      { riskId: "labor_dispute", weight: 1.3 },
    ],
  },
];

// ─── RISK SCORING (Signal AI Methodology) ───────────────────────
// Score = Frequency × Impact Severity × Velocity

export interface DetectedRisk {
  riskId: string;
  label: string;
  category: RiskCategory;
  frequency: number;       // 0-100, how often similar events occur
  impactSeverity: number;  // 0-100, historical consequences
  velocity: number;        // 0-100, speed at which risk is developing
  riskScore: number;       // 0-100, composite
  trajectory: "rising" | "stable" | "declining";
  momentum: number;        // -100 to +100, direction
  articleCount: number;
  industryWeight: number;  // Multiplier from industry profile
  firstDetected: string;
  lastDetected: string;
  affectedArticles: Article[];
  recommendation: string;
}

export interface IndustryRiskDashboard {
  industry: string;
  overallRisk: number;       // 0-100
  riskLevel: "low" | "moderate" | "elevated" | "high" | "critical";
  totalRisks: number;
  criticalRisks: number;
  emergingRisks: number;
  topRisks: DetectedRisk[];
  categoryBreakdown: Record<RiskCategory, { count: number; avgScore: number }>;
  trajectory: "improving" | "stable" | "deteriorating";
  monitoredCompanies: number;
  dataPoints: number;
}

// ─── DETECTION ──────────────────────────────────────────────────

export function detectRisks(articles: Article[], industry?: string): DetectedRisk[] {
  const detected: Map<string, DetectedRisk> = new Map();
  const industryProfile = industry
    ? INDUSTRY_RISK_PROFILES.find(p => p.industry === industry)
    : undefined;

  for (const article of articles) {
    const text = `${article.title} ${article.summary}`.toLowerCase();

    for (const riskCat of RISK_CATEGORIES) {
      const isMatch = riskCat.keywords.some(kw => text.includes(kw.toLowerCase()));
      if (!isMatch) continue;

      const existing = detected.get(riskCat.id);
      const industryWeight = industryProfile?.topRisks.find(r => r.riskId === riskCat.id)?.weight || 1.0;

      if (!existing) {
        const sentimentImpact = article.sentiment === "negative" ? 1.3 : article.sentiment === "positive" ? 0.7 : 1.0;
        const impactSeverity = Math.min(100, riskCat.defaultSeverity * industryWeight * sentimentImpact);

        detected.set(riskCat.id, {
          riskId: riskCat.id,
          label: riskCat.label,
          category: riskCat.category,
          frequency: 15, // Initial frequency
          impactSeverity: Math.round(impactSeverity),
          velocity: 50,  // Baseline
          riskScore: 0,  // Calculated below
          trajectory: "stable",
          momentum: 0,
          articleCount: 1,
          industryWeight,
          firstDetected: article.publishedAt,
          lastDetected: article.publishedAt,
          affectedArticles: [article],
          recommendation: getRiskMitigation(riskCat.id, impactSeverity),
        });
      } else {
        existing.articleCount++;
        existing.affectedArticles.push(article);
        existing.lastDetected = article.publishedAt > existing.lastDetected
          ? article.publishedAt
          : existing.lastDetected;

        // Update frequency (more articles = higher frequency)
        existing.frequency = Math.min(100, 15 + existing.articleCount * 8);

        // Update impact severity based on sentiment
        const sentimentImpact = article.sentiment === "negative" ? 1.05 : article.sentiment === "positive" ? 0.95 : 1.0;
        existing.impactSeverity = Math.min(100, existing.impactSeverity * sentimentImpact);

        // Velocity: if recent article (< 24h), increase velocity
        const articleAge = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60);
        if (articleAge < 24) {
          existing.velocity = Math.min(100, existing.velocity + 15);
          existing.momentum = Math.min(100, existing.momentum + 10);
        } else if (articleAge < 72) {
          existing.velocity = Math.min(100, existing.velocity + 8);
          existing.momentum = Math.min(100, existing.momentum + 5);
        }
      }
    }
  }

  // Calculate trajectory and final risk score
  const results = Array.from(detected.values());
  for (const risk of results) {
    // Composite score: Frequency × Impact × Velocity
    risk.riskScore = Math.round(
      (risk.frequency * 0.30) +
      (risk.impactSeverity * 0.50) +
      (risk.velocity * 0.20)
    );

    risk.trajectory =
      risk.momentum > 20 ? "rising" :
      risk.momentum < -10 ? "declining" : "stable";
  }

  return results.sort((a, b) => b.riskScore - a.riskScore);
}

function getRiskMitigation(riskId: string, severity: number): string {
  const mitigations: Record<string, string> = {
    cyber_attack: severity > 70
      ? "Activate incident response plan. Engage CIRT team, isolate affected systems, and prepare customer notification within 72 hours per GDPR/Loi 09-08."
      : "Review access controls, update patches, and conduct penetration testing within 30 days.",
    data_breach: severity > 70
      ? "Mandatory notification to CNDP (Commission Nationale de contrôle de la protection des Données à caractère Personnel) within 72 hours. Engage legal counsel and PR firm."
      : "Strengthen encryption, review data governance, and conduct audit.",
    financial_fraud: "Engage external auditor (Big 4). Notify Bank Al-Maghrib if material. Prepare disclosure per AMMC requirements.",
    product_recall: "Coordinate with ONSSA. Issue public recall notice. Prepare customer communication and refund logistics.",
    safety_incident: "Activate crisis protocol. Engage regulatory authority (ANAC/ANRT). Preserve evidence and conduct root-cause analysis.",
    corruption: "Engage independent counsel. Notify ministry of justice if material. Consider voluntary disclosure to authorities.",
    brand_reputation_threat: severity > 70
      ? "Deploy crisis communications team within 4 hours. Prepare CEO statement and social media response."
      : "Monitor social media sentiment. Prepare holding statement and Q&A.",
    regulatory_violation: "Engage legal counsel. Notify regulator within required timeframe. Implement remediation plan.",
    geopolitical_tension: "Activate geopolitical risk monitoring. Review supply chain exposure. Consider scenario planning.",
    supply_chain_disruption: "Identify alternative suppliers. Assess inventory coverage. Communicate with key customers about potential delays.",
  };

  return mitigations[riskId] || `Monitor ${riskId.replace(/_/g, " ")} developments. Prepare response protocol and review weekly.`;
}

// ─── INDUSTRY RISK DASHBOARD ────────────────────────────────────

export function buildIndustryRiskDashboard(
  industry: string,
  articlesByCompany: { company: string; articles: Article[] }[]
): IndustryRiskDashboard {
  const profile = INDUSTRY_RISK_PROFILES.find(p => p.industry === industry);
  const allArticles = articlesByCompany.flatMap(c => c.articles);
  const allRisks = detectRisks(allArticles, industry);

  // Filter to industry-relevant risks
  const relevantRiskIds = new Set(profile?.topRisks.map(r => r.riskId) || []);
  const industryRisks = relevantRiskIds.size > 0
    ? allRisks.filter(r => relevantRiskIds.has(r.riskId) || r.riskScore > 50)
    : allRisks;

  // Category breakdown
  const categoryBreakdown = {} as IndustryRiskDashboard["categoryBreakdown"];
  for (const cat of ["geopolitical", "operational", "financial", "environmental", "legal", "consumer", "technology"] as RiskCategory[]) {
    const catRisks = allRisks.filter(r => r.category === cat);
    categoryBreakdown[cat] = {
      count: catRisks.length,
      avgScore: catRisks.length > 0
        ? Math.round(catRisks.reduce((sum, r) => sum + r.riskScore, 0) / catRisks.length)
        : 0,
    };
  }

  const criticalRisks = allRisks.filter(r => r.riskScore >= 70).length;
  const emergingRisks = allRisks.filter(r => r.trajectory === "rising" && r.riskScore >= 40).length;
  const overallRisk = allRisks.length > 0
    ? Math.round(allRisks.reduce((sum, r) => sum + r.riskScore, 0) / allRisks.length)
    : 0;

  const riskLevel: IndustryRiskDashboard["riskLevel"] =
    overallRisk >= 80 ? "critical" :
    overallRisk >= 60 ? "high" :
    overallRisk >= 40 ? "elevated" :
    overallRisk >= 20 ? "moderate" : "low";

  const trajectory: IndustryRiskDashboard["trajectory"] =
    emergingRisks > criticalRisks ? "deteriorating" :
    emergingRisks < criticalRisks * 0.5 ? "improving" : "stable";

  return {
    industry,
    overallRisk,
    riskLevel,
    totalRisks: allRisks.length,
    criticalRisks,
    emergingRisks,
    topRisks: allRisks.slice(0, 10),
    categoryBreakdown,
    trajectory,
    monitoredCompanies: articlesByCompany.length,
    dataPoints: allArticles.length,
  };
}

// ─── SIGNAL AI 500-STYLE PILLARS (Innovation / Performance / Purpose) ──

export interface ReputationPillars {
  innovation: {
    score: number;       // 0-100
    weight: number;      // % importance in narrative
    themes: { theme: string; score: number }[];
  };
  performance: {
    score: number;
    weight: number;
    themes: { theme: string; score: number }[];
  };
  purpose: {
    score: number;
    weight: number;
    themes: { theme: string; score: number }[];
  };
  shareOfConversation: number;  // % vs total industry
  quarterlyTrend: number[];     // 4 quarters
}

const PILLAR_THEMES = {
  innovation: {
    keywords: ["innovation", "R&D", "recherche", "brevet", "patent", "innovation", "tech", "incubateur", "startup", "ابتكار", "بحث"],
    themes: ["Collaborations", "Products & services", "Technology"],
    themeKeywords: {
      "Collaborations": ["partenariat", "collaboration", "alliance", "joint venture", "شراكة"],
      "Products & services": ["lancement", "nouveau produit", "new product", "service", "إطلاق", "منتج"],
      "Technology": ["technologie", "IA", "AI", "digital", "plateforme", "تقنية", "ذكاء"],
    },
  },
  performance: {
    keywords: ["résultats", "performance", "croissance", "growth", "bénéfice", "profit", "EBITDA", "chiffre d'affaires", "أداء", "نمو"],
    themes: ["Governance", "Growth", "Operations"],
    themeKeywords: {
      "Governance": ["gouvernance", "governance", "board", "conseil", "audit", "حوكمة"],
      "Growth": ["croissance", "growth", "expansion", "acquisition", "نمو", "توسع"],
      "Operations": ["opérations", "operations", "production", "efficiency", "عمليات"],
    },
  },
  purpose: {
    keywords: ["ESG", "RSE", "CSR", "sustainability", "durabilité", "social", "environnement", "green", "استدامة", "مسؤولية"],
    themes: ["CSR", "Culture", "Sustainability"],
    themeKeywords: {
      "CSR": ["RSE", "CSR", "social", "communauté", "community", "fondation", "مسؤولية"],
      "Culture": ["culture", "diversité", "diversity", "inclusion", "employé", "ثقافة", "تنوع"],
      "Sustainability": ["durabilité", "sustainability", "green", "carbon", "net zero", "استدامة", "كربون"],
    },
  },
};

export function calculateReputationPillars(
  articles: Article[],
  totalIndustryArticles: number
): ReputationPillars {
  const total = articles.length || 1;

  const computePillar = (pillarKey: keyof typeof PILLAR_THEMES) => {
    const pillar = PILLAR_THEMES[pillarKey];
    const matchedArticles = articles.filter(a => {
      const text = `${a.title} ${a.summary}`.toLowerCase();
      return pillar.keywords.some(kw => text.includes(kw.toLowerCase()));
    });

    const positiveMatched = matchedArticles.filter(a => a.sentiment === "positive").length;
    const negativeMatched = matchedArticles.filter(a => a.sentiment === "negative").length;
    const sentimentScore = matchedArticles.length > 0
      ? Math.round(((positiveMatched - negativeMatched + matchedArticles.length) / (matchedArticles.length * 2)) * 100)
      : 50;

    const weight = Math.round((matchedArticles.length / total) * 100);

    const themes = pillar.themes.map(themeName => {
      const themeKws: string[] = pillar.themeKeywords[themeName as keyof typeof pillar.themeKeywords] || [];
      const themeArticles = matchedArticles.filter(a => {
        const text = `${a.title} ${a.summary}`.toLowerCase();
        return themeKws.some(kw => text.includes(kw.toLowerCase()));
      });
      const themePos = themeArticles.filter(a => a.sentiment === "positive").length;
      const themeNeg = themeArticles.filter(a => a.sentiment === "negative").length;
      const themeScore = themeArticles.length > 0
        ? Math.round(((themePos - themeNeg + themeArticles.length) / (themeArticles.length * 2)) * 100)
        : 50;
      return { theme: themeName, score: themeScore };
    });

    return { score: sentimentScore, weight, themes };
  };

  const innovation = computePillar("innovation");
  const performance = computePillar("performance");
  const purpose = computePillar("purpose");

  const totalWeight = innovation.weight + performance.weight + purpose.weight || 1;
  innovation.weight = Math.round((innovation.weight / totalWeight) * 100);
  performance.weight = Math.round((performance.weight / totalWeight) * 100);
  purpose.weight = 100 - innovation.weight - performance.weight;

  const shareOfConversation = totalIndustryArticles > 0
    ? Math.round((articles.length / totalIndustryArticles) * 100)
    : 0;

  // Quarterly trend (synthetic from article dates)
  const quarterlyTrend = [0, 0, 0, 0].map((_, q) => {
    const quarterStart = new Date();
    quarterStart.setMonth(quarterStart.getMonth() - (3 - q) * 3);
    const quarterEnd = new Date();
    quarterEnd.setMonth(quarterEnd.getMonth() - (3 - q - 1) * 3);
    const qArticles = articles.filter(a => {
      const d = new Date(a.publishedAt);
      return d >= quarterStart && d < quarterEnd;
    });
    const qPos = qArticles.filter(a => a.sentiment === "positive").length;
    const qNeg = qArticles.filter(a => a.sentiment === "negative").length;
    return qArticles.length > 0
      ? Math.round(((qPos - qNeg + qArticles.length) / (qArticles.length * 2)) * 100)
      : 50;
  });

  return {
    innovation,
    performance,
    purpose,
    shareOfConversation,
    quarterlyTrend,
  };
}
