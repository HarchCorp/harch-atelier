import { Metadata } from 'next';
import GlossaryPageClient from './GlossaryPageClient';

export const metadata: Metadata = {
  title: 'Glossary: Sovereign AI, Carbon-Aware Computing & African Infrastructure Terms',
  description: 'Comprehensive glossary of infrastructure, AI, and energy terms — from sovereign AI and carbon-aware computing to green hydrogen, phosphate mining, water desalination, and Islamic finance. 50+ definitions for Africa\'s industrial transformation.',
  keywords: [
    'sovereign AI definition',
    'carbon-aware computing definition',
    'green hydrogen definition',
    'phosphate mining definition',
    'precision agriculture definition',
    'desalination definition',
    'Islamic finance definition',
    'sukuk definition',
    'submarine cable definition',
    'data center PUE definition',
    'GPU cloud glossary',
    'African infrastructure terms',
  ],
  alternates: {
    canonical: 'https://www.harchcorp.com/glossary',
    languages: {
      en: 'https://www.harchcorp.com/glossary',
      fr: 'https://www.harchcorp.com/fr/glossaire',
      'x-default': 'https://www.harchcorp.com/glossary',
    },
  },
  openGraph: {
    title: 'Glossary: Sovereign AI, Carbon-Aware Computing & African Infrastructure Terms',
    description: '50+ definitions for the terms, technologies, and concepts behind Africa\'s industrial sovereignty and sovereign infrastructure.',
    url: 'https://www.harchcorp.com/glossary',
  },
};

export default function GlossaryPage() {
  return <GlossaryPageClient />;
}
