// ═══════════════════════════════════════════════════════════════
//  DATA FORMATTING & TRANSFORMATION LIBRARY
//
//  Comprehensive utilities for formatting, transforming, and
//  displaying data across the Harch Atelier platform.
//  Includes: number formatting, date formatting, currency
//  formatting, text utilities, color utilities, chart data
//  transformation, and data export helpers.
// ═══════════════════════════════════════════════════════════════

import type { SentimentLabel, RiskLevel, AlertSeverity, Language } from "@/lib/types/platform";

// ─── NUMBER FORMATTING ─────────────────────────────────────────

export function formatNumber(value: number, options?: {
  decimals?: number;
  thousandsSeparator?: string;
  decimalSeparator?: string;
  compact?: boolean;
  prefix?: string;
  suffix?: string;
}): string {
  if (isNaN(value) || value === null || value === undefined) return "—";
  
  const { decimals = 2, thousandsSeparator = ",", decimalSeparator = ".", compact = false, prefix = "", suffix = "" } = options || {};
  
  let formatted: string;
  
  if (compact) {
    formatted = formatCompactNumber(value, decimals);
  } else {
    const fixed = value.toFixed(decimals);
    const [intPart, decPart] = fixed.split(".");
    const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
    formatted = decPart ? `${withThousands}${decimalSeparator}${decPart}` : withThousands;
  }
  
  return `${prefix}${formatted}${suffix}`;
}

export function formatCompactNumber(value: number, decimals: number = 1): string {
  const abs = Math.abs(value);
  
  if (abs >= 1e12) return `${(value / 1e12).toFixed(decimals)}T`;
  if (abs >= 1e9) return `${(value / 1e9).toFixed(decimals)}B`;
  if (abs >= 1e6) return `${(value / 1e6).toFixed(decimals)}M`;
  if (abs >= 1e3) return `${(value / 1e3).toFixed(decimals)}K`;
  
  return value.toFixed(0);
}

export function formatPercentage(value: number, decimals: number = 1, withSign: boolean = false): string {
  if (isNaN(value)) return "—";
  const formatted = (value * 100).toFixed(decimals);
  const sign = withSign && value > 0 ? "+" : "";
  return `${sign}${formatted}%`;
}

export function formatCurrency(value: number, currency: string = "MAD", options?: {
  decimals?: number;
  compact?: boolean;
  locale?: string;
}): string {
  if (isNaN(value)) return "—";
  
  const { decimals = 2, compact = false, locale } = options || {};
  
  const currencySymbols: Record<string, string> = {
    MAD: "DH",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    CHF: "CHF",
    CAD: "C$",
    AUD: "A$",
  };
  
  const symbol = currencySymbols[currency] || currency;
  
  if (compact) {
    return `${symbol} ${formatCompactNumber(value, decimals)}`;
  }
  
  return `${symbol} ${formatNumber(value, { decimals, prefix: "", suffix: "" })}`;
}

export function formatFileSize(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return "0 B";
  if (isNaN(bytes)) return "—";
  
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  if (min < 60) return `${min}m ${sec}s`;
  const hr = Math.floor(min / 60);
  const remMin = min % 60;
  if (hr < 24) return `${hr}h ${remMin}m`;
  const days = Math.floor(hr / 24);
  const remHr = hr % 24;
  return `${days}d ${remHr}h`;
}

export function formatLatency(ms: number): string {
  if (ms < 1) return "<1ms";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function formatCount(value: number, singular: string, plural?: string): string {
  const word = value === 1 ? singular : (plural || `${singular}s`);
  return `${formatNumber(value, { decimals: 0 })} ${word}`;
}

export function formatSignedNumber(value: number, decimals: number = 2): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}`;
}

export function formatScientific(value: number, decimals: number = 2): string {
  if (Math.abs(value) < 1e-4 || Math.abs(value) >= 1e6) {
    return value.toExponential(decimals);
  }
  return value.toFixed(decimals);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

export function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const avg = average(values);
  const squaredDiffs = values.map(v => Math.pow(v - avg, 2));
  return Math.sqrt(average(squaredDiffs));
}

// ─── DATE FORMATTING ───────────────────────────────────────────

export function formatDate(date: Date | string | null | undefined, format?: string): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";
  
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthsFull = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const daysFull = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  const year = d.getFullYear();
  const month = d.getMonth();
  const day = d.getDate();
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const seconds = d.getSeconds();
  const dayOfWeek = d.getDay();
  
  const pad = (n: number) => n.toString().padStart(2, "0");
  
  switch (format) {
    case "short": return `${months[month]} ${day}, ${year}`;
    case "long": return `${monthsFull[month]} ${day}, ${year}`;
    case "iso": return d.toISOString().split("T")[0];
    case "datetime": return `${months[month]} ${day}, ${year} ${pad(hours)}:${pad(minutes)}`;
    case "datetime-long": return `${monthsFull[month]} ${day}, ${year} at ${pad(hours)}:${pad(minutes)}`;
    case "time": return `${pad(hours)}:${pad(minutes)}`;
    case "time-seconds": return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    case "day": return days[dayOfWeek];
    case "day-full": return daysFull[dayOfWeek];
    case "month": return months[month];
    case "month-full": return monthsFull[month];
    case "month-year": return `${months[month]} ${year}`;
    case "month-year-full": return `${monthsFull[month]} ${year}`;
    case "year": return year.toString();
    case "numeric": return `${pad(month + 1)}/${pad(day)}/${year}`;
    case "numeric-intl": return `${year}-${pad(month + 1)}-${pad(day)}`;
    case "relative": return formatRelativeDate(d);
    case "calendar": return formatCalendarDate(d);
    default: return `${months[month]} ${day}, ${year}`;
  }
}

export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);
  
  if (diffSec < 10) return "just now";
  if (diffSec < 60) return `${diffSec} seconds ago`;
  if (diffMin === 1) return "1 minute ago";
  if (diffMin < 60) return `${diffMin} minutes ago`;
  if (diffHr === 1) return "1 hour ago";
  if (diffHr < 24) return `${diffHr} hours ago`;
  if (diffDay === 1) return "yesterday";
  if (diffDay < 7) return `${diffDay} days ago`;
  if (diffWeek === 1) return "1 week ago";
  if (diffWeek < 4) return `${diffWeek} weeks ago`;
  if (diffMonth === 1) return "1 month ago";
  if (diffMonth < 12) return `${diffMonth} months ago`;
  if (diffYear === 1) return "1 year ago";
  return `${diffYear} years ago`;
}

export function formatCalendarDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((today.getTime() - target.getTime()) / (24 * 60 * 60 * 1000));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays === -1) return "Tomorrow";
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < -1 && diffDays > -7) return `in ${Math.abs(diffDays)} days`;
  
  return formatDate(date, "short");
}

export function formatTimeAgo(date: Date | string): string {
  return formatRelativeDate(date);
}

export function formatTimeUntil(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  
  if (diffMs < 0) return "past due";
  
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  
  if (diffSec < 60) return `in ${diffSec} seconds`;
  if (diffMin < 60) return `in ${diffMin} minutes`;
  if (diffHr < 24) return `in ${diffHr} hours`;
  if (diffDay < 7) return `in ${diffDay} days`;
  
  return formatDate(d, "short");
}

export function getDateRange(range: "24h" | "7d" | "30d" | "90d" | "365d" | "ytd" | "all"): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  
  switch (range) {
    case "24h": start.setHours(start.getHours() - 24); break;
    case "7d": start.setDate(start.getDate() - 7); break;
    case "30d": start.setDate(start.getDate() - 30); break;
    case "90d": start.setDate(start.getDate() - 90); break;
    case "365d": start.setDate(start.getDate() - 365); break;
    case "ytd": start.setMonth(0); start.setDate(1); start.setHours(0, 0, 0, 0); break;
    case "all": start.setFullYear(2000); break;
  }
  
  return { start, end };
}

export function getDaysBetween(start: Date | string, end: Date | string): number {
  const s = typeof start === "string" ? new Date(start) : start;
  const e = typeof end === "string" ? new Date(end) : end;
  return Math.floor((e.getTime() - s.getTime()) / (24 * 60 * 60 * 1000));
}

export function isToday(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export function isThisWeek(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return d >= weekAgo && d <= now;
}

export function isThisMonth(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export function isThisYear(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  return d.getFullYear() === now.getFullYear();
}

// ─── TEXT FORMATTING ───────────────────────────────────────────

export function truncateText(text: string, maxLength: number, suffix: string = "…"): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function capitalizeWords(text: string): string {
  return text.split(" ").map(capitalize).join(" ");
}

export function toTitleCase(text: string): string {
  return text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
}

export function toKebabCase(text: string): string {
  return text.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[\s_]+/g, "-").toLowerCase();
}

export function toCamelCase(text: string): string {
  return text.replace(/([-_\s][a-z])/g, (group) => group.toUpperCase().replace(/[-_\s]/, ""));
}

export function toPascalCase(text: string): string {
  const camel = toCamelCase(text);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

export function toSnakeCase(text: string): string {
  return text.replace(/([a-z])([A-Z])/g, "$1_$2").replace(/[\s-]+/g, "_").toLowerCase();
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural || `${singular}s`);
}

export function formatList(items: string[], options?: { conjunction?: string; oxfordComma?: boolean; maxItems?: number; overflowText?: string }): string {
  const { conjunction = "and", oxfordComma = true, maxItems, overflowText = "more" } = options || {};
  
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;
  
  if (maxItems && items.length > maxItems) {
    const shown = items.slice(0, maxItems);
    const remaining = items.length - maxItems;
    const comma = oxfordComma ? "," : "";
    return `${shown.join(", ")}${comma} and ${remaining} ${overflowText}`;
  }
  
  const comma = oxfordComma ? "," : "";
  return `${items.slice(0, -1).join(", ")}${comma} ${conjunction} ${items[items.length - 1]}`;
}

export function highlightText(text: string, query: string, tag: string = "mark"): string {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  return text.replace(regex, `<${tag}>$1</${tag}>`);
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/^\s*>\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

export function countCharacters(text: string, includeSpaces: boolean = true): number {
  return includeSpaces ? text.length : text.replace(/\s/g, "").length;
}

export function readingTime(text: string, wordsPerMinute: number = 200): number {
  const words = countWords(text);
  return Math.ceil(words / wordsPerMinute);
}

export function extractDomain(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ─── COLOR UTILITIES ───────────────────────────────────────────

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!match) return null;
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16),
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, "0")).join("")}`;
}

export function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const factor = percent / 100;
  return rgbToHex(
    Math.min(255, Math.round(rgb.r + (255 - rgb.r) * factor)),
    Math.min(255, Math.round(rgb.g + (255 - rgb.g) * factor)),
    Math.min(255, Math.round(rgb.b + (255 - rgb.b) * factor))
  );
}

export function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const factor = 1 - percent / 100;
  return rgbToHex(
    Math.round(rgb.r * factor),
    Math.round(rgb.g * factor),
    Math.round(rgb.b * factor)
  );
}

export function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#000000";
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

export function rgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

export function getSentimentColor(sentiment: SentimentLabel): { bg: string; text: string; border: string } {
  const colors: Record<SentimentLabel, { bg: string; text: string; border: string }> = {
    positive: { bg: "rgba(5,150,105,0.08)", text: "#059669", border: "rgba(5,150,105,0.2)" },
    neutral: { bg: "rgba(115,115,115,0.08)", text: "#737373", border: "rgba(115,115,115,0.2)" },
    negative: { bg: "rgba(220,38,38,0.08)", text: "#DC2626", border: "rgba(220,38,38,0.2)" },
  };
  return colors[sentiment] || colors.neutral;
}

export function getRiskLevelColor(level: RiskLevel): { bg: string; text: string; border: string } {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    low: { bg: "rgba(5,150,105,0.08)", text: "#059669", border: "rgba(5,150,105,0.2)" },
    moderate: { bg: "rgba(133,105,20,0.08)", text: "#856914", border: "rgba(133,105,20,0.2)" },
    elevated: { bg: "rgba(217,119,6,0.08)", text: "#D97706", border: "rgba(217,119,6,0.2)" },
    high: { bg: "rgba(220,38,38,0.08)", text: "#DC2626", border: "rgba(220,38,38,0.2)" },
    critical: { bg: "rgba(127,29,29,0.12)", text: "#7F1D1D", border: "rgba(127,29,29,0.3)" },
  };
  return colors[level] || colors.low;
}

export function getSeverityColor(severity: AlertSeverity): { bg: string; text: string; border: string } {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    info: { bg: "rgba(3,105,161,0.08)", text: "#0369A1", border: "rgba(3,105,161,0.2)" },
    low: { bg: "rgba(133,105,20,0.08)", text: "#856914", border: "rgba(133,105,20,0.2)" },
    medium: { bg: "rgba(217,119,6,0.08)", text: "#D97706", border: "rgba(217,119,6,0.2)" },
    high: { bg: "rgba(220,38,38,0.08)", text: "#DC2626", border: "rgba(220,38,38,0.2)" },
    critical: { bg: "rgba(127,29,29,0.12)", text: "#7F1D1D", border: "rgba(127,29,29,0.3)" },
  };
  return colors[severity] || colors.info;
}

export function getTrendColor(trend: "up" | "down" | "stable", positiveIsUp: boolean = true): string {
  if (trend === "stable") return "#737373";
  if (positiveIsUp) {
    return trend === "up" ? "#059669" : "#DC2626";
  } else {
    return trend === "up" ? "#DC2626" : "#059669";
  }
}

// ─── CHART DATA TRANSFORMATION ─────────────────────────────────

export function transformToLineChartData(data: Array<{ date: string; value: number }>, options?: {
  fill?: boolean;
  smooth?: boolean;
  color?: string;
}): { labels: string[]; datasets: Array<{ label: string; data: number[]; color: string; fill?: boolean }> } {
  const labels = data.map(d => formatDate(d.date, "short"));
  const values = data.map(d => d.value);
  
  return {
    labels,
    datasets: [{
      label: "Value",
      data: values,
      color: options?.color || "#059669",
      fill: options?.fill,
    }],
  };
}

export function transformToBarChartData(data: Array<{ label: string; value: number }>, options?: {
  color?: string;
  horizontal?: boolean;
}): { labels: string[]; datasets: Array<{ label: string; data: number[]; color: string }> } {
  return {
    labels: data.map(d => d.label),
    datasets: [{
      label: "Value",
      data: data.map(d => d.value),
      color: options?.color || "#4A7B5F",
    }],
  };
}

export function transformToDonutChartData(data: Array<{ label: string; value: number }>, options?: {
  colors?: string[];
}): { labels: string[]; datasets: Array<{ data: number[]; colors: string[] }> } {
  const defaultColors = ["#059669", "#0369A1", "#856914", "#7C3AED", "#DC2626", "#D97706", "#4A7B5F", "#BE185D"];
  return {
    labels: data.map(d => d.label),
    datasets: [{
      data: data.map(d => d.value),
      colors: options?.colors || defaultColors.slice(0, data.length),
    }],
  };
}

export function transformToRadarChartData(axes: string[], series: Array<{ name: string; values: number[]; color: string }>): {
  axes: string[];
  series: Array<{ name: string; values: number[]; color: string }>;
} {
  return { axes, series };
}

export function transformToHeatmapData(data: Array<{ x: string; y: string; value: number }>): {
  xLabels: string[];
  yLabels: string[];
  values: number[][];
} {
  const xSet = new Set<string>();
  const ySet = new Set<string>();
  
  for (const d of data) {
    xSet.add(d.x);
    ySet.add(d.y);
  }
  
  const xLabels = [...xSet];
  const yLabels = [...ySet];
  const values: number[][] = yLabels.map(() => xLabels.map(() => 0));
  
  for (const d of data) {
    const xIdx = xLabels.indexOf(d.x);
    const yIdx = yLabels.indexOf(d.y);
    if (xIdx >= 0 && yIdx >= 0) {
      values[yIdx][xIdx] = d.value;
    }
  }
  
  return { xLabels, yLabels, values };
}

export function downsampleData<T extends { date: string | Date }>(data: T[], maxPoints: number = 100): T[] {
  if (data.length <= maxPoints) return data;
  
  const step = Math.ceil(data.length / maxPoints);
  const result: T[] = [];
  
  for (let i = 0; i < data.length; i += step) {
    result.push(data[i]);
  }
  
  // Always include the last point
  if (result[result.length - 1] !== data[data.length - 1]) {
    result.push(data[data.length - 1]);
  }
  
  return result;
}

export function aggregateByPeriod<T extends { date: string | Date; value: number }>(
  data: T[],
  period: "day" | "week" | "month"
): Array<{ date: string; value: number; count: number }> {
  const groups = new Map<string, { sum: number; count: number }>();
  
  for (const item of data) {
    const d = typeof item.date === "string" ? new Date(item.date) : item.date;
    let key: string;
    
    switch (period) {
      case "day":
        key = d.toISOString().split("T")[0];
        break;
      case "week":
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        key = weekStart.toISOString().split("T")[0];
        break;
      case "month":
        key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
        break;
    }
    
    const existing = groups.get(key) || { sum: 0, count: 0 };
    existing.sum += item.value;
    existing.count++;
    groups.set(key, existing);
  }
  
  return [...groups.entries()]
    .map(([date, { sum, count }]) => ({ date, value: sum / count, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ─── LANGUAGE & LOCALE ─────────────────────────────────────────

export function getLanguageName(lang: Language): string {
  const names: Record<string, string> = {
    fr: "French",
    ar: "Arabic",
    en: "English",
    darija: "Moroccan Darija",
    es: "Spanish",
    de: "German",
    it: "Italian",
    pt: "Portuguese",
    zh: "Chinese",
    ja: "Japanese",
  };
  return names[lang] || lang;
}

export function getLanguageFlag(lang: Language): string {
  const flags: Record<string, string> = {
    fr: "🇫🇷",
    ar: "🇲🇦",
    en: "🇬🇧",
    darija: "🇲🇦",
    es: "🇪🇸",
    de: "🇩🇪",
    it: "🇮🇹",
    pt: "🇵🇹",
    zh: "🇨🇳",
    ja: "🇯🇵",
  };
  return flags[lang] || "🌐";
}

export function getLanguageNativeName(lang: Language): string {
  const names: Record<string, string> = {
    fr: "Français",
    ar: "العربية",
    en: "English",
    darija: "الدارجة",
    es: "Español",
    de: "Deutsch",
    it: "Italiano",
    pt: "Português",
    zh: "中文",
    ja: "日本語",
  };
  return names[lang] || lang;
}

export function isRTL(lang: Language): boolean {
  return lang === "ar" || lang === "darija";
}

// ─── VALIDATION HELPERS ────────────────────────────────────────

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isValidUUID(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
}

export function isValidPhone(phone: string): boolean {
  return /^\+?[1-9]\d{1,14}$/.test(phone);
}

export function isValidISIN(isin: string): boolean {
  return /^[A-Z]{2}[A-Z0-9]{9}\d$/.test(isin);
}

export function isValidTicker(ticker: string): boolean {
  return /^[A-Z]{2,5}$/.test(ticker);
}

export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

// ─── MISC UTILITIES ────────────────────────────────────────────

export function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: any[]) => void>(fn: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
}

export function uniqueBy<T>(array: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

export function sortBy<T>(array: T[], keyFn: (item: T) => string | number, direction: "asc" | "desc" = "asc"): T[] {
  return [...array].sort((a, b) => {
    const aVal = keyFn(a);
    const bVal = keyFn(b);
    if (aVal < bVal) return direction === "asc" ? -1 : 1;
    if (aVal > bVal) return direction === "asc" ? 1 : -1;
    return 0;
  });
}

export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function range(start: number, end: number, step: number = 1): number[] {
  const result: number[] = [];
  for (let i = start; i <= end; i += step) {
    result.push(i);
  }
  return result;
}

export function sum(array: number[]): number {
  return array.reduce((a, b) => a + b, 0);
}

export function max(array: number[]): number {
  return Math.max(...array);
}

export function min(array: number[]): number {
  return Math.min(...array);
}

export function pick<T extends Record<string, unknown>>(obj: T, keys: string[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

export function omit<T extends Record<string, unknown>>(obj: T, keys: string[]): Partial<T> {
  const result: Partial<T> = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

export function deepClone<T>(obj: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(obj);
  }
  return JSON.parse(JSON.stringify(obj));
}

export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value as object).length === 0;
  return false;
}

export function isNotEmpty(value: unknown): boolean {
  return !isEmpty(value);
}

export function generateId(prefix: string = ""): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function retry<T>(fn: () => Promise<T>, maxRetries: number, delay: number = 1000): Promise<T> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const attempt = async () => {
      try {
        const result = await fn();
        resolve(result);
      } catch (err) {
        attempts++;
        if (attempts >= maxRetries) {
          reject(err);
        } else {
          setTimeout(attempt, delay * attempts);
        }
      }
    };
    
    attempt();
  });
}

export function memoize<T extends (...args: any[]) => any>(fn: T, keyFn?: (...args: Parameters<T>) => string): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}
