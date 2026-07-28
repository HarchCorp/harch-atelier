import { Metadata } from 'next';
import BlogPageClient from './BlogPageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Blog  | Harch Corp',
  description: 'Engineering insights, thought leadership, and technical deep-dives from Harch Corp — building Africa\'s sovereign industrial infrastructure.',
  alternates: {
    canonical: 'https://www.harchcorp.com/blog',
    languages: {
      en: 'https://www.harchcorp.com/blog',
      fr: 'https://www.harchcorp.com/fr/blog',
      'x-default': 'https://www.harchcorp.com/blog',
    },
  },
  openGraph: {
    title: 'Blog  | Harch Corp',
    description: 'Engineering insights, thought leadership, and technical deep-dives from Harch Corp.',
    url: 'https://www.harchcorp.com/blog',
  },
};

export default function BlogPage() {
  return <BlogPageClient />;
}
