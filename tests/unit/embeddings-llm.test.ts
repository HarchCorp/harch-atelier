// ═══════════════════════════════════════════════════════════════
//  EMBEDDINGS + LLM ROUTER TESTS
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import {
  estimateTokens,
  truncateForEmbedding,
  cosineSimilarity,
  euclideanDistance,
  dotProduct,
  reciprocalRankFusion,
  estimateEmbeddingCost,
  generateEmbedding,
} from "@/lib/embeddings";
import {
  estimateCost,
  getRoutingRules,
  getAvailableProviders,
  analyzeDarijaSentiment,
  routeLLM,
} from "@/lib/llm-router";

// ─── EMBEDDING TESTS ───────────────────────────────────────────

describe("estimateTokens", () => {
  it("estimates tokens from text length", () => {
    expect(estimateTokens("hello world")).toBe(3); // 11 chars / 4 = 2.75 → 3
  });

  it("handles empty string", () => {
    expect(estimateTokens("")).toBe(0);
  });

  it("handles long text", () => {
    const long = "a".repeat(1000);
    expect(estimateTokens(long)).toBe(250);
  });
});

describe("truncateForEmbedding", () => {
  it("returns short text unchanged", () => {
    expect(truncateForEmbedding("short text")).toBe("short text");
  });

  it("truncates long text to max chars", () => {
    const long = "a".repeat(40000);
    const result = truncateForEmbedding(long, 32000);
    expect(result.length).toBe(32000);
  });
});

describe("cosineSimilarity", () => {
  it("returns 1 for identical vectors", () => {
    const v = [1, 2, 3];
    expect(cosineSimilarity(v, v)).toBeCloseTo(1, 5);
  });

  it("returns 0 for orthogonal vectors", () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0, 5);
  });

  it("returns -1 for opposite vectors", () => {
    expect(cosineSimilarity([1, 0], [-1, 0])).toBeCloseTo(-1, 5);
  });

  it("throws on dimension mismatch", () => {
    expect(() => cosineSimilarity([1, 2], [1, 2, 3])).toThrow("dimension mismatch");
  });
});

describe("euclideanDistance", () => {
  it("returns 0 for identical vectors", () => {
    expect(euclideanDistance([1, 2, 3], [1, 2, 3])).toBe(0);
  });

  it("computes distance correctly", () => {
    expect(euclideanDistance([0, 0], [3, 4])).toBe(5); // 3-4-5 triangle
  });

  it("throws on dimension mismatch", () => {
    expect(() => euclideanDistance([1], [1, 2])).toThrow("dimension mismatch");
  });
});

describe("dotProduct", () => {
  it("computes dot product", () => {
    expect(dotProduct([1, 2, 3], [4, 5, 6])).toBe(32); // 1*4 + 2*5 + 3*6
  });

  it("returns 0 for orthogonal vectors", () => {
    expect(dotProduct([1, 0], [0, 1])).toBe(0);
  });
});

describe("reciprocalRankFusion", () => {
  it("merges two ranked lists", () => {
    const bm25 = [
      { id: "a", title: "Article A" },
      { id: "b", title: "Article B" },
    ];
    const vector = [
      { id: "b", title: "Article B" },
      { id: "c", title: "Article C" },
    ];

    const fused = reciprocalRankFusion(bm25, vector, item => item.id);
    expect(fused).toHaveLength(3); // a, b, c

    // "b" appears in both lists, so it should have the highest fused score
    expect(fused[0].id).toBe("b");
    expect(fused[0].fusedScore).toBeGreaterThan(fused[1].fusedScore);
  });

  it("handles empty lists", () => {
    const fused = reciprocalRankFusion([], [], () => "");
    expect(fused).toHaveLength(0);
  });

  it("respects the k parameter", () => {
    const list = [{ id: "x" }];
    const fused1 = reciprocalRankFusion(list, [], item => item.id, 60);
    const fused2 = reciprocalRankFusion(list, [], item => item.id, 1);
    // With k=1, the score should be higher than with k=60
    expect(fused2[0].fusedScore).toBeGreaterThan(fused1[0].fusedScore);
  });
});

describe("estimateEmbeddingCost", () => {
  it("estimates cost for a text", () => {
    const cost = estimateEmbeddingCost("hello world");
    expect(cost).toBeGreaterThan(0);
    expect(cost).toBeLessThan(0.001); // very cheap
  });

  it("scales with text length", () => {
    const shortCost = estimateEmbeddingCost("short");
    const longCost = estimateEmbeddingCost("a".repeat(10000));
    expect(longCost).toBeGreaterThan(shortCost);
  });
});

describe("generateEmbedding (pseudo mode)", () => {
  it("returns a 1536-dimensional vector", async () => {
    const result = await generateEmbedding("test text");
    expect(result.vector).toHaveLength(1536);
    expect(result.dimensions).toBe(1536);
  });

  it("is deterministic for the same input", async () => {
    const r1 = await generateEmbedding("same text");
    const r2 = await generateEmbedding("same text");
    expect(r1.vector).toEqual(r2.vector);
  });

  it("produces different vectors for different inputs", async () => {
    const r1 = await generateEmbedding("text one");
    const r2 = await generateEmbedding("text two");
    // Vectors should not be identical
    const sim = cosineSimilarity(r1.vector, r2.vector);
    expect(sim).toBeLessThan(1);
  });
});

// ─── LLM ROUTER TESTS ──────────────────────────────────────────

describe("LLM Router", () => {
  it("has routing rules for all 7 task types", () => {
    const rules = getRoutingRules();
    expect(Object.keys(rules)).toHaveLength(7);
    expect(rules.sentiment).toBeDefined();
    expect(rules.summarization).toBeDefined();
    expect(rules.embedding).toBeDefined();
    expect(rules.darija).toBeDefined();
    expect(rules.reasoning).toBeDefined();
    expect(rules.ner).toBeDefined();
    expect(rules.translation).toBeDefined();
  });

  it("each rule has primary and fallback providers", () => {
    const rules = getRoutingRules();
    for (const [task, rule] of Object.entries(rules)) {
      expect(rule.primary).toBeDefined();
      expect(rule.fallback).toBeDefined();
      expect(rule.costPer1kTokens).toBeGreaterThan(0);
      expect(rule.avgLatencyMs).toBeGreaterThan(0);
      expect(rule.qualityScore).toBeGreaterThanOrEqual(1);
      expect(rule.qualityScore).toBeLessThanOrEqual(10);
    }
  });

  it("estimateCost returns positive value", () => {
    const cost = estimateCost("sentiment", 1000);
    expect(cost).toBeGreaterThan(0);
  });

  it("estimateCost scales with prompt length", () => {
    const shortCost = estimateCost("sentiment", 100);
    const longCost = estimateCost("sentiment", 10000);
    expect(longCost).toBeGreaterThan(shortCost);
  });
});

describe("Darija sentiment analyzer", () => {
  it("detects positive Darija words", () => {
    const result = analyzeDarijaSentiment("Had l'khir mezian bezzaf");
    const parsed = JSON.parse(result);
    expect(parsed.positiveMatches).toBeGreaterThan(0);
  });

  it("detects negative Darija words", () => {
    const result = analyzeDarijaSentiment("Hadshi khayb o muskil");
    const parsed = JSON.parse(result);
    expect(parsed.negativeMatches).toBeGreaterThan(0);
  });

  it("returns neutral for text without Darija sentiment words", () => {
    const result = analyzeDarijaSentiment("Hello world this is a test");
    const parsed = JSON.parse(result);
    expect(parsed.label).toBe("neutral");
  });

  it("returns a valid JSON response", () => {
    const result = analyzeDarijaSentiment("test");
    expect(() => JSON.parse(result)).not.toThrow();
  });
});

describe("routeLLM (pseudo mode)", () => {
  it("returns a response for sentiment task", async () => {
    const result = await routeLLM("Analyze this text", "sentiment");
    expect(result.content).toBeDefined();
    expect(result.provider).toBeDefined();
    expect(result.task).toBe("sentiment");
    expect(result.cost).toBeGreaterThanOrEqual(0);
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    expect(result.tokenCount.total).toBeGreaterThan(0);
  });

  it("returns a response for darija task", async () => {
    const result = await routeLLM("Had l'khir mezian", "darija");
    expect(result.content).toBeDefined();
    expect(result.task).toBe("darija");
  });

  it("returns a response for summarization task", async () => {
    const result = await routeLLM("Summarize this article", "summarization");
    expect(result.content).toBeDefined();
    expect(result.task).toBe("summarization");
  });

  it("tracks latency", async () => {
    const result = await routeLLM("test", "ner");
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });
});
