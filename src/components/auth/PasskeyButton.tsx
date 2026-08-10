"use client";

import { useState } from "react";

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
//  Visual: white outline button, sage green fingerprint icon,
//  charcoal text. Matches the institutional login card design.
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

      setStatus("✓ Passkey enregistré — vous pouvez vous connecter par biométrie");
      onSuccess?.({ id: "", email: email || "", name: null, role: "" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Échec de l'enregistrement";
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

      if (!assertion) throw new Error("Authentification annulée");

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
      const msg = e instanceof Error ? e.message : "Échec de la connexion";
      setStatus(`✕ ${msg}`);
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  };

  const buttonLabel = loading
    ? "En attente de la biométrie…"
    : mode === "register"
      ? "Enregistrer un passkey"
      : "Se connecter avec un passkey";

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
          height: "44px",
          padding: "0 14px",
          background: "#FFFFFF",
          color: "#0A0A0A",
          border: "1px solid #E5E5E5",
          borderRadius: "10px",
          fontFamily: "inherit",
          fontSize: "14px",
          fontWeight: 500,
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1,
          transition: "background 0.15s, opacity 0.15s",
          boxSizing: "border-box",
        }}
        onMouseEnter={(e) => {
          if (!loading) e.currentTarget.style.background = "#FAFAFA";
        }}
        onMouseLeave={(e) => {
          if (!loading) e.currentTarget.style.background = "#FFFFFF";
        }}
      >
        {/* Fingerprint icon — sage green (#4A7B5F) */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#4A7B5F"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4" />
          <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" />
          <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
          <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
          <path d="M8.65 22c.21-.66.45-1.32.57-2" />
          <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
          <path d="M2 16h.01" />
          <path d="M21.8 16c.2-2 .131-5.354 0-6" />
          <path d="M9 6.8a6 6 0 0 1 9 5.2c0 .47 0 1.17-.02 2" />
        </svg>
        {buttonLabel}
      </button>
      {status && (
        <div
          role={status.startsWith("✕") ? "alert" : "status"}
          style={{
            marginTop: "12px",
            padding: "12px",
            background: status.startsWith("✓") ? "#ECFDF5" : "#FEF2F2",
            border: `1px solid ${
              status.startsWith("✓") ? "#A7F3D0" : "#FECACA"
            }`,
            borderRadius: "8px",
            fontSize: "13px",
            color: status.startsWith("✓") ? "#065F46" : "#991B1B",
          }}
        >
          {status}
        </div>
      )}
    </div>
  );
}
