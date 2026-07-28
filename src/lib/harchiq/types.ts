// ═══════════════════════════════════════════════════════════════
//  PROJECT AEGIS v3.0 — HarchIQ ONTOLOGY
//  Unified intelligence type system inspired by Palantir Gotham and
//  the STIX/TAXII cyber-threat-intelligence standard.
//
//  This file is the single source of truth for every entity shape,
//  relationship, dossier, alert, collection task and configuration
//  object that flows through the six HarchIQ stages:
//      collect → understand → connect → predict → synthesize → defend
//
//  Design principles:
//  • Every entity carries provenance (sources[], firstSeen, lastSeen)
//  • Every entity carries a confidence score (0..1) and a classification
//  • Aliases enable cross-source entity resolution ("Attijariwafa" ==
//    "Wafa Bank" == "التجاري وفا بنك")
//  • Relationships are first-class citizens (typed, weighted, sourced)
//  • Dossiers are the human-readable synthesis artefact
//
//  Task ID: AEGIS-V3-CORE
//  Module:  harchiq/types
// ═══════════════════════════════════════════════════════════════

// ─── CLASSIFICATION ───────────────────────────────────────────────

/**
 * ClassificationLevel — five-tier sensitivity scale, modeled on the
 * NATO / Moroccan classification ladder. Drives access-control
 * decisions throughout the DEFEND stage.
 *
 *   unclassified  — public OSINT, press releases, regulatory filings
 *   restricted    — internal analysis, draft dossiers
 *   confidential  — client-confidential intelligence products
 *   secret        — board-level / M&A intelligence
 *   top_secret    — nation-state threat intelligence, crown jewels
 */
export type ClassificationLevel =
  | "unclassified"
  | "restricted"
  | "confidential"
  | "secret"
  | "top_secret";

// ─── ENTITY TYPES (STIX-inspired, 30+ types) ──────────────────────

/**
 * EntityType — the closed set of entity kinds HarchIQ can model.
 *
 * Count: 33 types spanning people, organizations, places, events,
 * information artefacts, digital infrastructure, financial instruments,
 * legal constructs, narratives, and cyber-threat-intelligence objects.
 */
export type EntityType =
  // ─ People & organizations (5)
  | "person"
  | "organization"
  | "company"
  | "government_body"
  | "threat_actor"
  // ─ Places & physical assets (4)
  | "location"
  | "facility"
  | "country"
  | "region"
  // ─ Events & temporal (3)
  | "event"
  | "incident"
  | "campaign"
  // ─ Information artefacts (6)
  | "document"
  | "article"
  | "report"
  | "social_post"
  | "narrative"
  | "press_release"
  // ─ Digital infrastructure (6)
  | "website"
  | "domain"
  | "ip_address"
  | "email"
  | "phone"
  | "infrastructure"
  // ─ Financial instruments (3)
  | "financial_account"
  | "cryptocurrency_wallet"
  | "asset"
  // ─ Physical & commercial (3)
  | "vehicle"
  | "product"
  | "sector"
  // ─ Legal constructs (3)
  | "law"
  | "regulation"
  | "contract"
  // ─ Cyber-threat-intelligence objects (5)
  | "vulnerability"
  | "malware"
  | "tool"
  | "attack_pattern"
  | "identity";

// ─── BASE ENTITY ──────────────────────────────────────────────────

/**
 * BaseEntity — the common envelope every entity in the HarchIQ
 * knowledge graph inherits from. Carries provenance, classification,
 * confidence, and tags — the four cross-cutting concerns every
 * intelligence object must expose.
 */
export interface BaseEntity {
  /** Stable UUID (v4) — primary key in the knowledge graph. */
  id: string;
  /** Discriminator — one of the 33 EntityType values. */
  type: EntityType;
  /** All known names for this entity (legal, common, ticker, Arabic…). */
  aliases: string[];
  /** First time HarchIQ observed this entity (ISO-8601). */
  firstSeen: string;
  /** Last time HarchIQ observed an update (ISO-8601). */
  lastSeen: string;
  /** Confidence score in [0,1] — blend of source reliability & freshness. */
  confidence: number;
  /** Provenance — every URL / feed / API that contributed to this entity. */
  sources: EntitySource[];
  /** Free-form metadata bag for stage-specific extensions. */
  metadata: Record<string, unknown>;
  /** Operator / analyst tags for search & filtering (e.g. "ESG", "M&A"). */
  tags: string[];
  /** Sensitivity classification — drives access control in DEFEND. */
  classification: ClassificationLevel;
}

/**
 * EntitySource — a single provenance record. Tracks where a fact came
 * from, when it was observed, and how reliable the upstream source is.
 */
export interface EntitySource {
  /** URL, feed id, or API endpoint that produced the fact. */
  url: string;
  /** Human-readable publisher / system name. */
  name: string;
  /** ISO-8601 timestamp of the observation. */
  retrievedAt: string;
  /** Reliability tier — drives confidence calculation. */
  reliability: "high" | "medium" | "low";
  /** Original snippet / quote that supports the fact (<= 500 chars). */
  snippet?: string;
}

// ─── PERSON ENTITY ────────────────────────────────────────────────

/**
 * PersonEntity — natural persons: executives, officials, journalists,
 * threat actors, etc.
 */
export interface PersonEntity extends BaseEntity {
  type: "person";
  fullName: string;
  firstName?: string;
  lastName?: string;
  nationality?: string;
  occupation?: string;
  /** Job title (e.g. "CEO", "Minister of Economy"). */
  title?: string;
  /** Organizations this person is affiliated with (entity IDs). */
  affiliations: string[];
  /** Educational background (institution, degree, year). */
  education: EducationRecord[];
  /** Contact info — always redacted in unclassified views. */
  contactInfo?: ContactInfo;
  /** Social-media handles keyed by platform. */
  socialMedia: SocialMediaHandle[];
}

export interface EducationRecord {
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startYear?: number;
  endYear?: number;
}

export interface ContactInfo {
  emails?: string[];
  phones?: string[];
  addresses?: string[];
}

export interface SocialMediaHandle {
  platform:
    | "twitter"
    | "linkedin"
    | "facebook"
    | "instagram"
    | "youtube"
    | "tiktok"
    | "telegram"
    | "other";
  handle: string;
  url?: string;
  verified?: boolean;
}

// ─── ORGANIZATION ENTITY ──────────────────────────────────────────

/**
 * OrganizationEntity — legal entities: companies, government bodies,
 * NGOs, threat-actor groups. Sub-typed via the `type` discriminator
 * (company | government_body | organization | threat_actor).
 */
export interface OrganizationEntity extends BaseEntity {
  type:
    | "organization"
    | "company"
    | "government_body"
    | "threat_actor"
    | "identity";
  legalName: string;
  /** Parent organization entity ID (if any). */
  parentOrg?: string;
  foundedDate?: string;
  headquarters?: string;
  industries: string[];
  employees?: number;
  /** Annual revenue in USD. */
  revenue?: number;
  /** Casablanca / Euronext / NYSE ticker. */
  ticker?: string;
  website?: string;
  /** Subsidiary entity IDs. */
  subsidiaries: string[];
}

// ─── ARTICLE ENTITY ───────────────────────────────────────────────

/**
 * ArticleEntity — news articles, blog posts, press releases, regulatory
 * filings. The primary input to the UNDERSTAND stage.
 */
export interface ArticleEntity extends BaseEntity {
  type: "article" | "report" | "press_release" | "social_post";
  title: string;
  /** Full sanitized plain-text content (<= 5 000 chars). */
  content: string;
  /** GLM-generated summary (<= 500 chars). */
  summary: string;
  url: string;
  /** Publisher name (e.g. "Medias24", "Bank Al-Maghrib"). */
  source: string;
  publishedAt: string;
  language: "ar" | "fr" | "en" | string;
  /** Sentiment polarity — produced by UNDERSTAND. */
  sentiment: SentimentPolarity;
  /** Entity IDs mentioned in the article. */
  entities: string[];
  /** Topic tags (e.g. "M&A", "earnings", "regulatory"). */
  topics: string[];
  /** Composite risk score in [0,100] — produced by PREDICT. */
  riskScore: number;
}

export type SentimentPolarity =
  | "very_positive"
  | "positive"
  | "neutral"
  | "negative"
  | "very_negative";

// ─── RELATIONSHIPS ────────────────────────────────────────────────

/**
 * RelationshipType — 30 typed edges between entities. Inspired by
 * STIX SROs (Sighting Relationship Objects) plus business-intelligence
 * edges (ownership, funding, employment, …).
 */
export type RelationshipType =
  // ─ Mention & reference (3)
  | "mention"
  | "citation"
  | "references"
  // ─ Corporate structure (5)
  | "ownership"
  | "subsidiary"
  | "parent_of"
  | "acquisition"
  | "merger"
  // ─ Commercial (5)
  | "partnership"
  | "joint_venture"
  | "supplier"
  | "customer"
  | "competitor"
  // ─ People ↔ organizations (5)
  | "employment"
  | "board_member"
  | "founder"
  | "investor"
  | "reports_to"
  // ─ Financial (3)
  | "funding"
  | "contract_with"
  | "regulated_by"
  // ─ Geospatial (3)
  | "located_in"
  | "headquartered_in"
  | "operates_in"
  // ─ Cyber-threat-intelligence (3)
  | "attacks"
  | "exploits"
  | "targets"
  // ─ Misc (3)
  | "investigates"
  | "affiliated_with"
  | "related_to";

/**
 * Relationship — a typed, weighted, sourced edge between two entities.
 * First-class object: relationships have their own IDs, confidence,
 * and provenance independent of the entities they connect.
 */
export interface Relationship {
  /** Stable UUID. */
  id: string;
  /** Source entity ID. */
  sourceId: string;
  /** Target entity ID. */
  targetId: string;
  /** Edge type — one of the 30 RelationshipType values. */
  type: RelationshipType;
  /** Edge strength in [0,1] — frequency / financial weight / etc. */
  strength: number;
  /** First time this edge was observed. */
  firstSeen: string;
  /** Last time this edge was observed. */
  lastSeen: string;
  /** Provenance — articles / filings / APIs that support this edge. */
  sources: EntitySource[];
}

// ─── INTELLIGENCE DOSSIER ─────────────────────────────────────────

/**
 * IntelligenceDossier — the SYNTHESIZE stage's flagship artefact.
 * A human-readable, board-ready intelligence product on a single
 * company, blending SWOT, risk, reputation, relationships, and
 * actionable recommendations.
 */
export interface IntelligenceDossier {
  /** Company entity ID this dossier covers. */
  company: string;
  /** 2-3 paragraph executive summary. */
  executiveSummary: string;
  /** SWOT analysis — four quadrants of strategic insights. */
  swotAnalysis: SWOTAnalysis;
  /** Key relationship entity IDs (top 10 by strength). */
  keyRelationships: string[];
  /** Composite risk assessment in [0,100]. */
  riskAssessment: RiskAssessment;
  /** Reputation score in [0,100] — blend of sentiment & coverage quality. */
  reputationScore: number;
  /** 3-5 actionable analyst recommendations. */
  recommendations: string[];
  /** ISO-8601 generation timestamp. */
  generatedAt: string;
  /** Overall confidence in the dossier's conclusions. */
  confidenceLevel: number;
  /** Known information gaps — drives the next COLLECT cycle. */
  informationGaps: string[];
}

export interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface RiskAssessment {
  /** Composite risk score [0,100] — higher = riskier. */
  overall: number;
  /** Risk broken down by category. */
  categories: RiskCategoryScore[];
  /** Free-text narrative explaining the score. */
  narrative: string;
}

export interface RiskCategoryScore {
  category:
    | "financial"
    | "operational"
    | "regulatory"
    | "reputational"
    | "cyber"
    | "geopolitical"
    | "esg";
  score: number;
  trend: "improving" | "stable" | "deteriorating";
  rationale: string;
}

// ─── THREAT ALERTS ────────────────────────────────────────────────

/**
 * ThreatAlert — a discrete, actionable signal produced by PREDICT when
 * a risk threshold is crossed. Surfaces in the operator dashboard and
 * (optionally) triggers notifications.
 */
export interface ThreatAlert {
  /** Stable UUID. */
  id: string;
  /** Company entity ID this alert concerns. */
  companyId: string;
  /** Threat category — mirrors RiskCategoryScore.category. */
  threatType:
    | "financial"
    | "operational"
    | "regulatory"
    | "reputational"
    | "cyber"
    | "geopolitical"
    | "esg";
  /** Five-tier severity scale. */
  severity: AlertSeverity;
  /** Short headline (<= 120 chars). */
  title: string;
  /** 1-2 paragraph description. */
  description: string;
  /** Supporting evidence — article IDs, relationship IDs, snippets. */
  evidence: AlertEvidence[];
  /** ISO-8601 detection timestamp. */
  detectedAt: string;
  /** Workflow status. */
  status: "active" | "acknowledged" | "resolved";
  /** 1-3 actionable mitigation recommendations. */
  recommendations: string[];
}

export type AlertSeverity = "info" | "low" | "medium" | "high" | "critical";

export interface AlertEvidence {
  /** Type of evidence — drives rendering in the UI. */
  kind: "article" | "relationship" | "filing" | "social_post" | "snippet";
  /** Entity / relationship / article ID. */
  refId: string;
  /** Human-readable quote (<= 500 chars). */
  snippet: string;
  /** Source URL. */
  url: string;
}

// ─── COLLECTION TASKS ─────────────────────────────────────────────

/**
 * CollectionTask — a unit of work for the COLLECT stage. Tracks a
 * single scrape / API call / crawl from ingestion through to dedupe.
 *
 * Persisted to the DB so we can audit collection cadence, surface
 * failing sources, and replay on-demand.
 */
export interface CollectionTask {
  /** Stable UUID. */
  id: string;
  /** Source id from sources-config.ts (e.g. "telquel", "google-news-ma"). */
  source: string;
  /** Search query or company name. */
  query: string;
  /** Lifecycle status. */
  status: "pending" | "running" | "completed" | "failed";
  /** ISO-8601 scheduled start time. */
  scheduledAt: string;
  /** ISO-8601 completion time (set when status = completed | failed). */
  completedAt?: string;
  /** Number of articles found (post-dedupe). */
  articlesFound: number;
  /** Non-fatal errors encountered during collection. */
  errors: CollectionError[];
}

export interface CollectionError {
  code: string;
  message: string;
  occurredAt: string;
  /** HTTP status if applicable. */
  statusCode?: number;
}

// ─── COLLECTION RESULT (shared across collectors) ─────────────────

/**
 * CollectionResult — the unified payload returned by every collector
 * in the COLLECT stage (RSS, social, financial). Wraps a ScrapedArticle
 * (or its moral equivalent) with collection provenance.
 */
export interface CollectionResult {
  /** Stable URL hash — primary dedupe key. */
  urlHash: string;
  /** Article title (sanitized). */
  title: string;
  /** Canonical article URL. */
  url: string;
  /** Publisher / source name. */
  source: string;
  /** ISO-8601 publication date (best-effort). */
  publishedAt: string | null;
  /** Snippet / summary / first 500 chars of content. */
  snippet: string;
  /** Full sanitized content (<= 5 000 chars) — null until fetched. */
  fullContent: string | null;
  /** Detected language code (ar | fr | en | …). */
  language: string;
  /** Collector that produced this result. */
  collector: "rss" | "twitter" | "linkedin" | "facebook" | "bam" | "ammc" | "bourse";
  /** ISO-8601 collection timestamp. */
  collectedAt: string;
  /** Source reliability tier — drives confidence calculation. */
  reliability: "high" | "medium" | "low";
}

// ─── HarchIQ CONFIG ───────────────────────────────────────────────

/**
 * HarchIQConfig — global engine configuration. Loaded from environment
 * with sensible defaults; overridable per-request for tests.
 */
export interface HarchIQConfig {
  /** GLM model selection for each stage. */
  models: ModelConfig;
  /** Per-tier rate limits (mirrors DEFEND stage constants). */
  rateLimits: Record<RateLimitTier, RateLimitRule>;
  /** In-memory cache settings. */
  cache: CacheConfig;
  /** Collection tuning. */
  collection: CollectionConfig;
  /** Classification ceiling for this deployment. */
  maxClassification: ClassificationLevel;
}

export interface ModelConfig {
  /** Cheap model for triage / classification (default: glm-4-flash). */
  triage: string;
  /** Premium model for synthesis / dossier generation (glm-4). */
  synthesis: string;
  /** Model used for embedding / similarity (reserved). */
  embedding: string;
  /** Max tokens per request. */
  maxTokens: number;
  /** Sampling temperature [0,1]. */
  temperature: number;
  /** Request timeout (ms). */
  timeoutMs: number;
}

export type RateLimitTier =
  | "anonymous"
  | "user"
  | "api_pro"
  | "api_enterprise"
  | "internal";

export interface RateLimitRule {
  /** Max requests in the window. */
  maxRequests: number;
  /** Window size in milliseconds. */
  windowMs: number;
}

export interface CacheConfig {
  /** Whether the in-memory cache is enabled. */
  enabled: boolean;
  /** TTL for cached responses (ms). */
  ttlMs: number;
  /** Max entries before LRU eviction. */
  maxEntries: number;
}

export interface CollectionConfig {
  /** Max articles to enrich with full content per company. */
  maxFullContentFetch: number;
  /** Per-source polite delay (ms). */
  defaultRateLimitMs: number;
  /** Concurrent collector batches. */
  concurrency: number;
  /** Whether to collect from social stubs. */
  enableSocial: boolean;
  /** Whether to collect from regulatory feeds (BAM / AMMC). */
  enableRegulatory: boolean;
}

// ─── DEFAULT CONFIG (factory) ─────────────────────────────────────

/**
 * Default HarchIQ configuration — production-safe values. Override
 * specific fields per-environment via HarchIQConfig merging.
 */
export const DEFAULT_HARCHIQ_CONFIG: HarchIQConfig = {
  models: {
    triage: "glm-4-flash",
    synthesis: "glm-4",
    embedding: "embedding-2",
    maxTokens: 4096,
    temperature: 0.3,
    timeoutMs: 30_000,
  },
  rateLimits: {
    anonymous: { maxRequests: 10, windowMs: 15 * 60 * 1000 },
    user: { maxRequests: 100, windowMs: 15 * 60 * 1000 },
    api_pro: { maxRequests: 60, windowMs: 60 * 1000 },
    api_enterprise: { maxRequests: 600, windowMs: 60 * 1000 },
    internal: { maxRequests: 10_000, windowMs: 60 * 1000 },
  },
  cache: {
    enabled: true,
    ttlMs: 24 * 60 * 60 * 1000,
    maxEntries: 5000,
  },
  collection: {
    maxFullContentFetch: 20,
    defaultRateLimitMs: 2000,
    concurrency: 5,
    enableSocial: false,
    enableRegulatory: true,
  },
  maxClassification: "confidential",
};

// ─── DISCRIMINATED UNION HELPERS ──────────────────────────────────

/**
 * AnyEntity — convenience union of all entity shapes that extend
 * BaseEntity. Useful for typing collections / graph stores that hold
 * heterogeneous entities.
 */
export type AnyEntity =
  | PersonEntity
  | OrganizationEntity
  | ArticleEntity
  | BaseEntity;
