# AUDIT EXHAUSTIF — COMPTE ESSENTIEL (VORTEX)

> Task ID: AUDIT-ESSENTIEL
> Agent: VORTEX (Principal Systems & Data Auditor)
> Date: 11 août 2026
> Périmètre: PricingPage → EssentialDashboard → API routes → AtelierHome + pages publiques
> Règle: ZERO généralisation — toute différence de 1 % dans la logique ou le rendu = 2 entrées séparées.

---

## 0. SOURCES LUES

| # | Fichier | Lignes | Rôle |
|---|---------|--------|------|
| S1 | `src/app/atelier/pricing/PricingPage.tsx` | 1 084 | Carte commerciale + matrice comparative Essentiel/Pro/Grandes Entreprises/Agences |
| S2 | `src/app/atelier/console/essential/EssentialDashboard.tsx` | 10 941 | Dashboard UI (39 sections/composants) |
| S3 | `src/app/atelier/AtelierHome.tsx` | 4 851 | Landing page (pricing section legacy) |
| S4 | `src/app/atelier/about/AboutPage.tsx` | 859 | Page "À propos" |
| S5 | `src/app/atelier/method/MethodPage.tsx` | 762 | Page "Méthode" |
| S6 | `src/app/atelier/changelog/ChangelogPage.tsx` | 429 | Changelog |
| S7 | `src/app/atelier/faq/faq-data.ts` | ~946 | FAQ (8 entrées Essentiel-spécifiques) |
| S8 | `src/app/atelier/console/settings/users/UserManagement.tsx` | — | Cap plan-aware Essentiel=3 users |
| S9 | `src/lib/auth/auth.config.ts:28` | — | Définition de `accountType: essential|pro|enterprise|agency` |
| S10 | `prisma/schema.prisma` | — | `User.accountType` défini à `brand-monitor|market-competitor|investment-bank|harch-alpha` (legacy) |

### Routes API traçées depuis le dashboard

| Endpoint | Fichier route | `allowedTypes` |
|----------|---------------|----------------|
| GET `/api/console/brand-health` | `src/app/api/console/brand-health/route.ts` | aucune vérification (session only) |
| GET `/api/console/crisis-alerts` | `src/app/api/console/crisis-alerts/route.ts` | aucune vérification |
| GET `/api/console/insights` | `src/app/api/console/insights/route.ts` | `ALLOWED_ACCOUNT_TYPES = ["brand-monitor","market-competitor","investment-bank","harch-alpha"]` — fallback à `brand-monitor` si Essentiel |
| GET `/api/console/ai-visibility` | `src/app/api/console/ai-visibility/route.ts` | `["brand-monitor","market-competitor","investment-bank","harch-alpha"]` — **403 si `essential`** |
| GET `/api/console/sentiment-trend?range=` | `src/app/api/console/sentiment-trend/route.ts` | `["brand-monitor","market-competitor","investment-bank"]` — **403 si `essential`** ; mappe 7d/30d/365d (90d → fallback 30d) |
| GET `/api/console/topics` | `src/app/api/console/topics/route.ts` | `["brand-monitor","market-competitor","investment-bank"]` — **403 si `essential`** |
| GET `/api/console/source-distribution` | `src/app/api/console/source-distribution/route.ts` | aucune vérification |
| GET `/api/harch100/latest` | `src/app/api/harch100/latest/route.ts` | public (no auth) |
| POST `/api/console/ask` | `src/app/api/console/ask/route.ts` | any accountType + admin autorisés |
| GET `/api/console/export-csv?type=articles&days=90` | `src/app/api/console/export-csv/route.ts` | aucune vérification |

---

## 1. CARTE COMMERCIALE ESSENTIEL — EXTRAIT VERBATIM

**Source:** `src/app/atelier/pricing/PricingPage.tsx` lignes 26–46

```ts
{
  name: "Essentiel",
  tagline:
    "Pour les petites équipes de communication et marketing qui démarrent leur veille réputationnelle et leur suivi de la visibilité IA.",
  capabilities: [
    "Veille médiatique",
    "Social listening",
    "Suivi de la visibilité IA (GenAI Lens)",
    "Relations médias",
  ],
  bestFor: [
    "Les petites équipes de communication/marketing",
    "Les start-ups et les entreprises en pleine croissance",
    "Capacités d'analyse internes limitées",
  ],
  keyFeatures: [
    "HarchIQ AI (50 questions/jour)",
    "Alertes et rapports",
    "Tableaux de bord prédéfinis",
  ],
}
```

### 1.1. Matrice comparative — colonne Essentiel (PricingPage.tsx lignes 153–177)

| Catégorie | Critère | Valeur Essentiel |
|-----------|---------|------------------|
| Capacités incluses | Veille médiatique | ✓ |
| Capacités incluses | Social listening | ✓ |
| Capacités incluses | Suivi de la visibilité IA (GenAI Lens) | ✓ |
| Capacités incluses | Relations médias | ✓ |
| Capacités incluses | Marketing d'influence | — |
| HarchIQ AI | Niveau HarchIQ AI | Standard |
| HarchIQ AI | Questions par jour | **50** |
| Analyse & rapports | Alertes et rapports | ✓ |
| Analyse & rapports | Tableaux de bord prédéfinis | ✓ |
| Analyse & rapports | Benchmarking concurrentiel | — |
| Analyse & rapports | Tableaux de bord et rapports personnalisés | — |
| Analyse & rapports | Rapports board-ready | — |
| Intégrations & gouvernance | Intégrations API et MCP | — |
| Intégrations & gouvernance | Gouvernance, workflows et autorisations | — |
| Intégrations & gouvernance | SSO / SAML | — |
| Multi-clients | Multi-clients | — |
| Multi-clients | White-label | — |
| Multi-clients | Facturation par compte | — |

### 1.2. Promesses complémentaires (FAQ `faq-data.ts`)

| ID FAQ | Promesse verbatim Essentiel |
|--------|------------------------------|
| FAQ 2 | "Notre pipeline collecte les articles en continu depuis 30+ sources marocaines et africaines. Chaque article est crawlé toutes les 60 secondes pour les plans Corporate et Sovereign, **toutes les 5 minutes pour le plan Essentiel**." |
| FAQ 10 | "PDF : rapport mensuel board-ready (32 pages Corporate, **8 pages Essentiel**)" |
| FAQ 20 | "**Essentiel : 1 marque, 10 sources, 3 moteurs IA, dashboard, WhatsApp digest**" |
| FAQ 21 | "**Essentiel / Pro : engagement annuel, paiement mensuel, remise 15 %**" |
| FAQ 23 | "**Essentiel : 1 session de 2h, 1 utilisateur**" |
| FAQ 24 | "**Essentiel : 48h après signature**" |
| FAQ 25 (annulation) | "Préavis : **30 jours (Essentiel, Pro)**, 90 jours (Sovereign)" |
| FAQ 28 (upsell) | "**70 % de nos clients Essentiel passent en Pro dans les 6 mois**" |
| `UserManagement.tsx:7,67` | "Plan-aware (**Essentiel: 3**, Pro: 20, Enterprise/Agency: unlimited)" — `maxUsers: 3` |

### 1.3. Pitch commercial PricingPage.tsx — FAQ intégrée (lignes 179–200)

- "Pourquoi tous les prix sont-ils « Sur devis » ?" — réponse évoque démo 30 min.
- "Combien de temps prend la mise en place ?" — "**Pour le plan Essentiel : 48 heures après signature.** Pour les plans Pro et Grandes Entreprises : 5 à 10 jours ouvrés …"
- "Mes données sont-elles hébergées au Maroc ?" — "L'architecture est conforme à la Loi 09-08 et aux recommandations CNDP. …"
- "Puis-je changer de plan en cours d'année ?" — oui au prorata.
- "Quelle est la durée d'engagement ?" — "Plans Essentiel et Pro : **engagement annuel avec paiement mensuel**. … Un essai pilote de 30 jours est possible pour les plans Pro et supérieurs."

---

## 2. INVENTAIRE EXHAUSTIF DES FONCTIONNALITÉS UI (EssentialDashboard)

Le dashboard `EssentialDashboard.tsx` (10 941 lignes) contient **39 fonctionnalités distinctes** (38 cartes/composants + 1 spacer "Rappel Dircom"). Numérotation alignée sur les commentaires `// SECTION N` du fichier + préfixes `R2/R3/R4-ESSENTIEL`.

---

### Feature 1: HarchIQ AI Workspace (Section 01)

**Axe 1 — Promesse & Origine Commerciale**
- URL source: `PricingPage.tsx:42` (keyFeature "HarchIQ AI (50 questions/jour)") + `faq-data.ts` FAQ 20 (3 moteurs IA, WhatsApp digest) + matrice comparative `PricingPage.tsx:161` ("Standard", "50")
- Pitch commercial verbatim: "HarchIQ AI (50 questions/jour)"
- Niveau de service: 50 questions/jour ; reset quotidien à minuit (côté client localStorage)

**Axe 2 — Route & Ingestion Données**
- Source données brute: Prisma (Articles, RiskAssessment, AIVisibility, ReputationScore, Company) + LLM z-ai-web-dev-sdk
- Route API: `POST /api/console/ask` body `{ question: string }`
- Auth: any accountType allowed (ligne 102). Réel backend.

**Axe 3 — Traitement & Logique Métier**
- Transformation: 6 requêtes Prisma parallèles (negativeArticles 7j, highRisks, aiVisibility, primaryScore, neighbors, recentArticlesForTopics) → prompt contextuel "no-hallucination" (60 lignes) → appel LLM `zai.chat.completions.create` temperature 0.3 max_tokens 500 thinking disabled → extraction sources par text-match (alert titles, AI engine names, neighbor names, topic labels).
- Détail: inférence IA (GLM-4 via z-ai-web-dev-sdk). Aucun cache serveur. Sources citées max 5.

**Axe 4 — Rendu UI & Expérience**
- Composant UI: `HarchIQWorkspace` (lignes 1651–2072) — `CardShell` full-width avec header strip (Sparkles icône sage, titre "HarchIQ AI Workspace", quota Progress + Badge "N RESTANTES"), colonne gauche chat 60 % (messages scrollables, input bar ChatGPT-style), colonne droite bibliothèque de prompts 40 % (6 PromptCard cliquables).
- États dynamiques: pending bubble ("HarchIQ analyse vos données…" avec spinner), sources expandable par message (chevron + chips AL/TP/IA/CO), boutons Exporter PPT / Exporter PDF / Copier par message, follow-up chips cliquables (3 par message, générés côté client par `generateFollowUps` selon mots-clés de la question), quota désactivant l'envoi au-delà de 50/50 avec toast erreur.
- Section dashboard: SECTION 1 — HarchIQ AI Workspace (hero, full width) — `id="ai-workspace"` — lignes 1651–2072.

---

### Feature 2: Score de Réputation (Section 02)

**Axe 1 — Promesse & Origine Commerciale**
- URL source: implicite — couvert par capability "Veille médiatique" + keyFeature "Tableaux de bord prédéfinis". Non promis verbatim dans PricingPage. Tagline Essentiel: "démarrent leur veille réputationnelle".
- Pitch commercial verbatim: (aucun — score agrégé non promis explicitement)
- Niveau de service: temps réel, refresh manuel

**Axe 2 — Route & Ingestion Données**
- Source données brute: Prisma PostgreSQL (`reputationScore`, `article`, `aIVisibility`, `company`)
- Route API: `GET /api/console/brand-health`
- Auth: session + companyId. Aucune vérification accountType. Réel backend.

**Axe 3 — Traitement & Logique Métier**
- Transformation: 5 requêtes Prisma parallèles → calcul `score = reputationScore.overall ?? 50`, `trend = reputationScore.trend === "up" ? 2 : -3`, pourcentages positif/neutre/négatif sur 7 jours, `sov = (articles7d / totalAllArticles) * 100`, `crisisScore = min(100, negativeShare*60 + min(25, articles24h/50*25))`.
- Détail: calcul math côté serveur. Pas d'IA. Aucune inférence LLM.

**Axe 4 — Rendu UI & Expérience**
- Composant UI: `ScoreReputationCard` (lignes 2298–2477) — `RadialBarChart` recharts (startAngle 220, endAngle -40, barSize 14) avec `PolarAngleAxis domain [0,100]`, gauge 200×200 px. Au centre: score 44 px font-mono. À droite: `Météo réputation — [Ensoleillé/Nuageux/Orageux]` (icône `Sun/Cloud/CloudRain` selon `weatherFor(score)`), delta `+N pts vs sem. dernière` (composant `Delta`), paragraphe `recommendation`, `AiCommentary` construit dynamiquement (amélioré/dégradé/stabilisé de N points, grâce à X % positif, narrative « label » gagne/stable). À droite: 6 `MiniStat` (Part de voix, Mentions 24h, Vélocité, Positif, Neutre, Négatif avec SparkDot coloré).
- États dynamiques: bouton Refresh (icône RefreshCw qui tourne 800 ms), `lastUpdated` relatif, badge help (?).
- Section dashboard: SECTION 2 — lignes 2298–2477, `id="score"`.

---

### Feature 3: Sentiment Moyen (Section 03, KPI strip)

**Axe 1 — Promesse & Origine Commerciale**
- URL source: PricingPage capabilités "Veille médiatique" + "Social listening"
- Pitch commercial verbatim: (sous-entendu par "veillé réputationnelle")
- Niveau de service: glissant 7 jours

**Axe 2 — Route & Ingestion Données**
- Source données brute: Prisma `article` (sentimentLabel, sentimentScore) via `/api/console/sentiment-trend?range=30d` + `health.sentiment.positive` via `/api/console/brand-health`
- Route API: 2 routes combinées — `GET /api/console/brand-health` (positive %) + `GET /api/console/sentiment-trend?range=${sentimentRange}` (spark 7j)
- ⚠️ **PROBLÈME**: route `/api/console/sentiment-trend` retourne **403 Forbidden** pour `accountType === "essential"` (allowedTypes exclut essential). Voir Axe 2 Feature 7 pour détail.

**Axe 3 — Traitement & Logique Métier**
- Transformation: côté client, `spark = trend.data.slice(-7).map(d => ({ d: d.date, v: (d.positive / max(1, d.count)) * 100 }))`. Delta = `health.trend`. Insight construit par seuils: ≥50 %, 35-50 %, <35 %.
- Détail: calcul math côté client. Aucune inférence.

**Axe 4 — Rendu UI & Expérience**
- Composant UI: `SentimentMoyenKpi` (lignes 2483–2540) — CardShell col-span-3, `LineChart` sparkline 80×28 px (1 Line SAGE strokeWidth 1.5, no dots), valeur 28 px font-mono, `Delta` signé, `AiCommentary` insight.
- États dynamiques: skeleton `LiveSkeleton` pendant chargement, AiCommentary avec insight dynamique.
- Section dashboard: SECTION 3 — KPI strip col-span-3 — lignes 2483–2540.

---

### Feature 4: Mentions / Jour (Section 04, KPI strip)

**Axe 1 — Promesse & Origine Commerciale**
- URL source: PricingPage capabilité "Veille médiatique" (mention counting)
- Pitch commercial verbatim: (sous-entendu)
- Niveau de service: 24 dernières heures

**Axe 2 — Route & Ingestion Données**
- Source données brute: Prisma `article` count + `/api/console/sentiment-trend` (7 derniers jours pour bar sparkline)
- Route API: `GET /api/console/brand-health` (mentionCount24h) + `GET /api/console/sentiment-trend`
- ⚠️ Sentiment-trend = 403 pour `essential`.

**Axe 3 — Traitement & Logique Métier**
- Transformation: `bars = trend.data.slice(-7).map(d => ({ d, v: d.count }))`. Delta = `health.trend > 0 ? 12 : -4` (delta factice codé en dur !). Insight: `value > 100 ? "élevé" : value > 30 ? "modéré" : "faible"` + `${sourcesCount} sources actives sur 7 jours`.
- Détail: calcul math côté client. **Le delta est factice** (valeur arbitraire selon signe de trend).

**Axe 4 — Rendu UI & Expérience**
- Composant UI: `MentionsJourKpi` (lignes 2546–2600) — CardShell col-span-3, `BarChart` sparkline 80×28 px (1 Bar SAGE radius 2px), valeur 28 px font-mono, Delta, AiCommentary.
- États dynamiques: skeleton, AiCommentary dynamique.
- Section dashboard: SECTION 4 — KPI strip col-span-3 — lignes 2546–2600.

---

### Feature 5: Citations IA (Section 05, KPI strip)

**Axe 1 — Promesse & Origine Commerciale**
- URL source: PricingPage capabilité "Suivi de la visibilité IA (GenAI Lens)" + `faq-data.ts` FAQ 20 "3 moteurs IA"
- Pitch commercial verbatim: "Suivi de la visibilité IA (GenAI Lens)"
- Niveau de service: 3 LLM affichés (ChatGPT, Perplexity, Gemini) — la route en supporte 4 (Claude en plus)

**Axe 2 — Route & Ingestion Données**
- Source données brute: Prisma `aIVisibility` (platform, cited, position, sentiment, confidence, summary)
- Route API: `GET /api/console/ai-visibility`
- ⚠️ **PROBLÈME CRITIQUE**: allowedTypes = `["brand-monitor","market-competitor","investment-bank","harch-alpha"]` — `essential` est **exclu** → 403 Forbidden pour les vrais utilisateurs Essentiel.

**Axe 3 — Traitement & Logique Métier**
- Transformation: serveur — groupage par platform (latest per platform), `citedCount = platforms.filter(cited)`, `visibilityScore = round(citedCount/totalCount*100)`. Côté client: chips `GPT/PPL/GEM` colorés si cités, sinon muted.
- Détail: calcul math. Aucune inférence.

**Axe 4 — Rendu UI & Expérience**
- Composant UI: `CitationsIaKpi` (lignes 2606–2708) — CardShell col-span-3, valeur `${cited}/${total || "—"}` 28 px font-mono, 3 chips LLM (GPT/PPL/GEM), badge "HARCHIQ", Delta, AiCommentary.
- États dynamiques: chips colorés selon `cited`, AiCommentary dynamique.
- Section dashboard: SECTION 5 — KPI strip col-span-3 — lignes 2606–2708.

---

### Feature 6: Alertes Actives (Section 06, KPI strip)

**Axe 1 — Promesse & Origine Commerciale**
- URL source: PricingPage keyFeature "Alertes et rapports" + matrice "Alertes et rapports ✓"
- Pitch commercial verbatim: "Alertes et rapports"
- Niveau de service: temps réel, alertes WhatsApp mentionnées dans help text

**Axe 2 — Route & Ingestion Données**
- Source données brute: Prisma `article` (négatifs 7j), `riskAssessment`, `inboundWhatsAppMessage` (status flagged)
- Route API: `GET /api/console/crisis-alerts`
- Auth: session + companyId. Aucune vérification accountType. Réel backend.

**Axe 3 — Traitement & Logique Métier**
- Transformation: 3 requêtes Prisma parallèles → mapping unifié `alerts[]` (negativeArticles + whatsappMsgs + riskAssessments) avec severity calculée selon sentimentScore / crisisScore / riskLevel → tri par timestamp desc → slice 15.
- Détail: calcul math côté serveur. Aucune inférence.

**Axe 4 — Rendu UI & Expérience**
- Composant UI: `AlertesActivesKpi` (lignes 2714–2788) — CardShell col-span-3, valeur 28 px (couleur selon count et critical), Badge destructive "N critiques" si critical > 0, icône Bell, lien "Voir toutes" qui scroll vers `#alertes`, "Dernière alerte : il y a X min", AiCommentary.
- États dynamiques: couleur conditionnelle (POSITIVE/AMBER/NEGATIVE), badge critique, help popover ("Harch détecte automatiquement les pics d'activité négative…"), AiCommentary dynamique.
- Section dashboard: SECTION 6 — KPI strip col-span-3 — lignes 2714–2788.

---

### Feature 7: Tendance Sentiment (Section 07)

**Axe 1 — Promesse & Origine Commerciale**
- URL source: implicite — couvert par "Veille médiatique" + "Social listening"
- Pitch commercial verbatim: (sous-entendu)
- Niveau de service: 7j / 30j / 90j (toggle Tabs)

**Axe 2 — Route & Ingestion Données**
- Source données brute: Prisma `article` (sentimentLabel, sentimentScore, publishedAt) bucketisé par jour
- Route API: `GET /api/console/sentiment-trend?range=${7d|30d|90d}`
- ⚠️ **PROBLÈME CRITIQUE #1**: allowedTypes exclut `essential` → **403 Forbidden** pour Essentiel.
- ⚠️ **PROBLÈME CRITIQUE #2**: route supporte `7d|30d|365d`. La valeur `90d` envoyée par le dashboard **n'est pas dans le mapping** et est silencieusement fallback à `30d` (voir `route.ts:55` `days = RANGE_DAYS[rangeParam] ?? 30`). L'utilisateur clique "90j", il voit 30 jours.

**Axe 3 — Traitement & Logique Métier**
- Transformation: serveur — bucket par jour calendaire (y compris jours sans articles pour axe X continu), avgScore = `sum/count * 1000 / 1000`, count, positive/neutral/negative. Côté client: `Score = round(((avgScore + 1) / 2) * 100)`, anomalie = `negative > (positive + neutral) * 0.5 || count > moyenne * 2`.
- Détail: calcul math + détection anomalie heuristique. Aucune inférence LLM.

**Axe 4 — Rendu UI & Expérience**
- Composant UI: `TendanceSentimentCard` (lignes 2795–2997) — CardShell col-span-7, `ComposedChart` recharts 220 px hauteur, `Area` Positif (gradient vert), `Line` Neutre (gris), `Line` Négatif (rouge), `ReferenceDot` rouges sur anomalies (r=4 stroke white), Tabs `7j/30j/90j`, `RTooltip` recharts. En bas: `ProgressiveList` "Décomposition quotidienne" (5 visibles + "Voir plus" anime le reste) avec ligne par jour (+N · M · -Neg · count mentions) et pastille rouge si anomalie.
- États dynamiques: Tabs 7j/30j/90j (la 90j est cassée — voir Axe 2), hover tooltip recharts, ProgressiveList persistée localStorage `essential:disclosure`, AiCommentary "Un pic d'activité négative a été détecté le DD MMM…".
- Section dashboard: SECTION 7 — lignes 2795–2997, `id="sentiment"`.

---

### Feature 8: Diversité des Sources (Section 08)

**Axe 1 — Promesse & Origine Commerciale**
- URL source: PricingPage capabilité "Veille médiatique" + `faq-data.ts` FAQ 20 "**10 sources**" pour Essentiel
- Pitch commercial verbatim: "Essentiel : 1 marque, 10 sources, 3 moteurs IA, dashboard, WhatsApp digest" (FAQ 20)
- Niveau de service: 10 sources (FAQ) — **mais le dashboard dit 20** (voir contradiction ci-dessous)

**Axe 2 — Route & Ingestion Données**
- Source données brute: Prisma `article.source` groupé par nom
- Route API: `GET /api/console/source-distribution`
- Auth: session + companyId. Aucune vérification accountType. Réel backend.

**Axe 3 — Traitement & Logique Métier**
- Transformation: serveur — groupage par source (Map), tri par count desc, slice 8. Type déterminé par substring match (`hespress|le360|telquel|medias24|leseco` → media, sinon social). Couleurs codées en dur (8 couleurs cycle).
- Détail: calcul math + classification heuristique par nom. Aucune inférence.

**Axe 4 — Rendu UI & Expérience**
- Composant UI: `DiversiteSourcesCard` (lignes 3003–3206) — CardShell col-span-5, `BarChart` vertical recharts 200 px, 8 bars SAGE cliquables (cursor pointer), tooltip recharts. Sous le chart: drill-down panel quand bar cliquée (icône MessageCircle/Newspaper + name + "N mentions · type X" + bouton X pour fermer). AiCommentary. Puis `ProgressiveList` "Toutes les sources" (5 visibles + "Voir plus"). Badge `${totalSources}+ SOURCES`. **Help text: "Plan Essentiel : 20 sources surveillées."** (l. 3039) — **CONTRADICTOIRE avec FAQ 20 qui dit 10 sources**.
- États dynamiques: bar click → drill-down panel, hover tooltip, ProgressiveList, help popover dismissible, AiCommentary dynamique.
- Section dashboard: SECTION 8 — lignes 3003–3206, `id="sources"`.

---

### Feature 9: Dernières Mentions (Section 09)

**Axe 1 — Promesse & Origine Commerciale**
- URL source: PricingPage capabilités "Veille médiatique" + "Social listening"
- Pitch commercial verbatim: (sous-entendu)
- Niveau de service: 8 articles affichés, filtres Tous/Positif/Neutre/Négatif

**Axe 2 — Route & Ingestion Données**
- Source données brute: Prisma `article` (négatifs 7j) + `riskAssessment` + `inboundWhatsAppMessage` via `/api/console/crisis-alerts`
- Route API: `GET /api/console/crisis-alerts` (réutilise la même route que Feature 6)
- Auth: session + companyId. Réel backend.

**Axe 3 — Traitement & Logique Métier**
- Transformation: côté client — `articles = alerts.slice(0, 8).map(a => ({ ...a, sentiment: severity === "critical" ? "negative" : "warning" ? "neutral" : "positive" }))`. Filter par sentiment. **Comment code line 3217: "Add a few synthetic positive/neutral items based on alerts source for variety"** — mais le code ne synthétise rien, il dérive le sentiment de la severity (ce qui signifie que les "Positif" n'apparaissent jamais car severity minimum = "watch" → mappé à "positive", mais "watch" vient de sentimentScore < -0.3 seulement).
- Détail: calcul math côté client. Le filtre "Positif" ne retournera presque jamais d'items car la route ne renvoie que des alerts (négatifs + risques + WhatsApp flaggés).

**Axe 4 — Rendu UI & Expérience**
- Composant UI: `DernieresMentionsCard` (lignes 3212–3388) — CardShell col-span-7, liste scrollable (max 400 px), 4 boutons filtre (Tous/Positif/Neutre/Négatif). Chaque article: ligne `<a href={url}>` externe avec icône Newspaper/MessageCircle, source, badge langue (AR/FR), timestamp relatif, titre 2 lignes (WebkitLineClamp), SparkDot coloré + label sentiment. Lien "Voir tous les articles".
- États dynamiques: filtres toggle (SAGE actif), hover bg, scroll custom scrollbar, EmptyState avec CTA "Configurer mes mots-clés" + 4 suggestion chips (Marque/Dirigeants/Concurrents/Produits).
- Section dashboard: SECTION 9 — lignes 3212–3388.

---

### Feature 10: Résumé Hebdomadaire IA (Section 10)

**Axe 1 — Promesse & Origine Commerciale**
- URL source: PricingPage keyFeature "Alertes et rapports" (sous-entendu hebdo) + `faq-data.ts` FAQ 10 "PDF : 8 pages Essentiel"
- Pitch commercial verbatim: "Alertes et rapports"
- Niveau de service: hebdomadaire, généré par HarchIQ

**Axe 2 — Route & Ingestion Données**
- Source données brute: Prisma (via insight-engine) + LLM z-ai-web-dev-sdk
- Route API: `GET /api/console/insights` (cache 15 min, POST force=1 pour regenerate)
- Auth: any accountType. **Pour `essential`**: fallback à `accountType = "brand-monitor"` car ALLOWED_ACCOUNT_TYPES exclut essential → l'insight est généré avec le persona brand-monitor (pas un persona Essentiel dédié).

**Axe 3 — Traitement & Logique Métier**
- Transformation: serveur — `generateInsights({ userId, accountType, session, forceRefresh })` (lib `harchiq/insight-engine.ts`). Appel LLM, sources validées. Côté client: `bullets = insight.body.split(/[.!]\s+/).filter(s => s.length > 15).slice(0, 3)`.
- Détail: inférence LLM. Persona brand-monitor au lieu d'Essentiel.

**Axe 4 — Rendu UI & Expérience**
- Composant UI: `ResumeHebdoCard` (lignes 3394–3527) — CardShell col-span-5, badge "HARCHIQ", bouton Refresh (régénère via `refetchInsights`), quote block italic (body entier), liste à puces (3 phrases extraites), footer "Généré par HarchIQ · il y a X", bouton "Exporter PDF" qui ne fait que `toast.success("Export PDF lancé")` — **pas de PDF réel généré**.
- États dynamiques: skeleton pendant chargement, bouton régénère (spinner 1.2 s), toast pour "export PDF" (mock).
- Section dashboard: SECTION 10 — lignes 3394–3527.

---

### Feature 11: Snapshot Visibilité IA (Section 11)

**Axe 1 — Promesse & Origine Commerciale**
- URL source: PricingPage capabilité "Suivi de la visibilité IA (GenAI Lens)" + `faq-data.ts` FAQ 20 "3 moteurs IA" + FAQ 4 "ChatGPT, Perplexity, Gemini, Claude, Copilot, Mistral, Grok…"
- Pitch commercial verbatim: "Suivi de la visibilité IA (GenAI Lens)"
- Niveau de service: 3 LLM affichés (ChatGPT, Perplexity, Gemini) — promesse 3 moteurs IA

**Axe 2 — Route & Ingestion Données**
- Source données brute: Prisma `aIVisibility` (platform, cited, position, sentiment, confidence, summary)
- Route API: `GET /api/console/ai-visibility`
- ⚠️ **403 Forbidden pour `essential`** (même problème que Feature 5).

**Axe 3 — Traitement & Logique Métier**
- Transformation: serveur — groupage par platform (latest per platform), `citedCount`, `visibilityScore`. Côté client: `targetLLMs = ["ChatGPT", "Perplexity", "Gemini"]` (Claude ignoré dans cette vue), `rank = parsePositionRank(p.position)` (extrait "1st", "top-5", "not cited"), `trend = rank <= 2 ? "up" : rank >= 5 ? "down" : "stable"`, `progress = max(10, 100 - (rank-1)*15)`.
- Détail: calcul math + parsing heuristique de position. Aucune inférence.

**Axe 4 — Rendu UI & Expérience**
- Composant UI: `SnapshotVisibiliteCard` (lignes 3533–3675) — CardShell col-span-7, badge `Query: "meilleure [secteur] Maroc"`, 3 cartes côte-à-côte (ChatGPT/Perplexity/Gemini) — chaque carte: nom, Badge "#N" si cité ou "ABSENT", ArrowUp/ArrowDown/Minus + label "En hausse/En baisse/Stable", `Progress` bar (SAGE si cité, gris sinon). AiCommentary. Lien "Voir le détail".
- États dynamiques: carte sage si cité, gris si absent, AiCommentary dynamique ("X vous classe #N… Aucun LLM majeur ne vous cite…").
- Section dashboard: SECTION 11 — lignes 3533–3675, `id="visibilite-ia"`.

---

### Feature 12: Top 5 Sujets (Section 12)

**Axe 1 — Promesse & Origine Commerciale**
- URL source: implicite — couvert par "Veille médiatique"
- Pitch commercial verbatim: (sous-entendu)
- Niveau de service: top 5 sujets

**Axe 2 — Route & Ingestion Données**
- Source données brute: Prisma `article.source` groupé + `riskAssessment.category` (proxy topics)
- Route API: `GET /api/console/topics`
- ⚠️ **403 Forbidden pour `essential`** (allowedTypes exclut essential).

**Axe 3 — Traitement & Logique Métier**
- Transformation: serveur — `sourceMap = group articles by source`, ajout risk categories, tri par count desc, slice 8. Côté client: `topics.slice(0, 5)`, **sentiment split synthétique** (`pos = round(total * 0.45)`, `neg = round(total * (type === "risk" ? 0.45 : 0.2))`, `neu = total - pos - neg`) — **le sentiment par topic n'est PAS dans les données, il est fabriqué côté client**.
- Détail: calcul math + **fabrication de sentiment**. Aucune inférence LLM.

**Axe 4 — Rendu UI & Expérience**
- Composant UI: `TopSujetsCard` (lignes 3681–3893) — CardShell col-span-5, `BarChart` vertical stacked (Positif/Neutre/Négatif stackId "a") 180 px, 5 bars cliquables. Sous: panel détail quand bar cliquée (label + Badge RISQUE/SOURCE + count). AiCommentary. `ProgressiveList` "Tous les sujets". Lien "Voir tous les sujets".
- États dynamiques: bar click → détail, hover tooltip, ProgressiveList, AiCommentary dynamique.
- Section dashboard: SECTION 12 — lignes 3681–3893, `id="sujets"`.

---

### Feature 13: Indicateur de Crise (Section 13)

**Axe 1 — Promesse & Origine Commerciale**
- URL source: PricingPage keyFeature "Alertes et rapports"
- Pitch commercial verbatim: "Alertes et rapports"
- Niveau de service: DEFCON 1-5 (5 = safe, 1 = critique)

**Axe 2 — Route & Ingestion Données**
- Source données brute: Prisma via `/api/console/brand-health` (crisisScore, crisisLevel) + `/api/console/crisis-alerts` (alerts)
- Route API: 2 routes combinées
- Auth: session + companyId. Réel backend.

**Axe 3 — Traitement & Logique Métier**
- Transformation: serveur — `crisisScore = min(100, negativeShare*60 + min(25, articles24h/50*25))`. Côté client: `defcon = crisisScore >= 80 ? 1 : >= 60 ? 2 : >= 40 ? 3 : >= 20 ? 4 : 5`. `threatCount = alerts.filter(severity === critical || warning).length`. `lastIncident = alerts[0]?.timestamp`.
- Détail: calcul math. Aucune inférence.

**Axe 4 — Rendu UI & Expérience**
- Composant UI: `IndicateurCriseCard` (lignes 3899–4027) — CardShell col-span-5, Badge "DEFCON N" (couleur selon niveau), barre DEFCON 5 cases (1-5), la case active est colorée (NEGATIVE/AMBER/POSITIVE), label "Niveau Critique/Élevé/Modéré/Faible/Minimal", `Score crise: N/100`, 2 `MiniStat` (Menaces actives, Dernier incident), AiCommentary, bouton "Mode Crise" qui ne fait que `toast.info("Mode Crise — workflow activé")` — **pas de workflow réel**.
- États dynamiques: couleur DEFCON, bouton Mode Crise (mock toast), AiCommentary dynamique.
- Section dashboard: SECTION 13 — lignes 3899–4027, `id="alertes"`.

---

### Feature 14: Carte de Chaleur Géo (Section 14)

**Axe 1 — Promesse & Origine Commerciale**
- URL source: **AUCUNE** — pas promis dans PricingPage, FAQ, ou ailleurs pour Essentiel
- Pitch commercial verbatim: (aucun)
- Niveau de service: (non spécifié)

**Axe 2 — Route & Ingestion Données**
- Source données brute: **DONNÉES SIMULÉES CÔTÉ CLIENT** — 6 villes marocaines codées en dur (Casablanca, Rabat, Marrakech, Fès, Tanger, Agadir) avec lat/lon, count, sentiment **fictifs** (lignes 4036-4043).
- Route API: **AUCUNE** — aucune route `/api/console/geo-signals` ou similaire n'est appelée par le dashboard.
- Si mock/simulé: **OUI — données 100 % codées en dur, pas de route backend.**

**Axe 3 — Traitement & Logique Métier**
- Transformation: `data = cities.map(c => ({ ...c, z: c.count, fill: c.sentiment >= 0.6 ? POSITIVE : c.sentiment >= 0.45 ? AMBER : NEGATIVE }))`. Aucune donnée réelle.
- Détail: aucune transformation. AiCommentary **codé en dur** (l. 4146): "Casablanca concentre le plus de mentions (142)… Fès présente un sentiment plus mitigé (40%)…".

**Axe 4 — Rendu UI & Expérience**
- Composant UI: `CarteChaleurGeoCard` (lignes 4033–4152) — CardShell col-span-7, `ScatterChart` recharts 220 px (XAxis lon, YAxis lat, ZAxis count range [60, 600]), 6 bulles colorées par sentiment, custom tooltip, 3 légendes SparkDot. Lien "Voir la carte interactive" (href "#").
- États dynamiques: hover tooltip custom, AiCommentary codé en dur.
- Section dashboard: SECTION 14 — lignes 4033–4152.

---

### Feature 15: Position Harch 100 (Section 15)

**Axe 1 — Promesse & Origine Commerciale**
- URL source: implicite — Harch 100 est un produit public; non promis spécifiquement pour Essentiel
- Pitch commercial verbatim: (aucun pour Essentiel)
- Niveau de service: classement mensuel public

**Axe 2 — Route & Ingestion Données**
- Source données brute: Prisma `harch100Snapshot` (rangings JSON)
- Route API: `GET /api/harch100/latest` — **PUBLIC, AUCUNE AUTH**.
- Réel backend.

**Axe 3 — Traitement & Logique Métier**
- Transformation: serveur — `findFirst publishedAt not null orderBy publishedAt desc`. Côté client: `currentRank = rankings[0]?.rank ?? 12` (fallback à 12 si vide — **pourquoi 12 ?**). **`rankData` SYNTHÉTIQUE**: 6 mois ["Avr","Mai","Juin","Juil","Août","Sep"] avec `rank = max(1, currentRank + (5-i) - floor(random * 2))` — l'évolution mensuelle est **fabriquée aléatoirement**.
- Détail: rang courant réel, **historique fabriqué côté client avec `Math.random()`**.

**Axe 4 — Rendu UI & Expérience**
- Composant UI: `PositionHarch100Card` (lignes 4158–4299) — CardShell col-span-5, valeur `#N` 48 px font-mono, trend ArrowUp/Down/Minus + "±N places ce mois", Badge secteur, `LineChart` 140 px avec axe Y reversed (1 en haut), dot SAGE r=3. Badge `${period}`. Lien "Voir le classement complet" → `/atelier/harch-100`.
- États dynamiques: tooltip recharts, AiCommentary absent (pas d'`AiCommentary` ici).
- Section dashboard: SECTION 15 — lignes 4158–4299, `id="harch-100"`.

---

### Feature 16: Activité Réseau Social (Section 16)

**Axe 1 — Promesse & Origine Commerciale**
- URL source: PricingPage capabilité "Social listening"
- Pitch commercial verbatim: "Social listening"
- Niveau de service: (non spécifié)

**Axe 2 — Route & Ingestion Données**
- Source données brute: **DONNÉES SIMULÉES CÔTÉ CLIENT** — `data = Array.from({length: 30}).map(...)` avec `Math.sin(i/3) * 8 + Math.random() * 6` etc. (lignes 4307-4320). Engagement `likes: 1842, shares: 312, comments: 198` **codé en dur**.
- Route API: **AUCUNE**.
- Si mock/simulé: **OUI — 100 % simulé, pas de route backend.**

**Axe 3 — Traitement & Logique Métier**
- Transformation: `total = data.reduce(s => s + Facebook + Instagram + Twitter + LinkedIn, 0)`. Données fabriquées.
- Détail: aucune donnée réelle.

**Axe 4 — Rendu UI & Expérience**
- Composant UI: `ActiviteReseauSocialCard` (lignes 4305–4417) — CardShell col-span-7, `AreaChart` stacked 200 px 4 séries (Facebook #1877F2, Instagram #C13584, Twitter #1DA1F2, LinkedIn #0A66C2) avec gradients. Badge `${fmtNumber(total)} MENTIONS / 30J`. 3 `MiniStat` (J'aime, Partages, Commentaires).
- États dynamiques: hover tooltip recharts.
- Section dashboard: SECTION 16 — lignes 4305–4417.

---

### Feature 17: Météo Sentiments par Langue (Section 17)

**Axe 1 — Promesse & Origine Commerciale**
- URL source: **AUCUNE** — pas promis pour Essentiel
- Pitch commercial verbatim: (aucun)
- Niveau de service: (non spécifié)

**Axe 2 — Route & Ingestion Données**
- Source données brute: **DONNÉES SIMULÉES CÔTÉ CLIENT** — `data = [{Français: 62/24/14}, {Arabe/Darija: 25/20/55}, {Anglais: 48/38/14}]` codé en dur (lignes 4425-4429).
- Route API: **AUCUNE**.
- Si mock/simulé: **OUI — 100 % codé en dur.**

**Axe 3 — Traitement & Logique Métier**
- Transformation: aucune. AiCommentary **codé en dur** (l. 4486): "La Darija est plus négative (55% négatif)… Le français reste positif (62%).".
- Détail: aucune transformation.

**Axe 4 — Rendu UI & Expérience**
- Composant UI: `MeteoSentimentsLangueCard` (lignes 4423–4501) — CardShell col-span-7, `BarChart` stacked 200 px 3 bars (Français, Arabe/Darija, Anglais) avec Positif/Neutre/Négatif stackId "a", barSize 48. Lien "Analyser la Darija en détail" (href "#").
- États dynamiques: hover tooltip recharts.
- Section dashboard: SECTION 17 — lignes 4423–4501.

---

### Feature 18: Évolution du Score 30j (Section 18)

**Axe 1 — Promesse & Origine Commerciale**
- URL source: implicite — chevauche Feature 2 (Score de Réputation)
- Pitch commercial verbatim: (aucun spécifique)
- Niveau de service: 30 jours

**Axe 2 — Route & Ingestion Données**
- Source données brute: `/api/console/brand-health` (score courant uniquement) — **historique 30j fabriqué côté client**
- Route API: `GET /api/console/brand-health` (réel) — mais données 30j fabriquées
- Si mock/simulé: **PARTIEL — score courant réel, historique 30j fabriqué** avec `Math.sin(i/4) * 4 + Math.cos(i/7) * 3`.

**Axe 3 — Traitement & Logique Métier**
- Transformation: `data = Array.from({length: 30}).map((_, i) => ({ date, score: max(55, min(80, round(currentScore - 4 + variance))) }))`. Markers alertes **codés en dur** (`i === 9 || i === 21`). Markers positifs **codés en dur** (`i === 12 || i === 24`). AiCommentary **codé en dur**: "Votre score a fluctué entre N et M ce mois, avec un pic le 12 août suite à la couverture positive d'Attijariwafa." — **référence à Attijariwafa fabriquée**.

**Axe 4 — Rendu UI & Expérience**
- Composant UI: `EvolutionScoreCard` (lignes 4507–4617) — CardShell col-span-5, `LineChart` 200 px, `ReferenceLine` y=currentScore dashed SAGE label "Tendance", `Line` score SAGE strokeWidth 2, `Scatter` alert points rouges, `Scatter` positive points verts. Légende Alert/Article positif.
- États dynamiques: hover tooltip recharts.
- Section dashboard: SECTION 18 — lignes 4507–4617.

---

### Feature 19: Volume de Mentions 7j (Section 19)

**Axe 1 — Promesse & Origine Commerciale**
- URL source: implicite — chevauche Feature 4 (Mentions/Jour)
- Pitch commercial verbatim: (aucun spécifique)
- Niveau de service: 7 jours

**Axe 2 — Route & Ingestion Données**
- Source données brute: Prisma via `/api/console/sentiment-trend`
- Route API: `GET /api/console/sentiment-trend?range=${7d|30d|90d}` (utilise la valeur courante de `sentimentRange`)
- ⚠️ **403 Forbidden pour `essential`** (comme Feature 7).

**Axe 3 — Traitement & Logique Métier**
- Transformation: `data = trend.data.slice(-7).map(d => ({ date, count, fill: dominant === "pos" ? POSITIVE : dominant === "neg" ? NEGATIVE : NEUTRAL_GRAY }))`. `weeklyTotal = sum(count)`.
- Détail: calcul math. Le "+18% vs sem. précédente" en bas est **codé en dur** (l. 4737).

**Axe 4 — Rendu UI & Expérience**
- Composant UI: `VolumeMentionsCard` (lignes 4623–4745) — CardShell col-span-7, `BarChart` 200 px 7 bars colorés par sentiment dominant, barSize 32, radius 4. Tooltip custom avec breakdown P/N/Neg. Badge `${fmtNumber(weeklyTotal)} MENTIONS / SEM.`. 3 légendes + label "+18% vs sem. précédente" **codé en dur**.
- États dynamiques: hover tooltip recharts.
- Section dashboard: SECTION 19 — lignes 4623–4745.

---

### Feature 20: Boîte à Outils Dircom (Section 20)

**Axe 1 — Promesse & Origine Commerciale**
- URL source: PricingPage keyFeature "Alertes et rapports" + "Tableaux de bord prédéfinis"
- Pitch commercial verbatim: "Alertes et rapports"
- Niveau de service: 4 actions + upsell Pro

**Axe 2 — Route & Ingestion Données**
- Source données brute: `GET /api/console/export-csv` (réel backend) pour action CSV
- Route API: `GET /api/console/export-csv?type=articles&days=90` — streaming CSV via Web Streams API, cursor-based pagination, max 500 000 lignes, maxDuration 300 s.

**Axe 3 — Traitement & Logique Métier**
- Transformation: streaming CSV côté serveur (BATCH_SIZE 500). Côté client: download blob + ancrage `<a download>` + clic programmatique.
- Détail: export réel.

**Axe 4 — Rendu UI & Expérience**
- Composant UI: `BoiteOutilsCard` (lignes 4751–4939) — CardShell col-span-12, 4 cartes action (Exporter CSV, Demander à HarchIQ, Voir le Harch 100, Passer à Pro). Chaque carte: icône + titre + description + hover "Ouvrir/Découvrir". Upsell banner en bas (bord SAGE, bg SAGE_BG): "Pro débloque : Benchmarking, Rapports personnalisés, 200 questions IA/jour" + bouton "Découvrir Pro".
- États dynamiques: hover shadow, toast success/error sur CSV export, upsell toast info.
- Section dashboard: SECTION 20 — lignes 4751–4939, `id="rapports"`.

---

### Feature 21: Welcome Onboarding Banner (ENV-ESSENTIAL)

**Axe 1 — Promesse & Origine Commerciale**
- URL source: implicite — pas promis commercialement
- Pitch commercial verbatim: (aucun)
- Niveau de service: 3 étapes d'onboarding

**Axe 2 — Route & Ingestion Données**
- Source données brute: aucune — composant statique
- Route API: **AUCUNE**
- Si mock/simulé: **OUI — bannière statique, persistée localStorage `essential:onboarding-dismissed`**.

**Axe 3 — Traitement & Logique Métier**
- Transformation: aucune. 3 steps codés en dur (Configurer sources → Définir mots-clés → Lancer audit).

**Axe 4 — Rendu UI & Expérience**
- Composant UI: `WelcomeOnboardingBanner` (lignes 4948–5077) — bannière full-width avec strip sage à gauche (Rocket + "Bienvenue" + "Bonjour, {firstName}" + paragraphe + bouton Masquer), 3 cartes étapes à droite (Newspaper/Hash/Sparkles + numéro + label + description + arrow).
- États dynamiques: bouton Masquer persistant, scroll vers sections au clic.
- Section dashboard: ENV-ESSENTIAL — lignes 4948–5077.

---

### Feature 22: Quota Usage Widget (header)

**Axe 1 — Promesse & Origine Commerciale**
- URL source: PricingPage "50 questions/jour" + `faq-data.ts` FAQ 20 "10 sources"
- Pitch commercial verbatim: "HarchIQ AI (50 questions/jour)"
- Niveau de service: 50 questions/jour, **20 sources** (UI), **100 alertes WhatsApp/mois** (UI) — ⚠️ FAQ dit 10 sources, UI dit 20 → **CONTRADICTION**.

**Axe 2 — Route & Ingestion Données**
- Source données brute: **DONNÉES SIMULÉES CÔTÉ CLIENT** — `INITIAL_QUOTA = { used: 0, total: 50, whatsappUsed: 0, whatsappTotal: 100 }`. Persistant localStorage `essential:quota`. `sourcesCount = Math.min(20, sources?.sources?.length ?? 0)` — basé sur source-distribution (réel) mais plafonné à 20.
- Route API: aucune route dédiée quota. Incrémentation `used` côté client après chaque `POST /api/console/ask` réussi. Reset quotidien côté client (vérif date ISO).
- Si mock/simulé: **PARTIEL — quota côté client, pas de contrôle serveur**. Un utilisateur peut contourner en vidant localStorage.

**Axe 3 — Traitement & Logique Métier**
- Transformation: `iqPct = (used/total)*100`, `srcPct = (sourcesCount/20)*100`, `waPct = (whatsappUsed/whatsappTotal)*100`. `colorFor(pct) = pct > 90 ? NEGATIVE : pct >= 70 ? AMBER : SAGE`.

**Axe 4 — Rendu UI & Expérience**
- Composant UI: `QuotaUsageWidget` (lignes 5080–5183) — bouton header KeyRound + "Quotas" + `${used}/${total}`, dropdown 280 px avec 3 `QuotaRow` (HarchIQ AI 50, Sources surveillées X/20, Alertes WhatsApp X/100), bar `Progress` colorée, resetLabel ("Réinitialise à minuit", "Fixe", "Réinitialise le 1er du mois"). Footer "Besoin de plus ? Passez à Pro…".
- États dynamiques: dropdown expand/collapse avec motion, click-outside overlay, couleur conditionnelle.
- Section dashboard: header — lignes 5080–5183.

---

### Feature 23: Milestone Badge (header)

**Axe 1 — Promesse & Origine Commerciale**
- URL source: **AUCUNE** — pas promis commercialement. Gamification non annoncée.
- Pitch commercial verbatim: (aucun)
- Niveau de service: 4 jalons (firstArticle, firstQuestion, firstReport, firstWeek)

**Axe 2 — Route & Ingestion Données**
- Source données brute: **DONNÉES SIMULÉES CÔTÉ CLIENT** — `INITIAL_MILESTONES = { firstArticle: false, firstQuestion: false, firstReport: false, firstWeek: false, firstVisitDate: todayISO(), lastUnlockedAt: null }`. Persistant `essential:milestones`.
- Route API: **AUCUNE**.
- Si mock/simulé: **OUI — gamification 100 % côté client.**

**Axe 3 — Traitement & Logique Métier**
- Transformation: `firstArticle` set si `health.mentionCount24h > 0`. `firstQuestion` set via callback `onFirstQuestion`. `firstReport` set via `handleReportDownload`. `firstWeek` set si `firstVisitDate >= 7 jours`. `milestoneProgress = filter(k => milestones[k]).length`.

**Axe 4 — Rendu UI & Expérience**
- Composant UI: `MilestoneBadge` (lignes 5229–5281) — bouton header avec icône Flag (rond SAGE_BG si complet, bord SAGE si complet sinon BORDER_STRONG), label "Jalons", valeur `${progress}/${total}`. Tooltip. Classe `sage-pulse` si `recentlyUnlocked`.
- États dynamiques: pulse animation 1.6 s × 2 sur unlock récent, tooltip, scroll vers `#jalons` au clic.
- Section dashboard: header — lignes 5229–5281.

---

### Feature 24: Quick Start Card (ENV-ESSENTIAL)

**Axe 1 — Promesse & Origine Commerciale**
- URL source: **AUCUNE** — pas promis commercialement
- Pitch commercial verbatim: (aucun)

**Axe 2 — Route & Ingestion Données**
- Source données brute: **statique côté client**. Persistant `essential:quickstart-dismissed` + `essential:visits`.
- Route API: **AUCUNE**.

**Axe 3 — Traitement & Logique Métier**
- Transformation: `showQuickStart = !quickStartDismissed && visits <= 3`.

**Axe 4 — Rendu UI & Expérience**
- Composant UI: `QuickStartCard` (lignes 5284–5382) — CardShell col-span-12 (bg SAGE_BG, bord SAGE), Zap icône + "Démarrage rapide" + "4 actions · moins de 5 minutes", 4 cartes (Voir score, Lancer HarchIQ, Configurer WhatsApp, Télécharger rapport). Lien "Refaire le tour".
- États dynamiques: dismiss persistant, hover shadow, scroll vers sections, re-déclenche le Guided Tour.
- Section dashboard: ENV-ESSENTIEL — lignes 5284–5382. Visible uniquement si `visits <= 3`.

---

### Feature 25: Empty State (réutilisable)

**Axe 1 — Promesse & Origine Commerciale**
- URL source: (composant utilitaire)
- Pitch commercial verbatim: (aucun)

**Axe 2 — Route & Ingestion Données**
- Source données brute: aucune (composant réutilisable)
- Route API: aucune

**Axe 3 — Traitement & Logique Métier**
- Transformation: aucune

**Axe 4 — Rendu UI & Expérience**
- Composant UI: `EmptyState` (lignes 5385–5462) — illustration CSS (cercle SAGE_BG dashed SAGE_DIM + icône Lucide 22 px), titre 13 px bold, description 12 px TEXT_BODY, bouton CTA SAGE, suggestion chips arrondies.
- États dynamiques: CTA callback, chips callback (toast info).
- Section dashboard: utilisé dans DernieresMentionsCard.

---

### Feature 26: Milestone Tracker Card (Section 21)

**Axe 1 — Promesse & Origine Commerciale**
- URL source: **AUCUNE** — pas promis commercialement. Section gamification dédiée.
- Pitch commercial verbatim: (aucun)

**Axe 2 — Route & Ingestion Données**
- Source données brute: localStorage `essential:milestones` (cf. Feature 23)
- Route API: **AUCUNE**

**Axe 3 — Traitement & Logique Métier**
- Transformation: `completed = items.filter(i => milestones[i.key]).length`, `pct = (completed/items.length)*100`, `allDone = completed === items.length`. Si `allDone`, message "Onboarding terminé" avec upsell Pro.

**Axe 4 — Rendu UI & Expérience**
- Composant UI: `MilestoneTrackerCard` (lignes 5465–5599) — CardShell col-span-12, header "21 · Suivi des Jalons" + Badge `${completed}/4 COMPLET`, Progress bar 2 px, 4 cartes (Premier article, Première question, Premier rapport, Première semaine) avec CheckCircle2 si done / Circle si en attente, icône, label, description, "Débloqué/En attente". Trophy + message si allDone.
- États dynamiques: `sage-pulse` sur jalon récemment débloqué, couleur conditionnelle.
- Section dashboard: SECTION 21 — lignes 5465–5599, `id="jalons"`.

---

### Feature 27: Daily Briefing Card (R2-ESSENTIEL-A)

**Axe 1 — Promesse & Origine Commerciale**
- URL source: **AUCUNE** — pas promis dans PricingPage. `faq-data.ts` FAQ 2 mentionne "WhatsApp digest" (quotidien 7h) mais pas de briefing audio.
- Pitch commercial verbatim: (aucun)
- Niveau de service: briefing quotidien avec TTS

**Axe 2 — Route & Ingestion Données**
- Source données brute: `/api/console/brand-health` (mentionCount24h, sentiment.positive, crisisLevel) + `/api/console/source-distribution` (top source)
- Route API: 2 routes réelles combinées (cf. Features 2 et 8)
- Si mock/simulé: **PARTIEL — données réelles, mais briefing fabriqué côté client par template string**.

**Axe 3 — Traitement & Logique Métier**
- Transformation: `briefingText = "Bonjour {firstName}. Aujourd'hui : {N} articles, sentiment {X}%, {topSource} dominant, {crisisLabel}."`. TTS via `window.speechSynthesis` (Web Speech API). "Recevoir sur WhatsApp" = `toast.success("Briefing envoyé sur WhatsApp")` — **pas d'envoi réel**.

**Axe 4 — Rendu UI & Expérience**
- Composant UI: `DailyBriefingCard` (lignes 6095–6270) — CardShell col-span-12 (bord SAGE), Sun icône + "Briefing du jour" + date + "Vu le DD MMM" / "Nouveau briefing", quote block SAGE_BG italic, 2 boutons (Écouter Volume2 SAGE, Recevoir sur WhatsApp Send outline), timestamp "Généré à HH:mm".
- États dynamiques: TTS lecture/annulation, toast WhatsApp (mock), persistance `essential:briefing-date`.
- Section dashboard: R2-ESSENTIEL-A — lignes 6095–6270.

---

### Feature 28: Notification Bell (R2-ESSENTIEL-A)

**Axe 1 — Promesse & Origine Commerciale**
- URL source: PricingPage keyFeature "Alertes et rapports"
- Pitch commercial verbatim: "Alertes et rapports"
- Niveau de service: notifications crise/rapport/quota

**Axe 2 — Route & Ingestion Données**
- Source données brute: **DONNÉES SIMULÉES CÔTÉ CLIENT** — `makeSeedNotifications()` (lignes 5641-5672) crée 3 notifications au premier visit (crise 35 min, rapport 3h, quota 6h). Persistant `essential:notifications`.
- Route API: **AUCUNE** — pas de route `/api/console/notifications` appelée.
- Si mock/simulé: **OUI — notifications seedées côté client.**

**Axe 3 — Traitement & Logique Métier**
- Transformation: `unread = notifications.filter(!read).length`. Click → mark read + scroll vers `target` section.

**Axe 4 — Rendu UI & Expérience**
- Composant UI: `NotificationBell` (lignes 6273–6470) — bouton header Bell 18 px + badge `${unread}` (rouge si > 0), dropdown 340 px max-h 360 px scrollable. Items: icône (AlertTriangle/FileText/KeyRound selon type) + dot coloré (NEGATIVE/SAGE/AMBER) + titre bold si unread + body + timestamp relatif. Bouton "Tout marquer comme lu". Empty state si 0.
- États dynamiques: click-outside overlay, expand/collapse motion, mark all read, single click → read + scroll.
- Section dashboard: header — lignes 6273–6470.

---

### Feature 29: Guided Tour (R2-ESSENTIEL-A)

**Axe 1 — Promesse & Origine Commerciale**
- URL source: **AUCUNE** — pas promis. FAQ 23 promet "1 session de 2h en visio" mais pas de tour guidé in-app.
- Pitch commercial verbatim: (aucun)

**Axe 2 — Route & Ingestion Données**
- Source données brute: **statique côté client**. Persistant `essential:tour-completed`.
- Route API: **AUCUNE**

**Axe 3 — Traitement & Logique Métier**
- Transformation: `TOUR_STEPS = 5` (score, ai-workspace, sources, alertes, rapports). Au premier visit (après hydration), si `!tourCompleted`, `setTourActive(true)`. Spotlight via `box-shadow: 0 0 0 9999px rgba(10,10,10,0.65)` + bord SAGE 2 px. Mesure `getBoundingClientRect` après scroll smooth.

**Axe 4 — Rendu UI & Expérience**
- Composant UI: `GuidedTour` (lignes 6473–6652) — overlay fixed spotlight + tooltip card 320 px (bg #FFFFFF bord SAGE), 5 dots progression (le step courant = 20 px SAGE, les précédents = SAGE_DIM, les à-venir = BORDER_STRONG), titre 14 px + description 12 px, bouton "Suivant" SAGE / "Terminer" si last, bouton "Passer le tour".
- États dynamiques: scroll target into view, measure rect après 400 ms, scroll/resize listeners, animation motion.
- Section dashboard: portal-level — lignes 6473–6652.

---

### Feature 30: Command Palette (R2-ESSENTIEL-B, Cmd+K)

**Axe 1 — Promesse & Origine Commerciale**
- URL source: **AUCUNE** — pas promis commercialement
- Pitch commercial verbatim: (aucun)

**Axe 2 — Route & Ingestion Données**
- Source données brute: **côté client**. Persistant `essential:cmd-recent`.
- Route API: aucune directement (mais actions déclenchent `fetch /api/console/export-csv`).

**Axe 3 — Traitement & Logique Métier**
- Transformation: 7 actions (goto-score, ask-harchiq, view-alertes, download-report, redo-tour, toggle-theme, refresh-data). Filtre fuzzy: `match = label.includes(q) || hint.includes(q)`. Recents = derniers 5 IDs dédupés. Navigation clavier ArrowUp/Down + Enter + Escape.

**Axe 4 — Rendu UI & Expérience**
- Composant UI: `CommandPalette` (lignes 6670–6920) — overlay fixed z-150 bg rgba(10,10,10,0.45) backdrop-blur 8 px, dialog max-w 560 px. Input Search 16 px + kbd "ESC". Liste scrollable max-h 400 px avec sections "Récents" + "Toutes les actions". CmdRow: icône carré SAGE si selected, label 13 px, hint 10 px, CornerDownLeft si selected. Footer: "Entrée pour exécuter" + ↑↓ "Naviguer" + "Harch Atelier".
- États dynamiques: filtre fuzzy, keyboard navigation, recents persistants, focus input après 60 ms.
- Section dashboard: portal-level — lignes 6670–6920. Trigger: Cmd+K / Ctrl+K global shortcut + bouton header Command.

---

### Feature 31: Progressive List (R2-ESSENTIEL-B, réutilisable)

**Axe 1 — Promesse & Origine Commerciale**
- URL source: (composant utilitaire)
- Pitch commercial verbatim: (aucun)

**Axe 2 — Route & Ingestion Données**
- Source données brute: props `items: T[]`
- Route API: aucune

**Axe 3 — Traitement & Logique Métier**
- Transformation: `initial = items.slice(0, limit)`, `rest = items.slice(limit)`, `hasToggle = items.length > threshold`. Expand/collapse via AnimatePresence + motion.div height auto.

**Axe 4 — Rendu UI & Expérience**
- Composant UI: `ProgressiveList<T>` (lignes 6991–7093) — header `${title}` + `${items.length} éléments`, liste initiale, AnimatePresence pour le reste (animation height 0 → auto), bouton "Voir plus · N autres" / "Voir moins" avec chevron rotated.
- États dynamiques: expand/collapse animé, état persistant `essential:disclosure[sectionKey]`.
- Section dashboard: utilisé dans Features 7, 8, 12.

---

### Feature 32: Brand Mention Feed (R3-ESSENTIEL-A)

**Axe 1 — Promesse & Origine Commerciale**
- URL source: PricingPage capabilité "Social listening" + "Veille médiatique"
- Pitch commercial verbatim: "Social listening"
- Niveau de service: temps réel (8-12 s par nouvelle mention)

**Axe 2 — Route & Ingestion Données**
- Source données brute: **DONNÉES SIMULÉES CÔTÉ CLIENT** — `MENTION_SOURCE_POOL` (9 presse + 5 social + 4 forum + 4 web = 22 sources codées en dur) + `MENTION_HEADLINE_POOL` (21 headlines mixtes). `makeMentionFeedItem()` randomise source + headline + sentiment (poids 60 % pos / 25 % neu / 15 % neg).
- Route API: **AUCUNE** — pas de route `/api/console/mentions-feed` ou similaire.
- Si mock/simulé: **OUI — feed 100 % simulé, récursif setTimeout 8-12 s**.

**Axe 3 — Traitement & Logique Métier**
- Transformation: seed 6 mentions au mount (timestamps échelonnés sur ~30 min). `scheduleNext` récursif: `delay = MIN_INTERVAL + random * (MAX_INTERVAL - MIN_INTERVAL)`, push new mention, cap array at 100. `visible = mentions.slice(0, 20 + extraShown)`. `filtered = visible.filter(sentiment && externalQuery match)`.
- Détail: simulation pure. Aucune donnée réelle.

**Axe 4 — Rendu UI & Expérience**
- Composant UI: `BrandMentionFeedCard` (lignes 7126–7468) — CardShell col-span-7, header "Flux de mentions en temps réel" + select filtre (Tous/Positif/Neutre/Négatif) + bouton Pause/Reprendre. Chip "Filtre actif: « query »" si externalQuery. Liste scrollable max-h 380 px avec AnimatePresence motion.div (layout, initial bg SAGE_BG → transparent). Chaque mention: icône source (Newspaper/Twitter/MessageCircle/Globe2), source name, badge sentiment coloré, timestamp relatif, headline 80 chars truncate. Footer `${filtered} / ${total} mentions` + bouton "Voir plus (+5)" si buffer.
- États dynamiques: filtre sentiment, pause/resume, externalQuery from Saved Searches, Voir plus batch 5, animation entrée/sortie, skeleton 1.5 s au mount.
- Section dashboard: R3-ESSENTIEL-A — lignes 7126–7468, `id="flux-mentions"`.

---

### Feature 33: WhatsApp Alert Preview (R3-ESSENTIEL-A)

**Axe 1 — Promesse & Origine Commerciale**
- URL source: PricingPage keyFeature "Alertes et rapports" + `faq-data.ts` FAQ 20 "WhatsApp digest"
- Pitch commercial verbatim: "Alertes et rapports" + "WhatsApp digest"
- Niveau de service: 100 alertes WhatsApp/mois (UI QuotaWidget)

**Axe 2 — Route & Ingestion Données**
- Source données brute: **DONNÉES SIMULÉES CÔTÉ CLIENT** — `WHATSAPP_SAMPLE_ALERTS = 3` bulles (crise, quotidien, rapport mensuel) codées en dur. Config (crisis/daily/weekly toggles + phone) persistante `essential:whatsapp-config`.
- Route API: **AUCUNE** — la route `/api/user/whatsapp` existe ailleurs mais n'est pas appelée par le dashboard. "Tester" = `setTimeout 1200 ms + toast.success("Message test envoyé")` — **pas d'envoi réel**.
- Si mock/simulé: **OUI — aperçu phone mockup + config persistante, mais aucun envoi WhatsApp réel**.

**Axe 3 — Traitement & Logique Métier**
- Transformation: `activeCount = [config.crisis, config.daily, config.weekly].filter(Boolean).length`. `sanitizePhone` keep digits/+/-/space/parentheses. `isValidPhone` = 8-15 digits. `handleTest` = setTimeout + toast.

**Axe 4 — Rendu UI & Expérience**
- Composant UI: `WhatsAppAlertPreviewCard` (lignes 7473–7849) — CardShell col-span-5, header "Aperçu alertes WhatsApp" + Badge `${activeCount}/3 ACTIVES`. Phone mockup 260×460 px (bezel SAGE, notch CHARCOAL, écran #ECE5DD): header WhatsApp SAGE + "Harch Alerts" + "en ligne" + Phone icon, body 3 bulles vertes #DCF8C6 avec icône strip (AlertTriangle/CalendarDays/FileText) + timestamp + CheckCheck bleu. 3 chips alert type (Crise/Quotidien/Hebdo). Bouton "Configurer mes alertes" → Dialog modal: 3 AlertTypeRow (toggle Switch) + Input phone + Enregistrer + Tester.
- États dynamiques: phone draft sync, toggle switches, validation phone (toast error/warning/success), test button (spinner 1.2 s + toast), dialog open/close.
- Section dashboard: R3-ESSENTIEL-A — lignes 7473–7849, `id="alertes-whatsapp"`.

---

### Feature 34: Saved Searches Starter (R3-ESSENTIEL-A)

**Axe 1 — Promesse & Origine Commerciale**
- URL source: PricingPage capabilité "Veille médiatique" (sous-entendu recherches)
- Pitch commercial verbatim: (sous-entendu)
- Niveau de service: max 5 recherches sauvegardées (Essentiel)

**Axe 2 — Route & Ingestion Données**
- Source données brute: **côté client**. Persistant `essential:saved-searches`. 3 presets: "Mon entreprise/mon secteur/mes concurrents" (queries `marque/secteur/concurrent`).
- Route API: **AUCUNE** — pas de persistance serveur. Les recherches filtrent le Brand Mention Feed simulé (Feature 32).
- Si mock/simulé: **OUI — recherches 100 % côté client, filtre un feed simulé**.

**Axe 3 — Traitement & Logique Métier**
- Transformation: `atLimit = savedSearches.length >= 5`. `handleSave` validate name + query + atLimit. `handleRunSaved` = `setMentionQuery(s.query)` + scroll vers `#flux-mentions`. `handleDelete`.

**Axe 4 — Rendu UI & Expérience**
- Composant UI: `SavedSearchesStarterCard` (lignes 7940–8343) — CardShell col-span-12, header "Recherches sauvegardées" + Badge `${savedSearches.length}/5`. 3 preset chips SAGE (Mon entreprise/Mon secteur/Mes concurrents). Form create: Input nom (max 40) + Input requête (max 60) + bouton "Enregistrer". Liste saved: Bookmark icon + nom + « query » + "Lancée il y a X" + boutons Lancer (Play) + Supprimer (Trash2). Upsell Pro: "opérateurs booléens (ET / OU / SAUF), recherches illimitées, alertes par mot-clé".
- États dynamiques: chip active si query correspond, validation erreur, limite 5 atteinte (toast + lightbulb message), persistance.
- Section dashboard: R3-ESSENTIEL-A — lignes 7940–8343, `id="recherches-sauvegardees"`.

---

### Feature 35: Weekly Digest Email Preview (R4-ESSENTIEL-A, Feature 1)

**Axe 1 — Promesse & Origine Commerciale**
- URL source: PricingPage keyFeature "Alertes et rapports" + `faq-data.ts` FAQ 10 "PDF : 8 pages Essentiel" (hebdo implicite)
- Pitch commercial verbatim: "Alertes et rapports"
- Niveau de service: email hebdo (lundi 8h / vendredi 18h / désactivé)

**Axe 2 — Route & Ingestion Données**
- Source données brute: `/api/console/brand-health` (score, mentionCount24h, sentiment.positive) + `/api/console/source-distribution` (topSource) + `/api/console/insights` (weekly insight). Email body fabriqué côté client.
- Route API: 3 routes réelles combinées pour les KPIs. **Aucune route d'envoi d'email** — "Envoyer un test" = `setTimeout 1200 ms + toast.success("Email test envoyé à {email}")` — **pas d'envoi réel**.
- Si mock/simulé: **PARTIEL — KPIs réels, email et envoi simulés**.

**Axe 3 — Traitement & Logique Métier**
- Transformation: `scoreKpi = round(health.score)`, `mentionsKpi = round(health.mentionCount24h * 7)`, `sentimentKpi = round(health.sentiment.positive)`, `topSourceKpi = sources.sources[0]?.name`. `topArticles = WEEKLY_ARTICLES_POOL.slice(0, 3)` (5 articles codés en dur). `weekNum = weekNumber(new Date())`. `weeklyInsight = insights?.insights?.[0]?.body ?? fallback générique`.

**Axe 4 — Rendu UI & Expérience**
- Composant UI: `WeeklyDigestEmailPreviewCard` (lignes 8364–9008) — CardShell col-span-12, header "Aperçu Email — Résumé hebdomadaire" + Tabs (Aperçu desktop / Mobile 375 px). Email mockup: header bar SAGE "HARCH ATELIER" + "Semaine N", meta De/À/Objet, body: greeting + intro + 2x2 KPI grid (Score, Mentions 7j, Sentiment, Source principale) + "Top 3 articles" liste numérotée + bloc "Insight HarchIQ de la semaine" sage border-left + CTA button "Voir le tableau de bord" + signature. Schedule dropdown (Lundi 8h / Vendredi 18h / Désactiver) persistant `essential:digest-schedule`. Bouton "Envoyer un test".
- États dynamiques: tabs desktop/mobile (largeur 375 px vs 100 %), schedule dropdown avec 3 options + icônes, send test (spinner 1.2 s + toast), AiCommentary dynamique selon schedule.
- Section dashboard: R4-ESSENTIEL-A — lignes 8364–9008, `id="apercu-digest-hebdo"`.

---

### Feature 36: Source Credibility Scoring (R4-ESSENTIEL-A, Feature 2)

**Axe 1 — Promesse & Origine Commerciale**
- URL source: **AUCUNE** — pas promis dans PricingPage ni FAQ pour Essentiel. Feature purement orpheline commercialement.
- Pitch commercial verbatim: (aucun)

**Axe 2 — Route & Ingestion Données**
- Source données brute: `/api/console/source-distribution` (sources réelles) + **scoring crédibilité SIMULÉ côté client** via `simulateSourceCredibility(name, type, articlesCount)`.
- Route API: `GET /api/console/source-distribution` (réel) pour la liste sources.
- Si mock/simulé: **PARTIEL — liste sources réelle, scores crédibilité 100 % simulés** par hash déterministe `hashStr(name)`.

**Axe 3 — Traitement & Logique Métier**
- Transformation: 4 facteurs (authority, editorial, factcheck, transparency) — score 30-100 déterminé par hash 32 bits du nom. `credibilityScore = mean(factors)`. `tier = verified (80-100) / reliable (60-79) / check (40-59) / unreliable (<40)`. Sync effect: drop persisted API sources plus présents, refresh count, seed nouveaux, preserve customs.

**Axe 4 — Rendu UI & Expérience**
- Composant UI: `SourceCredibilityScoringCard` (lignes 9022–9685) — CardShell col-span-12, header "Crédibilité des Sources" + 2 Badges (`{N} SOURCES`, `MOY. {avg}/100`). 4 cartes tier (Vérifié/Fiable/À vérifier/Non fiable avec icônes CheckCircle2/AlertCircle/XCircle). 5 chips filtre (Tous + 4 tiers). Liste sources: bouton expand (icône type + nom + count + bar crédibilité 80 px + badge tier + chevron). Expandable: "Pourquoi ce score?" + 4 cartes facteur (icône + label + score + bar + description). Section "Évaluer une nouvelle source" (Input domaine + bouton Évaluer → simule score).
- États dynamiques: filtre par tier, expand/collapse par source, évaluation domaine (spinner 1.2 s + toast + auto-expand), suppression custom, AiCommentary dynamique.
- Section dashboard: R4-ESSENTIEL-A — lignes 9022–9685, `id="credibilite-sources"`.

---

### Feature 37: Sentiment Timeline (R4-ESSENTIEL-A, Feature 3)

**Axe 1 — Promesse & Origine Commerciale**
- URL source: **AUCUNE** — pas promis. FAQ 2 mentionne "crawl toutes les 5 min" mais pas de timeline horaire.
- Pitch commercial verbatim: (aucun)

**Axe 2 — Route & Ingestion Données**
- Source données brute: `/api/console/brand-health` (mentionCount24h, sentiment) — puis **simulation hourly/daily côté client** via `simulateSentimentHourBuckets` ou `simulateSentimentDailyBuckets`.
- Route API: `GET /api/console/brand-health` (réel) — mais buckets horaires 100 % simulés.
- Si mock/simulé: **PARTIEL — agrégats réels (24h count + sentiment), distribution horaire/journalière simulée** par pattern `HOURLY_DISTRIBUTION_PATTERN` (24 poids) ou `DAILY_DISTRIBUTION_PATTERN` (7 poids).

**Axe 3 — Traitement & Logique Métier**
- Transformation: 24 buckets horaires — `total = round(mentionCount24h * weight / patternSum)`, variation sentiment ±10 % déterministe par hash, `isAnomaly = negative > (positive + neutral) * 0.5 || total > meanPerHour * 2`. 7 buckets journaliers — base 50 articles/jour, variation ±15 %. `peak` = bucket max total, `trough` = bucket min total.

**Axe 4 — Rendu UI & Expérience**
- Composant UI: `SentimentTimelineCard` (lignes 9698–10094) — CardShell col-span-12, header "Évolution 24h — Sentiment en temps réel" + Tabs (24h / 7j). Annotation strip: badges "Pic à HH:00: N articles · M positif(s)" + "Creux à HH:00: N articles" + "N anomalies détectées". Timeline bars: 24 (ou 7) barres verticales flex-1 maxWidth 28 px, hauteur proportionnelle à total/maxTotal, couleur selon dominantSentiment (POSITIVE/NEUTRAL_GRAY/NEGATIVE), pastille rouge si anomalie (top -4), pulse SAGE si heure courante. Hover tooltip fixed (HH:00 + N articles + Y% positif + anomalie warning). Légende 4 items.
- États dynamiques: tabs 24h/7j, hover par barre (opacity 1 vs 0.4 pour les autres), tooltip position fixed, AiCommentary dynamique.
- Section dashboard: R4-ESSENTIEL-A — lignes 9698–10094, `id="timeline-sentiment"`.

---

### Feature 38: Rappel Dircom (spacer col-span-5)

**Axe 1 — Promesse & Origine Commerciale**
- URL source: implicite — chevauche "Alertes et rapports"
- Pitch commercial verbatim: (aucun spécifique)

**Axe 2 — Route & Ingestion Données**
- Source données brute: `/api/console/brand-health` (score, topNarrative, recommendation)
- Route API: `GET /api/console/brand-health` (réel, déjà appelé par Feature 2)

**Axe 3 — Traitement & Logique Métier**
- Transformation: aucun calcul, affichage brut de `health.score`, `health.topNarrative.label`, `health.recommendation`.

**Axe 4 — Rendu UI & Expérience**
- Composant UI: inline JSX (lignes 10769–10841) — CardShell col-span-5, header "Rappel Dircom" + CalendarDays, 2 blocs (Sparkles "Points clés à retenir" + paragraphe dynamique, AlertTriangle "Action recommandée" + paragraphe dynamique), bouton "Rafraîchir les données" → `refetchHealth()`.
- États dynamiques: refresh button.
- Section dashboard: spacer lignes 10769–10841.

---

## 3. CARTOGRAPHIE DES CONTRADICTIONS & GAPS

### 3.1. Contradictions commerciales ↔ UI ↔ backend

| # | Sujet | PricingPage dit | FAQ dit | Dashboard UI dit | Backend/API dit |
|---|-------|-----------------|---------|-------------------|------------------|
| C1 | Nombre de sources | (non spécifié) | "10 sources" (FAQ 20) | "20 sources surveillées" (Section 8 helpText + QuotaUsageWidget total 20) | `Math.min(20, sources?.sources?.length ?? 0)` côté client (aucune limite serveur) |
| C2 | Utilisateurs max | (non spécifié) | "1 utilisateur" (FAQ 23, formation) | n/a | `UserManagement.tsx:67` `maxUsers: 3` pour `essential` |
| C3 | Moteurs IA suivis | "Suivi de la visibilité IA (GenAI Lens)" | "3 moteurs IA" (FAQ 20) | 3 chips (GPT/PPL/GEM) dans Section 5, 3 cartes dans Section 11 | Route retourne jusqu'à 4+ plateformes (ChatGPT, Perplexity, Gemini, Claude) |
| C4 | Compte Essentiel réellement fonctionnel | (sous-entendu oui) | (sous-entendu oui) | "ESSENTIEL · Actif" dans sidebar | **403 Forbidden sur 3 routes critiques** (sentiment-trend, topics, ai-visibility) car `allowedTypes` exclut `essential` |
| C5 | Range 90j | (sous-entendu par Tabs) | n/a | Tabs `7j/30j/90j` dans Section 7 | Route supporte `7d/30d/365d` — `90d` fallback silencieux à `30d` |
| C6 | Tier naming | Essentiel/Pro/Grandes Entreprises/Agences | Essentiel/Pro/Grandes Entreprises/Agences | "Essentiel · Actif" dans sidebar | `auth.config.ts:28` comment: `essential | pro | enterprise | agency` (4 plans) ; **mais** `prisma.schema.prisma:716` `accountType` legacy: `brand-monitor | market-competitor | investment-bank | harch-alpha` — **incohérence fondamentale** |
| C7 | Hébergement | "L'architecture est conforme à la Loi 09-08… hébergement souverain au Maroc" (FAQ 22) | "datacenter Tier-III Casablanca, ISO 27001" | n/a | AtelierHome.tsx pricing strip: "**Data hosted in EU**" (contradiction front-page vs pricing) |
| C8 | Tier legacy sur AtelierHome | n/a | n/a | n/a | AtelierHome `Pricing()` affiche **Émergence 15K / Corporate 40K / Sovereign 75K MAD/mo** — legacy, pas Essentiel/Pro/Grandes Entreprises/Agences |
| C9 | Rapport PDF | "Alertes et rapports" (keyFeature) | "PDF : 8 pages Essentiel" (FAQ 10) | Bouton "Exporter PDF" dans Section 10 → `toast.success("Export PDF lancé")` (mock) + "PDF" dans Feature 35 → mock | **AUCUNE route PDF appelée** par le dashboard. Routes `/api/console/reports/[id]/pdf` et `/api/pdf/[type]` existent ailleurs mais non appelées. |
| C10 | WhatsApp alerts | (sous-entendu "Alertes et rapports") | "WhatsApp digest" (FAQ 20) | QuotaWidget "100 alertes WhatsApp/mois" + Phone mockup + bouton Tester (mock) | **AUCUNE route WhatsApp appelée** par le dashboard. Route `/api/user/whatsapp` et `/api/cron/whatsapp-alerts` existent mais non appelées. |
| C11 | Engagement | "engagement annuel avec paiement mensuel" (FAQ PricingPage) | "engagement annuel, paiement mensuel, remise 15 %" (FAQ 21) | n/a | Aucun système de billing/abonnement dans le code |
| C12 | Délai mise en place | "48 heures après signature" | "Essentiel : 48h après signature" (FAQ 24) | n/a | Aucun système d'onboarding chronométré |
| C13 | Crawl 5 min | n/a | "toutes les 5 minutes pour le plan Essentiel" (FAQ 2) | n/a | Cron `/api/cron/scrape-rss` existe mais aucun filtre par plan ; pas de crawl 60 sec vs 5 min différencié |
| C14 | Formation 2h | n/a | "1 session de 2h en visio (un utilisateur)" (FAQ 23) | Guided Tour 5 étapes in-app (Feature 29) | Aucune intégration visio/Calendly |
| C15 | "Relations médias" capability | ✓ (capacité Essentiel) | n/a | **AUCUNE UI** pour relations médias (journalistes, presse contacts, share of voice média) | Aucune route `/api/console/media-relations` ou similaire |
| C16 | "Social listening" capability | ✓ (capacité Essentiel) | "Capturez les conversations sur X, LinkedIn, Facebook, Instagram" (SOLUTIONS pricing) | Brand Mention Feed **100 % simulé** (Feature 32) + Activité Réseau Social **100 % simulé** (Feature 16) | Aucune route d'ingestion sociale (X, LinkedIn, FB, IG) appelée par le dashboard |

### 3.2. Routes API — Statut pour un utilisateur Essentiel réel (accountType="essential")

| Route | Statut réel | Composant(s) impacté(s) |
|-------|-------------|--------------------------|
| `/api/console/brand-health` | ✅ 200 OK (session + companyId) | Features 2, 3, 4, 6, 9, 13, 18, 22, 27, 35, 37, 38 |
| `/api/console/crisis-alerts` | ✅ 200 OK | Features 6, 9, 13 |
| `/api/console/insights` | ⚠️ 200 mais fallback persona `brand-monitor` (pas de persona essential) | Features 10, 35 |
| `/api/console/ai-visibility` | ❌ **403 Forbidden** si `accountType="essential"` et `role !== "admin"` | Features 5, 11 |
| `/api/console/sentiment-trend` | ❌ **403 Forbidden** si `accountType="essential"` et `role !== "admin"` | Features 3, 4, 7, 19 |
| `/api/console/topics` | ❌ **403 Forbidden** si `accountType="essential"` et `role !== "admin"` | Feature 12 |
| `/api/console/source-distribution` | ✅ 200 OK | Features 8, 22, 27, 35, 36 |
| `/api/harch100/latest` | ✅ 200 OK (public) | Feature 15 |
| `/api/console/ask` | ✅ 200 OK | Feature 1 |
| `/api/console/export-csv` | ✅ 200 OK | Features 20, 24 (QuickStart), 30 (Command Palette) |

**Bilan**: 3 routes sur 10 sont inaccessibles → les Features 5, 7, 11, 12, 19 sont entièrement cassées pour un utilisateur Essentiel réel. Les Features 3, 4 utilisent sentiment-trend pour le sparkline (partiellement cassées — la KPI strip affiche des `—` pour les sparklines).

### 3.3. Promesses commerciales sans UI implémentée (GAPS)

| # | Promesse verbatim | Source | UI manquante |
|---|--------------------|--------|--------------|
| G1 | "Relations médias" (capacité Essentiel) | PricingPage:34 | **Aucune UI** relations médias (journalistes, pitches, SoV média) dans EssentialDashboard |
| G2 | "PDF : 8 pages Essentiel" (rapport mensuel board-ready) | FAQ 10 | **Bouton "Exporter PDF" mock toast seulement** — aucune génération PDF réelle, aucune route PDF appelée |
| G3 | "WhatsApp digest" quotidien 7h | FAQ 20 + Solutions pricing | **Phone mockup + bouton Tester mock** — aucune route WhatsApp appelée, aucun scheduling serveur |
| G4 | "Crawl toutes les 5 minutes" | FAQ 2 | **Aucune indication UI** de fréquence de crawl ; cron `/api/cron/scrape-rss` sans différenciation plan |
| G5 | "1 marque" | FAQ 20 | **Aucun sélecteur de marque** dans le dashboard ; `requireUserCompany()` renvoie une seule company |
| G6 | "Tableaux de bord prédéfinis" (keyFeature) | PricingPage:44 | **Aucune bibliothèque de templates** — un seul dashboard fixe |
| G7 | "1 session de 2h en visio (un utilisateur)" | FAQ 23 | **Aucune intégration visio** (Teams/Zoom) ; seul le Guided Tour in-app (5 étapes) est proposé |
| G8 | "48h après signature" (mise en place) | FAQ 24 | **Aucun tracker d'onboarding chronométré** |
| G9 | "Engagement annuel, paiement mensuel, remise 15 %" | FAQ 21 | **Aucun système de billing** dans le dashboard |
| G10 | "Pilote 30 jours Pro et supérieur" (interdiction Essentiel) | FAQ 25 | Aucun blocage pilote — mais aussi aucune offre pilote visible |
| G11 | "Préavis 30 jours" (annulation Essentiel) | FAQ 25 | **Aucune UI d'annulation** dans le dashboard |
| G12 | "Marketing d'influence —" (refusé pour Essentiel) | PricingPage:159 | (correctement absent du dashboard) |

### 3.4. UI features sans promesse commerciale (ORPHELINS)

| # | Feature UI | Section | Source de données | Promesse parent la plus proche |
|---|------------|---------|-------------------|---------------------------------|
| O1 | Carte de Chaleur Géo (6 villes) | Feature 14 | **Simulée client** | "Veille médiatique" (capacité) |
| O2 | Activité Réseau Social (FB/IG/TW/LI 30j) | Feature 16 | **Simulée client** | "Social listening" (capacité) |
| O3 | Météo Sentiments par Langue (FR/Darija/EN) | Feature 17 | **Simulée client** | (aucune) |
| O4 | Évolution du Score 30j | Feature 18 | **Partiellement simulée** | chevauche Feature 2 |
| O5 | Volume de Mentions 7j | Feature 19 | Réelle (mais 403 pour Essentiel) | chevauche Feature 4 |
| O6 | Rappel Dircom (spacer) | Feature 38 | Réelle | (aucune spécifique) |
| O7 | Welcome Onboarding Banner | Feature 21 | localStorage | (aucune) |
| O8 | Quota Usage Widget (header) | Feature 22 | localStorage | "50 questions/jour" (mais 20 sources et 100 WhatsApp inventés) |
| O9 | Milestone Badge (header) | Feature 23 | localStorage | (aucune — gamification) |
| O10 | Quick Start Card | Feature 24 | localStorage | (aucune) |
| O11 | Empty State (réutilisable) | Feature 25 | n/a | (composant utilitaire) |
| O12 | Milestone Tracker Card | Feature 26 | localStorage | (aucune — gamification) |
| O13 | Daily Briefing Card (TTS) | Feature 27 | Réelle + template | (aucune — briefing audio non promis) |
| O14 | Notification Bell | Feature 28 | **Simulée client** (3 seed notifications) | "Alertes et rapports" (mais notifications seeded pas réelles) |
| O15 | Guided Tour (5 étapes) | Feature 29 | localStorage | (aucune — formation 2h visio promis, pas tour in-app) |
| O16 | Command Palette (Cmd+K) | Feature 30 | localStorage | (aucune) |
| O17 | Progressive List (réutilisable) | Feature 31 | n/a | (composant utilitaire) |
| O18 | Brand Mention Feed (temps réel simulé) | Feature 32 | **Simulée client** | "Social listening" (capacité) — mais feed est faux |
| O19 | WhatsApp Alert Preview (phone mockup) | Feature 33 | **Simulée client** | "Alertes et rapports" + "WhatsApp digest" — mais aperçu est faux |
| O20 | Saved Searches Starter (max 5) | Feature 34 | localStorage | "Veille médiatique" (capacité) — mais filtre un feed simulé |
| O21 | Weekly Digest Email Preview | Feature 35 | Réelle + template + mock envoi | "Alertes et rapports" — mais envoi est mock |
| O22 | Source Credibility Scoring (4 facteurs) | Feature 36 | Réelle + **scores simulés** | (aucune — feature orpheline) |
| O23 | Sentiment Timeline (24h/7j buckets) | Feature 37 | Réelle + **distribution simulée** | (aucune — FAQ 2 mentionne 5 min crawl, pas timeline horaire) |

---

## 4. RÉCAPITULATIF — TYPES DE SOURCES DE DONNÉES

### 4.1. Features alimentées par backend RÉEL (Prisma + routes)

| Feature | Routes consommées | Auth OK pour `essential` ? |
|---------|-------------------|----------------------------|
| F1 HarchIQ AI Workspace | `/api/console/ask` | ✅ |
| F2 Score de Réputation | `/api/console/brand-health` | ✅ |
| F6 Alertes Actives | `/api/console/crisis-alerts` | ✅ |
| F9 Dernières Mentions | `/api/console/crisis-alerts` | ✅ |
| F10 Résumé Hebdo IA | `/api/console/insights` | ⚠️ fallback persona |
| F13 Indicateur de Crise | brand-health + crisis-alerts | ✅ |
| F15 Position Harch 100 | `/api/harch100/latest` | ✅ public |
| F20 Boîte à Outils (CSV) | `/api/console/export-csv` | ✅ |
| F22 Quota Widget (sourcesCount) | `/api/console/source-distribution` | ✅ |
| F27 Daily Briefing | brand-health + source-distribution | ✅ |
| F35 Weekly Digest Preview | brand-health + source-distribution + insights | ⚠️ insights fallback |
| F38 Rappel Dircom | `/api/console/brand-health` | ✅ |

### 4.2. Features MOCKED (aucune donnée réelle, simulation client-side pure)

| Feature | Mécanisme de mock |
|---------|--------------------|
| F14 Carte Chaleur Géo | 6 villes codées en dur |
| F16 Activité Réseau Social | 30 jours `Math.sin/cos/random` |
| F17 Météo Sentiments par Langue | 3 langues codées en dur |
| F28 Notification Bell | 3 seed notifications au premier visit |
| F32 Brand Mention Feed | Pool 22 sources × 21 headlines, récursif setTimeout 8-12 s |
| F33 WhatsApp Alert Preview | 3 bulles codées en dur + bouton Tester = toast |
| F34 Saved Searches Starter | localStorage, filtre le feed simulé |

### 4.3. Features PARTIELLEMENT mockées (réel + simulation)

| Feature | Réel | Simulé |
|---------|-------|--------|
| F3 Sentiment Moyen | brand-health positive % | sparkline depuis sentiment-trend (403 pour essential → spark vide) |
| F4 Mentions / Jour | brand-health mentionCount24h | sparkline + delta factice (`health.trend > 0 ? 12 : -4`) |
| F5 Citations IA | (serait réel via ai-visibility) | **403 pour essential** → chips muted fallback |
| F7 Tendance Sentiment | (serait réel via sentiment-trend) | **403 pour essential** → carte vide ; + 90j fallback à 30j |
| F8 Diversité Sources | source-distribution (réel) | "20 sources" contradiction FAQ |
| F11 Snapshot Visibilité IA | (serait réel via ai-visibility) | **403 pour essential** → ABSENT partout |
| F12 Top 5 Sujets | (serait réel via topics) | **403 pour essential** → vide ; + sentiment split synthétique `pos = round(total*0.45)` |
| F15 Position Harch 100 | rankings actuels (réel) | historique 6 mois `Math.random()` |
| F18 Évolution Score 30j | score courant (réel) | historique 30j `Math.sin/cos` + markers codés en dur + référence Attijariwafa fabriquée |
| F19 Volume Mentions 7j | (serait réel via sentiment-trend) | **403 pour essential** → vide ; + "+18%" codé en dur |
| F21 Welcome Banner | n/a | statique + localStorage |
| F23 Milestone Badge | n/a | gamification localStorage |
| F24 Quick Start | n/a | statique + localStorage |
| F26 Milestone Tracker | n/a | gamification localStorage |
| F29 Guided Tour | n/a | 5 steps + localStorage |
| F30 Command Palette | n/a | 7 actions + localStorage |
| F35 Weekly Digest | KPIs réels | topArticles pool codé en dur + envoi mock |
| F36 Source Credibility | sources réelles | scores 4 facteurs simulés par hash déterministe |
| F37 Sentiment Timeline | mentionCount24h + sentiment | 24 buckets horaires simulés par pattern |

### 4.4. Features 100 % utilitaires (aucune donnée)

| Feature | Rôle |
|---------|------|
| F25 Empty State | composant réutilisable |
| F31 Progressive List | composant réutilisable |

---

## 5. CONTEXTE INTER-PAGES — Promesses publiques vs Dashboard

### 5.1. AtelierHome.tsx — pricing section (lignes 3592–3713)

**CONTRADICTION MAJEURE (C8)**: La landing page affiche encore les anciens tiers **Émergence (15K MAD/mo) / Corporate (40K MAD/mo) / Sovereign (75K MAD/mo)**, avec des features différentes :

- **Émergence** (correspondrait à Essentiel ?) : "Daily WhatsApp digest (7:00)", "20 media sources", "1 competitor tracked", "Sentiment breakdown", "Monthly PDF report", "Email support"
- **Corporate** : "Full web dashboard", "50 media sources", "3 competitors tracked", "Real-time crisis alerts (WhatsApp)", "AI visibility (ChatGPT, Perplexity, Gemini)", "HarchIQ sentiment + topic analysis", "Monthly PDF + executive summary", "Priority WhatsApp support"
- **Sovereign** : "200 media sources", "5 competitors tracked", "Dedicated reputation analyst", "API access (REST + webhook)", "Custom AI engine tracking", "Quarterly strategic review", "SLA 99.9% + 24/7 support", "On-site training"

**Contradictions**:
- AtelierHome Émergence = "20 media sources" vs FAQ 20 Essentiel = "10 sources" vs Dashboard QuotaWidget = "20 sources"
- AtelierHome Émergence = "1 competitor tracked" — **aucune UI concurrent dans EssentialDashboard**
- AtelierHome Émergence = "Monthly PDF report" — **mock toast seulement** dans le dashboard
- AtelierHome Émergence = "Daily WhatsApp digest (7:00)" — **mock toast seulement** dans le dashboard
- AtelierHome pricing strip = "Data hosted in EU" vs PricingPage FAQ = "datacenter Tier-III Casablanca"

### 5.2. AboutPage.tsx — mentions

- Ligne 349: "Veille de la visibilité IA (ChatGPT, Perplexity, Gemini…)" — mentionné mais pas de promesse spécifique Essentiel.
- Ligne 58: "Mise en production du pipeline HarchIQ. Alertes WhatsApp, dashboards, rapports PDF board-ready. 7 753 articles analysés cumulés." — promesse générale (pas Essentiel-spécifique).

### 5.3. MethodPage.tsx — méthode

- Ligne 68: "Visibilité IA — Ce que 9 moteurs IA (ChatGPT, Perplexity, Gemini…) répondent… Tendances et écarts vs concurrents." — promesse 9 moteurs, mais l'UI Essentiel en affiche 3 (chips GPT/PPL/GEM) et la route en supporte 4+.

### 5.4. ChangelogPage.tsx — entries Essentiel

- **v3.1.0** (Aug 11, 2026): mentions HarchIQ history persistence pour "Agency, Pro, Enterprise" — **Essentiel absent** de la liste.
- **v3.0.0** (Jul 21, 2026): "Renommage des tiers : Starter / Pro / Enterprise → Émergence / Corporate / Sovereign". **CONTRADICTION**: le PricingPage actuel utilise Essentiel/Pro/Grandes Entreprises/Agences — donc un nouveau rename post-v3.0.0 non tracé dans le changelog.
- Aucune entrée changelog pour: la création de EssentialDashboard, les 4 rounds ENV-ESSENTIAL / R2 / R3 / R4, le rename Émergence→Essentiel.

### 5.5. faq-data.ts — autres mentions Essentiel

- FAQ 2: "crawlé toutes les 60 secondes pour Corporate/Sovereign, **toutes les 5 minutes pour Essentiel**"
- FAQ 9 (rétro-audit): "Le rétro-audit 48h est livré dès le premier jour pour vous donner une valeur immédiate." — **Aucune UI rétro-audit dans EssentialDashboard**.
- FAQ 28 (upsell): "70 % de nos clients Essentiel passent en Pro dans les 6 mois" — message repris dans la milestone tracker card (Feature 26) si `allDone`.

---

## 6. BILAN FINAL

### 6.1. Comptage

- **Features auditées**: 38 (Features 1 à 38, incluant le spacer "Rappel Dircom")
- **Composants utilitaires**: 2 (Empty State, Progressive List)
- **Total entités distinctes**: 40

### 6.2. Statut réel pour un utilisateur Essentiel (`accountType="essential"`, `role !== "admin"`, pas demo)

| Catégorie | Count | Features |
|-----------|-------|----------|
| ✅ **Fonctionne réellement** (backend réel, données live) | **9** | F1, F2, F6, F9, F13, F15, F20, F27, F38 |
| ⚠️ **Partiellement cassé** (fallback persona, mock toast au lieu d'action réelle, ou données partielles) | **8** | F3, F4, F8, F10, F22, F35, F36, F37 |
| ❌ **Entièrement cassé** (403 Forbidden sur la route backend) | **5** | F5, F7, F11, F12, F19 |
| 🎭 **100 % simulé** (aucune route backend) | **9** | F14, F16, F17, F21, F28, F32, F33, F34 + F18 partiellement |
| 🎮 **Gamification/utility** (localStorage only, pas de promesse commerciale) | **7** | F23, F24, F25, F26, F29, F30, F31 |

### 6.3. Liste MOCKED (pas de route backend réelle)

1. F14 Carte Chaleur Géo — 6 villes codées en dur
2. F16 Activité Réseau Social — 30j `Math.sin/cos/random`
3. F17 Météo Sentiments par Langue — 3 langues codées en dur
4. F18 Évolution Score 30j — historique fabriqué (score courant réel)
5. F21 Welcome Onboarding Banner — statique localStorage
6. F23 Milestone Badge — gamification localStorage
7. F24 Quick Start Card — statique localStorage
8. F26 Milestone Tracker Card — gamification localStorage
9. F28 Notification Bell — 3 seed notifications codées en dur
10. F29 Guided Tour — 5 steps statiques
11. F30 Command Palette — 7 actions statiques (sauf export CSV qui est réel)
12. F32 Brand Mention Feed — pool 22 sources × 21 headlines, récursif setTimeout
13. F33 WhatsApp Alert Preview — 3 bulles codées en dur + bouton Tester = toast
14. F34 Saved Searches Starter — localStorage, filtre feed simulé
15. F35 Weekly Digest Email Preview — KPIs réels + topArticles pool codé en dur + envoi mock
16. F36 Source Credibility Scoring — sources réelles + scores 4 facteurs simulés par hash

### 6.4. Liste REAL (backend route existe et répond 200 pour `essential`)

1. F1 HarchIQ AI Workspace — `POST /api/console/ask` (LLM réel)
2. F2 Score de Réputation — `GET /api/console/brand-health` (Prisma réel)
3. F6 Alertes Actives — `GET /api/console/crisis-alerts` (Prisma réel)
4. F9 Dernières Mentions — `GET /api/console/crisis-alerts` (réutilise F6)
5. F13 Indicateur de Crise — brand-health + crisis-alerts (réel)
6. F15 Position Harch 100 — `GET /api/harch100/latest` (public réel)
7. F20 Boîte à Outils Dircom — `GET /api/console/export-csv` (streaming CSV réel)
8. F27 Daily Briefing Card — brand-health + source-distribution (réel pour les données, mock pour envoi WhatsApp)
9. F38 Rappel Dircom — `/api/console/brand-health` (réel)

### 6.5. Promesses commerciales sans UI (GAPS)

1. **G1 "Relations médias"** — capability PricingPage, **zéro UI** dans le dashboard
2. **G2 "PDF 8 pages Essentiel"** — FAQ 10, **bouton mock toast seulement**
3. **G3 "WhatsApp digest"** — FAQ 20, **bouton Tester mock toast seulement**
4. **G4 "Crawl 5 min"** — FAQ 2, **aucune indication UI**
5. **G5 "1 marque"** — FAQ 20, **aucun sélecteur de marque**
6. **G6 "Tableaux de bord prédéfinis"** — keyFeature, **un seul dashboard fixe**
7. **G7 "Formation 2h visio 1 utilisateur"** — FAQ 23, **aucune intégration visio**
8. **G8 "48h après signature"** — FAQ 24, **aucun tracker onboarding chronométré**
9. **G9 "Engagement annuel + remise 15 %"** — FAQ 21, **aucun billing UI**
10. **G11 "Préavis 30 jours annulation"** — FAQ 25, **aucune UI annulation**

### 6.6. UI features sans promesse commerciale (ORPHELINS)

1. **O1 Carte Chaleur Géo** (6 villes) — feature orpheline
2. **O2 Activité Réseau Social** (FB/IG/TW/LI 30j) — feature orpheline (Social listening est trop générique)
3. **O3 Météo Sentiments par Langue** — feature orpheline
4. **O4 Évolution Score 30j** — chevauche F2 sans valeur ajoutée
5. **O5 Volume Mentions 7j** — chevauche F4 sans valeur ajoutée
6. **O7 Welcome Banner, O9 Milestone Badge, O10 Quick Start, O12 Milestone Tracker** — gamification non annoncée
7. **O13 Daily Briefing TTS** — briefing audio non promis
8. **O15 Guided Tour** — formation 2h visio promis, pas tour in-app
9. **O16 Command Palette** — feature non annoncée
10. **O18 Brand Mention Feed** — feed simulé non promis
11. **O20 Saved Searches** — non promis
12. **O21 Weekly Digest Email Preview** — envoi mock non promis
13. **O22 Source Credibility Scoring** — feature orpheline
14. **O23 Sentiment Timeline** — feature orpheline

---

## 7. RECOMMANDATIONS PRIORITAIRES

| # | Priorité | Action |
|---|----------|--------|
| R1 | **CRITIQUE** | Ajouter `"essential"` (et `"pro"`, `"enterprise"`, `"agency"`) aux `allowedTypes` des routes `/api/console/sentiment-trend`, `/api/console/topics`, `/api/console/ai-visibility`. Sans cela, 5 sections du dashboard sont vides pour les vrais utilisateurs Essentiel. |
| R2 | **CRITIQUE** | Réconcilier `auth.config.ts:28` (comment `essential|pro|enterprise|agency`) avec `prisma.schema.prisma:716` (`brand-monitor|market-competitor|investment-bank|harch-alpha`). Soit migrer le schéma, soit créer un mapping `essential → brand-monitor` côté serveur. |
| R3 | **HAUTE** | Trancher la contradiction sources : FAQ 20 dit "10 sources", Dashboard dit "20 sources". Mettre à jour l'un ou l'autre. |
| R4 | **HAUTE** | Réconcilier AtelierHome.tsx pricing section (Émergence/Corporate/Sovereign) avec PricingPage.tsx (Essentiel/Pro/Grandes Entreprises/Agences). Soit migrer AtelierHome, soit tracer le rename dans le changelog. |
| R5 | **HAUTE** | Réconcilier "Data hosted in EU" (AtelierHome) vs "datacenter Tier-III Casablanca" (FAQ 22). |
| R6 | **HAUTE** | Implémenter un vrai export PDF (route `/api/console/reports/[id]/pdf` existe mais non appelée) ou retirer les boutons "Exporter PDF" mockés. |
| R7 | **HAUTE** | Implémenter un vrai envoi WhatsApp (route `/api/user/whatsapp` existe mais non appelée) ou retirer le bouton "Tester" mocké. |
| R8 | **HAUTE** | Ajouter le support `range=90d` côté route sentiment-trend (ou retirer le tab "90j" du dashboard). |
| R9 | **MOYENNE** | Brancher Brand Mention Feed (F32) sur une vraie route temps réel (WebSocket ou SSE) ou documenter explicitement "Démonstration — données simulées". |
| R10 | **MOYENNE** | Brancher Notification Bell (F28) sur `/api/console/notifications` (route existante) ou retirer les 3 seed notifications factices. |
| R11 | **MOYENNE** | Implémenter "Relations médias" (capability G1) — journaliste DB, pitches, SoV média — ou retirer la capability de la carte Essentiel. |
| R12 | **MOYENNE** | Ajouter un changelog entry pour le rename Émergence→Essentiel et la création de EssentialDashboard (4 rounds). |
| R13 | **BASSE** | Documenter explicitement les features de gamification (milestones, quick start, guided tour, command palette) comme bonus non couverts par le contrat Essentiel. |
| R14 | **BASSE** | Retirer la référence "Attijariwafa" codée en dur dans F18 Évolution Score. |

---

**Fin du rapport.**
