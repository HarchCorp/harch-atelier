import { Metadata } from 'next';
import CareersPageClient from './CareersPageClient';

export const metadata: Metadata = {
  title: 'Careers — Build Africa\'s Industrial Future',
  description:
    "Join Harch Corp and build Africa's industrial future. Career opportunities across AI infrastructure, renewable energy, cement, technology, mining, agriculture, water, and finance verticals.",
  keywords: [
    'Harch Corp careers',
    'jobs at Harch Corp',
    'Africa tech jobs',
    'AI infrastructure careers',
    'renewable energy jobs Morocco',
    'sovereign infrastructure careers',
    'Casablanca jobs',
    'data center careers Africa',
  ],
  alternates: {
    canonical: 'https://www.harchcorp.com/careers',
    languages: {
      en: 'https://www.harchcorp.com/careers',
      fr: 'https://www.harchcorp.com/fr/carrieres',
      'x-default': 'https://www.harchcorp.com/careers',
    },
  },
  openGraph: {
    title: 'Careers — Build Africa\'s Industrial Future',
    description:
      "Join Harch Corp and build Africa's industrial sovereignty. Opportunities across AI, energy, cement, technology, mining, agriculture, water, and finance.",
    url: 'https://www.harchcorp.com/careers',
    siteName: 'Harch Corp',
    type: 'website',
    images: [
      {
        url: '/images/og-harch-corp.png',
        width: 1200,
        height: 630,
        alt: 'Careers at Harch Corp — Build Africa\'s Industrial Future',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Careers — Build Africa\'s Industrial Future',
    description: "Join Harch Corp. Opportunities across AI, energy, cement, technology, mining, agriculture, water, and finance.",
    images: ['/images/og-harch-corp.png'],
  },
};

export default function CareersPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.harchcorp.com' },
      { '@type': 'ListItem', position: 2, name: 'Careers', item: 'https://www.harchcorp.com/careers' },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json" async={true}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <CareersPageClient />
    </>
  );
}
