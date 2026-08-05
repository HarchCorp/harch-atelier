"use client";

import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════
//  CRISIS timeline — Annotated Event Timeline
//
//  Shows the evolution of a crisis over time with annotated
//  events (the 2018 boycott pattern). The Dircom sees exactly
//  when the crisis started, when it peaked, when it crossed
//  into mainstream, and when it was resolved.
//
//  Pattern: horizontal timeline with sentiment curve overlay,
//  event markers, and expandable detail cards.
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

interface TimelineEvent {
  time: string;
  label: string;
  description: string;
  severity: "info" | "warning" | "critical" | "resolved";
  sentiment: number;
  language: string;
  source: string;
}

const DEMO_TIMELINE: TimelineEvent[] = [
  { time: "J-3 · 23h14", label: "1er signal Darija", description: "Commentaire Hespress: 'tbarkellah 3la had frais jdad, mchaw lflous'. 12 likes en 30min.", severity: "info", sentiment: -0.42, language: "darija", source: "Hespress comments" },
  { time: "J-2 · 08h00", label: "Vélocité anormale", description: "142 mentions négatives en 2h. Sentiment moyen -0.58. Sarcasme détecté sur 38% des commentaires.", severity: "warning", sentiment: -0.58, language: "darija", source: "Hespress + TikTok" },
  { time: "J-2 · 14h30", label: "Vidéo TikTok virale", description: "Vidéo client mécontent atteint 80K vues. 100% négatif. Vélocité 35 mentions/h.", severity: "critical", sentiment: -0.78, language: "darija", source: "TikTok" },
  { time: "J-1 · 09h00", label: "CASCADE détectée", description: "Bad buzz Darija repris dans Hespress (MSA) et Le360 (FR). La crise traverse la membrane UGC → mainstream.", severity: "critical", sentiment: -0.65, language: "msa+french", source: "Hespress + Le360" },
  { time: "J-1 · 16h00", label: "Déclaration publique", description: "Communiqué de la direction publié. Sentiment remonte légèrement mais vélocité reste élevée.", severity: "warning", sentiment: -0.38, language: "french", source: "Corporate comms" },
  { time: "J · 11h00", label: "Crise stabilisée", description: "Vélocité redescend sous 10/h. Sentiment revient à -0.12. Surveillance maintenue 48h.", severity: "resolved", sentiment: -0.12, language: "all", source: "All sources" },
];

const SEVERITY_META: Record<string, { color: string; icon: string; label: string }> = {
  info: { color: C.info, icon: "ℹ", label: "INFO" },
  warning: { color: C.warning, icon: "⚠", label: "WARNING" },
  critical: { color: C.danger, icon: "✕", label: "CRITICAL" },
  resolved: { color: C.cta, icon: "✓", label: "RESOLVED" },
  watch: { color: C.warning, icon: "△", label: "WATCH" },
};

export function CrisisTimeline() {
  const [timeline, setTimeline] = useState<TimelineEvent[]>(DEMO_TIMELINE);
  const [expanded, setExpanded] = useState<number | null>(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/console/crisis-timeline", { signal: controller.signal })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.events) setTimeline(d.events); })
      .catch((e) => { if (!(e instanceof DOMException && e.name === "AbortError")) {} });
    return () => controller.abort();
  }, []);
  if (!timeline || timeline.length === 0) return null;

  // Build the sentiment curve points
  const width = 600;
  const height = 60;
  const points = timeline.map((e, i) => ({
    x: (i / (Math.max(timeline.length - 1, 1))) * width,
    y: height / 2 - (e.sentiment * height * 0.4),
  }));
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px" }}>
      {/* Header */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontFamily: C.fontMono, fontSize: "11px", fontWeight: 700, color: C.text, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "4px" }}>
          Crisis Timeline
        </div>
        <div style={{ fontSize: "13px", color: C.textSec }}>
          72h evolution · annotated events · sentiment curve overlay
        </div>
      </div>

      {/* Sentiment curve */}
      <div style={{ marginBottom: "16px", position: "relative" }}>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          {/* Zero line */}
          <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke={C.border} strokeWidth={1} strokeDasharray="3,3" />
          {/* Curve */}
          <path d={pathD} fill="none" stroke={C.danger} strokeWidth={2} strokeLinejoin="round" />
          {/* Area fill (negative zone) */}
          <path d={`${pathD} L ${width} ${height / 2} L 0 ${height / 2} Z`} fill={C.danger} fillOpacity={0.08} />
          {/* Event dots */}
          {points.map((p, i) => {
            const meta = SEVERITY_META[timeline[i].severity];
            return <circle key={i} cx={p.x} cy={p.y} r={5} fill={meta.color} stroke={C.surface} strokeWidth={2} />;
          })}
        </svg>
        {/* Time labels */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
          {timeline.map((e, i) => (
            <span key={i} style={{ fontFamily: C.fontMono, fontSize: "9px", color: C.textMuted }}>{e.time.split(" · ")[0]}</span>
          ))}
        </div>
      </div>

      {/* Event cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {timeline.map((event, i) => {
          const meta = SEVERITY_META[event.severity] || SEVERITY_META.info;
          const isExpanded = expanded === i;
          return (
            <div
              key={i}
              style={{
                border: `1px solid ${C.border}`,
                borderLeft: `4px solid ${meta.color}`,
                borderRadius: "8px",
                overflow: "hidden",
                background: isExpanded ? C.surfaceAlt : C.surface,
              }}
            >
              <button
                onClick={() => setExpanded(isExpanded ? null : i)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto auto",
                  gap: "12px",
                  alignItems: "center",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: "16px", color: meta.color }}>{meta.icon}</span>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: C.text }}>{event.label}</div>
                  <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted }}>{event.time}</div>
                </div>
                <span style={{ fontFamily: C.fontMono, fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", background: meta.color + "15", color: meta.color }}>{meta.label}</span>
                <span style={{ fontFamily: C.fontMono, fontSize: "12px", fontWeight: 700, color: event.sentiment < -0.3 ? C.danger : event.sentiment < 0 ? C.warning : C.cta }}>{event.sentiment.toFixed(2)}</span>
              </button>
              {isExpanded && (
                <div style={{ padding: "0 16px 14px 44px" }}>
                  <p style={{ margin: 0, fontSize: "13px", color: C.textSec, lineHeight: 1.55 }}>{event.description}</p>
                  <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                    <span style={{ fontFamily: C.fontMono, fontSize: "10px", padding: "2px 6px", borderRadius: "3px", background: C.surfaceAlt, color: C.textMuted }}>📱 {event.source}</span>
                    <span style={{ fontFamily: C.fontMono, fontSize: "10px", padding: "2px 6px", borderRadius: "3px", background: C.surfaceAlt, color: C.textMuted }}>🌐 {event.language}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
