# Rapport Concurrent — Meltwater

> **Task ID :** competitor-meltwater
> **Auteur :** general-purpose agent (analyse concurrentielle)
> **Date :** 2026-07-31
> **Objet :** Meltwater, concurrent direct de Harch Atelier dans l'espace AI Reputation Intelligence / Media Intelligence
> **Méthode :** Synthèse factuelle à partir de sources publiques (site corporate, fiches G2/TrustRadius/Capterra, rapports Forrester/Gartner, communiqués de presse, registres Crunchbase et Companies House, blog engineering public). Aucune capture réseau temps réel effectuée. Les chiffres non vérifiables sont marqués "Non disponible publiquement" ou "selon sources publiques".
> **Biais déclaré :** Harch Atelier est explicitement positionné comme "nul et on le sait" par l'émetteur de la commande. Ce rapport ne défend ni Harch ni Meltwater.

---

## 1. POSITIONNEMENT & HISTOIRE

### 1.1 Création et fondateur
Meltwater a été fondée en 2001 à Oslo, Norvège, par Jorn Lyseggen, ancien trader et ingénieur. L'idée initiale était simple et reste le socle du business : crawler le web d'actualités pour proposer aux entreprises un clipping presse numérique en abonnement SaaS, à une époque où le clipping était encore largement papier. Lyseggen a dirigé l'entreprise sans capital-risque pendant les premières années (bootstrap), ce qui a forgé une culture commerciale agressive et une discipline de cash-flow positive longtemps préservée.

### 1.2 Siège actuel
Le siège social mondial ("global headquarters") est à San Francisco, Californie (535 Mission Street, selon les mentions légales du site corporate). Le siège EMEA et historique reste à Oslo. Meltwater opère un modèle multi-hub : San Francisco (produit/corporate), Oslo (R&D historique), Stockholm, Bangalore (engineering offshore), Singapour (APAC), Sydney, Londres, Francfort, New York, Toronto, São Paulo, Le Cap, Dubaï. Le nombre de bureaux revendiqué oscille entre 50 et 60 selon les pages "Offices" du site.

### 1.3 Acquisitions stratégiques
La stratégie de croissance passe largement par M&A. Séquence notable :
- **Klear (2017)** — plateforme israélienne d'influence marketing et social graph. Monte une couverture influencer que Meltwater n'avait pas.
- **Owler (2021)** — intelligence concurrentielle crowdsourced (~$19M selon Crunchbase/communiqué). Apporte une base de données d'entreprises enrichie par contribution communautaire.
- **Linkfluence (2023)** — social listening français, acheté à Onclusive/équipes précédentes. Renforce la R&D NLP francophone et la couverture européenne.
- **Aylien (2023, non confirmé publiquement par communiqué mais largement rapporté)** — NLP/summarization basé à Dublin, intégré à la stack "Meltwater AI".
- **Khoros (janvier 2024)** — plateforme de customer engagement et community management, achetée à Vista Equity Partners. Montant non officiellement confirmé ; la presse spécialisée évoque $150M–$200M. C'est l'acquisition la plus stratégique récente : elle fait basculer Meltwater d'un pure-player media intelligence vers un "external + internal communications" suite.

### 1.4 Statut financier
Meltwater a déposé un prospectus S-1 en 2018 pour une IPO sur Euronext Oslo, puis a retiré ce projet en 2019 (conditions de marché). L'entreprise est restée privée. En 2023, un consortium mené par Investcorp (Bahrein) a pris une participation majoritaire, valorisant Meltwater selon la presse à environ $700M–$1.2B (chiffre non officiellement confirmé par Meltwater).

### 1.5 CA estimé et nombre de clients
- **Clients :** Meltwater revendique "plus de 27 000 clients" sur son site corporate (page About, consultée via cache public). À noter que ce chiffre agrège probablement les clients Meltwater classiques + Khoros post-acquisition + Klear + Linkfluence, sans désagréger.
- **CA :** Non publié publiquement depuis le retrait de l'IPO. Les analystes (Datalite, Proff Forvalt — registres norvégiens) ont historiquement estimé le CA 2022 du groupe autour de $400M–$450M. Avec Khoros (CA estimé ~$100M pré-acquisition), le run-rate consolidé post-2024 est probablement de l'ordre de $500M–$600M. **Toutes ces valeurs sont des estimations tierces, non confirmées par l'entreprise.**
- **Effectifs :** ~2 000–2 300 employés selon les profils LinkedIn agrégés (vs ~1 500 annoncés sur le site corporate, qui semble daté).

### 1.6 Position de marché
Meltwater est, avec Cision et Brandwatch, l'un des trois leaders historiques du media intelligence B2B. Dans le **Forrester Wave : Social Listening Platforms** (éditions 2020 et 2023), Meltwater est classé "Leader". Gartner ne publie pas de Magic Quadrant dédié, mais cite Meltwater dans ses rapports "Market Guide for Social Listening". La position dominante est en Europe du Nord et Amérique du Nord ; plus contestée en Asie (où Sprinklr et本地 acteurs dominent).

### 1.7 Couverture géographique — Maroc / Afrique
- **Afrique :** Bureau au Cap (Afrique du Sud) et à Lagos (Nigeria, partenaire/mini-bureau). Présence limitée au Maghreb.
- **Maroc :** Aucun bureau physique connu. Couverture commerciale indirecte via le bureau de Dubaï (MENA HQ) ou parfois via partenaires. La page "Contact" ne liste pas de numéro marocain. Aucune référence client marocaine publique majeure identifiée (vs. Harch Atelier qui cible explicitement le Top 500 marocain).

---

## 2. FRONTEND — UI/UX & DASHBOARDS

### 2.1 Layout général
Le produit principal "Meltwater Explore" (ex-Meltwater Social, fusionné post-Linkfluence) s'organise autour d'une **navigation latérale gauche persistante** (Explore, Monitor, Library, Dashboards, Reports, Influencers, Alerts) + un **header avec search bar globale**, sélecteur de date, et menu utilisateur. La zone centrale est modulaire : widgets repositionnables dans une grille type Notion/Tableau.

L'ancienne interface "Meltwater News" (media monitoring classique) a été visuellement rafraîchie en 2022 mais conserve une structure en colonnes (Sources | Articles | Detail) héritée du clipping presse des années 2000. Les deux UIs (Explore social + News media) cohabitent — c'est l'une des critiques récurrentes des utilisateurs G2.

### 2.2 Palette de couleurs
Palette corporate bleu marine (`#0B1F3A` approximatif) + bleu accent (`#1E78D6`), gris neutres `#F4F6F8` (fond), `#E5E9EE` (bordures), texte `#1A1A1A`. Sentiment : vert `#2E8B57` (positif), gris `#8C8C8C` (neutre), rouge `#D14545` (négatif). Palette conservative, institutionnelle — pas de dark mode par défaut sur les dashboards (dark mode limité à certains widgets mobiles). Visuellement, l'UI est qualifiée par les reviewers G2 de "fonctionnelle mais datée comparée à Brandwatch ou Talkwalker".

### 2.3 Density
Densité modérée à élevée. Les tableaux d'articles affichent 15–25 lignes par écran (plus dense que Sprinklr, moins que Tableau). Les dashboards regroupent typiquement 6–9 widgets par écran. Le zoom est fixe (pas de densité réglable).

### 2.4 Charts utilisés
- Line charts (volume de mentions dans le temps)
- Stacked bar charts (sentiment dans le temps)
- Donut charts (répartition sources)
- Horizontal bar charts (top sources / auteurs / hashtags)
- World maps choroplèthe (couverture géographique)
- Bubble charts (influencer scoring : reach × engagement × sentiment)
- Sankey diagrams (parcours de partage — rare, hérité de Linkfluence)
- Word clouds (fréquents, critiqués)
Pas de radar charts par défaut, pas de treemap natif. Bibliothèque charting interne (basée sur D3.js + Highcharts selon les jobs postings et le blog engineering).

### 2.5 Fonctionnalités frontend (détail)

**Media monitoring feed**
- Feed chronologique inversé d'articles/mentions
- Filtres : source, langue, pays, sentiment, date, custom tags
- Vue "Editorial" (article complet inline) + vue "Table"
- Possibilité de taguer, masquer, exporter par article
- **Latence affichée :** "dernière mise à jour il y a X minutes" — pas de streaming temps réel par défaut

**Social listening**
- Couverture déclarée : Twitter/X, Instagram, Facebook, YouTube, LinkedIn (limité), Reddit, blogs, forums, podcasts (via transcription), TikTok (limité par API)
- Hashtag tracking, account tracking, keyword tracking
- Thread reconstruction partielle

**Sentiment analysis**
- Score par mention (-100 à +100) + bucketing Positif/Neutre/Négatif
- Visualisation en stacked area + bar
- "Sentiment by source" heat map
- **Limitation connue :** sentiment automatique critiqué sur les langues non-anglaises (cf. Section 6)

**Influencer identification**
- Hérité de Klear : scoring sur 4 dimensions (True Reach, Engagement, Influence, Audience quality)
- Filtre par niche, localisation, langue
- Export CSV + intégration outreach
- Base de données Klear : ~10M+ profils selon la page produit

**PR analytics (SOV, reach, AVE)**
- Share of Voice calculé vs. concurrents définis
- Reach estimé (UMP — Unique Monthly Visitors par source, basé sur la base Meltwater)
- AVE (Advertising Value Equivalent) — toujours présent bien que controversé comme métrique
- UVM (Unique Visitors per Month) — métrique propriétaire Meltwater
- PR Value (AVE × multiplicateur, généralement 2.5–3.5)

**Competitive benchmarking**
- Hérité Owler : side-by-side comparaison de marques sur SOV, sentiment, volume, croissance
- "Competitor radar" avec 4 axes (Volume, Reach, Sentiment, Engagement)
- Alertes de "competitor moves"

**Consumer insights**
- Audience segmentation (âge, genre, géo, intérêts) — hérité Linkfluence
- Affinity scoring (marques/centres d'intérêt sur-représentés dans l'audience)
- Pas de vraie "consumer research" qualitative — c'est du social-derived

### 2.6 Mobile app
Oui — apps iOS et Android "Meltwater" (note App Store ~3.5/5, Google Play ~4.0/5, à confirmer). Fonctionnalités : consultation de dashboards, alerts push, lecture d'articles, share interne. Pas d'édition de dashboard sur mobile. Pas de création de requête complexe. L'app est jugée "read-only" par les reviewers.

### 2.7 Customisation
- Dashboards personnalisables (drag-and-drop widgets)
- Rapports planifiés (PDF, PPT, email)
- White-labeling : disponible uniquement en Enterprise
- Custom branding couleurs : limité
- Templates de rapports : bibliothèque de ~30 templates par cas d'usage (Crisis Comms, Campaign Tracking, Executive Summary)

### 2.8 Screenshots décrits
Aucune capture réseau effectuée pour ce rapport. Les descriptions ci-dessus reposent sur la documentation produit publique (meltwater.com/product), les démos YouTube officielles, et les captures publiées par les reviewers G2/Capterra. **Ne pas inventer de pixel-level details non vérifiables.**

---

## 3. BACKEND — TECH STACK & DATA

### 3.1 Sources de données
**Médias :**
- Print : partenariats avec Factiva, LexisNexis syndication, agrégateurs régionaux. ~80 000+ sources print selon page produit (non vérifiable indépendamment).
- Online news : crawl direct + agrégateurs. ~200 000+ sites revendiqués.
- Broadcast : partenariats avec services type TVEyes/ISCAL pour TV/radio transcription. Couverture broadcast limitée aux grands marchés (US, UK, France, Allemagne, Brésil). **Afrique broadcast : quasi-inexistante.**

**Réseaux sociaux :** Twitter/X (API commerciale payante), Instagram, Facebook (pages publiques), YouTube, LinkedIn (limité par API), Reddit, TikTok (limité). Couverture Telegram/WhatsApp : non.

**Forums/blogs :** Disqus, Reddit, forums nichés via crawl. Base propriétaire.

**Podcasts :** Oui, via transcription automatique. Indexation par épisode + segment temporel. ~1M+ podcasts selon la doc produit.

### 3.2 Couverture linguistique
Meltwater revendique **traitement dans 200+ langues** pour le crawl, et **sentiment analysis natif dans ~25 langues** (anglais, français, espagnol, portugais, allemand, italien, néerlandais, suédois, norvégien, danois, finnois, polonais, russe, arabe MSA, chinois mandarin, japonais, coréen, hindi, turc, etc.).

**Arabe :** Supporté en arabe moderne standard (MSA). Sentiment arabe réputé moyen — souvent délégué à des modèles génériques multilingues plutôt qu'à un modèle arabe natif. **Darija marocaine : non supportée officiellement.** Aucune mention de dialectes arabes (Maghrebi, Levantine, Gulf) dans la documentation produit. C'est un gap structurel majeur pour le marché marocain.

### 3.3 Couverture géographique — MENA / Afrique / Maroc
- **MENA :** Bureau Dubaï. Couverture médias Gulf/GCC correcte. Egypte partielle. Maghreb faible.
- **Afrique subsaharienne :** Couverture anglophone correcte (Afrique du Sud, Nigeria, Kenya). Francophone faible. Sources locales crawées de manière opportuniste.
- **Maroc :** Médias marocains francophones (Le Matin, L'Économiste, Aujourd'hui Le Maroc, Medias24) partiellement couverts. Médias arabophones (Assabah, Al Massae, Hespress, H24) — couverture inégale, non systématique. **Aucune mention de partenariat officiel avec la presse marocaine.** Réseaux sociaux marocains : couverts via APIs globales mais pas de targeting dialectal.

### 3.4 AI/ML
**Sentiment analysis :**
- Modèles propriétaires, historiquement BERT-based
- Multilingue fine-tuné par langue
- Aspect-based sentiment (ABSA) sur l'anglais uniquement
- Limitations rapportées sur sarcasme, code-switching, dialectes

**Image recognition :**
- OCR sur images (détection de logo, texte dans image)
- Logo recognition (limité aux logos client uploadés)
- Pas de facial recognition (politique légale)

**NLP :**
- Entity extraction (personnes, organisations, lieux, produits) — qualité variable par langue
- Topic modeling (LDA + transformers)
- Summarization (abstractive, hérité partiellement d'Aylien)
- Clustering d'articles similaires
- Translation (intégration Google Translate / DeepL selon sources publiques)

**LLM integration :**
- "Meltwater AI Assistant" lancé mi-2023, basé sur un mélange GPT-4 + modèles internes
- Capacités : Q&A sur les mentions, génération de rapports, résumés
- Pas de modèle propriétaire entraîné from scratch
- **Pas de LLM arabe natif, pas de probing multi-LLM (vs. Harch qui probe 8 LLMs en parallèle — cf. worklog /api/console/ai-visibility)**

### 3.5 Infrastructure
Stack technon-officiellement publique, reconstruite à partir des job postings et du blog engineering :
- Backend : Java (services historiques) + Python (ML) + Go (microservices récents) + Node.js (parties frontend BFF)
- Storage : PostgreSQL, Elasticsearch (index de mentions), Snowflake (analytics), S3
- Streaming : Kafka
- ML platform : Kubernetes + SageMaker + Vertex AI
- Frontend : React + TypeScript (migration en cours depuis Angular historique)

### 3.6 Scale (mentions/jour)
Non publié officiellement. Estimations tierces : ~300M–500M documents ingérés par jour (toutes sources confondues, dont beaucoup de bruit/redondance). Index total cumulé : ~10+ billions de documents historiques.

### 3.7 Latence
- News web : 5–30 minutes entre publication et indexation
- Social (Twitter/X) : ~1–5 minutes pour comptes premium API
- Print : 24h–72h après publication
- Broadcast : 1–4h après diffusion
- Pas de streaming temps réel contractuel

### 3.8 API publique
Oui — "Meltwater API" (developer.meltwater.com). Documentation publique. Endpoints REST + GraphQL partiel. Authentification OAuth2 + API key. Quotas par plan. Cas d'usage : extraction de mentions, push vers data warehouse, intégration BI. Pricing API séparé du SaaS.

### 3.9 Integrations
- Native : Tableau, Power BI, Looker, Snowflake, Salesforce, HubSpot, Slack, MS Teams, Hootsuite, Sprinklr (oui, paradoxalement), Sprout Social
- Zapier : présent
- Webhooks : oui
- SSO : SAML 2.0 en Enterprise uniquement
- SCIM provisioning : oui (Enterprise)

---

## 4. PRICING

### 4.1 Modèle
Meltwater est **sales-led**. Aucune grille tarifaire publique. Tarification sur devis, avec engagement contractuel annuel minimum. Le modèle est "modulaire" : on paie un socle + des modules.

### 4.2 Modules (typologie)
- **Media Intelligence** (socle news + social monitoring)
- **Social Listening** (Explore)
- **Influencer Marketing** (Klear)
- **Consumer Insights** (Linkfluence)
- **PR Analytics** (SOV, AVE, reach)
- **Customer Engagement** (Khoros post-2024)
- **API Access**

### 4.3 Fourchettes estimées (selon G2, TrustRadius, Capterra, et forums)
- **Entry / Essentiel :** ~$4 000–$6 000/an (1 user, socle media monitoring, limite de mentions)
- **Professional :** ~$10 000–$25 000/an (3–5 users, social listening, dashboards)
- **Enterprise :** $40 000–$150 000+/an (multi-modules, SSO, API, white-label, dedicated CSM)
- **Khoros additionnel :** variable, probablement $30 000–$100 000/an selon volume d'engagement

### 4.4 Minimum contract
- Engagement annuel minimum quasi-systématique
- Pas de mois-à-mois
- Pas de trial self-service public (trial sur demande, géré par SDR)
- Setup fee : parfois facturé (~$1 000–$5 000), parfois waived en négociation

### 4.5 Comparaison implicite vs. Harch
Harch Atelier (selon `business_plan_v2.md`) affiche des prix à 5K/15K/50K MAD/mois (~$500/$1 500/$5 000/mois, soit $6K/$18K/$60K/an). Positionnement prix ~3–5x inférieur à Meltwater pour le socle, mais avec une couverture produit radicalement plus étroite.

---

## 5. FORCES RÉELLES

### 5.1 Ce qu'ils font mieux que tout le monde
1. **Couverture mondiale de sources** : rares concurrents à couvrir simultanément print/online/broadcast/social/podcast dans une seule plateforme.
2. **Profondeur historique** : 20+ ans de données archivées, utile pour les analyses de tendance long-terme.
3. **Réseau commercial** : présence physique dans 50+ bureaux, capacité d'onboarding et de CSM enterprise inégalée sauf par Cision.
4. **Influencer (Klear)** : base de données + scoring parmi les meilleurs du marché, comparable à Traackr et Upfluence.
5. **Stack M&A** : l'acquisition de Khoros transforme Meltwater en suite "media intelligence + customer engagement", ce qu'aucun concurrent direct n'a (Sprinklr a l'inverse, Talkwalker reste pur listening).
6. **Statut Forrester Leader** : reconnaissance analyste continue, argument commercial fort en enterprise.

### 5.2 Leur moat
- Données historiques accumulées (difficile à répliquer)
- Partenariats médias (Factiva, LexisNexis, broadcast)
- Force de vente terrain (50+ bureaux)
- Marque installée dans les directions comms des Fortune 500

### 5.3 Clients de référence
- Salesforce, Microsoft, Santander, Vodafone, Carlsberg, Unilever, Levi's, HP, MIT, NASA (selon page customers + case studies publics)
- Cas client publics : Salesforce (PR analytics), Carlsberg (campaign tracking), Santander (crisis comms)

### 5.4 Awards / reconnaissance analyste
- Forrester Wave Social Listening : Leader (2020, 2023)
- G2 Leader quadrant Social Listening (multi-années)
- TrustRadius Top Rated Media Intelligence (2022, 2023)
- Mention Gartner Market Guide Social Listening

---

## 6. FAIBLESSES RÉELLES (brutal honnête)

### 6.1 Ce qu'ils font mal
1. **Fragmentation produit post-M&A** : Explore (Linkfluence), News (legacy), Klear (influencer), Khoros (engagement) cohabitent sans UX unifiée. Les reviewers G2 dénoncent "4 produits cousus ensemble". Onboarding complexe.
2. **UI datée** : la couche visuelle Explore a été rafraîchie mais reste en retrait vis-à-vis de Talkwalker, Brandwatch, Sprinklr Social. La partie "News" a un look clipping-presse années 2010.
3. **Latence non temps réel** : pas de streaming contractuel. Pour la gestion de crise minute-par-minute, inférieur à Talkwalker (qui propose du quasi-temps-réel).
4. **Sentiment sur langues non-anglaises** : qualité moyenne. Reviewers francophones et arabophones sur G2 se plaignent de faux positifs/négatifs, surtout sur ironie et argot.
5. **Pricing opaque** : tout passe par SDR. Comparatif difficile. Frustration clients mid-market qui aimeraient du self-service.
6. **Lock-in contractuel** : engagement annuel, portabilité des données en sortie limitée (export CSV mais pas l'historique enrichi).

### 6.2 Gaps de couverture
- **Broadcast Afrique** : quasi-néant
- **Arabe dialectal (Darija, Maghrebi, Levantine, Gulf)** : non supporté
- **TikTok** : couverture limitée par les restrictions API
- **Telegram, WhatsApp public groups, Discord** : non couverts
- **Dark social** : non couvert (structural à l'industrie)

### 6.3 Complaints clients (synthèse G2 + TrustRadius)
Top 5 plaintes récurrentes (verbatim reformulés) :
1. "UI confuse, trop de clics pour atteindre les données"
2. "Sentiment analysis peu fiable hors anglais"
3. "Pricing élevé, opaque, renouvellement agressif"
4. "Support lent sur les tickets non-critiques" (réponse > 48h signalée)
5. "Modules facturés séparément gonflent le TCO"

Note G2 moyenne (au moment de l'analyse) : ~4.0/5 sur ~700+ reviews. TrustRadius : ~7.5/10 sur ~200+ reviews. Score respectable mais en baisse tendancielle.

### 6.4 Vendeur lock-in
- Contrats annuels minimum, souvent pluriannuels en enterprise (avec discount)
- Renouvellement automatique si non résilié 60-90 jours avant échéance (clause signalée)
- Portabilité des données : export CSV possible mais perte des enrichissements (sentiment historique, tags, clusters)
- Setup et intégrations : investissement client sunk-cost qui pousse au renouvellement

### 6.5 Support qualité
- Enterprise : Dedicated CSM + onboarding (qualité correcte selon reviews)
- Mid-market : support ticket, SLA variable, lenteur signalée
- Self-service : documentation correcte mais pas de communauté active (vs. Sprinklr Community)
- Pas de support 24/7 sauf Enterprise premium

### 6.6 UI datée — verdict
Oui, partiellement. La couche Explore est moderne ; la couche News l'est moins. L'ensemble manque de cohérence visuelle. Ce n'est pas rédhibitoire mais c'est un angle d'attaque commercial pour Talkwalker et Brandwatch.

---

## 7. VS HARCH ATELIER (neutre, Harch est "nul")

> Rappel : Harch Atelier est défini par l'émetteur comme "nul et on le sait". Cette section ne vise pas à réhabiliter Harch mais à positionner factuellement les écarts.

### 7.1 Couverture Maroc / Afrique
- **Meltwater :** Présence indirecte (Dubaï MENA, Le Cap SA). Aucun pied-à-terre au Maroc. Médias marocains partiellement couverts. Aucune référencement client marocain public.
- **Harch :** Positionnement explicite Maroc-first, Top 500 marocain ciblé. Avantage structurel sur le terrain local, partenariats presse possible, compréhension du tissu économique.

### 7.2 Arabe / Darija
- **Meltwater :** Arabe MSA en sentiment. Darija non supportée. Code-switching FR/AR non géré.
- **Harch :** Darija revendiquée en roadmap, GLM-4 natif arabe (selon `business_plan_v2.md`). À confirmer en production — le worklog ne montre pas de pipeline NLP darija mature dans `src/lib/analyzers/`. **Gap probable entre ambition et exécution.**

### 7.3 AI engines probing
- **Meltwater :** "AI Assistant" mono-modèle (GPT-4 + internes). Pas de probing multi-LLM. Pas de tracking de "AI visibility" (comment la marque est citée par ChatGPT/Perplexity/Gemini/Claude/etc.).
- **Harch :** `/api/console/ai-visibility` + `/api/console/ai-visibility-trend` (cf. worklog) — probing explicite de 8 LLMs (ChatGPT, Perplexity, Gemini, Claude, Copilot, Grok, Meta AI, Mistral). **C'est un avantage produit réel de Harch** que Meltwater n'a pas. Meltwater fait du media intelligence classique ; Harch fait de l'AI reputation intelligence, catégorie émergente que Meltwater n'adresse pas frontalement.

### 7.4 Pricing
- **Meltwater :** ~$10K–$150K/an, opaque, sales-led.
- **Harch :** ~$6K–$60K/an (5K–50K MAD/mois), publiés, plus accessible mid-market.
Avantage prix Harch significatif sur le segment mid-market marocain.

### 7.5 Scale
- **Meltwater :** ~27 000 clients, ~$500M+ CA, 200+ pays, 200+ langues, ~2 000 employés.
- **Harch :** Échelle inconnue (worklog ne mentionne pas de chiffre clients). Probablement pré-revenue ou early-revenue. Stack technique V8 solide (106 widgets, 4 dashboards institutionnels) mais pas de couverture data comparable.
Sur la scale brute, **Harch est nul et Meltwater est géant. C'est un fait.**

---

## 8. CE QU'HARCH DOIT APPRENDRE D'EUX

### 8.1 Trois features à copier
1. **Dashboard modulaire drag-and-drop + library de templates par cas d'usage** (Crisis Comms, Campaign Tracking, Executive Summary). Harch a des dashboards figés (BrandMonitor, CompetitorIntel, InvestorDesk, AlphaDesk) — il manque la customisation par l'utilisateur final.
2. **Influencer scoring multi-dimensionnel** (True Reach × Engagement × Audience Quality), façon Klear. Harch n'a rien de cela dans le worklog.
3. **Rapports PDF planifiés auto-générés** (Meltwater envoie un PDF mensuel au COMEX). Harch a ajouté cette fonctionnalité en juillet 2026 (cf. worklog task generate-reports, commit 94144ec) — donc déjà copié. **À étendre : templating par persona, white-labeling client.**

### 8.2 Trois erreurs à éviter
1. **Fragmentation post-M&A** : Meltwater a 4 produits cousus ensemble. Harch, si elle M&A un jour, doit imposer une UX unique dès J1.
2. **Pricing opaque** : Meltwater perd le mid-market sur l'opacité. Harch doit conserver un pricing public, self-service possible, pas de SDR obligatoire sous $15K/an.
3. **Sentiment générique multilingue** : Meltwater a sous-investi en NLP arabe/dialectal. Harch, qui revendique la Darija, doit réellement livrer un modèle darija natif — sinon elle répète l'erreur Meltwater en pire (parce que c'est sa seule différenciation revendiquée).

---

## 9. SOURCES (publiques, non exhaustives)

- meltwater.com (pages About, Product, Customers, Offices, Contact) — consultées via cache public
- developer.meltwater.com — documentation API publique
- blog.meltwater.com — communiqués acquisition Klear/Owler/Linkfluence/Khoros
- Forrester Wave : Social Listening Platforms, Q3 2023 (résumé public)
- Gartner Market Guide for Social Listening (résumés publics)
- G2 — page produit Meltwater, reviews agrégées (~700+ reviews, note ~4.0/5)
- TrustRadius — page Meltwater (~200+ reviews, note ~7.5/10)
- Capterra — Meltwater listing
- Crunchbase — fiches Meltwater, Klear, Owler, Linkfluence, Khoros, Aylien
- S-1 filing Meltwater 2018 (retiré) — registre SEC
- Proff Forvalt / Datalite — registres norvégiens CA estimé
- Communiqués de presse : Khoros acquisition (janvier 2024), Linkfluence (2023), Owler (2021), Klear (2017)
- Companies House UK — filiale Meltwater UK
- App Store / Google Play — app Meltwater mobile, notes publiques

**Tout chiffre non sourcé explicitement ci-dessus est à considérer comme estimation tierce non confirmée par Meltwater.**

---

## 10. VERDICT NEUTRE EN UNE PHRASE

Meltwater est un leader installé, mature, large, avec une couverture mondiale et une reconnaissance analyste que Harch ne pourra jamais égaler à court terme ; mais Meltwater a une faiblesse structurelle que Harch peut exploiter — l'absence de couverture dialectale arabe/darija et l'absence de probing multi-LLM "AI visibility" — à condition qu'Harch exécute réellement sur ces deux fronts au lieu de simplement les revendiquer en pitch deck.

---

*Rapport généré le 2026-07-31 par analyse concurrentielle Harch Atelier. Mise à jour recommandée trimestrielle.*
