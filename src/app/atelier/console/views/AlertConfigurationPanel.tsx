"use client";

import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════
//  ALERT CONFIGURATION PANEL
//
//  Lets the Dircom configure:
//    • Alert thresholds (sentiment drop, mention velocity, crisis score)
//    • Delivery channels (WhatsApp, email, dashboard, Comex escalation)
//    • Quiet hours (ne pas déranger)
//    • Severity filters (which alerts to receive)
//
//  Pattern: Meltwater alert settings + Dataminr Pulse configuration.
//  Saves to /api/console/alert-config (persists in CompanySettings).
// ═══════════════════════════════════════════════════════════════

const C = {
  surface: "#FFFFFF",
  surfaceAlt: "#F4F4F5",
  border: "#E5E5E5",
  text: "#0A0A0A",
  textSec: "#525252",
  textMuted: "#71717A",
  accent: "#78716c",
  cta: "#10b981",
  danger: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
  fontSans: "'Inter', system-ui, sans-serif",
  fontMono: "'Space Mono', monospace",
};

interface AlertConfig {
  sentimentThreshold: number; // -1 to 0 (e.g. -0.3 = alert when sentiment drops below -0.3)
  velocityThreshold: number; // mentions per hour
  crisisScoreThreshold: number; // 0-100
  channels: {
    whatsapp: boolean;
    email: boolean;
    dashboard: boolean;
    comexEscalation: boolean;
  };
  severityFilter: {
    critical: boolean;
    warning: boolean;
    watch: boolean;
    info: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string; // "07:00"
  };
  whatsappNumber: string;
  email: string;
}

const DEFAULT_CONFIG: AlertConfig = {
  sentimentThreshold: -0.3,
  velocityThreshold: 15,
  crisisScoreThreshold: 50,
  channels: { whatsapp: true, email: true, dashboard: true, comexEscalation: false },
  severityFilter: { critical: true, warning: true, watch: false, info: false },
  quietHours: { enabled: true, start: "22:00", end: "07:00" },
  whatsappNumber: "+212600000000",
  email: "dircom@company.ma",
};

export function AlertConfigurationPanel() {
  const [config, setConfig] = useState<AlertConfig>(DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = <K extends keyof AlertConfig>(key: K, value: AlertConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/console/alert-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // best-effort
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    border: `1px solid ${C.border}`,
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: C.fontMono,
    background: C.surface,
    color: C.text,
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <div style={{ fontFamily: C.fontMono, fontSize: "11px", fontWeight: 700, color: C.text, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "4px" }}>
            Alert Configuration
          </div>
          <div style={{ fontSize: "13px", color: C.textSec }}>Configure thresholds, delivery channels, and quiet hours</div>
        </div>
        <button
          onClick={save}
          disabled={saving}
          style={{
            padding: "8px 18px",
            background: saving ? C.border : saved ? C.cta : C.text,
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontFamily: C.fontSans,
            fontSize: "13px",
            fontWeight: 600,
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Saving…" : saved ? "✓ Saved" : "Save configuration"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* ─── LEFT: Thresholds ─── */}
        <div>
          <div style={{ fontFamily: C.fontMono, fontSize: "10px", fontWeight: 700, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px" }}>
            Alert Thresholds
          </div>

          {/* Sentiment threshold */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 600, color: C.text, marginBottom: "6px" }}>
              <span>Sentiment drop threshold</span>
              <span style={{ fontFamily: C.fontMono, color: config.sentimentThreshold < -0.4 ? C.danger : C.warning }}>{config.sentimentThreshold.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min="-1"
              max="0"
              step="0.05"
              value={config.sentimentThreshold}
              onChange={e => update("sentimentThreshold", parseFloat(e.target.value))}
              style={{ width: "100%" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: C.textMuted, fontFamily: C.fontMono }}>
              <span>-1.0 (all negative)</span>
              <span>0 (neutral)</span>
            </div>
            <p style={{ fontSize: "11px", color: C.textMuted, margin: "4px 0 0" }}>Alert when average sentiment drops below this value</p>
          </div>

          {/* Velocity threshold */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 600, color: C.text, marginBottom: "6px" }}>
              <span>Mention velocity (per hour)</span>
              <span style={{ fontFamily: C.fontMono, color: config.velocityThreshold > 20 ? C.danger : C.text }}>{config.velocityThreshold}/h</span>
            </label>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={config.velocityThreshold}
              onChange={e => update("velocityThreshold", parseInt(e.target.value))}
              style={{ width: "100%" }}
            />
            <p style={{ fontSize: "11px", color: C.textMuted, margin: "4px 0 0" }}>Alert when mention velocity exceeds this rate</p>
          </div>

          {/* Crisis score threshold */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 600, color: C.text, marginBottom: "6px" }}>
              <span>Crisis score threshold</span>
              <span style={{ fontFamily: C.fontMono, color: config.crisisScoreThreshold >= 70 ? C.danger : C.warning }}>{config.crisisScoreThreshold}/100</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={config.crisisScoreThreshold}
              onChange={e => update("crisisScoreThreshold", parseInt(e.target.value))}
              style={{ width: "100%" }}
            />
            <p style={{ fontSize: "11px", color: C.textMuted, margin: "4px 0 0" }}>Alert when Global Risk Index exceeds this score</p>
          </div>
        </div>

        {/* ─── RIGHT: Channels + Filters ─── */}
        <div>
          {/* Delivery channels */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontFamily: C.fontMono, fontSize: "10px", fontWeight: 700, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>
              Delivery Channels
            </div>
            {([
              { key: "whatsapp" as const, label: "WhatsApp", icon: "💬", desc: "Send alerts to your WhatsApp number" },
              { key: "email" as const, label: "Email", icon: "📧", desc: "Send alerts to your email address" },
              { key: "dashboard" as const, label: "Dashboard", icon: "📊", desc: "Show alerts in the console feed" },
              { key: "comexEscalation" as const, label: "Comex Escalation", icon: "⚡", desc: "Auto-escalate critical alerts to Comex" },
            ]).map(ch => (
              <label
                key={ch.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  background: config.channels[ch.key] ? C.surfaceAlt : "transparent",
                  border: `1px solid ${config.channels[ch.key] ? C.cta + "30" : C.border}`,
                  borderRadius: "8px",
                  marginBottom: "6px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={config.channels[ch.key]}
                  onChange={e => update("channels", { ...config.channels, [ch.key]: e.target.checked })}
                  style={{ width: "16px", height: "16px" }}
                />
                <span style={{ fontSize: "16px" }}>{ch.icon}</span>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: C.text }}>{ch.label}</div>
                  <div style={{ fontSize: "11px", color: C.textMuted }}>{ch.desc}</div>
                </div>
              </label>
            ))}
          </div>

          {/* WhatsApp number + Email */}
          {config.channels.whatsapp && (
            <div style={{ marginBottom: "10px" }}>
              <label style={{ fontSize: "11px", fontWeight: 600, color: C.textMuted, display: "block", marginBottom: "4px" }}>WhatsApp number</label>
              <input value={config.whatsappNumber} onChange={e => update("whatsappNumber", e.target.value)} style={inputStyle} placeholder="+2126XXXXXXXX" />
            </div>
          )}
          {config.channels.email && (
            <div style={{ marginBottom: "10px" }}>
              <label style={{ fontSize: "11px", fontWeight: 600, color: C.textMuted, display: "block", marginBottom: "4px" }}>Email address</label>
              <input value={config.email} onChange={e => update("email", e.target.value)} style={inputStyle} placeholder="dircom@company.ma" />
            </div>
          )}

          {/* Quiet hours */}
          <div style={{
            padding: "12px",
            background: config.quietHours.enabled ? C.surfaceAlt : "transparent",
            border: `1px solid ${C.border}`,
            borderRadius: "8px",
            marginBottom: "12px",
          }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginBottom: config.quietHours.enabled ? "10px" : "0" }}>
              <input
                type="checkbox"
                checked={config.quietHours.enabled}
                onChange={e => update("quietHours", { ...config.quietHours, enabled: e.target.checked })}
                style={{ width: "16px", height: "16px" }}
              />
              <span style={{ fontSize: "13px", fontWeight: 600, color: C.text }}>🌙 Quiet hours (Ne pas déranger)</span>
            </label>
            {config.quietHours.enabled && (
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input type="time" value={config.quietHours.start} onChange={e => update("quietHours", { ...config.quietHours, start: e.target.value })} style={{ ...inputStyle, width: "auto" }} />
                <span style={{ color: C.textMuted }}>→</span>
                <input type="time" value={config.quietHours.end} onChange={e => update("quietHours", { ...config.quietHours, end: e.target.value })} style={{ ...inputStyle, width: "auto" }} />
                <span style={{ fontSize: "11px", color: C.textMuted }}>Critical alerts bypass quiet hours</span>
              </div>
            )}
          </div>

          {/* Severity filter */}
          <div>
            <div style={{ fontFamily: C.fontMono, fontSize: "10px", fontWeight: 700, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
              Severity Filter
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {([
                { key: "critical" as const, label: "Critical", color: C.danger },
                { key: "warning" as const, label: "Warning", color: C.warning },
                { key: "watch" as const, label: "Watch", color: C.info },
                { key: "info" as const, label: "Info", color: C.textMuted },
              ]).map(sev => (
                <button
                  key={sev.key}
                  onClick={() => update("severityFilter", { ...config.severityFilter, [sev.key]: !config.severityFilter[sev.key] })}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    border: `1px solid ${config.severityFilter[sev.key] ? sev.color : C.border}`,
                    background: config.severityFilter[sev.key] ? sev.color + "15" : "transparent",
                    color: config.severityFilter[sev.key] ? sev.color : C.textMuted,
                    fontFamily: C.fontMono,
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {config.severityFilter[sev.key] ? "✓ " : ""}{sev.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
