"use client";

// ════════════════════════════════════════════════════════════════════
//  HARCH ATELIER — SVG CHARTS LIBRARY
//  Pure SVG, zero chart dependencies. Stripe/Linear-grade dashboards.
//
//  Exports:
//    • RadarChart   — multi-axis competitor comparison
//    • DonutChart   — share of voice with center total
//    • LineChart    — multi-series sentiment over time
//    • BarChart     — horizontal source distribution
//    • HeatMap      — calendar alert activity grid
//    • GaugeChart   — semi-circular reputation score
//
//  All charts:
//    • Responsive (ResizeObserver, width 100%, viewBox-based pixel coords)
//    • White background, light neutral grid
//    • Empty-state → "—"
//    • French labels where applicable
//    • Subtle entrance animations (CSS transitions)
//    • Hover tooltips (absolute-positioned overlays)
// ════════════════════════════════════════════════════════════════════

import { useEffect, useMemo, useRef, useState } from "react";
import { C } from "../components/tokens";

// ─── Shared palette (extends C) ──────────────────────────────────────
const P = {
  ...C,
  grid: "#f1f5f4",          // very light grid line
  gridStrong: "#e5e5e5",    // axis baseline
  axisLabel: "#737373",     // neutral-500
  empty: "#d4d4d4",         // neutral-300 placeholder
  // 5-step intensity ramp (emerald, brand-consistent)
  intensity: ["#f5f5f5", "#d1fae5", "#6ee7b7", "#10b981", "#047857"],
  redRamp: ["#fef2f2", "#fecaca", "#f87171", "#ef4444", "#991b1b"],
  amberRamp: ["#fffbeb", "#fde68a", "#fbbf24", "#f59e0b", "#b45309"],
  greenRamp: ["#ecfdf5", "#a7f3d0", "#34d399", "#10b981", "#047857"],
} as const;

// ─── Hook: measure container width for responsive SVG ────────────────
function useContainerWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        if (w > 0) setWidth(w);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

// ─── Hook: trigger entrance animation after mount ────────────────────
function useMounted(delay = 60) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return mounted;
}

// ─── Helpers ─────────────────────────────────────────────────────────
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180; // 0deg = top (12 o'clock)
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startAngle: number,
  endAngle: number
): string {
  const startOuter = polarToCartesian(cx, cy, rOuter, endAngle);
  const endOuter = polarToCartesian(cx, cy, rOuter, startAngle);
  const startInner = polarToCartesian(cx, cy, rInner, endAngle);
  const endInner = polarToCartesian(cx, cy, rInner, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    `M ${startOuter.x.toFixed(2)} ${startOuter.y.toFixed(2)}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 0 ${endOuter.x.toFixed(2)} ${endOuter.y.toFixed(2)}`,
    `L ${endInner.x.toFixed(2)} ${endInner.y.toFixed(2)}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 1 ${startInner.x.toFixed(2)} ${startInner.y.toFixed(2)}`,
    "Z",
  ].join(" ");
}

/** Catmull-Rom → cubic Bezier for smooth line curves. */
function smoothPath(points: Array<[number, number]>): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0][0]} ${points[0][1]}`;
  if (points.length === 2) return `M ${points[0][0]} ${points[0][1]} L ${points[1][0]} ${points[1][1]}`;
  let d = `M ${points[0][0].toFixed(2)} ${points[0][1].toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d;
}

function fmtFR(n: number, digits = 0): string {
  return n.toLocaleString("fr-FR", { maximumFractionDigits: digits, minimumFractionDigits: 0 });
}

function fmtDateFR(iso: string, opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short" }): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("fr-FR", opts);
}

// ─── Empty state ─────────────────────────────────────────────────────
function EmptyState({ height = 220 }: { height?: number }) {
  return (
    <div
      style={{
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: P.textMuted,
        fontFamily: P.fontSans,
        fontSize: 13,
        fontStyle: "italic",
      }}
    >
      —
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
//  1. RADAR CHART — multi-axis competitor comparison
// ════════════════════════════════════════════════════════════════════
export interface RadarAxis {
  axis: string;
  /** one value per series; must match length of `labels` */
  values: number[];
}

export function RadarChart({
  data,
  labels,
  colors,
  height = 320,
  max = 100,
}: {
  data: RadarAxis[];
  labels: string[];
  colors: string[];
  height?: number;
  /** maximum scale value per axis */
  max?: number;
}) {
  const [ref, w] = useContainerWidth<HTMLDivElement>();
  const mounted = useMounted();

  if (!data || data.length < 3 || labels.length === 0) {
    return (
      <div ref={ref}>
        <EmptyState height={height} />
      </div>
    );
  }

  const size = Math.min(w || 0, height);
  if (size === 0) {
    return <div ref={ref} style={{ width: "100%", height }} />;
  }

  const cx = w / 2;
  const cy = height / 2 + 4;
  const radius = Math.min(w, height) / 2 - 64;
  const axes = data.length;
  const angleStep = 360 / axes;

  // concentric grid rings at 25/50/75/100%
  const rings = [0.25, 0.5, 0.75, 1];

  // axis vertex points
  const axisPoints = data.map((_, i) => polarToCartesian(cx, cy, radius, i * angleStep));

  // build polygon per series
  const seriesPolygons = labels.map((_, s) => {
    const pts = data.map((axis, i) => {
      const v = Math.max(0, Math.min(max, axis.values[s] ?? 0)) / max;
      return polarToCartesian(cx, cy, radius * v, i * angleStep);
    });
    return pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  });

  return (
    <div ref={ref} style={{ width: "100%" }}>
      <svg width={w} height={height} viewBox={`0 0 ${w} ${height}`} role="img" aria-label="Radar — comparaison concurrents">
        {/* concentric rings */}
        {rings.map((r, idx) => {
          const pts = data.map((_, i) => polarToCartesian(cx, cy, radius * r, i * angleStep));
          return (
            <polygon
              key={idx}
              points={pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ")}
              fill="none"
              stroke={idx === rings.length - 1 ? P.gridStrong : P.grid}
              strokeWidth={1}
            />
          );
        })}

        {/* spokes */}
        {axisPoints.map((p, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke={P.grid}
            strokeWidth={1}
          />
        ))}

        {/* ring value labels (top axis) */}
        {rings.map((r) => {
          const p = polarToCartesian(cx, cy, radius * r, 0);
          return (
            <text
              key={r}
              x={p.x + 6}
              y={p.y}
              fontSize={9}
              fill={P.axisLabel}
              fontFamily={P.fontMono}
            >
              {Math.round(r * max)}
            </text>
          );
        })}

        {/* axis labels */}
        {data.map((axis, i) => {
          const p = polarToCartesian(cx, cy, radius + 22, i * angleStep);
          let anchor: "start" | "middle" | "end" = "middle";
          const dx = p.x - cx;
          if (Math.abs(dx) > 4) anchor = dx > 0 ? "start" : "end";
          return (
            <text
              key={i}
              x={p.x}
              y={p.y}
              fontSize={11}
              fill={P.textBody}
              fontFamily={P.fontSans}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontWeight={500}
            >
              {axis.axis}
            </text>
          );
        })}

        {/* series polygons */}
        {labels.map((label, s) => {
          const color = colors[s] ?? P.accent;
          return (
            <g key={s}>
              <polygon
                points={seriesPolygons[s]}
                fill={color}
                fillOpacity={mounted ? 0.14 : 0}
                stroke={color}
                strokeWidth={1.75}
                strokeLinejoin="round"
                style={{
                  transformOrigin: `${cx}px ${cy}px`,
                  transform: mounted ? "scale(1)" : "scale(0)",
                  opacity: mounted ? 1 : 0,
                  transition: "transform 0.7s cubic-bezier(0.16,1,0.3,1), opacity 0.5s ease, fill-opacity 0.6s ease",
                  transitionDelay: `${s * 90}ms`,
                }}
              />
              {/* vertex dots */}
              {data.map((_, i) => {
                const v = Math.max(0, Math.min(max, data[i].values[s] ?? 0)) / max;
                const p = polarToCartesian(cx, cy, radius * v, i * angleStep);
                return (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={mounted ? 2.8 : 0}
                    fill={color}
                    stroke="#fff"
                    strokeWidth={1.2}
                    style={{
                      transition: `r 0.4s ease ${s * 90 + 400}ms`,
                    }}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 18px", justifyContent: "center", marginTop: 4 }}>
        {labels.map((label, s) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: colors[s] ?? P.accent,
                display: "inline-block",
              }}
            />
            <span style={{ fontSize: 11, color: P.textBody, fontFamily: P.fontSans }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
//  2. DONUT CHART — share of voice
// ════════════════════════════════════════════════════════════════════
export interface DonutDatum {
  label: string;
  value: number;
  color: string;
}

export function DonutChart({
  data,
  height = 280,
  centerLabel = "Total",
  formatValue = fmtFR,
}: {
  data: DonutDatum[];
  height?: number;
  centerLabel?: string;
  formatValue?: (v: number) => string;
}) {
  const [ref, w] = useContainerWidth<HTMLDivElement>();
  const mounted = useMounted();
  const [hover, setHover] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div ref={ref}>
        <EmptyState height={height} />
      </div>
    );
  }

  const size = Math.min(w || 0, height);
  if (size === 0) {
    return <div ref={ref} style={{ width: "100%", height }} />;
  }

  const total = data.reduce((s, d) => s + Math.max(0, d.value), 0);
  const cx = Math.min(w * 0.4, height / 2);
  const cy = height / 2;
  const rOuter = Math.min(cx, cy) - 14;
  const rInner = rOuter * 0.62;
  const gap = 2.2; // degrees between segments

  // compute segments
  let acc = 0;
  const segs = data.map((d, i) => {
    const value = Math.max(0, d.value);
    const pct = total > 0 ? value / total : 0;
    const angle = pct * 360;
    const start = acc + (angle > gap ? gap / 2 : 0);
    const end = acc + angle - (angle > gap ? gap / 2 : 0);
    acc += angle;
    return { ...d, pct, startAngle: start, endAngle: end, index: i };
  });

  // for single-segment full-circle, render a ring (special case to avoid 360° arc bug)
  const singleFullRing = segs.length === 1 && segs[0].pct >= 0.999;

  const hovered = hover !== null ? segs[hover] : null;

  return (
    <div ref={ref} style={{ width: "100%", position: "relative" }}>
      <svg width={w} height={height} viewBox={`0 0 ${w} ${height}`} role="img" aria-label="Donut — parts de voix">
        <defs>
          {segs.map((s, i) => (
            <filter key={i} id={`donut-shadow-${i}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity={0.08} />
            </filter>
          ))}
        </defs>

        {/* segments */}
        {segs.map((s, i) => {
          if (singleFullRing) return null;
          const isHovered = hover === i;
          const grow = isHovered ? 5 : 0;
          const color = s.color;
          // animate by transitioning endAngle from start → end
          const animatedEnd = mounted ? s.endAngle : s.startAngle;
          return (
            <path
              key={i}
              d={arcPath(cx, cy, rInner, rOuter + grow, s.startAngle, animatedEnd)}
              fill={color}
              filter={`url(#donut-shadow-${i})`}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{
                cursor: "pointer",
                transition: "d 0.6s cubic-bezier(0.16,1,0.3,1)",
                opacity: hover === null || isHovered ? 1 : 0.55,
              }}
            />
          );
        })}

        {/* single full-ring special case */}
        {singleFullRing && (
          <circle
            cx={cx}
            cy={cy}
            r={(rInner + rOuter) / 2}
            fill="none"
            stroke={segs[0].color}
            strokeWidth={rOuter - rInner}
            style={{
              strokeDasharray: 2 * Math.PI * ((rInner + rOuter) / 2),
              strokeDashoffset: mounted ? 0 : 2 * Math.PI * ((rInner + rOuter) / 2),
              transform: "rotate(-90deg)",
              transformOrigin: `${cx}px ${cy}px`,
              transition: "stroke-dashoffset 0.9s cubic-bezier(0.16,1,0.3,1)",
            }}
          />
        )}

        {/* center label */}
        <text
          x={cx}
          y={cy - 12}
          textAnchor="middle"
          fontSize={10}
          fill={P.textMuted}
          fontFamily={P.fontSans}
          style={{ textTransform: "uppercase", letterSpacing: 0.6 }}
        >
          {hovered ? hovered.label : centerLabel}
        </text>
        <text
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          fontSize={22}
          fontWeight={700}
          fill={hovered ? hovered.color : P.text}
          fontFamily={P.fontMono}
        >
          {hovered ? `${Math.round(hovered.pct * 100)}%` : formatValue(total)}
        </text>
        {hovered && (
          <text
            x={cx}
            y={cy + 30}
            textAnchor="middle"
            fontSize={10}
            fill={P.textMuted}
            fontFamily={P.fontMono}
          >
            {formatValue(hovered.value)}
          </text>
        )}
      </svg>

      {/* legend (right side) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(45%, 220px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 7,
        }}
      >
        {segs.map((s, i) => (
          <div
            key={i}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              opacity: hover === null || hover === i ? 1 : 0.55,
              transition: "opacity 0.15s ease",
            }}
          >
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: 2,
                background: s.color,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                flex: 1,
                fontSize: 11.5,
                color: P.textBody,
                fontFamily: P.fontSans,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {s.label}
            </span>
            <span style={{ fontSize: 11, color: P.text, fontFamily: P.fontMono, fontWeight: 600 }}>
              {Math.round(s.pct * 100)}%
            </span>
            <span style={{ fontSize: 10, color: P.textMuted, fontFamily: P.fontMono, minWidth: 38, textAlign: "right" }}>
              {formatValue(s.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
//  3. LINE CHART — multi-series sentiment over time
// ════════════════════════════════════════════════════════════════════
export interface LinePoint {
  date: string;
  series: Array<{ name: string; value: number; color: string }>;
}

export function LineChart({
  data,
  height = 300,
  yMax,
  yMin = 0,
  formatValue = (v: number) => fmtFR(v),
}: {
  data: LinePoint[];
  height?: number;
  /** explicit y max; if omitted, derived from data */
  yMax?: number;
  yMin?: number;
  formatValue?: (v: number) => string;
}) {
  const [ref, w] = useContainerWidth<HTMLDivElement>();
  const mounted = useMounted();
  const [hoverX, setHoverX] = useState<number | null>(null);

  if (!data || data.length < 2) {
    return (
      <div ref={ref}>
        <EmptyState height={height} />
      </div>
    );
  }

  if (w === 0) {
    return <div ref={ref} style={{ width: "100%", height }} />;
  }

  const padL = 44;
  const padR = 16;
  const padT = 14;
  const padB = 36;
  const innerW = w - padL - padR;
  const innerH = height - padT - padB;

  const seriesNames = data[0].series.map((s) => s.name);
  const seriesColors = data[0].series.map((s) => s.color);

  // compute y bounds
  let computedMax = yMax ?? 0;
  let computedMin = yMin;
  if (yMax == null) {
    for (const pt of data) {
      for (const s of pt.series) {
        if (s.value > computedMax) computedMax = s.value;
        if (s.value < computedMin) computedMin = s.value;
      }
    }
    // pad max a bit, snap to nice number
    const range = computedMax - computedMin || 1;
    computedMax = computedMax + range * 0.12;
  }
  const yLo = Math.min(computedMin, 0);
  const yHi = computedMax;
  const yRange = yHi - yLo || 1;

  const xStep = innerW / (data.length - 1);
  const xOf = (i: number) => padL + i * xStep;
  const yOf = (v: number) => padT + innerH - ((v - yLo) / yRange) * innerH;

  // gridlines: 5 horizontal
  const gridCount = 5;
  const gridYs = Array.from({ length: gridCount + 1 }, (_, k) => {
    const v = yLo + (yRange * k) / gridCount;
    return { v, y: yOf(v) };
  });

  // x-axis date labels: ~6 evenly spaced
  const xLabelCount = Math.min(6, data.length);
  const xLabels = Array.from({ length: xLabelCount }, (_, k) => {
    const i = Math.round((k * (data.length - 1)) / (xLabelCount - 1));
    return { i, date: data[i].date };
  });

  // series paths
  const seriesPaths = seriesNames.map((_, s) => {
    const pts: Array<[number, number]> = data.map((pt, i) => [xOf(i), yOf(pt.series[s].value)]);
    return {
      name: seriesNames[s],
      color: seriesColors[s],
      points: pts,
      path: smoothPath(pts),
      areaPath:
        `M ${pts[0][0].toFixed(2)} ${(padT + innerH).toFixed(2)} ` +
        `L ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)} ` +
        smoothPath(pts).replace(/^M[^C]*/, "").trim() +
        ` L ${pts[pts.length - 1][0].toFixed(2)} ${(padT + innerH).toFixed(2)} Z`,
    };
  });

  // hover index from mouse x
  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const rel = (x - padL) / xStep;
    const idx = Math.round(rel);
    if (idx >= 0 && idx < data.length) setHoverX(idx);
    else setHoverX(null);
  };

  const hoverPt = hoverX !== null ? data[hoverX] : null;
  const tooltipW = 168;

  return (
    <div ref={ref} style={{ width: "100%", position: "relative" }}>
      <svg
        width={w}
        height={height}
        viewBox={`0 0 ${w} ${height}`}
        role="img"
        aria-label="Courbe — sentiment temporel"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverX(null)}
      >
        <defs>
          {seriesPaths.map((s, i) => (
            <linearGradient key={i} id={`line-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.18} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>

        {/* horizontal gridlines */}
        {gridYs.map((g, i) => (
          <g key={i}>
            <line
              x1={padL}
              y1={g.y}
              x2={w - padR}
              y2={g.y}
              stroke={i === gridCount ? P.gridStrong : P.grid}
              strokeWidth={1}
            />
            <text
              x={padL - 8}
              y={g.y + 3}
              fontSize={10}
              fill={P.axisLabel}
              fontFamily={P.fontMono}
              textAnchor="end"
            >
              {formatValue(g.v)}
            </text>
          </g>
        ))}

        {/* x-axis date labels */}
        {xLabels.map((xl, i) => (
          <text
            key={i}
            x={xOf(xl.i)}
            y={height - padB + 18}
            fontSize={10}
            fill={P.axisLabel}
            fontFamily={P.fontMono}
            textAnchor="middle"
          >
            {fmtDateFR(xl.date)}
          </text>
        ))}

        {/* area fills (animated opacity) */}
        {seriesPaths.map((s, i) => (
          <path
            key={`area-${i}`}
            d={s.areaPath}
            fill={`url(#line-grad-${i})`}
            style={{
              opacity: mounted ? 1 : 0,
              transition: `opacity 0.7s ease ${i * 120 + 200}ms`,
            }}
          />
        ))}

        {/* lines (animated stroke-dash draw) */}
        {seriesPaths.map((s, i) => {
          // measure approximate length for dash draw
          const len = (data.length - 1) * xStep * 1.4;
          return (
            <path
              key={`line-${i}`}
              d={s.path}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={len}
              strokeDashoffset={mounted ? 0 : len}
              style={{
                transition: `stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1) ${i * 120}ms`,
              }}
            />
          );
        })}

        {/* hover vertical line + dots */}
        {hoverPt && hoverX !== null && (
          <g>
            <line
              x1={xOf(hoverX)}
              y1={padT}
              x2={xOf(hoverX)}
              y2={padT + innerH}
              stroke={P.borderStrong}
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            {hoverPt.series.map((s, si) => (
              <circle
                key={si}
                cx={xOf(hoverX)}
                cy={yOf(s.value)}
                r={3.8}
                fill="#fff"
                stroke={s.color}
                strokeWidth={2}
              />
            ))}
          </g>
        )}
      </svg>

      {/* tooltip */}
      {hoverPt && hoverX !== null && (
        <div
          style={{
            position: "absolute",
            top: padT,
            left: Math.min(Math.max(xOf(hoverX) - tooltipW / 2, 0), w - tooltipW),
            width: tooltipW,
            background: "#fff",
            border: `1px solid ${P.border}`,
            borderRadius: 8,
            boxShadow: P.shadowMd,
            padding: "8px 10px",
            pointerEvents: "none",
            fontFamily: P.fontSans,
            zIndex: 5,
          }}
        >
          <div style={{ fontSize: 10, color: P.textMuted, fontFamily: P.fontMono, marginBottom: 4 }}>
            {fmtDateFR(hoverPt.date, { day: "2-digit", month: "short", year: "numeric" })}
          </div>
          {hoverPt.series.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 11, color: P.textBody, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {s.name}
              </span>
              <span style={{ fontSize: 11, color: P.text, fontFamily: P.fontMono, fontWeight: 600 }}>
                {formatValue(s.value)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", justifyContent: "center", marginTop: 2 }}>
        {seriesPaths.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 12, height: 2.5, borderRadius: 2, background: s.color, display: "inline-block" }} />
            <span style={{ fontSize: 11, color: P.textBody, fontFamily: P.fontSans }}>{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
//  4. BAR CHART — horizontal, sorted desc, animated
// ════════════════════════════════════════════════════════════════════
export interface BarDatum {
  label: string;
  value: number;
  color?: string;
}

export function BarChart({
  data,
  height,
  formatValue = fmtFR,
  color = P.cta,
}: {
  data: BarDatum[];
  height?: number;
  formatValue?: (v: number) => string;
  color?: string;
}) {
  const [ref, w] = useContainerWidth<HTMLDivElement>();
  const mounted = useMounted();

  const sorted = useMemo(
    () => (data && data.length > 0 ? [...data].sort((a, b) => b.value - a.value) : []),
    [data]
  );

  if (!data || data.length === 0) {
    return (
      <div ref={ref}>
        <EmptyState height={height ?? 200} />
      </div>
    );
  }

  const rowH = 28;
  const gap = 8;
  const computedHeight = height ?? sorted.length * (rowH + gap) + 8;
  const padL = 0;
  const labelW = Math.min(140, w * 0.32);
  const valueW = 56;
  const barX = padL + labelW;
  const barW = Math.max(20, w - labelW - valueW - 8);

  if (w === 0) {
    return <div ref={ref} style={{ width: "100%", height: computedHeight }} />;
  }

  const max = Math.max(...sorted.map((d) => d.value), 1);

  return (
    <div ref={ref} style={{ width: "100%" }}>
      <svg
        width={w}
        height={computedHeight}
        viewBox={`0 0 ${w} ${computedHeight}`}
        role="img"
        aria-label="Barres — distribution par source"
      >
        {sorted.map((d, i) => {
          const y = i * (rowH + gap) + 4;
          const targetW = (Math.max(0, d.value) / max) * barW;
          const animatedW = mounted ? targetW : 0;
          const c = d.color ?? color;
          return (
            <g key={i}>
              {/* label */}
              <text
                x={labelW - 8}
                y={y + rowH / 2 + 1}
                fontSize={11}
                fill={P.textBody}
                fontFamily={P.fontSans}
                textAnchor="end"
                dominantBaseline="middle"
                style={{ overflow: "hidden" }}
              >
                {d.label.length > 22 ? d.label.slice(0, 21) + "…" : d.label}
              </text>
              {/* track */}
              <rect
                x={barX}
                y={y + rowH / 2 - 6}
                width={barW}
                height={12}
                rx={6}
                fill={P.bgSubtle}
              />
              {/* bar */}
              <rect
                x={barX}
                y={y + rowH / 2 - 6}
                width={animatedW}
                height={12}
                rx={6}
                fill={c}
                style={{
                  transition: `width 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 60}ms`,
                }}
              />
              {/* value */}
              <text
                x={barX + animatedW + 6}
                y={y + rowH / 2 + 1}
                fontSize={11}
                fill={P.text}
                fontFamily={P.fontMono}
                fontWeight={600}
                dominantBaseline="middle"
                style={{
                  opacity: mounted ? 1 : 0,
                  transition: `opacity 0.4s ease ${i * 60 + 400}ms`,
                }}
              >
                {formatValue(d.value)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
//  5. HEAT MAP — calendar alert activity (GitHub-style)
// ════════════════════════════════════════════════════════════════════
export interface HeatCell {
  date: string;
  value: number;
  severity?: "red" | "amber" | "green";
}

export function HeatMap({
  data,
  height = 200,
  weeks = 26,
}: {
  data: HeatCell[];
  height?: number;
  /** number of weeks to display (columns); older data clipped */
  weeks?: number;
}) {
  const [ref, w] = useContainerWidth<HTMLDivElement>();
  const [hover, setHover] = useState<{ cell: HeatCell; x: number; y: number } | null>(null);

  if (!data || data.length === 0) {
    return (
      <div ref={ref}>
        <EmptyState height={height} />
      </div>
    );
  }

  // build date → value map
  const map = new Map<string, HeatCell>();
  let maxV = 1;
  for (const c of data) {
    map.set(c.date, c);
    if (c.value > maxV) maxV = c.value;
  }

  // determine end date = max date in data (or today if none)
  let endDate: Date;
  if (data.length > 0) {
    const dates = data.map((d) => new Date(d.date).getTime()).filter((t) => !isNaN(t));
    endDate = dates.length ? new Date(Math.max(...dates)) : new Date();
  } else {
    endDate = new Date();
  }
  // align end to end of its week (Saturday)
  const endDay = endDate.getDay(); // 0=Sun
  endDate = new Date(endDate);
  endDate.setDate(endDate.getDate() + (6 - endDay));

  // start date = weeks * 7 days before
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - (weeks * 7 - 1));
  // align start to Sunday
  const startDay = startDate.getDay();
  startDate.setDate(startDate.getDate() - startDay);

  // total weeks columns (may be weeks + 1 due to alignment)
  const totalDays = Math.round((endDate.getTime() - startDate.getTime()) / 86400000) + 1;
  const cols = Math.ceil(totalDays / 7);

  // cell sizing
  const padL = 28; // day labels
  const padT = 20; // month labels
  const cellGap = 3;
  const availableW = (w || 600) - padL;
  const cellSize = Math.max(8, Math.min(16, Math.floor((availableW - (cols - 1) * cellGap) / cols)));
  const rowH = cellSize + cellGap;
  const colW = cellSize + cellGap;

  // pick color for a cell
  const colorFor = (cell: HeatCell | undefined): string => {
    if (!cell || cell.value <= 0) return "#f5f5f5";
    const level = Math.min(4, Math.max(1, Math.ceil((cell.value / maxV) * 4)));
    if (cell.severity === "red") return P.redRamp[level];
    if (cell.severity === "amber") return P.amberRamp[level];
    if (cell.severity === "green") return P.greenRamp[level];
    return P.intensity[level];
  };

  // build weeks
  const columns: Array<Array<{ date: Date; cell?: HeatCell }>> = [];
  for (let c = 0; c < cols; c++) {
    const col: Array<{ date: Date; cell?: HeatCell }> = [];
    for (let r = 0; r < 7; r++) {
      const offset = c * 7 + r;
      const d = new Date(startDate);
      d.setDate(d.getDate() + offset);
      const iso = d.toISOString().slice(0, 10);
      col.push({ date: d, cell: map.get(iso) });
    }
    columns.push(col);
  }

  // month labels: place at first column of each new month
  const monthLabels: Array<{ x: number; label: string }> = [];
  let lastMonth = -1;
  columns.forEach((col, c) => {
    const firstDate = col[0].date;
    const m = firstDate.getMonth();
    if (m !== lastMonth) {
      monthLabels.push({ x: padL + c * colW, label: firstDate.toLocaleDateString("fr-FR", { month: "short" }) });
      lastMonth = m;
    }
  });

  if (w === 0) {
    return <div ref={ref} style={{ width: "100%", height }} />;
  }

  const dayLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  // show only Lun, Mer, Ven for compactness (rows 1, 3, 5 → indices 0, 2, 4 if Monday-first)
  // Our rows: index 0 = Sunday (getDay 0). Convert to Monday-first display.

  return (
    <div ref={ref} style={{ width: "100%", position: "relative" }}>
      <svg
        width={w}
        height={height}
        viewBox={`0 0 ${w} ${height}`}
        role="img"
        aria-label="Carte de chaleur — activité alertes"
      >
        {/* month labels */}
        {monthLabels.map((m, i) => (
          <text
            key={i}
            x={m.x}
            y={12}
            fontSize={10}
            fill={P.axisLabel}
            fontFamily={P.fontSans}
          >
            {m.label}
          </text>
        ))}

        {/* day labels (Mon, Wed, Fri) */}
        {[1, 3, 5].map((dayIdx) => {
          // dayIdx: 0=Sun → our row 0. Monday=1 → row 1.
          const y = padT + dayIdx * rowH + cellSize - 1;
          return (
            <text
              key={dayIdx}
              x={0}
              y={y}
              fontSize={9}
              fill={P.axisLabel}
              fontFamily={P.fontSans}
              dominantBaseline="middle"
            >
              {dayLabels[(dayIdx - 1 + 7) % 7]}
            </text>
          );
        })}

        {/* cells */}
        {columns.map((col, c) =>
          col.map((entry, r) => {
            const x = padL + c * colW;
            const y = padT + r * rowH;
            const fill = colorFor(entry.cell);
            return (
              <rect
                key={`${c}-${r}`}
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                rx={2}
                fill={fill}
                stroke={entry.cell ? "transparent" : P.grid}
                strokeWidth={0.5}
                onMouseEnter={() => {
                  if (!entry.cell) return;
                  // SVG uses 1:1 viewBox↔pixel mapping, so cell SVG coords == container coords
                  setHover({
                    cell: entry.cell,
                    x: x + cellSize / 2,
                    y: y,
                  });
                }}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: entry.cell ? "pointer" : "default" }}
              />
            );
          })
        )}

        {/* legend */}
        <g transform={`translate(${w - 130}, ${height - 14})`}>
          <text x={0} y={6} fontSize={9} fill={P.axisLabel} fontFamily={P.fontSans}>
            Moins
          </text>
          {P.intensity.slice(0, 5).map((c, i) => (
            <rect
              key={i}
              x={32 + i * 13}
              y={0}
              width={11}
              height={11}
              rx={2}
              fill={c}
              stroke={P.grid}
              strokeWidth={0.5}
            />
          ))}
          <text x={32 + 5 * 13 + 2} y={6} fontSize={9} fill={P.axisLabel} fontFamily={P.fontSans}>
            Plus
          </text>
        </g>
      </svg>

      {/* tooltip */}
      {hover && (
        <div
          style={{
            position: "absolute",
            left: Math.min(Math.max(hover.x - 70, 0), w - 140),
            top: hover.y - 52,
            background: "#fff",
            border: `1px solid ${P.border}`,
            borderRadius: 6,
            boxShadow: P.shadowMd,
            padding: "5px 9px",
            fontFamily: P.fontSans,
            pointerEvents: "none",
            whiteSpace: "nowrap",
            zIndex: 5,
          }}
        >
          <div style={{ fontSize: 10, color: P.textMuted, fontFamily: P.fontMono }}>
            {fmtDateFR(hover.cell.date, { day: "2-digit", month: "short", year: "numeric" })}
          </div>
          <div style={{ fontSize: 12, color: P.text, fontWeight: 600, fontFamily: P.fontMono }}>
            {fmtFR(hover.cell.value)} alerte{hover.cell.value > 1 ? "s" : ""}
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
//  6. GAUGE CHART — semi-circular reputation score
// ════════════════════════════════════════════════════════════════════
export function GaugeChart({
  value,
  max = 100,
  label = "Score de réputation",
  height = 200,
}: {
  value: number;
  max?: number;
  label?: string;
  height?: number;
}) {
  const [ref, w] = useContainerWidth<HTMLDivElement>();
  const mounted = useMounted();

  const clamped = Math.max(0, Math.min(max, value));
  const pct = clamped / max;
  const score = Math.round(clamped);

  // color zone
  const zone =
    pct >= 0.7 ? { color: P.success, label: "Solide", zone: "green" }
    : pct >= 0.4 ? { color: P.warning, label: "À surveiller", zone: "amber" }
    : { color: P.danger, label: "Critique", zone: "red" };

  if (w === 0) {
    return <div ref={ref} style={{ width: "100%", height }} />;
  }

  const cx = w / 2;
  const cy = height - 24;
  const r = Math.min(w / 2 - 16, height - 50);
  const startAngle = 180; // left
  const endAngle = 360; // right (semi-circle, top half)

  // zone arcs (background tracks)
  const zones = [
    { from: 0, to: 0.4, color: P.danger, opacity: 0.18 },
    { from: 0.4, to: 0.7, color: P.warning, opacity: 0.18 },
    { from: 0.7, to: 1, color: P.success, opacity: 0.18 },
  ];

  // Needle: -90deg = pointing left (value 0), 0deg = up, +90deg = right (value max).
  // Uses CSS transform rotate for smooth animation on mount.
  const needleDeg = -90 + pct * 180;
  const needleLen = r - 6;

  // zone track arcs (background)
  const zoneTrackPath = arcPath(cx, cy, r - 12, r, startAngle, endAngle);

  return (
    <div ref={ref} style={{ width: "100%", position: "relative" }}>
      <svg width={w} height={height} viewBox={`0 0 ${w} ${height}`} role="img" aria-label={label}>
        <defs>
          <linearGradient id="gauge-track" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={P.danger} stopOpacity={0.15} />
            <stop offset="40%" stopColor={P.warning} stopOpacity={0.15} />
            <stop offset="70%" stopColor={P.success} stopOpacity={0.15} />
            <stop offset="100%" stopColor={P.success} stopOpacity={0.25} />
          </linearGradient>
        </defs>

        {/* track background */}
        <path d={zoneTrackPath} fill="none" stroke="#f1f5f4" strokeWidth={12} strokeLinecap="round" />

        {/* zone segments (subtle color hints) */}
        {zones.map((z, i) => {
          const a0 = startAngle + z.from * 180 + 1;
          const a1 = startAngle + z.to * 180 - 1;
          return (
            <path
              key={i}
              d={arcPath(cx, cy, r - 12, r, a0, a1)}
              fill="none"
              stroke={z.color}
              strokeWidth={12}
              strokeLinecap="butt"
              opacity={0.22}
            />
          );
        })}

        {/* value arc (animated) */}
        {(() => {
          const a0 = startAngle;
          const a1 = mounted ? startAngle + pct * 180 : startAngle;
          // avoid 0-length path
          if (a1 - a0 < 0.5) return null;
          return (
            <path
              d={arcPath(cx, cy, r - 12, r, a0, a1)}
              fill="none"
              stroke={zone.color}
              strokeWidth={12}
              strokeLinecap="round"
              style={{ transition: "d 1s cubic-bezier(0.16,1,0.3,1)" }}
            />
          );
        })()}

        {/* tick marks at zone boundaries */}
        {[0, 0.4, 0.7, 1].map((t) => {
          const deg = startAngle + t * 180;
          const p1 = polarToCartesian(cx, cy, r - 16, deg);
          const p2 = polarToCartesian(cx, cy, r + 2, deg);
          return (
            <line
              key={t}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={P.borderStrong}
              strokeWidth={1}
            />
          );
        })}

        {/* min / max labels */}
        <text x={cx - r} y={cy + 16} fontSize={10} fill={P.axisLabel} fontFamily={P.fontMono} textAnchor="middle">
          0
        </text>
        <text x={cx + r} y={cy + 16} fontSize={10} fill={P.axisLabel} fontFamily={P.fontMono} textAnchor="middle">
          {max}
        </text>

        {/* needle */}
        <g
          style={{
            transform: `rotate(${mounted ? needleDeg : -90}deg)`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: "transform 1.1s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <line
            x1={cx}
            y1={cy}
            x2={cx}
            y2={cy - needleLen}
            stroke={P.text}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        </g>
        <circle cx={cx} cy={cy} r={5} fill={P.text} />
        <circle cx={cx} cy={cy} r={2} fill="#fff" />

        {/* center score */}
        <text
          x={cx}
          y={cy - r * 0.42}
          textAnchor="middle"
          fontSize={36}
          fontWeight={700}
          fill={zone.color}
          fontFamily={P.fontMono}
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.6s ease 0.5s",
          }}
        >
          {score}
        </text>
        <text
          x={cx}
          y={cy - r * 0.42 + 16}
          textAnchor="middle"
          fontSize={10}
          fill={P.textMuted}
          fontFamily={P.fontSans}
          style={{ textTransform: "uppercase", letterSpacing: 0.6 }}
        >
          {zone.label}
        </text>
      </svg>
      <div style={{ textAlign: "center", fontSize: 11, color: P.textMuted, fontFamily: P.fontSans, marginTop: -6 }}>
        {label}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
//  Convenience demo data (used by dashboard if no data provided)
// ════════════════════════════════════════════════════════════════════
export const CHART_DEMO = {
  radar: {
    data: [
      { axis: "Sentiment", values: [62, 71, 45] },
      { axis: "Share of Voice", values: [78, 65, 58] },
      { axis: "AI Visibility", values: [72, 68, 54] },
      { axis: "Influence", values: [65, 70, 60] },
      { axis: "Crisis Resilience", values: [58, 72, 50] },
      { axis: "Media Reach", values: [84, 70, 62] },
    ],
    labels: ["Attijariwafa", "Bank of Africa", "BCP"],
    colors: ["#1e3a5f", "#4a7b5f", "#a0524b"],
  } as const,
  donut: [
    { label: "Hespress", value: 4280, color: "#10b981" },
    { label: "Le Matin", value: 3120, color: "#78716c" },
    { label: "Médias24", value: 2680, color: "#f59e0b" },
    { label: "Telquel", value: 1840, color: "#a8a29e" },
    { label: "Autres", value: 980, color: "#d4d4d4" },
  ] as const,
  line: Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return {
      date: d.toISOString().slice(0, 10),
      series: [
        { name: "Positif", value: Math.round(45 + 18 * Math.sin(i / 4) + Math.random() * 6), color: "#10b981" },
        { name: "Neutre", value: Math.round(38 + 8 * Math.cos(i / 5) + Math.random() * 4), color: "#78716c" },
        { name: "Négatif", value: Math.round(17 + 6 * Math.sin(i / 3 + 1) + Math.random() * 3), color: "#ef4444" },
      ],
    };
  }),
  bars: [
    { label: "Hespress", value: 4280, color: "#10b981" },
    { label: "Le Matin", value: 3120, color: "#10b981" },
    { label: "Médias24", value: 2680, color: "#78716c" },
    { label: "Telquel", value: 1840, color: "#78716c" },
    { label: "L'Économiste", value: 1420, color: "#78716c" },
    { label: "Aujourd'hui le Maroc", value: 980, color: "#a8a29e" },
  ] as const,
  heatmap: Array.from({ length: 180 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (179 - i));
    const r = Math.random();
    const value = r < 0.55 ? 0 : Math.floor(r * 8) + 1;
    let severity: "red" | "amber" | "green" | undefined;
    if (value >= 6) severity = "red";
    else if (value >= 3) severity = "amber";
    else if (value > 0) severity = "green";
    return { date: d.toISOString().slice(0, 10), value, severity };
  }),
  gauge: { value: 84 } as const,
} as const;
