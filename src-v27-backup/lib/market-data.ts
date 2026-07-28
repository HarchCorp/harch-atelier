/**
 * Harch Atelier — Moroccan market dataset (V14.0 trader)
 *
 * Deterministic, strictly-typed mock data for the Bourse de Casablanca,
 * Moroccan listed equities, HarchCorp positions, MAD FX, commodities and
 * the Bank Al-Maghrib yield curve. Used by the trader-role section
 * components under `src/components/sections/trader/`.
 *
 * Conventions:
 *   - All prices in MAD (Moroccan dirham) unless otherwise noted.
 *   - All series deterministic (seeded PRNG) so first paint is stable.
 *   - No `any`.
 */

/* ------------------------------------------------------------------ */
/*  Common types                                                       */
/* ------------------------------------------------------------------ */

export type BvcSector =
  | "Banking"
  | "Telecom"
  | "Real Estate"
  | "Construction"
  | "Materials"
  | "Consumer"
  | "Energy"
  | "Pharma"
  | "Tech";

export interface SectorIndex {
  id: string;
  name: string;
  value: number;
  prevClose: number;
  chgPct: number;
  ytdPct: number;
  /** 30-trading-day close series. */
  series30d: number[];
}

export interface Equity {
  ticker: string;
  name: string;
  sector: BvcSector;
  last: number;
  prevClose: number;
  /** % change vs prevClose. */
  chgPct: number;
  volume: number;
  /** Market capitalisation in millions MAD. */
  mktCapM: number;
  peRatio: number;
  high52: number;
  low52: number;
  /** 30-trading-day close series (oldest → newest). */
  series30d: number[];
}

export interface IndexPoint {
  date: string; // ISO short
  masi: number;
  masi20: number;
}

export interface IntradayPoint {
  /** HH:mm label. */
  time: string;
  masi: number;
  masi20: number;
  volumeM: number; // turnover in millions MAD
}

export type PositionSide = "long" | "short";

export interface Position {
  id: string;
  ticker: string;
  name: string;
  sector: BvcSector;
  side: PositionSide;
  qty: number;
  avgPrice: number;
  last: number;
  /** Days since the position was opened. */
  daysHeld: number;
}

export interface FxPoint {
  date: string; // ISO short
  eurMad: number;
  usdMad: number;
  gbpMad: number;
}

export interface Commodity {
  id: string;
  name: string;
  unit: string;
  price: number;
  prevClose: number;
  chgPct: number;
  ytdPct: number;
  /** HarchCorp notional exposure in millions MAD. */
  exposureM: number;
  series30d: number[];
}

export interface YieldCurvePoint {
  tenor: string;
  tenorMonths: number;
  yield: number;
  prevYield: number;
}

export interface CorporateBond {
  isin: string;
  issuer: string;
  sector: BvcSector;
  coupon: number;
  maturity: string; // ISO short
  price: number;
  yield: number;
  rating: string;
  amountM: number; // outstanding in millions MAD
}

/* ------------------------------------------------------------------ */
/*  Seeded PRNG (deterministic)                                       */
/* ------------------------------------------------------------------ */

/** Mulberry32 — tiny deterministic PRNG so mock data is stable per build. */
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

/** Build a 30-trading-day series anchored at a target close. */
function buildSeries30d(seed: number, endPrice: number, dailyVolPct: number): number[] {
  const rng = mulberry32(seed);
  const out: number[] = [];
  // Walk backwards from endPrice to day 0 with mean-reverting noise.
  let p = endPrice;
  for (let i = 0; i < 30; i++) {
    out.unshift(p);
    const shock = (rng() - 0.5) * 2 * (p * dailyVolPct) / 100;
    p = Math.max(0.5, p - shock);
  }
  return out;
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

/* ------------------------------------------------------------------ */
/*  MASI index — 30d + intraday                                       */
/* ------------------------------------------------------------------ */

function buildMasi30d(): IndexPoint[] {
  const rng = mulberry32(20250117);
  const out: IndexPoint[] = [];
  let masi = 13850;
  let masi20 = 1455;
  for (let i = 29; i >= 0; i--) {
    const date = isoDaysAgo(i);
    masi = masi + (rng() - 0.45) * 35 + Math.sin(i / 4) * 6;
    masi20 = masi20 + (rng() - 0.45) * 4 + Math.sin(i / 5) * 1.2;
    out.push({
      date,
      masi: Math.round(masi * 100) / 100,
      masi20: Math.round(masi20 * 100) / 100,
    });
  }
  return out;
}

export const masi30d: IndexPoint[] = buildMasi30d();

/** Latest snapshot from the 30d series. */
export const masiLatest: IndexPoint = masi30d[masi30d.length - 1];
export const masiPrevClose: IndexPoint = masi30d[masi30d.length - 2];

function buildMasiIntraday(): IntradayPoint[] {
  const rng = mulberry32(98765);
  const out: IntradayPoint[] = [];
  // BVC trading session: 09:00 – 17:00 with 15-min ticks.
  const baseMasi = masiLatest.masi - 12;
  const baseMasi20 = masiLatest.masi20 - 1.5;
  for (let h = 9; h < 17; h++) {
    for (const m of [0, 15, 30, 45]) {
      if (h === 9 && m === 0) continue;
      const label = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      const t = (h - 9) * 4 + m / 15;
      const drift = Math.sin(t / 6) * 4 + (rng() - 0.5) * 9;
      const turnover = 120 + (rng() * 90) + (t > 16 ? 80 : 0);
      out.push({
        time: label,
        masi: Math.round((baseMasi + drift) * 100) / 100,
        masi20: Math.round((baseMasi20 + drift / 8) * 100) / 100,
        volumeM: Math.round(turnover),
      });
    }
  }
  return out;
}

export const masiIntraday: IntradayPoint[] = buildMasiIntraday();

/** MASI session statistics derived from the intraday tape. */
export const masiSessionStats = (() => {
  const advancers = 41;
  const decliners = 27;
  const unchanged = 13;
  const totalVolumeM = masiIntraday.reduce((s, p) => s + p.volumeM, 0);
  const turnoverM = totalVolumeM;
  const high = Math.max(...masiIntraday.map((p) => p.masi));
  const low = Math.min(...masiIntraday.map((p) => p.masi));
  const open = masiIntraday[0].masi;
  const last = masiIntraday[masiIntraday.length - 1].masi;
  return {
    advancers,
    decliners,
    unchanged,
    turnoverM: Math.round(turnoverM),
    high: Math.round(high * 100) / 100,
    low: Math.round(low * 100) / 100,
    open: Math.round(open * 100) / 100,
    last: Math.round(last * 100) / 100,
    chgFromOpen: Math.round((last - open) * 100) / 100,
  };
})();

/* ------------------------------------------------------------------ */
/*  Sector indices                                                     */
/* ------------------------------------------------------------------ */

export const sectorIndices: SectorIndex[] = [
  {
    id: "banks",
    name: "Banking",
    value: 24850.4,
    prevClose: 24721.9,
    chgPct: 0.52,
    ytdPct: 9.4,
    series30d: buildSeries30d(101, 24850.4, 1.1),
  },
  {
    id: "telecom",
    name: "Telecom",
    value: 4120.7,
    prevClose: 4144.2,
    chgPct: -0.57,
    ytdPct: 3.1,
    series30d: buildSeries30d(102, 4120.7, 0.9),
  },
  {
    id: "realestate",
    name: "Real Estate",
    value: 1985.2,
    prevClose: 1972.0,
    chgPct: 0.67,
    ytdPct: -2.4,
    series30d: buildSeries30d(103, 1985.2, 1.6),
  },
  {
    id: "construction",
    name: "Construction",
    value: 3210.8,
    prevClose: 3218.4,
    chgPct: -0.24,
    ytdPct: 5.7,
    series30d: buildSeries30d(104, 3210.8, 1.3),
  },
  {
    id: "materials",
    name: "Materials",
    value: 8765.1,
    prevClose: 8712.5,
    chgPct: 0.60,
    ytdPct: 11.2,
    series30d: buildSeries30d(105, 8765.1, 1.0),
  },
  {
    id: "consumer",
    name: "Consumer",
    value: 6420.9,
    prevClose: 6405.0,
    chgPct: 0.25,
    ytdPct: 4.8,
    series30d: buildSeries30d(106, 6420.9, 0.7),
  },
  {
    id: "energy",
    name: "Energy",
    value: 1530.3,
    prevClose: 1542.1,
    chgPct: -0.77,
    ytdPct: -3.5,
    series30d: buildSeries30d(107, 1530.3, 1.4),
  },
  {
    id: "pharma",
    name: "Pharma",
    value: 2890.6,
    prevClose: 2880.4,
    chgPct: 0.35,
    ytdPct: 7.2,
    series30d: buildSeries30d(108, 2890.6, 0.8),
  },
];

/* ------------------------------------------------------------------ */
/*  Moroccan listed equities (Casablanca Stock Exchange)               */
/* ------------------------------------------------------------------ */

interface EquitySeed {
  ticker: string;
  name: string;
  sector: BvcSector;
  last: number;
  prevClose: number;
  volume: number;
  mktCapM: number;
  peRatio: number;
  high52: number;
  low52: number;
}

const equitySeeds: EquitySeed[] = [
  { ticker: "ATW", name: "Attijariwafa Bank", sector: "Banking", last: 612.5, prevClose: 608.4, volume: 48200, mktCapM: 105200, peRatio: 11.2, high52: 638.0, low52: 472.0 },
  { ticker: "IAM", name: "Maroc Telecom", sector: "Telecom", last: 89.4, prevClose: 89.9, volume: 312000, mktCapM: 75800, peRatio: 14.6, high52: 96.2, low52: 78.5 },
  { ticker: "BOA", name: "Bank of Africa", sector: "Banking", last: 178.2, prevClose: 175.8, volume: 124000, mktCapM: 41200, peRatio: 9.8, high52: 192.0, low52: 142.0 },
  { ticker: "CIH", name: "CIH Bank", sector: "Banking", last: 268.0, prevClose: 263.5, volume: 18600, mktCapM: 9800, peRatio: 12.4, high52: 281.0, low52: 198.0 },
  { ticker: "LBV", name: "Label'Vie", sector: "Consumer", last: 1245.0, prevClose: 1232.0, volume: 4200, mktCapM: 14800, peRatio: 18.2, high52: 1320.0, low52: 980.0 },
  { ticker: "OLC", name: "LesieurCristal", sector: "Consumer", last: 168.5, prevClose: 170.2, volume: 8900, mktCapM: 5600, peRatio: 10.5, high52: 184.0, low52: 138.0 },
  { ticker: "MNG", name: "Managem", sector: "Materials", last: 132.8, prevClose: 130.5, volume: 42100, mktCapM: 7200, peRatio: 8.4, high52: 148.0, low52: 102.0 },
  { ticker: "LHM", name: "LafargeHolcim Maroc", sector: "Construction", last: 1820.0, prevClose: 1812.0, volume: 3100, mktCapM: 14400, peRatio: 15.7, high52: 1980.0, low52: 1620.0 },
  { ticker: "CFG", name: "CFG Bank", sector: "Banking", last: 245.0, prevClose: 244.5, volume: 9800, mktCapM: 4200, peRatio: 11.0, high52: 262.0, low52: 198.0 },
  { ticker: "ADH", name: "Addoha", sector: "Real Estate", last: 78.5, prevClose: 77.2, volume: 64200, mktCapM: 6800, peRatio: 7.8, high52: 92.0, low52: 64.0 },
  { ticker: "RIS", name: "Risma", sector: "Real Estate", last: 145.2, prevClose: 146.8, volume: 12400, mktCapM: 3200, peRatio: 13.2, high52: 168.0, low52: 118.0 },
  { ticker: "TQM", name: "Tourest", sector: "Consumer", last: 95.4, prevClose: 94.1, volume: 7200, mktCapM: 2800, peRatio: 16.8, high52: 108.0, low52: 76.0 },
  { ticker: "TIM", name: "Timar", sector: "Construction", last: 56.8, prevClose: 57.4, volume: 18900, mktCapM: 1500, peRatio: 9.1, high52: 64.0, low52: 42.0 },
  { ticker: "CDM", name: "Crédit du Maroc", sector: "Banking", last: 198.6, prevClose: 196.2, volume: 5400, mktCapM: 3600, peRatio: 10.7, high52: 218.0, low52: 162.0 },
  { ticker: "SGT", name: "Saga Africa", sector: "Tech", last: 312.0, prevClose: 305.5, volume: 2800, mktCapM: 1900, peRatio: 22.4, high52: 348.0, low52: 218.0 },
  { ticker: "M2M", name: "M2M Group", sector: "Tech", last: 218.5, prevClose: 222.0, volume: 6800, mktCapM: 2400, peRatio: 19.6, high52: 252.0, low52: 168.0 },
  { ticker: "DIS", name: "Discom", sector: "Tech", last: 95.8, prevClose: 96.4, volume: 11200, mktCapM: 1200, peRatio: 14.2, high52: 108.0, low52: 74.0 },
  { ticker: "OCP", name: "OCP Group", sector: "Materials", last: 198.4, prevClose: 196.8, volume: 88500, mktCapM: 86400, peRatio: 13.9, high52: 218.0, low52: 158.0 },
];

export const moroccanEquities: Equity[] = equitySeeds.map((s, i) => {
  const chgPct = Math.round(((s.last - s.prevClose) / s.prevClose) * 10000) / 100;
  const series30d = buildSeries30d(200 + i, s.last, 1.4);
  return { ...s, chgPct, series30d };
});

/* ------------------------------------------------------------------ */
/*  Session movers — top gainers / losers (derived from equities)      */
/* ------------------------------------------------------------------ */

export const topGainers = [...moroccanEquities]
  .sort((a, b) => b.chgPct - a.chgPct)
  .slice(0, 6);

export const topLosers = [...moroccanEquities]
  .sort((a, b) => a.chgPct - b.chgPct)
  .slice(0, 6);

export const mostActive = [...moroccanEquities]
  .sort((a, b) => b.volume - a.volume)
  .slice(0, 6);

/* ------------------------------------------------------------------ */
/*  HarchCorp open positions                                           */
/* ------------------------------------------------------------------ */

interface PositionSeed {
  id: string;
  ticker: string;
  name: string;
  sector: BvcSector;
  side: PositionSide;
  qty: number;
  avgPrice: number;
  last: number;
  daysHeld: number;
}

const positionSeeds: PositionSeed[] = [
  { id: "POS-0001", ticker: "ATW", name: "Attijariwafa Bank", sector: "Banking", side: "long", qty: 42000, avgPrice: 582.4, last: 612.5, daysHeld: 38 },
  { id: "POS-0002", ticker: "IAM", name: "Maroc Telecom", sector: "Telecom", side: "long", qty: 320000, avgPrice: 86.2, last: 89.4, daysHeld: 21 },
  { id: "POS-0003", ticker: "BOA", name: "Bank of Africa", sector: "Banking", side: "long", qty: 145000, avgPrice: 168.5, last: 178.2, daysHeld: 64 },
  { id: "POS-0004", ticker: "OCP", name: "OCP Group", sector: "Materials", side: "long", qty: 96000, avgPrice: 184.0, last: 198.4, daysHeld: 52 },
  { id: "POS-0005", ticker: "LHM", name: "LafargeHolcim Maroc", sector: "Construction", side: "long", qty: 8200, avgPrice: 1885.0, last: 1820.0, daysHeld: 17 },
  { id: "POS-0006", ticker: "LBV", name: "Label'Vie", sector: "Consumer", side: "long", qty: 5400, avgPrice: 1185.0, last: 1245.0, daysHeld: 28 },
  { id: "POS-0007", ticker: "MNG", name: "Managem", sector: "Materials", side: "long", qty: 78000, avgPrice: 124.5, last: 132.8, daysHeld: 44 },
  { id: "POS-0008", ticker: "ADH", name: "Addoha", sector: "Real Estate", side: "short", qty: 180000, avgPrice: 82.6, last: 78.5, daysHeld: 12 },
  { id: "POS-0009", ticker: "OLC", name: "LesieurCristal", sector: "Consumer", side: "long", qty: 28000, avgPrice: 174.2, last: 168.5, daysHeld: 9 },
  { id: "POS-0010", ticker: "CIH", name: "CIH Bank", sector: "Banking", side: "long", qty: 22000, avgPrice: 254.0, last: 268.0, daysHeld: 73 },
  { id: "POS-0011", ticker: "RIS", name: "Risma", sector: "Real Estate", side: "short", qty: 42000, avgPrice: 138.5, last: 145.2, daysHeld: 6 },
];

export const positions: Position[] = positionSeeds.map((s) => ({ ...s }));

/** Compute M2M P&L for a position (long: (last-avg)*qty; short: (avg-last)*qty). */
export function positionPnl(p: Position): number {
  const dir = p.side === "long" ? 1 : -1;
  return Math.round((p.last - p.avgPrice) * p.qty * dir * 100) / 100;
}

export function positionPnlPct(p: Position): number {
  const dir = p.side === "long" ? 1 : -1;
  return Math.round(((p.last - p.avgPrice) * dir / p.avgPrice) * 10000) / 100;
}

export function positionExposure(p: Position): number {
  return Math.round(p.qty * p.last * 100) / 100;
}

export function positionCost(p: Position): number {
  return Math.round(p.qty * p.avgPrice * 100) / 100;
}

/** Aggregate position summary. */
export const positionsSummary = (() => {
  const totalExposure = positions.reduce((s, p) => s + positionExposure(p), 0);
  const totalCost = positions.reduce((s, p) => s + positionCost(p), 0);
  const totalPnl = positions.reduce((s, p) => s + positionPnl(p), 0);
  const longExposure = positions
    .filter((p) => p.side === "long")
    .reduce((s, p) => s + positionExposure(p), 0);
  const shortExposure = positions
    .filter((p) => p.side === "short")
    .reduce((s, p) => s + positionExposure(p), 0);
  const winners = positions.filter((p) => positionPnl(p) > 0).length;
  const losers = positions.filter((p) => positionPnl(p) <= 0).length;
  return {
    totalExposure: Math.round(totalExposure),
    totalCost: Math.round(totalCost),
    totalPnl: Math.round(totalPnl),
    totalPnlPct: Math.round((totalPnl / totalCost) * 10000) / 100,
    longExposure: Math.round(longExposure),
    shortExposure: Math.round(shortExposure),
    longPct: Math.round((longExposure / (longExposure + shortExposure)) * 1000) / 10,
    shortPct: Math.round((shortExposure / (longExposure + shortExposure)) * 1000) / 10,
    winners,
    losers,
    count: positions.length,
  };
})();

/** Sector exposure breakdown for positions. */
export interface SectorExposure {
  sector: BvcSector;
  exposure: number;
  pnl: number;
  pct: number;
}

export const sectorExposures: SectorExposure[] = (() => {
  const map = new Map<BvcSector, { exposure: number; pnl: number }>();
  for (const p of positions) {
    const cur = map.get(p.sector) ?? { exposure: 0, pnl: 0 };
    cur.exposure += positionExposure(p);
    cur.pnl += positionPnl(p);
    map.set(p.sector, cur);
  }
  const total = [...map.values()].reduce((s, v) => s + v.exposure, 0);
  return [...map.entries()]
    .map(([sector, v]) => ({
      sector,
      exposure: Math.round(v.exposure),
      pnl: Math.round(v.pnl),
      pct: Math.round((v.exposure / total) * 1000) / 10,
    }))
    .sort((a, b) => b.exposure - a.exposure);
})();

/* ------------------------------------------------------------------ */
/*  MAD FX (EUR/MAD, USD/MAD, GBP/MAD) — 30d                          */
/* ------------------------------------------------------------------ */

function buildFx30d(): FxPoint[] {
  const rng = mulberry32(424242);
  const out: FxPoint[] = [];
  let eur = 10.82;
  let usd = 10.02;
  let gbp = 12.65;
  for (let i = 29; i >= 0; i--) {
    eur = eur + (rng() - 0.48) * 0.025 + Math.sin(i / 5) * 0.008;
    usd = usd + (rng() - 0.5) * 0.03 + Math.sin(i / 4) * 0.012;
    gbp = gbp + (rng() - 0.47) * 0.04 + Math.sin(i / 6) * 0.015;
    out.push({
      date: isoDaysAgo(i),
      eurMad: Math.round(eur * 10000) / 10000,
      usdMad: Math.round(usd * 10000) / 10000,
      gbpMad: Math.round(gbp * 10000) / 10000,
    });
  }
  return out;
}

export const fx30d: FxPoint[] = buildFx30d();
export const fxLatest: FxPoint = fx30d[fx30d.length - 1];
export const fxPrevClose: FxPoint = fx30d[fx30d.length - 2];

export interface FxRateMeta {
  pair: string;
  value: number;
  prevClose: number;
  chgPct: number;
  ytdPct: number;
}

export const fxRates: FxRateMeta[] = [
  {
    pair: "EUR/MAD",
    value: fxLatest.eurMad,
    prevClose: fxPrevClose.eurMad,
    chgPct: Math.round(((fxLatest.eurMad - fxPrevClose.eurMad) / fxPrevClose.eurMad) * 10000) / 100,
    ytdPct: 1.4,
  },
  {
    pair: "USD/MAD",
    value: fxLatest.usdMad,
    prevClose: fxPrevClose.usdMad,
    chgPct: Math.round(((fxLatest.usdMad - fxPrevClose.usdMad) / fxPrevClose.usdMad) * 10000) / 100,
    ytdPct: -0.8,
  },
  {
    pair: "GBP/MAD",
    value: fxLatest.gbpMad,
    prevClose: fxPrevClose.gbpMad,
    chgPct: Math.round(((fxLatest.gbpMad - fxPrevClose.gbpMad) / fxPrevClose.gbpMad) * 10000) / 100,
    ytdPct: 2.1,
  },
];

/** Bank Al-Maghrib policy rate (key rate). */
export const bamKeyRate = {
  current: 2.75,
  previous: 2.50,
  changeBps: 25,
  effectiveDate: "2024-12-19",
  nextMeeting: "2025-03-25",
  inflation: 1.2,
  inflationTarget: 2.0,
};

/** MAD nominal effective exchange rate (index, base 100 = 2020). */
export const madStrength = {
  index: 104.8,
  prev: 103.6,
  chgPct: 1.16,
  ytdPct: 2.4,
  dxyCorrelation: -0.62,
};

/* ------------------------------------------------------------------ */
/*  Commodities exposure board                                         */
/* ------------------------------------------------------------------ */

interface CommoditySeed {
  id: string;
  name: string;
  unit: string;
  price: number;
  prevClose: number;
  ytdPct: number;
  exposureM: number;
}

const commoditySeeds: CommoditySeed[] = [
  { id: "PHOS", name: "Phosphate Rock", unit: "USD/t", price: 385.0, prevClose: 378.5, ytdPct: 12.4, exposureM: 18200 },
  { id: "BRENT", name: "Brent Crude", unit: "USD/bbl", price: 78.42, prevClose: 79.85, ytdPct: -3.2, exposureM: 9400 },
  { id: "GOLD", name: "Gold (XAU)", unit: "USD/oz", price: 2648.0, prevClose: 2631.5, ytdPct: 24.6, exposureM: 4600 },
  { id: "WHEAT", name: "Wheat (CBOT)", unit: "USD/bu", price: 5.82, prevClose: 5.74, ytdPct: -8.5, exposureM: 2100 },
  { id: "NGAS", name: "Natural Gas", unit: "USD/MMBtu", price: 3.18, prevClose: 3.05, ytdPct: 18.4, exposureM: 1800 },
  { id: "SILVER", name: "Silver (XAG)", unit: "USD/oz", price: 30.8, prevClose: 30.4, ytdPct: 16.2, exposureM: 1200 },
];

export const commodities: Commodity[] = commoditySeeds.map((s, i) => {
  const chgPct = Math.round(((s.price - s.prevClose) / s.prevClose) * 10000) / 100;
  const series30d = buildSeries30d(700 + i, s.price, 2.2);
  return { ...s, chgPct, series30d };
});

/* ------------------------------------------------------------------ */
/*  Yield curve + corporate bonds                                      */
/* ------------------------------------------------------------------ */

export const yieldCurve: YieldCurvePoint[] = [
  { tenor: "13W", tenorMonths: 3, yield: 2.48, prevYield: 2.45 },
  { tenor: "26W", tenorMonths: 6, yield: 2.62, prevYield: 2.58 },
  { tenor: "52W", tenorMonths: 12, yield: 2.81, prevYield: 2.75 },
  { tenor: "2Y", tenorMonths: 24, yield: 2.95, prevYield: 2.88 },
  { tenor: "5Y", tenorMonths: 60, yield: 3.18, prevYield: 3.12 },
  { tenor: "10Y", tenorMonths: 120, yield: 3.42, prevYield: 3.36 },
  { tenor: "15Y", tenorMonths: 180, yield: 3.58, prevYield: 3.52 },
];

export const corporateBonds: CorporateBond[] = [
  { isin: "MA0000018ATW", issuer: "Attijariwafa Bank", sector: "Banking", coupon: 3.45, maturity: "2028-04-15", price: 101.4, yield: 3.18, rating: "A+", amountM: 1200 },
  { isin: "MA0000019BOA", issuer: "Bank of Africa", sector: "Banking", coupon: 3.60, maturity: "2029-06-10", price: 99.8, yield: 3.62, rating: "A", amountM: 850 },
  { isin: "MA0000020OCP", issuer: "OCP Group", sector: "Materials", coupon: 3.85, maturity: "2031-03-22", price: 102.6, yield: 3.51, rating: "A-", amountM: 2400 },
  { isin: "MA0000021IAM", issuer: "Maroc Telecom", sector: "Telecom", coupon: 3.30, maturity: "2027-09-30", price: 100.2, yield: 3.26, rating: "A+", amountM: 900 },
  { isin: "MA0000022LHM", issuer: "LafargeHolcim Maroc", sector: "Construction", coupon: 3.70, maturity: "2030-12-01", price: 100.9, yield: 3.54, rating: "A", amountM: 600 },
  { isin: "MA0000023LBV", issuer: "Label'Vie", sector: "Consumer", coupon: 4.10, maturity: "2028-07-18", price: 98.4, yield: 4.42, rating: "BBB+", amountM: 320 },
  { isin: "MA0000024MNG", issuer: "Managem", sector: "Materials", coupon: 4.40, maturity: "2030-05-05", price: 97.2, yield: 4.82, rating: "BBB", amountM: 280 },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

export const sectorColor: Record<BvcSector, string> = {
  Banking: "#0ea5e9",
  Telecom: "#a855f7",
  "Real Estate": "#f59e0b",
  Construction: "#10b981",
  Materials: "#14b8a6",
  Consumer: "#ef4444",
  Energy: "#f97316",
  Pharma: "#84cc16",
  Tech: "#6366f1",
};

export const sectorChipTint: Record<BvcSector, string> = {
  Banking: "bg-sky-50 text-sky-700 ring-sky-200",
  Telecom: "bg-violet-50 text-violet-700 ring-violet-200",
  "Real Estate": "bg-amber-50 text-amber-700 ring-amber-200",
  Construction: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Materials: "bg-teal-50 text-teal-700 ring-teal-200",
  Consumer: "bg-rose-50 text-rose-700 ring-rose-200",
  Energy: "bg-orange-50 text-orange-700 ring-orange-200",
  Pharma: "bg-lime-50 text-lime-700 ring-lime-200",
  Tech: "bg-indigo-50 text-indigo-700 ring-indigo-200",
};

export function formatMAD(n: number, dp = 2): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });
}

export function formatCompactMAD(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}B`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}M`;
  return `${Math.round(n)}`;
}

export function formatVolume(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

export function chgColor(chgPct: number): string {
  if (chgPct > 0) return "text-emerald-700";
  if (chgPct < 0) return "text-rose-700";
  return "text-slate-500";
}

export function chgBgClass(chgPct: number): string {
  if (chgPct > 0) return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  if (chgPct < 0) return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
  return "bg-slate-50 text-slate-600 ring-1 ring-slate-200";
}

/** Heat color for sector heatmap tiles (red-green diverging). */
export function heatColor(chgPct: number, max: number = 1.0): string {
  const t = Math.max(-1, Math.min(1, chgPct / (max * 1.2)));
  if (t > 0) {
    const alpha = 0.18 + t * 0.55;
    return `rgba(16, 185, 129, ${alpha.toFixed(2)})`;
  } else if (t < 0) {
    const alpha = 0.18 + Math.abs(t) * 0.55;
    return `rgba(225, 29, 72, ${alpha.toFixed(2)})`;
  }
  return "rgba(148, 163, 184, 0.12)";
}
