// ═══════════════════════════════════════════════════════════════
//  PUBLIC HEALTH ROUTE — PROJECT AEGIS v4.0
//
//  GET /api/health
//
//  Pings the three critical subsystems (DB / Redis / GLM) in
//  parallel and returns:
//    {
//      success: true,
//      data: {
//        status: "ok" | "degraded",
//        database: boolean,
//        redis: boolean,
//        glm: boolean,
//        latencies: { db, redis, glm },
//        companyCount, timestamp
//      }
//    }
//
//  • 200 OK if every subsystem is healthy
//  • 503 Service Unavailable if any one is down
//
//  This is the endpoint that external monitors (UptimeRobot,
//  BetterStack, Vercel's own checks) should poll — the cron health
//  route at /api/cron/health handles the internal SystemLog write.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { pingRedis } from "@/lib/queue/connection";
import { checkGLMHealth } from "@/lib/ai/glm-orchestrator";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

async function timed<T>(
  fn: () => Promise<T>,
): Promise<{ ok: boolean; latencyMs: number; value?: T; error?: string }> {
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

export async function GET() {
  const started = Date.now();

  // Run all three subsystem checks in parallel — the slowest one
  // dominates the overall latency, but we don't want a dead GLM
  // API to also stall the DB / Redis ping results.
  const [dbCheck, redisCheck, glmCheck] = await Promise.all([
    timed(() => prisma.company.count()),
    timed(() => pingRedis()),
    timed(() => checkGLMHealth()),
  ]);

  const database = dbCheck.ok;
  const redis = redisCheck.ok;
  const glm = glmCheck.ok && glmCheck.value?.healthy === true;
  const allOk = database && redis && glm;

  const status: "ok" | "degraded" = allOk ? "ok" : "degraded";

  const data = {
    status,
    database,
    redis,
    glm,
    latencies: {
      db: dbCheck.latencyMs,
      redis: redisCheck.latencyMs,
      glm: glmCheck.latencyMs,
    },
    companyCount: typeof dbCheck.value === "number" ? dbCheck.value : null,
    errors: {
      db: dbCheck.error ?? null,
      redis: redisCheck.error ?? null,
      glm: glmCheck.error ?? glmCheck.value?.error ?? null,
    },
    totalLatencyMs: Date.now() - started,
    timestamp: new Date().toISOString(),
  };

  if (!allOk) {
    logError(
      "api.health",
      `Health check degraded — db=${database} redis=${redis} glm=${glm}`,
      data,
    );
    return NextResponse.json(
      { success: false, data },
      { status: 503 },
    );
  }

  return NextResponse.json({ success: true, data });
}
