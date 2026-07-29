"use client";

import { AtelierNav } from "../../components/AtelierNav";
import { AtelierFooter } from "../../components/AtelierFooter";
import { ScrollProgress, CursorGlow, BackToTop } from "../../components/shared";
import {
  BarChart,
  HorizontalBarChart,
  LineChart,
  DonutChart,
  Gauge,
  Heatmap,
  RadarChart,
  StackedBar,
  MetricRow,
} from "../../components/charts/Charts";
import {
  type Article,
  type ContentBlock,
  type ChartSpec,
  getRelatedArticles,
} from "../articles";

const C = {
  bg: "#FAFAFA", surface: "#FFFFFF", surfaceAlt: "#F4F4F5",
  border: "#E5E5E5", borderLight: "#F0F0F0",
  text: "#0A0A0A", textSec: "#525252", textMuted: "#71717A",
  accent: "#4A5D6E", sage: "#4A7B5F", sageBright: "#6FA386",
  red: "#A0524B", amber: "#B87333",
  shadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
};

export default function ArticlePage({ article }: { article: Article }) {
  const related = getRelatedArticles(article, 3);

  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <AtelierNav />

      {/* ARTICLE HERO */}
      <section
        style={{
          background: `linear-gradient(180deg, ${C.surface} 0%, ${C.bg} 100%)`,
          borderBottom: `1px solid ${C.border}`,
          padding: "100px 32px 64px",
        }}
      >
        <div style={{ maxWidth: "820px", margin: "0 auto" }}>
          <div style={{ marginBottom: "24px" }}>
            <a
              href="/atelier/blog"
              style={{
                fontSize: "12px",
                fontFamily: "'JetBrains Mono', monospace",
                color: C.accent,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              ← Back to blog
            </a>
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "6px 14px",
              background: `${article.coverColor}12`,
              border: `1px solid ${article.coverColor}30`,
              borderRadius: "100px",
              fontSize: "11px",
              fontFamily: "'JetBrains Mono', monospace",
              color: article.coverColor,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: "24px",
            }}
          >
            {article.category}
          </div>
          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 52px)",
              fontWeight: 800,
              letterSpacing: "-0.035em",
              lineHeight: 1.08,
              color: C.text,
              margin: "0 0 28px",
            }}
          >
            {article.title}
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: C.textSec,
              lineHeight: 1.55,
              margin: "0 0 32px",
            }}
          >
            {article.excerpt}
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
              paddingTop: "24px",
              borderTop: `1px solid ${C.border}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${article.coverColor}, ${C.accent})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: "16px",
                  fontFamily: "'Inter', sans-serif",
                }}
                aria-hidden
              >
                {article.author
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: C.text }}>
                  {article.author}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: C.textMuted,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {article.authorRole}
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: "20px",
                fontSize: "12px",
                color: C.textMuted,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <span>{article.dateLabel}</span>
              <span>·</span>
              <span>{article.readTime}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ARTICLE BODY */}
      <article style={{ background: C.bg }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", padding: "64px 32px" }}>
          {article.content.map((block, i) => (
            <BlockRenderer key={i} block={block} accent={article.coverColor} />
          ))}

          {/* TAGS */}
          <div
            style={{
              marginTop: "56px",
              paddingTop: "32px",
              borderTop: `1px solid ${C.border}`,
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontFamily: "'JetBrains Mono', monospace",
                color: C.textMuted,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "14px",
              }}
            >
              Tags
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {article.tags.map((t) => (
                <span
                  key={t}
                  style={{
                    fontSize: "11px",
                    fontFamily: "'JetBrains Mono', monospace",
                    color: C.textSec,
                    padding: "5px 10px",
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: "4px",
                  }}
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </article>

      {/* AUTHOR BIO */}
      <section
        style={{
          background: C.surface,
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
          padding: "64px 32px",
        }}
      >
        <div style={{ maxWidth: "760px", margin: "0 auto", padding: "0 16px" }}>
          <div
            style={{
              display: "flex",
              gap: "24px",
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${article.coverColor}, ${C.accent})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: "22px",
                flexShrink: 0,
              }}
              aria-hidden
            >
              {article.author
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div style={{ flex: 1, minWidth: "240px" }}>
              <div
                style={{
                  fontSize: "11px",
                  fontFamily: "'JetBrains Mono', monospace",
                  color: C.sage,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                Written by
              </div>
              <h3
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: C.text,
                  letterSpacing: "-0.02em",
                  margin: "0 0 4px",
                }}
              >
                {article.author}
              </h3>
              <div
                style={{
                  fontSize: "13px",
                  color: C.accent,
                  fontFamily: "'JetBrains Mono', monospace",
                  marginBottom: "12px",
                }}
              >
                {article.authorRole}
              </div>
              <p
                style={{
                  fontSize: "15px",
                  color: C.textSec,
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {article.authorBio}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          background: `linear-gradient(135deg, ${C.accent} 0%, ${article.coverColor} 100%)`,
          padding: "48px 16px",
        }}
      >
        <div style={{ maxWidth: "720px", margin: "0 auto", textAlign: "center" }}>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              margin: "0 0 16px",
            }}
          >
            Get your reputation audit →
          </h2>
          <p
            style={{
              fontSize: "17px",
              color: "rgba(255,255,255,0.85)",
              lineHeight: 1.55,
              margin: "0 0 32px",
            }}
          >
            A board-ready audit of how your company is perceived across 30+ media
            sources, 8 AI engines and the social conversation — in Darija, French
            and English. 5 minutes to request. 7 days to deliver.
          </p>
          <a
            href="/atelier/audit"
            style={{
              display: "inline-block",
              padding: "16px 36px",
              background: "#FFFFFF",
              color: C.text,
              fontSize: "16px",
              fontWeight: 700,
              borderRadius: "4px",
              textDecoration: "none",
              fontFamily: "'Inter', sans-serif",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Request my free audit →
          </a>
        </div>
      </section>

      {/* RELATED ARTICLES */}
      <section style={{ background: C.bg, padding: "48px 16px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px" }}>
          <div
            style={{
              fontSize: "11px",
              fontFamily: "'JetBrains Mono', monospace",
              color: C.accent,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            Related articles
          </div>
          <h2
            style={{
              fontSize: "clamp(26px, 3.5vw, 34px)",
              fontWeight: 700,
              color: C.text,
              letterSpacing: "-0.02em",
              margin: "0 0 40px",
            }}
          >
            Keep reading.
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "20px",
            }}
          >
            {related.map((a) => (
              <a
                key={a.slug}
                href={`/atelier/blog/${a.slug}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: "12px",
                  padding: "28px",
                  textDecoration: "none",
                  transition: "all 0.2s",
                  borderTop: `3px solid ${a.coverColor}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "14px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      fontFamily: "'JetBrains Mono', monospace",
                      padding: "3px 10px",
                      borderRadius: "100px",
                      background: `${a.coverColor}15`,
                      color: a.coverColor,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    {a.category}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: C.textMuted,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {a.readTime}
                  </span>
                </div>
                <h3
                  style={{
                    fontSize: "17px",
                    fontWeight: 700,
                    color: C.text,
                    letterSpacing: "-0.01em",
                    margin: "0 0 12px",
                    lineHeight: 1.3,
                  }}
                >
                  {a.title}
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: C.textSec,
                    lineHeight: 1.55,
                    margin: "0 0 16px",
                    flex: 1,
                  }}
                >
                  {a.excerpt}
                </p>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: a.coverColor,
                  }}
                >
                  Read →
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <AtelierFooter />
      <BackToTop />
    </>
  );
}

// ─── Block renderer ────────────────────────────────────────────
function BlockRenderer({ block, accent }: { block: ContentBlock; accent: string }) {
  switch (block.type) {
    case "p":
      return (
        <p
          style={{
            fontSize: "17px",
            color: C.textSec,
            lineHeight: 1.75,
            margin: "0 0 24px",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {block.text}
        </p>
      );

    case "h2":
      return (
        <h2
          style={{
            fontSize: "26px",
            fontWeight: 700,
            color: C.text,
            letterSpacing: "-0.02em",
            lineHeight: 1.25,
            margin: "48px 0 18px",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {block.text}
        </h2>
      );

    case "h3":
      return (
        <h3
          style={{
            fontSize: "16px",
            fontWeight: 600,
            color: C.text,
            letterSpacing: "-0.01em",
            lineHeight: 1.3,
            margin: "32px 0 12px",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {block.text}
        </h3>
      );

    case "ul":
      return (
        <ul
          style={{
            margin: "0 0 24px",
            paddingLeft: "0",
            listStyle: "none",
          }}
        >
          {block.items.map((item, i) => (
            <li
              key={i}
              style={{
                position: "relative",
                paddingLeft: "24px",
                marginBottom: "10px",
                fontSize: "16px",
                color: C.textSec,
                lineHeight: 1.7,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: "0",
                  top: "12px",
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: accent,
                }}
                aria-hidden
              />
              {item}
            </li>
          ))}
        </ul>
      );

    case "ol":
      return (
        <ol
          style={{
            margin: "0 0 24px",
            paddingLeft: "0",
            listStyle: "none",
            counterReset: "step",
          }}
        >
          {block.items.map((item, i) => (
            <li
              key={i}
              style={{
                position: "relative",
                paddingLeft: "40px",
                marginBottom: "14px",
                fontSize: "16px",
                color: C.textSec,
                lineHeight: 1.7,
                fontFamily: "'Inter', sans-serif",
                counterIncrement: "step",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: "0",
                  top: "1px",
                  width: "26px",
                  height: "26px",
                  borderRadius: "50%",
                  background: `${accent}12`,
                  color: accent,
                  fontSize: "12px",
                  fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-hidden
              >
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ol>
      );

    case "quote":
      return (
        <blockquote
          style={{
            margin: "32px 0",
            padding: "24px 28px",
            background: C.surface,
            borderLeft: `4px solid ${accent}`,
            borderRadius: "0 8px 8px 0",
            boxShadow: C.shadow,
          }}
        >
          <div
            style={{
              fontSize: "18px",
              color: C.text,
              fontStyle: "italic",
              lineHeight: 1.55,
              margin: "0 0 12px",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            “{block.text}”
          </div>
          {block.attribution && (
            <div
              style={{
                fontSize: "12px",
                color: C.textMuted,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.04em",
              }}
            >
              — {block.attribution}
            </div>
          )}
        </blockquote>
      );

    case "stat":
      return (
        <div
          style={{
            margin: "32px 0",
            padding: "28px 32px",
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderLeft: `4px solid ${block.color || accent}`,
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "24px",
            flexWrap: "wrap",
            boxShadow: C.shadow,
          }}
        >
          <div
            style={{
              fontSize: "48px",
              fontWeight: 800,
              color: block.color || accent,
              fontFamily: "'JetBrains Mono', monospace",
              lineHeight: 1,
              letterSpacing: "-0.04em",
              flexShrink: 0,
            }}
          >
            {block.value}
          </div>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <div
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: C.text,
                marginBottom: "4px",
              }}
            >
              {block.label}
            </div>
            {block.sublabel && (
              <div
                style={{
                  fontSize: "13px",
                  color: C.textMuted,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {block.sublabel}
              </div>
            )}
          </div>
        </div>
      );

    case "chart":
      return (
        <figure
          style={{
            margin: "36px 0",
            padding: "28px",
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "12px",
            boxShadow: C.shadow,
          }}
        >
          {block.chart.title && (
            <figcaption
              style={{
                fontSize: "11px",
                fontFamily: "'JetBrains Mono', monospace",
                color: C.accent,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "20px",
              }}
            >
              {block.chart.title}
            </figcaption>
          )}
          <ChartRenderer chart={block.chart} />
        </figure>
      );

    case "table":
      return (
        <figure
          style={{
            margin: "36px 0",
            padding: "0",
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: C.shadow,
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13.5px",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <thead>
                <tr style={{ background: C.surfaceAlt }}>
                  {block.headers.map((h, i) => (
                    <th
                      key={i}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontSize: "11px",
                        fontWeight: 700,
                        color: C.accent,
                        fontFamily: "'JetBrains Mono', monospace",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        borderBottom: `1px solid ${C.border}`,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, ri) => (
                  <tr
                    key={ri}
                    style={{
                      borderBottom:
                        ri < block.rows.length - 1
                          ? `1px solid ${C.borderLight}`
                          : "none",
                    }}
                  >
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        style={{
                          padding: "12px 16px",
                          color: ci === 0 ? C.text : C.textSec,
                          fontWeight: ci === 0 ? 600 : 400,
                          fontFamily:
                            ci === 0 ? "'Inter', sans-serif" : "'JetBrains Mono', monospace",
                          fontSize: ci === 0 ? "13.5px" : "12.5px",
                        }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.caption && (
            <figcaption
              style={{
                padding: "12px 16px",
                fontSize: "11px",
                color: C.textMuted,
                fontFamily: "'JetBrains Mono', monospace",
                background: C.surfaceAlt,
                borderTop: `1px solid ${C.borderLight}`,
              }}
            >
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case "callout":
      return <Callout block={block} accent={accent} />;

    default:
      return null;
  }
}

function Callout({
  block,
  accent,
}: {
  block: Extract<ContentBlock, { type: "callout" }>;
  accent: string;
}) {
  const variant =
    block.variant === "warning"
      ? { color: C.amber, bg: "rgba(184,115,51,0.06)", icon: "⚠" }
      : block.variant === "success"
        ? { color: C.sage, bg: "rgba(74,123,95,0.06)", icon: "✓" }
        : { color: accent, bg: `${accent}0a`, icon: "→" };

  return (
    <div
      style={{
        margin: "32px 0",
        padding: "24px 28px",
        background: variant.bg,
        border: `1px solid ${variant.color}30`,
        borderRadius: "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "8px",
        }}
      >
        <span
          style={{
            color: variant.color,
            fontSize: "14px",
            fontWeight: 700,
          }}
          aria-hidden
        >
          {variant.icon}
        </span>
        <div
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: variant.color,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {block.title}
        </div>
      </div>
      <div
        style={{
          fontSize: "15px",
          color: C.text,
          lineHeight: 1.6,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {block.text}
      </div>
    </div>
  );
}

// ─── Chart renderer ────────────────────────────────────────────
// Converts the serializable `format` template string (e.g. "{v}%") into the
// `formatValue` function the Charts library expects.
function makeFormatter(format?: string): ((v: number) => string) | undefined {
  if (!format) return undefined;
  return (v: number) => format.replace("{v}", String(v));
}

function ChartRenderer({ chart }: { chart: ChartSpec }) {
  switch (chart.kind) {
    case "bar":
      return (
        <BarChart
          data={chart.data}
          height={chart.height ?? 240}
          formatValue={makeFormatter(chart.format)}
        />
      );
    case "hbar":
      return (
        <HorizontalBarChart data={chart.data} formatValue={makeFormatter(chart.format)} />
      );
    case "line":
      return (
        <LineChart
          series={chart.series}
          height={chart.height ?? 260}
          xLabels={chart.xLabels}
          yMax={chart.yMax}
        />
      );
    case "donut":
      return (
        <DonutChart
          data={chart.data}
          centerValue={chart.centerValue}
          centerLabel={chart.centerLabel}
          size={220}
        />
      );
    case "gauge":
      return (
        <Gauge
          score={chart.score}
          max={chart.max ?? 100}
          color={chart.color ?? C.sage}
          label={chart.label}
          size={200}
        />
      );
    case "heatmap":
      return <Heatmap rows={chart.rows} cols={chart.cols} data={chart.data} />;
    case "radar":
      return <RadarChart axes={chart.axes} series={chart.series} size={chart.size ?? 320} />;
    case "stacked":
      return <StackedBar segments={chart.segments} height={36} />;
    case "metricrow":
      return <MetricRow metrics={chart.metrics} />;
    default:
      return null;
  }
}
