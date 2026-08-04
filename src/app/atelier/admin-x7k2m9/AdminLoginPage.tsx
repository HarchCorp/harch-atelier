"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

// ═══════════════════════════════════════════════════════════════
//  ADMIN LOGIN — Obscure URL, intentionally ugly
//
//  This page is for admin only. It's not linked from anywhere,
//  not indexed, and styled intentionally basic. Admin bookmarks it.
//
//  Only users with role === "admin" can login here. Regular users
//  login via their invitation link (/atelier/access?token=XXX).
// ═══════════════════════════════════════════════════════════════

export function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/atelier/admin",
    });

    setLoading(false);

    if (result?.error) {
      setError("Access denied.");
      return;
    }

    if (result?.url) {
      window.location.href = result.url;
    }
  };

  // Intentionally ugly inline styles — this is admin-only, not public-facing
  return (
    <div style={{ minHeight: "100vh", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace" }}>
      <form onSubmit={handleSubmit} style={{ background: "#fafafa", border: "1px solid #333", padding: "24px", width: "320px" }}>
        <h1 style={{ fontSize: "16px", margin: "0 0 16px", color: "#0a0a0a", fontWeight: "bold" }}>
          Admin
        </h1>

        {error && (
          <div style={{ color: "#c00", fontSize: "12px", marginBottom: "12px", padding: "6px", background: "#fee", border: "1px solid #c00" }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", fontSize: "12px", color: "#666", marginBottom: "4px" }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "6px", border: "1px solid #333", fontSize: "13px", fontFamily: "monospace", boxSizing: "border-box" }}
            autoComplete="email"
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "12px", color: "#666", marginBottom: "4px" }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "6px", border: "1px solid #333", fontSize: "13px", fontFamily: "monospace", boxSizing: "border-box" }}
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: "8px", background: loading ? "#ccc" : "#333", color: "#fff", border: "none", fontSize: "13px", fontFamily: "monospace", cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "..." : "Login"}
        </button>
      </form>
    </div>
  );
}
