/**
 * Agent 4 — Orchestrator (the brain)
 *
 * Runs the 3 agents in sequence on a loop (every N minutes):
 *   1. media-scraper   → scrapes Moroccan media
 *   2. alert-detector  → detects crisis spikes
 *   3. reputation-scorer → calculates HarchIQ
 *
 * Run: bun run agents/orchestrator.ts
 * Runs forever (until killed). Heartbeat in data/agent-status.json.
 */
import { execSync } from "child_process";

const INTERVAL_MS = 10 * 60 * 1000; // 10 minutes between cycles

function runAgent(name: string) {
  console.log(`\n[${new Date().toISOString()}] ▶️  Running ${name}...`);
  try {
    execSync(`bun run agents/${name}.ts`, { stdio: "inherit", cwd: process.cwd() });
    console.log(`✅ ${name} completed.`);
  } catch (e) {
    console.error(`❌ ${name} failed:`, (e as Error).message);
  }
}

async function main() {
  console.log("🧠 Harch Atelier Orchestrator — starting intelligence loop");
  console.log(`   Cycle interval: ${INTERVAL_MS / 60000} min`);
  console.log(`   Agents: media-scraper → alert-detector → reputation-scorer`);
  console.log("");

  // Run immediately on start
  while (true) {
    const cycleStart = Date.now();
    console.log(`\n========== CYCLE ${new Date().toISOString()} ==========`);

    runAgent("media-scraper");
    await new Promise((r) => setTimeout(r, 2000)); // pause between agents
    runAgent("alert-detector");
    await new Promise((r) => setTimeout(r, 2000));
    runAgent("reputation-scorer");

    const elapsed = Date.now() - cycleStart;
    const wait = Math.max(0, INTERVAL_MS - elapsed);
    console.log(`\n⏳ Cycle done in ${(elapsed / 1000).toFixed(1)}s. Next cycle in ${(wait / 60000).toFixed(1)} min.`);
    await new Promise((r) => setTimeout(r, wait));
  }
}

main().catch((e) => {
  console.error("❌ Orchestrator crashed:", e);
  process.exit(1);
});
