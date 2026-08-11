/**
 * HarchCorp PDF Document Registry
 * Central index of all available PDFs with metadata
 */

export type PDFDocumentType =
  | 'data-center-spec'
  | 'gpu-compute-datasheet'
  | 'infrastructure-whitepaper'
  | 'sustainability-report'
  | 'security-overview'
  | 'network-datasheet'
  | 'board-briefing'
  | 'compliance-report'
  | 'esg-report'
  | 'board-report';

export interface PDFDocumentMeta {
  id: PDFDocumentType;
  type: string; // 'datasheet' | 'whitepaper' | 'report' | 'overview'
  pages: number;
  titleEn: string;
  titleFr: string;
  descriptionEn: string;
  descriptionFr: string;
  category: string; // 'infrastructure' | 'compute' | 'sustainability' | 'security' | 'network'
  featured: boolean;
}

export const PDF_CATALOG: PDFDocumentMeta[] = [
  {
    id: 'data-center-spec',
    type: 'datasheet',
    pages: 4,
    titleEn: 'Data Center Technical Specification — Dakhla DC-1',
    titleFr: 'Fiche Technique Centre de Données — Dakhla DC-1',
    descriptionEn: 'Complete technical specifications for our Tier IV data center in Dakhla, Morocco. Electrical, cooling, security, and sustainability details.',
    descriptionFr: 'Spécifications techniques complètes de notre centre de données Tier IV à Dakhla, Maroc. Détails électriques, refroidissement, sécurité et durabilité.',
    category: 'infrastructure',
    featured: true,
  },
  {
    id: 'gpu-compute-datasheet',
    type: 'datasheet',
    pages: 3,
    titleEn: 'GPU Compute Cloud Datasheet',
    titleFr: 'Fiche GPU Compute Cloud',
    descriptionEn: 'Full GPU instance specifications, pricing, and competitive comparison. H100, H200, B200, and L40S configurations.',
    descriptionFr: 'Spécifications complètes des instances GPU, tarification et comparaison concurrentielle. Configurations H100, H200, B200 et L40S.',
    category: 'compute',
    featured: true,
  },
  {
    id: 'infrastructure-whitepaper',
    type: 'whitepaper',
    pages: 8,
    titleEn: 'AI-Native Infrastructure for Africa and Europe',
    titleFr: 'L\'Infrastructure AI-Native pour l\'Afrique et l\'Europe',
    descriptionEn: 'Our comprehensive whitepaper on building sustainable AI infrastructure at the Europe-Africa gateway. Problem statement, solution, and competitive analysis.',
    descriptionFr: 'Notre livre blanc complet sur la construction d\'infrastructure AI durable à la passerelle Europe-Afrique. Problématique, solution et analyse concurrentielle.',
    category: 'infrastructure',
    featured: true,
  },
  {
    id: 'sustainability-report',
    type: 'report',
    pages: 5,
    titleEn: 'Sustainability & Impact Report 2025',
    titleFr: 'Rapport Durabilité & Impact 2025',
    descriptionEn: 'Our annual sustainability report covering environmental performance, social impact, governance, and carbon roadmap.',
    descriptionFr: 'Notre rapport annuel de durabilité couvrant la performance environnementale, l\'impact social, la gouvernance et la feuille de route carbone.',
    category: 'sustainability',
    featured: true,
  },
  {
    id: 'security-overview',
    type: 'overview',
    pages: 4,
    titleEn: 'Security & Compliance Overview',
    titleFr: 'Aperçu Sécurité & Conformité',
    descriptionEn: 'Multi-layered security approach, certifications (ISO 27001, SOC 2, PCI DSS), and regulatory compliance details.',
    descriptionFr: 'Approche de sécurité multicouche, certifications (ISO 27001, SOC 2, PCI DSS) et détails de conformité réglementaire.',
    category: 'security',
    featured: false,
  },
  {
    id: 'network-datasheet',
    type: 'datasheet',
    pages: 3,
    titleEn: 'Network & Connectivity Datasheet',
    titleFr: 'Fiche Réseau & Connectivité',
    descriptionEn: 'Submarine cable connectivity, backbone specifications, peering details, and latency from Dakhla to major cities.',
    descriptionFr: 'Connectivité par câbles sous-marins, spécifications backbone, détails de peering et latence depuis Dakhla vers les principales villes.',
    category: 'network',
    featured: false,
  },
  {
    id: 'board-briefing',
    type: 'report',
    pages: 3,
    titleEn: 'Board Briefing — Executive Synthesis',
    titleFr: 'Briefing Board-Ready — Synthèse Exécutive',
    descriptionEn: 'One-page executive briefing for the board: reputation score, key risks, decisions required. Board-ready layout.',
    descriptionFr: 'Briefing exécutif one-page pour le COMEX : score de réputation, risques clés, décisions attendues. Format board-ready.',
    category: 'governance',
    featured: false,
  },
  {
    id: 'compliance-report',
    type: 'report',
    pages: 4,
    titleEn: 'Compliance Cockpit — Regulatory Report',
    titleFr: 'Compliance Cockpit — Rapport Réglementaire',
    descriptionEn: 'Multi-regulator compliance status, audit trail, risk score, and remediation roadmap. AMMC, BAM, CNDP, RGPD.',
    descriptionFr: 'Statut conformité multi-régulateurs, piste d\'audit, score de risque et feuille de route de remédiation. AMMC, BAM, CNDP, RGPD.',
    category: 'governance',
    featured: false,
  },
  {
    id: 'esg-report',
    type: 'report',
    pages: 4,
    titleEn: 'ESG Scorecard — Extra-Financial Report',
    titleFr: 'Scorecard ESG — Rapport Extra-Financier',
    descriptionEn: 'Environmental, Social, Governance pillars. Per-pillar scores, benchmark gap, sub-metrics, and improvement roadmap.',
    descriptionFr: 'Piliers Environnement, Social, Gouvernance. Scores par pilier, écart vs benchmark, sous-métriques et feuille de route d\'amélioration.',
    category: 'sustainability',
    featured: false,
  },
  {
    id: 'board-report',
    type: 'report',
    pages: 6,
    titleEn: 'Board-Ready Report — Quarterly Synthesis',
    titleFr: 'Rapport Board-Ready — Synthèse Trimestrielle',
    descriptionEn: 'Multi-section board report: executive synthesis, quarterly KPIs, risk mapping, compliance status, recommendations.',
    descriptionFr: 'Rapport board multi-sections : synthèse exécutive, KPI trimestriels, cartographie des risques, statut conformité, recommandations.',
    category: 'governance',
    featured: false,
  },
];

export function getPDFMeta(id: PDFDocumentType): PDFDocumentMeta | undefined {
  return PDF_CATALOG.find(p => p.id === id);
}

export function getPDFsByCategory(category: string): PDFDocumentMeta[] {
  return PDF_CATALOG.filter(p => p.category === category);
}

export function getFeaturedPDFs(): PDFDocumentMeta[] {
  return PDF_CATALOG.filter(p => p.featured);
}
