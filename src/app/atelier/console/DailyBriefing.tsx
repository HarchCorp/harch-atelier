"use client";

// ═══════════════════════════════════════════════════════════════
//  DailyBriefing — Morning LLM briefing modal for the HarchIQ Console
//
//  Rendered as a top-of-page modal by ConsoleShell. Triggered by:
//    • Top-bar sun-icon button
//    • Cmd+Shift+B / Ctrl+Shift+B keyboard shortcut
//    • "Daily Briefing" command in the Cmd+K palette
//    • Auto-show on first console open of the day (localStorage
//      `harchiq.briefing.lastViewed` is checked against today's
//      Casablanca date key — handled by ConsoleShell)
//
//  Data flow:
//    • Loads cached briefing via GET /api/console/briefing?date=YYYY-MM-DD
//    • Falls back to on-demand generation (POST /api/console/briefing)
//      when no cache exists for today
//    • "Regenerate" button forces a fresh LLM call
//
//  Design tokens: C tokens from atelier/components/tokens.ts.
//    • Card: white bg, 1px solid #e5e5e5, 8px radius, 24px padding
//    • Section titles: 10px mono uppercase, 0.1em letter-spacing, #737373
//    • Executive summary: 16px/1.6, borderLeft 3px accent
//    • Threats: borderLeft 3px #ef4444
//    • Opportunities: borderLeft 3px #059669
//    • Actions: numbered, 14px, 8px 0 padding
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { C as TOKENS } from "../components/tokens";

// Local C alias — keeps inline styles terse and consistent with
// the rest of the Console (ConsoleShell uses the same pattern).
const C = {
  ...TOKENS,
  bg: TOKENS.bg,
  surface: TOKENS.bg,
  surfaceAlt: TOKENS.bgSubtle,
  border: TOKENS.border,
  borderLight: TOKENS.border,
  text: TOKENS.text,
  textPrimary: TOKENS.text,
  textSecondary: TOKENS.textBody,
  textMuted: TOKENS.textMuted,
  textFaint: "rgba(0,0,0,0.40)",
  accent: "#78716c", // stone-500 (atelier neutral accent)
  red: TOKENS.danger, // #ef4444 — threats
  redBg: TOKENS.dangerBg,
  green: "#059669", // opportunities
  greenBg: "#ecfdf5",
  warning: TOKENS.warning,
};

const FONT = {
  sans: C.fontSans,
  mono: C.fontMono,
};

// ─── Types (mirror BriefingPayload from src/lib/harchiq/briefing.ts) ─

interface BriefingCitedItem {
  title: string;
  alertId: string;
  alertIndex: number;
  reason: string;
  source: string;
  url: string | null;
  severity: string;
  confidence?: number;
  timelineContext?: string;
  benchmark?: string;
}

interface BriefingSourceRef {
  id: string;
  title: string;
  source: string;
  url: string | null;
  severity: string;
  publishedAt: string | null;
}

interface BriefingRecommendedAction {
  text: string;
  owner?: string;
  slaHours?: number;
  alertId?: string | null;
}

interface BriefingPayload {
  executiveSummary: string;
  topThreats: BriefingCitedItem[];
  topOpportunities: BriefingCitedItem[];
  sentimentShift: string;
  competitiveBenchmark?: string;
  timelineContext?: string;
  recommendedActions: BriefingRecommendedAction[];
  citedAlertIds: string[];
  sources: BriefingSourceRef[];
  confidence?: number;
  metadata?: {
    alertCount?: number;
    citedCount?: number;
    model?: string;
    generatedAt?: string;
    windowStart?: string;
    windowEnd?: string;
    companyName?: string;
    dateKey?: string;
  };
}

interface BriefingApiResponse {
  briefing?: BriefingPayload;
  cached?: boolean;
  date?: string;
  error?: string;
  detail?: string;
}

// ─── Casablanca date key (mirrors server-side briefingDateKey) ──────

function briefingDateKey(d: Date = new Date()): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Casablanca",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(d);
}

function dateKeyOffset(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return briefingDateKey(d);
}

function formatDateLabel(dateKey: string): string {
  const today = briefingDateKey();
  const yesterday = dateKeyOffset(1);
  const dayBefore = dateKeyOffset(2);
  if (dateKey === today) return "Today";
  if (dateKey === yesterday) return "Yesterday";
  if (dateKey === dayBefore) return "Day before";
  // Generic YYYY-MM-DD → "Jul 31, 2026"
  try {
    const d = new Date(`${dateKey}T12:00:00Z`);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  } catch {
    return dateKey;
  }
}

// ─── Icons ──────────────────────────────────────────────────────

function SunIcon({ size = 18, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function CloseIcon({ size = 18, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ArrowUpIcon({ size = 12, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

function ArrowDownIcon({ size = 12, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </svg>
  );
}

function RefreshIcon({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function MailIcon({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function ExternalLinkIcon({ size = 11, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

// ─── Section title ──────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: "10px",
        fontFamily: FONT.mono,
        color: C.textMuted,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        marginBottom: "10px",
      }}
    >
      {children}
    </div>
  );
}

// ─── Cited item card (threat or opportunity) ────────────────────

function CitedItemCard({
  item,
  borderColor,
  accentLabel,
}: {
  item: BriefingCitedItem;
  borderColor: string;
  accentLabel: string;
}) {
  const titleNode = item.url ? (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        fontSize: "14px",
        fontWeight: 600,
        color: C.textPrimary,
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.textDecoration = "underline"; }}
      onMouseLeave={(e) => { e.currentTarget.style.textDecoration = "none"; }}
    >
      {item.title}
      <ExternalLinkIcon size={10} color={C.textMuted} />
    </a>
  ) : (
    <span style={{ fontSize: "14px", fontWeight: 600, color: C.textPrimary }}>
      {item.title}
    </span>
  );

  return (
    <div
      style={{
        padding: "12px 16px",
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderLeft: `3px solid ${borderColor}`,
        borderRadius: "6px",
        marginBottom: "8px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "6px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "200px" }}>
          {titleNode}
        </div>
        <div style={{ display: "flex", gap: "6px", alignItems: "center", flexShrink: 0 }}>
          <span
            style={{
              fontSize: "9px",
              fontFamily: FONT.mono,
              padding: "2px 6px",
              borderRadius: "2px",
              background: `${borderColor}15`,
              color: borderColor,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {accentLabel}
          </span>
          <span
            style={{
              fontSize: "9px",
              fontFamily: FONT.mono,
              padding: "2px 6px",
              borderRadius: "2px",
              background: C.surfaceAlt,
              color: C.textMuted,
              letterSpacing: "0.06em",
            }}
            title={`Alert #${item.alertIndex} · ${item.alertId}`}
          >
            #{item.alertIndex}
          </span>
        </div>
      </div>
      <div style={{ fontSize: "12px", color: C.textSecondary, lineHeight: 1.5, marginBottom: "6px" }}>
        {item.reason}
      </div>
      <div style={{ fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.04em" }}>
        {item.source} · {item.severity.toUpperCase()}
      </div>
    </div>
  );
}

// ─── Source chip ────────────────────────────────────────────────

function SourceChip({ src }: { src: BriefingSourceRef }) {
  const sevColor = src.severity === "critical" ? C.red : src.severity === "high" ? C.warning : C.green;
  return (
    <a
      href={src.url || "#"}
      target={src.url ? "_blank" : undefined}
      rel={src.url ? "noopener noreferrer" : undefined}
      title={`${src.title} — ${src.source} — ${src.id}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "5px 10px",
        background: C.surfaceAlt,
        border: `1px solid ${C.border}`,
        borderRadius: "12px",
        fontSize: "11px",
        fontFamily: FONT.mono,
        color: C.textSecondary,
        textDecoration: "none",
        cursor: src.url ? "pointer" : "default",
        maxWidth: "100%",
        transition: "border-color 0.15s, color 0.15s",
      }}
      onMouseEnter={(e) => { if (src.url) { e.currentTarget.style.borderColor = sevColor; e.currentTarget.style.color = C.textPrimary; } }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSecondary; }}
    >
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: sevColor, flexShrink: 0 }} />
      <span style={{
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        maxWidth: "240px",
      }}>
        {src.title}
      </span>
      <span style={{ color: C.textMuted, flexShrink: 0 }}>#{src.id.slice(-4)}</span>
    </a>
  );
}

// ─── Loading dots (HarchIQ is analyzing your data...) ───────────

function LoadingDots() {
  return (
    <div style={{ display: "inline-flex", gap: "4px", marginLeft: "2px" }} aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: "5px",
            height: "5px",
            borderRadius: "50%",
            background: C.accent,
            animation: `briefing-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes briefing-dot {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
}

// ─── Date selector (today / yesterday / day before) ─────────────

function DateSelector({
  selected,
  onSelect,
  available,
}: {
  selected: string;
  onSelect: (key: string) => void;
  available: { key: string; label: string }[];
}) {
  return (
    <div
      role="tablist"
      aria-label="Briefing date"
      style={{
        display: "inline-flex",
        border: `1px solid ${C.border}`,
        borderRadius: "6px",
        overflow: "hidden",
        background: C.surfaceAlt,
      }}
    >
      {available.map((opt) => {
        const isActive = opt.key === selected;
        return (
          <button
            key={opt.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(opt.key)}
            style={{
              padding: "6px 12px",
              fontSize: "11px",
              fontFamily: FONT.mono,
              letterSpacing: "0.05em",
              fontWeight: isActive ? 700 : 500,
              color: isActive ? C.textPrimary : C.textMuted,
              background: isActive ? C.surface : "transparent",
              border: "none",
              borderRight: opt.key !== available[available.length - 1].key ? `1px solid ${C.border}` : "none",
              cursor: "pointer",
              transition: "background 0.15s, color 0.15s",
              textTransform: "uppercase",
            }}
            onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = C.textSecondary; }}
            onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = C.textMuted; }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────

export interface DailyBriefingProps {
  open: boolean;
  onClose: () => void;
  accent?: string; // offer-theme accent color (default stone-500)
  userEmail?: string | null;
  userName?: string | null;
  /** Auto-generate on open if no cache exists for the selected date. */
  autoGenerate?: boolean;
}

export function DailyBriefing({
  open,
  onClose,
  accent = "#78716c",
  userEmail,
  userName,
  autoGenerate = true,
}: DailyBriefingProps) {
  const todayKey = useMemo(() => briefingDateKey(), []);
  const yesterdayKey = useMemo(() => dateKeyOffset(1), []);
  const dayBeforeKey = useMemo(() => dateKeyOffset(2), []);

  const availableDates = useMemo(
    () => [
      { key: todayKey, label: "Today" },
      { key: yesterdayKey, label: "Yesterday" },
      { key: dayBeforeKey, label: "Day before" },
    ],
    [todayKey, yesterdayKey, dayBeforeKey],
  );

  const [selectedDate, setSelectedDate] = useState<string>(todayKey);
  const [briefing, setBriefing] = useState<BriefingPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  // Fetch briefing (cached first, then on-demand generate for today).
  const fetchBriefing = useCallback(
    async (date: string, opts: { forceRegenerate?: boolean } = {}) => {
      setLoading(true);
      setError(null);
      setRegenerating(!!opts.forceRegenerate);
      try {
        const url = new URL("/api/console/briefing", window.location.origin);
        url.searchParams.set("date", date);
        if (opts.forceRegenerate) url.searchParams.set("regenerate", "1");
        const res = await fetch(url.toString(), { method: "GET" });
        const data: BriefingApiResponse = await res.json();
        if (!res.ok || !data.briefing) {
          const msg = data.error || `Failed (HTTP ${res.status})`;
          setError(msg);
          setBriefing(null);
        } else {
          setBriefing(data.briefing);
          setCached(!!data.cached);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error");
        setBriefing(null);
      } finally {
        setLoading(false);
        setRegenerating(false);
      }
    },
    [],
  );

  // Auto-load when opened or when the selected date changes.
  useEffect(() => {
    if (!open) return;
    // First try cache for the date; if it's today and there's no cache,
    // auto-generate (unless the user explicitly chose to view a past date
    // and there's nothing cached → just show the empty state).
    fetchBriefing(selectedDate);
  }, [open, selectedDate, fetchBriefing, autoGenerate]);

  // Esc to close (kept here for self-containedness; ConsoleShell also
  // wires Cmd+Shift+B as a toggle).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, onClose]);

  // Build a mailto link for "Email me this briefing" — assembles a
  // plain-text version of the briefing body.
  const mailtoHref = useMemo(() => {
    if (!briefing) return "#";
    const subject = `HarchIQ Daily Briefing — ${briefing.metadata?.dateKey ?? selectedDate}`;
    const lines: string[] = [];
    lines.push(`HARCHIQ DAILY INTELLIGENCE BRIEFING`);
    lines.push(`Date: ${briefing.metadata?.dateKey ?? selectedDate}`);
    lines.push(`Company: ${briefing.metadata?.companyName ?? "—"}`);
    lines.push(`Generated: ${briefing.metadata?.generatedAt ?? new Date().toISOString()}`);
    lines.push("");
    lines.push("EXECUTIVE SUMMARY");
    lines.push(briefing.executiveSummary);
    lines.push("");
    lines.push("TOP THREATS");
    briefing.topThreats.forEach((t, i) => {
      lines.push(`${i + 1}. ${t.title} [alert #${t.alertIndex}]`);
      lines.push(`   ${t.reason}`);
      lines.push(`   Source: ${t.source} · ${t.url ?? "(no link)"}`);
    });
    lines.push("");
    lines.push("TOP OPPORTUNITIES");
    briefing.topOpportunities.forEach((o, i) => {
      lines.push(`${i + 1}. ${o.title} [alert #${o.alertIndex}]`);
      lines.push(`   ${o.reason}`);
      lines.push(`   Source: ${o.source} · ${o.url ?? "(no link)"}`);
    });
    lines.push("");
    lines.push("SENTIMENT SHIFT");
    lines.push(briefing.sentimentShift);
    lines.push("");
    if (briefing.timelineContext) {
      lines.push("TIMELINE CONTEXT");
      lines.push(briefing.timelineContext);
      lines.push("");
    }
    if (briefing.competitiveBenchmark) {
      lines.push("COMPETITIVE BENCHMARK");
      lines.push(briefing.competitiveBenchmark);
      lines.push("");
    }
    lines.push("RECOMMENDED ACTIONS");
    briefing.recommendedActions.forEach((a, i) => {
      const owner = a.owner ? ` [${a.owner}]` : "";
      const sla = a.slaHours ? ` (SLA ${a.slaHours}h)` : "";
      lines.push(`${i + 1}. ${a.text}${owner}${sla}`);
    });
    lines.push("");
    lines.push("CITED SOURCES");
    briefing.sources.forEach((s) => {
      lines.push(`- ${s.title} — ${s.source} [${s.id}] ${s.url ?? ""}`);
    });
    const body = lines.join("\n");
    return `mailto:${encodeURIComponent(userEmail ?? "")}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [briefing, selectedDate, userEmail]);

  // Detect sentiment direction from the executiveSummary/sentimentShift text.
  // Computed BEFORE the `if (!open) return null` guard so the hook
  // runs on every render (rules-of-hooks: hooks must be called
  // unconditionally and in the same order).
  const sentimentDir: "up" | "down" | "flat" = useMemo(() => {
    if (!briefing) return "flat";
    const text = `${briefing.sentimentShift} ${briefing.executiveSummary}`.toLowerCase();
    const upHits = (text.match(/up|improv|strengthen|positive.*gain|recover|rally/g) ?? []).length;
    const downHits = (text.match(/down|decline|worsen|deterior|negativ.*spike|fall|drop|slip/g) ?? []).length;
    if (upHits > downHits) return "up";
    if (downHits > upHits) return "down";
    return "flat";
  }, [briefing]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="briefing-title"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
        zIndex: 200, // above shell (zIndex 40-70) + command palette (100). Below Cmd+K palette (300) so the palette can be invoked over the modal.
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "5vh 16px 16px",
        overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.bg,
          border: `1px solid ${C.border}`,
          borderRadius: "8px",
          padding: "24px",
          width: "100%",
          maxWidth: "760px",
          boxShadow: "0 16px 48px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)",
          fontFamily: FONT.sans,
          position: "relative",
          zIndex: 201, // above the overlay (200) so the white panel sits on top of the dimmed backdrop
        }}
      >
        {/* ─── Header ─── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: "240px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: accent,
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <SunIcon size={20} color="#ffffff" />
            </div>
            <div>
              <div
                id="briefing-title"
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: C.textPrimary,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                }}
              >
                Daily Intelligence Briefing
              </div>
              <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, marginTop: "4px", letterSpacing: "0.06em" }}>
                {briefing?.metadata?.companyName ?? "HarchIQ"}
                {cached ? " · CACHED" : briefing ? " · FRESH" : ""}
                {briefing?.metadata?.generatedAt
                  ? ` · ${new Date(briefing.metadata.generatedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}`
                  : ""}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close briefing"
            title="Close (Esc)"
            style={{
              background: "transparent",
              border: `1px solid ${C.border}`,
              borderRadius: "4px",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: C.textSecondary,
              flexShrink: 0,
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.red; e.currentTarget.style.color = C.red; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSecondary; }}
          >
            <CloseIcon size={16} />
          </button>
        </div>

        {/* ─── Date selector + actions ─── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
          <DateSelector
            selected={selectedDate}
            onSelect={setSelectedDate}
            available={availableDates}
          />
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            {briefing && (
              <a
                href={mailtoHref}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  background: "transparent",
                  border: `1px solid ${C.border}`,
                  borderRadius: "4px",
                  fontSize: "11px",
                  fontFamily: FONT.mono,
                  letterSpacing: "0.04em",
                  color: C.textSecondary,
                  textDecoration: "none",
                  cursor: "pointer",
                  textTransform: "uppercase",
                  transition: "border-color 0.15s, color 0.15s",
                }}
                title="Open email client with the briefing pre-filled"
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSecondary; }}
              >
                <MailIcon size={13} />
                Email me this
              </a>
            )}
            <button
              onClick={() => fetchBriefing(selectedDate, { forceRegenerate: true })}
              disabled={loading || regenerating}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                background: accent,
                color: "#ffffff",
                border: "none",
                borderRadius: "4px",
                fontSize: "11px",
                fontFamily: FONT.mono,
                fontWeight: 700,
                letterSpacing: "0.04em",
                cursor: loading || regenerating ? "not-allowed" : "pointer",
                opacity: loading || regenerating ? 0.6 : 1,
                textTransform: "uppercase",
                transition: "opacity 0.15s",
              }}
              title="Force a fresh LLM call (ignores cache)"
            >
              <RefreshIcon size={13} color="#ffffff" />
              {regenerating ? "Regenerating…" : "Regenerate"}
            </button>
          </div>
        </div>

        {/* ─── Body ─── */}
        {loading && !briefing ? (
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
              border: `1px dashed ${accent}40`,
              borderRadius: "8px",
              background: "rgba(120,113,108,0.04)",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                margin: "0 auto 16px",
                borderRadius: "50%",
                border: `2px solid ${accent}30`,
                borderTopColor: accent,
                animation: "briefing-spin 0.8s linear infinite",
              }}
            />
            <div style={{ fontSize: "14px", color: C.textPrimary, fontWeight: 600, marginBottom: "4px" }}>
              HarchIQ is analyzing your data<LoadingDots />
            </div>
            <div style={{ fontSize: "12px", fontFamily: FONT.mono, color: C.textMuted }}>
              {regenerating
                ? "Re-running LLM with the latest 24h of alerts…"
                : "Reading last 24h of alerts, AI visibility, and sentiment baseline…"}
            </div>
            <style>{`@keyframes briefing-spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : error ? (
          <div
            style={{
              padding: "32px 24px",
              textAlign: "center",
              border: `1px dashed ${C.red}50`,
              borderRadius: "8px",
              background: C.redBg,
            }}
          >
            <div style={{ fontSize: "14px", color: C.red, fontWeight: 600, marginBottom: "8px" }}>
              Couldn't generate briefing. Try again.
            </div>
            <div style={{ fontSize: "12px", fontFamily: FONT.mono, color: C.textMuted, marginBottom: "16px", wordBreak: "break-word" }}>
              {error}
            </div>
            <button
              onClick={() => fetchBriefing(selectedDate, { forceRegenerate: true })}
              style={{
                padding: "8px 16px",
                background: "transparent",
                color: C.textPrimary,
                border: `1px solid ${C.border}`,
                borderRadius: "4px",
                fontSize: "12px",
                fontFamily: FONT.sans,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        ) : briefing ? (
          <>
            {/* ─── Executive Summary ─── */}
            <section style={{ marginBottom: "24px" }}>
              <SectionTitle>Executive Summary</SectionTitle>
              <p
                style={{
                  fontSize: "16px",
                  lineHeight: 1.6,
                  color: C.textPrimary,
                  borderLeft: `3px solid ${accent}`,
                  paddingLeft: "16px",
                  margin: 0,
                }}
              >
                {briefing.executiveSummary}
              </p>
            </section>

            {/* ─── Sentiment Shift ─── */}
            <section style={{ marginBottom: "24px" }}>
              <SectionTitle>Sentiment Shift (vs previous day)</SectionTitle>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "12px 16px",
                  background: C.surfaceAlt,
                  border: `1px solid ${C.border}`,
                  borderRadius: "6px",
                }}
              >
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background:
                      sentimentDir === "up" ? C.green + "20"
                      : sentimentDir === "down" ? C.red + "20"
                      : C.accent + "20",
                    color:
                      sentimentDir === "up" ? C.green
                      : sentimentDir === "down" ? C.red
                      : C.accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "1px",
                  }}
                >
                  {sentimentDir === "up" ? <ArrowUpIcon size={12} /> : sentimentDir === "down" ? <ArrowDownIcon size={12} /> : <span style={{ fontSize: "12px", fontWeight: 700 }}>—</span>}
                </div>
                <div style={{ fontSize: "13px", lineHeight: 1.55, color: C.textPrimary }}>
                  {briefing.sentimentShift}
                </div>
              </div>
            </section>

            {/* ─── Threats + Opportunities (two-column on desktop) ─── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
                gap: "20px",
                marginBottom: "24px",
              }}
            >
              <section>
                <SectionTitle>Top Threats</SectionTitle>
                {briefing.topThreats.length === 0 ? (
                  <div style={{ fontSize: "12px", color: C.textMuted, fontFamily: FONT.mono, padding: "12px 16px", border: `1px solid ${C.border}`, borderRadius: "6px", background: C.surfaceAlt }}>
                    No threats detected in the last 24h.
                  </div>
                ) : (
                  briefing.topThreats.map((t, i) => (
                    <CitedItemCard key={`threat-${t.alertId}-${i}`} item={t} borderColor={C.red} accentLabel="THREAT" />
                  ))
                )}
              </section>

              <section>
                <SectionTitle>Top Opportunities</SectionTitle>
                {briefing.topOpportunities.length === 0 ? (
                  <div style={{ fontSize: "12px", color: C.textMuted, fontFamily: FONT.mono, padding: "12px 16px", border: `1px solid ${C.border}`, borderRadius: "6px", background: C.surfaceAlt }}>
                    No opportunities surfaced in the last 24h.
                  </div>
                ) : (
                  briefing.topOpportunities.map((o, i) => (
                    <CitedItemCard key={`opp-${o.alertId}-${i}`} item={o} borderColor={C.green} accentLabel="OPPORTUNITY" />
                  ))
                )}
              </section>
            </div>

            {/* ─── Timeline context + Competitive benchmark ─── */}
            {(briefing.timelineContext || briefing.competitiveBenchmark) && (
              <section style={{ marginBottom: "24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: "12px" }}>
                {briefing.timelineContext && (
                  <div style={{ padding: "12px 16px", border: `1px solid ${C.border}`, borderRadius: "6px", background: C.surfaceAlt }}>
                    <div style={{ fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>
                      Timeline context
                    </div>
                    <div style={{ fontSize: "13px", color: C.textPrimary, lineHeight: 1.5 }}>
                      {briefing.timelineContext}
                    </div>
                  </div>
                )}
                {briefing.competitiveBenchmark && (
                  <div style={{ padding: "12px 16px", border: `1px solid ${C.border}`, borderRadius: "6px", background: C.surfaceAlt }}>
                    <div style={{ fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>
                      Competitive benchmark
                    </div>
                    <div style={{ fontSize: "13px", color: C.textPrimary, lineHeight: 1.5 }}>
                      {briefing.competitiveBenchmark}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* ─── Recommended Actions ─── */}
            <section style={{ marginBottom: "24px" }}>
              <SectionTitle>Recommended Actions</SectionTitle>
              <ol
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  counterReset: "briefing-action",
                }}
              >
                {briefing.recommendedActions.map((action, i) => (
                  <li
                    key={i}
                    style={{
                      counterIncrement: "briefing-action",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      padding: "10px 0",
                      fontSize: "14px",
                      lineHeight: 1.55,
                      color: C.textPrimary,
                      borderBottom: i < briefing.recommendedActions.length - 1 ? `1px solid ${C.borderLight}` : "none",
                    }}
                  >
                    <span
                      style={{
                        flexShrink: 0,
                        width: "22px",
                        height: "22px",
                        borderRadius: "4px",
                        background: accent,
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        fontFamily: FONT.mono,
                        fontWeight: 700,
                        marginTop: "1px",
                      }}
                    >
                      {i + 1}
                    </span>
                    <span style={{ flex: 1 }}>
                      <span style={{ display: "block" }}>{action.text}</span>
                      {(action.owner || action.slaHours) && (
                        <span style={{ display: "block", marginTop: "4px", fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                          {action.owner ? `Owner: ${action.owner}` : ""}
                          {action.owner && action.slaHours ? " · " : ""}
                          {action.slaHours ? `SLA: ${action.slaHours}h` : ""}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            {/* ─── Cited Sources ─── */}
            <section>
              <SectionTitle>
                Cited Sources ({briefing.sources.length})
              </SectionTitle>
              {briefing.sources.length === 0 ? (
                <div style={{ fontSize: "12px", color: C.textMuted, fontFamily: FONT.mono, padding: "12px 16px", border: `1px solid ${C.border}`, borderRadius: "6px", background: C.surfaceAlt }}>
                  No alerts were cited in this briefing.
                </div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {briefing.sources.map((src) => (
                    <SourceChip key={src.id} src={src} />
                  ))}
                </div>
              )}
            </section>

            {/* ─── Footer (metadata + privacy note) ─── */}
            <div
              style={{
                marginTop: "24px",
                paddingTop: "16px",
                borderTop: `1px solid ${C.border}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <div style={{ fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.06em" }}>
                {briefing.metadata?.alertCount ?? 0} alerts scanned · {briefing.metadata?.citedCount ?? 0} cited · model: {briefing.metadata?.model ?? "—"}
              </div>
              <div style={{ fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.06em" }}>
                All citations reference real Article / RiskAssessment ids — no hallucinated sources.
              </div>
            </div>
          </>
        ) : (
          // No briefing, no error, not loading — initial empty state.
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
              border: `1px dashed ${C.border}`,
              borderRadius: "8px",
              background: C.surfaceAlt,
            }}
          >
            <div style={{ fontSize: "14px", color: C.textPrimary, fontWeight: 600, marginBottom: "8px" }}>
              No cached briefing for {formatDateLabel(selectedDate)}.
            </div>
            <div style={{ fontSize: "12px", fontFamily: FONT.mono, color: C.textMuted, marginBottom: "16px" }}>
              {selectedDate < todayKey
                ? "Past-day briefings can't be regenerated — the data window has closed."
                : "Click Generate to run the LLM now."}
            </div>
            {selectedDate >= todayKey && (
              <button
                onClick={() => fetchBriefing(selectedDate, { forceRegenerate: true })}
                style={{
                  padding: "8px 16px",
                  background: accent,
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontFamily: FONT.sans,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Generate briefing
              </button>
            )}
          </div>
        )}

        {/* Greeting line — only when briefing loaded, mirrors the offer welcome */}
        {briefing && userName && (
          <div
            style={{
              position: "absolute",
              top: "24px",
              right: "72px",
              fontSize: "10px",
              fontFamily: FONT.mono,
              color: C.textMuted,
              letterSpacing: "0.06em",
              maxWidth: "180px",
              textAlign: "right",
              display: "none", // hidden on narrow — keep the header clean
            }}
            className="briefing-greeting"
          >
            Good morning, {userName.split(" ")[0]}.
          </div>
        )}
      </div>
    </div>
  );
}
