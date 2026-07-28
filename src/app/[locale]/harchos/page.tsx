import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import HarchOSPageClient from '../intelligence/harchos/HarchOSPageClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isFr = locale === 'fr';

  const title = isFr
    ? 'HarchOS — IA souveraine, depuis la ligne de commande'
    : 'HarchOS — Sovereign AI, from the command line';

  const description = isFr
    ? 'HarchOS est une plateforme d\'orchestration GPU native Kubernetes pour l\'Afrique. H100 à 1,80 $/h, provisionnement en 90 s, 5 hubs, 99,98 % SLA, 100 % renouvelable, données en Afrique.'
    : 'HarchOS is a Kubernetes-native GPU orchestration platform built on African soil. H100s from $1.80/hr, 90s provisioning, 5 hubs, 99.98% SLA, 100% renewable, data stays in Africa.';

  const ogDescription = isFr
    ? 'Orchestration GPU souveraine pour l\'Afrique. 1 798 GPU, 5 hubs, 0,02 gCO2/kWh. Pas de CLOUD Act. Pas d\'egress surprises.'
    : 'Sovereign GPU orchestration for Africa. 1,798 GPUs, 5 hubs, 0.02 gCO2/kWh. No CLOUD Act. No egress surprises.';

  const url = isFr
    ? 'https://www.harchcorp.com/fr/harchos'
    : 'https://www.harchcorp.com/harchos';

  return {
    title,
    description,
    keywords: isFr
      ? [
          'HarchOS',
          'orchestration GPU',
          'IA souveraine Afrique',
          'cloud GPU Afrique',
          'H100 Maroc',
          'Kubernetes GPU',
          'centre de données Casablanca',
          'énergie renouvelable IA',
          'Loi 09-08',
          'SDK Python IA',
        ]
      : [
          'HarchOS',
          'GPU orchestration',
          'sovereign AI Africa',
          'GPU cloud Africa',
          'H100 Morocco',
          'Kubernetes GPU',
          'Casablanca data center',
          'renewable energy AI',
          'Law 09-08',
          'Python AI SDK',
        ],
    openGraph: {
      title,
      description: ogDescription,
      url,
      siteName: 'Harch Corp',
      type: 'website',
      locale: isFr ? 'fr_MA' : 'en_US',
      alternateLocale: isFr ? ['en_US'] : ['fr_MA'],
      images: [
        {
          url: '/images/intelligence/harchos-hero.png',
          width: 1920,
          height: 1080,
          alt: isFr
            ? 'HarchOS — IA souveraine, depuis la ligne de commande'
            : 'HarchOS — Sovereign AI, from the command line',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: ogDescription,
      images: ['/images/intelligence/harchos-hero.png'],
    },
    alternates: {
      canonical: url,
      languages: {
        en: 'https://www.harchcorp.com/harchos',
        fr: 'https://www.harchcorp.com/fr/harchos',
        'x-default': 'https://www.harchcorp.com/harchos',
      },
    },
  };
}

export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'fr' }];
}

export default async function HarchOSRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isFr = locale === 'fr';

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: isFr ? 'Accueil' : 'Home',
        item: isFr ? 'https://www.harchcorp.com/fr' : 'https://www.harchcorp.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'HarchOS',
        item: isFr
          ? 'https://www.harchcorp.com/fr/harchos'
          : 'https://www.harchcorp.com/harchos',
      },
    ],
  };

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'HarchOS',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Linux, Kubernetes',
    url: isFr
      ? 'https://www.harchcorp.com/fr/harchos'
      : 'https://www.harchcorp.com/harchos',
    description: isFr
      ? 'Plateforme d\'orchestration GPU native Kubernetes pour l\'Afrique — 1 798 GPU, 5 hubs, 100 % renouvelable, souveraineté Loi 09-08.'
      : 'Kubernetes-native GPU orchestration platform for Africa — 1,798 GPUs, 5 hubs, 100% renewable, Law 09-08 sovereignty.',
    offers: {
      '@type': 'Offer',
      price: '1.80',
      priceCurrency: 'USD',
      description: 'Per H100 GPU-hour, on-demand',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Harch Corp',
      url: 'https://www.harchcorp.com',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        async={true}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        async={true}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <HarchOSPageClient />
    </>
  );
}
