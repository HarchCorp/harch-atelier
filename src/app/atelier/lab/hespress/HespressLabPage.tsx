"use client";

import { useState, useCallback, useMemo } from "react";
import { AtelierNav } from "../../components/AtelierNav";
import { AtelierFooter } from "../../components/AtelierFooter";
import { ScrollProgress, CursorGlow, BackToTop } from "../../components/shared";
import { C } from "../../components/tokens";

// ═══════════════════════════════════════════════════════════════
//  HESPRESS COMMENTS LAB — Task BRICK-1-hespress
//
//  Client-side demo page for the Hespress comments scraper.
//
//  Flow:
//    1. User pastes a Hespress article URL (or clicks "Sample article")
//    2. POST /api/scrape/hespress-comments with the URL
//    3. Render the scraped comments in a table with sentiment + language badges
//    4. Show summary stats: total, % positive/neutral/negative,
//       % Darija vs Arabic vs French, top 3 most-liked comments
//
//  The page is honest about data source:
//    • "wp-rest" badge = real comments from Hespress WP REST API
//    • "html" badge = comments parsed from the article HTML
//    • "mock" badge = synthetic Darija samples (when Cloudflare blocks)
//    • "none" = total failure — show error CTA
//
//  This page is client-side ("use client"). The actual scraping happens
//  server-side in the API route (the scraper uses fetch + the NLP
//  modules which need Node, not the browser).
// ═══════════════════════════════════════════════════════════════

// ─── LOCAL DESIGN TOKENS (mirror of C, plus a few extras) ───────
const T = {
  ...C,
  bgSubtle: "#fafafa",
  bgHover: "#f5f5f5",
  textSec: "#525252",
  info: "#3b82f6",
  infoBg: "#eff6ff",
  infoBorder: "#bfdbfe",
};

// ─── TYPES (mirror of server-side ScrapeResult) ─────────────────

type CommentLanguage = "darija" | "arabic" | "french" | "mixed";
type SentimentPolarity = "positive" | "negative" | "neutral";
type ScrapeSource = "wp-rest" | "html" | "mock" | "none";

interface CommentSentiment {
  polarity: SentimentPolarity;
  score: number;
  sarcasmDetected: boolean;
}

interface ScrapedComment {
  id: string;
  author: string | null;
  content: string;
  publishedAt: string | null;
  parentId: string | null;
  likes: number;
  sentiment: CommentSentiment;
  language: CommentLanguage;
}

interface ScrapeResult {
  articleUrl: string;
  articleId: string;
  commentsScraped: number;
  comments: ScrapedComment[];
  source: ScrapeSource;
  warning?: string;
  durationMs: number;
  isDemo?: boolean;
  rateLimited?: boolean;
}

// ─── CONSTANTS ──────────────────────────────────────────────────

const SAMPLE_URL = "https://hespress.com/articles/1372457.html";
const SECONDARY_SAMPLE_URL = "https://hespress.com/sport/1372401.html";

const SOURCE_META: Record<
  ScrapeSource,
  { label: string; bg: string; fg: string; border: string; desc: string }
> = {
  "wp-rest": {
    label: "LIVE · WP REST API",
    bg: T.successBg,
    fg: T.success,
    border: "#a7f3d0",
    desc: "Real comments fetched from Hespress's WordPress REST API endpoint /wp-json/wp/v2/comments.",
  },
  html: {
    label: "LIVE · HTML PARSE",
    bg: T.infoBg,
    fg: T.info,
    border: T.infoBorder,
    desc: "Real comments parsed from the article HTML (WP REST API was unreachable).",
  },
  mock: {
    label: "SAMPLE DATA",
    bg: T.warningBg,
    fg: T.warningText,
    border: T.warningBorder,
    desc: "Synthetic Darija samples run through the real NLP pipeline. Live fetch was blocked (Cloudflare or network).",
  },
  none: {
    label: "FAILED",
    bg: T.dangerBg,
    fg: T.danger,
    border: "#fecaca",
    desc: "Scrape completely failed — no comments and no sample data.",
  },
};

const LANG_META: Record<CommentLanguage, { label: string; bg: string; fg: string }> = {
  darija: { label: "Darija", bg: "#fef3c7", fg: "#92400e" }, // amber-100 / amber-800
  arabic: { label: "Arabic", bg: "#ddd6fe", fg: "#5b21b6" }, // violet-200 / violet-800
  french: { label: "French", bg: "#dbeafe", fg: "#1e40af" }, // blue-100 / blue-800
  mixed: { label: "Mixed", bg: "#e0e7ff", fg: "#3730a3" }, // indigo-100 / indigo-800
};

const POLARITY_META: Record<SentimentPolarity, { label: string; bg: string; fg: string }> = {
  positive: { label: "Positive", bg: T.successBg, fg: T.success },
  negative: { label: "Negative", bg: T.dangerBg, fg: T.danger },
  neutral: { label: "Neutral", bg: T.bgHover, fg: T.textSec },
};

// ─── SHARED UI ──────────────────────────────────────────────────

function truncate(s: string, n: number): string {
  if (!s) return "";
  return s.length > n ? s.slice(0, n) + "…" : s;
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function fmtDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function fmtPct(n: number): string {
  return `${(n * 100).toFixed(0)}%`;
}

// ─── MAIN PAGE COMPONENT ────────────────────────────────────────

export function HespressLabPage() {
  const [url, setUrl] = useState("");
  const [forceMock, setForceMock] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScrapeResult | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/scrape/hespress-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleUrl: url,
          forceMock,
          maxComments: 500,
        }),
      });
      const json = (await res.json()) as ScrapeResult & {
        error?: string;
        message?: string;
        retryAfter?: number;
      };
      if (!res.ok) {
        const msg =
          json.message ||
          json.error ||
          `HTTP ${res.status} ${res.statusText}`;
        setError(msg);
        setResult(null);
        return;
      }
      setResult(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [url, forceMock]);

  // ─── DERIVED STATS ───────────────────────────────────────────
  const stats = useMemo(() => {
    if (!result || result.comments.length === 0) return null;
    const c = result.comments;
    const total = c.length;
    const byPolarity = {
      positive: c.filter((x) => x.sentiment.polarity === "positive").length,
      neutral: c.filter((x) => x.sentiment.polarity === "neutral").length,
      negative: c.filter((x) => x.sentiment.polarity === "negative").length,
    };
    const byLanguage = {
      darija: c.filter((x) => x.language === "darija").length,
      arabic: c.filter((x) => x.language === "arabic").length,
      french: c.filter((x) => x.language === "french").length,
      mixed: c.filter((x) => x.language === "mixed").length,
    };
    const sarcasmCount = c.filter((x) => x.sentiment.sarcasmDetected).length;
    const avgScore =
      c.reduce((acc, x) => acc + x.sentiment.score, 0) / total;
    const top3Liked = [...c]
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 3);
    const top3Negative = c
      .filter((x) => x.sentiment.polarity === "negative")
      .sort((a, b) => a.sentiment.score - b.sentiment.score)
      .slice(0, 3);
    return {
      total,
      byPolarity,
      byLanguage,
      sarcasmCount,
      avgScore,
      top3Liked,
      top3Negative,
    };
  }, [result]);

  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <AtelierNav />
      <main style={{ background: T.bgSubtle, minHeight: "100vh" }}>
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "48px 24px 96px",
          }}
        >
          {/* ─── HEADER ─── */}
          <header style={{ marginBottom: "32px" }}>
            <div
              style={{
                display: "inline-block",
                fontFamily: T.fontMono,
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: T.accent,
                background: "rgba(120,113,108,0.08)",
                padding: "4px 10px",
                borderRadius: "6px",
                marginBottom: "16px",
              }}
            >
              LAB · BRICK-1-HESPRESS
            </div>
            <h1
              style={{
                fontSize: "36px",
                fontWeight: 700,
                color: T.text,
                margin: "0 0 12px",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              Hespress Comments Lab
            </h1>
            <p
              style={{
                fontSize: "16px",
                lineHeight: 1.6,
                color: T.textBody,
                margin: 0,
                maxWidth: "760px",
              }}
            >
              Scrape comments from any Hespress article and run them
              through the existing Darija NLP pipeline (sentiment +
              sarcasm + language detection). Hespress is Morocco&apos;s
              most-read digital news outlet — its comments are the
              richest source of Darija sentiment on the web. This is an
              experimental lab page; the scraper is not yet wired into
              the console cron.
            </p>
          </header>

          {/* ─── INPUT CARD ─── */}
          <section
            style={{
              background: T.bg,
              border: `1px solid ${T.border}`,
              borderRadius: "16px",
              padding: "28px",
              boxShadow: T.shadowSm,
              marginBottom: "32px",
            }}
          >
            <label
              htmlFor="hespress-url"
              style={{
                display: "block",
                fontFamily: T.fontMono,
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.05em",
                color: T.accent,
                marginBottom: "8px",
              }}
            >
              ARTICLE URL OR ID
            </label>
            <input
              id="hespress-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://hespress.com/articles/1372457.html"
              style={{
                width: "100%",
                padding: "12px 16px",
                fontSize: "14px",
                fontFamily: T.fontMono,
                color: T.text,
                background: T.bgSubtle,
                border: `1px solid ${T.border}`,
                borderRadius: "8px",
                outline: "none",
                transition: "border 0.15s",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = T.accent)}
              onBlur={(e) => (e.currentTarget.style.borderColor = T.border)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && url && !loading) run();
              }}
            />

            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                marginTop: "12px",
                alignItems: "center",
              }}
            >
              <button
                onClick={() => setUrl(SAMPLE_URL)}
                style={{
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontFamily: T.fontMono,
                  color: T.textSec,
                  background: T.bgSubtle,
                  border: `1px solid ${T.border}`,
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                ↳ Sample article
              </button>
              <button
                onClick={() => setUrl(SECONDARY_SAMPLE_URL)}
                style={{
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontFamily: T.fontMono,
                  color: T.textSec,
                  background: T.bgSubtle,
                  border: `1px solid ${T.border}`,
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                ↳ Sample (sport)
              </button>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  fontFamily: T.fontMono,
                  color: T.textSec,
                  cursor: "pointer",
                  marginLeft: "auto",
                }}
              >
                <input
                  type="checkbox"
                  checked={forceMock}
                  onChange={(e) => setForceMock(e.target.checked)}
                  style={{ cursor: "pointer" }}
                />
                Force sample data
              </label>
            </div>

            <button
              onClick={run}
              disabled={!url || loading}
              style={{
                marginTop: "20px",
                padding: "12px 24px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#fff",
                background: url && !loading ? T.cta : T.accentBright,
                border: "none",
                borderRadius: "8px",
                cursor: url && !loading ? "pointer" : "not-allowed",
                transition: "background 0.15s",
                width: "100%",
              }}
            >
              {loading ? "Scraping comments…" : "Scrape comments →"}
            </button>

            {error && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px 16px",
                  fontSize: "13px",
                  color: T.danger,
                  background: T.dangerBg,
                  border: `1px solid #fecaca`,
                  borderRadius: "8px",
                  fontFamily: T.fontMono,
                }}
              >
                ⚠ {error}
              </div>
            )}
          </section>

          {/* ─── RESULTS ─── */}
          {result && (
            <>
              <ResultHeader result={result} />
              {stats && <SummaryStats stats={stats} result={result} />}
              {stats && stats.top3Liked.length > 0 && (
                <TopComments
                  title="Top 3 most-liked comments"
                  comments={stats.top3Liked}
                  accent={T.accent}
                />
              )}
              {stats && stats.top3Negative.length > 0 && (
                <TopComments
                  title="Top 3 most-negative comments"
                  comments={stats.top3Negative}
                  accent={T.danger}
                />
              )}
              <CommentsTable comments={result.comments} />
            </>
          )}

          {/* ─── EMPTY STATE ─── */}
          {!result && !loading && !error && (
            <div
              style={{
                background: T.bg,
                border: `1px dashed ${T.border}`,
                borderRadius: "16px",
                padding: "64px 32px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>💬</div>
              <p
                style={{
                  fontSize: "15px",
                  color: T.textMuted,
                  maxWidth: "480px",
                  margin: "0 auto",
                  lineHeight: 1.6,
                }}
              >
                Paste a Hespress article URL above, then click
                &quot;Scrape comments&quot;. The scraper will fetch the
                comments via the WordPress REST API, run each one
                through the Darija sentiment + sarcasm detector, and
                display the results below.
              </p>
              <button
                onClick={() => {
                  setUrl(SAMPLE_URL);
                }}
                style={{
                  marginTop: "20px",
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontFamily: T.fontMono,
                  color: T.accent,
                  background: "rgba(120,113,108,0.08)",
                  border: `1px solid ${T.border}`,
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Try a sample article
              </button>
            </div>
          )}
        </div>
      </main>
      <AtelierFooter />
      <BackToTop />
    </>
  );
}

// ─── RESULT HEADER ──────────────────────────────────────────────

function ResultHeader({ result }: { result: ScrapeResult }) {
  const meta = SOURCE_META[result.source];
  return (
    <section
      style={{
        background: T.bg,
        border: `1px solid ${T.border}`,
        borderRadius: "16px",
        padding: "24px",
        boxShadow: T.shadowSm,
        marginBottom: "24px",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: "12px",
        }}
      >
        <span
          style={{
            fontFamily: T.fontMono,
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.05em",
            padding: "4px 10px",
            borderRadius: "6px",
            background: meta.bg,
            color: meta.fg,
            border: `1px solid ${meta.border}`,
          }}
        >
          {meta.label}
        </span>
        <span
          style={{
            fontFamily: T.fontMono,
            fontSize: "12px",
            color: T.textMuted,
          }}
        >
          Article ID: {result.articleId || "—"} · {result.commentsScraped} comments ·{" "}
          {fmtDuration(result.durationMs)}
        </span>
      </div>
      <div
        style={{
          fontSize: "13px",
          fontFamily: T.fontMono,
          color: T.textSec,
          wordBreak: "break-all",
          marginBottom: result.warning ? "12px" : 0,
        }}
      >
        {result.articleUrl}
      </div>
      {result.warning && (
        <div
          style={{
            marginTop: "12px",
            padding: "10px 14px",
            fontSize: "12px",
            color: result.source === "mock" ? T.warningText : T.textSec,
            background: result.source === "mock" ? T.warningBg : T.bgSubtle,
            border: `1px solid ${
              result.source === "mock" ? T.warningBorder : T.border
            }`,
            borderRadius: "6px",
            fontFamily: T.fontMono,
            lineHeight: 1.5,
          }}
        >
          ⚠ {result.warning}
        </div>
      )}
      <p
        style={{
          fontSize: "13px",
          color: T.textMuted,
          marginTop: "12px",
          lineHeight: 1.5,
          marginBottom: 0,
        }}
      >
        {meta.desc}
      </p>
    </section>
  );
}

// ─── SUMMARY STATS ─────────────────────────────────────────────

function SummaryStats({
  stats,
  result,
}: {
  stats: NonNullable<ReturnType<typeof useMemo<unknown>>>;
  result: ScrapeResult;
}) {
  const s = stats as {
    total: number;
    byPolarity: Record<SentimentPolarity, number>;
    byLanguage: Record<CommentLanguage, number>;
    sarcasmCount: number;
    avgScore: number;
  };
  void result;
  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
        gap: "16px",
        marginBottom: "24px",
      }}
    >
      {/* Sentiment breakdown */}
      <StatCard title="Sentiment breakdown">
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {(["positive", "neutral", "negative"] as SentimentPolarity[]).map((p) => {
            const count = s.byPolarity[p];
            const pct = s.total > 0 ? count / s.total : 0;
            const meta = POLARITY_META[p];
            return (
              <div key={p} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    width: "80px",
                    fontSize: "12px",
                    fontFamily: T.fontMono,
                    fontWeight: 700,
                    color: meta.fg,
                  }}
                >
                  {meta.label}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: "8px",
                    background: T.bgHover,
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${pct * 100}%`,
                      height: "100%",
                      background: meta.fg,
                      transition: "width 0.4s",
                    }}
                  />
                </div>
                <span
                  style={{
                    width: "70px",
                    fontSize: "12px",
                    fontFamily: T.fontMono,
                    color: T.textSec,
                    textAlign: "right",
                  }}
                >
                  {count} · {fmtPct(pct)}
                </span>
              </div>
            );
          })}
          <div
            style={{
              marginTop: "8px",
              paddingTop: "8px",
              borderTop: `1px solid ${T.border}`,
              fontSize: "12px",
              fontFamily: T.fontMono,
              color: T.textMuted,
            }}
          >
            Avg score:{" "}
            <span
              style={{
                color:
                  s.avgScore > 0.15
                    ? T.success
                    : s.avgScore < -0.15
                      ? T.danger
                      : T.textSec,
                fontWeight: 700,
              }}
            >
              {s.avgScore.toFixed(3)}
            </span>{" "}
            · Sarcasm detected:{" "}
            <span style={{ fontWeight: 700, color: s.sarcasmCount > 0 ? T.danger : T.textMuted }}>
              {s.sarcasmCount}
            </span>
          </div>
        </div>
      </StatCard>

      {/* Language breakdown */}
      <StatCard title="Language mix">
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {(["darija", "arabic", "french", "mixed"] as CommentLanguage[]).map((l) => {
            const count = s.byLanguage[l];
            const pct = s.total > 0 ? count / s.total : 0;
            const meta = LANG_META[l];
            return (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    width: "80px",
                    fontSize: "12px",
                    fontFamily: T.fontMono,
                    fontWeight: 700,
                    color: meta.fg,
                  }}
                >
                  {meta.label}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: "8px",
                    background: T.bgHover,
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${pct * 100}%`,
                      height: "100%",
                      background: meta.fg,
                      transition: "width 0.4s",
                    }}
                  />
                </div>
                <span
                  style={{
                    width: "70px",
                    fontSize: "12px",
                    fontFamily: T.fontMono,
                    color: T.textSec,
                    textAlign: "right",
                  }}
                >
                  {count} · {fmtPct(pct)}
                </span>
              </div>
            );
          })}
          <div
            style={{
              marginTop: "8px",
              paddingTop: "8px",
              borderTop: `1px solid ${T.border}`,
              fontSize: "11px",
              color: T.textMuted,
              lineHeight: 1.5,
            }}
          >
            Darija = Moroccan dialect (Arabizi or Arabic script with
            Darija markers). Arabic = MSA. French = formal FR. Mixed =
            code-switching across 2+ languages.
          </div>
        </div>
      </StatCard>
    </section>
  );
}

function StatCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: T.bg,
        border: `1px solid ${T.border}`,
        borderRadius: "12px",
        padding: "20px",
        boxShadow: T.shadowSm,
      }}
    >
      <div
        style={{
          fontFamily: T.fontMono,
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.05em",
          color: T.accent,
          marginBottom: "14px",
        }}
      >
        {title.toUpperCase()}
      </div>
      {children}
    </div>
  );
}

// ─── TOP COMMENTS CARDS ─────────────────────────────────────────

function TopComments({
  title,
  comments,
  accent,
}: {
  title: string;
  comments: ScrapedComment[];
  accent: string;
}) {
  return (
    <section style={{ marginBottom: "24px" }}>
      <h3
        style={{
          fontSize: "14px",
          fontWeight: 700,
          color: T.text,
          margin: "0 0 12px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span style={{ width: "4px", height: "16px", background: accent, borderRadius: "2px" }} />
        {title}
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
          gap: "12px",
        }}
      >
        {comments.map((c) => (
          <div
            key={c.id}
            style={{
              background: T.bg,
              border: `1px solid ${T.border}`,
              borderRadius: "10px",
              padding: "16px",
              boxShadow: T.shadowSm,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  fontFamily: T.fontMono,
                  color: T.textMuted,
                }}
              >
                {c.author || "anonymous"} · {c.likes} ♥
              </span>
              <Badge
                label={POLARITY_META[c.sentiment.polarity].label}
                bg={POLARITY_META[c.sentiment.polarity].bg}
                fg={POLARITY_META[c.sentiment.polarity].fg}
              />
            </div>
            <p
              style={{
                fontSize: "13px",
                color: T.text,
                margin: "0 0 8px",
                lineHeight: 1.5,
                fontFamily: T.fontMono,
              }}
            >
              {c.content}
            </p>
            <div
              style={{
                display: "flex",
                gap: "6px",
                fontSize: "11px",
                fontFamily: T.fontMono,
                color: T.textMuted,
              }}
            >
              <span>score: {c.sentiment.score.toFixed(2)}</span>
              <span>·</span>
              <span>lang: {c.language}</span>
              {c.sentiment.sarcasmDetected && (
                <>
                  <span>·</span>
                  <span style={{ color: T.danger, fontWeight: 700 }}>sarcasm</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── COMMENTS TABLE ─────────────────────────────────────────────

function CommentsTable({ comments }: { comments: ScrapedComment[] }) {
  return (
    <section
      style={{
        background: T.bg,
        border: `1px solid ${T.border}`,
        borderRadius: "16px",
        boxShadow: T.shadowSm,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px 24px",
          borderBottom: `1px solid ${T.border}`,
          background: T.bgSubtle,
        }}
      >
        <h3
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: T.text,
            margin: 0,
          }}
        >
          All comments ({comments.length})
        </h3>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "13px",
          }}
        >
          <thead>
            <tr
              style={{
                background: T.bgSubtle,
                fontFamily: T.fontMono,
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.04em",
                color: T.textMuted,
                textAlign: "left",
              }}
            >
              <th style={{ padding: "10px 16px", borderBottom: `1px solid ${T.border}` }}>AUTHOR</th>
              <th style={{ padding: "10px 16px", borderBottom: `1px solid ${T.border}` }}>CONTENT</th>
              <th style={{ padding: "10px 16px", borderBottom: `1px solid ${T.border}` }}>LANG</th>
              <th style={{ padding: "10px 16px", borderBottom: `1px solid ${T.border}` }}>SENTIMENT</th>
              <th style={{ padding: "10px 16px", borderBottom: `1px solid ${T.border}` }}>SARCASM</th>
              <th style={{ padding: "10px 16px", borderBottom: `1px solid ${T.border}`, textAlign: "right" }}>LIKES</th>
              <th style={{ padding: "10px 16px", borderBottom: `1px solid ${T.border}` }}>DATE</th>
            </tr>
          </thead>
          <tbody>
            {comments.map((c) => {
              const langMeta = LANG_META[c.language];
              const polMeta = POLARITY_META[c.sentiment.polarity];
              return (
                <tr
                  key={c.id}
                  style={{ borderBottom: `1px solid ${T.border}` }}
                >
                  <td
                    style={{
                      padding: "10px 16px",
                      fontFamily: T.fontMono,
                      fontSize: "12px",
                      color: T.textSec,
                      verticalAlign: "top",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c.author || "—"}
                  </td>
                  <td
                    style={{
                      padding: "10px 16px",
                      color: T.text,
                      maxWidth: "420px",
                      lineHeight: 1.5,
                      fontFamily: T.fontMono,
                      fontSize: "12px",
                    }}
                  >
                    {truncate(c.content, 200)}
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    <Badge label={langMeta.label} bg={langMeta.bg} fg={langMeta.fg} />
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <Badge label={polMeta.label} bg={polMeta.bg} fg={polMeta.fg} />
                      <span
                        style={{
                          fontFamily: T.fontMono,
                          fontSize: "11px",
                          color: T.textMuted,
                        }}
                      >
                        {c.sentiment.score.toFixed(2)}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    {c.sentiment.sarcasmDetected ? (
                      <span
                        style={{
                          fontFamily: T.fontMono,
                          fontSize: "11px",
                          fontWeight: 700,
                          color: T.danger,
                          background: T.dangerBg,
                          padding: "2px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        YES
                      </span>
                    ) : (
                      <span
                        style={{
                          fontFamily: T.fontMono,
                          fontSize: "11px",
                          color: T.textMuted,
                        }}
                      >
                        —
                      </span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: "10px 16px",
                      textAlign: "right",
                      fontFamily: T.fontMono,
                      fontSize: "12px",
                      color: c.likes > 0 ? T.text : T.textMuted,
                      fontWeight: c.likes > 0 ? 700 : 400,
                    }}
                  >
                    {c.likes > 0 ? `♥ ${c.likes}` : "—"}
                  </td>
                  <td
                    style={{
                      padding: "10px 16px",
                      fontFamily: T.fontMono,
                      fontSize: "11px",
                      color: T.textMuted,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {fmtDate(c.publishedAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Badge({ label, bg, fg }: { label: string; bg: string; fg: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: "4px",
        fontFamily: T.fontMono,
        fontSize: "11px",
        fontWeight: 700,
        background: bg,
        color: fg,
      }}
    >
      {label}
    </span>
  );
}
