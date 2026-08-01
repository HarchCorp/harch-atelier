import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import {
  requireUserCompany,
  demoFilterFromSession,
} from "@/lib/harchiq/company-session";
import { aggregateAlertsByCity, knownCities, type GeoAlertInput } from "@/lib/harchiq/geo-mapper";

// ═══════════════════════════════════════════════════════════════
//  GET /api/console/geo-signals?range=7d|30d|all
//
//  Returns alerts aggregated by geographic location (source HQ city).
//  Dataminr plots signals on a map by where they originate; we do
//  the same for the user's company, plotting every article published
//  by a Moroccan / African media source as a circle on the map.
//
//  Output shape:
//    {
//      company: { name, slug },
//      range: "7d" | "30d" | "all",
//      points: [{
//        lat, lng, city, region,
//        alertCount, avgSentiment, topSources, severity
//      }],
//      totals: { cities, alerts, criticalCount, highCount }
//    }
//
//  Auth: requires session (brand-monitor | market-competitor |
//  investment-bank | admin).
//
//  Task ID: dataminr-geo-multimodal
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

const RANGE_DAYS: Record<string, number> = {
  "7d": 7,
  "30d": 30,
};

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowedTypes = ["brand-monitor", "market-competitor", "investment-bank", "harch-alpha"];
  if (!allowedTypes.includes(session.user.accountType || "") && session.user.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden — geo signals are for brand-monitor, market-competitor, investment-bank accounts" },
      { status: 403 },
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const rangeParam = searchParams.get("range") || "7d";
    const companySlug = searchParams.get("company");

    // "all" = no date filter; everything else maps to RANGE_DAYS.
    const days = RANGE_DAYS[rangeParam];
    const range = days ? (rangeParam as string) : "all";

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
      return NextResponse.json({
        company: null,
        range,
        points: [],
        totals: { cities: 0, alerts: 0, criticalCount: 0, highCount: 0 },
      });
    }

    // ─── Build the article query ──────────────────────────────────
    //  We pull every article published in the range that has a
    //  sentimentScore (so the heatmap can colour by sentiment).
    //  Articles without sentiment are still included but appear as
    //  grey markers.
    const where = {
      companyId: company.id,
      ...demoFilter,
      ...(days ? { publishedAt: { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) } } : {}),
    };

    const articles = await prisma.article.findMany({
      where,
      select: {
        source: true,
        sentimentScore: true,
        sentimentLabel: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: "desc" },
      take: 5000, // hard cap — anything more would slow the aggregator
    });

    // ─── Aggregate by city via the geo-mapper ────────────────────
    //  Each article is converted to a GeoAlertInput, then bucketed
    //  by its source's HQ city.
    const geoAlerts: GeoAlertInput[] = articles.map((a) => {
      // Derive a severity label from sentimentScore so the heatmap
      // can highlight crisis cities.
      let severity: "critical" | "high" | "medium" | "low" = "low";
      const s = a.sentimentScore;
      if (typeof s === "number") {
        if (s < -0.6) severity = "critical";
        else if (s < -0.3) severity = "high";
        else if (s < -0.1) severity = "medium";
      }
      return {
        source: a.source,
        sentimentScore: a.sentimentScore,
        severity,
      };
    });

    const points = aggregateAlertsByCity(geoAlerts);

    // ─── Add empty city markers so the map shows the full grid ────
    //  The geo-mapper knows ~15 Moroccan cities. We add the ones
    //  with zero alerts as ghost markers (alertCount: 0) so the user
    //  sees the geographic coverage even when their company has no
    //  alerts in a region yet.
    const known = knownCities();
    const present = new Set(points.map((p) => `${p.city}|${p.lat.toFixed(4)}`));
    const ghostCities = known
      .filter((c) => !present.has(`${c.city}|${c.lat.toFixed(4)}`))
      .map((c) => ({
        lat: c.lat,
        lng: c.lng,
        city: c.city,
        region: c.region,
        alertCount: 0,
        avgSentiment: null,
        topSources: [] as string[],
        severity: "low" as const,
      }));

    const allPoints = [...points, ...ghostCities];

    // ─── Totals for the headline strip ───────────────────────────
    const totals = {
      cities: points.length, // only cities WITH alerts (not ghosts)
      alerts: points.reduce((s, p) => s + p.alertCount, 0),
      criticalCount: points.filter((p) => p.severity === "critical").length,
      highCount: points.filter((p) => p.severity === "high").length,
    };

    return NextResponse.json({
      company: { name: company.name, slug: company.slug },
      range,
      points: allPoints,
      totals,
    });
  } catch (err) {
    console.error("Geo-signals API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
