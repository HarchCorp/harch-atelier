import type { Metadata } from 'next';
import IntelligencePageClient from './IntelligencePageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Harch Intelligence — Sovereign AI Infrastructure',
  description:
    "Harch Intelligence builds Africa's sovereign AI compute infrastructure: 1,798 carbon-optimized GPUs across 5 Moroccan hubs at 48.2 gCO2/kWh. Carbon-aware scheduling, 500MW pipeline, submarine cable connectivity.",
  keywords: [
    'Harch Intelligence',
    'sovereign AI Africa',
    'GPU cloud Morocco',
    'carbon-aware GPU scheduling',
    'AI data center Africa',
    'green GPU cloud',
    'low carbon compute',
    'HarchOS',
    'AI infrastructure Morocco',
    'data center Casablanca',
  ],
  alternates: {
    canonical: 'https://www.harchcorp.com/intelligence',
    languages: {
      en: 'https://www.harchcorp.com/intelligence',
      fr: 'https://www.harchcorp.com/fr/intelligence',
      'x-default': 'https://www.harchcorp.com/intelligence',
    },
  },
  openGraph: {
    title: 'Harch Intelligence — Sovereign AI Infrastructure',
    description:
      "1,798 carbon-optimized GPUs across 5 Moroccan hubs at 48.2 gCO2/kWh — 89% below industry average. Sovereign AI compute for Africa.",
    url: 'https://www.harchcorp.com/intelligence',
    siteName: 'Harch Corp',
    type: 'website',
    images: [
      {
        url: '/images/og-harch-corp.png',
        width: 1200,
        height: 630,
        alt: 'Harch Intelligence — Sovereign AI Infrastructure',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Harch Intelligence — Sovereign AI Infrastructure',
    description: '1,798 carbon-optimized GPUs at 48.2 gCO2/kWh. 89% below industry average. Sovereign AI compute for Africa.',
    images: ['/images/og-harch-corp.png'],
  },
};

export default function IntelligencePage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.harchcorp.com' },
      { '@type': 'ListItem', position: 2, name: 'Intelligence', item: 'https://www.harchcorp.com/intelligence' },
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
