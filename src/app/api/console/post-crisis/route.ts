// ═══════════════════════════════════════════════════════════════
//  POST /api/console/post-crisis
//
//  Skill 30 — Post-Crisis Review.
//
//  Generates a structured, PDF-ready POST-MORTEM document for the
//  communication team. The crisis is presumed to be over (or winding
//  down). The route looks BACKWARD over the last 30 days and compiles:
//
//    • timeline  — chronologie des événements marquants
//                  (premier signal → escalade → pic → résolution)
//    • impact    — chute de sentiment, pic de mentions, portée touchée,
//                  durée de la crise en jours
//    • lessons   — leçons apprises (catégorisées, éditables côté client)
//    • preventionPlan — plan d'action préventif (action, priorité, owner,
//                  échéance) pour réduire la probabilité / l'impact d'une
//                  prochaine crise similaire
//
//  Fetches (in parallel):
//    • Articles négatifs (last 30d)
//    • Tous les articles (last 30d)        — pour tendance + volume
//    • Risk assessments (last 30d)         — high/critical
//    • Inbound WhatsApp flagged (last 30d) — bad buzz privé
//    • Top sources (group-by source)       — identification des relais
//    • Company info                         — name, sector, ticker
//
//  Auth: requires session (getServerSession) + linked company
//  (requireUserCompany). Demo isolation filter is spread into every
//  Prisma where clause so demo users see only demo data.
//
//  Skill ID: SKILL-30-POST-CRISIS
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { logInfo, logError } from "@/lib/logger";
import { requireUserCompany } from "@/lib/harchiq/company-session";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// ─── Types (returned to the client) ─────────────────────────────

export type TimelineSeverity = "critical" | "high" | "medium" | "low" | "info";

export interface PostCrisisTimelineEvent {
  date: string;          // pre-formatted fr-FR (e.g. "12 janv. 14:30")
  timestamp: number | null;
  event: string;
  severity: TimelineSeverity;
}

export interface PostCrisisImpact {
  sentimentDrop: number;      // baseline avg - crisis avg (positive = drop)
  baselineSentiment: number | null;
  crisisSentiment: number | null;
  mentionPeak: number;        // max negative articles in a single day
  mentionPeakDate: string | null;
  reachAffected: number;      // estimated reach proxy
  uniqueSources: number;
  durationDays: number;       // span between first and last negative article
  totalNegative30d: number;
  totalArticles30d: number;
  velocityMultiplier: number; // crisis velocity vs baseline velocity
}

export interface PostCrisisLesson {
  id: string;
  text: string;
  category: "detection" | "communication" | "veille" | "process" | "gouvernance";
}

export type PreventionPriority = "critical" | "high" | "medium";

export interface PostCrisisPreventionItem {
  action: string;
  priority: PreventionPriority;
  owner: string;
  deadline: string;          // ISO date (YYYY-MM-DD)
  deadlineLabel: string;     // fr-FR display label
}

export interface PostCrisisResponse {
  meta: {
    companyName: string;
    sector: string | null;
    ticker: string | null;
    generatedAt: string;
    date: string;
    window: string;
    crisisDetected: boolean;
    crisisStart: string | null;
    crisisEnd: string | null;
  };
  timeline: PostCrisisTimelineEvent[];
  impact: PostCrisisImpact;
  lessons: PostCrisisLesson[];
  preventionPlan: PostCrisisPreventionItem[];
  recommendation: string;
  sentimentTrend: Array<{ date: string; sentiment: number | null; negativeCount: number }>;
}

// ─── POST handler ───────────────────────────────────────────────

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await requireUserCompany();
  if (!result.ok) return result.response;

  const { company, demoFilter } = result.data;

  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

    // ─── Batch 1: parallel fetch (independent of negative articles) ─
    const [companyRow, negativeArticles, allArticles30d, riskAssessments, whatsappFlagged, topSources] =
      await Promise.all([
        prisma.company.findUnique({
          where: { id: company.id },
          select: { name: true, sector: true, ticker: true },
        }),
        prisma.article.findMany({
          where: {
            companyId: company.id,
            sentimentLabel: "negative",
            publishedAt: { gte: thirtyDaysAgo },
            ...demoFilter,
          },
          orderBy: { publishedAt: "asc" },
          take: 200,
          select: {
            id: true,
            title: true,
            source: true,
            url: true,
            summary: true,
            content: true,
            sentimentScore: true,
            sentimentLabel: true,
            publishedAt: true,
            language: true,
          },
        }),
        prisma.article.findMany({
          where: {
            companyId: company.id,
            publishedAt: { gte: thirtyDaysAgo },
            ...demoFilter,
          },
          select: {
            sentimentScore: true,
            sentimentLabel: true,
            publishedAt: true,
            source: true,
          },
          orderBy: { publishedAt: "asc" },
          take: 2000,
        }),
        prisma.riskAssessment.findMany({
          where: {
            companyId: company.id,
            riskLevel: { in: ["high", "critical"] },
            createdAt: { gte: thirtyDaysAgo },
            ...demoFilter,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            category: true,
            riskLevel: true,
            riskScore: true,
            createdAt: true,
          },
        }),
        prisma.inboundWhatsAppMessage.findMany({
          where: { status: "flagged", receivedAt: { gte: thirtyDaysAgo } },
          orderBy: { receivedAt: "desc" },
          take: 10,
          select: {
            id: true,
            body: true,
            fromName: true,
            crisisScore: true,
            receivedAt: true,
            language: true,
            sentimentScore: true,
          },
        }),
        prisma.article.groupBy({
          by: ["source"],
          where: {
            companyId: company.id,
            sentimentLabel: "negative",
            publishedAt: { gte: thirtyDaysAgo },
            ...demoFilter,
          },
          _count: true,
          _avg: { sentimentScore: true },
          orderBy: { _count: { source: "desc" } },
          take: 10,
        }),
      ]);

    // ─── Day buckets (per-day negative count + avg sentiment) ─────
    const dayBuckets = new Map<
      string,
      { negativeCount: number; totalCount: number; sentimentSum: number; sentimentSamples: number }
    >();

    for (const a of allArticles30d) {
      if (!a.publishedAt) continue;
      const key = a.publishedAt.toISOString().slice(0, 10);
      const bucket = dayBuckets.get(key) ?? { negativeCount: 0, totalCount: 0, sentimentSum: 0, sentimentSamples: 0 };
      bucket.totalCount += 1;
      if (a.sentimentLabel === "negative") bucket.negativeCount += 1;
      if (typeof a.sentimentScore === "number") {
        bucket.sentimentSum += a.sentimentScore;
        bucket.sentimentSamples += 1;
      }
      dayBuckets.set(key, bucket);
    }

    // Convert to a sorted trend array (last 30 days, fill missing days)
    const trend: PostCrisisResponse["sentimentTrend"] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const key = d.toISOString().slice(0, 10);
      const bucket = dayBuckets.get(key);
      const avg = bucket && bucket.sentimentSamples > 0
        ? Math.round((bucket.sentimentSum / bucket.sentimentSamples) * 1000) / 1000
        : null;
      trend.push({
        date: key,
        sentiment: avg,
        negativeCount: bucket?.negativeCount ?? 0,
      });
    }

    // ─── Crisis window detection ─────────────────────────────────
    // The crisis window is the contiguous span of days (around the
    // peak day) where the negative-mention count > 0.
    // If we can't find a clear window, fall back to [firstNeg .. lastNeg].
    const negDays = trend.filter((d) => d.negativeCount > 0).map((d) => d.date);
    const crisisDetected = negDays.length > 0;

    let crisisStart: string | null = null;
    let crisisEnd: string | null = null;

    if (crisisDetected) {
      // Find the peak day
      let peakIdx = 0;
      let peakCount = 0;
      for (let i = 0; i < trend.length; i++) {
        if (trend[i].negativeCount > peakCount) {
          peakCount = trend[i].negativeCount;
          peakIdx = i;
        }
      }
      crisisStart = negDays[0];
      crisisEnd = negDays[negDays.length - 1];

      // Tighten the window to a contiguous band around the peak day
      // where negativeCount > 0 (ignores isolated days before/after).
      let left = peakIdx;
      while (left > 0 && trend[left - 1].negativeCount > 0) left -= 1;
      let right = peakIdx;
      while (right < trend.length - 1 && trend[right + 1].negativeCount > 0) right += 1;
      crisisStart = trend[left].date;
      crisisEnd = trend[right].date;
    }

    // ─── Sentiment drop (baseline vs crisis window) ──────────────
    // Baseline = 7 days immediately before the crisis window (or the
    // pre-crisis half of the 30d window if no crisis detected).
    let baselineAvg: number | null = null;
    let crisisAvg: number | null = null;

    const avgFromDays = (days: string[]): number | null => {
      const samples = days
        .map((d) => dayBuckets.get(d))
        .filter((b): b is NonNullable<typeof b> => b !== undefined && b.sentimentSamples > 0);
      if (samples.length === 0) return null;
      const sum = samples.reduce((s, b) => s + b.sentimentSum / b.sentimentSamples, 0);
      return Math.round((sum / samples.length) * 1000) / 1000;
    };

    if (crisisDetected && crisisStart && crisisEnd) {
      const startDate = new Date(crisisStart + "T00:00:00Z");
      const endDate = new Date(crisisEnd + "T23:59:59Z");
      // Crisis window days
      const crisisDays: string[] = [];
      const cursor = new Date(startDate);
      while (cursor.getTime() <= endDate.getTime()) {
        crisisDays.push(cursor.toISOString().slice(0, 10));
        cursor.setUTCDate(cursor.getUTCDate() + 1);
      }
      crisisAvg = avgFromDays(crisisDays);

      // Baseline = 7 days before crisisStart
      const baselineDays: string[] = [];
      for (let i = 1; i <= 7; i++) {
        const d = new Date(startDate.getTime() - i * 86400000);
        baselineDays.push(d.toISOString().slice(0, 10));
      }
      baselineAvg = avgFromDays(baselineDays);
    } else if (trend.length > 14) {
      // No clear crisis window — split the 30d window in half as a
      // fallback so the impact card still shows a delta.
      const firstHalf = trend.slice(0, 15).map((d) => d.date);
      const secondHalf = trend.slice(15).map((d) => d.date);
      baselineAvg = avgFromDays(firstHalf);
      crisisAvg = avgFromDays(secondHalf);
    }

    const sentimentDrop =
      baselineAvg !== null && crisisAvg !== null
        ? Math.round((baselineAvg - crisisAvg) * 1000) / 1000 // positive = drop (worse)
        : 0;

    // ─── Mention peak + reach + duration ─────────────────────────
    const peakEntry = trend.reduce<{ date: string | null; count: number }>(
      (acc, d) => (d.negativeCount > acc.count ? { date: d.date, count: d.negativeCount } : acc),
      { date: null, count: 0 },
    );
    const mentionPeak = peakEntry.count;

    const uniqueSources = new Set(
      negativeArticles.map((a) => a.source?.toLowerCase().trim()).filter(Boolean),
    ).size;
    const reachAffected = Math.round(
      uniqueSources * (negativeArticles.length / Math.max(uniqueSources, 1)) * 1200,
    );

    // Duration = span between first and last negative article (days)
    const sortedByTime = negativeArticles
      .filter((a) => a.publishedAt)
      .sort((a, b) => (a.publishedAt!.getTime() - b.publishedAt!.getTime()));
    const firstNeg = sortedByTime[0]?.publishedAt ?? null;
    const lastNeg = sortedByTime[sortedByTime.length - 1]?.publishedAt ?? null;
    const durationDays =
      firstNeg && lastNeg
        ? Math.max(1, Math.round((lastNeg.getTime() - firstNeg.getTime()) / 86400000) + 1)
        : 0;

    // Velocity multiplier (crisis window velocity vs 30d baseline)
    const crisisDayCount = crisisStart && crisisEnd
      ? Math.max(1, Math.round((new Date(crisisEnd + "T23:59:59Z").getTime() - new Date(crisisStart + "T00:00:00Z").getTime()) / 86400000) + 1)
      : 1;
    const crisisVelocity = mentionPeak / crisisDayCount; // peak mentions/day averaged over crisis window
    const baselineWindow = 30 - crisisDayCount;
    const crisisWindowNegCount = trend
      .filter((d) => d.date >= (crisisStart ?? "") && d.date <= (crisisEnd ?? ""))
      .reduce((s, d) => s + d.negativeCount, 0);
    const baselineNegativeOutsideWindow = negativeArticles.length - crisisWindowNegCount;
    const baselineVelocity = baselineWindow > 0 ? baselineNegativeOutsideWindow / baselineWindow : 0;
    const velocityMultiplier =
      baselineVelocity > 0
        ? Math.round((crisisVelocity / baselineVelocity) * 10) / 10
        : crisisVelocity > 0 ? 1 : 0;

    // ─── Timeline (first signal → escalation → peak → resolution) ──
    const timeline: PostCrisisTimelineEvent[] = [];

    if (sortedByTime.length > 0) {
      // 1. Premier signal
      const first = sortedByTime[0];
      timeline.push({
        date: first.publishedAt!.toLocaleString("fr-FR", {
          day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
        }),
        timestamp: first.publishedAt!.getTime(),
        event: first.title?.slice(0, 90) || `Premier signal négatif — ${first.source}`,
        severity: severityForScore(first.sentimentScore),
      });

      // 2. Escalade — the most-negative mid-timeline article
      if (sortedByTime.length > 2) {
        const escalation = [...sortedByTime]
          .slice(1, -1)
          .sort((a, b) => (a.sentimentScore ?? 0) - (b.sentimentScore ?? 0))[0];
        if (escalation) {
          timeline.push({
            date: escalation.publishedAt!.toLocaleString("fr-FR", {
              day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
            }),
            timestamp: escalation.publishedAt!.getTime(),
            event: escalation.title?.slice(0, 90) || `Escalade — ${escalation.source}`,
            severity: severityForScore(escalation.sentimentScore),
          });
        }
      }

      // 3. Pic de mentions — surface the most-negative article on the
      // peak day if available; otherwise a synthetic "pic" event.
      if (peakEntry.date) {
        const peakDate = new Date(peakEntry.date + "T00:00:00Z");
        const dayAfter = new Date(peakDate.getTime() + 86400000);
        const peakArticle = [...sortedByTime]
          .reverse()
          .find((a) => a.publishedAt! >= peakDate && a.publishedAt! < dayAfter);
        if (peakArticle) {
          timeline.push({
            date: peakArticle.publishedAt!.toLocaleString("fr-FR", {
              day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
            }),
            timestamp: peakArticle.publishedAt!.getTime(),
            event: `Pic de mentions (${mentionPeak} ce jour) — ${peakArticle.title?.slice(0, 70) ?? peakArticle.source}`,
            severity: severityForScore(peakArticle.sentimentScore),
          });
        } else {
          timeline.push({
            date: new Date(peakEntry.date + "T12:00:00Z").toLocaleString("fr-FR", {
              day: "2-digit", month: "short",
            }),
            timestamp: peakDate.getTime(),
            event: `Pic de mentions — ${mentionPeak} articles négatifs ce jour`,
            severity: mentionPeak >= 10 ? "critical" : mentionPeak >= 5 ? "high" : "medium",
          });
        }
      }

      // 4. État actuel / résolution — most recent article
      const current = sortedByTime[sortedByTime.length - 1];
      timeline.push({
        date: current.publishedAt!.toLocaleString("fr-FR", {
          day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
        }),
        timestamp: current.publishedAt!.getTime(),
        event: current.title?.slice(0, 90) || `Dernier signal — ${current.source}`,
        severity: severityForScore(current.sentimentScore),
      });
    }

    // Inject risk assessments as timeline events (high/critical ones)
    for (const r of riskAssessments.slice(0, 2)) {
      const ts = r.createdAt ?? new Date();
      timeline.push({
        date: ts.toLocaleString("fr-FR", {
          day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
        }),
        timestamp: ts.getTime(),
        event: `Évaluation de risque — ${r.category} (${r.riskLevel}, score ${Math.round(r.riskScore)})`,
        severity: r.riskLevel === "critical" ? "critical" : "high",
      });
    }

    // Inject flagged WhatsApp as an escalation signal
    if (whatsappFlagged.length > 0) {
      const latestWa = whatsappFlagged[0];
      timeline.push({
        date: latestWa.receivedAt.toLocaleString("fr-FR", {
          day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
        }),
        timestamp: latestWa.receivedAt.getTime(),
        event: `Bad buzz WhatsApp — ${latestWa.fromName ?? "expéditeur inconnu"} (${whatsappFlagged.length} message(s) signalé(s))`,
        severity: latestWa.crisisScore >= 70 ? "critical" : latestWa.crisisScore >= 40 ? "high" : "medium",
      });
    }

    timeline.sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));

    // Cap timeline to 8 events
    const cappedTimeline = timeline.slice(0, 8);

    // ─── Impact object ───────────────────────────────────────────
    const impact: PostCrisisImpact = {
      sentimentDrop: Math.round(sentimentDrop * 1000) / 1000,
      baselineSentiment: baselineAvg,
      crisisSentiment: crisisAvg,
      mentionPeak,
      mentionPeakDate: peakEntry.date,
      reachAffected,
      uniqueSources,
      durationDays,
      totalNegative30d: negativeArticles.length,
      totalArticles30d: allArticles30d.length,
      velocityMultiplier,
    };

    // ─── Lessons learned (rule-based) ────────────────────────────
    const lessons = buildLessons({
      crisisDetected,
      durationDays,
      mentionPeak,
      sentimentDrop,
      uniqueSources,
      whatsappFlaggedCount: whatsappFlagged.length,
      riskAssessmentsCount: riskAssessments.length,
      velocityMultiplier,
      negativeShare: allArticles30d.length > 0 ? negativeArticles.length / allArticles30d.length : 0,
    });

    // ─── Prevention plan (rule-based, with deadlines) ────────────
    const preventionPlan = buildPreventionPlan({
      crisisDetected,
      durationDays,
      mentionPeak,
      uniqueSources,
      whatsappFlaggedCount: whatsappFlagged.length,
      riskAssessmentsCount: riskAssessments.length,
      velocityMultiplier,
      topSourceName: topSources[0]?.source ?? null,
    });

    // ─── Recommendation string ──────────────────────────────────
    const recommendation = buildRecommendation({
      crisisDetected,
      durationDays,
      mentionPeak,
      sentimentDrop,
      uniqueSources,
      velocityMultiplier,
      whatsappFlaggedCount: whatsappFlagged.length,
    });

    // ─── Crisis window display labels (fr-FR) ───────────────────
    const crisisStartLabel = crisisStart
      ? new Date(crisisStart + "T00:00:00Z").toLocaleDateString("fr-FR", {
          day: "2-digit", month: "short", year: "numeric",
        })
      : null;
    const crisisEndLabel = crisisEnd
      ? new Date(crisisEnd + "T00:00:00Z").toLocaleDateString("fr-FR", {
          day: "2-digit", month: "short", year: "numeric",
        })
      : null;

    // ─── Assemble response ──────────────────────────────────────
    const response: PostCrisisResponse = {
      meta: {
        companyName: companyRow?.name ?? company.name,
        sector: companyRow?.sector ?? company.sector,
        ticker: companyRow?.ticker ?? company.ticker,
        generatedAt: now.toISOString(),
        date: now.toLocaleDateString("fr-FR", {
          weekday: "long", day: "numeric", month: "long", year: "numeric",
        }),
        window: "30 jours",
        crisisDetected,
        crisisStart: crisisStartLabel,
        crisisEnd: crisisEndLabel,
      },
      timeline: cappedTimeline,
      impact,
      lessons,
      preventionPlan,
      recommendation,
      sentimentTrend: trend,
    };

    logInfo(
      "post-crisis",
      `Post-crisis review generated for ${company.name}: crisisDetected=${crisisDetected}, start=${crisisStartLabel ?? "—"}, end=${crisisEndLabel ?? "—"}, neg=${negativeArticles.length}, durationDays=${durationDays}, peak=${mentionPeak}, drop=${sentimentDrop}, lessons=${lessons.length}, prevention=${preventionPlan.length}`,
    );

    return NextResponse.json(response);
  } catch (err) {
    logError("post-crisis", `Generate failed: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}

// ─── Helpers ────────────────────────────────────────────────────

function severityForScore(score: number | null): TimelineSeverity {
  if (score === null) return "info";
  if (score < -0.6) return "critical";
  if (score < -0.3) return "high";
  if (score < -0.1) return "medium";
  return "low";
}

interface LessonInput {
  crisisDetected: boolean;
  durationDays: number;
  mentionPeak: number;
  sentimentDrop: number;
  uniqueSources: number;
  whatsappFlaggedCount: number;
  riskAssessmentsCount: number;
  velocityMultiplier: number;
  negativeShare: number;
}

function buildLessons(input: LessonInput): PostCrisisLesson[] {
  const lessons: PostCrisisLesson[] = [];

  if (!input.crisisDetected) {
    lessons.push({
      id: "lesson-1",
      text: "Aucune crise détectée sur la fenêtre de 30 jours. La veille quotidienne a permis de maintenir le sentiment nominal. Maintenir le rythme de surveillance et documenter ce poste-morten comme preuve de diligence réputationnelle.",
      category: "veille",
    });
    return lessons;
  }

  // Lesson 1 — Détection précoce
  if (input.durationDays > 3) {
    lessons.push({
      id: "lesson-1",
      text: `La crise a duré ${input.durationDays} jours. Le premier signal détectable a précédé le pic de mentions — un seuil d'alerte plus sensible (vélocité > 2× baseline) aurait permis d'anticiper l'escalade de 24 à 48h.`,
      category: "detection",
    });
  } else {
    lessons.push({
      id: "lesson-1",
      text: "La crise a été brève mais intense. Le délai entre premier signal et pic était court — la cellule de crise doit pouvoir être convoquée sous 2h pour rester synchronisée avec la vélocité médiatique.",
      category: "detection",
    });
  }

  // Lesson 2 — Communication
  if (input.negativeShare > 0.4) {
    lessons.push({
      id: "lesson-2",
      text: `${Math.round(input.negativeShare * 100)}% des mentions étaient négatives sur la fenêtre. Le narratif de contre-communication n'a pas été suffisamment relayé — préparer à l'avance un kit de communication de crise (communiqué, FAQ, témoignages) réduit le temps de réponse public de plusieurs heures.`,
      category: "communication",
    });
  } else {
    lessons.push({
      id: "lesson-2",
      text: "La part négative est restée maîtrisée mais la vélocité a été élevée. La communication officielle doit être publiée dans les 4h suivant le premier signal pour éviter que le narratif ne se fixe sans l'entreprise.",
      category: "communication",
    });
  }

  // Lesson 3 — Veille / canaux
  if (input.whatsappFlaggedCount > 0) {
    lessons.push({
      id: "lesson-3",
      text: `${input.whatsappFlaggedCount} message(s) WhatsApp signalé(s) pendant la crise — le bad buzz a franchi la membrane privée. La veille doit couvrir les canaux privés (WhatsApp Business, groupes fermés) en plus des médias ouverts, avec un circuit d'escalade dédié.`,
      category: "veille",
    });
  } else if (input.uniqueSources > 0) {
    lessons.push({
      id: "lesson-3",
      text: `${input.uniqueSources} source(s) unique(s) ont relayé le narratif négatif. La cartographie des relais (média + social + privé) doit être établie en continu, pas seulement pendant la crise, pour identifier rapidement les amplificateurs.`,
      category: "veille",
    });
  }

  // Lesson 4 — Process / vélocité
  if (input.velocityMultiplier >= 2) {
    lessons.push({
      id: "lesson-4",
      text: `Vélocité ${input.velocityMultiplier}× supérieure à la baseline 30j. Le processus de validation interne (juridique + Dircom) est trop long pour absorber ce rythme — mettre en place une procédure accélérée de validation des communiqués pendant la cellule de crise.`,
      category: "process",
    });
  } else {
    lessons.push({
      id: "lesson-4",
      text: "La vélocité est restée proche de la baseline. Le processus de réponse standard a fonctionné — mais la documentation horodatée des décisions reste indispensable pour l'audit post-mortem et la conformité.",
      category: "process",
    });
  }

  // Lesson 5 — Gouvernance
  if (input.riskAssessmentsCount > 0) {
    lessons.push({
      id: "lesson-5",
      text: `${input.riskAssessmentsCount} évaluation(s) de risque high/critical ont été émises par le moteur. Le comité de risque doit revoir ces signaux mensuellement et les intégrer au tableau de bord Dircom — un risque identifié en amont réduit la probabilité d'escalade publique.`,
      category: "gouvernance",
    });
  } else {
    lessons.push({
      id: "lesson-5",
      text: "Aucune évaluation de risque élevé émise pendant la fenêtre. La gouvernance doit intégrer un point de revue réputationnelle hebdomadaire au comité de direction, distinct de la revue opérationnelle.",
      category: "gouvernance",
    });
  }

  return lessons;
}

interface PreventionInput {
  crisisDetected: boolean;
  durationDays: number;
  mentionPeak: number;
  uniqueSources: number;
  whatsappFlaggedCount: number;
  riskAssessmentsCount: number;
  velocityMultiplier: number;
  topSourceName: string | null;
}

function buildPreventionPlan(input: PreventionInput): PostCrisisPreventionItem[] {
  const plan: PostCrisisPreventionItem[] = [];
  const today = new Date();

  // Action 1 — Seuils d'alerte (toujours présent)
  plan.push({
    action: input.crisisDetected
      ? "Resserrer les seuils d'alerte de vélocité (passer de 3× à 2× baseline) et activer la notification WhatsApp Business pour tout franchissement."
      : "Définir et documenter les seuils d'alerte formels (vélocité, part négative, sources uniques) et les relier à des niveaux d'activation de la cellule de crise.",
    priority: "high",
    owner: "Direction de la Communication",
    deadline: deadlineISO(today, 14),
    deadlineLabel: "Sous 14 jours",
  });

  // Action 2 — Kit de communication de crise
  plan.push({
    action: "Préparer un kit de communication de crise pré-validé (communiqué-type, FAQ, témoignages clients, données factuelles, contacts presse) stocké dans un coffre-fort accessible à la cellule de crise.",
    priority: "critical",
    owner: "Direction de la Communication",
    deadline: deadlineISO(today, 30),
    deadlineLabel: "Sous 30 jours",
  });

  // Action 3 — Cartographie des relais
  if (input.topSourceName) {
    plan.push({
      action: `Établir une cartographie des relais médiatiques et sociaux, avec priorisation sur la source la plus active (${input.topSourceName}). Mettre en place un dialogue préventif avec les journalistes et influenceurs clés.`,
      priority: "medium",
      owner: "Relations Presse",
      deadline: deadlineISO(today, 45),
      deadlineLabel: "Sous 45 jours",
    });
  } else {
    plan.push({
      action: "Établir une cartographie des relais médiatiques et sociaux (top 20 sources par audience + influenceurs sectoriels). Mettre à jour trimestriellement.",
      priority: "medium",
      owner: "Relations Presse",
      deadline: deadlineISO(today, 45),
      deadlineLabel: "Sous 45 jours",
    });
  }

  // Action 4 — WhatsApp Business / canaux privés
  if (input.whatsappFlaggedCount > 0) {
    plan.push({
      action: `Étendre la veille aux canaux privés (WhatsApp Business, Telegram, groupes fermés). ${input.whatsappFlaggedCount} message(s) signalé(s) pendant la crise — mettre en place un circuit d'escalade dédié avec réponse sous 4h.`,
      priority: "high",
      owner: "Direction Customer Care",
      deadline: deadlineISO(today, 21),
      deadlineLabel: "Sous 21 jours",
    });
  } else {
    plan.push({
      action: "Mettre en place une surveillance des canaux privés (WhatsApp Business, Telegram) avec un circuit d'escalade vers la Dircom en cas de bad buzz détecté.",
      priority: "medium",
      owner: "Direction Customer Care",
      deadline: deadlineISO(today, 60),
      deadlineLabel: "Sous 60 jours",
    });
  }

  // Action 5 — Post-mortem et formation
  plan.push({
    action: "Organiser une session post-mortem avec l'équipe de crise (Dircom, DG, Juridique, Customer Care). Documenter les décisions horodatées, identifier les goulots d'étranglement et planifier un exercice de simulation de crise trimestriel.",
    priority: "medium",
    owner: "Direction Générale",
    deadline: deadlineISO(today, 30),
    deadlineLabel: "Sous 30 jours",
  });

  // Action 6 — Gouvernance risque
  if (input.riskAssessmentsCount > 0) {
    plan.push({
      action: `Intégrer les ${input.riskAssessmentsCount} évaluation(s) de risque high/critical au tableau de bord Dircom. Revoir mensuellement les risques émergents avec le comité de risque et tracer un plan de mitigation par risque.`,
      priority: "high",
      owner: "Direction des Risques",
      deadline: deadlineISO(today, 60),
      deadlineLabel: "Sous 60 jours",
    });
  }

  return plan;
}

function deadlineISO(today: Date, daysAhead: number): string {
  const d = new Date(today.getTime() + daysAhead * 86400000);
  return d.toISOString().slice(0, 10);
}

interface RecommendationInput {
  crisisDetected: boolean;
  durationDays: number;
  mentionPeak: number;
  sentimentDrop: number;
  uniqueSources: number;
  velocityMultiplier: number;
  whatsappFlaggedCount: number;
}

function buildRecommendation(input: RecommendationInput): string {
  if (!input.crisisDetected) {
    return "Aucune crise détectée sur les 30 derniers jours. La fenêtre observée est restée nominale. Ce document constitue votre preuve de diligence réputationnelle — conserver le poste-morten et planifier un exercice de simulation de crise trimestriel.";
  }
  const parts: string[] = [];
  parts.push(
    `Crise identifiée sur ${input.durationDays} jour(s), avec un pic de ${input.mentionPeak} mention(s) négative(s) en un seul jour sur ${input.uniqueSources} source(s) unique(s).`,
  );
  if (input.sentimentDrop > 0.1) {
    parts.push(`Chute de sentiment de ${Math.round(input.sentimentDrop * 100)} points entre la baseline et la fenêtre de crise.`);
  }
  if (input.velocityMultiplier >= 2) {
    parts.push(`Vélocité ${input.velocityMultiplier}× supérieure à la baseline — le processus de réponse doit être accéléré.`);
  }
  if (input.whatsappFlaggedCount > 0) {
    parts.push(`${input.whatsappFlaggedCount} message(s) WhatsApp signalé(s) — le bad buzz a franchi les canaux privés.`);
  }
  parts.push("Le plan de prévention ci-dessous doit être mis en œuvre sous 30 jours pour réduire la probabilité et l'impact d'une prochaine crise.");
  return parts.join(" ");
}
