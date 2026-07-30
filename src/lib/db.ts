// Force-load .env before PrismaClient is constructed so DATABASE_URL is
// available inside the Next.js Turbopack dev server runtime.
//
// IMPORTANT: The Z.ai sandbox parent process exports a STALE
// `DATABASE_URL=file:/home/z/my-project/db/custom.db` (leftover from the
// initial scaffold). Next.js inherits shell env vars with higher priority
// than `.env` files, so the stale SQLite URL wins and Prisma fails with
// "URL must start with postgresql://". We override it here by reading the
// correct value from `.env` and forcing it into process.env before Prisma
// is constructed.
import { config as loadEnv } from "dotenv";
import { resolve as resolvePath } from "path";
import { readFileSync } from "fs";

function loadCorrectDatabaseUrl(): string | undefined {
  // 1. Try dotenv load from .env (populates process.env but does NOT override
  //    existing shell env vars by default — so we also parse manually).
  const envPath = resolvePath(process.cwd(), ".env");
  loadEnv({ path: envPath, override: true });

  // 2. Parse .env manually to find the real DATABASE_URL (the .env file is
  //    source of truth, not the shell env).
  try {
    const envContent = readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let value = trimmed.slice(eqIdx + 1).trim();
      // Strip surrounding quotes
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (key === "DATABASE_URL" || key === "DIRECT_URL") {
        if (value && value.startsWith("postgresql://")) {
          process.env[key] = value;
        }
      }
    }
  } catch (e) {
    // ignore — fall through to whatever process.env has
  }

  return process.env.DATABASE_URL;
}

const databaseUrl = loadCorrectDatabaseUrl();
if (!databaseUrl || !databaseUrl.startsWith("postgresql://")) {
  // eslint-disable-next-line no-console
  console.error("[db.ts] DATABASE_URL is missing or not postgresql://. Got:", databaseUrl);
}

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    log: ["error", "warn"],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
