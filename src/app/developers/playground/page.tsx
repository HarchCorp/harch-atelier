import type { Metadata } from 'next';
import PlaygroundPageClient from './PlaygroundPageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'API Playground — HarchOS',
  description: 'Interactive API playground for HarchOS. Test endpoints, build requests, explore responses, and generate code snippets in curl, Python, TypeScript, and Go.',
  keywords: [
    'HarchOS API playground',
    'API testing',
    'code generation',
    'API explorer',
    'sovereign AI API',
  ],
  openGraph: {
    title: 'API Playground — HarchOS',
    description: 'Interactive API playground. Test endpoints, build requests, and generate code snippets.',
    url: 'https://www.harchcorp.com/developers/playground',
    siteName: 'Harch Corp',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'API Playground — HarchOS',
    description: 'Interactive API playground. Test endpoints, build requests, and generate code snippets.',
  },
  alternates: {
    canonical: 'https://www.harchcorp.com/developers/playground',
    languages: {
      en: 'https://www.harchcorp.com/developers/playground',
      fr: 'https://www.harchcorp.com/fr/developpeurs/playground',
      'x-default': 'https://www.harchcorp.com/developers/playground',
    },
  },
};

export default function PlaygroundPage() {
  return <PlaygroundPageClient />;
}
