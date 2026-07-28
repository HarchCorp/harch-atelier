/**
 * Agent 1 — Media Scraper
 *
 * Scrapes REAL Moroccan media mentions for tracked brands using z-ai web_search.
 * Classifies sentiment + pillar with GLM. Writes to data/mentions.json.
 *
 * Run: bun run agents/media-scraper.ts
 * Or via the orchestrator loop.
 */
import ZAI from "z-ai-web-dev-sdk";
import { store, type Mention } from "../src/lib/data-store";

const BRANDS = ["HarchCorp", "Attijariwafa Bank", "OCP Group", "Maroc Telecom", "BMCE Bank of Africa", "CIH Bank", "Label'Vie"];

const MEDIA_QUERY_SUFFIX =
  "site:lematin.ma OR site:leconomiste.com OR site:hespress.com OR site:telquel.ma OR site:medias24.com OR site:aujourdhui.ma OR site:le360.ma OR site:lavieeco.com OR site:jeuneafrique.com OR site:theafricareport.com";

async function classifySentiment(text: string): Promise<{ sentiment: Mention["sentiment"]; pillar: Mention["pillar"] }> {
  try {
    const zai = await ZAI.create();
    const c = await zai.chat.completions.create({
      messages: [
        {
          role: "assistant",
          content:
            "You are a reputation analyst. Classify this news headline. Reply with EXACTLY this JSON format (no other text): {\"sentiment\":\"positive|negative|neutral\",\"pillar\":\"Regulatory|Cyber|Financial|ESG|Geopolitical|Reputational\"}. Pick the pillar that best fits the topic.",
        },
        { role: "user", content: text },
      ],
      thinking: { type: "disabled" as const },
    });
    const raw = c.choices[0]?.message?.content || "";
    const match = raw.match(/\{[^}]+\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return {
        sentiment: parsed.sentiment || "neutral",
        pillar: parsed.pillar || "Reputational",
      };
    }
  } catch (e) {
    // fall through to default
  }
  return { sentiment: "neutral", pillar: "Reputational" };
}

async function scrapeBrand(brand: string): Promise<Mention[]> {
  const zai = await ZAI.create();
  const results = (await zai.functions.invoke("web_search", {
    query: `${brand} ${MEDIA_QUERY_SUFFIX}`,
    num: 6,
  })) as Array<{ title?: string; url?: string; snippet?: string; date?: string; host_name?: string }>;

  const mentions: Mention[] = [];
  for (const r of results.slice(0, 6)) {
    const title = r.title || r.snippet || "Untitled";
    const { sentiment, pillar } = await classifySentiment(title);
    mentions.push({
      id: `M-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      brand,
      title,
      url: r.url || "#",
      source: r.host_name?.replace(/^www\./, "") || "web",
      snippet: r.snippet || "",
      date: r.date || new Date().toISOString().slice(0, 10),
      sentiment,
      pillar,
      scrapedAt: new Date().toISOString(),
    });
  }
  return mentions;
}

async function main() {
  console.log("🕷️  Media Scraper — starting scrape for", BRANDS.length, "brands...");
  store.setStatus({ agentName: "media-scraper", lastRun: new Date().toISOString(), status: "running", itemsProcessed: 0 });

  let totalNew = 0;
  const allNew: Mention[] = [];
  for (const brand of BRANDS) {
    try {
      console.log(`  → scraping ${brand}...`);
      const mentions = await scrapeBrand(brand);
      allNew.push(...mentions);
      console.log(`    ${mentions.length} mentions (${mentions.filter((m) => m.sentiment === "negative").length} negative)`);
      await new Promise((r) => setTimeout(r, 1500)); // rate-limit between brands
    } catch (e) {
      console.error(`    ERROR scraping ${brand}:`, (e as Error).message);
    }
  }

  totalNew = store.addMentions(allNew);
  store.setStatus({ agentName: "media-scraper", lastRun: new Date().toISOString(), status: "success", itemsProcessed: totalNew });
  console.log(`✅ Media Scraper done — ${totalNew} new mentions added (of ${allNew.length} scraped).`);
}

main().catch((e) => {
  store.setStatus({ agentName: "media-scraper", lastRun: new Date().toISOString(), status: "error", itemsProcessed: 0, error: e.message });
  console.error("❌ Media Scraper failed:", e);
  process.exit(1);
});
