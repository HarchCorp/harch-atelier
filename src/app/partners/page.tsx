import { Metadata } from 'next';
import PartnersPageClient from './PartnersPageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Partners  | Harch Corp',
  description: 'Harch Corp partner ecosystem: technology providers, financial institutions, and government agencies building Africa\'s industrial future.',
  alternates: {
    canonical: 'https://www.harchcorp.com/partners',
    languages: {
      en: 'https://www.harchcorp.com/partners',
      fr: 'https://www.harchcorp.com/fr/partenaires',
      'x-default': 'https://www.harchcorp.com/partners',
    },
  },
};

export default function PartnersPage() {
  return <PartnersPageClient />;
}
