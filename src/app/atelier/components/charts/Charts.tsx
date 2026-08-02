"use client";

// ═══════════════════════════════════════════════════════════════
//  HARCH CHARTS LIBRARY — Pure SVG charts, no dependencies
//  Bar · Line · Donut · Gauge · Heatmap · Sparkline · Radar · Trend
// ═══════════════════════════════════════════════════════════════

const C = {
  sage: "#4A7B5F", sageBright: "#6FA386",
  accent: "#4A5D6E", accentBright: "#8B9DAF",
  red: "#A0524B", redBright: "#C77268",
  amber: "#B87333", amberBright: "#D49453",
  text: "#0A0A0A", textSec: "#525252", textMuted: "#71717A",
  surface: "#FFFFFF", surfaceAlt: "#F4F4F5",
  border: "#E5E5E5", borderLight: "#F0F0F0",
};

// ─── BAR CHART (vertical) ────────────────────────────────────────
export function BarChart({
  data, height = 220, color = C.sage, showValues = true, formatValue,
}: {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  color?: string;
  showValues?: boolean;
  formatValue?: (v: number) => string;
}) {
  const max = Math.max(...data.map(d => d.value), 1);
  const barWidth = 100 / data.length;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: `${height}px`, padding: "0 4px" }}>
        {data.map((d, i) => {
          const barHeight = (d.value / max) * (height - 40);
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
              {showValues && (
                <div style={{
                  fontSize: "12px", fontWeight: 700, color: C.text,
                  fontFamily: "'JetBrains Mono', monospace",
                  marginBottom: "6px",
                }}>
                  {formatValue ? formatValue(d.value) : d.value}
                </div>
              )}
              <div style={{
                width: "100%", maxWidth: "60px",
                height: `${barHeight}px`,
                background: d.color || color,
                borderRadius: "6px 6px 0 0",
                transition: "height 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                position: "relative",
              }} />
              <div style={{
                fontSize: "10px", color: C.textMuted,
                fontFamily: "'JetBrains Mono', monospace",
                marginTop: "8px", textAlign: "center",
                lineHeight: 1.3,
              }}>
                {d.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── HORIZONTAL BAR CHART ───────────────────────────────────────
export function HorizontalBarChart({
  data, color = C.sage, showValues = true, formatValue,
}: {
  data: { label: string; value: number; color?: string; sublabel?: string }[];
  color?: string;
  showValues?: boolean;
  formatValue?: (v: number) => string;
}) {
  const max = Math.max(...data.map(d => d.value), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "160px 1fr 60px", gap: "12px", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: C.text }}>{d.label}</div>
            {d.sublabel && (
              <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>{d.sublabel}</div>
            )}
          </div>
          <div style={{ height: "24px", background: C.surfaceAlt, borderRadius: "4px", overflow: "hidden" }}>
            <div style={{
              width: `${(d.value / max) * 100}%`,
              height: "100%",
              background: d.color || color,
              borderRadius: "4px",
              transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            }} />
          </div>
          {showValues && (
            <div style={{
              fontSize: "13px", fontWeight: 700, color: C.text,
              fontFamily: "'JetBrains Mono', monospace", textAlign: "right",
            }}>
              {formatValue ? formatValue(d.value) : d.value}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── LINE CHART (multi-series) ──────────────────────────────────
export function LineChart({
  series, height = 240, yMax, yMin = 0, showDots = true, xLabels,
}: {
  series: { name: string; color: string; points: number[] }[];
  height?: number;
  yMax?: number;
  yMin?: number;
  showDots?: boolean;
  xLabels?: string[];
}) {
  // Empty state — no data or all-zero points
  const hasData = series.length > 0 && series.some(s => s.points.length > 0 && s.points.some(p => p !== 0));
  if (!hasData) {
    return (
      <div style={{
        width: "100%", height,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: "8px",
        background: C.surfaceAlt,
        borderRadius: "8px",
        border: `1px dashed ${C.borderLight}`,
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="1.5">
          <path d="M3 3v18h18" strokeLinecap="round" />
          <path d="M7 14l4-4 4 4 5-5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
        </svg>
        <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Awaiting telemetry
        </div>
        <div style={{ fontSize: "10px", color: C.textFaint }}>
          Data will populate as coverage is detected
        </div>
      </div>
    );
  }

  const allPoints = series.flatMap(s => s.points);
  const max = yMax ?? Math.max(...allPoints, 1);
  const min = yMin;
  const range = max - min || 1;
  const width = 600;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const xStep = chartW / Math.max(...series.map(s => s.points.length - 1), 1);

  // Truncate x-axis labels to prevent overlap (max 8 chars)
  const truncateXLabel = (label: string): string => {
    if (label.length <= 8) return label;
    return label.slice(0, 7) + "…";
  };

  return (
    <div style={{ width: "100%" }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto" }}>
        {/* Y axis grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
          const y = padding.top + chartH * (1 - p);
          const val = Math.round(min + range * p);
          return (
            <g key={i}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke={C.borderLight} strokeWidth="1" />
              <text x={padding.left - 8} y={y + 4} fontSize="10" fill={C.textSec} fontFamily="'JetBrains Mono', monospace" textAnchor="end" fontWeight={600}>
                {val}
              </text>
            </g>
          );
        })}

        {/* Lines */}
        {series.map((s, si) => {
          const path = s.points.map((p, i) => {
            const x = padding.left + i * xStep;
            const y = padding.top + chartH * (1 - (p - min) / range);
            return `${i === 0 ? "M" : "L"} ${x} ${y}`;
          }).join(" ");

          return (
            <g key={si}>
              <path d={path} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
              {showDots && s.points.map((p, i) => {
                const x = padding.left + i * xStep;
                const y = padding.top + chartH * (1 - (p - min) / range);
                return <circle key={i} cx={x} cy={y} r="3" fill={s.color} />;
              })}
            </g>
          );
        })}

        {/* X axis labels */}
        {xLabels && xLabels.map((label, i) => {
          const x = padding.left + i * xStep;
          const shortLabel = truncateXLabel(label);
          return (
            <text key={i} x={x} y={height - 8} fontSize="10" fill={C.textSec} fontFamily="'JetBrains Mono', monospace" textAnchor="middle" fontWeight={600}>
              {shortLabel}
              {shortLabel !== label && <title>{label}</title>}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div style={{ display: "flex", gap: "16px", justifyContent: "center", marginTop: "8px", flexWrap: "wrap" }}>
        {series.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: C.textSec }}>
            <span style={{ width: "10px", height: "10px", background: s.color, borderRadius: "2px" }} />
            {s.name}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── DONUT CHART ────────────────────────────────────────────────
export function DonutChart({
  data, size = 200, thickness = 24, centerLabel, centerValue,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div style={{ display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
      <div style={{ position: "relative", width: `${size}px`, height: `${size}px` }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {/* Background ring */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={C.surfaceAlt} strokeWidth={thickness}
          />
          {/* Data segments */}
          {data.map((d, i) => {
            const dash = (d.value / total) * circumference;
            const seg = (
              <circle
                key={i}
                cx={size / 2} cy={size / 2} r={radius}
                fill="none" stroke={d.color} strokeWidth={thickness}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                style={{ transition: "stroke-dasharray 0.6s ease" }}
              />
            );
            offset += dash;
            return seg;
          })}
        </svg>
        {(centerLabel || centerValue) && (
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          }}>
            {centerValue && (
              <div style={{ fontSize: "32px", fontWeight: 800, color: C.text, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1, letterSpacing: "-0.04em" }}>
                {centerValue}
              </div>
            )}
            {centerLabel && (
              <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "4px" }}>
                {centerLabel}
              </div>
            )}
          </div>
        )}
      </div>
      {/* Legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
            <span style={{ width: "10px", height: "10px", background: d.color, borderRadius: "2px" }} />
            <span style={{ color: C.textSec }}>{d.label}</span>
            <span style={{ fontWeight: 700, color: C.text, fontFamily: "'JetBrains Mono', monospace", marginLeft: "auto", minWidth: "48px", textAlign: "right" }}>
              {Math.round((d.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── GAUGE (semicircle score) ───────────────────────────────────
export function Gauge({ score, max = 100, color = C.sage, label, size = 180 }: { score: number; max?: number; color?: string; label?: string; size?: number }) {
  const pct = Math.min(score / max, 1);
  const radius = size / 2 - 12;
  const circumference = Math.PI * radius;
  const offset = circumference - pct * circumference;

  return (
    <div style={{ position: "relative", width: `${size}px`, height: `${size / 2 + 30}px`, margin: "0 auto" }}>
      <svg width={size} height={size / 2 + 30}>
        <path
          d={`M 12 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 12} ${size / 2}`}
          fill="none" stroke={C.surfaceAlt} strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d={`M 12 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 12} ${size / 2}`}
          fill="none" stroke={color} strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div style={{
        position: "absolute", top: `${size / 2 - 50}px`, left: 0, right: 0,
        textAlign: "center",
      }}>
        <div style={{ fontSize: "40px", fontWeight: 800, color: C.text, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1, letterSpacing: "-0.04em" }}>
          {score}
        </div>
        {label && (
          <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "4px" }}>
            {label}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── HEATMAP (grid) ─────────────────────────────────────────────
export function Heatmap({
  rows, cols, data, colorScale = [C.sage, C.amber, C.red],
}: {
  rows: string[];
  cols: string[];
  data: { row: string; col: string; value: number; label?: string }[];
  colorScale?: string[];
}) {
  const max = Math.max(...data.map(d => d.value), 1);

  const getColor = (value: number) => {
    if (value === 0) return C.surfaceAlt;
    const idx = Math.min(Math.floor((value / max) * colorScale.length), colorScale.length - 1);
    return colorScale[idx];
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ padding: "8px", fontSize: "10px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "left" }}></th>
            {cols.map(c => (
              <th key={c} style={{ padding: "8px 4px", fontSize: "10px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "center", minWidth: "60px" }}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r}>
              <td style={{ padding: "8px", fontSize: "11px", fontWeight: 600, color: C.text, fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap" }}>
                {r}
              </td>
              {cols.map(c => {
                const cell = data.find(d => d.row === r && d.col === c);
                const value = cell?.value || 0;
                return (
                  <td key={c} style={{ padding: "4px", textAlign: "center" }}>
                    <div style={{
                      width: "100%", minHeight: "32px",
                      background: getColor(value),
                      borderRadius: "4px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "11px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                      color: value > max * 0.5 ? "#FFFFFF" : C.textSec,
                    }}>
                      {cell?.label || value}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── SPARKLINE (mini line) ──────────────────────────────────────
export function Sparkline({ data, color = C.sage, width = 80, height = 24 }: { data: number[]; color?: string; width?: number; height?: number }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = width / (data.length - 1);

  const path = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * height;
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── RADAR CHART (multi-axis) ───────────────────────────────────
export function RadarChart({
  axes, series, size = 280,
}: {
  axes: string[];
  series: { name: string; color: string; values: number[] }[]; // 0-100 per axis
  size?: number;
}) {
  // Truncate long axis labels to fit the available space.
  // Max 12 chars — keeps "Sustainability" → "Sustainabili…" from
  // spilling outside the SVG bounds.
  const truncateLabel = (label: string, max = 12): string => {
    if (label.length <= max) return label;
    return label.slice(0, max - 1) + "…";
  };

  const center = size / 2;
  // Increase padding from 50 → 64 to give labels more room
  const radius = size / 2 - 64;
  const angleStep = (2 * Math.PI) / axes.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={size} height={size} style={{ overflow: "visible" }}>
        {/* Concentric polygons */}
        {[0.25, 0.5, 0.75, 1].map((scale, i) => {
          const points = axes.map((_, j) => {
            const angle = j * angleStep - Math.PI / 2;
            const x = center + radius * scale * Math.cos(angle);
            const y = center + radius * scale * Math.sin(angle);
            return `${x},${y}`;
          }).join(" ");
          return (
            <polygon key={i} points={points} fill="none" stroke={C.borderLight} strokeWidth="1" />
          );
        })}

        {/* Axis lines + labels */}
        {axes.map((axis, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          const labelX = center + (radius + 18) * Math.cos(angle);
          const labelY = center + (radius + 18) * Math.sin(angle);
          // Smart text-anchor based on angle position
          const cosA = Math.cos(angle);
          const textAnchor = cosA > 0.3 ? "start" : cosA < -0.3 ? "end" : "middle";
          const shortLabel = truncateLabel(axis, 12);
          return (
            <g key={i}>
              <line x1={center} y1={center} x2={x} y2={y} stroke={C.borderLight} strokeWidth="1" />
              <text
                x={labelX}
                y={labelY}
                fontSize="10"
                fill={C.textSec}
                fontFamily="'JetBrains Mono', monospace"
                textAnchor={textAnchor}
                dominantBaseline="middle"
                style={{ fontWeight: 600 }}
              >
                {shortLabel}
              </text>
              {/* Full label on hover via <title> for accessibility */}
              {axis !== shortLabel && (
                <title>{axis}</title>
              )}
            </g>
          );
        })}

        {/* Data polygons */}
        {series.map((s, si) => {
          const points = s.values.map((v, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const r = (v / 100) * radius;
            const x = center + r * Math.cos(angle);
            const y = center + r * Math.sin(angle);
            return `${x},${y}`;
          }).join(" ");
          return (
            <g key={si}>
              <polygon points={points} fill={s.color} fillOpacity="0.15" stroke={s.color} strokeWidth="2" />
              {s.values.map((v, i) => {
                const angle = i * angleStep - Math.PI / 2;
                const r = (v / 100) * radius;
                const x = center + r * Math.cos(angle);
                const y = center + r * Math.sin(angle);
                return <circle key={i} cx={x} cy={y} r="3" fill={s.color} />;
              })}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div style={{ display: "flex", gap: "16px", marginTop: "8px", flexWrap: "wrap", justifyContent: "center" }}>
        {series.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: C.textSec }}>
            <span style={{ width: "10px", height: "10px", background: s.color, borderRadius: "2px" }} />
            {s.name}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── STACKED BAR (single bar with segments) ────────────────────
export function StackedBar({
  segments, height = 32, showLabels = true,
}: {
  segments: { label: string; value: number; color: string }[];
  height?: number;
  showLabels?: boolean;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;

  return (
    <div>
      <div style={{ display: "flex", height: `${height}px`, borderRadius: "6px", overflow: "hidden", background: C.surfaceAlt }}>
        {segments.map((s, i) => (
          <div key={i} style={{
            width: `${(s.value / total) * 100}%`,
            background: s.color,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "width 0.6s ease",
          }}>
            {showLabels && (s.value / total) > 0.08 && (
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#FFFFFF", fontFamily: "'JetBrains Mono', monospace" }}>
                {Math.round((s.value / total) * 100)}%
              </span>
            )}
          </div>
        ))}
      </div>
      {showLabels && (
        <div style={{ display: "flex", gap: "16px", marginTop: "8px", flexWrap: "wrap" }}>
          {segments.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: C.textSec }}>
              <span style={{ width: "8px", height: "8px", background: s.color, borderRadius: "2px" }} />
              {s.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── STAT CARD (big number) ─────────────────────────────────────
export function StatCard({
  value, label, sublabel, color = C.text, trend, sparklineData, icon,
}: {
  value: string | number;
  label: string;
  sublabel?: string;
  color?: string;
  trend?: { direction: "up" | "down" | "stable"; value: string };
  sparklineData?: number[];
  icon?: string;
}) {
  return (
    <div style={{
      padding: "20px 24px", background: C.surface,
      border: `1px solid ${C.border}`, borderRadius: "10px",
      position: "relative", overflow: "hidden",
    }}>
      {icon && (
        <div style={{
          position: "absolute", top: "16px", right: "16px",
          fontSize: "20px", opacity: 0.3,
        }}>
          {icon}
        </div>
      )}
      <div style={{
        fontSize: "32px", fontWeight: 800, color,
        fontFamily: "'JetBrains Mono', monospace",
        lineHeight: 1, letterSpacing: "-0.04em",
        marginBottom: "8px",
      }}>
        {value}
      </div>
      <div style={{
        fontSize: "12px", fontWeight: 600, color: C.text,
        marginBottom: "2px",
      }}>
        {label}
      </div>
      {sublabel && (
        <div style={{
          fontSize: "11px", color: C.textMuted,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {sublabel}
        </div>
      )}
      {trend && (
        <div style={{
          marginTop: "8px", display: "inline-flex", alignItems: "center", gap: "4px",
          fontSize: "11px", fontWeight: 700,
          fontFamily: "'JetBrains Mono', monospace",
          color: trend.direction === "up" ? C.sage : trend.direction === "down" ? C.red : C.textMuted,
          padding: "2px 8px", borderRadius: "100px",
          background: trend.direction === "up" ? "rgba(74,123,95,0.08)" :
                      trend.direction === "down" ? "rgba(160,82,75,0.08)" : C.surfaceAlt,
        }}>
          {trend.direction === "up" ? "▲" : trend.direction === "down" ? "▼" : "—"} {trend.value}
        </div>
      )}
      {sparklineData && (
        <div style={{ marginTop: "12px" }}>
          <Sparkline data={sparklineData} color={color} width={200} height={32} />
        </div>
      )}
    </div>
  );
}

// ─── METRIC ROW (inline stats) ──────────────────────────────────
export function MetricRow({ metrics }: { metrics: { value: string; label: string; color?: string }[] }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${metrics.length}, 1fr)`,
      gap: "1px", background: C.border,
      borderRadius: "10px", overflow: "hidden",
    }}>
      {metrics.map((m, i) => (
        <div key={i} style={{
          padding: "16px 20px", background: C.surface, textAlign: "center",
        }}>
          <div style={{
            fontSize: "22px", fontWeight: 800, color: m.color || C.text,
            fontFamily: "'JetBrains Mono', monospace",
            lineHeight: 1, letterSpacing: "-0.02em", marginBottom: "4px",
          }}>
            {m.value}
          </div>
          <div style={{
            fontSize: "10px", color: C.textMuted,
            fontFamily: "'JetBrains Mono', monospace",
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            {m.label}
          </div>
        </div>
      ))}
    </div>
  );
}
