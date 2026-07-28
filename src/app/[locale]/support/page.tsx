import { Metadata } from 'next';
import SupportPageClient from './SupportPageClient';

export const metadata: Metadata = {
  title: 'Support Hub',
  description: 'Harch Corp support hub: choose your support tier, browse the knowledge base, submit tickets, and access customer success resources.',
  alternates: {
    canonical: 'https://www.harchcorp.com/support',
    languages: {
      en: 'https://www.harchcorp.com/support',
      fr: 'https://www.harchcorp.com/fr/support',
      'x-default': 'https://www.harchcorp.com/support',
    },
  },
  openGraph: {
    title: 'Support Hub',
    description: 'Harch Corp support hub: choose your support tier, browse the knowledge base, submit tickets, and access customer success resources.',
    url: 'https://www.harchcorp.com/support',
    siteName: 'Harch Corp',
    type: 'website',
    images: [
      {
        url: '/images/og-harch-corp.png',
        width: 1200,
        height: 630,
        alt: 'Support Hub | Harch Corp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Support Hub',
    description: 'Harch Corp support hub: choose your support tier, browse the knowledge base, submit tickets, and access customer success resources.',
    images: ['/images/og-harch-corp.png'],
  },
};

export default function SupportPage() {
  return <SupportPageClient />;
}
