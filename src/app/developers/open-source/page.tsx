import type { Metadata } from 'next';
import OpenSourcePageClient from './OpenSourcePageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Open Source at Harch',
  description: 'Harch Corp open source projects. SDKs, CLI tools, Terraform providers, and integrations — all Apache 2.0 licensed. Contribute to sovereign AI infrastructure.',
  keywords: [
    'Harch Corp open source',
    'HarchOS SDK open source',
    'HarchOS CLI',
    'sovereign AI open source',
    'GPU cloud SDK',
  ],
  openGraph: {
    title: 'Open Source at Harch',
    description: 'Our open source projects for sovereign AI infrastructure. Contribute, fork, or audit every line.',
    url: 'https://www.harchcorp.com/developers/open-source',
    siteName: 'Harch Corp',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Open Source at Harch',
    description: 'Our open source projects for sovereign AI infrastructure. Contribute, fork, or audit every line.',
  },
  alternates: {
    canonical: 'https://www.harchcorp.com/developers/open-source',
    languages: {
      en: 'https://www.harchcorp.com/developers/open-source',
      fr: 'https://www.harchcorp.com/fr/developpeurs/open-source',
      'x-default': 'https://www.harchcorp.com/developers/open-source',
    },
  },
};

export default function OpenSourcePage() {
  return <OpenSourcePageClient />;
}
