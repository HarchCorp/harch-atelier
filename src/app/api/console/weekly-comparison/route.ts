// ═══════════════════════════════════════════════════════════════
//  GET /api/console/weekly-comparison
//
//  Pro Dashboard — "Cette semaine vs semaine dernière" cards.
//
//  Returns 4 metrics comparing this week to last week:
//    - sentimentPct : % positive articles
//    - mentions     : total article count
//    - sources      : distinct source count
//    - aiVisibility : % AI engines citing the company
//
//  Each metric returns:
//    { current, previous, delta, direction: "up" | "down" | "stable" }
//
//  Auth: requires session (brand-monitor | market-competitor |
//  investment-bank | admin).
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { isDemoEmail } from "@/lib/demo-session";
import { prisma } from "@/lib/db";
import {
  requireUserCompany,
  demoFilterFromSession,
} from "@/lib/harchiq/company-session";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

interface MetricDelta {
  current: number;
  previous: number;
  delta: number;
  direction: "up" | "down" | "stable";
}

interface WeeklyComparisonResponse {
  range: "7d vs 7d";
  metrics: {
    sentimentPct: MetricDelta;
    mentions: MetricDelta;
    sources: MetricDelta;
    aiVisibility: MetricDelta;
  };
  source: "neon" | "demo";
}

function directionOf(curr: number, prev: number): "up" | "down" | "stable" {
  if (prev === 0) return curr > 0 ? "up" : "stable";
  const ratio = (curr - prev) / prev;
  if (Math.abs(ratio) < 0.01) return "stable";
  return ratio > 0 ? "up" : "down";
}

function deltaOf(curr: number, prev: number, isPercentage: boolean): number {
  if (isPercentage) {
    // For percentage metrics, delta = absolute percentage point change
    return Math.round((curr - prev) * 10) / 10;
  }
  if (prev === 0) return curr;
  return Math.round(((curr - prev) / prev) * 100);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.isDemo || isDemoEmail(session.user.email)) {
    return NextResponse.json(buildDemo());
  }

  try {
    const result = await requireUserCompany();
    if (!result.ok) return result.response;
    const company = await prisma.company.findUnique({
      where: { id: result.data.company.id },
      select: { id: true, name: true, slug: true },
    });
    if (!company) return NextResponse.json(buildDemo());

    const demoFilter = demoFilterFromSession(session);

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000);

    // Fetch articles for both windows in a single query, then bucket
    // by publishedAt into "this week" vs "last week".
    const articles = await prisma.article.findMany({
      where: {
        companyId: company.id,
        publishedAt: { gte: fourteenDaysAgo },
        ...demoFilter,
      },
      select: {
        source: true,
        sentimentLabel: true,
        publishedAt: true,
      },
    });

    let thisPositive = 0,
      thisTotal = 0,
      lastPositive = 0,
      lastTotal = 0;
    const thisSources = new Set<string>();
    const lastSources = new Set<string>();

    for (const a of articles) {
      if (!a.publishedAt) continue;
      const ts = a.publishedAt.getTime();
      if (ts >= sevenDaysAgo.getTime()) {
        thisTotal += 1;
        if (a.sentimentLabel === "positive") thisPositive += 1;
        if (a.source) thisSources.add(a.source);
      } else {
        lastTotal += 1;
        if (a.sentimentLabel === "positive") lastPositive += 1;
        if (a.source) lastSources.add(a.source);
      }
    }

    // AI visibility — distinct cited engines this week vs last week
    const aiVisThis = await prisma.aIVisibility.count({
      where: {
        companyId: company.id,
        cited: true,
        checkedAt: { gte: sevenDaysAgo },
        ...demoFilter,
      },
    });
    const aiVisLast = await prisma.aIVisibility.count({
      where: {
        companyId: company.id,
        cited: true,
        checkedAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
        ...demoFilter,
      },
    });
    // Normalize to % of 8 monitored engines
    const aiThisPct = Math.round((aiVisThis / 8) * 100);
    const aiLastPct = Math.round((aiVisLast / 8) * 100);

    const thisSentPct = thisTotal > 0 ? Math.round((thisPositive / thisTotal) * 100) : 0;
    const lastSentPct = lastTotal > 0 ? Math.round((lastPositive / lastTotal) * 100) : 0;

    const response: WeeklyComparisonResponse = {
      range: "7d vs 7d",
      metrics: {
        sentimentPct: {
          current: thisSentPct,
          previous: lastSentPct,
          delta: deltaOf(thisSentPct, lastSentPct, true),
          direction: directionOf(thisSentPct, lastSentPct),
        },
        mentions: {
          current: thisTotal,
          previous: lastTotal,
          delta: deltaOf(thisTotal, lastTotal, false),
          direction: directionOf(thisTotal, lastTotal),
        },
        sources: {
          current: thisSources.size,
          previous: lastSources.size,
          delta: thisSources.size - lastSources.size,
          direction: directionOf(thisSources.size, lastSources.size),
        },
        aiVisibility: {
          current: aiThisPct,
          previous: aiLastPct,
          delta: deltaOf(aiThisPct, aiLastPct, true),
          direction: directionOf(aiThisPct, aiLastPct),
        },
      },
      source: "neon",
    };

    return NextResponse.json(response);
  } catch (err) {
    logError("console.weekly-comparison", `[weekly-comparison] error: ${err}`);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

function buildDemo(): WeeklyComparisonResponse {
  return {
    range: "7d vs 7d",
    metrics: {
      sentimentPct: { current: 72, previous: 68, delta: 4, direction: "up" },
      mentions: { current: 1456, previous: 1234, delta: 18, direction: "up" },
      sources: { current: 15, previous: 12, delta: 3, direction: "up" },
      aiVisibility: { current: 42, previous: 45, delta: -3, direction: "down" },
    },
    source: "demo",
  };
}
