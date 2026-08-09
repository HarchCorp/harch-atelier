"use client";

// ═══════════════════════════════════════════════════════════════
//  ProDashboard.tsx — CONSOLE PRO (Équipes en croissance)
//
//  Meltwater-inspired growing-team intelligence dashboard.
//  Dense, data-rich, multi-section, mobile-responsive.
//  Every widget fetches real telemetry from /api/console/* —
//  zero mock data (demo users get seeded demo responses that
//  mirror the production shape).
//
//  Sections:
//    1. En-tête — période, titre, source de données
//    2. Comparaison hebdomadaire (NEW) — 4 cartes Cette semaine vs S-1
//    3. Share of Voice donut (NEW) + Tableau sentiment comparé (NEW)
//    4. Sections existantes — benchmarking, radar, dashboards, HarchIQ
//    5. Mentions d'influenceurs (NEW) — top 5 + upsell Grandes Entreprises
//    6. Alertes personnalisées (NEW) — liste + toggle + actions
//    7. Historique des rapports (enhanced) — derniers 5 + générer
//    8. Activité de l'équipe (NEW) — feed chronologique
//
//  Design: DS V2 tokens (C.*). Sage green = user, amber = competitor 1,
//  charcoal = competitor 2, neutral gray = autres. Tables sticky + zebra.
// ═══════════════════════════════════════════════════════════════

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { C } from "../../components/tokens";

// ─── Tokens (sage = user, amber/charcoal = competitors) ─────────
const SAGE = "#10b981";     // emerald-500 — user
const AMBER = "#f59e0b";    // amber-500 — competitor A
const CHARCOAL = "#57534e"; // stone-600 — competitor B
const NEUTRAL = "#a8a29e";  // stone-400 — autres

const FONT = { sans: C.fontSans, mono: C.fontMono };
const SHADOW = { card: C.shadowSm, deep: C.shadowMd };

// ─── Shared layout primitives ────────────────────────────────────
function Card({
  title,
  eyebrow,
  right,
  children,
  style,
  bodyStyle,
}: {
  title?: string;
  eyebrow?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  style?: CSSProperties;
  bodyStyle?: CSSProperties;
}) {
  return (
    <section
      style={{
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: "12px",
        boxShadow: SHADOW.card,
        padding: "20px",
        ...style,
      }}
    >
      {(title || eyebrow || right) && (
        <header
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <div>
            {eyebrow && (
              <div
                style={{
                  fontFamily: FONT.mono,
                  fontSize: "10px",
                  fontWeight: 700,
                  color: C.accent,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "4px",
                }}
              >
                {eyebrow}
              </div>
            )}
            {title && (
              <h3
                style={{
                  margin: 0,
                  fontFamily: FONT.sans,
                  fontSize: "16px",
                  fontWeight: 700,
                  color: C.text,
                }}
              >
                {title}
              </h3>
            )}
          </div>
          {right && <div style={{ flexShrink: 0 }}>{right}</div>}
        </header>
      )}
      <div style={bodyStyle}>{children}</div>
    </section>
  );
}

function SkeletonBlock({ height = 120 }: { height?: number }) {
  return (
    <div
      style={{
        height,
        background: `linear-gradient(90deg, ${C.bgSubtle} 0%, ${C.bgHover} 50%, ${C.bgSubtle} 100%)`,
        borderRadius: "8px",
        animation: "harchPulse 1.6s ease-in-out infinite",
      }}
    />
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      style={{
        padding: "32px 16px",
        textAlign: "center",
        color: C.textMuted,
        fontSize: "13px",
        fontFamily: FONT.sans,
        background: C.bgSubtle,
        borderRadius: "8px",
      }}
    >
      {message}
    </div>
  );
}

function Pill({
  text,
  color,
  background,
}: {
  text: string;
  color: string;
  background: string;
}) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: "4px",
        background,
        color,
        fontFamily: FONT.mono,
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}
    >
      {text}
    </span>
  );
}

function fmtRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "—";
  const diffMs = Date.now() - then;
  const sec = Math.round(diffMs / 1000);
  if (sec < 60) return "À l'instant";
  const min = Math.round(sec / 60);
  if (min < 60) return `Il y a ${min} min`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `Il y a ${hr} h`;
  const day = Math.round(hr / 24);
  if (day < 7) return `Il y a ${day} j`;
  const wk = Math.round(day / 7);
  if (wk < 5) return `Il y a ${wk} sem.`;
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtNumber(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("fr-FR");
}

// ═══════════════════════════════════════════════════════════════
//  SECTION 1 — WEEKLY COMPARISON (NEW)
// ═══════════════════════════════════════════════════════════════

interface MetricDelta {
  current: number;
  previous: number;
  delta: number;
  direction: "up" | "down" | "stable";
}
interface WeeklyComparison {
  metrics: {
    sentimentPct: MetricDelta;
    mentions: MetricDelta;
    sources: MetricDelta;
    aiVisibility: MetricDelta;
  };
  source: string;
}

function WeeklyComparisonSection() {
  const [data, setData] = useState<WeeklyComparison | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/console/weekly-comparison")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d?.metrics) setData(d);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = useMemo(() => {
    if (!data) return [];
    const m = data.metrics;
    return [
      {
        label: "Sentiment positif",
        current: `${m.sentimentPct.current}%`,
        previous: `${m.sentimentPct.previous}%`,
        delta: m.sentimentPct.delta,
        direction: m.sentimentPct.direction,
        goodDirection: "up",
      },
      {
        label: "Mentions",
        current: fmtNumber(m.mentions.current),
        previous: fmtNumber(m.mentions.previous),
        delta: m.mentions.delta,
        direction: m.mentions.direction,
        goodDirection: "up",
      },
      {
        label: "Sources",
        current: `${m.sources.current}`,
        previous: `${m.sources.previous}`,
        delta: m.sources.delta,
        direction: m.sources.direction,
        goodDirection: "up",
      },
      {
        label: "Visibilité IA",
        current: `${m.aiVisibility.current}%`,
        previous: `${m.aiVisibility.previous}%`,
        delta: m.aiVisibility.delta,
        direction: m.aiVisibility.direction,
        goodDirection: "up",
      },
    ];
  }, [data]);

  return (
    <Card
      eyebrow="Comparaison hebdomadaire"
      title="Cette semaine vs semaine dernière"
      right={
        data && (
          <Pill
            text={data.source === "demo" ? "DÉMO" : "TEMPS RÉEL"}
            color={data.source === "demo" ? C.warningText : C.success}
            background={data.source === "demo" ? C.warningBg : C.successBg}
          />
        )
      }
    >
      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px",
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <SkeletonBlock key={i} height={92} />
          ))}
        </div>
      ) : cards.length === 0 ? (
        <EmptyState message="Pas encore assez de données pour comparer cette semaine à la précédente." />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px",
          }}
        >
          {cards.map((c) => {
            const isGood = c.direction === c.goodDirection;
            const isStable = c.direction === "stable";
            const color = isStable ? C.textMuted : isGood ? C.success : C.danger;
            const arrow = c.direction === "up" ? "↑" : c.direction === "down" ? "↓" : "→";
            const deltaText = c.label === "Sources"
              ? `${c.delta > 0 ? "+" : ""}${c.delta}`
              : `${c.delta > 0 ? "+" : ""}${c.delta}${c.label === "Sentiment positif" || c.label === "Visibilité IA" ? "%" : "%"}`;
            return (
              <div
                key={c.label}
                style={{
                  padding: "14px 16px",
                  border: `1px solid ${C.border}`,
                  borderRadius: "10px",
                  background: C.bgSubtle,
                }}
              >
                <div
                  style={{
                    fontFamily: FONT.mono,
                    fontSize: "10px",
                    fontWeight: 700,
                    color: C.textMuted,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                  }}
                >
                  {c.label}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "8px",
                    marginBottom: "6px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONT.mono,
                      fontSize: "24px",
                      fontWeight: 700,
                      color: C.text,
                    }}
                  >
                    {c.current}
                  </span>
                  <span
                    style={{
                      fontFamily: FONT.mono,
                      fontSize: "11px",
                      color: C.textMuted,
                    }}
                  >
                    ← {c.previous}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: FONT.mono,
                    fontSize: "12px",
                    fontWeight: 700,
                    color,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    background: isStable
                      ? C.bgHover
                      : isGood
                      ? C.successBg
                      : C.dangerBg,
                  }}
                >
                  {arrow} {deltaText}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SECTION 2 — SHARE OF VOICE DONUT (NEW)
// ═══════════════════════════════════════════════════════════════

interface SovCompetitor {
  name: string;
  mentionCount: number;
  sentiment: number;
  trend: number;
  isYou: boolean;
}

function ShareOfVoiceDonut() {
  const [competitors, setCompetitors] = useState<SovCompetitor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/console/share-of-voice")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d?.competitors) setCompetitors(d.competitors);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  // Top 4 = you + 3 competitors, bucket the rest as "Autres"
  const slices = useMemo(() => {
    const sorted = [...competitors].sort((a, b) => b.mentionCount - a.mentionCount);
    const youIdx = sorted.findIndex((c) => c.isYou);
    const you = youIdx >= 0 ? sorted.splice(youIdx, 1)[0] : null;
    const top3 = sorted.slice(0, 3);
    const restCount = sorted.slice(3).reduce((s, c) => s + c.mentionCount, 0);
    const out: Array<{ name: string; count: number; color: string; isYou: boolean }> = [];
    if (you) out.push({ name: "Vous", count: you.mentionCount, color: SAGE, isYou: true });
    top3.forEach((c, i) => {
      const color = i === 0 ? AMBER : i === 1 ? CHARCOAL : NEUTRAL;
      out.push({ name: c.name, count: c.mentionCount, color, isYou: false });
    });
    if (restCount > 0) {
      out.push({ name: "Autres", count: restCount, color: C.border, isYou: false });
    }
    return out;
  }, [competitors]);

  const total = useMemo(
    () => slices.reduce((s, x) => s + x.count, 0),
    [slices],
  );

  // Build SVG donut arcs
  const arcs = useMemo(() => {
    if (total === 0) return [];
    let cumAngle = -Math.PI / 2; // start at 12 o'clock
    return slices.map((s) => {
      const frac = s.count / total;
      const angle = frac * 2 * Math.PI;
      const start = cumAngle;
      const end = cumAngle + angle;
      cumAngle = end;
      const pct = Math.round(frac * 100);
      // SVG arc — outer radius 80, inner radius 48, center (100,100)
      const rOuter = 80;
      const rInner = 48;
      const cx = 100;
      const cy = 100;
      const x1 = cx + rOuter * Math.cos(start);
      const y1 = cy + rOuter * Math.sin(start);
      const x2 = cx + rOuter * Math.cos(end);
      const y2 = cy + rOuter * Math.sin(end);
      const x3 = cx + rInner * Math.cos(end);
      const y3 = cy + rInner * Math.sin(end);
      const x4 = cx + rInner * Math.cos(start);
      const y4 = cy + rInner * Math.sin(start);
      const largeArc = angle > Math.PI ? 1 : 0;
      const path = [
        `M ${x1} ${y1}`,
        `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2} ${y2}`,
        `L ${x3} ${y3}`,
        `A ${rInner} ${rInner} 0 ${largeArc} 0 ${x4} ${y4}`,
        "Z",
      ].join(" ");
      return { ...s, pct, path };
    });
  }, [slices, total]);

  return (
    <Card
      eyebrow="Share of Voice"
      title="Répartition des mentions"
      right={
        <span
          style={{
            fontFamily: FONT.mono,
            fontSize: "10px",
            color: C.textMuted,
          }}
        >
          30 jours · {fmtNumber(total)} mentions
        </span>
      }
    >
      {loading ? (
        <SkeletonBlock height={220} />
      ) : arcs.length === 0 ? (
        <EmptyState message="Aucune mention enregistrée sur les 30 derniers jours." />
      ) : (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "20px",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            viewBox="0 0 200 200"
            style={{ width: "200px", height: "200px", flexShrink: 0 }}
            aria-label="Donut chart share of voice"
          >
            {arcs.map((a, i) => (
              <path
                key={i}
                d={a.path}
                fill={a.color}
                stroke={C.bg}
                strokeWidth="2"
              >
                <title>
                  {a.name}: {a.pct}%
                </title>
              </path>
            ))}
            <text
              x="100"
              y="95"
              textAnchor="middle"
              style={{
                fontFamily: FONT.mono,
                fontSize: "11px",
                fontWeight: 700,
                fill: C.textMuted,
                letterSpacing: "0.06em",
              }}
            >
              TOTAL
            </text>
            <text
              x="100"
              y="118"
              textAnchor="middle"
              style={{
                fontFamily: FONT.mono,
                fontSize: "20px",
                fontWeight: 700,
                fill: C.text,
              }}
            >
              {fmtNumber(total)}
            </text>
          </svg>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              flex: "1 1 220px",
              minWidth: "220px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {arcs.map((a, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "13px",
                }}
              >
                <span
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "3px",
                    background: a.color,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    flex: 1,
                    color: C.text,
                    fontWeight: a.isYou ? 700 : 500,
                    fontFamily: FONT.sans,
                  }}
                >
                  {a.name}
                </span>
                <span
                  style={{
                    fontFamily: FONT.mono,
                    fontWeight: 700,
                    color: C.text,
                    fontSize: "13px",
                  }}
                >
                  {a.pct}%
                </span>
                <span
                  style={{
                    fontFamily: FONT.mono,
                    color: C.textMuted,
                    fontSize: "11px",
                    minWidth: "60px",
                    textAlign: "right",
                  }}
                >
                  {fmtNumber(a.count)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SECTION 3 — SENTIMENT COMPARISON TABLE (NEW)
// ═══════════════════════════════════════════════════════════════

interface SentimentRow {
  name: string;
  isYou: boolean;
  positive: number;
  neutral: number;
  negative: number;
  totalMentions: number;
  avgSentiment: number;
}
type SortKey = "name" | "positive" | "neutral" | "negative" | "totalMentions" | "avgSentiment";

function SentimentComparisonTable() {
  const [rows, setRows] = useState<SentimentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("totalMentions");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/console/sentiment-comparison")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d?.companies) setRows(d.companies);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === "asc"
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number);
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  const toggleSort = (k: SortKey) => {
    if (k === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(k);
      setSortDir("desc");
    }
  };

  const headers: Array<{ key: SortKey; label: string; align: "left" | "right" }> = [
    { key: "name", label: "Entreprise", align: "left" },
    { key: "positive", label: "Positif %", align: "right" },
    { key: "neutral", label: "Neutre %", align: "right" },
    { key: "negative", label: "Négatif %", align: "right" },
    { key: "totalMentions", label: "Mentions", align: "right" },
    { key: "avgSentiment", label: "Sentiment moy.", align: "right" },
  ];

  return (
    <Card
      eyebrow="Analyse comparative"
      title="Sentiment vs concurrents"
      right={
        <span
          style={{
            fontFamily: FONT.mono,
            fontSize: "10px",
            color: C.textMuted,
          }}
        >
          30 jours
        </span>
      }
      bodyStyle={{ overflowX: "auto" }}
    >
      {loading ? (
        <SkeletonBlock height={220} />
      ) : sorted.length === 0 ? (
        <EmptyState message="Pas assez de données sentiment pour comparer." />
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "13px",
            fontFamily: FONT.sans,
            minWidth: "560px",
          }}
        >
          <thead>
            <tr>
              {headers.map((h) => (
                <th
                  key={h.key}
                  onClick={() => toggleSort(h.key)}
                  style={{
                    position: "sticky",
                    top: 0,
                    background: C.bgSubtle,
                    color: C.text,
                    textAlign: h.align,
                    padding: "10px 12px",
                    fontFamily: FONT.mono,
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    borderBottom: `2px solid ${C.borderStrong}`,
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  {h.label}
                  {sortKey === h.key ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => (
              <tr
                key={r.name}
                style={{
                  background: i % 2 === 1 ? C.bgSubtle : C.bg,
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                <td style={{ padding: "10px 12px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: r.isYou ? SAGE : AMBER,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontWeight: r.isYou ? 700 : 500,
                        color: C.text,
                      }}
                    >
                      {r.name}
                    </span>
                    {r.isYou && (
                      <Pill
                        text="VOUS"
                        color={C.bg}
                        background={SAGE}
                      />
                    )}
                  </div>
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    textAlign: "right",
                    fontFamily: FONT.mono,
                    fontWeight: 700,
                    color: C.success,
                    background: `${C.success}${Math.min(255, r.positive * 2)
                      .toString(16)
                      .padStart(2, "0")}10`,
                  }}
                >
                  {r.positive}%
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    textAlign: "right",
                    fontFamily: FONT.mono,
                    color: C.textMuted,
                    background: C.bgHover,
                  }}
                >
                  {r.neutral}%
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    textAlign: "right",
                    fontFamily: FONT.mono,
                    fontWeight: 700,
                    color: C.danger,
                    background: `${C.danger}${Math.min(255, r.negative * 2)
                      .toString(16)
                      .padStart(2, "0")}10`,
                  }}
                >
                  {r.negative}%
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    textAlign: "right",
                    fontFamily: FONT.mono,
                    color: C.text,
                  }}
                >
                  {fmtNumber(r.totalMentions)}
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    textAlign: "right",
                    fontFamily: FONT.mono,
                    color:
                      r.avgSentiment > 0.1
                        ? C.success
                        : r.avgSentiment < -0.1
                        ? C.danger
                        : C.textMuted,
                  }}
                >
                  {r.avgSentiment > 0 ? "+" : ""}
                  {r.avgSentiment.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SECTION 4 — EXISTING SECTIONS PRESERVED
//  (benchmarking, radar, custom dashboards, HarchIQ AI, alerts, reports)
// ═══════════════════════════════════════════════════════════════

interface Neighbor {
  name: string;
  score: number;
  delta: number;
  shareOfVoice: number;
}
interface BenchmarkPayload {
  competitors?: Neighbor[];
  yourScore?: number;
  yourShareOfVoice?: number;
}

function ExistingSectionsGrid() {
  const [bench, setBench] = useState<BenchmarkPayload | null>(null);
  const [askInput, setAskInput] = useState("");
  const [askAnswer, setAskAnswer] = useState<string | null>(null);
  const [askLoading, setAskLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/console/neighbors")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d) setBench(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const submitAsk = useCallback(() => {
    if (!askInput.trim()) return;
    setAskLoading(true);
    setAskAnswer(null);
    fetch("/api/console/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: askInput.trim() }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        setAskAnswer(d?.answer || d?.response || d?.summary || "Réponse indisponible.");
      })
      .catch(() => setAskAnswer("Erreur de connexion."))
      .finally(() => setAskLoading(false));
  }, [askInput]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "16px",
      }}
    >
      {/* Benchmarking résumé */}
      <Card eyebrow="Benchmarking" title="Classement sectoriel">
        {!bench ? (
          <SkeletonBlock height={140} />
        ) : !bench.competitors || bench.competitors.length === 0 ? (
          <EmptyState message="Aucun concurrent dans votre secteur pour l'instant." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                padding: "8px 10px",
                background: C.successBg,
                border: `1px solid ${SAGE}40`,
                borderRadius: "8px",
                marginBottom: "4px",
              }}
            >
              <span style={{ fontSize: "13px", fontWeight: 700, color: C.text }}>
                Votre score
              </span>
              <span
                style={{
                  fontFamily: FONT.mono,
                  fontSize: "18px",
                  fontWeight: 700,
                  color: C.success,
                }}
              >
                {bench.yourScore ?? "—"}
              </span>
            </div>
            <div
              style={{
                maxHeight: "200px",
                overflowY: "auto",
                border: `1px solid ${C.border}`,
                borderRadius: "8px",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "12px",
                  fontFamily: FONT.sans,
                }}
              >
                <tbody>
                  {bench.competitors.slice(0, 4).map((c, i) => (
                    <tr
                      key={c.name}
                      style={{
                        background: i % 2 === 1 ? C.bgSubtle : C.bg,
                        borderBottom: `1px solid ${C.border}`,
                      }}
                    >
                      <td style={{ padding: "8px 10px", color: C.text }}>
                        {c.name}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          textAlign: "right",
                          fontFamily: FONT.mono,
                          color: C.text,
                          fontWeight: 700,
                        }}
                      >
                        {c.score}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          textAlign: "right",
                          fontFamily: FONT.mono,
                          fontSize: "11px",
                          color:
                            c.delta > 0
                              ? C.danger
                              : c.delta < 0
                              ? C.success
                              : C.textMuted,
                        }}
                      >
                        {c.delta > 0 ? "↑" : c.delta < 0 ? "↓" : "→"} {Math.abs(c.delta)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <a
              href="/atelier/console/market-competitor"
              style={{
                display: "inline-block",
                marginTop: "6px",
                fontSize: "12px",
                color: C.accent,
                textDecoration: "none",
                fontFamily: FONT.mono,
                fontWeight: 600,
              }}
            >
              → Voir le radar concurrentiel complet
            </a>
          </div>
        )}
      </Card>

      {/* Tableaux de bord personnalisés */}
      <Card eyebrow="Dashboards" title="Tableaux de bord personnalisés">
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            {
              label: "Vue Dircom",
              desc: "Score, sentiment, top sources, alertes",
              href: "/atelier/console/brand-monitor",
            },
            {
              label: "Veille concurrentielle",
              desc: "Radar, SOV, vulnérabilités",
              href: "/atelier/console/market-competitor",
            },
            {
              label: "Analyse IA",
              desc: "Visibilité sur 8 LLMs, citations",
              href: "/atelier/console/brand-monitor",
            },
          ].map((d) => (
            <a
              key={d.label}
              href={d.href}
              style={{
                display: "block",
                padding: "10px 12px",
                border: `1px solid ${C.border}`,
                borderRadius: "8px",
                background: C.bgSubtle,
                textDecoration: "none",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: C.text,
                  marginBottom: "2px",
                }}
              >
                {d.label}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: C.textMuted,
                  fontFamily: FONT.sans,
                }}
              >
                {d.desc}
              </div>
            </a>
          ))}
        </div>
      </Card>

      {/* HarchIQ AI */}
      <Card eyebrow="HarchIQ AI" title="Assistant intelligent">
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <textarea
            value={askInput}
            onChange={(e) => setAskInput(e.target.value)}
            placeholder="Posez une question : « Quel est le sentiment dominant cette semaine ? »"
            rows={3}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: `1px solid ${C.border}`,
              borderRadius: "8px",
              fontFamily: FONT.sans,
              fontSize: "13px",
              background: C.bg,
              color: C.text,
              resize: "vertical",
              boxSizing: "border-box",
              outline: "none",
            }}
          />
          <button
            onClick={submitAsk}
            disabled={askLoading || !askInput.trim()}
            style={{
              padding: "8px 14px",
              background: askLoading || !askInput.trim() ? C.border : SAGE,
              color: C.bg,
              border: "none",
              borderRadius: "8px",
              fontFamily: FONT.sans,
              fontSize: "13px",
              fontWeight: 700,
              cursor: askLoading || !askInput.trim() ? "not-allowed" : "pointer",
            }}
          >
            {askLoading ? "Analyse…" : "Interroger HarchIQ"}
          </button>
          {askAnswer && (
            <div
              style={{
                padding: "12px",
                background: C.bgSubtle,
                border: `1px solid ${C.border}`,
                borderRadius: "8px",
                fontSize: "12px",
                color: C.textBody,
                fontFamily: FONT.sans,
                lineHeight: 1.5,
              }}
            >
              {askAnswer}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SECTION 5 — INFLUENCER MENTIONS WIDGET (NEW + UPSELL)
// ═══════════════════════════════════════════════════════════════

interface InfluencerMentionRow {
  id: string;
  influencerName: string;
  platform: string;
  followers: number;
  verified: boolean;
  title: string;
  url: string | null;
  sentiment: string;
  reach: number;
  publishedAt: string;
}

const PLATFORM_META: Record<string, { label: string; icon: string }> = {
  twitter: { label: "X / Twitter", icon: "🐦" },
  linkedin: { label: "LinkedIn", icon: "💼" },
  instagram: { label: "Instagram", icon: "📸" },
  youtube: { label: "YouTube", icon: "▶" },
  tiktok: { label: "TikTok", icon: "🎵" },
  press: { label: "Presse", icon: "📰" },
};

function InfluencerMentionsWidget() {
  const [mentions, setMentions] = useState<InfluencerMentionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/console/influencer-mentions")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d?.mentions) setMentions(d.mentions);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card
      eyebrow="Marketing d'influence"
      title="Influenceurs qui ont mentionné l'entreprise"
      right={
        <a
          href="/atelier/products"
          style={{
            fontSize: "11px",
            color: C.accent,
            fontFamily: FONT.mono,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Marketing d'influence complet avec Grandes Entreprises →
        </a>
      }
    >
      {loading ? (
        <SkeletonBlock height={220} />
      ) : mentions.length === 0 ? (
        <EmptyState message="Aucune mention d'influenceur enregistrée pour le moment. Le marketing d'influence complet est disponible avec le plan Grandes Entreprises." />
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            maxHeight: "320px",
            overflowY: "auto",
          }}
        >
          {mentions.map((m) => {
            const meta = PLATFORM_META[m.platform] ?? { label: m.platform, icon: "•" };
            const sentColor =
              m.sentiment === "positive"
                ? C.success
                : m.sentiment === "negative"
                ? C.danger
                : C.textMuted;
            const sentBg =
              m.sentiment === "positive"
                ? C.successBg
                : m.sentiment === "negative"
                ? C.dangerBg
                : C.bgHover;
            return (
              <div
                key={m.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "32px 1fr auto",
                  gap: "12px",
                  alignItems: "center",
                  padding: "10px 12px",
                  border: `1px solid ${C.border}`,
                  borderRadius: "8px",
                  background: C.bgSubtle,
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: C.bgHover,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                  }}
                  aria-hidden
                >
                  {meta.icon}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginBottom: "2px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: C.text,
                      }}
                    >
                      {m.influencerName}
                    </span>
                    {m.verified && (
                      <span
                        style={{
                          fontSize: "10px",
                          padding: "1px 5px",
                          borderRadius: "3px",
                          background: SAGE,
                          color: C.bg,
                          fontFamily: FONT.mono,
                          fontWeight: 700,
                        }}
                      >
                        ✓ Vérifié
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: "11px",
                        color: C.textMuted,
                        fontFamily: FONT.mono,
                      }}
                    >
                      {meta.label}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: C.textBody,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {m.title}
                  </div>
                </div>
                <div
                  style={{
                    textAlign: "right",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONT.mono,
                      fontSize: "11px",
                      fontWeight: 700,
                      color: C.text,
                    }}
                  >
                    {fmtNumber(m.followers)}
                  </span>
                  <span
                    style={{
                      fontFamily: FONT.mono,
                      fontSize: "10px",
                      color: C.textMuted,
                    }}
                  >
                    followers
                  </span>
                  <span
                    style={{
                      fontFamily: FONT.mono,
                      fontSize: "10px",
                      padding: "1px 6px",
                      borderRadius: "3px",
                      background: sentBg,
                      color: sentColor,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      marginTop: "2px",
                    }}
                  >
                    {m.sentiment === "positive"
                      ? "Positif"
                      : m.sentiment === "negative"
                      ? "Négatif"
                      : "Neutre"}
                  </span>
                  <span
                    style={{
                      fontFamily: FONT.mono,
                      fontSize: "10px",
                      color: C.textMuted,
                      marginTop: "2px",
                    }}
                  >
                    {fmtRelative(m.publishedAt)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SECTION 6 — CUSTOM ALERTS CONFIGURATION (NEW)
// ═══════════════════════════════════════════════════════════════

interface CustomAlert {
  id: string;
  name: string;
  description: string;
  type: "crisis" | "spike" | "sentiment_drop" | "custom";
  threshold: Record<string, number>;
  channels: { whatsapp: boolean; email: boolean; dashboard: boolean };
  active: boolean;
}

const ALERT_TYPE_META: Record<CustomAlert["type"], { icon: string; color: string }> = {
  crisis: { icon: "🚨", color: C.danger },
  spike: { icon: "📈", color: C.warning },
  sentiment_drop: { icon: "📉", color: C.warning },
  custom: { icon: "⚙️", color: C.accent },
};

function CustomAlertsSection() {
  const [alerts, setAlerts] = useState<CustomAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/console/custom-alerts")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d?.alerts) setAlerts(d.alerts);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = useCallback((id: string, nextActive: boolean) => {
    setUpdatingId(id);
    fetch("/api/console/custom-alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active: nextActive }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.alert) {
          setAlerts((prev) =>
            prev.map((a) => (a.id === d.alert.id ? d.alert : a)),
          );
        }
      })
      .catch(() => {})
      .finally(() => setUpdatingId(null));
  }, []);

  return (
    <Card
      eyebrow="Configuration"
      title="Mes alertes personnalisées"
      right={
        <button
          style={{
            padding: "6px 12px",
            background: SAGE,
            color: C.bg,
            border: "none",
            borderRadius: "6px",
            fontFamily: FONT.sans,
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          + Créer une alerte
        </button>
      }
    >
      {loading ? (
        <SkeletonBlock height={180} />
      ) : alerts.length === 0 ? (
        <EmptyState message="Aucune alerte personnalisée configurée." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {alerts.map((a) => {
            const meta = ALERT_TYPE_META[a.type];
            return (
              <div
                key={a.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto",
                  gap: "12px",
                  alignItems: "center",
                  padding: "12px 14px",
                  border: `1px solid ${a.active ? meta.color + "40" : C.border}`,
                  borderRadius: "8px",
                  background: a.active ? C.bgSubtle : C.bg,
                  opacity: a.active ? 1 : 0.65,
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: meta.color + "20",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                  }}
                  aria-hidden
                >
                  {meta.icon}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "2px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: C.text,
                      }}
                    >
                      {a.name}
                    </span>
                    <Pill
                      text={a.active ? "ACTIVE" : "EN PAUSE"}
                      color={a.active ? C.success : C.textMuted}
                      background={a.active ? C.successBg : C.bgHover}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: C.textBody,
                      fontFamily: FONT.mono,
                    }}
                  >
                    {a.description}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      marginTop: "6px",
                      flexWrap: "wrap",
                    }}
                  >
                    {a.channels.whatsapp && (
                      <span style={{ fontSize: "10px", color: C.textMuted }}>
                        💬 WhatsApp
                      </span>
                    )}
                    {a.channels.email && (
                      <span style={{ fontSize: "10px", color: C.textMuted }}>
                        📧 Email
                      </span>
                    )}
                    {a.channels.dashboard && (
                      <span style={{ fontSize: "10px", color: C.textMuted }}>
                        📊 Dashboard
                      </span>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: "6px",
                  }}
                >
                  <button
                    onClick={() => toggle(a.id, !a.active)}
                    disabled={updatingId === a.id}
                    aria-label={a.active ? "Désactiver" : "Activer"}
                    style={{
                      width: "38px",
                      height: "22px",
                      borderRadius: "11px",
                      background: a.active ? SAGE : C.borderStrong,
                      border: "none",
                      cursor: updatingId === a.id ? "wait" : "pointer",
                      position: "relative",
                      transition: "background 0.2s",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: "2px",
                        left: a.active ? "18px" : "2px",
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        background: C.bg,
                        boxShadow: SHADOW.card,
                        transition: "left 0.2s",
                      }}
                    />
                  </button>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      style={{
                        fontSize: "10px",
                        padding: "2px 6px",
                        border: `1px solid ${C.border}`,
                        borderRadius: "4px",
                        background: C.bg,
                        color: C.textBody,
                        fontFamily: FONT.mono,
                        cursor: "pointer",
                      }}
                    >
                      Modifier
                    </button>
                    <button
                      style={{
                        fontSize: "10px",
                        padding: "2px 6px",
                        border: `1px solid ${C.danger}40`,
                        borderRadius: "4px",
                        background: C.dangerBg,
                        color: C.danger,
                        fontFamily: FONT.mono,
                        cursor: "pointer",
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SECTION 7 — REPORT HISTORY (ENHANCED)
// ═══════════════════════════════════════════════════════════════

interface ReportRow {
  id: string;
  title: string;
  period: string;
  status: string;
  createdAt: string;
  pdfUrl?: string;
  companyName?: string | null;
}

function statusMeta(status: string): { label: string; color: string; bg: string } {
  switch (status) {
    case "ready":
    case "sent":
      return { label: "Généré", color: C.success, bg: C.successBg };
    case "generating":
      return { label: "En cours", color: C.warningText, bg: C.warningBg };
    case "draft":
      return { label: "Brouillon", color: C.textMuted, bg: C.bgHover };
    case "scheduled":
      return { label: "Programmé", color: C.accent, bg: C.bgSubtle };
    case "failed":
      return { label: "Échec", color: C.danger, bg: C.dangerBg };
    default:
      return { label: status, color: C.textMuted, bg: C.bgHover };
  }
}

function ReportHistorySection() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/console/reports/list")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d?.reports) setReports(d.reports.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const generateNow = useCallback(() => {
    setGenerating(true);
    fetch("/api/console/reports", { method: "POST" })
      .then(() => {})
      .catch(() => {})
      .finally(() => {
        setGenerating(false);
        // Refresh list after a short delay
        setTimeout(() => {
          fetch("/api/console/reports/list")
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => d?.reports && setReports(d.reports.slice(0, 5)))
            .catch(() => {});
        }, 1500);
      });
  }, []);

  return (
    <Card
      eyebrow="Rapports"
      title="Historique des rapports"
      right={
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={generateNow}
            disabled={generating}
            style={{
              padding: "6px 12px",
              background: SAGE,
              color: C.bg,
              border: "none",
              borderRadius: "6px",
              fontFamily: FONT.sans,
              fontSize: "12px",
              fontWeight: 700,
              cursor: generating ? "wait" : "pointer",
            }}
          >
            {generating ? "Génération…" : "Générer maintenant"}
          </button>
          <button
            style={{
              padding: "6px 12px",
              background: C.bg,
              color: C.text,
              border: `1px solid ${C.borderStrong}`,
              borderRadius: "6px",
              fontFamily: FONT.sans,
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Programmer
          </button>
        </div>
      }
    >
      {loading ? (
        <SkeletonBlock height={180} />
      ) : reports.length === 0 ? (
        <EmptyState message="Aucun rapport généré pour le moment. Cliquez sur « Générer maintenant »." />
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            maxHeight: "320px",
            overflowY: "auto",
          }}
        >
          {reports.map((r) => {
            const sm = statusMeta(r.status);
            return (
              <div
                key={r.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: "12px",
                  alignItems: "center",
                  padding: "10px 12px",
                  border: `1px solid ${C.border}`,
                  borderRadius: "8px",
                  background: C.bgSubtle,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "4px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: C.text,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "100%",
                      }}
                    >
                      {r.title}
                    </span>
                    <Pill text={sm.label} color={sm.color} background={sm.bg} />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      fontSize: "11px",
                      color: C.textMuted,
                      fontFamily: FONT.mono,
                      flexWrap: "wrap",
                    }}
                  >
                    <span>Période : {r.period}</span>
                    <span>•</span>
                    <span>{fmtRelative(r.createdAt)}</span>
                    {r.companyName && (
                      <>
                        <span>•</span>
                        <span>{r.companyName}</span>
                      </>
                    )}
                  </div>
                </div>
                {r.pdfUrl && (
                  <a
                    href={r.pdfUrl}
                    style={{
                      padding: "6px 10px",
                      border: `1px solid ${C.borderStrong}`,
                      borderRadius: "6px",
                      background: C.bg,
                      color: C.text,
                      fontFamily: FONT.mono,
                      fontSize: "11px",
                      fontWeight: 700,
                      textDecoration: "none",
                      flexShrink: 0,
                    }}
                  >
                    ↓ Télécharger
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SECTION 8 — TEAM ACTIVITY FEED (NEW)
// ═══════════════════════════════════════════════════════════════

interface TeamActivityRow {
  id: string;
  userId: string | null;
  userName: string;
  action: string;
  actionLabel: string;
  resource: string;
  createdAt: string;
  result: string;
}

function avatarColor(name: string): string {
  const palette = [SAGE, AMBER, CHARCOAL, NEUTRAL, C.accentHover];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return palette[hash % palette.length];
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

function TeamActivityFeed() {
  const [activities, setActivities] = useState<TeamActivityRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/console/team-activity")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d?.activities) setActivities(d.activities);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card eyebrow="Collaboration" title="Activité de l'équipe">
      {loading ? (
        <SkeletonBlock height={220} />
      ) : activities.length === 0 ? (
        <EmptyState message="Aucune activité récente de l'équipe." />
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            maxHeight: "360px",
            overflowY: "auto",
          }}
        >
          {activities.map((a) => {
            const color = avatarColor(a.userName);
            return (
              <div
                key={a.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "32px 1fr auto",
                  gap: "10px",
                  alignItems: "flex-start",
                  padding: "10px 0",
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: color,
                    color: C.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: 700,
                    fontFamily: FONT.mono,
                  }}
                  aria-hidden
                >
                  {initials(a.userName)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "13px",
                      color: C.text,
                      fontFamily: FONT.sans,
                      lineHeight: 1.4,
                    }}
                  >
                    <span style={{ fontWeight: 700 }}>{a.userName}</span>{" "}
                    <span style={{ color: C.textBody }}>{a.actionLabel}</span>
                  </div>
                  {a.resource && (
                    <div
                      style={{
                        fontSize: "11px",
                        color: C.textMuted,
                        fontFamily: FONT.mono,
                        marginTop: "2px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {a.resource}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    fontFamily: FONT.mono,
                    fontSize: "11px",
                    color: C.textMuted,
                    textAlign: "right",
                    flexShrink: 0,
                  }}
                >
                  {fmtRelative(a.createdAt)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ROOT — ProDashboard
// ═══════════════════════════════════════════════════════════════

export interface ProDashboardProps {
  userName?: string | null;
  userEmail?: string | null;
  companyName?: string | null;
}

export function ProDashboard({
  userName,
  userEmail,
  companyName,
}: ProDashboardProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bgSubtle,
        fontFamily: FONT.sans,
        color: C.text,
      }}
    >
      <style>{`
        @keyframes harchPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      {/* ─── En-tête ─── */}
      <header
        style={{
          background: C.bg,
          borderBottom: `1px solid ${C.border}`,
          padding: "20px 24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: FONT.mono,
                fontSize: "11px",
                fontWeight: 700,
                color: C.accent,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "4px",
              }}
            >
              Console Pro · Équipes en croissance
            </div>
            <h1
              style={{
                margin: 0,
                fontFamily: FONT.sans,
                fontSize: "24px",
                fontWeight: 700,
                color: C.text,
              }}
            >
              Bonjour{userName ? `, ${userName.split(" ")[0]}` : ""},
            </h1>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "13px",
                color: C.textBody,
              }}
            >
              {companyName
                ? `Veille intelligente pour ${companyName}`
                : "Veille intelligente pour votre entreprise"}
              {userEmail ? ` · ${userEmail}` : ""}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontFamily: FONT.mono,
                fontSize: "11px",
                color: C.textMuted,
              }}
            >
              Période :
            </span>
            <span
              style={{
                padding: "4px 10px",
                background: C.bgSubtle,
                border: `1px solid ${C.border}`,
                borderRadius: "6px",
                fontFamily: FONT.mono,
                fontSize: "11px",
                fontWeight: 700,
                color: C.text,
              }}
            >
              30 derniers jours
            </span>
          </div>
        </div>
      </header>

      {/* ─── Body ─── */}
      <main
        style={{
          padding: "24px",
          maxWidth: "1440px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* Section 1 — Weekly comparison */}
        <WeeklyComparisonSection />

        {/* Sections 2+3 — SOV donut + Sentiment comparison */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "20px",
            alignItems: "stretch",
          }}
        >
          <ShareOfVoiceDonut />
          <SentimentComparisonTable />
        </div>

        {/* Section 4 — Existing sections (benchmarking, dashboards, HarchIQ AI) */}
        <ExistingSectionsGrid />

        {/* Section 5+6 — Influencer mentions + Custom alerts */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "20px",
            alignItems: "stretch",
          }}
        >
          <InfluencerMentionsWidget />
          <CustomAlertsSection />
        </div>

        {/* Section 7+8 — Reports + Team activity */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "20px",
            alignItems: "stretch",
          }}
        >
          <ReportHistorySection />
          <TeamActivityFeed />
        </div>

        <footer
          style={{
            paddingTop: "16px",
            paddingBottom: "32px",
            textAlign: "center",
            fontSize: "11px",
            color: C.textMuted,
            fontFamily: FONT.mono,
          }}
        >
          HarchIQ Console Pro · Données en temps réel · Loi 09-08 · CNDP Maroc
        </footer>
      </main>
    </div>
  );
}

export default ProDashboard;
