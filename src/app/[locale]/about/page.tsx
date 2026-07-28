import { Metadata } from 'next';
import AboutPageClient from './AboutPageClient';

export const metadata: Metadata = {
  title: 'About Harch Corp — Our Mission',
  description:
    "Harch Corp builds Africa's industrial sovereignty through vertically integrated operations across 8 strategic verticals. Founded 2024, Casablanca, Morocco. $2.37B investment pipeline.",
  keywords: [
    'about Harch Corp',
    'Harch Corp mission',
    'Moroccan conglomerate',
    'Africa industrial sovereignty',
    'Harch Corp',
    'industrial conglomerate Africa',
    'Casablanca headquarters',
  ],
  alternates: {
    canonical: 'https://www.harchcorp.com/about',
    languages: {
      en: 'https://www.harchcorp.com/about',
      fr: 'https://www.harchcorp.com/fr/a-propos',
      'x-default': 'https://www.harchcorp.com/about',
    },
  },
  openGraph: {
    title: 'About Harch Corp — Our Mission',
    description:
      "Harch Corp builds Africa's industrial sovereignty through vertically integrated operations across 8 strategic verticals. $2.37B investment pipeline.",
    url: 'https://www.harchcorp.com/about',
    siteName: 'Harch Corp',
    type: 'website',
    images: [
      {
        url: '/images/og-harch-corp.png',
        width: 1200,
        height: 630,
        alt: 'About Harch Corp — Our Mission',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Harch Corp — Our Mission',
    description: "Building Africa's industrial sovereignty through 8 vertically integrated verticals. $2.37B pipeline, 5 countries.",
    images: ['/images/og-harch-corp.png'],
  },
};

export default function AboutPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.harchcorp.com' },
      { '@type': 'ListItem', position: 2, name: 'About', item: 'https://www.harchcorp.com/about' },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json" async={true}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <AboutPageClient />
    </>
  );
}
