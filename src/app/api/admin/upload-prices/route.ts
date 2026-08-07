// ═══════════════════════════════════════════════════════════════
//  POST /api/admin/upload-prices
//
//  Admin-only CSV upload of BVC daily prices. This is the
//  production-grade fallback for tickers that have no live Yahoo
//  / Investing source (which today is ~all of them — see
//  `src/lib/scrapers/bvc-prices.ts`).
//
//  Two upload modes:
//
//    A. multipart/form-data with field `file` (CSV blob).
//       Content-Type: multipart/form-data
//
//    B. application/json with body { csv: "<inline csv>" }.
//       Useful for a quick curl test or a scripted upload.
//
//  CSV format (header row REQUIRED, case-insensitive):
//    ticker,price,changePct,volume,date
//    OCP,842.50,+1.2,120000,2026-07-31
//    IAM,92.10,-0.4,54000,2026-07-31
//
//  Rules:
//    • `ticker`  — uppercase BVC symbol. Must already exist in the
//                  Asset table (exchange = "BVC"). Unknown tickers
//                  are skipped (returned in `skipped`).
//    • `price`   — positive number. MAD.
//    • `changePct` — number, optional. "% vs prev close".
//    • `volume`  — non-negative number, optional.
//    • `date`    — ISO date (YYYY-MM-DD) or full ISO datetime.
//                  Defaults to `now` if omitted.
//
//  Rows are inserted as AssetPrice records with `tradedAt = date`.
//  The dashboard stream shows them with `source: "cached"` and the
//  UI exposes a tooltip "MANUAL UPLOAD — admin-imported CSV".
//
//  Auth: `session.user.role === "admin"`.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type ParsedRow = {
  ticker: string;
  price: number;
  changePct: number | null;
  volume: number | null;
  date: Date;
};

type UploadResult =
  | { ticker: string; ok: true; price: number; date: string }
  | { ticker: string; ok: false; reason: string; line: number };

// Minimal RFC-4180-ish CSV parser. Handles quoted fields, escaped
// quotes ("") inside a quoted field, CRLF or LF line endings. We
// don't pull in papaparse to keep the route zero-dependency and
// Edge-safe.
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  // Strip a UTF-8 BOM if present — Excel exports one.
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(field);
        field = "";
      } else if (ch === "\n" || ch === "\r") {
        // CRLF → treat as one line break
        if (ch === "\r" && src[i + 1] === "\n") i++;
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else {
        field += ch;
      }
    }
  }
  // Trailing field/row (file without final newline)
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  // Drop empty trailing row (e.g. file ended with a newline)
  return rows.filter((r) => !(r.length === 1 && r[0] === ""));
}

function parseDate(s: string | undefined): Date {
  if (!s || !s.trim()) return new Date();
  const trimmed = s.trim();
  // Try ISO datetime first — `2026-07-31` parses to UTC midnight
  // which is fine for a daily price.
  const d = new Date(trimmed);
  if (!Number.isNaN(d.getTime())) return d;
  return new Date();
}

function parseNum(s: string | undefined): number | null {
  if (s === undefined) return null;
  const t = s.trim().replace(/,/g, "");
  if (t === "") return null;
  // Tolerate leading "+" / "-" / "%" suffix
  const n = Number(t.replace(/%$/, ""));
  return Number.isFinite(n) ? n : null;
}

function findHeader(headers: string[], candidates: string[]): number {
  for (const c of candidates) {
    const idx = headers.findIndex(
      (h) => h.trim().toLowerCase() === c.toLowerCase(),
    );
    if (idx >= 0) return idx;
  }
  return -1;
}

async function readCSVFromRequest(req: NextRequest): Promise<string> {
  const ct = req.headers.get("content-type") ?? "";
  if (ct.startsWith("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    if (file && typeof file === "object" && "text" in file) {
      return await (file as File).text();
    }
    if (typeof file === "string") return file;
    throw new Error("No `file` field in multipart upload");
  }
  // Otherwise treat as JSON body `{ csv: "..." }`
  const body = await req.json().catch(() => ({}));
  if (typeof body?.csv === "string") return body.csv;
  throw new Error("Expected multipart/form-data with `file` or JSON `{ csv: \"...\" }`");
}

export async function POST(req: NextRequest) {
  // ─── Auth ────────────────────────────────────────────────
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin" && session.user?.role !== "super_admin") {
    return NextResponse.json(
      { error: "Forbidden — admin only" },
      { status: 403 },
    );
  }

  // ─── Read + parse CSV ────────────────────────────────────
  let csvText: string;
  try {
    csvText = await readCSVFromRequest(req);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid request body" },
      { status: 400 },
    );
  }

  const rows = parseCSV(csvText);
  if (rows.length < 2) {
    return NextResponse.json(
      { error: "CSV must contain a header row and at least one data row" },
      { status: 400 },
    );
  }

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const iTicker = findHeader(header, ["ticker", "symbol"]);
  const iPrice = findHeader(header, ["price", "last", "close"]);
  const iChange = findHeader(header, ["change", "changePct", "change_pct", "pctchange"]);
  const iVolume = findHeader(header, ["volume", "vol"]);
  const iDate = findHeader(header, ["date", "traded_at", "tradedat", "time"]);

  if (iTicker < 0 || iPrice < 0) {
    return NextResponse.json(
      {
        error:
          "CSV header must contain at least `ticker` and `price` columns " +
          "(changePct, volume, date are optional).",
        receivedHeader: header,
      },
      { status: 400 },
    );
  }

  // ─── Resolve tickers in a single round-trip ─────────────
  // We do NOT auto-create Asset rows on upload — the admin must
  // declare the asset first (via the seed scripts / setup wizard).
  // Unknown tickers are skipped and reported.
  const wantedTickers = new Set<string>();
  const candidates: Array<{ line: number; raw: string[] }> = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const t = (r[iTicker] ?? "").trim().toUpperCase();
    if (!t) continue;
    wantedTickers.add(t);
    candidates.push({ line: i + 1, raw: r });
  }

  const assets = await prisma.asset.findMany({
    where: { ticker: { in: Array.from(wantedTickers) } },
    select: { id: true, ticker: true, exchange: true },
  });
  const assetByTicker = new Map(assets.map((a) => [a.ticker, a]));

  // ─── Parse + insert ──────────────────────────────────────
  const results: UploadResult[] = [];
  const toInsert: Array<{
    assetId: string;
    price: number;
    changePct: number | null;
    volume: number | null;
    tradedAt: Date;
  }> = [];

  for (const { line, raw } of candidates) {
    const ticker = (raw[iTicker] ?? "").trim().toUpperCase();
    const asset = assetByTicker.get(ticker);
    if (!asset) {
      results.push({
        ticker,
        ok: false,
        reason: "Ticker not found in Asset table",
        line,
      });
      continue;
    }
    if (asset.exchange && asset.exchange !== "BVC") {
      // Soft-warn but still allow — the admin may be uploading a
      // crypto or FX price manually. We don't block.
    }
    const price = parseNum(raw[iPrice]);
    if (price === null || price <= 0) {
      results.push({
        ticker,
        ok: false,
        reason: `Invalid price: "${raw[iPrice] ?? ""}"`,
        line,
      });
      continue;
    }
    const changePct = iChange >= 0 ? parseNum(raw[iChange]) : null;
    const volume = iVolume >= 0 ? parseNum(raw[iVolume]) : null;
    const date = iDate >= 0 ? parseDate(raw[iDate]) : new Date();

    toInsert.push({
      assetId: asset.id,
      price: Number(price.toFixed(4)),
      changePct: changePct !== null ? Number(changePct.toFixed(4)) : null,
      volume: volume !== null ? Math.max(0, Math.round(volume)) : null,
      tradedAt: date,
    });
    results.push({
      ticker,
      ok: true,
      price: Number(price.toFixed(4)),
      date: date.toISOString(),
    });
  }

  // Bulk insert in one transaction so a single bad row doesn't
  // half-commit. Prisma doesn't have createMany on SQLite but we
  // use Postgres (Neon) — createMany is supported.
  let inserted = 0;
  if (toInsert.length > 0) {
    try {
      const r = await prisma.assetPrice.createMany({
        data: toInsert,
        skipDuplicates: false,
      });
      inserted = r.count;
    } catch (err) {
      return NextResponse.json(
        {
          error: "Bulk insert failed",
          detail: err instanceof Error ? err.message : "Unknown error",
          parsed: toInsert.length,
        },
        { status: 500 },
      );
    }
  }

  const ok = results.filter((r) => r.ok).length;
  const skipped = results.filter((r) => !r.ok);

  return NextResponse.json({
    uploaded: true,
    parsed: candidates.length,
    inserted,
    ok,
    skipped: skipped.length,
    skippedDetails: skipped,
    results,
  });
}
