import { Metadata } from 'next';
import SupportPageClient from './SupportPageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Support Hub  | Harch Corp',
  description: 'Harch Corp support hub: choose your support tier, browse the knowledge base, submit tickets, and access customer success resources.',
  alternates: {
    canonical: 'https://www.harchcorp.com/support',
    languages: {
      en: 'https://www.harchcorp.com/support',
      fr: 'https://www.harchcorp.com/fr/support',
      'x-default': 'https://www.harchcorp.com/support',
    },
  },
};

export default function SupportPage() {
  return <SupportPageClient />;
}
