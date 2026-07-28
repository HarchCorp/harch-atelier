import { Metadata } from 'next';
import SecurityPageClient from './SecurityPageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Security — Trust Center  | Harch Corp',
  description: "Harch Corp security architecture: infrastructure security, data protection, identity & access management, incident response, and security bulletins.",
  alternates: {
    canonical: 'https://www.harchcorp.com/trust/security',
    languages: {
      en: 'https://www.harchcorp.com/trust/security',
      fr: 'https://www.harchcorp.com/fr/confiance/security',
      'x-default': 'https://www.harchcorp.com/trust/security',
    },
  },
};

export default function SecurityPage() {
  return <SecurityPageClient />;
}
