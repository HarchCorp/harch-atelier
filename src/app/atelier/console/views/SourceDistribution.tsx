"use client";

// ═══════════════════════════════════════════════════════════════
//  SOURCE DISTRIBUTION — Donut Chart
//
//  Inspired by Meltwater + Talkwalker source breakdown.
//  Shows which media outlets drive the most mentions.
//  Interactive hover reveals exact counts + percentages.
// ═══════════════════════════════════════════════════════════════

const C = {
  surface: "#FFFFFF",
  surfaceAlt: "#F4F4F5",
  border: "#E5E5E5",
  text: "#0A0A0A",
  textSec: "#525252",
  textMuted: "#71717A",
  fontSans: "'Inter', system-ui, sans-serif",
  fontMono: "'Space Mono', monospace",
};

interface SourceData {
  name: string;
  count: number;
  color: string;
  type: "media" | "social" | "regulatory";
}

const DEMO_SOURCES: SourceData[] = [
  { name: "Hespress", count: 847, color: "#a0524b", type: "media" },
  { name: "Le360", count: 623, color: "#1e3a5f", type: "media" },
  { name: "TelQuel", count: 412, color: "#4a7b5f", type: "media" },
  { name: "Médias24", count: 387, color: "#8b6914", type: "media" },
  { name: "L'Économiste", count: 289, color: "#78716c", type: "media" },
  { name: "TikTok", count: 234, color: "#ef4444", type: "social" },
  { name: "Facebook", count: 198, color: "#3b82f6", type: "social" },
  { name: "WhatsApp", count: 156, color: "#10b981", type: "social" },
];

import { useState, useEffect } from "react";

export function SourceDistribution() {
  const [sources, setSources] = useState<SourceData[]>(DEMO_SOURCES);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/console/source-distribution")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.sources) setSources(d.sources); })
      .catch(() => {});
  }, []);

  const total = sources.reduce((sum, s) => sum + s.count, 0);
  const radius = 80;
  const stroke = 24;
  const circumference = 2 * Math.PI * radius;

  // Pre-compute segment offsets (cumulative sum, no mutation during render)
  const segments = sources.reduce<
    Array<{ dash: number; offset: number }>
  >((acc, s) => {
    const pct = s.count / total;
    const dash = pct * circumference;
    const offset = acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].dash : 0;
    acc.push({ dash, offset });
    return acc;
  }, []);

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px" }}>
      {/* Header */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontFamily: C.fontMono, fontSize: "11px", fontWeight: 700, color: C.text, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "4px" }}>
          Source Distribution
        </div>
        <div style={{ fontSize: "13px", color: C.textSec }}>
          Top {sources.length} sources · 30j · {total.toLocaleString()} mentions total
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "24px", alignItems: "center" }}>
        {/* Donut SVG */}
        <div style={{ position: "relative", width: "200px", height: "200px" }}>
          <svg width="200" height="200" viewBox="0 0 200 200">
            <g transform="translate(100, 100) rotate(-90)">
              {sources.map((s, i) => {
                const seg = segments[i] || { dash: 0, offset: 0 };
                return (
                  <circle
                    key={s.name}
                    r={radius}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={hovered === i ? stroke + 4 : stroke}
                    strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
                    strokeDashoffset={-seg.offset}
                    style={{
                      transition: "stroke-width 0.2s",
                      opacity: hovered === null || hovered === i ? 1 : 0.3,
                      cursor: "pointer",
                    }}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                  />
                );
              })}
            </g>
          </svg>

          {/* Center label */}
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            {hovered !== null && sources[hovered] ? (
              <>
                <div style={{ fontSize: "24px", fontWeight: 700, color: sources[hovered].color }}>{sources[hovered].count}</div>
                <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, textAlign: "center" }}>{sources[hovered].name}</div>
                <div style={{ fontFamily: C.fontMono, fontSize: "11px", fontWeight: 700, color: C.text }}>{((sources[hovered].count / total) * 100).toFixed(1)}%</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: "28px", fontWeight: 700, color: C.text }}>{total.toLocaleString()}</div>
                <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted }}>MENTIONS</div>
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {sources.map((s, i) => (
            <div
              key={s.name}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: "grid",
                gridTemplateColumns: "12px 1fr auto auto",
                gap: "8px",
                alignItems: "center",
                padding: "4px 8px",
                borderRadius: "4px",
                background: hovered === i ? C.surfaceAlt : "transparent",
                transition: "background 0.15s",
                cursor: "pointer",
              }}
            >
              <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: s.color }} />
              <span style={{ fontSize: "12px", color: C.text, fontWeight: hovered === i ? 600 : 400 }}>{s.name}</span>
              <span style={{ fontFamily: C.fontMono, fontSize: "11px", color: C.textMuted }}>{s.count}</span>
              <span style={{ fontFamily: C.fontMono, fontSize: "11px", fontWeight: 700, color: C.text, minWidth: "40px", textAlign: "right" }}>
                {((s.count / total) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Type summary */}
      <div style={{ marginTop: "16px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
        {["media", "social", "regulatory"].map((type) => {
          const count = sources.filter((s) => s.type === type).reduce((sum, s) => sum + s.count, 0);
          const pct = ((count / total) * 100).toFixed(0);
          const labels = { media: "📰 Media", social: "📱 Social", regulatory: "⚖️ Regulatory" };
          const colors = { media: "#1e3a5f", social: "#ef4444", regulatory: "#8b6914" };
          return (
            <div key={type} style={{ padding: "6px 12px", background: C.surfaceAlt, borderRadius: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "12px" }}>{labels[type as keyof typeof labels]}</span>
              <span style={{ fontFamily: C.fontMono, fontSize: "12px", fontWeight: 700, color: colors[type as keyof typeof colors] }}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
