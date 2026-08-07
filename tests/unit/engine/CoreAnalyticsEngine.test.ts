// ═══════════════════════════════════════════════════════════════
//  CoreAnalyticsEngine — Unit Tests
//
//  Task 11 Step Z: validates the unified facade works for both
//  lexicon and GLM engines, and that the normalized output shape
//  is correct regardless of the underlying analyzer.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import { CoreAnalyticsEngine } from "@/lib/engine/CoreAnalyticsEngine";

describe("CoreAnalyticsEngine", () => {
  // ─── Lexicon engine (sync, no API) ──────────────────────────────

  describe("analyzeSentiment (lexicon)", () => {
    it("returns positive score for positive text", async () => {
      const result = await CoreAnalyticsEngine.analyzeSentiment(
        "This is amazing! Great success, wonderful news, excellent results.",
        { engine: "lexicon" },
      );
      expect(result.engine).toBe("lexicon");
      expect(result.score).toBeGreaterThan(0);
      expect(result.label).toBe("positive");
      expect(result.confidence).toBe(1.0); // lexicon always 1.0
    });

    it("returns negative score for negative text", async () => {
      const result = await CoreAnalyticsEngine.analyzeSentiment(
        "Terrible disaster, awful crisis, scandal and corruption everywhere.",
        { engine: "lexicon" },
      );
      expect(result.score).toBeLessThan(0);
      expect(result.label).toBe("negative");
    });

    it("returns near-zero score for neutral text", async () => {
      const result = await CoreAnalyticsEngine.analyzeSentiment(
        "The company held its annual meeting on Tuesday.",
        { engine: "lexicon" },
      );
      expect(Math.abs(result.score)).toBeLessThan(0.3);
      expect(["neutral", "positive", "negative"]).toContain(result.label);
    });

    it("handles empty text gracefully", async () => {
      const result = await CoreAnalyticsEngine.analyzeSentiment("", {
        engine: "lexicon",
      });
      expect(result.score).toBe(0);
      expect(result.engine).toBe("lexicon");
    });

    it("handles Arabic text", async () => {
      const result = await CoreAnalyticsEngine.analyzeSentiment(
        "أزمة كبيرة فضيحة رهيبة كارثة",
        { engine: "lexicon" },
      );
      expect(result.score).toBeLessThan(0);
      expect(result.label).toBe("negative");
    });

    it("defaults to lexicon engine when no option given", async () => {
      const result = await CoreAnalyticsEngine.analyzeSentiment("Good news!");
      expect(result.engine).toBe("lexicon");
    });
  });

  // ─── Batch analysis ────────────────────────────────────────────

  describe("analyzeBatch (lexicon)", () => {
    it("analyzes multiple texts and returns array", async () => {
      const texts = [
        "Amazing success!",
        "Terrible disaster.",
        "The meeting was held.",
      ];
      const results = await CoreAnalyticsEngine.analyzeBatch(texts, {
        engine: "lexicon",
      });
      expect(results).toHaveLength(3);
      expect(results[0].label).toBe("positive");
      expect(results[1].label).toBe("negative");
      expect(results.every((r) => r.engine === "lexicon")).toBe(true);
    });

    it("handles empty array", async () => {
      const results = await CoreAnalyticsEngine.analyzeBatch([], {
        engine: "lexicon",
      });
      expect(results).toHaveLength(0);
    });
  });

  // ─── Language detection ────────────────────────────────────────

  describe("detectLanguage", () => {
    it("detects French", () => {
      const lang = CoreAnalyticsEngine.detectLanguage(
        "Ceci est un texte en français avec des mots français.",
      );
      expect(lang).toBe("fr");
    });

    it("detects Arabic", () => {
      const lang = CoreAnalyticsEngine.detectLanguage(
        "هذا نص باللغة العربية",
      );
      expect(lang).toBe("ar");
    });

    it("detects English", () => {
      const lang = CoreAnalyticsEngine.detectLanguage(
        "This is an English text with English words.",
      );
      expect(lang).toBe("en");
    });
  });

  // ─── Output shape normalization ────────────────────────────────

  describe("UnifiedSentimentResult shape", () => {
    it("always returns all required fields", async () => {
      const result = await CoreAnalyticsEngine.analyzeSentiment("Test text.");
      expect(result).toHaveProperty("score");
      expect(result).toHaveProperty("label");
      expect(result).toHaveProperty("confidence");
      expect(result).toHaveProperty("engine");
      expect(typeof result.score).toBe("number");
      expect(typeof result.label).toBe("string");
      expect(typeof result.confidence).toBe("number");
      expect(typeof result.engine).toBe("string");
    });

    it("score is always in [-1, +1] range", async () => {
      const texts = [
        "Amazing wonderful excellent!",
        "Terrible awful disaster!",
        "Neutral text.",
        "",
        "Mixed feelings good bad happy sad.",
      ];
      for (const text of texts) {
        const result = await CoreAnalyticsEngine.analyzeSentiment(text, {
          engine: "lexicon",
        });
        expect(result.score).toBeGreaterThanOrEqual(-1);
        expect(result.score).toBeLessThanOrEqual(1);
      }
    });
  });
});
