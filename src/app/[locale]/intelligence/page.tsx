import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import IntelligencePageClient from './IntelligencePageClient';

// Generate locale-aware metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isFr = locale === 'fr';
  const t = await getTranslations({ locale, namespace: 'intelligence' });

  const title = isFr
    ? 'Centre de Données IA Maroc — Harch Intelligence | Cloud GPU Souverain'
    : 'AI Data Center Morocco — Harch Intelligence | Sovereign GPU Cloud';

  const description = isFr
    ? "Harch Intelligence exploite le premier centre de données IA souverain d'Afrique au Maroc : 1 798 GPU optimisés pour le carbone sur 5 hubs marocains à 48.2 gCO2/kWh. Pipeline de centre de données IA de 500 MW, ordonnancement conscient du carbone, connectivité par câble sous-marin. La plateforme cloud GPU leader au Maroc."
    : "Harch Intelligence operates Africa's first sovereign AI data center in Morocco: 1,798 carbon-optimized GPUs across 5 Moroccan hubs at 48.2 gCO2/kWh. 500MW AI data center pipeline, carbon-aware scheduling, submarine cable connectivity. Morocco's leading GPU cloud platform.";

  const ogDescription = isFr
    ? "Premier centre de données IA souverain d'Afrique au Maroc. 1 798 GPU optimisés pour le carbone sur 5 hubs à 48.2 gCO2/kWh — 89 % sous la moyenne du secteur. Pipeline de 500 MW."
    : "Africa's first sovereign AI data center in Morocco. 1,798 carbon-optimized GPUs across 5 hubs at 48.2 gCO2/kWh — 89% below industry average. 500MW pipeline.";

  const twitterDescription = isFr
    ? "Premier centre de données IA souverain d'Afrique. 1 798 GPU à 48.2 gCO2/kWh. Pipeline de 500 MW. Cloud GPU conscient du carbone depuis le Maroc."
    : "Africa's first sovereign AI data center. 1,798 GPUs at 48.2 gCO2/kWh. 500MW pipeline. Carbon-aware GPU cloud from Morocco.";

  return {
    title,
    description,
    keywords: isFr
      ? [
          'centre de données IA Maroc',
          'cloud GPU Maroc',
          'IA souveraine Afrique',
          'Harch Intelligence',
          'centre de données Maroc',
          'ordonnancement GPU conscient du carbone',
          'centre de données IA Afrique',
          'cloud GPU vert',
          'calcul faible intensité carbone',
          'HarchOS',
          'infrastructure IA Maroc',
          'centre de données Casablanca',
          'centre de données Dakhla',
          'centre de données 500 MW Maroc',
          'cloud GPU Afrique',
          'centre de données IA souverain',
          'usine IA Maroc',
          'cloud GPU conscient du carbone Maroc',
        ]
      : [
          'AI data center Morocco',
          'GPU cloud Morocco',
          'sovereign AI Africa',
          'Harch Intelligence',
          'data center Morocco',
          'carbon-aware GPU scheduling',
          'AI data center Africa',
          'green GPU cloud',
          'low carbon compute',
          'HarchOS',
          'AI infrastructure Morocco',
          'data center Casablanca',
          'Dakhla data center',
          '500MW data center Morocco',
          'GPU cloud Africa',
          'sovereign AI data center',
          'Morocco AI factory',
          'carbon-aware GPU cloud Morocco',
        ],
    alternates: {
      canonical: isFr
        ? 'https://www.harchcorp.com/fr/intelligence'
        : 'https://www.harchcorp.com/intelligence',
      languages: {
        en: 'https://www.harchcorp.com/intelligence',
        fr: 'https://www.harchcorp.com/fr/intelligence',
        'x-default': 'https://www.harchcorp.com/intelligence',
      },
    },
    openGraph: {
      title,
      description: ogDescription,
      url: isFr
        ? 'https://www.harchcorp.com/fr/intelligence'
        : 'https://www.harchcorp.com/intelligence',
      siteName: 'Harch Corp',
      type: 'website',
      locale: isFr ? 'fr_MA' : 'en_US',
      alternateLocale: isFr ? ['en_US'] : ['fr_MA'],
      images: [
        {
          url: '/images/og-harch-corp.png',
          width: 1200,
          height: 630,
          alt: isFr
            ? 'Harch Intelligence — Centre de Données IA Maroc'
            : 'Harch Intelligence — AI Data Center Morocco',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: isFr
        ? 'Centre de Données IA Maroc — Harch Intelligence'
        : 'AI Data Center Morocco — Harch Intelligence',
      description: twitterDescription,
      images: ['/images/og-harch-corp.png'],
    },
  };
}

export default async function IntelligencePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isFr = locale === 'fr';

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: isFr ? 'Accueil' : 'Home',
        item: isFr
          ? 'https://www.harchcorp.com/fr'
          : 'https://www.harchcorp.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Intelligence',
        item: isFr
          ? 'https://www.harchcorp.com/fr/intelligence'
          : 'https://www.harchcorp.com/intelligence',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json" async={true}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <IntelligencePageClient />
    </>
  );
}
