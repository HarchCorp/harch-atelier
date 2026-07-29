"use client";

// ═══════════════════════════════════════════════════════════════
//  RAW INTELLIGENCE EXPORT — CLIENT VIEW (Harch Atelier v4.1)
//
//  Minimalist forensic tool. The user picks a company, hits
//  "Generate Intelligence Report", and we POST to /api/atelier/audit
//  to enqueue a Job. We then poll GET /api/jobs/[id]/status every
//  3 seconds until status === "completed" | "failed".
//
//  V4.1 RÈGLE D'OR: the UI never editorializes. It renders the
//  RawIntelligenceReport verbatim in structured tables, with a
//  JSON download as the canonical export. No recommendations,
//  no dashboards, no charts.
//
//  Visual language:
//   • Light theme (#FAFAFA bg + #FFFFFF surface + #4A7B5F sage accent)
//   • Inter for prose, JetBrains Mono for IDs / numbers / URLs
//   • Tight typography, hairline borders, no shadows
//   • Mobile-first; tables scroll horizontally on narrow viewports
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useState } from "react";
import type {
  RawIntelligenceReport,
  IntelligenceReportRisk,
  IntelligenceReportSentiment,
  IntelligenceReportReputationPillar,
  IntelligenceReportEntity,
  IntelligenceReportEvent,
  IntelligenceReportEvidenceEntry,
} from "@/lib/ai/glm-prompts";

// ─── DESIGN TOKENS ────────────────────────────────────────────────

const C: Record<string, string> = {
  bg: "#FAFAFA",
  surface: "#FFFFFF",
  surfaceAlt: "#F4F4F5",
  border: "#E5E5E5",
  borderLight: "#F0F0F0",
  text: "#0A0A0A",
  textSec: "#525252",
  textMuted: "#71717A",
  sage: "#4A7B5F",
  sageDark: "#3A6149",
  sageLight: "#E8F0EC",
  amber: "#B45309",
  amberLight: "#FEF3C7",
  amberDeep: "#9A3412",
  amberDeepLight: "#FFE4D6",
  red: "#A0524B",
  redLight: "#FCE7E5",
  neutral: "#525252",
  neutralLight: "#E5E5E5",
};

const FONT_BODY = "'Inter', system-ui, -apple-system, sans-serif";
const FONT_MONO = "'JetBrains Mono', 'SF Mono', Menlo, monospace";

// ─── TYPES ────────────────────────────────────────────────────────

interface CompanyOption {
  id: string;
  slug: string;
  name: string;
  sector?: string;
}

type Phase = "idle" | "generating" | "completed" | "failed";

// ─── POLLER HOOK ──────────────────────────────────────────────────
// Polls GET /api/jobs/[id]/status every 3 seconds until the Job
// reaches a terminal state. Exposes progress (0-100), status string,
// parsed result (the RawIntelligenceReport), and error.

interface PollerState {
  progress: number;
  status: string;
  result: RawIntelligenceReport | null;
  error: string | null;
  /** Reset the poller back to its initial idle state. Call this
   *  from an event handler (NOT from inside an effect) before
   *  starting a new job so the UI doesn't briefly show the previous
   *  job's result. */
  reset: () => void;
}

function useAuditPoller(jobId: string | null): PollerState {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>("queued");
  const [result, setResult] = useState<RawIntelligenceReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Stable reset — called by the parent component's event handlers
  // (NOT from inside this effect) to clear stale state before a new
  // job kicks off. This avoids the React 19 `set-state-in-effect`
  // lint warning that would fire if we reset synchronously inside
  // the polling effect on every jobId change.
  const reset = useCallback(() => {
    setProgress(0);
    setStatus("queued");
    setResult(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}/status`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();

        setProgress(typeof data.progress === "number" ? data.progress : 0);
        setStatus(data.status || "unknown");

        if (data.status === "completed") {
          // The worker stores the RawIntelligenceReport verbatim inside
          // Job.result. Some workers wrap progress metadata alongside
          // the report — handle both shapes defensively.
          const candidate = data.result;
          if (candidate && typeof candidate === "object") {
            // Shape A: { ...RawIntelligenceReport }
            if ("executive_summary" in candidate) {
              setResult(candidate as RawIntelligenceReport);
            }
            // Shape B: { progress, step, report: RawIntelligenceReport }
            else if (candidate.report && candidate.report.executive_summary) {
              setResult(candidate.report as RawIntelligenceReport);
            }
          }
          clearInterval(interval);
        }
        if (data.status === "failed") {
          setError(data.error || "Unknown error");
          clearInterval(interval);
        }
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Failed to poll job status",
        );
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [jobId]);

  return { progress, status, result, error, reset };
}

// ─── SMALL UI PRIMITIVES ──────────────────────────────────────────

function SeverityBadge({ severity }: { severity: string }) {
  const normalized = (severity || "").toLowerCase();
  let bg = C.neutralLight;
  let fg = C.neutral;
  if (normalized === "low") {
    bg = C.neutralLight;
    fg = C.neutral;
  } else if (normalized === "medium") {
    bg = C.amberLight;
    fg = C.amber;
  } else if (normalized === "high") {
    bg = C.amberDeepLight;
    fg = C.amberDeep;
  } else if (normalized === "critical") {
    bg = C.redLight;
    fg = C.red;
  }
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: "2px",
        fontSize: "10px",
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        background: bg,
        color: fg,
        fontFamily: FONT_MONO,
      }}
    >
      {normalized || "—"}
    </span>
  );
}

function ReliabilityBadge({ reliability }: { reliability: string }) {
  const normalized = (reliability || "").toLowerCase();
  let bg = C.neutralLight;
  let fg = C.neutral;
  if (normalized === "high") {
    bg = C.sageLight;
    fg = C.sageDark;
  } else if (normalized === "medium") {
    bg = C.amberLight;
    fg = C.amber;
  } else if (normalized === "low") {
    bg = C.redLight;
    fg = C.red;
  }
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: "2px",
        fontSize: "10px",
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        background: bg,
        color: fg,
        fontFamily: FONT_MONO,
      }}
    >
      {normalized || "—"}
    </span>
  );
}

function SectionHeader({
  index,
  title,
  count,
}: {
  index: string;
  title: string;
  count?: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: "12px",
        paddingBottom: "8px",
        borderBottom: `1px solid ${C.border}`,
        marginBottom: "16px",
      }}
    >
      <span
        style={{
          fontFamily: FONT_MONO,
          fontSize: "11px",
          color: C.textMuted,
          letterSpacing: "0.04em",
        }}
      >
        {index}
      </span>
      <h2
        style={{
          margin: 0,
          fontSize: "14px",
          fontWeight: 600,
          color: C.text,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h2>
      {typeof count === "number" && (
        <span
          style={{
            marginLeft: "auto",
            fontFamily: FONT_MONO,
            fontSize: "11px",
            color: C.textMuted,
          }}
        >
          {count.toString().padStart(2, "0")} entr
          {count === 1 ? "y" : "ies"}
        </span>
      )}
    </div>
  );
}

function Table({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: `1px solid ${C.border}`,
        borderRadius: "2px",
        overflowX: "auto",
        background: C.surface,
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "12px",
          fontFamily: FONT_BODY,
          minWidth: "640px",
        }}
      >
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                style={{
                  textAlign: "left",
                  padding: "10px 12px",
                  fontWeight: 500,
                  fontSize: "10px",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: C.textMuted,
                  background: C.surfaceAlt,
                  borderBottom: `1px solid ${C.border}`,
                  whiteSpace: "nowrap",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function TableCell({
  children,
  mono = false,
}: {
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <td
      style={{
        padding: "10px 12px",
        verticalAlign: "top",
        color: C.text,
        fontFamily: mono ? FONT_MONO : FONT_BODY,
        fontSize: mono ? "11px" : "12px",
        borderBottom: `1px solid ${C.borderLight}`,
        lineHeight: 1.5,
        wordBreak: "break-word",
      }}
    >
      {children}
    </td>
  );
}

function QuoteBlock({ text }: { text: string }) {
  if (!text) return <span style={{ color: C.textMuted }}>—</span>;
  return (
    <div
      style={{
        borderLeft: `2px solid ${C.sage}`,
        paddingLeft: "10px",
        fontStyle: "normal",
        color: C.textSec,
      }}
    >
      &ldquo;{text}&rdquo;
    </div>
  );
}

function UrlList({ urls }: { urls: string[] | undefined }) {
  const list = (urls || []).filter(Boolean);
  if (list.length === 0)
    return <span style={{ color: C.textMuted }}>—</span>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {list.map((u, i) => (
        <a
          key={i}
          href={u}
          target="_blank"
          rel="noopener noreferrer nofollow"
          style={{
            color: C.sage,
            textDecoration: "none",
            fontFamily: FONT_MONO,
            fontSize: "11px",
            wordBreak: "break-all",
            borderBottom: `1px dotted transparent`,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.borderBottomColor =
              C.sage;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.borderBottomColor =
              "transparent";
          }}
        >
          {u.length > 80 ? u.slice(0, 78) + "…" : u}
        </a>
      ))}
    </div>
  );
}

function StringList({
  items,
  empty = "—",
}: {
  items: string[] | undefined;
  empty?: string;
}) {
  const list = (items || []).filter(Boolean);
  if (list.length === 0)
    return <span style={{ color: C.textMuted }}>{empty}</span>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {list.map((s, i) => (
        <div
          key={i}
          style={{
            fontFamily: FONT_BODY,
            fontSize: "12px",
            color: C.textSec,
            lineHeight: 1.5,
          }}
        >
          {s}
        </div>
      ))}
    </div>
  );
}

// ─── REPORT SECTIONS ──────────────────────────────────────────────

function ExecutiveSummary({ text }: { text: string }) {
  return (
    <section>
      <SectionHeader index="01" title="Executive Summary" />
      <p
        style={{
          margin: 0,
          fontSize: "13px",
          lineHeight: 1.7,
          color: C.text,
          fontFamily: FONT_BODY,
          whiteSpace: "pre-wrap",
        }}
      >
        {text || (
          <span style={{ color: C.textMuted }}>
            No executive summary produced.
          </span>
        )}
      </p>
    </section>
  );
}

function RisksTable({ risks }: { risks: IntelligenceReportRisk[] }) {
  return (
    <section>
      <SectionHeader index="02" title="Risks" count={risks.length} />
      {risks.length === 0 ? (
        <EmptyState label="No risks identified." />
      ) : (
        <Table
          headers={[
            "Category",
            "Severity",
            "Score",
            "Evidence Quotes",
            "Source URLs",
            "Dates",
          ]}
        >
          {risks.map((r, i) => (
            <tr key={i}>
              <TableCell mono>{r.category || "—"}</TableCell>
              <TableCell>
                <SeverityBadge severity={r.severity} />
              </TableCell>
              <TableCell mono>
                <span
                  style={{
                    fontWeight: 600,
                    color:
                      (r.score ?? 0) >= 70
                        ? C.red
                        : (r.score ?? 0) >= 40
                          ? C.amber
                          : C.text,
                  }}
                >
                  {(r.score ?? 0).toFixed(0)}
                </span>
                <span style={{ color: C.textMuted }}> / 100</span>
              </TableCell>
              <TableCell>
                <StringList items={r.evidence_quotes} />
              </TableCell>
              <TableCell>
                <UrlList urls={r.source_urls} />
              </TableCell>
              <TableCell mono>
                <StringList items={r.dates} />
              </TableCell>
            </tr>
          ))}
        </Table>
      )}
    </section>
  );
}

function SentimentBlock({
  sentiment,
}: {
  sentiment: IntelligenceReportSentiment;
}) {
  const score = sentiment.overall_score;
  const scorePct = Math.round(((score + 1) / 2) * 100); // -1..1 → 0..100
  const label = (sentiment.label || "neutral").toLowerCase();

  let barColor = C.neutral;
  if (label === "positive") barColor = C.sage;
  else if (label === "negative") barColor = C.red;
  else if (label === "mixed") barColor = C.amber;

  return (
    <section>
      <SectionHeader index="03" title="Sentiment" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            border: `1px solid ${C.border}`,
            padding: "12px 14px",
            background: C.surface,
            borderRadius: "2px",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: C.textMuted,
              marginBottom: "6px",
            }}
          >
            Overall Score
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: "22px",
                fontWeight: 600,
                color:
                  score > 0.1
                    ? C.sage
                    : score < -0.1
                      ? C.red
                      : C.text,
              }}
            >
              {score >= 0 ? "+" : ""}
              {score.toFixed(2)}
            </span>
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: "11px",
                color: C.textMuted,
              }}
            >
              / 1.00
            </span>
          </div>
          <div
            style={{
              height: "4px",
              background: C.surfaceAlt,
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${scorePct}%`,
                height: "100%",
                background: barColor,
              }}
            />
          </div>
        </div>

        <div
          style={{
            border: `1px solid ${C.border}`,
            padding: "12px 14px",
            background: C.surface,
            borderRadius: "2px",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: C.textMuted,
              marginBottom: "6px",
            }}
          >
            Label
          </div>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: "18px",
              fontWeight: 600,
              color: barColor,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {label}
          </div>
        </div>

        <div
          style={{
            border: `1px solid ${C.border}`,
            padding: "12px 14px",
            background: C.surface,
            borderRadius: "2px",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: C.textMuted,
              marginBottom: "6px",
            }}
          >
            Key Drivers
          </div>
          <StringList items={sentiment.key_drivers} />
        </div>
      </div>

      <div
        style={{
          border: `1px solid ${C.border}`,
          background: C.surface,
          borderRadius: "2px",
          padding: "12px 14px",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: C.textMuted,
            marginBottom: "8px",
          }}
        >
          Evidence Quotes
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {(sentiment.evidence_quotes || []).length === 0 ? (
            <span style={{ color: C.textMuted }}>—</span>
          ) : (
            sentiment.evidence_quotes.map((q, i) => (
              <QuoteBlock key={i} text={q} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function ReputationTable({
  pillars,
}: {
  pillars: IntelligenceReportReputationPillar[];
}) {
  return (
    <section>
      <SectionHeader
        index="04"
        title="Reputation Pillars"
        count={pillars.length}
      />
      {pillars.length === 0 ? (
        <EmptyState label="No reputation pillars assessed." />
      ) : (
        <Table headers={["Pillar", "Score", "Evidence"]}>
          {pillars.map((p, i) => (
            <tr key={i}>
              <TableCell mono>{p.name || "—"}</TableCell>
              <TableCell mono>
                <span
                  style={{
                    fontWeight: 600,
                    color:
                      (p.score ?? 0) >= 70
                        ? C.sage
                        : (p.score ?? 0) >= 40
                          ? C.amber
                          : C.red,
                  }}
                >
                  {(p.score ?? 0).toFixed(0)}
                </span>
                <span style={{ color: C.textMuted }}> / 100</span>
              </TableCell>
              <TableCell>{p.evidence || "—"}</TableCell>
            </tr>
          ))}
        </Table>
      )}
    </section>
  );
}

function EntitiesTable({
  entities,
}: {
  entities: IntelligenceReportEntity[];
}) {
  return (
    <section>
      <SectionHeader
        index="05"
        title="Entities Mentioned"
        count={entities.length}
      />
      {entities.length === 0 ? (
        <EmptyState label="No entities extracted." />
      ) : (
        <Table headers={["Name", "Type", "Context"]}>
          {entities.map((e, i) => (
            <tr key={i}>
              <TableCell mono>{e.name || "—"}</TableCell>
              <TableCell mono>{e.type || "—"}</TableCell>
              <TableCell>{e.context || "—"}</TableCell>
            </tr>
          ))}
        </Table>
      )}
    </section>
  );
}

function EventsTable({
  events,
}: {
  events: IntelligenceReportEvent[];
}) {
  return (
    <section>
      <SectionHeader
        index="06"
        title="Recent Events"
        count={events.length}
      />
      {events.length === 0 ? (
        <EmptyState label="No recent events surfaced." />
      ) : (
        <Table headers={["Date", "Event", "Source URL"]}>
          {events.map((e, i) => (
            <tr key={i}>
              <TableCell mono>{e.date || "—"}</TableCell>
              <TableCell>{e.event || "—"}</TableCell>
              <TableCell>
                {e.source_url ? (
                  <a
                    href={e.source_url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    style={{
                      color: C.sage,
                      fontFamily: FONT_MONO,
                      fontSize: "11px",
                      textDecoration: "none",
                      wordBreak: "break-all",
                    }}
                  >
                    {e.source_url.length > 80
                      ? e.source_url.slice(0, 78) + "…"
                      : e.source_url}
                  </a>
                ) : (
                  <span style={{ color: C.textMuted }}>—</span>
                )}
              </TableCell>
            </tr>
          ))}
        </Table>
      )}
    </section>
  );
}

function EvidenceAppendix({
  evidence,
}: {
  evidence: IntelligenceReportEvidenceEntry[];
}) {
  return (
    <section>
      <SectionHeader
        index="07"
        title="Evidence Appendix"
        count={evidence.length}
      />
      {evidence.length === 0 ? (
        <EmptyState label="No evidence appendix entries." />
      ) : (
        <Table
          headers={[
            "Source URL",
            "Source Name",
            "Published",
            "Key Quote",
            "Reliability",
          ]}
        >
          {evidence.map((e, i) => (
            <tr key={i}>
              <TableCell mono>
                {e.source_url ? (
                  <a
                    href={e.source_url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    style={{
                      color: C.sage,
                      textDecoration: "none",
                      wordBreak: "break-all",
                    }}
                  >
                    {e.source_url.length > 60
                      ? e.source_url.slice(0, 58) + "…"
                      : e.source_url}
                  </a>
                ) : (
                  <span style={{ color: C.textMuted }}>—</span>
                )}
              </TableCell>
              <TableCell>{e.source_name || "—"}</TableCell>
              <TableCell mono>{e.published_date || "—"}</TableCell>
              <TableCell>
                <QuoteBlock text={e.key_quote} />
              </TableCell>
              <TableCell>
                <ReliabilityBadge reliability={e.reliability} />
              </TableCell>
            </tr>
          ))}
        </Table>
      )}
    </section>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div
      style={{
        border: `1px solid ${C.border}`,
        borderStyle: "dashed",
        padding: "24px",
        textAlign: "center",
        color: C.textMuted,
        fontSize: "12px",
        fontFamily: FONT_MONO,
        background: C.surface,
        borderRadius: "2px",
      }}
    >
      {label}
    </div>
  );
}

// ─── REPORT RENDERER ──────────────────────────────────────────────

function ReportView({
  report,
  company,
}: {
  report: RawIntelligenceReport;
  company: CompanyOption;
}) {
  const generatedAt = new Date().toISOString();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "32px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "12px",
          paddingBottom: "16px",
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div>
          <div
            style={{
              fontSize: "10px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: C.textMuted,
              marginBottom: "4px",
            }}
          >
            Subject
          </div>
          <div
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: C.text,
              letterSpacing: "-0.01em",
            }}
          >
            {company.name}
          </div>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: "11px",
              color: C.textMuted,
              marginTop: "2px",
            }}
          >
            slug: {company.slug}
          </div>
        </div>
        <div
          style={{
            textAlign: "right",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: C.textMuted,
              marginBottom: "4px",
            }}
          >
            Generated
          </div>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: "12px",
              color: C.text,
            }}
          >
            {generatedAt}
          </div>
        </div>
      </div>

      <ExecutiveSummary text={report.executive_summary} />
      <RisksTable risks={report.risks || []} />
      <SentimentBlock sentiment={report.sentiment} />
      <ReputationTable pillars={report.reputation?.pillars || []} />
      <EntitiesTable entities={report.entities_mentioned || []} />
      <EventsTable events={report.recent_events || []} />
      <EvidenceAppendix evidence={report.evidence_appendix || []} />
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────

export default function IntelligencePage() {
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [companiesError, setCompaniesError] = useState<string | null>(null);

  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [enqueueError, setEnqueueError] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState(false);

  const { progress, status, result, error: pollError, reset: resetPoller } =
    useAuditPoller(jobId);

  // ─── Load company dropdown on mount ────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/companies?page=1&limit=100", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const list: CompanyOption[] = (json.data || []).map(
          (c: { id: string; slug: string; name: string; sector?: string }) => ({
            id: c.id,
            slug: c.slug,
            name: c.name,
            sector: c.sector,
          }),
        );
        if (!cancelled) {
          list.sort((a, b) => a.name.localeCompare(b.name));
          setCompanies(list);
          setCompaniesLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setCompaniesError(
            e instanceof Error ? e.message : "Failed to load companies",
          );
          setCompaniesLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ─── Derive UI phase from poller state ─────────────────────────
  const phase: Phase = (() => {
    if (!jobId) return "idle";
    if (status === "completed") return "completed";
    if (status === "failed") return "failed";
    return "generating";
  })();

  const selectedCompany = companies.find((c) => c.slug === selectedSlug) || null;

  const canGenerate =
    !!selectedCompany && phase !== "generating" && !enqueueError;

  // ─── Generate handler ──────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    if (!selectedCompany) return;
    setEnqueueError(null);
    setDownloaded(false);
    resetPoller();
    try {
      const res = await fetch("/api/atelier/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: selectedCompany.name }),
      });

      if (res.status === 401) {
        setEnqueueError("Authentication required. Please sign in.");
        return;
      }
      if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        const resetTime = data.resetAt
          ? new Date(data.resetAt).toLocaleTimeString()
          : "later";
        setEnqueueError(
          `Rate limit exceeded. Remaining: ${data.remaining ?? 0}. Resets at ${resetTime}.`,
        );
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setEnqueueError(
          data.error || data.details || `Request failed (HTTP ${res.status})`,
        );
        return;
      }

      const data = await res.json();
      if (!data.jobId) {
        setEnqueueError("Server did not return a jobId.");
        return;
      }
      setJobId(data.jobId);
    } catch (e) {
      setEnqueueError(
        e instanceof Error ? e.message : "Failed to enqueue audit",
      );
    }
  }, [selectedCompany, resetPoller]);

  // ─── Download handler ──────────────────────────────────────────
  const handleDownload = useCallback(() => {
    if (!result || !selectedCompany) return;
    const ts = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .replace("T", "_")
      .slice(0, 19);
    const filename = `${selectedCompany.slug}-intelligence-report-${ts}.json`;
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloaded(true);
  }, [result, selectedCompany]);

  // ─── Reset handler ─────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setJobId(null);
    setEnqueueError(null);
    setDownloaded(false);
    resetPoller();
  }, [resetPoller]);

  // ─── Render ────────────────────────────────────────────────────
  return (
    <main
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: FONT_BODY,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ─── HEADER ─── */}
      <header
        style={{
          borderBottom: `1px solid ${C.border}`,
          background: C.surface,
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "8px",
                  height: "8px",
                  background: C.sage,
                  borderRadius: "1px",
                }}
              />
              <span
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: C.textMuted,
                  fontFamily: FONT_MONO,
                }}
              >
                Harch Atelier · v4.1
              </span>
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: 600,
                color: C.text,
                letterSpacing: "-0.02em",
              }}
            >
              Raw Intelligence Export
            </h1>
          </div>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontSize: "10px",
              color: C.textMuted,
              textAlign: "right",
              lineHeight: 1.5,
            }}
          >
            Forensic report generator
            <br />
            Evidence-quoted · No recommendations
          </div>
        </div>
      </header>

      {/* ─── BODY ─── */}
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          width: "100%",
          padding: "32px 24px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* ─── CONTROL PANEL ─── */}
        <section
          aria-label="Generation controls"
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            padding: "20px",
            borderRadius: "2px",
          }}
        >
          <label
            htmlFor="company-select"
            style={{
              display: "block",
              fontSize: "10px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: C.textMuted,
              marginBottom: "8px",
              fontFamily: FONT_MONO,
            }}
          >
            Subject Company
          </label>
          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              alignItems: "flex-end",
            }}
          >
            <div style={{ flex: "1 1 280px", minWidth: "240px" }}>
              <select
                id="company-select"
                value={selectedSlug}
                onChange={(e) => setSelectedSlug(e.target.value)}
                disabled={phase === "generating" || companiesLoading}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  fontFamily: FONT_BODY,
                  fontSize: "13px",
                  color: C.text,
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: "2px",
                  cursor:
                    phase === "generating" || companiesLoading
                      ? "not-allowed"
                      : "pointer",
                  appearance: "none",
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='%23525252' d='M0 0l5 6 5-6z'/></svg>")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px center",
                  paddingRight: "32px",
                }}
              >
                <option value="">
                  {companiesLoading
                    ? "Loading companies…"
                    : companiesError
                      ? "Failed to load"
                      : "— Select a company —"}
                </option>
                {companies.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                    {c.sector ? ` · ${c.sector}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={!canGenerate}
              style={{
                padding: "10px 18px",
                fontFamily: FONT_BODY,
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: canGenerate ? C.surface : C.textMuted,
                background: canGenerate ? C.sage : C.surfaceAlt,
                border: `1px solid ${canGenerate ? C.sage : C.border}`,
                borderRadius: "2px",
                cursor: canGenerate ? "pointer" : "not-allowed",
                transition: "background 0.15s",
                minHeight: "44px",
              }}
              onMouseEnter={(e) => {
                if (canGenerate)
                  (e.currentTarget as HTMLButtonElement).style.background =
                    C.sageDark;
              }}
              onMouseLeave={(e) => {
                if (canGenerate)
                  (e.currentTarget as HTMLButtonElement).style.background =
                    C.sage;
              }}
            >
              {phase === "generating"
                ? "Generating…"
                : downloaded
                  ? "Generate New Report"
                  : "Generate Intelligence Report"}
            </button>

            {phase === "completed" && result && (
              <button
                type="button"
                onClick={handleDownload}
                style={{
                  padding: "10px 18px",
                  fontFamily: FONT_BODY,
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: C.sage,
                  background: C.surface,
                  border: `1px solid ${C.sage}`,
                  borderRadius: "2px",
                  cursor: "pointer",
                  minHeight: "44px",
                }}
              >
                Download Report (JSON)
              </button>
            )}

            {downloaded && phase === "completed" && (
              <button
                type="button"
                onClick={handleReset}
                style={{
                  padding: "10px 18px",
                  fontFamily: FONT_BODY,
                  fontSize: "12px",
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: C.textSec,
                  background: "transparent",
                  border: `1px solid ${C.border}`,
                  borderRadius: "2px",
                  cursor: "pointer",
                  minHeight: "44px",
                }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Error / status line */}
          {(enqueueError || companiesError) && (
            <div
              role="alert"
              style={{
                marginTop: "12px",
                padding: "10px 12px",
                background: C.redLight,
                border: `1px solid ${C.red}`,
                borderLeftWidth: "3px",
                color: C.red,
                fontSize: "12px",
                fontFamily: FONT_MONO,
                borderRadius: "2px",
              }}
            >
              {enqueueError || companiesError}
            </div>
          )}
        </section>

        {/* ─── PROGRESS (during generation) ─── */}
        {phase === "generating" && (
          <section
            aria-label="Generation progress"
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              padding: "20px",
              borderRadius: "2px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: C.textMuted,
                  fontFamily: FONT_MONO,
                }}
              >
                Pipeline Status
              </div>
              <div
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: "12px",
                  color: C.text,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {status}
              </div>
            </div>
            <div
              style={{
                height: "6px",
                background: C.surfaceAlt,
                borderRadius: "2px",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: `${Math.min(100, Math.max(0, progress))}%`,
                  height: "100%",
                  background: C.sage,
                  transition: "width 0.6s ease",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "8px",
                fontFamily: FONT_MONO,
                fontSize: "11px",
                color: C.textMuted,
              }}
            >
              <span>Job ID: {jobId}</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </section>
        )}

        {/* ─── FAILURE STATE ─── */}
        {phase === "failed" && (
          <section
            style={{
              background: C.surface,
              border: `1px solid ${C.red}`,
              borderLeftWidth: "3px",
              padding: "20px",
              borderRadius: "2px",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: C.red,
                fontFamily: FONT_MONO,
                marginBottom: "6px",
              }}
            >
              Pipeline Failed
            </div>
            <div
              style={{
                fontSize: "13px",
                color: C.text,
                marginBottom: "12px",
              }}
            >
              {pollError || "Unknown error"}
            </div>
            <button
              type="button"
              onClick={handleReset}
              style={{
                padding: "8px 14px",
                fontFamily: FONT_BODY,
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: C.surface,
                background: C.text,
                border: `1px solid ${C.text}`,
                borderRadius: "2px",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </section>
        )}

        {/* ─── REPORT ─── */}
        {phase === "completed" && result && selectedCompany && (
          <ReportView report={result} company={selectedCompany} />
        )}

        {/* ─── EMPTY STATE ─── */}
        {phase === "idle" && !enqueueError && (
          <div
            style={{
              border: `1px dashed ${C.border}`,
              background: C.surface,
              padding: "48px 24px",
              textAlign: "center",
              borderRadius: "2px",
            }}
          >
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: "11px",
                color: C.textMuted,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              No report loaded
            </div>
            <div
              style={{
                fontSize: "13px",
                color: C.textSec,
                maxWidth: "420px",
                margin: "0 auto",
                lineHeight: 1.6,
              }}
            >
              Select a company above and hit{" "}
              <span style={{ color: C.sage, fontWeight: 600 }}>
                Generate Intelligence Report
              </span>{" "}
              to produce a forensic, evidence-quoted dossier. The job runs
              asynchronously; this page polls every 3 seconds.
            </div>
          </div>
        )}
      </div>

      {/* ─── FOOTER ─── */}
      <footer
        style={{
          marginTop: "auto",
          borderTop: `1px solid ${C.border}`,
          background: C.surface,
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "8px",
            fontFamily: FONT_MONO,
            fontSize: "10px",
            color: C.textMuted,
            letterSpacing: "0.04em",
          }}
        >
          <span>Harch Atelier — Raw Intelligence Export</span>
          <span>v4.1 · Forensic pipeline · No recommendations</span>
        </div>
      </footer>
    </main>
  );
}
