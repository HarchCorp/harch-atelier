import { logError } from "@/lib/logger";
// ═══════════════════════════════════════════════════════════════
//  WEBAUTHN / PASSKEYS — Passwordless authentication via biometrics
//
//  N(10,10,100) expansion — replaces passwords with:
//    • TouchID / FaceID (Apple)
//    • Windows Hello
//    • YubiKey / hardware security keys
//    • Android fingerprint
//
//  The private key NEVER leaves the device. The server stores only
//  the public key (credential). Authentication works via:
//    1. REGISTER: browser creates a keypair via navigator.credentials.create()
//       → server stores the public key (credential)
//    2. LOGIN: browser signs a challenge via navigator.credentials.get()
//       → server verifies the signature against the stored public key
//
//  No password. No hash. No ZKP derivation. The keypair is generated
//  by the device's secure enclave — it can never be extracted.
//
//  NEMESIS defense:
//    - Network payload contains ONLY: { credentialId, authenticatorData,
//      clientDataJSON, signature } — all base64 encoded binary blobs
//    - The private key is hardware-bound — even if the DB is stolen,
//      the attacker can't authenticate without the physical device
// ═══════════════════════════════════════════════════════════════

// ─── Types ────────────────────────────────────────────────────────

export interface StoredCredential {
  id: string;          // credential ID (base64url)
  publicKey: string;   // public key (base64url — COSE format)
  counter: number;     // sign count (prevents replay attacks)
  transports?: string[]; // internal/usb/nfc/ble/hybrid
  deviceType?: string;  // "TouchID" | "Windows Hello" | "YubiKey" etc
  createdAt: string;
}

export interface RegistrationChallenge {
  challenge: string;        // base64url — random 32 bytes
  userId: string;           // user handle (base64url)
  userName: string;
  userDisplayName: string;
  rpId: string;             // relying party ID (e.g. "localhost" or "atelier.harchcorp.com")
  rpName: string;           // display name
  excludeCredentials: { id: string; type: "public-key" }[];
}

export interface VerificationChallenge {
  challenge: string;        // base64url — random 32 bytes
  rpId: string;
  allowCredentials: { id: string; type: "public-key"; transports?: string[] }[];
  userVerification: "required" | "preferred" | "discouraged";
}

// ─── Challenge generation ─────────────────────────────────────────

/** Generate a random 32-byte challenge, base64url-encoded. */
export function generateWebAuthnChallenge(): string {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  return bufToBase64Url(challenge);
}

/** Convert ArrayBuffer to base64url (no padding). */
export function bufToBase64Url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Convert base64url to ArrayBuffer. */
export function base64UrlToBuf(b64url: string): ArrayBuffer {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// ─── In-memory challenge store (60s TTL, one-time use) ────────────

interface ChallengeEntry {
  challenge: string;
  userId?: string;
  email: string;
  createdAt: number;
  type: "registration" | "verification";
}

const webauthnChallengeStore = new Map<string, ChallengeEntry>();
const CHALLENGE_TTL_MS = 60_000;

export function storeWebAuthnChallenge(
  challengeId: string,
  email: string,
  challenge: string,
  type: "registration" | "verification",
  userId?: string,
): void {
  webauthnChallengeStore.set(challengeId, {
    challenge,
    email,
    userId,
    createdAt: Date.now(),
    type,
  });
  // Prune expired
  const now = Date.now();
  for (const [id, entry] of webauthnChallengeStore) {
    if (now - entry.createdAt > CHALLENGE_TTL_MS) {
      webauthnChallengeStore.delete(id);
    }
  }
}

export function consumeWebAuthnChallenge(challengeId: string): ChallengeEntry | null {
  const entry = webauthnChallengeStore.get(challengeId);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > CHALLENGE_TTL_MS) {
    webauthnChallengeStore.delete(challengeId);
    return null;
  }
  webauthnChallengeStore.delete(challengeId);
  return entry;
}

// ─── RP ID detection ──────────────────────────────────────────────

/**
 * Get the Relying Party ID from the request.
 * On localhost: "localhost"
 * On production: the domain without port (e.g. "atelier.harchcorp.com")
 */
export function getRpId(req?: Request): string {
  if (typeof window !== "undefined") {
    return window.location.hostname;
  }
  if (req) {
    try {
      const url = new URL(req.url);
      return url.hostname;
    } catch {}
  }
  return "localhost";
}

// ─── Signature verification (server-side) ─────────────────────────

/**
 * Verify a WebAuthn assertion (login response).
 * Uses the Web Crypto API to verify the signature against the stored
 * public key.
 *
 * @param storedPublicKey - base64url COSE public key
 * @param authenticatorData - base64url authenticator data from the browser
 * @param clientDataJSON - base64url client data from the browser
 * @param signature - base64url signature
 * @param expectedChallenge - base64url challenge that was sent
 * @param expectedOrigin - e.g. "http://localhost:3000" or "https://atelier.harchcorp.com"
 * @param expectedRpId - e.g. "localhost" or "atelier.harchcorp.com"
 * @returns true if the assertion is valid
 */
export async function verifyWebAuthnAssertion(
  storedPublicKey: string,
  authenticatorData: string,
  clientDataJSON: string,
  signature: string,
  expectedChallenge: string,
  expectedOrigin: string,
  expectedRpId: string,
): Promise<boolean> {
  try {
    // 1. Parse and verify clientDataJSON
    const clientData = JSON.parse(
      new TextDecoder().decode(base64UrlToBuf(clientDataJSON)),
    );

    if (clientData.type !== "webauthn.get") {
      return false;
    }

    // Verify the challenge matches
    if (clientData.challenge !== expectedChallenge) {
      return false;
    }

    // Verify the origin
    if (clientData.origin !== expectedOrigin) {
      return false;
    }

    // 2. Import the stored public key
    // The stored key is in COSE format (CBOR) — we need to convert it
    // to a Web Crypto Key. For simplicity, we store the key as JWK
    // during registration and use importKey with "jwk" format.
    // (In a full implementation, you'd parse the COSE format. Here we
    // use the JWK we stored during registration.)
    const publicKeyJwk = JSON.parse(
      new TextDecoder().decode(base64UrlToBuf(storedPublicKey)),
    );

    const cryptoKey = await crypto.subtle.importKey(
      "jwk",
      publicKeyJwk,
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["verify"],
    );

    // 3. Construct the signed data: authenticatorData || SHA-256(clientDataJSON)
    const authData = base64UrlToBuf(authenticatorData);
    const clientDataHash = await crypto.subtle.digest(
      "SHA-256",
      base64UrlToBuf(clientDataJSON),
    );

    // Concatenate authData + clientDataHash
    const signedData = new Uint8Array(authData.byteLength + clientDataHash.byteLength);
    signedData.set(new Uint8Array(authData), 0);
    signedData.set(new Uint8Array(clientDataHash), authData.byteLength);

    // 4. Verify the signature
    const isValid = await crypto.subtle.verify(
      { name: "ECDSA", hash: "SHA-256" },
      cryptoKey,
      base64UrlToBuf(signature),
      signedData,
    );

    return isValid;
  } catch (err) {
    logError("lib.auth.zkp-passkeys", `[webauthn] Verification error: ${err instanceof Error ? err.message : err}`);
    return false;
  }
}
