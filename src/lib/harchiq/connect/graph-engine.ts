// ═══════════════════════════════════════════════════════════════
//  PROJECT AEGIS v3.0 — HarchIQ CONNECT STAGE
//  Knowledge-graph entity resolver — in-memory implementation.
//
//  The CONNECT stage takes the entities extracted by UNDERSTAND
//  (PERSON, ORGANIZATION, LOCATION, …) and stitches them together
//  into a typed, weighted, sourced graph. Entity resolution (alias
//  merging) is the core problem: the same organization appears in
//  French, Arabic, and abbreviated forms across sources, and we must
//  collapse them into a single node.
//
//  This module is deliberately in-memory for v3.0:
//  • Entities and relationships live in two Maps keyed by UUID.
//  • An alias index (lowercased name → entity ID) gives O(1) lookups
//    for resolution.
//  • Path finding uses BFS over the relationship adjacency list.
//
//  A future v3.1 will swap the storage layer for Neo4j without
//  changing the public API — callers should depend only on the
//  EntityResolver class, not on the in-memory data structures.
//
//  Task ID: AEGIS-V3-ENGINE
//  Module:  harchiq/connect/graph-engine
// ═══════════════════════════════════════════════════════════════

// ─── IN-MEMORY ENTITY & RELATIONSHIP TYPES ────────────────────────

/**
 * Entity — the simplified in-memory entity shape used by CONNECT.
 *
 * This is intentionally lighter than the full BaseEntity ontology in
 * `../types.ts`: we drop `classification`, `metadata`, and the
 * discriminated `type` union in favour of a free-form string `type`.
 * v3.1's Neo4j backend will restore the full ontology.
 */
export interface Entity {
  /** Stable UUID — primary key in the graph. */
  id: string;
  /** Entity type (e.g. "PERSON", "ORGANIZATION", "LOCATION"). */
  type: string;
  /** Canonical display name. */
  name: string;
  /** All known names for this entity (legal, common, Arabic, ticker, …). */
  aliases: string[];
  /** Confidence score in [0,1] — blend of source reliability & freshness. */
  confidence: number;
  /** Source URLs / names that contributed to this entity. */
  sources: string[];
  /** First time HarchIQ observed this entity (ISO-8601). */
  firstSeen: string;
  /** Last time HarchIQ observed an update (ISO-8601). */
  lastSeen: string;
  /** Optional analyst tags for search & filtering. */
  tags?: string[];
  /** Optional free-form metadata bag. */
  metadata?: Record<string, unknown>;
}

/**
 * Relationship — a typed, weighted, sourced edge between two entities.
 *
 * Like Entity, this is the simplified in-memory shape. The full
 * Relationship interface (with EntitySource[] provenance, typed
 * RelationshipType union, etc.) lives in `../types.ts` and will be
 * used when we move to Neo4j.
 */
export interface Relationship {
  /** Stable UUID — primary key. */
  id: string;
  /** Source entity ID. */
  sourceId: string;
  /** Target entity ID. */
  targetId: string;
  /** Edge type — one of the RelationshipType values from ../types.ts. */
  type: string;
  /** Edge strength in [0,1] — frequency / financial weight / etc. */
  strength: number;
  /** First time this edge was observed (ISO-8601). */
  firstSeen: string;
  /** Last time this edge was observed (ISO-8601). */
  lastSeen: string;
  /** Source URLs / names that support this edge. */
  sources?: string[];
}

// ─── AUXILIARY TYPES ──────────────────────────────────────────────

/**
 * EntityQuery — partial-match search filter for `findEntities`. All
 * fields are optional; multiple fields are AND-ed.
 */
export interface EntityQuery {
  /** Substring match against canonical name or any alias (case-insensitive). */
  name?: string;
  /** Exact match against entity type (e.g. "ORGANIZATION"). */
  type?: string;
  /** Substring match against any tag (case-insensitive). */
  tag?: string;
  /** Substring match against any alias specifically (case-insensitive). */
  alias?: string;
}

/**
 * GraphStats — high-level metrics returned by `getStats`.
 */
export interface GraphStats {
  /** Total entities in the graph. */
  entityCount: number;
  /** Total relationships in the graph. */
  relationshipCount: number;
  /** Entity count grouped by `type`. */
  typeDistribution: Record<string, number>;
}

/**
 * ExportedGraph — full graph snapshot returned by `exportGraph`.
 * Suitable for JSON serialization to a file or another service.
 */
export interface ExportedGraph {
  entities: Entity[];
  relationships: Relationship[];
  exportedAt: string;
}

/**
 * PathResult — outcome of a `findPath` BFS query. `found` is false
 * when no path exists within `maxDepth`.
 */
export interface PathResult {
  /** Whether a path was found. */
  found: boolean;
  /** Ordered list of entity IDs from `fromId` to `toId`. */
  path: string[];
  /** Number of edges traversed (path.length - 1 when found, else 0). */
  hops: number;
  /** Edge objects traversed, in order. */
  edges: Relationship[];
}

// ─── ENTITY RESOLVER ──────────────────────────────────────────────

/**
 * EntityResolver — the CONNECT stage's core class. Holds the
 * in-memory entity & relationship stores and exposes the resolution,
 * search, and path-finding operations that the SYNTHESIZE stage needs.
 *
 * Concurrency note: this class is NOT thread-safe. In a single Node.js
 * process this is fine (event loop is single-threaded); for the Neo4j
 * backend we'll rely on the database's transaction isolation.
 */
export class EntityResolver {
  /** Entity store keyed by entity.id. */
  private entities = new Map<string, Entity>();
  /** Relationship store keyed by relationship.id. */
  private relationships = new Map<string, Relationship>();
  /**
   * Alias index — maps a lowercased alias (or canonical name) to the
   * entity ID that owns it. Maintained in lockstep with `entities`.
   * Multiple aliases may point to the same entity ID (after a merge).
   */
  private aliasIndex = new Map<string, string>();

  // ─── ENTITY MANAGEMENT ────────────────────────────────────

  /**
   * addEntity — add an entity, or merge it into an existing one if a
   * match is found by ID or by alias.
   *
   * Merge policy:
   *  • aliases are unioned (case-insensitive dedupe)
   *  • confidence takes the MAX of the two values
   *  • sources are unioned
   *  • tags are unioned
   *  • firstSeen takes the MIN; lastSeen takes the MAX
   *  • name prefers the longer of the two (legal names beat abbreviations)
   *
   * @param entity the entity to add or merge
   * @returns      the resulting (possibly merged) entity
   */
  addEntity(entity: Entity): Entity {
    // 1. Direct ID match → merge into existing.
    const byId = this.entities.get(entity.id);
    if (byId) {
      const merged = this.mergeEntities(byId, entity);
      this.entities.set(merged.id, merged);
      this.indexAliases(merged);
      return merged;
    }

    // 2. Alias / name match → merge into the resolved entity.
    const resolvedId = this.resolveEntityId(entity.name);
    if (resolvedId) {
      const existing = this.entities.get(resolvedId);
      if (existing) {
        // Preserve the existing ID (don't adopt the new entity.id).
        const merged = this.mergeEntities(existing, entity);
        this.entities.set(merged.id, merged);
        this.indexAliases(merged);
        return merged;
      }
    }

    // 3. No match → insert as new.
    this.entities.set(entity.id, entity);
    this.indexAliases(entity);
    return entity;
  }

  /**
   * addRelationship — add a relationship, or update an existing one
   * with the same ID. Strength takes the MAX; firstSeen / lastSeen
   * expand to the union of the two date ranges.
   */
  addRelationship(rel: Relationship): Relationship {
    const existing = this.relationships.get(rel.id);
    if (existing) {
      const merged: Relationship = {
        ...existing,
        strength: Math.max(existing.strength, rel.strength),
        firstSeen: this.minDate(existing.firstSeen, rel.firstSeen),
        lastSeen: this.maxDate(existing.lastSeen, rel.lastSeen),
        sources: this.unionStrings(existing.sources, rel.sources),
      };
      this.relationships.set(merged.id, merged);
      return merged;
    }
    this.relationships.set(rel.id, rel);
    return rel;
  }

  // ─── RESOLUTION ───────────────────────────────────────────

  /**
   * resolveEntity — find an entity whose canonical name or any alias
   * matches the input text. Case-insensitive; falls back to substring
   * matching if no exact hit.
   *
   * @param text the text to resolve (e.g. "Wafa Bank")
   * @returns    the matching Entity, or undefined if no match.
   */
  resolveEntity(text: string): Entity | undefined {
    const id = this.resolveEntityId(text);
    if (!id) return undefined;
    return this.entities.get(id);
  }

  /**
   * resolveEntityId — same as resolveEntity but returns only the ID.
   * Used internally by addEntity to avoid re-entering the Map lookup.
   */
  private resolveEntityId(text: string): string | undefined {
    if (!text) return undefined;
    const normalized = this.normalizeName(text);

    // Exact alias match.
    const direct = this.aliasIndex.get(normalized);
    if (direct) return direct;

    // Substring fallback — try every indexed alias.
    for (const [alias, id] of this.aliasIndex.entries()) {
      if (alias.includes(normalized) || normalized.includes(alias)) {
        return id;
      }
    }
    return undefined;
  }

  // ─── SEARCH ───────────────────────────────────────────────

  /**
   * findEntities — search entities by partial match against name,
   * alias, type, or tag. All filter fields are AND-ed.
   *
   * @param query partial-match filter
   * @returns     matching entities (empty array if none)
   */
  findEntities(query: EntityQuery): Entity[] {
    const results: Entity[] = [];
    for (const entity of this.entities.values()) {
      if (this.matchesQuery(entity, query)) {
        results.push(entity);
      }
    }
    return results;
  }

  /**
   * findRelationships — get every relationship that touches the given
   * entity ID (either as source or as target).
   */
  findRelationships(entityId: string): Relationship[] {
    const results: Relationship[] = [];
    for (const rel of this.relationships.values()) {
      if (rel.sourceId === entityId || rel.targetId === entityId) {
        results.push(rel);
      }
    }
    return results;
  }

  /**
   * findPath — breadth-first search for a path between two entities.
   *
   * Traverses the undirected relationship graph (relationships are
   * treated as bidirectional for path-finding). Returns the shortest
   * path within `maxDepth` hops, or `{ found: false, … }` if none.
   *
   * @param fromId   starting entity ID
   * @param toId     target entity ID
   * @param maxDepth maximum number of hops (default 5)
   * @returns        PathResult with the path + edges traversed
   */
  findPath(fromId: string, toId: string, maxDepth = 5): PathResult {
    const empty: PathResult = {
      found: false,
      path: [],
      hops: 0,
      edges: [],
    };

    if (!this.entities.has(fromId) || !this.entities.has(toId)) {
      return empty;
    }
    if (fromId === toId) {
      return { found: true, path: [fromId], hops: 0, edges: [] };
    }

    // BFS with parent + edge tracking for path reconstruction.
    const visited = new Set<string>([fromId]);
    const queue: Array<{
      id: string;
      path: string[];
      edges: Relationship[];
    }> = [{ id: fromId, path: [fromId], edges: [] }];

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.path.length - 1 >= maxDepth) continue;

      // Build adjacency list on demand (small graphs make this fine).
      const neighbors = this.findRelationships(current.id);
      for (const rel of neighbors) {
        const nextId = rel.sourceId === current.id ? rel.targetId : rel.sourceId;
        if (visited.has(nextId)) continue;
        visited.add(nextId);

        const newPath = [...current.path, nextId];
        const newEdges = [...current.edges, rel];

        if (nextId === toId) {
          return {
            found: true,
            path: newPath,
            hops: newEdges.length,
            edges: newEdges,
          };
        }

        queue.push({ id: nextId, path: newPath, edges: newEdges });
      }
    }

    return empty;
  }

  // ─── STATS & EXPORT ───────────────────────────────────────

  /**
   * getStats — return high-level graph metrics.
   */
  getStats(): GraphStats {
    const typeDistribution: Record<string, number> = {};
    for (const entity of this.entities.values()) {
      const t = entity.type || "unknown";
      typeDistribution[t] = (typeDistribution[t] ?? 0) + 1;
    }
    return {
      entityCount: this.entities.size,
      relationshipCount: this.relationships.size,
      typeDistribution,
    };
  }

  /**
   * exportGraph — return all entities and relationships as a plain
   * JSON-serializable object. Use this for snapshots, debugging, and
   * migration to a persistent backend.
   */
  exportGraph(): ExportedGraph {
    return {
      entities: Array.from(this.entities.values()),
      relationships: Array.from(this.relationships.values()),
      exportedAt: new Date().toISOString(),
    };
  }

  /**
   * clear — wipe all entities, relationships, and the alias index.
   * Useful for tests and for re-ingestion scenarios.
   */
  clear(): void {
    this.entities.clear();
    this.relationships.clear();
    this.aliasIndex.clear();
  }

  // ─── PRIVATE HELPERS ──────────────────────────────────────

  /**
   * normalizeName — lowercase, trim, and collapse internal whitespace.
   * Used for alias indexing and matching.
   */
  private normalizeName(name: string): string {
    return name.toLowerCase().trim().replace(/\s+/g, " ");
  }

  /**
   * indexAliases — (re)index every alias + the canonical name for an
   * entity. Called after every add / merge.
   */
  private indexAliases(entity: Entity): void {
    const names = [entity.name, ...(entity.aliases ?? [])].filter(Boolean);
    for (const n of names) {
      this.aliasIndex.set(this.normalizeName(n), entity.id);
    }
  }

  /**
   * mergeEntities — combine two entities into one, applying the merge
   * policy documented on `addEntity`.
   */
  private mergeEntities(a: Entity, b: Entity): Entity {
    const aliases = this.unionStrings(a.aliases, b.aliases);
    // Prefer the longer canonical name (legal names beat abbreviations).
    const name = (b.name.length > a.name.length ? b.name : a.name) || a.name || b.name;
    // Ensure the canonical name is also in aliases.
    if (name && !aliases.includes(name)) {
      aliases.push(name);
    }

    return {
      id: a.id, // preserve the existing ID
      type: a.type || b.type,
      name,
      aliases,
      confidence: Math.max(a.confidence ?? 0, b.confidence ?? 0),
      sources: this.unionStrings(a.sources, b.sources),
      firstSeen: this.minDate(a.firstSeen, b.firstSeen),
      lastSeen: this.maxDate(a.lastSeen, b.lastSeen),
      tags: this.unionStrings(a.tags, b.tags),
      metadata: { ...(a.metadata ?? {}), ...(b.metadata ?? {}) },
    };
  }

  /**
   * matchesQuery — apply a single EntityQuery to a single Entity.
   * All non-undefined fields must match.
   */
  private matchesQuery(entity: Entity, query: EntityQuery): boolean {
    if (query.type && entity.type !== query.type) return false;

    if (query.name) {
      const needle = query.name.toLowerCase();
      const haystack = [entity.name, ...(entity.aliases ?? [])]
        .filter(Boolean)
        .map((s) => s.toLowerCase());
      const hit = haystack.some((h) => h.includes(needle));
      if (!hit) return false;
    }

    if (query.alias) {
      const needle = query.alias.toLowerCase();
      const aliases = (entity.aliases ?? [])
        .filter(Boolean)
        .map((s) => s.toLowerCase());
      if (!aliases.some((a) => a.includes(needle))) return false;
    }

    if (query.tag) {
      const needle = query.tag.toLowerCase();
      const tags = (entity.tags ?? [])
        .filter(Boolean)
        .map((s) => s.toLowerCase());
      if (!tags.some((t) => t.includes(needle))) return false;
    }

    return true;
  }

  /**
   * unionStrings — union two string arrays, case-sensitively deduped.
   */
  private unionStrings(
    a: string[] | undefined,
    b: string[] | undefined,
  ): string[] {
    const out: string[] = [];
    const seen = new Set<string>();
    for (const s of [...(a ?? []), ...(b ?? [])]) {
      if (!s || seen.has(s)) continue;
      seen.add(s);
      out.push(s);
    }
    return out;
  }

  /**
   * minDate — return the chronologically earlier of two ISO-8601
   * strings. Falls back to the first arg if either is unparseable.
   */
  private minDate(a: string, b: string): string {
    const ta = Date.parse(a);
    const tb = Date.parse(b);
    if (Number.isNaN(ta)) return b;
    if (Number.isNaN(tb)) return a;
    return ta <= tb ? a : b;
  }

  /**
   * maxDate — return the chronologically later of two ISO-8601 strings.
   */
  private maxDate(a: string, b: string): string {
    const ta = Date.parse(a);
    const tb = Date.parse(b);
    if (Number.isNaN(ta)) return b;
    if (Number.isNaN(tb)) return a;
    return ta >= tb ? a : b;
  }
}

// ─── FACTORY HELPER ───────────────────────────────────────────────

/**
 * createEntityResolver — convenience factory. Equivalent to
 * `new EntityResolver()` but reads better at call sites that also
 * configure the resolver (e.g. seeding it from a snapshot).
 */
export function createEntityResolver(): EntityResolver {
  return new EntityResolver();
}
