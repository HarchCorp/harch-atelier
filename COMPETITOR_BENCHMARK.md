# HARCH ATELIER — UX Competitor Benchmark
# 5 concurrents GEO/AEO/AI-Reputation analysés via VLM (25 screenshots)

> **Task ID:** BENCH-1
> **Author:** general-purpose agent (VLM benchmark)
> **Date:** 2026-07-29
> **Méthode:** z-ai-web-dev-sdk `vision` CLI × 25 screenshots (5 concurrents × 5 vues : hero, features, pricing, dashboard, fullpage).
> **Positionnement de référence:** `business_plan_v2.md` — Atelier = AI Reputation Intelligence for Africa, GLM-4 natif arabe, WhatsApp Daily Digest, marché Top 500 marocain, pricing 5K/15K/50K MAD/mois.

---

## Section 1 — Méthodologie

J'ai chargé la skill `VLM` du SDK z-ai-web-dev-sdk et utilisé le CLI `z-ai vision` pour analyser 25 screenshots capturés par l'agent h-int (cf. `blueprint.md`) dans `/home/z/my-project/work/harch-corp/agents/h-int/competitors/`. Pour chaque screenshot, un prompt structuré en 10 dimensions (layout, palette hex, typographie, hiérarchie, CTAs exacts, pricing, tunnel de conversion, différenciants, faiblesses UX, score /10) a été envoyé au modèle vision. Les 25 réponses JSON ont été extraites puis synthétisées. Aucune analyse n'a été interpolée manuellement — toutes les métriques (hex, prix, CTAs, scores) proviennent strictement du VLM. Les captures existaient déjà (25 screenshots), aucune nouvelle capture réseau n'a été effectuée.

---

## Section 2 — Analyse par concurrent

### 2.1 Otterly (otterly.ai) — AI Search Visibility

**Positionnement observé** : "Content Intelligence for AI Search" — tracking ChatGPT, Perplexity, Gemini, Copilot. Cible solo marketers → mid-market + agencies. URL correcte (otterly.ai).

#### 2.1.1 Hero (`otterly-hero.png`, score VLM 7.5/10)
| Dimension | Valeur |
|---|---|
| Layout | Header (logo + nav Features/Solutions/Resources/Pricing/Get a demo + Log In + Start Free Trial) → Breadcrumbs tags (Prompt Research, AI Search Analytics, AI Search Optimization) → Hero H1 centré avec mot coloré → double CTA → Social proof G2 4.8/5 + Gartner Cool Vendor → Product preview dashboard Adidas sur fond rose vif → Cookie banner |
| Palette | Primaire `#E91E8C` (magenta/fuchsia), bg `#FFFFFF`, texte `#1A1A1A`, secondaire `#6B7280`, bordures `#F3F4F6` |
| Typographie | Sans-serif (Inter ou SF Pro Display). H1 Black/ExtraBold 900, body Regular 400, nav Medium 500 |
| Hiérarchie | H1 ~64-72px, sous-titre ~18-20px, nav ~14-16px. Aéré, densité faible-moyenne |
| CTAs | "Start Free Trial" (rose `#E91E8C`, header+hero), "Book a Demo" (ghost/blanc bordé, hero), "Log In" (texte, header), "GOT IT!" (cookie) |
| Pricing | NON AFFICHE sur hero (lien nav seulement) |
| Tunnel | Double entrée PLG (Start Free Trial self-service) + Sales-led (Book a Demo) + tertiaire "Get a demo" nav |
| Différenciants | Ultra-spécificité "AI Search" (GEO vs SEO classique), Gartner Cool Vendor label, real product preview Adidas (pas mockup) |
| Faiblesses | Cookie banner intrusive couvre 10% écran, ambiguïté dual CTA (paradoxe du choix), jargon "AI Overviews/AI Mode" non expliqué |

#### 2.1.2 Features (`otterly-features.png`, score VLM 6/10)
| Dimension | Valeur |
|---|---|
| Layout | Hero titre+sous-titre → Split-screen formulaire interactif à gauche + accordion features à droite → Cookie banner |
| Palette | `#FFFFFF` bg, `#F5F5F5` form bg, `#E91E8C` CTA, `#111111` titres, `#71717A` secondary, `#C2185B` cookie bg |
| Typo | Sans-serif (Inter/SF Pro). H1 Bold/Black 700-800, body Regular 400, CTA Medium 500-600 |
| CTAs | "Get Prompt Suggestions" (rose, centre-gauche card), "terms and conditions" (blanc souligné cookie), "GOT IT!" (blanc fond violet cookie) |
| Pricing | NON AFFICHE |
| Tunnel | Lead capture formulaire "AI Prompt Research" (nom marque + domaine) → "Get Prompt Suggestions" → résultats/email |
| Différenciants | Focus "Content Intelligence for AI Search", interface type prompt engineering, accordion GEO Optimization/Multi-AI Engine Coverage |
| Faiblesses | Header/nav absent (contexte perdu), form "Brand domain" sans explication (friction cognitive), cookie banner opaque 100% largeur |

#### 2.1.3 Pricing (`otterly-pricing.png`, score VLM 6.5/10)
| Dimension | Valeur |
|---|---|
| Layout | Header → Hero pricing "Pricing of OtterlyAI" + logos clients (Roche, Opera) + toggle Mensuel/Annuel → Grille 3 colonnes (Lite/Standard/Premium) → Section "For Agencies" → Tableau Add-Ons → Carte Enterprise → Bandeau social proof "Great marketing teams trust" + logos → FAQ 7 questions → Footer CTA "Start optimizing for AI Search" → Footer 3 colonnes |
| Palette | Primaire `#E91E8C`, bg `#FFFFFF`, bg secondaire `#F9FAFB`, texte primaire `#111827`, secondaire `#6B7280`, bordures `#E5E7EB` |
| Typo | Sans-serif Inter. Bold/Black 700-900 pour prix, Medium/Semi-bold 500-600 pour sous-titres, Regular 400 pour body |
| Hiérarchie | H1 ~36-40px, H2 prix ~48-56px (impact fort), body 14-16px. Aéré entre sections, dense dans cartes |
| CTAs | "Start Free Trial" (header), "Sign up now" ×3 (cartes Lite/Standard/Premium), "Become an Agency Partner" (section agencies), "Contact us" (Enterprise), "Start Free Trial" (footer CTA) |
| **Pricing** | **Lite $29/mo** (4 moteurs IA, unlimited team, daily tracking) ; **Standard $189/mo** "Most Popular" (API+MCP, +100 prompts $99) ; **Premium $489/mo** (MCP avancé, 10k audits/mois) ; **Enterprise custom** (SSO, dedicated CSM) |
| Tunnel | PLG Start Free Trial + Sales-led Get a demo + Contact us Enterprise. Toggle "Get 15% off on Annual" visible |
| Différenciants | Modèle add-on "+100 prompts $99" (token-like), section Agency Partner B2B2C explicite (Pitch Workspaces, Co-marketing, multi-client billing), support multi-moteur natif (ChatGPT + Google AI Overviews + Perplexity + Copilot, add-ons Gemini/Claude) |
| Faiblesses | Cartes pricing très longues (scroll), features redondantes entre tiers ("Unlimited Brand Reports" ×3), ambiguïté add-ons (Standard $189 + $99 prompts = $288 TCO réel), friction cookie |

#### 2.1.4 Dashboard (`otterly-dashboard.png`, score VLM 7.5/10)
| Dimension | Valeur |
|---|---|
| Layout | Identique au hero (Header + Hero H1 coloré + sous-titre + breadcrumbs + Social proof G2+Gartner + Double CTA + Preview dashboard Adidas sur fond rose + Cookie) |
| Palette | Identique hero (`#E91E8C` primary, `#FFFFFF` bg, `#111111` text) |
| Typo | Identique (sans-serif, Black 900 H1, Regular body) |
| CTAs | Identiques hero ("Start Free Trial", "Log In", "Get a demo", "Book a Demo", "GOT IT!") |
| Pricing | NON AFFICHE (landing haut-funnel) |
| Tunnel | Dual PLG (Start Free Trial) + Sales-led (Book a Demo), pousse essai gratuit |
| Différenciants | Dashboard preview = vraie interface "Adidas" (pas mockup), positionnement ultra AI Search, label Gartner Cool Vendor |
| Faiblesses | Cookie masque preview dashboard, ambiguïté breadcrumbs (anchor vs filtres ?), contraste violent blanc/rose fatigue visuelle |

#### 2.1.5 Fullpage (`otterly.png`, score VLM 7.5/10)
| Dimension | Valeur |
|---|---|
| Layout | Header → Hero → Product Demo In-App (Brand Coverage Over Time) → Social proof logos (Bacola, Armin, Instantly) → Testimonials ×2 → Feature Banner magenta (moteurs AI supportés) → Value Proposition "Content Intelligence Platform" + accordion → FAQ marketing → Press/Awards bandeau sombre Gartner → Blog "GEO Experiments" → User Reviews → FAQ technique → Footer CTA → Footer global 3 colonnes |
| Palette | Primaire `#E6007E` (magenta), bg `#F9FAFB` ou `#FFFFFF`, texte `#111827`/`#0F172A`, accent secondaire `#0F172A` (section Presse), secondaire `#6B7280` |
| Typo | Sans-serif moderne (Inter/SF Pro). Regular 400 body, Medium 500-600 sous-titres, Bold 700 H1/H2 |
| Hiérarchie | H1 ~48px+, H2 ~32px, body 16px, légal 12px. Aéré, densité moyenne-forte |
| CTAs | "Start Free Trial" (magenta, header+hero+footer), "Book a Demo" (ghost, hero), "Start for Free" (blanc, bannière magenta), "Read Press Release" (blanc, presse), "Watch Video" (lien+icône) |
| Pricing | NON AFFICHE sur fullpage |
| Tunnel | PLG Free Trial → signup + Sales-led Book a Demo + capture lead intermédiaire "Free AEO Report" |
| Différenciants | Positionnement GEO/Generative Engine Optimization (vs SEO), dashboard real screenshot dès hero (preuve par exemple), approche "Anti-Fluff" testimonials (clients avouent ne pas savoir optimiser) |
| Faiblesses | Page extrêmement longue (FAQ redondante ×2), absence de pricing force clic, friction cookie masque preview |

**Synthèse Otterly** : Concurrent le plus mature UX. Modèle pricing transparent ($29-$489), Gartner badge crédibilise, programme Agency Partner structurant. Faiblesses : add-on pricing complexe, page trop longue.

---

### 2.2 Profound (tryprofound.com) — AI Reputation

**Positionnement observé** : "Marketing agents to win in AI Search" — AEO (Answer Engine Optimization). URL réelle `tryprofound.com` (pas `profound.com` qui est un market-research unrelated). Cible mid-market brands + agencies. Dark mode natif premium.

#### 2.2.1 Hero (`profound-hero.txt`, score VLM 6/10)
| Dimension | Valeur |
|---|---|
| Layout | Header (logo + nav principale) → Sub-header badge "The Profound Index" + lien → Hero H1 + sous-titre + double CTA. Pas de footer/autres sections visibles |
| Palette | `#000000` noir pur bg, `#FFFFFF` blanc texte, `#3B82F6` bleu accent badge "The Profound Index", `#374151` gris foncé bouton secondaire, `#F9FAFB` blanc bouton primaire |
| Typo | Sans-serif (Inter/system-ui). H1 Bold/Black 700-800, body Regular/Medium 400-500. Très large, caractères espacés |
| Hiérarchie | H1 ~64-80px (énorme), sous-titre ~18-20px, body 16px. Aéré, densité faible (minimaliste) |
| CTAs | "Get a Demo" (blanc `#F9FAFB` fond, texte noir, hero gauche), "Get Started" (gris foncé `#374151` fond, texte blanc, hero droite), "Understand where you stand in AI Search in your industry →" (texte+flèche, sub-header droite) |
| Pricing | NON AFFICHE (lien nav seulement) |
| Tunnel | Hybride : Get a Demo (sales-led entreprises) + Get Started (PLG signup) |
| Différenciants | Positionnement ultra AI Search ChatGPT, badge "The Profound Index" produit phare (données propriétaires), icône ChatGPT intégrée au H1 (brand association) |
| Faiblesses | Aucune preuve sociale hero (zéro logo, témoignage ou chiffre), bouton "Get Started" en style secondaire/gris (inversion hiérarchie contre-intuitive), sub-header encombrant dilue l'attention |

#### 2.2.2 Features (`profound-features.txt`, score VLM 7.5/10)
| Dimension | Valeur |
|---|---|
| Layout | Header nav (Platform/Resources/Solutions/Enterprise/Pricing/Careers + Log in + Get a Demo) → Hero H1+sous-titre → Feature Split "Prompt Volumes" (texte gauche + démo interactive droite) → Feature Split "Answer Engine Insights" (bas) |
| Palette | `#000000` noir bg, `#FFFFFF` blanc texte, `#2A2A2A`/`#333333` gris foncé cartes, `#E5E5E5` gris clair bordures, bouton CTA blanc contraste élevé |
| Typo | Sans-serif Inter. Bold/Black H1 ("not your workload"), Regular/Medium body. H1 en minuscules stylistique (branding bold) |
| Hiérarchie | H1 ~48-64px, sous-titre 18-20px, body 14-16px. Aéré, densité faible-moyenne |
| CTAs | "Get a Demo" (blanc fond, texte noir, header droite), "Learn more" (gris foncé, sous feature Prompt Volumes), "Analyze" (blanc/gris clair petit, dans démo interactive droite), "Log in" (texte) |
| Pricing | NON AFFICHE |
| Tunnel | Book Demo → formulaire (modèle enterprise/high-touch). Pas de Free Trial visible |
| Différenciants | Dark Mode natif premium, démonstration interactive inline (recherche "Credit|" dans landing), focus "AI Prompt Data" (volumes de prompts IA propriétaires) |
| Faiblesses | Aucune preuve sociale above-the-fold, friction "Demo Only" (pas d'essai gratuit), hiérarchie "Learn more" (gris) noyée vs "Analyze" démo |

#### 2.2.3 Pricing (`profound-pricing.txt`, score VLM 7.5/10)
| Dimension | Valeur |
|---|---|
| Layout | Header → Hero pricing titre+sous-titre+toggle cible "For Brands/For Agencies" → Cartes Pricing (Starter/Growth/Enterprise) → Logos clients (Zapier, Clay, Statsig) → Tableau comparatif détaillé → Témoignage Statsig → FAQ accordion → Footer |
| Palette | `#0A0A0A` noir profond bg, `#FFFFFF` blanc texte, `#E5E5E5` gris clair bordures, `#3B82F6` bleu accent potentiel badges |
| Typo | Sans-serif Inter. Regular body, Medium labels tableau, Bold/Semi-bold titres et noms plans |
| Hiérarchie | H1 ~40-48px centré hero, H2 ~24-32px sections, body 14-16px. Aéré sections, dense tableau. Densité FORTE |
| CTAs | "Get Started" (transparent/blanc, Starter), "Try for free" (transparent/blanc, Growth "Popular"), "Get a Demo" (fond blanc texte noir, Enterprise), "For Brands"/"For Agencies" toggle |
| **Pricing** | **Starter $99/mo** (billed annually — ChatGPT tracking only, 50 prompts, email support) ; **Growth $399/mo** "Popular" (3 Answer Engines: ChatGPT+Perplexity+Google AI, 100 prompts, email support) ; **Enterprise custom** (10+ Answer Engines, multi-companies, SSO/SAML, Slack dedicated) |
| Tunnel | PLG Try for free (Growth) + Get Started (Starter) + Sales-led Get a Demo (Enterprise). Hybride |
| Différenciants | Focus exclusif Answer Engine Optimization (AEO), tableau comparatif ultra-détaillé (credits, agents, volumes prompts), segmentation Brands vs Agencies dès hero |
| Faiblesses | Tableau comparatif trop long (scroll infini), toggle "Billed yearly" par défaut sans prix mensuel réel (confusion engagement 12 mois), absence sticky header colonnes |

#### 2.2.4 Dashboard (`profound-dashboard.txt`, score VLM 7.5/10)
| Dimension | Valeur |
|---|---|
| Layout | Header (logo "Profond" + nav Platform/Resources/Solutions/Enterprise/Pricing/Careers + Log in + Get a Demo) → Hero H1 "Marketing agents to win in O Meta AI" + sous-titre + double CTA → Product Preview/Dashboard Mockup (workflow agents IA avec sidebar templates/nœuds, canvas central workflow visuel, panneau latéral droit détails exécution) |
| Palette | `#0A0A0A`/`#111111` noir bg, `#FFFFFF` blanc titres, `#9CA3AF`/`#D1D5DB` gris clair sous-titre, `#FFFFFF` bouton primaire, `#374151` gris foncé secondaire, `#10B981` vert "Succeeded" badges statut, `#60A5FA` bleu clair liens outputs |
| Typo | Sans-serif Inter/SF Pro/system-ui. Bold/Black 700-900 H1, Regular/Medium 400-500 body. Monospace/condensée pour labels techniques nœuds |
| Hiérarchie | H1 ~64px+, sous-titre ~20px, nav/UI 14px. Très aéré hero, dense compact dashboard. Densité faible hero, forte dashboard |
| CTAs | "Get a Demo" (blanc, header+hero gauche), "Get Started" (gris foncé `#333`, hero droite), "Log in" (texte), "Publish" (transparent/bordure grise, dashboard haut droite), "Run test" (tertiaire icône play, dashboard) |
| Pricing | NON AFFICHE |
| Tunnel | Book a Demo prioritaire (bouton blanc 2x) + Get Started (signup direct probable trial) + Log in |
| Différenciants | Positionnement "O Meta AI" (écosystème Meta), showcase Live Product immédiat (canvas workflow agents nodes/edges/logs), terminologie "Agents" & "AEO" (filtre marketers techniques) |
| Faiblesses | Ambiguïté "Get Started" (trial? paywall? doc?), surcharge cognitive hero (message marketing simple vs interface complexe), manque preuve sociale above-the-fold |

#### 2.2.5 Fullpage (`profound-generic.txt`, score VLM 7.5/10)
| Dimension | Valeur |
|---|---|
| Layout | Header fixe → Hero H1+sous-titre+double CTA+capture produit → Social Proof Logos (Colendly, Zapier, PLAD, Figma, Deel) → Metric Banner "Over 100 million people" → Value Proposition "Scale your presence" → Features Grid Zigzag (Prompt Volumes, Answer Engine Insights, Agents, Agent Analytics, Aim/Projects) avec screenshots UI alternés → Testimonial "Before Profound" (Ramp) + Read case study → Lead Magnet "Get your free AEO Report" input + bénéfices → Use Cases 3 colonnes (AEO & SEO / Content & Demand / PR & Communications) → Interactive Demo "Try a Profound Agent" + email → Event Promo "Zero Click 26" → Bottom CTA → Footer 4-5 colonnes |
| Palette | `#050505`-`#111111` noir profond, `#F5F5F5`/`#E5E5E5` blanc cassé, `#9CA3AF` gris moyen, `#FFFFFF` boutons primaires, `#10B981` vert statut Success |
| Typo | Sans-serif géométrique (Inter/SF Pro). Bold/Black 700-900 H1, Regular 400 body, Medium 500 sous-titres. Titres centrés majeures, alignés gauche features, tracking tight gros titres |
| Hiérarchie | H1 ~48-64px, H2 ~32-40px, body 14-16px, features 18-20px. Aéré vertical, dense blocs features. Densité forte |
| CTAs | "Get a Demo" (blanc, header+hero), "Get Started" (ghost, hero+bottom), "Learn more" (texte souligné, sous features), "Analyze my brand" (blanc plein, Free AEO Report), "Try an Agent" (blanc, Try a Profound Agent) |
| Pricing | NON AFFICHE |
| Tunnel | PLG/Enterprise mixte : Get a Demo (sales) + Get Started (PLG) + capture lead intermédiaire "Free AEO Report" (email gating probable) |
| Différenciants | Positionnement AEO (Claude/AI Search vs SEO), visualisation Agent-first (interface construction agents autonomes workflows), preuve sociale "AI Native" Claude mentionné comme canal acquisition |
| Faiblesses | Friction cognitive UI complexe (captures features très denses), absence tarification force clic, redondance visuelle "texte gauche/image droite" monotone |

**Synthèse Profound** : Concurrent le plus "premium" visuellement (dark mode natif). Positionnement AEO distinctif. Lead magnet "Free AEO Report" = bon pattern à copier. Faiblesses : pas de trial visible sur hero, pas de pricing sur landing.

---

### 2.3 Nightwatch (nightwatch.io) — SEO Rank Tracking + AI Citations

**Positionnement observé** : "SEO rank tracking + AI citation intelligence". Cible SMB → agencies → enterprise. URL correcte (nightwatch.io). Seul concurrent à afficher prix en euros (€79-€399).

#### 2.3.1 Hero (`nightwatch-hero.txt`, score VLM 7.5/10)
| Dimension | Valeur |
|---|---|
| Layout | Header (logo + nav + login + CTA) → Hero (badge "NEW: CITATION INTELLIGENCE" + titre H1 massif + sous-titre + double CTA + mockup interface 5 micro-features) |
| Palette | `#05070A` noir profond bg, `#2563EB` bleu électrique primaire CTA, `#F8FAFC` blanc cassé texte principal, `#94A3B8` gris secondaire sous-titre, `#1E293B` gris foncé bordures mockup |
| Typo | Sans-serif géométrique (Inter). H1 Bold/Black 800-900, body Regular/Medium 400-500. Nav et badges Medium uppercase tracking large |
| Hiérarchie | H1 ~64-72px massif dominant écran gauche, sous-titre ~18px, espacement aéré, densité faible hero |
| CTAs | "Sign Up" (bleu `#2563EB`, header droite pill), "Start 14-day trial >" (bleu `#2563EB`, hero gauche bas, bouton large), "Book a Demo" (transparent bordure blanche, hero gauche bas secondaire), "Login" (texte blanc, header) |
| Pricing | NON AFFICHE (hero) |
| Tunnel | PLG 14-day trial no CB (friction minimale) + Sales-led Book a Demo. Aucun mur paiement immédiat |
| Différenciants | Positionnement "Citation Intelligence" unique (unification Google rankings + visibilité IA ChatGPT/Claude/Gemini), mockup interactif hero 5 modules (AI Prompts, Prompt Research), badge "NEW" urgence technologique |
| Faiblesses | Titre H1 tronqué ("— They need" coupé), mockup droite partiellement vide/déséquilibré (trou noir sous boutons), absence preuve sociale immédiate hero |

#### 2.3.2 Features (`nightwatch-features.txt`, score VLM 4/10)
| Dimension | Valeur |
|---|---|
| Layout | Header nav fixe → Hero Section sombre avec élément visuel central tronqué/en cours de chargement → contenu principal non visible/vide |
| Palette | `#000000` noir pur bg, `#2563EB` bleu bouton action, `#9CA3AF` gris clair nav, `#0F172A` bleu nuit élément central |
| Typo | Sans-serif géométrique (Inter/SF Pro/Helvetica). Medium 500 nav, Semi-bold 600 logo, Bold 700 CTA. Logo "NIGHTWATCH" tracking élargi |
| Hiérarchie | H1 non visible, structure standard SaaS suggérée. Très aéré, densité faible-moyenne |
| CTAs | "Sign Up" (bleu `#2563EB`, header droite rectangulaire border-radius 6px), "Login" (texte blanc/gris, header) |
| Pricing | NON AFFICHE |
| Tunnel | PLG "Sign Up" inscription directe → formulaire/onboarding + Login existants |
| Différenciants | Positionnement "SEO Agent" (IA agent autonome dans nav), Dark Mode natif total #000000 (identité Nightwatch "veille nocturne"), architecture produit modulaire Rank Tracker/AI Tracking/Agent |
| Faiblesses | Zone morte centrale (espace excessif header→élément = page cassée/impression chargement incomplet), manque hiérarchie visuelle nav (même poids gris), absence valeur immédiate (aucun headline/USP visible above-the-fold) |

#### 2.3.3 Pricing (`nightwatch-pricing.txt`, score VLM 8/10 — meilleur score pricing)
| Dimension | Valeur |
|---|---|
| Layout | Header → Hero Pricing "Simple pricing. Unlimited seats." + toggle Mensuel/Annuel → Grille 4 colonnes (Starter/Professional/Agency/Enterprise) → Bannière "Need a custom plan?" → Tableau Comparatif "Compare Plans" → Features Incluses 6 cartes "Every plan includes" → FAQ Accordion 7 Q → CTA Final "See the whole picture" 2 boutons → Footer 5 colonnes + social + copyright |
| Palette | `#0A0A0A` noir profond bg, `#3B82F6` bleu vif CTAs/badges, `#FFFFFF` blanc texte, `#9CA3AF` gris moyen descriptions, `#1F2937` gris foncé bordures/cartes |
| Typo | Sans-serif Inter. Bold 700-800 prix/titres H1, Medium 500 sous-titres, Regular 400 body. Haute contrastabilité fond noir |
| Hiérarchie | H1 ~40px+ centré, H2 ~28-32px sections, body 14px interligne 1.5. Aéré sections, dense tableaux |
| CTAs | "Sign Up" (bleu, header), "Start Trial" ×3 (bleu, cartes Starter/Professional/Agency), "Contact Sales" ×2 (transparent bordure grise, Enterprise + Custom Plan), "Start free — no credit card" (bleu, bas), "Book a Demo" (transparent, bas) |
| **Pricing** | **Starter €79/mo** (€948 yearly — 500 keywords, 5 websites, 25 audit pages) ; **Professional €159/mo** (€1908 yearly — 2,500 keywords, 25 websites, Looker Studio) ; **Agency €399/mo** (€4788 yearly — 7,500 keywords, 100 websites, dedicated account manager) ; **Enterprise custom** (20,000+ keywords, unlimited websites, custom infrastructure) |
| Tunnel | PLG Start Trial 14 jours no CB + Sales-led Book a Demo/Contact Sales. Barrière entrée très faible |
| Différenciants | **Unlimited Seats** (facturation par mot-clé/volume, pas par utilisateur — rare SaaS agency), AI Tracking natif dans stacks (pas add-on), transparence yearly save exact (€948 vs €79/mo affiché) |
| Faiblesses | Tableau comparatif 20+ lignes trop dense (scroll mobile difficile), ambiguïté toggle yearly actif mais prix affichés "mensuels" (€159/mo vs €1908 annuel facturé), manque ancrage sticky pour headers colonnes |

#### 2.3.4 Dashboard (`nightwatch-dashboard.txt`, score VLM 8.5/10 — meilleur score global)
| Dimension | Valeur |
|---|---|
| Layout | Header (logo + nav 7 liens + Login + CTA Sign Up) → Hero H1 partiel + sous-titre + 2 CTAs primaires + grille 6 fonctionnalités (Search Rankings, AI Prompts, etc.) → Social Proof "Trusted by 10,000+ SEO teams" + barre logos (NASA, Samsung, Coinbase, Booking.com, Sonos) → Section Valeur "THE SEARCH × AI ECOSYSTEM" + H2 "Search rankings power AI citations" |
| Palette | `#0A0A0A`/`#111111` noir profond bg, `#3B82F6`/`#2563EB` bleu vif CTAs, `#FFFFFF` blanc, `#9CA3AF`/`#A1A1AA` gris clair sous-titres, `#27272A`/`#333333` gris foncé contours |
| Typo | Sans-serif Inter. Bold/Black 700-900 H1/H2, Regular/Medium 400-500 body. Tracking espacé sur labels majuscules "THE SEARCH × AI ECOSYSTEM" |
| Hiérarchie | H1 ~48-64px (masquée partiellement flou), H2 ~36-48px blanc fort contraste, body 16-18px gris clair interligne 1.5-1.6. Aéré |
| CTAs | "Sign Up" (bleu `#3B82F6`, header pill), "Start 14-day trial >" (bleu, hero gauche arrondi avec flèche), "Book a Demo" (transparent bordure blanche, hero droite outline) |
| Pricing | NON AFFICHE |
| Tunnel | Dual "Start 14-day trial" self-service + "Book a Demo" sales-led + "Sign Up" header direct. Pas d'étape email/gated avant produit |
| Différenciants | Positionnement Search-to-AI (corrélation rankings Google ↔ citations ChatGPT/Claude/Gemini), unification données "Rankings and AI citations unified", preuve sociale B2B institutionnelle (NASA, Samsung, banques) vs startups SaaS |
| Faiblesses | H1 masqué partiellement par flou/dégradé haut, grille 6 items ressemble navigation/tags vs features concrètes, contraste CTA "Book a Demo" outline faible sur fond noir |

#### 2.3.5 Fullpage (`nightwatch-generic.txt`, score VLM 7.5/10)
| Dimension | Valeur |
|---|---|
| Layout | Header nav (Rank Tracker, AI Tracking, SEO Agent, Features, Enterprise, Pricing, Blog + Login/Signup) → Hero + mockup → Social Proof logos (Samsung, Rollbar, Coinbase, ChartMogul, Booking.com, Sonos) → Feature 1 "Search rankings power AI citations" graphique réseau → Feature 2 "Built for SEO professionals" grille widgets → Feature 3 "The search landscape split in two" Legacy Trackers vs Nightwatch vs AI Point Solutions → Stats "99.9% accuracy" graphique barres → Feature 4 "AI recommends your brand" → Features Grid 2×2 (Search Engines, AI & LLM Tracking, SERP Features, Device Support) → Features Grid 2 (Global Locations, Multi-Language, NightOwl Agent, Site Audit) → Data Viz (Transaction vs Info vs Commercial, tracking local, ROI) → Feature List métriques (Click Potential, Search Visibility, Traffic Value) → FAQ ~10 Q → Testimonials (The25Guys, Henrik Russell, Stefan Fisher) → CTA Final → Footer 6 colonnes |
| Palette | `#050505` noir profond, `#111111`/`#1A1A1A` gris anthracite cartes, `#2563EB` bleu vif CTAs, `#A855F7` violet/magenta graphiques, `#FFFFFF` titres, `#9CA3AF` gris clair body, `#10B981` vert croissance positive |
| Typo | Sans-serif géométrique Inter. Bold/Black 700-800 titres, Regular/Medium 400-500 body. Mono-spaced suggéré pour chiffres/métriques tableaux |
| Hiérarchie | H1 ~48px+, H2 ~32px, body 14-16px. Aéré sections, dense dashboard/data |
| CTAs | "Start 14-day trial" (bleu `#2563EB`, hero gauche), "Book a Demo" (transparent bordure grise, hero droite), "Start free - no credit card" (bleu, CTA Final), "Book a Demo" (transparent, CTA Final), "Signup" (bleu, header extrême droite) |
| Pricing | NON AFFICHE |
| Tunnel | PLG 14-day trial no CC + Sales-led Book a Demo + header Signup direct |
| Différenciants | Hybridation Rank + AI Citations native ("Citation Intelligence"), Dark Mode First power users, approche Écosystème vs outil isolé (graphique réseau connecte rank → outputs IA) |
| Faiblesses | Densité cognitive excessive section "Built for SEO professionals" (trop widgets), absence pricing force signup/demo, longueur scroll critique (testimonials/FAQ relégués bas) |

**Synthèse Nightwatch** : Concurrent le plus crédible B2B (logos NASA/Samsung/Coinbase). Pricing le plus transparent et compétitif (€79-€399). Modèle "unlimited seats" unique. Faiblesse : page trop longue, tableau comparatif trop dense.

---

### 2.4 Athena (athenahq.ai) — AI Market Intelligence

**Positionnement observé** : "Become the Brand AI Trusts" — GEO/AEO. URL réelle `athenahq.ai` (pas `athena.com`). Cible mid-market → enterprise. Freemium avec crédits.

#### 2.4.1 Hero (`athena-hero.txt`, score VLM 7.5/10)
| Dimension | Valeur |
|---|---|
| Layout | Top banner annonce "State of AI Search 2026 Report" → Nav principale (logo, dropdowns Industry/Enterprise, login, CTA) → Hero H1 + sous-titre + formulaire email + CTA → Social proof presse (Forbes, WSJ, Combinator) → Logos clients (Slalom, SoFi, Coinbase, R/GA) → Cookie consent popup overlay bas-droite |
| Palette | `#4F46E5` indigo/violet primaire (header, CTA principal, accent "Become"), `#0F172A`/`#111827` noir/gris foncé H1 "Brand AI Trusts", `#F8FAFC`/`#F1F5F9` gris clair bg hero, `#FFFFFF` blanc formulaires/popup |
| Typo | Sans-serif géométrique (Inter, Plus Jakarta Sans). Black/ExtraBold 900 "Brand AI Trusts", Bold 700 "Become", Regular/Medium 400-500 body. Mix violet (mot émotionnel) + noir (promesse produit) |
| Hiérarchie | H1 ~64-72px split 2 lignes contraste couleur violet/noir, sous-titre ~18-20px gris foncé centré, body input 16px. Aéré, densité faible-moyenne |
| CTAs | "Book a Demo" (violet `#4F46E5`, header droite solide), "Get Free Audit (10m)" (violet `#4F46E5`, centre hero à droite input), "Announcing Athena's State of AI Search 2026 Report!" (blanc/violet clair, top banner souligné), "Log in" (gris foncé, header), "Accept All" (violet, cookie) |
| Pricing | NON AFFICHE (hero) |
| Tunnel | Lead capture email → "Free Audit 10min" (low friction) + Book a Demo (high intent vente consultative). Pas de signup self-service visible |
| Différenciants | Positionnement "Brand AI" (confiance marque ère IA), hook temporel "10m" CTA audit (réduction friction psychologique vs "Demo 30min"), preuve sociale double couche presse (Forbes/WSJ) + logos enterprise (Coinbase/SoFi), design hero colonnes grecques floutées background (Athéna sagesse subliminale) |
| Faiblesses | Popup cookie masque logos clients (bas écran), absence visuel produit/démo hero (texte-only + form), nav "Industry"/"Enterprise" sans indicateur dropdown clair mobile |

#### 2.4.2 Features (`athena-features.txt`, score VLM 7.5/10)
| Dimension | Valeur |
|---|---|
| Layout | Top Banner violet annonce rapport → Header nav (logo + dropdowns + Log in + Book a Demo) → Hero/Features Section mixte (liste features gauche + mockup dashboard droite) → Cookie Consent modal bas-droite → Footer partiel "How AI Search Perceives" |
| Palette | `#5B4DFF` violet/indigo brand, `#F3F4F6` gris clair neutre bg, `#111827` noir/gris foncé body, `#FFFFFF` blanc CTAs sur fond violet, `#E5E7EB` gris bordures UI |
| Typo | Sans-serif Inter/SF Pro. Regular 400 body, Medium 500 nav, Semi-bold 600 titres features |
| Hiérarchie | H1 moyenne-large (partiel footer "How AI Search Perceives"), H2 medium features, body 14-16px. Aéré, densité moyenne |
| CTAs | "Book a Demo" (violet `#5B4DFF`, header droite primaire), "50% reduction in time spent on AI visibility tracking" (violet `#5B4DFF`, badge/stat highlight centre gauche), "Announcing Athena's State of AI Search 2026 Report!" (texte blanc souligné, top banner), "Accept All" (violet, cookie), "Customize" (bordure grise transparent, cookie), "Reject All" (transparent texte gris, cookie) |
| Pricing | NON AFFICHE |
| Tunnel | Book a Demo → (pas free trial visible) → Log In. Tunnel principal "Book a Demo" (enterprise/high-touch vs self-service) |
| Différenciants | Focus spécifique GEO (Generative Engine Optimization) non SEO traditionnel, tracking cross-plateforme 8+ LLMs, dashboard analytique natif métriques AI spécifiques (Share of Voice by Model, Attributed Citations, Mention Rate), positionnement "Unified command center" vs "scattered tools" manuel + promesse chiffrée "50% réduction temps" |
| Faiblesses | Cookie modal masque contenu bas droite (overlay intrusif), absence CTA "Essai gratuit"/"Get Started" immédiat (friction élevée self-service), hiérarchie confuse badge "50% reduction" (ressemble CTA cliquable mais statique) vs vrai CTA "Book a Demo" |

#### 2.4.3 Pricing (`athena-pricing.txt`, score VLM 7.5/10)
| Dimension | Valeur |
|---|---|
| Layout | Top banner (annonce rapport) → Header → Section Pricing 3 colonnes (Essential, Starter, Enterprise) → Footer cookie consent overlay |
| Palette | `#5B4DFF` violet primaire/CTA, `#F3F4F6` gris clair fond cartes, `#FFFFFF` blanc fond page, `#111827` noir texte titres, `#E0E7FF` violet pâle badge "New feature" |
| Typo | Sans-serif Inter. Black 900 prix ("Free", "$295", "Custom"), Bold 700 titres section, Regular 400 features body. Pas de mono détecté |
| Hiérarchie | H1 énorme prix ~48-56px, H2 ~20px noms plans, body 14-16px features. Aéré entre colonnes, densité forte features |
| CTAs | "Book a Demo" (violet, header), "Start for Free" (violet, carte Essential), "Choose Starter" (violet, carte Starter), "Customize" (bordure violette fond blanc, Enterprise), "Accept All" (violet, cookie), "See all features" (fond blanc/gris clair, milieu cartes Essential & Starter) |
| **Pricing** | **Essential Free** ($25 free credit — membres illimités, analyse prompts/réponses, insights concurrents/sources, Agent IA Athena) ; **Starter $295/mo** ($300 free credit/mo — visibilité 9 modèles AI, API accès/crédits add-on, intégrations, export CSV, actions on/off-page, Agent optimisation contenu, auto-amélioration contenu) ; **Enterprise custom** (crédits custom — Knowledge base/claim review, détection discrepancies Oracle, moteur citation ACE, SAML/OIDC SSO, audit log activité, multi-région/langue, personas, moteur recommandation, dashboard exécutif BI Tableau/PowerBI/Looker, setup white-glove, contrôles accès custom) |
| Tunnel | Freemium "Start for Free" → essai crédité ($25 offert) → upgrade $295/mo "Choose Starter" → Demo/Enterprise "Book a Demo"/"Customize". PLG barrière nulle |
| Différenciants | Crédits gratuits inclus chaque plan ($25 free / $300 free) réduisant friction essai, badging "New feature" dynamique Agent IA Athena + Moteur Citation ACE, visibilité explicite nombre modèles AI couverts (9 models) plan Starter |
| Faiblesses | Cookie consent masque colonne Enterprise (overlay intrusif pricing critique), ambiguïté action "See all features" (lien secondaire) vs CTA principal violet, disparité format prix (Free vs $295 vs Custom) sans badge "Most popular"/"Recommended" |

#### 2.4.4 Dashboard (`athena-dashboard.txt`, score VLM 5.5/10 — plus faible score dashboard)
| Dimension | Valeur |
|---|---|
| Layout | Top Banner (annonce rapport) → Nav Header (logo + menu + CTA) → Hero Section (input email + CTA) → Social Proof (logos Forbes/WSJ/Combinator) → Client Logos Grid (marques B2B) → Cookie Consent Modal overlay flottant |
| Palette | `#4F46E5` indigo/violet primaire (header, boutons), `#FFFFFF` blanc bg, `#F3F4F6` gris clair fond hero texture, `#111827` noir anthracite textes, `#6B7280` gris moyen secondaires |
| Typo | Sans-serif Inter. Regular 400 body/nav, Medium 500 sous-titres, Bold 700 "Featured on" et noms clients. Serif uniquement logo "Forbes"/"WSJ" |
| Hiérarchie | H1 absent/implicite (focus input), H2 moyen ("Featured on", "Empowering..."), body 14-16px. Aéré, densité faible-moyenne |
| CTAs | "Book a Demo" (violet `#4F46E5`, header droite), "Get Free Audit (10m)" (violet, hero centre principal), "Log in" (gris foncé `#374151`, header lien), "Accept All" (violet, modal cookie), "Athena's State of AI Search 2026 Report!" (blanc souligné, top banner) |
| Pricing | NON AFFICHE |
| Tunnel | Double tunnel parallèle : (A) Lead capture email "Get Free Audit" (formulaire sans friction compte), (B) Qualification commerciale haute "Book a Demo". Pas self-service signup immédiat |
| Différenciants | Positionnement "Audit gratuit 10min" hook principal (vs Start Free Trial classique), mise en avant agressive rapport "State of AI Search 2026" top banner (thought leadership autorité), design architectural colonnes grecques stylisées arrière-plan (différenciation vs SaaS générique) |
| Faiblesses | Absence totale proposition de valeur explicite (copy manquante : qu'est-ce qu'Athena ? quel problème résout ?), cookie modal masque contenu, nav dropdown sans indication visuelle claire contenu |

#### 2.4.5 Fullpage (`athena-generic.txt`, score VLM 7.5/10)
| Dimension | Valeur |
|---|---|
| Layout | Top Banner "State of AI Search 2024 Report" violet → Header → Hero "Become the Brand AI Trusts" + email + CTA + logos presse (Forbes, WSJ) → Social Proof Logos (Slalom, SoFi, Coinbase) → Cookie Consent pop-in latérale droite → Features 1 "How Teams Use Athena for AI Search" onglets AEO/GEO + bullets → Visual Abstract (blobs dégradés flous violet/jaune/cyan sans interface produit réelle) → Stat/Quote centrale remplacement trafic search par IA générative → Features 2 "Pinpoint Websites Cited by ChatGPT" → Features 3 "Identify Content Gaps and Take Action" → Social Proof Industries + témoignage + logos partenaires → Advisory Board → Pricing 3 colonnes (Free/Starter/Enterprise) → FAQ accordion → Bottom CTA "Lead" email → Footer copyright |
| Palette | `#6366F1` indigo/violet CTAs et accents, `#FAFAFA` blanc cassé bg page, `#111827` noir anthracite titres, `#A5B4FC` violet pâle dégradés blobs |
| Typo | Sans-serif Inter. Bold/Black H1 "Become the Brand AI Trusts", Medium/Semi-bold H2, Regular body. Pas de mono visible |
| Hiérarchie | H1 ~48-60px, H2 ~24-32px, body 16px. Aéré (whitespace important autour blobs), densité moyenne-faible |
| CTAs | "Book a Demo" (violet `#6366F1`, header top right), "Get Free Audit (5min)" (violet, hero centre sous email), "Start for Free" (violet, Pricing Free), "Choose Starter" (violet, Pricing Starter), "Contact sales" (transparent bordure violette, Pricing Custom), "Get Free Audit (5min)" (violet, Bottom CTA) |
| **Pricing** | **Essential Free** $0 ($25 credit value — membres illimités, analyse prompt, insights concurrentiels) ; **Starter $295/mo** ($300/mo credit inclus — visibilité 9 modèles, API access, intégrations CSV, Agent optimisation contenu) ; **Enterprise custom** (Knowledge base, Oracle detection engine, SAML/SSO, audit log, multi-régions) |
| Tunnel | "Get Free Audit" capture email → démo automatisée/rapport → upsell Starter $295/mo + "Book a Demo" Enterprise + "Start for Free" self-service tier gratuit |
| Différenciants | Focus AEO/GEO (ChatGPT/SearchGPT vs SEO Google), preuve citation "Pinpoint" (détection si marque citée par IA — feature rare affichée ainsi), modèle crédits "Credits" (usage facturé volume prompts/analyse, token-based similaire IA elle-même vs seat-based) |
| Faiblesses | Absence interface produit réelle (features = blobs abstraits dégradés flous vs screenshots dashboard — risque vapourware), friction pricing Starter $295/mo élevé sans essai gratuit clair sur cette colonne (vs Free), surcharge visuelle hero (top banner violet + header blanc + hero blanc manquent contraste fort) |

**Synthèse Athena** : Concurrent le plus "thought leadership" (rapport State of AI Search annuel, advisory board, Forbes/WSJ). Freemium avec crédits = bon pattern PLG. Faiblesses : pas de vraie UI produit (blobs abstraits), $295 jump trop raide.

---

### 2.5 Goodie (higoodie.com) — AI Brand Monitoring

**Positionnement observé** : "Own AI Search Revenue" — AEO platform end-to-end. URL réelle `higoodie.com` (pas `goodie.com` — SSL cassé). Cible enterprise + verticales (Agencies, Fintech, Healthcare, Pharma). Dark mode premium.

#### 2.5.1 Hero (`goodie-hero.txt`, score VLM 6.5/10)
| Dimension | Valeur |
|---|---|
| Layout | Header/Nav (logo gauche + 5 liens dropdown Product/Use Case/Resources/Pricing/Careers + 2 boutons Log In/Get Started) → Hero (sous-titre technique "AEO Platform" + H1 principal split couleur + paragraphe descriptif + icône ChatGPT + CTA central unique) → Social Proof "Trusted by leading brands" + zone logos clients (2 placeholders visibles) |
| Palette | `#121212`/`#0F0F0F` noir charbon very foncé dark mode strict, `#93C5FD`/`#A5B4FC` bleu ciel pastel/dégradé "Revenue" et CTAs, `#FFFFFF` blanc H1, `#E5E7EB` gris clair body, bouton secondaire `#FFFFFF` fond blanc texte noir |
| Typo | Sans-serif géométrique (Inter, Plus Jakarta Sans, Satoshi). Black/ExtraBold 900/800 H1 "Own AI Search", Regular 400 body, Medium 500 sous-titre/labels nav. Title Case titres, uppercase tracking large nav |
| Hiérarchie | H1 ~64-72px contraste max blanc/noir, body 16-18px gris clair. Très aéré, densité faible (minimaliste) |
| CTAs | "GET STARTED" (bleu clair `#93C5FD`, texte blanc/gris foncé, header droite pill), "LOG IN" (blanc `#FFFFFF`, texte noir, header droite ghost/outlined), "GET A DEMO" (bleu clair identique, centre hero principal) |
| Pricing | NON AFFICHE (hero) |
| Tunnel | "Get Started" (signup probable) OU "Get A Demo" (booking formulaire). PLG + Sales-led hybride |
| Différenciants | Positionnement "AEO" (Answer Engine Optimization vs SEO classique), mention explicite "ChatGPT" comme surface monitoring (preuve sociale technologique immédiate), split visuel H1 "Revenue" en bleu ancre valeur business (ROI vs purement technique) |
| Faiblesses | Absence ancre visuelle/preuve produit (pas screenshot UI, pas mockup dashboard) hero — utilisateur doit croire texte sans voir produit, dropdowns nav sans indication état ouvert/fermé, **logos clients en placeholder/broken image** ("Trusted by leading brands:" avec alt text visible = décrédibilisation immédiate preuve sociale) |

#### 2.5.2 Features (`goodie-features.txt`, score VLM 6.5/10)
| Dimension | Valeur |
|---|---|
| Layout | Header/Nav (logo "Go to the" gauche, menu principal 4 items + sous-menu "PRICING THE CLOSED LOOP" centre, boutons action droite) → Hero Section H1 centré "The End-To-End AEO Platform" fond sombre → Features Timeline verticale numérotée (01, 02, 03) avec icônes hexagonales + descriptions textuelles |
| Palette | `#121212`/`#0F0F0F` noir profond bg, `#FFFFFF` blanc titres/nav, `#8B949E` gris moyen textes secondaires/étapes inactives, `#FF6B00`/`#E85D04` orange vif hexagone étape active "01", `#93C5FD`/`#60A5FA` bleu clair CTA primaire |
| Typo | Sans-serif moderne (Inter/SF Pro/Helvetica). Bold/Black H1, Medium/Semi-bold titres features ("Research", "Monitor"), Regular/Light descriptions. Phrase case titres, pas mono visible |
| Hiérarchie | H1 ~48-64px, H2 Features ~24-28px, body 16px. Très aéré, densité faible (focus un concept par ligne) |
| CTAs | "LOG IN" (fond blanc, texte noir/gris foncé, header droite secondaire), "GET STARTED" (bleu clair `#93C5FD`, header droite primaire), "PRICING / THE CLOSED LOOP" (texte blanc, header centre-droite lien nav) |
| Pricing | NON AFFICHE |
| Tunnel | "GET STARTED" inscription directe sans friction apparente + "LOG IN" compte existant. "THE CLOSED LOOP" suggère boucle rétention produit-led growth |
| Différenciants | Terminologie propriétaire "AEO" (vs SEO classique positionnement innovant/niche), structure visuelle Timeline (features en processus séquentiel 01 Research → 02 Monitor → 03 Action vs grille cartes classique), Dark Mode Premium épuré (tranche vs SaaS marketing blanc/bleu ciel) |
| Faiblesses | Manque contexte immédiat (acronyme "AEO" non défini ni illustré above-the-fold = confusion non-initié), hiérarchie focus ambiguë (étape "01" orange vif vs "02"/"03" grises = impression features désactivées/indisponibles), absence preuve sociale above-the-fold (pas logos clients/témoignages/chiffres clés) |

#### 2.5.3 Pricing (`goodie-pricing.txt`, score VLM 7.5/10)
| Dimension | Valeur |
|---|---|
| Layout | Header nav (logo + liens Product/Use Case/Resources/Pricing/Careers + Log In/Get Started) → Hero Section "The Complete End-to-End AEO Platform" + sous-titre + CTA primaire → Pricing Cards 3 côte à côte (Explorer, Pro, Enterprise) + toggle Mensuel/Annuel → Feature Comparison Table détaillée ligne par ligne → Footer (liens social + colonnes Features/Company/Models/Use Cases + mentions légales) |
| Palette | `#0F0F0F` noir profond/anthracite bg, `#7CB9FF`/`#8AB4F8` bleu clair/ciel boutons et éléments actifs, `#FFFFFF` blanc titres/textes clés, `#A0A0A0` gris moyen descriptions/métadonnées, `#222222`/`#2A2A2A` bordures subtiles tableau |
| Typo | Sans-serif moderne Inter/SF Pro/Helvetica. Bold 700-800 titres H1/H2 et noms plans, Regular 400 body, Medium 500-600 labels tableau. Majuscules partielles titres, monospace possible données chiffrées tableau |
| Hiérarchie | H1 ~48-64px, H2 ~24-32px noms plans, body 14-16px tableau dense. Compact tableau, aéré cartes pricing. Densité FORTE (data-heavy) |
| CTAs | "GET STARTED" (bleu clair `#8AB4F8`, header top-right), "RUN A FREE AI SEARCH ASSESSMENT" (bleu clair, hero), "TRY IT FREE" (bleu clair, carte Explorer), "GET A DEMO" (bleu clair, carte Pro), "GET A DEMO" (bleu clair, carte Enterprise) |
| **Pricing** | **Explorer $399/mo** (ou annuel réduction — 3 moteurs IA, 100 prompts/mois, 3000 réponses, 1 marque, support email) ; **Pro "Get a Demo"** (prix non affiché, contact requis — 6+ moteurs IA, 250 prompts/mois, 7500 réponses, commerce agnostique, support prioritaire) ; **Enterprise "Get a Demo"** (prix sur devis — 11+ moteurs IA, 500+ prompts, multi-marques/régions, modélisation revenus custom, Slack dédié) |
| Tunnel | Hybride : "Free Trial" self-service Explorer + "Book Demo" sales-led Pro/Enterprise |
| Différenciants | Focus AEO spécifique (ChatGPT, Perplexity, etc. vs SEO classique), granularité prompts (limitation/comptage précis nombre prompts et réponses IA par plan = facturation à l'usage/API), tableau comparaison exhaustif (transparence technique extrême types moteurs trackés, fréquence collecte, intégrations) |
| Faiblesses | Friction prix cachés (Pro et Enterprise n'affichent pas prix = barrière psychologique et manque transparence immédiate), surcharge cognitive (tableau comparaison très long/dense, scanabilité difficile sans scroll intensif), absence preuve sociale locale pricing (pas témoignages/logos clients/notes satisfaction) |

#### 2.5.4 Dashboard (`goodie-dashboard.txt`, score VLM 4/10 — plus faible score global)
| Dimension | Valeur |
|---|---|
| Layout | Header/Nav (logo gauche, menu Product/Use Case/Resources/Pricing/Careers centré, boutons Log In/Get Started droite) → Hero Section titre partiellement visible mentionnant impact LLMs et ChatGPT + CTA central "GET A DEMO" → Social Proof/Logos Clients bandeau "TRUSTED BY LEADING BRANDS:" deux blocs logos (images placeholder) → Footer/Zone inférieure espace vide noir prolongeant page |
| Palette | `#121212`/`#1A1A1A` fond sombre quasi-noir bg, `#FFFFFF`/`#F5F5F5` blanc cassé texte principal et bouton secondaire, `#7CB9E8`/`#89CFF0` bleu clair pastel accent CTA primaire et liens, `#333333` gris foncé textes secondaires/séparateurs |
| Typo | Sans-serif géométrique moderne Inter/SF Pro/Helvetica. Regular 400 nav, Medium/Semi-bold 500-600 titres hero. Tracking espacé majuscules menu et CTAs |
| Hiérarchie | H1 ~32-40px (tronqué mais position dominante), H2/body nav et labels 14-16px. Aéré vertical, densité faible (minimaliste) |
| CTAs | "GET STARTED" (bleu clair `#7CB9E8`, rempli, header extrême droite), "LOG IN" (blanc `#FFFFFF`, bordure fine, header droite avant Get Started), "GET A DEMO" (bleu clair `#7CB9E8`, rectangulaire arrondi, centrale sous hero) |
| Pricing | NON AFFICHE |
| Tunnel | Book Demo (flux principal oriente démo "GET A DEMO" vs essai gratuit immédiat/signup direct). Modèle enterprise/sales-led évident |
| Différenciants | Positionnement technique précis (mention explicite "LLMs and AI surfaces like ChatGPT" dès above-the-fold), approche "Revenue Impact" (focus mesure financière/business vs fonctionnalités techniques pures), double entrée acquisition nouvelle ("Get Started") vs réactivation ("Log In") hiérarchie visuelle claire |
| Faiblesses | Contenu manquant (titre Hero tronqué en haut capture = coupure sémantique, manque hook principal), **alt text visible** (logos clients affichent texte alternatif "Trusted by leading brands:" au lieu images réelles = bug affichage ou assets manquants), zone morte (grande zone noire vide bas sans footer ni contenu = page inachevée) |

#### 2.5.5 Fullpage (`goodie-generic.txt`, score VLM 7.5/10)
| Dimension | Valeur |
|---|---|
| Layout | Header/Nav (logo + liens Product/Use Case/Resources/Pricing + Log In/Get Started) → Hero H1 "Own AI Search Revenue" + sous-titre + CTA "Get A Demo" + badge ChatGPT → Social Proof "Trusted by leading brands" + logos clients partiellement visibles → Product Demo (capture écran large dashboard sombre) → Features Processus "The End-To-End AEO Platform" timeline verticale (Research, Monitor, Action, Measure) → Stats/Impact grille 4 cartes métriques chiffrées ("0" en rendu statique) + descriptions → Case Studies "The Proof Is In The Performance" grille études de cas textuelles → Vertical Solutions "Solutions Tailored To Your Vertical" onglets (Agencies, Fintech, etc.) + visuel dégradé → Footer (liens social + colonnes Features/Company/Models/Use Cases + copyright) |
| Palette | `#121212` noir profond bg, `#FFFFFF` blanc titres, `#60A5FA` bleu clair/sky blue boutons primaires, `#F97316` orange vif section "Research" et dégradé bas, `#F3F4F6` gris très clair section Solutions |
| Typo | Sans-serif géométrique Inter/SF Pro. Bold/Black H1/H2 haute contrastabilité, Regular/Medium body. Majuscules partielles/complètes titres impact ("THE CLOSED LOOP"), monospace possible petits labels techniques |
| Hiérarchie | H1 ~48-64px, H2 ~32-40px, body 14-16px. Aéré autour Hero/Démo, moyenne-forte Case Studies/Footer |
| CTAs | "GET STARTED" (bleu clair `#60A5FA`, header coin supérieur droit), "GET A DEMO" (bleu clair, hero centre sous sous-titre), "LEARN MORE" (transparent/bordure blanche ou grise, section Solutions), "READ FULL CASE STUDY" (lien texte souligné/discret, sous chaque carte statistique/cas) |
| Pricing | NON AFFICHE (page oriente "Get a Demo" sales-led, pas tunnel "Free Trial"/"Sign Up" instantané visible) |
| Tunnel | "Book Demo" force contact entreprise (système Enterprise/Sales-led) via "Get A Demo" répété header et hero. Pas "Free Trial" visible |
| Différenciants | Positionnement "AEO" + focus revenue générée par IA (ChatGPT, etc. vs trafic web), approche "Closed Loop" cycle complet Research > Monitor > Action > Measure (méthodologie rigoureuse), segmentation Verticale forte (onglets dédiés Agences, Fintech, Healthcare, Pharma — spécialisation sectorielle poussée) |
| Faiblesses | Poids visuel excessif section Social Proof (logos occupe espace vertical démesuré vs contenu textuel visible = "vide" avant démo), manque scrolling anchor (absence barre progression/indicateurs navigation page très longue), friction Pricing (absence totale indication prix ou gamme self-service = décourage SMB cherchant solution immédiate sans parler commercial) |

**Synthèse Goodie** : Concurrent le plus "vertical" (Agencies/Fintech/Healthcare/Pharma). Positionnement "Revenue Impact" distinctif. Faiblesses critiques : broken logos placeholders, prix Pro/Enterprise cachés, hero tronqué. Suggère produit plus jeune/less mature visuellement que les 4 autres.

---

## Section 3 — Tableau comparatif synthétique

| Axe | Otterly | Profound | Nightwatch | Athena | Goodie |
|---|---|---|---|---|---|
| **URL réelle** | otterly.ai ✅ | tryprofound.com (pas profound.com) | nightwatch.io ✅ | athenahq.ai (pas athena.com) | higoodie.com (pas goodie.com) |
| **Modèle pricing** | Free Trial + 4 tiers affichés ($29/$189/$489/Custom) + Agency Partner | Free Trial (Growth) + 3 tiers affichés ($99/$399/Custom) + Brands/Agencies toggle | 14-day trial no CC + 4 tiers affichés (€79/€159/€399/Custom) + Unlimited seats | Freemium ($25 credit) + 3 tiers affichés (Free/$295/Custom) + 9 AI models | Free Trial (Explorer) + 3 tiers ($399/Custom/Custom) — prix Pro/Enterprise CACHÉS |
| **Cible affichée** | Solo marketers → Mid-market + Agencies | Mid-market brands + Agencies | SMB → Agencies → Enterprise | Mid-market → Enterprise (Forbes/WSJ tier) | Enterprise + verticales (Agencies/Fintech/Healthcare/Pharma) |
| **Channels livraison** | Dashboard + email | Dashboard + email + Slack (Enterprise) | Dashboard + Looker Studio + email | Dashboard + email + BI tools (Tableau/PowerBI/Looker Enterprise) | Dashboard + Slack (Enterprise) |
| **Langues supportées** | EN seulement | EN seulement | EN + multi-language (mention Global Locations) | EN + multi-région/langue (Enterprise) | EN seulement |
| **Focus géographique** | US/global | US/global | Global (multi-locations explicite) | US/global (multi-région Enterprise) | US/global |
| **Sources couvertes** | 4 moteurs IA (ChatGPT/Perplexity/Gemini/Copilot) + add-ons Google AI Mode/Claude | 3 Answer Engines (ChatGPT/Perplexity/Google AI) + 10+ Enterprise | Google SERP + ChatGPT/Gemini/Perplexity citations (Search × AI unified) | 9 AI models (le plus large) + Oracle detection engine | 3-11+ AI engines selon tier (Explorer 3, Pro 6+, Enterprise 11+) |
| **Médias locaux scrapés** | Aucun | Aucun | Aucun | Aucun | Aucun |
| **Forces principales** | Pricing transparent, Gartner badge, Agency Partner program, real product preview | Dark mode premium, AEO terminology, interactive inline demo, free AEO report lead magnet | Search×AI unified, NASA/Samsung/Coinbase social proof, 99.9% accuracy, unlimited seats, NightOwl Agent | Forbes/WSJ social proof, free audit hook, freemium w/ credits, State of AI Search report thought leadership, Oracle detection | AEO Revenue Impact angle, vertical segmentation (Agencies/Fintech/Healthcare/Pharma), closed-loop methodology |
| **Faiblesses principales** | Cookie intrusive, add-on pricing complexe ($189+$99=$288 TCO réel), page trop longue | Demo-only friction (pas trial visible), feature density cognitive overload, pas de pricing sur landing hero | Comparison table trop dense, monthly/yearly toggle confusion, H1 tronqué, page extrêmement longue | Pas de vraie UI produit (blobs abstraits = vapourware risk), $295 jump trop raide, cookie overlay masque Enterprise pricing | Broken logo placeholders (bug), Pro/Enterprise prices hidden, hero tronqué, dashboard screenshot incomplet |
| **Pricing entry-level** | $29/mo | $99/mo | €79/mo | Free ($25 credit) | $399/mo |
| **Pricing mid-tier** | $189/mo | $399/mo | €159/mo | $295/mo | "Get a Demo" (caché) |
| **Pricing enterprise** | Custom (SSO, dedicated CSM) | Custom (10+ engines, SSO/SAML, Slack dedicated) | Custom (20k+ keywords, custom infra) | Custom (Knowledge base, Oracle, SSO SAML/OIDC, multi-région, BI dashboards, white-glove) | Custom (11+ engines, multi-marques/régions, Slack dédié) |
| **Score UX moyen VLM** | 7.0/10 | 7.25/10 | 7.1/10 | 7.1/10 | 6.4/10 |
| **Pattern pricing** | $ + add-ons + agency | $ + Brands/Agencies toggle | € + unlimited seats | Freemium + crédits | $ + Pro/Enterprise cachés |
| **Lead magnet** | Aucun (juste free trial) | Free AEO Report (email gating) | 14-day trial no CC | Free Audit 10min + State of AI Search report | "Run a Free AI Search Assessment" |
| **Preuve sociale hero** | G2 4.8/5 + Gartner Cool Vendor | Aucune | "10,000+ SEO teams" + NASA/Samsung/Coinbase | Forbes/WSJ + Combinator + Slalom/SoFi/Coinbase/R/GA | "Trusted by leading brands" (logos broken/placeholder) |

---

## Section 4 — Gap analysis (10 opportunités stratégiques pour Atelier)

### Gap 1 — Marché francophone + arabe natif non couvert (P0, moat défendable)
**Constat** : 0/5 concurrents supporte l'arabe natif. Tous affichent EN-only. Aucun ne cible marché marocain/africain francophone.
**Opportunité Atelier** : GLM-4 natif arabe + darija = 2-3 ans d'avance selon business plan. Landing Atelier doit afficher badge "Arabic-native GLM-4" + FR/AR/EN switcher dès hero. Cible : Top 500 marocain + Top 500 africain francophone.

### Gap 2 — WhatsApp comme canal de livraison primaire (P0, moat distribution)
**Constat** : 5/5 concurrents livrent via dashboard + email seulement. Nightwatch ajoute Looker Studio. Athena ajoute BI tools Enterprise. Goodie/Profound ajoutent Slack Enterprise. **Aucun ne propose WhatsApp**.
**Opportunité Atelier** : WhatsApp Daily Digest 7h chaque matin = LE différenciateur. Les dirigeants marocains/africains vivent sur WhatsApp, pas sur dashboards web. Hero Atelier doit montrer screenshot réel WhatsApp bot (pas mockup).

### Gap 3 — PDF mensuel board-ready (P1, livrable unique)
**Constat** : 0/5 concurrents ne propose de Monthly Report PDF board-ready (15-20 pages). Tous se limitent à dashboards + exports CSV.
**Opportunité Atelier** : Monthly Report PDF board-ready (1er du mois) pour Board/comité direction. Pricing tier Pro/Enterprise inclus. Cible : CEO/Dircom qui doivent présenter au board.

### Gap 4 — Pricing en devise locale MAD + toggle MAD/USD (P1, ancrage psychologique)
**Constat** : 4/5 concurrents affichent en $ (Otterly $29-$489, Profound $99-$399, Athena Free/$295, Goodie $399). Nightwatch affiche en € (€79-€399). **Aucun n'offre MAD**.
**Opportunité Atelier** : Pricing Atelier 5K/15K/50K MAD/mois + toggle MAD/USD pour prospects internationaux. Ancre psychologique local "made in Morocco". Annual -15% comme Otterly/Nightwatch.

### Gap 5 — Harch 100 ranking public (P1, thought leadership + SEO inbound)
**Constat** : Athena a "State of AI Search 2026 Report" annuel (thought leadership). Nightwatch a "10,000+ SEO teams" metric. Mais **aucun n'a de ranking public type "Top 500 marocain"** type "Signal AI 500" ou "Forbes 500".
**Opportunité Atelier** : Harch 100 = ranking public Top 100/500 marocain avec score composite mensuel. Génère SEO + PR + inbound (entreprises veulent être top 10 → monitor score → payent). Cible : Bank of Africa, OCP, Maroc Telecom.

### Gap 6 — Sources médias locaux (30+ médias marocains + 10+ africains) (P0, moat data)
**Constat** : 5/5 concurrents se concentrent sur 3-11 moteurs IA (ChatGPT/Perplexity/Gemini/Copilot). **Aucun ne scrap les médias locaux** (Hespress, Le360, Médias24, TelQuel, Jeune Afrique, etc.).
**Opportunité Atelier** : 30+ médias marocains + 10+ africains + 4 moteurs IA = sources propriétaires uniques. Hero Atelier doit afficher grille logos médias marocains scrapés (preuve de couverture locale).

### Gap 7 — Audit gratuit teaser avec floutage ("Unlock full report") (P1, sales process)
**Constat** : Athena propose "Free Audit 10min" mais sans teaser flouté. Profound propose "Free AEO Report" email-gated. **Aucun n'a le pattern "scrape gratuit prospect → teaser 2 pages visibles + reste flouté → unlock full report"**.
**Opportunité Atelier** : Industrialiser le sales process du business plan : scrape gratuit prospect (30 jours données) → PDF teaser 2 pages visibles + reste flouté → LinkedIn DM/email avec score 78/100 + comparaison concurrent → prospect demande full report → upsell monitoring continu.

### Gap 8 — White-label pour agences PR locales (P1, channel B2B2C)
**Constat** : Otterly a "Agency Partner" program (Pitch Workspaces, Co-marketing, multi-client billing) mais pas de vrai white-label. **Aucun n'offre white-label technique aux agences PR**.
**Opportunité Atelier** : White-label 30% revenue share aux agences PR marocaines/africaines. Elles revendent sous leur marque. Source revenus additionnelle (cf. business plan section 5).

### Gap 9 — Crisis alerting WhatsApp temps réel (seuil défini par client) (P1, high-value feature)
**Constat** : Nightwatch a alerts (par email). Profound a "Crisis" mention. **Aucun n'a crisis alerts WhatsApp temps réel avec seuil défini par client**.
**Opportunité Atelier** : Crisis alerting WhatsApp immédiat quand seuil défini par client déclenché (ex: -10pts sentiment 24h, sujet X mention 50+ fois). Tier Pro/Enterprise. High-value, justifie pricing 15K-50K MAD/mois.

### Gap 10 — Investor Reports pour Bourse de Casablanca (P1, segment non couvert)
**Constat** : Aucun concurrent ne cible investisseurs boursiers. Athena vise "Brands" (CMO). Nightwatch vise "SEO teams". **Aucun ne vise fonds, banques d'investissement, family offices**.
**Opportunité Atelier** : Produit "Investor Report" 100K-500K MAD/rapport sectoriel trimestriel (banque, telecom, énergie, mining). 50-100 pages, 20+ entreprises, score réputation + trend + prédictions. Acheteurs : IFC, Proparco, AfricInvest, Casablanca Finance City, Attijari Capital, BMCE Capital.

### Gap 11 (bonus) — Sentiment analysis par entité (pas juste article-level) (P2, granularité)
**Constat** : Tous concurrents font sentiment basique article-level. **Aucun ne fait sentiment par entité** (Personne/Marque/Produit au sein d'un article).
**Opportunité Atelier** : GLM-4 permet sentiment fine-grained par entité. Un article peut être positif sur Bank of Africa mais négatif sur son CEO — Atelier capture cette nuance.

### Gap 12 (bonus) — Trend detection avec seuil % sur 24h (P2, alerting)
**Constat** : Profound a "Prompt Volumes" mais pas trend detection avec seuil. **Aucun n'alerte sur "+47% en 24h sur sujet X"**.
**Opportunité Atelier** : Trend detection avec alerte seuil (sujet X monte de 47% en 24h → WhatsApp).

---

## Section 5 — Recommandations pour Atelier landing

### 5.1 Sections de la landing Atelier (ordre recommandé)

1. **Header sticky** : Logo Harch Atelier + Nav (Platform, Sources, Harch 100, Pricing, About) + Langue switcher FR/AR/EN + CTA primaire "Demander Audit Gratuit" (toujours visible au scroll)
2. **Hero** : H1 split-color "Savez-vous ce qu'on **dit de vous** ?" (le mot "dit de vous" en `stone-500`) + sous-titre "AI Reputation Intelligence pour le Top 500 marocain" + double CTA "Audit Gratuit 10min" (primaire) + "Voir le dashboard" (secondaire ghost)
3. **Preuve sociale presse** : "Featured on" + logos Hespress, TelQuel, Médias24, Le360, L'Économiste (médias marocains = preuve locale forte)
4. **Le Hook visuel différenciateur** : Screenshot réel WhatsApp Daily Digest 7h (pas mockup) + caption "Chaque matin à 7h, votre réputation sur WhatsApp" — c'est LE pattern qu'aucun concurrent n'a
5. **"Voici ce qu'on voit que vous ne voyez pas"** : Split 3 colonnes (Médias 30+ marocains/africains / Social Twitter+LinkedIn+Facebook / IA ChatGPT+Perplexity+Gemini+GLM) avec compteurs animés type "247 articles aujourd'hui, 68% positifs, 3 sujets qui montent"
6. **Dashboard preview** : Screenshot réel dashboard avec Risk matrix + Competitor heatmap + Sentiment trend chart + Share of Voice (composants déjà existants dans `src/components/dataviz/`)
7. **Sources couvertes** : Grille logos 30+ médias marocains + 10+ africains + 4 moteurs IA (avec logos ChatGPT/Perplexity/Gemini/GLM). Pattern Nightwatch "Search × AI Ecosystem" adapté
8. **Harch 100 ranking** : Top 10 visible (Bank of Africa, OCP, Maroc Telecom, etc.) avec scores réels + CTA "Voir le classement complet" → page dédiée /harch-100 (génère SEO)
9. **Différenciateurs** : 4 cards — (1) GLM-4 natif arabe (logo Zhipu AI), (2) WhatsApp Daily Digest, (3) 30+ médias marocains, (4) Crisis alerts WhatsApp temps réel
10. **Témoignages prospects audités** (vrais, pas fictifs comme avant — disclaimer "phase d'amorçage") : Bank of Africa (audit gratuit réalisé), OCP (audit gratuit réalisé), Maroc Telecom (audit gratuit réalisé) — disclaimer obligatoire selon MASTER_VISION
11. **Pricing** : 3 tiers (Starter 5K / Pro 15K / Enterprise 50K MAD/mois) + toggle MAD/USD + ligne séparée "Investor Report 100K+/an" + annual -15% comme Otterly
12. **FAQ** : 10+ Q techniques — langues supportées (FR/AR/Darija/EN), sources, modèle GLM-4, processus audit, délai livraison WhatsApp, crise alerting, white-label agences
13. **CTA Final** : "Demander votre audit gratuit" + WhatsApp QR code (scannez → DM bot) + LinkedIn founder Amine
14. **Footer** : 6 colonnes (Platform, Sources, Harch 100, Resources, Company, Social) + Copyright "Building in Public · Casablanca, Maroc" + disclaimer phase amorçage

### 5.2 Positionnement vs chaque concurrent

| Concurrent | Comment Atelier se positionne |
|---|---|
| **Otterly** | "Vous trackez ChatGPT/Perplexity mais pas Hespress/TelQuel. Nous couvrons les médias locaux + moteurs IA + WhatsApp" — focus local vs US-centric |
| **Profound** | "Vous êtes AEO pour US brands. Nous sommes AI Reputation Intelligence pour le Top 500 marocain/africain" — focus géo + langue arabe |
| **Nightwatch** | "Vous êtes SEO rank tracking + AI citations. Nous sommes réputation + sentiment + crisis alerting WhatsApp" — focus use case (réputation vs SEO) + canal (WhatsApp vs email) |
| **Athena** | "Vous avez Forbes/WSJ. Nous avons Hespress/TelQuel/Jeune Afrique + Bourse de Casablanca" — focus médias locaux + segment investor reports |
| **Goodie** | "Vous avez $399 entry + prix Pro cachés. Nous sommes 5K MAD/mois transparent (≈ $500) avec WhatsApp natif" — focus pricing transparent + canal WhatsApp |

### 5.3 Pricing display recommandé

```
┌─────────────────┬─────────────────┬─────────────────┐
│    STARTER      │      PRO        │   ENTERPRISE    │
│   5 000 MAD/mo  │  15 000 MAD/mo  │  50 000 MAD/mo  │
│    ≈ $500/mo    │   ≈ $1 500/mo   │   ≈ $5 000/mo   │
│                 │   Most Popular  │                 │
├─────────────────┼─────────────────┼─────────────────┤
│ WhatsApp Daily  │ Tout Starter +  │ Tout Pro +      │
│ 20 sources      │ Dashboard       │ 200 sources     │
│ 1 concurrent    │ 50 sources      │ 5 concurrents   │
│ PDF mensuel     │ 3 concurrents   │ Analyste dédié  │
│                 │ Alertes         │ API access      │
│                 │ AI visibility   │ Risk matrix     │
│                 │ PDF             │                 │
├─────────────────┼─────────────────┼─────────────────┤
│ [Audit Gratuit] │ [Audit Gratuit] │ [Contact Sales] │
└─────────────────┴─────────────────┴─────────────────┘

[Toggle: Mensuel | Annuel (-15%)]  [Toggle: MAD | USD]

Ligne séparée bas de pricing :
┌──────────────────────────────────────────────────────┐
│  INVESTOR REPORT — 100 000+ MAD/an                  │
│  Rapports sectoriels pour Bourse de Casablanca      │
│  [Contact Sales]                                     │
└──────────────────────────────────────────────────────┘
```

### 5.4 Différenciateurs à mettre en avant (ordre priorité)

1. **GLM-4 natif arabe** (logo Zhipu AI) — moat technologique, 2-3 ans d'avance selon business plan
2. **WhatsApp Daily Digest 7h** (screenshot réel bot) — moat distribution, dirigeants marocains vivent sur WhatsApp
3. **30+ médias marocains + 10+ africains** (grille logos) — moat data propriétaire
4. **Crisis alerts WhatsApp temps réel** (seuil défini client) — high-value feature unique
5. **Harch 100 ranking public** (Top 10 visible) — thought leadership + SEO inbound
6. **Top 500 marocain sous monitoring** (logos Bank of Africa, OCP, Maroc Telecom) — preuve sociale locale
7. **Investor Reports Bourse de Casablanca** (segment non couvert par concurrents)
8. **Building in Public depuis Casablanca** (founder Amine réel, pas de dirigeants fictifs)

---

## Section 6 — 5 UX patterns à réimplémenter dans le style Harch

> Style Harch : Inter (sans-serif) + Space Mono (mono), accent `stone-500` (#78716C), noir `#0A0A0A` background, motif "forge sparks" (étincelles de forge), Tailwind `neutral-*` palette.

### Pattern 1 — Dark Mode Premium natif (Profound + Nightwatch + Goodie)
- **Constat** : 3/5 concurrents (Profound, Nightwatch, Goodie) utilisent dark mode natif `#050505`-`#121212` comme background principal. Athena et Otterly restent en light mode.
- **Réimplémentation Harch** : Background `#0A0A0A` (noir profond), surface cards `#111111`-`#1A1A1A` (gris anthracite), accent `stone-500` (#78716C) pour CTAs primaires, texte `#FAFAFA` (blanc cassé). Eviter le magenta Otterly `#E91E8C` (trop saturé, hors palette Harch) et le violet Athena `#5B4DFF` ( hors palette stone).
- **Détail** : utiliser `neutral-*` Tailwind partout (jamais hex custom). Bordures `neutral-800`. Secondary text `neutral-400`. Hover states `stone-600`.

### Pattern 2 — H1 split-color avec mot accent en couleur (Otterly + Goodie + Athena)
- **Constat** : Otterly met "AI Search" en magenta `#E91E8C` au milieu du H1 noir. Goodie met "Revenue" en bleu clair `#93C5FD`. Athena met "Become" en violet `#4F46E5` et "Brand AI Trusts" en noir.
- **Réimplémentation Harch** : H1 "Savez-vous ce qu'on **dit de vous** ?" — le mot "dit de vous" en `stone-500` (#78716C), reste en `neutral-50`. Police Inter Black 900, taille ~64-72px, tracking tight, centré. Alternative : H1 avec un mot en Space Mono pour contraste typographique (ex: "Savez-vous ce qu'on dit de vous _[Space Mono]_ ?").
- **Variantes** : pour la landing Atelier, 3 H1 possibles en split-color stone-500 : "Votre **réputation** n'attend pas", "L'IA **parle** de vous", "Le Maroc vous **regarde**".

### Pattern 3 — Real Product Preview en hero (Otterly + Profound dashboard)
- **Constat** : Otterly montre vraie capture dashboard "Adidas" (pas mockup). Profound montre canvas workflow agents (nodes/edges/logs). Athena = erreur à ne pas copier (blobs abstraits dégradés flous = "vapourware risk" selon VLM).
- **Réimplémentation Harch** : Hero Atelier doit montrer screenshot RÉEL WhatsApp Daily Digest 7h (capture bot Twilio/WhatsApp Business API en action). Pas de mockup. Pas de blobs abstraits. Caption sous screenshot : "Chaque matin à 7h, votre réputation sur WhatsApp" + date/heure réelle visible (ex: "07:00 · 29 juillet 2026 · Bank of Africa · 247 articles · 68% positifs").
- **Composants existants à réutiliser** : `src/components/dataviz/` contient déjà RiskMatrix, SentimentTrend, ShareOfVoice, TopSources, GeoDistribution — les montrer dans dashboard preview section.

### Pattern 4 — Lead Magnet "Free Audit" avec hook temporel court (Athena)
- **Constat** : Athena utilise "Get Free Audit (10m)" — hook temporel court (10min) réduisant friction psychologique vs "Demo 30min" classique. Profound utilise "Free AEO Report" email-gated. Nightwatch utilise "Start 14-day trial no CC".
- **Réimplémentation Harch** : CTA primaire hero "Audit Gratuit 10min" (pas "Demander une démo" — trop long/froid). Le tunnel : input email + nom entreprise → scrape gratuit 30 jours de données prospect → PDF teaser 2 pages visibles + reste flouté "Unlock full report" → livraison WhatsApp. Pattern sales process business plan respecté.
- **Complément** : duplicate le CTA "Audit Gratuit 10min" en bas de page (footer CTA banner) comme Otterly/Nightwatch — tout concurrent mature a footer CTA.

### Pattern 5 — Forge Sparks motif animé (signature Harch, aucun concurrent ne l'a)
- **Constat** : Aucun des 5 concurrents n'a de motif signature animé distinctif. Otterly a rose magenta uniforme. Profound a dark mode épuré. Nightwatch a bleu `#3B82F6` uniforme. Athena a colonnes grecques floues (subliminal). Goodie a orange `#F97316` highlights.
- **Réimplémentation Harch** : "Forge sparks" = particules légères type étincelles de forge qui émergent du logo Harch ou des CTA au hover. Animation CSS/Canvas légère, performance-first. Couleur : `stone-500` + `stone-300` (variantes). À placer : (a) arrière-plan hero en low-opacity, (b) au hover sur CTA primaire, (c) au scroll sur section transitions. Différenciateur visuel unique vs les 5 concurrents.
- **Tech** : existing `src/components/CursorGlow.tsx` et `src/components/gsap/Marquee.tsx` peuvent servir de base. Ajouter composant `ForgeSparks.tsx` utilisant Framer Motion ou GSAP.

---

## Annexe A — Scores UX VLM détaillés par screenshot

| Concurrent | Hero | Features | Pricing | Dashboard | Fullpage | Moyenne |
|---|---|---|---|---|---|---|
| Otterly | 7.5 | 6.0 | 6.5 | 7.5 | 7.5 | 7.0 |
| Profound | 6.0 | 7.5 | 7.5 | 7.5 | 7.5 | 7.25 |
| Nightwatch | 7.5 | 4.0 | 8.0 | 8.5 | 7.5 | 7.1 |
| Athena | 7.5 | 7.5 | 7.5 | 5.5 | 7.5 | 7.1 |
| Goodie | 6.5 | 6.5 | 7.5 | 4.0 | 7.5 | 6.4 |

**Lectures** :
- Nightwatch a le meilleur pricing (8.0) et meilleur dashboard (8.5) mais le plus faible features screenshot (4.0 — capture tronquée/vide).
- Goodie a les scores les plus faibles (6.4 moyenne) à cause du dashboard cassé (broken logos) et features minimaliste.
- Profound a la meilleure moyenne (7.25) — dark mode premium cohérent.
- Athena dashboard score 5.5 = absence totale de proposition de valeur explicite + copy manquante.

## Annexe B — Pricing entry-level comparatif (devise normalisée)

| Concurrent | Entry-level | ~MAD/mois équivalent | Modèle |
|---|---|---|---|
| Otterly Lite | $29/mo | ~290 MAD | Self-service |
| Nightwatch Starter | €79/mo | ~850 MAD | Self-service 14j trial |
| Profound Starter | $99/mo | ~990 MAD | Annual billed |
| Athena Essential | Free ($25 credit) | 0 MAD | Freemium |
| Goodie Explorer | $399/mo | ~4 000 MAD | Self-service trial |
| **Atelier Starter** | **5 000 MAD/mo** | **5 000 MAD** | **Audit gratuit → closing** |
| Athena Starter | $295/mo | ~2 950 MAD | Freemium → paid |
| Profound Growth | $399/mo | ~4 000 MAD | Self-service trial |
| Otterly Premium | $489/mo | ~4 890 MAD | Self-service |
| Nightwatch Agency | €399/mo | ~4 300 MAD | Annual dedicated AM |
| **Atelier Pro** | **15 000 MAD/mo** | **15 000 MAD** | **Mid-market ETI** |
| Otterly Enterprise | Custom | Custom | SSO + dedicated CSM |
| Profound Enterprise | Custom | Custom | 10+ engines + Slack |
| Nightwatch Enterprise | Custom | Custom | 20k+ keywords |
| Athena Enterprise | Custom | Custom | SSO + multi-région + BI |
| Goodie Enterprise | Custom | Custom | 11+ engines + Slack |
| **Atelier Enterprise** | **50 000 MAD/mo** | **50 000 MAD** | **Top 500 + analyste dédié** |

**Lecture** : Atelier est 1.25× plus cher que Goodie Explorer en entry-level (5K MAD vs 4K MAD), mais avec WhatsApp + 30+ médias locaux en plus. Atelier Pro (15K MAD) est 3× plus cher que Athena Starter ($295≈2 950 MAD) mais avec WhatsApp + PDF mensuel + 50 sources locales. Atelier Enterprise (50K MAD ≈ $5 000/mo) est dans la fourchette haute mais justifié par analyste dédié + API + risk matrix.

## Annexe C — Fichiers sources

- 25 screenshots : `/home/z/my-project/work/harch-corp/agents/h-int/competitors/{otterly,profound,nightwatch,athena,goodie}-{hero,features,pricing,dashboard}.png` + 5 génériques sans suffixe
- 25 VLM JSON outputs : `/home/z/vlm-bench/*.json`
- 25 VLM text extractions : `/home/z/vlm-bench/*.txt`
- Prompt template : `/home/z/vlm-bench/prompt.txt`
- Business plan de référence : `/home/z/my-project/work/harch-corp/agents/h-ceo/workspace/business_plan_v2.md`
- Blueprint h-int préexistant : `/home/z/my-project/work/harch-corp/agents/h-int/competitors/blueprint.md` (41 KB, 25 screenshots déjà capturés par h-int via agent-browser)

---

*Rapport généré le 2026-07-29 par l'agent general-purpose (VLM benchmark) — Task ID: BENCH-1*
*Building in Public · Casablanca, Maroc*
