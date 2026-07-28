// ═══════════════════════════════════════════════════════════════
//  WORKERS ENTRY POINT — PROJECT AEGIS v4.0 (Docker)
//
//  Boots all four BullMQ workers in a single Node.js process. This
//  is the entry point referenced by Dockerfile.workers
//  (`CMD ["node", "dist/workers/index.js"]`).
//
//  Why one process for all workers?
//  ─────────────────────────────────
//  BullMQ maintains long-lived Redis subscriptions per Worker
//  instance. Spawning a separate process per worker type wastes
//  memory and file descriptors. Co-locating them in one process
//  also means a single SIGTERM/SIGINT handler can close every
//  worker + the shared Redis connection cleanly.
//
//  Docker Compose `deploy.replicas` gives horizontal scale — 3
//  replicas of the scraper image means 3 × concurrency:3 = 9
//  concurrent scrape jobs in flight, without per-process fan-out.
//
//  Graceful shutdown:
//  ──────────────────
//  On SIGTERM / SIGINT we:
//    1. Stop accepting new jobs (`worker.close()` returns once
//       the current job finishes or the in-flight handler resolves)
//    2. Close the shared Redis connection (`closeAllQueues`)
//    3. Disconnect the Prisma client
//    4. process.exit(0)
//
//  This makes deploys zero-downtime — Kubernetes / Fly.io / Docker
//  Swarm send SIGTERM, we drain, then the container exits.
// ═══════════════════════════════════════════════════════════════

import { scraperWorker } from "@/lib/queue/workers/scraper-worker";
import { nlpWorker } from "@/lib/queue/workers/nlp-worker";
import { fullAuditWorker } from "@/lib/queue/workers/full-audit-worker";
import { closeAllQueues } from "@/lib/queue";
import { prisma } from "@/lib/db";
import { logInfo, logWarn, logError } from "@/lib/logger";

// ─── WORKER REGISTRY ──────────────────────────────────────────────
// Ordered by shutdown priority — the full-audit coordinator must
// close FIRST so its child jobs (scraper → nlp → ai-visibility)
// don't get orphaned mid-flight.

const WORKERS = [
  { name: "full-audit-worker", worker: fullAuditWorker },
  { name: "scraper-worker", worker: scraperWorker },
  { name: "nlp-worker", worker: nlpWorker },
] as const;

// ─── STARTUP ──────────────────────────────────────────────────────

async function boot(): Promise<void> {
  logInfo("workers.boot", "AEGIS worker fleet starting", {
    pid: process.pid,
    workerType: process.env.WORKER_TYPE || "all",
    nodeVersion: process.version,
  });

  // Workers are instantiated at module load time (see src/lib/
  // queue/workers/*.ts). They start consuming immediately on
  // construction, so by the time we get here they're already
  // pulling jobs off Redis. We just confirm they're wired up.
  for (const { name, worker } of WORKERS) {
    if (!worker) {
      logError("workers.boot", `${name} is not initialised — aborting`);
      process.exit(1);
    }
    logInfo("workers.boot", `${name} ready (concurrency=${worker.opts.concurrency ?? "default"})`);
  }

  logInfo("workers.boot", "All workers up — consuming jobs from Redis");
}

// ─── GRACEFUL SHUTDOWN ────────────────────────────────────────────

let shuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;

  logWarn("workers.shutdown", `Received ${signal} — draining workers`);

  // 1. Close workers in shutdown-priority order (full-audit first).
  for (const { name, worker } of WORKERS) {
    try {
      await worker.close();
      logInfo("workers.shutdown", `${name} closed`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logError("workers.shutdown", `${name} close error: ${msg}`);
    }
  }

  // 2. Close all queue producer handles + shared Redis connection.
  try {
    await closeAllQueues();
    logInfo("workers.shutdown", "Queues + Redis connection closed");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError("workers.shutdown", `closeAllQueues error: ${msg}`);
  }

  // 3. Disconnect Prisma.
  try {
    await prisma.$disconnect();
    logInfo("workers.shutdown", "Prisma disconnected");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError("workers.shutdown", `Prisma disconnect error: ${msg}`);
  }

  logInfo("workers.shutdown", "Shutdown complete — exiting");
  process.exit(0);
}

// ─── SIGNAL HANDLERS ──────────────────────────────────────────────

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

// Uncaught errors should never take the whole fleet down silently —
// log them so Sentry / SystemLog can pick them up, but let BullMQ's
// per-job try/catch deal with the individual job failure.
process.on("uncaughtException", (err) => {
  logError("workers.fatal", `Uncaught exception: ${err.message}`, {
    stack: err.stack,
  });
});

process.on("unhandledRejection", (reason) => {
  const msg = reason instanceof Error ? reason.message : String(reason);
  logError("workers.fatal", `Unhandled rejection: ${msg}`);
});

// ─── KICKOFF ──────────────────────────────────────────────────────

void boot().catch((err) => {
  const msg = err instanceof Error ? err.message : String(err);
  logError("workers.fatal", `Boot failed: ${msg}`, {
    stack: err instanceof Error ? err.stack : undefined,
  });
  process.exit(1);
});
