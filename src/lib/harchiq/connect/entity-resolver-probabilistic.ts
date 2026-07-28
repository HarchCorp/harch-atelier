// ═══════════════════════════════════════════════════════════════
//  PROJECT AEGIS v3.1 — HarchIQ PROBABILISTIC ENTITY RESOLVER
//  Fellegi-Sunter record linkage + temporal knowledge graph.
//
//  Inspired by Palantir Gotham's entity-resolution pipeline and
//  Sayari's graph-based corporate-network analysis. Implements the
//  classical Fellegi-Sunter (1969) probabilistic matching model with
//  log-odds scoring, plus a temporal knowledge graph that supports
//  point-in-time queries for "what did the world look like on date X?"
//
//  ┌────────────────────────────────────────────────────────────┐
//  │  Core algorithms                                            │
//  ├────────────────────────────────────────────────────────────┤
//  │  • Fellegi-Sunter probabilistic record linkage              │
//  │  • Jaro-Winkler string similarity (full implementation)     │
//  │  • Greedy clustering for batch entity resolution            │
//  │  • Temporal knowledge graph with interval-based queries     │
//  └────────────────────────────────────────────────────────────┘
//
//  Task ID: AEGIS-V31-ALGO
//  Module:  harchiq/connect/entity-resolver-probabilistic
// ═══════════════════════════════════════════════════════════════

// ─── TYPES ────────────────────────────────────────────────────────

/**
 * EntityRecord — a single record to be matched / resolved.
 *
 * Mirrors the shape of records in commercial corporate registries
 * (OpenCorporates, Sayari, Orbis): name + aliases + sector + location
 * + registration number. The registration number, when present, is
 * the strongest disambiguator.
 */
export interface EntityRecord {
  /** Stable record ID. */
  id: string;
  /** Canonical legal name. */
  name: string;
  /** Alternate names / abbreviations / transliterations. */
  aliases: string[];
  /** Industry sector (e.g. "Banking", "Mining"). */
  sector: string;
  /** Geographic location (city, country, or region). */
  location: string;
  /** Official registration / tax ID, when known. */
  registrationNumber?: string;
}

/**
 * PossibleMatch — a pair of records whose match score is in the
 * "grey zone" (positive but below the auto-merge threshold).
 * Surfaced for human review.
 */
export interface PossibleMatch {
  /** First record ID. */
  rec1Id: string;
  /** Second record ID. */
  rec2Id: string;
  /** Log-odds match score. */
  score: number;
  /** Per-field contribution breakdown. */
  fieldContributions: Record<string, number>;
}

/**
 * MergedEntity — the result of merging a cluster of records that
 * the resolver determined refer to the same real-world entity.
 */
export interface MergedEntity {
  /** Generated canonical entity ID. */
  canonicalId: string;
  /** All record IDs that were merged into this entity. */
  memberRecordIds: string[];
  /** Best canonical name (highest-scoring record's name). */
  canonicalName: string;
  /** Union of all aliases across merged records. */
  aliases: string[];
  /** Best sector. */
  sector: string;
  /** Best location. */
  location: string;
  /** Best registration number (if any). */
  registrationNumber?: string;
  /** Mean pairwise match score across the cluster. */
  cohesionScore: number;
}

/**
 * ResolutionStats — aggregate statistics for a resolution run.
 */
export interface ResolutionStats {
  /** Number of input records. */
  inputRecords: number;
  /** Number of merged entities produced. */
  mergedEntities: number;
  /** Number of possible matches flagged for review. */
  possibleMatches: number;
  /** Number of pairwise comparisons performed. */
  comparisons: number;
  /** Number of comparisons that were skipped (score < 0). */
  skipped: number;
}

/**
 * ResolutionResult — the complete output of `resolveEntities`.
 */
export interface ResolutionResult {
  mergedEntities: MergedEntity[];
  possibleMatches: PossibleMatch[];
  stats: ResolutionStats;
}

/**
 * TemporalRelationship — a typed edge with a validity interval.
 *
 * Used by the TemporalGraph class to model relationships that change
 * over time (e.g. "X is CEO of Y" from 2018-01 to 2023-06).
 */
export interface TemporalRelationship {
  /** Stable relationship ID. */
  id: string;
  /** Source entity ID. */
  sourceId: string;
  /** Target entity ID. */
  targetId: string;
  /** Edge type (e.g. "ownership", "employment", "funding"). */
  type: string;
  /** Edge weight in [0,1]. */
  weight: number;
  /** Start of validity (ISO-8601). */
  startDate: string;
  /** End of validity (ISO-8601); null/undefined = open-ended. */
  endDate?: string;
}

// ─── STRING SIMILARITY (full Jaro-Winkler) ────────────────────────

/**
 * jaroWinkler — Jaro-Winkler string similarity in [0,1].
 *
 * Faithful implementation of the original Winkler (1990) algorithm:
 *
 *   Jaro similarity:
 *     m = number of matching characters (within window ⌊max(|s1|,|s2|)/2⌋−1)
 *     t = transpositions / 2
 *     jaro = (m/|s1| + m/|s2| + (m−t)/m) / 3     (0 if m == 0)
 *
 *   Winkler prefix bonus:
 *     prefix = length of common leading chars, capped at 4
 *     jw = jaro + prefix × 0.1 × (1 − jaro)
 *
 * @param s1 first string
 * @param s2 second string
 * @returns similarity in [0,1]
 */
export function jaroWinkler(s1: string, s2: string): number {
  if (s1 === s2) return 1;
  const len1 = s1.length;
  const len2 = s2.length;
  if (len1 === 0 || len2 === 0) return 0;

  // Matching window: ⌊max(len1, len2)/2⌋ − 1, clamped to ≥ 0.
  const matchWindow = Math.max(0, Math.floor(Math.max(len1, len2) / 2) - 1);

  const s1Matches = new Array<boolean>(len1).fill(false);
  const s2Matches = new Array<boolean>(len2).fill(false);

  // ── Pass 1: count matches within window ──────────────────
  let matches = 0;
  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, len2);
    for (let j = start; j < end; j++) {
      if (s2Matches[j]) continue;
      if (s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }
  if (matches === 0) return 0;

  // ── Pass 2: count transpositions ─────────────────────────
  let transpositions = 0;
  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }
  const t = transpositions / 2;

  const m = matches;
  const jaro = (m / len1 + m / len2 + (m - t) / m) / 3;

  // ── Winkler prefix bonus (max 4 chars) ───────────────────
  let prefixLen = 0;
  const maxPrefix = Math.min(4, len1, len2);
  for (let i = 0; i < maxPrefix; i++) {
    if (s1[i] === s2[i]) prefixLen++;
    else break;
  }

  return jaro + prefixLen * 0.1 * (1 - jaro);
}

// ─── FELLEGI-SUNTER MATCH WEIGHT ──────────────────────────────────

/**
 * Log-odds weight constants derived from Fellegi-Sunter theory.
 *
 * In the FS framework, the weight of a field agreement is:
 *   w = log₂( m / u )
 * where m = P(agreement | match)  and  u = P(agreement | non-match).
 *
 * The constants below are pre-computed log-odds for each field:
 *   • Name (JW > 0.92)          → +6.6  (strong evidence of match)
 *   • Name (JW > 0.80)          → +2.3  (possible match)
 *   • Name (JW ≤ 0.80)          → −2.3  (evidence against)
 *   • Sector exact match        → +1.5  (weak positive)
 *   • Registration # exact      → +20.0 (overwhelming positive)
 *   • Registration # different  → −20.0 (disqualifying)
 *   • Location (JW > 0.85)      → +3.0  (moderate positive)
 */
const MATCH_WEIGHTS = {
  NAME_STRONG_AGREE: 6.6,
  NAME_POSSIBLE_AGREE: 2.3,
  NAME_DISAGREE: -2.3,
  SECTOR_AGREE: 1.5,
  SECTOR_DISAGREE: -0.5,
  REGISTRATION_AGREE: 20.0,
  REGISTRATION_DISAGREE: -20.0,
  LOCATION_AGREE: 3.0,
  LOCATION_DISAGREE: -0.8,
} as const;

/**
 * Score thresholds for the resolution decision tree.
 */
const AUTO_MERGE_THRESHOLD = 4.0;
const REVIEW_LOWER_BOUND = 0.0;

/**
 * calculateMatchWeight — Fellegi-Sunter log-odds match score.
 *
 * For each field, compute a log-odds contribution based on the
 * agreement / disagreement of the two records. Sum the contributions.
 * The final score is in log-odds units:
 *
 *   score > 4.0   ⇒ strong evidence of match (auto-merge)
 *   0 < score ≤ 4 ⇒ possible match (flag for review)
 *   score ≤ 0     ⇒ no match (skip)
 *
 * Field-by-field logic:
 *   • Name: Jaro-Winkler similarity. >0.92 → strong agree, >0.80 →
 *     possible agree, else → disagree.
 *   • Sector: exact case-insensitive match → agree, else disagree.
 *   • Registration number: if both present and equal → overwhelming
 *     positive; if both present and different → disqualifying
 *     (negative). If either is missing → no contribution.
 *   • Location: Jaro-Winkler > 0.85 → agree, else disagree.
 *
 * @param rec1 first record
 * @param rec2 second record
 * @returns   log-odds score and per-field breakdown
 */
export function calculateMatchWeight(
  rec1: EntityRecord,
  rec2: EntityRecord,
): { score: number; fieldContributions: Record<string, number> } {
  const fieldContributions: Record<string, number> = {};

  // ── Name (with aliases) ──────────────────────────────────
  // Best Jaro-Winkler similarity across name × name and name × aliases.
  let bestNameSim = 0;
  const candidateNames1 = [rec1.name, ...rec1.aliases].filter(Boolean);
  const candidateNames2 = [rec2.name, ...rec2.aliases].filter(Boolean);
  for (const n1 of candidateNames1) {
    for (const n2 of candidateNames2) {
      const sim = jaroWinkler(
        n1.toLowerCase().trim(),
        n2.toLowerCase().trim(),
      );
      if (sim > bestNameSim) bestNameSim = sim;
    }
  }

  let nameWeight: number;
  if (bestNameSim > 0.92) nameWeight = MATCH_WEIGHTS.NAME_STRONG_AGREE;
  else if (bestNameSim > 0.80) nameWeight = MATCH_WEIGHTS.NAME_POSSIBLE_AGREE;
  else nameWeight = MATCH_WEIGHTS.NAME_DISAGREE;
  fieldContributions.name = nameWeight;

  // ── Sector ───────────────────────────────────────────────
  const sectorMatch =
    rec1.sector && rec2.sector &&
    rec1.sector.toLowerCase().trim() === rec2.sector.toLowerCase().trim();
  const sectorWeight = sectorMatch
    ? MATCH_WEIGHTS.SECTOR_AGREE
    : MATCH_WEIGHTS.SECTOR_DISAGREE;
  fieldContributions.sector = sectorWeight;

  // ── Registration number ──────────────────────────────────
  if (rec1.registrationNumber && rec2.registrationNumber) {
    const r1 = rec1.registrationNumber.trim().toUpperCase();
    const r2 = rec2.registrationNumber.trim().toUpperCase();
    if (r1 === r2) {
      fieldContributions.registrationNumber = MATCH_WEIGHTS.REGISTRATION_AGREE;
    } else {
      fieldContributions.registrationNumber = MATCH_WEIGHTS.REGISTRATION_DISAGREE;
    }
  }
  // If either is missing, no contribution (Fellegi-Sunter "missing" rule).

  // ── Location ─────────────────────────────────────────────
  if (rec1.location && rec2.location) {
    const locSim = jaroWinkler(
      rec1.location.toLowerCase().trim(),
      rec2.location.toLowerCase().trim(),
    );
    const locWeight = locSim > 0.85
      ? MATCH_WEIGHTS.LOCATION_AGREE
      : MATCH_WEIGHTS.LOCATION_DISAGREE;
    fieldContributions.location = locWeight;
  }

  const score = Object.values(fieldContributions).reduce(
    (sum, w) => sum + w,
    0,
  );

  return { score: Number(score.toFixed(3)), fieldContributions };
}

// ─── BATCH ENTITY RESOLUTION ──────────────────────────────────────

/**
 * resolveEntities — batch entity resolution via Fellegi-Sunter.
 *
 * Algorithm:
 *  1. Compute pairwise match scores for all C(N, 2) record pairs.
 *  2. Auto-merge pairs with score > AUTO_MERGE_THRESHOLD (4.0).
 *     Use union-find to merge into clusters; iteratively transitively
 *     close clusters (if A~B and B~C, then A, B, C are one entity).
 *  3. Flag pairs with 0 < score ≤ 4.0 as possible matches for review.
 *  4. Skip pairs with score ≤ 0.
 *  5. For each cluster, pick the canonical name (longest name in the
 *     cluster, on the assumption that legal names are longer than
 *     abbreviations) and emit a MergedEntity.
 *
 * @param records   array of EntityRecord to resolve
 * @param threshold auto-merge threshold (default 4.0)
 * @returns         ResolutionResult with merged entities, possible
 *                  matches, and stats
 */
export function resolveEntities(
  records: EntityRecord[],
  threshold: number = AUTO_MERGE_THRESHOLD,
): ResolutionResult {
  console.log(
    `[HarchIQ-Connect] Probabilistic resolution: ${records.length} records, threshold=${threshold}`,
  );

  const possibleMatches: PossibleMatch[] = [];
  let comparisons = 0;
  let skipped = 0;

  // ── Union-find for cluster merging ───────────────────────
  const parent = new Map<string, string>();
  const find = (x: string): string => {
    let root = x;
    while (parent.get(root) !== root) root = parent.get(root)!;
    // Path compression.
    let cur = x;
    while (parent.get(cur) !== root) {
      const next = parent.get(cur)!;
      parent.set(cur, root);
      cur = next;
    }
    return root;
  };
  const union = (a: string, b: string) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  };

  for (const r of records) parent.set(r.id, r.id);

  // ── Pairwise comparison ──────────────────────────────────
  for (let i = 0; i < records.length; i++) {
    for (let j = i + 1; j < records.length; j++) {
      comparisons++;
      const { score, fieldContributions } = calculateMatchWeight(
        records[i],
        records[j],
      );

      if (score <= REVIEW_LOWER_BOUND) {
        skipped++;
        continue;
      }
      if (score > threshold) {
        // Auto-merge.
        union(records[i].id, records[j].id);
      } else {
        // Possible match — flag for review.
        possibleMatches.push({
          rec1Id: records[i].id,
          rec2Id: records[j].id,
          score,
          fieldContributions,
        });
      }
    }
  }

  // ── Group records by cluster root ────────────────────────
  const clusters = new Map<string, EntityRecord[]>();
  for (const r of records) {
    const root = find(r.id);
    if (!clusters.has(root)) clusters.set(root, []);
    clusters.get(root)!.push(r);
  }

  // ── Build MergedEntity for each cluster ──────────────────
  const mergedEntities: MergedEntity[] = [];
  for (const [root, members] of clusters) {
    if (members.length === 1) {
      // Singleton — emit as-is with cohesion 1.0.
      const r = members[0];
      mergedEntities.push({
        canonicalId: `ent_${r.id}`,
        memberRecordIds: [r.id],
        canonicalName: r.name,
        aliases: [...r.aliases],
        sector: r.sector,
        location: r.location,
        registrationNumber: r.registrationNumber,
        cohesionScore: 1.0,
      });
      continue;
    }

    // Multi-member cluster — compute cohesion & pick canonical fields.
    let cohesionSum = 0;
    let pairCount = 0;
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        cohesionSum += calculateMatchWeight(members[i], members[j]).score;
        pairCount++;
      }
    }
    const cohesion = pairCount > 0 ? cohesionSum / pairCount : 1.0;

    // Canonical name: longest name (legal names tend to be longest).
    const canonical = members.reduce((best, r) =>
      r.name.length > best.name.length ? r : best,
    );

    // Union all aliases, deduped & lowercased.
    const aliasSet = new Set<string>();
    for (const m of members) {
      if (m.name && m.name !== canonical.name) aliasSet.add(m.name);
      for (const a of m.aliases) if (a) aliasSet.add(a);
    }

    mergedEntities.push({
      canonicalId: `ent_${root}`,
      memberRecordIds: members.map((m) => m.id),
      canonicalName: canonical.name,
      aliases: Array.from(aliasSet),
      sector: canonical.sector,
      location: canonical.location,
      registrationNumber: canonical.registrationNumber,
      cohesionScore: Number(cohesion.toFixed(3)),
    });
  }

  const stats: ResolutionStats = {
    inputRecords: records.length,
    mergedEntities: mergedEntities.length,
    possibleMatches: possibleMatches.length,
    comparisons,
    skipped,
  };

  console.log(
    `[HarchIQ-Connect] Resolution complete: ${mergedEntities.length} entities ` +
      `from ${records.length} records, ${possibleMatches.length} possible matches, ` +
      `${skipped} skipped pairs`,
  );

  return { mergedEntities, possibleMatches, stats };
}

// ─── TEMPORAL KNOWLEDGE GRAPH ─────────────────────────────────────

/**
 * TemporalGraph — a knowledge graph with time-interval-annotated edges.
 *
 * Supports point-in-time queries: "give me the graph state on date D"
 * returns only the edges whose [startDate, endDate] interval contains D.
 *
 * Implementation note: this is a simplified interval-tree structure.
 * Relationships are stored in an array and indexed by start date for
 * binary search. A production v3.2 would use a proper interval tree
 * (e.g. centered interval tree, O(log N + k) per query), but for the
 * graph sizes typical in HarchIQ (≤ 100k relationships) the linear
 * scan with binary-search pruning is fast enough.
 */
export class TemporalGraph {
  /** All relationships, sorted by startDate ascending for binary search. */
  private relationships: TemporalRelationship[] = [];
  /** Index: entityId → relationships where it appears (source or target). */
  private entityIndex = new Map<string, TemporalRelationship[]>();
  /** Sorted flag — flipped to false on insertion, re-sorted lazily. */
  private sorted = true;

  /**
   * addRelationship — insert a temporal edge.
   *
   * @param rel the relationship to add
   */
  addRelationship(rel: TemporalRelationship): void {
    this.relationships.push(rel);
    this.sorted = false;

    // Update entity index for both endpoints.
    this.indexEntity(rel.sourceId, rel);
    this.indexEntity(rel.targetId, rel);
  }

  private indexEntity(entityId: string, rel: TemporalRelationship): void {
    if (!this.entityIndex.has(entityId)) {
      this.entityIndex.set(entityId, []);
    }
    this.entityIndex.get(entityId)!.push(rel);
  }

  /**
   * ensureSorted — lazily re-sort the relationships array by startDate.
   */
  private ensureSorted(): void {
    if (this.sorted) return;
    this.relationships.sort(
      (a, b) => Date.parse(a.startDate) - Date.parse(b.startDate),
    );
    this.sorted = true;
  }

  /**
   * getGraphAtDate — return all relationships valid at the given date.
   *
   * A relationship is valid at date D iff:
   *   startDate ≤ D ≤ endDate   (or endDate undefined, i.e. open-ended)
   *
   * Uses binary search to find the first relationship starting at or
   * before D, then scans forward until startDate > D. For each
   * candidate, checks the endDate constraint.
   *
   * @param date ISO-8601 date string
   * @returns    array of valid relationships
   */
  getGraphAtDate(date: string): TemporalRelationship[] {
    this.ensureSorted();
    const targetMs = Date.parse(date);
    if (Number.isNaN(targetMs)) return [];

    // Binary search for the first relationship with startDate > targetMs.
    // All relationships at indices < this position are candidates.
    let lo = 0;
    let hi = this.relationships.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (Date.parse(this.relationships[mid].startDate) <= targetMs) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    // lo is now the count of relationships with startDate ≤ target.
    const candidates = this.relationships.slice(0, lo);

    // Filter by endDate (undefined endDate = open-ended, always valid).
    return candidates.filter((rel) => {
      if (!rel.endDate) return true;
      return Date.parse(rel.endDate) >= targetMs;
    });
  }

  /**
   * getRelationshipHistory — all relationships involving an entity,
   * across all time, sorted by startDate.
   *
   * @param entityId the entity to look up
   * @returns        chronological list of relationships
   */
  getRelationshipHistory(entityId: string): TemporalRelationship[] {
    const rels = this.entityIndex.get(entityId) ?? [];
    return rels
      .slice()
      .sort((a, b) => Date.parse(a.startDate) - Date.parse(b.startDate));
  }

  /**
   * size — total number of relationships in the graph.
   */
  size(): number {
    return this.relationships.length;
  }

  /**
   * entityCount — number of distinct entities in the graph.
   */
  entityCount(): number {
    return this.entityIndex.size;
  }
}
