// ═══════════════════════════════════════════════════════════════
//  COMPANY MATCHER — link articles to companies by name + aliases
//
//  For each scraped article we scan the title + content for any of the
//  configured company names or their aliases (case-insensitive,
//  word-boundary-respecting). Articles that don't match any company
//  are still inserted into the DB (companyId = null) — they're real
//  news and the user-facing feeds surface them.
//
//  Matching is done in-process (no LLM call): the company table holds
//  ~18 rows so a single SELECT + linear scan is well under 1 ms per
//  article. The result is an array of company IDs (an article can
//  legitimately mention several companies — a M&A rumour, a joint
//  venture, etc.).
//
//  Task ID: real-rss-scrapers
//  Module:  scrapers/company-matcher
// ═══════════════════════════════════════════════════════════════

import { prisma } from "@/lib/db";

/** Cache company rows for 5 minutes to avoid hammering the DB on every
 *  article. The cron processes hundreds of articles per run, each one
 *  would otherwise trigger a findMany. */
interface CompanyRow {
  id: string;
  name: string;
  aliases: string[];
}

let companyCache: CompanyRow[] | null = null;
let companyCacheAt = 0;
const COMPANY_CACHE_TTL_MS = 5 * 60 * 1000;

async function loadCompanies(): Promise<CompanyRow[]> {
  const now = Date.now();
  if (companyCache && now - companyCacheAt < COMPANY_CACHE_TTL_MS) {
    return companyCache;
  }
  const rows = await prisma.company.findMany({
    select: { id: true, name: true, aliases: true },
  });
  companyCache = rows;
  companyCacheAt = now;
  return rows;
}

/** Force a cache refresh — used by the admin "Scrape now" button when
 *  companies have just been added/edited. */
export function invalidateCompanyCache(): void {
  companyCache = null;
  companyCacheAt = 0;
}

/** Escape a string so it can be safely inserted into a RegExp. */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Build a word-boundary regex for a given name.
 *
 *  Word boundaries in regex (\b) don't work for Arabic script (the \w
 *  class is ASCII-only). For Arabic names we use lookarounds that
 *  accept either a non-letter / non-Arabic-character boundary.
 */
function buildMatcher(name: string): RegExp {
  const escaped = escapeRegex(name);
  // Use a custom boundary: match if preceded by start-of-string, whitespace,
  // a non-word char (punctuation, quotes), or an Arabic-letter boundary.
  // Same for the trailing edge.
  const boundary = "(?:^|(?<=[\\s\\p{P}\\p{S}])|(?<=[\\u0600-\\u06FF]))";
  const endBoundary = "(?:$|(?=[\\s\\p{P}\\p{S}])|(?=[\\u0600-\\u06FF]))";
  try {
    return new RegExp(
      `${boundary}${escaped}${endBoundary}`,
      "iu",
    );
  } catch {
    // Older engines may not support lookbehind / Unicode property escapes.
    // Fall back to a plain includes() check via a simpler regex.
    return new RegExp(escaped, "i");
  }
}

/**
 * Match an article's title + content against all known companies.
 *
 * @param title   Article title (plain text, no HTML)
 * @param content Article body / description (plain text, no HTML)
 * @returns       Array of company IDs that were mentioned. Empty array
 *                when no company matches (article is still inserted).
 */
export async function matchArticleToCompanies(
  title: string,
  content: string,
): Promise<string[]> {
  const companies = await loadCompanies();
  if (companies.length === 0) return [];

  const haystack = `${title || ""}\n${content || ""}`;
  if (!haystack.trim()) return [];

  const matched: string[] = [];
  const seen = new Set<string>();

  for (const company of companies) {
    if (seen.has(company.id)) continue;

    // Build the list of names to test: the canonical name + all aliases.
    // Skip empty / whitespace-only entries.
    const names = [company.name, ...(company.aliases || [])].filter(
      (n) => n && n.trim().length >= 2,
    );
    // Dedupe (case-insensitive) — same alias entered twice shouldn't
    // double-fire.
    const uniqueNames = Array.from(
      new Map(names.map((n) => [n.toLowerCase(), n])).values(),
    );

    let hit = false;
    for (const name of uniqueNames) {
      try {
        const re = buildMatcher(name);
        if (re.test(haystack)) {
          hit = true;
          break;
        }
      } catch {
        // Last-resort: substring match (case-insensitive)
        if (haystack.toLowerCase().includes(name.toLowerCase())) {
          hit = true;
          break;
        }
      }
    }

    if (hit) {
      matched.push(company.id);
      seen.add(company.id);
    }
  }

  return matched;
}

/**
 * Convenience: match an article and return the FIRST matched company ID
 * (or null). Used by the cron job because the Article.companyId column
 * is non-nullable in the current Prisma schema (a real article that
 * mentions no company is inserted under a sentinel "general-news"
 * pseudo-company — see /api/cron/scrape-rss/route.ts).
 */
export async function matchArticleToFirstCompany(
  title: string,
  content: string,
): Promise<string | null> {
  const ids = await matchArticleToCompanies(title, content);
  return ids.length > 0 ? ids[0] : null;
}
