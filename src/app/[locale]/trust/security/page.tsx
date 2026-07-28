import { Metadata } from 'next';
import SecurityPageClient from './SecurityPageClient';

export const metadata: Metadata = {
  title: 'Security — Trust Center',
  description: "Harch Corp security architecture: infrastructure security, data protection, identity & access management, incident response, and security bulletins.",
  alternates: {
    canonical: 'https://www.harchcorp.com/trust/security',
    languages: {
      en: 'https://www.harchcorp.com/trust/security',
      fr: 'https://www.harchcorp.com/fr/confiance/securite',
      'x-default': 'https://www.harchcorp.com/trust/security',
    },
  },
  openGraph: {
    title: 'Security — Trust Center',
    description: "Harch Corp security architecture: infrastructure security, data protection, identity & access management, incident response, and security bulletins.",
    url: 'https://www.harchcorp.com/trust/security',
    siteName: 'Harch Corp',
    type: 'website',
    images: [
      {
        url: '/images/og-harch-corp.png',
        width: 1200,
        height: 630,
        alt: 'Security — Trust Center | Harch Corp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Security — Trust Center',
    description: "Harch Corp security architecture: infrastructure security, data protection, identity & access management, incident response, and security bulletins.",
    images: ['/images/og-harch-corp.png'],
  },
};

export default function SecurityPage() {
  return <SecurityPageClient />;
}
