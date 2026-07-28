import { Metadata } from 'next';
import CaseStudiesPageClient from './CaseStudiesPageClient';

export const metadata: Metadata = {
  title: 'Case Studies — Proof of Impact',
  description:
    'Verified results across industrial, government, and infrastructure deployments in Africa. Predictive maintenance, sovereign data, smart grid, and port orchestration case studies.',
  keywords: [
    'Harch Corp case studies',
    'industrial AI case studies',
    'predictive maintenance results',
    'sovereign infrastructure deployments',
    'smart grid optimization Africa',
    'AI infrastructure impact',
    'Africa industrial results',
  ],
  alternates: {
    canonical: 'https://www.harchcorp.com/case-studies',
    languages: {
      en: 'https://www.harchcorp.com/case-studies',
      fr: 'https://www.harchcorp.com/fr/etudes-de-cas',
      'x-default': 'https://www.harchcorp.com/case-studies',
    },
  },
  openGraph: {
    title: 'Case Studies | Harch Corp Proof of Impact',
    description:
      'Verified results across industrial, government, and infrastructure deployments in Africa. See how Harch Corp delivers measurable outcomes.',
    url: 'https://www.harchcorp.com/case-studies',
    siteName: 'Harch Corp',
    type: 'website',
    images: [
      {
        url: '/images/og-harch-corp.png',
        width: 1200,
        height: 630,
        alt: 'Harch Corp Case Studies — Proof of Impact',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Case Studies | Harch Corp Proof of Impact',
    description: 'Verified results across industrial, government, and infrastructure deployments in Africa.',
    images: ['/images/og-harch-corp.png'],
  },
};

export default function CaseStudiesPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.harchcorp.com' },
      { '@type': 'ListItem', position: 2, name: 'Case Studies', item: 'https://www.harchcorp.com/case-studies' },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json" async={true}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <CaseStudiesPageClient />
    </>
  );
}
