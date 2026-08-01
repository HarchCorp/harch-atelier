"use client";

// ═══════════════════════════════════════════════════════════════
//  BriefingArchive — searchable list of past HarchIQ briefings
//
//  Renders the user's last ~60 daily briefings with:
//    • date · title · key insight · confidence bar
//    • click a row → opens the full briefing in a modal
//    • "Re-deliver" button → POSTs to /api/console/briefing/deliver
//      with channels=["whatsapp","in_app","webhook"] to re-push the
//      briefing via WhatsApp + in-app + webhook
//    • search box + date-range filter (from / to)
//
//  Task: dataminr-briefings-compliance — Dataminr lets compliance
//  teams audit every AI-generated briefing ever produced; this view
//  gives HarchIQ the same audit trail with one-click re-delivery.
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { C } from "../../components/tokens";

const FONT = { sans: C.fontSans, mono: C.fontMono };

// ─── Types (mirror the API response) ────────────────────────────

interface BriefingListRow {
  id: string;
  date: string;
  title: string;
  summary: string;
  status: string;
  model: string | null;
  alertCount: number;
  citedCount: number;
  confidence: number | null;
  topThreatCount: number;
  topOpportunityCount: number;
  createdAt: string;
  updatedAt: string;
  companyName: string | null;
}

interface BriefingListResponse {
  briefings: BriefingListRow[];
  total: number;
}

// ─── Modal payload (fetched from /api/console/briefing?date=...) ─

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

interface BriefingRecommendedAction {
  text: string;
  owner?: string;
  slaHours?: number;
  alertId?: string | null;
}

interface BriefingSourceRef {
  id: string;
  title: string;
  source: string;
  url: string | null;
  severity: string;
  publishedAt: string | null;
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
    sentimentBaseline7d?: number | null;
    sentimentToday?: number | null;
    sectorAverage?: number | null;
    volumeDeltaPct?: number | null;
  };
}

// ─── Component ──────────────────────────────────────────────────

export interface BriefingArchiveProps {
  className?: string;
}

export function BriefingArchive({ className }: BriefingArchiveProps) {
  const [rows, setRows] = useState<BriefingListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [openDate, setOpenDate] = useState<string | null>(null);
  const [openPayload, setOpenPayload] = useState<BriefingPayload | null>(null);
  const [openLoading, setOpenLoading] = useState(false);
  const [openError, setOpenError] = useState<string | null>(null);
  const [redeliveringId, setRedeliveringId] = useState<string | null>(null);
  const [redeliverMsg, setRedeliverMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      params.set("limit", "120");
      const res = await fetch(`/api/console/briefing/list?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const json = (await res.json()) as BriefingListResponse;
      setRows(json.briefings ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load briefings");
    } finally {
      setLoading(false);
    }
  }, [search, from, to]);

  useEffect(() => {
    load();
  }, [load]);

  const openBriefing = useCallback(async (date: string) => {
    setOpenDate(date);
    setOpenPayload(null);
    setOpenError(null);
    setOpenLoading(true);
    try {
      const res = await fetch(`/api/console/briefing?date=${encodeURIComponent(date)}`, { cache: "no-store" });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const json = (await res.json()) as { briefing?: BriefingPayload };
      setOpenPayload(json.briefing ?? null);
    } catch (err) {
      setOpenError(err instanceof Error ? err.message : "Failed to load briefing");
    } finally {
      setOpenLoading(false);
    }
  }, []);

  const closeBriefing = useCallback(() => {
    setOpenDate(null);
    setOpenPayload(null);
    setOpenError(null);
  }, []);

  const redeliver = useCallback(async (row: BriefingListRow) => {
    setRedeliveringId(row.id);
    setRedeliverMsg(null);
    try {
      const res = await fetch("/api/console/briefing/deliver", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          dateKey: row.date,
          channels: ["whatsapp", "in_app", "webhook"],
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const j = (await res.json()) as { channels?: Array<{ channel: string; status: string }> };
      const summary = (j.channels ?? [])
        .map((c) => `${c.channel}:${c.status}`)
        .join(" · ");
      setRedeliverMsg(`Re-delivered: ${summary}`);
    } catch (err) {
      setRedeliverMsg(`Re-delivery failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setRedeliveringId(null);
      // Auto-clear the message after 6 seconds.
      setTimeout(() => setRedeliverMsg(null), 6000);
    }
  }, []);

  // Esc to close the modal.
  useEffect(() => {
    if (!openDate) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeBriefing();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openDate, closeBriefing]);

  const summaryStats = useMemo(() => {
    const total = rows.length;
    const ready = rows.filter((r) => r.status === "ready").length;
    const avgConfidence =
      total > 0
        ? rows.reduce((s, r) => s + (r.confidence ?? 0), 0) / total
        : 0;
    const totalAlerts = rows.reduce((s, r) => s + r.alertCount, 0);
    const totalCited = rows.reduce((s, r) => s + r.citedCount, 0);
    return { total, ready, avgConfidence, totalAlerts, totalCited };
  }, [rows]);

  const ACCENT = "#1e3a8a"; // institutional navy (Investor Desk)

  return (
    <section
      className={className}
      aria-label="Briefing Archive"
      role="region"
      style={{
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: 6,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: `1px solid ${C.border}`,
          background: C.bgSubtle,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontFamily: FONT.mono,
            color: ACCENT,
            letterSpacing: "0.14em",
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          HARCHIQ · BRIEFING ARCHIVE
        </div>
        <h3
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: C.text,
            margin: "4px 0 0 0",
            letterSpacing: "-0.01em",
          }}
        >
          Daily Intelligence Briefings — Audit Trail
        </h3>
        <div
          style={{
            fontSize: 11,
            fontFamily: FONT.mono,
            color: C.textMuted,
            marginTop: 4,
            display: "flex",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <span>{summaryStats.total} briefings</span>
          <span>{summaryStats.ready} ready</span>
          <span>Avg confidence: {(summaryStats.avgConfidence * 100).toFixed(0)}%</span>
          <span>{summaryStats.totalAlerts} alerts analysed</span>
          <span>{summaryStats.totalCited} cited</span>
        </div>
      </div>

      {/* Filters */}
      <div
        style={{
          padding: "12px 20px",
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="Search title or summary..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: "1 1 220px",
            minWidth: 180,
            padding: "6px 10px",
            fontSize: 12,
            fontFamily: FONT.sans,
            border: `1px solid ${C.border}`,
            borderRadius: 3,
            background: C.bg,
            color: C.text,
            outline: "none",
          }}
        />
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 10,
            fontFamily: FONT.mono,
            color: C.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          From
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            style={{
              padding: "4px 8px",
              fontSize: 11,
              fontFamily: FONT.mono,
              border: `1px solid ${C.border}`,
              borderRadius: 3,
              background: C.bg,
              color: C.text,
            }}
          />
        </label>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 10,
            fontFamily: FONT.mono,
            color: C.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          To
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            style={{
              padding: "4px 8px",
              fontSize: 11,
              fontFamily: FONT.mono,
              border: `1px solid ${C.border}`,
              borderRadius: 3,
              background: C.bg,
              color: C.text,
            }}
          />
        </label>
        <button
          type="button"
          onClick={() => {
            setSearch("");
            setFrom("");
            setTo("");
          }}
          style={{
            padding: "6px 10px",
            fontSize: 10,
            fontFamily: FONT.mono,
            fontWeight: 700,
            border: `1px solid ${C.border}`,
            borderRadius: 3,
            background: C.bg,
            color: C.textMuted,
            cursor: "pointer",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Reset
        </button>
      </div>

      {/* Re-deliver toast */}
      {redeliverMsg && (
        <div
          style={{
            padding: "8px 20px",
            background: C.bgSubtle,
            borderBottom: `1px solid ${C.border}`,
            fontSize: 11,
            fontFamily: FONT.mono,
            color: redeliverMsg.startsWith("Re-delivery failed")
              ? "#ef4444"
              : ACCENT,
          }}
        >
          {redeliverMsg}
        </div>
      )}

      {/* List */}
      <div
        style={{
          maxHeight: "70vh",
          overflowY: "auto",
        }}
      >
        {loading && (
          <div
            style={{
              padding: 32,
              textAlign: "center",
              fontSize: 12,
              color: C.textMuted,
              fontFamily: FONT.mono,
            }}
          >
            Loading briefings…
          </div>
        )}
        {error && (
          <div
            style={{
              margin: 16,
              padding: 12,
              borderLeft: `3px solid #ef4444`,
              background: "rgba(239,68,68,0.04)",
              fontSize: 12,
              color: C.textBody,
              borderRadius: 3,
            }}
          >
            {error}
          </div>
        )}
        {!loading && !error && rows.length === 0 && (
          <div
            style={{
              padding: 32,
              textAlign: "center",
              fontSize: 12,
              color: C.textMuted,
              fontFamily: FONT.mono,
            }}
          >
            No briefings match your filters.
          </div>
        )}
        {!loading && !error && rows.length > 0 && (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 12,
              fontFamily: FONT.sans,
            }}
          >
            <thead>
              <tr
                style={{
                  background: C.bgSubtle,
                  borderBottom: `1px solid ${C.border}`,
                  textAlign: "left",
                }}
              >
                {["Date", "Title / Key Insight", "Confidence", "Threats", "Cited", "Model", "Actions"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "8px 12px",
                      fontSize: 9,
                      fontFamily: FONT.mono,
                      color: C.textMuted,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      fontWeight: 700,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  style={{
                    borderBottom: `1px solid ${C.border}`,
                    cursor: "pointer",
                    transition: "background 0.15s ease",
                  }}
                  onClick={() => openBriefing(r.date)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background = C.bgHover;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background = "transparent";
                  }}
                >
                  <td
                    style={{
                      padding: "10px 12px",
                      fontFamily: FONT.mono,
                      fontSize: 11,
                      color: C.textBody,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.date}
                  </td>
                  <td style={{ padding: "10px 12px", maxWidth: 360 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: C.text,
                        marginBottom: 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: C.textMuted,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.summary}
                    </div>
                  </td>
                  <td style={{ padding: "10px 12px", minWidth: 120 }}>
                    <ConfidenceBar value={r.confidence} accent={ACCENT} />
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      fontFamily: FONT.mono,
                      fontSize: 11,
                      color: r.topThreatCount > 0 ? "#ef4444" : C.textMuted,
                      fontWeight: 700,
                    }}
                  >
                    {r.topThreatCount}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      fontFamily: FONT.mono,
                      fontSize: 11,
                      color: C.textBody,
                    }}
                  >
                    {r.citedCount}/{r.alertCount}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      fontFamily: FONT.mono,
                      fontSize: 10,
                      color: C.textMuted,
                    }}
                  >
                    {r.model ?? "—"}
                  </td>
                  <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                    <button
                      type="button"
                      disabled={redeliveringId === r.id || r.status !== "ready"}
                      onClick={(e) => {
                        e.stopPropagation();
                        redeliver(r);
                      }}
                      style={{
                        padding: "5px 10px",
                        fontSize: 10,
                        fontFamily: FONT.mono,
                        fontWeight: 700,
                        border: `1px solid ${ACCENT}`,
                        borderRadius: 3,
                        background: "transparent",
                        color: ACCENT,
                        cursor: redeliveringId === r.id ? "wait" : "pointer",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        opacity: redeliveringId === r.id || r.status !== "ready" ? 0.5 : 1,
                      }}
                      title="Re-deliver this briefing via WhatsApp + in-app + webhook"
                    >
                      {redeliveringId === r.id ? "Sending…" : "Re-deliver"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ─── Full briefing modal ─── */}
      {openDate && (
        <BriefingModal
          date={openDate}
          payload={openPayload}
          loading={openLoading}
          error={openError}
          accent={ACCENT}
          onClose={closeBriefing}
        />
      )}

      {/* Custom scrollbar */}
      <style>{`
        section[aria-label="Briefing Archive"] ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        section[aria-label="Briefing Archive"] ::-webkit-scrollbar-track {
          background: transparent;
        }
        section[aria-label="Briefing Archive"] ::-webkit-scrollbar-thumb {
          background: ${C.border};
          border-radius: 3px;
        }
      `}</style>
    </section>
  );
}

// ─── ConfidenceBar ─────────────────────────────────────────────

function ConfidenceBar({ value, accent }: { value: number | null; accent: string }) {
  const v = value ?? 0;
  const pct = Math.round(v * 100);
  const color = v >= 0.7 ? "#10b981" : v >= 0.4 ? accent : "#ef4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div
        style={{
          flex: 1,
          maxWidth: 80,
          height: 4,
          background: C.bgHover,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: color,
            transition: "width 0.4s ease",
          }}
        />
      </div>
      <span
        style={{
          fontFamily: FONT.mono,
          fontSize: 10,
          color: C.textBody,
          fontWeight: 700,
          minWidth: 28,
        }}
      >
        {pct}%
      </span>
    </div>
  );
}

// ─── BriefingModal ─────────────────────────────────────────────

function BriefingModal({
  date,
  payload,
  loading,
  error,
  accent,
  onClose,
}: {
  date: string;
  payload: BriefingPayload | null;
  loading: boolean;
  error: string | null;
  accent: string;
  onClose: () => void;
}) {
  const modalStyle: CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(4px)",
    zIndex: 250,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "5vh 16px 16px",
    overflowY: "auto",
  };
  const panelStyle: CSSProperties = {
    background: C.bg,
    border: `1px solid ${C.border}`,
    borderRadius: 6,
    padding: 24,
    width: "100%",
    maxWidth: 720,
    boxShadow: "0 16px 48px rgba(0,0,0,0.18)",
    fontFamily: FONT.sans,
    position: "relative",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Briefing for ${date}`}
      onClick={onClose}
      style={modalStyle}
    >
      <div onClick={(e) => e.stopPropagation()} style={panelStyle}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 16,
            paddingBottom: 12,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                fontFamily: FONT.mono,
                color: accent,
                letterSpacing: "0.14em",
                fontWeight: 700,
              }}
            >
              HARCHIQ DAILY BRIEFING
            </div>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: C.text,
                margin: "4px 0 0 0",
                letterSpacing: "-0.01em",
              }}
            >
              {date}
              {payload?.metadata?.companyName ? ` — ${payload.metadata.companyName}` : ""}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "transparent",
              border: `1px solid ${C.border}`,
              borderRadius: 3,
              width: 28,
              height: 28,
              cursor: "pointer",
              color: C.textMuted,
              fontSize: 14,
              lineHeight: 1,
            }}
          >
            {"\u00d7"}
          </button>
        </div>

        {loading && (
          <div style={{ padding: 24, textAlign: "center", fontSize: 12, color: C.textMuted, fontFamily: FONT.mono }}>
            Loading briefing…
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
        {payload && !loading && !error && (
          <BriefingModalBody payload={payload} accent={accent} />
        )}
      </div>
    </div>
  );
}

function BriefingModalBody({ payload, accent }: { payload: BriefingPayload; accent: string }) {
  return (
    <div>
      {/* Executive summary */}
      <div
        style={{
          padding: "12px 14px",
          borderLeft: `3px solid ${accent}`,
          background: C.bgSubtle,
          borderRadius: 3,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 9,
            fontFamily: FONT.mono,
            color: accent,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 6,
            fontWeight: 700,
          }}
        >
          Executive summary
        </div>
        <p style={{ fontSize: 13, color: C.text, lineHeight: 1.6, margin: 0 }}>
          {payload.executiveSummary}
        </p>
      </div>

      {/* Timeline + benchmark */}
      {(payload.timelineContext || payload.competitiveBenchmark) && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 10,
            marginBottom: 16,
          }}
        >
          {payload.timelineContext && (
            <div style={{ padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 3 }}>
              <div
                style={{
                  fontSize: 9,
                  fontFamily: FONT.mono,
                  color: C.textMuted,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                Timeline context
              </div>
              <div style={{ fontSize: 12, color: C.textBody, lineHeight: 1.5 }}>
                {payload.timelineContext}
              </div>
            </div>
          )}
          {payload.competitiveBenchmark && (
            <div style={{ padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 3 }}>
              <div
                style={{
                  fontSize: 9,
                  fontFamily: FONT.mono,
                  color: C.textMuted,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                Competitive benchmark
              </div>
              <div style={{ fontSize: 12, color: C.textBody, lineHeight: 1.5 }}>
                {payload.competitiveBenchmark}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Threats + Opportunities */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 10,
          marginBottom: 16,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 9,
              fontFamily: FONT.mono,
              color: "#ef4444",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 6,
              fontWeight: 700,
            }}
          >
            Top threats ({payload.topThreats.length})
          </div>
          {payload.topThreats.length === 0 ? (
            <div style={{ fontSize: 11, color: C.textMuted, fontFamily: FONT.mono }}>
              None detected.
            </div>
          ) : (
            payload.topThreats.map((t, i) => (
              <CitedItem key={`t-${i}`} item={t} borderColor="#ef4444" />
            ))
          )}
        </div>
        <div>
          <div
            style={{
              fontSize: 9,
              fontFamily: FONT.mono,
              color: "#10b981",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 6,
              fontWeight: 700,
            }}
          >
            Top opportunities ({payload.topOpportunities.length})
          </div>
          {payload.topOpportunities.length === 0 ? (
            <div style={{ fontSize: 11, color: C.textMuted, fontFamily: FONT.mono }}>
              None surfaced.
            </div>
          ) : (
            payload.topOpportunities.map((o, i) => (
              <CitedItem key={`o-${i}`} item={o} borderColor="#10b981" />
            ))
          )}
        </div>
      </div>

      {/* Recommended actions */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 9,
            fontFamily: FONT.mono,
            color: accent,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 6,
            fontWeight: 700,
          }}
        >
          Recommended actions ({payload.recommendedActions.length})
        </div>
        <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {payload.recommendedActions.map((a, i) => (
            <li
              key={i}
              style={{
                display: "flex",
                gap: 10,
                padding: "8px 0",
                borderBottom: i < payload.recommendedActions.length - 1 ? `1px solid ${C.border}` : "none",
                fontSize: 12,
                color: C.text,
                lineHeight: 1.5,
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  width: 20,
                  height: 20,
                  borderRadius: 3,
                  background: accent,
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontFamily: FONT.mono,
                  fontWeight: 700,
                }}
              >
                {i + 1}
              </span>
              <span style={{ flex: 1 }}>
                <span style={{ display: "block" }}>{a.text}</span>
                {(a.owner || a.slaHours) && (
                  <span
                    style={{
                      display: "block",
                      marginTop: 3,
                      fontSize: 9,
                      fontFamily: FONT.mono,
                      color: C.textMuted,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    {a.owner ? `Owner: ${a.owner}` : ""}
                    {a.owner && a.slaHours ? " · " : ""}
                    {a.slaHours ? `SLA: ${a.slaHours}h` : ""}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Sources */}
      {payload.sources.length > 0 && (
        <div>
          <div
            style={{
              fontSize: 9,
              fontFamily: FONT.mono,
              color: C.textMuted,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 6,
              fontWeight: 700,
            }}
          >
            Cited sources ({payload.sources.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 200, overflowY: "auto" }}>
            {payload.sources.map((s) => (
              <div
                key={s.id}
                style={{
                  display: "flex",
                  gap: 6,
                  padding: "4px 6px",
                  background: C.bgSubtle,
                  borderRadius: 2,
                  borderLeft: `2px solid ${C.border}`,
                  fontSize: 11,
                }}
              >
                <span style={{ fontFamily: FONT.mono, fontSize: 9, color: accent, fontWeight: 700, minWidth: 50 }}>
                  {s.severity.toUpperCase()}
                </span>
                <span
                  style={{
                    color: C.textBody,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1,
                  }}
                  title={s.title}
                >
                  {s.title}
                </span>
                <span style={{ fontFamily: FONT.mono, fontSize: 9, color: C.textMuted }}>{s.source}</span>
                {s.url && (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 10, color: accent, textDecoration: "none", flexShrink: 0 }}
                  >
                    {"\u2197"}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confidence footer */}
      {typeof payload.confidence === "number" && (
        <div
          style={{
            marginTop: 16,
            paddingTop: 12,
            borderTop: `1px solid ${C.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 10,
            fontFamily: FONT.mono,
            color: C.textMuted,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          <span>
            Model: {payload.metadata?.model ?? "—"}
          </span>
          <span>
            Confidence: {Math.round(payload.confidence * 100)}%
          </span>
          <span>
            Generated: {payload.metadata?.generatedAt
              ? new Date(payload.metadata.generatedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
              : "—"}
          </span>
        </div>
      )}
    </div>
  );
}

function CitedItem({ item, borderColor }: { item: BriefingCitedItem; borderColor: string }) {
  return (
    <div
      style={{
        borderLeft: `3px solid ${borderColor}`,
        padding: "8px 10px",
        background: C.bgSubtle,
        borderRadius: 2,
        marginBottom: 6,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 3 }}>
        {item.title}
      </div>
      <div style={{ fontSize: 11, color: C.textBody, lineHeight: 1.45, marginBottom: 3 }}>
        {item.reason}
      </div>
      <div
        style={{
          display: "flex",
          gap: 8,
          fontSize: 9,
          fontFamily: FONT.mono,
          color: C.textMuted,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          flexWrap: "wrap",
        }}
      >
        <span>{item.source}</span>
        <span>#{item.alertId.slice(-4)}</span>
        {typeof item.confidence === "number" && (
          <span style={{ color: borderColor }}>
            {Math.round(item.confidence * 100)}%
          </span>
        )}
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: borderColor, textDecoration: "none" }}
          >
            Open {"\u2197"}
          </a>
        )}
      </div>
    </div>
  );
}

export default BriefingArchive;
