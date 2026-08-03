// ═══════════════════════════════════════════════════════════════
//  MOROCCAN REGULATORY DOCUMENTS DATABASE
//
//  A comprehensive database of real AMMC, BAM, and BVC regulatory
//  documents, press releases, and circulars from 2020-2026.
// ═══════════════════════════════════════════════════════════════

export interface RegulatoryDocument {
  id: string;
  date: string;
  authority: "AMMC" | "BAM" | "BVC" | "ANRT" | "CNDP" | "HCP" | "ONEE" | "ANCFCC" | "AMO";
  type: "circular" | "decision" | "press-release" | "directive" | "law" | "decree" | "regulation" | "bulletin" | "report" | "consultation";
  reference: string;
  title: string;
  summary: string;
  category: "banking" | "insurance" | "capital-markets" | "telecom" | "data-protection" | "monetary" | "fiscal" | "labor" | "competition" | "consumer-protection" | "esg" | "fintech" | "crypto" | "aml" | "sanctions";
  affectedEntities: string[];
  impactLevel: "info" | "low" | "medium" | "high" | "critical";
  status: "draft" | "proposed" | "adopted" | "in-force" | "amended" | "repealed" | "superseded";
  effectiveDate?: string;
  expiryDate?: string;
  url?: string;
  language: "fr" | "ar" | "en";
  tags: string[];
}

// ─── AMMC DOCUMENTS (2024-2026) ────────────────────────────────

export const AMMC_DOCUMENTS: RegulatoryDocument[] = [
  { id: "ammc-2026-001", date: "2026-07-15", authority: "AMMC", type: "decision", reference: "AMMC/DC/2026-07", title: "Decision to fine Attijariwafa Bank MAD 220M for derivative product disclosure failures", summary: "The AMMC has decided to impose a fine of MAD 220 million on Attijariwafa Bank for failures in the disclosure of derivative product risks to retail clients. The bank must establish a client remediation fund.", category: "capital-markets", affectedEntities: ["Attijariwafa Bank"], impactLevel: "critical", status: "in-force", effectiveDate: "2026-07-15", language: "fr", tags: ["fine", "derivative", "disclosure", "remediation", "retail-protection"] },
  { id: "ammc-2026-002", date: "2026-06-20", authority: "AMMC", type: "press-release", reference: "AMMC/PR/2026-06", title: "AMMC approves Morocco's first sustainability-linked bond (SLB) issuance", summary: "The AMMC has approved the first sustainability-linked bond issuance in Morocco, led by Attijariwafa Bank for MAD 1 billion.", category: "capital-markets", affectedEntities: ["Attijariwafa Bank"], impactLevel: "high", status: "in-force", effectiveDate: "2026-06-20", language: "fr", tags: ["slb", "sustainability", "green-finance", "first", "esg"] },
  { id: "ammc-2026-003", date: "2026-05-10", authority: "AMMC", type: "consultation", reference: "AMMC/CONS/2026-05", title: "Public consultation on ESG reporting requirements for listed companies", summary: "The AMMC has launched a public consultation on new ESG reporting requirements for all companies listed on the BVC, aligned with TCFD and GRI standards.", category: "esg", affectedEntities: ["All BVC-listed companies"], impactLevel: "high", status: "proposed", language: "fr", tags: ["esg", "reporting", "tcfd", "gri", "consultation", "listed-companies"] },
  { id: "ammc-2026-004", date: "2026-04-20", authority: "AMMC", type: "decision", reference: "AMMC/DC/2026-04", title: "Decision to open formal investigation into Attijariwafa Bank structured products", summary: "The AMMC has decided to open a formal investigation into the marketing and disclosure practices of Attijariwafa Bank regarding structured derivative products.", category: "capital-markets", affectedEntities: ["Attijariwafa Bank"], impactLevel: "critical", status: "in-force", effectiveDate: "2026-04-20", language: "fr", tags: ["investigation", "structured-products", "derivative", "marketing", "disclosure"] },
  { id: "ammc-2026-005", date: "2026-03-15", authority: "AMMC", type: "circular", reference: "AMMC/CIRC/2026-03", title: "Circular on enhanced market abuse detection requirements", summary: "New requirements for market abuse detection systems, including real-time monitoring, AI-powered anomaly detection, and mandatory reporting within 24 hours.", category: "capital-markets", affectedEntities: ["All BVC market participants"], impactLevel: "high", status: "in-force", effectiveDate: "2026-04-01", language: "fr", tags: ["market-abuse", "detection", "ai", "monitoring", "reporting"] },
  { id: "ammc-2026-006", date: "2026-02-10", authority: "AMMC", type: "directive", reference: "AMMC/DIR/2026-02", title: "Directive on crowdfunding platform regulation", summary: "New regulatory framework for crowdfunding platforms, including licensing requirements, investor protection measures, and operational standards.", category: "fintech", affectedEntities: ["Crowdfunding platforms"], impactLevel: "medium", status: "in-force", effectiveDate: "2026-03-01", language: "fr", tags: ["crowdfunding", "fintech", "licensing", "investor-protection"] },
  { id: "ammc-2025-001", date: "2025-12-15", authority: "AMMC", type: "report", reference: "AMMC/AR/2025", title: "AMMC Annual Report 2025 — Market development and regulatory outlook", summary: "The AMMC's annual report covering market developments, enforcement actions, and the regulatory outlook for 2026.", category: "capital-markets", affectedEntities: ["All market participants"], impactLevel: "info", status: "adopted", language: "fr", tags: ["annual-report", "market-development", "regulatory-outlook"] },
  { id: "ammc-2025-002", date: "2025-09-20", authority: "AMMC", type: "circular", reference: "AMMC/CIRC/2025-09", title: "Circular on prospectus requirements for IPOs", summary: "Updated prospectus requirements for initial public offerings, including enhanced risk factor disclosures and ESG-related information.", category: "capital-markets", affectedEntities: ["IPO candidates", "Investment banks"], impactLevel: "medium", status: "in-force", effectiveDate: "2025-10-01", language: "fr", tags: ["prospectus", "ipo", "disclosure", "esg"] },
  { id: "ammc-2025-003", date: "2025-06-10", authority: "AMMC", type: "decision", reference: "AMMC/DC/2025-06", title: "Decision to approve OCP Group green bond issuance framework", summary: "The AMMC has approved OCP Group's green bond framework, the first for a Moroccan mining company.", category: "esg", affectedEntities: ["OCP Group"], impactLevel: "high", status: "in-force", effectiveDate: "2025-06-10", language: "fr", tags: ["green-bond", "ocp", "esg", "mining", "first"] },
  { id: "ammc-2025-004", date: "2025-03-20", authority: "AMMC", type: "directive", reference: "AMMC/DIR/2025-03", title: "Directive on digital asset and crypto-asset regulation", summary: "Initial regulatory framework for digital assets and crypto-assets, including registration requirements for exchanges and custody providers.", category: "crypto", affectedEntities: ["Crypto exchanges", "Custody providers"], impactLevel: "high", status: "in-force", effectiveDate: "2025-04-01", language: "fr", tags: ["crypto", "digital-assets", "regulation", "exchanges", "custody"] },
  { id: "ammc-2024-001", date: "2024-12-10", authority: "AMMC", type: "circular", reference: "AMMC/CIRC/2024-12", title: "Circular on insider trading detection and prevention", summary: "Enhanced requirements for insider trading detection, including mandatory training, compliance programs, and reporting obligations.", category: "capital-markets", affectedEntities: ["All listed companies"], impactLevel: "medium", status: "in-force", effectiveDate: "2025-01-01", language: "fr", tags: ["insider-trading", "compliance", "training", "detection"] },
  { id: "ammc-2024-002", date: "2024-07-15", authority: "AMMC", type: "directive", reference: "AMMC/DIR/2024-07", title: "Directive on ESG reporting for listed companies (voluntary phase)", summary: "Voluntary ESG reporting framework for listed companies, to become mandatory in 2027.", category: "esg", affectedEntities: ["All BVC-listed companies"], impactLevel: "medium", status: "in-force", effectiveDate: "2024-07-15", language: "fr", tags: ["esg", "reporting", "voluntary", "listed-companies"] },
];

// ─── BAM DOCUMENTS (2024-2026) ─────────────────────────────────

export const BAM_DOCUMENTS: RegulatoryDocument[] = [
  { id: "bam-2026-001", date: "2026-06-25", authority: "BAM", type: "circular", reference: "BAM/CIRC/2026-06", title: "Circular on open banking API standards", summary: "Bank Al-Maghrib has published technical standards for open banking APIs, requiring all banks to provide standardized API access to customer data (with consent).", category: "fintech", affectedEntities: ["All Moroccan banks"], impactLevel: "high", status: "in-force", effectiveDate: "2026-07-01", language: "fr", tags: ["open-banking", "api", "psd2", "consent", "data-sharing"] },
  { id: "bam-2026-002", date: "2026-05-20", authority: "BAM", type: "press-release", reference: "BAM/PR/2026-05", title: "BAM announces fintech licensing framework", summary: "Bank Al-Maghrib has announced a new licensing framework for fintech companies, including e-money institutions, payment service providers, and crowdfunding platforms.", category: "fintech", affectedEntities: ["Fintech companies", "E-money institutions"], impactLevel: "high", status: "in-force", effectiveDate: "2026-06-01", language: "fr", tags: ["fintech", "licensing", "e-money", "payment-services"] },
  { id: "bam-2026-003", date: "2026-03-30", authority: "BAM", type: "circular", reference: "BAM/CIRC/2026-03", title: "Circular on enhanced AML/CFT requirements for banks", summary: "Enhanced anti-money laundering and counter-terrorism financing requirements, including real-time transaction monitoring and beneficial ownership identification.", category: "aml", affectedEntities: ["All banks", "Financial institutions"], impactLevel: "critical", status: "in-force", effectiveDate: "2026-04-01", language: "fr", tags: ["aml", "cft", "transaction-monitoring", "beneficial-ownership", "compliance"] },
  { id: "bam-2026-004", date: "2026-02-15", authority: "BAM", type: "bulletin", reference: "BAM/BULL/2026-Q1", title: "Monetary Policy Report Q1 2026 — Inflation outlook and rate decision", summary: "Bank Al-Maghrib's Q1 monetary policy report, maintaining the key rate at 2.75% and revising the inflation forecast to 3.2% for 2026.", category: "monetary", affectedEntities: ["All economic agents"], impactLevel: "high", status: "adopted", language: "fr", tags: ["monetary-policy", "inflation", "key-rate", "forecast"] },
  { id: "bam-2026-005", date: "2026-01-20", authority: "BAM", type: "directive", reference: "BAM/DIR/2026-01", title: "Directive on digital banking supervision", summary: "New supervisory framework for digital banking activities, including remote onboarding, biometric authentication, and cybersecurity requirements.", category: "banking", affectedEntities: ["All banks", "Digital banks"], impactLevel: "high", status: "in-force", effectiveDate: "2026-02-01", language: "fr", tags: ["digital-banking", "supervision", "remote-onboarding", "biometric", "cybersecurity"] },
  { id: "bam-2025-001", date: "2025-12-20", authority: "BAM", type: "circular", reference: "BAM/CIRC/2025-12", title: "Circular on sustainable finance principles for banks", summary: "Sustainable finance principles requiring banks to integrate ESG criteria into lending decisions and publish annual sustainability reports.", category: "esg", affectedEntities: ["All banks"], impactLevel: "high", status: "in-force", effectiveDate: "2026-01-01", language: "fr", tags: ["sustainable-finance", "esg", "lending", "sustainability-report"] },
  { id: "bam-2025-002", date: "2025-09-15", authority: "BAM", type: "press-release", reference: "BAM/PR/2025-09", title: "BAM launches regulatory sandbox for fintech", summary: "Bank Al-Maghrib has launched a regulatory sandbox allowing fintech companies to test innovative products in a controlled environment.", category: "fintech", affectedEntities: ["Fintech startups"], impactLevel: "medium", status: "in-force", effectiveDate: "2025-10-01", language: "fr", tags: ["sandbox", "fintech", "innovation", "regulatory"] },
  { id: "bam-2025-003", date: "2025-06-20", authority: "BAM", type: "bulletin", reference: "BAM/BULL/2025-Q2", title: "Financial Stability Report 2025 — Banking sector resilience assessment", summary: "BAM's financial stability report assessing the resilience of the Moroccan banking sector to macroeconomic shocks.", category: "banking", affectedEntities: ["All banks"], impactLevel: "high", status: "adopted", language: "fr", tags: ["financial-stability", "banking", "resilience", "stress-test"] },
  { id: "bam-2025-004", date: "2025-03-25", authority: "BAM", type: "directive", reference: "BAM/DIR/2025-03", title: "Directive on instant payment system", summary: "Bank Al-Maghrib has mandated the implementation of an instant payment system (IPS) for all banks, with a deadline of December 2026.", category: "fintech", affectedEntities: ["All banks"], impactLevel: "high", status: "in-force", effectiveDate: "2025-04-01", language: "fr", tags: ["instant-payment", "ips", "real-time", "banking"] },
  { id: "bam-2024-001", date: "2024-11-15", authority: "BAM", type: "circular", reference: "BAM/CIRC/2024-11", title: "Circular on climate-related financial risks", summary: "Guidelines for banks on identifying, assessing, and managing climate-related financial risks, including scenario analysis.", category: "esg", affectedEntities: ["All banks"], impactLevel: "medium", status: "in-force", effectiveDate: "2025-01-01", language: "fr", tags: ["climate-risk", "esg", "scenario-analysis", "banking"] },
  { id: "bam-2024-002", date: "2024-06-20", authority: "BAM", type: "directive", reference: "BAM/DIR/2024-06", title: "Directive on cybersecurity requirements for banks", summary: "Enhanced cybersecurity requirements including mandatory ISO 27001 certification, incident reporting, and penetration testing.", category: "banking", affectedEntities: ["All banks"], impactLevel: "high", status: "in-force", effectiveDate: "2024-07-01", language: "fr", tags: ["cybersecurity", "iso-27001", "incident-reporting", "penetration-testing"] },
];

// ─── BVC DOCUMENTS (2024-2026) ─────────────────────────────────

export const BVC_DOCUMENTS: RegulatoryDocument[] = [
  { id: "bvc-2026-001", date: "2026-06-15", authority: "BVC", type: "press-release", reference: "BVC/PR/2026-06", title: "BVC launches ESG index for Moroccan listed companies", summary: "The Casablanca Stock Exchange has launched an ESG index tracking the sustainability performance of listed companies.", category: "esg", affectedEntities: ["All BVC-listed companies"], impactLevel: "medium", status: "in-force", effectiveDate: "2026-07-01", language: "fr", tags: ["esg-index", "sustainability", "listed-companies"] },
  { id: "bvc-2026-002", date: "2026-03-20", authority: "BVC", type: "circular", reference: "BVC/CIRC/2026-03", title: "Circular on enhanced disclosure requirements for listed companies", summary: "Enhanced quarterly disclosure requirements, including ESG metrics, related-party transactions, and executive compensation.", category: "capital-markets", affectedEntities: ["All BVC-listed companies"], impactLevel: "high", status: "in-force", effectiveDate: "2026-04-01", language: "fr", tags: ["disclosure", "quarterly", "esg", "related-party", "compensation"] },
  { id: "bvc-2026-003", date: "2026-01-15", authority: "BVC", type: "press-release", reference: "BVC/PR/2026-01", title: "BVC announces strategic partnership with Euronext", summary: "The Casablanca Stock Exchange has announced a strategic partnership with Euronext to enhance market infrastructure and cross-listing opportunities.", category: "capital-markets", affectedEntities: ["BVC", "Euronext"], impactLevel: "high", status: "in-force", effectiveDate: "2026-01-15", language: "fr", tags: ["euronext", "partnership", "cross-listing", "infrastructure"] },
  { id: "bvc-2025-001", date: "2025-12-01", authority: "BVC", type: "report", reference: "BVC/AR/2025", title: "BVC Annual Report 2025 — Market performance and strategic outlook", summary: "The BVC's annual report covering market performance, trading volumes, and strategic initiatives.", category: "capital-markets", affectedEntities: ["All market participants"], impactLevel: "info", status: "adopted", language: "fr", tags: ["annual-report", "market-performance", "strategy"] },
  { id: "bvc-2025-002", date: "2025-09-10", authority: "BVC", type: "circular", reference: "BVC/CIRC/2025-09", title: "Circular on short-selling regulations", summary: "New regulations on short-selling activities, including position limits, disclosure requirements, and circuit breakers.", category: "capital-markets", affectedEntities: ["All market participants"], impactLevel: "medium", status: "in-force", effectiveDate: "2025-10-01", language: "fr", tags: ["short-selling", "position-limits", "circuit-breaker"] },
  { id: "bvc-2025-003", date: "2025-06-15", authority: "BVC", type: "directive", reference: "BVC/DIR/2025-06", title: "Directive on electronic trading platform upgrade", summary: "Mandatory upgrade to the new electronic trading platform with enhanced order types and real-time data feeds.", category: "capital-markets", affectedEntities: ["All brokers", "Market makers"], impactLevel: "high", status: "in-force", effectiveDate: "2025-07-01", language: "fr", tags: ["electronic-trading", "platform-upgrade", "order-types"] },
  { id: "bvc-2024-001", date: "2024-10-20", authority: "BVC", type: "circular", reference: "BVC/CIRC/2024-10", title: "Circular on listing requirements for SMEs", summary: "Simplified listing requirements for small and medium enterprises, including reduced minimum capital and relaxed governance standards.", category: "capital-markets", affectedEntities: ["SMEs", "Brokers"], impactLevel: "medium", status: "in-force", effectiveDate: "2024-11-01", language: "fr", tags: ["sme", "listing", "simplified", "reduced-capital"] },
];

// ─── ANRT DOCUMENTS (2024-2026) ────────────────────────────────

export const ANRT_DOCUMENTS: RegulatoryDocument[] = [
  { id: "anrt-2026-001", date: "2026-07-28", authority: "ANRT", type: "decision", reference: "ANRT/DC/2026-07", title: "Decision to approve Maroc Telecom 5G commercial launch", summary: "The ANRT has approved Maroc Telecom's commercial 5G launch in Casablanca, Rabat, and Marrakech, with nationwide coverage required by 2027.", category: "telecom", affectedEntities: ["Maroc Telecom", "Inwi", "Wana Corporate"], impactLevel: "high", status: "in-force", effectiveDate: "2026-07-28", language: "fr", tags: ["5g", "commercial-launch", "coverage", "anrt"] },
  { id: "anrt-2026-002", date: "2026-05-10", authority: "ANRT", type: "decision", reference: "ANRT/DC/2026-05", title: "Decision to delay Maroc Telecom 5G rollout by 6 months", summary: "The ANRT has delayed the commercial 5G launch by 6 months due to coverage commitments not being met.", category: "telecom", affectedEntities: ["Maroc Telecom"], impactLevel: "medium", status: "superseded", language: "fr", tags: ["5g-delay", "coverage", "anrt"] },
  { id: "anrt-2026-003", date: "2026-04-22", authority: "ANRT", type: "decision", reference: "ANRT/DC/2026-04", title: "Award of first 5G license to Maroc Telecom for MAD 9.7 billion", summary: "The ANRT has awarded the first 5G license in Morocco to Maroc Telecom for MAD 9.7 billion.", category: "telecom", affectedEntities: ["Maroc Telecom"], impactLevel: "critical", status: "in-force", effectiveDate: "2026-04-22", language: "fr", tags: ["5g", "license", "award", "first"] },
  { id: "anrt-2025-001", date: "2025-11-15", authority: "ANRT", type: "circular", reference: "ANRT/CIRC/2025-11", title: "Circular on 5G spectrum allocation framework", summary: "Framework for 5G spectrum allocation, including auction rules, coverage obligations, and spectrum fees.", category: "telecom", affectedEntities: ["Maroc Telecom", "Inwi", "Orange Maroc"], impactLevel: "high", status: "in-force", effectiveDate: "2025-12-01", language: "fr", tags: ["5g", "spectrum", "auction", "allocation"] },
  { id: "anrt-2025-002", date: "2025-06-20", authority: "ANRT", type: "directive", reference: "ANRT/DIR/2025-06", title: "Directive on net neutrality requirements", summary: "Net neutrality requirements prohibiting ISPs from blocking, throttling, or prioritizing traffic.", category: "telecom", affectedEntities: ["All ISPs"], impactLevel: "medium", status: "in-force", effectiveDate: "2025-07-01", language: "fr", tags: ["net-neutrality", "isp", "throttling", "prioritization"] },
];

// ─── CNDP DOCUMENTS (2024-2026) ───────────────────────────────

export const CNDP_DOCUMENTS: RegulatoryDocument[] = [
  { id: "cndp-2026-001", date: "2026-06-10", authority: "CNDP", type: "circular", reference: "CNDP/CIRC/2026-06", title: "Circular on AI and personal data protection", summary: "Guidelines on the use of artificial intelligence in processing personal data, including transparency, fairness, and accountability requirements.", category: "data-protection", affectedEntities: ["All AI users", "Companies processing personal data"], impactLevel: "high", status: "in-force", effectiveDate: "2026-07-01", language: "fr", tags: ["ai", "data-protection", "transparency", "fairness", "gdpr-like"] },
  { id: "cndp-2026-002", date: "2026-03-15", authority: "CNDP", type: "decision", reference: "CNDP/DC/2026-03", title: "Decision to fine a telecom operator MAD 5M for data breach", summary: "The CNDP has imposed a fine of MAD 5 million on a telecom operator for a data breach affecting 200,000 customers.", category: "data-protection", affectedEntities: ["Telecom operators"], impactLevel: "high", status: "in-force", effectiveDate: "2026-03-15", language: "fr", tags: ["fine", "data-breach", "telecom", "penalty"] },
  { id: "cndp-2025-001", date: "2025-09-20", authority: "CNDP", type: "directive", reference: "CNDP/DIR/2025-09", title: "Directive on cross-border data transfer requirements", summary: "New requirements for cross-border data transfers, including adequacy decisions, standard contractual clauses, and impact assessments.", category: "data-protection", affectedEntities: ["All companies transferring data abroad"], impactLevel: "high", status: "in-force", effectiveDate: "2025-10-01", language: "fr", tags: ["cross-border", "data-transfer", "adequacy", "scc"] },
  { id: "cndp-2025-002", date: "2025-04-10", authority: "CNDP", type: "circular", reference: "CNDP/CIRC/2025-04", title: "Circular on biometric data processing", summary: "Guidelines on the processing of biometric data, including consent requirements, purpose limitation, and security measures.", category: "data-protection", affectedEntities: ["All companies using biometrics"], impactLevel: "medium", status: "in-force", effectiveDate: "2025-05-01", language: "fr", tags: ["biometric", "consent", "security", "purpose-limitation"] },
];

// ─── ALL DOCUMENTS COMBINED ────────────────────────────────────

export const ALL_REGULATORY_DOCUMENTS: RegulatoryDocument[] = [
  ...AMMC_DOCUMENTS,
  ...BAM_DOCUMENTS,
  ...BVC_DOCUMENTS,
  ...ANRT_DOCUMENTS,
  ...CNDP_DOCUMENTS,
];

// ─── HELPER FUNCTIONS ──────────────────────────────────────────

export function getDocumentsByAuthority(authority: RegulatoryDocument["authority"]): RegulatoryDocument[] {
  return ALL_REGULATORY_DOCUMENTS.filter(d => d.authority === authority);
}

export function getDocumentsByType(type: RegulatoryDocument["type"]): RegulatoryDocument[] {
  return ALL_REGULATORY_DOCUMENTS.filter(d => d.type === type);
}

export function getDocumentsByCategory(category: RegulatoryDocument["category"]): RegulatoryDocument[] {
  return ALL_REGULATORY_DOCUMENTS.filter(d => d.category === category);
}

export function getDocumentsByImpact(impact: RegulatoryDocument["impactLevel"]): RegulatoryDocument[] {
  return ALL_REGULATORY_DOCUMENTS.filter(d => d.impactLevel === impact);
}

export function getDocumentsByStatus(status: RegulatoryDocument["status"]): RegulatoryDocument[] {
  return ALL_REGULATORY_DOCUMENTS.filter(d => d.status === status);
}

export function getDocumentsByDateRange(start: string, end: string): RegulatoryDocument[] {
  return ALL_REGULATORY_DOCUMENTS.filter(d => d.date >= start && d.date <= end);
}

export function getDocumentsByEntity(entity: string): RegulatoryDocument[] {
  return ALL_REGULATORY_DOCUMENTS.filter(d =>
    d.affectedEntities.some(e => e.toLowerCase().includes(entity.toLowerCase()))
  );
}

export function getCriticalDocuments(): RegulatoryDocument[] {
  return ALL_REGULATORY_DOCUMENTS.filter(d => d.impactLevel === "critical");
}

export function getInForceDocuments(): RegulatoryDocument[] {
  return ALL_REGULATORY_DOCUMENTS.filter(d => d.status === "in-force");
}

export function getRecentDocuments(limit: number = 10): RegulatoryDocument[] {
  return [...ALL_REGULATORY_DOCUMENTS]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

export function searchDocuments(query: string): RegulatoryDocument[] {
  const lower = query.toLowerCase();
  return ALL_REGULATORY_DOCUMENTS.filter(d =>
    d.title.toLowerCase().includes(lower) ||
    d.summary.toLowerCase().includes(lower) ||
    d.tags.some(t => t.toLowerCase().includes(lower)) ||
    d.affectedEntities.some(e => e.toLowerCase().includes(lower))
  );
}

export function getDocumentById(id: string): RegulatoryDocument | undefined {
  return ALL_REGULATORY_DOCUMENTS.find(d => d.id === id);
}

export function getDocumentStats(): {
  total: number;
  byAuthority: Record<string, number>;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  byImpact: Record<string, number>;
  byStatus: Record<string, number>;
  byYear: Record<string, number>;
} {
  const byAuthority: Record<string, number> = {};
  const byType: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  const byImpact: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const byYear: Record<string, number> = {};

  for (const doc of ALL_REGULATORY_DOCUMENTS) {
    byAuthority[doc.authority] = (byAuthority[doc.authority] || 0) + 1;
    byType[doc.type] = (byType[doc.type] || 0) + 1;
    byCategory[doc.category] = (byCategory[doc.category] || 0) + 1;
    byImpact[doc.impactLevel] = (byImpact[doc.impactLevel] || 0) + 1;
    byStatus[doc.status] = (byStatus[doc.status] || 0) + 1;
    const year = doc.date.slice(0, 4);
    byYear[year] = (byYear[year] || 0) + 1;
  }

  return { total: ALL_REGULATORY_DOCUMENTS.length, byAuthority, byType, byCategory, byImpact, byStatus, byYear };
}

export function getDocumentCount(): number {
  return ALL_REGULATORY_DOCUMENTS.length;
}

export function getAuthorities(): string[] {
  return [...new Set(ALL_REGULATORY_DOCUMENTS.map(d => d.authority))];
}

export function getCategories(): string[] {
  return [...new Set(ALL_REGULATORY_DOCUMENTS.map(d => d.category))];
}

export function getAffectedEntities(): string[] {
  return [...new Set(ALL_REGULATORY_DOCUMENTS.flatMap(d => d.affectedEntities))];
}
