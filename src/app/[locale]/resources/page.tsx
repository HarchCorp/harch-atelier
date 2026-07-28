import { getTranslations } from 'next-intl/server';
import { PDF_CATALOG } from '@/pdf';
import { ResourcesPageClient } from './ResourcesPageClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: locale === 'fr' ? 'Ressources — HarchCorp' : 'Resources — HarchCorp',
    description: locale === 'fr'
      ? 'Téléchargez nos fiches techniques, livres blancs et rapports sur l\'infrastructure AI, les centres de données et la durabilité.'
      : 'Download our datasheets, whitepapers, and reports on AI infrastructure, data centers, and sustainability.',
    alternates: {
      canonical: `https://www.harchcorp.com/resources`,
      languages: {
        en: `https://www.harchcorp.com/resources`,
        fr: `https://www.harchcorp.com/fr/resources`,
        'x-default': `https://www.harchcorp.com/resources`,
      },
    },
  };
}

export default async function ResourcesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'resources' });

  return <ResourcesPageClient locale={locale} />;
}
