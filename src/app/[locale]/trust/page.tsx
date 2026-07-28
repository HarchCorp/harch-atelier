import { Metadata } from 'next';
import TrustPageClient from './TrustPageClient';

export const metadata: Metadata = {
  title: 'Trust Center',
  description: "Harch Corp's Trust Center: Security, compliance, and transparency. SOC 2 Type II, ISO 27001, GDPR compliant. Building trust through sovereign infrastructure.",
  alternates: {
    canonical: 'https://www.harchcorp.com/trust',
    languages: {
      en: 'https://www.harchcorp.com/trust',
      fr: 'https://www.harchcorp.com/fr/confiance',
      'x-default': 'https://www.harchcorp.com/trust',
    },
  },
  openGraph: {
    title: 'Trust Center',
    description: "Harch Corp's Trust Center: Security, compliance, and transparency. SOC 2 Type II, ISO 27001, GDPR compliant. Building trust through sovereign infrastructure.",
    url: 'https://www.harchcorp.com/trust',
    siteName: 'Harch Corp',
    type: 'website',
    images: [
      {
        url: '/images/og-harch-corp.png',
        width: 1200,
        height: 630,
        alt: 'Trust Center | Harch Corp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trust Center',
    description: "Harch Corp's Trust Center: Security, compliance, and transparency. SOC 2 Type II, ISO 27001, GDPR compliant. Building trust through sovereign infrastructure.",
    images: ['/images/og-harch-corp.png'],
  },
};

export default function TrustPage() {
  return <TrustPageClient />;
}
