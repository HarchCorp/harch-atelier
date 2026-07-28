import { Metadata } from 'next';
import InvestorsResearchClient from './InvestorsResearchClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Research Portal | Harch Corp Investors',
  description:
    '7 open-data investment dossiers on Morocco and Africa business opportunities. 309 pages of analysis with financial models, public subsidies, and execution plans.',
  keywords: [
    'Harch Corp research',
    'Morocco investment dossiers',
    'Africa business opportunities',
    'open data investment analysis',
  ],
  alternates: {
    canonical: 'https://www.harchcorp.com/investors/research',
  },
};

export default function ResearchPage() {
  return <InvestorsResearchClient />;
}
