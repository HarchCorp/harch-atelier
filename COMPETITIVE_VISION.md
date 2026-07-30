# HARCH ATELIER — Competitive Vision
# Conception des consoles Trader + Investor dans un système concurrent à 3 types isolés

> **Task ID:** COMPETITIVE-VISION
> **Rôle:** Stratège produit
> **Date:** 2026-07-29
> **Références:** `prisma/schema.prisma` (14 modèles), `COMPETITOR_BENCHMARK.md` (5 concurrents VLM-analysés), `worklog.md` (CONSOLE-V3), `src/lib/harchiq/collect/financial-collector.ts` (BAM/AMMC + Bourse de Casablanca scaffolded), `AtelierHome.tsx` §Pricing (5K/15K/50K MAD/mois).
> **Vision fondateur (Amine):** 3 types de comptes **isolés** (enterprise / trader / investor) — aucun cross-access — mais la donnée circule dans un même pipeline HarchIQ. "Ma vision n'est pas finie, ya pas de point à la fin."

---

## Section 1 — Vision consolidée : 3 types isolés + système concurrent

### 1.1 Le triptyque

Harch Atelier n'est pas 1 produit, c'est **3 produits** partageant le même backbone data (HarchIQ Core : collect → understand → predict → synthesize → connect → defend). Chaque type d'utilisateur voit une **lentille différente** sur la même réalité informationnelle marocaine/africaine.

| Type | Ce qu'il monitor | Lentille | Pricing | Concurrent direct |
|---|---|---|---|---|
| **enterprise** | Sa propre réputation | Self-centric | 5K–50K MAD/mois | Meltwater, Brandwatch, Profound, Otterly |
| **trader** | Des **actifs** (actions BdC, crypto, matières, fx) | Alpha-centric | 290–2 900 MAD/mois | TradingView, Investing.com, Finviz |
| **investor** | Des **dossiers** (DD, ESG, géopolitique, portfolio) | Capital-centric | 50K–250K+ MAD/mois | Bloomberg Terminal, AlphaSense, S&P CapIQ |

### 1.2 Principe d'isolation

Le schéma Prisma porte déjà le champ `User.accountType` (`trader | enterprise | investor`) et les pages console appliquent un **gate strict** (`src/app/atelier/console/{trader,investor,enterprise}/page.tsx` lignes 21-23) :

```ts
if (session.user?.accountType !== "trader") {
  redirect(`/atelier/console/${session.user?.accountType || "enterprise"}`);
}
```

**Conséquence business :** un trader ne peut **jamais** voir le workspace enterprise de la société qu'il trade, et vice-versa. L'investisseur ne voit ni le trader ni l'enterprise. Mais tous les trois consomment la même table `Article` (Hespress, TelQuel, Médias24, Le360, BAM, AMMC) et les mêmes scores `SentimentScore` / `AIVisibility` / `RiskAssessment` — chaque type paie pour une **projection** différente de la même donnée.

### 1.3 Le système concurrent — vision

> "Un trader monitor l'action OCP → un enterprise monitor la réputation OCP → un investor monitor les deux + ESG."

Trois lentilles sur le même actif OCP :

```
                 ┌────────────────────────────────────────┐
                 │   HarchIQ Core (pipeline data unique)  │
                 │  Company: OCP — Articles, Sentiment,   │
                 │  AIVisibility, RiskAssessment, Entity  │
                 └────────────┬───────────────┬───────────┘
                              │               │
              ┌───────────────┘               └────────────────┐
              ▼                                                 ▼
   ┌────────────────────┐                          ┌─────────────────────┐
   │  Trader console    │                          │  Enterprise console │
   │  lentille "alpha"  │                          │  lentille "réputation"│
   │  — prix OCP        │                          │  — sentiment OCP     │
   │  — sentiment→price │                          │  — risk matrix       │
   │  — AI visibility    │                          │  — crisis alerts     │
   │  sur "best stock   │                          │  — competitors       │
   │  Morocco" query    │                          │    (3 concurrents)   │
   └─────────┬──────────┘                          └──────────┬───────────┘
             │                                                 │
             └──────────────────┬──────────────────────────────┘
                                ▼
                   ┌────────────────────────┐
                   │  Investor console      │
                   │  lentille "capital"    │
                   │  — OCP dans portfolio  │
                   │    Fund II (12% weight)│
                   │  — ESG score OCP       │
                   │  — Geopolitical Maroc  │
                   │  — Board-ready PDF     │
                   │    50 pages            │
                   └────────────────────────┘
```

**Les 3 types ne se croisent jamais directement** — pas de chat, pas de marketplace, pas de social feed partagé. Mais la donnée OCP est **calculée une fois**, facturée trois fois sous trois angles.

### 1.4 Pourquoi cette architecture est défendable

1. **Coût marginal quasiment nul** — ajouter un trader ou un investor ne rajoute pas de collecte (les 30+ médias marocains + 4 moteurs IA sont déjà scrapés pour enterprise). Chaque nouveau type = revenu additionnel sur la même base de coût.
2. **Moat data renforcé** — chaque type génère du signal data qui raffine le Core : les watchlists des traders identifient les actifs à suivre, les portfolios des investors identifient les dossiers prioritaires, les dashboards enterprise valident les scores. Boucle d'apprentissage.
3. **Distribution multi-segment** — trader = PLG self-service viral (Twitter/X, Telegram, WhatsApp groups), enterprise = sales-led mid-market, investor = enterprise sales high-touch. Trois canaux, une stack.
4. **Pricing power maximal** — 3 segments, 3 élasticités-prix, 3 ARPU : 290 MAD (trader) × 1000 users = 290K MAD/mois ; 15K MAD (enterprise) × 50 comptes = 750K MAD/mois ; 100K MAD (investor) × 10 comptes = 1M MAD/mois. Trois moteurs de revenu, un seul pipeline.

---

## Section 2 — Console TRADER

### 2.1 Utilisateur cible

**Persona primaire : "Youssef, 27 ans, Casablanca"**
- Trader retail sur Bourse de Casablanca via BCP Capital / BMCE Sec / CFG Trader
- Suit 8-15 lignes (OCP, ATW, IAM, BoA, RAM, Lesieur, Auto Hall, Disway…)
- A un compte crypto international (Binance) pour BTC/ETH
- Vit sur WhatsApp (groupes de trading), Twitter X (comptes FR/AR), Telegram
- Budget outils : 200-500 MAD/mois max (TradingView ≈ 200 MAD, Investing.com = gratuit)
- Pain : "Je vois le prix bouger mais je ne sais jamais POURQUOI. Hespress sort un article négatif à 14h, le prix bouge à 14h32, j'aurais dû vendre à 14h05."

**Persona secondaire : "Salma, 31 ans, Rabat"**
- Analyste freelance pour family offices marocains (rapports ad-hoc)
- A besoin de signaux rapides sur 5-10 actifs sectoriels
- Budget : 1000-3000 MAD/mois, facturable aux clients

**Non-cible explicite :** day-traders algorithmiques institutionnels (trop peu au Maroc, besoin de temps réel < 100ms que Harch ne servira pas).

### 2.2 Ce qu'il monitor — des ACTIFS, pas des entreprises

| Classe | Périmètre Maroc/Afrique | Source data |
|---|---|---|
| **Actions Bourse de Casablanca** | ~75 lignes liquides du MASI / MASIX | Bourse de Casablanca API (cf. `financial-collector.ts` `StockPriceData`, ticker "ATW/OCP/IAM" déjà scaffolded) — delayed 15min acceptable |
| **Crypto** | BTC, ETH, USDT (via Binance public API, gratuit) | Binance REST + WebSocket |
| **Matières premières** | Phosphate (OCP monopoly), Or (XAU), Pétrole (Brent) | Investing.com CSS scrap ou MetalsAPI |
| **Devises** | MAD/EUR, MAD/USD (BAM fixing quotidien 11h00) | BAM RSS (déjà scrapé dans `sources-config.ts`) |

**Insight stratégique :** un trader ne monitor pas la "réputation" d'OCP — il monitor si le **sentiment** autour d'OCP va précéder un mouvement de prix. L'unité atomique n'est pas l'entreprise, c'est **l'actif**. C'est ce qui différencie radicalement la console trader de la console enterprise.

### 2.3 Features must-have (5)

1. **Sentiment-to-Price Correlation** — pour chaque actif en watchlist, un graphique superposant (a) le sentiment HarchIQ 30/90 jours, (b) le prix de l'actif, (c) le volume d'articles. Affichage du coefficient de corrélation (Pearson) et du lag optimal (ex: "le sentiment précède le prix de 2-3 jours sur OCP, r=0.71"). **C'est le feature différenciateur absolu** — TradingView ne l'a pas, Investing.com ne l'a pas.

2. **AI Alpha Signals** — requêtes quotidiennes sur ChatGPT, Perplexity, Gemini, GLM-4 avec des prompts type "best stock Morocco 2026", "should I buy OCP", "Morocco banking stock comparison". Tracking de (a) si l'actif est cité, (b) à quelle position, (c) avec quel sentiment. Concrètement : un trader voit que Perplexity cite OCP en #1 sur "phosphate stocks" → signal d'achat long-terme. Réutilise le modèle `AIVisibility` existant mais sur des **asset-queries** au lieu de company-queries.

3. **Pre-Market Brief 7h WhatsApp** — chaque matin à 7h00, message WhatsApp avec : (a) top 3 movers sentiment (+/-), (b) 1 signal régulateur BAM/AMMC du jour, (c) 1 actif avec divergence sentiment↔prix anormale, (d)ouverture MASI prévue. Réutilise le WhatsApp Daily Digest déjà construit pour enterprise mais avec un template trader.

4. **Double-Trigger Alerts** — alertes qui se déclenchent seulement si 2 conditions sont vraies simultanément : (a) sentiment -10pts en 24h **ET** (b) prix -3% en 24h. Évite le bruit. Livraison WhatsApp + email + push web. Configuration UI : "Si [actif] [condition sentiment] AND [condition prix] THEN [canal]". 5 règles gratuites, illimité en Pro+.

5. **Regulatory Radar BAM/AMMC** — feed temps réel des communications Bank Al-Maghrib + AMMC (déjà scrapé dans `collectRegulatoryFilings`). Pour un trader : une décision BAM sur les taux directeurs à 11h → impact immédiat sur ATW, BoA, CIH. Taggué par actif impacté. C'est le "Bloomberg terminal lite" à 290 MAD/mois au lieu de $24K/an.

### 2.4 Pricing adapté (PLG)

| Tier | Prix MAD/mois | Prix USD éq. | Cible | Features clés |
|---|---|---|---|---|
| **Free** | 0 | $0 | Acquisition | 1 actif en watchlist, sentiment 7 jours, 0 alertes, 1 query AI/month |
| **Starter** | **290** | ~$29 | Trader retail | 5 actifs, sentiment 30 jours, 3 alertes, AI visibility 5 queries/mois, WhatsApp daily brief |
| **Pro** | **990** | ~$99 | Actif régulier | 20 actifs, sentiment 90 jours, alertes illimitées, AI visibility illimitée, correlation matrix, pre-market WhatsApp |
| **Day Trader Pro** | **2 900** | ~$290 | Semi-pro / analyste freelance | 75 actifs (MASI entier), API read access (60 req/min), real-time BAM alerts, exports CSV, 5 portfolios de comparaison |

**Ancrage psychologique :** 290 MAD = prix d'un TradingView Essential (~200 MAD) + 90 MAD de premium sentiment. **Inférieur à 1 trade manqué.** Pas de friction d'achat.

**Trial :** 14 jours en Pro gratuit, no credit card. Conversion attendue : 5-8% trial → Starter, 1-2% trial → Pro. Objectif an 1 : 500 traders payants → 350K MAD/mois de revenu trader.

### 2.5 Les 5 sections spécifiques de la console trader

```
┌──────────────────────────────────────────────────────────────────┐
│  Trader Console — Layout                                          │
├──────────┬───────────────────────────────────────────────────────┤
│ Sidebar  │  Top bar : Watchlist selector + search actif + MAD/EUR│
│          ├───────────────────────────────────────────────────────┤
│ 1 Watchlist│                                                     │
│ 2 Sentiment│            Main area (change selon section)         │
│   →Price  │                                                     │
│ 3 AI Alpha│                                                     │
│ 4 Alerts  │                                                     │
│ 5 Pre-Mkt │                                                     │
│           │                                                     │
│ ─ Plan    │                                                     │
│ Starter   │                                                     │
└──────────┴───────────────────────────────────────────────────────┘
```

1. **Watchlist** — liste des actifs suivis, triable par : variation prix, variation sentiment, divergence sentiment↔prix, prochain événement régulateur. Click sur actif → fiche complète (chart prix + sentiment + AI visibility + news flow + BAM/AMMC filings liés).
2. **Sentiment → Price** — vue analytique : sélectionner 1-3 actifs, superposer courbes sentiment & prix sur 7/30/90 jours, afficher coefficient corrélation + lag optimal + divergence actuelle. Heatmap des corrélations cross-asset.
3. **AI Alpha Signals** — tableau des prompts trackés ("best stock Morocco", "OCP buy or sell", "MASI outlook 2026"), avec pour chaque prompt : position de chaque actif de la watchlist dans la réponse IA (1er/2nd/non cité), sentiment associé, variation 7 jours.
4. **Alerts** — CRUD des règles double-trigger, historique des alertes déclenchées (30 jours), stats hit-rate (sur 12 alertes déclenchées, 8 ont précédé un mouvement >3% = 67% precision). À noter : afficher le disclaimer "Past performance ≠ future results".
5. **Pre-Market Brief** — page générée chaque matin 7h00 (cached) : top 3 movers sentiment, signal BAM/AMMC du jour, top divergence, ouverture MASI prévue, weather global du marché ("Today: partly cloudy, +1.2% expected"). Téléchargeable en PDF 1 page.

### 2.6 Données nécessaires — modèles Prisma manquants

| Modèle | Rôle | Champs clés |
|---|---|---|
| **Asset** | Actif financier suivi | `ticker`, `type` (stock/crypto/commodity/fx), `exchange`, `currency`, `companyId?` (lien optionnel vers Company existante — ex: OCP le ticker → OCP la company) |
| **AssetPrice** | Prix OHLCV horodaté | `assetId`, `open`, `high`, `low`, `close`, `volume`, `asOf` |
| **AssetSentiment** | Sentiment agrégé par actif (période) | `assetId`, `score`, `positivePct`, `neutralPct`, `negativePct`, `articleCount`, `calculatedAt` — déduit en matchant les aliases de la Company liée sur les Articles existants |
| **AssetAIQuery** | Prompts IA trackés pour un actif | `assetId`, `prompt`, `platform`, `cited`, `position`, `sentiment`, `checkedAt` |
| **Watchlist** | Liste d'actifs par user | `userId`, `name`, `isDefault` |
| **WatchlistEntry** | Actif dans une watchlist | `watchlistId`, `assetId`, `addedAt`, `notes?` |
| **AlertRule** | Règle d'alerte double-trigger | `userId`, `assetId`, `conditionSentiment`, `conditionPrice`, `channel` (whatsapp/email/push), `isActive`, `lastTriggeredAt?` |
| **AlertEvent** | Historique déclenchement | `alertRuleId`, `triggeredAt`, `payload` (snapshot), `deliveredTo` |

**Réutilisation maximale :** `Article`, `SentimentScore`, `RiskAssessment`, `AIVisibility`, `EntityMention` existent déjà et servent la console enterprise — il suffit de les **projeter** sur `Asset` via le lien `asset.companyId`. Pas de re-scraping, juste une nouvelle agrégation.

---

## Section 3 — Console INVESTOR

### 3.1 Utilisateur cible

**Persona primaire : "Karim, 42 ans, Casablanca Finance City"**
- Senior analyst chez Attijari Capital / BMCE Capital / CFG Bank (M&A, equity research)
- Gère 5-10 dossiers de due diligence en parallèle
- Aujourd'hui : 1 terminal Bloomberg ($24K/an) + 1 abonnement AlphaSense ($1 200/an) + Meltwater pour la comms team + Sustainalytics pour l'ESG = ~4 outils fragmentés
- Pain : "Quand je DD une société marocaine, Bloomberg a les financials mais pas la couverture Hespress/TelQuel. AlphaSense a les transcripts mais pas le sentiment arabe. Sustainalytics a l'ESG mais pas la géopolitique. Je passe 40% de mon temps à recoller les morceaux."

**Persona secondaire : "Aïcha, 38 ans, Dakar"**
- Investment Director chez AfricInvest / IFC / Proparco (private equity Afrique francophone)
- Gère 3 portfolios : Fund VI (15 companies), ESG Africa Fund (8 companies), Co-invest Club (5 companies)
- Pain : pas de plateforme qui couvre Afrique francophone + arabe + ESG + géopolitique. Doit jongler entre 5 outils.

**Tertiaire : "Mehdi, 50 ans, family office"** — Family office marocain (1 portfolio de 10-20 lignes, besoin discrétion, account manager dédié).

**Non-cible :** hedge funds quantitatifs US/Europe (ils n'ont pas besoin de la couverture arabe/francophone).

### 3.2 Ce qu'il monitor — des dossiers + portfolios + risques macro

| Périmètre | Description | Source data |
|---|---|---|
| **Due Diligence Dossiers** | Deep-dive sur 1 entreprise cible (50-100 pages PDF) | HarchIQ pipeline complet (collect + NLP + predict + synthesize) — `dossier-generator.ts` déjà implémenté (compileExecutiveSummary, compileSWOT, compileKeyRelationships, assessConfidenceLevel, identifyInformationGaps) |
| **ESG & Controversy** | Score E/S/G + controverses sociales/environnementales | NLP sur Articles filtrés + données publiques (rapports durabilité, AMMC filings) — modèle `ESGScore` à créer |
| **Geopolitical Risk** | Risque pays Maroc/Afrique/MENA (gouvernement, regulation, événements) | Sources géopolitiques + BAM + AMMC + Jeune Afrique + Africa News |
| **Portfolio monitoring** | Veille continue sur 20-100 portfolio companies | Modèle `Portfolio` + `PortfolioHolding` à créer, roll-up daily |
| **Sector reports** | Vue sectorielle trimestrielle (banque, telecom, énergie, mining) | Réutilise Harch 100 (25 → 100 companies) + agrégation sectorielle |

### 3.3 Features must-have (5)

1. **Due Diligence Dossier Generator** — input : 1 Company (ex: OCP, ATW, IAM). Output : PDF 50-100 pages board-ready avec sections : Executive Summary, SWOT, Key Relationships (entités liées : dirigeants, actionnaires, filiales), Risk Assessment (Bayesian), Information Gaps, AI Visibility, 12-month reputation trajectory, ESG screening, Geopolitical exposure. Génération async (BullMQ, ~5-10 min). Réutilise littéralement `generateIntelligenceDossier()` du `dossier-generator.ts` existant + `src/pdf/factory.ts` + templates déjà build (SustainabilityReport, InfrastructureWhitepaper). Coût marginal par dossier : ~$0.50 de compute LLM.

2. **Multi-Portfolio Roll-up** — l'investisseur crée N portfolios (Fund VI, ESG Fund, Co-invest), chacun contenant K companies. Dashboard roll-up : score réputation moyen du portfolio, top 3 risks, top 3 momentum, ESG aggregate, controversy alerts. Drill-down par portfolio → par company. Métriques : "Fund VI reputation = 78/100 (+2 pts ce mois), 3 alerts, 1 ESG controversy (société X)". Indispensable pour un fund manager qui gère plusieurs vehicles.

3. **ESG & Controversy Screening** — pour chaque company, un score E (Environmental : pollution, émissions, controverses locales), S (Social : conditions sociales, litiges, community impact), G (Governance : transparence, board diversity, related-party transactions). Chaque score décomposé en sub-indicators avec sources. Alertes WhatsApp immédiates en cas de nouvelle controverse ESG (ex: "OCP accusé de pollution à Khouribga — source TelQuel, 14h32"). Alignement avec sfdr Article 8/9 (régulation EU que les funds européens imposent).

4. **Geopolitical Risk Map** — carte interactive Maroc/Afrique/MENA. Pour chaque pays : risk score (gouvernement, regulation, currency, security), timeline des événements récents, exposure par portfolio (Fund VI a 23% au Maroc, 12% Sénégal, 8% Égypte). Alertes sur événements géopolitiques (élection, coupure de change, nouveau regulation). Données: scraping Jeune Afrique + Africa News + Reuters Africa + integration Future Today Institute/ACLED (optionnel).

5. **API + Webhooks (multi-portfolio)** — REST API pour intégrer les scores HarchIQ dans les outils internes du fund (DealCloud, Affinity, Excel/Google Sheets via add-on). Webhooks pour push events (nouvelle controverse, score drop >5pts, nouveau filing AMMC). Rate limit 1 000 req/min en Bank tier. Documentation OpenAPI + SDK TypeScript/Python. Réutilise le modèle `ApiKey` existant (déjà dans le schema, lignes 319-332).

### 3.4 Pricing adapté (premium, sales-led)

| Tier | Prix MAD/mois | Prix USD éq. | Cible | Features clés |
|---|---|---|---|---|
| **Fund** | **50 000** | ~$5 000 | Family office / small fund | 1 portfolio, 20 companies, 5 dossiers/mois, ESG, geopolitical basic, email support, monthly review |
| **Multi-Fund** | **100 000** | ~$10 000 | Mid PE / IFC / Proparco / AfricInvest | 5 portfolios, 100 companies, 20 dossiers/mois, full ESG + geopolitical, API access (100 req/min), Slack integration, dedicated analyst (4h/week), quarterly strategic review |
| **Bank/Institution** | **250 000+** | ~$25 000+ | Attijari Capital / BMCE Capital / CFG / CFC institutionnel | Unlimited portfolios, unlimited dossiers, white-label option, on-site training (Casablanca/Rabat), dedicated analyst full-time, SLA 99.9%, custom AI engine tracking, board presentation |
| **Sector Report (one-shot)** | **100 000-500 000 / rapport** | ~$10K-50K | Ad-hoc quarterly sector deep-dive | 50-100 pages, 20+ companies, sector = banque/telecom/énergie/mining. Réutilise Harch 100 + dossier generator. Acheteurs : CIO, head of research. |

**Ancrage psychologique :** 250K MAD/mois = ~$25K/mois. Bloomberg Terminal = $24K/an **par siège**. Pour un fund qui a 5 analystes × Bloomberg = $120K/an. HarchIQ Bank tier = 1 siège Bloomberg par an, mais couvre arabe/francophone + ESG + géopolitique en plus. **7-10× moins cher que la stack équivalente.**

**Sales motion :** pas de self-serve. Demande de démo → call qualification (15 min) → audit gratuit prospect (1 dossier offert sur la company de leur choix, teaser PDF) → proposal → closing 4-8 semaines. Objectif an 1 : 3 comptes Fund payants (150K MAD/mois), 1 Multi-Fund (100K MAD/mois) = 250K MAD/mois de revenu investor.

### 3.5 Les 5 sections spécifiques de la console investor

```
┌──────────────────────────────────────────────────────────────────┐
│  Investor Console — Layout                                        │
├──────────┬───────────────────────────────────────────────────────┤
│ Sidebar  │  Top bar : Portfolio selector + global search +       │
│          │  "New dossier" CTA + notifications + API key button   │
│ 1 Portfol├───────────────────────────────────────────────────────┤
│   ios    │                                                       │
│ 2 Dossiers                                                      │
│ 3 ESG &  │            Main area (change selon section)           │
│   Contrv │                                                       │
│ 4 Geopol │                                                       │
│ 5 Reports│                                                       │
│           │                                                       │
│ ─ Plan    │                                                       │
│ Multi-Fund│                                                       │
│ 100K MAD  │                                                       │
└──────────┴───────────────────────────────────────────────────────┘
```

1. **Portfolios** — multi-portfolios avec roll-up dashboard : score réputation moyen par portfolio, top risks, ESG aggregate, controversy count, allocation par pays/secteur. Vue "Fund VI" → liste 15 holdings avec score individuel + trend + alertes actives. Vue cross-portfolio : "toutes mes holdings avec ESG < 60" par exemple.
2. **Due Diligence Dossiers** — queue de génération : "New dossier" → modale (choisir company ou secteur, choisir template board-ready / M&A / ESG-only), génération async avec progress bar, puis téléchargement PDF + historique des dossiers générés (24 mois). Réutilise `/api/pdf/[type]` existant.
3. **ESG & Controversy** — vue filtrable par portfolio / par pays / par sector. Heatmap E/S/G scores. Timeline des controverses récentes (30/90 jours) avec gravité (high/medium/low) + source. Filtres : E < 50, controverses environnementales uniquement, etc. Export CSV pour comité ESG.
4. **Geopolitical Risk Map** — carte interactive Afrique/MENA, color-graded par risk score. Click sur pays → fiche (risk score, événements 30 jours, sources, exposion portfolio : "Fund VI : 23% au Maroc"). Alertes configurables : "notif WhatsApp si risk score Maroc +5 pts en 7 jours".
5. **Board-Ready Reports** — bibliothèque de rapports générés : monthly portfolio brief, quarterly sector report, annual reputation review. Templates custom (logo client, footer "prepared by HarchIQ for [Fund]"). Generation planner : "préparer rapport Q4 2026 pour 5 janvier, envoyer à board@fund.com".

### 3.6 Données nécessaires — modèles Prisma manquants

| Modèle | Rôle | Champs clés |
|---|---|---|
| **Portfolio** | Fund / vehicle de l'investisseur | `userId`, `name` ("Fund VI"), `focus` (PE/debt/ESG), `currency`, `vintageYear?` |
| **PortfolioHolding** | Company dans un portfolio | `portfolioId`, `companyId` (FK vers Company existant), `weight` (%), `entryDate`, `exitDate?`, `notes` |
| **Dossier** | Dossier DD généré | `userId`, `companyId` ou `sector`, `template` (board/ma/esg), `status` (pending/generating/ready/failed), `pdfUrl`, `generatedAt`, `sections` (JSON), `pagesCount` |
| **ESGScore** | Score E/S/G par company | `companyId`, `environmentScore`, `socialScore`, `governanceScore`, `controversyCount`, `calculatedAt`, `subindicators` (JSON) |
| **Controversy** | Événement controverse (E/S/G) | `companyId`, `type` (E/S/G), `severity`, `title`, `description`, `sourceUrl`, `detectedAt`, `status` (active/resolved) |
| **GeopoliticalEvent** | Événement risque pays | `country` (ISO), `eventType` (election/regulation/currency/security), `severity`, `title`, `summary`, `sourceUrl`, `eventDate`, `detectedAt` |
| **CountryRiskScore** | Risk score par pays | `country`, `overallScore`, `governmentScore`, `regulatoryScore`, `currencyScore`, `securityScore`, `calculatedAt` |
| **WebhookEndpoint** | URL webhook configurée par user | `userId`, `url`, `events` (array), `secret`, `isActive`, `lastDeliveryAt?` |

**Réutilisation maximale :** `Company`, `Article`, `RiskAssessment`, `ReputationScore`, `AIVisibility`, `EntityMention`, `ApiKey`, `GLMAnalysis`, `Job`, `AuditLog` existent. Le dossier generator existe. Le PDF factory existe. Les scrapers existent. **L'effort est sur l'agrégation et l'UI, pas sur la collecte.**

---

## Section 4 — Système concurrent : interactions, benchmarks, différenciateurs

### 4.1 Interactions entre les 3 types (sans croisement direct)

**Règle d'or :** aucun utilisateur ne voit le workspace d'un autre type. Mais **la donnée partagée** (Article, SentimentScore, AIVisibility, RiskAssessment calculés sur le même `Company`) alimente les 3 lentilles. Le pipeline HarchIQ Core est calculé **une fois**, servi à 3 audiences.

**Exemple concret — OCP le mardi 14 janvier 2026 :**

```
10h32 : Hespress publie "OCP annonce un investissement de 12 Mds MAD à Khouribga"
        → Article scrapé, NLP processed, SentimentScore calculé (+8 pts)
        → AIVisibility re-queried sur ChatGPT/Perplexity/Gemini/GLM

11h05 : 3 consoles voient 3 choses différentes :
        ├─ Enterprise console (OCP comms team) :
        │   "Pic positif +8pts, 47 articles, top topic = investissement Khouribga.
        │   Recommandation : amplifier sur LinkedIn, préparer Q&A presse."
        │
        ├─ Trader console (Youssef, retail) :
        │   "Sentiment OCP +8pts en 30min, divergence vs prix (prix stable).
        │   Signal : BUY opportunité, historically prix suit sentiment de 2-3 jours.
        │   Pre-market brief demain 7h inclura ce signal."
        │
        └─ Investor console (Karim, Attijari Capital) :
            "OCP dans Fund VI (12% weight) : reputation score +3 pts.
            ESG : positif (investissement = expansion locale, pas offshoring).
            Géopolitique : stable Maroc. Recommandation : maintain holding.
            Dossier OCP Q4 2026 regénéré automatiquement, PDF 78 pages prêt."

13h30 : Le prix OCP monte +1.8% à la séance afternoon.
        → Trader Youssef reçoit alerte WhatsApp : "Sentiment prediction confirmée.
          OCP +1.8%. Tu aurais gagné +1.8% si tu avais acheté à 11h05."
        → Enterprise : pas d'alerte (c'est positif).
        → Investor : pas d'alerte (long-term view).
```

**Les 3 types ne se croisent jamais directement** (pas de marketplace de signaux trader→investor, pas de chat enterprise→trader), mais **la même donnée OCP** leur sert à 3 décisions différentes : (a) amplifier pour la comms, (b) trader pour le retail, (c) maintain pour le fund.

### 4.2 Produits concurrents par type

| Type | Concurrents directs | Prix concurrents | Ce qui manque aux concurrents |
|---|---|---|---|
| **Trader** | TradingView ($15-60/mo), Investing.com (free), Finviz (free/$25), eToro (free), Bloomberg Lite (n/a Maroc), Bourse de Casablanca app (free mais basique) | $0-60/mo | Sentiment arabe, AI visibility, BAM/AMMC radar, WhatsApp, correlation sentiment→price |
| **Enterprise** | Meltwater ($500-5K/mo), Brandwatch ($800-3K), Cision ($700+), Talkwalker ($1K+), Profound ($99-399), Otterly ($29-489), Nightwatch (€79-399), Athena (free/$295), Goodie ($399+) | $30-5 000/mo | Médias marocains (30+), GLM-4 arabe natif, WhatsApp Daily Digest, crisis alerts WhatsApp, Harch 100 ranking public |
| **Investor** | Bloomberg Terminal ($24K/an/siège), Refinitiv Eikon ($1 800/mo), AlphaSense ($1 200/an), S&P Capital IQ ($1 500+/mo), PitchBook ($500+/mo), Mergermarket ($500+/mo), Sustainalytics (ESG, $1K+/mo), Verisk Maplecroft (geopolitical, custom) | $6K-30K/an **par siège** | Couverture Maroc/Afrique francophone + arabe, médias locaux, intégration ESG+geopolitical+reputation en 1 plateforme, pricing en MAD |

### 4.3 Ce qui différencie HarchIQ de chaque concurrent

#### 4.3.1 HarchIQ Trader vs TradingView / Investing.com

| Axe | TradingView | Investing.com | **HarchIQ Trader** |
|---|---|---|---|
| Charts prix | Excellent (best-in-class) | Bon | Basique (suffit pour watchlist) |
| Sentiment arabe | ❌ | ❌ | ✅ GLM-4 natif arabe + darija |
| Médias marocains scrapés | ❌ | ❌ (reprend Hespress manuellement) | ✅ 30+ médias |
| AI Visibility (ChatGPT, Perplexity) | ❌ | ❌ | ✅ Tracking des prompts qui mentionnent l'actif |
| Sentiment→Price correlation | ❌ | ❌ | ✅ Pearson + lag optimal (unique) |
| BAM/AMMC regulatory radar | ❌ | ❌ | ✅ Temps réel |
| WhatsApp alerts | ❌ | ❌ | ✅ |
| Prix | $15-60/mo | Free (ads) | **290-2 900 MAD/mois ($29-290)** |

**Positionnement :** "TradingView te dit *ce que le prix fait*. HarchIQ te dit *pourquoi* — et 2-3 jours avant que le prix ne le fasse."

#### 4.3.2 HarchIQ Enterprise vs Meltwater / Profound / Otterly

Déjà couvert par `COMPETITOR_BENCHMARK.md` (Section 4, 12 gap analysis). Récap des 3 moats principaux :
1. **GLM-4 natif arabe** — aucun concurrent n'a d'IA arabe native.
2. **WhatsApp Daily Digest** — 0/5 concurrents livre sur WhatsApp.
3. **30+ médias marocains** — 0/5 concurrent ne scrape Hespress/TelQuel/Médias24.

#### 4.3.3 HarchIQ Investor vs Bloomberg Terminal / AlphaSense / Sustainalytics

| Axe | Bloomberg Terminal | AlphaSense | Sustainalytics | **HarchIQ Investor** |
|---|---|---|---|---|
| Financials Bourse de Casablanca | ✅ (excellent) | Partiel | ❌ | ✅ (via AMMC) |
| Transcripts earnings | ✅ | ✅ (best-in-class) | ❌ | ❌ (pas encore) |
| Médias marocains (Hespress etc.) | ❌ | ❌ | ❌ | ✅ 30+ médias |
| Sentiment arabe NLP | ❌ | ❌ | ❌ | ✅ GLM-4 |
| ESG scoring | Partiel (via BNEF) | ❌ | ✅ (best-in-class global) | ✅ focus Maroc/Afrique |
| Geopolitical risk | ViaBG/NPP | ❌ | ❌ | ✅ Afrique/MENA focus |
| AI Visibility (ChatGPT/Perplexity) | ❌ | ❌ | ❌ | ✅ unique |
| Board-ready PDF generator | ❌ | Partiel | ✅ rapports | ✅ custom templates |
| WhatsApp alerts | ❌ | ❌ | ❌ | ✅ |
| Prix par siège/an | $24K | $1 200 | $1K+ | **600K-3M MAD/an ($60K-300K)** |

**Positionnement :** "Bloomberg te dit ce que OCP a fait hier. Sustainalytics te dit si OCP est 'green'. HarchIQ te dit ce que Hespress, TelQuel, ChatGPT et la rue marocaine pensent d'OCP aujourd'hui — et si ça va impacter ton portefeuille demain."

**L'argument killer pour l'investisseur :** aujourd'hui un fund marocain stack 4 outils (Bloomberg $24K + AlphaSense $1.2K + Sustainalytics $1K + Meltwater $5K = $30K+/an/analyste). HarchIQ remplace 3 des 4 pour 60-300K MAD/an. **Coût total de possession 5-10× inférieur** avec couverture locale supérieure.

### 4.4 Matrice de positionnement

```
                     Couverture locale Maroc/Afrique
                              ↑
                              │
            HarchIQ Investor  │   HarchIQ Enterprise
            ●  ●  ●           │   ●  ●  ●  ●
            HarchIQ Trader    │
                 ●  ●         │
                              │
   ───────────────────────────┼───────────────────────────→
   Local tools                │              Global tools
   (BAM app, BdC app)         │              (Bloomberg, Refinitiv)
                              │
                              │   Meltwater, Brandwatch
                              │   Profound, Otterly, Goodie
                              │   ●  ●  ●  ●  ●
                              │
                              │   TradingView, Finviz, AlphaSense
                              │   Sustainalytics, Maplecroft
                              │   ●  ●  ●  ●  ●
```

HarchIQ occupe le **quadrant haut-gauche** (local + multi-segment) qui est **vide** chez les concurrents. Aucun outil mondial ne sert correctement le marché marocain/africain francophone à cause de la barrière langue arabe + darija + couverture média locale.

---

## Section 5 — Roadmap technique d'implémentation

### 5.1 Modèles Prisma à ajouter (priorisés)

#### Priorité P0 — débloque trader (8 modèles)
```prisma
model Asset {
  id           String   @id @default(cuid())
  ticker       String   @unique
  type         String   // stock | crypto | commodity | fx
  exchange     String?  // "BDC" (Bourse de Casablanca), "BINANCE", "FX"
  currency     String   @default("MAD")
  companyId    String?  // lien optionnel vers Company existante
  company      Company? @relation(fields: [companyId], references: [id])
  name         String
  sector       String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  @@index([type])
  @@index([companyId])
}

model AssetPrice {
  id        String   @id @default(cuid())
  assetId   String
  asset     Asset    @relation(fields: [assetId], references: [id], onDelete: Cascade)
  open      Float
  high      Float
  low       Float
  close     Float
  volume    Float?
  asOf      DateTime
  createdAt DateTime @default(now())
  @@unique([assetId, asOf])
  @@index([assetId, asOf])
}

model AssetSentiment {
  id           String   @id @default(cuid())
  assetId      String
  asset        Asset    @relation(fields: [assetId], references: [id], onDelete: Cascade)
  score        Float
  positivePct  Float
  neutralPct   Float
  negativePct  Float
  articleCount Int
  calculatedAt DateTime @default(now())
  createdAt    DateTime @default(now())
  @@index([assetId, calculatedAt])
}

model AssetAIQuery {
  id         String   @id @default(cuid())
  assetId    String
  asset      Asset    @relation(fields: [assetId], references: [id], onDelete: Cascade)
  prompt     String
  platform   String   // chatgpt | perplexity | gemini | glm
  cited      Boolean
  position   String?
  sentiment  String?
  checkedAt  DateTime @default(now())
  createdAt  DateTime @default(now())
  @@index([assetId, platform])
}

model Watchlist {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name      String
  isDefault Boolean  @default(false)
  createdAt DateTime @default(now())
  entries   WatchlistEntry[]
  @@index([userId])
}

model WatchlistEntry {
  id          String   @id @default(cuid())
  watchlistId String
  watchlist   Watchlist @relation(fields: [watchlistId], references: [id], onDelete: Cascade)
  assetId     String
  asset       Asset    @relation(fields: [assetId], references: [id], onDelete: Cascade)
  notes       String?
  addedAt     DateTime @default(now())
  @@unique([watchlistId, assetId])
}

model AlertRule {
  id               String    @id @default(cuid())
  userId           String
  user             User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  assetId          String
  asset            Asset     @relation(fields: [assetId], references: [id], onDelete: Cascade)
  conditionSentiment Json    // { operator: "lt", value: -10, windowHours: 24 }
  conditionPrice   Json      // { operator: "lt", value: -3, windowHours: 24 }
  channels         String[]  // ["whatsapp", "email", "push"]
  isActive         Boolean   @default(true)
  lastTriggeredAt  DateTime?
  createdAt        DateTime  @default(now())
  events           AlertEvent[]
  @@index([userId, isActive])
  @@index([assetId])
}

model AlertEvent {
  id           String   @id @default(cuid())
  alertRuleId  String
  alertRule    AlertRule @relation(fields: [alertRuleId], references: [id], onDelete: Cascade)
  triggeredAt  DateTime @default(now())
  payload      Json     // snapshot of conditions at trigger time
  deliveredTo  String[] // ["whatsapp:+2126...", "email:a@b.com"]
  createdAt    DateTime @default(now())
  @@index([alertRuleId, triggeredAt])
}
```

#### Priorité P0 — débloque investor (8 modèles)
```prisma
model Portfolio {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name        String   // "Fund VI"
  focus       String?  // "PE" | "debt" | "ESG" | "co-invest"
  currency    String   @default("MAD")
  vintageYear Int?
  holdings    PortfolioHolding[]
  createdAt   DateTime @default(now())
  @@index([userId])
}

model PortfolioHolding {
  id          String    @id @default(cuid())
  portfolioId String
  portfolio   Portfolio @relation(fields: [portfolioId], references: [id], onDelete: Cascade)
  companyId   String
  company     Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)
  weight      Float     // percentage
  entryDate   DateTime
  exitDate    DateTime?
  notes       String?
  createdAt   DateTime  @default(now())
  @@unique([portfolioId, companyId])
  @@index([portfolioId])
}

model Dossier {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  companyId   String?
  company     Company? @relation(fields: [companyId], references: [id], onDelete: SetNull)
  sector      String?  // si dossier sectoriel sans 1 company
  template    String   // "board" | "ma" | "esg" | "sector"
  status      String   @default("pending") // pending | generating | ready | failed
  pdfUrl      String?
  sections    Json?    // list of sections included
  pagesCount  Int?
  generatedAt DateTime?
  createdAt   DateTime @default(now())
  @@index([userId, createdAt])
  @@index([status])
}

model ESGScore {
  id                  String   @id @default(cuid())
  companyId           String
  company             Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  environmentScore    Float    // 0-100
  socialScore         Float
  governanceScore     Float
  overallScore        Float
  controversyCount    Int      @default(0)
  subindicators       Json?
  calculatedAt        DateTime @default(now())
  createdAt           DateTime @default(now())
  @@index([companyId, calculatedAt])
}

model Controversy {
  id          String   @id @default(cuid())
  companyId   String
  company     Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  type        String   // E | S | G
  severity    String   // high | medium | low
  title       String
  description String
  sourceUrl   String
  sourceName  String
  detectedAt  DateTime @default(now())
  eventDate   DateTime?
  status      String   @default("active") // active | resolved
  createdAt   DateTime @default(now())
  @@index([companyId, type, detectedAt])
  @@index([status])
}

model GeopoliticalEvent {
  id          String   @id @default(cuid())
  country     String   // ISO code "MA", "SN", "EG"
  eventType   String   // election | regulation | currency | security | coup | trade
  severity    String   // high | medium | low
  title       String
  summary     String
  sourceUrl   String
  sourceName  String
  eventDate   DateTime
  detectedAt  DateTime @default(now())
  createdAt   DateTime @default(now())
  @@index([country, eventDate])
  @@index([severity])
}

model CountryRiskScore {
  id                String   @id @default(cuid())
  country           String   // ISO code
  overallScore      Float    // 0-100 (higher = safer)
  governmentScore   Float
  regulatoryScore   Float
  currencyScore     Float
  securityScore     Float
  calculatedAt      DateTime @default(now())
  createdAt         DateTime @default(now())
  @@index([country, calculatedAt])
}
```

#### Priorité P1 — webhook pour investor API
```prisma
model WebhookEndpoint {
  id             String   @id @default(cuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  url            String
  events         String[] // ["controversy.new", "score.drop", "filing.ammc"]
  secret         String
  isActive       Boolean  @default(true)
  lastDeliveryAt DateTime?
  createdAt      DateTime @default(now())
  @@index([userId, isActive])
}
```

### 5.2 Routes API à créer

#### Trader APIs (P0)
| Méthode + Route | Description | Réutilise |
|---|---|---|
| `GET /api/trader/assets?q=OCP` | Recherche d'actifs par ticker/nom | nouveau modèle `Asset` |
| `GET /api/trader/assets/:ticker` | Fiche complète : prix + sentiment + AI visibility + news + filings | `AssetPrice`, `AssetSentiment`, `AssetAIQuery`, `Article`, `AIVisibility` |
| `GET /api/trader/assets/:ticker/correlation?window=30d` | Coefficient corrélation sentiment↔prix + lag optimal | calcul on-the-fly |
| `GET /api/trader/watchlists` | CRUD watchlists user | `Watchlist`, `WatchlistEntry` |
| `POST /api/trader/watchlists/:id/entries` | Ajouter actif à watchlist | `WatchlistEntry` |
| `GET /api/trader/alerts` | CRUD règles d'alerte | `AlertRule` |
| `POST /api/trader/alerts` | Créer règle double-trigger | `AlertRule` |
| `GET /api/trader/pre-market` | Brief du jour (cached 7h-9h) | agrégation multi-sources |
| `POST /api/trader/ai-queries` | Lancer un prompt AI sur un actif (async, BullMQ) | `AssetAIQuery`, `Job` |
| `GET /api/trader/regulatory?assetId=...` | Filings BAM/AMMC liés à l'actif | `collectRegulatoryFilings` (existant) |
| `GET /api/trader/prices/:ticker?range=30d` | Prix OHLCV historique | `AssetPrice` |

#### Investor APIs (P0)
| Méthode + Route | Description | Réutilise |
|---|---|---|
| `GET /api/investor/portfolios` | CRUD portfolios user | `Portfolio` |
| `POST /api/investor/portfolios` | Créer portfolio | `Portfolio` |
| `POST /api/investor/portfolios/:id/holdings` | Ajouter company au portfolio | `PortfolioHolding` |
| `GET /api/investor/portfolios/:id/dashboard` | Roll-up : score moyen, top risks, ESG aggregate, controversy count | agrégation multi-tables |
| `POST /api/investor/dossiers` | Lancer génération dossier (async, BullMQ) | `Dossier`, `generateIntelligenceDossier` (existant), `/api/pdf/[type]` (existant) |
| `GET /api/investor/dossiers/:id` | Statut + URL PDF | `Dossier` |
| `GET /api/investor/companies/:id/esg` | ESG score + controversies + subindicators | `ESGScore`, `Controversy` |
| `GET /api/investor/companies/:id/geopolitical` | Exposition pays + events récents | `GeopoliticalEvent`, `CountryRiskScore` |
| `GET /api/investor/geopolitical/map` | Carte interactive risk par pays | `CountryRiskScore` |
| `GET /api/investor/reports/templates` | Liste templates board-ready | existing PDF templates |
| `POST /api/investor/webhooks` | CRUD webhooks | `WebhookEndpoint`, `ApiKey` (existant) |
| `GET /api/investor/api-docs` | OpenAPI spec | nouveau |

### 5.3 Sections frontend à créer

#### Trader Console (`src/app/atelier/console/trader/`)
- `TraderConsoleShell.tsx` — layout 3-col adapté (similaire à `ConsoleShell.tsx` mais sidebar 5 sections trader)
- `WatchlistView.tsx` — liste actifs + drill-down
- `SentimentPriceView.tsx` — chart superposé + correlation matrix
- `AIAlphaView.tsx` — table prompts × actifs × plateformes
- `AlertsView.tsx` — CRUD règles + historique + stats precision
- `PreMarketView.tsx` — brief du jour + PDF download

#### Investor Console (`src/app/atelier/console/investor/`)
- `InvestorConsoleShell.tsx` — layout 3-col avec portfolio selector en top bar
- `PortfoliosView.tsx` — multi-portfolios + roll-up dashboard
- `DossiersView.tsx` — queue de génération + historique + téléchargement
- `ESGView.tsx` — heatmap E/S/G + timeline controverses + filtres
- `GeopoliticalView.tsx` — carte interactive + timeline events + exposure
- `ReportsView.tsx` — bibliothèque rapports + planner + templates

### 5.4 Priorisation (qu'est-ce qui débloque le reste ?)

```
Phase 1 (4-6 semaines) — TRADER MVP
  ┌──────────────────────────────────────────────────┐
  │ 1. Ajouter modèles Asset + AssetPrice +          │
  │    AssetSentiment + Watchlist + WatchlistEntry   │
  │    au schema Prisma                              │
  │ 2. Implementer collectStockPrice() (BdC API ou   │
  │    delayed scraper — accepter 15min delay)        │
  │ 3. Adapter WhatsApp Daily Digest pour template   │
  │    trader (Pre-Market Brief)                     │
  │ 4. Build TraderConsoleShell + Watchlist +        │
  │    SentimentPriceView (chart minimal)            │
  │ 5. Landing page /atelier/products/trader avec    │
  │    pricing 290/990/2900 MAD/mois                 │
  └──────────────────────────────────────────────────┘
                  ↓ débloque : revenu PLG immédiat

Phase 2 (6-8 semaines) — TRADER PRO features
  ┌──────────────────────────────────────────────────┐
  │ 6. Implementer AI Alpha (asset-queries via       │
  │    AIVisibility) — reuse existing infra          │
  │ 7. AlertRule + AlertEvent + double-trigger logic │
  │ 8. Pre-market brief generator (cached 7h-9h)     │
  │ 9. Stripe / CMI payment integration (MAD)        │
  │ 10. Self-serve signup (AccessRequest déjà là)    │
  └──────────────────────────────────────────────────┘
                  ↓ débloque : 500 traders payants

Phase 3 (8-12 semaines) — INVESTOR MVP
  ┌──────────────────────────────────────────────────┐
  │ 11. Ajouter modèles Portfolio + Holding +        │
  │     Dossier + ESGScore + Controversy             │
  │ 12. Réutiliser dossier-generator.ts existant +   │
  │     /api/pdf/[type] pour POST /api/investor/     │
  │     dossiers                                    │
  │ 13. Build InvestorConsoleShell + PortfoliosView │
  │     + DossiersView                              │
  │ 14. ESG scoring pipeline (NLP sur Articles       │
  │     filtrés + subindicators)                    │
  │ 15. Sales deck + 3 audits prospects offerts     │
  └──────────────────────────────────────────────────┘
                  ↓ débloque : 1er client investor payant

Phase 4 (8-12 semaines) — INVESTOR PRO
  ┌──────────────────────────────────────────────────┐
  │ 16. GeopoliticalEvent + CountryRiskScore         │
  │     (scrap Jeune Afrique + Africa News + ACLED)  │
  │ 17. GeopoliticalView (carte interactive)         │
  │ 18. WebhookEndpoint + API REST publique          │
  │ 19. OpenAPI docs + SDK TypeScript/Python         │
  │ 20. Slack/Teams integration (BullMQ workers)     │
  └──────────────────────────────────────────────────┘
                  ↓ débloque : scale 5-10 comptes investor
```

**Débloquant critique #1 :** les modèles `Asset` + `AssetPrice` + `AssetSentiment` ouvrent la console trader MVP. Sans eux, pas de produit trader.

**Débloquant critique #2 :** le modèle `Dossier` réutilise `dossier-generator.ts` (existant) et `/api/pdf/[type]` (existant). L'investor MVP est rapide à shipper car 60% du pipeline existe déjà.

**Débloquant critique #3 :** `Portfolio` + `PortfolioHolding` ouvrent le multi-portfolio roll-up, qui est le feature "ah-ha" pour les funds (sinon on est juste un Meltwater cher).

---

## Section 6 — Pricing comparé (tableau consolidé)

### 6.1 Tableau des 3 segments HarchIQ

| Segment | Tier | Prix MAD/mois | Prix USD éq. | Cibles | Features clés | Concurrent remplacé |
|---|---|---|---|---|---|---|
| **Trader** | Free | 0 | $0 | Découverte | 1 actif, sentiment 7j, 0 alertes | Investing.com free |
| **Trader** | Starter | **290** | ~$29 | Retail | 5 actifs, 3 alertes, AI 5 queries, WhatsApp | TradingView Essential |
| **Trader** | Pro | **990** | ~$99 | Actif régulier | 20 actifs, alertes illimitées, correlation | TradingView Pro |
| **Trader** | Day Trader Pro | **2 900** | ~$290 | Semi-pro / freelance | 75 actifs, API read, real-time BAM | Bloomberg Lite (n/a Maroc) |
| **Enterprise** | Starter | 5 000 | ~$500 | Solo comms dir | WhatsApp daily, 20 sources, 1 concurrent | Meltwater entry |
| **Enterprise** | Pro | 15 000 | ~$1 500 | Comms team | Dashboard, 50 sources, 3 concurrents, AI visibility | Brandwatch / Profound Growth |
| **Enterprise** | Enterprise | 50 000 | ~$5 000 | Groupe/institution | 200 sources, 5 concurrents, API, analyste dédié | Meltwater Enterprise |
| **Investor** | Fund | **50 000** | ~$5 000 | Family office / small fund | 1 portfolio, 20 companies, 5 dossiers/mois, ESG | AlphaSense + Sustainalytics entry |
| **Investor** | Multi-Fund | **100 000** | ~$10 000 | Mid PE / IFC / AfricInvest | 5 portfolios, 100 companies, 20 dossiers, API | Bloomberg + Sustainalytics |
| **Investor** | Bank/Institution | **250 000+** | ~$25 000+ | Attijari Capital / BMCE / CFG | Unlimited, white-label, on-site, analyste FT | Bloomberg Terminal × 5 sièges |
| **Investor** | Sector Report (one-shot) | **100K-500K / rapport** | ~$10K-50K | CIO, head of research | 50-100 pages, 20+ companies | McKinsey sector report (pas exactement concurrent) |

### 6.2 Comparaison prix concurrents vs HarchIQ

| Concurrent | Prix annuel éq. USD | HarchIQ équivalent | Prix HarchIQ annuel USD | Différentiel |
|---|---|---|---|---|
| TradingView Pro | $240/an | Trader Pro | $1 188/an | HarchIQ 5× plus cher mais sentiment + AI + WhatsApp |
| Investing.com | $0 | Trader Free | $0 | Parité gratuite, HarchIQ premium en sentiment |
| Meltwater (entry) | $6 000/an | Enterprise Starter | $6 000/an | Parité, HarchIQ ajoute arabe + WhatsApp |
| Profound Growth | $4 788/an | Enterprise Pro | $1 800/an | HarchIQ 2,6× moins cher + arabe + WhatsApp |
| Otterly Standard | $2 268/an | Enterprise Pro | $1 800/an | HarchIQ 20% moins cher + arabe + WhatsApp |
| Bloomberg Terminal (1 siège) | $24 000/an | Investor Bank | $300 000/an | HarchIQ 12,5× plus cher — mais couvre 5+ analystes + arabe + Afrique + ESG + geopolitical |
| AlphaSense | $1 200/an | Investor Fund (inclu) | $60 000/an | HarchIQ remplace AlphaSense + Sustainalytics + Meltwater |
| Sustainalytics | $1 000+/an | Investor Multi-Fund (inclu) | $120 000/an | HarchIQ ajoute médias locaux + arabe + géopolitique |

### 6.3 Objectifs revenu an 1 (post-launch des 3 segments)

| Segment | Comptes payants | ARPU MAD/mois | Revenu mensuel | Revenu annuel |
|---|---|---|---|---|
| Trader | 500 | 600 (mix Starter/Pro) | 300 000 MAD | 3,6 M MAD |
| Enterprise | 50 | 15 000 (mix Starter/Pro/Enterprise) | 750 000 MAD | 9 M MAD |
| Investor | 5 | 100 000 (mix Fund/Multi-Fund/Bank) | 500 000 MAD | 6 M MAD |
| **Total** | **555 comptes** | — | **1,55 M MAD/mois** | **18,6 M MAD/an** |

**Mix optimal :** 90% traders (volume, viralité, PLG), 9% enterprises (mid-market sales-led), 1% investors (high-touch enterprise sales). Le revenu est réparti ~20% trader / 50% enterprise / 30% investor — l'investor est le moins nombreux mais le plus stratégique (référence client haut de gamme, case studies pour sales enterprise).

### 6.4 Annual contracts & discounts

- Trader : annuel = -15% (12 mois payés 10,2) — comme Otterly/Nightwatch
- Enterprise : annuel = -20% + onboarding offert
- Investor : annuel = -25% + 1 audit prospect offert + quarterly strategic review incluse

---

## Conclusion — Vision en 5 lignes

1. **3 types isolés, 1 pipeline data** — l'architecture est déjà dans le schema (`User.accountType`), il reste à ajouter les modèles `Asset` (trader) et `Portfolio`+`Dossier`+`ESGScore` (investor).
2. **Trader = PLG volume à 290 MAD/mois** — sentiment-to-price correlation + AI Alpha + WhatsApp = différenciateur vs TradingView/Investing.com. Cible : 500 payants an 1 = 3,6M MAD/an.
3. **Investor = premium sales-led à 50K-250K+ MAD/mois** — multi-portfolio + dossiers PDF board-ready + ESG + géopolitique = remplace Bloomberg+AlphaSense+Sustainalytics+Meltwater. Cible : 5 comptes an 1 = 6M MAD/an.
4. **Enterprise reste le cœur** — déjà implémenté (console + 62 routes + pricing 5K-50K). Cible : 50 comptes an 1 = 9M MAD/an.
5. **Le système concurrent est une illusion d'isolation** — les 3 types ne se croisent jamais, mais la même donnée OCP leur sert à 3 décisions : amplifier (comms), trader (retail), maintain (fund). **Une stack, trois business models, un moat data.**

> "Ma vision n'est pas finie, ya pas de point à la fin." — Amine. Ce document est une version 1, à itérer.
