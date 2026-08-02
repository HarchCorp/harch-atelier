// ═══════════════════════════════════════════════════════════════
//  EMBEDDING PIPELINE — pgvector + OpenAI text-embedding-3-small
//
//  Generates 1536-dimensional vector embeddings for articles to
//  enable semantic search (hybrid BM25 + vector + RRF fusion).
//
//  This is the IMPLEMENTATION of the pgvector spec from LOOP 2
//  of the Master Spec Sheet.
//
//  Usage:
//    import { generateEmbedding, generateEmbeddingsBatch } from "@/lib/embeddings";
//    const vector = await generateEmbedding(article.content);
// ═══════════════════════════════════════════════════════════════

import { logInfo, logError } from "@/lib/logger";

// ─── TYPES ─────────────────────────────────────────────────────

export interface EmbeddingResult {
  vector: number[];
  model: string;
  dimensions: number;
  tokenCount: number;
}

export interface BatchEmbeddingResult {
  vectors: number[][];
  model: string;
  dimensions: number;
  totalTokens: number;
  batchCount: number;
}

// ─── CONFIG ────────────────────────────────────────────────────

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;
const MAX_TOKENS_PER_DOC = 8000; // OpenAI limit
const MAX_CHARS_PER_DOC = 32000; // ~8K tokens
const BATCH_SIZE = 100; // OpenAI supports up to 2048 inputs per batch
const COST_PER_1K_TOKENS = 0.00002; // $0.02 per 1M tokens

// ─── TOKEN ESTIMATION ──────────────────────────────────────────

/**
 * Estimate token count from text length.
 * Rule of thumb: 1 token ≈ 4 characters for English, ~3 for French.
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Truncate text to fit within the token limit.
 */
export function truncateForEmbedding(text: string, maxChars: number = MAX_CHARS_PER_DOC): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars);
}

// ─── SINGLE EMBEDDING ──────────────────────────────────────────

/**
 * Generate a 1536-dimensional embedding for a single text.
 * Uses OpenAI text-embedding-3-small model.
 *
 * @param text - The text to embed
 * @returns EmbeddingResult with vector, model, dimensions, tokenCount
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  const truncated = truncateForEmbedding(text);
  const tokenCount = estimateTokens(truncated);

  // If no OpenAI API key, return a deterministic pseudo-embedding (for dev)
  if (!process.env.OPENAI_API_KEY) {
    logInfo("embeddings", "No OPENAI_API_KEY — generating pseudo-embedding for dev", {
      tokenCount,
      dimensions: EMBEDDING_DIMENSIONS,
    });
    return {
      vector: generatePseudoEmbedding(truncated, EMBEDDING_DIMENSIONS),
      model: `${EMBEDDING_MODEL} (pseudo)`,
      dimensions: EMBEDDING_DIMENSIONS,
      tokenCount,
    };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: truncated,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const vector = data.data[0].embedding;

    logInfo("embeddings", "Embedding generated", {
      model: EMBEDDING_MODEL,
      dimensions: vector.length,
      tokenCount,
    });

    return {
      vector,
      model: EMBEDDING_MODEL,
      dimensions: vector.length,
      tokenCount,
    };
  } catch (error) {
    logError("embeddings", "Failed to generate embedding, using pseudo-embedding", {
      error: error instanceof Error ? error.message : "Unknown",
    });
    return {
      vector: generatePseudoEmbedding(truncated, EMBEDDING_DIMENSIONS),
      model: `${EMBEDDING_MODEL} (pseudo-fallback)`,
      dimensions: EMBEDDING_DIMENSIONS,
      tokenCount,
    };
  }
}

// ─── BATCH EMBEDDINGS ──────────────────────────────────────────

/**
 * Generate embeddings for multiple texts in batches.
 * Uses OpenAI's batch API (up to 2048 inputs per request).
 *
 * @param texts - Array of texts to embed
 * @returns BatchEmbeddingResult with all vectors
 */
export async function generateEmbeddingsBatch(
  texts: string[]
): Promise<BatchEmbeddingResult> {
  const truncatedTexts = texts.map(t => truncateForEmbedding(t));
  const totalTokens = truncatedTexts.reduce((sum, t) => sum + estimateTokens(t), 0);
  const batchCount = Math.ceil(truncatedTexts.length / BATCH_SIZE);

  // If no API key, use pseudo-embeddings
  if (!process.env.OPENAI_API_KEY) {
    const vectors = truncatedTexts.map(t => generatePseudoEmbedding(t, EMBEDDING_DIMENSIONS));
    return {
      vectors,
      model: `${EMBEDDING_MODEL} (pseudo)`,
      dimensions: EMBEDDING_DIMENSIONS,
      totalTokens,
      batchCount,
    };
  }

  const allVectors: number[][] = [];

  for (let i = 0; i < truncatedTexts.length; i += BATCH_SIZE) {
    const batch = truncatedTexts.slice(i, i + BATCH_SIZE);
    try {
      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: EMBEDDING_MODEL,
          input: batch,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI batch API error: ${response.status}`);
      }

      const data = await response.json();
      const batchVectors = data.data.map((d: { embedding: number[] }) => d.embedding);
      allVectors.push(...batchVectors);

      logInfo("embeddings", `Batch ${Math.floor(i / BATCH_SIZE) + 1}/${batchCount} complete`, {
        batchSize: batch.length,
        totalSoFar: allVectors.length,
      });
    } catch (error) {
      logError("embeddings", `Batch ${Math.floor(i / BATCH_SIZE) + 1} failed, using pseudo`, {
        error: error instanceof Error ? error.message : "Unknown",
      });
      // Fallback to pseudo-embeddings for this batch
      for (const t of batch) {
        allVectors.push(generatePseudoEmbedding(t, EMBEDDING_DIMENSIONS));
      }
    }
  }

  return {
    vectors: allVectors,
    model: EMBEDDING_MODEL,
    dimensions: EMBEDDING_DIMENSIONS,
    totalTokens,
    batchCount,
  };
}

// ─── PSEUDO-EMBEDDING (dev fallback) ───────────────────────────

/**
 * Generate a deterministic pseudo-embedding for development.
 * Uses a hash-based approach to produce a stable vector.
 * NOT suitable for production semantic search — just for dev/testing.
 */
function generatePseudoEmbedding(text: string, dimensions: number): number[] {
  const vector: number[] = new Array(dimensions).fill(0);

  // Simple hash-based seeding
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const idx = (charCode + i) % dimensions;
    vector[idx] += Math.sin(charCode * 0.01 + i * 0.001);
  }

  // Normalize to unit length (L2 normalization)
  const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] /= norm;
    }
  }

  return vector;
}

// ─── COST ESTIMATION ───────────────────────────────────────────

/**
 * Estimate the cost of embedding a given text.
 * @param text - The text to estimate cost for
 * @returns Estimated cost in USD
 */
export function estimateEmbeddingCost(text: string): number {
  const tokens = estimateTokens(text);
  return (tokens / 1000) * COST_PER_1K_TOKENS;
}

/**
 * Estimate the cost of embedding a batch of texts.
 */
export function estimateBatchCost(texts: string[]): number {
  const totalTokens = texts.reduce((sum, t) => sum + estimateTokens(t), 0);
  return (totalTokens / 1000) * COST_PER_1K_TOKENS;
}

// ─── SIMILARITY FUNCTIONS ──────────────────────────────────────

/**
 * Compute cosine similarity between two vectors.
 * Returns a value between -1 and 1 (1 = identical, 0 = orthogonal, -1 = opposite).
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0) return 0;
  return dotProduct / denom;
}

/**
 * Compute Euclidean distance between two vectors.
 */
export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
  }
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Compute dot product of two vectors.
 */
export function dotProduct(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result += a[i] * b[i];
  }
  return result;
}

// ─── RRF (Reciprocal Rank Fusion) ──────────────────────────────

/**
 * Merge two ranked result lists using Reciprocal Rank Fusion.
 * This is the standard method for combining BM25 + vector search results.
 *
 * @param bm25Results - Results from BM25 keyword search (sorted by relevance)
 * @param vectorResults - Results from vector similarity search (sorted by similarity)
 * @param k - RRF constant (default 60, standard value)
 * @returns Merged results sorted by fused score
 */
export function reciprocalRankFusion<T>(
  bm25Results: T[],
  vectorResults: T[],
  getId: (item: T) => string,
  k: number = 60
): Array<T & { fusedScore: number }> {
  const scores = new Map<string, { item: T; score: number }>();

  // Score BM25 results
  bm25Results.forEach((item, rank) => {
    const id = getId(item);
    const existing = scores.get(id) || { item, score: 0 };
    existing.score += 1 / (k + rank + 1);
    scores.set(id, existing);
  });

  // Score vector results
  vectorResults.forEach((item, rank) => {
    const id = getId(item);
    const existing = scores.get(id) || { item, score: 0 };
    existing.score += 1 / (k + rank + 1);
    scores.set(id, existing);
  });

  // Sort by fused score (descending)
  return [...scores.values()]
    .sort((a, b) => b.score - a.score)
    .map(({ item, score }) => ({ ...item, fusedScore: score }));
}

// ─── EXPORTS ───────────────────────────────────────────────────

export const EMBEDDING_CONFIG = {
  model: EMBEDDING_MODEL,
  dimensions: EMBEDDING_DIMENSIONS,
  maxTokens: MAX_TOKENS_PER_DOC,
  maxChars: MAX_CHARS_PER_DOC,
  batchSize: BATCH_SIZE,
  costPer1kTokens: COST_PER_1K_TOKENS,
} as const;
