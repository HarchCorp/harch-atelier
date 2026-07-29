import { MetadataRoute } from 'next';

// ═══════════════════════════════════════════════════════════════
//  ROBOTS.TXT — Harch Atelier (atelier.harchcorp.com)
//
//  This repo deploys ONLY the Atelier product. All routes are under
//  /atelier/* (plus the root redirect to /atelier). No harch-corp
//  routes should be referenced here.
// ═══════════════════════════════════════════════════════════════

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/atelier/audit/received'],
      },
      // ─── Search engines ──────────────────────────────────────
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
      },
      {
        userAgent: 'YandexBot',
        allow: '/',
      },
      {
        userAgent: 'DuckDuckBot',
        allow: '/',
      },
      // ─── Social crawlers ─────────────────────────────────────
      {
        userAgent: 'Twitterbot',
        allow: '/',
      },
      {
        userAgent: 'facebookexternalhit',
        allow: '/',
      },
      {
        userAgent: 'LinkedInBot',
        allow: '/',
      },
      {
        userAgent: 'Applebot',
        allow: '/',
      },
      {
        userAgent: 'Slackbot',
        allow: '/',
      },
      {
        userAgent: 'Discordbot',
        allow: '/',
      },
      {
        userAgent: 'TelegramBot',
        allow: '/',
      },
      {
        userAgent: 'WhatsApp',
        allow: '/',
      },
      // ─── AI crawlers (allowed for AI visibility research) ────
      {
        userAgent: 'GPTBot',
        allow: '/',
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
      },
      {
        userAgent: 'Claude-Web',
        allow: '/',
      },
      {
        userAgent: 'anthropic-ai',
        allow: '/',
      },
      {
        userAgent: 'CCBot',
        allow: '/',
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
      },
    ],
    sitemap: 'https://atelier.harchcorp.com/sitemap.xml',
    host: 'https://atelier.harchcorp.com',
  };
}
