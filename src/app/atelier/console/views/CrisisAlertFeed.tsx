"use client";

import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════
//  CRISIS ALERT FEED
//
//  Synthesizes:
//    • Dataminr Pulse — real-time severity-coded feed, earliest warnings
//    • PeakMetrics — narrative detection, actor identification
//    • Brandwatch Vizia — escalate important insights
//
//  The feed shows alerts in reverse-chronological order with:
//    • Severity color coding (critical/warning/watch/info)
//    • Source icon + name
//    • Timestamp (relative — "2min ago")
//    • Cascade indicator (if the alert crossed languages)
//    • Quick actions (acknowledge, escalate, view detail)
// ═══════════════════════════════════════════════════════════════

const C = {
  surface: "#FFFFFF",
  surfaceAlt: "#F4F4F5",
  border: "#E5E5E5",
  borderLight: "#F0F0F0",
  text: "#0A0A0A",
  textSec: "#525252",
  textMuted: "#71717A",
  danger: "#ef4444",
  dangerBg: "#fef2f2",
  dangerBorder: "#fecaca",
  dangerText: "#991b1b",
  warning: "#f59e0b",
  warningBg: "#fffbeb",
  warningBorder: "#fcd34d",
  warningText: "#b45309",
  success: "#10b981",
  successBg: "#ecfdf5",
  info: "#3b82f6",
  infoBg: "#eff6ff",
  fontSans: "'Inter', system-ui, sans-serif",
  fontMono: "'Space Mono', monospace",
};

type Severity = "critical" | "warning" | "watch" | "info";

interface Alert {
  id: string;
  severity: Severity;
  title: string;
  summary: string;
  source: string;
  sourceType: "media" | "social" | "whatsapp" | "regulatory";
  language: "msa" | "french" | "english" | "darija";
  timestamp: number;
  cascade?: { from: string; to: string[] };
  acknowledged: boolean;
}

const SEVERITY_META: Record<Severity, { label: string; color: string; bg: string; border: string; icon: string }> = {
  critical: { label: "CRITICAL", color: C.dangerText, bg: C.dangerBg, border: C.dangerBorder, icon: "✕" },
  warning: { label: "WARNING", color: C.warningText, bg: C.warningBg, border: C.warningBorder, icon: "⚠" },
  watch: { label: "WATCH", color: C.warningText, bg: C.warningBg, border: C.warningBorder, icon: "△" },
  info: { label: "INFO", color: C.info, bg: C.infoBg, border: "#bfdbfe", icon: "ℹ" },
};

const SOURCE_META = {
  media: { icon: "📰", label: "Media" },
  social: { icon: "📱", label: "Social" },
  whatsapp: { icon: "💬", label: "WhatsApp" },
  regulatory: { icon: "⚖️", label: "Regulatory" },
};

const LANG_META = {
  msa: { label: "MSA", color: "#1e3a5f" },
  french: { label: "FR", color: "#4a7b5f" },
  english: { label: "EN", color: "#8b6914" },
  darija: { label: "Darija", color: "#a0524b" },
};

// Demo alerts — the 2018 boycott pattern in real-time
const DEMO_ALERTS: Alert[] = [
  {
    id: "alert-1",
    severity: "critical",
    title: "Cascade Darija → MSA + French",
    summary: "Bad buzz 'Frais bancaires excessifs' a traversé la membrane. Darija 35/h → repris dans Hespress (MSA) et Le360 (FR).",
    source: "Hespress + Le360",
    sourceType: "media",
    language: "darija",
    timestamp: Date.now() - 2 * 60 * 1000,
    cascade: { from: "darija", to: ["msa", "french"] },
    acknowledged: false,
  },
  {
    id: "alert-2",
    severity: "critical",
    title: "Vidéo TikTok virale — 80K vues en 6h",
    summary: "Client mécontent publie une vidéo dénonçant les frais. Vélocité anormale, 100% négatif en Darija.",
    source: "TikTok",
    sourceType: "social",
    language: "darija",
    timestamp: Date.now() - 8 * 60 * 1000,
    acknowledged: false,
  },
  {
    id: "alert-3",
    severity: "warning",
    title: "Pic négatif Hespress comments",
    summary: "142 commentaires négatifs en 2h sur l'article 'Nouveaux tarifs 2026'. Sentiment -0.58, sarcasme détecté.",
    source: "Hespress",
    sourceType: "media",
    language: "darija",
    timestamp: Date.now() - 22 * 60 * 1000,
    acknowledged: false,
  },
  {
    id: "alert-4",
    severity: "warning",
    title: "WhatsApp inbound — Dircom forward",
    summary: "Salma Bennani a forwardé un message WhatsApp d'un groupe client. Crisis score: 35. Analyse en cours.",
    source: "WhatsApp inbound",
    sourceType: "whatsapp",
    language: "french",
    timestamp: Date.now() - 45 * 60 * 1000,
    acknowledged: true,
  },
  {
    id: "alert-5",
    severity: "watch",
    title: "Mention LinkedIn — analyste",
    summary: "Analyste de CFG Bank publie une note mitigée sur la stratégie digitale. Sentiment neutre mais reach élevé.",
    source: "LinkedIn",
    sourceType: "social",
    language: "french",
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    acknowledged: true,
  },
  {
    id: "alert-6",
    severity: "info",
    title: "Article positif — TelQuel",
    summary: "Interview du DG sur la digitalisation. Repartagé 340 fois. Sentiment +0.72.",
    source: "TelQuel",
    sourceType: "media",
    language: "french",
    timestamp: Date.now() - 5 * 60 * 60 * 1000,
    acknowledged: true,
  },
];

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}min ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function CrisisAlertFeed() {
  const [alerts, setAlerts] = useState<Alert[]>(DEMO_ALERTS);
  const [filter, setFilter] = useState<Severity | "all">("all");

  const filtered = filter === "all" ? alerts : alerts.filter((a) => a.severity === filter);

  const counts = {
    critical: alerts.filter((a) => a.severity === "critical" && !a.acknowledged).length,
    warning: alerts.filter((a) => a.severity === "warning" && !a.acknowledged).length,
    watch: alerts.filter((a) => a.severity === "watch" && !a.acknowledged).length,
    info: alerts.filter((a) => a.severity === "info" && !a.acknowledged).length,
  };

  const acknowledge = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
  };

  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: counts.critical > 0 ? C.danger : counts.warning > 0 ? C.warning : C.success,
              boxShadow: counts.critical > 0 ? `0 0 8px ${C.danger}80` : "none",
              animation: counts.critical > 0 ? "pulse 1.5s infinite" : "none",
            }}
          />
          <span style={{ fontFamily: C.fontMono, fontSize: "12px", fontWeight: 700, color: C.text, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Real-time Alert Feed
          </span>
          <span style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted }}>
            {alerts.filter((a) => !a.acknowledged).length} unacknowledged
          </span>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "4px" }}>
          {(["all", "critical", "warning", "watch", "info"] as const).map((f) => {
            const count = f === "all" ? alerts.length : counts[f as Severity] || alerts.filter((a) => a.severity === f).length;
            const isActive = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  border: `1px solid ${isActive ? C.text : C.border}`,
                  background: isActive ? C.text : C.surface,
                  color: isActive ? "#fff" : C.textSec,
                  fontFamily: C.fontMono,
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  transition: "all 0.15s",
                }}
              >
                {f}
                {count > 0 && (
                  <span
                    style={{
                      padding: "1px 5px",
                      borderRadius: "3px",
                      background: isActive ? "rgba(255,255,255,0.2)" : C.surfaceAlt,
                      fontSize: "9px",
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feed */}
      <div style={{ maxHeight: "600px", overflowY: "auto" }}>
        {filtered.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center", color: C.textMuted, fontFamily: C.fontMono, fontSize: "12px" }}>
            No alerts in this category
          </div>
        )}
        {filtered.map((alert, i) => {
          const meta = SEVERITY_META[alert.severity];
          const src = SOURCE_META[alert.sourceType];
          const lang = LANG_META[alert.language];
          return (
            <div
              key={alert.id}
              style={{
                padding: "16px 20px",
                borderBottom: i === filtered.length - 1 ? "none" : `1px solid ${C.borderLight}`,
                display: "grid",
                gridTemplateColumns: "4px 1fr auto",
                gap: "14px",
                alignItems: "start",
                opacity: alert.acknowledged ? 0.6 : 1,
                transition: "opacity 0.2s",
                background: alert.acknowledged ? "transparent" : meta.bg + "40",
              }}
            >
              {/* Severity bar */}
              <div style={{ width: "4px", height: "100%", minHeight: "40px", background: meta.color, borderRadius: "2px" }} />

              {/* Content */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontFamily: C.fontMono, fontSize: "10px", fontWeight: 700, color: meta.color, letterSpacing: "0.05em" }}>
                    {meta.icon} {meta.label}
                  </span>
                  <span style={{ fontSize: "11px" }}>{src.icon}</span>
                  <span style={{ fontFamily: C.fontMono, fontSize: "11px", color: C.textSec }}>{alert.source}</span>
                  <span
                    style={{
                      fontFamily: C.fontMono,
                      fontSize: "9px",
                      padding: "2px 6px",
                      borderRadius: "3px",
                      background: lang.color + "15",
                      color: lang.color,
                      fontWeight: 700,
                    }}
                  >
                    {lang.label}
                  </span>
                  {alert.cascade && (
                    <span
                      style={{
                        fontFamily: C.fontMono,
                        fontSize: "9px",
                        padding: "2px 6px",
                        borderRadius: "3px",
                        background: C.dangerBg,
                        color: C.dangerText,
                        fontWeight: 700,
                        border: `1px solid ${C.dangerBorder}`,
                      }}
                    >
                      ⚡ CASCADE {LANG_META[alert.cascade.from as keyof typeof LANG_META]?.label} → {alert.cascade.to.map((t) => LANG_META[t as keyof typeof LANG_META]?.label).join("+")}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: C.text, lineHeight: 1.3 }}>{alert.title}</div>
                <div style={{ fontSize: "12px", color: C.textSec, lineHeight: 1.5 }}>{alert.summary}</div>

                {/* Actions */}
                {!alert.acknowledged && (
                  <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                    <button
                      onClick={() => acknowledge(alert.id)}
                      style={{
                        padding: "4px 10px",
                        background: C.surface,
                        border: `1px solid ${C.border}`,
                        borderRadius: "4px",
                        fontFamily: C.fontMono,
                        fontSize: "10px",
                        color: C.textSec,
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      ✓ Acknowledge
                    </button>
                    {alert.severity === "critical" && (
                      <button
                        style={{
                          padding: "4px 10px",
                          background: C.dangerText,
                          border: "none",
                          borderRadius: "4px",
                          fontFamily: C.fontMono,
                          fontSize: "10px",
                          color: "#fff",
                          cursor: "pointer",
                          fontWeight: 700,
                        }}
                      >
                        ⚡ Escalate to Comex
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontFamily: C.fontMono, fontSize: "11px", color: C.textMuted, whiteSpace: "nowrap" }}>{timeAgo(alert.timestamp)}</div>
                {alert.acknowledged && (
                  <div style={{ fontFamily: C.fontMono, fontSize: "9px", color: C.success, marginTop: "4px" }}>✓ ack</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </div>
  );
}
