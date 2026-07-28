/**
 * Agent 3 — Reputation Scorer (HarchIQ)
 *
 * Reads mentions.json + alerts.json, calculates the composite HarchIQ score
 * per brand. Writes to data/scores.json.
 *
 * Formula: weighted composite (0-100, A+ to F)
 *   mediaSentiment  35%  — 100 - (negativeShare * 1.5)
 *   aiVisibility    25%  — simulated (8 engines, deterministic per brand)
 *   sourceDiversity 20%  — min(100, distinctSources * 15)
 *   crisisExposure  20%  — max(0, 100 - alertCount * 12)
 *
 * Run: bun run agents/reputation-scorer.ts
 */
import { store, type HarchIQEntry } from "../src/lib/data-store";

function gradeFromScore(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
}

// Deterministic per-brand AI visibility (simulated — would be real in production)
function aiVisibilityFor(brand: string): number {
  const hash = brand.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return 50 + (hash % 50); // 50-100
}

async function main() {
  console.log("📊 Reputation Scorer — calculating HarchIQ scores...");
  store.setStatus({ agentName: "reputation-scorer", lastRun: new Date().toISOString(), status: "running", itemsProcessed: 0 });

  const brands = ["HarchCorp", "Attijariwafa Bank", "OCP Group", "Maroc Telecom", "BMCE Bank of Africa", "CIH Bank", "Label'Vie"];
  const prevScores = store.getScores();
  const entries: HarchIQEntry[] = [];

  for (const brand of brands) {
    const mentions = store.getMentions(brand);
    const alerts = store.getAlerts(brand);

    const negCount = mentions.filter((m) => m.sentiment === "negative").length;
    const negativeShare = mentions.length > 0 ? (negCount / mentions.length) * 100 : 0;
    const mediaSentiment = Math.max(0, 100 - negativeShare * 1.5);
    const aiVisibility = aiVisibilityFor(brand);
    const distinctSources = new Set(mentions.map((m) => m.source)).size;
    const sourceDiversity = Math.min(100, distinctSources * 15);
    const crisisExposure = Math.max(0, 100 - alerts.length * 12);

    const score = Math.round(
      mediaSentiment * 0.35 + aiVisibility * 0.25 + sourceDiversity * 0.2 + crisisExposure * 0.2,
    );
    const grade = gradeFromScore(score);

    const prev = prevScores.find((s) => s.brand === brand);
    const trend: HarchIQEntry["trend"] = prev ? (score > prev.score + 1 ? "up" : score < prev.score - 1 ? "down" : "stable") : "stable";

    entries.push({
      brand,
      score,
      grade,
      trend,
      components: { mediaSentiment: Math.round(mediaSentiment), aiVisibility, sourceDiversity, crisisExposure },
      calculatedAt: new Date().toISOString(),
    });

    console.log(`  ${brand}: ${score} (${grade}) — neg ${negativeShare.toFixed(0)}% | ${distinctSources} sources | ${alerts.length} alerts`);
  }

  store.setScores(entries);
  store.setStatus({ agentName: "reputation-scorer", lastRun: new Date().toISOString(), status: "success", itemsProcessed: entries.length });
  console.log(`✅ Reputation Scorer done — ${entries.length} scores calculated.`);
}

main().catch((e) => {
  store.setStatus({ agentName: "reputation-scorer", lastRun: new Date().toISOString(), status: "error", itemsProcessed: 0, error: e.message });
  console.error("❌ Reputation Scorer failed:", e);
  process.exit(1);
});
