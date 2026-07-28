import { Metadata } from 'next';
import DeiPageClient from './DeiPageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Diversity, Equity & Inclusion  | Harch Corp',
  description: 'Our commitment to building a diverse, equitable, and inclusive workplace that reflects the communities we serve across Africa.',
  alternates: {
    canonical: 'https://www.harchcorp.com/company/dei',
    languages: {
      en: 'https://www.harchcorp.com/company/dei',
      fr: 'https://www.harchcorp.com/fr/entreprise/dei',
      'x-default': 'https://www.harchcorp.com/company/dei',
    },
  },
};

export default function DeiPage() {
  return <DeiPageClient />;
}
