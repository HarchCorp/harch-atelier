import type { Metadata } from 'next';
import GuidesPageClient from './GuidesPageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'How-to Guides — HarchOS',
  description: 'Step-by-step guides for HarchOS platform. Deploy models, set up data pipelines, configure monitoring, manage security, and more.',
  keywords: [
    'HarchOS guides',
    'how-to guides',
    'deploy AI model',
    'data pipeline',
    'monitoring',
    'security configuration',
  ],
  openGraph: {
    title: 'How-to Guides — HarchOS',
    description: 'Step-by-step guides for building on HarchOS. From deploying your first model to configuring enterprise security.',
    url: 'https://www.harchcorp.com/docs/guides',
    siteName: 'Harch Corp',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.harchcorp.com/docs/guides',
    languages: {
      en: 'https://www.harchcorp.com/docs/guides',
      fr: 'https://www.harchcorp.com/fr/docs/guides',
      'x-default': 'https://www.harchcorp.com/docs/guides',
    },
  },
};

export default function GuidesPage() {
  return <GuidesPageClient />;
}
