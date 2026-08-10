# BRAINSTORM: ESSENTIEL + PRO DASHBOARDS

> Agent BRAIN-1 — Senior Product Designer
> Context: HarchIQ = Moroccan/African reputation intelligence platform. Plans: Essentiel (1–3 users, small comms team), Pro (5–20 users, growing team with multiple roles), Enterprise/Agency (above).
> Spy reports not yet available — using own knowledge of Meltwater/Brandwatch/Talkwalker competitive landscape + HarchIQ positioning (Darija sentiment, Harch 100, crisis detector, AI visibility, GLM-4 insight engine).

---

## DESIGN PHILOSOPHY

**Essentiel** = "Tell me what matters, fast." A dircom alone or with 1–2 colleagues. No time. Needs signal, not noise. Dashboard = single screen, scannable in 60 seconds, answers "is today normal?"

**Pro** = "Help me prove value to my boss and outmaneuver competitors." A team with roles (dircom, PR managers, analyst, social media manager). Needs benchmarks, reports, multi-user collaboration, customizable views. Dashboard = mission control + report factory.

**Upgrade trigger** (Essentiel → Pro): When the user thinks "I wish I could see how my competitor is doing" or "I wish I could send my boss a clean report" or "I wish my team could each have their own view."

---

## ESSENTIEL (20 sections)

### 1. Score de Réputation (jauge principale)
- **What**: Large circular gauge 0–100 showing today's reputation score. Big number in center. Below: arrow + delta vs yesterday ("+3 vs hier"). Color logic: green >70, amber 50–70, red <50. Subtle pulse animation when score drops >5 pts in 24h.
- **Why**: The ONE metric they care about. First thing they see. Answers "is my brand healthy today?" in 2 seconds. Becomes the metric they check every morning like the weather.
- **Chart**: Circular gauge (semi-circle SVG, 200px)
- **Data**: `/api/console/reputation` (aggregated sentiment × volume × source authority × crisis penalty)
- **Priority**: must-have
- **Description**: Top-left of dashboard, 40% of viewport width on desktop. Number 72px bold Inter. Delta in 14px JetBrains Mono. Gauge stroke animates from gray to color on load (1s ease-out). Click → opens 30-day history modal.

### 2. Top 3 Alertes du Jour
- **What**: Three stacked alert cards, sorted by crisis score. Each: severity dot (red/amber/green), 1-line headline, source name + logo, time-ago ("il y a 23 min"). Click → expand to show snippet + link to full article + "Marquer comme traitée" button.
- **Why**: Answers "did anything happen overnight?" without reading 50 articles. The crisis detector surfaces what matters. Reduces scan time from 30 min to 30 sec.
- **Chart**: Stacked card list (not a chart)
- **Data**: `/api/console/alerts?limit=3&sort=crisis_score`
- **Priority**: must-have
- **Description**: Right column, 3 cards stacked. Red dot pulses softly when severity ≥70. Time-ago in mono font. "Voir toutes les alertes" link at bottom → /alerts page. Empty state: green checkmark "Aucune alerte critique — belle journée."

### 3. Tendance Sentiment (7 jours)
- **What**: Mini sparkline showing sentiment score over last 7 days. Single line, smoothed. Below sparkline: "+5 pts vs moyenne mensuelle" with up-arrow. Hover any point → tooltip with date + score + top article that day.
- **Why**: Tells them if sentiment is improving or degrading. The 7-day window is short enough to feel actionable, long enough to show a trend.
- **Chart**: Sparkline (line, 280×60px)
- **Data**: `/api/console/sentiment?range=7d`
- **Priority**: must-have
- **Description**: Below reputation gauge. Sage green line. Filled area below line at 10% opacity. No axes (too cluttered) — just the line. Click → opens /sentiment page with full chart.

### 4. Dernières Mentions (5)
- **What**: Feed of 5 most recent mentions. Each row: source favicon/logo (24px), source name (12px mono), headline (14px, 2-line clamp), sentiment dot, time-ago. Hover → preview tooltip with first 200 chars. Click → opens article in new tab + logs "viewed" for analytics.
- **Why**: "What are people saying about me right now?" Most basic need. Replaces the morning ritual of scrolling Hespress.
- **Chart**: Feed (list)
- **Data**: `/api/console/mentions?limit=5&sort=desc`
- **Priority**: must-have
- **Description**: Center column. Each row 64px tall, divider between. Sentiment dot: green/amber/red 8px circle. "Voir tout" link → /mentions. Filter chips above: "Tous | Positif | Neutre | Négatif".

### 5. Snapshot Visibilité IA
- **What**: 4 cards in a row, one per LLM: ChatGPT, Gemini, Claude, DeepSeek. Each card: LLM logo, big "✓" (sage green) or "✗" (red), last-tested timestamp. Below: "Votre marque est citée par 3/4 LLMs" summary. Click → see the actual prompt + response.
- **Why**: NEW category no competitor offers. Dircoms are terrified of "AI hallucinations" and being invisible to ChatGPT. This is the wow moment that converts.
- **Chart**: Card grid (2×2 on mobile, 1×4 on desktop)
- **Data**: `/api/console/ai-visibility` (weekly cron asking each LLM "tell me about [brand] in [industry]")
- **Priority**: must-have
- **Description**: Below sentiment trend. Subtle "EXCLUSIF HARCHIQ" pill badge top-right. When a previously-✓ LLM turns ✗, red banner: "ChatGPT ne vous cite plus — investigation recommandée." This is the Pro upsell hook.

### 6. Résumé Hebdomadaire (IA)
- **What**: One paragraph (3–5 sentences) auto-generated by GLM-4 every Monday 6am. Summary of the week: volume, sentiment delta, top alert, top topic, week-ahead note. Below: "Régénérer" button + "Copier" button.
- **Why**: Saves the dircom 30 minutes every Monday morning writing their own summary. They forward it to the boss as-is. Becomes the most-forwarded feature.
- **Chart**: Text block (no chart)
- **Data**: `/api/console/insights?type=weekly-summary` (GLM-4 via z-ai-web-dev-sdk)
- **Priority**: must-have
- **Description**: Top of dashboard, full-width, in a subtle sage-tinted card. 16px Inter, line-height 1.6. "✨ Généré par HarchIQ IA" badge. Example output: "Cette semaine, 23 mentions de votre marque (vs 18 la semaine précédente, +28%). Sentiment stable à 72/100. Une alerte modérée le mercredi sur Hespress concernant vos résultats annuels a été contenue en 48h. Semaine prochaine: surveiller les réactions au lancement produit prévu mardi."

### 7. Diversité des Sources
- **What**: Donut chart showing source breakdown: Hespress 35%, TelQuel 20%, Social 25%, Autres 20%. Below donut: "⚠️ Sur-représentation sur Hespress — risque de concentration" if any source >30%.
- **Why**: Media concentration = reputational risk. If 80% of coverage comes from one outlet, one bad article = crisis. Dircoms don't think about this until it's too late.
- **Chart**: Donut (200×200px) with legend
- **Data**: `/api/console/mentions?group_by=source&range=7d`
- **Priority**: nice-to-have
- **Description**: Compact card. Donut uses brand palette (sage, charcoal, zircon, amber). Legend below with % + source name. Hover slice → highlights matching rows in Dernières Mentions feed (cross-widget interaction).

### 8. Indicateur de Crise
- **What**: Horizontal gauge 0–100, color gradient green→amber→red. Current crisis score as a needle. Below: label ("RAS" / "Surveillance" / "Crise active") + 1-line explanation ("Volume normal, sentiment stable, pas de propagation détectée"). When score >60: pulsing red border + "Protocole de crise" button.
- **Why**: The crisis detector is HarchIQ's killer feature. Dircoms need a single "are we in crisis?" indicator they can glance at.
- **Chart**: Horizontal gauge with needle
- **Data**: `/api/console/crisis` (speed × sentiment drop × spread × escalation)
- **Priority**: must-have
- **Description**: Right column, below alerts. When red: card border pulses 2s infinite. "Protocole de crise" button → opens modal with: crisis playbook, pre-drafted press release, escalation contacts, "Activer le mode guerre" toggle (unlocks war-room dashboard).

### 9. Météo des Sentiments par Langue
- **What**: 3 horizontal mini-bars: Français, Arabe (MSA), Darija. Each bar split: green % / gray % / red % (positive/neutral/negative). Below: "Divergence Darija détectée: positif en FR, négatif en Darija" alert when delta >15pts.
- **Why**: Darija sentiment is HarchIQ's ONLY differentiator vs global competitors. Showing the divergence between official FR discourse and street-level Darija is the "aha moment" for Moroccan dircoms.
- **Chart**: Stacked horizontal bars (3 bars, 240×24px each)
- **Data**: `/api/console/sentiment?group_by=language&range=24h`
- **Priority**: must-have
- **Description**: Compact card. Each language label in its own script (Français, العربية, Darija). "EXCLUSIF" badge. This widget alone justifies the subscription.

### 10. Actions Rapides
- **What**: 4 large square buttons in a 2×2 grid: "Exporter PDF" (download weekly summary), "Demander à HarchIQ" (opens chat), "Voir Harch 100" (benchmark page), "Configurer alertes" (settings). Each button: 64×64px icon + label.
- **Why**: Reduces clicks to most common actions. Mobile-friendly. The "Demander à HarchIQ" button is the gateway to the LLM — drives engagement.
- **Chart**: Button grid (not a chart)
- **Data**: Client-side navigation
- **Priority**: must-have
- **Description**: Bottom of dashboard. Charcoal buttons with sage green icons on hover. "Demander à HarchIQ" has a subtle sparkle animation to suggest AI.

### 11. Évolution du Score (30 jours)
- **What**: Line chart, reputation score over 30 days. Markers on alert days (red dots with tooltip showing alert headline). Y-axis 0–100. Today highlighted with vertical line.
- **Why**: Context. Single-day score is meaningless without history. 30 days = monthly reporting cycle.
- **Chart**: Line chart with event markers (640×180px)
- **Data**: `/api/console/reputation?range=30d`
- **Priority**: must-have
- **Description**: Below the gauge. Sage line, 2px stroke. Hover → crosshair + tooltip. Red dots = days with crisis alerts. Click a dot → opens that day's alert detail. Toggle: 7j / 30j / 90j (90j locked for Essentiel with "PRO" badge → upsell).

### 12. Carte de Chaleur Géo
- **What**: Stylized Morocco map with heat spots where mentions originate. Major cities labeled. Casablanca glowing bright = lots of mentions. Below: "Concentration: Casablanca (47%), Rabat (23%), Marrakech (12%)".
- **Why**: Geo-intelligence is rare in this market. Shows the dircom where their brand is hot/cold. Useful for regional campaigns.
- **Chart**: Heatmap on SVG map
- **Data**: `/api/console/mentions?group_by=geo&range=7d`
- **Priority**: nice-to-have
- **Description**: Compact card, 280×200px. Map outline in charcoal, heat in sage→amber→red gradient. Hover city → tooltip with mention count + sentiment.

### 13. Top 5 Sujets Associés
- **What**: Horizontal bar list of top 5 topics mentioned alongside the brand. Each: topic label, bar (length = volume), sentiment dot. "Résultats annuels ▓▓▓▓▓▓ 🟢", "Nouveau CEO ▓▓▓▓ 🟡", "Boycott ▓▓ 🔴".
- **Why**: Tells dircom what narrative is forming around their brand. "Boycott" appearing = early warning. "Résultats annuels" = positive momentum.
- **Chart**: Horizontal bar list
- **Data**: `/api/console/topics?limit=5` (NER + clustering)
- **Priority**: nice-to-have
- **Description**: Compact card. Each row 32px. Click topic → filters Dernières Mentions to that topic.

### 14. Position Harch 100
- **What**: Big rank number "#12" with delta arrow ("↑3 vs semaine dernière"). Below: tiny sparkline showing rank over 4 weeks. "Voir le classement complet" link.
- **Why**: Harch 100 is the exclusive benchmark. Dircoms love rankings. Watching rank climb = dopamine hit = retention.
- **Chart**: Big number + sparkline
- **Data**: `/api/console/harch100?brand={brandId}`
- **Priority**: must-have
- **Description**: Compact card. Rank in 48px JetBrains Mono. Up arrow sage green / down arrow red. "HARCH 100" badge. Click → /harch-100 page with full ranking + filter by sector.

### 15. Activité Réseau Social
- **What**: 3 stat tiles: "Twitter: +234 abonnés", "Facebook: +18 mentions", "Top viral: [post snippet]". Each tile: icon, number, delta, mini sparkline.
- **Why**: Social is where crises start. Quick pulse check.
- **Chart**: Stat tiles (3 mini cards)
- **Data**: Social APIs (Twitter/FB/IG) via `/api/console/social`
- **Priority**: nice-to-have
- **Description**: Row of 3 cards. Top viral post: click → opens post. If top viral is negative sentiment → red border + "Surveiller" button.

### 16. Hall of Fame / Wall of Shame
- **What**: Two cards side by side. Left (sage bg): "Meilleure mention de la semaine" — quote, source, +sentiment score. Right (red bg): "Pire mention" — quote, source, –sentiment score.
- **Why**: Dircoms love/showcase wins. And the "worst mention" forces them to confront negatives. Both are conversation starters with the boss.
- **Chart**: Two quote cards
- **Data**: `/api/console/mentions?sort=sentiment_asc&limit=1` + `sort=sentiment_desc&limit=1`
- **Priority**: nice-to-have
- **Description**: Full-width card split in two. Quote in italic 14px. Source attribution below. "Partager" button → copies to clipboard for Slack/email.

### 17. Évolution des Sujets (mini streamgraph)
- **What**: Compact streamgraph showing how 5–7 topics have shifted in volume over 30 days. Each stream = a topic, width = volume.
- **Why**: Topic evolution = trend forecasting. "Boycott" stream growing = act now.
- **Chart**: Streamgraph (mini, 280×120px)
- **Data**: `/api/console/topics?range=30d&format=stream`
- **Priority**: crazy
- **Description**: Below Top Sujets. Click stream → opens topic detail page. Locked for Essentiel? No — keep it as the "wow" retention feature.

### 18. Volume de Mentions (7 jours)
- **What**: Bar chart, one bar per day for last 7 days. Each bar colored by average sentiment (green/amber/red). Hover bar → tooltip with count + sentiment + top source.
- **Why**: Volume + sentiment combined = "was today a busy day AND was it good or bad?"
- **Chart**: Bar chart (7 bars, 280×100px)
- **Data**: `/api/console/mentions?group_by=day&range=7d`
- **Priority**: must-have
- **Description**: Compact card. Today's bar highlighted with charcoal outline. Y-axis hidden (clean look).

### 19. Prochaines Échéances
- **What**: Mini calendar/list of upcoming known events: "Mar 12 — Résultats annuels", "Mar 18 — Conférence CAS", "Avr 02 — Lancement produit". User-added + auto-detected from press releases.
- **Why**: Anticipation. Dircom knows their own calendar; aligning it with monitoring helps them prepare for predictable media spikes.
- **Chart**: List with date chips
- **Data**: User input + `/api/console/events`
- **Priority**: nice-to-have
- **Description**: Right column. Each event: date chip (sage green), label, "Ajouter alerte" button → creates a saved search for that event.

### 20. Boîte à Outils Dircom
- **What**: Row of 4 template buttons: "Communiqué de réponse", "Brief interne", "Post LinkedIn", "Tweet de crise". Click → opens modal with AI-generated draft pre-filled with current context.
- **Why**: Saves 30+ min per draft. The dircom edits instead of writes. AI uses current sentiment + alerts as context.
- **Chart**: Button row (not a chart)
- **Data**: GLM-4 via `/api/console/insights?type=template`
- **Priority**: nice-to-have
- **Description**: Bottom of dashboard. Each button: icon + label. Generated draft opens in editor modal with "Copier" / "Télécharger .docx" / "Régénérer" buttons. "✨ IA" badge.

---

## PRO (30 sections)

### 1. Tableau de Bord Personnalisable
- **What**: Drag-and-drop dashboard builder. User can add/remove/rearrange any widget. Save multiple layouts ("Vue Dircom", "Vue Analyste", "Vue PDG"). Switch with tabs.
- **Why**: Different roles need different views. The dircom wants scores; the analyst wants raw data; the social manager wants engagement. One dashboard doesn't fit all.
- **Chart**: Layout grid (12-col)
- **Data**: User preferences (Prisma `dashboard_layout` table)
- **Priority**: must-have
- **Description**: Edit mode toggle (pencil icon top-right). In edit mode: widget palette drawer on left, drag to canvas, resize handles. Save → modal "Nommer cette vue". Each user has personal + shared team layouts.

### 2. Tableau de Benchmark Concurrentiel
- **What**: Side-by-side table: you + 3 competitors. Columns: Score Réputation, Sentiment (7j), Volume Mentions, Part de Voix, Niveau Crise, Rank Harch 100. Sortable by any column. Color-coded cells (green=you lead, red=you trail).
- **Why**: THE reason to upgrade to Pro. Dircoms benchmark constantly. Showing where they win/lose vs competitors is the boss-impressing chart.
- **Chart**: Data table with conditional formatting
- **Data**: `/api/console/benchmark?competitors={ids}&range=7d`
- **Priority**: must-have
- **Description**: Full-width card. Competitor logos in header row. Cells: number + delta arrow. Click competitor name → opens /competitor/[id] deep-dive page. "Ajouter concurrent" button (max 5 for Pro, 10 for Enterprise).

### 3. Radar de Réputation
- **What**: Radar/spider chart with 6 axes: Sentiment, Volume, Reach, Autorité, Diversité, Visibilité IA. You (sage fill) vs top competitor (charcoal outline) overlaid. Legend below.
- **Why**: Multi-dimensional comparison. Shows WHERE you're strong/weak vs competitors. "You win on sentiment but lose on reach" → actionable.
- **Chart**: Radar chart (6 axes, 320×320px)
- **Data**: `/api/console/reputation?dimensions=6&competitors={id}`
- **Priority**: must-have
- **Description**: Hexagonal radar. Your polygon filled sage 20% opacity. Competitor outlined. Hover axis → tooltip with raw values. Toggle competitors on/off via legend chips.

### 4. Part de Voix (donut)
- **What**: Donut chart showing share of voice in your industry. You 28%, Competitor A 35%, B 18%, C 12%, Autres 7%. Center: your % in big number. Below: delta vs last month ("+2 pts vs mars").
- **Why**: SOV is the #1 metric dircoms report to bosses. "We grew share of voice by 2 points" = promotion-worthy.
- **Chart**: Donut (280×280px)
- **Data**: `/api/console/share-of-voice?industry={id}&range=30d`
- **Priority**: must-have
- **Description**: Click slice → drills into that competitor's mentions. Legend with absolute mention counts + %. "Période" selector: 7j / 30j / 90j.

### 5. Comparaison Sentiment (4 séries)
- **What**: Multi-line chart. You + 3 competitors, sentiment over 30 days. 4 colored lines. Legend with toggle. Hover → crosshair shows all 4 values at that date.
- **Why**: When competitor sentiment drops, you see it instantly. "Competitor A had a crisis on the 15th — opportunity for us."
- **Chart**: Multi-line chart (640×240px)
- **Data**: `/api/console/sentiment?competitors={ids}&range=30d`
- **Priority**: must-have
- **Description**: 4 distinct colors (sage, charcoal, amber, zircon). Smooth lines. Anomaly markers (red dots) on competitor lines when their sentiment drops >10pts in 24h. Click marker → "Opportunité: [competitor] en baisse — recommandé: communiqué de positionnement" AI suggestion.

### 6. Constructeur de Rapports
- **What**: Drag-and-drop report builder. Left: widget palette (all dashboard widgets available). Center: A4 canvas. Drop widgets, resize, arrange. Top: date range picker, title input, logo upload. Export: PDF, PPTX, shareable link.
- **Why**: Report generation eats 4+ hours/week for Pro teams. This kills it. The boss gets a polished report in 5 min.
- **Chart**: Canvas + drag-drop
- **Data**: `/api/console/reports/generate` (server-side PDF via Playwright/puppeteer)
- **Priority**: must-have
- **Description**: Full-screen mode. Templates: "Rapport hebdo PDG", "Rapport mensuel conseil", "Brief crise". Auto-fill with current data. "Planifier" button → weekly cron generates + emails.

### 7. Recherches Sauvegardées
- **What**: List of saved searches (queries). Each: query string ("marque + boycott"), # results this week, sentiment trend mini-sparkline, last-triggered alert. Create new → query builder modal (boolean operators, source filters, language filters).
- **Why**: Recurring monitoring needs ("every week I check boycott mentions"). Saved searches = one-click access + per-search alerts.
- **Chart**: List with mini-charts
- **Data**: `/api/console/saved-searches` (Prisma)
- **Priority**: must-have
- **Description**: Dedicated page accessible from sidebar. Each search card: query in mono font, stat tiles (volume 7j, sentiment avg, last alert). "Modifier" / "Supprimer" / "Alertes" actions. Alert config per search: threshold, channel (email/WhatsApp/Slack), recipients.

### 8. Fil d'Activité Équipe
- **What**: Activity feed (like Slack). Entries: "Lucas a exporté 'Rapport hebdo PDG' — il y a 14 min", "Sarah a créé une alerte sur 'boycott + marque' — il y a 1h", "Marc a commenté l'article [headline] — il y a 2h", "Anaïs a modifié la vue 'PDG' — il y a 3h".
- **Why**: Team coordination. Without it, 3 people export the same report, no one knows who's handling the alert, duplicate work. Accountability.
- **Chart**: Activity feed
- **Data**: `/api/console/team/activity` (audit log)
- **Priority**: nice-to-have
- **Description**: Right sidebar or dedicated tab. Each entry: avatar (32px), action verb, object, relative time. Filter chips: "Exports | Alertes | Commentaires | Vues". Click object → jumps to it.

### 9. Configuration d'Alertes Avancée
- **What**: Rule builder (visual, no-code). Conditions: IF [sentiment drops X pts in Y hours] AND [volume > Z] AND [source IN list] AND [language IN list] THEN [notify email/WhatsApp/Slack] TO [team members] WITH [template message]. Multiple rules, enable/disable toggle.
- **Why**: Essentiel alerts are basic (top 3 by crisis score). Pro teams need custom rules ("alert me ONLY when Darija sentiment drops, on Hespress, after 8pm — that's when boycott rumors start").
- **Chart**: Rule builder UI
- **Data**: `/api/console/alerts/rules` (Prisma)
- **Priority**: must-have
- **Description**: Dedicated page. Rule list on left, editor on right. Conditions as draggable chips. Test button → "Cette règle aurait déclenché 3 fois cette semaine" with examples. Channel routing matrix at bottom.

### 10. Comparaison Semaine vs Semaine
- **What**: Side-by-side cards: Cette semaine | Semaine dernière. Big stats: Mentions (23 vs 18, +27%), Sentiment (72 vs 68, +4), Score Réputation (74 vs 71, +3), Crise (18 vs 35, -17, ✅ improving), Reach (2.3M vs 1.9M, +21%).
- **Why**: Week-over-week is the dircom's reporting cadence. This card IS the Monday morning exec summary.
- **Chart**: Side-by-side stat cards
- **Data**: `/api/console/compare?period=this_week,last_week`
- **Priority**: must-have
- **Description**: Two columns, 5 rows of metrics. Delta in sage (positive) or red (negative). Click any metric → opens detailed chart. "Exporter" button → generates comparison PDF.

### 11. Top 5 Influenceurs
- **What**: List of top 5 journalists/accounts mentioning you (or your competitors) most. Each: avatar (48px), name, outlet/handle, # mentions, avg sentiment, estimated reach, "Dernier article" link. Sort by mentions / reach / sentiment.
- **Why**: PR teams need to know who to pitch. "Journalist X covers us positively 12x/year — invite them to the press conference." Or "Influencer Y trashes us — don't engage."
- **Chart**: List with avatars
- **Data**: `/api/console/influencers?limit=5&sort=mentions`
- **Priority**: nice-to-have
- **Description**: Each row 72px. Sentiment as colored bar (mini horizontal bar under name). "Contacter" button → opens CRM modal (Pro feature: tracks last contact date, relationship status).

### 12. Évolution des Sujets (streamgraph 90 jours)
- **What**: Full streamgraph over 90 days. Each stream = a topic. Width = volume. Color = avg sentiment (green→red). Hover stream → highlights topic + shows evolution.
- **Why**: Topic evolution over 90 days = trend spotting. "ESG mentions growing 3x — should we publish an ESG report?" Predictive value.
- **Chart**: Streamgraph (full-width, 320px tall)
- **Data**: `/api/console/topics?range=90d&format=stream`
- **Priority**: nice-to-have
- **Description**: Full-width card. 7–12 topic streams. Legend chips below (toggle on/off). Click stream → opens /topics/[id] with all articles tagged.

### 13. Estimation de Reach Média
- **What**: For each mention: estimated reach (lectures uniques estimées). Aggregate widget: "Reach total cette semaine: 2.3M, +18% vs semaine dernière". Below: top 5 mentions by reach (with outlet, headline, reach, sentiment).
- **Why**: Volume ≠ impact. One Hespress article = 500K reach, 100 tweets = 50K reach. Dircoms need to report IMPACT not just COUNT.
- **Chart**: Big number + ranked list
- **Data**: `/api/console/reach?range=7d` (per-source reach estimates from Harch 100 DB)
- **Priority**: must-have
- **Description**: Big reach number (72px) with delta. Below: ranked list of top 5 mentions by reach. Each row: rank #, outlet logo, headline (1 line), reach (mono), sentiment dot. Click → opens article.

### 14. Métriques d'Engagement
- **What**: For social mentions: likes, shares, comments, engagement rate. Aggregate widget: total engagement, avg engagement rate, top viral post (with full stats). Sentiment of comments (Darija-aware).
- **Why**: Social engagement = real conversation. A post with 1000 angry Darija comments is more dangerous than 10 neutral articles.
- **Chart**: Stat tiles + viral post card
- **Data**: Social APIs + Darija NLP
- **Priority**: nice-to-have
- **Description**: 4 stat tiles (Likes, Shares, Comments, Engagement Rate). Below: top viral post card with avatar, full text, engagement stats, sentiment breakdown of comments (FR/AR/Darija split).

### 15. Carte de Crise (timeline)
- **What**: Vertical timeline of a crisis event. Phases: Déclencheur → Pic → Réponse → Résolution. Each phase: timestamp, key event, sentiment at that moment, top article. Reconstruction tool for post-mortem.
- **Why**: Post-crisis, dircoms write "lessons learned" reports. This timeline auto-reconstructs the crisis so they don't have to dig through articles.
- **Chart**: Vertical timeline
- **Data**: `/api/console/crisis/timeline?event={id}` (reconstructs from alert + mention history)
- **Priority**: nice-to-have
- **Description**: Dedicated modal/page. Crisis selector dropdown. Vertical line with phase markers. Each phase card: timestamp, event description, sentiment mini-gauge, top 3 articles. "Exporter le post-mortem" button → PDF.

### 16. Audit de Marque Employeur
- **What**: Sentiment of employee/ex-employee discourse (Glassdoor, LinkedIn, Hespress comments by self-identified employees). Trend over 90 days. Top positive/negative themes. "Attrition risk" indicator if sentiment drops sharply.
- **Why**: Employer brand = talent acquisition. HR and comms increasingly share this metric. Negative employee sentiment precedes public crises.
- **Chart**: Sentiment trend + theme bars
- **Data**: `/api/console/employer-brand` (Glassdoor scrape + LinkedIn + comment NLP)
- **Priority**: crazy
- **Description**: Card with sentiment trend line + top 5 themes (positive green, negative red). "Risque attrition" gauge if applicable. Locked for Essentiel — Pro exclusive.

### 17. Veille Concurrentielle Automatisée
- **What**: Daily digest card: "3 choses sont arrivées chez vos concurrents aujourd'hui". Bullets: "Competitor A — nouveau CEO nommé", "B — lancement produit X", "C — controverse sur [topic], sentiment -15pts". Each with source link.
- **Why**: Dircoms need to know competitor moves daily. Manual tracking is impossible. Auto-digest = competitive intelligence on autopilot.
- **Chart**: Bulleted digest card
- **Data**: `/api/console/competitors/digest` (daily cron monitoring competitor mentions)
- **Priority**: must-have
- **Description**: Card with date header. 3–5 bullets, each with competitor logo + 1-line summary + "Lire" link. "Voir historique" → /competitors/activity page. Email version sent daily 7am.

### 18. Alertes Intelligence IA (weekly)
- **What**: Weekly card: "Nous avons posé 10 questions à ChatGPT, Gemini, Claude, DeepSeek sur votre secteur. Votre marque est citée 4/10 fois (vs 2/10 la semaine dernière, +100%)." Below: list of questions + which LLMs cited you + actual responses.
- **Why**: AI visibility is the new SEO. Dircoms are starting to care. HarchIQ is the only tool that tracks this. Differentiator.
- **Chart**: Big stat + ranked list
- **Data**: `/api/console/ai-visibility?weekly=true` (weekly cron)
- **Priority**: must-have
- **Description**: Big "4/10" stat. Delta in sage green. List of 10 questions, each with 4 LLM badges (✓/✗). Click question → opens full LLM responses side-by-side. "Optimiser ma visibilité IA" button → AI suggestions.

### 19. Rapport Auto-Généré (PDF hebdo)
- **What**: Every Monday 6am, PDF in inbox. Structure: title page, executive summary (1 paragraph AI), KPI scorecard, top 5 mentions, top alert, competitor movements, week-ahead preview. Customizable template.
- **Why**: The dircom forwards this to the boss as-is. Zero effort. Highest-value automation in Pro.
- **Chart**: PDF document
- **Data**: Aggregation of all metrics + GLM-4 summary
- **Priority**: must-have
- **Description**: Settings page: template editor (sections toggle on/off, logo upload, recipients list, send time). Preview button → generates sample PDF. "Envoyer maintenant" button. Email subject customizable with variables ({brand}, {week}).

### 20. Dashboard Mobile + Push
- **What**: Mobile-optimized dashboard (responsive or PWA). Push notifications for crisis-level alerts (configurable threshold). WhatsApp integration for crisis alerts (since most Moroccan dircoms live on WhatsApp).
- **Why**: Crises don't wait for the dircom to be at their desk. Mobile = real-time response capability.
- **Chart**: Mobile UI
- **Data**: Same API, mobile-formatted
- **Priority**: must-have
- **Description**: PWA installable. Bottom nav: Accueil | Alertes | Mentions | Rapports | Paramètres. Push notifications via Firebase. WhatsApp alerts via Twilio API. Crisis push: full-screen takeover on lock screen with "Voir" / "Déléguer" buttons.

### 21. Analyse de Sujets Émergents
- **What**: "Sujets en croissance (7j) où vous n'êtes PAS mentionné". List of 5 topics with growth rate. Each: topic, growth %, top sources covering it, "Pourquoi ça compte" AI note, "Créer une alerte" button.
- **Why**: Opportunity detection. If ESG is trending 3x and you're not in the conversation, you're missing the moment.
- **Chart**: Ranked list with growth bars
- **Data**: `/api/console/topics/emerging?exclude_brand={id}`
- **Priority**: nice-to-have
- **Description**: Card with 5 emerging topics. Each row: topic name, growth sparkline, growth %, AI note. "Créer une alerte" → adds to saved searches. "Suggérer un communiqué" → AI drafts a positioning statement.

### 22. Heatmap Heure × Jour
- **What**: 7×24 heatmap (days × hours). Cell color intensity = mention volume. Reveals patterns like "Tuesday 10am is your peak mention time."
- **Why**: Optimal posting/pitching timing. If journalists cover you Tuesday mornings, that's when to pitch.
- **Chart**: Heatmap (7 rows × 24 cols)
- **Data**: `/api/console/mentions?group_by=day_hour&range=30d`
- **Priority**: nice-to-have
- **Description**: Compact card. Hover cell → tooltip with count + avg sentiment. "Meilleur moment pour publier: Mardi 10h" AI suggestion below.

### 23. Répartition par Type de Média
- **What**: Donut + evolution. Donut: Presse 40%, TV 15%, Radio 5%, Social 30%, Blogs 7%, Forums 3%. Below: 30-day evolution stacked area chart showing media type mix over time.
- **Why**: Media mix = PR strategy health. If social is growing and presse is shrinking, that's a strategic shift.
- **Chart**: Donut + stacked area
- **Data**: `/api/console/mentions?group_by=media_type&range=30d`
- **Priority**: nice-to-have
- **Description**: Two charts in one card. Donut on left, evolution on right. Toggle media types on/off via legend.

### 24. Carte des Parties Prenantes
- **What**: Network graph. Your brand at center. Connected nodes: journalists, influencers, analysts, competitors, regulators. Edge thickness = relationship strength (mention frequency). Node color = sentiment (green/amber/red). Drag to rearrange.
- **Why**: Visualizes the brand's influence ecosystem. "Who matters most? Who's hostile? Who's a hidden ally?"
- **Chart**: Force-directed network graph (D3.js)
- **Data**: `/api/console/stakeholders?brand={id}`
- **Priority**: crazy
- **Description**: Full-screen modal. Nodes draggable. Click node → side panel with stakeholder profile (mentions, sentiment, last article, recommended action). Filter by stakeholder type. "Exporter en PNG" button.

### 25. Scorecard Mensuelle
- **What**: Auto-generated monthly scorecard. KPIs in a clean grid: Score Réputation (72, +3), SOV (28%, +2pts), Sentiment (+5), Jours sans crise (30), Reach (9.2M, +18%), Rank Harch 100 (#12, ↑3). Below: 3-bullet narrative from GLM-4.
- **Why**: Monthly reporting to exec team / board. Polished, one-page, ready to forward.
- **Chart**: KPI grid + narrative
- **Data**: Aggregation + GLM-4
- **Priority**: must-have
- **Description**: Dedicated page. Clean A4 layout. Logo + month header. KPI tiles 3×2. Narrative paragraph. "Télécharger PDF" / "Envoyer par email" buttons. Auto-generated on 1st of each month.

### 26. Détection de Bot / Campagne Coordonnée
- **What**: Alert widget: "47 mentions en 2h depuis des comptes à faible crédibilité — probable campagne coordonnée." Shows: spike chart, sample suspicious accounts, common hashtags, "Signaler aux plateformes" button.
- **Why**: Boycotts and smear campaigns start with coordinated bot networks. Early detection = early counter-response.
- **Chart**: Spike chart + account list
- **Data**: `/api/console/bot-detection` (velocity + account credibility scoring)
- **Priority**: crazy
- **Description**: Modal triggered when bot campaign detected. Spike chart (last 24h). List of 10 sample suspicious accounts with credibility score + creation date. Common phrases word-cloud. "Lancer investigation" → AI generates report.

### 27. Analyse Multi-Marque
- **What**: If company has sub-brands (e.g., telecom with consumer + business + mobile money): sentiment per sub-brand. Aggregate view + drill-down. Stacked bar chart.
- **Why**: Conglomerates need per-brand visibility. A crisis on sub-brand A can taint the parent.
- **Chart**: Stacked bar (per sub-brand) + sentiment split
- **Data**: `/api/console/brands?parent={id}`
- **Priority**: nice-to-have
- **Description**: Card with sub-brand selector. Stacked bar per sub-brand: green/amber/red segments. Click sub-brand → drills into its mentions. "Vue agrégée" toggle.

### 28. Prévisions IA (72h)
- **What**: Predictive widget: "Basé sur la tendance actuelle, le sentiment devrait baisser de 5–7 points dans les 72 prochaines heures sans intervention." Confidence interval. Contributing factors list.
- **Why**: Predictive > reactive. If AI sees a trajectory, dircom can intervene before the dip.
- **Chart**: Forecast line with confidence band
- **Data**: `/api/console/forecast?horizon=72h` (time-series model on sentiment + volume)
- **Priority**: crazy
- **Description**: Card with forecast chart: solid line (actual), dashed line (predicted), shaded band (confidence). Below: "Facteurs contributifs" list (top 3 drivers). "Recommandations" AI suggestions.

### 29. Module Anti-Boycott
- **What**: Dedicated dashboard tab. Monitors keywords: "boycott + [brand]", "alternatives + [brand]", "[competitor] better than [brand]". WhatsApp rumor tracker (opt-in employee reports). Early warning score.
- **Why**: 2018 Centrale Danone boycott cost €150M. HarchIQ's positioning is "we'd have warned you in 15 min." This module operationalizes that promise.
- **Chart**: Multi-widget dashboard
- **Data**: `/api/console/anti-boycott` (keyword monitoring + WhatsApp rumor line)
- **Priority**: crazy
- **Description**: Dedicated tab. Widgets: boycott mention volume (7j), sentiment of boycott mentions, top viral anti-brand posts, rumor tracker, "Niveau de risque boycott" gauge. "Protocole anti-boycott" button → crisis playbook specific to boycott scenarios.

### 30. Module Dircom Personnel (executives)
- **What**: For CEOs/Dircoms who are public figures: their personal reputation score, mentions of them by name, sentiment trend, top articles, "what people say about [CEO name]". Separate from brand score.
- **Why**: Executive reputation ≠ brand reputation. A CEO scandal can tank the brand even if brand sentiment is fine.
- **Chart**: Same as brand dashboard but scoped to person
- **Data**: `/api/console/person?name={exec}`
- **Priority**: nice-to-have
- **Description**: Toggle in header: "Marque | [CEO Name]". Switches entire dashboard to person-scoped view. Multi-person support (up to 3 executives on Pro).

---

## CRAZY IDEAS (things that would blow their mind)

1. **Reputation Time Machine** — Scrub through 5 years of reputation history. Slider at top of dashboard. Drag to "June 2023" → all widgets update to that date. Post-mortem tool. "Remember when we had that crisis? Let me show you exactly what happened."

2. **WhatsApp Voice Note Analysis** — Employees forward viral WhatsApp voice notes (opt-in). AI transcribes + analyzes sentiment + detects boycott rumors early. Morocco-specific: WhatsApp is where boycotts brew. No competitor does this.

3. **Crisis Simulator / War Gaming** — "What if a boycott starts tomorrow? Based on 2018 Centrale Danone pattern, here's the likely 72h trajectory, peak sentiment drop, and 3 intervention scenarios with predicted outcomes." Practice crises before they happen.

4. **AI Spokesperson Coach** — Before a press conference, paste talking points. AI role-plays hostile journalist questions (in Darija!), scores responses, suggests improvements. "Your answer on layoffs scored 4/10 — too defensive. Try this framing..."

5. **Harch 100 Live Ticker** — Stock-ticker-style live feed at top of dashboard: "Inwi ↑3, OCP ↓1, Attijariwafa →, Maroc Telecom ↑2". Real-time rank changes. Dopamine machine.

6. **Daily Standup Video (AI avatar)** — 60-second video generated every morning. Virtual avatar reads the daily summary. Like Reuters daily briefing but for YOUR brand. Shareable to boss/team. Powered by TTS + avatar API.

7. **Crisis WhatsApp Bot** — Real-time WhatsApp bot. Pushes crisis alerts with one-tap "Reçu" / "Escalader" / "Déléguer à [team member]" buttons. Works on the dircom's phone, in their pocket, in 15 minutes.

8. **Journalist CRM** — Database of 500+ Moroccan/African journalists. Track: who covers you, sentiment of their coverage, last contact date, relationship strength, preferred topics, contact info. PR outreach automation. "Journalist X covers telecom positively — invite to your launch."

9. **Sentiment of Your Own Communications** — Paste your press release / tweet / speech. AI scores sentiment + predicts media reaction + flags risky phrases. "This sentence will likely be quoted negatively on Hespress — consider rephrasing." Pre-publication QA.

10. **Boycott Early Warning Network** — Anonymous tip line. Employees/consumers flag boycott conversations they're seeing (WhatsApp groups, Facebook, mosque). Whistleblower protection. First signal often comes from insiders.

11. **Predictive Editor's Pick** — "Tomorrow, Hespress will likely cover [topic] based on journalist X's recent posts + trending angles. Want to pitch a counter-narrative tonight?" Get ahead of the news cycle.

12. **Voice-of-Employee Pulse** — Anonymous employee sentiment from internal Slack/Teams (with consent). Correlates employee mood with external reputation 2–4 weeks later. Leading indicator.

13. **Geopolitical Risk Overlay** — Overlay regional events (elections, regulatory changes, currency moves, football matches) on your reputation chart. See correlations. "Every time the dirham drops, your sentiment drops 3 points — why?"

14. **Auto-Drafted Press Release (crisis mode)** — When crisis detected, AI drafts 3 versions of press release: defensive, transparent, proactive. Each with predicted media reaction. One-click send to legal for approval. Cuts crisis response time from 4h to 30min.

15. **Industry Conversation Map (3D)** — 3D network graph of every conversation in your industry. You see your position, where attention is flowing, who's central, who's peripheral. VR-compatible. The "God view" of your market.

16. **Dircom OS (Mission Control mode)** — Full-screen mode that turns the dashboard into a war room. Voice-activated ("HarchIQ, montre-moi les indicateurs de crise"). Designed for projector in crisis room. Red theme when crisis active.

17. **Hallucination Detector** — Monitor what LLMs say about your brand. Flag false claims ("ChatGPT said your CEO was fired in 2023 — that's false"). Auto-file takedown/feedback requests to OpenAI/Anthropic/Google. AI reputation protection.

18. **Sentiment Heatmap of Morocco (real-time)** — Real-time map of Morocco showing sentiment by region. Green = positive, red = negative. Spot geographic crises before they go national. "Why is Marrakech suddenly red? Investigate."

19. **Competitor Press Release AI Critique** — When competitor publishes a press release, AI analyzes in 30s: strategy, weak points, hidden signals, opportunities for your response. "Competitor X's PR is defensive about layoffs — they're vulnerable on this topic, strike now."

20. **Sunday Night Briefing (WhatsApp)** — Every Sunday 8pm: WhatsApp message summarizing what to expect next week. Scheduled events, trending topics, competitor signals, "things to watch." Arrives before Monday morning planning.

21. **Harch 100 Awards** — Annual ceremony + badge. "Top 10 Most Respected Brands in Morocco 2026." Brands display the badge on their site. Marketing for HarchIQ + retention tool for clients.

22. **AI-Generated Crisis Timeline Video** — After a crisis resolves, AI generates a 2-minute narrated video reconstructing the crisis (timeline, key moments, sentiment curve, lessons). Shareable internally. Replaces 20-page post-mortem doc.

23. **Tone-of-Voice Consistency Checker** — Monitor all brand communications (press releases, social, exec speeches) for tone consistency. "Your Twitter is casual, your press releases are formal — inconsistency detected."

24. **Crisis Replay (annotated)** — Replay a past crisis day in real-time. Dashboard shows what the dircom saw hour-by-hour. Training tool for new team members. "Here's exactly what the 2024 boycott looked like from inside the war room."

25. **Competitor Sentiment Anomaly Alerts** — "Competitor X's sentiment just dropped 15 points in 2 hours — they're having a crisis. Opportunity window: 6–12 hours to position ourselves." Strike-while-iron-is-hot intelligence.

---

## SUMMARY

| Plan | Sections brainstormed | Must-have | Nice-to-have | Crazy |
|------|----------------------|-----------|--------------|-------|
| Essentiel | 20 | 10 | 8 | 2 |
| Pro | 30 | 12 | 10 | 8 |
| Crazy ideas | 25 | — | — | 25 |

**Key differentiators to emphasize**:
1. **Darija sentiment** (Météo Langues) — only HarchIQ has this
2. **AI Visibility** (LLM citation tracking) — category-creating feature
3. **Harch 100** (Moroccan benchmark) — exclusive ranking
4. **Crisis detector** (15-min early warning) — operational promise
5. **Anti-boycott module** — Morocco-specific pain point

**Upgrade triggers (Essentiel → Pro)**:
- AI Visibility snapshot shows 1/4 → "Upgrade to track all 10 questions weekly"
- Score history locked at 30j → "Upgrade for 365j history"
- No benchmark → "Upgrade to compare vs 3 competitors"
- No reports → "Upgrade for auto-generated weekly PDF"
- Single user → "Upgrade for team collaboration + activity feed"
- Basic alerts → "Upgrade for custom rule builder + WhatsApp"

**Next actions for implementation agents**:
1. Build Essentiel dashboard with 10 must-have sections first
2. Wire real APIs (replace demo data)
3. Add Pro-only sections behind plan gate
4. Implement report builder + saved searches (Pro core)
5. Build custom alert rule engine (Pro core)
6. Crazy ideas → spike individually, validate with 3 design partners before building
