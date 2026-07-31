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

// Augment NextAuth JWT & Session types so role/accountType are visible to
// callers of `getServerSession(authOptions)` and `getToken()`.
declare module "next-auth" {
  interface User {
    id?: string;
    role?: string;
    accountType?: string;  // brand-monitor | market-competitor | investment-bank | harch-alpha
    companyId?: string | null;
    status?: string;
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
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user || !user.passwordHash) return null;

        // Suspended users cannot sign in (company-admin can deactivate).
        if (user.status === "suspended") return null;

        const valid = await bcrypt.compare(
          credentials.password,
          user.passwordHash,
        );
        if (!valid) return null;

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

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          accountType: user.accountType,
          companyId: user.companyId,
          status: user.status,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id?: string }).id;
        token.role = (user as { role?: string }).role;
        token.accountType = (user as { accountType?: string }).accountType;
        token.companyId = (user as { companyId?: string | null }).companyId;
        token.status = (user as { status?: string }).status;
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
  if (role === "admin") return "/atelier/admin";
  if (role === "company-admin") return "/atelier/console/enterprise-admin";
  switch (accountType) {
    case "brand-monitor":
      return "/atelier/console/brand-monitor";
    case "market-competitor":
      return "/atelier/console/market-competitor";
    case "investment-bank":
      return "/atelier/console/investment-bank";
    case "harch-alpha":
      return "/atelier/console/harch-alpha";
    default:
      return "/atelier/console/brand-monitor";
  }
}
