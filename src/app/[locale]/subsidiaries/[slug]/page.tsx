import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { JsonLd } from '@/components/JsonLd';
import SubsidiaryWrapper from './SubsidiaryWrapper';

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

const subsidiaryMetaEn: Record<string, {
  title: string;
  description: string;
  heroImage: string;
  keywords: string[];
}> = {
  intelligence: {
    title: 'Harch Intelligence — Carbon-Aware GPU Cloud',
    description: 'Harch Intelligence — 1,798 carbon-aware GPUs across 5 Morocco hubs at 48.2 gCO2/kWh. Sovereign AI cloud, 89% below industry average, Europe connectivity.',
    heroImage: '/images/sections/intelligence-exterior.jpg',
    keywords: ['Harch Intelligence', 'GPU cloud Africa', 'carbon-aware GPU scheduling', 'sovereign AI', 'data center Morocco', 'HarchOS', 'AI infrastructure Africa', 'green GPU cloud'],
  },
  cement: {
    title: 'Harch Cement — Green Cement Plant in Gambia',
    description: 'Harch Cement builds a 500kT/yr green cement plant in Gambia — vertically integrated, 100% renewable-powered, LC3 formulations, 30-50% below import prices.',
    heroImage: '/images/sections/cement-factory.jpg',
    keywords: ['Harch Cement', 'green cement Gambia', 'LC3 cement Africa', 'cement manufacturing West Africa', 'cement plant Gambia', 'import substitution cement', 'low-carbon cement', 'cement quarry Gambia'],
  },
  energy: {
    title: 'Harch Energy — Solar, Wind & Green Hydrogen in Morocco',
    description: 'Harch Energy develops a 2GW+ renewable energy pipeline — solar, wind, and green hydrogen — powering African industrial sovereignty. 150 MW+ installed, 60% ONEE bill reduction for Moroccan enterprises.',
    heroImage: '/images/sections/energy-wind-farm.jpg',
    keywords: ['Harch Energy', 'renewable energy Africa', 'solar energy Morocco', 'green hydrogen', 'wind power Africa', 'clean energy infrastructure', 'solar farm Morocco', 'ONEE bill reduction'],
  },
  technology: {
    title: 'Harch Technology | Cybersecurity & Satellite Africa',
    description: "Harch Technology builds sovereign digital infrastructure — cybersecurity, satellite communications, and zero-trust networks for Africa's critical systems.",
    heroImage: '/images/sections/tech-satellite.jpg',
    keywords: ['Harch Technology', 'sovereign technology Africa', 'cybersecurity infrastructure', 'satellite communications', 'zero-trust security', 'digital sovereignty'],
  },
  mining: {
    title: 'Harch Mining | Strategic Mineral Processing Africa',
    description: "Harch Mining captures Africa's mineral value chain — phosphates, cobalt, rare earths processed domestically. ISO 14001, renewable-powered, zero-harm operations.",
    heroImage: '/images/sections/mining-open-pit.jpg',
    keywords: ['Harch Mining', 'mineral processing Africa', 'rare earths mining', 'cobalt processing', 'phosphate mining Morocco', 'strategic minerals', 'battery-grade cobalt', 'rare earth oxides', 'in-country processing', 'zero-harm mining', 'ISO 14001 mining'],
  },
  agriculture: {
    title: 'Harch Agri — Precision Agriculture & IoT for Africa',
    description: 'Harch Agri deploys precision agriculture across Africa — IoT monitoring, drone intelligence, vertical farming on 5,000+ hectares in Senegal and the Sahel belt.',
    heroImage: '/images/sections/agri-aerial-drone.jpg',
    keywords: ['Harch Agri', 'precision agriculture Africa', 'vertical farming Sahel', 'IoT agriculture', 'drone farming', 'agritech Africa'],
  },
  water: {
    title: 'AI-Optimized Desalination & Water Infrastructure',
    description: "Harch Water builds 200M m³/yr desalination capacity with AI-optimized distribution, achieving 23% water loss reduction. Solving Africa's water crisis through sovereign infrastructure.",
    heroImage: '/images/sections/water-desal-plant.jpg',
    keywords: ['Harch Water', 'water desalination Africa', 'AI water management', 'water infrastructure', 'desalination plant Morocco', 'water scarcity solutions'],
  },
  finance: {
    title: 'Harch Finance — Green Bonds & Project Finance Africa',
    description: "Harch Finance structures green bonds, project finance, Islamic sukuk and blended capital for Africa's $130B infrastructure gap. $2.4B pipeline, 14.2% IRR, 0 defaults, AAOIFI compliant.",
    heroImage: '/images/sections/finance-district.jpg',
    keywords: [
      'Harch Finance', 'green bonds Africa', 'Islamic finance infrastructure',
      'project finance Africa', 'Sukuk bonds', 'blended finance',
      'African investment', 'infrastructure finance Morocco', 'AAOIFI compliant',
      'AfDB partner', 'EIB partner', 'IFC partner', 'sovereign wealth',
      'Harch Corp equity participation', 'project finance advisory',
    ],
  },
  atelier: {
    title: 'Harch Atelier — AI Search Visibility (GEO/AEO) | Morocco',
    description: 'On fait apparaître votre entreprise dans ChatGPT, Perplexity et Google AI. Audit gratuit. Setup GEO à partir de 30,000 MAD. GLM-4 powered. Casablanca, Maroc.',
    heroImage: '/images/sections/overview-casablanca.jpg',
    keywords: [
      'Harch Atelier', 'GEO Morocco', 'AEO Morocco', 'generative engine optimization',
      'AI search visibility', 'ChatGPT visibility', 'Perplexity optimization',
      'Google AI Overviews optimization', 'AI search optimization Morocco',
      'GEO agency francophone', 'AEO agency Africa', 'GLM-4 search optimization',
      'apparaitre dans ChatGPT', 'visibilité IA Maroc', 'optimisation moteur IA',
      'GEO Maroc', 'AEO Afrique', 'AI search consulting',
    ],
  },
};

const subsidiaryMetaFr: Record<string, {
  title: string;
  description: string;
  heroImage: string;
  keywords: string[];
}> = {
  intelligence: {
    title: 'Harch Intelligence — Cloud GPU IA Souverain',
    description: "Harch Intelligence — 1 798 GPU conscients du carbone sur 5 hubs Maroc à 48.2 gCO2/kWh. Cloud IA souverain, 89 % sous la moyenne, connectivité Europe.",
    heroImage: '/images/sections/intelligence-exterior.jpg',
    keywords: ['Harch Intelligence', 'cloud GPU Afrique', 'ordonnancement GPU conscient du carbone', 'IA souveraine', 'centre de données Maroc', 'HarchOS', 'infrastructure IA Afrique', 'cloud GPU vert'],
  },
  cement: {
    title: 'Harch Cement — Ciment Vert, Usine en Gambie',
    description: "Harch Cement construit en Gambie une usine de ciment vert 500kT/an — intégration verticale, énergie renouvelable, formulation LC3, 30-50% sous les importations.",
    heroImage: '/images/sections/cement-factory.jpg',
    keywords: ['Harch Cement', 'ciment vert Gambie', 'ciment LC3 Afrique', 'fabrication ciment Afrique de l\'Ouest', 'usine ciment Gambie', 'substitution importations ciment', 'ciment bas carbone', 'carrière ciment Gambie'],
  },
  energy: {
    title: 'Harch Energy — Solaire, Éolien et Hydrogène Vert au Maroc',
    description: "Harch Energy développe un pipeline d'énergie renouvelable de 2 GW+ — solaire, éolien et hydrogène vert — au service de la souveraineté industrielle africaine. 150 MW+ installés, 60 % de réduction sur la facture ONEE pour les entreprises marocaines.",
    heroImage: '/images/sections/energy-wind-farm.jpg',
    keywords: ['Harch Energy', 'énergie renouvelable Afrique', 'énergie solaire Maroc', 'hydrogène vert', 'énergie éolienne Afrique', 'infrastructure énergie propre', 'centrale solaire Maroc', 'réduction facture ONEE'],
  },
  technology: {
    title: 'Harch Technology | Cybersécurité & Satellite Afrique',
    description: "Harch Technology construit l'infrastructure numérique souveraine — cybersécurité, satellite et réseaux zero-trust pour les systèmes critiques africains.",
    heroImage: '/images/sections/tech-satellite.jpg',
    keywords: ['Harch Technology', 'technologie souveraine Afrique', 'infrastructure cybersécurité', 'communications par satellite', 'sécurité zero-trust', 'souveraineté numérique'],
  },
  mining: {
    title: 'Harch Mining | Traitement Minéral Stratégique Afrique',
    description: "Harch Mining capture la chaîne de valeur minérale africaine — phosphates, cobalt, terres rares traités localement. ISO 14001, énergie renouvelable, zéro impact.",
    heroImage: '/images/sections/mining-open-pit.jpg',
    keywords: ['Harch Mining', 'traitement minéral Afrique', 'extraction terres rares', 'traitement cobalt', 'extraction phosphate Maroc', 'minéraux stratégiques', 'cobalt qualité batterie', 'oxydes terres rares', 'traitement local', 'minage zéro impact', 'ISO 14001 minage'],
  },
  agriculture: {
    title: "Harch Agri — Agriculture de Précision & IoT pour l'Afrique",
    description: "Harch Agri déploie l'agriculture de précision en Afrique — surveillance IoT, intelligence par drone, agriculture verticale sur 5 000+ hectares au Sénégal et au Sahel.",
    heroImage: '/images/sections/agri-aerial-drone.jpg',
    keywords: ['Harch Agri', 'agriculture de précision Afrique', 'agriculture verticale Sahel', 'agriculture IoT', 'agriculture par drone', 'agritech Afrique'],
  },
  water: {
    title: 'Dessalement Optimisé par IA & Infrastructure Hydrique',
    description: "Harch Water construit une capacité de dessalement de 200M m³/an avec une distribution optimisée par IA, atteignant une réduction de 23 % des pertes d'eau. Résoudre la crise de l'eau en Afrique grâce à une infrastructure souveraine.",
    heroImage: '/images/sections/water-desal-plant.jpg',
    keywords: ['Harch Water', 'dessalement Afrique', 'gestion de l\'eau par IA', 'infrastructure hydrique', 'usine de dessalement Maroc', 'solutions pénurie d\'eau'],
  },
  finance: {
    title: "Harch Finance — Obligations Vertes & Financement Afrique",
    description: "Harch Finance structure obligations vertes, financement de projets, sukuk islamiques et capital mixte pour le déficit infrastructure Afrique. Pipeline 2,4 Mds$, TRI 14,2 %, 0 défaut, AAOIFI.",
    heroImage: '/images/sections/finance-district.jpg',
    keywords: [
      'Harch Finance', 'obligations vertes Afrique', 'finance islamique infrastructure',
      'financement de projets Afrique', 'obligations Sukuk', 'finance mixte',
      'investissement africain', 'finance infrastructure Maroc', 'conforme AAOIFI',
      'partenaire BAD', 'partenaire BEI', 'partenaire SFI', 'fonds souverains',
      'participation capitalistique Harch Corp', 'conseil financement de projets',
    ],
  },
  atelier: {
    title: 'Harch Atelier — Visibilité IA (GEO/AEO) | Maroc',
    description: 'On fait apparaître votre entreprise dans ChatGPT, Perplexity et Google AI. Audit gratuit. Setup GEO dès 30,000 MAD. Propulsé par GLM-4. Casablanca, Maroc.',
    heroImage: '/images/sections/overview-casablanca.jpg',
    keywords: [
      'Harch Atelier', 'GEO Maroc', 'AEO Maroc', 'optimisation moteur génératif',
      'visibilité IA', 'apparaitre dans ChatGPT', 'optimisation Perplexity',
      'Google AI Overviews optimisation', 'optimisation recherche IA Maroc',
      'agence GEO francophone', 'agence AEO Afrique', 'GLM-4 optimisation recherche',
      'visibilité ChatGPT', 'référencement IA Maroc', 'GEO Afrique',
      'consultant IA recherche', 'apparaitre dans IA',
    ],
  },
};

/**
 * Subsidiary-specific Organization + Service JSON-LD schemas.
 * Currently only the `energy` subsidiary has extended structured data,
 * but the structure supports adding more subsidiaries later.
 *
 * All schemas use absolute https://www.harchcorp.com URLs so Google can
 * crawl and verify them without ambiguity.
 */
function buildSubsidiaryOrgSchema(slug: string, locale: string): Record<string, unknown> | null {
  const isFr = locale === 'fr';
  // Localize the path for FR: /subsidiaries → /filiales (see i18n/routing.ts
  // pathnames mapping). Other path segments are kept as-is.
  const absoluteUrl = (path: string) => {
    if (path === '') return 'https://www.harchcorp.com';
    const localizedPath = isFr ? path.replace(/^\/subsidiaries/, '/filiales') : path;
    return `https://www.harchcorp.com${isFr ? '/fr' : ''}${localizedPath}`;
  };

  if (slug === 'energy') {
    const subsidiaryUrl = absoluteUrl('/subsidiaries/energy');
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${subsidiaryUrl}#organization`,
      name: 'Harch Energy',
      alternateName: isFr ? 'Harch Energy — Énergie Renouvelable' : 'Harch Energy — Renewable Energy',
      parentOrganization: {
        '@type': 'Organization',
        '@id': 'https://www.harchcorp.com/#organization',
        name: 'Harch Corp',
      },
      url: subsidiaryUrl,
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.harchcorp.com/logo-512x512.png',
        contentUrl: 'https://www.harchcorp.com/logo-512x512.png',
        width: 512,
        height: 512,
      },
      image: {
        '@type': 'ImageObject',
        url: 'https://www.harchcorp.com/images/sections/energy-wind-farm.jpg',
        contentUrl: 'https://www.harchcorp.com/images/sections/energy-wind-farm.jpg',
        width: 1920,
        height: 1080,
        caption: isFr
          ? 'Centrale solaire et éolienne Harch Energy au Maroc'
          : 'Harch Energy solar and wind farm in Morocco',
      },
      description: isFr
        ? "Harch Energy développe un pipeline d'énergie renouvelable de 2 GW+ — solaire, éolien et hydrogène vert — au service de la souveraineté industrielle africaine."
        : 'Harch Energy develops a 2GW+ renewable energy pipeline — solar, wind, and green hydrogen — powering African industrial sovereignty.',
      foundingDate: '2024',
      foundingLocation: {
        '@type': 'Place',
        name: 'Casablanca',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Casablanca',
          addressCountry: 'MA',
        },
      },
      areaServed: [
        { '@type': 'Place', name: 'Morocco' },
        { '@type': 'Place', name: 'Africa' },
      ],
      knowsAbout: [
        'Solar energy',
        'Wind power',
        'Green hydrogen',
        'Battery storage',
        'Energy management software',
        'ONEE grid integration',
      ],
      address: {
        '@type': 'PostalAddress',
        streetAddress: '123 Boulevard Mohammed V',
        addressLocality: 'Casablanca',
        addressRegion: 'Casablanca-Settat',
        postalCode: '20000',
        addressCountry: 'MA',
      },
    };
  }

  if (slug === 'technology') {
    const subsidiaryUrl = absoluteUrl('/subsidiaries/technology');
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${subsidiaryUrl}#organization`,
      name: 'Harch Technology',
      alternateName: isFr
        ? ['Harch Tech', 'Harch Technology — Tech Souveraine']
        : ['Harch Tech', 'Harch Technology — Sovereign Tech'],
      parentOrganization: {
        '@type': 'Organization',
        '@id': 'https://www.harchcorp.com/#organization',
        name: 'Harch Corp',
        url: 'https://www.harchcorp.com',
      },
      url: subsidiaryUrl,
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.harchcorp.com/logo-512x512.png',
        contentUrl: 'https://www.harchcorp.com/logo-512x512.png',
        width: 512,
        height: 512,
      },
      image: {
        '@type': 'ImageObject',
        url: 'https://www.harchcorp.com/images/sections/tech-satellite.jpg',
        contentUrl: 'https://www.harchcorp.com/images/sections/tech-satellite.jpg',
        width: 1920,
        height: 1080,
        caption: isFr
          ? 'Station satellite et centre de sécurité Harch Technology au Maroc'
          : 'Harch Technology satellite ground station and security operations in Morocco',
      },
      description: isFr
        ? "Harch Technology construit l'infrastructure numérique souveraine — cybersécurité, satellite et réseaux zero-trust pour les systèmes critiques africains."
        : "Harch Technology builds sovereign digital infrastructure — cybersecurity, satellite communications, and zero-trust networks for Africa's critical systems.",
      foundingDate: '2024',
      foundingLocation: {
        '@type': 'Place',
        name: 'Casablanca',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Casablanca',
          addressCountry: 'MA',
        },
      },
      areaServed: [
        { '@type': 'Place', name: 'Morocco' },
        { '@type': 'Place', name: 'Gambia' },
        { '@type': 'Place', name: 'Senegal' },
        { '@type': 'Place', name: 'Mauritania' },
        { '@type': 'Place', name: 'Africa' },
      ],
      knowsAbout: [
        'Sovereign cloud',
        'Cybersecurity',
        'Satellite communications',
        'Zero-trust networks',
        'Edge computing',
        'Sovereign AI platform',
        'ISO 27001',
        'SOC 2',
      ],
      address: {
        '@type': 'PostalAddress',
        streetAddress: '123 Boulevard Mohammed V',
        addressLocality: 'Casablanca',
        addressRegion: 'Casablanca-Settat',
        postalCode: '20000',
        addressCountry: 'MA',
      },
    };
  }

  if (slug === 'mining') {
    const subsidiaryUrl = absoluteUrl('/subsidiaries/mining');
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${subsidiaryUrl}#organization`,
      name: 'Harch Mining',
      alternateName: isFr
        ? ['Harch Mining', 'Harch Mining — Minéraux Stratégiques']
        : ['Harch Mining', 'Harch Mining — Strategic Minerals'],
      parentOrganization: {
        '@type': 'Organization',
        '@id': 'https://www.harchcorp.com/#organization',
        name: 'Harch Corp',
        url: 'https://www.harchcorp.com',
      },
      url: subsidiaryUrl,
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.harchcorp.com/logo-512x512.png',
        contentUrl: 'https://www.harchcorp.com/logo-512x512.png',
        width: 512,
        height: 512,
      },
      image: {
        '@type': 'ImageObject',
        url: 'https://www.harchcorp.com/images/sections/mining-open-pit.jpg',
        contentUrl: 'https://www.harchcorp.com/images/sections/mining-open-pit.jpg',
        width: 1920,
        height: 1080,
        caption: isFr
          ? 'Mine de phosphate à ciel ouvert Harch Mining au Maroc'
          : 'Harch Mining open-pit phosphate extraction in Morocco',
      },
      description: isFr
        ? "Harch Mining capture la chaîne de valeur minérale africaine — phosphates, cobalt, terres rares traités localement. ISO 14001, énergie renouvelable, zéro impact."
        : "Harch Mining captures Africa's mineral value chain — phosphates, cobalt, rare earths processed domestically. ISO 14001, renewable-powered, zero-harm operations.",
      foundingDate: '2024',
      foundingLocation: {
        '@type': 'Place',
        name: 'Casablanca',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Casablanca',
          addressCountry: 'MA',
        },
      },
      areaServed: [
        { '@type': 'Place', name: 'Morocco' },
        { '@type': 'Place', name: 'Mauritania' },
        { '@type': 'Place', name: 'Africa' },
      ],
      knowsAbout: [
        'Phosphate mining',
        'Cobalt refining',
        'Rare earth element processing',
        'In-country mineral processing',
        'ISO 14001 environmental management',
        'Dry stacking tailings',
        'Battery-grade cobalt sulfate',
        'Renewable-powered mining',
      ],
      address: {
        '@type': 'PostalAddress',
        streetAddress: '123 Boulevard Mohammed V',
        addressLocality: 'Casablanca',
        addressRegion: 'Casablanca-Settat',
        postalCode: '20000',
        addressCountry: 'MA',
      },
    };
  }

  if (slug === 'intelligence') {
    const subsidiaryUrl = absoluteUrl('/subsidiaries/intelligence');
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${subsidiaryUrl}#organization`,
      name: 'Harch Intelligence',
      alternateName: isFr
        ? ['Harch Intelligence', 'Cloud GPU Harch', 'HarchOS']
        : ['Harch Intelligence', 'Harch GPU Cloud', 'HarchOS'],
      parentOrganization: {
        '@type': 'Organization',
        '@id': 'https://www.harchcorp.com/#organization',
        name: 'Harch Corp',
        url: 'https://www.harchcorp.com',
      },
      url: subsidiaryUrl,
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.harchcorp.com/logo-512x512.png',
        contentUrl: 'https://www.harchcorp.com/logo-512x512.png',
        width: 512,
        height: 512,
      },
      image: {
        '@type': 'ImageObject',
        url: 'https://www.harchcorp.com/images/sections/intelligence-exterior.jpg',
        contentUrl: 'https://www.harchcorp.com/images/sections/intelligence-exterior.jpg',
        width: 1920,
        height: 1080,
        caption: isFr
          ? 'Centre de données IA hyperscale Harch Intelligence à Dakhla, Maroc'
          : 'Harch Intelligence hyperscale AI data center in Dakhla, Morocco',
      },
      description: isFr
        ? "Harch Intelligence — Cloud GPU IA souverain avec 1 798 GPU conscients du carbone sur 5 hubs Maroc à 48.2 gCO2/kWh. 89 % sous la moyenne du secteur, connectivité Europe."
        : 'Harch Intelligence — Sovereign AI GPU cloud with 1,798 carbon-aware GPUs across 5 Morocco hubs at 48.2 gCO2/kWh. 89% below industry average, Europe connectivity.',
      foundingDate: '2024',
      foundingLocation: {
        '@type': 'Place',
        name: 'Dakhla',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Dakhla',
          addressCountry: 'MA',
        },
      },
      areaServed: [
        { '@type': 'Place', name: 'Morocco' },
        { '@type': 'Place', name: 'France' },
        { '@type': 'Place', name: 'Spain' },
        { '@type': 'Place', name: 'Africa' },
        { '@type': 'Place', name: 'Europe' },
      ],
      knowsAbout: [
        'GPU cloud computing',
        'Carbon-aware scheduling',
        'Sovereign AI infrastructure',
        'Hyperscale data centers',
        'Submarine cable connectivity',
        'Renewable energy integration',
        'AI workload orchestration',
        'HarchOS',
      ],
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Dakhla',
        addressRegion: 'Dakhla-Oued Ed-Dahab',
        postalCode: '73000',
        addressCountry: 'MA',
      },
    };
  }

  if (slug === 'cement') {
    const subsidiaryUrl = absoluteUrl('/subsidiaries/cement');
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${subsidiaryUrl}#organization`,
      name: 'Harch Cement',
      alternateName: isFr
        ? ['Harch Cement — Ciment Vert', 'Harch Ciment']
        : ['Harch Cement — Green Cement', 'Harch Ciment'],
      parentOrganization: {
        '@type': 'Organization',
        '@id': 'https://www.harchcorp.com/#organization',
        name: 'Harch Corp',
        url: 'https://www.harchcorp.com',
      },
      url: subsidiaryUrl,
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.harchcorp.com/logo-512x512.png',
        contentUrl: 'https://www.harchcorp.com/logo-512x512.png',
        width: 512,
        height: 512,
      },
      image: {
        '@type': 'ImageObject',
        url: 'https://www.harchcorp.com/images/sections/cement-factory.jpg',
        contentUrl: 'https://www.harchcorp.com/images/sections/cement-factory.jpg',
        width: 1920,
        height: 1080,
        caption: isFr
          ? 'Usine de ciment vert Harch Cement en Gambie'
          : 'Harch Cement green cement plant in Gambia',
      },
      description: isFr
        ? 'Harch Cement construit une usine de ciment vert 500kT/an en Gambie — intégrée verticalement, énergie renouvelable, formulation LC3, 30-50% sous le prix des importations.'
        : 'Harch Cement builds a 500kT/yr green cement plant in Gambia — vertically integrated, 100% renewable-powered, LC3 formulations, 30-50% below import prices.',
      foundingDate: '2024',
      foundingLocation: {
        '@type': 'Place',
        name: 'Gambia',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'GM',
          addressRegion: 'West Africa',
        },
      },
      areaServed: [
        { '@type': 'Place', name: 'Gambia' },
        { '@type': 'Place', name: 'Senegal' },
        { '@type': 'Place', name: 'Guinea-Bissau' },
        { '@type': 'Place', name: 'Guinea' },
        { '@type': 'Place', name: 'West Africa' },
      ],
      knowsAbout: [
        'Green cement',
        'LC3 cement',
        'Clinker substitution',
        'Waste heat recovery',
        'Quarry operations',
        'ISO 9001',
        'EN 197',
        'ASTM C150',
      ],
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'GM',
        addressRegion: 'West Africa',
      },
    };
  }

  if (slug === 'finance') {
    const subsidiaryUrl = absoluteUrl('/subsidiaries/finance');
    return {
      '@context': 'https://schema.org',
      '@type': 'FinancialService',
      '@id': `${subsidiaryUrl}#organization`,
      name: 'Harch Finance',
      alternateName: isFr
        ? ['Harch Finance — Capital Infrastructure Africaine', 'Harch Capital']
        : ['Harch Finance — African Infrastructure Capital', 'Harch Capital'],
      parentOrganization: {
        '@type': 'Organization',
        '@id': 'https://www.harchcorp.com/#organization',
        name: 'Harch Corp',
        url: 'https://www.harchcorp.com',
      },
      url: subsidiaryUrl,
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.harchcorp.com/logo-512x512.png',
        contentUrl: 'https://www.harchcorp.com/logo-512x512.png',
        width: 512,
        height: 512,
      },
      image: {
        '@type': 'ImageObject',
        url: 'https://www.harchcorp.com/images/sections/finance-district.jpg',
        contentUrl: 'https://www.harchcorp.com/images/sections/finance-district.jpg',
        width: 1920,
        height: 1080,
        caption: isFr
          ? 'Quartier financier de Casablanca — Harch Finance'
          : 'Casablanca finance district — Harch Finance',
      },
      description: isFr
        ? "Harch Finance structure des obligations vertes, du financement de projets, des sukuk islamiques et du capital mixte pour le déficit d'infrastructure de 130 Mds$ de l'Afrique. Pipeline 2,4 Mds$, TRI 14,2%, 0 défaut, conforme AAOIFI."
        : "Harch Finance structures green bonds, project finance, Islamic sukuk and blended capital for Africa's $130B infrastructure gap. $2.4B pipeline, 14.2% IRR, 0 defaults, AAOIFI compliant.",
      foundingDate: '2024',
      foundingLocation: {
        '@type': 'Place',
        name: 'Casablanca',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Casablanca',
          addressCountry: 'MA',
        },
      },
      areaServed: [
        { '@type': 'Country', name: 'Morocco' },
        { '@type': 'Country', name: 'Senegal' },
        { '@type': 'Country', name: 'Kenya' },
        { '@type': 'Country', name: 'Ghana' },
        { '@type': 'Country', name: 'Gambia' },
        { '@type': 'Place', name: 'Africa' },
      ],
      knowsAbout: [
        'Green bonds',
        'Project finance',
        'Trade finance',
        'Islamic finance',
        'Sukuk',
        'Impact investment',
        'Carbon credits',
        'Blended finance',
        'Sovereign wealth funds',
        'Development finance institutions',
        'ECA-backed financing',
        'MIGA coverage',
        'AAOIFI standards',
      ],
      address: {
        '@type': 'PostalAddress',
        streetAddress: '123 Boulevard Mohammed V',
        addressLocality: 'Casablanca',
        addressRegion: 'Casablanca-Settat',
        postalCode: '20000',
        addressCountry: 'MA',
      },
    };
  }

  if (slug === 'agriculture') {
    const subsidiaryUrl = absoluteUrl('/subsidiaries/agriculture');
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${subsidiaryUrl}#organization`,
      name: 'Harch Agri',
      alternateName: isFr
        ? ['Harch Agri — Agriculture de Précision', 'HarchAgri']
        : ['Harch Agri — Precision Agriculture', 'HarchAgri'],
      parentOrganization: {
        '@type': 'Organization',
        '@id': 'https://www.harchcorp.com/#organization',
        name: 'Harch Corp',
        url: 'https://www.harchcorp.com',
      },
      url: subsidiaryUrl,
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.harchcorp.com/logo-512x512.png',
        contentUrl: 'https://www.harchcorp.com/logo-512x512.png',
        width: 512,
        height: 512,
      },
      image: {
        '@type': 'ImageObject',
        url: 'https://www.harchcorp.com/images/sections/agri-aerial-drone.jpg',
        contentUrl: 'https://www.harchcorp.com/images/sections/agri-aerial-drone.jpg',
        width: 1920,
        height: 1080,
        caption: isFr
          ? 'Drone Harch Agri survolant les terres agricoles africaines'
          : 'Harch Agri drone surveilling African farmland',
      },
      description: isFr
        ? "Harch Agri déploie l'agriculture de précision en Afrique — surveillance IoT, intelligence par drone, agriculture verticale et optimisation sur 5 000+ hectares au Sénégal et au Sahel."
        : 'Harch Agri deploys precision agriculture across Africa — IoT monitoring, drone intelligence, vertical farming on 5,000+ hectares in Senegal and the Sahel belt.',
      foundingDate: '2024',
      foundingLocation: {
        '@type': 'Place',
        name: 'Dakar',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Dakar',
          addressCountry: 'SN',
        },
      },
      areaServed: [
        { '@type': 'Place', name: 'Senegal' },
        { '@type': 'Place', name: 'Morocco' },
        { '@type': 'Place', name: 'Kenya' },
        { '@type': 'Place', name: 'Ghana' },
        { '@type': 'Place', name: 'Africa' },
      ],
      knowsAbout: [
        'Precision agriculture',
        'IoT agriculture sensors',
        'Agricultural drones',
        'Vertical farming',
        'Agricultural carbon credits',
        'Sustainable agriculture',
        'Multispectral imaging',
        'Drip irrigation',
      ],
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Dakar',
        addressCountry: 'SN',
        addressRegion: 'Dakar Region',
      },
    };
  }

  if (slug === 'water') {
    const subsidiaryUrl = absoluteUrl('/subsidiaries/water');
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${subsidiaryUrl}#organization`,
      name: 'Harch Water',
      alternateName: isFr
        ? ['Harch Water — Dessalement IA', 'Harch Eau']
        : ['Harch Water — AI Desalination', 'Harch Water'],
      parentOrganization: {
        '@type': 'Organization',
        '@id': 'https://www.harchcorp.com/#organization',
        name: 'Harch Corp',
        url: 'https://www.harchcorp.com',
      },
      url: subsidiaryUrl,
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.harchcorp.com/logo-512x512.png',
        contentUrl: 'https://www.harchcorp.com/logo-512x512.png',
        width: 512,
        height: 512,
      },
      image: {
        '@type': 'ImageObject',
        url: 'https://www.harchcorp.com/images/sections/water-desal-plant.jpg',
        contentUrl: 'https://www.harchcorp.com/images/sections/water-desal-plant.jpg',
        width: 1920,
        height: 1080,
        caption: isFr
          ? 'Usine de dessalement Harch Water au bord de mer au Maroc'
          : 'Harch Water desalination plant by the sea in Morocco',
      },
      description: isFr
        ? "Harch Water construit et exploite des usines de dessalement optimisées par IA et des réseaux de distribution au Maroc et en Afrique de l'Ouest. 200M m³/an de capacité, 3,5 kWh/m³, 99,5 % de disponibilité."
        : 'Harch Water builds and operates AI-optimized desalination plants and distribution networks across Morocco and West Africa. 200M m³/yr capacity, 3.5 kWh/m³, 99.5% uptime.',
      foundingDate: '2024',
      foundingLocation: {
        '@type': 'Place',
        name: 'Casablanca',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Casablanca',
          addressCountry: 'MA',
        },
      },
      areaServed: [
        { '@type': 'Country', name: 'Morocco' },
        { '@type': 'Country', name: 'Senegal' },
        { '@type': 'Country', name: 'Gambia' },
        { '@type': 'Country', name: "Côte d'Ivoire" },
        { '@type': 'Place', name: 'West Africa' },
      ],
      knowsAbout: [
        'Seawater desalination',
        'Reverse osmosis',
        'AI water network optimization',
        'Smart water meters',
        'Leak detection',
        'Brine mining',
        'Solar desalination',
        'BOT / BOO project finance',
        'WHO drinking water standards',
        'Renewable energy integration',
      ],
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Boulevard de la Corniche',
        addressLocality: 'Casablanca',
        addressRegion: 'Casablanca-Settat',
        postalCode: '20000',
        addressCountry: 'MA',
      },
    };
  }

  return null;
}

/**
 * Service schema for subsidiary offerings — currently the energy and
 * intelligence subsidiaries have explicit Service schemas; the structure
 * supports adding more subsidiaries later.
 */
function buildSubsidiaryServiceSchema(slug: string, locale: string): Record<string, unknown> | null {
  const isFr = locale === 'fr';
  // Localize the path for FR: /subsidiaries → /filiales (see i18n/routing.ts
  // pathnames mapping). Other path segments are kept as-is.
  const absoluteUrl = (path: string) => {
    if (path === '') return 'https://www.harchcorp.com';
    const localizedPath = isFr ? path.replace(/^\/subsidiaries/, '/filiales') : path;
    return `https://www.harchcorp.com${isFr ? '/fr' : ''}${localizedPath}`;
  };

  if (slug === 'energy') {
    const subsidiaryUrl = absoluteUrl('/subsidiaries/energy');
    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${subsidiaryUrl}#service`,
      serviceType: isFr
        ? 'Installation de centrales solaires pour entreprises'
        : 'Solar farm installation for enterprises',
      name: isFr ? 'Centrales solaires Tier-1 pour entreprises' : 'Tier-1 Solar Farms for Enterprises',
      provider: {
        '@type': 'Organization',
        '@id': `${subsidiaryUrl}#organization`,
        name: 'Harch Energy',
      },
      areaServed: {
        '@type': 'Place',
        name: 'Morocco',
      },
      description: isFr
        ? "Centrales solaires Tier-1 avec panneaux Jinko Solar et LONGi, onduleurs Huawei/Sungrow, monitoring intégré, installation en 6-8 mois, garantie 25 ans. Réduction jusqu'à 60 % de la facture ONEE."
        : 'Tier-1 solar farms with Jinko Solar and LONGi panels, Huawei/Sungrow inverters, integrated monitoring, 6-8 month installation, 25-year warranty. Up to 60% ONEE bill reduction.',
      offers: {
        '@type': 'Offer',
        availability: 'https://schema.org/InStock',
        priceCurrency: 'MAD',
        priceSpecification: {
          '@type': 'PriceSpecification',
          priceCurrency: 'MAD',
          description: isFr
            ? 'Devis gratuit — paiement échelonné 30/30/30/10'
            : 'Free quote — 30/30/30/10 milestone payments',
        },
      },
      brand: { '@type': 'Brand', name: 'Harch Energy' },
      url: subsidiaryUrl,
    };
  }

  if (slug === 'technology') {
    const subsidiaryUrl = absoluteUrl('/subsidiaries/technology');
    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${subsidiaryUrl}#service`,
      serviceType: isFr
        ? 'Technologie souveraine, cybersécurité, communications par satellite'
        : 'Sovereign technology, cybersecurity, satellite communications',
      name: isFr
        ? 'Infrastructure Numérique Souveraine & Cybersécurité'
        : 'Sovereign Digital Infrastructure & Cybersecurity',
      provider: {
        '@type': 'Organization',
        '@id': `${subsidiaryUrl}#organization`,
        name: 'Harch Technology',
      },
      areaServed: [
        { '@type': 'Place', name: 'Morocco' },
        { '@type': 'Place', name: 'Gambia' },
        { '@type': 'Place', name: 'Senegal' },
        { '@type': 'Place', name: 'Africa' },
      ],
      description: isFr
        ? "Pile numérique souveraine — cloud, cybersécurité, satellite et edge computing — afin que l'Afrique possède ses données, son calcul et sa sécurité."
        : 'Full sovereign digital stack — cloud, cybersecurity, satellite, and edge computing — so Africa owns its data, compute, and security.',
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: isFr
          ? 'Services de Technologie Souveraine'
          : 'Sovereign Technology Services',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Sovereign AI Platform',
              description: isFr
                ? 'Plateforme IA complète hébergée sous juridiction africaine.'
                : 'Full-stack AI platform hosted under African jurisdiction.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Cybersecurity Suite',
              description: isFr
                ? 'Plateforme de cybersécurité de bout en bout pour infrastructures critiques.'
                : 'End-to-end cybersecurity platform for critical infrastructure.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Satellite Communications',
              description: isFr
                ? 'Connectivité satellite LEO + MEO avec SLA 99,99 %.'
                : 'LEO + MEO satellite connectivity with 99.99% SLA.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Edge Computing Network',
              description: isFr
                ? '50+ nœuds edge dans 5 pays pour IoT et IA.'
                : '50+ edge nodes across 5 countries for IoT and AI.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Sovereign Cloud',
              description: isFr
                ? 'Cloud africain avec résidence complète des données.'
                : 'African cloud with full data residency.',
            },
          },
        ],
      },
      brand: { '@type': 'Brand', name: 'Harch Technology' },
      url: subsidiaryUrl,
    };
  }

  if (slug === 'mining') {
    const subsidiaryUrl = absoluteUrl('/subsidiaries/mining');
    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${subsidiaryUrl}#service`,
      serviceType: isFr
        ? 'Extraction et traitement minéral stratégique'
        : 'Strategic mineral extraction and processing',
      name: isFr
        ? 'Traitement Minéral Stratégique — Phosphates, Cobalt, Terres Rares'
        : 'Strategic Mineral Processing — Phosphates, Cobalt, Rare Earths',
      provider: {
        '@type': 'Organization',
        '@id': `${subsidiaryUrl}#organization`,
        name: 'Harch Mining',
      },
      areaServed: [
        { '@type': 'Place', name: 'Morocco' },
        { '@type': 'Place', name: 'Mauritania' },
        { '@type': 'Place', name: 'Africa' },
      ],
      description: isFr
        ? "Opérations minières intégrées — extraction, beneficiation, traitement hydrométallurgique et raffinage sur le sol africain, alimentées à 100 % par l'énergie renouvelable de Harch Energy."
        : 'Integrated mining operations — extraction, beneficiation, hydrometallurgical processing, and refining on African soil, powered 100% by Harch Energy renewables.',
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: isFr
          ? 'Produits Minéraux Stratégiques Harch Mining'
          : 'Harch Mining Strategic Mineral Products',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Product',
              name: 'Phosphate Fertilizer',
              description: isFr
                ? 'Roche phosphate marchande et acide phosphorique — 5M t/an depuis le Maroc.'
                : 'Merchant-grade phosphate rock and phosphoric acid — 5M t/yr from Morocco.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Product',
              name: 'Battery-Grade Cobalt',
              description: isFr
                ? 'Sulfate de cobalt qualité batterie — 10K t/an depuis la Mauritanie.'
                : 'Battery-grade cobalt sulfate — 10K t/yr from Mauritania.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Product',
              name: 'Rare Earth Oxides',
              description: isFr
                ? 'Oxydes de néodyme et dysprosium séparés à 99,9 % de pureté.'
                : 'Neodymium and dysprosium oxides separated to 99.9% purity.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Product',
              name: 'Solar-Grade Silicon',
              description: isFr
                ? 'Silicium raffiné pour chaînes photovoltaïques.'
                : 'Refined silicon for photovoltaic supply chains.',
            },
          },
        ],
      },
      brand: { '@type': 'Brand', name: 'Harch Mining' },
      url: subsidiaryUrl,
    };
  }

  if (slug === 'intelligence') {
    const subsidiaryUrl = absoluteUrl('/subsidiaries/intelligence');
    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${subsidiaryUrl}#service`,
      serviceType: isFr
        ? 'Cloud GPU, infrastructure IA souveraine'
        : 'GPU cloud, sovereign AI infrastructure',
      name: isFr
        ? 'Cloud GPU IA Souverain Conscient du Carbone'
        : 'Carbon-Aware Sovereign AI GPU Cloud',
      provider: {
        '@type': 'Organization',
        '@id': `${subsidiaryUrl}#organization`,
        name: 'Harch Intelligence',
      },
      areaServed: [
        { '@type': 'Place', name: 'Morocco' },
        { '@type': 'Place', name: 'France' },
        { '@type': 'Place', name: 'Spain' },
        { '@type': 'Place', name: 'Africa' },
        { '@type': 'Place', name: 'Europe' },
      ],
      description: isFr
        ? 'Cloud GPU IA souverain — 1 798 GPU sur 5 hubs Maroc à 48.2 gCO2/kWh. Ordonnancement conscient du carbone, connectivité sous-marine Europe.'
        : 'Sovereign AI GPU cloud — 1,798 GPUs across 5 Morocco hubs at 48.2 gCO2/kWh. Carbon-aware scheduling, submarine cable connectivity to Europe.',
      offers: {
        '@type': 'Offer',
        availability: 'https://schema.org/InStock',
        priceCurrency: 'USD',
        priceSpecification: {
          '@type': 'PriceSpecification',
          priceCurrency: 'USD',
          minPrice: '2.80',
          unitText: isFr ? 'par GPU/heure' : 'per GPU/hour',
        },
      },
      brand: { '@type': 'Brand', name: 'HarchOS' },
      url: subsidiaryUrl,
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: isFr
          ? 'Services Cloud GPU Harch Intelligence'
          : 'Harch Intelligence GPU Cloud Services',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'GPU-as-a-Service',
              description: isFr
                ? 'GPU à la demande (H100, A100, L40S, MI300X) dès 2,80 $/h.'
                : 'On-demand GPUs (H100, A100, L40S, MI300X) from $2.80/h.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Sovereign AI Cloud',
              description: isFr
                ? 'Cloud IA hébergé sous juridiction africaine avec résidence des données.'
                : 'AI cloud hosted under African jurisdiction with full data residency.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Colocation Services',
              description: isFr
                ? 'Colocation hyperscale 50 MW+ avec refroidissement direct liquide.'
                : 'Hyperscale colocation 50MW+ with direct liquid cooling.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Strategic Partnerships',
              description: isFr
                ? 'Partenariats capacitaires long terme pour souveraineté IA nationale.'
                : 'Long-term capacity partnerships for national AI sovereignty.',
            },
          },
        ],
      },
    };
  }

  if (slug === 'cement') {
    const subsidiaryUrl = absoluteUrl('/subsidiaries/cement');
    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${subsidiaryUrl}#service`,
      serviceType: isFr ? 'Fabrication de ciment vert' : 'Green cement manufacturing',
      name: isFr
        ? 'Production de Ciment Vert 500kT/an'
        : '500kT/yr Green Cement Production',
      provider: {
        '@type': 'Organization',
        '@id': `${subsidiaryUrl}#organization`,
        name: 'Harch Cement',
      },
      areaServed: [
        { '@type': 'Place', name: 'Gambia' },
        { '@type': 'Place', name: 'Senegal' },
        { '@type': 'Place', name: 'Guinea-Bissau' },
        { '@type': 'Place', name: 'Guinea' },
        { '@type': 'Place', name: 'West Africa' },
      ],
      url: subsidiaryUrl,
      description: isFr
        ? 'Production de ciment verticalement intégrée en Gambie avec formulations LC3, énergie renouvelable et substitution des importations.'
        : 'Vertically integrated cement production in Gambia with LC3 formulations, renewable energy and import substitution.',
      offers: {
        '@type': 'Offer',
        availability: 'https://schema.org/InStock',
        priceCurrency: 'USD',
        priceSpecification: {
          '@type': 'PriceSpecification',
          priceCurrency: 'USD',
          minPrice: '65',
          maxPrice: '75',
          unitText: isFr ? 'par tonne' : 'per tonne',
          description: isFr
            ? '30-50% sous le prix des importations — ciment vert produit localement'
            : '30-50% below import prices — locally produced green cement',
        },
      },
      brand: { '@type': 'Brand', name: 'Harch Cement' },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: isFr ? 'Produits Harch Cement' : 'Harch Cement Products',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Product',
              name: isFr ? 'Ciment Portland Vert (CEM I/II)' : 'Green Portland Cement (CEM I/II)',
              description: isFr
                ? 'Ciment vert avec facteur de clinker sous 85%, certification EN 197.'
                : 'Green cement with clinker factor below 85%, EN 197 certified.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Product',
              name: isFr ? 'Ciment LC3 (argile calcinée)' : 'LC3 Cement (calcined clay)',
              description: isFr
                ? 'Ciment LC3 avec facteur de clinker sous 70% — cible 2029.'
                : 'LC3 cement with clinker factor below 70% — 2029 target.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Product',
              name: isFr ? 'Ciment en Vrac' : 'Bulk Cement',
              description: isFr
                ? 'Livraison en vrac par barge fluviale et camions citernes.'
                : 'Bulk delivery via river barge and cement tankers.',
            },
          },
        ],
      },
    };
  }

  if (slug === 'finance') {
    const subsidiaryUrl = absoluteUrl('/subsidiaries/finance');
    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${subsidiaryUrl}#service`,
      serviceType: isFr
        ? "Finance d'infrastructure africaine — obligations vertes, financement de projets, sukuk"
        : 'African infrastructure finance — green bonds, project finance, sukuk',
      name: isFr
        ? 'Harch Finance — Capital pour l\'Infrastructure Africaine'
        : 'Harch Finance — Capital for African Infrastructure',
      provider: {
        '@type': 'Organization',
        '@id': `${subsidiaryUrl}#organization`,
        name: 'Harch Finance',
      },
      areaServed: [
        { '@type': 'Country', name: 'Morocco' },
        { '@type': 'Country', name: 'Senegal' },
        { '@type': 'Country', name: 'Kenya' },
        { '@type': 'Country', name: 'Ghana' },
        { '@type': 'Country', name: 'Gambia' },
        { '@type': 'Place', name: 'Africa' },
      ],
      url: subsidiaryUrl,
      description: isFr
        ? "Harch Finance structure des obligations vertes, du financement de projets, des sukuk islamiques et du capital mixte pour l'infrastructure africaine. Pipeline 2,4 Mds$, TRI réel 14,2 %, 0 défaut, conforme AAOIFI."
        : "Harch Finance structures green bonds, project finance, Islamic sukuk and blended capital for African infrastructure. $2.4B pipeline, 14.2% actual IRR, 0 defaults, AAOIFI compliant.",
      offers: {
        '@type': 'Offer',
        availability: 'https://schema.org/InStock',
        priceCurrency: 'USD',
        priceSpecification: {
          '@type': 'PriceSpecification',
          priceCurrency: 'USD',
          minPrice: '50000000',
          description: isFr
            ? 'Taille de ticket minimale 50 M$ — proposition personnalisée sous 5 jours ouvrables'
            : 'Minimum ticket size $50M — custom proposal within 5 business days',
        },
      },
      brand: { '@type': 'Brand', name: 'Harch Finance' },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: isFr
          ? 'Instruments Financiers Harch Finance'
          : 'Harch Finance Financial Instruments',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'FinancialProduct',
              name: isFr ? 'Obligations Vertes' : 'Green Bonds',
              description: isFr
                ? 'Obligations vertes certifiées Green Bond Principles finançant les énergies renouvelables et les infrastructures durables en Afrique.'
                : 'ICMA Green Bond Principles-aligned green bonds funding renewable energy and sustainable infrastructure across Africa.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'FinancialProduct',
              name: isFr ? 'Financement de Projets' : 'Project Finance',
              description: isFr
                ? "Structures de financement de projets à recours limité pour les mégaprojets d'infrastructure africaine."
                : 'Limited-recourse project finance structures for African infrastructure mega-projects.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'FinancialProduct',
              name: isFr ? 'Finance Islamique (Sukuk)' : 'Islamic Finance (Sukuk)',
              description: isFr
                ? "Structures Sukuk et financement de projets islamiques conformes à la Charia pour l'infrastructure africaine."
                : 'Sharia-compliant Sukuk structures and Islamic project finance for African infrastructure.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'FinancialProduct',
              name: isFr ? 'Capital Mixte (Blended Finance)' : 'Blended Finance',
              description: isFr
                ? "Véhicules de capital mixte associant dettes DFI, garanties MIGA et capital souverain pour les projets souverains africains."
                : 'Blended finance vehicles combining DFI debt, MIGA guarantees, and sovereign capital for African sovereign projects.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'FinancialProduct',
              name: isFr ? 'Investissement à Impact' : 'Impact Investment',
              description: isFr
                ? "Investissement à impact avec alignement mesurable sur les ODD et covenants de création d'emplois."
                : 'Impact investment with measurable SDG alignment and jobs creation covenants.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'FinancialProduct',
              name: isFr ? 'Crédits Carbone' : 'Carbon Credits',
              description: isFr
                ? 'Crédits carbone vérifiés Verra & Gold Standard avec retrait automatisé et reporting.'
                : 'Verified Verra & Gold Standard carbon credits with automated retirement and reporting.',
            },
          },
        ],
      },
    };
  }

  if (slug === 'agriculture') {
    const subsidiaryUrl = absoluteUrl('/subsidiaries/agriculture');
    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${subsidiaryUrl}#service`,
      serviceType: isFr ? 'Agriculture de précision' : 'Precision Agriculture',
      name: isFr ? 'Agriculture de Précision & IoT pour l\'Afrique' : 'Precision Agriculture & IoT for Africa',
      provider: {
        '@type': 'Organization',
        '@id': `${subsidiaryUrl}#organization`,
        name: 'Harch Agri',
      },
      areaServed: [
        { '@type': 'Place', name: 'Senegal' },
        { '@type': 'Place', name: 'Morocco' },
        { '@type': 'Place', name: 'Kenya' },
        { '@type': 'Place', name: 'Ghana' },
        { '@type': 'Place', name: 'Africa' },
      ],
      url: subsidiaryUrl,
      description: isFr
        ? "Harch Agri déploie l'agriculture de précision en Afrique — surveillance IoT, intelligence par drone, agriculture verticale sur 5 000+ hectares au Sénégal et au Sahel."
        : 'Harch Agri deploys precision agriculture across Africa — IoT monitoring, drone intelligence, vertical farming on 5,000+ hectares in Senegal and the Sahel belt.',
      offers: {
        '@type': 'Offer',
        availability: 'https://schema.org/InStock',
        priceCurrency: 'USD',
        priceSpecification: {
          '@type': 'PriceSpecification',
          priceCurrency: 'USD',
          minPrice: '50',
          unitText: isFr ? 'par hectare / mois' : 'per hectare / month',
        },
      },
      brand: { '@type': 'Brand', name: 'Harch Agri' },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: isFr ? 'Services Harch Agri' : 'Harch Agri Services',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: isFr ? 'Drones agricoles (DaaS)' : 'Agricultural Drones (DaaS)',
              description: isFr
                ? 'Surveillance par drone, pulvérisation de précision et imagerie multispectrale couvrant 40 ha.'
                : 'Drone surveillance, precision spraying, and multispectral imaging covering 40 ha.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: isFr ? 'Capteurs IoT agricoles' : 'Agricultural IoT Sensors',
              description: isFr
                ? "Capteurs de sol et stations météorologiques avec économies d'eau de 30 à 50 %."
                : 'Soil sensors and weather stations with 30-50% water savings.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: isFr ? 'Fermes verticales' : 'Vertical Farms',
              description: isFr
                ? "Modules de ferme verticale avec 95 % d'économie d'eau et ROI en 12 à 18 mois."
                : 'Vertical farm modules with 95% water savings and 12-18 month ROI.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: isFr ? 'Crédits carbone agricoles' : 'Agricultural Carbon Credits',
              description: isFr
                ? 'Génération et courtage de crédits carbone (0,5-3 tCO2/ha) avec commission de 2 %.'
                : 'Carbon credit generation and brokerage (0.5-3 tCO2/ha) with 2% commission.',
            },
          },
        ],
      },
    };
  }

  if (slug === 'water') {
    const subsidiaryUrl = absoluteUrl('/subsidiaries/water');
    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${subsidiaryUrl}#service`,
      serviceType: isFr
        ? 'Dessalement IA et infrastructure hydrique'
        : 'AI desalination and water infrastructure',
      name: isFr
        ? 'Harch Water — Dessalement IA & Réseau Intelligent'
        : 'Harch Water — AI Desalination & Smart Network',
      provider: {
        '@type': 'Organization',
        '@id': `${subsidiaryUrl}#organization`,
        name: 'Harch Water',
      },
      areaServed: [
        { '@type': 'Country', name: 'Morocco' },
        { '@type': 'Country', name: 'Senegal' },
        { '@type': 'Country', name: 'Gambia' },
        { '@type': 'Country', name: "Côte d'Ivoire" },
        { '@type': 'Place', name: 'West Africa' },
      ],
      url: subsidiaryUrl,
      description: isFr
        ? "Harch Water construit et exploite des usines de dessalement optimisées par IA et des réseaux de distribution au Maroc et en Afrique de l'Ouest. 200M m³/an, 3,5 kWh/m³, 99,5 % de disponibilité, 23 % de réduction des pertes."
        : 'Harch Water builds and operates AI-optimized desalination plants and distribution networks across Morocco and West Africa. 200M m³/yr, 3.5 kWh/m³, 99.5% uptime, 23% loss reduction.',
      offers: {
        '@type': 'Offer',
        availability: 'https://schema.org/InStock',
        priceCurrency: 'MAD',
        priceSpecification: {
          '@type': 'PriceSpecification',
          priceCurrency: 'MAD',
          minPrice: '8',
          unitText: isFr ? 'par m³' : 'per m³',
          description: isFr
            ? 'Eau dessalée traitée — 8 MAD/m³ (Bulk), BOT/BOO sur mesure. SLA 99,5 %.'
            : 'Treated desalinated water — 8 MAD/m³ (Bulk), custom BOT/BOO. 99.5% SLA.',
        },
      },
      brand: { '@type': 'Brand', name: 'Harch Water' },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: isFr ? 'Services Harch Water' : 'Harch Water Services',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: isFr ? 'Achat en gros' : 'Bulk Buyer',
              description: isFr
                ? 'Eau dessalée traitée. 1 000-50 000 m³/mois. Certificat QR-coded. Compteur intelligent.'
                : 'Treated desalinated water. 1,000-50,000 m³/month. QR-coded certificate. Smart meter.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: isFr ? 'Concession BOT' : 'BOT Concession',
              description: isFr
                ? 'Usine dédiée, zéro Capex, concession 15-25 ans, SLA 99,5 %.'
                : 'Dedicated plant, zero capex, 15-25 year concession, 99.5% SLA.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: isFr ? 'Partenaire BOO' : 'BOO Partner',
              description: isFr
                ? 'Co-investissement 20-40 % équité, siège au conseil, priorité offtake.'
                : 'Co-invest 20-40% equity, board seat, offtake priority.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: isFr ? 'Réponse d\'urgence' : 'Emergency Response',
              description: isFr
                ? 'Unité mobile 500 m³/jour sous 48 h partout au Maroc. Autonome, solaire.'
                : 'Mobile 500 m³/day unit within 48h anywhere in Morocco. Self-contained, solar.',
            },
          },
        ],
      },
    };
  }

  return null;
}

/**
 * SoftwareApplication schema for the intelligence subsidiary — describes
 * HarchOS, the carbon-aware GPU cloud platform, with feature list,
 * supported GPU types, provider, and offer. Mirrors the visible content
 * on the IntelligencePage so Google can validate the structured data.
 */
function buildIntelligenceSoftwareSchema(locale: string): Record<string, unknown> | null {
  const isFr = locale === 'fr';
  const subsidiaryUrl = isFr
    ? 'https://www.harchcorp.com/fr/filiales/intelligence'
    : 'https://www.harchcorp.com/subsidiaries/intelligence';

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${subsidiaryUrl}#software`,
    name: 'HarchOS',
    alternateName: 'Harch Intelligence Platform',
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'AI Infrastructure',
    operatingSystem: 'Cloud (Linux, Kubernetes)',
    description: isFr
      ? 'HarchOS — plateforme cloud GPU consciente du carbone pour charges IA. Ordonnancement temps réel, 1 798 GPU, 5 hubs Maroc, 48.2 gCO2/kWh.'
      : 'HarchOS — carbon-aware GPU cloud platform for AI workloads. Real-time scheduling, 1,798 GPUs, 5 Morocco hubs, 48.2 gCO2/kWh.',
    url: subsidiaryUrl,
    image: 'https://www.harchcorp.com/images/sections/intelligence-gpu-cluster.jpg',
    screenshot: 'https://www.harchcorp.com/images/sections/intelligence-rack.jpg',
    softwareVersion: '0.1',
    inLanguage: ['en', 'fr'],
    featureList: isFr
      ? [
          '1 798 GPU optimisés carbone',
          '5 hubs au Maroc (Dakhla, Casablanca, Tanger, Rabat, Marrakech)',
          'Intensité carbone 48.2 gCO2/kWh',
          'Ordonnancement conscient du carbone en temps réel',
          'Connectivité sous-marine vers Europe (<8 ms)',
          'Support H100, A100, L40S, MI300X',
          'GPU-as-a-Service, IA souveraine, colocation',
        ]
      : [
          '1,798 carbon-optimized GPUs',
          '5 hubs across Morocco (Dakhla, Casablanca, Tangier, Rabat, Marrakech)',
          '48.2 gCO2/kWh carbon intensity',
          'Real-time carbon-aware scheduling',
          'Submarine cable connectivity to Europe (<8 ms)',
          'H100, A100, L40S, MI300X support',
          'GPU-as-a-Service, Sovereign AI, Colocation',
        ],
    provider: {
      '@type': 'Organization',
      '@id': `${subsidiaryUrl}#organization`,
      name: 'Harch Intelligence',
      url: subsidiaryUrl,
    },
    publisher: {
      '@type': 'Organization',
      '@id': 'https://www.harchcorp.com/#organization',
      name: 'Harch Corp',
      url: 'https://www.harchcorp.com',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: '0',
      availability: 'https://schema.org/InStock',
      description: isFr
        ? 'GPU-as-a-Service dès 2,80 $/h. Tarifs sur devis pour IA souveraine et colocation.'
        : 'GPU-as-a-Service from $2.80/h. Custom pricing for Sovereign AI and Colocation.',
      priceSpecification: {
        '@type': 'PriceSpecification',
        priceCurrency: 'USD',
        minPrice: '2.80',
        unitText: isFr ? 'par GPU/heure' : 'per GPU/hour',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '127',
      bestRating: '5',
      worstRating: '1',
    },
  };
}

/**
 * FAQPage schema for the cement subsidiary — pulls the 4 Q&A items from
 * the cementTesla i18n namespace so EN + FR stay in sync with the visible
 * FAQ accordion on the page.
 */
async function buildCementFaqSchema(locale: string): Promise<Record<string, unknown> | null> {
  const isFr = locale === 'fr';
  const subsidiaryUrl = isFr
    ? 'https://www.harchcorp.com/fr/filiales/cement'
    : 'https://www.harchcorp.com/subsidiaries/cement';

  const t = await getTranslations({ locale, namespace: 'cementTesla' });
  const faqItems = t.raw('faq.items') as { q: string; a: string }[];

  if (!faqItems || faqItems.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${subsidiaryUrl}#faq`,
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
}

/**
 * FAQPage schema for the technology subsidiary — pulls the 5 Q&A items
 * from the techTesla i18n namespace so EN + FR stay in sync with the
 * visible FAQ accordion on the page.
 */
async function buildTechnologyFaqSchema(locale: string): Promise<Record<string, unknown> | null> {
  const isFr = locale === 'fr';
  const subsidiaryUrl = isFr
    ? 'https://www.harchcorp.com/fr/filiales/technology'
    : 'https://www.harchcorp.com/subsidiaries/technology';

  const t = await getTranslations({ locale, namespace: 'techTesla' });
  const faqItems = t.raw('faq.items') as { q: string; a: string }[];

  if (!faqItems || faqItems.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${subsidiaryUrl}#faq`,
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
}

/**
 * FAQPage schema for the mining subsidiary — pulls the 6 Q&A items
 * from the miningTesla i18n namespace so EN + FR stay in sync with the
 * visible FAQ accordion on the page.
 */
async function buildMiningFaqSchema(locale: string): Promise<Record<string, unknown> | null> {
  const isFr = locale === 'fr';
  const subsidiaryUrl = isFr
    ? 'https://www.harchcorp.com/fr/filiales/mining'
    : 'https://www.harchcorp.com/subsidiaries/mining';

  const t = await getTranslations({ locale, namespace: 'miningTesla' });
  const faqItems = t.raw('faq.items') as { q: string; a: string }[];

  if (!faqItems || faqItems.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${subsidiaryUrl}#faq`,
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
}

/**
 * FAQPage schema for the agriculture subsidiary — pulls the Q&A items
 * from the agriTesla i18n namespace so EN + FR stay in sync with the
 * visible FAQ accordion on the page.
 */
async function buildAgricultureFaqSchema(locale: string): Promise<Record<string, unknown> | null> {
  const isFr = locale === 'fr';
  const subsidiaryUrl = isFr
    ? 'https://www.harchcorp.com/fr/filiales/agriculture'
    : 'https://www.harchcorp.com/subsidiaries/agriculture';

  const t = await getTranslations({ locale, namespace: 'agriTesla' });
  const faqItems = t.raw('faq.items') as { q: string; a: string }[];

  if (!faqItems || faqItems.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${subsidiaryUrl}#faq`,
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
}

/**
 * FAQPage schema for the finance subsidiary — pulls the Q&A items from
 * the financeTesla i18n namespace so EN + FR stay in sync with the
 * visible FAQ accordion on the page.
 */
async function buildFinanceFaqSchema(locale: string): Promise<Record<string, unknown> | null> {
  const isFr = locale === 'fr';
  const subsidiaryUrl = isFr
    ? 'https://www.harchcorp.com/fr/filiales/finance'
    : 'https://www.harchcorp.com/subsidiaries/finance';

  const t = await getTranslations({ locale, namespace: 'financeTesla' });
  const faqItems = t.raw('faq.items') as { q: string; a: string }[];

  if (!faqItems || faqItems.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${subsidiaryUrl}#faq`,
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
}

/**
 * FAQPage schema for the water subsidiary — pulls the 8 Q&A items
 * from the waterTesla i18n namespace so EN + FR stay in sync with the
 * visible FAQ accordion on the page.
 */
async function buildWaterFaqSchema(locale: string): Promise<Record<string, unknown> | null> {
  const isFr = locale === 'fr';
  const subsidiaryUrl = isFr
    ? 'https://www.harchcorp.com/fr/filiales/water'
    : 'https://www.harchcorp.com/subsidiaries/water';

  const t = await getTranslations({ locale, namespace: 'waterTesla' });
  const faqItems = t.raw('faq.items') as { q: string; a: string }[];

  if (!faqItems || faqItems.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${subsidiaryUrl}#faq`,
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const isFr = locale === 'fr';
  const metaMap = isFr ? subsidiaryMetaFr : subsidiaryMetaEn;
  const meta = metaMap[slug];

  if (!meta) {
    return {
      title: isFr ? 'Filiales | Harch Corp' : 'Subsidiaries | Harch Corp',
      description: isFr
        ? "Explorez les 8 verticales industrielles de Harch Corp — centres de données IA, énergie renouvelable, ciment, technologie, mines, agriculture, eau et finance."
        : "Explore Harch Corp's 8 industrial verticals — AI data centers, renewable energy, cement, technology, mining, agriculture, water, and finance.",
      robots: { index: true, follow: true },
    };
  }

  const baseUrl = isFr
    ? `https://www.harchcorp.com/fr/filiales/${slug}`
    : `https://www.harchcorp.com/subsidiaries/${slug}`;

  return {
    // Subsidiaries with SEO-optimized titles in the 50-60 char sweet spot use the
    // absolute form so the layout template does not append " | Harch Corp" (which
    // would push the title past 60 chars).
    title: slug === 'technology' || slug === 'mining' || slug === 'finance' || slug === 'agriculture'
      ? { absolute: meta.title }
      : meta.title,
    description: meta.description,
    keywords: meta.keywords,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'website',
      url: baseUrl,
      siteName: 'Harch Corp',
      locale: isFr ? 'fr_MA' : 'en_US',
      alternateLocale: isFr ? ['en_US'] : ['fr_MA'],
      images: [
        {
          url: meta.heroImage,
          width: 1200,
          height: 630,
          alt: meta.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: [meta.heroImage],
    },
    alternates: {
      canonical: baseUrl,
      languages: {
        en: `https://www.harchcorp.com/subsidiaries/${slug}`,
        fr: `https://www.harchcorp.com/fr/filiales/${slug}`,
        'x-default': `https://www.harchcorp.com/subsidiaries/${slug}`,
      },
    },
  };
}

export function generateStaticParams() {
  return Object.keys(subsidiaryMetaEn).map((slug) => ({ slug }));
}

export default async function SubsidiaryPage({ params }: PageProps) {
  const { slug, locale } = await params;
  const isFr = locale === 'fr';
  const metaMap = isFr ? subsidiaryMetaFr : subsidiaryMetaEn;
  const meta = metaMap[slug];
  const pageTitle = meta?.title || (isFr ? 'Filiales' : 'Subsidiaries');
  const pageUrl = isFr
    ? `https://www.harchcorp.com/fr/filiales/${slug}`
    : `https://www.harchcorp.com/subsidiaries/${slug}`;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${pageUrl}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: isFr ? 'Accueil' : 'Home',
        item: isFr ? 'https://www.harchcorp.com/fr' : 'https://www.harchcorp.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: isFr ? 'Filiales' : 'Subsidiaries',
        item: isFr ? 'https://www.harchcorp.com/fr/filiales' : 'https://www.harchcorp.com/subsidiaries',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: pageTitle,
        item: pageUrl,
      },
    ],
  };

  // Subsidiary-specific Organization + Service schemas (energy, technology, intelligence).
  const orgSchema = buildSubsidiaryOrgSchema(slug, locale);
  const serviceSchema = buildSubsidiaryServiceSchema(slug, locale);

  // Collect all JSON-LD payloads for this page so we render one <script> per
  // schema, each with the async attribute via the JsonLd component.
  const schemas: Record<string, unknown>[] = [breadcrumbSchema];
  if (orgSchema) schemas.push(orgSchema);
  if (serviceSchema) schemas.push(serviceSchema);

  // Intelligence gets an extra SoftwareApplication schema describing HarchOS,
  // the carbon-aware GPU cloud platform (GPU-as-a-Service, Sovereign AI, Colocation).
  if (slug === 'intelligence') {
    const softwareSchema = buildIntelligenceSoftwareSchema(locale);
    if (softwareSchema) schemas.push(softwareSchema);
  }

  // Cement FAQ page schema — pulled from the cementTesla i18n namespace.
  if (slug === 'cement') {
    const faqSchema = await buildCementFaqSchema(locale);
    if (faqSchema) schemas.push(faqSchema);
  }

  // Technology FAQ page schema — pulled from the techTesla i18n namespace.
  if (slug === 'technology') {
    const faqSchema = await buildTechnologyFaqSchema(locale);
    if (faqSchema) schemas.push(faqSchema);
  }

  // Mining FAQ page schema — pulled from the miningTesla i18n namespace.
  if (slug === 'mining') {
    const faqSchema = await buildMiningFaqSchema(locale);
    if (faqSchema) schemas.push(faqSchema);
  }

  // Agriculture FAQ page schema — pulled from the agriTesla i18n namespace.
  if (slug === 'agriculture') {
    const faqSchema = await buildAgricultureFaqSchema(locale);
    if (faqSchema) schemas.push(faqSchema);
  }

  // Finance FAQ page schema — pulled from the financeTesla i18n namespace.
  if (slug === 'finance') {
    const faqSchema = await buildFinanceFaqSchema(locale);
    if (faqSchema) schemas.push(faqSchema);
  }

  // Water FAQ page schema — pulled from the waterTesla i18n namespace.
  if (slug === 'water') {
    const faqSchema = await buildWaterFaqSchema(locale);
    if (faqSchema) schemas.push(faqSchema);
  }

  return (
    <>
      {schemas.map((schema, i) => (
        <JsonLd
          key={(schema['@type'] as string) || `schema-${i}`}
          id={`subsidiary-${slug}-${(schema['@type'] as string) || i}-jsonld`}
          data={schema}
        />
      ))}
      <SubsidiaryWrapper />
    </>
  );
}
