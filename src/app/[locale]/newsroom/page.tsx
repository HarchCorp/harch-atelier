import { Metadata } from 'next';
import NewsroomPageClient from './NewsroomPageClient';

export const metadata: Metadata = {
  title: 'Newsroom',
  description: "Latest news, press releases, and announcements from Harch Corp — Africa's multi-sector industrial conglomerate building sovereign infrastructure across 7 verticals.",
  alternates: {
    canonical: 'https://www.harchcorp.com/newsroom',
    languages: {
      en: 'https://www.harchcorp.com/newsroom',
      fr: 'https://www.harchcorp.com/fr/actualites',
      'x-default': 'https://www.harchcorp.com/newsroom',
    },
  },
  openGraph: {
    title: 'Newsroom',
    description: "Latest news, press releases, and announcements from Harch Corp — Africa's multi-sector industrial conglomerate building sovereign infrastructure across 7 verticals.",
    url: 'https://www.harchcorp.com/newsroom',
    siteName: 'Harch Corp',
    type: 'website',
    images: [
      {
        url: '/images/og-harch-corp.png',
        width: 1200,
        height: 630,
        alt: 'Newsroom | Harch Corp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Newsroom',
    description: "Latest news, press releases, and announcements from Harch Corp — Africa's multi-sector industrial conglomerate building sovereign infrastructure across 7 verticals.",
    images: ['/images/og-harch-corp.png'],
  },
};

export default function NewsroomPage() {
  return <NewsroomPageClient />;
}
