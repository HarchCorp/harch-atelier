import type { Metadata } from 'next';
import SdksPageClient from './SdksPageClient';

export const metadata: Metadata = {
  title: 'SDKs & Libraries — HarchOS',
  description: 'Install and use HarchOS SDKs for Python, TypeScript, Go, and Rust. CLI tool reference, feature comparison, and integration guides.',
  keywords: [
    'HarchOS SDK',
    'Python SDK',
    'TypeScript SDK',
    'Go SDK',
    'Rust SDK',
    'CLI tool',
    'developer tools',
  ],
  openGraph: {
    title: 'SDKs & Libraries — HarchOS',
    description: 'Native SDKs for Python, TypeScript, Go, and Rust. Install, configure, and start building on HarchOS.',
    url: 'https://www.harchcorp.com/docs/sdks',
    siteName: 'Harch Corp',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.harchcorp.com/docs/sdks',
    languages: {
      en: 'https://www.harchcorp.com/docs/sdks',
      fr: 'https://www.harchcorp.com/fr/docs/sdks',
      'x-default': 'https://www.harchcorp.com/docs/sdks',
    },
  },
};

export default function SdksPage() {
  return <SdksPageClient />;
}
