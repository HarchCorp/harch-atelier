// ═══════════════════════════════════════════════════════════════
//  TEST — RSS SCRAPER
//
//  Fetches ONE Moroccan RSS feed (default: Morocco World News —
//  English, most likely to succeed in a sandbox), parses it, and
//  prints the result. Useful for verifying that the new RSS pipeline
//  works against real publishers before deploying the cron.
//
//  Usage:
//     bun --ts scripts/test-rss-scrape.ts                    # default feed
//     bun --ts scripts/test-rss-scrape.ts "Hespress"          # pick a feed by name
//     bun --ts scripts/test-rss-scrape.ts --all               # try all 10 feeds
//
//  Task ID: real-rss-scrapers
// ═══════════════════════════════════════════════════════════════

import {
  MOROCCAN_FEEDS,
  scrapeFeed,
  parseRSS,
  type RSSFeed,
} from "../src/lib/scrapers/rss-scraper";
import { analyzeSentiment, extractEntities, detectLanguage } from "../src/lib/harchiq/darija";

// ─── HELPERS ──────────────────────────────────────────────────────

function fmtDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function truncate(s: string, n: number): string {
  if (!s) return "";
  return s.length > n ? s.slice(0, n) + "…" : s;
}

function printArticle(idx: number, a: {
  title: string;
  url: string;
  source: string;
  publishedAt: Date | null;
  description: string;
  content: string;
  language: string;
  urlHash: string;
}, verbose: boolean) {
  console.log("");
  console.log(`  ┌─ [${idx + 1}] ${truncate(a.title, 100)}`);
  console.log(`  │ source:     ${a.source}`);
  console.log(`  │ url:        ${truncate(a.url, 100)}`);
  console.log(`  │ published:  ${a.publishedAt ? a.publishedAt.toISOString() : "(no date)"}`);
  console.log(`  │ language:   ${a.language}`);
  console.log(`  │ urlHash:    ${a.urlHash.slice(0, 16)}…`);
  if (verbose || a.description.length < 200) {
    console.log(`  │ desc:       ${truncate(a.description, 200)}`);
  } else {
    console.log(`  │ desc:       ${truncate(a.description, 200)}`);
  }
  if (a.content) {
    console.log(`  │ content:    ${truncate(a.content, 120)} (${a.content.length} chars)`);
  } else {
    console.log(`  │ content:    (empty — feed did not include <content:encoded>)`);
  }
  console.log(`  └─`);
}

async function testOneFeed(feed: RSSFeed, verbose: boolean): Promise<{
  name: string;
  ok: boolean;
  count: number;
  durationMs: number;
  error?: string;
}> {
  console.log("");
  console.log("══════════════════════════════════════════════════════════════");
  console.log(`  FEED: ${feed.name}`);
  console.log(`  URL:  ${feed.url}`);
  console.log(`  LANG: ${feed.language}  CATEGORY: ${feed.category}`);
  console.log("══════════════════════════════════════════════════════════════");

  const start = Date.now();
  try {
    const articles = await scrapeFeed(feed);
    const durationMs = Date.now() - start;

    console.log(
      `  ✓ ${articles.length} articles parsed in ${fmtDuration(durationMs)}`,
    );

    if (articles.length === 0) {
      console.log("  (no articles — feed may be empty, blocked, or unreachable from sandbox)");
    }

    // Show up to 5 articles (or all if verbose)
    const limit = verbose ? 20 : 5;
    articles.slice(0, limit).forEach((a, i) => printArticle(i, a, verbose));

    if (articles.length > limit) {
      console.log(``);
      console.log(`  … and ${articles.length - limit} more (use --verbose to see all)`);
    }

    // ── NLP demo on the first article (if any) ──
    if (articles.length > 0) {
      const a = articles[0];
      const text = `${a.title} ${a.description}`;
      console.log("");
      console.log("  ── DARIJA NLP on first article ──");
      const detected = detectLanguage(text);
      console.log(`  language: ${detected.language} (confidence ${(detected.confidence * 100).toFixed(0)}%) — markers: ${detected.markers.slice(0, 5).join(", ") || "(none)"}`);
      const sent = analyzeSentiment(text, detected.language);
      console.log(`  sentiment: ${sent.label} (score ${sent.score.toFixed(3)}, confidence ${(sent.confidence * 100).toFixed(0)}%)`);
      if (sent.positiveHits.length > 0) console.log(`    + positive hits: ${sent.positiveHits.slice(0, 5).join(", ")}`);
      if (sent.negativeHits.length > 0) console.log(`    - negative hits: ${sent.negativeHits.slice(0, 5).join(", ")}`);
      const ents = extractEntities(text, detected.language);
      if (ents.people.length > 0) console.log(`  people: ${ents.people.slice(0, 5).join(", ")}`);
      if (ents.organizations.length > 0) console.log(`  orgs:   ${ents.organizations.slice(0, 5).join(", ")}`);
      if (ents.locations.length > 0) console.log(`  loc:    ${ents.locations.slice(0, 5).join(", ")}`);
    }

    return { name: feed.name, ok: true, count: articles.length, durationMs };
  } catch (err) {
    const durationMs = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    console.log(`  ✗ FAILED in ${fmtDuration(durationMs)}: ${message}`);
    return { name: feed.name, ok: false, count: 0, durationMs, error: message };
  }
}

// ─── PARALLEL RSS PARSER TEST (no network — uses a fake XML) ──────

function testParseRSS(): void {
  console.log("");
  console.log("══════════════════════════════════════════════════════════════");
  console.log("  PARSE-ONLY TEST — feed a synthetic RSS 2.0 + Atom blob");
  console.log("══════════════════════════════════════════════════════════════");

  const fakeFeed: RSSFeed = {
    name: "Synthetic Test Feed",
    url: "https://example.com/rss",
    language: "fr",
    category: "news",
  };

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Test Feed</title>
    <item>
      <title><![CDATA[OCP Group annonce un record de revenus pour 2025]]></title>
      <link>https://example.com/article-1</link>
      <description><![CDATA[Le groupe OCP a publié ses résultats annuels. Les revenus ont augmenté de 15%.]]></description>
      <content:encoded><![CDATA[<p>Full article body about OCP Group results.</p>]]></content:encoded>
      <pubDate>Fri, 31 Jul 2025 13:45:00 GMT</pubDate>
      <dc:creator>Test Author</dc:creator>
    </item>
    <item>
      <title>Maroc Telecom lance la 5G à Casablanca</title>
      <link>https://example.com/article-2</link>
      <description>Maroc Telecom déploie la 5G dans la métropole économique.</description>
      <pubDate>2025-07-30T09:00:00Z</pubDate>
    </item>
  </channel>
</rss>`;

  const atomXml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Atom Test Feed</title>
  <entry>
    <title>Attijariwafa Bank opens new branch in Abidjan</title>
    <link rel="alternate" href="https://example.com/atom-1" />
    <updated>2025-07-29T10:00:00Z</updated>
    <summary>Attijariwafa Bank expands its African footprint.</summary>
    <content type="html">&lt;p&gt;Full body text&lt;/p&gt;</content>
  </entry>
</feed>`;

  console.log("  Parsing RSS 2.0 (with CDATA + content:encoded + dc:creator)…");
  const rssArticles = parseRSS(rssXml, fakeFeed);
  console.log(`  → ${rssArticles.length} articles parsed`);
  rssArticles.forEach((a, i) => printArticle(i, a, true));

  console.log("");
  console.log("  Parsing Atom 1.0 (with link rel=alternate + content type=html)…");
  const atomArticles = parseRSS(atomXml, fakeFeed);
  console.log(`  → ${atomArticles.length} articles parsed`);
  atomArticles.forEach((a, i) => printArticle(i, a, true));
}

// ─── MAIN ─────────────────────────────────────────────────────────

async function main() {
  const arg = process.argv[2] || "";
  const verbose = process.argv.includes("--verbose") || process.argv.includes("-v");

  console.log("");
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║  HARCH ATELIER — RSS SCRAPER TEST                            ║");
  console.log("║  Task ID: real-rss-scrapers                                  ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log("");
  console.log(`  Configured feeds (${MOROCCAN_FEEDS.length}):`);
  MOROCCAN_FEEDS.forEach((f, i) => {
    console.log(`    ${(i + 1).toString().padStart(2)}. ${f.name.padEnd(28)} [${f.language}/${f.category}]  ${f.url}`);
  });

  // ── Step 1: parse-only test (no network) ──
  testParseRSS();

  // ── Step 2: live network test ──
  const results: Array<{ name: string; ok: boolean; count: number; durationMs: number; error?: string }> = [];

  if (arg === "--all") {
    console.log("");
    console.log("  Running live scrape on ALL 10 feeds in parallel…");
    const allResults = await Promise.all(
      MOROCCAN_FEEDS.map((f) => testOneFeed(f, verbose)),
    );
    results.push(...allResults);
  } else if (arg && !arg.startsWith("-")) {
    // Pick by name (case-insensitive substring match)
    const feed = MOROCCAN_FEEDS.find((f) =>
      f.name.toLowerCase().includes(arg.toLowerCase()),
    );
    if (!feed) {
      console.error(`  ✗ No feed matches "${arg}". Available:`);
      MOROCCAN_FEEDS.forEach((f) => console.error(`      - ${f.name}`));
      process.exit(1);
    }
    results.push(await testOneFeed(feed, verbose));
  } else {
    // Default: try Morocco World News (English, most reliable from sandbox)
    const feed =
      MOROCCAN_FEEDS.find((f) => f.name === "Morocco World News") ||
      MOROCCAN_FEEDS[0];
    results.push(await testOneFeed(feed, verbose));
  }

  // ── Summary ──
  console.log("");
  console.log("══════════════════════════════════════════════════════════════");
  console.log("  SUMMARY");
  console.log("══════════════════════════════════════════════════════════════");
  console.log("  feed                                 status   articles   duration");
  console.log("  ──────────────────────────────────── ──────── ───────── ────────");
  for (const r of results) {
    const name = r.name.padEnd(36);
    const status = r.ok ? "OK  " : "FAIL";
    const count = String(r.count).padStart(8);
    const dur = fmtDuration(r.durationMs).padStart(8);
    console.log(`  ${name} ${status}    ${count}    ${dur}${r.error ? `  (${r.error})` : ""}`);
  }
  const totalArticles = results.reduce((sum, r) => sum + r.count, 0);
  const totalOk = results.filter((r) => r.ok).length;
  console.log("");
  console.log(`  → ${totalOk}/${results.length} feeds returned data, ${totalArticles} articles total`);
  console.log("");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
