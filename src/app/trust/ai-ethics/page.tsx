import { Metadata } from 'next';
import AIEthicsPageClient from './AIEthicsPageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'AI Ethics — Trust Center  | Harch Corp',
  description: "Harch Corp AI Ethics framework: fairness, transparency, accountability, and human oversight in artificial intelligence. Public AI ethics dashboard and review board.",
  alternates: {
    canonical: 'https://www.harchcorp.com/trust/ai-ethics',
    languages: {
      en: 'https://www.harchcorp.com/trust/ai-ethics',
      fr: 'https://www.harchcorp.com/fr/confiance/ai-ethics',
      'x-default': 'https://www.harchcorp.com/trust/ai-ethics',
    },
  },
};

export default function AIEthicsPage() {
  return <AIEthicsPageClient />;
}
