# ATELIER PAGE AUDIT — FIX-DUPLICATES-1
**Agent:** AURA (Lead Product & UX Strategist) · **Date:** 2026-08 · **Scope:** `/src/app/atelier/**`

> **TL;DR** — 96 `page.tsx` files exist under `/src/app/atelier/`. After excluding dynamic/[id] routes, dynamic company/industry/expertise/report slugs, and tooling subpages, the atelier exposes **~57 distinct navigable surfaces** — confirming the brief's "57+ pages" intuition. The audit finds **7 duplicate groups** (lead-gen ×4, content ×2, agency dashboards ×2, trackers ×2, etc.), **6 true orphans** (zero incoming clickable links), **9 dead-end pages** (no escape route), **3 broken redirect paths** (one of them is the *regular-user* post-login destination), **5 sitemap 404s**, and **~7 384 lines of dead console code** (`ConsoleShell`, `Dashboard`, `AgencyConsole`). The most urgent finding: **`/atelier/audit`'s 3-step wizard collects company/contact data but never POSTs it** — 33 inbound CTAs point at a form whose data is silently discarded.

---

## Section 1 — Full Page Catalog

Legend:
- **Path** — Route under `/atelier/*`.
- **Form?** — Does the page render a user-input form (lead-gen, contact, auth, settings)?
- **Form → ?** — Where the form POSTs. `NONE` = no form. `LOST` = form exists but no fetch/submit.
- **Outbound** — Number of distinct `/atelier/*` paths the page links to (excluding nav/footer chrome).
- **Incoming** — Number of source files (outside the page's own folder) that reference the path as a string literal.
- **Status** — `ACTIVE` (connected both ways) / `DUPLICATE` (same function as another) / `ORPHAN` (no incoming clickable links) / `DEAD-END` (no outbound atelier links AND no global nav) / `REDIRECT` (server-side redirect only).

### 1.1 — Home & Top-Level Marketing

| Path | Purpose | Form? | Form → ? | Outbound | Incoming | Status |
|---|---|---|---|---|---|---|
| `/atelier` | Marketing home (hero, products, pricing teaser, CTAs) | No | NONE | 5 (pricing, harch-100, flagship-report, audit, login/console) | 2 (BrandBadge, layout) | ACTIVE |
| `/atelier/pricing` | 4-plan pricing matrix (Essentiel/Pro/Enterprise/Agency) | No (CTA only) | NONE | 1 (contact) | 11 | ACTIVE |
| `/atelier/audit` | 3-step "free audit" wizard (company → sources → contact) | **YES** | **LOST — `handleSubmit` only `setSubmitted(true)`; no `fetch`. `/api/atelier/audit` exists but is never called.** | 0 | 27 | **DUPLICATE + DEAD-FORM** |
| `/atelier/contact` | Contact form (sales/support/security/press) | YES | `POST /api/access-request` | 0 | 12 | DUPLICATE (same endpoint as request-access + partners/apply) |
| `/atelier/request-access` | "Request access to HarchIQ Console" form | YES | `POST /api/access-request` | 1 (home) | 5 | DUPLICATE (same endpoint as contact + partners/apply) |
| `/atelier/retro-audit` | "Rétro-Audit de Crise" — sales weapon: select company+dates → fetch retro crisis report | YES (query) | `GET /api/console/retro-audit` (read-only) | 0 | 1 | ORPHAN + DEAD-END (no nav, no outbound, no escape) |
| `/atelier/about` | Company mission, stats, values | No | NONE | 3 (audit, changelog, method) | 4 | ACTIVE |
| `/atelier/trust` | Trust Center — security architecture, compliance shields, RBAC, incident response | No | NONE | 3 (admin-x7k2m9, contact, legal) | 5 | ACTIVE |
| `/atelier/security` | **Server-side redirect** to `/atelier/trust` | No | NONE | 0 (redirect) | 1 | REDIRECT (delete candidate) |
| `/atelier/legal` | Legal info (mentions, GDPR, Loi 09-08) | No | NONE | 1 (trust) | 3 | ACTIVE |
| `/atelier/careers` | Solo-founder disclaimer + values (no fake jobs) | No | NONE | 1 (about) | 2 | ACTIVE |
| `/atelier/changelog` | Product version history (3.1.0 etc.) | No | NONE | 0 | 2 | ACTIVE (low outbound) |
| `/atelier/faq` | 20+ Q&A across 6 categories | No | NONE | 1 (contact) | 4 | ACTIVE |
| `/atelier/glossary` | 50 terms / 6 categories — SEO long-tail | No | NONE | 0 | 1 (sitemap only) | ORPHAN |
| `/atelier/resilience` | 100 stress-cases the system handles (interactive demos) | No | NONE | 0 | 1 | ACTIVE (low inbound) |
| `/atelier/method` | 5-step pipeline + 5 scoring pillars + compliance | No | NONE | 2 (audit, pricing) | 9 | ACTIVE |
| `/atelier/customers` | "Confidential deployment" pilot framing | No | NONE | 1 (audit) | 4 | ACTIVE |
| `/atelier/partners` | Partner program (PR agencies, tech, strategic, referrals) | No | NONE | 0 | 2 | ACTIVE (low outbound) |
| `/atelier/partners/apply` | Partner registration form (PartnerRegistration.tsx) | YES | `POST /api/access-request` | 0 | 0 (only FAQ plain-text mention) | **ORPHAN + DUPLICATE** |
| `/atelier/solutions` | "4 problèmes, une plateforme" capabilities matrix | No | NONE | 2 (audit, method) | 1 (footer) | ACTIVE (low inbound) |
| `/atelier/use-cases` | 6 sector deep-dives (banking, telecom, energy, mining, agri, hospitality) | No | NONE | 2 (audit, pricing) | 0 (sitemap only) | **ORPHAN** |
| `/atelier/compare` | Side-by-side company comparison (radar/line/stacked-bar/gauge) | No | NONE | 1 (audit) | 2 | ACTIVE |
| `/atelier/decision-augmentation` | "New era of reputation-based decision making" whitepaper landing | No | NONE | 0 | 4 | ACTIVE |
| `/atelier/flagship-report` | 2026 Flagship Report — 15+ sections, 8 companies, 20 people | No | NONE | 0 | 3 | ACTIVE |
| `/atelier/media-intelligence` | 2026 Media Report — 61 218 articles analyzed | No | NONE | 1 (audit) | 4 | ACTIVE |
| `/atelier/harch-100` | Live ranking of 100 Moroccan companies by reputation score | No | NONE | 3 (audit, harch-100#method, method) | 10 | ACTIVE |
| `/atelier/news` | Live news feed (Signal-AI-style) — 30+ sources, filters | No | NONE | 2 (contact, method) | 2 | ACTIVE |
| `/atelier/blog` | Blog index (15+ articles, 7 categories) | YES (newsletter subscribe) | (subscribe — not a lead-gen form) | 0 | 3 | ACTIVE |
| `/atelier/blog/[slug]` | Individual article (dynamic) | No | NONE | 2 (audit, blog) | (via blog index) | ACTIVE |
| `/atelier/insights` | Content hub: 14 featured items (whitepapers, reports, case studies) | No | NONE | 14 (full resource list) | 2 | **DUPLICATE** (with `/atelier/resources`) |
| `/atelier/resources` | Content hub: 9 featured items (subset of insights list) | No | NONE | 9 (resource list) | 2 | **DUPLICATE** (with `/atelier/insights`) |
| `/atelier/reputation-tracker` | Reputation Tracker — Top 100 with score trends | No | NONE | 1 (audit) | 1 | DUPLICATE (with risk-tracker + harch-100) |
| `/atelier/risk-tracker` | Risk Tracker — 32 risk categories × 6 industries dashboard | No | NONE | 1 (audit) | 6 | DUPLICATE (with reputation-tracker) |
| `/atelier/registry` | Registre des Crises — 8 Moroccan crises with timeline | No | NONE | 0 | 1 (tokens.ts) | ACTIVE (low outbound) |
| `/atelier/ask-harchiq` | Conversational AI assistant (sample Q&A) | YES (question input) | (no API call — sample answers only) | 1 (audit) | 2 | ACTIVE |
| `/atelier/templates` | Template gallery (reputation-audit PDF, cold email, WhatsApp digest) | No | NONE | 0 | 2 | **DEAD-END** (no nav, no outbound) |
| `/atelier/templates/institutional-audit` | Institutional audit template preview (12-page PDF teaser) | No | NONE | 1 (pricing) | 5 | ACTIVE |
| `/atelier/api-docs` | Public REST API reference (auth, endpoints, webhooks, code samples) | No | NONE | 3 (console, console/enterprise-admin, products/api-mcp) | 1 (sitemap only) | **ORPHAN** |
| `/atelier/intelligence` | Raw forensic intelligence export tool (POST → poll Job status) | YES (company picker) | `POST /api/atelier/audit` + `GET /api/jobs/[id]/status` | 0 | 1 (constants.ts dead code) | **ORPHAN + DEAD-END** |
| `/atelier/sales` | Super-admin "nuclear button" — batch-send surgical emails to Dircoms | YES (send button) | `POST /api/sales/send-surgical` | 0 | 0 | **ORPHAN + DEAD-END** (super_admin only, no nav) |

### 1.2 — Approach (3 children, no parent page)

> `/atelier/approach` is in `sitemap.ts` but has **no `page.tsx`** — visitors hit a 404. The 3 children below are linked from `ATELIER_NAV_LINKS` "Expertise" dropdown.

| Path | Purpose | Form? | Outbound | Incoming | Status |
|---|---|---|---|---|---|
| `/atelier/approach/our-ai` | Meet HarchIQ — trainable AI for reputation intelligence | No | 1 (audit via ApproachShared) | 3 | ACTIVE |
| `/atelier/approach/our-data` | 30+ sources, 5M+ articles/day, 120+ languages | No | 2 (audit, risk-tracker) | 3 | ACTIVE |
| `/atelier/approach/our-commitment` | Security, compliance, customer success guarantees | No | 1 (trust) | 3 | ACTIVE |

### 1.3 — Expertise (5 children, no parent page)

> `/atelier/expertise` is in `sitemap.ts` but has **no `page.tsx`**. All 5 children render via the same `ExpertisePageTemplate.tsx` driven by `expertiseData.ts`.

| Path | Purpose | Outbound | Incoming | Status |
|---|---|---|---|---|
| `/atelier/expertise/enterprise-risk` | 32 risk categories × 6 industries | 0 | 2 | ACTIVE |
| `/atelier/expertise/reputation-risk` | Narrative drift, sentiment swings | 0 | 1 | ACTIVE (low inbound) |
| `/atelier/expertise/pr-comms` | 40h saved/week, board-ready PDFs | 0 | 1 | ACTIVE (low inbound) |
| `/atelier/expertise/regulation` | 12+ Moroccan regulators, 8 African jurisdictions | 0 | 1 | ACTIVE (low inbound) |
| `/atelier/expertise/esg` | 3 ESG pillars, 9 themes, greenwashing alerts | 0 | 2 | ACTIVE |

### 1.4 — Industries (6 children, no parent page)

> `/atelier/industries` is in `sitemap.ts` but has **no `page.tsx`**. All 6 children render via `IndustryPage.tsx` + `IndustryShared.tsx`.

| Path | Purpose | Outbound | Incoming | Status |
|---|---|---|---|---|
| `/atelier/industries/banking` | 8 banks, 1 842 data points, Attijariwafa leads at 84 | 0 | 2 | ACTIVE |
| `/atelier/industries/telecom` | 3 telcos, 5G rollout, Maroc Telecom leads at 79 | 0 | 2 | ACTIVE |
| `/atelier/industries/mining` | OCP + Managem, OCP leads at 91 (#1 overall) | 0 | 2 | ACTIVE |
| `/atelier/industries/aviation` | Royal Air Maroc, oneworld, score 76 | 0 | 2 | ACTIVE |
| `/atelier/industries/retail` | Marjane, Label'Vie, lowest industry avg 58 | 0 | 2 | ACTIVE |
| `/atelier/industries/energy` | Nareva, Total, Afriquia, Shell | 0 | 2 | ACTIVE |

### 1.5 — Companies (5 children, no parent page)

> `/atelier/companies` is in `sitemap.ts` but has **no `page.tsx`**. All 5 children render via `CompanyPage.tsx` + `CompanyShared.tsx`.

| Path | Purpose | Outbound | Incoming | Status |
|---|---|---|---|---|
| `/atelier/companies/ocp-group` | Score 91 · #1 · Mining leader | 0 | 2 | ACTIVE |
| `/atelier/companies/attijariwafa-bank` | Score 84 · #2 · Banking leader | 0 | 2 | ACTIVE |
| `/atelier/companies/maroc-telecom` | Score 79 · #3 · Telco leader | 0 | 2 | ACTIVE |
| `/atelier/companies/royal-air-maroc` | Score 76 · #4 · Aviation | 0 | 2 | ACTIVE |
| `/atelier/companies/bank-of-africa` | Score 72 · #6 · Pan-African | 0 | 2 | ACTIVE |

### 1.6 — Insight Reports (5 children, no parent page)

> `/atelier/insight-reports` (parent) is referenced from `constants.ts` (`NAV_STRUCTURE`) — but `NAV_STRUCTURE` is **dead code** (never imported). The parent has **no `page.tsx`**. All 5 children render via `InsightReportTemplate.tsx` driven by `reportData.ts`.

| Path | Purpose | Outbound | Incoming | Status |
|---|---|---|---|---|
| `/atelier/insight-reports/risk` | 32-category risk assessment + mitigation plan | 0 | 3 | ACTIVE |
| `/atelier/insight-reports/reputation-risk` | 5 narratives + crisis playbook | 0 | 3 | ACTIVE |
| `/atelier/insight-reports/reputation` | 24-page flagship audit | 0 | 3 | ACTIVE |
| `/atelier/insight-reports/media-impact` | Before/during/after PR campaign | 0 | 3 | ACTIVE |
| `/atelier/insight-reports/deep-dive` | Bespoke research on any topic | 0 | 3 | ACTIVE |

### 1.7 — Products (4 pages, parent + 3 children)

| Path | Purpose | Form? | Outbound | Incoming | Status |
|---|---|---|---|---|---|
| `/atelier/products` | Products hub — 4 plans "Sur devis" | No | 3 (contact, harch-100, pricing) | 4 | ACTIVE |
| `/atelier/products/api-mcp` | REST API + MCP server + webhooks + SDKs | No | 1 (audit) | 4 | ACTIVE |
| `/atelier/products/reputation-dashboards` | AI-powered dashboards, scoring, materiality matrix | No | 1 (audit) | 2 | ACTIVE |
| `/atelier/products/enterprise-risk-intelligence` | 32 risk categories, 226+ markets, real-time alerts | No | 0 | 1 | **DEAD-END** (no nav, no outbound) |
| `/atelier/products/integrations` | Slack/Teams/WhatsApp/Tableau/Claude/etc. | No | 2 (audit, products/api-mcp) | 0 (sitemap only) | **ORPHAN** |

### 1.8 — Lab (parent + 6 children)

> `/atelier/lab` (parent index) has **zero incoming links** — it is not in the nav, not in the footer, not in any CTA. It is reachable only by direct URL.

| Path | Purpose | Form? | Form → ? | Outbound | Incoming | Status |
|---|---|---|---|---|---|---|
| `/atelier/lab` | Lab index — directory of 6 experiments | No | NONE | 6 (all sub-labs) | 0 | **ORPHAN** (true) |
| `/atelier/lab/polymorphic` | Polymorphic UI engine live demo | No | NONE | 0 | 1 (lab parent) | DEAD-END (no nav, no escape) |
| `/atelier/lab/zkp` | Zero-Knowledge Proof auth demo | YES (register/login) | `POST /api/auth/zkp-{register,challenge,verify}` | 0 | 2 (lab parent + AccountSettings) | DEAD-END (no nav) |
| `/atelier/lab/linguistic-matrix` | HarchIQ NLP signature widget demo | No | NONE | 0 | 1 (lab parent) | ACTIVE (low) |
| `/atelier/lab/hespress` | Hespress comments scraper demo | YES (URL input) | `POST /api/scrape/hespress-comments` | 0 | 1 (lab parent) | ACTIVE (low) |
| `/atelier/lab/whatsapp-inbound` | WhatsApp inbound simulator (2-pane) | YES (message form) | `POST /api/whatsapp/simulate` | 0 | 1 (lab parent) | ACTIVE (low) |
| `/atelier/lab/command-center` | Public demo of premium console widgets | No | NONE | 0 | 1 (lab parent) | ACTIVE (low) |

### 1.9 — Console App (8 pages, auth-gated)

> All `/atelier/console/*` pages have `robots: { index: false }` and no `AtelierNav`/`AtelierFooter`. They render their own internal sidebar. `/atelier/console` is a smart redirector that calls `getConsolePath()` — which has **broken destinations** (see Section 5).

| Path | Purpose | Outbound | Incoming | Status |
|---|---|---|---|---|
| `/atelier/console` | Smart redirector — reads session, redirects by role/plan | (redirect only) | 18 | ACTIVE |
| `/atelier/console/essential` | Essentiel plan dashboard (11 262 lines) | 3 (settings/account, harch-100, login) | 0 (redirect dest) | ACTIVE (via /console redirect) |
| `/atelier/console/pro` | Pro plan dashboard (14 194 lines) | 2 (settings/account, login) | 0 (redirect dest) | ACTIVE (via /console redirect) |
| `/atelier/console/enterprise` | Enterprise plan dashboard (14 464 lines) | 2 (settings/account, login) | 0 (redirect dest) | ACTIVE (via /console redirect) |
| `/atelier/console/agency` | New agency dashboard (17 842 lines, P0-1 rebuild) | 3 (settings/account, harch-100, login) | 0 | **ORPHAN** (auth flow routes agency-admin → `/atelier/agency` instead) |
| `/atelier/console/enterprise-admin` | Company-admin self-service panel | 1 (console) | 2 | ACTIVE |
| `/atelier/console/settings/account` | Account settings (profile, preferences, plan) | 8 (console, console?view=*, lab/zkp) | 4 | ACTIVE |
| `/atelier/console/settings/security` | Session & device management, revoke | 0 | 2 | ACTIVE |
| `/atelier/console/settings/users` | User management (per-plan) | 1 (pricing) | 0 | ORPHAN (only direct URL) |

### 1.10 — Agency App (3 pages, auth-gated)

> Two parallel agency dashboards coexist. `getConsolePath()` routes `agency-admin` → `/atelier/agency` (legacy 1 193-line dashboard). The newer 17 842-line `/atelier/console/agency` is reachable only by direct URL.

| Path | Purpose | Form? | Form → ? | Outbound | Incoming | Status |
|---|---|---|---|---|---|---|
| `/atelier/agency` | Legacy agency dashboard (1 193 lines, Brick 8) — client cards, create sub-client, switch workspace | YES (create sub-client) | `POST /api/agency/...` | 1 (console/brand-monitor — **BROKEN**) | 3 | **DUPLICATE** (with `/atelier/console/agency`) |
| `/atelier/console/agency` | New agency dashboard (17 842 lines, P0-1) — 43 sections, GLM-4 WhatsApp import | YES (multiple) | `POST /api/agency/clients`, `/api/agency/whatsapp-import`, etc. | 3 (settings/account, harch-100, login) | 0 | DUPLICATE (with `/atelier/agency`) |
| `/atelier/agency/clients/[id]` | Sub-client detail (branding, quota, usage) | YES (per-tab) | `PATCH /api/agency/clients/[id]` | 2 (agency, **console/brand-monitor — BROKEN**) | (via agency dashboard) | ACTIVE (dynamic) |

### 1.11 — Admin App (2 pages, admin-gated)

| Path | Purpose | Form? | Outbound | Incoming | Status |
|---|---|---|---|---|---|
| `/atelier/admin-x7k2m9` | Admin login page (obfuscated URL) | YES (credentials) | 1 (admin) | 6 | ACTIVE |
| `/atelier/admin` | Admin portal — 35 sections (requests, KPIs, commercials, employees, provisioning, etc.) | YES (multiple) | 3 (console, settings/security, super-admin/audit-logs) | 6 | ACTIVE |

### 1.12 — Auth & System (5 pages)

| Path | Purpose | Form? | Form → ? | Outbound | Incoming | Status |
|---|---|---|---|---|---|---|
| `/atelier/login` | Sign-in (credentials + demo accounts) | YES | `signIn("credentials")` → `/atelier/console` | 2 (contact, request-access) | 15 | ACTIVE |
| `/atelier/onboarding` | **Server-side redirect** — calls `getConsolePath()` (which has broken destination for regular users) | No | NONE (redirect) | 0 | 7 | REDIRECT (broken for regular users) |
| `/atelier/access` | Token-based invitation activation | YES (set password) | `GET /api/access?token=` + `POST /api/access?token=` | 4 (request-access fallback) | 2 | ACTIVE |
| `/atelier/invite/[token]` | Invitation acceptance (set password, burn token) | YES (set password) | `POST /api/auth/accept-invite` | 1 (login) | 0 (email only) | ACTIVE (email-routed) |
| `/atelier/dashboard` | **Server-side redirect** to `/atelier/console` (legacy compat) | No | NONE (redirect) | 0 | 0 (only robots.ts disallow) | REDIRECT (delete candidate) |
| `/atelier/health` | System health dashboard (real-time) | No | NONE | 0 | 0 (only robots.ts disallow) | **ORPHAN** |
| `/atelier/super-admin/audit-logs` | Super-admin audit log hash-chain watchdog (DEFCON 1 visualizer) | No | NONE | 0 | 1 (AdminDashboard) | ACTIVE (low) |

---

## Section 2 — Duplicate Groups

### Group A — Lead-Gen Forms (4 pages, 3 are exact duplicates)

| Page | Form → ? | Notes |
|---|---|---|
| `/atelier/audit` | **LOST** — `handleSubmit` only flips UI state. No fetch, no API call. `/api/atelier/audit` POST exists but is unreferenced from this page. | **CRITICAL DATA LOSS.** 33 inbound CTAs drive users here. |
| `/atelier/contact` | `POST /api/access-request` | Same endpoint as request-access + partners/apply. |
| `/atelier/request-access` | `POST /api/access-request` | Same endpoint. Title says "Request access to HarchIQ Console" — narrower than contact. |
| `/atelier/partners/apply` | `POST /api/access-request` | Same endpoint. Orphan (only FAQ plain-text mention, no clickable link). |

**Recommendation:** Keep `/atelier/contact` as the canonical lead-gen form. Either (a) wire `/atelier/audit`'s 3-step wizard to POST to `/api/access-request` (preferred — preserves the rich wizard UX) or replace its 27 CTAs with `/atelier/contact#audit`. Delete `/atelier/request-access` (replace 5 inbound links with `/atelier/contact`). Wire `/atelier/partners/apply` to a partner-specific endpoint OR fold into `/atelier/contact?topic=partnership`.

### Group B — Content Hubs (2 pages, near-duplicates)

| Page | Featured items | Outbound |
|---|---|---|
| `/atelier/insights` | 14 (whitepaper, media report, harch-100, risk-tracker, customers, templates, method, faq, products, 3× approach, 2× expertise) | 14 |
| `/atelier/resources` | 9 (subset of insights — same featured whitepaper + media report + harch-100 + risk-tracker + customers + templates + method + faq + products) | 9 |

**Recommendation:** `/atelier/resources` is a strict subset of `/atelier/insights`. Delete `/atelier/resources`, redirect to `/atelier/insights`. Update 2 inbound links (footer `Ressources` column + any internal mentions).

### Group C — Agency Dashboards (2 pages, parallel implementations)

| Page | Lines | Mounted by | Auth routing |
|---|---|---|---|
| `/atelier/agency` | 1 193 (legacy Brick 8) | `/atelier/agency/page.tsx` | `getConsolePath()` L353 routes `agency-admin` → here |
| `/atelier/console/agency` | 17 842 (P0-1 rebuild, GLM-4 WhatsApp import per worklog) | `/atelier/console/agency/page.tsx` | **NOT routed** — only direct URL |

**Recommendation:** Update `getConsolePath()` L353 from `"/atelier/agency"` → `"/atelier/console/agency"`. Delete `/atelier/agency` (legacy 1 193 lines) + its `/atelier/agency/clients/[id]` sub-route (consolidate into `/atelier/console/agency/clients/[id]`). Update 3 inbound references (auth.config.ts, AtelierHome, robots.ts).

### Group D — Trackers (2 pages, overlapping data)

| Page | Purpose |
|---|---|
| `/atelier/reputation-tracker` | Top 100 with reputation scores, sentiment, pillars, trajectory |
| `/atelier/risk-tracker` | 32 risk categories × 6 industries with Frequency × Impact × Velocity |
| `/atelier/harch-100` | Live ranking of 100 Moroccan companies by reputation score |

**Overlap:** `reputation-tracker` and `harch-100` both surface ranked-company lists. `risk-tracker` is distinct (risk-focused) but often co-mentioned.

**Recommendation:** Merge `reputation-tracker` into `harch-100` (harch-100 is the canonical brand ranking, more inbound links, more complete). Keep `risk-tracker` as distinct (risk angle is different). Update 1 inbound link from `insights`/`resources`.

### Group E — Products vs Solutions vs Use-Cases (overlapping sales surfaces)

| Page | Purpose | Outbound |
|---|---|---|
| `/atelier/products` | Hub: 4 plans "Sur devis", sidebar CTA | 3 (contact, harch-100, pricing) |
| `/atelier/solutions` | "4 problèmes, une plateforme" — capabilities matrix | 2 (audit, method) |
| `/atelier/use-cases` | 6 sector deep-dives (banking, telecom, energy, mining, agri, hospitality) | 2 (audit, pricing) |

**Recommendation:** These serve different angles (products = WHAT, solutions = WHY, use-cases = WHO). Keep all 3 but ensure cross-linking. `/atelier/use-cases` is an ORPHAN (only sitemap) — add to footer "Ressources" column or under Solutions CTA.

### Group F — Method vs Approach (overlapping methodology content)

| Page | Purpose |
|---|---|
| `/atelier/method` | 5-step pipeline + 5 scoring pillars + CNDP/09-08/ISO compliance |
| `/atelier/approach/our-ai` | HarchIQ capabilities + 9-step pipeline |
| `/atelier/approach/our-data` | Sources, scale numbers, data quality |
| `/atelier/approach/our-commitment` | SLA, security, customer success |

**Overlap:** `/atelier/method` and `/atelier/approach/our-ai` both describe the pipeline (5 steps vs 9 steps — same content, different slicing).

**Recommendation:** Keep `/atelier/approach/*` as the canonical methodology tree (3 pages, well-structured, in nav). Redirect `/atelier/method` → `/atelier/approach/our-ai`. Update 9 inbound links (mostly resources/insights lists + about).

### Group G — Company / Trust (overlapping security content)

| Page | Purpose |
|---|---|
| `/atelier/about` | Mission, team, story, values |
| `/atelier/trust` | Trust Center: security architecture, compliance shields, RBAC, incident response |
| `/atelier/security` | **Server-side redirect** to `/atelier/trust` |
| `/atelier/approach/our-commitment` | SLA, encryption, breach notification (subset of trust) |

**Recommendation:** `/atelier/security` redirect is fine (alias for /trust). The real duplication is `/atelier/approach/our-commitment` vs `/atelier/trust` — both cover security + compliance. **Pick one canonical.** Recommended: keep `/atelier/trust` (Trust Center pattern, more comprehensive, 8 sections), fold `our-commitment` into a section of trust OR keep `our-commitment` as the "approach" angle (lighter, customer-success focused) and link the two.

### Group H — App Consoles (overlapping tool surfaces)

| Page | Purpose |
|---|---|
| `/atelier/console` | Smart redirector |
| `/atelier/dashboard` | **Legacy redirect** to `/atelier/console` (deprecated) |
| `/atelier/intelligence` | Raw forensic intelligence export (POST + poll) |
| `/atelier/sales` | Super-admin batch email sender (surgical Dircom emails) |

**Overlap:** `/atelier/dashboard` is a backwards-compat redirect — delete after confirming no external links. `/atelier/intelligence` and `/atelier/sales` are specialized tools (not duplicates of console) but are ORPHANS + DEAD-ENDS — they need to be linked from `/atelier/admin` (for sales) and from the console sidebar (for intelligence).

### Dead Code — Console Components (NOT pages but worth flagging)

Three large console components are **never mounted as JSX**:

| File | Lines | Status |
|---|---|---|
| `src/app/atelier/console/ConsoleShell.tsx` | 3 556 | Exported `function ConsoleShell()` at L852 — never imported/mounted anywhere. |
| `src/app/atelier/console/Dashboard.tsx` | 1 526 | Only referenced as a comment in `/atelier/console/agency/page.tsx` L19. Never rendered as `<Dashboard>`. |
| `src/app/atelier/console/agency/AgencyConsole.tsx` | 2 302 | Replaced by `AgencyDashboard.tsx` per P0-1 worklog. Never mounted. |
| **Total dead code** | **~7 384 lines** | |

---

## Section 3 — Orphans (zero incoming clickable links)

**True orphans** (need fixing — no nav, no footer, no internal link):

| Path | Why it's orphaned | Fix |
|---|---|---|
| `/atelier/lab` | Not in nav, not in footer. Lab sub-pages link to each other but the index has no parent. | Add to footer "Outils" column OR add as a sub-item under Plateforme dropdown. |
| `/atelier/sales` | Super-admin only, no nav, no inbound. | Acceptable as hidden admin tool, but add a link from `/atelier/admin` sidebar (Security or Sales tab). |
| `/atelier/products/integrations` | Only in `sitemap.ts`. Not linked from `/atelier/products` hub. | Add to `/atelier/products` hub "More" section + footer "Produits" column. |
| `/atelier/use-cases` | Only in `sitemap.ts`. | Add to footer "Ressources" column OR Solutions dropdown. |
| `/atelier/health` | Only in `robots.ts` (Disallow). | Internal-only — link from `/atelier/admin` (System Health card). |
| `/atelier/partners/apply` | Only mentioned as plain text in FAQ (no `<a href>`). | Add `<a href="/atelier/partners/apply">` to the FAQ answer + to `/atelier/partners` page CTA. |
| `/atelier/api-docs` | Only in `sitemap.ts` + dead `constants.ts`. | Add to footer "Entreprise" or "Produits" column. |
| `/atelier/glossary` | Only in `sitemap.ts`. | Add to footer "Ressources" column. |
| `/atelier/intelligence` | Only in dead `constants.ts`. | Link from `/atelier/admin` or `/atelier/console` sidebar. |

**Acceptable orphans** (reached via redirector, dynamic route, or email — no fix needed):

| Path | Why acceptable |
|---|---|
| `/atelier/console/essential` | Destination of `/atelier/console` redirect via `getConsolePath()` |
| `/atelier/console/pro` | Same |
| `/atelier/console/enterprise` | Same |
| `/atelier/console/settings/users` | Reached via `/atelier/console/settings/account` (settings sub-nav) |
| `/atelier/agency/clients/[id]` | Dynamic route — reached via agency dashboard client cards |
| `/atelier/blog/[slug]` | Dynamic route — reached via `/atelier/blog` index |
| `/atelier/invite/[token]` | Email-only — invitation links go directly here |

**Critical orphan** (the auth flow DOESN'T route here, but should):

| Path | Issue |
|---|---|
| `/atelier/console/agency` | `getConsolePath()` L353 routes `agency-admin` → `/atelier/agency` (legacy). The new 17 842-line `/atelier/console/agency` is unreachable except by direct URL. **Either update `getConsolePath()` or delete `/atelier/console/agency`** (and its 17 842 lines). |

---

## Section 4 — Dead Ends (no outbound atelier links AND no global nav)

These pages have **no `AtelierNav` and no `AtelierFooter`** — visitors arrive and have no escape except the browser back button. Some have a `BrandBadge` (which only renders as a link if `href` prop is passed — these don't pass it).

| Path | Has BrandBadge? | BrandBadge href? | Outbound atelier links | Severity |
|---|---|---|---|---|
| `/atelier/retro-audit` | YES | **NO** (no `href` prop) | 0 | HIGH — sales-weapon page, no way back to site |
| `/atelier/sales` | YES | NO | 0 | MEDIUM — super-admin only, but still no escape |
| `/atelier/intelligence` | NO | n/a | 0 | HIGH — forensic tool, user is trapped |
| `/atelier/templates` (TemplatesGallery) | NO | n/a | 0 | MEDIUM — gallery, no way to pricing/contact |
| `/atelier/lab/polymorphic` | YES | NO | 0 | LOW — demo page |
| `/atelier/lab/zkp` | YES | NO | 0 | LOW — demo page |
| `/atelier/console/settings/security` | NO | n/a | 0 | LOW — authed app, has internal sidebar |
| `/atelier/super-admin/audit-logs` | YES | NO | 0 | LOW — super-admin terminal |
| `/atelier/products/enterprise-risk-intelligence` | NO | n/a | 0 | MEDIUM — sales page, no CTA to contact/audit |

**Recommended fix:** Wrap all public-facing dead-end pages in `<AtelierNav />` + `<AtelierFooter />`. For the lab pages and admin terminals where global nav is inappropriate, pass `href="/atelier"` to `<BrandBadge>` so the logo at least escapes home.

---

## Section 5 — Broken Links

### 5.1 — Broken Redirect Paths (CRITICAL)

These paths are referenced in `redirect()` / `router.push()` calls but have **no `page.tsx`** — visitors hit a 404.

| Broken Path | Source Files | Impact |
|---|---|---|
| `/atelier/console/brand-monitor` | `console/page.tsx` L31 (admin redirect), `agency/AgencyDashboard.tsx` L156 (`router.push` after 400ms), `agency/clients/[id]/AgencyClientDetail.tsx` L150 (same), `console/StandbyBanner.tsx` L34 (`DEFAULT_CTA_HREF`), `console/ConsoleShell.tsx` L945 (comment) | **Admin login redirects to a 404.** Agency workspace switch redirects to a 404. |
| `/atelier/client-dashboard` | `lib/auth/auth.config.ts` L356 (`getConsolePath()` for regular users) | **Regular (non-admin, non-company-admin, non-agency-admin) users can't be redirected post-login** — `getConsolePath()` returns a 404 path. `onboarding` page calls this. |

**Fix:** `/atelier/console/brand-monitor` was renamed to `/atelier/console/essential` per the account-type migration (brand-monitor → essential). Replace all 4 references. `/atelier/client-dashboard` should route to `/atelier/console` (the smart redirector) or to `/atelier/console/essential` (the default plan).

### 5.2 — Broken Sitemap Entries (sitemap.ts → 404)

`src/app/sitemap.ts` lists 6 paths that have **no `page.tsx`** — search engines will index 404s.

| Sitemap Path | Issue | Fix |
|---|---|---|
| `/atelier/approach` | Parent path — no `page.tsx` (only 3 children exist) | Either create a parent index page OR remove from sitemap. |
| `/atelier/expertise` | Parent path — no `page.tsx` (only 5 children) | Same. |
| `/atelier/industries` | Parent path — no `page.tsx` (only 6 children) | Same. |
| `/atelier/companies` | Parent path — no `page.tsx` (only 5 children) | Same. |
| `/atelier/insight-reports` | Parent path — no `page.tsx` (only 5 children) | Same. |
| `/atelier/demo` | **No `page.tsx` at all.** Referenced in `constants.ts` (dead `NAV_STRUCTURE`), `middleware.ts` (`PUBLIC_PAGE_PATHS`), `sitemap.ts`. | Remove from sitemap, remove from `PUBLIC_PAGE_PATHS`, remove dead `NAV_STRUCTURE` from `constants.ts`. |

### 5.3 — Other Broken References

| Reference | Source | Issue |
|---|---|---|
| `"/atelier/admin/"` (trailing slash) | `middleware.ts` L206 | Harmless — middleware matches both `/atelier/admin` and `/atelier/admin/*`. |
| `/atelier/api/audit` (as a link, not fetch) | `dashboard/DashboardPage.tsx` L18 (comment), L75 (fetch) | **NOT broken** — this is an API route, not a page. `fetch("/atelier/api/audit")` correctly POSTs to `src/app/atelier/api/audit/route.ts`. |

### 5.4 — Dead Code with Stale Path References

| File | Issue |
|---|---|
| `src/lib/constants.ts` (`NAV_STRUCTURE` export, L32-178) | Defines a nav structure with 30+ links including `/atelier/demo`, `/atelier/insight-reports` (parent), `/atelier/products/integrations`, `/atelier/use-cases`, etc. **Never imported anywhere** — `AtelierNav.tsx` uses `ATELIER_NAV_LINKS` from `tokens.ts` instead. **Delete the entire `NAV_STRUCTURE` export** to prevent confusion. |

---

## Section 6 — Recommended Actions (Priority-Ordered)

### P0 — Critical (data loss + broken auth)

1. **Wire `/atelier/audit`'s 3-step wizard to a real submission.** Either POST to `/api/access-request` (canonical lead-gen endpoint) or wire to `/api/atelier/audit` (which already exists at `src/app/atelier/api/audit/route.ts` — 9 810 lines, async BullMQ pipeline). Currently 27 inbound CTAs drive users to a form whose data is silently discarded.
2. **Fix `getConsolePath()` for regular users.** `src/lib/auth/auth.config.ts` L356 returns `"/atelier/client-dashboard"` which has no `page.tsx`. Change to `"/atelier/console"` (smart redirector) or `"/atelier/console/essential"` (default plan).
3. **Fix `/atelier/console/brand-monitor` references.** Replace with `/atelier/console/essential` in 4 source files: `console/page.tsx` L31, `agency/AgencyDashboard.tsx` L156, `agency/clients/[id]/AgencyClientDetail.tsx` L150, `console/StandbyBanner.tsx` L34.

### P1 — High (sitemap 404s + duplicate lead-gen)

4. **Remove 6 broken sitemap entries.** Either create parent index pages for `/atelier/approach`, `/atelier/expertise`, `/atelier/industries`, `/atelier/companies`, `/atelier/insight-reports` OR remove these lines from `src/app/sitemap.ts` (L37, L41, L54, L64, L80, L87). Also remove `/atelier/demo` (L87) — no page exists.
5. **Consolidate lead-gen forms.** Keep `/atelier/contact` as canonical. Either delete `/atelier/request-access` (5 inbound links to update) OR repurpose it as a "Request console access" sub-flow with a distinct endpoint. Wire `/atelier/partners/apply` to `/api/access-request?topic=partnership` (or a partner-specific endpoint).
6. **Pick one agency dashboard.** Update `getConsolePath()` L353 to route `agency-admin` → `/atelier/console/agency` (the new 17 842-line one). Then delete `/atelier/agency` (1 193 lines) + `/atelier/agency/clients/[id]` (consolidate sub-route). Update 3 inbound references (`auth.config.ts`, `AtelierHome.tsx`, `robots.ts`).

### P2 — Medium (orphans + dead ends + duplicates)

7. **Delete `/atelier/resources`** (subset of `/atelier/insights`). Redirect to `/atelier/insights`. Update 2 inbound links (footer `Ressources` column).
8. **Delete `/atelier/security`** (already a redirect to `/atelier/trust`). Replace 1 inbound link with `/atelier/trust` directly. OR keep as alias (harmless).
9. **Delete `/atelier/dashboard`** (legacy redirect to `/atelier/console`). Remove from `robots.ts` disallow list. No inbound links to update.
10. **Add nav/footer to 9 dead-end pages.** `/atelier/retro-audit`, `/atelier/sales`, `/atelier/intelligence`, `/atelier/templates`, `/atelier/lab/polymorphic`, `/atelier/lab/zkp`, `/atelier/products/enterprise-risk-intelligence` — wrap in `<AtelierNav/>` + `<AtelierFooter/>`. For lab/admin pages where global nav is inappropriate, pass `href="/atelier"` to `<BrandBadge>`.
11. **Link 6 orphans into the nav.** `/atelier/lab` → footer "Outils". `/atelier/use-cases` → footer "Ressources". `/atelier/products/integrations` → `/atelier/products` hub. `/atelier/api-docs` → footer "Entreprise". `/atelier/glossary` → footer "Ressources". `/atelier/health` → `/atelier/admin` sidebar.
12. **Merge `/atelier/reputation-tracker` into `/atelier/harch-100`.** Harch-100 is the canonical ranking (10 inbound links vs 1). Redirect reputation-tracker → harch-100.
13. **Redirect `/atelier/method` → `/atelier/approach/our-ai`.** Approach tree is canonical (3 pages, in nav). Update 9 inbound links.

### P3 — Low (cleanup)

14. **Delete dead console code** (~7 384 lines): `ConsoleShell.tsx` (3 556), `Dashboard.tsx` (1 526), `AgencyConsole.tsx` (2 302). Verify no transitive imports first.
15. **Delete `NAV_STRUCTURE` from `src/lib/constants.ts`** (L32-178, ~150 lines). Never imported.
16. **Delete `/atelier/demo` references** in `middleware.ts` `PUBLIC_PAGE_PATHS` (L72) and `ConsoleShell.tsx` comment (L945) — once `ConsoleShell.tsx` is deleted, only `middleware.ts` reference remains.
17. **Add inbound link to `/atelier/partners/apply`** from `/atelier/partners` CTA + FAQ answer.
18. **Reconcile `/atelier/approach/our-commitment` vs `/atelier/trust`** — pick one canonical for security/compliance content, link the other as a lighter-angle alias.

---

## Summary Counts

| Metric | Count |
|---|---|
| Total `page.tsx` files under `/src/app/atelier/` | **96** |
| Distinct navigable surfaces (excl. dynamic routes + sub-hub children) | **~57** |
| Duplicate groups | **7** (lead-gen ×4, content ×2, agency dash ×2, trackers ×2, products/solutions/use-cases ×3, method/approach ×4, trust/security/commitment ×3) |
| True orphans (need fixing) | **9** |
| Acceptable orphans (redirect/email-routed) | **7** |
| Dead-end pages (no escape) | **9** |
| Broken redirect paths (404 on auth flow) | **2** (`/atelier/console/brand-monitor`, `/atelier/client-dashboard`) |
| Broken sitemap entries (404 for crawlers) | **6** |
| Dead code lines (console components) | **~7 384** |
| Dead code lines (`NAV_STRUCTURE` in `constants.ts`) | **~150** |
| Forms that lose data | **1** (`/atelier/audit`) |
| Forms that POST to the same endpoint | **3** (`/atelier/contact`, `/atelier/request-access`, `/atelier/partners/apply`) |
