"use client";

import { useState } from "react";
import {
  deriveKeyPairFromPassword,
  generateSalt,
  signChallenge,
  exportPublicKey,
} from "@/lib/crypto/zkp/protocol";
import { C } from "../../components/tokens";
import { BrandBadge } from "@/components/BrandBadge";

export default function ZKPAuthPage() {
  const [mode, setMode] = useState<"register" | "login">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [networkPayload, setNetworkPayload] = useState<string | null>(null);

  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const salt = generateSalt();
      const keyPair = await deriveKeyPairFromPassword(password, salt);
      const publicKeyJwk = await exportPublicKey(keyPair.publicKey);
      const payload = { email, publicKey: publicKeyJwk, salt, iterations: 150000 };
      setNetworkPayload(JSON.stringify(payload, null, 2));
      const res = await fetch("/api/auth/zkp-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      setResult("✓ ZKP verifier registered. The server never received your password.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const challengeRes = await fetch("/api/auth/zkp-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const challengeData = await challengeRes.json();
      if (!challengeRes.ok) throw new Error(challengeData.error || "Challenge failed");
      const keyPair = await deriveKeyPairFromPassword(password, challengeData.salt, challengeData.iterations);
      const signature = await signChallenge(keyPair.privateKey, challengeData.challenge);
      const payload = { email, challengeId: challengeData.challengeId, signature };
      setNetworkPayload(JSON.stringify(payload, null, 2));
      const verifyRes = await fetch("/api/auth/zkp-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.error || "Verification failed");
      setResult(`✓ ${verifyData.message}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: C.fontSans, color: C.text }}>
      <header style={{ padding: "16px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: "12px", background: C.surface }}>
        <BrandBadge subsidiary="Atelier" size="sm" theme="light" />
        <span style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase", borderLeft: `1px solid ${C.border}`, paddingLeft: "10px" }}>
          Lab · ZKP Authentication
        </span>
      </header>
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 24px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.02em" }}>Zero-Knowledge Proof Auth</h1>
        <p style={{ fontSize: "14px", color: C.textBody, lineHeight: 1.6, marginBottom: "32px" }}>
          The server NEVER knows your password. Not in transit, not hashed, not even as a bcrypt digest.
          The client derives a keypair from the password (PBKDF2 → ECDSA P-256) and sends only the public key.
          Login works via challenge-response: the server sends a nonce, the client signs it, the server verifies.
        </p>
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {(["register", "login"] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); setResult(null); setError(null); setNetworkPayload(null); }} style={{
              padding: "8px 16px", background: mode === m ? C.accent : C.surface, color: mode === m ? "#fff" : C.textBody,
              border: `1px solid ${mode === m ? C.accent : C.border}`, borderRadius: "6px", fontFamily: C.fontMono,
              fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer",
            }}>{m}</button>
          ))}
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "24px", marginBottom: "24px" }}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={{ width: "100%", padding: "12px 14px", border: `1px solid ${C.border}`, borderRadius: "6px", fontFamily: C.fontSans, fontSize: "14px", color: C.text, background: C.surface, boxSizing: "border-box", marginBottom: "12px" }} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (stays in browser)" style={{ width: "100%", padding: "12px 14px", border: `1px solid ${C.border}`, borderRadius: "6px", fontFamily: C.fontSans, fontSize: "14px", color: C.text, background: C.surface, boxSizing: "border-box", marginBottom: "16px" }} />
          <button
            onClick={mode === "register" ? handleRegister : handleLogin}
            disabled={loading || !email || !password}
            data-testid="zkp-submit"
            style={{
              width: "100%", padding: "14px", background: loading || !email || !password ? C.border : C.cta, color: "#fff",
              border: "none", borderRadius: "6px", fontFamily: C.fontSans, fontSize: "14px", fontWeight: 600, cursor: loading || !email || !password ? "not-allowed" : "pointer",
            }}>{loading ? "Computing cryptographic proof…" : mode === "register" ? "Register (derive + send public key)" : "Login (sign challenge)"}</button>
        </div>
        {result && <div style={{ padding: "16px", background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "8px", fontSize: "13px", color: "#065f46", marginBottom: "16px" }}>{result}</div>}
        {error && <div style={{ padding: "16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", fontSize: "13px", color: "#991b1b", marginBottom: "16px" }}>✕ {error}</div>}
        {networkPayload && (
          <div style={{ background: "#0a0a0a", border: "1px solid #262626", borderRadius: "8px", padding: "16px", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#10b981", overflow: "auto" }}>
            <div style={{ color: "#71717a", marginBottom: "8px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Network Payload (what NEMESIS sees)</div>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{networkPayload}</pre>
            <div style={{ color: "#71717a", marginTop: "8px", fontSize: "10px" }}>↑ No password. No hash. No bcrypt. Only public key + signature + challenge ID.</div>
          </div>
        )}
      </main>
    </div>
  );
}
