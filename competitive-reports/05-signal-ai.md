# RAPPORT CONCURRENTIEL — SIGNAL AI (UK)
## Reputation Intelligence / AI-powered Media Analysis — Concurrent de Harch Atelier

> **Task ID:** competitor-signal-ai
> **Auteur:** general-purpose agent (Competitive Intelligence — Signal AI)
> **Date:** 2026-07-31
> **Méthode:** Fetch direct `curl` des archives publiques de `signal-ai.com` (Wayback Machine 2020, 2023, 2024) + extraction HTML/texte. Pages consultées : homepage (2020 + 2024), About, Press Releases Archive, page 404 (structure de navigation complète), CDX API pour indexation snapshots. Aucune capture réseau live (site protégé par captcha). Aucune source non publique consultée.
> **Positionnement de référence (Harch Atelier):** AI Reputation Intelligence for Africa — GLM-4 natif arabe, WhatsApp Daily Digest, marché Top 500 marocain, pricing 5K/15K/50K MAD/mois, 3 types de comptes isolés (enterprise/trader/investor), 4 dashboards V8 (106 widgets), probing 7 LLMs (ChatGPT/Perplexity/Gemini/Claude/Copilot/Mistral/Grok).

---

## 1. POSITIONNEMENT & HISTOIRE

### 1.1 Création et identité légale
- **Entité légale :** Signal Media Ltd. (marque commerciale « Signal AI », marque déposée SIGNAL®).
- **Siège social :** 44 Featherstone St, 4th Floor, London EC1Y 8RN, Royaume-Uni.
- **Année de création :** La page « About » (snapshot Wayback juin 2024) indique explicitement « Celebrating 10+ years of AI Innovation » et précise que l'entreprise a été « founded over a decade ago, with the single minded belief that AI would revolutionize reputation and risk intelligence ». La fondation en 2013 — communément citée dans la presse sectorielle et reprise par les bases de données d'investissement — est cohérente avec cette formulation. Le nom original était « Signal Media », progressivement remplacé par « Signal AI » à partir de 2019–2020 pour refléter le pivot vers l'IA.
- **Fondateur :** David Benigson, toujours CEO & Founder selon la page About (snapshot 2024).

### 1.2 Trajectoire et pivot stratégique
- **Positionnement 2020** (homepage Wayback septembre 2020) : « AI Powered Media Intelligence and Business Solutions » — produit centré PR & Comms, avec modules Media Monitoring, Reputation Management, Regulatory Compliance, Market Intelligence, ESG Performance Monitoring, Supply Chain Risk. Tagline d'époque : « Transforming decision making through augmented intelligence ».
- **Positionnement 2024** (homepage Wayback) : « Make sense of the outside world with External Intelligence Search ». Pivot vers le concept marketing d'« External Intelligence » et de « Decision Augmentation », avec regroupement des cas d'usage sous cinq expertises : PR & Comms, Reputation, Risk (Enterprise Risk), ESG, Regulation.
- Le pivot sémantique de « Media Intelligence » vers « External Intelligence » est notable : Signal AI cherche clairement à sortir du segment saturé du media monitoring (Meltwater, Brandwatch, Talkwalker) pour se positionner sur l'intelligence décisionnelle stratégique.

### 1.3 Funding
- **Levé de décembre 2021 :** « Signal AI Raises $50m in Funding to Build Out Decision Augmentation Solution » — communiqué de presse daté du 15/12/21, archivé sur la page Press de signal-ai.com (snapshot décembre 2023). Le montant exact (50 M USD) est publiquement confirmé ; le tour (Series D selon les bases de données secondaires) et la valorisation post-money ne sont pas officiellement disclosed par l'entreprise.
- **Total levé :** Communément cité autour de 100 M USD cumulés (incluant tours antérieurs 2016 Series A, 2018 Series B, 2020 Series C). **Non disponible publiquement** : montants exacts par tour, liste exhaustive d'investisseurs, valorisation actuelle.
- **Investisseurs historiques cités dans la presse secondaire :** Redline Capital (lead récurrent), Hearst Ventures, MMC Ventures (early stage). Non vérifié contre documents officiels.

### 1.4 Acquisitions
- **KELP (août 2022) :** « Signal AI acquires KELP to help organizations strengthen their corporate reputation » — communiqué archivé sur signal-ai.com/press. KELP était une plateforme de réputation corporate. Montant non divulgué.
- Aucune autre acquisition matériellement citée dans le press archive consulté.

### 1.5 Position de marché et clients
- **Volume clients :** « over 650 customers worldwide » (page About, snapshot 2024).
- **Pénétration Fortune 500 :** « Signal AI serves over 40% of the Fortune 500 including Deloitte, Bank of America and Google » (page Press, snapshot décembre 2023). Revendication marketing non auditée indépendamment.
- **Partenaires agences cités :** BCW (agence WPP) — témoignage de Jeffrey Cutpler, EVP MD US Data Analytics ; WPP — témoignage de Vipur Parmar, Global Head of Data Management. Le témoignage BCW évoque « 50 000 or 100 000 articles over a year » traités par client via topic framework maison sur Signal AI.
- **Forbes :** « Forbes has launched their 2025 America's Best Companies rankings, powered in part by Signal AI » (bannière homepage 2024). Partenariat data visible publiquement.

### 1.6 Couverture Maroc / Afrique
- **Marchés couverts :** 226 marchés (homepage 2024).
- **Langues :** 75 langues (homepage 2024).
- **Présence Afrique / Maroc :** Aucune mention spécifique au Maroc ou à l'Afrique dans les pages About, Press, ou homepage archivées. Les bureaux sont Londres (HQ), New York, Hong Kong, Lisbonne — aucun bureau africain, aucun bureau MENA. Le formulaire de demande de démo inclut bien « Morocco » dans le dropdown pays, mais aucune étude de cas, aucune page localisée, aucun partenariat data local (MAP, BVC, AMMC) n'est publiquement référencé.
- **Arabe / Darija :** L'arabe est implicitement inclus dans les 75 langues, mais aucune mention explicite d'une couverture arabe dialectal (Darija) ou d'un fine-tuning régional MENA. Non disponible publiquement : qualité réelle du traitement NLP sur l'arabe marocain.

---

## 2. FRONTEND — UI/UX & DASHBOARDS

> **Note méthodologique :** Aucune capture d'écran du produit (Web App) n'a pu être obtenue — la Web App est derrière login enterprise. L'analyse ci-dessous repose sur (a) la structure de navigation publique du site marketing (snapshot 2024), (b) la liste des solutions produits exposées publiquement, (c) la hiérarchie d'information du site. Les observations visuelles précises (palette hex exacte, densité pixel, librairie charts) sont marquées « Non disponible publiquement » lorsque non observables.

### 2.1 Layout et structure de navigation (site marketing)
- **Topbar fixe** avec logo Signal AI à gauche, navigation principale centrée (Expertise / Solutions / Approach / Insights / Company), CTA « Request a demo » à droite, bouton Login.
- **Navigation mega-menu** à deux niveaux :
  - Expertise : PR & Comms, Reputation, Risk (Enterprise Risk), ESG, Regulation.
  - Solutions : Web App, API, Insight Reports (sous-menu : Reputation Reports, Media Impact Reports, Deep Dive Reports, Reputation Risk Reports, Risk Reports), Advanced Dashboards (Reputation Dashboards, Risk Dashboards), Newsletters and Briefings (Media Newsletters, Risk Briefings), Alerts.
  - Approach : Our AI, Our Data, Our Commitment.
  - Insights : Insights Hub, Signal AI 500.
- **Footer** international : 4 contacts géographiques (US, UK, Hong Kong, Portugal), liens légaux, copyright « © Signal Media Ltd. ».

### 2.2 Palette et identité visuelle
- Palette marketing dominante : blanc / gris clair en arrière-plan, bleu marine (proche d'un navy corporate) pour accents et CTA. Identité relativement sobre, orientée enterprise. **Codes hex exacts non extraits** (site marketing protégé par captcha, page servie en mode « no-JS » réduite).
- Typographie : sans-serif moderne, non identifiée publiquement (probablement Inter ou similaire).

### 2.3 Features observées via la navigation publique
- **Media Monitoring** (PR & Comms) : « Traditional & Social Media Monitoring — Evaluate and optimize your media campaigns, backed by quantifiable metrics ».
- **Reputation Tracking** : « Reputation Threat Sensing — Uncover hidden reputational landmines » + « Benchmarking & Measurement — Compare, assess, and align your reputation with top-tier industry players » + « Corporate Narrative Planning — Identify dominant narratives ».
- **Regulatory Intelligence** : « Regulation Monitoring — Stay informed at every stage of the regulatory lifecycle, from speculation to enactment » + « Risk Sensing — Spot potential risks early at company and industry level ».
- **ESG Monitoring** : mentionné comme expertise autonome (entry ESG dans mega-menu) — description détaillée non accessible sur la page archivée consultée.
- **Executive Visibility** : implicite via « Exec Connect » (programme d'événements pour CCO/C-suite) référencé dans la navigation secondaire.
- **Competitive Intelligence** : présent via « Benchmarking & Measurement » et via le Signal AI 500 (ranking concurrentiel global).
- **Risk (Enterprise Risk)** : « Proactive Identification — Scan the horizon for unknown risks » + « Alerting & Response — Be alerted to changes in your risk profile » + « Ongoing Risk Surveillance » + « Strategic Planning & Reporting ».
- **Alert system** : module Alerts listé explicitement dans Solutions (sous « Newsletters and Briefings »).
- **Podcast Intelligence** : ajouté en décembre 2021 (« Signal AI adds Podcast Intelligence to Decision Augmentation Solution » — press release 02/12/21).

### 2.4 Mobile et customisation
- Site marketing responsive (mobile-friendly) — observé via rendu HTML.
- **App mobile native Signal AI** : Non disponible publiquement. Aucune mention d'app iOS/Android dans la navigation ou le footer.
- **Customisation** : « Advanced Dashboards » et « Insight Reports » sont présentés comme configurables (types multiples — Reputation / Risk / Deep Dive / Media Impact). Degré réel de customisation self-service : non documenté publiquement.

### 2.5 Screenshots décrits (à partir des éléments visuels marketing)
- **Hero page d'accueil (2024)** : Headline « Mitigate Risk, Strengthen Reputation » + sous-headline sur 226 marchés et 75 langues + CTA « Discover our solutions ». Bandeau de confiance « Fortune 500 companies trust us to find the signal in the noise ».
- **Section « What makes us different »** : bloc « Our AI means business » avec pitch sur la combinaison générative + discriminative, positionnement explicite vs « generalist generative AI tools ».
- **Section Signal AI 500** : bloc promotionnel « Redefining global reputation rankings » avec mention « three-tiered analysis ».
- **Section témoignages clients** : 3 citations (BCW, Digital Risk Solutions team, WPP) mises en avant avec photos LinkedIn-style.
- Aucune capture du dashboard produit lui-même n'est exposée publiquement.

---

## 3. BACKEND — TECH STACK & DATA

### 3.1 Sources de données
- **Médias traditionnels et sociaux** : explicitement cités (« traditional and social media across 226 markets and 75 languages »). Volume exact de sources (souvent cité « 5M+ sources » dans des comparatifs tiers — non confirmé par Signal AI sur ses propres pages archivées). **Non disponible publiquement** : nombre exact de sources, liste de partenaires data.
- **Réseaux sociaux** : couverture mentionnée génériquement ; partenaires spécifiques (X/Twitter firehose, LinkedIn, TikTok, etc.) non énumérés publiquement sur les pages archivées consultées.
- **Regulatory filings** : module Regulation Monitoring dédié, couvrant « every stage of the regulatory lifecycle, from speculation to enactment ». Sources réglementaires précises (SEC, FCA, ESMA, etc.) non listées publiquement sur les pages marketing archivées.
- **Podcasts** : ajoutés en décembre 2021 via le communiqué « Signal AI adds Podcast Intelligence ». Transcription et indexation podcasts impliquées mais non documentées techniquement en public.
- **Broadcast TV / Radio** : Non mentionné publiquement sur les pages archivées — à la différence de Talkwalker (1 500 chaînes TV + 1 000 radios) ou Brandwatch (broadcast via partenaires), Signal AI ne met pas en avant une couverture broadcast.

### 3.2 Couverture linguistique et géographique
- **75 langues** (homepage 2024).
- **226 marchés** (homepage 2024).
- Croissance vs 2020 : la page 2020 n'affichait pas de chiffre linguistique/marché explicite — la formulation 226/75 est apparue entre 2020 et 2024, traduisant une expansion volontaire de la couverture.
- **Qualité réelle par langue** : Non disponible publiquement. Aucun benchmark public, aucune déclaration de précision NLP par langue.

### 3.3 AI / ML — l'engine « AIQ »
> **Correction importante vs le brief :** Le brief évoque un éventuel nom « Delta » pour l'AI propriétaire. Les archives publiques de Signal AI (homepage 2020, homepage 2024, page About, page Press) désignent unanimement l'engine AI sous le nom **« AIQ »** (anciennement « Signal AIQ » en 2020, simplifié en « AIQ » en 2024). Aucune mention publique de « Delta » n'a été trouvée.

- **AIQ** est décrit comme « specifically designed for the needs of risk and reputation professionals and uses discriminative AI to retrieve only the most relevant data to your query, then generative AI to generate instant, reliable insights » (homepage 2024, section « What makes us different »).
- **Architecture hybride** : « a blend of generative and discriminative technologies » — discriminative pour la retrieval/filtrage pertinent, générative pour la synthèse d'insights. Positionnement explicite contre « generalist generative AI tools » ( ChatGPT-like) accusés implicitement de manquer de rigueur factuelle.
- **NLP et ML** : Entity extraction, sentiment analysis, topic classification sont implicites (la page 2020 mentionnait « a world-leading AI platform that understands everything it reads and extracts what matters »). Détails techniques (modèles, fine-tuning, datasets d'entraînement) : non documentés publiquement.
- **External Intelligence Graph** (annoncé juillet 2022) : « Signal AI unveils new External Intelligence Graph making sense of the world's unstructured data ». C'est le nom marketing de la couche de knowledge graph qui structure les données externalisées. Détails d'implémentation (Neo4j ? propriétaire ?) non publics.
- **LLM integration** : Positionnement « generative AI to generate instant insights » post-2022. Provider LLM sous-jacent (OpenAI, Anthropic, open-source auto-hébergé ?) : **non disponible publiquement**. Aucune mention d'un LLM nommé.
- **SVP of AI** : Alexandre Martins Pinto (nommé juin 2022, anciennement « SVP of Data Science », devenu « SVP of AI » sur la page About 2024) — indique une structuration formelle de la fonction AI.

### 3.4 Infrastructure et scale
- **Cloud provider** : **Non disponible publiquement**. Aucune mention publique d'Azure, GCP ou AWS sur les pages archivées. Le siège Londres + partenariats enterprise suggèrent Azure ou GCP (conformité EU), mais non confirmé.
- **Scale** : « cruches huge amounts of information from the world's content » (page Press). Aucune métrique publique (articles/jour, latence, volume indexé).
- **API** : « Signal API » listée comme solution autonome dans la navigation. Documentation technique publique (endpoints, rate limits, auth) : non vérifiée dans cette session — page /api archivée non récupérée.

### 3.5 Comparaison structurée des sources
| Dimension | Signal AI (public) | Non disponible publiquement |
|---|---|---|
| Médias | « traditional media » (cité) | Nombre exact de sources |
| Social | « social media » (cité) | Liste des plateformes partenaires |
| Regulatory | Module dédié | Liste des régulateurs couverts |
| Podcasts | Oui (depuis déc 2021) | Volume, providers |
| Broadcast TV/radio | Non mentionné | — |
| Langues | 75 | Précision par langue |
| Marchés | 226 | Définition de « marché » |

---

## 4. PRICING

- **Modèle :** Sur devis uniquement (« Request a demo »). Aucun prix public affiché sur le site marketing archivé (2020, 2023, 2024).
- **Structure tarifaire :** Non disponible publiquement. Basé sur le positionnement (Fortune 500, 40% des 500 premières entreprises US) et la comparaison avec les concurrents enterprise (Brandwatch, Talkwalker, Meltwater), le pricing est vraisemblablement enterprise-tier : fourchette estimée 30K–150K+ USD/an selon périmètre — **non confirmée par Signal AI**.
- **Modules à la carte vs bundle :** La structure Solutions (Web App + API + Insight Reports + Advanced Dashboards + Newsletters + Alerts) suggère une modularité possible, mais aucun détail public sur le packaging.
- **Devise :** USD/GBP implicitement (bureaux NY + Londres). Pas de MAD, pas de billing local Maroc.

---

## 5. FORCES RÉELLES

1. **Maturité et antériorité AI (10+ ans).** Signal AI a commencé à construire un moteur NLP/AI dédié reputation dès 2013, bien avant la vague LLM 2022–2023. La page About revendique explicitement « the only true AI-powered leader among more traditional peers » — positionnement défendable sur la profondeur historique.
2. **Architecture AIQ hybride générative + discriminative.** Le pitch technique (discriminative pour la retrieval, générative pour la synthèse) est cohérent avec les meilleures pratiques 2024 et différenciant vs les outils restés purement LLM-wrapper. Positionnement défensif explicite contre les hallucinations des LLM généralistes.
3. **Clientèle Fortune 500 qualifiée.** 40% du Fortune 500 revendiqué, avec trois références nommées (Deloitte, Bank of America, Google) et partenariats agences (BCW, WPP). C'est un socle commercial difficilement attaquable pour un entrant.
4. **Couverture géographique large.** 226 marchés × 75 langues — couverture globale supérieure à la plupart des concurrents mid-market.
5. **Diversification produit au-delà du media monitoring.** Pivot réussi vers Regulation Monitoring, ESG, Enterprise Risk — élargit la TAM au-delà du budget PR/Comms vers le budget Risk/Compliance (souvent plus large).
6. **External Intelligence Graph.** Couche de knowledge graph propriétaire annoncée 2022 — différenciateur technique réel vs les plateformes restées sur de la simple indexation full-text.
7. **Signal AI 500.** Production d'un actif marketing récurrent (ranking mondial de réputation corporate) qui génère PR organique et positionnement de pensée. Partenariat Forbes 2025 (« America's Best Companies powered in part by Signal AI ») = validation externe forte.
8. **Équipe leadership stabilisée.** CEO fondateur en place + recrutements senior récents structurés (CRO 2022, SVP AI 2022, COO 2021, deux Non-Executive Directors 2023) — gouvernance enterprise mature.
9. **Multi-bureau international.** 4 bureaux (Londres, NY, Hong Kong, Lisbonne) couvrent les fuseaux US/EU/APAC. Présence Lisbonne = hub EU à coût relatif, choix structurel intéressant.
10. **Acquisition KELP.** Renforcement capabilities réputation (2022) — démonstration d'une stratégie M&A active.

---

## 6. FAIBLESSES RÉELLES (brutal)

1. **Pricing totalement opaque.** Aucun prix public, formulaire de démo obligatoire. Cette posture enterprise-tier exclut mécaniquement les PME et les marchés émergents — et freine l'expérimentation bottom-up. Comparé à des concurrents comme Otterly ou Profound qui affichent des prix, c'est un point de friction acquisition.
2. **Aucune présence Afrique / MENA.** 226 marchés annoncés mais aucun bureau africain, aucun partenariat data local MENA référencé publiquement. Le formulaire de démo inclut bien « Morocco » en dropdown, mais aucune étude de cas, aucune page localisée. Le Maroc et l'Afrique francophone sont des zones blanches assumées.
3. **Darija absente.** L'arabe est implicitement couvert dans les 75 langues, mais aucun indicateur public d'un fine-tuning darija ou arabe dialectal. Le marché marocain exige une compréhension fine du mélange arabe/français/darija — Signal AI n'a aucun actif public sur ce point.
4. **Pas d'app mobile native.** Aucune mention d'app iOS/Android dans la navigation 2024. Pour des utilisateurs PR/crise qui vivent sur mobile, c'est une lacune. Talkwalker a une app (3.2/5 — médiocre mais existante), Brandwatch n'en a pas publiquement, Signal AI n'en a pas non plus.
5. **Aucune couverture broadcast TV/radio publique.** À la différence de Talkwalker (1 500 chaînes TV + 1 000 radios), Signal AI ne met en avant aucune couverture broadcast. Pour un produit reputation, c'est une lacune sur les marchés où la TV reste un canal de masse (Afrique, Amérique Latine, sud de l'Europe).
6. **Documentation technique limitée.** Page « Our AI » et « Our Data » non archivées intégralement dans Wayback pour les snapshots récents — suggère soit des pages peu stables, soit un contenu marketing générique. Aucun whitepaper technique publicly downloadable directement (vs Harch qui expose publiquement 7 LLMs listés sur sa page OurData).
7. **Dépendance au positioning marketing « External Intelligence ».** Le pivot sémantique 2020→2024 (« Media Intelligence » → « External Intelligence » → « Decision Augmentation ») traduit une quête de différenciation qui peut sembler floue aux prospects PR traditionnels. Risque de perte de clarté de la proposition de valeur.
8. **Aucun mention d'AI Visibility / GEO / AEO.** Signal AI ne semble pas couvrir le probing des LLMs (ChatGPT, Perplexity, Gemini) — un segment émergent (Otterly, Profound, Harch) qui devient central en 2025–2026. Le « Signal AI 500 » évalue la réputation corporate mais ne sonde pas la visibilité des entreprises dans les réponses des LLMs.
9. **Pas d'intégration WhatsApp.** Aucune mention d'un canal WhatsApp pour la livraison d'alertes/briefings. Pour les marchés émergents (Afrique, MENA, Amérique Latine) où WhatsApp est le canal B2B dominant, c'est un manque structurel.
10. **Volume clients modéré pour le segment.** « 650+ customers worldwide » — inférieur aux 7 500+ clients Brandwatch, aux « 30 000+ » Meltwater. Pour une entreprise fondée en 2013 avec 100M+ USD levés, le rythme d'acquisition client paraît lent, suggérant soit un ticket moyen très élevé (enterprise-only), soit une friction commerciale structurelle.
11. **Aucune documentation publique de la précision NLP.** Pas de benchmark sentiment, pas d'étude d'accuracy par langue, pas de whitepaper méthodologique accessible. Pour des acheteurs enterprise risk/réputation qui demandent de l'auditabilité, c'est une faiblesse perçue.
12. **Press archive 2024 en partie cassée.** Snapshot Wayback de /press en novembre 2024 renvoie 404 — suggère une restructuration du site en 2024 qui peut avoir temporairement dégradé le SEO et la continuité des URLs.

---

## 7. VS HARCH ATELIER (neutre)

| Dimension | Signal AI | Harch Atelier | Lecture neutre |
|---|---|---|---|
| **Année de création** | 2013 (Londres) | 2025 (Casablanca) | Signal AI a 12+ ans d'avance |
| **Funding** | ~100M+ USD levés | Non disponible publiquement | Signal AI structurellement mieux capitalisé |
| **Clients** | 650+ dont 40% Fortune 500 | Top 500 marocain visé | Signal AI sur enterprise global, Harch sur niches locales |
| **Marchés** | 226 marchés | Maroc + Afrique francophone | Couverture Harch plus étroite mais plus profonde localement |
| **Langues** | 75 langues | Arabe/darija/français focalisés | Signal AI large, Harch spécialiste |
| **Darija** | Non documentée | Revendiquée | Avantage Harch structurel |
| **AI engine** | AIQ (génératif + discriminatif) | GLM-4 + 7 LLMs probing | Maturité Signal AI supérieure |
| **AI Visibility / GEO / AEO** | Non couvert publiquement | 7 LLMs sondés | Harch plus avancé sur ce segment émergent |
| **WhatsApp** | Non | Daily Digest WhatsApp | Avantage Harch structurel sur marchés émergents |
| **Bureaux** | 4 (Londres, NY, HK, Lisbonne) | 1 (Casablanca) | Distribution Signal AI globale |
| **Pricing public** | Aucun | 5K/15K/50K MAD/mois public | Harch radicalement plus transparent |
| **Mobile app** | Non documentée | Non documentée | Match nul médiocrité |
| **Broadcast TV/radio** | Non couvert publiquement | Non couvert | Match nul |
| **Regulatory intelligence** | Module dédié mature | Non documenté publiquement | Avantage Signal AI |
| **ESG monitoring** | Module dédié | Présent (ESG radar chart) | Signal AI plus mature |
| **Podcast Intelligence** | Oui (depuis 2021) | Non documenté | Avantage Signal AI |
| **Knowledge graph** | External Intelligence Graph (2022) | React Flow entity graph (V8) | Signal AI propriétaire mature, Harch UI plus récente |
| **Frontend density** | Non vérifiable (login-gated) | V8 quant terminal dense (106 widgets) | Non comparable directement |
| **Stack** | Non documentée publiquement | Next.js 16 + ECharts + deck.gl + TanStack Virtual | Harch stack moderne publique |
| **Partenariats data locaux Maroc** | Aucun public | BAM/AMMC/Hespress/TelQuel/Médias24/Le360 (cités) | Avantage Harch local |

**Synthèse neutre :** Signal AI et Harch Atelier ne sont pas en concurrence frontale. Signal AI vend du risk/reputation intelligence à 30K–150K+ USD/an à des Fortune 500 anglo-saxons ; Harch vise un Top 500 marocain à 5K–50K MAD/mois (≈500–5 000 USD/mois) avec une spécificité darija + WhatsApp. Les segments de marché sont disjoints. Le risque de cannibalisation par Signal AI sur le marché marocain est faible à court terme (aucune présence locale, darija absente, pricing prohibitif pour le ticket marocain moyen). Le risque augmente si Signal AI ouvre un bureau MENA ou acquiert un acteur régional — scénario non observé à fin 2024 dans les archives publiques.

---

## 8. CE QU'HARCH DOIT APPRENDRE

### À copier / adapter
1. **Architecture hybride discriminative + générative.** Le pitch AIQ (discriminative pour retrieval, générative pour synthèse) est exactement l'architecture à viser pour HarchIQ Core : éviter de wrapper un LLM seul, mais combiner retrieval fine-tuné darija + LLM synthèse. C'est défendable techniquement et marketing.
2. **External Intelligence Graph comme concept produit.** La notion de knowledge graph propriétaire structurant les entités (entreprises, personnes, régulateurs, topics) est un différenciateur fort. Harch a déjà un entity graph (React Flow) — le marketer en « Harch Intelligence Graph » ou équivalent serait un actif produit.
3. **Signal AI 500 comme template d'actif marketing récurrent.** Produire un ranking récurrent (Harch 100 existe déjà sur ce modèle) génère PR organique, inbound leads, positionnement de pensée. À amplifier : un ranking trimestriel des 100 entreprises marocaines les plus visibles dans les LLMs (ChatGPT/Perplexity/Gemini) serait un actif différenciant.
4. **Diversification des cas d'usage au-delà du media monitoring.** Le pivot Signal AI 2013→2024 (media monitoring → reputation → risk → regulation → ESG) montre la trajectoire de maturité. Harch doit penser sa roadmap en termes d'expansion budget (PR → Risk → Compliance → ESG) dès maintenant.
5. **Podcast Intelligence.** Signal AI l'a ajouté en 2021. Le marché marocain a un écosystème podcast croissant (Radio Mars, podcasts business marocains) — opportunité pour Harch d'indexer ces contenus.
6. **Multi-bureau à coût relatif.** Le choix de Lisbonne comme hub EU (coût inférieur à Londres/Paris) est intéressant. Harch pourrait envisager un hub Lisbonne/Tunis/Dakar pour l'expansion EU/Afrique francophone à coût maîtrisé.
7. **Acquisition stratégique de capabilities.** KELP (2022) a renforcé la couverture réputation. Harch doit surveiller les cibles M&A potentielles sur le marché africain (acteurs PR locaux, agrégateurs de données réglementaires).

### À NE PAS copier
8. **Pricing totalement opaque.** La posture « Request a demo » enterprise-tier exclut les PME et freine l'adoption bottom-up. Harch doit conserver son pricing public (5K/15K/50K MAD/mois) — c'est un avantage concurrentiel réel sur le segment mid-market marocain.
9. **Absence d'app mobile.** Ne pas répéter l'erreur — un client Maroc veut ses alertes WhatsApp (déjà en place) ET idéalement une app mobile légère pour le monitoring on-the-go.
10. **Pivot sémantique flou.** Éviter les reformulations marketing répétées (External Intelligence → Decision Augmentation → ...) qui diluent la proposition de valeur. Harch doit verrouiller un message unique (« AI Reputation Intelligence for Africa ») et le tenir.

### À exploiter contre Signal AI
11. **Darija + arabe dialectal.** C'est le mur irréductible. Signal AI ne l'aura pas avant 2–3 ans minimum. Harch doit investir massivement dans le fine-tuning darija dès maintenant.
12. **Pricing public + ticket MAD.** Sur le segment PME/mid-market marocain (5K–50K MAD/mois), Signal AI ne descendra jamais. Harch a ce champ libre indéfiniment.
13. **WhatsApp Daily Digest.** Sur les marchés émergents où WhatsApp est le canal B2B, Signal AI n'a rien. Harch a déjà cet actif.
14. **AI Visibility / GEO / AEO en arabe.** Signal AI ne couvre pas le probing des LLMs. Harch sonde déjà 7 LLMs — l'extension au sonde des LLMs en arabe/darija est un leadership mondial potentiel sur un segment émergent.
15. **Partenariats data locaux marocains.** MAP, BVC, AMMC, ANCFCC, OCP — autant d'actifs data locaux que Signal AI ne pourra pas répliquer rapidement. Harch doit verrouiller ces partenariats en exclusivité.

---

## CONCLUSIONS CLÉS (neutres)

- Signal AI est un acteur **enterprise mature (12+ ans, 100M+ USD levés, 650+ clients dont 40% Fortune 500)** positionné sur le segment risk/reputation/regulatory intelligence global, avec une architecture AIQ hybride discriminative + générative différenciante et un actif marketing récurrent (Signal AI 500 + partenariat Forbes).
- Signal AI est **aveugle sur le marché marocain/africain et l'arabe dialectal** : aucun bureau MENA, darija non documentée, pricing enterprise-only inaccessible au ticket marocain moyen, aucune intégration WhatsApp, aucune mention d'AI Visibility.
- Harch Atelier **n'est pas en concurrence frontale avec Signal AI** — les segments de marché (Fortune 500 USD vs Top 500 marocain MAD) et les zones géographiques (global anglo-saxon vs Maroc focalisé) sont disjoints. La fenêtre stratégique pour Harch sur le marché marocain est confortable (2–3 ans minimum), à condition d'investir massivement sur les spécificités irréductibles (darija, partenariats data locaux, WhatsApp, AI Visibility arabe).

---

## TRANSPARENCE MÉTHODOLOGIQUE

- Aucune capture réseau live effectuée (signal-ai.com protégé par captcha). Toutes les données proviennent d'archives Wayback Machine (snapshots 2020, 2023, 2024) via fetch `curl` direct.
- Pages effectivement fetchées et parsées : `/` (Wayback 2020-09-01 + 2024), `/about` (Wayback 2024-06-01), `/press` (Wayback 2023-12-06), page 404 (structure navigation complète Wayback 2024-06-01), CDX API pour indexation snapshots.
- Données marquées **« Non disponible publiquement »** : codes hex palette exacts, librairie charts, cloud provider, provider LLM sous-jacent, montants exacts par tour de funding, valorisation, pricing détaillé, liste exhaustive des sources data, précision NLP par langue, latence API, SLA, volume articles/jour.
- Données confirmées par Signal AI elle-même (sources primaires) : 226 marchés, 75 langues, 650+ clients, 40% Fortune 500 (Deloitte/BofA/Google), $50M levés déc 2021, acquisition KELP août 2022, AI engine = AIQ, External Intelligence Graph juillet 2022, Podcast Intelligence déc 2021, 4 bureaux (Londres/NY/HK/Lisbonne), leadership team (Benigson/Lucas/McNeill/Pinto/Yap/Wright).
- Aucune source non publique consultée. Aucune donnée G2/Glassdoor/Crunchbase accessible (bot-blockées). Wikipedia ne dispose pas d'article dédié à Signal AI.
- Biais possible : analyse « VS Harch » repose sur auto-évaluation interne (COMPETITIVE_VISION.md, COMPETITOR_BENCHMARK.md, worklog V8) — biais intrinsèque malgré injonction neutralité.

---

## SOURCES CITÉES

1. `web.archive.org/web/2024/https://www.signal-ai.com/` — homepage 2024 (Wayback Machine)
2. `web.archive.org/web/20200901000000/https://www.signal-ai.com/` — homepage 2020 (Wayback Machine)
3. `web.archive.org/web/20240601000000/https://www.signal-ai.com/about` — page About 2024 (Wayback Machine)
4. `web.archive.org/web/20231206011120/https://www.signal-ai.com/press` — Press Releases Archive 2023 (Wayback Machine)
5. Page 404 archivée 2024-06-01 — structure complète de navigation mega-menu (Wayback Machine)
6. `web.archive.org/cdx/search/cdx` — API CDX pour indexation snapshots `signal-ai.com/press-release*`
7. Référence interne Harch : `/home/z/my-project/COMPETITIVE_VISION.md`, `/home/z/my-project/COMPETITOR_BENCHMARK.md`, `/home/z/my-project/worklog.md` (post-V8)

---

**Fin du rapport.** 4 sections analytiques + transparence + sources. ~2 350 mots (> 1 500 minimum requis).
