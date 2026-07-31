# ANNEXE 04 — ANNEXE TECHNIQUE

## HARCH ATELIER — DESCRIPTION TECHNIQUE DE LA PLATEFORME

---

**Référence :** Annexe 04 au Contrat HARCH-SaaS-[CLIENT]-[YYYY]-[NNN]
**Version :** 1.0
**Date d'effet :** [DATE_EFFET]

---

## 1. ARCHITECTURE

**1.1. Stack technique.** La Plateforme Harch Atelier est construite sur une architecture moderne, typée edge-first, optimisée pour la faible latence et la haute disponibilité :

- **Framework applicatif** : Next.js 16.1.3 (App Router) avec Turbopack comme bundler ;
- **Langage** : TypeScript en mode strict, conformité ESLint ;
- **UI** : React 19, Tailwind CSS 4, shadcn/ui, Radix primitives, ECharts, deck.gl, maplibre-gl, React Flow ;
- **ORM et base de données** : Prisma 6 connecté à Neon Postgres (serverless Postgres) ;
- **Authentification** : NextAuth v4 avec support 2FA TOTP ;
- **Queue de jobs** : BullMQ (Redis) pour les pipelines d'ingest, NLP, scraping ;
- **Packs d'analyse** : modules NLP propriétaires (sentiment, darija analyzer, narrative propagation), modules de scoring bayésien, entity-resolver probabiliste.

**1.2. Architecture fonctionnelle.** La Plateforme est organisée autour de quatre Consoles (Brand Monitor, Competitor Intel, Investor Desk, Harch Alpha), d'un shell commun (ConsoleShell), d'un centre de commande unifié (Command Center) et d'une palette de commandes (Cmd+K).

**1.3. Modularité.** Les composants sont conçus pour permettre l'activation sélective de Consoles selon le niveau de licence souscrit (Executive / Sovereign), sans nécessiter de déploiement spécifique.

---

## 2. SÉCURITÉ

**2.1. Chiffrement.**
- **En transit** : TLS 1.3 obligatoire sur l'ensemble des flux (HTTP strict transport security, HSTS) ;
- **Au repos** : AES-256 sur la base de données Postgres, sur les sauvegardes et sur les stockages d'objets.

**2.2. Authentification.**
- NextAuth v4 avec stratégie de credentials et support SSO entreprise (Google Workspace, Microsoft Entra ID, GitLab) en option pour le niveau Sovereign ;
- Authentification à deux facteurs (2FA TOTP) obligatoire pour l'ensemble des Comptes, avec codes de récupération générés à l'activation ;
- Verrouillage temporaire après cinq (5) tentatives échouées, réinitialisation par flux administrateur.

**2.3. Contrôle d'accès.** Gestion fine des rôles et permissions : Admin, Analyst, Viewer, Guest. Chaque action sensible (export, suppression, modification de configuration) fait l'objet d'une journalisation avec horodatage, identifiant Utilisateur, et empreinte de l'action.

**2.4. Journalisation et audit.** Logs d'audit conservés douze (12) mois, horodatés et signés. Le Client (niveau Sovereign) peut accéder à un extrait de ses propres logs via une API dédiée.

**2.5. Tests de sécurité.** Tests SAST (Static Application Security Testing) et DAST (Dynamic Application Security Testing) intégrés au pipeline CI/CD. Tests d'intrusion annuels par un tiers indépendant, dont le rapport synthétique est communique au Client sur demande.

**2.6. Gestion des secrets.** Coffre-fort de secrets chiffré, rotation trimestrielle, accès restreint aux ingénieurs dûment habilités.

---

## 3. DONNÉES

**3.1. Sources et fréquences.**

| Source | Type | Fréquence de collecte |
|---|---|---|
| Hespress, Le360, TelQuel, Aujourdhui.ma, Médias24, L'Économiste | RSS presse marocaine | Toutes les 15 minutes |
| Reuters, AFP, Financial Times | RSS presse internationale | Toutes les 30 minutes |
| Yahoo Finance | Cours BVC et indices | Quotidienne (clôture) + intraday best-effort |
| OFAC, UE Consolidated, ONU, HM Treasury | Listes de sanctions | Hebdomadaire + notification |
| Bank Al-Maghrib, AMMC | Données institutionnelles | Mensuelle |
| GDELT (option Premium) | Flux internationaux | Quotidienne |

**3.2. Stockage.**
- Données structurées (articles, entités, scores, alertes) : Postgres sur Neon ;
- Fichiers et PDF générés : stockage d'objets (Cloudflare R2 ou Vercel Blob) ;
- Données Client importées : Postgres, isolation logique par Client (`clientId` mandatory) ;
- Métadonnées et logs : Postgres + service de journalisation externe.

**3.3. Rétention.**
- Articles et données publiques : 24 mois glissants ;
- Données Client : selon instruction du Client, suppression à la fin du Contrat après réversibilité (cf. Article 7.6 du Contrat principal) ;
- Logs d'audit : 12 mois ;
- Sauvegardes : 30 jours glissants.

**3.4. Pipeline de traitement.** Les données collectées passent par une chaîne orchestrée : ingest (RSS, scraping, API) → queue (BullMQ) → NLP worker (sentiment, narratifs, darija) → entity resolver → graph engine → scoring → indexation → exposition via API et Consoles.

---

## 4. API

**4.1. Endpoints publics.** La Plateforme expose une API REST documentée (OpenAPI 3.1) accessible aux Comptes autorisés. Les endpoints représentatifs incluent :

- `GET /api/console/sentiment-trend` — tendance de sentiment sur une entité ;
- `GET /api/console/ai-visibility` — visibilité AI d'une marque ;
- `GET /api/console/alerts` — liste des alertes actives ;
- `GET /api/console/source-matrix` — matrice des sources surveillées ;
- `GET /api/console/entity-network` — graphe d'entités connectées ;
- `GET /api/console/ask` — interrogation du HarchIQ Engine ;
- `GET /api/quote` — cours BVC ( YahFinance) ;
- `GET /api/investor/screen` — screening sanctions ;
- `GET /api/health` — sonde de disponibilité.

**4.2. Authentification API.** Par jeton bearer (JWT signé), rotation possible, révocation immédiate. Le Client peut générer jusqu'à cinq (5) jetons par Compte.

**4.3. Rate limiting.** Limites par défaut : 600 requêtes/minute par jeton, 5 000 requêtes/heure. Limites ajustables pour les licences Sovereign.

**4.4. Webhooks sortants.** Le Client peut s'abonner à des webhooks (alertes critiques, nouveaux rapports, incidents) vers des URL HTTPS qu'il contrôle, avec signature HMAC et retries exponentiels.

**4.5. MCP (Model Context Protocol).** La Plateforme met à disposition un serveur MCP permettant à des agents LLM autorisés d'interroger la base d'intelligence Harch dans un cadre maîtrisé.

---

## 5. INTÉGRATIONS

**5.1. Intégrations natives.**
- **Slack** : notifications d'alertes, briefing quotidien, partage de rapports ;
- **Microsoft Teams** : notifications, alerts, briefings ;
- **WhatsApp Business** (via Twilio) : alertes temps réel pour les incidents critiques, briefing matinal ;
- **Webhooks HTTP** :格式 JSON signé HMAC, configurable par le Client ;
- **EOD Historical Data** (option Premium) : données financières historiques ;
- **GDELT** (option Premium) : flux d'événements internationaux.

**5.2. Export.** Export CSV natif pour l'ensemble des vues tabulaires. Export PDF pour les rapports d'intelligence. Export JSON via API.

**5.3. Import.** Import CSV pour : listes d'entités, contreparties, marques surveillées. Import via API pour les intégrations programmatiques.

---

## 6. HÉBERGEMENT

**6.1. Application et edge.** Vercel (régions edge par défaut : iad1, cdg1, hnd1 ; possibilité de verrouiller à cdg1 pour les Clients soucieux de souveraineté européenne).

**6.2. Base de données.** Neon Postgres serverless, région par défaut eu-central-1 (Francfort), avec branching pour les environnements de préproduction.

**6.3. CDN et sécurité périmétrique.** Cloudflare (CDN, WAF, protection DDoS, rate limiting, bot management).

**6.4. Stockage d'objets.** Cloudflare R2 ou Vercel Blob, selon le type de contenu.

**6.5. Workers de queue.** BullMQ sur instance Redis dédiée (Upstash), région eu-central-1.

**6.6. Localisation.** Harch Corp s'engage à proposer, sur demande du Client Sovereign, une option de souveraineté renforcée (région eu-central-1 verrouillée, exclusion des régions US). Une option d'hébergement souverain au Maroc (datacenter local agréé) est à l'étude et pourra être proposée à titre d'avenant.

---

## 7. CONFORMITÉ

**7.1. Loi 09-08.** La Plateforme est conçue conformément aux principes de la Loi 09-08 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel : minimisation, finalité, sécurité, droit d'accès et de rectification. Le Client est responsable de traitement, Harch Corp sous-traitant.

**7.2. RGPD.** Pour les traitements concernant des résidents de l'Union Européenne, la Plateforme respecte les principes du RGPD : registre des traitements, contrats sous-traitants, notifications de violation sous 72h, droits des personnes (accès, rectification, effacement, portabilité).

**7.3. Loi 31-13.** Conformité à la Loi relative au commerce électronique : identification de l'éditeur, conditions générales accessibles, traçabilité des consentements.

**7.4. ISO 27001.** Roadmap de certification ISO/IEC 27001 engagée (cf. Article 8.4 du Contrat principal), cible à dix-huit (18) mois.

**7.5. ISO 27701.** Une extension ISO 27701 (Privacy Information Management) est étudiée en parallèle.

**7.6. Souveraineté des données.** Harch Corp s'engage à ne pas transférer de Données Client vers des juridictions ne présentant pas un niveau de protection adéquat, sauf garanties appropriées (clauses contractuelles types, BCR).

---

## 8. SAUVEGARDES ET CONTINUITÉ

**8.1. Sauvegardes.**
- Base de données : sauvegarde quotidienne automatisée (Neon), rétention 30 jours ;
- Point-in-time recovery (PITR) : 7 jours ;
- Fichiers et blobs : réplication multi-zones, rétention 30 jours ;
- Tests de restauration : mensuels, sur échantillon.

**8.2. Plan de continuité (PCA/PRA).**
- Objectif de Reprise (RTO) : 4 heures pour P1, 24 heures pour P2 ;
- Point de Reprise (RPO) : 1 heure (PITR), 24 heures (sauvegarde quotidienne) ;
- Basculabilité : architecture multi-régions avec région de secours (eu-west-1) activable manuellement ou automatiquement en cas d'incident majeur ;
- Tests de bascule : semestriels.

**8.3. Monitoring.**
- Supervision synthétique : 3 points de présence géographiques distincts (EU, US, APAC), sondes toutes les 60 secondes ;
- Supervision réelle : agrégation des temps de réponse par endpoint, alerting automatique sur seuils ;
- Page de status publique : `https://status.harchcorp.com`.

**8.4. Gestion des incidents.** Conformément au SLA (Annexe 02), avec post-mortem pour tout Incident P1 dans les 10 jours ouvrés.

---

## 9. ÉVOLUTIONS ET MISES À JOUR

**9.1. Déploiements.** Déploiements continus (CD) sur l'environnement de production, après validation automatique (tests unitaires, d'intégration, e2e) et revue humaine pour les modifications substantielles.

**9.2. Versionning.** Versionning sémantique (SemVer) appliqué aux API publiques. Toute rupture de compatibilité est annoncée avec un préavis minimum de six (6) mois, et accompagnée d'une période de chevauchement de trois (3) mois.

**9.3. Changelog.** Toute évolution fonctionnelle est documentée dans un changelog accessible aux Utilisateurs depuis la Plateforme.

---

## 10. CONTACTS TECHNIQUES

**10.1. Côté Harch Corp.**
- CTO : Monsieur Amine HARCH EL KORANE — `cto@harchcorp.com` ;
- Support L1 : `support@harchcorp.com` ;
- Account Manager (Sovereign) : désigné nommément à la signature.

**10.2. Côté Client.**
- Responsable Technique : [NOM_RT_CLIENT] — `[EMAIL_RT_CLIENT]` ;
- Responsable Sécurité : [NOM_RS_CLIENT] — `[EMAIL_RS_CLIENT]` ;
- Contact contractuel : `[EMAIL_CONTRACTUEL_CLIENT]`.

---

*Fin de l'Annexe 04 — Annexe Technique.*
