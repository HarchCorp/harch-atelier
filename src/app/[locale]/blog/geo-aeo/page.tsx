import { Metadata } from 'next';
import GeoAeoBlogPageClient from './GeoAeoBlogPageClient';

export const metadata: Metadata = {
  title: 'GEO & AEO Blog — AI Search Visibility Guides | Harch Atelier',
  description:
    'Practical guides on Generative Engine Optimization (GEO) and Answer Engine Optimization (AEO). Learn how to appear in ChatGPT, Perplexity, Google AI Overviews, and GLM answers.',
  alternates: {
    canonical: 'https://www.harchcorp.com/blog/geo-aeo',
    languages: {
      en: 'https://www.harchcorp.com/blog/geo-aeo',
      fr: 'https://www.harchcorp.com/fr/blog/geo-aeo',
      'x-default': 'https://www.harchcorp.com/blog/geo-aeo',
    },
  },
  openGraph: {
    title: 'GEO & AEO Blog — AI Search Visibility Guides | Harch Atelier',
    description:
      'Practical guides on Generative Engine Optimization (GEO) and Answer Engine Optimization (AEO). Learn how to appear in ChatGPT, Perplexity, Google AI Overviews, and GLM answers.',
    url: 'https://www.harchcorp.com/blog/geo-aeo',
    siteName: 'Harch Corp',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GEO & AEO Blog — AI Search Visibility Guides | Harch Atelier',
    description:
      'Practical guides on Generative Engine Optimization (GEO) and Answer Engine Optimization (AEO).',
  },
  keywords: [
    'GEO',
    'AEO',
    'generative engine optimization',
    'answer engine optimization',
    'AI search visibility',
    'ChatGPT visibility',
    'Perplexity citations',
    'Google AI Overviews',
    'GLM-4',
    'Harch Atelier',
  ],
};

export default function GeoAeoBlogPage() {
  return <GeoAeoBlogPageClient />;
}
