import { Metadata } from 'next';
import CCPAPageClient from './CCPAPageClient';

export const metadata: Metadata = {
  title: 'CCPA Compliance',
  description: 'Your rights under the California Consumer Privacy Act and how Harch Corp handles California residents\' personal information.',
  alternates: {
    canonical: 'https://www.harchcorp.com/legal/ccpa',
    languages: {
      en: 'https://www.harchcorp.com/legal/ccpa',
      fr: 'https://www.harchcorp.com/fr/legal/ccpa',
      'x-default': 'https://www.harchcorp.com/legal/ccpa',
    },
  },
};

export default function CCPAPage() {
  return <CCPAPageClient />;
}
