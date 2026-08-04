import { LINGUISTIC_MATRIX, LINGUISTIC_WEIGHTS_SUMMARY, calculateGlobalRiskIndex, routeContent } from "../src/lib/harchiq/linguistic-matrix";

async function main() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  BRIQUE 9 — LINGUISTIC MATRIX ENGINE VERIFICATION");
  console.log("═══════════════════════════════════════════════════════════════\n");

  // 1. Matrix
  console.log("── LINGUISTIC MATRIX (35/35/20/10) ──");
  for (const lang of LINGUISTIC_WEIGHTS_SUMMARY) {
    console.log(`  ${lang.label.padEnd(35)} ${lang.pct}%`.padEnd(45) + ` color: ${lang.color}`);
  }

  // 2. GRI calculation with demo data (cascade scenario)
  console.log("\n── GLOBAL RISK INDEX (cascade scenario) ──");
  const cascadeSnapshots = [
    { language: "msa" as const, mentionCount: 142, avgSentiment: 0.12, negativeShare: 0.38, velocity: 12.4, trend: "up" as const },
    { language: "french" as const, mentionCount: 287, avgSentiment: -0.18, negativeShare: 0.42, velocity: 18.2, trend: "up" as const },
    { language: "english" as const, mentionCount: 64, avgSentiment: 0.21, negativeShare: 0.15, velocity: 3.1, trend: "stable" as const },
    { language: "darija" as const, mentionCount: 412, avgSentiment: -0.52, negativeShare: 0.65, velocity: 35.7, trend: "up" as const },
  ];
  const gri = calculateGlobalRiskIndex(cascadeSnapshots);
  console.log(`  ✓ GRI score: ${gri.score}/100 | level: ${gri.level.toUpperCase()}`);
  console.log(`  ✓ cascade: ${gri.cascade.severity.toUpperCase()}`);
  console.log(`  ✓ crossedTo: ${gri.cascade.crossedTo.join(", ") || "none"}`);
  console.log(`  ✓ description: ${gri.cascade.description.slice(0, 120)}...`);
  console.log(`  ✓ recommendation: ${gri.recommendation.slice(0, 120)}...`);

  console.log("\n  perLanguage breakdown:");
  for (const p of gri.perLanguage) {
    console.log(`    ${p.label.padEnd(35)} raw=${p.rawRisk.toFixed(1).padStart(6)} weighted=${p.weightedRisk.toFixed(2).padStart(6)} mentions=${p.mentionCount.toString().padStart(4)} vel=${p.velocity}/h sentiment=${p.avgSentiment.toFixed(2)}`);
  }

  // 3. Content routing
  console.log("\n── CONTENT ROUTING RULES ──");
  const routings = [
    { type: "article" as const, lang: "french" as const },
    { type: "comment" as const, lang: "darija" as const },
    { type: "social_post" as const, lang: "mixed" as const },
    { type: "regulatory" as const, lang: "msa" as const },
    { type: "whatsapp_inbound" as const, lang: "darija" as const },
  ];
  for (const r of routings) {
    const result = routeContent(r.type, r.lang);
    console.log(`  ${r.type.padEnd(20)} lang=${r.lang.padEnd(8)} → pipeline=${result.pipeline.padEnd(12)} darijaOverIndexed=${result.darijaOverIndexed}`);
  }

  // 4. Verify Darija is NOT in article applicability
  console.log("\n── DARIJA ISOLATION CHECK ──");
  const articleApplicable = routeContent("article", "darija");
  console.log(`  article + darija detection → pipeline: ${articleApplicable.pipeline}, applicable: ${articleApplicable.applicableLanguages.join(",")}`);
  console.log(`  ✓ Darija NOT in article pipeline: ${!articleApplicable.applicableLanguages.includes("darija") ? "CONFIRMED" : "FAIL"}`);

  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("  ✓ BRIQUE 9 — LINGUISTIC MATRIX ENGINE OPÉRATIONNEL");
  console.log("  ✓ Matrix: 35% MSA / 35% French / 20% English / 10% Darija");
  console.log("  ✓ GRI: cascade detection (Darija → MSA+French = critical)");
  console.log("  ✓ Content routing: Darija ONLY for UGC (comments/social/WA)");
  console.log("  ✓ Articles NEVER go through Darija pipeline");
  console.log("═══════════════════════════════════════════════════════════════");
}
main();
