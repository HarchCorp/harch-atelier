"use client";

import { useEffect, useState } from "react";
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
      const [portRes, statsRes] = await Promise.all([
        fetch("/api/investor/portfolios"),
        fetch("/api/investor/stats"),
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
            return {
              id: h.id as string,
              companyName: (company?.name as string) || (h.asset as { name?: string })?.name || "—",
              sector: (company?.sector as string) || "—",
              weight: h.weight as number,
              reputationScore: (company?.reputationScore as number) ?? null,
              highRiskCount: (company?.highRisks as number) ?? 0,
              adverseMediaCount: 0,
              uboFlag: "clear" as const,
            };
          })
        );
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
