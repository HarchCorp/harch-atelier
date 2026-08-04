"use client";

import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════
//  COMPETITOR RADAR CHART
//
//  Multi-axis comparison of your brand vs top competitors across
//  6 dimensions: Sentiment, Share of Voice, AI Visibility,
//  Influencer Authority, Crisis Resilience, Media Reach.
//  Inspired by Talkwalker's competitive intelligence radar.
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
  fontSans: "'Inter', system-ui, sans-serif",
  fontMono: "'Space Mono', monospace",
};

interface BrandScores {
  name: string;
  color: string;
  isYou: boolean;
  scores: { sentiment: number; shareOfVoice: number; aiVisibility: number; influencerAuthority: number; crisisResilience: number; mediaReach: number };
}

const DEMO_BRANDS: BrandScores[] = [
  { name: "Attijariwafa", color: "#1e3a5f", isYou: true, scores: { sentiment: 62, shareOfVoice: 78, aiVisibility: 72, influencerAuthority: 65, crisisResilience: 58, mediaReach: 84 } },
  { name: "Bank of Africa", color: "#4a7b5f", isYou: false, scores: { sentiment: 71, shareOfVoice: 65, aiVisibility: 68, influencerAuthority: 70, crisisResilience: 72, mediaReach: 70 } },
  { name: "BCP", color: "#a0524b", isYou: false, scores: { sentiment: 45, shareOfVoice: 58, aiVisibility: 54, influencerAuthority: 60, crisisResilience: 50, mediaReach: 62 } },
];

const AXES = [
  { key: "sentiment" as const, label: "Sentiment" },
  { key: "shareOfVoice" as const, label: "Share of Voice" },
  { key: "aiVisibility" as const, label: "AI Visibility" },
  { key: "influencerAuthority" as const, label: "Influencer Auth." },
  { key: "crisisResilience" as const, label: "Crisis Resilience" },
  { key: "mediaReach" as const, label: "Media Reach" },
];

export function CompetitorRadarChart() {
  const [brands, setBrands] = useState<BrandScores[]>(DEMO_BRANDS);
  const [visibleBrands, setVisibleBrands] = useState<Set<string>>(new Set(DEMO_BRANDS.map((b) => b.name)));
  useEffect(() => { fetch("/api/console/competitor-radar").then(r => r.ok ? r.json() : null).then(d => { if (d?.brands) setBrands(d.brands); }).catch(() => {}); }, []);

  const size = 280;
  const center = size / 2;
  const radius = 100;
  const axes = AXES.length;
  const angleStep = (Math.PI * 2) / axes;

  // Build polygon points for a brand
  const buildPoints = (scores: BrandScores["scores"]) => {
    return AXES.map((axis, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const value = scores[axis.key] / 100;
      const x = center + Math.cos(angle) * radius * value;
      const y = center + Math.sin(angle) * radius * value;
      return `${x},${y}`;
    }).join(" ");
  };

  // Grid rings (25%, 50%, 75%, 100%)
  const gridRings = [0.25, 0.5, 0.75, 1.0];

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px" }}>
      {/* Header */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontFamily: C.fontMono, fontSize: "11px", fontWeight: 700, color: C.text, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "4px" }}>
          Competitive Radar
        </div>
        <div style={{ fontSize: "13px", color: C.textSec }}>
          6-axis comparison · click legend to toggle
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "20px", alignItems: "center" }}>
        {/* Radar SVG */}
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Grid rings */}
          {gridRings.map((ring) => (
            <polygon
              key={ring}
              points={AXES.map((_, i) => {
                const angle = i * angleStep - Math.PI / 2;
                const x = center + Math.cos(angle) * radius * ring;
                const y = center + Math.sin(angle) * radius * ring;
                return `${x},${y}`;
              }).join(" ")}
              fill="none"
              stroke={C.border}
              strokeWidth={1}
            />
          ))}

          {/* Axis lines */}
          {AXES.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x = center + Math.cos(angle) * radius;
            const y = center + Math.sin(angle) * radius;
            return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke={C.border} strokeWidth={1} />;
          })}

          {/* Brand polygons */}
          {brands.filter((b) => visibleBrands.has(b.name)).map((brand) => (
            <polygon
              key={brand.name}
              points={buildPoints(brand.scores)}
              fill={brand.color}
              fillOpacity={brand.isYou ? 0.15 : 0.08}
              stroke={brand.color}
              strokeWidth={brand.isYou ? 2.5 : 1.5}
              strokeLinejoin="round"
            />
          ))}

          {/* Axis labels */}
          {AXES.map((axis, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const labelRadius = radius + 20;
            const x = center + Math.cos(angle) * labelRadius;
            const y = center + Math.sin(angle) * labelRadius;
            const textAnchor = Math.abs(Math.cos(angle)) < 0.1 ? "middle" : Math.cos(angle) > 0 ? "start" : "end";
            return (
              <text
                key={axis.key}
                x={x}
                y={y}
                textAnchor={textAnchor}
                dominantBaseline="middle"
                fontSize="10"
                fill={C.textMuted}
                fontFamily={C.fontMono}
                fontWeight={600}
              >
                {axis.label}
              </text>
            );
          })}
        </svg>

        {/* Legend + scores */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {brands.map((brand) => {
            const isVisible = visibleBrands.has(brand.name);
            const avgScore = Math.round(Object.values(brand.scores).reduce((a, b) => a + b, 0) / AXES.length);
            return (
              <button
                key={brand.name}
                onClick={() => {
                  setVisibleBrands((prev) => {
                    const next = new Set(prev);
                    if (next.has(brand.name)) next.delete(brand.name);
                    else next.add(brand.name);
                    return next;
                  });
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 12px",
                  background: isVisible ? C.surfaceAlt : "transparent",
                  border: `1px solid ${isVisible ? brand.color : C.border}`,
                  borderRadius: "8px",
                  cursor: "pointer",
                  opacity: isVisible ? 1 : 0.5,
                  transition: "all 0.15s",
                  textAlign: "left",
                }}
              >
                <div style={{ width: "16px", height: "16px", borderRadius: "3px", background: brand.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: brand.isYou ? 700 : 500, color: C.text }}>{brand.name}</span>
                    {brand.isYou && <span style={{ fontFamily: C.fontMono, fontSize: "8px", padding: "1px 4px", borderRadius: "2px", background: C.cta, color: "#fff", fontWeight: 700 }}>YOU</span>}
                  </div>
                  <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted }}>Avg score: {avgScore}/100</div>
                </div>
              </button>
            );
          })}

          {/* Insight */}
          <div style={{ marginTop: "8px", padding: "10px 12px", background: C.surfaceAlt, borderRadius: "8px" }}>
            <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, marginBottom: "4px" }}>INSIGHT</div>
            <p style={{ margin: 0, fontSize: "11px", color: C.textSec, lineHeight: 1.5 }}>
              Vous menez en <strong>Share of Voice</strong> et <strong>Media Reach</strong> mais êtes en retard sur <strong>Crisis Resilience</strong> (58 vs 72 pour BoA). Investir dans le monitoring temps réel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
