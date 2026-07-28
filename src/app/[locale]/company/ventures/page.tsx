import { Metadata } from 'next';
import VenturesPageClient from './VenturesPageClient';

export const metadata: Metadata = {
  title: 'Harch Ventures',
  description: 'Harch Ventures invests in startups building sovereign AI, clean energy, AgriTech, WaterTech, and MiningTech solutions across Africa. Pitch your startup.',
  alternates: {
    canonical: 'https://www.harchcorp.com/company/ventures',
    languages: {
      en: 'https://www.harchcorp.com/company/ventures',
      fr: 'https://www.harchcorp.com/fr/entreprise/ventures',
      'x-default': 'https://www.harchcorp.com/company/ventures',
    },
  },
  openGraph: {
    title: 'Harch Ventures',
    description: 'Harch Ventures invests in startups building sovereign AI, clean energy, AgriTech, WaterTech, and MiningTech solutions across Africa. Pitch your startup.',
    url: 'https://www.harchcorp.com/company/ventures',
    siteName: 'Harch Corp',
    type: 'website',
    images: [
      {
        url: '/images/og-harch-corp.png',
        width: 1200,
        height: 630,
        alt: 'Harch Ventures | Harch Corp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Harch Ventures',
    description: 'Harch Ventures invests in startups building sovereign AI, clean energy, AgriTech, WaterTech, and MiningTech solutions across Africa. Pitch your startup.',
    images: ['/images/og-harch-corp.png'],
  },
};

export default function VenturesPage() {
  return <VenturesPageClient />;
}
