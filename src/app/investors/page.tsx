import { Metadata } from 'next';
import InvestorsPageClient from './InvestorsPageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Investor Relations  | Harch Corp',
  description:
    'Harch Corp is a privately held sovereign infrastructure company with a $2.37B investment pipeline across 8 verticals and 5 countries. Institutional investors may request a confidential briefing.',
  keywords: [
    'invest in Harch Corp',
    'Harch Corp investor relations',
    'sovereign infrastructure investment',
    'Africa infrastructure fund',
    'green bonds Africa',
    'institutional investment Morocco',
    'private infrastructure company',
  ],
  alternates: {
    canonical: 'https://www.harchcorp.com/investors',
    languages: {
      en: 'https://www.harchcorp.com/investors',
      fr: 'https://www.harchcorp.com/fr/investisseurs',
      'x-default': 'https://www.harchcorp.com/investors',
    },
  },
  openGraph: {
    title: 'Investor Relations  | Harch Corp',
    description:
      'Privately held sovereign infrastructure company. $2.37B investment pipeline across 8 verticals and 5 countries. Institutional briefing requests welcome.',
    url: 'https://www.harchcorp.com/investors',
    siteName: 'Harch Corp',
    type: 'website',
    images: [
      {
        url: '/images/og-harch-corp.png',
        width: 1200,
        height: 630,
        alt: 'Investor Relations  | Harch Corp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Investor Relations  | Harch Corp',
    description: 'Privately held sovereign infrastructure company. $2.37B pipeline, 8 verticals, 5 countries. Institutional briefing requests welcome.',
    images: ['/images/og-harch-corp.png'],
  },
};

export default function InvestorsPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.harchcorp.com' },
      { '@type': 'ListItem', position: 2, name: 'Investors', item: 'https://www.harchcorp.com/investors' },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json" async={true}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <InvestorsPageClient />
    </>
  );
}
