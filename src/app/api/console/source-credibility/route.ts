// ═══════════════════════════════════════════════════════════════
//  POST /api/console/source-credibility
//
//  Evaluates each news source's credibility (0-100) with a 4-factor
//  breakdown, derived from REAL Article data only — no static allow
//  list drives the score. The four factors are:
//
//    1. authority      — volume of coverage + institutional type
//                        + recognized-outlet boost.
//    2. editorial      — sentiment balance. A source that is purely
//                        one-sided (100% neg or 100% pos) is less
//                        editorially restrained than one with a
//                        healthy neutral share.
//    3. factCheck      — substantive coverage (avg relevanceScore)
//                        + pipeline completeness (language labelled).
//    4. transparency   — publication recency + language coverage
//                        + institutional sourceType weight.
//
//  Each row carries:
//    { name, type, credibility (0-100), tier, factors, articleCount,
//      lastArticleDate }
//
//  Tier bands:
//    >= 80  Vérifié
//    >= 65  Fiable
//    >= 45  À vérifier
//    <  45  Non fiable
//
//  Body (all optional):
//    { source?: string,   // evaluate a specific named source only
//      range?:  "30d" | "90d" | "365d" }   // default 90d
//
//  When `source` is provided, the response contains ONLY that row
//  (created with empty-data defaults if no articles exist for it),
//  so the client can merge a single evaluation into its local list
//  without re-fetching the whole corpus.
//
//  Auth: requires session + company (requireUserCompany). Demo
//  sessions flow through the same path — demoFilter is spread into
//  the Article query so demo data is isolated.
//
//  Skill ID: SKILL-14-SOURCE-CRED
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { requireUserCompany } from "@/lib/harchiq/company-session";
import { prisma } from "@/lib/db";
import { logInfo, logError } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// ─── Types (returned to the client) ─────────────────────────────

export type CredibilityTier =
  | "Vérifié"
  | "Fiable"
  | "À vérifier"
  | "Non fiable";

export interface SourceCredibilityFactor {
  authority: number;     // 0-100
  editorial: number;     // 0-100
  factCheck: number;     // 0-100
  transparency: number;  // 0-100
}

export interface SourceCredibilityRow {
  name: string;
  type: string;          // media | regulatory | market | financial
  credibility: number;   // 0-100
  tier: CredibilityTier;
  factors: SourceCredibilityFactor;
  articleCount: number;
  lastArticleDate: string | null;  // ISO date or null
}

export interface SourceCredibilityResponse {
  sources: SourceCredibilityRow[];
  meta: {
    companyName: string;
    sector: string | null;
    generatedAt: string;
    windowDays: number;
    totalSources: number;
    avgCredibility: number;
    tierCounts: Record<CredibilityTier, number>;
  };
}

// ─── Constants ─────────────────────────────────────────────────

const DEFAULT_WINDOW_DAYS = 90;

const RANGE_DAYS: Record<string, number> = {
  "30d": 30,
  "90d": 90,
  "365d": 365,
};

// Recognized Moroccan + international outlets. A small authority
// boost (capped) is applied to these — they have a track record that
// a brand-new domain cannot match. The list is intentionally short
// and conservative; an unknown local blog still gets scored purely
// on its Article footprint.
const RECOGNIZED_OUTLETS = [
  "hespress", "lematin", "le matin", "leconomiste", "l'economiste",
  "l économiste", "economiste", "leseco", "les eco", "medi1", "medi 1",
  "moroccoworldnews", "mwn", "yabiladi", "telquel", "lakome",
  "alyaoum24", "aujourdhui", "aujourd'hui le maroc", "assabah",
  "almassae", "al massae", "attajdid", "barlamane", "financialafrik",
  "bloomberg", "reuters", "afp", "associated press", "le monde",
  "liberation", "financial times", " ft ", "wall street journal",
  "wsj", "the economist", "economist",
];

function isRecognizedOutlet(source: string): boolean {
  const lower = ` ${source.toLowerCase()} `;
  return RECOGNIZED_OUTLETS.some((o) => lower.includes(o));
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

function tierFor(score: number): CredibilityTier {
  if (score >= 80) return "Vérifié";
  if (score >= 65) return "Fiable";
  if (score >= 45) return "À vérifier";
  return "Non fiable";
}

// ─── POST handler ──────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const result = await requireUserCompany();
  if (!result.ok) return result.response;
  const { company, demoFilter } = result.data;

  // ─── Parse optional body ─────────────────────────────────────
  let requestedSource: string | null = null;
  let rangeParam = "90d";
  try {
    const body = await req.json();
    if (typeof body?.source === "string" && body.source.trim()) {
      requestedSource = body.source.trim().slice(0, 200);
    }
    if (typeof body?.range === "string" && RANGE_DAYS[body.range]) {
      rangeParam = body.range;
    }
  } catch {
    // Body may be empty or non-JSON — that's fine, treat as default.
  }

  const days = RANGE_DAYS[rangeParam] ?? DEFAULT_WINDOW_DAYS;

  try {
    const now = new Date();
    const since = new Date(now.getTime() - days * 86400000);

    const [companyRow, articles] = await Promise.all([
      prisma.company.findUnique({
        where: { id: company.id },
        select: { name: true, sector: true },
      }),
      prisma.article.findMany({
        where: {
          companyId: company.id,
          publishedAt: { gte: since },
          ...demoFilter,
        },
        select: {
          source: true,
          sourceType: true,
          sentimentLabel: true,
          relevanceScore: true,
          language: true,
          publishedAt: true,
        },
      }),
    ]);

    // ─── Aggregate per-source stats ────────────────────────────
    interface SourceStats {
      name: string;
      articleCount: number;
      positive: number;
      neutral: number;
      negative: number;
      relevanceSum: number;
      relevanceCount: number;
      languageNotNull: number;
      lastPublishedAt: Date | null;
      sourceTypeCounts: Record<string, number>;
    }

    const statsMap = new Map<string, SourceStats>();

    const ensureStats = (name: string): SourceStats => {
      let s = statsMap.get(name);
      if (!s) {
        s = {
          name,
          articleCount: 0,
          positive: 0,
          neutral: 0,
          negative: 0,
          relevanceSum: 0,
          relevanceCount: 0,
          languageNotNull: 0,
          lastPublishedAt: null,
          sourceTypeCounts: {},
        };
        statsMap.set(name, s);
      }
      return s;
    };

    for (const a of articles) {
      const name = (a.source ?? "").trim() || "Source inconnue";
      const s = ensureStats(name);
      s.articleCount += 1;
      if (a.sentimentLabel === "positive") s.positive += 1;
      else if (a.sentimentLabel === "negative") s.negative += 1;
      else s.neutral += 1;
      if (
        typeof a.relevanceScore === "number" &&
        !Number.isNaN(a.relevanceScore)
      ) {
        s.relevanceSum += a.relevanceScore;
        s.relevanceCount += 1;
      }
      if (a.language && a.language.trim()) s.languageNotNull += 1;
      if (a.publishedAt) {
        if (!s.lastPublishedAt || a.publishedAt > s.lastPublishedAt) {
          s.lastPublishedAt = a.publishedAt;
        }
      }
      const st = a.sourceType || "media";
      s.sourceTypeCounts[st] = (s.sourceTypeCounts[st] || 0) + 1;
    }

    // ─── If a specific source was requested but isn't in the map,
    //     seed an empty entry so it gets evaluated with defaults. ──
    if (requestedSource) {
      const existingKey = Array.from(statsMap.keys()).find(
        (k) => k.toLowerCase() === requestedSource!.toLowerCase(),
      );
      if (!existingKey) {
        ensureStats(requestedSource);
      } else {
        // Normalise the requested name to the existing casing so the
        // filter below matches exactly one row.
        requestedSource = existingKey;
      }
    }

    // ─── Compute factors per source ────────────────────────────
    const allRows: SourceCredibilityRow[] = [];

    for (const s of statsMap.values()) {
      const recognized = isRecognizedOutlet(s.name);

      // Dominant sourceType (most frequent across the source's articles).
      const dominantType =
        Object.entries(s.sourceTypeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
        "media";

      // sourceType authority bonus — institutional sources (regulatory,
      // financial, market) carry inherent editorial weight.
      const sourceTypeBoost =
        dominantType === "regulatory" ? 8 :
        dominantType === "financial" ? 6 :
        dominantType === "market" ? 4 : 0;

      // ── authority (0-100) ────────────────────────────────────
      // Volume score: asymptotic curve, ~63 at 25 articles, ~95 at 75.
      const volumeScore = 1 + 89 * (1 - Math.exp(-s.articleCount / 25));
      const recognizedBoost = recognized ? 10 : 0;
      const authority = clamp(
        Math.round(volumeScore + recognizedBoost + sourceTypeBoost),
      );

      // ── editorial (0-100) ────────────────────────────────────
      // Balance between positive and negative sentiment + neutral bonus.
      // No data → mid-score (50) since we can't judge the editorial line.
      const total = s.articleCount || 1;
      const posRatio = s.positive / total;
      const negRatio = s.negative / total;
      const neuRatio = s.neutral / total;
      const balance = 1 - Math.abs(negRatio - posRatio); // 1 balanced, 0 one-sided
      const neutralBonus = Math.min(0.25, neuRatio);     // cap at +0.25
      const editorial =
        s.articleCount === 0
          ? 50
          : clamp(Math.round(balance * 75 + neutralBonus * 100));

      // ── factCheck (0-100) ────────────────────────────────────
      // Substantive coverage (avg relevanceScore, 0-1) + pipeline
      // completeness (ratio of articles with a detected language).
      const avgRelevance =
        s.relevanceCount > 0 ? s.relevanceSum / s.relevanceCount : 0;
      const languageCoverage =
        s.articleCount > 0 ? s.languageNotNull / s.articleCount : 0;
      const factCheck = clamp(
        Math.round(avgRelevance * 60 + languageCoverage * 40),
      );

      // ── transparency (0-100) ─────────────────────────────────
      // Recency of last publication + language coverage + institutional
      // sourceType weight. No data → small baseline if recognized.
      let recencyScore = 0;
      if (s.lastPublishedAt) {
        const ageDays =
          (now.getTime() - s.lastPublishedAt.getTime()) / 86400000;
        if (ageDays <= 7) recencyScore = 35;
        else if (ageDays <= 30) recencyScore = 25;
        else if (ageDays <= 90) recencyScore = 15;
        else if (ageDays <= 365) recencyScore = 8;
      }
      const transparency =
        s.articleCount === 0
          ? clamp(recencyScore + (recognized ? 15 : 0))
          : clamp(
              Math.round(
                recencyScore + languageCoverage * 35 + sourceTypeBoost,
              ),
            );

      // ── credibility (0-100): weighted blend ─────────────────
      const credibility = clamp(
        Math.round(
          authority * 0.30 +
          editorial * 0.30 +
          factCheck * 0.25 +
          transparency * 0.15,
        ),
      );

      allRows.push({
        name: s.name,
        type: dominantType,
        credibility,
        tier: tierFor(credibility),
        factors: { authority, editorial, factCheck, transparency },
        articleCount: s.articleCount,
        lastArticleDate: s.lastPublishedAt
          ? s.lastPublishedAt.toISOString()
          : null,
      });
    }

    // ─── Sort by credibility desc ──────────────────────────────
    allRows.sort((a, b) => b.credibility - a.credibility);

    // ─── If a specific source was requested, narrow to it ─────
    const finalRows = requestedSource
      ? allRows.filter(
          (r) => r.name.toLowerCase() === requestedSource!.toLowerCase(),
        )
      : allRows;

    // ─── Tier counts (over the returned set) ──────────────────
    const tierCounts: Record<CredibilityTier, number> = {
      "Vérifié": 0,
      "Fiable": 0,
      "À vérifier": 0,
      "Non fiable": 0,
    };
    for (const r of finalRows) tierCounts[r.tier] += 1;

    const avgCredibility =
      finalRows.length === 0
        ? 0
        : Math.round(
            finalRows.reduce((sum, r) => sum + r.credibility, 0) /
              finalRows.length,
          );

    const response: SourceCredibilityResponse = {
      sources: finalRows,
      meta: {
        companyName: companyRow?.name ?? company.name,
        sector: companyRow?.sector ?? company.sector,
        generatedAt: now.toISOString(),
        windowDays: days,
        totalSources: finalRows.length,
        avgCredibility,
        tierCounts,
      },
    };

    logInfo(
      "source-credibility",
      `Source credibility generated for ${company.name}: ${finalRows.length} source(s), avg=${avgCredibility}`,
      { range: rangeParam, requestedSource },
    );

    return NextResponse.json(response);
  } catch (err) {
    logError("source-credibility", `Generate failed: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}
