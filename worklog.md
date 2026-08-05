# HarchIQ — Worklog Technique

> Langage de travail : code, logique système, fonctionnalités. Pas de baratin client.

---
Task ID: 0-3 (reconstructed from git commits dcf88c5, 7d78ec5, c6ff00a)
Agent: main + crawler-technique
Task: Crawler technique + 4 BUGFIX + 5 REFACTOR/FEATURE/PERF + QA

Work Log (résumé — détails dans les commit messages):
- Crawler technique a rampé le codebase (~95k lignes) et produit 18 objectifs techniques
- BUGFIX #1: cron/refresh — supprimé 4 Math.random() (corrompait trader data), branché fetchBVCQuote + agrégation Article réelle
- BUGFIX #2: BrandHealthCommandCenter — normalizeBrandHealth() défensif contre payload API partiel
- BUGFIX #3: LinguisticMatrixPanel — normalizeGri() + SAFE_GRI contre gri undefined
- BUGFIX #4: InsightPanel + CrisisIndicator — safeFormatDate() contre Date(invalidString)
- REFACTOR #6: rss-scraper — supprimé champ rawContent déprécié, migré 5 sites lecteurs
- FEATURE #11: financial-collector — collectStockPrice() branché BVC (Yahoo GDR + CSV), cache 5 min
- PERF #13: scraper-worker — upsertArticlesBatch() parallèle (chunks de 5, Promise.allSettled)
- PERF #14: schema.prisma — @@index([companyId, sentimentLabel]) poussé sur Neon
- REFACTOR #8/9: llm-cache.ts (nouveau module 200 lignes) — DbGLMCache + MemoryCache<T> + cachedCall<T>
- QA 4-A: smoke test 247 URLs (87 pages + 149 APIs) — 0 crash, 0 route 500
- QA 4-B: 50+ edge cases sécurité — 0 faille critique, 6 bugs mineurs
- Fix QA: /api/contact + /api/quote migrés Zod (null body → 400 au lieu de TypeError), /api/auth/register drop XSS reflection

Stage Summary:
- 17 fichiers édités, 3 commits poussés (dcf88c5, 7d78ec5, c6ff00a)
- Codebase stable: 0 route 500, 0 écran blanc, 0 faille critique
- Lint: 0 nouvelle erreur sur fichiers édités (28 erreurs pré-existantes hors scope)
- Prisma schema synchronisé sur Neon PostgreSQL

---
Task ID: 6
Agent: main
Task: Boucle VLM totale — capture screenshots + analyse visuelle + fix defects

Work Log:
- Installé Playwright + chromium-headless-shell (peut atteindre localhost contrairement à agent-browser)
- Créé scripts/vlm-capture-batch.ts + vlm-capture-with-server.ts (spawn dev server as child pour survivre au sandbox OOM)
- Capturé 38 screenshots (36 pages publiques + 2 partielles console) en batches
- Analysé 15/38 via VLM CLI (z-ai vision, glm-5v-turbo) — 23 restants bloqués par rate limit 429
- Résultats VLM: 13 PASS, 2 WARN, 0 FAIL, 0 défaut HIGH severity

VLM Defects Found & Fixed:
1. [FIXED] compare — Radar chart axis labels 'Environment'/'Financial' truncated at size=360 → increased to 420
2. [FIXED] compare — Dark comparison summary cards: label opacity 0.5→0.75, metric 0.4→0.65 (WCAG AA)
3. [DEFERRED] console-brand-monitor-mobile — Top nav text truncated (partial 30KB screenshot, needs full auth capture)
4. [DEFERRED] console-brand-monitor-mobile — Toast notification overlaps footer link (partial screenshot)

VLM Cycle-1 Coverage:
- Screenshots captured: 38 (7 console dashboards failed — server OOM under Turbopack)
- Screenshots analyzed: 15/38 (23 pending — VLM API rate limit 429)
- All 5 company pages PASS (OCP, Attijariwafa, BOA, IAM, RAM)
- All 4 industry pages PASS (banking, telecom, energy, aviation)
- All 4 lab pages PASS (whatsapp, hespress, command-center, linguistic-matrix)

Stage Summary:
- VLM pipeline opérationnel: Playwright capture → z-ai vision CLI → JSON parsing → fix → commit
- Commit c6ff00a poussé (compare page fix + screenshots + scripts)
- Prochaine étape: cron webDevReview reprendra VLM cycle-2 + capture console auth

Unresolved Issues:
- 23 screenshots en attente d'analyse VLM (rate limit 429 — reset dans ~1h)
- 7 screenshots console à recapturer avec auth (scripts prêts, serveur OOM à mitiger)
- Worklog précédent perdu (jamais committé dans git) — reconstruit depuis les commit messages
- Recommandation: committer le worklog à chaque étape pour éviter la perte

---
Task ID: 7
Agent: main
Task: Boucle VLM totale — continuité d'exécution (override rate limit + OOM)

Work Log:
- Infrastructure mitigation:
  • .env: added NEXTAUTH_SECRET + NEXTAUTH_URL (was missing → getServerSession returned null → every /atelier/console/* bounced to /login)
  • Demo email mapping fixed: demo-market→demo-compet@harch.atelier, demo-alpha→demo-trader@harch.atelier (getDemoAccountType only matches these prefixes)
  • scripts/vlm-capture-with-server.ts: auto-restart server via ensureServer() health check before each navigation + shared auth context per role (login once, capture all routes in same browser context — cookies persist)
  • scripts/vlm-analyze-backoff.sh: exponential backoff (4,8,16,32,64s) with jitter for VLM 429 rate limit
  • scripts/chaos-test.ts: 4-test human emulation suite (rage-click, F5 mid-request, viewport resize, network throttle)

- VLM Cycle-2 capture (7 console auth-gated screenshots):
  • console-brand-monitor: 1.2MB (desktop dashboard, real render)
  • console-brand-monitor-mobile: 853KB (mobile dashboard)
  • console-market: 86KB, console-invest: 85KB, console-alpha: 86KB
  • agency: 51KB, client-dashboard: 104KB
  • All verified as real dashboards (not login redirects) via VLM "Dashboard" vs "Login" classification

- VLM analysis (38/38 screenshots = 100% coverage):
  • PASS: 33 (87%) — clean render, no defects
  • WARN: 4 (11%) — compare, console-brand-monitor-mobile, agency, pricing-mobile
  • FAIL: 1 (3%) — console-brand-monitor (sidebar truncation)
  • 0 high-severity defects across all 38 pages

- Fixes applied this cycle:
  1. [FIXED] console-brand-monitor FAIL → ConsoleShell sidebar nav-item: padding 20px→16px, overflow:hidden, label span textOverflow:ellipsis + whiteSpace:nowrap + flex
  2. [FIXED] agency WARN → AgencyDashboard Tag: maxWidth:180px + overflow:hidden + textOverflow:ellipsis + title tooltip
  3. [FIXED] pricing-mobile WARN → PricingPage period text + EUR estimate: textMuted → textSecondary (WCAG AA contrast)
  4. [FIXED] compare WARN (cycle-1) → RadarChart size 360→420, dark card opacity 0.5→0.75 / 0.4→0.65
  5. [FIXED] login rage-click → submittingRef (useRef) synchronous guard in handleSubmit

- Chaos testing results:
  • rage-click: WARN (15 requests from 5 clicks = 3/signIn — normal behavior, each click = 1 failed login attempt that resolves fast)
  • f5-mid-request: PASS (page recovers after mid-request reload)
  • viewport-resize: PASS (no horizontal scroll after 4 rapid resizes 1920↔375)
  • network-throttle: not completed (tool timeout — script ready for next run)

- VLM false positives identified (not bugs):
  • console-brand-monitor-mobile: VLM claimed "1 Issue" toast overlaps footer — no such toast exists in source (VLM hallucinated from alert badge)
  • client-dashboard: VLM claimed "8 MARCHÉS FRANCOPHONES" country cards truncated — no such section exists in the 173-line component (VLM hallucinated from footer)

VLM Defects Status:
- FIXED: 5 (compare radar+contrast, console sidebar, agency Tag, pricing contrast, login rage-click)
- VLM FALSE POSITIVE: 2 (console-mobile toast, client-dashboard country cards)
- REMAINING WARN: 0 unfixed real defects

Stage Summary:
- 38/38 screenshots analyzed (100% VLM coverage)
- 33 PASS, 4 WARN (3 fixed + 1 false positive), 1 FAIL (fixed)
- 0 high-severity defects
- 0 TypeScript regression (lint: 0 new errors on edited files)
- 3 commits pushed: 4493f4b (console capture+fixes), ed3a30e (chaos+login guard), 3739ca1 (pricing contrast+final)
- Infrastructure: auto-restart server, backoff VLM, chaos suite — all reusable for next cycles
- Next: cron webDevReview can re-capture console-brand-monitor to verify FAIL→PASS after sidebar fix
