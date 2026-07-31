// ═══════════════════════════════════════════════════════════════
//  BVC PRICE FETCHER — Honest real-data layer for the Bourse
//  de Casablanca (BVC).
//
//  REALITY CHECK (2026-07-31, validated with live curl tests):
//  ─────────────────────────────────────────────────────────────
//  The BVC has NO free public API. The three potential free
//  sources were all tested live:
//
//  1. Yahoo Finance — has NO direct BVC coverage. The `.CA`
//     suffix that the original brief suggested is actually the
//     Canadian Securities Exchange, NOT Casablanca. The only
//     Moroccan-related listings on Yahoo are Euronext Paris /
//     LSE / Munich / Stuttgart GDRs for a single issuer
//     (Maroc Telecom, IAM). All other BVC tickers (OCP, ATW,
//     BCP, CIH, CFG, LAS, CSU, MNG, LHM, …) return 404.
//
//  2. Investing.com — returns HTTP 403 on direct fetch (Cloudflare
//     bot block). The scraping code below is written for the day
//     we add a residential proxy or an official API, but in the
//     current sandbox it returns `null`.
//
//  3. Stooq / MarketScreener — also blocked (JS challenge / 403).
//
//  HONEST STRATEGY (matches the brief's "NEVER fabricate prices"):
//  ─────────────────────────────────────────────────────────────
//  • `fetchYahooQuote` works for tickers Yahoo actually lists.
//    Today this means international GDRs (`IAM.PA`, `0MOS.L`, …).
//    For any BVC ticker that Yahoo does not list, it returns null.
//  • `fetchInvestingQuote` is implemented but currently always
//    returns null (403). It will light up the day we route via a
//    proxy.
//  • `fetchBVCQuote` chains Yahoo → Investing → null. Callers
//    MUST treat a null result as "no live data" and fall back to
//    the last cached price in the database (see
//    `src/app/api/trader/stream/route.ts`).
//  • For real BVC prices, the admin uploads a daily CSV via
//    `/api/admin/upload-prices`. Those rows are marked
//    `source: "manual"` and are the production source of truth.
//
//  This file is deliberately free of any price fabrication.
// ═══════════════════════════════════════════════════════════════

export type BVCSource = "yahoo" | "investing" | "manual" | "none";

export interface BVCQuote {
  ticker: string;
  name: string;
  price: number;
  changePct: number;
  volume: number | null;
  currency: string;
  exchange: string;
  fetchedAt: Date;
  source: BVCSource;
}

// ─── Yahoo Finance symbol remap ────────────────────────────────
//
// Yahoo uses its own suffixed symbols. BVC tickers do NOT map to
// `.CA` on Yahoo — `.CA` is Canadian. Instead, a handful of
// Moroccan issuers have international listings (GDRs) that Yahoo
// DOES index. We map the BVC ticker to the closest Yahoo symbol
// when one exists; everything else falls through to null.
//
// To add a new mapping, verify the Yahoo symbol exists at
// https://finance.yahoo.com/quote/<SYMBOL> first.
const YAHOO_SYMBOL_MAP: Record<string, string> = {
  // Maroc Telecom — listed on Euronext Paris, LSE, Munich,
  // Stuttgart. We pick the Paris listing (EUR, highest volume).
  IAM: "IAM.PA",
};

// Yahoo uses Canadian `.CA` suffix on Toronto / TSX-Venture. Some
// BVC tickers may collide with Canadian tickers (e.g. CFG is
// Country Garden Holdings on HKEX; MNG is Manning & Napier on
// NYQ). We NEVER want to silently serve a non-Moroccan price as a
// BVC quote. To prevent that, the Yahoo path only returns a quote
// when either:
//   (a) the ticker is in `YAHOO_SYMBOL_MAP` (verified mapping), or
//   (b) the returned `exchangeName` is in `YAHOO_ALLOWED_EXCHANGES`.
//
// This way, a fetch for "CFG.CA" that resolves to a Canadian
// ticker is rejected rather than shown to the user as a BVC price.
const YAHOO_ALLOWED_EXCHANGES = new Set([
  "PAR",   // Euronext Paris
  "LSE",   // London
  "MUN",   // Munich
  "STU",   // Stuttgart
  "BRU",   // Euronext Brussels
  "AMS",   // Euronext Amsterdam
]);

// ─── Yahoo Finance fetch ───────────────────────────────────────
//
// `https://query1.finance.yahoo.com/v8/finance/chart/<SYMBOL>`
// is the undocumented but stable chart endpoint. It returns the
// last close + intraday OHLCV. We use `meta.regularMarketPrice`
// as the current price and `meta.previousClose` to compute the
// % change.
//
// Rate-limit note: Yahoo soft-throttles at ~5 req/sec/IP. The cron
// job iterates sequentially with `await`, so we stay well under
// the limit. If we ever parallelise, batch with a 250ms gap.
export async function fetchYahooQuote(
  ticker: string,
): Promise<BVCQuote | null> {
  const upper = ticker.toUpperCase();

  // Resolve the Yahoo symbol. If the ticker has no verified
  // mapping we DO NOT try `${ticker}.CA` (Canadian exchange)
  // — that would silently return a non-Moroccan price. We return
  // null and let the caller fall back to cached data.
  const yahooSymbol = YAHOO_SYMBOL_MAP[upper];
  if (!yahooSymbol) return null;

  const url =
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}` +
    `?interval=1d&range=1d`;

  try {
    const res = await fetch(url, {
      // Yahoo occasionally 429s without a UA. We send a browser
      // UA + short cache-busting headers. `cache: "no-store"` so
      // Next.js never caches a stale price.
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; HarchAtelierBVC/1.0; +https://harchcorp.com)",
        Accept: "application/json",
      },
      cache: "no-store",
      // 6s is generous; Yahoo normally responds in <500ms.
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      chart?: {
        result?: Array<{
          meta: {
            symbol: string;
            regularMarketPrice: number;
            previousClose?: number;
            chartPreviousClose?: number;
            regularMarketVolume?: number;
            currency: string;
            exchangeName: string;
            longName?: string;
            shortName?: string;
          };
        }> | null;
        error?: { code?: string; description?: string };
      } | null;
    };

    const result = data.chart?.result?.[0];
    if (!result || !result.meta) return null;
    const meta = result.meta;

    // Reject non-allowed exchanges — never serve a Canadian /
    // HKEX / NYQ price as a BVC quote.
    if (!YAHOO_ALLOWED_EXCHANGES.has(meta.exchangeName)) {
      return null;
    }

    const prev = meta.previousClose ?? meta.chartPreviousClose ?? meta.regularMarketPrice;
    const changePct = prev === 0
      ? 0
      : ((meta.regularMarketPrice - prev) / prev) * 100;

    return {
      ticker: upper,
      name: meta.longName ?? meta.shortName ?? meta.symbol,
      price: meta.regularMarketPrice,
      changePct: Number(changePct.toFixed(4)),
      volume: meta.regularMarketVolume ?? null,
      currency: meta.currency,
      exchange: meta.exchangeName,
      fetchedAt: new Date(),
      source: "yahoo",
    };
  } catch {
    // Network error, timeout, JSON parse — treat as "no live
    // data". The caller will fall back to the DB cache.
    return null;
  }
}

// ─── Investing.com fetch (stub — currently always 403) ─────────
//
// Investing.com blocks server-side fetches with a Cloudflare 403.
// The selector / parsing logic below is preserved for the day we
// add a residential proxy, an official partner API, or a managed
// browser (Playwright). Today it returns `null` for every ticker.
//
// To enable: replace `fetchInvestingPage` with a call that goes
// through your proxy / headless browser, returning the raw HTML.
// The parser below is then exercised as-is.
const INVESTING_SLUG_MAP: Record<string, string> = {
  OCP: "ocp-group",
  IAM: "maroc-telecom",
  ATW: "attijariwafa-bank",
  BCP: "banque-centrale-populaire",
  CIH: "cih-bank",
  CFG: "cfg-group",
  LASA: "lafargeholcim-maroc",
  CSU: "cosumar",
  MNG: "mangulf",
  LHM: "lesieur-cristal",
};

async function fetchInvestingPage(slug: string): Promise<string | null> {
  const url = `https://www.investing.com/equities/${slug}`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
          "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,fr;q=0.8",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Upgrade-Insecure-Requests": "1",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function parseInvestingPrice(html: string): {
  price: number;
  changePct: number;
} | null {
  // Investing.com embeds a JSON blob in `window.allStudiesData` /
  // `lastVisible` data-attributes. The most stable selector is
  // `<div data-test="instrument-price-last">` for the price and
  // `data-test="instrument-price-change-percent"` for the % change.
  // We avoid a full DOM dependency (cheerio / linkedom) so this
  // stays a pure-string scan — works in both Edge runtime and Node.
  const priceMatch = html.match(
    /data-test="instrument-price-last"[^>]*>([0-9.,]+)/,
  );
  if (!priceMatch) return null;
  const price = Number(priceMatch[1].replace(/\s/g, "").replace(/\.(?=\d{3}\b)/g, "").replace(",", "."));
  if (!Number.isFinite(price)) return null;

  const changeMatch = html.match(
    /data-test="instrument-price-change-percent"[^>]*>([+\-]?[0-9.,]+)%?/,
  );
  const changePct = changeMatch
    ? Number(changeMatch[1].replace(/\s/g, "").replace(",", "."))
    : 0;
  return { price, changePct: Number.isFinite(changePct) ? changePct : 0 };
}

export async function fetchInvestingQuote(
  ticker: string,
): Promise<BVCQuote | null> {
  const upper = ticker.toUpperCase();
  const slug = INVESTING_SLUG_MAP[upper];
  if (!slug) return null;

  const html = await fetchInvestingPage(slug);
  if (!html) return null;

  const parsed = parseInvestingPrice(html);
  if (!parsed) return null;

  return {
    ticker: upper,
    name: upper,
    price: parsed.price,
    changePct: parsed.changePct,
    volume: null,
    currency: "MAD",
    exchange: "BVC",
    fetchedAt: new Date(),
    source: "investing",
  };
}

// ─── Top-level fetcher (Yahoo → Investing → null) ──────────────
//
// Callers MUST handle a `null` return by falling back to the last
// cached price in the database (see `stream/route.ts`).
export async function fetchBVCQuote(
  ticker: string,
): Promise<BVCQuote | null> {
  const yahoo = await fetchYahooQuote(ticker);
  if (yahoo) return yahoo;

  const investing = await fetchInvestingQuote(ticker);
  if (investing) return investing;

  return null;
}

// ─── BVC trading-hours guard ───────────────────────────────────
//
// The BVC is open Mon–Fri, 09:00–17:00 Africa/Casablanca (UTC+1,
// no DST). In UTC that is 08:00–16:00. The cron job calls this
// guard before iterating assets so we don't waste API calls when
// the market is closed.
//
// `now` defaults to `new Date()` and is only a parameter so the
// test script can exercise both branches.
export function isBVCTradingOpen(now: Date = new Date()): boolean {
  // `getUTCDay`: 0 = Sun, 6 = Sat. BVC is Mon–Fri.
  const day = now.getUTCDay();
  if (day === 0 || day === 6) return false;

  // BVC: 09:00–17:00 Casablanca (UTC+1, no DST) → 08:00–16:00 UTC.
  // We pad by 15 min on each side so a cron tick at 16:55 UTC
  // (just before close + 15 min settlement) still runs.
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const OPEN_UTC = 8 * 60 - 15;   // 07:45 UTC
  const CLOSE_UTC = 16 * 60 + 15; // 16:15 UTC
  return utcMinutes >= OPEN_UTC && utcMinutes <= CLOSE_UTC;
}
