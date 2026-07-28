import { Metadata } from 'next';
import PressPageClient from './PressPageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Press & Media  | Harch Corp',
  description: 'Official press resources for Harch Corp — Moroccan industrial conglomerate. Media kit, brand assets, press releases, executive bios, and media contact information.',
  openGraph: {
    title: 'Press & Media  | Harch Corp',
    description: 'Official press resources for Harch Corp — Media kit, brand assets, press releases, and media contact information.',
    url: 'https://www.harchcorp.com/press',
  },
  alternates: {
    canonical: 'https://www.harchcorp.com/press',
    languages: {
      en: 'https://www.harchcorp.com/press',
      fr: 'https://www.harchcorp.com/fr/presse',
      'x-default': 'https://www.harchcorp.com/press',
    },
  },
};

export default function PressPage() {
  return <PressPageClient />;
}
