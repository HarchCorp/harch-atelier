# MELTWATER DASHBOARD INTELLIGENCE REPORT

**Agent:** ESPION-1 (Harch Atelier competitive intelligence)
**Date:** 2026 research sweep
**Method:** Web search of meltwater.com, community.meltwater.com, developer.meltwater.com, third-party reviews (G2, SoftwareOne, Vendr), and press releases

---

## Executive Summary

Meltwater is a mature, modular media-intelligence platform covering **paid + earned + shared + owned (PESO) media** across 100M+ sources in 190 countries and 96 languages. Its dashboard layer (rebuilt Oct 2025 as "Unified Dashboards" inside **Analyze**) is widget-based, drag-and-drop, templated, and exportable to PDF/PPTX/Google Slides. The platform is organized into distinct products — **Explore** (search & monitoring), **Analyze** (dashboards), **Engage** (social inbox & publishing), **Media Relations** (journalist DB + press release distribution), **Influencer Marketing** (formerly Klear), **GenAI Lens** (LLM visibility), and **Mira** (in-platform AI assistant) — each sold as add-on modules. Pricing is quote-based, ranging ~$6k/yr Starter → ~$25k Pro → ~$130k+ Enterprise.

---

## Platform Map (top-level navigation)

| Module | Purpose |
|---|---|
| **Explore** | Media-monitoring search hub: build Boolean searches, view results, save searches |
| **Analyze** | Unified Dashboards: widget-based, templated, scheduled reports |
| **Engage** | Unified social inbox + publishing/scheduling across platforms |
| **Media Relations** | Journalist database, media lists, press release distribution |
| **Influencer Marketing (Klear)** | Influencer discovery, vetting, campaign tracking, ROI |
| **GenAI Lens (GAIL)** | AI-visibility monitoring across ChatGPT/Claude/Gemini/Perplexity/Grok |
| **Mira** | In-platform conversational AI assistant + MCP tools |
| **Alerts** | Spike detection + mention alerts via Slack/Teams/Email/Mobile |
| **Settings / Admin** | Users, roles, SSO, social connections, integrations |

---

## Dashboard Sections (detailed)

### 1. Explore — Media Monitoring Hub
- **What it shows**: Real-time mentions from online news, print, broadcast TV/radio, podcasts, blogs, forums, and social. Boolean + natural-language query builder. Saved searches become the data source for every other module.
- **Key widgets / tabs**: "Exploratory tabs" auto-generated analysis view; filter sets; content stream (article cards with title, source, date, snippet, sentiment tag, reach, engagement); in-stream magnifying-glass "Ctrl+F for media" filter.
- **Charts**: Mentions-over-time line, source-type breakdown, sentiment timeline, top authors, top sources, top countries, trending hashtags, word cloud / key phrases.
- **User actions**: Filter by date / language / country / source type / sentiment / reach / author; tag articles; export to dashboard; add journalists to media lists from inside results; save & schedule as Digest Report email.
- **Plan availability**: All plans (depth of sources scales). Explore+ API on Pro+.

### 2. Analyze — Unified Dashboards (the core "dashboard" surface)
- **What it shows**: Customizable canvas of widgets pulling from saved Explore searches. Pre-built templates: **Brand**, **Benchmark**, **Campaign**, **Crisis**, **Executive**, **Influencer**. Rebuilt Oct 2025 to unify paid/earned/owned in one view.
- **Key widgets** (full library observed):
  - Total Mentions (KPI number)
  - Total Mentions by Source Type (bar/donut)
  - Share of Voice (multi-series bar — you vs competitors)
  - Potential Reach (KPI + trend)
  - Media Exposure / AVE (advertising value equivalent)
  - Sentiment over time (line, 5-level: very neg / neg / neutral / pos / very pos)
  - Sentiment breakdown (donut)
  - Top Sources (ranked table)
  - Top Authors (ranked table)
  - Top Countries (heat map / geo)
  - Trending Themes / Topics (bubble chart or ranked list)
  - Word Cloud / Key Phrases
  - Hashtag Analytics
  - AI Positive & Negative Analysis widget (rebuilt standardized framework)
  - Heat Map Widget (geo intensity)
  - Narrative summary widget
  - AI Insight explainer (per-widget — wand icon generates plain-English "what's happening")
- **User actions**:
  - Create Unified Dashboard → pick template → pick searches → auto-populates widgets
  - Edit mode: Add new row, Add widget, Rename dashboard/tabs, Rearrange (drag-and-drop), Delete, Apply filters
  - Per-widget: hover → click **wand icon** to generate AI insight summary in seconds
  - Save as new template; duplicate; share link
- **Charts**: line, bar, stacked bar, donut, bubble, heat map, word cloud, ranked tables, KPI tiles.
- **Plan availability**: Analyze dashboards on all plans; advanced widgets (AVE, narratives, AI Positive/Negative) on Pro+.

### 3. Sentiment Analysis (cross-cutting)
- **What it shows**: **5-level sentiment scoring** (very negative → very positive) plus **entity-level analysis** — sentiment broken down per entity (brand, product, person, competitor) within the same article. Reduces "neutral bias."
- **Charts**: sentiment timeline (multi-line), sentiment donut, sentiment-by-source stacked bar, sentiment spike overlay.
- **User actions**: Override sentiment per mention; filter dashboard to negative-only; trigger alert on sentiment spike.
- **Plan availability**: Basic sentiment on Starter; 5-level + entity-level on Pro+.

### 4. Social Listening (inside Explore + dedicated Social module)
- **Platforms covered**: X/Twitter, Facebook, Instagram, TikTok (official Marketing Partner), YouTube, LinkedIn, Reddit, blogs, forums, review sites, Threads (scheduling in Engage), podcasts.
- **Key widgets**: conversation volume, sentiment, themes & narratives, audience demographics, emoji analytics, image recognition (logo detection), trending hashtags.
- **Charts**: volume trend, sentiment trend, share-of-voice vs competitors, top posts feed, audience interest affinities, geo map.
- **User actions**: Build advanced search; connect owned social pages via Social Connections; compare queries side-by-side; export to Analyze dashboard.
- **Plan availability**: Core social listening on all plans; image recognition, advanced demographics on Pro+.

### 5. GenAI Lens (GAIL) — AI Visibility Tracking
- **What it shows**: How major LLMs (ChatGPT, Claude, Gemini, Perplexity, Grok, Google AI Overviews) mention your brand, products, and competitors — and how those mentions evolve. Auto-stores each prompt run with sentiment, key phrases, brands mentioned.
- **Key widgets**:
  - AI prompt results feed (each LLM response stored & tagged)
  - Brand mention frequency per LLM (bar)
  - Sentiment of AI responses (donut)
  - Key phrases extracted from AI responses (word cloud / list)
  - Competitor benchmarking in AI answers (SOV across LLMs)
  - Accuracy score (factual accuracy of brand claims in AI answers)
  - Placement / share-of-answer (where brand appears in response — top, mid, footnote)
- **User actions**: Build prompt sets; schedule recurring runs; compare LLMs side-by-side; export AI-visibility report; integrate into Unified Dashboard.
- **Plan availability**: Add-on module (announced Jul 29, 2025). Pricing not public; sold separately.

### 6. Influencer Marketing (Klear)
- **What it shows**: Discovery, vetting, and campaign tracking. Dashboard visualizes recent campaigns + shortcuts to discovery/analysis.
- **Key widgets**:
  - True Reach (verified, not vanity follower count)
  - Audience Authenticity score (bot/fake-follower detection)
  - Engagement rate
  - Brand affinity (does the influencer's audience align with your brand?)
  - Influencer search grid (filter by platform, followers, location, language, interests, gender)
  - Campaign performance table (posts, reach, engagement, EMV)
  - Influencer comparison side-by-side
  - Audience demographics (age, gender, geo, interests)
- **User actions**: Search/discover influencers; add to lists; vet authenticity; outreach; track campaign ROI; multi-client programs with white-label reporting.
- **Plan availability**: Add-on module. Agency plan supports white-label.

### 7. Media Relations — Journalist Database & Press Releases
- **What it shows**: Continuously updated journalist profiles pulled from multiple publications/outlets into a single DB. AI-powered recommendations for who to pitch.
- **Key widgets**:
  - Journalist search grid (filter by beat, outlet, location, language, topics covered, recent articles)
  - Journalist profile card (contact info, recent articles, social profiles, pitching notes)
  - Media lists (saved groups)
  - Pitch email composer with AI personalization
  - Press release distribution dashboard (pickup tracking, reach, outlets covered, AI visibility)
  - Coverage attribution (which outlets picked up your release)
- **User actions**: Filter journalists; build media lists; send personalized pitch emails; distribute press release via newswire; track pickups; integrate with CRM (Salesforce).
- **Plan availability**: Add-on module.

### 8. Engage — Social Inbox & Publishing
- **What it shows**: Unified inbox consolidating comments + DMs across connected social profiles. Plus publishing/scheduling calendar.
- **Key widgets**:
  - Unified inbox (comments + DMs across FB, IG, X, TikTok, LinkedIn, Threads)
  - Post composer with scheduling calendar
  - Bulk scheduling
  - Moderation queue (hide, delete, assign, label)
  - Assignment workflow (route to team members)
  - Capture untagged mentions (catch brand mentions not @-mentioned)
- **User actions**: Reply, like, hide, delete, assign to teammate, label/tag, schedule posts, bulk upload, route cases to Salesforce Service Cloud.
- **Plan availability**: Add-on. Salesforce integration separate.

### 9. Reporting & Exports
- **What it shows**: Auto-generated, scheduled, branded reports.
- **Key features**:
  - Unified Dashboard = report (one source of truth)
  - Pre-built templates (Brand, Benchmark, Campaign, Crisis, Executive)
  - **Scheduled reports**: auto-email as PDF or PowerPoint on recurring basis (daily/weekly/monthly)
  - **Export options**: PDF (current tab), PowerPoint (current tab), Add to Google Slides
  - Digest Reports: automated emails delivering latest articles from saved Explore searches on schedule
  - Custom branding / white-label (Agency)
  - PESO integration (paid, earned, shared, owned in one report)
- **User actions**: Build once → schedule → forget; share link; export to deck; embed in client portal.
- **Plan availability**: PDF export all plans; PPTX/Google Slides + scheduling on Pro+; white-label on Agency.

### 10. Real-Time Alerting & Crisis Detection
- **What it shows**: Two alert types — **Mention alerts** (per-mention notification) and **Spike Detection** (anomaly detection when volume exceeds saved-search baseline). AI-powered.
- **Delivery channels**: Slack, Microsoft Teams, email, mobile push. Delivered within **2–5 minutes** of publication.
- **Key widgets**:
  - Spike detection overlay on volume chart
  - Sentiment spike detection (negative sentiment anomaly)
  - Alert configuration panel (threshold, source filters, sentiment filters, quiet hours, recipients)
- **Crisis-specific**:
  - Custom crisis dashboards (keyword + sentiment + geo + influencer reach)
  - Blackbird.AI partnership (Jul 2024) for narrative-attack / misinformation detection
  - DEFCON-style escalation implied via Slack/Teams routing
- **User actions**: Configure alert rules; set baselines; route to channels; trigger crisis dashboard; pause non-critical alerts during crisis.
- **Plan availability**: Mention alerts all plans; Spike Detection on Pro+; Blackbird.AI integration Enterprise.

### 11. Competitive Benchmarking & Share of Voice
- **What it shows**: Side-by-side comparison of you vs competitors across visibility, sentiment, topics, reach.
- **Key widgets**:
  - Share of Voice bar (multi-series, by mention volume or reach)
  - Competitor sentiment comparison
  - Topic trajectory (which topics each competitor owns)
  - Coverage volume trend (multi-line)
  - Reach comparison
  - Top sources per competitor
- **User actions**: Build "comparison search" in Explore (multiple saved searches); pull into Benchmark template dashboard; export.
- **Plan availability**: SOV on all plans; advanced competitor benchmarking on Pro+.

### 12. Broadcast Monitoring (TV / Radio / Podcast)
- **What it shows**: Original audio + video content with searchable transcripts inside Meltwater.
- **Coverage**: 3,000+ new podcasts daily from 25,000+ channels, multi-language; TV and radio broadcast transcription.
- **Key widgets**: Broadcast mentions feed with clip player, transcript search, segment timing, AVE per clip.
- **User actions**: Search transcripts; clip segments; export clips; add to dashboard.
- **Plan availability**: Add-on.

### 13. Mira — AI Assistant
- **What it shows**: Chat-based AI assistant inside Meltwater. Turns real-time data into summaries + action plans.
- **Capabilities**:
  - Instant media-coverage summaries
  - Brand briefings
  - News briefings (daily/weekly digests in natural language)
  - Generate dashboard insights (per-widget wand icon)
  - Narrative summaries
  - Multi-turn conversation with streaming responses
  - Grounded in real-time news + social data (cited)
  - **Mira API** for developers (streaming, multi-turn)
  - **MCP tools** — bring Meltwater intelligence into external AI assistants and MCP-compatible apps; cited insights, create reports, track alerts from outside the platform
- **User actions**: Ask questions in natural language; get cited answers; generate action plans; ask Mira to build a dashboard.
- **Plan availability**: Mira rolled out May 2025 mid-year release; included on most plans, advanced features (MCP, API) on Pro+/Enterprise.

### 14. API & Integrations
- **APIs**:
  - **Explore+ API**: advanced search, filtering, analytics on news + social mentions, custom fields, managed searches
  - **Mira API**: AI assistant layer with streaming + multi-turn
  - **BYOC (Bring Your Own Content)**: upload custom JSON content, indexed and searchable in Meltwater
  - Exporting Mentions API (templated exports)
- **Native integrations**: Salesforce (Service + Sales Cloud, AppExchange), HubSpot, Slack (marketplace app), Microsoft Teams, Power BI, Tableau, Domo, Google Studio (Looker), Microsoft Dynamics, MailChimp, Google Docs.
- **User actions**: Push mentions to CRM as leads/cases; pipe alerts to Slack channels; embed Meltwater data in BI dashboards; upload proprietary content.
- **Plan availability**: API access Enterprise; some integrations (Slack/Teams) on Pro+.

### 15. Enterprise Governance
- **Features**:
  - SAML 2.0 SSO (strongly recommended; no documented SCIM auto-provisioning as of Jan 2026)
  - Role-based access control (RBAC) with custom roles
  - Federated governance controls (multi-region, multi-BU)
  - Audit trail (admin activity logging)
  - Enterprise-grade data governance
  - Cross-department scalability
  - Trust Center (trust.meltwater.com) with security FAQ
- **Plan availability**: Enterprise only.

### 16. Agency / Multi-Client
- **Features**:
  - Multiple clients and campaigns simultaneously
  - Centralized dashboards per client
  - **White-label reporting** (custom domain, agency logo, agency colors on Agency plan)
  - Automated client delivery (scheduled reports)
  - Global data coverage for multi-market agencies
  - Multi-client influencer programs with white-label
- **User actions**: Switch between client workspaces; generate branded client reports; bulk-schedule; embed in client portal.
- **Plan availability**: Agency plan (custom pricing).

---

## Pricing Tiers (indicative, USD/yr)

| Tier | Indicative Range | Typical Access |
|---|---|---|
| **Starter / Essential** | $6,000 – $15,000 | Explore + basic Analyze dashboards + alerts |
| **Pro / Standard** | $15,000 – $40,000 | + Advanced sentiment, SOV, scheduled PPTX, integrations |
| **Enterprise** | $40,000 – $150,000+ | + API, SSO, RBAC, audit, Blackbird.AI, federated governance |
| **Agency** | Custom | + White-label, multi-client, multi-market |
| **Add-ons** | Separate | GenAI Lens, Influencer (Klear), Media Relations, Engage, Broadcast |

(Source: meltwater.com/en/blog/meltwater-pricing Jul 2026, archive.com, vendr.com, spendhound.com — final quotes always custom-negotiated.)

---

## Key Features We Should Copy

1. **Unified Dashboard with widget library** — drag-and-drop, templated (Brand / Benchmark / Crisis / Executive), every widget AI-explainable via hover wand.
2. **5-level sentiment + entity-level analysis** — kills the "everything is neutral" problem; per-entity sentiment inside one article is a power move.
3. **Spike Detection with multi-channel routing** (Slack / Teams / Email / Mobile, 2–5 min latency) — table stakes for crisis.
4. **Scheduled PDF/PPTX/Google Slides exports** — "build once, schedule forever" is a killer agency workflow.
5. **Digest Reports** — automated email summaries of saved searches (cheap to build, huge perceived value).
6. **GenAI Lens (AI visibility)** — track brand across ChatGPT/Claude/Gemini/Perplexity/Grok with sentiment, key phrases, accuracy, placement. This is the 2025-2026 differentiator and Harch should build it day one.
7. **Influencer True Reach + Audience Authenticity** (bot-detection) — Klear's vetting score is more credible than follower counts.
8. **Media Relations with AI pitch personalization + press release AI-visibility tracking** — closes the loop from pitch → pickup → AI citation.
9. **Mira conversational AI grounded in cited real-time data** — natural-language dashboard building ("make me a crisis dashboard for brand X in the last 7 days").
10. **Exploratory tabs auto-generated analysis view** — one-click "analyze this search" without manual widget-building.
11. **Bring-Your-Own-Content (BYOC) API** — let customers upload internal docs / Slack / Zendesk tickets into the same index.
12. **MCP tools** — expose Meltwater as an MCP server so customers can query it from Claude Desktop / Cursor / custom agents. Future-proof.
13. **PESO integration** — paid + earned + shared + owned in one dashboard. Harch should at least surface paid (Meta/Google ad spend) alongside earned.
14. **White-label for agencies** (custom domain + logo + colors) — direct revenue lever.
15. **Broadcast monitoring with searchable transcripts** (TV/radio/podcast, 3,000+ podcasts/day) — depth moat.

---

## Features They're Missing (Our Opportunity)

1. **No documented SCIM auto-provisioning** (Stitchflow, Jan 2026) — Harch can win enterprise IT by shipping SCIM day one alongside SAML.
2. **GenAI Lens is an add-on, not core** — Harch can make AI-visibility a first-class dashboard tab, not a paid extra.
3. **No real WhatsApp native alerting** — Meltwater routes via Slack/Teams/email/mobile push but does not natively push to WhatsApp. Harch's WhatsApp toggle in Account Settings is a genuine differentiator (esp. for Africa/MENA/LATAM markets).
4. **Crisis DEFCON not standardized** — Meltwater relies on Spike Detection + Blackbird.AI partnership; Harch can ship a built-in DEFCON 1-5 escalation ladder with auto-routing per level.
5. **Pricing opacity** — Meltwater forces sales calls; Harch can publish transparent tiered pricing and self-serve onboarding (Stark contrast to ~$6k starting price).
6. **No ZKP / WebAuthn passkey native auth** — Meltwater recommends SAML SSO but offers nothing for passwordless / ZKP. Harch's ZKP lab is a defensible security moat.
7. **French / Arabic / localization gaps** — Meltwater's UI is English-first; Harch's FR/AR native + Africa/Casablanca timezone defaulting is a regional wedge.
8. **No native image/logo recognition as a standalone widget** — Meltwater has it buried in social listening; Harch can make a "Logo Sightings" widget front-and-center for brand teams.
9. **Mira is chat-only** — Harch can ship an agentic Mira that proactively schedules reports, drafts pitches, and books journalist meetings without prompting.
10. **No native client-portal / stakeholder view** — Meltwater relies on scheduled PDFs and shared dashboard links; Harch can build a branded read-only client portal with SSO.
11. **AVE (advertising value equivalent) is dated** — Meltwater still ships AVE widgets; Harch can lead with modern comms ROI metrics (incremental reach, share of conversation, AI-citation lift).
12. **No native survey / first-party data integration** — Meltwater is purely external-signal; Harch can pair social listening with brand-tracking surveys for closed-loop attribution.
13. **No real-time competitive pricing / product monitoring** — Meltwater tracks competitor *mentions*, not competitor *pricing changes* or *product launches* (scraped). Harch can add a competitor-pricing module.
14. **No native ROI attribution to revenue** — Meltwater stops at "media exposure"; Harch can wire mentions → Salesforce opportunities → revenue (true closed-loop PR ROI).
15. **No native multi-brand portfolio view** — for holding companies / multi-brand enterprises, Meltwater's workspaces are clunky; Harch can build portfolio-level rollup dashboards.

---

## Sources (verified)

- meltwater.com/en/products/* (media-monitoring, social-influencers, genai-lens, media-database, press-distribution, pr-reporting, real-time-alerting)
- meltwater.com/en/capabilities/* (media-intelligence, social-listening, ai-visibility-tracking)
- meltwater.com/en/blog/* (unified-dashboards-launch-announcement Oct 2025; meltwater-pricing Jul 2026; ai-visibility Dec 2025; crisis-comms-meltwater-summit Jun 2026; mira-ai-assistants Mar 2026)
- meltwater.com/en/press-releases/meltwater-unveils-mira (May 2025); meltwater-debuts-genai-lens (Jul/Aug 2025)
- community.meltwater.com (Explore, Analyze, Alerts, Unified Dashboards, Narratives, Share of Voice, Digest Reports)
- developer.meltwater.com (Explore+ API, Mira API, BYOC, Exporting Mentions)
- trust.meltwater.com (SSO/SAML FAQ)
- slack.com/marketplace, appexchange.salesforce.com (integrations)
- Third-party: G2, SoftwareOne, Vendr, Spendhound, Archive.com, Rephonic, Wise, YouScan, Pulsar, XSeek, Podchaser, DashSocial, ExplodingTopics, Stitchflow
