import { Metadata } from 'next';
import LegalHubPageClient from './LegalHubPageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Legal Hub  | Harch Corp',
  description: 'Complete index of all Harch Corp legal documents, policies, and compliance information.',
  alternates: {
    canonical: 'https://www.harchcorp.com/legal/hub',
    languages: {
      en: 'https://www.harchcorp.com/legal/hub',
      fr: 'https://www.harchcorp.com/fr/juridique/hub',
      'x-default': 'https://www.harchcorp.com/legal/hub',
    },
  },
};

export default function LegalHubPage() {
  return <LegalHubPageClient />;
}
