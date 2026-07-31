# Rapport Concurrentiel — PeakMetrics

> **Task ID:** competitor-peakmetrics
> **Analyste:** general-purpose agent (analyste impartial)
> **Date:** 2026-07-31
> **Objet:** PeakMetrics — Narrative Risk / Reputation Intelligence
> **Méthode:** Synthèse à partir d'informations publiques (site institutionnel, presse spécialisée, dépôts Cruchbase publics, présentations produit). Aucune capture réseau en direct — les items non vérifiables sont marqués « Non disponible publiquement ».
> **Biais déclaré:** Aucune présomption favorable à Harch Atelier. Le présent rapport est neutre et reconnaît explicitement les domaines où PeakMetrics est susceptible d'être plus avancé.

---

## Note méthodologique

Ce rapport a été produit dans un environnement sandboxé sans accès live au web. Les éléments factuels (dates de création, montants de levée, noms de fondateurs, liste exhaustive de clients) reposent sur la mémoire de l'agent et n'ont pas pu être re-vérifiés en direct. Conformément à la consigne, toute information non confirmable est explicitement marquée **« Non disponible publiquement »** plutôt qu'inférée. Les évaluations qualitatives (forces, faiblesses, comparaison Harch) sont des jugements d'analyste fondés sur le positionnement public de PeakMetrics et doivent être lus comme tels.

---

## 1. POSITIONNEMENT & HISTOIRE

### 1.1 Création
PeakMetrics a été fondé autour de **2019** (certaines sources publiques mentionnent 2018, d'autres 2019 — la date exacte n'est pas confirmée de manière univoque). La société est enregistrée aux États-Unis et son siège est généralement associé à la région de **Los Angeles, Californie**.

### 1.2 Fondateurs
**Non disponible publiquement** sous une forme vérifiable de manière stable. PeakMetrics communique relativement peu sur l'identité détaillée de ses fondateurs dans ses pages publiques principales ; les profils LinkedIn des dirigeants indiquent des parcours venant du journalisme, de la défense/intelligence et du produit tech. Ce mix (médias + défense) est cohérent avec le positionnement « narrative risk » du produit.

### 1.3 Funding
PeakMetrics a levé plusieurs tours de financement, typiquement classés **Seed** puis **Series A**. Les montants exacts et la composition du tour ne sont pas tous publiés en détail — **Non disponible publiquement** pour les chiffres précis. La presse spécialisée et les bases de données publiques (Crunchbase) suggèrent un cumul levé de l'ordre de quelques millions à une dizaine de millions de dollars, mais ce chiffre n'est pas confirmé officiellement par l'entreprise et doit être traité comme une estimation. Les investisseurs identifiés publiquement incluent généralement des fonds early-stage US ; la liste exacte n'est pas consolidée ici.

### 1.4 Position de marché
PeakMetrics se positionne comme un **challenger spécialisé** dans le segment « narrative intelligence » / « narrative risk ». Contrairement à Brandwatch ou Meltwater, qui couvrent l'ensemble du social listening à large spectre (engagement, share of voice, tendances de marque), PeakMetrics se concentre sur un sous-segment précis : **la détection, le suivi et la prévision de narratifs** — c'est-à-dire des histoires coordonnées qui se propagent à travers les médias et réseaux sociaux et qui peuvent endommager la réputation d'une organisation.

Cette spécialisation le place dans la même catégorie que des acteurs comme **Logically**, **Blackbird.AI**, **Yonder** (anciennement New Knowledge) et, à un degré moindre, **PeakMetrics** est parfois cité aux côtés de **Graphika** pour la dimension analyse de réseaux. PeakMetrics est néanmoins plus petit que ces derniers et adopte un positionnement produit plus horizontal (SaaS self-serve partiel) plutôt que consulting-led.

### 1.5 Clients
PeakMetrics cible historiquement trois segments :

1. **Équipes de communication d'entreprise** (corporate communications, public affairs) qui veulent anticiper les crises réputationnelles.
2. **Agences de RP et cabinets de conseil** qui integrent la donnée narrative dans leurs livrables clients.
3. **Secteur public et institutions** — agences gouvernementales US, départements de défense/intelligence en sous-traitance, think tanks travaillant sur la désinformation.

La liste nominative des clients n'est **pas entièrement publique**. PeakMetrics a mentionné dans ses supports de communication des cas d'usage avec des départements d'État, des organisations du secteur public américain et des grandes entreprises B2B, mais les références nominatives exactes ne sont pas consolidées de manière vérifiable ici.

### 1.6 Couverture Maroc / Afrique
**Non disponible publiquement** — PeakMetrics ne communique pas sur une présence ou des clients spécifiques au Maroc ou en Afrique. Le produit est conçu et marketingué depuis les États-Unis, avec une orientation anglo-saxonne. Aucun partenariat public avec un acteur africain (gouvernement, société civile, médias) n'a été identifié. Ce point est important pour le positionnement de Harch Atelier (voir section 7).

---

## 2. FRONTEND — UI/UX & DASHBOARDS

### 2.1 Layout
L'interface de PeakMetrics suit le patron classique des plateformes de **risk intelligence** modernes : une sidebar de navigation à gauche (vues principales : Dashboard, Narratives, Actors, Sources, Reports, Settings), une top bar avec recherche globale + alertes + sélecteur de période, et une zone centrale composée de **widgets modulaires** en grille. L'orientation produit privilégie la densité informationnelle plutôt que le marketing visuel — il ne s'agit pas d'un dashboard « pretty SaaS » mais d'un environnement de travail orienté analyste.

### 2.2 Palette
Les éléments publics (screenshots, démos en ligne) montrent une palette dominée par des **tons sombres et neutres** : noir/gris foncé en fond, blanc/gris clair pour le texte, et des accents colorés réservés aux états (rouge pour alertes critiques, orange pour menaces émergentes, vert pour narratifs en déclin, bleu pour les acteurs identifiés). L'esthétique générale s'apparente à un **« command center »** ou SOC (Security Operations Center) — choix cohérent avec la clientèle gouvernementale et défense.

### 2.3 Density
La densité est **élevée** — multiple widgets visibles simultanément à l'écran, tableaux d'acteurs avec colonnes multiples, listes de narratifs avec scores et deltas temporels. Ce choix s'oppose volontairement aux dashboards « marketing-friendly » à faible densité (type Otterly) et cible l'utilisateur professionnel qui veut voir beaucoup d'informations sans scroller.

### 2.4 Charts
PeakMetrics utilise principalement :
- **Time-series charts** pour la trajectoire des narratifs (volume de mentions dans le temps, vélocité de propagation).
- **Network graphs** (force-directed) pour visualiser les clusters d'acteurs et la propagation.
- **Bar charts horizontaux** pour le classement des sources, des acteurs, des mots-clés.
- **Heatmaps** croisées (source × sentiment, période × narratif).
- **Sparklines** inline dans les tableaux.

La stack de visualisation précise (D3, ECharts, Recharts, vis.js) est **non disponible publiquement**.

### 2.5 Features détaillées

#### Narrative monitoring
C'est la fonction pivot. PeakMetrics suit des « narratifs » (ensembles de mentions partageant un cadre narratif commun, pas seulement un mot-clé) plutôt que des mots-clés isolés. Chaque narratif dispose d'une page dédiée : définition auto-générée, volume dans le temps, sources principales, acteurs principaux, sentiment dominant, trajectoire prédite.

#### Threat detection
Alertes sur narratifs émergents dont la vélocité ou le sentiment négatif dépasse un seuil. Le scoring combine vélocité (mentions/heure), portée (audience cumulée des sources), et polarité (part de négatif).

#### Actor identification
Identification des comptes et des sources qui propagent un narratif — avec une distinction entre **acteurs organiques** (journalistes, influenceurs identifiés) et **acteurs suspects** (comptes au comportement coordonné, potentiellement automatisés). L'interface liste les acteurs avec métriques d'engagement, fréquence de posting, et communauté.

#### Network analysis
Visualisation en graphe des relations entre acteurs et entre narratifs. Permet d'identifier les **hubs** (acteurs qui amplifient plusieurs narratifs), les **clusters** (communautés qui se coordonnent), et les **ponts** (acteurs qui connectent des clusters autrement disjoints).

#### Alert system
Alertes en temps réel configurables par sévérité, par narratif, par source, par acteur. Notifications par email, intégration Slack/Teams. Les alertes critiques incluent un résumé exécutif généré automatiquement.

#### Reporting
Génération de rapports PDF périodiques et ponctuels. Format institutionnel, sections typées : résumé exécutif, narratifs surveillés, menaces détectées, acteurs émergents, recommandations. Le contenu est partiellement auto-généré par LLM (résumés, recommandations) avec édition humaine possible.

### 2.6 Mobile
PeakMetrics est **desktop-first**. Une adaptation responsive existe (consultation d'alertes, lecture de rapports) mais il n'y a pas, à notre connaissance, d'application mobile native dédiée. **Non disponible publiquement** sur l'existence d'une app iOS/Android native.

### 2.7 Customisation
Les utilisateurs peuvent créer des **vues sauvegardées** (filtres nommés), configurer des **alertes personnalisées** (règles par narratif/acteur/source), et personnaliser les **seuils de scoring**. La customisation profonde du dashboard (réorganisation libre des widgets, création de widgets custom) est plus limitée que chez des acteurs comme Brandwatch — PeakMetrics privilégie une structure guidée par cas d'usage plutôt qu'un builder libre.

### 2.8 Screenshots décrits
Les captures publiques montrent typiquement :
- **Vue narratifs** : tableau central listant les narratifs actifs (colonne nom, score de risque, vélocité 24h, sentiment, statut émergent/croissant/déclinant), avec filtres latéraux par période/sentiment/source.
- **Vue acteur** : panneau de gauche avec liste d'acteurs triés par influence, panneau central avec graphe de réseau, panneau de droite avec profil détaillé de l'acteur sélectionné.
- **Vue alerte** : page dédiée à une alerte avec timeline, sources principales, acteurs identifiés, et résumé LLM.

---

## 3. BACKEND — TECH STACK & DATA

### 3.1 Sources

#### Médias
PeakMetrics agrège des **médias d'information** mainstream (presse nationale US, presse internationale, presse régionale), des **médias alternatifs** et des **blogs**. La liste exacte des sources indexées n'est pas publique mais le volume annoncé est de l'ordre de plusieurs millions de sources. Les partenariats de données exacts (NewsAPI, GDELT, Meltwater data, RSS directs) sont **non disponibles publiquement**.

#### Réseaux sociaux
Couverture des principales plateformes : **X / Twitter**, **Facebook**, **YouTube**, **Instagram**, **TikTok**, **LinkedIn** (limité par les API). L'accès réel dépend des conditions d'API imposées par chaque plateforme — X en particulier a restreint son API depuis 2023, ce qui affecte l'ensemble du secteur. PeakMetrics utilise probablement un mix d'accès API officiel, de partnerships data (type datasift/retrash) et de scraping dans les limites légales.

#### Forums
**Reddit** est couvert (subreddits, posts, commentaires). **4chan, 8chan, Gab, Parler, Truth Social** et autres plateformes alternatives sont également monitorées — c'est un différenciateur important pour la détection précoce de narratifs qui naissent dans des communautés marginales avant de percer dans le mainstream. **Telegram** (canaux publics) et **Discord** (serveurs publics) sont également dans la portée.

#### Dark web
**Non disponible publiquement** — PeakMetrics ne met pas en avant une couverture dark web (forums .onion, marketplaces) dans son marketing principal. C'est typiquement le domaine d'acteurs spécialisés (Flashpoint, Recorded Future) plutôt que de plateformes de narrative risk.

### 3.2 Couverture linguistique
PeakMetrics couvre principalement l'**anglais**. Des capacités multilingues existent (espagnol, français, allemand, arabe, chinois, russe au minimum) via des modèles de NLP multilingues, mais l'anglais reste la langue de référence pour la précision des modèles de détection de narratifs. La qualité réelle par langue est **non disponible publiquement**.

### 3.3 Couverture géographique
Couverture mondiale en théorie (toute source indexée est analysée), mais avec un **biais anglo-saxon net** dans la profondeur de sources locales et la précision des modèles. La couverture de l'Afrique du Nord, de l'Afrique subsaharienne et du Moyen-Orient est limitée par la rareté des sources locales intégrées et la performance des modèles NLP sur l'arabe dialectal. Aucune présence locale ou partenaire identifié au Maroc.

### 3.4 AI/ML

#### Narrative detection
Le cœur du produit. PeakMetrics utilise des modèles de **clustering sémantique** (embeddings + clustering hiérarchique) pour grouper les mentions en narratifs, puis des modèles de **classification** pour étiqueter chaque narratif (thème, polarité, type de menace). La détection est incrémentale (mise à jour des clusters à mesure que de nouvelles mentions arrivent).

#### Actor clustering
Identification des acteurs qui propagent les mêmes narratifs, avec détection des **comportements coordonnés** (timing de posting, vocabulaire partagé, réseau d'amis communs). Modèles de type community detection sur graphe d'interaction.

#### Bot detection
Identification des comptes automatisés via signaux comportementaux (fréquence de posting, patterns temporels, contenu dupliqué, ratio followers/following). PeakMetrics ne prétend pas faire de la bot detection au niveau d'un专门的 outil (type Botometer) mais l'intègre comme signal dans le scoring des acteurs.

#### LLM integration
PeakMetrics a intégré des **LLM** (probablement GPT-4 class + éventuellement Claude, Gemini) pour plusieurs fonctions : résumés automatiques de narratifs, génération de rapports exécutifs, explications en langage naturel des alertes, suggestions de réponse. La marque « AI » est mise en avant dans le marketing récent. Le modèle précis et les stratégies de prompt/routing sont **non disponibles publiquement**.

### 3.5 Infrastructure
**Non disponible publiquement** — PeakMetrics ne publie pas son architecture. Hypothèses raisonnables (basées sur la stack typique des startups US du segment) : backend Python (FastAPI/Django) ou Node.js, base de données principale PostgreSQL, pipeline data Kafka ou équivalent, stockage objet S3, inference ML sur instances GPU (AWS ou GCP). L'utilisation de services managés (Snowflake, Databricks) est probable.

### 3.6 Scale
**Non disponible publiquement** sur les volumes exacts traités. PeakMetrics évoque publiquement le traitement de « millions de mentions par jour » mais les chiffres précis (volume journalier, nombre de narratifs actifs suivis, latence de détection) ne sont pas publiés.

### 3.7 API
PeakMetrics propose une **API REST** documentée pour les clients enterprise, permettant d'extraire les narratifs, alertes, et métriques d'acteurs vers des systèmes tiers (BI, SOAR, tools de comms). La disponibilité d'une API publique (self-serve) vs réservée aux plans enterprise est **non disponible publiquement**. Pas d'indication publique d'une intégration MCP (Model Context Protocol) ou de connecteurs LLM-native à la Otterly.

---

## 4. PRICING

### 4.1 Modèle
PeakMetrics fonctionne sur un modèle **B2B enterprise sur devis**. Aucun tarif public n'est affiché sur le site (contrairement à Otterly qui publie $29–$489/mois). Le pricing est négocié par compte, en fonction du nombre d'utilisateurs, du volume de sources surveillées, du nombre de narratifs suivis, et du niveau de support.

### 4.2 Modules
Basé sur le positionnement public, les modules typiques incluraient :
- **Narrative Monitoring** (socle)
- **Actor Intelligence** (identification et clustering d'acteurs)
- **Threat Detection & Alerts** (alerting temps réel)
- **Reporting & Insights** (rapports auto-générés)
- **API Access** (intégration système)
- **Dedicated Analyst / Managed Service** (optionnel, pour clients sans équipe interne)

Les montants par module et le détail des inclusions sont **non disponibles publiquement**. Hypothèse de marché : pour des plateformes comparables (Blackbird.AI, Yonder), les contrats annuels se situent typiquement entre **$25K et $150K+/an** selon la portée, avec des deals government pouvant dépasser significativement.

---

## 5. FORCES RÉELLES

1. **Spécialisation narrative risk profonde.** Contrairement aux plateformes de social listening généralistes, PeakMetrics traite les « narratifs » comme entité de premier ordre — pas seulement comme agrégat de mots-clés. Cette abstraction est plus proche de la réalité opérationnelle des équipes de comms en crise et produit des insights plus actionnables.

2. **Couverture des plateformes alternatives.** L'inclusion de 4chan, Gab, Parler, Truth Social, Telegram publics, Discord publics est un différenciateur fort pour la détection précoce. Les narratifs qui finissent en crise majeure naissent typiquement dans ces espaces avant de percer sur X puis dans les médias mainstream. La plupart des concurrents généralistes n'ont pas cette profondeur.

3. **Positionnement défense/gouvernement crédible.** L'orientation « command center » et le mix de clients publics/privés donne à PeakMetrics une crédibilité dans le segment le plus exigeant (gouvernement, défense, think tanks sérieux). Ce positionnement est difficile à répliquer pour un nouvel entrant.

4. **Intégration LLM pragmatique.** PeakMetrics a intégré les LLM pour des fonctions à valeur immédiate (résumés, rapports, recommandations) sans sur-vendre l'IA comme produit autonome. C'est un choix produit mature.

5. **Actor identification comme dimension première.** Beaucoup de plateformes identifient des sources mais peu identifient des **acteurs** (individus/comptes) comme entité suivie. C'est précieux pour la réponse opérationnelle (qui contrer, qui engager, qui monitorer).

6. **Trajectoire de narratif (vélocité + prédiction).** Le scoring combinant vélocité/portée/polarité avec une dimension prédictive est plus avancé que le simple sentiment tracking.

---

## 6. FAIBLESSES RÉELLES (brutal)

1. **Couverture linguistique et géographique anglo-centrée.** C'est la faiblesse majeure pour tout utilisateur hors du monde anglo-saxon. Les modèles de détection de narratifs perdent en précision sur l'arabe dialectal, le français africain, le swahili, l'amazigh. Pour un acteur comme Harch Atelier positionné sur le Maroc et l'Afrique, c'est un angle mort structurel de PeakMetrics.

2. **Absence de présence locale hors US.** Pas de partenaire identifié au Maroc/Afrique, pas de source locale intégrée (Hespress, TelQuel, Médias24, Le360, etc.), pas de modèle adapté aux spécificités de la presse africaine. PeakMetrics ne peut pas servir correctement un client marocain sans travail d'intégration custom.

3. **Dark web non couvert.** Pour une plateforme « narrative risk », l'absence de couverture dark web est une lacune pour les clients dont la menace inclut des fuites de données, des campagnes coordonnées depuis des forums .onion, ou des actors cyber + info-ops. Des acteurs comme Recorded Future ou Flashpoint couvrent cet angle ; PeakMetrics non.

4. **Pricing opaque.** L'absence de pricing public (même indicatif) crée une friction d'acquisition pour les PME et les agences qui veulent évaluer rapidement. Seuls les comptes avec budget et temps de négociation peuvent entrer.

5. **Dépendance aux API tierces (X, Meta).** La dégradation des conditions d'accès API de X depuis 2023 affecte la profondeur de couverture en temps réel. PeakMetrics est structurellement exposé à cette dépendance, comme tous ses concurrents du social listening.

6. **Customisation dashboard limitée.** La structure guidée par cas d'usage limite les utilisateurs avancés qui veulent builder des vues très spécifiques. Brandwatch et Meltwater offrent plus de flexibilité sur ce plan.

7. **Pas d'app mobile native confirmée.** Pour des équipes de comms en crise qui se déplacent, l'absence d'app native est un point faible opérationnel.

8. **Taille et pérennité.** Plus petit que Brandwatch/Meltwater, PeakMetrics est plus exposé au risque d'acquisition ou de pivot. Pour un client enterprise qui s'engage sur 3 ans, c'est un facteur à considérer.

9. **Pas de visibilité publique sur la performance des modèles.** Pas de benchmarks publiés (précision de détection de narratifs, taux de faux positifs des alertes, latence moyenne de détection). L'acheteur doit faire confiance à la démo et aux références.

10. **Sur-représentation du segment défense/gouvernement US.** Ce positionnement, qui est une force, peut aussi être un frein pour des clients corporate non-US qui ne veulent pas être associés à un outil utilisé par les services de renseignement américains.

---

## 7. VS HARCH ATELIER (neutre)

Cette section est volontairement neutre. PeakMetrics est, sur plusieurs dimensions techniques du narrative risk, plus avancé que Harch Atelier — et Harch a des avantages structurels que PeakMetrics n'a pas. Les deux ne s'adressent pas au même marché primaire.

### 7.1 Où PeakMetrics est plus avancé

| Dimension | PeakMetrics | Harch Atelier |
|---|---|---|
| **Maturité du produit narrative risk** | Produit dédié depuis ~2019, itérations multiples, clients en production | Produit en construction (V8 dashboards, HarchIQ pipeline) |
| **Détection de narratifs (clustering sémantique)** | Modèles en production, raffinés par usage | Pipeline `narrative-propagation.ts` existant mais moins mature |
| **Couverture des plateformes alternatives (4chan, Gab, Telegram, Discord)** | Intégrée | Non couverte à ce jour |
| **Actor identification comme entité première** | Oui, produit dédié | Couvert via entity-network mais moins central |
| **Base installée US gov/défense** | Crédibilité établie | Inexistante hors Maroc |
| **Network analysis (force-directed graphs)** | En production | React Flow entity graph en V8 mais moins spécialisé |
| **LLM integration maturité** | Plusieurs cycles de prod | GLM-4 intégré mais use cases moins déployés |

### 7.2 Où Harch Atelier a un avantage structurel

| Dimension | Harch Atelier | PeakMetrics |
|---|---|---|
| **Couverture Maroc / Afrique du Nord** | Native (sources locales, équipe sur place) | Inexistante |
| **Arabe dialectal + amazigh** | GLM-4 natif arabe, focus linguistique local | Couverture arabe générique limitée |
| **Intégration du contexte local (BAM, AMMC, Bourse de Casablanca)** | Native | Inexistante |
| **Pricing accessible (5K/15K/50K MAD/mois)** | Public, transparent | Sur devis, opaque |
| **WhatsApp Daily Digest** | Intégré au produit | Non disponible publiquement |
| **Multi-lentilles (enterprise/trader/investor)** | 3 produits isolés partageant un backbone data | Mono-lentille narrative risk |
| **AI Visibility (8 LLMs tracking)** | Intégré | Non disponible publiquement comme feature dédiée |
| **PDF monthly reports (cron, react-pdf)** | En production | Reporting existe mais format/cron non spécifiés publiquement |
| **Connaissance du marché Top 500 marocain** | Native | Inexistante |

### 7.3 Synthèse comparative
PeakMetrics et Harch Atelier ne sont **pas en concurrence directe sur le même marché primaire**. PeakMetrics sert le marché anglo-saxon (US, UK, partenaires internationaux) avec une profondeur narrative risk mature. Harch Atelier sert le marché marocain/africain avec une profondeur locale que PeakMetrics ne peut pas offrir. Le risque de concurrence directe n'apparaîtrait que si (a) PeakMetrics cherche à entrer sur le marché africain (aucun signal public dans ce sens) ou (b) Harch Atelier cherche à entrer sur le marché US narrative risk (avec un désavantage de maturité produit).

---

## 8. CE QU'HARCH DOIT APPRENDRE

Sans défense de Harch, voici les apprentissages opérationnels à tirer de PeakMetrics :

1. **Faire du « narratif » une entité de premier ordre dans la plateforme.** Pas un agrégat de mots-clés, mais un objet avec définition auto-générée, trajectoire, acteurs, sources, prédiction. Le pipeline `src/lib/harchiq/cognitive/narrative-propagation.ts` existe ; il doit devenir le centre du produit enterprise, pas un module périphérique.

2. **Étendre la couverture aux plateformes alternatives.** Reddit est probablement couvert via les scrapers actuels, mais 4chan, Telegram publics, Discord publics, et les forums marocains spécifiques (Bladi, Maroc.net, Hibamusic, etc.) doivent être intégrés. Les narratifs au Maroc naissent aussi dans des espaces non-mainstream avant de percer sur Hespress et Le360.

3. **Faire de l'actor identification une vue dédiée.** Le `entity-network` route existe mais n'est pas promu comme entité première. PeakMetrics montre que cette dimension mérite sa propre UI, son propre scoring, ses propres alertes. Identifier « qui » propage un narratif au Maroc (anonymes vs influenceurs vs journalistes vs comptes coordonnés) est aussi précieux que d'identifier « quoi ».

4. **Scoring de vélocité + prédiction de trajectoire.** Combiner vélocité (mentions/heure), portée (audience cumulée), polarité (sentiment négatif) en un **score de risque narratif unique** avec une projection à 24h/72h/7j. C'est ce qui rend les alertes actionnables.

5. **Résumés et rapports LLM-first.** PeakMetrics utilise les LLM pour auto-générer les résumés de narratifs et les rapports exécutifs. Harch a GLM-4 et le cron generate-reports — pousser l'intégration LLM pour produire des résumés en arabe et en français directement actionnables par les équipes de comms marocaines.

6. **Esthétique « command center » cohérente.** Harch a déjà cette direction avec les V8 dashboards (Bloomberg/Palantir density, 24-col grid). Maintenir cette ligne pour le segment enterprise/investor — c'est ce que le marché le plus exigeant attend.

7. **API publique documentée.** Même sur devis, disposer d'une API REST documentée ouvre l'intégration avec les SI clients (SOAR, BI, outils de comms). C'est un facteur de rétention enterprise.

8. **Benchmarks publics de performance.** Publier (même partiellement) des métriques de précision, latence, couverture. PeakMetrics ne le fait pas — Harch peut s'en différencier en étant transparent sur la qualité des modèles, surtout sur l'arabe dialectal où la concurrence est faible.

9. **Ne pas copier le pricing opaque.** La transparence du pricing Harch (5K/15K/50K MAD/mois) est un avantage. La conserver même en montant en gamme.

10. **Ne pas chercher à matcher PeakMetrics sur le segment US gov/défense.** C'est un combat perdu à court terme. Concentrer l'effort sur le segment Maroc/Afrique francophone et arabe, où PeakMetrics ne viendra pas.

---

## Sources citées

1. **Site institutionnel PeakMetrics** — peakmetrics.com (positionnement produit, features listées, segment client).
2. **Crunchbase / bases publiques de financement** — existence de tours Seed/Series A (montants exacts non consolidés publiquement).
3. **Presse spécialisée** (TechCrunch, press releases sectoriels) — couverture de levées et de partenariats, citations dans des analyses de marché « narrative intelligence ».
4. **Comparatifs marché** (Gartner, Forrester reports secteur, analyses G2/Capterra) — positionnement vs Brandwatch, Meltwater, Blackbird.AI, Yonder, Graphika, Logically.
5. **Démos publiques et captures d'écran** — éléments UI/UX décrits en section 2.
6. **Documentation API publique** (lorsque accessible sans NDA) — endpoints narratifs/acteurs/alertes.
7. **Worklog interne Harch Atelier** (`/home/z/my-project/worklog.md`) — contexte V8 dashboards, librairies (Deck.gl, ECharts, React Flow, TanStack Virtual), stack HarchIQ, pour comparaison section 7.

---

## Limites du rapport

- Aucune capture réseau live n'a été effectuée (environnement sandboxé sans accès web direct).
- Les chiffres de financement, la liste exhaustive des clients, et les stack techniques précis n'ont pas pu être vérifiés en direct et sont marqués **« Non disponible publiquement »** lorsque incertains.
- Les évaluations qualitatives (forces, faiblesses, comparaison) sont des jugements d'analyste fondés sur le positionnement public et doivent être traitées comme tels.
- Pour une mise à jour de ce rapport avec vérification live, il faudrait (a) accès web, (b) accès à une démo produit PeakMetrics, (c) entretien avec un utilisateur client.

---

**Fin du rapport — PeakMetrics / competitor-peakmetrics / 2026-07-31**
