"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Download, Loader2, AlertTriangle,
  TrendingUp, TrendingDown, Minus, FileText, Calendar,
  ExternalLink, RefreshCw,
} from "lucide-react";

const SAGE = "#4A7B5F";
const SAGE_BG = "rgba(74,123,95,0.08)";
const CHARCOAL = "#0A0A0A";
const TEXT_BODY = "#525252";
const TEXT_MUTED = "#71717A";
const BORDER = "#F0F0F0";
const POSITIVE = "#10B981";
const NEGATIVE = "#EF4444";
const AMBER = "#F59E0B";

interface BriefingData {
  meta: { companyName: string; sector: string | null; generatedAt: string; date: string; plan: string; };
  score: { value: number; trend: number; status: string; totalArticles: number; };
  sentiment: { positive: number; neutral: number; negative: number; total7d: number; articles24h: number; };
  crisis: { level: string; score: number; alerts: Array<{ title: string; source: string; date: string | null; url: string }>; };
  topArticles: Array<{ title: string; source: string; date: string | null; url: string; sentiment: string; }>;
  topSources: Array<{ source: string; count: number }>;
  recommendation: string;
}

const SECTIONS = [
  { id: "header", delay: 200 },
  { id: "score", delay: 400 },
  { id: "sentiment", delay: 600 },
  { id: "crisis", delay: 800 },
  { id: "articles", delay: 1000 },
  { id: "sources", delay: 1200 },
  { id: "recommendation", delay: 1400 },
  { id: "actions", delay: 1600 },
];

export function BriefingGenerator({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<BriefingData | null>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(true);

  const generate = useCallback(async () => {
    setLoading(true); setError(null); setData(null);
    setVisibleSections(new Set()); setGenerating(true);
    try {
      const res = await fetch("/api/console/briefing/generate", { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const briefing = await res.json();
      setData(briefing); setLoading(false);
      for (const section of SECTIONS) {
        setTimeout(() => {
          setVisibleSections((prev) => new Set(prev).add(section.id));
          if (section.id === "actions") setGenerating(false);
        }, section.delay);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec");
      setLoading(false); setGenerating(false);
    }
  }, []);

  useEffect(() => { void generate(); }, [generate]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(10,10,10,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} style={{ width: "100%", maxWidth: 680, maxHeight: "90vh", background: "#FFFFFF", borderRadius: 12, border: `1px solid ${BORDER}`, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
        {/* Header bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${BORDER}`, background: "#FAFAFA" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FileText size={18} style={{ color: SAGE }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL }}>Briefing Matinal</span>
            {generating && <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: SAGE, fontFamily: "'Space Mono', monospace" }}><Loader2 size={11} className="animate-spin" /> Génération...</span>}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => window.print()} disabled={generating || !data} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: generating || !data ? BORDER : CHARCOAL, color: generating || !data ? TEXT_MUTED : "#FFFFFF", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: generating || !data ? "not-allowed" : "pointer", fontFamily: "inherit" }}><Download size={13} /> PDF</button>
            <button onClick={onClose} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer", color: TEXT_MUTED }}><X size={18} /></button>
          </div>
        </div>

        {/* Document body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px", fontFamily: "'Inter', system-ui, sans-serif", color: CHARCOAL }}>
          {loading && <div style={{ textAlign: "center", padding: "60px 0" }}><Loader2 size={32} style={{ color: SAGE, animation: "spin 1s linear infinite" }} /><p style={{ marginTop: 16, fontSize: 14, color: TEXT_MUTED }}>Collecte de vos données en cours...</p></div>}
          {error && <div style={{ textAlign: "center", padding: "40px 0" }}><AlertTriangle size={32} style={{ color: NEGATIVE }} /><p style={{ marginTop: 12, fontSize: 14, color: NEGATIVE }}>{error}</p><button onClick={generate} style={{ marginTop: 16, padding: "8px 16px", background: CHARCOAL, color: "#FFFFFF", border: "none", borderRadius: 6, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Réessayer</button></div>}
          {data && (
            <div id="briefing-document">
              <AnimatePresence>
                {visibleSections.has("header") && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Calendar size={14} style={{ color: SAGE }} /><span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: SAGE, textTransform: "uppercase", letterSpacing: "0.08em" }}>{data.meta.date}</span></div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: CHARCOAL, letterSpacing: "-0.02em" }}>Briefing — {data.meta.companyName}</h1>
                    <p style={{ fontSize: 13, color: TEXT_MUTED, marginTop: 4 }}>Veille réputationnelle · {data.score.totalArticles} articles au total</p>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {visibleSections.has("score") && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24, padding: 20, background: "#FAFAFA", borderRadius: 8, border: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Score de réputation</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <span style={{ fontSize: 48, fontWeight: 700, color: data.score.value >= 70 ? SAGE : data.score.value >= 50 ? AMBER : NEGATIVE, lineHeight: 1 }}>{data.score.status === "no_data" ? "—" : data.score.value}</span>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14, fontWeight: 600 }}>
                          {data.score.trend > 0 ? <TrendingUp size={16} style={{ color: POSITIVE }} /> : data.score.trend < 0 ? <TrendingDown size={16} style={{ color: NEGATIVE }} /> : <Minus size={16} style={{ color: TEXT_MUTED }} />}
                          <span style={{ color: data.score.trend > 0 ? POSITIVE : data.score.trend < 0 ? NEGATIVE : TEXT_MUTED }}>{data.score.trend > 0 ? `+${data.score.trend}` : data.score.trend} pts</span>
                        </div>
                        <span style={{ fontSize: 12, color: TEXT_MUTED }}>{data.score.status === "no_data" ? "Collecte en cours" : "/ 100"}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {visibleSections.has("sentiment") && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Sentiment (7 derniers jours)</div>
                    <div style={{ display: "flex", gap: 2, height: 8, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ flex: data.sentiment.positive, background: POSITIVE }} /><div style={{ flex: data.sentiment.neutral, background: "#E5E5E5" }} /><div style={{ flex: data.sentiment.negative, background: NEGATIVE }} />
                    </div>
                    <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 12 }}>
                      <span style={{ color: POSITIVE }}>● {data.sentiment.positive}% positif</span><span style={{ color: TEXT_MUTED }}>● {data.sentiment.neutral}% neutre</span><span style={{ color: NEGATIVE }}>● {data.sentiment.negative}% négatif</span>
                    </div>
                    <p style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 8 }}>{data.sentiment.articles24h} articles 24h · {data.sentiment.total7d} sur 7 jours</p>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {visibleSections.has("crisis") && data.crisis.alerts.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24, padding: 16, background: data.crisis.level === "critical" ? "rgba(239,68,68,0.06)" : data.crisis.level === "warning" ? "rgba(245,158,11,0.06)" : "#FAFAFA", borderRadius: 8, border: `1px solid ${data.crisis.level === "critical" ? "rgba(239,68,68,0.2)" : data.crisis.level === "warning" ? "rgba(245,158,11,0.2)" : BORDER}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <AlertTriangle size={14} style={{ color: data.crisis.level === "critical" ? NEGATIVE : data.crisis.level === "warning" ? AMBER : TEXT_MUTED }} />
                      <span style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: data.crisis.level === "critical" ? NEGATIVE : data.crisis.level === "warning" ? AMBER : TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>Alertes ({data.crisis.alerts.length})</span>
                    </div>
                    {data.crisis.alerts.slice(0, 3).map((alert, i) => (
                      <div key={i} style={{ marginBottom: 6, fontSize: 13, color: TEXT_BODY }}><span style={{ color: NEGATIVE, fontWeight: 600 }}>●</span> {alert.title}<span style={{ color: TEXT_MUTED, fontSize: 11, marginLeft: 4 }}>— {alert.source}</span></div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {visibleSections.has("articles") && data.topArticles.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Top articles récents</div>
                    {data.topArticles.map((article, i) => (
                      <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < data.topArticles.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                        <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, fontWeight: 600, color: CHARCOAL, textDecoration: "none", display: "flex", alignItems: "start", gap: 6 }}>{article.title}<ExternalLink size={12} style={{ color: TEXT_MUTED, flexShrink: 0, marginTop: 2 }} /></a>
                        <div style={{ display: "flex", gap: 8, marginTop: 4, fontSize: 11, color: TEXT_MUTED }}>
                          <span>{article.source}</span>
                          {article.sentiment === "positive" && <span style={{ color: POSITIVE }}>● positif</span>}
                          {article.sentiment === "negative" && <span style={{ color: NEGATIVE }}>● négatif</span>}
                          {article.sentiment === "neutral" && <span style={{ color: TEXT_MUTED }}>● neutre</span>}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {visibleSections.has("sources") && data.topSources.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Sources principales</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {data.topSources.map((s, i) => (<span key={i} style={{ padding: "4px 10px", background: SAGE_BG, borderRadius: 4, fontSize: 12, color: SAGE }}>{s.source} ({s.count})</span>))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {visibleSections.has("recommendation") && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24, padding: 16, background: SAGE_BG, borderRadius: 8, border: "1px solid rgba(74,123,95,0.2)" }}>
                    <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: SAGE, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, fontWeight: 700 }}>Recommandation HarchIQ</div>
                    <p style={{ fontSize: 14, color: CHARCOAL, lineHeight: 1.6, margin: 0 }}>{data.recommendation}</p>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {visibleSections.has("actions") && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", gap: 8, paddingTop: 16, borderTop: `1px solid ${BORDER}` }}>
                    <button onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", background: CHARCOAL, color: "#FFFFFF", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}><Download size={14} /> Exporter PDF</button>
                    <button onClick={generate} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", background: "transparent", color: TEXT_BODY, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}><RefreshCw size={14} /> Régénérer</button>
                  </motion.div>
                )}
              </AnimatePresence>
              {generating && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 16 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: SAGE, animation: "pulse 1s infinite" }} />
                  <span style={{ fontSize: 11, color: SAGE, fontFamily: "'Space Mono', monospace" }}>Rédaction en cours...</span>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } } @media print { body * { visibility: hidden; } #briefing-document, #briefing-document * { visibility: visible; } #briefing-document { position: absolute; left: 0; top: 0; width: 100%; padding: 40px; } }`}</style>
    </div>
  );
}
