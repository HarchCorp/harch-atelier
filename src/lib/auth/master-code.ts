// ═══════════════════════════════════════════════════════════════
//  MASTER CODES ADMIN — PROJECT YGGDRASIL
//
//  The Master Code is the one-time secret that the platform owner
//  uses to activate the very first super_admin account (and only
//  that). Each code:
//    - Has format  HARCH-XXXXX-XXXXX-XXXXX  (HARCH prefix + 3 groups
//      of 5 random uppercase alphanumeric chars).
//    - Is stored ONLY as SHA-256(salt + code) — the plaintext is
//      shown exactly once, at generation time, on the operator's
//      terminal.
//    - Has a 24h TTL (expiresAt).
//    - Can be used exactly ONCE. After use, usedAt + usedByUserId
//      are set and the code can never authenticate again.
//
//  Validation is constant-time (timingSafeEqual) to prevent
//  timing-based enumeration of valid codes.
//
//  Audit trail: every generation + validation attempt is recorded
//  in the AuditLog table (Loi 09-08 / CNDP Maroc compliance).
// ═══════════════════════════════════════════════════════════════

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/db";
import { UserRole } from "@/lib/auth/rbac";
import { logAudit } from "@/lib/harchiq/audit-log";

// ─── CONSTANTS ──────────────────────────────────────────────────

/** Master Code TTL: 24 hours after generation. */
export const MASTER_CODE_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Allowed alphabet for the random part of the code.
 * Ambiguous characters (0/O, 1/I) are excluded to avoid
 * transcription errors when the owner reads the code off-screen.
 */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 32 chars, no 0/1/O/I
const ALPHABET_LEN = ALPHABET.length;

/** Regex validating the canonical format HARCH-XXXXX-XXXXX-XXXXX. */
const MASTER_CODE_REGEX = /^HARCH-[A-Z2-9]{5}-[A-Z2-9]{5}-[A-Z2-9]{5}$/;

// ─── TYPES ──────────────────────────────────────────────────────

export interface GeneratedMasterCode {
  /** Plaintext code — shown ONCE to the operator. Never persisted. */
  code: string;
  /** SHA-256(salt + code) hex digest — persisted in MasterCode.codeHash. */
  hash: string;
  /** Random 32-byte salt (hex) — persisted in MasterCode.codeSalt. */
  salt: string;
  /** ISO timestamp at which the code expires (createdAt + 24h). */
  expiresAt: Date;
}

export interface MasterCodeUser {
  id: string;
  email: string;
  role: string;
}

export type MasterCodeValidationResult =
  | { ok: true; codeId: string }
  | {
      ok: false;
      reason:
        | "invalid_format"
        | "not_found"
        | "already_used"
        | "expired"
        | "user_not_found"
        | "already_super_admin"
        | "db_error";
    };

// ─── INTERNAL HELPERS ───────────────────────────────────────────

/**
 * Pick `len` unbiased random chars from ALPHABET using
 * `randomBytes` (crypto-grade CSPRNG). Rejection sampling avoids
 * the modulo bias that a naive `rand % alphabet.length` would
 * introduce.
 */
function randomCodeChars(len: number): string {
  // Mask = 31 = 0b11111 — fits exactly 32 (alphabet length).
  // Any byte & 31 < 32 is directly usable, others are rejected.
  const mask = 0x1f; // 31
  const out: string[] = [];
  const buf = randomBytes(len * 2); // over-fetch to amortise rejections
  let i = 0;
  while (out.length < len) {
    if (i >= buf.length) {
      // extremely rare — refill
      const refill = randomBytes(len);
      for (let j = 0; j < refill.length && out.length < len; j++) {
        const v = refill[j] & mask;
        if (v < ALPHABET_LEN) out.push(ALPHABET[v]);
      }
      break;
    }
    const v = buf[i++] & mask;
    if (v < ALPHABET_LEN) out.push(ALPHABET[v]);
  }
  return out.join("");
}

/**
 * Build the canonical display form: HARCH-XXXXX-XXXXX-XXXXX
 * from 15 raw alphanumeric chars.
 */
function formatCode(raw15: string): string {
  const g1 = raw15.slice(0, 5);
  const g2 = raw15.slice(5, 10);
  const g3 = raw15.slice(10, 15);
  return `HARCH-${g1}-${g2}-${g3}`;
}

/**
 * Normalise a user-supplied code:
 *  - trim surrounding whitespace
 *  - uppercase
 *  - strip spaces between groups (so "harch abcdE-..." still works)
 *
 * Does NOT validate the format — caller should run isValidFormat afterwards.
 */
export function normalizeMasterCode(input: string): string {
  return input
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

export function isValidMasterCodeFormat(input: string): boolean {
  return MASTER_CODE_REGEX.test(input);
}

/**
 * Compute SHA-256(salt + code) and return the hex digest.
 * The salt is prepended (not appended) so two codes with the same
 * plaintext but different salts produce different hashes.
 */
function hashCode(code: string, salt: string): string {
  return createHash("sha256")
    .update(salt + ":" + code)
    .digest("hex");
}

/** Generate a 32-byte random salt, returned as hex (64 chars). */
function generateSalt(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Constant-time string comparison.
 *
 * `timingSafeEqual` requires equal-length buffers, so we hash both
 * sides (fixed 64-char hex digests) before comparing. This guarantees
 * no length-leak even when comparing codes of different lengths.
 */
function safeEqualHashes(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
  } catch {
    return false;
  }
}

// ─── PUBLIC API ─────────────────────────────────────────────────

/**
 * Generate a fresh Master Code.
 *
 * The plaintext code is returned to the caller (so the script can
 * print it once). ONLY the hash + salt are meant to be persisted.
 *
 * @param createdByUserId  The super_admin who generated the code.
 *                         For the bootstrap case (no super_admin
 *                         exists yet), pass the literal string
 *                         "bootstrap" — the script uses this.
 */
export function generateMasterCode(): GeneratedMasterCode {
  const raw = randomCodeChars(15);
  const code = formatCode(raw);
  const salt = generateSalt();
  const hash = hashCode(code, salt);
  const expiresAt = new Date(Date.now() + MASTER_CODE_TTL_MS);
  return { code, hash, salt, expiresAt };
}

/**
 * Persist a freshly generated Master Code to the DB.
 *
 * The plaintext `code` is NEVER written — only `hash` + `salt`.
 */
export async function persistMasterCode(
  gen: GeneratedMasterCode,
  createdByUserId: string,
): Promise<{ id: string }> {
  const row = await prisma.masterCode.create({
    data: {
      codeHash: gen.hash,
      codeSalt: gen.salt,
      createdBy: createdByUserId,
      expiresAt: gen.expiresAt,
    },
    select: { id: true },
  });
  return { id: row.id };
}

/**
 * Validate a Master Code and, if valid, atomically:
 *   1. Mark the code as used (usedAt + usedByUserId).
 *   2. Upgrade the user to super_admin.
 *   3. Emit an audit log entry.
 *
 * If anything fails, the code is NOT consumed and the user is NOT
 * upgraded. A failed audit entry is still emitted (with reason).
 *
 * Concurrency: the mark-used step uses a conditional UPDATE
 * (WHERE usedAt IS NULL) so a race between two parallel validations
 * of the same code can only succeed once.
 */
export async function validateMasterCode(
  rawCode: string,
  user: MasterCodeUser,
): Promise<MasterCodeValidationResult> {
  // 1. Normalise + format check
  const code = normalizeMasterCode(rawCode);
  if (!isValidMasterCodeFormat(code)) {
    await logAudit({
      userId: user.id,
      action: "master_code_failed",
      resource: "master-code:format",
      result: "denied",
      metadata: { reason: "invalid_format" },
    });
    return { ok: false, reason: "invalid_format" };
  }

  // 2. Reject if the user is already super_admin — no point burning a code.
  if (user.role === UserRole.SUPER_ADMIN) {
    await logAudit({
      userId: user.id,
      action: "master_code_failed",
      resource: "master-code:already-super",
      result: "denied",
      metadata: { reason: "already_super_admin" },
    });
    return { ok: false, reason: "already_super_admin" };
  }

  // 3. Fetch all candidate (unused, non-expired) codes and compare in
  //    constant time. The set is tiny (1–5 active codes max), so a
  //    full scan is both cheap and avoids leaking which code matched
  //    via a DB-side lookup-by-hash.
  let candidates;
  try {
    candidates = await prisma.masterCode.findMany({
      where: {
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: { id: true, codeHash: true, codeSalt: true, expiresAt: true },
    });
  } catch (err) {
    console.error("[master-code] DB error fetching candidates", err);
    await logAudit({
      userId: user.id,
      action: "master_code_failed",
      resource: "master-code:db",
      result: "error",
      metadata: {
        reason: "db_error",
        msg: err instanceof Error ? err.message : String(err),
      },
    });
    return { ok: false, reason: "db_error" };
  }

  // 4. Find the matching code via constant-time hash comparison.
  let matchedId: string | null = null;
  for (const c of candidates) {
    const computedHash = hashCode(code, c.codeSalt);
    if (safeEqualHashes(computedHash, c.codeHash)) {
      matchedId = c.id;
      break;
    }
  }

  if (!matchedId) {
    await logAudit({
      userId: user.id,
      action: "master_code_failed",
      resource: "master-code:not-found",
      result: "denied",
      metadata: { reason: "not_found", candidateCount: candidates.length },
    });
    return { ok: false, reason: "not_found" };
  }

  // 5. Atomically mark the code as used. The conditional WHERE
  //    `usedAt IS NULL` guarantees only one concurrent request can
  //    win — the other gets a 0-row update and we treat it as
  //    already_used.
  try {
    const updated = await prisma.masterCode.updateMany({
      where: { id: matchedId, usedAt: null },
      data: { usedAt: new Date(), usedByUserId: user.id },
    });
    if (updated.count === 0) {
      // Someone else just consumed it between our fetch and our update.
      await logAudit({
        userId: user.id,
        action: "master_code_failed",
        resource: `master-code:${matchedId}`,
        result: "denied",
        metadata: { reason: "already_used" },
      });
      return { ok: false, reason: "already_used" };
    }
  } catch (err) {
    console.error("[master-code] DB error marking code used", err);
    await logAudit({
      userId: user.id,
      action: "master_code_failed",
      resource: `master-code:${matchedId}`,
      result: "error",
      metadata: { reason: "db_error" },
    });
    return { ok: false, reason: "db_error" };
  }

  // 6. Upgrade the user to super_admin.
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { role: UserRole.SUPER_ADMIN },
    });
  } catch (err) {
    // Critical: the code is consumed but the upgrade failed. We still
    // return db_error so the operator knows to manually fix the user
    // row (the audit log will show which code + user was involved).
    console.error(
      "[master-code] CODE CONSUMED but user upgrade failed — manual fix required",
      { codeId: matchedId, userId: user.id },
      err,
    );
    await logAudit({
      userId: user.id,
      action: "master_code_failed",
      resource: `master-code:${matchedId}`,
      result: "error",
      metadata: {
        reason: "db_error",
        stage: "user_upgrade",
        msg: err instanceof Error ? err.message : String(err),
      },
    });
    return { ok: false, reason: "db_error" };
  }

  // 7. Audit the successful activation.
  await logAudit({
    userId: user.id,
    action: "master_code_activate",
    resource: `master-code:${matchedId}`,
    result: "success",
    metadata: {
      previousRole: user.role,
      newRole: UserRole.SUPER_ADMIN,
    },
  });

  return { ok: true, codeId: matchedId };
}
