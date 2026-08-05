"use client";

import { useState, useEffect, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
//  LINGUISTIC MATRIX PANEL — Harch IQ NLP Engine
//
//  The definitive linguistic cartography of the Moroccan digital street.
//  Displays the 35/35/20/10 matrix, the Global Risk Index (GRI),
//  and the cascade detection (Darija → MSA/French = critical).
//
//  This is a premium widget — 75% of the product value is frontend.
//  Every pixel must breathe Corporate/Sovereign grade.
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
  fontSans: "'Inter', system-ui, sans-serif",
  fontMono: "'Space Mono', monospace",
  shadowSm: "0 1px 3px rgba(0,0,0,0.04)",
  shadowMd: "0 4px 12px rgba(0,0,0,0.06)",
};

interface LanguageWeight {
  code: string;
  label: string;
  weight: number;
  pct: number;
  color: string;
}

interface GRIResult {
  score: number;
  level: "safe" | "watch" | "warning" | "critical";
  perLanguage: Array<{
    language: string;
    label: string;
    color: string;
    weight: number;
    weightedRisk: number;
    rawRisk: number;
    mentionCount: number;
    avgSentiment: number;
    velocity: number;
  }>;
  cascade: {
    detected: boolean;
    severity: "none" | "watch" | "warning" | "critical";
    originLanguage: string;
    crossedTo: string[];
    description: string;
    darijaVelocity: number;
    mainstreamVelocity: number;
  };
  recommendation: string;
}

interface MatrixDetail {
  code: string;
  label: string;
  labelFr: string;
  weight: number;
  color: string;
  usage: string;
  nlpTreatment: string;
  sources: string[];
}

interface ApiResponse {
  matrix: LanguageWeight[];
  matrixDetail: MatrixDetail[];
  gri: GRIResult;
  contentApplicability: Record<string, string>;
}

const LEVEL_META: Record<GRIResult["level"], { label: string; color: string; bg: string; border: string; icon: string }> = {
  safe: { label: "SAFE", color: C.success, bg: C.successBg, border: "#a7f3d0", icon: "✓" },
  watch: { label: "WATCH", color: C.warningText, bg: C.warningBg, border: C.warningBorder, icon: "△" },
  warning: { label: "WARNING", color: C.warningText, bg: C.warningBg, border: C.warningBorder, icon: "⚠" },
  critical: { label: "CRITICAL", color: C.dangerText, bg: C.dangerBg, border: C.dangerBorder, icon: "✕" },
};

// ─── Payload normalizer ────────────────────────────────────────
// The linguistic-matrix API may omit `gri` (e.g. cold cache, no
// company scope, NLP engine warming up). Every nested read below
// (`gri.level`, `gri.cascade.detected`, `gri.perLanguage.find`)
// would throw on undefined — this normalizer guarantees a fully-
// typed ApiResponse with safe defaults so the render never crashes.
const SAFE_GRI: GRIResult = {
  score: 0,
  level: "safe",
  perLanguage: [],
  cascade: {
    detected: false,
    severity: "none",
    originLanguage: "",
    crossedTo: [],
    description: "",
    darijaVelocity: 0,
    mainstreamVelocity: 0,
  },
  recommendation: "Linguistic engine warming up — no GRI available yet.",
};

function normalizeGri(gri: unknown): GRIResult {
  if (!gri || typeof gri !== "object") return { ...SAFE_GRI };
  const g = gri as Partial<GRIResult>;
  const num = (v: unknown, fallback = 0): number =>
    typeof v === "number" && Number.isFinite(v) ? v : fallback;
  const level: GRIResult["level"] =
    g.level === "safe" || g.level === "watch" || g.level === "warning" || g.level === "critical"
      ? g.level
      : "safe";
  const cascadeRaw = (g.cascade ?? {}) as Partial<GRIResult["cascade"]>;
  const severity: GRIResult["cascade"]["severity"] =
    cascadeRaw.severity === "none" ||
    cascadeRaw.severity === "watch" ||
    cascadeRaw.severity === "warning" ||
    cascadeRaw.severity === "critical"
      ? cascadeRaw.severity
      : "none";
  const perLanguage = Array.isArray(g.perLanguage) ? g.perLanguage : [];
  const crossedTo = Array.isArray(cascadeRaw.crossedTo)
    ? cascadeRaw.crossedTo.filter((c): c is string => typeof c === "string")
    : [];
  return {
    score: num(g.score, 0),
    level,
    perLanguage,
    cascade: {
      detected: Boolean(cascadeRaw.detected),
      severity,
      originLanguage: typeof cascadeRaw.originLanguage === "string" ? cascadeRaw.originLanguage : "",
      crossedTo,
      description: typeof cascadeRaw.description === "string" ? cascadeRaw.description : "",
      darijaVelocity: num(cascadeRaw.darijaVelocity, 0),
      mainstreamVelocity: num(cascadeRaw.mainstreamVelocity, 0),
    },
    recommendation:
      typeof g.recommendation === "string" && g.recommendation.length > 0
        ? g.recommendation
        : SAFE_GRI.recommendation,
  };
}

function normalizeApiResponse(json: unknown): ApiResponse {
  const obj = (json ?? {}) as Partial<ApiResponse>;
  return {
    matrix: Array.isArray(obj.matrix) ? obj.matrix : [],
    matrixDetail: Array.isArray(obj.matrixDetail) ? obj.matrixDetail : [],
    gri: normalizeGri(obj.gri),
    contentApplicability:
      obj.contentApplicability && typeof obj.contentApplicability === "object"
        ? obj.contentApplicability
        : {},
  };
}

export function LinguisticMatrixPanel({ apiEndpoint = "/api/console/linguistic-matrix" }: { apiEndpoint?: string } = {}) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedLang, setExpandedLang] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiEndpoint);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // Normalize defensively — `gri` and nested cascade/perLanguage
      // may be absent on cold cache or when the NLP engine has no
      // company scope. Prevents render-time TypeError.
      setData(normalizeApiResponse(json));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, apiEndpoint]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ height: "120px", background: C.surfaceAlt, borderRadius: "12px", animation: "pulse 1.5s infinite" }} />
        <div style={{ height: "200px", background: C.surfaceAlt, borderRadius: "12px", animation: "pulse 1.5s infinite" }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: "24px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", textAlign: "center" }}>
        <div style={{ fontFamily: C.fontMono, fontSize: "13px", color: C.dangerText, marginBottom: "12px" }}>
          ✕ Linguistic Matrix unavailable: {error || "no data"}
        </div>
        <button onClick={loadData} style={{ padding: "8px 16px", background: C.cta, color: "#fff", border: "none", borderRadius: "6px", fontFamily: C.fontSans, fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
          Retry
        </button>
      </div>
    );
  }

  const gri = data.gri;
  const levelMeta = LEVEL_META[gri.level] ?? LEVEL_META.safe;
  const matrixData = data.matrix ?? [];
  const matrixDetail = data.matrixDetail ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes drawCircle { from { stroke-dashoffset: 283; } to { stroke-dashoffset: var(--offset); } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* ─── HEADER ─── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: C.fontMono, fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", color: C.textMuted, textTransform: "uppercase", marginBottom: "6px" }}>
            Harch IQ · NLP Engine
          </div>
          <h3 style={{ fontSize: "20px", fontWeight: 700, color: C.text, letterSpacing: "-0.02em", margin: 0 }}>
            Linguistic Intelligence Matrix
          </h3>
          <p style={{ fontSize: "13px", color: C.textSec, margin: "4px 0 0", maxWidth: "520px", lineHeight: 1.5 }}>
            La cartographie linguistique définitive de la rue numérique marocaine. Code-switching permanent — le moteur pondère chaque flux UGC selon cette volumétrie réelle.
          </p>
        </div>
        <button
          onClick={loadData}
          style={{
            padding: "8px 14px",
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "8px",
            fontFamily: C.fontMono,
            fontSize: "11px",
            color: C.textSec,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* ─── GRI GAUGE + LEVEL ─── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: "24px",
          padding: "24px",
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: "12px",
          boxShadow: C.shadowSm,
          alignItems: "center",
        }}
      >
        {/* GRI Circular Gauge */}
        <div style={{ position: "relative", width: "140px", height: "140px" }}>
          <svg width="140" height="140" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
            {/* Background circle */}
            <circle cx="50" cy="50" r="45" fill="none" stroke={C.surfaceAlt} strokeWidth="6" />
            {/* Score arc — animated */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={levelMeta.color}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="283"
              strokeDashoffset={283 - (283 * gri.score) / 100}
              style={{
                transition: "stroke-dashoffset 1.5s ease-out, stroke 0.3s",
              }}
            />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              GRI
            </div>
            <div style={{ fontSize: "32px", fontWeight: 700, color: levelMeta.color, lineHeight: 1, letterSpacing: "-0.02em" }}>
              {gri.score}
            </div>
            <div style={{ fontFamily: C.fontMono, fontSize: "9px", color: C.textFaint, marginTop: "2px" }}>/ 100</div>
          </div>
        </div>

        {/* Level + Recommendation */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 12px",
              background: levelMeta.bg,
              border: `1px solid ${levelMeta.border}`,
              borderRadius: "6px",
              alignSelf: "flex-start",
            }}
          >
            <span style={{ fontSize: "14px", fontWeight: 700, color: levelMeta.color }}>{levelMeta.icon}</span>
            <span style={{ fontFamily: C.fontMono, fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: levelMeta.color, textTransform: "uppercase" }}>
              Global Risk Index — {levelMeta.label}
            </span>
          </div>
          <p style={{ fontSize: "13px", color: C.textSec, lineHeight: 1.55, margin: 0 }}>
            {gri.recommendation}
          </p>
        </div>
      </div>

      {/* ─── CASCADE ALERT (if detected) ─── */}
      {gri.cascade.detected && gri.cascade.severity !== "none" && (
        <div
          style={{
            padding: "16px 20px",
            background: gri.cascade.severity === "critical" ? C.dangerBg : gri.cascade.severity === "warning" ? C.warningBg : C.surfaceAlt,
            border: `1px solid ${gri.cascade.severity === "critical" ? C.dangerBorder : gri.cascade.severity === "warning" ? C.warningBorder : C.border}`,
            borderRadius: "10px",
            display: "flex",
            gap: "12px",
            alignItems: "flex-start",
            animation: "slideIn 0.3s ease-out",
          }}
        >
          <span style={{ fontSize: "18px", color: gri.cascade.severity === "critical" ? C.dangerText : C.warningText }}>
            {gri.cascade.severity === "critical" ? "✕" : "⚠"}
          </span>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: C.fontMono,
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "4px",
                color: gri.cascade.severity === "critical" ? C.dangerText : C.warningText,
              }}
            >
              Cascade Detection — {gri.cascade.severity}
            </div>
            <p style={{ margin: 0, fontSize: "13px", color: C.textSec, lineHeight: 1.55 }}>{gri.cascade.description}</p>
            {gri.cascade.crossedTo.length > 0 && (
              <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
                <span style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.dangerText, padding: "3px 8px", background: C.dangerBg, border: `1px solid ${C.dangerBorder}`, borderRadius: "4px" }}>
                  DARIJA → {gri.cascade.crossedTo.map((c) => c.toUpperCase()).join(" + ")}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── THE 4-LANGUAGE MATRIX (interactive bars) ─── */}
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: C.shadowSm,
        }}
      >
        {/* Matrix header */}
        <div
          style={{
            padding: "14px 20px",
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontFamily: C.fontMono, fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: C.text, textTransform: "uppercase" }}>
            Linguistic Volumetry
          </span>
          <span style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted }}>35 / 35 / 20 / 10</span>
        </div>

        {/* Language rows */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {data.matrix.map((lang, i) => {
            const detail = matrixDetail.find((d) => d.code === lang.code);
            const griLang = gri.perLanguage.find((p) => p.language === lang.code);
            const isExpanded = expandedLang === lang.code;
            const isLast = i === data.matrix.length - 1;

            return (
              <div key={lang.code} style={{ borderBottom: isLast ? "none" : `1px solid ${C.borderLight}` }}>
                {/* Row (clickable) */}
                <button
                  onClick={() => setExpandedLang(isExpanded ? null : lang.code)}
                  style={{
                    width: "100%",
                    padding: "16px 20px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "grid",
                    gridTemplateColumns: "24px 1fr auto auto",
                    gap: "12px",
                    alignItems: "center",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = C.surfaceAlt)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {/* Color dot */}
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      background: lang.color,
                      boxShadow: `0 0 0 3px ${lang.color}15`,
                    }}
                  />

                  {/* Label + weight bar */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 600, color: C.text }}>{lang.label}</span>
                      <span style={{ fontFamily: C.fontMono, fontSize: "11px", color: C.textMuted }}>{lang.pct}%</span>
                    </div>
                    {/* Weight bar */}
                    <div style={{ height: "6px", background: C.surfaceAlt, borderRadius: "3px", overflow: "hidden", maxWidth: "300px" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${lang.pct}%`,
                          background: lang.color,
                          borderRadius: "3px",
                          transition: "width 1s ease-out",
                        }}
                      />
                    </div>
                  </div>

                  {/* GRI contribution */}
                  {griLang && (
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, letterSpacing: "0.05em" }}>RISK</div>
                      <div style={{ fontFamily: C.fontMono, fontSize: "14px", fontWeight: 700, color: griLang.rawRisk > 50 ? C.dangerText : griLang.rawRisk > 25 ? C.warningText : C.text }}>
                        {Math.round(griLang.rawRisk)}
                      </div>
                    </div>
                  )}

                  {/* Mentions */}
                  {griLang && (
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, letterSpacing: "0.05em" }}>MENTIONS</div>
                      <div style={{ fontFamily: C.fontMono, fontSize: "14px", fontWeight: 600, color: C.text }}>{griLang.mentionCount}</div>
                    </div>
                  )}
                </button>

                {/* Expanded detail */}
                {isExpanded && detail && (
                  <div
                    style={{
                      padding: "16px 20px 20px 56px",
                      background: C.surfaceAlt,
                      borderTop: `1px solid ${C.borderLight}`,
                      animation: "slideIn 0.2s ease-out",
                    }}
                  >
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                      {/* Usage */}
                      <div>
                        <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>
                          Usage
                        </div>
                        <p style={{ fontSize: "12px", color: C.textSec, lineHeight: 1.6, margin: 0 }}>{detail.usage}</p>
                      </div>
                      {/* NLP Treatment */}
                      <div>
                        <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>
                          NLP Treatment
                        </div>
                        <p style={{ fontSize: "12px", color: C.textSec, lineHeight: 1.6, margin: 0 }}>{detail.nlpTreatment}</p>
                      </div>
                    </div>

                    {/* Sources */}
                    <div style={{ marginTop: "12px" }}>
                      <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>
                        Sources surveillées
                      </div>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {detail.sources.map((s, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontFamily: C.fontMono,
                              fontSize: "10px",
                              color: C.textSec,
                              padding: "3px 8px",
                              background: C.surface,
                              border: `1px solid ${C.border}`,
                              borderRadius: "4px",
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Velocity + sentiment (if from GRI) */}
                    {griLang && (
                      <div style={{ marginTop: "12px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                        <Metric label="Vélocité" value={`${griLang.velocity}/h`} color={griLang.velocity > 15 ? C.dangerText : griLang.velocity > 8 ? C.warningText : C.text} />
                        <Metric label="Sentiment moy." value={griLang.avgSentiment.toFixed(2)} color={griLang.avgSentiment < -0.2 ? C.dangerText : griLang.avgSentiment > 0.2 ? C.success : C.text} />
                        <Metric label="Pondération GRI" value={`${(griLang.weight * 100).toFixed(0)}%`} color={C.textMuted} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── CONTENT ROUTING RULES ─── */}
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: "12px",
          padding: "16px 20px",
          boxShadow: C.shadowSm,
        }}
      >
        <div style={{ fontFamily: C.fontMono, fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: C.text, textTransform: "uppercase", marginBottom: "12px" }}>
          Content Routing Rules
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
          <RoutingRule
            icon="📰"
            label="Articles de presse"
            rule="MSA + FR + EN"
            note="JAMAIS de Darija — les articles sont formels"
            color="#1e3a5f"
          />
          <RoutingRule
            icon="💬"
            label="Commentaires (Hespress)"
            rule="Darija over-indexé"
            note="UGc underground — foyer des bad buzz"
            color="#a0524b"
          />
          <RoutingRule
            icon="📱"
            label="Social (TikTok/FB/X)"
            rule="Darija + FR + EN"
            note="Code-switching permanent"
            color="#4a7b5f"
          />
          <RoutingRule
            icon="⚖️"
            label="Réglementaire (BAM/AMMC)"
            rule="MSA + FR only"
            note="Communiqués institutionnels"
            color="#8b6914"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Small components ──────────────────────────────────────────

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ padding: "8px 10px", background: C.surface, borderRadius: "6px", border: `1px solid ${C.borderLight}` }}>
      <div style={{ fontFamily: C.fontMono, fontSize: "9px", color: C.textMuted, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "2px" }}>
        {label}
      </div>
      <div style={{ fontFamily: C.fontMono, fontSize: "13px", fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

function RoutingRule({ icon, label, rule, note, color }: { icon: string; label: string; rule: string; note: string; color: string }) {
  return (
    <div style={{ padding: "12px", background: C.surfaceAlt, borderRadius: "8px", border: `1px solid ${C.borderLight}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
        <span style={{ fontSize: "16px" }}>{icon}</span>
        <span style={{ fontSize: "12px", fontWeight: 600, color: C.text }}>{label}</span>
      </div>
      <div style={{ fontFamily: C.fontMono, fontSize: "11px", fontWeight: 700, color, marginBottom: "4px" }}>{rule}</div>
      <div style={{ fontSize: "11px", color: C.textMuted, lineHeight: 1.4 }}>{note}</div>
    </div>
  );
}
