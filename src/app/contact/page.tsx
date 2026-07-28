import { Metadata } from 'next';
import ContactPageClient from './ContactPageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Request a Briefing  | Harch Corp',
  description:
    'Request a secure briefing with Harch Corp. Government, industrial, investor, and talent inquiry channels. All communications encrypted end-to-end on sovereign infrastructure.',
  keywords: [
    'contact Harch Corp',
    'secure briefing request',
    'investor inquiry',
    'government briefing',
    'sovereign infrastructure contact',
    'encrypted communication',
  ],
  alternates: {
    canonical: 'https://www.harchcorp.com/contact',
    languages: {
      en: 'https://www.harchcorp.com/contact',
      fr: 'https://www.harchcorp.com/fr/contact',
      'x-default': 'https://www.harchcorp.com/contact',
    },
  },
  openGraph: {
    title: 'Request a Briefing  | Harch Corp',
    description:
      'Request a secure briefing with Harch Corp. Government, industrial, investor, and talent channels. End-to-end encrypted on sovereign infrastructure.',
    url: 'https://www.harchcorp.com/contact',
    siteName: 'Harch Corp',
    type: 'website',
    images: [
      {
        url: '/images/og-harch-corp.png',
        width: 1200,
        height: 630,
        alt: 'Request a Briefing  | Harch Corp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Request a Briefing  | Harch Corp',
    description: 'Secure briefing requests for government, industrial, investor, and talent inquiries. End-to-end encrypted.',
    images: ['/images/og-harch-corp.png'],
  },
};

export default function ContactPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.harchcorp.com' },
      { '@type': 'ListItem', position: 2, name: 'Contact', item: 'https://www.harchcorp.com/contact' },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json" async={true}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ContactPageClient />
    </>
  );
}
