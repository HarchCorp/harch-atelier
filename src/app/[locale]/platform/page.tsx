import { Metadata } from 'next';
import PlatformDemoPage from './PlatformDemoPage';
import { JsonLd } from '@/components/JsonLd';

interface PageProps {
  params: Promise<{ locale: string }>;
}

/* ─────────────────────────────────────────────────────────────
   Per-locale SEO metadata — Harch Corp Platform overview page
   NOTE: the route is /platform (and /fr/platform for FR).
   Earlier metadata pointed FR canonical to /fr/plateforme which 404s.
   ───────────────────────────────────────────────────────────── */

const META: Record<'en' | 'fr', {
  title: string;
  description: string;
  keywords: string[];
  ogImageAlt: string;
}> = {
  en: {
    title: 'Harch Corp Platform — One Conglomerate, Eight Subsidiaries',
    description:
      'One conglomerate. Eight subsidiaries. Sovereign African infrastructure, end to end. Explore the full Harch Corp platform — AI compute, energy, water, cement, mining, agriculture, technology, and finance — in one panoramic showcase.',
    keywords: [
      'Harch Corp platform',
      'Harch ecosystem',
      'sovereign African infrastructure',
      'HarchOS',
      'HarchLink',
      'vertical integration Africa',
      'Morocco industrial conglomerate',
      '8 subsidiaries',
      'Harch Intelligence',
      'Harch Energy',
      'Harch Water',
      'Harch Cement',
      'Harch Mining',
      'Harch Agri',
      'Harch Technology',
      'Harch Finance',
    ],
    ogImageAlt: "Harch Corp platform — one conglomerate, eight subsidiaries",
  },
  fr: {
    title: 'Plateforme Harch Corp — Un conglomérat, huit filiales',
    description:
      "Un conglomérat. Huit filiales. Infrastructure africaine souveraine, de bout en bout. Explorez la plateforme Harch Corp — calcul IA, énergie, eau, ciment, mines, agriculture, technologie et finance — dans une vitrine panoramique.",
    keywords: [
      'plateforme Harch Corp',
      'écosystème Harch',
      'infrastructure africaine souveraine',
      'HarchOS',
      'HarchLink',
      'intégration verticale Afrique',
      'conglomérat industriel Maroc',
      '8 filiales',
      'Harch Intelligence',
      'Harch Énergie',
      'Harch Eau',
      'Harch Ciment',
      'Harch Mines',
      'Harch Agri',
      'Harch Technologie',
      'Harch Finance',
    ],
    ogImageAlt: 'Plateforme Harch Corp — un conglomérat, huit filiales',
  },
};

const SITE_URL = 'https://www.harchcorp.com';

function buildUrls(locale: string) {
  const isFr = locale === 'fr';
  const canonical = isFr
    ? `${SITE_URL}/fr/platform`
    : `${SITE_URL}/platform`;
  const enUrl = `${SITE_URL}/platform`;
  const frUrl = `${SITE_URL}/fr/platform`;
  return { canonical, enUrl, frUrl, isFr };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const meta = locale === 'fr' ? META.fr : META.en;
  const { canonical, enUrl, frUrl, isFr } = buildUrls(locale);
  const ogImage = `${SITE_URL}/images/sections/overview-casablanca.jpg`;

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    alternates: {
      canonical,
      languages: {
        en: enUrl,
        fr: frUrl,
        'x-default': enUrl,
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'website',
      url: canonical,
      siteName: 'Harch Corp',
      locale: isFr ? 'fr_MA' : 'en_US',
      alternateLocale: isFr ? ['en_US'] : ['fr_MA'],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: meta.ogImageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@harchcorp',
      creator: '@harchcorp',
      title: meta.title,
      description: meta.description,
      images: [ogImage],
    },
  };
}

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'fr' }];
}

export default async function PlatformPage({ params }: PageProps) {
  const { locale } = await params;
  const { canonical, enUrl, frUrl } = buildUrls(locale);
  const isFr = locale === 'fr';
  const meta = isFr ? META.fr : META.en;
  const ogImage = `${SITE_URL}/images/sections/overview-casablanca.jpg`;

  /* JSON-LD: Organization (Harch Corp) */
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${canonical}#organization`,
    name: 'Harch Corp',
    alternateName: meta.title,
    url: SITE_URL,
    logo: `${SITE_URL}/logo-512x512.png`,
    image: ogImage,
    description: meta.description,
    foundingDate: '2024',
    foundingLocation: {
      '@type': 'Place',
      name: 'Casablanca, Morocco',
    },
    areaServed: [
      { '@type': 'Country', name: 'Morocco' },
      { '@type': 'Country', name: 'Senegal' },
      { '@type': 'Country', name: 'Kenya' },
      { '@type': 'Country', name: 'Ghana' },
      { '@type': 'Country', name: 'Gambia' },
      { '@type': 'Place', name: 'Africa' },
    ],
    knowsAbout: [
      'AI compute',
      'Cement manufacturing',
      'Renewable energy',
      'Water desalination',
      'Mining',
      'Agriculture',
      'Technology',
      'Infrastructure finance',
      'Sovereign infrastructure',
      'Vertical integration',
    ],
    subOrganization: [
      { '@type': 'Organization', name: 'Harch Intelligence', url: `${SITE_URL}/subsidiaries/intelligence` },
      { '@type': 'Organization', name: 'Harch Cement', url: `${SITE_URL}/subsidiaries/cement` },
      { '@type': 'Organization', name: 'Harch Energy', url: `${SITE_URL}/subsidiaries/energy` },
      { '@type': 'Organization', name: 'Harch Technology', url: `${SITE_URL}/subsidiaries/technology` },
      { '@type': 'Organization', name: 'Harch Mining', url: `${SITE_URL}/subsidiaries/mining` },
      { '@type': 'Organization', name: 'Harch Agriculture', url: `${SITE_URL}/subsidiaries/agriculture` },
      { '@type': 'Organization', name: 'Harch Water', url: `${SITE_URL}/subsidiaries/water` },
      { '@type': 'Organization', name: 'Harch Finance', url: `${SITE_URL}/subsidiaries/finance` },
    ],
    sameAs: [canonical],
  };

  /* JSON-LD: BreadcrumbList */
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${canonical}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: isFr ? 'Accueil' : 'Home',
        item: isFr ? `${SITE_URL}/fr` : SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: isFr ? 'Plateforme' : 'Platform',
        item: canonical,
      },
    ],
  };

  /* JSON-LD: WebPage wrapper */
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${canonical}#webpage`,
    url: canonical,
    name: meta.title,
    description: meta.description,
    isPartOf: { '@type': 'WebSite', name: 'Harch Corp', url: SITE_URL },
    inLanguage: isFr ? 'fr' : 'en',
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: ogImage,
    },
    about: { '@id': `${canonical}#organization` },
    breadcrumb: { '@id': `${canonical}#breadcrumb` },
  };

  return (
    <>
      <JsonLd id="jsonld-organization-platform" data={orgSchema} />
      <JsonLd id="jsonld-breadcrumb-platform" data={breadcrumbSchema} />
      <JsonLd id="jsonld-webpage-platform" data={webPageSchema} />
      <PlatformDemoPage />
    </>
  );
}
