import type { Metadata } from 'next';
import HarchLinkPageClient from './HarchLinkPageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'HarchLink — Plateforme de Collaboration IA Souveraine pour l\'Afrique',
  description:
    'HarchLink est la première plateforme souveraine de type Slack avec IA intégrée pour l\'Afrique. Chiffrée de bout en bout, conforme CNDP, propulsée par Harch Intelligence. À partir de 2,50$/utilisateur/mois avec IA incluse.',
  keywords: [
    'HarchLink',
    'collaboration souveraine Afrique',
    'plateforme IA chat Maroc',
    'alternative Slack Afrique',
    'messagerie conforme CNDP',
    'communication d\'équipe chiffrée',
    'assistant IA entreprise',
    'SaaS souverain Afrique',
    'Harch Corp',
    'collaboration entreprise Afrique',
  ],
  alternates: {
    canonical: 'https://www.harchcorp.com/fr/harchlink',
    languages: {
      en: 'https://www.harchcorp.com/harchlink',
      fr: 'https://www.harchcorp.com/fr/harchlink',
      'x-default': 'https://www.harchcorp.com/harchlink',
    },
  },
  openGraph: {
    title: 'HarchLink — Plateforme de Collaboration IA Souveraine pour l\'Afrique',
    description:
      'Plateforme souveraine de type Slack avec IA intégrée. Chiffrée de bout en bout, conforme CNDP. À partir de 2,50$/utilisateur/mois avec IA incluse.',
    url: 'https://www.harchcorp.com/fr/harchlink',
    siteName: 'Harch Corp',
    type: 'website',
    images: [
      {
        url: '/images/og-harch-corp.png',
        width: 1200,
        height: 630,
        alt: 'HarchLink — Plateforme de Collaboration IA Souveraine pour l\'Afrique',
      },
    ],
  },
};

export default function HarchLinkLocalePage() {
  return <HarchLinkPageClient />;
}
