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
// ═══════════════════════════════════════════════════════════════

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

// ─── In-memory store (production: Prisma ProvenanceRecord model) ──

const provenanceStore: ProvenanceRecord[] = [];
const MAX_STORE_SIZE = 10_000;

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
    const computedAt = new Date().toISOString();

    // Run the actual computation
    const result = await computation();

    // Build the provenance record
    const provenance: ProvenanceRecord = {
      id: `prov_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      entityType,
      entityId,
      companyId,
      sourceArticleIds,
      engine: metadata.engine,
      modelVersion: metadata.modelVersion,
      inputParams: metadata.inputParams ?? {},
      outputSnapshot: serializeOutput(result),
      confidence: metadata.confidence ?? 1.0,
      computedAt,
      computedBy: metadata.computedBy ?? "system",
    };

    // Store (in production: prisma.provenanceRecord.create)
    provenanceStore.push(provenance);
    if (provenanceStore.length > MAX_STORE_SIZE) {
      provenanceStore.shift(); // FIFO eviction
    }

    return { result, provenance };
  },

  /**
   * Query provenance records — "show me the evidence chain for this score".
   */
  query(query: ProvenanceQuery): ProvenanceRecord[] {
    let results = [...provenanceStore];

    if (query.entityType) results = results.filter((r) => r.entityType === query.entityType);
    if (query.entityId) results = results.filter((r) => r.entityId === query.entityId);
    if (query.companyId) results = results.filter((r) => r.companyId === query.companyId);
    if (query.engine) results = results.filter((r) => r.engine === query.engine);
    if (query.since) results = results.filter((r) => new Date(r.computedAt) >= query.since!);

    const limit = query.limit ?? 50;
    return results.slice(-limit).reverse(); // newest first
  },

  /**
   * Get the full evidence chain for a specific score — all source
   * articles, their individual sentiment scores, and the computation
   * metadata.
   */
  getEvidenceChain(entityType: ProvenanceEntityType, entityId: string): ProvenanceRecord | null {
    return provenanceStore.find(
      (r) => r.entityType === entityType && r.entityId === entityId,
    ) ?? null;
  },

  /**
   * Get all provenance records for a company (for the audit trail UI).
   */
  getByCompany(companyId: string, limit: number = 100): ProvenanceRecord[] {
    return provenanceStore
      .filter((r) => r.companyId === companyId)
      .slice(-limit)
      .reverse();
  },

  /**
   * Statistics — how many computations per engine, per entity type.
   * Useful for the admin dashboard to show system activity.
   */
  getStats(): {
    total: number;
    byEngine: Record<string, number>;
    byEntityType: Record<string, number>;
  } {
    const byEngine: Record<string, number> = {};
    const byEntityType: Record<string, number> = {};

    for (const r of provenanceStore) {
      byEngine[r.engine] = (byEngine[r.engine] ?? 0) + 1;
      byEntityType[r.entityType] = (byEntityType[r.entityType] ?? 0) + 1;
    }

    return {
      total: provenanceStore.length,
      byEngine,
      byEntityType,
    };
  },
};

// ─── Helpers ──────────────────────────────────────────────────────

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
