import { Metadata } from 'next';
import GDPRPageClient from './GDPRPageClient';

export const metadata: Metadata = {
  title: 'GDPR Compliance',
  description: 'Harch Corp\'s commitment to GDPR compliance and the protection of personal data for EU data subjects.',
  alternates: {
    canonical: 'https://www.harchcorp.com/legal/gdpr',
    languages: {
      en: 'https://www.harchcorp.com/legal/gdpr',
      fr: 'https://www.harchcorp.com/fr/juridique/rgpd',
      'x-default': 'https://www.harchcorp.com/legal/gdpr',
    },
  },
};

export default function GDPRPage() {
  return <GDPRPageClient />;
}
