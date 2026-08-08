// ═══════════════════════════════════════════════════════════════
//  DATA PROVENANCE LAYER — Palantir-grade evidence chains
//
//  Every computed score in HarchIQ is now traceable to its source
//  data, computation engine, model version, and confidence interval.
//
//  This is what separates a SaaS dashboard from an intelligence
//  platform. When a Dircom sees "Crisis Score: 78", they can click
//  through to see:
//    - Which 12 articles fed the score
//    - Which engine computed each article's sentiment (lexicon vs GLM-4)
//    - What model version was used (glm-4 vs glm-4-plus)
//    - The confidence interval (±5%)
//    - The exact computation timestamp
//    - The input parameters (time window, filters)
//
//  Architecture:
//    ProvenanceRecord = {
//      id, entityType (SentimentScore|RiskAssessment|CrisisScore|...),
//      entityId, companyId,
//      sourceArticleIds: string[],     ← WHICH articles
//      engine: 'lexicon' | 'glm' | 'bayesian' | 'crisis-detector',
//      modelVersion: string,           ← WHAT version
//      inputParams: JSON,              ← WHAT parameters
//      outputSnapshot: JSON,           ← WHAT was computed
//      confidence: number,             ← HOW confident
//      computedAt: DateTime,
//      computedBy: string,             ← WHO/WHAT triggered it
//    }
//
//  The ProvenanceTracker wraps every CoreAnalyticsEngine call:
//    const result = await ProvenanceTracker.track(
//      'sentiment', companyId, articleIds,
//      () => CoreAnalyticsEngine.analyzeBatch(texts, { engine: 'glm' }),
//      { engine: 'glm', modelVersion: 'glm-4', timeWindow: '24h' }
//    );
//
//  ─── WIRE-UI-PROV ─────────────────────────────────────────────────
//  The store is now backed by the Prisma `ProvenanceRecord` model
//  (Neon PostgreSQL). The previous in-memory Map is GONE — every
//  tracked computation is now DURABLE across restarts, deploys,
//  and cron cycles. The public surface (track / query /
//  getEvidenceChain / getByCompany / getStats) is unchanged in
//  shape — only the read methods became async (Prisma is async).
//  Callers (route.ts, CoreAnalyticsEngine, retro-audit) already
//  awaited `track`; the route was updated to `await` the others.
//  NEMESIS defense: every Prisma call is wrapped in try/catch —
//  if the DB is unreachable, the tracker returns [] / null instead
//  of throwing. The computation result is NEVER blocked by a
//  provenance write failure.
// ═══════════════════════════════════════════════════════════════

import { prisma } from "@/lib/db";

// ─── Types ────────────────────────────────────────────────────────

export type ProvenanceEntityType =
  | "SentimentScore"
  | "RiskAssessment"
  | "ReputationScore"
  | "CrisisScore"
  | "AIVisibility"
  | "ArticleSentiment"
  | "ThreatScore";

export type ProvenanceEngine =
  | "lexicon"
  | "glm"
  | "bayesian"
  | "crisis-detector"
  | "threat-scoring"
  | "manual";

export interface ProvenanceRecord {
  id: string;
  entityType: ProvenanceEntityType;
  entityId: string;
  companyId: string;
  /** IDs of the articles that were analyzed to produce this score. */
  sourceArticleIds: string[];
  /** Which engine computed this score. */
  engine: ProvenanceEngine;
  /** Model version (e.g. "glm-4", "glm-4-plus", "lexicon-v3"). */
  modelVersion: string;
  /** Input parameters (time window, filters, thresholds). */
  inputParams: Record<string, unknown>;
  /** Snapshot of the computed output (for audit — what was the score at computation time). */
  outputSnapshot: Record<string, unknown>;
  /** Confidence interval [0, 1] — how confident the engine is in this score. */
  confidence: number;
  /** When the computation ran. */
  computedAt: string;
  /** What triggered the computation (cron, user action, webhook). */
  computedBy: string;
}

export interface ProvenanceQuery {
  entityType?: ProvenanceEntityType;
  entityId?: string;
  companyId?: string;
  engine?: ProvenanceEngine;
  since?: Date;
  limit?: number;
}

// ─── The Tracker ──────────────────────────────────────────────────

/**
 * Wrap any computation with provenance tracking.
 * Records what went in, what came out, and links to source data.
 *
 * Usage:
 *   const result = await ProvenanceTracker.track(
 *     'SentimentScore',
 *     scoreId,
 *     companyId,
 *     articleIds,
 *     () => CoreAnalyticsEngine.analyzeBatch(texts, { engine: 'glm' }),
 *     { engine: 'glm', modelVersion: 'glm-4' }
 *   );
 */
export const ProvenanceTracker = {
  async track<T>(
    entityType: ProvenanceEntityType,
    entityId: string,
    companyId: string,
    sourceArticleIds: string[],
    computation: () => Promise<T>,
    metadata: {
      engine: ProvenanceEngine;
      modelVersion: string;
      inputParams?: Record<string, unknown>;
      computedBy?: string;
      confidence?: number;
    },
  ): Promise<{ result: T; provenance: ProvenanceRecord }> {
    const computedAt = new Date();

    // Run the actual computation FIRST — the provenance write must
    // NEVER block or corrupt the actual result, even if the DB is
    // unreachable. NEMESIS defense: the computation runs before any
    // Prisma call.
    const result = await computation();

    // Build the provenance record (in-memory shape, returned to caller)
    const recordId = `prov_${computedAt.getTime()}_${Math.random().toString(36).slice(2, 10)}`;
    const inputParams = metadata.inputParams ?? {};
    const outputSnapshot = serializeOutput(result);
    const confidence = metadata.confidence ?? 1.0;
    const computedBy = metadata.computedBy ?? "system";

    const provenance: ProvenanceRecord = {
      id: recordId,
      entityType,
      entityId,
      companyId,
      sourceArticleIds,
      engine: metadata.engine,
      modelVersion: metadata.modelVersion,
      inputParams,
      outputSnapshot,
      confidence,
      computedAt: computedAt.toISOString(),
      computedBy,
    };

    // Persist to Neon (fire-and-forget with error catch).
    // The caller already has the in-memory record — if the DB write
    // fails (network, schema drift, etc.), we log and move on.
    // NEMESIS defense: the retry / failure path does NOT throw.
    try {
      await prisma.provenanceRecord.create({
        data: {
          id: recordId,
          entityType,
          entityId,
          companyId,
          sourceArticleIds,
          engine: metadata.engine,
          modelVersion: metadata.modelVersion,
          inputParams: inputParams as object,
          outputSnapshot: outputSnapshot as object,
          confidence,
          computedBy,
          // createdAt is @default(now()) — let Prisma/Neon set it
        },
      });
    } catch (err) {
      // Provenance is best-effort persistence — never block the
      // computation result. Log so the operator can investigate.
      console.error(
        "[ProvenanceTracker] Failed to persist record (entityType=%s entityId=%s):",
        entityType,
        entityId,
        err,
      );
    }

    return { result, provenance };
  },

  /**
   * Query provenance records — "show me the evidence chain for this score".
   */
  async query(query: ProvenanceQuery): Promise<ProvenanceRecord[]> {
    try {
      const records = await prisma.provenanceRecord.findMany({
        where: {
          ...(query.entityType ? { entityType: query.entityType } : {}),
          ...(query.entityId ? { entityId: query.entityId } : {}),
          ...(query.companyId ? { companyId: query.companyId } : {}),
          ...(query.engine ? { engine: query.engine } : {}),
          ...(query.since ? { createdAt: { gte: query.since } } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: query.limit ?? 50,
      });
      return records.map(mapPrismaToRecord);
    } catch (err) {
      console.error("[ProvenanceTracker] query failed:", err);
      return [];
    }
  },

  /**
   * Get the full evidence chain for a specific score — all source
   * articles, their individual sentiment scores, and the computation
   * metadata. Returns the MOST RECENT record for this entity.
   */
  async getEvidenceChain(
    entityType: ProvenanceEntityType,
    entityId: string,
  ): Promise<ProvenanceRecord | null> {
    try {
      const record = await prisma.provenanceRecord.findFirst({
        where: { entityType, entityId },
        orderBy: { createdAt: "desc" },
      });
      return record ? mapPrismaToRecord(record) : null;
    } catch (err) {
      console.error("[ProvenanceTracker] getEvidenceChain failed:", err);
      return null;
    }
  },

  /**
   * Get all provenance records for a company (for the audit trail UI).
   */
  async getByCompany(companyId: string, limit: number = 100): Promise<ProvenanceRecord[]> {
    try {
      const records = await prisma.provenanceRecord.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
      return records.map(mapPrismaToRecord);
    } catch (err) {
      console.error("[ProvenanceTracker] getByCompany failed:", err);
      return [];
    }
  },

  /**
   * Statistics — how many computations per engine, per entity type.
   * Useful for the admin dashboard to show system activity.
   * Uses Prisma groupBy for O(1) DB-side aggregation instead of
   * loading every row into memory.
   */
  async getStats(): Promise<{
    total: number;
    byEngine: Record<string, number>;
    byEntityType: Record<string, number>;
  }> {
    try {
      const [byEngine, byEntityType, total] = await Promise.all([
        prisma.provenanceRecord.groupBy({
          by: ["engine"],
          _count: { _all: true },
        }),
        prisma.provenanceRecord.groupBy({
          by: ["entityType"],
          _count: { _all: true },
        }),
        prisma.provenanceRecord.count(),
      ]);

      const engineMap: Record<string, number> = {};
      for (const row of byEngine) engineMap[row.engine] = row._count._all;

      const entityMap: Record<string, number> = {};
      for (const row of byEntityType) entityMap[row.entityType] = row._count._all;

      return {
        total,
        byEngine: engineMap,
        byEntityType: entityMap,
      };
    } catch (err) {
      console.error("[ProvenanceTracker] getStats failed:", err);
      return { total: 0, byEngine: {}, byEntityType: {} };
    }
  },
};

// ─── Helpers ──────────────────────────────────────────────────────

/**
 * Map a Prisma ProvenanceRecord row to the public ProvenanceRecord
 * interface. Casts the loose `string` columns back to the union
 * types — the schema stores them as String for portability.
 */
function mapPrismaToRecord(
  row: {
    id: string;
    entityType: string;
    entityId: string;
    companyId: string;
    sourceArticleIds: string[];
    engine: string;
    modelVersion: string;
    inputParams: unknown;
    outputSnapshot: unknown;
    confidence: number;
    computedBy: string;
    createdAt: Date;
  },
): ProvenanceRecord {
  return {
    id: row.id,
    entityType: row.entityType as ProvenanceEntityType,
    entityId: row.entityId,
    companyId: row.companyId,
    sourceArticleIds: row.sourceArticleIds,
    engine: row.engine as ProvenanceEngine,
    modelVersion: row.modelVersion,
    inputParams:
      (row.inputParams as Record<string, unknown> | null) ?? {},
    outputSnapshot:
      (row.outputSnapshot as Record<string, unknown> | null) ?? {},
    confidence: row.confidence,
    computedAt: row.createdAt.toISOString(),
    computedBy: row.computedBy,
  };
}

/**
 * Serialize any computation output into a JSON-safe snapshot.
 * Truncates large values to prevent memory bloat.
 */
function serializeOutput(result: unknown): Record<string, unknown> {
  try {
    const json = JSON.parse(JSON.stringify(result));
    // Truncate arrays longer than 20 items (keep first 20)
    if (Array.isArray(json)) {
      return { _arrayLength: json.length, _sample: json.slice(0, 20) };
    }
    // Truncate string values longer than 500 chars
    if (typeof json === "object" && json !== null) {
      for (const key of Object.keys(json)) {
        if (typeof json[key] === "string" && json[key].length > 500) {
          json[key] = json[key].slice(0, 500) + "…[truncated]";
        }
      }
      return json;
    }
    return { _value: json };
  } catch {
    return { _error: "Failed to serialize output" };
  }
}
