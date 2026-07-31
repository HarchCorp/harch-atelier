import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { requireUserCompany } from "@/lib/harchiq/company-session";

// ═══════════════════════════════════════════════════════════════
//  GET /api/console/alert-timeline?range=24h|7d|30d
//
//  Returns alerts (articles) grouped by hour (24h) or day (7d/30d)
//  for timeline charts. Each bucket reports the total count and a
//  severity breakdown (critical / high / medium / low) derived from
//  the article sentimentScore — same thresholds as /api/console/alerts.
//
//  Auth: requires session (brand-monitor | market-competitor |
//  investment-bank | admin).
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

type RangeKey = "24h" | "7d" | "30d";
const RANGE_CONFIG: Record<RangeKey, { days: number; bucket: "hour" | "day" }> = {
  "24h": { days: 1, bucket: "hour" },
  "7d": { days: 7, bucket: "day" },
  "30d": { days: 30, bucket: "day" },
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
    const range: RangeKey = cfg.bucket === "hour" ? "24h" : (rangeParam === "7d" ? "7d" : "30d");

    const companySlug = searchParams.get("company");
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

    const since = new Date();
    since.setDate(since.getDate() - cfg.days);

    const articles = await prisma.article.findMany({
      where: {
        companyId: company.id,
        publishedAt: { gte: since },
      },
      select: {
        sentimentScore: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: "asc" },
    });

    // Build continuous buckets across the window so the chart x-axis is
    // gap-free even on quiet days/hours.
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

    const buckets = Array.from(bucket.values()).sort((a, b) => a.time.localeCompare(b.time));

    return NextResponse.json({
      range,
      company: { name: company.name, slug: company.slug },
      buckets,
    });
  } catch (err) {
    console.error("Alert timeline API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
