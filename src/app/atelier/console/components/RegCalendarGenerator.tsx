"use client";

// ═══════════════════════════════════════════════════════════════
//  RegCalendarGenerator
//
//  Popup modal — monthly calendar view with regulatory deadlines
//  marked as colored dots. Same popup pattern as BriefingGenerator:
//  fixed overlay, motion fade-in, sections appear one by one.
//
//  Layout:
//    ┌── header (title + month nav + actions) ──────────────┐
//    ├── 2-col body ────────────────────────────────────────┤
//    │  LEFT  : calendar grid (7 cols × 6 weeks)            │
//    │          • weekday row (Lun..Dim)                    │
//    │          • today indicator (sage circle)             │
//    │          • deadline dots (colored by regulator)      │
//    │          • legend (CNDP/AMMC/BAM/ESG/GDPR)           │
//    │  RIGHT : sidebar                                     │
//    │          • 3 prochaines échéances                    │
//    │          • détails du jour (selected date)           │
//    └── actions (Exporter PDF / Rafraîchir) ───────────────┘
//
//  Regulator colors:
//    CNDP = sage     AMMC = slate
//    BAM  = amber    ESG  = green
//    GDPR = red
//
//  Task ID: SKILL-12-REG-CALENDAR
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  FileText,
  Users,
  ListChecks,
  CircleDot,
  RefreshCw,
} from "lucide-react";

// ─── DESIGN TOKENS ───────────────────────────────────────────────

const SAGE = "#4A7B5F";
const SAGE_BG = "rgba(74,123,95,0.08)";
const SAGE_BORDER = "rgba(74,123,95,0.3)";
const CHARCOAL = "#0A0A0A";
const TEXT_BODY = "#525252";
const TEXT_MUTED = "#71717A";
const BORDER = "#F0F0F0";
const BG_FAINT = "#FAFAFA";
const AMBER = "#F59E0B";
const NEGATIVE = "#EF4444";

const REGULATOR_COLORS: Record<string, string> = {
  CNDP: SAGE,
  AMMC: "#64748B", // slate-500
  BAM: AMBER,
  ESG: "#10B981", // emerald-500
  GDPR: NEGATIVE,
};

const STATUS_COLORS: Record<string, string> = {
  "à venir": SAGE,
  "échéance": AMBER,
  "dépassé": TEXT_MUTED,
};

const MONTHS_FR = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const WEEKDAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

// ─── TYPES ───────────────────────────────────────────────────────

interface Deadline {
  id: string;
  date: string; // YYYY-MM-DD
  regulator: "CNDP" | "AMMC" | "BAM" | "ESG" | "GDPR";
  title: string;
  status: "à venir" | "échéance" | "dépassé";
  requirement: string;
  documents: string[];
  team: string;
}

interface CalData {
  focusMonth: string; // YYYY-MM
  deadlines: Deadline[];
  generatedAt: string;
  source: string;
  regulators: string[];
}

// ─── SECTION REVEAL ──────────────────────────────────────────────
//
//  Same pattern as BriefingGenerator: each section is gated by an
//  entry in `visibleSections`, added progressively via setTimeout
//  so the popup fills in section-by-section instead of appearing
//  all at once.

const SECTIONS = [
  { id: "header", delay: 200 },
  { id: "monthNav", delay: 350 },
  { id: "calendar", delay: 550 },
  { id: "nextThree", delay: 750 },
  { id: "dayDetails", delay: 950 },
  { id: "actions", delay: 1150 },
];

// ─── DATE HELPERS ────────────────────────────────────────────────

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatLongDate(s: string): string {
  const d = parseDate(s);
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()].toLowerCase()} ${d.getFullYear()}`;
}

function daysBetween(from: string, to: string): number {
  const a = parseDate(from);
  const b = parseDate(to);
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

// ─── COMPONENT ───────────────────────────────────────────────────

export function RegCalendarGenerator({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CalData | null>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(
    new Set(),
  );
  const [generating, setGenerating] = useState(true);

  // Calendar view state — initialised to today's month, then to
  // `focusMonth` returned by the API once data arrives.
  const [viewYear, setViewYear] = useState<number>(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const todayStr = useMemo(() => formatDate(new Date()), []);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setData(null);
    setVisibleSections(new Set());
    setGenerating(true);
    try {
      const res = await fetch("/api/console/reg-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: CalData = await res.json();
      setData(json);
      setLoading(false);

      // Initialise view to the focus month returned by the API,
      // and pre-select today so the day-details panel shows
      // today's obligations immediately.
      if (json.focusMonth) {
        const [y, m] = json.focusMonth.split("-").map(Number);
        setViewYear(y);
        setViewMonth(m - 1);
      }
      setSelectedDate(todayStr);

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
  }, [todayStr]);

  useEffect(() => {
    void generate();
  }, [generate]);

  // ─── DERIVED: 42-cell grid for the current view month ─────────
  //
  //  Start from the Monday of the week containing the 1st of the
  //  month. Monday-first because the French calendar week starts
  //  on Monday.

  const gridDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const dayOfWeek = (firstDay.getDay() + 6) % 7; // 0=Mon, 6=Sun
    const start = new Date(firstDay);
    start.setDate(firstDay.getDate() - dayOfWeek);
    const days: { date: Date; dateStr: string; inMonth: boolean }[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push({
        date: d,
        dateStr: formatDate(d),
        inMonth: d.getMonth() === viewMonth,
      });
    }
    return days;
  }, [viewYear, viewMonth]);

  // ─── DERIVED: deadlines indexed by date string ───────────────

  const deadlinesByDate = useMemo(() => {
    const map = new Map<string, Deadline[]>();
    for (const d of data?.deadlines ?? []) {
      const list = map.get(d.date) ?? [];
      list.push(d);
      map.set(d.date, list);
    }
    return map;
  }, [data]);

  // ─── DERIVED: next 3 upcoming deadlines (date >= today) ──────

  const upcoming = useMemo(() => {
    if (!data) return [];
    return data.deadlines
      .filter((d) => d.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3);
  }, [data, todayStr]);

  // ─── DERIVED: deadlines for the selected date ────────────────

  const selectedDeadlines = useMemo(() => {
    if (!selectedDate) return [];
    const list = deadlinesByDate.get(selectedDate) ?? [];
    return list
      .slice()
      .sort((a, b) => a.regulator.localeCompare(b.regulator));
  }, [selectedDate, deadlinesByDate]);

  // ─── MONTH NAVIGATION ────────────────────────────────────────

  const goPrevMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);

  const goNextMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

  const goToday = useCallback(() => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setSelectedDate(formatDate(now));
  }, []);

  const jumpToDeadline = useCallback((dateStr: string) => {
    const [yy, mm] = dateStr.split("-").map(Number);
    setViewYear(yy);
    setViewMonth(mm - 1);
    setSelectedDate(dateStr);
  }, []);

  const monthLabel = `${MONTHS_FR[viewMonth]} ${viewYear}`;

  // ─── RENDER ──────────────────────────────────────────────────

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
          maxWidth: 980,
          maxHeight: "92vh",
          background: "#FFFFFF",
          borderRadius: 12,
          border: `1px solid ${BORDER}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── HEADER BAR ──────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: `1px solid ${BORDER}`,
            background: BG_FAINT,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CalendarDays size={18} style={{ color: SAGE }} />
            <span
              style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL }}
            >
              Calendrier réglementaire
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
                <Loader2
                  size={11}
                  style={{ animation: "spin 1s linear infinite" }}
                />{" "}
                Chargement...
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
                background: generating || !data ? BORDER : CHARCOAL,
                color: generating || !data ? TEXT_MUTED : "#FFFFFF",
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
              aria-label="Fermer"
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

        {/* ─── BODY ────────────────────────────────────────── */}
        <div
          id="reg-calendar-document"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px 28px",
            fontFamily: "'Inter', system-ui, sans-serif",
            color: CHARCOAL,
          }}
        >
          {loading && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <Loader2
                size={32}
                style={{ color: SAGE, animation: "spin 1s linear infinite" }}
              />
              <p
                style={{
                  marginTop: 16,
                  fontSize: 14,
                  color: TEXT_MUTED,
                }}
              >
                Chargement des échéances réglementaires...
              </p>
            </div>
          )}

          {error && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <AlertTriangle size={32} style={{ color: NEGATIVE }} />
              <p
                style={{
                  marginTop: 12,
                  fontSize: 14,
                  color: NEGATIVE,
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
                  color: "#FFFFFF",
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
            <div>
              {/* ─── MONTH NAVIGATION ─────────────────────── */}
              <AnimatePresence>
                {visibleSections.has("monthNav") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 20,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 10,
                          fontFamily: "'Space Mono', monospace",
                          color: SAGE,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          marginBottom: 4,
                        }}
                      >
                        Calendrier mensuel
                      </div>
                      <h2
                        style={{
                          fontSize: 24,
                          fontWeight: 700,
                          margin: 0,
                          color: CHARCOAL,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {monthLabel}
                      </h2>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <button
                        onClick={goPrevMonth}
                        aria-label="Mois précédent"
                        style={{
                          width: 36,
                          height: 36,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#FFFFFF",
                          border: `1px solid ${BORDER}`,
                          borderRadius: 8,
                          cursor: "pointer",
                          color: CHARCOAL,
                        }}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={goToday}
                        style={{
                          padding: "8px 14px",
                          background: "#FFFFFF",
                          border: `1px solid ${BORDER}`,
                          borderRadius: 8,
                          cursor: "pointer",
                          color: CHARCOAL,
                          fontSize: 12,
                          fontWeight: 600,
                          fontFamily: "inherit",
                        }}
                      >
                        Aujourd&apos;hui
                      </button>
                      <button
                        onClick={goNextMonth}
                        aria-label="Mois suivant"
                        style={{
                          width: 36,
                          height: 36,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#FFFFFF",
                          border: `1px solid ${BORDER}`,
                          borderRadius: 8,
                          cursor: "pointer",
                          color: CHARCOAL,
                        }}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── 2-COLUMN: CALENDAR + SIDEBAR ─────────── */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.6fr 1fr",
                  gap: 24,
                }}
              >
                {/* ── CALENDAR ── */}
                <AnimatePresence>
                  {visibleSections.has("calendar") && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        background: "#FFFFFF",
                        border: `1px solid ${BORDER}`,
                        borderRadius: 10,
                        padding: 16,
                      }}
                    >
                      {/* Weekday header */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(7, 1fr)",
                          gap: 4,
                          marginBottom: 8,
                        }}
                      >
                        {WEEKDAYS_FR.map((w) => (
                          <div
                            key={w}
                            style={{
                              textAlign: "center",
                              fontSize: 10,
                              fontFamily: "'Space Mono', monospace",
                              color: TEXT_MUTED,
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                              padding: "4px 0",
                            }}
                          >
                            {w}
                          </div>
                        ))}
                      </div>

                      {/* Days grid */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(7, 1fr)",
                          gap: 4,
                        }}
                      >
                        {gridDays.map((day, idx) => {
                          const dl = deadlinesByDate.get(day.dateStr) ?? [];
                          const isToday = day.dateStr === todayStr;
                          const isSelected = day.dateStr === selectedDate;
                          return (
                            <button
                              key={idx}
                              onClick={() => setSelectedDate(day.dateStr)}
                              style={{
                                position: "relative",
                                minHeight: 64,
                                padding: "6px 6px 4px",
                                background: isSelected
                                  ? SAGE_BG
                                  : day.inMonth
                                    ? "#FFFFFF"
                                    : BG_FAINT,
                                border: `1px solid ${isSelected ? SAGE_BORDER : BORDER}`,
                                borderRadius: 6,
                                cursor: "pointer",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                                gap: 4,
                                fontFamily: "inherit",
                                textAlign: "left",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "flex-start",
                                  alignItems: "center",
                                  width: "100%",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 12,
                                    fontWeight: 600,
                                    width: 22,
                                    height: 22,
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: isToday ? SAGE : "transparent",
                                    color: isToday
                                      ? "#FFFFFF"
                                      : day.inMonth
                                        ? CHARCOAL
                                        : TEXT_MUTED,
                                    fontFamily: "'Space Mono', monospace",
                                  }}
                                >
                                  {day.date.getDate()}
                                </span>
                              </div>
                              {dl.length > 0 && (
                                <div
                                  style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 3,
                                    marginTop: "auto",
                                    alignItems: "center",
                                  }}
                                >
                                  {dl.slice(0, 4).map((d, i) => (
                                    <span
                                      key={i}
                                      style={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: "50%",
                                        background:
                                          REGULATOR_COLORS[d.regulator] ??
                                          TEXT_MUTED,
                                      }}
                                    />
                                  ))}
                                  {dl.length > 4 && (
                                    <span
                                      style={{
                                        fontSize: 9,
                                        color: TEXT_MUTED,
                                        fontFamily: "'Space Mono', monospace",
                                      }}
                                    >
                                      +{dl.length - 4}
                                    </span>
                                  )}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Legend */}
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 12,
                          marginTop: 14,
                          paddingTop: 12,
                          borderTop: `1px solid ${BORDER}`,
                        }}
                      >
                        {(data.regulators ?? []).map((r) => (
                          <div
                            key={r}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                              fontSize: 11,
                              color: TEXT_BODY,
                            }}
                          >
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background:
                                  REGULATOR_COLORS[r] ?? TEXT_MUTED,
                              }}
                            />
                            {r}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── SIDEBAR ── */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                  }}
                >
                  {/* Next 3 deadlines */}
                  <AnimatePresence>
                    {visibleSections.has("nextThree") && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          background: "#FFFFFF",
                          border: `1px solid ${BORDER}`,
                          borderRadius: 10,
                          padding: 16,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginBottom: 12,
                          }}
                        >
                          <ListChecks size={14} style={{ color: SAGE }} />
                          <span
                            style={{
                              fontSize: 10,
                              fontFamily: "'Space Mono', monospace",
                              color: SAGE,
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                              fontWeight: 700,
                            }}
                          >
                            3 prochaines échéances
                          </span>
                        </div>
                        {upcoming.length === 0 && (
                          <p
                            style={{
                              fontSize: 12,
                              color: TEXT_MUTED,
                              margin: 0,
                            }}
                          >
                            Aucune échéance à venir.
                          </p>
                        )}
                        {upcoming.map((d) => {
                          const days = daysBetween(todayStr, d.date);
                          const urgencyColor =
                            days === 0 ? AMBER : days <= 7 ? SAGE : TEXT_MUTED;
                          return (
                            <div
                              key={d.id}
                              onClick={() => jumpToDeadline(d.date)}
                              style={{
                                padding: "10px 0",
                                borderBottom: `1px solid ${BORDER}`,
                                cursor: "pointer",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  marginBottom: 4,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 11,
                                    fontFamily: "'Space Mono', monospace",
                                    color: TEXT_MUTED,
                                  }}
                                >
                                  {formatLongDate(d.date)}
                                </span>
                                <span
                                  style={{
                                    fontSize: 10,
                                    padding: "2px 6px",
                                    borderRadius: 4,
                                    background: `${REGULATOR_COLORS[d.regulator]}1A`,
                                    color: REGULATOR_COLORS[d.regulator],
                                    fontWeight: 600,
                                  }}
                                >
                                  {d.regulator}
                                </span>
                              </div>
                              <div
                                style={{
                                  fontSize: 13,
                                  color: CHARCOAL,
                                  fontWeight: 600,
                                  lineHeight: 1.4,
                                }}
                              >
                                {d.title}
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                  marginTop: 4,
                                  fontSize: 11,
                                  color: urgencyColor,
                                }}
                              >
                                <Clock size={11} />
                                {days === 0
                                  ? "Échéance aujourd'hui"
                                  : days === 1
                                    ? "Dans 1 jour"
                                    : `Dans ${days} jours`}
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Selected day details */}
                  <AnimatePresence>
                    {visibleSections.has("dayDetails") && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          background: "#FFFFFF",
                          border: `1px solid ${BORDER}`,
                          borderRadius: 10,
                          padding: 16,
                          flex: 1,
                          minHeight: 220,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginBottom: 12,
                          }}
                        >
                          <CalendarDays size={14} style={{ color: SAGE }} />
                          <span
                            style={{
                              fontSize: 10,
                              fontFamily: "'Space Mono', monospace",
                              color: SAGE,
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                              fontWeight: 700,
                            }}
                          >
                            {selectedDate
                              ? formatLongDate(selectedDate)
                              : "Sélectionnez une date"}
                          </span>
                        </div>
                        {selectedDeadlines.length === 0 && (
                          <p
                            style={{
                              fontSize: 12,
                              color: TEXT_MUTED,
                              margin: 0,
                            }}
                          >
                            Aucune échéance réglementaire pour cette date.
                          </p>
                        )}
                        {selectedDeadlines.map((d) => (
                          <div
                            key={d.id}
                            style={{
                              padding: "12px 0",
                              borderBottom: `1px solid ${BORDER}`,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: 6,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 10,
                                  padding: "2px 6px",
                                  borderRadius: 4,
                                  background: `${REGULATOR_COLORS[d.regulator]}1A`,
                                  color: REGULATOR_COLORS[d.regulator],
                                  fontWeight: 600,
                                }}
                              >
                                {d.regulator}
                              </span>
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                  fontSize: 10,
                                  fontFamily: "'Space Mono', monospace",
                                  color: STATUS_COLORS[d.status],
                                  textTransform: "uppercase",
                                  letterSpacing: "0.06em",
                                }}
                              >
                                <CircleDot size={10} />
                                {d.status}
                              </span>
                            </div>
                            <div
                              style={{
                                fontSize: 13,
                                color: CHARCOAL,
                                fontWeight: 600,
                                marginBottom: 6,
                                lineHeight: 1.4,
                              }}
                            >
                              {d.title}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                gap: 6,
                                marginBottom: 8,
                                fontSize: 11,
                                color: TEXT_BODY,
                                alignItems: "flex-start",
                              }}
                            >
                              <FileText
                                size={12}
                                style={{
                                  color: TEXT_MUTED,
                                  marginTop: 1,
                                  flexShrink: 0,
                                }}
                              />
                              <span style={{ lineHeight: 1.5 }}>
                                {d.requirement}
                              </span>
                            </div>
                            <div style={{ marginBottom: 6 }}>
                              <div
                                style={{
                                  fontSize: 10,
                                  fontFamily: "'Space Mono', monospace",
                                  color: TEXT_MUTED,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.08em",
                                  marginBottom: 4,
                                }}
                              >
                                Documents requis
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 4,
                                }}
                              >
                                {d.documents.map((doc, i) => (
                                  <span
                                    key={i}
                                    style={{
                                      fontSize: 11,
                                      padding: "2px 8px",
                                      background: BG_FAINT,
                                      borderRadius: 4,
                                      color: TEXT_BODY,
                                    }}
                                  >
                                    {doc}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                fontSize: 11,
                                color: TEXT_BODY,
                              }}
                            >
                              <Users
                                size={11}
                                style={{ color: TEXT_MUTED }}
                              />
                              <span>Équipe : {d.team}</span>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* ─── ACTIONS ───────────────────────────────── */}
              <AnimatePresence>
                {visibleSections.has("actions") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      display: "flex",
                      gap: 8,
                      paddingTop: 20,
                      marginTop: 20,
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
                        color: "#FFFFFF",
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
                      <RefreshCw size={14} /> Rafraîchir
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {generating && (
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
                    Construction du calendrier...
                  </span>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } } @media print { body * { visibility: hidden; } #reg-calendar-document, #reg-calendar-document * { visibility: visible; } #reg-calendar-document { position: absolute; left: 0; top: 0; width: 100%; padding: 32px; max-height: none; overflow: visible; } }`}</style>
    </div>
  );
}
