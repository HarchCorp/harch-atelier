// ═══════════════════════════════════════════════════════════════
//  scripts/test-sanctions.ts
//
//  Manual test script for the real sanctions screening pipeline.
//
//  Run with:
//    bun run scripts/test-sanctions.ts
//
//  What it does:
//    1. Downloads all 3 sanctions lists (OFAC, EU, UN) in parallel.
//    2. Prints entry counts + source URLs + warnings for each.
//    3. Screens "OCP Group" — a legitimate Moroccan company that
//       should be CLEAN.
//    4. Screens "Saddam Hussein" — a known sanctioned individual
//       present on all 3 lists, to verify the matcher catches real
//       matches at high similarity.
//    5. Screens a transliteration variant ("Usama bin Laden") to
//       verify fuzzy matching (Jaro-Winkler) handles spelling drift.
//
//  No DB access — purely exercises downloader.ts + matcher.ts.
// ═══════════════════════════════════════════════════════════════

import { downloadAllSanctionsLists } from "../src/lib/sanctions/downloader";
import { screenName, type ScreeningResult } from "../src/lib/sanctions/matcher";

function formatResult(label: string, result: ScreeningResult): string {
  const lines: string[] = [];
  lines.push(`\n── ${label} ─────────────────────────────────`);
  lines.push(`  Query:        "${result.query}"`);
  lines.push(`  Normalized:   "${result.normalizedQuery}"`);
  lines.push(`  Threshold:    ${result.threshold}`);
  lines.push(`  Entries screened: ${result.totalEntriesScreened.toLocaleString()}`);
  lines.push(`  Clean:        ${result.clean}`);
  lines.push(`  Matches:      ${result.matches.length}`);
  for (const m of result.matches.slice(0, 10)) {
    lines.push(
      `    - [${m.list}] ${(m.similarity * 100).toFixed(1)}%  ${m.matchedField.padEnd(5)} | ${m.type.padEnd(10)} | ${m.name}${m.program ? `  (program: ${m.program})` : ""}${m.regulation ? `  (reg: ${m.regulation})` : ""}`,
    );
  }
  if (result.matches.length > 10) {
    lines.push(`    ... and ${result.matches.length - 10} more`);
  }
  return lines.join("\n");
}

async function main() {
  console.log("=".repeat(80));
  console.log("  SANCTIONS SCREENING TEST");
  console.log("=".repeat(80));

  console.log("\n[1/3] Downloading all 3 sanctions lists in parallel...");
  const start = Date.now();
  const result = await downloadAllSanctionsLists();
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  console.log(`\nDownloaded in ${elapsed}s. Total entries: ${result.totalEntries.toLocaleString()}\n`);

  const allEntries = [
    ...result.ofac.entries,
    ...result.eu.entries,
    ...result.un.entries,
  ];

  for (const r of [result.ofac, result.eu, result.un]) {
    console.log(`  ${r.list.padEnd(5)} | ${r.entries.length.toLocaleString().padStart(7)} entries | ${(r.byteSize / 1024 / 1024).toFixed(1)} MB | ${r.sourceUrl}`);
    for (const w of r.warnings) {
      console.log(`         warn: ${w}`);
    }
  }

  console.log("\n[2/3] Screening test queries...");

  // 1. Legitimate Moroccan company — should be CLEAN.
  const ocp = screenName("OCP Group", allEntries, { threshold: 0.86 });
  console.log(formatResult("OCP Group (legitimate — expect CLEAN)", ocp));

  // 2. Known sanctioned individual — should MATCH on multiple lists.
  const saddam = screenName("Saddam Hussein", allEntries, { threshold: 0.86 });
  console.log(formatResult("Saddam Hussein (sanctioned — expect MATCH)", saddam));

  // 3. Transliteration variant — fuzzy match should catch it.
  const usama = screenName("Usama bin Laden", allEntries, { threshold: 0.86 });
  console.log(formatResult("Usama bin Laden (transliteration — expect MATCH)", usama));

  // 4. Close-to-legitimate company that should NOT match.
  const attijari = screenName("Attijariwafa Bank", allEntries, { threshold: 0.86 });
  console.log(formatResult("Attijariwafa Bank (legitimate — expect CLEAN)", attijari));

  console.log("\n[3/3] Summary");
  console.log(`  OFAC entries:  ${result.ofac.entries.length.toLocaleString()}`);
  console.log(`  EU entries:    ${result.eu.entries.length.toLocaleString()}`);
  console.log(`  UN entries:    ${result.un.entries.length.toLocaleString()}`);
  console.log(`  Total:         ${result.totalEntries.toLocaleString()}`);
  console.log(`  OCP Group:     ${ocp.clean ? "CLEAN" : "MATCH (" + ocp.matches.length + ")"} ${ocp.matches.length > 0 ? "FALSE POSITIVE" : ""}`);
  console.log(`  Saddam Hussein: ${saddam.matches.length > 0 ? "MATCH (" + saddam.matches.length + ")" : "NO MATCH (BUG)"}`);
  console.log(`  Usama bin Laden: ${usama.matches.length > 0 ? "MATCH (" + usama.matches.length + ")" : "NO MATCH"}`);
  console.log(`  Attijariwafa:  ${attijari.clean ? "CLEAN" : "MATCH (" + attijari.matches.length + ")"}`);

  const allOk =
    result.totalEntries > 1000 &&
    ocp.clean &&
    saddam.matches.length > 0 &&
    attijari.clean;

  console.log(`\n  Overall: ${allOk ? "PASS" : "INVESTIGATE"}`);
  console.log("=".repeat(80));
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
