import { MetadataRoute } from 'next';

// ═══════════════════════════════════════════════════════════════
//  SITEMAP.XML — Harch Atelier (atelier.harchcorp.com)
//
//  Generates the sitemap for ALL Atelier routes. No harch-corp
//  routes are included — those belong to the separate harch-corp
//  repo deployed on harchcorp.com.
//
//  Routes are declared explicitly (not scraped from filesystem) so
//  we have full control over what gets indexed.
// ═══════════════════════════════════════════════════════════════

const BASE_URL = 'https://atelier.harchcorp.com';

// ─── Static routes (priority + change frequency) ─────────────────
const STATIC_ROUTES: { path: string; priority: number; changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly' }[] = [
  // Core marketing pages
  { path: '/atelier', priority: 1.0, changefreq: 'weekly' },
  { path: '/atelier/products', priority: 0.9, changefreq: 'monthly' },
  { path: '/atelier/customers', priority: 0.8, changefreq: 'monthly' },
  { path: '/atelier/pricing', priority: 0.9, changefreq: 'monthly' },
  { path: '/atelier/audit', priority: 0.9, changefreq: 'monthly' },
  { path: '/atelier/contact', priority: 0.7, changefreq: 'monthly' },
  // Company / about
  { path: '/atelier/about', priority: 0.7, changefreq: 'monthly' },
  { path: '/atelier/careers', priority: 0.6, changefreq: 'weekly' },
  { path: '/atelier/changelog', priority: 0.6, changefreq: 'weekly' },
  // Methodology & trust
  { path: '/atelier/method', priority: 0.8, changefreq: 'monthly' },
  { path: '/atelier/approach', priority: 0.8, changefreq: 'monthly' },
  { path: '/atelier/expertise', priority: 0.8, changefreq: 'monthly' },
  { path: '/atelier/trust', priority: 0.7, changefreq: 'monthly' },
  { path: '/atelier/security', priority: 0.7, changefreq: 'monthly' },
  // Solutions & use cases
  { path: '/atelier/solutions', priority: 0.8, changefreq: 'monthly' },
  { path: '/atelier/use-cases', priority: 0.8, changefreq: 'monthly' },
  { path: '/atelier/industries', priority: 0.8, changefreq: 'weekly' },
  { path: '/atelier/decision-augmentation', priority: 0.7, changefreq: 'monthly' },
  { path: '/atelier/reputation-tracker', priority: 0.7, changefreq: 'monthly' },
  { path: '/atelier/risk-tracker', priority: 0.7, changefreq: 'monthly' },
  { path: '/atelier/media-intelligence', priority: 0.7, changefreq: 'monthly' },
  { path: '/atelier/ask-harchiq', priority: 0.7, changefreq: 'monthly' },
  // Resources
  { path: '/atelier/resources', priority: 0.7, changefreq: 'weekly' },
  { path: '/atelier/insights', priority: 0.7, changefreq: 'weekly' },
  { path: '/atelier/insight-reports', priority: 0.7, changefreq: 'weekly' },
  { path: '/atelier/blog', priority: 0.7, changefreq: 'weekly' },
  { path: '/atelier/faq', priority: 0.6, changefreq: 'monthly' },
  { path: '/atelier/glossary', priority: 0.6, changefreq: 'monthly' },
  { path: '/atelier/templates', priority: 0.6, changefreq: 'monthly' },
  // Harch 100 ranking
  { path: '/atelier/harch-100', priority: 0.9, changefreq: 'weekly' },
  // Compare / companies
  { path: '/atelier/compare', priority: 0.6, changefreq: 'monthly' },
  { path: '/atelier/companies', priority: 0.8, changefreq: 'weekly' },
  // Legal
  { path: '/atelier/legal', priority: 0.4, changefreq: 'yearly' },
  // Partners
  { path: '/atelier/partners', priority: 0.6, changefreq: 'monthly' },
];

// ─── Company detail pages (real scraped companies in Harch 100) ──
const COMPANIES = [
  'ocp-group',
  'attijariwafa-bank',
  'bank-of-africa',
  'maroc-telecom',
  'royal-air-maroc',
];

// ─── Industry detail pages ───────────────────────────────────────
const INDUSTRIES = [
  'banking',
  'telecommunications',
  'mining',
  'energy',
  'retail',
  'aviation',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(route => ({
    url: `${BASE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changefreq,
    priority: route.priority,
  }));

  const companyEntries: MetadataRoute.Sitemap = COMPANIES.map(slug => ({
    url: `${BASE_URL}/atelier/companies/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const industryEntries: MetadataRoute.Sitemap = INDUSTRIES.map(slug => ({
    url: `${BASE_URL}/atelier/industries/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticEntries, ...companyEntries, ...industryEntries];
}
