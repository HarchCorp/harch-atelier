import { Metadata } from 'next';
import HomePageClient from './HomePageClient';

export const metadata: Metadata = {
  title: "AI Data Center Morocco — Africa's Sovereign Infrastructure",
  description:
    "Harch Corp builds Africa's industrial sovereignty from Morocco — AI data centers with 1,798 GPUs, 500MW data center pipeline, 2GW+ renewable energy, cement, technology, mining, agriculture, water, and finance. $2.37B investment pipeline across 5 countries.",
  keywords: [
    'Harch Corp',
    'AI data center Morocco',
    'GPU cloud Morocco',
    'sovereign AI Africa',
    'Moroccan conglomerate',
    'carbon-aware GPU cloud',
    'data center Morocco',
    'renewable energy Africa',
    'sovereign infrastructure',
    'industrial conglomerate Africa',
    'HarchCorp',
    'Harch Corp',
    'Dakhla data center',
    '500MW data center',
    'Morocco AI factory',
    'green data center Africa',
    'AI infrastructure Africa',
  ],
  alternates: {
    canonical: 'https://www.harchcorp.com',
    languages: {
      en: 'https://www.harchcorp.com',
      fr: 'https://www.harchcorp.com/fr',
      'x-default': 'https://www.harchcorp.com',
    },
  },
  openGraph: {
    title: "AI Data Center Morocco — Africa's Sovereign Infrastructure",
    description:
      "Morocco's sovereign infrastructure conglomerate. AI data centers (1,798 GPUs), 500MW pipeline, 2GW+ renewable energy. $2.37B investment across 8 verticals.",
    url: 'https://www.harchcorp.com',
    siteName: 'Harch Corp',
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['fr_MA'],
    images: [
      {
        url: '/images/og-harch-corp.png',
        width: 1200,
        height: 630,
        alt: 'Harch Corp — AI Data Center Morocco | Sovereign Infrastructure',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "AI Data Center Morocco",
    description:
      "Morocco's sovereign infrastructure conglomerate. 1,798 GPUs, 500MW pipeline, 2GW+ renewable energy. $2.37B across 8 verticals.",
    images: ['/images/og-harch-corp.png'],
  },
};

export default function HomePage() {
  // BreadcrumbList JSON-LD
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.harchcorp.com',
      },
    ],
  };

  // DataCenter JSON-LD for rich results
  const dataCenterSchema = {
    '@context': 'https://schema.org',
    '@type': 'DataCenter',
    name: 'Harch Intelligence AI Data Center Morocco',
    description: "Africa's first sovereign AI data center with 1,798 carbon-optimized GPUs across 5 Moroccan hubs. 500MW pipeline including Dakhla and Nouaceur facilities.",
    url: 'https://www.harchcorp.com/intelligence',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Casablanca',
      addressRegion: 'Casablanca-Settat',
      addressCountry: 'MA',
    },
    areaServed: [
      { '@type': 'Country', name: 'Morocco' },
      { '@type': 'Place', name: 'Africa' },
    ],
    provider: {
      '@type': 'Organization',
      name: 'Harch Corp',
      url: 'https://www.harchcorp.com',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'GPU Cloud Services',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Carbon-Aware GPU Cloud', description: '1,798 GPUs at 48.2 gCO2/kWh' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Sovereign AI Compute', description: 'Data-sovereign AI infrastructure' } },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json" async={true}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json" async={true}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(dataCenterSchema) }}
      />
      <HomePageClient />
    </>
  );
}
