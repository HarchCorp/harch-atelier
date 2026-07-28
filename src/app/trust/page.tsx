import { Metadata } from 'next';
import TrustPageClient from './TrustPageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Trust Center  | Harch Corp',
  description: "Harch Corp's Trust Center: Security, compliance, and transparency. SOC 2 Type II, ISO 27001, GDPR compliant. Building trust through sovereign infrastructure.",
  alternates: {
    canonical: 'https://www.harchcorp.com/trust',
    languages: {
      en: 'https://www.harchcorp.com/trust',
      fr: 'https://www.harchcorp.com/fr/confiance',
      'x-default': 'https://www.harchcorp.com/trust',
    },
  },
};

export default function TrustPage() {
  return <TrustPageClient />;
}
