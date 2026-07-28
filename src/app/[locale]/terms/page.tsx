import { Metadata } from 'next';
import TermsPageClient from './TermsPageClient';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service and usage conditions for Harch Corp.',
  alternates: {
    canonical: 'https://www.harchcorp.com/terms',
    languages: {
      en: 'https://www.harchcorp.com/terms',
      fr: 'https://www.harchcorp.com/fr/conditions',
      'x-default': 'https://www.harchcorp.com/terms',
    },
  },
};

export default function TermsPage() {
  return <TermsPageClient />;
}
