// ═══════════════════════════════════════════════════════════════
//  STRUCTURED LOGGER — PROJECT AEGIS v4.0
//
//  Pino for high-throughput structured JSON logging to stdout.
//  Every call ALSO writes a row to the SystemLog table so the
//  admin dashboard at /api/admin/logs can replay events.
//
//  DB writes are fire-and-forget (non-blocking) — they MUST NOT
//  block or fail the caller's request. Any Prisma error is
//  swallowed and surfaced only via console.error so the hot path
//  is never affected by transient DB issues.
//
//  Public API:
//    • logger             — raw pino instance
//    • logDebug / logInfo / logWarn / logError / logFatal
//        (category: string, message: string, metadata?: unknown)
// ═══════════════════════════════════════════════════════════════

import pino from "pino";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

// ─── PINO INSTANCE ────────────────────────────────────────────────
// Emits structured JSON to stdout for downstream log shippers
// (Vercel, Sentry, Logtail, etc.). Pretty-printing via
// pino-pretty is intentionally NOT bundled to keep the dependency
// tree lean — devs can pipe `bun run dev` through `pino-pretty`
// at the shell level if they want colourised output.

const isProd = process.env.NODE_ENV === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProd ? "info" : "debug"),
  base: {
    service: "harch-atelier",
    env: process.env.NODE_ENV || "development",
  },
});

// ─── TYPE HELPERS ─────────────────────────────────────────────────

type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";
type LogMetadata = Record<string, unknown> | undefined;

// ─── DB PERSISTENCE (non-blocking) ────────────────────────────────

/**
 * Writes a SystemLog row in the background. Never throws, never
 * blocks. If Prisma is unavailable the failure is logged to the
 * pino instance itself (which still emits to stdout).
 */
function persistToDb(level: LogLevel, category: string, message: string, metadata?: LogMetadata): void {
  // Coerce the metadata into Prisma's JSON-input type. Prisma's
  // generated `Json?` field type accepts `InputJsonValue`, which is
  // narrower than TS's `Record<string, unknown>` — the cast is safe
  // because we only ever pass plain serialisable objects.
  const jsonMetadata: Prisma.InputJsonValue | undefined = metadata
    ? (metadata as Prisma.InputJsonValue)
    : undefined;

  // `void` keyword = fire-and-forget — the promise is intentionally
  // not awaited. Wrap in try/catch so a synchronous Prisma client
  // error (e.g. during boot) can't escape into the caller.
  try {
    void prisma.systemLog
      .create({
        data: {
          level,
          category,
          message,
          metadata: jsonMetadata,
        },
      })
      .catch((err: unknown) => {
        // DB persistence is best-effort — log and move on.
        const e = err instanceof Error ? err.message : String(err);
        logger.error({ err: e, category, level }, "systemLog persist failed");
      });
  } catch (err) {
    // Synchronous failure (e.g. Prisma client not yet initialised).
    const e = err instanceof Error ? err.message : String(err);
    logger.error({ err: e, category, level }, "systemLog persist threw");
  }
}

// ─── PUBLIC HELPERS ───────────────────────────────────────────────

export function logDebug(category: string, message: string, metadata?: LogMetadata): void {
  logger.debug({ category, ...(metadata ?? {}) }, message);
  persistToDb("debug", category, message, metadata);
}

export function logInfo(category: string, message: string, metadata?: LogMetadata): void {
  logger.info({ category, ...(metadata ?? {}) }, message);
  persistToDb("info", category, message, metadata);
}

export function logWarn(category: string, message: string, metadata?: LogMetadata): void {
  logger.warn({ category, ...(metadata ?? {}) }, message);
  persistToDb("warn", category, message, metadata);
}

export function logError(category: string, message: string, metadata?: LogMetadata): void {
  logger.error({ category, ...(metadata ?? {}) }, message);
  persistToDb("error", category, message, metadata);
}

export function logFatal(category: string, message: string, metadata?: LogMetadata): void {
  logger.fatal({ category, ...(metadata ?? {}) }, message);
  persistToDb("fatal", category, message, metadata);
}

// ─── RE-EXPORTS ───────────────────────────────────────────────────

export { pino };
export default logger;
