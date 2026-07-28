import { Metadata } from 'next';
import QuoteReceivedClient from './QuoteReceivedClient';

export const metadata: Metadata = {
  title: 'Quote Request Received',
  description:
    'Your quote request has been received. Our team will contact you within 24 hours through a secure channel. Harch Corp — Africa\'s Sovereign Infrastructure OS.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://www.harchcorp.com/quote/received',
    languages: {
      en: 'https://www.harchcorp.com/quote/received',
      fr: 'https://www.harchcorp.com/fr/devis/recu',
      'x-default': 'https://www.harchcorp.com/quote/received',
    },
  },
};

export default function QuoteReceivedPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.harchcorp.com' },
      { '@type': 'ListItem', position: 2, name: 'Contact', item: 'https://www.harchcorp.com/contact' },
      { '@type': 'ListItem', position: 3, name: 'Quote Received', item: 'https://www.harchcorp.com/quote/received' },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json" async={true}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <QuoteReceivedClient />
    </>
  );
}
