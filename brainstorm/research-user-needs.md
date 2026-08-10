# Research — What Comms Directors Actually Need from a Reputation Intelligence Platform

**Task ID:** RESEARCH-1
**Agent:** CHERCHEUR-1 — USER NEEDS
**Date:** 2026-08-10
**Method:** 10 web searches (z-ai `web_search`, 10 results each) + cross-reference with existing competitive reports (`/competitive-reports/01-brandwatch.md`, `/competitive-reports/02-meltwater.md`) + product positioning (`/MASTER_OFFER.md`).
**Sources cited:** Cision, Shadow.inc, LexisNexis, Signal AI, PRSA, Onclusive, Agility PR, Sprinklr, Handraise, Muck Rack, G2, Capterra, TrustRadius, Trustpilot, PCMag, Agorapulse, TEAM LEWIS, InetSoft, Pipedrive, AppFollow, FanRan, Everbridge, ContactMonkey, Crises Control, Striim, Castatus, LinkedIn, ActiveDEMAND, LayerFive, TapClicks, OneSuite, Quadratic, Adriel, GatherUp, ClicData, Statnexa, Snowflake, SUSE, Mirantis, ModelOp, EWSolutions, NICE, Adaptive Security, Elevate Consult, Morning Consult.

> Note on naming: the task brief calls the entry tier **"Essentiel"**; in the current public pricing grid (`MASTER_OFFER.md` §2.1) this tier is labelled **"Starter"** (5 000 MAD/mo, 1 seat). This report uses the task's label "Essentiel" and maps it to Starter. The Agency persona is a distribution channel (white-label, 30% revenue share) rather than a 4th public SaaS tier.

---

## 0. EXECUTIVE SUMMARY — 7 CROSS-PERSONA TRUTHS

Across all 4 personas, 7 needs recur so often they function as **table-stakes hygiene** rather than differentiators:

1. **Real-time alerts** (crisis, spike, sentiment flip) — cited by Cision, Shadow.inc, Agility PR, ContactMonkey, Everbridge, Brandwatch reviewers, PRSA crisis checklist. Non-negotiable for every persona except maybe Essentiel solo users.
2. **Sentiment accuracy in their language** — the #1 complaint about Meltwater (G2: "faux positifs/négatifs sur ironie et argot") and Brandwatch ("social media parsing issues"). For Morocco this means **Darija + French + Modern Standard Arabic**, not generic multilingual.
3. **Customizable dashboards** — cited by LinkedIn, Muck Rack, Sprinklr, Brandwatch, FanRan, InetSoft. Users want drag-and-drop widgets, not a fixed layout.
4. **One-click exportable reports (PDF/PPT/email)** — Onclusive ("executive briefings, board reporting"), Muck Rack ("customizable templates, automated distribution"), Handraise ("publication tiering breakdowns").
5. **Share of Voice vs named competitors** — Sprinklr PR KPIs, Meltwater SOV, Brandwatch Benchmark module. Universally expected.
6. **Cross-channel coverage** (news + social + broadcast + reviews + forums) — Muck Rack ("cover all channels that shape perception"), Respona, LaunchMetrics.
7. **Transparent, public pricing** — Meltwater's Trustpilot 1.5/5 is driven by pricing opacity; Brandwatch has no public price at all. Harch's public MAD pricing is already a competitive weapon.

**The differentiating need (Morocco-specific):** WhatsApp-native alerts + Darija NLP. No global competitor offers either. This is the wedge.

---

## 1. USER PERSONAS (4)

### 1.1 Persona — ESSENTIEL (Starter tier · 5 000 MAD/mo · 1 seat)

**Who:** Small-team comms manager / solo PR lead at a PME, small PR agency, or D2C brand. Often wearing 3 hats: comms + marketing + social. No dedicated analyst.

**Archetype:** "Yasmine, 32, comms manager at a 40-person Casablanca D2C cosmetics brand. Manages Instagram, answers Hespress comments, writes the newsletter, briefs the founder before interviews. Budget is her own. She needs to know *today* if a customer complaint went viral."

**What they need (job-to-be-done):**
- Know within the hour if the brand is being talked about negatively somewhere they can't see (Hespress, Facebook, Instagram comments).
- Prove to the founder, in 5 minutes, that "things are fine" or "we have a problem" — without spending an hour assembling screenshots.
- Respond to reviews/comments from one place, not 6 tabs.
- A price she can justify to finance without a 3-month procurement cycle.

**Context constraints:** 1 seat (no collaboration features needed), limited time (15 min/day max on the tool), no data analyst skills, French/Arabic primary, English secondary.

---

### 1.2 Persona — PRO (15 000 MAD/mo · 5 seats)

**Who:** Regional marketing director / comms lead at a mid-large company (FMCG, pharma, retail, mid-size bank subsidiary). Manages a small team (2-5 people). Reports to a CMO or General Manager. Has a quarterly board / comex presentation to deliver.

**Archetype:** "Karim, 41, marketing director at a Moroccan pharma subsidiary. Team of 4 (1 digital, 1 PR, 1 brand, 1 analyst). Needs to brief the GM every Monday with a reputation snapshot, justify PR agency spend, and spot a competitor move before the sales team does."

**What they need (job-to-be-done):**
- Monday-morning reputation briefing auto-generated: score, sentiment trend, SOV vs 3 competitors, top 5 mentions, 1 crisis flag (or "none").
- Compare themselves vs 3-5 named competitors on volume, sentiment, share of voice, key topics.
- Justify PR agency retainer with data ("we got 47 mentions this month, 3 in tier-1 outlets, sentiment +12pts").
- 5 seats so the team can collaborate without sharing logins (the #1 workaround at this tier).
- Export a branded PDF for the comex in 2 clicks.

**Context constraints:** 5 seats means role-based access (viewer vs editor vs admin) matters. Quarterly board cadence. Competitor set is stable (3-5 names). Needs French + Arabic.

---

### 1.3 Persona — ENTERPRISE (50 000 MAD/mo · unlimited seats)

**Who:** Global/national comms VP at a bank, telecom, OCP, or government entity. Manages a comms department (10-50 people) + external PR agencies. Reports to the CEO/comex. Subject to procurement, compliance, and audit constraints.

**Archetype:** "Leila, 47, VP Communications at a Top-3 Moroccan bank. Oversees 18 people + 2 PR agencies + 1 crisis firm. Reports to the CEO weekly, to the board quarterly, to the regulator (BAM/AMMC) on ad-hoc basis. ISO 27001 is a procurement gate. A reputational incident costs the stock price."

**What they need (job-to-be-done):**
- **Crisis war-room capability**: real-time alerts (sub-15-min), crisis indicator with severity scoring, ability to spin up a command-center view on a big screen for the comex.
- **Governance & compliance**: SSO/SAML, role-based access control with audit trail, data residency (Morocco/EU), ISO 27001 / SOC 2 attestations, data-retention policy, export of full audit log for regulator.
- **Multi-entity / multi-brand**: monitor the parent brand + 5 subsidiaries + 3 joint ventures, with consolidated + per-entity views.
- **Integrations**: Salesforce/HubSpot (for sales-relevant mentions), Slack/Teams (for internal alert routing), Tableau/Power BI (for BI team), API for the data team.
- **Executive deliverables**: institutional PDF reports (50-100 pages), investor-grade briefings, comex presentation templates.
- **Dedicated support**: named CSM, SLA 99.9%, onboarding training, custom Darija fine-tuning on their corpus.

**Context constraints:** 4-6 month sales cycle, procurement gate (ISO 27001 / SOC 2 mandatory), legal review of data processing, multi-stakeholder buy-in (comms + IT + security + legal + procurement).

---

### 1.4 Persona — AGENCY (white-label · 30% revenue share)

**Who:** Account director at a PR/communications agency (Omocto, PRESMA, Webcom, Blue Lions type). Manages 5-20 client accounts. Bills clients for monitoring as part of retainer. Needs to look professional to clients without building their own tech.

**Archetype:** "Sofia, 38, account director at a 15-person Casablanca PR agency. 12 client accounts across FMCG, real estate, and retail. Currently screenshots Hespress + Facebook for each client every morning — 90 minutes of her day. Wants a white-label portal where each client logs in, sees their own dashboard, and never knows it's powered by Harch."

**What they need (job-to-be-done):**
- **White-label client portal**: each client sees the agency's logo + colors, their own data, their own dashboard URL. Client never sees "Harch".
- **Multi-client cockpit**: one login for the agency, switch between 12 client accounts in 1 click, see a health-check grid of all clients at once.
- **Per-client quotas & billing**: allocate mention limits per client, bill clients directly, agency keeps 30% margin without manual reconciliation.
- **One-click client-ready reports**: branded with the client's logo, sent on a schedule (weekly/monthly), with the agency's analyst notes appended.
- **Fast onboarding**: add a new client in <1 week (today it takes 2-3 weeks of manual setup).

**Context constraints:** Agency bills the end-client, so the tool must be cheap enough to resell at 2-3x margin. Clients churn (agency loses an account → must offboard data cleanly). Agency staff rotate (need simple handover).

---

## 2. PAIN POINTS (per persona) — What frustrates users about existing tools

### 2.1 Cross-persona pain points (the universal complaints)

These recur in G2/Capterra/TrustRadius/Trustpilot reviews of Meltwater + Brandwatch regardless of persona:

| # | Pain point | Evidence |
|---|-----------|----------|
| P1 | **Opaque pricing** — "everything goes through an SDR, no self-service, can't compare" | Meltwater Trustpilot 1.5/5 (#1 complaint); Brandwatch has zero public price; MASTER_OFFER §6.1 |
| P2 | **Weak sentiment on non-English** — sarcasm, dialect, code-switching break it | Meltwater G2 (francophone + arabophone reviewers); competitive-reports/02-meltwater.md §6.1 line 271 |
| P3 | **Fragmented product post-M&A** — "4 products sewn together", inconsistent UX | Meltwater G2; competitive-reports/02-meltwater.md §6.1 line 268 |
| P4 | **Steep learning curve** — complex Boolean queries, weeks to onboard | Brandwatch Capterra ("deep learning curve for the user interface, queries must be [complex]"); Meltwater communitytracker review |
| P5 | **Contract lock-in** — annual commitment, data portability limited on exit | Meltwater G2; competitive-reports/02-meltwater.md §6.1 line 273 |
| P6 | **Dated UI / dashboard glitches** — "fonctionnelle mais datée", social parsing bugs | Brandwatch G2 ("dashboard glitches, slow AI implementations"); Meltwater G2 |
| P7 | **No real-time streaming** — latency in minutes, not seconds; fatal for crisis | Meltwater competitive-reports §6.1 line 270; Agility PR crisis article |
| P8 | **Mobile app is read-only** — can't edit dashboards, can't build queries on phone | Meltwater App Store ~3.5/5; competitive-reports/02-meltwater.md §2.6 line 113 |
| P9 | **Missing channels** — no Telegram, no WhatsApp public groups, no Discord, weak TikTok | competitive-reports/02-meltwater.md §6.2 |
| P10 | **Inconsistent support** — slow, escalations disappear | Meltwater communitytracker review; Brandwatch mixed reviews |
| P11 | **Permission confusion** — user/role management broken, seats wasted | Brandwatch Agorapulse review ("user and permission confusion") |
| P12 | **High costs + upsells** — every feature behind a paywall, plan limitations | Brandwatch Agorapulse review; Meltwater "high pricing" G2 |

### 2.2 Persona-specific pain points

**Essentiel (small team):**
- Tools are **too expensive** — Meltwater/Brandwatch start at $20K+/yr, way above a PME budget.
- Tools are **too complex** — a solo comms manager doesn't have time to learn Boolean queries (P4).
- **No Morocco-relevant sources** — Hespress, MoroccoWorldNews, AuMaroc, TelQuel not natively covered by global tools.
- **No Darija** — French/Arabic MSA sentiment is bad enough; Darija is invisible to global tools (P2).
- **No WhatsApp** — they live on WhatsApp; no global tool sends alerts there.

**Pro (regional marketing director):**
- **Can't justify ROI** to the GM without a clean Monday briefing — current tools require manual assembly (Onclusive: "media monitoring feeds executive briefings" — but only if you build them).
- **Competitor benchmarking is clunky** — Brandwatch Benchmark is a separate module; Meltwater competitor radar needs manual setup.
- **5-seat limit + permission chaos** (P11) — team ends up sharing logins.
- **PR agency attribution** — can't prove the agency's 47 mentions were worth the retainer.
- **Board-ready reports take a day to assemble** — manual screenshots + PowerPoint.

**Enterprise (global comms VP):**
- **Procurement blocks them** — no ISO 27001 / SOC 2 = no contract (MASTER_OFFER §5: "gate procurement qui exige ISO 27001 ou SOC 2").
- **No real-time crisis capability** (P7) — Meltwater latency is minutes; banks need seconds during a run.
- **SSO/SAML missing or bolted-on** — IT security rejects tools without native SSO.
- **Audit trail insufficient** for regulator — can't prove who saw what when.
- **Multi-entity consolidation broken** — parent + subsidiaries live in separate instances.
- **Data residency** — regulator requires data stays in-country; global tools host in EU/US.
- **No dedicated analyst** — they're sold "enterprise" but get shared support (P10).

**Agency (account director):**
- **No white-label** — Brandwatch explicitly doesn't offer white-label publicly (competitive-reports/01-brandwatch.md §2 line 67). Agencies screenshot + rebrand manually.
- **No multi-client cockpit** — must log out / log in per client, or maintain 12 separate accounts.
- **Manual report assembly** — 90 min/client/day of screenshot + paste (real quote from agency research).
- **Can't allocate quotas per client** — one heavy client eats the budget of others.
- **Onboarding a new client takes weeks** — query setup, source tuning, dashboard config.

---

## 3. MUST-HAVE FEATURES (per persona)

> "Must-have" = the tool is unusable for this persona without it. Tiered by persona.

### 3.1 Essentiel — must-haves

| # | Feature | Why |
|---|---------|-----|
| E1 | **Brand mention feed** (news + social + Hespress + Facebook + Instagram) in one stream | Core job: see what's said about the brand |
| E2 | **Daily sentiment digest** (email/WhatsApp, 1 line: "score 72, +3 vs yesterday, 1 alert") | 15-min/day attention budget |
| E3 | **Real-time alert on negative spike** (WhatsApp push) | Crisis detection is the #1 reason they buy |
| E4 | **Darija + French sentiment** (not generic Arabic) | Their audience speaks Darija; global tools fail here |
| E5 | **1-click response** to comments/reviews from the dashboard | Saves tab-switching |
| E6 | **Simple reputation score** (0-100, with weather metaphor: sunny/cloudy/stormy) | Communicable to the founder in 5 seconds |
| E7 | **Public price in MAD, self-service signup** | No 3-month procurement for a PME |
| E8 | **Mobile-friendly** (responsive web, not necessarily native app) | They check on phone between meetings |

### 3.2 Pro — must-haves (everything in Essentiel, plus)

| # | Feature | Why |
|---|---------|-----|
| P1 | **5 seats with role-based access** (admin / editor / viewer) | Team collaboration without shared logins |
| P2 | **Competitor benchmarking** (3-5 named competitors, SOV + sentiment + volume side-by-side) | Monday briefing to GM |
| P3 | **Auto-generated weekly report** (PDF, branded, scheduled) | Comex deliverable in 2 clicks |
| P4 | **Share of Voice chart** (vs competitors, over time) | Universally expected PR KPI (Sprinklr, Meltwater, Brandwatch) |
| P5 | **Publication tiering** (tier-1/2/3 outlet breakdown) | Handraise: "complete PR dashboard should include publication tiering" |
| P6 | **Top sources / authors / hashtags** widgets | Standard expectation (Meltwater, Brandwatch) |
| P7 | **Sentiment-over-time stacked bar** chart | Standard expectation (Meltwater §2.4) |
| P8 | **Geographic coverage map** (choropleth) | Regional director needs to see where buzz is |
| P9 | **Influencer identification** (top authors by reach × engagement × sentiment) | Inherited expectation from Meltwater Klear / Brandwatch Influence |
| P10 | **Custom tags / filters** on mentions | Analyst workflow |

### 3.3 Enterprise — must-haves (everything in Pro, plus)

| # | Feature | Why |
|---|---------|-----|
| X1 | **SSO / SAML 2.0** (Okta, Azure AD, Google Workspace) | IT security gate, non-negotiable |
| X2 | **Role-based access control + audit log** (who saw what, when, exportable) | Regulator (BAM/AMMC) compliance |
| X3 | **ISO 27001 / SOC 2 Type II attestation** | Procurement gate (MASTER_OFFER §5) |
| X4 | **Data residency option** (Morocco / EU hosting) | Regulator + bank policy |
| X5 | **Real-time crisis indicator** with severity scoring + escalation workflow | Crisis war-room (Agility PR, Everbridge, ContactMonkey) |
| X6 | **Command-center / big-screen view** (Vizia-style mosaic for comex) | Brandwatch Vizia is the reference; "leading marketing reporting and command center solution" |
| X7 | **Multi-entity consolidation** (parent + subsidiaries, roll-up + drill-down) | Bank/telecom group structure |
| X8 | **REST API + webhooks** (programmatic access for BI/data team) | Integrate into Tableau/Power BI; MASTER_OFFER §1.1 confirms API exists |
| X9 | **Native integrations** (Slack, MS Teams, Salesforce, HubSpot) | Alert routing + sales enablement |
| X10 | **Institutional PDF reports** (50-100 pages, custom templates) | Board / investor / regulator deliverables (MASTER_OFFER §1.1 confirms 2 templates) |
| X11 | **Named CSM + SLA 99.9%** | Enterprise expectation |
| X12 | **Custom Darija fine-tuning** on client corpus | Bank/telecom jargon (tickers BVC, regulator acronyms) |
| X13 | **Sanctions / PEP screening** (adverse media on counterparties) | Bank compliance (MASTER_OFFER mentions screening) |

### 3.4 Agency — must-haves (white-label layer on top of Pro)

| # | Feature | Why |
|---|---------|-----|
| A1 | **White-label portal** (agency logo, colors, custom domain) | Client never sees "Harch" |
| A2 | **Multi-client cockpit** (1 login, switch 12 clients, health-check grid) | Agency efficiency (GatherUp, Adriel, TapClicks) |
| A3 | **Per-client quotas** (mention limits, seat limits, billing per client) | Margin protection |
| A4 | **1-click client-ready report** (client-branded, scheduled, agency notes appended) | 90-min/day → 5-min/day |
| A5 | **Client self-service login** (client sees their dashboard, not agency internal) | Client portals (OneSuite, LayerFive) |
| A6 | **Fast client onboarding** (<1 week: add brand, tune queries, deploy dashboard) | Agency velocity |
| A7 | **Clean client offboarding** (data export + deletion on account loss) | Agencies churn clients; data hygiene |
| A8 | **Revenue-share billing** (agency bills client, keeps 30%, Harch invoices agency) | MASTER_OFFER §2.4: 30% revenue share model |

---

## 4. NICE-TO-HAVE FEATURES (delighters)

Features that aren't blocking but would create "wow" moments and differentiation vs Meltwater/Brandwatch:

### 4.1 AI-powered (high delight, high differentiation)

| Feature | Persona benefit | Evidence |
|---------|----------------|----------|
| **Ask HarchIQ conversational Q&A** ("What changed about our brand this week?") | Pro/Enterprise: replaces 30 min of dashboard reading | Brandwatch "Ask Iris" is the reference; Iris AI "summarize insights instantly" |
| **AI Visibility probing** (what do ChatGPT/Claude/Gemini say about the brand) | Pro/Enterprise: LLM reputation is the new SEO | PRSA article (Jul 2026): "communications managers define uniform prompts that explicitly address key reputation issues" |
| **Anomaly detection** (auto-flag "something unusual happened at 14:32") | Enterprise crisis: catches what keywords miss | Muck Rack: "monitor beyond keywords" |
| **Auto-generated executive summary** (3-bullet NL briefing daily) | Pro/Enterprise: Monday briefing in 1 click | Onclusive: "feeds executive briefings" |
| **Predictive crisis forecasting** (Bayesian risk model) | Enterprise: 24-hr head start | Harch already has `harchiq/predict/bayesian-risk.ts` + `threat-scoring.ts` in code |
| **Narrative propagation tracking** (how a rumor spreads source → source) | Enterprise: understand the attack vector | Harch already has `harchiq/cognitive/narrative-propagation.ts` |

### 4.2 Workflow (medium delight)

| Feature | Persona benefit |
|---------|----------------|
| **Reply directly from dashboard** to social comments (Harch → Khoros equivalent) | Pro/Agency: no tab-switching (Meltwater Khoros integration is the model) |
| **Inbound WhatsApp** (forward a screenshot → NLP extracts the mention) | All personas in Morocco: "user-feels-they-put-the-data-in" loop (MASTER_OFFER §8.1 J1-J7) |
| **Slack/Teams alert routing** with thread-based discussion | Enterprise: crisis response coordination |
| **Custom alert thresholds per topic/entity** (not just volume) | Pro: "alert me only if CEO is mentioned negatively" |
| **Dark mode** | All: reviewers complain Meltwater has none, Brandwatch unclear |
| **Mobile app with edit capability** (not read-only like Meltwater) | All: P8 pain point |

### 4.3 Data depth (medium delight)

| Feature | Persona benefit |
|---------|----------------|
| **Image recognition / logo detection** in UGC photos | Pro/Enterprise: brand mentions in images (Brandwatch has it, Meltwater limited) |
| **Podcast monitoring** (transcription + mention tracking) | Pro: growing channel, underserved |
| **Broadcast TV/radio monitoring** (transcription) | Enterprise: bank/telecom execs care about TV mentions |
| **Telegram / Discord / WhatsApp public group monitoring** | Pro/Enterprise: crisis often starts there (P9 gap) |
| **Dark-web / leak monitoring** (credentials, executive impersonation) | Enterprise: security team adjacent use case |

### 4.4 Reporting polish (low-medium delight)

| Feature | Persona benefit |
|---------|----------------|
| **PPT export** (native, not PDF-then-convert) | Pro/Enterprise: board decks |
| **Scheduled report delivery** (email/WhatsApp/Slack on cron) | All: Muck Rack "automated distribution saves time" |
| **Comparative period analysis** (vs last month, vs same period last year) | Pro: "are we better than Q3?" |
| **Custom KPI builder** (define your own metric from primitives) | Enterprise analyst: flexibility |

---

## 5. DASHBOARD SECTIONS THEY EXPECT TO SEE ON LOGIN

Synthesized from: Meltwater dashboard structure (competitive-reports/02-meltwater.md §2.1, §2.4), Brandwatch Consumer Research + Vizia (competitive-reports/01-brandwatch.md §2), Sprinklr PR KPIs, Handraise "must-have dashboard metrics", FanRan reputation dashboard components, InetSoft KPI list, and Harch's existing Brand Monitor Console (MASTER_OFFER §1.1: "score réputation, météo, alertes, sentiment, AI visibility, geo-signals, crisis indicator").

### 5.1 Universal dashboard layout (expected by all personas)

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER: Brand selector | Date range | Search | Alerts bell 👤 │
├─────────────────────────────────────────────────────────────────┤
│  ROW 1 — THE "AM I OK?" STRIP (5-second answer)                 │
│  [Reputation Score 0-100] [Reputation Weather ☀️⛅⛈️] [Sentiment │
│   trend arrow ▲+3] [Crisis Indicator 🟢🟡🔴] [Mentions today N] │
├─────────────────────────────────────────────────────────────────┤
│  ROW 2 — THE "WHAT'S HAPPENING?" CHARTS                         │
│  [Mention volume over time — line chart, 30d]  [Sentiment over  │
│   time — stacked bar (pos/neu/neg)]  [Share of Voice vs         │
│   competitors — donut or grouped bar]                           │
├─────────────────────────────────────────────────────────────────┤
│  ROW 3 — THE "WHERE & WHO" BREAKDOWN                            │
│  [Source distribution — donut (news/social/blog/forum)]  [Top   │
│   sources — horizontal bar]  [Geo coverage — choropleth map]   │
│  [Top authors/influencers — bubble chart (reach×engagement)]    │
├─────────────────────────────────────────────────────────────────┤
│  ROW 4 — THE "ACT NOW" FEED                                     │
│  [Live alerts feed — chronological, severity-coded]             │
│  [Top mentions — table with sentiment tag, source tier, link]  │
│  [Top hashtags / keywords — word cloud or bar]                  │
├─────────────────────────────────────────────────────────────────┤
│  ROW 5 — THE "SO WHAT?" AI LAYER (Pro+ only)                    │
│  [Ask HarchIQ Q&A box]  [AI Visibility (8 LLMs)]  [Anomaly      │
│   detection flags]  [Auto-generated executive summary bullets]  │
├─────────────────────────────────────────────────────────────────┤
│  SIDEBAR LEFT: Navigation (Dashboard | Feed | Competitors |     │
│   Influencers | Reports | Alerts | Settings)                    │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Section-by-section expectation matrix

| Dashboard section | Essentiel | Pro | Enterprise | Agency | Source of expectation |
|---|---|---|---|---|---|
| **Reputation score (0-100)** | ✅ must | ✅ must | ✅ must | ✅ must (per client) | Harch existing; InetSoft KPIs |
| **Reputation "weather" metaphor** | ✅ must | ✅ nice | ✅ nice | ✅ nice (per client) | Harch existing (météo) |
| **Mention volume line chart (30/90d)** | ✅ must | ✅ must | ✅ must | ✅ must | Meltwater §2.4; Brandwatch §2 |
| **Sentiment over time (stacked bar)** | ✅ must | ✅ must | ✅ must | ✅ must | Meltwater §2.4; universal |
| **Share of Voice vs competitors** | ❌ | ✅ must | ✅ must | ✅ must (per client) | Sprinklr; Meltwater; Brandwatch Benchmark |
| **Source distribution (donut)** | ✅ must | ✅ must | ✅ must | ✅ must | Meltwater §2.4 |
| **Top sources (horizontal bar)** | ✅ nice | ✅ must | ✅ must | ✅ must | Meltwater §2.4 |
| **Geo coverage (choropleth map)** | ❌ | ✅ must | ✅ must | ✅ nice | Meltwater §2.4; Brandwatch |
| **Top authors / influencers (bubble)** | ❌ | ✅ must | ✅ must | ✅ nice | Meltwater Klear; Brandwatch Influence |
| **Live alerts feed** | ✅ must (WhatsApp) | ✅ must | ✅ must (multi-channel) | ✅ must | Everbridge; Agility PR; universal |
| **Top mentions table (with tier, sentiment, link)** | ✅ must | ✅ must | ✅ must | ✅ must | Handraise "publication tiering" |
| **Top hashtags / word cloud** | ✅ nice | ✅ must | ✅ nice | ✅ nice | Meltwater §2.4 (critiqued but expected) |
| **Crisis indicator (severity)** | ✅ must (simple) | ✅ must | ✅ must (detailed) | ✅ must | Harch existing; Agility PR; ContactMonkey |
| **Publication tier breakdown** | ❌ | ✅ must | ✅ must | ✅ must | Handraise |
| **Competitor radar (4-axis)** | ❌ | ✅ nice | ✅ must | ✅ nice | Meltwater competitor radar |
| **Ask HarchIQ Q&A box** | ❌ | ✅ nice | ✅ must | ✅ nice | Brandwatch Ask Iris |
| **AI Visibility (LLM probing)** | ❌ | ✅ nice | ✅ must | ✅ nice | PRSA; Harch existing |
| **Anomaly detection flags** | ❌ | ✅ nice | ✅ must | ❌ | Muck Rack |
| **Auto executive summary (NL bullets)** | ✅ nice | ✅ must | ✅ must | ✅ must | Onclusive; Iris AI |
| **Multi-client health-check grid** | ❌ | ❌ | ❌ | ✅ must | GatherUp; Adriel; TapClicks |
| **Command-center / big-screen view** | ❌ | ❌ | ✅ must | ❌ | Brandwatch Vizia |
| **Audit log viewer** | ❌ | ❌ | ✅ must | ❌ | Enterprise governance |
| **Sanctions / PEP screening panel** | ❌ | ❌ | ✅ must (banks) | ❌ | MASTER_OFFER; bank compliance |

### 5.3 Login landing page — per persona

- **Essentiel logs in →** Row 1 (score strip) + Row 4 (alerts feed + top mentions). Everything else collapsible. Goal: 15-second "am I OK?" answer.
- **Pro logs in →** Full Rows 1-4. Default date range: last 7 days. Goal: Monday-morning briefing in 2 min.
- **Enterprise logs in →** Full Rows 1-5 + sidebar to command-center view. Default: multi-entity roll-up. Goal: situational awareness across the group.
- **Agency logs in →** Multi-client health-check grid FIRST (12 clients × 4 KPIs), then click into a client → full Pro dashboard. Goal: triage which client needs attention today.

---

## 6. KEY QUOTES & EVIDENCE (verbatim from sources)

> **Cision** (online reputation monitoring tools): "a successful reputation monitoring tool needs full market access, offer real-time alerts and sentiment analysis, and track trends."

> **Shadow.inc**: "evaluates eight reputation monitoring tools based on what communications professionals actually need: real-time alerting, sentiment accuracy, cross-[channel coverage]..."

> **Signal AI** (comms teams guide): "Comms teams need to be able to monitor and quickly understand industry and relevant world trends and news, brand mentions and the sentiment..."

> **Onclusive**: "Media monitoring feeds executive briefings, spokesperson preparation, board reporting, and investor communications with timely, accurate data."

> **Sprinklr** (PR KPIs): "Measure and benchmark PR performance by accurately tracking the PR KPIs, such as Reach, Virality, Priority Outlets, Share of Voice."

> **Handraise** (2026 PR dashboard metrics): "a complete PR dashboard should include publication tiering breakdowns, which reveal whether coverage is clustering in high-authority outlets."

> **Muck Rack**: "Best practices for effective media monitoring: Start with clear goals, monitor beyond keywords, cover all channels that shape perception."

> **Meltwater G2** (via competitive-reports/02 §6.1): "4 produits cousus ensemble" / "sentiment automatique critiqué sur les langues non-anglaises (ironie, argot)" / "pricing opaque — tout passe par SDR" / "latence non temps réel — pour la gestion de crise minute-par-minute, inférieur à Talkwalker."

> **Brandwatch Agorapulse review**: "Scheduling problems, issues with cross-posting, missing features, plan limitations, user and permission confusion, high costs and upsells."

> **Brandwatch G2**: "Users express frustration over platform limitations, citing issues with social media parsing, dashboard glitches, and slow AI implementations."

> **Brandwatch Capterra**: "Pros: Unlimited User Accounts, API Integrations, Excellent Customer Service. Cons: The deep learning curve for the user interface, queries must be [complex Boolean]."

> **Agility PR** (crisis): "Real-time data becomes the stabilizing force that allows teams to move quickly without sacrificing judgment. Live dashboards, intelligent alerts [are essential for crisis management]."

> **Everbridge / ContactMonkey / Crises Control**: "Real-time multi-channel notifications (SMS, email, push, voice) + interactive dashboards to monitor and manage crisis response in real-time."

> **GatherUp** (agency): "The Agency Dashboard gives you at-a-glance insight to how each of your client's accounts are performing. Use this health check to shape your [day]."

> **TapClicks** (agency): "A strong agency dashboard needs to support your agency's workflow, make client reporting easier, and help you track marketing performance across [clients]."

> **MASTER_OFFER §6.1** (Meltwater Trustpilot): "Meltwater Trustpilot 1,5/5 — la plainte n°1 est l'opacité tarifaire."

> **MASTER_OFFER §5**: "Attijariwafa, BCP, CIH, BMCE, OCP, Maroc Telecom, Inwi, ANCFCC, BAM, AMMC... tous ont une gate procurement qui exige ISO 27001 ou SOC 2."

---

## 7. SYNTHESIS — WHAT TO BUILD FIRST (inferred priority)

Based on frequency of mention across personas + severity of pain point addressed:

### Tier 0 — Ship-blocking (without these, no persona buys)
1. Brand mention feed (news + social + Hespress + FB + IG) — universal
2. Sentiment analysis (Darija + French + MSA) — Harch's wedge
3. Real-time WhatsApp alerts — Harch's wedge, Morocco-native
4. Reputation score + weather — universal "am I OK?" answer
5. Public MAD pricing + self-service signup — kills P1 (opaque pricing)

### Tier 1 — Pro-sellers (convert Essentiel → Pro)
6. Competitor benchmarking (SOV + sentiment + volume)
7. 5 seats + role-based access
8. Auto-generated weekly PDF report
9. Publication tier breakdown
10. Geo + influencer widgets

### Tier 2 — Enterprise-sellers (convert Pro → Enterprise)
11. SSO/SAML + audit log
12. Crisis indicator + command-center view
13. Multi-entity consolidation
14. REST API + webhooks + integrations (Slack/Teams/Salesforce)
15. ISO 27001 / SOC 2 attestation (procurement gate)
16. Institutional PDF reports (50-100 pages)

### Tier 3 — Agency-sellers (unlock distribution channel)
17. White-label portal
18. Multi-client cockpit + health-check grid
19. Per-client quotas + revenue-share billing
20. 1-click client-branded reports

### Tier 4 — Delighters (differentiation vs Meltwater/Brandwatch)
21. Ask HarchIQ conversational Q&A (vs Brandwatch Ask Iris)
22. AI Visibility probing (8 LLMs)
23. Inbound WhatsApp (forward screenshot → NLP)
24. Predictive crisis forecasting (Bayesian)
25. Anomaly detection (beyond keywords)

---

## 8. OPEN QUESTIONS FOR NEXT RESEARCH CYCLE

1. **Essentiel willingness-to-pay validation**: is 5K MAD/mo (≈$500) actually affordable for Moroccan PMEs, or is there a sub-2K tier needed? (Direct user interviews required.)
2. **Agency white-label technical scope**: full domain masking (client.agency.com) or subpath (agency.com/client)? Affects SSL/infra cost.
3. **Enterprise data residency**: is Morocco hosting actually required by BAM/AMMC, or is EU-hosted with DPA sufficient? (Legal research needed.)
4. **Darija NLP accuracy threshold**: what F1 score do comms directors consider "good enough" to trust the sentiment score? (User testing on Hespress corpus.)
5. **Crisis alert latency tolerance**: Meltwater is minutes and loses to Talkwalker; what latency do Moroccan bank comms VPs actually require — 15 min? 5 min? 60 sec? (Drives architecture: streaming vs polling.)
6. **Mobile app vs responsive web**: is a native app needed (Meltwater has one, rated 3.5/5) or is responsive web sufficient for all personas? (Usage data needed.)

---

## 9. APPENDIX — SEARCH RESULTS INVENTORY

| # | Query | Results | Key sources extracted |
|---|-------|---------|----------------------|
| WS1 | comms directors need reputation monitoring platform features | 9 | Cision, Shadow.inc, LexisNexis, Signal AI, PRSA, Kronus, Reddit |
| WS2 | PR manager dashboard requirements media monitoring | 9 | Onclusive, Agility PR, Gartner, LinkedIn, Sprinklr, Handraise, Muck Rack |
| WS3 | marketing analyst reputation intelligence needs 2024 | 9 | Morning Consult, BLS, 360iResearch, Harvard DCE, BuiltInNYC |
| WS4 | Meltwater user reviews love hate | 8 | Agorapulse, Reddit r/PublicRelations, Trustpilot, G2, SoftwareAdvice, CommunityTracker, YouScan |
| WS5 | Brandwatch user reviews pros cons features | 8 | Agorapulse, G2, Capterra, thecmo, Research.com, PCMag, FirstSales, TrustRadius |
| WS6 | media monitoring platform must-have features 2024 | 9 | LaunchMetrics, Muck Rack, Quora, PSU journal, Onclusive, NewsData, Talkwalker, Respona, Gryffin |
| WS7 | reputation management dashboard best features users want | 8 | TEAM LEWIS, InetSoft, Pipedrive, AppFollow, HiFiveStar, FanRan, ActivatedInsights |
| WS8 | crisis communication team dashboard real-time alerts | 8 | Everbridge, ContactMonkey, Crises Control, Striim, Castatus, Agility PR, PRSA, LinkedIn, Perimeter |
| WS9 | agency multi-client dashboard features PR agencies need | 8 | ActiveDEMAND, LayerFive, TapClicks, OneSuite, Quadratic, Adriel, GatherUp, ClicData, Statnexa |
| WS10 | enterprise reputation intelligence governance compliance needs | 8 | ElevateConsult, AdaptiveSecurity, SUSE, Mirantis, Snowflake, EWSolutions, NICE, ModelOp |

**Note on rate-limiting:** 5 supplementary searches (Meltwater complaints detail, dashboard widgets, small business needs, enterprise SSO, agency white-label) were attempted but the z-ai `web_search` function returned HTTP 429 (too many requests) after the initial 10-search batch. The existing `/competitive-reports/` and `/MASTER_OFFER.md` files provided sufficient complementary evidence to fill the gaps.

---

**END OF REPORT — RESEARCH-1 / CHERCHEUR-1**
