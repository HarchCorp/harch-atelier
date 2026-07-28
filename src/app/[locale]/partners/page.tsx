import { Metadata } from 'next';
import PartnersPageClient from './PartnersPageClient';

export const metadata: Metadata = {
  title: 'Partners',
  description: 'Harch Corp partner ecosystem: technology providers, financial institutions, and government agencies building Africa\'s industrial future.',
  alternates: {
    canonical: 'https://www.harchcorp.com/partners',
    languages: {
      en: 'https://www.harchcorp.com/partners',
      fr: 'https://www.harchcorp.com/fr/partenaires',
      'x-default': 'https://www.harchcorp.com/partners',
    },
  },
  openGraph: {
    title: 'Partners',
    description: 'Harch Corp partner ecosystem: technology providers, financial institutions, and government agencies building Africa\'s industrial future.',
    url: 'https://www.harchcorp.com/partners',
    siteName: 'Harch Corp',
    type: 'website',
    images: [
      {
        url: '/images/og-harch-corp.png',
        width: 1200,
        height: 630,
        alt: 'Partners | Harch Corp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Partners',
    description: 'Harch Corp partner ecosystem: technology providers, financial institutions, and government agencies building Africa\'s industrial future.',
    images: ['/images/og-harch-corp.png'],
  },
};

export default function PartnersPage() {
  return <PartnersPageClient />;
}
