# BRAINSTORM-2 — ENTERPRISE + AGENCY DASHBOARDS
## L'ultime tableau de bord pour Grandes Entreprises & Agences

> **Agent :** BRAIN-2 (Senior Product Designer)
> **Date :** 2026-08-10
> **Mission :** Brainer CHAQUE section, widget, chart, et feature possible pour les plans Enterprise et Agency.
> **Philosophie :** Penser GRAND. Penser FOU. Penser "ce qui les empêchera de JAMAIS partir chez un concurrent".
> **Sources d'inspiration :** Brandwatch Vizia, Meltwater Klear, Talkwalker Blue Silk AI, Dataminr Pulse, PeakMetrics Narrative Graph, Signal AI AIQ, AlphaSense search-first UX. Plus 26 012 mots d'analyse concurrentielle déjà produits dans `/competitive-reports/`.

---

## PRÉAMBULE — Les deux personas cibles

### 👔 ENTERPRISE persona — Karim B., VP Comms Groupe, banque marocaine
- Gère 4 équipes (Marque, Corporate, Crise, IR) → 35 communicants
- Doit reporter au COMEX chaque lundi 8h
- A 3 crises en 2025 (fuite data client, rumeur acquisition, grève filiale)
- Besoin #1 : « Donnez-moi en 90 secondes l'état de ma réputation, je fais le reste. »
- N'aucune patience pour les outils qui demandent 6 clics
- Achète avec 3 critères : (1) souveraineté données, (2) traçabilité audit, (3) intégration Microsoft 365

### 🎯 AGENCY persona — Yasmine T., Directrice de clientèle, agence RP Casablanca
- Gère 14 clients (FMCG, telco, banque, retail, public sector)
- 6 account managers sous ses ordres
- Doit produire 14 rapports mensuels + 4 pitch decks/an
- Besoin #1 : « Prouver à chaque client que mes 80K MAD/mois rapportent 8x. »
- Veut sa marque partout, pas celle de l'outil
- Veut gagner 4 nouveaux clients/an → outils de pitch critiques

---

# PARTIE 1 — DASHBOARD ENTERPRISE (Grandes Organisations)

> **Objectif :** Faire de Harch Atelier le système nerveux central de la communication d'entreprise. Le dashboard que Karim ouvre à 7h45 chaque matin et qui lui donne un avantage informationnel de 30 minutes sur le COMEX.

## 1. Tableau de Bord Exécutif — `Tableau de Bord Exécutif`

- **Ce qu'il montre :** 8 KPI board-ready en grille 4×2 : (1) Score de Réputation (0-100), (2) Volume de mentions (24h vs 7j), (3) Sentiment net (-100 à +100), (4) Share-of-Voice vs 3 concurrents, (5) Niveau de crise DEFCON (1-5), (6) Visibilité AI moyenne (9 LLMs), (7) Reach estimé (audience cumulée), (8) Évolution notoriété (delta 30j).
- **Pourquoi l'utilisateur en a besoin :** Le COMEX n'a que 90 secondes. Karim doit pouvoir présenter l'état de la réputation du Groupe en une diapo. Tout le reste est secondaire.
- **Type de graphique :** Grille de 8 KPI cards — gros chiffre, sparkline 7j, delta % en couleur (vert/rouge), icône contextuelle. Format A4 paysage imprimable.
- **Source de données :** `reputation_scores`, `articles`, `sentiment_scores`, `ai_visibility`, `competitors` agrégés sur `companyId`.
- **Plan :** Enterprise (les 8 KPI); Pro (4 KPI); Essentiel (2 KPI — score + sentiment seulement).
- **Priorité :** ⭐⭐⭐ MUST-HAVE (c'est la première chose qu'on voit, donc la première chose qu'on juge).

---

## 2. DEFCON — Niveau de Préparation Crise — `DEFCON — Veille Crise`

- **Ce qu'il montre :** Un niveau DEFCON 1-5 (1 = paix, 5 = crise majeure en cours) calculé en temps réel à partir de : vélocité des mentions, sentiment négatif, spread (nombre de sources), escalade (delta 1h), source credibility (presse nationale vs anonyme), présence dans les LLMs. Affiche aussi les 3 déclencheurs dominants.
- **Pourquoi l'utilisateur en a besoin :** Toute crise commence par 3 signaux faibles. Le DEFCON permet à Karim de savoir AVANT le COMEX si lundi sera calme ou agité. C'est l'avantage informationnel le plus précieux.
- **Type de graphique :** Jauge semi-circulaire géante (5 niveaux couleur vert→jaune→orange→rouge→noir), 3 sparklines déclencheurs en dessous, mini-timeline 7j du DEFCON.
- **Source de données :** `/api/console/crisis` (déjà existant), enrichi avec déclencheurs nommés.
- **Plan :** Enterprise + Pro. Essentiel : DEFCON seulement, sans déclencheurs.
- **Priorité :** ⭐⭐⭐ MUST-HAVE.

---

## 3. Vue Multi-Équipes — `Tableau de Bord Multi-Équipes`

- **Ce qu'il montre :** Cartes empilées verticalement, une par équipe (Marque, Corporate, Crise, IR, RP, Digital). Chaque carte = mini-dashboard 4 KPI + leur top 3 actualités + leur DEFCON local + le chargé de compte. Sélecteur de période global. Toggle « données partagées / par équipe ».
- **Pourquoi l'utilisateur en a besoin :** Karim a 4 équipes qui travaillent en silos. Sans cette vue, il doit ouvrir 4 dashboards. Avec, il voit en 30 secondes quelle équipe est en difficulté.
- **Type de graphique :** Stack de cartes horizontales scrollables, chaque carte = grille 4 mini-KPI + sparkline + 3 headlines cliquables + avatar du responsable.
- **Source de données :** `users.team` + `articles.tagged_team` + `reputation_scores.teamId`.
- **Plan :** Enterprise uniquement (Pro : 1 équipe seulement).
- **Priorité :** ⭐⭐⭐ MUST-HAVE.

---

## 4. Centre de Gouvernance — `Centre de Gouvernance & Conformité`

- **Ce qu'il montre :** 4 onglets : (a) Utilisateurs (table 35 lignes — nom, rôle, dernière connexion, 2FA, IP), (b) Rôles & Permissions (matrice 8 rôles × 22 permissions, modifiable), (c) Journal d'Audit (timeline 90j — qui a vu quoi, qui a exporté quoi, qui a modifié quel seuil), (d) Politique de Rétention (durées par type de donnée, conformité RGPD/Loi 09-08 marocaine).
- **Pourquoi l'utilisateur en a besoin :** En entreprise, l'audit n'est pas une option. Le DSI doit pouvoir prouver à l'AMMC ou à un auditeur externe que personne n'a accédé aux données sensibles sans trace. Sans gouvernance, pas de contrat Enterprise.
- **Type de graphique :** Tables denses + heatmap pour la matrice permissions + timeline verticale pour l'audit + sliders pour la rétention.
- **Source de données :** `users`, `roles`, `permissions`, `audit_log` (à créer), `retention_policies`.
- **Plan :** Enterprise uniquement. (Agency : version allégée — voir section 11 Agency.)
- **Priorité :** ⭐⭐⭐ MUST-HAVE (bloquant pour signature contrat).

---

## 5. API & Intégrations — `API & Intégrations BI`

- **Ce qu'il montre :** 4 zones : (a) Clés API (génération, rotation, scopes, last-used, quota), (b) Connecteurs prêts (Power BI, Tableau, Looker, Google Sheets — boutons « Connect » avec OAuth ou token), (c) Webhooks (5 event types × max 10 endpoints — déjà codé), (d) Marketplace d'intégrations futures (Slack, Teams, Notion, Zapier, Make.com — vote communautaire).
- **Pourquoi l'utilisateur en a besoin :** L'outil de réputation n'est qu'un input parmi d'autres dans la stack BI. Sans connecteur Power BI, le data scientist de Karim ne pourra jamais recouper avec les ventes ou le NPS. L'Enterprise achète l'API, pas l'UI.
- **Type de graphique :** Grille de cards (1 par intégration) + table des clés API + table des webhooks avec test « ping ».
- **Source de données :** `api_keys`, `webhooks` (existant), `integrations` (à créer).
- **Plan :** Enterprise (illimité); Pro (3 clés, 2 webhooks); Essentiel (lecture seule).
- **Priorité :** ⭐⭐⭐ MUST-HAVE.

---

## 6. Marketing d'Influence — `Centre Influenceurs & Campagnes`

- **Ce qu'il montre :** 3 sous-vues : (a) Découverte — recherche par secteur, audience, engagement rate, langue (Darija/AR/FR/EN), localisation; filtres « certifié CMAP », « déclaration publicitaire », « fake-follower score ». (b) Tracking campagne — par influenceur, mentions vs objectif, sentiment généré, ROI estimé. (c) Bibliothèque — annuaire persistant des influenceurs déjà travaillés, avec notes internes et historique.
- **Pourquoi l'utilisateur en a besoin :** Meltwater a racheté Klear pour ça. Aucun outil marocain ne propose de discovery d'influenceurs avec scoring darija. C'est un différentiateur de 18 mois.
- **Type de graphique :** Table interactive (découverte) + barres horizontales empilées (tracking) + cards (bibliothèque) + sparklines de performance.
- **Source de données :** `influencers` (à créer), `instagram_graph_api`, `tiktok_research_api`, `campaigns` (à créer), notes internes.
- **Plan :** Enterprise + Agency. (Pro : discovery only, 5 recherches/mois.)
- **Priorité :** ⭐⭐ NICE-TO-HAVE (réel différenciateur mais effort data lourd).

---

## 7. Grille de Visibilité AI — `Grille de Visibilité AI — 9 LLMs`

- **Ce qu'il montre :** Matrice 9 colonnes × N lignes (prompts/queries). Colonnes : ChatGPT, Claude, Gemini, Perplexity, Copilot, Mistral, Grok, DeepSeek, GLM-4. Lignes : « Quelle est la meilleure banque au Maroc ? », « [Brand] est fiable ? », etc. Chaque cellule = mention/non-mention + sentiment + position (top-3/top-10/absent) + citation source. Toggle « simuler » badge orange si LLM simulé (transparence exigée par MASTER_OFFER).
- **Pourquoi l'utilisateur en a besoin :** Les LLMs remplacent Google pour 27% des recherches B2B en 2026. Une marque absente de ChatGPT est invisible pour la génération qui décide. AUCUN concurrent ne propose ça — c'est le moat #1.
- **Type de graphique :** Heatmap 9×N avec cellules cliquables révélant le snapshot LLM. Toggle « vue sommaire » (1 score global par LLM).
- **Source de données :** `/api/console/ai-visibility` (existant, 1 LLM réel + 7 simulés + 1 à ajouter DeepSeek).
- **Plan :** Enterprise + Pro (limité à 3 LLMs). Essentiel : lecture seule, 1 LLM.
- **Priorité :** ⭐⭐⭐ MUST-HAVE (c'est LE différenciateur absolu).

---

## 8. Générateur de Briefings Exécutifs — `Briefing Exécutif IA`

- **Ce qu'il montre :** Une page qui produit en 90 secondes un PDF de 4 pages : (1) Page 1 = Executive Summary (3 paragraphes IA + 1 recommandation), (2) Page 2 = Top 8 actualités + impact, (3) Page 3 = Graphiques clés (réputation, sentiment, DEFCON), (4) Page 4 = À surveiller cette semaine (3 signaux faibles). Prompts pré-définis par persona (COMEX, CA, IR, COMEX Crise).
- **Pourquoi l'utilisateur en a besoin :** Karim passe 4h chaque dimanche à préparer son briefing COMEX. Si Harch produit un brouillon en 90s, Karim gagne 3h30 = 80K MAD/an de temps valorisé. C'est l'argument ROI n°1.
- **Type de graphique :** Wizard 3 étapes (période → audience → ton) + preview PDF + bouton « Régénérer » + bouton « Envoyer par email ».
- **Source de données :** `articles`, `reputation_scores`, `crisis_data` + LLM (GLM-4 via z-ai-web-dev-sdk — déjà codé dans `/api/console/insights`).
- **Plan :** Enterprise (illimité); Pro (4/mois); Essentiel (1/mois).
- **Priorité :** ⭐⭐⭐ MUST-HAVE.

---

## 9. Salle de Crise — `Salle de Crise — Mode Plein Écran`

- **Ce qu'il montre :** Mode plein écran activable (F11 + URL `/crisis-warroom`). Layout 6 panneaux : (TL) Live feed mentions, (TR) Map géographique des foyers, (ML) Sentiment realtime, (MR) Top accounts amplificateurs, (BL) DEFCON + déclencheurs, (BR) Chat interne équipe + assignations. Affichage type Vizia de Brandwatch mais adapté crise.
- **Pourquoi l'utilisateur en a besoin :** Quand une crise éclate (16h35 vendredi), Karim réunit sa cellule dans une salle physique. Le dashboard doit être projetable sur écran 4K sans aucun clic. C'est ce qui fait passer de « outil » à « système nerveux ».
- **Type de graphique :** 6 panneaux mosaïque plein écran, refresh 3s, animations subtiles (pas de clignotements), mode sombre obligatoire, raccourcis clavier (1-6 pour focus panneau, E pour export, C pour chat).
- **Source de données :** WebSocket `/ws/crisis-room` (à coder) + `/api/console/crisis` + `/api/console/alerts`.
- **Plan :** Enterprise uniquement (trop spécifique pour Pro).
- **Priorité :** ⭐⭐⭐ MUST-HAVE (story-telling commercial puissant).

---

## 10. Analyse Concurrentielle Approfondie — `Vault Concurrentiel`

- **Ce qu'il montre :** Page dédiée par concurrent. 7 sections : (a) Scorecard comparée (nous vs eux sur 12 dimensions), (b) Timeline de leurs communiqués/annonces, (c) Cartographie de leurs prises de parole (speaker map), (d) Sentiment autour d'eux, (e) Leurs crises passées (12 mois), (f) Leurs thématiques dominantes (word cloud pondéré), (g) « Ce qu'ils font que nous ne faisons pas » (IA gap analysis).
- **Pourquoi l'utilisateur en a besoin :** Toute dircom veut benchmarks vs concurrents. Mais Brandwatch s'arrête au SOV. L'analyse de leur stratégie narrative (thématiques dominantes, speakers) est un produit nouveau = prix premium.
- **Type de graphique :** Radar chart 12 axes + timeline + bubble map + sparklines + word cloud + table gap analysis.
- **Source de données :** `competitors`, `articles` filtrés par `companyId`, `entity_mentions`, `narratives`.
- **Plan :** Enterprise (5 concurrents); Pro (2 concurrents); Essentiel (1).
- **Priorité :** ⭐⭐⭐ MUST-HAVE.

---

## 11. Suivi ESG — `Tableau de Bord ESG & RSE`

- **Ce qu'il montre :** 3 piliers (E, S, G) × 4 KPI chacun. Volet Environnemental : mentions durabilité, sentiment écologie, comparaison vs secteur, crises vertes. Volet Social : diversité, conditions travail, marque employeur. Volet Gouvernance : transparence, conformité, litiges. Pour chaque pilier : un « narrative tracker » (sujets émergents vs déclinants).
- **Pourquoi l'utilisateur en a besoin :** Les investisseurs demandent des rapports ESG trimestriels. Tout groupe coté à la BVC en a besoin. Aucun outil RP marocain ne tracke l'ESG explicitement. C'est une niche de 18 mois.
- **Type de graphique :** 3 colonnes (E/S/G) × 4 lignes (KPIs) + radar chart + heatmap thématiques émergentes.
- **Source de données :** `articles` tagués ESG (à classifier), `narratives` par pilier, scores par pilier.
- **Plan :** Enterprise uniquement.
- **Priorité :** ⭐⭐ NICE-TO-HAVE (excellent différenciateur pour clients cotés BVC).

---

## 12. Répartition Géographique — `Atlas Géographique`

- **Ce qu'il montre :** Carte interactive Maroc (12 régions) + Afrique francophone (8 pays) + monde (heatmap par pays). Filtres : langue, sentiment, source. Cliquer sur une région = drill-down (top médias, top thématiques, top speakers). Comparaison région vs moyenne nationale.
- **Pourquoi l'utilisateur en a besoin :** Pour OCP ou Attijariwafa qui opèrent en Afrique, savoir que le Sénégal parle d'eux +68% tandis que Côte d'Ivoire -22% est actionnable. Aucun outil global ne descend au niveau régional marocain.
- **Type de graphique :** Choroplèthe Mapbox + drill-down panel latéral + bar chart comparatif régional.
- **Source de données :** `articles.geo` (pays + région), `entities.location`, `geo_signatures` (déjà en DB).
- **Plan :** Enterprise + Pro. Essentiel : vue Maroc uniquement.
- **Priorité :** ⭐⭐⭐ MUST-HAVE.

---

## 13. Veille Réglementaire — `Veille Réglementaire AMMC & BAM`

- **Ce qu'il montre :** 3 flux : (a) AMMC (communiqués, sanctions, mises en garde), (b) Bank Al-Maghrib (circulaires, decisions), (c) CESE / Parlement / HCP (lois en discussion). Pour chaque item : date, impact estimé (1-5), entités concernées, sentiment marché, commentaire IA. Filtres par secteur (banque, assurance, télécom, mining).
- **Pourquoi l'utilisateur en a besoin :** Signal AI s'est fait $250M de valorisation sur la veille réglementaire. Au Maroc, aucun acteur ne tracke l'AMMC de façon structurée. Pour OCP, CIH, Attijariwafa, c'est critique.
- **Type de graphique :** Timeline verticale + cards par publication + sidebar filtres + badge impact + liens vers PDF officiels.
- **Source de données :** Scraping `ammc.ma`, `bkam.ma`, `parlement.ma` (à coder — RSS quand disponible), `regulatory_mentions`.
- **Plan :** Enterprise uniquement.
- **Priorité :** ⭐⭐ NICE-TO-HAVE (réel différenciateur B2B finance).

---

## 14. Programmateur de Rapports — `Planificateur de Rapports Personnalisés`

- **Ce qu'il montre :** Interface calendrier + table de rapports planifiés. Chaque rapport = template + destinataires + fréquence (quotidien 7h / hebdo lundi / mensuel 1er / ad hoc) + format (PDF, PPTX, CSV, JSON) + canal (email, Slack, Teams, webhook). Preview avant envoi. Historique des envois.
- **Pourquoi l'utilisateur en a besoin :** Karim a 14 rapports différents à produire (board, audit, IR, RP, crise, ESG...). Sans automatisation, c'est 20h/mois. Avec : 2h/mois de validation.
- **Type de graphique :** Calendrier mensuel + table + wizard de création 5 étapes + preview modal.
- **Source de données :** `scheduled_reports` (à créer), `report_templates`, `users.email`.
- **Plan :** Enterprise (illimité); Pro (5 rapports); Essentiel (1 mensuel).
- **Priorité :** ⭐⭐⭐ MUST-HAVE.

---

## 15. SSO / SAML Management — `Console SSO / SAML`

- **Ce qu'il montre :** Configuration SAML 2.0 (metadata XML upload ou URL), mapping attributs (email, nom, rôle), test de connexion, logs de connexion SSO, fallback password. Support Azure AD, Okta, Google Workspace, Keycloak. Option SCIM pour provisioning automatique.
- **Pourquoi l'utilisateur en a besoin :** Aucune banque marocaine n'achètera un outil SaaS sans SSO. C'est un blocker absolu à 50K MAD/mois. Mentionné dans `AccountSettings.tsx` (déjà codé en UI cachée pour Enterprise).
- **Type de graphique :** Form technique (XML metadata, certificat, endpoints) + table des connections SSO récentes + bouton « Test ».
- **Source de données :** `sso_configs` (à créer), `sso_logs`.
- **Plan :** Enterprise + Agency.
- **Priorité :** ⭐⭐⭐ MUST-HAVE (bloquant pour signature Enterprise).

---

## 16. Export Données — `Centre d'Export Données`

- **Ce qu'il montre :** 4 modes : (a) Export CSV/Excel (sélection colonnes, filtres, jusqu'à 100K lignes), (b) Export JSON via API (clé temporaire), (c) Webhook (push temps réel vers endpoint), (d) Snapshot complet (zip avec articles, scores, métadonnées — pour audit externe). Historique des exports 90j avec téléchargement.
- **Pourquoi l'utilisateur en a besoin :** Le data scientist de Karim veut tout dans Snowflake. L'auditeur veut une archive intangible. L'avocat veut une chaîne de possession.
- **Type de graphique :** Wizard 4 étapes + table des exports + boutons de re-téléchargement.
- **Source de données :** `articles`, `sentiment_scores`, `reputation_scores`, `audit_chain`.
- **Plan :** Enterprise (illimité); Pro (10/mois); Essentiel (1/mois, CSV only).
- **Priorité :** ⭐⭐⭐ MUST-HAVE.

---

## 17. Centre d'Audit Légal — `Vault d'Audit Légal`

- **Ce qu'il montre :** Archive hash-chain d'articles supprimés ou modifiés (déjà codé ~400 LOC). Pour chaque item : capture originale, hash SHA-256, timestamp blockchain-style, version actuelle (si modifié), diff visuel, statut « Retiré » badge. Recherche plein-texte dans l'archive. Export avec certificat d'authenticité PDF signé.
- **Pourquoi l'utilisateur en a besoin :** En cas de procès (diffamation, droit à l'oubli, contentieux corporate), la preuve doit être intangible. Le hash-chain est admis par plusieurs juridictions. C'est le produit "LegalTech" qui justifie un contrat à 100K MAD.
- **Type de graphique :** Table densité + modal diff côte à côte + certificat PDF preview.
- **Source de données :** `legal_archive` (existant), `article_hashes`.
- **Plan :** Enterprise uniquement.
- **Priorité :** ⭐⭐ NICE-TO-HAVE (existant en code, à包装er en feature produit).

---

## 18. Bibliothèque de Narratifs — `Tracker de Narratifs`

- **Ce qu'il montre :** Liste de narratifs suivis (ex : « OCP est un monopole d'État », « CIH est la banque des jeunes », « Attijariwafa est trop exposure Afrique »). Pour chaque narratif : vélocité 30j, sentiment associé, sources principales propageant le narratif, top speakers, comparaison vs narratifs concurrents, prévision IA 7j.
- **Pourquoi l'utilisateur en a besoin :** PeakMetrics a fait $40M d'ARR sur ce concept. Les narratifs (pas les mentions) sont ce qui façonne la réputation long-terme. Une dircom doit défendre/contrer des narratifs, pas des tweets individuels.
- **Type de graphique :** Cards empilées + sparkline 30j par narratif + network graph des propagateurs + radar « narratif vs narratif ».
- **Source de données :** `narratives` (à créer), `article_narratives`, `entity_narrative_strength`.
- **Plan :** Enterprise uniquement.
- **Priorité :** ⭐⭐ NICE-TO-HAVE (effort ML moyen, différenciateur fort).

---

## 19. Scorecard Actionnariale — `Vue Investor Relations`

- **Ce qu'il montre :** Pour les entreprises cotées BVC : (a) Corrélation sentiment ↔ cours boursier (lag 0-7j), (b) mentions par type d'investisseur (retail, institutionnel, analyste), (c) mentions par thème financier (résultats, dividende, M&A, guidance), (d) « short-seller sentiment » (mentions négatives par comptes identifiés), (e) comparaison vs pairs sectoriels.
- **Pourquoi l'utilisateur en a besoin :** Le service IR de toute entreprise cotée a besoin de ça. Aucun acteur marocain ne couple sentiment RP ↔ cours BVC. AlphaSense est à $7.5B sur ce créneau mais n'a aucune données darija/BVC.
- **Type de graphique :** Dual-axis chart (sentiment + cours) + barres par type investisseur + heatmap thèmes financiers + radar vs pairs.
- **Source de données :** `articles` filtrés IR + API BVC (cours), `investor_classification`.
- **Plan :** Enterprise uniquement (+ option add-on Investor Module).
- **Priorité :** ⭐⭐ NICE-TO-HAVE (gros potentiel upsell).

---

## 20. Résonance Médiatique — `Share-of-Voice & Portée`

- **Ce qu'il montre :** 3 vues : (a) SOV vs 5 concurrents (stacked bar 30j), (b) Reach estimé par média (top 20 médias par portée), (c) ADR (Advertising Value Equivalent) — équivalent publicitaire en MAD. Filtres : type de média (print, online, broadcast, social), période, sentiment.
- **Pourquoi l'utilisateur en a besoin :** Tout RP veut dire « on a eu 2.3M MAD d'équivalent pub ce mois ». C'est la métrique ROI traditionnelle. Sans ça, pas de table RP crédible.
- **Type de graphique :** Stacked bar + horizontal bar top médias + KPI ADR + sparkline 12 mois.
- **Source de données :** `articles.reach_estimate`, `media_outlets.audit_circulation`, `adr_calculator`.
- **Plan :** Enterprise + Pro.
- **Priorité :** ⭐⭐⭐ MUST-HAVE.

---

## 21. Cartographie des Parties Prenantes — `Cartographie Stakeholders`

- **Ce qu'il montre :** Graphe interactif des stakeholders (journalistes, analystes, politiques, régulateurs, influenceurs, dirigeants peers). Nœuds colorés par type, taille par influence (followers × credibility score), liens par co-mention. Cliquer un nœud = profil détaillé (prises de parole 12 mois, sentiment vers nous, sujets dominants, dernier contact).
- **Pourquoi l'utilisateur en a besoin :** Toute dircom a un fichier Excel « journalists we know ». Harch le transforme en graphe vivant qui montre qui influence qui. Talkwalker le fait mal; Harch peut le faire bien en darija.
- **Type de graphique :** Force-directed graph (D3.js ou react-force-graph) + side panel de profil.
- **Source de données :** `entities` (people + orgs), `co_mention_graph`, `stakeholder_notes`.
- **Plan :** Enterprise uniquement.
- **Priorité :** ⭐⭐ NICE-TO-HAVE (effort UX important, wow factor élevé).

---

## 22. Détection de Campagnes Coordonnées — `Radar Anti-Manipulation`

- **Ce qu'il montre :** Détection de patterns anormaux : (a) pics soudains de mentions similaires, (b) comptes nouveaux amplifiant une narrative, (c) timing coordonné (clusters temporels), (d) langage quasi-identique (AST similarity), (e) origine géographique concentrée. Score de « coordinateur » 0-100. Top suspects list.
- **Pourquoi l'utilisateur en a besoin :** Dataminr fait ça très bien, Peakmetrics aussi. Au Maroc, les opérations d'influence se multiplient (élections, conflits corporate). Sans cette détection, Harch est naïf.
- **Type de graphique :** Timeline anomalies + cluster graph + table suspects + radar score.
- **Source de données :** `articles.dedup_hash`, `temporal_clustering`, `account_graph`, NLP similarity.
- **Plan :** Enterprise uniquement.
- **Priorité :** ⭐⭐ NICE-TO-HAVE (effort ML lourd mais différenciateur crise).

---

## 23. Comparaison Temporelle — `Vue Year-over-Year`

- **Ce qu'il montre :** Sérietemps long format double : (a) Calendrier heatmap 365j (lignes=semaines, colonnes=jours, couleur=volume mentions) — style GitHub contributions, (b) Overlay année N vs N-1 vs N-2 (courbes superposées), (c) Annotations événements (lancements, crises, annoncent) sur la timeline, (d) Détection de saisonnalité (mois récurrents négatifs).
- **Pourquoi l'utilisateur en a besoin :** Toute dircom veut dire « sur 3 ans, on a augmenté le sentiment net de +14 points ». Sans perspective longue, on est dans le court-termisme.
- **Type de graphique :** Heatmap 365j + multi-line overlay + annotations sur timeline.
- **Source de données :** `articles` agrégés mensuellement sur 36 mois + `events` (à coder).
- **Plan :** Enterprise + Pro (2 ans max); Essentiel : 1 an.
- **Priorité :** ⭐⭐ NICE-TO-HAVE.

---

## 24. Recherche Sémantique — `Recherche HarchIQ Sémantique`

- **Ce qu'il montre :** Barre de recherche centrale (style AlphaSense) qui accepte : texte libre, question naturelle (« qu'a-t-on dit sur nos résultats Q2 ? »), filtres (période, source, sentiment, langue, géo), opérateurs booléens avancés. Résultats triés par pertinence sémantique (embedding vector), pas par date. Snippets avec surlignage. « Questions similaires » suggérées.
- **Pourquoi l'utilisateur en a besoin :** AlphaSense est à $7.5B principalement grâce à ça. Les dircoms veulent interroger leur archive comme on interroge ChatGPT. C'est l'UX n°1 du knowledge work en 2026.
- **Type de graphique :** Barre de recherche centrale géante + sidebar filtres + liste de résultats avec snippets + panneau « insights suggérés ».
- **Source de données :** `articles` + embeddings vectoriels (pgvector ou Pinecone), `narratives`, LLM pour reformulation.
- **Plan :** Enterprise (illimité); Pro (50 requêtes/mois).
- **Priorité :** ⭐⭐ NICE-TO-HAVE (effort infra vectorielle mais killer feature).

---

## 25. Centre de Notifications Personnalisées — `Console d'Alertes Multi-Canaux`

- **Ce qu'il montre :** Configuration d'alertes : (a) Seuils (volume >X, sentiment <-Y, DEFCON ≥3), (b) Mots-clés et entités surveillées, (c) Canaux (email, WhatsApp, SMS, Slack, Teams, webhook, push mobile), (d) Règles de routage (équipe Marque vs Crise vs IR), (e) Escalade (si non ack 15min → manager; 30min → VP). Historique des alertes 90j.
- **Pourquoi l'utilisateur en a besoin :** WhatsApp est le canal dominant au Maroc. Aucun concurrent global ne l'a. Couplé aux règles d'escalade, c'est le système nerveux opérationnel.
- **Type de graphique :** Table règles + wizard création + toggle par canal + timeline historique.
- **Source de données :** `alerts` (existant), `alert_rules`, `delivery_logs`.
- **Plan :** Enterprise (illimité + WhatsApp); Pro (5 règles, email + WhatsApp); Essentiel (1 règle email).
- **Priorité :** ⭐⭐⭐ MUST-HAVE.

---

## 26. Centre de Formation & Adoption — `Académie Harch`

- **Ce qu'il montre :** Onboarding progressif : (a) Checklist setup (compléter profil, ajouter équipes, connecter sources, créer 1ère alerte), (b) Tutoriels vidéo intégrés (par feature), (c) Certification interne (quiz), (d) Métriques d'adoption par utilisateur (login frequency, features utilisées, rapports générés), (e) Suggestions IA (« Vous n'utilisez pas encore le Briefing Exécutif — essayez »).
- **Pourquoi l'utilisateur en a besoin :** Le churn Enterprise vient de la non-adoption par les équipes. Sans onboarding actif, 6 mois après signature plus personne ne se connecte.
- **Type de graphique :** Checklist + cards tutoriels + barres d'adoption + suggestions IA.
- **Source de données :** `user_activity_logs`, `feature_flags`, `tutorial_completion`.
- **Plan :** Enterprise + Agency.
- **Priorité :** ⭐⭐ NICE-TO-HAVE (anti-churn majeur).

---

## 27. Console Mobile Compagnon — `App Mobile Dirigeants`

- **Ce qu'il montre :** Version iOS/Android allégée : (1) Score de réputation en gros, (2) DEFCON, (3) 3 dernières alertes critiques, (4) Briefing du jour PDF, (5) Push notifications configurables, (6) Auth biométrique (FaceID/TouchID), (7) Mode offline (cache 24h). Pas d'édition, lecture seule.
- **Pourquoi l'utilisateur en a besoin :** Karim voyage 5j/mois. Il doit pouvoir consulter Harch depuis l'aéroport. Talkwalker a 3.2/5 sur mobile — c'est un gap concurrentiel.
- **Type de graphique :** Mobile UI native (React Native ou Expo), cards verticales, gestures swipe.
- **Source de données :** API REST existante + push (APNs/FCM).
- **Plan :** Enterprise + Agency.
- **Priorité :** ⭐⭐ NICE-TO-HAVE (effort important mais sticky).

---

## 28. « Jumeau Numérique » de la Marque — `Brand Digital Twin` 🌶️ IDÉE FOLLE

- **Ce qu'il montre :** Un modèle simulation qui prédit l'impact d'une action de com AVANT de la faire. Input : « si on publie un communiqué sur X maintenant ». Output prédit : volume attendu, sentiment probable, top médias qui reprendront, risques de dérive narrative, impact DEFCON 7j. Basé sur l'historique 24 mois de l'entreprise + apprentissage par renforcement.
- **Pourquoi l'utilisateur en a besoin :** C'est le Saint Graal de la com data-driven. Aucun concurrent ne le fait. Harch peutclaimer « first PR simulator ». Wow factor ultime pour vente.
- **Type de graphique :** Wizard scénario + visualisation prédiction (fan chart avec intervalles confiance) + comparaison scénarios A/B/C.
- **Source de données :** Historique 24 mois + LLM + simulation Monte Carlo.
- **Plan :** Enterprise add-on (50K MAD/mois supplémentaires).
- **Priorité :** 🌶️ CRAZY IDEA (mais différenciateur billion-dollar si ça marche).

---

## 29. Mode « Bureau Exécutif » — `Mode Bureau Exécutif` 🌶️ IDÉE FOLLE

- **Ce qu'il montre :** Affichage plein écran conçu pour être projeté sur un écran 4K dans le bureau du VP Comms. Rotation automatique 5 vues (Executive KPI → DEFCON → SOV → AI Visibility → Briefing du jour) toutes les 30 secondes. Affiche l'heure, le logo, un message personnalisable en bas. Mode « présentation visiteurs » (cache données sensibles).
- **Pourquoi l'utilisateur en a besoin :** Brandwatch Vizia fait ça à $50K/an. C'est un vanity product mais qui fait vendre. Tout VP Comms veut son écran mural de réputation.
- **Type de graphique :** Carrousel plein écran + transitions douces + clock + branding.
- **Source de données :** Toutes les APIs existantes, agrégées en cache 60s.
- **Plan :** Enterprise add-on.
- **Priorité :** 🌶️ CRAZY IDEA (effet wow commercial énorme).

---

## 30. Comparateur de Scénarios — `Lab What-If` 🌶️ IDÉE FOLLE

- **Ce qu'il montre :** Sandbox où Karim peut simuler « et si on ne répond pas à cette rumeur ? », « et si on publie un démenti officiel ? », « et si le PDG donne une interview ? ». Pour chaque scénario, projection probable 7j (sentiment, SOV, DEFCON, AI visibility) basée sur cas similaires historiques dans l'industrie.
- **Pourquoi l'utilisateur en a besoin :** La com est actuellement pilotée à l'instinct. Harch peut l'amener vers la décision basée sur données. C'est le bond que font les marketeurs avec les MMM (Marketing Mix Modeling).
- **Type de graphique :** 3 colonnes scénarios A/B/C + projections fan chart + recommendation IA.
- **Source de données :** Historique cas similaires (banque de cas « 100 resilience cases » déjà en DB) + LLM.
- **Plan :** Enterprise add-on.
- **Priorité :** 🌶️ CRAZY IDEA (lié au Brand Digital Twin).

---

# PARTIE 2 — DASHBOARD AGENCY (Multi-Client, White-Label)

> **Objectif :** Faire de Harch Atelier l'outil qu'aucune agence RP casablancaise ne peut quitter. Le dashboard que Yasmine ouvre à 8h pour savoir en 60 secondes quel client est en feu, quel client va renouveler, et quel prospect elle peut pitch cette semaine.

## 1. Sélecteur de Client — `Sélecteur de Client`

- **Ce qu'il montre :** Barre persistante en haut de page (sticky) avec : logo client (24×24px), nom, période active, flèche déroulante. Dropdown = liste clients avec recherche, filtres (actif/pause/prospect), et « + Nouveau client ». Permet de basculer entre 14 clients en 2 clics.
- **Pourquoi l'utilisateur en a besoin :** Yasmine gère 14 clients. Sans sélecteur persistant, elle passe 30% de son temps à naviguer. C'est l'UX n°1 d'un outil multi-comptes.
- **Type de graphique :** Barre sticky 60px + dropdown riche avec search + filtres + avatar client.
- **Source de données :** `agency_clients` (à créer), `users.agencyId`.
- **Plan :** Agency uniquement.
- **Priorité :** ⭐⭐⭐ MUST-HAVE (fondation de toute l'expérience Agency).

---

## 2. Tableau de Portefeuille Clients — `Portefeuille Clients`

- **Ce qu'il montre :** Table 14 lignes (1 par client) × colonnes : nom, secteur, statut (actif/pause/prospect), score réputation actuel, delta 30j, DEFCON, sentiment net, volume mentions 24h, prochaine échéance (renouvellement/rapport), account manager assigné, MRR (recurring revenue). Tri par colonne. Couleur conditionnelle.
- **Pourquoi l'utilisateur en a besoin :** Yasmine veut savoir en 5 secondes quel client mérite son attention aujourd'hui. Cette table remplace 14 onglets Excel.
- **Type de graphique :** Table dense triable + sparklines inline + badges statut + avatar account manager.
- **Source de données :** `agency_clients` + agrégats par `clientId`.
- **Plan :** Agency uniquement.
- **Priorité :** ⭐⭐⭐ MUST-HAVE.

---

## 3. Vue Agrégée — `Vue Agence (Tous Clients)`

- **Ce qu'il montre :** KPIs agrégés sur tous les clients : (a) MRR total, (b) Somme reach mensuel (impact cumulé de l'agence), (c) Somme ADR (valeur pub générée), (d) Nombre total de mentions gérées, (e) Crises gérées YTD, (f) Taux de renouvellement (churn inverse). Comparaison vs mois précédent.
- **Pourquoi l'utilisateur en a besoin :** C'est le dashboard interne de la direction d'agence. Sans agrégation, l'agence ne peut pas mesurer sa propre performance.
- **Type de graphique :** Grille 6 KPI cards + sparklines 12 mois + 1 donut répartition revenus par client.
- **Source de données :** `agency_clients.mrr`, agrégats cross-clients.
- **Plan :** Agency uniquement.
- **Priorité :** ⭐⭐⭐ MUST-HAVE.

---

## 4. Dashboard Spécifique par Client — `Console Client`

- **Ce qu'il montre :** Une fois un client sélectionné, vue complète : (a) Identité (logo, secteur, période de mandat, contrat en cours), (b) 8 KPI (comme Executive Dashboard), (c) Timeline actualités, (d) Top médias, (e) Concurrents suivis pour ce client, (f) Campagnes actives, (g) Briefing auto-mensuel. Tout est scoped à ce client.
- **Pourquoi l'utilisateur en a besoin :** Yasmine doit pouvoir présenter « voilà le mois de [Client X] » en un écran. C'est le quotidien de l'account manager.
- **Type de graphique :** Layout 12 zones + header client + tabs (Réputation / Campagnes / Rapports / Notes / Paramètres).
- **Source de données :** Toutes les tables filtrées par `clientId`.
- **Plan :** Agency uniquement.
- **Priorité :** ⭐⭐⭐ MUST-HAVE.

---

## 5. Suivi de Campagnes — `Tracker de Campagnes Client`

- **Ce qu'il montre :** Par client, liste des campagnes actives/passées : nom, période, objectif (notoriété / lancement / crise / repositionnement), KPIs (mentions, reach, sentiment, ADR, conversions), budget consommé vs prévu, ROI estimé. Cliquer = drill-down détaillé par canal.
- **Pourquoi l'utilisateur en a besoin :** Tout client d'agence demande « combien ça a rapporté ? ». Sans tracker structuré, l'agence bricole dans Excel.
- **Type de graphique :** Table campagnes + cards détaillées par campagne + barres empilées budget + gauge ROI.
- **Source de données :** `campaigns` (à créer), `campaign_metrics`.
- **Plan :** Agency uniquement.
- **Priorité :** ⭐⭐⭐ MUST-HAVE.

---

## 6. Calculateur de ROI — `Calculateur de ROI`

- **Ce qu'il montre :** Pour chaque campagne/client : inputs (honoraires agence, budget média, temps passé) vs outputs (ADR, leads générés, lift de notoriété, valeur équivalente pub). Formules configurables (CPE, CPM, ROI %, ROAS). Export PDF client « Notre impact ce trimestre ».
- **Pourquoi l'utilisateur en a besoin :** C'est l'outil n°1 de rétention client. Quand Yasmine présente un ROI 8x, le client renouvelle. Sans ça, c'est subjectif.
- **Type de graphique :** Form interactif + result cards + waterfall chart (investissement → outputs → net) + PDF export branded.
- **Source de données :** `campaigns.budget` + outputs agrégés + `agency_rates`.
- **Plan :** Agency uniquement.
- **Priorité :** ⭐⭐⭐ MUST-HAVE.

---

## 7. Générateur de Pitch Deck — `Studio Pitch Deck`

- **Ce qu'il montre :** Wizard 4 étapes : (1) Prospect info (secteur, taille, défi RP), (2) Sélection template (audit réputation, lancement produit, gestion crise, repositionnement), (3) Harch génère 12 slides ( problématique, marché, diagnostic, stratégie, calendrier, KPIs, équipe, budget, ROI projeté, références, roadmap, prochaine étapes), (4) Branding agence (logo, couleurs). Export PPTX + PDF.
- **Pourquoi l'utilisateur en a besoin :** Une agence RP passe 30% de son temps en pitch. Harch peut diviser ce temps par 3. C'est l'argument n°1 d'acquisition agence.
- **Type de graphique :** Wizard 4 étapes + slide preview grid + editor slide-by-slide + export.
- **Source de données :** Templates + LLM (GLM-4) + `agency_branding` + données marché prospect.
- **Plan :** Agency uniquement.
- **Priorité :** ⭐⭐⭐ MUST-HAVE (vital pour acquisition).

---

## 8. Analyse de Paysage Marché — `Paysage Prospect`

- **Ce qu'il montre :** Pour un prospect en pitch : (a) Top 5 concurrents du prospect + leur sentiment, (b) Volume de mentions du secteur 90j, (c) Crises récentes du secteur, (d) Narratifs dominants (« le secteur bancaire marocain est en retard digital »), (e) 5 opportunités RP identifiées par IA, (f) « Ce que ferait une agence intelligente » (recommandations stratégiques auto-générées).
- **Pourquoi l'utilisateur en a besoin :** Quand Yasmine pitch un prospect, elle doit montrer qu'elle connaît SON marché. Harch produit un audit 360° en 5 minutes.
- **Type de graphique :** Dashboard prospect + radar concurrents + word cloud narratifs + cards opportunités + recommendations IA.
- **Source de données :** `entities.prospect` (créé ad hoc) + `articles` filtrés + LLM.
- **Plan :** Agency uniquement.
- **Priorité :** ⭐⭐⭐ MUST-HAVE (linked to Pitch Deck).

---

## 9. Rapports Automatisés — `Rapports Client Planifiés`

- **Ce qu'il montre :** Calendrier des rapports par client : (a) Hebdo (lundi 8h, 2 pages), (b) Mensuel (1er du mois, 8 pages), (c) Trimestriel (T+15j, 16 pages), (d) Ad hoc (campagne post-mortem). Pour chaque : template, destinataires (client + interne), canal (email, partage URL white-label), branding. Preview + edit avant envoi.
- **Pourquoi l'utilisateur en a besoin :** 14 clients × 4 rapports/mois = 56 rapports. Sans automatisation, c'est 4 jours/mois de production. Avec : 4 heures de validation.
- **Type de graphique :** Calendrier mensuel + table + wizard + preview.
- **Source de données :** `scheduled_reports` + `report_templates` + `agency_clients`.
- **Plan :** Agency uniquement.
- **Priorité :** ⭐⭐⭐ MUST-HAVE.

---

## 10. Paramètres White-Label — `Studio White-Label`

- **Ce qu'il montre :** Configuration : (a) Logo agence (upload SVG/PNG), (b) Couleurs primaires/secondaires (color picker + palette suggérée), (c) Domaine personnalisé (CNAME `reports.agence.ma`), (d) Email expéditeur (no-reply@agence.ma), (e) Pied de page rapports (mention légale), (f) Favicon, (g) Option « powered by Harch » (cacher = +30% sur tarif). Live preview.
- **Pourquoi l'utilisateur en a besoin :** Aucune agence ne veut montrer à ses clients qu'elle utilise un outil tiers. White-label = l'agence vend SA marque. C'est l'argument n°1.
- **Type de graphique :** Form 7 champs + live preview side-by-side (avant/après) + bouton « Publier ».
- **Source de données :** `agency_branding` (à créer), `agency_domain`.
- **Plan :** Agency uniquement.
- **Priorité :** ⭐⭐⭐ MUST-HAVE.

---

## 11. Matrice Équipe ↔ Client — `Matrice Assignations`

- **Ce qu'il montre :** Grille 6 account managers × 14 clients. Chaque cellule = % allocation (0%, 25%, 50%, 100%) + rôle sur le compte (lead, support, strategy). Charge de travail par manager (somme en bas). Alertes surcharge (>100%) ou sous-charge (<50%). Drag-and-drop pour réassigner.
- **Pourquoi l'utilisateur en a besoin :** Yasmine doit équilibrer la charge de ses 6 managers. Sans matrice, c'est l'anarchie.
- **Type de graphique :** Heatmap 6×14 avec drag-and-drop + barres de charge + alertes couleur.
- **Source de données :** `user_client_assignments` (à créer), `users.role=account_manager`.
- **Plan :** Agency uniquement.
- **Priorité :** ⭐⭐ NICE-TO-HAVE (utile dès >5 managers).

---

## 12. Comparaison Clients — `Comparateur Clients Side-by-Side`

- **Ce qu'il montre :** Sélectionner 2 à 4 clients → tableau comparatif : (a) Score réputation, (b) Sentiment net, (c) Volume mentions, (d) SOV dans leur secteur, (e) DEFCON, (f) Budget mandat, (g) ROI estimé, (h) Taux de croissance sentiment. Pour identifier best practices d'un client à reproduire chez un autre.
- **Pourquoi l'utilisateur en a besoin :** Yasmine veut transférer ce qui marche chez le Client A vers le Client B. La comparaison révèle les patterns gagnants.
- **Type de graphique :** Table comparative + radar multi-clients + delta column.
- **Source de données :** Agrégats par `clientId`.
- **Plan :** Agency uniquement.
- **Priorité :** ⭐⭐ NICE-TO-HAVE.

---

## 13. Tracker de Revenus — `Console Revenus Agence`

- **Ce qu'il montre :** Table financière : (a) MRR par client (récurrence), (b) One-shots (projets, audits), (c) Commission sur dépenses média (si applicable), (d) MRR churn (clients partis), (e) Net Revenue Retention (NRR), (f) ARR projection (MRR × 12 + pipeline). Alertes clients à risque churn (MRR > 50K MAD/mois).
- **Pourquoi l'utilisateur en a besoin :** Toute agence est un business. Harch devient son tableau de bord financier, pas seulement RP. Stickiness maximum.
- **Type de graphique :** Table financière + barres MRR 12 mois + donut répartition + funnel pipeline.
- **Source de données :** `agency_clients.mrr`, `agency_invoices`, `pipeline`.
- **Plan :** Agency uniquement.
- **Priorité :** ⭐⭐⭐ MUST-HAVE.

---

## 14. Score de Santé Client — `Santé Client`

- **Ce qu'il montre :** Pour chaque client, score 0-100 combinant : (a) Sentiment client vs 3 mois glissants ( declining = -20), (b) Fréquence de login du client dans son portail (si white-label client-facing), (c) Volume de tickets/support, (d) Réponse aux rapports (open rate, comments), (e) NPS interne (l'agence note sa relation). Code couleur : vert >70, orange 40-70, rouge <40.
- **Pourquoi l'utilisateur en a besoin :** Un client ne dit pas qu'il va partir — il montre des signaux. Harch détecte ces signaux 60 jours avant le churn.
- **Type de graphique :** Cards par client + gauge + sparkline 90j + top 3 signaux d'alerte.
- **Source de données :** `client_login_activity`, `client_nps`, `support_tickets`, sentiment.
- **Plan :** Agency uniquement.
- **Priorité :** ⭐⭐⭐ MUST-HAVE (anti-churn critique).

---

## 15. Générateur de Propositions — `Studio Propositions IA`

- **Ce qu'il montre :** Différent du Pitch Deck : c'est pour clients existants qui veulent étendre le mandat. Wizard : (1) Contexte (client, mandat actuel), (2) Opportunité identifiée par Harch (ex : « sentiment chute sur thématique RSE »), (3) Proposition (3 axes stratégiques générés par IA), (4) Budget et ROI projeté, (5) Calendrier 6 mois. Export PDF branded.
- **Pourquoi l'utilisateur en a besoin :** Upsell = +30% revenus agence sans acquisition. Harch identifie l'opportunité + rédige la proposition. L'agence valide et envoie.
- **Type de graphique :** Wizard 5 étapes + preview + export.
- **Source de données :** `articles` client + LLM + `agency_branding`.
- **Plan :** Agency uniquement.
- **Priorité :** ⭐⭐ NICE-TO-HAVE (réel générateur de revenus additionnels).

---

## 16. Hub de Présentation Client — `Portail Client`

- **Ce qu'il montre :** Espace sécurisé `reports.agence.ma/client/xyz` où le client peut consulter (sans compte Harch) : (a) Rapports publiés (PDF + interactifs), (b) Dashboard réputation live (simplifié), (c) Campagnes actives, (d) Commentaires/questions échangés avec l'agence, (e) Prochaines livrables. 100% white-label.
- **Pourquoi l'utilisateur en a besoin :** C'est la preuve de valeur permanente pour le client. Au lieu d'un PDF mensuel oublié dans une boîte mail, le client a un portail vivant brandé agence.
- **Type de graphique :** Layout 5 zones + auth par token (URL magique) + commenting system.
- **Source de données :** Toutes les APIs filtrées par `clientId` + `client_portal_access_tokens`.
- **Plan :** Agency uniquement.
- **Priorité :** ⭐⭐⭐ MUST-HAVE (effet wow client + rétention).

---

## 17. Bibliothèque de Templates — `Bibliothèque de Templates`

- **Ce qu'il montre :** 20+ templates prêts : (a) 5 rapports (audit réputation, post-crise, mensuel, trimestriel, annuel), (b) 5 pitch decks (lancement, crise, repositionnement, lancement produit, audit), (c) 5 briefings (matinal, hebdo, comex, crise, IR), (d) 5 dashboards (réputation, campagne, influence, ESG, concurrentiel). Chaque template = configurable + clonable.
- **Pourquoi l'utilisateur en a besoin :** Une agence qui démarre sur Harch doit pouvoir produire en 1h un premier rapport client crédible. Sans templates, c'est 8h de setup.
- **Type de graphique :** Gallery grid + preview modal + bouton « Utiliser » + edit inline.
- **Source de données :** `report_templates` (codés en dur initialement).
- **Plan :** Agency + Enterprise.
- **Priorité :** ⭐⭐⭐ MUST-HAVE (réduit time-to-value).

---

## 18. Atlas des Influenceurs — `Annuaire Influenceurs Agence`

- **Ce qu'il montre :** Différent du module Enterprise : ici c'est CROSS-CLIENT. L'agence construit un asset propriétaire « nos influenceurs testés et approuvés ». Pour chaque influenceur : liste des clients avec qui il a collaboré, performance moyenne (engagement, sentiment généré, ROI), notes internes, tarif négocié par l'agence, dernière collaboration.
- **Pourquoi l'utilisateur en a besoin :** L'agence accumule de la connaissance inter-clients. C'est sa valorisation. Un influenceur qui a performé sur Client A peut être recommandé à Client B.
- **Type de graphique :** Table influenceurs + cards par client lié + performance sparkline.
- **Source de données :** `influencers` + `influencer_client_history` + `influencer_notes`.
- **Plan :** Agency uniquement.
- **Priorité :** ⭐⭐ NICE-TO-HAVE.

---

## 19. Notes & Stratégie — `Carnet de Notes Client`

- **Ce qu'il montre :** Par client, un notebook structuré : (a) Notes stratégiques (positionnement, narrative board, objectifs 12 mois), (b) Notes de réunion (date, participants, décisions, actions), (c) Personas clés côté client (PDG, DSI, Dircom — leurs préférences), (d) Pièces jointes (briefs, validations), (e) Historique des décisions stratégiques.
- **Pourquoi l'utilisateur en a besoin :** Toute agence a un Drive/Notion pour ça. Harch le rapproche des données. Quand Yasmine consulte le sentiment chutant du Client X, elle voit à côté les notes de la dernière réunion où le PDG a dit « on est inquiet sur la RSE ».
- **Type de graphique :** Notebook interface + tags + search + timeline résumé.
- **Source de données :** `client_notes` (à créer), `meeting_notes`, `client_personas`.
- **Plan :** Agency + Enterprise.
- **Priorité :** ⭐⭐ NICE-TO-HAVE.

---

## 20. Renouvellements & Contrats — `Tracker Renouvellements`

- **Ce qu'il montre :** Timeline 12 mois des échéances contrat : (a) Renouvellements prévus (60j alerte, 30j critique), (b) Négociations en cours (statut, montant proposé vs actuel), (c) Nouveaux contrats signés YTD, (d) Churn YTD (valeur perdue), (e) Net Revenue Retention. Calcul « run rate » en temps réel.
- **Pourquoi l'utilisateur en a besoin :** 14 clients × 2 échéances/an = 28 moments critiques. Un renouvellement manqué = 80K MAD perdus. Harch devient le CRM financier de l'agence.
- **Type de graphique :** Timeline horizontale 12 mois + cards échéance + KPI run rate + alerts.
- **Source de données :** `agency_contracts` (à créer), `agency_clients.renewal_date`.
- **Plan :** Agency uniquement.
- **Priorité :** ⭐⭐⭐ MUST-HAVE.

---

## 21. Vue Cross-Client Sectorielle — `Vue Sectorielle Cross-Client`

- **Ce qu'il montre :** Si l'agence a 3 clients banque + 2 clients telco + 4 FMCG : vue agrégée par secteur. Comparaison intra-sectorielle des clients de l'agence (anonymisée si partagée en externe), benchmarks sectoriels, signaux faibles communs. Identification d'opportunités (« tout le secteur banque parle de digitalisation, on peut pitcher les 2 telco sur la même thématique »).
- **Pourquoi l'utilisateur en a besoin :** L'agence capitalise sa verticalisation. Si elle a 3 clients banque, elle devient « spécialiste banque » et peut gagner des mandates à premium.
- **Type de graphique :** Groupements par secteur + radar cross-client + word cloud thématique sectoriel.
- **Source de données :** `agency_clients.sector` + `articles` agrégés par secteur.
- **Plan :** Agency uniquement.
- **Priorité :** ⭐⭐ NICE-TO-HAVE.

---

## 22. Notifications d'Opportunités — `Radar Nouveaux Business`

- **Ce qu'il montre :** Feed intelligent d'opportunités détectées par Harch : (a) Entreprise marocaine en crise RP → pitch de gestion de crise, (b) Entreprise en lancement produit → pitch lancement, (c) Nouveau CEO nommé → pitch repositionnement, (d) Secteur en regulatory shift → pitch conformité comms, (e) Concurrent d'un client actif → introduire chez un client adjacent. Pour chaque opportunité : score (1-5), raison, données de contexte, suggestion d'approche.
- **Pourquoi l'utilisateur en a besoin :** Toute agence cherche son prochain client en networking. Harch produit des leads qualifiés basés sur signaux RP réels. C'est de l'inbound B2B.
- **Type de graphique :** Feed de cards opportunités + score badges + bouton « Démarrer un pitch ».
- **Source de données :** `entities` non-clients + `crisis_data` + `corporate_events` + LLM scoring.
- **Plan :** Agency uniquement.
- **Priorité :** ⭐⭐ NICE-TO-HAVE (réel générateur de business).

---

## 23. Suivi de Marque Agence — `Veille Marque Agence`

- **Ce qu'il montre :** L'agence est aussi une marque. Ce module track la réputation de l'agence elle-même (mentions, sentiment, awards, commentaires Glassdoor, mentions par ex-employés, awards sectoriels). Comparaison vs 5 agences concurrentes. « L'agence est mentionnée +18% ce mois, mais sentiment Glassdoor -8%. »
- **Pourquoi l'utilisateur en a besoin :** Une agence RP qui ne gère pas sa propre réputation perd crédibilité. Harch applique l'outil à l'agence elle-même = dogfooding.
- **Type de graphique :** Dashboard marque agence + radar vs concurrents + feed mentions.
- **Source de données :** `entities` (l'agence elle-même comme tracked entity).
- **Plan :** Agency uniquement.
- **Priorité :** ⭐ NICE-TO-HAVE (low effort, high empathy).

---

## 24. Plateforme de Workflow — `Kanban Campagnes`

- **Ce qu'il montre :** Kanban par client (ou cross-client) : 5 colonnes (Idée → Briefé → En production → En revue → Publié). Cartes = livrables (communiqué, post LinkedIn, interview, événement). Assignation, deadline, dépendances, pièces jointes, comments. Integrations Slack/Teams pour notif.
- **Pourquoi l'utilisateur en a besoin :** Asana/Trello existent. Mais l'agence jongle entre 3 outils. Harch peut devenir le hub unifié — atterrissage naturel car les livrables sont liés aux données RP.
- **Type de graphique :** Kanban board drag-and-drop + sidebar filtres + card modal.
- **Source de données :** `tasks` (à créer), `task_assignments`, `campaigns`.
- **Plan :** Agency + Enterprise.
- **Priorité :** ⭐⭐ NICE-TO-HAVE (effort produit, risque concurrence Asana).

---

## 25. Facturation & Temps — `Console Temps & Facturation`

- **Ce qu'il montre :** Timesheet hebdo par account manager, ventilation par client, taux horaire configurables, facturation auto-générée (PDF), suivi encaissements, alertes retards. Export comptable (CSV pour Sage/Ciel).
- **Pourquoi l'utilisateur en a besoin :** Tout mandat agence est facturé au temps passé + budget média. Sans timesheet intégré, c'est Excel + erreurs. Harch devient ERP RP.
- **Type de graphique :** Timesheet hebdo grid + factures table + KPIs (TJM moyen, taux facturable) + export.
- **Source de données :** `timesheets` (à créer), `invoices`, `agency_rates`.
- **Plan :** Agency uniquement.
- **Priorité :** ⭐ NICE-TO-HAVE (marché saturated, scope creep risk).

---

## 26. Alertes Client Critiques — `SOS Client`

- **Ce qu'il montre :** Centre de notifications priorisé par client. Si Client X passe en DEFCON 4 → alerte rouge à toute l'équipe assignée + bouton « Activer cellule de crise » + checklist de réponse (pré-instaurée par client). Si Client Y a un pic de mentions négatives > 3σ → alerte jaune. Workflow de réponse semi-automatisé.
- **Pourquoi l'utilisateur en a besoin :** Quand un client est en crise, l'agence doit réagir en 15 minutes. Sans centralisation, c'est le chaos.
- **Type de graphique :** Feed d'alerts triées par priorité + action buttons + workflow checklist.
- **Source de données :** `crisis_data` par client + `alert_rules` + `crisis_playbooks`.
- **Plan :** Agency + Enterprise.
- **Priorité :** ⭐⭐⭐ MUST-HAVE.

---

## 27. Bibliothèque de Playbooks — `Bibliothèque Playbooks`

- **Ce qu'il montre :** 12+ playbooks de réponse : (a) Crise data leak, (b) Crise executive misconduct, (c) Crise produit défectueux, (d) Crise réglementaire, (e) M&A announcement, (f) Lancement produit, (g) Repositionnement marque, (h) Activation événementielle, (i) Gestion bad buzz social, (j) Communication financière, (k) Audit RP annuel, (l) Onboarding nouvelle marque. Chaque playbook = 8 étapes, templates, checklists, exemples.
- **Pourquoi l'utilisateur en a besoin :** Une agence junior a besoin de méthode. Les playbooks structurent l'action. Et rendent l'agence moins dépendante des seniors.
- **Type de graphique :** Gallery + playbook reader + checklist interactive + adapt-to-client.
- **Source de données :** `playbooks` (codés en dur initialement, editables par agence).
- **Plan :** Agency + Enterprise.
- **Priorité :** ⭐⭐ NICE-TO-HAVE.

---

## 28. Modèles d'Alertes Client — `Configurateur Alertes Client`

- **Ce qu'il montre :** Pour chaque client, configurer : (a) Seuils (volume, sentiment, DEFCON), (b) Mots-clés surveillés (produits, executive names, concurrents), (c) Canaux (email, WhatsApp, SMS, push), (d) Routage (account manager + backup), (e) Escalade horaire (jour/nuit/weekend). Templates pré-configurés par secteur.
- **Pourquoi l'utilisateur en a besoin :** 14 clients × 5 mots-clés × 3 canaux = 210 règles. Sans configurateur centralisé, c'est l'enfer.
- **Type de graphique :** Wizard 5 étapes + table règles + test ping + duplicate from template.
- **Source de données :** `client_alert_rules` (à créer), `alert_templates`.
- **Plan :** Agency uniquement.
- **Priorité :** ⭐⭐⭐ MUST-HAVE.

---

## 29. Concours & Reconnaissance — `Wall of Wins` 🌶️ IDÉE FOLLE

- **Ce qu'il montre :** Wall visuel des « wins » de l'agence : campagnes primées (SABRE, MENA PR Awards), case studies réussis, mentions presse de l'agence, témoignages clients. Mosaïque de cards type Pinterest. Filtres par année, par client, par type. Bouton « partager sur LinkedIn ».
- **Pourquoi l'utilisateur en a besoin :** Une agence se vend par ses succès. Wall of Wins = vitrine permanente, partageable, vivante. Mieux qu'une page « case studies » statique.
- **Type de graphique :** Masonry grid + cards + filters + social sharing buttons.
- **Source de données :** `agency_wins` (à créer), testimonials, awards.
- **Plan :** Agency uniquement.
- **Priorité :** 🌶️ CRAZY IDEA (effet culture + recrutement + acquisition).

---

## 30. Vision « Ex-Client » — `Réactivation Prospects Froids` 🌶️ IDÉE FOLLE

- **Ce qu'il montre :** Liste des anciens clients partis (churn 24 mois). Pour chacun : raison départ (si connue), sentiment actuel de leur marque (peut-être en difficulté sans agence ?), opportunité de réactivation (« l'ancien DG est parti, le nouveau est un ancien client de l'agence → opportunité »), suggestion d'approche.
- **Pourquoi l'utilisateur en a besoin :** Réactiver un ancien client coûte 5x moins cher qu'acquérir un nouveau. Harch identifie les fenêtres de réactivation.
- **Type de graphique :** Table ex-clients + cards raison + opportunity score + button « Démarrer réactivation ».
- **Source de données :** `agency_clients.status=churned` + `corporate_events` + LLM.
- **Plan :** Agency uniquement.
- **Priorité :** 🌶️ CRAZY IDEA (killer retention play).

---

# PARTIE 3 — MATRICE PRIORITÉS & EFFORT

## Enterprise — top 10 must-have à livrer en premier
| # | Feature | Effort | Impact |
|---|---------|--------|--------|
| 1 | Tableau Exécutif (8 KPI) | S | ⭐⭐⭐ |
| 2 | DEFCON Crise | M | ⭐⭐⭐ |
| 3 | Centre de Gouvernance | M | ⭐⭐⭐ (bloquant) |
| 4 | SSO/SAML | M | ⭐⭐⭐ (bloquant) |
| 5 | API & Intégrations | M | ⭐⭐⭐ |
| 6 | Vue Multi-Équipes | M | ⭐⭐⭐ |
| 7 | Briefing Exécutif IA | M | ⭐⭐⭐ (ROI) |
| 8 | Salle de Crise | L | ⭐⭐⭐ (wow) |
| 9 | Planificateur Rapports | S | ⭐⭐⭐ |
| 10 | Grille Visibilité AI (9 LLMs) | L | ⭐⭐⭐ (moat) |

## Agency — top 10 must-have à livrer en premier
| # | Feature | Effort | Impact |
|---|---------|--------|--------|
| 1 | Sélecteur de Client | S | ⭐⭐⭐ |
| 2 | Portefeuille Clients | S | ⭐⭐⭐ |
| 3 | Console Client | M | ⭐⭐⭐ |
| 4 | Paramètres White-Label | M | ⭐⭐⭐ (bloquant) |
| 5 | Tracker Campagnes + ROI | M | ⭐⭐⭐ |
| 6 | Studio Pitch Deck | L | ⭐⭐⭐ (acquisition) |
| 7 | Paysage Prospect | M | ⭐⭐⭐ |
| 8 | Portail Client | L | ⭐⭐⭐ (rétention) |
| 9 | Rapports Automatisés | M | ⭐⭐⭐ |
| 10 | Santé Client | M | ⭐⭐⭐ (anti-churn) |

## Crazy ideas à évaluer en phase 3
- Brand Digital Twin (Enterprise) — pourrait devenir produit à $1M/an
- Mode Bureau Exécutif (Enterprise) — vanity mais vendable
- Lab What-If (Enterprise) — killer si exécutable
- Wall of Wins (Agency) — culture + recrutement
- Réactivation Prospects Froids (Agency) — killer retention play

---

# PARTIE 4 — DIFFÉRENCIATEURS vs CONCURRENTS

| Différenciateur | Qui ne l'a pas | Effort Harch |
|-----------------|----------------|--------------|
| WhatsApp alerts natifs | Tous les 6 concurrents | ✅ déjà codé (Twilio) |
| Pricing public en MAD | Tous les 6 concurrents | ✅ déjà en place |
| Darija NLP | Tous les 6 concurrents | ⚠️ à industrialiser |
| AI Visibility 9 LLMs | Tous les 6 concurrents | ⚠️ 1 réel + 7 simulés → brancher 8 vrais |
| DEFCON marocain (AMMC/BAM aware) | Tous | M |
| Portail Client white-label | Brandwatch (à $$$$) | M |
| Studio Pitch Deck IA | Aucun (créneau neuf) | L |
| Brand Digital Twin | Aucun (rêve) | XL |

---

# CONCLUSION

Ce brainstorm documente **60 features** (30 Enterprise + 30 Agency), réparties en :
- **MUST-HAVE** : 20 (10 par plan) — à livrer phase 1 (Q4 2026)
- **NICE-TO-HAVE** : 26 — phase 2 (Q1 2027)
- **CRAZY IDEA** : 5 (Brand Digital Twin, Mode Bureau, Lab What-If, Wall of Wins, Réactivation) — phase 3 expérimentale (Q2 2027)

La stratégie gagnante pour Harch : **doubler les deux faces différenciatrices** :
1. **AI Visibility (9 LLMs)** — brancher les 8 LLMs manquants pour passer de « simulé » à « réel »
2. **Studio Pitch Deck + Portail Client white-label** — créer le segment « agence marocaine » qu'aucun concurrent global ne sert

Ces 2 axes représentent ~6 mois de roadmap et pourraient générer 30-40 contrats Enterprise/Agency à 30-50K MAD/mois = 1.5-2M MAD ARR additionnel sur 12 mois.

— Fin du brainstorm BRAIN-2 —
