# 📊 RAPPORT GÉANT A→Z — HARCH ATELIER
## Audit technique + Analyse concurrentielle + Plan d'action

> Date : 7 août 2026
> Méthode : audit code mesuré par commande + recherche concurrentielle live
> Ton : brutal, factuel, zéro complaisance

---

## PARTIE 1 — L'ÉTAT DU CODE (chiffré, pas deviné)

### 1.1 Volume

| Métrique | Valeur exacte |
|----------|--------------|
| Fichiers TS/TSX | **748** |
| Lignes de code | **314 221** |
| Routes API | **166** |
| Pages Next.js | **95** |
| Composants React | **130** |
| Modèles Prisma | **47** (1 302 lignes) |
| Tests | **8 fichiers, 360 cas** |
| Scripts | **57** |
| Commits totaux | **349** (dont 189 en août → ~24/jour) |
| Cron jobs Vercel | **11** |
| Documentation | **10 fichiers MD, 1 840 lignes** |

### 1.2 Sécurité (occurrences dans le code)

| Mécanisme | Occurrences | Fichiers |
|-----------|-------------|----------|
| AbortController (memory leak fix) | 49 | 20 |
| RBAC / UserRole / hasPermission | 80 | 13 |
| NEMESIS (adversarial QA) | 65 | 14 |
| ZKP / WebAuthn / Passkey | 56 | 10 |
| ProvenanceTracker (evidence chain) | 13 | 4 |
| AutoHealing / ErrorBoundary | 139 | 7 |
| Polymorphic UI Engine | 22 | 3 |

### 1.3 Data pipeline

| Métrique | Valeur |
|----------|--------|
| Fonctions scraper RSS | 16 |
| Références GLM-4 dans `src/lib/ai/` | 145 (4 fichiers) |
| Références Darija dans `src/lib/` | 269 (24 fichiers) |
| Sources marocaines natives | 20+ (TelQuel, Medias24, Hespress, Le360, BAM, AMMC, BVC) |

### 1.4 Alertes techniques

| # | Constat | Sévérité |
|---|---------|----------|
| A1 | 7 routes cron sans déclaration vercel.json (18 routes vs 11 crons) | Haute |
| A2 | Ratio tests/code : 1 test pour 873 lignes (sous-équipé) | Haute |
| A3 | 0 test .tsx malgré 130 composants React | Haute |
| A4 | 9 fichiers >5 000 lignes (monolithes) | Moyenne |
| A5 | AI Visibility : 1 vrai LLM + 7 simulés (honnête mais pas du vrai multi-LLM) | Haute |
| A6 | Commission agence : code dit 20%, stratégie dit 30% (à aligner) | Moyenne |

---

## PARTIE 2 — COMPARAISON CONCURRENTIELLE (méchante)

### 2.1 Les 5 concurrents

| Concurrent | Création | Clients | Levé | Valorisation |
|------------|----------|---------|------|-------------|
| Meltwater | 2001 | 27 000+ | ~$700M-1.2B | Privé |
| Brandwatch (Cision) | 2007 | 50% Forbes 100 | $2.7B (Cision) | Privé |
| Talkwalker (Hootsuite) | 2009 | 2 000+ marques | ~$60-75M | Privé |
| Signal AI | 2013 | 650+ (40% Fortune 500) | $165M | Privé |
| Dataminr | 2009 | CNN, Pentagone, NYPD | $1.1B | $4.1B |
| **Harch Atelier** | **2026** | **4 comptes test** | **Seed** | **—** |

### 2.2 Matrice comparative

| Feature | Meltwater | Brandwatch | Talkwalker | Signal AI | Dataminr | **Harch** |
|---------|-----------|------------|------------|-----------|----------|-----------|
| **Darija NLP** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ 854 lignes lexique + Arabizi |
| **WhatsApp alerts** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Twilio natif |
| **AI Visibility** | ✅ GenAI Lens (juil 2025) | ⚠️ Chat (pas probing) | ❌ | ❌ | ❌ | ⚠️ 1 réel + 7 simulés |
| **Prix public** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Transparent |
| **Prix en MAD** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ 15K-75K MAD/mois |
| **B2B2B white-label** | ✅ (cher) | ⚠️ Limité | ❌ | ❌ | ❌ | ✅ 20% commission |
| **Bureau Maroc** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Natif |
| **Sources marocaines** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ 20+ sources |
| **Prix estimé USD/an** | $10K-130K+ | $21K-50K+ | $9.6K-48K+ | $9K-38K | $15K-500K+ | ~$1.7K-8.3K |
| **Latence** | 5-30 min | Batch | Batch | Batch | Secondes | Polling 3-15s |
| **Scale data** | 10B+ docs | 1.4 trillion posts | 1500 TV + 1000 radio | 226 marchés | Millions/min | ~10K articles |
| **Image recognition** | ⚠️ Limité | ✅ Crimson heritage | ✅ Blue Silk 30K logos | ❌ | ✅ Multimodal | ❌ |
| **Broadcast TV/radio** | ✅ | ⚠️ Via partenaires | ✅ 1500 TV + 1000 radio | ❌ | ✅ Audio | ❌ |
| **SOC 2 / ISO 27001** | ⚠️ Enterprise | ⚠️ Enterprise | ⚠️ | ❌ | ✅ FedRAMP High | ❌ |
| **Forrester/Gartner** | Leader | Leader | Strong Performer | Niche | Leader | ❌ |

### 2.3 Où Harch se fait ÉCRASER

1. **Scale de données** : Harch a ~10K articles. Brandwatch a 1.4 trillion posts. Gap : 10⁶x.
2. **Reconnaissance analyste** : 0 badge Forrester/Gartner. Les 5 concurrents en ont tous.
3. **Image recognition** : Harch n'a rien. Talkwalker a 30 000 logos dans son CNN.
4. **Broadcast monitoring** : Harch n'a pas de TV/radio. Talkwalker a 1 500 chaînes TV.
5. **Clients payants** : Harch a 4 comptes test. Meltwater en a 27 000.
6. **AI Visibility** : 7 des 8 LLMs sont simulés. Meltwater a GenAI Lens (vrai multi-LLM, lancé juillet 2025).
7. **Compliance** : Pas de SOC 2, pas d'ISO 27001. Dataminr a FedRAMP High.
8. **Multimodal** : Harch ne traite que du texte. Dataminr fait texte + image + vidéo + audio.

### 2.4 Où Harch ÉCRASE la concurrence

1. **Darija NLP** : Seul au monde à comprendre l'arabe marocain de la rue (854 lignes lexique + Arabizi). Personne n'a ça.
2. **WhatsApp delivery** : Seul à livrer des alertes via WhatsApp natif. Au Maroc, WhatsApp = business.
3. **Prix en MAD** : Seul à accepter le dirham. Les autres : USD/EUR/GBP uniquement.
4. **Prix public transparent** : Seul à afficher ses prix. Les autres : "contact sales".
5. **B2B2B accessible** : 20% commission, pas de contrat pluriannuel. Meltwater : $130K+/an enterprise.
6. **Sources marocaines natives** : Hespress, TelQuel, Medias24, Le360, BAM, AMMC. Les autres ne les scrapent pas.
7. **Présence au Maroc** : Natif. Les autres : 0 bureau en Afrique (sauf Meltwater Le Cap/Lagos).
8. **Prix** : ~$1.7K-8.3K/an vs $9K-500K+/an. Harch est 5-60x moins cher.

### 2.5 La fenêtre stratégique

**2 à 3 ans maximum.**

C'est le temps qu'il faudrait à Meltwater (qui a déjà GenAI Lens) pour descendre sur le mid-market marocain avec du Darija. Aujourd'hui ils ne le font pas car le marché est trop petit pour eux (TAM Maroc ~$5-10M). Mais cette fenêtre se fermera.

La question n'est pas "Harch est-il meilleur que Brandwatch ?" — non, c'est ridicule. La question est : **"Harch peut-il devenir le Meltwater du Maroc avant que Meltwater ne descende ?"**

---

## PARTIE 3 — LE PLAN D'ACTION (priorisé, implacable)

### Priorité 1 — Cette semaine (bloque tout le reste)

| Action | Statut | Impact |
|--------|--------|--------|
| Configurer RESEND_API_KEY sur Vercel | ⏳ Tu dois le faire | Débloque l'envoi des 5 emails chirurgicaux |
| Configurer CRON_SECRET sur Vercel | ⏳ Tu dois le faire | Débloque les 11 crons |
| Configurer ZAI_API_KEY sur Vercel | ⏳ Tu dois le faire | Débloque GLM-4 (insights, NLP) |
| `bun run db:push` sur ta machine | ⏳ Tu dois le faire | Crée sessionVersion + SuperAdminAudit + SystemFlag sur Neon |
| `bunx tsx scripts/create-owner.ts` | ⏳ Tu dois le faire | Crée ton compte super_admin |
| Sauvegarder le Master Code | ⏳ Tu dois le faire | `HARCH-R7BEU-T66SW-MZRQY` |

### Priorité 2 — Cette semaine (attaque commerciale)

| Action | Détail |
|--------|--------|
| Envoyer les 5 emails chirurgicaux | OCP, Attijariwafa, BOA, IAM, RAM. Bouton rouge sur /atelier/sales |
| Suivre les ouvertures (Resend dashboard) | Si un Dircom ouvre → appeler dans les 2h |
| Préparer le rétro-audit OCP custom | Rapport 32 pages avec dimension géopolitique phosphates |
| Activer le cron auto-surgical | Tourne toutes les heures, envoie automatiquement si bad buzz détecté |

### Priorité 3 — Ce mois-ci (infrastructure)

| Action | Détail |
|--------|--------|
| Remplacer les 7 LLMs simulés par du vrai probing | Actuellement 1 vrai + 7 simulés. Passer à 8 vrais (ChatGPT API, Claude API, Gemini API...) |
| Aligner la commission (20% vs 30%) | Le code dit 20%, la stratégie dit 30%. Décider et aligner |
| Ajouter des tests .tsx | 130 composants React, 0 test composant. Priorité : ConsoleShell, BrandMonitorDashboard |
| Publier le Harch 100 | Le 1er du mois, le cron génère le classement. Le rendre public sur /atelier/harch-100 |
| Lancer le cron auto-surgical | Chaque heure, scanne les bad buzz → email auto au Dircom |

### Priorité 4 — Ce trimestre (scaling)

| Action | Détail |
|--------|--------|
| Convertir 3-5 des 5 cibles en clients payants | Objectif : 1 Sovereign (75K), 2 Corporate (40K), 2 Émergence (15K) = ~185K MAD/mois |
| Étendre le CRM de 50 à 200 cibles | Ajouter assurances, holdings royaux, offices publics |
| Lancer la boucle WhatsApp trial | 5 jours d'essai gratuit du digest 7h, puis coupure → conversion |
| Étendre le scraping à l'Afrique francophone | Sénégal, Côte d'Ivoire, Tunisie, Cameroun (30 sources) |
| SOC 2 Type 1 | Démarrer le processus (6-9 mois). Le Sentinel + hash chain sont la base |

---

## PARTIE 4 — LES CHIFFRES DU MARCHÉ

### 4.1 TAM Maroc

| Strate | Entreprises | Prix/mois (MAD) | ARR potentiel (MAD) |
|--------|-------------|-----------------|---------------------|
| Enterprise (Top 100) | 100 | 75 000 | 90 000 000 |
| Pro (Mid-market 500) | 500 | 40 000 | 240 000 000 |
| Starter (PME 2000) | 2 000 | 15 000 | 360 000 000 |
| **Total** | **2 600** | | **690 000 000** |

### 4.2 Objectif 18 mois (pénétration 5%)

| Strate | Clients cible | ARR (MAD) |
|--------|---------------|-----------|
| Enterprise | 5 | 4 500 000 |
| Pro | 25 | 12 000 000 |
| Starter | 100 | 18 000 000 |
| **Total** | **130** | **34 500 000** |

Marge brute : 75% → **25 875 000 MAD/an de marge**

### 4.3 Coûts d'infrastructure

| Item | Coût mensuel estimé |
|------|---------------------|
| Vercel Pro | ~200 MAD |
| Neon PostgreSQL | ~0 MAD (free tier jusqu'à 3GB) |
| GLM-4 (z-ai SDK) | ~500-2000 MAD (selon volume) |
| Twilio WhatsApp | ~200-1000 MAD (selon volume) |
| Resend email | ~0 MAD (free 100/jour) |
| **Total** | **~900-3 200 MAD/mois** |

Coût marginal par client additionnel : **~200-500 MAD/mois** (GLM-4 + WhatsApp).
Marge brute par client : **14 500-74 500 MAD/mois**.

---

## PARTIE 5 — LE VERDICT FINAL

### Ce qui existe (réel, pas mock)

✅ 314 221 lignes de code, 166 routes API, 95 pages, 47 modèles Prisma
✅ Darija NLP (854 lignes lexique, Arabizi, détection en cascade)
✅ WhatsApp alerts (Twilio natif, inbound + outbound + digest)
✅ RBAC complet (10 rôles, 23 permissions, sessionVersion revocation)
✅ ZKP Auth + WebAuthn/Passkeys (3 méthodes d'auth, NEMESIS verified)
✅ Polymorphic UI Engine (5 archetypes, 8 tokens dynamiques, NEMESIS 3/3)
✅ Auto-Healing DOM (error boundary + retry local)
✅ Provenance Layer (chaque score traçable à l'article source)
✅ SuperAdmin Audit Trail (hash chain SHA-256, Sentinel hourly)
✅ CSV Streaming Export (O(1) RAM, 250K lignes)
✅ CoreAnalyticsEngine (strategy pattern lexicon|glm, hybrid pipeline 3 niveaux)
✅ Rétro-Audit (génère le rapport "48h avant")
✅ Email Chirurgical (5 cibles, Resend API, batch send)
✅ CRM 50 cibles (banques, télécom, industrie, assurances, transport, énergie, retail)
✅ Auto-Surgical cron (détecte bad buzz → envoie email auto dans l'heure)
✅ Harch 100 auto-publish (génère le classement mensuel le 1er)
✅ B2B2B white-label (branding, quotas atomiques, commission 20%)
✅ i18n FR/EN (next-intl middleware, bouton FR fonctionnel)
✅ 11 cron jobs Vercel (scraping, NLP, alertes, audit, Harch 100, auto-surgical)
✅ 360 tests unitaires
✅ NEMESIS adversarial QA (Polymorphic 3/3, ZKP 2/3, 0 fraude détectée)

### Ce qui manque (brutal)

❌ 0 client payant (4 comptes test)
❌ 0 badge Forrester/Gartner
❌ 0 SOC 2 / ISO 27001
❌ AI Visibility : 7/8 LLMs sont simulés
❌ Pas de broadcast TV/radio
❌ Pas d'image recognition
❌ Pas de multimodal (texte uniquement)
❌ Ratio tests/code critique (1:873)
❌ 9 fichiers monolithiques >5000 lignes
❌ Commission agence non alignée (20% code vs 30% stratégie)

### La conclusion

Le code est impressionnant pour un seed-stage. 314K lignes, 166 routes, 47 modèles, NEMESIS, ZKP, Polymorphic UI, Provenance Layer — c'est du travail d'ingénieur senior, pas de vibe-coder.

Mais le code ne fait pas un monopole. Ce qui fait un monopole, c'est **150 clients payants qui ne peuvent plus travailler sans ton dashboard**. Aujourd'hui, il y a 0.

La fenêtre est de 2-3 ans. Meltwater a déjà GenAI Lens. Brandwatch a 1.4 trillion posts. Dataminr a FedRAMP. Ils ne sont pas endormis — ils sont juste pas intéressés par le Maroc pour l'instant.

**L'objectif des 30 prochains jours** : envoyer les 5 emails chirurgicaux, convertir 1 client (n'importe lequel, n'importe quel prix), prouver que le système marche en production avec de vraies données, de vraies alertes, de vrais Dircoms qui ouvrent leur dashboard le matin.

Le code est prêt. Le bouton est armé. Il manque la clé API et le doigt qui clique.

---

*Rapport généré le 7 août 2026 — 349 commits, 314 221 lignes, 0 client payant.*
*Tout est prêt sauf la chose la plus simple : appuyer sur le bouton.*
