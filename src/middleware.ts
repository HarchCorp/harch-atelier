// ═══════════════════════════════════════════════════════════════
//  MIDDLEWARE — Harch Atelier
//
//  Three concerns, COMBINED (not replaced):
//
//  1. i18n (next-intl) — Detects locale & rewrites URLs for public
//     marketing pages. With `localePrefix: 'as-needed'`, English (the
//     default locale) has NO prefix; French gets `/fr/`. The next-intl
//     middleware sets the `x-next-intl-locale` request header which
//     `getRequestConfig` (src/i18n/request.ts) reads to load the right
//     messages bundle.
//
//  2. AEGIS security headers (HSTS, X-Frame-Options: DENY,
//     X-Content-Type-Options: nosniff, Referrer-Policy,
//     Permissions-Policy, X-XSS-Protection) — applied to every
//     response that passes through the middleware (including redirects
//     issued by i18n or the auth gate).
//
//  3. Zero-Trust auth gate — uses next-auth/jwt `getToken` to
//     verify the JWT issued by /api/auth/[...nextauth]:
//       • /dashboard/*           → requires session
//       • /api/atelier/*         → requires session
//       • /admin/*               → requires role === "admin"
//     Public API routes (/api/auth/*, /api/cron/*, /api/health)
//     are intentionally excluded so the auth flow and external
//     cron triggers work without a session.
//
//  IMPORTANT — i18n scope:
//     Localized (FR/EN): /atelier/* public pages (pricing, about,
//       contact, blog, customers, etc.) + the root redirect target.
//     NOT localized (English-only private apps):
//       • /atelier/console/*      — the product console
//       • /atelier/admin-x7k2m9   — admin login
//       • /atelier/agency/*       — agency dashboard
//     If a user lands on `/fr/<private-app>`, the middleware 308-redirects
//     to strip the `/fr/` prefix (those apps are English-only).
//     Auth-gated paths (/dashboard/*, /admin/*, /api/atelier/*) are
//     also skipped by i18n.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// ─── next-intl middleware (locale detection + URL rewriting) ─────
const intlMiddleware = createMiddleware(routing);

// ─── AEGIS: Security headers (HarchIQ-DEFEND) ─────────────────────
const SECURITY_HEADERS: Record<string, string> = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "X-XSS-Protection": "1; mode=block",
};

// ─── ROUTE GATES ──────────────────────────────────────────────────
// Public API paths that bypass the zero-trust session check.
// `/api/auth` covers the NextAuth handlers AND the demo auth bypass
// (`/api/auth/demo`, `/api/auth/demo-seed`) - the demo routes do
// their own SETUP_TOKEN / session validation internally.
const PUBLIC_API_PREFIXES = ["/api/auth", "/api/cron", "/api/health"];

// ─── PUBLIC PAGE PATHS ───────────────────────────────────────────
// Pages that bypass the zero-trust session check entirely. The
// Executive Demo landing page (`/atelier/demo`) MUST be public so
// Amine can launch a Comex presentation without an existing
// session - the demo auth bypass happens via /api/auth/demo.
const PUBLIC_PAGE_PATHS = ["/atelier/demo", "/atelier/login", "/atelier/access"];

// ─── PRIVATE APPS (English-only, NO i18n) ────────────────────────
// These are product surfaces that are intentionally English-only.
// next-intl must NOT rewrite them, and a `/fr/<private-app>` URL
// is 308-redirected to strip the locale prefix.
const PRIVATE_APP_PREFIXES = [
  "/atelier/console",
  "/atelier/admin-x7k2m9",
  "/atelier/agency",
  "/atelier/onboarding",
  "/atelier/admin",
  "/atelier/login",
  "/atelier/access",
  "/atelier/forgot-password",
  "/atelier/reset-password",
];

function withSecurityHeaders(res: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    res.headers.set(key, value);
  }
  return res;
}

function isPublicApi(pathname: string): boolean {
  return PUBLIC_API_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

/**
 * Strips a leading `/<locale>` segment (e.g. `/fr`, `/en`) from a
 * pathname, returning the underlying app path. Returns the input
 * unchanged if no locale prefix is present.
 */
function stripLocalePrefix(pathname: string): string {
  return pathname.replace(/^\/(?:en|fr)(?=\/|$)/, "");
}

/**
 * Returns true if the (locale-stripped) path belongs to one of the
 * English-only private apps. We strip the locale prefix first so
 * that `/fr/atelier/console/foo` is correctly detected as private.
 */
function isPrivateApp(pathname: string): boolean {
  const stripped = stripLocalePrefix(pathname);
  return PRIVATE_APP_PREFIXES.some(
    (p) => stripped === p || stripped.startsWith(p + "/"),
  );
}

function isAuthGated(pathname: string): boolean {
  return (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/api/atelier" ||
    pathname.startsWith("/api/atelier/")
  );
}

/**
 * Returns true if the pathname starts with a known locale prefix
 * (`/en/...` or `/fr/...`). Used to decide whether to strip the
 * prefix when redirecting away from a private app.
 */
function hasLocalePrefix(pathname: string): boolean {
  return /^\/(?:en|fr)(?=\/|$)/.test(pathname);
}

/**
 * Returns the sign-in URL for the current request, preserving the
 * original path as `?callbackUrl=` so the login flow can bounce
 * the user back to where they came from.
 */
function buildSignInUrl(req: NextRequest): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = "/atelier/contact";
  url.search = "";
  url.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
  return withSecurityHeaders(NextResponse.redirect(url));
}

/**
 * Verify the NextAuth JWT. The secret MUST match the one used by
 * /api/auth/[...nextauth] (NEXTAUTH_SECRET env var). Returns null
 * if there's no token, the JWT is invalid, or the secret is missing.
 */
async function getAuthSession(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return null;
  try {
    return await getToken({ req, secret });
  } catch {
    return null;
  }
}

// ─── MAIN MIDDLEWARE ──────────────────────────────────────────────

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // ─── 1. Private apps: English-only, NO i18n ──────────────────
  // If the user somehow landed on `/fr/<private-app>`, 308-redirect
  // to strip the locale prefix. Otherwise just pass through with
  // security headers (these apps handle their own auth client-side
  // or via /api/atelier/* which is gated separately).
  if (isPrivateApp(path)) {
    if (hasLocalePrefix(path)) {
      const url = req.nextUrl.clone();
      url.pathname = stripLocalePrefix(path);
      return withSecurityHeaders(NextResponse.redirect(url, 308));
    }
    return withSecurityHeaders(NextResponse.next());
  }

  // ─── 2. Zero-Trust auth gate (also NO i18n) ──────────────────
  // Applies to /dashboard/*, /api/atelier/* (except public APIs),
  // and /admin/* (also requires role === "admin").
  if (isAuthGated(path)) {
    if (isPublicApi(path)) {
      // Let the request fall through with security headers.
      return withSecurityHeaders(NextResponse.next());
    }

    const token = await getAuthSession(req);

    if (!token) {
      // API requests get 401 JSON; pages get redirected to contact.
      const isAtelierApi = path === "/api/atelier" || path.startsWith("/api/atelier/");
      if (isAtelierApi) {
        return withSecurityHeaders(
          NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 },
          ),
        );
      }
      return buildSignInUrl(req);
    } else if ((path === "/admin" || path.startsWith("/admin/") || path === "/atelier/admin" || path.startsWith("/atelier/admin/")) && token.role !== "admin" && token.role !== "super_admin") {
      // Authenticated but not an admin.
      if (path.startsWith("/api/")) {
        return withSecurityHeaders(
          NextResponse.json(
            { success: false, error: "Forbidden — admin role required" },
            { status: 403 },
          ),
        );
      }
      const url = req.nextUrl.clone();
      url.pathname = "/atelier/console";
      url.search = "";
      return withSecurityHeaders(NextResponse.redirect(url));
    }

    return withSecurityHeaders(NextResponse.next());
  }

  // ─── 3. i18n: locale detection + URL prefix handling ─────────
  // We delegate locale detection to next-intl's `createMiddleware`
  // (it handles Accept-Language negotiation, the NEXT_LOCALE cookie,
  // and the URL prefix). HOWEVER, next-intl v4 assumes a `[locale]`
  // segment exists in app/ (it internally rewrites `/atelier/pricing`
  // → `/en/atelier/pricing`). We don't have a `[locale]` segment —
  // atelier routes live at `app/atelier/*` directly. So we intercept
  // next-intl's response and rewrite to the underlying path (stripping
  // any `/<locale>/` prefix) while preserving the `x-next-intl-locale`
  // request header that `getRequestConfig` (src/i18n/request.ts) reads
  // to load the correct messages bundle.
  const intlResponse = await intlMiddleware(req);
  const detectedLocale = intlResponse.headers.get(
    "x-middleware-request-x-next-intl-locale",
  );

  // If next-intl issued a redirect (e.g. /atelier/pricing → /fr/atelier/pricing
  // because the user's Accept-Language prefers FR), let it pass through.
  // The browser will follow it and re-enter the middleware with the new URL.
  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    return withSecurityHeaders(intlResponse);
  }

  // Compute the underlying app path (strip /<locale>/ prefix if present).
  // For the default locale (en) there's no prefix to strip — next-intl
  // already rewrote /atelier/pricing → /en/atelier/pricing internally,
  // so we strip the /en/ it added. For non-default locales (fr) the
  // URL is /fr/atelier/pricing and next-intl passes it through; we
  // strip /fr/ so it matches app/atelier/pricing/page.tsx.
  const underlyingPath = stripLocalePrefix(path);

  // Build a rewrite to the underlying path, propagating the detected
  // locale to `getRequestConfig` via the `x-next-intl-locale` request
  // header (this is the same header next-intl sets internally).
  const rewriteUrl = req.nextUrl.clone();
  rewriteUrl.pathname = underlyingPath;
  const requestHeaders = new Headers(req.headers);
  if (detectedLocale) {
    requestHeaders.set("x-next-intl-locale", detectedLocale);
  }
  const rewriteRes = NextResponse.rewrite(rewriteUrl, {
    request: { headers: requestHeaders },
  });

  // Preserve next-intl's `Link` header (hreflang alternates) for SEO
  // and the `NEXT_LOCALE` cookie (used to remember the user's choice
  // across visits) if next-intl set them.
  const linkHeader = intlResponse.headers.get("link");
  if (linkHeader) rewriteRes.headers.set("link", linkHeader);
  const setCookie = intlResponse.headers.get("set-cookie");
  if (setCookie) rewriteRes.headers.set("set-cookie", setCookie);

  return withSecurityHeaders(rewriteRes);
}

export const config = {
  matcher: [
    // ─── Zero-Trust gates ────────────────────────────────────────
    "/dashboard",
    "/dashboard/:path*",
    "/admin",
    "/admin/:path*",
    "/api/atelier",
    "/api/atelier/:path*",
    // ─── Default catch-all (i18n + security headers) ────────────
    // Excludes /api, /_next, /_vercel, static asset files, AND the
    // English-only private apps. Note: /fr/<private-app> is still
    // matched here so the middleware can 308-redirect to strip the
    // locale prefix — see isPrivateApp() above.
    "/((?!api|_next|_vercel|favicon|robots|sitemap|feed|.*\\..*).*)",
  ],
};
