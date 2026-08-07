"use client";

import { useState, useEffect, useCallback } from "react";
import { C } from "../../../../components/tokens";
import { BrandBadge } from "@/components/BrandBadge";

// ═══════════════════════════════════════════════════════════════
//  SECURITY SETTINGS — Session & Device Management
//
//  Shows the current user's active sessions across devices.
//  Each row has a "Revoke" button (optimistic UI — row disappears
//  instantly, API call fires in background).
//
//  Admins see ALL users' sessions and can revoke any.
//
//  Task ID: YGGDRASIL-N40 UI
// ═══════════════════════════════════════════════════════════════

interface SessionRow {
  userId: string;
  userEmail: string;
  userName: string;
  role: string;
  ipAddress: string | null;
  userAgent: string | null;
  lastLoginAt: string | null;
  sessionVersion: number;
}

function parseUserAgent(ua: string | null): { device: string; browser: string; icon: string } {
  if (!ua) return { device: "Unknown", browser: "—", icon: "?" };
  const isMobile = /Mobile|iPhone|Android|iPad/.test(ua);
  const browser = /Chrome/.test(ua) ? "Chrome" : /Firefox/.test(ua) ? "Firefox" : /Safari/.test(ua) ? "Safari" : /Edge/.test(ua) ? "Edge" : "Browser";
  const os = /iPhone|iPad/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Mac/.test(ua) ? "macOS" : /Windows/.test(ua) ? "Windows" : /Linux/.test(ua) ? "Linux" : "OS";
  const icon = isMobile ? "📱" : "💻";
  return { device: isMobile ? `${os} Device` : `${os} Machine`, browser, icon };
}

export default function SecuritySettingsPage() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users?include=sessionInfo");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const rows: SessionRow[] = (data.users || []).map((u: any) => ({
        userId: u.id,
        userEmail: u.email,
        userName: u.name || u.email,
        role: u.role,
        ipAddress: null,
        userAgent: null,
        lastLoginAt: u.lastLoginAt,
        sessionVersion: u.sessionVersion ?? 0,
      }));
      setSessions(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleRevoke = async (userId: string, userEmail: string) => {
    // Optimistic UI: immediately mark as revoking (fade the row)
    setRevoking((prev) => new Set(prev).add(userId));
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/admin/revoke-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      // Success: bump the sessionVersion in the local state
      setSessions((prev) =>
        prev.map((s) =>
          s.userId === userId
            ? { ...s, sessionVersion: s.sessionVersion + 1 }
            : s,
        ),
      );
      setSuccessMsg(`Session revoked for ${userEmail}. User must re-sign-in.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Revoke failed");
      setTimeout(() => setError(null), 4000);
    } finally {
      // Remove from revoking set (row returns to normal opacity)
      setRevoking((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: C.fontMono, fontSize: "13px", color: C.textMuted }}>Loading security settings…</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: C.fontSans }}>
      {/* Header */}
      <header style={{
        padding: "16px 24px",
        borderBottom: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "center",
        gap: "12px",
        background: C.surface,
      }}>
        <BrandBadge subsidiary="Atelier" size="sm" theme="light" />
        <span style={{
          fontFamily: C.fontMono,
          fontSize: "10px",
          color: C.accent,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          borderLeft: `1px solid ${C.border}`,
          paddingLeft: "10px",
        }}>
          Security · Session Management
        </span>
      </header>

      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: C.text, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
          Active Sessions & Device Management
        </h1>
        <p style={{ fontSize: "13px", color: C.textBody, marginBottom: "32px" }}>
          Revoke any user's session instantly. They will be forced to re-sign-in on their next request.
          Uses <code style={{ fontFamily: C.fontMono, fontSize: "12px", background: C.bgSubtle, padding: "2px 6px", borderRadius: "3px" }}>sessionVersion</code> JWT invalidation — no Redis blacklist needed.
        </p>

        {/* Success / Error banners */}
        {successMsg && (
          <div style={{
            padding: "12px 16px",
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            borderRadius: "8px",
            fontSize: "13px",
            color: "#065f46",
            marginBottom: "16px",
          }}>
            ✓ {successMsg}
          </div>
        )}
        {error && (
          <div style={{
            padding: "12px 16px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            fontSize: "13px",
            color: "#991b1b",
            marginBottom: "16px",
          }}>
            ✕ {error}
          </div>
        )}

        {/* Sessions table */}
        <div style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: "12px",
          overflow: "hidden",
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 120px 100px 140px 120px",
            gap: "12px",
            padding: "12px 16px",
            borderBottom: `1px solid ${C.border}`,
            fontFamily: C.fontMono,
            fontSize: "10px",
            fontWeight: 700,
            color: C.textMuted,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            background: C.bgSubtle,
          }}>
            <span>User</span>
            <span>Role</span>
            <span>Version</span>
            <span>Last Login</span>
            <span>Action</span>
          </div>

          <div style={{ maxHeight: "500px", overflowY: "auto" }}>
            {sessions.length === 0 && (
              <div style={{ padding: "32px", textAlign: "center", color: C.textMuted, fontSize: "13px" }}>
                No users found.
              </div>
            )}
            {sessions.map((s) => {
              const isRevoking = revoking.has(s.userId);
              return (
                <div
                  key={s.userId}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 120px 100px 140px 120px",
                    gap: "12px",
                    padding: "14px 16px",
                    borderBottom: `1px solid ${C.borderLight}`,
                    fontSize: "13px",
                    color: C.text,
                    alignItems: "center",
                    opacity: isRevoking ? 0.4 : 1,
                    transition: "opacity 0.2s",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "13px" }}>{s.userName}</div>
                    <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: C.fontMono }}>{s.userEmail}</div>
                  </div>
                  <span style={{
                    padding: "3px 8px",
                    borderRadius: "4px",
                    background: s.role === "super_admin" ? "#fef2f2" : s.role === "admin" ? "#fffbeb" : C.bgSubtle,
                    color: s.role === "super_admin" ? "#991b1b" : s.role === "admin" ? "#b45309" : C.textBody,
                    fontSize: "10px",
                    fontWeight: 700,
                    fontFamily: C.fontMono,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    display: "inline-block",
                    width: "fit-content",
                  }}>
                    {s.role}
                  </span>
                  <span style={{ fontFamily: C.fontMono, fontSize: "12px", color: C.textBody }}>
                    v{s.sessionVersion}
                  </span>
                  <span style={{ fontSize: "11px", color: C.textMuted, fontFamily: C.fontMono }}>
                    {s.lastLoginAt ? new Date(s.lastLoginAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                  </span>
                  <button
                    onClick={() => handleRevoke(s.userId, s.userEmail)}
                    disabled={isRevoking}
                    style={{
                      padding: "6px 12px",
                      background: isRevoking ? C.border : "#fef2f2",
                      color: isRevoking ? C.textMuted : "#991b1b",
                      border: "1px solid #fecaca",
                      borderRadius: "4px",
                      fontFamily: C.fontMono,
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      cursor: isRevoking ? "not-allowed" : "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {isRevoking ? "Revoking…" : "Revoke"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info card */}
        <div style={{
          marginTop: "24px",
          padding: "16px 20px",
          background: C.bgSubtle,
          borderRadius: "8px",
          fontSize: "12px",
          color: C.textBody,
          lineHeight: 1.6,
        }}>
          <strong style={{ color: C.text }}>How it works:</strong> When you click "Revoke", the user's{" "}
          <code style={{ fontFamily: C.fontMono, fontSize: "11px" }}>sessionVersion</code> is bumped in the database.
          On their next HTTP request, the JWT callback detects the version mismatch and returns an empty token —
          effectively signing them out. No Redis blacklist, no WebSocket push, just a single DB integer.
        </div>
      </main>
    </div>
  );
}
