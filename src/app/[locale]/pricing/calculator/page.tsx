import type { Metadata } from 'next';
import CalculatorPageClient from './CalculatorPageClient';

export const metadata: Metadata = {
  title: 'Cost Calculator — Carbon-Aware HarchOS Pricing',
  description: 'Calculate your HarchOS infrastructure costs. From $1.40/gpu-hr with carbon-aware scheduling at 48.2 gCO2/kWh. Compare GPU compute pricing against AWS, GCP, and Azure. See 40-60% savings with 100% renewable sovereign infrastructure.',
  keywords: [
    'HarchOS cost calculator',
    'GPU pricing calculator',
    'AI compute cost estimator',
    'cloud pricing comparison',
    'H100 cost',
    'A100 pricing',
  ],
  openGraph: {
    title: 'Cost Calculator — Carbon-Aware HarchOS Pricing',
    description: 'Calculate GPU compute costs. From $1.40/gpu-hr at 48.2 gCO2/kWh. See 40-60% savings vs AWS, GCP, Azure.',
    url: 'https://www.harchcorp.com/pricing/calculator',
    siteName: 'Harch Corp',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cost Calculator — Carbon-Aware HarchOS Pricing',
    description: 'Calculate GPU compute costs. From $1.40/gpu-hr at 48.2 gCO2/kWh. See 40-60% savings vs AWS, GCP, Azure.',
  },
  alternates: {
    canonical: 'https://www.harchcorp.com/pricing/calculator',
    languages: {
      en: 'https://www.harchcorp.com/pricing/calculator',
      fr: 'https://www.harchcorp.com/fr/tarifs/calculateur',
      'x-default': 'https://www.harchcorp.com/pricing/calculator',
    },
  },
};

export default function CalculatorPage() {
  return <CalculatorPageClient />;
}
