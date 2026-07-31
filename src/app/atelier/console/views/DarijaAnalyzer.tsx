"use client";

import { type CSSProperties, useCallback, useState } from "react";
import { C } from "../../components/tokens";
import { SkeletonLoader, ErrorState } from "./SkeletonLoader";

// ═══════════════════════════════════════════════════════════════
//  DarijaAnalyzer.tsx — Real Darija NLP panel
//
//  Lets the user paste any Darija/Arabic/French/English text and
//  runs the three-stage HarchIQ Darija pipeline on it:
//    1. Language detection (darija | arabic | french | english | mixed)
//    2. Sentiment analysis (lexicon-based, score -1..+1)
//    3. Entity extraction (people, organizations, locations)
//
//  Calls POST /api/console/darija-analyze with the trimmed text.
//  Light theme. English labels. C tokens only. No emojis.
//
//  Task ID: darija-nlp
// ═══════════════════════════════════════════════════════════════

const FONT = { sans: C.fontSans, mono: C.fontMono };
const ACCENT = "#059669"; // emerald-600 (Brand Monitor accent)
const ACCENT_BG = "rgba(5,150,105,0.08)";
const COL_POS = C.success;
const COL_NEG = C.danger;
const COL_NEU = C.textMuted;

// ─── Types mirroring the API response ───────────────────────────

type LanguageLabel = "darija" | "arabic" | "french" | "english" | "mixed";

interface LanguageDetection {
  language: LanguageLabel;
  confidence: number;
  markers: string[];
}

interface SentimentResult {
  score: number;
  label: "positive" | "negative" | "neutral";
  confidence: number;
  positiveHits: string[];
  negativeHits: string[];
}

interface EntityResult {
  people: string[];
  organizations: string[];
  locations: string[];
}

interface DarijaAnalysis {
  text: string;
  language: LanguageDetection;
  sentiment: SentimentResult;
  entities: EntityResult;
  analyzedAt: string;
}

// ─── Sample texts (from the task spec) ──────────────────────────

const SAMPLE_TEXTS: { label: string; text: string }[] = [
  {
    label: "Banque Populaire complaint (Darija)",
    text: "البنك الشعبي كاين عندو مشكل كبير فالخدمة، الزبناء مضايقين بزاف",
  },
  {
    label: "OCP results (Darija)",
    text: "شركة OCP عطات نتائف مزيانة هاد العام، الأسهم طالعو",
  },
  {
    label: "Attijariwafa launch (mixed)",
    text: "Attijariwafa Bank launched a new digital service today —很不错",
  },
];

// ─── Shared inline styles (mirror NarrativePanel) ──────────────

const widgetCardStyle: CSSProperties = {
  border: `1px solid ${C.border}`,
  borderRadius: "4px",
  padding: "16px",
  background: C.bg,
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
};

const labelStyle: CSSProperties = {
  fontSize: "10px",
  fontFamily: FONT.mono,
  color: C.textMuted,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  fontWeight: 600,
};

const titleLabelStyle: CSSProperties = {
  ...labelStyle,
  marginBottom: "12px",
};

const chipStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
  padding: "3px 8px",
  borderRadius: "3px",
  background: ACCENT_BG,
  color: ACCENT,
  fontSize: "11px",
  fontFamily: FONT.mono,
  border: `1px solid ${ACCENT}30`,
  whiteSpace: "nowrap",
};

// ─── Helpers ────────────────────────────────────────────────────

function languageColor(lang: LanguageLabel): string {
  switch (lang) {
    case "darija":  return ACCENT;
    case "arabic":  return "#d97706"; // amber-600
    case "french":  return "#7c3aed"; // violet-600
    case "english": return "#0891b2"; // cyan-600
    case "mixed":   return "#be185d"; // pink-700
    default:        return C.textMuted;
  }
}

function sentimentColor(label: "positive" | "negative" | "neutral"): string {
  if (label === "positive") return COL_POS;
  if (label === "negative") return COL_NEG;
  return COL_NEU;
}

function confidenceColor(c: number): string {
  if (c >= 0.75) return COL_POS;
  if (c >= 0.45) return C.warning;
  return COL_NEG;
}

// Format a marker name for display: "darija:كاين" → "Darija marker: كاين"
function formatMarker(marker: string): { label: string; value: string } {
  const idx = marker.indexOf(":");
  if (idx === -1) return { label: "signal", value: marker };
  const prefix = marker.slice(0, idx);
  const value = marker.slice(idx + 1);
  const labelMap: Record<string, string> = {
    "darija": "Darija word",
    "darija-arabizi": "Arabizi",
    "french-borrow": "French loan",
    "french-stop": "French stop",
    "english-stop": "English stop",
    "arabic-script": "Arabic script",
    "cjk-script": "CJK script",
    "empty-input": "Empty",
    "no-signals": "No signals",
  };
  return { label: labelMap[prefix] ?? prefix, value };
}

// ─── Language Card ──────────────────────────────────────────────

function LanguageCard({ detection }: { detection: LanguageDetection }) {
  const color = languageColor(detection.language);
  const pct = Math.round(detection.confidence * 100);

  return (
    <div style={widgetCardStyle}>
      <div style={titleLabelStyle}>Language Detection</div>

      {/* Big language badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "14px",
        }}
      >
        <div
          style={{
            padding: "6px 14px",
            borderRadius: "4px",
            background: `${color}15`,
            color,
            border: `1px solid ${color}40`,
            fontFamily: FONT.mono,
            fontSize: "16px",
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {detection.language}
        </div>
        <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: FONT.mono }}>
          {pct}% confidence
        </div>
      </div>

      {/* Confidence bar */}
      <div
        style={{
          height: "6px",
          background: C.bgHover,
          borderRadius: "3px",
          overflow: "hidden",
          marginBottom: "14px",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: confidenceColor(detection.confidence),
            transition: "width 0.4s ease",
          }}
        />
      </div>

      {/* Markers as chips */}
      <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: FONT.mono, marginBottom: "6px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        Detected markers ({detection.markers.length})
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", maxHeight: "160px", overflowY: "auto" }}>
        {detection.markers.length === 0 ? (
          <span style={{ fontSize: "11px", color: C.textMuted, fontFamily: FONT.mono }}>(none)</span>
        ) : (
          detection.markers.map((m, i) => {
            const { label, value } = formatMarker(m);
            return (
              <span
                key={`${m}-${i}`}
                style={{
                  ...chipStyle,
                  background: C.bgHover,
                  color: C.textBody,
                  borderColor: C.border,
                }}
                title={m}
              >
                <span style={{ color: C.textMuted, fontWeight: 600 }}>{label}</span>
                <span style={{ color: C.text }}>{value}</span>
              </span>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Sentiment Card ─────────────────────────────────────────────

function SentimentCard({ sentiment }: { sentiment: SentimentResult }) {
  const color = sentimentColor(sentiment.label);
  // Map score from [-1, +1] to a [0%, 100%] position on the gauge.
  const pct = ((sentiment.score + 1) / 2) * 100;

  return (
    <div style={widgetCardStyle}>
      <div style={titleLabelStyle}>Sentiment Analysis</div>

      {/* Big label */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "10px",
          marginBottom: "14px",
        }}
      >
        <div
          style={{
            padding: "6px 14px",
            borderRadius: "4px",
            background: `${color}15`,
            color,
            border: `1px solid ${color}40`,
            fontFamily: FONT.mono,
            fontSize: "16px",
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {sentiment.label}
        </div>
        <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: FONT.mono }}>
          score {sentiment.score >= 0 ? "+" : ""}{sentiment.score.toFixed(2)} · {Math.round(sentiment.confidence * 100)}% conf
        </div>
      </div>

      {/* Gauge: -1 ... 0 ... +1 */}
      <div style={{ marginBottom: "14px" }}>
        <div
          style={{
            position: "relative",
            height: "8px",
            background: `linear-gradient(90deg, ${COL_NEG} 0%, ${C.border} 50%, ${COL_POS} 100%)`,
            borderRadius: "4px",
            opacity: 0.35,
          }}
        />
        <div
          style={{
            position: "relative",
            marginTop: "-8px",
            height: "8px",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: `calc(${pct}% - 6px)`,
              top: "-2px",
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: color,
              border: `2px solid ${C.bg}`,
              boxShadow: `0 0 0 1px ${color}`,
              transition: "left 0.4s ease",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "6px",
            fontSize: "9px",
            color: C.textMuted,
            fontFamily: FONT.mono,
          }}
        >
          <span>-1.0</span>
          <span>0.0</span>
          <span>+1.0</span>
        </div>
      </div>

      {/* Positive + negative hit chips */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <div>
          <div style={{ fontSize: "10px", color: COL_POS, fontFamily: FONT.mono, marginBottom: "6px", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>
            Positive hits ({sentiment.positiveHits.length})
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", maxHeight: "100px", overflowY: "auto" }}>
            {sentiment.positiveHits.length === 0 ? (
              <span style={{ fontSize: "11px", color: C.textMuted, fontFamily: FONT.mono }}>(none)</span>
            ) : (
              sentiment.positiveHits.map((h, i) => (
                <span
                  key={`pos-${h}-${i}`}
                  style={{
                    ...chipStyle,
                    background: `${COL_POS}12`,
                    color: COL_POS,
                    borderColor: `${COL_POS}40`,
                  }}
                >
                  {h}
                </span>
              ))
            )}
          </div>
        </div>
        <div>
          <div style={{ fontSize: "10px", color: COL_NEG, fontFamily: FONT.mono, marginBottom: "6px", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>
            Negative hits ({sentiment.negativeHits.length})
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", maxHeight: "100px", overflowY: "auto" }}>
            {sentiment.negativeHits.length === 0 ? (
              <span style={{ fontSize: "11px", color: C.textMuted, fontFamily: FONT.mono }}>(none)</span>
            ) : (
              sentiment.negativeHits.map((h, i) => (
                <span
                  key={`neg-${h}-${i}`}
                  style={{
                    ...chipStyle,
                    background: `${COL_NEG}12`,
                    color: COL_NEG,
                    borderColor: `${COL_NEG}40`,
                  }}
                >
                  {h}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Entities Card ──────────────────────────────────────────────

function EntityColumn({ title, items, accent }: { title: string; items: string[]; accent: string }) {
  return (
    <div>
      <div style={{ fontSize: "10px", color: accent, fontFamily: FONT.mono, marginBottom: "8px", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>
        {title} ({items.length})
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        {items.length === 0 ? (
          <span style={{ fontSize: "11px", color: C.textMuted, fontFamily: FONT.mono }}>(none)</span>
        ) : (
          items.map((item, i) => (
            <span
              key={`ent-${title}-${item}-${i}`}
              style={{
                ...chipStyle,
                background: `${accent}10`,
                color: accent,
                borderColor: `${accent}30`,
                alignSelf: "flex-start",
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={item}
            >
              {item}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

function EntitiesCard({ entities }: { entities: EntityResult }) {
  return (
    <div style={widgetCardStyle}>
      <div style={titleLabelStyle}>Entity Extraction</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
        <EntityColumn title="People" items={entities.people} accent="#7c3aed" />
        <EntityColumn title="Organizations" items={entities.organizations} accent="#d97706" />
        <EntityColumn title="Locations" items={entities.locations} accent="#0891b2" />
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────

export function DarijaAnalyzer() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DarijaAnalysis | null>(null);

  const analyze = useCallback(async () => {
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      setError("Enter some text to analyze.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/console/darija-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as DarijaAnalysis;
      setResult(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [text]);

  const loadSample = useCallback((sample: string) => {
    setText(sample);
    setResult(null);
    setError(null);
  }, []);

  return (
    <div
      style={{
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        fontFamily: FONT.sans,
        color: C.text,
        minHeight: "calc(100vh - 56px)",
      }}
    >
      {/* Header */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "4px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: ACCENT,
              boxShadow: `0 0 0 4px ${ACCENT_BG}`,
            }}
          />
          <h1
            style={{
              fontSize: "20px",
              fontWeight: 700,
              letterSpacing: "-0.01em",
              margin: 0,
              color: C.text,
            }}
          >
            Darija Analyzer
          </h1>
          <span
            style={{
              fontSize: "10px",
              fontFamily: FONT.mono,
              color: ACCENT,
              background: ACCENT_BG,
              padding: "2px 6px",
              borderRadius: "3px",
              border: `1px solid ${ACCENT}30`,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            HarchIQ · Moroccan NLP
          </span>
        </div>
        <p
          style={{
            fontSize: "12px",
            color: C.textBody,
            margin: 0,
            fontFamily: FONT.sans,
          }}
        >
          The differentiating feature — paste any Darija, Arabic, French, English, or mixed text and run the real three-stage HarchIQ pipeline: language detection, sentiment analysis, and entity extraction.
        </p>
      </div>

      {/* Input card */}
      <div style={widgetCardStyle}>
        <div style={titleLabelStyle}>Input Text</div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste Darija/Arabic/French text to analyze..."
          rows={5}
          style={{
            width: "100%",
            padding: "10px 12px",
            border: `1px solid ${C.border}`,
            borderRadius: "4px",
            background: C.bg,
            color: C.text,
            fontFamily: FONT.mono,
            fontSize: "13px",
            lineHeight: 1.5,
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = ACCENT; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = C.border; }}
        />

        {/* Sample text buttons */}
        <div style={{ marginTop: "10px" }}>
          <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: FONT.mono, marginBottom: "6px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Sample texts
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {SAMPLE_TEXTS.map((s, i) => (
              <button
                key={i}
                onClick={() => loadSample(s.text)}
                style={{
                  padding: "5px 10px",
                  border: `1px solid ${C.border}`,
                  borderRadius: "3px",
                  background: C.bg,
                  color: C.textBody,
                  fontSize: "11px",
                  fontFamily: FONT.mono,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = ACCENT;
                  e.currentTarget.style.color = ACCENT;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.color = C.textBody;
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action row */}
        <div
          style={{
            marginTop: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
          }}
        >
          <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: FONT.mono }}>
            {text.trim().length > 0
              ? `${text.trim().length} chars · ready`
              : "Enter or paste text to begin"}
          </div>
          <button
            onClick={analyze}
            disabled={loading || text.trim().length === 0}
            style={{
              padding: "8px 18px",
              borderRadius: "4px",
              border: "none",
              background: loading || text.trim().length === 0 ? C.bgHover : ACCENT,
              color: loading || text.trim().length === 0 ? C.textMuted : C.bg,
              fontSize: "12px",
              fontFamily: FONT.mono,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              cursor: loading || text.trim().length === 0 ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>

        {error && (
          <div
            style={{
              marginTop: "10px",
              padding: "8px 10px",
              border: `1px solid ${C.danger}40`,
              background: C.dangerBg,
              borderRadius: "3px",
              fontSize: "11px",
              fontFamily: FONT.mono,
              color: C.danger,
            }}
          >
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {loading && !result && (
        <div style={widgetCardStyle}>
          <SkeletonLoader accent={ACCENT} lines={4} />
        </div>
      )}

      {result && (
        <>
          {/* Analyzed-at + analyzed-text echo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "10px",
              color: C.textMuted,
              fontFamily: FONT.mono,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: ACCENT,
              }}
            />
            Analyzed at {new Date(result.analyzedAt).toLocaleString()} · {result.text.length} chars
          </div>

          {/* 3-card grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "12px",
            }}
          >
            <LanguageCard detection={result.language} />
            <SentimentCard sentiment={result.sentiment} />
            <EntitiesCard entities={result.entities} />
          </div>

          {/* Echo of analyzed text */}
          <div style={widgetCardStyle}>
            <div style={titleLabelStyle}>Analyzed Text</div>
            <div
              style={{
                padding: "10px 12px",
                background: C.bgHover,
                borderRadius: "3px",
                fontFamily: FONT.mono,
                fontSize: "12px",
                color: C.textBody,
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                unicodeBidi: "plaintext",
              }}
            >
              {result.text}
            </div>
          </div>
        </>
      )}

      {!loading && !result && !error && (
        <div style={widgetCardStyle}>
          <ErrorState
            accent={ACCENT}
            message="Awaiting input. Paste Darija/Arabic/French text above and click Analyze."
          />
        </div>
      )}
    </div>
  );
}
