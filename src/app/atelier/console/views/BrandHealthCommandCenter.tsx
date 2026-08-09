"use client";

import { useState, useEffect, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
//  BRAND HEALTH COMMAND CENTER
//
//  Synthesizes the best UI patterns from:
//    • Meltwater Unified Dashboards — all metrics in one view
//    • Brandwatch Vizia — command center aesthetic, big bold real-time
//    • Dataminr Pulse — earliest warning, crisis level indicator
//    • Signal AI — decision augmentation, contextual recommendations
//    • PeakMetrics — narrative detection, emerging themes
//
//  This is the hero widget — what the Dircom sees first.
//  75% of the product value is frontend. Every pixel matters.
// ═══════════════════════════════════════════════════════════════

const C = {
  bg: "#FAFAFA",
  surface: "#FFFFFF",
  surfaceAlt: "#F4F4F5",
  border: "#E5E5E5",
  borderLight: "#F0F0F0",
  text: "#0A0A0A",
  textSec: "#525252",
  textMuted: "#71717A",
  textFaint: "#A1A1AA",
  accent: "#78716c",
  cta: "#10b981",
  warning: "#f59e0b",
  warningBg: "#fffbeb",
  warningBorder: "#fcd34d",
  warningText: "#b45309",
  danger: "#ef4444",
  dangerBg: "#fef2f2",
  dangerBorder: "#fecaca",
  dangerText: "#991b1b",
  success: "#10b981",
  successBg: "#ecfdf5",
  info: "#3b82f6",
  infoBg: "#eff6ff",
  fontSans: "'Inter', system-ui, sans-serif",
  fontMono: "'Space Mono', monospace",
  shadowSm: "0 1px 3px rgba(0,0,0,0.04)",
  shadowMd: "0 4px 12px rgba(0,0,0,0.06)",
  shadowLg: "0 8px 24px rgba(0,0,0,0.08)",
};

interface BrandHealthData {
  score: number;
  trend: number;
  sentiment: { positive: number; neutral: number; negative: number };
  shareOfVoice: number;
  competitiveRank: number;
  totalCompetitors: number;
  mentionCount24h: number;
  mentionVelocity: number;
  crisisLevel: "safe" | "watch" | "warning" | "critical";
  crisisScore: number;
  topNarrative: { label: string; momentum: "rising" | "falling" | "stable"; sentiment: number };
  aiVisibility: { engine: string; score: number }[];
  recommendation: string;
  lastUpdated: string;
}

// Demo data (cascade scenario — the 2018 boycott pattern)
const DEMO_DATA: BrandHealthData = {
  score: 74,
  trend: -3,
  sentiment: { positive: 42, neutral: 28, negative: 30 },
  shareOfVoice: 34,
  competitiveRank: 2,
  totalCompetitors: 5,
  mentionCount24h: 1247,
  mentionVelocity: 18.4,
  crisisLevel: "warning",
  crisisScore: 52,
  topNarrative: { label: "Frais bancaires excessifs", momentum: "rising", sentiment: -0.58 },
  aiVisibility: [
    { engine: "ChatGPT", score: 72 },
    { engine: "Claude", score: 68 },
    { engine: "Gemini", score: 64 },
    { engine: "Perplexity", score: 71 },
  ],
  recommendation:
    "Le narrative 'Frais bancaires excessifs' gagne du momentum en Darija (+28% en 24h). Surveiller la vélocité MSA/Français. Préparer un message de clarification dans les 2h.",
  lastUpdated: new Date().toISOString(),
};

// ─── Payload normalizer ────────────────────────────────────────
// The /api/console/brand-health route may return a partial payload
// (e.g. when the company has no recent articles, or the engine is
// warming up). This function guarantees every field the render reads
// is present with a sane default, so we never throw at render time.
function normalizeBrandHealth(json: unknown): BrandHealthData {
  const obj = (json ?? {}) as Partial<BrandHealthData>;
  const sentiment = (obj.sentiment ?? {}) as Partial<BrandHealthData["sentiment"]>;
  const topNarrative = (obj.topNarrative ?? {}) as Partial<BrandHealthData["topNarrative"]>;
  const aiVisibilityRaw = Array.isArray(obj.aiVisibility) ? obj.aiVisibility : [];
  const crisisLevel = ((): BrandHealthData["crisisLevel"] => {
    const lvl = obj.crisisLevel;
    return lvl === "safe" || lvl === "watch" || lvl === "warning" || lvl === "critical"
      ? lvl
      : "safe";
  })();
  const num = (v: unknown, fallback = 0): number =>
    typeof v === "number" && Number.isFinite(v) ? v : fallback;

  return {
    score: num(obj.score, 0),
    trend: num(obj.trend, 0),
    sentiment: {
      positive: num(sentiment.positive, 0),
      neutral: num(sentiment.neutral, 0),
      negative: num(sentiment.negative, 0),
    },
    shareOfVoice: num(obj.shareOfVoice, 0),
    competitiveRank: num(obj.competitiveRank, 0),
    totalCompetitors: num(obj.totalCompetitors, 0),
    mentionCount24h: num(obj.mentionCount24h, 0),
    mentionVelocity: num(obj.mentionVelocity, 0),
    crisisLevel,
    crisisScore: num(obj.crisisScore, 0),
    topNarrative: {
      label: typeof topNarrative.label === "string" ? topNarrative.label : "—",
      momentum:
        topNarrative.momentum === "rising" ||
        topNarrative.momentum === "falling" ||
        topNarrative.momentum === "stable"
          ? topNarrative.momentum
          : "stable",
      sentiment: num(topNarrative.sentiment, 0),
    },
    aiVisibility: aiVisibilityRaw
      .filter(
        (a): a is { engine: string; score: number } =>
          !!a && typeof (a as { engine?: unknown }).engine === "string",
      )
      .map((a) => ({ engine: a.engine, score: num(a.score, 0) })),
    recommendation:
      typeof obj.recommendation === "string" && obj.recommendation.length > 0
        ? obj.recommendation
        : "No recommendation available for this period.",
    lastUpdated:
      typeof obj.lastUpdated === "string" && obj.lastUpdated.length > 0
        ? obj.lastUpdated
        : new Date().toISOString(),
  };
}

const CRISIS_META = {
  safe: { label: "SAFE", color: C.success, bg: C.successBg, border: "#a7f3d0", icon: "✓", pulse: false },
  watch: { label: "WATCH", color: C.warningText, bg: C.warningBg, border: C.warningBorder, icon: "△", pulse: false },
  warning: { label: "WARNING", color: C.warningText, bg: C.warningBg, border: C.warningBorder, icon: "⚠", pulse: true },
  critical: { label: "CRITICAL", color: C.dangerText, bg: C.dangerBg, border: C.dangerBorder, icon: "✕", pulse: true },
};

export function BrandHealthCommandCenter({ apiEndpoint = "/api/console/brand-health" }: { apiEndpoint?: string }) {
  const [data, setData] = useState<BrandHealthData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiEndpoint);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // Normalize defensively — never trust the API payload shape at
      // render time. A partial/empty response is upgraded to a fully-
      // typed BrandHealthData with zero-valued fields.
      setData(normalizeBrandHealth(json));
    } catch {
      setData(DEMO_DATA);
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading || !data) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ height: "180px", background: C.surfaceAlt, borderRadius: "12px", animation: "pulse 1.5s infinite" }} />
        <div style={{ height: "120px", background: C.surfaceAlt, borderRadius: "12px", animation: "pulse 1.5s infinite" }} />
      </div>
    );
  }

  const crisis = CRISIS_META[data.crisisLevel] || CRISIS_META.safe;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes pulseRing {
          0% { box-shadow: 0 0 0 0 ${crisis.color}40; }
          70% { box-shadow: 0 0 0 12px ${crisis.color}00; }
          100% { box-shadow: 0 0 0 0 ${crisis.color}00; }
        }
        @keyframes countUp { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes drawLine { from { stroke-dashoffset: 200; } to { stroke-dashoffset: 0; } }
      `}</style>

      {/* ─── ROW 1: THE COMMAND BAR ───
          Meltwater-style unified view: score + crisis + trend + velocity in one strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr auto auto auto",
          gap: "20px",
          alignItems: "center",
          padding: "24px 28px",
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: "14px",
          boxShadow: C.shadowMd,
        }}
      >
        {/* Big score — Vizia-style bold metric */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
          <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Brand Score
          </div>
          <div
            style={{
              fontSize: "48px",
              fontWeight: 700,
              color: data.score >= 75 ? C.success : data.score >= 50 ? C.text : C.dangerText,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              animation: "countUp 0.6s ease-out",
            }}
          >
            {data.score}
          </div>
          <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textFaint }}>/ 100</div>
        </div>

        {/* Crisis indicator — Dataminr-style earliest warning */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            padding: "12px 16px",
            background: crisis.bg,
            border: `1px solid ${crisis.border}`,
            borderRadius: "10px",
            position: "relative",
          }}
        >
          {crisis.pulse && (
            <div
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: crisis.color,
                animation: "pulseRing 1.5s infinite",
              }}
            />
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "14px", fontWeight: 700, color: crisis.color }}>{crisis.icon}</span>
            <span style={{ fontFamily: C.fontMono, fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: crisis.color, textTransform: "uppercase" }}>
              {crisis.label}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span style={{ fontSize: "24px", fontWeight: 700, color: crisis.color, lineHeight: 1 }}>{data.crisisScore}</span>
            <span style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted }}>/ 100 crisis</span>
          </div>
          <div style={{ fontSize: "11px", color: C.textSec, lineHeight: 1.4 }}>
            {data.crisisLevel === "critical" && "Cascade détectée — action immédiate"}
            {data.crisisLevel === "warning" && "Vélocité anormale — fenêtre 2-4h"}
            {data.crisisLevel === "watch" && "Signal à surveiller"}
            {data.crisisLevel === "safe" && "Nominal"}
          </div>
        </div>

        {/* Trend — Signal AI-style decision augmentation */}
        <Metric label="Trend 7j" value={`${data.trend > 0 ? "+" : ""}${data.trend}`} unit="pts" color={data.trend >= 0 ? C.success : C.danger} />

        {/* Mentions 24h */}
        <Metric label="Mentions 24h" value={data.mentionCount24h.toLocaleString()} unit="" color={C.text} />

        {/* Velocity */}
        <Metric label="Velocity" value={data.mentionVelocity.toFixed(1)} unit="/h" color={data.mentionVelocity > 15 ? C.dangerText : C.text} />
      </div>

      {/* ─── ROW 2: THREE-COLUMN INTELLIGENCE ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
        {/* Sentiment breakdown — Talkwalker-style */}
        <Panel title="Sentiment Distribution" subtitle="24h · all languages">
          <SentimentBar positive={data.sentiment.positive} neutral={data.sentiment.neutral} negative={data.sentiment.negative} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px" }}>
            <SentimentLeg label="Positive" pct={data.sentiment.positive} color={C.success} />
            <SentimentLeg label="Neutral" pct={data.sentiment.neutral} color={C.textMuted} />
            <SentimentLeg label="Negative" pct={data.sentiment.negative} color={C.danger} />
          </div>
        </Panel>

        {/* Share of Voice — Meltwater competitive position */}
        <Panel title="Share of Voice" subtitle={`Rank #${data.competitiveRank} of ${data.totalCompetitors}`}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div style={{ fontSize: "32px", fontWeight: 700, color: C.text, letterSpacing: "-0.02em" }}>{data.shareOfVoice}%</div>
            <div style={{ flex: 1 }}>
              <div style={{ height: "8px", background: C.surfaceAlt, borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${data.shareOfVoice}%`, background: `linear-gradient(90deg, ${C.accent}, ${C.cta})`, borderRadius: "4px", transition: "width 1s ease-out" }} />
              </div>
            </div>
          </div>
          <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: C.fontMono }}>
            vs {data.totalCompetitors - 1} competitors tracked
          </div>
        </Panel>

        {/* Top Narrative — PeakMetrics-style emerging theme */}
        <Panel title="Top Emerging Narrative" subtitle="PeakMetrics detection">
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ fontSize: "15px", fontWeight: 600, color: C.text, lineHeight: 1.3 }}>{data.topNarrative.label}</div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <MomentumBadge momentum={data.topNarrative.momentum} />
              <span style={{ fontFamily: C.fontMono, fontSize: "12px", color: data.topNarrative.sentiment < -0.2 ? C.dangerText : data.topNarrative.sentiment > 0.2 ? C.success : C.textMuted }}>
                {data.topNarrative.sentiment > 0 ? "+" : ""}{data.topNarrative.sentiment.toFixed(2)}
              </span>
            </div>
            <div style={{ fontSize: "11px", color: C.textSec, lineHeight: 1.5, marginTop: "4px" }}>
              {data.topNarrative.momentum === "rising" && "↑ Momentum croissant — surveiller la cascade"}
              {data.topNarrative.momentum === "falling" && "↓ Momentum décroissant — risque s'atténue"}
              {data.topNarrative.momentum === "stable" && "→ Momentum stable"}
            </div>
          </div>
        </Panel>
      </div>

      {/* ─── ROW 3: AI VISIBILITY + RECOMMENDATION ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* AI Visibility — unique to Harch */}
        <Panel title="AI Engine Visibility" subtitle="What LLMs say about you">
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {data.aiVisibility.map((ai, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "80px 1fr 40px", gap: "10px", alignItems: "center" }}>
                <span style={{ fontFamily: C.fontMono, fontSize: "12px", color: C.textSec }}>{ai.engine}</span>
                <div style={{ height: "6px", background: C.surfaceAlt, borderRadius: "3px", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${ai.score}%`,
                      background: ai.score >= 70 ? C.success : ai.score >= 50 ? C.warning : C.danger,
                      borderRadius: "3px",
                      transition: "width 1s ease-out",
                      animationDelay: `${i * 100}ms`,
                    }}
                  />
                </div>
                <span style={{ fontFamily: C.fontMono, fontSize: "12px", fontWeight: 700, color: C.text, textAlign: "right" }}>{ai.score}</span>
              </div>
            ))}
          </div>
        </Panel>

        {/* Recommendation — Signal AI-style decision augmentation */}
        <Panel title="HarchIQ Recommendation" subtitle="Decision augmentation" accent>
          <div
            style={{
              padding: "14px",
              background: crisis.bg,
              border: `1px solid ${crisis.border}`,
              borderRadius: "8px",
              display: "flex",
              gap: "10px",
              alignItems: "flex-start",
            }}
          >
            <span style={{ fontSize: "16px", color: crisis.color, flexShrink: 0 }}>{crisis.icon}</span>
            <p style={{ margin: 0, fontSize: "13px", color: C.text, lineHeight: 1.6, fontWeight: 500 }}>{data.recommendation}</p>
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <button style={{ padding: "8px 14px", background: C.cta, color: "#fff", border: "none", borderRadius: "6px", fontFamily: C.fontSans, fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
              Generate crisis brief →
            </button>
            <button style={{ padding: "8px 14px", background: C.surface, color: C.text, border: `1px solid ${C.border}`, borderRadius: "6px", fontFamily: C.fontSans, fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
              View deep dive
            </button>
          </div>
        </Panel>
      </div>

      {/* ─── FOOTER: last updated ─── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 4px" }}>
        <span style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textFaint, letterSpacing: "0.05em" }}>
          Last updated: {new Date(data.lastUpdated).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </span>
        <span style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textFaint, letterSpacing: "0.05em" }}>
          Harch IQ · Brand Health Command Center
        </span>
      </div>
    </div>
  );
}

// ─── Building blocks ───────────────────────────────────────────

function Metric({ label, value, unit, color }: { label: string; value: string; unit: string; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px", textAlign: "right" }}>
      <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "2px", justifyContent: "flex-end" }}>
        <span style={{ fontSize: "24px", fontWeight: 700, color, lineHeight: 1, letterSpacing: "-0.02em" }}>{value}</span>
        {unit && <span style={{ fontFamily: C.fontMono, fontSize: "11px", color: C.textMuted }}>{unit}</span>}
      </div>
    </div>
  );
}

function Panel({ title, subtitle, children, accent }: { title: string; subtitle?: string; children: React.ReactNode; accent?: boolean }) {
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "12px",
        padding: "18px",
        boxShadow: C.shadowSm,
        borderTop: accent ? `3px solid ${C.cta}` : undefined,
      }}
    >
      <div style={{ marginBottom: "14px" }}>
        <div style={{ fontFamily: C.fontMono, fontSize: "11px", fontWeight: 700, color: C.text, letterSpacing: "0.05em", textTransform: "uppercase" }}>{title}</div>
        {subtitle && <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, marginTop: "2px" }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

function SentimentBar({ positive, neutral, negative }: { positive: number; neutral: number; negative: number }) {
  return (
    <div style={{ display: "flex", height: "32px", borderRadius: "6px", overflow: "hidden", gap: "2px" }}>
      <div style={{ width: `${positive}%`, background: C.success, transition: "width 1s ease-out" }} />
      <div style={{ width: `${neutral}%`, background: C.textMuted, opacity: 0.4, transition: "width 1s ease-out" }} />
      <div style={{ width: `${negative}%`, background: C.danger, transition: "width 1s ease-out" }} />
    </div>
  );
}

function SentimentLeg({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: color }} />
      <span style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textSec }}>{label}</span>
      <span style={{ fontFamily: C.fontMono, fontSize: "10px", fontWeight: 700, color: C.text }}>{pct}%</span>
    </div>
  );
}

function MomentumBadge({ momentum }: { momentum: "rising" | "falling" | "stable" }) {
  const meta = {
    rising: { icon: "↑", color: C.danger, bg: C.dangerBg },
    falling: { icon: "↓", color: C.success, bg: C.successBg },
    stable: { icon: "→", color: C.textMuted, bg: C.surfaceAlt },
  };
  const m = meta[momentum];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "3px",
        padding: "2px 6px",
        borderRadius: "4px",
        background: m.bg,
        color: m.color,
        fontFamily: C.fontMono,
        fontSize: "10px",
        fontWeight: 700,
      }}
    >
      {m.icon} {momentum}
    </span>
  );
}
