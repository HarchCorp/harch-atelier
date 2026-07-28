import { Metadata } from 'next';
import EngineeringBlogPageClient from './EngineeringBlogPageClient';

export const metadata: Metadata = {
  title: 'Engineering Blog',
  description: 'Technical deep-dives, architecture breakdowns, and engineering war stories from the teams building HarchOS, SENSE, and Africa\'s sovereign compute platform.',
  openGraph: {
    title: 'Engineering Blog',
    description: 'Technical deep-dives and architecture breakdowns from Harch Corp engineering.',
    url: 'https://www.harchcorp.com/engineering-blog',
  },
  alternates: {
    canonical: 'https://www.harchcorp.com/engineering-blog',
    languages: {
      en: 'https://www.harchcorp.com/engineering-blog',
      fr: 'https://www.harchcorp.com/fr/engineering-blog',
      'x-default': 'https://www.harchcorp.com/engineering-blog',
    },
  },
};

export default function EngineeringBlogPage() {
  return <EngineeringBlogPageClient />;
}
