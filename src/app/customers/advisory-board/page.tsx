import { Metadata } from 'next';
import AdvisoryBoardPageClient from './AdvisoryBoardPageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Customer Advisory Board  | Harch Corp',
  description: 'Harch Corp Customer Advisory Board — co-creating the future of African industrial technology with our most strategic customers.',
  alternates: {
    canonical: 'https://www.harchcorp.com/customers/advisory-board',
    languages: {
      en: 'https://www.harchcorp.com/customers/advisory-board',
      fr: 'https://www.harchcorp.com/fr/clients/advisory-board',
      'x-default': 'https://www.harchcorp.com/customers/advisory-board',
    },
  },
};

export default function AdvisoryBoardPage() {
  return <AdvisoryBoardPageClient />;
}
