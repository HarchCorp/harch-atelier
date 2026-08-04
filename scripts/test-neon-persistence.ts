import { prisma } from "../src/lib/db";
import { scrapeHespressComments } from "../src/lib/scrapers/hespress-comments";
import { persistScrapedComments, persistInboundMessage, getLocalDbStats, readRecentComments, readRecentInboundMessages } from "../src/lib/persistence";
import { runInboundPipeline } from "../src/lib/whatsapp/inbound-pipeline";

async function main() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  NEON PERSISTENCE — TEST END-TO-END (direct, no HTTP)");
  console.log("═══════════════════════════════════════════════════════════════\n");

  // Test 1: Hespress scrape → persist to Neon
  console.log("── TEST 1: Hespress scrape → persist to Neon ──");
  const scrapeResult = await scrapeHespressComments(
    "https://hespress.com/articles/1372457.html",
    { forceMock: true, maxComments: 5 }
  );
  console.log(`  scraped: ${scrapeResult.commentsScraped} comments (source: ${scrapeResult.source})`);
  const persistResult = await persistScrapedComments(
    "https://hespress.com/articles/1372457.html",
    scrapeResult.articleId,
    scrapeResult.source,
    scrapeResult
  );
  console.log(`  persisted: ${persistResult.persisted} | comments: ${persistResult.commentsPersisted}`);

  // Test 2: WhatsApp inbound → persist to Neon
  console.log("\n── TEST 2: WhatsApp inbound → persist to Neon ──");
  const pipelineResult = runInboundPipeline({
    from: "+212600000000",
    fromName: "Salma Bennani (Dircom)",
    to: "whatsapp:+14155238886",
    body: "Boycott appel sur Facebook contre Attijariwafa, ça viralise sur WhatsApp",
    twilioMessageSid: `NEON_${Date.now().toString(36)}`,
    twilioWaId: "212600000000",
    isDemo: true,
  });
  console.log(`  crisisScore: ${pipelineResult.analysis.crisisScore} | critical: ${pipelineResult.isCritical}`);
  const msgPersist = await persistInboundMessage(pipelineResult.message);
  console.log(`  persisted: ${msgPersist.persisted} | dbId: ${msgPersist.dbId}`);

  // Test 3: Read back from Neon
  console.log("\n── TEST 3: Read back from Neon ──");
  const stats = await getLocalDbStats();
  console.log(`  available: ${stats.available}`);
  console.log(`  articles: ${stats.articleCount} | comments: ${stats.commentCount}`);
  console.log(`  inbound msgs: ${stats.inboundMessageCount} | flagged: ${stats.flaggedMessageCount}`);

  const recentComments = await readRecentComments(3);
  console.log(`\n  recent comments (${recentComments.length}):`);
  for (const c of recentComments) {
    console.log(`    [${c.language}] ${c.sentimentPolarity} (${c.sentimentScore.toFixed(2)}) sarcasm=${c.sarcasmDetected}`);
  }

  const recentMsgs = await readRecentInboundMessages(3);
  console.log(`\n  recent inbound (${recentMsgs.length}):`);
  for (const m of recentMsgs) {
    console.log(`    [${m.status}] crisis=${m.crisisScore} from=${m.fromPhone}`);
  }

  console.log("\n═══════════════════════════════════════════════════════════════");
  if (stats.available && stats.commentCount > 0 && stats.inboundMessageCount > 0) {
    console.log("  ✓ NEON POSTGRESQL PERSISTANCE OPÉRATIONNELLE");
    console.log(`  ✓ ${stats.commentCount} commentaires Hespress dans Neon`);
    console.log(`  ✓ ${stats.inboundMessageCount} messages WhatsApp dans Neon`);
    console.log("  ✓ Base cloud persistante");
    console.log("═══════════════════════════════════════════════════════════════");
  } else {
    console.log("  ✗ ÉCHEC");
    console.log("═══════════════════════════════════════════════════════════════");
    process.exit(1);
  }
  await prisma.$disconnect();
}
main().catch(e => { console.error("FATAL:", e); process.exit(1); });
