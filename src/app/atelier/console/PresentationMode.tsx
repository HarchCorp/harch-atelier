"use client";

// ═══════════════════════════════════════════════════════════════
//  PRESENTATION MODE — "Boss-ready" floating widget
//
//  Mission: "Tu leur donnes la donnée et eux ils croient que c'est
//  eux qui ont trouvé cette donnée." The widget makes corporate
//  workers LOOK smart — one-click copy of an executive summary,
//  email-ready export, and a print-to-PDF PowerPoint deck.
//
//  Three features:
//    1. "📋 Copier le résumé"  — copies a pre-written exec summary
//    2. "✉ Email"               — opens a modal → mailto: link
//    3. "📊 PPT"                — downloads a 5-slide HTML deck
//
//  Data sources (all read-only, all auth'd by the same NextAuth
//  session the rest of the console uses):
//    • GET /api/console/brand-health   — score, sentiment, mentions
//    • GET /api/console/topics         — top 5 topics, total articles
//    • GET /api/console/ai-visibility  — LLM rankings
//    • GET /api/console/crisis-alerts  — top 3 alerts
//
//  Position: floating, bottom-LEFT (bottom-right is the HarchIQ
//  Assistant). Collapsible "Présentation" tab. On mobile (< 768px)
//  it becomes a full-width bar above the bottom nav.
//
//  NO "HarchIQ AI generated this" branding in the summary text —
//  the user pastes it in an email and it looks like THEY wrote it.
//
//  Task ID: PRESENT-1
// ═══════════════════════════════════════════════════════════════

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { C as TOKENS } from "../components/tokens";

// ─── DESIGN TOKENS (mirror HarchIQAssistant's local C extension) ──
const C = {
  ...TOKENS,
  surface: TOKENS.bg,             // bg-white
  surfaceAlt: TOKENS.bgHover,     // bg-neutral-100
  borderLight: TOKENS.border,     // border-neutral-200
  textPrimary: TOKENS.text,       // text-neutral-950
  textSecondary: TOKENS.textBody, // text-neutral-600
  textFaint: "#a3a3a3",           // neutral-400
};

const FONT = {
  sans: C.fontSans, // Inter
  mono: C.fontMono, // Space Mono
};

// Green accent — emerald-500 (C.cta). The mission brief says
// "#4A7B5F" but the Harch design system (tokens.ts) uses emerald-500
// as the single green CTA colour. We honour the design system.
const ACCENT = C.cta; // #10b981

// localStorage key for the saved boss-email (so the email modal
// pre-fills the "À" field on subsequent visits).
const BOSS_EMAIL_KEY = "harchiq.presentation.boss-email";

// ═══════════════════════════════════════════════════════════════
//  TYPES — API response shapes
// ═══════════════════════════════════════════════════════════════

interface BrandHealthData {
  score: number;
  trend: number;
  sentiment: { positive: number; neutral: number; negative: number };
  shareOfVoice?: number;
  mentionCount24h?: number;
  mentionVelocity?: number;
  crisisLevel?: string;
  crisisScore?: number;
  topNarrative?: { label: string; momentum: string; sentiment: number };
  aiVisibility?: { engine: string; score: number }[];
  recommendation?: string;
  source?: string;
}

interface TopicItem {
  label?: string;
  name?: string;
  count?: number;
  mentions?: number;
  type?: string;
  sentiment?: number;
  trend?: number;
}
interface TopicsData {
  company?: { name: string; slug: string };
  topics: TopicItem[];
  totalArticles?: number;
}

interface AiVisibilityData {
  company?: { name: string; slug: string };
  // Real (Prisma) shape
  platforms?: {
    platform: string;
    cited: boolean;
    position?: string | null;
    sentiment?: string;
    confidence?: number;
    summary?: string;
  }[];
  // Demo shape
  engines?: { name: string; score: number; mentions: number; trend: number }[];
  citedCount?: number;
  totalCount?: number;
  visibilityScore?: number;
  overallScore?: number;
  trend?: number;
}

interface CrisisAlert {
  id: string;
  severity: "critical" | "warning" | "watch";
  title: string;
  summary: string;
  source: string;
  sourceType: string;
  timestamp: number;
}
interface CrisisAlertsData {
  alerts: CrisisAlert[];
  count: number;
}

interface PresentationData {
  brandHealth: BrandHealthData | null;
  topics: TopicsData | null;
  aiVisibility: AiVisibilityData | null;
  crisisAlerts: CrisisAlertsData | null;
  companyName: string;
  loading: boolean;
}

// ═══════════════════════════════════════════════════════════════
//  DATA HOOK — fetch all 4 endpoints in parallel
// ═══════════════════════════════════════════════════════════════

function usePresentationData() {
  const [data, setData] = useState<PresentationData>({
    brandHealth: null,
    topics: null,
    aiVisibility: null,
    crisisAlerts: null,
    companyName: "",
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [bh, tp, av, ca] = await Promise.allSettled([
        fetch("/api/console/brand-health").then((r) =>
          r.ok ? r.json() : Promise.reject(r.status),
        ),
        fetch("/api/console/topics").then((r) =>
          r.ok ? r.json() : Promise.reject(r.status),
        ),
        fetch("/api/console/ai-visibility").then((r) =>
          r.ok ? r.json() : Promise.reject(r.status),
        ),
        fetch("/api/console/crisis-alerts").then((r) =>
          r.ok ? r.json() : Promise.reject(r.status),
        ),
      ]);

      if (cancelled) return;

      const brandHealth =
        bh.status === "fulfilled" ? (bh.value as BrandHealthData) : null;
      const topics =
        tp.status === "fulfilled" ? (tp.value as TopicsData) : null;
      const aiVisibility =
        av.status === "fulfilled" ? (av.value as AiVisibilityData) : null;
      const crisisAlerts =
        ca.status === "fulfilled" ? (ca.value as CrisisAlertsData) : null;

      const companyName =
        topics?.company?.name ||
        aiVisibility?.company?.name ||
        "";

      setData({
        brandHealth,
        topics,
        aiVisibility,
        crisisAlerts,
        companyName,
        loading: false,
      });
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════

function formatDateFR(d: Date): string {
  try {
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

function formatNumber(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toLocaleString("fr-FR");
}

interface NormalizedEngine {
  name: string;
  cited: boolean;
  position: number | null;
  score: number | null;
  sentiment?: string;
  summary?: string;
}

// Both API shapes (real Prisma `platforms[]` and demo `engines[]`)
// collapse into one normalised list, ranked by score then cited.
function normalizeEngines(av: AiVisibilityData | null): NormalizedEngine[] {
  if (!av) return [];

  if (av.platforms && av.platforms.length > 0) {
    return av.platforms
      .map((p) => {
        const posRaw = p.position ? String(p.position).replace(/\D/g, "") : "";
        const pos = posRaw ? parseInt(posRaw, 10) : null;
        return {
          name: p.platform,
          cited: !!p.cited,
          position: pos,
          score: p.confidence != null ? Math.round(p.confidence * 100) : null,
          sentiment: p.sentiment,
          summary: p.summary,
        } as NormalizedEngine;
      })
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .map((e, i) => ({
        ...e,
        position: e.position ?? (e.cited ? i + 1 : null),
      }));
  }

  if (av.engines && av.engines.length > 0) {
    return av.engines
      .map((e) => ({
        name: e.name,
        cited: e.score > 0,
        position: null as number | null,
        score: e.score,
      }))
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .map((e, i) => ({ ...e, position: e.cited ? i + 1 : null }));
  }

  return [];
}

interface NormalizedTopic {
  label: string;
  count: number;
  sentimentPct: number | null;
  type: string | null;
}

function normalizeTopics(tp: TopicsData | null): NormalizedTopic[] {
  if (!tp || !tp.topics) return [];
  return tp.topics.slice(0, 5).map((t) => {
    const label = t.label || t.name || "—";
    const count = t.count ?? t.mentions ?? 0;
    // Demo sentiment is -1..1 → convert to a "% positif" 0..100.
    const sentimentPct =
      t.sentiment != null ? Math.round((t.sentiment + 1) * 50) : null;
    return { label, count, sentimentPct, type: t.type ?? null };
  });
}

// ═══════════════════════════════════════════════════════════════
//  SUMMARY TEXT BUILDER
//
//  The exact format from the spec — copy-paste ready for an email
//  to the boss. NO "HarchIQ AI generated this" disclaimer.
// ═══════════════════════════════════════════════════════════════

function buildSummary(data: PresentationData): string {
  const date = formatDateFR(new Date());
  const bh = data.brandHealth;
  const tp = data.topics;
  const av = data.aiVisibility;
  const ca = data.crisisAlerts;

  // Score + trend
  const scoreStr = bh?.score != null ? String(bh.score) : "—";
  const trendStr =
    bh?.trend != null
      ? bh.trend >= 0
        ? `↑ +${bh.trend}`
        : `↓ ${bh.trend}`
      : "—";

  // Sentiment breakdown
  const pos = bh?.sentiment?.positive ?? "—";
  const neu = bh?.sentiment?.neutral ?? "—";
  const neg = bh?.sentiment?.negative ?? "—";

  // Mentions (30j) + source count
  const mentions = tp?.totalArticles != null ? formatNumber(tp.totalArticles) : "—";
  const sourceCount =
    tp?.topics?.filter((t) => t.type === "source").length ||
    tp?.topics?.length ||
    "—";

  // AI visibility — top cited engines with their rank
  const engines = normalizeEngines(av).filter((e) => e.cited).slice(0, 4);
  const enginesLine =
    engines.length > 0
      ? engines
          .map((e) => `${e.name} #${e.position ?? "—"}`)
          .join(", ")
      : "—";

  // Top 3 topics
  const topics = normalizeTopics(tp).slice(0, 3);
  const topicsBlock =
    topics.length > 0
      ? topics
          .map(
            (t, i) =>
              `${i + 1}. ${t.label} (${formatNumber(t.count)} mentions${
                t.sentimentPct != null ? `, ${t.sentimentPct}% positif` : ""
              })`,
          )
          .join("\n")
      : "—";

  // Top alert (critical first)
  const criticalAlert =
    ca?.alerts?.find((a) => a.severity === "critical") || ca?.alerts?.[0];
  const alertLine = criticalAlert
    ? `ALERTE: ${criticalAlert.title}`
    : "ALERTE: Aucune alerte critique";

  return `📋 RÉSUMÉ EXÉCUTIF — ${date}

Score de réputation: ${scoreStr}/100 (${trendStr} vs semaine dernière)
Sentiment global: ${pos}% positif, ${neu}% neutre, ${neg}% négatif
Mentions (30j): ${mentions} articles · ${sourceCount} sources
Visibilité IA: ${enginesLine}

TOP 3 SUJETS:
${topicsBlock}

${alertLine}

Source: Harch Atelier · ${data.companyName || "—"}`;
}

// ═══════════════════════════════════════════════════════════════
//  POWERPOINT HTML BUILDER
//
//  Generates a self-contained 5-slide HTML deck (1280×720 each).
//  The user opens it in a browser and uses "Print to PDF" (or
//  imports the HTML into PowerPoint via Insert → Object).
//
//  Slides:
//    1. Title slide — company name + date
//    2. KPI summary — score, sentiment, mentions, AI visibility
//    3. Top 5 topics — table
//    4. AI visibility rankings — ranked list
//    5. Recommendations — derived from alerts + narrative
// ═══════════════════════════════════════════════════════════════

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildPptHtml(data: PresentationData): string {
  const date = formatDateFR(new Date());
  const company = escapeHtml(data.companyName || "Entreprise");
  const bh = data.brandHealth;
  const tp = data.topics;
  const av = data.aiVisibility;
  const ca = data.crisisAlerts;

  // Slide 2 — KPIs
  const score = bh?.score != null ? `${bh.score}/100` : "—";
  const trend =
    bh?.trend != null
      ? bh.trend >= 0
        ? `↑ +${bh.trend} vs semaine dernière`
        : `↓ ${bh.trend} vs semaine dernière`
      : "—";
  const posPct = bh?.sentiment?.positive ?? "—";
  const neuPct = bh?.sentiment?.neutral ?? "—";
  const negPct = bh?.sentiment?.negative ?? "—";
  const sentimentStr = `${posPct}% positif · ${neuPct}% neutre · ${negPct}% négatif`;
  const mentions30d =
    tp?.totalArticles != null ? formatNumber(tp.totalArticles) : "—";
  const sourceCount =
    tp?.topics?.filter((t) => t.type === "source").length ||
    tp?.topics?.length ||
    0;
  const mentionsStr = `${mentions30d} articles · ${sourceCount} sources (30j)`;
  const visScore = av?.visibilityScore ?? av?.overallScore ?? "—";

  // Slide 3 — Top 5 topics table
  const topics = normalizeTopics(tp).slice(0, 5);
  const topicsRows =
    topics.length > 0
      ? topics
          .map(
            (t, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${escapeHtml(t.label)}</td>
          <td>${formatNumber(t.count)}</td>
          <td>${
            t.sentimentPct != null ? `${t.sentimentPct}% positif` : "—"
          }</td>
        </tr>`,
          )
          .join("")
      : `<tr><td colspan="4" style="text-align:center;color:#737373;padding:32px">Aucune donnée disponible</td></tr>`;

  // Slide 4 — AI visibility rankings
  const engines = normalizeEngines(av);
  const enginesList =
    engines.length > 0
      ? engines
          .map((e, i) => {
            const rank = e.position ?? i + 1;
            const status = e.cited ? "Cité" : "Non cité";
            const scoreStr = e.score != null ? `${e.score}/100` : "—";
            return `
        <li class="rank-item">
          <div class="rank-num">#${rank}</div>
          <div class="rank-name">${escapeHtml(e.name)}</div>
          <div class="rank-status ${e.cited ? "cited" : "not-cited"}">${status}</div>
          <div class="rank-score">${scoreStr}</div>
        </li>`;
          })
          .join("")
      : `<li class="rank-item"><div class="rank-name" style="color:#737373">Aucune donnée disponible</div></li>`;

  // Slide 5 — Recommendations
  const recs: string[] = [];
  const criticalAlert =
    ca?.alerts?.find((a) => a.severity === "critical") || ca?.alerts?.[0];
  if (criticalAlert) {
    recs.push(
      `Surveiller de près : ${criticalAlert.title} (${criticalAlert.source})`,
    );
  }
  const topPositiveTopic = topics.find((t) => (t.sentimentPct ?? 0) >= 50);
  if (topPositiveTopic) {
    recs.push(
      `Capitaliser sur : ${topPositiveTopic.label} (${topPositiveTopic.sentimentPct}% positif)`,
    );
  }
  const lowestEngine = engines
    .filter((e) => e.cited)
    .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))[0];
  if (lowestEngine) {
    recs.push(
      `Renforcer la visibilité IA sur : ${lowestEngine.name} (score ${lowestEngine.score}/100)`,
    );
  }
  if (bh?.recommendation) {
    recs.push(bh.recommendation);
  }
  if (recs.length === 0) {
    recs.push("Aucune recommandation spécifique — situation nominale.");
  }
  const recList = recs
    .map((r) => `<li class="rec-item">${escapeHtml(r)}</li>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Rapport de Réputation — ${company} — ${date}</title>
<style>
  @page { size: 1280px 720px; margin: 0; }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 24px 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #f5f5f5; color: #0a0a0a;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .slide {
    width: 1280px; height: 720px;
    background: #ffffff; margin: 0 auto 24px;
    position: relative; overflow: hidden;
    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    page-break-after: always;
  }
  .slide:last-child { page-break-after: auto; }

  /* ─── Slide 1 — Title ─── */
  .slide-title { background: #0a0a0a; color: #ffffff; padding: 80px 96px; }
  .slide-title .eyebrow {
    font-size: 14px; color: #10b981; text-transform: uppercase;
    letter-spacing: 2px; font-weight: 600; margin-bottom: 24px;
  }
  .slide-title h1 { font-size: 56px; margin: 0; font-weight: 700; line-height: 1.1; }
  .slide-title .meta {
    font-size: 20px; color: #a3a3a3; margin-top: 32px;
    font-family: 'Space Mono', 'Courier New', monospace;
  }
  .slide-title .accent-bar {
    width: 64px; height: 4px; background: #10b981; margin-top: 48px;
  }

  /* ─── Slide content ─── */
  .slide-content { padding: 64px 96px; height: 100%; }
  .slide-content h2 {
    font-size: 32px; color: #0a0a0a; margin: 0 0 8px;
    font-weight: 600; letter-spacing: -0.5px;
  }
  .slide-content .subtitle {
    font-size: 14px; color: #737373; text-transform: uppercase;
    letter-spacing: 1px; margin-bottom: 40px;
  }

  /* ─── KPI grid ─── */
  .kpi-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;
  }
  .kpi {
    border: 1px solid #e5e5e5; border-radius: 8px; padding: 32px 24px;
    background: #fafafa;
  }
  .kpi-label {
    font-size: 11px; color: #737373; text-transform: uppercase;
    letter-spacing: 1px; font-weight: 600;
  }
  .kpi-value {
    font-size: 40px; font-weight: 700; color: #0a0a0a;
    margin-top: 12px; line-height: 1;
    font-family: 'Space Mono', 'Courier New', monospace;
  }
  .kpi-sub { font-size: 13px; color: #525252; margin-top: 12px; line-height: 1.4; }

  /* ─── Topics table ─── */
  table { width: 100%; border-collapse: collapse; }
  th {
    text-align: left; font-size: 11px; color: #737373;
    text-transform: uppercase; letter-spacing: 1px; font-weight: 600;
    padding: 16px 16px; border-bottom: 2px solid #0a0a0a;
  }
  td {
    font-size: 16px; padding: 18px 16px; border-bottom: 1px solid #e5e5e5;
    color: #0a0a0a; vertical-align: middle;
  }
  td:first-child { font-family: 'Space Mono', monospace; color: #10b981; font-weight: 600; width: 60px; }
  td:nth-child(3) { font-family: 'Space Mono', monospace; text-align: right; }

  /* ─── AI visibility list ─── */
  .rank-list { list-style: none; padding: 0; margin: 0; }
  .rank-item {
    display: flex; align-items: center; padding: 18px 0;
    border-bottom: 1px solid #e5e5e5;
  }
  .rank-num {
    font-size: 28px; font-weight: 700; color: #10b981; width: 80px;
    font-family: 'Space Mono', monospace;
  }
  .rank-name { font-size: 22px; font-weight: 500; flex: 1; color: #0a0a0a; }
  .rank-status {
    font-size: 12px; padding: 4px 12px; border-radius: 12px;
    font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
    margin-right: 24px;
  }
  .rank-status.cited { background: #ecfdf5; color: #047857; }
  .rank-status.not-cited { background: #f5f5f5; color: #737373; }
  .rank-score {
    font-size: 18px; color: #525252;
    font-family: 'Space Mono', monospace; width: 100px; text-align: right;
  }

  /* ─── Recommendations ─── */
  .rec-list { list-style: none; padding: 0; margin: 0; }
  .rec-item {
    font-size: 19px; padding: 20px 0; border-bottom: 1px solid #e5e5e5;
    color: #0a0a0a; line-height: 1.5; display: flex; align-items: flex-start;
  }
  .rec-item::before {
    content: "→"; color: #10b981; font-weight: 700;
    margin-right: 16px; font-size: 22px; flex-shrink: 0;
  }

  /* ─── Footer ─── */
  .slide-footer {
    position: absolute; bottom: 24px; left: 96px; right: 96px;
    font-size: 11px; color: #737373;
    display: flex; justify-content: space-between;
    border-top: 1px solid #e5e5e5; padding-top: 12px;
    font-family: 'Space Mono', monospace;
  }

  /* ─── Print ─── */
  @media print {
    body { background: #ffffff; padding: 0; }
    .slide { margin: 0; box-shadow: none; }
  }
</style>
</head>
<body>

<!-- SLIDE 1 — TITLE -->
<div class="slide slide-title">
  <div class="eyebrow">Rapport de Réputation</div>
  <h1>${company}</h1>
  <div class="meta">${date}</div>
  <div class="accent-bar"></div>
</div>

<!-- SLIDE 2 — KPI SUMMARY -->
<div class="slide">
  <div class="slide-content">
    <div class="subtitle">Indicateurs clés</div>
    <h2>Vue d'ensemble</h2>
    <div class="kpi-grid" style="margin-top: 32px;">
      <div class="kpi">
        <div class="kpi-label">Score de réputation</div>
        <div class="kpi-value">${escapeHtml(score)}</div>
        <div class="kpi-sub">${escapeHtml(trend)}</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">Sentiment global</div>
        <div class="kpi-value">${escapeHtml(String(posPct))}<span style="font-size:20px;color:#737373">%</span></div>
        <div class="kpi-sub">${escapeHtml(sentimentStr)}</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">Mentions (30j)</div>
        <div class="kpi-value">${escapeHtml(mentions30d)}</div>
        <div class="kpi-sub">${escapeHtml(mentionsStr)}</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">Visibilité IA</div>
        <div class="kpi-value">${escapeHtml(String(visScore))}<span style="font-size:20px;color:#737373">${typeof visScore === "number" ? "%" : ""}</span></div>
        <div class="kpi-sub">${engines.filter((e) => e.cited).length} moteurs IA citent ${company}</div>
      </div>
    </div>
  </div>
  <div class="slide-footer">
    <span>${company} · Rapport de Réputation</span>
    <span>${date} · 2/5</span>
  </div>
</div>

<!-- SLIDE 3 — TOP 5 TOPICS -->
<div class="slide">
  <div class="slide-content">
    <div class="subtitle">Analyse thématique</div>
    <h2>Top 5 sujets (30 jours)</h2>
    <table style="margin-top: 32px;">
      <thead>
        <tr>
          <th>#</th>
          <th>Sujet</th>
          <th>Mentions</th>
          <th>Sentiment</th>
        </tr>
      </thead>
      <tbody>
        ${topicsRows}
      </tbody>
    </table>
  </div>
  <div class="slide-footer">
    <span>${company} · Rapport de Réputation</span>
    <span>${date} · 3/5</span>
  </div>
</div>

<!-- SLIDE 4 — AI VISIBILITY -->
<div class="slide">
  <div class="slide-content">
    <div class="subtitle">Visibilité sur les moteurs IA</div>
    <h2>Classement des citations IA</h2>
    <ul class="rank-list" style="margin-top: 32px;">
      ${enginesList}
    </ul>
  </div>
  <div class="slide-footer">
    <span>${company} · Rapport de Réputation</span>
    <span>${date} · 4/5</span>
  </div>
</div>

<!-- SLIDE 5 — RECOMMENDATIONS -->
<div class="slide">
  <div class="slide-content">
    <div class="subtitle">Plan d'action</div>
    <h2>Recommandations</h2>
    <ul class="rec-list" style="margin-top: 32px;">
      ${recList}
    </ul>
  </div>
  <div class="slide-footer">
    <span>${company} · Rapport de Réputation</span>
    <span>${date} · 5/5</span>
  </div>
</div>

</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════
//  EMAIL MODAL
// ═══════════════════════════════════════════════════════════════

interface EmailModalProps {
  onClose: () => void;
  summary: string;
  companyName: string;
}

// EmailModal is conditionally rendered by the parent (only when
// `emailOpen` is true), so it mounts fresh each time the user opens
// it. The `useState` lazy initializers below seed the fields from
// the current `summary` prop + the saved boss-email in localStorage
// — no setState-in-effect needed, and the user's edits are never
// clobbered by a data refresh.
function EmailModal({ onClose, summary, companyName }: EmailModalProps) {
  const [to, setTo] = useState(() => {
    try {
      return localStorage.getItem(BOSS_EMAIL_KEY) || "";
    } catch {
      return "";
    }
  });
  const [subject, setSubject] = useState(
    () => `Rapport de réputation — ${formatDateFR(new Date())}`,
  );
  const [body, setBody] = useState(() => summary);
  const [copied, setCopied] = useState(false);

  // Save email on send
  const handleSend = useCallback(() => {
    try {
      if (to) localStorage.setItem(BOSS_EMAIL_KEY, to);
    } catch {
      /* noop */
    }
    const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  }, [to, subject, body]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = body;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        /* noop */
      }
      document.body.removeChild(ta);
    }
  }, [body]);

  // Escape to close — event listener only, no setState in the
  // effect body (onClose is the parent's state setter, called from
  // an event handler, which is allowed).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Envoyer le résumé par email"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 250,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.surface,
          borderRadius: 12,
          width: "100%",
          maxWidth: 500,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          fontFamily: FONT.sans,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: `1px solid ${C.borderLight}`,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: C.textPrimary,
              }}
            >
              Envoyer par email
            </div>
            <div
              style={{
                fontSize: 12,
                color: C.textSecondary,
                marginTop: 2,
              }}
            >
              Résumé exécutif — {companyName || "Votre entreprise"}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 4,
              color: C.textMuted,
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px" }}>
          {/* To */}
          <label
            htmlFor="pm-email-to"
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 600,
              color: C.textSecondary,
              marginBottom: 6,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            À
          </label>
          <input
            id="pm-email-to"
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="boss@entreprise.com"
            style={{
              width: "100%",
              padding: "10px 12px",
              border: `1px solid ${C.borderLight}`,
              borderRadius: 6,
              fontSize: 14,
              fontFamily: FONT.mono,
              color: C.textPrimary,
              background: C.surface,
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          {/* Subject */}
          <label
            htmlFor="pm-email-subject"
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 600,
              color: C.textSecondary,
              marginBottom: 6,
              marginTop: 16,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Sujet
          </label>
          <input
            id="pm-email-subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: `1px solid ${C.borderLight}`,
              borderRadius: 6,
              fontSize: 14,
              fontFamily: FONT.sans,
              color: C.textPrimary,
              background: C.surface,
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          {/* Body */}
          <label
            htmlFor="pm-email-body"
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 600,
              color: C.textSecondary,
              marginBottom: 6,
              marginTop: 16,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Message
          </label>
          <textarea
            id="pm-email-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={12}
            style={{
              width: "100%",
              padding: "12px",
              border: `1px solid ${C.borderLight}`,
              borderRadius: 6,
              fontSize: 12.5,
              lineHeight: 1.5,
              fontFamily: FONT.mono,
              color: C.textPrimary,
              background: C.surface,
              outline: "none",
              boxSizing: "border-box",
              resize: "vertical",
              minHeight: 200,
            }}
          />
        </div>

        {/* Footer — actions */}
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: "16px 20px",
            borderTop: `1px solid ${C.borderLight}`,
            background: C.surfaceAlt,
          }}
        >
          <button
            type="button"
            onClick={handleCopy}
            style={{
              flex: 1,
              padding: "10px 12px",
              background: C.surface,
              border: `1px solid ${C.borderStrong}`,
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              color: C.textPrimary,
              cursor: "pointer",
              fontFamily: FONT.sans,
            }}
          >
            {copied ? "✓ Copié !" : "Copier le contenu"}
          </button>
          <button
            type="button"
            onClick={handleSend}
            style={{
              flex: 1,
              padding: "10px 12px",
              background: ACCENT,
              border: "none",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              color: "#ffffff",
              cursor: "pointer",
              fontFamily: FONT.sans,
            }}
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN COMPONENT — Floating widget
// ═══════════════════════════════════════════════════════════════

export function PresentationMode() {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const data = usePresentationData();

  // Track mobile breakpoint so the widget switches to full-width bar.
  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < 768);
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const summary = useMemo(() => buildSummary(data), [data]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers / insecure contexts
      const ta = document.createElement("textarea");
      ta.value = summary;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        /* noop */
      }
      document.body.removeChild(ta);
    }
  }, [summary]);

  const handlePpt = useCallback(() => {
    const html = buildPptHtml(data);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeCompany = (data.companyName || "entreprise")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "entreprise";
    const dateSlug = new Date().toISOString().slice(0, 10);
    a.download = `rapport-reputation-${safeCompany}-${dateSlug}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Revoke after a short delay so the download has time to start.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [data]);

  // ─── STYLES ─────────────────────────────────────────────────

  // Collapsed pill — small "Présentation" tab.
  const collapsedStyle: React.CSSProperties = {
    position: "fixed",
    bottom: isMobile ? "calc(68px + env(safe-area-inset-bottom, 0px))" : 24,
    left: isMobile ? 12 : 24,
    right: isMobile ? 12 : "auto",
    zIndex: 100,
    background: C.surface,
    border: `1px solid ${C.borderLight}`,
    borderRadius: 24,
    padding: "10px 16px",
    boxShadow: C.shadowSm,
    fontFamily: FONT.sans,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    fontWeight: 600,
    color: C.textPrimary,
    userSelect: "none",
    transition: "box-shadow 150ms ease",
  };

  // Expanded card — white, 12px radius, 3 buttons.
  const expandedStyle: React.CSSProperties = {
    position: "fixed",
    bottom: isMobile ? "calc(68px + env(safe-area-inset-bottom, 0px))" : 24,
    left: isMobile ? 12 : 24,
    right: isMobile ? 12 : "auto",
    zIndex: 100,
    background: C.surface,
    border: `1px solid ${C.borderLight}`,
    borderRadius: 12,
    boxShadow: C.shadowMd,
    fontFamily: FONT.sans,
    overflow: "hidden",
    width: isMobile ? "auto" : 360,
  };

  const btnBase: React.CSSProperties = {
    flex: 1,
    padding: "12px 8px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontFamily: FONT.sans,
    fontSize: 12,
    fontWeight: 600,
    color: C.textPrimary,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    transition: "background 120ms ease",
    minWidth: 0,
  };

  return (
    <>
      {/* Floating widget — collapsed or expanded */}
      {!expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          style={collapsedStyle}
          aria-label="Ouvrir le mode présentation"
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = C.shadowMd;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = C.shadowSm;
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
          </svg>
          <span>Présentation</span>
        </button>
      ) : (
        <div style={expandedStyle} role="region" aria-label="Mode présentation">
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              borderBottom: `1px solid ${C.borderLight}`,
              background: C.surfaceAlt,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: C.textSecondary,
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              Mode présentation
            </div>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              aria-label="Réduire"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 2,
                color: C.textMuted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 4,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Status line — shows data freshness / loading */}
          <div
            style={{
              padding: "8px 14px",
              fontSize: 11,
              color: C.textMuted,
              fontFamily: FONT.mono,
              borderBottom: `1px solid ${C.borderLight}`,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {data.loading ? (
              <>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: C.warning,
                    display: "inline-block",
                  }}
                />
                Chargement des données…
              </>
            ) : (
              <>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: ACCENT,
                    display: "inline-block",
                  }}
                />
                {data.companyName || "Données prêtes"} ·{" "}
                {new Date().toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </>
            )}
          </div>

          {/* 3 action buttons — row */}
          <div
            style={{
              display: "flex",
              alignItems: "stretch",
            }}
          >
            <button
              type="button"
              onClick={handleCopy}
              disabled={data.loading}
              style={{
                ...btnBase,
                opacity: data.loading ? 0.5 : 1,
                borderRight: `1px solid ${C.borderLight}`,
              }}
              aria-label="Copier le résumé exécutif"
              onMouseEnter={(e) => {
                if (!data.loading) e.currentTarget.style.background = C.surfaceAlt;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>
                {copied ? "✓" : "📋"}
              </span>
              <span>{copied ? "Copié !" : "Copier"}</span>
            </button>

            <button
              type="button"
              onClick={() => setEmailOpen(true)}
              disabled={data.loading}
              style={{
                ...btnBase,
                opacity: data.loading ? 0.5 : 1,
                borderRight: `1px solid ${C.borderLight}`,
              }}
              aria-label="Envoyer par email"
              onMouseEnter={(e) => {
                if (!data.loading) e.currentTarget.style.background = C.surfaceAlt;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>✉</span>
              <span>Email</span>
            </button>

            <button
              type="button"
              onClick={handlePpt}
              disabled={data.loading}
              style={{
                ...btnBase,
                opacity: data.loading ? 0.5 : 1,
              }}
              aria-label="Télécharger la présentation PowerPoint"
              onMouseEnter={(e) => {
                if (!data.loading) e.currentTarget.style.background = C.surfaceAlt;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>📊</span>
              <span>PPT</span>
            </button>
          </div>

          {/* Hint line */}
          <div
            style={{
              padding: "8px 14px",
              fontSize: 10.5,
              color: C.textMuted,
              borderTop: `1px solid ${C.borderLight}`,
              background: C.surfaceAlt,
              lineHeight: 1.4,
            }}
          >
            Résumé exécutif prêt à coller dans un email à votre direction.
          </div>
        </div>
      )}

      {/* EMAIL MODAL — conditionally rendered so it mounts fresh each
          time (the useState lazy initializers seed from the current
          summary prop + saved boss-email). */}
      {emailOpen && (
        <EmailModal
          onClose={() => setEmailOpen(false)}
          summary={summary}
          companyName={data.companyName}
        />
      )}
    </>
  );
}

export default PresentationMode;
