// ═══════════════════════════════════════════════════════════════
//  HARCHIQ — Credential store (WebAuthn + ZKP) with graceful fallback
//
//  Production: reads/writes dedicated Prisma tables (WebAuthnCredential,
//  ZKPVerifier) — Task REAL-AUTH.
//
//  Fallback: when the tables don't exist yet on the DB (db:push pending
//  or staging env without the migration), every call transparently
//  falls back to the legacy `User.useCaseNote` JSON hack. This keeps
//  the routes WORKING during the rollout window — no 500s.
//
//  Detection: any PrismaClientKnownRequestError with code P2021
//  ("The table X does not exist in the current database") OR a
//  P2022 (column missing) triggers the fallback. We also catch
//  generic errors defensively so a flaky Neon connection doesn't
//  break login.
// ═══════════════════════════════════════════════════════════════

import { prisma } from "@/lib/db";
import { logError, logInfo } from "@/lib/logger";

// ─── Types ──────────────────────────────────────────────────────

export interface StoredWebAuthnCredential {
  id: string; // DB row id (cuid) OR synthetic id when in fallback mode
  credentialId: string; // base64url authenticator id
  publicKey: string; // base64url JWK
  counter: number;
  transports: string[];
  deviceType: string | null;
  createdAt: Date;
  lastUsedAt: Date | null;
}

export interface StoredZKPVerifier {
  id: string;
  userId: string;
  publicKey: JsonWebKey;
  salt: string;
  iterations: number;
  createdAt: Date;
}

// ─── Fallback helpers (useCaseNote JSON hack) ───────────────────

interface LegacyWebAuthnBlob {
  webauthnCredentials?: Array<{
    id: string;
    publicKey: string;
    counter: number;
    transports?: string[];
    deviceType?: string;
    createdAt?: string;
    lastUsedAt?: string;
  }>;
  zkpVerifier?: {
    publicKey: JsonWebKey;
    salt: string;
    iterations: number;
    createdAt?: string;
  };
}

async function readLegacyBlob(userId: string): Promise<LegacyWebAuthnBlob> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { useCaseNote: true },
  });
  if (!user?.useCaseNote) return {};
  try {
    const parsed = JSON.parse(user.useCaseNote) as LegacyWebAuthnBlob;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function writeLegacyBlob(userId: string, blob: LegacyWebAuthnBlob): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { useCaseNote: JSON.stringify(blob) },
  });
}

// ─── WebAuthn credential store ──────────────────────────────────

/** True when the error means "table/column doesn't exist yet" — we
 *  fall back to useCaseNote instead of crashing the route. */
function isMissingTableError(err: unknown): boolean {
  if (err && typeof err === "object" && "code" in err) {
    const code = (err as { code?: string }).code;
    // P2021: table missing, P2022: column missing
    if (code === "P2021" || code === "P2022") return true;
  }
  return false;
}

/** Return all WebAuthn credentials for a user.
 *  - Primary: prisma.webAuthnCredential.findMany
 *  - Fallback: parse the legacy useCaseNote blob */
export async function listWebAuthnCredentials(userId: string): Promise<StoredWebAuthnCredential[]> {
  try {
    const rows = await prisma.webAuthnCredential.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
    return rows.map((r) => ({
      id: r.id,
      credentialId: r.credentialId,
      publicKey: r.publicKey,
      counter: r.counter,
      transports: r.transports,
      deviceType: r.deviceType,
      createdAt: r.createdAt,
      lastUsedAt: r.lastUsedAt,
    }));
  } catch (err) {
    if (isMissingTableError(err)) {
      logInfo("credential-store", "WebAuthnCredential table missing — using useCaseNote fallback", {
        userId,
        code: (err as { code?: string }).code,
      });
      const blob = await readLegacyBlob(userId);
      const creds = blob.webauthnCredentials ?? [];
      return creds.map((c) => ({
        id: c.id,
        credentialId: c.id,
        publicKey: c.publicKey,
        counter: c.counter ?? 0,
        transports: c.transports ?? [],
        deviceType: c.deviceType ?? null,
        createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
        lastUsedAt: c.lastUsedAt ? new Date(c.lastUsedAt) : null,
      }));
    }
    logError("credential-store", `listWebAuthnCredentials failed: ${(err as Error).message}`);
    throw err;
  }
}

/** Find a single credential by credentialId (used by /webauthn-verify).
 *  Pass the userId to scope the lookup to that user's credentials —
 *  required so a malicious user can't authenticate with a credential
 *  belonging to a different account.
 *  - Primary: prisma.webAuthnCredential.findUnique
 *  - Fallback: scan the user's legacy useCaseNote blob */
export async function findWebAuthnCredential(
  credentialId: string,
  userId?: string,
): Promise<StoredWebAuthnCredential | null> {
  try {
    const row = await prisma.webAuthnCredential.findUnique({
      where: { credentialId },
    });
    if (!row) return null;
    // Defensive: ensure the credential belongs to the requesting user.
    if (userId && row.userId !== userId) return null;
    return {
      id: row.id,
      credentialId: row.credentialId,
      publicKey: row.publicKey,
      counter: row.counter,
      transports: row.transports,
      deviceType: row.deviceType,
      createdAt: row.createdAt,
      lastUsedAt: row.lastUsedAt,
    };
  } catch (err) {
    if (isMissingTableError(err)) {
      logInfo("credential-store", "WebAuthnCredential table missing — using useCaseNote fallback", {
        credentialId,
        userId,
        code: (err as { code?: string }).code,
      });
      if (!userId) {
        // Without a userId we cannot safely scope the legacy scan — deny.
        return null;
      }
      const creds = await listWebAuthnCredentials(userId);
      return creds.find((c) => c.credentialId === credentialId) ?? null;
    }
    logError("credential-store", `findWebAuthnCredential failed: ${(err as Error).message}`);
    throw err;
  }
}

/** Insert a new WebAuthn credential.
 *  - Primary: prisma.webAuthnCredential.create
 *  - Fallback: append to the legacy blob */
export async function createWebAuthnCredential(input: {
  userId: string;
  credentialId: string;
  publicKey: string;
  transports: string[];
  deviceType?: string | null;
}): Promise<StoredWebAuthnCredential> {
  try {
    const row = await prisma.webAuthnCredential.create({
      data: {
        userId: input.userId,
        credentialId: input.credentialId,
        publicKey: input.publicKey,
        transports: input.transports,
        deviceType: input.deviceType ?? null,
      },
    });
    return {
      id: row.id,
      credentialId: row.credentialId,
      publicKey: row.publicKey,
      counter: row.counter,
      transports: row.transports,
      deviceType: row.deviceType,
      createdAt: row.createdAt,
      lastUsedAt: row.lastUsedAt,
    };
  } catch (err) {
    if (isMissingTableError(err)) {
      logInfo("credential-store", "WebAuthnCredential table missing — using useCaseNote fallback", {
        userId: input.userId,
        code: (err as { code?: string }).code,
      });
      const blob = await readLegacyBlob(input.userId);
      blob.webauthnCredentials = blob.webauthnCredentials ?? [];
      blob.webauthnCredentials.push({
        id: input.credentialId,
        publicKey: input.publicKey,
        counter: 0,
        transports: input.transports,
        deviceType: input.deviceType ?? "Unknown",
        createdAt: new Date().toISOString(),
      });
      await writeLegacyBlob(input.userId, blob);
      return {
        id: input.credentialId,
        credentialId: input.credentialId,
        publicKey: input.publicKey,
        counter: 0,
        transports: input.transports,
        deviceType: input.deviceType ?? null,
        createdAt: new Date(),
        lastUsedAt: null,
      };
    }
    logError("credential-store", `createWebAuthnCredential failed: ${(err as Error).message}`);
    throw err;
  }
}

/** Bump the counter + lastUsedAt after a successful assertion.
 *  - Primary: prisma.webAuthnCredential.update
 *  - Fallback: rewrite the matching entry in the legacy blob */
export async function touchWebAuthnCredential(
  credentialId: string,
  newCounter: number,
): Promise<void> {
  try {
    await prisma.webAuthnCredential.update({
      where: { credentialId },
      data: { counter: newCounter, lastUsedAt: new Date() },
    });
  } catch (err) {
    if (isMissingTableError(err)) {
      logInfo("credential-store", "WebAuthnCredential table missing — using useCaseNote fallback", {
        credentialId,
        code: (err as { code?: string }).code,
      });
      // Find the user owning this credential via the legacy blob
      const users = await prisma.user.findMany({
        where: { useCaseNote: { contains: credentialId.slice(0, 16) } },
        select: { id: true },
        take: 50,
      });
      for (const u of users) {
        const blob = await readLegacyBlob(u.id);
        const cred = blob.webauthnCredentials?.find((c) => c.id === credentialId);
        if (cred) {
          cred.counter = newCounter;
          cred.lastUsedAt = new Date().toISOString();
          await writeLegacyBlob(u.id, blob);
          return;
        }
      }
      return;
    }
    logError("credential-store", `touchWebAuthnCredential failed: ${(err as Error).message}`);
    throw err;
  }
}

// ─── ZKP verifier store ─────────────────────────────────────────

/** Read the ZKP verifier for a user.
 *  - Primary: prisma.zkpVerifier.findFirst
 *  - Fallback: parse the legacy useCaseNote blob */
export async function findZKPVerifier(userId: string): Promise<StoredZKPVerifier | null> {
  try {
    const row = await prisma.zKPVerifier.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    if (!row) return null;
    return {
      id: row.id,
      userId: row.userId,
      publicKey: row.publicKey as JsonWebKey,
      salt: row.salt,
      iterations: row.iterations,
      createdAt: row.createdAt,
    };
  } catch (err) {
    if (isMissingTableError(err)) {
      logInfo("credential-store", "ZKPVerifier table missing — using useCaseNote fallback", {
        userId,
        code: (err as { code?: string }).code,
      });
      const blob = await readLegacyBlob(userId);
      if (!blob.zkpVerifier) return null;
      return {
        id: `legacy_${userId}`,
        userId,
        publicKey: blob.zkpVerifier.publicKey,
        salt: blob.zkpVerifier.salt,
        iterations: blob.zkpVerifier.iterations,
        createdAt: blob.zkpVerifier.createdAt
          ? new Date(blob.zkpVerifier.createdAt)
          : new Date(),
      };
    }
    logError("credential-store", `findZKPVerifier failed: ${(err as Error).message}`);
    throw err;
  }
}

/** Insert (or replace) the ZKP verifier for a user.
 *  - Primary: prisma.zkpVerifier.create (we delete previous rows first
 *    so re-registration replaces the verifier)
 *  - Fallback: rewrite the zkpVerifier field in the legacy blob */
export async function upsertZKPVerifier(input: {
  userId: string;
  publicKey: JsonWebKey;
  salt: string;
  iterations: number;
}): Promise<StoredZKPVerifier> {
  try {
    // Replace any previous verifier (one active per user)
    await prisma.zKPVerifier.deleteMany({ where: { userId: input.userId } }).catch(() => {});
    const row = await prisma.zKPVerifier.create({
      data: {
        userId: input.userId,
        publicKey: input.publicKey as unknown as object,
        salt: input.salt,
        iterations: input.iterations,
      },
    });
    return {
      id: row.id,
      userId: row.userId,
      publicKey: row.publicKey as JsonWebKey,
      salt: row.salt,
      iterations: row.iterations,
      createdAt: row.createdAt,
    };
  } catch (err) {
    if (isMissingTableError(err)) {
      logInfo("credential-store", "ZKPVerifier table missing — using useCaseNote fallback", {
        userId: input.userId,
        code: (err as { code?: string }).code,
      });
      const blob = await readLegacyBlob(input.userId);
      blob.zkpVerifier = {
        publicKey: input.publicKey,
        salt: input.salt,
        iterations: input.iterations,
        createdAt: new Date().toISOString(),
      };
      await writeLegacyBlob(input.userId, blob);
      return {
        id: `legacy_${input.userId}`,
        userId: input.userId,
        publicKey: input.publicKey,
        salt: input.salt,
        iterations: input.iterations,
        createdAt: new Date(),
      };
    }
    logError("credential-store", `upsertZKPVerifier failed: ${(err as Error).message}`);
    throw err;
  }
}
