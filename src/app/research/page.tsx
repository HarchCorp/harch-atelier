import { Metadata } from 'next';
import ResearchPageClient from './ResearchPageClient';

export const metadata: Metadata = {
  title: 'Harch Research — Open Business Analysis for Morocco & Africa',
  description: 'Free analytical dossiers on business opportunities in Morocco and Africa. 30+ sectors analyzed. one dossier per week.',
  openGraph: {
    title: 'Harch Research — Open Business Analysis',
    description: 'Free analytical dossiers on business opportunities in Morocco and Africa.',
  },
};

export default function ResearchPage() {
  return <ResearchPageClient />;
}
