// ═══════════════════════════════════════════════════════════════
//  LOCAL PRISMA CLIENT — for the new data bricks
//
//  Uses the SQLite schema at prisma/schema-local.prisma (generated
//  to node_modules/.prisma/client-local). Persists ArticleComment
//  (Hespress UGC) and InboundWhatsAppMessage (the IKEA loop) to
//  db/local.db.
//
//  When Neon PostgreSQL is provisioned, this file is deleted and
//  callers are migrated to the main `@/lib/db` client (which will
//  then host both ArticleComment and InboundWhatsAppMessage in the
//  unified PostgreSQL schema).
// ═══════════════════════════════════════════════════════════════

import { PrismaClient } from ".prisma/client-local";

const globalForLocalPrisma = globalThis as unknown as {
  prismaLocal: PrismaClient | undefined;
};

function createLocalPrismaClient() {
  const url = process.env.DATABASE_URL_LOCAL;
  if (!url) {
    console.warn("[db-local.ts] DATABASE_URL_LOCAL not set — local persistence disabled");
    return null;
  }
  try {
    return new PrismaClient({
      log: ["error", "warn"],
      datasources: { db: { url } },
    });
  } catch (e) {
    console.warn("[db-local.ts] Failed to create PrismaClient:", e);
    return null;
  }
}

export const prismaLocal = globalForLocalPrisma.prismaLocal ?? createLocalPrismaClient();

if (process.env.NODE_ENV !== "production") globalForLocalPrisma.prismaLocal = prismaLocal;

// Helper to check if local DB is available
export function localDbAvailable(): boolean {
  return prismaLocal !== null && prismaLocal !== undefined;
}
