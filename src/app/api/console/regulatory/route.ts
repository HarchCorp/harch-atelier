// ═══════════════════════════════════════════════════════════════
//  GET /api/console/regulatory?source=ammc|bam|bvc&limit=20&q=...
//
//  Returns the latest regulatory items (AMMC / BAM / BVC) persisted
//  by the daily cron /api/cron/scrape-regulatory. Auth required —
//  any logged-in user with an investment-bank / market-competitor /
//  harch-alpha / brand-monitor / admin account can read the feed
//  (regulatory announcements are public).
//
//  Behaviour:
//    • Auth required (NextAuth session).
//    • `source` filter: "ammc" | "bam" | "bvc". Omit for all 3.
//    • `limit`: 1..100, defaults to 20.
//    • `q`: free-text search on title + summary (case-insensitive).
//    • Reads from Article where sourceType IN
//      ("regulatory", "financial", "market") — i.e. only the rows
//      written by the regulatory scraper.
//    • If `refresh=1` is passed, performs an on-demand scrape before
//      returning. The on-demand scrape is rate-limited to once per
//      10 minutes per source via an in-memory timestamp guard.
//
//  Response shape:
//    {
//      items: RegulatoryItem[],
//      sources: { ammc: number, bam: number, bvc: number },
//      total: number,
//      refreshedAt: string | null,
//      cached: boolean
//    }
//
//  Task ID: signal-regulatory-feed
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { logError, logWarn, logInfo } from "@/lib/logger";
import {
  REGULATORY_FEEDS,
  scrapeRegulatorySource,
  persistRegulatoryItems,
  type RegulatoryItem,
  type RegulatorySource,
  type RegulatoryType,
} from "@/lib/scrapers/regulatory-scraper";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;
// On-demand scrape can take ~10s per source (3 in parallel ~12s).
export const maxDuration = 60;

// ─── IN-MEMORY RATE LIMIT FOR ON-DEMAND SCRAPE ──────────────────
//
//  The `refresh=1` query param triggers a fresh scrape. To avoid
//  hammering the regulators when multiple users click the button
//  simultaneously, we throttle to one scrape per source per 10 min.
//  (Vercel serverless instances are stateless so this is a best-
//  effort guard, not a hard guarantee — the cron stays the source
//  of truth.)

const REFRESH_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes
const lastRefresh: Record<RegulatorySource, number> = {
  ammc: 0,
  bam: 0,
  bvc: 0,
};

// ─── SOURCE → DB sourceType MAPPING ──────────────────────────────
//
//  Each regulator maps to one dbSourceType. The mapping is the same
//  as the one in REGULATORY_FEEDS — duplicated here so the API can
//  build the Prisma WHERE clause without importing the whole
//  scrape pipeline (keeps the route bundle small).

const SOURCE_TO_DB_TYPE: Record<RegulatorySource, string> = {
  ammc: "regulatory",
  bam: "financial",
  bvc: "market",
};

const SOURCE_TO_LABEL: Record<RegulatorySource, string> = {
  ammc: "AMMC",
  bam: "BAM",
  bvc: "BVC",
};

const SOURCE_TO_TYPE: Record<RegulatorySource, RegulatoryType> = {
  ammc: "regulatory",
  bam: "financial_regulatory",
  bvc: "market",
};

// ─── HELPERS ─────────────────────────────────────────────────────

function parseSourceParam(raw: string | null): RegulatorySource | null {
  if (!raw) return null;
  const v = raw.toLowerCase();
  if (v === "ammc" || v === "bam" || v === "bvc") return v;
  return null;
}

function parseLimit(raw: string | null): number {
  if (!raw) return 20;
  const n = Number(raw);
  if (!Number.isFinite(n)) return 20;
  const int = Math.floor(n);
  if (int < 1) return 1;
  if (int > 100) return 100;
  return int;
}

/**
 * Convert an Article row (DB) to a RegulatoryItem the UI renders.
 * Mirrors the shape produced by the scraper so the UI code is the
 * same whether items come from DB cache or a fresh on-demand scrape.
 */
function articleToItem(a: {
  id: string;
  title: string;
  url: string;
  urlHash: string;
  source: string;
  publishedAt: Date | null;
  summary: string | null;
  language: string | null;
  sourceType: string;
}): RegulatoryItem | null {
  // Reverse-look-up the regulator id from the sourceType + source label.
  let src: RegulatorySource | null = null;
  if (a.sourceType === "regulatory") src = "ammc";
  else if (a.sourceType === "financial") src = "bam";
  else if (a.sourceType === "market") src = "bvc";

  // Some early rows may have sourceType "media" but were actually
  // written by the main RSS scrape pipeline (the old AMMC / BAM / BVC
  // entries in MOROCCAN_FEEDS). They use sourceType "media" — we
  // accept them when their source matches a known regulator name.
  if (!src) {
    const sLower = (a.source || "").toLowerCase();
    if (sLower.includes("ammc")) src = "ammc";
    else if (sLower.includes("bank al-maghrib") || sLower.includes("bkam")) src = "bam";
    else if (sLower.includes("bourse de casablanca") || sLower.includes("bvc")) src = "bvc";
  }
  if (!src) return null;

  return {
    id: a.urlHash,
    title: a.title,
    source: src,
    sourceLabel: SOURCE_TO_LABEL[src],
    url: a.url,
    publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
    type: SOURCE_TO_TYPE[src],
    summary: a.summary || "",
    language: a.language || "fr",
  };
}

/**
 * On-demand refresh: scrape one source (or all 3) and persist the
 * new items. Skips sources that were refreshed less than
 * REFRESH_COOLDOWN_MS ago.
 */
async function refreshOnDemand(
  onlySource: RegulatorySource | null,
): Promise<{ refreshed: RegulatorySource[]; skipped: RegulatorySource[] }> {
  const now = Date.now();
  const targets = onlySource
    ? [onlySource]
    : REGULATORY_FEEDS.map((f) => f.id);
  const refreshed: RegulatorySource[] = [];
  const skipped: RegulatorySource[] = [];

  const toRun = REGULATORY_FEEDS.filter((cfg) => targets.includes(cfg.id));
  const results = await Promise.all(
    toRun.map(async (cfg) => {
      if (now - lastRefresh[cfg.id] < REFRESH_COOLDOWN_MS) {
        skipped.push(cfg.id);
        return null;
      }
      lastRefresh[cfg.id] = now;
      const result = await scrapeRegulatorySource(cfg);
      await persistRegulatoryItems(result, cfg);
      refreshed.push(cfg.id);
      return result;
    }),
  );

  logInfo(
    "regulatory.route.refresh",
    `Refreshed: ${refreshed.join(", ") || "(none)"}. Skipped: ${skipped.join(", ") || "(none)"}.` +
      ` Items: ${results.reduce((s, r) => s + (r?.items.length ?? 0), 0)}`,
  );
  return { refreshed, skipped };
}

// ─── ROUTE HANDLER ───────────────────────────────────────────────

export async function GET(req: Request) {
  // 1. AUTH
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized — session invalid" },
      { status: 401 },
    );
  }

  const url = new URL(req.url);
  const sourceParam = parseSourceParam(url.searchParams.get("source"));
  const limit = parseLimit(url.searchParams.get("limit"));
  const q = (url.searchParams.get("q") || "").trim();
  const refresh = url.searchParams.get("refresh") === "1";

  // 2. OPTIONAL ON-DEMAND REFRESH
  //    Only run when the user explicitly asks. The cron handles the
  //    daily refresh at 06:00 UTC.
  if (refresh) {
    try {
      await refreshOnDemand(sourceParam);
    } catch (err) {
      logWarn(
        "regulatory.route",
        `On-demand refresh failed: ${(err as Error).message}`,
      );
      // Don't fail the whole request — fall back to cached items.
    }
  }

  // 3. BUILD QUERY
  const dbTypes = sourceParam
    ? [SOURCE_TO_DB_TYPE[sourceParam]]
    : ["regulatory", "financial", "market"];

  // Search filter: case-insensitive contains on title + summary.
  // Prisma `contains` with `mode: "insensitive"` is supported on
  // PostgreSQL (our Neon datasource).
  const where = {
    sourceType: { in: dbTypes },
    ...(q.length > 0
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { summary: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  try {
    const [rows, counts] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        take: limit,
        select: {
          id: true,
          title: true,
          url: true,
          urlHash: true,
          source: true,
          publishedAt: true,
          summary: true,
          language: true,
          sourceType: true,
        },
      }),
      // Per-source counts (for the filter chips in the UI).
      Promise.all(
        (["regulatory", "financial", "market"] as const).map(
          async (t) => ({
            type: t,
            count: await prisma.article.count({ where: { sourceType: t } }),
          }),
        ),
      ),
    ]);

    const items = rows
      .map(articleToItem)
      .filter((x): x is RegulatoryItem => x !== null);

    const sources = {
      ammc: counts.find((c) => c.type === "regulatory")?.count ?? 0,
      bam: counts.find((c) => c.type === "financial")?.count ?? 0,
      bvc: counts.find((c) => c.type === "market")?.count ?? 0,
    };

    // Latest publishedAt → "refreshedAt" indicator for the UI.
    const latest = items.find((it) => it.publishedAt)?.publishedAt ?? null;

    return NextResponse.json({
      items,
      sources,
      total: items.length,
      refreshedAt: latest,
      cached: !refresh,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError("regulatory.route", `Failed to fetch: ${msg}`);
    return NextResponse.json(
      { error: "Failed to load regulatory feed", detail: msg },
      { status: 500 },
    );
  }
}
