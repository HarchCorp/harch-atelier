import { MetadataRoute } from 'next';
import { blogArticles } from '@/data/blog-articles';
import { seoArticles } from '@/data/seo-articles';
import { articles } from '@/data/articles';
import { caseStudies } from '@/data/case-studies';
import { engArticles } from '@/data/eng-articles';

const allBlogArticles = [...blogArticles, ...seoArticles];

// French URL path mappings (en → fr)
const frPathMap: Record<string, string> = {
  '/about': '/a-propos',
  '/platform': '/plateforme',
  '/thesis': '/these',
  '/strategy': '/strategie',
  // /subsidiaries path is preserved in FR (next-intl only swaps the locale prefix).
  // The sitemap code at /subsidiaries/${slug} already prepends /fr, so the mapped
  // value must NOT include /fr — identity mapping keeps the segment in English.
  '/subsidiaries': '/subsidiaries',
  '/esg': '/rse',
  '/careers': '/carrieres',
  '/careers/hiring-process': '/carrieres/processus-de-recrutement',
  '/case-studies': '/etudes-de-cas',
  '/contact': '/contact',
  '/quote': '/devis',
  '/partners': '/partenaires',
  '/investors': '/investisseurs',
  '/newsroom': '/actualites',
  '/intelligence': '/intelligence',
  '/intelligence/harchos': '/intelligence/harchos',
  '/faq': '/faq',
  '/press': '/presse',
  '/trust': '/confiance',
  '/trust/security': '/confiance/securite',
  '/trust/compliance': '/confiance/conformite',
  '/trust/ai-ethics': '/confiance/ethique-ia',
  '/trust/vulnerability-disclosure': '/confiance/divulgation-vulnerabilites',
  '/legal': '/juridique',
  '/legal/hub': '/juridique/centre',
  '/legal/cookies': '/juridique/cookies',
  '/legal/gdpr': '/juridique/rgpd',
  '/legal/ccpa': '/juridique/ccpa',
  '/legal/dpa': '/juridique/dpa',
  '/legal/sla': '/juridique/sla',
  '/legal/accessibility': '/juridique/accessibilite',
  '/legal/code-of-conduct': '/juridique/code-de-conduite',
  '/legal/modern-slavery': '/juridique/esclavage-moderne',
  '/legal/trademark': '/juridique/marque-deposee',
  '/privacy': '/confidentialite',
  '/terms': '/conditions',
  '/docs': '/docs',
  '/docs/api': '/docs/api',
  '/docs/sdks': '/docs/sdks',
  '/docs/guides': '/docs/guides',
  '/docs/quickstarts': '/docs/demarrage-rapide',
  '/docs/architecture': '/docs/architecture',
  '/docs/changelog': '/docs/journal-des-modifications',
  '/developers': '/developpeurs',
  '/developers/playground': '/developpeurs/bac-a-sable',
  '/developers/open-source': '/developpeurs/open-source',
  '/pricing': '/tarifs',
  '/pricing/calculator': '/tarifs/calculateur',
  '/customers': '/clients',
  '/customers/advisory-board': '/clients/conseil-consultatif',
  '/support': '/support',
  '/startup-program': '/programme-startup',
  '/company/leadership': '/entreprise/direction',
  '/company/dei': '/entreprise/diversite',
  '/company/ventures': '/entreprise/ventures',
  '/blog': '/blog',
  '/engineering-blog': '/blog-ingenierie',
  '/community': '/communaute',
  '/events': '/evenements',
  '/learn': '/apprendre',
  '/glossary': '/glossaire',
  '/status': '/statut',
};

// Subsidiary slugs remain the same across locales (no per-slug translations)
// but the base path changes: /subsidiaries → /filiales

// Returns the French pathname **without** the `/fr` locale prefix.
// Callers are responsible for prepending `/fr` if they need the full URL.
// Previously the fallback returned `/fr${enPath}`, which — combined with the
// caller already prepending `/fr` — produced double-prefixed `/fr/fr/...`
// URLs in the sitemap (and consequently in search-engine crawls).
function getFrPath(enPath: string): string {
  return frPathMap[enPath] || enPath;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.harchcorp.com';
  const now = new Date();

  const verticals = [
    'intelligence',
    'cement',
    'energy',
    'technology',
    'mining',
    'agriculture',
    'water',
    'finance',
    'atelier',
  ];

  const staticPages = [
    { path: '/', changeFrequency: 'weekly' as const, priority: 1.0, images: [`${baseUrl}/images/og-harch-corp.png`, `${baseUrl}/logo-512x512.png`] },
    { path: '/platform', changeFrequency: 'monthly' as const, priority: 0.95 },
    { path: '/thesis', changeFrequency: 'monthly' as const, priority: 0.95 },
    { path: '/about', changeFrequency: 'monthly' as const, priority: 0.85 },
    { path: '/strategy', changeFrequency: 'monthly' as const, priority: 0.8 },
    { path: '/subsidiaries', changeFrequency: 'monthly' as const, priority: 0.9 },
    { path: '/esg', changeFrequency: 'monthly' as const, priority: 0.75 },
    { path: '/careers', changeFrequency: 'weekly' as const, priority: 0.7 },
    { path: '/careers/hiring-process', changeFrequency: 'monthly' as const, priority: 0.6 },
    { path: '/case-studies', changeFrequency: 'weekly' as const, priority: 0.9 },
    { path: '/contact', changeFrequency: 'monthly' as const, priority: 0.65 },
    { path: '/quote', changeFrequency: 'monthly' as const, priority: 0.9 },
    { path: '/partners', changeFrequency: 'monthly' as const, priority: 0.6 },
    { path: '/investors', changeFrequency: 'weekly' as const, priority: 0.9 },
    { path: '/investors/portfolio', changeFrequency: 'weekly' as const, priority: 0.85 },
    { path: '/investors/research', changeFrequency: 'weekly' as const, priority: 0.85 },
    { path: '/manifesto', changeFrequency: 'monthly' as const, priority: 0.8 },
    { path: '/newsroom', changeFrequency: 'weekly' as const, priority: 0.8 },
    { path: '/intelligence', changeFrequency: 'monthly' as const, priority: 0.85 },
    { path: '/intelligence/harchos', changeFrequency: 'monthly' as const, priority: 0.9 },
    { path: '/faq', changeFrequency: 'monthly' as const, priority: 0.8 },
    { path: '/press', changeFrequency: 'weekly' as const, priority: 0.8 },
    { path: '/research', changeFrequency: 'weekly' as const, priority: 0.9 },
    { path: '/launch', changeFrequency: 'monthly' as const, priority: 0.8 },
  ];

  const trustPages = [
    { path: '/trust', changeFrequency: 'monthly' as const, priority: 0.8 },
    { path: '/trust/security', changeFrequency: 'monthly' as const, priority: 0.75 },
    { path: '/trust/compliance', changeFrequency: 'monthly' as const, priority: 0.75 },
    { path: '/trust/ai-ethics', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/trust/vulnerability-disclosure', changeFrequency: 'monthly' as const, priority: 0.65 },
  ];

  const legalPages = [
    { path: '/legal', changeFrequency: 'yearly' as const, priority: 0.5 },
    { path: '/legal/hub', changeFrequency: 'yearly' as const, priority: 0.5 },
    { path: '/legal/cookies', changeFrequency: 'yearly' as const, priority: 0.4 },
    { path: '/legal/gdpr', changeFrequency: 'yearly' as const, priority: 0.5 },
    { path: '/legal/ccpa', changeFrequency: 'yearly' as const, priority: 0.5 },
    { path: '/legal/dpa', changeFrequency: 'yearly' as const, priority: 0.5 },
    { path: '/legal/sla', changeFrequency: 'yearly' as const, priority: 0.5 },
    { path: '/legal/accessibility', changeFrequency: 'yearly' as const, priority: 0.4 },
    { path: '/legal/code-of-conduct', changeFrequency: 'yearly' as const, priority: 0.4 },
    { path: '/legal/modern-slavery', changeFrequency: 'yearly' as const, priority: 0.4 },
    { path: '/legal/trademark', changeFrequency: 'yearly' as const, priority: 0.4 },
    { path: '/privacy', changeFrequency: 'yearly' as const, priority: 0.5 },
    { path: '/terms', changeFrequency: 'yearly' as const, priority: 0.5 },
  ];

  const docsPages = [
    { path: '/docs', changeFrequency: 'weekly' as const, priority: 0.85 },
    { path: '/docs/api', changeFrequency: 'weekly' as const, priority: 0.8 },
    { path: '/docs/sdks', changeFrequency: 'weekly' as const, priority: 0.8 },
    { path: '/docs/guides', changeFrequency: 'weekly' as const, priority: 0.75 },
    { path: '/docs/quickstarts', changeFrequency: 'monthly' as const, priority: 0.75 },
    { path: '/docs/architecture', changeFrequency: 'monthly' as const, priority: 0.75 },
    { path: '/docs/changelog', changeFrequency: 'weekly' as const, priority: 0.7 },
  ];

  const devPages = [
    { path: '/developers', changeFrequency: 'weekly' as const, priority: 0.8 },
    { path: '/developers/playground', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/developers/open-source', changeFrequency: 'monthly' as const, priority: 0.65 },
  ];

  const businessPages = [
    { path: '/pricing', changeFrequency: 'monthly' as const, priority: 0.85 },
    { path: '/pricing/calculator', changeFrequency: 'monthly' as const, priority: 0.8 },
    { path: '/customers', changeFrequency: 'monthly' as const, priority: 0.75 },
    { path: '/customers/advisory-board', changeFrequency: 'monthly' as const, priority: 0.6 },
    { path: '/support', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/startup-program', changeFrequency: 'monthly' as const, priority: 0.65 },
  ];

  const companyPages = [
    { path: '/company/leadership', changeFrequency: 'monthly' as const, priority: 0.75 },
    { path: '/company/dei', changeFrequency: 'monthly' as const, priority: 0.6 },
    { path: '/company/ventures', changeFrequency: 'monthly' as const, priority: 0.65 },
  ];

  const resourcePages = [
    { path: '/blog', changeFrequency: 'weekly' as const, priority: 0.75, images: [`${baseUrl}/images/blog/sovereign-ai-infrastructure.jpg`] },
    { path: '/engineering-blog', changeFrequency: 'weekly' as const, priority: 0.7 },
    { path: '/community', changeFrequency: 'monthly' as const, priority: 0.65 },
    { path: '/events', changeFrequency: 'monthly' as const, priority: 0.65 },
    { path: '/learn', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/glossary', changeFrequency: 'monthly' as const, priority: 0.5 },
    { path: '/status', changeFrequency: 'daily' as const, priority: 0.6 },
  ];

  const verticalImages: Record<string, string> = {
    intelligence: 'comp-intel-dc',
    cement: 'comp-cement-mixer',
    energy: 'comp-energy-solar',
    technology: 'comp-tech-ai',
    mining: 'comp-mining-heavy',
    agriculture: 'comp-agri-aerial',
    water: 'comp-water-plant',
    finance: 'finance-corporate',
  };

  // ═══ Generate entries for both EN and FR locales ═══
  function generateEntries(pages: { path: string; changeFrequency: 'weekly' | 'monthly' | 'yearly' | 'daily'; priority: number; images?: string[] }[]) {
    const entries: MetadataRoute.Sitemap = [];

    for (const page of pages) {
      const enUrl = `${baseUrl}${page.path === '/' ? '' : page.path}`;
      const frPath = page.path === '/' ? '/fr' : `/fr${getFrPath(page.path)}`;
      const frUrl = `${baseUrl}${frPath}`;

      // English entry with alternates
      entries.push({
        url: enUrl,
        lastModified: now,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        images: page.images,
        alternates: {
          languages: {
            en: enUrl,
            fr: frUrl,
            'x-default': enUrl,
          },
        },
      });

      // French entry with alternates
      entries.push({
        url: frUrl,
        lastModified: now,
        changeFrequency: page.changeFrequency,
        priority: page.priority * 0.95, // Slightly lower priority for translated pages
        images: page.images,
        alternates: {
          languages: {
            en: enUrl,
            fr: frUrl,
            'x-default': enUrl,
          },
        },
      });
    }

    return entries;
  }

  // Blog article pages with images for Google Image indexing
  const blogPages = allBlogArticles.map((article) => {
    const enUrl = `${baseUrl}/blog/${article.slug}`;
    return {
      url: enUrl,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      images: [`${baseUrl}${article.image}`],
      alternates: {
        languages: {
          en: enUrl,
          fr: `${baseUrl}/fr/blog/${article.slug}`,
          'x-default': enUrl,
        },
      },
    };
  });

  // Newsroom article pages
  const newsroomPages = articles.map((article) => {
    const enUrl = `${baseUrl}/newsroom/${article.slug}`;
    return {
      url: enUrl,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.65,
      images: [`${baseUrl}${article.image}`],
      alternates: {
        languages: {
          en: enUrl,
          fr: `${baseUrl}/fr/actualites/${article.slug}`,
          'x-default': enUrl,
        },
      },
    };
  });

  // Engineering blog article pages
  const engBlogPages = engArticles.map((article) => {
    const enUrl = `${baseUrl}/engineering-blog/${article.slug}`;
    return {
      url: enUrl,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      images: [`${baseUrl}${article.image}`],
      alternates: {
        languages: {
          en: enUrl,
          fr: `${baseUrl}/fr/blog-ingenierie/${article.slug}`,
          'x-default': enUrl,
        },
      },
    };
  });

  // Vertical/subsidiary pages with alternates
  // French URLs use /fr/filiales/{slug} (localized base path with English slugs)
  const frSubsPath = getFrPath('/subsidiaries'); // → /filiales
  const verticalPages = verticals.map((v) => {
    const enUrl = `${baseUrl}/subsidiaries/${v}`;
    const frUrl = `${baseUrl}/fr${frSubsPath}/${v}`;
    return {
      url: enUrl,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.85,
      images: [`${baseUrl}/images/sections/${verticalImages[v]}.jpg`],
      alternates: {
        languages: {
          en: enUrl,
          fr: frUrl,
          'x-default': enUrl,
        },
      },
    };
  });

  // Also add French vertical pages
  const frVerticalPages = verticals.map((v) => {
    const enUrl = `${baseUrl}/subsidiaries/${v}`;
    const frUrl = `${baseUrl}/fr${frSubsPath}/${v}`;
    return {
      url: frUrl,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      images: [`${baseUrl}/images/sections/${verticalImages[v]}.jpg`],
      alternates: {
        languages: {
          en: enUrl,
          fr: frUrl,
          'x-default': enUrl,
        },
      },
    };
  });

  // Agriculture dedicated page
  const agriculturePages = [
    {
      url: `${baseUrl}/subsidiaries/agriculture`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.85,
      images: [`${baseUrl}/images/sections/comp-agri-aerial.jpg`],
      alternates: {
        languages: {
          en: `${baseUrl}/subsidiaries/agriculture`,
          fr: `${baseUrl}/fr${frSubsPath}/agriculture`,
          'x-default': `${baseUrl}/subsidiaries/agriculture`,
        },
      },
    },
    {
      url: `${baseUrl}/fr${frSubsPath}/agriculture`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      images: [`${baseUrl}/images/sections/comp-agri-aerial.jpg`],
      alternates: {
        languages: {
          en: `${baseUrl}/subsidiaries/agriculture`,
          fr: `${baseUrl}/fr${frSubsPath}/agriculture`,
          'x-default': `${baseUrl}/subsidiaries/agriculture`,
        },
      },
    },
  ];

  // Case study pages
  const caseStudyPages = caseStudies.map((cs) => ({
    url: `${baseUrl}/case-studies/${cs.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.85,
    images: [`${baseUrl}${cs.heroImage}`],
  }));

  // Harch Atelier dedicated subsidiary page (EN + FR alternates)
  const atelierPages = [
    {
      url: `${baseUrl}/subsidiaries/atelier`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.85,
      images: [`${baseUrl}/images/real/industrial-operations.jpg`],
      alternates: {
        languages: {
          en: `${baseUrl}/subsidiaries/atelier`,
          fr: `${baseUrl}/fr${frSubsPath}/atelier`,
          'x-default': `${baseUrl}/subsidiaries/atelier`,
        },
      },
    },
    {
      url: `${baseUrl}/fr${frSubsPath}/atelier`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      images: [`${baseUrl}/images/real/industrial-operations.jpg`],
      alternates: {
        languages: {
          en: `${baseUrl}/subsidiaries/atelier`,
          fr: `${baseUrl}/fr${frSubsPath}/atelier`,
          'x-default': `${baseUrl}/subsidiaries/atelier`,
        },
      },
    },
  ];

  // Research dossier pages
  const researchSlugs = [
    'solaire-epc-b2b',
    'mre-services',
    'retreat-yoga-essaouira',
    'conchyliculture-dakhla',
    'cosmetique-argan-cbd',
    'mro-industriel',
    'export-artisanat-terroir',
  ];
  const researchPages = researchSlugs.map((slug) => ({
    url: `${baseUrl}/research/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  // Glossary pages (SEO)
  const { glossaryTerms } = require('@/data/glossary-terms');
  const glossaryPages = glossaryTerms.map((term: any) => ({
    url: `${baseUrl}/glossary/${term.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // SEO programmatic pages: morocco locations, comparisons, use cases
  const { moroccanCities, serviceLines, comparisons, useCases } = require('@/data/seo-pages');

  const moroccoIndexPage = [{ url: `${baseUrl}/morocco`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.85 }];

  const moroccoCityPages = moroccanCities.map((city: any) => ({
    url: `${baseUrl}/morocco/${city.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const moroccoCityServicePages = moroccanCities.flatMap((city: any) =>
    serviceLines.map((service: any) => ({
      url: `${baseUrl}/morocco/${city.slug}/${service.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    }))
  );

  const compareIndexPage = [{ url: `${baseUrl}/compare`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8 }];

  const comparePages = comparisons.map((comp: any) => ({
    url: `${baseUrl}/compare/${comp.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  const useCasesIndexPage = [{ url: `${baseUrl}/use-cases`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8 }];

  const useCasePages = useCases.map((uc: any) => ({
    url: `${baseUrl}/use-cases/${uc.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  // FAQ and calculator pages
  const { faqPages, calculators } = require('@/data/faq-calculators');

  const faqIndexPage = [{ url: `${baseUrl}/faq`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8 }];

  const faqPagesUrls = faqPages.map((faq: any) => ({
    url: `${baseUrl}/faq/${faq.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  const calcIndexPage = [{ url: `${baseUrl}/calculators`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8 }];

  const calcPages = calculators.map((calc: any) => ({
    url: `${baseUrl}/calculators/${calc.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  // Pricing, blog, and guides pages
  const { generatePricingPages, blogArticles, guides } = require('@/data/pricing-blog-guides');

  const pricingPages = generatePricingPages().map((p: any) => ({
    url: `${baseUrl}/pricing/${p.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const learnIndexPage = [{ url: `${baseUrl}/learn`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8 }];

  const learnPages = blogArticles.map((article: any) => ({
    url: `${baseUrl}/learn/${article.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  const guidesIndexPage = [{ url: `${baseUrl}/guides`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8 }];

  const guidePages = guides.map((guide: any) => ({
    url: `${baseUrl}/guides/${guide.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  // Alternatives/best-of pages
  const { alternativesPages } = require('@/data/alternatives-pages');

  const alternativesIndexPage = [{ url: `${baseUrl}/alternatives`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8 }];

  const alternativesPagesUrls = alternativesPages.map((page: any) => ({
    url: `${baseUrl}/alternatives/${page.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  return [
    ...generateEntries(staticPages),
    ...generateEntries(trustPages),
    ...generateEntries(legalPages),
    ...generateEntries(docsPages),
    ...generateEntries(devPages),
    ...generateEntries(businessPages),
    ...generateEntries(companyPages),
    ...generateEntries(resourcePages),
    ...blogPages,
    ...newsroomPages,
    ...engBlogPages,
    ...verticalPages,
    ...frVerticalPages,
    ...agriculturePages,
    ...atelierPages,
    ...caseStudyPages,
    ...researchPages,
    ...glossaryPages,
    ...moroccoIndexPage,
    ...moroccoCityPages,
    ...moroccoCityServicePages,
    ...compareIndexPage,
    ...comparePages,
    ...useCasesIndexPage,
    ...useCasePages,
    ...faqIndexPage,
    ...faqPagesUrls,
    ...calcIndexPage,
    ...calcPages,
    ...pricingPages,
    ...learnIndexPage,
    ...learnPages,
    ...guidesIndexPage,
    ...guidePages,
    ...alternativesIndexPage,
    ...alternativesPagesUrls,
    // Generated SEO pages
    ...(require('@/data/generated/glossary-expanded').expandedGlossaryTerms.map((t: any) => ({ url: `${baseUrl}/glossary/${t.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.65 }))),
    ...(require('@/data/generated/best-gpu-pages').bestGpuPages.map((p: any) => ({ url: `${baseUrl}/best-gpu-for/${p.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7 }))),
    ...(require('@/data/generated/faq-expanded').expandedFaqPages.map((f: any) => ({ url: `${baseUrl}/faq/${f.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7 }))),
    ...(require('@/data/generated/use-cases-expanded').expandedUseCases.map((u: any) => ({ url: `${baseUrl}/use-cases/${u.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7 }))),
    ...(require('@/data/generated/how-to-pages').howToPages.map((p: any) => ({ url: `${baseUrl}/how-to/${p.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7 }))),
    ...(require('@/data/generated/what-is-pages').whatIsPages.map((p: any) => ({ url: `${baseUrl}/what-is/${p.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7 }))),
    ...(require('@/data/generated/vs-pages').vsPages.map((p: any) => ({ url: `${baseUrl}/vs/${p.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7 }))),
    // Phase 2 generated pages
    ...(require('@/data/generated/glossary-expanded-2').glossaryExpanded2.map((t: any) => ({ url: `${baseUrl}/glossary/${t.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.6 }))),
    ...(require('@/data/generated/how-to-pages-2').howToPages2.map((p: any) => ({ url: `${baseUrl}/how-to/${p.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.65 }))),
    ...(require('@/data/generated/vs-pages-2').vsPages2.map((p: any) => ({ url: `${baseUrl}/vs/${p.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.65 }))),
    ...(require('@/data/generated/solar-seo-pages').solarSeoPages.map((p: any) => ({ url: `${baseUrl}/solar/${p.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.75 }))),
    // Phase 3 solar-specific pages
    ...(require('@/data/generated/solar-city-pages').solarCityPages.map((p: any) => ({ url: `${baseUrl}/solar-city/${p.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.75 }))),
    ...(require('@/data/generated/solar-industry-pages').solarIndustryPages.map((p: any) => ({ url: `${baseUrl}/solar-industry/${p.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7 }))),
    ...(require('@/data/generated/energy-articles').energyArticles.map((p: any) => ({ url: `${baseUrl}/energy-blog/${p.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.75 }))),
    ...(require('@/data/generated/solar-faq-pages').solarFaqPages.map((p: any) => ({ url: `${baseUrl}/solar-faq/${p.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7 }))),
    ...(require('@/data/generated/solar-comparison-pages').solarComparisonPages.map((p: any) => ({ url: `${baseUrl}/solar-compare/${p.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7 }))),
    ...(require('@/data/generated/morocco-solar-pages').moroccoSolarPages.map((p: any) => ({ url: `${baseUrl}/morocco-solar/${p.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.75 }))),
    // Phase 4 solar-specific pages
    ...(require('@/data/generated/solar-size-pages').solarSizePages.map((p: any) => ({ url: `${baseUrl}/solar-size/${p.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.75 }))),
    ...(require('@/data/generated/solar-calculator-pages').solarCalculatorPages.map((p: any) => ({ url: `${baseUrl}/solar-calc/${p.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7 }))),
    ...(require('@/data/generated/solar-guide-pages').solarGuidePages.map((p: any) => ({ url: `${baseUrl}/solar-guides/${p.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7 }))),
    ...(require('@/data/generated/solar-usecase-pages').solarUseCasePages.map((p: any) => ({ url: `${baseUrl}/solar-usecase/${p.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.75 }))),
    ...(require('@/data/generated/energy-articles-2').energyArticles2.map((p: any) => ({ url: `${baseUrl}/energy-blog-2/${p.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7 }))),
    // Phase 5 generated pages
    ...(require('@/data/generated/solar-city-industry-pages').solarCityIndustryPages.map((p: any) => ({ url: `${baseUrl}/solar-city-industry/${p.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7 }))),
    ...(require('@/data/generated/energy-articles-3').energyArticles3.map((p: any) => ({ url: `${baseUrl}/energy-blog-3/${p.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7 }))),
    ...(require('@/data/generated/solar-subsidy-pages').solarSubsidyPages.map((p: any) => ({ url: `${baseUrl}/solar-subsidy/${p.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.75 }))),
    ...(require('@/data/generated/solar-brand-pages').solarBrandPages.map((p: any) => ({ url: `${baseUrl}/solar-brand/${p.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7 }))),
    // Phase 6: Keyword landing pages (100 real search queries)
    ...(require('@/data/generated/keyword-landing-pages').keywordLandingPages.map((p: any) => ({ url: `${baseUrl}/kw/${p.slug}`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.85 }))),
    // GEO/AEO programmatic SEO — Harch Atelier
    { url: `${baseUrl}/geo-glossary`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.85 },
    { url: `${baseUrl}/fr/geo-glossary`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.85 },
    ...(require('@/data/generated/geo-glossary').geoGlossaryTerms.map((t: any) => ({ url: `${baseUrl}/geo-glossary/${t.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.8 }))),
    ...(require('@/data/generated/geo-glossary').geoGlossaryTerms.map((t: any) => ({ url: `${baseUrl}/fr/geo-glossary/${t.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.8 }))),
    { url: `${baseUrl}/geo-faq`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.85 },
    { url: `${baseUrl}/fr/geo-faq`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.85 },
    ...(require('@/data/generated/geo-faq').geoFaqPages.map((f: any) => ({ url: `${baseUrl}/geo-faq/${f.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.8 }))),
    ...(require('@/data/generated/geo-faq').geoFaqPages.map((f: any) => ({ url: `${baseUrl}/fr/geo-faq/${f.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.8 }))),
    // GEO/AEO blog articles — Harch Atelier (10 articles, EN content, accessible from both locales)
    { url: `${baseUrl}/blog/geo-aeo`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.85 },
    { url: `${baseUrl}/fr/blog/geo-aeo`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.85 },
    ...(require('@/data/generated/geo-aeo-articles').geoAeoArticles.map((a: any) => ({
      url: `${baseUrl}/blog/geo-aeo/${a.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.85,
      alternates: {
        languages: {
          en: `${baseUrl}/blog/geo-aeo/${a.slug}`,
          fr: `${baseUrl}/fr/blog/geo-aeo/${a.slug}`,
          'x-default': `${baseUrl}/blog/geo-aeo/${a.slug}`,
        },
      },
    }))),
    ...(require('@/data/generated/geo-aeo-articles').geoAeoArticles.map((a: any) => ({
      url: `${baseUrl}/fr/blog/geo-aeo/${a.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      alternates: {
        languages: {
          en: `${baseUrl}/blog/geo-aeo/${a.slug}`,
          fr: `${baseUrl}/fr/blog/geo-aeo/${a.slug}`,
          'x-default': `${baseUrl}/blog/geo-aeo/${a.slug}`,
        },
      },
    }))),
    // atelier.harchcorp.com — standalone landing page (bypasses i18n)
    { url: `${baseUrl}/atelier`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.9 },
  ];
}
