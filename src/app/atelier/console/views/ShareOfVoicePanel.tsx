"use client";

import { useState } from "react";

// ═══════════════════════════════════════════════════════════════
//  SHARE OF VOICE — Competitive Position
//
//  Inspired by Meltwater + Talkwalker competitive intelligence.
//  Shows your brand vs competitors with animated bars, rank badges,
//  and delta indicators. The Dircom sees at a glance where they
//  stand vs the market.
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
  fontSans: "'Inter', system-ui, sans-serif",
  fontMono: "'Space Mono', monospace",
};

interface Competitor {
  name: string;
  mentionCount: number;
  sentiment: number;
  trend: number;
  isYou: boolean;
}

const DEMO_COMPETITORS: Competitor[] = [
  { name: "Attijariwafa Bank", mentionCount: 2847, sentiment: 0.12, trend: 3, isYou: true },
  { name: "Bank of Africa", mentionCount: 2103, sentiment: 0.21, trend: 2, isYou: false },
  { name: "BCP", mentionCount: 1876, sentiment: -0.08, trend: -1, isYou: false },
  { name: "CIH Bank", mentionCount: 1245, sentiment: 0.15, trend: 5, isYou: false },
  { name: "Crédit du Maroc", mentionCount: 892, sentiment: -0.03, trend: 0, isYou: false },
];

export function ShareOfVoicePanel() {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = competitors.reduce((sum, c) => sum + c.mentionCount, 0);
  const maxMentions = Math.max(...competitors.map((c) => c.mentionCount));
  const yourRank = competitors.sort((a, b) => b.mentionCount - a.mentionCount).findIndex((c) => c.isYou) + 1;

  // Sort by mention count descending
  const sorted = [...competitors].sort((a, b) => b.mentionCount - a.mentionCount);

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
        <div>
          <div style={{ fontFamily: C.fontMono, fontSize: "11px", fontWeight: 700, color: C.text, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "4px" }}>
            Share of Voice
          </div>
          <div style={{ fontSize: "13px", color: C.textSec }}>
            You are <span style={{ fontWeight: 700, color: C.text }}>#{yourRank}</span> of {competitors.length} competitors
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, letterSpacing: "0.05em" }}>TOTAL MENTIONS 30J</div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: C.text }}>{total.toLocaleString()}</div>
        </div>
      </div>

      {/* Stacked bar (overall share) */}
      <div style={{ height: "24px", borderRadius: "6px", overflow: "hidden", display: "flex", marginBottom: "20px", gap: "2px" }}>
        {sorted.map((c, i) => {
          const pct = (c.mentionCount / total) * 100;
          const colors = ["#1e3a5f", "#4a7b5f", "#a0524b", "#8b6914", "#78716c"];
          return (
            <div
              key={c.name}
              style={{
                width: `${pct}%`,
                background: colors[i],
                opacity: hovered === null || hovered === i ? 1 : 0.3,
                transition: "opacity 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                color: "#fff",
                fontWeight: 700,
                fontFamily: C.fontMono,
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {pct > 8 && `${Math.round(pct)}%`}
            </div>
          );
        })}
      </div>

      {/* Competitor rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {sorted.map((c, i) => {
          const pct = (c.mentionCount / total) * 100;
          const barWidth = (c.mentionCount / maxMentions) * 100;
          const colors = ["#1e3a5f", "#4a7b5f", "#a0524b", "#8b6914", "#78716c"];
          const color = colors[i];
          return (
            <div
              key={c.name}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: "grid",
                gridTemplateColumns: "24px 1fr auto auto auto",
                gap: "12px",
                alignItems: "center",
                padding: "8px 0",
                opacity: hovered === null || hovered === i ? 1 : 0.5,
                transition: "opacity 0.2s",
              }}
            >
              {/* Rank */}
              <div style={{ fontFamily: C.fontMono, fontSize: "14px", fontWeight: 700, color: i === 0 ? C.warning : C.textMuted, textAlign: "center" }}>
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
              </div>

              {/* Name + bar */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "13px", fontWeight: c.isYou ? 700 : 500, color: c.isYou ? C.text : C.textSec }}>
                    {c.name}
                  </span>
                  {c.isYou && (
                    <span style={{ fontFamily: C.fontMono, fontSize: "9px", padding: "1px 6px", borderRadius: "3px", background: C.cta, color: "#fff", fontWeight: 700 }}>
                      YOU
                    </span>
                  )}
                </div>
                <div style={{ height: "6px", background: C.surfaceAlt, borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${barWidth}%`, background: color, borderRadius: "3px", transition: "width 1s ease-out" }} />
                </div>
              </div>

              {/* Mentions */}
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: C.fontMono, fontSize: "13px", fontWeight: 700, color: C.text }}>{c.mentionCount.toLocaleString()}</div>
                <div style={{ fontFamily: C.fontMono, fontSize: "9px", color: C.textMuted }}>{pct.toFixed(1)}%</div>
              </div>

              {/* Sentiment */}
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted }}>SENT</div>
                <div style={{ fontFamily: C.fontMono, fontSize: "12px", fontWeight: 700, color: c.sentiment > 0.1 ? C.cta : c.sentiment < -0.1 ? C.danger : C.textMuted }}>
                  {c.sentiment > 0 ? "+" : ""}{c.sentiment.toFixed(2)}
                </div>
              </div>

              {/* Trend */}
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted }}>7J</div>
                <div style={{ fontFamily: C.fontMono, fontSize: "12px", fontWeight: 700, color: c.trend > 0 ? C.danger : c.trend < 0 ? C.cta : C.textMuted }}>
                  {c.trend > 0 ? "↑" : c.trend < 0 ? "↓" : "→"} {Math.abs(c.trend)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer insight */}
      <div style={{ marginTop: "16px", padding: "10px 14px", background: C.surfaceAlt, borderRadius: "8px", display: "flex", gap: "8px", alignItems: "center" }}>
        <span style={{ fontSize: "14px" }}>📊</span>
        <p style={{ margin: 0, fontSize: "12px", color: C.textSec, lineHeight: 1.5 }}>
          {yourRank === 1
            ? "Vous dominez le share of voice. Surveillez BCP (sentiment négatif) qui pourrait gagner du momentum."
            : `Vous êtes #${yourRank}. ${sorted[0].name} vous devance de ${Math.round((sorted[0].mentionCount / competitors.find((c) => c.isYou)!.mentionCount - 1) * 100)}% en volume.`}
        </p>
      </div>
    </div>
  );
}
