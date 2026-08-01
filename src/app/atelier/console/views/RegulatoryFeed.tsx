"use client";

// ═══════════════════════════════════════════════════════════════
//  RegulatoryFeed — Investor Desk · Section 5
//
//  Live regulatory intelligence panel for the Investment Bank console.
//  Surfaces the latest AMMC / BAM / BVC press releases scraped daily
//  by /api/cron/scrape-regulatory and exposed via
//  /api/console/regulatory.
//
//  Layout:
//    ┌─ Header ───────────────────────────────────────────────┐
//    │  Forensic terminal eyebrow · "Regulatory Intelligence" │
//    │  Refresh button · last-updated marker                  │
//    └────────────────────────────────────────────────────────┘
//    ┌─ Filter strip ─────────────────────────────────────────┐
//    │  Source tabs (All / AMMC / BAM / BVC) + counts         │
//    │  Search input · Portfolio-impact toggle                │
//    └────────────────────────────────────────────────────────┘
//    ┌─ Virtualized feed ─────────────────────────────────────┐
//    │  ▣ AMMC  · REGULATORY · 12 Mar 2026                   │
//    │    Sanction rendered against X — MM/MAD 2.5m           │
//    │    https://www.ammc.ma/avis/123                        │
//    │  ▣ BAM   · FINANCIAL · 11 Mar 2026                    │
//    │    Circulaire n°17/G/2026 — taux directeur             │
//    │  ▣ BVC   · MARKET · 10 Mar 2026                       │
//    │    Suspension de cotation — Société X                  │
//    └────────────────────────────────────────────────────────┘
//
//  Colour code (matches the Investor Desk forensic palette):
//    • regulatory           → navy (ACCENT #1e3a5f)
//    • financial_regulatory → slate (#475569 — slate-600)
//    • market               → emerald (GREEN #059669)
//
//  The list is virtualised via @tanstack/react-virtual so 100+ items
//  scroll smoothly without re-rendering off-screen rows.
//
//  Task ID: signal-regulatory-feed
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
import { C } from "../../components/tokens";

// ─── Types (mirror the API response) ─────────────────────────────

type RegulatorySource = "ammc" | "bam" | "bvc";
type RegulatoryType = "regulatory" | "financial_regulatory" | "market";

interface RegulatoryItem {
  id: string;
  title: string;
  source: RegulatorySource;
  sourceLabel: string;
  url: string;
  publishedAt: string | null;
  type: RegulatoryType;
  summary: string;
  language: string;
}

interface RegulatoryApiResponse {
  items: RegulatoryItem[];
  sources: { ammc: number; bam: number; bvc: number };
  total: number;
  refreshedAt: string | null;
  cached: boolean;
  error?: string;
  detail?: string;
}

// ─── Design tokens (matches InvestorDeskDashboard forensic vibe) ──

const ACCENT = "#1e3a5f";
const NAVY = "#1e3a5f";
const SLATE = "#475569"; // slate-600
const EMERALD = "#059669";
const RED = "#dc2626";
const AMBER = "#d97706";
const SLATE_MID = "#737373";
const SLATE_LIGHT = "#94a3b8";

const FONT = { sans: C.fontSans, mono: C.fontMono };

// Source → type metadata for badges + colours.
const SOURCE_META: Record<
  RegulatorySource,
  { label: string; type: RegulatoryType; color: string; bg: string; fullName: string }
> = {
  ammc: {
    label: "AMMC",
    type: "regulatory",
    color: NAVY,
    bg: "rgba(30,58,95,0.06)",
    fullName: "Autorité Marocaine du Marché des Capitaux",
  },
  bam: {
    label: "BAM",
    type: "financial_regulatory",
    color: SLATE,
    bg: "rgba(71,85,105,0.08)",
    fullName: "Bank Al-Maghrib",
  },
  bvc: {
    label: "BVC",
    type: "market",
    color: EMERALD,
    bg: "rgba(5,150,105,0.08)",
    fullName: "Bourse des Valeurs de Casablanca",
  },
};

const TYPE_COLOR: Record<RegulatoryType, string> = {
  regulatory: NAVY,
  financial_regulatory: SLATE,
  market: EMERALD,
};

const TYPE_LABEL: Record<RegulatoryType, string> = {
  regulatory: "REGULATORY",
  financial_regulatory: "FINANCIAL",
  market: "MARKET",
};

// ─── Component ───────────────────────────────────────────────────

export interface RegulatoryFeedProps {
  /** Optional: list of company names from the user's portfolio. When
   *  provided, items whose title/summary mentions any of them get a
   *  "PORTFOLIO IMPACT" tag. */
  portfolioCompanies?: string[];
}

type SourceFilter = "all" | RegulatorySource;

export function RegulatoryFeed({ portfolioCompanies = [] }: RegulatoryFeedProps) {
  const [items, setItems] = useState<RegulatoryItem[]>([]);
  const [counts, setCounts] = useState<{ ammc: number; bam: number; bvc: number }>({
    ammc: 0,
    bam: 0,
    bvc: 0,
  });
  const [refreshedAt, setRefreshedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [query, setQuery] = useState("");
  // Debounced search input — applied to the API call after 300ms idle.
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [portfolioImpactOnly, setPortfolioImpactOnly] = useState(false);

  // Virtualizer parent ref — the scrollable list container.
  const listRef = useRef<HTMLDivElement>(null);

  // ─── Debounced search input ──────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // ─── Load regulatory items ───────────────────────────────────
  const load = useCallback(
    async (force = false) => {
      if (force) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (sourceFilter !== "all") params.set("source", sourceFilter);
        params.set("limit", "100");
        if (debouncedQuery) params.set("q", debouncedQuery);
        if (force) params.set("refresh", "1");

        const res = await fetch(`/api/console/regulatory?${params.toString()}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          const j = (await res.json().catch(() => ({}))) as { error?: string; detail?: string };
          throw new Error(j.error || `HTTP ${res.status}`);
        }
        const json = (await res.json()) as RegulatoryApiResponse;
        setItems(json.items);
        setCounts(json.sources);
        setRefreshedAt(json.refreshedAt);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load regulatory feed");
      } finally {
        if (force) setRefreshing(false);
        else setLoading(false);
      }
    },
    [sourceFilter, debouncedQuery],
  );

  // Reload whenever the source filter or search query changes.
  useEffect(() => {
    load(false);
  }, [load]);

  // ─── Portfolio impact filter (client-side) ───────────────────
  //
  //  An item "affects the user's portfolio" when its title or summary
  //  mentions one of the user's holding company names. We do this
  //  client-side because the regulatory API doesn't know about the
  //  user's portfolio scope.
  const portfolioHits = useMemo(() => {
    if (portfolioCompanies.length === 0) return new Set<string>();
    const lowered = portfolioCompanies.map((c) => c.toLowerCase());
    const hits = new Set<string>();
    for (const item of items) {
      const hay = `${item.title} ${item.summary}`.toLowerCase();
      if (lowered.some((c) => c.length >= 3 && hay.includes(c))) {
        hits.add(item.id);
      }
    }
    return hits;
  }, [items, portfolioCompanies]);

  const visibleItems = useMemo(() => {
    if (!portfolioImpactOnly) return items;
    return items.filter((it) => portfolioHits.has(it.id));
  }, [items, portfolioImpactOnly, portfolioHits]);

  // ─── Virtualizer (100+ capacity, only renders visible rows) ──
  const virtualizer = useVirtualizer({
    count: visibleItems.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => 140, // estimated row height (px)
    overscan: 6,
  });
  const virtualItems = virtualizer.getVirtualItems();
  const totalHeight = virtualizer.getTotalSize();

  // ─── Source tab counts ───────────────────────────────────────
  const totalCount = counts.ammc + counts.bam + counts.bvc;

  // ─── Styles ──────────────────────────────────────────────────

  const wrapperStyle: CSSProperties = {
    padding: "24px",
    background: C.bg,
    minHeight: "100%",
  };

  const headerStyle: CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "20px",
  };

  const eyebrowStyle: CSSProperties = {
    fontSize: "11px",
    fontFamily: FONT.mono,
    color: ACCENT,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: "4px",
  };

  const titleStyle: CSSProperties = {
    fontSize: "22px",
    fontWeight: 700,
    color: C.text,
    margin: 0,
    letterSpacing: "-0.02em",
  };

  const metaStyle: CSSProperties = {
    fontSize: "10px",
    fontFamily: FONT.mono,
    color: SLATE_MID,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  };

  const refreshBtnStyle = (disabled: boolean): CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    background: disabled ? C.bgHover : ACCENT,
    color: disabled ? SLATE_MID : "#ffffff",
    border: `1px solid ${disabled ? C.border : ACCENT}`,
    borderRadius: "4px",
    fontSize: "11px",
    fontFamily: FONT.sans,
    fontWeight: 600,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    cursor: disabled ? "wait" : "pointer",
    transition: "all 0.15s",
  });

  // Filter strip — source tabs + search + portfolio toggle.
  const filterRowStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
    flexWrap: "wrap",
  };

  const sourceTabStyle = (active: boolean, color: string): CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 12px",
    background: active ? color : C.bg,
    color: active ? "#ffffff" : SLATE_MID,
    border: `1px solid ${active ? color : C.border}`,
    borderRadius: "4px",
    fontSize: "11px",
    fontFamily: FONT.mono,
    fontWeight: 600,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "all 0.15s",
  });

  const countChipStyle: CSSProperties = {
    fontSize: "10px",
    padding: "2px 6px",
    background: "rgba(0,0,0,0.12)",
    color: "inherit",
    borderRadius: "3px",
    fontFamily: FONT.mono,
    fontWeight: 700,
  };

  const searchInputStyle: CSSProperties = {
    flex: "1 1 280px",
    minWidth: "220px",
    padding: "8px 12px",
    background: C.bg,
    border: `1px solid ${C.border}`,
    borderRadius: "4px",
    fontSize: "13px",
    fontFamily: FONT.sans,
    color: C.text,
    outline: "none",
  };

  const portfolioToggleStyle = (active: boolean): CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    background: active ? AMBER : C.bg,
    color: active ? "#ffffff" : SLATE_MID,
    border: `1px solid ${active ? AMBER : C.border}`,
    borderRadius: "4px",
    fontSize: "11px",
    fontFamily: FONT.mono,
    fontWeight: 600,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "all 0.15s",
  });

  // List container — max-h-96 with custom scrollbar.
  const listContainerStyle: CSSProperties = {
    border: `1px solid ${C.border}`,
    borderRadius: "4px",
    background: C.bg,
    maxHeight: "640px",
    overflow: "auto",
    position: "relative",
  };

  const emptyStyle: CSSProperties = {
    padding: "48px 24px",
    textAlign: "center",
    color: SLATE_MID,
    fontFamily: FONT.mono,
    fontSize: "12px",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  };

  // ─── Render ──────────────────────────────────────────────────

  return (
    <div className="dash-main" style={wrapperStyle}>
      <style>{`
        /* Custom scrollbar for the virtualized list */
        .regulatory-feed-list::-webkit-scrollbar { width: 8px; }
        .regulatory-feed-list::-webkit-scrollbar-track { background: transparent; }
        .regulatory-feed-list::-webkit-scrollbar-thumb {
          background: ${C.borderStrong};
          border-radius: 4px;
        }
        .regulatory-feed-list::-webkit-scrollbar-thumb:hover { background: ${SLATE_LIGHT}; }

        /* Mobile responsive — collapse the filter strip to 1 col. */
        @media (max-width: 768px) {
          .regulatory-feed-filter-row { flex-direction: column; align-items: stretch; }
          .regulatory-feed-filter-row > * { width: 100%; justify-content: center; }
        }
      `}</style>

      {/* ─── Header ─── */}
      <div style={headerStyle}>
        <div>
          <div style={eyebrowStyle}>Forensic Risk Terminal · Regulatory Intelligence</div>
          <h3 style={titleStyle}>Regulatory Feed · AMMC + BAM + BVC</h3>
          <div style={{ ...metaStyle, marginTop: "6px" }}>
            {totalCount} items indexed · AMMC {counts.ammc} · BAM {counts.bam} · BVC {counts.bvc}
            {refreshedAt && ` · last refresh ${formatDate(refreshedAt)}`}
          </div>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          style={refreshBtnStyle(refreshing)}
          aria-label="Refresh regulatory feed"
        >
          {refreshing ? "Scraping…" : "Refresh now"}
        </button>
      </div>

      {/* ─── Error banner ─── */}
      {error && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 16px",
            background: "rgba(220,38,38,0.06)",
            border: `1px solid ${RED}`,
            borderLeft: `3px solid ${RED}`,
            borderRadius: "4px",
            color: RED,
            fontFamily: FONT.sans,
            fontSize: "13px",
          }}
          role="alert"
        >
          <strong style={{ fontFamily: FONT.mono, fontSize: "11px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Feed unavailable
          </strong>{" "}
          — {error}. Showing cached items below.
        </div>
      )}

      {/* ─── Filter strip ─── */}
      <div className="regulatory-feed-filter-row" style={filterRowStyle}>
        {/* Source tabs */}
        <button
          onClick={() => setSourceFilter("all")}
          style={sourceTabStyle(sourceFilter === "all", ACCENT)}
        >
          All
          <span style={countChipStyle}>{totalCount}</span>
        </button>
        {(Object.keys(SOURCE_META) as RegulatorySource[]).map((src) => {
          const meta = SOURCE_META[src];
          const active = sourceFilter === src;
          return (
            <button
              key={src}
              onClick={() => setSourceFilter(src)}
              style={sourceTabStyle(active, meta.color)}
              title={meta.fullName}
            >
              {meta.label}
              <span style={countChipStyle}>{counts[src]}</span>
            </button>
          );
        })}

        {/* Search input */}
        <input
          type="search"
          placeholder="Search titles & summaries…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={searchInputStyle}
          aria-label="Search regulatory items"
        />

        {/* Portfolio-impact toggle */}
        {portfolioCompanies.length > 0 && (
          <button
            onClick={() => setPortfolioImpactOnly((v) => !v)}
            style={portfolioToggleStyle(portfolioImpactOnly)}
            title={`Only items mentioning one of your ${portfolioCompanies.length} portfolio holdings`}
          >
            Portfolio impact
            {portfolioHits.size > 0 && (
              <span style={countChipStyle}>{portfolioHits.size}</span>
            )}
          </button>
        )}
      </div>

      {/* ─── Loading state ─── */}
      {loading && <div style={emptyStyle}>Loading regulatory items…</div>}

      {/* ─── Empty state ─── */}
      {!loading && visibleItems.length === 0 && (
        <div style={emptyStyle}>
          {portfolioImpactOnly
            ? `No regulatory items match your portfolio holdings.`
            : debouncedQuery
            ? `No items match "${debouncedQuery}".`
            : "No regulatory items indexed yet — the daily cron runs at 06:00 UTC."}
        </div>
      )}

      {/* ─── Virtualized feed ─── */}
      {!loading && visibleItems.length > 0 && (
        <div
          ref={listRef}
          className="regulatory-feed-list"
          style={listContainerStyle}
          role="feed"
          aria-label="Regulatory items"
        >
          <div
            style={{
              height: `${totalHeight}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualItems.map((vItem) => {
              const item = visibleItems[vItem.index];
              if (!item) return null;
              return (
                <div
                  key={item.id}
                  data-index={vItem.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${vItem.start}px)`,
                  }}
                >
                  <RegulatoryRow
                    item={item}
                    portfolioHit={portfolioHits.has(item.id)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Legend ─── */}
      {!loading && visibleItems.length > 0 && (
        <div
          style={{
            marginTop: "12px",
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
            fontSize: "10px",
            fontFamily: FONT.mono,
            color: SLATE_MID,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          <LegendChip color={NAVY} label="Regulatory (AMMC)" />
          <LegendChip color={SLATE} label="Financial (BAM)" />
          <LegendChip color={EMERALD} label="Market (BVC)" />
          <LegendChip color={AMBER} label="Portfolio impact" />
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────

function RegulatoryRow({
  item,
  portfolioHit,
}: {
  item: RegulatoryItem;
  portfolioHit: boolean;
}) {
  const meta = SOURCE_META[item.source];
  const typeColor = TYPE_COLOR[item.type];
  const typeLabel = TYPE_LABEL[item.type];

  const rowStyle: CSSProperties = {
    display: "flex",
    gap: "14px",
    padding: "16px 18px",
    borderBottom: `1px solid ${C.border}`,
    borderLeft: `3px solid ${typeColor}`,
    background: portfolioHit ? "rgba(217,119,6,0.04)" : C.bg,
    transition: "background 0.15s",
  };

  return (
    <article style={rowStyle}>
      {/* Left rail — source badge + type label */}
      <div style={{ flexShrink: 0, width: "72px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "4px 8px",
            background: meta.bg,
            color: meta.color,
            border: `1px solid ${meta.color}`,
            borderRadius: "4px",
            fontSize: "10px",
            fontFamily: FONT.mono,
            fontWeight: 700,
            letterSpacing: "0.08em",
            marginBottom: "6px",
          }}
        >
          {meta.label}
        </div>
        <div
          style={{
            fontSize: "9px",
            fontFamily: FONT.mono,
            color: typeColor,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          {typeLabel}
        </div>
        {portfolioHit && (
          <div
            style={{
              marginTop: "6px",
              fontSize: "9px",
              fontFamily: FONT.mono,
              color: AMBER,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Portfolio impact
          </div>
        )}
      </div>

      {/* Right — title + summary + footer */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "12px",
            marginBottom: "4px",
          }}
        >
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: C.text,
              textDecoration: "none",
              lineHeight: 1.3,
              cursor: "pointer",
              flex: 1,
              minWidth: 0,
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={item.title}
          >
            {item.title}
          </a>
          <time
            dateTime={item.publishedAt ?? undefined}
            style={{
              fontSize: "10px",
              fontFamily: FONT.mono,
              color: SLATE_MID,
              letterSpacing: "0.05em",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {item.publishedAt ? formatDate(item.publishedAt) : "—"}
          </time>
        </div>

        {item.summary && (
          <p
            style={{
              margin: "0 0 8px",
              fontSize: "12px",
              color: C.textBody,
              fontFamily: FONT.sans,
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item.summary}
          </p>
        )}

        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            fontSize: "10px",
            fontFamily: FONT.mono,
            color: SLATE_LIGHT,
          }}
        >
          <span
            style={{
              padding: "1px 6px",
              background: C.bgHover,
              borderRadius: "3px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {item.language}
          </span>
          <span
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "60%",
            }}
            title={item.url}
          >
            {item.url}
          </span>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            style={{
              marginLeft: "auto",
              color: ACCENT,
              textDecoration: "none",
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Open source ↗
          </a>
        </div>
      </div>
    </article>
  );
}

function LegendChip({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
      <span
        style={{
          width: "10px",
          height: "10px",
          background: color,
          borderRadius: "2px",
          display: "inline-block",
        }}
      />
      {label}
    </span>
  );
}

// ─── Date formatter ──────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    // DD MMM YYYY · HH:mm UTC
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const dd = String(d.getUTCDate()).padStart(2, "0");
    const mm = months[d.getUTCMonth()];
    const yyyy = d.getUTCFullYear();
    const hh = String(d.getUTCHours()).padStart(2, "0");
    const min = String(d.getUTCMinutes()).padStart(2, "0");
    return `${dd} ${mm} ${yyyy} · ${hh}:${min} UTC`;
  } catch {
    return "—";
  }
}
