/**
 * Harch Atelier — Entities dataset (V18.0 market role)
 *
 * Deterministic, strictly-typed mock data for the Entities category — the
 * Moroccan company directory + HarchCorp peer benchmarking + watchlist.
 * REUSES `moroccanEquities` from `./market-data` as the seed of BVC-listed
 * companies and EXTENDS it with private Moroccan corporates (Al Mada, SNI,
 * Les Domaines Agricoles, Cosumar, Inwi, Taqa Morocco, etc.), HarchCorp
 * peers/competitors (Northwind, Vela Dynamics, Orbital Systems, Kessler &
 * Vale, Atlas Holdings) and key counterparties (Wafa Assurance, RMA, Saham,
 * AXA Maroc, Banque Populaire, Al Barid Bank, Bank Assafa).
 *
 * Conventions:
 *   - All monetary amounts in millions MAD (Moroccan dirham) unless noted.
 *   - All series deterministic (mulberry32 seeded, seed 20251118 — market role).
 *   - All companies Morocco-aware (real names, Casablanca/Rabat/Tanger HQs).
 *   - No `any`.
 */

import { moroccanEquities, type BvcSector } from "./market-data";

/* ------------------------------------------------------------------ */
/*  Common types                                                       */
/* ------------------------------------------------------------------ */

export type EntitySector =
  | BvcSector
  | "Holding"
  | "Insurance"
  | "Agri"
  | "Utilities"
  | "Automotive"
  | "Logistics";

export type EntityType =
  | "self"
  | "listed"
  | "private"
  | "peer"
  | "counterparty";

export type EntityStatus =
  | "active"
  | "watch"
  | "restricted"
  | "review"
  | "monitored";

export type MoroccanCity =
  | "Casablanca"
  | "Rabat"
  | "Tanger"
  | "Marrakech"
  | "Fès"
  | "Agadir"
  | "International";

export type RiskPillarKey =
  | "regulatory"
  | "cyber"
  | "financial"
  | "esg"
  | "geopolitical"
  | "reputational";

export interface EntityPillarScore {
  regulatory: number;
  cyber: number;
  financial: number;
  esg: number;
  geopolitical: number;
  reputational: number;
}

export interface EntityNewsItem {
  title: string;
  date: string; // ISO short
  outlet: string;
  sentiment: "positive" | "negative" | "neutral";
}

export interface EntityLeader {
  name: string;
  role: string;
  since: number;
}

export interface EntityShareholder {
  name: string;
  share: number; // 0-100 percent
  type: "Strategic" | "Institutional" | "State" | "Founder" | "Public Float";
}

export interface Entity {
  id: string;
  name: string;
  ticker: string | null;
  type: EntityType;
  sector: EntitySector;
  hq: MoroccanCity;
  country: string;
  employees: number;
  /** Revenue, MAD millions. */
  revenueM: number;
  /** Net income, MAD millions. */
  netIncomeM: number;
  /** Total assets, MAD millions. */
  assetsM: number;
  /** Market cap, MAD millions — null for private. */
  mktCapM: number | null;
  peRatio: number | null;
  dividendYield: number | null;
  /** 0-100 composite risk score. */
  riskScore: number;
  /** Per-pillar sub-scores, 0-100. */
  riskPillars: EntityPillarScore;
  /** -100 to +100 net sentiment. */
  sentiment: number;
  /** 12-month sentiment trend (12 points). */
  sentimentTrend12m: number[];
  lastNews: EntityNewsItem[];
  leadership: EntityLeader[];
  ownership: EntityShareholder[];
  status: EntityStatus;
  watchlisted: boolean;
  /** 20-point sparkline (price or sentiment proxy). */
  sparkline: number[];
}

/* ------------------------------------------------------------------ */
/*  Seeded PRNG (deterministic)                                        */
/* ------------------------------------------------------------------ */

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(20251118);

function ri(min: number, max: number): number {
  return Math.round(min + rng() * (max - min));
}

function rf(min: number, max: number, dp = 1): number {
  const v = min + rng() * (max - min);
  const f = Math.pow(10, dp);
  return Math.round(v * f) / f;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

/** Build a 12-month sentiment series ending at a target net score. */
function buildSentiment12m(endScore: number, vol: number): number[] {
  const out: number[] = [];
  let p = endScore - vol * 0.6;
  for (let i = 0; i < 12; i++) {
    const shock = (rng() - 0.5) * vol;
    p = Math.max(-95, Math.min(95, p + shock + (endScore - p) * 0.18));
    out.push(Math.round(p * 10) / 10);
  }
  out[11] = endScore;
  return out;
}

/** Build a 20-point sparkline ending at a target. */
function buildSparkline(end: number, volPct: number): number[] {
  const out: number[] = [];
  let p = end * (1 - volPct * 0.4);
  for (let i = 0; i < 20; i++) {
    const shock = (rng() - 0.5) * end * volPct;
    p = Math.max(0.5, p + shock + (end - p) * 0.22);
    out.push(Math.round(p * 100) / 100);
  }
  out[19] = end;
  return out;
}

function buildPillars(seed: number, base: number): EntityPillarScore {
  const r = mulberry32(seed);
  const jitter = (lo: number, hi: number) => Math.round(lo + r() * (hi - lo));
  return {
    regulatory: Math.max(8, Math.min(96, base + jitter(-12, 12))),
    cyber: Math.max(8, Math.min(96, base + jitter(-10, 14))),
    financial: Math.max(8, Math.min(96, base + jitter(-14, 10))),
    esg: Math.max(8, Math.min(96, base + jitter(-16, 14))),
    geopolitical: Math.max(8, Math.min(96, base + jitter(-18, 16))),
    reputational: Math.max(8, Math.min(96, base + jitter(-12, 12))),
  };
}

/** Composite score from a pillar map (rounded mean). */
function composite(p: EntityPillarScore): number {
  const v =
    (p.regulatory +
      p.cyber +
      p.financial +
      p.esg +
      p.geopolitical +
      p.reputational) /
    6;
  return Math.round(v * 10) / 10;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

export function formatMAD(n: number, dp = 2): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  });
}

export function formatCompactMAD(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}B`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}M`;
  return `${Math.round(n)}`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${Math.round(n)}`;
}

/* ------------------------------------------------------------------ */
/*  Sector color + chip tint (extends market-data sectorColor)         */
/* ------------------------------------------------------------------ */

export const sectorColor: Record<EntitySector, string> = {
  Banking: "#0ea5e9",
  Telecom: "#a855f7",
  "Real Estate": "#f59e0b",
  Construction: "#10b981",
  Materials: "#14b8a6",
  Consumer: "#ef4444",
  Energy: "#f97316",
  Pharma: "#84cc16",
  Tech: "#0891b2",
  Holding: "#64748b",
  Insurance: "#9333ea",
  Agri: "#65a30d",
  Utilities: "#0d9488",
  Automotive: "#e11d48",
  Logistics: "#7c3aed",
};

export const sectorChipTint: Record<EntitySector, string> = {
  Banking: "bg-sky-50 text-sky-700 ring-sky-200",
  Telecom: "bg-violet-50 text-violet-700 ring-violet-200",
  "Real Estate": "bg-amber-50 text-amber-700 ring-amber-200",
  Construction: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Materials: "bg-teal-50 text-teal-700 ring-teal-200",
  Consumer: "bg-rose-50 text-rose-700 ring-rose-200",
  Energy: "bg-orange-50 text-orange-700 ring-orange-200",
  Pharma: "bg-lime-50 text-lime-700 ring-lime-200",
  Tech: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  Holding: "bg-slate-100 text-slate-700 ring-slate-300",
  Insurance: "bg-purple-50 text-purple-700 ring-purple-200",
  Agri: "bg-lime-50 text-lime-700 ring-lime-200",
  Utilities: "bg-teal-50 text-teal-700 ring-teal-200",
  Automotive: "bg-rose-50 text-rose-700 ring-rose-200",
  Logistics: "bg-violet-50 text-violet-700 ring-violet-200",
};

export const typeTint: Record<EntityType, string> = {
  self: "bg-amber-100 text-amber-800 ring-amber-300",
  listed: "bg-sky-50 text-sky-700 ring-sky-200",
  private: "bg-slate-100 text-slate-700 ring-slate-200",
  peer: "bg-violet-50 text-violet-700 ring-violet-200",
  counterparty: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

export const typeLabel: Record<EntityType, string> = {
  self: "HarchCorp",
  listed: "BVC Listed",
  private: "Private",
  peer: "Peer",
  counterparty: "Counterparty",
};

export const statusTint: Record<EntityStatus, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  watch: "bg-amber-50 text-amber-700 ring-amber-200",
  restricted: "bg-rose-50 text-rose-700 ring-rose-200",
  review: "bg-sky-50 text-sky-700 ring-sky-200",
  monitored: "bg-violet-50 text-violet-700 ring-violet-200",
};

/** 6-pillar radar color palette (matches legal-data pillarColor). */
export const pillarColor: Record<RiskPillarKey, string> = {
  regulatory: "#9333ea", // purple
  cyber: "#0891b2", // cyan
  financial: "#0ea5e9", // sky
  esg: "#10b981", // emerald
  geopolitical: "#f59e0b", // amber
  reputational: "#e11d48", // rose
};

export const pillarLabel: Record<RiskPillarKey, string> = {
  regulatory: "Regulatory",
  cyber: "Cyber",
  financial: "Financial",
  esg: "ESG",
  geopolitical: "Geo",
  reputational: "Rep",
};

/* ------------------------------------------------------------------ */
/*  HarchCorp — the monitored self                                     */
/* ------------------------------------------------------------------ */

const harchcorpEntity: Entity = {
  id: "HRCH",
  name: "HarchCorp",
  ticker: "HRCH",
  type: "self",
  sector: "Tech",
  hq: "Casablanca",
  country: "Morocco",
  employees: 18420,
  revenueM: 24800,
  netIncomeM: 3120,
  assetsM: 41200,
  mktCapM: 38400,
  peRatio: 18.4,
  dividendYield: 1.2,
  riskScore: 72.4,
  riskPillars: buildPillars(101, 70),
  sentiment: -8,
  sentimentTrend12m: buildSentiment12m(-8, 22),
  lastNews: [
    { title: "SEC opens informal inquiry into Q4 revenue recognition", date: "2025-11-12", outlet: "Reuters", sentiment: "negative" },
    { title: "Ransomware affiliate claims exfiltration of 2.1 TB logistics data", date: "2025-11-11", outlet: "Bloomberg", sentiment: "negative" },
    { title: "HarchCorp announces new Casablanca Finance City HQ", date: "2025-11-08", outlet: "L'Économiste", sentiment: "positive" },
  ],
  leadership: [
    { name: "A. Marchetti", role: "Chief Executive Officer", since: 2018 },
    { name: "M. Dubois", role: "Chief Market Strategist", since: 2020 },
    { name: "L. Reyes", role: "General Counsel", since: 2019 },
    { name: "P. Novak", role: "Head of Communications", since: 2021 },
    { name: "T. Haddad", role: "Chief Financial Officer", since: 2017 },
    { name: "I. Mansouri", role: "Chief Operating Officer", since: 2022 },
  ],
  ownership: [
    { name: "Al Mada", share: 18.4, type: "Strategic" },
    { name: "Founder Family", share: 22.1, type: "Founder" },
    { name: "BlackRock", share: 5.6, type: "Institutional" },
    { name: "Public Float", share: 53.9, type: "Public Float" },
  ],
  status: "watch",
  watchlisted: true,
  sparkline: buildSparkline(72.4, 0.06),
};

/* ------------------------------------------------------------------ */
/*  Moroccan listed equities — REUSE moroccanEquities from market-data  */
/*  and EXTEND each with entity-grade fields.                           */
/* ------------------------------------------------------------------ */

interface ListedExtension {
  hq: MoroccanCity;
  employees: number;
  revenueM: number;
  netIncomeM: number;
  assetsM: number;
  dividendYield: number | null;
  status: EntityStatus;
  watchlisted: boolean;
  riskBase: number;
  sentiment: number;
  leadership: EntityLeader[];
  ownership: EntityShareholder[];
  lastNews: EntityNewsItem[];
}

const listedExtensions: Record<string, ListedExtension> = {
  ATW: {
    hq: "Casablanca",
    employees: 21340,
    revenueM: 34200,
    netIncomeM: 5240,
    assetsM: 412000,
    dividendYield: 4.6,
    status: "active",
    watchlisted: true,
    riskBase: 38,
    sentiment: 18,
    leadership: [
      { name: "Mohamed El Kettani", role: "Chairman & CEO", since: 2008 },
      { name: "Badr Eddine Zerhari", role: "Deputy GM", since: 2019 },
      { name: "Karim El Housni", role: "CFO", since: 2020 },
    ],
    ownership: [
      { name: "Al Mada", share: 30.6, type: "Strategic" },
      { name: "Société Générale", share: 5.7, type: "Institutional" },
      { name: "Public Float", share: 63.7, type: "Public Float" },
    ],
    lastNews: [
      { title: "Attijariwafa Bank reports 9M net income +6.4% YoY", date: "2025-11-10", outlet: "L'Économiste", sentiment: "positive" },
      { title: "AMMC fines Attijariwafa 4.2M MAD for disclosure delay", date: "2025-11-04", outlet: "Medias24", sentiment: "negative" },
      { title: "ATW expands sub-Saharan footprint with new Côte d'Ivoire branch", date: "2025-10-28", outlet: "Reuters", sentiment: "positive" },
    ],
  },
  IAM: {
    hq: "Rabat",
    employees: 11650,
    revenueM: 33800,
    netIncomeM: 4180,
    assetsM: 62400,
    dividendYield: 5.8,
    status: "active",
    watchlisted: true,
    riskBase: 32,
    sentiment: 14,
    leadership: [
      { name: "Jamel Belkhechih", role: "Chairman & CEO", since: 2024 },
      { name: "Tarik Senhaji", role: "Deputy GM", since: 2021 },
    ],
    ownership: [
      { name: "Étissalat (e&)", share: 53.0, type: "Strategic" },
      { name: "Al Mada", share: 12.0, type: "Strategic" },
      { name: "Public Float", share: 35.0, type: "Public Float" },
    ],
    lastNews: [
      { title: "Maroc Telecom Q3 revenue down 1.2% on fixed-line decline", date: "2025-11-09", outlet: "L'Économiste", sentiment: "negative" },
      { title: "IAM launches 5G standalone in Casablanca and Rabat", date: "2025-11-03", outlet: "Le Matin", sentiment: "positive" },
      { title: "Inwi-Maroctelecom interconnect dispute referred to ANRT", date: "2025-10-25", outlet: "Medias24", sentiment: "negative" },
    ],
  },
  BOA: {
    hq: "Casablanca",
    employees: 14200,
    revenueM: 19400,
    netIncomeM: 2120,
    assetsM: 248000,
    dividendYield: 5.1,
    status: "active",
    watchlisted: true,
    riskBase: 44,
    sentiment: 6,
    leadership: [
      { name: "Othman Benjelloun", role: "Chairman", since: 2004 },
      { name: "Mehdi Bengouam", role: "CEO", since: 2023 },
    ],
    ownership: [
      { name: "BMCE Bank (RMA)", share: 47.5, type: "Strategic" },
      { name: "Public Float", share: 52.5, type: "Public Float" },
    ],
    lastNews: [
      { title: "Bank of Africa opens new regional HQ in Abidjan", date: "2025-11-07", outlet: "Aujourd'hui le Maroc", sentiment: "positive" },
      { title: "BOA provisioning costs rise 11% on Sahel exposure", date: "2025-11-02", outlet: "La Vie Éco", sentiment: "negative" },
      { title: "Bank Al-Maghrib revises BOA Pillar 2 capital add-on", date: "2025-10-22", outlet: "Medias24", sentiment: "neutral" },
    ],
  },
  CIH: {
    hq: "Casablanca",
    employees: 3120,
    revenueM: 4480,
    netIncomeM: 720,
    assetsM: 58400,
    dividendYield: 3.4,
    status: "active",
    watchlisted: true,
    riskBase: 42,
    sentiment: 22,
    leadership: [
      { name: "Kamal Mokdad", role: "Chairman & CEO", since: 2021 },
    ],
    ownership: [
      { name: "Holmarcom Group", share: 51.0, type: "Strategic" },
      { name: "Public Float", share: 49.0, type: "Public Float" },
    ],
    lastNews: [
      { title: "CIH Bank launches digital-only sub-brand 'CIH Smart'", date: "2025-11-06", outlet: "Le Matin", sentiment: "positive" },
      { title: "CIH leads syndicate for 1.8B MAD Tanger-Med expansion", date: "2025-10-29", outlet: "L'Économiste", sentiment: "positive" },
    ],
  },
  LBV: {
    hq: "Casablanca",
    employees: 7800,
    revenueM: 13800,
    netIncomeM: 720,
    assetsM: 9400,
    dividendYield: 2.1,
    status: "active",
    watchlisted: false,
    riskBase: 40,
    sentiment: 16,
    leadership: [
      { name: "Mohamed El Bouhlal", role: "CEO", since: 2014 },
    ],
    ownership: [
      { name: "Carrefour Group", share: 39.0, type: "Strategic" },
      { name: "Public Float", share: 61.0, type: "Public Float" },
    ],
    lastNews: [
      { title: "Label'Vie opens 12th hypermarket in Marrakech", date: "2025-11-08", outlet: "Aujourd'hui le Maroc", sentiment: "positive" },
      { title: "LBV partners with Glovo for 30-min grocery delivery", date: "2025-10-30", outlet: "TelQuel", sentiment: "positive" },
    ],
  },
  OLC: {
    hq: "Casablanca",
    employees: 1640,
    revenueM: 4280,
    netIncomeM: 380,
    assetsM: 5200,
    dividendYield: 6.2,
    status: "active",
    watchlisted: false,
    riskBase: 36,
    sentiment: 8,
    leadership: [
      { name: "Mohamed Sbia", role: "Chairman & CEO", since: 2010 },
    ],
    ownership: [
      { name: "SNI", share: 35.4, type: "Strategic" },
      { name: "Public Float", share: 64.6, type: "Public Float" },
    ],
    lastNews: [
      { title: "LesieurCristal flags input-cost pressure on Q3 margins", date: "2025-11-05", outlet: "L'Économiste", sentiment: "negative" },
      { title: "OLC wins 2025 AFMA edible-oils quality award", date: "2025-10-24", outlet: "Le Matin", sentiment: "positive" },
    ],
  },
  MNG: {
    hq: "Casablanca",
    employees: 4100,
    revenueM: 5840,
    netIncomeM: 540,
    assetsM: 14200,
    dividendYield: 4.4,
    status: "watch",
    watchlisted: true,
    riskBase: 52,
    sentiment: -4,
    leadership: [
      { name: "Mohammed Said Ouhou", role: "Chairman", since: 2022 },
    ],
    ownership: [
      { name: "Al Mada", share: 69.0, type: "Strategic" },
      { name: "Public Float", share: 31.0, type: "Public Float" },
    ],
    lastNews: [
      { title: "Managem halts Guemassa cobalt operations after safety incident", date: "2025-11-09", outlet: "Medias24", sentiment: "negative" },
      { title: "Gold prices lift Managem 9M EBITDA +14%", date: "2025-11-03", outlet: "L'Économiste", sentiment: "positive" },
    ],
  },
  LHM: {
    hq: "Casablanca",
    employees: 1820,
    revenueM: 7240,
    netIncomeM: 1180,
    assetsM: 12400,
    dividendYield: 3.6,
    status: "active",
    watchlisted: false,
    riskBase: 38,
    sentiment: 12,
    leadership: [
      { name: "Juan Esteban Gil", role: "Chairman & CEO", since: 2020 },
    ],
    ownership: [
      { name: "LafargeHolcim Group", share: 64.6, type: "Strategic" },
      { name: "Public Float", share: 35.4, type: "Public Float" },
    ],
    lastNews: [
      { title: "LafargeHolcim Maroc commissions new low-carbon kiln at Bouskoura", date: "2025-11-07", outlet: "L'Économiste", sentiment: "positive" },
      { title: "Construction slowdown trims LHM volumes 4% QoQ", date: "2025-10-28", outlet: "La Vie Éco", sentiment: "negative" },
    ],
  },
  CFG: {
    hq: "Casablanca",
    employees: 640,
    revenueM: 1180,
    netIncomeM: 240,
    assetsM: 22400,
    dividendYield: 3.2,
    status: "watch",
    watchlisted: true,
    riskBase: 50,
    sentiment: -2,
    leadership: [
      { name: "Said El Himmass", role: "Chairman", since: 2019 },
    ],
    ownership: [
      { name: "SNI", share: 41.5, type: "Strategic" },
      { name: "Public Float", share: 58.5, type: "Public Float" },
    ],
    lastNews: [
      { title: "CFG Bank AML control gap cited by ANRT-linked review", date: "2025-11-08", outlet: "Medias24", sentiment: "negative" },
      { title: "CFG mandates arranger for first MAD green bond", date: "2025-10-30", outlet: "L'Économiste", sentiment: "positive" },
    ],
  },
  ADH: {
    hq: "Casablanca",
    employees: 1980,
    revenueM: 4120,
    netIncomeM: 580,
    assetsM: 18400,
    dividendYield: 6.8,
    status: "watch",
    watchlisted: true,
    riskBase: 54,
    sentiment: -6,
    leadership: [
      { name: "Anas Sefrioui", role: "Chairman & CEO", since: 2006 },
    ],
    ownership: [
      { name: "SNI", share: 71.7, type: "Strategic" },
      { name: "Public Float", share: 28.3, type: "Public Float" },
    ],
    lastNews: [
      { title: "Addoha 9M presales collapse 28% on housing demand slide", date: "2025-11-09", outlet: "L'Économiste", sentiment: "negative" },
      { title: "Addoha refocuses on affordable housing in secondary cities", date: "2025-10-26", outlet: "Aujourd'hui le Maroc", sentiment: "neutral" },
    ],
  },
  RIS: {
    hq: "Casablanca",
    employees: 540,
    revenueM: 980,
    netIncomeM: 110,
    assetsM: 6800,
    dividendYield: 5.0,
    status: "watch",
    watchlisted: false,
    riskBase: 56,
    sentiment: -8,
    leadership: [
      { name: "Hicham El Amrani", role: "Chairman", since: 2020 },
    ],
    ownership: [
      { name: "Addoha", share: 64.5, type: "Strategic" },
      { name: "Public Float", share: 35.5, type: "Public Float" },
    ],
    lastNews: [
      { title: "Risma hospitality revenue down 18% on softer tourism mix", date: "2025-11-04", outlet: "La Vie Éco", sentiment: "negative" },
    ],
  },
  TQM: {
    hq: "Casablanca",
    employees: 720,
    revenueM: 1840,
    netIncomeM: 140,
    assetsM: 3200,
    dividendYield: 4.6,
    status: "active",
    watchlisted: false,
    riskBase: 44,
    sentiment: 4,
    leadership: [
      { name: "Ali Berrada", role: "Chairman & CEO", since: 2016 },
    ],
    ownership: [
      { name: "Public Float", share: 100.0, type: "Public Float" },
    ],
    lastNews: [
      { title: "Tourest rebound continues as summer bookings normalize", date: "2025-11-06", outlet: "Le Matin", sentiment: "positive" },
    ],
  },
  TIM: {
    hq: "Tanger",
    employees: 880,
    revenueM: 1620,
    netIncomeM: 130,
    assetsM: 4200,
    dividendYield: 5.4,
    status: "active",
    watchlisted: false,
    riskBase: 42,
    sentiment: 8,
    leadership: [
      { name: "Karim Tazi", role: "Chairman", since: 2018 },
    ],
    ownership: [
      { name: "Public Float", share: 100.0, type: "Public Float" },
    ],
    lastNews: [
      { title: "Timar port throughput at Tanger Med up 9% in Q3", date: "2025-11-05", outlet: "L'Économiste", sentiment: "positive" },
    ],
  },
  CDM: {
    hq: "Casablanca",
    employees: 1840,
    revenueM: 2480,
    netIncomeM: 320,
    assetsM: 36400,
    dividendYield: 4.2,
    status: "active",
    watchlisted: false,
    riskBase: 40,
    sentiment: 10,
    leadership: [
      { name: "Christian Edmond Ntap", role: "CEO", since: 2022 },
    ],
    ownership: [
      { name: "Crédit Agricole S.A.", share: 78.7, type: "Strategic" },
      { name: "Public Float", share: 21.3, type: "Public Float" },
    ],
    lastNews: [
      { title: "Crédit du Maroc accelerates SME digital lending rollout", date: "2025-11-07", outlet: "Aujourd'hui le Maroc", sentiment: "positive" },
    ],
  },
  SGT: {
    hq: "Casablanca",
    employees: 460,
    revenueM: 920,
    netIncomeM: 60,
    assetsM: 1800,
    dividendYield: 2.8,
    status: "active",
    watchlisted: false,
    riskBase: 48,
    sentiment: 2,
    leadership: [
      { name: "Yassine Sabri", role: "Chairman", since: 2019 },
    ],
    ownership: [
      { name: "Public Float", share: 100.0, type: "Public Float" },
    ],
    lastNews: [
      { title: "Saga Africa announces Mozambique agri-trading JV", date: "2025-11-03", outlet: "La Vie Éco", sentiment: "positive" },
    ],
  },
  "M2M": {
    hq: "Casablanca",
    employees: 1240,
    revenueM: 1980,
    netIncomeM: 180,
    assetsM: 3400,
    dividendYield: 3.0,
    status: "active",
    watchlisted: false,
    riskBase: 46,
    sentiment: 6,
    leadership: [
      { name: "Jaouad Kettani", role: "Chairman & CEO", since: 2008 },
    ],
    ownership: [
      { name: "Public Float", share: 100.0, type: "Public Float" },
    ],
    lastNews: [
      { title: "M2M Group wins Senegal customs modernization contract", date: "2025-11-08", outlet: "L'Économiste", sentiment: "positive" },
    ],
  },
  DIS: {
    hq: "Casablanca",
    employees: 920,
    revenueM: 1280,
    netIncomeM: 90,
    assetsM: 2400,
    dividendYield: 3.4,
    status: "active",
    watchlisted: false,
    riskBase: 44,
    sentiment: 0,
    leadership: [
      { name: "Hassan Chami", role: "Chairman & CEO", since: 2012 },
    ],
    ownership: [
      { name: "Public Float", share: 100.0, type: "Public Float" },
    ],
    lastNews: [
      { title: "Discom IT distribution margins pressured by FX move", date: "2025-11-02", outlet: "Medias24", sentiment: "negative" },
    ],
  },
  OCP: {
    hq: "Casablanca",
    employees: 21300,
    revenueM: 88400,
    netIncomeM: 14200,
    assetsM: 96400,
    dividendYield: 4.0,
    status: "watch",
    watchlisted: true,
    riskBase: 40,
    sentiment: 18,
    leadership: [
      { name: "Mostafa Terrab", role: "Chairman & CEO", since: 2008 },
      { name: "Arndt Frielitz", role: "CFO", since: 2021 },
    ],
    ownership: [
      { name: "Kingdom of Morocco", share: 75.0, type: "State" },
      { name: "Public Float", share: 25.0, type: "Public Float" },
    ],
    lastNews: [
      { title: "OCP Group launches 1.6B MAD green hydrogen pilot at Jorf Lasfar", date: "2025-11-10", outlet: "Reuters", sentiment: "positive" },
      { title: "Phosphate rock prices ease 4% on softer Brazilian demand", date: "2025-11-04", outlet: "Bloomberg", sentiment: "negative" },
      { title: "OCP signs 5-year offtake with Indian Potash Ltd", date: "2025-10-29", outlet: "L'Économiste", sentiment: "positive" },
    ],
  },
};

/** Convert a listed Equity from market-data into a full Entity. */
function listedToEntity(ticker: string): Entity {
  const eq = moroccanEquities.find((e) => e.ticker === ticker);
  if (!eq) throw new Error(`Equity ${ticker} not found in moroccanEquities`);
  const ext = listedExtensions[ticker];
  const pillars = buildPillars(200 + ticker.charCodeAt(0) + ticker.charCodeAt(1) % 256, ext.riskBase);
  return {
    id: ticker,
    name: eq.name,
    ticker,
    type: "listed",
    sector: eq.sector,
    hq: ext.hq,
    country: "Morocco",
    employees: ext.employees,
    revenueM: ext.revenueM,
    netIncomeM: ext.netIncomeM,
    assetsM: ext.assetsM,
    mktCapM: eq.mktCapM,
    peRatio: eq.peRatio,
    dividendYield: ext.dividendYield,
    riskScore: composite(pillars),
    riskPillars: pillars,
    sentiment: ext.sentiment,
    sentimentTrend12m: buildSentiment12m(ext.sentiment, 18),
    lastNews: ext.lastNews,
    leadership: ext.leadership,
    ownership: ext.ownership,
    status: ext.status,
    watchlisted: ext.watchlisted,
    sparkline: buildSparkline(eq.last, 0.04),
  };
}

const listedEntities: Entity[] = moroccanEquities.map((eq) => listedToEntity(eq.ticker));

/* ------------------------------------------------------------------ */
/*  Private Moroccan corporates (not BVC-listed)                       */
/* ------------------------------------------------------------------ */

interface PrivateSeed {
  id: string;
  name: string;
  sector: EntitySector;
  hq: MoroccanCity;
  employees: number;
  revenueM: number;
  netIncomeM: number;
  assetsM: number;
  status: EntityStatus;
  watchlisted: boolean;
  riskBase: number;
  sentiment: number;
  leadership: EntityLeader[];
  ownership: EntityShareholder[];
  lastNews: EntityNewsItem[];
}

const privateSeeds: PrivateSeed[] = [
  {
    id: "ALMADA",
    name: "Al Mada",
    sector: "Holding",
    hq: "Casablanca",
    employees: 480,
    revenueM: 0, // holding — investment income, not consolidated rev
    netIncomeM: 3200,
    assetsM: 32000,
    status: "monitored",
    watchlisted: true,
    riskBase: 36,
    sentiment: 16,
    leadership: [
      { name: "Hassan Ouriaghli", role: "CEO", since: 2022 },
      { name: "Abdelmounim Rachidi", role: "Chairman", since: 2018 },
    ],
    ownership: [
      { name: "Kingdom of Morocco", share: 100.0, type: "State" },
    ],
    lastNews: [
      { title: "Al Mada exits 4.2% stake in TotalEnergies for €1.4B", date: "2025-11-09", outlet: "Reuters", sentiment: "positive" },
      { title: "Al Mada increases position in Bank of Africa to 47.5%", date: "2025-10-27", outlet: "L'Économiste", sentiment: "positive" },
      { title: "Sovereign fund governance review surfaces 3 board conflicts", date: "2025-10-18", outlet: "Medias24", sentiment: "negative" },
    ],
  },
  {
    id: "SNI",
    name: "SNI (Société Nationale d'Investissement)",
    sector: "Holding",
    hq: "Casablanca",
    employees: 320,
    revenueM: 0,
    netIncomeM: 2400,
    assetsM: 24800,
    status: "monitored",
    watchlisted: true,
    riskBase: 42,
    sentiment: 8,
    leadership: [
      { name: "Fouad Douiri", role: "Chairman & CEO", since: 2016 },
    ],
    ownership: [
      { name: "Al Mada", share: 100.0, type: "Strategic" },
    ],
    lastNews: [
      { title: "SNI restructures into 4 verticals: mining, telecom, retail, finance", date: "2025-11-05", outlet: "L'Économiste", sentiment: "neutral" },
      { title: "SNI-backed Nareva wins 1.2GW Egypt wind PPA", date: "2025-10-22", outlet: "Reuters", sentiment: "positive" },
    ],
  },
  {
    id: "LDA",
    name: "Les Domaines Agricoles",
    sector: "Agri",
    hq: "Marrakech",
    employees: 9800,
    revenueM: 6840,
    netIncomeM: 720,
    assetsM: 14200,
    status: "monitored",
    watchlisted: false,
    riskBase: 38,
    sentiment: 14,
    leadership: [
      { name: "Brahim El Mansouri", role: "CEO", since: 2019 },
    ],
    ownership: [
      { name: "Al Mada", share: 60.0, type: "Strategic" },
      { name: "Founder Family", share: 40.0, type: "Founder" },
    ],
    lastNews: [
      { title: "Les Domaines Agricoles launches 12MW solar-drip irrigation pilot", date: "2025-11-06", outlet: "Aujourd'hui le Maroc", sentiment: "positive" },
      { title: "Drought cuts Domaines Agricoles citrus yield 14%", date: "2025-10-25", outlet: "L'Économiste", sentiment: "negative" },
    ],
  },
  {
    id: "COSUMAR",
    name: "Cosumar",
    sector: "Agri",
    hq: "Casablanca",
    employees: 5200,
    revenueM: 12400,
    netIncomeM: 980,
    assetsM: 18200,
    status: "active",
    watchlisted: false,
    riskBase: 36,
    sentiment: 18,
    leadership: [
      { name: "Mohamed Fikrat", role: "Chairman & CEO", since: 2014 },
    ],
    ownership: [
      { name: "SNI", share: 73.5, type: "Strategic" },
      { name: "Public Float", share: 26.5, type: "Public Float" },
    ],
    lastNews: [
      { title: "Cosumar completes 540M MAD sugar refinery upgrade at Souss", date: "2025-11-07", outlet: "L'Économiste", sentiment: "positive" },
      { title: "Sugar import quotas tightened; Cosumar domestic share +3pp", date: "2025-10-29", outlet: "Le Matin", sentiment: "positive" },
    ],
  },
  {
    id: "INWI",
    name: "Inwi (Wana Corporate)",
    sector: "Telecom",
    hq: "Rabat",
    employees: 3800,
    revenueM: 11800,
    netIncomeM: 880,
    assetsM: 21400,
    status: "watch",
    watchlisted: true,
    riskBase: 48,
    sentiment: 4,
    leadership: [
      { name: "Khalid Ben Sbihi", role: "Chairman", since: 2020 },
      { name: "Nicolas Rineau", role: "CEO", since: 2022 },
    ],
    ownership: [
      { name: "SNI", share: 70.0, type: "Strategic" },
      { name: "Zain Group", share: 30.0, type: "Strategic" },
    ],
    lastNews: [
      { title: "Inwi-Maroctelecom interconnect dispute referred to ANRT", date: "2025-11-04", outlet: "Medias24", sentiment: "negative" },
      { title: "Inwi Mobile Money crosses 6M active wallets", date: "2025-10-22", outlet: "L'Économiste", sentiment: "positive" },
    ],
  },
  {
    id: "TAQA",
    name: "Taqa Morocco",
    sector: "Energy",
    hq: "Casablanca",
    employees: 1840,
    revenueM: 9420,
    netIncomeM: 1240,
    assetsM: 28400,
    status: "active",
    watchlisted: true,
    riskBase: 44,
    sentiment: 6,
    leadership: [
      { name: "Abdelkader El Amrani", role: "Chairman", since: 2021 },
    ],
    ownership: [
      { name: "TAQA Group (UAE)", share: 64.0, type: "Strategic" },
      { name: "Public Float", share: 36.0, type: "Public Float" },
    ],
    lastNews: [
      { title: "Taqa Morocco Jorf Lasfar units 4-6 refurbishment on schedule", date: "2025-11-08", outlet: "L'Économiste", sentiment: "positive" },
      { title: "Coal supply chain disruption trims Q3 generation 3%", date: "2025-10-28", outlet: "Medias24", sentiment: "negative" },
    ],
  },
  {
    id: "NAREVA",
    name: "Nareva Holding",
    sector: "Energy",
    hq: "Casablanca",
    employees: 2200,
    revenueM: 6800,
    netIncomeM: 820,
    assetsM: 24800,
    status: "monitored",
    watchlisted: false,
    riskBase: 40,
    sentiment: 16,
    leadership: [
      { name: "Mounir El Bari", role: "Chairman & CEO", since: 2019 },
    ],
    ownership: [
      { name: "SNI", share: 100.0, type: "Strategic" },
    ],
    lastNews: [
      { title: "Nareva wins 1.2GW Egypt wind PPA", date: "2025-11-06", outlet: "Reuters", sentiment: "positive" },
      { title: "Nareva 320MW Morocco solar farm energized at Noor Midelt II", date: "2025-10-24", outlet: "L'Économiste", sentiment: "positive" },
    ],
  },
  {
    id: "MARSAMAROC",
    name: "Marsa Maroc",
    sector: "Logistics",
    hq: "Casablanca",
    employees: 4600,
    revenueM: 3480,
    netIncomeM: 540,
    assetsM: 12400,
    status: "active",
    watchlisted: false,
    riskBase: 42,
    sentiment: 12,
    leadership: [
      { name: "Benjamin Adda", role: "CEO", since: 2021 },
    ],
    ownership: [
      { name: "Kingdom of Morocco", share: 60.0, type: "State" },
      { name: "CMA CGM", share: 32.0, type: "Strategic" },
      { name: "Public Float", share: 8.0, type: "Public Float" },
    ],
    lastNews: [
      { title: "Marsa Maroc Tanger Med throughput up 12% on Africa transshipment", date: "2025-11-07", outlet: "L'Économiste", sentiment: "positive" },
      { title: "Marsa Maroc Casablanca port labor strike averted after wage deal", date: "2025-10-26", outlet: "Medias24", sentiment: "positive" },
    ],
  },
  {
    id: "AUTOHALL",
    name: "Auto Hall",
    sector: "Automotive",
    hq: "Casablanca",
    employees: 3200,
    revenueM: 18400,
    netIncomeM: 680,
    assetsM: 9400,
    status: "active",
    watchlisted: false,
    riskBase: 40,
    sentiment: 8,
    leadership: [
      { name: "Ali Kettani", role: "Chairman & CEO", since: 2010 },
    ],
    ownership: [
      { name: "Holmarcom Group", share: 68.4, type: "Strategic" },
      { name: "Public Float", share: 31.6, type: "Public Float" },
    ],
    lastNews: [
      { title: "Auto Hall signs Morocco assembly deal with Ford for Ranger EV", date: "2025-11-09", outlet: "L'Économiste", sentiment: "positive" },
      { title: "Truck sales soften as freight demand slows", date: "2025-10-29", outlet: "Le Matin", sentiment: "negative" },
    ],
  },
  {
    id: "LYDEC",
    name: "Lydec (Suez)",
    sector: "Utilities",
    hq: "Casablanca",
    employees: 5800,
    revenueM: 8400,
    netIncomeM: 420,
    assetsM: 22400,
    status: "review",
    watchlisted: false,
    riskBase: 52,
    sentiment: -8,
    leadership: [
      { name: "Mohamed Hijri", role: "CEO", since: 2020 },
    ],
    ownership: [
      { name: "Veolia (post-2022 transfer)", share: 100.0, type: "Strategic" },
    ],
    lastNews: [
      { title: "Lydec under review for Casablanca flooding response", date: "2025-11-08", outlet: "TelQuel", sentiment: "negative" },
      { title: "Lydec investment plan: 4.2B MAD over 2025-2027 for water grid", date: "2025-10-22", outlet: "L'Économiste", sentiment: "positive" },
    ],
  },
];

function privateToEntity(seed: PrivateSeed): Entity {
  const pillars = buildPillars(400 + seed.id.charCodeAt(0) * 31, seed.riskBase);
  return {
    id: seed.id,
    name: seed.name,
    ticker: null,
    type: "private",
    sector: seed.sector,
    hq: seed.hq,
    country: "Morocco",
    employees: seed.employees,
    revenueM: seed.revenueM,
    netIncomeM: seed.netIncomeM,
    assetsM: seed.assetsM,
    mktCapM: null,
    peRatio: null,
    dividendYield: null,
    riskScore: composite(pillars),
    riskPillars: pillars,
    sentiment: seed.sentiment,
    sentimentTrend12m: buildSentiment12m(seed.sentiment, 18),
    lastNews: seed.lastNews,
    leadership: seed.leadership,
    ownership: seed.ownership,
    status: seed.status,
    watchlisted: seed.watchlisted,
    sparkline: buildSparkline(composite(pillars), 0.05),
  };
}

const privateEntities: Entity[] = privateSeeds.map(privateToEntity);

/* ------------------------------------------------------------------ */
/*  HarchCorp peers / competitors                                      */
/* ------------------------------------------------------------------ */

interface PeerSeed {
  id: string;
  name: string;
  ticker: string;
  sector: EntitySector;
  hq: MoroccanCity;
  employees: number;
  revenueM: number; // USD-equivalent in MAD millions (1 USD ~ 10 MAD)
  netIncomeM: number;
  assetsM: number;
  mktCapM: number;
  peRatio: number;
  status: EntityStatus;
  riskBase: number;
  sentiment: number;
  leadership: EntityLeader[];
  ownership: EntityShareholder[];
  lastNews: EntityNewsItem[];
}

const peerSeeds: PeerSeed[] = [
  {
    id: "PEER-NW",
    name: "Northwind Analytics",
    ticker: "NW",
    sector: "Tech",
    hq: "International",
    employees: 12400,
    revenueM: 18600,
    netIncomeM: 1980,
    assetsM: 28400,
    mktCapM: 31200,
    peRatio: 17.2,
    status: "monitored",
    riskBase: 56,
    sentiment: -4,
    leadership: [
      { name: "Sarah Mendelsohn", role: "CEO", since: 2017 },
      { name: "Pedro Vargas", role: "CFO", since: 2020 },
    ],
    ownership: [
      { name: "Sequoia Capital", share: 14.0, type: "Institutional" },
      { name: "Founder Family", share: 18.6, type: "Founder" },
      { name: "Public Float", share: 67.4, type: "Public Float" },
    ],
    lastNews: [
      { title: "Northwind Q3 ARR +14% but churn ticks to 6.8%", date: "2025-11-09", outlet: "Bloomberg", sentiment: "neutral" },
      { title: "Northwind poaches HarchCorp EMEA GM for CEO role", date: "2025-10-22", outlet: "Reuters", sentiment: "negative" },
    ],
  },
  {
    id: "PEER-VL",
    name: "Vela Dynamics",
    ticker: "VELA",
    sector: "Tech",
    hq: "International",
    employees: 6800,
    revenueM: 9800,
    netIncomeM: 740,
    assetsM: 14200,
    mktCapM: 16800,
    peRatio: 22.8,
    status: "monitored",
    riskBase: 60,
    sentiment: -8,
    leadership: [
      { name: "Aiko Nakamura", role: "CEO", since: 2019 },
    ],
    ownership: [
      { name: "Tiger Global", share: 12.0, type: "Institutional" },
      { name: "Founder Family", share: 24.0, type: "Founder" },
      { name: "Public Float", share: 64.0, type: "Public Float" },
    ],
    lastNews: [
      { title: "Vela Dynamics under EU GDPR review for ad-tech data flows", date: "2025-11-08", outlet: "FT", sentiment: "negative" },
      { title: "Vela expands real-time risk feed to 47 exchanges", date: "2025-10-30", outlet: "Bloomberg", sentiment: "positive" },
    ],
  },
  {
    id: "PEER-ORB",
    name: "Orbital Systems",
    ticker: "ORB",
    sector: "Tech",
    hq: "International",
    employees: 9200,
    revenueM: 14200,
    netIncomeM: 1480,
    assetsM: 21800,
    mktCapM: 24800,
    peRatio: 19.4,
    status: "monitored",
    riskBase: 50,
    sentiment: 6,
    leadership: [
      { name: "Henrik Lindqvist", role: "CEO", since: 2016 },
    ],
    ownership: [
      { name: "Public Float", share: 86.0, type: "Public Float" },
      { name: "Founder Family", share: 14.0, type: "Founder" },
    ],
    lastNews: [
      { title: "Orbital Systems completes acquisition of Mexican risk-data startup", date: "2025-11-07", outlet: "Reuters", sentiment: "positive" },
      { title: "Orbital posts record backlog on LATAM sovereign contracts", date: "2025-10-28", outlet: "Bloomberg", sentiment: "positive" },
    ],
  },
  {
    id: "PEER-KV",
    name: "Kessler & Vale",
    ticker: "KV",
    sector: "Tech",
    hq: "International",
    employees: 4600,
    revenueM: 6400,
    netIncomeM: 540,
    assetsM: 8400,
    mktCapM: 9200,
    peRatio: 16.4,
    status: "monitored",
    riskBase: 58,
    sentiment: -2,
    leadership: [
      { name: "Rolf Kessler", role: "Chairman", since: 2009 },
    ],
    ownership: [
      { name: "Founder Family", share: 32.0, type: "Founder" },
      { name: "Public Float", share: 68.0, type: "Public Float" },
    ],
    lastNews: [
      { title: "Kessler & Vale loses German Bundesbank reference contract", date: "2025-11-06", outlet: "FT", sentiment: "negative" },
      { title: "K&V expands into Morocco with Casablanca Finance City office", date: "2025-10-24", outlet: "L'Économiste", sentiment: "neutral" },
    ],
  },
  {
    id: "PEER-ATL",
    name: "Atlas Holdings",
    ticker: "ATLH",
    sector: "Holding",
    hq: "International",
    employees: 2200,
    revenueM: 4800,
    netIncomeM: 380,
    assetsM: 9400,
    mktCapM: 6800,
    peRatio: 14.2,
    status: "monitored",
    riskBase: 62,
    sentiment: -10,
    leadership: [
      { name: "Marcus Atlas", role: "Chairman & CEO", since: 2008 },
    ],
    ownership: [
      { name: "Founder Family", share: 41.0, type: "Founder" },
      { name: "Public Float", share: 59.0, type: "Public Float" },
    ],
    lastNews: [
      { title: "Atlas Holdings activist letter demands board refresh", date: "2025-11-09", outlet: "WSJ", sentiment: "negative" },
      { title: "Atlas divests sub-Saharan logging unit for ESG realignment", date: "2025-10-27", outlet: "Reuters", sentiment: "positive" },
    ],
  },
];

function peerToEntity(seed: PeerSeed): Entity {
  const pillars = buildPillars(700 + seed.id.charCodeAt(7) * 37, seed.riskBase);
  return {
    id: seed.id,
    name: seed.name,
    ticker: seed.ticker,
    type: "peer",
    sector: seed.sector,
    hq: seed.hq,
    country: "International",
    employees: seed.employees,
    revenueM: seed.revenueM,
    netIncomeM: seed.netIncomeM,
    assetsM: seed.assetsM,
    mktCapM: seed.mktCapM,
    peRatio: seed.peRatio,
    dividendYield: null,
    riskScore: composite(pillars),
    riskPillars: pillars,
    sentiment: seed.sentiment,
    sentimentTrend12m: buildSentiment12m(seed.sentiment, 22),
    lastNews: seed.lastNews,
    leadership: seed.leadership,
    ownership: seed.ownership,
    status: seed.status,
    watchlisted: false,
    sparkline: buildSparkline(seed.mktCapM, 0.07),
  };
}

const peerEntities: Entity[] = peerSeeds.map(peerToEntity);

/* ------------------------------------------------------------------ */
/*  Key counterparties (insurance + banks)                             */
/* ------------------------------------------------------------------ */

interface CtpSeed {
  id: string;
  name: string;
  ticker: string | null;
  sector: EntitySector;
  hq: MoroccanCity;
  employees: number;
  revenueM: number;
  netIncomeM: number;
  assetsM: number;
  mktCapM: number | null;
  peRatio: number | null;
  status: EntityStatus;
  riskBase: number;
  sentiment: number;
  leadership: EntityLeader[];
  ownership: EntityShareholder[];
  lastNews: EntityNewsItem[];
}

const counterpartySeeds: CtpSeed[] = [
  {
    id: "BCP",
    name: "Banque Centrale Populaire",
    ticker: "BCP",
    sector: "Banking",
    hq: "Casablanca",
    employees: 13400,
    revenueM: 18800,
    netIncomeM: 2480,
    assetsM: 284000,
    mktCapM: 32400,
    peRatio: 9.4,
    status: "active",
    riskBase: 40,
    sentiment: 12,
    leadership: [
      { name: "Mohamed Karim Mounir", role: "Chairman & CEO", since: 2018 },
    ],
    ownership: [
      { name: "Banque Populaire Cooperative", share: 40.8, type: "Strategic" },
      { name: "Public Float", share: 59.2, type: "Public Float" },
    ],
    lastNews: [
      { title: "BCP 9M consolidated NII +8.2% YoY", date: "2025-11-08", outlet: "L'Économiste", sentiment: "positive" },
      { title: "BCP refinances 1.4B MAD sustainability-linked loan for OCP", date: "2025-10-28", outlet: "Medias24", sentiment: "positive" },
    ],
  },
  {
    id: "WAA",
    name: "Wafa Assurance",
    ticker: "WAA",
    sector: "Insurance",
    hq: "Casablanca",
    employees: 2400,
    revenueM: 9400,
    netIncomeM: 780,
    assetsM: 32400,
    mktCapM: 8200,
    peRatio: 10.4,
    status: "active",
    riskBase: 42,
    sentiment: 14,
    leadership: [
      { name: "Mohamed Nabil Berrada Sounni", role: "Chairman & CEO", since: 2017 },
    ],
    ownership: [
      { name: "Attijariwafa Bank", share: 64.8, type: "Strategic" },
      { name: "Public Float", share: 35.2, type: "Public Float" },
    ],
    lastNews: [
      { title: "Wafa Assurance life premiums +12% on unit-linked uptake", date: "2025-11-07", outlet: "L'Économiste", sentiment: "positive" },
      { title: "Wafa Assurance adopts IFRS 17 a year ahead of regulatory deadline", date: "2025-10-26", outlet: "La Vie Éco", sentiment: "positive" },
    ],
  },
  {
    id: "RMA",
    name: "RMA Watanya",
    ticker: "RMA",
    sector: "Insurance",
    hq: "Casablanca",
    employees: 1800,
    revenueM: 6400,
    netIncomeM: 480,
    assetsM: 21800,
    mktCapM: 5200,
    peRatio: 11.2,
    status: "active",
    riskBase: 44,
    sentiment: 8,
    leadership: [
      { name: "Hicham El Mamoun", role: "Chairman & CEO", since: 2019 },
    ],
    ownership: [
      { name: "Bank of Africa (BMCE)", share: 47.5, type: "Strategic" },
      { name: "Public Float", share: 52.5, type: "Public Float" },
    ],
    lastNews: [
      { title: "RMA Watanya motor combined ratio slips to 102.4%", date: "2025-11-05", outlet: "L'Économiste", sentiment: "negative" },
      { title: "RMA launches parametric crop insurance pilot with World Bank", date: "2025-10-24", outlet: "Aujourd'hui le Maroc", sentiment: "positive" },
    ],
  },
  {
    id: "SAHAM",
    name: "Saham Assurance Maroc",
    ticker: "SAH",
    sector: "Insurance",
    hq: "Casablanca",
    employees: 1400,
    revenueM: 4800,
    netIncomeM: 320,
    assetsM: 14200,
    mktCapM: 3400,
    peRatio: 9.8,
    status: "active",
    riskBase: 46,
    sentiment: 4,
    leadership: [
      { name: "Khalid Berrada", role: "Chairman", since: 2020 },
    ],
    ownership: [
      { name: "Saham Finances (Sanlam)", share: 84.9, type: "Strategic" },
      { name: "Public Float", share: 15.1, type: "Public Float" },
    ],
    lastNews: [
      { title: "Saham Assurance Morocco rebrands under Sanlam banner", date: "2025-11-06", outlet: "Le Matin", sentiment: "neutral" },
      { title: "Saham commercial auto book shrinks 9% on premium hike", date: "2025-10-25", outlet: "La Vie Éco", sentiment: "negative" },
    ],
  },
  {
    id: "AXA",
    name: "AXA Maroc",
    ticker: "AXA",
    sector: "Insurance",
    hq: "Casablanca",
    employees: 1600,
    revenueM: 7200,
    netIncomeM: 620,
    assetsM: 19800,
    mktCapM: 6400,
    peRatio: 12.6,
    status: "active",
    riskBase: 38,
    sentiment: 16,
    leadership: [
      { name: "Christophe Page", role: "Chairman & CEO", since: 2018 },
    ],
    ownership: [
      { name: "AXA Group", share: 75.0, type: "Strategic" },
      { name: "Public Float", share: 25.0, type: "Public Float" },
    ],
    lastNews: [
      { title: "AXA Maroc launches digital-first health product 'AXA Santé Direct'", date: "2025-11-08", outlet: "L'Économiste", sentiment: "positive" },
      { title: "AXA Maroc solvency II ratio at 218% (above 150% floor)", date: "2025-10-26", outlet: "Medias24", sentiment: "positive" },
    ],
  },
  {
    id: "ALBARID",
    name: "Al Barid Bank",
    ticker: null,
    sector: "Banking",
    hq: "Rabat",
    employees: 3400,
    revenueM: 2480,
    netIncomeM: 180,
    assetsM: 38400,
    mktCapM: null,
    peRatio: null,
    status: "review",
    riskBase: 52,
    sentiment: -2,
    leadership: [
      { name: "Ouafaa Tahri-Jeonk", role: "Chairwoman & CEO", since: 2021 },
    ],
    ownership: [
      { name: "Barid Al-Maghrib (State)", share: 100.0, type: "State" },
    ],
    lastNews: [
      { title: "Al Barid Bank microfinance portfolio NPL ratio rises to 8.4%", date: "2025-11-07", outlet: "Medias24", sentiment: "negative" },
      { title: "Al Barid Bank piloting postal-banking app for rural unbanked", date: "2025-10-24", outlet: "Aujourd'hui le Maroc", sentiment: "positive" },
    ],
  },
  {
    id: "ASSAFA",
    name: "Bank Assafa",
    ticker: null,
    sector: "Banking",
    hq: "Casablanca",
    employees: 480,
    revenueM: 620,
    netIncomeM: 64,
    assetsM: 6400,
    mktCapM: null,
    peRatio: null,
    status: "active",
    riskBase: 44,
    sentiment: 6,
    leadership: [
      { name: "Abdelmajid Idrissi Kaitouni", role: "Chairman", since: 2019 },
    ],
    ownership: [
      { name: "CIH Bank", share: 70.0, type: "Strategic" },
      { name: "Public Float", share: 30.0, type: "Public Float" },
    ],
    lastNews: [
      { title: "Bank Assafa opens 4th Casablanca branch — fully Sharia-compliant", date: "2025-11-06", outlet: "L'Économiste", sentiment: "positive" },
      { title: "Bank Assafa sukuk book reaches 1.2B MAD milestone", date: "2025-10-23", outlet: "La Vie Éco", sentiment: "positive" },
    ],
  },
];

function counterpartyToEntity(seed: CtpSeed): Entity {
  const pillars = buildPillars(900 + seed.id.charCodeAt(0) * 41, seed.riskBase);
  return {
    id: seed.id,
    name: seed.name,
    ticker: seed.ticker,
    type: "counterparty",
    sector: seed.sector,
    hq: seed.hq,
    country: "Morocco",
    employees: seed.employees,
    revenueM: seed.revenueM,
    netIncomeM: seed.netIncomeM,
    assetsM: seed.assetsM,
    mktCapM: seed.mktCapM,
    peRatio: seed.peRatio,
    dividendYield: null,
    riskScore: composite(pillars),
    riskPillars: pillars,
    sentiment: seed.sentiment,
    sentimentTrend12m: buildSentiment12m(seed.sentiment, 16),
    lastNews: seed.lastNews,
    leadership: seed.leadership,
    ownership: seed.ownership,
    status: seed.status,
    watchlisted: false,
    sparkline: buildSparkline(seed.assetsM / 100, 0.04),
  };
}

const counterpartyEntities: Entity[] = counterpartySeeds.map(counterpartyToEntity);

/* ------------------------------------------------------------------ */
/*  Master directory                                                   */
/* ------------------------------------------------------------------ */

/** Master directory of all monitored entities — HarchCorp + listed + private + peer + counterparty. */
export const entityDirectory: Entity[] = [
  harchcorpEntity,
  ...listedEntities,
  ...privateEntities,
  ...peerEntities,
  ...counterpartyEntities,
];

/** Quick lookup by id. */
export function findEntity(id: string): Entity | undefined {
  return entityDirectory.find((e) => e.id === id);
}

/** Quick lookup by name (case-insensitive substring). */
export function findEntityByName(query: string): Entity | undefined {
  const q = query.toLowerCase();
  return entityDirectory.find((e) => e.name.toLowerCase().includes(q));
}

/* ------------------------------------------------------------------ */
/*  Summary aggregations                                               */
/* ------------------------------------------------------------------ */

export const entitySummary = (() => {
  const total = entityDirectory.length;
  const byType: Record<EntityType, number> = {
    self: 0,
    listed: 0,
    private: 0,
    peer: 0,
    counterparty: 0,
  };
  const byStatus: Record<EntityStatus, number> = {
    active: 0,
    watch: 0,
    restricted: 0,
    review: 0,
    monitored: 0,
  };
  const bySector: Partial<Record<EntitySector, number>> = {};
  let watchlisted = 0;
  let totalEmployees = 0;
  let totalRevenue = 0;
  let totalAssets = 0;
  let totalMktCap = 0;
  let highRisk = 0; // risk >= 60
  let criticalRisk = 0; // risk >= 70
  for (const e of entityDirectory) {
    byType[e.type] += 1;
    byStatus[e.status] += 1;
    bySector[e.sector] = (bySector[e.sector] ?? 0) + 1;
    if (e.watchlisted) watchlisted += 1;
    totalEmployees += e.employees;
    totalRevenue += e.revenueM;
    totalAssets += e.assetsM;
    if (e.mktCapM) totalMktCap += e.mktCapM;
    if (e.riskScore >= 60) highRisk += 1;
    if (e.riskScore >= 70) criticalRisk += 1;
  }
  const avgRisk =
    Math.round(
      (entityDirectory.reduce((s, e) => s + e.riskScore, 0) / total) * 10,
    ) / 10;
  const avgSentiment =
    Math.round(
      (entityDirectory.reduce((s, e) => s + e.sentiment, 0) / total) * 10,
    ) / 10;
  return {
    total,
    byType,
    byStatus,
    bySector: bySector as Record<EntitySector, number>,
    watchlisted,
    totalEmployees,
    totalRevenue,
    totalAssets,
    totalMktCap,
    highRisk,
    criticalRisk,
    avgRisk,
    avgSentiment,
  };
})();

/** Risk distribution buckets for the directory donut. */
export const riskDistribution: { band: string; count: number; color: string }[] = [
  { band: "Low (<40)", count: entityDirectory.filter((e) => e.riskScore < 40).length, color: "#10b981" },
  { band: "Medium (40-55)", count: entityDirectory.filter((e) => e.riskScore >= 40 && e.riskScore < 55).length, color: "#f59e0b" },
  { band: "High (55-70)", count: entityDirectory.filter((e) => e.riskScore >= 55 && e.riskScore < 70).length, color: "#ea580c" },
  { band: "Critical (≥70)", count: entityDirectory.filter((e) => e.riskScore >= 70).length, color: "#e11d48" },
];

/* ------------------------------------------------------------------ */
/*  Moroccan-only subset                                               */
/* ------------------------------------------------------------------ */

/** All entities headquartered in Morocco — listed + private + counterparty (excludes HarchCorp self + international peers). */
export const moroccanEntities: Entity[] = entityDirectory.filter(
  (e) => e.country === "Morocco",
);

/** Moroccan city distribution — count by HQ city. */
export const moroccanCityDistribution: { city: string; count: number; share: number }[] = (() => {
  const counts = new Map<string, number>();
  for (const e of moroccanEntities) {
    counts.set(e.hq, (counts.get(e.hq) ?? 0) + 1);
  }
  const total = moroccanEntities.length;
  return Array.from(counts.entries())
    .map(([city, count]) => ({ city, count, share: Math.round((count / total) * 1000) / 10 }))
    .sort((a, b) => b.count - a.count);
})();

/** Sector × market-cap distribution (MAD millions) for Moroccan listed entities. */
export const moroccanSectorMktCap: { sector: string; mktCapM: number; color: string }[] = (() => {
  const m = new Map<string, number>();
  for (const e of moroccanEntities) {
    if (e.mktCapM) {
      m.set(e.sector, (m.get(e.sector) ?? 0) + e.mktCapM);
    }
  }
  return Array.from(m.entries())
    .map(([sector, mktCapM]) => ({ sector, mktCapM, color: sectorColor[sector as EntitySector] ?? "#64748b" }))
    .sort((a, b) => b.mktCapM - a.mktCapM);
})();

/* ------------------------------------------------------------------ */
/*  Top profiles — deep dossiers                                       */
/* ------------------------------------------------------------------ */

/** Top 8 profile entities (HarchCorp + the most strategically important Moroccan cos). */
export const topProfileIds: string[] = [
  "HRCH",
  "ATW",
  "OCP",
  "IAM",
  "BOA",
  "ALMADA",
  "SNI",
  "BCP",
];

export const topProfiles: Entity[] = topProfileIds
  .map((id) => findEntity(id))
  .filter((e): e is Entity => Boolean(e));

/* ------------------------------------------------------------------ */
/*  Peer groups — by sector                                            */
/* ------------------------------------------------------------------ */

export type PeerGroupKey =
  | "Banking"
  | "Telecom"
  | "Materials"
  | "Real Estate"
  | "Insurance";

export interface PeerGroup {
  key: PeerGroupKey;
  label: string;
  entities: Entity[];
}

const peerGroupKeys: PeerGroupKey[] = [
  "Banking",
  "Telecom",
  "Materials",
  "Real Estate",
  "Insurance",
];

export const peerGroups: PeerGroup[] = peerGroupKeys.map((k) => ({
  key: k,
  label: k === "Materials" ? "Materials & Mining" : k,
  entities: entityDirectory.filter((e) => e.sector === k),
}));

/** Peer benchmarking rows for a sector — revenue, margin, ROE, mkt cap, risk, sentiment. */
export interface PeerBenchmarkRow {
  id: string;
  name: string;
  ticker: string | null;
  revenueM: number;
  netIncomeM: number;
  /** Net margin, %. */
  marginPct: number;
  /** ROE, %. */
  roePct: number;
  mktCapM: number | null;
  riskScore: number;
  sentiment: number;
  employees: number;
}

export function peerBenchmarkRows(group: PeerGroup): PeerBenchmarkRow[] {
  return group.entities.map((e) => {
    const marginPct = e.revenueM > 0 ? Math.round((e.netIncomeM / e.revenueM) * 1000) / 10 : 0;
    const roePct =
      e.assetsM > 0
        ? Math.round((e.netIncomeM / (e.assetsM - (e.mktCapM ?? 0))) * 1000) / 10
        : 0;
    return {
      id: e.id,
      name: e.name,
      ticker: e.ticker,
      revenueM: e.revenueM,
      netIncomeM: e.netIncomeM,
      marginPct,
      roePct,
      mktCapM: e.mktCapM,
      riskScore: e.riskScore,
      sentiment: e.sentiment,
      employees: e.employees,
    };
  });
}

/** Scatter point for peer risk-vs-revenue bubble chart. */
export interface PeerScatterPoint {
  name: string;
  revenueM: number;
  riskScore: number;
  mktCapM: number;
  sector: string;
  color: string;
}

export function peerScatterData(group: PeerGroup): PeerScatterPoint[] {
  return group.entities
    .filter((e) => e.mktCapM !== null)
    .map((e) => ({
      name: e.name,
      revenueM: e.revenueM,
      riskScore: e.riskScore,
      mktCapM: e.mktCapM ?? 0,
      sector: e.sector,
      color: sectorColor[e.sector] ?? "#64748b",
    }));
}

/** 6-pillar radar series for up to 4 peers in a group. */
export function peerRadarData(group: PeerGroup): { pillar: string; [k: string]: number | string }[] {
  const pillars: RiskPillarKey[] = [
    "regulatory",
    "cyber",
    "financial",
    "esg",
    "geopolitical",
    "reputational",
  ];
  return pillars.map((p) => {
    const row: { pillar: string; [k: string]: number | string } = {
      pillar: pillarLabel[p],
    };
    group.entities.slice(0, 4).forEach((e) => {
      row[e.name] = e.riskPillars[p];
    });
    return row;
  });
}

/** Ranking bars — peers ranked by revenue, with risk overlay. */
export function peerRanking(group: PeerGroup, sortBy: "revenueM" | "riskScore" | "mktCapM" = "revenueM") {
  return [...group.entities].sort((a, b) => {
    const av = sortBy === "mktCapM" ? a.mktCapM ?? 0 : a[sortBy];
    const bv = sortBy === "mktCapM" ? b.mktCapM ?? 0 : b[sortBy];
    return bv - av;
  });
}

/* ------------------------------------------------------------------ */
/*  Watchlist — tracked entities with live signals                     */
/* ------------------------------------------------------------------ */

export type WatchlistSignalType =
  | "Risk score spike"
  | "Sentiment drop"
  | "News volume surge"
  | "Price gap"
  | "Insider activity"
  | "Regulatory filing"
  | "ESG downgrade"
  | "Cyber mention";

export interface WatchlistSignal {
  id: string;
  entityId: string;
  entityName: string;
  ticker: string | null;
  sector: EntitySector;
  type: WatchlistSignalType;
  pillar: RiskPillarKey;
  severity: "critical" | "high" | "medium" | "low";
  /** Sentiment delta vs prior session. */
  sentimentDelta: number;
  articles: number;
  updatedAt: string;
  /** 12-point sparkline of recent signal strength. */
  sparkline: number[];
}

const signalTypePillar: Record<WatchlistSignalType, RiskPillarKey> = {
  "Risk score spike": "regulatory",
  "Sentiment drop": "reputational",
  "News volume surge": "reputational",
  "Price gap": "financial",
  "Insider activity": "financial",
  "Regulatory filing": "regulatory",
  "ESG downgrade": "esg",
  "Cyber mention": "cyber",
};

const watchlistIds: string[] = [
  "HRCH",
  "ATW",
  "BOA",
  "CIH",
  "CFG",
  "ADH",
  "RIS",
  "OCP",
  "MNG",
  "IAM",
  "INWI",
  "TAQA",
  "ALMADA",
  "SNI",
  "BCP",
  "WAA",
];

const signalTypes: WatchlistSignalType[] = [
  "Risk score spike",
  "Sentiment drop",
  "News volume surge",
  "Regulatory filing",
  "Cyber mention",
  "ESG downgrade",
  "Price gap",
  "Insider activity",
];

const severities: Array<"critical" | "high" | "medium" | "low"> = [
  "critical",
  "high",
  "medium",
  "low",
];

const updatedAtOptions = [
  "2m ago", "8m ago", "14m ago", "27m ago", "42m ago", "1h ago",
  "1h ago", "2h ago", "2h ago", "3h ago", "3h ago", "4h ago",
  "4h ago", "5h ago", "6h ago", "7h ago",
];

export const entityWatchlist: WatchlistSignal[] = watchlistIds.map((id, i) => {
  const e = findEntity(id);
  if (!e) throw new Error(`Watchlist entity ${id} not found`);
  const type = signalTypes[i % signalTypes.length];
  const sev = severities[(Math.floor(i / 2) + (e.riskScore > 60 ? 0 : 1)) % severities.length];
  const delta = e.sentiment > 0 ? -rf(0.4, 3.2, 1) : -rf(1.2, 4.4, 1);
  const articles = ri(8, 86);
  return {
    id: `WLS-${String(i + 1).padStart(3, "0")}`,
    entityId: id,
    entityName: e.name,
    ticker: e.ticker,
    sector: e.sector,
    type,
    pillar: signalTypePillar[type],
    severity: sev,
    sentimentDelta: delta,
    articles,
    updatedAt: updatedAtOptions[i % updatedAtOptions.length],
    sparkline: buildSparkline(e.riskScore, 0.08),
  };
});

export const watchlistSummary = (() => {
  const bySeverity: Record<"critical" | "high" | "medium" | "low", number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };
  for (const s of entityWatchlist) bySeverity[s.severity] += 1;
  const totalArticles = entityWatchlist.reduce((s, w) => s + w.articles, 0);
  const avgDelta =
    Math.round(
      (entityWatchlist.reduce((s, w) => s + w.sentimentDelta, 0) /
        entityWatchlist.length) *
        10,
    ) / 10;
  return {
    total: entityWatchlist.length,
    bySeverity,
    totalArticles,
    avgDelta,
    critical: bySeverity.critical,
    high: bySeverity.high,
  };
})();

/* ------------------------------------------------------------------ */
/*  Overview aggregator                                                */
/* ------------------------------------------------------------------ */

export const entitiesOverview = {
  totalEntities: entitySummary.total,
  moroccanEntities: moroccanEntities.length,
  peerEntities: peerEntities.length,
  watchlisted: entitySummary.watchlisted,
  highRisk: entitySummary.highRisk,
  criticalRisk: entitySummary.criticalRisk,
  avgRisk: entitySummary.avgRisk,
  avgSentiment: entitySummary.avgSentiment,
  totalRevenueM: entitySummary.totalRevenue,
  totalAssetsM: entitySummary.totalAssets,
  totalMktCapM: entitySummary.totalMktCap,
  totalEmployees: entitySummary.totalEmployees,
};
