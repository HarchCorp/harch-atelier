import type { Metadata } from 'next';
import HarchOSPageClient from './HarchOSPageClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isFr = locale === 'fr';

  const title = isFr
    ? 'HarchOS — Le Système d\'Exploitation pour l\'Infrastructure IA Souveraine'
    : 'HarchOS — The Operating System for Sovereign AI Infrastructure';

  const description = isFr
    ? 'HarchOS est le système d\'exploitation pour la première plateforme de calcul GPU sensible au carbone en Afrique — alimentée par l\'avantage énergétique renouvelable du Maroc. 1 798 GPUs planifiés, 5 hubs, cible 48.2 gCO2/kWh.'
    : 'HarchOS is the operating system for Africa\'s first carbon-aware GPU compute platform — powered by Morocco\'s renewable energy advantage. 1,798 planned GPUs, 5 hubs, 48.2 gCO2/kWh target.';

  const ogDescription = isFr
    ? '5 hubs. 1 798 GPUs planifiés. Jusqu\'à 97 % renouvelable. La plateforme GPU sensible au carbone de l\'Afrique.'
    : '5 hubs. 1,798 planned GPUs. Up to 97% renewable. Africa\'s carbon-aware GPU platform.';

  return {
    title,
    description,
    keywords: isFr
      ? [
          'HarchOS',
          'système d\'exploitation IA',
          'infrastructure IA souveraine',
          'maillage de calcul distribué',
          'cloud GPU vert',
          'centre de données énergie renouvelable',
          'calcul IA Maroc',
          'centre de données Dakhla',
          'centre de données Tanger',
          'centre de données solaire Ouarzazate',
        ]
      : [
          'HarchOS',
          'AI operating system',
          'sovereign AI infrastructure',
          'distributed compute mesh',
          'green GPU cloud',
          'renewable energy data center',
          'Morocco AI compute',
          'Dakhla data center',
          'Tanger data center',
          'Ouarzazate solar data center',
        ],
    openGraph: {
      title,
      description: ogDescription,
      url: isFr
        ? 'https://www.harchcorp.com/fr/intelligence/harchos'
        : 'https://www.harchcorp.com/intelligence/harchos',
      siteName: 'Harch Corp',
      type: 'website',
      locale: isFr ? 'fr_MA' : 'en_US',
      alternateLocale: isFr ? ['en_US'] : ['fr_MA'],
      images: [
        {
          url: '/images/intelligence/harchos-hero.png',
          width: 1920,
          height: 1080,
          alt: isFr
            ? 'HarchOS — Infrastructure IA Souveraine'
            : 'HarchOS — Sovereign AI Infrastructure',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: ogDescription,
      images: ['/images/intelligence/harchos-hero.png'],
    },
    alternates: {
      canonical: isFr
        ? 'https://www.harchcorp.com/fr/intelligence/harchos'
        : 'https://www.harchcorp.com/intelligence/harchos',
      languages: {
        en: 'https://www.harchcorp.com/intelligence/harchos',
        fr: 'https://www.harchcorp.com/fr/intelligence/harchos',
        'x-default': 'https://www.harchcorp.com/intelligence/harchos',
      },
    },
  };
}

export default async function HarchOSPage({
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
        item: isFr ? 'https://www.harchcorp.com/fr' : 'https://www.harchcorp.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Intelligence',
        item: isFr
          ? 'https://www.harchcorp.com/fr/intelligence'
          : 'https://www.harchcorp.com/intelligence',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'HarchOS',
        item: isFr
          ? 'https://www.harchcorp.com/fr/intelligence/harchos'
          : 'https://www.harchcorp.com/intelligence/harchos',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json" async={true}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <HarchOSPageClient />
    </>
  );
}
