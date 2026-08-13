// ═══════════════════════════════════════════════════════════════
//  POST /api/console/sov-trends
//
//  Share of Voice evolution over 30 / 90 / 365 days.
//  For each day in the window returns the article count for the
//  logged-in company ("you") and each competitor in the same sector.
//  Detects bascules — days where your SOV crossed a competitor's
//  SOV (you overtook them, or they overtook you).
//
//  Body: { range?: "30d" | "90d" | "365d" }   (default "30d")
//
//  Returns:
//    {
//      youName: string,                              // your company name
//      range:   "30d" | "90d" | "365d",              // echoed back
//      source:  "neon" | "empty",                    // empty = no company / no data
//      days:    Array<{ date: string,                // "YYYY-MM-DD"
//                       you: number,                 // your article count that day
//                       competitors: Array<{ name: string, count: number }> }>,
//      bascules: Array<{ date: string,
//                        event: "bascule",
//                        fromCompany: string,        // who held the higher SOV before
//                        toCompany: string }>,       // who holds it after the crossing
//      summary: { avgSOV: number,                    // mean of your daily SOV (%)
//                 peakSOV: number,                   // max of your daily SOV (%)
//                 trend: number,                     // tail7 mean − head7 mean (pp)
//                 basculeCount: number }             // total crossings detected
//    }
//
//  SOV = your article count / sum of all companies' counts on that
//  day × 100. avgSOV, peakSOV and trend are computed on the daily
//  SOV series so the chart and the summary stats can never drift
//  apart. A bascule fires only on a sign change of (youSOV − compSOV)
//  between two consecutive days that BOTH have at least one article
//  published in the system — zero-data days are skipped to avoid
//  false bascules on weekends / quiet periods.
//
//  Auth: requires session. Company must be linked (403 + redirect
//        to /atelier/onboarding if not). Demo isolation is enforced
//        via the demoFilter returned by requireUserCompany.
//  Design: white / sage / charcoal, French, NO emojis.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { requireUserCompany } from "@/lib/harchiq/company-session";
import { prisma } from "@/lib/db";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

const RANGE_DAYS: Record<string, number> = {
  "30d": 30,
  "90d": 90,
  "365d": 365,
};

type RangeKey = keyof typeof RANGE_DAYS;

interface SovDay {
  date: string;
  you: number;
  competitors: Array<{ name: string; count: number }>;
}

interface Bascule {
  date: string;
  event: "bascule";
  fromCompany: string;
  toCompany: string;
}

interface SovSummary {
  avgSOV: number;
  peakSOV: number;
  trend: number;
  basculeCount: number;
}

interface SovTrendsResponse {
  youName: string;
  range: RangeKey;
  source: "neon" | "empty";
  days: SovDay[];
  bascules: Bascule[];
  summary: SovSummary;
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function emptyResponse(range: RangeKey, youName: string): SovTrendsResponse {
  return {
    youName,
    range,
    source: "empty",
    days: [],
    bascules: [],
    summary: { avgSOV: 0, peakSOV: 0, trend: 0, basculeCount: 0 },
  };
}

// ─── POST handler ───────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Auth + company resolution (handles 401 / 403 / 404)
  const session = await requireUserCompany();
  if (!session.ok) return session.response;
  const { company, demoFilter } = session.data;

  // 2. Parse + validate body (range is optional, defaults to 30d)
  let rangeParam: string = "30d";
  try {
    const raw = await req.json();
    if (raw && typeof raw === "object" && "range" in raw) {
      const v = (raw as { range?: unknown }).range;
      if (typeof v === "string" && v in RANGE_DAYS) rangeParam = v;
    }
  } catch {
    // Body is optional / not JSON — fall back to 30d silently.
  }
  const range = (rangeParam in RANGE_DAYS ? rangeParam : "30d") as RangeKey;
  const days = RANGE_DAYS[range];

  try {
    // 3. Resolve the user's company + up to 4 competitors in sector
    const myCompany = await prisma.company.findUnique({
      where: { id: company.id },
      select: { id: true, name: true, sector: true },
    });
    if (!myCompany) {
      return NextResponse.json(emptyResponse(range, company.name), { status: 200 });
    }

    const competitors = await prisma.company.findMany({
      where: {
        sector: myCompany.sector,
        id: { not: myCompany.id },
        isDemo: demoFilter.isDemo,
      },
      take: 4,
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    const allCompanies = [
      { id: myCompany.id, name: myCompany.name, isYou: true },
      ...competitors.map((c) => ({ id: c.id, name: c.name, isYou: false })),
    ];

    // 4. Fetch all articles in the window for any of these companies.
    //    One query, no N+1 — we bucket by companyId + day in JS.
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    since.setUTCDate(since.getUTCDate() - (days - 1));

    const articles = await prisma.article.findMany({
      where: {
        companyId: { in: allCompanies.map((c) => c.id) },
        publishedAt: { gte: since },
        ...demoFilter,
      },
      select: { companyId: true, publishedAt: true },
      take: 20000,
    });

    // 5. Build the day axis — every day in the window appears even
    //    if no company published anything (chart x-axis is continuous).
    const bucket = new Map<string, Map<string, number>>();
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    for (let d = new Date(since); d.getTime() <= today.getTime(); d.setUTCDate(d.getUTCDate() + 1)) {
      const key = dateKey(d);
      const perCompany = new Map<string, number>();
      for (const c of allCompanies) perCompany.set(c.id, 0);
      bucket.set(key, perCompany);
    }

    for (const a of articles) {
      if (!a.publishedAt || !a.companyId) continue;
      const key = dateKey(a.publishedAt);
      const perCompany = bucket.get(key);
      if (!perCompany) continue;
      if (!perCompany.has(a.companyId)) continue; // safety — never happens
      perCompany.set(a.companyId, (perCompany.get(a.companyId) ?? 0) + 1);
    }

    // 6. Shape the days array (you + competitors[]) AND compute the
    //    daily SOV series used by summary + bascule detection.
    const dayList: SovDay[] = [];
    const youSOV: number[] = [];
    const compSOV: Record<string, number[]> = {};
    for (const c of competitors) compSOV[c.id] = [];

    const sortedDays = Array.from(bucket.keys()).sort();
    for (const key of sortedDays) {
      const perCompany = bucket.get(key)!;
      const youCount = perCompany.get(myCompany.id) ?? 0;
      const compCounts = competitors.map((c) => ({
        name: c.name,
        count: perCompany.get(c.id) ?? 0,
      }));
      dayList.push({ date: key, you: youCount, competitors: compCounts });

      const total =
        youCount + compCounts.reduce((s, c) => s + c.count, 0);
      const youShare = total > 0 ? (youCount / total) * 100 : 0;
      youSOV.push(youShare);
      for (const c of competitors) {
        const cCount = perCompany.get(c.id) ?? 0;
        compSOV[c.id].push(total > 0 ? (cCount / total) * 100 : 0);
      }
    }

    // 7. Bascule detection — for each competitor walk day-by-day and
    //    flag a crossing when the sign of (youSOV − compSOV) flips
    //    between two consecutive days that BOTH carry at least one
    //    article (so we don't fire bascules on zero-data stretches).
    const bascules: Bascule[] = [];
    for (const c of competitors) {
      const series = compSOV[c.id];
      for (let i = 1; i < sortedDays.length; i++) {
        const prevDiff = youSOV[i - 1] - series[i - 1];
        const curDiff = youSOV[i] - series[i];
        if (prevDiff === 0 || curDiff === 0) continue;
        if ((prevDiff > 0) === (curDiff > 0)) continue; // no sign change
        const date = sortedDays[i];
        if (curDiff > 0) {
          // You rose above competitor.
          bascules.push({
            date,
            event: "bascule",
            fromCompany: c.name,
            toCompany: myCompany.name,
          });
        } else {
          // You fell below competitor.
          bascules.push({
            date,
            event: "bascule",
            fromCompany: myCompany.name,
            toCompany: c.name,
          });
        }
      }
    }
    // Sort bascules chronologically — multiple competitors can fire on
    // the same day, so we keep a deterministic order (date then from).
    bascules.sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        a.fromCompany.localeCompare(b.fromCompany),
    );

    // 8. Summary stats
    const avgSOV = round1(
      youSOV.length > 0 ? youSOV.reduce((s, v) => s + v, 0) / youSOV.length : 0,
    );
    const peakSOV = round1(youSOV.length > 0 ? Math.max(...youSOV) : 0);

    // Trend = mean of last 7 days − mean of first 7 days (pp).
    // Positive → you're gaining share; negative → losing.
    const head = youSOV.slice(0, 7);
    const tail = youSOV.slice(-7);
    const headAvg = head.length > 0 ? head.reduce((s, v) => s + v, 0) / head.length : 0;
    const tailAvg = tail.length > 0 ? tail.reduce((s, v) => s + v, 0) / tail.length : 0;
    const trend = round1(tailAvg - headAvg);

    const response: SovTrendsResponse = {
      youName: myCompany.name,
      range,
      source: "neon",
      days: dayList,
      bascules,
      summary: {
        avgSOV,
        peakSOV,
        trend,
        basculeCount: bascules.length,
      },
    };
    return NextResponse.json(response);
  } catch (err) {
    logError("console.sov-trends", `[sov-trends] error: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
