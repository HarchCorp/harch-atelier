import { Metadata } from 'next';
import AIEthicsPageClient from './AIEthicsPageClient';

export const metadata: Metadata = {
  title: 'AI Ethics — Trust Center',
  description: "Harch Corp AI Ethics framework: fairness, transparency, accountability, and human oversight in artificial intelligence. Public AI ethics dashboard and review board.",
  alternates: {
    canonical: 'https://www.harchcorp.com/trust/ai-ethics',
    languages: {
      en: 'https://www.harchcorp.com/trust/ai-ethics',
      fr: 'https://www.harchcorp.com/fr/confiance/ai-ethics',
      'x-default': 'https://www.harchcorp.com/trust/ai-ethics',
    },
  },
  openGraph: {
    title: 'AI Ethics — Trust Center',
    description: "Harch Corp AI Ethics framework: fairness, transparency, accountability, and human oversight in artificial intelligence. Public AI ethics dashboard and review board.",
    url: 'https://www.harchcorp.com/trust/ai-ethics',
    siteName: 'Harch Corp',
    type: 'website',
    images: [
      {
        url: '/images/og-harch-corp.png',
        width: 1200,
        height: 630,
        alt: 'AI Ethics — Trust Center | Harch Corp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Ethics — Trust Center',
    description: "Harch Corp AI Ethics framework: fairness, transparency, accountability, and human oversight in artificial intelligence. Public AI ethics dashboard and review board.",
    images: ['/images/og-harch-corp.png'],
  },
};

export default function AIEthicsPage() {
  return <AIEthicsPageClient />;
}
