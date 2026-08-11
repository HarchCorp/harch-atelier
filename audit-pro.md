# AUDIT-PRO — Exhaustive Value-to-UI Audit (Plan Pro)

**Agent**: VORTEX (Principal Systems & Data Auditor)
**Task ID**: AUDIT-PRO
**Cible**: `/home/z/my-project/src/app/atelier/console/pro/ProDashboard.tsx` (14 165 lignes)
**Règle appliquée**: ZERO GENERALIZATION — chaque feature distincte (logique ou rendu différent) = entrée séparée.

---

## 0. Synthèse commerciale (PricingPage.tsx — extrait verbatim)

**Fichier source**: `/home/z/my-project/src/app/atelier/pricing/PricingPage.tsx` — `PLANS[1]` (lignes 47-68)

```ts
{
  name: "Pro",
  tagline:
    "Pour les équipes régionales et les organisations de marketing multicanal qui doivent anticiper avec une analyse avancée.",
  highlighted: true,                         // carte "Le plus populaire" — bordure verte 2px
  capabilities: [
    "Veille médiatique",
    "Social listening",
    "Suivi de la visibilité IA (GenAI Lens)",
    "Relations médias",
  ],
  bestFor: [
    "Les équipes régionales",
    "Les organisations de marketing multicanal",
    "Équipes de communication axées sur les données",
  ],
  keyFeatures: [
    "HarchIQ AI — Avancé (200 questions/jour)",
    "Benchmarking concurrentiel",
    "Tableaux de bord et rapports personnalisés",
  ],
}
```

**Badge commercial**: `Le plus populaire` (PricingPage ligne 380, conditionnel `plan.highlighted`)
**Prix affiché**: `Sur devis` — sous-titre `Engagement annuel · paiement mensuel` (lignes 422, 433)
**CTA**: `Contacter le service commercial →` (lien `/atelier/contact`, ligne 472)

### Matrice comparative (PricingPage lignes 153-177) — colonne Pro uniquement

| Catégorie | Critère | Pro |
|---|---|---|
| Capacités incluses | Veille médiatique | ✓ |
| Capacités incluses | Social listening | ✓ |
| Capacités incluses | Suivi de la visibilité IA (GenAI Lens) | ✓ |
| Capacités incluses | Relations médias | ✓ |
| Capacités incluses | Marketing d'influence | — |
| HarchIQ AI | Niveau HarchIQ AI | Avancé |
| HarchIQ AI | Questions par jour | 200 |
| Analyse & rapports | Alertes et rapports | ✓ |
| Analyse & rapports | Tableaux de bord prédéfinis | ✓ |
| Analyse & rapports | Benchmarking concurrentiel | ✓ |
| Analyse & rapports | Tableaux de bord et rapports personnalisés | ✓ |
| Analyse & rapports | Rapports board-ready | — |
| Intégrations & gouvernance | Intégrations API et MCP | — |
| Intégrations & gouvernance | Gouvernance, workflows et autorisations | — |
| Intégrations & gouvernance | SSO / SAML | — |
| Multi-clients | Multi-clients | — |
| Multi-clients | White-label | — |
| Multi-clients | Facturation par compte | — |

### Promesses complémentaires dans la FAQ (PricingPage lignes 179-200)

- `"Pour le plan Essentiel : 48 heures après signature. Pour les plans Pro et Grandes Entreprises : 5 à 10 jours ouvrés (incluant l'onboarding, le paramétrage des sources et la formation de l'équipe)."`
- `"Plans Essentiel et Pro : engagement annuel avec paiement mensuel. [...] Un essai pilote de 30 jours est possible pour les plans Pro et supérieurs."`
- Texte affiché sous la matrice (ligne 735) : `"Le plan Pro est mis en avant pour les équipes régionales."`

### Incohérence de branding détectée entre surfaces marketing

- **PricingPage** utilise les 4 noms : Essentiel / Pro / Grandes Entreprises / Agences
- **AtelierHome.tsx** (section `id="pricing"`, lignes 3593-3648) utilise 3 noms différents : Émergence (15K MAD) / Corporate (40K MAD, highlighted) / Sovereign (75K MAD)
- **ChangelogPage.tsx** (lignes 56-68) documente un renommage `Starter / Pro / Enterprise → Émergence / Corporate / Sovereign` (version 3.0.0) — mais PricingPage n'a jamais été migrée vers cette nouvelle grille.
- **Conclusion** : PricingPage et AtelierHome décrivent 2 grilles tarifaires **incompatibles**. Laudit qui suit prend PricingPage comme source de vérité (page dédiée /atelier/pricing, page de destination post-CTA).

---

## 1. Cartographie de l'architecture (ProDashboard.tsx)

### Fichier header (lignes 1-72)

- 25 SECTIONS commentées + 11 features additionnelles (R2-PRO-A/B, R3-PRO-A, R4-PRO-A, ENV-PRO) = **36 features distinctes** identifiées dans le code.
- `DEFAULT_WIDGET_ORDER` (lignes 13732-13769) liste 36 IDs widget.
- **Cependant, seuls 33 widgets sont réellement instanciés dans l'objet `widgets` (lignes 13910-13977)** — 3 widgets sont définis comme composants mais **JAMAIS rendus** (orphans). Détails au §3.

### Routes API réellement appelées (grep `fetch(`/useApi(`, lignes 1999, 3973, 13842-13855)

| # | Endpoint | Méthode | Hook/Fn appelant | Section(s) UI |
|---|---|---|---|---|
| 1 | `/api/console/brand-health` | GET | `useApi<BrandHealth>` (13842) | §1.2 (Score), §1.4 (Mentions), §1.8 (Engagement) |
| 2 | `/api/console/crisis-alerts` | GET | `useApi<CrisisAlertsResp>` (13843) | §1.14 (Dernières mentions), §1.21 (Heatmap), §1.8 |
| 3 | `/api/console/ai-visibility` | GET | `useApi<AiVisibilityResp>` (13844) | §1.5 (Citations IA) |
| 4 | `/api/console/sentiment-trend?range=7d\|30d\|90d` | GET | `useApi<SentimentTrendResp>` (13845) | §1.3, §1.4, §1.9 (Tendance), §1.13, §1.19 (Reach), §1.20 (Crise), §1.29 (Heatmap sent), export |
| 5 | `/api/console/topics` | GET | `useApi<TopicsResp>` (13848) | §1.13, §1.23 (Émergents) |
| 6 | `/api/console/source-distribution` | GET | `useApi<SourceDistResp>` (13849) | §1.7, §1.22 (Répartition) |
| 7 | `/api/console/competitor-radar` | GET | `useApi<CompetitorRadarResp>` (13850) | §1.10, §1.11, §1.28 (Watchlist), §1.32 (Contenu), §1.34 (Tendances SOV) |
| 8 | `/api/console/share-of-voice` | GET | `useApi<ShareOfVoiceResp>` (13851) | §1.6, §1.12 (Donut), §1.10, §1.32, §1.34 |
| 9 | `/api/console/weekly-comparison` | GET | `useApi<WeeklyComparisonResp>` (13852) | §1.15 |
| 10 | `/api/console/reports/list` | GET | `useApi<ReportsListResp>` (13853) | §1.16 |
| 11 | `/api/console/influencers?range=30d` | GET | `useApi<InfluencersResp>` (13854) | §1.18 |
| 12 | `/api/console/alert-config` | GET | `useApi<AlertConfigResp>` (13855) | §1.17 |
| 13 | `/api/console/ask` | POST | `fetch(...)` direct (3973) | §1.1 (HarchIQ chat) |
| 14 | `/api/console/exposure-trend` | GET | **commenté ligne 65 mais NON appelé dans le code** | (aucun widget ne l'utilise) |
| 15 | `/api/console/insights` | GET | **commenté ligne 67 mais NON appelé dans le code** | (aucun widget ne l'utilise) |
| 16 | `/api/harch100/latest` | GET | **commenté ligne 68 mais NON appelé dans le code** | (aucun widget ne l'utilise) |
| 17 | `/api/console/alert-config` | PATCH | **non appelé depuis ProDashboard** (le wizard écrit dans localStorage) | (aucune persistance serveur) |

### Nature réelle de chaque route API (lecture des fichiers `route.ts`)

| Route | Source brute | Démo fallback | Traitement |
|---|---|---|---|
| `brand-health/route.ts` | Prisma `reputationScore`, `article`, `aIVisibility`, `company` (lignes 26-32) | `buildDemoResponse()` ligne 69 (score 74, sentiment 42/28/30, etc.) | Calcule `crisisScore = negativeShare*60 + min(25, articles24h/50*25)` ; dérive `crisisLevel` |
| `crisis-alerts/route.ts` | Prisma `article` (negatives 7j), `riskAssessment`, `inboundWhatsAppMessage` (flagged) | `buildDemo()` ligne 86 (3 alertes hardcodées Hespress/TikTok/WhatsApp) | Mappe sentimentScore→severity ; fusionne 3 sources |
| `ai-visibility/route.ts` | Prisma `aIVisibility` | `demoAiVisibilityResponse()` (lib/demo-console-api) | Garde dernière ligne par plateforme ; calcule `visibilityScore = cited/total*100` |
| `sentiment-trend/route.ts` | Prisma `article` (depuis 7/30/365j) | Pas de demo fallback explicite mais OK si `company` null → renvoie `data: []` | Bucket par jour ; `avgScore = sum/count` ; counts pos/neu/neg |
| `competitor-radar/route.ts` | Prisma `company` (même secteur), `article`, `reputationScore`, `aIVisibility`, `riskAssessment` | `buildDemo()` ligne 59 (Attijariwafa/BOA/BCP) | Calcule 6 scores (sentiment, sov, aiVis, influencerAuthority, crisisResilience, mediaReach) — formules math |
| `share-of-voice/route.ts` | Prisma `article.count` + `aggregate._avg.sentimentScore` par compagnie | `buildDemo()` ligne 60 (5 banques) | `trend = 0` (TODO commentaire ligne 47) |
| `weekly-comparison/route.ts` | Prisma `article` (14j bucketé 7j vs 7j) + `aIVisibility.count` (cited) | `buildDemo()` ligne 188 | `directionOf`/`deltaOf` calculent ratio vs période précédente |
| `topics/route.ts` | Prisma `article` (regroupé par `source` comme proxy topic) + `riskAssessment.category` | `demoTopicsResponse()` | Top 8 by count, type "source" ou "risk" |
| `source-distribution/route.ts` | Prisma `article` groupé par `source` (top 8) | `buildDemo()` ligne 52 (8 sources hardcodées) | Heuristique type : hespress/le360/telquel/medias24/leseco → "media", sinon "social" |
| `influencers/route.ts` | Prisma `article` (par source) + `riskAssessment` | Pas de demo fallback ; renvoie `influencers: []` si vide | Formule `influenceScore = reachScore*0.4 + |sentimentImpact|*100*0.3 + consistency*100*0.3` ; tiers par rang (≤3 elite, ≤10 high, ≤30 medium) |
| `reports/list/route.ts` | Prisma `report.findMany` (24 derniers, filtrés par userId ou all si admin) | `demoReportsListResponse()` | Expose `pdfUrl = /api/console/reports/{id}/pdf` |
| `alert-config/route.ts` | Prisma `companySettings.alertThresholds` (JSON string) | `buildDemo()` ligne 77 | GET décode le JSON ; **PATCH existe mais jamais appelé depuis ProDashboard** |
| `ask/route.ts` | Prisma multi-modèles (article, riskAssessment, aIVisibility, reputationScore, company, article) + **`z-ai-web-dev-sdk` LLM** | Pas de demo fallback — si pas de company, contexte vide | Construit un prompt groundé (lignes 390-416) ; appelle LLM (temp 0.3, 500 tokens max) ; extrait sources par text-match |
| `exposure-trend/route.ts` | Prisma `article` par langue | `buildDemo()` sin/cos 30j | Non utilisé par ProDashboard |
| `insights/route.ts` | LLM via `generateInsights()` (lib/harchiq/insight-engine) | `demoInsightsResponse()` | Non utilisé par ProDashboard |
| `harch100/latest/route.ts` | Prisma `harch100Snapshot.findFirst` (publishedAt non-null) | Renvoie 404 si aucun snapshot | Non utilisé par ProDashboard |

---

## 2. Features distinctes — Audit par axe (4 axes chacune)

### Feature 1 — HarchIQ AI Workspace (chat + bibliothèque de prompts + historique)

**Axe 1 — Promesse & Origine Commerciale**
- URL: `PricingPage.tsx` ligne 64 — `keyFeatures[0]`
- Pitch verbatim: `"HarchIQ AI — Avancé (200 questions/jour)"`
- Niveau de service: 200 questions/jour ; niveau `Avancé` (vs `Standard` 50/jour pour Essentiel)
- Tagline corrélée: `"Pour les équipes régionales et les organisations de marketing multicanal qui doivent anticiper avec une analyse avancée."`
- Sous-titre UI (ligne 4158): `"Assistante de réputation · Données réelles · Sources citées · 200 questions/jour"`

**Axe 2 — Route & Ingestion Données**
- Route API: `POST /api/console/ask` (ligne 3973)
- Source données brute: **LLM réel** via `z-ai-web-dev-sdk` + contexte **Prisma** (article, riskAssessment, aIVisibility, reputationScore, company)
- Pas de mock ; si pas de `company` rattachée, contexte vide mais appel LLM effectué
- Quota `used: 7, total: 200` initialisé côté client (ligne 3897), incrémenté localement après chaque question (ligne 4000) — **le quota n'est pas vérifié serveur**

**Axe 3 — Traitement & Logique Métier**
- Construction d'un prompt groundé (route.ts lignes 390-416) avec règles anti-hallucination (`"Answer the user's question based ONLY on the real data below"`).
- Extraction des sources citées par text-match (lignes 440-510) — retourne au max 5 sources typées `alert | topic | ai-visibility | neighbor`.
- Génération de follow-ups côté client via `generateFollowUps(question)` (ligne 1547) — règles de pattern matching par mots-clés (sentiment/crise/concurrent/IA/sujet).

**Axe 4 — Rendu UI & Expérience**
- Composant: `HarchIQWorkspace` (lignes 3878-4470)
- Section dashboard: Section 01, hero full width (ligne 4105, `id="ai-workspace"`)
- 3 colonnes xl : historique conversations (200px, max 50) / chat 6-col / bibliothèque prompts 5-col
- États dynamiques: message pending avec spinner ; sources expandable ; follow-ups cliquables (5 chips) ; boutons export PPT/PDF/Copy (toast-only — pas de fichier réellement généré) ; quota Progress bar ; bouton "Export PDF conversation" (toast-only) ; restauration conversation
- Bibliothèque: 8 prompts prédéfinis (PROMPT_LIBRARY lignes 3758-3871) — news-overview, sentiment-analysis, emerging-topics, competitor-check, crisis-detection, weekly-report, media-coverage, influencer-identification
- Historique persistant: `localStorage["harchiq:pro:chat-history"]` (max 50 conversations, ligne 3900)

---

### Feature 2 — Score de Réputation (jauge + météo + 6 mini-stats)

**Axe 1**
- URL: `PricingPage.tsx` ligne 735 — `"Le plan Pro est mis en avant pour les équipes régionales."`
- Pitch verbatim: tagline + `"analyse avancée"`
- Niveau de service: score temps réel, recommandation actionnable

**Axe 2**
- Route: `GET /api/console/brand-health` (ligne 13842)
- Source: Prisma `reputationScore.findFirst` + `article.count` (24h) + `article.findMany` (7j) + `aIVisibility.findMany` (4 dernières) + `company.findMany` (5)
- Demo fallback: `buildDemoResponse()` ligne 69 (score 74, sentiment 42/28/30, crisisScore 52, topNarrative `"Frais bancaires excessifs"`)

**Axe 3**
- `crisisScore = min(100, negativeShare*60 + min(25, articles24h/50*25))` (route ligne 43)
- `crisisLevel`: critical (≥75) / warning (≥50) / watch (≥25) / safe
- `score = reputationScore.overall ?? 50`
- Commentaire AI côté client (lignes 4700-4716) : concatène trend + sentiment.positive + aiVisibility.citedCount

**Axe 4**
- Composant: `ScoreReputationCard` (ligne 4690)
- Section 02, full width (ligne 4719, `id="score"`)
- `RadialBarChart` 220×200 (startAngle 220, endAngle -40, barSize 14) avec score central
- Météo réputation: `weatherFor(score)` (ligne 1540) — Ensoleillé (≥70, `Sun` icon) / Nuageux (≥50, `Cloud`) / Orageux (`CloudRain`)
- 6 `MiniStat`: Part de voix, Mentions 24h, Vélocité, Positif, Neutre, Négatif
- Boutons: "Comparer vs concurrents" (scrollToSection concurrents), "Détail sentiment" (scrollToSection sentiment), "Rafraîchir" (toast 800ms, pas de refetch réel)
- AnnotationTrigger + lastUpdated

---

### Feature 3 — Sentiment Moyen (KPI strip + sparkline)

**Axe 1** — Capacité `"Social listening"` (ligne 53) + `"Veille médiatique"` (ligne 52)
**Axe 2** — Données réelles : `health.sentiment.positive` (de `/brand-health`) + `trend.data.slice(-7)` (de `/sentiment-trend`)
**Axe 3** — `value = health.sentiment.positive` ; `delta = health.trend` ; sparkline = ratio `positive/count` sur 7 derniers jours
**Axe 4** — `SentimentMoyenKpi` (ligne 4888), `lg:col-span-2 md:col-span-4`. `LineChart` 80×28px. `AiCommentary` (3 paliers : ≥50 / ≥35 / <35 avec recommandation Dircom).

---

### Feature 4 — Mentions / Jour (KPI strip + bar sparkline)

**Axe 1** — Capacité `"Veille médiatique"` ; keyFeature implicite
**Axe 2** — `health.mentionCount24h` + `trend.data.slice(-7)` (count par jour)
**Axe 3** — `value = health.mentionCount24h` ; `delta = health.trend > 0 ? 12 : -4` (heuristic hardcodée) ; pic d'activité identifié via `bars.reduce`
**Axe 4** — `MentionsJourKpi` (ligne 4951). `BarChart` 80×28. Insight identifie `peakDay` + classifie volume (élevé >100 / modéré >30 / faible).

---

### Feature 5 — Citations IA (KPI strip + chips LLM)

**Axe 1** — Capacité `"Suivi de la visibilité IA (GenAI Lens)"` (PricingPage ligne 54, 130)
- Pitch verbatim (SOLUTIONS ligne 130): `"Mesurez ce que ChatGPT, Perplexity, Gemini, Claude et Copilot disent de votre marque — l'avenir de la réputation."`
**Axe 2** — Route `/api/console/ai-visibility` ; Prisma `aIVisibility.findMany` (dernière par plateforme)
**Axe 3** — Garde dernière ligne par plateforme ; `citedCount = platforms.filter(cited).length` ; `visibilityScore = cited/total*100`
**Axe 4** — `CitationsIaKpi` (ligne 5014). 4 chips : `GPT | PPL | GEM | CLD` (sage si cité, muted sinon). Insight identifie `topCited` et `secondCited` + position. Badge `HARCHIQ`.

---

### Feature 6 — Parts de Voix (KPI strip + mini donut)

**Axe 1** — keyFeature `"Benchmarking concurrentiel"` (PricingPage ligne 65)
**Axe 2** — Route `/api/console/share-of-voice` ; Prisma `article.count` + `aggregate._avg.sentimentScore` par compagnie (même secteur, top 5)
**Axe 3** — `pct = (yourRow.mentionCount / total) * 100` ; trend `yourRow.trend` (TODO côté API, toujours 0)
**Axe 4** — `PartsDeVoixKpi` (ligne 5123). `PieChart` 48×48 donut. 5 couleurs (vous en SAGE). 4 paliers insight (hausse/baisse/stable).

---

### Feature 7 — Sources Diversifiées (KPI strip + count)

**Axe 1** — Capacité `"Veille médiatique"` (implicite diversification sources)
**Axe 2** — Route `/api/console/source-distribution` ; Prisma `article.findMany` (top 8 par source, 30j)
**Axe 3** — `count = sources.sources.length` (max 8) ; heuristique type media/social côté API
**Axe 4** — `SourcesDiversifieesKpi` (ligne 5200). Top source name + count. 3 paliers insight (≥8 excellent / ≥4 correct / <4 faible).

---

### Feature 8 — Engagement Total (KPI strip + estimation likes/shares/comments)

**Axe 1** — keyFeature implicite `"Analyse avancée"` (PricingPage tagline ligne 50)
**Axe 2** — Données réelles mais **estimation purement heuristique client-side** : `mentionCount * 47` (ligne 5271, commentaire: `"avg 47 interactions/mention"`)
**Axe 3** — `total = health.mentionCount24h * 47` ; `delta = health.trend > 0 ? 8 : -3`
**Axe 4** — `EngagementTotalKpi` (ligne 5266). 3 dots légende: likes (sage) / shares (amber) / comments (gray). Insight 3 paliers (≥5000 fort / ≥1000 modéré / <1000 faible).

⚠️ **Note audit**: aucun API d'engagement natif — commentaire ligne 5268: `"no native engagement API yet"`. Le `× 47` est une constante marketing non sourcée.

---

### Feature 9 — Tendance Sentiment + Détection d'Anomalies (chart row + compare mode + period compare)

**Axe 1** — keyFeature `"Analyse avancée"` + tagline `"anticiper avec une analyse avancée"`
**Axe 2** — Route `/api/console/sentiment-trend?range={7d|30d|90d}` + `/api/console/competitor-radar` (pour compare mode)
**Axe 3** — Côté client : `computeZScores(negValues)` (ligne 5361) — `isAnomaly = |zScore| > 2`. Compare mode ajoute série `Concurrent` = `d.positive + compOffset + sin(d.count)*5`. Period compare : split moitié-moitié, overlay `current` vs `previous`.
**Axe 4** — `TendanceSentimentCard` (ligne 5335), `lg:col-span-8`, `id="sentiment"`. `ComposedChart` (Area + 3 Lines + Score + Concurrent + count + zScore). Toggle 7j/30j/90j. `PeriodCompareToggle` reusable. `AnomalySummaryStrip` réutilisable. AnnotationTrigger.

---

### Feature 10 — Benchmark Concurrentiel (TanStack Table 7 colonnes + Wizard)

**Axe 1** — keyFeature verbatim: `"Benchmarking concurrentiel"` (PricingPage ligne 65)
**Axe 2** — Routes `/api/console/competitor-radar` + `/api/console/share-of-voice`
**Axe 3** — `rows = radar.brands` mappé avec `sovRow.mentionCount ?? Math.round(b.scores.mediaReach * 12)` (fallback heuristique). 7 colonnes: Entreprise, Score, Sentiment, Mentions, Visibilité IA, Sources, Trend. Tri TanStack.
**Axe 4** — `BenchmarkConcurrentielTable` (ligne 5681), `lg:col-span-4`, `id="concurrents"`. Bouton "Configurer" ouvre `CompetitorSetupWizard`. Badge "VOUS" sur votre ligne. Bouton "Analyse approfondie" (toast-only). `proExclusive: true` dans la sidebar (ligne 3324).

---

### Feature 11 — Radar de Réputation (5 axes)

**Axe 1** — keyFeature `"Benchmarking concurrentiel"` (variante visuelle)
**Axe 2** — Route `/api/console/competitor-radar` (scores déjà calculés côté API)
**Axe 3** — 5 axes: Réputation (`influencerAuthority`), Sentiment, Visibilité IA, Diversité (`mediaReach`), Résilience (`crisisResilience`). Compare vous (SAGE fill 35%) vs top concurrent (amber dashed 18%).
**Axe 4** — `RadarReputationCard` (ligne 5970), `lg:col-span-5`. `RadarChart` outerRadius 72%. Badge "5 AXES". `yourWins = chartData.filter(Vous > Concurrent).length`. AnnotationTrigger.

---

### Feature 12 — Part de Voix Donut (clickable + anomalies)

**Axe 1** — keyFeature `"Benchmarking concurrentiel"` (variante visuelle)
**Axe 2** — Route `/api/console/share-of-voice`
**Axe 3** — Top 5 concurrents ; `computeZScores(values)` ; `isAnomaly = |zScore| > 2`. Click sur slice → affiche `selectedRow` (mentions, sentiment, trend).
**Axe 4** — `PartDeVoixDonutCard` (ligne 6078), `lg:col-span-5`. `PieChart` + `Legend` + `AnomalySummaryStrip`. AnnotationTrigger.

---

### Feature 13 — Top 5 Sujets (stacked bars + clickable + anomalies)

**Axe 1** — Capacité `"Social listening"` + keyFeature `"Analyse avancée"`
**Axe 2** — Routes `/api/console/topics` + `/api/console/sentiment-trend` (pour ratio sentiment)
**Axe 3** — Top 5 topics ; sentiment split dérivé des ratios globaux `trend.data` (posRatio/negRatio/neuRatio). `trend = t.count > 15 ? 8 : t.count > 8 ? 3 : -2` (heuristic). Z-scores.
**Axe 4** — `TopSujetsCard` (ligne 6250), `lg:col-span-7`, `id="sujets"`. Stacked horizontal bars (positif/neutre/négatif). Click → `selectedRow` détail. Badge type "RISQUE" vs "SUJET". Bouton "Voir tous les sujets" (toast-only).

---

### Feature 14 — Dernières Mentions (10 articles + 5 filtres + Analyser avec HarchIQ)

**Axe 1** — Capacité `"Veille médiatique"` + `"Relations médias"` + keyFeature `"Alertes et rapports"`
**Axe 2** — Route `/api/console/crisis-alerts` (articles négatifs + WhatsApp inbound + riskAssessments fusionnés)
**Axe 3** — 5 filtres: Tous / Positif (severity=watch) / Neutre (warning) / Négatif (critical) / Par source (media). Top 10 par timestamp.
**Axe 4** — `DernieresMentionsCard` (ligne 6433), `lg:col-span-5`, `id="alertes"`. Dot color par severity. Badge langue (2 chars). Bouton "Analyser avec HarchIQ" → pré-remplit le chat HarchIQ (setPrefillQuestion + scrollToSection ai-workspace).

---

### Feature 15 — Comparaison Semaine vs Semaine (4 delta cards)

**Axe 1** — keyFeature `"Tableaux de bord et rapports personnalisés"` (analyse hebdo)
**Axe 2** — Route `/api/console/weekly-comparison` ; Prisma `article` (14j bucketé) + `aIVisibility.count` (cited)
**Axe 3** — 4 métriques: sentimentPct, mentions, sources, aiVisibility. `directionOf(curr, prev)` (ratio <0.01 = stable). `deltaOf` (pct si metric %, sinon pct change).
**Axe 4** — `ComparaisonSemaineCard` (ligne 6632), `lg:col-span-12`. Badge "7J VS 7J". 4 cards avec current/previous/delta/icon direction. AiCommentary contextuel.

---

### Feature 16 — Historique des Rapports (liste + Générer + Programmer)

**Axe 1** — keyFeature verbatim: `"Tableaux de bord et rapports personnalisés"` (PricingPage ligne 66) + `"Alertes et rapports"` (ligne 164)
**Axe 2** — Route `/api/console/reports/list` ; Prisma `report.findMany` (24 derniers, filtrés userId/admin) ; expose `pdfUrl = /api/console/reports/{id}/pdf`
**Axe 3** — `rows = reports.reports.slice(0, 5)` ; `generatedCount` / `scheduledCount` par status (completed/Genere/scheduled/Programme)
**Axe 4** — `HistoriqueRapportsCard` (ligne 6715), `lg:col-span-7`, `id="rapports"`. Status badge (Généré/Programmé/Échec). Boutons: "Programmer" (toast-only), "Générer" (toast-success "disponible dans quelques minutes" — pas d'appel API réel). Lien PDF cliquable. `proExclusive: true` dans la sidebar.

⚠️ **Note audit**: les boutons "Générer" et "Programmer" ne déclenchent **aucun** appel API — `toast.info/success` uniquement. Le scheduling réel est géré par le widget séparé `ReportSchedulerPanel` (Feature 27).

---

### Feature 17 — Recherches Sauvegardées + Alertes (3 searches + 3 alerts + toggles)

**Axe 1** — keyFeature `"Alertes et rapports"`
**Axe 2** — Route `/api/console/alert-config` pour les **seuils** (sentimentThreshold, velocityThreshold, crisisScoreThreshold, channels)
**Axe 3** — ⚠️ **MOCK CLIENT-SIDE** : les 3 recherches sauvegardées (`searches`, lignes 6916-6920) et les 3 alertes (`alerts`, lignes 6922-6926) sont **hardcodées dans useState** — `"marque AND (crise OR boycottage) -publicité"`, `"Pic de mentions négatives > 15/jour"`, etc. La toggle `active` ne persiste pas (useState local).
**Axe 4** — `RecherchesAlertesCard` (ligne 6915), `lg:col-span-5`. Boutons "Créer" (toast-only). Switch shadcn sur chaque alerte. `alertConfig` réel sert uniquement pour l'insight textuel (ligne 6936).

---

### Feature 18 — Top 5 Influenceurs (table + tiers + Identifier)

**Axe 1** — ⚠️ **PROMESSE ABSENTE** : la matrice PricingPage ligne 159 indique `"Marketing d'influence": —` pour Pro (réservé Grandes Entreprises + Agences). Pourtant, `NAV_ITEMS` ligne 3330 marque `influenceurs` comme `proExclusive: true`.
- keyFeatures Pro ne mentionne pas les influenceurs.
**Axe 2** — Route `/api/console/influencers?range=30d` ; Prisma `article` (par source) + `riskAssessment` (high/critical). Formule influence score 0.4/0.3/0.3.
**Axe 3** — `rows = influencers.influencers.slice(0, 5)`. `platformFor(source)` heuristique (Hespress→Presse, TikTok→TikTok, etc.). `authorityTier`: elite/high/medium/low.
**Axe 4** — `TopInfluenceursCard` (ligne 7044), `lg:col-span-7`, `id="influenceurs"`. Table 5 colonnes: Nom (avec badge tier), Plateforme, Mentions, Engagement (/100), Sentiment (+/- 0.XX). Boutons "Identifier" (toast-success "résultats sous 24h" — pas d'appel API), "Voir tous" (toast-only).

---

### Feature 19 — Estimation Reach Média (AreaChart + AVE)

**Axe 1** — keyFeature `"Tableaux de bord et rapports personnalisés"` (métrique reach)
**Axe 2** — Route `/api/console/sentiment-trend` (utilise `trend.data.slice(-30)`)
**Axe 3** — ⚠️ **ESTIMATION HEURISTIQUE** : `reach = d.count * 850` (ligne 7205, commentaire: `"avg readership 850 per article"`) ; `ave = reach * 0.06` MAD (ligne 7211, commentaire: `"industry-standard proxy"`)
**Axe 4** — `EstimationReachCard` (ligne 7198), `lg:col-span-5`. 2 mini-cards: Reach total + AVE (MAD). `AreaChart` 100×120 avec gradient sage.

---

### Feature 20 — Carte de Crise (LineChart + alert markers + Mode crise)

**Axe 1** — keyFeature `"Alertes et rapports"` + tagline `"anticiper"`
**Axe 2** — Routes `/api/console/sentiment-trend` (30j) + `/api/console/brand-health` (crisisLevel)
**Axe 3** — `crisisScore = min(100, (negative/count)*100)` par jour. `isAlert = crisisScore > 60`. ReferenceLines à 60 (amber) et 80 (red).
**Axe 4** — `CarteCriseCard` (ligne 7311), `lg:col-span-7`. Badge niveau (CRITIQUE/ALERTE/VEILLE/SÛR). ReferenceDot sur chaque jour alerte. Bouton "Mode crise" (toast-error "notifications push envoyées" — pas d'appel API réel).

---

### Feature 21 — Heatmap Heure × Jour (7×24 grid)

**Axe 1** — keyFeature `"Analyse avancée"` (détection patterns temporels)
**Axe 2** — Route `/api/console/crisis-alerts` (timestamps)
**Axe 3** — `grid[dayIdx][hourIdx] += 1` par alerte (Mon=0..Sun=6, 0..23h). `peakDay/peakHour` identifiés par double boucle.
**Axe 4** — `HeatmapCard` (ligne 7440), `lg:col-span-5`. Grid 16×16px cells, 4 paliers couleur (rgba sage 0.15 / 0.4 / SAGE_DIM / SAGE). Tooltip shadcn par cell. Insight recommande horaire de publication.

---

### Feature 22 — Répartition par Type de Média (PieChart + anomalies)

**Axe 1** — Capacité `"Veille médiatique"` + `"Social listening"`
**Axe 2** — Routes `/api/console/source-distribution` + `/api/console/ai-visibility` (pour bucket IA)
**Axe 3** — 5 buckets: Presse, Blogs, Social, IA, Podcasts. Heuristique name-based: `name.includes("blog")|"medium"|"substack"` → Blogs ; `name.includes("podcast")` → Podcasts ; `s.type === "social"` → Social ; sinon Presse. `buckets.IA = aiVis.citedCount * 50` (×50 arbitraire).
**Axe 4** — `RepartitionTypeMediaCard` (ligne 7577), `lg:col-span-5`, `id="sources"`. `PieChart` 130×130 innerRadius 50%. Z-score anomalies. Légende avec AlertTriangle pour outliers. AnnotationTrigger.

---

### Feature 23 — Sujets Émergents (5 topics + growth + Surveiller)

**Axe 1** — keyFeature `"Analyse avancée"` (anticipation thématique)
**Axe 2** — Route `/api/console/topics`
**Axe 3** — `growthPct = (count - median) / median * 100` (médiane calculée sur la liste complète). Tri desc par growth, top 5. Toggle "Surveiller" → `useState<Set>` (non persistant).
**Axe 4** — `SujetsEmergentsCard` (ligne 7722), `lg:col-span-7`. Badge "CROISSANCE". Icon Lightbulb. 4 paliers couleur growth (>50 POSITIVE, >0 SAGE, <0 NEGATIVE). Bouton "Surveiller"/"Surveillé" (toggle visuel sans persistance).

---

### Feature 24 — Tableaux Personnalisables (3 dashboards + Nouveau + share)

**Axe 1** — keyFeature verbatim: `"Tableaux de bord et rapports personnalisés"` (PricingPage ligne 66)
**Axe 2** — ⚠️ **MOCK CLIENT-SIDE** : 3 dashboards hardcodés dans useState (lignes 7884-7888) — `"Tableau de bord COMEX"`, `"Veille crise"`, `"Rapport hebdomadaire"`. Aucun appel API.
**Axe 3** — Toggle share (localStorage non-persistant via useState local — pas `usePersistentState`). Bouton "Nouveau tableau de bord" (toast-only "Constructeur drag-and-drop").
**Axe 4** — `TableauxPersonnalisablesCard` (ligne 7883), `lg:col-span-12`. 3 cards (icon LayoutDashboard, widgets count, lastEdited). Toggle share (Users icon / PenSquare). Bouton éditer (toast-only). Astuce sage dashed banner.

---

### Feature 25 — Passer aux Grandes Entreprises (upsell + feature comparison)

**Axe 1** — Pas une promesse Pro mais un **upsell** vers Grandes Entreprises
**Axe 2** — Aucune donnée (statique)
**Axe 3** — 2 listes hardcodées: `proFeatures` (5 items) vs `enterpriseFeatures` (6 items)
**Axe 4** — `PasserGrandesEntreprisesCard` (ligne 8014), `lg:col-span-12`, `id="harch-100"`. Sage banner avec ArrowUpCircle. 2 colonnes comparatives. Bouton "Découvrir Grandes Entreprises" (toast-info).

⚠️ **Note audit**: l'`id="harch-100"` est sur cette card mais aucun widget Harch 100 n'est réellement rendu — la sidebar pointe vers cette section en label "Harch 100" (NAV_ITEMS ligne 3331), mais l'**utilisateur arrive sur l'upsell**. La route `/api/harch100/latest` (commentée ligne 68) n'est jamais appelée.

---

### Feature 26 — Suivi Influenceurs Personnalisé (ENV-PRO · localStorage CRUD)

**Axe 1** — ⚠️ **PROMESSE ABSENTE** : Marketing d'influence est `"—"` pour Pro (PricingPage ligne 159)
**Axe 2** — ⚠️ **MOCK CLIENT-SIDE** : `SEED_INFLUENCERS` (5 entrées hardcodées lignes 765-771) + `usePersistentState("pro:influencer-tracker")`. Aucun appel API. `Math.random()` pour followers/engagement/sentiment sur ajout (lignes 9956-9958).
**Axe 3** — Tri par reach/engagement/sentiment. Toggle star. CRUD local only.
**Axe 4** — `InfluencerTrackerWidget` (ligne 9921), `lg:col-span-12`. 4 MiniStats (Influenceurs, Followers cumulés, Engagement moyen, Sentiment positif). Sort selector 3 boutons. Add form (Nom/Handle/Platform dropdown). Table avec 8 plateformes (LinkedIn, X, TikTok, Instagram, YouTube, Facebook, Presse, Web).

---

### Feature 27 — Programmation Rapports (ENV-PRO · localStorage schedule)

**Axe 1** — keyFeature `"Tableaux de bord et rapports personnalisés"`
**Axe 2** — ⚠️ **MOCK CLIENT-SIDE** : `usePersistentState("pro:report-schedule")` avec `DEFAULT_REPORT_SCHEDULE`. Aucun appel API pour persister la schedule. Logo upload simulé (ligne 10341: `toast.success('Logo "${file.name}" chargé (simulation).')`).
**Axe 3** — Cadence: weekly (dayOfWeek 0-6) / monthly (dayOfMonth 1-28) / custom (date libre + time). Format: pdf/excel/"PDF + Excel". Recipients: email validation regex. Branding: includeLogo, includeFooter, theme (sage/charcoal/neutral).
**Axe 4** — `ReportSchedulerPanel` (ligne 10306), `lg:col-span-5`. Switch "Actif/Inactif". 3 cards cadence. Select jour semaine/mois. Inputs email + destinataires chips. Radio theme couleur. Bouton "Activer" toggle.

⚠️ **Note audit**: le scheduling activé **ne déclenche aucun envoi réel** — pas d'appel API, pas de cron, pas de worker. L'état `enabled: true` est purement cosmétique.

---

### Feature 27-bis — Constructeur de Règles d'Alerte (R2-PRO-A · localStorage CRUD)

**Axe 1** — keyFeature `"Alertes et rapports"` (variante avancée)
**Axe 2** — ⚠️ **MOCK CLIENT-SIDE** : `usePersistentState("pro:alert-rules")` avec `SEED_ALERT_RULES` (2 règles hardcodées lignes 713-734). Aucun appel API.
**Axe 3** — 4 conditions: `score_below`, `negative_sentiment_above`, `mentions_above_24h`, `source_keyword`. 4 actions: email/whatsapp/slack/in_app. 3 severités: info/warning/critique. Toggle enable. Test simulé (ligne 11275 — `toast.success` avec valeur simulée).
**Axe 4** — `AlertRulesBuilder` (ligne 11162), `lg:col-span-12`, `id="alertes-avancees"`. Badge "X/Y actives". Form grille 2-col (Nom + Sévérité). Select condition. Input threshold + range slider. Boutons "Nouvelle règle" / "Test" / "Supprimer".

⚠️ **Note audit**: le bouton "Test" affiche un toast avec une **valeur simulée** (`Score simulé: ${threshold - 5}`) — aucune exécution réelle de la règle.

---

### Feature 28 — Centre d'Export (R2-PRO-B · CSV réel + PNG/PDF simulé)

**Axe 1** — keyFeature `"Tableaux de bord et rapports personnalisés"` (export)
**Axe 2** — **Hybride** :
  - **CSV réel** : généré côté client depuis `sentimentTrend`, `sources`, `topics`, `sov` (4 sections CSV, `buildCsv()` ligne 2878). `downloadBlob()` déclenche téléchargement réel.
  - **PNG/PDF simulés** : `buildSimulatedReport()` ligne 2929 génère un fichier texte avec métadonnées + CSV inline. Pas de capture graphique réelle (commentaire ligne 2956: `"[Capture graphique simulée — les graphiques recharts seraient capturés via html-to-image]"`).
  - Historique exports persisté via `usePersistentState("pro:export-history")`.
**Axe 3** — 3 formats: csv/png/pdf. 3 scopes: full/section/period. Branding: includeLogo, includeFooter, theme (sage/charcoal/neutral).
**Axe 4** — `ExportCenterCard` (ligne 2841), `lg:col-span-12`. Badge "CSV · PNG · PDF". 3 boutons format (icon FileSpreadsheet/FileImage/FileText). 3 boutons scope. Select section si scope=section. 2 inputs date si scope=period. Switches branding + 3 boutons theme. Historique (max `MAX_EXPORT_HISTORY`, avec timestamp + fileSizeKb).

---

### Feature 28-bis — Watchlist Concurrents (R2-PRO-A · 5 pinned + compare modal)

**Axe 1** — keyFeature `"Benchmarking concurrentiel"` (variante watchlist)
**Axe 2** — Routes `/api/console/competitor-radar` + `/api/console/share-of-voice` (réelles)
**Axe 3** — Auto-seed top 3 concurrents en favoris (ligne 11754). `scoreDelta` simulé via `Math.sin(seed)*5 + Math.cos(seed*0.3)*3` (déterministe par nom, pas réel). `velocity` = 7 points simulés par sin/cos (ligne 11730).
**Axe 4** — `CompetitorWatchlist` (ligne 11703), `lg:col-span-12`, `id="watchlist-concurrents"`. Badge "X/5 épinglés". Grille 1/2/3 cols de `WatchlistCompetitorCard` (initials, score, SOV donut, sentiment donut, velocity LineChart, bouton Compare). Bouton "+ ÉPINGLER UN CONCURRENT". Modal `CompetitorCompareModal`.

---

### Feature 29 — Heatmap Sentiment Calendrier (R3-PRO-A) — ⚠️ ORPHAN (jamais rendu)

**Axe 1** — keyFeature `"Analyse avancée"` (vue calendrier sentiment)
**Axe 2** — Données réelles via `trend` + `topics` + `sources` props, **mais `buildHeatmapData` (ligne 1748) synthétise les jours manquants avec `Math.sin(seed*0.5)*0.18`** (variation déterministe par date).
**Axe 3** — `synthesizeDayMentions` (ligne 1868) génère 3 mentions plausibles par jour via templates positif/neutre/négatif (lignes 1880-1894) — **mock client-side des titres d'articles**.
**Axe 4** — `SentimentHeatmapCard` (ligne 8153), `lg:col-span-12`, `id="sentiment-heatmap"`. Calendrier GitHub-style 13/26 semaines × 7 jours. Modal `SentimentDayModal` au click.

🚨 **ORPHAN**: défini dans `DEFAULT_WIDGET_ORDER` ligne 13763 mais **absent de l'objet `widgets`** (lignes 13910-13977). La réconciliation (lignes 13981-13997) filtre l'ID inconnu → **jamais rendu**. Code fantôme ~400 lignes.

---

### Feature 30 — Suivi Campagnes Influenceurs (R3-PRO-A) — ⚠️ ORPHAN (jamais rendu)

**Axe 1** — ⚠️ **PROMESSE ABSENTE** : Marketing d'influence `"—"` pour Pro
**Axe 2** — ⚠️ **MOCK CLIENT-SIDE** : `SEED_CAMPAIGNS` (3 campagnes hardcodées lignes 958-998) + `usePersistentState("pro:campaigns")`. Aucun appel API. Reach/engagement/ROI générés via `Math.random()` (lignes 8850-8852).
**Axe 3** — CRUD local only. `campaignProgress` calcule elapsed/total/pct. `buildCampaignDailyEngagement` génère série sin wave + noise (ligne 1952).
**Axe 4** — `CampaignTrackerCard` (ligne 8804), `lg:col-span-12`, `id="campaign-tracker"`. Form (name/brand/influencer/dates/budget). Cards par campagne avec status badge (active/scheduled/completed), progress bar, 3 KPIs (Reach/Engagement/ROI), expand chart.

🚨 **ORPHAN**: défini dans `DEFAULT_WIDGET_ORDER` ligne 13758 mais **absent de l'objet `widgets`**. Code fantôme ~470 lignes.

---

### Feature 31 — Bibliothèque de Templates (R3-PRO-A) — ⚠️ ORPHAN (jamais rendu)

**Axe 1** — keyFeature `"Tableaux de bord et rapports personnalisés"` (templates)
**Axe 2** — ⚠️ **MOCK CLIENT-SIDE** : `PREDEFINED_TEMPLATES` (4 templates: Direction, Communication, Conformité, Compétition — lignes 1063-1127) + `usePersistentState("pro:dashboard-templates")` (max 3 custom).
**Axe 3** — 4 templates prédéfinis avec liste de widgets ordonnée. Save custom = snapshot du `widgetOrder` actuel. Apply = remplace `widgetOrder`.
**Axe 4** — `DashboardTemplatesCard` (ligne 9089), `lg:col-span-12`, `id="dashboard-templates"`. Grille 1/2/3 cols. Card par template (icon, name, description, `TemplatePreview`, sections list, bouton Appliquer/Supprimer). Bouton "Sauvegarder comme template".

🚨 **ORPHAN**: défini dans `DEFAULT_WIDGET_ORDER` ligne 13767 mais **absent de l'objet `widgets`**. Code fantôme ~210 lignes.

---

### Feature 32 — Analyse de Contenu Concurrents (R4-PRO-A · synthesized articles + compare)

**Axe 1** — keyFeature `"Benchmarking concurrentiel"` (analyse éditoriale)
**Axe 2** — Routes `/api/console/competitor-radar` + `/api/console/share-of-voice` (réelles) **MAIS** `synthesizeRecentArticles` (ligne 1210) génère les titres d'articles concurrents **depuis un pool de 8 templates** (lignes 1217-1226) — ex: `"${n} accélère sa transformation digitale"`, `"${n} lance une initiative RSE ambitieuse"`. Sources depuis `COMPETITOR_ARTICLE_SOURCES` (8 médias marocains hardcodés).
**Axe 3** — `buildCompetitorContentSummaries` (ligne 1257) : pour chaque concurrent, calcule `postingFrequencyPerWeek`, `avgSentimentPct`, `shareOfVoicePct`, `topKeywords` (5 depuis pool de 20 mots-clés), `mediaReach`, `recentArticles` (3 synthétisés). Auto-refresh 15s quand `watchEnabled` (toggle).
**Axe 4** — `CompetitorContentAnalysisCard` (ligne 12177), `lg:col-span-12`, `id="competitor-content-analysis"`. Badge "Surveillance active/inactive" + Switch. `BarChart` fréquence publication. Grille cards par concurrent (KPIs, top keywords chips, articles list). Modal `CompetitorContentCompareModal` (compare 2 concurrents côte-à-côte).

⚠️ **Note audit**: les **titres d'articles sont fictifs** — les utilisateurs Pro voient des headlines générés par template string, pas les vrais articles publiés par leurs concurrents.

---

### Feature 33 — Calculateur de Reach Média (R4-PRO-A · sliders + scenarios localStorage)

**Axe 1** — keyFeature `"Tableaux de bord et rapports personnalisés"` (outil autonomme)
**Axe 2** — ⚠️ **OUTIL AUTONOMME** : aucune route API appelée. Constantes hardcodées: `SOURCE_TIERS` (4 tiers avec audience fixe — National 500K, Régional 50K, Spécialisé 10K, Blog 5K), `AVE_RATE_MAD = 0.03`, `ENGAGEMENT_RATE_PCT = 2.5`, `PAID_CPM_MAD = 8`.
**Axe 3** — `reach = articles * weightedAudience`. `ave = reach * 0.03`. `engagement = reach * 0.025`. `paidImpressionsEquiv = (ave / 8) * 1000`. `ratioVsPaid = paidImpressionsEquiv / reach`. Redistribution proportionnelle quand un slider bouge (ligne 12894).
**Axe 4** — `MediaReachCalculatorCard` (ligne 12883), `lg:col-span-12`, `id="media-reach-calculator"`. Badge "Outil autonome" + icon Calculator. Input articles (1-10000). 4 sliders shadcn (mix sources, step 5). PieChart mix. 4 MiniStats (Reach, AVE, Engagement, Paid impressions équivalent). Sauvegarde jusqu'à 5 scénarios. Modal `ReachScenariosCompareModal`.

---

### Feature 34 — Tendances Part de Voix (R4-PRO-A · sin/cos synthesized series)

**Axe 1** — keyFeature `"Benchmarking concurrentiel"` (variante temporelle)
**Axe 2** — Routes `/api/console/competitor-radar` + `/api/console/share-of-voice` (réelles) **MAIS** `buildSovTrendsSeries` (ligne 1374) **synthétise la série temporelle** via `Math.sin((seed / cycleLen) * Math.PI) * 6 + Math.cos(seed * 0.3) * 3` (ligne 1419) sur 30/90/365 jours.
**Axe 3** — 4 séries (you + 3 competitors) générées sin/cos avec base = `sovRow.mentionCount / total * 100`. `pivotPoints` détectés par changement de signe de `you - comp`. `anomalies` via z-score sur `youValues`. `buildSovSourceBreakdown` (ligne 1456) simule 4 types (national/régional/social/spécialisé) avec `hashStrContent` déterministe.
**Axe 4** — `ShareOfVoiceTrendsCard` (ligne 13427), `lg:col-span-12`, `id="sov-trends"`. Tabs 30j/90j/12m. 4 MiniStats (SOV moyenne, SOV pic, Tendance, Bascules). `ComposedChart` (Area vous + 3 Lines concurrents dashed + ReferenceDot pivots + anomalies). Source breakdown barres horizontales you vs comp.

⚠️ **Note audit**: la **série temporelle SOV est entièrement synthétique** — les valeurs quotidiennes sont générées par sin/cos. Seules les bases `sovBase` sont réelles. Les pivots et anomalies détectés le sont sur des données simulées.

---

## 3. Features structurelles (non numérotées mais distinctes)

### S-1 — Sidebar de navigation (10 items, 3 Pro exclusives)

- `NAV_ITEMS` (ligne 3321) : 10 entrées — Tableau de bord, Sentiment, **Concurrents (PRO)**, Alertes, **Rapports (PRO)**, Sujets, Sources, Visibilité IA, **Influenceurs (PRO)**, Harch 100
- Badge `PRO` (8px sage mono) sur les 3 items exclusifs (ligne 3422-3436)
- Compteur alertes (badge rouge si `alertCount > 0`)
- Footer sidebar: "Plan Pro · Actif" (lignes 3474-3484), avatar initials, lien Paramètres, bouton Déconnexion

### S-2 — Header sticky (frosted glass + Plan Pro badge + edit mode + notifications)

- `Header` (ligne 3565). Badge "PLAN PRO" (sage bg, 9px mono). Hamburger mobile. Bouton edit mode (PenSquare, toggle). Bouton reset layout (RotateCcw, visible en edit mode). Bouton notifications (Bell + dot rouge si alertCount > 0). Avatar initials.

### S-3 — ProFilterBar (sticky — period/sources/sentiment/lang + saved presets)

- `ProFilterBar` (ligne 10736). Sticky top:56px. Filtres: Période (7j/30j/90j Tabs), Sources (12 options multi-select dropdown), Sentiment (3 toggles pos/neu/neg), Langue (3 toggles fr/ar/en). Badge activeCount. Bouton "Réinitialiser". **Saved Presets** (R2-PRO-A Feature 1) : `usePersistentState("pro:filter-presets", [])` max 10, bouton Save (modal nom), boutons Apply/Delete.
- ⚠️ **Note audit**: les filtres Sources/Sentiment/Langue **ne sont pas transmis aux routes API** — seul `filters.period` est passé à `/sentiment-trend?range=` (ligne 13846). Les autres filtres sont purement cosmétiques.

### S-4 — Custom Dashboard Layout (drag-reorder via @dnd-kit)

- `widgets` object (lignes 13909-13978) — 33 widgets mappés (3 orphelins exclus). `widgetOrder` via `usePersistentState("pro:dashboard-layout", DEFAULT_WIDGET_ORDER)` (ligne 13797). `DndContext` + `SortableContext` + `SortableWidget` wrapper (ligne 9855). Drag handle visible en edit mode. Bouton reset.

### S-5 — AnnotationTrigger + AnnotationDialog (team comments + @mentions + resolve)

- `ProR2BProvider` context (ligne 2263) — `usePersistentState("pro:annotations", SEED_ANNOTATIONS)`. `AnnotationTrigger` (ligne 2335) — icône MessageSquare/Check, compteur comments. `AnnotationDialog` (ligne 2394) — portal, comments list, textarea avec @mentions autocomplète (`TEAM_MEMBERS` 6 membres hardcodés ligne 893), bouton resolve, bouton delete. 8 sections annotatables (ANNOTATABLE_SECTIONS ligne 1129).
- ⚠️ **MOCK** : `TEAM_MEMBERS` et `SEED_ANNOTATIONS` hardcodés — pas de sync serveur. Persistance localStorage uniquement.

### S-6 — AnomalySummaryStrip (réutilisable, z-score banner)

- `AnomalySummaryStrip` (ligne 2754). Affiche les anomalies z-score > 2 sous forme de banner (warning/critical). Toggle `hidden` via `useProR2B` context. Utilisé dans §1.9, §1.12, §1.13, §1.22.

### S-7 — Competitor Setup Wizard (modal 3 étapes + localStorage)

- `CompetitorSetupWizard` (ligne 9320). 3 étapes: Ajoutez vos concurrents (recherche + 6 suggestions `COMPANIES_DB` 40 entreprises hardcodées lignes 773-814) → Définissez vos KPIs (5 KPIs: sov, sentiment, aiVisibility, mediaReach, engagement) → Configurez l'alerting (4 canaux: email, slack, teams, dashboard + threshold slider). `usePersistentState("pro:competitor-setup", DEFAULT_COMPETITOR_SETUP)`.
- ⚠️ **Note audit**: la configuration **n'est pas persistée serveur** — le `handleComplete` (ligne 9390) appelle `onComplete(final)` qui appelle `refetchRadar()` + `refetchSov()` — mais ces APIs **ignorent la configuration locale** et utilisent uniquement le secteur de la company en DB. La liste des concurrents affichée vient de `prisma.company.findMany({ sector: myCompany.sector })` (route ligne 22), pas du wizard.

### S-8 — Period Compare Toggle (réutilisable)

- `PeriodCompareToggle` (ligne 9773). Switch shadcn "Comparer vs période précédente". Utilisé dans §1.9 (Tendance Sentiment). Active l'overlay current vs previous dans le chart.

---

## 4. Synthèse — MOCKED vs REAL

### ✅ Features 100% REAL (données Prisma via API, pas de synthèse client-side)

| # | Feature | Routes API |
|---|---|---|
| 1 | HarchIQ AI Workspace (chat) | `/api/console/ask` (LLM réel) |
| 2 | Score de Réputation | `/api/console/brand-health` |
| 3 | Sentiment Moyen KPI | `/api/console/brand-health` + `/api/console/sentiment-trend` |
| 4 | Mentions / Jour KPI | `/api/console/brand-health` + `/api/console/sentiment-trend` |
| 5 | Citations IA KPI | `/api/console/ai-visibility` |
| 6 | Parts de Voix KPI | `/api/console/share-of-voice` |
| 7 | Sources Diversifiées KPI | `/api/console/source-distribution` |
| 9 | Tendance Sentiment + anomalies | `/api/console/sentiment-trend` + `/api/console/competitor-radar` |
| 10 | Benchmark Concurrentiel | `/api/console/competitor-radar` + `/api/console/share-of-voice` |
| 11 | Radar de Réputation | `/api/console/competitor-radar` |
| 12 | Part de Voix Donut | `/api/console/share-of-voice` |
| 13 | Top 5 Sujets | `/api/console/topics` + `/api/console/sentiment-trend` |
| 14 | Dernières Mentions | `/api/console/crisis-alerts` |
| 15 | Comparaison Semaine | `/api/console/weekly-comparison` |
| 16 | Historique des Rapports (lecture) | `/api/console/reports/list` |
| 18 | Top 5 Influenceurs | `/api/console/influencers?range=30d` |
| 20 | Carte de Crise | `/api/console/sentiment-trend` + `/api/console/brand-health` |
| 21 | Heatmap Heure × Jour | `/api/console/crisis-alerts` |
| 22 | Répartition Type Média | `/api/console/source-distribution` + `/api/console/ai-visibility` |
| 23 | Sujets Émergents | `/api/console/topics` |
| 28-bis | Watchlist Concurrents | `/api/console/competitor-radar` + `/api/console/share-of-voice` |
| 32 | Analyse Contenu Concurrents (cadre) | `/api/console/competitor-radar` + `/api/console/share-of-voice` |

### ⚠️ Features HYBRIDES (données réelles + synthèse/heuristique client-side)

| # | Feature | Partie réelle | Partie synthétisée |
|---|---|---|---|
| 8 | Engagement Total | `mentionCount24h` réel | `× 47` constant arbitraire |
| 19 | Estimation Reach Média | `trend.data` réel | `× 850` readership + `× 0.06` AVE |
| 28 | Centre d'Export | CSV réel depuis API | PNG/PDF = fichier texte simulé |
| 32 | Analyse Contenu Concurrents | scores radar/sov réels | `recentArticles` (3 titres générés par template string), `topKeywords` (5 depuis pool 20) |
| 34 | Tendances Part de Voix | `sovBase` réel | Série 30/90/365j générée sin/cos, source breakdown hash-deterministic |
| 28-bis | Watchlist | radar/sov réels | `scoreDelta` sin/cos, `velocity` 7 points sin/cos |

### ❌ Features 100% MOCKED (localStorage only, aucun appel API)

| # | Feature | localStorage key | Seed |
|---|---|---|---|
| 17 | Recherches Sauvegardées + Alertes | (useState local — pas persistant) | 3 searches + 3 alerts hardcodées |
| 24 | Tableaux Personnalisables | (useState local) | 3 dashboards hardcodés |
| 26 | Suivi Influenceurs Personnalisé | `pro:influencer-tracker` | 5 influenceurs hardcodés (Yassine Benchakroun, Salma El Idrissi, etc.) |
| 27 | Programmation Rapports | `pro:report-schedule` | `DEFAULT_REPORT_SCHEDULE` (inactive) |
| 27-bis | Constructeur Règles d'Alerte | `pro:alert-rules` | 2 règles hardcodées |
| S-5 | Annotations équipe | `pro:annotations` | 1 annotation hardcodée + 6 team members hardcodés |
| S-7 | Competitor Setup Wizard | `pro:competitor-setup` | Config locale ignorée par l'API |
| S-3 | Saved Filter Presets | `pro:filter-presets` | Aucun preset initial |

### 🚨 Features ORPHELINES (définies mais jamais rendues)

| # | Feature | Lignes de code | Raison |
|---|---|---|---|
| 29 | Heatmap Sentiment Calendrier (R3-PRO-A) | 8151-8550 (~400 lignes) | ID `sentiment-heatmap` dans `DEFAULT_WIDGET_ORDER` ligne 13763 mais absent de l'objet `widgets` |
| 30 | Suivi Campagnes Influenceurs (R3-PRO-A) | 8551-9031 (~480 lignes) | ID `campaign-tracker` ligne 13758 mais absent de `widgets` |
| 31 | Bibliothèque de Templates (R3-PRO-A) | 9032-9300 (~270 lignes) | ID `dashboard-templates` ligne 13767 mais absent de `widgets` |

**Total code fantôme**: ~1 150 lignes de composants jamais montés.

### 🔌 Routes API commentées mais jamais appelées

| Route | Commenté ligne | Utilisation attendue |
|---|---|---|
| `/api/console/exposure-trend` | 65 | Aucun widget ne l'appelle (serait pour trend FR/AR/EN/Darija) |
| `/api/console/insights` | 67 | Aucun widget ne l'appelle (HarchIQ Insight Engine — LLM) |
| `/api/harch100/latest` | 68 | Aucun widget ne l'appelle (la sidebar pointe vers l'upsell §25 au lieu d'un vrai widget Harch 100) |

### 🔁 Routes API PATCH/POST disponibles mais jamais appelées depuis ProDashboard

| Route | Disponible | Pourquoi non appelée |
|---|---|---|
| `PATCH /api/console/alert-config` | route.ts ligne 42 | Le wizard et l'AlertRulesBuilder écrivent en localStorage uniquement |
| `POST /api/console/insights` | route.ts ligne 147 | Aucun widget insights rendu |

---

## 5. Promesses commerciales SANS UI correspondante (gaps)

| Promesse PricingPage (verbatim) | Section attendue | Statut UI |
|---|---|---|
| `"Veille médiatique"` | Dashboard agrégé veille temps réel | ✅ Couvert par §1.14 (Dernières Mentions) + §1.16 (Historique) — mais aucune vue "veille temps réel" unifiée |
| `"Social listening"` | Capture X/LinkedIn/FB/Instagram | ⚠️ Partiel — la `source-distribution` API distingue "media" vs "social" par heuristique name-based (route ligne 42), pas de capture native sociale |
| `"Suivi de la visibilité IA (GenAI Lens)"` | Suivi ChatGPT/Perplexity/Gemini/Claude/Copilot | ⚠️ Partiel — la `ai-visibility` API retourne 4 plateformes max, **Copilot absent** (PricingPage mentionne Copilot ligne 131 mais l'API ne le suit pas) |
| `"Relations médias"` | Suivi journalistes + share of voice + impact RP | ⚠️ Partiel — `share-of-voice` couvre le SOV mais **pas de base journalistes**, pas de mesure d'impact RP dédiée (le bouton "Identifier" ligne 7081 affiche un toast sans appel API) |
| `"HarchIQ AI — Avancé (200 questions/jour)"` | Quota 200/jour vérifié serveur | ⚠️ **Gap critique** — le quota est purement client-side (useState `used: 7, total: 200`, ligne 3897). **Aucune vérification serveur** — un utilisateur peut dépasser 200/jour en rechargeant la page. La route `/api/console/ask` n'a pas de rate-limit par quota. |
| `"Benchmarking concurrentiel"` | Comparaison structurelle | ✅ Couvert (§1.10, §1.11, §1.12, §1.28, §1.32, §1.34) — mais la liste des concurrents est limitée à 2 par `prisma.company.findMany({ take: 2 })` (route ligne 22), pas 5 comme le suggère l'upsell `proFeatures` ligne 8017 |
| `"Tableaux de bord et rapports personnalisés"` | CRUD dashboards + scheduling | ⚠️ **Gap partiel** — drag-reorder widget fonctionne (S-4) mais : (a) Section 24 (Tableaux Personnalisables) est mocked, (b) Section 27 (Programmation) est mocked, (c) Section 31 (Bibliothèque Templates) est orpheline, (d) boutons "Générer" et "Programmer" du §1.16 ne déclenchent aucun envoi réel |
| `"Alertes et rapports"` | Alertes WhatsApp + Email + Dashboard | ⚠️ Partiel — `alert-config` GET renvoie les seuils configurés mais **PATCH jamais appelé** depuis Pro. Les 3 alertes affichées (§1.17) sont hardcodées. Le `whatsappNumber` est `"+212600000000"` en demo. Aucune preuve d'envoi réel WhatsApp/Email depuis le dashboard Pro. |
| `"Tableaux de bord prédéfinis"` | Templates prêts à l'emploi | ⚠️ **Gap** — la Bibliothèque de Templates (§1.31) est orpheline. Seuls les 4 `PREDEFINED_TEMPLATES` (Direction/Communication/Conformité/Compétition) sont définis mais jamais accessibles UI. |
| `"Périmètre 5 à 10 jours ouvrés pour mise en place"` (FAQ) | Onboarding guidé | ⚠️ Pas d'onboarding Pro dans le dashboard — pas de modal "bienvenue", pas de checklist setup, pas de tour guidé |

---

## 6. Features UI SANS promesse commerciale (orphelins marketing)

| Feature UI | Pourquoi pas de promesse | Recommandation |
|---|---|---|
| §1.18 Top 5 Influenceurs + §1.26 Suivi Influenceurs Personnalisé + §1.30 Suivi Campagnes Influenceurs | PricingPage matrice ligne 159: `"Marketing d'influence": —` pour Pro (réservé Grandes Entreprises + Agences) | Soit retirer du dashboard Pro, soit ajouter `"Marketing d'influence"` à la colonne Pro de la matrice PricingPage |
| §1.25 Passer aux Grandes Entreprises | Upsell, pas une promesse Pro | Acceptable (upsell standard) |
| §1.33 Calculateur Reach Média | Outil autonomme, pas listé dans keyFeatures | Documenter comme "analyse avancée" dans PricingPage |
| §1.34 Tendances Part de Voix | Variante temporelle de "Benchmarking concurrentiel" | Acceptable (sous-entendu) |
| §1.32 Analyse Contenu Concurrents | Variante approfondie de "Benchmarking concurrentiel" | Acceptable mais article headlines sont MOCK — non documenté |
| S-5 Annotations équipe + 6 Team Members | Pas de promesse "collaboration" ou "team" dans PricingPage | Soit retirer, soit ajouter "Annotations équipe" en keyFeature Pro |
| S-7 Competitor Setup Wizard | Outil de config, pas une promesse | Acceptable mais la config est ignored côté API |
| Footer "Données temps réel · 33 sections · 200 questions IA/jour · Casablanca · 3 R4-PRO-A features" (ligne 14149) | "Casablanca" non sourcé, "33 sections" contredit les 36 sections définies | Mettre à jour le compteur |

---

## 7. Anomalies & incohérences détectées

### 7.1 — Naming conflict PricingPage vs AtelierHome vs Changelog

- **PricingPage** (page dédiée `/atelier/pricing`) : Essentiel / Pro / Grandes Entreprises / Agences
- **AtelierHome** section pricing (lignes 3593-3648) : Émergence 15K / Corporate 40K / Sovereign 75K MAD/mois
- **ChangelogPage** v3.0.0 (lignes 56-68) : documente le renommage `Starter/Pro/Enterprise → Émergence/Corporate/Sovereign` mais PricingPage n'a jamais été migrée

**Impact**: un prospect qui arrive sur `/atelier` voit Corporate (40K MAD/mois, highlighted), puis clique sur `/atelier/pricing` et voit Pro (Sur devis, highlighted). **Deux offres "highlighted" incompatibles**.

### 7.2 — Quota HarchIQ 200/jour non vérifié serveur

- PricingPage promet `"200 questions/jour"`
- ProDashboard `useState({ used: 7, total: 200 })` (ligne 3897) — purement client-side
- Route `/api/console/ask` n'a pas de rate-limit par quota journalier
- Un utilisateur peut bypass en refresh / multi-onglet

### 7.3 — Concurrents limités à 2 côté API

- PricingPage upsell (ligne 8017): `"Benchmark concurrentiel (5 marques)"`
- Route `/api/console/competitor-radar` ligne 22: `prisma.company.findMany({ where: { sector: myCompany.sector, id: { not: companyId } }, take: 2, ... })`
- Le radar affiche max 3 marques (vous + 2), pas 5

### 7.4 — Competitor Setup Wizard ignoré par l'API

- Wizard persiste dans `localStorage["pro:competitor-setup"]`
- `handleComplete` (ligne 9390) → `refetchRadar()` + `refetchSov()`
- Mais ces routes **filtrent par `company.sector`** (route competitor-radar ligne 22, share-of-voice ligne 27), pas par la config locale
- La liste des concurrents affichée est donc déterminée par le secteur en DB, pas par le wizard

### 7.5 — 3 widgets orphelins (code fantôme ~1 150 lignes)

- §1.29 Heatmap Sentiment, §1.30 Suivi Campagnes, §1.31 Bibliothèque Templates
- Définis dans `DEFAULT_WIDGET_ORDER` mais absents de l'objet `widgets`
- La réconciliation (lignes 13981-13997) filtre les IDs inconnus silencieusement
- Aucun log, aucune erreur — les composants ne sont jamais montés

### 7.6 — 3 routes API commentées mais jamais appelées

- `/api/console/exposure-trend`, `/api/console/insights`, `/api/harch100/latest` (lignes 65, 67, 68)
- Le footer dashboard dit "Données temps réel" mais 3 sources de données réelles sont silencieusement absentes

### 7.7 — "Harch 100" dans la sidebar pointe vers l'upsell

- `NAV_ITEMS` ligne 3331 : `{ id: "harch-100", label: "Harch 100", Icon: Trophy }`
- L'`id="harch-100"` est sur `PasserGrandesEntreprisesCard` (ligne 8032) — l'upsell, pas un vrai widget Harch 100
- L'utilisateur clique "Harch 100" et atterrit sur l'upsell Grandes Entreprises

### 7.8 — Filtres Sources/Sentiment/Langue non transmis à l'API

- `ProFilterBar` (S-3) expose 4 types de filtres
- Seul `filters.period` est passé à `/sentiment-trend?range=` (ligne 13846)
- `filters.sources`, `filters.sentiment`, `filters.language` sont visuellement actifs mais **aucune route API ne les consomme**

### 7.9 — "Données temps réel" contredit par `weekly-comparison` (7j vs 7j)

- Footer ligne 14149: `"Données temps réel"`
- Route `weekly-comparison` (route.ts ligne 87-88): `sevenDaysAgo` vs `fourteenDaysAgo` — fenêtre de 14 jours, pas temps réel
- De nombreuses routes (`source-distribution`, `competitor-radar`, `share-of-voice`) utilisent `thirtyDaysAgo` — fenêtre 30j, pas temps réel

### 7.10 — Engagement `× 47` non sourcé

- `EngagementTotalKpi` ligne 5271: `total = mentionCount * 47`
- Commentaire ligne 5268: `"avg 47 interactions/mention (likes+shares+comments)"` — aucune source, aucune étude citée
- Le `delta = health.trend > 0 ? 8 : -3` est hardcodé (ligne 5272), pas dérivé de données

### 7.11 — Reach `× 850` et AVE `× 0.06` non sourcés

- `EstimationReachCard` ligne 7205: `reach = d.count * 850` — commentaire: `"avg readership 850 per article"`
- Ligne 7211: `ave = totalReach * 0.06` — commentaire: `"AVE = reach × 0.06 MAD (industry-standard proxy)"`
- Aucune source pour ces constantes

### 7.12 — Sidebar "Concurrents" marqué `proExclusive` mais la matrice PricingPage n'a pas de ligne "Concurrents" séparée

- `NAV_ITEMS` ligne 3324 : `proExclusive: true` sur "Concurrents"
- PricingPage matrice : pas de ligne "Concurrents" — uniquement "Benchmarking concurrentiel" (ligne 166) qui n'est pas marqué exclusif Pro (✓ pour Pro, ✓ pour Grandes Entreprises, ✓ pour Agences)

---

## 8. Livrable — Compte final

| Catégorie | Compte |
|---|---|
| **Total features auditées (4 axes complets)** | **34** |
| Features structurelles additionnelles | 8 (S-1 à S-8) |
| **Features 100% REAL** | 22 |
| Features HYBRIDES (réel + heuristique) | 6 |
| **Features 100% MOCKED** | 8 (dont 3 S-*) |
| **Features ORPHELINES (jamais rendues)** | 3 (§1.29, §1.30, §1.31) |
| **Routes API commentées mais jamais appelées** | 3 (`exposure-trend`, `insights`, `harch100/latest`) |
| **Routes API PATCH/POST disponibles mais non appelées** | 2 (`PATCH /alert-config`, `POST /insights`) |
| **Promesses sans UI complète (gaps)** | 11 |
| **UI sans promesse commerciale (orphans marketing)** | 7 |
| **Anomalies/incohérences détectées** | 12 |

### Top 3 gaps critiques à traiter en priorité

1. **Quota HarchIQ 200/jour non vérifié serveur** (§7.2) — promesse commerciale majeure non tenue techniquement
2. **3 widgets orphelins (~1 150 lignes de code fantôme)** (§7.5) — code mort, maintenance inutile, ou feature cassée silencieusement
3. **Naming conflict PricingPage vs AtelierHome** (§7.1) — deux grilles tarifaires incompatibles sur 2 surfaces marketing

### Top 3 mocks à remplacer par de vraies routes API

1. **§1.17 Recherches Sauvegardées + Alertes** — 3 searches + 3 alerts hardcodées en useState (pas même persistant)
2. **§1.27 Programmation Rapports** — schedule en localStorage, jamais transmis à un worker/cron
3. **§1.32 Analyse Contenu Concurrents** — `recentArticles` (3 titres générés par template string depuis pool de 8 headlines) présentés comme articles réels

---

**Fin du rapport AUDIT-PRO.**
