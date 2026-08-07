// ═══════════════════════════════════════════════════════════════
//  ZKP AUTH — Zero-Knowledge Proof Authentication (SRP-like)
//
//  N(10,10,100) — The server NEVER knows the password. Not in
//  transit, not hashed, not even as a bcrypt digest. The DB stores
//  only a cryptographic VERIFIER (a public key derived from the
//  password). Authentication works via challenge-response:
//
//    1. REGISTER: client derives a keypair from password (PBKDF2 → ECDSA).
//       Stores the PUBLIC KEY (verifier) on the server. Private key
//       never leaves the client. The password is NEVER transmitted.
//
//    2. LOGIN CHALLENGE: server sends a random challenge (nonce).
//
//    3. LOGIN PROOF: client signs the challenge with the private key
//       (which it re-derives from the password locally). Sends the
//       signature to the server.
//
//    4. VERIFY: server verifies the signature against the stored
//       public key. If valid → authenticated. The password was
//       NEVER on the network.
//
//  NEMESIS defense:
//    - Network payload contains ONLY: { email, signature, challengeId }
//    - NO password, NO hash, NO bcrypt digest in transit
//    - DB stores ONLY: { email, publicKey } — useless without the
//      password to re-derive the private key
//    - If DB is stolen: attacker has public keys only (can't sign)
//
//  Uses Web Crypto API (SubtleCrypto) — available in browsers + Node 20+.
// ═══════════════════════════════════════════════════════════════

// ─── Constants ────────────────────────────────────────────────────

const PBKDF2_ITERATIONS = 150_000; // high iteration count = slow to brute-force
const SALT_LENGTH = 32; // bytes
const CHALLENGE_LENGTH = 32; // bytes
const KEY_FORMAT = "jwk";

// ─── Type definitions ─────────────────────────────────────────────

export interface ZKPRegistrationPayload {
  email: string;
  /** The public key (verifier) — a JWK EC P-256 public key. */
  publicKey: JsonWebKey;
  /** The salt used for PBKDF2 (stored alongside the public key). */
  salt: string; // base64
  /** PBKDF2 iteration count (stored for re-derivation at login). */
  iterations: number;
}

export interface ZKPChallengePayload {
  challengeId: string;
  /** Random nonce the client must sign with its private key. */
  challenge: string; // base64
  /** The salt + iterations needed to re-derive the private key. */
  salt: string; // base64
  iterations: number;
  expiresAt: string; // ISO
}

export interface ZKPLoginPayload {
  email: string;
  challengeId: string;
  /** Signature of the challenge, signed with the private key. */
  signature: string; // base64
  /** The public key JWK (sent so the server can verify without a DB lookup
       if needed — but normally the server has it stored). */
  publicKey?: JsonWebKey;
}

export interface ZKPStoredVerifier {
  email: string;
  publicKey: JsonWebKey;
  salt: string;
  iterations: number;
}

// ─── Helper: base64 ↔ ArrayBuffer ─────────────────────────────────

function bufToBase64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuf(b64: string): ArrayBuffer {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// ─── Client-side: key derivation + signing ────────────────────────

/**
 * Derive an ECDSA keypair from a password + salt using PBKDF2.
 * The PRIVATE key never leaves the client. The PUBLIC key is the
 * verifier stored on the server.
 *
 * This function runs in the browser (Web Crypto API) or Node 20+.
 */
export async function deriveKeyPairFromPassword(
  password: string,
  saltBase64: string,
  iterations: number = PBKDF2_ITERATIONS,
): Promise<CryptoKeyPair> {
  // 1. Import the password as a raw key
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"],
  );

  // 2. Derive a key using PBKDF2 → HKDF → ECDSA
  //    PBKDF2(password, salt, iterations) → 256 bits of entropy
  //    → use as EC P-256 private key
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: base64ToBuf(saltBase64),
      iterations,
      hash: "SHA-256",
    },
    passwordKey,
    256, // 256 bits = P-256 private key size
  );

  // 3. Import the derived bits as an EC P-256 private key
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    derivedBits,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );

  // 4. Derive the public key from the private key
  const publicKey = await crypto.subtle.exportKey(KEY_FORMAT, privateKey);

  // Re-import as a key pair (we need the private key for signing)
  const publicCryptoKey = await crypto.subtle.importKey(
    KEY_FORMAT,
    publicKey,
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["verify"],
  );

  return { privateKey, publicKey: publicCryptoKey };
}

/**
 * Generate a random salt (32 bytes, base64-encoded).
 */
export function generateSalt(): string {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  return bufToBase64(salt);
}

/**
 * Generate a random challenge nonce (32 bytes, base64-encoded).
 */
export function generateChallenge(): string {
  const challenge = crypto.getRandomValues(new Uint8Array(CHALLENGE_LENGTH));
  return bufToBase64(challenge);
}

/**
 * Sign a challenge with the private key. Returns base64 signature.
 */
export async function signChallenge(
  privateKey: CryptoKey,
  challengeBase64: string,
): Promise<string> {
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privateKey,
    base64ToBuf(challengeBase64),
  );
  return bufToBase64(signature);
}

/**
 * Verify a signature against a public key. Returns true if valid.
 */
export async function verifySignature(
  publicKey: CryptoKey | JsonWebKey,
  signatureBase64: string,
  challengeBase64: string,
): Promise<boolean> {
  let cryptoKey: CryptoKey;
  if (publicKey instanceof CryptoKey) {
    cryptoKey = publicKey;
  } else {
    // It's a JWK — import it
    cryptoKey = await crypto.subtle.importKey(
      KEY_FORMAT,
      publicKey,
      { name: "ECDSA", namedCurve: "P-256" },
      true,
      ["verify"],
    );
  }

  return crypto.subtle.verify(
    { name: "ECDSA", hash: "SHA-256" },
    cryptoKey,
    base64ToBuf(signatureBase64),
    base64ToBuf(challengeBase64),
  );
}

/**
 * Export a public key as JWK (for storage on the server).
 */
export async function exportPublicKey(publicKey: CryptoKey): Promise<JsonWebKey> {
  return crypto.subtle.exportKey(KEY_FORMAT, publicKey);
}

// ─── Server-side: challenge store (in-memory, expires in 60s) ─────

interface ChallengeEntry {
  challenge: string;
  email: string;
  createdAt: number;
}

const challengeStore = new Map<string, ChallengeEntry>();
const CHALLENGE_TTL_MS = 60_000; // 60 seconds

/**
 * Store a challenge with its ID. Returns the challenge ID.
 */
export function storeChallenge(challengeId: string, email: string, challenge: string): void {
  challengeStore.set(challengeId, { challenge, email, createdAt: Date.now() });
  // Prune expired challenges
  const now = Date.now();
  for (const [id, entry] of challengeStore) {
    if (now - entry.createdAt > CHALLENGE_TTL_MS) {
      challengeStore.delete(id);
    }
  }
}

/**
 * Consume a challenge (one-time use). Returns the challenge + email
 * if valid, null if expired/not found.
 */
export function consumeChallenge(challengeId: string): { challenge: string; email: string } | null {
  const entry = challengeStore.get(challengeId);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > CHALLENGE_TTL_MS) {
    challengeStore.delete(challengeId);
    return null;
  }
  challengeStore.delete(challengeId); // one-time use
  return { challenge: entry.challenge, email: entry.email };
}
