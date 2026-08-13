// ═══════════════════════════════════════════════════════════════
//  POST /api/console/media-reach
//
//  Skill 16 — Media Reach Calculator.
//
//  A standalone strategic calculator that turns an article count
//  plus a 4-way source mix (national / regional / spécialisé /
//  blog) into four media-planning KPIs:
//
//    - totalReach        Net audience reached (de-duplicated)
//    - aveMAD            Advertising Value Equivalent, in MAD
//    - engagementEst     Estimated engaged readers (shares, comments,
//                        click-throughs, saves)
//    - paidEquivalent    What the same reach would cost as paid ads
//                        (AVE without the PR multiplier)
//
//  Plus a per-tier breakdown row so the UI can render a table:
//    { tier, articles, audience, reach, ave }
//
//  Model
//  -----
//  Each tier carries a per-article audience, a CPM (cost-per-mille
//  in MAD), an engagement rate, and a duplication slope. The
//  duplication factor grows with article volume within a tier
//  (more articles in the same tier → more audience overlap), capped
//  at 60%. AVE = reach/1000 × CPM × PR_MULTIPLIER (industry-standard
//  2.5× editorial credibility premium over paid placement).
//
//  Auth: requires session + company (requireUserCompany). The
//  calculator itself is pure math — no DB reads needed. The
//  company name/sector are echoed in `meta` so the saved-scenario
//  payload on the client is self-contained.
//
//  Skill ID: SKILL-16-MEDIA-REACH
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { logInfo, logError } from "@/lib/logger";
import { requireUserCompany } from "@/lib/harchiq/company-session";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// ─── Types (returned to the client) ─────────────────────────────

export type SourceTierKey =
  | "national"
  | "regional"
  | "specialise"
  | "blog";

export interface SourceMix {
  national: number;
  regional: number;
  specialise: number;
  blog: number;
}

export interface MediaReachBreakdownRow {
  tier: string;            // human label, French
  articles: number;        // articles in this tier (rounded)
  audience: number;        // gross audience (articles × audience-per-article)
  reach: number;           // net reach (after de-duplication)
  ave: number;             // AVE in MAD for this tier
}

export interface MediaReachResponse {
  meta: {
    companyName: string;
    sector: string;
    generatedAt: string;
    articles: number;
    sourceMix: SourceMix;
    prMultiplier: number;
  };
  totalReach: number;
  aveMAD: number;
  engagementEst: number;
  paidEquivalent: number;
  breakdown: MediaReachBreakdownRow[];
}

interface MediaReachBody {
  articles?: unknown;
  sourceMix?: Partial<SourceMix> | null;
}

// ─── Tier configuration ────────────────────────────────────────
//
// Per-article figures are calibrated for a Moroccan / Maghreb PR
// context (Hespress-scale national reach, regional press like
// L'Opinion, trade titles like L'Économiste, plus a long tail of
// blogs and influencer posts). CPM values are in MAD.

interface TierConfig {
  key: SourceTierKey;
  label: string;
  audiencePerArticle: number;  // gross readers per article
  cpmMAD: number;              // cost per mille (MAD)
  engagementRate: number;      // 0..1 of reach that engages
  dupSlope: number;            // duplication growth per extra article
}

const TIERS: TierConfig[] = [
  {
    key: "national",
    label: "Presse nationale",
    audiencePerArticle: 500_000,
    cpmMAD: 80,
    engagementRate: 0.005,   // 0.5% — broad reach, low per-reader engagement
    dupSlope: 0.04,
  },
  {
    key: "regional",
    label: "Presse régionale",
    audiencePerArticle: 80_000,
    cpmMAD: 40,
    engagementRate: 0.010,   // 1.0%
    dupSlope: 0.04,
  },
  {
    key: "specialise",
    label: "Presse spécialisée",
    audiencePerArticle: 25_000,
    cpmMAD: 60,
    engagementRate: 0.015,   // 1.5% — niche audience, higher intent
    dupSlope: 0.05,
  },
  {
    key: "blog",
    label: "Blogs & influence",
    audiencePerArticle: 8_000,
    cpmMAD: 30,
    engagementRate: 0.030,   // 3.0% — small audience, very high interaction
    dupSlope: 0.06,
  },
];

const PR_MULTIPLIER = 2.5;
const MAX_ARTICLES = 1000;

// ─── POST handler ──────────────────────────────────────────────

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await requireUserCompany();
  if (!result.ok) return result.response;

  const { company } = result.data;

  // ─── Parse + validate body ───────────────────────────────────
  let body: MediaReachBody = {};
  try {
    body = (await req.json()) as MediaReachBody;
  } catch {
    // Empty / malformed body — fall through to defaults below.
  }

  const articlesRaw = typeof body.articles === "number" ? body.articles : 50;
  const articles = clampInt(articlesRaw, 1, MAX_ARTICLES);

  const incomingMix: SourceMix = {
    national: numOr(body.sourceMix?.national, 0),
    regional: numOr(body.sourceMix?.regional, 0),
    specialise: numOr(body.sourceMix?.specialise, 0),
    blog: numOr(body.sourceMix?.blog, 0),
  };
  // Clamp each to 0..100 then normalise so the four values sum to
  // 100. Normalisation is proportional — preserves the user's
  // intent even if slider rounding leaves the total at 99 or 101.
  const sourceMix = normaliseMix(incomingMix);

  try {
    // ─── Per-tier computation ────────────────────────────────
    const breakdown: MediaReachBreakdownRow[] = TIERS.map((tier) => {
      const pct = sourceMix[tier.key];
      const artCount = Math.round((pct / 100) * articles);

      const audience = tier.audiencePerArticle * artCount;
      // Duplication grows with article volume in the tier, capped
      // at 60%. 1 article → 0% overlap, more articles → more
      // audience reuse within the same outlet ecosystem.
      const duplication = artCount <= 0
        ? 0
        : Math.min(0.6, (artCount - 1) * tier.dupSlope);
      const reach = Math.round(audience * (1 - duplication));

      // AVE = (reach / 1000) × CPM × PR multiplier.
      const ave = Math.round((reach / 1000) * tier.cpmMAD * PR_MULTIPLIER);

      return {
        tier: tier.label,
        articles: artCount,
        audience,
        reach,
        ave,
      };
    });

    // ─── Aggregates ──────────────────────────────────────────
    const totalReach = breakdown.reduce((s, r) => s + r.reach, 0);
    const aveMAD = breakdown.reduce((s, r) => s + r.ave, 0);

    // Engagement is derived per-tier from reach × engagementRate,
    // then summed. Kept out of the breakdown row (spec asks for 5
    // fields only) — surfaced as the global engagementEst.
    const engagementEst = TIERS.reduce((s, tier) => {
      const row = breakdown.find((r) => r.tier === tier.label);
      if (!row) return s;
      return s + Math.round(row.reach * tier.engagementRate);
    }, 0);

    // Paid equivalent: AVE without the PR multiplier — i.e. what
    // buying the same reach at CPM rates would cost.
    const paidEquivalent = Math.round(aveMAD / PR_MULTIPLIER);

    const response: MediaReachResponse = {
      meta: {
        companyName: company.name,
        sector: company.sector,
        generatedAt: new Date().toISOString(),
        articles,
        sourceMix,
        prMultiplier: PR_MULTIPLIER,
      },
      totalReach,
      aveMAD,
      engagementEst,
      paidEquivalent,
      breakdown,
    };

    logInfo(
      "media-reach",
      `Media reach calculated for ${company.name}: articles=${articles}, ` +
        `reach=${totalReach}, ave=${aveMAD} MAD, engagement=${engagementEst}`,
      { sourceMix },
    );

    return NextResponse.json(response);
  } catch (err) {
    logError("media-reach", `Calculate failed: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}

// ─── Helpers ───────────────────────────────────────────────────

function clampInt(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  const i = Math.round(n);
  return Math.max(min, Math.min(max, i));
}

function numOr(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v)
    ? Math.max(0, Math.min(100, v))
    : fallback;
}

/**
 * Normalise a source-mix so the four percentages sum to exactly 100.
 * Proportional rescale — preserves the user's relative intent when
 * slider rounding leaves the total at 99 or 101. If the total is 0
 * (no mix provided), falls back to a balanced 25/25/25/25 split so
 * the calculator is never degenerate.
 */
function normaliseMix(mix: SourceMix): SourceMix {
  const total =
    mix.national + mix.regional + mix.specialise + mix.blog;
  if (total <= 0) {
    return { national: 25, regional: 25, specialise: 25, blog: 25 };
  }
  if (total === 100) return mix;
  const scale = 100 / total;
  const scaled: SourceMix = {
    national: mix.national * scale,
    regional: mix.regional * scale,
    specialise: mix.specialise * scale,
    blog: mix.blog * scale,
  };
  // Round to integers and patch the largest slice so the four
  // rounded values sum to exactly 100.
  const rounded: SourceMix = {
    national: Math.round(scaled.national),
    regional: Math.round(scaled.regional),
    specialise: Math.round(scaled.specialise),
    blog: Math.round(scaled.blog),
  };
  const drift =
    100 -
    (rounded.national +
      rounded.regional +
      rounded.specialise +
      rounded.blog);
  if (drift !== 0) {
    // Add drift to whichever slice is currently largest.
    const entries = Object.entries(rounded) as [keyof SourceMix, number][];
    const largest = entries.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
    rounded[largest] = Math.max(0, rounded[largest] + drift);
  }
  return rounded;
}
