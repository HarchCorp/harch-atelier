import { Metadata } from 'next';
import ThesisClient from './ThesisClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'The Thesis: Africa\'s Path to Industrial Sovereignty',
  description: 'A comprehensive manifesto on Africa\'s industrial sovereignty — why the continent must build its own AI infrastructure, energy systems, and value chains. By Harch Corp',
  keywords: [
    'Africa industrial sovereignty',
    'African industrialization',
    'sovereign AI Africa',
    'data center Africa',
    'renewable energy Morocco',
    'industrial infrastructure Africa',
    'Harch Corp thesis',
    'Africa value chain',
    'Dakhla data center',
    'green hydrogen Africa',
  ],
  openGraph: {
    title: 'The Thesis: Africa\'s Path to Industrial Sovereignty',
    description: 'Why Africa must stop exporting raw materials and start building its own industrial backbone. A manifesto by Harch Corp.',
    type: 'article',
    url: 'https://www.harchcorp.com/thesis',
    images: [{ url: '/images/og-harch-corp.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Thesis: Africa\'s Path to Industrial Sovereignty',
    description: 'Why Africa must stop exporting raw materials and start building its own industrial backbone.',
    images: ['/images/og-harch-corp.png'],
  },
  alternates: {
    canonical: 'https://www.harchcorp.com/thesis',
    languages: {
      en: 'https://www.harchcorp.com/thesis',
      fr: 'https://www.harchcorp.com/fr/these',
      'x-default': 'https://www.harchcorp.com/thesis',
    },
  },
};

export default function ThesisPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.harchcorp.com' },
      { '@type': 'ListItem', position: 2, name: 'Thesis', item: 'https://www.harchcorp.com/thesis' },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json" async={true}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ThesisClient />
    </>
  );
}
