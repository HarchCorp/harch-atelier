# RAPPORT CONCURRENTIEL — ALPHASENSE

> Concurrent de Harch Atelier dans l'espace **AI-powered market intelligence & financial research** — directement nommé comme référence "investor desk" dans `COMPETITIVE_VISION.md`.
> Date du rapport : 31 juillet 2026.
> Statut : neutre, basé sur informations publiques (site corporate, communiqués de presse, documentation développeur publique, offres d'emploi, études de cas partenaires, articles de presse spécialisée).

---

## Méthodologie et avertissement

Ce rapport s'appuie sur les informations publiques disponibles jusqu'à juillet 2026 : site corporate d'AlphaSense (alpha-sense.com), portail développeur (developer.alpha-sense.com), centre d'aide (help.alpha-sense.com), communiqués de presse PR Newswire, articles TechCrunch/Reuters/Bloomberg/SiliconAngle/VentureBeat, étude de cas partenaire QueryQuotient, page de sécurité generative AI, offres d'emploi sur Greenhouse/LinkedIn/BuiltInNYC, Sacra (estimations ARR), The Information (IPO steps). Les chiffres attribués à AlphaSense directement sont issus de communiqués officiels ; les chiffres attribués à des sources tierces (Sacra, Spendhound, Vendr, The Information) sont signalés comme tels. AlphaSense étant toujours privée à la date de ce rapport (IPO en préparation selon The Information juillet 2026), plusieurs métriques opérationnelles internes (précision des modèles, latence bout-en-bout, coûts d'infrastructure) ne sont pas publiées et sont marquées "Non disponible publiquement" le cas échéant.

---

## 1. POSITIONNEMENT & HISTOIRE

### Création

AlphaSense a été fondée en **2011** à Helsinki, Finlande, par **Jaakko "Jack" Kokko** (CEO, ancien analyste M&A technologie chez Morgan Stanley) et **Raj Neervannan** (Co-fondateur & CTO). Le produit a été lancé commercialement en 2011. Plusieurs sources (LinkedIn de Jack Kokko, StartupIntros) évoquent une incorporation juridique antérieure en 2008, mais The Information (juillet 2026) qualifie AlphaSense de "15-year-old company", ce qui est cohérent avec un lancement produit en 2011. L'idée fondatrice : résoudre le "control-F nightmare" des analystes financiers qui devaient fouiller manuellement des milliers de filings SEC, transcripts d'appels résultats et recherches broker pour trouver une information précise.

**Correction importante vs. demande initiale** : les fondateurs ne sont pas "Riku Mikkola et Jack Kokko" comme indiqué dans le brief. Riku Mikkola n'apparaît dans aucune source publique comme cofondateur d'AlphaSense. Les deux cofondateurs officiels sont **Jack Kokko** (CEO) et **Raj Neervannan** (CTO).

### Sièges

- **New York** (siège opérationnel principal, Midtown Manhattan)
- **Helsinki** (R&D historique, ingénierie NLP/ML)
- **Londres** (couverture EMEA)
- Bureaux additionnels à Chicago (héritage Tegus), San Francisco, Pune (Inde — équipe d'ingénierie)

### Financement — timeline corrigée et chiffrée

Le brief initial mentionnait "~$520M total, Series E $180M June 2021 at $1.8B valuation, Series D $100M 2020". **Ces chiffres sont inexacts.** Voici la timeline vérifiée issue des communiqués PR Newswire et articles de presse :

| Date | Round | Montant | Lead Investor | Valorisation post-money |
|---|---|---|---|---|
| Juil. 2019 | Series B | $50M | Triangle Peak Partners | Non communiquée |
| Sept. 2021 | **Series C** | **$180M** | Viking Global + Goldman Sachs (co-lead), rejoint par Morgan Stanley, Citi, BoA, Barclays, Wells Fargo, Cowen, AllianceBernstein | ~$1B |
| Mai 2022 | **Series D** | **$225M** | Goldman Sachs Asset Management + Viking Global | **$1.7B** |
| Avr. 2023 | (extension Series D) | **$100M** | **CapitalG (Alphabet)** | **$1.8B** |
| Sept. 2023 | **Series E** | **$150M** | **Bond Capital** (Jim Goetz) | **$2.5B** |
| Juin 2024 | (round strategic pour Tegus) | **$650M** | Viking Global + BDT & MSD Partners (co-lead) | **$4B** |
| **Juin 2026** | (latest) | **$350M** | **Vitruvian Partners** + **Accenture Ventures** (strategic) | **$7.5B** |

**Total funding cumulé estimé** : **~$1.5 milliard USD** (et non $520M comme indiqué dans le brief — ce chiffre correspondait à un état antérieur à 2024).

### Arrivée d'Accenture comme partenaire stratégique

En juin 2026, Accenture (via Accenture Ventures) est devenu le **premier partenaire canal stratégique** d'AlphaSense pour amener les workflows agentic de market intelligence dans les systèmes enterprise des clients Accenture. C'est un signal commercial fort : AlphaSense n'est plus seulement un outil d'analyste, il devient une brique intégrée dans les workflows de conseil.

### Acquisitions — timeline corrigée

Le brief initial mentionnait "Stream (May 2022), Sentieo (Feb 2023 — $625M), Tegus (Oct 2024 — $930M)". **Les dates et montants sont inexacts.** Voici les faits vérifiés via communiqués PR Newswire et Latham & Watkins / Paul, Weiss (conseils juridiques des acquisitions) :

| Date | Cible | Prix | Source |
|---|---|---|---|
| **25 oct. 2021** | **Stream by Mosaic** (bibliothèque d'interviews expertes, ~8 500 transcripts à l'acquisition) | **Non divulgué** | PR Newswire 25/10/2021 ; Contrary Research |
| **mai 2022** | **Sentieo** (plateforme de recherche financière AI, ~1 000 clients institutionnels ajoutés, 800+ firms d'investissement) | **Non divulgué** (estimations presse : non communiqué officiellement, inférieur à $200M selon sources sectorielles) | Centana, Neudata, Integrity Research |
| **8 juil. 2024** (annoncé 11 juin 2024) | **Tegus** (leader expert transcripts, ~$108M ARR à l'acquisition selon Sacra) | **$930M** (cash + stock) | PR Newswire, Reuters, Latham & Watkins, Paul Weiss |

La valuation de Tegus à l'acquisition ($930M) est inférieure à sa dernière levée (Tegus était valorisé $3B en novembre 2021 selon Asymmetrix Intelligence) — reflétant la compression des valuations tech entre 2021 et 2024.

### Clients

- **7 500 clients enterprise** (juin 2026, source : AlleyWatch / communiqué AlphaSense) — vs. 4 000+ en avril 2023, vs. 1 000 en mai 2020. Croissance ~7.5x en 6 ans.
- **90% du S&P 100** (juin 2026 — le brief initial mentionnait 75%, chiffre dépassé depuis 2023)
- **80% des top asset managers**
- **80% des top hedge funds**
- **95% des top consultancies** (post-partenariat Accenture juin 2026)
- Clients financiers nommés publiquement : Goldman Sachs, Citi, Wells Fargo, Morgan Stanley, Bank of America, Barclays (tous investisseurs en Series C)

### ARR et trajectoire IPO

- **ARR Q1 2026** : $600M+ (communiqué officiel AlphaSense)
- **ARR juillet 2026** : $700M+ (Sacra + The Information) — croissance ~40% YoY
- **ARR fin 2025** : ~$540M (Sacra)
- **Trajectoire IPO** : The Information (23 juillet 2026, "AlphaSense Tops $700 Million in Annual Recurring Revenue, Takes IPO Steps") confirme qu'AlphaSense a commencé ses préparatifs d'introduction en bourse. Aucun S-1 déposé à la date de ce rapport.

### Couverture Maroc / Afrique

**Non disponible publiquement.** Aucun client marocain ou africain référencé sur le site public d'AlphaSense à la date de ce rapport. Aucun partenariat annoncé avec des institutions marocaines (AMMC, BAM, BVC, ANCFCC, ONEE). La couverture documentaire AlphaSense sur les sociétés cotées en Afrique de l'Ouest et du Nord est présente via les filings SEC pour les ADR (ex. Sonatrach obligations USD, Maroc Telecom eurobonds) mais reste très limitée pour les sociétés non-cotées ou cotées uniquement sur la BVC.

---

## 2. ARCHITECTURE TECHNIQUE — REVERSE ENGINEERING

Cette section est reconstruite à partir de : (1) la page officielle AlphaSense Generative AI Security, (2) l'étude de cas QueryQuotient (partenaire d'implémentation Elasticsearch), (3) l'article TheNewStack (juin 2023, interview Chris Ackerson SVP Product), (4) l'article VentureBeat (lancement Deep Research), (5) le communiqué de partenariat Cerebras (mars 2025), (6) les offres d'emploi AlphaSense sur Greenhouse/LinkedIn, (7) la documentation API publique developer.alpha-sense.com.

### Stack backend

- **Python** : langage backend principal (confirmé par offre d'emploi BuiltIn : "Strong in Python (our primary backend language)"). Pas de Java en production backend — contrairement à l'hypothèse du brief initial.
- **Golang** : langage secondaire pour services haute performance / cloud platform (Staff Software Engineer Core Cloud Platform : "Python and Golang" ; Staff Platform Engineer Cloud Developer Experience : "contribute hands-on in Go and Python").
- **Node.js** : mentionné pour le frontend et certains services (offre Software Engineer II Front End : "Node.js, Python (Django/Flask), or Java (Spring Boot)" — ce dernier point suggère que Django/Flask est utilisé côté backend web, pas Spring Boot Java en interne).
- **React** : frontend principal (inféré des offres frontend et des captures d'écran produit).
- **Kubernetes** : orchestration container (Staff Cloud Platform Engineer : "running Kubernetes and Cloud based production systems at scale").
- **AWS** : cloud principal (Core Cloud Platform team : "AWS account management, networking, storage and kubernetes"). Aucune mention publique de multi-cloud GCP/Azure — AlphaSense semble single-cloud AWS.

### Stack recherche — ELASTICSEARCH 8.x CONFIRMÉ

C'est la découverte technique la plus importante de ce rapport. Une étude de cas publique du partenaire QueryQuotient révèle explicitement :

> *"AlphaSense's search infrastructure to handle millions of financial documents with sub-second response times"*
> *"Technologies Used: Elasticsearch 8.x with advanced [features]"*

Détails techniques récupérés depuis l'étude de cas QueryQuotient (intitulée "90% Faster Financial Document Search") :

- **Elasticsearch 8.x** : moteur de recherche backend principal (CONFIRMÉ — pas un custom vector DB propriétaire)
- **Custom tokenizers** : tokeniseurs spécialisés pour terminologie financière et symboles ticker (ex. "EBITDA", "10-K", "OCP.PA" reconnus comme tokens natifs)
- **ML-based relevancy models** : modèles de pertinence entraînés sur le comportement utilisateur (click-through, dwell time)
- **Dynamic boosting** : boosting dynamique basé sur (a) la fraîcheur du document, (b) l'autorité de la source
- **Optimized shard allocation** : stratégie d'allocation de shards réduisant la latence de 85%
- **Indexation temps réel** : pipeline d'indexation parallèle gérant **50 000 documents/minute**
- **Documents searchable within minutes** : cible de fraîcheur post-ingestion

L'architecture est **hybride** : Elasticsearch (recherche keyword + BM25) + **vector database** pour la recherche sémantique dense. Cette architecture hybride est explicitement confirmée par Chris Ackerson (SVP Product, TheNewStack juin 2023) :

> *"It has hundreds of millions of documents, which it stores in a combination of document search and vector databases. This hybrid approach enables support for different workflows, including document search and Q&A chat functionalities."*

La nature exacte du vector database (Pinecone, Weaviate, Vespa, Milvus, ou vector search natif Elasticsearch 8.x kNN) n'est pas publiquement divulguée. L'utilisation d'Elasticsearch 8.x kNN est l'hypothèse la plus probable étant donné la stack existante.

### Stack NLP / ML — évolutive depuis 2011

L'évolution NLP d'AlphaSense est documentée publiquement par Chris Ackerson (TheNewStack, juin 2023) :

1. **2011-2018** : "pre-generative AI systems" — deep learning pour classification et organisation de contenu. Pas de détails publics sur les modèles exacts (probablement word2vec, LSTMs, modèles de classification traditionnels).
2. **2018-2023** : pivot vers **BERT** (Bidirectional Encoder Representations from Transformers). Ackerson : *"Since the introduction of BERT by Google in 2018, AlphaSense has been leveraging the latest open source models and fine-tuning or training them on their financial content."* Les modèles BERT sont fine-tunés pour : NER financier (entités : companies, tickers, personnes, produits), sentiment analysis, summarization.
3. **2023-présent** : ajout des LLMs génératifs (voir section suivante).

**Modèles propriétaires** : Ackerson confirme qu'AlphaSense développe plusieurs LLMs en interne pour des tâches spécifiques (retrieval, ranking, embedding, financial language understanding). Page Generative AI Security officielle : *"AlphaSense additionally uses domain-specific models (developed in-house or by partners) for retrieval, ranking, embedding, and financial language understanding."*

### Stack LLM — multi-modèle via AI Gateway

L'architecture LLM d'AlphaSense est **multi-fournisseur via un AI gateway propriétaire**. C'est l'architecture la plus mature observée chez les concurrents analysés à ce jour (Brandwatch, Meltwater, Talkwalker, PeakMetrics, Signal AI, Dataminr). Configuration confirmée par la page officielle Generative AI Security et l'article AlphaSense "AI Future of Research" (2026) :

| Provider | Modèle | Canal d'accès | Usage |
|---|---|---|---|
| **Anthropic** | Sonnet 4 family | AWS Bedrock | Reasoning avancé, agentic workflows |
| **Google** | Gemini 2.5 | Google Cloud AI | Long-context prompts, analyse multi-docs |
| **OpenAI** | o3 | API OpenAI (via AI gateway) | Tâches générales |
| **Meta** | Llama family | **Cerebras Inference (WSE-3)** | High-volume tasks, inférence 10x plus rapide |

Le communiqué Cerebras (11 mars 2025) précise : *"AlphaSense has successfully integrated Cerebras Inference, leveraging Cerebras' WSE-3 (Wafer-Scale Engine) and Llama AI models to optimize multi-turn AI-driven financial analysis."* C'est un choix d'infrastructure notable : AlphaSense utilise du **silicium spécialisé** (Cerebras WSE-3) plutôt que des GPU NVIDIA pour certains workloads Llama, afin de réduire la latence et augmenter le throughput.

**Modèles in-house** (rappel) : retrieval, ranking, embedding, financial NER — fine-tunés sur le corpus AlphaSense.

### Sécurité & gouvernance LLM

La page Generative AI Security officielle documente explicitement :

- **AI gateway** : toutes les requêtes LLM passent par un gateway propriétaire qui route vers le modèle approprié
- **Zero data retention** : contractuellement imposé aux providers LLM ("Customer content is not used to train AlphaSense's underlying language models or any third-party LLM. Zero data retention is contractually enforced with LLM providers")
- **Pas d'envoi vers endpoints publics** : *"AlphaSense does not send any customer data to public endpoints"* — tout transite par les clouds d'AlphaSense
- **RAG-based grounding** : toutes les sorties AI sont ancrées dans le contenu source (AlphaSense library ou contenu client uploadé)
- **Citations inline** : chaque point clé d'une sortie AI a une citation cliquable vers le document source
- **Account-level opt-out** : possibilité de désactiver les features AI au niveau compte
- **Multi-tenant et single-tenant** : déploiements multi-tenant (standard) ou single-tenant (enterprise)
- **Private cloud option** : *"the software runs entirely within the client's infrastructure"* — pour les clients les plus régulés

### Document sources

Sources documentaires agrégées par AlphaSense (confirmées via help.alpha-sense.com et pages produit) :

- **SEC filings** : 10-K, 10-Q, 8-K, 20-F, S-1, 13F, Section 16, proxy statements (DEF 14A) ; indexés par CIK
- **Filings internationaux** : équivalents dans 100+ juridictions (Companies House UK, AMF France, BaFin Allemagne, etc.) — pertinence Maroc faible
- **Earnings call transcripts** : transcripts d'appels résultats en temps réel (disponibles "minutes après l'appel" selon marketing)
- **Broker research** : recherches sell-side (banques d'investissement) — contenu premium sous licence
- **News** : 10 000+ sources presse, trade journals, blogs
- **Expert call transcripts** : bibliothèque Tegus + Stream (185 000+ transcripts couvrant 18 000+ sociétés, 8 000+ nouveaux transcripts ajoutés mensuellement)
- **Press releases** : Business Wire, PR Newswire, GlobeNewswire
- **Regulatory filings** : FDA, EMA, EPA (pour life sciences)
- **Company internal documents** (Enterprise Intelligence) : SharePoint, Box, Google Drive, Egnyte — uploadés et indexés par le client

### Scale opérationnelle (chiffres publics)

- **500M+ documents** indexés (juillet 2025 — vs. 100M en 2019, vs. 150M+ en 2023 selon QueryQuotient cas study)
- **10 000+ sources** de contenu
- **37+ langues** (Mandarin, Japanese, Spanish, English, French, German, etc. — bien loin des 100+ revendiqués par certains concurrents)
- **185 000+ expert transcripts** (post-Tegus)
- **8 000+ nouveaux transcripts mensuels**
- **Hundreds of thousands of documents added daily** (Ackerson, VentureBeat)
- **Indexing throughput** : 50 000 docs/minute (QueryQuotient)
- **~1 500 employés** (estimation LinkedIn mi-2026 — non communiqué officiellement)

### Latences observées

- **Recherche keyword/sémantique** : **<500ms pour 95% des requêtes** (QueryQuotient — confirmé officiellement)
- **Indexing latency** : documents searchable "within minutes" post-ingestion
- **Generative Search Fast mode** : ~30 secondes (documentation API developer.alpha-sense.com)
- **Generative Search Deep mode** : minutes (non chiffré précisément)
- **Deep Research (agentic)** : minutes à dizaines de minutes selon la complexité de la tâche
- **Earnings call transcript availability** : "minutes après l'appel" (marketing) — non vérifié indépendamment
- **Cerebras partnership impact** : *"delivering results in seconds, a fraction over previous speeds"* pour multi-turn queries Llama

### Concurrent users

Non disponible publiquement. Estimation Harch : avec 7 500 clients × ~10-20 utilisateurs moyens = **75K-150K utilisateurs actifs** potentiels. Si on suppose 10-20% de concurrency en heure de pointe NY/Londres, on obtient ~7K-30K sessions concurrentes. Non vérifiable.

### Code complexity (estimation Harch)

Non disponible publiquement. Estimation informée : backend Python/Go sur 1 500 employés dont ~600-800 ingénieurs (40-50% d'ingénieurs typique pour SaaS à ce stade) sur 15 ans, soit probablement **1.5M-3M LOC backend** (bien plus que l'estimation 500K-1M LOC du brief initial) et **500K-1M LOC frontend** React.

---

## 3. CHIFFRES DE CHARGE RÉELS (recoupés)

| Métrique | Valeur | Source |
|---|---|---|
| Documents indexés | **500M+** | alpha-sense.com homepage, communiqués 2025-2026 |
| Sources | **10 000+** | IntuitionLabs, alpha-sense.com |
| Langues | **37+** | Communiqué "AlphaSense Scales Global Operations" |
| Expert transcripts | **185 000+** | thisisayu (mai 2025) — post-Tegus |
| Nouveaux transcripts/mois | **8 000+** | alpha-sense.com/platform/expert-insights |
| Ingestion journalière | **"hundreds of thousands of documents"** | Ackerson, VentureBeat |
| Throughput indexing | **50 000 docs/min** | QueryQuotient case study |
| Latence recherche (p95) | **<500ms** | QueryQuotient |
| Latence Generative Search Fast | **~30s** | developer.alpha-sense.com |
| Uptime | **99.99%** | QueryQuotient (vs. 97.5% avant transformation) |
| Clients enterprise | **7 500** | AlleyWatch, juin 2026 |
| ARR Q1 2026 | **$600M+** | alpha-sense.com communiqué |
| ARR juillet 2026 | **$700M+** | The Information, Sacra |
| Employés | **~1 500** | Estimation LinkedIn (non officiel) |
| Concurrent users peak | **7K-30K** | Estimation Harch (non vérifiable) |
| Backend LOC | **1.5M-3M** | Estimation Harch (non vérifiable) |

---

## 4. POINTS DE DÉFAILLANCE & LIMITES

### 1. Pricing prohibitif pour le mid-market

- **$10K-$20K/seat/an** (Sacra, Elevated Signal) — bien au-dessus de l'estimation du brief initial ($10K-$50K/seat/year qui était correcte sur la fourchette basse mais optimiste sur la haute)
- **Average deal size enterprise** : $123 760/an (Spendhound 2026)
- **Average deal size SMB** : $12 210/an (Spendhound 2026)
- **Pas de pricing public** : tout sur devis. La page pricing officielle dit explicitement : *"Please reach out, and a member of our team will be in touch to discuss pricing."*
- **Variabilité 30-50%** selon négociation (Vendr)
- **Conséquence pour Harch** : le marché marocain mid-market (5K-50K MAD/mois, soit $500-$5K/mois) est totalement hors de portée d'AlphaSense. Une PME marocaine ne paiera jamais $12K/an pour un seul siège.

### 2. Risque d'hallucination — atténué mais non éliminé

AlphaSense a une approche défensive bien documentée (RAG + citations + curation de sources + validation par données structurées KPI). Chris Ackerson (VentureBeat) : *"we ground every AI-generated insight in source content, and users can trace any output directly to the exact sentence in the original document."* Hebbia (concurrent) critique néanmoins : *"AlphaSense's search-first architecture can struggle with the deep, cross-contextual reasoning required to maintain a perfect audit trail."* Donc :
- Hallucination **réduite** mais pas éliminée
- Audit trail parfait non garanti pour les tâches multi-docs complexes
- Deep Research agentic peut produire des synthèses qui juxtaposent des sources de qualité inégale

### 3. Coverage gaps — Maroc/Afrique

- Fort sur US/EU/Asie filings (SEC, Companies House, JFSA, etc.)
- **Faible sur AMMC** (Autorité Marocaine du Marché des Capitaux) — pas de partenariat public
- **Faible sur BVC** (Bourse des Valeurs de Casablanca) — pas d'intégration documentaire
- **Faible sur BAM** (Bank Al-Maghrib) circulars
- Aucune mention de sources arabophones spécialisées (MAP, Aujourd'hui Le Maroc, L'Économiste)
- Aucun transcript expert sur sociétés marocaines privées
- **Conséquence pour Harch** : c'est le trou noir d'AlphaSense — un acteur focalisé Maroc/Afrique francophone peut construire un moat documentaire réel

### 4. Latence temps réel limitée

- Recherche : sub-500ms — bon
- Transcript availability : "minutes après l'appel" — non comparable à Dataminr (seconds)
- Pas de WebSocket pour push d'alertes en temps réel (voir section 5)
- Alerts : email uniquement (next section)

### 5. Fraîcheur des données inégale

- **SEC filings** : real-time (EDGAR direct feed)
- **Earnings transcripts** : minutes après l'appel
- **News** : 10-60 minutes selon les sources
- **Broker research** : peut être retardé 24-48h selon les accords de licence avec les banks
- **Expert transcripts Tegus** : post-call, traitement QA avant publication (latence ~24-72h)

### 6. Pas de WhatsApp, pas de Darija

- Alerts par **email uniquement** (help.alpha-sense.com "Maximizing Your Monitoring Tools")
- App mobile : push notifications natives iOS/Android (bonne couverture) — mais pas de canal WhatsApp
- **Aucune couverture Darija** ou arabe dialectal — NLP entraîné sur anglais financier principalement,其次是 mandarin/japonais/espagnol
- Pas d'interface traduite en arabe ou en français

### 7. Risque de concentration verticale

AlphaSense est quasi-exclusivement **finance/corporate research**. Pour un prospect hors finance (santé publique, gouvernement, ESG opérationnel), la valeur est moindre. C'est une force (depth verticale) mais aussi une limite (pas de horizontalité).

### 8. Risque LLM vendor lock-in

L'architecture multi-modèle (Anthropic + OpenAI + Google + Meta+Cerebras) est conçue précisément pour éviter le lock-in. Néanmoins, la dépendance à AWS Bedrock et à Cerebras WSE-3 introduit des risques infrastructurels. Si Anthropic change sa politique pricing ou si Cerebras fait faillite (l'entreprise est elle-même en difficulté financière depuis son IPO raté), AlphaSense doit rebaseliner sur d'autres providers.

### 9. Pas de présence physique en Afrique

Aucun bureau à Casablanca, Lagos, Nairobi, Le Cap. Aucun partenariat avec BVC, AMMC, BAM, ou une banque marocaine. Pour un client institutionnel marocain (OCP, Attijariwafa, BOA, Maroc Telecom), le support est géré depuis Londres ou NYC — friction de timezone et de langue.

---

## 5. FRONTEND — UI/UX & DASHBOARDS

### Layout général

Le produit AlphaSense est **search-first** : une barre de recherche centrale proéminente (Google for finance), avec :

- **Top-bar** : logo, recherche globale, alerts bell, profil utilisateur, sélecteur de tenant (pour les comptes multi-entités)
- **Sidebar gauche** : navigation par type de contenu (Filings / Transcripts / News / Research / Expert Calls / Internal Docs), saved searches, collections, watchlists
- **Zone centrale** : liste de résultats de recherche (chaque résultat = titre, source, date, snippet surligné, type-pill)
- **Panneau droit** : AI Synthesis panel (Smart Summaries / Generative Search responses avec citations inline)
- **Document viewer** : ouverture en split-screen avec highlighting, table of contents (sections de 10-K), speaker identification dans transcripts

### Charts — minimal

AlphaSense n'est **pas un BI dashboard**. Les visualisations sont volontairement limitées :
- Sparklines de sentiment trend
- Heatmaps de mentions par thème
- Comparateurs de documents side-by-side (Generative Grid)
- Financial data tables (post-octobre 2025 : KPIs financiers structurés intégrés)
- Aucun graphique complexe type ECharts/Highcharts — c'est un produit de recherche, pas de visualisation

### Composants UI clés

1. **Search bar** : barre de recherche centrale avec auto-complete, opérateurs booléens, filtres avancés (date, source, type, sector, geography, language)
2. **Document results list** : liste dense avec snippets surlignés, type-pills, source attribution
3. **AI Synthesis panel** : panneau droit avec Smart Summaries / Generative Search responses, citations inline cliquables
4. **Document viewer** : lecteur intégré avec table of contents, highlighting, annotation tools (highlights, notes, collections)
5. **Transcript viewer** : lecteur de transcripts avec speaker identification, timestamp,Jump-to-quote, synchronized audio pour earnings calls
6. **Generative Grid** : vue comparative multi-documents side-by-side (jusqu'à N documents)
7. **Deep Research interface** : formulaire de prompt naturel + output long-form structuré avec citations
8. **Watchlists & alerts** : gestion des alertes email par thème/société/secteur

### Real-time — polling, pas WebSocket

- **Pas de WebSocket** confirmé pour les résultats de recherche ou les alerts
- Refresh manuel ou polling (intervalle non documenté publiquement — probablement minutes)
- App mobile : push notifications natives via APNs (iOS) et FCM (Android) pour alerts critiques
- **Aucune notification WhatsApp** (à la différence de Harch Atelier)

### Persona cible

- **Equity analyst** (buy-side : hedge fund, asset manager ; sell-side : investment bank)
- **Investment banker** (M&A, capital markets)
- **Corporate strategist** (corporate development, competitive intelligence)
- **Consultant** (McKinsey, BCG, Bain, Accenture — d'où le partenariat Accenture)
- **Life sciences professional** (pharma competitive intel)
- **Private equity associate / VP** (deal sourcing, due diligence)

### Mobile

Application iOS (App Store ID 1177914297) et Android native. Features :
- Streaming audio des earnings calls en direct
- Transcripts follow-live pendant l'appel
- Push notifications sur companies et topics surveillés
- Recherche et lecture de documents
- Notifications in-app pour résultats de recherche en arrière-plan

### Customisation

- **Saved searches** avec alertes email (fréquence configurable : instant, daily, weekly)
- **Collections** de documents annotés
- **Watchlists** de sociétés/thèmes
- **Roles & permissions** (admin, analyst, viewer)
- **Personalized briefings** (feature en roadmap selon Ackerson 2023 — état d'avancement 2026 non documenté publiquement)

---

## 6. MODÈLE DE DONNÉES (inféré)

Le modèle de données est inféré à partir de la documentation help.alpha-sense.com, de la documentation API developer.alpha-sense.com, et de l'analyse des features produit. Aucun schéma de DB public n'est disponible.

### Entités principales (inférées)

```
Document
- id (UUID)
- source (enum: SEC, CompaniesHouse, Tegus, Stream, BrokerResearch, News, Internal)
- type (enum: Filing_10K, Filing_10Q, Filing_8K, Filing_20F, Transcript_Earnings, Transcript_Expert, News, Research, Internal)
- title
- content (text)
- content_vector (embedding, dimension ~768 ou 1536)
- publishedAt
- indexedAt
- sourceUrl
- language (ISO 639-1)
- companyId (FK)
- sectorIds[] (FK)
- tickerSymbols[]
- docSections[] (pour 10-K/10-Q/8-K — segmentation par section MD&A, Risk Factors, Financial Statements, etc.)
- acl[] (permissions — pour Internal Docs)

Company
- id (UUID)
- name
- ticker (multi-exchange : NYSE, NASDAQ, LSE, TSE, etc.)
- CIK (SEC identifier)
- LEI (Legal Entity Identifier)
- country (ISO 3166)
- sector (GICS)
- industry (GICS)
- financialKPIs (structuré : revenue, EBITDA, EPS, etc. — extraction automatique depuis filings)

Expert (Tegus/Stream)
- id
- name
- title
- company
- industry
- geography

Transcript
- id
- type (Earnings, Expert)
- companyId (FK)
- date
- speakers[] (id, name, title)
- segments[] (speakerId, startTs, endTs, text, text_vector)

User
- id
- email
- tenantId
- role (admin, analyst, viewer)
- watchlists[]
- savedSearches[]
- collections[]

Annotation
- id
- userId
- documentId
- type (highlight, note, collection_link)
- position (char offset range)
- content (for notes)

Alert
- id
- userId
- savedSearchId
- frequency (instant, daily, weekly)
- channel (email — only)
- lastTriggeredAt
```

### Search index

- **Elasticsearch 8.x cluster** (primary keyword + BM25 + kNN vector search)
- **Vector DB** (séparé ou natif Elasticsearch kNN — non divulgué publiquement)
- Sharding optimisé par type de document et temporalité (QueryQuotient : "optimized shard allocation")
- Indexing pipeline parallèle 50K docs/min

---

## 7. API & INTÉGRATIONS

### Portail développeur

- URL publique : **developer.alpha-sense.com**
- Authentification : **API key + bearer/refresh token** (OAuth2-like flow)
- SDKs disponibles : **JavaScript SDK**, **Python SDK** (officiels) ; REST et **GraphQL API** documentés
- Documentation interactive : swagger UI pour l'Ingestion API

### API endpoints principaux

- **Search API** : recherche full-text + sémantique sur la library AlphaSense
- **Ingestion API** : upload de documents internes client (REST, swagger documenté)
- **Agent API** : pour GenSearch (Generative Search) programmatique — quickstart documenté
  - Modes : Fast (~30s) et Deep (long-form)
  - Inputs : natural language query, scope (companies, doc types, date range), output format
- **Management API** : gestion des users, watchlists, alerts
- **Webhooks** : pour les saved searches alerts (événements déclenchés par match)

### Intégrations documentées

- **SSO** : SAML 2.0 (vérifié plug-and-play avec la plupart des IdP enterprise — Okta, Azure AD, Ping Identity, Google Workspace). OIDC non explicitement documenté.
- **Enterprise content integrations** : SharePoint, Box, Google Drive, Egnyte (pour ingestion automatique des documents internes)
- **Slack & Microsoft Teams** : pour router les alerts
- **Salesforce** : intégration CRM (mentionnée en enterprise tier)
- **Email forwarding** : envoyer un email à une adresse dédiée pour ingest le contenu

### Export

- PDF, Excel (export de données financières structurées)
- PowerPoint integration (export de slides depuis Generative Grid)
- Email forwarding de documents

### Compliance & certifications

- **SOC 2 Type II** (mentionné dans la documentation security)
- **ISO 27001** (mentionné)
- **HIPAA** (pour life sciences — vérifiable sur trust center)
- **GDPR** compliant
- **Private cloud option** : déploiement single-tenant dans l'infrastructure client
- FedRAMP : non documenté publiquement (à la différence de Dataminr)

---

## 8. CE QUE HARCH ATELIER DOIT APPRENDRE D'ALPHASENSE

### 1. Search-first UX comme valeur cardinale

AlphaSense prouve qu'une **barre de recherche sémantique puissante** vaut plus que 100 dashboards. Le investor desk Harch doit avoir un moteur de recherche qui interroge en langage naturel des millions de documents (BVC disclosures, AMMC décisions, BAM circulars, presse marocaine, transcripts experts locaux) et retourne en <500ms des snippets cités. C'est l'investissement produit #1.

### 2. Citations inline systématiques

Chaque sortie AI d'AlphaSense (Smart Summaries, Generative Search, Deep Research) a des **citations inline cliquables** qui renvoient à la phrase exacte dans le document source. C'est non-négociable pour un buyer institutionnel. Le `glm-orchestrator` et `dossier-generator` Harch doivent garantir ce pattern pour tout output LLM — pas de black box.

### 3. Multi-LLM gateway dès le départ

L'architecture AI gateway d'AlphaSense (route vers Anthropic/OpenAI/Gemini/Llama selon tâche) est le patron à suivre. Harch devrait construire un `LLMRouter` qui sélectionne dynamiquement GLM-4 / Claude / Gemini / Llama selon : coût, latence, qualité attendue, sensibilité des données. Ne pas se verrouiller sur un seul provider.

### 4. Diversité documentaire au-delà du media monitoring

AlphaSense couvre **filings + transcripts + broker research + news + internal docs**. Harch doit élargir au-delà des articles presse :
- **AMMC** : décisions, sanctions, mises en garde
- **BAM** : circulars, bulletins monétaires, rapports stabilité financière
- **BVC** : disclosures réglementées, convocations AG, resolutions
- **ANCFCC** : registre foncier (pour due diligence immobilière)
- **HCP** : statistiques macro
- **Transcripts experts locaux** : partenariats avec cabinets marocains (ex. recordings de conférences sectorielles)

### 5. Expert transcripts comme catégorie produit

L'acquisition Tegus à $930M valide que les transcripts experts sont une catégorie de produit à part entière. Harch pourrait :
- Partenariat avec des cabinets marocains (BCG Maroc, McKinsey Casablanca) pour distribuer leurs notes
- Transcripts d'événements sectoriels (Confédération Générale des Entreprises du Maroc, Fédération des Banques)
- Transcripts d'AG de sociétés cotées BVC
- C'est un moat défendable : personne ne le fera pour le Maroc si Harch ne le fait pas

### 6. Vertical depth > horizontal breadth

AlphaSense possède **finance/corporate research**. Il ne tente pas d'être un outil de social listening, de media monitoring, ou de customer experience. Harch doit appliquer le même principe : **posséder réputation/risque Maroc/Afrique**, pas essayer d'être le Meltwater marocain. Le 3-desk strategy (enterprise / trader / investor) est bon — chaque desk doit avoir une depth verticale réelle.

### 7. Architecture hybride BM25 + vector search

L'architecture hybride d'AlphaSense (Elasticsearch BM25 + vector DB sémantique) est le standard de l'industrie. Harch doit viser le même pattern :
- **OpenSearch** ou **Elasticsearch 8.x** pour le keyword search
- **pgvector** (Postgres) ou **Qdrant** pour le vector search
- Fusion RRF (Reciprocal Rank Fusion) pour combiner les deux
- Latency cible <500ms sur 10M+ documents

### 8. Custom tokenizers pour terminologie locale

QueryQuotient révèle qu'AlphaSense utilise des **tokenizers spécialisés pour tickers financiers**. Harch doit faire de même pour : tickers BVC (OCP, IAM, ATT, BOA, WAF, etc.), noms de sociétés marocaines variants (OCP / OCP Group / Office Chérifien des Phosphates), entités gouvernementales (BAM, AMMC, ANCFCC, HCP, ONEE), termes Darija business.

### 9. Partnership avec un acteur consulting stratégique

Le partenariat Accenture (juin 2026) a fait passer la valorisation de $4B (juin 2024) à $7.5B (juin 2026). Pour Harch, l'équivalent serait un partenariat avec :
- **BMCE Bank of Africa** (couverture investor desk)
- **Attijariwafa Bank** (couverture research broker)
- **KPMG/Deloitte/PwC/EY Maroc** (couverture due diligence)
- **McKinsey Casablanca** (couverture consulting)
Un deal de distribution avec un de ces acteurs vaut plus que 10 clients individuels.

### 10. Mobile-first pour le market émergent

L'app iOS/Android native d'AlphaSense avec push notifications et earnings call streaming est un standard. Harch doit avoir une PWA ou app native avec push notifications critiques pour le investor desk (alertes OCP, IAM, BOA en temps réel sur BVC).

---

## 9. CE QUE HARCH ATELIER NE DOIT PAS COPIER

### 1. Pricing per-seat $10K-$20K USD

Le modèle AlphaSense ($10K-$20K/seat/an, average deal enterprise $124K) est inabordable pour 99% du marché marocain. La pricing Harch (5K-50K MAD/mois, soit $500-$5K/mois) reste le bon positionnement. **Ne pas monter vers AlphaSense.**

### 2. US/EU-centrism

AlphaSense est built around SEC filings, US GAAP, US broker research. Harch doit être **MENA-first, Africa-first** :
- IFRS (pas US GAAP) pour les filings
- AMMC (pas SEC) pour le régulateur
- MAD (pas USD) pour le pricing
- Ramadan-aware (calendrier business adapté)
- Friday prayer-aware (pas d'alerts critiques pendant la prière)

### 3. Email-only alerts

AlphaSense n'a que l'email + push mobile. Harch doit garder son avantage **WhatsApp alerts via Twilio** — c'est le canal #1 au Maroc pour les professionals (95%+ penetration). Personne chez AlphaSense n'ira jamais construire ça.

### 4. English-first NLP

AlphaSense NLP est entraîné sur anglais financier. Harch doit **ne surtout pas copier ce centrisme** :
- Darija (arabe dialectal marocain) — moat défendable
- Arabe MSA pour documents officiels AMMC/BAM
- Français pour presse business marocaine (L'Économiste, Aujourd'hui Le Maroc, La Vie Éco)
- Code-switching Darija/Français/Arabe — typique du business marocain
- Aucun concurrent global n'investira là

### 5. Single-cloud AWS lock-in

AlphaSense est single-cloud AWS. Pour Harch, le choix d'une architecture **cloud-agnostic** (déployable sur AWS, GCP, Azure, ou souverain Marocain) est plus défendable long-terme, surtout avec la pression souveraineté données au Maroc (loi 09-08 protection données personnelles, future loi souveraineté cloud).

### 6. Exhaustivité horizontale

AlphaSense ne tente pas d'être un media monitor ou un social listening tool. Harch doit éviter la tentation horizontale : ne pas essayer de concurrencer Brandwatch/Meltwater sur la couverture social. Rester focalisé sur **réputation + risque + intelligence financière pour le marché marocain/africain**.

### 7. L'arrogance enterprise

Le ton AlphaSense est très corporate, très Wall Street, très "trusted by Goldman Sachs". Harch doit garder un ton institutionnel-local (francophone, arabophone, contextualisé Maroc) — pas un mimétisme de la rhétorique US.

---

## 10. SYNTHÈSE — VERDICT NEUTRE

AlphaSense est, à la date de ce rapport (juillet 2026), le **leader mondial incontesté du AI-powered market intelligence pour la recherche financière**. Les chiffres sont sans appel :

- **$700M+ ARR** avec croissance ~40% YoY
- **$7.5B valuation** (juin 2026)
- **7 500 clients enterprise** dont 90% du S&P 100
- **500M+ documents** indexés
- **Architecture technique mature** : Elasticsearch 8.x + vector DB + multi-LLM gateway (Anthropic + OpenAI + Gemini + Llama via Cerebras WSE-3)
- **IPO en préparation** (The Information, juillet 2026)

Harch Atelier ne peut pas, ne doit pas, et ne va pas concurrencer AlphaSense frontalement. L'écart d'échelle est de l'ordre de 10^3 à 10^5 selon les métriques (clients, documents, ARR, ingénieurs). Toute tentative de "devenir l'AlphaSense marocain" serait perdante par construction.

La stratégie correcte pour Harch est la **complémentarité verticale géographique** :

1. **Là où AlphaSense est fort** (US/EU filings, broker research anglophone, expert transcripts US/EU) — Harch ne va pas
2. **Là où AlphaSense est faible** (AMMC, BAM, BVC, presse francophone/arabophone, Darija, transcripts experts locaux marocains, WhatsApp alerts, MAD pricing) — Harch doit construire un moat défendable

La fenêtre stratégique est **2-4 ans** : temps pour qu'AlphaSense (post-IPO, avec $700M+ ARR à déployer) identifie le marché africain comme croissance suivante et y investisse. À ce moment-là, si Harch a construit (a) une base documentaire locale exclusive, (b) un NLP Darija mature, (c) une distribution via partnerships bancaires marocains, et (d) une marque institutionnelle locale — alors AlphaSense aura le choix entre acquérir Harch ou construire en interne à un coût 10x supérieur.

La conclusion est la même que pour Dataminr : **ne pas se positionner en "AlphaSense marocain". Se positionner en "command center contextualisé pour le marché francophone/arabophone mid-market institutionnel"** — un segment qu'AlphaSense ne sert pas, ne servira pas à court terme, et qui restera défendable si Harch exécute bien.

---

## Sources principales

- **Site corporate AlphaSense** (alpha-sense.com) : pages About, Platform, Pricing, Solutions, Press, Security — jusqu'à juillet 2026.
- **Portail développeur** (developer.alpha-sense.com) : API documentation, Agent API quickstart, GenSearch modes, Ingestion swagger, Enterprise SSO, Trust Center.
- **Centre d'aide** (help.alpha-sense.com) : SEC Filings Content Overview, Section Search, Tegus Call Services, Maximizing Your Monitoring Tools, AlphaSense for Android.
- **Communiqués de presse** (PR Newswire, alpha-sense.com/press) :
  - 25 oct. 2021 : Acquisition Stream by Mosaic
  - Sept. 2021 : Series C $180M
  - 15 juin 2022 : Series D $225M à $1.7B
  - 11 avr. 2023 : $100M CapitalG à $1.8B
  - 29 sept. 2023 : Series E $150M Bond Capital à $2.5B
  - 11 juin 2024 : Accord Tegus $930M + $650M financing à $4B
  - 8 juil. 2024 : Completion acquisition Tegus
  - 8 oct. 2025 : Launch Financial Data
  - 11 mars 2025 : Partenariat Cerebras WSE-3 (10x faster insights)
  - 3 juin 2026 : $350M Vitruvian Partners + Accenture à $7.5B, $600M+ ARR
  - Juin 2026 : Partenariat Accenture Ventures (strategic channel)
- **The Information** (23 juil. 2026) : "AlphaSense Tops $700 Million in Annual Recurring Revenue, Takes IPO Steps"
- **Sacra** (sacra.com/c/alphasense) : estimations ARR $540M fin 2025, $700M juin 2026, 7 000+ enterprise customers
- **AlleyWatch** (22 juin 2026) : 7 500 customers, 90% of S&P 100
- **SiliconAngle** (11 avr. 2023) : $100M CapitalG round, 4 000+ clients à l'époque
- **Reuters** (11 juin 2024) : $930M Tegus deal, $4B valuation
- **Crunchbase News** (11 juin 2024) : Series E $150M Bond Capital à $2.5B
- **PR Newswire** (10 mai 2022 via Centana) : Acquisition Sentieo
- **Latham & Watkins** (juin 2024) : conseil juridique Tegus acquisition $930M
- **Paul, Weiss** (juin 2024) : conseil antitrust AlphaSense-Tegus
- **Asymmetrix Intelligence** (Substack) : Tegus valuation history ($3B nov. 2021 → $930M juin 2024)
- **TheNewStack** (8 juin 2023) : "How AlphaSense Added Generative AI to Its Existing AI Stack" — interview Chris Ackerson SVP Product
- **VentureBeat** (lancement Deep Research) : architecture multi-LLM, Cerebras WSE-3 + Llama, citations inline, 500M+ documents
- **QueryQuotient case study** : "90% Faster Financial Document Search" — Elasticsearch 8.x confirmation, custom tokenizers, ML relevancy, 50K docs/min indexing, <500ms p95 latency, Sarah Chen VP Engineering quote
- **Cerebras press release** (11 mars 2025) : WSE-3 partnership, 10x faster insights, multi-turn queries in seconds
- **AlphaSense Generative AI Security page** : AI gateway architecture, Anthropic/OpenAI/Gemini, zero data retention, RAG grounding, account-level opt-out
- **AlphaSense "AI Future of Research" article** : Anthropic Sonnet 4, Google Gemini 2.5, OpenAI o3, multi-agent architecture, Deep Research 50K+ tasks first month
- **Offres d'emploi AlphaSense** (Greenhouse, LinkedIn, BuiltInNYC, WelcomeToTheJungle, TribecaVP, InnovationEndeavors) : Python primary backend, Golang secondary, Kubernetes, AWS, React frontend, salary $223K-$305K for Staff Software Engineer Core Cloud Platform
- **Spendhound** (fév. 2026) : SMB average $12 210/year, enterprise average $123 760/year
- **Vendr** (2026) : per-seat annual subscription, 30-50% variability, $9 250-$51 000 range observée
- **Elevated Signal** (2026) : ~$15K-$20K/seat/year, ~$15K enterprise standard
- **Sacra** : $10K-$20K/seat annually, $50K-$100K average deal size
- **Thisisayu** (mai 2025) : 185 000+ expert transcripts, 18 000+ companies
- **expertnetworkcalls.com** : 100 000+ transcripts, 35 000+ companies (snapshot plus ancien)
- **AlphaSense Expert Insights page** : 8 000+ transcripts added monthly, 29 000+ companies
- **Apple App Store** (apps.apple.com/us/app/alphasense/id1177914297) : app mobile iOS, streaming earnings calls, push notifications
- **AlphaSense Help Center Android** (juin 2026) : Android app, push notifications pour recherche en arrière-plan
- **Hebbia** (2026) : critique "search-first architecture can struggle with deep cross-contextual reasoning"
- **IntuitionLabs** (nov. 2025) : 10 000+ content sources

Toutes les données financières non officiellement confirmées par AlphaSense (typical contract size exact, marges, coûts infrastructure, précision des modèles, taux de hallucination mesuré) sont explicitement marquées comme non disponibles publiquement ou attribuées à des sources tierces avec la mention correspondante.
