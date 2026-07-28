import { Metadata } from 'next';
import AgriculturePageClient from '../[slug]/AgriculturePage';
import { JsonLd } from '@/components/JsonLd';

interface PageProps {
  params: Promise<{ locale: string }>;
}

/* ─────────────────────────────────────────────────────────────
   Per-locale SEO metadata — Harch Agri subsidiary page
   ───────────────────────────────────────────────────────────── */

const META = {
  en: {
    title: 'Harch Agri — Precision Agriculture & IoT for Africa',
    description:
      'Harch Agri deploys drones, IoT sensors, vertical farms, and agricultural carbon credits across African farmlands — an integrated AgTech platform.',
    keywords: [
      'Harch Agri', 'precision agriculture', 'Africa agriculture',
      'agriculture IoT', 'agriculture drones', 'vertical farms',
      'carbon credits', 'agricultural drones', 'Morocco agriculture',
      'Senegal farming', 'Kenya agritech', 'Ghana farmers', 'AgTech',
      'precision irrigation', 'sustainable agriculture', 'ESG agriculture',
    ],
    ogImageAlt: 'Harch Agri — drone surveilling African farmland',
  },
  fr: {
    title: 'Harch Agri — Agriculture de Précision & IoT pour l’Afrique',
    description:
      'Harch Agri déploie drones, capteurs IoT, fermes verticales et crédits carbone agricoles sur les terres africaines — une plateforme AgTech intégrée.',
    keywords: [
      'Harch Agri', 'agriculture de précision', 'agriculture Afrique',
      'agriculture IoT', 'drones agricoles', 'fermes verticales',
      'crédits carbone', 'agriculture Maroc', 'agriculture Sénégal',
      'agritech Kenya', 'agriculteurs Ghana', 'AgTech',
      'irrigation de précision', 'agriculture durable', 'ESG agriculture',
    ],
    ogImageAlt: 'Harch Agri — drone survolant des terres agricoles africaines',
  },
} as const;

const SITE_URL = 'https://www.harchcorp.com';

function buildUrls(locale: string) {
  const isFr = locale === 'fr';
  // FR path uses the localized /fr/filiales/ base (see i18n/routing.ts pathnames
  // mapping: /subsidiaries → /fr/filiales). Hardcoding /fr/subsidiaries would
  // produce a canonical URL that does not match the URL the routing actually
  // serves for the FR locale.
  const canonical = isFr
    ? `${SITE_URL}/fr/filiales/agriculture`
    : `${SITE_URL}/subsidiaries/agriculture`;
  const enUrl = `${SITE_URL}/subsidiaries/agriculture`;
  const frUrl = `${SITE_URL}/fr/filiales/agriculture`;
  return { canonical, enUrl, frUrl, isFr };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const meta = locale === 'fr' ? META.fr : META.en;
  const { canonical, enUrl, frUrl, isFr } = buildUrls(locale);
  const ogImage = `${SITE_URL}/images/sections/agri-aerial-drone.jpg`;

  return {
    title: meta.title,
    description: meta.description,
    keywords: [...meta.keywords] as string[],
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

export default async function AgriculturePage({ params }: PageProps) {
  const { locale } = await params;
  const isFr = locale === 'fr';
  const meta = isFr ? META.fr : META.en;
  const { canonical, enUrl, frUrl } = buildUrls(locale);

  /* JSON-LD: Organization (Harch Agri as sub-organization of Harch Corp) */
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${canonical}#organization`,
    name: 'Harch Agri',
    alternateName: isFr ? 'Harch Agri — Agriculture de Précision' : 'Harch Agri — Precision Agriculture',
    url: canonical,
    logo: `${SITE_URL}/images/sections/agri-aerial-drone.jpg`,
    image: `${SITE_URL}/images/sections/agri-aerial-drone.jpg`,
    description: meta.description,
    parentOrganization: {
      '@type': 'Organization',
      name: 'Harch Corp',
      url: SITE_URL,
    },
    areaServed: [
      { '@type': 'Country', name: 'Morocco' },
      { '@type': 'Country', name: 'Senegal' },
      { '@type': 'Country', name: 'Kenya' },
      { '@type': 'Country', name: 'Ghana' },
      { '@type': 'Place', name: 'Africa' },
    ],
    knowsAbout: [
      'Precision agriculture',
      'IoT agriculture sensors',
      'Agricultural drones',
      'Vertical farming',
      'Agricultural carbon credits',
      'Sustainable agriculture',
    ],
    sameAs: [`${SITE_URL}/subsidiaries/agriculture`],
  };

  /* JSON-LD: BreadcrumbList */
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
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
        name: isFr ? 'Filiales' : 'Subsidiaries',
        item: isFr ? `${SITE_URL}/fr/filiales` : `${SITE_URL}/subsidiaries`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Harch Agri',
        item: canonical,
      },
    ],
  };

  /* JSON-LD: Service (Precision Agriculture as a Service) */
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${canonical}#service`,
    serviceType: isFr ? 'Agriculture de précision' : 'Precision Agriculture',
    name: 'Harch Agri',
    description: meta.description,
    url: canonical,
    image: `${SITE_URL}/images/sections/agri-aerial-drone.jpg`,
    provider: {
      '@type': 'Organization',
      name: 'Harch Agri',
      url: canonical,
      parentOrganization: {
        '@type': 'Organization',
        name: 'Harch Corp',
        url: SITE_URL,
      },
    },
    areaServed: [
      { '@type': 'Country', name: 'Morocco' },
      { '@type': 'Country', name: 'Senegal' },
      { '@type': 'Country', name: 'Kenya' },
      { '@type': 'Country', name: 'Ghana' },
      { '@type': 'Place', name: 'Africa' },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: isFr ? 'Produits Harch Agri' : 'Harch Agri Products',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: isFr ? 'Drones agricoles (DaaS)' : 'Agricultural Drones (DaaS)',
            description: isFr
              ? 'Surveillance par drone, pulvérisation de précision et imagerie multspectrale couvrant 40 ha.'
              : 'Drone surveillance, precision spraying, and multispectral imaging covering 40 ha.',
          },
          price: '50',
          priceCurrency: 'USD',
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: isFr ? 'Capteurs IoT agricoles' : 'Agricultural IoT Sensors',
            description: isFr
              ? "Capteurs de sol et stations météorologique avec économies d'eau de 30 à 50 %."
              : 'Soil sensors and weather station with 30-50% water savings.',
          },
          price: '500',
          priceCurrency: 'USD',
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: isFr ? 'Fermes verticales' : 'Vertical Farms',
            description: isFr
              ? "Modules de ferme verticale avec 95 % d'économie d'eau et ROI en 12 à 18 mois."
              : 'Vertical farm modules with 95% water savings and 12-18 month ROI.',
          },
          price: '50000',
          priceCurrency: 'USD',
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: isFr ? 'Crédits carbone agricoles' : 'Agricultural Carbon Credits',
            description: isFr
              ? "Génération et courtage de crédits carbone (0,5-3 tCO2/ha) avec commission de 2 %."
              : 'Carbon credit generation and brokerage (0.5-3 tCO2/ha) with 2% commission.',
          },
        },
      ],
    },
  };

  /* JSON-LD: WebPage wrapper with subjectOf for the Organization/Service */
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
      url: `${SITE_URL}/images/sections/agri-aerial-drone.jpg`,
    },
    about: { '@id': `${canonical}#organization` },
    mainEntity: { '@id': `${canonical}#service` },
    breadcrumb: { '@id': `${canonical}#breadcrumb` },
  };

  return (
    <>
      <JsonLd id="jsonld-organization-agri" data={organizationSchema} />
      <JsonLd id="jsonld-breadcrumb-agri" data={breadcrumbSchema} />
      <JsonLd id="jsonld-service-agri" data={serviceSchema} />
      <JsonLd id="jsonld-webpage-agri" data={webPageSchema} />
      <AgriculturePageClient />
    </>
  );
}
