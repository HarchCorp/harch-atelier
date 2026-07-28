import type { Metadata } from 'next';
import HarchLinkPageClient from './HarchLinkPageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'HarchLink — Sovereign AI Collaboration Platform for Africa',
  description:
    'HarchLink is Africa\'s sovereign Slack-like platform with built-in AI. End-to-end encrypted, CNDP-compliant, powered by Harch Intelligence. From $2.50/user/month with AI included.',
  keywords: [
    'HarchLink',
    'sovereign collaboration Africa',
    'AI chat platform Morocco',
    'Slack alternative Africa',
    'CNDP compliant messaging',
    'encrypted team communication',
    'AI assistant enterprise',
    'sovereign SaaS Africa',
    'Harch Corp',
    'enterprise collaboration Africa',
  ],
  alternates: {
    canonical: 'https://www.harchcorp.com/harchlink',
    languages: {
      en: 'https://www.harchcorp.com/harchlink',
      fr: 'https://www.harchcorp.com/fr/harchlink',
      'x-default': 'https://www.harchcorp.com/harchlink',
    },
  },
  openGraph: {
    title: 'HarchLink — Sovereign AI Collaboration Platform for Africa',
    description:
      'Africa\'s sovereign Slack-like platform with built-in AI. End-to-end encrypted, CNDP-compliant. From $2.50/user/month with AI included.',
    url: 'https://www.harchcorp.com/harchlink',
    siteName: 'Harch Corp',
    type: 'website',
    images: [
      {
        url: '/images/og-harch-corp.png',
        width: 1200,
        height: 630,
        alt: 'HarchLink — Sovereign AI Collaboration Platform for Africa',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HarchLink — Sovereign AI Collaboration Platform for Africa',
    description: 'Africa\'s sovereign Slack-like platform with built-in AI. From $2.50/user/month with AI included.',
    images: ['/images/og-harch-corp.png'],
  },
};

export default function HarchLinkPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.harchcorp.com' },
      { '@type': 'ListItem', position: 2, name: 'HarchLink', item: 'https://www.harchcorp.com/harchlink' },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json" async={true}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <HarchLinkPageClient />
    </>
  );
}
