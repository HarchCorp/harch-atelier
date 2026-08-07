# 🌐 HARCH ATELIER — Account Ecosystem Knowledge Graph (Obsidian-style)

> Each `[[node]]` is bidirectionally linked. Follow the links to traverse the graph infinitely.
> Format: **Who** → **Why** → **What they get** → **Where from** → **Links to**

---

## 📐 THE 2 AXES

Every user in HarchIQ has TWO attributes that determine their experience:

1. **`role`** — their permission level (RBAC hierarchy, 10 roles)
2. **`accountType`** — their dashboard variant (4 console types + admin)

A user can be `role: company-admin` + `accountType: brand-monitor` → they get the Brand Monitor dashboard with company-admin permissions.

---

## 🔑 ROLE NODES (Permission Hierarchy)

### [[super_admin]] — Level 100 (Divin)
- **Who**: The platform owner (Amine Harchelkorane). Activated via [[Master Code]].
- **Why**: Absolute control over every entity, user, company, agency, billing, audit.
- **What they get**: ALL 23 permissions including `master:code`, `admin:super`, `users:delete`, `billing:write`.
- **Where from**: `POST /api/auth/activate-master` with code `HARCH-XXXXX-XXXXX-XXXXX`.
- **Console access**: ALL dashboards ([[brand-monitor]], [[market-competitor]], [[investment-bank]], [[harch-alpha]], [[enterprise-admin]]).
- **Admin access**: ✅ Full admin dashboard (7 tabs: Requests, Accounts, Permissions, Security, Logs, Audit, WhatsApp).
- **Special**: Can generate [[Master Codes]] for other super_admins. Actions logged in [[SuperAdmin Audit Trail]].
- **Links**: → [[admin]], [[Master Code]], [[SuperAdmin Audit Trail]], [[RBAC Matrix]]

### [[admin]] — Level 50 (Système)
- **Who**: Harch internal team members (operations, support, onboarding).
- **Why**: Manage users, process access requests, create accounts, monitor system health.
- **What they get**: 18 permissions (everything except `master:code`, `admin:super`, `users:delete`, `billing:write`).
- **Where from**: Created by [[super_admin]] via admin dashboard → Accounts tab → Create Account.
- **Console access**: ALL dashboards.
- **Admin access**: ✅ Full admin dashboard.
- **Cannot**: Delete users, change billing, generate master codes.
- **Links**: → [[super_admin]], [[company-admin]], [[Admin Dashboard]], [[Access Requests]]

### [[agency-admin]] — Level 40 (B2B2B Partner)
- **Who**: PR/communications agencies (Omocto, PRESMA, etc.) that resell HarchIQ to their clients.
- **Why**: White-label the platform, import WhatsApp conversations, create sub-client workspaces, manage branding.
- **What they get**: 14 permissions including `agency:admin`, `agency:write`, `users:write`, `reports:*`, `alerts:*`.
- **Where from**: Created by [[admin]] or [[super_admin]]. Linked to an [[Agency]] record.
- **Console access**: [[brand-monitor]] + [[Agency Dashboard]].
- **Agency Dashboard**: Shows sub-clients, branding config, quota usage, commission (30% revenue share).
- **Key feature**: [[WhatsApp Import]] — paste a conversation → GLM-4 extracts company data → create sub-client in 1 click.
- **White-label**: Custom logo, colors, login title, subdomain (`iq.attijari.harchcorp.com`).
- **Links**: → [[Agency]], [[AgencyClient]], [[WhatsApp Import]], [[White-label Branding]], [[Quota System]], [[company-admin]]

### [[company-admin]] — Level 30 (Dircom/CTO Client)
- **Who**: The Dircom (Director of Communication), CTO, or Head of PR at a client company (OCP, Attijariwafa, etc.).
- **Why**: Monitor their company's reputation, manage their team, escalate crises, export reports.
- **What they get**: 11 permissions including `console:write`, `users:write`, `reports:export`, `alerts:escalate`, `billing:read`.
- **Where from**: Created by [[admin]] via invitation system, or by [[agency-admin]] via WhatsApp Import.
- **Console access**: Their `accountType` dashboard (usually [[brand-monitor]]).
- **Team management**: Can invite [[manager]], [[analyst]], [[viewer]] users to their company.
- **Billing**: Can view their plan ([[emergence]], [[corporate]], [[sovereign]]) but not change it.
- **Links**: → [[manager]], [[analyst]], [[viewer]], [[brand-monitor]], [[Invitation System]], [[Crisis Escalation]]

### [[manager]] — Level 20 (Team Lead)
- **Who**: Team leads at the client company (PR manager, Comms team lead).
- **Why**: Monitor alerts, generate reports, escalate crises to Comex.
- **What they get**: 7 permissions: `console:read`, `console:write`, `reports:*`, `alerts:*` (including escalate).
- **Where from**: Invited by [[company-admin]] via [[Invitation System]].
- **Console access**: Their company's dashboard.
- **Cannot**: Manage users, view billing, access admin panel.
- **Links**: → [[company-admin]], [[analyst]], [[Crisis Escalation]], [[Reports]]

### [[analyst]] — Level 10 (Operational)
- **Who**: PR analysts, social media monitors, research assistants.
- **Why**: Day-to-day monitoring — read alerts, analyze sentiment, write reports.
- **What they get**: 5 permissions: `console:read`, `console:write`, `reports:read`, `reports:write`, `alerts:read`.
- **Where from**: Invited by [[company-admin]] or [[manager]].
- **Console access**: Their company's dashboard (read + write on reports/alerts).
- **Cannot**: Escalate crises, manage users, export reports, view billing.
- **Links**: → [[manager]], [[viewer]], [[Crisis Alert Feed]], [[Sentiment Analysis]]

### [[viewer]] — Level 0 (Read-Only)
- **Who**: Board members, executives who need visibility without action capability.
- **Why**: View dashboards, read reports, monitor reputation score — no actions.
- **What they get**: 3 permissions: `console:read`, `reports:read`, `alerts:read`.
- **Where from**: Invited by [[company-admin]].
- **Console access**: Their company's dashboard (read-only).
- **Cannot**: Write anything, escalate, export, manage users.
- **Links**: → [[company-admin]], [[Brand Health Command Center]]

### [[legacy_user_v1]] — Level 0 (Historical)
- **Who**: Users from the original v1 platform (pre-RBAC). Kept for DB integrity.
- **Why**: Historical audit trail. Cannot escalate or access new features.
- **What they get**: 2 permissions: `console:read`, `reports:read` (same as viewer).
- **Where from**: Migration from v1 database. No new legacy users created.
- **Links**: → [[viewer]]

### [[legacy_trial]] — Level 0 (Historical Trial)
- **Who**: Old trial accounts from the beta period.
- **What they get**: 2 permissions: `console:read`, `reports:read`.
- **Links**: → [[viewer]], [[legacy_beta]]

### [[legacy_beta]] — Level 0 (Historical Beta)
- **Who**: Beta testers from the early development phase.
- **What they get**: 3 permissions: `console:read`, `reports:read`, `alerts:read`.
- **Links**: → [[viewer]], [[legacy_trial]]

---

## 🖥️ ACCOUNT TYPE NODES (Dashboard Variants)

### [[brand-monitor]] — Reputation Intelligence
- **Who uses it**: Dircoms, PR teams, communications agencies.
- **Why**: Monitor brand reputation, sentiment, crisis signals, AI visibility.
- **What they get** (22 widgets):
  - [[Brand Health Command Center]] — score, crisis level, trend, mentions 24h
  - [[Crisis Alert Feed]] — real-time negative alerts with severity
  - [[Crisis Indicator]] — 0-100 crisis score with 5 factors
  - [[Crisis Timeline]] — sentiment curve over time
  - [[Crisis Workflow Engine]] — alert status management + escalation
  - [[Insight Panel]] — LLM-generated persona-driven insights (15-min cache)
  - [[Share of Voice Panel]] — competitive mention share
  - [[Exposure Trend Chart]] — mention volume over time
  - [[Source Distribution]] — which media sources mention you
  - [[Influencer Impact Panel]] — top influencers by reach + sentiment
  - [[Competitor Radar Chart]] — 7-dimension risk comparison
  - [[AI Visibility Dashboard]] — what ChatGPT/Claude/Gemini say about you
  - [[Linguistic Matrix Panel]] — 35/35/20/10 language matrix + GRI
  - [[Darija Analyzer]] — Moroccan Arabic sentiment analysis
  - [[Geo Heatmap]] — geographic distribution of mentions
  - [[WhatsApp Digest Preview]] — daily WhatsApp alert preview
  - [[Regulatory Feed]] — AMMC/BAM regulatory filings
  - [[Alert Configuration Panel]] — custom alert thresholds
  - [[Export Panel]] — CSV streaming export (O(1) RAM)
  - [[Compliance Report]] — Loi 09-08 / CNDP compliance
  - [[Compliance Roadmap]] — SOC 2 / ISO 27001 progress
  - [[Briefing Archive]] — historical daily briefings
- **Where from**: Default account type. `/atelier/console/brand-monitor`.
- **Demo account**: `demo-brand@harch.atelier` / `demo` (Salma Bennani).
- **Links**: → [[company-admin]], [[Crisis Alert Feed]], [[AI Visibility]], [[Linguistic Matrix]], [[emergence]]

### [[market-competitor]] — Competitive Intelligence
- **Who uses it**: Strategy teams, competitive intelligence analysts.
- **Why**: Track competitors, compare reputation scores, identify vulnerabilities.
- **What they get**: Similar to brand-monitor but with competitor-focused widgets:
  - Competitor radar (7 dimensions: reputation, sentiment, risk, ESG, crisis, media, AI)
  - Share of voice comparison
  - Competitor narrative tracking
  - Vulnerability detection (rival weakness signals)
- **Where from**: `/atelier/console/market-competitor`. Currently on [[Standby Banner]] (coming soon).
- **Demo account**: `demo-compet@harch.atelier` / `demo` (Mehdi Berrada).
- **Links**: → [[brand-monitor]], [[Competitor Radar]], [[Standby Banner]]

### [[investment-bank]] — Investor Intelligence
- **Who uses it**: Investment bankers, private equity, venture capital analysts.
- **Why**: Due diligence, risk screening, portfolio monitoring, ESG assessment.
- **What they get**: Investor-focused widgets:
  - [[Entity Network]] — company relationship graph
  - [[Bayesian Risk Network]] — 20-node probabilistic risk model
  - [[Dossier Generator]] — automated due diligence dossiers
  - [[Portfolio Manager]] — multi-company portfolio tracking
  - [[Sanctions Screening]] — OFAC/EU/UN sanctions check
  - [[Asset Prices]] — BVC stock prices (Yahoo GDR + manual CSV)
  - [[Asset Sentiment]] — price vs sentiment correlation
- **Where from**: `/atelier/console/investment-bank`. Currently on [[Standby Banner]].
- **Demo account**: `demo-invest@harch.atelier` / `demo` (Hind Cherkaoui).
- **Links**: → [[Bayesian Risk]], [[Dossier]], [[Sanctions]], [[Portfolio]]

### [[harch-alpha]] — Trader Desk
- **Who uses it**: Traders, hedge fund analysts, quantitative researchers.
- **Why**: Sentiment-price divergence detection, correlation analysis, trade signals.
- **What they get**: Trader-focused widgets:
  - [[Alpha Desk Dashboard]] — real-time asset prices + sentiment overlay
  - [[Price Stream]] — live BVC/Yahoo prices (WebSocket)
  - [[Correlation Matrix]] — Pearson correlation sentiment vs price
  - [[Momentum Signals]] — LONG/SHORT bias detection
  - [[Historical Precedent]] — pattern matching
- **Where from**: `/atelier/console/harch-alpha`. Currently on [[Standby Banner]].
- **Demo account**: `demo-trader@harch.atelier` / `demo` (Youssef Alaoui).
- **Links**: → [[Alpha Desk]], [[Price Stream]], [[Correlation]]

### [[enterprise-admin]] — Enterprise Admin Panel
- **Who uses it**: Enterprise IT admins, security officers.
- **Why**: Manage team members, SSO, audit logs, compliance settings.
- **What they get**: Enterprise admin widgets:
  - Team management (invite, suspend, revoke)
  - API key management
  - Webhook configuration
  - Compliance settings (data retention, GDPR/CNDP)
- **Where from**: `/atelier/console/enterprise-admin`.
- **Links**: → [[company-admin]], [[API Keys]], [[Webhooks]], [[Compliance]]

---

## 💰 PLAN TIER NODES (Pricing)

### [[emergence]] — 15,000 MAD/month
- **Who**: SMEs, startups, first-time reputation monitoring clients.
- **What**: 10K API requests, 100 WhatsApp alerts, 50 keywords, 30 sources, 5 users.
- **Links**: → [[corporate]], [[brand-monitor]], [[Quota System]]

### [[corporate]] — 40,000 MAD/month
- **Who**: Mid-market companies, multi-subsidiary groups.
- **What**: 50K API requests, 500 WhatsApp alerts, 200 keywords, 80 sources, 15 users.
- **Links**: → [[emergence]], [[sovereign]], [[brand-monitor]], [[market-competitor]]

### [[sovereign]] — 75,000 MAD/month
- **Who**: Large enterprises, institutions, government-linked entities.
- **What**: 250K API requests, 2K WhatsApp alerts, 1K keywords, 250 sources, 50 users.
- **Links**: → [[corporate]], [[investment-bank]], [[enterprise-admin]]

### [[custom]] — Custom pricing
- **Who**: Special cases (government, multi-country, custom AI engines).
- **Links**: → [[super_admin]], [[sovereign]]

---

## 🏢 ENTITY NODES (Business Structure)

### [[Agency]] — B2B2B Partner
- **Who**: PR/comms agencies (Omocto, PRESMA, etc.).
- **What**: White-label reseller. Gets 30% commission. Creates [[AgencyClient]] sub-clients.
- **Fields**: name, slug, commissionPct, primaryColor, logoUrl, contactEmail.
- **Links**: → [[agency-admin]], [[AgencyClient]], [[White-label Branding]], [[WhatsApp Import]]

### [[AgencyClient]] — Sub-Client
- **Who**: The agency's client (OCP, Attijariwafa, etc.).
- **What**: A company monitored under an agency's white-label. Has its own [[Quota]].
- **Fields**: displayName, subdomain, customDomain, status, branding.
- **Links**: → [[Agency]], [[Company]], [[Quota System]], [[White-label Branding]]

### [[Company]] — Tracked Entity
- **Who**: Any Moroccan/African company being monitored (OCP, Attijariwafa, BOA, IAM, RAM).
- **What**: Has articles, sentiment scores, risk assessments, reputation scores, AI visibility.
- **Fields**: name, slug, aliases[], domain, sector, ticker, foundedYear, headquarters, isDemo.
- **Links**: → [[AgencyClient]], [[Article]], [[ReputationScore]], [[RiskAssessment]], [[AIVisibility]]

### [[User]] — Platform User
- **Who**: Anyone who logs in (admin, dircom, analyst, agency admin, etc.).
- **Fields**: email, name, role, accountType, companyId, status, sessionVersion, onboardingCompleted.
- **Links**: → [[role nodes]], [[accountType nodes]], [[Invitation System]], [[Session Revocation]]

---

## 🔐 SECURITY NODES

### [[Master Code]]
- **Format**: `HARCH-XXXXX-XXXXX-XXXXX` (SHA-256 + salt, timingSafeEqual).
- **Who generates**: [[super_admin]] via `scripts/generate-master-code.ts`.
- **Who uses**: New super_admin candidates via `POST /api/auth/activate-master`.
- **TTL**: 24 hours. Single-use. Anti-brute-force: 5/IP/10min.
- **Links**: → [[super_admin]], [[SuperAdmin Audit Trail]]

### [[Session Revocation]]
- **How**: `sessionVersion` field on [[User]]. Admin bumps it → JWT callback detects mismatch → token killed.
- **Route**: `POST /api/admin/revoke-session { userId }`.
- **Links**: → [[super_admin]], [[admin]], [[JWT]], [[Security Tab]]

### [[SuperAdmin Audit Trail]]
- **What**: Tamper-evident hash chain (SHA-256). Every super_admin action is logged.
- **Verification**: [[Sentinel]] cron runs `verifyAuditChain()` every hour.
- **DEFCON 1**: If chain broken → `SystemFlag.defcon_level = 1` → UI goes crimson.
- **Links**: → [[super_admin]], [[Sentinel]], [[Audit Watchdog]], [[DEFCON]]

### [[ZKP Auth]]
- **What**: Zero-Knowledge Proof authentication (SRP-like challenge-response).
- **How**: PBKDF2(password, salt, 150K) → ECDSA P-256 keypair. Server stores ONLY public key.
- **NEMESIS verified**: 2/3 PASS, 0 FRAUD. Password NEVER touches the network.
- **Links**: → [[User]], [[Login]], [[NEMESIS]], [[Web Crypto API]]

### [[Invitation System]]
- **Flow**: Admin creates invitation → sends `/atelier/invite/{token}` link → user sets own password.
- **Token**: TTL 7 days, single-use, rate-limited (5/IP/10min).
- **Routes**: `POST /api/auth/accept-invite`, `GET /api/auth/invite-info`.
- **Links**: → [[company-admin]], [[agency-admin]], [[User]], [[Admin Dashboard]]

---

## 🤖 AI & ANALYTICS NODES

### [[CoreAnalyticsEngine]]
- **What**: Unified facade for sentiment analysis. Strategy pattern: `{ engine: 'lexicon' | 'glm' }`.
- **Lexicon**: Instant, local, 746-line Darija/French/Arabic lexicon. O(1) CPU.
- **GLM**: Deep LLM analysis via z-ai-web-dev-sdk. Cached 24h in DB.
- **Links**: → [[Sentiment Analysis]], [[GLM-4]], [[Darija NLP]], [[Insight Panel]]

### [[GLM-4]] — z-ai-web-dev-sdk
- **What**: The LLM that powers insights, WhatsApp import, sentiment analysis, dossier generation.
- **Cache**: `GLMAnalysis` table (SHA-256 hash of prompt + input, 24h TTL).
- **Rate limit**: Token-bucket (10 tokens, 2/sec refill, 3 retries with backoff).
- **Links**: → [[CoreAnalyticsEngine]], [[Insight Panel]], [[WhatsApp Import]], [[Dossier]]

### [[Polymorphic UI Engine]]
- **What**: Interface adapts to user behavior (click velocity, scroll, dwell time).
- **5 archetypes**: beginner, standard, power, skimmer, reader + bot detection.
- **8 dynamic tokens**: density, baseFontSize, animationSpeed, backgroundWarmth, contrast, etc.
- **NEMESIS verified**: 3/3 PASS. 10 mathematical guardrails (clamp, dedup, bot detection).
- **Links**: → [[Auto-Healing DOM]], [[NEMESIS]], [[Behavior Tracker]]

### [[Auto-Healing DOM]]
- **What**: Error boundary that catches render crashes and auto-retries 3×.
- **Retry**: LOCAL (setState only, not network-dependent). NEMESIS verified.
- **Links**: → [[Polymorphic UI Engine]], [[NEMESIS]], [[DashboardErrorBoundary]]

### [[NEMESIS]]
- **What**: Adversarial QA protocol. Injects impossible signals to prove code is real.
- **Tests**: Synthetic velocity (10k clicks), network cut + crash, context inversion (NaN/-50).
- **ZKP MITM**: Intercepts network payloads, scans for password/hash → FRAUD_DETECTED if found.
- **Links**: → [[Polymorphic UI Engine]], [[Auto-Healing DOM]], [[ZKP Auth]]

---

## 📊 DATA PIPELINE NODES

### [[RSS Scraper]]
- **Sources**: 20 Moroccan feeds (TelQuel, Medias24, Hespress, Le360, etc.) + Google News proxies.
- **Schedule**: Vercel Cron every 30 minutes (`/api/cron/scrape-rss`).
- **Dedup**: SHA-256 URL hash. Idempotent upsert.
- **Links**: → [[Article]], [[Company]], [[NLP Worker]]

### [[NLP Worker]]
- **What**: BullMQ worker that processes unanalyzed articles through [[GLM-4]].
- **Steps**: summarize → sentiment → NER → topics → risks → AI visibility → narratives.
- **Cache**: Every step goes through `cachedGLMCall()` (24h DB cache).
- **Links**: → [[CoreAnalyticsEngine]], [[GLM-4]], [[Article]], [[Entity]]

### [[Crisis Detector]]
- **What**: Pure function (no DB). Score 0-100 from 5 weighted factors.
- **Factors**: velocity (25%), sentiment drop (20%), source spread (20%), severity (20%), keywords (15%).
- **46 keywords**: bilingual EN+FR (scandal, fraude, blanchiment, boycott, démission…).
- **Links**: → [[Crisis Indicator]], [[Crisis Alert Feed]], [[CoreAnalyticsEngine]]

### [[Bayesian Risk Network]]
- **What**: 20-node DAG (geopolitical, sanctions, currency, liquidity, cyber, regulatory…).
- **Propagation**: Parent→child topological. Priors calibrated (0.08-0.35).
- **Anomaly detection**: ARIMA-like rolling mean + z-score (threshold 2.5).
- **Links**: → [[investment-bank]], [[Threat Scoring]], [[Dossier]]

### [[CSV Streaming Export]]
- **What**: ReadableStream + cursor pagination. O(1) RAM regardless of export size.
- **Capacity**: 250K rows in ~50MB. maxDuration 300s (Vercel Enterprise).
- **Links**: → [[Export Panel]], [[Article]], [[Backpressure]]

---

## 🌍 INTERNATIONALIZATION NODES

### [[i18n FR/EN]]
- **What**: next-intl middleware + NextIntlClientProvider + messages en.json/fr.json.
- **How**: Button FR → `/fr/atelier/pricing` → cookie `NEXT_LOCALE=fr` → messages FR loaded.
- **Private routes**: Console, admin, agency = English-only (bypass i18n).
- **Links**: → [[LanguageSwitcher]], [[AtelierNav]], [[middleware]]

### [[Darija NLP]]
- **What**: 854-line lexicon+rules detector. 3 stages: detectLanguage, analyzeSentiment, extractEntities.
- **100+ markers**: واش, شحال, بغيت, دابا (Darija), 3=ع, 7=ح, 9=ق (Arabizi).
- **Confidence**: 1 marker→0.70, 2→0.85, 3+→0.95.
- **Links**: → [[CoreAnalyticsEngine]], [[Linguistic Matrix Panel]], [[Crisis Detector]]

---

## 🔄 INFINITE EXPANSION GRAPH

Each completed node opens 3 new child nodes:

```
[[super_admin]] ──┬── [[Master Code Generator UI]] (N35,85,70) ⏳
                  ├── [[Role Escalation Audit]] (N36,85,60) ⏳
                  └── [[Emergency Lockdown Protocol]] (N37,90,50) ⏳

[[agency-admin]] ──┬── [[Commission Dashboard]] (N41,45,50) ⏳
                   ├── [[Bulk Sub-Client Import]] (N42,45,40) ⏳
                   └── [[Agency Performance Metrics]] (N43,45,30) ⏳

[[company-admin]] ──┬── [[Team Seat Management UI]] (N44,35,60) ⏳
                    ├── [[Custom Alert Routing]] (N45,35,50) ⏳
                    └── [[Board Report Generator]] (N46,35,40) ⏳

[[brand-monitor]] ──┬── [[Real-time Crisis WebSocket]] (N47,50,40) ⏳
                    ├── [[WhatsApp Two-Way Chat]] (N48,50,30) ⏳
                    └── [[Competitor Auto-Discovery]] (N49,50,20) ⏳

[[ZKP Auth]] ──┬── [[WebAuthn/Passkey Support]] (N50,10,50) ⏳
               ├── [[Biometric Auth]] (N51,10,30) ⏳
               └── [[Hardware Key (YubiKey)]] (N52,10,10) ⏳

[[Polymorphic UI]] ──┬── [[AI-Generated Layouts]] (N53,20,30) ⏳
                     ├── [[Voice-Controlled Interface]] (N54,20,20) ⏳
                     └── [[Eye-Tracking Adaptation]] (N55,20,10) ⏳
```

---

## 📐 3D COORDINATE SYSTEM

- **X axis** = Technical Depth (0=surface UI, 100=infrastructure core)
- **Y axis** = Business Scope (0=single user, 100=marketplace multi-tenant)
- **Z axis** = Maturity (0=idea, 50=prototyped, 100=production)

Every node above is positioned in this space. The graph is infinite — each fix reveals new nodes.
