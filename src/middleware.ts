// ═══════════════════════════════════════════════════════════════
//  MIDDLEWARE — Harch Atelier (simplified, no i18n)
//
//  This repo is the Atelier product deployment. No more harch-corp
//  routes, no more [locale] i18n routing — just /atelier/* and APIs.
//
//  Two concerns:
//  1. AEGIS security headers (HSTS, X-Frame-Options: DENY,
//     X-Content-Type-Options: nosniff, Referrer-Policy,
//     Permissions-Policy, X-XSS-Protection) — applied to every
//     response that passes through the middleware.
//
//  2. Zero-Trust auth gate — uses next-auth/jwt `getToken` to
//     verify the JWT issued by /api/auth/[...nextauth]:
//       • /dashboard/*           → requires session
//       • /api/atelier/*         → requires session
//       • /admin/*               → requires role === "admin"
//     Public API routes (/api/auth/*, /api/cron/*, /api/health)
//     are intentionally excluded so the auth flow and external
//     cron triggers work without a session.
//
//  Note: atelier subdomain rewriting has been removed. The root
//  page (`/`) now permanently redirects to `/atelier` via
//  src/app/page.tsx (permanentRedirect). No middleware magic
//  needed for that.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

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
const PUBLIC_API_PREFIXES = ["/api/auth", "/api/cron", "/api/health"];

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

  // ─── Zero-Trust auth gate ──────────────────────────────────────
  // Applies to /dashboard/*, /api/atelier/* (except public APIs),
  // and /admin/* (also requires role === "admin").
  const isDashboard = path === "/dashboard" || path.startsWith("/dashboard/");
  const isAdmin = path === "/admin" || path.startsWith("/admin/");
  const isAtelierApi = path === "/api/atelier" || path.startsWith("/api/atelier/");

  if (isDashboard || isAdmin || isAtelierApi) {
    if (isPublicApi(path)) {
      // Let the request fall through with security headers.
      return withSecurityHeaders(NextResponse.next());
    }

    const token = await getAuthSession(req);

    if (!token) {
      // API requests get 401 JSON; pages get redirected to contact.
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

  // ─── Default: pass through with security headers ──────────────
  return withSecurityHeaders(NextResponse.next());
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
    // ─── Default catch-all (security headers only) ──────────────
    // Excludes /api, /_next, /_vercel, and static asset files.
    "/((?!api|_next|_vercel|favicon|robots|sitemap|feed|.*\\..*).*)",
  ],
};
