"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { C as TOKENS } from "../components/tokens";

// ═══════════════════════════════════════════════════════════════
//  GLOBAL SEARCH (Cmd+Shift+F)
//
//  Unified search modal that overlays the whole ConsoleShell.
//  Searches across alerts, topics, and reports via
//  GET /api/console/search?q=...&limit=20.
//
//  Features:
//    • Auto-focus search input on open
//    • Debounced search (200ms) — driven by an event handler + a
//      ref-based timer (no setState-in-effect)
//    • Results grouped by type (Alerts / Topics / Reports)
//    • Keyboard nav: ↑↓ move, ↵ select, esc close
//    • Recent searches (last 5, persisted in localStorage)
//    • Empty / loading / no-results states
//
//  Visual spec (per design brief):
//    • Overlay: rgba(0,0,0,0.4), zIndex 200 (above Cmd+K palette)
//    • Modal: 640px max-width, 12vh top margin, white, 8px radius
//    • Input: 20px padding, 16px mono, bottom border
//    • Results: 400px max-height, scrollable
//    • Row: 12px 20px padding, hover/selected = #f4f4f5
//    • Badge: 9px mono uppercase, #f4f4f5 bg, #737373 text
//    • Group label: 10px mono uppercase, #fafafa bg
// ═══════════════════════════════════════════════════════════════

// ─── DESIGN TOKENS ────────────────────────────────────────────────
const C = {
  ...TOKENS,
  surface: TOKENS.bg,           // white
  surfaceAlt: TOKENS.bgHover,   // neutral-100
  borderLight: TOKENS.border,   // neutral-200
  textPrimary: TOKENS.text,     // neutral-950
  textSecondary: TOKENS.textBody, // neutral-600
  textMuted: TOKENS.textMuted,  // neutral-500
  textFaint: "#a3a3a3",         // neutral-400
  selectedBg: "#f4f4f5",        // zinc-100 — exact spec
  groupBg: "#fafafa",           // neutral-50 — exact spec
};

const FONT = {
  sans: C.fontSans,
  mono: C.fontMono,
};

const RECENT_KEY = "harchiq.globalsearch.recent";
const RECENT_MAX = 5;
const DEBOUNCE_MS = 200;

// ─── TYPES ────────────────────────────────────────────────────────
export type SearchResultType = "alert" | "topic" | "report";

export interface SearchResult {
  type: SearchResultType;
  id: string;
  title?: string;
  source?: string;
  date?: string | null;
  url?: string | null;
  severity?: string;
  label?: string;
  volume?: number;
  period?: string;
}

interface SearchResponse {
  query: string;
  results: SearchResult[];
  total: number;
  counts?: { alert: number; topic: number; report: number };
}

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelectAlert?: (result: SearchResult) => void;
  onSelectTopic?: (result: SearchResult) => void;
  onSelectReport?: (result: SearchResult) => void;
}

// ─── GROUP CONFIG ─────────────────────────────────────────────────
const GROUP_LABELS: Record<SearchResultType, string> = {
  alert: "Alerts",
  topic: "Topics",
  report: "Reports",
};

const GROUP_ORDER: SearchResultType[] = ["alert", "topic", "report"];

// ─── PUBLIC COMPONENT ─────────────────────────────────────────────
// Thin wrapper that only mounts the inner modal when `open` is true.
// Guarantees fresh state (input, results, recent) on every open and
// keeps the lint rule `react-hooks/set-state-in-effect` happy.
export function GlobalSearch(props: GlobalSearchProps) {
  if (!props.open) return null;
  return <GlobalSearchInner {...props} />;
}

// ─── INNER ────────────────────────────────────────────────────────
function GlobalSearchInner({
  onOpenChange,
  onSelectAlert,
  onSelectTopic,
  onSelectReport,
}: GlobalSearchProps) {
  // Lazy initial state for recent searches — reads localStorage once
  // on mount. Because the inner is remounted every time the modal
  // opens, this naturally refreshes the recent list on every open.
  const [recent, setRecent] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(RECENT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.filter((s) => typeof s === "string").slice(0, RECENT_MAX);
        }
      }
    } catch {
      // ignore — recent is best-effort
    }
    return [];
  });

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<number | null>(null);

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  // Lock body scroll while open. This effect only mutates the DOM
  // (an external system) — no setState — so it doesn't trip the
  // set-state-in-effect rule.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Auto-focus the input on mount (modal just opened). No setState.
  useEffect(() => {
    const t = window.setTimeout(() => inputRef.current?.focus(), 10);
    return () => window.clearTimeout(t);
  }, []);

  // Scroll the selected row into view when the index changes. DOM
  // mutation only — no setState.
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-idx="${selectedIndex}"]`);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  // Run the search for a given query. SetState calls inside the
  // async callback are non-synchronous (they happen after `await`),
  // so they're allowed by the set-state-in-effect rule. The
  // synchronous optimistic setState calls happen in the event
  // handler `handleQueryChange`, not in this function.
  const runSearch = useCallback((q: string) => {
    // Cancel any in-flight request
    abortRef.current?.abort();
    abortRef.current = null;

    if (!q) {
      // Synchronous clear — but only invoked from setTimeout (in
      // handleQueryChange) or from the async path below, never
      // directly inside an effect.
      setResults([]);
      setLoading(false);
      setError(null);
      setSelectedIndex(0);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    (async () => {
      try {
        const url = `/api/console/search?q=${encodeURIComponent(q)}&limit=20`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
          if (controller.signal.aborted) return;
          if (res.status === 401) {
            setError("Session expired");
          } else {
            setError(`Search failed (${res.status})`);
          }
          setResults([]);
          setLoading(false);
          setSelectedIndex(0);
          return;
        }
        const data = (await res.json()) as SearchResponse;
        if (controller.signal.aborted) return;
        setResults(data.results ?? []);
        setLoading(false);
        setError(null);
        setSelectedIndex(0);
      } catch (err) {
        if (controller.signal.aborted) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Network error");
        setResults([]);
        setLoading(false);
        setSelectedIndex(0);
      }
    })();
  }, []);

  // Event handler for the search input. Owns the optimistic setState
  // (loading=true, error=null) AND schedules the debounced fetch.
  // Because this is an event handler (not an effect), synchronous
  // setState is allowed here.
  const handleQueryChange = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);
      const trimmed = newQuery.trim();

      // Optimistic UI: clear results immediately if the input is
      // empty, otherwise mark as loading.
      if (!trimmed) {
        setResults([]);
        setLoading(false);
        setError(null);
        setSelectedIndex(0);
      } else {
        setLoading(true);
        setError(null);
      }

      // Cancel any pending debounce + in-flight fetch
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }
      abortRef.current?.abort();

      // Schedule the debounced fetch
      debounceTimerRef.current = window.setTimeout(() => {
        debounceTimerRef.current = null;
        runSearch(trimmed);
      }, DEBOUNCE_MS);
    },
    [runSearch]
  );

  // Clean up the debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      abortRef.current?.abort();
    };
  }, []);

  // Persist a query in recent searches (called from an event handler)
  const recordRecent = useCallback((q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setRecent((prev) => {
      const next = [trimmed, ...prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, RECENT_MAX);
      try {
        window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Select a single result
  const selectResult = useCallback(
    (r: SearchResult) => {
      if (query.trim()) recordRecent(query.trim());
      close();
      // Defer action so the modal can close & unmount first
      setTimeout(() => {
        try {
          if (r.type === "alert") {
            if (onSelectAlert) {
              onSelectAlert(r);
            } else if (r.url) {
              window.open(r.url, "_blank", "noopener,noreferrer");
            }
          } else if (r.type === "topic") {
            onSelectTopic?.(r);
          } else if (r.type === "report") {
            onSelectReport?.(r);
          }
        } catch {
          // swallow — never crash the shell
        }
      }, 0);
    },
    [query, recordRecent, close, onSelectAlert, onSelectTopic, onSelectReport]
  );

  // Flat list of visible results (for keyboard navigation)
  const flatResults = useMemo(() => results, [results]);

  // Grouped results for rendering
  const grouped = useMemo(() => {
    const buckets: Record<SearchResultType, SearchResult[]> = {
      alert: [],
      topic: [],
      report: [],
    };
    for (const r of results) {
      if (buckets[r.type]) buckets[r.type].push(r);
    }
    return buckets;
  }, [results]);

  // Keyboard handler (input-level)
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, Math.max(flatResults.length - 1, 0)));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const r = flatResults[selectedIndex];
        if (r) selectResult(r);
        return;
      }
    },
    [close, flatResults, selectedIndex, selectResult]
  );

  const hasQuery = query.trim().length > 0;
  const showRecent = !hasQuery && recent.length > 0;
  const showEmpty = hasQuery && !loading && !error && results.length === 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global search"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 200,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        fontFamily: FONT.sans,
      }}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          width: "min(640px, calc(100vw - 32px))",
          marginTop: "12vh",
          background: C.surface,
          border: `1px solid ${C.borderLight}`,
          borderRadius: "8px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          overflow: "hidden",
        }}
      >
        {/* ─── SEARCH INPUT ─────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "20px",
            borderBottom: `1px solid ${C.borderLight}`,
          }}
        >
          <SearchGlyph size={18} color={C.textMuted} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search alerts, topics, reports…"
            spellCheck={false}
            autoComplete="off"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontFamily: FONT.mono,
              fontSize: "16px",
              color: C.textPrimary,
              padding: 0,
            }}
          />
          <button
            onClick={close}
            aria-label="Close search"
            style={{
              background: "transparent",
              border: `1px solid ${C.borderLight}`,
              borderRadius: "4px",
              padding: "2px 8px",
              fontFamily: FONT.mono,
              fontSize: "10px",
              color: C.textMuted,
              cursor: "pointer",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = C.textMuted;
              e.currentTarget.style.color = C.textPrimary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = C.borderLight;
              e.currentTarget.style.color = C.textMuted;
            }}
          >
            esc
          </button>
        </div>

        {/* ─── RESULTS ─────────────────────────────────────────── */}
        <div
          ref={listRef}
          style={{
            maxHeight: "400px",
            overflowY: "auto",
          }}
        >
          {/* Loading state */}
          {hasQuery && loading && (
            <div style={{ padding: "32px 20px", textAlign: "center" }}>
              <span style={{ fontFamily: FONT.mono, fontSize: "13px", color: C.textMuted }}>
                Searching…
              </span>
            </div>
          )}

          {/* Error state */}
          {hasQuery && !loading && error && (
            <div style={{ padding: "32px 20px", textAlign: "center" }}>
              <span style={{ fontFamily: FONT.mono, fontSize: "13px", color: C.danger }}>
                {error}
              </span>
            </div>
          )}

          {/* No results state */}
          {showEmpty && (
            <div style={{ padding: "32px 20px", textAlign: "center" }}>
              <span style={{ fontFamily: FONT.mono, fontSize: "13px", color: C.textMuted }}>
                No results found for &ldquo;{query.trim()}&rdquo;
              </span>
            </div>
          )}

          {/* Empty state (no query) */}
          {!hasQuery && !showRecent && (
            <div style={{ padding: "32px 20px", textAlign: "center" }}>
              <span style={{ fontFamily: FONT.mono, fontSize: "13px", color: C.textMuted }}>
                Type to search across alerts, topics, and reports
              </span>
            </div>
          )}

          {/* Recent searches (no active query) */}
          {showRecent && (
            <div>
              <GroupLabel label="Recent searches" />
              {recent.map((q, i) => (
                <div
                  key={`recent-${i}`}
                  data-idx={-1 - i}
                  onClick={() => handleQueryChange(q)}
                  style={{
                    padding: "12px 20px",
                    cursor: "pointer",
                    borderBottom: `1px solid #f4f4f5`,
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontFamily: FONT.mono,
                    fontSize: "13px",
                    color: C.textSecondary,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = C.selectedBg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span aria-hidden style={{ color: C.textFaint, fontFamily: FONT.mono, fontSize: "11px" }}>
                    ↺
                  </span>
                  <span>{q}</span>
                </div>
              ))}
            </div>
          )}

          {/* Grouped results */}
          {hasQuery && !loading && !error && results.length > 0 && (
            <>
              {GROUP_ORDER.map((g) => {
                const items = grouped[g];
                if (!items || items.length === 0) return null;
                return (
                  <div key={g}>
                    <GroupLabel label={GROUP_LABELS[g]} count={items.length} />
                    {items.map((r) => {
                      const flatIdx = flatResults.indexOf(r);
                      const selected = flatIdx === selectedIndex;
                      return (
                        <ResultRow
                          key={`${r.type}-${r.id}`}
                          result={r}
                          selected={selected}
                          flatIdx={flatIdx}
                          onClick={() => selectResult(r)}
                          onMouseEnter={() => setSelectedIndex(flatIdx)}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* ─── FOOTER ──────────────────────────────────────────── */}
        <div
          style={{
            padding: "8px 20px",
            borderTop: `1px solid ${C.borderLight}`,
            fontSize: "10px",
            color: C.textMuted,
            fontFamily: FONT.mono,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            background: C.surfaceAlt,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <span><kbd style={kbdStyle}>↑</kbd><kbd style={kbdStyle}>↓</kbd> navigate</span>
            <span><kbd style={kbdStyle}>↵</kbd> select</span>
            <span><kbd style={kbdStyle}>esc</kbd> close</span>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span>Global search</span>
            <span style={{ color: C.textFaint }}>· ⌘⇧F</span>
          </div>
        </div>
      </div>

      <style>{`
        .gs-scroll::-webkit-scrollbar { width: 8px; }
        .gs-scroll::-webkit-scrollbar-track { background: transparent; }
        .gs-scroll::-webkit-scrollbar-thumb { background: ${C.borderLight}; border-radius: 4px; }
        .gs-scroll::-webkit-scrollbar-thumb:hover { background: ${C.textMuted}; }
      `}</style>
    </div>
  );
}

// ─── GROUP LABEL ──────────────────────────────────────────────────
function GroupLabel({ label, count }: { label: string; count?: number }) {
  return (
    <div
      style={{
        padding: "8px 20px",
        fontSize: "10px",
        fontFamily: FONT.mono,
        color: C.textMuted,
        background: C.groupBg,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        fontWeight: 600,
        borderBottom: `1px solid ${C.borderLight}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span>{label}</span>
      {typeof count === "number" && (
        <span style={{ color: C.textFaint, fontWeight: 400 }}>{count}</span>
      )}
    </div>
  );
}

// ─── RESULT ROW ───────────────────────────────────────────────────
function ResultRow({
  result,
  selected,
  flatIdx,
  onClick,
  onMouseEnter,
}: {
  result: SearchResult;
  selected: boolean;
  flatIdx: number;
  onClick: () => void;
  onMouseEnter: () => void;
}) {
  return (
    <div
      data-idx={flatIdx}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      style={{
        padding: "12px 20px",
        cursor: "pointer",
        borderBottom: "1px solid #f4f4f5",
        background: selected ? C.selectedBg : "transparent",
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
      }}
    >
      <TypeBadge type={result.type} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {result.type === "alert" && (
          <>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: C.textPrimary,
                lineHeight: 1.35,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {result.title}
            </div>
            <div
              style={{
                marginTop: "4px",
                fontSize: "11px",
                fontFamily: FONT.mono,
                color: C.textMuted,
                display: "flex",
                gap: "8px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {result.source && <span>{result.source}</span>}
              {result.date && (
                <>
                  <span style={{ color: C.textFaint }}>·</span>
                  <span>{new Date(result.date).toLocaleDateString("en-US")}</span>
                </>
              )}
              {result.severity && (
                <>
                  <span style={{ color: C.textFaint }}>·</span>
                  <span
                    style={{
                      color: result.severity === "critical" ? C.danger : C.warning,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {result.severity}
                  </span>
                </>
              )}
            </div>
          </>
        )}

        {result.type === "topic" && (
          <>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: C.textPrimary,
                lineHeight: 1.35,
              }}
            >
              {result.label}
            </div>
            <div
              style={{
                marginTop: "4px",
                fontSize: "11px",
                fontFamily: FONT.mono,
                color: C.textMuted,
              }}
            >
              {typeof result.volume === "number" ? `${result.volume} mentions` : "Topic"}
            </div>
          </>
        )}

        {result.type === "report" && (
          <>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: C.textPrimary,
                lineHeight: 1.35,
              }}
            >
              {result.title}
            </div>
            <div
              style={{
                marginTop: "4px",
                fontSize: "11px",
                fontFamily: FONT.mono,
                color: C.textMuted,
              }}
            >
              Period: {result.period}
            </div>
          </>
        )}
      </div>

      {result.type === "alert" && result.url && (
        <span
          aria-hidden
          style={{
            fontFamily: FONT.mono,
            fontSize: "11px",
            color: C.textFaint,
            flexShrink: 0,
            marginTop: "2px",
          }}
        >
          ↗
        </span>
      )}
    </div>
  );
}

// ─── TYPE BADGE ───────────────────────────────────────────────────
function TypeBadge({ type }: { type: SearchResultType }) {
  return (
    <span
      style={{
        fontSize: "9px",
        fontFamily: FONT.mono,
        textTransform: "uppercase",
        padding: "2px 6px",
        borderRadius: "2px",
        background: "#f4f4f5",
        color: "#737373",
        letterSpacing: "0.08em",
        fontWeight: 600,
        flexShrink: 0,
        marginTop: "2px",
      }}
    >
      {type}
    </span>
  );
}

// ─── SEARCH GLYPH ─────────────────────────────────────────────────
function SearchGlyph({ size = 16, color = "#737373" }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

// ─── SHARED kbd STYLE ─────────────────────────────────────────────
const kbdStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "1px 5px",
  margin: "0 2px",
  border: `1px solid ${TOKENS.border}`,
  borderRadius: "3px",
  background: TOKENS.bg,
  fontFamily: TOKENS.fontMono,
  fontSize: "9px",
  color: TOKENS.textBody,
  lineHeight: 1.4,
};

export default GlobalSearch;
