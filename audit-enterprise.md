# AUDIT-ENTERPRISE — Exhaustive Value-to-UI Audit · Plan "Grandes Entreprises"

**Task ID:** AUDIT-ENTERPRISE
**Agent:** VORTEX (Principal Systems & Data Auditor)
**Mode:** RESEARCH ONLY — no code modified
**Date:** 2026-08-11
**Subject:** `/home/z/my-project/src/app/atelier/console/enterprise/EnterpriseDashboard.tsx` (13 642 lines)

---

## 0. Executive Summary

| Axis | Count |
|---|---|
| Sections déclarées dans le header du fichier | 25 (numérotées 1 → 25) |
| Sections réellement implantées (components + invocations) | **43** (numérotées 0 → 41, avec doublons de numéro dus à des insertions AURA / R2/R3/R4-ENTERPRISE) |
| Routes API live (Prisma + démo fallback) | 13 (12 GET + 1 POST) |
| Routes API live + interactives côté dashboard | 14 endpoints |
| Composants UI distincts (fonctions React `function XxxCard`) | 41 + 11 helpers atomiques |
| Sections 100 % mock (client-only, aucune API) | 22 |
| Sections alimentées par API Prisma (via `useApi`) | 17 |
| Promesses pricing → UI manquante (gap) | 5 |
| UI orpheline (sans promesse pricing explicite) | 14 |

Le fichier commenté en tête annonce "25 sections" mais le code en contient en réalité **43** — l'équipe a empilé 4 vagues d'enrichissement (`10X-ENTERPRISE`, `ENV-ENTERPRISE`, `R2/R3/R4-ENTERPRISE-A/B`) sans renuméroter. Le footer du dashboard lui-même mentionne « 36 sections » (ligne 13 618) — chiffre également inexact.

Le plan pricing « Grandes Entreprises » promet 3 capacités distinctes + 3 features clés + 1 quota IA « illimité » + 1 quota d'intégration « API + MCP ». Le dashboard implémente tout cela **et largement plus** (board briefing, war room, stakeholder map, geopolitical feed, ESG scorecard, risk heatmap, audit log, SIEM, reg calendar, etc.) — soit un excès d'UI par rapport aux promesses commerciales.

---

## 1. Source Commerciale — Plan « Grandes Entreprises » (verbatim)

**Fichier:** `/home/z/my-project/src/app/atelier/pricing/PricingPage.tsx` · lignes 69-90

### 1.1 Plan object (verbatim)

```ts
{
  name: "Grandes Entreprises",
  tagline:
    "Pour les marques leaders et internationales qui industrialisent l'intelligence réputationnelle avec gouvernance et conformité.",
  capabilities: [
    "Veille médiatique",
    "Social listening",
    "Suivi de la visibilité IA (GenAI Lens)",
    "Marketing d'influence",
    "Relations médias",
  ],
  bestFor: [
    "Les marques leaders et internationales",
    "Marchés et parties prenantes multiples",
    "Besoins analytiques avancés",
  ],
  keyFeatures: [
    "HarchIQ AI — Version entreprise (illimité)",
    "Intégrations API et MCP",
    "Gouvernance, workflows et autorisations",
  ],
}
```

### 1.2 Matrice comparative — lignes 153-177 (colonnes Essentiel · Pro · **Grandes Entreprises** · Agences)

| Catégorie | Critère | Grandes Entreprises |
|---|---|---|
| Capacités incluses | Veille médiatique | ✓ |
| Capacités incluses | Social listening | ✓ |
| Capacités incluses | Suivi de la visibilité IA (GenAI Lens) | ✓ |
| Capacités incluses | Relations médias | ✓ |
| Capacités incluses | Marketing d'influence | ✓ |
| HarchIQ AI | Niveau HarchIQ AI | **Entreprise** |
| HarchIQ AI | Questions par jour | **Illimité** |
| Analyse & rapports | Alertes et rapports | ✓ |
| Analyse & rapports | Tableaux de bord prédéfinis | ✓ |
| Analyse & rapports | Benchmarking concurrentiel | ✓ |
| Analyse & rapports | Tableaux de bord et rapports personnalisés | ✓ |
| Analyse & rapports | **Rapports board-ready** | ✓ |
| Intégrations & gouvernance | **Intégrations API et MCP** | ✓ |
| Intégrations & gouvernance | **Gouvernance, workflows et autorisations** | ✓ |
| Intégrations & gouvernance | **SSO / SAML** | ✓ |
| Multi-clients | Multi-clients | — |
| Multi-clients | White-label | — |
| Multi-clients | Facturation par compte | — |

### 1.3 FAQ (pricing) — promesses indirectes Enterprise

- **Onboarding (ligne 186) :** « Pour les plans Pro et Grandes Entreprises : 5 à 10 jours ouvrés (incluant l'onboarding, le paramétrage des sources et la formation de l'équipe). »
- **Engagement (ligne 198) :** « Grandes Entreprises et Agences : contrat-cadre 12 ou 24 mois avec clauses de révision trimestrielle. Un essai pilote de 30 jours est possible pour les plans Pro et supérieurs. »

### 1.4 Promesses landing / public pages

- `AtelierHome.tsx` ligne 3 984 : **« A board-ready PDF, every month. »** (page d'accueil — promesse non spécifique Enterprise mais mobilisée par la section « Rapports board-ready »)
- `AboutPage.tsx` ligne 348 : **« Rapport PDF board-ready mensuel »** (section mission)
- `AboutPage.tsx` lignes 58 & 63 : « PDF board-ready » mentionné dans la timeline produit
- `MethodPage.tsx` lignes 10, 42, 163 : **« De l'article source au score board-ready »** + « PDF board-ready »
- `ChangelogPage.tsx` lignes 126, 129-130 : « API & MCP product page with code examples », « Enterprise Risk Intelligence product page with risk matrix »

### 1.5 Promesses UI internes au dashboard (header & sidebar)

Le dashboard lui-même, en plus des promesses pricing, promet en interne (header de fichier lignes 24-58, sidebar nav lignes 961-972, footer ligne 13 618) :

- **25 sections** (commentaire de header — chiffre inexact, réel = 43)
- **3 nav items exclusive Enterprise** (`gouvernance`, `api`, `influenceurs`)
- **Quota IA illimité**
- **9 LLMs testés** (ChatGPT, Claude, Gemini, Grok, Mistral, Llama, Perplexity, Copilot, HarchIQ)
- **Casablanca · v10X** (footer)
- **36 sections** (footer — chiffre inexact)

---

## 2. Cartographie API

Le dashboard invoque **14 endpoints** distincts (12 GET via `useApi<T>()`, 1 POST via `fetch()` direct). Tous les GET retournent une réponse Prisma (Neon DB) si l'utilisateur est authentifié et rattaché à une company, sinon ils retournent une réponse de démo (`buildDemo()` / `demoFilterFromSession`). Aucun endpoint n'est purely mock — tous ont une voie Prisma + une voie démo.

### 2.1 Endpoints GET via `useApi`

| # | Endpoint | Fichier route | Source brute | Démo fallback |
|---|---|---|---|---|
| 1 | `/api/console/brand-health` | `brand-health/route.ts` (82 lignes) | Prisma : `reputationScore`, `article` (24h/7j), `aIVisibility`, `company` | `buildDemo()` : score 74, trend -3, 3 alertes |
| 2 | `/api/console/crisis-alerts` | `crisis-alerts/route.ts` (95 lignes) | Prisma : `article` négatifs 7j, `riskAssessment`, `inboundWhatsAppMessage` flaggués | `buildDemo()` : 3 alertes (Darija cascade, TikTok viral, Hespress comments) |
| 3 | `/api/console/ai-visibility` | `ai-visibility/route.ts` (113 lignes) | Prisma : `aIVisibility` groupé par platform, latest per platform | `demoAiVisibilityResponse()` (lib) |
| 4 | `/api/console/sentiment-trend?range={7d\|30d\|90d}` | `sentiment-trend/route.ts` (147 lignes) | Prisma : `article` bucket par jour sur la plage, agrégat `_avg` + counts positif/neutre/négatif | (pas de démo — retourne `data: []` si pas de company) |
| 5 | `/api/console/source-distribution` | `source-distribution/route.ts` (66 lignes) | Prisma : `article` groupby `source` 30j, top 8 | `buildDemo()` : 8 sources dont Hespress, Le360, TelQuel, Médias24, L'Économiste, TikTok, Facebook, WhatsApp |
| 6 | `/api/console/competitor-radar` | `competitor-radar/route.ts` (68 lignes) | Prisma : `company` du même secteur (2 concurrents max), `article` count 30j, `reputationScore`, `aIVisibility` count, `riskAssessment` count → 6 scores (sentiment, shareOfVoice, aiVisibility, influencerAuthority, crisisResilience, mediaReach) | `buildDemo()` : Attijariwafa (vous), Bank of Africa, BCP |
| 7 | `/api/console/share-of-voice` | `share-of-voice/route.ts` (71 lignes) | Prisma : `company` du même secteur (5 concurrents max), `article` count 30j + `_avg sentimentScore` | `buildDemo()` : 5 banques marocaines |
| 8 | `/api/console/influencers?range=30d` | `influencers/route.ts` (268 lignes) | Prisma : `article` groupby `source` sur la plage, calcul reachScore/sentimentImpact/authorityTier (elite/high/medium/low)/consistency/influenceScore (formule Klear-like documentée dans le header) | (pas de démo explicite — retourne `influencers: []` si pas de company) |
| 9 | `/api/console/regulatory-feed` | `regulatory-feed/route.ts` (59 lignes) | Prisma : `article` où `sourceType = "regulatory"` 30j, top 5 | `buildDemo()` : 5 items (BAM, AMMC, BVC, BAM, ONSSA) |
| 10 | `/api/console/briefing/list?limit=3` | `briefing/list/route.ts` (152 lignes) | Prisma : `briefing` du user, tri par `date` desc, sections JSON parsées pour `confidence`/`topThreats`/`topOpportunities` | (pas de démo explicite — retourne `briefings: []`) |
| 11 | `/api/console/settings/users` | `settings/users/route.ts` (366 lignes) | Prisma : `user` filtré par `companyId` (ou tout si admin), top 200 | (pas de démo explicite — retourne `users: []`) |
| 12 | `/api/console/team-activity` | `team-activity/route.ts` (168 lignes) | Prisma : `auditLog` filtré par les `user.id` de la company, last 10, mappé `action` → `actionLabel` FR (21 mappings) | `buildDemo()` : feed depuis `getDemoTeam()` |

### 2.2 Endpoint POST via `fetch()`

| # | Endpoint | Fichier route | Source brute | Appelé depuis |
|---|---|---|---|---|
| 13 | `POST /api/console/ask` | `ask/route.ts` (527 lignes) | Prisma : `article`, `riskAssessment`, `aIVisibility`, `company` (competitors) → context prompt grounded → appel LLM via `z-ai-web-dev-sdk` (ZAI) → extraction sources citées | Section 1 (`HarchIQWorkspace.sendQuestion` ligne 1 629), Section 16 (`HarchIQEntrepriseCard.sendQuestion` ligne 4 016), Section 27 (`BoardBriefingGeneratorCard.handleGenerate` ligne 6 193) |

### 2.3 Endpoints invoqués depuis le dashboard — Récapitulatif par section

| Section | API(s) consommée(s) |
|---|---|
| 1 HarchIQ Workspace | POST /ask |
| 2 Score Réputation Global | brand-health, crisis-alerts |
| 3 Sentiment Market | brand-health, sentiment-trend |
| 4 Visibilité IA | ai-visibility |
| 5 Parts de Voix | share-of-voice |
| 6 Alertes Crisis | crisis-alerts, brand-health |
| 7 Articles 30J | source-distribution |
| 8 Influenceurs | influencers |
| 9 Appels API 30J | team-activity (proxy pour estimer ai_probe / briefing_generate) |
| 10 Engagement Total | brand-health, crisis-alerts |
| 11 Tendance Sentiment 90j | sentiment-trend |
| 12 Benchmark Concurrentiel | competitor-radar + share-of-voice |
| 13 Radar de Réputation | competitor-radar |
| 14 Part de Voix donut | share-of-voice |
| 15 Grille Visibilité IA (9 LLMs) | ai-visibility |
| 16 HarchIQ AI Entreprise | POST /ask |
| 17 Panneau de Gouvernance | settings/users, team-activity |
| 18 Tableau Multi-Équipes | (mock dur — `MULTI_TEAM_ROWS` constant) |
| 19 API & Intégrations | team-activity (proxy) |
| 20 Marketing d'Influence | influencers |
| 21 DEFCON Crise | crisis-alerts, brand-health |
| 22 Générateur Briefing Exécutif | briefing/list |
| 23 Competitor Deep Dive | competitor-radar, share-of-voice |
| 24 Suivi ESG | brand-health (proxy pour dériver scores ESG) |
| 25 Veille Réglementaire | regulatory-feed |
| 26 Governance Command Bar | (aucune — état local + localStorage) |
| 27 Board Briefing Generator | POST /ask |
| 28 Compliance Cockpit | (mock dur — `COMPLIANCE_INITIAL` constant) |
| 29 API & Integration Hub | (mock dur — `INTEGRATION_INITIAL` constant) |
| 30 Multi-Market Reputation Map | (mock dur — `MARKET_REPUTATIONS` constant) |
| 31 Executive Milestone Tracker | (mock dur — `EXECUTIVE_MILESTONES_INITIAL` constant) |
| 31bis Risk Heatmap Matrix | (mock dur — `RISK_MATRIX_INITIAL` constant) |
| 32 Regulatory Calendar | (mock dur — `REG_CALENDAR_INITIAL` constant) |
| 33 Board PDF Template Gallery | (mock dur — `PDF_TEMPLATES_INITIAL` constant) |
| 34 Audit Log Timeline | (mock dur — `makeSeedAuditLog()` constant) |
| 35 SIEM Integration Configurator | (mock dur — `makeSiemInitial()` constant) |
| 36 Crisis War Room | (mock dur — `WAR_ROOM_INITIAL` + `CRISIS_MENTIONS_POOL`) |
| 37 Stakeholder Mapping | (mock dur — `STAKEHOLDERS_INITIAL` constant) |
| 38 Regulatory Change Feed | (mock dur — `REG_FEED_INITIAL` constant) |
| 39 Board Resolution Tracker | (mock dur — `RESOLUTIONS_SEED` constant) |
| 40 Geopolitical Risk Feed | (mock dur — `GEO_FEED_INITIAL` constant) |
| 41 ESG Scorecard | (mock dur — `ESG_PILLARS_SEED` constant) |
| 0 KPI Executive Summary Row | brand-health, sentiment-trend, source-distribution, compliance-state (mock), risks (mock) |

**Bilan :** 17 sections alimentées par API live · 22 sections 100 % mock (données durcies dans le source + persistance localStorage via `usePersistentState`).

---

## 3. Sections — Audit détaillé (4 axes par section)

> Convention : `L` = numéro de ligne approx dans `EnterpriseDashboard.tsx`. Le fichier utilise une numérotation interne (« SECTION N ») qui saute / duplique certains numéros ; nous gardons la numérotation du code source pour le audit.

---

### Feature 1 — HarchIQ AI Workspace (hero, full width, illimité)

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 86 — `keyFeatures[0]: "HarchIQ AI — Version entreprise (illimité)"` + matrice ligne 162 « Questions par jour → Illimité »
- Pitch verbatim : *"HarchIQ AI — Version entreprise (illimité)"*
- Niveau service : Quota illimité (vs Essentiel 50/j, Pro 200/j)

**Axe 2 — Route & Ingestion**
- Source brute : LLM (ZAI via `z-ai-web-dev-sdk`) + contexte Prisma grounded (`article`, `riskAssessment`, `aIVisibility`, `company`)
- Route API : `POST /api/console/ask` (body `{ question: string }`)
- Mock ? Non — route live, maxDuration 60s, fallback démo via `demoFilterFromSession`

**Axe 3 — Traitement & Logique**
- Transformation : 1) Auth + validation (3-2000 chars). 2) Fetch contexte Prisma. 3) Construction prompt grounded « forbids hallucination ». 4) Appel ZAI. 5) Extraction sources citées par matching texte alert/topic/ai-visibility/neighbor contre l'answer. 6) Retour `{ answer, sources[], generatedAt }`.
- Côté client : `generateFollowUps(question)` (ligne 586) génère 6 follow-ups contextuels selon mots-clés (geopolit/esg/crise/concurrent/ia/comex) — pure heuristique client.

**Axe 4 — Rendu UI**
- Composant : `HarchIQWorkspace` (ligne 1 537) — CardShell `lg:col-span-12` + 3 colonnes internes (historique 220px / chat 60% / prompts 40%)
- États : 10 prompt cards cliquables (briefcase/globe/users/leaf/mapin/brain/filetext/alerttriangle/shieldcheck/userplus icons), conversation history (max 50 via localStorage `harchiq:enterprise:chat-history`), input ChatGPT-style avec Enter=send / Maj+Enter=newline, follow-ups chips (6) sous chaque réponse IA, export PDF / PPT / Copy per message + export PDF / PPT conversation entière, sources expandables (toggle `expandedSources` set), refresh spinner
- Section : `SECTION 1` (id=`ai-workspace`, ligne 1 761) — hero full width
- Persistance : `harchiq:enterprise:chat-history` (50 conversations max, AURA fix #2)

---

### Feature 2 — Score de Réputation Global + DEFCON

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 161 (matrice « Niveau HarchIQ AI → Entreprise ») + implicitement « Tableaux de bord prédéfinis » (ligne 165)
- Pitch verbatim : (non-spécifique — score de réputation est le KPI central de tous les plans)
- Niveau service : N/A

**Axe 2 — Route & Ingestion**
- Source brute : Prisma — `reputationScore.findFirst` (latest), `article.count` 24h, `article.findMany` 7j (sentiment counts), `aIVisibility.findMany` latest 4, `company.findMany` (concurrents)
- Route API : `GET /api/console/brand-health` + `GET /api/console/crisis-alerts` (pour DEFCON)
- Mock ? Non — Prisma live, démo fallback `buildDemo()` (score 74, trend -3, narrative « Frais bancaires excessifs »)

**Axe 3 — Traitement & Logique**
- Transformation : `crisisScore = min(100, negativeShare * 60 + min(25, (articles24h/50) * 25))` → `crisisLevel` safe/watch/warning/critical. Score from `reputationScore.overall ?? 50`. Trend = +2 si `trend="up"` sinon -3.
- DEFCON (client) : `computeDefcon(alerts, crisisScore)` (ligne 674) → 5 niveaux (1=Paix vert / 2=Vigilance lime / 3=Surveillance renforcée amber / 4=Crise active orange / 5=Crise majeure rouge). Seuils : critical≥3 OR crisisScore≥80 → 5 ; critical≥1 OR ≥60 → 4 ; warning≥2 OR ≥40 → 3 ; warning≥1 OR ≥20 → 2 ; sinon 1.
- AiCommentary (client) : génère un texte board-ready en fonction de trend / sentiment.positive / sentiment.negative / DEFCON / aiVisibility cited count.

**Axe 4 — Rendu UI**
- Composant : `ScoreReputationGlobalCard` (ligne 2 338) — CardShell `lg:col-span-12`
- États : `RadialBarChart` gauge 200×200 (startAngle 220, endAngle -40, innerRadius 74%, outerRadius 100%), DEFCON panel à droite avec 5-segment bar, bouton « Activer le mode crise » (toggle rouge), bouton « Comparer vs concurrents » (scroll to `concurrents`), refresh button, 3 mini-stats sentiment (Positif/Neutre/Négatif avec dot color), AiCommentary
- Section : `SECTION 2` (id=`score`, ligne 2 381)

---

### Feature 3 — Sentiment Market (KPI strip)

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 165 (Tableaux de bord prédéfinis) + capabilities[0] « Veille médiatique »
- Pitch verbatim : (générique)
- Niveau service : N/A

**Axe 2 — Route & Ingestion**
- Source brute : Prisma — `article` 7j avec `sentimentLabel` + `sentimentScore`
- Route API : `GET /api/console/brand-health` (sentiment.positive %) + `GET /api/console/sentiment-trend` (sparkline 7j)
- Mock ? Non

**Axe 3 — Traitement & Logique**
- Transformation : `value = health.sentiment.positive` (%). `spark = trend.data.slice(-7).map(d => (d.positive / count) * 100)`. `insight` généré selon valeur (≥50 / ≥35 / <35).

**Axe 4 — Rendu UI**
- Composant : `SentimentMarketKpi` (ligne 2 616) — CardShell `lg:col-span-3 md:col-span-6`
- États : valeur 28px font-mono + Delta (sage/amber/rouge), LineChart sparkline 80×28, AiCommentary
- Section : `SECTION 3` (ligne 2 636)

---

### Feature 4 — Visibilité IA (9 LLMs testés)

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 76 (capabilities[2]) « Suivi de la visibilité IA (GenAI Lens) »
- Pitch verbatim : *"Suivi de la visibilité IA (GenAI Lens)"*
- Niveau service : N/A (le « 9 LLMs » est une promesse interne au dashboard, pas au pricing)

**Axe 2 — Route & Ingestion**
- Source brute : Prisma — `aIVisibility.findMany` groupé par platform (latest per platform)
- Route API : `GET /api/console/ai-visibility`
- Mock ? Non — Prisma live. Démo via `demoAiVisibilityResponse()` (lib)

**Axe 3 — Traitement & Logique**
- Transformation : mapping platform → cited (bool), position, sentiment, confidence, summary. Côté client : `LLM_DOT_NAMES = ["ChatGPT","Claude","Gemini","Grok","Mistral","Llama","Perplexity","Copilot","HarchIQ"]` (9 LLMs), `dots` = intersection citedPlatforms ∩ LLM_DOT_NAMES.
- Note : le route Prisma ne remonte que les LLMs en DB — si la DB a 4 LLMs (ChatGPT/Claude/Gemini/Perplexity), les 5 autres (Grok/Mistral/Llama/Copilot/HarchIQ) sont affichés comme « non cité » par fallback client.

**Axe 4 — Rendu UI**
- Composant : `VisibiliteIaKpi` (ligne 2 674) — CardShell `lg:col-span-3 md:col-span-6`
- États : valeur `cited/total` 28px + Delta, grid 3×3 dots 12px (sage si cité / gray si non), Tooltip par dot, AiCommentary
- Section : `SECTION 4` (id=`visibilite-ia`, ligne 2 695)

---

### Feature 5 — Parts de Voix (KPI strip)

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 166 « Benchmarking concurrentiel » (Pro+)
- Pitch verbatim : (générique)
- Niveau service : N/A

**Axe 2 — Route & Ingestion**
- Source brute : Prisma — `company` du même secteur + `article.count` 30j par company + `_avg sentimentScore`
- Route API : `GET /api/console/share-of-voice`
- Mock ? Non — Prisma live. Démo `buildDemo()` : 5 banques (Attijariwafa vous, BOA, BCP, CIH, Crédit du Maroc)

**Axe 3 — Traitement & Logique**
- Transformation : `pct = round(yourMentions / totalMentions * 100)`. Donut top 5 concurrents. `insight` selon trend (>/</=0).

**Axe 4 — Rendu UI**
- Composant : `PartsDeVoixKpi` (ligne 2 757) — CardShell `lg:col-span-3 md:col-span-6`
- États : valeur `pct%` 28px + Delta pts, PieChart donut 48×48 (5 cellules), AiCommentary
- Section : `SECTION 5` (ligne 2 779)

---

### Feature 6 — Alertes Crisis (KPI strip + DEFCON level)

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 164 « Alertes et rapports »
- Pitch verbatim : (générique)
- Niveau service : N/A

**Axe 2 — Route & Ingestion**
- Source brute : Prisma — `article` négatifs 7j + `riskAssessment` 7j + `inboundWhatsAppMessage` flaggués
- Route API : `GET /api/console/crisis-alerts` + `GET /api/console/brand-health`
- Mock ? Non — Prisma live. Démo 3 alertes (cascade Darija, TikTok viral, Hespress comments)

**Axe 3 — Traitement & Logique**
- Transformation : `count = alerts.count ?? alerts.alerts.length`. `criticalCount = filter severity="critical"`. DEFCON `computeDefcon()` (voir Feature 2).

**Axe 4 — Rendu UI**
- Composant : `AlertesCrisisKpi` (ligne 2 819) — CardShell `lg:col-span-3 md:col-span-6`
- États : valeur `count` 28px (rouge si >0) + Delta, 5 mini-bars verticaux DEFCON (8×24), badge DEFCON, AiCommentary
- Section : `SECTION 6` (id=`alertes`, ligne 2 835)

---

### Feature 7 — Articles 30J (KPI strip + source diversity)

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 73 « Veille médiatique »
- Pitch verbatim : (générique)
- Niveau service : N/A

**Axe 2 — Route & Ingestion**
- Source brute : Prisma — `article.findMany` 30j groupby `source`
- Route API : `GET /api/console/source-distribution`
- Mock ? Non — Prisma live. Démo 8 sources (Hespress/Le360/TelQuel/Médias24/L'Économiste/TikTok/Facebook/WhatsApp)

**Axe 3 — Traitement & Logique**
- Transformation : `total = sources.total`. `sourceCount = sources.sources.length`. `diversityScore = min(100, round(sourceCount / 20 * 100))`. Bars top 7 sources.

**Axe 4 — Rendu UI**
- Composant : `Articles30JKpi` (ligne 2 894) — CardShell `lg:col-span-3 md:col-span-6`
- États : valeur `fmtNumber(total)` 28px + Delta, BarChart 80×28 (7 bars), AiCommentary
- Section : `SECTION 7` (ligne 2 911)

---

### Feature 8 — Influenceurs (KPI strip + reach)

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 77 (capabilities[3]) « Marketing d'influence »
- Pitch verbatim : *"Marketing d'influence"*
- Niveau service : N/A

**Axe 2 — Route & Ingestion**
- Source brute : Prisma — `article.findMany` groupby `source` sur la plage
- Route API : `GET /api/console/influencers?range=30d`
- Mock ? Non — Prisma live. Formule documentée dans le header du route (ligne 13-27) : `reachScore = min(100, mentionCount*2)` / `sentimentImpact = avg(sentimentScore) * -1` / `authorityTier = elite|high|medium|low selon rank` / `consistency = uniqueDays / totalDaysInRange` / `influenceScore = reachScore*0.4 + abs(sentimentImpact)*100*0.3 + consistency*100*0.3`.

**Axe 3 — Traitement & Logique**
- Transformation : `count = influencers.influencers.length`. `totalReach = sum(reachScore * 1000)`. Bars top 7 par influenceScore.

**Axe 4 — Rendu UI**
- Composant : `InfluenceursKpi` (ligne 2 948) — CardShell `lg:col-span-3 md:col-span-6`
- États : valeur `count` 28px + Delta, BarChart 80×28 (7 bars), AiCommentary
- Section : `SECTION 8` (id=`influenceurs`, ligne 2 965)

---

### Feature 9 — Appels API 30J (KPI strip + quota bar) — ENTERPRISE EXCLUSIVE

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 170 « Intégrations API et MCP » (Grandes Entreprises et Agences uniquement)
- Pitch verbatim : *"Intégrations API et MCP"*
- Niveau service : Affiché « Quota Enterprise illimité en pratique — seuil d'alerte à 80% » (ligne 3 014) + sidebar nav `api` marquée `enterpriseExclusive: true` (ligne 967)

**Axe 2 — Route & Ingestion**
- Source brute : **Proxy** — utilise `team-activity` (Prisma `auditLog`) et filtre `action ∈ {ai_probe, briefing_generate, insights_generate}` pour estimer le nombre d'appels API
- Route API : `GET /api/console/team-activity`
- Mock ? Non — Prisma live. **Mais le quota total (50 000) est hardcoded** (ligne 3 009) + `used = min(50000, 14327 + apiCalls * 7)` (ligne 3 010) — le 14 327 de base est lui aussi hardcoded.

**Axe 3 — Traitement & Logique**
- Transformation : `apiCalls = count activities where action in [ai_probe, briefing_generate, insights_generate]`. `used = min(50000, 14327 + apiCalls * 7)`. `pct = used / total * 100`.

**Axe 4 — Rendu UI**
- Composant : `AppelsApiKpi` (ligne 3 003) — CardShell `lg:col-span-3 md:col-span-6`
- États : valeur `fmtNumber(used)` 28px + Delta, icône Key (sage), Progress bar 1.5px (sage), badge ENT, AiCommentary
- Section : `SECTION 9` (id=`api`, ligne 3 017)

---

### Feature 10 — Engagement Total (KPI strip + sparkline)

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 165 « Tableaux de bord prédéfinis »
- Pitch verbatim : (générique)
- Niveau service : N/A

**Axe 2 — Route & Ingestion**
- Source brute : **Proxy** — `brand-health.mentionCount24h` + `crisis-alerts.count`
- Route API : `GET /api/console/brand-health` + `GET /api/console/crisis-alerts`
- Mock ? Non

**Axe 3 — Traitement & Logique**
- Transformation : `engagement = mentions * 12 + alertCount * 8` (formule arbitraire côté client, ligne 3 069). Spark 7 jours généré aléatoirement : `Math.round(engagement * (0.7 + Math.random() * 0.4))` — **random client-side à chaque render, non persisté**.

**Axe 4 — Rendu UI**
- Composant : `EngagementTotalKpi` (ligne 3 066) — CardShell `lg:col-span-3 md:col-span-6`
- États : valeur `fmtNumber(engagement)` 28px + Delta, AreaChart sparkline 80×28, AiCommentary
- Section : `SECTION 10` (ligne 3 087)

---

### Feature 11 — Tendance Sentiment 90j (board-ready, compare mode)

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 168 « Rapports board-ready » (Grandes Entreprises et Agences uniquement)
- Pitch verbatim : *"Rapports board-ready"*
- Niveau service : N/A

**Axe 2 — Route & Ingestion**
- Source brute : Prisma — `article.findMany` sur la plage, bucket par jour (continu y compris jours sans articles)
- Route API : `GET /api/console/sentiment-trend?range={7d|30d|90d}`
- Mock ? Non

**Axe 3 — Traitement & Logique**
- Transformation : `avg = avgScore * 50 + 50` (mapping -1..1 → 0..100). `positive/neutre/négatif` = pct par jour. **Compétiteurs synthétiques** générés côté client quand `compareMode=true` (ligne 3 154-1 55) : `compA = avg - 8 + sin(date.length) * 6` / `compB = avg - 14 + cos(date.length) * 8` — **ces séries ne viennent pas d'API, elles sont calculées par formule**.
- Anomalies : `filter avg < moyenne - 18`. Event markers : 2 events factices (`Lancement produit` au Q1 de la série, `Résultats Q3` au milieu).

**Axe 4 — Rendu UI**
- Composant : `TendanceSentimentCard` (ligne 3 124) — CardShell `lg:col-span-12`
- États : ComposedChart (Area + 3 Lines + 2 ReferenceDots anomaly + 2 ReferenceLines event), Tabs 7j/30j/90j, bouton Comparer (toggle), Legend, AiCommentary
- Section : `SECTION 11` (id=`sentiment`, ligne 3 192)

---

### Feature 12 — Benchmark Concurrentiel (TanStack Table, 8 colonnes)

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 166 « Benchmarking concurrentiel » + ligne 167 « Tableaux de bord et rapports personnalisés »
- Pitch verbatim : (générique)
- Niveau service : N/A

**Axe 2 — Route & Ingestion**
- Source brute : Prisma — `competitor-radar` (6 scores par marque) + `share-of-voice` (mentions + trend)
- Route API : `GET /api/console/competitor-radar` + `GET /api/console/share-of-voice`
- Mock ? Non — Prisma live. Démo : Attijariwafa (vous), BOA, BCP

**Axe 3 — Traitement & Logique**
- Transformation : fusion radar + sov. `mentions = sovRow.mentionCount ?? round(shareOfVoice * 10)`. `sources = max(5, round(mediaReach / 4))`. Score = moyenne des 6 scores du radar.
- 8 colonnes : Entreprise / Score / Sentiment / Mentions / Visibilité IA (bar 40×4) / Sources / Reach / Trend (arrow up/down/neutral).

**Axe 4 — Rendu UI**
- Composant : `BenchmarkConcurrentielTable` (ligne 3 308) — CardShell `lg:col-span-12`
- États : TanStack Table sortable (state `SortingState`), ligne "VOUS" highlightée SAGE_BG, bouton « Analyse approfondie » (toast info, scroll vers SECTION 23), AiCommentary
- Section : `SECTION 12` (id=`concurrents`, ligne 3 489)

---

### Feature 13 — Radar de Réputation (7 axes)

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 166 « Benchmarking concurrentiel »
- Niveau service : N/A

**Axe 2 — Route & Ingestion**
- Source brute : Prisma — `competitor-radar`
- Route API : `GET /api/console/competitor-radar`
- Mock ? Non

**Axe 3 — Traitement & Logique**
- Transformation : 7 axes calculés côté client (ligne 3 586-604) — Réputation = `(sentiment + crisisResilience) / 2`, Sentiment = `scores.sentiment`, Visibilité IA = `scores.aiVisibility`, Diversité = `min(100, mediaReach + 15)`, Résilience = `scores.crisisResilience`, Influence = `scores.influencerAuthority`, Reach = `scores.mediaReach`. Top 3 polygones.

**Axe 4 — Rendu UI**
- Composant : `RadarReputationCard` (ligne 3 582) — CardShell `lg:col-span-12`
- États : RadarChart 320px (PolarGrid + PolarAngleAxis + PolarRadiusAxis + 3 Radar fillOpacity Vous=0.25 / concurrents=0.08), Legend, Tooltip, AiCommentary
- Section : `SECTION 13` (ligne 3 627)

---

### Feature 14 — Part de Voix (enhanced donut)

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 166 « Benchmarking concurrentiel »
- Niveau service : N/A

**Axe 2 — Route & Ingestion**
- Source brute : Prisma — `share-of-voice`
- Route API : `GET /api/console/share-of-voice`
- Mock ? Non

**Axe 3 — Traitement & Logique**
- Transformation : top 4 concurrents + « Autres » agrégé. `previousPct = max(0, youPct - trend)`. Couleurs : Vous=sage, autres=palette 4 colors.

**Axe 4 — Rendu UI**
- Composant : `PartDeVoixDonutCard` (ligne 3 690) — CardShell `lg:col-span-12`
- États : grid 2 cols (PieChart 240px donut innerRadius 55% / outerRadius 85% + liste concurrents avec SparkDot, count, pct, Delta), AiCommentary
- Section : `SECTION 14` (ligne 3 728)

---

### Feature 15 — Grille Visibilité IA (9 LLMs, 3×3 grid)

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 76 « Suivi de la visibilité IA (GenAI Lens) »
- Niveau service : 9 LLMs promis en interne (header ligne 4 + `LLM_GRID` ligne 3 822)

**Axe 2 — Route & Ingestion**
- Source brute : Prisma — `aIVisibility.findMany`
- Route API : `GET /api/console/ai-visibility`
- Mock ? Non — **mais la grille affiche 9 LLMs même si la DB n'en a que 4**. Côté client (ligne 3 836-3 853) : si un LLM n'est pas dans la réponse API, `cited = idx < citedCount`, `position = #idx+1`, `sentiment = idx % 3 == 0 ? neutre : positif`, `citationPct = max(20, min(95, 90 - idx*8))` — **valeurs synthétiques**.

**Axe 3 — Traitement & Logique**
- Transformation : voir ci-dessus. `bestLlm = first cited with trend > 0`. `worstLlm = first cited with trend < 0`. `trend = idx % 4 == 0 ? 1 : idx % 5 == 0 ? -1 : 0` — **pattern arbitraire**.

**Axe 4 — Rendu UI**
- Composant : `GrilleVisibiliteIaCard` (ligne 3 834) — CardShell `lg:col-span-12`
- États : grid 3×3 (9 cells LLM), chaque cell : icône 24×24 (3 lettres uppercase), badge position (#N), valeur `citationPct%` 18px + trend arrow, bar 3px, bouton « Analyse complète » (toast info), AiCommentary
- Section : `SECTION 15` (ligne 3 866)

---

### Feature 16 — HarchIQ AI Entreprise (chat, unlimited)

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 86 `keyFeatures[0]` + ligne 162 « Questions par jour → Illimité »
- Pitch verbatim : *"HarchIQ AI — Version entreprise (illimité)"*
- Niveau service : Quota illimité — badge « QUOTA ILLIMITÉ » (ligne 4 104)

**Axe 2 — Route & Ingestion**
- Source brute : LLM (ZAI) + contexte Prisma grounded — **même route** que Feature 1
- Route API : `POST /api/console/ask`
- Mock ? Non

**Axe 3 — Traitement & Logique**
- Transformation : identique à Feature 1. **Différence de rendement UI** : 6 chips de suggestions "avancées" (`ENTERPRISE_CHIPS` ligne 3 973) vs 10 prompt cards pour Feature 1. Pas d'historique de conversation persisté (alors que Feature 1 persiste 50 conversations). Pas de conversation history sidebar.

**Axe 4 — Rendu UI**
- Composant : `HarchIQEntrepriseCard` (ligne 3 982) — CardShell `lg:col-span-12` avec `padding: 0`
- États : grid 3 cols (chat 2/3 + suggestions 1/3), header charcoal/sage, badge « QUOTA ILLIMITÉ », bouton « Générer un briefing » (scroll to `briefing`), bouton « Export PDF + PPT » (toast success), ChatMessageView partagé avec Feature 1
- Section : `SECTION 16` (id=`harchiq-entreprise`, ligne 4 085)

> **Note VORTEX :** Features 1 et 16 sont **deux instances distinctes** de l'assistant HarchIQ, toutes deux alimentées par `POST /api/console/ask`. Différences : Feature 1 = hero workspace avec prompt library (10 cards) + historique persistant 50 conversations + side panel historique. Feature 16 = chat simplifié avec 6 chips « enterprise » sans historique. C'est techniquement un doublon UI, mais avec un rendu et un positionnement différents — conformément à la ZERO GENERALIZATION RULE, ce sont **deux entries séparées**.

---

### Feature 17 — Panneau de Gouvernance (4 cards) — ENTERPRISE EXCLUSIVE

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 88 `keyFeatures[2]` + ligne 171 « Gouvernance, workflows et autorisations »
- Pitch verbatim : *"Gouvernance, workflows et autorisations"*
- Niveau service : sidebar nav `gouvernance` marquée `enterpriseExclusive: true` (ligne 966)

**Axe 2 — Route & Ingestion**
- Source brute : Prisma — `user.findMany` (team) + `auditLog` (activité)
- Route API : `GET /api/console/settings/users` + `GET /api/console/team-activity`
- Mock ? Non — mais les valeurs `teamCount = 12` (ligne 4 228) et `workflowCount = 8` (ligne 4 230) sont **hardcoded**. Seuls `userCount` et `audit trail count` proviennent de l'API.

**Axe 3 — Traitement & Logique**
- Transformation : 4 cards agrégées (Équipes / Utilisateurs / Workflows / Audit trail). `auditHash = "SHA-256 vérifié"` (hardcoded). `anomalyCount = 0` (hardcoded). `insight`拼接 teamCount + userCount + anomalyCount + auditHash + workflowCount + RGPD/Loi 09-08.

**Axe 4 — Rendu UI**
- Composant : `PanneauGouvernanceCard` (ligne 4 219) — CardShell `lg:col-span-12`
- États : grid 4 cards (Équipes/Utilisateurs/Workflows/Audit), icône 32×32 sage, valeur 24px font-mono, label FONT_HEADER, bouton « Gérer »/« Voir » par card (toast info), badge ENTERPRISE, AiCommentary
- Section : `SECTION 17` (id=`gouvernance`, ligne 4 244)

---

### Feature 18 — Tableau Multi-Équipes (expandable)

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 171 « Gouvernance, workflows et autorisations »
- Niveau service : N/A

**Axe 2 — Route & Ingestion**
- Source brute : **Mock dur** — `MULTI_TEAM_ROWS` (5 équipes hardcoded : Marketing/Communication/Juridique/Direction/RP, ligne 4 320-326)
- Route API : aucune
- Mock ? **OUI — 100% mock**, pas de route API, données durcies dans le source

**Axe 3 — Traitement & Logique**
- Transformation : aucune — affichage direct du constante. Expandable row révèle `lead`, `score` (bar), bouton « Voir dashboard équipe » (toast).

**Axe 4 — Rendu UI**
- Composant : `TableauMultiEquipesCard` (ligne 4 330) — CardShell `lg:col-span-12`
- États : TanStack Table 6 colonnes (Équipe/Membres/Score/Sentiment/Alertes/Statut), expandable (chevron rotate), badge status (actif/veille/alerte), AiCommentary
- Section : `SECTION 18` (ligne 4 453)

---

### Feature 19 — API & Intégrations — ENTERPRISE EXCLUSIVE

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 87 `keyFeatures[1]` + ligne 170 « Intégrations API et MCP »
- Pitch verbatim : *"Intégrations API et MCP"*
- Niveau service : badge ENT, sidebar nav `api` exclusive

**Axe 2 — Route & Ingestion**
- Source brute : **Proxy** — `team-activity` (filtre `action = "ai_probe"`) pour estimer les appels API
- Route API : `GET /api/console/team-activity`
- Mock ? Non — mais `apiKey = "harch_••••••••3f7a"` (hardcoded, ligne 4 572), `apiQuota = 50000` (hardcoded), `apiCalls = 14327 + ai_probe * 3` (hardcoded base). 5 intégrations `INTEGRATIONS` (Power BI/Tableau/Slack/Teams/Webhook) hardcoded avec status « Connecté » ou « Disponible ».

**Axe 3 — Traitement & Logique**
- Transformation : copy/régénérer la clé API (clipboard + toast), 5 cartes d'intégration avec bouton « Configurer » (toast), Progress bar consommation 30J.

**Axe 4 — Rendu UI**
- Composant : `ApiIntegrationsCard` (ligne 4 571) — CardShell `lg:col-span-12`
- États : grid 2 cols (Clé API + Consommation), grid 5 cards intégrations, boutons Copier/Régénérer/Configurer, lien « Documentation API » (toast), AiCommentary
- Section : `SECTION 19` (ligne 4 587)

---

### Feature 20 — Marketing d'Influence

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 77 (capabilities[3]) « Marketing d'influence »
- Niveau service : sidebar nav `influenceurs` exclusive Enterprise (ligne 969)

**Axe 2 — Route & Ingestion**
- Source brute : Prisma — `influencers`
- Route API : `GET /api/console/influencers?range=30d`
- Mock ? Non — Prisma live. `activeCampaigns = 3` (hardcoded, ligne 4 765)

**Axe 3 — Traitement & Logique**
- Transformation : top 5 influenceurs. `totalReach = sum(reachScore * 1000)`. `followers = reachScore * 1500 + idx * 800` (formule client). `platform` détecté par substring sur `source` (twitter/linkedin/facebook/instagram → média).

**Axe 4 — Rendu UI**
- Composant : `MarketingInfluenceCard` (ligne 4 761) — CardShell `lg:col-span-12`
- États : 3 KPI cards (Influenceurs identifiés / Campagnes actives / Reach total), table Top 5 (6 cols), bouton « Lancer une recherche » (toast), badge ENTERPRISE, AiCommentary
- Section : `SECTION 20` (ligne 4 775)

---

### Feature 21 — DEFCON Crise (enhanced)

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 164 « Alertes et rapports »
- Niveau service : N/A

**Axe 2 — Route & Ingestion**
- Source brute : Prisma — `crisis-alerts` + `brand-health`
- Route API : `GET /api/console/crisis-alerts` + `GET /api/console/brand-health`
- Mock ? Non

**Axe 3 — Traitement & Logique**
- Transformation : DEFCON compute (voir Feature 2). `threats = alerts.slice(0, 5)`. `criticalCount = filter severity=critical`. `lastIncident = alerts[0].timestamp`.

**Axe 4 — Rendu UI**
- Composant : `DefconCrisisCard` (ligne 4 955) — CardShell `lg:col-span-12`
- États : grid 3 cols (Gauge DEFCON 40px + 5-segment bar / Menaces actives 2×2 grid / Mode crise button rouge pulsé), liste 5 menaces récentes (sévérité badge + titre + summary + source + timestamp), AiCommentary
- Section : `SECTION 21` (ligne 4 981)

---

### Feature 22 — Générateur de Briefing Exécutif — ENTERPRISE EXCLUSIVE

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 168 « Rapports board-ready » + ligne 86 « HarchIQ AI — Version entreprise »
- Niveau service : badge ENTERPRISE

**Axe 2 — Route & Ingestion**
- Source brute : Prisma — `briefing.findMany` du user
- Route API : `GET /api/console/briefing/list?limit=3`
- Mock ? Non — Prisma live. Mais `handleGenerate` (ligne 5 209) ne fait qu'un `toast.success` — **aucun POST n'est envoyé pour générer un nouveau briefing**, c'est un placeholder.

**Axe 3 — Traitement & Logique**
- Transformation : 5 types de rapport (Trimestriel/Crise/Benchmark/ESG/Direction) + 4 périodes (Q1-Q4) + 8 sections cochables (`BRIEFING_SECTIONS` ligne 5 179). `selectedSections` Set. `toggleSection`. Affichage 3 derniers briefings avec bouton « Télécharger » (toast).

**Axe 4 — Rendu UI**
- Composant : `GenerateurBriefingCard` (ligne 5 189) — CardShell `lg:col-span-12`
- États : grid 2 cols (wizard à gauche : type/période/sections/générer / liste 3 derniers briefings à droite), bouton « Générer le briefing » (toast, pas d'API), AiCommentary
- Section : `SECTION 22` (id=`briefing`, ligne 5 223)

---

### Feature 23 — Competitor Deep Dive

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 166 « Benchmarking concurrentiel »
- Niveau service : N/A

**Axe 2 — Route & Ingestion**
- Source brute : Prisma — `competitor-radar` + `share-of-voice`
- Route API : `GET /api/console/competitor-radar` + `GET /api/console/share-of-voice`
- Mock ? Non — mais `lineData` (30 jours) est **synthétique** : `vous = sentiment + sin(i/4) * 8` / `competitor = sentiment + cos(i/5) * 10` (ligne 5 447-5 454). Donut « Autres » = 200 (hardcoded).

**Axe 3 — Traitement & Logique**
- Transformation : select competitor. 7 axes radar (Vous vs concurrent). 30j line chart (synthétique). Donut SOV (Vous + concurrent + Autres=200). `youWin` = count axes où myVal > compVal.

**Axe 4 — Rendu UI**
- Composant : `CompetitorDeepDiveCard` (ligne 5 410) — CardShell `lg:col-span-12`
- États : select concurrent à droite du header, grid 3 cols (RadarChart 220px / LineChart 220px / PieChart 220px), AiCommentary
- Section : `SECTION 23` (ligne 5 479)

---

### Feature 24 — Suivi ESG (3 cards)

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 77 (capabilities[3]) « Marketing d'influence » — non, ESG n'est pas explicitement au pricing. **Promesse interne** : `PricingPage.tsx` ligne 168 « Rapports board-ready » implicitement étendu à ESG.
- Niveau service : sidebar nav `esg-conformite` (ligne 971) — non marquée exclusive

**Axe 2 — Route & Ingestion**
- Source brute : **Proxy** — `brand-health` (utilise `score` pour dériver scores ESG)
- Route API : `GET /api/console/brand-health`
- Mock ? Non — mais les 3 scores ESG sont **calculés côté client** à partir de `health.score` : `environnement = max(40, min(95, baseScore - 5))`, `social = max(50, min(95, baseScore + 8))`, `gouvernance = max(45, min(90, baseScore - 2))` (ligne 5 585-614). **Les insights ESG sont hardcoded** : « Mentions durabilité en hausse… », « Marque employeur solide… », etc.

**Axe 3 — Traitement & Logique**
- Transformation : 3 cards (Environnement/Social/Gouvernance) avec score + trend + insight + weakness. `globalScore = moyenne`. `strong` et `weak` identifiés.

**Axe 4 — Rendu UI**
- Composant : `SuiviEsgCard` (ligne 5 582) — CardShell `lg:col-span-12`
- États : grid 3 cards (Environnement/Social/Gouvernance) avec icône Leaf/Users/Scale, score 28px + Delta, bar 4px, insight, weakness (AlertTriangle), lien « Rapport ESG trimestriel » (toast), badge GLOBAL, AiCommentary
- Section : `SECTION 24` (id=`esg-conformite`, ligne 5 624)

---

### Feature 25 — Veille Réglementaire

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 88 `keyFeatures[2]` « Gouvernance, workflows et autorisations » implicitement étendu à veille réglementaire
- Niveau service : badge AMMC · BAM · CNDP

**Axe 2 — Route & Ingestion**
- Source brute : Prisma — `article.findMany where sourceType="regulatory" 30j`
- Route API : `GET /api/console/regulatory-feed`
- Mock ? Non — Prisma live. Démo 5 items (BAM circulaire, AMMC décision, BVC avis, BAM communiqué, ONSSA réglementation). Détection régulateur par substring sur `source` (bam/ammc/bvc/onssa/anrt).

**Axe 3 — Traitement & Logique**
- Transformation : top 5 items. `ammcCount`, `bamCount`, `highImpactCount`. `impactColor` (high=rouge / medium=amber / low=vert). `impactLabel` (Fort/Moyen/Faible).

**Axe 4 — Rendu UI**
- Composant : `VeilleReglementaireCard` (ligne 5 715) — CardShell `lg:col-span-12`
- États : liste 5 items (Scale icon 32×32, badge régulateur, titre, badge impact, summary, date+type), lien « Voir toutes les régulations » (toast), AiCommentary
- Section : `SECTION 25` (ligne 5 731)

---

### Feature 26 — Governance Command Bar (sticky, top of dashboard) — ENTERPRISE EXCLUSIVE

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 171 « Gouvernance, workflows et autorisations » + ligne 88 `keyFeatures[2]`
- Niveau service : N/A

**Axe 2 — Route & Ingestion**
- Source brute : **Mock dur** — `DEFAULT_APPROVALS` (4 items hardcoded, ligne 5 866-5 871). DEFCON level persisted in `enterprise:defcon-level` localStorage.
- Route API : aucune
- Mock ? **OUI — 100% mock** pour la file d'approbation. DEFCON level est local-state persisted.

**Axe 3 — Traitement & Logique**
- Transformation : RBAC role display (`comms` hardcoded, ligne 13 254). DEFCON 1-5 toggle (5 buttons). `crisisActive = defconLevel >= 4` (accent rouge). File d'approbation expandable avec approve/reject (toast). War Room button quand DEFCON ≥ 4.

**Axe 4 — Rendu UI**
- Composant : `GovernanceCommandBar` (ligne 5 877) — sticky `top: 56px`
- États : 4 zones (Rôle / DEFCON toggle 5 buttons / War Room button si crise / Approbations avec count badge + expandable queue / Audit shortcut button)
- Section : `SECTION 26` (ligne 13 397, rendu sticky entre Header et main)

---

### Feature 27 — Board Briefing Generator (board-ready, HarchIQ) — ENTERPRISE EXCLUSIVE

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 168 « Rapports board-ready » + ligne 86 « HarchIQ AI — Version entreprise (illimité) »
- Niveau service : badge HARCHIQ · ILLIMITÉ

**Axe 2 — Route & Ingestion**
- Source brute : LLM (ZAI) — même route que Features 1 & 16
- Route API : `POST /api/console/ask` (avec un des 4 prompts `BRIEFING_TEMPLATES_ENT`)
- Mock ? Non — route live. Le résultat est affiché dans un layout « board-ready » (header + content + sources).

**Axe 3 — Traitement & Logique**
- Transformation : 4 templates (COMEX / ESG / Conformité / Géopolitique). `handleGenerate` POST /ask avec le prompt du template sélectionné. Résultat affiché ligne par ligne. `handleSchedule` : cadence mensuel/trimestriel/aucune → nextRun calculé +1mois ou +3mois. `handleExportPdf` : toast (pas d'API).

**Axe 4 — Rendu UI**
- Composant : `BoardBriefingGeneratorCard` (ligne 6 175) — CardShell `lg:col-span-12`
- États : grid 2 cols (modèle + actions à gauche / document généré à droite), 4 templates boutons, bouton « GÉNÉRER PAR HARCHIQ » (spinner), bouton « PROGRAMMER LA PROCHAINE » (dropdown mensuel/trimestriel/aucune), document board-ready (header + content + sources), bouton « EXPORTER PDF » (toast)
- Section : `SECTION 27` (id=`briefing-board`, ligne 6 248)
- Persistance : `enterprise:briefing-schedule`

---

### Feature 28 — Compliance Cockpit (CNDP / AMMC / BAM / ESG) — ENTERPRISE EXCLUSIVE

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 88 `keyFeatures[2]` « Gouvernance, workflows et autorisations »
- Niveau service : N/A

**Axe 2 — Route & Ingestion**
- Source brute : **Mock dur** — `COMPLIANCE_INITIAL` (4 panels CNDP/AMMC/BAM/ESG + 10 audit entries hardcoded, ligne 6 500-6 547)
- Route API : aucune
- Mock ? **OUI — 100% mock**. Persisted in `enterprise:compliance`.

**Axe 3 — Traitement & Logique**
- Transformation : 4 panels régulateurs. `cycleStatus` (conforme → surveillance → non-conforme → conforme). `riskScore` par panel. `lastAudit` / `nextDeadline` dates. `auditTrail` 10 entries. `overallRisk = moyenne`. `handleExport` toast PDF.

**Axe 4 — Rendu UI**
- Composant : `ComplianceCockpitCard` (ligne 6 568) — CardShell `lg:col-span-12`
- États : grid 4 cards (CNDP/AMMC/BAM/ESG) avec icône (Lock/Landmark/Building2/Leaf), status button (cycle), riskScore 22px + bar, dern. audit / échéance, expandable details, audit trail 10 entries, bouton EXPORT PDF (toast), AiCommentary
- Section : `SECTION 28` (id=`compliance-cockpit`, ligne 6 606)
- Persistance : `enterprise:compliance`

---

### Feature 29 — API & Integration Hub (keys, webhooks, MCP) — ENTERPRISE EXCLUSIVE

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 87 `keyFeatures[1]` + ligne 170 « Intégrations API et MCP »
- Pitch verbatim : *"Intégrations API et MCP"*
- Niveau service : badge « 600 REQ/MIN ENTERPRISE TIER » (ligne 6 930-6 934)

**Axe 2 — Route & Ingestion**
- Source brute : **Mock dur** — `INTEGRATION_INITIAL` (2 clés API + 1 webhook + 5 connecteurs MCP, ligne 6 799-6 830)
- Route API : aucune
- Mock ? **OUI — 100% mock**. Persisted in `enterprise:integrations`. `rateLimitPerMin = 600` (hardcoded, ligne 6 849). `currentPerMin = 142` (hardcoded).

**Axe 3 — Traitement & Logique**
- Transformation : `handleGenerateKey` génère un ID + masked key. `handleRevokeKey` (status → revoked). `handleCopyKey` (clipboard). `handleToggleConnector` (MCP on/off). `handleAddWebhook` (validation URL https + ≥1 event). `handleToggleWebhook` (active/paused). 3 event types (crisis / sentiment-shift / milestone).

**Axe 4 — Rendu UI**
- Composant : `ApiIntegrationHubCard` (ligne 6 838) — CardShell `lg:col-span-12`
- États : grid 3 KPI (Rate limit / Appels ce mois / Intégrations MCP), grid 2 cols (Clés API + Webhooks), 5 connecteurs MCP grid 5 (ServiceNow/Splunk/Tableau/Slack/Teams), boutons GÉNÉRER/Copier/Révoquer/Configurer/Ajouter endpoint/ON-OFF, AiCommentary
- Section : `SECTION 29` (id=`api-hub`, ligne 6 923)
- Persistance : `enterprise:integrations`

> **Note VORTEX :** Features 19 et 29 sont **deux sections distinctes** consacrées à l'API & intégrations. Feature 19 = vue synthétique (1 clé + 5 intégrations BI/slack/teams/webhook). Feature 29 = hub complet (2+ clés + webhooks + 5 connecteurs MCP + rate limit 600 req/min). Conformément à la ZERO GENERALIZATION RULE, ce sont **deux entries séparées**.

---

### Feature 30 — Multi-Market Reputation Map (8 francophone markets)

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 81 `bestFor[1]` « Marchés et parties prenantes multiples »
- Niveau service : N/A

**Axe 2 — Route & Ingestion**
- Source brute : **Mock dur** — `MARKET_REPUTATIONS` (8 marchés MA/FR/BE/CH/CA/TN/SN/CI hardcoded avec sentiment, mentionVolume, topNarrative, crisisFlag, geoRisk, narratives[3], sources[3], trend[14], ligne 7 235-7 356)
- Route API : aucune
- Mock ? **OUI — 100% mock**. Aucune persistence (les expanded/compare sont en state local).

**Axe 3 — Traitement & Logique**
- Transformation : `avgSentiment`, `totalMentions`, `crisisCount`, `redCount`/`amberCount`. Click card → expand (narratives top 3 + sources + trend AreaChart 14 jours). Mode compare → select 2-3 marchés → side-by-side comparison panel.

**Axe 4 — Rendu UI**
- Composant : `MultiMarketReputationMapCard` (ligne 7 370) — CardShell `lg:col-span-12`
- États : grid 4 KPI summary (Sentiment moyen / Mentions totales / Drapeaux crise / Marchés à risque), grid 4×2 cards marchés (flag + sentiment + mentionVolume + topNarrative + geoRisk badge), expandable detail panel (3 cols : narratives + sources + AreaChart 14j), compare mode (grid 3 cols side-by-side)
- Section : `SECTION 30` (id=`market-map`, ligne 7 402)

---

### Feature 31 — Executive Milestone Tracker (5 jalons)

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 168 « Rapports board-ready »
- Niveau service : N/A

**Axe 2 — Route & Ingestion**
- Source brute : **Mock dur** — `EXECUTIVE_MILESTONES_INITIAL` (5 jalons hardcoded : Premier briefing COMEX / Audit ESG Q3 / Conformité AMMC validée / War room testé / API intégrée au SIEM, ligne 7 677-7 683)
- Route API : aucune
- Mock ? **OUI — 100% mock**. Persisted in `enterprise:milestones`.

**Axe 3 — Traitement & Logique**
- Transformation : `handleToggleMilestone` (completed → !completed, completedAt = Date.now() si completion). `milestoneProgress = {done, total}` alimente le badge dans le Header (ligne 13 393-13 394).

**Axe 4 — Rendu UI**
- Composant : `ExecutiveMilestoneTrackerCard` (ligne 7 685) — CardShell `lg:col-span-12`
- États : grid 5 cards jalons (icône + label + description + CheckCircle2 / cercle vide), bouton toggle par card, badge done/total+pct%, AiCommentary
- Section : `SECTION 31` (id=`jalons-executifs`, ligne 7 697)
- Persistance : `enterprise:milestones`

---

### Feature 31bis — Risk Heatmap Matrix (5×5)

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `AboutPage.tsx` ligne 129 « Enterprise Risk Intelligence product page with risk matrix » + `PricingPage.tsx` ligne 171 « Gouvernance, workflows et autorisations »
- Niveau service : N/A

**Axe 2 — Route & Ingestion**
- Source brute : **Mock dur** — `RISK_MATRIX_INITIAL` (5 risques seed : Sanctions extra-territoriales / Évolution CNDP-AMMC / Bad buzz réseau social / Indisponibilité plateforme / Empreinte carbone Scope 3, ligne 7 815-7 866)
- Route API : aucune
- Mock ? **OUI — 100% mock**. Persisted in `enterprise:risk-matrix`.

**Axe 3 — Traitement & Logique**
- Transformation : 5 catégories (geopolitical/regulatory/reputational/operational/esg). `riskScore = probability * impact`. `riskLevelColor` (≥16 rouge / ≥10 orange / ≥5 amber / <5 sage). Form d'ajout de risque (6 champs). Delete risk.

**Axe 4 — Rendu UI**
- Composant : `RiskHeatmapMatrixCard` (ligne 7 890) — CardShell `lg:col-span-12`
- États : grid 4 KPI summary (Total / Critiques / Élevés / Par catégorie), matrix 5×5 (Probability × Impact) avec dots colorés par catégorie, click dot → detail panel (description + responsable + échéance + mitigation + delete), form ajout risque, legend 4 couleurs + 5 catégories, AiCommentary
- Section : `SECTION 31` (id=`risk-matrix`, ligne 7 944) — **doublon de numéro avec Feature 31**
- Persistance : `enterprise:risk-matrix`

---

### Feature 32 — Regulatory Calendar

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 88 `keyFeatures[2]` « Gouvernance, workflows et autorisations »
- Niveau service : N/A

**Axe 2 — Route & Ingestion**
- Source brute : **Mock dur** — `REG_CALENDAR_INITIAL` (12 échéances réglementaires hardcoded avec regulator CNDP/AMMC/BAM/ESG/GDPR, ligne 8 238+)
- Route API : aucune
- Mock ? **OUI — 100% mock**. Persisted in `enterprise:reg-calendar`.

**Axe 3 — Traitement & Logique**
- Transformation : `regStatus(date)` : à venir / échéance (≤3j) / dépassé. Calendar mensuel affiché avec color dots par régulateur. Sidebar « next 3 ».

**Axe 4 — Rendu UI**
- Composant : `RegulatoryCalendarCard` (ligne 8 301) — CardShell `lg:col-span-12`
- États : grid 2 cols (Calendar mensuel + sidebar next 3), color dots par régulateur (CNDP sage / AMMC gray / BAM amber / ESG vert / GDPR rouge), click date → liste échéances, AiCommentary
- Section : `SECTION 32` (ligne 13 531)
- Persistance : `enterprise:reg-calendar`

---

### Feature 0 — KPI Executive Summary Row (4 cards board-ready)

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 168 « Rapports board-ready »
- Niveau service : N/A

**Axe 2 — Route & Ingestion**
- Source brute : **Mixte** — `brand-health` + `sentiment-trend` + `source-distribution` + `compliance-state` (mock) + `risks` (mock)
- Route API : 3 GET (brand-health, sentiment-trend, source-distribution)
- Mock ? Partiellement — la partie Conformité (3e card) et Risk Index (4e card) sont alimentées par `complianceState` et `risksState` qui sont persisted localStorage (mock dur).

**Axe 3 — Traitement & Logique**
- Transformation : 4 cards agrégées (Score réputation + sparkline / Coverage médiatique + top 3 sources / Conformité avec 4 badges régulateurs + Risk Index critiques+élevés). `reachEstimate = mentionCount * 12500`. `overallCompliance` selon non-conforme/surveillance/conforme. `riskColor` selon criticalCount/eleveCount.

**Axe 4 — Rendu UI**
- Composant : `KpiExecutiveSummaryRow` (ligne 8 580) — grid 4 cards (pas de CardShell, cards autonomes)
- États : 4 cards (Score réputation 34px + sparkline 70×28 / Coverage médiatique + top 3 sources / Conformité avec 4 badges régulateurs tooltipés / Risk Index avec trend maîtrisé/stable/pressurisé), bouton « DÉTAILS » par card (scroll to section)
- Section : `SECTION 0` (ligne 13 411, rendu en haut du main, avant la grid 12 cols)

---

### Feature 33 — Board PDF Template Gallery (4 modèles board-ready)

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 168 « Rapports board-ready »
- Niveau service : 4 modèles PDF

**Axe 2 — Route & Ingestion**
- Source brute : **Mock dur** — `PDF_TEMPLATES` (4 templates : Briefing COMEX 1p / Rapport trimestriel 12p / Audit ESG 8p / Cartographie géopolitique 6p, ligne 8 802-8 835)
- Route API : aucune
- Mock ? **OUI — 100% mock**. Persisted in `enterprise:pdf-templates` (lastGenerated + schedules).

**Axe 3 — Traitement & Logique**
- Transformation : `PdfThumbnail` (mini A4 thumbnail par template). `PdfConfigModal` (période + sections + recipients email). `PdfFullLayout` (layout PDF-ready : header + content + footer). `PdfPreviewModal` (full-screen preview). `handleSchedule` (aucune/mensuel/trimestriel).

**Axe 4 — Rendu UI**
- Composant : `BoardPdfTemplateGalleryCard` (ligne 9 316) — CardShell `lg:col-span-12`
- États : grid 4 cards templates (thumbnail 120×170 + title + description + last generated + schedule badge + 3 boutons GÉNÉRER/APERÇU/PROGRAMMER), PdfConfigModal (période couverte + sections + destinataires email), PdfPreviewModal (full-screen dark overlay + page A4 white)
- Section : `SECTION 33` (id=`pdf-templates`, ligne 9 370)
- Persistance : `enterprise:pdf-templates`

---

### Feature 34 — Audit Log Timeline (gouvernance)

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 171 « Gouvernance, workflows et autorisations »
- Niveau service : N/A

**Axe 2 — Route & Ingestion**
- Source brute : **Mock dur** — `makeSeedAuditLog()` (15 entries hardcoded avec 7 types : connexion/modification/approbation/rejet/export/creation/suppression, ligne 9 532-9 553)
- Route API : aucune
- Mock ? **OUI — 100% mock**. Persisted in `enterprise:audit-log`.

**Axe 3 — Traitement & Logique**
- Transformation : 5 filtres (search + type + user + date from + date to). `visible = filtered.slice(0, visibleCount)`. « CHARGER PLUS » augmente visibleCount de 10. `handleExport` toast CSV. `handleClearFilters`. 5 users hardcoded (`AUDIT_USERS`).

**Axe 4 — Rendu UI**
- Composant : `AuditLogTimelineCard` (ligne 9 556) — CardShell `lg:col-span-12`
- États : grid 5 filtres (search/type/user/date from/date to) + bouton reset, timeline verticale (line 2px sage + dots 22×22 colorés par type), entries avec avatar initials + type badge + user + action + timestamp + IP + section, bouton « CHARGER PLUS », bouton « EXPORTER CSV », AiCommentary
- Section : `SECTION 34` (id=`audit-log`, ligne 9 600)
- Persistance : `enterprise:audit-log`

---

### Feature 35 — SIEM Integration Configurator (3 connecteurs SOC)

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 87 `keyFeatures[1]` « Intégrations API et MCP »
- Niveau service : badge « SOC-READY »

**Axe 2 — Route & Ingestion**
- Source brute : **Mock dur** — `makeSiemInitial()` (3 connecteurs Splunk/QRadar/Sentinel, ligne 9 813-9 862)
- Route API : aucune
- Mock ? **OUI — 100% mock**. Persisted in `enterprise:siem-config`. Splunk connecté (1247 events synced, 142/500 req/min), QRadar et Sentinel non configurés.

**Axe 3 — Traitement & Logique**
- Transformation : `handleTest` (90% succès simulé, latence 40-120ms aléatoire). `handleSync` (50-200 events simulés, +eventsSynced). `handleSaveConfig` (status → connected si endpoint+token+events). 5 event types (crisis/sentiment-shift/milestone/compliance/anomaly). Mapping Harch events → SIEM fields (5 lignes éditables).

**Axe 4 — Rendu UI**
- Composant : `SiemIntegrationConfiguratorCard` (ligne 9 865) — CardShell `lg:col-span-12`
- États : grid 3 cards connecteurs (Splunk/QRadar/Sentinel) avec status button, expandable (endpoint input + token input + events checkboxes + rate limit bar + last sync + eventsSynced + boutons TESTER/SYNCHRONISER/ENREGISTRER), table mapping Harch events → SIEM fields (éditable), AiCommentary
- Section : `SECTION 35` (id=`siem-config`, ligne 9 953)
- Persistance : `enterprise:siem-config`

---

### Feature 36 — Crisis War Room (overlay full-screen, DEFCON ≥ 4)

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 88 `keyFeatures[2]` « Gouvernance, workflows et autorisations »
- Niveau service : N/A

**Axe 2 — Route & Ingestion**
- Source brute : **Mock dur** — `WAR_ROOM_INITIAL` (4 actions hardcoded) + `CRISIS_MENTIONS_POOL` (12 mentions hardcoded : Twitter/LinkedIn/Le Matin/Facebook/TelQuel/YouTube/Reddit/WhatsApp/Instagram/Medias24/Bloomberg/Forum) + `WAR_ROOM_TEAM` (6 membres : Karim B./Sophie M./Leila R./Youssef E./Yasmine T./HarchIQ AI)
- Route API : aucune
- Mock ? **OUI — 100% mock**. Persisted in `enterprise:war-room`. Mentions live générées par `setInterval` 5s (random depuis `CRISIS_MENTIONS_POOL`).

**Axe 3 — Traitement & Logique**
- Transformation : timer `elapsedSec` (tick 1s). `liveMentions` (addMention 5s). `briefing` auto-généré (update 30s) via `generateCrisisBriefing` (texte board-ready avec actions/messages/escalade/mentions). `escalatedToComex` toggle. Chat team (6 membres). Actions checklist (WRA-001 à 004). `handleAddAction`, `handleCompleteAction`.

**Axe 4 — Rendu UI**
- Composant : `CrisisWarRoomOverlay` (ligne 10 282) — full-screen fixed inset-0
- États : header charcoal + rouge (duration `HH:MM:SS` + crisis level + bouton ESCALADER COMEX + bouton FERMER), grid 2×2 panels (Live feed mentions 5s refresh / Team chat 6 membres / Actions checklist / Auto briefing 30s refresh), ESC key ferme, persistance messages + actions
- Section : `SECTION 36` (ligne 13 632, rendu en overlay au-dessus du dashboard si `warRoomOpen`)
- Persistance : `enterprise:war-room`

---

### Feature 37 — Stakeholder Mapping (8 catégories, scatter matrix)

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 81 `bestFor[1]` « Marchés et parties prenantes multiples »
- Niveau service : N/A

**Axe 2 — Route & Ingestion**
- Source brute : **Mock dur** — `STAKEHOLDERS_INITIAL` (8 stakeholders hardcoded : Ministère Économie/AMMC/Medias24/CPG Capital/Comité Entreprise/Top 100 Clients/Transparency Maroc/Atlas Capital, ligne 10 823-10 955)
- Route API : aucune
- Mock ? **OUI — 100% mock**. Persisted in `enterprise:stakeholders`.

**Axe 3 — Traitement & Logique**
- Transformation : 8 catégories (Gouvernement/Régulateurs/Médias/Investisseurs/Employés/Clients/ONG/Concurrents). `avgInfluence`, `favorablePct`, `defavorablePct`. Scatter data (x=influence, y=sentimentValue, z=engagement). Form ajout stakeholder. Delete stakeholder.

**Axe 4 — Rendu UI**
- Composant : `StakeholderMappingCard` (ligne 10 977) — CardShell `lg:col-span-12`
- États : grid 4 KPI (Influence moyenne / Favorables / Défavorables / Engagement moyen), grid 2 cols (gauche : 8 catégories × stakeholders avec star rating + sentiment dot + engagement %, droite : ScatterChart avec ZAxis + détail stakeholder selected : commsHistory + keyMessages + risks + bouton delete), form ajout stakeholder (catégorie/organisation/contact/fonction/influence/sentiment/engagement slider), AiCommentary
- Section : `SECTION 37` (id=`stakeholder-map`, ligne 11 044)
- Persistance : `enterprise:stakeholders`

---

### Feature 38 — Regulatory Change Feed (AMMC/BAM/CNDP/ESG, temps réel)

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 88 `keyFeatures[2]` « Gouvernance, workflows et autorisations »
- Niveau service : N/A

**Axe 2 — Route & Ingestion**
- Source brute : **Mock dur** — `REG_FEED_INITIAL` (8 régulations hardcoded : AMMC Bulletin Q4 + Circulaire OPRA / BAM Directive LCR + Circularité reporting / CNDP Ligne directrice transferts + Guide DPIA IA / ESG CSRD phase 2 + Taxonomie Verte UE, ligne 11 472-11 545)
- Route API : aucune
- Mock ? **OUI — 100% mock**. Persisted in `enterprise:reg-feed` (watchlist + analyses).

**Axe 3 — Traitement & Logique**
- Transformation : 4 filtres (régulateur / impact / date from / date to). `newCount` (publié <14j). `toggleWatch` (eye/bell). `openAnalysis` modal (affected oui/non + actionsRequired + deadline + responsible). `saveAnalysis`. `clearFilters`.

**Axe 4 — Rendu UI**
- Composant : `RegulatoryChangeFeedCard` (ligne 11 552) — CardShell `lg:col-span-12`
- États : filter bar (régulateur select + impact select + date from + date to + reset + count), feed (8 entries avec badge régulateur coloré + badge NOUVEAU si <14j + badge AFFECTÉ/NON AFFECTÉ si analysé + titre + summary + date + boutons SURVEILLER/ANALYSER L'IMPACT), modal analyse d'impact (affected oui/non + actions required + deadline + responsible), AiCommentary
- Section : `SECTION 38` (id=`reg-feed`, ligne 11 647)
- Persistance : `enterprise:reg-feed`

---

### Feature 39 — Board Resolution Tracker (workflow conseil)

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 168 « Rapports board-ready »
- Niveau service : N/A

**Axe 2 — Route & Ingestion**
- Source brute : **Mock dur** — `RESOLUTIONS_SEED` (5 résolutions hardcoded RES-001 à RES-005, ligne 11 972+)
- Route API : aucune
- Mock ? **OUI — 100% mock**. Persisted in `enterprise:resolutions`.

**Axe 3 — Traitement & Logique**
- Transformation : 5 status (proposed/in-progress/approved/rejected/executed). `RESOLUTION_NEXT_STATUS` map. `transitionStatus` (workflow). `handleCreate` form (6 champs). `handleAddNote` (timeline de progression). `handleExportComex` toast PDF. Filters : 5 status cards cliquables + date range.

**Axe 4 — Rendu UI**
- Composant : `BoardResolutionTrackerCard` (ligne 12 122) — CardShell `lg:col-span-12`
- États : grid 5 status cards filtres + date range + bouton reset, badge count résolutions + exécutées + échéance 30j, boutons EXPORTER COMEX + NOUVELLE RÉSOLUTION, liste résolutions expandable (titre + status badge + proposé par + approuvedBy chips + responsable exécution + échéance + item lié + summary + timeline notes + boutons transition + form ajout note), form nouvelle résolution (titre/proposé par/responsable exécution/échéance/item lié/synthèse)
- Section : `SECTION 39` (id=`board-resolutions`, ligne 13 504)
- Persistance : `enterprise:resolutions`

---

### Feature 40 — Geopolitical Risk Feed (8 marchés francophones)

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 81 `bestFor[1]` « Marchés et parties prenantes multiples »
- Niveau service : N/A

**Axe 2 — Route & Ingestion**
- Source brute : **Mock dur** — `GEO_FEED_INITIAL` (8 events hardcoded : MA Régulation BAM fintech sandbox / FR Conflit retraites / BE Élection communales / CH Diplomatie Sommet Suisse-Afrique / CA Commerce NAFTA / TN Élection campagnes / SN Sanctions UEMOA / CI Conflit CEDEAO Critique, ligne 12 525-12 622)
- Route API : aucune
- Mock ? **OUI — 100% mock**. Persisted in `enterprise:geo-feed` (watchlist).

**Axe 3 — Traitement & Logique**
- Transformation : 6 types events (Sanctions/Conflit/Élection/Régulation/Commerce/Diplomatie). 4 sévérités (Faible/Modéré/Élevé/Critique). 3 impacts réputation (low/medium/high). Mini-map 8 marchés avec dot coloré par sévérité max. Filters : région (via mini-map cliquable) + type + sévérité. `toggleWatch`. Lien scroll vers `market-map` (Feature 30).

**Axe 4 — Rendu UI**
- Composant : `GeopoliticalRiskFeedCard` (ligne 12 626) — CardShell `lg:col-span-12`
- États : mini-map 8 marchés (4×2 grid avec flag + country + dot sévérité + label sévérité), filter bar (type select + sévérité select + reset + count), feed (8 events avec badge type coloré + badge sévérité + badge flag + titre + summary + date + source + bouton SURVEILLER + impact réputation badge + chips pays affectés), bouton « CARTE MULTI-MARCHÉS » (scroll), AiCommentary
- Section : `SECTION 40` (id=`geo-risk-feed`, ligne 12 681)
- Persistance : `enterprise:geo-feed`

---

### Feature 41 — ESG Scorecard (3 piliers × 4 sub-metrics)

**Axe 1 — Promesse & Origine Commerciale**
- URL source : `PricingPage.tsx` ligne 168 « Rapports board-ready » + `AboutPage.tsx` ligne 81 « 5 Expertise pages (Enterprise Risk, Reputation Risk, PR & Comms, ESG, Regulation) »
- Niveau service : N/A

**Axe 2 — Route & Ingestion**
- Source brute : **Mock dur** — `ESG_PILLARS_SEED` (3 piliers × 4 sub-metrics = 12 scores configurables, ligne 12 875-12 912)
  - Environmental : Émissions Scope 1+2 / Utilisation ressources / Biodiversité / Économie circulaire
  - Social : Diversité & inclusion / Pratiques de travail / Impact communautaire / Santé & sécurité
  - Governance : Structure du conseil / Éthique & conformité / Transparence / Droits actionnaires
- Route API : aucune
- Mock ? **OUI — 100% mock**. Persisted in `enterprise:esg-scorecard` (overrides).

**Axe 3 — Traitement & Logique**
- Transformation : `pillarScores = moyenne sub-metrics par pilier`. `overallScore = moyenne pillarScores`. `overallBenchmark`. `deltaVsBenchmark`. `radarData` 3 axes. `barData` par pilier. Manual overrides (`startEdit`/`saveEdit`/`resetOverride`). Modal rapport ESG PDF-ready.

**Axe 4 — Rendu UI**
- Composant : `EsgScorecardCard` (ligne 12 916) — CardShell `lg:col-span-12`
- États : grid 2 cols (gauche : 3 piliers expandable avec score + Delta + benchmark + bar chart 4 sub-metrics + sub-metrics grid avec edit pencil + reset override, droite : RadarChart 3 axes E/S/G + Vous vs Benchmark + bar chart par pilier + score global + delta vs secteur), bouton « RAPPORT ESG » (modal PDF-ready : max-w-3xl, header sticky + body 3 piliers × 4 sub-metrics + footer TÉLÉCHARGER PDF), AiCommentary
- Section : `SECTION 41` (ligne 13 522)
- Persistance : `enterprise:esg-scorecard`

---

## 4. Gaps — Promesses sans UI

| # | Promesse (source) | Gap |
|---|---|---|
| 1 | `PricingPage.tsx` ligne 172 « SSO / SAML » (Grandes Entreprises ✓) | **Aucune UI** dans le dashboard ne mentionne SSO / SAML. La section `settings/users` existe (route Prisma) mais le dashboard Enterprise n'invoque pas `/api/console/settings/users` pour configurer SSO. Aucun bouton SSO, aucun toggle SAML, aucune mention dans la Compliance Cockpit. **Gap total.** |
| 2 | `PricingPage.tsx` ligne 86 + 162 « HarchIQ AI — Version entreprise (illimité) » | Implémenté (Features 1, 16, 27) **mais aucune instrumentation quota** : le route `POST /ask` ne check pas de compteur, ne persiste pas le nombre de questions, n'a pas de garde-fou « illimité » vs autre plan. C'est « illimité » par absence de limite, pas par design. |
| 3 | `PricingPage.tsx` ligne 87 + 170 « Intégrations API et MCP » | Implémenté en UI (Features 19, 29, 35) **mais aucune intégration MCP réelle** : les 5 connecteurs MCP (ServiceNow/Splunk/Tableau/Slack/Teams) sont des toggles on/off en localStorage, sans endpoint MCP réel, sans test de connexion réel (`handleTest` est un `Math.random() > 0.1` simulé, ligne 9 908). Idem pour Splunk/QRadar/Sentinel (Feature 35). |
| 4 | `PricingPage.tsx` ligne 88 + 171 « Gouvernance, workflows et autorisations » | Implémenté en UI (Features 17, 18, 26, 28, 34, 39) **mais les workflows sont des toasts** : `handleApprove`/`handleReject` (Feature 26) ne font que retirer l'item de la liste locale + toast, aucune persistance backend, aucune notification au demandeur. RBAC role est hardcoded `"comms"` (ligne 13 254), pas lu depuis la session. |
| 5 | `AtelierHome.tsx` ligne 3 984 + `AboutPage.tsx` ligne 348 + `MethodPage.tsx` ligne 42 « Rapport PDF board-ready mensuel » | Implémenté en UI (Features 22, 27, 33) **mais aucun POST de génération PDF** : `handleGenerate` (Feature 22) = toast only. `handleExportPdf` (Feature 27) = toast only. `handleConfirmGen` (Feature 33) = toast only + `state.lastGenerated[id] = Date.now()`. **Aucun PDF n'est réellement généré côté serveur**, aucune route `/api/pdf/...` n'est invoquée. |

---

## 5. Orphans — UI sans promesse pricing explicite

| # | Section | UI orphan |
|---|---|---|
| 1 | Feature 9 — Appels API 30J | « Quota Enterprise illimité en pratique — seuil d'alerte à 80% » — promesse interne, pas au pricing |
| 2 | Feature 10 — Engagement Total | Formule `mentions*12 + alertCount*8` arbitraire, pas promis au pricing |
| 3 | Feature 11 — Tendance Sentiment 90j avec compare mode | Compare mode synthétique (compA/compB générés par formule, pas par API) — pas promis |
| 4 | Feature 13 — Radar 7 axes | 7 axes calculés côté client à partir de 6 scores Prisma — pas promis |
| 5 | Feature 15 — Grille 9 LLMs | 9 LLMs promis en interne (header) mais le pricing ne spécifie pas le nombre — l'API ne remonte que 4 LLMs en DB, les 5 autres sont synthétiques |
| 6 | Feature 18 — Tableau Multi-Équipes | 5 équipes hardcoded, pas d'API, pas promis au pricing |
| 7 | Feature 21 — DEFCON Crise (5 niveaux) | Système DEFCON militaire, pas promis au pricing |
| 8 | Feature 23 — Competitor Deep Dive | Line chart 30j synthétique (`sin`/`cos`), pas promis |
| 9 | Feature 24 — Suivi ESG (3 cards) | ESG pas explicitement promis au pricing (seulement « Rapports board-ready » qui est générique) |
| 10 | Feature 30 — Multi-Market Reputation Map (8 marchés) | 8 marchés francophones (MA/FR/BE/CH/CA/TN/SN/CI), pas promis au pricing |
| 11 | Feature 31 — Executive Milestone Tracker | 5 jalons hardcoded, pas promis |
| 12 | Feature 31bis — Risk Heatmap Matrix 5×5 | Matrice des risques, pas promis au pricing (mentionné uniquement dans `AboutPage.tsx` ligne 129) |
| 13 | Feature 36 — Crisis War Room | Cellule de crise full-screen, pas promis au pricing |
| 14 | Feature 37 — Stakeholder Mapping | Cartographie 8 catégories de parties prenantes, pas promis au pricing |
| 15 | Feature 38 — Regulatory Change Feed | 8 régulations hardcoded, pas promis au pricing (la `Veille Réglementaire` Feature 25 couvre déjà le sujet via API réelle) |
| 16 | Feature 39 — Board Resolution Tracker | Workflow de résolutions du conseil, pas promis au pricing |
| 17 | Feature 40 — Geopolitical Risk Feed | 8 events géopolitiques hardcoded, pas promis au pricing |
| 18 | Feature 41 — ESG Scorecard | 12 sub-metrics configurables, pas promis au pricing (doublon fonctionnel avec Feature 24 Suivi ESG) |

---

## 6. Anomalies & Incohérences

1. **Doublon HarchIQ** : 3 sections (1, 16, 27) consomment la même route `POST /api/console/ask`. Feature 1 = workspace complet avec historique persistant 50 conversations. Feature 16 = chat simplifié sans historique. Feature 27 = generator de briefings board-ready avec 4 templates. Trois UX distinctes pour le même service IA.
2. **Doublon API & Intégrations** : 2 sections (19 et 29). Feature 19 = vue synthétique 1 clé + 5 intégrations. Feature 29 = hub complet multi-clés + webhooks + 5 connecteurs MCP + rate limit 600 req/min. Deux UX distinctes pour la même promesse « Intégrations API et MCP ».
3. **Doublon ESG** : Feature 24 (Suivi ESG, 3 cards dérivées de `brand-health.score`) + Feature 41 (ESG Scorecard, 3 piliers × 4 sub-metrics configurables avec overrides). Deux UX distinctes pour le même périmètre ESG.
4. **Doublon Veille Réglementaire** : Feature 25 (API live `/api/console/regulatory-feed`) + Feature 32 (Regulatory Calendar mock) + Feature 38 (Regulatory Change Feed mock). Trois sections pour la conformité réglementaire.
5. **Numérotation des sections cassée** : le header du fichier annonce 25 sections, le footer annonce 36, le code en contient 43 avec doublons (deux SECTION 31, deux SECTION 32, deux SECTION 33, deux SECTION 26 numérotés).
6. **Quotas hardcoded** : `apiQuota = 50000` (Feature 9), `apiCalls = 14327 + ...` (Feature 9 & 19), `rateLimitPerMin = 600` (Feature 29), `currentPerMin = 142` (Feature 29) — tous hardcoded, pas remontés d'une route `/api/console/quota`.
7. **Équipes multi-BU hardcoded** : `teamCount = 12` (Feature 17), `MULTI_TEAM_ROWS` (Feature 18, 5 équipes hardcoded) — pas d'API `/api/console/teams`.
8. **ChatGPT-style sparkline aléatoire** : Feature 10 `spark = Array.from({length: 7}, ...)` avec `Math.random()` à chaque render (ligne 3 074) — non persisté, change à chaque re-render.
9. **Compétiteurs synthétiques** : Feature 11 `compareMode` génère `compA` et `compB` par formule `sin(date.length)` / `cos(date.length)` (ligne 3 154-3 155) — pas remontés par API.
10. **Feature 15 LLM synthétiques** : si l'API ne retourne que 4 LLMs (ChatGPT/Claude/Gemini/Perplexity en démo), les 5 autres (Grok/Mistral/Llama/Copilot/HarchIQ) sont affichés avec `cited = idx < citedCount` + `position = #idx+1` + `citationPct = max(20, min(95, 90 - idx*8))` — **valeurs fabriquées côté client**.
11. **RBAC role hardcoded** : `currentUserRole: UserRole = "comms"` (ligne 13 254) — ne lit pas `session.user.role`. La Governance Command Bar affiche donc toujours « Communication » quel que soit l'utilisateur réel.
12. **handleGenerate (Feature 22) ne déclenche aucune génération** : `toast.success("Briefing exécutif en cours de génération.")` sans POST, sans polling, sans création de briefing en DB. La Feature 27 (Board Briefing Generator) fait un vrai POST /ask, mais pas la Feature 22.
13. **`usePersistentState` SSR-unsafe pattern** : le hook (ligne 7 48) lit `localStorage` dans un `useEffect` sans guard `typeof window`, ce qui peut causer un flash de valeur initiale au hydratation. Pas un bug bloquant mais un anti-pattern.

---

## 7. Bilan Final

### 7.1 Total features auditées : **43**

- Sections alimentées par API Prisma live : **17** (Features 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17, 19, 20, 21, 22, 23, 24, 25, 27, 0) — dont 3 qui consomment `POST /api/console/ask` (Features 1, 16, 27).
- Sections 100 % mock (client-only + localStorage) : **22** (Features 18, 26, 28, 29, 30, 31, 31bis, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, + sous-parties mock de Features 9, 17, 19, 24, 0).
- Routes API live : **14** (13 GET + 1 POST), toutes Prisma-backed avec démo fallback.

### 7.2 Gaps critiques (promesses non tenues)

1. **SSO / SAML** — promis au pricing, **0 UI**.
2. **Quota IA illimité instrumenté** — promis, mais aucun compteur côté serveur.
3. **Intégrations MCP réelles** — promis, mais toggles mock sans endpoint MCP réel.
4. **Workflows backend** — promis, mais toasts uniquement, pas de persistance serveur.
5. **Génération PDF board-ready** — promis, mais aucun POST de génération PDF côté serveur.

### 7.3 Orphans UI (sans promesse pricing)

18 sections enrichissent le dashboard au-delà des promesses pricing explicites. La plupart relèvent d'une vision produit élargie (war room, stakeholder map, geopolitical feed, board resolution tracker, ESG scorecard, risk heatmap, SIEM, audit log, regulatory calendar, multi-market map). Aucun de ces orphans n'est destructeur — ils élargissent l'offre — mais ils créent un écart entre le périmètre commercial (pricing) et le périmètre produit (dashboard), ce qui peut générer des attentes non contractualisables.

### 7.4 Recommandations stratégiques (VORTEX)

1. **Comblater le gap SSO/SAML** : ajouter une section `settings/sso` avec configuration SAML/OIDC, ou retirer la promesse du pricing.
2. **Implémenter un vrai compteur quota IA** : route `/api/console/quota` retournant `{used, limit, plan}` et bloquant au-delà. Sinon « illimité » est un mot, pas un service.
3. **Brancher les MCP sur de vrais endpoints** : ServiceNow/Splunk/Tableau ont des APIs publiques — implémenter au moins Splunk HEC pour valider le pattern, ou retirer le toggle.
4. **Persisté les workflows** : `handleApprove`/`handleReject` doivent POST sur `/api/console/approvals/{id}/{approve|reject}` et créer une entrée `auditLog`.
5. **Générer réellement les PDFs** : utiliser `/api/pdf/[type]/route.ts` (déjà présent dans la codebase) ou `/api/console/reports/[id]/pdf/route.ts` pour générer les PDFs, pas des toasts.
6. **Dédupliquer HarchIQ** : merger Features 1 et 16, ou justifier la double présence (workspace vs chat rapide).
7. **Dédupliquer API & Intégrations** : merger Features 19 et 29.
8. **Dédupliquer ESG** : merger Features 24 et 41 (Feature 41 est strictement supérieure).
9. **Dédupliquer Veille Réglementaire** : merger Features 25, 32 et 38 (Feature 25 a l'API, Features 32 et 38 sont mock).
10. **Renuméroter les sections** : 43 sections réelles, numérotation cassée. Refaire une numérotation séquentielle 1-43.

---

**FIN DU RAPPORT VORTEX — AUDIT-ENTERPRISE**
