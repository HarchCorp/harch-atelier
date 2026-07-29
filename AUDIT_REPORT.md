# AUDIT REPORT — harch-atelier

**Task ID:** AUDIT-1
**Agent:** Explore (audit)
**Date:** 2026-07-29
**Repo:** `/home/z/my-project/work/harch-atelier`
**Références:** `business_plan_v2.md`, `HARCH_DESIGN_SYSTEM_V2.md`, `HARCH_CORP_MASTER_VISION.md`

---

## 1. EXECUTIVE SUMMARY

Le repo `harch-atelier` est un projet Next.js 16 / React 19 / Prisma / BullMQ volumineux (913 fichiers `src/` trackés + ~1466 fichiers junk trackés). L'implémentation couvre largement le périmètre fonctionnel du business plan (dashboard, WhatsApp, PDF, Harch 100, scraping, AI visibility, analyse par entité, pricing 5K/15K/50K MAD/mois) avec **62 routes sous `/atelier/`**. Cependant, l'audit révèle **3 bloquants critiques** : (1) le schema Prisma actif (`prisma/schema.prisma`) est le schema Next.js starter par défaut (User+Post, SQLite) — totalement out of sync avec le vrai schema (`prisma/prisma/schema.prisma`, PostgreSQL, 14 modèles), causant **80 erreurs TypeScript** et rendant l'app non fonctionnelle en runtime ; (2) des **témoignages clients falsifiés** dans `ProductsPage.tsx` + `CustomersPage.tsx` + `AtelierLanding.tsx` (dead code) — violation directe des "Interdictions absolues" du MASTER_VISION ; (3) **8 offres d'emploi fictives** dans `CareersPage.tsx` avec bénéfices faux (MacBook Pro M3, equity) pour un projet solo-founder. S'ajoutent : violations massives du Design System V2 (couleurs hex custom partout, accent slate au lieu de stone-500, JetBrains Mono au lieu de Space Mono, pas d'interaction Tesla-style, pas de "forge sparks"), **61 MB de `skills/` (toolkit interne agent) commité par erreur**, et 4 ans de "Building in Public since 2024" probablement faux. Aucune clé API hardcodée détectée. Le pricing affiché est conforme au business plan.

---

## 2. STRUCTURE DU REPO

| Dossier / Fichier | Fichiers trackés | Taille | Statut | Verdict |
|---|---|---|---|---|
| `src/app/` (routes + API) | ~700 | n/a | Code produit | **Conserver** |
| `src/components/` | ~120 | n/a | UI components | **Conserver** |
| `src/lib/` | ~50 | n/a | Libs (ai, db, queue, scrapers, analyzers, harchiq) | **Conserver** |
| `src/data/` | ~25 | n/a | Data files (mock, generated SEO pages) | **Conserver** |
| `src/hooks/` | ~5 | n/a | React hooks | **Conserver** |
| `prisma/schema.prisma` | 1 | <1KB | **MAUVAIS schema** (Next.js starter default) | **P0 — remplacer** |
| `prisma/prisma/schema.prisma` | 1 | 10KB | **Vrai schema** (14 modèles PostgreSQL) | **P0 — déplacer au top-level** |
| `prisma/prisma/migrations/` | 2 | n/a | Migration SQLite-style incohérente avec PostgreSQL | **P0 — régénérer** |
| `skills/` | **~1076** | **61 MB** | Toolkit interne agent (PDF, docx, pptx, ASR, LLM, VLM, image-gen, etc.) | **P0 — SUPPRIMER** (commit accidentel) |
| `src-v27-backup/` | 170 | 2.2 MB | Backup ancienne version `src/` | **P1 — SUPPRIMER** |
| `.qa/` | 148 | 44 MB | Screenshots QA PNG | **P1 — SUPPRIMER** (gitignored mais encore tracké) |
| `tool-results/` | 47 | 4 MB | Outputs d'outils internes (read_*.txt, bash_*.txt) | **P1 — SUPPRIMER** |
| `agents/` | 4 | 20KB | Scripts standalone (media-scraper, alert-detector, orchestrator, reputation-scorer) | **P2 — évaluer** (exclu tsconfig) |
| `examples/websocket/` | 2 | 20KB | Exemples de code | **P2 — SUPPRIMER** |
| `mini-services/signal-pulse/` | 5 | 32KB | Projet TS séparé non lié | **P2 — SUPPRIMER** |
| `agent-ctx/` | 2 | <1KB | Contextes figma d'agents | **P2 — SUPPRIMER** |
| `harch-handover/` | 2 | 64KB | Script deploy + tar.gz v16 | **P2 — SUPPRIMER** |
| `.zscripts/` | 7 | <1KB | Scripts internes dev | **P2 — SUPPRIMER** (déjà gitignored) |
| `docs/` | 1 | <1KB | `competitive-analysis.md` | **Conserver** |
| `messages/` | 2 | <1KB | i18n en/fr | **Conserver** |
| `public/` | 315 | n/a | Assets | **Conserver** |
| `db/custom.db` | 1 | n/a | SQLite DB | **P1 — vérifier** (incohérent avec PostgreSQL du vrai schema) |
| `src/app/HomePageClient.tsx.backup-1783720835` | 1 | 88KB | Backup de fichier | **P1 — SUPPRIMER** |
| `qa-dashboard-final.png`, `qa-section-placeholder.png`, `qa-sidebar-collapsed.png` (root) | 3 | 468KB | Screenshots QA root | **P1 — SUPPRIMER** |
| `.env` | 1 | 50B | `DATABASE_URL=file:/home/z/my-project/db/custom.db` | **P0** — incompatible avec PostgreSQL du vrai schema |
| Configs (`package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `components.json`, `postcss.config.mjs`, `eslint.config.mjs`, `Caddyfile`, `vercel.json`) | 9 | n/a | OK | **Conserver** |

**Total junk tracké : ~1466 fichiers (~112 MB) pour ~913 fichiers `src/` utiles.** Le junk est 1,6× le code produit.

---

## 3. LISTE DES ROUTES `/atelier/` (62 routes)

Légende statut : ✅ Fonctionnelle (compile, pas d'erreur TS bloquante hors Prisma) · ⚠️ Problèmes mineurs (design / contenu) · ❌ Cassée (runtime/TS) · 🪦 Placeholder / dead code

| # | Route | Page component | Statut | Notes |
|---|---|---|---|---|
| 1 | `/atelier` | `AtelierHome.tsx` (4247 lignes) | ⚠️ | Pas d'interaction Tesla-style (2 useState pour form seulement). Pas de "forge sparks". Couleurs hex custom. |
| 2 | `/atelier/about` | `AboutPage.tsx` | ⚠️ | "Building in Public since Jan 2024" — date probablement fausse (business plan daté 2026-07). Founder real (Amine). Pas de fake dirigeants. |
| 3 | `/atelier/approach/our-ai` | `OurAIPage.tsx` | ✅ | — |
| 4 | `/atelier/approach/our-commitment` | `OurCommitmentPage.tsx` | ✅ | — |
| 5 | `/atelier/approach/our-data` | `OurDataPage.tsx` | ✅ | — |
| 6 | `/atelier/ask-harchiq` | `AskHarchIQPage.tsx` | ✅ | — |
| 7 | `/atelier/audit` | `AuditPage.tsx` | ✅ | Form OK. POST `/atelier/api/audit` est async (BullMQ) — mais la page semble attendre une réponse synchrone (à vérifier). |
| 8 | `/atelier/blog` | `BlogIndexPage.tsx` | ✅ | 15 articles pré-écrits dans `articles.ts`. |
| 9 | `/atelier/blog/[slug]` | `ArticlePage.tsx` | ✅ | — |
| 10 | `/atelier/careers` | `CareersPage.tsx` | ❌ **P0** | **8 offres d'emploi fictives** (Senior Full-Stack, NLP/ML Engineer, etc.) avec bénéfices faux (MacBook Pro M3, equity, 5K MAD/year learning). Violation MASTER_VISION "annoncer une filiale comme operational si elle ne l'est pas". |
| 11 | `/atelier/changelog` | `ChangelogPage.tsx` | ✅ | — |
| 12 | `/atelier/companies/attijariwafa-bank` | `CompanyPage.tsx` | ⚠️ | Données mock (score 84, 342 articles). Pas de disclaimer "illustratif". |
| 13 | `/atelier/companies/bank-of-africa` | `CompanyPage.tsx` | ⚠️ | Idem — score 72, données mock. |
| 14 | `/atelier/companies/maroc-telecom` | `CompanyPage.tsx` | ⚠️ | Idem — score 79. |
| 15 | `/atelier/companies/ocp-group` | `CompanyPage.tsx` | ⚠️ | Idem — score 91, "#1 in Harch 100". |
| 16 | `/atelier/companies/royal-air-maroc` | `CompanyPage.tsx` | ⚠️ | Idem — score 76. |
| 17 | `/atelier/compare` | `ComparePage.tsx` | ✅ | — |
| 18 | `/atelier/contact` | `ContactPage.tsx` | ✅ | — |
| 19 | `/atelier/customers` | `CustomersPage.tsx` | ❌ **P0** | **4 case studies falsifiés** : "Top 3 Moroccan Bank", "Pan-African Telco Operator", "Moroccan Mining Leader", "African Government Agency" — avec quotes fausses (Tourang Nazari, Matt Cross, etc.). Violation MASTER_VISION. |
| 20 | `/atelier/dashboard` | `DashboardPage.tsx` | ❌ **P1** | Appelle `POST /atelier/api/audit` au mount **sans auth** → 401 systématique. Attend `json.success` mais l'API retourne `{ jobId, status, pollUrl }`. Bug runtime. |
| 21 | `/atelier/decision-augmentation` | `DecisionAugmentationPage.tsx` | ✅ | — |
| 22 | `/atelier/expertise/enterprise-risk` | `ExpertisePageTemplate.tsx` | ✅ | — |
| 23 | `/atelier/expertise/esg` | `ExpertisePageTemplate.tsx` | ✅ | — |
| 24 | `/atelier/expertise/pr-comms` | `ExpertisePageTemplate.tsx` | ✅ | — |
| 25 | `/atelier/expertise/regulation` | `ExpertisePageTemplate.tsx` | ✅ | — |
| 26 | `/atelier/expertise/reputation-risk` | `ExpertisePageTemplate.tsx` | ✅ | — |
| 27 | `/atelier/faq` | `FAQPage.tsx` | ✅ | — |
| 28 | `/atelier/glossary` | `GlossaryPage.tsx` | ✅ | — |
| 29 | `/atelier/harch-100` | `Harch100Page.tsx` (1511 lignes) | ❌ **P1** | **25 companies** (pas 100) avec scores mock fabriqués (OCP 91, Attijariwafa 84, Maroc Telecom 79, RAM 76, BoA 72). Aucun disclaimer "données illustratives". Risque légal : présente des scores faux pour de vraies entreprises cotées. |
| 30–35 | `/atelier/industries/{aviation,banking,energy,mining,retail,telecom}` | `IndustryPage.tsx` (template) | ⚠️ | Données mock non disclaimer. |
| 36–40 | `/atelier/insight-reports/{deep-dive,media-impact,reputation-risk,reputation,risk}` | `InsightReportTemplate.tsx` | ✅ | — |
| 41 | `/atelier/insights` | `InsightsPage.tsx` | ✅ | — |
| 42 | `/atelier/intelligence` | `IntelligencePage.tsx` | ✅ | — |
| 43 | `/atelier/legal` | `LegalPage.tsx` | ✅ | — |
| 44 | `/atelier/media-intelligence` | `MediaIntelligencePage.tsx` | ✅ | — |
| 45 | `/atelier/method` | `MethodPage.tsx` | ✅ | — |
| 46 | `/atelier/news` | `NewsPage.tsx` | ✅ | — |
| 47 | `/atelier/partners` | `PartnersPage.tsx` | ⚠️ | Programmes partenaires marketing (20% commission, white-label, etc.) — aspirational pour un produit sans clients. Borderline. |
| 48 | `/atelier/pricing` | `PricingPage.tsx` | ✅ | **Pricing conforme au business plan** : Starter 5K MAD/mois, Pro 15K MAD/mois, Enterprise 50K+/mois. ✅ |
| 49 | `/atelier/products` | `ProductsPage.tsx` | ❌ **P0** | **4 témoignages falsifiés** (Tourang Nazari / "Moroccan Financial Institution", Matt Cross / "African Holdings Group", "Communications Lead" / "International NGO", "PR Agency Director"). Mêmes quotes que CustomersPage. |
| 50 | `/atelier/products/api-mcp` | `ApiMcpPage.tsx` | ✅ | — |
| 51 | `/atelier/products/enterprise-risk-intelligence` | `EnterpriseRiskIntelligencePage.tsx` | ✅ | — |
| 52 | `/atelier/products/integrations` | `IntegrationsPage.tsx` | ✅ | — |
| 53 | `/atelier/products/reputation-dashboards` | `ReputationDashboardsPage.tsx` | ✅ | — |
| 54 | `/atelier/reputation-tracker` | `ReputationTrackerPage.tsx` | ⚠️ | Top 100 marocain — mock. |
| 55 | `/atelier/resources` | `ResourcesPage.tsx` | ✅ | — |
| 56 | `/atelier/risk-tracker` | `RiskTrackerPage.tsx` | ⚠️ | 32 catégories de risque mock. |
| 57 | `/atelier/security` | (redirige probablement vers trust) | ✅ | — |
| 58 | `/atelier/solutions` | `SolutionsPage.tsx` | ✅ | — |
| 59 | `/atelier/templates` | `TemplatesGallery.tsx` | ✅ | — |
| 60 | `/atelier/templates/institutional-audit` | (template page) | ✅ | — |
| 61 | `/atelier/trust` | `TrustPage.tsx` | ✅ | — |
| 62 | `/atelier/use-cases` | `UseCasesPage.tsx` | ✅ | — |

**Routes API sous `/atelier/api/` :** 4 routes (`audit`, `harch100`, `scrape`, `whatsapp`) — toutes implémentées, `audit` est async (BullMQ + Prisma Job). ⚠️ Ces routes planteront en runtime tant que le schema Prisma n'est pas fixé (cf. §4).

**Dead code :** `AtelierLanding.tsx` (2195 lignes) — non importé nulle part, contient aussi des testimonials. À supprimer.

**Bilan routes :** 62 routes, dont ~45 ✅, ~10 ⚠️ (mock data sans disclaimer), **4 ❌ P0** (testimonials/case studies falsifiés + 8 fake jobs), **2 ❌ P1** (dashboard bug runtime, Harch 100 scores faux sans disclaimer).

---

## 4. ERREURS TYPESCRIPT

**Commande :** `npx tsc --noEmit` (avec `bun install` préalable, 974 packages installés)
**Résultat : 80 erreurs TypeScript**, toutes causées par **une seule root cause** : le schema Prisma actif est le mauvais.

### Root cause unique

| Fichier actif | Contenu | Devrait être |
|---|---|---|
| `prisma/schema.prisma` (32 lignes) | Default Next.js starter : `User { id, email, name, createdAt, updatedAt }` + `Post { id, title, content, published, authorId, ... }`, provider `sqlite` | Le contenu de `prisma/prisma/schema.prisma` (340 lignes, 14 modèles : `Company`, `Article`, `SentimentScore`, `RiskAssessment`, `ReputationScore`, `AIVisibility`, `Entity`, `EntityMention`, `GLMAnalysis`, `Job`, `ScraperLog`, `SystemLog`, `AuditLog`, `User` étendu + `Account`/`Session`/`ApiKey`/`VerificationToken`), provider `postgresql` |

### Top 10 fichiers en erreur

| Fichier | Nb erreurs |
|---|---|
| `src/lib/queue/workers/nlp-worker.ts` | 9 |
| `src/lib/queue/workers/full-audit-worker.ts` | 9 |
| `src/app/api/companies/[slug]/entities/route.ts` | 7 |
| `src/lib/queue/workers/scraper-worker.ts` | 5 |
| `src/lib/auth/auth.config.ts` | 4 |
| `src/app/atelier/api/audit/route.ts` | 4 |
| `src/app/api/jobs/route.ts` | 3 |
| `src/app/api/cron/dispatch/route.ts` | 3 |
| `src/app/api/companies/[slug]/sentiment/route.ts` | 3 |
| `src/app/api/companies/[slug]/risks/route.ts` | 3 |

### Types d'erreurs

- `TS2339: Property 'X' does not exist on type 'PrismaClient<...>'` — pour `company`, `article`, `entity`, `entityMention`, `sentimentScore`, `riskAssessment`, `reputationScore`, `aIVisibility`, `job`, `gLMAnalysis`, `scraperLog`, `systemLog` (modèles absents du schema actif)
- `TS2339: Property 'passwordHash'/'role'/'plan' does not exist on type 'User'` — champs absents du User du schema actif
- `TS2353: Object literal may only specify known properties, and 'plan'/'role' does not exist in type 'UserSelect<DefaultArgs>'` — select de champs inexistants
- `TS2724: 'Prisma' has no exported member named 'JobWhereInput'. Did you mean 'PostWhereInput'?`
- `TS2345: Argument of type 'string | null' is not assignable to parameter of type 'string | undefined'` (2 occurrences dans `api/intel/route.ts`)

### Incohérences additionnelles Prisma

- `.env` contient `DATABASE_URL=file:/home/z/my-project/db/custom.db` (SQLite) — incompatible avec `provider = "postgresql"` du vrai schema
- Le migration SQL (`prisma/prisma/migrations/20260719071044_aegis_v4_init/migration.sql`) utilise `DATETIME`, `REAL`, `TEXT` (syntaxe SQLite) — incompatible avec PostgreSQL
- Le `db/custom.db` (SQLite) est donc une DB orpheline — aucune des tables attendues n'existe

### Fix

1. Remplacer `prisma/schema.prisma` par le contenu de `prisma/prisma/schema.prisma`
2. Supprimer `prisma/prisma/` (nested) et le `db/custom.db`
3. Configurer `.env` avec `DATABASE_URL=postgresql://...` + `DIRECT_URL=postgresql://...` (Neon ou similaire)
4. `bunx prisma migrate reset --force` + `bunx prisma generate`
5. Les 80 erreurs TS devraient disparaître

---

## 5. VIOLATIONS DU MASTER_VISION.md

Le MASTER_VISION liste des **"Interdictions absolues"** (§PROTOCOLE BOOT). Audit :

| # | Interdiction | Violation | Fichier(s) | Gravité |
|---|---|---|---|---|
| V1 | ❌ Ne JAMAIS ajouter des témoignages falsifiés | **4 témoignages fake** dans `ProductsPage.tsx` (lignes 153-178) : "Tourang Nazari" / "Moroccan Financial Institution", "Matt Cross" / "African Holdings Group", "Communications Lead" / "International NGO", "PR Agency Director". Mêmes quotes dupliquées dans `CustomersPage.tsx` (CASE_STUDIES). + 3 témoignages fake dans `AtelierLanding.tsx` (dead code, lignes 1150-1176) : "Fondateur / legal-seed.com", "Direction / ciment-dam.com", "CMO / Client SaaS B2B". | `src/app/atelier/products/ProductsPage.tsx`, `src/app/atelier/customers/CustomersPage.tsx`, `src/app/atelier/AtelierLanding.tsx` | **P0** |
| V2 | ❌ Ne JAMAIS inventer des clients | **4 clients fictifs** dans `CustomersPage.tsx` : "Top 3 Moroccan Bank", "Pan-African Telco Operator", "Moroccan Mining Leader", "African Government Agency" — avec résultats chiffrés faux ("40h/week saved", "+18 pts sentiment", "5 incidents prevented", "40+ officials briefed"). | `src/app/atelier/customers/CustomersPage.tsx` | **P0** |
| V3 | ❌ Ne JAMAIS inventer des dirigeants | OK — pas de dirigeants fictifs trouvés. Seul le vrai founder (Amine Harch El Korane) est mentionné sur `/atelier/about`. | — | ✅ |
| V4 | ❌ Ne JAMAIS annoncer une filiale comme "operational" si elle ne l'est pas | **8 offres d'emploi fictives** dans `CareersPage.tsx` (Senior Full-Stack Engineer, NLP/ML Engineer, Senior Account Executive, Customer Success Manager, PR & Comms Analyst, DevOps Engineer, Product Designer, Business Development Intern) avec bénéfices faux ("MacBook Pro M3, 27\" display", "Above-market compensation, equity", "5,000 MAD/year learning budget", "Hybrid work 3/2"). Le nav (`tokens.ts:157`) dit "8 open roles". | `src/app/atelier/careers/CareersPage.tsx`, `src/app/atelier/components/tokens.ts` | **P0** |
| V5 | ❌ Ne JAMAIS exposer des clés API ou mots de passe | OK — `.env` ne contient que `DATABASE_URL`. Aucune clé `sk-`, `ghp_`, `AIza`, `pk_live_`, `sk_live_`, `xoxb-`, `AKIA`, `BEGIN PRIVATE KEY` détectée dans `src/`. | — | ✅ |
| V6 | ❌ Ne JAMAIS supprimer ce fichier de boot | OK (fichier externe au repo) | — | ✅ |
| V7 | ❌ Ne JAMAIS modifier ce fichier sans validation Amine | OK (fichier externe) | — | ✅ |

### Violations additionnelles (obligations positives)

| # | Obligation | Violation | Gravité |
|---|---|---|---|
| O1 | ✅ Toute nouvelle page du site doit inclure le disclaimer ("Harch Corp est un projet en construction...") | Aucune page `/atelier/` ne contient le disclaimer "Capacités opérationnelles actuelles en phase d'amorçage". Le footer dit seulement "Building in Public · Since 2024 · Casablanca, Morocco". | **P1** |
| O2 | ✅ Tout PDF publié doit être sourcé et vérifié | PDF templates (`InstitutionalAuditTemplate.tsx`, `ReputationAuditTemplate.tsx`) contiennent des données mock ("Resolve labor dispute with union before Q3 results", "23 articles with negative sentiment in 30 days"). Non sourcés. | **P2** |
| O3 | ✅ Tout commit doit être documenté dans le worklog | Le worklog partagé `/home/z/my-project/worklog.md` n'existait pas avant cet audit. | **P3** (corrigé par ce rapport) |

### Données fabricées sur vraies entreprises cotées

Le `Harch100Page.tsx` affiche 25 entreprises réelles (OCP, Attijariwafa, Maroc Telecom, RAM, BoA, CIH, Managem, Label'Vie, Lydec, Total Maroc, Shell Maroc, Holcim, Sonasid, Risma, Disway, Stokvis, Maghreb Oxygene, Inwi, Cosumar, LesieurCristal, etc.) avec **scores de réputation fabriqués** (OCP 91, Attijariwafa 84, Maroc Telecom 79, RAM 76, BoA 72, etc.) et **indicateurs fake** (sentiment 82, 342 articles, aiRank "#1", riskLevel "moderate", riskDimensions: geopolitical 58, operational 75, environmental 80...). **Aucun disclaimer** "données illustratives / non mesurées". C'est juridiquement risqué : une entreprise cotée pourrait attaquer pour dénigrement (si score bas) ou publicité mensongère (si client paie sur la base de ces scores).

Idem pour les 5 `/atelier/companies/*` et les 6 `/atelier/industries/*`.

---

## 6. VIOLATIONS DU DESIGN SYSTEM V2

### 6.1 Polices

| Règle | Constat | Gravité |
|---|---|---|
| `'Inter', system-ui, sans-serif` pour display/body | ✅ Respecté partout (cité dans 50+ fichiers) | — |
| `'Space Mono', monospace` pour data/numbers/code | ❌ **'JetBrains Mono' utilisé partout** (cité dans 30+ fichiers : `atelier.css`, `tokens.ts`, `themes.ts`, `AtelierHome.tsx`, `PricingPage.tsx`, `AboutPage.tsx`, `AuditPage.tsx`, `CustomersPage.tsx`, `Harch100Page.tsx`, `BlogIndexPage.tsx`, `ArticlePage.tsx`, `IndustryPage.tsx`, etc.) | **P1** |
| Jamais de serif | ✅ Aucun serif détecté | — |

### 6.2 Couleurs

| Règle | Constat | Gravité |
|---|---|---|
| Backgrounds : `bg-neutral-950` / `bg-white` / `bg-neutral-50` / `bg-neutral-900` | ❌ Hex custom `#FAFAFA` (bg), `#FFFFFF` (surface), `#F4F4F5` (surfaceAlt), `#0A0A0A` (dark bg), `#0D0D0D`/`#121212`/`#141414`/`#1A1A1A`/`#1E1E1E` (surfaces sombres) — définis en constantes `C` et inline styles. **Présent dans 100% des pages atelier.** | **P1** |
| Text : `text-neutral-950/600/500/400` | ❌ Hex custom `#0A0A0A`, `#525252`, `#71717A`, `rgba(0,0,0,0.40/0.60)` | **P1** |
| Borders : `border-neutral-200/800` | ❌ Hex `#E5E5E5`, `#F0F0F0`, `#D4D4D8`, `#1E1E1E` | **P1** |
| Primary CTA : `bg-emerald-500` | ❌ Aucun `bg-emerald-500` dans les pages atelier. Le CTA utilise `#4A5D6E` (accentDark) ou `#4A7B5F` (sage). | **P1** |
| Accent Atelier : `stone-500` | ❌ Accent utilisé = `#8B9DAF` / `#4A5D6E` (slate bleu-gris). **Ce n'est PAS `stone-500`** (`#78716c`). | **P1** |
| Pas de couleurs custom hex | ❌ ~100+ occurrences de hex custom dans `src/app/atelier/**/*.tsx` | **P1** |
| Pas de `transition-all` | À vérifier (non bloquant) | P3 |

### 6.3 Formes & composants

| Règle | Constat | Gravité |
|---|---|---| 
| Boutons primary : `bg-emerald-500 px-8 py-4 text-sm uppercase tracking-wider` | ❌ Boutons utilisent `#4A5D6E` ou gradients, padding variés | P1 |
| Cartes : `rounded-2xl border p-8 shadow-sm` | ⚠️ Cards utilisent `borderRadius: "8px"` ou `"12px"` au lieu de `rounded-2xl` (16px). Padding variable `p-6/p-8`. | P2 |
| Badges : `rounded-full px-4 py-1.5 text-xs uppercase tracking-wider` | ⚠️ Badges arrondis mais tailles variables | P3 |

### 6.4 Détail visuel unique par filiale

| Règle | Constat | Gravité |
|---|---|---|
| Atelier : "Forge sparks" (petits points éparpillés) | ❌ **Aucun** motif "forge sparks" / "scintillements" / particules éparpillées trouvé dans `AtelierHome.tsx`, `shared.tsx`, ou `atelier.css`. "Spark" apparaît uniquement dans "Sparkline" (data viz). | **P1** |

### 6.5 Interaction Tesla-style (OBLIGATOIRE)

| Règle | Constat | Gravité |
|---|---|---|
| Chaque page DOIT avoir au moins une section interactive style Tesla (3 boutons en bas d'une section qui changent le contenu d'un grand écran/mockup) | ❌ **`AtelierHome.tsx` n'a que 2 `useState`** (tous deux pour le form CTA : `submitted` et `form`). Aucun `setActiveTab` / `setActiveView` / pattern 3-boutons. Les mockups (HeroDashboardMockup, WhatsAppMockup, DashboardMockup) sont **statiques** (SVG fixe). | **P1** |

### 6.6 Tailles standard

| Règle | Constat | Gravité |
|---|---|---|
| H1 Hero : `text-4xl sm:text-6xl lg:text-7xl` | ⚠️ H1 utilise `fontSize: "clamp(40px, 6vw, 68px)"` — équivalent fonctionnel mais pas la classe Tailwind standard | P3 |
| H2 Section : `text-2xl md:text-4xl` | ⚠️ Idem `clamp` | P3 |
| Padding sections : `py-20 md:py-32` | ⚠️ Padding inline `padding: "100px 32px 80px"` (correct mais non standard) | P3 |

### Bilan design system

Le `atelier.css` et `tokens.ts` codent en dur une palette custom (`#FAFAFA`, `#0A0A0A`, `#4A5D6E`, `#8B9DAF`, `#4A7B5F`, `#6FA386`, `#A0524B`, `#B87333`) qui **ne respecte aucun** des principes du Design System V2 (neutral-* + emerald-500 + accent stone-500). Toute la codebase atelier est à refondre pour utiliser les classes Tailwind du design system.

---

## 7. FICHIERS / DOSSIERS À SUPPRIMER

### P0 — Suppression immédiate (commit accidentel avéré)

| Cible | Raison | Action |
|---|---|---|
| `skills/` (61 MB, ~1076 fichiers trackés) | Toolkit interne agent (PDF, docx, pptx, ASR, LLM, VLM, image-gen, video-understand, web-reader, web-search, skill-creator, etc.) — aucun rapport avec le produit Harch Atelier. Probablement commité par erreur lors d'un `git add .` trop large. Déjà exclu du `tsconfig.json` (`"exclude": [..., "skills", ...]`) ce qui confirme que c'est connu comme non-code-produit. | `git rm -r skills/` |
| `src/app/atelier/AtelierLanding.tsx` (2195 lignes) | Dead code — non importé par aucun `page.tsx` (la route `/atelier/page.tsx` importe `AtelierHome.tsx`). Contient en plus des témoignages falsifiés (violation MASTER_VISION). | `git rm` |
| `prisma/schema.prisma` (32 lignes) | Default Next.js starter schema — faux schema actif. Doit être remplacé par le contenu de `prisma/prisma/schema.prisma`. | `git rm` puis recréer avec le bon contenu |

### P1 — Suppression recommandée

| Cible | Raison |
|---|---|
| `src-v27-backup/` (2.2 MB, 170 fichiers) | Backup d'une ancienne version de `src/`. Inutile en prod. Si nécessaire, déplacer hors repo. |
| `.qa/` (44 MB, 148 PNG) | Screenshots QA. Déjà gitignored mais encore trackés. `git rm -r --cached .qa/` |
| `tool-results/` (4 MB, 47 fichiers) | Outputs d'outils internes (`read_*.txt`, `bash_*.txt`). Déjà gitignored mais encore trackés. |
| `src/app/HomePageClient.tsx.backup-1783720835` (88 KB) | Backup de fichier — pattern `*.backup-*` |
| `qa-dashboard-final.png`, `qa-section-placeholder.png`, `qa-sidebar-collapsed.png` (root, 468 KB) | Screenshots QA root |
| `db/custom.db` | SQLite DB orpheline (le vrai schema est PostgreSQL) |
| `prisma/prisma/` (nested) | Une fois le contenu du schema déplacé au top-level, supprimer le nested |

### P2 — Suppression facultative

| Cible | Raison |
|---|---|
| `agents/` (4 fichiers .ts) | Scripts standalone déjà exclus du tsconfig. Vérifier s'ils sont utilisés par un cron externe. |
| `examples/websocket/` (2 fichiers) | Exemples de code — pas nécessaire en prod |
| `mini-services/signal-pulse/` (5 fichiers) | Projet TS séparé — pas intégré au build Next.js |
| `agent-ctx/` (2 fichiers markdown) | Contextes figa d'agents — pas lié au produit |
| `harch-handover/` (deploy-to-github.sh + harch-v16-src.tar.gz) | Artifacts de handover — archive externe si nécessaire |
| `.zscripts/` (7 fichiers) | Scripts dev internes — déjà gitignored mais trackés |

---

## 8. FEATURES PROMISES DANS `business_plan_v2.md` — COUVERTURE

### 8.1 Livrables principaux (§1)

| Livrable | Statut | Détail |
|---|---|---|
| Dashboard temps réel | ✅ Implémenté (mock) | `/atelier/dashboard` + `/atelier/reputation-tracker` + `/atelier/risk-tracker`. Données mock, pas branché sur vraie DB (Prisma cassé). |
| WhatsApp Daily Digest | ✅ Implémenté | `POST /atelier/api/whatsapp` + `src/lib/analyzers/orchestrator.ts:generateWhatsAppDigest()`. WhatsApp mock preview dans `AtelierHome`. |
| Monthly Report PDF board-ready | ✅ Implémenté (template) | `src/app/atelier/components/pdf-templates/ReputationAuditTemplate.tsx` + `InstitutionalAuditTemplate.tsx` (react-pdf). Données mock. |

### 8.2 Analyses (§1)

| Feature | Statut | Fichier(s) |
|---|---|---|
| Sentiment analysis par entité | ✅ | `src/lib/analyzers/sentiment-analyzer.ts` |
| Trend detection | ✅ | `detectTrends()` |
| Competitor benchmarking (share of voice) | ✅ | `/atelier/compare` + `share-of-voice.tsx` dataviz |
| Crisis alerting (seuil WhatsApp) | ⚠️ Partiel | `alert-detector.ts` (standalone, exclu tsconfig) + `detectTrends(t.alert)` mais pas de worker d'envoi WhatsApp réel |
| AI visibility (ChatGPT cite le client?) | ✅ | `src/lib/ai/glm-orchestrator.ts` + route `/api/cron/ai-visibility` |
| Harch 100 ranking | ⚠️ Partiel | Page existe mais **25 companies** (pas 100) avec scores mock |

### 8.3 Sources (§1)

| Source | Statut |
|---|---|
| 30+ médias marocains | ✅ `src/lib/scrapers/sources-config.ts` + `sources.ts` (à vérifier le compte exact) |
| 10+ médias africains | ⚠️ À vérifier dans `sources-config.ts` |
| Social (Twitter/X, LinkedIn, Facebook public) | ⚠️ Stubs dans `src/lib/harchiq/collect/social-collector.ts` — TODO marqués (Twitter API v2, LinkedIn Marketing API, Facebook Graph API "planned") |
| 4 moteurs IA (ChatGPT, Perplexity, Google AI Overviews, GLM) | ⚠️ `tokens.ts` liste 8 engines (ChatGPT, Perplexity, Google AI Overviews, Gemini, Claude, Copilot, Mistral, Grok). Le business plan dit "4 moteurs IA" — il y en a 8 affichés (scope creep positif). |

### 8.4 Business model (§5)

| Tier | Prix business plan | Prix affiché | Conforme ? |
|---|---|---|---|
| Starter | 5 000 MAD/mois | 5 000 MAD/mois | ✅ |
| Pro | 15 000 MAD/mois | 15 000 MAD/mois | ✅ |
| Enterprise | 50 000+ MAD/mois | 50 000+ MAD/mois | ✅ |
| Investor Report | 100 000+ MAD/an | ❌ **Manquant** | ❌ Aucune route `/atelier/investor-report` ou tier correspondant. Business plan §5 liste "Investor Report 100K+/an" — non implémenté. |

### 8.5 Features manquantes (promises mais absentes)

| Feature promise | Statut |
|---|---|
| **Investor Report** (100K-500K MAD/rapport, secteur trimestriel 50-100 pages) | ❌ Manquant |
| **White-label** pour agences PR (30% revenue share) | ⚠️ Mentionné dans `PartnersPage.tsx` (20% commission — différent du business plan qui dit 30%) mais pas d'implémentation technique |
| **API access** Enterprise (50K MAD/mois) | ✅ `/atelier/products/api-mcp` existe |
| **Crisis consulting** (50-100K MAD/intervention) | ❌ Manquant |
| **Training** "AI reputation management" (20K MAD/jour) | ❌ Manquant |
| **Harch 100 Afrique** (top 100 africaines, M4-M9) | ❌ Manquant — Harch 100 actuel = 25 entreprises marocaines |
| **Multi-tenant** (chaque client a son dashboard) | ❌ Manquant — pas de tenant isolation visible |
| **Disclaimer "Building in Public / phase d'amorçage"** sur toutes les pages | ❌ Manquant (cf. §5) |

### 8.6 Features implémentées non dans le business plan (scope creep)

| Feature | Statut | Verdict |
|---|---|---|
| `/atelier/insight-reports/{risk,reputation-risk,reputation,media-impact,deep-dive}` (5 templates) | ✅ Implémenté | Acceptable —延伸 naturel du "Monthly Report PDF" |
| `/atelier/expertise/{enterprise-risk,reputation-risk,pr-comms,esg,regulation}` (5 pages expertise) | ✅ Implémenté | Acceptable — positionnement marketing |
| `/atelier/industries/{banking,telecom,mining,aviation,retail,energy}` (6 pages industrie) | ✅ Implémenté | Acceptable — SEO + account-based marketing |
| `/atelier/ask-harchiq` (chatbot conversational) | ✅ Implémenté | Scope creep léger — pas dans business plan mais cohérent |
| `/atelier/decision-augmentation` | ✅ Implémenté | Scope creep léger |
| `/atelier/method`, `/atelier/changelog`, `/atelier/glossary`, `/atelier/resources` | ✅ Implémenté | Acceptable — content marketing |
| 8 engines IA au lieu de 4 | ✅ | Scope creep positif (sur-delivery) |
| `/atelier/templates` + `/atelier/templates/institutional-audit` | ✅ Implémenté | Acceptable |
| `/atelier/partners` (4 types de partenaires) | ⚠️ Implémenté mais **aspirational** pour un produit sans clients | Borderline — cf. §5 |

### Bilan couverture business plan

**Features core : 7/8 livrables implémentés** (manque Investor Report). **Features additionnelles : 1/5 implémentées** (API access ; manquent white-label technique, crisis consulting, training, Harch 100 Afrique). **Pricing : 100% conforme**. Toutes les features implémentées utilisent des données mock — aucune n'est branchée sur une vraie DB (Prisma cassé).

---

## 9. RECOMMANDATIONS PRIORISÉES

### P0 — Bloquants (à traiter avant tout déploiement)

| # | Action | Effort | Impact |
|---|---|---|---|
| P0-1 | **Fix Prisma schema** : remplacer `prisma/schema.prisma` par le contenu de `prisma/prisma/schema.prisma`, supprimer le nested, configurer `.env` avec `DATABASE_URL` + `DIRECT_URL` PostgreSQL (Neon), régénérer migration (`prisma migrate reset`), `prisma generate`. Résoudra les **80 erreurs TS**. | 2h | Critique — sans ça, 0 route API ne fonctionne |
| P0-2 | **Supprimer `skills/`** : `git rm -r skills/` (61 MB, ~1076 fichiers). Ajouter `skills/` au `.gitignore` (déjà fait). | 5min | Critique — bloat repo, fuite toolkit interne |
| P0-3 | **Purger témoignages falsifiés** : supprimer `TESTIMONIALS` array dans `ProductsPage.tsx` (lignes 153-178), `CASE_STUDIES` array dans `CustomersPage.tsx` (lignes 30-105), section `<Testimonials />` dans `AtelierLanding.tsx`. Remplacer par section "Building in Public — premiers clients en pilote" ou par des métriques produit (sources trackées, articles analysés, etc.). | 1h | Critique — violation MASTER_VISION, risque juridique |
| P0-4 | **Supprimer `AtelierLanding.tsx`** (2195 lignes dead code contenant testimonials). | 5min | Critique |
| P0-5 | **Purger offres d'emploi fictives** : `CareersPage.tsx` — supprimer `OPEN_ROLES` array (8 jobs fake) et `BENEFITS` array. Remplacer par "We're not hiring yet. We're a solo-founder company in building-in-public mode. Reach out at atelier@harchcorp.com if you want to follow the journey." Mettre à jour `tokens.ts:157` ("8 open roles" → "Not hiring yet"). | 30min | Critique — violation MASTER_VISION |
| P0-6 | **Disclaimer global** : ajouter le disclaimer "Harch Corp est un projet en construction... Capacités opérationnelles actuelles en phase d'amorçage" dans `AtelierNav` ou `AtelierLayout` pour qu'il apparaisse sur les 62 routes `/atelier/`. | 30min | Obligation MASTER_VISION |

### P1 — Haute priorité (à traiter dans la semaine)

| # | Action | Effort |
|---|---|---|
| P1-1 | **Harch 100 disclaimer** : ajouter bandeau "Données illustratives — méthodologie en développement, scores non mesurés en production" sur `/atelier/harch-100`, les 5 `/atelier/companies/*`, les 6 `/atelier/industries/*`, `/atelier/risk-tracker`, `/atelier/reputation-tracker`. Soit étendre à 100 companies, soit renommer en "Harch 25 (preview)". | 1h |
| P1-2 | **Fix dashboard runtime bug** : `DashboardPage.tsx` appelle `POST /atelier/api/audit` au mount sans session → 401 systématique. Soit exiger auth (redirect `/login`), soit créer une route publique `/atelier/api/audit/demo` retournant des données mock. Aussi corriger le contrat : la page attend `json.success` + `json.data` mais l'API retourne `{ jobId, status, pollUrl }` (async). | 1h |
| P1-3 | **Suppression junk P1** : `git rm -r src-v27-backup/ .qa/ tool-results/ && git rm src/app/HomePageClient.tsx.backup-1783720835 qa-*.png`. ~50 MB libérés. | 10min |
| P1-4 | **Migration design system V2** : créer une 2e itération des pages atelier en respectant strictement le DS V2 : (a) remplacer toutes les constantes `C = { bg: "#FAFAFA", ... }` par des classes Tailwind `bg-neutral-50`, `text-neutral-950`, `border-neutral-200` ; (b) remplacer `'JetBrains Mono'` par `'Space Mono'` partout ; (c) remplacer accent `#4A5D6E`/`#8B9DAF` par `stone-500` ; (d) remplacer CTA `#4A5D6E` par `bg-emerald-500` ; (e) ajouter section Tesla-style (3 boutons) sur `AtelierHome` ; (f) ajouter motif "forge sparks" (SVG particules). | 3-5 jours |
| P1-5 | **Vérifier "Building in Public since 2024"** dans `about/page.tsx` et `tokens.ts` — la business plan est datée 2026-07-18, le MASTER_VISION dit "Amine a 16 ans en 2026". Si la date réelle est 2026, corriger en "Since 2026". | 15min |

### P2 — Moyenne priorité (à traiter dans le mois)

| # | Action | Effort |
|---|---|---|
| P2-1 | **Compléter Harch 100 à 100 companies** (actuellement 25) | 1 jour |
| P2-2 | **Implémenter Investor Report tier** (100K+ MAD/an) — route `/atelier/investor-reports` + template PDF 50-100 pages sectoriel | 3-5 jours |
| P2-3 | **Multi-tenant** : isolation des données par client (User → Tenant → Company) | 2-3 jours |
| P2-4 | **Brancher scrapers réels** : combler les TODO dans `src/lib/harchiq/collect/{financial,social}-collector.ts` et `src/lib/harchiq/forensics/osint-tools.ts` (Twitter API v2, LinkedIn Marketing API, Facebook Graph API, Bourse de Casablanca, AMMC, RDAP, exiftool, tls-socket) | 1-2 semaines |
| P2-5 | **Crisis alerting WhatsApp réel** : implémenter le worker d'envoi WhatsApp Business API (Twilio) déclenché par `detectTrends(t.alert)` | 2 jours |
| P2-6 | **White-label technique** : custom branding par tenant (logo, couleurs, domain) | 3-5 jours |
| P2-7 | **Training offering** : page `/atelier/training` (20K MAD/jour) | 1 jour |
| P2-8 | **Suppression junk P2** : `agents/`, `examples/`, `mini-services/`, `agent-ctx/`, `harch-handover/`, `.zscripts/` — vérifier usage puis `git rm` | 30min |
| P2-9 | **Corriger `PartnersPage.tsx`** : 20% commission affiché vs 30% dans business plan. Aligner. | 5min |
| P2-10 | **Cohérence moteur IA** : `tokens.ts` dit "30+ media sources and 4 AI engines" mais liste 8 engines. Aligner le copy. | 5min |

### P3 — Low priority (backlog)

| # | Action |
|---|---|
| P3-1 | Standardiser les tailles H1/H2 avec classes Tailwind DS V2 (`text-4xl sm:text-6xl lg:text-7xl`) au lieu de `clamp()` inline |
| P3-2 | Standardiser les cards (`rounded-2xl border p-8 shadow-sm`) au lieu de `borderRadius: "8px"` inline |
| P3-3 | Créer worklog partagé `/home/z/my-project/worklog.md` (n'existait pas avant cet audit) |
| P3-4 | Documenter l'architecture harchiq (`src/lib/harchiq/` : collect/connect/understand/predict/defend/trace/synthesize/cognitive/forensics) — aucune doc trouvée |
| P3-5 | Vérifier que les 30+ médias marocains dans `sources-config.ts` couvrent bien la liste du business plan (Hespress, Le360, Medias24, TelQuel, L'Économiste, Aujourd'hui Le Maroc, Libération, Bayane, Yabiladi, H24info, etc.) |

---

## 10. MÉTRIQUES CLÉS

| Métrique | Valeur |
|---|---|
| Routes `/atelier/` auditées | 62 |
| Routes API `/atelier/api/` | 4 |
| Erreurs TypeScript | **80** (1 root cause : Prisma schema mismatch) |
| Clés API hardcodées | 0 ✅ |
| TODO/FIXME dans `src/` | ~15 (tous dans `src/lib/harchiq/` collectors, documentés comme "planned") |
| Témoignages falsifiés | **11** (4 dans ProductsPage + 4 dans CustomersPage + 3 dans AtelierLanding dead code) |
| Clients fictifs | **4** (dans CustomersPage) |
| Offres d'emploi fictives | **8** (dans CareersPage) |
| Pages avec données mock sans disclaimer | ~15 (Harch 100, 5 companies, 6 industries, risk-tracker, reputation-tracker, dashboard, customers, etc.) |
| Fichiers junk trackés | **~1466** (~112 MB) |
| Fichiers `src/` trackés | 913 |
| Ratio junk/code | 1,6× |
| Conformité pricing vs business plan | 3/3 tiers ✅ + 1 tier manquant (Investor Report) ❌ |
| Conformité polices DS V2 | Inter ✅ / Space Mono ❌ (JetBrains Mono partout) |
| Conformité couleurs DS V2 | ❌ (100% hex custom, accent slate au lieu de stone-500) |
| Interaction Tesla-style | ❌ absente sur AtelierHome |
| Détail "forge sparks" | ❌ absent |
| Disclaimer "phase d'amorçage" | ❌ absent des 62 routes |

---

*Fin du rapport. Généré le 2026-07-29 par l'agent Explore (audit).*
*Rapport complet: `/home/z/my-project/work/harch-atelier/AUDIT_REPORT.md`*
