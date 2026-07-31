# Synthèse Concurrentielle — Harch Atelier vs les 6 leaders
## Analyse neutre, impartiale, sans défense

> 26 012 mots d'analyse. 6 concurrents. 1 verdict : Harch Atelier est nul sur la scale, mais a une fenêtre de 2-3 ans sur une niche que personne ne veut prendre.

---

## Tableau de bord comparatif

| Critère | Brandwatch | Meltwater | Talkwalker | PeakMetrics | Signal AI | Dataminr | Harch Atelier |
|---------|-----------|-----------|------------|-------------|-----------|----------|---------------|
| Création | 2007 | 2001 | 2009 | ~2019 | 2013 | 2009 | 2026 |
| Scale data | 1.4T posts | 20+ ans archives | Broadcast TV 1500 chaînes | Niche narratif | 226 marchés | Millions/min | Seed, ~10K alerts |
| Langues | Multi | Multi | 187 langues | EN-first | 75 langues | EN-first | EN/FR/AR/Darija |
| Darija/Arabe dialectal | Non | Non | Non | Non | Non | Non | **Revendiqué** |
| Maroc/Afrique | Non documenté | Non | Non | Non | Non | Non | **Cible native** |
| AI Visibility (8 LLMs) | Flou | Non | Retard | Non | Non | Non | **Revendiqué** |
| WhatsApp alerts | Non | Non | Non | Non | Non | Non | **Oui (Twilio)** |
| Real-time | Polling | Batch | Batch | Polling | Batch | **Seconds** | Polling 3-15s |
| Pricing public | Non | Non | Non | Non | Non | Non | **Oui (MAD)** |
| Pricing estimé | $$$/enterprise | $$$/enterprise | 10K+ USD/an | $$ mid | $$$ enterprise | 50K-1M USD/an | 5K-50K MAD |
| Reconnaissance analyste | Forrester 2024 | Forrester 2020+2023 | Forrester/Gartner | Niche | Niche | Leader real-time | Aucune |
| Clients | Fortune 500 | 27 000 clients | Fortune 500 | Think tanks | Fortune 5000 | CNN/Pentagon | 4 test accounts |

---

## Verdict global (neutre, brutal)

### Ce que Harch fait mal (et tout le monde fait mieux)

1. **Scale de données** — Brandwatch a 1.4 trillion de posts archivés. Dataminr ingère des millions de signaux/min. Harch a ~10K alerts en DB. **Gap : 10^6x.**

2. **Reconnaissance analyste** — Brandwatch, Meltwater, Talkwalker sont dans le Forrester Wave. Dataminr est le leader Gartner real-time. Harch n'est nulle part. **Aucun buyer enterprise n'achètera Harch sans badge analyste.**

3. **Couverture source** — Meltwater couvre print/online/broadcast/podcast. Talkwalker a 1500 chaînes TV/radio. Dataminr a multimodal (text+image+video). Harch a des alerts RSS simulées. **Gap structurel.**

4. **Maturité AI** — Talkwalker a Blue Silk AI depuis 2017. Signal AI a AIQ. Dataminr a LLM RAG avec citations. Harch a du GLM-4 branché mais pas de produit AI distinctif. **Le "HarchIQ engine" est un nom, pas un moat.**

5. **Distribution commerciale** — Tous ont des sales teams, partnerships, channel. Harch a 4 comptes test. **Gap : 10^4x.**

### Ce que Harch pourrait faire (mais ne fait pas encore vraiment)

1. **Darija/Arabe dialectal** — AUCUN concurrent ne le fait. Harch le revendique mais le worklog ne montre pas de pipeline NLP darija mature dans `src/lib/analyzers/`. **C'est une niche réelle, mais l'exécution n'est pas prouvée.**

2. **AI Visibility (8 LLMs)** — AUCUN concurrent ne sonde ChatGPT/Claude/Gemini/Perplexity pour mesurer la visibilité de la marque. Harch le revendique via `/api/console/ai-visibility`. **C'est différenciant SI c'est vrai.**

3. **Maroc/Afrique native** — Tous les concurrents sont US/EU. Aucun n'a de partenariat local (MAP, BVC, AMMC). Harch le revendique. **Avantage géographique réel mais à matérialiser.**

4. **WhatsApp alerts** — Aucun concurrent n'a d'alertes WhatsApp natives. Harch l'a via Twilio. **Adapté au marché marocain où WhatsApp est dominant.**

5. **Pricing transparent en MAD** — Tous les concurrents sont "sur devis" en USD. Harch peut afficher 5K/15K/50K MAD/mois. **Réduit la friction pour le mid-market marocain.**

### La fenêtre stratégique

**2-3 ans.** C'est le temps qu'il faudrait à un Brandwatch ou Meltwater pour descendre sur le mid-market marocain avec du darija. Aujourd'hui, ils ne le font pas car :
- Le marché est trop petit pour eux (CA Maroc enterprise ~5-10M USD total adressable)
- Le coût de développer darija/arabe dialectal est élevé pour le ROI
- Leur sales motion est enterprise USD, pas mid-market MAD

**Mais cette fenêtre se fermera.** Soit un acteur global descend, soit un acteur local émerge (peut-être Harch, peut-être un autre).

---

## Ce que Harch doit copier de chaque concurrent

### De Brandwatch
1. **Vizia command center** — mode présentation plein écran pour les salles de réunion
2. **Crimson Hexagon ML heritage** — vrais modèles ML propriétaires, pas juste des appels API
3. **Search Intelligence GenAI** — assistant IA pour interroger les données en langage naturel

### De Meltwater
1. **Klear influencer database** — base d'influenceurs avec scores réels
2. **Broadcast monitoring** — TV/radio marocaine (2M, Al Aoula, etc.)
3. **Khoros integration** — répondre directement depuis le dashboard

### De Talkwalker
1. **Image recognition mature** — détection logo dans images/vidéos
2. **Blue Silk AI natif** — AI intégré au workflow, pas en sidebar
3. **Templates dashboards** — démarrage rapide avec layouts pré-configurés

### De PeakMetrics
1. **Narrative as first-class entity** — les narratifs (pas juste les mentions) comme objet principal
2. **Actor identification** — qui propage la narrative (bots, comptes coordonnés)
3. **Network analysis** — graphes de propagation

### De Signal AI
1. **AIQ engine** — blend génératif + discriminatif (pas juste LLM calls)
2. **External Intelligence Graph** — graphe d'entités global
3. **Regulatory intelligence** — surveillance filings réglementaires (AMMC au Maroc)

### De Dataminr
1. **Multimodal AI** — texte + image + vidéo + audio
2. **LLM briefings avec citations** — résumés générés citant les sources
3. **Compliance governmentale** — SOC 2, ISO 27001 (moat futur pour enterprise)

---

## Les 3 erreurs à éviter (que tous les concurrents ont faites)

1. **Pricing sur devis opaque** — tous le font. Harch DOIT garder du pricing public pour se différencier.

2. **Acquisition fragmentation** — Meltwater a 4 produits cousus ensemble, Talkwalker a 15 ans de dette. Harch doit rester un produit cohérent.

3. **Mobile app médiocre** — Talkwalker a 3.2/5 sur mobile. Harch doit soit faire un excellent mobile, soit ne pas en faire.

---

## Conclusion neutre

Harch Atelier est **nul en scale, nul en reconnaissance, nul en AI mature** comparé à ces 6 acteurs. C'est un fait.

Mais aucun des 6 ne sert le Maroc/Afrique francophone en darija avec du pricing transparent en MAD et du WhatsApp natif. C'est un fait aussi.

**La question n'est pas "Harch est-il meilleur que Brandwatch ?"** — non, évidemment.

**La question est : "Harch peut-il devenir le Brandwatch du Maroc d'ici 2-3 ans avant que Brandwatch ne descende ?"** — peut-être, si l'exécution sur la darija et l'AI Visibility est réelle, pas cosmétique.

Les rapports détaillés sont dans `/home/z/my-project/competitive-reports/` :
- `01-brandwatch.md` (4 358 mots)
- `02-meltwater.md` (3 830 mots)
- `03-talkwalker.md` (5 035 mots)
- `04-peakmetrics.md` (4 015 mots)
- `05-signal-ai.md` (4 848 mots)
- `06-dataminr.md` (3 926 mots)

**Total : 26 012 mots d'analyse neutre.**
