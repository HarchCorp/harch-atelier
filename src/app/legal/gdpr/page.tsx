import { Metadata } from 'next';
import GDPRPageClient from './GDPRPageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'GDPR Compliance  | Harch Corp',
  description: 'Harch Corp\'s commitment to GDPR compliance and the protection of personal data for EU data subjects.',
  alternates: {
    canonical: 'https://www.harchcorp.com/legal/gdpr',
    languages: {
      en: 'https://www.harchcorp.com/legal/gdpr',
      fr: 'https://www.harchcorp.com/fr/juridique/gdpr',
      'x-default': 'https://www.harchcorp.com/legal/gdpr',
    },
  },
};

export default function GDPRPage() {
  return <GDPRPageClient />;
}
