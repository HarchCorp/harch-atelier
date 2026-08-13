"use client";

// ═══════════════════════════════════════════════════════════════
//  TeamPerformanceGenerator
//
//  Skill 20 — Tableau de bord de la performance de l'équipe.
//
//  Per-team-member performance stats with comparison chart.
//  Mirrors the BriefingGenerator popup pattern (fixed overlay,
//  scale entrance, sections fade-in with framer-motion, print CSS
//  isolation for PDF export).
//
//  Layout:
//    a. Header bar — "Performance de l'équipe" + PDF + close
//    b. Summary band — company name, generated date, aggregate
//       totals (members, questions, reports, top performer name)
//    c. Horizontal bar chart — performance score comparison across
//       all members. Top performer is highlighted in sage, others
//       in charcoal. Bars animate width-in (staggered).
//    d. Sort selector — 4 chips (Score / Questions / Rapports /
//       Réactivité). Clicking re-sorts both the chart and the grid.
//    e. Member cards grid — avatar initials, name, role, top
//       performer badge, 2x2 stats grid (questions, reports,
//       dernière connexion, réactivité).
//    f. Footer — Exporter PDF + Régénérer.
//
//  Data source: POST /api/console/team-performance
//
//  Design tokens: white / sage / charcoal, Space Mono (mono labels),
//  Inter (body), Lucide icons, NO emojis. All labels in French.
//
//  Skill ID: SKILL-20-TEAM-PERF
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Users,
  MessageSquare,
  FileText,
  Clock,
  Award,
  TrendingUp,
  UserCircle2,
} from "lucide-react";

// ─── Design tokens (NON-NEGOTIABLE per spec) ───────────────────
const WHITE = "#FFFFFF";
const SAGE = "#4A7B5F";
const SAGE_BG = "rgba(74,123,95,0.08)";
const SAGE_BORDER = "rgba(74,123,95,0.25)";
const CHARCOAL = "#0A0A0A";
const CHARCOAL_SOFT = "rgba(10,10,10,0.10)";
const TEXT_BODY = "#525252";
const TEXT_MUTED = "#71717A";
const BORDER = "#F0F0F0";
const AMBER = "#F59E0B";

// ─── Types — mirrors TeamPerformanceResponse from route.ts ─────

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  questions: number;
  reports: number;
  lastLogin: string | null;
  responseTime: number | null;
  performanceScore: number;
  isTopPerformer: boolean;
}

interface TeamPerformanceData {
  members: TeamMember[];
  meta: {
    companyName: string;
    generatedAt: string;
    totalMembers: number;
    totalQuestions: number;
    totalReports: number;
    source: "neon" | "empty";
  };
}

// ─── Section reveal schedule ───────────────────────────────────
const SECTIONS = [
  { id: "summary", delay: 200 },
  { id: "chart", delay: 400 },
  { id: "sort", delay: 600 },
  { id: "grid", delay: 800 },
  { id: "actions", delay: 1000 },
];

type SortKey = "score" | "questions" | "reports" | "responseTime";

const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: "score", label: "Score" },
  { key: "questions", label: "Questions" },
  { key: "reports", label: "Rapports" },
  { key: "responseTime", label: "Réactivité" },
];

// ─── Formatting helpers ────────────────────────────────────────

/** Build 1-2 char uppercase initials from a display name. */
function initialsOf(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
}

/**
 * Format a median response time (minutes) as a short French string.
 * null → "—" (no data), <60m → "Xm", <24h → "Xh", else → "Xj".
 */
function formatResponseTime(minutes: number | null): string {
  if (minutes === null) return "—";
  if (minutes < 1) return "<1m";
  if (minutes < 60) return `${Math.round(minutes)}m`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h`;
  return `${Math.round(minutes / 1440)}j`;
}

/** Relative French label for an ISO last-login timestamp. */
function formatLastLogin(iso: string | null): string {
  if (!iso) return "Jamais";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const diffMs = Date.now() - then;
  const dayMs = 24 * 60 * 60 * 1000;
  if (diffMs < dayMs) return "Aujourd'hui";
  if (diffMs < 2 * dayMs) return "Hier";
  if (diffMs < 7 * dayMs) return `Il y a ${Math.floor(diffMs / dayMs)}j`;
  if (diffMs < 30 * dayMs) return `Il y a ${Math.floor(diffMs / dayMs)}j`;
  return `Il y a >30j`;
}

/** Format the generated-at timestamp as "15 juil. 2026 — 09:42". */
function formatGeneratedAt(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

// ─── Component ─────────────────────────────────────────────────

export function TeamPerformanceGenerator({
  onClose,
}: {
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TeamPerformanceData | null>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(
    new Set(),
  );
  const [generating, setGenerating] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("score");

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setData(null);
    setVisibleSections(new Set());
    setGenerating(true);
    setSortKey("score");
    try {
      const res = await fetch("/api/console/team-performance", {
        method: "POST",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload: TeamPerformanceData = await res.json();
      setData(payload);
      setLoading(false);
      for (const section of SECTIONS) {
        setTimeout(() => {
          setVisibleSections((prev) => new Set(prev).add(section.id));
          if (section.id === "actions") setGenerating(false);
        }, section.delay);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec");
      setLoading(false);
      setGenerating(false);
    }
  }, []);

  useEffect(() => {
    void generate();
  }, [generate]);

  // Sort members client-side based on the active sort key.
  // responseTime sorts ascending (shorter = more responsive); the
  // others sort descending. null responseTime always sinks to the
  // bottom regardless of direction.
  const sortedMembers = useMemo<TeamMember[]>(() => {
    if (!data?.members) return [];
    const list = [...data.members];
    list.sort((a, b) => {
      switch (sortKey) {
        case "score":
          return b.performanceScore - a.performanceScore;
        case "questions":
          return b.questions - a.questions;
        case "reports":
          return b.reports - a.reports;
        case "responseTime": {
          // nulls last; non-nulls ascending (shorter gap first).
          if (a.responseTime === null && b.responseTime === null) return 0;
          if (a.responseTime === null) return 1;
          if (b.responseTime === null) return -1;
          return a.responseTime - b.responseTime;
        }
        default:
          return 0;
      }
    });
    return list;
  }, [data, sortKey]);

  const topPerformer = useMemo<TeamMember | null>(() => {
    if (!data?.members) return null;
    return (
      data.members.find((m) => m.isTopPerformer) ?? null
    );
  }, [data]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(10,10,10,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          width: "100%",
          maxWidth: 920,
          maxHeight: "90vh",
          background: WHITE,
          borderRadius: 12,
          border: `1px solid ${BORDER}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Header bar ─────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: `1px solid ${BORDER}`,
            background: "#FAFAFA",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Users size={18} style={{ color: SAGE }} />
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: CHARCOAL,
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              Performance de l'équipe
            </span>
            {generating && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  color: SAGE,
                  fontFamily: "'Space Mono', monospace",
                }}
              >
                <Loader2 size={11} className="animate-spin" /> Calcul...
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => window.print()}
              disabled={generating || !data}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                background:
                  generating || !data ? BORDER : CHARCOAL,
                color: generating || !data ? TEXT_MUTED : WHITE,
                border: "none",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: generating || !data ? "not-allowed" : "pointer",
                fontFamily: "inherit",
              }}
            >
              <Download size={13} /> PDF
            </button>
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: TEXT_MUTED,
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ─── Document body ──────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "32px 40px",
            fontFamily: "'Inter', system-ui, sans-serif",
            color: CHARCOAL,
          }}
        >
          {loading && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <Loader2
                size={32}
                style={{
                  color: SAGE,
                  animation: "spin 1s linear infinite",
                }}
              />
              <p
                style={{
                  marginTop: 16,
                  fontSize: 14,
                  color: TEXT_MUTED,
                }}
              >
                Collecte des statistiques d'équipe...
              </p>
            </div>
          )}

          {error && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <AlertTriangle size={32} style={{ color: "#EF4444" }} />
              <p
                style={{
                  marginTop: 12,
                  fontSize: 14,
                  color: "#EF4444",
                }}
              >
                {error}
              </p>
              <button
                onClick={generate}
                style={{
                  marginTop: 16,
                  padding: "8px 16px",
                  background: CHARCOAL,
                  color: WHITE,
                  border: "none",
                  borderRadius: 6,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Réessayer
              </button>
            </div>
          )}

          {data && (
            <div id="team-performance-document">
              {/* ─── Title + meta ─────────────────────────────── */}
              <div style={{ marginBottom: 24 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <Clock size={14} style={{ color: SAGE }} />
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "'Space Mono', monospace",
                      color: SAGE,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {formatGeneratedAt(data.meta.generatedAt)}
                  </span>
                </div>
                <h1
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    margin: 0,
                    color: CHARCOAL,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Performance — {data.meta.companyName}
                </h1>
                <p
                  style={{
                    fontSize: 13,
                    color: TEXT_MUTED,
                    marginTop: 4,
                  }}
                >
                  Tableau de bord individuel · {data.meta.totalMembers}{" "}
                  {data.meta.totalMembers > 1 ? "membres" : "membre"}
                </p>
              </div>

              {/* ─── Empty state ──────────────────────────────── */}
              {data.members.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "48px 24px",
                    background: "#FAFAFA",
                    borderRadius: 8,
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  <UserCircle2
                    size={32}
                    style={{ color: TEXT_MUTED, margin: "0 auto" }}
                  />
                  <p
                    style={{
                      marginTop: 12,
                      fontSize: 14,
                      fontWeight: 600,
                      color: CHARCOAL,
                    }}
                  >
                    Aucun membre d'équipe pour le moment
                  </p>
                  <p
                    style={{
                      marginTop: 4,
                      fontSize: 12,
                      color: TEXT_MUTED,
                    }}
                  >
                    Invitez des collaborateurs depuis la page Gestion des
                    utilisateurs pour suivre leur activité.
                  </p>
                </div>
              )}

              <AnimatePresence>
                {visibleSections.has("summary") &&
                  data.members.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(4, 1fr)",
                        gap: 8,
                        marginBottom: 28,
                      }}
                    >
                      <SummaryStat
                        icon={Users}
                        label="Membres"
                        value={String(data.meta.totalMembers)}
                      />
                      <SummaryStat
                        icon={MessageSquare}
                        label="Questions"
                        value={String(data.meta.totalQuestions)}
                      />
                      <SummaryStat
                        icon={FileText}
                        label="Rapports"
                        value={String(data.meta.totalReports)}
                      />
                      <SummaryStat
                        icon={Award}
                        label="Top performeur"
                        value={
                          topPerformer
                            ? topPerformer.name.split(" ")[0] ?? "—"
                            : "—"
                        }
                        highlight={!!topPerformer}
                      />
                    </motion.div>
                  )}
              </AnimatePresence>

              <AnimatePresence>
                {visibleSections.has("chart") &&
                  data.members.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ marginBottom: 28 }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          fontFamily: "'Space Mono', monospace",
                          color: TEXT_MUTED,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          marginBottom: 12,
                        }}
                      >
                        Score de performance comparé
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        {sortedMembers.map((m, i) => (
                          <BarRow
                            key={m.id}
                            member={m}
                            delay={i * 60}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
              </AnimatePresence>

              <AnimatePresence>
                {visibleSections.has("sort") &&
                  data.members.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        marginBottom: 20,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          fontFamily: "'Space Mono', monospace",
                          color: TEXT_MUTED,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          marginRight: 4,
                        }}
                      >
                        Trier par
                      </span>
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => setSortKey(opt.key)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "5px 12px",
                            background:
                              sortKey === opt.key ? CHARCOAL : WHITE,
                            color:
                              sortKey === opt.key ? WHITE : TEXT_BODY,
                            border: `1px solid ${
                              sortKey === opt.key ? CHARCOAL : BORDER
                            }`,
                            borderRadius: 999,
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
              </AnimatePresence>

              <AnimatePresence>
                {visibleSections.has("grid") &&
                  data.members.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(260px, 1fr))",
                        gap: 12,
                        marginBottom: 24,
                      }}
                    >
                      {sortedMembers.map((m) => (
                        <MemberCard key={m.id} member={m} />
                      ))}
                    </motion.div>
                  )}
              </AnimatePresence>

              <AnimatePresence>
                {visibleSections.has("actions") &&
                  data.members.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        display: "flex",
                        gap: 8,
                        paddingTop: 16,
                        borderTop: `1px solid ${BORDER}`,
                      }}
                    >
                      <button
                        onClick={() => window.print()}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "10px 20px",
                          background: CHARCOAL,
                          color: WHITE,
                          border: "none",
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        <Download size={14} /> Exporter PDF
                      </button>
                      <button
                        onClick={generate}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "10px 16px",
                          background: "transparent",
                          color: TEXT_BODY,
                          border: `1px solid ${BORDER}`,
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        <RefreshCw size={14} /> Régénérer
                      </button>
                    </motion.div>
                  )}
              </AnimatePresence>

              {generating && data.members.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 16,
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: SAGE,
                      animation: "pulse 1s infinite",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      color: SAGE,
                      fontFamily: "'Space Mono', monospace",
                    }}
                  >
                    Finalisation du tableau de bord...
                  </span>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @media print {
          body * { visibility: hidden; }
          #team-performance-document,
          #team-performance-document * { visibility: visible; }
          #team-performance-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────

function SummaryStat({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        padding: "14px 12px",
        background: highlight ? SAGE_BG : "#FAFAFA",
        borderRadius: 8,
        border: `1px solid ${highlight ? SAGE_BORDER : BORDER}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 6,
        }}
      >
        <Icon
          size={12}
          style={{ color: highlight ? SAGE : TEXT_MUTED }}
        />
        <span
          style={{
            fontSize: 9,
            fontFamily: "'Space Mono', monospace",
            color: highlight ? SAGE : TEXT_MUTED,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight: 700,
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: highlight ? SAGE : CHARCOAL,
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function BarRow({
  member,
  delay,
}: {
  member: TeamMember;
  delay: number;
}) {
  const isTop = member.isTopPerformer;
  const barColor = isTop ? SAGE : CHARCOAL;
  const widthPct = Math.max(2, member.performanceScore); // min 2% so 0-scores are still visible as a sliver

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "28px 1fr 120px 48px",
        alignItems: "center",
        gap: 10,
      }}
    >
      {/* Avatar mini */}
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: isTop ? SAGE : CHARCOAL_SOFT,
          color: isTop ? WHITE : CHARCOAL,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          fontWeight: 700,
          fontFamily: "'Space Mono', monospace",
        }}
      >
        {initialsOf(member.name)}
      </div>

      {/* Name */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: CHARCOAL,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {member.name}
        </span>
        {isTop && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              padding: "2px 6px",
              background: SAGE_BG,
              color: SAGE,
              borderRadius: 999,
              fontSize: 9,
              fontWeight: 700,
              fontFamily: "'Space Mono', monospace",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              flexShrink: 0,
            }}
          >
            <Award size={9} /> Top
          </span>
        )}
      </div>

      {/* Bar */}
      <div
        style={{
          height: 10,
          background: "#F4F4F4",
          borderRadius: 5,
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${widthPct}%` }}
          transition={{ duration: 0.6, delay: delay / 1000, ease: "easeOut" }}
          style={{
            height: "100%",
            background: barColor,
            borderRadius: 5,
          }}
        />
      </div>

      {/* Score number */}
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: isTop ? SAGE : CHARCOAL,
          fontFamily: "'Space Mono', monospace",
          textAlign: "right",
        }}
      >
        {member.performanceScore}
      </div>
    </div>
  );
}

function MemberCard({ member }: { member: TeamMember }) {
  const isTop = member.isTopPerformer;
  const suspended = member.status === "suspended";

  return (
    <div
      style={{
        padding: 16,
        background: isTop ? SAGE_BG : WHITE,
        borderRadius: 10,
        border: `1px solid ${isTop ? SAGE_BORDER : BORDER}`,
        position: "relative",
      }}
    >
      {/* Top performer ribbon */}
      {isTop && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
            padding: "3px 8px",
            background: SAGE,
            color: WHITE,
            borderRadius: 999,
            fontSize: 9,
            fontWeight: 700,
            fontFamily: "'Space Mono', monospace",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          <Award size={10} /> Top performeur
        </div>
      )}

      {/* Header: avatar + name + role */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: isTop ? SAGE : CHARCOAL_SOFT,
            color: isTop ? WHITE : CHARCOAL,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 700,
            fontFamily: "'Space Mono', monospace",
            flexShrink: 0,
          }}
        >
          {initialsOf(member.name)}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: CHARCOAL,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {member.name}
            {suspended && (
              <span
                style={{
                  marginLeft: 6,
                  fontSize: 9,
                  color: AMBER,
                  fontFamily: "'Space Mono', monospace",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                · Suspendu
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: 11,
              color: TEXT_MUTED,
              marginTop: 2,
            }}
          >
            {member.role}
          </div>
        </div>
      </div>

      {/* Score strip */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 12,
          paddingBottom: 12,
          borderBottom: `1px solid ${isTop ? SAGE_BORDER : BORDER}`,
        }}
      >
        <span
          style={{
            fontSize: 9,
            fontFamily: "'Space Mono', monospace",
            color: TEXT_MUTED,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          Score
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 4,
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: isTop ? SAGE : CHARCOAL,
              lineHeight: 1,
              fontFamily: "'Space Mono', monospace",
            }}
          >
            {member.performanceScore}
          </span>
          <span
            style={{
              fontSize: 10,
              color: TEXT_MUTED,
              fontFamily: "'Space Mono', monospace",
            }}
          >
            /100
          </span>
        </div>
      </div>

      {/* 2x2 stats grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
        }}
      >
        <CardStat
          icon={MessageSquare}
          label="Questions"
          value={String(member.questions)}
        />
        <CardStat
          icon={FileText}
          label="Rapports"
          value={String(member.reports)}
        />
        <CardStat
          icon={Clock}
          label="Dernière connexion"
          value={formatLastLogin(member.lastLogin)}
        />
        <CardStat
          icon={TrendingUp}
          label="Réactivité"
          value={formatResponseTime(member.responseTime)}
        />
      </div>
    </div>
  );
}

function CardStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          marginBottom: 4,
        }}
      >
        <Icon size={10} style={{ color: TEXT_MUTED }} />
        <span
          style={{
            fontSize: 9,
            fontFamily: "'Space Mono', monospace",
            color: TEXT_MUTED,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: CHARCOAL,
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
    </div>
  );
}
