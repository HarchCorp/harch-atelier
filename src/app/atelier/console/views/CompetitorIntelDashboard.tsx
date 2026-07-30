"use client";

import { useEffect, useState } from "react";
import { C } from "../../components/tokens";
import { SkeletonLoader, ErrorState } from "./SkeletonLoader";

const FONT = { sans: C.fontSans, mono: C.fontMono };
const SHADOW = { card: C.shadowSm, deep: C.shadowMd };

// ═══════════════════════════════════════════════════════════════
//  CompetitorIntelDashboard.tsx
//
//  OFFER 2 — Market & Competitor Intel
//  Mindset: Aggressive DirCom/Marketing lead who wants to crush rivals.
//  "Where are they weak? Where am I winning? What's my next move?"
//
//  Layout: Welcome banner (aggressive tone) → Your score vs sector
//  average vs delta (3 KPI cards) → Ranked competitive landscape
//  with progress bars → Competitor moves feed → CTA to full
//  Neighbor Index. Amber accent. Competitive tone.
// ═══════════════════════════════════════════════════════════════

// ─── Types ──────────────────────────────────────────────────────

export interface CompetitorKPI {
  yourScore: number;
  sectorAverage: number;
  deltaVsSector: number;
  competitorsTracked: number;
  yourRank: number;
  totalInSector: number;
}

export interface CompetitorEntry {
  name: string;
  score: number;
  delta: number;       // yourScore - theirScore (positive = you're ahead)
  trend: "up" | "down" | "stable";
  isYou?: boolean;
}

export interface CompetitorMove {
  competitorName: string;
  title: string;
  date: string;
  impactLevel: 1 | 2 | 3;
  impactDescription: string;
}

export interface CompetitorIntelDashboardProps {
  userName: string;
  userEmail: string | null;
  companyName: string;
  sector: string;
  // KPIs are typed and ready for real-time API binding.
  // If omitted, the component fetches from /api/console/weather + /api/console/neighbors.
  kpis?: CompetitorKPI;
  competitors?: CompetitorEntry[];
  moves?: CompetitorMove[];
}

// ─── Accent (amber = aggressive, competitive) ───────────────────

const ACCENT = "#d97706";
const ACCENT_BG = "rgba(217,119,6,0.10)";

// ─── Component ──────────────────────────────────────────────────

export function CompetitorIntelDashboard({
  userName,
  userEmail,
  companyName,
  sector,
  kpis: injectedKpis,
  competitors: injectedCompetitors,
  moves: injectedMoves,
}: CompetitorIntelDashboardProps) {
  const [kpis, setKpis] = useState<CompetitorKPI | null>(injectedKpis ?? null);
  const [competitors, setCompetitors] = useState<CompetitorEntry[]>(injectedCompetitors ?? []);
  const [moves, setMoves] = useState<CompetitorMove[]>(injectedMoves ?? []);
  const [loading, setLoading] = useState(!injectedKpis);
  const [error, setError] = useState(false);
  const [rankFilter, setRankFilter] = useState<"all" | "ahead" | "behind">("all");
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(false);
    try {
      const [weatherRes, neighborsRes] = await Promise.all([
        fetch("/api/console/weather"),
        fetch("/api/console/neighbors"),
      ]);

      let yourScore = 67;
      if (weatherRes.ok) {
        const w = await weatherRes.json();
        yourScore = w.score ?? 67;
      }

      let neighborList: CompetitorEntry[] = [];
      let competitorsTracked = 0;
      if (neighborsRes.ok) {
        const n = await neighborsRes.json();
        competitorsTracked = n.neighbors?.length ?? 0;
        neighborList = (n.neighbors ?? []).map((nb: { name: string; reputationScore: number; yourScore: number; delta: number; rank: number }) => ({
          name: nb.name,
          score: nb.reputationScore,
          delta: nb.delta,
          trend: "stable" as const,
        }));
      }

      const sectorAverage = neighborList.length > 0
        ? Math.round(neighborList.reduce((s: number, c: CompetitorEntry) => s + c.score, 0) / neighborList.length)
        : 71;

      const allEntries: CompetitorEntry[] = [
        ...neighborList,
        { name: `${companyName} (You)`, score: yourScore, delta: 0, trend: "stable" as const, isYou: true },
      ].sort((a, b) => b.score - a.score);

      const yourRank = allEntries.findIndex((e) => e.isYou) + 1;

      setKpis({
        yourScore,
        sectorAverage,
        deltaVsSector: yourScore - sectorAverage,
        competitorsTracked,
        yourRank,
        totalInSector: allEntries.length,
      });
      setCompetitors(allEntries);
      setLastRefresh(new Date());
    } catch {
      setError(true);
    }
    if (isRefresh) setRefreshing(false);
    else setLoading(false);
  };

  useEffect(() => {
    if (injectedKpis) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [injectedKpis, companyName]);

  const firstName = userName.split(" ")[0] || "there";

  // Filter competitors: ahead (higher score than you), behind (lower), all
  const yourScoreVal = kpis?.yourScore ?? 0;
  const filteredCompetitors = competitors.filter((c) => {
    if (rankFilter === "all") return true;
    if (rankFilter === "ahead") return !c.isYou && c.score > yourScoreVal;
    if (rankFilter === "behind") return !c.isYou && c.score <= yourScoreVal;
    return true;
  });

  // Export competitors to CSV
  const exportCompetitorsCSV = () => {
    const headers = ["Rank", "Name", "Score", "Delta", "Type"];
    const rows = competitors.map((c, i) => [i + 1, `"${c.name}"`, c.score, c.delta, c.isYou ? "You" : "Competitor"]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `competitor-landscape-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="dash-main" style={{ padding: "24px", background: "#ffffff", overflowX: "hidden" }}>
      {/* ─── Welcome banner — aggressive tone ─── */}
      <div
        style={{
          padding: "16px 20px",
          background: ACCENT_BG,
          borderRadius: "8px",
          marginBottom: "24px",
          borderLeft: `3px solid ${ACCENT}`,
        }}
      >
        <div style={{ fontSize: "15px", fontWeight: 600, color: "#0a0a0a", lineHeight: 1.5 }}>
          {firstName}, your competitors moved overnight. Here's the delta.
        </div>
        <div style={{ fontSize: "12px", color: "#737373", fontFamily: FONT.mono, marginTop: "6px" }}>
          Tracking {kpis?.competitorsTracked ?? 0} competitors in {sector}
        </div>
      </div>

      {/* ─── Page title ─── */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: ACCENT, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>
          {companyName} vs Competitors
        </div>
        <h3 style={{ fontSize: "22px", fontWeight: 700, color: "#0a0a0a", margin: 0, letterSpacing: "-0.02em" }}>
          Competitive Position
        </h3>
      </div>

      {/* ─── KPI cards: your score / sector avg / delta ─── */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: "16px", marginBottom: "24px" }}>
          <div style={{ padding: "20px", background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px" }}><SkeletonLoader accent={ACCENT} lines={1} height={36} /></div>
          <div style={{ padding: "20px", background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px" }}><SkeletonLoader accent="#737373" lines={1} height={36} /></div>
          <div style={{ padding: "20px", background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px" }}><SkeletonLoader accent={ACCENT} lines={1} height={36} /></div>
        </div>
      ) : error ? (
        <div style={{ marginBottom: "24px" }}><ErrorState accent={ACCENT} message="Can't reach competitor data. Retrying…" /></div>
      ) : (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ padding: "20px", background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "36px", fontWeight: 800, fontFamily: FONT.mono, color: ACCENT, lineHeight: 1 }}>
            {loading ? "\u2014" : kpis?.yourScore}
          </div>
          <div style={{ fontSize: "10px", color: "#737373", fontFamily: FONT.mono, marginTop: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Your score
          </div>
        </div>
        <div style={{ padding: "20px", background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "36px", fontWeight: 800, fontFamily: FONT.mono, color: "#737373", lineHeight: 1 }}>
            {loading ? "\u2014" : kpis?.sectorAverage}
          </div>
          <div style={{ fontSize: "10px", color: "#737373", fontFamily: FONT.mono, marginTop: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Sector average
          </div>
        </div>
        <div style={{ padding: "20px", background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "36px", fontWeight: 800, fontFamily: FONT.mono, color: (kpis?.deltaVsSector ?? 0) >= 0 ? ACCENT : "#ef4444", lineHeight: 1 }}>
            {loading ? "\u2014" : `${(kpis?.deltaVsSector ?? 0) >= 0 ? "+" : ""}${kpis?.deltaVsSector}`}
          </div>
          <div style={{ fontSize: "10px", color: "#737373", fontFamily: FONT.mono, marginTop: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            vs sector
          </div>
        </div>
      </div>
      )}

      {/* ─── Competitive landscape (ranked) ─── */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: "#737373", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Competitive landscape — rank #{kpis?.yourRank ?? "—"} of {kpis?.totalInSector ?? "—"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* Rank filter chips */}
            {(["all", "ahead", "behind"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setRankFilter(f)}
                style={{
                  padding: "4px 10px",
                  fontSize: "10px",
                  fontFamily: FONT.mono,
                  fontWeight: 600,
                  border: `1px solid ${rankFilter === f ? ACCENT : "#e5e5e5"}`,
                  borderRadius: "12px",
                  background: rankFilter === f ? `${ACCENT}15` : "#ffffff",
                  color: rankFilter === f ? ACCENT : "#737373",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {f === "all" ? "All" : f === "ahead" ? "Ahead of me" : "Behind me"}
              </button>
            ))}
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              style={{
                padding: "4px 10px",
                fontSize: "10px",
                fontFamily: FONT.mono,
                fontWeight: 600,
                border: "1px solid #e5e5e5",
                borderRadius: "12px",
                background: "#ffffff",
                color: "#525252",
                cursor: refreshing ? "not-allowed" : "pointer",
                transition: "all 0.15s ease",
                opacity: refreshing ? 0.6 : 1,
              }}
              title={`Last refreshed: ${lastRefresh.toLocaleTimeString("en-US")}`}
            >
              {refreshing ? "\u21BB" : "\u21BB"} {refreshing ? "..." : "Refresh"}
            </button>
            <button
              onClick={exportCompetitorsCSV}
              style={{
                padding: "4px 10px",
                fontSize: "10px",
                fontFamily: FONT.mono,
                fontWeight: 600,
                border: "1px solid #e5e5e5",
                borderRadius: "12px",
                background: "#ffffff",
                color: "#525252",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {"\u2193"} CSV
            </button>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {filteredCompetitors.map((comp, i) => {
            const originalRank = competitors.findIndex((c) => c === comp) + 1;
            return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "12px 16px",
                background: comp.isYou ? ACCENT_BG : "#ffffff",
                border: `1px solid ${comp.isYou ? ACCENT : "#e5e5e5"}`,
                borderRadius: "6px",
                flexWrap: "wrap",
                transition: "border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease",
              }}
              onMouseEnter={(e) => { if (!comp.isYou) { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.boxShadow = `0 2px 8px ${ACCENT}20`; e.currentTarget.style.transform = "translateX(2px)"; } }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = comp.isYou ? ACCENT : "#e5e5e5"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateX(0)"; }}
            >
              <span style={{ fontFamily: FONT.mono, fontSize: "14px", fontWeight: 700, color: comp.isYou ? ACCENT : "#737373", minWidth: "24px" }}>
                #{originalRank}
              </span>
              <span style={{ fontSize: "14px", fontWeight: comp.isYou ? 700 : 500, color: comp.isYou ? ACCENT : "#0a0a0a", flex: 1, minWidth: "200px" }}>
                {comp.name}
              </span>
              <div style={{ width: "120px", height: "6px", background: "#f4f4f5", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: `${comp.score}%`, height: "100%", background: comp.isYou ? ACCENT : "#737373", transition: "width 0.3s ease" }} />
              </div>
              <span style={{ fontFamily: FONT.mono, fontSize: "16px", fontWeight: 700, color: "#0a0a0a", minWidth: "40px", textAlign: "right" }}>
                {comp.score}
              </span>
              <span style={{ fontFamily: FONT.mono, fontSize: "12px", color: comp.delta > 0 ? ACCENT : comp.delta < 0 ? "#ef4444" : "#737373", minWidth: "50px", textAlign: "right" }}>
                {comp.delta > 0 ? "+" : ""}{comp.delta}
              </span>
            </div>
            );
          })}
          {filteredCompetitors.length === 0 && (
            <div style={{ padding: "24px", textAlign: "center", color: "#737373", fontFamily: FONT.mono, fontSize: "12px", background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "6px" }}>
              No competitors match this filter.
            </div>
          )}
        </div>
      </div>

      {/* ─── Competitor moves feed ─── */}
      {moves.length > 0 && (
        <div>
          <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: "#737373", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "12px" }}>
            Recent competitor moves
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {moves.map((move, i) => (
              <div
                key={i}
                style={{
                  padding: "16px",
                  background: "#ffffff",
                  border: "1px solid #e5e5e5",
                  borderRadius: "6px",
                  borderLeft: `3px solid ${move.impactLevel === 3 ? "#ef4444" : move.impactLevel === 2 ? ACCENT : "#737373"}`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#0a0a0a", flex: 1, minWidth: "200px" }}>
                    {move.title}
                  </div>
                  <span
                    style={{
                      fontSize: "10px",
                      fontFamily: FONT.mono,
                      padding: "3px 8px",
                      borderRadius: "2px",
                      background: `${move.impactLevel === 3 ? "#ef4444" : move.impactLevel === 2 ? ACCENT : "#737373"}15`,
                      color: move.impactLevel === 3 ? "#ef4444" : move.impactLevel === 2 ? ACCENT : "#737373",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      flexShrink: 0,
                    }}
                  >
                    {move.impactLevel === 3 ? "High impact" : move.impactLevel === 2 ? "Medium impact" : "Low impact"}
                  </span>
                </div>
                <div style={{ fontSize: "11px", color: "#737373", fontFamily: FONT.mono, marginBottom: "8px" }}>
                  {move.competitorName} — {move.date}
                </div>
                <div style={{ fontSize: "13px", color: "#525252", lineHeight: 1.5 }}>
                  {move.impactDescription}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── CTA ─── */}
      <div style={{ marginTop: "24px", padding: "16px 20px", background: "#f4f4f5", borderRadius: "8px", fontSize: "13px", color: "#525252", lineHeight: 1.5 }}>
        <strong style={{ color: ACCENT, fontFamily: FONT.mono, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Full Intel
        </strong>
        <br />
        Click "Competitors" in the sidebar to see detailed moves, impact levels, and the Neighbor Index for each rival.
      </div>
    </div>
  );
}
