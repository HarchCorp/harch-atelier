import { Metadata } from 'next';
import ESGPageClient from './ESGPageClient';

export const metadata: Metadata = {
  title: 'ESG — Environmental, Social & Governance',
  description:
    "Harch Corp's ESG commitments: 100% renewable energy targets, community impact across 5 countries, and sustainable industrialization. Carbon-aware operations at 48.2 gCO2/kWh.",
  keywords: [
    'Harch Corp ESG',
    'sustainability Africa',
    'renewable energy commitment',
    'carbon-aware infrastructure',
    'sustainable industrialization',
    'ESG report Morocco',
    'green infrastructure Africa',
    'corporate responsibility',
  ],
  alternates: {
    canonical: 'https://www.harchcorp.com/esg',
    languages: {
      en: 'https://www.harchcorp.com/esg',
      fr: 'https://www.harchcorp.com/fr/esg',
      'x-default': 'https://www.harchcorp.com/esg',
    },
  },
  openGraph: {
    title: 'ESG — Environmental, Social & Governance',
    description:
      "100% renewable energy targets, community impact across 5 countries, and sustainable industrialization. Carbon-aware operations at 48.2 gCO2/kWh.",
    url: 'https://www.harchcorp.com/esg',
    siteName: 'Harch Corp',
    type: 'website',
    images: [
      {
        url: '/images/og-harch-corp.png',
        width: 1200,
        height: 630,
        alt: 'Harch Corp ESG — Environmental, Social & Governance',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ESG — Environmental, Social & Governance',
    description: '100% renewable energy, community impact, sustainable industrialization. Carbon-aware at 48.2 gCO2/kWh.',
    images: ['/images/og-harch-corp.png'],
  },
};

export default function ESGPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.harchcorp.com' },
      { '@type': 'ListItem', position: 2, name: 'ESG', item: 'https://www.harchcorp.com/esg' },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json" async={true}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ESGPageClient />
    </>
  );
}
