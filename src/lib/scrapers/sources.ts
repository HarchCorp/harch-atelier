// ═══════════════════════════════════════════════════════════════
//  SOURCES (LEGACY COMPAT SHIM) — AEGIS-SCRAPER
//
//  The single source of truth for sources + companies now lives in
//  sources-config.ts. This file is preserved as a thin backward-compat
//  shim so that existing imports in:
//    • src/lib/analyzers/orchestrator-v2.ts
//    • src/lib/analyzers/orchestrator.ts
//  keep working without code changes:
//    - COMPANY_ALIASES     (derived from COMPANIES.aliases)
//    - COMPANY_CATEGORIES  (derived from COMPANIES.sector)
//    - COMPANY_COMPETITORS (legacy competitor matrix — kept verbatim)
//
//  New code should import from sources-config.ts directly.
// ═══════════════════════════════════════════════════════════════

import {
  RSS_SOURCES,
  COMPANIES,
  type RSSSource,
  type CompanyConfig,
} from "./sources-config";

// Re-export the new authoritative types + data so legacy consumers
// can adopt the new API without changing their import path.
export type { RSSSource, CompanyConfig } from "./sources-config";
export { RSS_SOURCES, COMPANIES } from "./sources-config";

// ─── LEGACY MediaSource (back-compat) ─────────────────────────────
// The new RSSSource interface is richer; MediaSource is preserved
// for any consumer that still references it. Derived on the fly from
// RSS_SOURCES.

export interface MediaSource {
  id: string;
  name: string;
  url: string;
  rss?: string;
  type: "news" | "business" | "tech" | "social" | "ai" | "aggregator";
  language: "fr" | "ar" | "en";
  country: string;
  scraper: "rss" | "html" | "api" | "google_news";
}

function toMediaSource(s: RSSSource): MediaSource {
  const isGoogleNews = s.url.includes("news.google.com");
  return {
    id: s.id,
    name: s.name,
    url: s.url,
    rss: s.url,
    type:
      s.category === "business"
        ? "business"
        : s.category === "finance"
        ? "business"
        : s.category === "tech"
        ? "tech"
        : "news",
    language: s.language,
    country: countryForRegion(s.region),
    scraper: isGoogleNews ? "google_news" : "rss",
  };
}

function countryForRegion(region: string): string {
  if (region === "Morocco") return "MA";
  if (region === "Africa") return "AF";
  return "GLOBAL";
}

/**
 * MEDIA_SOURCES — legacy array. Mapped 1:1 from RSS_SOURCES plus the
 * Google News Morocco aggregator entry.
 */
export const MEDIA_SOURCES: MediaSource[] = RSS_SOURCES.map(toMediaSource);

// ─── LEGACY COMPANY_ALIASES ───────────────────────────────────────
// Derived from COMPANIES so there's a single source of truth.

export const COMPANY_ALIASES: Record<string, string[]> = Object.fromEntries(
  COMPANIES.map((c) => [c.name, c.aliases.map((a) => a.toLowerCase())]),
);

// ─── LEGACY COMPANY_CATEGORIES (sector) ───────────────────────────
// Derived from COMPANIES.sector.

export const COMPANY_CATEGORIES: Record<string, string> = Object.fromEntries(
  COMPANIES.map((c) => [c.name, c.sector]),
);

// ─── LEGACY COMPANY_COMPETITORS ───────────────────────────────────
// Competitor matrix is not derivable from COMPANIES — preserved here
// verbatim so orchestrator-v2.ts competitor benchmarking keeps working.

export const COMPANY_COMPETITORS: Record<string, string[]> = {
  "Bank of Africa": ["Attijariwafa Bank", "CIH Bank"],
  "Attijariwafa Bank": ["Bank of Africa", "CIH Bank"],
  "CIH Bank": ["Bank of Africa", "Attijariwafa Bank"],
  "Maroc Telecom": ["Inwi"],
  "Inwi": ["Maroc Telecom"],
  "OCP Group": ["Managem"],
  "Managem": ["OCP Group"],
  "Royal Air Maroc": [],
  "LesieurCristal": ["Cosumar"],
  "Cosumar": ["LesieurCristal"],
  "AXA Assurance Maroc": ["Wafa Assurance"],
  "Wafa Assurance": ["AXA Assurance Maroc"],
  "LafargeHolcim Maroc": [],
  "Label'Vie": [],
  "Disway": ["M2M Group"],
  "M2M Group": ["Disway"],
  "Auto Nejma": [],
  "Delassenza Holding": [],
};

// ─── LEGACY Google News URL builders ──────────────────────────────
// Kept for any consumer that still wants to build a Google News RSS
// URL by hand. The new rss-scraper.ts builds these inline.

/**
 * Build a Google News RSS URL that searches for a company name plus
 * all its known aliases. Falls back to the bare name if no aliases
 * are registered.
 */
export function getGoogleNewsRSS(companyName: string): string {
  const aliases = COMPANY_ALIASES[companyName] || [companyName.toLowerCase()];
  const query = aliases.map((a) => `"${a}"`).join(" OR ");
  return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=fr&gl=MA&ceid=MA:fr`;
}

/**
 * Build a Google News RSS URL for a general topic scoped to Morocco.
 */
export function getGoogleNewsTopicRSS(topic: string): string {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(topic + " Maroc")}&hl=fr&gl=MA&ceid=MA:fr`;
}
