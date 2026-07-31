import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";

// ═══════════════════════════════════════════════════════════════
//  GET /api/console/search?q=<query>&limit=<n>
//
//  Global search across the console. Returns a unified list of
//  results grouped by type:
//    • alert   — negative-sentiment articles + high/critical risks
//    • topic   — sources & risk categories (volume = article count)
//    • report  — monthly report stubs derived from article months
//
//  Auth: requires a session (any accountType). The search runs
//  against the caller's primary company (first company in the DB
//  by default, or `?company=<slug>` to override).
//
//  PostgreSQL: uses `contains` + `mode: "insensitive"` so the query
//  is case-insensitive and accent-aware.
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function monthLabel(period: string): string {
  // period = "YYYY-MM"
  const [y, m] = period.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || m < 1 || m > 12) return `Monthly Report ${period}`;
  return `Monthly Report ${MONTH_NAMES[m - 1]} ${y}`;
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const rawQuery = url.searchParams.get("q") ?? "";
    const query = rawQuery.trim();
    const limitParam = parseInt(url.searchParams.get("limit") ?? "20", 10);
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 50) : 20;

    if (!query) {
      return NextResponse.json({ query: "", results: [], total: 0 });
    }

    // Resolve the caller's primary company
    const companySlug = url.searchParams.get("company");
    const company = companySlug
      ? await prisma.company.findUnique({ where: { slug: companySlug } })
      : await prisma.company.findFirst({ orderBy: { createdAt: "asc" } });

    if (!company) {
      return NextResponse.json({ query, results: [], total: 0 });
    }

    const contains = { contains: query, mode: "insensitive" as const };

    // ─── ALERTS (top 10) ─────────────────────────────────────────
    // Negative-sentiment articles whose title/summary/source matches,
    // plus high/critical risk assessments whose category matches.
    const [matchingArticles, matchingRisks] = await Promise.all([
      prisma.article.findMany({
        where: {
          companyId: company.id,
          OR: [
            { title: contains },
            { summary: contains },
            { source: contains },
          ],
        },
        orderBy: { publishedAt: "desc" },
        take: 10,
        select: {
          id: true,
          title: true,
          source: true,
          url: true,
          summary: true,
          sentimentLabel: true,
          sentimentScore: true,
          publishedAt: true,
        },
      }),
      prisma.riskAssessment.findMany({
        where: {
          companyId: company.id,
          riskLevel: { in: ["high", "critical"] },
          OR: [
            { category: contains },
            { trajectory: contains },
          ],
        },
        orderBy: { riskScore: "desc" },
        take: 5,
        select: {
          id: true,
          category: true,
          riskLevel: true,
          riskScore: true,
          assessedAt: true,
        },
      }),
    ]);

    const alerts: {
      type: "alert";
      id: string;
      title: string;
      source: string;
      date: string | null;
      url: string | null;
      severity: string;
    }[] = matchingArticles.map((a) => ({
      type: "alert",
      id: a.id,
      title: a.title,
      source: a.source,
      date: a.publishedAt ? a.publishedAt.toISOString() : null,
      url: a.url,
      severity: (a.sentimentScore ?? 0) < -0.6 ? "critical" : "high",
    }));

    for (const r of matchingRisks) {
      if (alerts.length >= 10) break;
      alerts.push({
        type: "alert",
        id: r.id,
        title: `${r.category} risk — ${r.riskLevel}`,
        source: "HarchIQ Risk Engine",
        date: r.assessedAt ? r.assessedAt.toISOString() : null,
        url: null,
        severity: r.riskLevel === "critical" ? "critical" : "high",
      });
    }

    // ─── TOPICS (top 5) ──────────────────────────────────────────
    // Aggregate matching sources and risk categories into topic rows.
    const matchingTopicArticles = await prisma.article.findMany({
      where: {
        companyId: company.id,
        source: contains,
      },
      select: { source: true },
    });

    const sourceVolume = new Map<string, number>();
    for (const a of matchingTopicArticles) {
      sourceVolume.set(a.source, (sourceVolume.get(a.source) ?? 0) + 1);
    }

    const topics: { type: "topic"; id: string; label: string; volume: number }[] = [];
    for (const [label, vol] of Array.from(sourceVolume.entries()).sort((a, b) => b[1] - a[1])) {
      if (topics.length >= 5) break;
      topics.push({ type: "topic", id: `src-${label.toLowerCase().replace(/\s+/g, "-")}`, label, volume: vol });
    }

    // If we still have room, look for risk categories that match the query
    if (topics.length < 5) {
      const matchingRiskTopics = await prisma.riskAssessment.findMany({
        where: {
          companyId: company.id,
          category: contains,
        },
        select: { category: true, articleCount: true },
      });
      const riskVolume = new Map<string, number>();
      for (const r of matchingRiskTopics) {
        riskVolume.set(r.category, (riskVolume.get(r.category) ?? 0) + (r.articleCount ?? 0));
      }
      for (const [label, vol] of Array.from(riskVolume.entries()).sort((a, b) => b[1] - a[1])) {
        if (topics.length >= 5) break;
        if (topics.some((t) => t.label === label)) continue;
        topics.push({ type: "topic", id: `risk-${label.toLowerCase().replace(/\s+/g, "-")}`, label, volume: vol });
      }
    }

    // ─── REPORTS (top 5) ─────────────────────────────────────────
    // Group all company articles by month (YYYY-MM). Match if the
    // query matches the formatted month title (e.g. "July 2026") or
    // the period (e.g. "2026-07"). Return the most recent matches.
    const allArticlesForReports = await prisma.article.findMany({
      where: { companyId: company.id, publishedAt: { not: null } },
      select: { publishedAt: true },
      orderBy: { publishedAt: "desc" },
      take: 500,
    });

    const periodVolume = new Map<string, number>();
    for (const a of allArticlesForReports) {
      if (!a.publishedAt) continue;
      const d = a.publishedAt;
      const period = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      periodVolume.set(period, (periodVolume.get(period) ?? 0) + 1);
    }

    const qLower = query.toLowerCase();
    const reports: { type: "report"; id: string; title: string; period: string }[] = [];
    for (const period of Array.from(periodVolume.keys()).sort().reverse()) {
      if (reports.length >= 5) break;
      const title = monthLabel(period);
      if (title.toLowerCase().includes(qLower) || period.toLowerCase().includes(qLower)) {
        reports.push({ type: "report", id: `report-${period}`, title, period });
      }
    }

    const results = [
      ...alerts.slice(0, 10),
      ...topics.slice(0, 5),
      ...reports.slice(0, 5),
    ].slice(0, limit);

    return NextResponse.json({
      query,
      results,
      total: results.length,
      counts: {
        alert: alerts.length,
        topic: topics.length,
        report: reports.length,
      },
    });
  } catch (err) {
    console.error("Search API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
