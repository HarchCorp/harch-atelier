import { Metadata } from 'next';
import LegalPageClient from './LegalPageClient';

export const metadata: Metadata = {
  title: 'Legal',
  description: 'Access Harch Corp legal documents including terms of service, privacy policy, GDPR & CCPA compliance, SLA guarantees, and regulatory disclaimers.',
  alternates: {
    canonical: 'https://www.harchcorp.com/legal',
    languages: {
      en: 'https://www.harchcorp.com/legal',
      fr: 'https://www.harchcorp.com/fr/legal',
      'x-default': 'https://www.harchcorp.com/legal',
    },
  },
};

export default function LegalPage() {
  return <LegalPageClient />;
}
