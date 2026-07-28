import { Metadata } from 'next';
import StartupProgramPageClient from './StartupProgramPageClient';

export const metadata: Metadata = {
  title: 'Startup Program',
  description: 'Empowering African startups with $50,000 in HarchOS credits, technical mentorship, and go-to-market support. Build on sovereign infrastructure.',
  alternates: {
    canonical: 'https://www.harchcorp.com/startup-program',
    languages: {
      en: 'https://www.harchcorp.com/startup-program',
      fr: 'https://www.harchcorp.com/fr/programme-startup',
      'x-default': 'https://www.harchcorp.com/startup-program',
    },
  },
  openGraph: {
    title: 'Startup Program',
    description: 'Empowering African startups with $50,000 in HarchOS credits, technical mentorship, and go-to-market support. Build on sovereign infrastructure.',
    url: 'https://www.harchcorp.com/startup-program',
    siteName: 'Harch Corp',
    type: 'website',
    images: [
      {
        url: '/images/og-harch-corp.png',
        width: 1200,
        height: 630,
        alt: 'Startup Program | Harch Corp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Startup Program',
    description: 'Empowering African startups with $50,000 in HarchOS credits, technical mentorship, and go-to-market support. Build on sovereign infrastructure.',
    images: ['/images/og-harch-corp.png'],
  },
};

export default function StartupProgramPage() {
  return <StartupProgramPageClient />;
}
