// ═══════════════════════════════════════════════════════════════
//  MASTER CODE GENERATOR (bootstrap) — PROJECT YGGDRASIL
//
//  Generates exactly ONE Master Code and persists its hash+salt.
//  The plaintext code is printed to stdout EXACTLY ONCE — the
//  operator must copy it to a secure password manager immediately.
//
//  Persistence backends (tried in order):
//    1. Prisma → Neon PostgreSQL (production). Requires DATABASE_URL
//       + DIRECT_URL pointing to a live Neon instance.
//    2. Local SQLite fallback (sandbox/dev only). Mirrors the MasterCode
//       table into ./db/custom.db so the code is real and verifiable
//       even without a postgres connection.
//
//  Usage:
//    bun run scripts/generate-master-code.ts
//
//  Exit codes:
//    0 — code generated and persisted (postgres OR sqlite)
//    0 — code generated but unpersisted (printed with warning)
//    1 — fatal error
// ═══════════════════════════════════════════════════════════════

import {
  generateMasterCode,
  persistMasterCode,
  type GeneratedMasterCode,
} from "../src/lib/auth/master-code";
import { prisma } from "../src/lib/db";
import { logAudit } from "../src/lib/harchiq/audit-log";

const BOOTSTRAP_CREATED_BY = "bootstrap";

interface PersistResult {
  id: string;
  backend: "postgres" | "sqlite-local";
}

/**
 * Attempt 1: persist via Prisma → Neon PostgreSQL.
 * Returns null if the DB is unreachable (sandbox without postgres).
 */
async function tryPrismaPersist(
  gen: GeneratedMasterCode,
): Promise<PersistResult | null> {
  try {
    const result = await persistMasterCode(gen, BOOTSTRAP_CREATED_BY);
    return { id: result.id, backend: "postgres" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (
      msg.includes("postgresql://") ||
      msg.includes("DIRECT_URL") ||
      msg.includes("ECONNREFUSED") ||
      msg.includes("Can't reach database")
    ) {
      // Expected in sandbox without postgres — fall through to SQLite
      return null;
    }
    // Unexpected error — rethrow
    throw err;
  }
}

/**
 * Attempt 2: persist to local SQLite (./db/custom.db).
 * Mirrors the MasterCode Prisma model so the row is queryable with
 * the same shape. Only works when run under `bun` (which provides
 * the `bun:sqlite` module); under `tsx`/Node.js the dynamic import
 * fails and we return null.
 */
async function trySqlitePersist(
  gen: GeneratedMasterCode,
): Promise<PersistResult | null> {
  let Database: typeof import("bun:sqlite").Database;
  try {
    const mod = await import("bun:sqlite");
    Database = mod.Database;
  } catch {
    // Running under Node.js (tsx) — bun:sqlite unavailable
    return null;
  }

  const dbPath = "./db/custom.db";
  const db = new Database(dbPath, { create: true });

  try {
    // Idempotent schema mirror — matches prisma MasterCode model
    db.run(`
      CREATE TABLE IF NOT EXISTS "MasterCode" (
        id           TEXT PRIMARY KEY NOT NULL,
        "codeHash"   TEXT NOT NULL UNIQUE,
        "codeSalt"   TEXT NOT NULL,
        "createdBy"  TEXT NOT NULL,
        "usedAt"     DATETIME,
        "usedByUserId" TEXT,
        "expiresAt"  DATETIME NOT NULL,
        "createdAt"  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    db.run(
      `CREATE INDEX IF NOT EXISTS "MasterCode_codeHash_idx" ON "MasterCode"("codeHash")`,
    );
    db.run(
      `CREATE INDEX IF NOT EXISTS "MasterCode_usedAt_idx" ON "MasterCode"("usedAt")`,
    );
    db.run(
      `CREATE INDEX IF NOT EXISTS "MasterCode_expiresAt_idx" ON "MasterCode"("expiresAt")`,
    );

    // Check for an existing unused, non-expired code — avoid generating
    // a second bootstrap code if one is still live.
    const nowIso = new Date().toISOString();
    const existing = db
      .query(
        `SELECT id, "expiresAt" FROM "MasterCode" WHERE "usedAt" IS NULL AND "expiresAt" > ? ORDER BY "createdAt" DESC LIMIT 1`,
      )
      .get(nowIso) as { id: string; expiresAt: string } | null;

    if (existing) {
      db.close();
      // An active bootstrap code already exists — refuse to mint a new one.
      // The operator should use the existing code (which they should have
      // saved when it was generated). Return a sentinel so the caller can
      // print a different message.
      throw new Error(
        `ACTIVE_CODE_EXISTS: A live Master Code already exists (id=${existing.id}, expiresAt=${existing.expiresAt}). Refusing to mint a new one — find the original plaintext in your secure password manager.`,
      );
    }

    const id = crypto.randomUUID();
    db.run(
      `INSERT INTO "MasterCode" (id, "codeHash", "codeSalt", "createdBy", "expiresAt") VALUES (?, ?, ?, ?, ?)`,
      [id, gen.hash, gen.salt, BOOTSTRAP_CREATED_BY, gen.expiresAt.toISOString()],
    );

    db.close();
    return { id, backend: "sqlite-local" };
  } catch (err) {
    db.close();
    throw err;
  }
}

function printBanner(gen: GeneratedMasterCode, persisted: PersistResult | null) {
  const line = "═".repeat(72);
  console.log("");
  console.log("╔" + line + "╗");
  console.log("║" + "  MASTER CODE GENERATED — PROJECT YGGDRASIL".padEnd(72) + "║");
  console.log("║" + "  SAVE THIS NOW. It will NEVER be shown again.".padEnd(72) + "║");
  console.log("╠" + line + "╣");
  console.log("║" + "".padEnd(72) + "║");
  console.log("║" + `  Code:     ${gen.code}`.padEnd(72) + "║");
  console.log("║" + `  Expires:  ${gen.expiresAt.toISOString()}`.padEnd(72) + "║");
  console.log(
    "║" +
      `  Persisted: ${
        persisted
          ? `${persisted.backend} (id=${persisted.id})`
          : "NOT PERSISTED — see warning below"
      }`.padEnd(72) +
      "║",
  );
  console.log("║" + "".padEnd(72) + "║");
  console.log("║" + "  USAGE:".padEnd(72) + "║");
  console.log("║" + "  POST /api/auth/activate-master".padEnd(72) + "║");
  console.log('║' + '  body: { "code": "<the-code-above>", "userId": "<your-id>" }'.padEnd(72) + '║');
  console.log("║" + "".padEnd(72) + "║");
  console.log("║" + "  The code is ONE-TIME-USE. After activation it is".padEnd(72) + "║");
  console.log("║" + "  cryptographically burned (usedAt + usedByUserId set).".padEnd(72) + "║");
  console.log("╚" + line + "╝");
  console.log("");
}

async function main() {
  console.log("=== Master Code Generator (YGGDRASIL bootstrap) ===");

  // 1. Generate the code (pure crypto — works in any runtime)
  const gen = generateMasterCode();
  console.log(
    `[1/3] Code generated (hash=${gen.hash.slice(0, 16)}…, salt=${gen.salt.slice(0, 16)}…)`,
  );

  // 2. Persist — try Prisma (Neon) first, then SQLite fallback
  let persisted: PersistResult | null = null;
  let prismaError: string | null = null;

  console.log("[2/3] Attempting persistence…");
  const prismaResult = await tryPrismaPersist(gen);
  if (prismaResult) {
    persisted = prismaResult;
    console.log(`  ✓ Persisted to Neon PostgreSQL (id=${prismaResult.id})`);
  } else {
    prismaError = "Prisma backend unavailable (no postgres DATABASE_URL)";
    console.log(`  • Prisma backend unavailable — trying local SQLite fallback…`);
    try {
      const sqliteResult = await trySqlitePersist(gen);
      if (sqliteResult) {
        persisted = sqliteResult;
        console.log(
          `  ✓ Persisted to local SQLite ./db/custom.db (id=${sqliteResult.id})`,
        );
      } else {
        console.log(
          `  ✗ SQLite fallback unavailable (running under Node/tsx without bun:sqlite)`,
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.startsWith("ACTIVE_CODE_EXISTS")) {
        console.log("");
        console.log("╔" + "═".repeat(72) + "╗");
        console.log(
          "║" + "  REFUSED: A LIVE MASTER CODE ALREADY EXISTS".padEnd(72) + "║",
        );
        console.log("╠" + "═".repeat(72) + "╣");
        console.log("║" + msg.slice(0, 72).padEnd(72) + "║");
        console.log(
          "║" +
            "  Find the original plaintext in your secure password manager.".padEnd(72) +
            "║",
        );
        console.log(
          "║" +
            "  To mint a new code, revoke the old one first (mark usedAt manually).".padEnd(72) +
            "║",
        );
        console.log("╚" + "═".repeat(72) + "╝");
        console.log("");
        await prisma.$disconnect();
        process.exit(0);
      }
      throw err;
    }
  }

  // 3. Audit log (best-effort — may fail if DB unreachable)
  console.log("[3/3] Writing audit log…");
  try {
    await logAudit({
      userId: null,
      action: "master_code_generate",
      resource: persisted
        ? `master-code:${persisted.id}`
        : "master-code:unpersisted",
      result: persisted ? "success" : "error",
      metadata: {
        backend: persisted?.backend ?? "none",
        createdBy: BOOTSTRAP_CREATED_BY,
        expiresAt: gen.expiresAt.toISOString(),
        prismaError: prismaError,
      },
    });
    console.log("  ✓ Audit log written");
  } catch (err) {
    console.log(
      "  • Audit log skipped:",
      err instanceof Error ? err.message : err,
    );
  }

  // 4. PRINT THE PLAINTEXT CODE (one-time)
  printBanner(gen, persisted);

  if (!persisted) {
    console.log("⚠ WARNING: The code was NOT persisted to any backend.");
    console.log("  The hash+salt below are derived from the plaintext, so if you");
    console.log("  persist the hash+salt manually into the MasterCode table, the");
    console.log("  code remains valid. Otherwise, re-run this script in an env");
    console.log("  with a reachable postgres (DATABASE_URL+DIRECT_URL) or under");
    console.log("  `bun run` (which provides the SQLite fallback).");
    console.log("");
    console.log(`  codeHash: ${gen.hash}`);
    console.log(`  codeSalt: ${gen.salt}`);
    console.log("");
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("[generate-master-code] FATAL:", e);
  process.exit(1);
});
