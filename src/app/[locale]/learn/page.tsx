import { Metadata } from 'next';
import LearnPageClient from './LearnPageClient';

export const metadata: Metadata = {
  title: 'Learn',
  description: 'Master HarchOS and sovereign AI infrastructure. Training paths, certifications, and hands-on labs for developers, architects, and engineers building Africa\'s digital backbone.',
  alternates: {
    canonical: 'https://www.harchcorp.com/learn',
    languages: {
      en: 'https://www.harchcorp.com/learn',
      fr: 'https://www.harchcorp.com/fr/apprendre',
      'x-default': 'https://www.harchcorp.com/learn',
    },
  },
};

export default function LearnPage() {
  return <LearnPageClient />;
}
