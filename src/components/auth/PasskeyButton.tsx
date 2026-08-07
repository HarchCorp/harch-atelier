"use client";

import { useState } from "react";
import { C } from "@/app/atelier/components/tokens";

// ═══════════════════════════════════════════════════════════════
//  PASSKEY BUTTON — Biometric authentication (WebAuthn)
//
//  Two modes:
//    1. "register" — registers a new passkey (TouchID/FaceID/YubiKey)
//    2. "login" — authenticates with an existing passkey
//
//  Uses the browser's native navigator.credentials API.
//  The private key NEVER leaves the device.
//
//  NEMESIS defense: the network payload contains ONLY binary blobs.
//  No password, no hash, no secret.
// ═══════════════════════════════════════════════════════════════

interface PasskeyButtonProps {
  mode: "register" | "login";
  email?: string;
  onSuccess?: (user: { id: string; email: string; name: string | null; role: string }) => void;
  onError?: (error: string) => void;
}

export function PasskeyButton({ mode, email, onSuccess, onError }: PasskeyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const base64UrlToBuffer = (b64url: string): ArrayBuffer => {
    const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  };

  const bufferToBase64Url = (buf: ArrayBuffer): string => {
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  };

  const handleRegister = async () => {
    setLoading(true);
    setStatus(null);
    try {
      // 1. Request challenge from server
      const challengeRes = await fetch("/api/auth/webauthn-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const challengeData = await challengeRes.json();
      if (!challengeRes.ok) throw new Error(challengeData.error);

      // 2. Call navigator.credentials.create() — browser shows biometric prompt
      const credential = (await navigator.credentials.create({
        publicKey: {
          challenge: base64UrlToBuffer(challengeData.challenge),
          rp: {
            id: challengeData.rpId,
            name: challengeData.rpName,
          },
          user: {
            id: base64UrlToBuffer(challengeData.userId),
            name: challengeData.userName,
            displayName: challengeData.userDisplayName,
          },
          pubKeyCredParams: [
            { type: "public-key", alg: -7 },   // ECDSA P-256
            { type: "public-key", alg: -257 }, // RSA
          ],
          excludeCredentials: challengeData.excludeCredentials.map((c: { id: string }) => ({
            id: base64UrlToBuffer(c.id),
            type: "public-key" as const,
          })),
          authenticatorSelection: {
            userVerification: "required",
            residentKey: "preferred",
          },
          timeout: 60000,
        },
      })) as PublicKeyCredential | null;

      if (!credential) throw new Error("Registration cancelled");

      const response = credential.response as AuthenticatorAttestationResponse;

      // 3. Store the credential on the server
      const storeRes = await fetch("/api/auth/webauthn-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: challengeData.challengeId,
          credentialId: bufferToBase64Url(credential.rawId),
          publicKey: bufferToBase64Url(response.attestationObject),
          transports: Array.from(response.getTransports?.() || []),
          deviceType: "Passkey",
        }),
      });

      const storeData = await storeRes.json();
      if (!storeRes.ok) throw new Error(storeData.error);

      setStatus("✓ Passkey registered — you can now sign in with biometrics");
      onSuccess?.({ id: "", email: email || "", name: null, role: "" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Registration failed";
      setStatus(`✕ ${msg}`);
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setStatus(null);
    try {
      // 1. Request challenge
      const challengeRes = await fetch("/api/auth/webauthn-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const challengeData = await challengeRes.json();
      if (!challengeRes.ok) throw new Error(challengeData.error);

      // 2. Call navigator.credentials.get() — browser shows biometric prompt
      const assertion = (await navigator.credentials.get({
        publicKey: {
          challenge: base64UrlToBuffer(challengeData.challenge),
          rpId: challengeData.rpId,
          allowCredentials: challengeData.allowCredentials.map((c: { id: string; type: string; transports?: string[] }) => ({
            id: base64UrlToBuffer(c.id),
            type: c.type as "public-key",
            transports: c.transports,
          })),
          userVerification: challengeData.userVerification,
          timeout: 60000,
        },
      })) as PublicKeyCredential | null;

      if (!assertion) throw new Error("Authentication cancelled");

      const response = assertion.response as AuthenticatorAssertionResponse;

      // 3. Verify the assertion on the server
      const verifyRes = await fetch("/api/auth/webauthn-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: challengeData.challengeId,
          credentialId: bufferToBase64Url(assertion.rawId),
          authenticatorData: bufferToBase64Url(response.authenticatorData),
          clientDataJSON: bufferToBase64Url(response.clientDataJSON),
          signature: bufferToBase64Url(response.signature),
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.error);

      setStatus(`✓ ${verifyData.message}`);
      if (verifyData.user) onSuccess?.(verifyData.user);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Login failed";
      setStatus(`✕ ${msg}`);
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={mode === "register" ? handleRegister : handleLogin}
        disabled={loading}
        data-testid="passkey-button"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          width: "100%",
          padding: "14px",
          background: loading ? C.border : "#0a0a0a",
          color: "#fff",
          border: `1px solid ${C.border}`,
          borderRadius: "8px",
          fontFamily: C.fontSans,
          fontSize: "14px",
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          transition: "all 0.15s",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a5 5 0 0 0-5 5v3H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-2V7a5 5 0 0 0-5-5z" />
        </svg>
        {loading
          ? "Waiting for biometric…"
          : mode === "register"
            ? "Register Passkey (TouchID / FaceID / YubiKey)"
            : "Sign in with Passkey"}
      </button>
      {status && (
        <div style={{
          marginTop: "8px",
          padding: "8px 12px",
          background: status.startsWith("✓") ? "#ecfdf5" : "#fef2f2",
          border: `1px solid ${status.startsWith("✓") ? "#a7f3d0" : "#fecaca"}`,
          borderRadius: "6px",
          fontSize: "12px",
          color: status.startsWith("✓") ? "#065f46" : "#991b1b",
        }}>
          {status}
        </div>
      )}
    </div>
  );
}
