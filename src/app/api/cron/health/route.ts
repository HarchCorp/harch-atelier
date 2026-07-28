// ═══════════════════════════════════════════════════════════════
//  CRON — HEALTH — PROJECT AEGIS v4.0
//
//  Triggered by Vercel Cron every 5 minutes (`*/5 * * * *`).
//  Pings DB / Redis / GLM in parallel and writes a SystemLog row
//  capturing the result. This is the early-warning signal that
//  surfaces on the /api/admin/logs dashboard before users notice.
//
//  Returns 200 always — Vercel Cron treats non-2xx as a failed
//  invocation and would alert on it. We log degraded state to
//  SystemLog and let the public /api/health route carry the
//  503 when called by an external monitor.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { pingRedis } from "@/lib/queue/connection";
import { checkGLMHealth } from "@/lib/ai/glm-orchestrator";
import { authorizeCron } from "@/lib/auth/cron";
import { logInfo, logWarn, logError } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function timed<T>(fn: () => Promise<T>): Promise<{ ok: boolean; latencyMs: number; value?: T; error?: string }> {
  const started = Date.now();
  try {
    const value = await fn();
    return { ok: true, latencyMs: Date.now() - started, value };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Date.now() - started,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function POST(req: Request) {
  if (!authorizeCron(req)) {
    logWarn("cron.health", "Unauthorized cron invocation attempt");
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  // Run all three checks in parallel so the cron doesn't block on
  // the slowest one sequentially.
  const [dbCheck, redisCheck, glmCheck] = await Promise.all([
    timed(() => prisma.company.count()),
    timed(() => pingRedis()),
    timed(() => checkGLMHealth()),
  ]);

  const allOk = dbCheck.ok && redisCheck.ok && glmCheck.ok;
  const status: "ok" | "degraded" = allOk ? "ok" : "degraded";

  const payload = {
    status,
    database: dbCheck.ok,
    redis: redisCheck.ok,
    glm: glmCheck.ok && glmCheck.value?.healthy === true,
    latencies: {
      db: dbCheck.latencyMs,
      redis: redisCheck.latencyMs,
      glm: glmCheck.latencyMs,
    },
    errors: {
      db: dbCheck.error ?? null,
      redis: redisCheck.error ?? null,
      glm: glmCheck.error ?? glmCheck.value?.error ?? null,
    },
    timestamp: new Date().toISOString(),
  };

  // Always persist a row — both healthy and degraded. The admin
  // dashboard plots this time series to spot trends before alerts.
  if (status === "ok") {
    logInfo("cron.health", "Health check OK", payload);
  } else {
    logWarn("cron.health", "Health check DEGRADED", payload);
  }

  // Surface unexpected errors (e.g. a thrown Promise that didn't
  // get caught by `timed`) at error level too.
  if (!allOk) {
    logError(
      "cron.health",
      `One or more subsystems unhealthy — db=${dbCheck.ok} redis=${redisCheck.ok} glm=${glmCheck.ok}`,
      payload,
    );
  }

  // 200 always — Vercel Cron alerts on non-2xx and we don't want
  // a transient Redis blip to wake someone up at 3am. The public
  // /api/health route is the right place to return 503.
  return NextResponse.json({ success: true, data: payload });
}

export const GET = POST;
