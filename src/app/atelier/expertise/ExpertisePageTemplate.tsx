"use client";

import { AtelierNav } from "../components/AtelierNav";
import { AtelierFooter } from "../components/AtelierFooter";
import { ScrollProgress, CursorGlow, BackToTop } from "../components/shared";
import type { ReactNode } from "react";
import {
  BarChart, HorizontalBarChart, LineChart, DonutChart, Gauge,
  Heatmap, RadarChart, StatCard,
} from "../components/charts/Charts";

const C = {
  bg: "#FAFAFA", surface: "#FFFFFF", surfaceAlt: "#F4F4F5",
  border: "#E5E5E5", borderLight: "#F0F0F0",
  text: "#0A0A0A", textSec: "#525252", textMuted: "#71717A",
  accent: "#4A5D6E", sage: "#4A7B5F", sageBright: "#6FA386",
  red: "#A0524B", amber: "#B87333",
  shadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
};

type VisualSectionType =
  | "heatmap" | "donut" | "hbar" | "radar"
  | "line" | "gauge" | "bars" | "statcards" | "timeline";

interface VisualSection {
  title: string;
  description?: string;
  type: VisualSectionType;
  fullWidth?: boolean;
  data: any;
}

export interface ExpertiseData {
  slug: string;
  eyebrow: string;
  title: string;
  tagline: string;
  intro: string;
  color: string;
  stats: { value: string; label: string }[];
  pillars: { title: string; desc: string; icon: string }[];
  useCases: string[];
  features: string[];
  visualSections?: VisualSection[];
  quote: { text: string; author: string; role: string };
  relatedReports: { title: string; href: string }[];
}

function getFormatter(format?: string) {
  switch (format) {
    case "hours": return (v: number) => `${v}h`;
    case "percent": return (v: number) => `${v}%`;
    default: return undefined;
  }
}

const IMPACT_COLOR: Record<string, string> = {
  high: C.red,
  medium: C.amber,
  low: C.sage,
};

function VisualSectionCard({ vs, accent }: { vs: VisualSection; accent: string }) {
  let chart: ReactNode = null;
  switch (vs.type) {
    case "heatmap":
      chart = (
        <Heatmap
          rows={vs.data.rows}
          cols={vs.data.cols}
          data={vs.data.cells}
          colorScale={vs.data.colorScale}
        />
      );
      break;
    case "donut":
      chart = (
        <DonutChart
          data={vs.data.segments}
          centerLabel={vs.data.centerLabel}
          centerValue={vs.data.centerValue}
          size={vs.data.size ?? 220}
        />
      );
      break;
    case "hbar":
      chart = (
        <HorizontalBarChart
          data={vs.data.items}
          color={vs.data.color ?? accent}
          formatValue={getFormatter(vs.data.format)}
        />
      );
      break;
    case "radar":
      chart = (
        <RadarChart
          axes={vs.data.axes}
          series={vs.data.series}
          size={vs.data.size ?? 320}
        />
      );
      break;
    case "line":
      chart = (
        <LineChart
          series={vs.data.series}
          xLabels={vs.data.xLabels}
          yMax={vs.data.yMax}
          height={vs.data.height ?? 260}
        />
      );
      break;
    case "gauge":
      chart = (
        <Gauge
          score={vs.data.score}
          label={vs.data.label}
          color={vs.data.color ?? accent}
          size={vs.data.size ?? 200}
        />
      );
      break;
    case "bars":
      chart = (
        <BarChart
          data={vs.data.items}
          color={vs.data.color ?? accent}
          height={vs.data.height ?? 240}
          formatValue={getFormatter(vs.data.format)}
        />
      );
      break;
    case "statcards":
      chart = (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
        }}>
          {vs.data.cards.map((c: any, i: number) => (
            <StatCard
              key={i}
              value={c.value}
              label={c.label}
              sublabel={c.sublabel}
              color={c.color}
              trend={c.trend}
            />
          ))}
        </div>
      );
      break;
    case "timeline":
      chart = (
        <div style={{ position: "relative", paddingLeft: "36px" }}>
          <div style={{
            position: "absolute", left: "11px", top: "10px", bottom: "10px",
            width: "2px", background: C.border,
          }} />
          {vs.data.events.map((ev: any, i: number) => {
            const ic = IMPACT_COLOR[ev.impact] ?? C.sage;
            return (
              <div key={i} style={{
                position: "relative",
                paddingBottom: i === vs.data.events.length - 1 ? 0 : "22px",
              }}>
                <div style={{
                  position: "absolute", left: "-36px", top: "2px",
                  width: "24px", height: "24px", borderRadius: "50%",
                  background: C.surface, border: `2px solid ${ic}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "10px", fontWeight: 700, color: ic,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {i + 1}
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  marginBottom: "6px", flexWrap: "wrap",
                }}>
                  <span style={{
                    fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
                    color: C.textMuted, fontWeight: 700,
                  }}>
                    {ev.date}
                  </span>
                  <span style={{
                    fontSize: "9px", fontFamily: "'JetBrains Mono', monospace",
                    color: ic, fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "0.08em", padding: "2px 7px",
                    background: `${ic}12`, borderRadius: "3px",
                  }}>
                    {ev.impact} impact
                  </span>
                </div>
                <div style={{
                  fontSize: "14px", fontWeight: 600, color: C.text, marginBottom: "4px",
                }}>
                  {ev.title}
                </div>
                {ev.description && (
                  <div style={{ fontSize: "12px", color: C.textSec, lineHeight: 1.5 }}>
                    {ev.description}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
      break;
  }

  return (
    <div style={{
      padding: "28px", background: C.surface,
      border: `1px solid ${C.border}`, borderRadius: "12px",
      boxShadow: C.shadow,
      gridColumn: vs.fullWidth ? "1 / -1" : "auto",
      display: "flex", flexDirection: "column",
    }}>
      <div>
        <h3 style={{
          fontSize: "17px", fontWeight: 700, color: C.text,
          letterSpacing: "-0.01em", margin: "0 0 8px",
        }}>
          {vs.title}
        </h3>
        {vs.description && (
          <p style={{
            fontSize: "13px", color: C.textSec, lineHeight: 1.55, margin: 0,
          }}>
            {vs.description}
          </p>
        )}
      </div>
      <div style={{ marginTop: "24px", flex: 1 }}>
        {chart}
      </div>
    </div>
  );
}

export function ExpertisePage({ data }: { data: ExpertiseData }) {
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
            color: data.color, letterSpacing: "0.14em", textTransform: "uppercase",
            marginBottom: "24px",
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: data.color, animation: "pulse 2s infinite" }} />
            {data.eyebrow}
          </div>
          <h1 style={{
            fontSize: "clamp(32px, 8vw, 48px)", fontWeight: 800,
            letterSpacing: "-0.04em", lineHeight: 1.0, color: C.text,
            margin: "0 0 28px", maxWidth: "900px",
          }}>
            {data.title}
          </h1>
          <p style={{
            fontSize: "clamp(18px, 2.5vw, 22px)", color: data.color, fontWeight: 600,
            lineHeight: 1.4, marginBottom: "32px", maxWidth: "760px",
          }}>
            {data.tagline}
          </p>
          <p style={{
            fontSize: "17px", color: C.textSec, lineHeight: 1.65,
            maxWidth: "760px", marginBottom: "48px",
          }}>
            {data.intro}
          </p>

          {/* Stats */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))",
            gap: "1px", background: C.border, border: `1px solid ${C.border}`,
            borderRadius: "12px", overflow: "hidden", maxWidth: "900px",
          }}>
            {data.stats.map(s => (
              <div key={s.label} style={{ background: C.surface, padding: "20px 24px" }}>
                <div style={{ fontSize: "28px", fontWeight: 800, color: data.color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1, marginBottom: "6px" }}>
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

      {/* PILLARS */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "48px 16px" }}>
        <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
          What we do
        </div>
        <h2 style={{ fontSize: "clamp(24px, 6vw, 36px)", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: "0 0 48px" }}>
          How we help.
        </h2>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
        }}>
          {data.pillars.map(p => (
            <div key={p.title} style={{
              padding: "32px", background: C.surface,
              border: `1px solid ${C.border}`, borderRadius: "12px",
              boxShadow: C.shadow, borderTop: `3px solid ${data.color}`,
            }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "10px",
                background: `${data.color}15`, color: data.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "16px", fontWeight: 700, marginBottom: "20px",
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {p.icon}
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: C.text, marginBottom: "12px", letterSpacing: "-0.01em" }}>
                {p.title}
              </h3>
              <p style={{ fontSize: "14px", color: C.textSec, lineHeight: 1.6, margin: 0 }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* USE CASES */}
      <section style={{
        background: C.surface, padding: "48px 16px",
        borderTop: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 16px" }}>
          <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
            Use cases
          </div>
          <h2 style={{ fontSize: "clamp(24px, 6vw, 36px)", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: "0 0 40px" }}>
            What you can do.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
            {data.useCases.map((u, i) => (
              <div key={i} style={{
                padding: "20px 24px", background: C.bg,
                border: `1px solid ${C.border}`, borderRadius: "10px",
                display: "flex", gap: "14px", alignItems: "flex-start",
              }}>
                <span style={{
                  fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
                  color: data.color, fontWeight: 700, flexShrink: 0,
                  padding: "3px 8px", background: `${data.color}10`,
                  borderRadius: "4px", marginTop: "2px",
                }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ fontSize: "14px", color: C.text, lineHeight: 1.55 }}>
                  {u}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DATA INSIGHTS */}
      {data.visualSections && data.visualSections.length > 0 && (
        <section style={{
          background: C.bg, padding: "48px 16px",
          borderTop: `1px solid ${C.border}`,
        }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px" }}>
            <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
              Data insights
            </div>
            <h2 style={{ fontSize: "clamp(24px, 6vw, 36px)", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
              Live signals, from the Harch IQ engine.
            </h2>
            <p style={{ fontSize: "16px", color: C.textSec, lineHeight: 1.6, margin: "0 0 48px", maxWidth: "780px" }}>
              Real data from our monitoring pipeline — refreshed continuously across 30+ media sources, 12 regulators, and the Harch 100 corporate universe.
            </p>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
              gap: "20px",
            }}>
              {data.visualSections.map((vs, i) => (
                <VisualSectionCard key={i} vs={vs} accent={data.color} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FEATURES */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "48px 16px" }}>
        <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
          Capabilities
        </div>
        <h2 style={{ fontSize: "clamp(24px, 6vw, 36px)", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: "0 0 40px" }}>
          What&apos;s included.
        </h2>
        <div style={{
          padding: "32px", background: C.surface,
          border: `1px solid ${C.border}`, borderRadius: "12px",
          boxShadow: C.shadow,
        }}>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "8px 24px",
          }}>
            {data.features.map((f, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", fontSize: "13px", color: C.textSec, lineHeight: 1.5 }}>
                <span style={{ color: data.color, fontWeight: 700, flexShrink: 0 }}>✓</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section style={{
        background: data.color, color: "#FFFFFF",
        padding: "48px 16px",
      }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 16px", textAlign: "center" }}>
          <div style={{ fontSize: "60px", lineHeight: 0.5, marginBottom: "20px", opacity: 0.4 }}>&ldquo;</div>
          <p style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 600, lineHeight: 1.4, marginBottom: "32px", color: "#FFFFFF" }}>
            {data.quote.text}
          </p>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "4px" }}>
            {data.quote.author}
          </div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", fontFamily: "'JetBrains Mono', monospace" }}>
            {data.quote.role}
          </div>
        </div>
      </section>

      {/* RELATED REPORTS */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 16px" }}>
        <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
          Related reports
        </div>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 36px)", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: "0 0 32px" }}>
          Go deeper.
        </h2>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px",
        }}>
          {data.relatedReports.map(r => (
            <a key={r.href} href={r.href} style={{
              padding: "24px", background: C.surface,
              border: `1px solid ${C.border}`, borderRadius: "12px",
              boxShadow: C.shadow, textDecoration: "none",
              transition: "all 0.2s", borderTop: `3px solid ${data.color}`,
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = C.shadow;
              }}
            >
              <div style={{ fontSize: "16px", fontWeight: 600, color: C.text, marginBottom: "8px" }}>
                {r.title}
              </div>
              <div style={{ fontSize: "13px", color: data.color, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                Learn more →
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: C.text, color: "#FFFFFF",
        padding: "48px 16px", textAlign: "center",
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 16px" }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 20px", color: "#FFFFFF" }}>
            Ready to put {data.eyebrow.toLowerCase()} first?
          </h2>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)", marginBottom: "32px", lineHeight: 1.6 }}>
            Request a personalized demo and see how our {data.eyebrow.toLowerCase()} expertise can transform your team.
          </p>
          <a href="/atelier/audit" style={{
            display: "inline-block", padding: "16px 32px",
            background: data.color, color: "#FFFFFF",
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
      `}</style>
    </>
  );
}


// EXPERTISE_DATA moved to ./expertiseData.ts to avoid server/client serialization issues
// Pages should import directly from ./expertiseData, not from here.
