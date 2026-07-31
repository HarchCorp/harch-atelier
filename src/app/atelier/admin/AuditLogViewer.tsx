"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { C } from "../components/tokens";

// ═══════════════════════════════════════════════════════════════
//  AUDIT LOG VIEWER (Loi 09-08 / CNDP Maroc)
//
//  Admin-only panel that fetches the AuditLog table from
//  /api/admin/audit-logs and renders a paginated, filterable,
//  searchable table with summary stats.
//
//  Features:
//    - Filters: date range (from / to), action, result, free-text q
//    - Stats strip: today count, top actions, top users
//    - Virtualized-ish table: capped at 500 rows, scrolls internally
//    - Export to CSV button (meta: exporting audit logs creates an
//      audit log entry on the server via /api/console/export-log)
//
//  The component is intentionally self-contained — it uses inline
//  styles + the shared `C` token object so it can be dropped into
//  the AdminDashboard without pulling in additional CSS dependencies.
// ═══════════════════════════════════════════════════════════════

interface AuditLogUser {
  id: string;
  email: string | null;
  name: string | null;
}

interface AuditLogRow {
  id: string;
  userId: string | null;
  action: string;
  resource: string;
  ipAddress: string | null;
  userAgent: string | null;
  result: string;
  metadata: unknown;
  createdAt: string;
  user: AuditLogUser | null;
}

interface AuditStats {
  today: number;
  topActions: Array<{ action: string; count: number }>;
  topUsers: Array<{
    userId: string | null;
    email: string | null;
    name: string | null;
    count: number;
  }>;
}

interface AuditLogsResponse {
  logs: AuditLogRow[];
  total: number;
  page: number;
  limit: number;
  stats: AuditStats;
}

const ACTION_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "All actions" },
  { value: "sanctions_screen", label: "Sanctions screen" },
  { value: "dossier_view", label: "Dossier view" },
  { value: "report_export", label: "Report export (PDF)" },
  { value: "data_export_csv", label: "CSV export" },
  { value: "portfolio_import", label: "Portfolio import" },
  { value: "company_settings_update", label: "Company settings" },
  { value: "user_invite", label: "User invite" },
  { value: "user_suspend", label: "User suspend" },
  { value: "demo_access", label: "Demo access" },
  { value: "login", label: "Login" },
  { value: "login_failed", label: "Login failed" },
  { value: "onboarding_complete", label: "Onboarding complete" },
  { value: "ai_probe", label: "AI probe" },
  { value: "briefing_generate", label: "Briefing generate" },
];

const RESULT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "All results" },
  { value: "success", label: "Success" },
  { value: "denied", label: "Denied" },
  { value: "error", label: "Error" },
];

const PAGE_SIZE = 50;

function resultColor(result: string): string {
  if (result === "success") return C.success;
  if (result === "denied") return C.warning;
  if (result === "error") return C.danger;
  return C.textMuted;
}

function resultBg(result: string): string {
  if (result === "success") return C.successBg;
  if (result === "denied") return C.warningBg;
  if (result === "error") return C.dangerBg;
  return C.bgSubtle;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  // YYYY-MM-DD HH:MM:SS UTC
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} UTC`;
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1) + "\u2026";
}

function formatMetadata(meta: unknown): string {
  if (!meta || typeof meta !== "object") return "";
  try {
    return JSON.stringify(meta);
  } catch {
    return "";
  }
}

function safeString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function isoToday(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

const inputStyle: React.CSSProperties = {
  padding: "8px 10px",
  border: `1px solid ${C.border}`,
  borderRadius: "4px",
  background: C.bg,
  fontFamily: C.fontMono,
  fontSize: "12px",
  color: C.text,
  outline: "none",
  minWidth: "120px",
};

const labelStyle: React.CSSProperties = {
  fontFamily: C.fontMono,
  fontSize: "10px",
  color: C.textMuted,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  marginBottom: "4px",
  display: "block",
};

const btnPrimary: React.CSSProperties = {
  padding: "8px 14px",
  background: C.cta,
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  fontSize: "12px",
  fontWeight: 600,
  cursor: "pointer",
};

const btnSecondary: React.CSSProperties = {
  padding: "8px 14px",
  background: "transparent",
  border: `1px solid ${C.borderStrong}`,
  color: C.textBody,
  borderRadius: "4px",
  fontSize: "12px",
  fontWeight: 600,
  cursor: "pointer",
};

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [action, setAction] = useState("");
  const [result, setResult] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [q, setQ] = useState("");

  // Active filters (applied on "Apply"). We keep the input filters
  // separate from the active ones so the user can type freely and
  // only refetch when they explicitly apply.
  const [applied, setApplied] = useState({
    action: "",
    result: "",
    from: "",
    to: "",
    q: "",
  });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (applied.action) params.set("action", applied.action);
      if (applied.result) params.set("result", applied.result);
      if (applied.from) params.set("from", applied.from);
      if (applied.to) params.set("to", applied.to);
      if (applied.q) params.set("q", applied.q);
      const res = await fetch(
        `/api/admin/audit-logs?${params.toString()}`,
        { cache: "no-store" },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const data: AuditLogsResponse = await res.json();
      setLogs(data.logs);
      setTotal(data.total);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setLogs([]);
      setStats(null);
    }
    setLoading(false);
  }, [page, applied]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleApply = () => {
    setApplied({ action, result, from, to, q });
    setPage(1);
  };

  const handleReset = () => {
    setAction("");
    setResult("");
    setFrom("");
    setTo("");
    setQ("");
    setApplied({ action: "", result: "", from: "", to: "", q: "" });
    setPage(1);
  };

  const handleQuickRange = (days: number) => {
    const fromStr = isoDaysAgo(days);
    const toStr = isoToday();
    setFrom(fromStr);
    setTo(toStr);
    setApplied((prev) => ({ ...prev, from: fromStr, to: toStr }));
    setPage(1);
  };

  const handleExportCsv = async () => {
    // Meta: exporting audit logs creates an audit log entry itself.
    // Fire-and-forget the export-log call, then trigger the CSV
    // download client-side using the currently-loaded `logs`.
    try {
      await fetch("/api/console/export-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exportType: "admin-audit-logs",
          rowCount: logs.length,
          fileName: `audit-logs-${new Date().toISOString().split("T")[0]}.csv`,
          metadata: {
            filters: applied,
            page,
          },
        }),
      });
    } catch {
      // ignore — fire and forget
    }

    const headers = [
      "createdAt",
      "userId",
      "userEmail",
      "action",
      "resource",
      "result",
      "ipAddress",
      "userAgent",
      "metadata",
    ];
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const rows = logs.map((l) =>
      [
        l.createdAt,
        l.userId ?? "",
        l.user?.email ?? "",
        l.action,
        l.resource,
        l.result,
        l.ipAddress ?? "",
        l.userAgent ?? "",
        formatMetadata(l.metadata),
      ]
        .map((v) => escape(String(v)))
        .join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Stats strip — today count + top 3 actions + top 3 users
  const topActions = useMemo(() => stats?.topActions?.slice(0, 3) ?? [], [stats]);
  const topUsers = useMemo(() => stats?.topUsers?.slice(0, 3) ?? [], [stats]);

  return (
    <div style={{ fontFamily: C.fontSans, color: C.text }}>
      {/* ─── Stats strip ─────────────────────────────────────────── */}
      {stats && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
            gap: "1px",
            background: C.border,
            border: `1px solid ${C.border}`,
            borderRadius: "6px",
            overflow: "hidden",
            marginBottom: "20px",
          }}
        >
          <StatCell label="Events today" value={stats.today} highlight={stats.today > 0} />
          <StatCell
            label="Top actions"
            value={
              topActions.length > 0
                ? topActions
                    .map((a) => `${a.action} (${a.count})`)
                    .join(" · ")
                : "—"
            }
            mono
          />
          <StatCell
            label="Top users"
            value={
              topUsers.length > 0
                ? topUsers
                    .map(
                      (u) =>
                        `${u.email ?? u.userId ?? "anonymous"} (${u.count})`,
                    )
                    .join(" · ")
                : "—"
            }
            mono
          />
          <StatCell label="Total (filtered)" value={total} />
        </div>
      )}

      {/* ─── Filter bar ─────────────────────────────────────────── */}
      <div
        style={{
          border: `1px solid ${C.border}`,
          borderRadius: "6px",
          padding: "16px",
          marginBottom: "16px",
          background: C.bgSubtle,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))",
            gap: "12px",
          }}
        >
          <div>
            <label style={labelStyle}>Action</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              style={inputStyle}
            >
              {ACTION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Result</label>
            <select
              value={result}
              onChange={(e) => setResult(e.target.value)}
              style={inputStyle}
            >
              {RESULT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ gridColumn: "span 2" }}>
            <label style={labelStyle}>Search (resource / IP / UA)</label>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleApply();
              }}
              placeholder="attijariwafa / 192.168 / curl"
              style={{ ...inputStyle, width: "100%" }}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            marginTop: "14px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <button onClick={handleApply} style={btnPrimary}>
            Apply filters
          </button>
          <button onClick={handleReset} style={btnSecondary}>
            Reset
          </button>
          <span
            style={{
              fontFamily: C.fontMono,
              fontSize: "11px",
              color: C.textMuted,
              marginLeft: "auto",
            }}
          >
            Quick range:
          </span>
          <button onClick={() => handleQuickRange(1)} style={btnSecondary}>
            Today
          </button>
          <button onClick={() => handleQuickRange(7)} style={btnSecondary}>
            Last 7d
          </button>
          <button onClick={() => handleQuickRange(30)} style={btnSecondary}>
            Last 30d
          </button>
          <button onClick={handleExportCsv} style={btnSecondary}>
            {"\u2193"} Export CSV
          </button>
        </div>
      </div>

      {/* ─── Error / Loading ────────────────────────────────────── */}
      {error && (
        <div
          style={{
            padding: "12px 16px",
            background: C.dangerBg,
            color: C.danger,
            border: `1px solid ${C.danger}33`,
            borderRadius: "4px",
            marginBottom: "16px",
            fontFamily: C.fontMono,
            fontSize: "12px",
          }}
        >
          {error}
        </div>
      )}

      {loading && (
        <div
          style={{
            color: C.textMuted,
            fontFamily: C.fontMono,
            fontSize: "13px",
            padding: "24px 0",
          }}
        >
          Loading audit logs...
        </div>
      )}

      {/* ─── Table ──────────────────────────────────────────────── */}
      {!loading && logs.length > 0 && (
        <div
          style={{
            border: `1px solid ${C.border}`,
            borderRadius: "6px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              maxHeight: "560px",
              overflowY: "auto",
              // Custom scrollbar (webkit)
            }}
            className="harch-audit-scroll"
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontFamily: C.fontMono,
                fontSize: "11px",
              }}
            >
              <thead
                style={{
                  position: "sticky",
                  top: 0,
                  background: C.bg,
                  zIndex: 1,
                }}
              >
                <tr
                  style={{
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  {[
                    "Timestamp",
                    "User",
                    "Action",
                    "Resource",
                    "Result",
                    "IP",
                    "Details",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "10px 12px",
                        color: C.textMuted,
                        fontWeight: 600,
                        fontSize: "10px",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => {
                  const meta = formatMetadata(l.metadata);
                  return (
                    <tr
                      key={l.id}
                      style={{
                        borderBottom: `1px solid ${C.border}`,
                        verticalAlign: "top",
                      }}
                    >
                      <td
                        style={{
                          padding: "8px 12px",
                          color: C.textMuted,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatDate(l.createdAt)}
                      </td>
                      <td style={{ padding: "8px 12px" }}>
                        <div style={{ color: C.text, fontWeight: 600 }}>
                          {l.user?.email ?? "—"}
                        </div>
                        <div style={{ color: C.textMuted, fontSize: "10px" }}>
                          {l.user?.name ?? l.userId ?? "anonymous"}
                        </div>
                      </td>
                      <td style={{ padding: "8px 12px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 6px",
                            borderRadius: "2px",
                            background: `${C.accent}15`,
                            color: C.accent,
                            fontSize: "10px",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {l.action}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          color: C.textBody,
                          wordBreak: "break-all",
                          maxWidth: "220px",
                        }}
                      >
                        {l.resource}
                      </td>
                      <td style={{ padding: "8px 12px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 6px",
                            borderRadius: "2px",
                            background: resultBg(l.result),
                            color: resultColor(l.result),
                            fontSize: "10px",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {l.result}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          color: C.textMuted,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {l.ipAddress ?? "—"}
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          color: C.textMuted,
                          wordBreak: "break-all",
                          maxWidth: "300px",
                        }}
                        title={meta}
                      >
                        {meta ? truncate(meta, 80) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Empty state ────────────────────────────────────────── */}
      {!loading && logs.length === 0 && !error && (
        <div
          style={{
            padding: "48px 24px",
            textAlign: "center",
            color: C.textMuted,
            fontFamily: C.fontMono,
            fontSize: "13px",
            border: `1px solid ${C.border}`,
            borderRadius: "6px",
          }}
        >
          No audit log entries match these filters.
        </div>
      )}

      {/* ─── Pagination ─────────────────────────────────────────── */}
      {!loading && total > PAGE_SIZE && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "16px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div
            style={{
              fontFamily: C.fontMono,
              fontSize: "11px",
              color: C.textMuted,
            }}
          >
            Page {page} of {totalPages} · {total} total entries
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              style={{
                ...btnSecondary,
                opacity: page === 1 ? 0.4 : 1,
                cursor: page === 1 ? "not-allowed" : "pointer",
              }}
            >
              {"\u00ab"} First
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                ...btnSecondary,
                opacity: page === 1 ? 0.4 : 1,
                cursor: page === 1 ? "not-allowed" : "pointer",
              }}
            >
              {"\u2039"} Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                ...btnSecondary,
                opacity: page === totalPages ? 0.4 : 1,
                cursor: page === totalPages ? "not-allowed" : "pointer",
              }}
            >
              Next {"\u203a"}
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              style={{
                ...btnSecondary,
                opacity: page === totalPages ? 0.4 : 1,
                cursor: page === totalPages ? "not-allowed" : "pointer",
              }}
            >
              Last {"\u00bb"}
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .harch-audit-scroll::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .harch-audit-scroll::-webkit-scrollbar-thumb {
          background: ${C.borderStrong};
          border-radius: 4px;
        }
        .harch-audit-scroll::-webkit-scrollbar-thumb:hover {
          background: ${C.textMuted};
        }
        .harch-audit-scroll::-webkit-scrollbar-track {
          background: ${C.bgSubtle};
        }
      `}</style>
    </div>
  );
}

function StatCell({
  label,
  value,
  highlight,
  mono,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
  mono?: boolean;
}) {
  const safeVal = typeof value === "string" ? safeString(value) : value;
  return (
    <div
      style={{
        padding: "12px 14px",
        background: C.bg,
      }}
    >
      <div
        style={{
          fontFamily: C.fontMono,
          fontSize: "10px",
          color: C.textMuted,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          marginBottom: "4px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: mono ? C.fontMono : "'Inter', system-ui, sans-serif",
          fontSize: mono ? "11px" : "20px",
          fontWeight: mono ? 400 : 700,
          color: highlight ? C.cta : C.text,
          wordBreak: "break-word",
        }}
      >
        {safeVal}
      </div>
    </div>
  );
}
