"use client";

import { useState, useEffect } from "react";
import { AtelierNav } from "../components/AtelierNav";
import { AtelierFooter } from "../components/AtelierFooter";

const C = {
  bg: "#0A0A0A",
  surface: "#171717",
  surfaceAlt: "#1F1F1F",
  border: "#262626",
  text: "#FAFAFA",
  textMuted: "#A3A3A3",
  textFaint: "#525252",
  accent: "#059669",
  warning: "#D97706",
  danger: "#DC2626",
  info: "#0369A1",
};

interface HealthData {
  status: string;
  version: string;
  uptime: number;
  timestamp: string;
  database: { connected: boolean; latency: string };
  records: Record<string, number>;
  features: Record<string, boolean>;
  endpoints: Record<string, string>;
}

export default function HealthDashboardPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchHealth = async () => {
    try {
      const res = await fetch("/api/health");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success) {
        setHealth(json.data);
        setError(null);
      } else {
        setError(json.data?.error || "Health check failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatNumber = (n: number): string => {
    return n.toLocaleString();
  };

  return (
    <>
      <AtelierNav />
      <div style={{ minHeight: "100vh", background: C.bg, color: C.text, padding: "48px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: "40px" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "10px",
              padding: "6px 14px", background: "rgba(5,150,105,0.1)",
              border: `1px solid ${C.accent}40`, borderRadius: "100px",
              fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
              color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase",
              marginBottom: "24px",
            }}>
              <span style={{
                width: "8px", height: "8px", borderRadius: "50%",
                background: health?.status === "healthy" ? C.accent : C.danger,
                animation: "pulse 2s infinite",
              }} />
              System Health Dashboard
            </div>
            <h1 style={{
              fontSize: "clamp(32px, 6vw, 48px)", fontWeight: 900,
              letterSpacing: "-0.04em", lineHeight: 1.0,
              marginBottom: "12px",
            }}>
              Platform Status
            </h1>
            <p style={{
              fontSize: "16px", color: C.textMuted, lineHeight: 1.5,
              maxWidth: "600px",
            }}>
              Real-time system health monitoring for the Harch Atelier platform.
              Auto-refreshes every 30 seconds.
            </p>
            {lastRefresh && (
              <p style={{ fontSize: "12px", color: C.textFaint, marginTop: "8px", fontFamily: "'JetBrains Mono', monospace" }}>
                Last refreshed: {lastRefresh.toLocaleTimeString("en-US")} ·{" "}
                <button onClick={fetchHealth} style={{
                  background: "transparent", border: "none", color: C.accent,
                  cursor: "pointer", textDecoration: "underline", fontSize: "12px",
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  Refresh now
                </button>
              </p>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{
                width: "48px", height: "48px", borderRadius: "50%",
                border: `3px solid ${C.border}`, borderTopColor: C.accent,
                animation: "spin 1s linear infinite",
                margin: "0 auto 24px",
              }} />
              <div style={{ fontSize: "14px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
                Checking system health…
              </div>
            </div>
          ) : error ? (
            <div style={{
              padding: "32px", background: C.surface, borderRadius: "12px",
              border: `1px solid ${C.danger}40`, textAlign: "center",
            }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠</div>
              <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>System Unhealthy</h2>
              <p style={{ fontSize: "14px", color: C.textMuted }}>{error}</p>
            </div>
          ) : health ? (
            <>
              {/* Status banner */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "20px 24px", background: C.surface, borderRadius: "12px",
                border: `1px solid ${health.status === "healthy" ? C.accent + "40" : C.danger + "40"}`,
                marginBottom: "24px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{
                    width: "12px", height: "12px", borderRadius: "50%",
                    background: health.status === "healthy" ? C.accent : C.danger,
                    animation: "pulse 2s infinite",
                  }} />
                  <div>
                    <div style={{ fontSize: "18px", fontWeight: 700, textTransform: "capitalize" }}>
                      {health.status}
                    </div>
                    <div style={{ fontSize: "12px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
                      v{health.version} · Uptime: {formatUptime(health.uptime)}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "10px", color: C.textFaint, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Database
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: health.database.connected ? C.accent : C.danger }}>
                    {health.database.connected ? "Connected" : "Disconnected"} · {health.database.latency}
                  </div>
                </div>
              </div>

              {/* Record counts grid */}
              <h2 style={{ fontSize: "14px", fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "16px" }}>
                Database Records
              </h2>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "16px", marginBottom: "32px",
              }}>
                {Object.entries(health.records).map(([key, value]) => (
                  <div key={key} style={{
                    padding: "20px", background: C.surface, borderRadius: "8px",
                    border: `1px solid ${C.border}`,
                  }}>
                    <div style={{ fontSize: "28px", fontWeight: 800, color: C.accent, fontFamily: "'JetBrains Mono', monospace" }}>
                      {formatNumber(value)}
                    </div>
                    <div style={{
                      fontSize: "11px", color: C.textMuted, marginTop: "4px",
                      textTransform: "uppercase", letterSpacing: "0.08em",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Features grid */}
              <h2 style={{ fontSize: "14px", fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "16px" }}>
                Feature Status
              </h2>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                gap: "12px", marginBottom: "32px",
              }}>
                {Object.entries(health.features).map(([key, enabled]) => (
                  <div key={key} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 16px", background: C.surface, borderRadius: "8px",
                    border: `1px solid ${C.border}`,
                  }}>
                    <span style={{ fontSize: "13px", fontWeight: 500, textTransform: "capitalize" }}>
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span style={{
                      padding: "3px 10px", borderRadius: "100px",
                      background: enabled ? "rgba(5,150,105,0.15)" : "rgba(115,115,115,0.1)",
                      color: enabled ? C.accent : C.textMuted,
                      fontSize: "10px", fontWeight: 700,
                      fontFamily: "'JetBrains Mono', monospace",
                      textTransform: "uppercase",
                    }}>
                      {enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                ))}
              </div>

              {/* API Endpoints */}
              <h2 style={{ fontSize: "14px", fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "16px" }}>
                API Endpoints
              </h2>
              <div style={{
                background: C.surface, borderRadius: "8px",
                border: `1px solid ${C.border}`, overflow: "hidden",
              }}>
                {Object.entries(health.endpoints).map(([name, path], i) => (
                  <div key={name} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 16px",
                    borderBottom: i < Object.keys(health.endpoints).length - 1 ? `1px solid ${C.border}` : "none",
                  }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, textTransform: "capitalize" }}>
                      {name}
                    </span>
                    <code style={{
                      fontSize: "12px", color: C.accent,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>
                      {path}
                    </code>
                  </div>
                ))}
              </div>
            </>
          ) : null}

          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}</style>
        </div>
      </div>
      <AtelierFooter />
    </>
  );
}
