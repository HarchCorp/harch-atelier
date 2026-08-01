"use client";

// ═══════════════════════════════════════════════════════════════
//  GeoHeatmap — SVG map of Morocco with city alert circles
//
//  Replaces the broken Deck.gl widget that always showed
//  "AWAITING GEO TELEMETRY" because the alerts API carried no
//  lat/lng. This component:
//    • Fetches aggregated geo points from /api/console/geo-signals
//    • Plots them on a static SVG outline of Morocco
//    • Circle SIZE = alert count
//    • Circle COLOR = sentiment (red ← neg, green ← pos, grey ← neutral)
//    • Click a city → onSelectCity(city) opens the drill-down panel
//    • Hover shows a tooltip with city / region / count / sentiment
//
//  No external dependencies (no Mapbox, no Deck.gl, no token). The
//  SVG outline is hand-projected from WGS-84 lat/lng into the
//  800×750 viewBox — accurate enough for a heatmap, not for
//  navigation.
//
//  Task ID: dataminr-geo-multimodal
//  Module:  atelier/console/views/GeoHeatmap
// ═══════════════════════════════════════════════════════════════

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { C } from "../../components/tokens";

// ─── DESIGN TOKENS (mirror BrandMonitorDashboard) ────────────────

const FONT = { sans: C.fontSans, mono: C.fontMono };
const ACCENT = "#059669";
const COL_NEG = C.danger;
const COL_NEU = C.textMuted;
const COL_WARN = C.warning;

// ─── PROJECTION (WGS-84 → viewBox 800×750) ───────────────────────
//
//  Bounding box covers mainland Morocco + Western Sahara down to
//  Dakhla. Using an equirectangular projection (lat/lng → linear
//  x/y) is good enough at this scale — the distortion at lat 27°
//  is ~10% which is invisible on a heatmap.

const LNG_MIN = -17.0;
const LNG_MAX = -1.0;
const LAT_MIN = 21.0;
const LAT_MAX = 36.0;
const VW = 800;
const VH = 750;

function project(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * VW;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * VH;
  return { x, y };
}

// ─── MOROCCO OUTLINE (clockwise from Oujda NE corner) ────────────
//
//  Hand-projected polyline through ~24 anchor points. Not survey-
//  grade — the goal is a recognisable Morocco silhouette, not a
//  GIS-accurate border. Anchor points hit:
//    • Mediterranean coast (Oujda → Tanger)
//    • Atlantic coast (Tanger → Casablanca → Agadir → Dakhla)
//    • Southern Western Sahara border (Dakhla → SE corner)
//    • Algeria border (SE corner → Errachidia → Figuig → Oujda)

const MOROCCO_PATH = [
  [754, 55],   // Oujda (NE corner)
  [700, 40],
  [640, 25],
  [600, 18],
  [558, 7],    // Tanger (NW corner)
  [510, 18],
  [490, 45],
  [475, 75],
  [470, 100],  // Casablanca
  [455, 130],
  [440, 160],
  [415, 195],
  [395, 220],
  [370, 238],  // Agadir
  [340, 268],
  [310, 300],
  [275, 345],
  [240, 395],
  [200, 445],
  [150, 495],
  [100, 540],
  [55, 575],   // Dakhla
  [35, 600],   // SW tip
  [90, 615],
  [180, 610],
  [290, 600],
  [400, 590],
  [510, 580],
  [600, 565],
  [670, 545],
  [720, 505],  // SE corner
  [740, 460],
  [730, 415],
  [715, 370],
  [700, 320],
  [685, 275],
  [670, 230],
  [660, 195],  // Figuig area
  [695, 170],
  [720, 140],
  [740, 105],
  [754, 55],   // back to Oujda
] as const;

const MOROCCO_PATH_D =
  "M " + MOROCCO_PATH.map(([x, y]) => `${x} ${y}`).join(" L ") + " Z";

// ─── TYPES ───────────────────────────────────────────────────────

export interface GeoSignalPoint {
  lat: number;
  lng: number;
  city: string;
  region: string;
  alertCount: number;
  avgSentiment: number | null;
  topSources: string[];
  severity: "critical" | "high" | "medium" | "low";
}

interface GeoHeatmapProps {
  /** Optional override — when provided, no fetch is performed. Used
   *  by story / demo mode to inject synthetic points. */
  points?: GeoSignalPoint[];
  /** Range filter for the API call (default "7d"). */
  range?: "7d" | "30d" | "all";
  /** Called when the user clicks a city marker (or a ghost marker). */
  onSelectCity?: (city: string) => void;
  /** Currently selected city (highlights the marker). */
  selectedCity?: string | null;
  /** Render height in pixels. */
  height?: number;
}

// ─── COLOR HELPERS ───────────────────────────────────────────────

function sentimentColor(score: number | null): string {
  if (score == null) return COL_NEU;
  if (score < -0.3) return COL_NEG;
  if (score > 0.1) return ACCENT;
  return COL_NEU;
}

function sentimentOpacity(score: number | null): number {
  if (score == null) return 0.35;
  // Stronger sentiment → more opaque.
  const mag = Math.min(1, Math.abs(score) * 1.4);
  return 0.45 + mag * 0.45;
}

function circleRadius(alertCount: number): number {
  // sqrt scale so a city with 100 alerts isn't 100× the radius of
  // a city with 1 alert (which would cover the whole map).
  if (alertCount <= 0) return 5; // ghost marker — small dot
  return 8 + Math.sqrt(alertCount) * 5;
}

// ─── COMPONENT ───────────────────────────────────────────────────

export const GeoHeatmap = memo(function GeoHeatmap({
  points: injectedPoints,
  range = "7d",
  onSelectCity,
  selectedCity,
  height = 360,
}: GeoHeatmapProps) {
  const [points, setPoints] = useState<GeoSignalPoint[] | null>(
    injectedPoints ?? null,
  );
  const [loading, setLoading] = useState(!injectedPoints);
  const [error, setError] = useState<string | null>(null);
  const [hovered, setHovered] = useState<GeoSignalPoint | null>(null);

  // Fetch aggregated geo points from the API. Skipped when `points`
  // is injected (story / demo mode).
  const fetchPoints = useCallback(async () => {
    if (injectedPoints) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/console/geo-signals?range=${range}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { points?: GeoSignalPoint[] };
      setPoints(json.points ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fetch failed");
      setPoints([]);
    } finally {
      setLoading(false);
    }
  }, [injectedPoints, range]);

  useEffect(() => {
    if (injectedPoints) return;
    fetchPoints();
  }, [injectedPoints, fetchPoints]);

  // Split points into "active" (with alerts) and "ghosts" (zero
  // alerts). Ghosts render as small grey dots so the user sees the
  // full geographic coverage grid.
  const { active, ghosts } = useMemo(() => {
    if (!points) return { active: [], ghosts: [] };
    return {
      active: points.filter((p) => p.alertCount > 0),
      ghosts: points.filter((p) => p.alertCount === 0),
    };
  }, [points]);

  const totals = useMemo(() => {
    const totalAlerts = active.reduce((s, p) => s + p.alertCount, 0);
    const criticalCities = active.filter((p) => p.severity === "critical").length;
    const highCities = active.filter((p) => p.severity === "high").length;
    return { cities: active.length, totalAlerts, criticalCities, highCities };
  }, [active]);

  // ─── Loading / error / empty states ──────────────────────────
  if (loading) {
    return (
      <div
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: C.bgSubtle,
          border: `1px dashed ${C.border}`,
          borderRadius: 4,
          fontFamily: FONT.mono,
          fontSize: 10,
          color: C.textMuted,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        LOADING GEO SIGNALS…
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          height,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          background: C.dangerBg,
          border: `1px solid ${C.border}`,
          borderRadius: 4,
        }}
      >
        <div style={{ fontFamily: FONT.mono, fontSize: 10, color: COL_NEG, letterSpacing: "0.1em" }}>
          GEO SIGNAL ERROR
        </div>
        <div style={{ fontSize: 11, color: C.textBody, textAlign: "center", padding: "0 16px" }}>
          {error}
        </div>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height,
        background: C.bgSubtle,
        border: `1px solid ${C.border}`,
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: "100%", height: "100%", display: "block" }}
        role="img"
        aria-label="Geographic signal intensity map of Morocco — circle size is alert count, colour is sentiment"
      >
        {/* Background grid */}
        <defs>
          <pattern id="geo-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={C.border} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect x="0" y="0" width={VW} height={VH} fill="url(#geo-grid)" />

        {/* Morocco outline */}
        <path
          d={MOROCCO_PATH_D}
          fill={C.bg}
          stroke={C.borderStrong}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Ghost cities (no alerts — small grey dots) */}
        {ghosts.map((p) => {
          const { x, y } = project(p.lat, p.lng);
          return (
            <g key={`ghost-${p.city}`} opacity={0.4}>
              <circle
                cx={x}
                cy={y}
                r={4}
                fill={C.borderStrong}
                stroke={C.bg}
                strokeWidth="1"
              />
              <text
                x={x + 8}
                y={y + 3}
                fontSize="11"
                fontFamily={FONT.mono}
                fill={C.textMuted}
                opacity={0.6}
              >
                {p.city}
              </text>
            </g>
          );
        })}

        {/* Active cities (with alerts — sized + coloured circles) */}
        {active.map((p) => {
          const { x, y } = project(p.lat, p.lng);
          const r = circleRadius(p.alertCount);
          const fill = sentimentColor(p.avgSentiment);
          const op = sentimentOpacity(p.avgSentiment);
          const isSelected = selectedCity === p.city;
          const isHovered = hovered?.city === p.city;
          return (
            <g
              key={`active-${p.city}`}
              style={{ cursor: onSelectCity ? "pointer" : "default" }}
              onClick={() => onSelectCity?.(p.city)}
              onMouseEnter={() => setHovered(p)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Outer halo (selected / hovered) */}
              {(isSelected || isHovered) && (
                <circle
                  cx={x}
                  cy={y}
                  r={r + 8}
                  fill="none"
                  stroke={isSelected ? ACCENT : C.textMuted}
                  strokeWidth="2"
                  strokeDasharray={isSelected ? "0" : "4 4"}
                  opacity={0.6}
                />
              )}
              {/* Main alert circle */}
              <circle
                cx={x}
                cy={y}
                r={r}
                fill={fill}
                fillOpacity={op}
                stroke={C.bg}
                strokeWidth="2"
              />
              {/* Alert count badge */}
              {p.alertCount > 0 && (
                <text
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  fontSize={Math.max(11, Math.min(16, r * 0.6))}
                  fontWeight={700}
                  fontFamily={FONT.mono}
                  fill={C.bg}
                >
                  {p.alertCount}
                </text>
              )}
              {/* City label */}
              <text
                x={x}
                y={y - r - 6}
                textAnchor="middle"
                fontSize="13"
                fontWeight={600}
                fontFamily={FONT.sans}
                fill={C.text}
              >
                {p.city}
              </text>
            </g>
          );
        })}
      </svg>

      {/* ─── Headline strip (top-left) ───────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          padding: "6px 10px",
          background: C.bg,
          border: `1px solid ${C.border}`,
          borderRadius: "2px",
          fontFamily: FONT.mono,
          fontSize: 9,
          color: C.textMuted,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <div>
          <span style={{ color: C.text, fontWeight: 700 }}>{totals.cities}</span> CITIES
          {" · "}
          <span style={{ color: C.text, fontWeight: 700 }}>{totals.totalAlerts}</span> ALERTS
        </div>
        <div>
          <span style={{ color: COL_NEG, fontWeight: 700 }}>{totals.criticalCities}</span> CRITICAL
          {" · "}
          <span style={{ color: COL_WARN, fontWeight: 700 }}>{totals.highCities}</span> HIGH
        </div>
      </div>

      {/* ─── Legend (bottom-left) ────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 8,
          left: 8,
          padding: "6px 8px",
          background: C.bg,
          border: `1px solid ${C.border}`,
          borderRadius: "2px",
          fontFamily: FONT.mono,
          fontSize: 8,
          color: C.textMuted,
          letterSpacing: "0.08em",
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, background: COL_NEG, borderRadius: "50%", display: "inline-block" }} />
          NEGATIVE
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, background: COL_NEU, borderRadius: "50%", display: "inline-block" }} />
          NEUTRAL
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, background: ACCENT, borderRadius: "50%", display: "inline-block" }} />
          POSITIVE
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
          <span style={{ width: 8, height: 8, background: C.borderStrong, borderRadius: "50%", display: "inline-block", opacity: 0.5 }} />
          NO ALERTS
        </div>
      </div>

      {/* ─── Hint (top-right) ────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          padding: "4px 8px",
          background: C.bg,
          border: `1px solid ${C.border}`,
          borderRadius: "2px",
          fontFamily: FONT.mono,
          fontSize: 8,
          color: C.textMuted,
          letterSpacing: "0.1em",
          pointerEvents: "none",
        }}
      >
        CIRCLE SIZE = ALERT COUNT · CLICK A CITY TO DRILL DOWN
      </div>

      {/* ─── Hover tooltip (bottom-right) ────────────────────── */}
      {hovered && (
        <div
          style={{
            position: "absolute",
            bottom: 8,
            right: 8,
            padding: "8px 10px",
            background: C.bg,
            border: `1px solid ${C.border}`,
            borderRadius: "2px",
            boxShadow: C.shadowSm,
            fontFamily: FONT.mono,
            fontSize: 10,
            color: C.text,
            pointerEvents: "none",
            minWidth: 180,
            maxWidth: 260,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4, fontFamily: FONT.sans }}>
            {hovered.city}
          </div>
          <div style={{ color: C.textMuted, fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
            {hovered.region}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 3 }}>
            <span style={{ color: C.textMuted }}>Alerts</span>
            <span style={{ fontWeight: 700, color: C.text }}>{hovered.alertCount}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 3 }}>
            <span style={{ color: C.textMuted }}>Sentiment</span>
            <span
              style={{
                fontWeight: 700,
                color: sentimentColor(hovered.avgSentiment),
              }}
            >
              {hovered.avgSentiment == null
                ? "—"
                : hovered.avgSentiment > 0
                  ? `+${hovered.avgSentiment.toFixed(2)}`
                  : hovered.avgSentiment.toFixed(2)}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 3 }}>
            <span style={{ color: C.textMuted }}>Severity</span>
            <span
              style={{
                fontWeight: 700,
                color:
                  hovered.severity === "critical"
                    ? COL_NEG
                    : hovered.severity === "high"
                      ? COL_WARN
                      : C.textMuted,
                textTransform: "uppercase",
              }}
            >
              {hovered.severity}
            </span>
          </div>
          {hovered.topSources.length > 0 && (
            <div style={{ marginTop: 6, paddingTop: 6, borderTop: `1px solid ${C.border}` }}>
              <div style={{ color: C.textMuted, fontSize: 9, marginBottom: 3 }}>TOP SOURCES</div>
              {hovered.topSources.map((s) => (
                <div key={s} style={{ fontSize: 10, color: C.textBody, fontFamily: FONT.mono, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default GeoHeatmap;
