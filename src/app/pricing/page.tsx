import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import PricingPageClient from '../[locale]/pricing/PricingPageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Pricing — Transparent Carbon-Aware GPU Compute Pricing',
  description: 'Transparent, predictable pricing for HarchOS sovereign AI infrastructure. Start free with 10 GPU hours/month. From $1.40/gpu-hr. 40-60% cheaper than AWS, GCP, and Azure. Carbon-aware scheduling at 48.2 gCO2/kWh.',
  keywords: [
    'HarchOS pricing',
    'GPU cloud pricing',
    'AI compute cost',
    'sovereign infrastructure pricing',
    'H100 pricing',
    'A100 pricing',
    'L40S pricing',
    'carbon-aware GPU cloud',
    'affordable GPU cloud',
    'low carbon compute',
  ],
  openGraph: {
    title: 'Pricing — Transparent Carbon-Aware GPU Compute Pricing',
    description: 'Start free with 10 GPU hours/month. From $1.40/gpu-hr. 40-60% cheaper than AWS, GCP, and Azure. Carbon-aware at 48.2 gCO2/kWh.',
    url: 'https://www.harchcorp.com/pricing',
    siteName: 'Harch Corp',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing — Transparent Carbon-Aware GPU Compute Pricing',
    description: 'Start free with 10 GPU hours/month. From $1.40/gpu-hr. 40-60% cheaper than AWS, GCP, and Azure. Carbon-aware at 48.2 gCO2/kWh.',
  },
  alternates: {
    canonical: 'https://www.harchcorp.com/pricing',
    languages: {
      en: 'https://www.harchcorp.com/pricing',
      fr: 'https://www.harchcorp.com/fr/tarifs',
      'x-default': 'https://www.harchcorp.com/pricing',
    },
  },
};

export default async function PricingPage() {
  const messages = await getMessages();
  return (
    <NextIntlClientProvider messages={messages}>
      <PricingPageClient />
    </NextIntlClientProvider>
  );
}
