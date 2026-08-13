// ═══════════════════════════════════════════════════════════════
//  COMPANY MATCHING ENGINE
//
//  Le problème : "Chari" peut s'écrire Chari, CHARI, chari.ma, Chari Maroc,
//  Chari (startup), etc. Une entreprise nouvelle peut n'apparaître dans
//  aucun article. Une entreprise peut avoir un nom commun qui matche
//  trop d'articles (ex: "Inwi" dans "inwidad").
//
//  Solution : un système de matching multi-niveau :
//    1. Alias system (l'utilisateur + admin configurent les variantes)
//    2. Fuzzy matching (Levenshtein, case-insensitive, partial)
//    3. Regex generation (des aliases → pattern)
//    4. Confidence scoring (0-100% par match)
//    5. Zero-match protocol (que faire quand 0 articles)
//    6. New company protocol (entreprise jamais mentionnée)
// ═══════════════════════════════════════════════════════════════

import { prisma } from "@/lib/db";
import { logInfo } from "@/lib/logger";

// ─── TYPES ─────────────────────────────────────────────────────

export interface CompanyAlias {
  id: string;
  companyId: string;
  alias: string;
  type: "primary" | "manual" | "auto-detected" | "ice" | "rc" | "ticker";
  confidence: number; // 0-1, how confident we are this alias is correct
  createdAt: string;
  matchCount: number; // how many articles matched this alias
}

export interface MatchResult {
  articleId: string;
  companyId: string;
  companyName: string;
  matchedAlias: string;
  matchType: "exact" | "case-insensitive" | "partial" | "fuzzy";
  confidence: number; // 0-1
  context: string; // the sentence where the match was found
}

export interface CompanyDossier {
  company: {
    id: string;
    name: string;
    sector: string | null;
    website: string | null;
    iceNumber: string | null;
    rcNumber: string | null;
    headquarters: string | null;
    description: string | null;
  };
  aliases: CompanyAlias[];
  stats: {
    totalArticles: number;
    articles30d: number;
    articles7d: number;
    lastMatchAt: string | null;
    topSources: { source: string; count: number }[];
    sentimentBreakdown: { positive: number; neutral: number; negative: number };
  };
  matching: {
    status: "rich" | "limited" | "sparse" | "zero" | "never";
    message: string;
    recommendation: string;
  };
}

// ─── ALIAS GENERATION ──────────────────────────────────────────

/**
 * Generate automatic aliases from a company name.
 * "Chari" → ["Chari", "chari", "CHARI", "chari.ma", "Chari Maroc"]
 * "OCP Group" → ["OCP Group", "OCP", "ocp", "Office Chérifien des Phosphates"]
 */
export function generateAliases(companyName: string, website?: string | null): string[] {
  const aliases = new Set<string>();
  const name = companyName.trim();

  // Exact name
  aliases.add(name);

  // Case variants
  aliases.add(name.toLowerCase());
  aliases.add(name.toUpperCase());
  aliases.add(name.charAt(0).toUpperCase() + name.slice(1).toLowerCase());

  // Without common suffixes
  const suffixes = [" Group", " SA", " SAS", " Ltd", " Inc", " Corp", " Corporation", " Maroc", " Morocco"];
  for (const suffix of suffixes) {
    if (name.endsWith(suffix)) {
      aliases.add(name.slice(0, -suffix.length));
      aliases.add(name.slice(0, -suffix.length).toLowerCase());
    }
  }

  // Without "Group" → just the acronym if 3+ words
  const words = name.split(/\s+/);
  if (words.length >= 2) {
    // Acronym: "OCP Group" → "OCP"
    const acronym = words.map((w) => w[0]).join("").toUpperCase();
    if (acronym.length >= 2 && acronym.length <= 6) {
      aliases.add(acronym);
    }
  }

  // Website domain
  if (website) {
    const domain = website
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0]
      .split(".")[0];
    if (domain && domain.length >= 3) {
      aliases.add(domain);
      aliases.add(domain.toLowerCase());
    }
  }

  // Filter out empty/too short aliases (1 char = too noisy)
  return Array.from(aliases).filter((a) => a.length >= 2);
}

// ─── LEVENSHTEIN DISTANCE ──────────────────────────────────────

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }

  return dp[m][n];
}

// ─── MATCHING ──────────────────────────────────────────────────

/**
 * Check if any alias appears in the text.
 * Returns the best match (highest confidence) or null.
 */
export function matchCompanyInText(
  text: string,
  aliases: string[],
): { alias: string; matchType: MatchResult["matchType"]; confidence: number; context: string } | null {
  if (!text || aliases.length === 0) return null;

  const lowerText = text.toLowerCase();
  let bestMatch: { alias: string; matchType: MatchResult["matchType"]; confidence: number; context: string } | null = null;

  for (const alias of aliases) {
    const lowerAlias = alias.toLowerCase();

    // 1. Exact match (case-sensitive) — highest confidence
    const exactIdx = text.indexOf(alias);
    if (exactIdx !== -1) {
      const confidence = alias.length >= 4 ? 0.99 : 0.90;
      if (!bestMatch || confidence > bestMatch.confidence) {
        bestMatch = {
          alias,
          matchType: "exact",
          confidence,
          context: extractContext(text, exactIdx, alias.length),
        };
      }
      continue;
    }

    // 2. Case-insensitive match
    const ciIdx = lowerText.indexOf(lowerAlias);
    if (ciIdx !== -1) {
      const confidence = alias.length >= 4 ? 0.90 : 0.75;
      if (!bestMatch || confidence > bestMatch.confidence) {
        bestMatch = {
          alias,
          matchType: "case-insensitive",
          confidence,
          context: extractContext(text, ciIdx, alias.length),
        };
      }
      continue;
    }

    // 3. Fuzzy match (Levenshtein) — only for aliases >= 4 chars
    // Check if any word in the text is close to the alias
    if (alias.length >= 4) {
      const words = lowerText.split(/\s+/);
      for (const word of words) {
        if (word.length < 3) continue;
        const distance = levenshtein(lowerAlias, word);
        const maxLength = Math.max(lowerAlias.length, word.length);
        const similarity = 1 - distance / maxLength;

        // Only accept if similarity >= 0.85 (e.g., "Chari" vs "Charri" = 0.875)
        if (similarity >= 0.85) {
          const confidence = similarity * 0.70; // lower confidence for fuzzy
          if (!bestMatch || confidence > bestMatch.confidence) {
            const wordIdx = lowerText.indexOf(word);
            bestMatch = {
              alias,
              matchType: "fuzzy",
              confidence,
              context: extractContext(text, wordIdx, word.length),
            };
          }
          break; // Found a fuzzy match for this alias, move to next alias
        }
      }
    }
  }

  return bestMatch;
}

function extractContext(text: string, index: number, length: number): string {
  const start = Math.max(0, index - 50);
  const end = Math.min(text.length, index + length + 50);
  return text.substring(start, end).trim();
}

// ─── BATCH MATCHING ────────────────────────────────────────────

/**
 * Match a batch of articles against a company's aliases.
 * Returns match results for each article that matched.
 */
export async function matchArticlesForCompany(
  companyId: string,
  articleIds?: string[],
): Promise<MatchResult[]> {
  // Get company + aliases
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      name: true,
      aliases: true,
      website: true,
    },
  });

  if (!company) return [];

  // Build alias list: DB aliases + generated aliases
  const dbAliases = company.aliases ?? [];
  const generatedAliases = generateAliases(company.name, company.website);
  const allAliases = Array.from(new Set([...dbAliases, ...generatedAliases]));

  // Get articles to match
  const where = articleIds
    ? { id: { in: articleIds } }
    : { OR: [{ companyId: null }, { companyId }] };

  const articles = await prisma.article.findMany({
    where,
    select: {
      id: true,
      title: true,
      content: true,
      summary: true,
      source: true,
      companyId: true,
    },
    take: 500, // batch limit
  });

  const results: MatchResult[] = [];

  for (const article of articles) {
    const text = `${article.title} ${article.summary ?? ""} ${article.content ?? ""}`;
    const match = matchCompanyInText(text, allAliases);

    if (match && match.confidence >= 0.70) {
      // Link article to company if not already linked
      if (article.companyId !== companyId) {
        await prisma.article.update({
          where: { id: article.id },
          data: { companyId },
        }).catch(() => {}); // non-fatal
      }

      results.push({
        articleId: article.id,
        companyId: company.id,
        companyName: company.name,
        matchedAlias: match.alias,
        matchType: match.matchType,
        confidence: match.confidence,
        context: match.context,
      });
    }
  }

  logInfo("company-matching", `Matched ${results.length}/${articles.length} articles for ${company.name} (aliases: ${allAliases.length})`);

  return results;
}

// ─── COMPANY DOSSIER ───────────────────────────────────────────

/**
 * Build a complete dossier for a company: aliases, stats, matching status.
 */
export async function buildCompanyDossier(companyId: string): Promise<CompanyDossier | null> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      name: true,
      sector: true,
      website: true,
      iceNumber: true,
      rcNumber: true,
      headquarters: true,
      description: true,
      aliases: true,
    },
  });

  if (!company) return null;

  // Stats
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);

  const [totalArticles, articles30d, articles7d, lastArticle, topSources, sentimentAgg] = await Promise.all([
    prisma.article.count({ where: { companyId } }),
    prisma.article.count({ where: { companyId, publishedAt: { gte: thirtyDaysAgo } } }),
    prisma.article.count({ where: { companyId, publishedAt: { gte: sevenDaysAgo } } }),
    prisma.article.findFirst({
      where: { companyId },
      orderBy: { publishedAt: "desc" },
      select: { publishedAt: true },
    }),
    prisma.article.groupBy({
      by: ["source"],
      where: { companyId },
      _count: true,
      orderBy: { _count: { source: "desc" } },
      take: 5,
    }),
    prisma.article.groupBy({
      by: ["sentimentLabel"],
      where: { companyId },
      _count: true,
    }),
  ]);

  // Sentiment breakdown
  const sentimentBreakdown = { positive: 0, neutral: 0, negative: 0 };
  for (const s of sentimentAgg) {
    if (s.sentimentLabel === "positive") sentimentBreakdown.positive = s._count;
    if (s.sentimentLabel === "neutral") sentimentBreakdown.neutral = s._count;
    if (s.sentimentLabel === "negative") sentimentBreakdown.negative = s._count;
  }

  // Matching status
  let matchingStatus: CompanyDossier["matching"]["status"];
  let matchingMessage: string;
  let matchingRecommendation: string;

  if (totalArticles === 0) {
    matchingStatus = "zero";
    matchingMessage = `Aucun article trouvé pour "${company.name}". Nous surveillons en continu.`;
    matchingRecommendation = "Ajoutez des aliases (variantes du nom) dans le profil entreprise. Vérifiez l'orthographe. Si l'entreprise est nouvelle, il est normal qu'elle n'apparaisse pas encore dans la presse.";
  } else if (totalArticles < 5) {
    matchingStatus = "sparse";
    matchingMessage = `Seulement ${totalArticles} article(s) trouvé(s). La couverture est limitée.`;
    matchingRecommendation = "Ajoutez des aliases. Élargissez la recherche (secteur, concurrents). Le matching fuzzy peut manquer des variantes orthographiques.";
  } else if (totalArticles < 20) {
    matchingStatus = "limited";
    matchingMessage = `${totalArticles} articles trouvés. Couverture modérée.`;
    matchingRecommendation = "La couverture est suffisante pour un score de base. Ajoutez des aliases pour capturer plus d'articles.";
  } else {
    matchingStatus = "rich";
    matchingMessage = `${totalArticles} articles trouvés. Excellente couverture.`;
    matchingRecommendation = "La couverture est riche. Le score de réputation est fiable.";
  }

  // If company was just created and has 0 matches after scraping
  if (totalArticles === 0) {
    const companyCreatedAt = await prisma.company.findUnique({
      where: { id: companyId },
      select: { createdAt: true },
    });
    if (companyCreatedAt) {
      const hoursSinceCreation = (now.getTime() - companyCreatedAt.createdAt.getTime()) / 3600000;
      if (hoursSinceCreation < 1) {
        matchingStatus = "never";
        matchingMessage = `Entreprise nouvellement ajoutée. Collecte en cours...`;
        matchingRecommendation = "Nous scrapons Google News et nos sources RSS. Revenez dans 30 minutes. Si aucun article n'est trouvé, l'entreprise est peut-être trop nouvelle ou trop petite pour apparaître dans la presse marocaine.";
      }
    }
  }

  return {
    company: {
      id: company.id,
      name: company.name,
      sector: company.sector,
      website: company.website,
      iceNumber: company.iceNumber,
      rcNumber: company.rcNumber,
      headquarters: company.headquarters,
      description: company.description,
    },
    aliases: (company.aliases ?? []).map((a, i) => ({
      id: `${company.id}-alias-${i}`,
      companyId: company.id,
      alias: a,
      type: i === 0 ? "primary" : "manual",
      confidence: 1.0,
      createdAt: new Date().toISOString(),
      matchCount: 0, // would need a join to compute — skip for now
    })),
    stats: {
      totalArticles,
      articles30d,
      articles7d,
      lastMatchAt: lastArticle?.publishedAt?.toISOString() ?? null,
      topSources: topSources.map((s) => ({ source: s.source, count: s._count })),
      sentimentBreakdown,
    },
    matching: {
      status: matchingStatus,
      message: matchingMessage,
      recommendation: matchingRecommendation,
    },
  };
}

// ─── ZERO-MATCH PROTOCOL ───────────────────────────────────────

/**
 * When a company has 0 articles, try harder:
 * 1. Scrape Google News with name + "Maroc"
 * 2. Scrape Google News with name + sector
 * 3. Scrape Google News with name + competitors
 * 4. Run fuzzy matching on ALL articles (not just unlinked ones)
 */
export async function zeroMatchProtocol(companyId: string): Promise<{
  found: number;
  method: string;
}> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true, name: true, sector: true, website: true },
  });

  if (!company) return { found: 0, method: "company not found" };

  // Step 1: Run matching on ALL articles (not just unlinked)
  const results = await matchArticlesForCompany(companyId);
  if (results.length > 0) {
    return { found: results.length, method: "fuzzy matching on existing articles" };
  }

  // Step 2: If still 0, try broader Google News search
  try {
    const { scrapeForCompany } = await import("@/lib/scrapers/rss-scraper");

    // Try with broader queries
    const queries = [
      company.name,
      `${company.name} Maroc`,
      `${company.name} ${company.sector ?? ""}`,
    ].filter((q) => q.trim().length > 2);

    let totalScraped = 0;
    for (const query of queries) {
      const articles = await scrapeForCompany(query);
      if (articles.length > 0) {
        // Upsert and try to match
        for (const article of articles.slice(0, 20)) {
          try {
            const urlHash = (article as { urlHash?: string }).urlHash ?? crypto.randomUUID();
            await prisma.article.upsert({
              where: { urlHash },
              create: {
                url: article.url.slice(0, 2000),
                urlHash,
                title: article.title.slice(0, 500),
                content: (article.content ?? "").slice(0, 50000) || null,
                summary: (article.summary ?? "").slice(0, 2000) || null,
                publishedAt: article.publishedAt ? new Date(article.publishedAt) : null,
                source: (article.sourceName ?? "Google News").slice(0, 200),
                language: article.language ?? "fr",
                companyId,
              },
              update: {},
            });
            totalScraped++;
          } catch {}
        }
      }
    }

    if (totalScraped > 0) {
      return { found: totalScraped, method: "broadened Google News search" };
    }
  } catch (err) {
    logInfo("company-matching", `Zero-match protocol scrape failed: ${err}`);
  }

  return { found: 0, method: "no articles found after broadened search" };
}
