// ═══════════════════════════════════════════════════════════════
//  AUTH CONFIG — PROJECT AEGIS v4.0 (NextAuth + Zero-Trust)
//
//  Credentials provider backed by Prisma + bcrypt. Sessions use
//  JWT strategy (stateless) so the same token travels across the
//  edge middleware (where `getToken` verifies it) and the API
//  routes (where `getServerSession` decodes it).
//
//  The JWT carries `role` and `plan` claims so the middleware can
//  enforce admin-only routes and feature-gated routes without an
//  extra DB hit per request.
// ═══════════════════════════════════════════════════════════════

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/harchiq/audit-log";
import { isDemoEmail, getDemoUser, DEMO_PASSWORD } from "@/lib/demo-session";

// Augment NextAuth JWT & Session types so role/accountType are visible to
// callers of `getServerSession(authOptions)` and `getToken()`.
declare module "next-auth" {
  interface User {
    id?: string;
    role?: string;
    accountType?: string;  // essential | pro | enterprise | agency (4 plans Harch Atelier)
    companyId?: string | null;
    status?: string;
    isDemo?: boolean;     // Task: domain-matching-demo-isolation — true for demo-*@harch.atelier
    // ─── Brick 8 — agency white-label ────────────────────────────
    // agencyId is set at sign-in for users with role="agency-admin".
    // activeAgencyClientId is the JWT-side mirror of the
    // `activeAgencyClientId` cookie — present so the first render
    // after sign-in already has a workspace pre-selected. Subsequent
    // workspace switches only touch the cookie (see agency-session.ts).
    agencyId?: string | null;
    activeAgencyClientId?: string | null;
  }
  interface Session {
    user: {
      id?: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      role?: string;
      accountType?: string;
      companyId?: string | null;
      status?: string;
      isDemo?: boolean;
      agencyId?: string | null;
      activeAgencyClientId?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    accountType?: string;
    companyId?: string | null;
    status?: string;
    isDemo?: boolean;
    agencyId?: string | null;
    activeAgencyClientId?: string | null;
    sessionVersion?: number;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  // Explicit secret (env var must be set, otherwise NextAuth silently fails)
  secret: process.env.NEXTAUTH_SECRET,
  // NextAuth v4 PagesOptions only exposes `signIn` (no `signUp`).
  pages: { signIn: "/atelier/login" },
  // Cookies configured for cross-origin tunnel compatibility.
  // Using `sameSite: "lax"` without a hardcoded domain lets the cookie work
  // on whatever host the browser is actually on (localhost, trycloudflare.com, etc.).
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false,
      },
    },
    csrfToken: {
      name: "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false,
      },
    },
    callbackUrl: {
      name: "next-auth.callback-url",
      options: {
        sameSite: "lax",
        path: "/",
        secure: false,
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        // ─── DEMO BYPASS ───────────────────────────────────────────
        // demo-*@harch.atelier accounts authenticate against an in-memory
        // store, never touching Prisma. This keeps the console + dashboard
        // + accounts flows working in environments where the PostgreSQL DB
        // is not provisioned (sandbox, local dev without Neon).
        // ─── DEMO BYPASS REMOVED ───────────────────────────────────
        // Demo accounts have been disabled. All users must go through
        // the proper invitation + credentials flow.
        // isDemoEmail always returns false now (see demo-session.ts stub).
        if (isDemoEmail(credentials.email)) {
          return null;
        }

        // ─── Extract IP + UA from the NextAuth request context ─────
        // RequestInternal.headers is a Record<string, string> (or
        // an IncomingHttpHeaders-like object) — read defensively.
        const headerVal = (name: string): string | undefined => {
          const h = req?.headers as Record<string, string | string[] | undefined> | undefined;
          if (!h) return undefined;
          const v = h[name];
          if (Array.isArray(v)) return v[0];
          return v ?? undefined;
        };
        let ip: string | undefined;
        const fwd = headerVal("x-forwarded-for");
        if (fwd) {
          ip = fwd.split(",")[0]?.trim() || undefined;
        }
        if (!ip) ip = headerVal("x-real-ip");
        const userAgent = headerVal("user-agent");

        const attemptedEmail = credentials.email;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user || !user.passwordHash) {
          // ─── Audit log (Loi 09-08) — failed login, unknown user ─
          await logAudit({
            userId: null,
            action: "login_failed",
            resource: `auth:${attemptedEmail}`,
            result: "denied",
            ipAddress: ip,
            userAgent,
            metadata: { reason: "user_not_found" },
          });
          return null;
        }

        // Suspended users cannot sign in (company-admin can deactivate).
        if (user.status === "suspended") {
          await logAudit({
            userId: user.id,
            action: "login_failed",
            resource: `auth:${user.email}`,
            result: "denied",
            ipAddress: ip,
            userAgent,
            metadata: { reason: "suspended" },
          });
          return null;
        }

        const valid = await bcrypt.compare(
          credentials.password,
          user.passwordHash,
        );
        if (!valid) {
          await logAudit({
            userId: user.id,
            action: "login_failed",
            resource: `auth:${user.email}`,
            result: "denied",
            ipAddress: ip,
            userAgent,
            metadata: { reason: "bad_password" },
          });
          return null;
        }

        // Best-effort update of lastLoginAt (fire-and-forget — do not
        // block the sign-in flow on this write).
        prisma.user
          .update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          })
          .catch(() => {
            /* swallow — best-effort */
          });

        // ─── Audit log (Loi 09-08) — successful login ─────────────
        await logAudit({
          userId: user.id,
          action: "login",
          resource: `auth:${user.email}`,
          result: "success",
          ipAddress: ip,
          userAgent,
          metadata: {
            role: user.role,
            accountType: user.accountType,
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          accountType: user.accountType,
          companyId: user.companyId,
          status: user.status,
          isDemo: user.isDemo,
          // Brick 8 — agency white-label: surface agencyId in the JWT so
          // agency-session.ts can resolve the master account without an
          // extra DB hit on every request. activeAgencyClientId is left
          // null here — the agency-session module reads it from the cookie.
          agencyId: user.agencyId,
          activeAgencyClientId: null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Initial sign-in — populate all claims from the user object
        token.id = (user as { id?: string }).id;
        token.role = (user as { role?: string }).role;
        token.accountType = (user as { accountType?: string }).accountType;
        token.companyId = (user as { companyId?: string | null }).companyId;
        token.status = (user as { status?: string }).status;
        token.isDemo = (user as { isDemo?: boolean }).isDemo;
        // YGGDRASIL-N40: store sessionVersion at sign-in so we can
        // detect revocation on subsequent JWT refreshes.
        token.sessionVersion = (user as { sessionVersion?: number }).sessionVersion ?? 0;
        // Brick 8 — agency white-label: persist agencyId claim so the
        // agency-session module can short-circuit when there's no
        // active sub-client workspace.
        token.agencyId = (user as { agencyId?: string | null }).agencyId ?? null;
        token.activeAgencyClientId = null;
      }
      // Fallback for old JWTs (created before token.id was added):
      // if token.id is missing but we have an email, look up the user
      // from the DB to backfill the missing claims. This prevents
      // redirect loops where session.user.id is undefined.
      // Skip the DB lookup for demo accounts — they're backed by the
      // in-memory demo-session store, not Prisma.
      if (!token.id && token.email && !isDemoEmail(token.email)) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
            select: {
              id: true,
              role: true,
              accountType: true,
              companyId: true,
              status: true,
              isDemo: true,
              agencyId: true,
            },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.accountType = dbUser.accountType;
            token.companyId = dbUser.companyId;
            token.status = dbUser.status;
            token.isDemo = dbUser.isDemo;
            token.agencyId = dbUser.agencyId;
            // Don't overwrite activeAgencyClientId on every jwt refresh —
            // it's managed by the cookie, not the token.
          }
        } catch {
          // DB error — leave token as-is (will fail at the route level with 401)
        }
      }
      // Demo fallback REMOVED — demo accounts are disabled.
      // isDemoEmail always returns false, so this block never executes.

      // ─── YGGDRASIL-N40: Session Revocation Check ───────────────
      // On every JWT refresh (not initial sign-in), check if the user's
      // sessionVersion in DB matches the one in the token. If the admin
      // bumped it (via /api/admin/revoke-session), the token is stale →
      // return an empty token, effectively signing the user out.
      // Skip for demo users (no DB row) and tokens without an id.
      if (token.id && token.email && !isDemoEmail(token.email) && !user) {
        try {
          const dbVersion = await prisma.user.findUnique({
            where: { id: token.id },
            select: { sessionVersion: true, status: true },
          });
          if (!dbVersion || dbVersion.status === "suspended") {
            // User deleted or suspended → kill the token
            return {} as typeof token;
          }
          if (dbVersion.sessionVersion !== token.sessionVersion) {
            // Session revoked → kill the token
            return {} as typeof token;
          }
        } catch {
          // DB error — don't kill the session on transient failures
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id;
        (session.user as { role?: string }).role = token.role;
        (session.user as { accountType?: string }).accountType = token.accountType;
        (session.user as { companyId?: string | null }).companyId = token.companyId;
        (session.user as { status?: string }).status = token.status;
        (session.user as { isDemo?: boolean }).isDemo = token.isDemo;
        (session.user as { agencyId?: string | null }).agencyId = token.agencyId;
        (session.user as { activeAgencyClientId?: string | null }).activeAgencyClientId = token.activeAgencyClientId;
      }
      return session;
    },
  },
};

// ─── Helper: route a user to the correct console based on accountType ──
// Admins always go to /atelier/admin.
// company-admin goes to /atelier/console/enterprise-admin (self-service
// panel for inviting teammates + configuring their company).
// Other users go to /atelier/console/<accountType>.
export function getConsolePath(accountType?: string, role?: string): string {
  if (role === "admin" || role === "super_admin") return "/atelier/admin";
  if (role === "company-admin") return "/atelier/console/enterprise-admin";
  if (role === "agency-admin") return "/atelier/console/agency";
  if (role === "commercial") return "/atelier/admin";
  // Regular users land on their plan-specific console.
  // /atelier/console redirects to the right dashboard based on accountType.
  return "/atelier/console";
}
