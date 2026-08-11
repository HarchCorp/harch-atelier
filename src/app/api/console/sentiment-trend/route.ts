import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { logError } from "@/lib/logger";
import { isAccountTypeAllowed } from "@/lib/auth/rbac";
import {
  requireUserCompany,
  demoFilterFromSession,
} from "@/lib/harchiq/company-session";

// ═══════════════════════════════════════════════════════════════
//  GET /api/console/sentiment-trend?range=7d|30d|365d
//
//  Returns daily sentiment time-series for the primary company's
//  alerts (articles). Each day reports:
//    - avgScore   : mean sentimentScore of articles published that day
//    - count      : total articles that day
//    - positive   : count of articles labelled positive
//    - neutral    : count of articles labelled neutral
//    - negative   : count of articles labelled negative
//
//  Auth: requires session (brand-monitor | market-competitor |
//  investment-bank | admin). Traders monitor markets, not reputation.
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

const RANGE_DAYS: Record<string, number> = {
  "7d": 7,
  "30d": 30,
  "365d": 365,
};

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAccountTypeAllowed(session, ["essential", "pro", "enterprise", "agency"])) {
    return NextResponse.json(
      { error: "Forbidden — insufficient account permissions" },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const rangeParam = searchParams.get("range") || "30d";
    const days = RANGE_DAYS[rangeParam] ?? 30;
    const range = (Object.keys(RANGE_DAYS).find((k) => RANGE_DAYS[k] === days) || "30d") as string;

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
      return NextResponse.json({ range, data: [] });
    }

    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const articles = await prisma.article.findMany({
      where: {
        companyId: company.id,
        publishedAt: { gte: since },
        ...demoFilter,
      },
      select: {
        sentimentScore: true,
        sentimentLabel: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: "asc" },
    });

    // Build per-day buckets across the full window so sparse days still
    // appear as zero rows (chart x-axis should be continuous).
    const bucket = new Map<
      string,
      { date: string; sum: number; count: number; positive: number; neutral: number; negative: number }
    >();

    const start = new Date(since);
    const today = new Date();
    for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
      const key = dateKey(d);
      bucket.set(key, { date: key, sum: 0, count: 0, positive: 0, neutral: 0, negative: 0 });
    }

    for (const a of articles) {
      if (!a.publishedAt) continue;
      const key = dateKey(a.publishedAt);
      const b = bucket.get(key);
      if (!b) continue;
      b.count += 1;
      b.sum += a.sentimentScore ?? 0;
      if (a.sentimentLabel === "positive") b.positive += 1;
      else if (a.sentimentLabel === "negative") b.negative += 1;
      else b.neutral += 1;
    }

    const data = Array.from(bucket.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((b) => ({
        date: b.date,
        avgScore: b.count > 0 ? Math.round((b.sum / b.count) * 1000) / 1000 : 0,
        count: b.count,
        positive: b.positive,
        neutral: b.neutral,
        negative: b.negative,
      }));

    return NextResponse.json({
      range,
      company: { name: company.name, slug: company.slug },
      data,
    });
  } catch (err) {
    logError("console.sentiment-trend", `Sentiment trend API error: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
