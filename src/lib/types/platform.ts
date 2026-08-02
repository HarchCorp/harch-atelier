// ═══════════════════════════════════════════════════════════════
//  COMPREHENSIVE TYPE SYSTEM — Harch Atelier Platform
//
//  This file defines ALL TypeScript types used across the platform.
//  It is the single source of truth for data shapes.
// ═══════════════════════════════════════════════════════════════

// ─── UTILITY TYPES ─────────────────────────────────────────────

export type ID = string;
export type ISODateString = string;
export type Timestamp = number;

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: ISODateString;
  requestId?: string;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
  timestamp: ISODateString;
}

export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export interface Optional<T> {
  value?: T;
}

export interface Nullable<T> {
  value: T | null;
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export type Exact<T, Shape = T> = T extends Shape
  ? Exclude<keyof T, keyof Shape> extends never
    ? T
    : never
  : never;

// ─── ENUMS ─────────────────────────────────────────────────────

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
  COMPANY_ADMIN = "company-admin",
}

export enum AccountType {
  BRAND_MONITOR = "brand-monitor",
  MARKET_COMPETITOR = "market-competitor",
  INVESTMENT_BANK = "investment-bank",
  HARCH_ALPHA = "harch-alpha",
}

export enum UserStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
  PENDING = "pending",
}

export enum AssetType {
  STOCK = "stock",
  BOND = "bond",
  CURRENCY = "currency",
  COMMODITY = "commodity",
  CRYPTO = "crypto",
  INDEX = "index",
  ETF = "etf",
}

export enum Exchange {
  BVC = "BVC",
  NYSE = "NYSE",
  NASDAQ = "NASDAQ",
  LSE = "LSE",
  EURONEXT = "EURONEXT",
  TSE = "TSE",
}

export enum SentimentLabel {
  POSITIVE = "positive",
  NEUTRAL = "neutral",
  NEGATIVE = "negative",
}

export type RiskLevel = "low" | "moderate" | "elevated" | "high" | "critical";

export type RiskTrajectory = "rising" | "stable" | "falling";

export enum RiskGroup {
  GOVERNANCE = "governance",
  FINANCIAL = "financial",
  OPERATIONAL = "operational",
  STRATEGIC = "strategic",
  COMPLIANCE = "compliance",
  DIGITAL = "digital",
  ENVIRONMENTAL = "environmental",
  SOCIAL = "social",
}

export type AlertSeverity = "info" | "low" | "medium" | "high" | "critical";

export type AlertType = "sentiment_drop" | "risk_breach" | "volume_spike" | "ai_visibility" | "regulatory" | "price_threshold" | "sanctions_match" | "entity_mention" | "trend_detection" | "anomaly";

export enum AlertStatus {
  ACTIVE = "active",
  ACKNOWLEDGED = "acknowledged",
  RESOLVED = "resolved",
  DISMISSED = "dismissed",
}

export enum ArticleSourceType {
  MEDIA = "media",
  REGULATORY = "regulatory",
  MARKET = "market",
  FINANCIAL = "financial",
  SOCIAL = "social",
  AI = "ai",
}

export enum EntityType {
  PERSON = "person",
  ORGANIZATION = "organization",
  LOCATION = "location",
  TICKER = "ticker",
  PRODUCT = "product",
  EVENT = "event",
  TOPIC = "topic",
}

export enum EntityTag {
  EXECUTIVE = "executive",
  MINISTER = "minister",
  REGULATOR = "regulator",
  PRESS = "press",
  ANALYST = "analyst",
  INFLUENCER = "influencer",
  POLITICIAN = "politician",
  JOURNALIST = "journalist",
}

export enum Language {
  FR = "fr",
  AR = "ar",
  EN = "en",
  DARIJA = "darija",
  ES = "es",
  DE = "de",
  IT = "it",
  PT = "pt",
  ZH = "zh",
  JA = "ja",
}

export enum AIEngine {
  CHATGPT = "ChatGPT",
  CLAUDE = "Claude",
  GEMINI = "Gemini",
  PERPLEXITY = "Perplexity",
  COPILOT = "Copilot",
  MISTRAL = "Mistral",
  GROK = "Grok",
  LLAMA = "Llama",
}

export enum ReportType {
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  ANNUAL = "annual",
  FLAGSHIP = "flagship",
  DOSSIER = "dossier",
  COMPLIANCE = "compliance",
  REPUTATION = "reputation",
  RISK = "risk",
  DEEP_DIVE = "deep_dive",
  MEDIA_IMPACT = "media_impact",
}

export enum ReportStatus {
  DRAFT = "draft",
  GENERATING = "generating",
  READY = "ready",
  FAILED = "failed",
  ARCHIVED = "archived",
}

export type NotificationType = "alert" | "report" | "system" | "threshold" | "briefing" | "mention";

export type NotificationChannel = "dashboard" | "email" | "whatsapp" | "push" | "webhook" | "slack" | "teams";

export type JobType = "scrape_rss" | "scrape_regulatory" | "scrape_bvc" | "nlp_process" | "embedding_generate" | "ai_visibility_probe" | "sentiment_aggregate" | "risk_assess" | "report_generate" | "briefing_generate" | "sanctions_refresh" | "alert_check" | "notification_dispatch";

export type JobStatus = "pending" | "running" | "completed" | "failed" | "retrying" | "cancelled";

export enum WebhookEvent {
  ALERT_CREATED = "alert.created",
  ALERT_ACKNOWLEDGED = "alert.acknowledged",
  ALERT_RESOLVED = "alert.resolved",
  REPORT_READY = "report.ready",
  REPORT_FAILED = "report.failed",
  ARTICLE_PUBLISHED = "article.published",
  SENTIMENT_DROP = "sentiment.drop",
  RISK_BREACH = "risk.breach",
  AI_VISIBILITY_CHANGE = "ai_visibility.change",
  PRICE_THRESHOLD = "price.threshold",
  SANCTIONS_MATCH = "sanctions.match",
  BRIEFING_DELIVERED = "briefing.delivered",
}

export enum TenantPlan {
  STARTER = "starter",
  PRO = "pro",
  ENTERPRISE = "enterprise",
  CUSTOM = "custom",
}

export enum DataSource {
  HESPRESS = "Hespress",
  TELQUEL = "TelQuel",
  MEDIAS24 = "Medias24",
  LE_ECONOMISTE = "L'Economiste",
  LE360 = "Le360",
  AUJOURDUI = "Aujourdhui Le Maroc",
  LE_MATIN = "Le Matin",
  LESECO = "LesEco",
  JEUNE_AFRIQUE = "Jeune Afrique",
  LA_VIE_ECO = "La Vie Eco",
  L_OPINION = "L'Opinion",
  AL_BAYANE = "Al Bayane",
  BARLAMANE = "Barlamane",
  MOROCCO_WORLD_NEWS = "Morocco World News",
  YABILADI = "Yabiladi",
  MAP = "MAP",
  AMMC = "AMMC",
  BAM = "BAM",
  BVC = "BVC",
}

export enum DashboardSection {
  WEATHER = "weather",
  SIGNALS = "signals",
  SENTIMENT = "sentiment",
  AI_VISIBILITY = "ai_visibility",
  INFLUENCERS = "influencers",
  REPORTS = "reports",
  SCREENING = "screening",
  DOSSIERS = "dossiers",
  COMPLIANCE = "compliance",
  RISK_MAP = "risk_map",
  REGULATORY = "regulatory",
  RED_FLAGS = "red_flags",
  PULSE = "pulse",
  DEPTH = "depth",
  ALERTS = "alerts",
  POSITIONS = "positions",
}

export enum ChartType {
  LINE = "line",
  BAR = "bar",
  HORIZONTAL_BAR = "horizontal_bar",
  DONUT = "donut",
  GAUGE = "gauge",
  HEATMAP = "heatmap",
  RADAR = "radar",
  SPARKLINE = "sparkline",
  STACKED_BAR = "stacked_bar",
  SCATTER = "scatter",
  AREA = "area",
  CANDLESTICK = "candlestick",
  TREEMAP = "treemap",
  SANKEY = "sankey",
  FUNNEL = "funnel",
}

export type ExportFormat = "pdf" | "excel" | "csv" | "json" | "powerpoint";

// ─── CORE ENTITY TYPES ─────────────────────────────────────────

export interface Company {
  id: ID;
  slug: string;
  name: string;
  aliases: string[];
  sector: string;
  industry?: string;
  ticker?: string;
  isin?: string;
  lei?: string;
  foundedYear?: number;
  headquarters?: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  tenantId?: string;
  isDemo: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface User {
  id: ID;
  email: string;
  name?: string;
  role: UserRole;
  accountType: AccountType;
  tenantId?: string;
  jobTitle?: string;
  onboardingCompleted: boolean;
  status: UserStatus;
  lastLoginAt?: ISODateString;
  topics: string[];
  competitors: string[];
  trackedAssets: string[];
  whatsappNumber?: string;
  whatsappAlerts: boolean;
  alertSeverityThreshold: AlertSeverity;
  isDemo: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Tenant {
  id: ID;
  name: string;
  plan: TenantPlan;
  isDemo: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Article {
  id: ID;
  companyId?: string;
  title: string;
  url: string;
  urlHash: string;
  source: string;
  sourceId?: string;
  sourceType: ArticleSourceType;
  publishedAt?: ISODateString;
  scrapedAt: ISODateString;
  indexedAt?: ISODateString;
  content?: string;
  summary?: string;
  language?: Language;
  sentimentLabel?: SentimentLabel;
  sentimentScore?: number;
  relevanceScore?: number;
  entities?: EntityMention[];
  processed: boolean;
  isDemo: boolean;
  createdAt: ISODateString;
}

export interface Entity {
  id: ID;
  entityType: EntityType;
  name: string;
  aliases: string[];
  confidence: number;
  firstSeen: ISODateString;
  lastSeen: ISODateString;
  sources: string[];
  tags: EntityTag[];
  metadata?: {
    role?: string;
    companySlug?: string;
    wikidataId?: string;
    linkedinUrl?: string;
    twitterHandle?: string;
  };
}

export interface EntityMention {
  id: ID;
  entityId: ID;
  companyId: string;
  articleId?: string;
  mentionText: string;
  sentimentLabel?: SentimentLabel;
  sentimentScore?: number;
  mentionedAt: ISODateString;
}

export interface SentimentScore {
  id: ID;
  companyId: string;
  score: number;
  positivePct: number;
  neutralPct: number;
  negativePct: number;
  articleCount: number;
  language?: Language;
  sourceBreakdown?: Record<string, number>;
  calculatedAt: ISODateString;
  isDemo: boolean;
}

export interface RiskAssessment {
  id: ID;
  companyId: string;
  overallRisk: number;
  riskLevel: RiskLevel;
  category: string;
  frequency?: number;
  impactSeverity?: number;
  velocity?: number;
  riskScore: number;
  trajectory?: RiskTrajectory;
  articleCount?: number;
  assessedAt: ISODateString;
  isDemo: boolean;
}

export interface ReputationScore {
  id: ID;
  companyId: string;
  overall: number;
  sentiment: number;
  aiVisibility: number;
  volume: number;
  authority: number;
  innovationScore: number;
  innovationWeight: number;
  performanceScore: number;
  performanceWeight: number;
  purposeScore: number;
  purposeWeight: number;
  shareOfVoice: number;
  trend: "up" | "down" | "stable";
  calculatedAt: ISODateString;
  isDemo: boolean;
}

export interface AIVisibility {
  id: ID;
  companyId: string;
  platform: AIEngine;
  cited: boolean;
  position?: string;
  sentiment?: SentimentLabel;
  confidence: number;
  summary: string;
  query: string;
  rank?: number;
  mentions?: number;
  shareOfVoice?: number;
  responseExcerpt?: string;
  sentimentScore?: number;
  batchId?: string;
  checkedAt: ISODateString;
  isDemo: boolean;
}

export interface Asset {
  id: ID;
  ticker: string;
  name: string;
  assetType: AssetType;
  exchange: Exchange;
  sector?: string;
  companyId?: string;
  isActive: boolean;
}

export interface AssetPrice {
  id: ID;
  assetId: ID;
  price: number;
  volume: number;
  changePct: number;
  tradedAt: ISODateString;
}

export interface AssetSentiment {
  id: ID;
  assetId: ID;
  score: number;
  articleCount: number;
  calculatedAt: ISODateString;
}

export interface Portfolio {
  id: ID;
  userId: ID;
  name: string;
  createdAt: ISODateString;
}

export interface PortfolioHolding {
  id: ID;
  portfolioId: ID;
  ticker: string;
  quantity: number;
  avgPrice: number;
  addedAt: ISODateString;
}

export interface Dossier {
  id: ID;
  userId: ID;
  companyName: string;
  status: ReportStatus;
  sections: Record<string, unknown>;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Report {
  id: ID;
  userId: ID;
  companyId?: string;
  title: string;
  period: string;
  summary: string;
  sections: Record<string, unknown>;
  status: ReportStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Alert {
  id: ID;
  tenantId?: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  body: string;
  companyId?: string;
  articleId?: string;
  threshold?: string;
  triggeredAt: ISODateString;
  acknowledgedAt?: ISODateString;
  acknowledgedBy?: string;
}

export interface Notification {
  id: ID;
  userId: ID;
  type: NotificationType;
  title: string;
  body: string;
  severity: AlertSeverity;
  read: boolean;
  link?: string;
  createdAt: ISODateString;
  isDemo: boolean;
}

export interface Briefing {
  id: ID;
  userId: ID;
  date: ISODateString;
  content: Record<string, unknown>;
  model?: string;
  deliveryChannel: NotificationChannel;
  deliveredAt?: ISODateString;
}

export interface ApiKey {
  id: ID;
  userId: ID;
  name: string;
  keyHash: string;
  keyPrefix: string;
  permissions: string[];
  lastUsedAt?: ISODateString;
  expiresAt?: ISODateString;
  createdAt: ISODateString;
  revokedAt?: ISODateString;
}

export interface Webhook {
  id: ID;
  userId: ID;
  url: string;
  events: WebhookEvent[];
  secret: string;
  isActive: boolean;
  createdAt: ISODateString;
}

export interface WebhookDelivery {
  id: ID;
  webhookId: ID;
  event: WebhookEvent;
  payload: Record<string, unknown>;
  statusCode?: number;
  response?: string;
  deliveredAt: ISODateString;
}

export interface CompanySettings {
  id: ID;
  companyId: ID;
  topics: string[];
  competitors: string[];
  monitoredSources: string[];
  alertThresholds: {
    sentimentDrop: number;
    riskLevel: RiskLevel;
    minMentions: number;
  };
}

export interface SanctionsEntry {
  list: "OFAC" | "EU" | "UN";
  name: string;
  aliases: string[];
  program?: string;
  startDate?: ISODateString;
  endDate?: ISODateString;
  entityType?: "individual" | "entity" | "vessel" | "aircraft";
  country?: string;
  address?: string[];
  remarks?: string;
}

export interface SanctionsCache {
  id: ID;
  list: "OFAC" | "EU" | "UN";
  data: string;
  entryCount: number;
  downloadedAt: ISODateString;
  sourceUrl?: string;
  byteSize?: number;
}

export interface Influencer {
  id: ID;
  name: string;
  handle?: string;
  platform: "twitter" | "linkedin" | "instagram" | "youtube" | "tiktok" | "press";
  bio?: string;
  followers: number;
  following: number;
  verified: boolean;
  location?: string;
  languages: string[];
  topics: string[];
  reachScore: number;
  engagementScore: number;
  authorityScore: number;
  influenceScore: number;
  lastAnalyzed?: ISODateString;
}

export interface InfluencerMention {
  id: ID;
  influencerId: ID;
  alertId?: string;
  title: string;
  url?: string;
  sentiment: SentimentLabel;
  reach: number;
  publishedAt: ISODateString;
}

// ─── API REQUEST/RESPONSE TYPES ────────────────────────────────

export interface CreateCompanyRequest {
  slug: string;
  name: string;
  aliases?: string[];
  sector: string;
  industry?: string;
  ticker?: string;
  isin?: string;
  headquarters?: string;
  website?: string;
  description?: string;
}

export interface UpdateCompanyRequest extends DeepPartial<CreateCompanyRequest> {
  id: ID;
}

export interface CompanyListResponse extends PaginatedResponse<Company> {}

export interface ArticleListRequest {
  page?: number;
  limit?: number;
  source?: string;
  language?: Language;
  sentimentLabel?: SentimentLabel;
  sourceType?: ArticleSourceType;
  dateFrom?: ISODateString;
  dateTo?: ISODateString;
}

export interface ArticleListResponse extends PaginatedResponse<Article> {}

export interface SentimentQueryRequest {
  companyId: string;
  dateFrom?: ISODateString;
  dateTo?: ISODateString;
  granularity?: "day" | "week" | "month";
}

export interface SentimentQueryResponse extends ApiResponse<SentimentScore[]> {}

export interface RiskAssessmentRequest {
  companyId: string;
  category?: string;
  level?: RiskLevel;
}

export interface RiskAssessmentResponse extends ApiResponse<RiskAssessment[]> {}

export interface SanctionsScreenRequest {
  entity: string;
  lists?: Array<"OFAC" | "EU" | "UN">;
  fuzzy?: boolean;
  threshold?: number;
}

export interface SanctionsScreenResponse extends ApiResponse<{
  matched: boolean;
  entries: SanctionsEntry[];
  checkedAt: ISODateString;
}> {}

export interface FlagshipReportResponse extends ApiResponse<{
  meta: {
    title: string;
    subtitle: string;
    period: string;
    generatedAt: ISODateString;
    version: string;
  };
  summary: {
    totalCompanies: number;
    totalPeople: number;
    totalArticles: number;
    totalSentimentSnapshots: number;
    totalBvcPrices: number;
    totalRiskAssessments: number;
    totalAiVisibilityRecords: number;
    totalAssets: number;
    reportingPeriodDays: number;
  };
  companies: unknown[];
  people: unknown[];
  keyEvents: unknown[];
  sectors: unknown[];
  topSources: unknown[];
  languages: unknown[];
  sentimentBreakdown: { positive: number; neutral: number; negative: number };
  assets: unknown[];
  risks: unknown[];
  methodology: {
    dataSources: string[];
    framework: string;
    refreshCycle: string;
    coverageWindow: string;
  };
}> {}

// ─── DASHBOARD WIDGET TYPES ────────────────────────────────────

export interface WidgetConfig {
  id: string;
  title: string;
  type: ChartType;
  section: DashboardSection;
  position: { x: number; y: number; w: number; h: number };
  dataSource: string;
  refreshInterval?: number;
  filters?: Record<string, unknown>;
}

export interface DashboardTemplate {
  id: string;
  name: string;
  accountType: AccountType;
  widgets: WidgetConfig[];
  isDefault: boolean;
}

export interface KpiCardData {
  label: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "stable";
  changePct?: number;
  color?: string;
  icon?: string;
}

export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
  color?: string;
}

export interface ChartSeries {
  name: string;
  color: string;
  data: ChartDataPoint[];
}

export interface TableConfig {
  columns: Array<{
    key: string;
    header: string;
    width?: string;
    align?: "left" | "right" | "center";
    sortable?: boolean;
    filterable?: boolean;
    render?: (value: unknown, row: unknown) => string;
  }>;
  data: Record<string, unknown>[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
  sortable?: boolean;
  filterable?: boolean;
  virtualized?: boolean;
  rowHeight?: number;
}

// ─── CONSOLE TYPES ─────────────────────────────────────────────

export interface ConsoleSession {
  userId: ID;
  accountType: AccountType;
  theme: {
    label: string;
    accent: string;
    bg: string;
    surface: string;
    text: string;
  };
  activeNav: string;
  isDemoMode: boolean;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: number;
  draggable: boolean;
}

export interface CommandPaletteItem {
  id: string;
  label: string;
  shortcut?: string;
  icon?: string;
  action: () => void;
  category: string;
}

export interface GlobalSearchResult {
  id: string;
  type: "alert" | "topic" | "report" | "company" | "person" | "article";
  title: string;
  subtitle?: string;
  url?: string;
  date?: ISODateString;
  sentiment?: SentimentLabel;
}

// ─── CRON JOB TYPES ────────────────────────────────────────────

export interface CronJobConfig {
  name: string;
  schedule: string;
  endpoint: string;
  description: string;
  timeout: number;
  retries: number;
}

export interface CronJobResult {
  job: string;
  status: "success" | "failed" | "skipped";
  duration: number;
  recordsProcessed?: number;
  error?: string;
  timestamp: ISODateString;
}

// ─── EXPORT TYPES ──────────────────────────────────────────────

export interface ExportRequest {
  format: ExportFormat;
  data: unknown;
  template?: string;
  filters?: Record<string, unknown>;
  locale?: Language;
}

export interface ExportResult {
  url: string;
  format: ExportFormat;
  size: number;
  generatedAt: ISODateString;
}

// ─── VALIDATION TYPES ──────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

export interface SchemaField {
  name: string;
  type: "string" | "number" | "boolean" | "date" | "array" | "object";
  required: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  enum?: string[];
  default?: unknown;
}

// ─── ANALYTICS TYPES ───────────────────────────────────────────

export interface MetricDefinition {
  id: string;
  name: string;
  description: string;
  formula: string;
  unit: string;
  target?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  direction: "higher_better" | "lower_better" | "neutral";
}

export interface MetricResult {
  metricId: string;
  value: number;
  unit: string;
  status: "good" | "warning" | "critical";
  trend?: "up" | "down" | "stable";
  delta?: number;
  timestamp: ISODateString;
}

export interface TimeSeriesPoint {
  timestamp: ISODateString;
  value: number;
  label?: string;
}

export interface TimeSeries {
  metric: string;
  data: TimeSeriesPoint[];
  granularity: "minute" | "hour" | "day" | "week" | "month";
}

export interface BenchmarkResult {
  companyId: string;
  metric: string;
  value: number;
  peerMedian: number;
  peerAverage: number;
  percentile: number;
  rank?: number;
}

// ─── WHATSAPP / TWILIO TYPES ───────────────────────────────────

export interface WhatsAppMessage {
  to: string;
  from: string;
  body: string;
  mediaUrl?: string;
  template?: {
    name: string;
    language: Language;
    params: string[];
  };
}

export interface WhatsAppTemplate {
  name: string;
  language: Language;
  category: "MARKETING" | "UTILITY" | "AUTHENTICATION";
  body: string;
  params: string[];
}

export interface AlertWhatsAppMessage extends WhatsAppMessage {
  alertType: AlertType;
  severity: AlertSeverity;
  companyName?: string;
  actionUrl?: string;
}

// ─── EMBEDDING / SEARCH TYPES ──────────────────────────────────

export interface SearchResult {
  id: ID;
  title: string;
  snippet: string;
  source: string;
  date: ISODateString;
  score: number;
  type: "article" | "entity" | "report" | "alert";
  url?: string;
  highlights?: Array<{
    field: string;
    snippet: string;
  }>;
}

export interface SearchRequest {
  query: string;
  filters?: {
    companyId?: string;
    dateFrom?: ISODateString;
    dateTo?: ISODateString;
    source?: string;
    sentiment?: SentimentLabel;
    language?: Language;
  };
  options?: {
    limit?: number;
    offset?: number;
    minScore?: number;
    hybrid?: boolean;
    vectorWeight?: number;
    keywordWeight?: number;
  };
}

export interface SearchResponse extends PaginatedResponse<SearchResult> {
  query: string;
  took: number;
  maxScore: number;
}

// ─── LLM ROUTER TYPES ──────────────────────────────────────────

export interface LLMTaskRequest {
  prompt: string;
  task: "sentiment" | "summarization" | "embedding" | "darija" | "reasoning" | "ner" | "translation";
  context?: {
    companyId?: string;
    articleId?: string;
    language?: Language;
  };
  options?: {
    maxTokens?: number;
    temperature?: number;
    requireCitations?: boolean;
    forceProvider?: string;
  };
}

export interface LLMTaskResponse {
  content: string;
  provider: string;
  model: string;
  task: string;
  cost: number;
  latencyMs: number;
  tokenCount: {
    prompt: number;
    completion: number;
    total: number;
  };
  citations?: Array<{
    articleId: string;
    snippet: string;
    confidence: number;
  }>;
}

// ─── TYPE GUARDS ───────────────────────────────────────────────

export function isCompany(obj: unknown): obj is Company {
  return typeof obj === "object" && obj !== null && "slug" in obj && "name" in obj && "sector" in obj;
}

export function isArticle(obj: unknown): obj is Article {
  return typeof obj === "object" && obj !== null && "title" in obj && "url" in obj && "urlHash" in obj;
}

export function isUser(obj: unknown): obj is User {
  return typeof obj === "object" && obj !== null && "email" in obj && "role" in obj;
}

export function isAlert(obj: unknown): obj is Alert {
  return typeof obj === "object" && obj !== null && "type" in obj && "severity" in obj && "title" in obj;
}

export function isApiError(obj: unknown): obj is ApiError {
  return typeof obj === "object" && obj !== null && "success" in obj && obj.success === false && "error" in obj;
}

export function isApiResponse<T>(obj: unknown): obj is ApiResponse<T> {
  return typeof obj === "object" && obj !== null && "success" in obj;
}

export function isPaginatedResponse<T>(obj: unknown): obj is PaginatedResponse<T> {
  return isApiResponse(obj) && "pagination" in obj;
}

export function isSentimentLabel(value: string): value is SentimentLabel {
  return ["positive", "neutral", "negative"].includes(value);
}

export function isRiskLevel(value: string): value is RiskLevel {
  return ["low", "moderate", "elevated", "high", "critical"].includes(value);
}

export function isLanguage(value: string): value is Language {
  return Object.values(Language).includes(value as Language);
}

export function isAIEngine(value: string): value is AIEngine {
  return Object.values(AIEngine).includes(value as AIEngine);
}

// ─── DEFAULT VALUES ────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_SEARCH_LIMIT = 20;
export const MAX_SEARCH_LIMIT = 100;
export const EMBEDDING_DIMENSIONS = 1536;
export const MAX_EMBEDDING_TOKENS = 8000;
export const MAX_ARTICLE_CONTENT_LENGTH = 100000;
export const MAX_ARTICLE_TITLE_LENGTH = 500;
export const MAX_COMPANY_ALIASES = 20;
export const MAX_ENTITY_ALIASES = 10;
export const MAX_ALERT_BODY_LENGTH = 5000;
export const MAX_REPORT_SECTIONS = 20;
export const MAX_WEBHOOK_EVENTS = 50;
export const MAX_API_KEYS_PER_USER = 10;
export const MAX_WEBHOOKS_PER_USER = 20;
export const MAX_PORTFOLIOS_PER_USER = 10;
export const MAX_HOLDINGS_PER_PORTFOLIO = 100;
export const MAX_DOSSIERS_PER_USER = 50;
export const MAX_NOTIFICATIONS_PER_USER = 1000;
export const MAX_BRIEFINGS_PER_USER = 365;
export const SANCTIONS_REFRESH_INTERVAL_HOURS = 24;
export const BVC_REFRESH_INTERVAL_HOURS = 24;
export const RSS_SCRAPE_INTERVAL_MINUTES = 30;
export const NLP_PROCESS_INTERVAL_MINUTES = 15;
export const AI_VISIBILITY_PROBE_INTERVAL_HOURS = 24;
export const BRIEFING_GENERATION_HOUR_UTC = 7;
export const REPORT_GENERATION_DAY = 1;
export const ALERT_CHECK_INTERVAL_SECONDS = 300;
export const NOTIFICATION_DISPATCH_INTERVAL_SECONDS = 120;

export const SENTIMENT_THRESHOLD_POSITIVE = 0.1;
export const SENTIMENT_THRESHOLD_NEGATIVE = -0.1;
export const RELEVANCE_THRESHOLD = 0.5;
export const CONFIDENCE_THRESHOLD = 0.5;
export const EMBEDDING_SIMILARITY_THRESHOLD = 0.7;
export const RRF_K_CONSTANT = 60;
export const SEARCH_LATENCY_TARGET_MS = 500;
export const API_LATENCY_TARGET_MS = 500;
export const DASHBOARD_LOAD_TARGET_MS = 2000;
export const BVC_MARKET_CLOSE_HOUR = 18;
export const BVC_MARKET_CLOSE_MINUTE = 0;
export const CASABLANCA_TIMEZONE = "Africa/Casablanca";
export const DEFAULT_LANGUAGE: Language = Language.FR;
export const DEFAULT_CURRENCY = "MAD";
export const DEFAULT_EXCHANGE = Exchange.BVC;

export const REPUTATION_SCORE_WEIGHTS = {
  SENTIMENT: 0.25,
  AI_VISIBILITY: 0.20,
  VOLUME: 0.15,
  AUTHORITY: 0.10,
  INNOVATION: 0.10,
  PERFORMANCE: 0.10,
  PURPOSE: 0.10,
} as const;

export const INFLUENCE_SCORE_WEIGHTS = {
  REACH: 0.40,
  ENGAGEMENT: 0.25,
  AUTHORITY: 0.35,
} as const;

export const RISK_SCORE_WEIGHTS = {
  FREQUENCY: 0.40,
  IMPACT_SEVERITY: 0.35,
  VELOCITY: 0.25,
} as const;

export const ALERT_SEVERITY_ORDER: Record<string, number> = {
  info: 0,
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

export const RISK_LEVEL_ORDER: Record<string, number> = {
  low: 0,
  moderate: 1,
  elevated: 2,
  high: 3,
  critical: 4,
};

export const RISK_LEVEL_COLORS: Record<string, string> = {
  low: "#059669",
  moderate: "#856914",
  elevated: "#D97706",
  high: "#DC2626",
  critical: "#7F1D1D",
};

export const SENTIMENT_COLORS: Record<string, string> = {
  positive: "#059669",
  neutral: "#737373",
  negative: "#DC2626",
};

export const ACCOUNT_TYPE_LABELS: Record<AccountType, { en: string; fr: string }> = {
  [AccountType.BRAND_MONITOR]: { en: "Brand Monitor", fr: "Veille de Marque" },
  [AccountType.MARKET_COMPETITOR]: { en: "Competitor Intel", fr: "Intelligence Concurrentielle" },
  [AccountType.INVESTMENT_BANK]: { en: "Investor Desk", fr: "Desk Investisseur" },
  [AccountType.HARCH_ALPHA]: { en: "Alpha Desk", fr: "Desk Trading" },
};

export const ACCOUNT_TYPE_THEMES: Record<AccountType, { accent: string; bg: string; label: string }> = {
  [AccountType.BRAND_MONITOR]: { accent: "#4A7B5F", bg: "#F0F7F4", label: "Brand Monitor" },
  [AccountType.MARKET_COMPETITOR]: { accent: "#856914", bg: "#FAF6F0", label: "Competitor Intel" },
  [AccountType.INVESTMENT_BANK]: { accent: "#0369A1", bg: "#F0F6FA", label: "Investor Desk" },
  [AccountType.HARCH_ALPHA]: { accent: "#7C3AED", bg: "#F6F0FA", label: "Alpha Desk" },
};

export const DASHBOARD_SECTIONS: Record<AccountType, DashboardSection[]> = {
  [AccountType.BRAND_MONITOR]: [
    DashboardSection.WEATHER,
    DashboardSection.SIGNALS,
    DashboardSection.SENTIMENT,
    DashboardSection.AI_VISIBILITY,
    DashboardSection.INFLUENCERS,
    DashboardSection.REPORTS,
  ],
  [AccountType.MARKET_COMPETITOR]: [
    DashboardSection.SIGNALS,
    DashboardSection.SENTIMENT,
    DashboardSection.AI_VISIBILITY,
    DashboardSection.INFLUENCERS,
    DashboardSection.ALERTS,
    DashboardSection.REPORTS,
  ],
  [AccountType.INVESTMENT_BANK]: [
    DashboardSection.SCREENING,
    DashboardSection.DOSSIERS,
    DashboardSection.COMPLIANCE,
    DashboardSection.RISK_MAP,
    DashboardSection.REGULATORY,
    DashboardSection.RED_FLAGS,
  ],
  [AccountType.HARCH_ALPHA]: [
    DashboardSection.PULSE,
    DashboardSection.SIGNALS,
    DashboardSection.DEPTH,
    DashboardSection.ALERTS,
    DashboardSection.POSITIONS,
  ],
};

export const CHART_COLORS = [
  "#059669", "#0369A1", "#856914", "#7C3AED", "#DC2626",
  "#D97706", "#4A7B5F", "#BE185D", "#0A0A0A", "#737373",
];

export const MOROCCAN_MEDIA_SOURCES = [
  DataSource.HESPRESS,
  DataSource.TELQUEL,
  DataSource.MEDIAS24,
  DataSource.LE_ECONOMISTE,
  DataSource.LE360,
  DataSource.AUJOURDUI,
  DataSource.LE_MATIN,
  DataSource.LESECO,
  DataSource.JEUNE_AFRIQUE,
  DataSource.LA_VIE_ECO,
  DataSource.L_OPINION,
  DataSource.AL_BAYANE,
  DataSource.BARLAMANE,
  DataSource.MOROCCO_WORLD_NEWS,
  DataSource.YABILADI,
] as const;

export const REGULATORY_SOURCES = [
  DataSource.AMMC,
  DataSource.BAM,
  DataSource.BVC,
  DataSource.MAP,
] as const;

export const ALL_DATA_SOURCES = [
  ...MOROCCAN_MEDIA_SOURCES,
  ...REGULATORY_SOURCES,
] as const;

export const AI_ENGINE_LIST = [
  AIEngine.CHATGPT,
  AIEngine.CLAUDE,
  AIEngine.GEMINI,
  AIEngine.PERPLEXITY,
  AIEngine.COPILOT,
  AIEngine.MISTRAL,
  AIEngine.GROK,
  AIEngine.LLAMA,
] as const;

export const BVC_TICKERS = [
  { ticker: "OCP", name: "OCP Group", sector: "Mining & Phosphates" },
  { ticker: "IAM", name: "Maroc Telecom", sector: "Telecommunications" },
  { ticker: "ATW", name: "Attijariwafa Bank", sector: "Banking" },
  { ticker: "BAO", name: "Bank of Africa", sector: "Banking" },
  { ticker: "BCP", name: "Banque Centrale Populaire", sector: "Banking" },
  { ticker: "CIH", name: "CIH Bank", sector: "Banking" },
  { ticker: "CFG", name: "CFG Bank", sector: "Banking" },
  { ticker: "LAS", name: "LesieurCristal", sector: "Consumer Goods" },
  { ticker: "CSU", name: "Cosumar", sector: "Consumer Goods" },
  { ticker: "MNG", name: "Managem", sector: "Mining & Phosphates" },
  { ticker: "LHM", name: "LafargeHolcim Maroc", sector: "Construction Materials" },
  { ticker: "WAA", name: "Wafacash", sector: "Financial Services" },
  { ticker: "DHO", name: "Diacap", sector: "Financial Services" },
] as const;

export const MOROCCAN_CITIES = [
  "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir",
  "Meknès", "Oujda", "Kénitra", "Tétouan", "Safi", "Mohammedia",
  "Khouribga", "El Jadida", "Beni Mellal", "Nador", "Taza", "Settat",
  "Berrechid", "Khemisset", "Larache", "Guelmim", "Laâyoune", "Dakhla",
  "Essaouira", "Ouarzazate", "Errachidia", "Oued Zem", "Sidi Slimane",
  "Sidi Kacem", "Ifrane", "Chefchaouen",
] as const;

export const MOROCCAN_SECTORS = [
  "Banking",
  "Telecommunications",
  "Mining & Phosphates",
  "Construction Materials",
  "Consumer Goods",
  "Aviation",
  "Retail",
  "Energy",
  "Insurance",
  "Real Estate",
  "Transportation",
  "Agriculture",
  "Pharmaceuticals",
  "Textiles",
  "Automotive",
  "Aerospace",
  "Electronics",
  "Tourism",
  "Media",
  "Technology",
] as const;

export const SUPPORTED_LANGUAGES = [
  { code: Language.FR, name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: Language.AR, name: "Arabic", nativeName: "العربية", flag: "🇲🇦" },
  { code: Language.EN, name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: Language.DARIJA, name: "Moroccan Darija", nativeName: "الدارجة", flag: "🇲🇦" },
] as const;

export const CRON_JOBS = [
  { name: "scrape-rss", schedule: "*/30 * * * *", endpoint: "/api/cron/scrape-rss", description: "Scrape RSS feeds every 30 minutes" },
  { name: "scrape-regulatory", schedule: "0 6 * * *", endpoint: "/api/cron/scrape-regulatory", description: "Scrape AMMC/BAM/BVC daily at 06:00 UTC" },
  { name: "refresh-bvc-prices", schedule: "30 18 * * *", endpoint: "/api/cron/refresh-bvc-prices", description: "Refresh BVC prices after market close" },
  { name: "refresh-sanctions", schedule: "0 3 * * *", endpoint: "/api/cron/refresh-sanctions", description: "Refresh OFAC/EU/UN sanctions lists daily" },
  { name: "nlp-process", schedule: "*/15 * * * *", endpoint: "/api/cron/nlp", description: "Process unprocessed articles with NLP" },
  { name: "ai-visibility", schedule: "0 22 * * *", endpoint: "/api/cron/ai-visibility", description: "Probe 8 AI engines daily" },
  { name: "generate-briefings", schedule: "0 7 * * *", endpoint: "/api/cron/generate-briefings", description: "Generate morning WhatsApp briefings" },
  { name: "generate-reports", schedule: "0 0 1 * *", endpoint: "/api/cron/generate-reports", description: "Generate monthly reports on 1st" },
  { name: "whatsapp-alerts", schedule: "*/5 * * * *", endpoint: "/api/cron/whatsapp-alerts", description: "Check alert thresholds every 5 minutes" },
  { name: "notifications", schedule: "*/2 * * * *", endpoint: "/api/cron/notifications", description: "Dispatch notifications every 2 minutes" },
  { name: "agents", schedule: "*/10 * * * *", endpoint: "/api/cron/agents", description: "Run autonomous agents every 10 minutes" },
  { name: "health", schedule: "*/5 * * * *", endpoint: "/api/cron/health", description: "Health check every 5 minutes" },
  { name: "clean-jobs", schedule: "0 4 * * *", endpoint: "/api/cron/clean-jobs", description: "Clean old jobs daily at 04:00 UTC" },
  { name: "dispatch", schedule: "* * * * *", endpoint: "/api/cron/dispatch", description: "Job queue dispatcher every minute" },
  { name: "refresh", schedule: "0 * * * *", endpoint: "/api/cron/refresh", description: "Refresh derived metrics hourly" },
] as const;

export const WEBHOOK_EVENTS_LIST = [
  WebhookEvent.ALERT_CREATED,
  WebhookEvent.ALERT_ACKNOWLEDGED,
  WebhookEvent.ALERT_RESOLVED,
  WebhookEvent.REPORT_READY,
  WebhookEvent.REPORT_FAILED,
  WebhookEvent.ARTICLE_PUBLISHED,
  WebhookEvent.SENTIMENT_DROP,
  WebhookEvent.RISK_BREACH,
  WebhookEvent.AI_VISIBILITY_CHANGE,
  WebhookEvent.PRICE_THRESHOLD,
  WebhookEvent.SANCTIONS_MATCH,
  WebhookEvent.BRIEFING_DELIVERED,
] as const;

export const NOTIFICATION_CHANNELS_LIST = [
  "dashboard",
  "email",
  "whatsapp",
  "push",
  "webhook",
  "slack",
  "teams",
] as const;

export const EXPORT_FORMATS_LIST = [
  "pdf",
  "excel",
  "csv",
  "json",
  "powerpoint",
] as const;

export const CHART_TYPES_LIST = [
  ChartType.LINE,
  ChartType.BAR,
  ChartType.HORIZONTAL_BAR,
  ChartType.DONUT,
  ChartType.GAUGE,
  ChartType.HEATMAP,
  ChartType.RADAR,
  ChartType.SPARKLINE,
  ChartType.STACKED_BAR,
  ChartType.SCATTER,
  ChartType.AREA,
  ChartType.CANDLESTICK,
  ChartType.TREEMAP,
  ChartType.SANKEY,
  ChartType.FUNNEL,
] as const;

export const ENTITY_TAGS_LIST = [
  EntityTag.EXECUTIVE,
  EntityTag.MINISTER,
  EntityTag.REGULATOR,
  EntityTag.PRESS,
  EntityTag.ANALYST,
  EntityTag.INFLUENCER,
  EntityTag.POLITICIAN,
  EntityTag.JOURNALIST,
] as const;

export const ALERT_TYPES_LIST = [
  "sentiment_drop",
  "risk_breach",
  "volume_spike",
  "ai_visibility",
  "regulatory",
  "price_threshold",
  "sanctions_match",
  "entity_mention",
  "trend_detection",
  "anomaly",
] as const;

export const REPORT_TYPES_LIST = [
  ReportType.MONTHLY,
  ReportType.QUARTERLY,
  ReportType.ANNUAL,
  ReportType.FLAGSHIP,
  ReportType.DOSSIER,
  ReportType.COMPLIANCE,
  ReportType.REPUTATION,
  ReportType.RISK,
  ReportType.DEEP_DIVE,
  ReportType.MEDIA_IMPACT,
] as const;

export const JOB_TYPES_LIST = [
  "scrape_rss", "scrape_regulatory", "scrape_bvc", "nlp_process",
  "embedding_generate", "ai_visibility_probe", "sentiment_aggregate",
  "risk_assess", "report_generate", "briefing_generate",
  "sanctions_refresh", "alert_check", "notification_dispatch",
] as const;

export const JOB_STATUSES_LIST = [
  "pending", "running", "completed", "failed", "retrying", "cancelled",
] as const;

export const REPORT_STATUSES_LIST = [
  ReportStatus.DRAFT,
  ReportStatus.GENERATING,
  ReportStatus.READY,
  ReportStatus.FAILED,
  ReportStatus.ARCHIVED,
] as const;

export const ALERT_STATUSES_LIST = [
  AlertStatus.ACTIVE,
  AlertStatus.ACKNOWLEDGED,
  AlertStatus.RESOLVED,
  AlertStatus.DISMISSED,
] as const;

export const RISK_GROUPS_LIST = [
  RiskGroup.GOVERNANCE,
  RiskGroup.FINANCIAL,
  RiskGroup.OPERATIONAL,
  RiskGroup.STRATEGIC,
  RiskGroup.COMPLIANCE,
  RiskGroup.DIGITAL,
  RiskGroup.ENVIRONMENTAL,
  RiskGroup.SOCIAL,
] as const;

export const RISK_LEVELS_LIST = [
  "low",
  "moderate",
  "elevated",
  "high",
  "critical",
] as const;

export const SENTIMENT_LABELS_LIST = [
  "positive",
  "neutral",
  "negative",
] as const;

export const ARTICLE_SOURCE_TYPES_LIST = [
  ArticleSourceType.MEDIA,
  ArticleSourceType.REGULATORY,
  ArticleSourceType.MARKET,
  ArticleSourceType.FINANCIAL,
  ArticleSourceType.SOCIAL,
  ArticleSourceType.AI,
] as const;

export const ENTITY_TYPES_LIST = [
  EntityType.PERSON,
  EntityType.ORGANIZATION,
  EntityType.LOCATION,
  EntityType.TICKER,
  EntityType.PRODUCT,
  EntityType.EVENT,
  EntityType.TOPIC,
] as const;

export const ASSET_TYPES_LIST = [
  AssetType.STOCK,
  AssetType.BOND,
  AssetType.CURRENCY,
  AssetType.COMMODITY,
  AssetType.CRYPTO,
  AssetType.INDEX,
  AssetType.ETF,
] as const;

export const EXCHANGES_LIST = [
  Exchange.BVC,
  Exchange.NYSE,
  Exchange.NASDAQ,
  Exchange.LSE,
  Exchange.EURONEXT,
  Exchange.TSE,
] as const;

export const USER_ROLES_LIST = [
  UserRole.USER,
  UserRole.ADMIN,
  UserRole.COMPANY_ADMIN,
] as const;

export const ACCOUNT_TYPES_LIST = [
  AccountType.BRAND_MONITOR,
  AccountType.MARKET_COMPETITOR,
  AccountType.INVESTMENT_BANK,
  AccountType.HARCH_ALPHA,
] as const;

export const USER_STATUSES_LIST = [
  UserStatus.ACTIVE,
  UserStatus.SUSPENDED,
  UserStatus.PENDING,
] as const;

export const TENANT_PLANS_LIST = [
  TenantPlan.STARTER,
  TenantPlan.PRO,
  TenantPlan.ENTERPRISE,
  TenantPlan.CUSTOM,
] as const;

export const LANGUAGES_LIST = [
  Language.FR,
  Language.AR,
  Language.EN,
  Language.DARIJA,
  Language.ES,
  Language.DE,
  Language.IT,
  Language.PT,
  Language.ZH,
  Language.JA,
] as const;

export const NOTIFICATION_TYPES_LIST = [
  "alert",
  "report",
  "system",
  "threshold",
  "briefing",
  "mention",
] as const;

// ─── ADDITIONAL UTILITY TYPES ──────────────────────────────────

export type Percentage = number; // 0-100
export type UnitInterval = number; // 0.0-1.0
export type NonNegativeInt = number; // >= 0
export type PositiveInt = number; // > 0
export type UUID = string;

export type MentionSentiment = string;

export type SectorCode = string; // GICS-like sector code

// Re-export RiskTrajectory as a type alias for string union
// (used by analytics module which uses string literals)
export type RiskTrajectoryType = "rising" | "stable" | "falling";
