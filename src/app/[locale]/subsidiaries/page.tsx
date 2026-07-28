import { Metadata } from 'next';
import SubsidiariesPageClient from './SubsidiariesPageClient';

export const metadata: Metadata = {
  title: 'Subsidiaries — 8 Industrial Verticals',
  description:
    "Explore Harch Corp's 8 industrial verticals — AI data centers, renewable energy, cement, technology, mining, agriculture, water, and finance. Each vertical builds sovereign infrastructure for Africa.",
  keywords: [
    'Harch Corp subsidiaries',
    'Harch Intelligence',
    'Harch Energy',
    'Harch Cement',
    'Harch Technology',
    'Harch Mining',
    'Harch Agri',
    'Harch Water',
    'Harch Finance',
    'industrial verticals Africa',
  ],
  alternates: {
    canonical: 'https://www.harchcorp.com/subsidiaries',
    languages: {
      en: 'https://www.harchcorp.com/subsidiaries',
      fr: 'https://www.harchcorp.com/fr/filiales',
      'x-default': 'https://www.harchcorp.com/subsidiaries',
    },
  },
  openGraph: {
    title: 'Subsidiaries — 8 Industrial Verticals',
    description:
      'From AI compute to renewable energy, cement to agriculture — every vertical is vertically integrated and built for scale across Africa.',
    url: 'https://www.harchcorp.com/subsidiaries',
    siteName: 'Harch Corp',
    type: 'website',
    images: [
      {
        url: '/images/og-harch-corp.png',
        width: 1200,
        height: 630,
        alt: 'Harch Corp Subsidiaries — 8 Industrial Verticals',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Subsidiaries — 8 Industrial Verticals',
    description: 'AI compute, renewable energy, cement, technology, mining, agriculture, water, and finance. Vertically integrated for sovereign scale.',
    images: ['/images/og-harch-corp.png'],
  },
};

export default function SubsidiariesPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.harchcorp.com' },
      { '@type': 'ListItem', position: 2, name: 'Subsidiaries', item: 'https://www.harchcorp.com/subsidiaries' },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json" async={true}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <SubsidiariesPageClient />
    </>
  );
}
