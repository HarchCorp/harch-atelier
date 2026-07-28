import { Metadata } from 'next';
import DeiPageClient from './DeiPageClient';

export const metadata: Metadata = {
  title: 'Diversity, Equity & Inclusion',
  description: 'Our commitment to building a diverse, equitable, and inclusive workplace that reflects the communities we serve across Africa.',
  alternates: {
    canonical: 'https://www.harchcorp.com/company/dei',
    languages: {
      en: 'https://www.harchcorp.com/company/dei',
      fr: 'https://www.harchcorp.com/fr/entreprise/diversite',
      'x-default': 'https://www.harchcorp.com/company/dei',
    },
  },
  openGraph: {
    title: 'Diversity, Equity & Inclusion',
    description: 'Our commitment to building a diverse, equitable, and inclusive workplace that reflects the communities we serve across Africa.',
    url: 'https://www.harchcorp.com/company/dei',
    siteName: 'Harch Corp',
    type: 'website',
    images: [
      {
        url: '/images/og-harch-corp.png',
        width: 1200,
        height: 630,
        alt: 'Diversity, Equity & Inclusion | Harch Corp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Diversity, Equity & Inclusion',
    description: 'Our commitment to building a diverse, equitable, and inclusive workplace that reflects the communities we serve across Africa.',
    images: ['/images/og-harch-corp.png'],
  },
};

export default function DeiPage() {
  return <DeiPageClient />;
}
