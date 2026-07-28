import { Metadata } from 'next';
import CookiesPageClient from './CookiesPageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Cookie Policy  | Harch Corp',
  description: 'Learn how Harch Corp uses cookies and similar technologies to improve your experience on our website.',
  alternates: {
    canonical: 'https://www.harchcorp.com/legal/cookies',
    languages: {
      en: 'https://www.harchcorp.com/legal/cookies',
      fr: 'https://www.harchcorp.com/fr/juridique/cookies',
      'x-default': 'https://www.harchcorp.com/legal/cookies',
    },
  },
};

export default function CookiesPage() {
  return <CookiesPageClient />;
}
