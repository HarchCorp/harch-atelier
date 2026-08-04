"use client";

import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════
//  EXPOSURE TREND CHART
//
//  Inspired by Meltwater's multi-line exposure charts (IMG_1053).
//  Shows mention volume + sentiment over time with multiple
//  colored trend lines. Key insight: "Exposure increased 116%"
//  with a peak annotation.
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

interface Series {
  name: string;
  color: string;
  data: number[];
}

// Generate 30-day trend data (deterministic — same on every render)
function generateTrend(base: number, volatility: number, trend: number, days: number): number[] {
  const data: number[] = [];
  let val = base;
  for (let i = 0; i < days; i++) {
    val += trend + (Math.sin(i * 0.4) * volatility) + (Math.cos(i * 0.7) * volatility * 0.5);
    data.push(Math.max(0, Math.round(val)));
  }
  return data;
}

const SERIES: Series[] = [
  { name: "Darija", color: "#a0524b", data: generateTrend(40, 15, 2.5, 30) },
  { name: "MSA", color: "#1e3a5f", data: generateTrend(60, 10, 1.2, 30) },
  { name: "Français", color: "#4a7b5f", data: generateTrend(80, 12, -0.5, 30) },
  { name: "English", color: "#8b6914", data: generateTrend(20, 5, 0.8, 30) },
];

export function ExposureTrendChart() {
  const [visibleSeries, setVisibleSeries] = useState<Set<string>>(new Set(SERIES.map((s) => s.name)));
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  const days = 30;
  const width = 800;
  const height = 240;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Find max value across all visible series
  const allValues = SERIES.filter((s) => visibleSeries.has(s.name)).flatMap((s) => s.data);
  const maxValue = Math.max(...allValues, 100);
  const yScale = (v: number) => chartHeight - (v / maxValue) * chartHeight;
  const xScale = (i: number) => (i / (days - 1)) * chartWidth;

  // Build path for each series
  const buildPath = (data: number[]) => {
    return data
      .map((v, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(v)}`)
      .join(" ");
  };

  // Area path (for the top series — fill effect)
  const buildAreaPath = (data: number[]) => {
    const line = data.map((v, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(v)}`).join(" ");
    return `${line} L ${xScale(days - 1)} ${chartHeight} L 0 ${chartHeight} Z`;
  };

  // Calculate total exposure change (first vs last day sum)
  const firstDayTotal = SERIES.reduce((sum, s) => sum + (visibleSeries.has(s.name) ? s.data[0] : 0), 0);
  const lastDayTotal = SERIES.reduce((sum, s) => sum + (visibleSeries.has(s.name) ? s.data[days - 1] : 0), 0);
  const pctChange = firstDayTotal > 0 ? Math.round(((lastDayTotal - firstDayTotal) / firstDayTotal) * 100) : 0;
  const peakValue = Math.max(...allValues);
  const peakDay = allValues.indexOf(peakValue) % days;

  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "12px",
        padding: "20px",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ fontFamily: C.fontMono, fontSize: "11px", fontWeight: 700, color: C.text, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "4px" }}>
            Exposure Trend
          </div>
          <div style={{ fontSize: "13px", color: C.textSec }}>
            <span style={{ fontWeight: 700, color: pctChange >= 0 ? C.danger : C.cta }}>
              {pctChange >= 0 ? "↑" : "↓"} {Math.abs(pctChange)}%
            </span>
            {" — "}
            <span>30-day mention volume by language</span>
          </div>
        </div>

        {/* Peak annotation */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div style={{ fontFamily: C.fontMono, fontSize: "11px", color: C.textMuted }}>
            Peak: <span style={{ fontWeight: 700, color: C.text }}>{peakValue}</span> on day {peakDay + 1}
          </div>
        </div>
      </div>

      {/* Legend (clickable) */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "12px", flexWrap: "wrap" }}>
        {SERIES.map((s) => {
          const isVisible = visibleSeries.has(s.name);
          return (
            <button
              key={s.name}
              onClick={() => {
                setVisibleSeries((prev) => {
                  const next = new Set(prev);
                  if (next.has(s.name)) next.delete(s.name);
                  else next.add(s.name);
                  return next;
                });
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                background: isVisible ? C.surfaceAlt : "transparent",
                border: `1px solid ${isVisible ? s.color : C.border}`,
                borderRadius: "6px",
                fontFamily: C.fontMono,
                fontSize: "11px",
                fontWeight: 600,
                color: isVisible ? s.color : C.textMuted,
                cursor: "pointer",
                opacity: isVisible ? 1 : 0.5,
                transition: "all 0.15s",
              }}
            >
              <span style={{ width: "10px", height: "3px", borderRadius: "2px", background: s.color }} />
              {s.name}
            </button>
          );
        })}
      </div>

      {/* Chart */}
      <div style={{ position: "relative", overflowX: "auto" }}>
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          style={{ display: "block" }}
          onMouseLeave={() => setHoveredDay(null)}
        >
          <defs>
            <linearGradient id="darijaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a0524b" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#a0524b" stopOpacity="0" />
            </linearGradient>
          </defs>

          <g transform={`translate(${padding.left}, ${padding.top})`}>
            {/* Y-axis grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
              const y = chartHeight * (1 - pct);
              const value = Math.round(maxValue * pct);
              return (
                <g key={pct}>
                  <line x1={0} y1={y} x2={chartWidth} y2={y} stroke={C.border} strokeWidth={1} />
                  <text x={-8} y={y + 4} textAnchor="end" fontSize="10" fill={C.textMuted} fontFamily={C.fontMono}>
                    {value}
                  </text>
                </g>
              );
            })}

            {/* X-axis labels (every 5 days) */}
            {Array.from({ length: 6 }, (_, i) => i * 6).map((day) => (
              <text key={day} x={xScale(day)} y={chartHeight + 18} textAnchor="middle" fontSize="10" fill={C.textMuted} fontFamily={C.fontMono}>
                J-{30 - day}
              </text>
            ))}

            {/* Area fill for Darija (the highest-signal series) */}
            {visibleSeries.has("Darija") && (
              <path d={buildAreaPath(SERIES[0].data)} fill="url(#darijaGradient)" />
            )}

            {/* Lines */}
            {SERIES.filter((s) => visibleSeries.has(s.name)).map((s) => (
              <path
                key={s.name}
                d={buildPath(s.data)}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                style={{ transition: "opacity 0.3s" }}
              />
            ))}

            {/* Hover indicator */}
            {hoveredDay !== null && (
              <g>
                <line
                  x1={xScale(hoveredDay)}
                  y1={0}
                  x2={xScale(hoveredDay)}
                  y2={chartHeight}
                  stroke={C.text}
                  strokeWidth={1}
                  strokeDasharray="3,3"
                  opacity={0.3}
                />
                {SERIES.filter((s) => visibleSeries.has(s.name)).map((s) => (
                  <circle
                    key={s.name}
                    cx={xScale(hoveredDay)}
                    cy={yScale(s.data[hoveredDay])}
                    r={4}
                    fill={s.color}
                    stroke={C.surface}
                    strokeWidth={2}
                  />
                ))}
              </g>
            )}

            {/* Hover overlay (invisible rects to capture mouse) */}
            {Array.from({ length: days }, (_, i) => (
              <rect
                key={i}
                x={xScale(i) - (chartWidth / days) / 2}
                y={0}
                width={chartWidth / days}
                height={chartHeight}
                fill="transparent"
                onMouseEnter={() => setHoveredDay(i)}
              />
            ))}
          </g>
        </svg>

        {/* Hover tooltip */}
        {hoveredDay !== null && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: `${padding.left + xScale(hoveredDay) + 10}px`,
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "8px",
              padding: "8px 12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, marginBottom: "4px" }}>Day {hoveredDay + 1}</div>
            {SERIES.filter((s) => visibleSeries.has(s.name)).map((s) => (
              <div key={s.name} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: C.text }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: s.color }} />
                <span style={{ fontFamily: C.fontMono }}>{s.name}:</span>
                <span style={{ fontWeight: 700 }}>{s.data[hoveredDay]}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer insight */}
      <div style={{ marginTop: "12px", padding: "10px 14px", background: C.surfaceAlt, borderRadius: "8px", display: "flex", gap: "8px", alignItems: "center" }}>
        <span style={{ fontSize: "14px" }}>💡</span>
        <p style={{ margin: 0, fontSize: "12px", color: C.textSec, lineHeight: 1.5 }}>
          {pctChange > 0
            ? `L'exposure globale a augmenté de ${pctChange}% en 30 jours. Le Darija porte la croissance (+${Math.round((SERIES[0].data[29] - SERIES[0].data[0]) / SERIES[0].data[0] * 100)}%), signe d'un bad buzz émergent en UGC. Surveiller la cascade vers MSA/Français.`
            : `L'exposure globale a baissé de ${Math.abs(pctChange)}% en 30 jours. Le sentiment s'améliore.`}
        </p>
      </div>
    </div>
  );
}
