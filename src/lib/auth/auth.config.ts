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

// Augment NextAuth JWT & Session types so role/plan/accountType are visible to
// callers of `getServerSession(authOptions)` and `getToken()`.
declare module "next-auth" {
  interface User {
    role?: string;
    plan?: string;
    accountType?: string;  // trader | enterprise | investor
  }
  interface Session {
    user: {
      id?: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      role?: string;
      plan?: string;
      accountType?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    plan?: string;
    accountType?: string;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  // Explicit secret (env var must be set, otherwise NextAuth silently fails)
  secret: process.env.NEXTAUTH_SECRET,
  // NextAuth v4 PagesOptions only exposes `signIn` (no `signUp`).
  pages: { signIn: "/atelier/login" },
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

        const valid = await bcrypt.compare(
          credentials.password,
          user.passwordHash,
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          plan: (user as any).plan,
          accountType: user.accountType,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        (token as any).plan = (user as { plan?: string }).plan;
        token.accountType = (user as { accountType?: string }).accountType;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role;
        (session.user as { accountType?: string }).accountType = token.accountType;
      }
      return session;
    },
  },
};

// ─── Helper: route a user to the correct console based on accountType ──
// Admins always go to /atelier/admin.
// Other users go to /atelier/console/<accountType>.
export function getConsolePath(accountType?: string, role?: string): string {
  if (role === "admin") return "/atelier/admin";
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
