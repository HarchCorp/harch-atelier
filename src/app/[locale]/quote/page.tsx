import { Metadata } from 'next';
import QuotePageClient from './QuotePageClient';

export const metadata: Metadata = {
  title: 'Request a Quote',
  description:
    'Request a quote from Harch Corp across 8 verticals — Intelligence, Cement, Energy, Technology, Mining, Agriculture, Water, Finance. Africa\'s Sovereign Infrastructure OS.',
  keywords: [
    'Harch Corp quote',
    'infrastructure quote Morocco',
    'energy project quote Africa',
    'cement plant quote',
    'AI GPU data center quote',
    'mining concession quote',
    'agriculture technology quote',
    'water desalination quote',
    'finance infrastructure quote',
    'sovereign infrastructure proposal',
  ],
  alternates: {
    canonical: 'https://www.harchcorp.com/quote',
    languages: {
      en: 'https://www.harchcorp.com/quote',
      fr: 'https://www.harchcorp.com/fr/devis',
      'x-default': 'https://www.harchcorp.com/quote',
    },
  },
  openGraph: {
    title: 'Request a Quote',
    description:
      'Get a customized proposal from Harch Corp. Select your vertical and tell us about your project. 8 verticals, 5 countries, $2.37B pipeline.',
    url: 'https://www.harchcorp.com/quote',
    siteName: 'Harch Corp',
    type: 'website',
    images: [
      {
        url: '/images/og-harch-corp.png',
        width: 1200,
        height: 630,
        alt: 'Request a Quote | Harch Corp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Request a Quote',
    description: 'Get a customized proposal across 8 verticals. Intelligence, Energy, Cement, Mining, Agriculture, Water, Finance, Technology.',
    images: ['/images/og-harch-corp.png'],
  },
};

export default function QuotePage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.harchcorp.com' },
      { '@type': 'ListItem', position: 2, name: 'Request a Quote', item: 'https://www.harchcorp.com/quote' },
    ],
  };

  const contactPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Request a Quote - Harch Corp',
    description: 'Request a customized infrastructure proposal from Harch Corp across 8 verticals in Africa.',
    url: 'https://www.harchcorp.com/quote',
    mainEntity: {
      '@type': 'Organization',
      name: 'Harch Corp',
      url: 'https://www.harchcorp.com',
    },
  };

  return (
    <>
      <script
        type="application/ld+json" async={true}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json" async={true}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }}
      />
      <QuotePageClient />
    </>
  );
}
