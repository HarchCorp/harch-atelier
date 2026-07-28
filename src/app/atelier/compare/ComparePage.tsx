"use client";

import { useState, useMemo, useEffect } from "react";
import { AtelierNav } from "../components/AtelierNav";
import { AtelierFooter } from "../components/AtelierFooter";
import { ScrollProgress, CursorGlow, BackToTop } from "../components/shared";
import { RadarChart, LineChart, StackedBar, Gauge } from "../components/charts/Charts";
import { COMPANIES, RISK_AXES, getRiskValues, getAvgRisk, CompanyData, fetchCompanies } from "./companies";

const C = {
  bg: "#FAFAFA", surface: "#FFFFFF", surfaceAlt: "#F4F4F5",
  border: "#E5E5E5", borderLight: "#F0F0F0",
  text: "#0A0A0A", textSec: "#525252", textMuted: "#71717A",
  accent: "#4A5D6E", sage: "#4A7B5F", sageBright: "#6FA386",
  red: "#A0524B", amber: "#B87333",
  shadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
};

const COLORS = ["#4A7B5F", "#4A5D6E", "#B87333"];

export default function ComparePage() {
  const [selected, setSelected] = useState<string[]>([
    "OCP Group", "Attijariwafa Bank", "Bank of Africa"
  ]);

  // Live data state — initialized to hardcoded fallback so the page
  // always renders. Replaced with API data on successful fetch.
  const [companiesData, setCompaniesData] = useState<CompanyData[]>(COMPANIES);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const fetched = await fetchCompanies();
        if (!cancelled && fetched.length > 0) {
          setCompaniesData(fetched);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error("[ComparePage] fetch failed, using fallback:", msg);
          setError(msg);
          setCompaniesData(COMPANIES);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const companies = useMemo(
    () => selected.map(name => companiesData.find(c => c.name === name)).filter(Boolean) as CompanyData[],
    [selected, companiesData]
  );

  const bestScore = Math.max(...companies.map(c => c.score));
  const bestSentiment = Math.max(...companies.map(c => c.sentiment));
  const lowestRisk = Math.min(...companies.map(c => getAvgRisk(c)));
  const bestAI = companies.reduce((best, c) => {
    const rank = parseInt(c.aiRank.replace("#", "")) || 99;
    const bestRank = parseInt(best.aiRank.replace("#", "")) || 99;
    return rank < bestRank ? c : best;
  }, companies[0]);

  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <AtelierNav />

      {/* HERO */}
      <section style={{
        background: `linear-gradient(180deg, ${C.surface} 0%, ${C.bg} 100%)`,
        borderBottom: `1px solid ${C.border}`,
        padding: "80px 32px 40px",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            padding: "6px 14px", background: C.surface,
            border: `1px solid ${C.border}`, borderRadius: "100px",
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            color: C.sage, letterSpacing: "0.14em", textTransform: "uppercase",
            marginBottom: "20px",
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.sage }} />
            Comparison Tool
          </div>
          <h1 style={{
            fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800,
            letterSpacing: "-0.04em", lineHeight: 1.05, color: C.text,
            margin: "0 0 16px",
          }}>
            Compare companies <span style={{ color: C.sage }}>side-by-side.</span>
          </h1>
          <p style={{
            fontSize: "18px", color: C.textSec, lineHeight: 1.55,
            maxWidth: "640px",
          }}>
            Select up to 3 companies and compare them across reputation score, sentiment, risk profile, pillars, and quarterly trends.
          </p>
        </div>
      </section>

      {/* SELECTORS */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 32px" }}>
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
            Live data: {companiesData.length} companies loaded from API
          </div>
        )}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px",
        }}>
          {[0, 1, 2].map(i => (
            <div key={i}>
              <label style={{
                display: "block", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
                color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase",
                marginBottom: "8px", fontWeight: 600,
              }}>
                Company {i + 1}
              </label>
              <select
                value={selected[i]}
                onChange={(e) => {
                  const next = [...selected];
                  next[i] = e.target.value;
                  setSelected(next);
                }}
                style={{
                  width: "100%", padding: "14px 16px",
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: "8px", fontSize: "14px", color: C.text,
                  fontFamily: "'Inter', sans-serif", cursor: "pointer", outline: "none",
                }}
              >
                {companiesData.map(c => (
                  <option key={c.name} value={c.name}>
                    #{c.rank} — {c.name} ({c.score})
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </section>

      {/* SCORE COMPARISON */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px 40px" }}>
        <div style={{
          display: "grid", gridTemplateColumns: `repeat(${companies.length}, 1fr)`,
          gap: "16px",
        }}>
          {companies.map((c, i) => (
            <div key={c.name} style={{
              padding: "24px", background: C.surface,
              border: `1px solid ${c.score === bestScore ? C.sage : C.border}`,
              borderRadius: "12px", boxShadow: C.shadow,
              borderTop: `3px solid ${COLORS[i]}`,
              textAlign: "center",
            }}>
              <div style={{
                fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
                color: C.textMuted, letterSpacing: "0.1em",
                textTransform: "uppercase", marginBottom: "8px",
              }}>
                Rank #{c.rank} · {c.sector}
              </div>
              <div style={{
                fontSize: "36px", fontWeight: 800, color: C.sage,
                fontFamily: "'JetBrains Mono', monospace",
                lineHeight: 1, letterSpacing: "-0.04em", marginBottom: "4px",
              }}>
                {c.score}
              </div>
              <div style={{
                fontSize: "11px", color: C.textMuted, marginBottom: "12px",
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                Reputation Score
              </div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "4px",
                fontSize: "12px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                color: c.trend === "up" ? C.sage : C.red,
                padding: "4px 10px", borderRadius: "100px",
                background: c.trend === "up" ? "rgba(74,123,95,0.1)" : "rgba(160,82,75,0.1)",
                marginBottom: "8px",
              }}>
                {c.trend === "up" ? "▲" : "▼"} {c.change}
              </div>
              <div>
                <span style={{
                  display: "inline-block", fontSize: "10px", fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  padding: "3px 10px", borderRadius: "100px",
                  background: c.riskLevel === "low" ? "rgba(74,123,95,0.1)" :
                             c.riskLevel === "moderate" ? "rgba(74,93,110,0.1)" :
                             c.riskLevel === "elevated" ? "rgba(184,115,51,0.1)" :
                             "rgba(160,82,75,0.1)",
                  color: c.riskLevel === "low" ? C.sage :
                         c.riskLevel === "moderate" ? C.accent :
                         c.riskLevel === "elevated" ? C.amber : C.red,
                  textTransform: "uppercase", letterSpacing: "0.06em",
                }}>
                  {c.riskLevel} risk
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* METRICS TABLE */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px 48px" }}>
        <div style={{
          fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
          color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase",
          marginBottom: "16px",
        }}>
          Side-by-side metrics
        </div>
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: "12px", overflow: "hidden", boxShadow: C.shadow,
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.surfaceAlt }}>
                <th style={thStyle}>Metric</th>
                {companies.map((c, i) => (
                  <th key={c.name} style={{ ...thStyle, textAlign: "center", color: COLORS[i] }}>
                    {c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <MetricRow label="Reputation Score" companies={companies} getValue={c => c.score} bestIs="max" />
              <MetricRow label="Sentiment (%)" companies={companies} getValue={c => c.sentiment} bestIs="max" />
              <MetricRow label="Articles" companies={companies} getValue={c => c.articles} bestIs="max" />
              <MetricRow label="Share of Voice (%)" companies={companies} getValue={c => c.shareOfVoice} bestIs="max" />
              <MetricRow label="AI Rank" companies={companies} getValue={c => c.aiRank} bestIs="min" />
              <MetricRow label="Avg Risk (0-100)" companies={companies} getValue={c => getAvgRisk(c)} bestIs="min" />
              <tr><td colSpan={companies.length + 1} style={{ padding: "8px 16px", background: C.surfaceAlt, fontSize: "10px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase" }}>Pillars</td></tr>
              <MetricRow label="Innovation Score" companies={companies} getValue={c => c.innovation.score} bestIs="max" />
              <MetricRow label="Innovation Weight" companies={companies} getValue={c => c.innovation.weight} bestIs="max" suffix="%" />
              <MetricRow label="Performance Score" companies={companies} getValue={c => c.performance.score} bestIs="max" />
              <MetricRow label="Performance Weight" companies={companies} getValue={c => c.performance.weight} bestIs="max" suffix="%" />
              <MetricRow label="Purpose Score" companies={companies} getValue={c => c.purpose.score} bestIs="max" />
              <MetricRow label="Purpose Weight" companies={companies} getValue={c => c.purpose.weight} bestIs="max" suffix="%" />
              <tr><td colSpan={companies.length + 1} style={{ padding: "8px 16px", background: C.surfaceAlt, fontSize: "10px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase" }}>Risk Dimensions</td></tr>
              {RISK_AXES.map((axis, ai) => (
                <MetricRow key={axis} label={axis} companies={companies} getValue={c => getRiskValues(c)[ai]} bestIs="min" />
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: "11px", color: C.textMuted, marginTop: "8px", fontFamily: "'JetBrains Mono', monospace" }}>
          <span style={{ background: "rgba(74,123,95,0.1)", padding: "2px 8px", borderRadius: "4px", color: C.sage, fontWeight: 700 }}>■</span> = best value
        </div>
      </section>

      {/* RISK RADAR */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px 48px" }}>
        <div style={{
          fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
          color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase",
          marginBottom: "16px",
        }}>
          Risk Profile Comparison · 7 Dimensions
        </div>
        <div style={{
          padding: "32px", background: C.surface,
          border: `1px solid ${C.border}`, borderRadius: "12px", boxShadow: C.shadow,
          display: "flex", justifyContent: "center",
        }}>
          <RadarChart
            axes={RISK_AXES}
            series={companies.map((c, i) => ({
              name: c.name,
              color: COLORS[i],
              values: getRiskValues(c),
            }))}
            size={360}
          />
        </div>
      </section>

      {/* QUARTERLY TREND */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px 48px" }}>
        <div style={{
          fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
          color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase",
          marginBottom: "16px",
        }}>
          Quarterly Trend (FY 2026)
        </div>
        <div style={{
          padding: "32px", background: C.surface,
          border: `1px solid ${C.border}`, borderRadius: "12px", boxShadow: C.shadow,
        }}>
          <LineChart
            series={companies.map((c, i) => ({
              name: c.name,
              color: COLORS[i],
              points: c.quarterly,
            }))}
            xLabels={["Q1", "Q2", "Q3", "Q4"]}
            height={280}
          />
        </div>
      </section>

      {/* PILLAR COMPARISON */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px 48px" }}>
        <div style={{
          fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
          color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase",
          marginBottom: "16px",
        }}>
          Pillar Weight Comparison
        </div>
        <div style={{
          display: "grid", gridTemplateColumns: `repeat(${companies.length}, 1fr)`,
          gap: "16px",
        }}>
          {companies.map((c, i) => (
            <div key={c.name} style={{
              padding: "24px", background: C.surface,
              border: `1px solid ${C.border}`, borderRadius: "12px", boxShadow: C.shadow,
              borderTop: `3px solid ${COLORS[i]}`,
            }}>
              <div style={{
                fontSize: "14px", fontWeight: 700, color: C.text,
                marginBottom: "16px",
              }}>
                {c.name}
              </div>
              <StackedBar segments={[
                { label: "Innovation", value: c.innovation.weight, color: C.sage },
                { label: "Performance", value: c.performance.weight, color: C.accent },
                { label: "Purpose", value: c.purpose.weight, color: C.amber },
              ]} />
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                gap: "8px", marginTop: "16px",
              }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "20px", fontWeight: 800, color: C.sage, fontFamily: "'JetBrains Mono', monospace" }}>{c.innovation.score}</div>
                  <div style={{ fontSize: "9px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>INNOV</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "20px", fontWeight: 800, color: C.accent, fontFamily: "'JetBrains Mono', monospace" }}>{c.performance.score}</div>
                  <div style={{ fontSize: "9px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>PERF</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "20px", fontWeight: 800, color: C.amber, fontFamily: "'JetBrains Mono', monospace" }}>{c.purpose.score}</div>
                  <div style={{ fontSize: "9px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>PURP</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SUMMARY */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px 48px" }}>
        <div style={{
          padding: "32px", background: C.text, color: "#FFFFFF",
          borderRadius: "12px",
        }}>
          <div style={{
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            color: C.sageBright, letterSpacing: "0.14em", textTransform: "uppercase",
            marginBottom: "20px",
          }}>
            Comparison Summary
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}>
            {[
              { label: "Best Overall Score", company: companies.find(c => c.score === bestScore), value: `${bestScore}`, metric: "reputation score" },
              { label: "Best Sentiment", company: companies.find(c => c.sentiment === bestSentiment), value: `${bestSentiment}%`, metric: "positive sentiment" },
              { label: "Lowest Risk", company: companies.find(c => getAvgRisk(c) === lowestRisk), value: `${lowestRisk}`, metric: "avg risk score" },
              { label: "Best AI Visibility", company: bestAI, value: bestAI.aiRank, metric: "AI engine rank" },
            ].map(s => s.company && (
              <div key={s.label} style={{
                padding: "20px", background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px",
              }}>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>
                  {s.label}
                </div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "#FFFFFF", marginBottom: "4px" }}>
                  {s.company.name}
                </div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: C.sageBright, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>
                  {s.metric}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: C.bg, padding: "60px 32px", textAlign: "center",
      }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 36px)", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
            Want a deeper comparison?
          </h2>
          <p style={{ fontSize: "16px", color: C.textSec, marginBottom: "28px", lineHeight: 1.6 }}>
            Get a detailed comparison report with 30+ metrics, narrative analysis, and 90-day recommendations.
          </p>
          <a href="/atelier/audit" style={{
            display: "inline-block", padding: "14px 32px",
            background: C.sage, color: "#FFFFFF",
            fontSize: "14px", fontWeight: 600, textDecoration: "none",
            borderRadius: "8px", fontFamily: "'Inter', sans-serif",
          }}>
            Get detailed report →
          </a>
        </div>
      </section>

      <AtelierFooter />
      <BackToTop />
    </>
  );
}

// ─── Sub-components ─────────────────────────────────────────────

function MetricRow({
  label, companies, getValue, bestIs, suffix = "",
}: {
  label: string;
  companies: CompanyData[];
  getValue: (c: CompanyData) => number | string;
  bestIs: "max" | "min";
  suffix?: string;
}) {
  const values = companies.map(c => ({ c, v: getValue(c) }));
  const numericValues = values.filter(v => typeof v.v === "number").map(v => v.v as number);
  const bestValue = bestIs === "max" ? Math.max(...numericValues) : Math.min(...numericValues);

  return (
    <tr style={{ borderBottom: `1px solid ${C.borderLight}` }}>
      <td style={{ padding: "12px 16px", fontSize: "13px", color: C.textSec, fontWeight: 500 }}>
        {label}
      </td>
      {values.map(({ c, v }) => {
        const isBest = typeof v === "number" && v === bestValue;
        return (
          <td key={c.name} style={{
            padding: "12px 16px", textAlign: "center",
            fontSize: "15px", fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
            color: isBest ? C.sage : C.text,
            background: isBest ? "rgba(74,123,95,0.08)" : "transparent",
          }}>
            {v}{suffix}
          </td>
        );
      })}
    </tr>
  );
}

const thStyle: React.CSSProperties = {
  padding: "14px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600,
  color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase",
  fontFamily: "'JetBrains Mono', monospace",
  borderBottom: `1px solid ${C.border}`,
};
