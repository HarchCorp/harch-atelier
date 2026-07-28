import { Metadata } from 'next';
import StrategyPageClient from './StrategyPageClient';

export const metadata: Metadata = {
  title: 'Strategy — Vertically Integrated Value Capture',
  description:
    "Harch Corp's integrated strategy captures the full value chain across data centers, energy, cement, technology, mining, agriculture, and water. Vertical integration from raw materials to sovereign platforms.",
  keywords: [
    'Harch Corp strategy',
    'vertical integration Africa',
    'industrial value chain',
    'sovereign infrastructure strategy',
    'conglomerate strategy',
    'Africa industrial strategy',
  ],
  alternates: {
    canonical: 'https://www.harchcorp.com/strategy',
    languages: {
      en: 'https://www.harchcorp.com/strategy',
      fr: 'https://www.harchcorp.com/fr/strategie',
      'x-default': 'https://www.harchcorp.com/strategy',
    },
  },
  openGraph: {
    title: 'Strategy — Vertically Integrated Value Capture',
    description:
      'Full value chain integration across data centers, energy, cement, technology, mining, agriculture, and water infrastructure.',
    url: 'https://www.harchcorp.com/strategy',
    siteName: 'Harch Corp',
    type: 'website',
    images: [
      {
        url: '/images/og-harch-corp.png',
        width: 1200,
        height: 630,
        alt: 'Harch Corp Strategy — Vertically Integrated Value Capture',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Strategy — Vertically Integrated Value Capture',
    description: 'Full value chain integration across 8 industrial verticals. From raw materials to sovereign platforms.',
    images: ['/images/og-harch-corp.png'],
  },
};

export default function StrategyPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.harchcorp.com' },
      { '@type': 'ListItem', position: 2, name: 'Strategy', item: 'https://www.harchcorp.com/strategy' },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json" async={true}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <StrategyPageClient />
    </>
  );
}
