import { Metadata } from 'next';
import Timeline6MwpClient from './Timeline6MwpClient';

export const dynamic = 'force-dynamic';

// ⚠️ PAGE NON RÉPERTORIÉE — Noindex, pas dans le sitemap, pas dans la navigation
export const metadata: Metadata = {
  title: 'Timeline 6 MWp — Harch Energy (privé)',
  description: 'Visualisation immersive des flux financiers projet solaire 6 MWp.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function Timeline6MwpPage() {
  return <Timeline6MwpClient />;
}
