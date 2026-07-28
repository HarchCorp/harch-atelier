import { Metadata } from 'next';
import StatusPageClient from './StatusPageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'System Status  | Harch Corp',
  description: 'Real-time system status and uptime monitoring for all Harch Corp services including HarchOS, SENSE, THINK, ACT, and Developer Portal.',
  alternates: {
    canonical: 'https://www.harchcorp.com/status',
    languages: {
      en: 'https://www.harchcorp.com/status',
      fr: 'https://www.harchcorp.com/fr/statut',
      'x-default': 'https://www.harchcorp.com/status',
    },
  },
};

export default function StatusPage() {
  return <StatusPageClient />;
}
