import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// ═══════════════════════════════════════════════════════════════
//  NEXT.CONFIG — Harch Atelier (atelier.harchcorp.com)
//
//  This repo deploys the Atelier product with FR/EN i18n (next-intl).
//  Public marketing pages (/atelier/pricing, /about, /contact...) are
//  localized; private apps (/atelier/console/*, /atelier/admin-x7k2m9,
//  /atelier/agency) remain English-only and bypass i18n.
//
//  Key config:
//  • next-intl plugin wired to ./src/i18n/request.ts
//  • / → 308 permanent redirect to /atelier (SEO link equity)
//  • standalone output (Vercel-friendly)
//  • AEGIS security headers + strict CSP
//  • Images: only atelier.harchcorp.com allowed as remote pattern
// ═══════════════════════════════════════════════════════════════

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  devIndicators: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'atelier.harchcorp.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://atelier.harchcorp.com; connect-src 'self' https://atelier.harchcorp.com https://vitals.vercel-insights.com; worker-src 'self' blob:;",
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // ─── Root redirect: / → /atelier (308 permanent) ──────────
      {
        source: '/',
        destination: '/atelier',
        permanent: true,
      },
      // ─── Old console route names → new 4-offer names ──────────
      {
        source: '/atelier/console/enterprise',
        destination: '/atelier/console/brand-monitor',
        permanent: true,
      },
      {
        source: '/atelier/console/trader',
        destination: '/atelier/console/harch-alpha',
        permanent: true,
      },
      {
        source: '/atelier/console/investor',
        destination: '/atelier/console/investment-bank',
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
