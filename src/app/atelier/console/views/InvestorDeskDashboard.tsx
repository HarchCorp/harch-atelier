"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ScatterChart, Scatter, ZAxis,
  LineChart, Line, Area, AreaChart,
  RadialBarChart, RadialBar, Legend,
} from "recharts";
import { C } from "../../components/tokens";
import { SkeletonLoader, ErrorState } from "./SkeletonLoader";

const FONT = { sans: C.fontSans, mono: C.fontMono };

// ═══════════════════════════════════════════════════════════════
//  InvestorDeskDashboard.tsx
//
//  OFFER 3 — Investment Bank & M&A
//  Mindset: Cold, institutional, risk-obsessed. The banker manages
//  millions and hunts for hidden liabilities before an acquisition.
//  "Where's the buried scandal? Is this target clean?"
//
//  Layout: Welcome banner (cold) → 3 risk KPI cards (adverse media,
//  UBO risk, M&A target sentiment) → Portfolio roll-up with holdings
//  table (reputation + high risks per company) → Red flags feed.
//  Deep navy accent. Dense, tabular, OFAC/Palantir terminal vibe.
// ═══════════════════════════════════════════════════════════════

// ─── Types (typed KPI props, ready for real-time API binding) ───

export interface InvestorKPI {
  adverseMediaHits: number;        // deep negative signals detected
  uboRiskScore: number;            // 0-100, Ultimate Beneficial Owner risk
  maTargetSentiment: number;       // -1 to 1, reputation of acquisition target
  portfoliosManaged: number;
  totalHoldings: number;
  totalHighRisks: number;
  avgReputation: number | null;
}

export interface InvestorHolding {
  id: string;
  companyName: string;
  sector: string;
  weight: number;                  // 0-1
  reputationScore: number | null;
  highRiskCount: number;
  adverseMediaCount: number;
  uboFlag: "clear" | "watch" | "red";
}

export interface RedFlag {
  id: string;
  companyName: string;
  category: string;               // Adverse Media | ESG | Regulatory | Labor | Operational
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  detectedAt: string;             // ISO date
  source: string;
}

export interface InvestorDossier {
  id: string;
  title: string;
  status: string;                 // draft | generating | ready | archived
  target: string;
  targetType: "company";
  summary: string;
  riskScore: number;              // 0-100 (higher = riskier)
  riskBand: "low" | "medium" | "high" | "critical";
  threats: number;
  opportunities: number;
  createdAt: string;
  updatedAt: string;
  company: { slug: string; name: string; sector: string; reputationScore: number | null } | null;
}

export interface InvestorDeskDashboardProps {
  userName: string;
  userEmail: string | null;
  companyName: string;
  kpis?: InvestorKPI;
  holdings?: InvestorHolding[];
  redFlags?: RedFlag[];
}

// ─── Accent (deep navy = cold, institutional) ───────────────────

const ACCENT = "#1e3a5f";
const ACCENT_BG = "rgba(30,58,95,0.06)";
const RED = "#dc2626";
const AMBER = "#d97706";
const GREEN = "#059669";
const CRITICAL = "#7f1d1d";          // dark red for critical risk band
const SLATE_LIGHT = "#94a3b8";       // slate for empty/secondary slices

// ─── Chart palettes (navy / slate / amber / red shades) ────────

const SECTOR_PALETTE = [
  "#1e3a5f", "#2c5282", "#3b6ea5", "#5a89b8",
  "#7d9cc4", "#a8c0d8", "#94a3b8", "#cbd5e1",
  "#d97706", "#dc2626", "#7f1d1d",
];

const RISK_BAND_COLORS: Record<string, string> = {
  low: GREEN,
  medium: AMBER,
  high: RED,
  critical: CRITICAL,
};

const UBO_COLORS: Record<string, string> = {
  clear: GREEN,
  watch: AMBER,
  red: RED,
};

const STATUS_COLORS: Record<string, string> = {
  draft: "#5a89b8",
  generating: "#d97706",
  ready: "#1e3a5f",
  archived: "#94a3b8",
  review: "#3b6ea5",
  published: "#1e3a5f",
};

// Shared tooltip style — institutional terminal vibe
const chartTooltipStyle: React.CSSProperties = {
  background: "#0a0a0a",
  border: "1px solid #1e3a5f",
  borderRadius: "4px",
  padding: "8px 12px",
  fontSize: "11px",
  fontFamily: "'Space Mono', monospace",
  color: "#ffffff",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
};

const chartAxisStyle = {
  fontSize: 10,
  fontFamily: "'Space Mono', monospace",
  fill: "#737373",
};

// ─── Chart card wrapper ────────────────────────────────────────

const chartCardStyle: React.CSSProperties = {
  border: "1px solid #e5e5e5",
  borderRadius: "8px",
  padding: "20px",
  marginBottom: "24px",
  background: "#ffffff",
};

const chartTitleStyle: React.CSSProperties = {
  fontSize: "10px",
  fontFamily: "'Space Mono', monospace",
  color: "#737373",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  marginBottom: "4px",
  fontWeight: 600,
};

const chartSubtitleStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#0a0a0a",
  fontWeight: 600,
  marginBottom: "16px",
};

// ─── Component ──────────────────────────────────────────────────

export function InvestorDeskDashboard({
  userName,
  userEmail,
  companyName,
  kpis: injectedKpis,
  holdings: injectedHoldings,
  redFlags: injectedRedFlags,
}: InvestorDeskDashboardProps) {
  const [kpis, setKpis] = useState<InvestorKPI | null>(injectedKpis ?? null);
  const [holdings, setHoldings] = useState<InvestorHolding[]>(injectedHoldings ?? []);
  const [redFlags, setRedFlags] = useState<RedFlag[]>(injectedRedFlags ?? []);
  const [dossiers, setDossiers] = useState<InvestorDossier[]>([]);
  const [loading, setLoading] = useState(!injectedKpis);
  const [error, setError] = useState(false);
  const [riskFilter, setRiskFilter] = useState<"all" | "high" | "watch" | "clear">("all");
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [sortField, setSortField] = useState<"companyName" | "weight" | "reputationScore" | "highRiskCount">("companyName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(false);
    try {
      const [portRes, statsRes, dossierRes] = await Promise.all([
        fetch("/api/investor/portfolios"),
        fetch("/api/investor/stats"),
        fetch("/api/investor/dossiers"),
      ]);

      let fetchedHoldings: InvestorHolding[] = [];
      let portfoliosManaged = 0;

      if (portRes.ok) {
        const data = await portRes.json();
        portfoliosManaged = data.portfolios?.length ?? 0;
        fetchedHoldings = (data.portfolios ?? []).flatMap((p: { holdings: unknown[] }) =>
          (p.holdings ?? []).map((hRaw: unknown) => {
            const h = hRaw as Record<string, unknown>;
            const company = h.company as Record<string, unknown> | null;
            const highRisks = (company?.highRisks as number) ?? 0;
            const repScore = (company?.reputationScore as number) ?? null;
            // UBO flag derived: red if high risks >= 3, watch if > 0, clear otherwise
            const uboFlag: InvestorHolding["uboFlag"] =
              highRisks >= 3 ? "red" : highRisks > 0 ? "watch" : "clear";
            return {
              id: h.id as string,
              companyName: (company?.name as string) || (h.asset as { name?: string })?.name || "\u2014",
              sector: (company?.sector as string) || "\u2014",
              weight: h.weight as number,
              reputationScore: repScore,
              highRiskCount: highRisks,
              adverseMediaCount: 0,
              uboFlag,
            };
          })
        );
      }

      // Fetch dossiers (real data from Neon)
      let fetchedDossiers: InvestorDossier[] = [];
      if (dossierRes.ok) {
        const d = await dossierRes.json();
        fetchedDossiers = (d.dossiers ?? []) as InvestorDossier[];
      }

      if (statsRes.ok) {
        const s = await statsRes.json();
        setKpis({
          adverseMediaHits: s.totalHighRisks ?? 0,
          uboRiskScore: s.avgReputation ? Math.round(100 - s.avgReputation) : 50,
          maTargetSentiment: 0,
          portfoliosManaged,
          totalHoldings: s.holdings ?? fetchedHoldings.length,
          totalHighRisks: s.totalHighRisks ?? 0,
          avgReputation: s.avgReputation ?? null,
        });
      } else {
        setKpis({
          adverseMediaHits: 0,
          uboRiskScore: 50,
          maTargetSentiment: 0,
          portfoliosManaged,
          totalHoldings: fetchedHoldings.length,
          totalHighRisks: 0,
          avgReputation: null,
        });
      }
      setHoldings(fetchedHoldings);
      setDossiers(fetchedDossiers);
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
  }, [injectedKpis]);

  const firstName = userName.split(" ")[0] || "there";

  // Filter + sort holdings
  const filteredHoldings = holdings
    .filter((h) => {
      if (riskFilter === "all") return true;
      if (riskFilter === "high") return h.highRiskCount > 0;
      if (riskFilter === "watch") return h.uboFlag === "watch" || h.adverseMediaCount > 0;
      if (riskFilter === "clear") return h.highRiskCount === 0 && h.uboFlag === "clear" && h.adverseMediaCount === 0;
      return true;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === "companyName") cmp = a.companyName.localeCompare(b.companyName);
      else if (sortField === "weight") cmp = a.weight - b.weight;
      else if (sortField === "reputationScore") cmp = (a.reputationScore ?? 0) - (b.reputationScore ?? 0);
      else if (sortField === "highRiskCount") cmp = a.highRiskCount - b.highRiskCount;
      return sortDir === "asc" ? cmp : -cmp;
    });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  // Export holdings to CSV
  const exportHoldingsCSV = () => {
    const headers = ["Company", "Sector", "Weight", "Reputation", "Red Flags", "UBO Status"];
    const rows = filteredHoldings.map((h) => [ `"${h.companyName}"`, h.sector, `${(h.weight * 100).toFixed(0)}%`, h.reputationScore ?? "—", h.highRiskCount, h.uboFlag]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `portfolio-holdings-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const uboColor = (kpis?.uboRiskScore ?? 50) >= 60 ? RED : (kpis?.uboRiskScore ?? 50) >= 40 ? AMBER : GREEN;
  const maColor = (kpis?.maTargetSentiment ?? 0) > 0.3 ? GREEN : (kpis?.maTargetSentiment ?? 0) < -0.3 ? RED : AMBER;
  const adverseColor = (kpis?.adverseMediaHits ?? 0) > 5 ? RED : (kpis?.adverseMediaHits ?? 0) > 0 ? AMBER : GREEN;

  // ─── Chart data derivation (all from real API data) ────────

  // 1. Sector exposure — aggregate holdings by sector, sum weights
  const sectorData = useMemo(() => {
    const map = new Map<string, number>();
    for (const h of holdings) {
      const sec = h.sector === "\u2014" ? "Unspecified" : h.sector;
      map.set(sec, (map.get(sec) ?? 0) + (h.weight || 0));
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value: Math.round(value * 1000) / 10 }))  // weight %
      .sort((a, b) => b.value - a.value);
  }, [holdings]);

  // 2. Risk band distribution — count dossiers per riskBand
  const riskBandData = useMemo(() => {
    const bands: Array<{ band: string; label: string; count: number }> = [
      { band: "low", label: "Low", count: 0 },
      { band: "medium", label: "Medium", count: 0 },
      { band: "high", label: "High", count: 0 },
      { band: "critical", label: "Critical", count: 0 },
    ];
    for (const d of dossiers) {
      const row = bands.find((b) => b.band === d.riskBand);
      if (row) row.count += 1;
    }
    return bands;
  }, [dossiers]);

  // 3. Reputation vs risk scatter — each holding plotted
  const scatterData = useMemo(() => {
    const groups: Record<string, Array<{ x: number; y: number; z: number; company: string }>> = {
      clear: [], watch: [], red: [],
    };
    for (const h of holdings) {
      const rep = h.reputationScore ?? 0;
      const bucket = groups[h.uboFlag] ?? groups.clear;
      bucket.push({
        x: rep,
        y: h.highRiskCount,
        z: Math.max(20, Math.round((h.weight || 0) * 400)),  // bubble size from weight
        company: h.companyName,
      });
    }
    return groups;
  }, [holdings]);

  // 4. Exposure by company — top 10 holdings by weight, descending
  const exposureData = useMemo(() => {
    return [...holdings]
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 10)
      .map((h) => ({
        company: h.companyName.length > 22 ? h.companyName.slice(0, 20) + "\u2026" : h.companyName,
        exposure: Math.round((h.weight || 0) * 1000) / 10,  // %
        fullName: h.companyName,
      }));
  }, [holdings]);

  // 5. Risk score trend — dossiers sorted by updatedAt asc
  const riskTrendData = useMemo(() => {
    return [...dossiers]
      .filter((d) => d.updatedAt)
      .sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
      .slice(-12)  // last 12 updates
      .map((d) => ({
        date: new Date(d.updatedAt).toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
        riskScore: d.riskScore,
        target: d.target,
      }));
  }, [dossiers]);

  // 6. Dossier status breakdown — group by status for radial
  const dossierStatusData = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of dossiers) {
      map.set(d.status, (map.get(d.status) ?? 0) + 1);
    }
    const maxCount = Math.max(1, ...Array.from(map.values()));
    return Array.from(map.entries()).map(([status, count]) => ({
      status,
      count,
      pct: Math.round((count / maxCount) * 100),
      fill: STATUS_COLORS[status] ?? SLATE_LIGHT,
    }));
  }, [dossiers]);

  const dossierTotal = dossiers.length;

  return (
    <div className="dash-main" style={{ padding: "24px", background: "#ffffff", overflowX: "hidden" }}>
      {/* ─── Welcome banner — cold, institutional ─── */}
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
          {firstName}, {(kpis?.totalHighRisks ?? 0) > 0 ? `${kpis?.totalHighRisks} holdings crossed the risk threshold. Review required.` : "No risk thresholds breached. All holdings nominal."}
        </div>
        <div style={{ fontSize: "12px", color: "#737373", fontFamily: FONT.mono, marginTop: "6px" }}>
          {kpis?.portfoliosManaged ?? 0} portfolios · {kpis?.totalHoldings ?? 0} holdings under management
        </div>
      </div>

      {/* ─── Page title ─── */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: ACCENT, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>
          Risk Screening Terminal
        </div>
        <h3 style={{ fontSize: "22px", fontWeight: 700, color: "#0a0a0a", margin: 0, letterSpacing: "-0.02em" }}>
          Due Diligence Overview
        </h3>
      </div>

      {/* ─── KPI cards: adverse media / UBO risk / M&A sentiment ─── */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: "16px", marginBottom: "24px" }}>
          <div style={{ padding: "20px", background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px" }}><SkeletonLoader accent={ACCENT} lines={1} height={36} /></div>
          <div style={{ padding: "20px", background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px" }}><SkeletonLoader accent={ACCENT} lines={1} height={36} /></div>
          <div style={{ padding: "20px", background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "8px" }}><SkeletonLoader accent={ACCENT} lines={1} height={36} /></div>
        </div>
      ) : error ? (
        <div style={{ marginBottom: "24px" }}><ErrorState accent={ACCENT} message="Can't reach risk screening data. Retrying…" /></div>
      ) : (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ padding: "20px", background: "#ffffff", border: `1px solid ${adverseColor}40`, borderRadius: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "36px", fontWeight: 800, fontFamily: FONT.mono, color: adverseColor, lineHeight: 1 }}>
            {loading ? "—" : kpis?.adverseMediaHits}
          </div>
          <div style={{ fontSize: "10px", color: "#737373", fontFamily: FONT.mono, marginTop: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Adverse media hits
          </div>
        </div>
        <div style={{ padding: "20px", background: "#ffffff", border: `1px solid ${uboColor}40`, borderRadius: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "36px", fontWeight: 800, fontFamily: FONT.mono, color: uboColor, lineHeight: 1 }}>
            {loading ? "—" : kpis?.uboRiskScore}
          </div>
          <div style={{ fontSize: "10px", color: "#737373", fontFamily: FONT.mono, marginTop: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            UBO risk score
          </div>
        </div>
        <div style={{ padding: "20px", background: "#ffffff", border: `1px solid ${maColor}40`, borderRadius: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "36px", fontWeight: 800, fontFamily: FONT.mono, color: maColor, lineHeight: 1 }}>
            {loading ? "—" : `${(kpis?.maTargetSentiment ?? 0) > 0 ? "+" : ""}${(kpis?.maTargetSentiment ?? 0).toFixed(2)}`}
          </div>
          <div style={{ fontSize: "10px", color: "#737373", fontFamily: FONT.mono, marginTop: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            M&A target sentiment
          </div>
        </div>
      </div>
      )}

      {/* ─── Risk Analytics — 6 charts (recharts + real API data) ─── */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))", gap: "24px", marginBottom: "24px" }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={chartCardStyle}><SkeletonLoader accent={ACCENT} lines={1} height={250} /></div>
          ))}
        </div>
      ) : error ? (
        <div style={{ marginBottom: "24px" }}><ErrorState accent={ACCENT} message="Risk analytics feed unavailable. Retrying on next refresh." /></div>
      ) : (
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
          <div>
            <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: ACCENT, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>
              Risk Analytics
            </div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#0a0a0a" }}>
              Six-lens diligence breakdown
            </div>
          </div>
          <div style={{ fontSize: "10px", fontFamily: FONT.mono, color: "#737373", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {dossierTotal} dossiers &middot; {holdings.length} holdings
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))", gap: "24px" }}>

          {/* ── 1. Portfolio Exposure by Sector (Donut PieChart) ── */}
          <div style={chartCardStyle}>
            <div style={chartTitleStyle}>01 {"\u2014"} Sector Allocation</div>
            <div style={chartSubtitleStyle}>Portfolio exposure by sector</div>
            {sectorData.length === 0 ? (
              <div style={{ height: 250, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontFamily: FONT.mono, color: "#737373" }}>No holdings to aggregate</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    isAnimationActive={false}
                  >
                    {sectorData.map((entry, index) => (
                      <Cell
                        key={`sector-${index}`}
                        fill={SECTOR_PALETTE[index % SECTOR_PALETTE.length]}
                        stroke="#ffffff"
                        strokeWidth={1}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            {sectorData.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 12px", marginTop: "8px" }}>
                {sectorData.slice(0, 6).map((s, i) => (
                  <div key={s.name} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "10px", fontFamily: FONT.mono, color: "#525252" }}>
                    <span style={{ width: "8px", height: "8px", background: SECTOR_PALETTE[i % SECTOR_PALETTE.length], borderRadius: "1px" }} />
                    {s.name} <span style={{ color: "#0a0a0a", fontWeight: 600 }}>{s.value.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── 2. Risk Score Distribution (BarChart) ── */}
          <div style={chartCardStyle}>
            <div style={chartTitleStyle}>02 {"\u2014"} Risk Band Distribution</div>
            <div style={chartSubtitleStyle}>Dossiers grouped by severity</div>
            {dossierTotal === 0 ? (
              <div style={{ height: 250, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontFamily: FONT.mono, color: "#737373" }}>No dossiers published</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={riskBandData} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="label" tick={chartAxisStyle} axisLine={{ stroke: "#e5e5e5" }} tickLine={false} />
                  <YAxis tick={chartAxisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: "rgba(30,58,95,0.04)" }} formatter={(v: number) => [`${v} dossier${v === 1 ? "" : "s"}`, "Count"]} />
                  <Bar dataKey="count" radius={[3, 3, 0, 0]} isAnimationActive={false}>
                    {riskBandData.map((entry) => (
                      <Cell key={`rb-${entry.band}`} fill={RISK_BAND_COLORS[entry.band] ?? SLATE_LIGHT} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ── 3. Reputation vs Risk (ScatterChart) ── */}
          <div style={chartCardStyle}>
            <div style={chartTitleStyle}>03 {"\u2014"} Reputation / Risk Map</div>
            <div style={chartSubtitleStyle}>Holdings plotted by reputation vs high-risk count</div>
            {holdings.length === 0 ? (
              <div style={{ height: 250, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontFamily: FONT.mono, color: "#737373" }}>No holdings to plot</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <ScatterChart margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Reputation"
                    domain={[0, 100]}
                    tick={chartAxisStyle}
                    axisLine={{ stroke: "#e5e5e5" }}
                    tickLine={false}
                    label={{ value: "Reputation", position: "insideBottom", offset: -2, style: { fontSize: 9, fontFamily: "'Space Mono', monospace", fill: "#737373" } }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="High risks"
                    tick={chartAxisStyle}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <ZAxis type="number" dataKey="z" range={[20, 400]} />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    cursor={{ strokeDasharray: "3 3", stroke: "#94a3b8" }}
                    formatter={(v: number, name: string) => {
                      if (name === "Reputation") return [v, "Reputation"];
                      if (name === "High risks") return [v, "High risks"];
                      return [v, name];
                    }}
                  />
                  <Scatter name="Clear" data={scatterData.clear} fill={UBO_COLORS.clear} fillOpacity={0.7} isAnimationActive={false} />
                  <Scatter name="Watch" data={scatterData.watch} fill={UBO_COLORS.watch} fillOpacity={0.75} isAnimationActive={false} />
                  <Scatter name="Red" data={scatterData.red} fill={UBO_COLORS.red} fillOpacity={0.8} isAnimationActive={false} />
                </ScatterChart>
              </ResponsiveContainer>
            )}
            {holdings.length > 0 && (
              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                {(["clear", "watch", "red"] as const).map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "10px", fontFamily: FONT.mono, color: "#525252" }}>
                    <span style={{ width: "8px", height: "8px", background: UBO_COLORS[f], borderRadius: "50%" }} />
                    {f === "clear" ? "Clear" : f === "watch" ? "Watch" : "Red flag"}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── 4. Exposure by Company (Horizontal BarChart) ── */}
          <div style={chartCardStyle}>
            <div style={chartTitleStyle}>04 {"\u2014"} Top Concentrations</div>
            <div style={chartSubtitleStyle}>Exposure by holding (top 10, %)</div>
            {exposureData.length === 0 ? (
              <div style={{ height: 250, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontFamily: FONT.mono, color: "#737373" }}>No positions to display</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={exposureData} layout="vertical" margin={{ top: 0, right: 12, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={chartAxisStyle} axisLine={{ stroke: "#e5e5e5" }} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="company"
                    tick={{ ...chartAxisStyle, fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                    width={110}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    cursor={{ fill: "rgba(30,58,95,0.04)" }}
                    formatter={(v: number, _name: string, props) => [`${v.toFixed(1)}%`, (props.payload as { fullName?: string })?.fullName ?? "Exposure"]}
                  />
                  <Bar dataKey="exposure" fill={ACCENT} radius={[0, 3, 3, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ── 5. Risk Score Trend (LineChart with area fill) ── */}
          <div style={chartCardStyle}>
            <div style={chartTitleStyle}>05 {"\u2014"} Risk Score Trend</div>
            <div style={chartSubtitleStyle}>Dossier risk score evolution (last 12 updates)</div>
            {riskTrendData.length === 0 ? (
              <div style={{ height: 250, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontFamily: FONT.mono, color: "#737373" }}>No dossier history yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={riskTrendData} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="riskTrendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={ACCENT} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={ACCENT} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="date" tick={chartAxisStyle} axisLine={{ stroke: "#e5e5e5" }} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={chartAxisStyle} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(v: number, _n: string, props) => [`${v}`, `Risk: ${(props.payload as { target?: string })?.target ?? ""}`]}
                  />
                  <Area
                    type="monotone"
                    dataKey="riskScore"
                    stroke={ACCENT}
                    strokeWidth={2}
                    fill="url(#riskTrendFill)"
                    isAnimationActive={false}
                    dot={{ r: 3, fill: ACCENT, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: ACCENT, stroke: "#ffffff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ── 6. Dossier Status Breakdown (RadialBarChart) ── */}
          <div style={chartCardStyle}>
            <div style={chartTitleStyle}>06 {"\u2014"} Dossier Pipeline</div>
            <div style={chartSubtitleStyle}>Status breakdown of {dossierTotal} dossiers</div>
            {dossierStatusData.length === 0 ? (
              <div style={{ height: 250, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontFamily: FONT.mono, color: "#737373" }}>No dossiers to break down</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <RadialBarChart
                  innerRadius="25%"
                  outerRadius="100%"
                  data={dossierStatusData}
                  startAngle={90}
                  endAngle={-270}
                  cx="50%"
                  cy="50%"
                >
                  <RadialBar background={{ fill: "#f4f4f5" }} dataKey="pct" cornerRadius={3} isAnimationActive={false} />
                  <Legend
                    iconSize={8}
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    wrapperStyle={{ fontSize: "10px", fontFamily: "'Space Mono', monospace", color: "#525252", lineHeight: "18px" }}
                    formatter={(value: string) => {
                      const row = dossierStatusData.find((d) => d.status === value);
                      return `${value} (${row?.count ?? 0})`;
                    }}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(_v: number, _name: string, props) => {
                      const row = props.payload as { status: string; count: number };
                      return [`${row.count} dossier${row.count === 1 ? "" : "s"}`, row.status];
                    }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            )}
          </div>

        </div>
      </div>
      )}

      {/* ─── Holdings table — dense, tabular, Palantir vibe ─── */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: "#737373", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Portfolio holdings — {filteredHoldings.length} of {holdings.length} positions
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* Risk filter chips */}
            {(["all", "high", "watch", "clear"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setRiskFilter(f)}
                style={{
                  padding: "4px 10px",
                  fontSize: "10px",
                  fontFamily: FONT.mono,
                  fontWeight: 600,
                  border: `1px solid ${riskFilter === f ? ACCENT : "#e5e5e5"}`,
                  borderRadius: "12px",
                  background: riskFilter === f ? `${ACCENT}15` : "#ffffff",
                  color: riskFilter === f ? ACCENT : "#737373",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {f === "all" ? "All" : f === "high" ? "High risk" : f === "watch" ? "Watch" : "Clear"}
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
              {refreshing ? "\u21BB ..." : "\u21BB Refresh"}
            </button>
            <button
              onClick={exportHoldingsCSV}
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
        <div style={{ border: "1px solid #e5e5e5", borderRadius: "6px", overflow: "hidden" }}>
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: "600px" }}>
              <thead>
                <tr style={{ background: "#0a0a0a" }}>
                  <th style={navyThStyle}><button onClick={() => toggleSort("companyName")} style={{ background: "none", border: "none", color: "inherit", font: "inherit", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em", padding: 0 }}>Company {sortField === "companyName" ? (sortDir === "asc" ? "\u2191" : "\u2193") : ""}</button></th>
                  <th style={navyThStyle}>Sector</th>
                  <th style={navyThStyle}><button onClick={() => toggleSort("weight")} style={{ background: "none", border: "none", color: "inherit", font: "inherit", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em", padding: 0 }}>Weight {sortField === "weight" ? (sortDir === "asc" ? "\u2191" : "\u2193") : ""}</button></th>
                  <th style={navyThStyle}><button onClick={() => toggleSort("reputationScore")} style={{ background: "none", border: "none", color: "inherit", font: "inherit", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em", padding: 0 }}>Reputation {sortField === "reputationScore" ? (sortDir === "asc" ? "\u2191" : "\u2193") : ""}</button></th>
                  <th style={navyThStyle}><button onClick={() => toggleSort("highRiskCount")} style={{ background: "none", border: "none", color: "inherit", font: "inherit", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em", padding: 0 }}>Red flags {sortField === "highRiskCount" ? (sortDir === "asc" ? "\u2191" : "\u2193") : ""}</button></th>
                  <th style={navyThStyle}>UBO status</th>
                </tr>
              </thead>
              <tbody>
                {filteredHoldings.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: "24px", textAlign: "center", color: "#737373", fontFamily: FONT.mono, fontSize: "12px" }}>
                      {loading ? "Loading holdings…" : "No holdings match this filter."}
                    </td>
                  </tr>
                )}
                {filteredHoldings.map((h) => {
                  const repColor = h.reputationScore === null ? "#737373" : h.reputationScore >= 70 ? GREEN : h.reputationScore >= 50 ? AMBER : RED;
                  const riskColor = h.highRiskCount > 0 ? RED : h.adverseMediaCount > 0 ? AMBER : GREEN;
                  const uboBadge = h.uboFlag === "red" ? { bg: `${RED}15`, color: RED } : h.uboFlag === "watch" ? { bg: `${AMBER}15`, color: AMBER } : { bg: `${GREEN}15`, color: GREEN };
                  return (
                    <tr key={h.id} style={{ borderTop: "1px solid #e5e5e5", transition: "background 0.15s ease" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = `${ACCENT}08`; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <td style={{ padding: "10px 16px", fontWeight: 600, color: "#0a0a0a" }}>{h.companyName}</td>
                      <td style={{ padding: "10px 16px", color: "#737373", fontFamily: FONT.mono, fontSize: "12px" }}>{h.sector}</td>
                      <td style={{ padding: "10px 16px", textAlign: "right", fontFamily: FONT.mono, color: "#0a0a0a" }}>{(h.weight * 100).toFixed(0)}%</td>
                      <td style={{ padding: "10px 16px", textAlign: "right", fontFamily: FONT.mono, color: repColor, fontWeight: 700 }}>
                        {h.reputationScore ?? "—"}
                      </td>
                      <td style={{ padding: "10px 16px", textAlign: "right", fontFamily: FONT.mono, color: riskColor, fontWeight: 700 }}>
                        {h.highRiskCount > 0 ? h.highRiskCount : "0"}
                      </td>
                      <td style={{ padding: "10px 16px" }}>
                        <span style={{ fontSize: "10px", fontFamily: FONT.mono, padding: "2px 8px", borderRadius: "2px", background: uboBadge.bg, color: uboBadge.color, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                          {h.uboFlag}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── Red flags feed ─── */}
      {redFlags.length > 0 && (
        <div>
          <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: RED, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "12px" }}>
            Active red flags ({redFlags.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {redFlags.map((flag) => {
              const sevColor = flag.severity === "critical" ? RED : flag.severity === "high" ? RED : flag.severity === "medium" ? AMBER : "#737373";
              return (
                <div key={flag.id} style={{ padding: "12px 16px", background: "#ffffff", border: `1px solid ${sevColor}40`, borderRadius: "6px", borderLeft: `3px solid ${sevColor}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#0a0a0a", flex: 1, minWidth: "200px" }}>
                      {flag.title}
                    </div>
                    <span style={{ fontSize: "10px", fontFamily: FONT.mono, padding: "2px 8px", borderRadius: "2px", background: `${sevColor}15`, color: sevColor, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      {flag.severity}
                    </span>
                  </div>
                  <div style={{ fontSize: "11px", color: "#737373", fontFamily: FONT.mono, marginTop: "4px" }}>
                    {flag.companyName} · {flag.category} · {flag.source} · {new Date(flag.detectedAt).toLocaleDateString("en-US")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const navyThStyle: React.CSSProperties = {
  padding: "10px 16px",
  textAlign: "left",
  fontFamily: "'Space Mono', monospace",
  fontSize: "10px",
  color: "#ffffff",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  fontWeight: 600,
};
