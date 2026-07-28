"use client";

import React, { useState, useMemo, useEffect } from "react";
import { AtelierNav } from "../components/AtelierNav";
import { AtelierFooter } from "../components/AtelierFooter";
import { ScrollProgress, CursorGlow, BackToTop } from "../components/shared";
import { RadarChart } from "../components/charts/Charts";

// ═══════════════════════════════════════════════════════════════
//  HARCH 100 — Morocco's Most Reputable Companies
//  Signal AI 500-style ranking with Innovation/Performance/Purpose
//  pillars + Key Themes + Quarterly trends + Share of conversation
// ═══════════════════════════════════════════════════════════════

const C = {
  bg: "#FAFAFA", surface: "#FFFFFF", surfaceAlt: "#F4F4F5",
  border: "#E5E5E5", borderLight: "#F0F0F0",
  text: "#0A0A0A", textSec: "#525252", textMuted: "#71717A",
  accent: "#4A5D6E", sage: "#4A7B5F", sageBright: "#6FA386",
  red: "#A0524B", shadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
};

interface Company {
  rank: number;
  name: string;
  sector: string;
  score: number;
  prevScore: number;
  trend: "up" | "down" | "stable";
  change: string;
  // Signal AI 500-style pillars (Innovation/Performance/Purpose percentages of narrative)
  innovation: { weight: number; score: number };
  performance: { weight: number; score: number };
  purpose: { weight: number; score: number };
  shareOfVoice: number;  // % of total conversation in sector
  quarterly: number[];   // 4 quarters of score
  keyThemes: { theme: string; score: number; trend: number }[];
  sentiment: number;
  articles: number;
  aiRank: string;
  riskLevel: "low" | "moderate" | "elevated" | "high" | "critical";
  // 7 risk dimensions (0-100, higher = more risk exposure)
  riskDimensions: {
    geopolitical: number;
    operational: number;
    financial: number;
    environmental: number;
    legal: number;
    consumer: number;
    technology: number;
  };
}

const COMPANIES: Company[] = [
  {
    rank: 1, name: "OCP Group", sector: "Mining & Phosphates", score: 91, prevScore: 89,
    trend: "up", change: "+2",
    innovation: { weight: 48, score: 88 },
    performance: { weight: 35, score: 94 },
    purpose: { weight: 17, score: 79 },
    shareOfVoice: 31, quarterly: [85, 87, 89, 91],
    keyThemes: [
      { theme: "Technology", score: 89, trend: 8 },
      { theme: "Growth", score: 95, trend: 5 },
      { theme: "Sustainability", score: 81, trend: 12 },
      { theme: "Operations", score: 92, trend: 3 },
      { theme: "CSR", score: 78, trend: 6 },
    ],
    sentiment: 82, articles: 342, aiRank: "#1", riskLevel: "moderate",
    riskDimensions: { geopolitical: 58, operational: 75, financial: 52, environmental: 80, legal: 60, consumer: 50, technology: 48 },
  },
  {
    rank: 2, name: "Attijariwafa Bank", sector: "Banking", score: 84, prevScore: 85,
    trend: "down", change: "-1",
    innovation: { weight: 35, score: 79 },
    performance: { weight: 41, score: 89 },
    purpose: { weight: 24, score: 76 },
    shareOfVoice: 27, quarterly: [82, 86, 85, 84],
    keyThemes: [
      { theme: "Technology", score: 80, trend: 5 },
      { theme: "Growth", score: 88, trend: -2 },
      { theme: "Sustainability", score: 75, trend: 4 },
      { theme: "Operations", score: 90, trend: 1 },
      { theme: "Governance", score: 87, trend: -1 },
    ],
    sentiment: 72, articles: 287, aiRank: "#1", riskLevel: "moderate",
    riskDimensions: { geopolitical: 35, operational: 58, financial: 81, environmental: 38, legal: 75, consumer: 55, technology: 82 },
  },
  {
    rank: 3, name: "Maroc Telecom", sector: "Telecommunications", score: 79, prevScore: 77,
    trend: "up", change: "+2",
    innovation: { weight: 52, score: 82 },
    performance: { weight: 30, score: 81 },
    purpose: { weight: 18, score: 70 },
    shareOfVoice: 24, quarterly: [75, 76, 77, 79],
    keyThemes: [
      { theme: "Technology", score: 84, trend: 9 },
      { theme: "Products & services", score: 81, trend: 6 },
      { theme: "Growth", score: 80, trend: 3 },
      { theme: "Operations", score: 82, trend: 2 },
      { theme: "CSR", score: 71, trend: 4 },
    ],
    sentiment: 64, articles: 245, aiRank: "#1", riskLevel: "low",
    riskDimensions: { geopolitical: 48, operational: 62, financial: 55, environmental: 45, legal: 65, consumer: 60, technology: 78 },
  },
  {
    rank: 4, name: "Royal Air Maroc", sector: "Aviation", score: 76, prevScore: 78,
    trend: "down", change: "-2",
    innovation: { weight: 28, score: 72 },
    performance: { weight: 47, score: 81 },
    purpose: { weight: 25, score: 73 },
    shareOfVoice: 19, quarterly: [80, 79, 78, 76],
    keyThemes: [
      { theme: "Operations", score: 83, trend: -3 },
      { theme: "Growth", score: 79, trend: -1 },
      { theme: "Technology", score: 71, trend: 4 },
      { theme: "CSR", score: 74, trend: 2 },
      { theme: "Governance", score: 76, trend: -2 },
    ],
    sentiment: 61, articles: 198, aiRank: "#2", riskLevel: "elevated",
    riskDimensions: { geopolitical: 65, operational: 78, financial: 58, environmental: 62, legal: 55, consumer: 70, technology: 65 },
  },
  {
    rank: 5, name: "Inwi", sector: "Telecommunications", score: 74, prevScore: 72,
    trend: "up", change: "+2",
    innovation: { weight: 56, score: 81 },
    performance: { weight: 27, score: 75 },
    purpose: { weight: 17, score: 68 },
    shareOfVoice: 18, quarterly: [68, 70, 72, 74],
    keyThemes: [
      { theme: "Technology", score: 84, trend: 11 },
      { theme: "Products & services", score: 80, trend: 7 },
      { theme: "Culture", score: 72, trend: 5 },
      { theme: "Growth", score: 76, trend: 3 },
      { theme: "Sustainability", score: 68, trend: 4 },
    ],
    sentiment: 68, articles: 176, aiRank: "#3", riskLevel: "low",
    riskDimensions: { geopolitical: 42, operational: 55, financial: 48, environmental: 40, legal: 58, consumer: 52, technology: 72 },
  },
  {
    rank: 6, name: "Bank of Africa", sector: "Banking", score: 72, prevScore: 71,
    trend: "up", change: "+1",
    innovation: { weight: 38, score: 76 },
    performance: { weight: 40, score: 78 },
    purpose: { weight: 22, score: 71 },
    shareOfVoice: 22, quarterly: [69, 70, 71, 72],
    keyThemes: [
      { theme: "Growth", score: 81, trend: 6 },
      { theme: "Operations", score: 79, trend: 3 },
      { theme: "Technology", score: 75, trend: 5 },
      { theme: "CSR", score: 72, trend: 4 },
      { theme: "Collaborations", score: 70, trend: 7 },
    ],
    sentiment: 68, articles: 247, aiRank: "#2", riskLevel: "moderate",
    riskDimensions: { geopolitical: 38, operational: 55, financial: 78, environmental: 35, legal: 70, consumer: 58, technology: 75 },
  },
  {
    rank: 7, name: "CIH Bank", sector: "Banking", score: 68, prevScore: 70,
    trend: "down", change: "-2",
    innovation: { weight: 42, score: 71 },
    performance: { weight: 38, score: 73 },
    purpose: { weight: 20, score: 65 },
    shareOfVoice: 14, quarterly: [71, 71, 70, 68],
    keyThemes: [
      { theme: "Technology", score: 73, trend: 4 },
      { theme: "Operations", score: 74, trend: -1 },
      { theme: "Growth", score: 72, trend: -2 },
      { theme: "Sustainability", score: 64, trend: 2 },
      { theme: "Governance", score: 70, trend: -3 },
    ],
    sentiment: 65, articles: 145, aiRank: "#3", riskLevel: "moderate",
    riskDimensions: { geopolitical: 32, operational: 50, financial: 75, environmental: 30, legal: 68, consumer: 52, technology: 70 },
  },
  {
    rank: 8, name: "Managem", sector: "Mining", score: 66, prevScore: 64,
    trend: "up", change: "+2",
    innovation: { weight: 31, score: 68 },
    performance: { weight: 44, score: 72 },
    purpose: { weight: 25, score: 62 },
    shareOfVoice: 12, quarterly: [60, 62, 64, 66],
    keyThemes: [
      { theme: "Operations", score: 75, trend: 4 },
      { theme: "Growth", score: 73, trend: 3 },
      { theme: "Sustainability", score: 64, trend: 6 },
      { theme: "Technology", score: 67, trend: 2 },
      { theme: "CSR", score: 60, trend: 5 },
    ],
    sentiment: 59, articles: 112, aiRank: "#2", riskLevel: "elevated",
    riskDimensions: { geopolitical: 55, operational: 72, financial: 50, environmental: 75, legal: 58, consumer: 48, technology: 45 },
  },
  {
    rank: 9, name: "LesieurCristal", sector: "Agro-industry", score: 64, prevScore: 65,
    trend: "down", change: "-1",
    innovation: { weight: 26, score: 62 },
    performance: { weight: 46, score: 68 },
    purpose: { weight: 28, score: 64 },
    shareOfVoice: 10, quarterly: [66, 65, 65, 64],
    keyThemes: [
      { theme: "Operations", score: 70, trend: -1 },
      { theme: "Sustainability", score: 66, trend: 3 },
      { theme: "Products & services", score: 64, trend: 1 },
      { theme: "Growth", score: 67, trend: -2 },
      { theme: "CSR", score: 63, trend: 2 },
    ],
    sentiment: 62, articles: 89, aiRank: "#4", riskLevel: "low",
    riskDimensions: { geopolitical: 30, operational: 55, financial: 48, environmental: 52, legal: 45, consumer: 60, technology: 35 },
  },
  {
    rank: 10, name: "Cosumar", sector: "Sugar", score: 62, prevScore: 60,
    trend: "up", change: "+2",
    innovation: { weight: 23, score: 60 },
    performance: { weight: 48, score: 66 },
    purpose: { weight: 29, score: 63 },
    shareOfVoice: 9, quarterly: [58, 59, 60, 62],
    keyThemes: [
      { theme: "Operations", score: 68, trend: 3 },
      { theme: "Sustainability", score: 65, trend: 5 },
      { theme: "CSR", score: 64, trend: 4 },
      { theme: "Growth", score: 63, trend: 2 },
      { theme: "Products & services", score: 60, trend: 1 },
    ],
    sentiment: 67, articles: 76, aiRank: "#3", riskLevel: "low",
    riskDimensions: { geopolitical: 25, operational: 50, financial: 45, environmental: 55, legal: 40, consumer: 55, technology: 30 },
  },
  {
    rank: 11, name: "Label'Vie", sector: "Retail", score: 59, prevScore: 58,
    trend: "up", change: "+1",
    innovation: { weight: 30, score: 61 },
    performance: { weight: 42, score: 63 },
    purpose: { weight: 28, score: 58 },
    shareOfVoice: 8, quarterly: [55, 56, 58, 59],
    keyThemes: [
      { theme: "Growth", score: 65, trend: 4 },
      { theme: "Operations", score: 63, trend: 2 },
      { theme: "Products & services", score: 60, trend: 3 },
      { theme: "CSR", score: 58, trend: 2 },
      { theme: "Sustainability", score: 57, trend: 3 },
    ],
    sentiment: 64, articles: 67, aiRank: "#5", riskLevel: "low",
    riskDimensions: { geopolitical: 28, operational: 48, financial: 52, environmental: 45, legal: 42, consumer: 65, technology: 40 },
  },
  {
    rank: 12, name: "Marjane", sector: "Retail", score: 57, prevScore: 59,
    trend: "down", change: "-2",
    innovation: { weight: 28, score: 58 },
    performance: { weight: 44, score: 61 },
    purpose: { weight: 28, score: 55 },
    shareOfVoice: 14, quarterly: [60, 59, 58, 57],
    keyThemes: [
      { theme: "Operations", score: 62, trend: -2 },
      { theme: "Products & services", score: 60, trend: 1 },
      { theme: "Growth", score: 58, trend: -1 },
      { theme: "CSR", score: 55, trend: 0 },
      { theme: "Culture", score: 54, trend: -2 },
    ],
    sentiment: 55, articles: 134, aiRank: "#4", riskLevel: "elevated",
    riskDimensions: { geopolitical: 30, operational: 50, financial: 55, environmental: 48, legal: 45, consumer: 70, technology: 42 },
  },
  {
    rank: 13, name: "Lydec", sector: "Utilities", score: 55, prevScore: 53,
    trend: "up", change: "+2",
    innovation: { weight: 32, score: 56 },
    performance: { weight: 41, score: 58 },
    purpose: { weight: 27, score: 54 },
    shareOfVoice: 11, quarterly: [50, 51, 53, 55],
    keyThemes: [
      { theme: "Operations", score: 60, trend: 3 },
      { theme: "Technology", score: 56, trend: 4 },
      { theme: "Sustainability", score: 55, trend: 3 },
      { theme: "CSR", score: 53, trend: 2 },
      { theme: "Governance", score: 52, trend: 1 },
    ],
    sentiment: 48, articles: 98, aiRank: "#6", riskLevel: "elevated",
    riskDimensions: { geopolitical: 35, operational: 65, financial: 50, environmental: 60, legal: 55, consumer: 62, technology: 45 },
  },
  {
    rank: 14, name: "Risma", sector: "Hospitality", score: 53, prevScore: 54,
    trend: "down", change: "-1",
    innovation: { weight: 25, score: 52 },
    performance: { weight: 47, score: 56 },
    purpose: { weight: 28, score: 51 },
    shareOfVoice: 7, quarterly: [55, 54, 54, 53],
    keyThemes: [
      { theme: "Operations", score: 58, trend: -1 },
      { theme: "Growth", score: 55, trend: 0 },
      { theme: "CSR", score: 52, trend: 1 },
      { theme: "Products & services", score: 50, trend: -2 },
      { theme: "Sustainability", score: 49, trend: 2 },
    ],
    sentiment: 58, articles: 56, aiRank: "#5", riskLevel: "moderate",
    riskDimensions: { geopolitical: 40, operational: 55, financial: 52, environmental: 45, legal: 42, consumer: 58, technology: 35 },
  },
  {
    rank: 15, name: "Disway", sector: "IT Distribution", score: 51, prevScore: 50,
    trend: "up", change: "+1",
    innovation: { weight: 45, score: 54 },
    performance: { weight: 33, score: 53 },
    purpose: { weight: 22, score: 48 },
    shareOfVoice: 5, quarterly: [47, 48, 50, 51],
    keyThemes: [
      { theme: "Technology", score: 56, trend: 5 },
      { theme: "Operations", score: 54, trend: 2 },
      { theme: "Products & services", score: 52, trend: 3 },
      { theme: "Growth", score: 50, trend: 1 },
      { theme: "Collaborations", score: 49, trend: 2 },
    ],
    sentiment: 61, articles: 43, aiRank: "#4", riskLevel: "low",
    riskDimensions: { geopolitical: 25, operational: 45, financial: 48, environmental: 30, legal: 38, consumer: 50, technology: 55 },
  },
  {
    rank: 16, name: "Stokvis Nord Afrique", sector: "Industrial", score: 49, prevScore: 48,
    trend: "up", change: "+1",
    innovation: { weight: 22, score: 48 },
    performance: { weight: 50, score: 52 },
    purpose: { weight: 28, score: 46 },
    shareOfVoice: 4, quarterly: [46, 47, 48, 49],
    keyThemes: [
      { theme: "Operations", score: 54, trend: 2 },
      { theme: "Growth", score: 51, trend: 1 },
      { theme: "Sustainability", score: 47, trend: 1 },
      { theme: "CSR", score: 46, trend: 0 },
      { theme: "Technology", score: 45, trend: 2 },
    ],
    sentiment: 57, articles: 38, aiRank: "#6", riskLevel: "low",
    riskDimensions: { geopolitical: 32, operational: 58, financial: 45, environmental: 50, legal: 42, consumer: 40, technology: 38 },
  },
  {
    rank: 17, name: "Sonasid", sector: "Steel", score: 47, prevScore: 49,
    trend: "down", change: "-2",
    innovation: { weight: 21, score: 46 },
    performance: { weight: 49, score: 50 },
    purpose: { weight: 30, score: 44 },
    shareOfVoice: 5, quarterly: [50, 49, 48, 47],
    keyThemes: [
      { theme: "Operations", score: 52, trend: -1 },
      { theme: "Sustainability", score: 46, trend: 1 },
      { theme: "Growth", score: 48, trend: -2 },
      { theme: "CSR", score: 43, trend: 0 },
      { theme: "Governance", score: 45, trend: -1 },
    ],
    sentiment: 52, articles: 45, aiRank: "#5", riskLevel: "elevated",
    riskDimensions: { geopolitical: 38, operational: 65, financial: 55, environmental: 62, legal: 48, consumer: 45, technology: 35 },
  },
  {
    rank: 18, name: "Maghreb Oxygene", sector: "Industrial Gas", score: 45, prevScore: 44,
    trend: "up", change: "+1",
    innovation: { weight: 30, score: 46 },
    performance: { weight: 42, score: 48 },
    purpose: { weight: 28, score: 42 },
    shareOfVoice: 3, quarterly: [42, 43, 44, 45],
    keyThemes: [
      { theme: "Operations", score: 50, trend: 2 },
      { theme: "Technology", score: 47, trend: 1 },
      { theme: "Sustainability", score: 43, trend: 2 },
      { theme: "Growth", score: 46, trend: 0 },
      { theme: "CSR", score: 41, trend: 1 },
    ],
    sentiment: 60, articles: 29, aiRank: "#7", riskLevel: "low",
    riskDimensions: { geopolitical: 30, operational: 55, financial: 42, environmental: 48, legal: 38, consumer: 35, technology: 32 },
  },
  {
    rank: 19, name: "LafargeHolcim Maroc", sector: "Cement", score: 43, prevScore: 45,
    trend: "down", change: "-2",
    innovation: { weight: 24, score: 44 },
    performance: { weight: 46, score: 46 },
    purpose: { weight: 30, score: 40 },
    shareOfVoice: 7, quarterly: [46, 45, 44, 43],
    keyThemes: [
      { theme: "Operations", score: 48, trend: -1 },
      { theme: "Sustainability", score: 42, trend: 2 },
      { theme: "Growth", score: 44, trend: -2 },
      { theme: "CSR", score: 39, trend: 1 },
      { theme: "Technology", score: 43, trend: 0 },
    ],
    sentiment: 49, articles: 67, aiRank: "#5", riskLevel: "elevated",
    riskDimensions: { geopolitical: 42, operational: 68, financial: 52, environmental: 70, legal: 50, consumer: 48, technology: 40 },
  },
  {
    rank: 20, name: "Total Maroc", sector: "Energy", score: 41, prevScore: 42,
    trend: "down", change: "-1",
    innovation: { weight: 26, score: 42 },
    performance: { weight: 44, score: 44 },
    purpose: { weight: 30, score: 38 },
    shareOfVoice: 6, quarterly: [43, 43, 42, 41],
    keyThemes: [
      { theme: "Operations", score: 46, trend: -1 },
      { theme: "Growth", score: 42, trend: -2 },
      { theme: "Sustainability", score: 39, trend: 1 },
      { theme: "CSR", score: 37, trend: 0 },
      { theme: "Technology", score: 40, trend: -1 },
    ],
    sentiment: 44, articles: 52, aiRank: "#6", riskLevel: "high",
    riskDimensions: { geopolitical: 60, operational: 70, financial: 55, environmental: 75, legal: 52, consumer: 50, technology: 45 },
  },
];

const SECTORS = ["All Sectors", "Banking", "Telecommunications", "Mining", "Mining & Phosphates", "Retail", "Energy", "Aviation", "Industrial", "Agro-industry", "Cement", "Utilities", "Hospitality", "IT Distribution", "Sugar", "Steel", "Industrial Gas"];
const PILLARS = ["Innovation", "Performance", "Purpose"] as const;
type Pillar = typeof PILLARS[number];

// ─── API FETCH + MAPPING ─────────────────────────────────────────
// Live data is fetched from /api/companies on mount and mapped to the
// rich Company interface used by the ranking table. Hardcoded COMPANIES
// is kept as a fallback so the page always renders even if the API is
// unreachable.

interface ApiCompany {
  name: string;
  sector: string;
  [key: string]: unknown;
}

function mapApiToCompanies(apiCompanies: ApiCompany[], fallback: Company[]): Company[] {
  const fallbackByName = new Map(fallback.map((c) => [c.name.toLowerCase(), c]));
  const mapped: Company[] = apiCompanies.map((api) => {
    const match = fallbackByName.get(api.name.toLowerCase());
    if (match) {
      // Preserve rich reputation data; refresh name/sector from the API
      return { ...match, name: api.name, sector: api.sector };
    }
    // No reputation data yet — synthesize a neutral placeholder so the
    // new company still shows up in the ranking table.
    return {
      rank: 0,
      name: api.name,
      sector: api.sector,
      score: 50,
      prevScore: 50,
      trend: "stable" as const,
      change: "0",
      innovation: { weight: 33, score: 50 },
      performance: { weight: 33, score: 50 },
      purpose: { weight: 34, score: 50 },
      shareOfVoice: 5,
      quarterly: [50, 50, 50, 50],
      keyThemes: [],
      sentiment: 50,
      articles: 0,
      aiRank: "#10",
      riskLevel: "moderate",
      riskDimensions: {
        geopolitical: 40,
        operational: 40,
        financial: 40,
        environmental: 40,
        legal: 40,
        consumer: 40,
        technology: 40,
      },
    };
  });
  // Re-rank by score descending so the table is always sensible
  mapped.sort((a, b) => b.score - a.score);
  mapped.forEach((c, i) => { c.rank = i + 1; });
  return mapped;
}

export default function Harch100Page() {
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("All Sectors");
  const [sortBy, setSortBy] = useState<"rank" | "score" | "sentiment" | "articles" | "innovation" | "performance" | "purpose">("rank");
  const [activePillar, setActivePillar] = useState<Pillar>("Innovation");
  const [expandedRow, setExpandedRow] = useState<number | null>(1);
  const [animateIn, setAnimateIn] = useState(false);

  // Live data state — initialized to hardcoded fallback so the page
  // always renders. Replaced with API data on successful fetch.
  const [companies, setCompanies] = useState<Company[]>(COMPANIES);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setAnimateIn(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          "/api/companies?page=1&limit=100&sortBy=name&sortOrder=asc",
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json?.success || !Array.isArray(json.data)) {
          throw new Error("Malformed API response");
        }
        const mapped = mapApiToCompanies(json.data as ApiCompany[], COMPANIES);
        if (!cancelled && mapped.length > 0) {
          setCompanies(mapped);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error("[Harch100Page] fetch failed, using fallback:", msg);
          setError(msg);
          setCompanies(COMPANIES);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    let result = companies.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) &&
      (sectorFilter === "All Sectors" || c.sector === sectorFilter)
    );
    result.sort((a, b) => {
      if (sortBy === "rank") return a.rank - b.rank;
      if (sortBy === "score") return b.score - a.score;
      if (sortBy === "sentiment") return b.sentiment - a.sentiment;
      if (sortBy === "articles") return b.articles - a.articles;
      if (sortBy === "innovation") return b.innovation.score - a.innovation.score;
      if (sortBy === "performance") return b.performance.score - a.performance.score;
      if (sortBy === "purpose") return b.purpose.score - a.purpose.score;
      return 0;
    });
    return result;
  }, [companies, search, sectorFilter, sortBy]);

  const getPillarData = (c: Company, pillar: Pillar) => {
    if (pillar === "Innovation") return c.innovation;
    if (pillar === "Performance") return c.performance;
    return c.purpose;
  };

  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <AtelierNav />

      {/* HERO — Signal AI 500 style */}
      <section style={{
        background: `linear-gradient(180deg, ${C.surface} 0%, ${C.bg} 100%)`,
        borderBottom: `1px solid ${C.border}`,
        padding: "80px 32px 60px",
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          {/* Top label */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            padding: "6px 14px", background: C.surface,
            border: `1px solid ${C.border}`, borderRadius: "100px",
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase",
            marginBottom: "24px",
          }}>
            <span style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: C.sage, animation: "pulse 2s infinite",
            }} />
            HARCH 100 · FY 2026 · Live Data
          </div>

          <h1 style={{
            fontSize: "clamp(40px, 7vw, 72px)", fontWeight: 800,
            letterSpacing: "-0.045em", lineHeight: 0.98, color: C.text,
            margin: "0 0 28px", maxWidth: "900px",
          }}>
            The Harch 100 Global<br />
            <span style={{
              background: `linear-gradient(90deg, ${C.sage} 0%, ${C.sageBright} 100%)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>Reputation Ranking.</span>
          </h1>

          <p style={{
            fontSize: "20px", color: C.textSec, lineHeight: 1.55,
            maxWidth: "720px", marginBottom: "40px",
          }}>
            Morocco's most-talked about companies ranked by AI-powered reputation intelligence.
            Unlike surveys, the Harch 100 uses big data and HarchIQ to benchmark corporations on
            hundreds of topics—from R&D to M&A—across <strong style={{ color: C.text }}>30+ media sources</strong> and
            <strong style={{ color: C.text }}> 4 AI engines</strong>.
          </p>

          {/* Stats row */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1px", background: C.border, border: `1px solid ${C.border}`,
            borderRadius: "12px", overflow: "hidden", maxWidth: "900px",
          }}>
            {[
              { label: "Companies ranked", value: "20", sub: "expanding to 100" },
              { label: "Articles analyzed", value: "2,546", sub: "top 20 companies" },
              { label: "Media sources", value: "30+", sub: "FR · AR · EN" },
              { label: "AI engines", value: "4", sub: "ChatGPT · Perplexity · Gemini · Claude" },
            ].map((s) => (
              <div key={s.label} style={{ background: C.surface, padding: "20px 24px" }}>
                <div style={{ fontSize: "28px", fontWeight: 800, color: C.text, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1, marginBottom: "6px" }}>
                  {s.value}
                </div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: C.text, marginBottom: "2px" }}>
                  {s.label}
                </div>
                <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
                  {s.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PILLARS SELECTOR — Innovation / Performance / Purpose */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "60px 32px 30px" }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-end",
          flexWrap: "wrap", gap: "24px", marginBottom: "32px",
        }}>
          <div>
            <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "8px" }}>
              Three pillars of reputation
            </div>
            <h2 style={{ fontSize: "32px", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: 0 }}>
              What drives the narrative.
            </h2>
          </div>
          <div style={{ display: "flex", gap: "8px", background: C.surface, padding: "4px", borderRadius: "10px", border: `1px solid ${C.border}` }}>
            {PILLARS.map(p => (
              <button
                key={p}
                onClick={() => setActivePillar(p)}
                style={{
                  padding: "10px 20px", fontSize: "13px", fontWeight: 600,
                  fontFamily: "'Inter', sans-serif",
                  background: activePillar === p ? C.text : "transparent",
                  color: activePillar === p ? "#FFFFFF" : C.textSec,
                  border: "none", borderRadius: "7px", cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Pillar explainer */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "16px", marginBottom: "40px",
        }}>
          {PILLARS.map(p => {
            const isActive = activePillar === p;
            const desc = p === "Innovation"
              ? "Collaborations, Products & services, Technology"
              : p === "Performance"
              ? "Governance, Growth, Operations"
              : "CSR, Culture, Sustainability";
            return (
              <div key={p} style={{
                background: isActive ? C.surface : "transparent",
                border: `1px solid ${isActive ? C.sage : C.border}`,
                borderRadius: "10px", padding: "20px",
                transition: "all 0.2s",
                boxShadow: isActive ? "0 4px 16px rgba(74,123,95,0.08)" : "none",
              }}>
                <div style={{
                  fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
                  color: isActive ? C.sage : C.textMuted,
                  letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px",
                }}>
                  {isActive ? "▸ Active view" : "Pillar"}
                </div>
                <div style={{ fontSize: "17px", fontWeight: 700, color: C.text, marginBottom: "6px" }}>
                  {p}
                </div>
                <div style={{ fontSize: "12px", color: C.textSec, lineHeight: 1.5 }}>
                  {desc}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* TOP 3 PODIUM — Premium cards */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "20px 32px 60px" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
        }}>
          {companies.slice(0, 3).map((c, i) => (
            <div key={c.rank} style={{
              background: C.surface,
              border: `1px solid ${i === 0 ? C.sage : C.border}`,
              borderRadius: "16px",
              padding: "32px 28px",
              position: "relative", overflow: "hidden",
              boxShadow: i === 0 ? "0 8px 32px rgba(74,123,95,0.12)" : C.shadow,
              transform: animateIn ? "translateY(0)" : "translateY(20px)",
              opacity: animateIn ? 1 : 0,
              transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.1}s`,
            }}>
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "4px",
                background: i === 0 ? C.sage : i === 1 ? C.accent : "#B87333",
              }} />
              <div style={{ position: "absolute", top: "-20px", right: "-20px", fontSize: "180px", fontWeight: 900, color: i === 0 ? "rgba(74,123,95,0.06)" : "rgba(74,93,110,0.06)", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1, pointerEvents: "none" }}>
                {c.rank}
              </div>
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
                  color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase",
                  marginBottom: "16px",
                }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: "24px", height: "24px", borderRadius: "50%",
                    background: i === 0 ? C.sage : i === 1 ? C.accent : "#B87333",
                    color: "#FFFFFF", fontSize: "11px", fontWeight: 700,
                  }}>
                    {c.rank}
                  </span>
                  Rank #{c.rank}
                </div>
                <h3 style={{ fontSize: "24px", fontWeight: 800, color: C.text, letterSpacing: "-0.02em", margin: "0 0 6px" }}>
                  {c.name}
                </h3>
                <div style={{ fontSize: "12px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace", marginBottom: "24px" }}>
                  {c.sector}
                </div>

                {/* Big score */}
                <div style={{ display: "flex", alignItems: "flex-end", gap: "16px", marginBottom: "24px" }}>
                  <div>
                    <div style={{ fontSize: "48px", fontWeight: 900, color: C.sage, fontFamily: "'JetBrains Mono', monospace", lineHeight: 0.9, letterSpacing: "-0.04em" }}>
                      {c.score}
                    </div>
                    <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "4px" }}>
                      Reputation Score
                    </div>
                  </div>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: "4px",
                    fontSize: "12px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                    color: c.trend === "up" ? C.sage : C.red, padding: "4px 8px",
                    borderRadius: "4px", background: c.trend === "up" ? "rgba(74,123,95,0.08)" : "rgba(160,82,75,0.08)",
                    marginBottom: "6px",
                  }}>
                    {c.trend === "up" ? "▲" : "▼"} {c.change}
                  </div>
                </div>

                {/* Pillar breakdown */}
                <div style={{ display: "flex", height: "8px", borderRadius: "4px", overflow: "hidden", marginBottom: "12px", background: C.surfaceAlt }}>
                  <div style={{ width: `${c.innovation.weight}%`, background: C.sage }} title={`Innovation ${c.innovation.weight}%`} />
                  <div style={{ width: `${c.performance.weight}%`, background: C.accent }} title={`Performance ${c.performance.weight}%`} />
                  <div style={{ width: `${c.purpose.weight}%`, background: "#B87333" }} title={`Purpose ${c.purpose.weight}%`} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.textMuted }}>
                  <span style={{ color: C.sage }}>● Innovation {c.innovation.weight}%</span>
                  <span style={{ color: C.accent }}>● Performance {c.performance.weight}%</span>
                  <span style={{ color: "#B87333" }}>● Purpose {c.purpose.weight}%</span>
                </div>

                {/* Share of voice */}
                <div style={{
                  marginTop: "20px", paddingTop: "20px", borderTop: `1px solid ${C.borderLight}`,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontSize: "20px", fontWeight: 700, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>
                      {c.shareOfVoice}%
                    </div>
                    <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Share of voice
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "20px", fontWeight: 700, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>
                      {c.articles}
                    </div>
                    <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Articles
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MAIN RANKING TABLE */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 32px 80px" }}>
        {/* Data source status banner */}
        {loading && (
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "10px 16px", marginBottom: "16px",
            background: C.surfaceAlt, border: `1px solid ${C.borderLight}`,
            borderRadius: "8px", fontSize: "12px", color: C.textMuted,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            <span style={{
              width: "8px", height: "8px", borderRadius: "50%",
              background: C.accent, animation: "pulse 1.5s infinite",
            }} />
            Loading live company data…
          </div>
        )}
        {!loading && error && (
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "10px 16px", marginBottom: "16px",
            background: "rgba(160,82,75,0.06)", border: `1px solid rgba(160,82,75,0.2)`,
            borderRadius: "8px", fontSize: "12px", color: C.red,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            <span style={{ fontWeight: 700 }}>⚠</span>
            Live data unavailable ({error}). Showing fallback dataset.
          </div>
        )}
        {!loading && !error && (
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "10px 16px", marginBottom: "16px",
            background: "rgba(74,123,95,0.06)", border: `1px solid rgba(74,123,95,0.2)`,
            borderRadius: "8px", fontSize: "12px", color: C.sage,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: C.sage }} />
            Live data: {companies.length} companies loaded from API
          </div>
        )}
        {/* Toolbar */}
        <div style={{
          display: "flex", gap: "12px", marginBottom: "24px",
          flexWrap: "wrap", alignItems: "center",
        }}>
          <input
            type="search"
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: "1", minWidth: "240px", padding: "12px 16px",
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px",
              fontSize: "14px", color: C.text, fontFamily: "'Inter', sans-serif", outline: "none",
            }}
          />
          <select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)} style={selectStyle}>
            {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} style={selectStyle}>
            <option value="rank">Sort: Rank</option>
            <option value="score">Sort: Score</option>
            <option value="sentiment">Sort: Sentiment</option>
            <option value="articles">Sort: Articles</option>
            <option value="innovation">Sort: Innovation</option>
            <option value="performance">Sort: Performance</option>
            <option value="purpose">Sort: Purpose</option>
          </select>
        </div>

        <div style={{ fontSize: "12px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace", marginBottom: "16px" }}>
          Showing {filtered.length} of {companies.length} companies · Click a row to expand details
        </div>

        {/* Table */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: "12px", overflow: "hidden", boxShadow: C.shadow,
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.surfaceAlt }}>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Company</th>
                <th style={thStyle}>Sector</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Score</th>
                <th style={{ ...thStyle, textAlign: "center" }}>
                  <span style={{ color: activePillar === "Innovation" ? C.sage : "inherit" }}>Innov.</span>
                </th>
                <th style={{ ...thStyle, textAlign: "center" }}>
                  <span style={{ color: activePillar === "Performance" ? C.sage : "inherit" }}>Perf.</span>
                </th>
                <th style={{ ...thStyle, textAlign: "center" }}>
                  <span style={{ color: activePillar === "Purpose" ? C.sage : "inherit" }}>Purpose</span>
                </th>
                <th style={{ ...thStyle, textAlign: "center" }}>SoC</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Trend</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Risk</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const isExpanded = expandedRow === c.rank;
                return (
                  <React.Fragment key={c.rank}>
                    <tr
                      style={{
                        borderBottom: `1px solid ${C.borderLight}`,
                        background: isExpanded ? C.surfaceAlt : "transparent",
                        cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                      onClick={() => setExpandedRow(isExpanded ? null : c.rank)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setExpandedRow(isExpanded ? null : c.rank);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-expanded={isExpanded}
                      aria-label={`${c.name}, rank ${c.rank}, score ${c.score}. Press Enter to ${isExpanded ? "collapse" : "expand"} details.`}
                      onMouseEnter={(e) => { if (!isExpanded) e.currentTarget.style.background = C.surfaceAlt; }}
                      onMouseLeave={(e) => { if (!isExpanded) e.currentTarget.style.background = "transparent"; }}
                    >
                      <td style={tdStyle}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          width: "32px", height: "32px", borderRadius: "8px",
                          background: c.rank <= 3 ? C.sage : c.rank <= 10 ? C.surfaceAlt : "transparent",
                          color: c.rank <= 3 ? "#FFFFFF" : C.text,
                          fontSize: "13px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                          border: c.rank <= 10 && c.rank > 3 ? `1px solid ${C.border}` : "none",
                        }}>
                          {c.rank}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 600, color: C.text }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {c.name}
                          {isExpanded && <span style={{ fontSize: "10px", color: C.textMuted }}>▾</span>}
                          {!isExpanded && <span style={{ fontSize: "10px", color: C.textMuted }}>▸</span>}
                        </div>
                      </td>
                      <td style={{ ...tdStyle, color: C.textMuted, fontSize: "12px" }}>{c.sector}</td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <span style={{
                          fontSize: "17px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
                          color: c.score >= 75 ? C.sage : c.score >= 55 ? C.accent : c.score >= 45 ? "#B87333" : C.red,
                        }}>
                          {c.score}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <PillarCell weight={c.innovation.weight} score={c.innovation.score} active={activePillar === "Innovation"} color={C.sage} />
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <PillarCell weight={c.performance.weight} score={c.performance.score} active={activePillar === "Performance"} color={C.accent} />
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <PillarCell weight={c.purpose.weight} score={c.purpose.score} active={activePillar === "Purpose"} color="#B87333" />
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center", fontFamily: "'JetBrains Mono', monospace", color: C.textSec, fontSize: "13px" }}>
                        {c.shareOfVoice}%
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "4px",
                          fontSize: "11px", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
                          color: c.trend === "up" ? C.sage : c.trend === "down" ? C.red : C.textMuted,
                          padding: "3px 7px", borderRadius: "4px",
                          background: c.trend === "up" ? "rgba(74,123,95,0.08)" : c.trend === "down" ? "rgba(160,82,75,0.08)" : C.surfaceAlt,
                        }}>
                          {c.trend === "up" ? "▲" : c.trend === "down" ? "▼" : "—"} {c.change}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <RiskBadge level={c.riskLevel} />
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr style={{ background: C.surfaceAlt }}>
                        <td colSpan={10} style={{ padding: "0" }}>
                          <ExpandedRow company={c} activePillar={activePillar} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Methodology */}
        <div style={{
          marginTop: "40px", padding: "28px 32px",
          background: C.surface, borderRadius: "12px",
          border: `1px solid ${C.border}`, boxShadow: C.shadow,
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            color: C.accent, letterSpacing: "0.12em", textTransform: "uppercase",
            marginBottom: "16px",
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.sage }} />
            Methodology — How we rank
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
          }}>
            {[
              { title: "1. Data Collection", body: "30+ Moroccan & African media sources (FR/AR/EN), Google News aggregation, 4 AI engines (ChatGPT, Perplexity, Gemini, Claude)." },
              { title: "2. Pillar Extraction", body: "HarchIQ identifies which articles discuss Innovation, Performance, or Purpose — and the specific themes within each." },
              { title: "3. Sentiment Scoring", body: "Entity-level sentiment analysis in 3 languages. Positive coverage boosts pillar scores; negative coverage drags them down." },
              { title: "4. Composite Score", body: "Overall reputation score = 40% media sentiment, 30% AI visibility, 20% volume, 10% source authority. Pillar weights show narrative composition." },
            ].map(s => (
              <div key={s.title}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: C.text, marginBottom: "6px" }}>
                  {s.title}
                </div>
                <div style={{ fontSize: "12px", color: C.textSec, lineHeight: 1.55 }}>
                  {s.body}
                </div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: "20px", paddingTop: "20px", borderTop: `1px solid ${C.borderLight}`,
            fontSize: "11px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace",
          }}>
            Data FY 2026 · Updated monthly · No surveys — pure data-driven ranking · Corporations ranked, not brands
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: C.text, color: "#FFFFFF",
        padding: "80px 32px", textAlign: "center",
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            color: C.sageBright, letterSpacing: "0.14em", textTransform: "uppercase",
            marginBottom: "16px",
          }}>
            Go beyond the ranking
          </div>
          <h2 style={{
            fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700,
            letterSpacing: "-0.03em", margin: "0 0 20px", color: "#FFFFFF",
          }}>
            See where you rank. Then fix what's hurting you.
          </h2>
          <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.7)", marginBottom: "32px", lineHeight: 1.6 }}>
            Get a full reputation audit with competitor benchmarks, AI visibility matrix, risk assessment,
            and 30+ key themes broken down by article. 10x deeper than this public ranking.
          </p>
          <a href="/atelier/audit" style={{
            display: "inline-block", padding: "16px 32px",
            background: C.sage, color: "#FFFFFF",
            fontSize: "15px", fontWeight: 600, textDecoration: "none",
            borderRadius: "8px", fontFamily: "'Inter', sans-serif",
            border: "none", cursor: "pointer",
          }}>
            Get your full audit →
          </a>
        </div>
      </section>

      {/* ─── Live Agent Ranking (real scraped data) ─── */}
      <LiveAgentRanking />

      <AtelierFooter />
      <BackToTop />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        a:focus-visible, button:focus-visible, input:focus-visible, select:focus-visible {
          outline: 2px solid ${C.accent}; outline-offset: 2px; border-radius: 4px;
        }
        @media (max-width: 900px) {
          table { font-size: 11px; }
          th, td { padding: 8px 6px !important; }
        }
      `}</style>
    </>
  );
}

// ─── Sub-components ─────────────────────────────────────────────

function PillarCell({ weight, score, active, color }: { weight: number; score: number; active: boolean; color: string }) {
  return (
    <div style={{
      display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "2px",
      padding: "4px 8px", borderRadius: "6px",
      background: active ? `${color}10` : "transparent",
      border: active ? `1px solid ${color}30` : "1px solid transparent",
      transition: "all 0.15s",
    }}>
      <span style={{
        fontSize: "13px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
        color: active ? color : C.text,
      }}>
        {score}
      </span>
      <span style={{
        fontSize: "9px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace",
      }}>
        {weight}%
      </span>
    </div>
  );
}

function RiskBadge({ level }: { level: "low" | "moderate" | "elevated" | "high" | "critical" }) {
  const colors: Record<string, { bg: string; text: string }> = {
    low: { bg: "rgba(74,123,95,0.1)", text: C.sage },
    moderate: { bg: "rgba(74,93,110,0.1)", text: C.accent },
    elevated: { bg: "rgba(184,115,51,0.1)", text: "#B87333" },
    high: { bg: "rgba(160,82,75,0.1)", text: C.red },
    critical: { bg: "rgba(160,40,40,0.15)", text: "#A02828" },
  };
  const c = colors[level];
  return (
    <span style={{
      display: "inline-block", padding: "3px 8px",
      fontSize: "10px", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
      color: c.text, background: c.bg, borderRadius: "4px",
      textTransform: "uppercase", letterSpacing: "0.06em",
    }}>
      {level}
    </span>
  );
}

function ExpandedRow({ company, activePillar }: { company: Company; activePillar: Pillar }) {
  const allThemes = [
    ...company.keyThemes.map(t => ({ ...t, pillar: t.theme === "Collaborations" || t.theme === "Products & services" || t.theme === "Technology" ? "Innovation" : t.theme === "Governance" || t.theme === "Growth" || t.theme === "Operations" ? "Performance" : "Purpose" })),
  ];

  const rd = company.riskDimensions;
  const riskAxes = ["Geopolitical", "Operational", "Financial", "Environmental", "Legal", "Consumer", "Technology"];
  const riskValues = [rd.geopolitical, rd.operational, rd.financial, rd.environmental, rd.legal, rd.consumer, rd.technology];
  const avgRisk = Math.round(riskValues.reduce((a, b) => a + b, 0) / riskValues.length);
  const maxRisk = Math.max(...riskValues);
  const maxRiskAxis = riskAxes[riskValues.indexOf(maxRisk)];

  return (
    <div style={{ padding: "24px 32px", background: C.surfaceAlt }}>
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
        gap: "32px", maxWidth: "1300px",
      }}>
        {/* Column 1: Quarterly trend + pillars */}
        <div>
          <div style={{
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            color: C.accent, letterSpacing: "0.1em", textTransform: "uppercase",
            marginBottom: "12px",
          }}>
            Quarterly trend (FY 2026)
          </div>
          <div style={{
            display: "flex", alignItems: "flex-end", gap: "12px",
            height: "120px", padding: "0 8px",
          }}>
            {company.quarterly.map((score, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                  fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
                  color: C.textSec, marginBottom: "6px", fontWeight: 600,
                }}>
                  {score}
                </div>
                <div style={{
                  width: "100%", maxWidth: "48px",
                  height: `${score}%`,
                  background: `linear-gradient(180deg, ${C.sage} 0%, ${C.sageBright} 100%)`,
                  borderRadius: "4px 4px 0 0",
                  transition: "height 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                }} />
                <div style={{
                  fontSize: "10px", color: C.textMuted,
                  fontFamily: "'JetBrains Mono', monospace",
                  marginTop: "6px",
                }}>
                  Q{i + 1}
                </div>
              </div>
            ))}
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
            gap: "12px", marginTop: "20px",
          }}>
            {(["Innovation", "Performance", "Purpose"] as Pillar[]).map(p => {
              const pd = p === "Innovation" ? company.innovation : p === "Performance" ? company.performance : company.purpose;
              const isActive = activePillar === p;
              return (
                <div key={p} style={{
                  padding: "12px", background: isActive ? C.surface : "transparent",
                  border: `1px solid ${isActive ? C.sage : C.border}`,
                  borderRadius: "8px",
                }}>
                  <div style={{
                    fontSize: "10px", fontFamily: "'JetBrains Mono', monospace",
                    color: C.textMuted, letterSpacing: "0.08em",
                    textTransform: "uppercase", marginBottom: "4px",
                  }}>
                    {p}
                  </div>
                  <div style={{
                    fontSize: "20px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
                    color: C.text, lineHeight: 1,
                  }}>
                    {pd.score}
                  </div>
                  <div style={{
                    fontSize: "10px", color: C.textMuted,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {pd.weight}% of narrative
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 2: Key Themes breakdown */}
        <div>
          <div style={{
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            color: C.accent, letterSpacing: "0.1em", textTransform: "uppercase",
            marginBottom: "12px",
          }}>
            Key Themes Score
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {allThemes.map(t => (
              <div key={t.theme} style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "10px 12px", background: C.surface,
                borderRadius: "6px", border: `1px solid ${C.borderLight}`,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: "13px", fontWeight: 600, color: C.text, marginBottom: "2px",
                  }}>
                    {t.theme}
                  </div>
                  <div style={{
                    fontSize: "10px", color: C.textMuted,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {t.pillar}
                  </div>
                </div>
                <div style={{
                  width: "100px", height: "6px", background: C.surfaceAlt,
                  borderRadius: "3px", overflow: "hidden",
                }}>
                  <div style={{
                    width: `${t.score}%`, height: "100%",
                    background: t.score >= 75 ? C.sage : t.score >= 55 ? C.accent : C.red,
                  }} />
                </div>
                <div style={{
                  fontSize: "13px", fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: C.text, minWidth: "32px", textAlign: "right",
                }}>
                  {t.score}
                </div>
                <div style={{
                  fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
                  color: t.trend > 0 ? C.sage : t.trend < 0 ? C.red : C.textMuted,
                  minWidth: "32px", textAlign: "right",
                }}>
                  {t.trend > 0 ? "▲" : t.trend < 0 ? "▼" : "—"} {Math.abs(t.trend)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Multi-axis risk comparison (7 dimensions, 0-100) */}
        <div>
          <div style={{
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            color: C.red, letterSpacing: "0.1em", textTransform: "uppercase",
            marginBottom: "12px",
          }}>
            Risk Profile · 7 Dimensions (0–100)
          </div>
          <div style={{
            padding: "16px", background: C.surface,
            border: `1px solid ${C.borderLight}`, borderRadius: "8px",
            display: "flex", justifyContent: "center",
          }}>
            <RadarChart
              axes={riskAxes}
              series={[{
                name: company.name,
                color: C.red,
                values: riskValues,
              }]}
              size={260}
            />
          </div>
          {/* Risk summary stats */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: "8px", marginTop: "12px",
          }}>
            <div style={{
              padding: "10px 12px", background: C.surface,
              border: `1px solid ${C.borderLight}`, borderRadius: "6px",
            }}>
              <div style={{
                fontSize: "10px", fontFamily: "'JetBrains Mono', monospace",
                color: C.textMuted, letterSpacing: "0.08em",
                textTransform: "uppercase", marginBottom: "4px",
              }}>
                Avg Risk
              </div>
              <div style={{
                fontSize: "20px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
                color: avgRisk >= 60 ? C.red : avgRisk >= 45 ? "#B87333" : C.sage,
                lineHeight: 1,
              }}>
                {avgRisk}
              </div>
            </div>
            <div style={{
              padding: "10px 12px", background: C.surface,
              border: `1px solid ${C.borderLight}`, borderRadius: "6px",
            }}>
              <div style={{
                fontSize: "10px", fontFamily: "'JetBrains Mono', monospace",
                color: C.textMuted, letterSpacing: "0.08em",
                textTransform: "uppercase", marginBottom: "4px",
              }}>
                Top Exposure
              </div>
              <div style={{
                fontSize: "13px", fontWeight: 700, color: C.red,
                lineHeight: 1.2,
              }}>
                {maxRiskAxis}
              </div>
              <div style={{
                fontSize: "11px", color: C.textMuted,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {maxRisk}/100
              </div>
            </div>
          </div>
          {/* Risk dimension bars */}
          <div style={{
            display: "flex", flexDirection: "column", gap: "6px", marginTop: "12px",
          }}>
            {riskAxes.map((axis, i) => {
              const val = riskValues[i];
              const barColor = val >= 65 ? C.red : val >= 50 ? "#B87333" : val >= 35 ? C.accent : C.sage;
              return (
                <div key={axis} style={{
                  display: "grid", gridTemplateColumns: "90px 1fr 32px",
                  gap: "8px", alignItems: "center",
                }}>
                  <span style={{
                    fontSize: "11px", color: C.textSec,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {axis}
                  </span>
                  <div style={{
                    height: "6px", background: C.surfaceAlt,
                    borderRadius: "3px", overflow: "hidden",
                  }}>
                    <div style={{
                      width: `${val}%`, height: "100%",
                      background: barColor, borderRadius: "3px",
                      transition: "width 0.4s ease",
                    }} />
                  </div>
                  <span style={{
                    fontSize: "11px", fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: barColor, textAlign: "right",
                  }}>
                    {val}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  padding: "12px 16px", background: C.surface, border: `1px solid ${C.border}`,
  borderRadius: "8px", fontSize: "13px", color: C.text,
  fontFamily: "'Inter', sans-serif", cursor: "pointer", outline: "none",
};

const thStyle: React.CSSProperties = {
  padding: "14px 12px", textAlign: "left", fontSize: "10px", fontWeight: 600,
  color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase",
  fontFamily: "'JetBrains Mono', monospace",
  borderBottom: `1px solid ${C.border}`,
};

const tdStyle: React.CSSProperties = {
  padding: "14px 12px", fontSize: "13px", color: C.textSec,
};

/* ─── Live Agent Ranking — real scraped data from /api/harch100-live ─── */
function LiveAgentRanking() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("");

  useEffect(() => {
    fetch("/api/harch100-live")
      .then((r) => r.json())
      .then((d) => { setData(d.data || []); setSource(d.source || ""); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const C = { bg: "#FAFAFA", surface: "#FFFFFF", border: "#E5E5E5", text: "#0A0A0A", textSec: "#525252", textMuted: "#71717A", accent: "#4A5D6E", sage: "#4A7B5F", red: "#A0524B" };

  return (
    <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 32px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #4A7B5F, #4A5D6E)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4z"/><path d="M9 12l2 2 4-4"/></svg>
        </span>
        <div>
          <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Live Agent Ranking
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: "4px 0 0", letterSpacing: "-0.02em" }}>
            Real HarchIQ Scores — scraped &amp; calculated by agents
          </h2>
        </div>
        <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, background: source === "agent-live" ? "#4A7B5F15" : "#71717A15", border: `1px solid ${source === "agent-live" ? "#4A7B5F30" : "#71717A30"}`, fontSize: 11, fontWeight: 700, color: source === "agent-live" ? C.sage : C.textMuted }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: source === "agent-live" ? C.sage : C.textMuted, animation: "pulse 2s infinite" }} />
          {source === "agent-live" ? "LIVE AGENTS" : "FALLBACK"}
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 48, color: C.textMuted, fontSize: 13 }}>Loading live agent data…</div>
      ) : (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#F8F8F8", borderBottom: `1px solid ${C.border}` }}>
                {["Rank", "Company", "Score", "Grade", "Trend", "Articles", "Sentiment"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row: any) => (
                <tr key={row.rank} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "12px 16px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: C.textMuted }}>#{row.rank}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: C.text }}>{row.name}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, color: C.text, minWidth: 28 }}>{row.score}</span>
                      <div style={{ width: 60, height: 5, borderRadius: 3, background: C.border, overflow: "hidden" }}>
                        <div style={{ width: `${row.score}%`, height: "100%", background: row.score >= 90 ? C.sage : row.score >= 75 ? "#D97706" : C.red, borderRadius: 3 }} />
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: row.score >= 90 ? C.sage : row.score >= 75 ? "#D97706" : C.red }}>{row.grade}</td>
                  <td style={{ padding: "12px 16px", fontSize: 16, color: row.trend === "up" ? C.sage : row.trend === "down" ? C.red : C.textMuted }}>{row.trend === "up" ? "↑" : row.trend === "down" ? "↓" : "→"}</td>
                  <td style={{ padding: "12px 16px", fontFamily: "'JetBrains Mono', monospace", color: C.textSec }}>{row.articles}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: row.sentiment === "positive" ? C.sage : row.sentiment === "negative" ? C.red : C.textMuted }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: row.sentiment === "positive" ? C.sage : row.sentiment === "negative" ? C.red : C.textMuted }} />
                      {row.sentiment}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: "12px 16px", background: "#F8F8F8", borderTop: `1px solid ${C.border}`, fontSize: 11, color: C.textMuted, textAlign: "center" }}>
            {source === "agent-live"
              ? "Live data — scraped by Harch Atelier agents from Moroccan media + classified by GLM-4"
              : "Fallback data — agents haven't run yet. Visit /api/cron/agents to trigger a cycle."}
          </div>
        </div>
      )}
    </section>
  );
}
