"use client";

import { useState, useEffect, useCallback } from "react";
import { C } from "../../components/tokens";
import { BrandBadge } from "@/components/BrandBadge";

// ═══════════════════════════════════════════════════════════════
//  SUPERADMIN AUDIT WATCHDOG — Hash Chain Terminal
//
//  Visualizes the SuperAdminAudit hash chain in real-time.
//  If the Sentinel detects tampering (calculatedHash !== storedHash),
//  the entire UI switches to DEFCON 1 (crimson theme + lockdown banner).
//
//  Task ID: YGGDRASIL-N38 (Watchdog d'Intégrité)
// ═══════════════════════════════════════════════════════════════

interface AuditEntry {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  result: string;
  ipAddress: string | null;
  metadata: unknown;
  entryHash: string;
  prevHash: string | null;
  createdAt: string;
}

interface AuditData {
  entries: AuditEntry[];
  integrity: {
    valid: boolean;
    totalEntries: number;
    brokenAt?: string;
  };
  defcon: number;
  lastChecked: string;
}

function shortHash(hash: string): string {
  return hash.slice(0, 8) + "…" + hash.slice(-6);
}

function formatAction(action: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    session_revoked: { label: "SESSION REVOKED", color: "#ef4444" },
    master_code_generate: { label: "MASTER CODE GEN", color: "#f59e0b" },
    master_code_activate: { label: "MASTER CODE ACT", color: "#10b981" },
    master_code_failed: { label: "MASTER CODE FAIL", color: "#ef4444" },
    invitation_accepted: { label: "INVITE ACCEPTED", color: "#3b82f6" },
    role_changed: { label: "ROLE CHANGED", color: "#8b5cf6" },
  };
  return map[action] || { label: action.toUpperCase(), color: "#71717a" };
}

export default function AuditWatchdogPage() {
  const [data, setData] = useState<AuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/super-admin/audit-logs?limit=50");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Auto-refresh every 30s (live monitoring)
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const defcon = data?.defcon === 1;
  const intact = data?.integrity.valid ?? false;

  // DEFCON 1 theme override
  const theme = defcon
    ? { bg: "#1a0000", surface: "#2a0000", border: "#ef4444", text: "#fef2f2", accent: "#ef4444" }
    : { bg: C.bg, surface: C.surface, border: C.border, text: C.text, accent: C.accent };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: C.fontMono, fontSize: "13px", color: C.textMuted }}>Loading audit trail…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#ef4444", fontFamily: C.fontMono, fontSize: "13px" }}>{error}</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, fontFamily: C.fontSans, color: theme.text, transition: "background 0.3s" }}>
      {/* DEFCON 1 Banner */}
      {defcon && (
        <div style={{
          background: "#ef4444",
          color: "#fff",
          padding: "16px 24px",
          textAlign: "center",
          fontFamily: C.fontMono,
          fontSize: "13px",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          animation: "pulse 1.5s infinite",
        }}>
          ⚠ DEFCON 1 — AUDIT CHAIN TAMPER DETECTED — ALL SUPER_ADMIN ACTIONS LOCKED ⚠
        </div>
      )}

      {/* Header */}
      <header style={{
        padding: "16px 24px",
        borderBottom: `1px solid ${theme.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: theme.surface,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <BrandBadge subsidiary="Atelier" size="sm" theme={defcon ? "dark" : "light"} />
          <span style={{
            fontFamily: C.fontMono,
            fontSize: "10px",
            color: theme.accent,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            borderLeft: `1px solid ${theme.border}`,
            paddingLeft: "10px",
          }}>
            SuperAdmin · Audit Watchdog
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: intact ? "#10b981" : "#ef4444",
              animation: intact ? "none" : "pulse 1.5s infinite",
            }} />
            <span style={{
              fontFamily: C.fontMono,
              fontSize: "11px",
              color: intact ? "#10b981" : "#ef4444",
              fontWeight: 700,
              letterSpacing: "0.08em",
            }}>
              {intact ? "CHAIN INTACT" : "CHAIN BROKEN"}
            </span>
          </div>
          <span style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted }}>
            {data?.integrity.totalEntries ?? 0} entries
          </span>
        </div>
      </header>

      {/* Hash Chain Timeline */}
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
        <style>{`
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        `}</style>

        <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
          Hash Chain Integrity Log
        </h1>
        <p style={{ fontSize: "13px", color: C.textBody, marginBottom: "32px" }}>
          Tamper-evident audit trail. Each entry is cryptographically chained to the previous via SHA-256.
          The Sentinel cron verifies the chain every hour. Last checked:{" "}
          {data ? new Date(data.lastChecked).toLocaleTimeString("en-US") : "—"}.
        </p>

        {/* Chain visualization */}
        <div style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: "12px",
          overflow: "hidden",
        }}>
          {/* Column headers */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "120px 1fr 140px 100px 140px 120px",
            gap: "12px",
            padding: "12px 16px",
            borderBottom: `1px solid ${theme.border}`,
            fontFamily: C.fontMono,
            fontSize: "10px",
            fontWeight: 700,
            color: C.textMuted,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            background: C.bgSubtle,
          }}>
            <span>Timestamp</span>
            <span>Action</span>
            <span>Resource</span>
            <span>Result</span>
            <span>Entry Hash</span>
            <span>Prev Hash</span>
          </div>

          {/* Entries */}
          <div style={{ maxHeight: "600px", overflowY: "auto" }}>
            {data?.entries.length === 0 && (
              <div style={{ padding: "32px", textAlign: "center", color: C.textMuted, fontSize: "13px" }}>
                No audit entries yet. Super_admin actions will appear here.
              </div>
            )}
            {data?.entries.map((entry, i) => {
              const actionInfo = formatAction(entry.action);
              const isBroken = data.integrity.brokenAt === entry.id;
              return (
                <div
                  key={entry.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "120px 1fr 140px 100px 140px 120px",
                    gap: "12px",
                    padding: "12px 16px",
                    borderBottom: i < data.entries.length - 1 ? `1px solid ${C.borderLight}` : "none",
                    fontFamily: C.fontMono,
                    fontSize: "11px",
                    color: theme.text,
                    background: isBroken ? "#fef2f2" : "transparent",
                    alignItems: "center",
                  }}
                >
                  <span style={{ color: C.textMuted }}>
                    {new Date(entry.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{
                      padding: "2px 6px",
                      borderRadius: "3px",
                      background: `${actionInfo.color}15`,
                      color: actionInfo.color,
                      fontSize: "9px",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                    }}>
                      {actionInfo.label}
                    </span>
                    <span style={{ color: C.textBody, fontSize: "11px" }}>{entry.userEmail}</span>
                  </span>
                  <span style={{ color: C.textBody, fontSize: "11px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {entry.resource}
                  </span>
                  <span style={{
                    color: entry.result === "success" ? "#10b981" : entry.result === "denied" ? "#f59e0b" : "#ef4444",
                    fontWeight: 700,
                  }}>
                    {entry.result.toUpperCase()}
                  </span>
                  <span style={{ color: isBroken ? "#ef4444" : C.textMuted, fontWeight: isBroken ? 700 : 400 }}>
                    {shortHash(entry.entryHash)}
                    {isBroken && " ⚠"}
                  </span>
                  <span style={{ color: C.textFaint }}>
                    {entry.prevHash ? shortHash(entry.prevHash) : "— genesis —"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Integrity status card */}
        <div style={{
          marginTop: "24px",
          padding: "20px",
          background: intact ? "#ecfdf5" : "#fef2f2",
          border: `1px solid ${intact ? "#a7f3d0" : "#fecaca"}`,
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: intact ? "#10b981" : "#ef4444",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "24px",
            fontWeight: 700,
          }}>
            {intact ? "✓" : "⚠"}
          </div>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: intact ? "#065f46" : "#991b1b" }}>
              {intact ? "Chain Integrity Verified" : "TAMPER DETECTED"}
            </div>
            <div style={{ fontSize: "13px", color: intact ? "#047857" : "#b91c1c", marginTop: "4px" }}>
              {intact
                ? `${data?.integrity.totalEntries} entries verified — SHA-256 chain intact. Last Sentinel check: ${new Date(data?.lastChecked || "").toLocaleTimeString("en-US")}.`
                : `Chain broken at entry ${data?.integrity.brokenAt?.slice(-8)}. The Sentinel has set DEFCON 1. All super_admin actions are locked until investigated.`}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
