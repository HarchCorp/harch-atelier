// ═══════════════════════════════════════════════════════════════
//  POST /api/console/risk-heatmap
//
//  Builds a 5×5 risk heat map — Probability (1-5) × Impact (1-5) —
//  for the user's company, with one dot per risk category. Five
//  strategic risk categories are always returned:
//
//    1. Géopolitique   — international/strategic exposure
//    2. Réglementaire  — regulatory / compliance / legal
//    3. Réputationnel  — reputational / media / brand
//    4. Opérationnel   — operational / labor / financial / AI
//    5. ESG            — environmental / social / governance
//
//  Each risk row carries:
//    { id, category, label, probability (1-5), impact (1-5),
//      owner, deadline (ISO), mitigation, trajectory,
//      lastEvent (ISO), articleCount, severity }
//
//  Real data is sourced from the RiskAssessment table (mapped from
//  free-text `category` into our 5 buckets) + recent negative
//  articles (sentimentLabel = "negative") as a corroborating signal.
//  When real data is sparse, sensible per-bucket defaults are used
//  so the matrix is always informative.
//
//  Auth: requires session + company (requireUserCompany). Demo
//  sessions flow through the same path — demoFilter is spread into
//  every RiskAssessment / Article query so demo data is isolated.
//
//  Skill ID: SKILL-10-RISK-HEATMAP
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

export type RiskCategory =
  | "Géopolitique"
  | "Réglementaire"
  | "Réputationnel"
  | "Opérationnel"
  | "ESG";

export type RiskSeverity = "low" | "medium" | "high" | "critical";

export interface RiskRow {
  id: string;
  category: RiskCategory;
  label: string;
  probability: number;       // 1-5
  impact: number;            // 1-5
  owner: string;
  deadline: string;          // ISO date
  mitigation: string;
  trajectory: "rising" | "stable" | "falling";
  lastEvent: string;         // ISO date or "—"
  articleCount: number;
  severity: RiskSeverity;
}

export interface RiskHeatmapResponse {
  risks: RiskRow[];
  meta: {
    companyName: string;
    sector: string | null;
    generatedAt: string;
    windowDays: number;
    source: "real" | "demo";
  };
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    avgScore: number;        // 0-25, mean of probability*impact
  };
}

// ─── Bucket configuration ──────────────────────────────────────
//
// Each of the 5 strategic buckets has:
//   - keywords:   matched (case-insensitive) against RiskAssessment
//                 .category to fold free-text into a stable bucket.
//   - owner:      default responsible function (French).
//   - mitigation: templated action plan (French, imperative).
//   - label:      short descriptor shown in the popup.
//
// The defaults reflect industry-standard posture for an
// early-stage company with no risk data yet.

interface BucketConfig {
  category: RiskCategory;
  label: string;
  keywords: string[];
  owner: string;
  mitigation: string;
  defaultProbability: number;
  defaultImpact: number;
}

const BUCKETS: BucketConfig[] = [
  {
    category: "Géopolitique",
    label: "Exposition géopolitique et stratégique",
    keywords: [
      "geopolit", "géopolit", "international", "strategic",
      "strategique", "stratégique", "political", "politique",
      "geopolitical",
    ],
    owner: "Direction Stratégie & Affaires Institutionnelles",
    mitigation:
      "Cartographier les zones d'exposition pays, activer la veille " +
      "diplomatie-entreprise, préparer un scénario de continuité et " +
      "une grille de communication défensive par géographie.",
    defaultProbability: 2,
    defaultImpact: 4,
  },
  {
    category: "Réglementaire",
    label: "Évolution réglementaire et conformité",
    keywords: [
      "regulat", "régulat", "compliance", "conformité",
      "legal", "juridique", "regulatory", "loi",
    ],
    owner: "Direction Juridique & Conformité",
    mitigation:
      "Mettre à jour la cartographie réglementaire, lancer un audit " +
      "de conformité ciblé, désigner un référent par texte applicable " +
      "et planifier un point de comité sous 30 jours.",
    defaultProbability: 3,
    defaultImpact: 3,
  },
  {
    category: "Réputationnel",
    label: "Risques réputationnels et médiatiques",
    keywords: [
      "reputat", "réputat", "media", "média", "brand",
      "marque", "reputational", "narrative", "image",
    ],
    owner: "Direction Communication & Dircom",
    mitigation:
      "Activer la cellule de veille réputationnelle, pré-positionner " +
      "un communiqué de crise, mobiliser les porte-parole et engager " +
      "un audit narratif des sources influentes.",
    defaultProbability: 3,
    defaultImpact: 4,
  },
  {
    category: "Opérationnel",
    label: "Risques opérationnels, financiers et humains",
    keywords: [
      "operat", "opérat", "operational", "labor", "social",
      "rh", "financial", "financier", "ai visibility",
      "ia", "technique", "logistique",
    ],
    owner: "Direction des Opérations & DAF",
    mitigation:
      "Lancer un diagnostic des défaillances internes, renforcer les " +
      "contrôles clés, fiabiliser la chaîne d'approvisionnement et " +
      "programmer un point de pilotage hebdomadaire jusqu'à résorption.",
    defaultProbability: 3,
    defaultImpact: 3,
  },
  {
    category: "ESG",
    label: "Risques environnementaux, sociaux et de gouvernance",
    keywords: [
      "esg", "environnement", "environment", "social",
      "governance", "gouvernance", "rse", "csr",
      "climat", "emission", "émission", "dechets",
      "déchets", "diversity", "diversité",
    ],
    owner: "Direction RSE & Développement Durable",
    mitigation:
      "Consolider la performance ESG, publier un bilan transparent, " +
      "engager un plan de progression à 12 mois et activer le dialogue " +
      "avec les parties prenantes associatives.",
    defaultProbability: 2,
    defaultImpact: 3,
  },
];

const WINDOW_DAYS = 30;

// ─── POST handler ──────────────────────────────────────────────

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
    const windowAgo = new Date(now.getTime() - WINDOW_DAYS * 86400000);

    // ─── Parallel batch: latest risks per category + supporting
    //     negative articles + reputation score for context. ───────
    const [companyRow, riskRows, negativeArticles, reputationScore] =
      await Promise.all([
        prisma.company.findUnique({
          where: { id: company.id },
          select: { name: true, sector: true },
        }),
        prisma.riskAssessment.findMany({
          where: {
            companyId: company.id,
            assessedAt: { gte: windowAgo },
            ...demoFilter,
          },
          orderBy: { assessedAt: "desc" },
          take: 60,
          select: {
            id: true,
            category: true,
            riskLevel: true,
            riskScore: true,
            frequency: true,
            impactSeverity: true,
            trajectory: true,
            articleCount: true,
            assessedAt: true,
          },
        }),
        prisma.article.findMany({
          where: {
            companyId: company.id,
            sentimentLabel: "negative",
            publishedAt: { gte: windowAgo },
            ...demoFilter,
          },
          orderBy: { publishedAt: "desc" },
          take: 50,
          select: {
            id: true,
            title: true,
            source: true,
            publishedAt: true,
            summary: true,
            url: true,
          },
        }),
        prisma.reputationScore.findFirst({
          where: { companyId: company.id, ...demoFilter },
          orderBy: { calculatedAt: "desc" },
          select: { overall: true, sentiment: true },
        }),
      ]);

    // ─── Fold each RiskAssessment row into one of our 5 buckets ───
    // We deduplicate by bucket, keeping only the most-recent row per
    // bucket (riskRows is already orderBy assessedAt desc, so the
    // first match wins). Articles are bucketed by keyword scan on
    // title+summary and used as a corroborating signal.

    interface AggregatedBucket {
      cfg: BucketConfig;
      latestRisk: (typeof riskRows)[number] | null;
      articleHits: number;
      lastArticleAt: Date | null;
      trajectory: "rising" | "stable" | "falling";
    }

    const bucketState = new Map<RiskCategory, AggregatedBucket>();

    for (const cfg of BUCKETS) {
      const loweredKw = cfg.keywords.map((k) => k.toLowerCase());
      // Find the most-recent RiskAssessment matching this bucket.
      const match =
        riskRows.find((r) => {
          const cat = (r.category ?? "").toLowerCase();
          return loweredKw.some((kw) => cat.includes(kw));
        }) ?? null;

      // Count corroborating negative articles (keyword scan).
      let articleHits = 0;
      let lastArticleAt: Date | null = null;
      for (const art of negativeArticles) {
        const hay = `${art.title ?? ""} ${art.summary ?? ""}`.toLowerCase();
        if (loweredKw.some((kw) => hay.includes(kw))) {
          articleHits++;
          const at = art.publishedAt;
          if (at && (!lastArticleAt || at > lastArticleAt)) {
            lastArticleAt = at;
          }
        }
      }

      // Trajectory: prefer the RiskAssessment value; else infer from
      // article volume (≥5 negative hits in window = rising).
      const trajectory: "rising" | "stable" | "falling" =
        match?.trajectory === "rising"
          ? "rising"
          : match?.trajectory === "falling"
            ? "falling"
            : articleHits >= 5
              ? "rising"
              : "stable";

      bucketState.set(cfg.category, {
        cfg,
        latestRisk: match,
        articleHits,
        lastArticleAt,
        trajectory,
      });
    }

    // ─── Build the 5 risk rows ──────────────────────────────────
    const risks: RiskRow[] = BUCKETS.map((cfg) => {
      const st = bucketState.get(cfg.category)!;
      const r = st.latestRisk;

      // Probability (1-5) — blend frequency (0-1) + articleCount.
      // Without data, fall back to the bucket default, nudged up by
      // corroborating negative articles.
      let probability: number;
      if (r?.frequency != null) {
        // frequency 0-1 → 1-5
        const fromFreq = 1 + Math.round(r.frequency * 4);
        const fromArticles = Math.min(2, Math.floor(st.articleHits / 4));
        probability = clamp15(fromFreq + fromArticles);
      } else if (r) {
        // No frequency — derive from riskScore (0-100).
        const fromScore = 1 + Math.round((r.riskScore / 100) * 4);
        probability = clamp15(fromScore);
      } else {
        probability = clamp15(
          cfg.defaultProbability +
            Math.min(2, Math.floor(st.articleHits / 5)),
        );
      }

      // Impact (1-5) — prefer impactSeverity (0-1); else riskScore.
      let impact: number;
      if (r?.impactSeverity != null) {
        impact = clamp15(1 + Math.round(r.impactSeverity * 4));
      } else if (r) {
        impact = clamp15(1 + Math.round((r.riskScore / 100) * 4));
      } else {
        // If we have corroborating negative articles, escalate impact.
        impact = clamp15(
          cfg.defaultImpact + Math.min(1, Math.floor(st.articleHits / 8)),
        );
      }

      // Severity from probability × impact (1-25 scale).
      const score = probability * impact;
      const severity: RiskSeverity =
        score >= 20
          ? "critical"
          : score >= 12
            ? "high"
            : score >= 6
              ? "medium"
              : "low";

      // Deadline: depends on severity.
      const deadlineDays =
        severity === "critical"
          ? 7
          : severity === "high"
            ? 14
            : severity === "medium"
              ? 30
              : 90;
      const deadline = new Date(
        now.getTime() + deadlineDays * 86400000,
      ).toISOString();

      // lastEvent: prefer the article date (more recent), else risk.
      const lastEvent =
        st.lastArticleAt && (!r?.assessedAt || st.lastArticleAt > r.assessedAt)
          ? st.lastArticleAt.toISOString()
          : r?.assessedAt
            ? r.assessedAt.toISOString()
            : "—";

      const articleCount = (r?.articleCount ?? 0) + st.articleHits;

      return {
        id: r?.id ?? `default-${cfg.category}`,
        category: cfg.category,
        label: cfg.label,
        probability,
        impact,
        owner: cfg.owner,
        deadline,
        mitigation: cfg.mitigation,
        trajectory: st.trajectory,
        lastEvent,
        articleCount,
        severity,
      };
    });

    // ─── Summary ────────────────────────────────────────────────
    const summary = {
      total: risks.length,
      critical: risks.filter((r) => r.severity === "critical").length,
      high: risks.filter((r) => r.severity === "high").length,
      medium: risks.filter((r) => r.severity === "medium").length,
      low: risks.filter((r) => r.severity === "low").length,
      avgScore:
        risks.length === 0
          ? 0
          : Math.round(
              (risks.reduce((s, r) => s + r.probability * r.impact, 0) /
                risks.length) *
                10,
            ) / 10,
    };

    const response: RiskHeatmapResponse = {
      risks,
      meta: {
        companyName: companyRow?.name ?? company.name,
        sector: companyRow?.sector ?? company.sector,
        generatedAt: now.toISOString(),
        windowDays: WINDOW_DAYS,
        source: "real",
      },
      summary,
    };

    logInfo(
      "risk-heatmap",
      `Risk heatmap generated for ${company.name}: ${risks.length} categories, critical=${summary.critical}, high=${summary.high}, avgScore=${summary.avgScore}`,
      {
        reputationOverall: reputationScore?.overall ?? null,
        negativeArticles: negativeArticles.length,
      },
    );

    return NextResponse.json(response);
  } catch (err) {
    logError("risk-heatmap", `Generate failed: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}

// ─── Helpers ───────────────────────────────────────────────────

function clamp15(n: number): number {
  return Math.max(1, Math.min(5, Math.round(n)));
}
