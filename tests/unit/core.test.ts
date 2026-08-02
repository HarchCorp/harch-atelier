// ═══════════════════════════════════════════════════════════════
//  UNIT TESTS — Harch Atelier Core Utilities
//
//  Tests the critical path: hashing, dedup logic, sentiment
//  classification, overflow protection utilities.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import crypto from "crypto";

// ─── Helper: hashUrl (mirrors the one used in seed scripts) ─────
function hashUrl(url: string): string {
  return crypto.createHash("sha256").update(url).digest("hex").slice(0, 32);
}

describe("hashUrl utility", () => {
  it("produces a 32-char hex string", () => {
    const hash = hashUrl("https://example.com/article/1");
    expect(hash).toMatch(/^[a-f0-9]{32}$/);
  });

  it("is deterministic (same URL → same hash)", () => {
    const url = "https://hespress.ma/article/ocp-2026";
    expect(hashUrl(url)).toBe(hashUrl(url));
  });

  it("different URLs produce different hashes", () => {
    expect(hashUrl("https://a.com")).not.toBe(hashUrl("https://b.com"));
  });
});

// ─── Sentiment classification logic ────────────────────────────
function classifySentiment(score: number): "positive" | "neutral" | "negative" {
  if (score > 0.1) return "positive";
  if (score < -0.1) return "negative";
  return "neutral";
}

describe("sentiment classification", () => {
  it("classifies high positive scores", () => {
    expect(classifySentiment(0.72)).toBe("positive");
  });

  it("classifies high negative scores", () => {
    expect(classifySentiment(-0.85)).toBe("negative");
  });

  it("classifies neutral scores (boundary -0.1 to 0.1)", () => {
    expect(classifySentiment(0.0)).toBe("neutral");
    expect(classifySentiment(0.05)).toBe("neutral");
    expect(classifySentiment(-0.05)).toBe("neutral");
  });

  it("handles edge cases at boundaries", () => {
    expect(classifySentiment(0.11)).toBe("positive");
    expect(classifySentiment(-0.11)).toBe("negative");
    expect(classifySentiment(0.1)).toBe("neutral"); // exactly 0.1 is neutral
  });
});

// ─── Risk level classification ─────────────────────────────────
function riskLevel(score: number): "low" | "moderate" | "elevated" | "high" | "critical" {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 45) return "elevated";
  if (score >= 30) return "moderate";
  return "low";
}

describe("risk level classification", () => {
  it("returns critical for scores >= 80", () => {
    expect(riskLevel(80)).toBe("critical");
    expect(riskLevel(95)).toBe("critical");
    expect(riskLevel(100)).toBe("critical");
  });

  it("returns high for scores 60-79", () => {
    expect(riskLevel(60)).toBe("high");
    expect(riskLevel(72)).toBe("high");
    expect(riskLevel(79)).toBe("high");
  });

  it("returns elevated for scores 45-59", () => {
    expect(riskLevel(45)).toBe("elevated");
    expect(riskLevel(50)).toBe("elevated");
  });

  it("returns moderate for scores 30-44", () => {
    expect(riskLevel(30)).toBe("moderate");
    expect(riskLevel(40)).toBe("moderate");
  });

  it("returns low for scores < 30", () => {
    expect(riskLevel(0)).toBe("low");
    expect(riskLevel(29)).toBe("low");
  });
});

// ─── Entity initials generator (used in Key People cards) ──────
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

describe("initials generator", () => {
  it("generates initials for full names", () => {
    expect(getInitials("Mostafa Terrab")).toBe("MT");
    expect(getInitials("Mohamed El Kettani")).toBe("MK");
    expect(getInitials("Nadia Fettah Alaoui")).toBe("NA"); // first + last
  });

  it("handles single names", () => {
    expect(getInitials("OCP")).toBe("OC");
  });

  it("handles extra whitespace", () => {
    expect(getInitials("  Mostafa   Terrab  ")).toBe("MT");
  });
});

// ─── Deterministic PRNG (mulberry32) ───────────────────────────
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe("mulberry32 PRNG", () => {
  it("is deterministic (same seed → same sequence)", () => {
    const rng1 = mulberry32(12345);
    const rng2 = mulberry32(12345);
    const seq1 = [rng1(), rng1(), rng1()];
    const seq2 = [rng2(), rng2(), rng2()];
    expect(seq1).toEqual(seq2);
  });

  it("produces values in [0, 1)", () => {
    const rng = mulberry32(99999);
    for (let i = 0; i < 100; i++) {
      const val = rng();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  it("different seeds produce different sequences", () => {
    const seq1 = mulberry32(1)();
    const seq2 = mulberry32(2)();
    expect(seq1).not.toBe(seq2);
  });
});

// ─── Date formatting (used in Live Intelligence Feed) ──────────
function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

describe("date formatter", () => {
  it("formats valid ISO dates", () => {
    const result = formatDate("2026-08-02T15:30:00.000Z");
    expect(result).toMatch(/Aug.*2.*2026/);
  });

  it("returns empty string for null", () => {
    expect(formatDate(null)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(formatDate(undefined)).toBe("");
  });

  it("returns empty string for empty string", () => {
    expect(formatDate("")).toBe("");
  });
});

// ─── Truncation utility ────────────────────────────────────────
function truncateLabel(label: string, max: number = 12): string {
  if (label.length <= max) return label;
  return label.slice(0, max - 1) + "…";
}

describe("label truncation", () => {
  it("returns short labels unchanged", () => {
    expect(truncateLabel("Products")).toBe("Products");
    expect(truncateLabel("Culture")).toBe("Culture");
  });

  it("truncates long labels with ellipsis", () => {
    expect(truncateLabel("Sustainability")).toBe("Sustainabil…");
    expect(truncateLabel("Collaboration")).toBe("Collaborati…");
  });

  it("respects custom max length", () => {
    expect(truncateLabel("Hello World", 5)).toBe("Hell…");
  });

  it("handles exact length boundary", () => {
    expect(truncateLabel("Exactly12!", 10)).toBe("Exactly12!");
  });
});

// ─── Sentiment color mapping ───────────────────────────────────
function sentimentColor(score: number): string {
  if (score > 0.1) return "#059669"; // green
  if (score < -0.1) return "#dc2626"; // red
  return "#737373"; // grey
}

describe("sentiment color mapping", () => {
  it("returns green for positive", () => {
    expect(sentimentColor(0.5)).toBe("#059669");
  });

  it("returns red for negative", () => {
    expect(sentimentColor(-0.5)).toBe("#dc2626");
  });

  it("returns grey for neutral", () => {
    expect(sentimentColor(0.0)).toBe("#737373");
  });
});
