import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'HarchOS — The Operating System for Sovereign AI Infrastructure',
  description: 'HarchOS is the operating system for Africa\'s first carbon-aware GPU compute platform — powered by Morocco\'s renewable energy advantage. 1,798 planned GPUs, 5 hubs, 48.2 gCO2/kWh target.',
  keywords: [
    'HarchOS',
    'AI operating system',
    'sovereign AI infrastructure',
    'distributed compute mesh',
    'green GPU cloud',
    'renewable energy data center',
    'Morocco AI compute',
    'Ouarzazate solar data center',
  ],
  openGraph: {
    title: 'HarchOS — The Operating System for Sovereign AI Infrastructure',
    description: '5 hubs. 1,798 planned GPUs. Up to 97% renewable. Africa\'s carbon-aware GPU platform.',
    url: 'https://www.harchcorp.com/intelligence/harchos',
    siteName: 'Harch Corp',
    type: 'website',
    images: [
      {
        url: '/images/intelligence/harchos-hero.png',
        width: 1920,
        height: 1080,
        alt: 'HarchOS — Sovereign AI Infrastructure',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HarchOS — The Operating System for Sovereign AI Infrastructure',
    description: '5 hubs. 1,798 planned GPUs. Up to 97% renewable. Africa\'s carbon-aware GPU platform.',
    images: ['/images/intelligence/harchos-hero.png'],
  },
  alternates: {
    canonical: 'https://www.harchcorp.com/intelligence/harchos',
    languages: {
      en: 'https://www.harchcorp.com/intelligence/harchos',
      fr: 'https://www.harchcorp.com/fr/intelligence/harchos',
      'x-default': 'https://www.harchcorp.com/intelligence/harchos',
    },
  },
};

export default function HarchOSPage() {
  redirect('/en/intelligence/harchos');
}
