import { prisma } from "../src/lib/db";

async function main() {
  console.log("=== Testing RSS scraper ===\n");
  
  // Count articles before
  const before = await prisma.article.count();
  console.log(`Articles before scrape: ${before}`);
  
  // Call the cron endpoint
  try {
    const res = await fetch("http://127.0.0.1:3000/api/cron/scrape-rss");
    const data = await res.json();
    console.log(`Scrape response: ${res.status}`);
    console.log(`Feeds scraped: ${data.feedsScraped || 0}`);
    console.log(`Articles inserted: ${data.articlesInserted || 0}`);
    if (data.errors) console.log(`Errors: ${data.errors.length}`);
  } catch (e) {
    console.log("Scrape failed (server may not be running):", e instanceof Error ? e.message : String(e));
  }
  
  // Count after
  const after = await prisma.article.count();
  console.log(`\nArticles after scrape: ${after}`);
  console.log(`New articles: ${after - before}`);
  
  // Show latest articles
  const latest = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { title: true, source: true, publishedAt: true, sentimentLabel: true, companyId: true },
  });
  console.log(`\nLatest 5 articles:`);
  for (const a of latest) {
    console.log(`  [${a.sentimentLabel || "?"}] ${a.source} — ${a.title?.slice(0, 60)}`);
  }
  
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
