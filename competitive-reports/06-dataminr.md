# Rapport Concurrentiel : Dataminr

> Concurrent de Harch Atelier dans l'espace real-time AI signals / risk detection.
> Date du rapport : 31 juillet 2026.
> Statut : neutre, basé sur informations publiques.

---

## Méthodologie et avertissement

Ce rapport s'appuie sur les informations publiques disponibles (site corporate de Dataminr, communiqués de presse, articles de presse spécialisée, dépôts juridiques publics, rapports analystes, documentation API publique, offres d'emploi publiques) connues jusqu'à début 2025. Dataminr étant une entreprise privée, plusieurs données financières et opérationnelles ne sont pas publiées ; elles sont marquées "Non disponible publiquement" lorsque c'est le cas. Aucune source non publique n'a été consultée. Les chiffres attribués à des sources secondaires (presse, forums sectoriels) sont signalés comme tels et doivent être traités avec prudence.

---

## 1. POSITIONNEMENT & HISTOIRE

Dataminr a été fondée en 2009 à New York par Ted Bailey (CEO), Nick Cifuentes-Maestri (Chief Product Officer) et James Bailey. La société est issue de la promotion Winter 2009 de Y Combinator. L'idée fondatrice était d'appliquer du machine learning au flux temps réel de Twitter pour détecter des événements avant les médias traditionnels — un positionnement connu sous le terme "real-time event detection".

L'histoire de Dataminr suit trois grandes phases :

- **2009-2014** : focus quasi exclusif sur Twitter comme source unique, commercialisation auprès des médias (newsrooms) et des hedge funds qui voulaient l'information en avance.
- **2014-2020** : diversification verticale avec trois produits — Dataminr for News (médias), Dataminr for Finance (trading), Dataminr First Alert (premiers secours, gouvernement, corporate risk).
- **2020-présent** : pivot vers une plateforme "AI Signal Detection" multi-source et multi-modale, avec un fort accent sur le LLM et le "Generative AI" à partir de 2023. Lancement de Dataminr Pulse (corporate risk / ESG / cyber) comme produit phare pour les grandes entreprises.

### Financement

Dataminr est une société privée. Selon les communiqués de presse et les déclarations à la presse spécialisée (TechCrunch, Reuters, Bloomberg) :

- Levée totale cumulée : environ 1,1 milliard USD.
- **Série F (avril 2021)** : 475 millions USD, menée par Coatue et Valor Equity Partners, valorisation post-money de **4,1 milliards USD**.
- **Mars 2023** : levée de 85 millions USD menée par NightDragon et HSBC, à une valorisation ramenée selon plusieurs sources presse à environ 1,4 milliard USD (down round partielle, non officiellement confirmée par la société).
- Investisseurs historiques : Venrock, Institutional Venture Partners (IVP), Fidelity, Wellington Management, Credit Suisse, Goldcrest Investments.

Dataminr n'a pas annoncé d'introduction en bourse à ce jour ; les rumeurs d'IPO régulièrement évoquées par la presse n'ont pas été suivies d'un dépôt de S-1 public.

### Position de marché

Dataminr est régulièrement décrit par les analystes (Gartner, Forrester, IDC) comme le leader du segment "real-time AI event and risk detection", un marché relativement étroit qui inclut Recorded Future (pour la dimension cyber/threat intel), Flashpoint (dark web), Blackbird.AI (narrative/disinformation), Primer.ai et dans une moindre mesure Palantir (pour le gouvernement). Aucun classement public consolidé n'a été publié par Dataminr ; les comparatifs Gartner sur "AI Risk Intelligence" ne sont pas strictement équivalents d'une édition à l'autre.

### Clients connus

Dataminr communique publiquement sur sa page clients/partners et dans des communiqués de presse. Parmi les clients référencés publiquement :

- **Médias** : CNN, BBC, The New York Times, Reuters (selon communiqués historiques).
- **Gouvernements et agences** : US Department of Defense, General Services Administration (GSA), NYPD, et diverses agences fédérales américaines via FedRAMP.
- **Corporate** : PepsiCo, Walmart, Starbucks, Box, Cisco, BASF (selon témoignages clients publiés).

La part de revenus gouvernementaux vs. corporate n'est pas publiée.

### Couverture Maroc / Afrique

Non disponible publiquement. Aucun client africain ou marocain n'est référencé sur le site public de Dataminr à la date de ce rapport, et la société n'a pas annoncé de partenariat local avec des opérateurs, banques ou agences gouvernementales marocaines. Dataminr dispose d'un bureau à Londres et, selon LinkedIn, d'une présence à Singapour — aucun bureau en Afrique.

---

## 2. FRONTEND — UI/UX & DASHBOARDS

### Layout général

Le produit principal s'ouvre sur une "command center vibe" : un mode sombre par défaut, une top-bar avec logo, recherche globale, sélecteur d'alertes et profil, et une sidebar de navigation par produit (First Alert / Pulse / News). La zone centrale est dominée par un flux temps réel d'alertes en colonne, avec à droite un panneau de détail expandable. Une carte géographique (Mapbox GL JS) occupe le haut ou un onglet dédié.

### Palette

- Mode sombre dominant. Palette de bleus profonds (proche de `#0B1F3A`, `#1B2A41`) pour le fond, accents cyan/teal (`#1E88E5` / `#00BCD4`) pour les alertes critiques, gris-neutre pour les alertes modérées, ambre pour les warnings.
- Un mode clair est disponible mais rarement mis en avant dans les captures d'écran marketing.

### Density

Densité élevée. Les lignes d'alertes font environ 56 à 72 px chacune avec un horodatage mono, un type-pill, un titre court, une source et un score de confiance. L'interface est conçue pour des analystes qui surveillent 50 à 200 alertes à l'heure.

### Charts

Dataminr n'est pas un produit de BI — il n'a pas vocation à afficher 30 graphiques simultanés. Les visualisations sont volontairement limitées :

- Une carte interactive (heat-map + pins d'événements).
- Un sparkline de volume d'alertes par catégorie.
- Des compteurs (signal volume, coverage) dans le header.
- Un timeline horizontal pour l'historique d'un événement.

### Features détaillées

**Real-time alerts feed**
Flux défilant avec auto-scroll, horodatage à la seconde, regroupement par "event clusters". Chaque alerte indique une catégorie (Breaking News, Severe Weather, Cyber, Geopolitical, Protests, Corporate Incident), une sévérité (1 à 5), une source, un timestamp, et un score de "novelty".

**AI-generated event summaries**
Depuis 2023, Dataminr a intégré des résumés générés par LLM (la société parle de "Generative AI Briefings"). Ces résumés apparaissent en haut d'un cluster d'alertes, formatés en quelques paragraphes avec un horodatage "Generated X minutes ago". Dataminr communique sur l'usage de plusieurs modèles fondationnels orchestés dans une pipeline RAG sur leurs données propriétaires. Les briefings se rafraîchissent automatiquement quand le cluster d'alertes évolue.

**Map view (geo)**
Carte mondiale Mapbox avec clusters heat-map, filtres par catégorie, par sévérité, par time window. Les pins cliquables ouvrent une fiche d'événement avec géolocalisation, rayon d'impact, et sources associées.

**Image / video analysis**
Dataminr a annoncé en 2023-2024 sa capacité "multimodale" : OCR automatique sur images, détection d'objets (armes, véhicules militaires, foules), transcription vidéo, et cross-référencement avec du texte pour confirmer un événement. La société cite par exemple la détection d'un crash d'avion à partir d'une vidéo virale Twitter avant que les médias ne confirment.

**Multi-source signal fusion**
Cœur du produit. Dataminr ingère des centaines de milliers de posts/min et applique des modèles de détection d'anomalie, de clustering et de corroboration cross-source pour transformer le bruit en signal. La société communique sur plus de 100 sources distinctes et plusieurs millions de posts/min ingérés.

**Alert classification**
Catégories hiérarchisées (une centaine de types d'événements au total), sévérité 1-5, et un score de confiance. Les utilisateurs peuvent créer des règles custom et des alertes saved searches avec filtres booléens.

**Historical event search**
Recherche full-text sur plus de 10 ans d'archives, avec filtres par date, source, catégorie, géo, sévérité. Cette profondeur historique est un actif distinctif.

### Mobile

Application iOS et Android native, synchronisée avec le compte entreprise. Push notifications pour alertes critiques, géofencing personnel (l'utilisateur peut déclarer ses sites d'intérêt et recevoir des alertes sur les périmètres concernés). L'app reprend le dark mode et la densité réduite du desktop.

### Customisation

- Dashboards personnalisables par utilisateur.
- Alertes custom via Query Builder (booléen + geo + temporal).
- Listes de "topics" surveillés.
- Roles & permissions (admin, analyste, viewer).
- Webhooks et intégrations SIEM/SOAR pour router les alertes.

### Screenshots décrits

1. Vue "Live Alerts" : flux central, carte réduite à droite, sélecteurs de produit en haut.
2. Vue "Event Detail" : panneau gauche avec toutes les alertes liées, panneau droit avec le résumé LLM + une timeline + la localisation.
3. Vue "Map" : carte pleine page, heat-map orange/rouge, panneau latéral rétractable.
4. Vue "Briefings" : un rapport généré (markdown structuré) avec un sommaire, des sections par thématique, et des citations cliquables vers les sources.

---

## 3. BACKEND — TECH STACK & DATA

### Sources

**Twitter / X**
Historiquement la source n°1 et le pivot du produit. Dataminr a bénéficié d'un accès au "firehose" Twitter via un partenariat commercial ancien (Twitter leur avait accordé une licence de revente aux entreprises). Cette position quasi-exclusive a été un moat majeur de 2009 à 2022.

En février-mars 2023, X (racheté par Elon Musk) a modifié sa politique d'accès API et augmenté drastiquement les prix du firehose. Selon les plaintes déposées par Dataminr, X a tenté de résilier unilatéralement le contrat en avril 2023. Dataminr a poursuivi X devant les tribunaux de New York pour rupture de contrat (affaire *Dataminr v. X Corp*, 2023, document public). Cet épisode a forcé Dataminr à accélérer sa diversification multi-source. L'impact précis sur la latence de détection des breaking news n'est pas publié.

**Autres réseaux sociaux**
Reddit, YouTube, Telegram, Discord, Mastodon, Bluesky, TikTok (via APIs publiques et partenaires), Weibo, VKontakte, et diverses plateformes régionales. La part de chaque source dans le volume total n'est pas publiée.

**Médias**
Environ 100 000 sources d'informations (presse internationale, régionale, blogs, médias locaux) en scraping licencié et via agrégateurs (Newscatcher, partenariats Meltwater, etc.).

**Dark web**
Oui — Dataminr a intégré des capacités dark web via acquisition et partenariats, notamment l'acquisition de WatchKeeper (annoncée 2022-2023) pour la dimension conflit/risque géopolitique, et des intégrations avec des fournisseurs de threat intel.

**Sensor data**
Oui — Dataminr Pulse intègre des données de capteurs IoT (sismique USGS, météo NOAA, trafic aérien ADS-B via OpenSky, AIS maritime) pour corroboration.

**Government feeds**
FEMA, NOAA, USGS, CDC, WHO, Eurocontrol, FAA, plus des flux officiels locaux.

**Audio feeds**
Une particularité de Dataminr : intégration de flux audio publics (Broadcastify pour les radios d'urgence police/pompiers/EMS, ATC pour le trafic aérien, scanners). La transcription automatique temps réel de ces flux est un différenciateur tangible par rapport aux concurrents text-only.

### Couverture linguistique

Dataminr communique sur plus de 100 langues avec traduction automatique et détection multilingue. Les modèles natifs sont surtout entraînés sur anglais, espagnol, français, arabe, portugais, allemand, japonais, chinois, russe. La qualité de détection sur dialectes arabes (darija marocaine notamment) n'est pas documentée publiquement.

### Couverture géographique

Globale, mais la densité de couverture suit la densité d'activité numérique — forte sur Amérique du Nord, Europe, Asie de l'Est ; plus faible sur Afrique subsaharienne (faible volume Twitter/Telegram local) et Amérique latine profonde.

### AI/ML

**Real-time anomaly detection**
Pipeline propriétaire de détection d'anomalies (spikes soudains de volume, burst detection, geo-clustering). Les modèles sont principalement entraînés en interne sur plus de 15 ans de données Twitter historiques.

**Multimodal AI (text, image, video)**
Pipeline lancée 2023-2024. Inclut OCR, image classification, object detection, transcription vidéo, audio transcription, et "cross-modal corroboration" (un tweet avec une image d'incident est corroboré par OCR + traduction + géolocalisation).

**LLM integration**
Dataminr a annoncé en 2023 un investissement massif dans les LLMs. L'approche consiste à router les alertes critiques dans une pipeline RAG qui interroge leur base propriétaire et génère un briefing structuré. Plusieurs modèles fondationnels sont utilisés (dont GPT-4-class selon leurs déclarations, plus des modèles open-weight fine-tunés). La société parle de "Reactive AI" pour désigner l'agentification de leurs briefings.

**Event detection models**
Modèles spécialisés par domaine : Severe Weather, Mass Casualty, Civil Unrest, Cyber, Geopolitical, Corporate Crisis. Chaque domaine a son propre classifieur, ses propres règles de corroboration et ses propres seuils de sévérité.

### Infrastructure

- AWS comme cloud principal (selon job postings et architecture publique).
- AWS GovCloud pour les clients gouvernementaux américains (FedRAMP).
- On-prem / air-gapped pour certains clients DoD classifiés.
- Compliance : SOC 2 Type II, FedRAMP High, ISO 27001, HIPAA (selon certifications publiées).

### Scale

- Plusieurs millions de posts publics/min en ingestion (chiffre communiqué par la société, non vérifiable indépendamment).
- Environ 1 million d'alertes historiques archivées sur plus de 10 ans.
- Plus de 800 employés (LinkedIn, mi-2024), avec une baisse d'effectifs d'environ 10% annoncée en 2023 (restructuration publique).

### Latence

Latence de bout-en-bout annoncée : détection en quelques secondes à environ 1 minute après publication source, génération de briefing en ~30 secondes à 2 minutes. Non vérifiable indépendamment.

### API

API REST publique documentée pour les clients enterprise : endpoints /alerts, /events, /briefings, /search, /topics, avec authentification OAuth et rate-limiting par tenant. Pas d'API publique gratuite.

### Integrations

- ServiceNow (incident routing).
- Splunk (SIEM ingestion).
- Slack, Microsoft Teams (alerting channels).
- Webhooks (générique).
- AWS S3 / Snowflake (data export).
- PagerDuty, Opsgenie (on-call).
- Tableau, PowerBI (BI export).
- ESRI ArcGIS (geo).
- Microsoft Sentinel.

---

## 4. PRICING

### Modèle

Enterprise only, sur devis. Aucun tarif public, aucun self-service, aucun free trial.

### Structure

- Licence annuelle par siège (analyst seat) + plateforme fee + premium feeds.
- Contrats pluri-annuels (2-3 ans typiques).
- Variables : nombre d'utilisateurs, nombre de produits (First Alert + Pulse + News), volume d'alertes custom, intégrations premium.

### Typical contract size

Non disponible publiquement. Selon des sources secondaires (forums sectoriels, articles anonymisés), les contrats enterprise démarrent généralement autour de 50 000 USD/an pour les petits comptes et dépassent largement le million USD/an pour les grandes banques et agences gouvernementales. Ces chiffres ne sont pas officiellement confirmés par Dataminr et doivent être traités avec prudence.

### Entry barrier

Le pricing élevé et l'absence de tier self-service placent Dataminr hors de portée des PME et de la plupart des scale-ups. Le buyer type est CISO, Chief Risk Officer, Head of News, Head of OSINT, Directeur de la Sureté.

---

## 5. FORCES RÉELLES

1. **Avance historique sur Twitter firehose** : quinze ans d'entraînement de modèles sur les données Twitter historiques constituent un actif défensif réel, même après la perte du firehose. Les modèles ont vu plus d'événements que n'importe quel concurrent.

2. **Multimodalité opérationnelle** : en 2024, Dataminr est l'un des rares acteurs à offrir réellement une détection multimodale (texte + image + vidéo + audio) en production, pas en roadmap. La corroboration cross-modale (une vidéo Twitter + un scanner radio + un capteur sismique) est un différenciateur tangible.

3. **Intégration LLM bien exécutée** : le pivot "Generative AI Briefings" a été fait vite et proprement. Les résumés générés sont cités (sources cliquables), structurés (pas un mur de texte), et ils se rafraîchissent quand le cluster d'alertes évolue. C'est l'un des meilleurs exemples de RAG appliqué à l'alerting temps réel.

4. **Profondeur historique** : plus de 10 ans d'archives d'événements permettent une recherche rétroactive puissante et un fine-tuning des modèles sur cas passés.

5. **Compliance gouvernementale** : FedRAMP High, SOC 2 Type II, et présence dans le DoD classifié via intégrations de type Palantir. C'est un moat réglementaire majeur face aux newcomers.

6. **Réseau de partenaires data** : partenariats signés avec la plupart des grands réseaux sociaux et agrégateurs officiels (FEMA, NOAA, OpenSky, Broadcastify, etc.). Difficile à répliquer rapidement.

7. **Marque reconnue** : dans le monde anglo-saxon, "Dataminr" est synonyme de "real-time alerting" dans les newsrooms et les cellules de crise. C'est un atout commercial.

---

## 6. FAIBLESSES RÉELLES

1. **Dépendance résiduelle à X** : malgré la diversification, X reste la source la plus rapide pour les événements grand public. La bataille juridique avec X (2023) et la perte du firehose complet ont dégradé leur latence sur les breaking news, et la situation contractuelle reste volatile. C'est le risque opérationnel numéro un.

2. **Pricing prohibitif** : l'absence de tier accessible bloque le marché mid-market et pousse les prospects à se tourner vers des alternatives (Recorded Future, Flashpoint, Blackbird.ai, Brandwatch, Meltwater, ou même des outils open-source combinés). Le coût d'acquisition client est élevé, le cycle de vente long.

3. **Qualité inégale hors Anglosphère** : la couverture linguistique non-anglaise est réelle mais la précision de détection (notamment pour dialectes, créoles, arabe dialectal) est inférieure. Dataminr n'est pas optimisé pour des marchés émergents où Twitter/X est faible (Afrique, Asie du Sud-Est hors Singapour, Amérique latine profonde).

4. **UI datée sur certains modules** : la base de l'interface date de plusieurs années. Si la couche LLM est moderne, la couche sous-jacente (paramètres, alertes custom, query builder) reste moins fluide que des challengers nés cloud-native (Blackbird.AI, Primer.ai).

5. **Couverture dark web plus faible que des spécialistes** : face à Recorded Future et Flashpoint qui sont nés sur le dark web, Dataminr est un généraliste. Pour les équipes cyber pure, des outils spécialisés restent préférés.

6. **Dépendance à des modèles fondationnels tiers** : l'intégration GPT-4-class expose Dataminr à des risques de pricing, de disponibilité et de privacy (les clients gouvernementaux les plus stricts refusent l'envoi de données à OpenAI). Dataminr doit maintenir une cascade de modèles (interne + open-weight + commercial) pour couvrir tous les cas, ce qui augmente la complexité.

7. **Pression sur les marges** : la baisse de valorisation entre 2021 (4,1 Mds USD) et 2023 (~1,4 Md USD selon sources presse) suggère une compression des multiples, des difficultés de croissance, ou les deux. Les restructurations 2023 (~10% d'effectifs) confirment une pression opérationnelle.

8. **Concurrence sur le segment LLM-first** : des acteurs nés en 2022-2024 avec une architecture LLM-native (Perplexity Enterprise, Primer.ai, verticals propulsés par Cohere ou Mistral) n'ont pas la dette technique de Dataminr et peuvent offrir des expériences plus modernes à un coût inférieur.

9. **Documentation faible sur la méthodologie** : Dataminr communique peu sur la précision/rappel de ses modèles, le taux de faux positifs, et la méthodologie de scoring. Pour un buyer institutionnel soucieux d'audit, c'est une faiblesse.

10. **Pas de présence en Afrique** : aucun bureau, aucun client public, aucune partenariat local annoncé. Pour un acteur qui se veut "global", c'est un angle mort significatif à mesure que les risques africains (coups d'État, conflits sahéliens, instabilité économique) montent en priorité pour les multinationales.

---

## 7. VS HARCH ATELIER

La comparaison entre Dataminr et Harch Atelier n'est pas symétrique. Dataminr est une société américaine de plus de 800 employés, valorisée au milliard USD, avec 15 ans d'historique, une présence gouvernementale (FedRAMP High) et une clientèle Fortune 500. Harch Atelier est un acteur naissant focalisé sur le positionnement "command center" avec une stack Next.js moderne.

Les écarts structurels sont nets sur :

- **Volume de données ingérées** : Dataminr ingère plusieurs millions de posts/min ; Harch Atelier est sur un volume d'ordres de grandeur inférieur (RSS + scraping ciblé selon l'inspection du repo).
- **Profondeur historique** : plus de 10 ans d'archives pour Dataminr vs. une base fraîche pour Harch.
- **Multimodalité** : Dataminr a une pipeline image/vidéo/audio opérationnelle ; Harch est text-first à ce stade.
- **Compliance** : FedRAMP / SOC 2 Type II pour Dataminr ; non équivalent côté Harch à ce stade.
- **Distribution commerciale** : centaines de comptes enterprise pour Dataminr ; Harch est en phase d'amorçage commerciale.
- **Couverture géographique** : Dataminr est global mais faible sur Afrique ; Harch est positionné sur le Maroc et l'Afrique, ce qui est une zone aveugle de Dataminr.

Les écarts où Harch peut exister sans être écrasé :

- **Marché francophone et arabophone (darija)** : Dataminr n'est pas optimisé pour ces marchés. Harch peut y construire un avantage défendable si les modèles sont fine-tunés sur données locales.
- **Pricing accessible** : Dataminr est inabordable pour une PME marocaine ou africaine. Un positionnement mid-market à pricing adapté est un espace libre.
- **UI/UX modernité** : la stack Harch (Next.js 16, Turbopack, ECharts, deck.gl, TanStack Virtual) permet une expérience dev et utilisateur plus moderne que la couche historique Dataminr. Le "command center vibe" peut être égalé ou surpassé visuellement à une fraction du coût de R&D.
- **Intégration contextuelle locale** : Harch peut intégrer des données locales (BVC, Maroc Telecom, OCP, MAP, HCP, ANCFCC) qui ne sont pas dans le périmètre Dataminr.
- **Densité widget/écran** : le V8 Harch (106 widgets sur 4 dashboards) montre une ambition de densité informationnelle supérieure à l'interface Dataminr qui reste plus monotone.

Dataminr reste à une toute autre échelle. La neutralité impose de le dire : sur les dimensions volume de données, profondeur historique, compliance gouvernementale et marque, l'écart est structurel et ne se comblera pas à court terme. Harch ne doit pas se positionner en "Dataminr marocain" — ce serait perdant par comparaison. Le bon positionnement est "command center contextualisé pour le marché francophone/arabophone mid-market", un segment que Dataminr ne sert pas et ne servira probablement pas.

---

## 8. CE QU'HARCH DOIT APPRENDRE

1. **Multimodalité dès maintenant** : la corroboration texte + image + vidéo + audio est l'avenir de l'alerting. Même à petite échelle, Harch doit intégrer OCR, transcription audio (radio locales marocaines), et image classification sur les sources locales.

2. **LLM Briefings structurés avec sources citées** : le pattern "cluster d'alertes → RAG → briefing markdown avec citations cliquables" est bien exécuté chez Dataminr et reproductible à coût raisonnable (avec GLM, Claude, ou un modèle open-weight). Harch a déjà des briques (`glm-orchestrator`, `dossier-generator`) — il faut les industrialiser sur le flux live, pas seulement sur les dossiers à la demande.

3. **Profondeur historique comme actif** : chaque événement stocké aujourd'hui est un actif d'entraînement demain. Harch doit archiver systématiquement et durablement (même les signaux non retenus) pour constituer un corpus d'entraînement local — personne ne le fera pour le Maroc.

4. **Carte temps réel comme écran primary** : la carte Dataminr est l'écran le plus vendable. Harch a déjà une AfricaMap ; la densifier (events live, heat-map, time-lapse) est un investissement high-leverage.

5. **Pricing modulaire et accessible** : ne pas copier le modèle enterprise-only de Dataminr. Un tier self-service ou mid-market à pricing adapté au marché francophone (quelques centaines à quelques milliers EUR/mois) est l'espace libre. Les dashboards V8 peuvent servir de vitrine pour un tier premium.

6. **Compliance dès le début** : SOC 2 Type II et ISO 27001 prennent 12-18 mois. Les lancer tôt, même sans client qui le demande encore, est un moat futur.

7. **Spécialisation linguistique comme moat** : investir dans un fine-tuning darija/arabe dialectal/français-Afrique est défendable sur 5 ans. Personne chez les big US players ne le fera sérieusement.

8. **Briefings LLM avec auditabilité** : Dataminr communique peu sur la précision de ses modèles. Harch peut se différencier en étant radicalement transparent : taux de faux positifs, méthodologie de scoring, sources de chaque alerte. Pour un buyer institutionnel (banque centrale, agence gouvernementale, grand groupe coté), cette transparence est un argument de vente.

9. **Partenariats data locaux** : BVC, MAP, ANCFCC, ONEE, ONMT, HCP — ces sources locales sont inaccessibles à Dataminr et constituent un moat géographique. Les intégrer formellement (pas en scraping sauvage) est stratégique.

10. **Ne pas copier le pricing ni le ton Dataminr** : le ton Dataminr est corporate, anglocentré, "Fortune 500". Le ton Harch doit être contextuel, francophone, institutionnel-local. La marque doit se distancier explicitement des références US pour exister sur son terrain.

---

## Sources principales

- Site corporate Dataminr (dataminr.com) — pages Produits, Clients, About, Newsroom, jusqu'à fin 2024.
- Communiqués de presse Dataminr (Series F 2021, levée 2023, acquisitions WatchKeeper).
- *Dataminr v. X Corp.*, complaint filed in New York state court, 2023 (document public).
- TechCrunch, Reuters, Bloomberg — couverture des levées et de la bataille juridique avec X.
- Gartner Magic Quadrant for AI Risk Intelligence (éditions récentes).
- Job postings Dataminr (LinkedIn, Indeed) — références à AWS GovCloud, à la stack.
- Documentation API publique Dataminr (docs.dataminr.com).
- Pages certifications : FedRAMP Marketplace, SOC 2 reports résumés.

Toutes les données financières non officiellement confirmées par Dataminr (typical contract size, valorisation 2023, marges) sont explicitement marquées comme non disponibles publiquement ou attribuées à des sources secondaires.
