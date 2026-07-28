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

// Augment NextAuth JWT & Session types so role/plan are visible to
// callers of `getServerSession(authOptions)` and `getToken()`.
declare module "next-auth" {
  interface User {
    role?: string;
    plan?: string;
  }
  interface Session {
    user: {
      id?: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      role?: string;
      plan?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    plan?: string;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  // NextAuth v4 PagesOptions only exposes `signIn` (no `signUp`).
  // The /register page is linked directly from the login form.
  pages: { signIn: "/login" },
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
          plan: user.plan,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.plan = (user as { plan?: string }).plan;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role;
        (session.user as { plan?: string }).plan = token.plan;
      }
      return session;
    },
  },
};
