# AUDIT MAÎTRE — Cartographie Valeur-to-UI
## Harch Atelier — 4 types de comptes

> Task ID: AUDIT-MASTER
> Agent: Kaelen Vance (Principal Architect) + VORTEX (4 sub-agents)
> Date: 11 août 2026
> Méthode: 4 agents en parallèle, 1 par type de compte. Zéro généralisation.
> Livrables détaillés: audit-essentiel.md (1257 lignes), audit-pro.md (789), audit-enterprise.md (1234), audit-agency.md (1046)

---

## SYNTHÈSE EXÉCUTIVE

| Compte | Features auditées | REAL (backend) | MOCKED (client-side) | GAPS (promesse sans UI) | ORPHELINS (UI sans promesse) |
|--------|-------------------|----------------|----------------------|------------------------|------------------------------|
| **Essentiel** | 38 | 9 | 9 (100% mock) + 7 partiel | 10 | 14 |
| **Pro** | 34 | 22 | 8 | 11 | 7 |
| **Enterprise** | 43 | 17 (API live) | 22 (100% mock) | 5 critiques | 18 |
| **Agency** | 43 (dans fichier orphan) | ~15 | ~16 (hash mock) + ~15 (fiction) | 3 systèmes conflictuels | TOUT le fichier 16898 lignes est DEAD CODE |
| **TOTAL** | **158** | **63** | **77** | **39** | **39+** |

---

## 🚨 5 FINDINGS CRITIQUES (blockers production)

### 1. AGENCY — 16 898 lignes de code mort
Le fichier `src/app/atelier/console/agency/AgencyDashboard.tsx` (16898 lignes, 43 sections, toutes les features ENV/R2/R3/R4) **n'est importé par aucune page**. Les utilisateurs voient `AgencyConsole.tsx` (2302 lignes, 5 sections) à la place. Tout le travail des 8 agents agency est invisible.

### 2. ESSENTIEL — RBAC casse 5 sections du dashboard
`auth.config.ts:28` déclare `essential|pro|enterprise|agency` mais 5 routes API ont `allowedTypes = ["brand-monitor","market-competitor","investment-bank","harch-alpha"]` (ancien système). Un utilisateur `essential` réel reçoit **HTTP 403** sur :
- `/api/console/ai-visibility`
- `/api/console/sentiment-trend`
- `/api/console/topics`
- `/api/console/insights` (fallback forcé)
- `/api/console/source-distribution` (partiel)

### 3. PRO — Quota HarchIQ 200/jour non vérifié serveur
`const [quota, setQuota] = useState({ used: 7, total: 200 })` — purement client-side. La route `/api/console/ask` n'a aucun rate-limit par quota. Un utilisateur peut contourner par refresh/multi-tab.

### 4. ENTERPRISE — 5 promesses critiques sans implémentation
- **SSO/SAML** : promis dans la matrice pricing, **0 UI** dans le dashboard
- **MCP intégrations** : toggles Splunk/ServiceNow/Tableau/Slack/Teams mais `handleTest = Math.random() > 0.1` — aucun endpoint MCP réel
- **Workflows gouvernance** : `handleApprove/handleReject` ne font que toast + setState local, pas de persistance serveur
- **PDF board-ready** : 3 sections (22/27/33) ont des boutons "Générer PDF" qui font juste `toast.success` — aucun POST
- **HarchIQ illimité** : promis, mais aucun compteur côté serveur

### 5. CONFLIT NOMENCLATURE — 2 systèmes de pricing en parallèle
- **PricingPage** : Essentiel / Pro / Grandes Entreprises / Agences
- **AtelierHome** (landing) : Émergence (15K) / Corporate (40K) / Sovereign (75K) + "Data hosted in EU"
- **Changelog v3.0.0** documente un rename qui n'a jamais atteint PricingPage
- **DB prisma** : `brand-monitor | market-competitor | investment-bank | harch-alpha`

---

## DÉTAIL PAR COMPTE

### 1. COMPTE ESSENTIEL (38 features)

**Promesses verbatim** (PricingPage.tsx lignes 26-46) :
- Tagline : "Pour les petites équipes de communication et marketing qui démarrent leur veille réputationnelle et leur suivi de la visibilité IA."
- Capacités : Veille médiatique, Social listening, Suivi visibilité IA (GenAI Lens), Relations médias
- Fonctions clés : HarchIQ AI (50 questions/jour), Alertes et rapports, Tableaux de bord prédéfinis

**Features REAL (9)** — backend Prisma + LLM :
1. HarchIQ AI Workspace → POST /api/console/ask (GLM-4 réel)
2. Score de Réputation → GET /api/console/brand-health
3. Alertes Actives → GET /api/console/crisis-alerts
4. Dernières Mentions → GET /api/console/crisis-alerts
5. Indicateur de Crise → brand-health + crisis-alerts
6. Position Harch 100 → GET /api/harch100/latest (public)
7. Boîte à Outils CSV → GET /api/console/export-csv (streaming réel)
8. Daily Briefing → brand-health + source-distribution (envoi WhatsApp mock)
9. Rappel Dircom → GET /api/console/brand-health

**Features MOCKED (9)** — simulation client-side pure :
1. Carte Chaleur Géo — 6 villes codées en dur
2. Activité Réseau Social — 30j Math.sin/cos/random
3. Météo Sentiments par Langue — 3 langues codées en dur
4. Welcome Onboarding Banner — statique localStorage
5. Notification Bell — 3 seed notifications factices
6. Brand Mention Feed — pool 22 sources × 21 headlines, setTimeout récursif
7. WhatsApp Alert Preview — 3 bulles + bouton Tester = toast seulement
8. Saved Searches Starter — localStorage filtrant un feed simulé
9. Évolution Score 30j — historique sin/cos + markers codés en dur

**GAPS (10 promesses sans UI)** :
1. "Relations médias" — capability pricing, ZÉRO UI
2. "PDF 8 pages Essentiel" — bouton mock toast
3. "WhatsApp digest" — bouton Tester mock toast
4. "Crawl 5 min" — aucune indication UI
5. "1 marque" — aucun sélecteur de marque
6. "Tableaux de bord prédéfinis" — un seul dashboard fixe
7. "Formation 2h visio 1 utilisateur" — aucune intégration visio
8. "48h après signature" — aucun tracker onboarding
9. "Engagement annuel + remise 15%" — aucun billing UI
10. "Préavis 30 jours annulation" — aucune UI annulation

**3 toast-only handlers qui mentent** :
- "Exporter PDF" (Section 10) → toast.success au lieu de POST
- "Recevoir sur WhatsApp" (Daily Briefing) → toast au lieu de route
- "Mode Crise" (Indicateur de Crise) → toast au lieu d'activation backend

→ **Rapport complet** : `audit-essentiel.md` (1257 lignes)

---

### 2. COMPTE PRO (34 features)

**Promesses verbatim** (PricingPage.tsx lignes 47-68) :
- Tagline : "Pour les équipes régionales et les organisations de marketing multicanal qui doivent anticiper avec une analyse avancée."
- LE PLUS POPULAIRE (highlighted: true)
- Fonctions clés : HarchIQ AI — Avancé (200 questions/jour), Benchmarking concurrentiel, Tableaux de bord et rapports personnalisés

**Features REAL (22)** — backend Prisma complet :
- brand-health, sentiment, mentions, AI visibility, share-of-voice, weekly comparison, reports list, crisis alerts, topics, sources, influencers, competitor radar, ask LLM (tous via useApi<T>)

**Features MOCKED (8)** :
1. Recherches Sauvegardées + Alertes — 3 searches + 3 alerts hardcodées en useState (même pas persistant)
2. Programmation Rapports — localStorage, jamais transmis à un worker/cron
3. Analyse Contenu Concurrents — recentArticles générés depuis pool de 8 headlines
4. Saved Filter Presets — localStorage
5. Alert Rules Builder — simulation
6. Competitor Watchlist — favoris localStorage, données dérivées
7. Media Reach Calculator — outil standalone, données simulées
8. SOV Trends — synthèse 30j/90j/12m

**3 ORPHELINS (ghost code ~1150 lignes)** :
- `sentiment-heatmap` — défini dans DEFAULT_WIDGET_ORDER + component, mais ABSENT du mapping `widgets` → jamais rendu
- `campaign-tracker` — idem
- `dashboard-templates` — idem

**Conflit nomenclature** :
- PricingPage : Essentiel / Pro
- AtelierHome : Émergence (15K) / Corporate (40K)
- Deux offres "highlighted" incompatibles sur 2 surfaces marketing

→ **Rapport complet** : `audit-pro.md` (789 lignes)

---

### 3. COMPTE ENTERPRISE / GRANDES ENTREPRISES (43 sections)

**Promesses verbatim** (PricingPage.tsx lignes 69-90) :
- Tagline : "Pour les marques leaders et internationales qui industrialisent l'intelligence réputationnelle avec gouvernance et conformité."
- Capacités : + Marketing d'influence (vs Pro)
- Fonctions clés : HarchIQ AI illimité, Intégrations API et MCP, Gouvernance/workflows/autorisations

**14 endpoints API live** (13 GET via useApi + 1 POST /ask), tous Prisma-backed avec démo fallback.

**17 sections alimentées par API réelle**, **22 sections 100% mock** (localStorage).

**5 GAPS critiques** :
1. **SSO/SAML** — promis matrice pricing, 0 UI
2. **Quota IA illimité** — promis, aucun compteur serveur
3. **MCP intégrations** — toggles mock, handleTest = Math.random() > 0.1
4. **Workflows backend** — handleApprove/handleReject = toast + setState, pas de persistance
5. **PDF board-ready** — 3 sections (22/27/33), boutons = toast.success, aucun POST

**4 DUPLICATIONS** :
- HarchIQ chat ×3 (Features 1, 16, 27 — toutes POST /ask)
- API & Intégrations ×2 (Features 19, 29)
- ESG ×2 (Features 24, 41)
- Veille Réglementaire ×3 (Features 25, 32, 38 — seule la 25 a une API live)

**13 anomalies** :
- `currentUserRole = "comms"` hardcoded (ne lit pas la session)
- `Math.random()` sparkline (change à chaque re-render)
- Compétiteurs synthétiques (`sin(date.length)`)
- 5/9 LLMs client-fabriqués quand la DB n'en a que 4
- Quotas hardcoded : 50000 appels, 600 req/min, 142 current

→ **Rapport complet** : `audit-enterprise.md` (1234 lignes)

---

### 4. COMPTE AGENCES (CRITIQUE — code mort)

**Promesses verbatim** (PricingPage.tsx lignes 91-114) :
- Tagline : "Pour les agences RP et cabinets de conseil qui gèrent plusieurs clients en portefeuille avec white-label et gouvernance multi-comptes."
- Note : "3 niveaux disponibles selon la taille de l'agence"
- Fonctions clés : HarchIQ Avancé, API et MCP, Gouvernance, Multi-clients + White-label

**3 SURFACES AGENCY CONFLICTUELLES** :

| Surface | Path | Statut | Lignes | Features |
|---------|------|--------|--------|----------|
| A | /atelier/agency | MOUNTED | 1193 + 808 | 8 — Brick 8 White-Label + GLM-4 WhatsApp Import |
| B | /atelier/console/agency | MOUNTED | 2302 | 5 — AgencyConsole appended to shared Dashboard |
| C | AgencyDashboard.tsx | **ORPHAN (zero importers)** | **16898** | **43** — tout le travail ENV/R2/R3/R4 |

**LE FICHIER 16898 LIGNES EST DU CODE MORT.** Les 43 sections (tier badge, client wizard, commission calc, portal preview, pitch pipeline, workload balancer, client health, churn risk, revenue forecast, team performance, pitch analytics, white-label editor, client lifecycle, upsell tracker, agency benchmark, client revenue, pitch templates, multi-client comparison) — **tout est invisible pour les utilisateurs**.

**3 définitions conflictuelles des 3 niveaux** :
- Définition A (live, /atelier/agency) : 1-5 / 6-49 / 50+ — label only, pas de commission
- Définition B (orphan seulement) : 1-4 / 5-19 / 20+ — avec ladder 20/25/30%
- Définition C (pricing page) : narratif only, pas de thresholds
- FAQ : "3 to 50 clients" + "15-30% commission"
- PartnersPage : 20% flat pour PR agencies
- DB : single `Agency.commissionPct` field — le ladder est une fiction client-side

**Mock vs Real** :
- Surface A : 8/8 REAL (incl. GLM-4 WhatsApp import réel)
- Surface B : 5/5 REAL + 3 toast-only buttons
- Surface C : ~15 REAL + ~16 deterministic-hash-mock + ~15 pure localStorage fiction + ~15 toast-only

**Le killer feature B2B2B** (GLM-4 WhatsApp Import → auto-create sub-client avec Zod prompt-injection defense) existe SEULEMENT sur Surface A — pas exposé sur la console mounted (Surface B).

→ **Rapport complet** : `audit-agency.md` (1046 lignes)

---

## CARTOGRAPHIE DES ROUTES API (toutes comptes confondus)

### Routes REAL (backend Prisma + LLM)
| Route | Méthode | Source | Comptes autorisés |
|-------|---------|--------|-------------------|
| /api/console/brand-health | GET | Prisma Article + Mention | tous (session) |
| /api/console/crisis-alerts | GET | Prisma Alert | tous |
| /api/console/ask | POST | LLM GLM-4 + Prisma sources | tous |
| /api/console/export-csv | GET | Prisma streaming | tous |
| /api/console/source-distribution | GET | Prisma Article | tous |
| /api/console/ai-visibility | GET | Prisma AiCitation | ⚠️ 403 si essential |
| /api/console/sentiment-trend | GET | Prisma Article | ⚠️ 403 si essential |
| /api/console/topics | GET | Prisma Article | ⚠️ 403 si essential |
| /api/console/insights | GET | Prisma Insight | ⚠️ fallback forcé |
| /api/console/share-of-voice | GET | Prisma Mention | ⚠️ 403 si essential |
| /api/console/reports/list | GET | Prisma Report | tous |
| /api/console/settings/users | GET | Prisma User | tous |
| /api/harch100/latest | GET | Prisma Harch100Entry | public |
| /api/agency/clients | GET | Prisma AgencyClient | agency-admin |
| /api/agency/switch | POST | cookie switch | agency-admin |

### Routes MOCKED (pas de backend)
- Aucune route pour : commission, campaigns, templates, team assignments, pitch pipeline, white-label theme, client lifecycle, upsell, churn, benchmark, forecast, team performance, pitch analytics, client health trend, revenue tracker

---

## RECOMMANDATIONS PRIORITISÉES

### P0 — Blockers (cette semaine)
1. **Brancher AgencyDashboard.tsx** — soit importer dans /atelier/console/agency/page.tsx, soit merger les 43 sections dans AgencyConsole.tsx. Actuellement 16898 lignes invisibles.
2. **Fixer le RBAC** — ajouter "essential" | "pro" | "enterprise" | "agency" dans les `allowedTypes` de 5 routes API. Sinon les utilisateurs Essentiel réels ont 5 sections cassées.
3. **Harmoniser la nomenclature** — choisir Essentiel/Pro/Grandes Entreprises/Agences PARTOUT (PricingPage, AtelierHome, DB prisma, auth.config). Retirer Émergence/Corporate/Sovereign et brand-monitor/market-competitor/etc.

### P1 — Critical (2 semaines)
4. **Serveur-enforcer le quota HarchIQ** — POST /api/console/ask doit vérifier le quota par utilisateur (50/200/illimité) côté serveur, pas client-side.
5. **Implémenter les 3 toast-only handlers** qui mentent — PDF export, WhatsApp send, Crisis mode activation. Soit brancher les routes existantes, soit retirer les boutons.
6. **Combler les 3 orphelins Pro** — sentiment-heatmap, campaign-tracker, dashboard-templates sont définis mais jamais rendus (1150 lignes ghost code). Soit les ajouter au mapping `widgets`, soit les supprimer.

### P2 — Important (1 mois)
7. **Implémenter SSO/SAML Enterprise** — promis, 0 UI. Soit livrer, soit retirer la promesse pricing.
8. **Brancher les MCP** — Splunk HEC prioritaire. Remplacer Math.random() par vraies connexions.
9. **Persister les workflows gouvernance** — POST /api/console/approvals/{id}/{approve|reject}
10. **Générer réellement les PDFs** — /api/pdf/[type] ou /api/console/reports/[id]/pdf
11. **Dédupliquer Enterprise** — merger HarchIQ x3, API x2, ESG x2, Veille Réglementaire x3

### P3 — Backlog
12. Définir 1 système de 3 niveaux agency (thresholds + commission) et l'appliquer partout
13. Brancher le GLM-4 WhatsApp Import sur la console mounted (Surface B)
14. Remplacer les 9 mocks Essentiel par des routes réelles
15. Remplacer les 8 mocks Pro par des routes réelles
