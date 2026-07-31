// ═══════════════════════════════════════════════════════════════
//  COMPANY DEDUPLICATION SERVICE
//  Task: company-dedup-enterprise-admin
//
//  Resolves a logical company identity from partial attributes
//  (name, website, ICE, RC) using a 3-stage fallback:
//
//    1. ICE exact match       (highest confidence — ICE is the
//                              official Moroccan tax identifier)
//    2. Slug exact match      (deterministic name normalization)
//    3. Fuzzy name match      (Jaro-Winkler similarity > 0.92 —
//                              deliberately high to avoid false
//                              merges between e.g. "Bank of Africa"
//                              and "Bank of Africa Morocco")
//
//  If none of the stages hit, a new Company is created. The caller
//  gets back `{ company, created }` so it can decide whether to log
//  a "new company detected" event vs. a "linked to existing" event.
//
//  `findDuplicateCandidates` is the read-only variant — it returns
//  exact + fuzzy matches WITHOUT creating anything, so an admin UI
//  can show "Possible duplicates?" warnings before persisting.
// ═══════════════════════════════════════════════════════════════

import { prisma } from "@/lib/db";
import type { Company } from "@prisma/client";

// ─── Types ────────────────────────────────────────────────────────

export interface DedupResult {
  exactMatch: Company | null;
  fuzzyMatches: Array<{ company: Company; similarity: number }>;
  isNew: boolean;
}

export interface FindOrCreateParams {
  name: string;
  website?: string;
  iceNumber?: string;
  rcNumber?: string;
  sector?: string;
  headquarters?: string;
  ticker?: string;
}

export interface FindOrCreateResult {
  company: Company;
  created: boolean;
}

// ─── Slugify (matches the existing Company.slug convention) ───────
// Lowercase, strip accents, collapse non-alphanumeric to "-".

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Jaro-Winkler string similarity ──────────────────────────────
// Returns a value in [0, 1]. 1 = identical. The Winkler prefix bonus
// rewards shared prefixes (common for company names that differ only
// by a suffix like "Group" vs "Group Morocco").

export function stringSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  const matchDistance = Math.floor(Math.max(a.length, b.length) / 2) - 1;
  const aMatches = new Array<boolean>(a.length).fill(false);
  const bMatches = new Array<boolean>(b.length).fill(false);

  let matches = 0;
  for (let i = 0; i < a.length; i++) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, b.length);
    for (let j = start; j < end; j++) {
      if (!bMatches[j] && a[i] === b[j]) {
        aMatches[i] = true;
        bMatches[j] = true;
        matches++;
        break;
      }
    }
  }

  if (matches === 0) return 0;

  // Count transpositions
  let transpositions = 0;
  let k = 0;
  for (let i = 0; i < a.length; i++) {
    if (aMatches[i]) {
      while (!bMatches[k]) k++;
      if (a[i] !== b[k]) transpositions++;
      k++;
    }
  }
  transpositions = Math.floor(transpositions / 2);

  const m = matches;
  const jaro =
    (m / a.length + m / b.length + (m - transpositions) / m) / 3;

  // Winkler prefix bonus (up to 4 matching chars at the start)
  const prefixLen = Math.min(4, commonPrefixLength(a, b));
  return jaro + prefixLen * 0.1 * (1 - jaro);
}

function commonPrefixLength(a: string, b: string): number {
  let i = 0;
  const max = Math.min(a.length, b.length, 4);
  while (i < max && a[i] === b[i]) i++;
  return i;
}

// ─── Read-only duplicate detection ───────────────────────────────
// Returns exact + fuzzy matches. Does NOT create anything.
// Used by the admin UI to show "Possible duplicates" before saving.

export async function findDuplicateCandidates(
  params: FindOrCreateParams,
): Promise<DedupResult> {
  // 1. ICE exact match (highest confidence)
  if (params.iceNumber) {
    const iceMatch = await prisma.company.findUnique({
      where: { iceNumber: params.iceNumber },
    });
    if (iceMatch) {
      return {
        exactMatch: iceMatch,
        fuzzyMatches: [],
        isNew: false,
      };
    }
  }

  // 2. Slug exact match
  const slug = slugify(params.name);
  const slugMatch = await prisma.company.findUnique({
    where: { slug },
  });
  if (slugMatch) {
    return {
      exactMatch: slugMatch,
      fuzzyMatches: [],
      isNew: false,
    };
  }

  // 3. Fuzzy name match (load all once — table is small, ~hundreds)
  const allCompanies = await prisma.company.findMany({
    select: { id: true, name: true, slug: true, iceNumber: true, sector: true },
  });

  const needle = params.name.toLowerCase();
  const fuzzyMatches: Array<{ company: Company; similarity: number }> = [];

  // Re-fetch full rows only for candidates above threshold to keep
  // memory usage predictable.
  const candidateIds: Array<{ id: string; similarity: number }> = [];
  for (const c of allCompanies) {
    const sim = stringSimilarity(needle, c.name.toLowerCase());
    if (sim > 0.92) {
      candidateIds.push({ id: c.id, similarity: sim });
    }
  }

  if (candidateIds.length > 0) {
    candidateIds.sort((a, b) => b.similarity - a.similarity);
    const top = candidateIds.slice(0, 5);
    const fullRows = await prisma.company.findMany({
      where: { id: { in: top.map((t) => t.id) } },
    });
    for (const { id, similarity } of top) {
      const company = fullRows.find((c) => c.id === id);
      if (company) {
        fuzzyMatches.push({ company, similarity });
      }
    }
  }

  return {
    exactMatch: null,
    fuzzyMatches,
    isNew: fuzzyMatches.length === 0,
  };
}

// ─── Find-or-create ──────────────────────────────────────────────
// Used by scrapers, invitation flows, and the admin "create company"
// inline form. Idempotent: calling twice with the same ICE returns
// the same row.

export async function findOrCreateCompany(
  params: FindOrCreateParams,
): Promise<FindOrCreateResult> {
  // 1. ICE exact match
  if (params.iceNumber) {
    const existing = await prisma.company.findUnique({
      where: { iceNumber: params.iceNumber },
    });
    if (existing) {
      // Optionally backfill missing fields without overwriting
      const patch: Record<string, string> = {};
      if (!existing.website && params.website) patch.website = params.website;
      if (!existing.rcNumber && params.rcNumber) patch.rcNumber = params.rcNumber;
      if (!existing.sector || existing.sector === "Other") {
        if (params.sector) patch.sector = params.sector;
      }
      if (Object.keys(patch).length > 0) {
        const updated = await prisma.company.update({
          where: { id: existing.id },
          data: patch,
        });
        return { company: updated, created: false };
      }
      return { company: existing, created: false };
    }
  }

  // 2. Slug exact match
  const slug = slugify(params.name);
  const slugMatch = await prisma.company.findUnique({
    where: { slug },
  });
  if (slugMatch) {
    return { company: slugMatch, created: false };
  }

  // 3. Fuzzy name match (> 0.92)
  const allCompanies = await prisma.company.findMany({
    select: { id: true, name: true },
  });
  const needle = params.name.toLowerCase();
  for (const c of allCompanies) {
    const sim = stringSimilarity(needle, c.name.toLowerCase());
    if (sim > 0.92) {
      // Possible duplicate — return existing for review.
      const existing = await prisma.company.findUnique({
        where: { id: c.id },
      });
      if (existing) return { company: existing, created: false };
    }
  }

  // 4. Create new
  const company = await prisma.company.create({
    data: {
      name: params.name,
      slug,
      sector: params.sector || "Other",
      website: params.website,
      iceNumber: params.iceNumber,
      rcNumber: params.rcNumber,
      headquarters: params.headquarters,
      ticker: params.ticker,
    },
  });
  return { company, created: true };
}
