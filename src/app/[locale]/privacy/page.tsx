import { Metadata } from 'next';
import PrivacyPageClient from './PrivacyPageClient';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Harch Corp privacy policy and data protection practices.',
  alternates: {
    canonical: 'https://www.harchcorp.com/privacy',
    languages: {
      en: 'https://www.harchcorp.com/privacy',
      fr: 'https://www.harchcorp.com/fr/confidentialite',
      'x-default': 'https://www.harchcorp.com/privacy',
    },
  },
};

export default function PrivacyPage() {
  return <PrivacyPageClient />;
}
