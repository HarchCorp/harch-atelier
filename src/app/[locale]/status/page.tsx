import { Metadata } from 'next';
import StatusPageClient from './StatusPageClient';

export const metadata: Metadata = {
  title: 'System Status',
  description: 'Real-time system status and uptime monitoring for all Harch Corp services including HarchOS, SENSE, THINK, ACT, and Developer Portal.',
  alternates: {
    canonical: 'https://www.harchcorp.com/status',
    languages: {
      en: 'https://www.harchcorp.com/status',
      fr: 'https://www.harchcorp.com/fr/statut',
      'x-default': 'https://www.harchcorp.com/status',
    },
  },
  openGraph: {
    title: 'System Status',
    description: 'Real-time system status and uptime monitoring for all Harch Corp services including HarchOS, SENSE, THINK, ACT, and Developer Portal.',
    url: 'https://www.harchcorp.com/status',
    siteName: 'Harch Corp',
    type: 'website',
    images: [
      {
        url: '/images/og-harch-corp.png',
        width: 1200,
        height: 630,
        alt: 'System Status | Harch Corp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'System Status',
    description: 'Real-time system status and uptime monitoring for all Harch Corp services including HarchOS, SENSE, THINK, ACT, and Developer Portal.',
    images: ['/images/og-harch-corp.png'],
  },
};

export default function StatusPage() {
  return <StatusPageClient />;
}
