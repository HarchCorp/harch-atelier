import { Metadata } from 'next';
// Switch routing to the brand-compliant FinancePage (Harch brand system:
// neutral-950/white palette, yellow-500 accent, emerald-500 CTAs, Inter+Space Mono,
// "HARCH FINANCE" hero badge, "Back to Harch Corp" link, 20 sections, calculator, FAQ).
// The legacy HarchFinancePage.tsx used custom darks (#0D0D0D, #121212) and a wrong
// slate-blue accent (#8B9DAF) — it is now dead code and kept only as a fallback.
// Aliased to HarchFinancePageClient to avoid collision with the local FinancePage
// server-component function below.
import HarchFinancePageClient from '../[slug]/FinancePage';
import { JsonLd } from '@/components/JsonLd';

interface PageProps {
  params: Promise<{ locale: string }>;
}

/* ─────────────────────────────────────────────────────────────
   Per-locale SEO metadata — Harch Finance subsidiary page
   ───────────────────────────────────────────────────────────── */

const META: Record<'en' | 'fr', {
  title: string;
  description: string;
  keywords: string[];
  ogImageAlt: string;
}> = {
  en: {
    title: 'Harch Finance — Capital for African Infrastructure',
    description:
      'Harch Finance structures green bonds, project finance, trade finance, Islamic finance and impact investment across 7 verticals in 5 African countries.',
    keywords: [
      'Harch Finance', 'green bonds', 'project finance', 'trade finance',
      'Islamic finance', 'sukuk', 'impact investment', 'carbon credits',
      'Africa infrastructure', 'blended finance', 'sovereign wealth fund',
      'development finance', 'Morocco', 'Senegal', 'Kenya', 'Ghana', 'Gambia',
      'ECA financing', 'MIGA', 'OHS compliance',
    ],
    ogImageAlt: 'Harch Finance — financing Africa\'s industrial transformation',
  },
  fr: {
    title: "Harch Finance — Capital pour l'Infrastructure Africaine",
    description:
      "Harch Finance structure des obligations vertes, du financement de projets, du commerce et de la finance islamique pour l'infrastructure souveraine africaine.",
    keywords: [
      'Harch Finance', 'obligations vertes', 'financement de projets',
      'financement du commerce', 'finance islamique', 'sukuk',
      'investissement à impact', 'crédits carbone', 'infrastructure Afrique',
      'finance mixte', 'fonds souverains', 'financement du développement',
      'Maroc', 'Sénégal', 'Kenya', 'Ghana', 'Gambie',
      'financement ACE', 'MIGA', 'conformité SSO',
    ],
    ogImageAlt: 'Harch Finance — financer la transformation industrielle de l\'Afrique',
  },
};

const SITE_URL = 'https://www.harchcorp.com';

function buildUrls(locale: string) {
  const isFr = locale === 'fr';
  // FR path uses the localized /fr/filiales/ base (see i18n/routing.ts pathnames
  // mapping: /subsidiaries → /fr/filiales). The previous /fr/subsidiaries/ URL
  // did not match the URL the routing actually serves, which broke the
  // canonical / hreflang signals for the FR finance page.
  const canonical = isFr
    ? `${SITE_URL}/fr/filiales/finance`
    : `${SITE_URL}/subsidiaries/finance`;
  const enUrl = `${SITE_URL}/subsidiaries/finance`;
  const frUrl = `${SITE_URL}/fr/filiales/finance`;
  return { canonical, enUrl, frUrl, isFr };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const meta = locale === 'fr' ? META.fr : META.en;
  const { canonical, enUrl, frUrl, isFr } = buildUrls(locale);
  const ogImage = `${SITE_URL}/images/sections/finance-district.jpg`;

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

export default async function FinancePage({ params }: PageProps) {
  const { locale } = await params;
  const isFr = locale === 'fr';
  const meta = isFr ? META.fr : META.en;
  const { canonical, enUrl, frUrl } = buildUrls(locale);
  const ogImage = `${SITE_URL}/images/sections/finance-district.jpg`;

  /* JSON-LD: FinancialService (Harch Finance as a sub-organization of Harch Corp) */
  const financialServiceSchema = {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    '@id': `${canonical}#organization`,
    name: 'Harch Finance',
    alternateName: isFr
      ? "Harch Finance — Capital pour l'Infrastructure Africaine"
      : 'Harch Finance — Capital for African Infrastructure',
    url: canonical,
    logo: `${SITE_URL}/logo-512x512.png`,
    image: ogImage,
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
      { '@type': 'Country', name: 'Gambia' },
      { '@type': 'Place', name: 'Africa' },
    ],
    knowsAbout: [
      'Green bonds',
      'Project finance',
      'Trade finance',
      'Islamic finance',
      'Sukuk',
      'Impact investment',
      'Carbon credits',
      'Blended finance',
      'Sovereign wealth funds',
      'Development finance institutions',
      'ECA-backed financing',
      'MIGA coverage',
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
        name: isFr ? 'Filiales' : 'Subsidiaries',
        item: isFr ? `${SITE_URL}/fr/filiales` : `${SITE_URL}/subsidiaries`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Harch Finance',
        item: canonical,
      },
    ],
  };

  /* JSON-LD: Service (Infrastructure Finance) */
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${canonical}#service`,
    serviceType: isFr ? "Finance d'Infrastructure" : 'Infrastructure Finance',
    name: 'Harch Finance',
    description: meta.description,
    url: canonical,
    image: ogImage,
    provider: {
      '@type': 'Organization',
      name: 'Harch Finance',
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
      { '@type': 'Country', name: 'Gambia' },
      { '@type': 'Place', name: 'Africa' },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: isFr ? 'Instruments Financiers Harch Finance' : 'Harch Finance Financial Instruments',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'FinancialProduct',
            name: isFr ? 'Obligations Vertes' : 'Green Bonds',
            description: isFr
              ? 'Obligations vertes certifiées Green Bond Principles finançant les énergies renouvelables et les infrastructures durables en Afrique.'
              : 'ICMA Green Bond Principles-aligned green bonds funding renewable energy and sustainable infrastructure across Africa.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'FinancialProduct',
            name: isFr ? 'Financement de Projets' : 'Project Finance',
            description: isFr
              ? 'Structures de financement de projets à recours limité pour les mégaprojets d\'infrastructure africaine.'
              : 'Limited-recourse project finance structures for African infrastructure mega-projects.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'FinancialProduct',
            name: isFr ? 'Financement du Commerce' : 'Trade Finance',
            description: isFr
              ? "Solutions de financement du commerce et facilitation de lettres de crédit pour les transactions transfrontalières d'infrastructure."
              : 'Trade finance solutions and letter of credit facilitation for cross-border infrastructure transactions.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'FinancialProduct',
            name: isFr ? 'Finance Islamique (Sukuk)' : 'Islamic Finance (Sukuk)',
            description: isFr
              ? 'Structures Sukuk et financement de projets islamiques conformes à la Charia pour l\'infrastructure africaine.'
              : 'Sharia-compliant Sukuk structures and Islamic project finance for African infrastructure.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'FinancialProduct',
            name: isFr ? 'Investissement à Impact' : 'Impact Investment',
            description: isFr
              ? "Investissement à impact avec alignement mesurable sur les ODD et covenants de création d'emplois."
              : 'Impact investment with measurable SDG alignment and jobs creation covenants.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'FinancialProduct',
            name: isFr ? 'Crédits Carbone' : 'Carbon Credits',
            description: isFr
              ? 'Crédits carbone vérifiés Verra & Gold Standard avec retrait automatisé et reporting.'
              : 'Verified Verra & Gold Standard carbon credits with automated retirement and reporting.',
          },
        },
      ],
    },
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
    mainEntity: { '@id': `${canonical}#service` },
    breadcrumb: { '@id': `${canonical}#breadcrumb` },
  };

  return (
    <>
      <JsonLd id="jsonld-financialservice-finance" data={financialServiceSchema} />
      <JsonLd id="jsonld-breadcrumb-finance" data={breadcrumbSchema} />
      <JsonLd id="jsonld-service-finance" data={serviceSchema} />
      <JsonLd id="jsonld-webpage-finance" data={webPageSchema} />
      <HarchFinancePageClient />
    </>
  );
}
