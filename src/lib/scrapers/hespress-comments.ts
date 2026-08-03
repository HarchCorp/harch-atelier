// ═══════════════════════════════════════════════════════════════
//  HESPRESS COMMENTS SCRAPER — Task BRICK-1-hespress
//
//  Hespress is the most-read Moroccan digital news outlet (47–52%
//  weekly reach per Reuters Institute 2025). Its comments section is
//  the richest source of Darija sentiment on the Moroccan web:
//  200–2,000 anonymous comments per article, mixing Darija (Arabizi
//  + Arabic script), Modern Standard Arabic, and French.
//
//  This module extracts those comments, runs the existing Darija NLP
//  pipeline (sentiment + sarcasm + language detection) on each one,
//  and returns a structured result ready for the demo page or for
//  persistence in the ArticleComment table.
//
//  ─── ARCHITECTURE ────────────────────────────────────────────────
//
//  scrapeHespressComments(articleUrl | articleId)
//      │
//      ├── 1. resolveArticleId()      — parse /12345.html → 12345
//      ├── 2. checkRobotsTxt()        — once per process, cached
//      ├── 3. fetchViaWpRestApi()     — primary: /wp-json/wp/v2/comments?post=ID
//      │        └─ if OK: parse JSON, return WPComment[]
//      ├── 4. fetchViaHtmlFallback()  — secondary: fetch article HTML, parse .comment
//      │        └─ if OK: parse DOM, return HtmlComment[]
//      └── 5. mockFallback()          — last-resort: synthetic Darija comments
//               (used when Cloudflare blocks both — the demo page must still work)
//
//  ─── POLITENESS ──────────────────────────────────────────────────
//
//  • 2-second delay between any two HTTP requests (POLITE_DELAY_MS)
//  • Realistic Chrome User-Agent (not "node-fetch" — that gets 403'd)
//  • Robots.txt fetched once and cached for the process lifetime
//  • Hard cap at 500 comments per article (configurable) to bound memory
//  • Every fetch wrapped in try/catch — never throws to the caller
//
//  ─── CLOUDFLARE HANDLING ─────────────────────────────────────────
//
//  Hespress is behind Cloudflare and sometimes returns a JS challenge
//  (HTTP 403 / 503 with a cf-challenge body). We:
//    • Detect the challenge body (look for "cf-challenge", "Just a moment")
//    • Return a clear `cloudflare-challenge` error to the caller
//    • The caller (API route) returns a 503 with a human message
//    • The demo page falls back to mock data so the UI never breaks
//
//  We do NOT try to solve the challenge (no headless browser here).
//  That's resilience case 018 — roadmap for a future Playwright fallback.
//
//  Task ID: BRICK-1-hespress
//  Module:  scrapers/hespress-comments
// ═══════════════════════════════════════════════════════════════

import { analyzeSentiment } from "@/lib/resilience/nlp";
import {
  detectLanguage as detectDarijaLanguage,
  type LanguageLabel,
} from "@/lib/harchiq/darija";

// ─── TYPES ───────────────────────────────────────────────────────

export type CommentLanguage = "darija" | "arabic" | "french" | "mixed";

export interface CommentSentiment {
  /** positive | negative | neutral */
  polarity: "positive" | "negative" | "neutral";
  /** -1.0 .. +1.0 */
  score: number;
  /** True when a positive surface marker + negative reality clause was
   *  detected — the resilience engine's sarcasm flip. */
  sarcasmDetected: boolean;
}

export interface ScrapedComment {
  /** Original Hespress / WP comment ID (numeric string). */
  id: string;
  /** Display name (often "زائر" = "visitor" / anonymous). */
  author: string | null;
  /** Plain-text comment content (HTML stripped, entities decoded). */
  content: string;
  /** ISO date string or null when WP didn't expose one. */
  publishedAt: string | null;
  /** Parent Hespress comment ID (for threading). null = top-level. */
  parentId: string | null;
  /** Upvote / like count if visible. Hespress doesn't always expose this. */
  likes: number;
  sentiment: CommentSentiment;
  language: CommentLanguage;
}

export interface ScrapeResult {
  articleUrl: string;
  articleId: string;
  commentsScraped: number;
  comments: ScrapedComment[];
  /** Which strategy actually produced the comments. */
  source: "wp-rest" | "html" | "mock" | "none";
  /** Optional error / warning message (e.g. "Cloudflare challenge"). */
  warning?: string;
  /** Total wall-clock time in ms. */
  durationMs: number;
}

export interface ScrapeOptions {
  /** Hard cap on number of comments returned (default 500). */
  maxComments?: number;
  /** Polite delay between requests in ms (default 2000). */
  delayMs?: number;
  /** If true, skip the network and return the mock fallback directly.
   *  Used by the demo page "Try with sample data" button + when the
   *  network is known to be blocked. */
  forceMock?: boolean;
  /** Override the User-Agent (default: realistic Chrome UA). */
  userAgent?: string;
  /** AbortSignal for fetch (so the API route can time out). */
  signal?: AbortSignal;
}

// ─── CONSTANTS ───────────────────────────────────────────────────

const HESPRESS_BASE = "https://hespress.com";
const WP_REST_COMMENTS = `${HESPRESS_BASE}/wp-json/wp/v2/comments`;

/** Realistic Chrome on macOS — Hespress's Cloudflare rule 403s
 *  anything that looks like a bot (node-fetch, axios, HarchBot/1.0…). */
const REALISTIC_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

const POLITE_DELAY_MS = 2000;
const MAX_COMMENTS = 500;
const FETCH_TIMEOUT_MS = 15_000;

// ─── HELPERS ─────────────────────────────────────────────────────

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error("Aborted"));
      return;
    }
    const t = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(t);
        reject(new Error("Aborted"));
      },
      { once: true },
    );
  });
}

/** Strip HTML tags + decode the common entities WP throws at us. */
function stripHtml(html: string): string {
  if (!html) return "";
  let out = html;
  // Unwrap CDATA
  out = out.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, (_m, c) => c);
  // Decode named entities
  out = out
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&laquo;/g, "«")
    .replace(/&raquo;/g, "»")
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&rdquo;/g, "”")
    .replace(/&ldquo;/g, "“")
    .replace(/&hellip;/g, "…")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    // Numeric entities
    .replace(/&#(\d+);/g, (_m, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, code) =>
      String.fromCharCode(parseInt(code, 16)),
    );
  // Drop tags
  out = out.replace(/<[^>]+>/g, " ");
  // Collapse whitespace
  out = out.replace(/\s+/g, " ").trim();
  return out;
}

/**
 * Extract the Hespress numeric article ID from any of these URL forms:
 *   • https://hespress.com/articles/12345.html
 *   • https://hespress.com/articles/12345/
 *   • https://hespress.com/articles/12345
 *   • https://hespress.com/?p=12345
 *   • https://hespress.com/sports/12345.html  (any section)
 *
 * If given a numeric string directly, returns it as-is.
 */
export function resolveArticleId(input: string): {
  articleId: string;
  articleUrl: string;
} {
  const trimmed = (input || "").trim();

  // Direct numeric ID
  if (/^\d+$/.test(trimmed)) {
    return {
      articleId: trimmed,
      articleUrl: `${HESPRESS_BASE}/articles/${trimmed}.html`,
    };
  }

  // ?p=12345 query form
  const queryMatch = trimmed.match(/[?&]p=(\d+)/);
  if (queryMatch) {
    const id = queryMatch[1];
    return { articleId: id, articleUrl: `${HESPRESS_BASE}/?p=${id}` };
  }

  // /articles/12345.html or /<section>/12345.html
  const pathMatch = trimmed.match(/\/(\d{3,8})(?:\.html)?\/?$/);
  if (pathMatch) {
    const id = pathMatch[1];
    return { articleId: id, articleUrl: trimmed };
  }

  // Last-resort: any 5+ digit run in the URL
  const fallbackMatch = trimmed.match(/(\d{5,8})/);
  if (fallbackMatch) {
    return { articleId: fallbackMatch[1], articleUrl: trimmed };
  }

  throw new Error(
    `Could not extract article ID from input: "${input}". ` +
      `Expected a URL like https://hespress.com/articles/12345.html or a numeric ID.`,
  );
}

// ─── ROBOTS.TXT CHECK (cached for process lifetime) ─────────────

let robotsCheckedAt = 0;
let robotsAllowsComments = true;
const ROBOTS_TTL_MS = 60 * 60 * 1000; // 1 hour

async function checkRobotsTxt(
  userAgent: string,
  signal?: AbortSignal,
): Promise<boolean> {
  const now = Date.now();
  if (robotsCheckedAt && now - robotsCheckedAt < ROBOTS_TTL_MS) {
    return robotsAllowsComments;
  }

  try {
    const res = await fetch(`${HESPRESS_BASE}/robots.txt`, {
      headers: { "User-Agent": userAgent },
      signal,
    });
    if (!res.ok) {
      // No robots.txt → assume allowed (RFC 9309: no robots.txt = allow all).
      robotsAllowsComments = true;
      robotsCheckedAt = now;
      return true;
    }
    const text = await res.text();
    // Very lightweight robots.txt parser — look for /wp-json/ disallow.
    // We don't need a full RFC parser; Hespress's robots.txt is simple.
    const lines = text.split("\n").map((l) => l.trim().toLowerCase());
    let inRelevantGroup = true; // default group
    for (const line of lines) {
      if (line.startsWith("user-agent:")) {
        const ua = line.slice("user-agent:".length).trim();
        // "*" or our UA-prefix matches → relevant group
        inRelevantGroup = ua === "*" || userAgent.toLowerCase().startsWith(ua);
      } else if (inRelevantGroup && line.startsWith("disallow:")) {
        const path = line.slice("disallow:".length).trim();
        if (path === "/" ) {
          // Site-wide disallow for our UA — bail.
          robotsAllowsComments = false;
          robotsCheckedAt = now;
          return false;
        }
        if (path && "/wp-json/wp/v2/comments".startsWith(path)) {
          robotsAllowsComments = false;
          robotsCheckedAt = now;
          return false;
        }
      }
    }
    robotsAllowsComments = true;
    robotsCheckedAt = now;
    return true;
  } catch {
    // Network failure reading robots.txt — be lenient, allow the request.
    robotsAllowsComments = true;
    robotsCheckedAt = now;
    return true;
  }
}

// ─── CLOUDFLARE DETECTION ────────────────────────────────────────

function looksLikeCloudflareChallenge(body: string): boolean {
  if (!body) return false;
  const lower = body.toLowerCase();
  return (
    lower.includes("cf-challenge") ||
    lower.includes("cf_chl_opt") ||
    lower.includes("just a moment...") ||
    lower.includes("just a moment…") ||
    lower.includes("checking your browser before accessing") ||
    lower.includes("cloudflare") && lower.includes("ray id")
  );
}

// ─── 1. WP REST API PATH (primary) ──────────────────────────────

interface WPComment {
  id: number;
  author: number;
  author_name: string;
  date: string;
  date_gmt: string;
  content: { rendered: string };
  parent: number;
  link: string;
  // Hespress adds a few custom fields:
  author_avatar_urls?: Record<string, string>;
  meta?: Record<string, unknown>;
}

async function fetchViaWpRestApi(
  articleId: string,
  options: Required<Pick<ScrapeOptions, "userAgent">> & {
    delayMs: number;
    maxComments: number;
    signal?: AbortSignal;
  },
): Promise<{ comments: WPComment[]; source: "wp-rest"; warning?: string }> {
  const collected: WPComment[] = [];
  const perPage = Math.min(100, options.maxComments);
  let page = 1;
  let warning: string | undefined;

  while (collected.length < options.maxComments && page <= 10) {
    const url = `${WP_REST_COMMENTS}?post=${articleId}&per_page=${perPage}&page=${page}&orderby=date_gmt&order=asc`;

    let res: Response;
    try {
      res = await fetch(url, {
        headers: {
          "User-Agent": options.userAgent,
          Accept: "application/json",
          "Accept-Language": "ar,fr;q=0.8,en;q=0.5",
        },
        signal: options.signal,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Network failure — bail out (caller will try HTML fallback)
      throw new Error(`WP REST fetch failed: ${msg}`);
    }

    if (res.status === 403 || res.status === 503) {
      const body = await res.text().catch(() => "");
      if (looksLikeCloudflareChallenge(body)) {
        warning = "Cloudflare JS challenge on /wp-json/wp/v2/comments";
        throw new CloudflareError(warning);
      }
      throw new Error(`WP REST returned HTTP ${res.status}`);
    }

    if (res.status === 404) {
      // No comments for this post, or post doesn't exist
      if (page === 1) {
        throw new Error(
          `No comments found for article ${articleId} (HTTP 404 from WP REST)`,
        );
      }
      break; // ran out of pages
    }

    if (!res.ok) {
      throw new Error(`WP REST returned HTTP ${res.status}`);
    }

    let batch: WPComment[];
    try {
      batch = (await res.json()) as WPComment[];
    } catch (err) {
      throw new Error(
        `WP REST JSON parse failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    if (!Array.isArray(batch) || batch.length === 0) break;
    collected.push(...batch);
    if (batch.length < perPage) break; // last page

    page++;
    // Polite delay between paginated requests
    if (collected.length < options.maxComments) {
      await sleep(options.delayMs, options.signal);
    }
  }

  return { comments: collected, source: "wp-rest", warning };
}

// ─── 2. HTML FALLBACK (secondary) ───────────────────────────────

interface HtmlComment {
  id: string;
  author: string | null;
  content: string;
  publishedAt: string | null;
  parentId: string | null;
  likes: number;
}

async function fetchViaHtmlFallback(
  articleUrl: string,
  options: Required<Pick<ScrapeOptions, "userAgent">> & {
    delayMs: number;
    maxComments: number;
    signal?: AbortSignal;
  },
): Promise<{ comments: HtmlComment[]; source: "html"; warning?: string }> {
  let res: Response;
  try {
    res = await fetch(articleUrl, {
      headers: {
        "User-Agent": options.userAgent,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "ar,fr;q=0.8,en;q=0.5",
      },
      signal: options.signal,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`HTML fetch failed: ${msg}`);
  }

  if (res.status === 403 || res.status === 503) {
    const body = await res.text().catch(() => "");
    if (looksLikeCloudflareChallenge(body)) {
      throw new CloudflareError(
        "Cloudflare JS challenge on article HTML",
      );
    }
    throw new Error(`Article HTML returned HTTP ${res.status}`);
  }

  if (res.status === 404) {
    throw new Error(`Article not found (HTTP 404): ${articleUrl}`);
  }

  if (!res.ok) {
    throw new Error(`Article HTML returned HTTP ${res.status}`);
  }

  const html = await res.text();
  return {
    comments: parseCommentsFromHtml(html, options.maxComments),
    source: "html",
  };
}

/**
 * Parse comments from Hespress / WordPress article HTML.
 *
 * Hespress uses the standard WordPress comment markup with Moroccan
 * customisations. We try these selectors in order:
 *   • li.comment / ol.comment-list li
 *   • .comment-item (older WP themes)
 *   • .comment-body
 *   • div[id^="comment-"]
 *
 * For each comment we extract:
 *   • id            — from the element's id attribute (comment-12345)
 *   • author        — from .comment-author .fn / .comment-author-name / data-author
 *   • content       — from .comment-content / .comment-body p
 *   • publishedAt   — from time[datetime] / .comment-meta time
 *   • parentId      — from data-parent-id / .comment.parent / .depth-N .children
 *   • likes         — from .comment-likes .count / [data-likes]
 */
export function parseCommentsFromHtml(
  html: string,
  maxComments: number,
): HtmlComment[] {
  const comments: HtmlComment[] = [];
  if (!html) return comments;

  // Match all <li ... class="...comment..."> ... </li> blocks.
  // We use a regex-based scanner because Hespress's HTML is not always
  // well-formed enough for a strict parser, and we don't want to ship
  // a DOM dependency just for this.
  const commentBlockRegex = /<li[^>]*\bclass="[^"]*\bcomment\b[^"]*"[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)(?=<li[^>]*\bclass="[^"]*\bcomment\b|<\/ol>|<\/ul>)/gi;

  let match: RegExpExecArray | null;
  while ((match = commentBlockRegex.exec(html)) !== null) {
    if (comments.length >= maxComments) break;
    const idAttr = match[1]; // e.g. "comment-12345"
    const block = match[2];

    const commentId = idAttr.replace(/^comment-/, "");
    if (!commentId) continue;

    // Author
    let author: string | null = null;
    const authorMatch =
      block.match(/<[^>]*\bclass="[^"]*\bfn\b[^"]*"[^>]*>([^<]+)</i) ||
      block.match(/<[^>]*\bclass="[^"]*\bcomment-author-name\b[^"]*"[^>]*>([^<]+)</i) ||
      block.match(/data-author="([^"]+)"/i);
    if (authorMatch) author = stripHtml(authorMatch[1]);

    // Content
    let content = "";
    const contentMatch =
      block.match(/<div[^>]*\bclass="[^"]*\bcomment-content\b[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
      block.match(/<div[^>]*\bclass="[^"]*\bcomment-body\b[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
      block.match(/<div[^>]*\bclass="[^"]*\bcomment-text\b[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    if (contentMatch) content = stripHtml(contentMatch[1]);
    if (!content) continue; // empty comment, skip

    // Date
    let publishedAt: string | null = null;
    const timeMatch =
      block.match(/<time[^>]*\bdatetime="([^"]+)"/i) ||
      block.match(/data-published="([^"]+)"/i) ||
      block.match(/<abbr[^>]*\bclass="[^"]*\bcomment-date\b[^"]*"[^>]*\btitle="([^"]+)"/i);
    if (timeMatch) publishedAt = timeMatch[1];

    // Parent
    let parentId: string | null = null;
    const parentMatch =
      block.match(/data-parent-id="(\d+)"/i) ||
      block.match(/\bparent="(\d+)"/i);
    if (parentMatch) parentId = parentMatch[1];

    // Likes (Hespress sometimes exposes an upvote count)
    let likes = 0;
    const likesMatch =
      block.match(/data-likes="(\d+)"/i) ||
      block.match(/<span[^>]*\bclass="[^"]*\blikes-count\b[^"]*"[^>]*>(\d+)</i) ||
      block.match(/<span[^>]*\bclass="[^"]*\bcomment-likes\b[^"]*"[^>]*>\s*(\d+)/i);
    if (likesMatch) likes = parseInt(likesMatch[1], 10) || 0;

    comments.push({
      id: commentId,
      author,
      content,
      publishedAt,
      parentId,
      likes,
    });
  }

  // Fallback: if the structured <li class="comment"> scan returned nothing,
  // try the older Hespress markup: div[id^="comment-"] blocks.
  if (comments.length === 0) {
    const divRegex = /<div[^>]*\bid="comment-(\d+)"[^>]*>([\s\S]*?)<\/div>\s*(?=<div[^>]*\bid="comment-|<footer|<!--)/gi;
    let divMatch: RegExpExecArray | null;
    while ((divMatch = divRegex.exec(html)) !== null) {
      if (comments.length >= maxComments) break;
      const id = divMatch[1];
      const block = divMatch[2];
      const contentMatch = block.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
      const content = contentMatch ? stripHtml(contentMatch[1]) : "";
      if (!content) continue;
      const authorMatch = block.match(/<[^>]*\bclass="[^"]*\bauthor\b[^"]*"[^>]*>([^<]+)</i);
      comments.push({
        id,
        author: authorMatch ? stripHtml(authorMatch[1]) : null,
        content,
        publishedAt: null,
        parentId: null,
        likes: 0,
      });
    }
  }

  return comments;
}

// ─── 3. MOCK FALLBACK (last-resort, demo-friendly) ──────────────

/**
 * Synthetic Darija / Arabic / French comments used when the live scrape
 * fails (Cloudflare, network, dev sandbox without internet).
 *
 * These are REALISTIC samples drawn from typical Hespress comment
 * patterns — short, mixed-script, opinionated. They run through the
 * real NLP pipeline so the demo page shows real sentiment + sarcasm
 * detection even when the network is blocked.
 *
 * IMPORTANT: each comment is clearly marked in the result via
 * `source: "mock"` so the UI can show a "sample data" badge.
 */
const MOCK_COMMENTS: Array<Omit<HtmlComment, "id"> & { id: string }> = [
  {
    id: "mock-001",
    author: "زائر",
    content: "khoya hada machi 7al, lflous mchaw",
    publishedAt: new Date(Date.now() - 3600_000).toISOString(),
    parentId: null,
    likes: 47,
  },
  {
    id: "mock-002",
    author: "زائر",
    content: "tbarkellah 3la had service, mchaw lflous dyali",
    publishedAt: new Date(Date.now() - 3500_000).toISOString(),
    parentId: null,
    likes: 23,
  },
  {
    id: "mock-003",
    author: "زائر",
    content: "mzyan bezaf, allah ikhelilek lwalidin",
    publishedAt: new Date(Date.now() - 3400_000).toISOString(),
    parentId: null,
    likes: 89,
  },
  {
    id: "mock-004",
    author: "زائر",
    content: "khayb 3la 10, maystahelch",
    publishedAt: new Date(Date.now() - 3300_000).toISOString(),
    parentId: null,
    likes: 12,
  },
  {
    id: "mock-005",
    author: "زائر",
    content: "C'est de la bombe, enfin une bonne nouvelle",
    publishedAt: new Date(Date.now() - 3200_000).toISOString(),
    parentId: null,
    likes: 56,
  },
  {
    id: "mock-006",
    author: "زائر",
    content: "wach hada howa lmusta9bal? mafihmtech",
    publishedAt: new Date(Date.now() - 3100_000).toISOString(),
    parentId: null,
    likes: 8,
  },
  {
    id: "mock-007",
    author: "زائر",
    content: "حل ممتاز، شكرا على المجهود",
    publishedAt: new Date(Date.now() - 3000_000).toISOString(),
    parentId: null,
    likes: 34,
  },
  {
    id: "mock-008",
    author: "زائر",
    content: "la solution machi mzyana, khassha t9ad",
    publishedAt: new Date(Date.now() - 2900_000).toISOString(),
    parentId: "mock-007",
    likes: 5,
  },
  {
    id: "mock-009",
    author: "زائر",
    content: "nul, arnaque totale, 0/10",
    publishedAt: new Date(Date.now() - 2800_000).toISOString(),
    parentId: null,
    likes: 67,
  },
  {
    id: "mock-010",
    author: "زائر",
    content: "bravo l'équipe, mzyan had khedma",
    publishedAt: new Date(Date.now() - 2700_000).toISOString(),
    parentId: null,
    likes: 41,
  },
  {
    id: "mock-011",
    author: "زائر",
    content: "tfou 3la had chi, makaynch ikram lmosstim",
    publishedAt: new Date(Date.now() - 2600_000).toISOString(),
    parentId: null,
    likes: 78,
  },
  {
    id: "mock-012",
    author: "زائر",
    content: "super initiative, allah ywfe9kom",
    publishedAt: new Date(Date.now() - 2500_000).toISOString(),
    parentId: null,
    likes: 29,
  },
  {
    id: "mock-013",
    author: "زائر",
    content: "had lma3loumat mch mzyana, khellsetha",
    publishedAt: new Date(Date.now() - 2400_000).toISOString(),
    parentId: null,
    likes: 3,
  },
  {
    id: "mock-014",
    author: "زائر",
    content: "excellent travail, continuez comme ça",
    publishedAt: new Date(Date.now() - 2300_000).toISOString(),
    parentId: null,
    likes: 52,
  },
  {
    id: "mock-015",
    author: "زائر",
    content: "mokhtlaf m3ak, hada howa l7al l2asah",
    publishedAt: new Date(Date.now() - 2200_000).toISOString(),
    parentId: "mock-002",
    likes: 11,
  },
];

// ─── NLP RUNNER ──────────────────────────────────────────────────

function runNlp(content: string): {
  sentiment: CommentSentiment;
  language: CommentLanguage;
} {
  // 1. Language detection (darija | arabic | french | english | mixed)
  let detectedLang: LanguageLabel;
  try {
    detectedLang = detectDarijaLanguage(content || "").language;
  } catch {
    detectedLang = "mixed";
  }
  // Map our 5-label detector output to the 4-label comment taxonomy.
  // "english" comments get bucketed into "mixed" since they're rare on
  // Hespress and almost always co-occur with French or Darija.
  const language: CommentLanguage =
    detectedLang === "english" ? "mixed" : detectedLang;

  // 2. Sentiment + sarcasm (resilience engine — handles Darija + FR + AR)
  let polarity: CommentSentiment["polarity"] = "neutral";
  let score = 0;
  let sarcasmDetected = false;
  try {
    const s = analyzeSentiment(content || "");
    polarity = s.polarity;
    score = s.score;
    sarcasmDetected = s.sarcasmDetected;
  } catch {
    // NLP failure → leave neutral, no crash
  }

  return {
    sentiment: { polarity, score, sarcasmDetected },
    language,
  };
}

// ─── CLOUDFLARE ERROR CLASS ─────────────────────────────────────

class CloudflareError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CloudflareError";
  }
}

// ─── MAIN ENTRY POINT ───────────────────────────────────────────

/**
 * Scrape comments from a Hespress article.
 *
 * @param input  Article URL (e.g. https://hespress.com/articles/12345.html)
 *               or numeric article ID (e.g. "12345").
 * @param options  See ScrapeOptions.
 * @returns       ScrapeResult — never throws.
 */
export async function scrapeHespressComments(
  input: string,
  options: ScrapeOptions = {},
): Promise<ScrapeResult> {
  const startMs = Date.now();
  const maxComments = Math.min(
    MAX_COMMENTS,
    Math.max(1, options.maxComments ?? MAX_COMMENTS),
  );
  const delayMs = options.delayMs ?? POLITE_DELAY_MS;
  const userAgent = options.userAgent ?? REALISTIC_UA;
  const signal = options.signal;

  // ── Resolve article ID + canonical URL ──────────────────────────
  let articleId: string;
  let articleUrl: string;
  try {
    const resolved = resolveArticleId(input);
    articleId = resolved.articleId;
    articleUrl = resolved.articleUrl;
  } catch (err) {
    return {
      articleUrl: input,
      articleId: "",
      commentsScraped: 0,
      comments: [],
      source: "none",
      warning: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - startMs,
    };
  }

  // ── Force-mock shortcut ─────────────────────────────────────────
  if (options.forceMock) {
    return buildMockResult(articleUrl, articleId, maxComments, startMs, "Forced mock (demo mode)");
  }

  // ── Robots.txt check ────────────────────────────────────────────
  let robotsOk = true;
  try {
    robotsOk = await checkRobotsTxt(userAgent, signal);
  } catch {
    robotsOk = true; // be lenient
  }
  if (!robotsOk) {
    return {
      articleUrl,
      articleId,
      commentsScraped: 0,
      comments: [],
      source: "none",
      warning: "robots.txt disallows /wp-json/wp/v2/comments for this UA",
      durationMs: Date.now() - startMs,
    };
  }

  // ── Try WP REST API first ───────────────────────────────────────
  let cloudflareBlocked = false;
  try {
    const { comments: wpComments, warning } = await fetchViaWpRestApi(
      articleId,
      { userAgent, signal, delayMs, maxComments },
    );

    const scraped: ScrapedComment[] = wpComments.slice(0, maxComments).map((c) => {
      const { sentiment, language } = runNlp(c.content?.rendered || "");
      return {
        id: String(c.id),
        author: c.author_name || (c.author ? `User #${c.author}` : null),
        content: stripHtml(c.content?.rendered || ""),
        publishedAt: c.date || c.date_gmt || null,
        parentId: c.parent && c.parent > 0 ? String(c.parent) : null,
        likes: extractLikesFromMeta(c.meta),
        sentiment,
        language,
      };
    });

    return {
      articleUrl,
      articleId,
      commentsScraped: scraped.length,
      comments: scraped,
      source: "wp-rest",
      warning,
      durationMs: Date.now() - startMs,
    };
  } catch (err) {
    if (err instanceof CloudflareError) {
      cloudflareBlocked = true;
    }
    // Otherwise: fall through to HTML fallback
  }

  // ── Polite delay between strategies ─────────────────────────────
  await sleep(delayMs, signal).catch(() => {});

  // ── Try HTML fallback ───────────────────────────────────────────
  if (!cloudflareBlocked) {
    try {
      const { comments: htmlComments, warning } = await fetchViaHtmlFallback(
        articleUrl,
        { userAgent, signal, delayMs, maxComments },
      );

      const scraped: ScrapedComment[] = htmlComments.slice(0, maxComments).map((c) => {
        const { sentiment, language } = runNlp(c.content);
        return {
          id: c.id,
          author: c.author,
          content: c.content,
          publishedAt: c.publishedAt,
          parentId: c.parentId,
          likes: c.likes,
          sentiment,
          language,
        };
      });

      return {
        articleUrl,
        articleId,
        commentsScraped: scraped.length,
        comments: scraped,
        source: "html",
        warning: scraped.length === 0 ? "Comments section empty or disabled" : warning,
        durationMs: Date.now() - startMs,
      };
    } catch (err) {
      if (err instanceof CloudflareError) {
        cloudflareBlocked = true;
      }
      // Fall through to mock
    }
  }

  // ── Last-resort mock fallback ───────────────────────────────────
  const mockReason = cloudflareBlocked
    ? "Cloudflare challenge blocked live scrape — showing sample Darija comments instead"
    : "Live scrape failed (network or HTTP error) — showing sample Darija comments instead";

  return buildMockResult(articleUrl, articleId, maxComments, startMs, mockReason);
}

// ─── MOCK BUILDER ────────────────────────────────────────────────

function buildMockResult(
  articleUrl: string,
  articleId: string,
  maxComments: number,
  startMs: number,
  warning: string,
): ScrapeResult {
  const sliced = MOCK_COMMENTS.slice(0, maxComments);
  const scraped: ScrapedComment[] = sliced.map((c) => {
    const { sentiment, language } = runNlp(c.content);
    return {
      id: c.id,
      author: c.author,
      content: c.content,
      publishedAt: c.publishedAt,
      parentId: c.parentId,
      likes: c.likes,
      sentiment,
      language,
    };
  });

  return {
    articleUrl,
    articleId,
    commentsScraped: scraped.length,
    comments: scraped,
    source: "mock",
    warning,
    durationMs: Date.now() - startMs,
  };
}

// ─── HELPERS ─────────────────────────────────────────────────────

/** Hespress exposes likes inside the WP REST `meta` bag, when present. */
function extractLikesFromMeta(meta: Record<string, unknown> | undefined): number {
  if (!meta) return 0;
  // Common keys tried in order
  const candidates = ["likes", "upvotes", "helpful", "rating", "votes"];
  for (const key of candidates) {
    const v = meta[key];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string") {
      const n = parseInt(v, 10);
      if (!isNaN(n)) return n;
    }
    if (Array.isArray(v) && v.length > 0) {
      const n = parseInt(String(v[0]), 10);
      if (!isNaN(n)) return n;
    }
  }
  return 0;
}

// ─── FETCH TIMEOUT WRAPPER ──────────────────────────────────────

/**
 * Wrap fetch with a hard timeout (FETCH_TIMEOUT_MS) so a hung
 * connection can't wedge the scraper forever. Used by the API route.
 */
export function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = FETCH_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const externalSignal = init.signal;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  // Bridge external abort signal to ours
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else
      externalSignal.addEventListener(
        "abort",
        () => controller.abort(),
        { once: true },
      );
  }

  return fetch(url, { ...init, signal: controller.signal }).finally(() =>
    clearTimeout(timer),
  );
}
