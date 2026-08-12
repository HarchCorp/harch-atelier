import { MetadataRoute } from 'next';

// ═══════════════════════════════════════════════════════════════
//  ROBOTS.TXT — Harch Atelier (atelier.harchcorp.com)
//
//  This repo deploys ONLY the Atelier product. All routes are under
//  /atelier/* (plus the root redirect to /atelier). No harch-corp
//  routes should be referenced here.
// ═══════════════════════════════════════════════════════════════

// ─── Disallow list (private / auth-gated / no SEO value) ─────────
// Applied to every user-agent. Public pages stay explicitly allowed.
const PRIVATE_PATHS = [
  '/api/',
  '/_next/',
  // Auth-gated console dashboards (no SEO value, login walls)
  '/atelier/console/',
  '/atelier/console',
  // Agency & client portals (auth-gated, branded per-tenant)
  '/atelier/agency',
  '/atelier/console/essential',
  '/atelier/console/pro',
  '/atelier/console/enterprise',
  '/atelier/console/agency',
  // Admin surfaces (never index)
  '/atelier/admin',
  '/atelier/admin-x7k2m9',
  // Auth / onboarding flows (no indexable content)
  '/atelier/login',
  '/atelier/onboarding',
  '/atelier/dashboard',
  // Health probe (internal only)
  '/atelier/health',
  // Post-submit audit receipt (no static content)
  '/atelier/audit/received',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      // ─── Search engines ──────────────────────────────────────
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: 'YandexBot',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: 'DuckDuckBot',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      // ─── Social crawlers ─────────────────────────────────────
      {
        userAgent: 'Twitterbot',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: 'facebookexternalhit',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: 'LinkedInBot',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: 'Applebot',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: 'Slackbot',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: 'Discordbot',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: 'TelegramBot',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: 'WhatsApp',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      // ─── AI crawlers (allowed for AI visibility research) ────
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: 'Claude-Web',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: 'anthropic-ai',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: 'CCBot',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
    ],
    sitemap: 'https://atelier.harchcorp.com/sitemap.xml',
    host: 'https://atelier.harchcorp.com',
  };
}
