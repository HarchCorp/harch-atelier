import type { Metadata } from 'next';
import DocsPageClient from './DocsPageClient';

export const metadata: Metadata = {
  title: 'Documentation — HarchOS Platform Docs',
  description: 'Comprehensive documentation for HarchOS, the operating system for sovereign AI infrastructure. API reference, SDK guides, architecture, and quickstart tutorials.',
  keywords: [
    'HarchOS documentation',
    'API reference',
    'SDK installation',
    'sovereign AI platform',
    'SENSE THINK ACT',
    'distributed compute mesh',
    'developer docs',
  ],
  alternates: {
    canonical: 'https://www.harchcorp.com/docs',
    languages: {
      en: 'https://www.harchcorp.com/docs',
      fr: 'https://www.harchcorp.com/fr/docs',
      'x-default': 'https://www.harchcorp.com/docs',
    },
  },
  openGraph: {
    title: 'Documentation — HarchOS Platform Docs',
    description: 'Everything you need to build on HarchOS. API reference, SDKs, architecture guides, and quickstart tutorials for sovereign AI infrastructure.',
    url: 'https://www.harchcorp.com/docs',
    siteName: 'Harch Corp',
    type: 'website',
  },
};

export default function DocsPage() {
  return <DocsPageClient />;
}
