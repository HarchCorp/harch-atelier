// ═══════════════════════════════════════════════════════════════
//  Crisis Detector — Unit Tests
//
//  Task 11 Step Z: validates the pure-function crisis detector
//  (no DB, no fetch — ideal for unit testing).
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import { detectCrisis, type CrisisInput } from "@/lib/harchiq/crisis-detector";

describe("crisis-detector", () => {
  const baseAlert = {
    id: "alert-1",
    title: "Test alert",
    source: "test",
    severity: "medium" as const,
    sentimentScore: -0.3,
    publishedAt: new Date().toISOString(),
  };

  it("returns safe level when no alerts", () => {
    const input: CrisisInput = {
      recentAlerts: [],
      baselineAlerts: [],
    };
    const result = detectCrisis(input);
    expect(result.level).toBe("safe");
    expect(result.score).toBeLessThanOrEqual(30);
  });

  it("returns elevated/warning for moderate alert volume", () => {
    const alerts = Array.from({ length: 15 }, (_, i) => ({
      ...baseAlert,
      id: `alert-${i}`,
      sentimentScore: -0.5,
    }));
    const result = detectCrisis({
      recentAlerts: alerts,
      baselineAlerts: [],
    });
    expect(result.score).toBeGreaterThan(20);
    expect(["watch", "warning", "critical"]).toContain(result.level);
  });

  it("returns critical for high volume of negative alerts", () => {
    const alerts = Array.from({ length: 50 }, (_, i) => ({
      ...baseAlert,
      id: `alert-${i}`,
      severity: "critical" as const,
      sentimentScore: -0.8,
    }));
    const result = detectCrisis({
      recentAlerts: alerts,
      baselineAlerts: [],
    });
    expect(result.score).toBeGreaterThan(60);
    expect(["warning", "critical"]).toContain(result.level);
  });

  it("factors are always non-negative", () => {
    const result = detectCrisis({
      recentAlerts: [],
      baselineAlerts: [],
    });
    for (const factor of result.factors) {
      expect(factor.value).toBeGreaterThanOrEqual(0);
    }
  });

  it("score is always in [0, 100]", () => {
    const inputs: CrisisInput[] = [
      { recentAlerts: [], baselineAlerts: [] },
      {
        recentAlerts: Array.from({ length: 100 }, (_, i) => ({
          ...baseAlert,
          id: `a-${i}`,
          severity: "critical" as const,
          sentimentScore: -1,
        })),
        baselineAlerts: [],
      },
    ];
    for (const input of inputs) {
      const result = detectCrisis(input);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    }
  });
});
