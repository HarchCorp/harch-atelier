'use client';

import { useParams } from 'next/navigation';
import SubsidiaryPageClient from './SubsidiaryPageClient';
import EnergyTeslaPage from './EnergyTeslaPage';
import TechnologyPage from './TechnologyPage';
import CementPage from './CementPage';
import MiningPage from './MiningPage';
import WaterPage from './WaterPage';
import IntelligencePage from './IntelligencePage';
import AtelierPage from './AtelierPage';

export default function SubsidiaryPageClientWrapper() {
  const params = useParams();
  const slug = params.slug as string;

  // Energy gets a custom Tesla-style design
  if (slug === 'energy') {
    return <EnergyTeslaPage />;
  }

  // Technology gets a custom Tesla-style design with bilingual i18n
  if (slug === 'technology') {
    return <TechnologyPage />;
  }

  // Cement gets a custom Tesla-style design with bilingual i18n
  if (slug === 'cement') {
    return <CementPage />;
  }

  // Mining gets a custom Tesla-style design with bilingual i18n
  if (slug === 'mining') {
    return <MiningPage />;
  }

  // Water gets a custom Tesla-style design with bilingual i18n (waterTesla namespace)
  if (slug === 'water') {
    return <WaterPage />;
  }

  // Intelligence gets a custom terminal-aesthetic design with bilingual i18n (intelTesla namespace)
  if (slug === 'intelligence') {
    return <IntelligencePage />;
  }

  // Atelier gets a custom industrial-artisanal design with bilingual i18n (atelierTesla namespace)
  if (slug === 'atelier') {
    return <AtelierPage />;
  }

  return <SubsidiaryPageClient slug={slug} />;
}
