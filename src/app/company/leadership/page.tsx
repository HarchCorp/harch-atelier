import { Metadata } from 'next';
import LeadershipPageClient from './LeadershipPageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Leadership  | Harch Corp',
  description: 'Meet the leadership team driving Harch Corp\'s mission to build Africa\'s sovereign industrial backbone across 7 verticals and 5 countries.',
  alternates: {
    canonical: 'https://www.harchcorp.com/company/leadership',
    languages: {
      en: 'https://www.harchcorp.com/company/leadership',
      fr: 'https://www.harchcorp.com/fr/entreprise/leadership',
      'x-default': 'https://www.harchcorp.com/company/leadership',
    },
  },
};

export default function LeadershipPage() {
  return <LeadershipPageClient />;
}
