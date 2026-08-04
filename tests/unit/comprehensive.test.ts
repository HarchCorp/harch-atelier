// ═══════════════════════════════════════════════════════════════
//  COMPLIANCE ENGINE TESTS — Sanctions, PEP, KYC, Adverse Media
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, beforeAll } from "vitest";
import {
  StringMatcher,
  SanctionsScreener,
  PEPScreener,
  AdverseMediaDetector,
  KYCScorer,
  ComplianceReportGenerator,
  MOCK_OFAC_ENTRIES,
  MOCK_PEP_ENTRIES,
  type ScreeningRequest,
} from "@/lib/compliance";

// ─── STRING MATCHER TESTS ──────────────────────────────────────

describe("StringMatcher", () => {
  describe("levenshteinDistance", () => {
    it("returns 0 for identical strings", () => {
      expect(StringMatcher.levenshteinDistance("hello", "hello")).toBe(0);
    });

    it("returns correct distance for one edit", () => {
      expect(StringMatcher.levenshteinDistance("hello", "hallo")).toBe(1);
      expect(StringMatcher.levenshteinDistance("hello", "hell")).toBe(1);
      expect(StringMatcher.levenshteinDistance("hello", "helloo")).toBe(1);
    });

    it("returns correct distance for multiple edits", () => {
      expect(StringMatcher.levenshteinDistance("kitten", "sitting")).toBe(3);
      expect(StringMatcher.levenshteinDistance("saturday", "sunday")).toBe(3);
    });

    it("handles empty strings", () => {
      expect(StringMatcher.levenshteinDistance("", "")).toBe(0);
      expect(StringMatcher.levenshteinDistance("hello", "")).toBe(5);
      expect(StringMatcher.levenshteinDistance("", "hello")).toBe(5);
    });
  });

  describe("similarity", () => {
    it("returns 1.0 for identical strings", () => {
      expect(StringMatcher.similarity("test", "test")).toBe(1.0);
    });

    it("returns high similarity for similar strings", () => {
      expect(StringMatcher.similarity("John Doe", "Jon Doe")).toBeGreaterThan(0.8);
    });

    it("returns low similarity for different strings", () => {
      expect(StringMatcher.similarity("hello", "world")).toBeLessThan(0.3);
    });

    it("is case insensitive", () => {
      expect(StringMatcher.similarity("HELLO", "hello")).toBe(1.0);
    });

    it("handles empty strings", () => {
      expect(StringMatcher.similarity("", "")).toBe(1.0);
      expect(StringMatcher.similarity("test", "")).toBe(0.0);
    });
  });

  describe("jaroWinkler", () => {
    it("returns 1.0 for identical strings", () => {
      expect(StringMatcher.jaroWinkler("test", "test")).toBe(1.0);
    });

    it("returns high score for strings with common prefix", () => {
      expect(StringMatcher.jaroWinkler("MARTHA", "MARHTA")).toBeGreaterThan(0.9);
    });

    it("returns lower score for completely different strings", () => {
      expect(StringMatcher.jaroWinkler("abc", "xyz")).toBeLessThan(0.5);
    });
  });

  describe("tokenSimilarity", () => {
    it("returns 1.0 for identical tokenized strings", () => {
      expect(StringMatcher.tokenSimilarity("Bank of Africa", "Bank of Africa")).toBe(1.0);
    });

    it("returns partial similarity for overlapping tokens", () => {
      const sim = StringMatcher.tokenSimilarity("Bank of Africa", "Africa Bank Group");
      expect(sim).toBeGreaterThan(0);
      expect(sim).toBeLessThan(1);
    });

    it("returns 0 for no common tokens", () => {
      expect(StringMatcher.tokenSimilarity("hello world", "foo bar")).toBe(0);
    });
  });

  describe("bestMatch", () => {
    it("finds exact match", () => {
      const result = StringMatcher.bestMatch("John Doe", ["John Doe", "Jane Smith", "Bob Wilson"]);
      expect(result.match).toBe("John Doe");
      expect(result.score).toBe(1.0);
    });

    it("finds closest match", () => {
      const result = StringMatcher.bestMatch("Jon Doe", ["John Doe", "Jane Smith", "Bob Wilson"], 0.8);
      expect(result.match).toBe("John Doe");
      expect(result.score).toBeGreaterThan(0.8);
    });

    it("returns null when no match above threshold", () => {
      const result = StringMatcher.bestMatch("xyz123", ["John Doe", "Jane Smith"], 0.8);
      expect(result.match).toBeNull();
    });
  });
});

// ─── SANCTIONS SCREENER TESTS ─────────────────────────────────

describe("SanctionsScreener", () => {
  let screener: SanctionsScreener;

  beforeAll(() => {
    screener = new SanctionsScreener();
    screener.loadList("OFAC", MOCK_OFAC_ENTRIES);
  });

  it("loads OFAC list correctly", () => {
    expect(screener.getList("OFAC")).toHaveLength(MOCK_OFAC_ENTRIES.length);
  });

  it("returns empty for unloaded lists", () => {
    expect(screener.getList("EU")).toHaveLength(0);
    expect(screener.getList("UN")).toHaveLength(0);
  });

  it("finds exact match", () => {
    const result = screener.screen({
      entityName: "John Doe",
      lists: ["OFAC"],
      fuzzy: false,
      threshold: 0.95,
    });
    expect(result.matched).toBe(true);
    expect(result.matches.length).toBeGreaterThan(0);
    expect(result.matches[0].matchType).toBe("exact");
  });

  it("finds fuzzy match", () => {
    const result = screener.screen({
      entityName: "Jon Doe",
      lists: ["OFAC"],
      fuzzy: true,
      threshold: 0.80,
    });
    expect(result.matched).toBe(true);
    expect(result.matches[0].matchScore).toBeGreaterThan(0.8);
  });

  it("finds alias match", () => {
    const result = screener.screen({
      entityName: "J. Doe",
      aliases: ["Johnny Doe"],
      lists: ["OFAC"],
      fuzzy: true,
      threshold: 0.80,
    });
    expect(result.matched).toBe(true);
  });

  it("returns no match for clean entity", () => {
    const result = screener.screen({
      entityName: "Mostafa Terrab",
      lists: ["OFAC"],
      fuzzy: true,
      threshold: 0.85,
    });
    expect(result.matched).toBe(false);
    expect(result.matches).toHaveLength(0);
  });

  it("sorts matches by score (highest first)", () => {
    const result = screener.screen({
      entityName: "John Doe",
      aliases: ["Jon Doe", "Johnny Doe"],
      lists: ["OFAC"],
      fuzzy: true,
      threshold: 0.70,
    });
    if (result.matches.length > 1) {
      expect(result.matches[0].matchScore).toBeGreaterThanOrEqual(result.matches[1].matchScore);
    }
  });

  it("tracks entries scanned", () => {
    const result = screener.screen({
      entityName: "Test Entity",
      lists: ["OFAC"],
      fuzzy: true,
    });
    expect(result.entriesScanned).toBe(MOCK_OFAC_ENTRIES.length);
  });

  it("tracks lists checked", () => {
    const result = screener.screen({
      entityName: "Test",
      lists: ["OFAC", "EU"],
    });
    expect(result.listsChecked).toBe(2);
  });

  it("quickScreen returns boolean", () => {
    expect(screener.quickScreen("John Doe")).toBe(true);
    expect(screener.quickScreen("Clean Person")).toBe(false);
  });

  it("fuzzyScreen returns matches array", () => {
    const matches = screener.fuzzyScreen("Jon Doe", 0.80, ["OFAC"]);
    expect(matches.length).toBeGreaterThan(0);
  });

  it("tracks stale lists", () => {
    expect(screener.isStale("OFAC", 0)).toBe(true);
    expect(screener.isStale("EU")).toBe(true);
  });

  it("returns correct stats", () => {
    const stats = screener.getStats();
    expect(stats.ofac).toBe(MOCK_OFAC_ENTRIES.length);
    expect(stats.eu).toBe(0);
    expect(stats.un).toBe(0);
    expect(stats.total).toBe(MOCK_OFAC_ENTRIES.length);
  });
});

// ─── PEP SCREENER TESTS ───────────────────────────────────────

describe("PEPScreener", () => {
  let screener: PEPScreener;

  beforeAll(() => {
    screener = new PEPScreener();
    screener.loadPEPs(MOCK_PEP_ENTRIES);
  });

  it("loads PEP list correctly", () => {
    expect(screener.getCount()).toBe(MOCK_PEP_ENTRIES.length);
  });

  it("identifies PEP", () => {
    const result = screener.screen("Abdellatif Jouahri");
    expect(result.isPEP).toBe(true);
    expect(result.pepLevel).not.toBe("none");
  });

  it("does not identify non-PEP", () => {
    const result = screener.screen("Random Person");
    expect(result.isPEP).toBe(false);
    expect(result.pepLevel).toBe("none");
  });

  it("determines correct PEP level for exact match", () => {
    const result = screener.screen("Nadia Fettah Alaoui");
    expect(result.isPEP).toBe(true);
    expect(result.pepLevel).toBe("very_high");
  });

  it("returns matches with scores", () => {
    const result = screener.screen("Aziz Akhannouch");
    expect(result.matches.length).toBeGreaterThan(0);
    expect(result.matches[0].matchScore).toBeGreaterThan(0.9);
  });
});

// ─── ADVERSE MEDIA DETECTOR TESTS ─────────────────────────────

describe("AdverseMediaDetector", () => {
  let detector: AdverseMediaDetector;

  beforeAll(() => {
    detector = new AdverseMediaDetector();
  });

  it("detects fraud keywords", () => {
    const result = detector.analyze("Company involved in accounting fraud scandal");
    expect(result.categories).toContain("fraud");
    expect(result.severity).not.toBe("low");
  });

  it("detects corruption keywords", () => {
    const result = detector.analyze("Bribery allegations surface in procurement deal");
    expect(result.categories).toContain("corruption");
  });

  it("detects money laundering keywords", () => {
    const result = detector.analyze("AML investigation reveals money laundering patterns");
    expect(result.categories).toContain("money_laundering");
  });

  it("detects multiple categories", () => {
    const result = detector.analyze("Fraud and corruption charges in money laundering case");
    expect(result.categories.length).toBeGreaterThan(1);
  });

  it("returns low severity for clean text", () => {
    const result = detector.analyze("Company announces strong quarterly results");
    expect(result.categories).toHaveLength(0);
    expect(result.severity).toBe("low");
  });

  it("returns critical for severe keywords", () => {
    const result = detector.analyze("Terrorism financing and narcotics trafficking charges filed");
    expect(result.severity).toBe("critical");
  });

  it("screens articles and returns results", () => {
    const result = detector.screen("Test Company", [
      { title: "Fraud investigation launched", source: "TelQuel", date: "2026-08-01", content: "Accounting fraud discovered" },
      { title: "Strong results announced", source: "Medias24", date: "2026-08-02", content: "Revenue growth continues" },
    ]);
    expect(result.hasAdverseMedia).toBe(true);
    expect(result.articles.length).toBe(1);
    expect(result.articles[0].title).toContain("Fraud");
  });

  it("returns risk score", () => {
    const result = detector.screen("Test", [
      { title: "Critical corruption scandal", source: "Test", date: "2026-08-01", content: "Massive corruption and bribery uncovered" },
    ]);
    expect(result.riskScore).toBeGreaterThan(0);
  });
});

// ─── KYC SCORER TESTS ─────────────────────────────────────────

describe("KYCScorer", () => {
  let kyc: KYCScorer;

  beforeAll(() => {
    const screener = new SanctionsScreener();
    screener.loadList("OFAC", MOCK_OFAC_ENTRIES);
    const pep = new PEPScreener();
    pep.loadPEPs(MOCK_PEP_ENTRIES);
    const adverse = new AdverseMediaDetector();
    kyc = new KYCScorer(screener, pep, adverse);
  });

  it("returns low risk for clean entity", () => {
    const result = kyc.assess("Clean Company SA", [], [
      { title: "Strong quarterly results", source: "Test", date: "2026-08-01", sentiment: "positive" },
    ]);
    expect(result.overallRisk).toBe("low");
    expect(result.score).toBeLessThan(50);
  });

  it("returns prohibited for sanctions match", () => {
    const result = kyc.assess("John Doe", [], []);
    expect(result.sanctionsRisk).toBe("prohibited");
    expect(result.overallRisk).toBe("prohibited");
  });

  it("includes recommendations", () => {
    const result = kyc.assess("John Doe", [], []);
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.recommendations[0]).toContain("IMMEDIATE ACTION");
  });

  it("assesses PEP risk", () => {
    const result = kyc.assess("Abdellatif Jouahri", [], []);
    expect(result.pepRisk).not.toBe("low");
  });

  it("assesses adverse media risk", () => {
    const result = kyc.assess("Test Corp", [], [
      { title: "Fraud scandal", source: "Test", date: "2026-08-01", content: "Massive fraud uncovered" },
    ]);
    expect(result.adverseMediaRisk).not.toBe("low");
  });

  it("calculates overall score", () => {
    const clean = kyc.assess("Clean Entity", [], []);
    const risky = kyc.assess("John Doe", [], []);
    expect(risky.score).toBeGreaterThan(clean.score);
  });
});

// ─── COMPLIANCE REPORT GENERATOR TESTS ────────────────────────

describe("ComplianceReportGenerator", () => {
  let reportGen: ComplianceReportGenerator;

  beforeAll(() => {
    const screener = new SanctionsScreener();
    screener.loadList("OFAC", MOCK_OFAC_ENTRIES);
    const pep = new PEPScreener();
    pep.loadPEPs(MOCK_PEP_ENTRIES);
    const adverse = new AdverseMediaDetector();
    const kyc = new KYCScorer(screener, pep, adverse);
    reportGen = new ComplianceReportGenerator(kyc);
  });

  it("generates a report for clean entity", () => {
    const report = reportGen.generate("Clean Company SA", [], []);
    expect(report.entityName).toBe("Clean Company SA");
    expect(report.status).toBe("clear");
    expect(report.summary).toContain("Clean Company SA");
  });

  it("generates a report for sanctioned entity", () => {
    const report = reportGen.generate("John Doe", [], []);
    expect(report.status).toBe("prohibited");
    expect(report.kyc.overallRisk).toBe("prohibited");
  });

  it("includes screening results", () => {
    const report = reportGen.generate("Test Entity", [], []);
    expect(report.screening).toBeDefined();
    expect(report.screening.entriesScanned).toBeGreaterThan(0);
  });

  it("includes PEP results", () => {
    const report = reportGen.generate("Test Entity", [], []);
    expect(report.pep).toBeDefined();
  });

  it("includes adverse media results", () => {
    const report = reportGen.generate("Test Entity", [], [
      { title: "Test article", source: "Test", date: "2026-08-01" },
    ]);
    expect(report.adverseMedia).toBeDefined();
  });

  it("includes KYC results", () => {
    const report = reportGen.generate("Test Entity", [], []);
    expect(report.kyc).toBeDefined();
    expect(report.kyc.score).toBeGreaterThanOrEqual(0);
  });

  it("includes recommendations", () => {
    const report = reportGen.generate("John Doe", [], []);
    expect(report.recommendations.length).toBeGreaterThan(0);
  });

  it("includes summary text", () => {
    const report = reportGen.generate("Test Entity", [], []);
    expect(report.summary).toContain("Test Entity");
    expect(report.summary.length).toBeGreaterThan(50);
  });

  it("includes generation timestamp", () => {
    const report = reportGen.generate("Test", [], []);
    expect(report.generatedAt).toBeDefined();
  });
});

// ─── FEED MANAGER TESTS ───────────────────────────────────────

import { FeedManager, ALL_FEED_SOURCES, MOROCCAN_RSS_FEEDS, REGULATORY_FEEDS, AI_ENGINE_FEEDS } from "@/lib/feed-manager";

describe("FeedManager", () => {
  it("initializes with all feed sources", () => {
    const manager = new FeedManager();
    expect(manager.getAllSources().length).toBe(ALL_FEED_SOURCES.length);
  });

  it("returns enabled sources", () => {
    const manager = new FeedManager();
    const enabled = manager.getEnabledSources();
    expect(enabled.length).toBeGreaterThan(0);
    expect(enabled.every(s => s.enabled)).toBe(true);
  });

  it("filters by type", () => {
    const manager = new FeedManager();
    const rss = manager.getSourcesByType("rss");
    expect(rss.length).toBe(MOROCCAN_RSS_FEEDS.length);
  });

  it("filters by language", () => {
    const manager = new FeedManager();
    const french = manager.getSourcesByLanguage("fr" as never);
    expect(french.length).toBeGreaterThan(0);
  });

  it("enables and disables sources", () => {
    const manager = new FeedManager();
    manager.disableSource("feed-hespress");
    expect(manager.getSource("feed-hespress")?.enabled).toBe(false);
    manager.enableSource("feed-hespress");
    expect(manager.getSource("feed-hespress")?.enabled).toBe(true);
  });

  it("checks rate limiting", () => {
    const manager = new FeedManager();
    expect(manager.canScrape("feed-hespress")).toBe(true);
  });

  it("returns feed stats", () => {
    const manager = new FeedManager();
    const stats = manager.getStats();
    expect(stats.totalSources).toBe(ALL_FEED_SOURCES.length);
    expect(stats.enabledSources).toBeGreaterThan(0);
  });

  it("finds sources needing scrape", () => {
    const manager = new FeedManager();
    const due = manager.getSourcesNeedingScrape();
    expect(due.length).toBeGreaterThan(0);
  });

  it("records scrape results", () => {
    const manager = new FeedManager();
    manager.recordScrapeResult({
      sourceId: "feed-hespress",
      success: true,
      articlesFound: 10,
      articlesNew: 8,
      articlesDuplicate: 2,
      duration: 500,
      timestamp: new Date().toISOString(),
      sampleTitles: ["Test article"],
    });
    const source = manager.getSource("feed-hespress");
    expect(source?.lastScrape).toBeDefined();
    expect(source?.successCount).toBe(1);
  });

  it("tracks errors", () => {
    const manager = new FeedManager();
    manager.recordScrapeResult({
      sourceId: "feed-hespress",
      success: false,
      articlesFound: 0,
      articlesNew: 0,
      articlesDuplicate: 0,
      duration: 100,
      error: "Connection refused",
      timestamp: new Date().toISOString(),
      sampleTitles: [],
    });
    const source = manager.getSource("feed-hespress");
    expect(source?.errorCount).toBe(1);
    expect(source?.lastError).toBe("Connection refused");
  });

  it("resets errors", () => {
    const manager = new FeedManager();
    manager.recordScrapeResult({
      sourceId: "feed-hespress",
      success: false,
      articlesFound: 0,
      articlesNew: 0,
      articlesDuplicate: 0,
      duration: 100,
      error: "Test error",
      timestamp: new Date().toISOString(),
      sampleTitles: [],
    });
    manager.resetErrors("feed-hespress");
    const source = manager.getSource("feed-hespress");
    expect(source?.errorCount).toBe(0);
    expect(source?.lastError).toBeUndefined();
  });
});

// ─── RSS PARSER TESTS ─────────────────────────────────────────

import { RSSParser, type RSSItem } from "@/lib/feed-manager";

describe("RSSParser", () => {
  it("parses valid RSS XML", () => {
    const xml = `<?xml version="1.0"?>
      <rss version="2.0">
        <channel>
          <title>Test Feed</title>
          <link>https://example.com</link>
          <description>Test Description</description>
          <language>fr</language>
          <item>
            <title>Test Article 1</title>
            <link>https://example.com/1</link>
            <description>Test content 1</description>
            <pubDate>Mon, 01 Aug 2026 10:00:00 GMT</pubDate>
          </item>
          <item>
            <title>Test Article 2</title>
            <link>https://example.com/2</link>
            <description>Test content 2</description>
          </item>
        </channel>
      </rss>`;

    const feed = RSSParser.parse(xml);
    expect(feed).not.toBeNull();
    expect(feed!.title).toBe("Test Feed");
    expect(feed!.items).toHaveLength(2);
    expect(feed!.items[0].title).toBe("Test Article 1");
    expect(feed!.items[0].link).toBe("https://example.com/1");
  });

  it("returns null for invalid XML", () => {
    expect(RSSParser.parse("not xml")).not.toBeNull();
  });

  it("strips HTML from descriptions", () => {
    const xml = `<rss><channel><title>Test</title><link>https://test.com</link><description>Desc</description>
      <item><title>Test</title><link>https://test.com/1</link><description><![CDATA[<p>Hello <b>world</b></p>]]></description></item>
    </channel></rss>`;
    const feed = RSSParser.parse(xml);
    expect(feed!.items[0].description).toBe("Hello world");
  });
});

// ─── QUERY BUILDER TESTS ──────────────────────────────────────

import { ArticleQueryBuilder, AlertQueryBuilder, createArticleQuery } from "@/lib/query-builder";

describe("ArticleQueryBuilder", () => {
  it("builds empty query", () => {
    const query = new ArticleQueryBuilder();
    const built = query.build();
    expect(built.filters).toHaveLength(0);
    expect(built.pagination?.page).toBe(1);
    expect(built.pagination?.limit).toBe(20);
  });

  it("adds where conditions", () => {
    const query = new ArticleQueryBuilder();
    query.whereCompanyId("123").whereSentiment("negative" as never);
    const built = query.build();
    expect(built.filters).toHaveLength(2);
  });

  it("adds sort conditions", () => {
    const query = new ArticleQueryBuilder();
    query.sortByPublishedDate("desc");
    const built = query.build();
    expect(built.sort).toHaveLength(1);
    expect(built.sort![0].field).toBe("publishedAt");
  });

  it("sets pagination", () => {
    const query = new ArticleQueryBuilder();
    query.paginate(3, 50);
    const built = query.build();
    expect(built.pagination?.page).toBe(3);
    expect(built.pagination?.limit).toBe(50);
  });

  it("converts to Prisma where", () => {
    const query = new ArticleQueryBuilder();
    query.whereCompanyId("123").whereSentiment("negative" as never);
    const prismaWhere = query.toPrismaWhere();
    expect(prismaWhere.companyId).toBe("123");
    expect(prismaWhere.sentimentLabel).toBe("negative");
  });

  it("resets properly", () => {
    const query = new ArticleQueryBuilder();
    query.whereCompanyId("123").paginate(5, 50);
    query.reset();
    const built = query.build();
    expect(built.filters).toHaveLength(0);
    expect(built.pagination?.page).toBe(1);
  });

  it("clones properly", () => {
    const query = new ArticleQueryBuilder();
    query.whereCompanyId("123");
    const clone = query.clone();
    clone.whereSentiment("positive" as never);
    expect(query.build().filters).toHaveLength(1);
    expect(clone.build().filters).toHaveLength(2);
  });
});

describe("AlertQueryBuilder", () => {
  it("filters by severity", () => {
    const query = new AlertQueryBuilder();
    query.whereSeverity("critical" as never);
    const built = query.build();
    expect(built.filters).toHaveLength(1);
  });

  it("filters by severity above threshold", () => {
    const query = new AlertQueryBuilder();
    query.whereSeverityAbove("high" as never);
    const built = query.build();
    expect(built.filters).toHaveLength(1);
  });

  it("filters acknowledged", () => {
    const query = new AlertQueryBuilder();
    query.whereAcknowledged(false);
    const built = query.build();
    expect(built.filters).toHaveLength(1);
  });
});

describe("createArticleQuery helper", () => {
  it("creates a new builder instance", () => {
    const q1 = createArticleQuery();
    const q2 = createArticleQuery();
    q1.whereCompanyId("123");
    expect(q1.build().filters).toHaveLength(1);
    expect(q2.build().filters).toHaveLength(0);
  });
});

// ─── CONFIG TESTS ─────────────────────────────────────────────

import { getEnvironment, getFeatureFlags, getMasterConfig, validateConfig, getConfigSummary } from "@/lib/config";

describe("Config", () => {
  it("returns correct environment", () => {
    const env = getEnvironment();
    expect(["development", "staging", "production", "test"]).toContain(env);
  });

  it("returns feature flags", () => {
    const flags = getFeatureFlags();
    expect(flags).toBeDefined();
    expect(typeof flags.enableWhatsApp).toBe("boolean");
    expect(typeof flags.enableDarijaNLP).toBe("boolean");
  });

  it("returns master config", () => {
    const config = getMasterConfig();
    expect(config.env).toBeDefined();
    expect(config.features).toBeDefined();
    expect(config.database).toBeDefined();
    expect(config.auth).toBeDefined();
    expect(config.llm).toBeDefined();
    expect(config.security).toBeDefined();
    expect(config.pricing).toBeDefined();
  });

  it("validates config", () => {
    const config = getMasterConfig();
    const result = validateConfig(config);
    expect(result).toBeDefined();
    expect(typeof result.valid).toBe("boolean");
    expect(Array.isArray(result.errors)).toBe(true);
  });

  it("returns config summary", () => {
    const summary = getConfigSummary();
    expect(summary).toBeDefined();
    expect(summary.environment).toBeDefined();
    expect(summary.version).toBeDefined();
  });

  it("pricing has 3 plans in MAD", () => {
    const config = getMasterConfig();
    expect(config.pricing.currency).toBe("MAD");
    expect(config.pricing.plans).toHaveLength(3);
    expect(config.pricing.plans[0].priceMonthly).toBe(15000);
    expect(config.pricing.plans[1].priceMonthly).toBe(40000);
    expect(config.pricing.plans[2].priceMonthly).toBe(75000);
  });

  it("LLM config has 5 providers", () => {
    const config = getMasterConfig();
    expect(config.llm.providers.zai).toBeDefined();
    expect(config.llm.providers.openai).toBeDefined();
    expect(config.llm.providers.anthropic).toBeDefined();
    expect(config.llm.providers.google).toBeDefined();
    expect(config.llm.providers.local).toBeDefined();
  });

  it("cron config has 15 jobs", () => {
    const config = getMasterConfig();
    expect(config.cron.jobs).toHaveLength(15);
  });

  it("auth config requires 12-char passwords", () => {
    const config = getMasterConfig();
    expect(config.auth.passwordMinLength).toBe(12);
  });
});

// ─── NOTIFICATIONS TESTS ──────────────────────────────────────

import { getChannelsForSeverity, buildWhatsAppMessage, buildEmailMessage, NOTIFICATION_TEMPLATES, getTemplate } from "@/lib/notifications";
import type { User } from "@/lib/types/platform";

describe("Notifications", () => {
  const mockUser = {
    id: "user-1",
    email: "test@harch.atelier",
    name: "Test User",
    whatsappNumber: "+212600000000",
    whatsappAlerts: true,
    alertSeverityThreshold: "high" as never,
  } as unknown as User;

  it("returns dashboard only for info severity", () => {
    const channels = getChannelsForSeverity("info" as never);
    expect(channels).toContain("dashboard");
  });

  it("returns multiple channels for critical severity", () => {
    const channels = getChannelsForSeverity("critical" as never);
    expect(channels.length).toBeGreaterThan(2);
    expect(channels).toContain("dashboard");
    expect(channels).toContain("email");
    expect(channels).toContain("whatsapp");
  });

  it("filters WhatsApp if user has no number", () => {
    const userWithoutWhatsApp = { ...mockUser, whatsappNumber: undefined, whatsappAlerts: false } as unknown as User;
    const channels = getChannelsForSeverity("critical" as never, userWithoutWhatsApp);
    expect(channels).not.toContain("whatsapp");
  });

  it("builds WhatsApp message", () => {
    const message = buildWhatsAppMessage(
      { userId: "1", type: "alert" as never, title: "Test Alert", body: "Test body", severity: "critical" as never, channels: ["whatsapp"] },
      mockUser
    );
    expect(message).not.toBeNull();
    expect(message!.to).toBe("+212600000000");
    expect(message!.body).toContain("Test Alert");
  });

  it("returns null WhatsApp for user without number", () => {
    const message = buildWhatsAppMessage(
      { userId: "1", type: "alert" as never, title: "Test", body: "Body", severity: "info" as never, channels: ["whatsapp"] },
      { ...mockUser, whatsappNumber: undefined } as unknown as User
    );
    expect(message).toBeNull();
  });

  it("builds email message", () => {
    const email = buildEmailMessage(
      { userId: "1", type: "alert" as never, title: "Test Alert", body: "Test body", severity: "high" as never, channels: ["email"] },
      mockUser
    );
    expect(email).not.toBeNull();
    expect(email!.to).toBe("test@harch.atelier");
    expect(email!.subject).toContain("Test Alert");
  });

  it("has notification templates", () => {
    expect(NOTIFICATION_TEMPLATES.length).toBeGreaterThan(5);
  });

  it("finds template by ID", () => {
    const tpl = getTemplate("tpl-alert-critical");
    expect(tpl).toBeDefined();
    expect(tpl!.type).toBe("alert" as never);
  });

  it("critical alert template has all channels", () => {
    const tpl = getTemplate("tpl-alert-critical");
    expect(tpl!.channels.length).toBeGreaterThan(4);
  });
});

// ─── EXPORT ENGINE TESTS ──────────────────────────────────────

import { CSVExporter, JSONExporter, ReportBuilder, DataTransformer } from "@/lib/export-engine";

describe("Export Engine", () => {
  it("exports CSV with headers", () => {
    const data = [
      { Name: "OCP", Score: 91 },
      { Name: "Attijariwafa", Score: 84 },
    ];
    const csv = CSVExporter.export(data);
    expect(csv).toContain("Name");
    expect(csv).toContain("OCP");
    expect(csv).toContain("91");
  });

  it("exports JSON", () => {
    const data = { name: "Test", value: 42 };
    const json = JSONExporter.export(data);
    expect(JSON.parse(json)).toEqual(data);
  });

  it("transforms companies to table", () => {
    const companies = [
      { name: "OCP Group", sector: "Mining", ticker: "OCP", slug: "ocp-group" } as never,
    ];
    const table = DataTransformer.companiesToTable(companies);
    expect(table[0].Name).toBe("OCP Group");
    expect(table[0].Sector).toBe("Mining");
  });

  it("builds report with sections", () => {
    const builder = new ReportBuilder({
      format: "pdf" as never,
      title: "Test Report",
    });
    builder.addTable("test", "Test Table", [{ col1: "val1" }]);
    builder.addText("summary", "Summary", "This is a summary.");
    const doc = builder.build();
    expect(doc.sections).toHaveLength(2);
    expect(doc.sections[0].type).toBe("table");
    expect(doc.sections[1].type).toBe("text");
  });

  it("exports report as PDF (HTML)", () => {
    const builder = new ReportBuilder({
      format: "pdf" as never,
      title: "Test PDF",
    });
    builder.addKPIs("kpis", "Metrics", [{ label: "Score", value: 91 }]);
    const html = builder.export("pdf" as never);
    expect(html).toContain("Test PDF");
    expect(html).toContain("Score");
    expect(html).toContain("91");
  });
});

// ─── DASHBOARD CONFIG TESTS ───────────────────────────────────

import { WIDGET_DEFINITIONS, DEFAULT_LAYOUTS, THEME_DEFINITIONS, DASHBOARD_PRESETS, getWidgetsByAccountType, getDefaultLayout, getThemeByAccountType, getDashboardStats } from "@/lib/dashboard-config";

describe("Dashboard Config", () => {
  it("has widget definitions", () => {
    expect(WIDGET_DEFINITIONS.length).toBeGreaterThan(20);
  });

  it("has 4 default layouts", () => {
    expect(DEFAULT_LAYOUTS.length).toBe(4);
  });

  it("has 4 themes", () => {
    expect(THEME_DEFINITIONS.length).toBe(4);
  });

  it("has presets", () => {
    expect(DASHBOARD_PRESETS.length).toBeGreaterThan(0);
  });

  it("filters widgets by account type", () => {
    const bmWidgets = getWidgetsByAccountType("brand-monitor" as never);
    expect(bmWidgets.length).toBeGreaterThan(0);
  });

  it("returns default layout for each account type", () => {
    const types = ["brand-monitor", "market-competitor", "investment-bank", "harch-alpha"] as const;
    for (const type of types) {
      const layout = getDefaultLayout(type as never);
      expect(layout).toBeDefined();
      expect(layout!.accountType).toBe(type as never);
    }
  });

  it("returns theme for each account type", () => {
    const types = ["brand-monitor", "market-competitor", "investment-bank", "harch-alpha"] as const;
    for (const type of types) {
      const theme = getThemeByAccountType(type as never);
      expect(theme).toBeDefined();
      expect(theme!.colors).toBeDefined();
    }
  });

  it("returns dashboard stats", () => {
    const stats = getDashboardStats();
    expect(stats.widgets).toBeGreaterThan(0);
    expect(stats.layouts).toBe(4);
    expect(stats.themes).toBe(4);
    expect(Object.keys(stats.byAccountType)).toHaveLength(4);
  });
});

// ─── SECURITY TESTS ───────────────────────────────────────────

import { PasswordManager, JWTManager, SessionManager, ApiKeyManager, RateLimiter, InputSanitizer, EncryptionHelper, AuditLogger, IPSecurity, SECURITY_HEADERS } from "@/lib/security";

describe("Security", () => {
  describe("PasswordManager", () => {
    it("hashes and verifies passwords", async () => {
      const password = "TestPass123!";
      const hash = await PasswordManager.hash(password);
      expect(hash).not.toBe(password);
      const verified = await PasswordManager.verify(password, hash);
      expect(verified).toBe(true);
    });

    it("rejects wrong password", async () => {
      const hash = await PasswordManager.hash("correctPassword");
      const verified = await PasswordManager.verify("wrongPassword", hash);
      expect(verified).toBe(false);
    });

    it("validates password against policy", () => {
      const result = PasswordManager.validate("Short1!", { minLength: 12, requireUppercase: true, requireLowercase: true, requireNumbers: true, requireSpecialChars: true, preventCommonPasswords: true, preventReuse: 0, expiryDays: 90 });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("generates secure password", () => {
      const pwd = PasswordManager.generateSecurePassword(24);
      expect(pwd.length).toBe(24);
    });

    it("generates API key with prefix", () => {
      const { key, hash, prefix } = PasswordManager.generateApiKey();
      expect(key).toContain("harch_");
      expect(hash).toHaveLength(64);
      expect(prefix).toContain("harch_");
    });
  });

  describe("JWTManager", () => {
    const secret = "test-secret";

    it("signs and verifies JWT", () => {
      const token = JWTManager.sign({ sub: "user1", email: "test@test.com", role: "user", accountType: "brand-monitor", isDemo: false }, secret);
      const payload = JWTManager.verify(token, secret);
      expect(payload).not.toBeNull();
      expect(payload!.sub).toBe("user1");
    });

    it("rejects invalid token", () => {
      const payload = JWTManager.verify("invalid.token.here", secret);
      expect(payload).toBeNull();
    });

    it("checks expiry", () => {
      const token = JWTManager.sign({ sub: "user1", email: "test@test.com", role: "user", accountType: "brand-monitor", isDemo: false }, secret, 1);
      // Token expires in 1 second
      expect(JWTManager.isExpired(token)).toBe(false);
    });

    it("decodes without verification", () => {
      const token = JWTManager.sign({ sub: "user1", email: "test@test.com", role: "user", accountType: "brand-monitor", isDemo: false }, secret);
      const payload = JWTManager.decode(token);
      expect(payload).not.toBeNull();
      expect(payload!.email).toBe("test@test.com");
    });
  });

  describe("SessionManager", () => {
    it("creates and retrieves session", () => {
      const sm = new SessionManager(5, 60);
      const sessionId = sm.createSession("user1", { email: "test@test.com", role: "user", accountType: "brand-monitor", isDemo: false });
      const session = sm.getSession(sessionId);
      expect(session).not.toBeNull();
      expect(session!.userId).toBe("user1");
    });

    it("destroys session", () => {
      const sm = new SessionManager();
      const sessionId = sm.createSession("user1", { email: "test@test.com", role: "user", accountType: "brand-monitor", isDemo: false });
      sm.destroySession(sessionId);
      expect(sm.getSession(sessionId)).toBeNull();
    });

    it("enforces max sessions", () => {
      const sm = new SessionManager(2, 60);
      sm.createSession("user1", { email: "test@test.com", role: "user", accountType: "brand-monitor", isDemo: false });
      sm.createSession("user1", { email: "test@test.com", role: "user", accountType: "brand-monitor", isDemo: false });
      sm.createSession("user1", { email: "test@test.com", role: "user", accountType: "brand-monitor", isDemo: false });
      expect(sm.getUserSessionCount("user1")).toBe(2);
    });
  });

  describe("ApiKeyManager", () => {
    it("creates and validates API key", () => {
      const akm = new ApiKeyManager();
      const { key, data } = akm.createApiKey("user1", "Test Key", ["read"]);
      const validated = akm.validateApiKey(key);
      expect(validated).not.toBeNull();
      expect(validated!.userId).toBe("user1");
    });

    it("revokes API key", () => {
      const akm = new ApiKeyManager();
      const { key, data } = akm.createApiKey("user1", "Test", ["read"]);
      akm.revokeApiKey(data.id);
      expect(akm.validateApiKey(key)).toBeNull();
    });
  });

  describe("RateLimiter", () => {
    it("allows requests under limit", () => {
      const rl = new RateLimiter();
      const result = rl.check("test-ip", "api");
      expect(result.allowed).toBe(true);
    });

    it("blocks requests over limit", () => {
      const rl = new RateLimiter();
      rl.setConfig("test", { windowMs: 60000, maxRequests: 2, skipSuccessfulRequests: false, skipFailedRequests: false });
      rl.check("ip1", "test");
      rl.check("ip1", "test");
      const result = rl.check("ip1", "test");
      expect(result.allowed).toBe(false);
    });
  });

  describe("InputSanitizer", () => {
    it("sanitizes string", () => {
      const result = InputSanitizer.sanitizeString("<script>alert('xss')</script>Hello");
      expect(result).not.toContain("<script>");
      expect(result).toContain("Hello");
    });

    it("sanitizes HTML", () => {
      const result = InputSanitizer.sanitizeHTML("<b>test</b>");
      expect(result).toBe("&lt;b&gt;test&lt;/b&gt;");
    });

    it("sanitizes email", () => {
      expect(InputSanitizer.sanitizeEmail("  TEST@EXAMPLE.COM  ")).toBe("test@example.com");
    });

    it("sanitizes phone", () => {
      expect(InputSanitizer.sanitizePhone("+212 6 00 00 00 00")).toBe("+212600000000");
    });

    it("sanitizes URL", () => {
      expect(InputSanitizer.sanitizeURL("javascript:alert(1)")).toBe("");
      expect(InputSanitizer.sanitizeURL("https://example.com")).toBe("https://example.com/");
    });

    it("sanitizes filename", () => {
      expect(InputSanitizer.sanitizeFilename("../../etc/passwd")).not.toContain("..");
    });
  });

  describe("EncryptionHelper", () => {
    it("encrypts and decrypts", () => {
      const text = "Hello World";
      const key = "test-key";
      const encrypted = EncryptionHelper.encrypt(text, key);
      expect(encrypted).not.toBe(text);
      const decrypted = EncryptionHelper.decrypt(encrypted, key);
      expect(decrypted).toBe(text);
    });

    it("hashes data", () => {
      const hash = EncryptionHelper.hash("test");
      expect(hash).toHaveLength(64);
    });

    it("generates UUID", () => {
      const uuid = EncryptionHelper.generateUUID();
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });
  });

  describe("AuditLogger", () => {
    it("logs and retrieves entries", () => {
      const logger = new AuditLogger(1000);
      logger.log({ userId: "user1", action: "login", resource: "auth", success: true });
      const entries = logger.getUserActions("user1");
      expect(entries).toHaveLength(1);
      expect(entries[0].action).toBe("login");
    });

    it("filters by resource", () => {
      const logger = new AuditLogger();
      logger.log({ userId: "user1", action: "read", resource: "article", resourceId: "123", success: true });
      const entries = logger.getResourceActions("article");
      expect(entries).toHaveLength(1);
    });
  });

  describe("IPSecurity", () => {
    it("blocks IPs after strikes", () => {
      const ips = new IPSecurity(3, 30);
      ips.addStrike("192.168.1.1");
      ips.addStrike("192.168.1.1");
      expect(ips.isBlocked("192.168.1.1")).toBe(false);
      ips.addStrike("192.168.1.1");
      expect(ips.isBlocked("192.168.1.1")).toBe(true);
    });

    it("identifies private IPs", () => {
      const ips = new IPSecurity();
      expect(ips.isPrivateIP("10.0.0.1")).toBe(true);
      expect(ips.isPrivateIP("192.168.1.1")).toBe(true);
      expect(ips.isPrivateIP("172.16.0.1")).toBe(true);
      expect(ips.isPrivateIP("8.8.8.8")).toBe(false);
    });

    it("identifies localhost", () => {
      const ips = new IPSecurity();
      expect(ips.isLocalhost("127.0.0.1")).toBe(true);
      expect(ips.isLocalhost("::1")).toBe(true);
      expect(ips.isLocalhost("8.8.8.8")).toBe(false);
    });
  });

  it("has security headers", () => {
    expect(SECURITY_HEADERS["X-Content-Type-Options"]).toBe("nosniff");
    expect(SECURITY_HEADERS["X-Frame-Options"]).toBe("DENY");
    expect(SECURITY_HEADERS["Content-Security-Policy"]).toBeDefined();
  });
});

// ─── REALTIME TESTS ───────────────────────────────────────────

import { ConnectionManager, MessageFactory, PriceStreamManager, AlertStreamManager, CHANNEL_DEFINITIONS, getDefaultChannels, getAllChannels } from "@/lib/realtime";

describe("RealTime Engine", () => {
  it("registers and unregisters SSE clients", () => {
    const cm = new ConnectionManager();
    const client = cm.registerSSEClient("user1", ["alerts", "notifications"], {} as Response);
    expect(cm.getStats().activeConnections).toBeGreaterThan(0);
    cm.unregisterSSEClient(client.id);
  });

  it("creates price message", () => {
    const msg = MessageFactory.createPriceMessage("OCP", { price: 850, volume: 100000, changePct: 1.5, tradedAt: new Date().toISOString() } as never);
    expect(msg.channel).toBe("prices");
    expect(msg.type).toBe("price.update");
  });

  it("creates alert message", () => {
    const msg = MessageFactory.createAlertMessage({ id: "1", type: "risk_breach" as never, severity: "critical" as never, title: "Test", body: "Body", triggeredAt: new Date().toISOString() } as never);
    expect(msg.channel).toBe("alerts");
  });

  it("creates system message", () => {
    const msg = MessageFactory.createSystemMessage("status", { healthy: true });
    expect(msg.channel).toBe("system");
  });

  it("has 8 channel definitions", () => {
    expect(CHANNEL_DEFINITIONS.length).toBe(8);
  });

  it("returns default channels", () => {
    const defaults = getDefaultChannels();
    expect(defaults).toContain("alerts");
    expect(defaults).toContain("notifications");
  });

  it("returns all channels", () => {
    const all = getAllChannels();
    expect(all.length).toBe(8);
  });
});

// ─── SCHEDULER TESTS ──────────────────────────────────────────

import { CronParser, JobScheduler, DEFAULT_CRON_JOBS, getScheduler } from "@/lib/scheduler";

describe("Scheduler", () => {
  describe("CronParser", () => {
    it("parses valid cron expression", () => {
      const parsed = CronParser.parse("0 0 7 * * ?");
      expect(parsed).not.toBeNull();
      expect(parsed!.hours).toContain(7);
    });

    it("returns null for invalid expression", () => {
      expect(CronParser.parse("invalid")).toBeNull();
    });

    it("validates cron expression", () => {
      expect(CronParser.validate("0 * * * * ?")).toBe(true);
      expect(CronParser.validate("invalid")).toBe(false);
    });

    it("describes cron in human readable form", () => {
      expect(CronParser.describe("0 */15 * * * ?")).toContain("15 minutes");
      expect(CronParser.describe("0 0 7 * * ?")).toContain("7 AM");
    });

    it("calculates next run", () => {
      const next = CronParser.getNextRun("0 0 * * * ?");
      expect(next).not.toBeNull();
      expect(next!.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe("JobScheduler", () => {
    it("registers jobs", () => {
      const js = new JobScheduler();
      const job = js.register({
        type: "scrape_rss" as never,
        name: "Test Job",
        description: "Test",
        schedule: "0 * * * * ?",
        endpoint: "/api/test",
        priority: "normal",
        timeout: 60000,
        retries: 0,
        maxRetries: 3,
        retryDelay: 5000,
        retryBackoff: 2,
        enabled: true,
      });
      expect(job.id).toBeDefined();
      expect(js.getAllJobs()).toHaveLength(1);
    });

    it("enables and disables jobs", () => {
      const js = new JobScheduler();
      const job = js.register({
        type: "scrape_rss" as never, name: "Test", description: "Test", schedule: "0 * * * * ?",
        endpoint: "/api/test", priority: "normal", timeout: 60000, retries: 0, maxRetries: 3, retryDelay: 5000, retryBackoff: 2, enabled: true,
      });
      js.disable(job.id);
      expect(js.getJob(job.id)?.enabled).toBe(false);
      js.enable(job.id);
      expect(js.getJob(job.id)?.enabled).toBe(true);
    });

    it("returns stats", () => {
      const js = new JobScheduler();
      const stats = js.getStats();
      expect(stats.totalJobs).toBe(0);
      expect(stats.successRate).toBe(0);
    });
  });

  it("has 15 default cron jobs", () => {
    expect(DEFAULT_CRON_JOBS.length).toBe(15);
  });

  it("returns scheduler singleton", () => {
    const s1 = getScheduler();
    const s2 = getScheduler();
    expect(s1).toBe(s2);
  });
});
