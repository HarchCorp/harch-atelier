"use client";

// ═══════════════════════════════════════════════════════════════
//  InfluencerDatabase.tsx — Klear / Meltwater-style directory
//
//  Surfaces the curated 50-profile Moroccan Influencer DB with:
//    • Toolbar: free-text search, platform chips, location filter,
//      min influence slider
//    • KPI strip: total / press / twitter / linkedin / youtube
//    • Virtualized influencer card list (TanStack Virtual, 116px rows)
//    • Detail panel: avatar + scores + 3 sub-score mini bars + topic
//      chips + radar chart (reach, engagement, authority, consistency,
//      relevance) + 30-day mention trend line chart + virtualized
//      recent mentions list with sentiment badges
//
//  All data flows from /api/console/influencers-db (list) and
//  /api/console/influencers-db/[id] (detail). Zero mock data.
//  Light theme, English, no emojis, C tokens only.
// ═══════════════════════════════════════════════════════════════

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts";
import { C } from "../../components/tokens";
import { SkeletonLoader, ErrorState } from "./SkeletonLoader";

// ─── Design tokens (consistent with InfluencerPanel) ────────────
const FONT = { sans: C.fontSans, mono: C.fontMono };
const ACCENT = "#059669";
const ACCENT_BG = "rgba(5,150,105,0.08)";
const COL_POS = ACCENT;
const COL_NEG = C.danger;
const COL_NEU = C.textMuted;
const COL_WARN = C.warning;

// ─── Types mirroring API response ───────────────────────────────
type Platform = "twitter" | "linkedin" | "instagram" | "youtube" | "tiktok" | "press";

interface InfluencerListRow {
  id: string;
  name: string;
  handle: string | null;
  platform: Platform;
  bio: string | null;
  followers: number;
  following: number;
  verified: boolean;
  location: string | null;
  languages: string[];
  topics: string[];
  reachScore: number;
  engagementScore: number;
  authorityScore: number;
  influenceScore: number;
  lastAnalyzed: string | null;
  mentionCount: number;
}

interface InfluencerListResponse {
  influencers: InfluencerListRow[];
  total: number;
  platform: Platform | null;
  minScore: number;
  location: string | null;
  topic: string | null;
  q: string | null;
  limit: number;
  offset: number;
  platformBreakdown: Record<Platform, number>;
}

interface InfluencerMention {
  id: string;
  title: string;
  url: string | null;
  sentiment: "positive" | "neutral" | "negative";
  reach: number;
  publishedAt: string;
}

interface MentionTrendPoint {
  date: string;
  count: number;
  positive: number;
  negative: number;
  neutral: number;
}

interface ScoreBreakdown {
  reach: number;
  engagement: number;
  authority: number;
  consistency: number;
  relevance: number;
}

interface InfluencerDetail {
  influencer: Omit<InfluencerListRow, "mentionCount">;
  mentions: InfluencerMention[];
  mentionTrend: MentionTrendPoint[];
  scoreBreakdown: ScoreBreakdown;
}

// ─── Shared inline styles ───────────────────────────────────────
const widgetCardStyle: CSSProperties = {
  border: `1px solid ${C.border}`,
  borderRadius: "4px",
  padding: "12px",
  background: C.bg,
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
};

const labelStyle: CSSProperties = {
  fontSize: "10px",
  fontFamily: FONT.mono,
  color: C.textMuted,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  fontWeight: 600,
};

const titleLabelStyle: CSSProperties = {
  ...labelStyle,
  marginBottom: "10px",
};

// ─── Platform metadata ──────────────────────────────────────────
const PLATFORM_LABELS: Record<Platform, string> = {
  press: "Press",
  twitter: "Twitter/X",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  tiktok: "TikTok",
  instagram: "Instagram",
};

const PLATFORM_COLORS: Record<Platform, string> = {
  press: C.accent,
  twitter: "#0f1419",
  linkedin: "#444",
  youtube: "#b31217",
  tiktok: "#010101",
  instagram: "#c13584",
};

const PLATFORM_ORDER: Platform[] = ["press", "twitter", "linkedin", "youtube", "tiktok", "instagram"];

const MOROCCAN_CITIES = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Fes",
  "Tangier",
  "Agadir",
  "Meknes",
];

// ─── Helpers ────────────────────────────────────────────────────
function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function influenceColor(score: number): string {
  if (score >= 70) return ACCENT;
  if (score >= 55) return C.accent;
  if (score >= 40) return COL_WARN;
  return COL_NEU;
}

function sentimentColor(s: string): string {
  if (s === "positive") return COL_POS;
  if (s === "negative") return COL_NEG;
  return COL_NEU;
}

// ─── KPI tile ───────────────────────────────────────────────────
function KpiTile({
  label,
  value,
  unit,
  sub,
  accentColor,
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  accentColor?: string;
}) {
  return (
    <div style={widgetCardStyle}>
      <div style={labelStyle}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginTop: "8px" }}>
        <span style={{
          fontSize: "28px", fontWeight: 800, fontFamily: FONT.mono,
          color: accentColor ?? C.text, letterSpacing: "-0.02em", lineHeight: 1,
        }}>
          {value}
        </span>
        {unit && <span style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted }}>{unit}</span>}
      </div>
      {sub && <div style={{ fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted, marginTop: "6px" }}>{sub}</div>}
    </div>
  );
}

// ─── Avatar (initials circle) ───────────────────────────────────
function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: ACCENT_BG,
        border: `1px solid ${C.border}`,
        color: ACCENT,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT.mono,
        fontWeight: 700,
        fontSize: size * 0.34,
        flexShrink: 0,
        letterSpacing: "0.04em",
      }}
    >
      {initials(name)}
    </div>
  );
}

// ─── Sub-score mini bar ─────────────────────────────────────────
function MiniBar({ label, value, color }: { label: string; value: number; color?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ fontSize: "9px", fontFamily: FONT.mono, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
        <span style={{ fontSize: "10px", fontFamily: FONT.mono, color: color ?? C.textBody, fontWeight: 700 }}>{v}</span>
      </div>
      <div style={{ height: "4px", background: C.bgHover, borderRadius: "2px", overflow: "hidden" }}>
        <div style={{ width: `${v}%`, height: "100%", background: color ?? C.accent, borderRadius: "2px", transition: "width 0.25s ease" }} />
      </div>
    </div>
  );
}

// ─── Platform filter chip ───────────────────────────────────────
function PlatformChip({
  platform,
  count,
  active,
  onClick,
}: {
  platform: Platform;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  const color = PLATFORM_COLORS[platform];
  return (
    <button
      onClick={onClick}
      type="button"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "5px 10px",
        borderRadius: "999px",
        background: active ? `${color}14` : C.bg,
        border: `1px solid ${active ? color : C.border}`,
        fontFamily: FONT.mono,
        fontSize: "10px",
        fontWeight: 600,
        color: active ? color : C.textBody,
        cursor: "pointer",
        letterSpacing: "0.04em",
        transition: "all 0.15s",
        textTransform: "uppercase",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = color;
          e.currentTarget.style.color = color;
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = C.border;
          e.currentTarget.style.color = C.textBody;
        }
      }}
    >
      <span>{PLATFORM_LABELS[platform]}</span>
      <span style={{
        fontSize: "9px",
        color: active ? color : C.textMuted,
        fontFamily: FONT.mono,
        fontWeight: 700,
      }}>{count}</span>
    </button>
  );
}

// ─── Toolbar ────────────────────────────────────────────────────
function Toolbar({
  q,
  onQChange,
  activePlatform,
  onPlatformChange,
  location,
  onLocationChange,
  minScore,
  onMinScoreChange,
  platformBreakdown,
  onRefresh,
  refreshing,
}: {
  q: string;
  onQChange: (v: string) => void;
  activePlatform: Platform | null;
  onPlatformChange: (p: Platform | null) => void;
  location: string;
  onLocationChange: (v: string) => void;
  minScore: number;
  onMinScoreChange: (v: number) => void;
  platformBreakdown: Record<Platform, number>;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const searchInputStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
    height: "32px",
    padding: "0 12px",
    background: C.bg,
    border: `1px solid ${C.border}`,
    borderRadius: "4px",
    fontFamily: FONT.sans,
    fontSize: "12px",
    color: C.text,
    outline: "none",
  };

  const selectStyle: CSSProperties = {
    height: "32px",
    padding: "0 10px",
    background: C.bg,
    border: `1px solid ${C.border}`,
    borderRadius: "4px",
    fontFamily: FONT.mono,
    fontSize: "11px",
    color: C.textBody,
    cursor: "pointer",
    outline: "none",
  };

  return (
    <div style={widgetCardStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
          <input
            type="text"
            placeholder="Search name, handle, topic, bio…"
            value={q}
            onChange={(e) => onQChange(e.target.value)}
            style={searchInputStyle}
            aria-label="Search influencers"
          />
          <span style={{
            position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
            fontFamily: FONT.mono, fontSize: "9px", color: C.textMuted, pointerEvents: "none",
            border: `1px solid ${C.border}`, borderRadius: "3px", padding: "2px 4px",
          }}>Q</span>
        </div>
        <select
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          style={selectStyle}
          aria-label="Filter by city"
        >
          <option value="">All cities</option>
          {MOROCCAN_CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button
          onClick={onRefresh}
          type="button"
          disabled={refreshing}
          style={{
            height: "32px",
            padding: "0 12px",
            background: ACCENT,
            border: `1px solid ${ACCENT}`,
            borderRadius: "4px",
            color: "#ffffff",
            fontFamily: FONT.mono,
            fontSize: "10px",
            fontWeight: 700,
            cursor: refreshing ? "wait" : "pointer",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            opacity: refreshing ? 0.6 : 1,
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span>{refreshing ? "Scanning…" : "Rescan"}</span>
        </button>
      </div>

      {/* Platform chips + min score slider */}
      <div style={{
        display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap",
        marginTop: "12px", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          <PlatformChip
            platform="press"
            count={platformBreakdown.press}
            active={activePlatform === null}
            onClick={() => onPlatformChange(null)}
          />
          {PLATFORM_ORDER.map((p) => (
            <PlatformChip
              key={p}
              platform={p}
              count={platformBreakdown[p]}
              active={activePlatform === p}
              onClick={() => onPlatformChange(activePlatform === p ? null : p)}
            />
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "240px" }}>
          <span style={labelStyle}>Min influence</span>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={minScore}
            onChange={(e) => onMinScoreChange(parseInt(e.target.value, 10))}
            style={{ flex: 1, accentColor: ACCENT, cursor: "pointer" }}
            aria-label="Minimum influence score"
          />
          <span style={{
            fontFamily: FONT.mono, fontSize: "11px", fontWeight: 700, color: ACCENT,
            minWidth: "28px", textAlign: "right",
          }}>{minScore}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Influencer card (single row in the virtualized list) ───────
function InfluencerCard({
  row,
  active,
  onSelect,
}: {
  row: InfluencerListRow;
  active: boolean;
  onSelect: () => void;
}) {
  const platformColor = PLATFORM_COLORS[row.platform];
  return (
    <div
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      style={{
        display: "grid",
        gridTemplateColumns: "44px 1fr auto",
        gap: "12px",
        padding: "12px",
        background: active ? ACCENT_BG : C.bg,
        border: `1px solid ${active ? ACCENT : C.border}`,
        borderLeft: `3px solid ${active ? ACCENT : platformColor}`,
        borderRadius: "4px",
        cursor: "pointer",
        transition: "all 0.12s",
        alignItems: "center",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.borderColor = `${platformColor}80`;
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.borderColor = C.border;
      }}
    >
      {/* Avatar */}
      <Avatar name={row.name} size={44} />

      {/* Identity + topics */}
      <div style={{ minWidth: 0 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "6px",
          flexWrap: "wrap", marginBottom: "2px",
        }}>
          <span style={{
            fontFamily: FONT.sans, fontSize: "13px", fontWeight: 700,
            color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {row.name}
          </span>
          {row.verified && (
            <span
              aria-label="Verified"
              title="Verified account"
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: "14px", height: "14px", borderRadius: "50%",
                background: platformColor, color: "#ffffff",
                fontFamily: FONT.mono, fontSize: "9px", fontWeight: 700,
              }}
            >v</span>
          )}
          <span style={{
            fontFamily: FONT.mono, fontSize: "10px", color: C.textMuted,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {row.handle ?? "—"}
          </span>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          fontFamily: FONT.mono, fontSize: "10px", color: C.textMuted,
          flexWrap: "wrap",
        }}>
          <span style={{
            padding: "1px 6px", borderRadius: "2px",
            background: `${platformColor}12`, color: platformColor,
            textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600,
          }}>
            {PLATFORM_LABELS[row.platform]}
          </span>
          <span>{formatFollowers(row.followers)} followers</span>
          {row.location && <span>· {row.location}</span>}
          <span>· {row.mentionCount} mention{row.mentionCount !== 1 ? "s" : ""}</span>
        </div>
        {row.topics.length > 0 && (
          <div style={{
            display: "flex", gap: "4px", marginTop: "6px", flexWrap: "wrap",
          }}>
            {row.topics.slice(0, 4).map((t) => (
              <span key={t} style={{
                fontSize: "9px", fontFamily: FONT.mono, color: C.textBody,
                background: C.bgHover, padding: "1px 6px", borderRadius: "2px",
                border: `1px solid ${C.border}`,
              }}>{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* Influence score + sub-scores */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px",
        minWidth: "120px",
      }}>
        <div style={{
          fontFamily: FONT.mono, fontSize: "24px", fontWeight: 800,
          color: influenceColor(row.influenceScore), lineHeight: 1, letterSpacing: "-0.02em",
        }}>
          {row.influenceScore}
        </div>
        <div style={{
          display: "flex", gap: "6px", width: "120px",
        }}>
          <MiniBar label="R" value={row.reachScore} color={platformColor} />
          <MiniBar label="E" value={row.engagementScore} color={platformColor} />
          <MiniBar label="A" value={row.authorityScore} color={platformColor} />
        </div>
        {row.lastAnalyzed && (
          <div style={{
            fontSize: "9px", fontFamily: FONT.mono, color: C.textMuted,
            marginTop: "2px",
          }}>
            Last analyzed {new Date(row.lastAnalyzed).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Virtualized influencer list ────────────────────────────────
function VirtualizedInfluencerList({
  rows,
  selectedId,
  onSelect,
}: {
  rows: InfluencerListRow[];
  selectedId: string | null;
  onSelect: (row: InfluencerListRow) => void;
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 116,
    overscan: 8,
    getItemKey: (i) => rows[i].id,
  });

  if (rows.length === 0) return null;

  return (
    <div
      ref={parentRef}
      style={{
        maxHeight: "calc(100vh - 280px)",
        minHeight: "320px",
        overflowY: "auto",
        paddingRight: "4px",
      }}
    >
      <div style={{ height: virtualizer.getTotalSize(), position: "relative", width: "100%" }}>
        {virtualizer.getVirtualItems().map((vi) => {
          const r = rows[vi.index];
          return (
            <div
              key={r.id}
              data-index={vi.index}
              ref={virtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${vi.start}px)`,
                paddingBottom: "8px",
              }}
            >
              <InfluencerCard
                row={r}
                active={selectedId === r.id}
                onSelect={() => onSelect(r)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Virtualized mentions list (inside detail panel) ────────────
function VirtualizedMentionsList({ mentions }: { mentions: InfluencerMention[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: mentions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 6,
    getItemKey: (i) => mentions[i].id,
  });

  if (mentions.length === 0) {
    return (
      <div style={{
        padding: "16px", textAlign: "center",
        fontFamily: FONT.mono, fontSize: "11px", color: C.textMuted,
        border: `1px dashed ${C.border}`, borderRadius: "4px",
      }}>
        Awaiting mentions — no recent content tracked.
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      style={{
        maxHeight: "240px",
        overflowY: "auto",
        border: `1px solid ${C.border}`,
        borderRadius: "4px",
        background: C.bg,
      }}
    >
      <div style={{ height: virtualizer.getTotalSize(), position: "relative", width: "100%" }}>
        {virtualizer.getVirtualItems().map((vi) => {
          const m = mentions[vi.index];
          const color = sentimentColor(m.sentiment);
          return (
            <div
              key={m.id}
              data-index={vi.index}
              ref={virtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${vi.start}px)`,
                padding: "8px 12px",
                borderBottom: `1px solid ${C.border}`,
                borderLeft: `3px solid ${color}`,
                display: "flex",
                flexDirection: "column",
                gap: "2px",
                background: C.bg,
              }}
            >
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                gap: "8px",
              }}>
                <span style={{
                  fontFamily: FONT.sans, fontSize: "12px", fontWeight: 600, color: C.text,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  flex: 1, minWidth: 0,
                }}>
                  {m.title}
                </span>
                <span style={{
                  fontFamily: FONT.mono, fontSize: "9px", fontWeight: 700,
                  color, textTransform: "uppercase", letterSpacing: "0.08em",
                  padding: "1px 6px", borderRadius: "2px", background: `${color}14`,
                  flexShrink: 0,
                }}>
                  {m.sentiment}
                </span>
              </div>
              <div style={{
                display: "flex", gap: "10px",
                fontFamily: FONT.mono, fontSize: "10px", color: C.textMuted,
              }}>
                <span>{new Date(m.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                <span>Reach {formatFollowers(m.reach)}</span>
                {m.url && <span style={{ color: ACCENT }}>Open source →</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Detail panel ───────────────────────────────────────────────
function DetailPanel({ detail }: { detail: InfluencerDetail }) {
  const inf = detail.influencer;
  const platformColor = PLATFORM_COLORS[inf.platform];

  const radarData = [
    { axis: "Reach", value: detail.scoreBreakdown.reach },
    { axis: "Engagement", value: detail.scoreBreakdown.engagement },
    { axis: "Authority", value: detail.scoreBreakdown.authority },
    { axis: "Consistency", value: detail.scoreBreakdown.consistency },
    { axis: "Relevance", value: detail.scoreBreakdown.relevance },
  ];

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: "12px",
    }}>
      {/* Identity header */}
      <div style={widgetCardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Avatar name={inf.name} size={56} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap",
            }}>
              <span style={{
                fontFamily: FONT.sans, fontSize: "16px", fontWeight: 700, color: C.text,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {inf.name}
              </span>
              {inf.verified && (
                <span style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: "16px", height: "16px", borderRadius: "50%",
                  background: platformColor, color: "#ffffff",
                  fontFamily: FONT.mono, fontSize: "10px", fontWeight: 700,
                }}>v</span>
              )}
            </div>
            <div style={{
              fontFamily: FONT.mono, fontSize: "11px", color: C.textMuted, marginTop: "2px",
            }}>
              {inf.handle ?? "—"} · {PLATFORM_LABELS[inf.platform]}
            </div>
            <div style={{
              fontFamily: FONT.mono, fontSize: "10px", color: C.textMuted, marginTop: "2px",
            }}>
              {formatFollowers(inf.followers)} followers · following {formatFollowers(inf.following)}
              {inf.location && ` · ${inf.location}`}
            </div>
          </div>
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "flex-end",
          }}>
            <div style={{
              fontFamily: FONT.mono, fontSize: "36px", fontWeight: 800,
              color: influenceColor(inf.influenceScore), lineHeight: 1, letterSpacing: "-0.02em",
            }}>{inf.influenceScore}</div>
            <div style={labelStyle}>Influence</div>
          </div>
        </div>
        {inf.bio && (
          <p style={{
            fontSize: "12px", fontFamily: FONT.sans, color: C.textBody,
            lineHeight: 1.55, marginTop: "12px", marginBottom: 0,
          }}>{inf.bio}</p>
        )}
        {inf.topics.length > 0 && (
          <div style={{
            display: "flex", gap: "4px", marginTop: "10px", flexWrap: "wrap",
          }}>
            {inf.topics.map((t) => (
              <span key={t} style={{
                fontSize: "10px", fontFamily: FONT.mono, color: platformColor,
                background: `${platformColor}12`, padding: "2px 8px", borderRadius: "2px",
                border: `1px solid ${platformColor}40`, textTransform: "uppercase",
                letterSpacing: "0.06em", fontWeight: 600,
              }}>{t}</span>
            ))}
          </div>
        )}
        {inf.languages.length > 0 && (
          <div style={{
            fontFamily: FONT.mono, fontSize: "10px", color: C.textMuted, marginTop: "8px",
          }}>
            Languages: {inf.languages.join(" · ")}
          </div>
        )}
      </div>

      {/* Score breakdown radar */}
      <div style={widgetCardStyle}>
        <div style={titleLabelStyle}>Score breakdown</div>
        <div style={{ height: "240px", width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} outerRadius="70%">
              <PolarGrid stroke={C.border} />
              <PolarAngleAxis dataKey="axis" tick={{ fill: C.textBody, fontSize: 10, fontFamily: FONT.mono }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fill: C.textMuted, fontSize: 9, fontFamily: FONT.mono }} stroke={C.border} />
              <Radar dataKey="value" stroke={ACCENT} fill={ACCENT} fillOpacity={0.18} strokeWidth={2} />
              <RechartsTooltip
                contentStyle={{
                  background: C.bg, border: `1px solid ${C.border}`, borderRadius: "4px",
                  fontFamily: FONT.mono, fontSize: "11px",
                }}
                labelStyle={{ color: C.text, fontWeight: 700 }}
                formatter={(v: number) => [`${v}/100`, "Score"]}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px", marginTop: "8px",
        }}>
          {radarData.map((d) => (
            <div key={d.axis} style={{ textAlign: "center" }}>
              <div style={{
                fontFamily: FONT.mono, fontSize: "16px", fontWeight: 800,
                color: influenceColor(d.value), lineHeight: 1,
              }}>{d.value}</div>
              <div style={{
                fontFamily: FONT.mono, fontSize: "9px", color: C.textMuted,
                textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "4px",
              }}>{d.axis}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mention trend 30-day */}
      <div style={widgetCardStyle}>
        <div style={titleLabelStyle}>Mention volume (30 days)</div>
        <div style={{ height: "180px", width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={detail.mentionTrend} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="2 3" stroke={C.border} vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: C.textMuted, fontSize: 9, fontFamily: FONT.mono }}
                tickFormatter={(d: string) => d.slice(5)}
                interval={5}
                stroke={C.border}
              />
              <YAxis
                tick={{ fill: C.textMuted, fontSize: 9, fontFamily: FONT.mono }}
                allowDecimals={false}
                stroke={C.border}
                width={28}
              />
              <RechartsTooltip
                contentStyle={{
                  background: C.bg, border: `1px solid ${C.border}`, borderRadius: "4px",
                  fontFamily: FONT.mono, fontSize: "11px",
                }}
                labelStyle={{ color: C.text, fontWeight: 700 }}
                formatter={(v: number, name: string) => [v, name.charAt(0).toUpperCase() + name.slice(1)]}
              />
              <Line type="monotone" dataKey="positive" stroke={COL_POS} strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="neutral" stroke={COL_NEU} strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
              <Line type="monotone" dataKey="negative" stroke={COL_NEG} strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="count" stroke={ACCENT} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{
          display: "flex", gap: "12px", marginTop: "6px",
          fontFamily: FONT.mono, fontSize: "10px", color: C.textMuted,
        }}>
          <LegendDot color={ACCENT} label="Total" />
          <LegendDot color={COL_POS} label="Positive" />
          <LegendDot color={COL_NEU} label="Neutral" />
          <LegendDot color={COL_NEG} label="Negative" />
        </div>
      </div>

      {/* Recent mentions */}
      <div style={widgetCardStyle}>
        <div style={titleLabelStyle}>Recent mentions ({detail.mentions.length})</div>
        <VirtualizedMentionsList mentions={detail.mentions} />
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, display: "inline-block" }} />
      {label}
    </span>
  );
}

// ─── Empty state ────────────────────────────────────────────────
function EmptyState({ message }: { message: string }) {
  return (
    <div style={{
      padding: "40px 24px", textAlign: "center",
      border: `1px dashed ${C.border}`, borderRadius: "6px",
      background: C.bgSubtle,
    }}>
      <div style={{
        width: "8px", height: "8px", borderRadius: "50%",
        background: ACCENT, margin: "0 auto 12px",
        animation: "influencer-empty-pulse 1.5s ease-in-out infinite",
      }} />
      <div style={{
        fontSize: "13px", fontFamily: FONT.mono, color: C.textBody, lineHeight: 1.5,
      }}>{message}</div>
      <style>{`
        @keyframes influencer-empty-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.7); }
        }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export function InfluencerDatabase() {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [activePlatform, setActivePlatform] = useState<Platform | null>(null);
  const [location, setLocation] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const [data, setData] = useState<InfluencerListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<InfluencerDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(false);

  // Debounce the search input — 300ms.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  // ─── Fetch list ──────────────────────────────────────────────
  const fetchList = useCallback(async () => {
    setRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (debouncedQ) params.set("q", debouncedQ);
      if (activePlatform) params.set("platform", activePlatform);
      if (location) params.set("location", location);
      params.set("minScore", String(minScore));
      params.set("limit", "200");
      const res = await fetch(`/api/console/influencers-db?${params.toString()}`);
      if (!res.ok) { setError(true); return; }
      const json = (await res.json()) as InfluencerListResponse;
      setData(json);
      setError(false);
      // Auto-select the first influencer if none selected or selection not in the new list.
      if (json.influencers.length > 0) {
        const stillThere = json.influencers.some((i) => i.id === selectedId);
        if (!stillThere) setSelectedId(json.influencers[0].id);
      } else {
        setSelectedId(null);
      }
    } catch {
      setError(true);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [debouncedQ, activePlatform, location, minScore, selectedId]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // ─── Fetch detail ────────────────────────────────────────────
  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    setDetailError(false);
    (async () => {
      try {
        const res = await fetch(`/api/console/influencers-db/${encodeURIComponent(selectedId)}`);
        if (!res.ok) { if (!cancelled) setDetailError(true); return; }
        const json = (await res.json()) as InfluencerDetail;
        if (!cancelled) { setDetail(json); setDetailError(false); }
      } catch {
        if (!cancelled) setDetailError(true);
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedId]);

  const platformBreakdown: Record<Platform, number> = useMemo(() => {
    const base: Record<Platform, number> = {
      press: 0, twitter: 0, linkedin: 0, youtube: 0, tiktok: 0, instagram: 0,
    };
    if (data?.platformBreakdown) {
      for (const p of PLATFORM_ORDER) base[p] = data.platformBreakdown[p] ?? 0;
    }
    return base;
  }, [data]);

  const avgScore = useMemo(() => {
    if (!data || data.influencers.length === 0) return 0;
    const sum = data.influencers.reduce((s, i) => s + i.influenceScore, 0);
    return Math.round(sum / data.influencers.length);
  }, [data]);

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div
      className="dash-main"
      style={{
        padding: "24px",
        background: C.bg,
        overflowX: "hidden",
        minHeight: "calc(100vh - 56px)",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{
          fontSize: "11px", fontFamily: FONT.mono, color: ACCENT,
          letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px",
        }}>
          Brand Monitor · Influencer Database
        </div>
        <h3 style={{
          fontSize: "22px", fontWeight: 700, color: C.text, margin: 0,
          letterSpacing: "-0.02em",
        }}>
          Moroccan Influencer Directory
        </h3>
        <p style={{
          fontSize: "13px", color: C.textMuted, fontFamily: FONT.mono, marginTop: "4px", marginBottom: 0,
        }}>
          50 curated journalists, editors, analysts and creators across press / X / LinkedIn / YouTube / TikTok / Instagram.
        </p>
      </div>

      {/* KPI strip */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))",
        gap: "12px", marginBottom: "16px",
      }}>
        <KpiTile label="Total profiles" value={data ? String(data.total) : "—"} sub="across 6 platforms" accentColor={ACCENT} />
        <KpiTile label="Press" value={String(platformBreakdown.press)} sub="journalists & editors" accentColor={PLATFORM_COLORS.press} />
        <KpiTile label="Twitter/X" value={String(platformBreakdown.twitter)} sub="commentators" accentColor={PLATFORM_COLORS.twitter} />
        <KpiTile label="LinkedIn" value={String(platformBreakdown.linkedin)} sub="thought leaders" accentColor={PLATFORM_COLORS.linkedin} />
        <KpiTile label="YouTube" value={String(platformBreakdown.youtube)} sub="creators" accentColor={PLATFORM_COLORS.youtube} />
        <KpiTile label="Avg influence" value={String(avgScore)} unit="/100" sub="composite score" accentColor={influenceColor(avgScore)} />
      </div>

      {/* Toolbar */}
      <div style={{ marginBottom: "16px" }}>
        <Toolbar
          q={q}
          onQChange={setQ}
          activePlatform={activePlatform}
          onPlatformChange={setActivePlatform}
          location={location}
          onLocationChange={setLocation}
          minScore={minScore}
          onMinScoreChange={setMinScore}
          platformBreakdown={platformBreakdown}
          onRefresh={fetchList}
          refreshing={refreshing}
        />
      </div>

      {/* Body — list / detail split */}
      {loading ? (
        <div style={widgetCardStyle}>
          <SkeletonLoader accent={ACCENT} lines={6} height={20} />
        </div>
      ) : error ? (
        <ErrorState accent={ACCENT} message="Influencer directory unreachable — reconnecting to Neon…" />
      ) : !data || data.influencers.length === 0 ? (
        <EmptyState message="No influencers match the current filters. Loosen the minimum score or clear the search." />
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 1fr)",
          gap: "16px",
          alignItems: "start",
        }}>
          {/* List column */}
          <div>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: "8px",
            }}>
              <div style={labelStyle}>Showing {data.influencers.length} of {data.total}</div>
              <div style={{ ...labelStyle, color: C.textMuted }}>
                Sorted by influence score
              </div>
            </div>
            <VirtualizedInfluencerList
              rows={data.influencers}
              selectedId={selectedId}
              onSelect={(r) => setSelectedId(r.id)}
            />
          </div>

          {/* Detail column */}
          <div style={{ position: "sticky", top: "70px" }}>
            {detailLoading ? (
              <div style={widgetCardStyle}>
                <SkeletonLoader accent={ACCENT} lines={6} height={20} />
              </div>
            ) : detailError ? (
              <ErrorState accent={ACCENT} message="Couldn't load influencer detail. Try selecting another profile." />
            ) : detail ? (
              <DetailPanel detail={detail} />
            ) : (
              <EmptyState message="Select an influencer to view their score breakdown and mention history." />
            )}
          </div>
        </div>
      )}

      {/* Responsive: stack on narrow screens */}
      <style>{`
        @media (max-width: 900px) {
          .dash-main > div[style*="grid-template-columns: minmax(0, 1.3fr)"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
