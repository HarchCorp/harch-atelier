import type { Metadata } from 'next';
import DevelopersPageClient from './DevelopersPageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Developer Center — Build on HarchOS',
  description: 'Everything you need to build on HarchOS. SDKs, CLI tools, API playground, and comprehensive documentation for sovereign AI infrastructure.',
  keywords: [
    'HarchOS developer center',
    'HarchOS SDK',
    'HarchOS API',
    'HarchOS CLI',
    'sovereign AI development',
    'GPU cloud API',
    'AI infrastructure SDK',
  ],
  openGraph: {
    title: 'Developer Center — Build on HarchOS',
    description: 'SDKs, CLI tools, API playground, and documentation for building on sovereign AI infrastructure.',
    url: 'https://www.harchcorp.com/developers',
    siteName: 'Harch Corp',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Developer Center — Build on HarchOS',
    description: 'SDKs, CLI tools, API playground, and documentation for building on sovereign AI infrastructure.',
  },
  alternates: {
    canonical: 'https://www.harchcorp.com/developers',
    languages: {
      en: 'https://www.harchcorp.com/developers',
      fr: 'https://www.harchcorp.com/fr/developpeurs',
      'x-default': 'https://www.harchcorp.com/developers',
    },
  },
};

export default function DevelopersPage() {
  return <DevelopersPageClient />;
}
