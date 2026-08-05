"use client";

// ═══════════════════════════════════════════════════════════════
//  CrisisIndicator — compact crisis-score widget
//
//  Sits at the top of every console dashboard's Overview section,
//  right after the KPI strip. Surfaces the real-time crisis score
//  (0-100) computed by /api/console/crisis, the contributing
//  factors as horizontal bars, the recommended action, and an
//  expandable list of the alerts that triggered the score.
//
//  Visual:
//   • Big number (32px mono) + level badge (color-coded).
//   • 4 factor bars (velocity / sentiment / spread / escalation).
//   • Recommendation text (1-2 lines).
//   • "View details" toggle → triggering alerts list.
//   • Critical level pulses the badge (CSS keyframes).
//
//  Color map (matches the spec):
//   • 0-30  → green  (normal)
//   • 31-60 → amber  (elevated)
//   • 61-80 → red    (high)
//   • 81-100 → crimson (critical)
//
//  Task ID: dataminr-realtime-crisis
// ═══════════════════════════════════════════════════════════════

import { memo, useCallback, useEffect, useState } from "react";
import { C } from "../../components/tokens";
import type {
  CrisisDetectorResult,
  CrisisFactor,
  CrisisLevel,
} from "@/lib/harchiq/crisis-detector";

const FONT = { sans: C.fontSans, mono: C.fontMono };

// ─── Date safety helper ────────────────────────────────────────
// `new Date(maybeInvalidString)` throws RangeError on Safari/FF
// when the string is not a parseable ISO date. Triggering alerts
// occasionally carry legacy `publishedAt` values — this never throws.
function safeFormatDate(
  iso: string | null | undefined,
  opts: Intl.DateTimeFormatOptions,
  locale = "en-US",
): string {
  if (!iso || typeof iso !== "string") return "—";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "—";
  try {
    return new Date(iso).toLocaleString(locale, opts);
  } catch {
    return "—";
  }
}

// ─── Server-returned shape (includes triggeringAlerts + company) ─
interface TriggeringAlert {
  id: string;
  title: string;
  source: string;
  url?: string | null;
  sentimentScore: number | null;
  severity: "critical" | "high" | "medium" | "low";
  publishedAt: string | null;
}

interface CrisisApiResponse extends CrisisDetectorResult {
  company?: { name: string; slug: string };
  triggeringAlerts?: TriggeringAlert[];
  cached?: boolean;
  cachedAt?: string;
}

// ─── Level → color mapping ─────────────────────────────────────
function levelColors(level: CrisisLevel): {
  bg: string;
  text: string;
  border: string;
  badge: string;
  bar: string;
  glow: string;
} {
  switch (level) {
    case "critical":
      return {
        bg: "#fef2f2",
        text: "#991b1b",
        border: "#dc2626",
        badge: "#dc2626",
        bar: "#dc2626",
        glow: "rgba(220,38,38,0.45)",
      };
    case "high":
      return {
        bg: "#fef2f2",
        text: "#b91c1c",
        border: "#ef4444",
        badge: "#ef4444",
        bar: "#ef4444",
        glow: "rgba(239,68,68,0.35)",
      };
    case "elevated":
      return {
        bg: "#fffbeb",
        text: "#b45309",
        border: "#f59e0b",
        badge: "#f59e0b",
        bar: "#f59e0b",
        glow: "rgba(245,158,11,0.30)",
      };
    case "normal":
    default:
      return {
        bg: "#ecfdf5",
        text: "#047857",
        border: "#10b981",
        badge: "#10b981",
        bar: "#10b981",
        glow: "rgba(16,185,129,0.20)",
      };
  }
}

// ─── Inline CSS for the critical-pulse animation ───────────────
// Injected once via a <style> tag — keeps the widget self-contained
// without touching globals.css.
const PULSE_KEYFRAMES = `
@keyframes harch-crisis-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(220,38,38,0.55); }
  70%  { box-shadow: 0 0 0 10px rgba(220,38,38,0); }
  100% { box-shadow: 0 0 0 0 rgba(220,38,38,0); }
}
@keyframes harch-crisis-flash {
  0%   { background-color: rgba(245,158,11,0.20); }
  100% { background-color: transparent; }
}
@keyframes harch-crisis-score-tick {
  0%   { transform: translateY(-2px); opacity: 0.6; }
  100% { transform: translateY(0); opacity: 1; }
}
`;

// ─── Factor bar ────────────────────────────────────────────────
function FactorBar({
  factor,
  color,
}: {
  factor: CrisisFactor;
  color: string;
}) {
  const pct = Math.max(0, Math.min(100, factor.score));
  return (
    <div style={{ marginBottom: 8 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 3,
        }}
      >
        <span
          style={{
            fontFamily: FONT.mono,
            fontSize: 10,
            color: C.textBody,
            letterSpacing: "0.05em",
            fontWeight: 600,
          }}
        >
          {factor.label}
        </span>
        <span
          style={{
            fontFamily: FONT.mono,
            fontSize: 10,
            color: C.textMuted,
          }}
        >
          {factor.score}/100
        </span>
      </div>
      <div
        style={{
          height: 4,
          background: C.bgHover,
          borderRadius: 2,
          overflow: "hidden",
          position: "relative",
        }}
        aria-hidden
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: color,
            transition: "width 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </div>
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 9,
          color: C.textMuted,
          marginTop: 2,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        title={factor.description}
      >
        {factor.description}
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────
export interface CrisisIndicatorProps {
  /** Polling interval in ms. Default 60s. */
  pollIntervalMs?: number;
  /** Bypass the in-memory cache server-side (?refresh=1). */
  forceRefresh?: boolean;
  /** Optional accent override (defaults to crisis-level color). */
  accent?: string;
  /** Compact mode — hides the recommendation text + factor labels. */
  compact?: boolean;
}

export const CrisisIndicator = memo(function CrisisIndicator({
  pollIntervalMs = 60_000,
  forceRefresh = false,
  accent,
  compact = false,
}: CrisisIndicatorProps) {
  const [data, setData] = useState<CrisisApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [lastFetch, setLastFetch] = useState<Date>(new Date());

  const fetchCrisis = useCallback(async () => {
    try {
      const url = `/api/console/crisis${forceRefresh ? "?refresh=1" : ""}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          // Auth gated — show a quiet state, don't spam errors.
          setError(false);
          setLoading(false);
          setData(null);
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const json = (await res.json()) as CrisisApiResponse;
      setData(json);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setLastFetch(new Date());
    }
  }, [forceRefresh]);

  useEffect(() => {
    fetchCrisis();
    const id = setInterval(fetchCrisis, pollIntervalMs);
    return () => clearInterval(id);
  }, [fetchCrisis, pollIntervalMs]);

  // Render
  const level: CrisisLevel = data?.level ?? "normal";
  const score: number = data?.score ?? 0;
  const colors = levelColors(level);
  const themeAccent = accent ?? colors.badge;

  const factors = data?.factors ?? [];
  // The 4 spec-required factor bars: velocity, sentiment, spread, escalation.
  // Keywords is shown in the expanded details.
  const factorBars = ["velocity", "sentiment", "sourceSpread", "severity"]
    .map((k) => factors.find((f) => f.key === k))
    .filter((f): f is CrisisFactor => !!f);
  const keywordFactor = factors.find((f) => f.key === "keywords");

  const isCritical = level === "critical";
  const isPulse = isCritical;

  return (
    <section
      data-crisis-level={level}
      style={{
        gridColumn: compact ? "span 6" : "span 12",
        background: C.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: "4px",
        padding: compact ? 12 : 16,
        boxShadow: C.shadowSm,
        position: "relative",
        overflow: "hidden",
      }}
      aria-label="Crisis indicator"
    >
      <style dangerouslySetInnerHTML={{ __html: PULSE_KEYFRAMES }} />

      {/* ─── Header strip ─── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: compact ? 8 : 12,
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontFamily: FONT.mono,
              fontSize: 10,
              fontWeight: 700,
              color: C.textMuted,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Crisis Score
          </span>
          {data?.cached ? (
            <span
              style={{
                fontFamily: FONT.mono,
                fontSize: 9,
                color: C.textMuted,
                padding: "1px 5px",
                border: `1px solid ${C.border}`,
                borderRadius: 2,
              }}
              title={`Cached at ${data.cachedAt}`}
            >
              CACHED
            </span>
          ) : null}
        </div>

        {/* Level badge */}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontFamily: FONT.mono,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: C.bg,
            background: colors.badge,
            padding: "4px 10px",
            borderRadius: 3,
            animation: isPulse
              ? "harch-crisis-pulse 1.6s infinite"
              : undefined,
          }}
          role="status"
          aria-live="polite"
        >
          {isPulse ? (
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: C.bg,
                display: "inline-block",
              }}
            />
          ) : null}
          {level === "normal" ? "SAFE" : level.toUpperCase()}
        </span>
      </div>

      {/* ─── Big score + factors (two-column on wide, stacked on narrow) ─── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: compact ? "1fr" : "120px 1fr",
          gap: compact ? 12 : 20,
          alignItems: "start",
        }}
      >
        {/* Score block */}
        <div>
          {loading ? (
            <div
              style={{
                fontFamily: FONT.mono,
                fontSize: 32,
                fontWeight: 700,
                color: C.textMuted,
                lineHeight: 1,
              }}
            >
              —
            </div>
          ) : (
            <div
              key={score}
              style={{
                fontFamily: FONT.mono,
                fontSize: 40,
                fontWeight: 700,
                color: colors.text,
                lineHeight: 1,
                letterSpacing: "-0.04em",
                animation: "harch-crisis-score-tick 0.4s ease-out",
              }}
            >
              {score}
              <span
                style={{
                  fontSize: 14,
                  color: C.textMuted,
                  marginLeft: 2,
                  fontWeight: 500,
                }}
              >
                /100
              </span>
            </div>
          )}
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 9,
              color: C.textMuted,
              marginTop: 4,
              letterSpacing: "0.05em",
            }}
          >
            {data
              ? `${(data.inputSize?.recent) || 0} alerts (24h) · ${(data.inputSize?.baseline) || 0} baseline`
              : "loading…"}
          </div>
          {data?.company ? (
            <div
              style={{
                fontFamily: FONT.sans,
                fontSize: 10,
                color: C.textBody,
                marginTop: 4,
              }}
            >
              {data.company.name}
            </div>
          ) : null}
        </div>

        {/* Factor bars */}
        <div>
          {factorBars.length === 0 && !loading ? (
            <div
              style={{
                fontFamily: FONT.mono,
                fontSize: 10,
                color: C.textMuted,
                padding: "8px 0",
              }}
            >
              No factor data yet.
            </div>
          ) : (
            factorBars.map((f) => (
              <FactorBar
                key={f.key}
                factor={f}
                color={themeAccent}
              />
            ))
          )}
          {error ? (
            <div
              style={{
                fontFamily: FONT.mono,
                fontSize: 10,
                color: C.danger,
                marginTop: 6,
              }}
            >
              Couldn&apos;t reach crisis engine. Retrying…
            </div>
          ) : null}
        </div>
      </div>

      {/* ─── Recommendation ─── */}
      {!compact && data?.recommendation ? (
        <div
          style={{
            marginTop: 12,
            padding: "8px 10px",
            background: colors.bg,
            borderLeft: `2px solid ${colors.border}`,
            borderRadius: 2,
            fontFamily: FONT.sans,
            fontSize: 11,
            color: colors.text,
            lineHeight: 1.45,
          }}
        >
          <span
            style={{
              fontFamily: FONT.mono,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginRight: 6,
              opacity: 0.7,
            }}
          >
            Action
          </span>
          {data.recommendation}
        </div>
      ) : null}

      {/* ─── View details toggle ─── */}
      <div
        style={{
          marginTop: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          style={{
            fontFamily: FONT.mono,
            fontSize: 10,
            fontWeight: 600,
            color: themeAccent,
            background: "transparent",
            border: "none",
            padding: 0,
            cursor: "pointer",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
          aria-expanded={expanded}
        >
          {expanded ? "Hide details" : "View details"}
          <span style={{ marginLeft: 4 }}>
            {expanded ? "▲" : "▼"}
          </span>
        </button>
        <span
          style={{
            fontFamily: FONT.mono,
            fontSize: 9,
            color: C.textMuted,
          }}
        >
          updated {lastFetch.toLocaleTimeString("en-US", { hour12: false })}
        </span>
      </div>

      {/* ─── Expanded details: triggering alerts + keyword factor ─── */}
      {expanded ? (
        <div
          style={{
            marginTop: 10,
            paddingTop: 10,
            borderTop: `1px dashed ${C.border}`,
          }}
        >
          {/* Keyword factor (only shown in expanded view) */}
          {keywordFactor ? (
            <div style={{ marginBottom: 10 }}>
              <FactorBar factor={keywordFactor} color={themeAccent} />
            </div>
          ) : null}

          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 9,
              color: C.textMuted,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
            Triggering alerts ({data?.triggeringAlerts?.length ?? 0})
          </div>

          {data?.triggeringAlerts && data.triggeringAlerts.length > 0 ? (
            <div
              style={{
                maxHeight: 280,
                overflowY: "auto",
                border: `1px solid ${C.border}`,
                borderRadius: 3,
                background: C.bgSubtle,
              }}
            >
              {data.triggeringAlerts.map((a, i) => (
                <div
                  key={a.id}
                  style={{
                    display: "flex",
                    gap: 8,
                    padding: "6px 8px",
                    borderBottom:
                      i < data.triggeringAlerts!.length - 1
                        ? `1px solid ${C.border}`
                        : "none",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONT.mono,
                      fontSize: 9,
                      fontWeight: 700,
                      padding: "2px 5px",
                      borderRadius: 2,
                      background:
                        a.severity === "critical"
                          ? "rgba(220,38,38,0.12)"
                          : a.severity === "high"
                          ? "rgba(239,68,68,0.10)"
                          : "rgba(245,158,11,0.10)",
                      color:
                        a.severity === "critical"
                          ? "#dc2626"
                          : a.severity === "high"
                          ? "#ef4444"
                          : "#f59e0b",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      flexShrink: 0,
                      minWidth: 56,
                      textAlign: "center",
                    }}
                  >
                    {a.severity}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {a.url ? (
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontFamily: FONT.sans,
                          fontSize: 11,
                          color: C.text,
                          textDecoration: "none",
                          display: "block",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={a.title}
                      >
                        {a.title}
                      </a>
                    ) : (
                      <div
                        style={{
                          fontFamily: FONT.sans,
                          fontSize: 11,
                          color: C.text,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={a.title}
                      >
                        {a.title}
                      </div>
                    )}
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        fontFamily: FONT.mono,
                        fontSize: 9,
                        color: C.textMuted,
                        marginTop: 2,
                      }}
                    >
                      <span>{a.source}</span>
                      {a.publishedAt ? (
                        <span>
                          {safeFormatDate(a.publishedAt, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </span>
                      ) : null}
                      {typeof a.sentimentScore === "number" ? (
                        <span>
                          sent {a.sentimentScore.toFixed(2)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                fontFamily: FONT.mono,
                fontSize: 10,
                color: C.textMuted,
                padding: "10px 0",
                textAlign: "center",
                background: C.bgSubtle,
                borderRadius: 3,
                border: `1px dashed ${C.border}`,
              }}
            >
              {level === "normal"
                ? "No triggering alerts — crisis score is nominal."
                : "Awaiting alert telemetry."}
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
});

export default CrisisIndicator;
