// ═══════════════════════════════════════════════════════════════
//  ReportPDF.tsx — Monthly Intelligence Report (PDF)
//
//  Renders a professional, institutional-grade monthly intelligence
//  report using @react-pdf/renderer. The document is server-side
//  rendered to a buffer by /api/console/reports/[id]/pdf/route.ts
//  and returned as a download.
//
//  Vibe: Palantir / Bloomberg / FT. Light theme, dense tables,
//  monospace KPIs, no emojis, no charts (PDF cannot render SVG
//  reliably — we use simple tables instead).
//
//  Page layout (A4 portrait):
//    1. Cover          — HARCH ATELIER logo, title, period, CONFIDENTIAL
//    2. Executive      — KPIs, top threats, top opportunities
//    3. Sentiment      — breakdown, 30-day table, source distribution
//    4. AI Visibility  — 8 LLM engines table + brand presence summary
//    5. Alerts Log     — all alerts grouped by severity (critical first)
//    6. Recommendations — actionable recommendations
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/stylesheet";

// ─── Types ───────────────────────────────────────────────────────

export interface ReportMetric {
  label: string;
  value: string;
  hint?: string;
}

export interface ReportAlert {
  date: string;
  source: string;
  title: string;
  sentiment: string;
  severity: string;
}

export interface ReportAiEngine {
  engine: string;
  rank: number;
  mentions: number;
  sentiment: string;
}

export interface ReportSentimentDay {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
}

export interface ReportSourceRow {
  source: string;
  articles: number;
  sentiment: string;
}

export interface ReportData {
  report: {
    title: string;
    period: string; // e.g. "2026-07" or "July 2026"
    summary: string;
  };
  user: {
    name: string;
    company: string;
  };
  metrics: {
    reputationScore: number;
    sentimentBreakdown: { positive: number; neutral: number; negative: number };
    alertCount: number;
    aiVisibilityScore: number;
  };
  alerts: ReportAlert[];
  aiEngines: ReportAiEngine[];
  recommendations: string[];
  // Optional enriched sections (populated by the API from `report.sections` JSON):
  sentimentTrend?: ReportSentimentDay[];
  sources?: ReportSourceRow[];
  topThreats?: ReportAlert[];
  topOpportunities?: ReportAlert[];
}

// ─── Font registration (Helvetica is the @react-pdf/renderer default
//     and needs no registration. We use Helvetica family throughout so
//     the document renders identically on every server without any
//     external font fetch.) ────────────────────────────────────────

// ─── Color tokens (light institutional theme) ────────────────────

const COLOR = {
  ink: "#0a0a0a",          // primary text
  body: "#1f1f1f",         // body text
  muted: "#525252",        // secondary text
  faint: "#a3a3a3",        // tertiary
  rule: "#e5e5e5",         // hairline borders
  ruleStrong: "#d4d4d4",   // table borders
  surface: "#fafafa",      // soft fill
  surfaceAlt: "#f4f4f5",   // table zebra
  accent: "#1c1c1c",       // institutional dark (stone-900)
  accentSoft: "#78716c",   // stone-500
  positive: "#15803d",     // green-700
  negative: "#b91c1c",     // red-700
  neutral: "#525252",      // neutral-600
  critical: "#b91c1c",
  high: "#d97706",
  medium: "#a16207",
  low: "#15803d",
  cover: "#0a0a0a",        // cover background
  coverInk: "#fafafa",     // cover foreground
};

// ─── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Cover page — black background, light ink, mono headline
  coverPage: {
    backgroundColor: COLOR.cover,
    color: COLOR.coverInk,
    padding: 56,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.45,
    position: "relative",
    height: "100%",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  coverLogo: {
    fontFamily: "Helvetica-Bold",
    fontSize: 28,
    letterSpacing: 4,
    color: COLOR.coverInk,
  },
  coverLogoSub: {
    fontFamily: "Helvetica",
    fontSize: 9,
    letterSpacing: 6,
    color: "#a3a3a3",
    marginTop: 6,
    textTransform: "uppercase",
  },
  coverWatermark: {
    position: "absolute",
    top: "42%",
    left: 0,
    right: 0,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 96,
    color: "#262626",
    letterSpacing: 14,
    transform: "rotate(-18deg)",
  },
  coverTitleBlock: {
    marginTop: "auto",
  },
  coverEyebrow: {
    fontFamily: "Helvetica",
    fontSize: 9,
    letterSpacing: 4,
    color: "#a3a3a3",
    textTransform: "uppercase",
    marginBottom: 16,
  },
  coverTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 44,
    lineHeight: 1.05,
    color: COLOR.coverInk,
    marginBottom: 12,
  },
  coverPeriod: {
    fontFamily: "Helvetica",
    fontSize: 16,
    color: "#d4d4d4",
    marginBottom: 36,
  },
  coverMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#262626",
    paddingTop: 18,
  },
  coverMetaCol: {
    flexDirection: "column",
  },
  coverMetaLabel: {
    fontFamily: "Helvetica",
    fontSize: 8,
    letterSpacing: 2,
    color: "#737373",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  coverMetaValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: COLOR.coverInk,
  },
  coverFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontFamily: "Helvetica",
    fontSize: 8,
    color: "#525252",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  // Standard content pages
  page: {
    padding: 48,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.5,
    color: COLOR.body,
    backgroundColor: "#ffffff",
  },
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.ink,
    marginBottom: 24,
  },
  pageHeaderLeft: {
    flexDirection: "column",
  },
  pageHeaderEyebrow: {
    fontFamily: "Helvetica",
    fontSize: 8,
    letterSpacing: 2,
    color: COLOR.muted,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  pageHeaderTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 18,
    color: COLOR.ink,
  },
  pageHeaderRight: {
    fontFamily: "Helvetica",
    fontSize: 8,
    color: COLOR.faint,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  pageFooter: {
    position: "absolute",
    bottom: 28,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: COLOR.rule,
    paddingTop: 8,
    fontFamily: "Helvetica",
    fontSize: 8,
    color: COLOR.faint,
    letterSpacing: 1,
  },

  // Section labels
  sectionLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    letterSpacing: 2,
    color: COLOR.ink,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 4,
  },
  sectionSub: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: COLOR.muted,
    marginBottom: 8,
  },

  // KPI grid
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 0,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLOR.rule,
  },
  kpiCell: {
    width: "25%",
    padding: 14,
    borderRightWidth: 1,
    borderRightColor: COLOR.rule,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.rule,
  },
  kpiLabel: {
    fontFamily: "Helvetica",
    fontSize: 7,
    letterSpacing: 1.5,
    color: COLOR.muted,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  kpiValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 22,
    color: COLOR.ink,
    lineHeight: 1,
  },
  kpiHint: {
    fontFamily: "Helvetica",
    fontSize: 8,
    color: COLOR.faint,
    marginTop: 4,
  },

  // Two-column layout
  twoCol: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 20,
  },
  col: {
    flex: 1,
  },
  panel: {
    borderWidth: 1,
    borderColor: COLOR.rule,
    padding: 14,
  },
  panelTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    letterSpacing: 1,
    color: COLOR.ink,
    textTransform: "uppercase",
    marginBottom: 10,
  },

  // Lists
  listItem: {
    flexDirection: "row",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.rule,
  },
  listItemIndex: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: COLOR.accentSoft,
    width: 18,
  },
  listItemBody: {
    flex: 1,
    flexDirection: "column",
  },
  listItemTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: COLOR.ink,
    marginBottom: 2,
  },
  listItemMeta: {
    fontFamily: "Helvetica",
    fontSize: 8,
    color: COLOR.muted,
  },

  // Tables
  table: {
    borderWidth: 1,
    borderColor: COLOR.ruleStrong,
    marginBottom: 16,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: COLOR.surfaceAlt,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.ruleStrong,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLOR.rule,
  },
  tableRowZebra: {
    flexDirection: "row",
    backgroundColor: COLOR.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.rule,
  },
  tableHeaderCell: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    letterSpacing: 1,
    color: COLOR.ink,
    textTransform: "uppercase",
    padding: 8,
  },
  tableCell: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: COLOR.body,
    padding: 8,
  },
  tableCellMono: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: COLOR.ink,
    padding: 8,
  },

  // Sentiment bar
  sentimentBar: {
    flexDirection: "row",
    height: 10,
    marginBottom: 6,
  },
  sentimentBarPositive: { backgroundColor: COLOR.positive },
  sentimentBarNeutral: { backgroundColor: "#d4d4d4" },
  sentimentBarNegative: { backgroundColor: COLOR.negative },

  // Severity pills (text only — pills with borders don't render well in PDF)
  severityCritical: { color: COLOR.critical, fontFamily: "Helvetica-Bold", fontSize: 8, letterSpacing: 1, textTransform: "uppercase" },
  severityHigh: { color: COLOR.high, fontFamily: "Helvetica-Bold", fontSize: 8, letterSpacing: 1, textTransform: "uppercase" },
  severityMedium: { color: COLOR.medium, fontFamily: "Helvetica-Bold", fontSize: 8, letterSpacing: 1, textTransform: "uppercase" },
  severityLow: { color: COLOR.low, fontFamily: "Helvetica-Bold", fontSize: 8, letterSpacing: 1, textTransform: "uppercase" },

  // Recommendations
  recItem: {
    flexDirection: "row",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.rule,
  },
  recIndex: {
    fontFamily: "Helvetica-Bold",
    fontSize: 18,
    color: COLOR.ink,
    width: 36,
    lineHeight: 1,
  },
  recBody: {
    flex: 1,
    flexDirection: "column",
  },
  recText: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLOR.body,
    lineHeight: 1.55,
  },

  // Paragraph
  paragraph: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLOR.body,
    lineHeight: 1.6,
    marginBottom: 12,
  },

  // Summary callout
  callout: {
    borderWidth: 1,
    borderColor: COLOR.ink,
    borderLeftWidth: 4,
    padding: 14,
    marginBottom: 20,
    backgroundColor: COLOR.surface,
  },
  calloutLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    letterSpacing: 2,
    color: COLOR.ink,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  calloutText: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLOR.body,
    lineHeight: 1.6,
  },
});

// ─── Helpers ─────────────────────────────────────────────────────

function formatPeriod(period: string): string {
  // Accept "2026-07" or "July 2026" — pass through if not YYYY-MM
  const m = /^(\d{4})-(\d{2})$/.exec(period);
  if (!m) return period;
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const year = parseInt(m[1], 10);
  const monthIdx = parseInt(m[2], 10) - 1;
  if (monthIdx < 0 || monthIdx > 11) return period;
  return `${months[monthIdx]} ${year}`;
}

function severityStyle(severity: string): Style {
  const s = severity.toLowerCase();
  if (s === "critical") return styles.severityCritical as Style;
  if (s === "high") return styles.severityHigh as Style;
  if (s === "medium") return styles.severityMedium as Style;
  return styles.severityLow as Style;
}

function sentimentColor(label: string): string {
  const s = label.toLowerCase();
  if (s === "positive") return COLOR.positive;
  if (s === "negative") return COLOR.negative;
  return COLOR.muted;
}

// ─── Components ──────────────────────────────────────────────────

function PageFooter({ pageNumber, period }: { pageNumber: number; period: string }) {
  return (
    <View style={styles.pageFooter} fixed>
      <Text>HARCH ATELIER — MONTHLY INTELLIGENCE REPORT — {formatPeriod(period)}</Text>
      <Text>CONFIDENTIAL · PAGE {pageNumber}</Text>
    </View>
  );
}

function PageHeader({ eyebrow, title, period }: { eyebrow: string; title: string; period: string }) {
  return (
    <View style={styles.pageHeader}>
      <View style={styles.pageHeaderLeft}>
        <Text style={styles.pageHeaderEyebrow}>{eyebrow}</Text>
        <Text style={styles.pageHeaderTitle}>{title}</Text>
      </View>
      <Text style={styles.pageHeaderRight}>{formatPeriod(period)}</Text>
    </View>
  );
}

// ─── Cover Page ──────────────────────────────────────────────────

function CoverPage({ data }: { data: ReportData }) {
  const generated = new Date().toISOString().split("T")[0];
  return (
    <Page size="A4" style={styles.coverPage}>
      <Text style={styles.coverWatermark}>CONFIDENTIAL</Text>

      <View>
        <Text style={styles.coverLogo}>HARCH ATELIER</Text>
        <Text style={styles.coverLogoSub}>Intelligence · Reputation · Risk</Text>
      </View>

      <View style={styles.coverTitleBlock}>
        <Text style={styles.coverEyebrow}>{data.report.title}</Text>
        <Text style={styles.coverTitle}>{data.report.title}</Text>
        <Text style={styles.coverPeriod}>{formatPeriod(data.report.period)}</Text>

        <View style={styles.coverMeta}>
          <View style={styles.coverMetaCol}>
            <Text style={styles.coverMetaLabel}>Prepared for</Text>
            <Text style={styles.coverMetaValue}>{data.user.name || "—"}</Text>
            <Text style={[styles.coverMetaValue, { fontWeight: 0, fontSize: 9, color: "#a3a3a3" }]}>
              {data.user.company || "—"}
            </Text>
          </View>
          <View style={styles.coverMetaCol}>
            <Text style={styles.coverMetaLabel}>Generated</Text>
            <Text style={styles.coverMetaValue}>{generated}</Text>
          </View>
          <View style={styles.coverMetaCol}>
            <Text style={styles.coverMetaLabel}>Classification</Text>
            <Text style={styles.coverMetaValue}>CONFIDENTIAL</Text>
          </View>
        </View>
      </View>

      <View style={styles.coverFooter}>
        <Text>HARCH ATELIER · MOROCCO</Text>
        <Text>1 / 6</Text>
      </View>
    </Page>
  );
}

// ─── Executive Summary Page ──────────────────────────────────────

function ExecutiveSummaryPage({ data }: { data: ReportData }) {
  const m = data.metrics;
  const positivePct = m.sentimentBreakdown.positive;
  const negativePct = m.sentimentBreakdown.negative;
  const trend = positivePct > negativePct ? "net-positive" : "net-negative";

  const topThreats = (data.topThreats ?? data.alerts.filter(a => a.severity === "critical" || a.severity === "high")).slice(0, 3);
  const topOpportunities = (data.topOpportunities ?? data.alerts.filter(a => a.sentiment === "positive")).slice(0, 3);

  return (
    <Page size="A4" style={styles.page}>
      <PageHeader eyebrow="Section 01" title="Executive Summary" period={data.report.period} />

      <View style={styles.callout}>
        <Text style={styles.calloutLabel}>Executive Summary</Text>
        <Text style={styles.calloutText}>
          {data.report.summary || `This report consolidates reputation, sentiment, AI visibility and alert telemetry for ${formatPeriod(data.report.period)}. Overall reputation score stands at ${m.reputationScore}, with a ${trend} sentiment profile across ${m.alertCount} flagged signals.`}
        </Text>
      </View>

      <Text style={styles.sectionLabel}>Key Metrics</Text>
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCell}>
          <Text style={styles.kpiLabel}>Reputation Score</Text>
          <Text style={styles.kpiValue}>{m.reputationScore}</Text>
          <Text style={styles.kpiHint}>0 – 100 index</Text>
        </View>
        <View style={styles.kpiCell}>
          <Text style={styles.kpiLabel}>Sentiment Trend</Text>
          <Text style={[styles.kpiValue, { color: trend === "net-positive" ? COLOR.positive : COLOR.negative }]}>
            {trend === "net-positive" ? "+" : "−"}{Math.abs(positivePct - negativePct)}%
          </Text>
          <Text style={styles.kpiHint}>{positivePct}% pos · {negativePct}% neg</Text>
        </View>
        <View style={styles.kpiCell}>
          <Text style={styles.kpiLabel}>Alert Count</Text>
          <Text style={styles.kpiValue}>{m.alertCount}</Text>
          <Text style={styles.kpiHint}>Period total</Text>
        </View>
        <View style={styles.kpiCell}>
          <Text style={styles.kpiLabel}>AI Visibility</Text>
          <Text style={styles.kpiValue}>{m.aiVisibilityScore}%</Text>
          <Text style={styles.kpiHint}>LLM citation rate</Text>
        </View>
      </View>

      <View style={styles.twoCol}>
        <View style={styles.col}>
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Top 3 Threats</Text>
            {topThreats.length === 0 && <Text style={styles.paragraph}>No critical threats detected in this period.</Text>}
            {topThreats.map((a, i) => (
              <View key={i} style={styles.listItem}>
                <Text style={styles.listItemIndex}>{String(i + 1).padStart(2, "0")}</Text>
                <View style={styles.listItemBody}>
                  <Text style={styles.listItemTitle}>{a.title}</Text>
                  <Text style={styles.listItemMeta}>{a.source} · {a.date} · {a.severity.toUpperCase()}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.col}>
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Top 3 Opportunities</Text>
            {topOpportunities.length === 0 && <Text style={styles.paragraph}>No positive opportunities flagged in this period.</Text>}
            {topOpportunities.map((a, i) => (
              <View key={i} style={styles.listItem}>
                <Text style={styles.listItemIndex}>{String(i + 1).padStart(2, "0")}</Text>
                <View style={styles.listItemBody}>
                  <Text style={styles.listItemTitle}>{a.title}</Text>
                  <Text style={styles.listItemMeta}>{a.source} · {a.date}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      <PageFooter pageNumber={2} period={data.report.period} />
    </Page>
  );
}

// ─── Sentiment Analysis Page ─────────────────────────────────────

function SentimentAnalysisPage({ data }: { data: ReportData }) {
  const m = data.metrics.sentimentBreakdown;
  const total = m.positive + m.neutral + m.negative;
  const posPct = total > 0 ? Math.round((m.positive / total) * 100) : 0;
  const neuPct = total > 0 ? Math.round((m.neutral / total) * 100) : 0;
  const negPct = total > 0 ? Math.round((m.negative / total) * 100) : 0;
  const trend = data.sentimentTrend ?? [];

  return (
    <Page size="A4" style={styles.page}>
      <PageHeader eyebrow="Section 02" title="Sentiment Analysis" period={data.report.period} />

      <Text style={styles.sectionLabel}>Sentiment Breakdown</Text>
      <View style={styles.sentimentBar}>
        <View style={[styles.sentimentBarPositive, { width: `${posPct}%` }]} />
        <View style={[styles.sentimentBarNeutral, { width: `${neuPct}%` }]} />
        <View style={[styles.sentimentBarNegative, { width: `${negPct}%` }]} />
      </View>
      <View style={{ flexDirection: "row", gap: 24, marginBottom: 24, fontSize: 9, fontFamily: "Helvetica" }}>
        <Text style={{ color: COLOR.positive }}>{m.positive} positive ({posPct}%)</Text>
        <Text style={{ color: COLOR.muted }}>{m.neutral} neutral ({neuPct}%)</Text>
        <Text style={{ color: COLOR.negative }}>{m.negative} negative ({negPct}%)</Text>
      </View>

      <Text style={styles.sectionLabel}>30-Day Sentiment Trend</Text>
      <Text style={styles.sectionSub}>Daily percentage split of positive / neutral / negative coverage.</Text>
      <View style={styles.table}>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableHeaderCell, { width: "25%" }]}>Date</Text>
          <Text style={[styles.tableHeaderCell, { width: "25%", textAlign: "right" }]}>Positive %</Text>
          <Text style={[styles.tableHeaderCell, { width: "25%", textAlign: "right" }]}>Neutral %</Text>
          <Text style={[styles.tableHeaderCell, { width: "25%", textAlign: "right" }]}>Negative %</Text>
        </View>
        {trend.length === 0 && (
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { width: "100%", color: COLOR.faint }]}>No daily trend data available for this period.</Text>
          </View>
        )}
        {trend.slice(0, 30).map((d, i) => (
          <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowZebra} wrap={false}>
            <Text style={[styles.tableCell, { width: "25%" }]}>{d.date}</Text>
            <Text style={[styles.tableCellMono, { width: "25%", textAlign: "right", color: COLOR.positive }]}>{d.positive}%</Text>
            <Text style={[styles.tableCellMono, { width: "25%", textAlign: "right", color: COLOR.muted }]}>{d.neutral}%</Text>
            <Text style={[styles.tableCellMono, { width: "25%", textAlign: "right", color: COLOR.negative }]}>{d.negative}%</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Source Distribution</Text>
      <View style={styles.table}>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableHeaderCell, { width: "60%" }]}>Source</Text>
          <Text style={[styles.tableHeaderCell, { width: "20%", textAlign: "right" }]}>Articles</Text>
          <Text style={[styles.tableHeaderCell, { width: "20%", textAlign: "right" }]}>Sentiment</Text>
        </View>
        {(data.sources ?? []).length === 0 && (
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { width: "100%", color: COLOR.faint }]}>No source distribution data available.</Text>
          </View>
        )}
        {(data.sources ?? []).slice(0, 12).map((s, i) => (
          <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowZebra} wrap={false}>
            <Text style={[styles.tableCell, { width: "60%" }]}>{s.source}</Text>
            <Text style={[styles.tableCellMono, { width: "20%", textAlign: "right" }]}>{s.articles}</Text>
            <Text style={[styles.tableCellMono, { width: "20%", textAlign: "right", color: sentimentColor(s.sentiment) }]}>
              {s.sentiment.toUpperCase()}
            </Text>
          </View>
        ))}
      </View>

      <PageFooter pageNumber={3} period={data.report.period} />
    </Page>
  );
}

// ─── AI Visibility Page ──────────────────────────────────────────

function AiVisibilityPage({ data }: { data: ReportData }) {
  const engines = data.aiEngines;
  const citedCount = engines.filter(e => e.mentions > 0).length;
  const totalCount = engines.length || 8;

  return (
    <Page size="A4" style={styles.page}>
      <PageHeader eyebrow="Section 03" title="AI Visibility" period={data.report.period} />

      <View style={styles.callout}>
        <Text style={styles.calloutLabel}>Brand Presence Across LLMs</Text>
        <Text style={styles.calloutText}>
          {engines.length === 0
            ? "No AI engine probes were run during this period. The brand's presence across large language models will be measured in the next cycle."
            : `Across ${totalCount} probed AI engines, the brand was cited in ${citedCount} responses (${Math.round((citedCount / totalCount) * 100)}% citation rate). Average rank position and per-engine sentiment are detailed below.`}
        </Text>
      </View>

      <Text style={styles.sectionLabel}>AI Engine Probe Matrix</Text>
      <View style={styles.table}>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableHeaderCell, { width: "35%" }]}>Engine</Text>
          <Text style={[styles.tableHeaderCell, { width: "15%", textAlign: "right" }]}>Rank</Text>
          <Text style={[styles.tableHeaderCell, { width: "20%", textAlign: "right" }]}>Mentions</Text>
          <Text style={[styles.tableHeaderCell, { width: "30%", textAlign: "right" }]}>Sentiment</Text>
        </View>
        {engines.length === 0 && (
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { width: "100%", color: COLOR.faint }]}>No AI engine data available for this period.</Text>
          </View>
        )}
        {engines.map((e, i) => (
          <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowZebra} wrap={false}>
            <Text style={[styles.tableCell, { width: "35%" }]}>{e.engine}</Text>
            <Text style={[styles.tableCellMono, { width: "15%", textAlign: "right" }]}>
              {e.rank > 0 ? `#${e.rank}` : "—"}
            </Text>
            <Text style={[styles.tableCellMono, { width: "20%", textAlign: "right" }]}>{e.mentions}</Text>
            <Text style={[styles.tableCellMono, { width: "30%", textAlign: "right", color: sentimentColor(e.sentiment) }]}>
              {e.sentiment ? e.sentiment.toUpperCase() : "—"}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Summary</Text>
      <Text style={styles.paragraph}>
        The AI Visibility Index measures how consistently large language models cite the brand
        when prompted with category-relevant queries. A citation rate above 60% indicates strong
        LLM presence; below 30% suggests the brand is largely invisible to generative search
        audiences and risks losing share-of-voice as AI-mediated discovery grows.
      </Text>

      <PageFooter pageNumber={4} period={data.report.period} />
    </Page>
  );
}

// ─── Alerts Log Page ─────────────────────────────────────────────

function AlertsLogPage({ data }: { data: ReportData }) {
  // Sort: critical first, then high, medium, low
  const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  const sorted = [...data.alerts].sort((a, b) => {
    const sa = severityOrder[a.severity.toLowerCase()] ?? 9;
    const sb = severityOrder[b.severity.toLowerCase()] ?? 9;
    if (sa !== sb) return sa - sb;
    return a.date < b.date ? 1 : -1;
  });

  return (
    <Page size="A4" style={styles.page}>
      <PageHeader eyebrow="Section 04" title="Alerts Log" period={data.report.period} />

      <Text style={styles.sectionLabel}>All Alerts — Grouped by Severity</Text>
      <Text style={styles.sectionSub}>
        {data.alerts.length} alert(s) recorded during this period. Critical alerts are listed first.
      </Text>

      <View style={styles.table}>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableHeaderCell, { width: "16%" }]}>Date</Text>
          <Text style={[styles.tableHeaderCell, { width: "20%" }]}>Source</Text>
          <Text style={[styles.tableHeaderCell, { width: "34%" }]}>Title</Text>
          <Text style={[styles.tableHeaderCell, { width: "15%" }]}>Sentiment</Text>
          <Text style={[styles.tableHeaderCell, { width: "15%" }]}>Severity</Text>
        </View>
        {sorted.length === 0 && (
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { width: "100%", color: COLOR.faint }]}>
              No alerts recorded for this period.
            </Text>
          </View>
        )}
        {sorted.map((a, i) => (
          <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowZebra} wrap={false}>
            <Text style={[styles.tableCell, { width: "16%" }]}>{a.date}</Text>
            <Text style={[styles.tableCell, { width: "20%" }]}>{a.source}</Text>
            <Text style={[styles.tableCell, { width: "34%" }]}>{a.title}</Text>
            <Text style={[styles.tableCellMono, { width: "15%", color: sentimentColor(a.sentiment) }]}>
              {a.sentiment ? a.sentiment.toUpperCase() : "—"}
            </Text>
            <Text style={[styles.tableCell, { width: "15%" }, severityStyle(a.severity)]}>
              {a.severity.toUpperCase()}
            </Text>
          </View>
        ))}
      </View>

      <PageFooter pageNumber={5} period={data.report.period} />
    </Page>
  );
}

// ─── Recommendations Page ────────────────────────────────────────

function RecommendationsPage({ data }: { data: ReportData }) {
  const recs = data.recommendations && data.recommendations.length > 0
    ? data.recommendations
    : [
        "Continue monitoring high-severity sources weekly and escalate any critical alert within 24 hours.",
        "Increase engagement with positive outlets to amplify favourable coverage.",
        "Address the root causes of negative sentiment clusters identified in the source matrix.",
        "Strengthen AI visibility by publishing structured, authoritative content that LLMs can cite.",
        "Schedule a follow-up review at the start of the next reporting cycle.",
      ];

  return (
    <Page size="A4" style={styles.page}>
      <PageHeader eyebrow="Section 05" title="Recommendations" period={data.report.period} />

      <Text style={styles.sectionLabel}>Actionable Recommendations</Text>
      <Text style={styles.sectionSub}>
        Based on the telemetry collected during this period, the following actions are recommended.
      </Text>

      {recs.map((r, i) => (
        <View key={i} style={styles.recItem}>
          <Text style={styles.recIndex}>{String(i + 1).padStart(2, "0")}</Text>
          <View style={styles.recBody}>
            <Text style={styles.recText}>{r}</Text>
          </View>
        </View>
      ))}

      <View style={{ marginTop: 32, paddingTop: 16, borderTopWidth: 1, borderTopColor: COLOR.rule }}>
        <Text style={[styles.paragraph, { color: COLOR.muted, fontSize: 8, letterSpacing: 1, textTransform: "uppercase" }]}>
          End of report — Harch Atelier Intelligence Desk
        </Text>
      </View>

      <PageFooter pageNumber={6} period={data.report.period} />
    </Page>
  );
}

// ─── Document ────────────────────────────────────────────────────

export function ReportPDF({ data }: { data: ReportData }) {
  return (
    <Document
      title={`${data.report.title} — ${formatPeriod(data.report.period)}`}
      author="Harch Atelier"
      subject="Monthly Intelligence Report"
      creator="Harch Atelier PDF Generator"
      producer="Harch Atelier"
    >
      <CoverPage data={data} />
      <ExecutiveSummaryPage data={data} />
      <SentimentAnalysisPage data={data} />
      <AiVisibilityPage data={data} />
      <AlertsLogPage data={data} />
      <RecommendationsPage data={data} />
    </Document>
  );
}

export default ReportPDF;
