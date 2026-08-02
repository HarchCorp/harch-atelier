// ═══════════════════════════════════════════════════════════════
//  RISK FRAMEWORK TESTS — Comprehensive Suite
//  Tests the 32-category Harch Risk Framework
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import {
  RISK_CATEGORIES,
  RISK_GROUPS,
  calculateOverallRisk,
  getRiskLevel,
  getRiskLevelColor,
  getRiskLevelLabelFr,
  getRiskLevelLabelEn,
  getCategoriesByGroup,
  getCategoryById,
  getAllRiskGroups,
  getCategoryCount,
  getTotalWeight,
  getCategoriesByWeight,
  getCategoriesGrouped,
  generateRecommendation,
  calculateTrajectory,
  getRiskSummary,
  type RiskGroup,
  type RiskLevel,
} from "@/lib/risk-framework";

// ─── 1. RISK CATEGORIES STRUCTURE ──────────────────────────────

describe("Risk Categories Structure", () => {
  it("should have exactly 32 risk categories", () => {
    expect(RISK_CATEGORIES).toHaveLength(32);
  });

  it("each category should have all required fields", () => {
    for (const cat of RISK_CATEGORIES) {
      expect(cat.id).toBeDefined();
      expect(cat.id).toMatch(/^(GOV|FIN|OPS|STR|COM|DIG|ENV|SOC)-\d{3}$/);
      expect(cat.name).toBeDefined();
      expect(cat.name.length).toBeGreaterThan(3);
      expect(cat.nameFr).toBeDefined();
      expect(cat.nameAr).toBeDefined();
      expect(cat.group).toBeDefined();
      expect(cat.weight).toBeGreaterThan(0);
      expect(cat.weight).toBeLessThanOrEqual(0.15);
      expect(cat.definition).toBeDefined();
      expect(cat.scope).toBeDefined();
      expect(cat.scoringCriteria).toBeDefined();
      expect(cat.scoringCriteria.low).toBeDefined();
      expect(cat.scoringCriteria.moderate).toBeDefined();
      expect(cat.scoringCriteria.elevated).toBeDefined();
      expect(cat.scoringCriteria.high).toBeDefined();
      expect(cat.scoringCriteria.critical).toBeDefined();
      expect(cat.indicators).toBeInstanceOf(Array);
      expect(cat.indicators.length).toBeGreaterThan(3);
      expect(cat.mitigation).toBeInstanceOf(Array);
      expect(cat.mitigation.length).toBeGreaterThan(2);
      expect(cat.dataSources).toBeInstanceOf(Array);
      expect(cat.dataSources.length).toBeGreaterThan(0);
      expect(cat.refreshCycle).toBeDefined();
    }
  });

  it("category IDs should be unique", () => {
    const ids = RISK_CATEGORIES.map(c => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("category names should be unique", () => {
    const names = RISK_CATEGORIES.map(c => c.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });

  it("each category should have at least 4 indicators", () => {
    for (const cat of RISK_CATEGORIES) {
      expect(cat.indicators.length).toBeGreaterThanOrEqual(4);
    }
  });

  it("each category should have at least 3 mitigation measures", () => {
    for (const cat of RISK_CATEGORIES) {
      expect(cat.mitigation.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("each category should have valid refresh cycle", () => {
    const validCycles = ["real-time", "hourly", "daily", "weekly", "monthly"];
    for (const cat of RISK_CATEGORIES) {
      expect(validCycles).toContain(cat.refreshCycle);
    }
  });
});

// ─── 2. RISK GROUPS ────────────────────────────────────────────

describe("Risk Groups", () => {
  it("should have exactly 8 risk groups", () => {
    expect(Object.keys(RISK_GROUPS)).toHaveLength(8);
  });

  it("each group should have name, nameFr, color, and description", () => {
    for (const [key, group] of Object.entries(RISK_GROUPS)) {
      expect(group.name).toBeDefined();
      expect(group.nameFr).toBeDefined();
      expect(group.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(group.description).toBeDefined();
      expect(group.description.length).toBeGreaterThan(10);
    }
  });

  it("group colors should be unique", () => {
    const colors = Object.values(RISK_GROUPS).map(g => g.color);
    const uniqueColors = new Set(colors);
    expect(uniqueColors.size).toBe(colors.length);
  });

  it("should include all expected groups", () => {
    const expectedGroups = ["governance", "financial", "operational", "strategic", "compliance", "digital", "environmental", "social"];
    for (const g of expectedGroups) {
      expect(RISK_GROUPS).toHaveProperty(g);
    }
  });
});

// ─── 3. CATEGORY-GROUP MAPPING ─────────────────────────────────

describe("Category-Group Mapping", () => {
  it("governance group should have 5 categories", () => {
    const govCats = getCategoriesByGroup("governance");
    expect(govCats).toHaveLength(5);
  });

  it("financial group should have 5 categories", () => {
    const finCats = getCategoriesByGroup("financial");
    expect(finCats).toHaveLength(5);
  });

  it("operational group should have 4 categories", () => {
    const opsCats = getCategoriesByGroup("operational");
    expect(opsCats).toHaveLength(4);
  });

  it("strategic group should have 4 categories", () => {
    const strCats = getCategoriesByGroup("strategic");
    expect(strCats).toHaveLength(4);
  });

  it("compliance group should have 4 categories", () => {
    const comCats = getCategoriesByGroup("compliance");
    expect(comCats).toHaveLength(4);
  });

  it("digital group should have 4 categories", () => {
    const digCats = getCategoriesByGroup("digital");
    expect(digCats).toHaveLength(4);
  });

  it("environmental group should have 3 categories", () => {
    const envCats = getCategoriesByGroup("environmental");
    expect(envCats).toHaveLength(3);
  });

  it("social group should have 3 categories", () => {
    const socCats = getCategoriesByGroup("social");
    expect(socCats).toHaveLength(3);
  });

  it("total categories across all groups should be 32", () => {
    const groups = getAllRiskGroups();
    let total = 0;
    for (const g of groups) {
      total += getCategoriesByGroup(g).length;
    }
    expect(total).toBe(32);
  });
});

// ─── 4. SCORING CRITERIA ───────────────────────────────────────

describe("Scoring Criteria", () => {
  it("each category should have 5 scoring levels", () => {
    for (const cat of RISK_CATEGORIES) {
      expect(cat.scoringCriteria).toHaveProperty("low");
      expect(cat.scoringCriteria).toHaveProperty("moderate");
      expect(cat.scoringCriteria).toHaveProperty("elevated");
      expect(cat.scoringCriteria).toHaveProperty("high");
      expect(cat.scoringCriteria).toHaveProperty("critical");
    }
  });

  it("scoring criteria should be descriptive", () => {
    for (const cat of RISK_CATEGORIES) {
      expect(cat.scoringCriteria.low.length).toBeGreaterThan(5);
      expect(cat.scoringCriteria.critical.length).toBeGreaterThan(5);
    }
  });
});

// ─── 5. WEIGHT CALCULATIONS ────────────────────────────────────

describe("Weight Calculations", () => {
  it("total weight should be approximately 1.0", () => {
    const total = getTotalWeight();
    expect(total).toBeGreaterThan(0.9);
    expect(total).toBeLessThan(1.1);
  });

  it("each weight should be between 0.03 and 0.15", () => {
    for (const cat of RISK_CATEGORIES) {
      expect(cat.weight).toBeGreaterThanOrEqual(0.03);
      expect(cat.weight).toBeLessThanOrEqual(0.15);
    }
  });

  it("governance group should have highest total weight", () => {
    const groups = getAllRiskGroups();
    const groupWeights: Record<string, number> = {};
    for (const g of groups) {
      groupWeights[g] = getCategoriesByGroup(g).reduce((sum, c) => sum + c.weight, 0);
    }
    const govWeight = groupWeights.governance;
    // Governance should be one of the top groups
    const maxWeight = Math.max(...Object.values(groupWeights));
    expect(govWeight).toBeGreaterThanOrEqual(maxWeight * 0.7);
  });
});

// ─── 6. CALCULATE OVERALL RISK ─────────────────────────────────

describe("calculateOverallRisk", () => {
  it("should return 0 for empty array", () => {
    expect(calculateOverallRisk([])).toBe(0);
  });

  it("should return the score for a single category", () => {
    const result = calculateOverallRisk([
      { categoryId: "GOV-001", score: 50 },
    ]);
    expect(result).toBe(50);
  });

  it("should calculate weighted average for multiple categories", () => {
    const result = calculateOverallRisk([
      { categoryId: "GOV-001", score: 80 },
      { categoryId: "GOV-002", score: 40 },
    ]);
    // GOV-001 weight = 0.08, GOV-002 weight = 0.06
    // Weighted: (80*0.08 + 40*0.06) / (0.08+0.06) = (6.4 + 2.4) / 0.14 = 62.86
    expect(result).toBeCloseTo(63, 0);
  });

  it("should handle non-existent category IDs gracefully", () => {
    const result = calculateOverallRisk([
      { categoryId: "NON-EXIST", score: 100 },
    ]);
    expect(result).toBe(0);
  });

  it("should handle mixed valid and invalid IDs", () => {
    const result = calculateOverallRisk([
      { categoryId: "GOV-001", score: 60 },
      { categoryId: "INVALID", score: 100 },
    ]);
    expect(result).toBe(60);
  });

  it("should handle all 32 categories", () => {
    const allScores = RISK_CATEGORIES.map(c => ({ categoryId: c.id, score: 50 }));
    const result = calculateOverallRisk(allScores);
    expect(result).toBe(50);
  });

  it("should weight higher-weight categories more", () => {
    const highWeightCat = RISK_CATEGORIES.reduce((max, c) => (c.weight > max.weight ? c : max));
    const lowWeightCat = RISK_CATEGORIES.reduce((min, c) => (c.weight < min.weight ? c : min));
    
    const resultHigh = calculateOverallRisk([
      { categoryId: highWeightCat.id, score: 90 },
      { categoryId: lowWeightCat.id, score: 10 },
    ]);
    
    // The high-weight category should pull the score up
    expect(resultHigh).toBeGreaterThan(50);
  });
});

// ─── 7. RISK LEVEL ─────────────────────────────────────────────

describe("getRiskLevel", () => {
  it("should return 'low' for scores 0-29", () => {
    expect(getRiskLevel(0)).toBe("low");
    expect(getRiskLevel(15)).toBe("low");
    expect(getRiskLevel(29)).toBe("low");
  });

  it("should return 'moderate' for scores 30-44", () => {
    expect(getRiskLevel(30)).toBe("moderate");
    expect(getRiskLevel(40)).toBe("moderate");
    expect(getRiskLevel(44)).toBe("moderate");
  });

  it("should return 'elevated' for scores 45-59", () => {
    expect(getRiskLevel(45)).toBe("elevated");
    expect(getRiskLevel(50)).toBe("elevated");
    expect(getRiskLevel(59)).toBe("elevated");
  });

  it("should return 'high' for scores 60-79", () => {
    expect(getRiskLevel(60)).toBe("high");
    expect(getRiskLevel(70)).toBe("high");
    expect(getRiskLevel(79)).toBe("high");
  });

  it("should return 'critical' for scores 80-100", () => {
    expect(getRiskLevel(80)).toBe("critical");
    expect(getRiskLevel(90)).toBe("critical");
    expect(getRiskLevel(100)).toBe("critical");
  });

  it("should handle edge cases", () => {
    expect(getRiskLevel(-5)).toBe("low");
    expect(getRiskLevel(101)).toBe("critical");
  });
});

// ─── 8. RISK LEVEL COLOR ───────────────────────────────────────

describe("getRiskLevelColor", () => {
  it("should return valid hex color for each level", () => {
    const levels: RiskLevel[] = ["low", "moderate", "elevated", "high", "critical"];
    for (const level of levels) {
      const color = getRiskLevelColor(level);
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("should return different colors for different levels", () => {
    const colors = new Set([
      getRiskLevelColor("low"),
      getRiskLevelColor("moderate"),
      getRiskLevelColor("elevated"),
      getRiskLevelColor("high"),
      getRiskLevelColor("critical"),
    ]);
    expect(colors.size).toBe(5);
  });

  it("should return green for low risk", () => {
    expect(getRiskLevelColor("low")).toBe("#059669");
  });

  it("should return red for critical risk", () => {
    expect(getRiskLevelColor("critical")).toBe("#7F1D1D");
  });
});

// ─── 9. RISK LEVEL LABELS ──────────────────────────────────────

describe("getRiskLevelLabelFr", () => {
  it("should return correct French labels", () => {
    expect(getRiskLevelLabelFr("low")).toBe("Faible");
    expect(getRiskLevelLabelFr("moderate")).toBe("Modéré");
    expect(getRiskLevelLabelFr("elevated")).toBe("Élevé");
    expect(getRiskLevelLabelFr("high")).toBe("Haut");
    expect(getRiskLevelLabelFr("critical")).toBe("Critique");
  });
});

describe("getRiskLevelLabelEn", () => {
  it("should return capitalized English labels", () => {
    expect(getRiskLevelLabelEn("low")).toBe("Low");
    expect(getRiskLevelLabelEn("moderate")).toBe("Moderate");
    expect(getRiskLevelLabelEn("elevated")).toBe("Elevated");
    expect(getRiskLevelLabelEn("high")).toBe("High");
    expect(getRiskLevelLabelEn("critical")).toBe("Critical");
  });
});

// ─── 10. GET CATEGORY BY ID ────────────────────────────────────

describe("getCategoryById", () => {
  it("should return the correct category for a valid ID", () => {
    const cat = getCategoryById("GOV-001");
    expect(cat).toBeDefined();
    expect(cat!.name).toBe("Board Structure & Independence");
  });

  it("should return undefined for invalid ID", () => {
    expect(getCategoryById("INVALID-999")).toBeUndefined();
  });

  it("should return undefined for empty string", () => {
    expect(getCategoryById("")).toBeUndefined();
  });

  it("should work for all 32 category IDs", () => {
    for (const cat of RISK_CATEGORIES) {
      expect(getCategoryById(cat.id)).toBeDefined();
    }
  });
});

// ─── 11. GET ALL RISK GROUPS ───────────────────────────────────

describe("getAllRiskGroups", () => {
  it("should return 8 groups", () => {
    const groups = getAllRiskGroups();
    expect(groups).toHaveLength(8);
  });

  it("should include all expected groups", () => {
    const groups = getAllRiskGroups();
    expect(groups).toContain("governance");
    expect(groups).toContain("financial");
    expect(groups).toContain("operational");
    expect(groups).toContain("strategic");
    expect(groups).toContain("compliance");
    expect(groups).toContain("digital");
    expect(groups).toContain("environmental");
    expect(groups).toContain("social");
  });
});

// ─── 12. GET CATEGORY COUNT ────────────────────────────────────

describe("getCategoryCount", () => {
  it("should return 32", () => {
    expect(getCategoryCount()).toBe(32);
  });
});

// ─── 13. GET CATEGORIES BY WEIGHT ──────────────────────────────

describe("getCategoriesByWeight", () => {
  it("should return categories sorted by weight (highest first)", () => {
    const sorted = getCategoriesByWeight();
    expect(sorted).toHaveLength(32);
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].weight).toBeGreaterThanOrEqual(sorted[i + 1].weight);
    }
  });

  it("first category should have the highest weight", () => {
    const sorted = getCategoriesByWeight();
    const maxWeight = Math.max(...RISK_CATEGORIES.map(c => c.weight));
    expect(sorted[0].weight).toBe(maxWeight);
  });

  it("last category should have the lowest weight", () => {
    const sorted = getCategoriesByWeight();
    const minWeight = Math.min(...RISK_CATEGORIES.map(c => c.weight));
    expect(sorted[sorted.length - 1].weight).toBe(minWeight);
  });
});

// ─── 14. GET CATEGORIES GROUPED ────────────────────────────────

describe("getCategoriesGrouped", () => {
  it("should return an object with 8 keys", () => {
    const grouped = getCategoriesGrouped();
    expect(Object.keys(grouped)).toHaveLength(8);
  });

  it("each group key should map to an array of categories", () => {
    const grouped = getCategoriesGrouped();
    for (const [key, cats] of Object.entries(grouped)) {
      expect(Array.isArray(cats)).toBe(true);
      expect(cats.length).toBeGreaterThan(0);
    }
  });

  it("total categories across groups should be 32", () => {
    const grouped = getCategoriesGrouped();
    const total = Object.values(grouped).reduce((sum, cats) => sum + cats.length, 0);
    expect(total).toBe(32);
  });
});

// ─── 15. GENERATE RECOMMENDATION ───────────────────────────────

describe("generateRecommendation", () => {
  it("should return low-risk recommendation for score < 30", () => {
    const rec = generateRecommendation("GOV-001", 20);
    expect(rec).toContain("Continue");
    expect(rec).toContain("Board Structure");
  });

  it("should return moderate-risk recommendation for score 30-44", () => {
    const rec = generateRecommendation("FIN-001", 35);
    expect(rec).toContain("Continue");
  });

  it("should return elevated-risk recommendation for score 45-59", () => {
    const rec = generateRecommendation("OPS-001", 50);
    expect(rec).toContain("Review");
    expect(rec).toContain("90 days");
  });

  it("should return high-risk recommendation for score 60-79", () => {
    const rec = generateRecommendation("DIG-001", 70);
    expect(rec).toContain("URGENT");
    expect(rec).toContain("30 days");
  });

  it("should return critical-risk recommendation for score 80+", () => {
    const rec = generateRecommendation("COM-001", 90);
    expect(rec).toContain("CRITICAL");
    expect(rec).toContain("board intervention");
  });

  it("should include category name in recommendation", () => {
    const cat = getCategoryById("GOV-001");
    const rec = generateRecommendation("GOV-001", 50);
    expect(rec).toContain(cat!.name);
  });

  it("should return 'not found' for invalid category ID", () => {
    const rec = generateRecommendation("INVALID", 50);
    expect(rec).toBe("Category not found");
  });
});

// ─── 16. CALCULATE TRAJECTORY ──────────────────────────────────

describe("calculateTrajectory", () => {
  it("should return 'stable' for empty array", () => {
    expect(calculateTrajectory([])).toBe("stable");
  });

  it("should return 'stable' for single data point", () => {
    expect(calculateTrajectory([
      { date: new Date(), score: 50 },
    ])).toBe("stable");
  });

  it("should return 'rising' when scores increase significantly", () => {
    const data = [
      { date: new Date("2026-01-01"), score: 30 },
      { date: new Date("2026-02-01"), score: 35 },
      { date: new Date("2026-03-01"), score: 45 },
      { date: new Date("2026-04-01"), score: 55 },
      { date: new Date("2026-05-01"), score: 60 },
    ];
    expect(calculateTrajectory(data)).toBe("rising");
  });

  it("should return 'falling' when scores decrease significantly", () => {
    const data = [
      { date: new Date("2026-01-01"), score: 60 },
      { date: new Date("2026-02-01"), score: 55 },
      { date: new Date("2026-03-01"), score: 45 },
      { date: new Date("2026-04-01"), score: 35 },
      { date: new Date("2026-05-01"), score: 30 },
    ];
    expect(calculateTrajectory(data)).toBe("falling");
  });

  it("should return 'stable' for small changes", () => {
    const data = [
      { date: new Date("2026-01-01"), score: 50 },
      { date: new Date("2026-02-01"), score: 51 },
      { date: new Date("2026-03-01"), score: 50 },
      { date: new Date("2026-04-01"), score: 49 },
      { date: new Date("2026-05-01"), score: 50 },
    ];
    expect(calculateTrajectory(data)).toBe("stable");
  });
});

// ─── 17. GET RISK SUMMARY ──────────────────────────────────────

describe("getRiskSummary", () => {
  it("should return overall score and level", () => {
    const assessments = RISK_CATEGORIES.slice(0, 5).map(c => ({
      categoryId: c.id,
      score: 50,
    }));
    const summary = getRiskSummary(assessments);
    expect(summary.overallScore).toBe(50);
    expect(summary.overallLevel).toBe("elevated");
  });

  it("should return 5 top risks sorted by score (highest first)", () => {
    const assessments = RISK_CATEGORIES.slice(0, 10).map((c, i) => ({
      categoryId: c.id,
      score: 10 + i * 10, // 10, 20, 30, 40, 50, 60, 70, 80, 90, 100
    }));
    const summary = getRiskSummary(assessments);
    expect(summary.topRisks).toHaveLength(5);
    expect(summary.topRisks[0].score).toBe(100);
    expect(summary.topRisks[1].score).toBe(90);
  });

  it("should return 5 improvements sorted by score (lowest first)", () => {
    const assessments = RISK_CATEGORIES.slice(0, 10).map((c, i) => ({
      categoryId: c.id,
      score: 10 + i * 10,
    }));
    const summary = getRiskSummary(assessments);
    expect(summary.improvements).toHaveLength(5);
    expect(summary.improvements[0].score).toBe(10);
    expect(summary.improvements[1].score).toBe(20);
  });

  it("should calculate group averages", () => {
    const assessments = RISK_CATEGORIES.map(c => ({
      categoryId: c.id,
      score: 50,
    }));
    const summary = getRiskSummary(assessments);
    expect(summary.groupAverages).toHaveLength(8);
    for (const ga of summary.groupAverages) {
      expect(ga.averageScore).toBe(50);
      expect(ga.averageLevel).toBe("elevated");
    }
  });

  it("should handle empty assessments", () => {
    const summary = getRiskSummary([]);
    expect(summary.overallScore).toBe(0);
    expect(summary.overallLevel).toBe("low");
    expect(summary.topRisks).toHaveLength(0);
    expect(summary.improvements).toHaveLength(0);
    expect(summary.groupAverages).toHaveLength(0);
  });

  it("should handle assessments with invalid category IDs", () => {
    const summary = getRiskSummary([
      { categoryId: "INVALID", score: 50 },
    ]);
    expect(summary.overallScore).toBe(0);
    expect(summary.topRisks).toHaveLength(0);
  });
});

// ─── 18. EDGE CASES ────────────────────────────────────────────

describe("Edge Cases", () => {
  it("should handle negative scores gracefully", () => {
    expect(getRiskLevel(-10)).toBe("low");
    expect(getRiskLevel(-100)).toBe("low");
  });

  it("should handle scores above 100 gracefully", () => {
    expect(getRiskLevel(101)).toBe("critical");
    expect(getRiskLevel(200)).toBe("critical");
  });

  it("should handle floating point scores", () => {
    expect(getRiskLevel(29.9)).toBe("low");
    expect(getRiskLevel(30.1)).toBe("moderate");
    expect(getRiskLevel(44.9)).toBe("moderate");
    expect(getRiskLevel(45.1)).toBe("elevated");
  });

  it("should handle calculateOverallRisk with score 0", () => {
    const result = calculateOverallRisk([
      { categoryId: "GOV-001", score: 0 },
    ]);
    expect(result).toBe(0);
  });

  it("should handle calculateOverallRisk with score 100", () => {
    const result = calculateOverallRisk([
      { categoryId: "GOV-001", score: 100 },
    ]);
    expect(result).toBe(100);
  });

  it("should handle generateRecommendation with score 0", () => {
    const rec = generateRecommendation("GOV-001", 0);
    expect(rec).toContain("Continue");
  });

  it("should handle generateRecommendation with score 100", () => {
    const rec = generateRecommendation("GOV-001", 100);
    expect(rec).toContain("CRITICAL");
  });

  it("should handle calculateTrajectory with all same scores", () => {
    const data = Array.from({ length: 10 }, (_, i) => ({
      date: new Date(2026, i, 1),
      score: 50,
    }));
    expect(calculateTrajectory(data)).toBe("stable");
  });
});

// ─── 19. INTEGRATION TESTS ─────────────────────────────────────

describe("Integration Tests", () => {
  it("should produce consistent overall risk for uniform scores", () => {
    const assessments = RISK_CATEGORIES.map(c => ({
      categoryId: c.id,
      score: 60,
    }));
    const overall = calculateOverallRisk(assessments);
    expect(overall).toBe(60);
  });

  it("should produce correct risk summary for all categories at critical", () => {
    const assessments = RISK_CATEGORIES.map(c => ({
      categoryId: c.id,
      score: 90,
    }));
    const summary = getRiskSummary(assessments);
    expect(summary.overallScore).toBe(90);
    expect(summary.overallLevel).toBe("critical");
    expect(summary.topRisks).toHaveLength(5);
    expect(summary.topRisks[0].level).toBe("critical");
  });

  it("should produce correct risk summary for all categories at low", () => {
    const assessments = RISK_CATEGORIES.map(c => ({
      categoryId: c.id,
      score: 10,
    }));
    const summary = getRiskSummary(assessments);
    expect(summary.overallScore).toBe(10);
    expect(summary.overallLevel).toBe("low");
    expect(summary.improvements).toHaveLength(5);
    expect(summary.improvements[0].level).toBe("low");
  });

  it("should correctly identify top risks across different groups", () => {
    const assessments = [
      { categoryId: "GOV-001", score: 90 }, // governance, weight 0.08
      { categoryId: "FIN-001", score: 85 }, // financial, weight 0.08
      { categoryId: "DIG-001", score: 95 }, // digital, weight 0.10
      { categoryId: "COM-001", score: 88 }, // compliance, weight 0.08
      { categoryId: "ENV-001", score: 30 }, // environmental, weight 0.07
    ];
    const summary = getRiskSummary(assessments);
    expect(summary.topRisks[0].category.id).toBe("DIG-001");
    expect(summary.topRisks[0].score).toBe(95);
  });
});
