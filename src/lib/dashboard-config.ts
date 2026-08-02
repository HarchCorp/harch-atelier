// ═══════════════════════════════════════════════════════════════
//  DASHBOARD CONFIGURATION ENGINE — Widget templates, layouts, themes
//
//  Manages dashboard templates, widget configurations, layout
//  presets, theme systems, and per-account-type dashboard
//  definitions for all 4 desks (Brand Monitor, Competitor Intel,
//  Investor Desk, Alpha Desk).
// ═══════════════════════════════════════════════════════════════

import type { AccountType, DashboardSection, ChartType } from "@/lib/types/platform";

// ─── TYPES ─────────────────────────────────────────────────────

export interface WidgetDefinition {
  id: string;
  name: string;
  description: string;
  section: DashboardSection;
  chartType: ChartType;
  dataSource: string;
  defaultPosition: { x: number; y: number; w: number; h: number };
  minSize: { w: number; h: number };
  maxSize?: { w: number; h: number };
  refreshInterval: number;
  config?: WidgetConfig;
  permissions?: string[];
  availableFor: AccountType[];
}

export interface WidgetConfig {
  showLegend?: boolean;
  showGrid?: boolean;
  showAxisLabels?: boolean;
  colors?: string[];
  maxItems?: number;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  filter?: Record<string, unknown>;
  format?: "number" | "percentage" | "currency" | "date" | "text";
  precision?: number;
  threshold?: { warning?: number; critical?: number };
  drillDown?: string;
  exportable?: boolean;
}

export interface DashboardLayout {
  id: string;
  name: string;
  accountType: AccountType;
  sections: DashboardSectionConfig[];
  isDefault: boolean;
  isCustom: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSectionConfig {
  section: DashboardSection;
  title: string;
  subtitle?: string;
  visible: boolean;
  order: number;
  widgets: string[];
  layout: "grid" | "list" | "tabs" | "split";
  columns?: number;
  gap?: number;
  padding?: number;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  accountType: AccountType;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borders: ThemeBorders;
  shadows: ThemeShadows;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  borderLight: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textFaint: string;
  textOnDark: string;
  textOnDarkMuted: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
}

export interface ThemeTypography {
  fontFamily: string;
  monoFontFamily: string;
  baseSize: number;
  headingSize: number;
  headingWeight: number;
  bodySize: number;
  bodyWeight: number;
  captionSize: number;
  monoSize: number;
  lineHeight: number;
  letterSpacing: number;
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ThemeBorders {
  radius: number;
  radiusSm: number;
  radiusLg: number;
  width: number;
  widthStrong: number;
}

export interface ThemeShadows {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface DashboardPreset {
  id: string;
  name: string;
  description: string;
  accountType: AccountType;
  layout: string;
  widgets: string[];
  isRecommended: boolean;
}

// ─── WIDGET DEFINITIONS ────────────────────────────────────────

export const WIDGET_DEFINITIONS: WidgetDefinition[] = [
  // ─── BRAND MONITOR WIDGETS ──────────────────────────────────
  {
    id: "widget-reputation-gauge",
    name: "Reputation Score Gauge",
    description: "Circular gauge showing overall reputation score (0-100)",
    section: "weather" as DashboardSection,
    chartType: "gauge" as ChartType,
    dataSource: "/api/console/weather",
    defaultPosition: { x: 0, y: 0, w: 4, h: 3 },
    minSize: { w: 3, h: 2 },
    maxSize: { w: 6, h: 4 },
    refreshInterval: 300000,
    config: { format: "number", precision: 0, threshold: { warning: 60, critical: 40 }, exportable: true },
    availableFor: ["brand-monitor" as AccountType],
  },
  {
    id: "widget-crisis-indicator",
    name: "Crisis Indicator",
    description: "Real-time crisis score with trend indicator",
    section: "weather" as DashboardSection,
    chartType: "gauge" as ChartType,
    dataSource: "/api/console/crisis",
    defaultPosition: { x: 4, y: 0, w: 4, h: 3 },
    minSize: { w: 3, h: 2 },
    refreshInterval: 60000,
    config: { format: "number", threshold: { warning: 30, critical: 60 }, exportable: true },
    availableFor: ["brand-monitor" as AccountType],
  },
  {
    id: "widget-alert-velocity",
    name: "Alert Velocity",
    description: "Rate of new alerts per hour with trend",
    section: "weather" as DashboardSection,
    chartType: "sparkline" as ChartType,
    dataSource: "/api/console/alerts",
    defaultPosition: { x: 8, y: 0, w: 4, h: 3 },
    minSize: { w: 2, h: 2 },
    refreshInterval: 30000,
    config: { format: "number", precision: 2 },
    availableFor: ["brand-monitor" as AccountType],
  },
  {
    id: "widget-sentiment-trend",
    name: "Sentiment Trend",
    description: "30-day sentiment score trend with positive/neutral/negative breakdown",
    section: "sentiment" as DashboardSection,
    chartType: "line" as ChartType,
    dataSource: "/api/console/topics",
    defaultPosition: { x: 0, y: 3, w: 8, h: 4 },
    minSize: { w: 6, h: 3 },
    refreshInterval: 300000,
    config: { showLegend: true, showGrid: true, showAxisLabels: true, format: "percentage", precision: 1, exportable: true },
    availableFor: ["brand-monitor" as AccountType, "market-competitor" as AccountType],
  },
  {
    id: "widget-sentiment-breakdown",
    name: "Sentiment Breakdown",
    description: "Donut chart showing positive/neutral/negative article distribution",
    section: "sentiment" as DashboardSection,
    chartType: "donut" as ChartType,
    dataSource: "/api/console/topics",
    defaultPosition: { x: 8, y: 3, w: 4, h: 4 },
    minSize: { w: 3, h: 3 },
    refreshInterval: 300000,
    config: { showLegend: true, format: "percentage", exportable: true },
    availableFor: ["brand-monitor" as AccountType],
  },
  {
    id: "widget-alert-feed",
    name: "Real-Time Alert Feed",
    description: "Virtualized list of recent alerts with severity badges",
    section: "signals" as DashboardSection,
    chartType: "bar" as ChartType,
    dataSource: "/api/console/alerts",
    defaultPosition: { x: 0, y: 7, w: 6, h: 6 },
    minSize: { w: 4, h: 4 },
    refreshInterval: 15000,
    config: { maxItems: 50, sortField: "publishedAt", sortOrder: "desc", exportable: true },
    availableFor: ["brand-monitor" as AccountType, "market-competitor" as AccountType, "investment-bank" as AccountType],
  },
  {
    id: "widget-multi-source-feed",
    name: "Multi-Source Feed",
    description: "Virtualized article feed from multiple media sources",
    section: "signals" as DashboardSection,
    chartType: "bar" as ChartType,
    dataSource: "/api/console/alerts",
    defaultPosition: { x: 6, y: 7, w: 6, h: 6 },
    minSize: { w: 4, h: 4 },
    refreshInterval: 30000,
    config: { maxItems: 100, sortField: "publishedAt", sortOrder: "desc", exportable: true },
    availableFor: ["brand-monitor" as AccountType],
  },
  {
    id: "widget-ai-visibility-matrix",
    name: "AI Visibility Matrix",
    description: "Table showing citation status across 8 AI engines",
    section: "ai_visibility" as DashboardSection,
    chartType: "bar" as ChartType,
    dataSource: "/api/console/ai-visibility",
    defaultPosition: { x: 0, y: 13, w: 12, h: 5 },
    minSize: { w: 8, h: 4 },
    refreshInterval: 3600000,
    config: { showLegend: true, exportable: true },
    availableFor: ["brand-monitor" as AccountType, "market-competitor" as AccountType],
  },
  {
    id: "widget-geo-cartography",
    name: "Geographic Cartography",
    description: "3D interactive map of coverage by location (deck.gl hexagon layer)",
    section: "signals" as DashboardSection,
    chartType: "bar" as ChartType,
    dataSource: "/api/console/geo-signals",
    defaultPosition: { x: 0, y: 18, w: 8, h: 6 },
    minSize: { w: 6, h: 5 },
    refreshInterval: 600000,
    config: { exportable: false },
    availableFor: ["brand-monitor" as AccountType],
  },
  {
    id: "widget-source-distribution",
    name: "Source Distribution Matrix",
    description: "Heatmap of articles by source and sentiment",
    section: "signals" as DashboardSection,
    chartType: "heatmap" as ChartType,
    dataSource: "/api/console/topics",
    defaultPosition: { x: 8, y: 18, w: 4, h: 6 },
    minSize: { w: 3, h: 4 },
    refreshInterval: 600000,
    config: { showLegend: true, exportable: true },
    availableFor: ["brand-monitor" as AccountType],
  },
  {
    id: "widget-influencer-grid",
    name: "Influencer Grid",
    description: "Grid of top influencers with reach and engagement metrics",
    section: "influencers" as DashboardSection,
    chartType: "bar" as ChartType,
    dataSource: "/api/console/alerts",
    defaultPosition: { x: 0, y: 24, w: 12, h: 5 },
    minSize: { w: 6, h: 4 },
    refreshInterval: 3600000,
    config: { maxItems: 20, sortField: "influenceScore", sortOrder: "desc", exportable: true },
    availableFor: ["brand-monitor" as AccountType, "market-competitor" as AccountType],
  },
  {
    id: "widget-language-distribution",
    name: "Language Distribution",
    description: "Donut chart showing article distribution by detected language",
    section: "sentiment" as DashboardSection,
    chartType: "donut" as ChartType,
    dataSource: "/api/console/topics",
    defaultPosition: { x: 0, y: 29, w: 4, h: 4 },
    minSize: { w: 3, h: 3 },
    refreshInterval: 600000,
    config: { showLegend: true, exportable: true },
    availableFor: ["brand-monitor" as AccountType],
  },
  {
    id: "widget-source-type-breakdown",
    name: "Source Type Breakdown",
    description: "Stacked bar chart of articles by source type per day",
    section: "sentiment" as DashboardSection,
    chartType: "stacked_bar" as ChartType,
    dataSource: "/api/console/topics",
    defaultPosition: { x: 4, y: 29, w: 8, h: 4 },
    minSize: { w: 6, h: 3 },
    refreshInterval: 600000,
    config: { showLegend: true, showGrid: true, exportable: true },
    availableFor: ["brand-monitor" as AccountType],
  },
  {
    id: "widget-brand-health-radar",
    name: "Brand Health Radar",
    description: "9-theme radar chart comparing brand vs. industry average",
    section: "sentiment" as DashboardSection,
    chartType: "radar" as ChartType,
    dataSource: "/api/console/weather",
    defaultPosition: { x: 0, y: 33, w: 6, h: 5 },
    minSize: { w: 4, h: 4 },
    refreshInterval: 3600000,
    config: { showLegend: true, exportable: true },
    availableFor: ["brand-monitor" as AccountType],
  },
  {
    id: "widget-share-of-voice",
    name: "Share of Voice",
    description: "Bar chart showing share of conversation vs. competitors",
    section: "sentiment" as DashboardSection,
    chartType: "bar" as ChartType,
    dataSource: "/api/console/weather",
    defaultPosition: { x: 6, y: 33, w: 6, h: 5 },
    minSize: { w: 4, h: 3 },
    refreshInterval: 3600000,
    config: { showLegend: true, format: "percentage", exportable: true },
    availableFor: ["brand-monitor" as AccountType, "market-competitor" as AccountType],
  },

  // ─── COMPETITOR INTEL WIDGETS ───────────────────────────────
  {
    id: "widget-neighbor-index",
    name: "Neighbor Index",
    description: "Competitor reputation scores ranked side-by-side",
    section: "signals" as DashboardSection,
    chartType: "bar" as ChartType,
    dataSource: "/api/console/neighbors",
    defaultPosition: { x: 0, y: 0, w: 8, h: 5 },
    minSize: { w: 6, h: 4 },
    refreshInterval: 3600000,
    config: { maxItems: 10, sortField: "score", sortOrder: "desc", exportable: true },
    availableFor: ["market-competitor" as AccountType],
  },
  {
    id: "widget-vulnerability-scorecard",
    name: "Vulnerability Scorecard",
    description: "Dense virtualized table of competitor vulnerability metrics",
    section: "signals" as DashboardSection,
    chartType: "bar" as ChartType,
    dataSource: "/api/console/neighbors",
    defaultPosition: { x: 8, y: 0, w: 4, h: 5 },
    minSize: { w: 3, h: 4 },
    refreshInterval: 3600000,
    config: { maxItems: 50, exportable: true },
    availableFor: ["market-competitor" as AccountType],
  },
  {
    id: "widget-war-room",
    name: "War Room Split",
    description: "Split-screen view of competitor moves and market signals",
    section: "signals" as DashboardSection,
    chartType: "bar" as ChartType,
    dataSource: "/api/console/neighbors",
    defaultPosition: { x: 0, y: 5, w: 12, h: 6 },
    minSize: { w: 8, h: 5 },
    refreshInterval: 300000,
    config: { exportable: false },
    availableFor: ["market-competitor" as AccountType],
  },
  {
    id: "widget-narrative-tracker",
    name: "Narrative Tracker",
    description: "Timeline of emerging narratives and their velocity",
    section: "signals" as DashboardSection,
    chartType: "line" as ChartType,
    dataSource: "/api/console/narratives",
    defaultPosition: { x: 0, y: 11, w: 12, h: 5 },
    minSize: { w: 8, h: 4 },
    refreshInterval: 600000,
    config: { showLegend: true, showGrid: true, exportable: true },
    availableFor: ["market-competitor" as AccountType],
  },
  {
    id: "widget-campaign-impact",
    name: "Campaign Impact",
    description: "Before/after comparison of PR campaign effectiveness",
    section: "signals" as DashboardSection,
    chartType: "bar" as ChartType,
    dataSource: "/api/console/alerts",
    defaultPosition: { x: 0, y: 16, w: 6, h: 5 },
    minSize: { w: 4, h: 4 },
    refreshInterval: 3600000,
    config: { showLegend: true, exportable: true },
    availableFor: ["market-competitor" as AccountType],
  },
  {
    id: "widget-bad-buzz-monitor",
    name: "Bad Buzz Monitor",
    description: "Real-time monitoring of negative social media mentions",
    section: "signals" as DashboardSection,
    chartType: "line" as ChartType,
    dataSource: "/api/console/alerts",
    defaultPosition: { x: 6, y: 16, w: 6, h: 5 },
    minSize: { w: 4, h: 4 },
    refreshInterval: 60000,
    config: { showLegend: true, threshold: { warning: 10, critical: 25 }, exportable: true },
    availableFor: ["market-competitor" as AccountType],
  },

  // ─── INVESTOR DESK WIDGETS ──────────────────────────────────
  {
    id: "widget-screening-panel",
    name: "Sanctions Screening Panel",
    description: "Real-time OFAC/EU/UN sanctions screening interface",
    section: "screening" as DashboardSection,
    chartType: "bar" as ChartType,
    dataSource: "/api/investor/screen",
    defaultPosition: { x: 0, y: 0, w: 12, h: 6 },
    minSize: { w: 8, h: 5 },
    refreshInterval: 0,
    config: { exportable: true },
    availableFor: ["investment-bank" as AccountType],
  },
  {
    id: "widget-dossier-generator",
    name: "DD Dossier Generator",
    description: "AI-powered due diligence dossier generation",
    section: "dossiers" as DashboardSection,
    chartType: "bar" as ChartType,
    dataSource: "/api/investor/dossiers",
    defaultPosition: { x: 0, y: 6, w: 6, h: 6 },
    minSize: { w: 4, h: 5 },
    refreshInterval: 0,
    config: { exportable: true },
    availableFor: ["investment-bank" as AccountType],
  },
  {
    id: "widget-compliance-feed",
    name: "Regulatory Compliance Feed",
    description: "AMMC, BAM, BVC regulatory press releases feed",
    section: "compliance" as DashboardSection,
    chartType: "bar" as ChartType,
    dataSource: "/api/console/regulatory",
    defaultPosition: { x: 6, y: 6, w: 6, h: 6 },
    minSize: { w: 4, h: 4 },
    refreshInterval: 300000,
    config: { maxItems: 30, sortField: "publishedAt", sortOrder: "desc", exportable: true },
    availableFor: ["investment-bank" as AccountType],
  },
  {
    id: "widget-risk-matrix",
    name: "Risk Matrix",
    description: "Interactive 32-category risk heatmap (React Flow)",
    section: "risk_map" as DashboardSection,
    chartType: "heatmap" as ChartType,
    dataSource: "/api/console/crisis",
    defaultPosition: { x: 0, y: 12, w: 8, h: 6 },
    minSize: { w: 6, h: 5 },
    refreshInterval: 600000,
    config: { showLegend: true, exportable: true },
    availableFor: ["investment-bank" as AccountType],
  },
  {
    id: "widget-red-flags",
    name: "Red Flags Dashboard",
    description: "Critical risk alerts requiring immediate attention",
    section: "red_flags" as DashboardSection,
    chartType: "bar" as ChartType,
    dataSource: "/api/console/alerts",
    defaultPosition: { x: 8, y: 12, w: 4, h: 6 },
    minSize: { w: 3, h: 5 },
    refreshInterval: 30000,
    config: { maxItems: 20, threshold: { critical: 70 }, exportable: true },
    availableFor: ["investment-bank" as AccountType],
  },

  // ─── ALPHA DESK WIDGETS ─────────────────────────────────────
  {
    id: "widget-price-tape",
    name: "Price Tape",
    description: "Real-time scrolling price ticker for BVC assets",
    section: "pulse" as DashboardSection,
    chartType: "sparkline" as ChartType,
    dataSource: "/api/trader/stream",
    defaultPosition: { x: 0, y: 0, w: 12, h: 2 },
    minSize: { w: 8, h: 2 },
    refreshInterval: 1000,
    config: { format: "number", precision: 2 },
    availableFor: ["harch-alpha" as AccountType],
  },
  {
    id: "widget-signal-board",
    name: "Signal Board",
    description: "AI-generated trading signals with confidence scores",
    section: "signals" as DashboardSection,
    chartType: "bar" as ChartType,
    dataSource: "/api/trader/stats",
    defaultPosition: { x: 0, y: 2, w: 8, h: 5 },
    minSize: { w: 6, h: 4 },
    refreshInterval: 60000,
    config: { maxItems: 15, exportable: true },
    availableFor: ["harch-alpha" as AccountType],
  },
  {
    id: "widget-depth-view",
    name: "Market Depth",
    description: "Order book visualization with bid/ask spread",
    section: "depth" as DashboardSection,
    chartType: "bar" as ChartType,
    dataSource: "/api/trader/stream",
    defaultPosition: { x: 8, y: 2, w: 4, h: 5 },
    minSize: { w: 3, h: 4 },
    refreshInterval: 2000,
    config: { format: "number", precision: 2 },
    availableFor: ["harch-alpha" as AccountType],
  },
  {
    id: "widget-price-chart",
    name: "Price Chart",
    description: "Candlestick chart with technical indicators",
    section: "pulse" as DashboardSection,
    chartType: "candlestick" as ChartType,
    dataSource: "/api/trader/assets",
    defaultPosition: { x: 0, y: 7, w: 8, h: 6 },
    minSize: { w: 6, h: 5 },
    refreshInterval: 5000,
    config: { showGrid: true, showAxisLabels: true, exportable: true },
    availableFor: ["harch-alpha" as AccountType],
  },
  {
    id: "watchlist-signals",
    name: "Watchlist Signals",
    description: "Custom watchlist with real-time signal alerts",
    section: "signals" as DashboardSection,
    chartType: "sparkline" as ChartType,
    dataSource: "/api/trader/stats",
    defaultPosition: { x: 8, y: 7, w: 4, h: 6 },
    minSize: { w: 3, h: 5 },
    refreshInterval: 5000,
    config: { maxItems: 10, format: "percentage", precision: 2 },
    availableFor: ["harch-alpha" as AccountType],
  },
  {
    id: "widget-portfolio-tracker",
    name: "Portfolio Tracker",
    description: "Real-time portfolio performance with P&L",
    section: "positions" as DashboardSection,
    chartType: "bar" as ChartType,
    dataSource: "/api/trader/stats",
    defaultPosition: { x: 0, y: 13, w: 12, h: 5 },
    minSize: { w: 8, h: 4 },
    refreshInterval: 10000,
    config: { format: "currency", precision: 2, exportable: true },
    availableFor: ["harch-alpha" as AccountType],
  },
  {
    id: "widget-correlation-matrix",
    name: "Correlation Matrix",
    description: "Asset correlation heatmap for portfolio diversification",
    section: "positions" as DashboardSection,
    chartType: "heatmap" as ChartType,
    dataSource: "/api/trader/assets",
    defaultPosition: { x: 0, y: 18, w: 6, h: 5 },
    minSize: { w: 4, h: 4 },
    refreshInterval: 60000,
    config: { showLegend: true, exportable: true },
    availableFor: ["harch-alpha" as AccountType],
  },
  {
    id: "widget-alert-thresholds",
    name: "Price Alert Thresholds",
    description: "Configurable price alert thresholds with trigger status",
    section: "alerts" as DashboardSection,
    chartType: "bar" as ChartType,
    dataSource: "/api/trader/stats",
    defaultPosition: { x: 6, y: 18, w: 6, h: 5 },
    minSize: { w: 4, h: 4 },
    refreshInterval: 5000,
    config: { format: "number", precision: 2, exportable: true },
    availableFor: ["harch-alpha" as AccountType],
  },
];

// ─── THEME DEFINITIONS ────────────────────────────────────────

export const THEME_DEFINITIONS: ThemeDefinition[] = [
  {
    id: "theme-brand-monitor",
    name: "Brand Monitor — The Calm Shield",
    accountType: "brand-monitor" as AccountType,
    colors: {
      primary: "#4A7B5F",
      secondary: "#6FA386",
      accent: "#4A5D6E",
      background: "#FAFAFA",
      surface: "#FFFFFF",
      surfaceAlt: "#F4F4F5",
      border: "#E5E5E5",
      borderLight: "#F0F0F0",
      text: "#0A0A0A",
      textSecondary: "#525252",
      textMuted: "#71717A",
      textFaint: "#A1A1AA",
      textOnDark: "#FAFAFA",
      textOnDarkMuted: "#A3A3A3",
      success: "#059669",
      warning: "#D97706",
      danger: "#DC2626",
      info: "#0369A1",
    },
    typography: {
      fontFamily: "Inter, sans-serif",
      monoFontFamily: "JetBrains Mono, monospace",
      baseSize: 14,
      headingSize: 28,
      headingWeight: 800,
      bodySize: 14,
      bodyWeight: 400,
      captionSize: 11,
      monoSize: 10,
      lineHeight: 1.5,
      letterSpacing: -0.01,
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
    borders: { radius: 8, radiusSm: 4, radiusLg: 12, width: 1, widthStrong: 2 },
    shadows: {
      sm: "0 1px 3px rgba(0,0,0,0.04)",
      md: "0 4px 12px rgba(0,0,0,0.04)",
      lg: "0 8px 24px rgba(0,0,0,0.08)",
      xl: "0 16px 48px rgba(0,0,0,0.12)",
    },
  },
  {
    id: "theme-competitor-intel",
    name: "Competitor Intel — The Predator Radar",
    accountType: "market-competitor" as AccountType,
    colors: {
      primary: "#856914",
      secondary: "#B87333",
      accent: "#A0524B",
      background: "#1A1A1A",
      surface: "#222222",
      surfaceAlt: "#2A2A2A",
      border: "#333333",
      borderLight: "#2A2A2A",
      text: "#FAFAFA",
      textSecondary: "#A3A3A3",
      textMuted: "#71717A",
      textFaint: "#525252",
      textOnDark: "#FAFAFA",
      textOnDarkMuted: "#A3A3A3",
      success: "#059669",
      warning: "#D97706",
      danger: "#DC2626",
      info: "#0369A1",
    },
    typography: {
      fontFamily: "Inter, sans-serif",
      monoFontFamily: "JetBrains Mono, monospace",
      baseSize: 13,
      headingSize: 26,
      headingWeight: 800,
      bodySize: 13,
      bodyWeight: 400,
      captionSize: 10,
      monoSize: 10,
      lineHeight: 1.45,
      letterSpacing: -0.01,
    },
    spacing: { xs: 4, sm: 8, md: 12, lg: 20, xl: 28, xxl: 40 },
    borders: { radius: 6, radiusSm: 3, radiusLg: 10, width: 1, widthStrong: 2 },
    shadows: {
      sm: "0 1px 3px rgba(0,0,0,0.2)",
      md: "0 4px 12px rgba(0,0,0,0.3)",
      lg: "0 8px 24px rgba(0,0,0,0.4)",
      xl: "0 16px 48px rgba(0,0,0,0.5)",
    },
  },
  {
    id: "theme-investor-desk",
    name: "Investor Desk — The Forensic Terminal",
    accountType: "investment-bank" as AccountType,
    colors: {
      primary: "#0369A1",
      secondary: "#0EA5E9",
      accent: "#4A5D6E",
      background: "#0A0A0A",
      surface: "#171717",
      surfaceAlt: "#1F1F1F",
      border: "#262626",
      borderLight: "#1F1F1F",
      text: "#FAFAFA",
      textSecondary: "#A3A3A3",
      textMuted: "#71717A",
      textFaint: "#525252",
      textOnDark: "#FAFAFA",
      textOnDarkMuted: "#A3A3A3",
      success: "#059669",
      warning: "#D97706",
      danger: "#DC2626",
      info: "#0369A1",
    },
    typography: {
      fontFamily: "Inter, sans-serif",
      monoFontFamily: "JetBrains Mono, monospace",
      baseSize: 13,
      headingSize: 24,
      headingWeight: 800,
      bodySize: 13,
      bodyWeight: 400,
      captionSize: 10,
      monoSize: 11,
      lineHeight: 1.4,
      letterSpacing: 0,
    },
    spacing: { xs: 4, sm: 6, md: 12, lg: 16, xl: 24, xxl: 32 },
    borders: { radius: 4, radiusSm: 2, radiusLg: 8, width: 1, widthStrong: 2 },
    shadows: {
      sm: "0 1px 2px rgba(0,0,0,0.3)",
      md: "0 2px 8px rgba(0,0,0,0.4)",
      lg: "0 4px 16px rgba(0,0,0,0.5)",
      xl: "0 8px 32px rgba(0,0,0,0.6)",
    },
  },
  {
    id: "theme-alpha-desk",
    name: "Alpha Desk — The Quant Cockpit",
    accountType: "harch-alpha" as AccountType,
    colors: {
      primary: "#7C3AED",
      secondary: "#A78BFA",
      accent: "#BE185D",
      background: "#0A0A0A",
      surface: "#131313",
      surfaceAlt: "#1A1A1A",
      border: "#262626",
      borderLight: "#1A1A1A",
      text: "#FAFAFA",
      textSecondary: "#A3A3A3",
      textMuted: "#71717A",
      textFaint: "#525252",
      textOnDark: "#FAFAFA",
      textOnDarkMuted: "#A3A3A3",
      success: "#059669",
      warning: "#D97706",
      danger: "#DC2626",
      info: "#0369A1",
    },
    typography: {
      fontFamily: "Inter, sans-serif",
      monoFontFamily: "JetBrains Mono, monospace",
      baseSize: 12,
      headingSize: 22,
      headingWeight: 800,
      bodySize: 12,
      bodyWeight: 400,
      captionSize: 9,
      monoSize: 11,
      lineHeight: 1.35,
      letterSpacing: 0,
    },
    spacing: { xs: 2, sm: 4, md: 8, lg: 12, xl: 16, xxl: 24 },
    borders: { radius: 4, radiusSm: 2, radiusLg: 6, width: 1, widthStrong: 1 },
    shadows: {
      sm: "0 1px 2px rgba(0,0,0,0.3)",
      md: "0 2px 8px rgba(0,0,0,0.4)",
      lg: "0 4px 16px rgba(0,0,0,0.5)",
      xl: "0 8px 32px rgba(0,0,0,0.6)",
    },
  },
];

// ─── DEFAULT LAYOUTS ───────────────────────────────────────────

export const DEFAULT_LAYOUTS: DashboardLayout[] = [
  {
    id: "layout-brand-monitor-full",
    name: "Full View",
    accountType: "brand-monitor" as AccountType,
    isDefault: true,
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: [
      { section: "weather" as DashboardSection, title: "Weather", visible: true, order: 0, widgets: ["widget-reputation-gauge", "widget-crisis-indicator", "widget-alert-velocity"], layout: "grid", columns: 3, gap: 16, padding: 16 },
      { section: "signals" as DashboardSection, title: "Signals", visible: true, order: 1, widgets: ["widget-alert-feed", "widget-multi-source-feed"], layout: "grid", columns: 2, gap: 16, padding: 16 },
      { section: "sentiment" as DashboardSection, title: "Sentiment", visible: true, order: 2, widgets: ["widget-sentiment-trend", "widget-sentiment-breakdown", "widget-language-distribution", "widget-source-type-breakdown", "widget-brand-health-radar", "widget-share-of-voice"], layout: "grid", columns: 3, gap: 16, padding: 16 },
      { section: "ai_visibility" as DashboardSection, title: "AI Visibility", visible: true, order: 3, widgets: ["widget-ai-visibility-matrix"], layout: "grid", columns: 1, gap: 16, padding: 16 },
      { section: "influencers" as DashboardSection, title: "Influencers", visible: true, order: 4, widgets: ["widget-influencer-grid"], layout: "grid", columns: 1, gap: 16, padding: 16 },
      { section: "reports" as DashboardSection, title: "Reports", visible: true, order: 5, widgets: [], layout: "list", gap: 16, padding: 16 },
    ],
  },
  {
    id: "layout-competitor-intel-full",
    name: "Battlefield",
    accountType: "market-competitor" as AccountType,
    isDefault: true,
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: [
      { section: "signals" as DashboardSection, title: "Intel", visible: true, order: 0, widgets: ["widget-neighbor-index", "widget-vulnerability-scorecard", "widget-war-room"], layout: "grid", columns: 2, gap: 12, padding: 12 },
      { section: "sentiment" as DashboardSection, title: "Sentiment", visible: true, order: 1, widgets: ["widget-sentiment-trend", "widget-share-of-voice"], layout: "grid", columns: 2, gap: 12, padding: 12 },
      { section: "ai_visibility" as DashboardSection, title: "AI Visibility", visible: true, order: 2, widgets: ["widget-ai-visibility-matrix"], layout: "grid", columns: 1, gap: 12, padding: 12 },
      { section: "influencers" as DashboardSection, title: "Influencers", visible: true, order: 3, widgets: ["widget-influencer-grid"], layout: "grid", columns: 1, gap: 12, padding: 12 },
      { section: "alerts" as DashboardSection, title: "Bad Buzz", visible: true, order: 4, widgets: ["widget-bad-buzz-monitor", "widget-campaign-impact"], layout: "grid", columns: 2, gap: 12, padding: 12 },
      { section: "reports" as DashboardSection, title: "Reports", visible: true, order: 5, widgets: [], layout: "list", gap: 12, padding: 12 },
    ],
  },
  {
    id: "layout-investor-desk-full",
    name: "Forensic Terminal",
    accountType: "investment-bank" as AccountType,
    isDefault: true,
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: [
      { section: "screening" as DashboardSection, title: "Screening", visible: true, order: 0, widgets: ["widget-screening-panel"], layout: "grid", columns: 1, gap: 8, padding: 12 },
      { section: "dossiers" as DashboardSection, title: "Dossiers", visible: true, order: 1, widgets: ["widget-dossier-generator"], layout: "grid", columns: 1, gap: 8, padding: 12 },
      { section: "compliance" as DashboardSection, title: "Compliance", visible: true, order: 2, widgets: ["widget-compliance-feed"], layout: "grid", columns: 1, gap: 8, padding: 12 },
      { section: "risk_map" as DashboardSection, title: "Risk Map", visible: true, order: 3, widgets: ["widget-risk-matrix", "widget-red-flags"], layout: "grid", columns: 2, gap: 8, padding: 12 },
      { section: "regulatory" as DashboardSection, title: "Regulatory", visible: true, order: 4, widgets: ["widget-compliance-feed"], layout: "list", gap: 8, padding: 12 },
      { section: "red_flags" as DashboardSection, title: "Red Flags", visible: true, order: 5, widgets: ["widget-red-flags"], layout: "list", gap: 8, padding: 12 },
    ],
  },
  {
    id: "layout-alpha-desk-full",
    name: "Quant Cockpit",
    accountType: "harch-alpha" as AccountType,
    isDefault: true,
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: [
      { section: "pulse" as DashboardSection, title: "Pulse", visible: true, order: 0, widgets: ["widget-price-tape", "widget-price-chart"], layout: "grid", columns: 1, gap: 4, padding: 8 },
      { section: "signals" as DashboardSection, title: "Signal", visible: true, order: 1, widgets: ["widget-signal-board", "watchlist-signals"], layout: "grid", columns: 2, gap: 4, padding: 8 },
      { section: "depth" as DashboardSection, title: "Depth", visible: true, order: 2, widgets: ["widget-depth-view"], layout: "grid", columns: 1, gap: 4, padding: 8 },
      { section: "alerts" as DashboardSection, title: "Alerts", visible: true, order: 3, widgets: ["widget-alert-thresholds"], layout: "grid", columns: 1, gap: 4, padding: 8 },
      { section: "positions" as DashboardSection, title: "Positions", visible: true, order: 4, widgets: ["widget-portfolio-tracker", "widget-correlation-matrix"], layout: "grid", columns: 2, gap: 4, padding: 8 },
    ],
  },
];

// ─── DASHBOARD PRESETS ────────────────────────────────────────

export const DASHBOARD_PRESETS: DashboardPreset[] = [
  {
    id: "preset-bm-overview",
    name: "Overview",
    description: "Quick snapshot of brand health and recent alerts",
    accountType: "brand-monitor" as AccountType,
    layout: "layout-brand-monitor-full",
    widgets: ["widget-reputation-gauge", "widget-crisis-indicator", "widget-alert-feed", "widget-sentiment-trend"],
    isRecommended: true,
  },
  {
    id: "preset-bm-deep-dive",
    name: "Deep Dive",
    description: "Full analysis with all widgets visible",
    accountType: "brand-monitor" as AccountType,
    layout: "layout-brand-monitor-full",
    widgets: WIDGET_DEFINITIONS.filter(w => w.availableFor.includes("brand-monitor" as AccountType)).map(w => w.id),
    isRecommended: false,
  },
  {
    id: "preset-ci-battlefield",
    name: "Battlefield",
    description: "Competitor intelligence war room view",
    accountType: "market-competitor" as AccountType,
    layout: "layout-competitor-intel-full",
    widgets: ["widget-neighbor-index", "widget-vulnerability-scorecard", "widget-war-room", "widget-narrative-tracker"],
    isRecommended: true,
  },
  {
    id: "preset-id-forensic",
    name: "Forensic",
    description: "Due diligence and compliance screening view",
    accountType: "investment-bank" as AccountType,
    layout: "layout-investor-desk-full",
    widgets: ["widget-screening-panel", "widget-dossier-generator", "widget-compliance-feed", "widget-risk-matrix"],
    isRecommended: true,
  },
  {
    id: "preset-ad-cockpit",
    name: "Cockpit",
    description: "Trading dashboard with real-time prices and signals",
    accountType: "harch-alpha" as AccountType,
    layout: "layout-alpha-desk-full",
    widgets: ["widget-price-tape", "widget-price-chart", "widget-signal-board", "widget-depth-view", "widget-portfolio-tracker"],
    isRecommended: true,
  },
];

// ─── HELPER FUNCTIONS ──────────────────────────────────────────

export function getWidgetById(id: string): WidgetDefinition | undefined {
  return WIDGET_DEFINITIONS.find(w => w.id === id);
}

export function getWidgetsByAccountType(accountType: AccountType): WidgetDefinition[] {
  return WIDGET_DEFINITIONS.filter(w => w.availableFor.includes(accountType));
}

export function getWidgetsBySection(section: DashboardSection, accountType: AccountType): WidgetDefinition[] {
  return WIDGET_DEFINITIONS.filter(w => w.section === section && w.availableFor.includes(accountType));
}

export function getDefaultLayout(accountType: AccountType): DashboardLayout | undefined {
  return DEFAULT_LAYOUTS.find(l => l.accountType === accountType && l.isDefault);
}

export function getLayoutById(id: string): DashboardLayout | undefined {
  return DEFAULT_LAYOUTS.find(l => l.id === id);
}

export function getLayoutsByAccountType(accountType: AccountType): DashboardLayout[] {
  return DEFAULT_LAYOUTS.filter(l => l.accountType === accountType);
}

export function getThemeByAccountType(accountType: AccountType): ThemeDefinition | undefined {
  return THEME_DEFINITIONS.find(t => t.accountType === accountType);
}

export function getThemeById(id: string): ThemeDefinition | undefined {
  return THEME_DEFINITIONS.find(t => t.id === id);
}

export function getPresetsByAccountType(accountType: AccountType): DashboardPreset[] {
  return DASHBOARD_PRESETS.filter(p => p.accountType === accountType);
}

export function getRecommendedPreset(accountType: AccountType): DashboardPreset | undefined {
  return DASHBOARD_PRESETS.find(p => p.accountType === accountType && p.isRecommended);
}

export function getTotalWidgetCount(): number {
  return WIDGET_DEFINITIONS.length;
}

export function getTotalLayoutCount(): number {
  return DEFAULT_LAYOUTS.length;
}

export function getTotalThemeCount(): number {
  return THEME_DEFINITIONS.length;
}

export function getTotalPresetCount(): number {
  return DASHBOARD_PRESETS.length;
}

export function getDashboardStats(): {
  widgets: number;
  layouts: number;
  themes: number;
  presets: number;
  byAccountType: Record<string, { widgets: number; layouts: number; presets: number }>;
} {
  const accountTypes: AccountType[] = ["brand-monitor" as AccountType, "market-competitor" as AccountType, "investment-bank" as AccountType, "harch-alpha" as AccountType];
  const byAccountType: Record<string, { widgets: number; layouts: number; presets: number }> = {};

  for (const at of accountTypes) {
    byAccountType[at] = {
      widgets: getWidgetsByAccountType(at).length,
      layouts: getLayoutsByAccountType(at).length,
      presets: getPresetsByAccountType(at).length,
    };
  }

  return {
    widgets: WIDGET_DEFINITIONS.length,
    layouts: DEFAULT_LAYOUTS.length,
    themes: THEME_DEFINITIONS.length,
    presets: DASHBOARD_PRESETS.length,
    byAccountType,
  };
}
