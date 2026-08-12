import { MetadataRoute } from 'next';
import { ARTICLES } from './atelier/blog/articles';

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
  { path: '/atelier/products/integrations', priority: 0.8, changefreq: 'monthly' },
  { path: '/atelier/products/reputation-dashboards', priority: 0.8, changefreq: 'monthly' },
  { path: '/atelier/products/api-mcp', priority: 0.8, changefreq: 'monthly' },
  { path: '/atelier/products/enterprise-risk-intelligence', priority: 0.8, changefreq: 'monthly' },
  { path: '/atelier/customers', priority: 0.8, changefreq: 'monthly' },
  { path: '/atelier/pricing', priority: 0.9, changefreq: 'monthly' },
  { path: '/atelier/audit', priority: 0.9, changefreq: 'monthly' },
  { path: '/atelier/flagship-report', priority: 0.9, changefreq: 'monthly' },
  { path: '/atelier/audit', priority: 0.7, changefreq: 'monthly' },
  // Company / about
  { path: '/atelier/about', priority: 0.7, changefreq: 'monthly' },
  { path: '/atelier/careers', priority: 0.6, changefreq: 'weekly' },
  { path: '/atelier/changelog', priority: 0.6, changefreq: 'weekly' },
  // Methodology & trust
  { path: '/atelier/method', priority: 0.8, changefreq: 'monthly' },
  { path: '/atelier/approach', priority: 0.8, changefreq: 'monthly' },
  { path: '/atelier/approach/our-ai', priority: 0.7, changefreq: 'monthly' },
  { path: '/atelier/approach/our-commitment', priority: 0.7, changefreq: 'monthly' },
  { path: '/atelier/approach/our-data', priority: 0.7, changefreq: 'monthly' },
  { path: '/atelier/expertise', priority: 0.8, changefreq: 'monthly' },
  { path: '/atelier/expertise/regulation', priority: 0.7, changefreq: 'monthly' },
  { path: '/atelier/expertise/reputation-risk', priority: 0.7, changefreq: 'monthly' },
  { path: '/atelier/expertise/pr-comms', priority: 0.7, changefreq: 'monthly' },
  { path: '/atelier/expertise/enterprise-risk', priority: 0.7, changefreq: 'monthly' },
  { path: '/atelier/expertise/esg', priority: 0.7, changefreq: 'monthly' },
  { path: '/atelier/trust', priority: 0.7, changefreq: 'monthly' },
  { path: '/atelier/security', priority: 0.7, changefreq: 'monthly' },
  { path: '/atelier/intelligence', priority: 0.7, changefreq: 'monthly' },
  { path: '/atelier/resilience', priority: 0.7, changefreq: 'monthly' },
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
  { path: '/atelier/news', priority: 0.7, changefreq: 'weekly' },
  { path: '/atelier/insight-reports', priority: 0.7, changefreq: 'weekly' },
  { path: '/atelier/insight-reports/reputation-risk', priority: 0.7, changefreq: 'monthly' },
  { path: '/atelier/insight-reports/media-impact', priority: 0.7, changefreq: 'monthly' },
  { path: '/atelier/insight-reports/deep-dive', priority: 0.7, changefreq: 'monthly' },
  { path: '/atelier/insight-reports/risk', priority: 0.7, changefreq: 'monthly' },
  { path: '/atelier/insight-reports/reputation', priority: 0.7, changefreq: 'monthly' },
  { path: '/atelier/blog', priority: 0.7, changefreq: 'weekly' },
  { path: '/atelier/faq', priority: 0.6, changefreq: 'monthly' },
  { path: '/atelier/glossary', priority: 0.6, changefreq: 'monthly' },
  { path: '/atelier/templates', priority: 0.6, changefreq: 'monthly' },
  { path: '/atelier/templates/institutional-audit', priority: 0.6, changefreq: 'monthly' },
  { path: '/atelier/api-docs', priority: 0.6, changefreq: 'monthly' },
  // Harch 100 ranking
  { path: '/atelier/harch-100', priority: 0.9, changefreq: 'weekly' },
  // Compare / companies
  { path: '/atelier/compare', priority: 0.6, changefreq: 'monthly' },
  { path: '/atelier/companies', priority: 0.8, changefreq: 'weekly' },
  // Public labs
  { path: '/atelier/lab/linguistic-matrix', priority: 0.5, changefreq: 'monthly' },
  { path: '/atelier/lab/whatsapp-inbound', priority: 0.5, changefreq: 'monthly' },
  { path: '/atelier/lab/command-center', priority: 0.5, changefreq: 'monthly' },
  { path: '/atelier/lab/hespress', priority: 0.5, changefreq: 'monthly' },
  // Access flows
  { path: '/atelier/demo', priority: 0.6, changefreq: 'monthly' },
  { path: '/atelier/access', priority: 0.6, changefreq: 'monthly' },
  { path: '/atelier/request-access', priority: 0.6, changefreq: 'monthly' },
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
// Slugs MUST match the actual route folder under
// src/app/atelier/industries/<slug>/page.tsx (telecom, not telecommunications).
const INDUSTRIES = [
  'banking',
  'telecom',
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

  // ─── Blog article pages (15 SEO articles) ──────────────────────
  const blogEntries: MetadataRoute.Sitemap = ARTICLES.map(article => ({
    url: `${BASE_URL}/atelier/blog/${article.slug}`,
    lastModified: new Date(article.date),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticEntries, ...companyEntries, ...industryEntries, ...blogEntries];
}
