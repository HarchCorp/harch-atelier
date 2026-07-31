import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";

// ═══════════════════════════════════════════════════════════════
//  GET /api/console/ai-visibility-trend?range=7d|30d
//
//  Returns AI visibility history per engine (platform) for trend
//  charts. Each day reports, per engine:
//    - rank     : best (lowest numeric) position observed that day
//                 (null when the engine was not cited that day)
//    - mentions : number of probes/checks for that engine that day
//
//  Auth: requires session (brand-monitor | market-competitor |
//  investment-bank | admin).
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

const RANGE_DAYS: Record<string, number> = {
  "7d": 7,
  "30d": 30,
};

// Parse the AIVisibility.position string into a numeric rank.
// Examples: "1st" -> 1, "2nd" -> 2, "3rd" -> 3, "top-3" -> 3,
// "top-5" -> 5, "not cited" -> null, anything else -> null.
function parseRank(position: string | null | undefined): number | null {
  if (!position) return null;
  const lower = position.toLowerCase().trim();
  if (lower.includes("not cited") || lower === "absent") return null;
  // Try "1st", "2nd", "3rd", "4th", ...
  const ordinalMatch = lower.match(/^(\d+)(?:st|nd|rd|th)?$/);
  if (ordinalMatch) return parseInt(ordinalMatch[1], 10);
  // Try "top-N" — return N (worst-case rank within the window).
  const topMatch = lower.match(/top-(\d+)/);
  if (topMatch) return parseInt(topMatch[1], 10);
  // Try a bare number.
  const numMatch = lower.match(/(\d+)/);
  if (numMatch) return parseInt(numMatch[1], 10);
  return null;
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowedTypes = ["brand-monitor", "market-competitor", "investment-bank"];
  if (!allowedTypes.includes(session.user?.accountType || "") && session.user?.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden — this data is for brand-monitor, market-competitor and investment-bank accounts only" },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const rangeParam = searchParams.get("range") || "30d";
    const days = RANGE_DAYS[rangeParam] ?? 30;
    const range = (Object.keys(RANGE_DAYS).find((k) => RANGE_DAYS[k] === days) || "30d") as string;

    const companySlug = searchParams.get("company");
    const company = companySlug
      ? await prisma.company.findUnique({ where: { slug: companySlug } })
      : await prisma.company.findFirst({ orderBy: { createdAt: "asc" } });

    if (!company) {
      return NextResponse.json({ engines: [], data: [] });
    }

    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const records = await prisma.aIVisibility.findMany({
      where: {
        companyId: company.id,
        checkedAt: { gte: since },
      },
      select: {
        platform: true,
        position: true,
        cited: true,
        checkedAt: true,
      },
      orderBy: { checkedAt: "asc" },
    });

    // Build the engine list (sorted by total probe count desc for stable
    // ordering in the chart legend).
    const engineTotals = new Map<string, number>();
    // Per-day per-engine aggregation:
    // Map<dateKey, Map<engine, { rank: number|null; bestRank: number|null; mentions: number; citedCount: number }>>
    const dayEngine = new Map<
      string,
      Map<string, { rank: number | null; bestRank: number | null; mentions: number; citedCount: number }>
    >();

    for (const r of records) {
      const engine = r.platform;
      engineTotals.set(engine, (engineTotals.get(engine) || 0) + 1);

      const key = dateKey(r.checkedAt);
      if (!dayEngine.has(key)) dayEngine.set(key, new Map());
      const engineMap = dayEngine.get(key)!;
      if (!engineMap.has(engine)) {
        engineMap.set(engine, { rank: null, bestRank: null, mentions: 0, citedCount: 0 });
      }
      const cell = engineMap.get(engine)!;
      cell.mentions += 1;
      if (r.cited) cell.citedCount += 1;
      const rank = parseRank(r.position);
      // Best rank = lowest numeric value among cited probes that day.
      if (rank !== null) {
        if (cell.bestRank === null || rank < cell.bestRank) {
          cell.bestRank = rank;
        }
      }
    }

    const engines = Array.from(engineTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);

    // Continuous day axis (gap-free) — only include days where at least
    // one engine has data, plus fill empty in-between days with all-null
    // ranks (so the chart can show "no probe" cleanly).
    const data: Record<string, any>[] = [];
    const today = new Date();
    for (let d = new Date(since); d <= today; d.setDate(d.getDate() + 1)) {
      const key = dateKey(d);
      const engineMap = dayEngine.get(key);
      const row: Record<string, any> = { date: key };
      let hasAny = false;
      for (const engine of engines) {
        if (engineMap && engineMap.has(engine)) {
          const cell = engineMap.get(engine)!;
          row[engine] = {
            rank: cell.bestRank,
            mentions: cell.mentions,
            cited: cell.citedCount,
          };
          hasAny = true;
        } else {
          row[engine] = null;
        }
      }
      // Include the row only if at least one engine was probed that day.
      // (Avoids polluting the chart with 30 zero rows when probes are
      // sparse; the chart can interpolate missing days itself.)
      if (hasAny) data.push(row);
    }

    return NextResponse.json({
      range,
      company: { name: company.name, slug: company.slug },
      engines,
      data,
      stats: {
        totalProbes: records.length,
        engineCount: engines.length,
        firstProbe: records.length > 0 ? records[0].checkedAt.toISOString() : null,
        lastProbe: records.length > 0 ? records[records.length - 1].checkedAt.toISOString() : null,
      },
    });
  } catch (err) {
    console.error("AI visibility trend API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
