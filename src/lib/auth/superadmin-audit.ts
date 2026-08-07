// ═══════════════════════════════════════════════════════════════
//  SUPERADMIN AUDIT — Tamper-evident append-only log
//
//  Every super_admin action is logged here with a SHA-256 hash chain.
//  Each entry's hash = SHA-256(prevHash + userId + action + resource + ts).
//  Deleting or modifying any entry breaks the chain → tamper detected.
//
//  Task ID: YGGDRASIL-N35
// ═══════════════════════════════════════════════════════════════

import { createHash } from "crypto";
import { prisma } from "@/lib/db";
import { logError } from "@/lib/logger";

export interface SuperAdminAuditEntry {
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  result: "success" | "denied" | "error";
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Compute the SHA-256 hash for a SuperAdminAudit entry.
 * The hash chains to the previous entry's hash, making the log
 * tamper-evident: modifying any entry breaks all subsequent hashes.
 */
function computeEntryHash(
  prevHash: string | null,
  userId: string,
  action: string,
  resource: string,
  timestamp: string,
): string {
  return createHash("sha256")
    .update(`${prevHash || ""}|${userId}|${action}|${resource}|${timestamp}`)
    .digest("hex");
}

/**
 * Append a new entry to the SuperAdminAudit log. The entry is hashed
 * and chained to the previous entry. Non-blocking — audit failures
 * are logged but never block the action being audited.
 */
export async function logSuperAdminAction(entry: SuperAdminAuditEntry): Promise<void> {
  try {
    // Get the last entry's hash (the chain tip)
    const lastEntry = await prisma.superAdminAudit.findFirst({
      orderBy: { createdAt: "desc" },
      select: { entryHash: true },
    });
    const prevHash = lastEntry?.entryHash ?? null;
    const timestamp = new Date().toISOString();

    const entryHash = computeEntryHash(
      prevHash,
      entry.userId,
      entry.action,
      entry.resource,
      timestamp,
    );

    await prisma.superAdminAudit.create({
      data: {
        userId: entry.userId,
        userEmail: entry.userEmail,
        action: entry.action,
        resource: entry.resource,
        result: entry.result,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        metadata: (entry.metadata as any) ?? null,
        entryHash,
        prevHash,
      },
    });
  } catch (err) {
    logError(
      "superadmin-audit",
      `Failed to log action: ${err instanceof Error ? err.message : err}`,
    );
    // Non-blocking — the action was already performed, we just
    // couldn't audit it. The error is logged for investigation.
  }
}

/**
 * Verify the integrity of the SuperAdminAudit hash chain.
 * Returns { valid: boolean, brokenAt?: string } — if broken, brokenAt
 * is the ID of the first entry whose hash doesn't match the computed value.
 */
export async function verifyAuditChain(): Promise<{
  valid: boolean;
  totalEntries: number;
  brokenAt?: string;
}> {
  const entries = await prisma.superAdminAudit.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      userId: true,
      action: true,
      resource: true,
      entryHash: true,
      prevHash: true,
      createdAt: true,
    },
  });

  let prevHash: string | null = null;
  for (const entry of entries) {
    const expectedHash = computeEntryHash(
      prevHash,
      entry.userId,
      entry.action,
      entry.resource,
      entry.createdAt.toISOString(),
    );
    if (entry.entryHash !== expectedHash) {
      return { valid: false, totalEntries: entries.length, brokenAt: entry.id };
    }
    if (entry.prevHash !== prevHash) {
      return { valid: false, totalEntries: entries.length, brokenAt: entry.id };
    }
    prevHash = entry.entryHash;
  }

  return { valid: true, totalEntries: entries.length };
}
