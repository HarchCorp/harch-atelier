import { Metadata } from 'next';
import HarchEnergyCockpit from './CockpitClient';

export const dynamic = 'force-dynamic';

// ⚠️ PAGE NON RÉPERTORIÉE — Noindex, pas dans sitemap, pas dans navigation
export const metadata: Metadata = {
  title: 'Harch Energy — Cockpit Opérationnel (privé)',
  description: 'Cockpit de gestion opérationnelle Harch Energy.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function HarchEnergyPage() {
  return <HarchEnergyCockpit />;
}
