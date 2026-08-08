import { NextRequest, NextResponse } from "next/server";
import { verifyAuditChain } from "@/lib/auth/superadmin-audit";
import { prisma } from "@/lib/db";
import { logInfo, logError } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ═══════════════════════════════════════════════════════════════
//  GET /api/cron/audit-sentinel
//
//  The Sentinel — runs every hour via Vercel Cron.
//
//  1. Recalculates the entire SuperAdminAudit hash chain.
//  2. If calculatedHash !== storedHash anywhere → TAMPER DETECTED.
//  3. On tamper: sets system flag DEFCON 1 (locks all super_admin
//     actions until the owner investigates), logs the incident.
//
//  Auth: CRON_SECRET header (Vercel Cron injects it automatically).
//
//  Task ID: YGGDRASIL-N38 (Watchdog d'Intégrité)
// ═══════════════════════════════════════════════════════════════

export async function GET(req: NextRequest) {
  // Auth: CRON_SECRET
  const authHeader = req.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();

  try {
    // 1. Verify the hash chain
    const result = await verifyAuditChain();

    if (result.valid) {
      logInfo(
        "audit-sentinel",
        `Chain intact — ${result.totalEntries} entries verified in ${Date.now() - startTime}ms`,
      );

      // Clear DEFCON flag if it was set (system recovered)
      await prisma.systemFlag.upsert({
        where: { key: "defcon_level" },
        update: { value: "0", updatedAt: new Date() },
        create: { key: "defcon_level", value: "0" },
      });

      return NextResponse.json({
        ok: true,
        status: "intact",
        entriesVerified: result.totalEntries,
        durationMs: Date.now() - startTime,
      });
    }

    // 2. TAMPER DETECTED — DEFCON 1
    logError(
      "audit-sentinel",
      `⚠️ TAMPER DETECTED — chain broken at entry ${result.brokenAt} (${result.totalEntries} total entries)`,
    );

    // Set DEFCON 1 flag (super_admin UI will read this and lock down)
    await prisma.systemFlag.upsert({
      where: { key: "defcon_level" },
      update: { value: "1", updatedAt: new Date() },
      create: { key: "defcon_level", value: "1" },
    });

    // Also set a tamper_incident flag with details
    await prisma.systemFlag.upsert({
      where: { key: "tamper_incident" },
      update: {
        value: JSON.stringify({
          brokenAt: result.brokenAt,
          totalEntries: result.totalEntries,
          detectedAt: new Date().toISOString(),
        }),
        updatedAt: new Date(),
      },
      create: {
        key: "tamper_incident",
        value: JSON.stringify({
          brokenAt: result.brokenAt,
          totalEntries: result.totalEntries,
          detectedAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json(
      {
        ok: false,
        status: "tamper_detected",
        defcon: 1,
        brokenAt: result.brokenAt,
        totalEntries: result.totalEntries,
        durationMs: Date.now() - startTime,
      },
      { status: 500 },
    );
  } catch (err) {
    logError(
      "audit-sentinel",
      `Sentinel crash: ${err}`,
    );
    return NextResponse.json(
      { error: "Sentinel failed", detail: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
