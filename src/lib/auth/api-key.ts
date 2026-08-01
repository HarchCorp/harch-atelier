// ═══════════════════════════════════════════════════════════════
//  API KEY AUTHENTICATION
//  Task: signal-enterprise-platform
//
//  Public-facing REST API endpoints under /api/v1/* authenticate via
//  Bearer tokens prefixed with `harch_` (e.g. `harch_abc123...`).
//  The plaintext key is shown ONCE when the user creates it via
//  /api/api-keys; the database stores only the SHA-256 hash
//  (ApiKey.keyHash). This module owns:
//
//    • generateApiKey()           — mint a new plaintext + hash pair
//    • hashKey(plaintext)         — deterministic SHA-256 → hex
//    • authenticateApiKey(req)    — resolve a Bearer header to a user
//
//  The authenticated identity is `{ userId, companyId }` so callers
//  can scope their Prisma queries by company without re-reading the
//  user row. Demo isolation is enforced via the `isDemo` flag on the
//  ApiKey→User→Company chain (we don't filter isDemo at the API key
//  layer — that's the caller's responsibility using the returned
//  isDemo flag).
//
//  SERVER-SIDE ONLY — never import this from a client component.
// ═══════════════════════════════════════════════════════════════

import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/db";

export const HARCH_KEY_PREFIX = "harch_";

// ─── Public types ────────────────────────────────────────────────

export interface ApiKeyIdentity {
  userId: string;
  companyId: string;
  /** True for the four executive demo accounts — callers should
   * spread `{ isDemo }` into every Article / RiskAssessment /
   * ReputationScore / SentimentScore where clause. */
  isDemo: boolean;
  /** The ApiKey row id — used by the dispatcher to log provenance. */
  apiKeyId: string;
  /** The user-friendly name the user gave the key at creation. */
  apiKeyName: string;
  /** The tier field on ApiKey (pro | enterprise | ...). */
  tier: string;
}

// ─── Hashing ─────────────────────────────────────────────────────
//
//  SHA-256 is plenty for a high-entropy API key (256 bits of input
//  randomness). bcrypt would be overkill (slow on every API call)
//  and salted hashes aren't useful because the key IS the salt —
//  it has more entropy than any salt we could append.

export function hashKey(plaintext: string): string {
  return createHash("sha256").update(plaintext).digest("hex");
}

// ─── Key generation ──────────────────────────────────────────────
//
//  Format:  harch_<32 hex chars>
//  Entropy: 32 hex chars = 128 bits of randomness — comfortably
//  above the 100-bit OWASP threshold for bearer tokens.

export interface GeneratedApiKey {
  /** The full plaintext key — shown to the user ONCE. */
  plaintext: string;
  /** SHA-256 hex digest of the plaintext — stored in ApiKey.keyHash. */
  hash: string;
  /** First 12 chars of the plaintext, e.g. `harch_ab12cd34` —
   * stored in ApiKey.keyPrefix so the UI can show a recognisable
   * suffix without exposing the full secret. */
  prefix: string;
}

export function generateApiKey(): GeneratedApiKey {
  const rand = randomBytes(16).toString("hex"); // 32 hex chars
  const plaintext = `${HARCH_KEY_PREFIX}${rand}`;
  return {
    plaintext,
    hash: hashKey(plaintext),
    prefix: plaintext.slice(0, 12),
  };
}

// ─── Authentication ──────────────────────────────────────────────
//
//  authenticateApiKey(req):
//    1. Read the Authorization header.
//    2. Require the `Bearer harch_` scheme (case-sensitive on the
//       prefix — typos here are usually real bugs, not user error).
//    3. Hash the supplied key and look it up in ApiKey.keyHash.
//    4. Reject if:
//         • key not found
//         • key has been revoked (revokedAt != null)
//         • key has expired (expiresAt < now)
//         • user is suspended or has no companyId
//    5. Best-effort update of ApiKey.lastUsedAt (fire-and-forget —
//       we never block the API call on a bookkeeping write).
//    6. Return the identity (userId + companyId + isDemo).
//
//  Returns null on any failure — callers should respond with 401
//  Unauthorized (NOT 403, because the request lacks valid auth
//  credentials, not authorization for a specific resource).

export async function authenticateApiKey(
  req: Request,
): Promise<ApiKeyIdentity | null> {
  const auth = req.headers.get("authorization");
  if (!auth) return null;
  if (!auth.startsWith(`Bearer ${HARCH_KEY_PREFIX}`)) return null;

  const key = auth.slice(`Bearer `.length).trim();
  if (!key || !key.startsWith(HARCH_KEY_PREFIX)) return null;
  if (key.length < HARCH_KEY_PREFIX.length + 16) return null; // too short to be real

  const hashedKey = hashKey(key);

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash: hashedKey },
    include: {
      user: {
        select: {
          id: true,
          companyId: true,
          status: true,
          isDemo: true,
        },
      },
    },
  });

  if (!apiKey) return null;
  if (apiKey.revokedAt) return null;
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return null;
  if (!apiKey.user) return null;
  if (apiKey.user.status === "suspended") return null;
  if (!apiKey.user.companyId) return null;

  // Best-effort lastUsedAt stamp (fire-and-forget).
  prisma.apiKey
    .update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    })
    .catch(() => {
      /* swallow — best-effort */
    });

  return {
    userId: apiKey.user.id,
    companyId: apiKey.user.companyId,
    isDemo: apiKey.user.isDemo === true,
    apiKeyId: apiKey.id,
    apiKeyName: apiKey.name,
    tier: apiKey.tier,
  };
}

// ─── Helper: convert identity → 401 response ─────────────────────
//
//  Boilerplate saver used by every /api/v1/* route:
//
//    const identity = await authenticateApiKey(req);
//    if (!identity) return unauthorizedResponse();
//
//  Returns a JSON:api-style error so clients can render a friendly
//  message without inspecting the body shape.

export function unauthorizedResponse(): Response {
  return new Response(
    JSON.stringify({
      error: "Unauthorized",
      message:
        "Missing or invalid API key. Pass it as `Authorization: Bearer harch_<your-key>`.",
    }),
    {
      status: 401,
      headers: { "Content-Type": "application/json" },
    },
  );
}
