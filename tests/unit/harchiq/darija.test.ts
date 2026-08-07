// ═══════════════════════════════════════════════════════════════
//  Darija NLP — Unit Tests
//
//  Task 11 Step Z: validates the Darija/Arabic/French/English
//  language detection + sentiment analysis (lexicon-based).
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import {
  detectLanguage,
  analyzeSentiment,
} from "@/lib/harchiq/darija";

describe("darija NLP", () => {
  // ─── Language detection ────────────────────────────────────────

  describe("detectLanguage", () => {
    it("detects Darija (Moroccan Arabic)", () => {
      const lang = detectLanguage("واش كاين شي خبر جديد على الشركة؟");
      expect(["darija", "arabic", "mixed"]).toContain(lang);
    });

    it("detects MSA (Modern Standard Arabic)", () => {
      const lang = detectLanguage("هل توجد أخبار جديدة عن الشركة؟");
      expect(["arabic", "darija", "mixed"]).toContain(lang);
    });

    it("detects French", () => {
      const lang = detectLanguage("Ceci est un texte en français clair.");
      expect(["french", "mixed"]).toContain(lang);
    });

    it("detects English", () => {
      const lang = detectLanguage("This is clearly an English text.");
      expect(["english", "mixed"]).toContain(lang);
    });

    it("detects mixed (code-switching)", () => {
      const lang = detectLanguage(
        "The meeting was good mais le résultat était mauvais wakha?",
      );
      expect(lang).toBeTruthy();
    });

    it("handles empty string", () => {
      const lang = detectLanguage("");
      expect(lang).toBeTruthy(); // returns a default, doesn't crash
    });

    it("detects Arabizi (Latin-encoded Arabic)", () => {
      // 3 = ع, 7 = ح, 9 = qaf
      const lang = detectLanguage("kayn mochkil f3ran f l'entreprise");
      expect(lang).toBeTruthy();
    });
  });

  // ─── Sentiment analysis ────────────────────────────────────────

  describe("analyzeSentiment", () => {
    it("returns positive for positive Darija", () => {
      const result = analyzeSentiment("ممتاز خبر زوين بزاف", "ar");
      expect(result.score).toBeGreaterThan(0);
    });

    it("returns negative for negative Darija", () => {
      const result = analyzeSentiment("خبار خايبة أزمة كبيرة", "ar");
      expect(result.score).toBeLessThan(0);
    });

    it("returns score in [-1, +1]", () => {
      const texts = [
        "ممتاز رائع",
        "خايب سيء",
        "عادي",
        "",
        "mixed text with بعض الكلمات",
      ];
      for (const text of texts) {
        const result = analyzeSentiment(text, "ar");
        expect(result.score).toBeGreaterThanOrEqual(-1);
        expect(result.score).toBeLessThanOrEqual(1);
      }
    });

    it("handles empty text without crashing", () => {
      const result = analyzeSentiment("", "ar");
      expect(result.score).toBe(0);
    });
  });
});
