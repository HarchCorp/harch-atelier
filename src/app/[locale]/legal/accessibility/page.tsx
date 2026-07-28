import { Metadata } from 'next';
import AccessibilityPageClient from './AccessibilityPageClient';

export const metadata: Metadata = {
  title: 'Accessibility Statement',
  description: 'Harch Corp\'s commitment to digital accessibility and the standards we follow to ensure an inclusive experience.',
  alternates: {
    canonical: 'https://www.harchcorp.com/legal/accessibility',
    languages: {
      en: 'https://www.harchcorp.com/legal/accessibility',
      fr: 'https://www.harchcorp.com/fr/legal/accessibility',
      'x-default': 'https://www.harchcorp.com/legal/accessibility',
    },
  },
};

export default function AccessibilityPage() {
  return <AccessibilityPageClient />;
}
