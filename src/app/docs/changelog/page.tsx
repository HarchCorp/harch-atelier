import type { Metadata } from 'next';
import ChangelogPageClient from './ChangelogPageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Release Notes — HarchOS',
  description: 'HarchOS release notes and changelog. Track new features, improvements, bug fixes, breaking changes, and deprecations across all versions.',
  keywords: [
    'HarchOS changelog',
    'release notes',
    'version history',
    'what\'s new',
    'breaking changes',
  ],
  openGraph: {
    title: 'Release Notes — HarchOS',
    description: 'Track HarchOS releases. New features, improvements, bug fixes, and breaking changes.',
    url: 'https://www.harchcorp.com/docs/changelog',
    siteName: 'Harch Corp',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.harchcorp.com/docs/changelog',
    languages: {
      en: 'https://www.harchcorp.com/docs/changelog',
      fr: 'https://www.harchcorp.com/fr/docs/changelog',
      'x-default': 'https://www.harchcorp.com/docs/changelog',
    },
  },
};

export default function ChangelogPage() {
  return <ChangelogPageClient />;
}
