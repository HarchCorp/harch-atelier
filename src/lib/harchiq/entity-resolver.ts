// ═══════════════════════════════════════════════════════════════
//  HARCHIQ ENTITY RESOLVER — Section 4
//
//  Takes a company name and searches the DB for related entities:
//    • articles mentioning the company
//    • risk assessments linked to the company
//    • portfolio holdings that contain the company
//    • other companies in the same sector (same_sector)
//    • sanctions matches (sanctions_match) — runs the existing
//      screenName() against the cached OFAC/EU/UN lists
//
//  Returns a typed relationship map:
//    { entity, relationship, strength }
//
//  Strength scoring (0..1):
//    mentioned_in_article  → 0.3 + 0.7 * (1 / (1 + months_old))
//    has_risk_assessment   → 0.5 + 0.5 * (riskScore / 100)
//    in_portfolio          → weight (0..1) of the holding
//    same_sector           → 0.4 (constant — weak signal, just a
//                            peer relationship)
//    sanctions_match       → similarity (0..1) of the best match
//
//  Used by:
//    • /api/investor/entity-graph (to enrich the graph with linked
//      articles + risk assessments)
//    • The Investor Desk node-detail panel (shows linked articles
//      when the user clicks a node)
//    • Future: the entity-network force graph
//
//  SERVER-SIDE ONLY — never imported from a client component (it
//  touches Prisma + the sanctions cache).
//
//  Task ID: signal-entity-graph
// ═══════════════════════════════════════════════════════════════

import { prisma } from "@/lib/db";
import {
  getSanctionsLists,
  flattenLists,
} from "@/lib/sanctions/cache";
import {
  screenName,
} from "@/lib/sanctions/matcher";
import { logInfo } from "@/lib/logger";

// ─── Types ───────────────────────────────────────────────────────

export type EntityRelationship =
  | "mentioned_in_article"
  | "has_risk_assessment"
  | "in_portfolio"
  | "same_sector"
  | "sanctions_match";

/** A single linked entity in the relationship map. */
export interface RelatedEntity {
  /** Stable identifier for the related entity (DB id or synthetic). */
  entityId: string;
  /** Display name of the related entity (article title, company name, etc.). */
  entity: string;
  /** Type of relationship to the queried company. */
  relationship: EntityRelationship;
  /** Strength score in [0, 1] — see scoring table in the header. */
  strength: number;
  /** Optional metadata payload (varies by relationship type). */
  meta?: {
    /** ISO timestamp the relationship was detected. */
    detectedAt?: string;
    /** Source for articles / risk engine name for assessments. */
    source?: string;
    /** Article URL (when applicable). */
    url?: string;
    /** Sector (when the related entity is a company). */
    sector?: string;
    /** Holding weight (when relationship === "in_portfolio"). */
    weight?: number;
    /** Sanctions list code (when relationship === "sanctions_match"). */
    list?: "OFAC" | "EU" | "UN";
    /** Similarity score (when relationship === "sanctions_match"). */
    similarity?: number;
    /** Sanctioned name (when relationship === "sanctions_match"). */
    matchedName?: string;
    /** Risk level (when relationship === "has_risk_assessment"). */
    riskLevel?: string;
    /** Risk score 0-100 (when relationship === "has_risk_assessment"). */
    riskScore?: number;
  };
}

export interface RelationshipMap {
  /** The company name that was queried. */
  query: string;
  /** The resolved Company row (if found by name match), or null. */
  company: {
    id: string;
    slug: string;
    name: string;
    sector: string;
  } | null;
  /** All related entities, sorted by strength desc. */
  relationships: RelatedEntity[];
  /** Aggregate stats. */
  stats: {
    totalRelationships: number;
    articleCount: number;
    riskAssessmentCount: number;
    portfolioHoldingCount: number;
    sameSectorCount: number;
    sanctionsMatchCount: number;
    highestStrength: number;
  };
  /** ISO timestamp the resolver ran. */
  resolvedAt: string;
  /** Warnings (non-fatal issues — e.g. sanctions cache empty). */
  warnings: string[];
}

// ─── Helpers ─────────────────────────────────────────────────────

/**
 * Find a company by case-insensitive exact name match. Returns null
 * if no match. We don't do fuzzy matching here — the resolver is
 * about relationships TO a known company, not about resolving the
 * company itself (that's what entity-resolver-probabilistic.ts is
 * for).
 */
async function findCompanyByName(name: string) {
  const normalized = name.trim();
  if (!normalized) return null;
  // Try exact case-insensitive match first.
  const exact = await prisma.company.findFirst({
    where: { name: { equals: normalized, mode: "insensitive" } },
    select: { id: true, slug: true, name: true, sector: true },
  });
  if (exact) return exact;
  // Fall back to alias contains match.
  const byAlias = await prisma.company.findFirst({
    where: { aliases: { has: normalized } },
    select: { id: true, slug: true, name: true, sector: true },
  });
  return byAlias ?? null;
}

/** Months since a date, floored to 0. Used for article decay. */
function monthsSince(date: Date): number {
  const now = Date.now();
  const diff = now - date.getTime();
  return Math.max(0, Math.floor(diff / (30 * 24 * 60 * 60 * 1000)));
}

// ─── Per-relationship loaders ────────────────────────────────────
//
//  Each loader is a standalone async function that returns a
//  RelatedEntity[] array. Extracted from the IIFE pattern so
//  TypeScript can correctly infer the prisma return type (the IIFE
//  version was tripping the compiler into thinking `articles.map`
//  was being called on the IIFE's return value).

async function loadArticleRelationships(companyId: string, limit: number): Promise<RelatedEntity[]> {
  const articles = await prisma.article.findMany({
    where: { companyId },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      source: true,
      url: true,
      publishedAt: true,
      sentimentScore: true,
    },
  });
  const out: RelatedEntity[] = [];
  for (const a of articles) {
    const months = a.publishedAt ? monthsSince(a.publishedAt) : 0;
    const strength = Math.min(1, 0.3 + 0.7 * (1 / (1 + months)));
    out.push({
      entityId: a.id,
      entity: a.title,
      relationship: "mentioned_in_article",
      strength: Math.round(strength * 1000) / 1000,
      meta: {
        detectedAt: a.publishedAt?.toISOString() ?? undefined,
        source: a.source,
        url: a.url,
      },
    });
  }
  return out;
}

async function loadRiskAssessmentRelationships(companyId: string, limit: number): Promise<RelatedEntity[]> {
  const risks = await prisma.riskAssessment.findMany({
    where: { companyId },
    orderBy: { riskScore: "desc" },
    take: limit,
    select: {
      id: true,
      category: true,
      riskLevel: true,
      riskScore: true,
      assessedAt: true,
    },
  });
  const out: RelatedEntity[] = [];
  for (const r of risks) {
    const score = Math.max(0, Math.min(100, r.riskScore));
    const strength = 0.5 + 0.5 * (score / 100);
    out.push({
      entityId: r.id,
      entity: `${r.category} risk — ${r.riskLevel}`,
      relationship: "has_risk_assessment",
      strength: Math.round(strength * 1000) / 1000,
      meta: {
        detectedAt: r.assessedAt.toISOString(),
        source: "HarchIQ Risk Engine",
        riskLevel: r.riskLevel,
        riskScore: score,
      },
    });
  }
  return out;
}

async function loadPortfolioRelationships(companyId: string, limit: number): Promise<RelatedEntity[]> {
  const holdings = await prisma.portfolioHolding.findMany({
    where: { companyId },
    take: limit,
    select: {
      id: true,
      weight: true,
      addedAt: true,
      portfolio: { select: { name: true } },
    },
  });
  const out: RelatedEntity[] = [];
  for (const h of holdings) {
    out.push({
      entityId: h.id,
      entity: `Holding in ${h.portfolio.name}`,
      relationship: "in_portfolio",
      strength: Math.max(0, Math.min(1, h.weight)),
      meta: {
        detectedAt: h.addedAt.toISOString(),
        weight: h.weight,
      },
    });
  }
  return out;
}

async function loadSameSectorRelationships(companyId: string, sector: string, limit: number): Promise<RelatedEntity[]> {
  const peers = await prisma.company.findMany({
    where: {
      sector,
      id: { not: companyId },
    },
    take: limit,
    select: {
      id: true,
      slug: true,
      name: true,
      sector: true,
    },
  });
  // Same-sector is a weak peer signal — constant 0.4 strength.
  return peers.map((p) => ({
    entityId: p.id,
    entity: p.name,
    relationship: "same_sector" as const,
    strength: 0.4,
    meta: {
      sector: p.sector,
    },
  }));
}

async function loadSanctionsRelationships(
  name: string,
  limit: number,
  warnings: string[],
): Promise<RelatedEntity[]> {
  const cachedLists = await getSanctionsLists();
  const allEntries = flattenLists(cachedLists);
  if (allEntries.length === 0) {
    warnings.push("Sanctions lists unavailable — skipping sanctions_match (run /api/cron/refresh-sanctions to populate).");
    return [];
  }
  const result = screenName(name, allEntries, {
    threshold: 0.7,
    typeFilter: "entity",
  });
  warnings.push(...cachedLists.warnings);
  return result.matches.slice(0, limit).map((m) => ({
    entityId: `${m.list}:${m.name}`,
    entity: m.name,
    relationship: "sanctions_match" as const,
    strength: Math.round(m.similarity * 1000) / 1000,
    meta: {
      list: m.list,
      similarity: m.similarity,
      matchedName: m.name,
      source: `${m.list} Sanctions List`,
    },
  }));
}

// ─── Main resolver ───────────────────────────────────────────────

/**
 * Build a relationship map for a company name.
 *
 * @param name           the company name to resolve
 * @param options.skip   optional set of relationship types to skip
 *                       (e.g. {"sanctions_match"} to skip the OFAC
 *                       screening pass — useful when the caller
 *                       already has screening results)
 * @param options.limit  max relationships per type (default 25)
 */
export async function resolveEntityRelationships(
  name: string,
  options: {
    skip?: Set<EntityRelationship>;
    limit?: number;
  } = {},
): Promise<RelationshipMap> {
  const skip = options.skip ?? new Set();
  const limit = options.limit ?? 25;
  const warnings: string[] = [];
  const relationships: RelatedEntity[] = [];
  const resolvedAt = new Date().toISOString();

  // 1. Find the company by name.
  const company = await findCompanyByName(name);

  // 2. Run the 5 relationship queries in parallel (when allowed).
  //    For each, we cap results to `limit` and convert to RelatedEntity[].
  const tasks: Array<Promise<RelatedEntity[]>> = [];

  if (company) {
    // ── mentioned_in_article ──
    if (!skip.has("mentioned_in_article")) {
      tasks.push(loadArticleRelationships(company.id, limit));
    }

    // ── has_risk_assessment ──
    if (!skip.has("has_risk_assessment")) {
      tasks.push(loadRiskAssessmentRelationships(company.id, limit));
    }

    // ── in_portfolio ──
    if (!skip.has("in_portfolio")) {
      tasks.push(loadPortfolioRelationships(company.id, limit));
    }

    // ── same_sector ──
    if (!skip.has("same_sector") && company.sector) {
      tasks.push(loadSameSectorRelationships(company.id, company.sector, limit));
    }
  } else {
    // Company not found — we still try sanctions_match (which is
    // name-based, not id-based) so the resolver is useful even for
    // ad-hoc entity names.
    warnings.push(`No company found in DB for name "${name}" — only sanctions screening will run.`);
  }

  // ── sanctions_match ──
  //    Always run (even when company is null) — the screening is
  //    name-based, not id-based.
  if (!skip.has("sanctions_match")) {
    tasks.push(loadSanctionsRelationships(name, limit, warnings));
  }

  // 3. Await all tasks in parallel and flatten.
  const results = await Promise.all(tasks);
  for (const batch of results) {
    relationships.push(...batch);
  }

  // 4. Sort by strength desc.
  relationships.sort((a, b) => b.strength - a.strength);

  // 5. Build stats.
  const stats = {
    totalRelationships: relationships.length,
    articleCount: relationships.filter((r) => r.relationship === "mentioned_in_article").length,
    riskAssessmentCount: relationships.filter((r) => r.relationship === "has_risk_assessment").length,
    portfolioHoldingCount: relationships.filter((r) => r.relationship === "in_portfolio").length,
    sameSectorCount: relationships.filter((r) => r.relationship === "same_sector").length,
    sanctionsMatchCount: relationships.filter((r) => r.relationship === "sanctions_match").length,
    highestStrength: relationships.length > 0 ? relationships[0].strength : 0,
  };

  logInfo(
    "entity-resolver",
    `Resolved "${name}": ${stats.totalRelationships} relationships (${stats.articleCount} articles, ${stats.riskAssessmentCount} risks, ${stats.portfolioHoldingCount} holdings, ${stats.sameSectorCount} peers, ${stats.sanctionsMatchCount} sanctions)`,
  );

  return {
    query: name,
    company,
    relationships,
    stats,
    resolvedAt,
    warnings,
  };
}

// ─── Convenience: related articles only ──────────────────────────
//
//  Lightweight helper for callers that only want the linked articles
//  (e.g. the Investor Desk node-detail panel). Skips the expensive
//  sanctions screening pass.

export async function getLinkedArticles(
  companyName: string,
  limit = 10,
): Promise<Array<{
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: Date | null;
  sentimentScore: number | null;
}>> {
  const company = await findCompanyByName(companyName);
  if (!company) return [];
  const articles = await prisma.article.findMany({
    where: { companyId: company.id },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      source: true,
      url: true,
      publishedAt: true,
      sentimentScore: true,
    },
  });
  return articles;
}
