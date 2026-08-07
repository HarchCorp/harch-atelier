// ═══════════════════════════════════════════════════════════════
//  PRISMA CLIENT — Environment-aware initialization
//
//  On Vercel (production): environment variables are injected by the
//  platform (no .env file). process.env.DATABASE_URL is already set.
//
//  On local dev: a .env file may exist with the Neon URL. We load it
//  to override any stale shell DATABASE_URL (sandbox leftover).
//
//  This module NEVER crashes if .env is missing — it falls back to
//  process.env which is the source of truth on Vercel.
// ═══════════════════════════════════════════════════════════════

import { config as loadEnv } from "dotenv";
import { resolve as resolvePath } from "path";
import { readFileSync, existsSync } from "fs";

function loadEnvironment(): void {
  const envPath = resolvePath(process.cwd(), ".env");

  // Only load .env if it exists (local dev). On Vercel, .env doesn't
  // exist — environment variables come from the platform dashboard.
  if (existsSync(envPath)) {
    loadEnv({ path: envPath, override: true });

    // Also parse manually to override stale shell vars (sandbox legacy)
    try {
      const envContent = readFileSync(envPath, "utf-8");
      for (const line of envContent.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        let value = trimmed.slice(eqIdx + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        // Only override env vars that look like our config keys
        if (key === "DATABASE_URL" || key === "DIRECT_URL" ||
            key === "NEXTAUTH_SECRET" || key === "NEXTAUTH_URL" ||
            key === "SETUP_TOKEN" || key === "CRON_SECRET" ||
            key === "ZAI_API_KEY" || key === "TWILIO_ACCOUNT_SID" ||
            key === "TWILIO_AUTH_TOKEN" || key === "TWILIO_WHATSAPP_FROM" ||
            key === "RESEND_API_KEY") {
          if (value) process.env[key] = value;
        }
      }
    } catch {
      // .env read failed — fall through to process.env as-is
    }
  }
  // If .env doesn't exist (Vercel production), process.env is already
  // populated by the platform — nothing to do.
}

loadEnvironment();

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
