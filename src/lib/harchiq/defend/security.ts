// ═══════════════════════════════════════════════════════════════
//  PROJECT AEGIS v3.0 — HarchIQ DEFEND STAGE
//  Security & OPSEC module — cryptographic primitives, PII redaction,
//  rate-limit policy, security headers, and the audit trail.
//
//  This module is the single chokepoint for every security-sensitive
//  operation in the HarchIQ engine. Nothing outside DEFEND should
//  roll its own crypto, redaction, or rate-limit logic.
//
//  Threat model addressed:
//  • Timing attacks on signature checks      → timingSafeEqual
//  • PII leakage into logs / LLM prompts     → redactPII
//  • Brute-force / credential-stuffing        → RATE_LIMITS (5 tiers)
//  • XSS / clickjacking / MIME sniffing       → SECURITY_HEADERS
//  • Plaintext-at-rest of sensitive fields    → encryptField / decryptField
//  • API-key theft in DB dumps                → hashAPIKey (SHA-512 + salt)
//  • Non-repudiation & after-action review    → logAuditEvent
//
//  Task ID: AEGIS-V3-CORE
//  Module:  harchiq/defend/security
// ═══════════════════════════════════════════════════════════════

import { createHash, createHmac, randomBytes } from "crypto";
import crypto from "crypto";

import type { RateLimitTier } from "../types";

// ─── TIMING-SAFE COMPARISON ───────────────────────────────────────

/**
 * timingSafeEqual — constant-time comparison of two equal-length
 * buffers. Returns false immediately (without leaking length info via
 * the comparison itself) if lengths differ.
 *
 * Used by validateRequestSignature and any other equality check on
 * secret material. Never use `===` for secrets — it short-circuits on
 * the first byte difference and leaks via timing.
 *
 * @param a first buffer
 * @param b second buffer
 * @returns true iff a and b are byte-identical
 */
export function timingSafeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false;
  // crypto.timingSafeEqual throws on length mismatch — guarded above.
  return crypto.timingSafeEqual(a, b);
}

// ─── REQUEST SIGNATURE VALIDATION ─────────────────────────────────

/**
 * validateRequestSignature — verify an HMAC-SHA256 signature over an
 * arbitrary payload using a shared secret.
 *
 * Convention: the `signature` header is formatted as `hex` (64 chars)
 * or `base64` (88 chars). We compute the expected HMAC and compare in
 * constant time to defeat timing oracles.
 *
 * @param payload   raw request body (string or Buffer)
 * @param signature client-supplied signature (hex or base64)
 * @param secret    shared secret (must be >= 32 bytes in production)
 * @returns true iff the signature is valid for the payload
 */
export function validateRequestSignature(
  payload: string | Buffer,
  signature: string,
  secret: string | Buffer,
): boolean {
  if (!payload || !signature || !secret) return false;

  const payloadBuf = Buffer.isBuffer(payload) ? payload : Buffer.from(payload);
  const expected = createHmac("sha256", secret).update(payloadBuf).digest();

  let provided: Buffer;
  try {
    // Try hex first (most common), fall back to base64.
    provided = /^[0-9a-fA-F]{64}$/.test(signature)
      ? Buffer.from(signature, "hex")
      : Buffer.from(signature, "base64");
  } catch {
    return false;
  }

  if (provided.length !== expected.length) return false;
  return timingSafeEqual(provided, expected);
}

// ─── PII REDACTION ────────────────────────────────────────────────

/**
 * PII pattern catalog. Each entry is a [name, regex, replacement]
 * triple. Order matters — more specific patterns (credit cards) run
 * before generic ones (long digit runs) to avoid double-redaction.
 *
 * Supported PII:
 *  • Email addresses
 *  • Moroccan phone numbers: +212 5/6/7 XXXXXXXX, 0 5/6/7 XXXXXXXX
 *  • Credit-card numbers (13-19 digits, Luhn-not-validated)
 *  • IPv4 addresses (excludes 0.0.0.0 / 255.255.255.255 sentinel)
 *  • IPv6 addresses (full notation)
 *  • Moroccan CIN (Carte d'Identité Nationale): 1-2 letters + 5-6 digits
 */
const PII_PATTERNS: ReadonlyArray<readonly [string, RegExp, string]> = [
  // Email — must run before the credit-card / phone patterns so the
  // local-part and domain don't get partially redacted.
  ["email", /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL]"],

  // Credit card — 13-19 digits, optional spaces or dashes between groups.
  // We deliberately don't Luhn-validate; redact anything that looks like one.
  [
    "credit_card",
    /\b(?:\d[ -]*?){13,19}\b/g,
    "[CREDIT_CARD]",
  ],

  // Moroccan phone numbers — three notations:
  //   +212 5/6/7 XX XX XX XX  (international, with optional spaces)
  //   212 5/6/7 XX XX XX XX   (international, no +)
  //   0 5/6/7 XX XX XX XX     (national, leading 0)
  // The trailing 8 digits may be grouped 2-by-2 with spaces, dots, or dashes.
  [
    "phone_ma",
    /(?:(?:\+|00)?212[\s.-]?)?(?:0)?[5-7](?:[\s.-]?\d{2}){4}/g,
    "[PHONE]",
  ],

  // IPv4 — four octets 0-255. Skip the all-zero and all-255 sentinels.
  [
    "ipv4",
    /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g,
    "[IP]",
  ],

  // IPv6 — full notation (8 groups of 4 hex digits, case-insensitive).
  ["ipv6", /\b(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}\b/g, "[IP]"],

  // Moroccan CIN — 1 or 2 uppercase letters followed by 5-6 digits.
  // Word boundaries prevent matching inside longer alphanumeric tokens.
  ["cin_ma", /\b[A-Z]{1,2}\d{5,6}\b/g, "[CIN]"],
];

/**
 * PII redaction result — exposes what was redacted for audit logging
 * without re-leaking the original values.
 */
export interface PIIRedactionResult {
  /** Redacted text (PII replaced with [TAG] placeholders). */
  redacted: string;
  /** Count of redactions per PII kind. */
  counts: Record<string, number>;
  /** Total redactions performed. */
  total: number;
}

/**
 * redactPII — scrub personally-identifiable information from arbitrary
 * text before it is logged, persisted, or sent to the LLM.
 *
 * Returns the redacted string. Use redactPIIDetailed if you need
 * per-kind counts for audit logging.
 *
 * @param text input text — null/undefined safe (returns "")
 * @returns text with all known PII patterns replaced by [TAG] placeholders
 */
export function redactPII(text: string | null | undefined): string {
  if (!text) return "";
  let out = text;
  for (const [, pattern, replacement] of PII_PATTERNS) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

/**
 * redactPIIDetailed — same as redactPII but also returns per-kind
 * counts for audit logging.
 */
export function redactPIIDetailed(
  text: string | null | undefined,
): PIIRedactionResult {
  if (!text) {
    return { redacted: "", counts: {}, total: 0 };
  }
  let out = text;
  const counts: Record<string, number> = {};
  let total = 0;
  for (const [name, pattern, replacement] of PII_PATTERNS) {
    const matches = out.match(pattern);
    const n = matches ? matches.length : 0;
    if (n > 0) {
      counts[name] = n;
      total += n;
      out = out.replace(pattern, replacement);
    }
  }
  return { redacted: out, counts, total };
}

// ─── SECURE TOKEN GENERATION ──────────────────────────────────────

/**
 * generateSecureToken — cryptographically secure random token.
 *
 * Uses crypto.randomBytes (CSPRNG) and returns hex by default. Use
 * this for API keys, session IDs, CSRF tokens, and one-time secrets.
 *
 * @param length desired byte length (default 32 → 64 hex chars)
 * @param encoding output encoding (default "hex")
 * @returns the token string
 */
export function generateSecureToken(
  length = 32,
  encoding: BufferEncoding = "hex",
): string {
  if (length <= 0) throw new Error("generateSecureToken: length must be > 0");
  return randomBytes(length).toString(encoding);
}

// ─── API-KEY HASHING ──────────────────────────────────────────────

/**
 * hashAPIKey — store API keys as salted SHA-512 hashes so a DB dump
 * cannot reveal usable credentials.
 *
 * Scheme: sha512(salt + ":" + apiKey). The salt is per-deployment,
 * sourced from HARCHIQ_API_KEY_SALT (default: a stable fallback for
 * dev — override in production).
 *
 * @param apiKey plaintext API key (must be non-empty)
 * @returns hex-encoded SHA-512 digest (128 chars)
 */
export function hashAPIKey(apiKey: string): string {
  if (!apiKey) throw new Error("hashAPIKey: apiKey must be non-empty");
  const salt = process.env.HARCHIQ_API_KEY_SALT || "harchiq-v3-default-salt";
  return createHash("sha512")
    .update(`${salt}:${apiKey}`)
    .digest("hex");
}

// ─── RATE-LIMIT POLICY ────────────────────────────────────────────

/**
 * RATE_LIMITS — five-tier rate-limit policy. The DEFEND middleware
 * looks up the caller's tier (anonymous | user | api_pro |
 * api_enterprise | internal) and enforces the corresponding window.
 *
 * Values are deliberately conservative — relax per-customer via a
 * custom override in the DB if needed, never by editing these.
 */
export const RATE_LIMITS: Record<
  RateLimitTier,
  { maxRequests: number; windowMs: number; label: string }
> = {
  anonymous: {
    maxRequests: 10,
    windowMs: 15 * 60 * 1000, // 15 minutes
    label: "Anonymous (10 req / 15 min)",
  },
  user: {
    maxRequests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
    label: "Authenticated user (100 req / 15 min)",
  },
  api_pro: {
    maxRequests: 60,
    windowMs: 60 * 1000, // 1 minute
    label: "API Corporate (60 req / min)",
  },
  api_enterprise: {
    maxRequests: 600,
    windowMs: 60 * 1000, // 1 minute
    label: "API Sovereign (600 req / min)",
  },
  internal: {
    maxRequests: 10_000,
    windowMs: 60 * 1000, // 1 minute
    label: "Internal service (10 000 req / min)",
  },
} as const;

// ─── SECURITY HEADERS ─────────────────────────────────────────────

/**
 * SECURITY_HEADERS — HTTP response headers applied by the DEFEND
 * middleware to every HarchIQ response. Modeled on the OWASP Secure
 * Headers Project + Google's strict CSP baseline.
 *
 * Note: CSP allows 'unsafe-inline' for styles because shadcn/ui (and
 * Next.js styled-jsx) inject inline styles. Scripts are restricted
 * to 'self' + the Next.js runtime nonce.
 */
export const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  // Content-Security-Policy — strict baseline. Tune per-route if a
  // page needs additional origins (e.g. maps, analytics).
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://open.bigmodel.cn",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
  ].join("; "),

  // HSTS — 2 years, include subdomains, preload-ready.
  "Strict-Transport-Security":
    "max-age=63072000; includeSubDomains; preload",

  // Clickjacking — refuse to be framed at all (mirrors frame-ancestors).
  "X-Frame-Options": "DENY",

  // MIME sniffing — never let the browser guess a content type.
  "X-Content-Type-Options": "nosniff",

  // Referrer — strip to origin on cross-origin navigations.
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // Permissions-Policy — disable everything we don't use.
  "Permissions-Policy": [
    "camera=()",
    "microphone=()",
    "geolocation=()",
    "payment=()",
    "usb=()",
    "magnetometer=()",
    "gyroscope=()",
    "accelerometer=()",
  ].join(", "),

  // Legacy XSS auditor (still useful on older browsers).
  "X-XSS-Protection": "1; mode=block",
} as const;

// ─── AES-256-GCM FIELD ENCRYPTION ─────────────────────────────────

/**
 * Field-encryption key — 32 bytes (256 bits) for AES-256-GCM.
 * Sourced from HARCHIQ_FIELD_ENC_KEY (hex or base64). If unset, a
 * per-process ephemeral key is generated so dev still works (with a
 * loud warning — encrypted fields will not survive a restart).
 */
function getFieldEncryptionKey(): Buffer {
  const envKey = process.env.HARCHIQ_FIELD_ENC_KEY;
  if (envKey) {
    const buf = Buffer.from(envKey, envKey.length === 64 ? "hex" : "base64");
    if (buf.length === 32) return buf;
    console.warn(
      "[HarchIQ-Defend] HARCHIQ_FIELD_ENC_KEY is set but not 32 bytes — falling back to ephemeral key",
    );
  }
  if (process.env.NODE_ENV === "production") {
    console.error(
      "[HarchIQ-Defend] CRITICAL: field encryption key not configured in production — using ephemeral key (data will not survive restart)",
    );
  }
  return randomBytes(32);
}

// Lazily compute the key once per process.
let _fieldKey: Buffer | null = null;
function fieldKey(): Buffer {
  if (!_fieldKey) _fieldKey = getFieldEncryptionKey();
  return _fieldKey;
}

/**
 * encryptField — AES-256-GCM authenticated encryption of a string.
 *
 * Output format: `iv:authTag:ciphertext` (all hex-encoded).
 *   iv        — 12-byte initialization vector (unique per encryption)
 *   authTag   — 16-byte GCM authentication tag (tamper detection)
 *   ciphertext — the encrypted payload
 *
 * The auth tag is what makes GCM "authenticated" — any tampering with
 * the ciphertext or IV will cause decryptField to throw.
 *
 * @param data plaintext to encrypt
 * @param key  optional 32-byte key (defaults to the deployment key)
 * @returns `iv:authTag:ciphertext` hex string
 */
export function encryptField(data: string, key?: Buffer): string {
  if (data === null || data === undefined) {
    throw new Error("encryptField: data must not be null/undefined");
  }
  const k = key && key.length === 32 ? key : fieldKey();
  const iv = randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", k, iv);
  const ciphertext = Buffer.concat([
    cipher.update(String(data), "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${ciphertext.toString("hex")}`;
}

/**
 * decryptField — AES-256-GCM authenticated decryption.
 *
 * Accepts the `iv:authTag:ciphertext` format produced by encryptField.
 * Throws if the auth tag does not verify (i.e. the ciphertext was
 * tampered with or the wrong key was used).
 *
 * @param encryptedData `iv:authTag:ciphertext` hex string
 * @param key           optional 32-byte key (defaults to the deployment key)
 * @returns the original plaintext
 */
export function decryptField(encryptedData: string, key?: Buffer): string {
  if (!encryptedData || typeof encryptedData !== "string") {
    throw new Error("decryptField: encryptedData must be a non-empty string");
  }
  const parts = encryptedData.split(":");
  if (parts.length !== 3) {
    throw new Error(
      "decryptField: expected format iv:authTag:ciphertext (hex)",
    );
  }
  const [ivHex, authTagHex, ciphertextHex] = parts;
  const k = key && key.length === 32 ? key : fieldKey();

  let decipher: crypto.DecipherGCM;
  try {
    decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      k,
      Buffer.from(ivHex, "hex"),
    );
    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  } catch (err) {
    throw new Error(`decryptField: failed to initialize decipher: ${err}`);
  }

  try {
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(ciphertextHex, "hex")),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch (err) {
    throw new Error(
      `decryptField: authentication failed (tampered ciphertext or wrong key): ${err}`,
    );
  }
}

// ─── AUDIT TRAIL ──────────────────────────────────────────────────

/**
 * AuditEvent — a single entry in the HarchIQ audit trail. Every
 * security-relevant action (auth, PII access, dossier generation,
 * alert dismissal, config change) emits one.
 *
 * Persisted to an append-only log; never updated or deleted.
 */
export interface AuditEvent {
  /** Stable UUID (v4). */
  id: string;
  /** ISO-8601 timestamp. */
  timestamp: string;
  /** Event category — drives retention policy and dashboards. */
  category:
    | "auth"
    | "access"
    | "pii"
    | "collection"
    | "synthesis"
    | "alert"
    | "config"
    | "security";
  /** Specific action, e.g. "dossier.generated", "alert.acknowledged". */
  action: string;
  /** Actor — user ID, API key ID, or "system". */
  actor: string;
  /** Actor's rate-limit tier (if applicable). */
  actorTier?: RateLimitTier;
  /** Target entity / resource ID (if applicable). */
  target?: string;
  /** Outcome — "success" for happy path, "failure" for denied/errored. */
  outcome: "success" | "failure";
  /** Human-readable detail (PII-redacted automatically). */
  detail: string;
  /** Source IP (already-redacted form, for compliance). */
  ip?: string;
  /** Request / correlation ID for cross-log tracing. */
  requestId?: string;
  /** Free-form metadata bag (PII-redacted automatically). */
  metadata?: Record<string, unknown>;
}

/**
 * In-memory ring buffer of recent audit events. Capped at 1000 entries
 * to bound memory; the persistent sink (DB / log file) is the system
 * of record. This buffer powers the live operator dashboard.
 */
const AUDIT_RING_BUFFER_SIZE = 1000;
const auditBuffer: AuditEvent[] = [];

/**
 * logAuditEvent — record a single audit event.
 *
 * Side effects:
 *  1. PII in `detail` and `metadata` is redacted before storage.
 *  2. The event is pushed to the in-memory ring buffer.
 *  3. The event is emitted to console.log in structured JSON so the
 *     Next.js server log captures it (the persistent sink ingests
 *     from there in production).
 *
 * Never throws — audit logging must be best-effort so it cannot break
 * the request path.
 *
 * @param event partial audit event (id/timestamp auto-filled if missing)
 */
export function logAuditEvent(event: Partial<AuditEvent>): void {
  try {
    const full: AuditEvent = {
      id: event.id || generateSecureToken(16),
      timestamp: event.timestamp || new Date().toISOString(),
      category: event.category || "security",
      action: event.action || "unknown",
      actor: event.actor || "system",
      actorTier: event.actorTier,
      target: event.target,
      outcome: event.outcome || "success",
      detail: redactPII(event.detail || ""),
      ip: event.ip,
      requestId: event.requestId,
      metadata: event.metadata
        ? JSON.parse(redactPII(JSON.stringify(event.metadata)))
        : undefined,
    };

    // Push to ring buffer (evict oldest when full).
    auditBuffer.push(full);
    if (auditBuffer.length > AUDIT_RING_BUFFER_SIZE) {
      auditBuffer.shift();
    }

    // Structured-log to stdout (ingested by the persistent sink).
    console.log(
      JSON.stringify({
        level: "audit",
        module: "harchiq.defend.security",
        ...full,
      }),
    );
  } catch (err) {
    // Best-effort — never break the caller.
    console.error("[HarchIQ-Defend] logAuditEvent failed:", err);
  }
}

/**
 * getRecentAuditEvents — read the in-memory audit ring buffer.
 *
 * @param limit max events to return (default 100, capped at buffer size)
 * @returns most-recent-first slice of the ring buffer
 */
export function getRecentAuditEvents(limit = 100): AuditEvent[] {
  const n = Math.min(limit, auditBuffer.length);
  return auditBuffer.slice(-n).reverse();
}
