import { Metadata } from 'next';
import PlatformPageClient from './PlatformPageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Platform — Live Infrastructure Monitoring',
  description:
    'Harch OS is software, not slides. Real-time command and control for sovereign AI infrastructure — 5 hubs, 1,798 GPUs, 2,847 sensors, all live across Morocco.',
  keywords: [
    'HarchOS',
    'infrastructure monitoring',
    'real-time ops center',
    'sovereign AI platform',
    'GPU cloud dashboard',
    'AI infrastructure monitoring',
    'live infrastructure',
  ],
  alternates: {
    canonical: 'https://www.harchcorp.com/platform',
    languages: {
      en: 'https://www.harchcorp.com/platform',
      fr: 'https://www.harchcorp.com/fr/plateforme',
      'x-default': 'https://www.harchcorp.com/platform',
    },
  },
  openGraph: {
    title: 'Harch OS Platform — Live Infrastructure Monitor',
    description:
      'Real-time command and control for sovereign AI infrastructure. 5 hubs, 1,798 GPUs, 2,847 sensors — all live.',
    url: 'https://www.harchcorp.com/platform',
    siteName: 'Harch Corp',
    type: 'website',
    images: [
      {
        url: '/images/og-harch-corp.png',
        width: 1200,
        height: 630,
        alt: 'Harch OS Platform — Live Infrastructure Monitor',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Harch OS Platform — Live Infrastructure Monitor',
    description: 'Real-time command & control for sovereign AI infrastructure. 5 hubs, 1,798 GPUs, 2,847 sensors — all live.',
    images: ['/images/og-harch-corp.png'],
  },
};

export default function PlatformPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.harchcorp.com' },
      { '@type': 'ListItem', position: 2, name: 'Platform', item: 'https://www.harchcorp.com/platform' },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json" async={true}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PlatformPageClient />
    </>
  );
}
