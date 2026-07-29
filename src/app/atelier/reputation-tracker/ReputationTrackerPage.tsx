"use client";

import { useState, useMemo, useEffect } from "react";
import { AtelierNav } from "../components/AtelierNav";
import { AtelierFooter } from "../components/AtelierFooter";
import { ScrollProgress, CursorGlow, BackToTop } from "../components/shared";

const C = {
  bg: "#FAFAFA", surface: "#FFFFFF", surfaceAlt: "#F4F4F5",
  border: "#E5E5E5", borderLight: "#F0F0F0",
  text: "#0A0A0A", textSec: "#525252", textMuted: "#71717A",
  accent: "#4A5D6E", sage: "#4A7B5F", sageBright: "#6FA386",
  red: "#A0524B", amber: "#B87333",
  shadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
};

interface CompanyRep {
  rank: number;
  name: string;
  sector: string;
  score: number;
  prevScore: number;
  trend: "up" | "down" | "stable";
  change: string;
  shareOfVoice: number;
  sentiment: { positive: number; neutral: number; negative: number };
  pillars: { innovation: number; performance: number; purpose: number };
  articles: number;
  aiVisibility: number;
  trajectory: "improving" | "stable" | "deteriorating";
}

const COMPANIES: CompanyRep[] = [
  { rank: 1, name: "OCP Group", sector: "Mining & Phosphates", score: 91, prevScore: 89, trend: "up", change: "+2", shareOfVoice: 31, sentiment: { positive: 82, neutral: 13, negative: 5 }, pillars: { innovation: 88, performance: 94, purpose: 79 }, articles: 342, aiVisibility: 100, trajectory: "improving" },
  { rank: 2, name: "Attijariwafa Bank", sector: "Banking", score: 84, prevScore: 85, trend: "down", change: "-1", shareOfVoice: 27, sentiment: { positive: 72, neutral: 22, negative: 6 }, pillars: { innovation: 79, performance: 89, purpose: 76 }, articles: 287, aiVisibility: 100, trajectory: "stable" },
  { rank: 3, name: "Maroc Telecom", sector: "Telecommunications", score: 79, prevScore: 77, trend: "up", change: "+2", shareOfVoice: 24, sentiment: { positive: 64, neutral: 28, negative: 8 }, pillars: { innovation: 82, performance: 81, purpose: 70 }, articles: 245, aiVisibility: 75, trajectory: "improving" },
  { rank: 4, name: "Royal Air Maroc", sector: "Aviation", score: 76, prevScore: 78, trend: "down", change: "-2", shareOfVoice: 19, sentiment: { positive: 61, neutral: 26, negative: 13 }, pillars: { innovation: 72, performance: 81, purpose: 73 }, articles: 198, aiVisibility: 75, trajectory: "deteriorating" },
  { rank: 5, name: "Inwi", sector: "Telecommunications", score: 74, prevScore: 72, trend: "up", change: "+2", shareOfVoice: 18, sentiment: { positive: 68, neutral: 25, negative: 7 }, pillars: { innovation: 81, performance: 75, purpose: 68 }, articles: 176, aiVisibility: 75, trajectory: "improving" },
  { rank: 6, name: "Bank of Africa", sector: "Banking", score: 72, prevScore: 71, trend: "up", change: "+1", shareOfVoice: 22, sentiment: { positive: 68, neutral: 22, negative: 10 }, pillars: { innovation: 76, performance: 78, purpose: 71 }, articles: 247, aiVisibility: 75, trajectory: "improving" },
  { rank: 7, name: "CIH Bank", sector: "Banking", score: 68, prevScore: 70, trend: "down", change: "-2", shareOfVoice: 14, sentiment: { positive: 65, neutral: 25, negative: 10 }, pillars: { innovation: 71, performance: 73, purpose: 65 }, articles: 145, aiVisibility: 50, trajectory: "stable" },
  { rank: 8, name: "Managem", sector: "Mining", score: 66, prevScore: 64, trend: "up", change: "+2", shareOfVoice: 12, sentiment: { positive: 59, neutral: 28, negative: 13 }, pillars: { innovation: 68, performance: 72, purpose: 62 }, articles: 112, aiVisibility: 50, trajectory: "improving" },
  { rank: 9, name: "LesieurCristal", sector: "Agro-industry", score: 64, prevScore: 65, trend: "down", change: "-1", shareOfVoice: 10, sentiment: { positive: 62, neutral: 27, negative: 11 }, pillars: { innovation: 62, performance: 68, purpose: 64 }, articles: 89, aiVisibility: 25, trajectory: "stable" },
  { rank: 10, name: "Cosumar", sector: "Agro-industry", score: 62, prevScore: 60, trend: "up", change: "+2", shareOfVoice: 9, sentiment: { positive: 67, neutral: 24, negative: 9 }, pillars: { innovation: 60, performance: 66, purpose: 63 }, articles: 76, aiVisibility: 25, trajectory: "improving" },
];

const SECTORS = ["All Sectors", "Banking", "Telecommunications", "Mining", "Mining & Phosphates", "Aviation", "Agro-industry"];

// ─── API FETCH + MAPPING ─────────────────────────────────────────
// Live data is fetched from /api/companies on mount and mapped to the
// rich CompanyRep interface used by the tracker. Hardcoded COMPANIES
// is kept as a fallback so the page always renders even if the API is
// unreachable.

interface ApiCompany {
  name: string;
  sector: string;
  [key: string]: unknown;
}

function mapApiToCompanyReps(apiCompanies: ApiCompany[], fallback: CompanyRep[]): CompanyRep[] {
  const fallbackByName = new Map(fallback.map((c) => [c.name.toLowerCase(), c]));
  const mapped: CompanyRep[] = apiCompanies.map((api, idx) => {
    const match = fallbackByName.get(api.name.toLowerCase());
    if (match) {
      // Preserve rich reputation data; refresh name/sector from the API
      return { ...match, name: api.name, sector: api.sector };
    }
    // No reputation data yet — synthesize a neutral placeholder so the
    // new company still shows up in the tracker table.
    return {
      rank: idx + 1,
      name: api.name,
      sector: api.sector,
      score: 50,
      prevScore: 50,
      trend: "stable" as const,
      change: "0",
      shareOfVoice: 5,
      sentiment: { positive: 33, neutral: 34, negative: 33 },
      pillars: { innovation: 50, performance: 50, purpose: 50 },
      articles: 0,
      aiVisibility: 25,
      trajectory: "stable" as const,
    };
  });
  // Re-rank by score descending so the tracker is always sensible
  mapped.sort((a, b) => b.score - a.score);
  mapped.forEach((c, i) => { c.rank = i + 1; });
  return mapped;
}

export default function ReputationTrackerPage() {
  const [sectorFilter, setSectorFilter] = useState("All Sectors");
  const [sortBy, setSortBy] = useState<"rank" | "score" | "sentiment" | "ai" | "voice">("rank");
  const [animateIn, setAnimateIn] = useState(false);

  // Live data state — initialized to hardcoded fallback so the page
  // always renders. Replaced with API data on successful fetch.
  const [companies, setCompanies] = useState<CompanyRep[]>(COMPANIES);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setAnimateIn(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/companies?page=1&limit=100", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json?.success || !Array.isArray(json.data)) {
          throw new Error("Malformed API response");
        }
        const mapped = mapApiToCompanyReps(json.data as ApiCompany[], COMPANIES);
        if (!cancelled && mapped.length > 0) {
          setCompanies(mapped);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error("[ReputationTrackerPage] fetch failed, using fallback:", msg);
          setError(msg);
          setCompanies(COMPANIES);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    let result = companies.filter(c => sectorFilter === "All Sectors" || c.sector === sectorFilter);
    result.sort((a, b) => {
      if (sortBy === "rank") return a.rank - b.rank;
      if (sortBy === "score") return b.score - a.score;
      if (sortBy === "sentiment") return b.sentiment.positive - a.sentiment.positive;
      if (sortBy === "ai") return b.aiVisibility - a.aiVisibility;
      if (sortBy === "voice") return b.shareOfVoice - a.shareOfVoice;
      return 0;
    });
    return result;
  }, [companies, sectorFilter, sortBy]);

  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <AtelierNav />

      {/* HERO */}
      <section style={{
        background: `linear-gradient(180deg, ${C.surface} 0%, ${C.bg} 100%)`,
        borderBottom: `1px solid ${C.border}`,
        padding: "48px 16px 40px",
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 16px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            padding: "6px 14px", background: C.surface,
            border: `1px solid ${C.border}`, borderRadius: "100px",
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            color: C.sage, letterSpacing: "0.14em", textTransform: "uppercase",
            marginBottom: "24px",
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.sage, animation: "pulse 2s infinite" }} />
            Reputation Tracker · Live Monitoring
          </div>
          <h1 style={{
            fontSize: "clamp(32px, 8vw, 48px)", fontWeight: 800,
            letterSpacing: "-0.04em", lineHeight: 1.0, color: C.text,
            margin: "0 0 28px", maxWidth: "900px",
          }}>
            Real-time reputation<br />
            <span style={{
              background: `linear-gradient(90deg, ${C.sage} 0%, ${C.sageBright} 100%)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>across industries.</span>
          </h1>
          <p style={{
            fontSize: "16px", color: C.textSec, lineHeight: 1.55,
            maxWidth: "760px", marginBottom: "40px",
          }}>
            Track the reputation scores of Morocco's top companies in real-time. Sort by score, sentiment,
            AI visibility, or share of voice. Filter by sector. See trajectory — improving, stable, or deteriorating.
          </p>

          {/* Stats */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))",
            gap: "1px", background: C.border, border: `1px solid ${C.border}`,
            borderRadius: "12px", overflow: "hidden", maxWidth: "900px",
          }}>
            {[
              { value: "100", label: "companies tracked" },
              { value: "30+", label: "media sources" },
              { value: "4", label: "AI engines monitored" },
              { value: "Daily", label: "refresh cadence" },
            ].map(s => (
              <div key={s.label} style={{ background: C.surface, padding: "20px 24px" }}>
                <div style={{ fontSize: "28px", fontWeight: 800, color: C.text, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1, marginBottom: "6px" }}>
                  {s.value}
                </div>
                <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOP 3 PODIUM */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "48px 16px" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
        }}>
          {companies.slice(0, 3).map((c, i) => (
            <div key={c.rank} style={{
              background: C.surface,
              border: `1px solid ${i === 0 ? C.sage : C.border}`,
              borderRadius: "16px",
              padding: "32px 28px",
              position: "relative", overflow: "hidden",
              boxShadow: i === 0 ? "0 8px 32px rgba(74,123,95,0.12)" : C.shadow,
              transform: animateIn ? "translateY(0)" : "translateY(20px)",
              opacity: animateIn ? 1 : 0,
              transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.1}s`,
            }}>
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "4px",
                background: i === 0 ? C.sage : i === 1 ? C.accent : "#B87333",
              }} />
              <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>
                Rank #{c.rank} · {c.sector}
              </div>
              <h3 style={{ fontSize: "24px", fontWeight: 800, color: C.text, letterSpacing: "-0.02em", margin: "0 0 20px" }}>
                {c.name}
              </h3>
              {/* Score */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: "16px", marginBottom: "24px" }}>
                <div>
                  <div style={{ fontSize: "48px", fontWeight: 900, color: C.sage, fontFamily: "'JetBrains Mono', monospace", lineHeight: 0.9, letterSpacing: "-0.04em" }}>
                    {c.score}
                  </div>
                  <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "4px" }}>
                    Reputation Score
                  </div>
                </div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "4px",
                  fontSize: "12px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                  color: c.trend === "up" ? C.sage : C.red, padding: "4px 8px",
                  borderRadius: "4px", background: c.trend === "up" ? "rgba(74,123,95,0.08)" : "rgba(160,82,75,0.08)",
                  marginBottom: "6px",
                }}>
                  {c.trend === "up" ? "▲" : "▼"} {c.change}
                </div>
              </div>
              {/* Pillars bar */}
              <div style={{ display: "flex", height: "8px", borderRadius: "4px", overflow: "hidden", marginBottom: "8px", background: C.surfaceAlt }}>
                <div style={{ width: `${c.pillars.innovation / (c.pillars.innovation + c.pillars.performance + c.pillars.purpose) * 100}%`, background: C.sage }} />
                <div style={{ width: `${c.pillars.performance / (c.pillars.innovation + c.pillars.performance + c.pillars.purpose) * 100}%`, background: C.accent }} />
                <div style={{ width: `${c.pillars.purpose / (c.pillars.innovation + c.pillars.performance + c.pillars.purpose) * 100}%`, background: "#B87333" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.textMuted }}>
                <span style={{ color: C.sage }}>● Innov. {c.pillars.innovation}</span>
                <span style={{ color: C.accent }}>● Perf. {c.pillars.performance}</span>
                <span style={{ color: "#B87333" }}>● Purpose {c.pillars.purpose}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MAIN TABLE */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 32px 80px" }}>
        {/* Data source status banner */}
        {loading && (
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "10px 16px", marginBottom: "16px",
            background: C.surfaceAlt, border: `1px solid ${C.borderLight}`,
            borderRadius: "8px", fontSize: "12px", color: C.textMuted,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            <span style={{
              width: "8px", height: "8px", borderRadius: "50%",
              background: C.accent, animation: "pulse 1.5s infinite",
            }} />
            Loading live company data…
          </div>
        )}
        {!loading && error && (
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "10px 16px", marginBottom: "16px",
            background: "rgba(160,82,75,0.06)", border: `1px solid rgba(160,82,75,0.2)`,
            borderRadius: "8px", fontSize: "12px", color: C.red,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            <span style={{ fontWeight: 700 }}>⚠</span>
            Live data unavailable ({error}). Showing fallback dataset.
          </div>
        )}
        {!loading && !error && (
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "10px 16px", marginBottom: "16px",
            background: "rgba(74,123,95,0.06)", border: `1px solid rgba(74,123,95,0.2)`,
            borderRadius: "8px", fontSize: "12px", color: C.sage,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: C.sage }} />
            Live data: {companies.length} companies loaded from API
          </div>
        )}
        {/* Toolbar */}
        <div style={{
          display: "flex", gap: "12px", marginBottom: "24px",
          flexWrap: "wrap", alignItems: "center",
        }}>
          <select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)} style={selectStyle}>
            {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} style={selectStyle}>
            <option value="rank">Sort: Rank</option>
            <option value="score">Sort: Score</option>
            <option value="sentiment">Sort: Positive sentiment</option>
            <option value="ai">Sort: AI visibility</option>
            <option value="voice">Sort: Share of voice</option>
          </select>
        </div>

        <div style={{ fontSize: "12px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace", marginBottom: "16px" }}>
          Showing {filtered.length} of {companies.length} companies
        </div>

        {/* Table */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: "12px", overflow: "hidden", boxShadow: C.shadow,
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.surfaceAlt }}>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Company</th>
                <th style={thStyle}>Sector</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Score</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Sentiment</th>
                <th style={{ ...thStyle, textAlign: "center" }}>AI Vis.</th>
                <th style={{ ...thStyle, textAlign: "center" }}>SoV</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Trajectory</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.rank} style={{
                  borderBottom: `1px solid ${C.borderLight}`,
                  transition: "background 0.15s",
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = C.surfaceAlt)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={tdStyle}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: "32px", height: "32px", borderRadius: "8px",
                      background: c.rank <= 3 ? C.sage : c.rank <= 10 ? C.surfaceAlt : "transparent",
                      color: c.rank <= 3 ? "#FFFFFF" : C.text,
                      fontSize: "13px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                      border: c.rank <= 10 && c.rank > 3 ? `1px solid ${C.border}` : "none",
                    }}>
                      {c.rank}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 600, color: C.text }}>{c.name}</td>
                  <td style={{ ...tdStyle, color: C.textMuted, fontSize: "12px" }}>{c.sector}</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <span style={{ fontSize: "17px", fontWeight: 800, color: c.score >= 75 ? C.sage : c.score >= 55 ? C.accent : c.score >= 45 ? "#B87333" : C.red, fontFamily: "'JetBrains Mono', monospace" }}>
                      {c.score}
                    </span>
                    <span style={{ fontSize: "10px", color: c.trend === "up" ? C.sage : c.trend === "down" ? C.red : C.textMuted, marginLeft: "4px", fontFamily: "'JetBrains Mono', monospace" }}>
                      {c.trend === "up" ? "▲" : c.trend === "down" ? "▼" : "—"}{c.change}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "2px", justifyContent: "center", alignItems: "center" }}>
                      <div style={{ width: "8px", height: "20px", background: C.sage, borderRadius: "2px", opacity: c.sentiment.positive / 100 }} title={`${c.sentiment.positive}% positive`} />
                      <div style={{ width: "8px", height: "20px", background: C.accent, borderRadius: "2px", opacity: c.sentiment.neutral / 100 }} title={`${c.sentiment.neutral}% neutral`} />
                      <div style={{ width: "8px", height: "20px", background: C.red, borderRadius: "2px", opacity: c.sentiment.negative / 100 }} title={`${c.sentiment.negative}% negative`} />
                      <span style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.textSec, marginLeft: "8px", minWidth: "32px" }}>
                        {c.sentiment.positive}%
                      </span>
                    </div>
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: c.aiVisibility === 100 ? C.sage : c.aiVisibility >= 75 ? C.accent : C.amber }}>
                      {c.aiVisibility}%
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center", fontFamily: "'JetBrains Mono', monospace", color: C.textSec, fontSize: "13px" }}>
                    {c.shareOfVoice}%
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: "4px",
                      fontSize: "11px", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
                      color: c.trajectory === "improving" ? C.sage : c.trajectory === "deteriorating" ? C.red : C.textMuted,
                      padding: "3px 8px", borderRadius: "4px",
                      background: c.trajectory === "improving" ? "rgba(74,123,95,0.08)" : c.trajectory === "deteriorating" ? "rgba(160,82,75,0.08)" : C.surfaceAlt,
                    }}>
                      {c.trajectory === "improving" ? "▲" : c.trajectory === "deteriorating" ? "▼" : "—"} {c.trajectory}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Methodology */}
        <div style={{
          marginTop: "32px", padding: "24px 28px", background: C.surface,
          borderRadius: "12px", border: `1px solid ${C.border}`, boxShadow: C.shadow,
        }}>
          <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.accent, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px", fontWeight: 700 }}>
            Methodology
          </div>
          <p style={{ fontSize: "13px", color: C.textSec, lineHeight: 1.6, margin: 0 }}>
            Reputation Score (0-100) = Sentiment (40%) + AI Visibility (30%) + Volume (20%) + Authority (10%).
            Updated daily from 30+ media sources and 4 AI engines. Pillars (Innovation/Performance/Purpose)
            show narrative composition. Trajectory compares current month to previous 90 days.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: C.text, color: "#FFFFFF",
        padding: "48px 16px", textAlign: "center",
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 16px" }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 20px", color: "#FFFFFF" }}>
            See your company on the tracker.
          </h2>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)", marginBottom: "32px", lineHeight: 1.6 }}>
            Get a personalized reputation audit and see where you rank among Morocco&apos;s top companies.
          </p>
          <a href="/atelier/audit" style={{
            display: "inline-block", padding: "16px 32px",
            background: C.sage, color: "#FFFFFF",
            fontSize: "15px", fontWeight: 600, textDecoration: "none",
            borderRadius: "8px", fontFamily: "'Inter', sans-serif",
          }}>
            Request a demo →
          </a>
        </div>
      </section>

      <AtelierFooter />
      <BackToTop />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @media (max-width: 900px) {
          table { font-size: 11px; }
          th, td { padding: 8px 6px !important; }
        }
      `}</style>
    </>
  );
}

const selectStyle: React.CSSProperties = {
  padding: "12px 16px", background: C.surface, border: `1px solid ${C.border}`,
  borderRadius: "8px", fontSize: "13px", color: C.text,
  fontFamily: "'Inter', sans-serif", cursor: "pointer", outline: "none",
};

const thStyle: React.CSSProperties = {
  padding: "14px 12px", textAlign: "left", fontSize: "10px", fontWeight: 600,
  color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase",
  fontFamily: "'JetBrains Mono', monospace",
  borderBottom: `1px solid ${C.border}`,
};

const tdStyle: React.CSSProperties = {
  padding: "14px 12px", fontSize: "13px", color: C.textSec,
};
