import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { isDemoEmail } from "@/lib/demo-session";
import {
  scrapeHespressComments,
  type ScrapeResult,
} from "@/lib/scrapers/hespress-comments";

// ═══════════════════════════════════════════════════════════════
//  POST /api/scrape/hespress-comments
//
//  Body:     { articleUrl: string, forceMock?: boolean, maxComments?: number }
//  Auth:     requires a valid NextAuth session (real or demo).
//  Rate:     1 request per 10 seconds per user (in-memory Map).
//  Returns:  200 + ScrapeResult  |  4xx / 5xx on error.
//
//  This route is the bridge between the Hespress comments scraper
//  (src/lib/scrapers/hespress-comments.ts) and the demo page at
//  /atelier/lab/hespress. It does NOT persist to ArticleComment yet —
//  the DB has a known SQLite/PostgreSQL mismatch (worklog §2, §6, §9)
//  so persistence is deferred until the DB is provisioned. The
//  scraper returns comments directly to the caller.
//
//  Task ID: BRICK-1-hespress
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
// Hespress scrape can take 5–20s (paginated WP REST + 2s polite delay
// between pages). Cap Vercel's function runtime at 60s to be safe.
export const maxDuration = 60;

// ─── IN-MEMORY RATE LIMITER ──────────────────────────────────────
//
//  Simple per-user Map: email → last-request-timestamp.
//  Window: 10 seconds. 1 request per user per window.
//
//  This is intentionally NOT a Redis-backed limiter — the demo has
//  one server, low traffic, and a single Harch Atelier demo user.
//  Replace with @upstash/ratelimit when we move to multi-instance.

interface RateLimitEntry {
  lastRequestAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 10_000; // 10 seconds
const RATE_LIMIT_MAP_MAX = 10_000; // bound memory

// Sweep stale entries every 5 minutes to prevent unbounded growth.
let lastSweepAt = 0;
function sweepStaleRateLimitEntries(): void {
  const now = Date.now();
  if (now - lastSweepAt < 5 * 60 * 1000) return;
  lastSweepAt = now;
  for (const [key, entry] of rateLimitMap) {
    if (now - entry.lastRequestAt > RATE_LIMIT_WINDOW_MS * 6) {
      rateLimitMap.delete(key);
    }
  }
}

function checkRateLimit(userKey: string): { ok: boolean; retryAfterMs: number } {
  sweepStaleRateLimitEntries();
  const now = Date.now();
  const entry = rateLimitMap.get(userKey);

  if (entry && now - entry.lastRequestAt < RATE_LIMIT_WINDOW_MS) {
    return {
      ok: false,
      retryAfterMs: RATE_LIMIT_WINDOW_MS - (now - entry.lastRequestAt),
    };
  }

  // Bound the map size — drop oldest if we're at the cap.
  if (rateLimitMap.size >= RATE_LIMIT_MAP_MAX) {
    const oldestKey = rateLimitMap.keys().next().value;
    if (oldestKey) rateLimitMap.delete(oldestKey);
  }

  rateLimitMap.set(userKey, { lastRequestAt: now });
  return { ok: true, retryAfterMs: 0 };
}

// ─── POST HANDLER ────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. AUTH — any logged-in user (real or demo). Demo sessions come
  //    through NextAuth with the demo-*@harch.atelier email, so they
  //    pass getServerSession without touching Prisma.
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized — sign in to use the scraper" },
      { status: 401 },
    );
  }

  const userEmail = session.user.email;
  const isDemo = isDemoEmail(userEmail);
  const rateLimitKey = `${userEmail}`;

  // 2. RATE LIMIT — 1 request per 10 seconds per user.
  //    Demo users get a tighter cap (1 per 30s) since they share the
  //    same demo-*@harch.atelier identity in the sandbox.
  const effectiveWindowMs = isDemo ? 30_000 : RATE_LIMIT_WINDOW_MS;
  if (isDemo) {
    // For demo users, use a custom window inline (don't pollute the
    // shared map with a different window).
    const now = Date.now();
    const entry = rateLimitMap.get(rateLimitKey);
    if (entry && now - entry.lastRequestAt < effectiveWindowMs) {
      const retryAfter = Math.ceil(
        (effectiveWindowMs - (now - entry.lastRequestAt)) / 1000,
      );
      return NextResponse.json(
        {
          error: "Rate limited",
          message: `Demo users: 1 request per ${Math.ceil(
            effectiveWindowMs / 1000,
          )}s. Try again in ${retryAfter}s.`,
          retryAfter,
        },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfter) },
        },
      );
    }
    rateLimitMap.set(rateLimitKey, { lastRequestAt: now });
  } else {
    const rl = checkRateLimit(rateLimitKey);
    if (!rl.ok) {
      const retryAfter = Math.ceil(rl.retryAfterMs / 1000);
      return NextResponse.json(
        {
          error: "Rate limited",
          message: `1 request per 10 seconds per user. Try again in ${retryAfter}s.`,
          retryAfter,
        },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfter) },
        },
      );
    }
  }

  // 3. BODY VALIDATION
  let body: {
    articleUrl?: string;
    forceMock?: boolean;
    maxComments?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const articleUrl = typeof body.articleUrl === "string" ? body.articleUrl.trim() : "";
  if (!articleUrl) {
    return NextResponse.json(
      { error: "articleUrl is required" },
      { status: 400 },
    );
  }
  if (articleUrl.length > 500) {
    return NextResponse.json(
      { error: "articleUrl too long (max 500 chars)" },
      { status: 400 },
    );
  }

  const forceMock = body.forceMock === true;
  const maxComments =
    typeof body.maxComments === "number" && body.maxComments > 0
      ? Math.min(500, Math.floor(body.maxComments))
      : 500;

  // 4. RUN THE SCRAPER
  //    The scraper never throws — it returns a ScrapeResult with
  //    source: "none" / "mock" when things go wrong. We translate
  //    that into the appropriate HTTP status.
  try {
    const result: ScrapeResult = await scrapeHespressComments(articleUrl, {
      forceMock,
      maxComments,
    });

    // If the scraper was completely blocked (no comments + no mock),
    // return 503 so the client knows to show the mock-fallback CTA.
    if (result.source === "none" && result.commentsScraped === 0) {
      return NextResponse.json(
        {
          error: "Scrape failed",
          message: result.warning || "Unknown error",
          result,
        },
        { status: 503 },
      );
    }

    // If the scraper fell back to mock data, return 200 but flag it.
    // The demo page reads `result.source === "mock"` to show the
    // "sample data" badge.
    return NextResponse.json({
      ...result,
      isDemo,
      rateLimited: false,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/scrape/hespress-comments] error:", message);
    return NextResponse.json(
      {
        error: "Scraper crashed",
        message,
      },
      { status: 500 },
    );
  }
}

// ─── GET HANDLER (docs) ──────────────────────────────────────────

export async function GET() {
  return NextResponse.json({
    endpoint: "POST /api/scrape/hespress-comments",
    description:
      "Scrape comments from a Hespress article. Runs Darija NLP (sentiment + sarcasm + language) on each comment.",
    auth: "NextAuth session required (demo-*@harch.atelier accounts OK)",
    rateLimit: "1 request per 10 seconds per user (30s for demo accounts)",
    body: {
      articleUrl: "string — e.g. https://hespress.com/articles/12345.html",
      forceMock: "boolean? — skip live fetch, return sample Darija comments",
      maxComments: "number? — hard cap, default 500, max 500",
    },
    returns:
      "ScrapeResult { articleUrl, articleId, commentsScraped, comments[], source: 'wp-rest'|'html'|'mock'|'none', warning?, durationMs }",
    sources: {
      "wp-rest": "Live WordPress REST API at /wp-json/wp/v2/comments (primary)",
      html: "Article HTML parsed for .comment / .comment-body selectors (fallback)",
      mock: "Synthetic Darija samples run through real NLP (last resort)",
      none: "Scrape completely failed — no comments, no mock",
    },
  });
}
