// ═══════════════════════════════════════════════════════════════
//  TEST — HESPRESS COMMENTS SCRAPER
//
//  Runs the scraper on a sample Hespress article URL and prints:
//    • Source used (wp-rest / html / mock / none)
//    • Total comments scraped
//    • Sentiment breakdown (positive / neutral / negative)
//    • Language breakdown (darija / arabic / french / mixed)
//    • Sarcasm count
//    • Top 3 most-liked comments
//    • First 5 comments in detail
//    • Any warnings (Cloudflare, network, etc.)
//
//  Usage:
//     bun run scripts/test-hespress-scraper.ts                # default URL
//     bun run scripts/test-hespress-scraper.ts <URL>          # custom URL
//     bun run scripts/test-hespress-scraper.ts --mock         # force mock fallback
//     bun run scripts/test-hespress-scraper.ts --mock <URL>   # both
//
//  Task ID: BRICK-1-hespress
// ═══════════════════════════════════════════════════════════════

import {
  scrapeHespressComments,
  resolveArticleId,
  parseCommentsFromHtml,
  type ScrapeResult,
  type ScrapedComment,
} from "../src/lib/scrapers/hespress-comments";

// ─── HELPERS ────────────────────────────────────────────────────

const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

function c(color: keyof typeof colors, s: string): string {
  return `${colors[color]}${s}${colors.reset}`;
}

function fmtDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function truncate(s: string, n: number): string {
  if (!s) return "";
  return s.length > n ? s.slice(0, n) + "…" : s;
}

function fmtPct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

// ─── MAIN ───────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const forceMock = args.includes("--mock");
  const urlArg = args.find((a) => !a.startsWith("--"));
  const articleUrl = urlArg || "https://hespress.com/articles/1372457.html";

  console.log();
  console.log(c("bold", "═══════════════════════════════════════════════════════════════"));
  console.log(c("bold", "  HESPRESS COMMENTS SCRAPER — TEST RUN"));
  console.log(c("bold", "═══════════════════════════════════════════════════════════════"));
  console.log();
  console.log(`${c("dim", "Input:")}     ${articleUrl}`);
  console.log(`${c("dim", "Force mock:")} ${forceMock ? c("yellow", "YES") : "no"}`);

  // ── Test 1: resolveArticleId ──────────────────────────────────
  console.log();
  console.log(c("cyan", "── TEST 1: resolveArticleId ────────────────────────────────────"));
  try {
    const resolved = resolveArticleId(articleUrl);
    console.log(`${c("green", "✓")} Article ID: ${c("bold", resolved.articleId)}`);
    console.log(`  Canonical URL: ${resolved.articleUrl}`);
  } catch (err) {
    console.log(`${c("red", "✗")} resolveArticleId failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  // ── Test 2: parseCommentsFromHtml (offline, with a fixture) ───
  console.log();
  console.log(c("cyan", "── TEST 2: parseCommentsFromHtml (fixture) ─────────────────────"));
  const fixtureHtml = `
    <ol class="comment-list">
      <li class="comment even thread-even depth-1" id="comment-12345">
        <div class="comment-body">
          <div class="comment-author vcard">
            <span class="fn">زائر</span>
          </div>
          <div class="comment-meta">
            <time datetime="2026-08-01T10:30:00+01:00">August 1, 2026</time>
          </div>
          <div class="comment-content">
            <p>had lma3loumat mch mzyana, khellsetna</p>
          </div>
          <span class="likes-count" data-likes="42">42 ♥</span>
        </div>
      </li>
      <li class="comment odd alt thread-odd depth-1" id="comment-12346">
        <div class="comment-body">
          <div class="comment-author vcard"><span class="fn">زاٸر</span></div>
          <div class="comment-content"><p>tbarkellah 3la had service</p></div>
        </div>
      </li>
    </ol>`;
  const parsed = parseCommentsFromHtml(fixtureHtml, 100);
  if (parsed.length === 2) {
    console.log(`${c("green", "✓")} Parsed ${parsed.length} comments from fixture HTML`);
    for (const pc of parsed) {
      console.log(
        `  · id=${pc.id} author="${pc.author}" likes=${pc.likes} content="${truncate(pc.content, 50)}"`,
      );
    }
  } else {
    console.log(
      `${c("red", "✗")} Expected 2 comments from fixture, got ${parsed.length}`,
    );
  }

  // ── Test 3: scrapeHespressComments (live or mock) ─────────────
  console.log();
  console.log(c("cyan", "── TEST 3: scrapeHespressComments ──────────────────────────────"));

  const startMs = Date.now();
  const result: ScrapeResult = await scrapeHespressComments(articleUrl, {
    forceMock,
    maxComments: 100, // small cap for the test run
    delayMs: 2000,
  });
  const totalMs = Date.now() - startMs;

  console.log();
  console.log(`${c("dim", "Source:")}          ${colorSource(result.source)}`);
  console.log(`${c("dim", "Comments scraped:")} ${c("bold", String(result.commentsScraped))}`);
  console.log(`${c("dim", "Scraper time:")}    ${fmtDuration(result.durationMs)}`);
  console.log(`${c("dim", "Test total time:")}  ${fmtDuration(totalMs)}`);
  if (result.warning) {
    console.log(`${c("dim", "Warning:")}         ${c("yellow", result.warning)}`);
  }

  // ── Stats ─────────────────────────────────────────────────────
  if (result.comments.length > 0) {
    const cs = result.comments;
    const total = cs.length;
    const byPolarity = {
      positive: cs.filter((x) => x.sentiment.polarity === "positive").length,
      neutral: cs.filter((x) => x.sentiment.polarity === "neutral").length,
      negative: cs.filter((x) => x.sentiment.polarity === "negative").length,
    };
    const byLanguage = {
      darija: cs.filter((x) => x.language === "darija").length,
      arabic: cs.filter((x) => x.language === "arabic").length,
      french: cs.filter((x) => x.language === "french").length,
      mixed: cs.filter((x) => x.language === "mixed").length,
    };
    const sarcasm = cs.filter((x) => x.sentiment.sarcasmDetected).length;
    const avgScore = cs.reduce((a, x) => a + x.sentiment.score, 0) / total;

    console.log();
    console.log(c("cyan", "── SENTIMENT BREAKDOWN ─────────────────────────────────────────"));
    console.log(`  ${c("green", "Positive:")} ${byPolarity.positive} (${fmtPct(byPolarity.positive / total)})`);
    console.log(`  ${c("gray", "Neutral:")}  ${byPolarity.neutral} (${fmtPct(byPolarity.neutral / total)})`);
    console.log(`  ${c("red", "Negative:")} ${byPolarity.negative} (${fmtPct(byPolarity.negative / total)})`);
    console.log(`  Avg score: ${avgScore.toFixed(3)}`);
    console.log(`  Sarcasm detected: ${sarcasm > 0 ? c("yellow", String(sarcasm)) : "0"}`);

    console.log();
    console.log(c("cyan", "── LANGUAGE MIX ────────────────────────────────────────────────"));
    console.log(`  ${c("yellow", "Darija:")}  ${byLanguage.darija} (${fmtPct(byLanguage.darija / total)})`);
    console.log(`  ${c("magenta", "Arabic:")}  ${byLanguage.arabic} (${fmtPct(byLanguage.arabic / total)})`);
    console.log(`  ${c("blue", "French:")}  ${byLanguage.french} (${fmtPct(byLanguage.french / total)})`);
    console.log(`  ${c("magenta", "Mixed:")}   ${byLanguage.mixed} (${fmtPct(byLanguage.mixed / total)})`);

    // ── Top 3 most-liked ──────────────────────────────────────
    const top3 = [...cs].sort((a, b) => b.likes - a.likes).slice(0, 3);
    if (top3.length > 0 && top3[0].likes > 0) {
      console.log();
      console.log(c("cyan", "── TOP 3 MOST-LIKED COMMENTS ───────────────────────────────────"));
      for (let i = 0; i < top3.length; i++) {
        const cm = top3[i];
        console.log();
        console.log(`  ${c("bold", `#${i + 1}`)} — ${cm.likes} ♥ · ${cm.author || "anonymous"} · ${cm.language} · ${cm.sentiment.polarity}`);
        console.log(`     "${truncate(cm.content, 120)}"`);
        if (cm.sentiment.sarcasmDetected) {
          console.log(`     ${c("yellow", "⚠ sarcasm detected")}`);
        }
      }
    }

    // ── First 5 comments in detail ────────────────────────────
    console.log();
    console.log(c("cyan", "── FIRST 5 COMMENTS (detail) ───────────────────────────────────"));
    for (let i = 0; i < Math.min(5, cs.length); i++) {
      const cm = cs[i];
      console.log();
      console.log(
        `  ${c("bold", `[${i + 1}]`)} id=${c("dim", cm.id)} · ${cm.author || "anonymous"} · ${cm.language} · ${cm.sentiment.polarity} (${cm.sentiment.score.toFixed(2)})`,
      );
      if (cm.parentId) console.log(`     ${c("dim", `↳ reply to ${cm.parentId}`)}`);
      console.log(`     ${c("dim", truncate(cm.content, 200))}`);
      if (cm.sentiment.sarcasmDetected) {
        console.log(`     ${c("yellow", "⚠ sarcasm detected")}`);
      }
    }
  }

  // ── Verdict ─────────────────────────────────────────────────
  console.log();
  console.log(c("bold", "═══════════════════════════════════════════════════════════════"));
  if (result.source === "wp-rest") {
    console.log(c("green", "  ✓ LIVE SCRAPE SUCCESS — WP REST API path"));
  } else if (result.source === "html") {
    console.log(c("blue", "  ✓ LIVE SCRAPE SUCCESS — HTML parse fallback"));
  } else if (result.source === "mock") {
    console.log(c("yellow", "  ⚠  MOCK FALLBACK — live scrape blocked"));
    console.log(c("yellow", "     Demo page will still work with sample Darija data."));
  } else {
    console.log(c("red", "  ✗ TOTAL FAILURE — no comments, no mock"));
  }
  console.log(c("bold", "═══════════════════════════════════════════════════════════════"));
  console.log();
}

function colorSource(source: ScrapeResult["source"]): string {
  switch (source) {
    case "wp-rest":
      return c("green", "wp-rest (live, WordPress REST API)");
    case "html":
      return c("blue", "html (live, parsed from article HTML)");
    case "mock":
      return c("yellow", "mock (synthetic Darija samples, NLP-real)");
    case "none":
      return c("red", "none (total failure)");
  }
}

// ─── RUN ────────────────────────────────────────────────────────

main().catch((err) => {
  console.error(c("red", "\n✗ Test script crashed:"));
  console.error(err);
  process.exit(1);
});
