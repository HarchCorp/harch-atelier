import { Metadata } from 'next';
import ResearchPageClient from './ResearchPageClient';

export const metadata: Metadata = {
  title: 'Harch Research — Analyses business ouvertes Maroc & Afrique',
  description: 'Dossiers analytiques gratuits sur les opportunités business au Maroc et en Afrique. 30+ secteurs analysés. un dossier par semaine.',
};

export default function ResearchPage() {
  return <ResearchPageClient />;
}
