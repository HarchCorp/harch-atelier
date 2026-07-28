/**
 * Agent 2 — Alert Detector
 *
 * Reads mentions.json, detects negative-sentiment spikes, generates
 * WhatsApp-ready crisis alerts. Writes to data/alerts.json.
 *
 * Run: bun run agents/alert-detector.ts
 */
import { store, type CrisisAlert, type Mention } from "../src/lib/data-store";

function severityFromMention(m: Mention, index: number): CrisisAlert["severity"] {
  if (index === 0 && m.sentiment === "negative") return "critical";
  if (index < 3 && m.sentiment === "negative") return "high";
  if (m.sentiment === "negative") return "medium";
  return "low";
}

function timeToImpact(severity: CrisisAlert["severity"]): number {
  return severity === "critical" ? 5 : severity === "high" ? 30 : severity === "medium" ? 120 : 480;
}

async function main() {
  console.log("🚨 Alert Detector — scanning mentions for crisis spikes...");
  store.setStatus({ agentName: "alert-detector", lastRun: new Date().toISOString(), status: "running", itemsProcessed: 0 });

  const brands = ["HarchCorp", "Attijariwafa Bank", "OCP Group", "Maroc Telecom", "BMCE Bank of Africa", "CIH Bank", "Label'Vie"];
  const allAlerts: CrisisAlert[] = [];

  for (const brand of brands) {
    const mentions = store.getMentions(brand);
    const negative = mentions.filter((m) => m.sentiment === "negative");
    const spikeDetected = negative.length > 0 && (negative.length / Math.max(mentions.length, 1)) > 0.4;

    negative.slice(0, 5).forEach((m, i) => {
      const severity = severityFromMention(m, i);
      const tti = timeToImpact(severity);
      allAlerts.push({
        id: `A-${Date.now().toString(36)}-${i}-${brand.slice(0, 3)}`,
        brand,
        severity,
        title: m.title,
        source: m.source,
        url: m.url,
        snippet: m.snippet,
        detectedAt: new Date().toISOString(),
        timeToImpact: tti,
        whatsappMessage: `🚨 ${severity.toUpperCase()} ALERT — ${brand}\n${m.title}\nSource: ${m.source}\nRespond within ${tti} min.\n${m.url}`,
      });
    });

    if (spikeDetected) {
      console.log(`  ⚠️  ${brand}: SPIKE detected (${negative.length}/${mentions.length} negative)`);
    }
  }

  store.setAlerts(allAlerts);
  store.setStatus({ agentName: "alert-detector", lastRun: new Date().toISOString(), status: "success", itemsProcessed: allAlerts.length });
  console.log(`✅ Alert Detector done — ${allAlerts.length} alerts generated.`);
}

main().catch((e) => {
  store.setStatus({ agentName: "alert-detector", lastRun: new Date().toISOString(), status: "error", itemsProcessed: 0, error: e.message });
  console.error("❌ Alert Detector failed:", e);
  process.exit(1);
});
