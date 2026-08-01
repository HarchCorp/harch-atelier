"use client";

import { useCallback, useEffect, useState } from "react";
import { C } from "../components/tokens";

// ═══════════════════════════════════════════════════════════════
//  SOURCE HEALTH — Media Monitoring admin panel
//
//  Renders a per-source health table for every feed in MOROCCAN_FEEDS.
//  Each row shows:
//    • name + region + fetchKind badge
//    • URL (truncated, hover to see full)
//    • status badge (active / stale / erroring / dead / never)
//    • last scrape time + duration
//    • articles ingested (total in DB)
//    • error count (24h / 7d)
//    • "Test feed" button → POST /api/admin/source-health?source=…
//
//  Color coding:
//    active   → green  (C.success / emerald-500)
//    stale    → amber  (C.warning / amber-500)
//    erroring → red    (C.danger / red-500)
//    dead     → gray   (C.textMuted / neutral-500)
//    never    → gray   (C.textMuted / neutral-500)
//
//  Task ID: signal-media-monitoring
// ═══════════════════════════════════════════════════════════════

type SourceStatus =
  | "active"
  | "stale"
  | "erroring"
  | "dead"
  | "never";

interface SourceHealthRow {
  name: string;
  url: string;
  language: "ar" | "fr" | "en";
  category: string;
  region?: string;
  fetchKind?: "direct" | "google-news";
  isActive: boolean;
  notes?: string;

  status: SourceStatus;
  lastScrapeAt: string | null;
  lastSuccessAt: string | null;
  lastErrorAt: string | null;
  lastErrorMessage: string | null;
  lastDurationMs: number | null;
  lastArticlesFound: number;
  lastArticlesNew: number;

  articlesIngested: number;
  errorCount24h: number;
  errorCount7d: number;
  avgDurationMs: number | null;
}

interface SourceHealthSummary {
  totalSources: number;
  activeSources: number;
  staleSources: number;
  erroringSources: number;
  deadSources: number;
  neverSources: number;
  totalArticlesIngested: number;
  feedsDirect: number;
  feedsGoogleNews: number;
}

interface SourceHealthResponse {
  success: boolean;
  summary: SourceHealthSummary;
  sources: SourceHealthRow[];
  error?: string;
}

interface TestFeedResponse {
  success: boolean;
  result?: {
    success: boolean;
    source: string;
    articlesFound: number;
    articlesNew: number;
    articlesMatched: number;
    durationMs: number;
    firstTitles: string[];
    error?: string;
  };
  error?: string;
}

// ─── HELPERS ──────────────────────────────────────────────────────

function statusColor(status: SourceStatus): string {
  switch (status) {
    case "active":
      return C.success;       // emerald-500
    case "stale":
      return C.warning;       // amber-500
    case "erroring":
      return C.danger;        // red-500
    case "dead":
    case "never":
    default:
      return C.textMuted;     // neutral-500
  }
}

function statusBg(status: SourceStatus): string {
  switch (status) {
    case "active":
      return C.successBg;     // emerald-50
    case "stale":
      return C.warningBg;     // amber-50
    case "erroring":
      return C.dangerBg;      // red-50
    case "dead":
    case "never":
    default:
      return C.bgHover;       // neutral-100
  }
}

function statusLabel(status: SourceStatus): string {
  switch (status) {
    case "active":
      return "Active";
    case "stale":
      return "Stale";
    case "erroring":
      return "Erroring";
    case "dead":
      return "Disabled";
    case "never":
      return "Never scraped";
    default:
      return status;
  }
}

function fmtAgo(iso: string | null): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (isNaN(then)) return "—";
  const diff = Date.now() - then;
  if (diff < 0) return "just now";
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

function fmtDuration(ms: number | null): string {
  if (ms === null || ms === undefined) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function truncateMiddle(url: string, max: number): string {
  if (url.length <= max) return url;
  const head = Math.floor(max * 0.6);
  const tail = max - head - 1;
  return `${url.slice(0, head)}…${url.slice(-tail)}`;
}

const CATEGORY_LABEL: Record<string, string> = {
  news: "News",
  business: "Business",
  tech: "Tech",
  finance: "Finance",
  regulatory: "Regulatory",
};

// ─── COMPONENT ────────────────────────────────────────────────────

export function SourceHealth() {
  const [data, setData] = useState<SourceHealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testingSource, setTestingSource] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    source: string;
    ok: boolean;
    message: string;
  } | null>(null);
  const [filter, setFilter] = useState<"all" | SourceStatus>("all");

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/source-health", { cache: "no-store" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const json = (await res.json()) as SourceHealthResponse;
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  const handleTestFeed = async (sourceName: string) => {
    if (testingSource) return;
    setTestingSource(sourceName);
    setTestResult(null);
    try {
      const res = await fetch(
        `/api/admin/source-health?source=${encodeURIComponent(sourceName)}`,
        { method: "POST" },
      );
      const json = (await res.json()) as TestFeedResponse;
      if (res.ok && json.success && json.result) {
        const r = json.result;
        const ok = r.success;
        const message = ok
          ? `${r.articlesFound} found · ${r.articlesNew} new · ${r.articlesMatched} matched in ${fmtDuration(r.durationMs)}`
          : `Failed: ${r.error || "unknown error"}`;
        setTestResult({ source: sourceName, ok, message });
        // Refresh the table to reflect the new ScraperLog row + ingested articles
        fetchHealth();
      } else {
        setTestResult({
          source: sourceName,
          ok: false,
          message: json.error || `HTTP ${res.status}`,
        });
      }
    } catch (err) {
      setTestResult({
        source: sourceName,
        ok: false,
        message: err instanceof Error ? err.message : "Network error",
      });
    } finally {
      setTestingSource(null);
      // Auto-clear the result after 8s so it doesn't linger
      setTimeout(() => {
        setTestResult((cur) => (cur?.source === sourceName ? null : cur));
      }, 8000);
    }
  };

  // ─── RENDER ─────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ color: C.textMuted, fontFamily: C.fontMono, fontSize: "13px" }}>
        Loading source health…
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div style={{ color: C.danger, fontFamily: C.fontMono, fontSize: "13px", marginBottom: "12px" }}>
          Error: {error}
        </div>
        <button
          onClick={fetchHealth}
          style={{
            padding: "8px 16px",
            background: C.bg,
            border: `1px solid ${C.borderStrong}`,
            borderRadius: "6px",
            color: C.text,
            fontFamily: C.fontSans,
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const summary = data.summary;
  const sources = data.sources;
  const filteredSources =
    filter === "all"
      ? sources
      : sources.filter((s) => s.status === filter);

  // ─── KPI strip ──────────────────────────────────────────────────
  const kpis: { label: string; value: string | number; color?: string }[] = [
    { label: "Total sources", value: summary.totalSources },
    { label: "Active", value: summary.activeSources, color: C.success },
    { label: "Stale", value: summary.staleSources, color: C.warning },
    { label: "Erroring", value: summary.erroringSources, color: C.danger },
    { label: "Disabled", value: summary.deadSources, color: C.textMuted },
    { label: "Articles ingested", value: summary.totalArticlesIngested.toLocaleString() },
    { label: "Direct feeds", value: summary.feedsDirect },
    { label: "Google News proxies", value: summary.feedsGoogleNews },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            fontFamily: C.fontMono,
            fontSize: "10px",
            color: C.textMuted,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            marginBottom: "6px",
          }}
        >
          Media Monitoring · Source Health
        </div>
        <h2
          style={{
            fontSize: "22px",
            fontWeight: 700,
            color: C.text,
            margin: "0 0 6px",
          }}
        >
          {summary.totalSources} sources · {summary.activeSources} active
        </h2>
        <p
          style={{
            fontSize: "13px",
            color: C.textBody,
            margin: 0,
            maxWidth: "760px",
            lineHeight: 1.5,
          }}
        >
          Real-time health of every RSS feed the cron scraper polls. Click{" "}
          <em>Test feed</em> to fetch + ingest one source on demand — useful
          for debugging 403s / 404s without waiting for the next cron tick.
        </p>
      </div>

      {/* KPI strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "8px",
          marginBottom: "24px",
        }}
      >
        {kpis.map((k) => (
          <div
            key={k.label}
            style={{
              background: C.bgSubtle,
              border: `1px solid ${C.border}`,
              borderRadius: "8px",
              padding: "12px 14px",
            }}
          >
            <div
              style={{
                fontFamily: C.fontMono,
                fontSize: "9px",
                color: C.textMuted,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "4px",
              }}
            >
              {k.label}
            </div>
            <div
              style={{
                fontFamily: C.fontMono,
                fontSize: "18px",
                fontWeight: 700,
                color: k.color ?? C.text,
              }}
            >
              {k.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          marginBottom: "12px",
          flexWrap: "wrap",
        }}
      >
        {(["all", "active", "stale", "erroring", "dead", "never"] as const).map(
          (f) => {
            const active = filter === f;
            const count =
              f === "all"
                ? sources.length
                : sources.filter((s) => s.status === f).length;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "6px 12px",
                  background: active ? C.text : C.bg,
                  border: `1px solid ${active ? C.text : C.borderStrong}`,
                  borderRadius: "999px",
                  color: active ? "#fff" : C.textBody,
                  fontFamily: C.fontMono,
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                {f === "all" ? "All" : statusLabel(f)} · {count}
              </button>
            );
          },
        )}
      </div>

      {/* Test-feed toast */}
      {testResult && (
        <div
          style={{
            marginBottom: "12px",
            padding: "10px 14px",
            background: testResult.ok ? C.successBg : C.dangerBg,
            border: `1px solid ${testResult.ok ? C.success : C.danger}`,
            borderRadius: "6px",
            fontFamily: C.fontMono,
            fontSize: "12px",
            color: testResult.ok ? C.text : C.danger,
          }}
        >
          <strong>{testResult.source}:</strong> {testResult.message}
        </div>
      )}

      {/* Source table */}
      <div
        style={{
          border: `1px solid ${C.border}`,
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(200px, 2fr) minmax(180px, 1.5fr) 110px 130px 110px 110px 130px",
            background: C.bgSubtle,
            borderBottom: `1px solid ${C.border}`,
            padding: "10px 14px",
            fontFamily: C.fontMono,
            fontSize: "10px",
            color: C.textMuted,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            fontWeight: 600,
            gap: "12px",
            alignItems: "center",
          }}
        >
          <div>Source</div>
          <div>URL</div>
          <div>Status</div>
          <div>Last scrape</div>
          <div>Articles</div>
          <div>Errors 24h / 7d</div>
          <div style={{ textAlign: "right" }}>Action</div>
        </div>

        {/* Body */}
        <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {filteredSources.length === 0 ? (
            <div
              style={{
                padding: "32px 14px",
                textAlign: "center",
                color: C.textMuted,
                fontFamily: C.fontMono,
                fontSize: "12px",
              }}
            >
              No sources match this filter.
            </div>
          ) : (
            filteredSources.map((s) => {
              const color = statusColor(s.status);
              const bg = statusBg(s.status);
              const isTesting = testingSource === s.name;
              return (
                <div
                  key={s.name}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "minmax(200px, 2fr) minmax(180px, 1.5fr) 110px 130px 110px 110px 130px",
                    padding: "14px",
                    borderBottom: `1px solid ${C.border}`,
                    gap: "12px",
                    alignItems: "center",
                    fontFamily: C.fontSans,
                    fontSize: "12px",
                    color: C.text,
                  }}
                >
                  {/* Source name + meta */}
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                      {s.name}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "6px",
                        flexWrap: "wrap",
                      }}
                    >
                      <Pill label={s.region || "—"} muted />
                      <Pill label={s.language.toUpperCase()} muted />
                      <Pill
                        label={CATEGORY_LABEL[s.category] || s.category}
                        muted
                      />
                      <Pill
                        label={
                          s.fetchKind === "google-news"
                            ? "Google News"
                            : "Direct"
                        }
                        accent
                      />
                    </div>
                    {s.notes && (
                      <div
                        title={s.notes}
                        style={{
                          marginTop: "6px",
                          fontSize: "11px",
                          color: C.textMuted,
                          fontFamily: C.fontMono,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "100%",
                        }}
                      >
                        {s.notes}
                      </div>
                    )}
                  </div>

                  {/* URL */}
                  <div
                    title={s.url}
                    style={{
                      fontFamily: C.fontMono,
                      fontSize: "11px",
                      color: C.textBody,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "inherit", textDecoration: "none" }}
                    >
                      {truncateMiddle(s.url, 50)}
                    </a>
                  </div>

                  {/* Status badge */}
                  <div>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 8px",
                        background: bg,
                        color,
                        border: `1px solid ${color}`,
                        borderRadius: "999px",
                        fontFamily: C.fontMono,
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      {statusLabel(s.status)}
                    </span>
                    {s.avgDurationMs !== null && (
                      <div
                        style={{
                          marginTop: "4px",
                          fontFamily: C.fontMono,
                          fontSize: "10px",
                          color: C.textMuted,
                        }}
                      >
                        avg {fmtDuration(s.avgDurationMs)}
                      </div>
                    )}
                  </div>

                  {/* Last scrape */}
                  <div>
                    <div
                      style={{
                        fontFamily: C.fontMono,
                        fontSize: "11px",
                        color: C.text,
                      }}
                    >
                      {fmtAgo(s.lastScrapeAt)}
                    </div>
                    <div
                      style={{
                        fontFamily: C.fontMono,
                        fontSize: "10px",
                        color: C.textMuted,
                      }}
                    >
                      {fmtDuration(s.lastDurationMs)} ·{" "}
                      {s.lastArticlesFound} found
                    </div>
                  </div>

                  {/* Articles ingested */}
                  <div>
                    <div
                      style={{
                        fontFamily: C.fontMono,
                        fontSize: "13px",
                        fontWeight: 700,
                        color: C.text,
                      }}
                    >
                      {s.articlesIngested.toLocaleString()}
                    </div>
                    <div
                      style={{
                        fontFamily: C.fontMono,
                        fontSize: "10px",
                        color: C.textMuted,
                      }}
                    >
                      {s.lastArticlesNew} new last
                    </div>
                  </div>

                  {/* Errors */}
                  <div>
                    <div
                      style={{
                        fontFamily: C.fontMono,
                        fontSize: "11px",
                        color: s.errorCount24h > 0 ? C.danger : C.textMuted,
                        fontWeight: s.errorCount24h > 0 ? 700 : 400,
                      }}
                    >
                      24h: {s.errorCount24h}
                    </div>
                    <div
                      style={{
                        fontFamily: C.fontMono,
                        fontSize: "11px",
                        color: s.errorCount7d > 0 ? C.warning : C.textMuted,
                      }}
                    >
                      7d: {s.errorCount7d}
                    </div>
                    {s.lastErrorMessage && (
                      <div
                        title={s.lastErrorMessage}
                        style={{
                          marginTop: "4px",
                          fontFamily: C.fontMono,
                          fontSize: "10px",
                          color: C.danger,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "100%",
                        }}
                      >
                        {s.lastErrorMessage}
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  <div style={{ textAlign: "right" }}>
                    <button
                      onClick={() => handleTestFeed(s.name)}
                      disabled={isTesting || !s.isActive}
                      style={{
                        padding: "6px 12px",
                        background: isTesting ? C.bgHover : C.text,
                        border: `1px solid ${C.text}`,
                        borderRadius: "6px",
                        color: isTesting ? C.textMuted : "#fff",
                        fontFamily: C.fontMono,
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        cursor: isTesting || !s.isActive ? "not-allowed" : "pointer",
                        opacity: !s.isActive ? 0.4 : 1,
                      }}
                    >
                      {isTesting ? "Testing…" : "Test feed"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Refresh button */}
      <div style={{ marginTop: "16px", display: "flex", gap: "12px" }}>
        <button
          onClick={fetchHealth}
          style={{
            padding: "8px 16px",
            background: C.bg,
            border: `1px solid ${C.borderStrong}`,
            borderRadius: "6px",
            color: C.text,
            fontFamily: C.fontSans,
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Refresh
        </button>
      </div>
    </div>
  );
}

// ─── PILL SUB-COMPONENT ───────────────────────────────────────────

function Pill({
  label,
  muted = false,
  accent = false,
}: {
  label: string;
  muted?: boolean;
  accent?: boolean;
}) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 6px",
        background: accent ? "rgba(120,113,108,0.10)" : "transparent",
        border: `1px solid ${accent ? C.accent : C.border}`,
        borderRadius: "4px",
        fontFamily: C.fontMono,
        fontSize: "9px",
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: accent ? C.accentHover : muted ? C.textMuted : C.textBody,
      }}
    >
      {label}
    </span>
  );
}
