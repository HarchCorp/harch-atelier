import { Metadata } from 'next';
import ModernSlaveryPageClient from './ModernSlaveryPageClient';

export const metadata: Metadata = {
  title: 'Modern Slavery Statement',
  description: 'Harch Corp\'s statement on modern slavery, human trafficking, and forced labor in our operations and supply chain.',
  alternates: {
    canonical: 'https://www.harchcorp.com/legal/modern-slavery',
    languages: {
      en: 'https://www.harchcorp.com/legal/modern-slavery',
      fr: 'https://www.harchcorp.com/fr/legal/modern-slavery',
      'x-default': 'https://www.harchcorp.com/legal/modern-slavery',
    },
  },
};

export default function ModernSlaveryPage() {
  return <ModernSlaveryPageClient />;
}
