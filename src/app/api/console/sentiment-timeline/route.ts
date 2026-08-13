// ═══════════════════════════════════════════════════════════════
//  POST /api/console/sentiment-timeline
//
//  Skill 11 — Sentiment Timeline (24h hourly evolution).
//
//  Body:   { mode?: "24h" | "7j" }   (default "24h")
//
//  Returns:
//    {
//      meta:   { companyName, mode, generatedAt, windowStart, windowEnd },
//      buckets: Array<{
//        hour:               number,    // 0..23 for 24h, 0..6 for 7j
//        label:              string,    // "14h" | "Lun"
//        articleCount:       number,
//        positivePct:        number,    // 0..100
//        neutralPct:         number,
//        negativePct:        number,
//        dominantSentiment:  "positive"|"neutral"|"negative"|"none",
//        isAnomaly:          boolean,   // |z-score| > 2 on article count
//        isPeak:             boolean,
//        isTrough:           boolean,
//        isCurrent:          boolean,
//      }>,
//      summary: {
//        totalArticles:      number,
//        avgSentimentScore:  number,    // -1..+1
//        dominantSentiment:  "positive"|"neutral"|"negative",
//        trend:              "rising"|"falling"|"stable",
//        peak:               { hour, label, count } | null,
//        trough:             { hour, label, count } | null,
//        anomalies:          Array<{ hour, label, count, zScore }>,
//      },
//    }
//
//  Auth: session required (essential | pro | enterprise | agency | admin).
//  Demo isolation is enforced via demoFilter.
//
//  Anomaly detection: z-score on per-bucket article counts. A bucket
//  is flagged when z > 2 — i.e. its volume exceeds the mean by more
//  than 2 standard deviations. This catches unusual spikes. Quiet
//  hours (z < 0) are not flagged because they are normal noise, not
//  signal.
//
//  Peak / trough: the bucket with the max / min non-zero article
//  count. Trough is only reported if the series has variance (peak
//  count != trough count) — otherwise the data is too uniform to
//  call a "low point".
// ═══════════════════════════════════════════════════════════════

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

export const dynamic = "force-dynamic";

// ─── TYPES ──────────────────────────────────────────────────────

type TimelineMode = "24h" | "7j";

type DominantSentiment = "positive" | "neutral" | "negative" | "none";

interface SentimentBucket {
  hour: number;
  label: string;
  articleCount: number;
  positivePct: number;
  neutralPct: number;
  negativePct: number;
  dominantSentiment: DominantSentiment;
  isAnomaly: boolean;
  isPeak: boolean;
  isTrough: boolean;
  isCurrent: boolean;
}

interface SentimentTimelineResponse {
  meta: {
    companyName: string;
    mode: TimelineMode;
    generatedAt: string;
    windowStart: string;
    windowEnd: string;
  };
  buckets: SentimentBucket[];
  summary: {
    totalArticles: number;
    avgSentimentScore: number;
    dominantSentiment: DominantSentiment;
    trend: "rising" | "falling" | "stable";
    peak: { hour: number; label: string; count: number } | null;
    trough: { hour: number; label: string; count: number } | null;
    anomalies: Array<{ hour: number; label: string; count: number; zScore: number }>;
  };
}

// ─── HELPERS ────────────────────────────────────────────────────

const HOUR_LABELS: string[] = Array.from({ length: 24 }, (_, h) => `${h}h`);
const DAY_LABELS_FR = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

function iso(d: Date): string {
  return d.toISOString();
}

/**
 * Compute mean of an array of numbers. Returns 0 on empty input.
 */
function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  let s = 0;
  for (const x of xs) s += x;
  return s / xs.length;
}

/**
 * Population standard deviation. Returns 0 if all values are equal
 * or the input is empty.
 */
function stddev(xs: number[]): number {
  if (xs.length === 0) return 0;
  const m = mean(xs);
  let acc = 0;
  for (const x of xs) {
    const d = x - m;
    acc += d * d;
  }
  return Math.sqrt(acc / xs.length);
}

/**
 * Pick dominant sentiment from raw positive / neutral / negative
 * counts. Tie-break priority: negative > positive > neutral (a
 * 50/50 negative-positive split is treated as negative to surface
 * risk). Returns "none" when the bucket is empty.
 */
function dominantSentimentOf(
  positive: number,
  neutral: number,
  negative: number,
): DominantSentiment {
  const total = positive + neutral + negative;
  if (total === 0) return "none";
  if (negative >= positive && negative >= neutral) return "negative";
  if (positive >= neutral) return "positive";
  return "neutral";
}

/**
 * Trend over the bucket series. Compares the average article count
 * of the first third of buckets vs the last third. A 10% delta is
 * the threshold for "rising" / "falling"; otherwise "stable".
 */
function trendOf(buckets: SentimentBucket[]): "rising" | "falling" | "stable" {
  if (buckets.length < 3) return "stable";
  const third = Math.max(1, Math.floor(buckets.length / 3));
  const firstSlice = buckets.slice(0, third);
  const lastSlice = buckets.slice(buckets.length - third);
  const a = mean(firstSlice.map((b) => b.articleCount));
  const b = mean(lastSlice.map((b) => b.articleCount));
  if (a === 0) return b > 0 ? "rising" : "stable";
  const delta = (b - a) / a;
  if (delta > 0.1) return "rising";
  if (delta < -0.1) return "falling";
  return "stable";
}

// ─── POST HANDLER ───────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (
    !isAccountTypeAllowed(session, [
      "essential",
      "pro",
      "enterprise",
      "agency",
    ])
  ) {
    return NextResponse.json(
      { error: "Forbidden — insufficient account permissions" },
      { status: 403 },
    );
  }

  // Parse body (mode is optional).
  let mode: TimelineMode = "24h";
  try {
    const body = await req.json();
    if (body && typeof body === "object" && "mode" in body) {
      const m = (body as { mode?: unknown }).mode;
      if (m === "7j") mode = "7j";
      else if (m === "24h") mode = "24h";
    }
  } catch {
    // Empty / invalid body is fine — fall back to default mode.
  }

  try {
    const result = await requireUserCompany();
    if (!result.ok) return result.response;
    const { company, demoFilter: sessionFilter } = result.data;

    // Session-derived demo filter (defence in depth — same value as
    // sessionFilter, kept for parity with the rest of the console).
    const demoFilter = demoFilterFromSession(session);

    const now = new Date();
    const windowEnd = now;

    // Window start: 24h ago (align to top of hour) or 7 days ago
    // (align to start of day).
    const windowStart = new Date(now);
    if (mode === "24h") {
      windowStart.setHours(windowStart.getHours() - 23);
      windowStart.setMinutes(0, 0, 0);
    } else {
      windowStart.setDate(windowStart.getDate() - 6);
      windowStart.setHours(0, 0, 0, 0);
    }

    const articles = await prisma.article.findMany({
      where: {
        companyId: company.id,
        publishedAt: { gte: windowStart, lte: windowEnd },
        ...demoFilter,
        ...sessionFilter,
      },
      select: {
        sentimentScore: true,
        sentimentLabel: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: "asc" },
    });

    // ─── Build bucket array ──────────────────────────────────
    // For 24h: 24 buckets, indexed 0..23, where bucket i corresponds
    //   to (now - (23 - i) hours). Bucket 23 is the current hour.
    // For 7j: 7 buckets, indexed 0..6, where bucket i corresponds to
    //   (today - (6 - i) days). Bucket 6 is today.
    const bucketCount = mode === "24h" ? 24 : 7;
    const buckets: Array<{
      positive: number;
      neutral: number;
      negative: number;
      scoreSum: number;
      scoreCount: number;
    }> = Array.from({ length: bucketCount }, () => ({
      positive: 0,
      neutral: 0,
      negative: 0,
      scoreSum: 0,
      scoreCount: 0,
    }));

    for (const a of articles) {
      if (!a.publishedAt) continue;
      const t = a.publishedAt.getTime();
      if (t < windowStart.getTime() || t > windowEnd.getTime()) continue;

      let idx: number;
      if (mode === "24h") {
        const diffHours = Math.floor(
          (now.getTime() - t) / 3_600_000,
        );
        // diffHours = 0 means "this hour" → bucket 23 (current).
        idx = 23 - diffHours;
        if (idx < 0 || idx > 23) continue;
      } else {
        const dayMs = 86_400_000;
        // Align both to local-midnight to avoid DST / hour skew.
        const todayMidnight = new Date(now);
        todayMidnight.setHours(0, 0, 0, 0);
        const articleMidnight = new Date(a.publishedAt);
        articleMidnight.setHours(0, 0, 0, 0);
        const diffDays = Math.round(
          (todayMidnight.getTime() - articleMidnight.getTime()) / dayMs,
        );
        idx = 6 - diffDays;
        if (idx < 0 || idx > 6) continue;
      }

      const b = buckets[idx];
      if (a.sentimentLabel === "positive") b.positive += 1;
      else if (a.sentimentLabel === "negative") b.negative += 1;
      else b.neutral += 1;

      if (
        typeof a.sentimentScore === "number" &&
        !Number.isNaN(a.sentimentScore)
      ) {
        b.scoreSum += a.sentimentScore;
        b.scoreCount += 1;
      }
    }

    // ─── Stats: anomaly z-scores, peak, trough ──────────────
    const counts = buckets.map(
      (b) => b.positive + b.neutral + b.negative,
    );
    const mu = mean(counts);
    const sigma = stddev(counts);

    // Peak: max article count bucket (skip all-zero series).
    let peakIdx = -1;
    let peakCount = -1;
    for (let i = 0; i < counts.length; i++) {
      if (counts[i] > peakCount) {
        peakCount = counts[i];
        peakIdx = i;
      }
    }
    if (peakCount <= 0) peakIdx = -1;

    // Trough: min non-zero bucket (only reported when the series has
    // variance — peak count != trough count).
    let troughIdx = -1;
    let troughCount = Number.POSITIVE_INFINITY;
    for (let i = 0; i < counts.length; i++) {
      if (counts[i] > 0 && counts[i] < troughCount) {
        troughCount = counts[i];
        troughIdx = i;
      }
    }
    if (peakIdx === -1 || troughIdx === -1 || peakCount === troughCount) {
      troughIdx = -1;
    }

    // Anomalies: z > 2 on article count (spikes only). Quiet hours
    // (z < 0) are normal noise, not signal. Skip when sigma == 0
    // (uniform series — z would be NaN/Inf).
    const anomalies: Array<{
      hour: number;
      label: string;
      count: number;
      zScore: number;
    }> = [];
    if (sigma > 0) {
      for (let i = 0; i < counts.length; i++) {
        const z = (counts[i] - mu) / sigma;
        if (z > 2) {
          anomalies.push({
            hour: i,
            label: mode === "24h" ? HOUR_LABELS[i] : DAY_LABELS_FR[i],
            count: counts[i],
            zScore: Math.round(z * 100) / 100,
          });
        }
      }
    }
    const anomalySet = new Set(anomalies.map((a) => a.hour));

    // ─── Build response buckets ─────────────────────────────
    const outBuckets: SentimentBucket[] = buckets.map((b, i) => {
      const total = b.positive + b.neutral + b.negative;
      const pct = (n: number): number =>
        total === 0 ? 0 : Math.round((n / total) * 1000) / 10;
      const isCurrent = mode === "24h" ? i === 23 : i === 6;
      return {
        hour: i,
        label: mode === "24h" ? HOUR_LABELS[i] : DAY_LABELS_FR[i],
        articleCount: total,
        positivePct: pct(b.positive),
        neutralPct: pct(b.neutral),
        negativePct: pct(b.negative),
        dominantSentiment: dominantSentimentOf(
          b.positive,
          b.neutral,
          b.negative,
        ),
        isAnomaly: anomalySet.has(i),
        isPeak: i === peakIdx,
        isTrough: i === troughIdx,
        isCurrent,
      };
    });

    // ─── Summary ───────────────────────────────────────────
    const totalArticles = counts.reduce((s, c) => s + c, 0);
    const totalScoreSum = buckets.reduce((s, b) => s + b.scoreSum, 0);
    const totalScoreCount = buckets.reduce((s, b) => s + b.scoreCount, 0);
    const avgSentimentScore =
      totalScoreCount > 0
        ? Math.round((totalScoreSum / totalScoreCount) * 1000) / 1000
        : 0;

    const totalPositive = buckets.reduce((s, b) => s + b.positive, 0);
    const totalNeutral = buckets.reduce((s, b) => s + b.neutral, 0);
    const totalNegative = buckets.reduce((s, b) => s + b.negative, 0);
    const overallDominant = dominantSentimentOf(
      totalPositive,
      totalNeutral,
      totalNegative,
    );

    const trend = trendOf(outBuckets);

    const peak =
      peakIdx >= 0
        ? {
            hour: peakIdx,
            label: outBuckets[peakIdx].label,
            count: peakCount,
          }
        : null;

    const trough =
      troughIdx >= 0
        ? {
            hour: troughIdx,
            label: outBuckets[troughIdx].label,
            count: troughCount,
          }
        : null;

    const responseBody: SentimentTimelineResponse = {
      meta: {
        companyName: company.name,
        mode,
        generatedAt: iso(now),
        windowStart: iso(windowStart),
        windowEnd: iso(windowEnd),
      },
      buckets: outBuckets,
      summary: {
        totalArticles,
        avgSentimentScore,
        dominantSentiment: overallDominant,
        trend,
        peak,
        trough,
        anomalies,
      },
    };

    return NextResponse.json(responseBody);
  } catch (err) {
    logError(
      "console.sentiment-timeline",
      `Sentiment timeline API error: ${err}`,
    );
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
