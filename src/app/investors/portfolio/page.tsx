import { Metadata } from 'next';
import InvestorsPortfolioClient from './InvestorsPortfolioClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Investment Portfolio | Harch Corp',
  description:
    'Harch Corp investment portfolio — 8 subsidiaries across 5 countries with a $2.4B pipeline. Explore capital allocation, deployment phases, and projected returns.',
  keywords: [
    'Harch Corp portfolio',
    'investment portfolio Morocco',
    'sovereign infrastructure investment',
    'Africa infrastructure portfolio',
  ],
  alternates: {
    canonical: 'https://www.harchcorp.com/investors/portfolio',
  },
};

export default function PortfolioPage() {
  return <InvestorsPortfolioClient />;
}
