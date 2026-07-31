# ANNEXE 02 — SLA INSTITUTIONNEL (SERVICE LEVEL AGREEMENT)

## HARCH ATELIER — ENGAGEMENTS DE SERVICE

---

**Référence :** Annexe 02 au Contrat HARCH-SaaS-[CLIENT]-[YYYY]-[NNN]
**Version :** 1.0
**Date d'effet :** [DATE_EFFET]

---

## 1. OBJET

La présente Annexe définit les engagements de niveau de service (Service Level Agreement, « SLA ») souscrits par Harch Corp envers le Client au titre de la mise à disposition de la Plateforme Harch Atelier. Elle constitue une annexe intégrée au Contrat de Licence SaaS Institutionnel et entre en vigueur conjointement avec celui-ci.

En cas de contradiction entre les stipulations du Contrat principal et la présente Annexe, la présente Annexe prévaudra pour les questions de service, de disponibilité et de support.

---

## 2. DÉFINITIONS

Aux fins du présent SLA, les termes suivants ont la signification indiquée :

**2.1. « Disponibilité »** : rapport exprimé en pourcentage, calculé sur un mois calendaire, entre (a) le nombre total de minutes de ce mois, diminué des minutes d'Indisponibilité exclues conformément à l'Article 8 ci-après, et (b) le nombre total de minutes de ce mois.

**2.2. « Indisponibilité »** : période continue pendant laquelle la Plateforme n'est pas accessible ou ne fonctionne pas conformément à ses spécifications, à l'exclusion des périodes exclues prévues à l'Article 8.

**2.3. « Temps d'arrêt »** : durée totale d'une Indisponibilité donnée, mesurée à partir de l'ouverture du ticket par le Client ou la détection automatique par Harch Corp, jusqu'à la restauration du service opérationnel.

**2.4. « Incident »** : tout événement affectant la disponibilité, les performances ou la sécurité de la Plateforme, qualifié selon la grille de sévérité de l'Article 5.

**2.5. « Maintenance planifiée »** : opération de maintenance programmée, notifiée préalablement au Client dans les conditions de l'Article 4.

**2.6. « Maintenance corrective »** : opération de maintenance non programmée, rendue nécessaire par un Incident ou un risque imminent.

**2.7. « Heures ouvrées »** : du lundi au vendredi, de 09h00 à 19h00, heure de Casablanca (UTC+1), hors jours fériés légaux marocains.

**2.8. « Crédit de service »** : avoir financier calculé selon la grille de l'Article 7, imputable sur la prochaine facture de licence.

---

## 3. ENGAGEMENT DE DISPONIBILITÉ

**3.1. Taux cible.** Harch Corp s'engage à maintenir un taux de Disponibilité mensuel de la Plateforme d'au moins quatre-vingt-dix-neuf virgule cinq pour cent (99,5 %).

**3.2. Méthode de mesure.** La Disponibilité est mesurée en continu par un système de supervision indépendant (uptime monitoring) déployé sur au moins trois (3) points de présence géographiquement distincts. Les requêtes de contrôle portent sur les endpoints publics de la Plateforme (`https://atelier.harchcorp.com/api/health` et endpoints authentifiés représentatifs).

**3.3. Exclusions.** Ne sont pas comptabilisées dans le calcul de l'Indisponibilité :
- (a) les Maintenance planifiées notifiées conformément à l'Article 4 ;
- (b) les Indisponisations résultant des cas d'exclusion prévus à l'Article 8 ;
- (c) les Indisponisations de moins de cinq (5) minutes consécutives ;
- (d) les périodes pendant lesquelles le Client n'a pas fourni les informations raisonnablement demandées par Harch Corp pour diagnostiquer l'Incident.

**3.4. Rapport mensuel.** Harch Corp communique au Client, au plus tard le dix (10) du mois suivant, un rapport de Disponibilité indiquant : le taux observé, la liste des Incidents survenus, leur sévérité, leur durée, et les éventuels Crédits de service applicables.

---

## 4. MAINTENANCE

**4.1. Maintenance planifiée.** Harch Corp programme une fenêtre de maintenance mensuelle :
- **Périodicité** : premier (1er) dimanche de chaque mois ;
- **Horaire** : 02h00 à 06h00, heure de Casablanca ;
- **Notification** : sept (7) jours calendaires avant la date, par courriel au contact technique désigné par le Client, et par affichage sur la page de status (`https://status.harchcorp.com`).

**4.2. Maintenance corrective.** Harch Corp peut procéder à des opérations de Maintenance corrective à tout moment, lorsque la sécurité, la stabilité ou la continuité du service l'exige. Le Client est informé par notification best-effort (courriel, page de status, bannière in-app), avec un délai de préavis raisonnable compte tenu de l'urgence.

**4.3. Compensation.** Les Maintenance planifiées dépassant la fenêtre de quatre (4) heures, ou entraînant une Indisponibilité non annoncée, sont comptabilisées dans le calcul de la Disponibilité.

---

## 5. GESTION DES INCIDENTS

**5.1. Niveaux de sévérité.** Les Incidents sont qualifiés selon la grille suivante :

| Sévérité | Définition | Exemples |
|---|---|---|
| **Critique (P1)** | Indisponibilité totale ou compromise de sécurité majeure affectant la production | Plateforme inaccessible ; fuite de Données Client ; impossibilité de générer les rapports d'analyse |
| **Majeur (P2)** | Dégradation substantielle d'une fonctionnalité clé, sans contournement acceptable | Console inaccessible pour > 50 % des Utilisateurs ; alertes WhatsApp non délivrées ; export PDF en échec |
| **Mineur (P3)** | Anomalie n'empêchant pas l'usage normal, ou affectant une fonctionnalité secondaire | Bug d'affichage ; lenteur ponctuelle ; métadonnées incorrectes |

**5.2. Procédure de qualification.** Le niveau de sévérité est déterminé par Harch Corp au moment de la prise en charge, en lien avec le Client. En cas de désaccord, une ré-évaluation est effectuée dans les deux (2) heures ouvrées suivantes.

**5.3. Engagements de réponse et de résolution.**

| Sévérité | Temps de réponse | Temps de résolution cible | Couverture |
|---|---|---|---|
| **P1 — Critique** | 15 minutes | 4 heures | 24/7 pour Sovereign ; heures ouvrées + astreinte pour Executive |
| **P2 — Majeur** | 1 heure ouvrée | 8 heures ouvrées | Heures ouvrées |
| **P3 — Mineur** | 4 heures ouvrées | 24 heures ouvrées (ou correction dans prochaine release) | Heures ouvrées |

**5.4. Communication.** Pendant la durée d'un Incident P1 ou P2, Harch Corp communique au Client, au minimum toutes les deux (2) heures, l'état d'avancement et l'estimation de résolution.

**5.5. Post-mortem.** Pour tout Incident P1, Harch Corp remet au Client, dans un délai de dix (10) jours ouvrés après résolution, un rapport post-mortem décrivant : la cause racine, l'impact, les mesures correctives, et les mesures préventives mises en œuvre.

---

## 6. SUPPORT

**6.1. Niveaux de support.** Le support est organisé en trois niveaux :

- **L1 — Support de premier niveau** : accessible par courriel à `support@harchcorp.com` ou via le portail ticketing de la Plateforme. Réponse sous quatre (4) heures ouvrées. Le L1 traite les questions d'utilisation, les demandes d'assistance courantes, et qualifie les Incidents pour orientation L2/L3.
- **L2 — Ingénieur dédié** : pour le niveau Sovereign, un ingénieur référent est assigné au Client. Joignable par téléphone et courriel aux Heures ouvrées. Réponse sous une (1) heure ouvrée. Le L2 traite les incidents techniques, paramétrages avancés, et escalade au L3 le cas échéant.
- **L3 — Équipe produit et astreinte** : composée des ingénieurs produit et du CTO. Intervention 24/7 pour les Incidents P1 (niveau Sovereign uniquement). Pour le niveau Executive, intervention aux heures ouvrées avec astreinte pour les P1.

**6.2. Canaux.**
- Portail de ticketing : `https://atelier.harchcorp.com/support`
- Courriel : `support@harchcorp.com`
- Téléphone L2 (Sovereign uniquement) : [TELEPHONE_DEDIE]
- Canal Slack Connect partagé (Sovereign uniquement)

**6.3. Contacts techniques.** Le Client désigne, à la signature, un Responsable Technique interne et un Responsable Sécurité. Toute modification de ces contacts est notifiée à Harch Corp par courriel signé.

---

## 7. CRÉDITS DE SERVICE

**7.1. Principe.** En cas de non-respect de l'engagement de Disponibilité mensuel, le Client bénéficie d'un Crédit de service calculé sur la licence mensuelle équivalente (soit la licence annuelle divisée par douze), selon la grille suivante :

| Disponibilité mensuelle observée | Crédit de service |
|---|---|
| Supérieure ou égale à 99,5 % | Aucun |
| Entre 99,0 % et 99,49 % | 10 % de la licence mensuelle |
| Entre 98,0 % et 98,99 % | 25 % de la licence mensuelle |
| Entre 95,0 % et 97,99 % | 50 % de la licence mensuelle |
| Inférieure à 95,0 % | 100 % de la licence mensuelle + droit de résiliation sans pénalité |

**7.2. Conditions.**
- (a) Le Client doit avoir déclaré l'Incident selon la procédure de l'Article 5 dans un délai raisonnable ;
- (b) Le Crédit de service est imputé sur la facture suivante et ne donne lieu à aucun remboursement en numéraire ;
- (c) Le total des Crédits de service au cours d'un mois ne peut excéder cent pour cent (100 %) de la licence mensuelle ;
- (d) Les Crédits de service constituent le seul et unique remède du Client au titre de la non-atteinte de l'engagement de Disponibilité.

**7.3. Résiliation pour non-respect répété.** Si la Disponibilité mensuelle est inférieure à 95,0 % pendant trois (3) mois consécutifs, le Client peut résilier le Contrat sans pénalité, par notification écrite, moyennant un préavis de trente (30) jours. Les sommes payées d'avance pour la période post-résiliation sont remboursées au prorata temporis.

---

## 8. EXCLUSIONS

Les exclusions suivantes ne sont pas prises en compte dans le calcul de la Disponibilité :

**8.1. Force majeure.** Tout événement échappant au contrôle raisonnable de Harch Corp, au sens de l'Article 269 du DOC marocain : catastrophe naturelle, incendie, inondation, conflit armé, émeute, acte terroriste, pandémie, décision gouvernementale, défaillance d'un opérateur de télécommunications hors de son contrôle.

**8.2. Problèmes réseau côté Client.** Défaillances du réseau Internet entre le poste du Client et la Plateforme, dès lors qu'elles sont externes à l'infrastructure de Harch Corp et de ses sous-traitants d'hébergement.

**8.3. Maintenance planifiée.** Conformément à l'Article 4.1.

**8.4. Sources de données tierces.** Indisponibilité, retard ou erreur des sources publiques tierces (RSS de presse, Yahoo Finance, listes de sanctions OFAC/UE/ONU, GDELT), dès lors que ces sources sont externalisées et que Harch Corp a mis en œuvre des mécanismes de bascule raisonnables.

**8.5. Faute du Client.** Toute Indisponibilité résultant d'une configuration erronée, d'un usage non conforme, d'une négligence ou d'une faute du Client ou de ses Utilisateurs.

**8.6. Dépendances Client.** Défaillances des systèmes d'information du Client (notamment Active Directory, SSO, intégrations Slack/Teams/WhatsApp) empêchant l'accès à la Plateforme.

**8.7. Évolutions demandées.** Périodes pendant lesquelles la Plateforme est temporairement indisponible pour mise en œuvre d'évolutions expressément demandées par le Client.

---

## 9. MONITORING ET TRANSPARENCE

**9.1. Page de status.** Harch Corp met à disposition une page de status publique accessible à l'adresse `https://status.harchcorp.com`, qui affiche en temps réel :
- (a) l'état des composants de la Plateforme (Application, API, Consoles, intégrations) ;
- (b) les Incidents en cours et passés (90 derniers jours) ;
- (c) le planning de Maintenance planifiée.

**9.2. Rapport mensuel.** Conformément à l'Article 3.4, un rapport mensuel de Disponibilité est transmis au Client, comprenant :
- (a) le taux de Disponibilité global et par Console ;
- (b) la liste détaillée des Incidents du mois (date, sévérité, durée, cause) ;
- (c) les Crédits de service éventuellement dus ;
- (d) les évolutions majeures de la Plateforme déployées dans le mois.

**9.3. Supervision technique.** Harch Corp supervise en continu les paramètres techniques critiques : temps de réponse API, taux d'erreur, saturation base de données, latence sous-traitants. Un dashboard de supervision est accessible au Client sur demande, pour les niveaux Sovereign.

**9.4. Comité de suivi.** Pour le niveau Sovereign, un comité de suivi trimestriel est organisé entre le Responsable Technique du Client et l'Account Manager de Harch Corp, afin de passer en revue les métriques, les évolutions, et les besoins émergents.

---

## 10. ESCALADE

**10.1. Niveaux d'escalade.** En cas de Incident mal traité ou de désaccord, le Client peut escalader selon la procédure suivante :

- **Niveau 1 — Support L1/L2** : ticket ou courriel à `support@harchcorp.com` ;
- **Niveau 2 — Account Manager** : courriel à `account-manager@harchcorp.com` ou téléphone direct ; réengagement sous 24 heures ouvrées ;
- **Niveau 3 — CTO** : Monsieur Amine HARCH EL KORANE, CTO et fondateur, joignable à `cto@harchcorp.com` ; réengagement sous 48 heures ouvrées ;
- **Niveau 4 — PDG / Direction commerciale** : pour les litiges commerciaux ou contractuels non résolus.

**10.2. Conditions d'escalade.** L'escalade au Niveau 3 n'est recevable qu'après sollicitation préalable et infructueuse du Niveau 2, avec un délai raisonnable de réponse (au moins 48 heures ouvrées).

**10.3. Médiation.** Conformément à l'Article 17.2 du Contrat principal, en cas de désaccord persistant sur l'application du SLA, les Parties recourent à la médiation du CMAC avant toute action contentieuse.

---

## 11. DISPOSITIONS DIVERSES

**11.1. Évolution du SLA.** Harch Corp peut faire évoluer le présent SLA pour refléter les améliorations du Service. Toute évolution défavorable au Client doit faire l'objet d'un avenant écrit et d'un préavis de soixante (60) jours.

**11.2. Non-cumul.** Les Crédits de service ne se cumulent pas avec d'autres remises ou remboursements éventuellement dus au titre du Contrat.

**11.3. Survie.** Les obligations du présent SLA survivent à la fin du Contrat pour la période nécessaire au traitement des Incidents ouverts à cette date.

---

*Fin de l'Annexe 02 — SLA Institutionnel.*
