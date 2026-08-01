import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import {
  requireUserCompany,
  demoFilterFromSession,
} from "@/lib/harchiq/company-session";

// ═══════════════════════════════════════════════════════════════
//  GET /api/console/alert-timeline?range=24h|7d|30d&includeEvents=1
//
//  Returns alerts (articles) grouped by hour (24h) or day (7d/30d)
//  for timeline charts. Each bucket reports the total count and a
//  severity breakdown (critical / high / medium / low) derived from
//  the article sentimentScore — same thresholds as /api/console/alerts.
//
//  When includeEvents=1 is passed, the response ALSO includes an
//  `events` array of REAL articles mapped to timeline events:
//    { id, date, source, title, sentiment, severity, url, companyId }
//  No fabrication — if no real articles exist, the array is empty.
//  This is what the Investor Desk Adverse Media Timeline renders
//  instead of the previous "HISTORICAL (DERIVED)" placeholder.
//
//  Auth: requires session (brand-monitor | market-competitor |
//  investment-bank | admin).
//
//  Task ID: signal-entity-graph
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

type RangeKey = "24h" | "7d" | "30d" | "90d" | "all";
const RANGE_CONFIG: Record<RangeKey, { days: number | null; bucket: "hour" | "day" }> = {
  "24h": { days: 1, bucket: "hour" },
  "7d": { days: 7, bucket: "day" },
  "30d": { days: 30, bucket: "day" },
  "90d": { days: 90, bucket: "day" },
  "all": { days: null, bucket: "day" }, // no date filter — all real articles
};

function severityOf(score: number | null): "critical" | "high" | "medium" | "low" {
  // Match the existing alerts API thresholds.
  // Articles without a sentiment score are counted as "low".
  if (score === null || score === undefined) return "low";
  if (score < -0.7) return "critical";
  if (score < -0.4) return "high";
  if (score < -0.1) return "medium";
  return "low";
}

function hourKey(d: Date): string {
  // YYYY-MM-DDTHH:00:00Z
  return d.toISOString().slice(0, 13) + ":00:00Z";
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowedTypes = ["brand-monitor", "market-competitor", "investment-bank"];
  if (!allowedTypes.includes(session.user.accountType || "") && session.user.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden — this data is for brand-monitor, market-competitor and investment-bank accounts only" },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const rangeParam = (searchParams.get("range") || "24h") as RangeKey;
    const cfg = RANGE_CONFIG[rangeParam] ?? RANGE_CONFIG["24h"];
    const range: RangeKey = cfg.bucket === "hour" ? "24h" : rangeParam;

    // includeEvents=1 → also return an `events` array of REAL articles
    // mapped to timeline events. Used by the Investor Desk Adverse
    // Media Timeline (Section 4 — replaces the previous "HISTORICAL
    // (DERIVED)" placeholder).
    const includeEvents = searchParams.get("includeEvents") === "1";
    // Cap the events array at 200 so the payload stays light even for
    // noisy portfolios. The Investor Desk only plots the most recent
    // 200 anyway (timeline scatter density saturates above that).
    const eventLimit = Math.min(200, Math.max(10, parseInt(searchParams.get("eventLimit") || "200", 10)));

    const companySlug = searchParams.get("company");
    // Task: domain-matching-demo-isolation
    const demoFilter = demoFilterFromSession(session);
    let company;
    if (companySlug) {
      if (session.user.role !== "admin") {
        return NextResponse.json(
          { error: "Forbidden — can only view your own company" },
          { status: 403 },
        );
      }
      company = await prisma.company.findUnique({ where: { slug: companySlug } });
    } else {
      const result = await requireUserCompany();
      if (!result.ok) return result.response;
      company = await prisma.company.findUnique({ where: { id: result.data.company.id } });
    }

    if (!company) {
      return NextResponse.json({ range, buckets: [] });
    }

    const since = cfg.days !== null ? new Date() : null;
    if (since) since.setDate(since.getDate() - cfg.days);

    const articles = await prisma.article.findMany({
      where: {
        companyId: company.id,
        ...(since ? { publishedAt: { gte: since } } : {}),
        ...demoFilter,
      },
      select: {
        id: true,
        title: true,
        source: true,
        url: true,
        sentimentScore: true,
        sentimentLabel: true,
        publishedAt: true,
        companyId: true,
      },
      orderBy: { publishedAt: "asc" },
    });

    // Build continuous buckets across the window so the chart x-axis is
    // gap-free even on quiet days/hours. For range=all, we skip
    // bucketing entirely (no meaningful window to span).
    const buckets: Array<{ time: string; count: number; critical: number; high: number; medium: number; low: number }> = [];
    if (cfg.days !== null) {
      const bucket = new Map<
        string,
        { time: string; count: number; critical: number; high: number; medium: number; low: number }
      >();

      const now = new Date();
      if (cfg.bucket === "hour") {
        // 24 buckets, ending at the current hour.
        for (let i = 23; i >= 0; i--) {
          const slot = new Date(now);
          slot.setHours(slot.getHours() - i, 0, 0, 0);
          const key = hourKey(slot);
          bucket.set(key, { time: key, count: 0, critical: 0, high: 0, medium: 0, low: 0 });
        }
      } else {
        for (let i = cfg.days - 1; i >= 0; i--) {
          const slot = new Date(now);
          slot.setDate(slot.getDate() - i);
          slot.setHours(0, 0, 0, 0);
          const key = dayKey(slot);
          bucket.set(key, { time: key, count: 0, critical: 0, high: 0, medium: 0, low: 0 });
        }
      }

      const keyOf = cfg.bucket === "hour" ? hourKey : dayKey;

      for (const a of articles) {
        if (!a.publishedAt) continue;
        const key = keyOf(a.publishedAt);
        const b = bucket.get(key);
        if (!b) continue;
        b.count += 1;
        const sev = severityOf(a.sentimentScore ?? null);
        b[sev] += 1;
      }

      buckets.push(...Array.from(bucket.values()).sort((a, b) => a.time.localeCompare(b.time)));
    }

    // ─── events array (Task: signal-entity-graph) ───────────────
    // When includeEvents=1, also return an `events` array of REAL
    // articles mapped to timeline events. No fabrication — if no
    // real articles exist, the array is empty.
    let events: Array<{
      id: string;
      date: string;
      source: string;
      title: string;
      sentiment: number | null;
      sentimentLabel: string | null;
      severity: "critical" | "high" | "medium" | "low";
      url: string;
      companyId: string | null;
    }> = [];
    if (includeEvents) {
      // Sort most recent first, cap at eventLimit.
      const sorted = [...articles]
        .filter((a) => a.publishedAt !== null)
        .sort((a, b) => {
          const ta = a.publishedAt?.getTime() ?? 0;
          const tb = b.publishedAt?.getTime() ?? 0;
          return tb - ta;
        })
        .slice(0, eventLimit);
      events = sorted.map((a) => ({
        id: a.id,
        date: a.publishedAt!.toISOString(),
        source: a.source,
        title: a.title,
        sentiment: a.sentimentScore,
        sentimentLabel: a.sentimentLabel,
        severity: severityOf(a.sentimentScore ?? null),
        url: a.url,
        companyId: a.companyId,
      }));
    }

    return NextResponse.json({
      range,
      company: { name: company.name, slug: company.slug },
      buckets,
      events,
      eventCount: events.length,
    });
  } catch (err) {
    console.error("Alert timeline API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
