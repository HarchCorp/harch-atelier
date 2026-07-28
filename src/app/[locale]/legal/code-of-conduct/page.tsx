import { Metadata } from 'next';
import CodeOfConductPageClient from './CodeOfConductPageClient';

export const metadata: Metadata = {
  title: 'Code of Conduct',
  description: 'Harch Corp\'s Code of Business Conduct outlining our ethical standards, policies, and reporting mechanisms.',
  alternates: {
    canonical: 'https://www.harchcorp.com/legal/code-of-conduct',
    languages: {
      en: 'https://www.harchcorp.com/legal/code-of-conduct',
      fr: 'https://www.harchcorp.com/fr/legal/code-of-conduct',
      'x-default': 'https://www.harchcorp.com/legal/code-of-conduct',
    },
  },
};

export default function CodeOfConductPage() {
  return <CodeOfConductPageClient />;
}
