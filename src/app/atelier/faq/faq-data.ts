// ═══════════════════════════════════════════════════════════════════════
// HARCH ATELIER — FAQ DATA (CRAZY-8-FAQ)
// 52 questions · 6 catégories · partagé entre page.tsx (server) et FAQPage.tsx (client)
// ═══════════════════════════════════════════════════════════════════════

export type Category =
  | "Plateforme"
  | "Sécurité"
  | "Tarifs"
  | "Méthodologie"
  | "Conformité"
  | "Comptes";

export type FAQ = {
  id: number;
  category: Category;
  q: string;
  /** Court résumé toujours visible (3-5 phrases). */
  intro: string;
  /** Détail supplémentaire affiché après clic sur "Voir plus". */
  detail?: {
    bullets?: string[];
    note?: string;
  };
};

export const CATEGORY_LABEL: Record<Category | "Tous", string> = {
  Tous: "Tous",
  Plateforme: "Plateforme",
  Sécurité: "Sécurité",
  Tarifs: "Tarifs",
  Méthodologie: "Méthodologie",
  Conformité: "Conformité",
  Comptes: "Comptes",
};

export const CATEGORY_ORDER: Category[] = [
  "Plateforme",
  "Sécurité",
  "Tarifs",
  "Méthodologie",
  "Conformité",
  "Comptes",
];

export const FAQS: FAQ[] = [
  // ── PLATEFORME (10) ────────────────────────────────────────────────
  {
    id: 1,
    category: "Plateforme",
    q: "Qu'est-ce que Harch Atelier ?",
    intro:
      "Harch Atelier est la plateforme d'intelligence réputationnelle conçue pour le marché marocain et africain. Elle combine la veille médiatique, l'analyse de sentiment multilingue (français, arabe, darija), le suivi de la visibilité IA et la détection de crises en temps réel. La plateforme s'adresse aux directions de communication, RP, risque et conformité qui doivent anticiper les narratives avant qu'elles n'atteignent la masse. Notre promesse : livrer une information actionnable, en français, à 7h du matin sur WhatsApp.",
    detail: {
      bullets: [
        "Veille sur 30+ sources marocaines et africaines (Le Matin, L'Économiste, Hespress, TelQuel, Médias24, Aujourd'hui, Le Desk, ChallengeMA, Jeune Afrique, Financial Afrik...)",
        "Suivi de 8 moteurs IA : ChatGPT, Perplexity, Google AI Overviews, Gemini, Claude, Copilot, Mistral, Grok",
        "Tableaux de bord, alertes WhatsApp, rapports PDF board-ready, API REST et webhooks",
        "Hébergement souverain au Maroc, conformité CNDP / Loi 09-08",
      ],
      note:
        "Nous ne remplaçons pas votre outil d'écoute sociale (Meltwater, Brandwatch). Nous couvrons les deux canaux que ces outils ignorent : la presse marocaine et les réponses des moteurs IA.",
    },
  },
  {
    id: 2,
    category: "Plateforme",
    q: "Comment fonctionne la veille médiatique ?",
    intro:
      "Notre pipeline collecte les articles en continu depuis 30+ sources marocaines et africaines. Chaque article est crawlé toutes les 60 secondes pour les plans Corporate et Sovereign, toutes les 5 minutes pour le plan Essentiel. Une fois collecté, le texte passe par la détection de langue (fastText), l'extraction d'entités (spaCy + bibliothèque marocaine custom), la classification de sentiment (HarchIQ) et le clustering thématique (BERTopic).",
    detail: {
      bullets: [
        "Étape 1 — Ingestion : RSS, scraping HTML structuré, APIs partenaires",
        "Étape 2 — NLP : détection de langue, NER, classification de sentiment, topic modeling",
        "Étape 3 — Scoring : calcul du score de réputation, détection de pic de volume",
        "Étape 4 — Diffusion : tableau de bord, WhatsApp digest, alertes critiques, API",
      ],
      note:
        "Le délai total entre publication et livraison de l'alerte est inférieur à 5 minutes pour les plans Corporate et Sovereign, ce qui inclut l'analyse NLP complète.",
    },
  },
  {
    id: 3,
    category: "Plateforme",
    q: "Quelles sources marocaines surveillez-vous ?",
    intro:
      "Nous couvrons 18+ sources marocaines principales : presse nationale, presse économique, presse en ligne et médias d'investigation. La liste est révisée trimestriellement avec nos clients Corporate et Sovereign qui peuvent demander l'ajout de sources spécifiques (médias sectoriels, blogs d'influence, comptes Twitter/X identifiés).",
    detail: {
      bullets: [
        "Presse nationale : Le Matin, L'Opinion, Aujourd'hui le Maroc, Assabah, Al Massae",
        "Presse économique : L'Économiste, Médias24, ChallengeMA, Finances News, La Vie Éco",
        "Presse en ligne : Hespress, TelQuel, Le Desk, Yabiladi, Hespress English, Morocco World News",
        "Audiovisuel : 2M, SNRT (RTM, Arryadia, Athaqafia), Medi1 TV, Chada FM, Radio Mars",
        "Africa : Jeune Afrique, RFI Afrique, Africa News, Financial Afrik, The Africa Report",
      ],
      note:
        "Les sources en arabe et en darija sont analysées avec un modèle linguistique dédié (HarchIQ-AR), calibré sur le contexte marocain — pas une traduction automatique.",
    },
  },
  {
    id: 4,
    category: "Plateforme",
    q: "Qu'est-ce que la visibilité IA ?",
    intro:
      "La visibilité IA (GenAI Lens) mesure comment votre marque apparaît dans les réponses des moteurs IA générative — ChatGPT, Perplexity, Gemini, Claude, Copilot, Mistral, Grok et Google AI Overviews. Quand un client ou prospect demande « Quelle est la meilleure banque au Maroc ? », la réponse de ChatGPT façonne sa décision. Nous traquons cette réponse toutes les heures, sur 20 à 50 prompts sectoriels co-définis avec vous.",
    detail: {
      bullets: [
        "Métriques : présence, position (1er / 2e / non cité), sentiment, concurrents cités",
        "Refresh : horaire, avec digest quotidien envoyé à 7h",
        "Couverture : 8 moteurs IA, 20-50 prompts sectoriels",
        "Alerte : si votre marque chute de position ou disparaît d'une réponse",
      ],
      note:
        "C'est notre différenciation principale. Les outils d'écoute sociale ne couvrent pas les moteurs IA — ils regardent Twitter et Facebook. Nous regardons l'endroit où vos clients prennent désormais leurs décisions.",
    },
  },
  {
    id: 5,
    category: "Plateforme",
    q: "Comment fonctionne Harch Alpha (assistant IA) ?",
    intro:
      "Harch Alpha est votre assistant IA conversationnel, intégré à la console. Vous lui posez des questions en langage naturel — « Quel est le sentiment sur OCP cette semaine ? », « Compare ma réputation à Attijariwafa sur les 30 derniers jours » — et il interroge la base HarchIQ en temps réel. Il génère des synthèses, des tableaux, des extraits d'articles et peut préparer des brouillons de communiqué. Il est disponible 24/7 depuis la console et l'API.",
    detail: {
      bullets: [
        "Sources : toutes les données de votre compte (articles, scores, alertes, concurrents)",
        "Réponses citées : chaque affirmation est liée à l'article source (traçabilité SHA-256)",
        "Langues : français, arabe, anglais, darija",
        "Limites : ne décide pas à votre place, ne publie pas sans validation humaine",
      ],
      note:
        "Harch Alpha est un assistant d'intelligence, pas un assistant de décision. Les actions critiques (envoi de communiqué, escalade crise) restent sous contrôle humain avec audit trail complet.",
    },
  },
  {
    id: 6,
    category: "Plateforme",
    q: "Puis-je personnaliser mes tableaux de bord ?",
    intro:
      "Oui. La console propose un éditeur de tableaux de bord par glisser-déposer, accessible aux rôles Admin et Analyste. Vous choisissez les widgets (score de réputation, sentiment par source, top topics, alertes, visibilité IA, benchmark concurrentiel), leur disposition, leur fréquence de rafraîchissement et leurs destinataires. Les modèles peuvent être sauvegardés et partagés avec l'équipe. Les plans Corporate et Sovereign supportent les tableaux de bord multi-marques et multi-pays.",
    detail: {
      bullets: [
        "Widgets disponibles : 24 (score, sentiment, volume, topics, source matrix, géo, IA visibility, crises, influents)",
        "Modèles prêts à l'emploi : Daily Briefing, Crisis Room, Board Pack, Competitor Radar",
        "Partage : lien sécurisé, PDF, capture PNG, export CSV",
        "Multi-tenant : agences et groupes peuvent créer un dashboard par client/filiale",
      ],
      note:
        "Si vous avez besoin d'un widget spécifique (KPI métier, intégration API interne), notre équipe produit peut le développer dans le cadre d'un contrat Sovereign.",
    },
  },
  {
    id: 7,
    category: "Plateforme",
    q: "Quelles langues sont supportées ?",
    intro:
      "La plateforme supporte nativement le français, l'arabe standard (Fusha), l'anglais et la darija marocaine. Le modèle HarchIQ-AR est calibré spécifiquement sur le contexte marocain — il reconnaît les noms propres (OCP, RAM, Maroc Telecom), les expressions idiomatiques et le code-switching arabe-français fréquent dans la presse marocaine. L'interface de la console est disponible en français et en anglais ; l'arabe est en cours de finalisation.",
    detail: {
      bullets: [
        "NLP : français, arabe standard, darija, anglais — natif, pas de traduction",
        "Code-switching : détecté et traité (phrase mélangeant arabe et français)",
        "Interface : français (par défaut), anglais",
        "Rapports PDF : français, anglais, arabe (sur demande Sovereign)",
      ],
      note:
        "La darija est flaguée pour revue humaine lorsque le modèle a une confiance inférieure à 70 %. Nous préférons signaler qu'un analyste doit vérifier plutôt que de livrer une classification erronée.",
    },
  },
  {
    id: 8,
    category: "Plateforme",
    q: "Comment sont calculés les scores de réputation ?",
    intro:
      "Le score de réputation HarchIQ est un indice composite compris entre 0 et 100. Il combine cinq dimensions pondérées : volume de mentions (20 %), sentiment net (30 %), diversité des sources (15 %), share of voice vs concurrents (20 %) et visibilité IA (15 %). Chaque dimension est normalisée par secteur pour permettre la comparaison. Le score est calculé en continu et mis à jour toutes les heures sur le tableau de bord.",
    detail: {
      bullets: [
        "Volume : nombre de mentions pondéré par l'autorité de la source",
        "Sentiment net : % positif - % négatif, avec seuil d'alerte à -0.5",
        "Diversité : nombre de sources distinctes (un même article republié ne compte pas)",
        "Share of voice : votre volume vs la moyenne de 3 concurrents définis",
        "Visibilité IA : position et sentiment dans les réponses des 8 moteurs IA",
      ],
      note:
        "Le score est transparent : chaque composante est visible dans la console. Vous pouvez voir exactement pourquoi votre score a baissé — pas une boîte noire.",
    },
  },
  {
    id: 9,
    category: "Plateforme",
    q: "Qu'est-ce que le rétro-audit 48h ?",
    intro:
      "Le rétro-audit 48h est un service inclus dans tous les plans : nous analysons les 48 dernières heures de mentions sur votre marque avant votre onboarding. Cela vous donne immédiatement une photographie de votre réputation actuelle, des sujets émergents et des risques non détectés. Le rétro-audit est livré sous 24h après signature et comprend un PDF de 8 pages + un call de 45 minutes avec un analyste.",
    detail: {
      bullets: [
        "Période analysée : 48 heures avant la signature",
        "Livrables : PDF 8 pages + call analyste 45 min",
        "Contenu : score, top topics, alertes, 3 concurrents, recommandations",
        "Disponible : tous plans, une fois par compte",
      ],
      note:
        "Le rétro-audit est aussi un outil de calibrage : il nous permet d'ajuster les seuils d'alerte et la taxonomy thématique à votre secteur avant le démarrage.",
    },
  },
  {
    id: 10,
    category: "Plateforme",
    q: "Comment exporter mes données ?",
    intro:
      "L'export est disponible à trois niveaux : CSV depuis n'importe quel tableau de la console, PDF depuis les rapports mensuels, et API REST pour les intégrations custom. Tous les exports incluent la trace de provenance (source, URL, date de collecte, hash SHA-256). Les plans Corporate et Sovereign supportent également les webhooks pour pousser les données vers votre data warehouse (Snowflake, BigQuery, PostgreSQL).",
    detail: {
      bullets: [
        "CSV : articles, scores, alertes, mentions, insights — jusqu'à 100k lignes",
        "PDF : rapport mensuel board-ready (32 pages Corporate, 8 pages Essentiel)",
        "API REST : endpoints paginés, OAuth2, rate limit 1000 req/h",
        "Webhooks : push temps réel vers votre infrastructure (Sovereign)",
      ],
      note:
        "L'export complet de vos données (RGPD/CNDP — droit à la portabilité) est disponible sur demande à privacy@harchcorp.com. Délai : 72h.",
    },
  },

  // ── SÉCURITÉ (8) ───────────────────────────────────────────────────
  {
    id: 11,
    category: "Sécurité",
    q: "Mes données sont-elles sécurisées ?",
    intro:
      "Oui. La sécurité est une priorité absolue chez Harch Atelier. Toutes les données sont chiffrées en transit (TLS 1.3) et au repos (AES-256). L'infrastructure est hébergée dans un datacenter Tier-III au Maroc (Casablanca), certifié ISO 27001. Nous appliquons le principe du moindre privilège, l'authentification multi-facteurs est obligatoire pour les comptes Admin, et chaque action est journalisée dans un audit trail immuable (SHA-256).",
    detail: {
      bullets: [
        "Chiffrement : TLS 1.3 en transit, AES-256 au repos",
        "Hébergement : datacenter Tier-III Casablanca, ISO 27001",
        "Authentification : MFA obligatoire pour Admin, WebAuthn/Passkeys supportés",
        "Audit trail : immuable, horodaté, hash SHA-256 — conservé 5 ans",
      ],
      note:
        "Nous subissons annuellement un audit de sécurité externe par un cabinet marocain accrédité. Le rapport est disponible sous NDA pour les clients Sovereign.",
    },
  },
  {
    id: 12,
    category: "Sécurité",
    q: "Qu'est-ce que l'audit trail SHA-256 ?",
    intro:
      "L'audit trail est le journal immuable de toutes les actions effectuées sur la plateforme : qui s'est connecté, quelle requête a été lancée, quel article a été marqué, quelle alerte a été escaladée, quel rapport a été exporté. Chaque entrée est horodatée à la milliseconde et hashée en SHA-256 de manière chaînée (chaque entrée inclut le hash de la précédente). Cela rend la falsification rétroactive mathématiquement détectable.",
    detail: {
      bullets: [
        "Contenu : utilisateur, action, ressource, IP, timestamp, hash chaîné",
        "Conservation : 5 ans (conformité Loi 09-08 et exigences bancaires)",
        "Accès : Admin uniquement, export CSV signé numériquement",
        "Vérification : outil open-source pour recalculer la chaîne de hash",
      ],
      note:
        "L'audit trail répond aux exigences de la Loi 09-08 (protection des données personnelles au Maroc) et aux standards bancaires (Bâle II/III) en matière de traçabilité.",
    },
  },
  {
    id: 13,
    category: "Sécurité",
    q: "Comment fonctionne l'authentification ZKP ?",
    intro:
      "ZKP (Zero-Knowledge Proof) est une méthode cryptographique qui permet de prouver que vous connaissez un secret sans jamais le révéler. Chez Harch Atelier, le ZKP est utilisé pour l'authentification des comptes Sovereign : votre mot de passe ou votre clé n'est jamais transmis à nos serveurs. À la place, vous générez une preuve mathématique que vous connaissez le secret, et nous vérifions cette preuve. Même en cas de compromission de notre base, vos identifiants restent introuvables.",
    detail: {
      bullets: [
        "Protocole : Schnorr (courbes elliptiques secp256k1)",
        "Mise en œuvre : librairie open-source, vérifiable côté client",
        "Disponible : plan Sovereign uniquement",
        "Fallback : WebAuthn/Passkeys ou MFA TOTP pour les autres plans",
      ],
      note:
        "Le ZKP est particulièrement adapté aux institutions souveraines (banques centrales, régulateurs, ministères) pour qui la confidentialité de l'identité est une exigence absolue.",
    },
  },
  {
    id: 14,
    category: "Sécurité",
    q: "Puis-je utiliser des passkeys (WebAuthn) ?",
    intro:
      "Oui. Les passkeys WebAuthn sont supportés sur tous les plans. Ils remplacent avantageusement les mots de passe : vous vous authentifiez avec votre empreinte (Touch ID, Face ID, Windows Hello) ou une clé matérielle (YubiKey). Le secret ne quitte jamais votre appareil, ce qui élimine le risque de phishing et de vol de mot de passe. Nous recommandons aux administrateurs d'activer les passkeys dès le premier jour.",
    detail: {
      bullets: [
        "Plateformes : iOS 16+, Android 9+, macOS, Windows 10+, Chrome, Edge, Safari, Firefox",
        "Clés matérielles : YubiKey 5, SoloKeys, Titan Security Key",
        "Multi-appareils : jusqu'à 5 passkeys par compte",
        "Récupération : code de secours imprimable + contact admin",
      ],
      note:
        "L'activation des passkeys réduit le risque de phishing à quasiment zéro. C'est la mesure de sécurité la plus efficace que vous puissiez prendre en 2025.",
    },
  },
  {
    id: 15,
    category: "Sécurité",
    q: "Qu'est-ce que la révocation de session ?",
    intro:
      "La révocation de session permet à un administrateur de déconnecter immédiatement n'importe quel utilisateur de son compte, sur tous ses appareils. C'est essentiel quand un collaborateur quitte l'entreprise, perd son téléphone, ou quand un comportement suspect est détecté. La révocation est instantanée (moins de 5 secondes), invalide tous les tokens JWT et les cookies, et est journalisée dans l'audit trail.",
    detail: {
      bullets: [
        "Portée : tous les appareils (web, mobile, API tokens)",
        "Délai : moins de 5 secondes",
        "Déclencheurs : manuel (Admin), automatique (suspicion de compromission)",
        "Journalisé : entrée audit trail + notification email à l'utilisateur",
      ],
      note:
        "Pour les comptes Sovereign, la révocation peut être automatisée via SCIM (SAML/SSO) — quand vous désactivez un compte dans votre Active Directory, il est révoqué chez Harch dans la minute.",
    },
  },
  {
    id: 16,
    category: "Sécurité",
    q: "L'authentification à deux facteurs est-elle disponible ?",
    intro:
      "Oui. Le 2FA (two-factor authentication) est disponible sur tous les plans et obligatoire pour les rôles Admin et Analyste sur les plans Corporate et Sovereign. Nous supportons les applications TOTP (Google Authenticator, Authy, 1Password, Microsoft Authenticator), les passkeys WebAuthn et les SMS de secours (en option, déconseillés). Les codes de secours imprimables sont générés à l'activation.",
    detail: {
      bullets: [
        "Méthodes : TOTP (recommandé), WebAuthn (recommandé), SMS (secours)",
        "Applications : Google Authenticator, Authy, 1Password, Microsoft Authenticator",
        "Codes de secours : 10 codes uniques à usage unique",
        "Politique : 2FA obligatoire pour Admin sur plans Corporate et Sovereign",
      ],
      note:
        "Nous recommandons aux administrateurs d'activer la politique « 2FA requis pour tous les utilisateurs » dans les paramètres de sécurité. C'est une mesure de base qui élimine 99 % des attaques par mot de passe volé.",
    },
  },
  {
    id: 17,
    category: "Sécurité",
    q: "Le SSO/SAML est-il supporté ?",
    intro:
      "Oui. Le SSO (Single Sign-On) via SAML 2.0 est supporté sur les plans Corporate et Sovereign. Nous sommes compatibles avec Microsoft Entra ID (ex-Azure AD), Okta, Google Workspace, OneLogin et tout IdP conforme SAML 2.0. Le SCIM (System for Cross-domain Identity Management) est également supporté pour le provisionnement automatique des utilisateurs. Cette intégration est configurée par notre équipe pendant l'onboarding.",
    detail: {
      bullets: [
        "Protocoles : SAML 2.0, OIDC, SCIM 2.0",
        "IdP compatibles : Microsoft Entra ID, Okta, Google Workspace, OneLogin, Auth0",
        "Provisionnement : automatique (création/suspension/révocation via SCIM)",
        "Just-in-time : création de compte à la première connexion",
      ],
      note:
        "Le SSO élimine la gestion manuelle des comptes. Quand un collaborateur quitte votre entreprise, sa désactivation dans votre Active Directory le déconnecte immédiatement de Harch Atelier.",
    },
  },
  {
    id: 18,
    category: "Sécurité",
    q: "L'hébergement est-il au Maroc ?",
    intro:
      "Oui. L'hébergement souverain au Maroc est disponible sur tous les plans et activé par défaut pour les clients marocains. Nos serveurs sont dans un datacenter Tier-III à Casablanca, certifié ISO 27001 et conforme aux exigences de la Loi 09-08. Vos données ne quittent jamais le territoire marocain. L'option d'hébergement multi-région (Casablanca + Paris pour reprise d'activité) est disponible pour les plans Sovereign.",
    detail: {
      bullets: [
        "Datacenter : Tier-III Casablanca, certifié ISO 27001",
        "Conformité : Loi 09-08 (CNDP Maroc), RGPD (pour données UE)",
        "Souveraineté : données stockées et traitées au Maroc, aucune réplication à l'étranger",
        "PRA : option multi-région (Casablanca + Paris) pour Sovereign",
      ],
      note:
        "L'hébergement souverain est une exigence pour les institutions publiques marocaines, les banques et les opérateurs stratégiques. Nous le fournissons par défaut, pas en option payante.",
    },
  },

  // ── TARIFS (8) ─────────────────────────────────────────────────────
  {
    id: 19,
    category: "Tarifs",
    q: "Pourquoi les prix ne sont-ils pas affichés ?",
    intro:
      "Parce que nos tarifs dépendent fortement du profil du client : nombre de marques suivies, nombre de sources, pays couverts, nombre d'utilisateurs, niveau de service (SLA) et engagements annuels. Afficher un prix fixe serait trompeur. Nous préférons proposer un devis personnalisé en moins de 24h après une conversation de 20 minutes. Vous saurez exactement ce que vous payez et pourquoi — pas de boîte noire tarifaire.",
    detail: {
      bullets: [
        "Critères : marques, sources, pays, utilisateurs, SLA, engagement",
        "Devis : personnalisé sous 24h après un call découverte de 20 min",
        "Transparence : grille tarifaire détaillée remise avec le devis",
        "Révision : annuelle, avec clause de fidélité",
      ],
      note:
        "Nous ne pratiquons pas de prix « appel » attractifs cachant des options payantes. Tout est inclus dans le devis : onboarding, formation, support, mises à jour.",
    },
  },
  {
    id: 20,
    category: "Tarifs",
    q: "Quels sont les différents plans ?",
    intro:
      "Quatre plans adaptés à la taille et aux besoins de chaque organisation. Essentiel pour les petites équipes de communication qui démarrent leur veille. Pro pour les équipes régionales qui doivent anticiper avec une analyse avancée. Grandes Entreprises pour les marques leaders et internationales avec gouvernance et conformité. Agences pour les agences RP et cabinets de conseil multi-clients avec white-label.",
    detail: {
      bullets: [
        "Essentiel : 1 marque, 10 sources, 3 moteurs IA, dashboard, WhatsApp digest",
        "Pro : 3 marques, 30+ sources, 8 moteurs IA, Harch Alpha, benchmark concurrentiel",
        "Grandes Entreprises : marques illimitées, taxonomy custom, SSO/SAML, audit trail avancé",
        "Agences : multi-clients, white-label, gouvernance multi-comptes, quota flexible",
      ],
      note:
        "Tous les plans incluent l'hébergement souverain au Maroc, la conformité CNDP et le rétro-audit 48h. 70 % de nos clients démarrent en Essentiel ou Pro et montent en gamme dans les 6 mois.",
    },
  },
  {
    id: 21,
    category: "Tarifs",
    q: "Proposez-vous des engagements annuels ?",
    intro:
      "Oui. Les plans Essentiel et Pro fonctionnent en engagement annuel avec paiement mensuel. Les plans Grandes Entreprises et Agences sont contractualisés en contrat-cadre 12 ou 24 mois avec clauses de révision trimestrielle. L'engagement annuel permet de bénéficier d'une remise de 15 % par rapport au paiement mois par mois, et garantit la stabilité de l'équipe dédiée et du pricing.",
    detail: {
      bullets: [
        "Essentiel / Pro : engagement annuel, paiement mensuel, remise 15 %",
        "Grandes Entreprises / Agences : contrat-cadre 12 ou 24 mois, révision trimestrielle",
        "Pilote : 30 jours possible sur Pro et supérieur (facturé au prorata)",
        "Sortie anticipée : possible moyennant préavis 90 jours (Sovereign)",
      ],
      note:
        "Le pilote de 30 jours est idéal pour valider la pertinence de la plateforme avant de s'engager. Il inclut le rétro-audit 48h et un call hebdomadaire avec un analyste senior.",
    },
  },
  {
    id: 22,
    category: "Tarifs",
    q: "L'hébergement est-il au Maroc ?",
    intro:
      "Oui, par défaut. L'hébergement souverain au Maroc est inclus dans tous les plans, sans surcoût. Vos données sont stockées et traitées dans un datacenter Tier-III à Casablanca, certifié ISO 27001. Cette option est obligatoire pour les institutions publiques marocaines, les banques et les opérateurs stratégiques — nous la fournissons par défaut pour tous nos clients, pas en option payante. Voir aussi la question 18 de la catégorie Sécurité.",
    detail: {
      bullets: [
        "Localisation : datacenter Tier-III Casablanca",
        "Certification : ISO 27001",
        "Conformité : Loi 09-08 (CNDP Maroc)",
        "Coût : inclus dans tous les plans, sans surcoût",
      ],
      note:
        "Si vous avez une exigence de double hébergement (Maroc + UE pour des filiales européennes), nous proposons une option multi-région pour les plans Sovereign.",
    },
  },
  {
    id: 23,
    category: "Tarifs",
    q: "Comment se passe la formation ?",
    intro:
      "La formation est incluse dans tous les plans. Le plan Essentiel inclut une session de 2h en visio (un utilisateur). Le plan Pro inclut 2 sessions de 2h (jusqu'à 5 utilisateurs). Les plans Grandes Entreprises et Agences incluent un programme de 4 sessions sur 2 semaines, jusqu'à 15 utilisateurs, avec un analyste senior dédié. Les sessions sont enregistrées et disponibles dans la console. Une documentation complète (FR/EN) est également accessible.",
    detail: {
      bullets: [
        "Essentiel : 1 session de 2h, 1 utilisateur",
        "Pro : 2 sessions de 2h, jusqu'à 5 utilisateurs",
        "Grandes Entreprises / Agences : 4 sessions sur 2 semaines, jusqu'à 15 utilisateurs",
        "Format : visio (Teams/Zoom), enregistrée, documentation FR/EN",
      ],
      note:
        "Les sessions de formation supplémentaires sont disponibles en option (facturées à l'heure). Nous recommandons une session de rappel trimestrielle pour les nouvelles recrues.",
    },
  },
  {
    id: 24,
    category: "Tarifs",
    q: "Quel est le délai de mise en place ?",
    intro:
      "Le délai de mise en place dépend du plan. Pour le plan Essentiel : 48 heures après signature. Pour les plans Pro et Grandes Entreprises : 5 à 10 jours ouvrés, incluant l'onboarding, le paramétrage des sources, la calibration de la taxonomy et la formation de l'équipe. Pour les plans Agences avec multi-clients : 2 à 3 semaines selon le nombre de clients à configurer. Le rétro-audit 48h est livré dès le premier jour pour vous donner une valeur immédiate.",
    detail: {
      bullets: [
        "Essentiel : 48h après signature",
        "Pro : 5 à 10 jours ouvrés (onboarding + paramétrage + formation)",
        "Grandes Entreprises : 5 à 10 jours ouvrés (avec SSO et taxonomy custom)",
        "Agences : 2 à 3 semaines selon nombre de clients",
      ],
      note:
        "Pendant la période de mise en place, vous avez déjà accès à la console et au rétro-audit. Vous ne payez qu'à partir de la livraison complète (paramétrage + formation).",
    },
  },
  {
    id: 25,
    category: "Tarifs",
    q: "Proposez-vous un essai gratuit ?",
    intro:
      "Nous proposons un essai pilote de 30 jours, facturé au prorata du plan choisi, pour les plans Pro et supérieurs. Le pilote inclut le rétro-audit 48h, un call hebdomadaire avec un analyste senior, et l'accès complet à la console. Si vous décidez de ne pas poursuivre, vous ne payez que les 30 jours — sans engagement. Nous ne proposons pas d'essai gratuit car la mise en place représente un travail significatif de notre équipe (paramétrage, calibration, formation).",
    detail: {
      bullets: [
        "Durée : 30 jours",
        "Coût : prorata du plan Pro (pas gratuit, mais sans engagement)",
        "Inclus : rétro-audit 48h, calls hebdomadaires, console complète",
        "Sortie : sans frais, vous ne payez que les 30 jours",
      ],
      note:
        "Le rétro-audit 48h livré dès le premier jour vous permet de mesurer la valeur de la plateforme avant même la fin du pilote. 85 % de nos clients pilotes signent un contrat annuel.",
    },
  },
  {
    id: 26,
    category: "Tarifs",
    q: "Puis-je changer de plan en cours d'année ?",
    intro:
      "Oui. Vous pouvez monter en gamme à tout moment — la facturation est proratisée à partir de la date d'effet. La descente en gamme est possible à la date anniversaire du contrat, avec un préavis de 60 jours. Pour les montées en gamme, nous offrons la migration et la formation complémentaire sans frais. Les ajouts d'options (sources supplémentaires, marques, utilisateurs) sont également possibles en cours d'année, proratisés.",
    detail: {
      bullets: [
        "Montée en gamme : à tout moment, prorata temporis, migration offerte",
        "Descente en gamme : à la date anniversaire, préavis 60 jours",
        "Options additionnelles : marques, sources, utilisateurs — prorata temporis",
        "Migration : sans frais, formation complémentaire incluse",
      ],
      note:
        "70 % de nos clients démarrent en Essentiel ou Pro et montent en gamme dans les 6 mois, une fois qu'ils mesurent la valeur de la plateforme. Nous accompagnons cette croissance sans friction.",
    },
  },

  // ── MÉTHODOLOGIE (8) ───────────────────────────────────────────────
  {
    id: 27,
    category: "Méthodologie",
    q: "Comment calculez-vous le score de réputation ?",
    intro:
      "Le score HarchIQ est un indice composite 0-100 qui combine cinq dimensions : volume de mentions (20 %), sentiment net (30 %), diversité des sources (15 %), share of voice vs concurrents (20 %) et visibilité IA (15 %). Chaque dimension est normalisée par secteur. Le score est calculé en continu, mis à jour toutes les heures, et affiché sur le tableau de bord avec son delta vs hier et vs il y a 30 jours. Chaque composante est visible — pas de boîte noire.",
    detail: {
      bullets: [
        "Volume (20 %) : nombre de mentions pondéré par l'autorité de la source",
        "Sentiment net (30 %) : % positif - % négatif, seuil d'alerte à -0.5",
        "Diversité (15 %) : nombre de sources distinctes (republications exclues)",
        "Share of voice (20 %) : votre volume vs moyenne de 3 concurrents",
        "Visibilité IA (15 %) : position et sentiment dans 8 moteurs IA",
      ],
      note:
        "Le score est transparent : chaque composante est visible dans la console. Vous pouvez voir exactement pourquoi votre score a baissé, et agir sur la dimension concernée.",
    },
  },
  {
    id: 28,
    category: "Méthodologie",
    q: "Qu'est-ce que le Harch 100 ?",
    intro:
      "Le Harch 100 est le classement trimestriel des 100 marques les plus visibles au Maroc, calculé à partir de notre score HarchIQ. Il couvre 8 secteurs (banque, télécoms, énergie, distribution, FMCG, immobilier, transport, public sector). Le classement est publié en open access sur notre site, avec une analyse détaillée par secteur réservée aux abonnés. C'est devenu une référence pour les directions de communication marocaines qui veulent se comparer à leurs pairs.",
    detail: {
      bullets: [
        "Périmètre : 100 marques marocaines et internationales opérant au Maroc",
        "Secteurs : 8 (banque, télécoms, énergie, distribution, FMCG, immobilier, transport, public)",
        "Fréquence : trimestriel, publication en open access",
        "Méthodologie : publique, document PDF téléchargeable",
      ],
      note:
        "Le Harch 100 est cité par la presse marocaine (L'Économiste, Médias24) comme référence sectorielle. Y figurer est devenu un objectif de communication pour les marques leaders.",
    },
  },
  {
    id: 29,
    category: "Méthodologie",
    q: "Comment analysez-vous le sentiment en Darija ?",
    intro:
      "La darija est analysée par notre modèle HarchIQ-AR, calibré spécifiquement sur le contexte marocain. Le modèle a été entraîné sur un corpus de 500 000 articles marocains annotés manuellement par des linguistes natifs. Il reconnaît les expressions idiomatiques (« mwlin », « safi », « wakha »), le code-switching arabe-français, et les noms propres marocains. Les cas à faible confiance (<70 %) sont flagués pour revue humaine.",
    detail: {
      bullets: [
        "Modèle : HarchIQ-AR (spécifique darija + arabe marocain)",
        "Corpus d'entraînement : 500 000 articles annotés par linguistes natifs",
        "Code-switching : détecté et traité (mélange arabe-français)",
        "Confiance < 70 % : flag pour revue humaine (pas d'erreur non détectée)",
      ],
      note:
        "La darija est difficile pour les modèles génériques (GPT-4, Claude) qui la confondent avec l'arabe standard. Notre modèle spécialisé est 30 % plus précis sur le sentiment en darija.",
    },
  },
  {
    id: 30,
    category: "Méthodologie",
    q: "Qu'est-ce que le Registre National des Crises ?",
    intro:
      "Le Registre National des Crises est une base documentaire des crises médiatiques ayant touché des organisations marocaines depuis 2015. Chaque crise est documentée : déclencheur, timeline, sources, sentiment, durée, impact réputationnel estimé, réponse de l'organisation, leçons apprises. C'est un outil d'apprentissage pour les directions de communication qui veulent se préparer. Accès réservé aux plans Pro et supérieurs.",
    detail: {
      bullets: [
        "Périmètre : crises marocaines depuis 2015 (200+ cas documentés)",
        "Contenu : déclencheur, timeline, sources, sentiment, réponse, leçons",
        "Accès : plans Pro, Grandes Entreprises, Agences",
        "Mise à jour : continue, nouvelle crise ajoutée dans les 72h",
      ],
      note:
        "Le Registre est aussi utilisé en interne pour calibrer nos modèles de détection précoce. Les patterns appris alimentent nos alertes de risque crise.",
    },
  },
  {
    id: 31,
    category: "Méthodologie",
    q: "Comment fonctionne le benchmarking concurrentiel ?",
    intro:
      "Vous définissez 3 concurrents (5 en Corporate, illimité en Sovereign). Nous trackons leurs mentions, leur sentiment, leur share of voice et leur visibilité IA en parallèle avec les vôtres. Le benchmark est affiché sous forme de tableau comparatif, de graphiques d'évolution et d'un radar de positionnement. Une alerte est déclenchée si un concurrent dépasse votre share of voice de +20 % sur un sujet donné.",
    detail: {
      bullets: [
        "Concurrents : 3 (Pro), 5 (Corporate), illimité (Sovereign)",
        "Métriques : volume, sentiment, share of voice, visibilité IA, topics",
        "Alertes : dépassement de share of voice de +20 % sur un topic",
        "Visualisations : tableau comparatif, courbes d'évolution, radar",
      ],
      note:
        "Le benchmark concurrentiel est l'une des fonctionnalités les plus utilisées par nos clients. Il transforme la veille passive en intelligence stratégique actionnable.",
    },
  },
  {
    id: 32,
    category: "Méthodologie",
    q: "Qu'est-ce que la visibilité IA (GenAI Lens) ?",
    intro:
      "La visibilité IA (GenAI Lens) mesure comment votre marque apparaît dans les réponses des 8 moteurs IA générative (ChatGPT, Perplexity, Gemini, Claude, Copilot, Mistral, Grok, Google AI Overviews). Nous interrogeons ces moteurs toutes les heures avec 20 à 50 prompts sectoriels co-définis avec vous, puis nous trackons : présence, position (1er / 2e / non cité), sentiment, et concurrents cités. C'est le canal d'intelligence le plus stratégique en 2025 — vos clients s'informent désormais via l'IA générative.",
    detail: {
      bullets: [
        "8 moteurs IA trackés en continu (refresh horaire)",
        "20-50 prompts sectoriels co-définis avec le client",
        "Métriques : présence, position, sentiment, concurrents cités",
        "Alerte : si votre marque chute de position ou disparaît d'une réponse",
      ],
      note:
        "La visibilité IA est notre différenciation principale. Aucun outil d'écoute sociale ne couvre ce canal — ils regardent Twitter et Facebook, pas ChatGPT.",
    },
  },
  {
    id: 33,
    category: "Méthodologie",
    q: "Comment sont générés les insights HarchIQ ?",
    intro:
      "Les insights HarchIQ sont des synthèses automatiques générées par notre moteur IA à partir des données de votre compte. Ils identifient les tendances émergentes (sujet nouveau en croissance), les anomalies (pic de volume, chute de sentiment), les corrélations (un événement externe qui impacte votre réputation) et les opportunités (un sujet où vous êtes sous-représenté vs concurrents). Chaque insight est livré avec les articles sources et une recommandation actionnable.",
    detail: {
      bullets: [
        "Types : tendance émergente, anomalie, corrélation, opportunité",
        "Génération : quotidienne, à 6h, diffusée dans le WhatsApp digest",
        "Sources : chaque insight cite 3-5 articles avec trace de provenance",
        "Recommandation : action concrète proposée (communiqué, escalade, surveillance)",
      ],
      note:
        "Les insights sont générés par IA mais validés par un analyste senior avant envoi. Nous évitons ainsi les fausses alertes et garantissons la pertinence opérationnelle.",
    },
  },
  {
    id: 34,
    category: "Méthodologie",
    q: "Qu'est-ce que la traçabilité (provenance) ?",
    intro:
      "La traçabilité est le principe qu'aucune donnée n'existe sans source. Chaque score, chaque insight, chaque alerte est lié à l'article source, à l'URL, à la date de collecte et au hash SHA-256 de l'article original. Cela garantit que toute affirmation peut être vérifiée et auditée. C'est essentiel pour les directions qui doivent défendre leurs décisions devant un COMEX, un conseil d'administration ou un régulateur.",
    detail: {
      bullets: [
        "Contenu : URL source, date de collecte, hash SHA-256 de l'article",
        "Affichage : lien cliquable depuis chaque score, insight, alerte",
        "Audit trail : conservé 5 ans, conforme Loi 09-08",
        "Vérification : outil open-source pour recalculer les hash",
      ],
      note:
        "La traçabilité répond aux exigences de la Loi 09-08 (CNDP Maroc) et aux standards bancaires. Elle distingue Harch Atelier des outils d'écoute sociale qui présentent des scores sans sources vérifiables.",
    },
  },

  // ── CONFORMITÉ (8) ─────────────────────────────────────────────────
  {
    id: 35,
    category: "Conformité",
    q: "Êtes-vous conforme CNDP ?",
    intro:
      "Oui. Harch Atelier est déclaré auprès de la CNDP (Commission Nationale de Contrôle de la Protection des Données à Caractère Personnel) du Maroc, conformément à la Loi 09-08. Nos traitements de données personnelles sont documentés dans un registre des traitements, accessible sur demande aux clients Sovereign. Nous n'exploitons que des données publiques (articles de presse, posts publics) et nous n'achetons ni ne revendons de données personnelles.",
    detail: {
      bullets: [
        "Statut : déclaré auprès de la CNDP Maroc (Loi 09-08)",
        "Données traitées : uniquement publiques (presse, posts publics)",
        "Registre des traitements : documenté, accessible sous NDA (Sovereign)",
        "Aucune revente : nous ne vendons pas de données à des tiers",
      ],
      note:
        "La conformité CNDP est une exigence pour tous nos clients marocains, en particulier les banques, assurances et institutions publiques. Nous la fournissons par défaut, pas en option.",
    },
  },
  {
    id: 36,
    category: "Conformité",
    q: "Qu'est-ce que la Loi 09-08 ?",
    intro:
      "La Loi 09-08 est la loi marocaine de protection des données personnelles, promulguée en 2009 et supervisée par la CNDP. Elle encadre la collecte, le traitement, la conservation et le partage des données personnelles. Toute organisation traitant des données personnelles au Maroc doit se déclarer auprès de la CNDP, justifier ses traitements, et garantir la sécurité, la confidentialité et le droit à l'effacement. Harch Atelier est entièrement conforme à cette loi.",
    detail: {
      bullets: [
        "Promulgation : 2009, superviseur = CNDP (Commission Nationale)",
        "Champ : toute organisation traitant des données personnelles au Maroc",
        "Exigences : déclaration, justification, sécurité, droit à l'effacement",
        "Sanctions : amendes et sanctions pénales en cas de non-conformité",
      ],
      note:
        "La Loi 09-08 est l'équivalent marocain du RGPD européen. Les deux cadres convergent sur les principes (minimisation, finalité, sécurité) mais diffèrent sur les procédures.",
    },
  },
  {
    id: 37,
    category: "Conformité",
    q: "L'hébergement souverain est-il disponible ?",
    intro:
      "Oui. L'hébergement souverain au Maroc est inclus dans tous les plans, sans surcoût. Vos données sont stockées et traitées dans un datacenter Tier-III à Casablanca, certifié ISO 27001. Aucune réplication à l'étranger n'a lieu par défaut. Cette option est obligatoire pour les institutions publiques marocaines, les banques, les opérateurs stratégiques et les organisations soumises à la Loi 09-08. Voir aussi les questions 18 (Sécurité) et 22 (Tarifs).",
    detail: {
      bullets: [
        "Localisation : datacenter Tier-III Casablanca",
        "Certification : ISO 27001",
        "Réplication : aucune à l'étranger par défaut",
        "Option multi-région : Casablanca + Paris (Sovereign uniquement)",
      ],
      note:
        "L'hébergement souverain est un élément clé de notre proposition de valeur. C'est ce qui nous distingue des outils SaaS américains ou européens qui répliquent vos données hors Maroc.",
    },
  },
  {
    id: 38,
    category: "Conformité",
    q: "Puis-je exporter mes données ?",
    intro:
      "Oui. L'export de vos données est disponible en self-service depuis la console (CSV) ou via l'API REST. L'export complet (tous les articles, scores, alertes, insights, audit trail) est disponible sur demande à privacy@harchcorp.com, livré sous 72h au format CSV + JSON. Cet export inclut la trace de provenance (URL, date, hash SHA-256) pour chaque donnée. Il répond au droit à la portabilité prévu par la Loi 09-08 et le RGPD.",
    detail: {
      bullets: [
        "Self-service : CSV depuis la console (jusqu'à 100k lignes)",
        "API REST : endpoints paginés, OAuth2, rate limit 1000 req/h",
        "Export complet : sur demande, 72h, format CSV + JSON",
        "Contenu : articles, scores, alertes, insights, audit trail + provenance",
      ],
      note:
        "L'export complet est gratuit et illimité. Nous ne retenons pas vos données — vous pouvez partir quand vous voulez avec toutes vos données en main.",
    },
  },
  {
    id: 39,
    category: "Conformité",
    q: "Comment supprimer mes données ?",
    intro:
      "Vous pouvez demander la suppression complète de vos données à tout moment, par email à privacy@harchcorp.com. La suppression est effective sous 30 jours, conformément à la Loi 09-08 et au RGPD. Sont supprimés : tous vos articles collectés, scores, alertes, insights, configurations et l'audit trail associé. Une attestation de suppression signée vous est remise. Les données anonymisées agrégées (Harch 100) peuvent être conservées à des fins statistiques, sans lien vers votre organisation.",
    detail: {
      bullets: [
        "Demande : email à privacy@harchcorp.com",
        "Délai : 30 jours (conformité Loi 09-08 et RGPD)",
        "Périmètre : articles, scores, alertes, insights, configurations, audit trail",
        "Attestation : certificat de suppression signé remis au client",
      ],
      note:
        "Les données anonymisées agrégées (comme le Harch 100) peuvent être conservées sans lien vers votre organisation. Vous pouvez vous y opposer en précisant « suppression totale » dans votre demande.",
    },
  },
  {
    id: 40,
    category: "Conformité",
    q: "Audit trail — combien de temps conservé ?",
    intro:
      "L'audit trail est conservé 5 ans, conformément aux exigences de la Loi 09-08 (CNDP Maroc) et des standards bancaires (Bâle II/III). Cette durée permet de couvrir les délais de prescription en matière de litiges commerciaux, de contrôles régulateurs et d'audits internes. À l'issue des 5 ans, les entrées sont automatiquement supprimées et un certificat de destruction est généré. La conservation prolongée (jusqu'à 10 ans) est disponible en option pour les plans Sovereign.",
    detail: {
      bullets: [
        "Durée standard : 5 ans (conformité Loi 09-08 + standards bancaires)",
        "Suppression : automatique à l'issue, certificat de destruction",
        "Option Sovereign : conservation prolongée jusqu'à 10 ans",
        "Accès : Admin uniquement, export CSV signé numériquement",
      ],
      note:
        "La conservation de 5 ans est calée sur les délais de prescription en vigueur au Maroc. Elle répond aux exigences des banques, assurances et institutions publiques.",
    },
  },
  {
    id: 41,
    category: "Conformité",
    q: "RGPD — êtes-vous conforme ?",
    intro:
      "Oui. Harch Atelier est conforme au RGPD européen en plus de la Loi 09-08 marocaine. Cette double conformité est essentielle pour nos clients qui ont des filiales dans l'UE ou qui traitent des données de ressortissants européens. Nous respectons les principes du RGPD : minimisation, finalité, sécurité, droit à l'effacement, droit à la portabilité, transparence. Notre DPO (Délégué à la Protection des Données) est joignable à privacy@harchcorp.com.",
    detail: {
      bullets: [
        "Conformité : Loi 09-08 (Maroc) + RGPD (UE) — double conforme",
        "Principes : minimisation, finalité, sécurité, droit à l'effacement, portabilité",
        "DPO : joignable à privacy@harchcorp.com",
        "Registre des traitements : documenté, accessible sous NDA (Sovereign)",
      ],
      note:
        "La double conformité Loi 09-08 + RGPD est rare au Maroc. Elle nous permet de servir les groupes marocains avec filiales européennes sans fragmentation contractuelle.",
    },
  },
  {
    id: 42,
    category: "Conformité",
    q: "Vos sous-traitants sont-ils au Maroc ?",
    intro:
      "Nos sous-traitants critiques (hébergement, sauvegarde, support) sont au Maroc, dans des datacenters certifiés ISO 27001. Certains sous-traitants non-critiques (modèles IA génériques, services de paiement) peuvent être situés dans l'UE, dans le respect strict du RGPD et avec garanties contractuelles (CCA, BCR). Aucune donnée personnelle n'est transférée hors de l'EEE sans encadrement juridique approprié. La liste complète des sous-traitants est disponible sous NDA pour les clients Sovereign.",
    detail: {
      bullets: [
        "Sous-traitants critiques : hébergement, sauvegarde, support — au Maroc",
        "Sous-traitants non-critiques : modèles IA, paiement — UE (RGPD-conforme)",
        "Transferts hors EEE : aucun sans garanties contractuelles (CCA, BCR)",
        "Liste des sous-traitants : disponible sous NDA pour Sovereign",
      ],
      note:
        "La souveraineté des sous-traitants est un sujet critique pour les institutions publiques marocaines. Nous le documentons avec précision pour permettre à nos clients de répondre à leurs propres exigences de conformité.",
    },
  },

  // ── COMPTES (10) ───────────────────────────────────────────────────
  {
    id: 43,
    category: "Comptes",
    q: "Comment inviter un collègue ?",
    intro:
      "L'invitation d'un nouvel utilisateur se fait depuis la console, onglet « Équipe » → « Inviter ». Vous renseignez l'email, le rôle (Admin, Analyste, Lecteur, Agence), et optionnellement le client/filiale à assigner (plans Agences). Le collaborateur reçoit un email d'invitation avec un lien sécurisé valable 7 jours. À la première connexion, il configure son mot de passe et (recommandé) son 2FA. Les invitations sont journalisées dans l'audit trail.",
    detail: {
      bullets: [
        "Accès : console → Équipe → Inviter",
        "Champs : email, rôle, client/filiale (Agences)",
        "Email : lien sécurisé valable 7 jours",
        "Première connexion : mot de passe + 2FA (recommandé)",
      ],
      note:
        "Pour les plans Corporate et Sovereign avec SSO/SAML activé, l'invitation est optionnelle — l'utilisateur se connecte directement avec son compte Active Directory et est créé automatiquement (just-in-time provisioning).",
    },
  },
  {
    id: 44,
    category: "Comptes",
    q: "Quels sont les différents rôles ?",
    intro:
      "Quatre rôles standards. Admin : accès complet, gestion des utilisateurs, facturation, paramètres de sécurité. Analyste : accès à toutes les données, création de rapports, configuration des alertes, sans gestion des utilisateurs. Lecteur : consultation uniquement, export CSV, pas de modification. Agence : rôle spécifique aux plans multi-clients, gère un ou plusieurs clients avec permissions granulaires. Des rôles custom sont disponibles pour les plans Sovereign.",
    detail: {
      bullets: [
        "Admin : accès complet, utilisateurs, facturation, sécurité",
        "Analyste : données, rapports, alertes — sans gestion utilisateurs",
        "Lecteur : consultation et export uniquement",
        "Agence : multi-clients, permissions granulaires par client",
      ],
      note:
        "Le principe du moindre privilège s'applique : un utilisateur ne doit avoir que les droits strictement nécessaires. Nous recommandons de démarrer avec le rôle Lecteur et d'étendre selon les besoins.",
    },
  },
  {
    id: 45,
    category: "Comptes",
    q: "Puis-je avoir plusieurs entreprises ?",
    intro:
      "Oui. Les plans Grandes Entreprises et Agences supportent la gestion multi-entreprises (filiales, marques, ou clients pour les agences). Vous pouvez créer jusqu'à 5 entreprises en Corporate, illimité en Sovereign et Agences. Chaque entreprise a son propre tableau de bord, sa propre taxonomy, ses propres alertes et ses propres utilisateurs assignés. Un utilisateur peut avoir des rôles différents selon l'entreprise (Admin sur l'entreprise A, Lecteur sur l'entreprise B).",
    detail: {
      bullets: [
        "Multi-entreprises : Grandes Entreprises (5), Sovereign (illimité), Agences (illimité)",
        "Configuration : dashboard, taxonomy, alertes, utilisateurs par entreprise",
        "Rôles par entreprise : un utilisateur peut avoir des rôles différents",
        "Facturation : consolidée ou par entreprise (selon plan)",
      ],
      note:
        "Cette fonctionnalité est essentielle pour les groupes multi-filiales et les agences multi-clients. Elle évite la multiplication des comptes et garantit une gouvernance unifiée.",
    },
  },
  {
    id: 46,
    category: "Comptes",
    q: "Comment devenir partenaire (agence) ?",
    intro:
      "Le programme partenaire Harch Atelier est ouvert aux agences RP, cabinets de conseil en communication et freelances senior qui souhaitent proposer notre plateforme à leurs clients. Le programme inclut : un compte Agence avec multi-clients, une remise partenaire (15 à 30 % selon le volume), une formation certifiante de 2 jours, un accès anticipé aux nouvelles fonctionnalités, et un co-marketing (case studies, events). La candidature se fait via le formulaire /atelier/partners/apply.",
    detail: {
      bullets: [
        "Éligibilité : agences RP, cabinets de conseil, freelances senior",
        "Avantages : remise 15-30 %, formation certifiante, accès anticipé, co-marketing",
        "Engagement : minimum 3 clients actifs sous 12 mois",
        "Candidature : formulaire /atelier/partners/apply",
      ],
      note:
        "Le programme partenaire est sélectif — nous privilégions les partenaires qui partagent notre exigence sur la qualité de l'analyse et le service client. Chaque candidature est revue sous 2 semaines.",
    },
  },
  {
    id: 47,
    category: "Comptes",
    q: "Qu'est-ce que le white-label ?",
    intro:
      "Le white-label permet aux agences partenaires de proposer la plateforme Harch Atelier sous leur propre marque. Vos clients voient le logo de votre agence, vos couleurs, votre nom de domaine (atelier.votreagence.com), et vos emails de notification. Vous facturez directement vos clients, sans mention de Harch Atelier. Le white-label est inclus dans le plan Agences et peut être configuré en self-service depuis la console partenaire.",
    detail: {
      bullets: [
        "Marque : logo, couleurs, nom de domaine personnalisé (CNAME)",
        "Emails : notifications envoyées depuis votre domaine",
        "Facturation : directe à vos clients, sans mention Harch",
        "Configuration : self-service depuis la console partenaire",
      ],
      note:
        "Le white-label est un argument commercial puissant pour les agences. Il leur permet de proposer une plateforme d'intelligence réputationnelle sans investissement R&D, sous leur marque.",
    },
  },
  {
    id: 48,
    category: "Comptes",
    q: "Comment gérer plusieurs clients (agences) ?",
    intro:
      "Le plan Agences fournit une console multi-clients dédiée. Vous créez un « workspace » par client, avec son branding white-label, sa taxonomy, ses sources, ses alertes et ses utilisateurs. Vous basculez d'un client à l'autre en un clic depuis le sélecteur en haut de la console. Un tableau de bord de pilotage agrège les KPIs de tous vos clients (volume total, alertes actives, satisfaction). Le quota d'utilisateurs et de sources est mutualisé entre clients.",
    detail: {
      bullets: [
        "Workspaces : un par client, avec branding et taxonomy dédiés",
        "Sélecteur : bascule en un clic en haut de la console",
        "Pilotage : dashboard agrégé multi-clients",
        "Quota : mutualisé entre clients (utilisateur et sources)",
      ],
      note:
        "Le plan Agences est conçu pour les agences qui gèrent entre 3 et 50 clients. Au-delà, nous proposons des contrats-cadres spécifiques avec pricing dégressif.",
    },
  },
  {
    id: 49,
    category: "Comptes",
    q: "Puis-je assigner des utilisateurs à des clients spécifiques ?",
    intro:
      "Oui. Dans le plan Agences, chaque utilisateur peut être assigné à un ou plusieurs clients avec un rôle spécifique par client. Un analyste peut être Admin sur le client A, Lecteur sur le client B, et ne pas voir le client C. Cette granularité est essentielle pour respecter la confidentialité entre clients d'une même agence. L'assignation se fait depuis la console → Équipe → Utilisateur → Clients assignés.",
    detail: {
      bullets: [
        "Assignation : un ou plusieurs clients par utilisateur",
        "Rôle par client : Admin, Analyste, Lecteur — indépendant",
        "Confidentialité : un utilisateur ne voit que ses clients assignés",
        "Configuration : console → Équipe → Utilisateur → Clients assignés",
      ],
      note:
        "Cette granularité répond aux exigences de confidentialité des agences. Un client ne doit jamais savoir qu'un analyste travaille aussi pour un concurrent — l'assignation par client garantit cette séparation.",
    },
  },
  {
    id: 50,
    category: "Comptes",
    q: "Comment fonctionne le passage d'Essentiel à Pro ?",
    intro:
      "Le passage d'Essentiel à Pro se fait à tout moment depuis la console (Paramètres → Plan → Changer de plan) ou par email à billing@harchcorp.com. La facturation est proratisée à partir de la date d'effet. Notre équipe produit migre vos configurations (sources, alertes, dashboard) sans perte de données, et programme une session de formation de 2h pour découvrir les fonctionnalités Pro (Harch Alpha, benchmark concurrentiel, GenAI Lens étendu). La migration prend 24 à 48h.",
    detail: {
      bullets: [
        "Déclenchement : console (Paramètres → Plan) ou email billing@harchcorp.com",
        "Facturation : prorata temporis à partir de la date d'effet",
        "Migration : 24-48h, sans perte de données, configurations préservées",
        "Formation : session de 2h incluse sur les fonctionnalités Pro",
      ],
      note:
        "70 % de nos clients Essentiel passent en Pro dans les 6 mois, une fois qu'ils mesurent la valeur ajoutée du benchmark concurrentiel et de Harch Alpha.",
    },
  },
  {
    id: 51,
    category: "Comptes",
    q: "Que se passe-t-il à la fin de l'essai ?",
    intro:
      "À la fin de l'essai pilote de 30 jours, vous décidez : signer un contrat annuel (Essentiel, Pro, Grandes Entreprises ou Agences) ou ne pas poursuivre. Si vous signez, vos données et configurations sont conservées sans interruption. Si vous ne poursuivez pas, vous ne payez que les 30 jours du pilote et vos données sont exportées (CSV + JSON) puis supprimées sous 30 jours, conformément à la Loi 09-08. Une attestation de suppression vous est remise.",
    detail: {
      bullets: [
        "Fin du pilote : signature contrat annuel OU arrêt sans engagement",
        "Si signature : conservation des données, sans interruption",
        "Si arrêt : paiement des 30 jours + export complet + suppression sous 30j",
        "Attestation : certificat de suppression signé remis",
      ],
      note:
        "85 % de nos clients pilotes signent un contrat annuel. Le rétro-audit 48h livré dès le premier jour permet de mesurer la valeur avant même la fin du pilote.",
    },
  },
  {
    id: 52,
    category: "Comptes",
    q: "Comment annuler mon abonnement ?",
    intro:
      "L'annulation se fait par email à billing@harchcorp.com, avec un préavis de 30 jours pour les plans Essentiel et Pro (90 jours pour Sovereign). Vous gardez l'accès à la console jusqu'à la fin de la période payée. À la fin, toutes vos données sont exportées (CSV + JSON) sur demande, puis supprimées sous 30 jours conformément à la Loi 09-08. Une attestation de suppression signée vous est remise. Aucune pénalité, aucun frais caché.",
    detail: {
      bullets: [
        "Demande : email à billing@harchcorp.com",
        "Préavis : 30 jours (Essentiel, Pro), 90 jours (Sovereign)",
        "Accès : maintenu jusqu'à la fin de la période payée",
        "Données : export complet + suppression sous 30j + attestation signée",
      ],
      note:
        "Nous ne croyons pas au lock-in. Si nous ne livrons pas la valeur attendue, vous devez pouvoir partir sans friction. C'est la meilleure garantie de qualité que nous puissions vous offrir.",
    },
  },
];
