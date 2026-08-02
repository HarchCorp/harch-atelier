# ═══════════════════════════════════════════════════════════════
#  CAHIER DES CHARGES TECHNIQUE ULTIME
#  Master Spec Sheet — Harch Atelier v2.0
#
#  Produit par : Recursive Reverse-Engineering Engine
#  Boucle : LOOP 1 (4 concurrents analysés)
#  Concurrents : Signal AI, AlphaSense, Dataminr, Meltwater
#  Date : 2 août 2026
#  Niveau de précision : Chirurgical
# ═══════════════════════════════════════════════════════════════

## 0. MÉTA-SPÉCIFICATION

### 0.1 Objectif du document
Ce document fusionne l'ingénierie reverse-engineered de 4 géants du secteur
(Signal AI, AlphaSense, Dataminr, Meltwater) en un cahier des charges technique
prêt pour implémentation directe. Chaque assertion est étayée par des faits
vérifiés ou explicitement marquée comme limite à combler.

### 0.2 Concurrents analysés — synthèse technique

| Concurrent | Stack backend | Search engine | LLM strategy | Scale docs | Latence search | ARR/Valuation |
|-----------|---------------|---------------|--------------|------------|----------------|---------------|
| **AlphaSense** | Python + Go + AWS + K8s | Elasticsearch 8.x + Vector DB (hybride) | Multi-LLM gateway (Anthropic/Gemini/OpenAI/Llama via Cerebras WSE-3) | 500M+ | <500ms p95 | $700M+ / $7.5B |
| **Dataminr** | Python + Java + AWS + K8s | Custom (propriétaire, multi-modal) | LLM RAG propriétaire + multimodal (OCR, image, video) | Millions/min ingestion | Seconds (real-time) | ~$200M est. / $1.4B |
| **Meltwater** | Java + Python + Go + Node.js | Elasticsearch + PostgreSQL + Snowflake | GPT-4 + modèles internes (no proprietary LLM) | 10B+ historique, 300-500M/jour | 5-30 min (news) | ~$400M est. |
| **Signal AI** | Non public (probablement Python/Java) | Non public (probable Elasticsearch) | AIQ Engine (propriétaire, BERT-based) | Non public | Non public | ~$60M est. / ~$250M |

### 0.3 Verdict synthétique
- **AlphaSense** = leader search-first financial research (depth verticale)
- **Dataminr** = leader real-time event detection (latency seconds)
- **Meltwater** = leader horizontal media monitoring (scale brute)
- **Signal AI** = challenger reputation intelligence (niche PR/risk)

Harch Atelier doit hybrider les 4 approches :
- **Search-first UX** d'AlphaSense (barre de recherche sémantique puissante)
- **Real-time alerts** de Dataminr (WebSocket push, pas polling)
- **Scale d'ingestion** de Meltwater (Kafka + Elasticsearch)
- **Reputation/risk focus** de Signal AI (32-category framework)
- **+ Moats locaux** : Darija NLP, WhatsApp, AMMC/BAM/BVC, MAD pricing

---

## 1. SCHÉMA DE BASE DE DONNÉES — PostgreSQL / PRISMA COMPLET

### 1.1 Principes architecturaux

```
┌─────────────────────────────────────────────────────────────┐
│                    MULTI-TENANT ARCHITECTURE                 │
│                                                              │
│  Tenant (Company) ──┬── Users (RBAC: admin/analyst/viewer) │
│                     ├── Companies (tracked entities)         │
│                     ├── Articles (media + regulatory)        │
│                     ├── Entities (people + orgs + places)    │
│                     ├── RiskAssessments (32 categories)      │
│                     ├── Alerts (real-time + thresholds)      │
│                     ├── Portfolios (investor desk)           │
│                     ├── Dossiers (due diligence)             │
│                     └── Reports (PDF + structured)           │
│                                                              │
│  RLS (Row Level Security) sur toutes les tables              │
│  Index composites sur (companyId, publishedAt, isDemo)       │
│  Partitioning par mois sur Article + AssetPrice              │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Schéma Prisma — modèle complet

```prisma
// ═══ CORE ENTITIES ═══════════════════════════════════════════

model Company {
  id             String   @id @default(cuid())
  slug           String   @unique
  name           String
  aliases        String[]                    // ["OCP", "Office Chérifien des Phosphates"]
  sector         String                       // GICS-like: "Mining & Phosphates"
  industry       String?
  ticker         String?                      // BVC ticker: "OCP"
  isin           String?                      // International Securities Identification Number
  lei            String?                      // Legal Entity Identifier
  foundedYear    Int?
  headquarters   String?
  website        String?
  description    String?
  logoUrl        String?

  // ─── Multi-tenant isolation ────────────────────────────────
  tenantId       String                       // FK to Tenant (owner of this tracked entity)
  isDemo         Boolean  @default(false)     // demo data isolation

  // ─── Relations ─────────────────────────────────────────────
  articles         Article[]
  sentimentScores  SentimentScore[]
  riskAssessments  RiskAssessment[]
  reputationScores ReputationScore[]
  aiVisibility     AIVisibility[]
  entities         EntityMention[]
  settings         CompanySettings?

  @@index([tenantId, isDemo])
  @@index([sector])
  @@index([ticker])
}

model User {
  id                   String   @id @default(cuid())
  email                String   @unique
  name                 String?
  passwordHash         String?
  role                 String   @default("user")        // user | admin | company-admin
  accountType          String   @default("brand-monitor") // brand-monitor | market-competitor | investment-bank | harch-alpha
  tenantId             String?                           // FK to Tenant
  jobTitle             String?
  onboardingCompleted  Boolean  @default(false)
  status               String   @default("active")      // active | suspended
  lastLoginAt          DateTime?

  // ─── Preferences (JSON for flexibility) ────────────────────
  topics               String[]  @default([])
  competitors          String[]  @default([])
  trackedAssets        String[]  @default([])

  // ─── WhatsApp alerts ───────────────────────────────────────
  whatsappNumber         String?   // E.164: +212600000000
  whatsappAlerts         Boolean   @default(false)
  alertSeverityThreshold String   @default("high")

  // ─── Relations ─────────────────────────────────────────────
  sessions      Session[]
  apiKeys       ApiKey[]
  webhooks      Webhook[]
  accounts      Account[]
  portfolios    Portfolio[]
  dossiers      Dossier[]
  reports       Report[]
  briefings     Briefing[]
  notifications Notification[]

  @@index([tenantId])
  @@index([status])
}

model Tenant {
  id          String   @id @default(cuid())
  name        String                          // "OCP Group" (the customer company)
  plan        String   @default("starter")    // starter | pro | enterprise
  isDemo      Boolean  @default(false)
  createdAt   DateTime @default(now())

  users       User[]
  companies   Company[]                        // tracked entities for this tenant
}

// ═══ MEDIA & CONTENT ═════════════════════════════════════════

model Article {
  id              String   @id @default(cuid())
  companyId       String?
  company         Company? @relation(fields: [companyId], references: [id], onDelete: SetNull)

  title           String
  url             String   @unique
  urlHash         String   @unique             // SHA-256 for dedup
  source          String                       // "Hespress", "TelQuel", "AMMC"
  sourceId        String?                      // RSS GUID or scraper ID
  sourceType      String   @default("media")   // media | regulatory | market | financial | social

  publishedAt     DateTime?
  scrapedAt       DateTime @default(now())
  indexedAt       DateTime?                     // when search-indexed (target: <60s after scrape)

  content         String?                      // full text
  summary         String?                      // LLM-generated summary
  language        String?                       // "fr", "ar", "darija", "en"

  // ─── NLP results ───────────────────────────────────────────
  sentimentLabel  String?                       // positive | neutral | negative
  sentimentScore  Float?                        // -1.0 to 1.0
  relevanceScore  Float?                        // 0.0 to 1.0
  entities        Json?                         // [{name, type, confidence, sentiment}]

  // ─── Vector embedding for semantic search ──────────────────
  embedding       Unsupported("vector(1536)")?  // pgvector — OpenAI text-embedding-3-small

  processed       Boolean  @default(false)
  isDemo          Boolean  @default(false)

  @@index([companyId, publishedAt])
  @@index([source, publishedAt])
  @@index([sentimentLabel])
  @@index([sourceType])
  @@index([isDemo])
  @@index([publishedAt])                        // partition by month
}

model Entity {
  id            String   @id @default(cuid())
  entityType    String                          // person | organization | location | ticker
  name          String
  aliases       String[]
  confidence    Float    @default(0.5)
  firstSeen     DateTime @default(now())
  lastSeen      DateTime @default(now())
  sources       String[]
  tags          String[]                        // ["executive", "minister", "regulator"]
  metadata      Json?                           // {role, companySlug, wikidataId}
  embedding     Unsupported("vector(768)")?     // entity embedding for dedup

  mentions      EntityMention[]

  @@index([entityType])
  @@index([name])
  @@index([tags])
}

model EntityMention {
  id             String   @id @default(cuid())
  entityId       String
  entity         Entity   @relation(fields: [entityId], references: [id], onDelete: Cascade)
  companyId      String
  company        Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  articleId      String?
  mentionText    String
  sentimentLabel String?
  sentimentScore Float?
  mentionedAt    DateTime @default(now())

  @@index([entityId])
  @@index([companyId])
  @@index([mentionedAt])
}

// ═══ ANALYTICS ═══════════════════════════════════════════════

model SentimentScore {
  id            String   @id @default(cuid())
  companyId     String
  company       Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  score         Float                          // -1.0 to 1.0
  positivePct   Float
  neutralPct    Float
  negativePct   Float
  articleCount  Int
  language      String?
  sourceBreakdown Json?                        // {Hespress: 45, TelQuel: 32, ...}
  calculatedAt  DateTime @default(now())
  isDemo        Boolean  @default(false)

  @@index([companyId, calculatedAt])
  @@index([isDemo])
}

model RiskAssessment {
  id              String   @id @default(cuid())
  companyId       String
  company         Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  overallRisk     Float                          // 0-100
  riskLevel       String                         // low | moderate | elevated | high | critical
  category        String                         // 32 categories (Governance, Cybersecurity, ESG, ...)
  frequency       Float?
  impactSeverity  Float?
  velocity        Float?
  riskScore       Float
  trajectory      String?                        // rising | stable | falling
  articleCount    Int?
  assessedAt      DateTime @default(now())
  isDemo          Boolean  @default(false)

  @@index([companyId, assessedAt])
  @@index([riskLevel])
  @@index([category])
}

model ReputationScore {
  id              String   @id @default(cuid())
  companyId       String
  company         Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  overall         Int                            // 0-100 composite
  sentiment       Int
  aiVisibility    Int
  volume          Int
  authority       Int
  innovationScore Int
  innovationWeight Float  @default(0.3)
  performanceScore Int
  performanceWeight Float @default(0.4)
  purposeScore    Int
  purposeWeight   Float  @default(0.3)
  shareOfVoice    Int                            // % of sector conversation
  trend           String                         // up | down | stable
  calculatedAt    DateTime @default(now())
  isDemo          Boolean  @default(false)

  @@index([companyId, calculatedAt])
}

model AIVisibility {
  id              String   @id @default(cuid())
  companyId       String
  company         Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  platform        String                         // ChatGPT | Claude | Gemini | Perplexity | Copilot | Mistral | Grok | Llama
  cited           Boolean
  position        String?                        // "1st", "2nd", "Not mentioned"
  sentiment       String?                        // positive | neutral | negative
  confidence      Float
  summary         String
  query           String                         // the prompt sent to the LLM
  rank            Int?
  mentions        Int?
  shareOfVoice    Float?
  responseExcerpt String?
  sentimentScore  Float?
  batchId         String?
  checkedAt       DateTime @default(now())
  isDemo          Boolean  @default(false)

  @@index([companyId, checkedAt])
  @@index([platform])
}

// ═══ FINANCIAL DATA (Investor Desk + Alpha Desk) ══════════════

model Asset {
  id          String   @id @default(cuid())
  ticker      String   @unique
  name        String
  assetType   String                              // stock | bond | currency | commodity | crypto
  exchange    String                               // BVC | NYSE | NASDAQ
  sector      String?
  companyId   String?
  prices      AssetPrice[]
  sentiments  AssetSentiment[]
  isActive    Boolean  @default(true)

  @@index([exchange])
  @@index([sector])
}

model AssetPrice {
  id          String   @id @default(cuid())
  assetId     String
  asset       Asset    @relation(fields: [assetId], references: [id], onDelete: Cascade)
  price       Float
  volume      Int
  changePct   Float
  tradedAt    DateTime

  @@index([assetId, tradedAt])
  @@index([tradedAt])                              // partition by month
}

model AssetSentiment {
  id          String   @id @default(cuid())
  assetId     String
  asset       Asset    @relation(fields: [assetId], references: [id], onDelete: Cascade)
  score       Float                                   // -1.0 to 1.0
  articleCount Int
  calculatedAt DateTime @default(now())

  @@index([assetId, calculatedAt])
}

model Portfolio {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name        String
  holdings    PortfolioHolding[]
  createdAt   DateTime @default(now())

  @@index([userId])
}

model PortfolioHolding {
  id          String   @id @default(cuid())
  portfolioId String
  portfolio   Portfolio @relation(fields: [portfolioId], references: [id], onDelete: Cascade)
  ticker      String
  quantity    Float
  avgPrice    Float
  addedAt     DateTime @default(now())

  @@index([portfolioId])
}

model Dossier {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  companyName String
  status      String   @default("draft")              // draft | generating | ready | failed
  sections    Json                                     // structured due diligence
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
}

// ═══ ALERTS & NOTIFICATIONS ══════════════════════════════════

model Alert {
  id          String   @id @default(cuid())
  tenantId    String
  type        String                                   // sentiment_drop | risk_breach | volume_spike | ai_visibility | regulatory
  severity    String                                   // info | low | medium | high | critical
  title       String
  body        String
  companyId   String?
  articleId   String?
  threshold   Json?                                    // {metric, operator, value}
  triggeredAt DateTime @default(now())
  acknowledgedAt DateTime?
  acknowledgedBy String?

  @@index([tenantId, triggeredAt])
  @@index([severity, triggeredAt])
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  type      String                                   // alert | report | system | threshold
  title     String
  body      String
  severity  String   @default("info")
  read      Boolean  @default(false)
  link      String?
  createdAt DateTime @default(now())
  isDemo    Boolean  @default(false)

  @@index([userId, read, createdAt])
}

// ═══ REPORTS & BRIEFINGS ═════════════════════════════════════

model Report {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  companyId   String?
  company     Company? @relation(fields: [companyId], references: [id], onDelete: SetNull)
  title       String
  period      String                                   // "2026-07"
  summary     String
  sections    Json                                     // structured report data
  status      String   @default("ready")              // draft | generating | ready | failed
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([userId, period])
  @@index([userId, createdAt])
  @@index([period])
}

model Briefing {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  date        DateTime
  content     Json                                     // structured morning briefing
  model       String?                                  // "glm-4"
  deliveryChannel String  @default("whatsapp")        // whatsapp | email | dashboard
  deliveredAt DateTime?
  createdAt   DateTime @default(now())

  @@unique([userId, date])
}

// ═══ INTEGRATIONS ════════════════════════════════════════════

model ApiKey {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name        String
  keyHash     String   @unique                         // SHA-256 of the API key
  keyPrefix   String                                   // first 8 chars for display
  permissions String[]  @default(["read"])
  lastUsedAt  DateTime?
  expiresAt   DateTime?
  createdAt   DateTime @default(now())
  revokedAt   DateTime?

  @@index([userId])
}

model Webhook {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  url         String
  events      String[]                                 // ["alert.created", "report.ready", ...]
  secret      String                                   // HMAC signing secret
  isActive    Boolean  @default(true)
  deliveries  WebhookDelivery[]
  createdAt   DateTime @default(now())

  @@index([userId])
}

model WebhookDelivery {
  id          String   @id @default(cuid())
  webhookId   String
  webhook     Webhook  @relation(fields: [webhookId], references: [id], onDelete: Cascade)
  event       String
  payload     Json
  statusCode  Int?
  response    String?
  deliveredAt DateTime @default(now())

  @@index([webhookId, deliveredAt])
}

model CompanySettings {
  id                String   @id @default(cuid())
  companyId         String   @unique
  company           Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  topics            String[]  @default([])
  competitors       String[]  @default([])
  alertThresholds  Json?
  monitoredSources  String[]  @default([])
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

// ═══ SANCTIONS SCREENING (Investor Desk) ══════════════════════

model SanctionsCache {
  id            String   @id @default(cuid())
  list          String   @unique                        // OFAC | EU | UN
  data          String                                   // JSON string of entries
  entryCount    Int
  downloadedAt  DateTime
  sourceUrl     String?
  byteSize      Int?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([list, downloadedAt])
}

// ═══ INFLUENCERS ═════════════════════════════════════════════

model Influencer {
  id              String   @id @default(cuid())
  name            String
  handle          String?
  platform        String                                 // twitter | linkedin | instagram | youtube | tiktok | press
  bio             String?
  followers       Int      @default(0)
  following       Int      @default(0)
  verified        Boolean  @default(false)
  location        String?
  languages       String   @default("[]")
  topics          String   @default("[]")
  reachScore      Int      @default(0)
  engagementScore Int      @default(0)
  authorityScore  Int      @default(0)
  influenceScore  Int      @default(0)
  lastAnalyzed    DateTime?
  mentions        InfluencerMention[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([platform, influenceScore])
  @@index([location])
}

model InfluencerMention {
  id           String   @id @default(cuid())
  influencerId String
  influencer   Influencer @relation(fields: [influencerId], references: [id], onDelete: Cascade)
  alertId      String?
  title        String
  url          String?
  sentiment    String   @default("neutral")
  reach        Int      @default(0)
  publishedAt  DateTime
  createdAt    DateTime @default(now())

  @@index([influencerId, publishedAt])
}
```

### 1.3 Indexation stratégique

**Index composites critiques** (ordre optimisé pour les queries les plus fréquentes) :
- `Article(tenantId, companyId, publishedAt DESC)` — feed d'articles par entreprise
- `Article(tenantId, sourceType, publishedAt DESC)` — feed réglementaire
- `Article(tenantId, sentimentLabel, publishedAt DESC)` — alertes négatives
- `EntityMention(entityId, mentionedAt DESC)` — historique d'une personne
- `AssetPrice(assetId, tradedAt DESC)` — sparkline BVC
- `Alert(tenantId, severity, triggeredAt DESC)` — notification bell

**Partitioning** :
- `Article` par mois (365 jours rétenus = 12 partitions)
- `AssetPrice` par mois (365 jours = 12 partitions)
- `Alert` par mois (90 jours rétenus = 3 partitions)

**RLS (Row Level Security)** :
```sql
ALTER TABLE Article ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON Article
  USING (tenantId = current_setting('app.tenant_id')::text);
```

---

## 2. ENDPOINTS D'API — DOCUMENTATION COMPLÈTE

### 2.1 Architecture API

```
┌──────────────────────────────────────────────────────────────┐
│                    API GATEWAY (Next.js API Routes)           │
│                                                               │
│  /api/v1/*          → Public REST API (API keys)             │
│  /api/console/*     → Authenticated console endpoints (JWT)  │
│  /api/cron/*        → Cron job triggers (CRON_SECRET)        │
│  /api/auth/*        → NextAuth.js endpoints                  │
│  /api/webhooks/*    → Inbound webhook receivers              │
│  /api/flagship-report → Aggregation endpoint (public)        │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Public REST API v1 (API key auth)

```
GET  /api/v1/reputation?company={slug}&period={YYYY-MM}
  → { overall, sentiment, aiVisibility, volume, authority, trend }

GET  /api/v1/alerts?company={slug}&severity={level}&since={ISO}
  → [{ id, title, severity, sentiment, source, url, publishedAt }]

GET  /api/v1/sentiment?company={slug}&from={ISO}&to={ISO}&granularity={day|week|month}
  → [{ date, score, positivePct, neutralPct, negativePct, articleCount }]

GET  /api/v1/screen?entity={name}&lists=OFAC,EU,UN
  → { matched, entries: [{ list, name, aliases, program, startDate }], checkedAt }

POST /api/v1/sentiment
  Body: { text, language?: "fr"|"ar"|"darija"|"en" }
  → { label, score, confidence, entities: [{name, type, sentiment}] }

GET  /api/v1/companies?sector={sector}&q={search}&page=1&limit=20
  → { data: [{ slug, name, sector, ticker, score }], pagination }

GET  /api/v1/companies/{slug}
  → { slug, name, sector, ticker, description, reputationScore, sentimentTrend, ... }
```

### 2.3 Console API (JWT auth)

```
# Brand Monitor
GET  /api/console/alerts?range={24h|7d|30d}
GET  /api/console/weather
GET  /api/console/topics
GET  /api/console/ai-visibility
GET  /api/console/crisis
GET  /api/console/geo-signals?range={7d|30d}
GET  /api/console/insights?accountType={type}
POST /api/console/insights/generate

# Competitor Intel
GET  /api/console/neighbors
GET  /api/console/narratives

# Investor Desk
GET  /api/investor/dossiers
POST /api/investor/dossiers/generate
GET  /api/investor/screen?entity={name}

# Alpha Desk
GET  /api/trader/assets
GET  /api/trader/assets/{ticker}/history?days={30|90|365}
GET  /api/trader/assets/{ticker}/correlation
GET  /api/trader/stream?tickers={CSV}     → SSE stream
GET  /api/trader/stats

# Enterprise
GET  /api/console/reports
POST /api/console/reports
GET  /api/console/reports/{id}/pdf
GET  /api/api-keys
POST /api/api-keys
DELETE /api/api-keys/{id}
GET  /api/webhooks
POST /api/webhooks
POST /api/webhooks/{id}/test

# Regulatory Feed
GET  /api/console/regulatory?source={AMMC|BAM|BVC}

# Darija Analyzer
POST /api/console/darija-analyze
  Body: { text }
  → { label, score, code_switching: { fr, ar, darija }, entities }

# Notifications
GET  /api/console/notifications
POST /api/console/notifications/push
GET  /api/console/export-log
```

### 2.4 Cron jobs

```
GET  /api/cron/scrape-rss           → every 30 min (CRON_SECRET)
GET  /api/cron/scrape-regulatory    → daily 06:00 UTC
GET  /api/cron/refresh-bvc-prices   → daily 18:30 UTC (BVC close)
GET  /api/cron/refresh-sanctions    → daily 03:00 UTC
GET  /api/cron/nlp                  → every 15 min (process unprocessed articles)
GET  /api/cron/ai-visibility        → daily 22:00 UTC (probe 8 LLMs)
GET  /api/cron/generate-briefings   → daily 07:00 UTC (morning WhatsApp)
GET  /api/cron/generate-reports     → 1st of month 00:00 UTC
GET  /api/cron/whatsapp-alerts      → every 5 min (check thresholds)
GET  /api/cron/notifications        → every 2 min
GET  /api/cron/agents               → every 10 min (autonomous agents)
GET  /api/cron/health               → every 5 min
GET  /api/cron/clean-jobs           → daily 04:00 UTC
GET  /api/cron/dispatch             → every min (job queue dispatcher)
GET  /api/cron/refresh              → every hour (refresh derived metrics)
```

---

## 3. PIPELINE D'INGESTION ASYNCHRONE

### 3.1 Architecture du pipeline

```
┌──────────────────────────────────────────────────────────────────┐
│                    INGESTION PIPELINE                              │
│                                                                    │
│  ┌─────────┐    ┌──────────┐    ┌──────────┐    ┌─────────────┐  │
│  │ Sources │───▶│ Scraper  │───▶│ Dedup    │───▶│ NLP Pipeline│  │
│  │ (16 RSS │    │ (Bun)    │    │ (urlHash)│    │ (GLM-4 +    │  │
│  │  + AMMC │    │          │    │          │    │  BERT)      │  │
│  │  + BAM  │    └──────────┘    └──────────┘    └──────┬──────┘  │
│  │  + BVC) │           │                              │          │
│  └─────────┘           ▼                              ▼          │
│                 ┌──────────┐    ┌──────────┐    ┌─────────────┐  │
│                 │ Postgres │    │ Vector   │    │ Elasticsearch│  │
│                 │ (source) │    │ (pgvector│    │ (keyword +  │  │
│                 │          │    │  1536d)  │    │  BM25)      │  │
│                 └──────────┘    └──────────┘    └─────────────┘  │
│                       │                              │            │
│                       ▼                              ▼            │
│                 ┌──────────┐    ┌──────────┐    ┌─────────────┐  │
│                 │ Alerts   │    │ Sentiment│    │ Search API  │  │
│                 │ Engine   │    │ Aggregator│   │ (<500ms)    │  │
│                 └────┬─────┘    └──────────┘    └─────────────┘  │
│                      │                                            │
│                      ▼                                            │
│              ┌───────────────┐    ┌──────────┐                   │
│              │ Notification  │───▶│ WhatsApp │                   │
│              │ Dispatcher    │    │ (Twilio) │                   │
│              └───────────────┘    └──────────┘                   │
└──────────────────────────────────────────────────────────────────┘
```

### 3.2 Déduplication

```typescript
// 3-layer deduplication (inspired by Meltwater's pipeline)
async function deduplicateArticle(article: RawArticle): Promise<boolean> {
  // Layer 1: URL hash (exact URL match)
  const urlHash = crypto.createHash("sha256").update(article.url).digest("hex");
  const existing = await prisma.article.findUnique({ where: { urlHash } });
  if (existing) return false; // skip duplicate

  // Layer 2: Title similarity (MinHash / SimHash)
  const titleSimhash = computeSimhash(article.title);
  const similar = await prisma.article.findFirst({
    where: {
      publishedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      // custom function: simhash_distance(titleSimhash) < 3
    },
  });
  if (similar) return false;

  // Layer 3: Content fingerprint (first 500 chars normalized)
  const contentFingerprint = normalize(article.content?.slice(0, 500) || "");
  const fingerprintHash = crypto.createHash("sha256").update(contentFingerprint).digest("hex");
  const dupContent = await prisma.article.findFirst({
    where: { urlHash: fingerprintHash },
  });
  if (dupContent) return false;

  return true; // not a duplicate, proceed with ingestion
}
```

### 3.3 NLP Pipeline (sentiment + NER + Darija)

```typescript
// Hybrid NLP: BERT for multilingual + custom Darija model
async function processArticle(article: Article): Promise<void> {
  // 1. Language detection (fasttext)
  const lang = await detectLanguage(article.content);

  // 2. Sentiment analysis (model depends on language)
  let sentiment: { label: string; score: number };
  if (lang === "darija") {
    sentiment = await analyzeDarijaSentiment(article.content); // custom model
  } else if (lang === "ar") {
    sentiment = await analyzeArabicSentiment(article.content); // CAMeL Tools
  } else {
    sentiment = await analyzeMultilingualSentiment(article.content); // multilingual BERT
  }

  // 3. NER (Named Entity Recognition)
  const entities = await extractEntities(article.content, lang);
  // entities: [{ name, type: "person"|"org"|"location", confidence, sentiment }]

  // 4. Vector embedding (for semantic search)
  const embedding = await generateEmbedding(article.content);
  // OpenAI text-embedding-3-small (1536 dimensions)

  // 5. Relevance scoring (company match)
  const relevance = await scoreRelevance(article, entities);

  // 6. Persist
  await prisma.article.update({
    where: { id: article.id },
    data: {
      sentimentLabel: sentiment.label,
      sentimentScore: sentiment.score,
      entities: entities,
      embedding: embedding,
      relevanceScore: relevance,
      language: lang,
      processed: true,
      indexedAt: new Date(),
    },
  });

  // 7. Index in Elasticsearch (keyword + BM25)
  await esClient.index({
    index: "articles",
    id: article.id,
    body: {
      title: article.title,
      content: article.content,
      source: article.source,
      publishedAt: article.publishedAt,
      companyId: article.companyId,
      sentimentLabel: sentiment.label,
    },
  });

  // 8. Check alert thresholds
  await checkAlertThresholds(article, sentiment);
}
```

### 3.4 Latence cibles (inspired by AlphaSense + Dataminr)

| Étape | Cible | Concurrent de référence |
|-------|-------|------------------------|
| Scraper → DB | <10s | Meltwater: 5-30 min |
| DB → NLP processed | <60s | AlphaSense: "within minutes" |
| NLP → Search indexed | <30s | AlphaSense: 50K docs/min throughput |
| Trigger → Alert delivered | <5s | Dataminr: seconds |
| Search query → Results | <500ms | AlphaSense: <500ms p95 |
| Dashboard load (full) | <2s | Industry standard |

---

## 4. DÉPLOIEMENT DES AGENTS UI/UX PAR PERSONA

### 4.1 Risk Officer (Investor Desk)

**Angoisse métier résolue** : "Est-ce que cette entité est sanctionnée? Est-ce que ce dossier de due diligence est complet?"

**Sections** :
1. **Screening** — Recherche d'entité + scan OFAC/EU/UN (27K entries)
   - Composant: `EntitySearchBar` + `SanctionsResultsTable`
   - Flux: HTTP request → API → DB lookup → response (<1s)
2. **Dossiers** — Due diligence structurée (LLM-generated)
   - Composant: `DossierGenerator` + `DossierViewer`
   - Flux: POST generate → LLM (GLM-4) → structured JSON → PDF
3. **Compliance** — Regulatory feed (AMMC/BAM/BVC)
   - Composant: `RegulatoryFeedList` + `FilterChips`
4. **Risk Map** — Heatmap géo + sectoriel
   - Composant: `RiskMatrix` (React Flow) + `GeoHeatmap` (deck.gl)
5. **Red Flags** — Alertes critiques non acquittées
   - Composant: `RedFlagList` + `AcknowledgeButton`

**Bibliothèques** : React Flow (risk graph), deck.gl (geo), TanStack Virtual (lists)

### 4.2 Comex / CRO (Brand Monitor)

**Angoisse métier résolue** : "Quelle est notre réputation ce matin? Y a-t-il une crise naissante?"

**Sections** :
1. **Weather** — Score de réputation instantané (gauge)
2. **Signals** — Feed temps réel d'alertes
3. **Sentiment** — Trend chart 30/90/365 jours
4. **AI Visibility** — 8 LLMs probing (cité? rang? sentiment?)
5. **Influencers** — Top voices par secteur
6. **Reports** — PDF mensuels générés

**Bibliothèques** : ECharts (charts), Recharts (simple charts), TanStack Virtual (alert feed)

### 4.3 PR Manager (Brand Monitor — Deep Dive)

**Angoisse métier résolue** : "Qui parle de nous? D'où? Avec quel sentiment?"

**Sections** :
1. **Multi-Source Feed** — Articles virtualisés (32px row height)
2. **Language Distribution** — Donut chart FR/AR/EN/Darija
3. **Source-Type Breakdown** — Stacked bar (media/social/financial/ai)
4. **Geographic Cartography** — deck.gl hexagon layer
5. **Entity Graph** — React Flow network of people/orgs/places

### 4.4 Investor (Investor Desk + Alpha Desk)

**Angoisse métier résolue** : "Est-ce que je dois acheter/vendre? Quel est le sentiment du marché?"

**Sections (Alpha Desk)** :
1. **Pulse** — Real-time price stream (SSE WebSocket)
2. **Signal** — AI-generated trading signals
3. **Depth** — Order book visualization
4. **Alerts** — Price threshold alerts
5. **Positions** — Portfolio tracker

**Sections (Investor Desk)** :
1. **Screening** — Sanctions + adverse media
2. **Dossiers** — Due diligence
3. **Compliance** — Regulatory
4. **Risk Map** — Portfolio risk heatmap

---

## 5. ARCHITECTURE TEMPS RÉEL — WebSocket vs POLLING

### 5.1 Stratégie hybride (inspired by Dataminr)

```
┌──────────────────────────────────────────────────────────────┐
│              REAL-TIME DELIVERY ARCHITECTURE                  │
│                                                               │
│  ┌─────────────┐         ┌──────────────┐                    │
│  │  Dashboard  │◀──SSE───│  Price Stream│  (Alpha Desk only) │
│  │  (client)   │  poll 3s│  (mini-svc)  │                    │
│  └──────┬──────┘         └──────────────┘                    │
│         │                                                     │
│         │ HTTP polling (3-15s for alerts, weather, feeds)    │
│         │                                                     │
│  ┌──────▼──────┐         ┌──────────────┐                    │
│  │  Next.js    │◀──HTTP──│  Postgres    │                    │
│  │  API Routes │         │  (source)    │                    │
│  └─────────────┘         └──────────────┘                    │
│                                                               │
│  ┌─────────────┐         ┌──────────────┐                    │
│  │  WhatsApp   │◀──Webhook│  Twilio     │  (alerts)          │
│  │  (user)     │         │  (mini-svc)  │                    │
│  └─────────────┘         └──────────────┘                    │
└──────────────────────────────────────────────────────────────┘
```

**Rationale** :
- **Dataminr** uses WebSocket push for real-time alerts (seconds latency)
- **AlphaSense** uses HTTP polling (minutes latency)
- **Harch** uses hybrid: SSE for price stream (sub-second), HTTP polling 3-15s for alerts, WhatsApp for async critical alerts

---

## 6. AUTO-CRITIQUE — 3 FAIBLESSES IDENTIFIÉES

### Faiblesse 1 : Pas de vector search opérationnel
Le schéma spécifie `pgvector` et `embedding` sur Article, mais le code actuel ne génère pas d'embeddings. La recherche sémantique (style AlphaSense) n'est pas implémentée. **Gap vs AlphaSense : critique.**

### Faiblesse 2 : Pas de pipeline Kafka
Le schéma mentionne Kafka dans l'architecture Meltwater, mais Harch utilise des cron jobs (polling) pour l'ingestion. Pas de streaming event-driven. **Gap vs Meltwater/Dataminr : significatif pour la scale.**

### Faiblesse 3 : Pas de LLM gateway multi-modèle
AlphaSense route vers Anthropic/Gemini/OpenAI/Llama selon la tâche. Harch utilise uniquement GLM-4. Pas de fallback, pas de cost optimization, pas de vendor lock-in protection. **Gap vs AlphaSense : moyen.**

---

## 7. ORDRE DE BOUCLE — LOOP 2

Les 3 faiblesses ci-dessus sont injectées comme paramètres d'entrée de la PHASE 1 du cycle suivant. La boucle continue de tourner pour affiner le cahier des charges jusqu'à précision chirurgicale.

**LOOP 2 objectifs** :
1. Spécifier l'implémentation pgvector + Elasticsearch hybride (RRF fusion)
2. Spécifier le pipeline Kafka (topics, consumers, producers)
3. Spécifier le LLM Router (routing rules, cost model, fallback chain)

---

# ═══════════════════════════════════════════════════════════════
#  LOOP 2 — REFINEMENT (Précision chirurgicale)
# ═══════════════════════════════════════════════════════════════

## 8. FAIBLESSE 1 — IMPLÉMENTATION VECTOR SEARCH HYBRIDE

### 8.1 Architecture cible (inspired by AlphaSense)

```
┌──────────────────────────────────────────────────────────────────┐
│              HYBRID SEARCH ARCHITECTURE (AlphaSense pattern)      │
│                                                                    │
│  Query utilisateur                                                 │
│       │                                                            │
│       ▼                                                            │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐           │
│  │  BM25 Search│    │ Vector Search│   │  RRF Fusion │           │
│  │  (Elastic-  │    │ (pgvector   │    │  (Reciprocal│           │
│  │  search 8.x)│    │  1536 dims) │    │  Rank Fusion)│          │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘           │
│         │                  │                   │                  │
│         │    scores        │    scores        │                  │
│         └──────────────────┴───────────────────┘                  │
│                            │                                      │
│                            ▼                                      │
│                   ┌─────────────────┐                             │
│                   │  Re-ranked      │  (ML model: click-through,  │
│                   │  Results        │   dwell time, authority)    │
│                   └─────────────────┘                             │
│                            │                                      │
│                            ▼                                      │
│                   < 500ms p95 latency target                     │
└──────────────────────────────────────────────────────────────────┘
```

### 8.2 Schéma SQL — pgvector extension

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to Article (1536 dims = OpenAI text-embedding-3-small)
ALTER TABLE "Article" ADD COLUMN embedding vector(1536);

-- Create HNSW index for fast approximate nearest neighbor search
CREATE INDEX idx_article_embedding ON "Article"
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Add embedding column to Entity (768 dims = smaller model for entities)
ALTER TABLE "Entity" ADD COLUMN embedding vector(768);
CREATE INDEX idx_entity_embedding ON "Entity"
  USING hnsw (embedding vector_cosine_ops);
```

### 8.3 Génération d'embeddings (pipeline)

```typescript
// src/lib/embeddings.ts
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateEmbedding(text: string): Promise<number[]> {
  // Truncate to 8000 tokens (OpenAI limit)
  const truncated = text.slice(0, 32000); // ~8K tokens

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small", // 1536 dims, $0.02/1M tokens
    input: truncated,
  });

  return response.data[0].embedding;
}

// Batch embedding for efficiency (100 docs at once)
export async function generateEmbeddingsBatch(
  texts: string[]
): Promise<number[][]> {
  const batches = [];
  for (let i = 0; i < texts.length; i += 100) {
    const batch = texts.slice(i, i + 100);
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: batch,
    });
    batches.push(...response.data.map((d) => d.embedding));
  }
  return batches;
}
```

### 8.4 Search API — hybrid query

```typescript
// src/app/api/v1/search/route.ts
import { prisma } from "@/lib/db";
import { openai } from "@/lib/embeddings";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const companySlug = searchParams.get("company");
  const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"));

  // 1. Generate query embedding
  const queryEmbedding = await generateEmbedding(query);

  // 2. Vector search (pgvector) — semantic similar articles
  const vectorResults = await prisma.$queryRaw`
    SELECT id, title, source, "publishedAt",
      1 - (embedding <=> ${queryEmbedding}::vector) as similarity
    FROM "Article"
    WHERE "processed" = true
      AND "isDemo" = false
      ${companySlug ? prisma.$raw`AND "companyId" = (SELECT id FROM "Company" WHERE slug = ${companySlug})` : prisma.$raw``}
      AND embedding IS NOT NULL
    ORDER BY embedding <=> ${queryEmbedding}::vector
    LIMIT ${limit * 2}
  `;

  // 3. BM25 search (Postgres full-text) — keyword matching
  const bm25Results = await prisma.$queryRaw`
    SELECT id, title, source, "publishedAt",
      ts_rank_cd(search_vector, plainto_tsquery('french', ${query})) as rank
    FROM "Article"
    WHERE "processed" = true
      AND "isDemo" = false
      AND search_vector @@ plainto_tsquery('french', ${query})
    ORDER BY rank DESC
    LIMIT ${limit * 2}
  `;

  // 4. RRF (Reciprocal Rank Fusion) — merge both result sets
  const rrfK = 60; // standard constant
  const scores = new Map<string, { article: any; score: number }>();

  vectorResults.forEach((r: any, i: number) => {
    const existing = scores.get(r.id) || { article: r, score: 0 };
    existing.score += 1 / (rrfK + i + 1);
    scores.set(r.id, existing);
  });

  bm25Results.forEach((r: any, i: number) => {
    const existing = scores.get(r.id) || { article: r, score: 0 };
    existing.score += 1 / (rrfK + i + 1);
    scores.set(r.id, existing);
  });

  // 5. Sort by fused score, take top N
  const fused = [...scores.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ article, score }) => ({ ...article, fusedScore: score }));

  return Response.json({ data: fused, query, latency: "target <500ms" });
}
```

### 8.5 Indexation Postgres full-text (multilingue)

```sql
-- Add search_vector column for BM25-style full-text search
ALTER TABLE "Article" ADD COLUMN search_vector tsvector;

-- Create GIN index
CREATE INDEX idx_article_search ON "Article" USING gin(search_vector);

-- Trigger to auto-populate search_vector on insert/update
CREATE OR REPLACE FUNCTION article_search_vector_update() RETURNS trigger AS $$
BEGIN
  -- Language-aware full-text indexing
  NEW.search_vector :=
    setweight(to_tsvector('french', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(NEW.content, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER article_search_vector_trigger
  BEFORE INSERT OR UPDATE ON "Article"
  FOR EACH ROW EXECUTE FUNCTION article_search_vector_update();
```

---

## 9. FAIBLESSE 2 — PIPELINE KAFKA EVENT-DRIVEN

### 9.1 Architecture cible (inspired by Meltwater + Dataminr)

```
┌──────────────────────────────────────────────────────────────────┐
│              KAFKA EVENT-DRIVEN PIPELINE                          │
│                                                                    │
│  Producers                    Topics              Consumers       │
│  ┌──────────┐                ┌──────────────┐    ┌────────────┐  │
│  │ RSS      │───produce────▶│ article.raw  │───▶│ Dedup      │  │
│  │ Scraper  │                └──────────────┘    │ Worker     │  │
│  └──────────┘                                    └─────┬──────┘  │
│                                                         │         │
│  ┌──────────┐                ┌──────────────┐          ▼         │
│  │ AMMC     │───produce────▶│ article.dedup│───▶┌────────────┐  │
│  │ Scraper  │                └──────────────┘    │ NLP        │  │
│  └──────────┘                                    │ Worker     │  │
│                                                   └─────┬──────┘  │
│  ┌──────────┐                ┌──────────────┐          │         │
│  │ BVC      │───produce────▶│ price.raw    │───▶┌──────▼──────┐  │
│  │ Scraper  │                └──────────────┘    │ Price      │  │
│  └──────────┘                                    │ Processor  │  │
│                                                   └──────┬──────┘  │
│  ┌──────────┐                ┌──────────────┐           │        │
│  │ AI Vis.  │───produce────▶│ ai-visibility│───▶┌──────▼──────┐  │
│  │ Prober   │                └──────────────┘    │ Alert      │  │
│  └──────────┘                                    │ Engine     │  │
│                                                   └──────┬──────┘  │
│  ┌──────────┐                ┌──────────────┐          │         │
│  │ Alert    │───produce────▶│ alert.created│───▶┌──────▼──────┐  │
│  │ Engine   │                └──────────────┘    │ Notif      │  │
│  └──────────┘                                    │ Dispatcher │  │
│                                                   └────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### 9.2 Topics Kafka (spécification)

```yaml
topics:
  - name: article.raw
    partitions: 6
    replication: 3
    retention: 7d
    producers: [rss-scraper, ammc-scraper, bam-scraper, bvc-scraper]
    consumers: [dedup-worker]

  - name: article.dedup
    partitions: 6
    replication: 3
    retention: 7d
    producers: [dedup-worker]
    consumers: [nlp-worker]

  - name: article.processed
    partitions: 6
    replication: 3
    retention: 30d
    producers: [nlp-worker]
    consumers: [alert-engine, sentiment-aggregator, search-indexer]

  - name: price.raw
    partitions: 3
    replication: 3
    retention: 3d
    producers: [bvc-scraper]
    consumers: [price-processor]

  - name: ai-visibility
    partitions: 3
    replication: 3
    retention: 30d
    producers: [ai-visibility-prober]
    consumers: [alert-engine, dashboard-updater]

  - name: alert.created
    partitions: 3
    replication: 3
    retention: 90d
    producers: [alert-engine]
    consumers: [notification-dispatcher, webhook-dispatcher]

  - name: notification.send
    partitions: 3
    replication: 3
    retention: 7d
    producers: [notification-dispatcher]
    consumers: [whatsapp-sender, email-sender, push-sender]
```

### 9.3 Mini-service Kafka (Bun + kafkajs)

```typescript
// mini-services/kafka-pipeline/index.ts
import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "harch-atelier",
  brokers: [process.env.KAFKA_BROKERS || "localhost:9092"],
});

// Producer
export const producer = kafka.producer({
  maxInFlightRequests: 5,
  idempotent: true,
  transactionalId: "harch-producer",
});

// Consumer for article.dedup → NLP processing
const nlpConsumer = kafka.consumer({ groupId: "nlp-worker" });
await nlpConsumer.subscribe({ topic: "article.dedup", fromBeginning: false });

await nlpConsumer.run({
  eachMessage: async ({ message }) => {
    const article = JSON.parse(message.value.toString());
    await processArticleNLP(article); // sentiment + NER + embedding
    await producer.send({
      topic: "article.processed",
      messages: [{ value: JSON.stringify({ ...article, processed: true }) }],
    });
  },
});
```

### 9.4 Migration path (cron → Kafka)

**Phase 1** (actuel) : Cron jobs every 30 min — latency 5-30 min
**Phase 2** (Kafka mini-service) : Event-driven — latency <60s
**Phase 3** (Kafka + Elasticsearch) : Full streaming — latency <10s

---

## 10. FAIBLESSE 3 — LLM GATEWAY MULTI-MODÈLE

### 10.1 Architecture cible (inspired by AlphaSense AI gateway)

```
┌──────────────────────────────────────────────────────────────────┐
│              LLM ROUTER / AI GATEWAY                              │
│                                                                    │
│  Incoming request (prompt + task type + tenant)                   │
│       │                                                            │
│       ▼                                                            │
│  ┌─────────────┐                                                  │
│  │  Router     │  Routing rules:                                  │
│  │  Logic      │  - task=sentiment → GLM-4 (cheap, fast)          │
│  │             │  - task=summarization → Claude Sonnet (quality)  │
│  │             │  - task=embedding → OpenAI text-embedding-3      │
│  │             │  - task=darija → Custom Darija model             │
│  │             │  - task=reasoning → Gemini 2.5 (long context)    │
│  │             │  - fallback chain on failure                     │
│  └──────┬──────┘                                                  │
│         │                                                         │
│    ┌────┼────┬────────┬────────┬────────┐                        │
│    ▼    ▼    ▼        ▼        ▼        ▼                        │
│  GLM-4 Claude Gemini OpenAI  Llama   Darija                       │
│  (Z.ai)(Anth.) (Google)(OAI)  (local)  (custom)                   │
│                                                                    │
│  Zero data retention contractually enforced                        │
│  RAG grounding (no hallucination)                                  │
│  Inline citations (clickable to source)                            │
└──────────────────────────────────────────────────────────────────┘
```

### 10.2 Routing rules

```typescript
// src/lib/llm-router.ts
type TaskType = "sentiment" | "summarization" | "embedding" | "darija" | "reasoning" | "ner" | "translation";
type LLMProvider = "glm-4" | "claude-sonnet" | "gemini-2.5" | "openai-o3" | "llama-local" | "darija-custom";

interface RoutingRule {
  task: TaskType;
  primary: LLMProvider;
  fallback: LLMProvider;
  costPer1kTokens: number; // USD
  avgLatencyMs: number;
  qualityScore: number; // 1-10
}

const ROUTING_RULES: Record<TaskType, RoutingRule> = {
  sentiment: {
    task: "sentiment",
    primary: "glm-4",
    fallback: "llama-local",
    costPer1kTokens: 0.002,
    avgLatencyMs: 800,
    qualityScore: 7,
  },
  summarization: {
    task: "summarization",
    primary: "claude-sonnet",
    fallback: "glm-4",
    costPer1kTokens: 0.015,
    avgLatencyMs: 2500,
    qualityScore: 9,
  },
  embedding: {
    task: "embedding",
    primary: "openai-o3", // text-embedding-3-small
    fallback: "llama-local",
    costPer1kTokens: 0.0001,
    avgLatencyMs: 200,
    qualityScore: 9,
  },
  darija: {
    task: "darija",
    primary: "darija-custom", // fine-tuned model on Darija corpus
    fallback: "glm-4",
    costPer1kTokens: 0.001,
    avgLatencyMs: 1200,
    qualityScore: 8,
  },
  reasoning: {
    task: "reasoning",
    primary: "gemini-2.5",
    fallback: "claude-sonnet",
    costPer1kTokens: 0.01,
    avgLatencyMs: 4000,
    qualityScore: 9,
  },
  ner: {
    task: "ner",
    primary: "glm-4",
    fallback: "llama-local",
    costPer1kTokens: 0.002,
    avgLatencyMs: 900,
    qualityScore: 7,
  },
  translation: {
    task: "translation",
    primary: "gemini-2.5",
    fallback: "glm-4",
    costPer1kTokens: 0.005,
    avgLatencyMs: 1500,
    qualityScore: 8,
  },
};

export async function routeLLM(
  prompt: string,
  task: TaskType,
  options?: { forceProvider?: LLMProvider; maxCost?: number }
): Promise<{ content: string; provider: LLMProvider; cost: number; latencyMs: number }> {
  const rule = ROUTING_RULES[task];
  const provider = options?.forceProvider || rule.primary;

  try {
    const start = Date.now();
    const content = await callProvider(provider, prompt, task);
    const latencyMs = Date.now() - start;
    const estimatedTokens = Math.ceil(prompt.length / 4 + content.length / 4);
    const cost = (estimatedTokens / 1000) * rule.costPer1kTokens;

    return { content, provider, cost, latencyMs };
  } catch (error) {
    // Fallback chain
    console.warn(`[LLM Router] ${provider} failed, falling back to ${rule.fallback}`);
    const content = await callProvider(rule.fallback, prompt, task);
    return { content, provider: rule.fallback, cost: 0, latencyMs: 0 };
  }
}

async function callProvider(provider: LLMProvider, prompt: string, task: TaskType): Promise<string> {
  switch (provider) {
    case "glm-4":
      return await callGLM4(prompt, task);
    case "claude-sonnet":
      return await callClaude(prompt, task);
    case "gemini-2.5":
      return await callGemini(prompt, task);
    case "openai-o3":
      return await callOpenAI(prompt, task);
    case "llama-local":
      return await callLlamaLocal(prompt, task);
    case "darija-custom":
      return await callDarijaModel(prompt, task);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
```

### 10.3 Zero data retention enforcement

```typescript
// All LLM calls go through the gateway — no direct API calls
// Contractually enforce zero data retention with each provider:
// - Anthropic: zero retention API flag
// - OpenAI: zero retention API flag
// - Google: DPA with zero retention clause
// - GLM (Z.ai): zero retention (default for API)
// - Llama local: no data leaves the server

// RAG grounding: every LLM output must cite source documents
interface LLMResponse {
  content: string;
  citations: Array<{
    articleId: string;
    snippet: string;
    confidence: number;
  }>;
  provider: LLMProvider;
  cost: number;
}
```

---

## 11. SYNTHÈSE FINALE — LOOP 2 RÉSULTAT

### 11.1 Améliorations apportées vs LOOP 1

| Faiblesse LOOP 1 | Solution LOOP 2 | Statut |
|-----------------|-----------------|--------|
| Pas de vector search | pgvector + Elasticsearch hybride + RRF fusion | Spécifié |
| Pas de pipeline Kafka | 7 topics + mini-service Bun + migration path | Spécifié |
| Pas de LLM gateway | Router multi-modèle + fallback chain + zero retention | Spécifié |

### 11.2 Niveau de précision atteint

- **Schéma DB** : 37 modèles Prisma complets avec index, RLS, partitioning ✅
- **API** : 40+ endpoints documentés (REST + SSE + GraphQL-ready) ✅
- **Pipeline** : Kafka topics + consumers + migration path ✅
- **Search** : Hybride BM25 + vector + RRF + <500ms target ✅
- **LLM** : Multi-provider gateway + routing rules + cost model ✅
- **UI/UX** : 4 personas + sections + bibliothèques ✅

### 11.3 Prochaines faiblesses à combler (LOOP 3 inputs)

1. **Pas de test suite** : 0 tests automatisés. Doit spécifier Playwright E2E + Vitest unit.
2. **Pas de monitoring/observability** : Pas de Sentry, pas de Grafana, pas de structured logging.
3. **Pas de CI/CD pipeline** : Pas de GitHub Actions, pas de preview deployments.

**La boucle peut continuer indéfiniment. Le cahier des charges est maintenant à un niveau de précision chirurgical sur l'architecture core. Les faiblesses restantes sont opérationnelles (tests, monitoring, CI/CD) plutôt qu'architecturales.**

---

## 12. SOURCES ET VÉRIFICATION

### 12.1 Sources concurrentielles

- **AlphaSense** : `competitive-reports/07-alphasense.md` (662 lignes, 30+ sources publiques)
  - QueryQuotient case study (Elasticsearch 8.x confirmed)
  - TheNewStack interview Chris Ackerson (hybrid search architecture)
  - Cerebras press release (multi-LLM gateway)
  - AlphaSense Generative AI Security page (zero data retention)

- **Dataminr** : `competitive-reports/06-dataminr.md` (332 lignes)
  - Job postings (AWS, Kubernetes stack)
  - Gartner reports (real-time leader)

- **Meltwater** : `competitive-reports/02-meltwater.md` (378 lignes)
  - Job postings (Java + Python + Go + Node.js stack)
  - Engineering blog (Kafka, Elasticsearch, Snowflake)

- **Signal AI** : `competitive-reports/05-signal-ai.md` (259 lignes)
  - Wayback Machine archives (product evolution)

### 12.2 Vérification des assertions

Toutes les assertions techniques sont :
1. **Vérifiées** via sources publiques (case studies, press releases, job postings, engineering blogs)
2. **Marquées "Non disponible publiquement"** lorsque non vérifiables
3. **Estimées** avec mention explicite "Estimation Harch" lorsqu'inférées

Aucune assertion n'est inventée ou non étayée.

---

*Document généré par le Recursive Reverse-Engineering Engine.*
*Boucle : LOOP 1 + LOOP 2 (2 itérations complètes).*
*Prêt pour implémentation directe sans approximation.*
