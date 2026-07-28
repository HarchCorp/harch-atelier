import { Metadata } from 'next';
import HomePageClient from './HomePageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Harch Corp — Africa's Industrial Sovereignty | $2.37B Investment Pipeline",
  description:
    "Harch Corp builds Africa's industrial sovereignty across 8 verticals — AI data centers, renewable energy, cement, technology, mining, agriculture, water, and finance. $2.37B pipeline, 5 countries.",
  keywords: [
    'Harch Corp',
    'Africa industrial sovereignty',
    'Moroccan conglomerate',
    'AI data center Morocco',
    'carbon-aware GPU cloud',
    'renewable energy Africa',
    'sovereign infrastructure',
    'industrial conglomerate Africa',
    'HarchCorp',
    'Harch Corp',
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
    title: "Harch Corp — Africa's Sovereign Infrastructure OS",
    description:
      "Moroccan industrial conglomerate building Africa's industrial sovereignty. $2.37B pipeline across 8 verticals. Carbon-Aware GPU Cloud, 2GW+ Renewable Energy, Cement, Mining, Agriculture, Water.",
    url: 'https://www.harchcorp.com',
    siteName: 'Harch Corp',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/images/og-harch-corp.png',
        width: 1200,
        height: 630,
        alt: "Harch Corp — Africa's Sovereign Infrastructure OS",
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Harch Corp — Africa's Sovereign Infrastructure OS",
    description:
      "Moroccan industrial conglomerate. $2.37B pipeline. Carbon-Aware GPU Cloud (1,798 GPUs target), 2GW+ Renewable Energy. 8 verticals, 5 countries.",
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

  return (
    <>
      <script
        type="application/ld+json" async={true}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <HomePageClient />
    </>
  );
}
