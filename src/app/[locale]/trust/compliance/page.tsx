import { Metadata } from 'next';
import CompliancePageClient from './CompliancePageClient';

export const metadata: Metadata = {
  title: 'Compliance — Trust Center',
  description: "Harch Corp compliance certifications and audit reports: SOC 2 Type II, ISO 27001, GDPR, Moroccan DPA, and more. Download DPAs and compliance documentation.",
  alternates: {
    canonical: 'https://www.harchcorp.com/trust/compliance',
    languages: {
      en: 'https://www.harchcorp.com/trust/compliance',
      fr: 'https://www.harchcorp.com/fr/confiance/conformite',
      'x-default': 'https://www.harchcorp.com/trust/compliance',
    },
  },
  openGraph: {
    title: 'Compliance — Trust Center',
    description: "Harch Corp compliance certifications and audit reports: SOC 2 Type II, ISO 27001, GDPR, Moroccan DPA, and more. Download DPAs and compliance documentation.",
    url: 'https://www.harchcorp.com/trust/compliance',
    siteName: 'Harch Corp',
    type: 'website',
    images: [
      {
        url: '/images/og-harch-corp.png',
        width: 1200,
        height: 630,
        alt: 'Compliance — Trust Center | Harch Corp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compliance — Trust Center',
    description: "Harch Corp compliance certifications and audit reports: SOC 2 Type II, ISO 27001, GDPR, Moroccan DPA, and more. Download DPAs and compliance documentation.",
    images: ['/images/og-harch-corp.png'],
  },
};

export default function CompliancePage() {
  return <CompliancePageClient />;
}
