"use client";

import { useState } from "react";
import { C } from "../components/tokens";
import { BrandBadge } from "@/components/BrandBadge";

// ═══════════════════════════════════════════════════════════════
//  RÉTRO-AUDIT — The Sales Weapon
//
//  This page generates "what we would have detected" reports for
//  past crisis periods. The admin selects a company + date range,
//  and the system produces a retrospective crisis analysis showing:
//    - When Harch would have detected the first signal
//    - The 48h advance warning timestamp
//    - The crisis score trajectory
//    - Language cascade (Darija → MSA → French)
//    - Top sources covering the crisis
//
//  This report gets sent to the Dircom: "Voici ce que vous auriez vu
//  48h avant que la crise n'éclate."
// ═══════════════════════════════════════════════════════════════

const COMPANIES = [
  { slug: "ocp-group", name: "OCP Group", sector: "Mining" },
  { slug: "attijariwafa-bank", name: "Attijariwafa Bank", sector: "Banking" },
  { slug: "bank-of-africa", name: "Bank of Africa", sector: "Banking" },
  { slug: "maroc-telecom", name: "Maroc Telecom", sector: "Telecom" },
  { slug: "royal-air-maroc", name: "Royal Air Maroc", sector: "Aviation" },
];

interface RetroReport {
  company: { name: string; slug: string; sector: string; ticker: string | null };
  crisisWindow: { start: string; end: string; durationDays: number };
  baseline: { articleCount: number; avgSentiment: number; period: string };
  crisis: {
    articleCount: number;
    negativeCount: number;
    positiveCount: number;
    neutralCount: number;
    avgSentiment: number;
    crisisScore: number;
    crisisLevel: string;
    factors: Array<{ name: string; value: number; weight: number }>;
  };
  advanceWarning: {
    firstSignal: string | null;
    harchAlertTime: string | null;
    hoursBeforePeak: number;
    warningPoints: Array<{ date: string; type: string; detail: string }>;
    message: string;
  };
  languageCascade: Record<string, number>;
  topSources: Array<{ source: string; count: number }>;
  articles: Array<{
    id: string; title: string; source: string; url: string | null;
    publishedAt: string | null; sentimentScore: number | null;
    sentimentLabel: string | null; language: string | null;
  }>;
  provenance: { engine: string; modelVersion: string; computedAt: string; confidence: number; };
}

export default function RetroAuditPage() {
  const [companySlug, setCompanySlug] = useState("ocp-group");
  const [startDate, setStartDate] = useState("2018-04-20");
  const [endDate, setEndDate] = useState("2018-05-01");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<RetroReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const res = await fetch(
        `/api/console/retro-audit?companySlug=${companySlug}&startDate=${startDate}&endDate=${endDate}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setReport(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const levelColor = (level: string) => {
    const map: Record<string, string> = {
      safe: "#10b981", watch: "#f59e0b", warning: "#f59e0b", critical: "#ef4444",
    };
    return map[level] || "#71717a";
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: C.fontSans, color: C.text }}>
      <header style={{ padding: "16px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: "12px", background: C.bg }}>
        <BrandBadge subsidiary="Atelier" size="sm" theme="light" />
        <span style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase", borderLeft: `1px solid ${C.border}`, paddingLeft: "10px" }}>
          Rétro-Audit — Sales Weapon
        </span>
      </header>

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
          Rétro-Audit de Crise
        </h1>
        <p style={{ fontSize: "14px", color: C.textBody, lineHeight: 1.6, marginBottom: "32px" }}>
          Génère un rapport rétrospectif : « Voici ce qu'Harch aurait détecté 48h avant que la crise n'éclate. »
          Ce rapport est envoyé au Dircom pour prouver la valeur de l'anticipation.
        </p>

        {/* Selector */}
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "24px", marginBottom: "32px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "16px", alignItems: "end" }}>
            <div>
              <label style={{ display: "block", fontFamily: C.fontMono, fontSize: "10px", fontWeight: 700, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>Entreprise</label>
              <select value={companySlug} onChange={(e) => setCompanySlug(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: "6px", fontSize: "14px", color: C.text, background: C.bg }}>
                {COMPANIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontFamily: C.fontMono, fontSize: "10px", fontWeight: 700, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>Début</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: "6px", fontSize: "14px", color: C.text, background: C.bg }} />
            </div>
            <div>
              <label style={{ display: "block", fontFamily: C.fontMono, fontSize: "10px", fontWeight: 700, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>Fin</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: "6px", fontSize: "14px", color: C.text, background: C.bg }} />
            </div>
            <button onClick={generate} disabled={loading} style={{ padding: "12px 20px", background: loading ? C.border : C.cta, color: "#fff", border: "none", borderRadius: "6px", fontFamily: C.fontSans, fontSize: "14px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
              {loading ? "Génération…" : "Générer le rapport →"}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ padding: "16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", fontSize: "13px", color: "#991b1b", marginBottom: "24px" }}>
            ✕ {error}
          </div>
        )}

        {/* Report */}
        {report && (
          <div>
            {/* The 48h advance warning — THE key card */}
            <div style={{ background: "#0a0a0a", border: "1px solid #262626", borderRadius: "12px", padding: "28px", marginBottom: "24px" }}>
              <div style={{ fontFamily: C.fontMono, fontSize: "10px", fontWeight: 700, color: "#71717a", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>
                Advance Warning — 48h d'anticipation
              </div>
              <p style={{ fontSize: "18px", color: "#fff", lineHeight: 1.5, margin: "0 0 16px" }}>
                {report.advanceWarning.message}
              </p>
              {report.advanceWarning.firstSignal && (
                <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: "10px", color: "#71717a", fontFamily: C.fontMono, textTransform: "uppercase", marginBottom: "4px" }}>Premier signal détecté</div>
                    <div style={{ fontSize: "16px", color: "#10b981", fontWeight: 700 }}>{new Date(report.advanceWarning.firstSignal).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "10px", color: "#71717a", fontFamily: C.fontMono, textTransform: "uppercase", marginBottom: "4px" }}>Alerte Harch envoyée à</div>
                    <div style={{ fontSize: "16px", color: "#10b981", fontWeight: 700 }}>
                      {report.advanceWarning.harchAlertTime ? new Date(report.advanceWarning.harchAlertTime).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "10px", color: "#71717a", fontFamily: C.fontMono, textTransform: "uppercase", marginBottom: "4px" }}>Heures d'avance</div>
                    <div style={{ fontSize: "16px", color: "#10b981", fontWeight: 700 }}>{report.advanceWarning.hoursBeforePeak}h</div>
                  </div>
                </div>
              )}
            </div>

            {/* Crisis score + stats grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
              <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px" }}>
                <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Crisis Score</div>
                <div style={{ fontSize: "36px", fontWeight: 800, color: levelColor(report.crisis.crisisLevel), lineHeight: 1 }}>{report.crisis.crisisScore}</div>
                <div style={{ fontSize: "11px", color: levelColor(report.crisis.crisisLevel), fontFamily: C.fontMono, fontWeight: 700, textTransform: "uppercase", marginTop: "4px" }}>{report.crisis.crisisLevel}</div>
              </div>
              <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px" }}>
                <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Articles (crise)</div>
                <div style={{ fontSize: "36px", fontWeight: 800, color: C.text, lineHeight: 1 }}>{report.crisis.articleCount}</div>
                <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: C.fontMono, marginTop: "4px" }}>{report.crisis.negativeCount} négatifs · {report.crisis.positiveCount} positifs</div>
              </div>
              <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px" }}>
                <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Sentiment moyen</div>
                <div style={{ fontSize: "36px", fontWeight: 800, color: report.crisis.avgSentiment < -0.3 ? "#ef4444" : report.crisis.avgSentiment < 0 ? "#f59e0b" : "#10b981", lineHeight: 1 }}>{report.crisis.avgSentiment.toFixed(2)}</div>
                <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: C.fontMono, marginTop: "4px" }}>Baseline: {report.baseline.avgSentiment.toFixed(2)}</div>
              </div>
              <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px" }}>
                <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Durée</div>
                <div style={{ fontSize: "36px", fontWeight: 800, color: C.text, lineHeight: 1 }}>{report.crisisWindow.durationDays}j</div>
                <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: C.fontMono, marginTop: "4px" }}>{report.crisisWindow.start} → {report.crisisWindow.end}</div>
              </div>
            </div>

            {/* Language cascade */}
            {Object.keys(report.languageCascade).length > 0 && (
              <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px", marginBottom: "24px" }}>
                <div style={{ fontFamily: C.fontMono, fontSize: "10px", fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>Cascade linguistique</div>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  {Object.entries(report.languageCascade).map(([lang, count]) => (
                    <div key={lang} style={{ padding: "8px 14px", background: C.bgSubtle, borderRadius: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: C.text }}>{lang}</span>
                      <span style={{ fontSize: "11px", color: C.textMuted, fontFamily: C.fontMono }}>{count} articles</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top sources */}
            {report.topSources.length > 0 && (
              <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px", marginBottom: "24px" }}>
                <div style={{ fontFamily: C.fontMono, fontSize: "10px", fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>Top sources</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "8px" }}>
                  {report.topSources.map((s, i) => (
                    <div key={s.source} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 10px", background: C.bgSubtle, borderRadius: "4px" }}>
                      <span style={{ fontSize: "11px", color: C.textMuted, fontFamily: C.fontMono, fontWeight: 700 }}>{i + 1}.</span>
                      <span style={{ fontSize: "13px", color: C.text }}>{s.source}</span>
                      <span style={{ fontSize: "11px", color: C.textMuted, fontFamily: C.fontMono, marginLeft: "auto" }}>{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Articles list */}
            {report.articles.length > 0 && (
              <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "12px", overflow: "hidden" }}>
                <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, fontFamily: C.fontMono, fontSize: "10px", fontWeight: 700, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Articles pendant la crise ({report.articles.length} affichés)
                </div>
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  {report.articles.map((a, i) => (
                    <div key={a.id} style={{ display: "grid", gridTemplateColumns: "100px 1fr 80px 80px", gap: "12px", padding: "12px 20px", borderBottom: i < report.articles.length - 1 ? `1px solid ${C.border}` : "none", fontSize: "13px", alignItems: "center" }}>
                      <span style={{ fontSize: "11px", color: C.textMuted, fontFamily: C.fontMono }}>{a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : "—"}</span>
                      <div>
                        <div style={{ fontSize: "13px", color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</div>
                        <div style={{ fontSize: "11px", color: C.textMuted }}>{a.source}</div>
                      </div>
                      <span style={{ fontSize: "11px", fontFamily: C.fontMono, color: (a.sentimentScore ?? 0) < -0.3 ? "#ef4444" : (a.sentimentScore ?? 0) < 0 ? "#f59e0b" : "#10b981", fontWeight: 700 }}>
                        {(a.sentimentScore ?? 0).toFixed(2)}
                      </span>
                      <span style={{ fontSize: "10px", color: C.textMuted, fontFamily: C.fontMono, textTransform: "uppercase" }}>{a.sentimentLabel || "—"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Provenance badge */}
            <div style={{ marginTop: "16px", textAlign: "center" }}>
              <span style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted }}>
                🔗 Provenance: {report.provenance.engine} v{report.provenance.modelVersion} · confidence {(report.provenance.confidence * 100).toFixed(0)}% · {new Date(report.provenance.computedAt).toLocaleString("fr-FR")}
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
