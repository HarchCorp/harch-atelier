"use client";

// ═══════════════════════════════════════════════════════════════
//  HarchIQ InsightPanel — pre-generated, persona-driven insight feed
//
//  This is NOT a chat. It is a vertical feed of pre-generated
//  insights produced by the HarchIQ Insight Engine (server-side,
//  LLM-grounded, 15-min cached). The user clicks "Generate Fresh
//  Insights" to bypass the cache; otherwise the panel loads the
//  cached insights on mount.
//
//  Per-account-type accent + tone:
//    • brand-monitor     → emerald, calm ("Your reputation is...")
//    • market-competitor → amber,  aggressive ("Your rival is vulnerable...")
//    • investment-bank   → navy,   cold ("Risk assessment indicates...")
//    • harch-alpha       → cyan,   fast ("Signal detected...")
//
//  Card spec (from the task brief):
//    border-left: 3px solid severityColor, padding: 16px,
//    borderRadius: 4px, marginBottom: 12px
//    Title:    14px / 700 / C.text
//    Body:     13px / C.textBody / lineHeight 1.5 / marginTop 8
//    Action:   12px / 600 / ACCENT / marginTop 8 / padding 8px 12px /
//              background accentBg / borderRadius 4px
//    Confidence: 10px / mono / C.textMuted / marginTop 4
//
//  Task: signal-aiq-engine
// ═══════════════════════════════════════════════════════════════

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { C } from "../../components/tokens";

// ─── Types (mirror the server-side Insight type) ───────────────

type InsightSeverity = "info" | "watch" | "warn" | "critical";

type InsightType =
  | "reputation_snapshot"
  | "emerging_narrative"
  | "ai_visibility_drift"
  | "rival_vulnerability"
  | "share_of_voice_shift"
  | "competitor_narrative"
  | "risk_concentration"
  | "regulatory_scrutiny"
  | "adverse_media_pattern"
  | "sentiment_price_divergence"
  | "momentum_signal"
  | "correlation_breakdown"
  | "opportunity"
  | "anomaly";

interface InsightSourceRef {
  id: string;
  title: string;
  kind:
    | "article"
    | "risk_assessment"
    | "ai_visibility"
    | "neighbor"
    | "asset_price"
    | "asset_sentiment"
    | "dossier"
    | "topic";
  url?: string | null;
  severity?: string | null;
}

interface Insight {
  id: string;
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  body: string;
  action: string;
  confidence: number;
  sources: InsightSourceRef[];
  persona: string;
  generatedAt: string;
}

interface InsightResult {
  insights: Insight[];
  cached: boolean;
  accountType: string;
  generatedAt: string;
  dataPoints: number;
  model: string;
}

// ─── Persona accent config ─────────────────────────────────────

export type InsightAccountType =
  | "brand-monitor"
  | "market-competitor"
  | "investment-bank"
  | "harch-alpha";

interface PersonaAccent {
  accent: string;
  accentBg: string;
  eyebrow: string;
  heading: string;
  emptyHint: string;
}

const PERSONA_ACCENTS: Record<InsightAccountType, PersonaAccent> = {
  "brand-monitor": {
    accent: "#10b981", // emerald-500
    accentBg: "rgba(16,185,129,0.08)",
    eyebrow: "HARCHIQ INSIGHT ENGINE · BRAND MONITOR",
    heading: "Reputation intelligence — Dircom briefing",
    emptyHint: "Your reputation snapshot will appear here.",
  },
  "market-competitor": {
    accent: "#f59e0b", // amber-500
    accentBg: "rgba(245,158,11,0.08)",
    eyebrow: "HARCHIQ INSIGHT ENGINE · COMPETITOR INTEL",
    heading: "Rival vulnerability map — CMO briefing",
    emptyHint: "Your competitor attack-surface map will appear here.",
  },
  "investment-bank": {
    accent: "#1e3a8a", // navy (Tailwind blue-900 — used as institutional navy, not a primary brand blue)
    accentBg: "rgba(30,58,138,0.06)",
    eyebrow: "HARCHIQ INSIGHT ENGINE · INVESTOR DESK",
    heading: "Forensic risk assessment — CRO briefing",
    emptyHint: "Your portfolio risk concentration will appear here.",
  },
  "harch-alpha": {
    accent: "#06b6d4", // cyan-500
    accentBg: "rgba(6,182,212,0.08)",
    eyebrow: "HARCHIQ INSIGHT ENGINE · ALPHA DESK",
    heading: "Quant signal feed — Trader briefing",
    emptyHint: "Sentiment-price divergences will appear here.",
  },
};

// ─── Severity → color mapping ──────────────────────────────────

function severityColor(sev: InsightSeverity, accent: string): string {
  switch (sev) {
    case "critical":
      return "#ef4444"; // red-500
    case "warn":
      return "#f59e0b"; // amber-500
    case "watch":
      return accent; // persona accent
    case "info":
    default:
      return "#737373"; // neutral-500
  }
}

function severityLabel(sev: InsightSeverity): string {
  switch (sev) {
    case "critical":
      return "CRITICAL";
    case "warn":
      return "WARN";
    case "watch":
      return "WATCH";
    case "info":
    default:
      return "INFO";
  }
}

function typeLabel(t: InsightType): string {
  const map: Record<InsightType, string> = {
    reputation_snapshot: "REPUTATION SNAPSHOT",
    emerging_narrative: "EMERGING NARRATIVE",
    ai_visibility_drift: "AI VISIBILITY DRIFT",
    rival_vulnerability: "RIVAL VULNERABILITY",
    share_of_voice_shift: "SHARE OF VOICE SHIFT",
    competitor_narrative: "COMPETITOR NARRATIVE",
    risk_concentration: "RISK CONCENTRATION",
    regulatory_scrutiny: "REGULATORY SCRUTINY",
    adverse_media_pattern: "ADVERSE MEDIA PATTERN",
    sentiment_price_divergence: "SENTIMENT-PRICE DIVERGENCE",
    momentum_signal: "MOMENTUM SIGNAL",
    correlation_breakdown: "CORRELATION BREAKDOWN",
    opportunity: "OPPORTUNITY",
    anomaly: "ANOMALY",
  };
  return map[t] ?? "INSIGHT";
}

function kindLabel(k: InsightSourceRef["kind"]): string {
  const map: Record<InsightSourceRef["kind"], string> = {
    article: "ARTICLE",
    risk_assessment: "RISK",
    ai_visibility: "AI ENGINE",
    neighbor: "COMPANY",
    asset_price: "ASSET",
    asset_sentiment: "SENTIMENT",
    dossier: "DOSSIER",
    topic: "TOPIC",
  };
  return map[k] ?? "SOURCE";
}

// ─── "Mark as read" state — persisted in localStorage per persona ──

const READ_STORAGE_KEY = "harchiq:insights:read";

function loadReadIds(persona: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(READ_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as Record<string, string[]>;
    const ids = parsed[persona] ?? [];
    return new Set(ids);
  } catch {
    return new Set();
  }
}

function saveReadIds(persona: string, ids: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(READ_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
    parsed[persona] = Array.from(ids);
    window.localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    // localStorage might be unavailable (private mode) — swallow.
  }
}

// ─── Component ─────────────────────────────────────────────────

export interface InsightPanelProps {
  accountType: InsightAccountType;
  /** Optional className for the outer wrapper (rarely needed). */
  className?: string;
}

export function InsightPanel({ accountType, className }: InsightPanelProps) {
  const persona = PERSONA_ACCENTS[accountType];
  const [data, setData] = useState<InsightResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  // Task: dataminr-briefings-compliance — alert id whose detail modal is open.
  const [openAlertId, setOpenAlertId] = useState<string | null>(null);

  // Load the cached insights on mount.
  const load = useCallback(
    async (force = false) => {
      if (force) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const url = `/api/console/insights?accountType=${accountType}${force ? "&force=1" : ""}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
          const j = (await res.json().catch(() => ({}))) as { error?: string; detail?: string };
          throw new Error(j.error || `HTTP ${res.status}`);
        }
        const json = (await res.json()) as InsightResult;
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load insights");
      } finally {
        if (force) setRefreshing(false);
        else setLoading(false);
      }
    },
    [accountType],
  );

  useEffect(() => {
    load(false);
  }, [load]);

  // Hydrate the read-state from localStorage on mount + when persona changes.
  useEffect(() => {
    setReadIds(loadReadIds(accountType));
  }, [accountType]);

  const handleMarkAsRead = useCallback(
    (insightId: string) => {
      setReadIds((prev) => {
        const next = new Set(prev);
        next.add(insightId);
        saveReadIds(accountType, next);
        return next;
      });
    },
    [accountType],
  );

  const handleMarkAllRead = useCallback(() => {
    if (!data) return;
    const next = new Set<string>();
    for (const i of data.insights) next.add(i.id);
    setReadIds(next);
    saveReadIds(accountType, next);
  }, [data, accountType]);

  const unreadCount = useMemo(() => {
    if (!data) return 0;
    return data.insights.filter((i) => !readIds.has(i.id)).length;
  }, [data, readIds]);

  // ─── Styles ──────────────────────────────────────────────────
  const FONT = { sans: C.fontSans, mono: C.fontMono };

  const wrapperStyle: CSSProperties = {
    marginBottom: 16,
    background: C.bg,
    border: `1px solid ${C.border}`,
    borderRadius: 4,
    overflow: "hidden",
  };

  const headerStyle: CSSProperties = {
    padding: "12px 16px",
    borderBottom: `1px solid ${C.border}`,
    background: persona.accentBg,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  };

  const eyebrowStyle: CSSProperties = {
    fontSize: 9,
    fontFamily: FONT.mono,
    color: persona.accent,
    letterSpacing: "0.14em",
    fontWeight: 700,
    textTransform: "uppercase",
  };

  const headingStyle: CSSProperties = {
    fontSize: 13,
    fontWeight: 700,
    color: C.text,
    margin: "2px 0 0 0",
    letterSpacing: "-0.01em",
  };

  const bodyWrapStyle: CSSProperties = {
    padding: "12px 16px",
    maxHeight: "70vh",
    overflowY: "auto",
  };

  const generateBtnStyle: CSSProperties = {
    padding: "6px 12px",
    fontSize: 10,
    fontFamily: FONT.mono,
    fontWeight: 700,
    border: `1px solid ${persona.accent}`,
    borderRadius: 4,
    background: refreshing ? persona.accentBg : C.bg,
    color: persona.accent,
    cursor: refreshing ? "wait" : "pointer",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    transition: "all 0.15s ease",
    opacity: refreshing ? 0.7 : 1,
    display: "flex",
    alignItems: "center",
    gap: 6,
  };

  const markAllBtnStyle: CSSProperties = {
    padding: "6px 10px",
    fontSize: 10,
    fontFamily: FONT.mono,
    fontWeight: 600,
    border: `1px solid ${C.border}`,
    borderRadius: 4,
    background: C.bg,
    color: C.textMuted,
    cursor: "pointer",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    transition: "all 0.15s ease",
  };

  return (
    <section
      className={className}
      style={wrapperStyle}
      aria-label="HarchIQ Insight Panel"
      role="region"
    >
      {/* ─── Header ─── */}
      <div style={headerStyle}>
        <div style={{ minWidth: 0, flex: "1 1 auto" }}>
          <div style={eyebrowStyle}>{persona.eyebrow}</div>
          <h3 style={headingStyle}>
            {persona.heading}
            {unreadCount > 0 && (
              <span
                style={{
                  marginLeft: 8,
                  fontSize: 10,
                  fontFamily: FONT.mono,
                  color: C.bg,
                  background: persona.accent,
                  padding: "2px 6px",
                  borderRadius: 2,
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                }}
              >
                {unreadCount} NEW
              </span>
            )}
          </h3>
          {data && (
            <div
              style={{
                fontSize: 10,
                fontFamily: FONT.mono,
                color: C.textMuted,
                marginTop: 4,
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <span>
                {data.insights.length} insights · {data.dataPoints} data points
              </span>
              <span style={{ color: data.cached ? C.textMuted : persona.accent }}>
                {data.cached ? "CACHED" : "FRESH"} · {data.model}
              </span>
              <span>
                {new Date(data.generatedAt).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </span>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              style={markAllBtnStyle}
              title="Mark all insights as read"
            >
              Mark all read
            </button>
          )}
          <button
            type="button"
            onClick={() => load(true)}
            disabled={refreshing}
            style={generateBtnStyle}
            title="Bypass the 15-minute cache and regenerate insights from live data"
          >
            <span
              style={{
                display: "inline-block",
                transform: refreshing ? "rotate(360deg)" : "rotate(0deg)",
                transition: "transform 0.6s ease",
              }}
              aria-hidden="true"
            >
              {"\u21BB"}
            </span>
            {refreshing ? "Generating…" : "Generate Fresh Insights"}
          </button>
        </div>
      </div>

      {/* ─── Body ─── */}
      <div style={bodyWrapStyle}>
        {loading ? (
          <InsightSkeleton accent={persona.accent} />
        ) : error ? (
          <InsightError accent={persona.accent} message={error} onRetry={() => load(true)} />
        ) : !data || data.insights.length === 0 ? (
          <div
            style={{
              padding: 24,
              textAlign: "center",
              fontSize: 12,
              color: C.textMuted,
              fontFamily: FONT.mono,
            }}
          >
            {persona.emptyHint}
          </div>
        ) : (
          <div>
            {data.insights.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                accent={persona.accent}
                accentBg={persona.accentBg}
                read={readIds.has(insight.id)}
                onMarkAsRead={handleMarkAsRead}
                onOpenAlert={setOpenAlertId}
              />
            ))}
          </div>
        )}
      </div>

      {/* ─── Alert detail modal (Dataminr-parity clickable citations) ─── */}
      <AlertDetailModal
        alertId={openAlertId}
        accent={persona.accent}
        onClose={() => setOpenAlertId(null)}
      />

      {/* ─── Custom scrollbar styling ─── */}
      <style>{`
        section[aria-label="HarchIQ Insight Panel"] ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        section[aria-label="HarchIQ Insight Panel"] ::-webkit-scrollbar-track {
          background: transparent;
        }
        section[aria-label="HarchIQ Insight Panel"] ::-webkit-scrollbar-thumb {
          background: ${C.border};
          border-radius: 3px;
        }
        section[aria-label="HarchIQ Insight Panel"] ::-webkit-scrollbar-thumb:hover {
          background: ${C.borderStrong};
        }
      `}</style>
    </section>
  );
}

// ─── InsightCard ───────────────────────────────────────────────

interface InsightCardProps {
  insight: Insight;
  accent: string;
  accentBg: string;
  read: boolean;
  onMarkAsRead: (id: string) => void;
  onOpenAlert: (id: string) => void;
}

function InsightCard({ insight, accent, accentBg, read, onMarkAsRead, onOpenAlert }: InsightCardProps) {
  const sevColor = severityColor(insight.severity, accent);
  const FONT = { sans: C.fontSans, mono: C.fontMono };

  const cardStyle: CSSProperties = {
    borderLeft: `3px solid ${sevColor}`,
    padding: 16,
    borderRadius: 4,
    marginBottom: 12,
    background: read ? C.bgSubtle : C.bg,
    transition: "background 0.2s ease",
    position: "relative",
  };

  const titleStyle: CSSProperties = {
    fontSize: 14,
    fontWeight: 700,
    color: C.text,
    margin: 0,
    lineHeight: 1.3,
    letterSpacing: "-0.01em",
    paddingRight: read ? 0 : 80,
  };

  const bodyStyle: CSSProperties = {
    fontSize: 13,
    color: C.textBody,
    lineHeight: 1.5,
    marginTop: 8,
  };

  const actionStyle: CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: accent,
    marginTop: 8,
    padding: "8px 12px",
    background: accentBg,
    borderRadius: 4,
    borderLeft: `2px solid ${accent}`,
    display: "flex",
    alignItems: "flex-start",
    gap: 6,
  };

  const confidenceStyle: CSSProperties = {
    fontSize: 10,
    fontFamily: FONT.mono,
    color: C.textMuted,
    marginTop: 4,
    display: "flex",
    alignItems: "center",
    gap: 6,
  };

  const metaStyle: CSSProperties = {
    fontSize: 9,
    fontFamily: FONT.mono,
    color: C.textMuted,
    marginTop: 4,
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  };

  const readBadgeStyle: CSSProperties = {
    position: "absolute",
    top: 12,
    right: 12,
    fontSize: 9,
    fontFamily: FONT.mono,
    color: C.textMuted,
    background: C.bgSubtle,
    border: `1px solid ${C.border}`,
    padding: "2px 6px",
    borderRadius: 2,
    letterSpacing: "0.08em",
    cursor: "pointer",
    transition: "all 0.15s ease",
  };

  return (
    <article style={cardStyle} aria-label={`Insight: ${insight.title}`}>
      {/* ─── Meta line ─── */}
      <div style={metaStyle}>
        <span
          style={{
            color: sevColor,
            fontWeight: 700,
          }}
        >
          {severityLabel(insight.severity)}
        </span>
        <span style={{ color: accent }}>{typeLabel(insight.type)}</span>
      </div>

      {/* ─── Read badge / mark-as-read button ─── */}
      {read ? (
        <span style={readBadgeStyle} title="Marked as read">
          READ
        </span>
      ) : (
        <button
          type="button"
          onClick={() => onMarkAsRead(insight.id)}
          style={readBadgeStyle}
          title="Mark this insight as read"
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = C.bgHover;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = C.bgSubtle;
          }}
        >
          MARK READ
        </button>
      )}

      {/* ─── Title ─── */}
      <h4 style={titleStyle}>{insight.title}</h4>

      {/* ─── Body ─── */}
      <p style={bodyStyle}>{insight.body}</p>

      {/* ─── Recommended action ─── */}
      <div style={actionStyle}>
        <span style={{ fontWeight: 700, color: accent, flexShrink: 0 }} aria-hidden="true">
          {"\u2192"}
        </span>
        <span>{insight.action}</span>
      </div>

      {/* ─── Confidence bar ─── */}
      <div style={confidenceStyle}>
        <span>CONFIDENCE</span>
        <span style={{ fontWeight: 700, color: C.textBody }}>
          {(insight.confidence * 100).toFixed(0)}%
        </span>
        <div
          style={{
            flex: 1,
            maxWidth: 120,
            height: 4,
            background: C.bgHover,
            borderRadius: 2,
            overflow: "hidden",
          }}
          aria-hidden="true"
        >
          <div
            style={{
              width: `${insight.confidence * 100}%`,
              height: "100%",
              background: accent,
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>

      {/* ─── Sources ─── */}
      {insight.sources.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div
            style={{
              fontSize: 9,
              fontFamily: FONT.mono,
              color: C.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 4,
            }}
          >
            Sources ({insight.sources.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {insight.sources.map((s) => (
              <SourceRow key={s.id} source={s} accent={accent} onOpenDetail={onOpenAlert} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

// ─── SourceRow ─────────────────────────────────────────────────
//
//  Task: dataminr-briefings-compliance — source rows are now clickable
//  chips that open a modal with the full alert details. The chip
//  shows the kind tag + the alert title + the source name + the
//  published date (e.g. "[Alert #1234 — Hespress — Jul 31]"). For
//  articles with a URL we still offer an "open in new tab" affordance
//  via the secondary ⤴ icon.

function SourceRow({
  source,
  accent,
  onOpenDetail,
}: {
  source: InsightSourceRef;
  accent: string;
  onOpenDetail: (id: string) => void;
}) {
  const FONT = { sans: C.fontSans, mono: C.fontMono };

  const rowStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 6px",
    background: C.bgSubtle,
    borderRadius: 2,
    borderLeft: `2px solid ${accent}`,
    fontSize: 11,
  };

  const kindTagStyle: CSSProperties = {
    fontSize: 8,
    fontFamily: FONT.mono,
    fontWeight: 700,
    color: accent,
    background: "transparent",
    letterSpacing: "0.08em",
    flexShrink: 0,
    minWidth: 64,
  };

  const titleStyle: CSSProperties = {
    color: C.textBody,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    flex: 1,
    minWidth: 0,
  };

  // Build the chip label — "[Alert #<id-suffix> — <source> — <Mon DD>]"
  const idSuffix = source.id.slice(-4);

  const chip = (
    <button
      type="button"
      onClick={() => onOpenDetail(source.id)}
      style={{
        ...rowStyle,
        cursor: "pointer",
        border: "none",
        textAlign: "left",
        width: "100%",
        background: C.bgSubtle,
        transition: "background 0.15s ease, border-color 0.15s ease",
      }}
      title={`View alert details: ${source.title}`}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = C.bgHover;
        (e.currentTarget as HTMLButtonElement).style.borderLeftColor = accent;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = C.bgSubtle;
      }}
    >
      <span style={kindTagStyle}>{kindLabel(source.kind)}</span>
      <span style={titleStyle} title={source.title}>
        {source.title}
      </span>
      <span
        style={{
          fontSize: 9,
          fontFamily: FONT.mono,
          color: C.textMuted,
          letterSpacing: "0.04em",
          flexShrink: 0,
        }}
      >
        #{idSuffix}
      </span>
      {source.severity && (
        <span
          style={{
            fontSize: 9,
            fontFamily: FONT.mono,
            color:
              source.severity === "critical"
                ? "#ef4444"
                : source.severity === "high"
                  ? "#f59e0b"
                  : C.textMuted,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            flexShrink: 0,
          }}
        >
          {source.severity}
        </span>
      )}
      {source.url && (
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{
            fontSize: 10,
            color: accent,
            textDecoration: "none",
            flexShrink: 0,
            padding: "0 2px",
          }}
          title={`Open source URL: ${source.url}`}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.opacity = "0.7";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.opacity = "1";
          }}
        >
          {"\u2197"}
        </a>
      )}
    </button>
  );

  return chip;
}

// ─── AlertDetailModal ──────────────────────────────────────────
//
//  Fetches the full alert record from /api/console/alert-detail?id=
//  and renders it inside a modal. Supports Article + RiskAssessment
//  + AIVisibility kinds (the API returns a `kind` discriminator).

interface AlertDetail {
  id: string;
  title: string;
  source: string;
  url: string | null;
  summary: string | null;
  content: string | null;
  language: string | null;
  sentimentLabel: string | null;
  sentimentScore: number | null;
  relevanceScore: number | null;
  publishedAt: string | null;
  scrapedAt: string | null;
  severity: string;
  category?: string;
  riskLevel?: string;
  riskScore?: number;
  trajectory?: string | null;
  articleCount?: number | null;
  mitigation?: string | null;
  platform?: string;
  cited?: boolean;
  position?: string | null;
}

interface AlertDetailResponse {
  kind: "article" | "risk_assessment" | "ai_visibility";
  alert: AlertDetail;
}

function AlertDetailModal({
  alertId,
  accent,
  onClose,
}: {
  alertId: string | null;
  accent: string;
  onClose: () => void;
}) {
  const [data, setData] = useState<AlertDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const FONT = { sans: C.fontSans, mono: C.fontMono };

  useEffect(() => {
    if (!alertId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData(null);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(null);
      return;
    }
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);
    fetch(`/api/console/alert-detail?id=${encodeURIComponent(alertId)}`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          const j = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(j.error || `HTTP ${res.status}`);
        }
        return res.json() as Promise<AlertDetailResponse>;
      })
      .then((j) => {
        if (!cancelled) setData(j);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load alert");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [alertId]);

  // Esc to close.
  useEffect(() => {
    if (!alertId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [alertId, onClose]);

  if (!alertId) return null;

  const kindLabelStr = data
    ? data.kind === "article"
      ? "ARTICLE"
      : data.kind === "risk_assessment"
        ? "RISK ASSESSMENT"
        : "AI VISIBILITY"
    : "SOURCE";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Alert detail"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
        zIndex: 250,
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
          borderRadius: 6,
          padding: 20,
          width: "100%",
          maxWidth: 640,
          boxShadow: "0 16px 48px rgba(0,0,0,0.18)",
          fontFamily: FONT.sans,
          position: "relative",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
            paddingBottom: 10,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontFamily: FONT.mono,
              color: accent,
              letterSpacing: "0.14em",
              fontWeight: 700,
            }}
          >
            {kindLabelStr}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "transparent",
              border: `1px solid ${C.border}`,
              borderRadius: 3,
              width: 24,
              height: 24,
              cursor: "pointer",
              color: C.textMuted,
              fontSize: 12,
              lineHeight: 1,
            }}
          >
            {"\u00d7"}
          </button>
        </div>

        {loading && (
          <div style={{ fontSize: 12, color: C.textMuted, fontFamily: FONT.mono, padding: 24, textAlign: "center" }}>
            Loading alert…
          </div>
        )}
        {error && (
          <div
            style={{
              borderLeft: `3px solid #ef4444`,
              padding: "10px 12px",
              background: "rgba(239,68,68,0.04)",
              fontSize: 12,
              color: C.textBody,
              borderRadius: 3,
            }}
          >
            {error}
          </div>
        )}
        {data && !loading && !error && (
          <AlertDetailBody data={data} accent={accent} />
        )}
      </div>
    </div>
  );
}

function AlertDetailBody({ data, accent }: { data: AlertDetailResponse; accent: string }) {
  const FONT = { sans: C.fontSans, mono: C.fontMono };
  const a = data.alert;

  const meta: Array<[string, string]> = [];
  if (a.publishedAt) {
    meta.push([
      "Published",
      new Date(a.publishedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }),
    ]);
  }
  if (a.scrapedAt) {
    meta.push([
      "Ingested",
      new Date(a.scrapedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }),
    ]);
  }
  meta.push(["Source", a.source]);
  if (a.language) meta.push(["Language", a.language]);
  if (a.sentimentLabel) meta.push(["Sentiment", a.sentimentLabel]);
  if (a.sentimentScore !== null && a.sentimentScore !== undefined) {
    meta.push(["Sentiment score", a.sentimentScore.toFixed(3)]);
  }
  if (a.relevanceScore !== null && a.relevanceScore !== undefined) {
    meta.push(["Relevance", a.relevanceScore.toFixed(3)]);
  }
  if (a.severity) meta.push(["Severity", a.severity.toUpperCase()]);
  if (data.kind === "risk_assessment") {
    if (a.category) meta.push(["Category", a.category]);
    if (a.riskScore !== null && a.riskScore !== undefined) meta.push(["Risk score", `${a.riskScore}/100`]);
    if (a.trajectory) meta.push(["Trajectory", a.trajectory]);
    if (a.articleCount !== null && a.articleCount !== undefined) meta.push(["Articles", String(a.articleCount)]);
  }
  if (data.kind === "ai_visibility") {
    if (a.platform) meta.push(["Platform", a.platform]);
    if (a.cited !== undefined) meta.push(["Cited", a.cited ? "Yes" : "No"]);
    if (a.position) meta.push(["Position", a.position]);
  }

  return (
    <div>
      {/* Title */}
      <h3
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: C.text,
          margin: "0 0 8px 0",
          lineHeight: 1.3,
          letterSpacing: "-0.01em",
        }}
      >
        {a.title}
      </h3>

      {/* Meta grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "6px 12px",
          marginBottom: 14,
          padding: 10,
          background: C.bgSubtle,
          borderRadius: 4,
          border: `1px solid ${C.border}`,
        }}
      >
        {meta.map(([k, v]) => (
          <div key={k} style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 8,
                fontFamily: FONT.mono,
                color: C.textMuted,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {k}
            </div>
            <div style={{ fontSize: 12, color: C.textBody, marginTop: 2, wordBreak: "break-word" }}>
              {v}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      {a.summary && (
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              fontSize: 9,
              fontFamily: FONT.mono,
              color: accent,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Summary
          </div>
          <p style={{ fontSize: 13, color: C.textBody, lineHeight: 1.55, margin: 0 }}>
            {a.summary}
          </p>
        </div>
      )}

      {/* Content (articles) or Mitigation (risk assessments) */}
      {a.content && (
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              fontSize: 9,
              fontFamily: FONT.mono,
              color: accent,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            {data.kind === "risk_assessment" ? "Mitigation" : "Content"}
          </div>
          <p
            style={{
              fontSize: 12,
              color: C.textBody,
              lineHeight: 1.55,
              margin: 0,
              whiteSpace: "pre-wrap",
              maxHeight: 320,
              overflowY: "auto",
            }}
          >
            {a.content}
          </p>
        </div>
      )}

      {/* Footer — open original */}
      {a.url && (
        <a
          href={a.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            fontFamily: FONT.mono,
            color: accent,
            textDecoration: "none",
            border: `1px solid ${accent}`,
            padding: "6px 10px",
            borderRadius: 3,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
          title={`Open: ${a.url}`}
        >
          Open original {"\u2197"}
        </a>
      )}
    </div>
  );
}

// ─── Skeleton + error states ───────────────────────────────────

function InsightSkeleton({ accent }: { accent: string }) {
  const FONT = { sans: C.fontSans, mono: C.fontMono };
  return (
    <div>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            borderLeft: `3px solid ${accent}40`,
            padding: 16,
            borderRadius: 4,
            marginBottom: 12,
            background: C.bgSubtle,
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontFamily: FONT.mono,
              color: C.border,
              letterSpacing: "0.14em",
              marginBottom: 8,
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
          >
            ANALYSING…
          </div>
          <div
            style={{
              height: 14,
              width: "70%",
              background: C.bgHover,
              borderRadius: 2,
              marginBottom: 8,
            }}
          />
          <div
            style={{
              height: 12,
              width: "100%",
              background: C.bgHover,
              borderRadius: 2,
              marginBottom: 4,
            }}
          />
          <div
            style={{
              height: 12,
              width: "92%",
              background: C.bgHover,
              borderRadius: 2,
              marginBottom: 4,
            }}
          />
          <div
            style={{
              height: 12,
              width: "60%",
              background: C.bgHover,
              borderRadius: 2,
            }}
          />
        </div>
      ))}
    </div>
  );
}

function InsightError({
  accent,
  message,
  onRetry,
}: {
  accent: string;
  message: string;
  onRetry: () => void;
}) {
  const FONT = { sans: C.fontSans, mono: C.fontMono };
  return (
    <div
      style={{
        borderLeft: `3px solid ${"#ef4444"}`,
        padding: 16,
        borderRadius: 4,
        background: "rgba(239,68,68,0.04)",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontFamily: FONT.mono,
          color: "#ef4444",
          letterSpacing: "0.14em",
          fontWeight: 700,
          marginBottom: 6,
        }}
      >
        INSIGHT ENGINE ERROR
      </div>
      <div style={{ fontSize: 13, color: C.textBody, lineHeight: 1.5, overflow: "hidden", wordBreak: "break-word", overflowWrap: "anywhere", minWidth: 0 }}>
        {message}
      </div>
      <button
        type="button"
        onClick={onRetry}
        style={{
          marginTop: 10,
          padding: "6px 12px",
          fontSize: 10,
          fontFamily: FONT.mono,
          fontWeight: 700,
          border: `1px solid ${accent}`,
          borderRadius: 4,
          background: C.bg,
          color: accent,
          cursor: "pointer",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        Retry
      </button>
    </div>
  );
}

export default InsightPanel;
