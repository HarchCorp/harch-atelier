import { Metadata } from 'next';
import VenturesPageClient from './VenturesPageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Harch Ventures  | Harch Corp',
  description: 'Harch Ventures invests in startups building sovereign AI, clean energy, AgriTech, WaterTech, and MiningTech solutions across Africa. Pitch your startup.',
  alternates: {
    canonical: 'https://www.harchcorp.com/company/ventures',
    languages: {
      en: 'https://www.harchcorp.com/company/ventures',
      fr: 'https://www.harchcorp.com/fr/entreprise/ventures',
      'x-default': 'https://www.harchcorp.com/company/ventures',
    },
  },
};

export default function VenturesPage() {
  return <VenturesPageClient />;
}
