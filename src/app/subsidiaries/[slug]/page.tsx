import { Metadata } from 'next';
import SubsidiaryWrapper from './SubsidiaryWrapper';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const subsidiaryMeta: Record<string, {
  title: string;
  description: string;
  heroImage: string;
  keywords: string[];
}> = {
  intelligence: {
    title: 'Harch Intelligence — Carbon-Aware GPU Cloud & Sovereign AI Infrastructure',
    description: 'Harch Intelligence operates 1,798 carbon-optimized GPUs across 5 hubs in Morocco at 48.2 gCO2/kWh — 89% below industry average. Sovereign AI compute with carbon-aware scheduling, 500MW pipeline, and direct submarine cable connectivity to Europe.',
    heroImage: '/images/sections/intelligence-exterior.jpg',
    keywords: ['Harch Intelligence', 'GPU cloud Africa', 'carbon-aware GPU scheduling', 'sovereign AI', 'data center Morocco', 'HarchOS', 'AI infrastructure Africa', 'green GPU cloud'],
  },
  cement: {
    title: 'Harch Cement — 500kT/yr Green Cement Production in Gambia',
    description: 'Harch Cement is building West Africa\'s future with 500kT/yr vertically integrated cement production in Gambia. Green cement formulations, renewable energy powered, import substitution for the construction boom.',
    heroImage: '/images/sections/cement-factory.jpg',
    keywords: ['Harch Cement', 'cement Gambia', 'green cement Africa', 'construction materials West Africa', 'LC3 cement', 'cement manufacturing'],
  },
  energy: {
    title: 'Harch Energy — 2GW+ Renewable Energy Pipeline Across Africa',
    description: 'Harch Energy develops 2GW+ renewable energy pipeline — solar, wind, and green hydrogen — powering Africa\'s industrial sovereignty. $14/MWh solar benchmark in Morocco, strategic hydrogen corridor to Europe.',
    heroImage: '/images/sections/energy-wind-farm.jpg',
    keywords: ['Harch Energy', 'renewable energy Africa', 'solar energy Morocco', 'green hydrogen', 'wind power Africa', 'clean energy infrastructure'],
  },
  technology: {
    title: 'Harch Technology — Sovereign Digital Infrastructure & Cybersecurity',
    description: 'Harch Technology builds sovereign digital infrastructure — cybersecurity platforms, satellite communications, and zero-trust networks protecting Africa\'s critical infrastructure from foreign surveillance and cyber threats.',
    heroImage: '/images/sections/tech-satellite.jpg',
    keywords: ['Harch Technology', 'sovereign technology Africa', 'cybersecurity infrastructure', 'satellite communications', 'zero-trust security', 'digital sovereignty'],
  },
  mining: {
    title: 'Harch Mining — Strategic Mineral Processing & Value Capture in Africa',
    description: 'Harch Mining captures the full mineral value chain — from extraction to refined processing on African soil. Phosphates, cobalt, rare earths, and strategic minerals processed domestically, ending raw ore export.',
    heroImage: '/images/sections/mining-open-pit.jpg',
    keywords: ['Harch Mining', 'mineral processing Africa', 'rare earths mining', 'cobalt processing', 'phosphate mining Morocco', 'strategic minerals'],
  },
  agriculture: {
    title: 'Harch Agri — Precision Agriculture & Vertical Farming Across the Sahel',
    description: 'Harch Agri deploys precision agriculture at scale — IoT monitoring, drone intelligence, vertical farming, and supply chain optimization across 5,000+ hectares in Senegal and the Sahel belt.',
    heroImage: '/images/sections/agri-aerial-drone.jpg',
    keywords: ['Harch Agri', 'precision agriculture Africa', 'vertical farming Sahel', 'IoT agriculture', 'drone farming', 'agritech Africa'],
  },
  water: {
    title: 'Harch Water — AI-Optimized Desalination & Water Infrastructure',
    description: 'Harch Water builds 200M m³/yr desalination capacity with AI-optimized distribution, achieving 23% water loss reduction. Solving Africa\'s water crisis through sovereign infrastructure.',
    heroImage: '/images/sections/water-desal-plant.jpg',
    keywords: ['Harch Water', 'water desalination Africa', 'AI water management', 'water infrastructure', 'desalination plant Morocco', 'water scarcity solutions'],
  },
  finance: {
    title: 'Harch Finance — Green Bonds, Project Finance & Islamic Finance for Africa',
    description: 'Harch Finance structures green bonds, project finance, trade finance, and Islamic finance instruments to fund Africa\'s sovereign infrastructure. $500M green bond program and Sukuk structures for capital mobilization.',
    heroImage: '/images/sections/finance-stock.jpg',
    keywords: ['Harch Finance', 'green bonds Africa', 'Islamic finance infrastructure', 'project finance Africa', 'Sukuk bonds', 'African investment'],
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const meta = subsidiaryMeta[slug];

  if (!meta) {
    return {
      title: 'Subsidiaries  | Harch Corp',
      description: "Explore Harch Corp's 8 industrial verticals — AI data centers, renewable energy, cement, technology, mining, agriculture, water, and finance.",
    };
  }

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'website',
      url: `https://www.harchcorp.com/subsidiaries/${slug}`,
      siteName: 'Harch Corp',
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
      canonical: `https://www.harchcorp.com/subsidiaries/${slug}`,
    },
  };
}

export function generateStaticParams() {
  return Object.keys(subsidiaryMeta).map((slug) => ({ slug }));
}

export default async function SubsidiaryPage({ params }: PageProps) {
  const { slug } = await params;
  const meta = subsidiaryMeta[slug];
  const pageTitle = meta?.title || 'Subsidiaries';

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.harchcorp.com' },
      { '@type': 'ListItem', position: 2, name: 'Subsidiaries', item: 'https://www.harchcorp.com/subsidiaries' },
      { '@type': 'ListItem', position: 3, name: pageTitle, item: `https://www.harchcorp.com/subsidiaries/${slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json" async={true}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <SubsidiaryWrapper />
    </>
  );
}
