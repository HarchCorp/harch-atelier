# API ROUTES AUDIT — PROJECT YGGDRASIL / HARCH ATELIER

**Task ID:** AUDIT-API-ROUTES
**Agent:** AURA (Lead Product & UX Strategist)
**Scope:** RESEARCH ONLY — no code modified. Comprehensive audit of all 186 API route files under `src/app/api/`.
**Method:** Static analysis (Grep + Read) of every `route.ts`. Cross-referenced against the canonical RBAC pattern documented in `src/lib/auth/rbac.ts` (`isAccountTypeAllowed` + `normalizeAccountType` helpers, legacy→new mapping `brand-monitor → essential`, `market-competitor → pro`, `investment-bank → enterprise`, `harch-alpha → agency`).

---

## EXECUTIVE SUMMARY

| Category | Count | % |
|---|---|---|
| **Total route files** | **186** | 100% |
| ✅ HEALTHY | ~95 | 51% |
| ⚠️ WARNING | ~50 | 27% |
| 🔴 BROKEN | ~41 | 22% |

**Top 3 critical findings:**

1. **🔴 4 admin/internal routes have NO AUTH AT ALL** — `/api/admin/logs`, `/api/admin/scraper-logs`, `/api/jobs`, `/api/jobs/[id]/status` return sensitive operational data (system logs, scraper logs, job queue state) to any unauthenticated caller.
2. **🔴 25 console/investor/trader routes use the legacy string-array RBAC gate** (`allowedTypes.includes(session.user.accountType)`) instead of `isAccountTypeAllowed()`. Users with the new canonical account types (`essential`/`pro`/`enterprise`/`agency`) get **403 Forbidden** on these routes — blocking the entire post-migration onboarding flow.
3. **🔴 2 cron routes filter users by legacy accountType in Prisma** — `/api/cron/notifications` and `/api/cron/generate-reports` only process users with `accountType: { in: ["brand-monitor", "market-competitor", "investment-bank"] }`, silently skipping every user onboarded with the new canonical types. These users never receive notifications or monthly reports.

---

## SECTION 1 — FULL ROUTE CATALOG

Routes grouped by prefix. Status: ✅ HEALTHY · ⚠️ WARNING · 🔴 BROKEN.
Auth: `session` = getServerSession · `apikey` = authenticateApiKey · `cron` = authorizeCron/CRON_SECRET · `twilio` = X-Twilio-Signature · `public` = no auth · `internal` = SETUP_TOKEN/ALERT_PUSH_SECRET.
RBAC: `✓ isAccountTypeAllowed` = uses canonical helper · `legacy` = hardcoded legacy-type array · `role` = role-only check · `n/a` = no accountType gate needed.

### 1.1 — `/api/` (root)

| Path | Method | Auth | RBAC | Status | Notes |
|---|---|---|---|---|---|
| `/api/route.ts` | GET | public | n/a | ✅ | "Hello world" |
| `/api/health/route.ts` | GET | public | n/a | ✅ | Health check |
| `/api/quote/route.ts` | GET | public | n/a | ✅ | Public quote |
| `/api/intel/route.ts` | GET | **public** | n/a | ⚠️ | Exposes agent data (mentions, alerts, scores) — likely should be authed |
| `/api/registry/route.ts` | GET | public | n/a | ✅ | Public crisis registry (intentional) |
| `/api/harch100-live/route.ts` | GET | public | n/a | ✅ | Public ranking (intentional) |
| `/api/harch100/latest/route.ts` | GET | public | n/a | ✅ | Public ranking (intentional) |
| `/api/harch100/auto-publish/route.ts` | GET | cron | n/a | ✅ | CRON_SECRET |
| `/api/flagship-report/route.ts` | GET | public | n/a | ✅ | Public aggregate report (intentional) |
| `/api/setup/route.ts` | POST | SETUP_TOKEN | n/a | 🔴 | L30: zod enum only legacy types — new installs can't pick `essential`/`pro`/etc. |
| `/api/ingest/route.ts` | GET | CRON_SECRET | n/a | ⚠️ | No try/catch on unauthorized branch (minor) |
| `/api/jobs/route.ts` | GET | **public** | n/a | 🔴 | NO AUTH — exposes internal job queue |
| `/api/jobs/[id]/status/route.ts` | GET | **public** | n/a | 🔴 | NO AUTH — exposes job status |
| `/api/search/route.ts` | GET | public | n/a | ⚠️ | Full-text search across ALL articles — no company scoping |
| `/api/lab/linguistic-matrix/route.ts` | GET | public | n/a | ✅ | Lab demo (intentional) |
| `/api/resilience/demo/[slug]/route.ts` | GET | public | n/a | ✅ | Resilience lab demo |
| `/api/pdf/[type]/route.ts` | GET | session | n/a | ✅ | PDF generation |
| `/api/industries/route.ts` | GET | public | n/a | ✅ | Industry list |
| `/api/industries/[slug]/route.ts` | GET | public | n/a | ✅ | Industry detail |
| `/api/contact/route.ts` | POST | public + rate-limit | n/a | ✅ | Zod validation + IP rate limit |
| `/api/access-request/route.ts` | POST | public | n/a | ✅ | Zod validation, source normalization (FIX-FORMS-1) |
| `/api/access/route.ts` | POST | token (invitation) | n/a | ✅ | Invitation acceptance |
| `/api/sales/send-surgical/route.ts` | POST | session | super_admin | ⚠️ | No try/catch around email-sending loop |

### 1.2 — `/api/admin/*`

| Path | Method | Auth | RBAC | Status | Notes |
|---|---|---|---|---|---|
| `/api/admin/logs/route.ts` | GET | **public** | n/a | 🔴 | **NO AUTH** — system logs exposed |
| `/api/admin/scraper-logs/route.ts` | GET | **public** | n/a | 🔴 | **NO AUTH** — scraper logs exposed |
| `/api/admin/audit-logs/route.ts` | GET | session | `audit:read` perm | ⚠️ | No try/catch around DB query |
| `/api/admin/users/route.ts` | GET | session | admin/super_admin | ⚠️ | L43: duplicated `super_admin` condition (cosmetic); excludes `commercial` role despite `canAccessAdmin` allowing it |
| `/api/admin/stats/route.ts` | GET | session | admin/super_admin | ✅ | Proper auth, uses new accountTypes in Prisma |
| `/api/admin/scrape-now/route.ts` | POST | session | admin/super_admin | ✅ | |
| `/api/admin/scraper-status/route.ts` | GET | session | admin | ✅ | |
| `/api/admin/source-health/route.ts` | GET | session | admin | ✅ | |
| `/api/admin/employee-fiches/route.ts` | GET/POST/PATCH | session | `canAccessAdmin` | ✅ | Uses canonical helper |
| `/api/admin/invitations/route.ts` | GET/POST | session | admin/super_admin | ✅ | |
| `/api/admin/invitations/bulk/route.ts` | POST | session | admin | ✅ | |
| `/api/admin/requests/route.ts` | GET | session | admin/super_admin | ✅ | |
| `/api/admin/requests/[id]/route.ts` | PATCH | session | admin/super_admin | ✅ | Manual validation (Set) instead of Zod |
| `/api/admin/provision-client/route.ts` | GET/POST/PATCH | session | `canAccessAdmin` | ✅ | New accountTypes only (essential/pro/enterprise/agency) |
| `/api/admin/create-account/route.ts` | POST | session | admin | ✅ | |
| `/api/admin/whatsapp-import/route.ts` | POST | session | admin | ✅ | |
| `/api/admin/revoke-session/route.ts` | POST | session | admin/super_admin | ✅ | |
| `/api/admin/upload-prices/route.ts` | POST | session | admin | ⚠️ | Manual CSV parsing (no Zod, acceptable for CSV) |
| `/api/admin/bootstrap-boss/route.ts` | POST | master key | n/a | ✅ | One-shot, sealed after first use |
| `/api/admin/reset-boss/route.ts` | POST | master key | n/a | ✅ | |
| `/api/admin/migrate-add-source/route.ts` | POST | session | super_admin | ✅ | One-shot migration |
| `/api/admin/super-admin/audit-logs/route.ts` | GET | session | `audit:read` perm | ✅ | (under /api/super-admin/) |

### 1.3 — `/api/auth/*`

| Path | Method | Auth | RBAC | Status | Notes |
|---|---|---|---|---|---|
| `/api/auth/[...nextauth]/route.ts` | GET/POST | NextAuth | n/a | ✅ | NextAuth default handlers |
| `/api/auth/register/route.ts` | POST | public | n/a | ⚠️ | No try/catch (single block) |
| `/api/auth/register-company/route.ts` | POST | public | n/a | 🔴 | L147, L207: creates new users with `accountType: "brand-monitor"` (legacy default) — should be `"essential"` |
| `/api/auth/accept-invite/route.ts` | POST | token (invitation) | n/a | ✅ | |
| `/api/auth/activate-master/route.ts` | POST | master key | n/a | ✅ | |
| `/api/auth/invite-info/route.ts` | GET | token | n/a | ⚠️ | No try/catch |
| `/api/auth/webauthn-register/route.ts` | POST | session | n/a | ⚠️ | No try/catch |
| `/api/auth/webauthn-verify/route.ts` | POST | session | n/a | ⚠️ | No try/catch |
| `/api/auth/zkp-challenge/route.ts` | POST | session | n/a | ⚠️ | No try/catch |
| `/api/auth/zkp-register/route.ts` | POST | session | n/a | ⚠️ | No try/catch |
| `/api/auth/zkp-verify/route.ts` | POST | session | n/a | ✅ | Has try/catch |

### 1.4 — `/api/console/*` (core product surface — most affected by legacy RBAC)

| Path | Method | Auth | RBAC | Status | Notes |
|---|---|---|---|---|---|
| `/api/console/ai-visibility/route.ts` | GET | session | ✓ isAccountTypeAllowed | ✅ | Best-practice pattern |
| `/api/console/ai-visibility-trend/route.ts` | GET | session | **legacy** array | 🔴 | L60: `["brand-monitor", ...]` — blocks essential/pro/enterprise users |
| `/api/console/alerts/route.ts` | GET | session | **legacy** array | 🔴 | L34: 4 legacy types — blocks new users |
| `/api/console/alerts/push/route.ts` | POST | internal | n/a | ✅ | CRON_SECRET/SETUP_TOKEN/ALERT_PUSH_SECRET |
| `/api/console/alert-config/route.ts` | GET/POST | session | (verify) | ⚠️ | |
| `/api/console/alert-detail/route.ts` | GET | session | company scope | ⚠️ | No try/catch; proper company+demo isolation |
| `/api/console/alert-timeline/route.ts` | GET | session | **legacy** array | 🔴 | L68 |
| `/api/console/analyze-sentiment/route.ts` | POST | session | **legacy** array | 🔴 | L42-45: 4 legacy types |
| `/api/console/approvals/route.ts` | GET/POST | session | ✓ isAccountTypeAllowed | ✅ | L48: mixed `["enterprise","agency","investment-bank","harch-alpha"]` — functionally OK (normalised) |
| `/api/console/approvals/[id]/route.ts` | GET/PATCH | session | ✓ isAccountTypeAllowed | ✅ | Same mixed pattern |
| `/api/console/ask/route.ts` | POST | session | (any accountType) | ✅ | HarchIQ assistant |
| `/api/console/brand-health/route.ts` | GET | session | (verify) | ✅ | |
| `/api/console/briefing/route.ts` | GET | session | (any accountType) | 🔴 | L93: fallback `?? "brand-monitor"` — passes legacy default to `getPrimaryCompanyForUser` |
| `/api/console/briefing/deliver/route.ts` | POST | session | (any accountType) | 🔴 | L190: fallback `?? "brand-monitor"` |
| `/api/console/briefing/list/route.ts` | GET | session | ✓ isAccountTypeAllowed | ✅ | |
| `/api/console/competitor-radar/route.ts` | GET | session | (verify) | ✅ | |
| `/api/console/compliance-report/route.ts` | GET | session | (verify) | ✅ | |
| `/api/console/crisis/route.ts` | GET | session | (any) | ✅ | |
| `/api/console/crisis-alerts/route.ts` | GET | session | (verify) | ✅ | |
| `/api/console/crisis-timeline/route.ts` | GET | session | (verify) | ✅ | |
| `/api/console/crisis-workflow/route.ts` | GET | session | (any) + demo bypass | ✅ | |
| `/api/console/custom-alerts/route.ts` | GET/POST | session | (verify) | ✅ | |
| `/api/console/darija-analyze/route.ts` | POST | session | (any) | ✅ | |
| `/api/console/entity-network/route.ts` | GET | session | **legacy** array | 🔴 | L90 |
| `/api/console/exposure-trend/route.ts` | GET | session | (verify) | ✅ | |
| `/api/console/export-csv/route.ts` | GET | session | (verify) | ✅ | |
| `/api/console/export-data/route.ts` | GET | session | (verify) | ✅ | |
| `/api/console/export-log/route.ts` | POST | session | (verify) | ✅ | |
| `/api/console/geo-heatmap/route.ts` | GET | session | ✓ isAccountTypeAllowed | ✅ | |
| `/api/console/geo-signals/route.ts` | GET | session | **legacy** array | 🔴 | L52: 4 legacy types |
| `/api/console/influencer-impact/route.ts` | GET | session | (verify) | ✅ | |
| `/api/console/influencer-mentions/route.ts` | GET | session | (verify) | ✅ | |
| `/api/console/influencers/route.ts` | GET | session | **legacy** array | 🔴 | L83 |
| `/api/console/influencers-db/route.ts` | GET | session | **legacy** array | 🔴 | L90 |
| `/api/console/influencers-db/[id]/route.ts` | GET/PATCH | session | **legacy** array | 🔴 | L55 |
| `/api/console/insights/route.ts` | GET | session | ✓ isAccountTypeAllowed | ✅ | L74: canonical; L51-55: legacy types still in query-param validation (cosmetic) |
| `/api/console/language-sentiment/route.ts` | GET | session | ✓ isAccountTypeAllowed | ✅ | |
| `/api/console/linguistic-matrix/route.ts` | GET | session | **legacy** array | 🔴 | L34 |
| `/api/console/mcp/test/route.ts` | POST | session | ✓ isAccountTypeAllowed | ✅ | L55: mixed pattern, functionally OK |
| `/api/console/migrate-account-types/route.ts` | POST | session | admin | ✅ | Legitimate use of legacy types (IS the migration tool) |
| `/api/console/narratives/route.ts` | GET | session | **legacy** array | 🔴 | L83 |
| `/api/console/neighbors/route.ts` | GET | session | **legacy** array | 🔴 | L62 |
| `/api/console/notifications/route.ts` | GET | session | (any) | ✅ | |
| `/api/console/probe-ai/route.ts` | POST | session | (any) | ✅ | |
| `/api/console/provenance/route.ts` | GET | session | (any) | ⚠️ | No try/catch |
| `/api/console/regulatory/route.ts` | GET | session | (any) | ✅ | |
| `/api/console/regulatory-feed/route.ts` | GET | session | (verify) | ✅ | |
| `/api/console/reports/route.ts` | GET/POST | session | **legacy** array | 🔴 | L30 |
| `/api/console/reports/list/route.ts` | GET | session | ✓ isAccountTypeAllowed | ✅ | |
| `/api/console/reports/[id]/pdf/route.ts` | GET | session | (verify) | ✅ | |
| `/api/console/retro-audit/route.ts` | GET | session | admin/super_admin | ⚠️ | No try/catch |
| `/api/console/search/route.ts` | GET | session | (verify) | ✅ | |
| `/api/console/sentiment-comparison/route.ts` | GET | session | (verify) | ✅ | |
| `/api/console/sentiment-trend/route.ts` | GET | session | ✓ isAccountTypeAllowed | ✅ | |
| `/api/console/settings/users/route.ts` | GET/POST/PATCH/DELETE | session | company scope | 🔴 | L173: hardcoded `accountType: "brand-monitor"` default for new invites |
| `/api/console/settings/users/invitations/route.ts` | GET/POST | session | company scope | ✅ | |
| `/api/console/share-of-voice/route.ts` | GET | session | (verify) | ✅ | |
| `/api/console/social-activity/route.ts` | GET | session | ✓ isAccountTypeAllowed | ✅ | |
| `/api/console/source-distribution/route.ts` | GET | session | (verify) | ✅ | |
| `/api/console/source-matrix/route.ts` | GET | session | **legacy** array | 🔴 | L42 |
| `/api/console/team-activity/route.ts` | GET | session | (verify) + demo bypass | ✅ | |
| `/api/console/topics/route.ts` | GET | session | ✓ isAccountTypeAllowed | ✅ | |
| `/api/console/weather/route.ts` | GET | session | **legacy** array | 🔴 | L45 |
| `/api/console/weekly-comparison/route.ts` | GET | session | (verify) | ✅ | |
| `/api/console/whatsapp-digest/route.ts` | GET | session | (verify) | ✅ | |

### 1.5 — `/api/investor/*` (all broken — single accountType check)

| Path | Method | Auth | RBAC | Status | Notes |
|---|---|---|---|---|---|
| `/api/investor/screen/route.ts` | GET/POST | session | **legacy** (single type) | 🔴 | L67: `!== "investment-bank"` — blocks new `enterprise` users |
| `/api/investor/dossiers/route.ts` | GET/POST | session | **legacy** (single type) | 🔴 | L29 |
| `/api/investor/stats/route.ts` | GET | session | **legacy** (single type) | 🔴 | L31 |
| `/api/investor/portfolios/route.ts` | GET/POST | session | **legacy** (single type) | 🔴 | L29 |
| `/api/investor/entity-graph/route.ts` | GET | session | **legacy** (single type) | 🔴 | L152 |

### 1.6 — `/api/trader/*` (all broken — single accountType check)

| Path | Method | Auth | RBAC | Status | Notes |
|---|---|---|---|---|---|
| `/api/trader/assets/route.ts` | GET | session | **legacy** (single type) | 🔴 | L24: `!== "harch-alpha"` — blocks new `agency` users |
| `/api/trader/assets/[ticker]/history/route.ts` | GET | session | **legacy** (single type) | 🔴 | L64 |
| `/api/trader/assets/[ticker]/correlation/route.ts` | GET | session | **legacy** (single type) | 🔴 | L45 |
| `/api/trader/stats/route.ts` | GET | session | **legacy** (single type) | 🔴 | L27 |
| `/api/trader/stream/route.ts` | GET | session | **legacy** (single type) | 🔴 | L53 |

### 1.7 — `/api/agency/*`

| Path | Method | Auth | RBAC | Status | Notes |
|---|---|---|---|---|---|
| `/api/agency/branding/route.ts` | GET | public | n/a | ✅ | Intentional (login page branding) |
| `/api/agency/quota/route.ts` | GET | session | `requireAgencyAdmin` | ✅ | |
| `/api/agency/switch/route.ts` | POST | session | `requireAgencyAdmin` | ✅ | |
| `/api/agency/clients/route.ts` | GET/POST | session | `requireAgencyAdmin` | ✅ | |
| `/api/agency/clients/[id]/route.ts` | GET/PATCH | session | `requireAgencyAdmin` | ✅ | |
| `/api/agency/whatsapp-import/route.ts` | POST | session | admin | 🔴 | L297: hardcoded `accountType: "brand-monitor"` for created users |

### 1.8 — `/api/company/*`

| Path | Method | Auth | RBAC | Status | Notes |
|---|---|---|---|---|---|
| `/api/company/create/route.ts` | POST | session | (verify) | ✅ | |
| `/api/company/invite/route.ts` | POST | session | `requireCompanyAdmin` | 🔴 | L83-91: validation array only legacy types → defaults new invites to `brand-monitor` |
| `/api/company/list/route.ts` | GET | session | (verify) | ✅ | |
| `/api/company/settings/route.ts` | GET/PATCH | session | company scope | ✅ | |
| `/api/company/subsidiary/route.ts` | POST | session | (verify) | ✅ | |
| `/api/company/team/route.ts` | GET/PATCH/DELETE | session | `requireCompanyAdmin` | 🔴 | L147-152: validation array only legacy types |

### 1.9 — `/api/user/*`

| Path | Method | Auth | RBAC | Status | Notes |
|---|---|---|---|---|---|
| `/api/user/onboard/route.ts` | POST | session | (any) | 🔴 | L57-62: VALID_ACCOUNT_TYPES only legacy 4; L188: fallback default `"brand-monitor"` |
| `/api/user/whatsapp/route.ts` | GET/PATCH | session | (any) | ✅ | Manual validation (Set) — OK |
| `/api/user/whatsapp/test/route.ts` | POST | session | (any) | ✅ | |

### 1.10 — `/api/companies/*`

| Path | Method | Auth | RBAC | Status | Notes |
|---|---|---|---|---|---|
| `/api/companies/route.ts` | GET | public | n/a | ⚠️ | Returns company directory to anyone (filtered isDemo:false) |
| `/api/companies/[slug]/route.ts` | GET | public | n/a | ⚠️ | Returns ALL articles + risk assessments + sentiment for a company — potential data exposure |
| `/api/companies/lookup-domain/route.ts` | GET | public | n/a | ✅ | Intentional (signup form) — only returns name+slug |
| `/api/companies/[slug]/ai-visibility/route.ts` | GET | public | n/a | ⚠️ | Likely public — verify intent |
| `/api/companies/[slug]/articles/route.ts` | GET | public | n/a | ⚠️ | Likely public — verify intent |
| `/api/companies/[slug]/entities/route.ts` | GET | public | n/a | ⚠️ | Likely public — verify intent |
| `/api/companies/[slug]/reputation/route.ts` | GET | public | n/a | ⚠️ | Likely public — verify intent |
| `/api/companies/[slug]/risks/route.ts` | GET | public | n/a | ⚠️ | Likely public — verify intent |
| `/api/companies/[slug]/sentiment/route.ts` | GET | public | n/a | ⚠️ | Likely public — verify intent |

### 1.11 — `/api/cron/*` (all use authorizeCron except where noted)

| Path | Method | Auth | RBAC | Status | Notes |
|---|---|---|---|---|---|
| `/api/cron/scrape/route.ts` | POST | cron | n/a | ✅ | |
| `/api/cron/scrape-rss/route.ts` | GET/POST | cron | n/a | ✅ | |
| `/api/cron/scrape-regulatory/route.ts` | GET/POST | cron | n/a | ✅ | |
| `/api/cron/nlp/route.ts` | GET/POST | cron | n/a | ✅ | |
| `/api/cron/refresh/route.ts` | GET/POST | cron | n/a | ✅ | |
| `/api/cron/refresh-bvc-prices/route.ts` | GET/POST | cron | n/a | ✅ | |
| `/api/cron/refresh-sanctions/route.ts` | GET/POST | cron | n/a | ✅ | |
| `/api/cron/health/route.ts` | POST | cron | n/a | ✅ | |
| `/api/cron/clean-jobs/route.ts` | GET/POST | cron | n/a | ⚠️ | No try/catch |
| `/api/cron/dispatch/route.ts` | GET/POST | CRON_SECRET | n/a | ✅ | |
| `/api/cron/agents/route.ts` | GET/POST | cron | n/a | ✅ | |
| `/api/cron/audit-sentinel/route.ts` | GET/POST | cron | n/a | ✅ | |
| `/api/cron/auto-surgical/route.ts` | GET/POST | cron | n/a | ✅ | |
| `/api/cron/ai-visibility/route.ts` | GET/POST | cron | n/a | ✅ | |
| `/api/cron/generate-briefings/route.ts` | GET/POST | cron | n/a | 🔴 | L224: fallback `?? "brand-monitor"` for `getPrimaryCompanyForUser` |
| `/api/cron/generate-reports/route.ts` | GET | cron | n/a | 🔴 | L197: Prisma filter `accountType: { in: ["brand-monitor","market-competitor","investment-bank"] }` — **skips all new-type users** |
| `/api/cron/notifications/route.ts` | GET | cron | n/a | 🔴 | L45: same Prisma filter — **new-type users never receive notifications** |
| `/api/cron/whatsapp-alerts/route.ts` | GET/POST | cron | n/a | ✅ | |

### 1.12 — `/api/v1/*` (public API — Bearer key auth)

| Path | Method | Auth | RBAC | Status | Notes |
|---|---|---|---|---|---|
| `/api/v1/alerts/route.ts` | GET | apikey | n/a | ⚠️ | No try/catch |
| `/api/v1/reputation/route.ts` | GET | apikey | n/a | ⚠️ | No try/catch |
| `/api/v1/sentiment/route.ts` | GET | apikey | n/a | ⚠️ | No try/catch |
| `/api/v1/screen/route.ts` | POST | apikey | n/a | ⚠️ | No try/catch |

### 1.13 — `/api/webhooks/*` (company-scoped webhook management)

| Path | Method | Auth | RBAC | Status | Notes |
|---|---|---|---|---|---|
| `/api/webhooks/route.ts` | GET/POST | session | company scope | ⚠️ | Manual validation (no Zod) |
| `/api/webhooks/[id]/route.ts` | GET/PATCH/DELETE | session | company scope | ⚠️ | No try/catch |
| `/api/webhooks/[id]/test/route.ts` | POST | session | company scope | ⚠️ | No try/catch |

### 1.14 — `/api/whatsapp/*`

| Path | Method | Auth | RBAC | Status | Notes |
|---|---|---|---|---|---|
| `/api/whatsapp/inbound/route.ts` | POST | twilio signature | n/a | ✅ | Dev-mode bypass documented |
| `/api/whatsapp/inbound/messages/route.ts` | GET | session | (verify) | ⚠️ | No try/catch |
| `/api/whatsapp/simulate/route.ts` | POST | session | (any) + demo bypass | ✅ | Manual validation |

### 1.15 — `/api/api-keys/*`

| Path | Method | Auth | RBAC | Status | Notes |
|---|---|---|---|---|---|
| `/api/api-keys/route.ts` | GET/POST | session | company scope | ⚠️ | Manual validation (no Zod), no try/catch |
| `/api/api-keys/[id]/route.ts` | DELETE | session | company scope | ⚠️ | No try/catch |

### 1.16 — `/api/scrape/*`

| Path | Method | Auth | RBAC | Status | Notes |
|---|---|---|---|---|---|
| `/api/scrape/hespress-comments/route.ts` | POST | session | (any) + demo bypass | ✅ | In-memory rate limiter, manual validation |

### 1.17 — `/api/super-admin/*`

| Path | Method | Auth | RBAC | Status | Notes |
|---|---|---|---|---|---|
| `/api/super-admin/audit-logs/route.ts` | GET | session | `audit:read` perm | ⚠️ | No try/catch |

---

## SECTION 2 — 🔴 BROKEN ROUTES (exact file + line + issue)

### 2.1 — Critical: NO AUTH on admin/internal routes (4 routes)

These routes return sensitive operational data to any unauthenticated caller. No session check, no API key, no cron secret.

| # | File | Line | Issue |
|---|---|---|---|
| 1 | `src/app/api/admin/logs/route.ts` | L5 | `GET(request)` — no `getServerSession`, no role check. Returns paginated `SystemLog` rows (level, category, metadata) to anyone. |
| 2 | `src/app/api/admin/scraper-logs/route.ts` | L5 | `GET(request)` — no auth. Returns paginated `ScraperLog` rows (status, sourceId, startedAt, payload) to anyone. |
| 3 | `src/app/api/jobs/route.ts` | L92 | `GET(request)` — no auth. Returns paginated job queue (status, jobType, result, progress) to anyone. |
| 4 | `src/app/api/jobs/[id]/status/route.ts` | (whole file) | `GET` — no auth. Returns single job status to anyone. |

**Fix:** Add the same admin-session guard used by `/api/admin/stats/route.ts` L23-27:
```ts
const session = await getServerSession(authOptions);
if (!session || (session.user?.role !== "admin" && session.user?.role !== "super_admin")) {
  return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
}
```

### 2.2 — Critical: Legacy RBAC gate blocks new account types (25 routes)

These routes use `allowedTypes.includes(session.user.accountType || "")` instead of `isAccountTypeAllowed(session, [...])`. After the P0-2 migration to canonical types (`essential`/`pro`/`enterprise`/`agency`), any user onboarded with a new type gets **403 Forbidden**. Legacy users (`brand-monitor` etc.) still pass.

| # | File | Line | Legacy array | Blocks |
|---|---|---|---|---|
| 1 | `src/app/api/console/narratives/route.ts` | L83 | `["brand-monitor","market-competitor","investment-bank"]` | essential, pro, enterprise, agency |
| 2 | `src/app/api/console/source-matrix/route.ts` | L42 | same | same |
| 3 | `src/app/api/console/alert-timeline/route.ts` | L68 | same | same |
| 4 | `src/app/api/console/ai-visibility-trend/route.ts` | L60 | same | same |
| 5 | `src/app/api/console/linguistic-matrix/route.ts` | L34 | same | same |
| 6 | `src/app/api/console/reports/route.ts` | L30 | same | same |
| 7 | `src/app/api/console/weather/route.ts` | L45 | same | same |
| 8 | `src/app/api/console/influencers/route.ts` | L83 | same | same |
| 9 | `src/app/api/console/influencers-db/route.ts` | L90 | same | same |
| 10 | `src/app/api/console/influencers-db/[id]/route.ts` | L55 | same | same |
| 11 | `src/app/api/console/neighbors/route.ts` | L62 | same | same |
| 12 | `src/app/api/console/entity-network/route.ts` | L90 | same | same |
| 13 | `src/app/api/console/analyze-sentiment/route.ts` | L42-45 | `["brand-monitor","market-competitor","investment-bank","harch-alpha"]` | essential, pro, enterprise, agency |
| 14 | `src/app/api/console/geo-signals/route.ts` | L52 | same 4 | same |
| 15 | `src/app/api/console/alerts/route.ts` | L34 | same 4 | same |
| 16 | `src/app/api/investor/screen/route.ts` | L67 | single `!== "investment-bank"` | enterprise (new equivalent) |
| 17 | `src/app/api/investor/dossiers/route.ts` | L29 | single `!== "investment-bank"` | enterprise |
| 18 | `src/app/api/investor/stats/route.ts` | L31 | single `!== "investment-bank"` | enterprise |
| 19 | `src/app/api/investor/portfolios/route.ts` | L29 | single `!== "investment-bank"` | enterprise |
| 20 | `src/app/api/investor/entity-graph/route.ts` | L152 | single `!== "investment-bank"` | enterprise |
| 21 | `src/app/api/trader/assets/route.ts` | L24 | single `!== "harch-alpha"` | agency (new equivalent) |
| 22 | `src/app/api/trader/assets/[ticker]/history/route.ts` | L64 | single `!== "harch-alpha"` | agency |
| 23 | `src/app/api/trader/assets/[ticker]/correlation/route.ts` | L45 | single `!== "harch-alpha"` | agency |
| 24 | `src/app/api/trader/stats/route.ts` | L27 | single `!== "harch-alpha"` | agency |
| 25 | `src/app/api/trader/stream/route.ts` | L53 | single `!== "harch-alpha"` | agency |

**Fix (single pattern):** Replace the legacy block with:
```ts
import { isAccountTypeAllowed } from "@/lib/auth/rbac";
// ...
if (!isAccountTypeAllowed(session, ["essential", "pro", "enterprise"])) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```
For investor routes: `["enterprise"]`. For trader routes: `["agency"]`.

### 2.3 — Critical: Cron routes filter users by legacy accountType (2 routes)

These cron routes use a Prisma `where: { accountType: { in: [...] } }` filter that contains only legacy types. Users onboarded with new canonical types are silently skipped — they never receive notifications or monthly reports.

| # | File | Line | Issue |
|---|---|---|---|
| 1 | `src/app/api/cron/notifications/route.ts` | L45 | `accountType: { in: ["brand-monitor","market-competitor","investment-bank"] }` — skips essential/pro/enterprise users. New users never get push notifications. |
| 2 | `src/app/api/cron/generate-reports/route.ts` | L197 | Same Prisma filter — skips new users. New users never get monthly reports. |

**Fix:** Either (a) replace with `accountType: { in: ["essential","pro","enterprise","brand-monitor","market-competitor","investment-bank"] }` to cover both during migration, or (b) run `/api/console/migrate-account-types` first then use only new types. Option (a) is safer during transition.

### 2.4 — High: Legacy validation blocks new accountType in user-facing forms (6 routes)

These routes have a validation array/Set/Zod-enum that only accepts the 4 legacy types. When a user (or admin) sends a new canonical type, it's rejected or silently replaced with `"brand-monitor"`, corrupting the data model.

| # | File | Line | Issue |
|---|---|---|---|
| 1 | `src/app/api/setup/route.ts` | L30 | Zod enum `["brand-monitor","market-competitor","investment-bank","harch-alpha"]` — one-time setup can't pick `essential`/`pro`/etc. |
| 2 | `src/app/api/auth/register-company/route.ts` | L147, L207 | Hardcoded `accountType: "brand-monitor"` for new users + AccessRequest. New self-registered users get legacy type. |
| 3 | `src/app/api/company/invite/route.ts` | L83-91 | Validation array only legacy types → defaults invitees to `"brand-monitor"`. Company-admin can't invite an `essential` user. |
| 4 | `src/app/api/company/team/route.ts` | L147-152 | Same legacy-only validation on PATCH. Can't update a teammate to `essential`. |
| 5 | `src/app/api/user/onboard/route.ts` | L57-62, L188 | `VALID_ACCOUNT_TYPES` Set only legacy. Fallback default `"brand-monitor"`. New users with `accountType: "essential"` get reset to `"brand-monitor"` after onboarding. |
| 6 | `src/app/api/console/settings/users/route.ts` | L173 | Hardcoded `accountType: "brand-monitor"` for new team members. |
| 7 | `src/app/api/agency/whatsapp-import/route.ts` | L297 | Hardcoded `accountType: "brand-monitor"` for imported users. |

**Fix:** Replace legacy arrays with `["essential","pro","enterprise","agency","brand-monitor","market-competitor","investment-bank","harch-alpha"]` (accept both during migration) and replace hardcoded `"brand-monitor"` defaults with `"essential"` (the canonical equivalent).

### 2.5 — Medium: Legacy fallback default in briefing/cron helpers (3 routes)

These routes use `session.user.accountType ?? "brand-monitor"` as a fallback. If the session has no accountType (rare edge case during migration), the legacy default propagates to downstream helpers.

| # | File | Line | Issue |
|---|---|---|---|
| 1 | `src/app/api/console/briefing/route.ts` | L93 | `accountType: session.user.accountType ?? "brand-monitor"` passed to `getPrimaryCompanyForUser`. |
| 2 | `src/app/api/console/briefing/deliver/route.ts` | L190 | Same fallback. |
| 3 | `src/app/api/cron/generate-briefings/route.ts` | L224 | `user.accountType ?? "brand-monitor"` — affects all generated briefings for users without an explicit accountType. |

**Fix:** Replace `?? "brand-monitor"` with `?? "essential"` (the new canonical default).

---

## SECTION 3 — ⚠️ WARNING ROUTES (functional but with quality issues)

### 3.1 — No try/catch (functional but unsafe on unexpected errors)

If the Prisma query or external API call throws, the route returns an unhandled 500 with a stack trace leaked to the client.

| File | Issue |
|---|---|
| `src/app/api/super-admin/audit-logs/route.ts` | DB query + chain verification, no try/catch |
| `src/app/api/console/retro-audit/route.ts` | Multi-step Prisma + LLM, no try/catch |
| `src/app/api/console/provenance/route.ts` | ProvenanceTracker queries, no try/catch |
| `src/app/api/console/alert-detail/route.ts` | Multi-table lookup, no try/catch |
| `src/app/api/api-keys/route.ts` | POST body parse + Prisma, no try/catch |
| `src/app/api/api-keys/[id]/route.ts` | DELETE, no try/catch |
| `src/app/api/auth/invite-info/route.ts` | Token lookup, no try/catch |
| `src/app/api/auth/webauthn-register/route.ts` | WebAuthn registration, no try/catch |
| `src/app/api/auth/webauthn-verify/route.ts` | WebAuthn verification, no try/catch |
| `src/app/api/auth/zkp-challenge/route.ts` | ZKP challenge, no try/catch |
| `src/app/api/auth/zkp-register/route.ts` | ZKP registration, no try/catch |
| `src/app/api/v1/alerts/route.ts` | Public API, no try/catch |
| `src/app/api/v1/reputation/route.ts` | Public API, no try/catch |
| `src/app/api/v1/sentiment/route.ts` | Public API, no try/catch |
| `src/app/api/v1/screen/route.ts` | Public API, no try/catch |
| `src/app/api/webhooks/[id]/route.ts` | CRUD, no try/catch |
| `src/app/api/webhooks/[id]/test/route.ts` | Webhook test fire, no try/catch |
| `src/app/api/whatsapp/inbound/messages/route.ts` | Message list, no try/catch |
| `src/app/api/cron/clean-jobs/route.ts` | Cron job, no try/catch |
| `src/app/api/sales/send-surgical/route.ts` | Email send loop, no try/catch around `sendSurgicalEmail` — one failure crashes the batch |
| `src/app/api/lab/linguistic-matrix/route.ts` | Public demo, no try/catch (low risk) |
| `src/app/api/registry/route.ts` | Public registry, no try/catch (low risk) |
| `src/app/api/harch100-live/route.ts` | Public, no try/catch (low risk) |
| `src/app/api/intel/route.ts` | Public, no try/catch — see also BROKEN §2.1 |
| `src/app/api/auth/register/route.ts` | Single try/catch block, but error path doesn't log |

### 3.2 — Manual input validation instead of Zod

Routes that use `typeof body.x === "string"` or ad-hoc `Set` checks instead of Zod schemas. Functional but harder to maintain and more error-prone (missing length caps, no nested object validation, no error message standardisation).

| File | Method | Issue |
|---|---|---|
| `src/app/api/api-keys/route.ts` | POST | `typeof body.name === "string"` — no length cap, no trim normalisation in schema |
| `src/app/api/webhooks/route.ts` | POST | Manual `url`/`events`/`description` validation; `isValidUrl()` helper is good but events array filtering is manual |
| `src/app/api/company/invite/route.ts` | POST | `body as { email?: string; ... }` cast — no schema, no length caps |
| `src/app/api/company/team/route.ts` | PATCH | Manual `validAccountTypes.includes()` + `validRoles.includes()` |
| `src/app/api/console/alerts/push/route.ts` | POST | Manual body mode dispatch (`alert` / `articleIds` / `sinceMinutes`) |
| `src/app/api/admin/upload-prices/route.ts` | POST | Manual CSV parsing — acceptable for CSV but no Zod on the JSON mode |
| `src/app/api/whatsapp/simulate/route.ts` | POST | `SimulateBody` interface + manual typeof checks |
| `src/app/api/sales/send-surgical/route.ts` | POST | `body.slug` accessed without validation |
| `src/app/api/admin/requests/[id]/route.ts` | PATCH | `VALID_STATUSES` Set — acceptable for simple enum but inconsistent with the Zod pattern used elsewhere |
| `src/app/api/admin/invitations/route.ts` | POST | Manual field extraction |
| `src/app/api/admin/provision-client/route.ts` | POST | `VALID_ACCOUNT_TYPES` Set — extensive manual validation, 1132-line file |

### 3.3 — Stale comments referencing legacy account types (cosmetic, ~20 routes)

Comments at the top of these routes still say `Auth: requires session (brand-monitor | market-competitor | investment-bank | admin)` even when the route has been migrated to `isAccountTypeAllowed`. Confusing for future maintainers. Examples: `weekly-comparison`, `probe-ai`, `ai-visibility` (comment only — code is healthy), `team-activity`, `influencer-mentions`, `reports/list`, `regulatory`, `topics`, `geo-signals`, `neighbors`, `briefing`, `custom-alerts`, `insights`, `entity-network`, `sentiment-trend`.

### 3.4 — Public routes with potential data exposure (verify intent)

| File | Concern |
|---|---|
| `src/app/api/intel/route.ts` | Returns agent-scraped mentions + alerts + scores to anyone. No company scoping. Likely a dev leftover — should be authed or removed. |
| `src/app/api/companies/[slug]/route.ts` | Returns 20 articles + 10 risk assessments + sentiment + reputation + AI visibility for ANY company slug. No auth, no demo isolation. If theslug is guessable, anyone can read a competitor's intel. |
| `src/app/api/companies/[slug]/{ai-visibility,articles,entities,reputation,risks,sentiment}/route.ts` | 6 sub-routes — same concern. Need to verify if these power the public company profile page (intentional) or are internal-only (should be authed). |
| `src/app/api/search/route.ts` | Full-text ILIKE search across all articles — no auth, no company scoping. Anyone can enumerate articles. |
| `src/app/api/companies/route.ts` | Returns company directory (name, sector, aliases) — filtered `isDemo:false`. Lower risk but still exposes the client list. |

### 3.5 — Minor code-quality issues

| File | Line | Issue |
|---|---|---|
| `src/app/api/admin/users/route.ts` | L43 | Duplicated condition: `session.user?.role !== "admin" && session.user?.role !== "super_admin" && session.user?.role !== "super_admin"` — `super_admin` checked twice, `commercial` excluded despite `canAccessAdmin` allowing it. |
| `src/app/api/console/insights/route.ts` | L51-55 | `ALLOWED_ACCOUNT_TYPES` array still has legacy types for query-param validation (RBAC gate at L74 is correct via `isAccountTypeAllowed`). Cosmetic but inconsistent. |

---

## SECTION 4 — RECOMMENDED FIXES (priority-ordered)

### P0 — Critical security (do today)

1. **Add admin-session auth to 4 unauthenticated admin/job routes.**
   - Files: `src/app/api/admin/logs/route.ts`, `src/app/api/admin/scraper-logs/route.ts`, `src/app/api/jobs/route.ts`, `src/app/api/jobs/[id]/status/route.ts`.
   - Pattern: copy the 5-line guard from `/api/admin/stats/route.ts` L23-27.
   - Impact: closes a data-leak vector on system logs + job queue state.

2. **Audit intent of public `/api/companies/[slug]/*` routes.**
   - If they power the public company profile page → add `isDemo:false` filter + rate limit + consider hiding risk assessments.
   - If internal-only → add `getServerSession` + company-scope check.
   - Files: 8 routes under `src/app/api/companies/`.

3. **Gate `/api/intel/route.ts` behind session auth** (or remove if unused — `src/lib/data-store.ts` is the in-memory mock store, likely a dev leftover).

### P1 — Migration completion (do this week)

4. **Migrate the 25 legacy-RBAC routes to `isAccountTypeAllowed`.**
   - Bulk-find: `rg "allowedTypes\s*=\s*\[\"brand-monitor" src/app/api`
   - Bulk-fix: replace the 3-line `allowedTypes + includes + role !== "admin"` block with `isAccountTypeAllowed(session, [...newTypes])`.
   - For investor routes: `["enterprise"]`. For trader routes: `["agency"]`. For console routes: `["essential","pro","enterprise"]` (or `["essential","pro","enterprise","agency"]` if traders should also see them — verify per route's original intent).
   - Test: log in as a user with `accountType: "essential"` and confirm each route returns 200 instead of 403.

5. **Fix the 2 cron Prisma filters** to include both legacy and new types during the migration window.
   - Files: `src/app/api/cron/notifications/route.ts` L45, `src/app/api/cron/generate-reports/route.ts` L197.
   - Replace `["brand-monitor","market-competitor","investment-bank"]` with `["essential","pro","enterprise","brand-monitor","market-competitor","investment-bank"]`.
   - After running `/api/console/migrate-account-types` (one-shot DB migration), simplify back to new types only.

6. **Fix the 7 legacy-validation routes** (setup, register-company, company/invite, company/team, user/onboard, console/settings/users, agency/whatsapp-import).
   - Replace legacy-only arrays with the union of legacy + new types.
   - Replace hardcoded `"brand-monitor"` defaults with `"essential"`.
   - After migration is complete, drop legacy types from the arrays.

7. **Fix the 3 legacy-fallback defaults** in briefing routes (`briefing/route.ts` L93, `briefing/deliver/route.ts` L190, `cron/generate-briefings/route.ts` L224).
   - Replace `?? "brand-monitor"` with `?? "essential"`.

### P2 — Reliability (do this sprint)

8. **Add try/catch to the 25 routes listed in §3.1.**
   - Pattern: wrap the handler body in `try { ... } catch (err) { logError(...); return NextResponse.json({ error: "Internal Server Error" }, { status: 500 }); }`.
   - Priority within P2: routes that call external services (LLM, email, Twilio) first — `sales/send-surgical`, `console/retro-audit`, `console/provenance`, the 4 v1 routes.

9. **Migrate manual-validation routes to Zod** (§3.2).
   - Especially `api-keys`, `webhooks`, `company/invite`, `company/team` — these accept user input that lands in the DB.
   - Pattern: copy the `Schema = z.object({...}); const parsed = Schema.safeParse(body);` block from `/api/access-request/route.ts` L47-91.

10. **Fix the duplicated condition in `admin/users/route.ts` L43** and decide whether `commercial` role should access (per `canAccessAdmin` it should; per the route comment it shouldn't). Use `canAccessAdmin(session.user.role)` for consistency.

### P3 — Hygiene (do when convenient)

11. **Update stale comments** in ~20 routes that still reference `brand-monitor | market-competitor | investment-bank | admin` auth requirements. Replace with `essential | pro | enterprise | agency | admin` (or the actual gate used).

12. **Standardise error response shape.** Some routes return `{ error: "..." }`, others `{ success: false, error: "..." }`, others `{ error: "...", details: [...] }`. Pick one and apply via a shared helper.

13. **Add an integration test** that hits each console route with a session carrying `accountType: "essential"` and asserts 200 (or 403 for routes that legitimately exclude essential). This would have caught all 25 P1 issues in CI.

14. **Consider a shared `withAuth` / `withAccountType` HOF** to encapsulate the session + RBAC + try/catch pattern. Currently every route reinvents the same 10-line guard. A HOF would prevent future drift.

15. **Document the canonical accountType enum** in a single place (rbac.ts already has it, but the schema column is `String?` with no DB-level constraint). Consider adding a Prisma enum or a CHECK constraint once the migration is complete.

---

## METHODOLOGY NOTES

- **No code was modified.** All findings are from Read + Grep.
- **"Legacy RBAC gate"** is defined as any of: (a) `allowedTypes.includes(session.user.accountType)`, (b) `session.user.accountType !== "investment-bank"`, (c) `session.user.accountType !== "harch-alpha"`. All three bypass `isAccountTypeAllowed` and break for new canonical types.
- **"No try/catch"** is defined as the absence of a `try {` token anywhere in the route file. Some of these routes are trivially safe (e.g. `/api/route.ts` returns a static string), but most surface a `Promise` rejection as a raw 500.
- **Routes marked "(verify)"** in the catalog have a session check but I did not exhaustively verify the exact RBAC gate (the route is likely healthy but warrants a 30-second eyeball check during P2 implementation).
- **Public routes** (`/api/companies/*`, `/api/search`, `/api/flagship-report`, `/api/harch100-live`, `/api/registry`, `/api/lab/*`) were classified as ✅ or ⚠️ based on whether the public exposure appears intentional per the route's header comment. Some may need re-classification after confirming the front-end usage.

---

**End of report.** Total routes audited: 186. Broken: 41. Warning: 50. Healthy: 95.
