import { Metadata } from 'next';
import NewsroomPageClient from './NewsroomPageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Newsroom  | Harch Corp',
  description: "Latest news, press releases, and announcements from Harch Corp — Africa's multi-sector industrial conglomerate building sovereign infrastructure across 7 verticals.",
  alternates: {
    canonical: 'https://www.harchcorp.com/newsroom',
    languages: {
      en: 'https://www.harchcorp.com/newsroom',
      fr: 'https://www.harchcorp.com/fr/espace-presse',
      'x-default': 'https://www.harchcorp.com/newsroom',
    },
  },
};

export default function NewsroomPage() {
  return <NewsroomPageClient />;
}
