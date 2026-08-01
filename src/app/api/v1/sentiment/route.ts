import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  authenticateApiKey,
  unauthorizedResponse,
} from "@/lib/auth/api-key";

// ═══════════════════════════════════════════════════════════════
//  GET /api/v1/sentiment?range=7d|30d|365d
//
//  Returns the daily sentiment time-series for the API key's
//  company — same shape as /api/console/sentiment-trend but
//  authenticated via API key instead of NextAuth session.
//
//  Response:
//    {
//      company: { id, name, slug },
//      range: "7d" | "30d" | "365d",
//      data: [
//        { date: "2026-07-01", avgScore, count, positive, neutral, negative },
//        ...
//      ]
//    }
//
//  Auth: Bearer harch_<key> (scoped to the key's company).
//
//  Task: signal-enterprise-platform
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
  const identity = await authenticateApiKey(req);
  if (!identity) return unauthorizedResponse();

  const url = new URL(req.url);
  const rangeParam = url.searchParams.get("range") || "30d";
  const days = RANGE_DAYS[rangeParam] ?? 30;
  const range = (Object.keys(RANGE_DAYS).find((k) => RANGE_DAYS[k] === days) || "30d") as string;

  const demoFilter = { isDemo: identity.isDemo };

  const [company, articles] = await Promise.all([
    prisma.company.findUnique({
      where: { id: identity.companyId },
      select: { id: true, name: true, slug: true },
    }),
    prisma.article.findMany({
      where: {
        companyId: identity.companyId,
        publishedAt: {
          gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        },
        ...demoFilter,
      },
      select: {
        sentimentScore: true,
        sentimentLabel: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: "asc" },
    }),
  ]);

  if (!company) {
    return NextResponse.json(
      { error: "Company not found for this API key." },
      { status: 404 },
    );
  }

  // Build per-day buckets across the full window so sparse days still
  // appear as zero rows (chart x-axis should be continuous).
  const bucket = new Map<
    string,
    { sum: number; count: number; positive: number; neutral: number; negative: number }
  >();

  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    bucket.set(dateKey(d), { sum: 0, count: 0, positive: 0, neutral: 0, negative: 0 });
  }

  for (const a of articles) {
    if (!a.publishedAt) continue;
    const key = dateKey(a.publishedAt);
    const b = bucket.get(key);
    if (!b) continue;
    b.count++;
    if (a.sentimentScore !== null && a.sentimentScore !== undefined) b.sum += a.sentimentScore;
    if (a.sentimentLabel === "positive") b.positive++;
    else if (a.sentimentLabel === "negative") b.negative++;
    else if (a.sentimentLabel === "neutral") b.neutral++;
  }

  const data = Array.from(bucket.entries()).map(([date, b]) => ({
    date,
    avgScore: b.count > 0 ? Math.round((b.sum / b.count) * 1000) / 1000 : null,
    count: b.count,
    positive: b.positive,
    neutral: b.neutral,
    negative: b.negative,
  }));

  return NextResponse.json({
    company,
    range,
    data,
  });
}
