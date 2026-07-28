import { Metadata } from 'next';
import CompliancePageClient from './CompliancePageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Compliance — Trust Center  | Harch Corp',
  description: "Harch Corp compliance certifications and audit reports: SOC 2 Type II, ISO 27001, GDPR, Moroccan DPA, and more. Download DPAs and compliance documentation.",
  alternates: {
    canonical: 'https://www.harchcorp.com/trust/compliance',
    languages: {
      en: 'https://www.harchcorp.com/trust/compliance',
      fr: 'https://www.harchcorp.com/fr/confiance/compliance',
      'x-default': 'https://www.harchcorp.com/trust/compliance',
    },
  },
};

export default function CompliancePage() {
  return <CompliancePageClient />;
}
