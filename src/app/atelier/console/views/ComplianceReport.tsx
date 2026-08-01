"use client";

// ═══════════════════════════════════════════════════════════════
//  ComplianceReport — Loi 09-08 / BAM CIRC. 16/G/2013 compliance UI
//
//  Renders the compliance report for a selected period with:
//    • Period selector (monthly dropdown — last 12 months + current)
//    • Executive Summary (KPI tiles)
//    • Screening Log table
//    • Alert Log table
//    • Access Log table
//    • Risk Summary + threshold breaches
//    • Data Residency Statement
//    • "Download PDF" + "Export CSV" buttons
//
//  Data source: GET /api/console/compliance-report?period=YYYY-MM
//  PDF: GET /api/console/compliance-report?period=YYYY-MM&format=pdf
//  CSV: GET /api/console/compliance-report?period=YYYY-MM&format=csv
//
//  Task: dataminr-briefings-compliance
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { C } from "../../components/tokens";

const FONT = { sans: C.fontSans, mono: C.fontMono };

// ─── Types (mirror the API response) ────────────────────────────

interface ScreeningLogEntry {
  id: string;
  timestamp: string;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  entityScreened: string;
  result: "success" | "denied" | "error";
  ipAddress: string | null;
}

interface AlertLogEntry {
  id: string;
  timestamp: string;
  title: string;
  source: string;
  url: string | null;
  severity: "critical" | "high" | "medium" | "low";
  sentimentScore: number | null;
  actionTaken: string | null;
}

interface AccessLogEntry {
  id: string;
  timestamp: string;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  action: string;
  resource: string;
  result: string;
  ipAddress: string | null;
  userAgent: string | null;
}

interface RiskAssessmentEntry {
  id: string;
  companyName: string;
  category: string;
  riskLevel: string;
  riskScore: number;
  trajectory: string | null;
  assessedAt: string;
}

interface RiskSummary {
  averageRiskScore: number | null;
  highestRiskScore: number | null;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  totalRisks: number;
  trend: "improving" | "stable" | "deteriorating" | "insufficient_data";
  breaches: Array<{ companyName: string; category: string; riskScore: number; riskLevel: string }>;
}

interface DataResidencyStatement {
  storageProvider: string;
  storageRegion: string;
  edgeProvider: string;
  encryptionAtRest: string;
  encryptionInTransit: string;
  retentionPolicy: string;
  backupPolicy: string;
  dataSubjectRightsLaw: string;
  notes: string;
}

interface ExecutiveSummary {
  periodStart: string;
  periodEnd: string;
  companyName: string;
  screeningsPerformed: number;
  alertsGenerated: number;
  criticalAlerts: number;
  highAlerts: number;
  dashboardAccesses: number;
  uniqueUsersAccessed: number;
  averageRiskScore: number | null;
  riskTrend: RiskSummary["trend"];
  thresholdBreaches: number;
}

interface ComplianceReport {
  generatedAt: string;
  periodStart: string;
  periodEnd: string;
  companyName: string;
  companyId: string;
  executiveSummary: ExecutiveSummary;
  screeningLog: ScreeningLogEntry[];
  alertLog: AlertLogEntry[];
  accessLog: AccessLogEntry[];
  riskAssessments: RiskAssessmentEntry[];
  riskSummary: RiskSummary;
  dataResidency: DataResidencyStatement;
}

// ─── Component ──────────────────────────────────────────────────

export interface ComplianceReportProps {
  className?: string;
}

const ACCENT = "#1e3a8a"; // institutional navy
const RED = "#ef4444";
const AMBER = "#f59e0b";
const GREEN = "#10b981";

export function ComplianceReport({ className }: ComplianceReportProps) {
  // Default period = current month (YYYY-MM).
  const now = new Date();
  const defaultPeriod = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const [period, setPeriod] = useState(defaultPeriod);
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const load = useCallback(async (p: string) => {
    setLoading(true);
    setError(null);
    setForbidden(false);
    try {
      const res = await fetch(`/api/console/compliance-report?period=${encodeURIComponent(p)}`, { cache: "no-store" });
      if (res.status === 403) {
        setForbidden(true);
        return;
      }
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const json = (await res.json()) as { report?: ComplianceReport };
      setReport(json.report ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load compliance report");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(period);
  }, [period, load]);

  // Build the list of available months — last 12 months + current.
  const monthOptions = useMemo(() => {
    const out: Array<{ value: string; label: string }> = [];
    const d = new Date();
    d.setDate(1);
    for (let i = 0; i < 13; i++) {
      const value = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { year: "numeric", month: "long" });
      out.push({ value, label });
      d.setMonth(d.getMonth() - 1);
    }
    return out;
  }, []);

  const downloadUrl = useCallback(
    (format: "pdf" | "csv") =>
      `/api/console/compliance-report?period=${encodeURIComponent(period)}&format=${format}`,
    [period],
  );

  if (forbidden) {
    return (
      <section
        className={className}
        aria-label="Compliance Report"
        style={{
          background: C.bg,
          border: `1px solid ${C.border}`,
          borderRadius: 6,
          padding: 32,
        }}
      >
        <div
          style={{
            borderLeft: `3px solid ${AMBER}`,
            padding: "12px 16px",
            background: C.bgSubtle,
            borderRadius: 3,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontFamily: FONT.mono,
              color: AMBER,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
            ACCESS RESTRICTED
          </div>
          <div style={{ fontSize: 13, color: C.textBody, lineHeight: 1.5 }}>
            Compliance reports require the <strong>company-admin</strong> or <strong>admin</strong> role.
            Contact your Harch Atelier account manager to upgrade your role, or ask your compliance officer
            to share the report with you.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={className}
      aria-label="Compliance Report"
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
          HARCHIQ · COMPLIANCE REPORT
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
          Loi 09-08 / BAM CIRC. 16/G/2013 — Audit Trail
        </h3>
        <div
          style={{
            fontSize: 11,
            fontFamily: FONT.mono,
            color: C.textMuted,
            marginTop: 4,
          }}
        >
          {report?.companyName ?? "—"} · Generated {report ? new Date(report.generatedAt).toLocaleString("en-US") : "…"}
        </div>
      </div>

      {/* Period selector + downloads */}
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
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 10,
            fontFamily: FONT.mono,
            color: C.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Period
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            style={{
              padding: "5px 10px",
              fontSize: 11,
              fontFamily: FONT.mono,
              border: `1px solid ${C.border}`,
              borderRadius: 3,
              background: C.bg,
              color: C.text,
              cursor: "pointer",
            }}
          >
            {monthOptions.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <div style={{ flex: 1 }} />
        <a
          href={downloadUrl("pdf")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            background: ACCENT,
            border: `1px solid ${ACCENT}`,
            borderRadius: 3,
            fontSize: 10,
            fontFamily: FONT.mono,
            color: "#ffffff",
            textDecoration: "none",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            fontWeight: 700,
            cursor: "pointer",
          }}
          title="Download the compliance report as a PDF"
        >
          Download PDF
        </a>
        <a
          href={downloadUrl("csv")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            background: "transparent",
            border: `1px solid ${C.border}`,
            borderRadius: 3,
            fontSize: 10,
            fontFamily: FONT.mono,
            color: C.textBody,
            textDecoration: "none",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            fontWeight: 700,
            cursor: "pointer",
          }}
          title="Export the compliance report as a multi-section CSV"
        >
          Export CSV
        </a>
      </div>

      {/* Body */}
      <div style={{ padding: "20px", maxHeight: "70vh", overflowY: "auto" }}>
        {loading && (
          <div style={{ padding: 32, textAlign: "center", fontSize: 12, color: C.textMuted, fontFamily: FONT.mono }}>
            Generating compliance report…
          </div>
        )}
        {error && (
          <div
            style={{
              borderLeft: `3px solid ${RED}`,
              padding: "12px 16px",
              background: "rgba(239,68,68,0.04)",
              fontSize: 12,
              color: C.textBody,
              borderRadius: 3,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}
        {report && !loading && !error && <ReportBody report={report} />}
      </div>

      <style>{`
        section[aria-label="Compliance Report"] ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        section[aria-label="Compliance Report"] ::-webkit-scrollbar-track {
          background: transparent;
        }
        section[aria-label="Compliance Report"] ::-webkit-scrollbar-thumb {
          background: ${C.border};
          border-radius: 3px;
        }
      `}</style>
    </section>
  );
}

// ─── ReportBody ────────────────────────────────────────────────

function ReportBody({ report }: { report: ComplianceReport }) {
  const e = report.executiveSummary;
  return (
    <div>
      {/* ─── 1. Executive Summary ─── */}
      <SectionTitle index={1} title="Executive Summary" accent={ACCENT} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <KpiTile label="Screenings" value={e.screeningsPerformed} />
        <KpiTile label="Alerts generated" value={e.alertsGenerated} />
        <KpiTile label="Critical alerts" value={e.criticalAlerts} color={RED} />
        <KpiTile label="High alerts" value={e.highAlerts} color={AMBER} />
        <KpiTile label="Dashboard accesses" value={e.dashboardAccesses} />
        <KpiTile label="Unique users" value={e.uniqueUsersAccessed} />
        <KpiTile label="Avg risk score" value={e.averageRiskScore ?? "n/a"} />
        <KpiTile
          label="Risk trend"
          value={e.riskTrend.replace("_", " ")}
          color={
            e.riskTrend === "improving"
              ? GREEN
              : e.riskTrend === "deteriorating"
                ? RED
                : C.textMuted
          }
        />
        <KpiTile label="Breaches" value={e.thresholdBreaches} color={e.thresholdBreaches > 0 ? RED : GREEN} />
      </div>

      {/* ─── 2. Risk Summary ─── */}
      <SectionTitle index={2} title="Risk Summary" accent={ACCENT} />
      <div
        style={{
          padding: "10px 14px",
          background: C.bgSubtle,
          borderRadius: 3,
          marginBottom: 12,
          fontSize: 12,
          color: C.textBody,
          lineHeight: 1.55,
        }}
      >
        {report.riskSummary.totalRisks} risk assessments recorded.{" "}
        <span style={{ color: RED, fontWeight: 700 }}>{report.riskSummary.criticalCount} critical</span>,{" "}
        <span style={{ color: AMBER, fontWeight: 700 }}>{report.riskSummary.highCount} high</span>,{" "}
        {report.riskSummary.mediumCount} medium, {report.riskSummary.lowCount} low.{" "}
        Average score: <strong>{report.riskSummary.averageRiskScore ?? "n/a"}</strong>/100.{" "}
        Highest: <strong>{report.riskSummary.highestRiskScore ?? "n/a"}</strong>.{" "}
        Trend: <strong style={{ textTransform: "capitalize" }}>{report.riskSummary.trend.replace("_", " ")}</strong>.
      </div>

      {report.riskSummary.breaches.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 9,
              fontFamily: FONT.mono,
              color: RED,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
            Threshold breaches (score ≥ 70 OR level = critical)
          </div>
          <LogTable
            columns={[
              { key: "companyName", label: "Company", width: "30%" },
              { key: "category", label: "Category", width: "35%" },
              { key: "riskScore", label: "Score", width: "15%" },
              { key: "riskLevel", label: "Level", width: "20%" },
            ]}
            rows={report.riskSummary.breaches.map((b) => ({
              ...b,
              riskScore: `${b.riskScore}/100`,
              _color: b.riskLevel === "critical" ? RED : AMBER,
            })) as unknown as Record<string, unknown>[]}
          />
        </div>
      )}

      {/* ─── 3. Screening Log ─── */}
      <SectionTitle index={3} title={`Screening Log (${report.screeningLog.length})`} accent={ACCENT} />
      {report.screeningLog.length === 0 ? (
        <EmptyLog message="No sanctions screenings recorded in this period." />
      ) : (
        <LogTable
          columns={[
            { key: "timestamp", label: "Date", width: "18%", render: (v) => new Date(v as string).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) },
            { key: "user", label: "Performed by", width: "22%", render: (row) => (row as ScreeningLogEntry).userEmail ?? (row as ScreeningLogEntry).userName ?? "anonymous" },
            { key: "entityScreened", label: "Entity screened", width: "32%" },
            { key: "result", label: "Result", width: "12%", render: (v) => String(v), _colorByValue: { success: GREEN, denied: RED, error: RED } },
            { key: "ipAddress", label: "IP", width: "16%", render: (v) => (v as string | null) ?? "—" },
          ]}
          rows={report.screeningLog as unknown as Record<string, unknown>[]}
        />
      )}

      {/* ─── 4. Alert Log ─── */}
      <SectionTitle index={4} title={`Alert Log (${report.alertLog.length})`} accent={ACCENT} />
      {report.alertLog.length === 0 ? (
        <EmptyLog message="No alerts generated in this period." />
      ) : (
        <LogTable
          columns={[
            { key: "timestamp", label: "Date", width: "16%", render: (v) => new Date(v as string).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) },
            { key: "title", label: "Title", width: "38%" },
            { key: "source", label: "Source", width: "18%" },
            { key: "severity", label: "Severity", width: "12%", _colorByValue: { critical: RED, high: AMBER, medium: C.textMuted, low: GREEN } },
            { key: "actionTaken", label: "Action", width: "16%", render: (v) => (v as string | null) ?? "—" },
          ]}
          rows={report.alertLog as unknown as Record<string, unknown>[]}
        />
      )}

      {/* ─── 5. Access Log ─── */}
      <SectionTitle index={5} title={`Access Log (${report.accessLog.length})`} accent={ACCENT} />
      {report.accessLog.length === 0 ? (
        <EmptyLog message="No dashboard accesses recorded in this period." />
      ) : (
        <LogTable
          columns={[
            { key: "timestamp", label: "Date", width: "16%", render: (v) => new Date(v as string).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) },
            { key: "user", label: "User", width: "20%", render: (row) => (row as AccessLogEntry).userEmail ?? (row as AccessLogEntry).userName ?? "anonymous" },
            { key: "action", label: "Action", width: "18%" },
            { key: "resource", label: "Resource", width: "24%" },
            { key: "result", label: "Result", width: "10%", _colorByValue: { success: GREEN, denied: RED, error: RED } },
            { key: "ipAddress", label: "IP", width: "12%", render: (v) => (v as string | null) ?? "—" },
          ]}
          rows={report.accessLog as unknown as Record<string, unknown>[]}
        />
      )}

      {/* ─── 6. Data Residency Statement ─── */}
      <SectionTitle index={6} title="Data Residency Statement" accent={ACCENT} />
      <div
        style={{
          padding: "12px 14px",
          background: C.bgSubtle,
          border: `1px solid ${C.border}`,
          borderRadius: 3,
          fontSize: 12,
          color: C.textBody,
          lineHeight: 1.6,
        }}
      >
        <Field label="Storage provider" value={report.dataResidency.storageProvider} />
        <Field label="Storage region" value={report.dataResidency.storageRegion} />
        <Field label="Edge provider" value={report.dataResidency.edgeProvider} />
        <Field label="Encryption at rest" value={report.dataResidency.encryptionAtRest} />
        <Field label="Encryption in transit" value={report.dataResidency.encryptionInTransit} />
        <Field label="Retention policy" value={report.dataResidency.retentionPolicy} />
        <Field label="Backup policy" value={report.dataResidency.backupPolicy} />
        <Field label="Data subject rights" value={report.dataResidency.dataSubjectRightsLaw} />
        <Field label="Notes" value={report.dataResidency.notes} />
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────

function SectionTitle({ index, title, accent }: { index: number; title: string; accent: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginTop: 20,
        marginBottom: 10,
        paddingBottom: 6,
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontFamily: FONT.mono,
          color: "#ffffff",
          background: accent,
          padding: "2px 6px",
          borderRadius: 2,
          fontWeight: 700,
          letterSpacing: "0.06em",
        }}
      >
        {index}
      </span>
      <span
        style={{
          fontSize: 12,
          fontFamily: FONT.sans,
          color: C.text,
          fontWeight: 700,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </span>
    </div>
  );
}

function KpiTile({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div
      style={{
        padding: "10px 12px",
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: 3,
      }}
    >
      <div
        style={{
          fontSize: 8,
          fontFamily: FONT.mono,
          color: C.textMuted,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: color ?? C.text,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function EmptyLog({ message }: { message: string }) {
  return (
    <div
      style={{
        padding: 16,
        textAlign: "center",
        fontSize: 11,
        color: C.textMuted,
        fontFamily: FONT.mono,
        background: C.bgSubtle,
        borderRadius: 3,
        marginBottom: 16,
      }}
    >
      {message}
    </div>
  );
}

interface Column {
  key: string;
  label: string;
  width: string;
  render?: (value: unknown | Record<string, unknown>) => unknown;
  _colorByValue?: Record<string, string>;
}

function LogTable({ columns, rows }: { columns: Column[]; rows: ReadonlyArray<Record<string, unknown>> }) {
  return (
    <div style={{ marginBottom: 16, overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 11,
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
            {columns.map((c) => (
              <th
                key={c.key}
                style={{
                  padding: "6px 10px",
                  fontSize: 8,
                  fontFamily: FONT.mono,
                  color: C.textMuted,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  width: c.width,
                }}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 100).map((r, i) => (
            <tr
              key={(r.id as string | undefined) ?? i}
              style={{
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              {columns.map((c) => {
                const raw = r[c.key];
                const display = c.render ? c.render(c.render.length === 1 ? raw : r) : raw;
                const colorMap = c._colorByValue;
                const valueColor = colorMap && typeof display === "string" ? colorMap[display.toLowerCase()] : undefined;
                return (
                  <td
                    key={c.key}
                    style={{
                      padding: "6px 10px",
                      fontSize: 11,
                      color: valueColor ?? C.textBody,
                      fontWeight: valueColor ? 700 : 400,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: 280,
                    }}
                  >
                    {String(display ?? "—")}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > 100 && (
        <div
          style={{
            padding: "6px 10px",
            fontSize: 10,
            fontFamily: FONT.mono,
            color: C.textMuted,
            textAlign: "center",
          }}
        >
          Showing first 100 of {rows.length} entries. Download CSV for the full log.
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div
        style={{
          fontSize: 8,
          fontFamily: FONT.mono,
          color: ACCENT,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          fontWeight: 700,
          marginBottom: 3,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 12, color: C.textBody, lineHeight: 1.5 }}>{value}</div>
    </div>
  );
}

// ─── Unused-style suppression (CSSProperties imported above) ───
// Keep the type import referenced so eslint doesn't drop it.
export type { CSSProperties };

export default ComplianceReport;
