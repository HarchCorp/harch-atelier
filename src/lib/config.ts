// ═══════════════════════════════════════════════════════════════
//  CONFIGURATION & SETTINGS MANAGER — App-wide configuration
//
//  Centralized configuration for all platform settings:
//  - Environment-specific configs (dev/staging/prod)
//  - Feature flags
//  - API rate limits
//  - Third-party service credentials
//  - Dashboard defaults
//  - Cron job schedules
//  - Notification preferences
// ═══════════════════════════════════════════════════════════════

import type { AccountType, NotificationChannel } from "@/lib/types/platform";

// ─── ENVIRONMENT CONFIG ────────────────────────────────────────

export type Environment = "development" | "staging" | "production" | "test";

export interface EnvironmentConfig {
  env: Environment;
  isDev: boolean;
  isProd: boolean;
  isTest: boolean;
  isStaging: boolean;
  debug: boolean;
  verbose: boolean;
  logLevel: "debug" | "info" | "warn" | "error" | "fatal";
  port: number;
  host: string;
  baseUrl: string;
  apiVersion: string;
  appName: string;
  appVersion: string;
}

export function getEnvironment(): Environment {
  const env = process.env.NODE_ENV || "development";
  if (env === "production") return "production";
  
  if (env === "test") return "test";
  return "development";
}

export function getEnvironmentConfig(): EnvironmentConfig {
  const env = getEnvironment();
  return {
    env,
    isDev: env === "development",
    isProd: env === "production",
    isTest: env === "test",
    isStaging: env === "staging",
    debug: env !== "production",
    verbose: env === "development",
    logLevel: env === "production" ? "info" : "debug",
    port: 3000,
    host: "0.0.0.0",
    baseUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
    apiVersion: "v1",
    appName: "Harch Atelier",
    appVersion: "1.0.0",
  };
}

// ─── FEATURE FLAGS ─────────────────────────────────────────────

export interface FeatureFlags {
  enableWhatsApp: boolean;
  enableWebhooks: boolean;
  enableAPIKeys: boolean;
  enableRealTime: boolean;
  enableAIInsights: boolean;
  enableAIVisibility: boolean;
  enableSanctionsScreening: boolean;
  enableDarijaNLP: boolean;
  enableVectorSearch: boolean;
  enableHybridSearch: boolean;
  enableEmbeddings: boolean;
  enableExport: boolean;
  enableCronJobs: boolean;
  enableNotifications: boolean;
  enablePushNotifications: boolean;
  enableSlackIntegration: boolean;
  enableTeamsIntegration: boolean;
  enableCommandPalette: boolean;
  enableGlobalSearch: boolean;
  enableDailyBriefing: boolean;
  enableMonthlyReports: boolean;
  enableFlagshipReport: boolean;
  enableCompetitorIntel: boolean;
  enableInvestorDesk: boolean;
  enableAlphaDesk: boolean;
  enableRiskFramework: boolean;
  enableInfluencerTracking: boolean;
  enableGeoSignals: boolean;
  enableCrisisIndicator: boolean;
  enableEntityGraph: boolean;
  enableNarrativeTracking: boolean;
}

export function getFeatureFlags(): FeatureFlags {
  const env = getEnvironment();
  const isProd = env === "production";
  const isDev = env === "development";

  return {
    enableWhatsApp: isProd,
    enableWebhooks: true,
    enableAPIKeys: true,
    enableRealTime: true,
    enableAIInsights: true,
    enableAIVisibility: true,
    enableSanctionsScreening: true,
    enableDarijaNLP: true,
    enableVectorSearch: isDev,
    enableHybridSearch: isDev,
    enableEmbeddings: isDev,
    enableExport: true,
    enableCronJobs: true,
    enableNotifications: true,
    enablePushNotifications: isProd,
    enableSlackIntegration: false,
    enableTeamsIntegration: false,
    enableCommandPalette: true,
    enableGlobalSearch: true,
    enableDailyBriefing: true,
    enableMonthlyReports: true,
    enableFlagshipReport: true,
    enableCompetitorIntel: true,
    enableInvestorDesk: true,
    enableAlphaDesk: true,
    enableRiskFramework: true,
    enableInfluencerTracking: true,
    enableGeoSignals: true,
    enableCrisisIndicator: true,
    enableEntityGraph: true,
    enableNarrativeTracking: true,
  };
}

// ─── DATABASE CONFIG ───────────────────────────────────────────

export interface DatabaseConfig {
  url: string;
  directUrl?: string;
  poolSize: number;
  poolTimeout: number;
  queryTimeout: number;
  slowQueryThreshold: number;
  enableLogging: boolean;
  enableMetrics: boolean;
}

export function getDatabaseConfig(): DatabaseConfig {
  return {
    url: process.env.DATABASE_URL || "",
    directUrl: process.env.DIRECT_URL,
    poolSize: 10,
    poolTimeout: 30000,
    queryTimeout: 60000,
    slowQueryThreshold: 1000,
    enableLogging: getEnvironment() === "development",
    enableMetrics: true,
  };
}

// ─── AUTH CONFIG ───────────────────────────────────────────────

export interface AuthConfig {
  secret: string;
  sessionTimeout: number;
  jwtExpiry: number;
  maxSessionsPerUser: number;
  passwordMinLength: number;
  requireEmailVerification: boolean;
  enableOAuth: boolean;
  oauthProviders: string[];
  enable2FA: boolean;
  bcryptRounds: number;
  tokenRefreshThreshold: number;
}

export function getAuthConfig(): AuthConfig {
  return {
    secret: process.env.NEXTAUTH_SECRET || "dev-secret-change-in-production",
    sessionTimeout: 7 * 24 * 60 * 60 * 1000,
    jwtExpiry: 7 * 24 * 60 * 60,
    maxSessionsPerUser: 5,
    passwordMinLength: 12,
    requireEmailVerification: getEnvironment() === "production",
    enableOAuth: false,
    oauthProviders: [],
    enable2FA: false,
    bcryptRounds: 12,
    tokenRefreshThreshold: 60 * 60,
  };
}

// ─── API RATE LIMITS ───────────────────────────────────────────

export interface RateLimitConfig {
  api: { windowMs: number; max: number };
  auth: { windowMs: number; max: number };
  search: { windowMs: number; max: number };
  export: { windowMs: number; max: number };
  cron: { windowMs: number; max: number };
  upload: { windowMs: number; max: number };
  websocket: { windowMs: number; max: number };
}

export function getRateLimitConfig(): RateLimitConfig {
  return {
    api: { windowMs: 60000, max: 100 },
    auth: { windowMs: 900000, max: 10 },
    search: { windowMs: 60000, max: 30 },
    export: { windowMs: 3600000, max: 10 },
    cron: { windowMs: 60000, max: 5 },
    upload: { windowMs: 3600000, max: 20 },
    websocket: { windowMs: 60000, max: 1000 },
  };
}

// ─── TWILIO / WHATSAPP CONFIG ──────────────────────────────────

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  whatsappFrom: string;
  smsFrom?: string;
  enabled: boolean;
  maxMessagesPerDay: number;
  maxMessagesPerHour: number;
  maxMessagesPerUser: number;
  defaultMessageTimeout: number;
  templates: Record<string, { name: string; language: string }>;
}

export function getTwilioConfig(): TwilioConfig {
  return {
    accountSid: process.env.TWILIO_ACCOUNT_SID || "",
    authToken: process.env.TWILIO_AUTH_TOKEN || "",
    whatsappFrom: process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+1234567890",
    smsFrom: process.env.TWILIO_SMS_FROM,
    enabled: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
    maxMessagesPerDay: 100,
    maxMessagesPerHour: 30,
    maxMessagesPerUser: 5,
    defaultMessageTimeout: 30000,
    templates: {
      morning_briefing: { name: "morning_briefing", language: "en" },
      critical_alert: { name: "critical_alert", language: "en" },
      weekly_summary: { name: "weekly_summary", language: "en" },
    },
  };
}

// ─── AI / LLM CONFIG ───────────────────────────────────────────

export interface LLMConfig {
  defaultProvider: string;
  defaultModel: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
  retryCount: number;
  retryDelay: number;
  providers: {
    zai: { apiKey: string; model: string; endpoint: string };
    openai: { apiKey: string; model: string; endpoint: string };
    anthropic: { apiKey: string; model: string; endpoint: string };
    google: { apiKey: string; model: string; endpoint: string };
    local: { endpoint: string; model: string };
  };
  embeddingModel: string;
  embeddingDimensions: number;
  embeddingBatchSize: number;
  zeroDataRetention: boolean;
  ragGrounding: boolean;
  requireCitations: boolean;
}

export function getLLMConfig(): LLMConfig {
  return {
    defaultProvider: "zai",
    defaultModel: "glm-4",
    maxTokens: 4000,
    temperature: 0.3,
    timeout: 60000,
    retryCount: 3,
    retryDelay: 5000,
    providers: {
      zai: {
        apiKey: process.env.ZAI_API_KEY || "",
        model: "glm-4",
        endpoint: "https://api.z.ai/api/paas/v4/chat/completions",
      },
      openai: {
        apiKey: process.env.OPENAI_API_KEY || "",
        model: "gpt-4-turbo-preview",
        endpoint: "https://api.openai.com/v1/chat/completions",
      },
      anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY || "",
        model: "claude-sonnet-4-20250514",
        endpoint: "https://api.anthropic.com/v1/messages",
      },
      google: {
        apiKey: process.env.GOOGLE_AI_API_KEY || "",
        model: "gemini-2.5-flash",
        endpoint: "https://generativelanguage.googleapis.com/v1beta/models",
      },
      local: {
        endpoint: "http://localhost:11434/api/generate",
        model: "llama-3.2-3b-instruct",
      },
    },
    embeddingModel: "text-embedding-3-small",
    embeddingDimensions: 1536,
    embeddingBatchSize: 100,
    zeroDataRetention: true,
    ragGrounding: true,
    requireCitations: true,
  };
}

// ─── CRON CONFIG ───────────────────────────────────────────────

export interface CronConfig {
  enabled: boolean;
  secret: string;
  timezone: string;
  jobs: Array<{
    name: string;
    schedule: string;
    endpoint: string;
    description: string;
    timeout: number;
    retries: number;
  }>;
}

export function getCronConfig(): CronConfig {
  return {
    enabled: true,
    secret: process.env.CRON_SECRET || "",
    timezone: "Africa/Casablanca",
    jobs: [
      { name: "scrape-rss", schedule: "0 */30 * * * ?", endpoint: "/api/cron/scrape-rss", description: "Scrape RSS feeds every 30 min", timeout: 120000, retries: 2 },
      { name: "scrape-regulatory", schedule: "0 0 6 * * ?", endpoint: "/api/cron/scrape-regulatory", description: "Scrape AMMC/BAM/BVC daily", timeout: 180000, retries: 3 },
      { name: "refresh-bvc-prices", schedule: "0 0 18 * * ?", endpoint: "/api/cron/refresh-bvc-prices", description: "Refresh BVC prices after close", timeout: 60000, retries: 3 },
      { name: "refresh-sanctions", schedule: "0 0 3 * * ?", endpoint: "/api/cron/refresh-sanctions", description: "Refresh sanctions lists daily", timeout: 300000, retries: 5 },
      { name: "nlp", schedule: "0 */15 * * * ?", endpoint: "/api/cron/nlp", description: "Process articles with NLP", timeout: 90000, retries: 2 },
      { name: "ai-visibility", schedule: "0 0 22 * * ?", endpoint: "/api/cron/ai-visibility", description: "Probe 8 AI engines", timeout: 300000, retries: 2 },
      { name: "generate-briefings", schedule: "0 0 7 * * ?", endpoint: "/api/cron/generate-briefings", description: "Morning WhatsApp briefings", timeout: 300000, retries: 3 },
      { name: "generate-reports", schedule: "0 0 0 1 * ?", endpoint: "/api/cron/generate-reports", description: "Monthly reports", timeout: 600000, retries: 3 },
      { name: "whatsapp-alerts", schedule: "0 */5 * * * ?", endpoint: "/api/cron/whatsapp-alerts", description: "Check alert thresholds", timeout: 30000, retries: 5 },
      { name: "notifications", schedule: "0 */2 * * * ?", endpoint: "/api/cron/notifications", description: "Dispatch notifications", timeout: 30000, retries: 3 },
      { name: "agents", schedule: "0 */10 * * * ?", endpoint: "/api/cron/agents", description: "Autonomous agents", timeout: 120000, retries: 2 },
      { name: "health", schedule: "0 */5 * * * ?", endpoint: "/api/cron/health", description: "Health check", timeout: 10000, retries: 3 },
      { name: "clean-jobs", schedule: "0 0 4 * * ?", endpoint: "/api/cron/clean-jobs", description: "Clean old jobs", timeout: 60000, retries: 1 },
      { name: "dispatch", schedule: "0 * * * * ?", endpoint: "/api/cron/dispatch", description: "Job queue dispatcher", timeout: 10000, retries: 1 },
      { name: "refresh", schedule: "0 0 * * * ?", endpoint: "/api/cron/refresh", description: "Refresh derived metrics", timeout: 120000, retries: 2 },
    ],
  };
}

// ─── DASHBOARD CONFIG ──────────────────────────────────────────

export interface DashboardConfig {
  defaultAccountType: AccountType;
  defaultTimeRange: "24h" | "7d" | "30d" | "90d" | "365d";
  defaultPageSize: number;
  maxPageSize: number;
  refreshIntervals: {
    fast: number;
    normal: number;
    slow: number;
  };
  widgetDefaults: {
    showLegend: boolean;
    showGrid: boolean;
    showAxisLabels: boolean;
    maxItems: number;
  };
  themeDefaults: {
    mode: "light" | "dark" | "auto";
    accentColor: string;
  };
  navigationDefaults: {
    collapsible: boolean;
    rememberLastSection: boolean;
    showBadges: boolean;
  };
}

export function getDashboardConfig(): DashboardConfig {
  return {
    defaultAccountType: "brand-monitor" as AccountType,
    defaultTimeRange: "7d",
    defaultPageSize: 20,
    maxPageSize: 100,
    refreshIntervals: {
      fast: 5000,
      normal: 30000,
      slow: 300000,
    },
    widgetDefaults: {
      showLegend: true,
      showGrid: true,
      showAxisLabels: true,
      maxItems: 50,
    },
    themeDefaults: {
      mode: "light",
      accentColor: "#4A7B5F",
    },
    navigationDefaults: {
      collapsible: true,
      rememberLastSection: true,
      showBadges: true,
    },
  };
}

// ─── NOTIFICATION CONFIG ───────────────────────────────────────

export interface NotificationConfig {
  defaultChannels: NotificationChannel[];
  severityThreshold: string;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
  };
  digest: {
    enabled: boolean;
    frequency: "daily" | "weekly";
    time: string;
  };
  rateLimits: Record<NotificationChannel, { perMinute: number; perHour: number; perDay: number }>;
  retryStrategy: {
    maxRetries: number;
    backoffMultiplier: number;
    initialDelayMs: number;
  };
}

export function getNotificationConfig(): NotificationConfig {
  return {
    defaultChannels: ["dashboard", "email"],
    severityThreshold: "medium",
    quietHours: {
      enabled: false,
      start: "22:00",
      end: "07:00",
      timezone: "Africa/Casablanca",
    },
    digest: {
      enabled: true,
      frequency: "daily",
      time: "08:00",
    },
    rateLimits: {
      dashboard: { perMinute: 100, perHour: 1000, perDay: 10000 },
      email: { perMinute: 10, perHour: 100, perDay: 500 },
      whatsapp: { perMinute: 5, perHour: 30, perDay: 100 },
      push: { perMinute: 20, perHour: 200, perDay: 1000 },
      webhook: { perMinute: 30, perHour: 500, perDay: 5000 },
      slack: { perMinute: 5, perHour: 50, perDay: 200 },
      teams: { perMinute: 5, perHour: 50, perDay: 200 },
    },
    retryStrategy: {
      maxRetries: 3,
      backoffMultiplier: 2,
      initialDelayMs: 5000,
    },
  };
}

// ─── EMAIL CONFIG ──────────────────────────────────────────────

export interface EmailConfig {
  provider: "smtp" | "sendgrid" | "ses" | "postmark";
  from: string;
  replyTo: string;
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
  };
  sendgrid?: {
    apiKey: string;
  };
  templates: Record<string, { subject: string; body: string }>;
  enabled: boolean;
}

export function getEmailConfig(): EmailConfig {
  return {
    provider: "smtp",
    from: process.env.SMTP_FROM || "alerts@harch.atelier",
    replyTo: process.env.SMTP_REPLY_TO || "support@harch.atelier",
    smtp: {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_SECURE === "true",
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || "",
    },
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY || "",
    },
    templates: {
      welcome: { subject: "Welcome to Harch Atelier", body: "Welcome to Harch Atelier..." },
      alert_critical: { subject: "🚨 CRITICAL Alert: {{title}}", body: "{{body}}" },
      alert_high: { subject: "⚠️ HIGH Alert: {{title}}", body: "{{body}}" },
      report_ready: { subject: "📊 Report Ready: {{title}}", body: "Your report is ready." },
      briefing_morning: { subject: "🌅 Morning Briefing", body: "Good morning!" },
    },
    enabled: true,
  };
}

// ─── SECURITY CONFIG ───────────────────────────────────────────

export interface SecurityConfig {
  cors: {
    origins: string[];
    credentials: boolean;
    methods: string[];
    headers: string[];
    maxAge: number;
  };
  csp: string;
  rateLimiting: boolean;
  ipBlocking: boolean;
  auditLogging: boolean;
  encryptionKey: string;
  jwtSecret: string;
  sessionSecret: string;
  csrfEnabled: boolean;
  helmetEnabled: boolean;
  hsts: {
    enabled: boolean;
    maxAge: number;
    includeSubDomains: boolean;
    preload: boolean;
  };
}

export function getSecurityConfig(): SecurityConfig {
  const env = getEnvironment();
  return {
    cors: {
      origins: env === "production"
        ? ["https://atelier.harchcorp.com"]
        : ["http://localhost:3000", "http://127.0.0.1:3000"],
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      headers: ["Content-Type", "Authorization", "X-API-Key", "X-Request-ID"],
      maxAge: 86400,
    },
    csp: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' https: wss:; worker-src 'self' blob:; font-src 'self' data:;",
    rateLimiting: true,
    ipBlocking: true,
    auditLogging: true,
    encryptionKey: process.env.ENCRYPTION_KEY || "dev-encryption-key-change-in-production",
    jwtSecret: process.env.NEXTAUTH_SECRET || "dev-jwt-secret-change-in-production",
    sessionSecret: process.env.SESSION_SECRET || "dev-session-secret-change-in-production",
    csrfEnabled: env === "production",
    helmetEnabled: true,
    hsts: {
      enabled: env === "production",
      maxAge: 63072000,
      includeSubDomains: true,
      preload: true,
    },
  };
}

// ─── EXPORT CONFIG ─────────────────────────────────────────────

export interface ExportConfig {
  maxRecords: number;
  timeout: number;
  formats: string[];
  defaultFormat: string;
  tempDir: string;
  retention: {
    files: number;
    hours: number;
  };
  pdf: {
    pageSize: string;
    orientation: string;
    margins: { top: number; bottom: number; left: number; right: number };
    fontSize: number;
    fontFamily: string;
  };
  excel: {
    sheetName: string;
    freezeHeader: boolean;
    autoFilter: boolean;
    maxRows: number;
  };
  csv: {
    delimiter: string;
    quote: string;
    escape: string;
    header: boolean;
    bom: boolean;
  };
}

export function getExportConfig(): ExportConfig {
  return {
    maxRecords: 10000,
    timeout: 120000,
    formats: ["pdf", "excel", "csv", "json", "powerpoint"],
    defaultFormat: "pdf",
    tempDir: "/tmp/harch-exports",
    retention: { files: 100, hours: 24 },
    pdf: {
      pageSize: "A4",
      orientation: "portrait",
      margins: { top: 72, bottom: 72, left: 72, right: 72 },
      fontSize: 11,
      fontFamily: "Helvetica",
    },
    excel: {
      sheetName: "Harch Atelier Export",
      freezeHeader: true,
      autoFilter: true,
      maxRows: 100000,
    },
    csv: {
      delimiter: ",",
      quote: '"',
      escape: '"',
      header: true,
      bom: true,
    },
  };
}

// ─── CACHE CONFIG ──────────────────────────────────────────────

export interface CacheConfig {
  enabled: boolean;
  provider: "memory" | "redis";
  ttl: {
    short: number;
    medium: number;
    long: number;
    veryLong: number;
  };
  maxKeys: number;
  keyPrefix: string;
  redis?: {
    url: string;
    password: string;
    db: number;
  };
  invalidateOn: string[];
}

export function getCacheConfig(): CacheConfig {
  return {
    enabled: true,
    provider: "memory",
    ttl: {
      short: 60000,
      medium: 300000,
      long: 3600000,
      veryLong: 86400000,
    },
    maxKeys: 10000,
    keyPrefix: "harch:",
    redis: {
      url: process.env.REDIS_URL || "",
      password: process.env.REDIS_PASSWORD || "",
      db: 0,
    },
    invalidateOn: ["article.created", "alert.triggered", "report.generated", "sentiment.updated"],
  };
}

// ─── MONITORING CONFIG ─────────────────────────────────────────

export interface MonitoringConfig {
  enabled: boolean;
  sentry: {
    dsn: string;
    environment: string;
    tracesSampleRate: number;
  };
  metrics: {
    enabled: boolean;
    endpoint: string;
    interval: number;
  };
  healthCheck: {
    enabled: boolean;
    endpoint: string;
    interval: number;
    timeout: number;
  };
  logging: {
    level: string;
    format: "json" | "text";
    destination: "stdout" | "file" | "both";
    filePath: string;
    maxFileSize: number;
    maxFiles: number;
  };
  apm: {
    enabled: boolean;
    serviceName: string;
    provider: string;
  };
}

export function getMonitoringConfig(): MonitoringConfig {
  const env = getEnvironment();
  return {
    enabled: true,
    sentry: {
      dsn: process.env.SENTRY_DSN || "",
      environment: env,
      tracesSampleRate: env === "production" ? 0.1 : 1.0,
    },
    metrics: {
      enabled: true,
      endpoint: "/api/metrics",
      interval: 60000,
    },
    healthCheck: {
      enabled: true,
      endpoint: "/api/health",
      interval: 300000,
      timeout: 5000,
    },
    logging: {
      level: env === "production" ? "info" : "debug",
      format: "json",
      destination: "stdout",
      filePath: "/var/log/harch-atelier",
      maxFileSize: 104857600,
      maxFiles: 10,
    },
    apm: {
      enabled: env === "production",
      serviceName: "harch-atelier",
      provider: "none",
    },
  };
}

// ─── PRICING CONFIG ────────────────────────────────────────────

export interface PricingConfig {
  currency: string;
  plans: Array<{
    id: string;
    name: string;
    priceMonthly: number;
    priceAnnual: number;
    features: string[];
    limits: {
      companies: number;
      alerts: number;
      reports: number;
      apiCalls: number;
      users: number;
    };
  }>;
  addOns: Array<{
    id: string;
    name: string;
    price: number;
    description: string;
  }>;
}

export function getPricingConfig(): PricingConfig {
  return {
    currency: "MAD",
    plans: [
      {
        id: "starter",
        name: "Starter",
        priceMonthly: 5000,
        priceAnnual: 50000,
        features: ["1 company", "Brand Monitor dashboard", "Daily alerts", "Weekly briefing", "Email support"],
        limits: { companies: 1, alerts: 100, reports: 4, apiCalls: 1000, users: 3 },
      },
      {
        id: "pro",
        name: "Professional",
        priceMonthly: 15000,
        priceAnnual: 150000,
        features: ["3 companies", "All 4 dashboards", "Real-time alerts", "WhatsApp briefing", "Monthly reports", "API access", "Priority support"],
        limits: { companies: 3, alerts: 1000, reports: 12, apiCalls: 10000, users: 10 },
      },
      {
        id: "enterprise",
        name: "Enterprise",
        priceMonthly: 50000,
        priceAnnual: 500000,
        features: ["10 companies", "All 4 dashboards", "Real-time alerts", "WhatsApp + Push", "Custom reports", "Full API access", "Dedicated support", "SLA guarantee", "Custom integrations"],
        limits: { companies: 10, alerts: 10000, reports: 52, apiCalls: 100000, users: 50 },
      },
    ],
    addOns: [
      { id: "extra-company", name: "Additional Company", price: 5000, description: "Track one additional company" },
      { id: "custom-report", name: "Custom Report", price: 2000, description: "Bespoke research report" },
      { id: "api-boost", name: "API Call Boost (10K)", price: 1000, description: "10,000 additional API calls" },
      { id: "extra-user", name: "Additional User", price: 500, description: "One additional user seat" },
      { id: "whatsapp-alerts", name: "WhatsApp Alerts", price: 1000, description: "WhatsApp alert delivery" },
      { id: "darija-nlp", name: "Darija NLP Module", price: 3000, description: "Moroccan Arabic dialect processing" },
    ],
  };
}

// ─── MASTER CONFIG ─────────────────────────────────────────────

export interface MasterConfig {
  env: EnvironmentConfig;
  features: FeatureFlags;
  database: DatabaseConfig;
  auth: AuthConfig;
  rateLimits: RateLimitConfig;
  twilio: TwilioConfig;
  llm: LLMConfig;
  cron: CronConfig;
  dashboard: DashboardConfig;
  notifications: NotificationConfig;
  email: EmailConfig;
  security: SecurityConfig;
  export: ExportConfig;
  cache: CacheConfig;
  monitoring: MonitoringConfig;
  pricing: PricingConfig;
}

export function getMasterConfig(): MasterConfig {
  return {
    env: getEnvironmentConfig(),
    features: getFeatureFlags(),
    database: getDatabaseConfig(),
    auth: getAuthConfig(),
    rateLimits: getRateLimitConfig(),
    twilio: getTwilioConfig(),
    llm: getLLMConfig(),
    cron: getCronConfig(),
    dashboard: getDashboardConfig(),
    notifications: getNotificationConfig(),
    email: getEmailConfig(),
    security: getSecurityConfig(),
    export: getExportConfig(),
    cache: getCacheConfig(),
    monitoring: getMonitoringConfig(),
    pricing: getPricingConfig(),
  };
}

// ─── CONFIG VALIDATION ─────────────────────────────────────────

export function validateConfig(config: MasterConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.database.url) {
    errors.push("DATABASE_URL is not set");
  }

  if (config.env.isProd) {
    if (config.auth.secret === "dev-secret-change-in-production") {
      errors.push("NEXTAUTH_SECRET must be set in production");
    }
    if (config.security.encryptionKey === "dev-encryption-key-change-in-production") {
      errors.push("ENCRYPTION_KEY must be set in production");
    }
    if (!config.twilio.enabled && config.features.enableWhatsApp) {
      errors.push("WhatsApp is enabled but Twilio credentials are not set");
    }
  }

  if (config.cache.provider === "redis" && !config.cache.redis?.url) {
    errors.push("Redis is selected but REDIS_URL is not set");
  }

  return { valid: errors.length === 0, errors };
}

// ─── CONFIG SUMMARY ────────────────────────────────────────────

export function getConfigSummary(): Record<string, unknown> {
  const config = getMasterConfig();
  return {
    environment: config.env.env,
    version: config.env.appVersion,
    features: {
      whatsapp: config.features.enableWhatsApp,
      aiInsights: config.features.enableAIInsights,
      vectorSearch: config.features.enableVectorSearch,
      darijaNLP: config.features.enableDarijaNLP,
    },
    database: {
      configured: !!config.database.url,
      poolSize: config.database.poolSize,
    },
    auth: {
      sessionTimeout: config.auth.sessionTimeout,
      maxSessions: config.auth.maxSessionsPerUser,
      passwordMinLength: config.auth.passwordMinLength,
    },
    twilio: {
      enabled: config.twilio.enabled,
      whatsappFrom: config.twilio.whatsappFrom,
    },
    llm: {
      provider: config.llm.defaultProvider,
      model: config.llm.defaultModel,
      embeddingDimensions: config.llm.embeddingDimensions,
    },
    cron: {
      enabled: config.cron.enabled,
      jobCount: config.cron.jobs.length,
    },
    security: {
      rateLimiting: config.security.rateLimiting,
      csrfEnabled: config.security.csrfEnabled,
      hstsEnabled: config.security.hsts.enabled,
    },
    cache: {
      provider: config.cache.provider,
      enabled: config.cache.enabled,
    },
  };
}
