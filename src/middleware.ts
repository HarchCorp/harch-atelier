// ═══════════════════════════════════════════════════════════════
//  MIDDLEWARE — PROJECT AEGIS v4.0
//
//  This middleware composes three concerns without breaking the
//  existing atelier subdomain + next-intl i18n routing:
//
//  1. AEGIS security headers (HSTS, X-Frame-Options: DENY,
//     X-Content-Type-Options: nosniff, Referrer-Policy,
//     Permissions-Policy, X-XSS-Protection) — applied to every
//     response that passes through the middleware.
//
//  2. Atelier subdomain rewriting — atelier.harchcorp.com / atelier.*
//     rewrites `/` to `/atelier` and lets everything else fall
//     through. Static assets, Next internals and API routes are
//     never rewritten.
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
//  The existing next-intl i18n middleware runs for the default
//  domain in the fallback branch.
// ═══════════════════════════════════════════════════════════════

import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { routing } from "./i18n/routing";

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
//   • /api/auth/*    — login, register, callback, csrf
//   • /api/cron/*    — Vercel cron triggers (CRON_SECRET gated in route)
//   • /api/health    — public liveness probe
const PUBLIC_API_PREFIXES = ["/api/auth", "/api/cron", "/api/health"];

// Paths that bypass i18n (served directly from src/app/<path>/page.tsx)
const STATIC_PATHS = ["/atelier"];

function isStaticPath(pathname: string): boolean {
  return STATIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

function withSecurityHeaders(res: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    res.headers.set(key, value);
  }
  return res;
}

// ─── Zero-Trust helpers ───────────────────────────────────────────

function isPublicApi(pathname: string): boolean {
  return PUBLIC_API_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

/**
 * Returns the sign-in URL for the current request, preserving the
 * original path as `?callbackUrl=` so the login flow can bounce
 * the user back to where they came from.
 */
function buildSignInUrl(req: NextRequest): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  url.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
  return withSecurityHeaders(NextResponse.redirect(url));
}

/**
 * Verify the NextAuth JWT. The secret MUST match the one used by
 * /api/auth/[...nextauth] (NEXTAUTH_SECRET env var). Returns null
 * if there's no token, the JWT is invalid, or the secret is missing
 * — the caller decides whether to gate based on the result.
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
  const host = req.headers.get("host") || "";
  const path = req.nextUrl.pathname;
  const isAtelierSubdomain =
    host.startsWith("atelier.harchcorp.com") ||
    host.startsWith("atelier.localhost") ||
    host.startsWith("atelier.");

  // ─── Zero-Trust auth gate (runs before subdomain / i18n) ──────
  // Applies to /dashboard/*, /api/atelier/* (except public APIs),
  // and /admin/* (also requires role === "admin").
  const isDashboard = path === "/dashboard" || path.startsWith("/dashboard/");
  const isAdmin = path === "/admin" || path.startsWith("/admin/");
  const isAtelierApi = path === "/api/atelier" || path.startsWith("/api/atelier/");

  if (isDashboard || isAdmin || isAtelierApi) {
    // Public API prefixes (/api/auth, /api/cron, /api/health) bypass
    // the zero-trust check — they have their own auth mechanism
    // (CRON_SECRET) or are intentionally public (login, health).
    if (isPublicApi(path)) {
      // Let the request fall through to the subdomain / i18n handler.
    } else {
      const token = await getAuthSession(req);

      if (!token) {
        // API requests get 401 JSON; pages get redirected to /login.
        if (isAtelierApi) {
          return withSecurityHeaders(
            NextResponse.json(
              { success: false, error: "Unauthorized" },
              { status: 401 },
            ),
          );
        }
        return buildSignInUrl(req);
      } else if (isAdmin && token.role !== "admin") {
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
        url.pathname = "/atelier/dashboard";
        url.search = "";
        return withSecurityHeaders(NextResponse.redirect(url));
      }
    }
  }

  // ─── ATELIER SUBDOMAIN ────────────────────────────────────────
  if (isAtelierSubdomain) {
    if (
      path.startsWith("/api") ||
      path.startsWith("/_next") ||
      path.startsWith("/_vercel") ||
      path.includes(".")
    ) {
      return withSecurityHeaders(NextResponse.next());
    }
    if (path === "/") {
      const url = req.nextUrl.clone();
      url.pathname = "/atelier";
      return withSecurityHeaders(NextResponse.rewrite(url));
    }
    return withSecurityHeaders(NextResponse.next());
  }

  // ─── STATIC PATHS (bypass i18n) ───────────────────────────────
  if (isStaticPath(path)) {
    return withSecurityHeaders(NextResponse.next());
  }

  // ─── DEFAULT: next-intl middleware ────────────────────────────
  const res = intlMiddleware(req);
  return withSecurityHeaders(res);
}

export const config = {
  matcher: [
    "/",
    "/(fr|en)/:path*",
    // ─── Zero-Trust gates ────────────────────────────────────────
    // Explicit entries so the auth check fires on these paths even
    // though the catch-all below excludes /api.
    "/dashboard",
    "/dashboard/:path*",
    "/admin",
    "/admin/:path*",
    "/api/atelier",
    "/api/atelier/:path*",
    // ─── Default catch-all (i18n + subdomain + security headers) ─
    "/((?!api|_next|_vercel|launch|style-guide|dossiers|pdfs|images|favicon|robots|sitemap|video-sitemap|manifesto|console|data-room|glossary|morocco|compare|use-cases|calculators|faq|learn|guides|pricing|alternatives|energy|best-gpu-for|how-to|what-is|vs|solar|solar-city|solar-industry|energy-blog|solar-faq|solar-compare|morocco-solar|solar-size|solar-calc|solar-guides|solar-usecase|energy-blog-2|solar-city-industry|energy-blog-3|solar-subsidy|solar-brand|kw|.*\\..*).*)",
  ],
};
