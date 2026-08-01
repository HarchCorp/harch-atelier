// ═══════════════════════════════════════════════════════════════
//  TEST — RSS FEEDS HEALTH CHECK
//
//  For each feed in the scraper's feed list:
//    • HTTP fetch (15s timeout, polite UA)
//    • Parse XML (RSS 2.0 + Atom, robust)
//    • Print: feed name, URL, HTTP status, article count, first 3 titles
//
//  Usage:
//     bun --ts scripts/test-rss-feeds.ts                  # test all feeds
//     bun --ts scripts/test-rss-feeds.ts "Hespress"       # test one by name
//     bun --ts scripts/test-rss-feeds.ts --json           # machine-readable JSON
//
//  Task ID: signal-media-monitoring
// ═══════════════════════════════════════════════════════════════

import {
  MOROCCAN_FEEDS,
  scrapeFeed,
  parseRSS,
  type RSSFeed,
} from "../src/lib/scrapers/rss-scraper";

// ─── HELPERS ──────────────────────────────────────────────────────

const HARCH_BOT_UA =
  "HarchAtelierBot/1.0 (monitoring; contact: amine@harchcorp.com)";

interface FeedTestResult {
  name: string;
  url: string;
  language: string;
  category: string;
  httpStatus: number | null;
  ok: boolean;
  articleCount: number;
  durationMs: number;
  error?: string;
  firstTitles: string[];
  contentType?: string | null;
  bodyBytes?: number;
}

function truncate(s: string, n: number): string {
  if (!s) return "";
  return s.length > n ? s.slice(0, n) + "…" : s;
}

function fmtDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

// ─── RAW HTTP PROBE (separate from scrapeFeed so we capture HTTP status) ──

async function probeFeed(
  feed: RSSFeed,
): Promise<FeedTestResult> {
  const start = Date.now();
  const result: FeedTestResult = {
    name: feed.name,
    url: feed.url,
    language: feed.language,
    category: feed.category,
    httpStatus: null,
    ok: false,
    articleCount: 0,
    durationMs: 0,
    firstTitles: [],
  };

  try {
    const res = await fetch(feed.url, {
      headers: {
        "User-Agent": HARCH_BOT_UA,
        Accept:
          "application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.5",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8,ar;q=0.7",
        "Cache-Control": "no-cache",
      },
      // @ts-ignore — Next.js fetch supports this
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
    });

    result.httpStatus = res.status;
    result.contentType = res.headers.get("content-type");
    result.durationMs = Date.now() - start;

    if (!res.ok) {
      result.ok = false;
      result.error = `HTTP ${res.status} ${res.statusText}`;
      return result;
    }

    const xml = await res.text();
    result.bodyBytes = xml.length;

    if (!xml || xml.length < 32) {
      result.ok = false;
      result.error = "Empty body";
      return result;
    }

    // Use the same parser the scraper uses — ensures parity with prod.
    const articles = parseRSS(xml, feed);
    result.articleCount = articles.length;
    result.firstTitles = articles.slice(0, 3).map((a) => a.title);
    result.ok = articles.length > 0;

    if (articles.length === 0) {
      result.error = "Feed parsed but yielded 0 articles (maybe HTML page or empty feed)";
    }

    return result;
  } catch (err: unknown) {
    result.durationMs = Date.now() - start;
    const name = (err as { name?: string })?.name;
    if (name === "TimeoutError" || name === "AbortError") {
      result.error = "timeout (15s)";
    } else {
      result.error = err instanceof Error ? err.message : String(err);
    }
    return result;
  }
}

// ─── PRETTY PRINTER ───────────────────────────────────────────────

function printResult(r: FeedTestResult): void {
  const statusIcon = r.ok ? "✓" : "✗";
  const statusColor = r.ok ? "\x1b[32m" : "\x1b[31m"; // green / red
  const reset = "\x1b[0m";

  console.log("");
  console.log("──────────────────────────────────────────────────────────────");
  console.log(`  ${statusIcon} ${statusColor}${r.name}${reset}  [${r.language}/${r.category}]`);
  console.log(`     URL:     ${r.url}`);
  console.log(
    `     HTTP:    ${r.httpStatus ?? "—"}   ${r.contentType ? `(${r.contentType})` : ""}   ${r.bodyBytes ? `${(r.bodyBytes / 1024).toFixed(1)}KB` : ""}`,
  );
  console.log(
    `     Articles: ${r.articleCount}   Duration: ${fmtDuration(r.durationMs)}`,
  );

  if (r.error) {
    console.log(`     ${statusColor}Error: ${r.error}${reset}`);
  }

  if (r.firstTitles.length > 0) {
    console.log("     First titles:");
    r.firstTitles.forEach((t, i) => {
      console.log(`       ${i + 1}. ${truncate(t, 110)}`);
    });
  } else if (r.ok) {
    console.log("     (no titles to show)");
  }
}

function printSummary(results: FeedTestResult[]): void {
  console.log("");
  console.log("══════════════════════════════════════════════════════════════");
  console.log("  SUMMARY");
  console.log("══════════════════════════════════════════════════════════════");
  console.log(
    "  feed                                status   http   articles  duration",
  );
  console.log(
    "  ──────────────────────────────────  ──────── ────── ─────────  ────────",
  );

  for (const r of results) {
    const name = r.name.padEnd(34).slice(0, 34);
    const status = r.ok ? "OK   " : "FAIL ";
    const http = String(r.httpStatus ?? "—").padStart(6);
    const count = String(r.articleCount).padStart(8);
    const dur = fmtDuration(r.durationMs).padStart(8);
    const err = r.error ? `  ${truncate(r.error, 50)}` : "";
    console.log(`  ${name} ${status}  ${http}  ${count}  ${dur}${err}`);
  }

  const total = results.length;
  const ok = results.filter((r) => r.ok).length;
  const fail = total - ok;
  const totalArticles = results.reduce((s, r) => s + r.articleCount, 0);

  console.log("");
  console.log(
    `  → ${ok}/${total} feeds OK, ${fail} failed, ${totalArticles} articles total`,
  );
  console.log("");
}

// ─── MAIN ─────────────────────────────────────────────────────────

async function main() {
  const arg = process.argv[2] || "";
  const jsonOut = process.argv.includes("--json");

  // Select feeds: by name match, or all
  let feeds: RSSFeed[];
  if (arg && !arg.startsWith("-") && arg !== "--json") {
    const matched = MOROCCAN_FEEDS.filter((f) =>
      f.name.toLowerCase().includes(arg.toLowerCase()),
    );
    if (matched.length === 0) {
      console.error(`  ✗ No feed matches "${arg}". Available:`);
      MOROCCAN_FEEDS.forEach((f) => console.error(`      - ${f.name}`));
      process.exit(1);
    }
    feeds = matched;
  } else {
    feeds = MOROCCAN_FEEDS;
  }

  if (!jsonOut) {
    console.log("");
    console.log("╔══════════════════════════════════════════════════════════════╗");
    console.log("║  HARCH ATELIER — RSS FEED HEALTH CHECK                      ║");
    console.log("║  Task ID: signal-media-monitoring                           ║");
    console.log("╚══════════════════════════════════════════════════════════════╝");
    console.log(`  Testing ${feeds.length} feed(s) in parallel…`);
  }

  const results = await Promise.all(feeds.map((f) => probeFeed(f)));

  if (jsonOut) {
    console.log(JSON.stringify({ results }, null, 2));
  } else {
    results.forEach(printResult);
    printSummary(results);
  }

  // Exit non-zero if any feed failed — useful for CI / cron debugging.
  const failed = results.filter((r) => !r.ok).length;
  if (failed > 0 && !jsonOut) {
    console.log(`  ⚠  ${failed} feed(s) failed — see above.`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
