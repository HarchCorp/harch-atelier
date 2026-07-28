import { Metadata } from 'next';
import CustomersPageClient from './CustomersPageClient';

export const metadata: Metadata = {
  title: 'Customer Stories',
  description: 'How African organizations are transforming with Harch Corp — case studies from finance, energy, agriculture, mining, water, and government sectors.',
  alternates: {
    canonical: 'https://www.harchcorp.com/customers',
    languages: {
      en: 'https://www.harchcorp.com/customers',
      fr: 'https://www.harchcorp.com/fr/clients',
      'x-default': 'https://www.harchcorp.com/customers',
    },
  },
  openGraph: {
    title: 'Customer Stories',
    description: 'How African organizations are transforming with Harch Corp — case studies from finance, energy, agriculture, mining, water, and government sectors.',
    url: 'https://www.harchcorp.com/customers',
    siteName: 'Harch Corp',
    type: 'website',
    images: [
      {
        url: '/images/og-harch-corp.png',
        width: 1200,
        height: 630,
        alt: 'Customer Stories | Harch Corp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Customer Stories',
    description: 'How African organizations are transforming with Harch Corp — case studies from finance, energy, agriculture, mining, water, and government sectors.',
    images: ['/images/og-harch-corp.png'],
  },
};

export default function CustomersPage() {
  return <CustomersPageClient />;
}
