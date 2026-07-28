import { Metadata } from 'next';
import LeadershipPageClient from './LeadershipPageClient';

export const metadata: Metadata = {
  title: 'Leadership',
  description: 'Meet the leadership team driving Harch Corp\'s mission to build Africa\'s sovereign industrial backbone across 7 verticals and 5 countries.',
  alternates: {
    canonical: 'https://www.harchcorp.com/company/leadership',
    languages: {
      en: 'https://www.harchcorp.com/company/leadership',
      fr: 'https://www.harchcorp.com/fr/entreprise/direction',
      'x-default': 'https://www.harchcorp.com/company/leadership',
    },
  },
  openGraph: {
    title: 'Leadership',
    description: 'Meet the leadership team driving Harch Corp\'s mission to build Africa\'s sovereign industrial backbone across 7 verticals and 5 countries.',
    url: 'https://www.harchcorp.com/company/leadership',
    siteName: 'Harch Corp',
    type: 'website',
    images: [
      {
        url: '/images/og-harch-corp.png',
        width: 1200,
        height: 630,
        alt: 'Leadership | Harch Corp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Leadership',
    description: 'Meet the leadership team driving Harch Corp\'s mission to build Africa\'s sovereign industrial backbone across 7 verticals and 5 countries.',
    images: ['/images/og-harch-corp.png'],
  },
};

export default function LeadershipPage() {
  return <LeadershipPageClient />;
}
