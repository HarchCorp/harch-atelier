'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Search,
  BookOpen,
  Filter,
  Sparkles,
  Scale,
  Leaf,
  Cpu,
  Building2,
  Zap,
  Globe2,
} from 'lucide-react';

import { FadeIn, StaggerContainer, StaggerItem, CountUp } from '@/components/ui/motion';

/* ═══════════════════════════════════════════════════════════════
   GLOSSARY TERM TYPE
   ═══════════════════════════════════════════════════════════════ */

interface GlossaryTerm {
  term: string;
  definition: string;
  letter: string;
  category: 'finance' | 'energy' | 'regulatory' | 'tech' | 'sustainability' | 'aquaculture';
  expansion?: string;
}

/* ═══════════════════════════════════════════════════════════════
   60+ GLOSSARY TERMS — Harch Corp reference
   ═══════════════════════════════════════════════════════════════ */

const glossaryTerms: GlossaryTerm[] = [
  // ─────────────── A ───────────────
  {
    term: 'ANDA',
    expansion: 'Agence Nationale de Développement de l\'Aquaculture',
    definition: 'Agence Nationale de Développement de l\'Aquaculture. Établissement public marocain chargé de la planification, du suivi et de la promotion de la filière aquacole nationale, en application de la Loi 84-21. ANDA délivre les autorisations d\'exploitation pour les concessions aquacoles sur le littoral marocain.',
    letter: 'A',
    category: 'regulatory',
  },
  {
    term: 'ANRE',
    expansion: 'Autorité Nationale de Régulation de l\'Électricité',
    definition: 'Autorité Nationale de Régulation de l\'Électricité. Régulateur marocain indépendant overseeing le marché de l\'électricité, l\'accès au réseau, les tarifs, et le respect des obligations de service public. Joue un rôle clé dans l\'application de la Loi 82-21 sur l\'autoproduction électrique.',
    letter: 'A',
    category: 'regulatory',
  },
  {
    term: 'API',
    expansion: 'Application Programming Interface',
    definition: 'Application Programming Interface. Ensemble de protocoles et d\'outils permettant à des applications logicielles de communiquer entre elles. REST et gRPC sont les paradigmes d\'API couramment utilisés dans les infrastructures cloud modernes.',
    letter: 'A',
    category: 'tech',
  },

  // ─────────────── B ───────────────
  {
    term: 'Bifacial',
    definition: 'Panneaux solaires bifaces capables de capter la lumière sur leurs deux faces (recto et verso), augmentant le rendement énergétique de 5 à 30 % selon l\'albédo du sol. Particulièrement efficaces au Maroc grâce à la forte réflectivité des sols désertiques et sablonneux.',
    letter: 'B',
    category: 'energy',
  },
  {
    term: 'BREEAM',
    expansion: 'Building Research Establishment Environmental Assessment',
    definition: 'Building Research Establishment Environmental Assessment Method. Standard britannique d\'évaluation environnementale des bâtiments, évaluant la performance sur 9 catégories : énergie, santé, eau, matériaux, déchets, pollution, transport, écologie et management. Alternative au standard américain LEED.',
    letter: 'B',
    category: 'sustainability',
  },
  {
    term: 'Build in Public',
    definition: 'Méthodologie de transparence consistant à partager publiquement les étapes de développement d\'un produit ou d\'une entreprise — métriques, défis, décisions, réussites et échecs. Adoptée par Harch Corp via des publications régulières, des rapports ouverts et un suivi public des KPIs.',
    letter: 'B',
    category: 'tech',
  },

  // ─────────────── C ───────────────
  {
    term: 'CAPEX',
    expansion: 'Capital Expenditure',
    definition: 'Capital Expenditure — dépenses d\'investissement. Flux de trésorerie engagés pour acquérir, mettre à niveau ou maintenir des actifs physiques (terrains, bâtiments, équipements, infrastructures). Au contraire de l\'OPEX, le CAPEX est capitalisé et amorti sur la durée de vie utile de l\'actif. Pour un data center Tier IV de 50 MW, le CAPEX typique est de 400 à 700 M$.',
    letter: 'C',
    category: 'finance',
  },
  {
    term: 'Carbon Intensity',
    definition: 'Intensité carbone — mesurée en grammes de CO₂ émis par kilowattheure produit (gCO₂/kWh). Indicateur clé pour comparer les sources d\'énergie : charbon (~820 gCO₂/kWh), gaz (~490), solaire PV (~40-50), éolien (~11), nucléaire (~12). Le mix énergétique marocain affiche ~250 gCO₂/kWh ; le data center Harch Corp à Dakhla vise 48,2 gCO₂/kWh.',
    letter: 'C',
    category: 'sustainability',
  },
  {
    term: 'Carbon-Aware Scheduling',
    definition: 'Ordonnancement sensible au carbone — pratique consistant à déplacer temporellement et géographiquement les charges de calcul (workloads) vers des régions et créneaux horaires où l\'intensité carbone du réseau électrique est la plus faible. Implémenté dans HarchOS via un scheduler temps réel qui interroge les API de mix énergétique (ENTSO-E, ONEE) toutes les 5 minutes.',
    letter: 'C',
    category: 'tech',
  },
  {
    term: 'CC BY-NC-SA 4.0',
    expansion: 'Creative Commons Attribution-NonCommercial-ShareAlike 4.0',
    definition: 'Licence Creative Commons Attribution - Pas d\'Utilisation Commerciale - Partage dans les Mêmes Conditions 4.0 International. Permet le partage et l\'adaptation pour un usage non commercial, à condition de créditer l\'auteur et de redistribuer sous la même licence. Utilisée pour la plupart des publications ouvertes de Harch Corp.',
    letter: 'C',
    category: 'regulatory',
  },
  {
    term: 'CNDP',
    expansion: 'Commission Nationale de contrôle de la Protection des Données',
    definition: 'Commission Nationale de contrôle de la Protection des Données à caractère personnel. Autorité marocaine de protection des données (équivalent de la CNIL française), créée par la Loi 09-08. Délivre les autorisations de traitement, contrôle la conformité et sanctionne les violations. Tout traitement de données personnelles au Maroc doit être déclaré à la CNDP.',
    letter: 'C',
    category: 'regulatory',
  },
  {
    term: 'Conchyliculture',
    definition: 'Élevage de coquillages (huîtres, moules, palourdes, etc.). Filière stratégique pour la côte atlantique marocaine, particulièrement à Dakhla où les conditions d\'upwelling fournissent une eau riche en nutriments. La concession-type couvre 5 à 50 hectares, avec un cycle de production de 18 à 36 mois pour les huîtres triploïdes.',
    letter: 'C',
    category: 'aquaculture',
  },
  {
    term: 'CSP',
    expansion: 'Concentrated Solar Power',
    definition: 'Concentrated Solar Power — solaire thermodynamique. Technologie utilisant des miroirs (paraboliques, cylindro-paraboliques ou héliostats) pour concentrer le rayonnement solaire et chauffer un fluide caloporteur, produisant de la vapeur qui actionne une turbine. Permet le stockage thermique en sel fondu (10-15 heures) pour une production pilotable 24/7. Le projet Noor Ouarzazate III (150 MW) en est l\'exemple marocain emblématique.',
    letter: 'C',
    category: 'energy',
  },

  // ─────────────── D ───────────────
  {
    term: 'Data Center',
    definition: 'Centre de données — installation physique hébergeant des serveurs, équipements réseau et systèmes de stockage. Classé par tiers (I à IV) selon la disponibilité garantie : Tier I (99,671 %), Tier II (99,741 %), Tier III (99,982 %), Tier IV (99,995 %). Les data centers modernes consomment 1 à 50 MW ; les plus grands dépassent 200 MW.',
    letter: 'D',
    category: 'tech',
  },
  {
    term: 'Desalination',
    definition: 'Dessalement de l\'eau de mer ou saumâtre pour produire de l\'eau douce. Deux technologies dominantes : osmose inverse (RO, ~3-5 kWh/m³) et distillation thermique (MSF/MED, ~10-15 kWh/m³). Le Maroc vise 1,4 milliard de m³/an de capacité de dessalement d\'ici 2030 ; Harch Water développe des installations AI-optimisées à Casablanca et Dakhla.',
    letter: 'D',
    category: 'energy',
  },
  {
    term: 'DSCR',
    expansion: 'Debt Service Coverage Ratio',
    definition: 'Debt Service Coverage Ratio — ratio de couverture du service de la dette. Ratio financier mesurant la capacité d\'un projet à générer suffisamment de cash-flow pour couvrir ses obligations de remboursement (principal + intérêts). Calcul : CFOD / Service de la dette. Les prêteurs exigent généralement un DSCR minimum de 1,30x à 1,50x pour les projets d\'infrastructure.',
    letter: 'D',
    category: 'finance',
  },

  // ─────────────── E ───────────────
  {
    term: 'EBITDA',
    expansion: 'Earnings Before Interest, Taxes, Depreciation, and Amortization',
    definition: 'Bénéfice avant intérêts, impôts, dépréciation et amortissement. Indicateur financier de la rentabilité opérationnelle brute d\'une entreprise, indépendant de sa structure financière, de la fiscalité et des politiques comptables d\'amortissement. Utilisé pour comparer les entreprises d\'un même secteur et évaluer les multiples de valorisation (EV/EBITDA).',
    letter: 'E',
    category: 'finance',
  },
  {
    term: 'ESG',
    expansion: 'Environmental, Social, Governance',
    definition: 'Environmental, Social, Governance — critères extra-financiers d\'évaluation de la performance d\'une entreprise. Environmental (empreinte carbone, eau, déchets), Social (diversité, conditions de travail, impact communautaire), Governance (indépendance du conseil, transparence, éthique). Les investisseurs ESG allouent désormais 35 000 Md$ d\'actifs mondiaux.',
    letter: 'E',
    category: 'sustainability',
  },

  // ─────────────── G ───────────────
  {
    term: 'GDPR',
    expansion: 'General Data Protection Regulation',
    definition: 'Règlement Général sur la Protection des Données (RGPD) — règlement européen 2016/679 entré en vigueur le 25 mai 2018. Cadre juridique de référence pour le traitement des données personnelles dans l\'UE. Sanctions pouvant atteindre 4 % du chiffre d\'affaires mondial ou 20 M€. Influence la Loi marocaine 09-08 et sert de modèle pour la CNDP.',
    letter: 'G',
    category: 'regulatory',
  },
  {
    term: 'Go Siyaha',
    definition: 'Programme marocain d\'aide au tourisme, lancé dans le cadre du plan de relance post-COVID. Fournit des subventions directes aux entreprises du tourisme (hôtellerie, restauration, voyage) couvrant jusqu\'à 70 % des investissements de modernisation, digitalisation et formation. Complémentaire du programme Intelika pour les startups du tourisme.',
    letter: 'G',
    category: 'finance',
  },
  {
    term: 'GPU',
    expansion: 'Graphics Processing Unit',
    definition: 'Graphics Processing Unit — processeur graphique massivement parallèle, devenu le standard pour les charges d\'IA/ML. Contrairement aux CPU (quelques cœurs puissants), les GPU intègrent des milliers de cœurs plus simples, idéaux pour les opérations matricielles du deep learning. Un NVIDIA H100 SXM offre 67 TFLOPS FP64, 1979 TFLOPS FP8 et 80 Go HBM3.',
    letter: 'G',
    category: 'tech',
  },
  {
    term: 'Green Hydrogen',
    definition: 'Hydrogène vert — hydrogène produit par électrolyse de l\'eau avec de l\'électricité renouvelable (solaire, éolien). Différent de l\'hydrogène gris (issu du gaz naturel, ~10 kgCO₂/kg H₂) et de l\'hydrogène bleu (gris + captage carbone). Le Maroc vise 1 million de tonnes/an d\'H₂ vert à l\'horizon 2030 via la coalition "Green H2 Maroc", exploité par Harch Energy.',
    letter: 'G',
    category: 'energy',
  },

  // ─────────────── H ───────────────
  {
    term: 'H100 / H200',
    definition: 'GPU haut de gamme de NVIDIA, architecture Hopper. H100 (2022) : 80 Go HBM3, 1979 TFLOPS FP8, 67 TFLOPS FP64. H200 (2024) : 141 Go HBM3e, bande passante mémoire 4,8 To/s. Référence pour l\'entraînement des LLMs (GPT-4, Llama 3, Claude). Harch Intelligence opère 1 798 GPU H100/H200 répartis sur 5 hubs marocains.',
    letter: 'H',
    category: 'tech',
  },
  {
    term: 'HarchOS',
    definition: 'Plateforme d\'orchestration Harch Corp — couche logicielle propriétaire gérant le scheduling carbon-aware, l\'allocation de GPU, le stockage distribué et la facturation multi-tenant. API-compatible avec Kubernetes et S3. Hébergée exclusivement sur infrastructure marocaine souveraine (Dakhla, Tanger, Casablanca, Marrakech, Agadir).',
    letter: 'H',
    category: 'tech',
  },

  // ─────────────── I ───────────────
  {
    term: 'InfiniBand',
    definition: 'Protocole de réseau haute performance et à faible latence, utilisé dans les supercalculateurs et clusters GPU. HDR InfiniBand offre 200 Gbps par port ; NDR (2023) atteint 400 Gbps ; XDR (2025) vise 800 Gbps. Latence < 1 µs, contre ~10 µs pour Ethernet 400G. Standard de fait pour les clusters H100/H200 de Harch Intelligence.',
    letter: 'I',
    category: 'tech',
  },
  {
    term: 'Innov Invest',
    definition: 'Programme marocain de financement des startups géré par Tamwilcom, combinant prêt d\'honneur (jusqu\'à 1 MDH sans garantie ni intérêt) et prime à l\'innovation (jusqu\'à 5 MDH couvrant 60 % des dépenses R&D). Cible les startups technologiques innovantes en phase d\'amorçage et de croissance.',
    letter: 'I',
    category: 'finance',
  },
  {
    term: 'Intelika',
    definition: 'Programme de prêts à taux réduit pour startups, géré par Tamwilcom. Taux préférentiel de 2 % (vs 6-8 % marché) pour des montants de 100 000 à 5 MDH, sur 5 à 7 ans, avec différé d\'amortissement de 24 mois. Cible les phases d\'amorçage et de croissance, hors prêts Innov Invest qui couvrent l\'amont.',
    letter: 'I',
    category: 'finance',
  },
  {
    term: 'IRR',
    expansion: 'Internal Rate of Return',
    definition: 'Taux de rendement interne — taux d\'actualisation qui annule la valeur actuelle nette (VAN) d\'une série de flux de trésorerie. Mesure la rentabilité annualisée d\'un investissement. Pour les projets d\'infrastructure africains, les IRR cibles sont : énergie solaire (10-14 %), data center (15-20 %), aquaculture (12-18 %), ciment (8-12 %).',
    letter: 'I',
    category: 'finance',
  },
  {
    term: 'Islamic Finance',
    definition: 'Finance islamique — système financier conforme à la charia, interdisant le riba (intérêt), le gharar (incertitude excessive) et le maysir (spéculation). Produits clés : Murabaha (vente à marge), Ijara (leasing), Sukuk (obligations), Musharaka (partenariat), Mudaraba (gestion déléguée). Marché mondial de 4 000 Md$, fort potentiel au Maroc.',
    letter: 'I',
    category: 'finance',
  },

  // ─────────────── L ───────────────
  {
    term: 'LCOE',
    expansion: 'Levelized Cost of Energy',
    definition: 'Coût actualisé de l\'énergie — coût moyen de production d\'un kWh sur toute la durée de vie d\'une centrale, divisant le CAPEX + OPEX actualisés par la production électrique actualisée. Permet de comparer des technologies disparates : solaire PV utility-scale Maroc (~2-3 c$/kWh), éolien onshore (~3-5 c$/kWh), charbon (~7-10 c$/kWh), nucléaire (~10-15 c$/kWh).',
    letter: 'L',
    category: 'energy',
  },
  {
    term: 'LEED',
    expansion: 'Leadership in Energy and Environmental Design',
    definition: 'Leadership in Energy and Environmental Design — standard américain de certification des bâtiments durables, délivré par l\'USGBC. Quatre niveaux : Certified, Silver, Gold, Platinum. Évalue 8 catégories : sites, eau, énergie, matériaux, qualité environnementale intérieure, innovation, priorité régionale, localisation. Harch Intelligence vise LEED Gold pour le data center Dakhla.',
    letter: 'L',
    category: 'sustainability',
  },
  {
    term: 'Loi 13-21',
    definition: 'Loi marocaine 13-21 relative au cannabis à usage médical, cosmétique et industriel, promulguée en 2021. Cadre légal autorisant la culture, transformation et commercialisation du cannabis pour usages non-récréatifs dans 6 provinces (Al Hoceima, Chefchaouen, Taounate, Tétouan, Larache, Ouezzane). Vise à sortir 600 000 agriculteurs de l\'économie informelle.',
    letter: 'L',
    category: 'regulatory',
  },
  {
    term: 'Loi 43-20',
    definition: 'Loi marocaine 43-20 relative à l\'activité des établissements de paiement, promulguée en 2021. Crée le statut d\'établissement de paiement (porte-monnaie électronique, monnaie électronique, paiement en ligne), encadre les fintechs et l\'inclusion financière. Permet l\'émergence d\'acteurs comme Harch Bank et les néo-banques marocaines.',
    letter: 'L',
    category: 'regulatory',
  },
  {
    term: 'Loi 82-21',
    definition: 'Loi marocaine 82-21 relative à la production d\'électricité à partir de sources d\'énergie renouvelable et à son autoconsommation, promulguée en 2021. Remplace la Loi 13-09, autorise l\'autoproduction pour tous les types de clients (résidentiels, industriels, agricoles), avec seuils de revente du surplus au réseau ONEE. Pilier du déploiement des énergies renouvelables marocaines.',
    letter: 'L',
    category: 'regulatory',
  },
  {
    term: 'Loi 84-21',
    definition: 'Loi marocaine 84-21 relative à la Stratégie Halieutique et au développement de l\'aquaculture, promulguée en 2021. Réforme la gouvernance des pêches et de l\'aquaculture, créant les cadres pour les Concessions Aquacoles Maritimes (CAM) administrées par l\'ANDA. Vise 200 000 tonnes/an de production aquacole d\'ici 2030.',
    letter: 'L',
    category: 'regulatory',
  },

  // ─────────────── M ───────────────
  {
    term: 'MASEN',
    expansion: 'Moroccan Agency for Sustainable Energy',
    definition: 'Moroccan Agency for Sustainable Energy — agence marocaine pour l\'énergie durable, créée en 2010. Opérateur de référence pour le déploiement des énergies renouvelables : solaire (Noor Ouarzazate, Noor Midelt), éolien (Tarfaya, Taza), H₂ vert. Étendue en 2016 à l\'ensemble de la chaîne de valeur énergétique. Partenaire stratégique de Harch Energy.',
    letter: 'M',
    category: 'regulatory',
  },
  {
    term: 'MLPerf',
    definition: 'Benchmark de performance ML standardisé, géré par MLCommons. Mesure le temps d\'entraînement (Training) et d\'inférence (Inference) sur des modèles de référence (ResNet-50, BERT, GPT-3, Stable Diffusion). Référence industrielle pour comparer GPU/TPU. Les clusters H100 de Harch Intelligence publient leurs résultats MLPerf chaque cycle (v3.1, v4.0, v4.1).',
    letter: 'M',
    category: 'tech',
  },
  {
    term: 'MOWAKABA',
    definition: 'Programme marocain de subvention à la digitalisation, géré par le Ministère du Commerce et de l\'Industrie. Couvre jusqu\'à 50 % des investissements numériques des PME (ERP, CRM, e-commerce, cybersécurité), plafonné à 150 000 DH. Vise 5 000 PME digitalisées d\'ici 2026 dans le cadre du programme "Pacte Numérique".',
    letter: 'M',
    category: 'finance',
  },
  {
    term: 'MRE',
    expansion: 'Marocains Résidant à l\'Étranger',
    definition: 'Marocains Résidant à l\'Étranger. Communauté de 5,5 millions de personnes (2024), générant des transferts financiers de plus de 115 milliards de dirhams par an (première source de devises du Maroc). Marché cible prioritaire pour les services financiers, immobiliers et de consommation premium de Harch Corp.',
    letter: 'M',
    category: 'finance',
  },

  // ─────────────── N ───────────────
  {
    term: 'Net-zero',
    definition: 'Neutralité carbone — équilibre entre les émissions de gaz à effet de serre émises et retirées de l\'atmosphère. Atteint via la combinaison de réduction à la source (énergies renouvelables, efficacité) et de puits de carbone (captage, afforestation, BECCS). Le Maroc vise net-zero à l\'horizon 2050 ; Harch Corp vise 2030 pour ses opérations directes (Scope 1+2).',
    letter: 'N',
    category: 'sustainability',
  },

  // ─────────────── O ───────────────
  {
    term: 'ONEE',
    expansion: 'Office National de l\'Électricité et de l\'Eau potable',
    definition: 'Office National de l\'Électricité et de l\'Eau potable. Monopole public marocain pour le transport et la distribution d\'électricité, ainsi que la production et distribution d\'eau potable. 8 GW de capacité installée, 60 TWh distribués, 8 millions de clients électricité, 7 millions de clients eau. Partenaire obligatoire de tout projet électrique au Maroc.',
    letter: 'O',
    category: 'regulatory',
  },
  {
    term: 'ONSSA',
    expansion: 'Office National de Sécurité Sanitaire des Produits Alimentaires',
    definition: 'Office National de Sécurité Sanitaire des Produits Alimentaires. Autorité marocaine chargée de la protection de la santé du consommateur et de la préservation de la santé animale et végétale. Délivre les agréments sanitaires, contrôle les importations/exportations, certifie les produits biologiques. Habilitation obligatoire pour les exportations aquacoles vers l\'UE.',
    letter: 'O',
    category: 'regulatory',
  },
  {
    term: 'OPEX',
    expansion: 'Operating Expenditure',
    definition: 'Operating Expenditure — dépenses d\'exploitation. Charges courantes pour le fonctionnement d\'une entreprise : salaires, énergie, maintenance, loyers, consommables. Au contraire du CAPEX, l\'OPEX est intégralement déductible fiscalement l\'année de l\'engagement. Pour un data center, l\'OPEX annuel représente 15-25 % du CAPEX initial.',
    letter: 'O',
    category: 'finance',
  },

  // ─────────────── P ───────────────
  {
    term: 'PPA',
    expansion: 'Power Purchase Agreement',
    definition: 'Power Purchase Agreement — contrat d\'achat d\'électricité à long terme (10-25 ans) entre un producteur et un acheteur (utilité, entreprise, gouvernement). Garantit un prix fixe ou indexé, sécurise le revenu du projet et permet le financement bancaire. Variantes : PPA physique (livraison d\'électricité), PPA virtuel/synthetic (différentiel financier), sleeved PPA (via ONEE).',
    letter: 'P',
    category: 'finance',
  },
  {
    term: 'PUE',
    expansion: 'Power Usage Effectiveness',
    definition: 'Power Usage Effectiveness — efficacité d\'utilisation d\'énergie des data centers. Ratio = énergie totale consommée / énergie IT. PUE idéal = 1,0 (toute l\'énergie va à l\'IT). Moyenne mondiale ~1,55 ; meilleures hyper scales ~1,10-1,20 ; Harch Intelligence Dakhla vise PUE 1,15 grâce au free-cooling atlantique. PUE = 1,20 signifie 20 % de surconsommation non-IT (refroidissement, onduleurs, pertes).',
    letter: 'P',
    category: 'sustainability',
  },
  {
    term: 'PV',
    expansion: 'Photovoltaic',
    definition: 'Photovoltaic — photovoltaïque. Technologie convertissant directement la lumière solaire en électricité via des cellules semi-conductrices (silicium monocristallin, polycristallin, couches minces CdTe, pérovskites). Rendement commercial : mono-Si 20-23 %, poly-Si 16-19 %, CdTe 18-22 %. Le Maroc a déployé 2,1 GW de PV fin 2024, cible 6 GW en 2030.',
    letter: 'P',
    category: 'energy',
  },
  {
    term: 'Phosphate Mining',
    definition: 'Extraction de phosphates — roche phosphatée utilisée comme matière première des engrais agricoles. Le Maroc détient 70 % des réserves mondiales connues (50 milliards de tonnes), premier exportateur mondial. L\'OCP Group (Office Chérifien des Phosphates) est le leader mondial ; Harch Mining opère des concessions satellites dans la région de Khouribga.',
    letter: 'P',
    category: 'energy',
  },
  {
    term: 'Precision Agriculture',
    definition: 'Agriculture de précision — utilisation de capteurs IoT, drones, imagerie satellite et IA pour optimiser les intrants agricoles (eau, engrais, pesticides) à l\'échelle de la parcelle ou de la plante. Réductions typiques : eau -25 %, engrais -20 %, pesticides -30 %, rendement +10-15 %. Harch Agri déploie 50 000 hectares connectés au Sahel.',
    letter: 'P',
    category: 'sustainability',
  },

  // ─────────────── S ───────────────
  {
    term: 'SBTi',
    expansion: 'Science Based Targets initiative',
    definition: 'Science Based Targets initiative — partenariat CDP, UNGC, WRI, WWF aidant les entreprises à fixer des cibles de réduction d\'émissions alignées sur la trajectoire 1,5 °C de l\'Accord de Paris. Validation scientifique indépendante. Plus de 4 000 entreprises validées. Harch Corp a soumis ses cibles 2030 (Scope 1+2 -50 %, Scope 3 -30 %) au SBTi en 2024.',
    letter: 'S',
    category: 'sustainability',
  },
  {
    term: 'Series A',
    definition: 'Première levée de capital significative après le Seed. Série A typique : 3 à 15 M$, valorisation pré-money 10 à 40 M$, 1 à 3 lead investors (VC). Permet le passage du prototype au produit commercialisé, l\'embauche de l\'équipe dirigeante (CTO, CRO, Head of Sales) et le démarrage du scaling. Le Maroc compte ~15 levées Series A par an.',
    letter: 'S',
    category: 'finance',
  },
  {
    term: 'Sovereign Cloud',
    definition: 'Cloud souverain — infrastructure cloud opérée sous juridiction nationale, soumise au droit local et hébergée physiquement sur le territoire. Garantit la souveraineté numérique (données, code, IA) face aux lois extraterritoriales (CLOUD Act US, décrets chinois). Harch Intelligence opère le premier cloud GPU souverain d\'Afrique, conforme au droit marocain (Loi 09-08/CNDP).',
    letter: 'S',
    category: 'tech',
  },
  {
    term: 'SPV',
    expansion: 'Special Purpose Vehicle',
    definition: 'Special Purpose Vehicle — entité juridique ad hoc créée pour isoler financièrement un projet d\'infrastructure. Permet la non-consolidation comptable, la limitation du recours aux actifs du sponsor, et l\'attribution claire des flux de revenus aux prêteurs. Structure standard des project financings : SPV détient les actifs, signe les PPA/contrats, contracte la dette.',
    letter: 'S',
    category: 'finance',
  },
  {
    term: 'Submarine Cable',
    definition: 'Câble sous-marin — câble optique posé sur les fonds marins pour relier les réseaux télécoms entre continents. 95 % du trafic internet intercontinental passe par les câbles sous-marins (plus de 550 câbles, 1,4 million de km). Le Maroc est connecté via Africa Coast to Europe (ACE), Mellac, Loug, Mariana et DARE. Harch Intelligence opère un POP au hub Tanger Med.',
    letter: 'S',
    category: 'tech',
  },
  {
    term: 'Sukuk',
    definition: 'Titres financiers islamiques équivalents aux obligations, conformes à la charia. Au lieu d\'un taux d\'intérêt fixe, les Sukuk représentent une part dans un actif tangible (immobilier, infrastructure, équipement) et distribuent un rendement lié aux revenus de cet actif. Marché mondial de 800 Md$, utilisé par le Maroc pour le financement d\'infrastructures souveraines.',
    letter: 'S',
    category: 'finance',
  },

  // ─────────────── T ───────────────
  {
    term: 'Tamwilcom',
    definition: 'Organisme marocain de financement, résultant de la fusion (2022) de la CCG (Caisse Centrale de Garantie) et de la Société Marocaine de Garantie des PME. Pilier du financement non bancaire des PME et startups marocaines. Gère les programmes Intelika, Innov Invest, MOWAKABA, et les garanties Dassaa, Damane, Imtiaz.',
    letter: 'T',
    category: 'finance',
  },
  {
    term: 'Tier IV',
    definition: 'Standard de disponibilité data center le plus élevé, défini par l\'Uptime Institute. Garantit 99,995 % de disponibilité (≤ 26,3 minutes d\'indisponibilité/an). Exige : capacité N+1 sur toutes les composantes, double alimentation électrique active, refroidissement redondant, capacité de maintenance sans interruption. Coût CAPEX 30-50 % supérieur au Tier III.',
    letter: 'T',
    category: 'tech',
  },

  // ─────────────── U ───────────────
  {
    term: 'Upwelling',
    definition: 'Remontée d\'eau froide, riche en nutriments (nitrates, phosphates), des profondeurs vers la surface, causée par l\'action des vents côtiers. Phénomène particulièrement intense au large de Dakhla (Maroc) et du Sahara atlantique. Soutient une productivité biologique exceptionnelle : plancton, poissons, coquillages. Base de la conchyliculture dakhloise.',
    letter: 'U',
    category: 'aquaculture',
  },

  // ─────────────── V ───────────────
  {
    term: 'Vertical Integration',
    definition: 'Intégration verticale — stratégie d\'entreprise consistant à contrôler plusieurs maillons de la chaîne de valeur, de l\'amont (matières premières, production) à l\'aval (distribution, services). Modèle de Harch Corp : énergie → data center → cloud → IA → solutions verticales (agriculture, eau, finance). Avantages : capture de valeur, résilience, différenciation.',
    letter: 'V',
    category: 'finance',
  },

  // ─────────────── W ───────────────
  {
    term: 'WACC',
    expansion: 'Weighted Average Cost of Capital',
    definition: 'Coût moyen pondéré du capital — taux d\'actualisation moyen d\'une entreprise, reflétant le coût de ses différentes sources de financement (dette et fonds propres) pondérées par leur poids. Formule : WACC = E/V × Re + D/V × Rd × (1-Tc). Pour les infrastructures africaines : 8-12 % (énergie régulée), 12-16 % (data center), 15-20 % (startup tech).',
    letter: 'W',
    category: 'finance',
  },
];

/* ═══════════════════════════════════════════════════════════════
   CATEGORY METADATA
   ═══════════════════════════════════════════════════════════════ */

const categoryMeta: Record<
  GlossaryTerm['category'],
  { label: string; dot: string; text: string }
> = {
  finance: { label: 'Finance', dot: 'bg-[#8B9DAF]', text: 'text-[#8B9DAF]' },
  energy: { label: 'Energy', dot: 'bg-amber-500/70', text: 'text-amber-400' },
  regulatory: { label: 'Regulatory', dot: 'bg-rose-400/70', text: 'text-rose-300' },
  tech: { label: 'Tech', dot: 'bg-cyan-400/70', text: 'text-cyan-300' },
  sustainability: { label: 'Sustainability', dot: 'bg-emerald-400/70', text: 'text-emerald-300' },
  aquaculture: { label: 'Aquaculture', dot: 'bg-sky-400/70', text: 'text-sky-300' },
};

const allLetters = 'ABCDEGHILMNOPSTUVW'.split('');

const allCategories = Object.entries(categoryMeta) as [
  GlossaryTerm['category'],
  { label: string; dot: string; text: string }
][];

/* ═══════════════════════════════════════════════════════════════
   PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function GlossaryPageClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<GlossaryTerm['category'] | null>(null);

  const filteredTerms = useMemo(() => {
    let terms = glossaryTerms;
    if (activeLetter) {
      terms = terms.filter((t) => t.letter === activeLetter);
    }
    if (activeCategory) {
      terms = terms.filter((t) => t.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      terms = terms.filter(
        (t) =>
          t.term.toLowerCase().includes(query) ||
          t.definition.toLowerCase().includes(query) ||
          (t.expansion?.toLowerCase().includes(query) ?? false)
      );
    }
    return terms;
  }, [searchQuery, activeLetter, activeCategory]);

  const groupedTerms = useMemo(() => {
    const groups: Record<string, GlossaryTerm[]> = {};
    filteredTerms.forEach((term) => {
      if (!groups[term.letter]) groups[term.letter] = [];
      groups[term.letter].push(term);
    });
    return groups;
  }, [filteredTerms]);

  const availableLetters = allLetters.filter((letter) =>
    glossaryTerms.some((g) => g.letter === letter)
  );

  const totalTerms = glossaryTerms.length;
  const financeCount = glossaryTerms.filter((t) => t.category === 'finance').length;
  const energyCount = glossaryTerms.filter((t) => t.category === 'energy').length;
  const techCount = glossaryTerms.filter((t) => t.category === 'tech').length;
  const regulatoryCount = glossaryTerms.filter((t) => t.category === 'regulatory').length;

  return (
    <div className="bg-[#0D0D0D]">
      {/* ═══ HERO ═══ */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">Reference · Lexicon</p>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              Sovereign Infrastructure<br />Glossary
            </h1>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7] mb-10">
              A curated reference of {totalTerms}+ terms spanning finance, energy, regulation,
              sustainability, technology and aquaculture — the vocabulary of Africa&apos;s industrial
              sovereignty. Updated quarterly, sourced from Harch Corp operational practice and
              Moroccan regulatory frameworks.
            </p>
          </FadeIn>

          {/* Stat strip */}
          <FadeIn delay={0.08}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {[
                { label: 'Total Terms', value: totalTerms, suffix: '+' },
                { label: 'Finance', value: financeCount, suffix: '' },
                { label: 'Energy & Sustainability', value: energyCount, suffix: '' },
                { label: 'Tech & Regulatory', value: techCount + regulatoryCount, suffix: '' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="border border-white/[0.06] bg-[rgba(255,255,255,0.02)] rounded-lg p-5"
                >
                  <p className="text-[32px] md:text-[40px] font-extrabold text-white leading-none mb-2">
                    <CountUp to={stat.value} suffix={stat.suffix} duration={1.8} />
                  </p>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-[#666666] font-semibold">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* Search */}
          <FadeIn delay={0.12}>
            <div className="max-w-xl relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666]">
                <Search size={16} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search terms, definitions, acronyms…"
                className="w-full pl-11 pr-4 py-3 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-[14px] placeholder-[#666666] focus:outline-none focus:border-[rgba(139,157,175,0.3)] transition-colors"
                aria-label="Search glossary"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ A-Z NAVIGATION ═══ */}
      <section className="py-6 bg-[#121212] border-y border-[rgba(255,255,255,0.04)] sticky top-14 z-10 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setActiveLetter(null)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-bold tracking-[0.08em] uppercase transition-all duration-300 shrink-0 ${
                activeLetter === null
                  ? 'bg-white text-black'
                  : 'bg-[rgba(255,255,255,0.04)] text-[#999999] hover:bg-[rgba(255,255,255,0.08)] hover:text-white'
              }`}
            >
              All
            </button>
            <span className="w-px h-4 bg-[rgba(255,255,255,0.06)] mx-1" />
            {allLetters.map((letter) => {
              const hasTerms = availableLetters.includes(letter);
              return (
                <button
                  key={letter}
                  onClick={() => hasTerms && setActiveLetter(activeLetter === letter ? null : letter)}
                  disabled={!hasTerms}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-bold tracking-[0.08em] uppercase transition-all duration-300 shrink-0 ${
                    activeLetter === letter
                      ? 'bg-white text-black'
                      : hasTerms
                        ? 'bg-[rgba(255,255,255,0.04)] text-[#999999] hover:bg-[rgba(255,255,255,0.08)] hover:text-white'
                        : 'text-[rgba(255,255,255,0.1)] cursor-not-allowed'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ CATEGORY FILTER ═══ */}
      <section className="py-6 bg-[#0D0D0D] border-b border-[rgba(255,255,255,0.04)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[#8B9DAF] mr-2 shrink-0">
              <Filter size={14} />
            </span>
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-semibold tracking-[0.04em] transition-all duration-300 shrink-0 ${
                activeCategory === null
                  ? 'bg-[rgba(139,157,175,0.15)] text-[#8B9DAF] border border-[rgba(139,157,175,0.3)]'
                  : 'bg-[rgba(255,255,255,0.02)] text-[#666666] hover:text-white border border-transparent'
              }`}
            >
              All Categories
            </button>
            {allCategories.map(([cat, meta]) => (
              <button
                key={cat}
                onClick={() =>
                  setActiveCategory(activeCategory === cat ? null : cat)
                }
                className={`px-3 py-1.5 rounded-md text-[11px] font-semibold tracking-[0.04em] transition-all duration-300 shrink-0 inline-flex items-center gap-1.5 border ${
                  activeCategory === cat
                    ? 'bg-[rgba(139,157,175,0.15)] text-[#CCCCCC] border-[rgba(139,157,175,0.3)]'
                    : 'bg-[rgba(255,255,255,0.02)] text-[#666666] hover:text-white border-transparent'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                {meta.label}
              </button>
            ))}
            <span className="ml-auto text-[11px] text-[#666666] shrink-0 hidden md:inline">
              {filteredTerms.length} / {totalTerms} terms
            </span>
          </div>
        </div>
      </section>

      {/* ═══ TERMS GRID ═══ */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          {filteredTerms.length === 0 ? (
            <FadeIn>
              <div className="text-center py-20">
                <span className="inline-flex text-[#666666] mb-4">
                  <Search size={32} />
                </span>
                <p className="text-white font-semibold text-lg">No results found</p>
                <p className="text-[14px] text-[#999999] mt-2">
                  Try a different keyword, letter, or category filter.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveLetter(null);
                    setActiveCategory(null);
                  }}
                  className="mt-6 px-5 py-2 rounded-md bg-[rgba(255,255,255,0.04)] border border-white/[0.08] text-[12px] font-semibold text-white hover:bg-[rgba(255,255,255,0.08)] transition-colors"
                >
                  Reset filters
                </button>
              </div>
            </FadeIn>
          ) : (
            Object.entries(groupedTerms)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([letter, terms]) => (
                <div key={letter} className="mb-16 last:mb-0">
                  <FadeIn>
                    <div className="flex items-center gap-4 mb-8">
                      <span className="text-[48px] md:text-[64px] font-extrabold text-[rgba(255,255,255,0.04)] leading-none stat-mono">
                        {letter}
                      </span>
                      <div className="flex-1 h-px bg-[rgba(255,255,255,0.04)]" />
                      <span className="text-[11px] uppercase tracking-[0.12em] text-[#666666] font-semibold">
                        {terms.length} term{terms.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </FadeIn>
                  <StaggerContainer
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    staggerDelay={0.04}
                  >
                    {terms.map((term) => {
                      const meta = categoryMeta[term.category];
                      return (
                        <StaggerItem key={term.term}>
                          <article className="card p-5 h-full group cursor-default hover:border-[rgba(139,157,175,0.25)] transition-colors">
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex-1">
                                <h3 className="text-[15px] font-bold text-white group-hover:text-[#CCCCCC] transition-colors">
                                  {term.term}
                                </h3>
                                {term.expansion && (
                                  <p className="text-[11px] text-[#8B9DAF] mt-0.5 leading-snug">
                                    {term.expansion}
                                  </p>
                                )}
                              </div>
                              <span className="inline-flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-md bg-[rgba(255,255,255,0.03)] border border-white/[0.05]">
                                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                                <span className="text-[9px] uppercase tracking-[0.1em] text-[#999999] font-semibold">
                                  {meta.label}
                                </span>
                              </span>
                            </div>
                            <p className="text-[13px] text-[#999999] leading-relaxed">
                              {term.definition}
                            </p>
                          </article>
                        </StaggerItem>
                      );
                    })}
                  </StaggerContainer>
                </div>
              ))
          )}
        </div>
      </section>

      {/* ═══ CATEGORY OVERVIEW ═══ */}
      <section className="py-20 md:py-28 bg-[#121212] border-t border-[rgba(255,255,255,0.04)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">Browse by Domain</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-4">
              Six Domains. One Vocabulary.
            </h2>
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              From LCOE and WACC to PUE and Tier IV — every term reflects a real decision
              faced by infrastructure operators, regulators, and investors across Morocco and the
              wider African continent.
            </p>
          </FadeIn>
          <StaggerContainer
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            staggerDelay={0.06}
          >
            {allCategories.map(([cat, meta]) => {
              const count = glossaryTerms.filter((t) => t.category === cat).length;
              const icons: Record<GlossaryTerm['category'], typeof Zap> = {
                finance: Scale,
                energy: Zap,
                regulatory: Building2,
                tech: Cpu,
                sustainability: Leaf,
                aquaculture: Globe2,
              };
              const Icon = icons[cat];
              return (
                <StaggerItem key={cat}>
                  <button
                    onClick={() => {
                      setActiveCategory(cat);
                      setActiveLetter(null);
                      setSearchQuery('');
                      if (typeof window !== 'undefined') {
                        window.scrollTo({ top: 600, behavior: 'smooth' });
                      }
                    }}
                    className="card p-6 w-full text-left h-full hover:border-[rgba(139,157,175,0.25)] transition-colors group"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.04)] flex items-center justify-center text-[#8B9DAF]">
                        <Icon size={18} strokeWidth={1.5} />
                      </span>
                      <div>
                        <h3 className="text-[15px] font-bold text-white">{meta.label}</h3>
                        <p className="text-[11px] text-[#666666]">{count} terms</p>
                      </div>
                    </div>
                    <p className="text-[12px] text-[#999999] leading-relaxed group-hover:text-[#CCCCCC] transition-colors">
                      {cat === 'finance' &&
                        'CAPEX, OPEX, IRR, WACC, EBITDA, DSCR, PPA, SPV, Sukuk, Series A, ESG and more — the financial backbone of every infrastructure decision.'}
                      {cat === 'energy' &&
                        'LCOE, PUE, CSP, PV, Bifacial, Green Hydrogen, Desalination, Phosphate Mining — the energy stack powering Africa’s industrial future.'}
                      {cat === 'regulatory' &&
                        'ANDA, ANRE, ONEE, ONSSA, MASEN, CNDP, GDPR, Loi 82-21, Loi 84-21, Loi 13-21, Loi 43-20, CC BY-NC-SA 4.0 — the legal framework every operator must navigate.'}
                      {cat === 'tech' &&
                        'GPU, H100/H200, InfiniBand, Tier IV, MLPerf, HarchOS, Submarine Cable, API, Carbon-Aware Scheduling, Sovereign Cloud, Build in Public — the technical vocabulary of modern infrastructure.'}
                      {cat === 'sustainability' &&
                        'Net-zero, Carbon Intensity, PUE, ESG, SBTi, LEED, BREEAM, Precision Agriculture — the metrics that define responsible industry.'}
                      {cat === 'aquaculture' &&
                        'Conchyliculture, Upwelling — the biological and hydrodynamic foundations of Morocco’s Atlantic aquaculture economy.'}
                    </p>
                  </button>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══ CTA: Explore Documentation ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D] border-t border-[rgba(255,255,255,0.04)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="max-w-2xl mx-auto text-center">
              <span className="inline-flex text-[#8B9DAF] mb-6">
                <BookOpen size={32} strokeWidth={1.5} />
              </span>
              <p className="section-label mb-4 text-[#8B9DAF]">Go Deeper</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-4">
                From Glossary to Operations
              </h2>
              <p className="text-[15px] text-[#999999] leading-[1.7] mb-8">
                Terms become tangible in Harch Corp&apos;s technical documentation, architectural
                whitepapers, and project dossiers. Dive into the engineering behind the vocabulary —
                carbon-aware scheduling code, PPA term sheets, data center Tier IV designs.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/docs"
                  className="px-8 py-3 rounded-lg bg-white text-black text-[12px] font-bold tracking-[0.06em] uppercase hover:bg-[#CCCCCC] transition-colors inline-flex items-center gap-2"
                >
                  Explore Docs <ArrowRight size={14} />
                </Link>
                <Link
                  href="/docs/api"
                  className="px-8 py-3 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-[12px] font-bold tracking-[0.06em] uppercase hover:bg-[rgba(255,255,255,0.08)] transition-colors inline-flex items-center gap-2"
                >
                  <span className="text-[#8B9DAF]">
                    <Sparkles size={12} />
                  </span>
                  API Reference
                </Link>
                <Link
                  href="/contact"
                  className="px-8 py-3 rounded-lg border border-white/12 text-white text-[12px] font-bold tracking-[0.06em] uppercase hover:border-white/25 hover:bg-white/[0.03] transition-colors inline-flex items-center gap-2"
                >
                  Talk to Us
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
