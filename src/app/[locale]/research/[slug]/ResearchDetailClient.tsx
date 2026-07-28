'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FadeIn } from '@/components/ui/motion';
import { ArrowLeft, ArrowRight, FileText, MapPin, TrendingUp, Clock, AlertTriangle, CheckCircle2, BarChart3, Download, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { VideoPlayer } from '@/components/VideoPlayer';

/* ═══════════════════════════════════════════════════════════════
   VIDEO MAP — per dossier teaser (40s)
   ═══════════════════════════════════════════════════════════════ */
const dossierVideoMap: Record<string, string> = {
  'solaire-epc-b2b': '/videos/v12_solaire.mp4',
  'mre-services': '/videos/v13_mre.mp4',
  'retreat-yoga-essaouira': '/videos/v14_yoga.mp4',
  'conchyliculture-dakhla': '/videos/v15_conchy.mp4',
  'cosmetique-argan-cbd': '/videos/v16_cosm.mp4',
  'mro-industriel': '/videos/v17_mro.mp4',
  'export-artisanat-terroir': '/videos/v18_export.mp4',
};

interface DossierData {
  slug: string;
  title: string;
  subtitle: string;
  phase: string;
  period: string;
  capex: string;
  tri: string;
  payback: string;
  score: string;
  zone: string;
  verdict: string;
  description: string;
  market: string;
  aides: string;
  financials: { year: string; revenue: string; ebitda: string; net: string }[];
  risks: { risk: string; mitigation: string }[];
  contacts: string;
  image: string;
  accent: string;
}

const dossiersData: Record<string, DossierData> = {
  'solaire-epc-b2b': {
    slug: 'solaire-epc-b2b',
    title: 'Solaire EPC B2B au Maroc',
    subtitle: 'Installation de panneaux solaires pour PME industrielles — autoconsommation',
    phase: 'Phase 3',
    period: '2030-2033',
    capex: '2 M MAD',
    tri: '24-28%',
    payback: '3,2 ans',
    score: '8,46/10',
    zone: 'Casablanca-Settat + Tanger',
    verdict: 'GO CONDITIONNEL — Score 8,46/10. TRI projet 24-28%, TRI actionnaire 32-38%. Payback 3,2 ans. Meilleur ratio opportunité/risque du portefeuille Harch Corp.',
    description: "Installation clé en main de systèmes solaires photovoltaïques en autoconsommation pour PME industrielles marocaines. Le Maroc vise 52% d'énergie renouvelable d'ici 2030, avec un pipeline de 4,4 GW à installer. La Loi 82-21 (effective juin 2026) encadre trois régimes d'autoproduction avec surplus plafonné à 20%.",
    market: "Marché solaire Maroc fin 2025 : 1,09 GW (première fois >1 GW). Pipeline MASEN+ONEE : +4,4 GW dont 1,7 GW approuvés dès 2026. SolarPower Europe prévoit 2,97 GW PV au Maroc d'ici 2028. Tarif électrique industriel : 0,60-1,20 MAD/kWh. Segments cibles : agroalimentaire (Lesieur, Cosumar, Centrale Laitière), textile, chimie, automobile. 10 concurrents identifiés : Jet Contractors (leader), GreenWagic, ITMO.solar, Enolis, CP Tech, Sunenergy, Contractors RE, Energy Builder, Astria, Optimum Solar.",
    aides: "FDI (10-30% investissement, plafond 50M MAD), FNME (subvention éco-efficacité), MOWAKABA (90% digitalisation, plafond 400K MAD), Damane Technologie (garantie 70%), Intelika (prêt 1,2M MAD à 2%), ISTITMAR PME, Awrach (1500 MAD/salarié/mois), exonération IS zone franche TFZ (0% pendant 5 ans). Cumul maximum : 6,85M MAD.",
    financials: [
      { year: 'An 1', revenue: '5,2 M MAD', ebitda: '+0,8 M MAD', net: '+0,5 M MAD' },
      { year: 'An 2', revenue: '15,6 M MAD', ebitda: '+3,5 M MAD', net: '+2,4 M MAD' },
      { year: 'An 3', revenue: '28,5 M MAD', ebitda: '+6,8 M MAD', net: '+4,5 M MAD' },
      { year: 'An 4', revenue: '41,2 M MAD', ebitda: '+9,2 M MAD', net: '+6,1 M MAD' },
      { year: 'An 5', revenue: '50,8 M MAD', ebitda: '+10,5 M MAD', net: '+7,5 M MAD' },
    ],
    risks: [
      { risk: 'Crédit client (paiements 90-120j)', mitigation: 'Acompte 30% + assurance Coface + factoring' },
      { risk: 'Change USD (import panneaux Chine)', mitigation: 'Couverture forward + stock tampon' },
      { risk: 'Concurrence Jet Contractors', mitigation: 'Spécialisation verticale agroalimentaire + monitoring IA' },
      { risk: 'Réglementaire (changement tarif)', mitigation: 'Veille ANRE + diversification clients' },
    ],
    contacts: 'MASEN, ONEE, AMDI, Maroc PME, Tamwilcom, AMISOEL, FMER. Fournisseurs : LONGi, JA Solar, Trina, Canadian Solar. Banques : Attijariwafa, BMCE, CIH (lignes vertes).',
    image: '/images/sections/energy-solar-farm.jpg',
    accent: '#4A7B5F',
  },
  'mre-services': {
    slug: 'mre-services',
    title: 'Plateforme MRE Services',
    subtitle: "Super-app digitale pour Marocains Résidant à l'Étranger",
    phase: 'Phase 2',
    period: '2028-2030',
    capex: '1,5 M MAD',
    tri: '31%',
    payback: '2,4 ans',
    score: '8,1/10',
    zone: 'Casablanca + France/Espagne/Belgique',
    verdict: 'GO CONDITIONNEL — Score 8,1/10. TRI 31%, payback 2,4 ans. Effet levier aides 2,8x le capex. Marché colossal : 5,8M MRE, 122 Mds MAD/an de transferts.',
    description: "Plateforme digitale intégrée pour les 5,8 millions de MRE qui transfèrent 122 Mds MAD/an au Maroc. Services : gestion locative, conciergerie, formalités administratives, santé, funéraire transfrontalier. Modèle multi-revenus : abonnement + commissions + services premium.",
    market: "5,8M MRE dans le monde (France 1,5M, Espagne 800K, Belgique 600K, Pays-Bas 400K, Italie 400K). Transferts : 117,7 Mds MAD (2024) → 122 Mds MAD (2025), doublé depuis 2019. Visites MRE au Maroc : 4-5M/an. Investissements MRE : immobilier 60%, business 15%, finance 25%. Concurrents : banques MRE (BMCE, Attijariwafa, BP, CIH), Wafacash, Cash Plus, Mubawab, Glovo.",
    aides: "Innov Invest (prêt d'honneur 500K MAD + prime 170K), MOWAKABA (90% digitalisation, plafond 400K), Intelika (prêt 1,2M MAD à 2%), Damane Technologie (garantie 70%), CFC (IS forfaitaire 15%), Awrach. Cumul maximum : 4,22M MAD (levier 2,8x).",
    financials: [
      { year: 'An 1', revenue: '0', ebitda: '-183 K MAD', net: '-338 K MAD' },
      { year: 'An 2', revenue: '119 K MAD', ebitda: '-80 K MAD', net: '-240 K MAD' },
      { year: 'An 3', revenue: '600 K MAD', ebitda: '+21 K MAD', net: '+138 K MAD' },
      { year: 'An 4', revenue: '2 030 K MAD', ebitda: '+1 130 K MAD', net: '+1 030 K MAD' },
      { year: 'An 5', revenue: '4 593 K MAD', ebitda: '+3 174 K MAD', net: '+2 679 K MAD' },
    ],
    risks: [
      { risk: 'Confiance MRE (méfiance en ligne)', mitigation: 'Parrainage associations diaspora + notariat' },
      { risk: 'Réglementaire (intermédiation financière, RGPD)', mitigation: 'Avocat spécialisé + licences' },
      { risk: 'Concurrence banques MRE', mitigation: 'Spécialisation super-app intégrée' },
      { risk: 'Cyber (données sensibles)', mitigation: '2FA hardware + chiffrement bout en bout' },
    ],
    contacts: 'CCME, Fondation Hassan II MRE, Ministère MRE, Maroc PME, Tamwilcom, AMDI. Banques MRE : BMCE Bank of Africa, Attijariwafa, Banque Populaire, CIH.',
    image: '/images/blog/african-data-sovereignty.jpg',
    accent: '#8B9DAF',
  },
  'retreat-yoga-essaouira': {
    slug: 'retreat-yoga-essaouira',
    title: 'Retreat Yoga & Wellness Essaouira',
    subtitle: 'Modèle hybride B2C/B2B/silver — Capex 5M MAD',
    phase: 'Phase 4',
    period: '2033-2036',
    capex: '5 M MAD',
    tri: '19%',
    payback: '4 ans',
    score: '7,0/10',
    zone: 'Sidi Kaouki / Ounagha (Essaouira)',
    verdict: 'GO CONDITIONNEL — Score 7,0/10. TRI 19%, payback 4 ans. Seul projet avec TRI positif sans aides. Timing macro parfait : tourisme record, CM 2030, wellness 990 Mds$.',
    description: "Retreat premium yoga & wellness à Essaouira, modèle hybride : B2C retreats (60%), B2B corporate (25%), silver retreats (15%). Timing parfait : tourisme Maroc 19,8M arrivées 2025 (record), Essaouira 2e destination tendance Allemands (+724%), CM 2030 budget >50 MMDH.",
    market: "Tourisme Maroc 2024 : 17,4M arrivées (+20%). 2025 : 19,8M (+14%, record). Recettes devises : 112 Mds MAD. Wellness tourism mondial : 990 Mds$ (CAGR 8-9%). Yoga retreat mondial : 11,8 Mds$ (CAGR 9,8%). Essaouira : >1M touristes 2024. Fenêtre : aucun retreat premium pur digital detox + yoga + hammam + argan à Essaouira. Concurrents Essaouira : La Vida Surf, Holy Surf, Mellow Beach House. Concurrents mondial : Bali, Tulum, Ibiza, Goa.",
    aides: "Go Siyaha (hébergement 30%, animation 35%, croissance verte 40%, conseil 90% — enveloppe 720 MDH), Fonds Hassan II tourisme, FDT, ONMT marketing, Tahwila, Intelika (1,2M MAD), Damane Express, Awrach, ISTITMAR PME. Cumul : 2,4-2,8M MAD (54% capex).",
    financials: [
      { year: 'An 1', revenue: '2,5 M MAD', ebitda: '-0,3 M MAD', net: '-0,7 M MAD' },
      { year: 'An 2', revenue: '4,5 M MAD', ebitda: '+0,7 M MAD', net: '+0,2 M MAD' },
      { year: 'An 3', revenue: '6,0 M MAD', ebitda: '+1,5 M MAD', net: '+0,9 M MAD' },
      { year: 'An 4', revenue: '8,0 M MAD', ebitda: '+2,4 M MAD', net: '+1,6 M MAD' },
      { year: 'An 5', revenue: '10,0 M MAD', ebitda: '+3,2 M MAD', net: '+2,2 M MAD' },
    ],
    risks: [
      { risk: 'Saisonnalité (occupation <35% an 1)', mitigation: 'Préventes 6 mois avant + B2B corporate + silver' },
      { risk: 'Change EUR/MAD', mitigation: 'Couverture forward + tarification EUR' },
      { risk: 'Concurrence Bali/Tulum', mitigation: 'Positionnement terroir marocain + argan + hammam' },
      { risk: 'Foncier (urbanisme Essaouira)', mitigation: 'Hinterland Ounagha/Diabat + permis sécurisé' },
    ],
    contacts: 'ONMT, Maroc PME (Go Siyaha), CRT Essaouira/Marrakech-Safi, CRI Marrakech-Safi, Agence Urbaine Essaouira. Teachers yoga marocains/expatriés.',
    image: '/images/sections/overview-casablanca.jpg',
    accent: '#C4964A',
  },
  'conchyliculture-dakhla': {
    slug: 'conchyliculture-dakhla',
    title: 'Conchyliculture Dakhla',
    subtitle: 'Moules + huîtres — baie de Dakhla',
    phase: 'Phase 5',
    period: '2036-2040',
    capex: '3 M MAD',
    tri: '-8% à +26%',
    payback: '36-48 mois',
    score: '6,05/10',
    zone: 'Baie de Dakhla',
    verdict: 'GO CONDITIONNEL — Score 6,05/10. TRI négatif sans subventions (-8,1%), positif avec (+26,2%). Risques tueurs : herpesvirus (50%), statut ONSSA UE (30%), image Dakhla (35%).',
    description: "Conchyliculture (moules + huîtres) dans la baie de Dakhla. Dakhla = 50% production aquacole nationale marine, 64,77% conchylicole. Loi 84-21 (décembre 2022) + Décret 2-24-830 (décembre 2025). Concessions : 3 000 MAD/ha/an. Objectif Maroc : 7 600 T huîtres (vs 600 T actuelle = énorme marge).",
    market: "Dakhla : 50% production aquacole nationale. Concessions ANDA 3 000 MAD/ha/an (Domaine Public Maritime). Objectif 7 600 T huîtres Maroc. Demande UE : 500 000 T importées/an. Prix FOB Maroc vs retail Europe : marge significative. Concurrence : Espagne, France, Italie, Grèce, Turquie.",
    aides: "ANDA subvention 20% (plafond 2 MDH), Plan Halieutis, Charte Investissement, exonérations fiscales Sud, Awrach (1500 MAD/salarié/mois × 9 mois), Intelika, Damane, Innov Invest. Cumul : 810K MAD.",
    financials: [
      { year: 'An 1', revenue: '0', ebitda: '-1,2 M MAD', net: '-1,5 M MAD' },
      { year: 'An 2', revenue: '1,5 M MAD', ebitda: '-0,5 M MAD', net: '-0,8 M MAD' },
      { year: 'An 3', revenue: '3,5 M MAD', ebitda: '+0,8 M MAD', net: '+0,4 M MAD' },
      { year: 'An 4', revenue: '5,0 M MAD', ebitda: '+1,5 M MAD', net: '+1,0 M MAD' },
      { year: 'An 5', revenue: '5,0 M MAD', ebitda: '+1,6 M MAD', net: '+1,1 M MAD' },
    ],
    risks: [
      { risk: 'Herpesvirus huîtres (50% probabilité)', mitigation: 'Souche locale résistante + suivi vétérinaire ANDA' },
      { risk: 'Statut export UE mollusques (à vérifier)', mitigation: 'Pré-validation ONSSA avant investissement' },
      { risk: 'Image Dakhla ("huîtres de conflit")', mitigation: 'Positionnement premium + traçabilité blockchain' },
      { risk: 'Climat (tempêtes)', mitigation: 'Baie protégée + assurance culture' },
    ],
    contacts: 'ANDA, coopératives aquacoles Dakhla, bureaux d\'études spécialisés, acheteurs européens potentiels.',
    image: '/images/sections/water-desal.jpg',
    accent: '#6888A8',
  },
  'cosmetique-argan-cbd': {
    slug: 'cosmetique-argan-cbd',
    title: 'Cosmétique Argan + CBD + Figuier',
    subtitle: 'Marque premium export — combo unique au monde',
    phase: 'Phase 2+',
    period: '2028+',
    capex: '2 M MAD',
    tri: '30-40%',
    payback: '24-36 mois',
    score: '6,5/10',
    zone: 'Souss-Massa + Casablanca',
    verdict: 'GO CONDITIONNEL — Score 6,5/10. TRI 82% scénario central (risque réglementaire CBD UE). Amazon interdit CBD. 6 conditions suspensives dont licence ANRAC.',
    description: "Marque cosmétique premium combinant 3 actifs uniques au monde : argan (exclusivité Maroc), CBD (légal depuis Loi 13-21 de 2021), figuier de barbarie (endémique). Marché cosmétique CBD mondial : 25 Mds$ en 2032. 40-50% du capex couvrable en subventions.",
    market: "Marché cosmétique naturel mondial : croissance 8-10%/an. CBD cosmétique : 25 Mds$ 2032. Loi 13-21 (2021) a légalisé CBD cosmétique au Maroc. 67 produits ANRAC-approved. Premières exportations légales 2025. Amazon interdit CBD — distribution DTC + pharmacies. Concurrents : L'Occitane, Melvita, Nuxe, Kahina, Natural Delights.",
    aides: "Fonds Hassan II (15%, plafond 30 MDH), ISTITMAR (20%, plafond 10 MDH), MOWAKABA (90%, plafond 400K), Intelika (1,2M MAD), Innov Invest (prêt participatif). Cumul : 800K subventions + 1,2M crédit.",
    financials: [
      { year: 'An 1', revenue: '0,96 M MAD', ebitda: '-0,7 M MAD', net: '-0,9 M MAD' },
      { year: 'An 2', revenue: '4,8 M MAD', ebitda: '+0,44 M MAD', net: '+0,2 M MAD' },
      { year: 'An 3', revenue: '14,4 M MAD', ebitda: '+3,7 M MAD', net: '+2,5 M MAD' },
      { year: 'An 4', revenue: '28,0 M MAD', ebitda: '+9,5 M MAD', net: '+6,8 M MAD' },
      { year: 'An 5', revenue: '48,0 M MAD', ebitda: '+17,2 M MAD', net: '+12,5 M MAD' },
    ],
    risks: [
      { risk: 'Réglementaire CBD UE (changement possible)', mitigation: 'Veille + diversification actifs (argan, figuier)' },
      { risk: 'Refus/retard licence ANRAC', mitigation: 'Pré-dossier ANRAC avant investissement' },
      { risk: 'Concurrence L\'Occitane, Melvita', mitigation: 'Positionnement combo unique + terroir marocain' },
      { risk: 'Supply chain argan (saison, coopératives)', mitigation: 'Contrats long terme + stock tampon' },
    ],
    contacts: 'ANRAC, ONSSA, coopératives argan Souss-Massa, laboratoires formulation cosmétique Maroc, distributeurs UE.',
    image: '/images/sections/agri-aerial-drone.jpg',
    accent: '#A87878',
  },
  'mro-industriel': {
    slug: 'mro-industriel',
    title: 'MRO Industriel',
    subtitle: 'Maintenance industrielle multi-sectorielle',
    phase: 'Phase 6+',
    period: '2040+',
    capex: '5 M MAD',
    tri: '18-25%',
    payback: '18-30 mois',
    score: '7,5/10',
    zone: 'Casablanca + Tanger',
    verdict: 'GO CONDITIONNEL (projet recentré à 5M MAD) — Score 7,5/10. Cash burn 1,68M MAD sur 3 ans si projet 3M. Recentrage 2 verticales + capitalisation 5M MAD requis.',
    description: "Maintenance Repair Operations multi-sectorielle pour zones franches (Tanger Med, AFZ, Midparc). Demande structurelle des usines en expansion. Évolutivité vers MRO 4.0 prédictif (IA, IoT).",
    market: "Tissu industriel Maroc : zones franches Tanger Med, AFZ, Midparc en expansion. Taux d'externalisation maintenance en croissance. Tendances : MRO 4.0 (IA, IoT, prédictif), outsourcing, frameworks contracts. Concurrents : Sofrapex, Geodata, Jet Contractors.",
    aides: "FDI (10-30%, plafond 50M MAD), Intelika, Damane Technologie (garantie 70%), MOWAKABA, Awrach, ISTITMAR PME, programme Warcha (Maroc PME). Exonérations zones franches TFZ/AFZ (0% IS 5 ans). Cumul : 40-60% capex.",
    financials: [
      { year: 'An 1', revenue: '3,0 M MAD', ebitda: '-0,5 M MAD', net: '-0,8 M MAD' },
      { year: 'An 2', revenue: '10,0 M MAD', ebitda: '+1,0 M MAD', net: '+0,5 M MAD' },
      { year: 'An 3', revenue: '18,0 M MAD', ebitda: '+2,5 M MAD', net: '+1,5 M MAD' },
      { year: 'An 4', revenue: '25,0 M MAD', ebitda: '+4,0 M MAD', net: '+2,8 M MAD' },
      { year: 'An 5', revenue: '35,0 M MAD', ebitda: '+6,5 M MAD', net: '+4,5 M MAD' },
    ],
    risks: [
      { risk: 'Dépendance 1-2 grands comptes (60-80% CA)', mitigation: 'Diversification client + framework contracts' },
      { risk: 'Pénurie techniciens PLC/automation', mitigation: 'Formation interne + partenariat OFPPT' },
      { risk: 'Cash flow (paiements 90-120j)', mitigation: 'Factoring + acompte 30%' },
      { risk: 'Concurrence Sofrapex, Jet Contractors', mitigation: 'Spécialisation MRO 4.0 prédictif' },
    ],
    contacts: 'Maroc PME (Warcha), AMDI, FNPME, OEM (Bosch Rexroth, SKF, Siemens, Schneider), SAPST (Tanger), SAFSA (Midparc), AFZ.',
    image: '/images/sections/cement-kiln.jpg',
    accent: '#666666',
  },
  'export-artisanat-terroir': {
    slug: 'export-artisanat-terroir',
    title: 'Export Artisanat Multi-Terroir',
    subtitle: 'Argan + safran + dattes + eau de rose vers UE/USA',
    phase: 'Phase 2+',
    period: '2028+',
    capex: '2,5 M MAD',
    tri: '14-18%',
    payback: '24-36 mois',
    score: '6,5/10',
    zone: 'TFZ + Casablanca logistique',
    verdict: 'GO CONDITIONNEL — Score 6,5/10. TRI 14-18%, payback 4,5-5 ans. BFR critique an 1 (-950K MAD). EUDR non applicable (vérifié).',
    description: "Export de produits du terroir marocain (huile d'argan bio, safran AOP, dattes Medjool, eau de rose, miel de thym) vers UE/USA/Japon. Revenus EUR/USD. Fiscalité TFZ 0% pendant 5 ans. Différentiel prix énorme : safran 5-8€/g Maroc vs 15-30€/g retail UE.",
    market: "Marché argan mondial : $480M (2026) → $1,24 Md. Safran : 5-8€/g Maroc vs 15-30€/g retail UE. Dattes Medjool : marché en croissance. EUDR (Règlement déforestation UE) : NON applicable aux 5 produits. Distribution : épiceries fines UE, marketplaces, pharmacies, DTC.",
    aides: "ISTITMAR PME (20-30%, plafond 10 MDH), MOWAKABA (90%, plafond 400K), Intelika (1,2M MAD), Innov Invest, Damane Export (garantie 60%), ASMEX, CSF Maroc Export. TFZ (0% IS 5 ans). Cumul : 1,3-1,6M MAD (51-63% capex).",
    financials: [
      { year: 'An 1', revenue: '3,0 M MAD', ebitda: '-0,5 M MAD', net: '-0,8 M MAD' },
      { year: 'An 2', revenue: '8,0 M MAD', ebitda: '+0,5 M MAD', net: '+0,2 M MAD' },
      { year: 'An 3', revenue: '15,0 M MAD', ebitda: '+2,0 M MAD', net: '+1,3 M MAD' },
      { year: 'An 4', revenue: '25,0 M MAD', ebitda: '+4,0 M MAD', net: '+2,8 M MAD' },
      { year: 'An 5', revenue: '35,0 M MAD', ebitda: '+6,0 M MAD', net: '+4,2 M MAD' },
    ],
    risks: [
      { risk: 'Sous-capitalisation BFR an 1 (-950K MAD)', mitigation: 'Intelika 1M + love money 300-500K' },
      { risk: 'Saturation marché argan cosmétique', mitigation: 'Repositionnement argan alimentaire + multi-terroir' },
      { risk: 'Volatilité supply chain (11 coopératives)', mitigation: 'Contrats long terme + stock tampon' },
      { risk: 'Miel refoulements UE (25-30%)', mitigation: 'Certification renforcée + laboratoire partenaire' },
    ],
    contacts: 'ASMEX, AMDI, coopératives argan/safran/dattes/roses, Ecocert/Bureau Veritas (certifications), courtiers douane Tanger Med.',
    image: '/images/blog/carbon-credit-markets-africa.jpg',
    accent: '#6BAF6B',
  },
};

export default function ResearchDetailClient({ slug }: { slug: string }) {
  const dossier = dossiersData[slug];

  if (!dossier) {
    return (
      <div className="bg-[#0D0D0D] min-h-screen flex items-center justify-center">
        <p className="text-white/50">Dossier not found.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0D0D0D] min-h-screen">
      {/* ═══ HERO avec image plein écran ═══ */}
      <section className="relative h-[60vh] w-full overflow-hidden">
        <Image
          src={dossier.image}
          alt={dossier.title}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D0D0D]/40 via-[#0D0D0D]/70 to-[#0D0D0D]" />
        <div className="absolute inset-0 data-grid-pattern opacity-30" />

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 h-full flex flex-col justify-end pb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <Link href="/research" className="inline-flex items-center gap-2 text-[12px] text-white/40 hover:text-white transition-colors mb-6 font-mono uppercase tracking-wider">
              <ArrowLeft className="w-4 h-4" />
              Research
            </Link>

            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white" style={{ background: dossier.accent }}>
                {dossier.phase}
              </span>
              <span className="text-[12px] text-white/40 font-mono">{dossier.period}</span>
              <span className="pulse-dot" style={{ background: dossier.accent, color: dossier.accent }} />
            </div>

            <h1 className="text-[clamp(1.75rem,5vw,3.5rem)] font-extrabold text-white tracking-[-0.02em] leading-[1.1] mb-3 max-w-3xl">
              {dossier.title}
            </h1>
            <p className="text-[clamp(0.875rem,1.5vw,1.125rem)] text-white/50 leading-relaxed max-w-2xl">
              {dossier.subtitle}
            </p>

            {dossierVideoMap[slug] && (
              <div className="mt-6 w-full max-w-md">
                <VideoPlayer
                  src={dossierVideoMap[slug]}
                  variant="modal-trigger"
                  label="Watch teaser (40s)"
                  className="w-full aspect-video"
                />
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ═══ KEY METRICS — Palantir data grid ═══ */}
      <section className="py-12 bg-[#0A0A0A] border-y border-white/[0.04]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-0">
            {[
              { label: 'TRI', value: dossier.tri, icon: TrendingUp },
              { label: 'Payback', value: dossier.payback, icon: Clock },
              { label: 'Capex', value: dossier.capex, icon: Target },
              { label: 'Score', value: dossier.score, icon: BarChart3 },
              { label: 'Zone', value: dossier.zone, icon: MapPin, small: true },
            ].map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                className={`px-4 py-6 ${i < 4 ? 'md:border-r border-white/[0.04]' : ''} ${i % 2 === 0 ? 'border-r border-white/[0.04] md:border-r' : ''}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <metric.icon className="w-3.5 h-3.5" style={{ color: dossier.accent }} />
                  <span className="data-label">{metric.label}</span>
                </div>
                <p className={`data-value ${metric.small ? 'text-[12px]' : 'text-2xl md:text-3xl'}`}>
                  {metric.value}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ VERDICT ═══ */}
      <section className="py-16 md:py-20">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: `${dossier.accent}20`, border: `1px solid ${dossier.accent}40` }}>
                <CheckCircle2 className="w-4 h-4" style={{ color: dossier.accent }} />
              </div>
              <span className="data-label">Verdict</span>
            </div>
            <p className="text-[16px] text-white/80 leading-[1.8] font-light">
              {dossier.verdict}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ OVERVIEW ═══ */}
      <section className="py-16 md:py-20 bg-[#0F0F0F]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="data-label mb-6">Overview</p>
            <p className="text-[15px] text-white/60 leading-[1.9]">{dossier.description}</p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ MARKET ANALYSIS ═══ */}
      <section className="py-16 md:py-20">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="data-label mb-6">Market Analysis</p>
            <p className="text-[14px] text-white/50 leading-[1.9]">{dossier.market}</p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ FINANCIAL MODEL — Palantir data table ═══ */}
      <section className="py-16 md:py-20 bg-[#0F0F0F]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="data-label mb-6">Financial Model — 5 Year P&L</p>
            <div className="overflow-x-auto fine-card rounded-md">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th className="text-right">Revenue</th>
                    <th className="text-right">EBITDA</th>
                    <th className="text-right">Net Result</th>
                  </tr>
                </thead>
                <tbody>
                  {dossier.financials.map((f) => (
                    <tr key={f.year}>
                      <td className="font-bold text-white">{f.year}</td>
                      <td className="text-right mono-number">{f.revenue}</td>
                      <td className="text-right mono-number" style={{ color: f.ebitda.startsWith('+') ? '#4A7B5F' : '#A0524B' }}>{f.ebitda}</td>
                      <td className="text-right mono-number" style={{ color: f.net.startsWith('+') ? '#4A7B5F' : '#A0524B' }}>{f.net}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ PUBLIC SUBSIDIES ═══ */}
      <section className="py-16 md:py-20">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="data-label mb-6">Public Subsidies</p>
            <p className="text-[14px] text-white/50 leading-[1.9]">{dossier.aides}</p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ RISKS — Palantir risk matrix ═══ */}
      <section className="py-16 md:py-20 bg-[#0F0F0F]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="data-label mb-6">Risks & Mitigations</p>
            <div className="space-y-3">
              {dossier.risks.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="fine-card rounded-md p-5 flex items-start gap-4"
                >
                  <div className="w-8 h-8 rounded-md bg-[#A0524B]/10 border border-[#A0524B]/20 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4 text-[#A0524B]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] text-white font-bold mb-2">{r.risk}</p>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#4A7B5F] mt-0.5 shrink-0" />
                      <p className="text-[13px] text-white/50">{r.mitigation}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ CONTACTS ═══ */}
      <section className="py-16 md:py-20">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="data-label mb-6">Key Contacts</p>
            <p className="text-[14px] text-white/50 leading-[1.9]">{dossier.contacts}</p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <Image
          src={dossier.image}
          alt=""
          fill
          className="object-cover opacity-10"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#0D0D0D]/80" />
        <div className="absolute inset-0 data-grid-pattern opacity-20" />

        <div className="relative z-10 max-w-[800px] mx-auto px-6 md:px-12 text-center">
          <FadeIn>
            <p className="data-label mb-6">Full Dossier</p>
            <h2 className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold text-white mb-6 tracking-tight">
              Request the complete PDF dossier
            </h2>
            <p className="text-[14px] text-white/40 mb-10 max-w-xl mx-auto leading-relaxed">
              Includes: detailed market data, competitor analysis with URLs, month-by-month execution plan, sensitivity analysis, verified contact list, and legal framework references.
            </p>
            <a
              href={`/dossiers/${slug}.pdf`}
              download
              className="inline-flex items-center gap-2 px-8 py-3.5 text-[14px] font-bold rounded-md transition-all hover:scale-105"
              style={{ background: dossier.accent, color: '#0D0D0D' }}
            >
              <Download className="w-4 h-4" />
              Download Full PDF
              <ArrowRight className="w-4 h-4" />
            </a>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
