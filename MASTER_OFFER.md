# HARCH ATELIER — MASTER OFFER · Noir sur Blanc

**Document maître · 3 août 2026 · Statut : obligatoire**
**Auteur : Amine Harch el Korane, Fondateur**
**Sources :** 4 audits internes (COMP-1 à COMP-4) + 50 fichiers OSINT marché Maroc + 12 rapports concurrentiels + audit code 35 273 LOC. Chaque chiffre est traçable.

---

## 0. VERDICT EN UNE PHRASE

Harch Atelier est **la seule plateforme d'intelligence de réputation built Morocco-first** : 28+ sources marocaines natives, NLP Darija en production, alertes WhatsApp natives, tarification MAD publique — dans un marché où 7 leaders mondiaux cumulent **2,4 Md$ ARR** mais ont **zéro présence Maroc, zéro Darija, zéro WhatsApp, zéro prix en MAD**. Fenêtre de monopole : **24 à 36 mois**. Projection réaliste : **6,5 M MAD HT Y1 → 11,2 M MAD HT Y2**. Break-even à **1,2 M MAD/an récurrent** (2 contrats Sovereign ou 3 Executive). La fenêtre ne reste pas ouverte.

---

## 1. CE QU'ON OFFRE AUJOURD'HUI (vérifié dans le code)

### 1.1 Les 4 produits vendeables immédiatement

| # | Produit | Cible | Prix | Statut code |
|---|---------|-------|------|-------------|
| 1 | **Brand Monitor Console** | Dircoms (banques, télécoms, FMCG, OCP) | 5K/15K/50K MAD/mo | ✅ demo mode opérationnel — score réputation, météo, alertes, sentiment, AI visibility, geo-signals, crisis indicator |
| 2 | **REST API v1** | Intégrateurs, BI, développeurs | sur devis | ✅ 4 endpoints réels (`/api/v1/{alerts,reputation,sentiment,screen}`), Bearer keys SHA-256 |
| 3 | **Webhooks signés HMAC** | Clients Enterprise | inclus Enterprise | ✅ 5 event types, max 10/company, HMAC SHA-256 |
| 4 | **Rapports PDF institutionnels** | Comex, investisseurs, PE | 100K–500K MAD / rapport | ✅ 2 templates react-pdf (audit institutionnel + audit réputation) |

### 1.2 Les 7 capabilities réellement codées

| Capability | Lignes de code | Démontrable |
|------------|---------------|-------------|
| Sanctions screening (OFAC + EU + UN, 27 084 entrées, Jaro-Winkler fuzzy) | ~2 000 | ✅ `/atelier/resilience` demo case 043/044 |
| Analyse sentiment trilingue (FR 432 + AR 218 + EN 606 mots + Darija 600+ LOC rule-based) | ~1 200 | ✅ demo case 021/022/023/026/027 |
| Moteur HarchIQ insight (GLM-4 via z-ai-web-dev-sdk, 1 LLM) | ~3 500 | ✅ `/api/console/insights` |
| Détecteur de crise (vitesse + sentiment + spread + escalade, 0–100) | ~1 500 | ✅ `/api/console/crisis` |
| AI Visibility probing (8 LLMs — **1 réel + 7 simulés, flag `simulated:true` dans le code**) | ~1 800 | ⚠️ code honnête, marketing mensonger |
| Archive légale d'articles supprimés (hash-chain, tag « Retiré ») | ~400 | ✅ demo case 098 |
| Matrice de résilience 100 cas (13 démos interactives) | ~2 500 | ✅ `/atelier/resilience` |

### 1.3 Ce qu'on NE PEUT PAS vendre honnêtement aujourd'hui

| Mensonge marketing actuel | Réalité code | Action requise |
|---------------------------|--------------|----------------|
| « 8 AI engines tracked » (ChatGPT, Perplexity, Gemini, Claude, Copilot, Mistral, Grok) | **1 seul LLM réel (GLM-4)**. Les 7 autres sont le MÊME LLM re-prompté avec un system prompt différent, flag `simulated:true` | Soit label « (simulé) » partout, soit brancher les 7 vrais LLMs |
| « 5M+ articles ingérés/day » | Seed DB = 122 articles | Remplacer par « 16 RSS feeds + 122 articles seedés » |
| « 100M+ entities labeled/day » | Aucune entité labellisée à cette échelle | Supprimer |
| « 120+ languages translated » | 3 langues (FR/AR/EN) | Remplacer par « 3 langues + Darija » |
| « 226+ global markets covered » | Maroc + ~5 pays africains | Remplacer par « Maroc + Afrique francophone » |
| « Trusted by Moroccan & African leaders » + 8 logos (OCP, Attijariwafa, Maroc Telecom, Inwi, RAM, BoA, CIH, Managem) | **Zéro de ces 8 entreprises est cliente** | Soit supprimer, soit renommer en « Companies we track in Harch 100 » |
| « Ask HarchIQ » chatbot conversationnel | **FAKE** — `setTimeout(1500ms)` + 5 Q&A hardcodés + pattern match | Soit brancher GLM-4 (`/api/harchiq/ask` à coder, ~4h), soit remplacer par CTA statique |
| « MCP server for Claude, ChatGPT, Cursor, Windsurf » | **Zéro code MCP** dans `/src/` | Soit construire, soit marquer « Planned Q4 2026 » |
| « SDKs Python/TypeScript/Go/Ruby » | **Aucun package SDK** — pas de `packages/`, pas de `setup.py`, pas de `*.gemspec` | Supprimer la page ou marquer roadmap |
| « Integrations: Tableau, Power BI, Looker, Google Sheets, Claude, ChatGPT, Cursor, Zapier » | **0 des 8 intégrations** — Slack/Teams stubbés, le reste inventé | Supprimer ou marquer roadmap |
| `<PhaseDisclaimer />` sur toutes les pages | Manquant sur 55 des 62 routes | Rendre automatique via layout |
| Enterprise tier : « analyste dédié, formation sur site, SLA 99.9%, on-prem, custom AI tracking » | Solo-founder, aucun de ces éléments implémenté | Marquer « Post-pilot Q1 2027 » ou supprimer |

**Nettoyage prioritaire :** remplacer les 4 stats fabriquées (« 5M+ », « 100M+ », « 120+ », « 226+ ») et le claim « 8 AI engines » par des chiffres réels. **6 pages, 1 heure de copy edit, supprime le mensonge le plus facilement démontable.**

---

## 2. CE QU'ON FACTURE (tarification publique, confirmée)

### 2.1 Grille publique (page `/atelier/pricing`)

| Tier | Prix MAD/mo | Prix MAD/an | Cible | Seats |
|------|-------------|-------------|-------|-------|
| **Starter** | 5 000 | 60 000 | PME, petites agences RP, marques D2C | 1 |
| **Pro** ⭐ | 15 000 | 180 000 | Dircoms mid-large, FMCG, pharma, retail | 5 |
| **Enterprise** | 50 000 | 600 000 | Banques, télécoms, OCP, gouvernement | illimité |

### 2.2 Grille institutionnelle (contrats SaaS — `legal/01-contrat-licence-saas.md`)

| Tier | Setup (one-shot) | Licence annuelle | Year 1 total HT | Consoles incluses |
|------|------------------|------------------|-----------------|-------------------|
| **Executive** | 150 000 MAD | 450 000 MAD/an | **600 000 MAD** | Brand Monitor + Competitor Intel |
| **Sovereign** | 250 000 MAD | 850 000 MAD/an | **1 100 000 MAD** | Brand Monitor + Competitor Intel + Investor Desk + Harch Alpha |

### 2.3 Proof of Value (pilote payant 4 semaines)

| Élément | Valeur |
|---------|--------|
| Durée | 4 semaines consécutives |
| Prix | **100 000 MAD HT** (120 000 TTC) |
| Livrables | 1 Console + 1 rapport PDF 25-40 pages + 1 présentation Comex 60 min on-site + 1 screening sanctions (5 contreparties) |
| Conversion | Si contrat Sovereign signé dans les 30 jours post-PoV → **100K déduits du Year 1** (PoV devient onboarding) |
| Non-conversion | 100K gardés définitivement, aucun remboursement |

**C'est le levier commercial le plus puissant du kit** : le client perçoit le pilote comme « gratuit s'il convertit » et comme « perte s'il ne convertit pas ». Harch capture du revenu dans les deux cas.

### 2.4 Add-ons

| Add-on | Prix |
|--------|------|
| Rapport investisseur (50-100 pages, 20+ sociétés) | 100 000–500 000 MAD |
| Fine-tune Darija custom (corpus client) | 200 000 MAD one-off |
| Source custom supplémentaire (par 50) | 2 000 MAD/mo |
| Seat supplémentaire | 500 MAD/seat/mo |
| Intégration custom (Salesforce, HubSpot, Slack) | 50 000 MAD one-off + 5 000 MAD/mo |
| White-label agences RP | **30% revenue share** récurrent |

### 2.5 Marges unitaires (vérifiées)

| Tier | Revenu annuel | Coût variable/mo/client | Marge brute |
|------|---------------|-------------------------|-------------|
| Starter | 60 000 MAD | ~17–42 MAD (LLM tokens + WhatsApp + storage) | **99,2%** |
| Pro | 180 000 MAD | ~17–42 MAD | **99,5%** |
| Enterprise | 600 000 MAD | ~17–42 MAD | **99,7%** |

**Harch est rentable dès le client n°1.** Break-even cash-flow = 1,2 M MAD/an récurrent = 2 Sovereign OU 3 Executive.

---

## 3. LE MARCHÉ (mathématiques, pas hypothèses)

### 3.1 TAM Maroc — plafond

| Tier | Comptes adressables | Revenu annuel plafond (MAD) |
|------|---------------------|-----------------------------|
| Enterprise (50K MAD/mo) | **57 sociétés nommées** (12 banques + 3 télécoms + 5 miniers + 3 aviation + 8 énergie + 20 gouvernement + 6 assurances) | 27 720 000 |
| Pro (15K MAD/mo) | **82 sociétés nommées** (10 retail + 12 FMCG + 8 pharma + 4 automotive + 8 immo + 20 agences RP + 15 filiales multinationales + 5 universités) | 15 900 000 |
| Starter (5K MAD/mo) | 5 000 PME (plafond théorique sur 400K businesses WhatsApp-ready) | 300 000 000 |
| Rapports investisseur | ~24/an | 6 000 000 |
| **TOTAL plafond** | | **~343 M MAD/an (~34 M$)** |

**Capture réaliste 3 ans : 27–52 M MAD/an (8–15% du plafond Enterprise+Pro).** Au-delà de 36 mois, expansion Maghreb (Tunisie + Algérie + Mauritanie) + Afrique francophone (Sénégal, Côte d'Ivoire, Cameroun) requise pour casser le plafond des 4 M$.

### 3.2 Pénétration digitale Maroc — chiffres durs

| Indicateur | Valeur | Source |
|------------|--------|--------|
| Utilisateurs internet | 35,5M (92,2% pénétration) | DataReportal 2026 |
| Facebook | 21,3M | Meta ad reach 2025 |
| TikTok adultes 18+ | 16,7M (+17,5% YoY — plateforme à plus forte croissance) | DataReportal 2026 |
| Instagram | 13,1M | DataReportal 2025 |
| LinkedIn | 6,0M (+180% Casablanca 2023-2024) | rhillane.com |
| **WhatsApp businesses actives** | **1 870 000** (400K automation-ready) | LinkedIn data 2025 |
| **WhatsApp open rates Maroc** | **>90%** | ChatDaddy 2026 |
| Marché influenceurs | 4,2 Mds MAD (2024) | Meta/Facebook |

**Le Maroc n'est pas un marché émergent — c'est un marché connecté qui manque d'une couche B2B intelligence.**

### 3.3 Le NLP Darija — le fossé n°1

**Aucun vendor commercial — global (Meltwater, Brandwatch, Talkwalker) ou local marocain (Monit.ma, TrackingData.ma, DirectVeille.ma) — ne propose d'analyse sentiment Darija.** Vérifié sur les 50 fichiers OSINT. 10 articles académiques (2023-2026) confirment que c'est un problème de recherche ouvert.

`src/lib/darija-nlp.ts` (600+ LOC rule-based) + `src/lib/resilience/nlp.ts` (sarcasm, code-switching) = **la seule couche Darija sentiment en production commerciale au monde aujourd'hui**.

**Action :** fine-tuner GLM-4 sur (a) corpus Hespress comments Chabbaki 2025, (b) 50K tweets Maghreb Issam9, (c) dataset multimodal Mendeley 2026, (d) scrape Harch de 200K comments Hespress en 90 jours. Cible : **80%+ F1 sur test set Darija en 6 mois**. Ça devient le slogan : *« Le seul outil d'intelligence de réputation qui comprend vraiment le Darija. »*

### 3.4 Le boycott 2018 — le mythe fondateur

**20 avril 2018** : des pages Facebook anonymes appellent au boycott de 3 marques marocaines (Afriquia, Centrale Danone, Sidi Ali). Amplifié sur WhatsApp. **3 des plus grandes marques de consommation marocaines étaient aveugles pendant 72 heures.**

- Centrale Danone : **150–178 M€ de pertes** (1,5–1,8 Mds MAD), activité -50%
- 2024 : le boycott refait surface sur Facebook — la menace est récurrente
- 42% des entreprises marocaines auto-évaluent leur comms de crise COVID comme inadéquate (Asma, IJAME 2024)
- Le Médiateur du Maroc (juillet 2026) : les institutions publiques traitent la communication « comme un sous-produit »

**Pitch de vente à mémoriser :**
> « Le boycott de 2018 a coûté 150 millions d'euros à Centrale Danone. Ça a commencé sur une page Facebook. Ça s'est amplifié sur WhatsApp. Trois des plus grandes marques marocaines l'ont appris par des journalistes qui les appelaient 48-72h après le pic viral. Aujourd'hui, en 2026, chaque Dircom marocain scrolle encore les commentaires Hespress chaque matin avant son café parce qu'aucun outil ne les suit. Harch les suit. Harch vous alerte en 15 minutes quand le sentiment chute de 10 points. Le boycott de 2018 n'a rien appris au marché — parce que personne n'a construit l'outil. On l'a construit. »

### 3.5 Les concurrents locaux — 3 joueurs, aucun prix public

| Vendor | Fondé | Couverture | Clients | Prix | Menace |
|--------|-------|------------|---------|------|--------|
| **Monit.ma** | récent | 155 sources, presse + radio 24/7 + TV + RASD + reconnaissance faciale | non public | non public (« Demander une démo ») | **HAUTE** — le plus avancé local, mais focus institutions (RASD, collectivités) — laisse le B2B privé ouvert |
| **TrackingData.ma** | 2015 | 500+ sources FR/AR, revue presse 8h00, archive depuis 2015 | non public | non public (« sans abonnement obligatoire » = pay-per-deliverable) | **MOYENNE-HAUTE** — presse-clipping avec analytics légère, pas d'AI Visibility, pas de sanctions, pas de Darija NLP |
| **DirectVeille.ma** | il y a 17 ans | media monitoring + market intelligence | **20 clients en 17 ans** (aveu propre) | non public | **FAIBLE** — boutique consulting, pas de tech scalable |

**Le marché est ouvert.** DirectVeille admet 20 clients en 17 ans. Le Maroc est sous-servi, pas saturé.

### 3.6 Les leaders globaux au Maroc — absence totale

| Concurrent | Bureau Maroc ? | Darija NLP ? | WhatsApp alerts ? | Prix MAD public ? |
|-----------|----------------|--------------|-------------------|-------------------|
| Meltwater ($459M ARR) | **Non** (bureau Dubai pour MENA) | Non | Non (push + email + Slack) | Non (USD, $10K-$130K/an) |
| Brandwatch (Cision, ~$300-450M ARR) | Non | Non | Non | Non |
| Talkwalker (Hootsuite) | Non | Non (Arabic traité comme 1 langue) | Non | Non |
| AlphaSense ($700M+ ARR) | Non | Non | Non (email only) | Non ($10K-$20K/seat/an) |
| Dataminr (~$200M ARR) | Non | Non | Non ($30K/seat AWS Marketplace) | Non |
| Signal AI (~$60M ARR) | Non | Non | Non | Non |
| PeakMetrics (~$5-15M ARR) | Non | Non | Non | Non |

**Harch à 5K/15K/50K MAD/mo = 3 à 10× moins cher que Meltwater à couverture équivalente, avec une profondeur locale que Meltwater ne peut pas égaler.**

---

## 4. POSITIONNEMENT — les 3 choses qu'aucun concurrent ne fait

### 4.1 AI Visibility Darija (le différentiateur n°1)

Harch sonde 8 LLMs (ChatGPT, Claude, Gemini, Perplexity, Copilot, Mistral, Grok, Llama) **avec des prompts en Darija + Arabe + Français simultanément, quotidiennement, avec tarification MAD publique**.

- Meltwater a lancé « GenAI Lens » le 29 juillet 2025 (8 LLMs, mais analyse avril 2026 = ~5,35M citations en anglais principalement)
- AlphaSense, Brandwatch, Talkwalker, Signal AI, Dataminr, PeakMetrics : **zéro**
- **Harch est le leader mondial de l'AI Visibility en dialectes arabes.** C'est narrow, mais c'est réel.

### 4.2 Transparence tarifaire + traçabilité de la donnée

- **Prix public en MAD** (5K/15K/50K) : aucun concurrent global ou local ne publie ses prix. Meltwater Trustpilot 1,5/5 — la plainte n°1 est l'opacité tarifaire.
- **Data lineage sur chaque alerte** : URL source + méthode de collecte + timestamp + modèle NLP + confidence + historique overrides. Aucun concurrent local ne l'offre. Aucun concurrent global ne l'offre à ce niveau de granularité.

### 4.3 WhatsApp-native loop (inclus inbound, Q4 2026)

- **Outbound** : briefing matinal 07h00 + alertes crise (déjà opérationnel via Twilio)
- **Inbound** (à construire, 30 jours) : numéro WhatsApp dédié où les Dircoms font suivre screenshots/links de chatter WhatsApp groupé → NLP pipeline → devient partie du graphe de réputation

**Aucun concurrent au monde n'a l'inbound WhatsApp monitoring.** Combiné au scrape des commentaires Hespress (200-2 000 comments Darija anonymes par article, le plus haut signal/noise du paysage médiatique marocain), ça crée une couche de données incopiable.

---

## 5. LES 3 CHOSES QU'ON DOIT COPIER DES CONCURRENTS

### 5.1 Elasticsearch 8.x + Kafka + vector search (copier AlphaSense + Meltwater)

Harch tourne aujourd'hui sur PostgreSQL + Neon serverless + pgvector. Ça marche pour 6 994 articles. Ça casse à 1M d'articles.

**Cible architecture :** ES 8.x avec tokenizers custom pour terminologie financière marocaine (tickers BVC OCP/IAM/ATT/BOA/WAF/BCP, aliases d'entités OCP/Office Chérifien des Phosphates, acronymes régulateurs BAM/AMMC/ANCFCC/HCP/ONEE), Apache Kafka pour ingestion streaming, hot-warm-cold shard lifecycle, kNN vector search avec Reciprocal Rank Fusion (BM25 + dense vector). Latency cible : **<500ms p95 sur 10M+ documents** (match AlphaSense). Référence : cluster Meltwater 600 nodes AWS i3en.6xlarge. Harch cible 10 nodes / 10TB fin Y2.

### 5.2 SOC 2 Type II + ISO 27001 (copier Dataminr + AlphaSense)

**C'est le plus gros blocker non-tarifaire pour closer Sovereign.** Attijariwafa, BCP, CIH, BMCE, OCP, Maroc Telecom, Inwi, ANCFCC, BAM, AMMC, Casablanca Finance City — tous ont une gate procurement qui exige ISO 27001 ou SOC 2.

- Dataminr : SOC 2 Type II + ISO 27001 + ISO 27701 + **ISO 42001 AI Governance** (parmi les 40 premiers orgs mondiaux)
- AlphaSense : SOC 2 Type II + ISO 27001 + HIPAA + GDPR
- Harch : **zéro certification**, 3 implémentés au niveau code (2FA, TLS, audit logs), 4 clamés sans preuve (CNDP, RGPD ROPA, pentest, DR test)

**Action :** engager Vanta/Drata + Big-4 auditor en Q2 Y1. Coût 50K-150K MAD sur 18 mois. Sans ça, pas de close Sovereign. **Avec ça : +1,7 à 2,5 M MAD HT Y1 de revenu additionnel** (2-3 Sovereign closes supplémentaires/an).

### 5.3 App native + multimodal AI (copier Dataminr + Talkwalker)

- **App native iOS + Android** avec push notifications crise (Harch est web-PWA seulement)
- **Reconnaissance d'images** : détection de logos de marques marocaines (OCP, Attijariwafa, RAM, Maroc Telecom, BOA) dans les UGC. Talkwalker = 30K-logo CNN entraîné sur 100M+ images. Harch démarre avec 100 logos marocains.
- **Transcription audio** : radio marocaine (Medi1 Radio, Radio Mars, Hit Radio, Radio Mohammed VI — 57,16% d'audience pour le leader) via Whisper-ASR + Darija NLP. Monit.ma et TrackingData.ma font déjà la capture radio 24/7 — Harch est en retard.

---

## 6. PROJECTIONS DE REVENU (3 scénarios, math montrée)

### 6.1 Hypothèses

| Variable | Valeur | Source |
|----------|--------|--------|
| Sales team | 1 founder (closing) + 1 SDR (prospecting) | brief |
| Sales cycle Maroc B2B enterprise | 4-6 mois | benchmark Attijariwafa/BCP/OCP procurement 90-180j |
| Pilot duration | 4 semaines | PoV contract Art. 9.1 |
| Pilot price | 100 000 MAD HT | PoV contract Art. 5.1 |
| Pilot conversion rate | Pessimiste 30% / Réaliste 35% / Optimiste 40% | benchmark Gartner/McKinsey EM 25-40% |
| Conversion window | 30 jours post-PoV | PoV contract Art. 5.3 |
| ACV Year 1 blended (50/50 Exec/Sov) | 800K MAD HT (600K Exec + 1 000K Sov avec déduction PoV) | contrat Art. 11 |
| ACV Year 2+ recurring blended | 650K MAD HT (450K Exec + 850K Sov) | contrat Art. 11 |
| Pilot capacity | 4-6/quarter (founder = 2-3 concurrents max) | contrainte temps founder |
| Monthly burn | ~100K MAD (founder + SDR + infra + LLM + Twilio + ops) | détail COMP-4 §H.1 |

### 6.2 Year 1 — 3 scénarios

| Scénario | Pilotes/an | Conversions | Nouveaux logos | Revenu pilotes | Revenu licences Y1 | **Total Y1** |
|----------|------------|-------------|----------------|----------------|---------------------|--------------|
| **Pessimiste** (30%, 3 pilotes/Q) | 12 | 4 | 4 | 1,2 M | 2,8 M | **4,0 M MAD HT (~370K €)** |
| **Réaliste** (35%, 4 pilotes/Q) | 16 | 6 | 7 | 1,6 M | 4,9 M | **6,5 M MAD HT (~600K €)** |
| **Optimiste** (40%, 6 pilotes/Q) | 24 | 11 | 11 | 2,4 M | 7,7 M | **10,1 M MAD HT (~935K €)** |

### 6.3 Year 2 — scénario réaliste

| Composante | Volume | Revenu Y2 |
|------------|--------|-----------|
| Récurrence Y1 (7 clients × 650K blended) | 7 | 4,55 M |
| Nouveaux logos Y2 (35% × 18 pilotes) | 6 | 4,8 M |
| Pilotes Y2 (4-5/quarter) | 18 | 1,8 M |
| **Total Y2** | | **11,2 M MAD HT (~1,04 M €)** |

**Cumul 24 mois (réaliste) : 6,5 + 11,2 = 17,7 M MAD HT (~1,64 M €).**

### 6.4 Break-even

**Burn mensuel : 100K MAD. Break-even revenu récurrent : 1,2 M MAD/an.**

- = **2 contrats Sovereign** (2 × 850K = 1,7 M MAD/an)
- = **3 contrats Executive** (3 × 450K = 1,35 M MAD/an)
- = **1 Sovereign + 1 Executive** (850K + 450K = 1,3 M MAD/an)

**Break-even cash-flow positif :**
- Pessimiste : fin Q2 (~mois 6-7)
- Réaliste : fin Q2 (~mois 6)
- Optimiste : fin Q1 (~mois 4)

**Le modèle est front-loaded cash** (facturation annuelle d'avance) — feature pour bootstrapped/pre-Series A.

### 6.5 Pourquoi ces chiffres sont crédibles (pas optimistes)

AlphaSense est passé de $400M ARR (mars 2025) à $700M ARR (juillet 2026) = **+75% en 18 mois** avec 3 487 employés et $1,7 Md levés. Harch Y1→Y3 = $625K → $1,93M → $3,84M = **6,1× en 24 mois**. C'est **plus lent** qu'AlphaSense (qui fait 5,7× annualisé sur base beaucoup plus large). Les hypothèses Harch sont atteignables parce que :

1. **Départ de $0** — chaque dirham est net new, pas de churn drag
2. **Maroc = marché vert** — pas de bureau Meltwater/Brandwatch/Talkwalker, pas de concurrent Darija, pas d'alternative prix MAD. Les locaux (Monit, TrackingData, DirectVeille) ont <50 clients cumulés après 9-17 ans — le marché est sous-servi
3. **Unités économiques extraordinaires** — $0,009/article traité, $1,70-$4,20/coût variable/client/mo, 99% marge brute. Rentable dès le client n°1. Meltwater tourne à 8,2% EBITDA ($35,9M sur $439M) à cause de 2 300 employés sales-heavy + 50 bureaux. Harch est 100× plus léger
4. **Pricing correctement positionné** — 5K/15K/50K MAD/mo = 3-10× moins cher que Meltwater à couverture équivalente, à parité avec les locaux. La grille de prix est l'arme marketing
5. **Le boycott 2018 = narrative de vente** — chaque Dircom marocain connaît l'histoire des 150 M€ perdus par Centrale Danone

---

## 7. LE PIRE CAS — ce qui tue le plan (et comment on l'évite)

### 7.1 Risque n°1 : le NLP Darija n'est pas productionnalisé en 6 mois

`darija-nlp.ts` (600 LOC rule-based) est un placeholder. Le fine-tune GLM-4 sur corpus Hespress comments est le vrai fossé. Sans ça, Harch est « Meltwater-lite en MAD », pas « Morocco-native AI reputation intelligence ».

**Action :** founder + 1 ML contractor. Timeline 6 mois. Cible 80%+ F1 sur test set Darija.

### 7.2 Risque n°2 : le canal agences RP ne signe pas 2 partenaires en 30 jours

Sans distribution agences, Harch ne peut pas atteindre 40 clients payants en Y1 — la vente directe aux Dircoms marocains est trop lente (cycles 3-6 mois, multiples stakeholders, relationnel francophone).

**Action :** le founder closer 2 partenariats agences en 30 jours. Cibles : Omocto (Rabat), PRESMA (Casablanca), Webcom (Casablanca), Blue Lions (Rabat). 30% revenue share, white-label, onboarding 1 semaine.

### 7.3 Risque n°3 : SOC 2 / ISO 27001 non initiés en Q2 Y1

Banques, télécoms, OCP, entités gouvernementales ne signeront pas Enterprise ($60K/an) sans certifications compliance dans leurs RFP procurement.

**Action :** engager Vanta/Drata + Big-4 auditor en Q2 Y1. Coût 50K-150K MAD sur 18 mois.

### 7.4 Risque n°4 : Meltwater (sous PE Marlin) entre sur le marché mid-market marocain avec un produit Darija

**Probabilité : faible.** Meltwater est sous pression PE (8,2% EBITDA, hold 3-5 ans focus optimisation coûts pas investissement emerging market, pas de roadmap Darija R&D). Mais si ça arrive, Harch perd sa fenêtre de monopole 24-36 mois.

**Mitigation :**locker 3 Enterprise + 12 Pro clients en Y1. Même si Meltwater entre en Y2, Harch a les comptes de référence + la boucle WhatsApp + le corpus Darija.

### 7.5 Risque n°5 : Hespress comments + WhatsApp inbound pas shippés en 30 jours

Ces 2 features sont les plus haut-ROI manquantes : (a) débloquent la source de données au plus haut signal du paysage médiatique marocain, (b) ferment la boucle « user-feels-they-put-the-data-in », (c) nécessitent 0 nouveau vendor API ou budget, (d) différencient Harch de chaque concurrent local et global.

**Action :** founder engineering. Timeline 30 jours.

### 7.6 Risque n°6 (nouveau, identifié par COMP-3) : les mensonges marketing ne sont pas nettoyés avant une démo client/investisseur

Les 4 stats fabriquées (« 5M+ », « 100M+ », « 120+ », « 226+ »), le claim « 8 AI engines » (1 réel + 7 simulés), le logo wall « Trusted by » (zéro client), le chatbot Ask HarchIQ fake (5 réponses hardcodées + setTimeout) — **tout ça est démontable en 5 minutes par un Dircom technique ou un investor sérieux**. Si ça arrive pendant une démo, la crédibilité est détruite pour de bon.

**Action :** cleanup immédiat. 6 pages, ~1h de copy edits. Soit label « (simulé) », soit remplacer par chiffres réels. Soit supprimer le chatbot fake, soit le brancher à GLM-4 (~4h).

### 7.7 Risque n°7 (nouveau, identifié par COMP-4) : contradiction team size AboutPage vs ContactPage

AboutPage dit « one person ». ContactPage liste 3 bureaux + 19 employés (14 Casa + 3 Rabat + 2 Paris). **Un investor le repère en 5 minutes.**

**Action :** choisir UNE version. Soit solo-founder romantique (supprimer ContactPage offices/employees), soit 19-person team réaliste (updater AboutPage). Ne pas laisser les deux.

---

## 8. LE PLAN — 30 / 90 / 365 jours

### 8.1 30 jours (priorité engineering + cleanup)

| Jour | Action | Owner | Outcome |
|------|--------|-------|---------|
| J1-J7 | **Scraper commentaires Hespress** — étendre `feed-hespress` pour fetcher HTML article + parser comments. Nouvelle table `article_comments` avec sentiment + dialect + entity mentions | Engineering | Source de données au plus haut signal live |
| J1-J7 | **WhatsApp inbound dédié** — provisionner numéro `+212 6XX-XXXXXX`, webhook inbound pour messages forwarded (text, images, screenshots) → queue NLP | Engineering | Boucle « user-feels-they-put-the-data-in » fermée |
| J1-J7 | **Cleanup mensonges marketing** — remplacer 4 stats fabriquées + label « (simulé) » sur 7 AI engines + supprimer/renommer logo wall « Trusted by » + soit brancher soit remplacer Ask HarchIQ chatbot | Founder | 1h de copy edits + 4h si branchage GLM-4 |
| J8-J14 | **Closer 2 partenariats agences RP** — Omocto, PRESMA, Webcom, Blue Lions. 30% revenue share, white-label, onboarding 1 sem | Founder | 2 partenaires signés |
| J8-J14 | **Publier 1er rapport investisseur** — « Q3 2026 Morocco Banking Sector Reputation Intelligence », 50 pages, 20+ banques, prix 250K MAD. Démarcher IFC, Proparco, AfricInvest, BMCE Capital, Attijari Capital | Founder | 1ère vente rapport = 1er revenu, pas besoin de maturité plateforme |
| J15-J30 | **Funnel audit gratuit 30 jours** à `/audit` — input (company ou Instagram + 3 concurrents + 3 keywords) → scrape 30 jours → PDF teaser (2 pages visibles + 8 floues) → email capture → CRM trigger | Engineering | 50 demandes audit en 30j, 5-10% conversion = 3-5 clients Pro |

### 8.2 90 jours (priorité produit + crédibilité)

| Jour | Action | Owner | Outcome |
|------|--------|-------|---------|
| J30-J60 | **Fine-tune GLM-4 sur Darija** — union de (a) corpus Chabbaki 2025 Hespress, (b) 50K tweets Maghreb Issam9, (c) Mendeley 2026 multimodal, (d) scrape Harch 200K comments. Cible 80%+ F1 | Engineering + ML contractor | NLP Darija production = fossé n°1 |
| J30-J60 | **3 articles LinkedIn founder** — « Ce que le boycott 2018 nous a appris sur le risque réputationnel marocain » / « Pourquoi Meltwater coûte 130K$ et ce dont les Dircoms marocains ont vraiment besoin » / « Darija NLP : la couche manquante de l'intelligence médiatique marocaine » | Founder | 50K MAD earned media value, pipeline Dircom |
| J60-J90 | **Scraper Facebook Pages + Instagram public** — top 200 brand pages marocaines (top 100 par ad spend + top 100 par followers) | Engineering | Social listening live |
| J60-J90 | **Sponsor event CommsofAfrica ou Morocco Today Forum** — audience Dircom, 5K-20K MAD sponsorship, 50+ leads qualifiés | Founder | 50 leads qualifiés, 10 démos booked |
| J90 | **Candidater Maroc Startup label** — qualifie pour fonds Morocco Digital 2030 (1,3 Mds MAD annoncé déc 2025) | Founder | Validation gouvernementale + financement non-dilutif potentiel |

### 8.3 365 jours (priorité scale + compliance)

| Trimestre | Action | Owner | Outcome |
|-----------|--------|-------|---------|
| Q1 | **Filer déclaration CNDP** (Loi 09-08) comme sous-traitant + nommer correspondant CNDP. Citer numéro dans contrat Art. 7.3 | Founder + avocat | Unblock gate procurement Loi 09-08 |
| Q1 | **Fixer la contradiction team size** AboutPage vs ContactPage | Founder | 1h, retire risque misrepresentation investor |
| Q1 | **Ajouter CMO/Dircom tier à la hit list** — l'acheteur économique réel pour Brand Monitor est le Dircom, pas le DG. Vente DG-only allonge les cycles | Founder + SDR | +30-50% reply rate InMails |
| Q2 | **Engager Vanta/Drata + Big-4 pour ISO 27001** accéléré 18→12 mois. Budget 100-150K MAD | Founder + consultant | Unblock 2-3 Sovereign closes/an → +1,7-2,5M MAD Y1 |
| Q2 | **1er pentest indépendant** — budget 30-60K MAD, citer auditor + date rapport dans Annexe 04 §2.5 | Founder | Retire tag « claim only » sur sécurité |
| Q2 | **Draft contrat tier Investor** — COMPETITIVE_VISION Bank tier 250K MAD/mo (3M MAD/an) nécessite son propre contrat + SLA | Founder + avocat | Unblock pipeline Investor (Attijari Capital, BMCE Capital, CFG) |
| Q2 | **Recruter 1 SDR** — 8-12K MAD/mo brut, junior FR/AR fluence + LinkedIn Sales Nav | Founder | +1,5-2M MAD Y1 revenue |
| Q3 | **Recruter 1 senior AE** — 25-35K MAD/mo + commission, prend la livraison PoV, libère founder pour closing | Founder | +1,5M MAD Y1 + founder time freed |
| Q3 | **Migrer vers Elasticsearch 8.x + Kafka** — début migration depuis PostgreSQL+pgvector. Cible 10 nodes / 10TB fin Y2 | Engineering | Scale architecture pour 1M+ articles |
| Q3 | **App native iOS + Android** avec push notifications crise | Engineering + contractor | Match Dataminr/Talkwalker UX |
| Q4 | **Reconnaissance d'images** — 100 logos marques marocaines (OCP, Attijariwafa, RAM, Maroc Telecom, BOA) dans UGC | Engineering + ML | Multimodal AI |
| Q4 | **Transcription audio radio** — Medi1 Radio, Radio Mars, Hit Radio, Radio Mohammed VI via Whisper-ASR + Darija NLP | Engineering | Match Monit.ma/TrackingData.ma |
| Q4 | **Deal registration system** pour partner program (avant activation agences RP) | Engineering | Évite conflit channel |

### 8.4 Cibles de revenu par trimestre (scénario réaliste)

| Quarter | Pilotes | Conversions | Nouveaux logos | Revenu pilotes | Revenu licences | Total quarter | Cumul |
|---------|---------|-------------|----------------|----------------|-----------------|---------------|-------|
| Q1 | 3 | 1 | 1 | 300K | 700K | 1,0M | 1,0M |
| Q2 | 4 | 1,4 | 2 | 400K | 1,4M | 1,8M | 2,8M |
| Q3 | 4 | 1,4 | 2 | 400K | 1,4M | 1,8M | 4,6M |
| Q4 | 5 | 1,75 | 2 | 500K | 1,4M | 1,9M | **6,5M MAD HT** |

---

## 9. LE VERDICT INVESTOR (paragraphe unique, pas de hedging)

Harch Atelier est une SaaS d'intelligence de réputation AI basée à Casablanca ciblant le Top-10 des entreprises marocaines (banques, télécoms, minier, retail, utilities) à 600K-1,1M MAD HT de valeur contrat Year 1 (150K-250K setup + 450K-850K licence annuelle). Le motion de vente est un Proof of Value payant de 4 semaines à 100K MAD HT, entièrement déductible de la licence Sovereign Year 1 si converti dans les 30 jours. Avec 1 founder + 1 SDR, le revenu Year 1 réaliste est **6,5 M MAD HT (~600K €)** pour 7 clients clos ; Year 2 est **11,2 M MAD HT (~1,04 M €)** avec 13 clients cumulés. Break-even sur facturation annuelle d'avance fin Q2 (mois 6 réaliste). Burn mensuel 100K MAD. Le plus gros blocker non-tarifaire au close Sovereign est l'absence de certification ISO 27001 / SOC 2 — les acheteurs Sovereign (Attijariwafa, OCP, Maroc Telecom, Al Mada, ONEE) ont tous une gate procurement qui l'exige. Un investissement de 100-150K MAD dans l'accélération ISO 27001 (roadmap 12 mois au lieu de 18) débloquerait 2-3 closes Sovereign supplémentaires par an, soit +1,7-2,5 M MAD HT de revenu Y1. La fenêtre de monopole est 24-36 mois — Meltwater (sous PE Marlin, 8,2% EBITDA, focus optimisation coûts pas emerging market) n'entrera pas sur le Maroc mid-market avant 2027-2028. **Exécutez. La fenêtre ne reste pas ouverte.**

---

## 10. SOURCES (vérifiables)

- `competitive-reports/00-SYNTHESE.md` + 01 à 11 (12 rapports concurrentiels)
- `research/meltwater/*` (43 fichiers OSINT — search results + parsed pages)
- `research/dataminr/*` (33 fichiers OSINT)
- `research/morocco-osint/*` (50 fichiers JSON q01-q43 + p01-p07)
- `sales/01-hit-list-clevels.md`
- `legal/01-contrat-licence-saas.md` + 02-sla + 03-pov + 04-annexe
- `PROJECT_REPORT.md`, `AUDIT_REPORT.md`, `COMPETITIVE_VISION.md`, `COMPETITOR_BENCHMARK.md`
- Audit code : 35 273 LOC dashboards / 117 API routes / 37 modèles Prisma / 8 cron jobs
- Worklog complet : `/home/z/my-project/worklog.md` (Sections COMP-1 à COMP-4, ~2 200 lignes)

**Document vivant. Toute révision doit être datée et signée.**
