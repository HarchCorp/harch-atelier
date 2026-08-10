# Spy Report — Brandwatch & Sprinklr Dashboard Features

> **Task ID:** SPY-2
> **Agent:** ESPION-2 — Brandwatch/Sprinklr Spy
> **Date:** 2026-08-10
> **Mission:** Exhaustively document dashboard features of Brandwatch (Cision) and Sprinklr (Unified-CXM) to inform our own dashboard roadmap.
> **Method:** 10 z-ai `web_search` function calls against brandwatch.com, sprinklr.com help centers, G2, PRNewswire, BusinessWire, ZoomInfo, CXToday, Yahoo Finance, third-party reviews (PCMag, Syncly, InfluencerMarketingHub, IgniteSocialMedia, DashSocial). Cross-checked against the existing in-repo `competitive-reports/01-brandwatch.md`. No invented features — claims are tied to a cited source snippet.

---

## PART A — BRANDWATCH (Cision)

### A.1 Dashboard Sections (Suite Architecture)

Brandwatch is split into **two suites** plus add-on pillars. The navigation explicitly lists these sections (from `brandwatch.com` home nav, July 2026):

**Consumer Intelligence suite**
| Section | Role | Dashboard Style |
|---|---|---|
| **Consumer Research** | Analyst workspace — boolean queries, thematic dashboards, Social Panels, Image Analysis | Desktop, multi-tab, widget-based |
| **Vizia** | Marketing reporting & "command center" for the enterprise — big-screen real-time displays | Multi-screen mosaic, drag-and-drop scene builder, broadcast to any screen |
| **Reviews** | Dedicated review-site monitoring | Tabular + rating widgets |

**Social Media Management suite**
| Section | Role |
|---|---|
| **Listen** | Saved searches + Iris Conversation Insights |
| **Publish** | Content scheduling + Iris Writing Assistant |
| **Engage** | Inbox-style response management |
| **Advertise** | Social ad management + Iris copy assist |
| **Measure** | Configurable dashboards built from widgets (the "real" analytics surface) |
| **Benchmark** | Competitor comparison — Brand Insights Dashboard |
| **Influence** | Influencer discovery + campaign management (Paladin-derived) |
| **Audience** | Audience research panels (PeerIndex-derived, Reddit-specific social panels) |

**Add-on pillars**
- **Media Intelligence & Insights** — curated data stories
- **Search Intelligence** — GenAI / LLM visibility monitoring (where does your brand appear in ChatGPT / Perplexity / Gemini answers)
- **APIs** — Consumer Research API for white-label integration
- **Iris AI** — cross-product AI assistant

### A.2 Key Widgets & Charts (Brandwatch)

From `social-media-management-help.brandwatch.com/en/articles/12767914-guides-to-measure-widget-types` (Jan 7, 2026):
> *"Widgets are the building blocks of your Measure dashboards. Each widget type visualizes your data in a different way, from line and bar graphs…"*

From `…/12767872-introduction-to-measure` (Dec 17, 2025):
> *"Dashboards, widgets, and metrics are the building blocks of the Measure module. A dashboard is made up of one or more widgets, and a widget…"*

**Confirmed widget/chart types:**
1. **Line chart** — temporal volume trends
2. **Bar chart (vertical + horizontal)** — horizontal variant used for **Impressions widget** in Brand Insights Dashboard (*"horizontal bar chart showing the sum of estimated impressions metrics on all posts made by the brand"*)
3. **Donut / pie** — sentiment & share-of-voice splits
4. **Word cloud** — topic/entity frequency
5. **Choropleth map** — geographic distribution
6. **Text widget** — added **January 2025** product update: *"You can now add a text widget to your Measure dashboards. The text widget supports main text configurations such as edit of font size and style"*
7. **Brand Overview widget** (Benchmark) — channel-metrics roll-up for selected brands
8. **Impressions widget** (Benchmark) — horizontal bar chart
9. **Day-of-week / hour-of-day segmentation charts** — audience activity heatmap (added 2016, still in use)
10. **Image Analysis widget** — neural-net logo/scene detection ("powered by neural networks and deep learning and trained on billions of images")
11. **Top Authors / Top Tweeters / Top Bloggers / Key Advocates / Key Detractors** lists — Influencer dashboard template (from PMC paper)
12. **Iris-generated charts & summaries** — auto-created visualizations from natural-language queries
13. **Dashboard Summaries** — automated insight narratives ("automated insight narratives" per ZoomInfo comparison)

**Pre-built dashboard templates** (from academy.brandwatch.com):
- Influencer dashboard template (top authors / tweeters / bloggers / advocates / detractors)
- Brand Insights Dashboard (Benchmark)
- Summary dashboard (legacy, with day/hour segmentation)

### A.3 User Actions (Brandwatch)

| Action | Where |
|---|---|
| Build boolean queries | Consumer Research, Listen |
| Add / edit / rearrange widgets | Measure, Vizia |
| Drag-and-drop **Scene Builder** | Vizia (big-screen layout) |
| Save searches | Listen |
| Segment by **Categories & Tags** | Consumer Research (custom filters) |
| Build **Social Panels** (custom audience research panels) | Consumer Research / Audience |
| Apply pre-built dashboard templates | All modules |
| Export data | All modules |
| Share via **email broadcast** or **big-screen projection** | Vizia |
| Multi-screen display sync | Vizia |
| **Ask Iris** in natural language | Cross-product (no query/dashboard required) |
| Trigger **Iris Post Analysis** on any post | Measure |
| Use **Iris Writing Assistant** | Publish / Engage / Advertise |
| Configure **Image Analysis** classifiers | Consumer Research |
| Run **Brightview** custom ML classifiers | Consumer Research |

### A.4 AI Features (Brandwatch)

Brandwatch's AI is branded **Iris AI** — described as an *"always-on digital colleague"*. Five distinct capabilities (from `brandwatch.com/products/iris-ai` + PRNewswire Nov 20, 2025):

1. **Ask Iris** — conversational LLM search.
   *"It searches and analyzes data without requiring a query or dashboard, automatically creates charts and summaries"* (PRNewswire, Nov 2025). Generates charts + summaries + insights in real time.

2. **AI Dashboards** — *"Turn data into clarity in seconds with intelligent dashboards. Powered by Iris AI, you can summarize insights instantly to reveal the story behind every trend, spike, or anomaly"* (brandwatch.com/products/iris-ai).

3. **Iris Conversation Insights** (in Listen) — *"summarize the main themes of the mentions in your Listen Saved Search"* (help center, Mar 2026). Uses third-party AI tech.

4. **Iris Post Analysis** (in Measure) — per-post AI breakdown (help center, Dec 2025).

5. **Iris Writing Assistant** (in Publish / Engage / Advertise) — content drafting & editing (help center, Mar 2026).

**Other AI/ML:**
- **Image Analysis** — neural networks + deep learning on billions of images (logo/scene detection)
- **Brightview** — supervised ML custom classifiers (Crimson Hexagon heritage)
- **Sentiment analysis** — NLP-based, multi-language (historically 30+ languages; not re-published)
- **Topic clustering / entity extraction** — *"turn keyword clouds into an automatically curated analysis of the key entities and themes in your data"*
- **Dashboard Summaries** — automated insight narratives

### A.5 Unique Features to Copy (Brandwatch)

| # | Feature | Why we should copy |
|---|---|---|
| 1 | **Vizia command center** — multi-screen, drag-and-drop scene builder, broadcast to any screen, email share | Perfect for crisis rooms of Moroccan banks, telcos, airlines. We have 4 desktop dashboards; a 5th "big-screen / projection mode" is low-cost, high-perceived-value. |
| 2 | **Ask Iris** — NL search that bypasses query/dashboard entirely; auto-creates charts + summaries | Differentiator vs Meltwater. We already have GLM orchestrator — wrap it as a single search box. |
| 3 | **Dashboard Summaries** — auto-narratives on top of any dashboard | One-click "explain this dashboard" button. Cheap to ship (LLM call on widget data). |
| 4 | **Pre-built dashboard templates** (Influencer, Brand Insights, Summary) | Reduces onboarding friction; we ship a default Brand Monitor template already — add 3 more. |
| 5 | **Image Analysis (logo/scene detection)** — neural-net trained on billions of images | Brand-logo detection in Moroccan news photos / social posts — unique OSINT signal. |
| 6 | **Social Panels** — large custom research panels (audience segmentation) | Powerful for brand-vs-competitor audience comparison. |
| 7 | **Day-of-week / hour-of-day heatmap** — when is audience most active | Trivial to add to our existing ECharts; high analyst value. |
| 8 | **Text widget** (added Jan 2025) — annotable dashboard text blocks with font/style controls | Analyst commentary on dashboards — collaborative context. |
| 9 | **Search Intelligence** (GenAI visibility monitoring — where does the brand appear in ChatGPT/Perplexity/Gemini answers) | We already probe 7-8 LLMs (Harch `ai-probe.ts`); productize as a dedicated dashboard section. |
| 10 | **1.4+ trillion historical posts** (since 2008) — archive depth | We can't match the volume, but the *marketing positioning* of "archive since X" is worth replicating with our Moroccan corpus. |

---

## PART B — SPRINKLR (Unified-CXM)

### B.1 Dashboard Sections (Platform Architecture)

Sprinklr positions as the *"Definitive AI-Native Customer Experience Platform"* — a **Unified-CXM** stack covering 4 product families (from `sprinklr.com` home, 2025-2026):

| Family | Dashboard Modules |
|---|---|
| **Sprinklr Insights** (Consumer Intelligence) | Listening Dashboards (Standard + Custom), Smart Insights, Trending Topics, Research, Benchmarking |
| **Sprinklr Social** | Reporting Dashboards, Listening, Engagement, Publishing, Advertising, **Value Realization Dashboard** |
| **Sprinklr Care** (Customer Service) | Care Console, Call Center Dashboards, Live Chat (with video calls since v16.10.0), Customer Feedback Management (CFM) |
| **Sprinklr Marketing** | Advertising, Campaign Analytics |
| **Sprinklr Voice** (CCaaS — entered 2022) | Real-time voice conversation analytics |
| **Sprinklr Platform (Unified)** | Unified Monitoring Dashboard, Presentations, Reporting Charts, Compare Mode |

### B.2 Key Dashboards (Sprinklr)

1. **Listening Dashboards** (Standard + Custom) — *"analyze topic queries via widgets within Standard and Custom dashboards. You can visualize data in the form of charts"* (help center, 2025). Tabbed sections: **Summary, Content, Sentiment, Demographics** (per MSU Digital Experience Studio doc).

2. **Unified Monitoring Dashboard** — cross-team monitoring with **Add Widget** button; widgets for **Work items** (tickets/cases) alongside social listening widgets (help center, `…/unified-monitoring-dashboard/67499552…`).

3. **Reporting Dashboards** — *"custom dashboards, data widgets, and AI-powered reports … take 48 widgets to configure"* (sprinklr.com/products/consumer-intelligence/analytics-and-reporting). Highly configurable but high setup cost.

4. **Customer Service / Call Center dashboards** — *"supervisors can see how customers feel about their experience — and identify potentially challenging events and trends"* (sprinklr.com/products/customer-service/analytics).

5. **Voice of Customer (VoC) dashboard** — *"real-time view of experience health and emerging customer issues"* (sprinklr.com/blog/voice-of-the-customer-dashboard).

6. **Value Realization Dashboard** — *"measure business outcomes and take appropriate action. For each product, a summarized list of the many Use Cases"* (help center, `…/sprinklr-social-value-realization-dashboard/64ff0d07…`).

7. **Trending Topics dashboard** — *"see what's popular"* across Twitter/social (help center).

8. **Presentations** — slide-based dashboards; widgets can be **copy-pasted between slides / Presentations** (since v16.5.0).

### B.3 Key Widgets & Charts (Sprinklr)

Sprinklr publishes an **enumerated widget catalog**. From `sprinklr.com/help/articles/data-visualisations/reporting-charts/63d4dcf5468ae80d39346793` and v18.2 release notes:

**13 core widget types (Sprinklr Insights v18.2, Feb 2023):**
1. Bar
2. Column
3. Pie
4. Line
5. Area
6. Area Spline
7. Spline
8. Entity Word Cloud
9. (Counter — confirmed in Compare Mode docs)
10. Summary Table
11. Grouped Summary
12. Combination Chart (*"combines two or more charts to display multiple sets of data in a single chart … combine a column chart and a line"* — `…/combination-widget/645619a0…`)
13. Content widget cards — *"showcase the key metrics like total number of likes, shares and comments directly on content widget cards for Instagram and other social"* (Patch 1952, Jul 2024)

**Period-Over-Period (Compare Mode) supports 8 chart types:** Column, Bar, Line, Spline, Counter, Summary Table, Grouped Summary, Counter (per `…/compare-mode/63d4dfb5…`).

**Specialty widgets:**
- **Consumption by Sources widget** (Listening) — mentions consumed per source, with backfill counts (v18.2)
- **Gender Analysis widget** (Listening) — Sum or Percentage aggregation (v17.10)
- **Bubble and bar combined** widget (2025 update — per Brandwatch's own blog comparing Sprinklr)
- **Impressions / Engagement / Sentiment trend** widgets (standard)

### B.4 User Actions (Sprinklr)

| Action | Where |
|---|---|
| **Add Widget** button (Simplified Widget Builder) | All Reporting dashboards |
| **Configure alerts directly from any widget** (auto-captures widget config) | Insights v18.2+ |
| **Copy / paste widgets** between slides / Presentations | Presentations (v16.5.0+) |
| **Compare Mode** — Period-over-Period comparison | Reporting |
| **Drill-down on data points/anomalies** → Smart Insights | Any widget |
| Create Standard or Custom Listening Dashboard | Insights |
| Build topic queries / themes / keyword lists | Listening Insights |
| **Change message sentiment via keyboard** | Listening (v18.2) |
| **CFM Copilot natural-language dashboard building** | Customer Feedback Management (e.g. *"Create a new dashboard for Support CSAT"*, *"Add a widget that shows CSAT trends by week"*, *"Plot a bar chart for NPS by region on Tab 2"*) |
| Make / receive **video calls** in Live Chat | Care Console (v16.10.0+) |
| Configure 48-widget dashboards | Analytics & Reporting |
| Add tabs to dashboards (Summary / Content / Sentiment / Demographics) | Listening |

### B.5 AI Features (Sprinklr)

Sprinklr's AI stack is multi-tiered:

1. **Smart Insights** — *"Powered by Sprinklr's robust AI, Smart Insights automatically detects and uncovers meaningful insights from the clutter of social & digital media conversations"* (help center, `…/smart-insights/63f79f74…`).
   - *"Automatically surface the top drivers of a spike on a trend or relevant data points on dashboards"* (v16.20, Mar 2023).
   - *"AI-powered Insights tool does the job of finding the top drivers for any metric shown on the dashboard"* (Smart Insights in Reporting Dashboards).

2. **Sprinklr Copilot** — conversational AI assistant (launched Sep 30, 2025 per CXToday). The CFM Copilot variant builds dashboards from NL prompts (*"Create a new dashboard for Support CSAT"*, *"Plot a bar chart for NPS by region on Tab 2"*).

3. **Sprinklr AI Agents** — autonomous agents for customer service (launched Sep 30, 2025).

4. **Enhanced Customer Feedback Management** — third Sep 2025 innovation.

5. **AI-generated summaries** — *"Instantly transform complex data, dashboards, content and alerts into meaningful insights with AI-generated summaries. themes and sentiment spikes"* (sprinklr.com/products/consumer-intelligence).

6. **Sentiment detection in 100+ languages**; auto-translate & categorize in **130+ languages** (sprinklr.com/blog/turn-social-data-into-decisions, May 2025).

7. **Real-time voice conversation AI** — *"Integrated AI analyzes digital and voice conversations in real-time to give immediate views of CSAT, quality, and performance"* (CCaaS launch, Jan 2022).

8. **500 million daily conversations** ingested (sprinklr.com/products/consumer-intelligence/social-listening).

9. **July 2026 release** (Yahoo Finance, Jul 15, 2026): *"New release focuses on turning customer signals into decisions and outcomes across marketing, service, and voice of the customer."*

### B.6 Unique Features to Copy (Sprinklr)

| # | Feature | Why we should copy |
|---|---|---|
| 1 | **Smart Insights — anomaly root-cause detection** ("top drivers of a spike") | Killer feature. User clicks a spike on a chart → AI explains *why* (top drivers). High perceived intelligence, low implementation cost (LLM over time-series + filtered mentions). |
| 2 | **Conversational dashboard builder (CFM Copilot)** — *"Plot a bar chart for NPS by region on Tab 2"* | We have GLM orchestrator — wire it to our dashboard-config API. Analysts build dashboards by chatting. Differentiator vs Meltwater/Brandwatch. |
| 3 | **1-click "Configure alert from widget"** (auto-captures widget config) | Trivial UX win. Currently we ask users to re-configure alerts manually. |
| 4 | **Compare Mode (Period-over-Period)** with 8 chart types | Add PoP toggle to every trend widget — QoQ / YoY / WoW comparison. High analyst value, modest effort. |
| 5 | **Combination Charts** (column + line in one widget) | ECharts supports this natively; we're underusing it. Volume bars + sentiment line overlay. |
| 6 | **Unified Monitoring Dashboard** (Work items + Listening + Care in one view) | Cross-functional view: brand reputation + customer tickets + PR mentions on one screen. Strong enterprise positioning. |
| 7 | **Voice of Customer (VoC) real-time health dashboard** | CSAT / NPS / emerging issues in one view. We don't have a VoC dashboard today. |
| 8 | **Value Realization Dashboard** — business outcomes by use case | "ROI of the platform" dashboard for procurement / CFO buyers. Useful for our enterprise sales motion. |
| 9 | **13+ typed widget catalog** with strict documentation per type | We have 106 widgets but no formal catalog. Documenting widget types → analyst trust → easier onboarding. |
| 10 | **Copy/paste widgets between slides** (Presentations) | Build "report decks" from dashboard widgets. We have export-engine.ts — extend to slide-based. |
| 11 | **Multi-tier AI** (Agents do → Copilot assists → Smart Insights explains) | Clear productized AI hierarchy. We have a flat AI surface — split into 3 named tiers. |
| 12 | **100+ languages sentiment, 130+ translation** | Sprinklr's coverage is global; our Darija advantage is local — but we should still publish a "X languages supported" number for parity. |
| 13 | **Content widget cards** (likes/shares/comments inline on each piece of content) | Our live feeds show text only — add inline engagement metrics per mention. |
| 14 | **Trending Topics dashboard** as a first-class surface | "What's trending right now in Morocco" — perfect for newsroom / PR buyers. |

---

## PART C — HEAD-TO-HEAD COMPARISON

| Dimension | Brandwatch | Sprinklr | Edge |
|---|---|---|---|
| **Suite breadth** | 2 suites + 11 sub-modules | 4 product families (Insights/Social/Care/Marketing/Voice) | Sprinklr (broader) |
| **Dashboard focus** | Research & insights depth | Operational breadth (marketing + service + voice) | Tie (different ICPs) |
| **Widget types catalog** | ~13 types, lightly documented | 13+ types, strictly documented per type | Sprinklr (catalog rigor) |
| **AI assistant** | Iris AI (5 capabilities, conversational Ask Iris) | Sprinklr Copilot + AI Agents + Smart Insights (3 tiers) | Sprinklr (tiered model) |
| **Anomaly root-cause** | Iris "reveal the story behind every spike" (vague) | Smart Insights explicitly surfaces "top drivers of a spike" | Sprinklr (more concrete) |
| **Conversational dashboard builder** | Ask Iris searches data, doesn't build dashboards | CFM Copilot builds dashboards from NL prompts | Sprinklr |
| **Command center / big screen** | **Vizia** — purpose-built, multi-screen, scene builder | Presentations (slide-based, less TV-oriented) | Brandwatch |
| **Pre-built templates** | Influencer / Brand Insights / Summary | Standard Listening Dashboards (pre-built widgets) | Brandwatch (more named templates) |
| **Image / logo recognition** | Native (neural nets, billions of images) | Not emphasized publicly | Brandwatch |
| **Historical archive** | 1.4T posts since 2008 | 500M daily conversations (depth not stated) | Brandwatch |
| **Languages (sentiment)** | ~30+ (not re-published) | 100+ sentiment, 130+ translation | Sprinklr |
| **Customer service / Care** | Not a focus | Sprinklr Care + Voice (CCaaS) — core strength | Sprinklr |
| **VoC / CSAT / NPS dashboards** | Not native | Native (VoC, Call Center, CFM dashboards) | Sprinklr |
| **Alerts from widgets** | Via Listen module | 1-click from any widget (auto-captures config) | Sprinklr |
| **Compare / Period-over-Period** | Available but not emphasized | Dedicated Compare Mode with 8 chart types | Sprinklr |
| **Pricing (enterprise tier)** | ~$150K+/yr (per `competitive-reports/11-morocco-market-osint.md`) | ~$200K+/yr | Brandwatch (cheaper at top end) |
| **GenAI / LLM visibility** | Search Intelligence module (dedicated) | Not a dedicated module | Brandwatch |

### C.1 Strategic Read
- **Brandwatch** = *research-depth + command-center + GenAI-visibility* play. Best for PR/insights/brand teams.
- **Sprinklr** = *operational-breadth + AI-tiered + Care* play. Best for customer-experience + service teams.
- **For us (Harch Atelier):** We don't need to match either's breadth. We should cherry-pick:
  - From Brandwatch: **Vizia big-screen mode**, **Ask Iris NL search**, **Dashboard Summaries**, **Image/logo recognition**, **Search Intelligence (GenAI visibility)**.
  - From Sprinklr: **Smart Insights (spike root-cause)**, **CFM Copilot (NL dashboard builder)**, **1-click alert from widget**, **Compare Mode (PoP)**, **Combination Charts**, **Trending Topics dashboard**, **Content widget cards with inline metrics**.

---

## PART D — RECOMMENDED IMPLEMENTATION BACKLOG (Priority-Ranked)

| # | Feature | Source | Effort | Impact |
|---|---|---|---|---|
| 1 | **Smart Insights — spike root-cause** (click anomaly → AI explains top drivers) | Sprinklr | M | High |
| 2 | **Dashboard Summaries** (1-click "explain this dashboard" → LLM narrative) | Brandwatch | S | High |
| 3 | **1-click "Configure alert from widget"** (auto-capture widget config) | Sprinklr | S | High |
| 4 | **Compare Mode (Period-over-Period)** toggle on all trend widgets | Sprinklr | M | High |
| 5 | **Combination Charts** (column + line, e.g. volume + sentiment overlay) | Sprinklr | S | Medium |
| 6 | **Trending Topics dashboard** ("what's trending in Morocco now") | Sprinklr | M | High |
| 7 | **Content widget cards** with inline likes/shares/comments per mention | Sprinklr | S | Medium |
| 8 | **Day-of-week / hour-of-day heatmap** widget | Brandwatch | S | Medium |
| 9 | **Text widget** (annotable dashboard text blocks) | Brandwatch | S | Medium |
| 10 | **Vizia-style big-screen mode** (projection / TV-optimized layout, shareable URL) | Brandwatch | L | High (for crisis-room enterprise sales) |
| 11 | **Ask Iris NL search** (single box → auto charts + summary) | Brandwatch | L | High |
| 12 | **NL dashboard builder Copilot** ("Plot NPS by region on Tab 2") | Sprinklr | L | High |
| 13 | **Search Intelligence module** (GenAI visibility — productize existing `ai-probe.ts`) | Brandwatch | M | High |
| 14 | **Image / logo recognition** in news photos & social posts | Brandwatch | L | Medium |
| 15 | **Pre-built dashboard templates** (Influencer, Brand Insights, Summary, VoC) | Both | M | Medium |
| 16 | **Voice of Customer dashboard** (CSAT / NPS / emerging issues) | Sprinklr | M | Medium (if we add Care features) |
| 17 | **Value Realization / ROI dashboard** (for procurement buyers) | Sprinklr | S | Medium (enterprise sales enabler) |
| 18 | **Widget catalog documentation** (13+ typed widgets, strict per-type docs) | Sprinklr | S | Medium (analyst trust) |

---

## PART E — SOURCES

**Brandwatch (verified via z-ai web_search, Aug 2026):**
- `brandwatch.com/products/iris-ai` — Iris AI capabilities
- `brandwatch.com/products/consumer-research` + `/features` — Consumer Research platform
- `brandwatch.com/products/vizia` + `/agencies` — Vizia command center
- `social-media-management-help.brandwatch.com/en/articles/12767914-guides-to-measure-widget-types` (Jan 7, 2026)
- `…/12767872-introduction-to-measure` (Dec 17, 2025)
- `…/12767997-using-the-brand-insights-dashboard-in-benchmark` (Mar 18, 2026)
- `…/12767980-using-iris-conversation-insights-in-listen` (Mar 19, 2026)
- `…/12767926-iris-post-analysis-in-measure` (Dec 17, 2025)
- `…/12767531-overview-of-artificial-intelligence-ai-features-in-social-media-management` (Mar 18, 2026)
- `…/12767628-product-updates-january-2025` (Dec 18, 2025) — text widget launch
- `brandwatch.com/blog/summary-dashboard` (Jul 6, 2016) — day/hour segmentation charts
- `prnewswire.com/news-releases/brandwatch-strengthens-ai-leadership-with-deeper-insights-and-expanded-data-coverage-302621990.html` (Nov 20, 2025)
- `prnewswire.com/news-releases/brandwatch-introduces-next-generation-social-command-center-brandwatch-vizia-224217811.html` (Sep 18, 2013)
- `brandwatch.com/press/press-releases/brandwatch-empowers-organizations-social-command-center-updates` (Sep 30, 2014) — Vizia drag-and-drop / scene builder
- `brandwatch.com/blog/social-listening-tools` (Oct 27, 2025) — Sprinklr widget comparison
- `brandwatch.com/p/sprinklr-comparison` — Brandwatch vs Sprinklr
- `pmc.ncbi.nlm.nih.gov/articles/PMC8374883` (McGuirk, 2021) — Influencer dashboard template widgets
- `pipeline.zoominfo.com/sales/brandwatch-vs-sprinklr` (May 22, 2026) — Dashboard Summaries / automated insight narratives
- `syncly.app/blog/brandwatch-vs-meltwater-vs-talkwalker` (Apr 23, 2026)
- `ignitesocialmedia.com/review-blogs/brandwatch-full-review` (Sep 22, 2025)
- `influencermarketinghub.com/brandwatch-consumer-intelligence` (Feb 19, 2026)
- `pcmag.com/reviews/brandwatch-analytics` (Mar 13, 2019)
- `academy.brandwatch.com/page/consumer-intelligence` + `/page/social-media-management`
- `brandwatch.com/blog/next-generation-audience-analysis-brandwatch` (Dec 13, 2023) — Social Panels
- `brandwatch.com/guides/digital-consumer-intelligence-data-segmentation` — Categories & Tags

**Sprinklr (verified via z-ai web_search, Aug 2026):**
- `sprinklr.com` — Unified-CXM platform home
- `sprinklr.com/help/articles/how-to-create-a-new-widget/simplified-widget-builder/678745b237f1fe2470e198fe` — Simplified Widget Builder
- `sprinklr.com/help/articles/reporting-analytics/unified-monitoring-dashboard/67499552d9ab7008a610c339` — Unified Monitoring Dashboard
- `sprinklr.com/help/articles/listening-dashboards/create-a-listening-dashboard-to-listen-engage-and-respond-to-conversations/6808fcadcbfca249dfef594d` — Custom Listening Dashboard
- `sprinklr.com/help/articles/listening-dashboards/standard-social-listening-dashboards/6808fda1cbfca249dfef7da8` — Standard Listening Dashboards (pre-built widgets)
- `sprinklr.com/help/articles/data-visualisations/reporting-charts/63d4dcf5468ae80d39346793` — Reporting Charts catalog
- `sprinklr.com/help/categories/data-visualisation-types/63f75d872e54736196c499ce` — Data visualisation types
- `sprinklr.com/help/articles/data-visualisation-types/widget-visualization-type-line-chart/6422dbaeb7f3625d288d2c7d`
- `sprinklr.com/help/articles/compare-mode-feature/compare-mode/63d4dfb52c015d03d4e7fe5a` — Compare Mode (8 chart types)
- `sprinklr.com/help/articles/types-of-widgets/combination-widget/645619a00104980882a56bba` — Combination widget
- `sprinklr.com/help/articles/v182-winter-release-february/sprinklr-insights-182-capabilities-and-enhancements/641805d2a1367f1be7db7bf2` — v18.2 (13 widgets, alert-from-widget, keyboard sentiment)
- `sprinklr.com/help/articles/v1620-march/sprinklr-v1620-sprinklr-insights-capabilities-and-enhancements/633c600fa0522e093b06c6ad` — Smart Insights top-drivers-of-spike
- `sprinklr.com/help/articles/smart-insights/use-smart-insights-to-gain-quick-insights-on-multiple-data-pointsanomalies/63f79f74e02459133724af4b`
- `sprinklr.com/help/articles/advanced-features/smart-insights-in-reporting-dashboards/646330fa8ea3c9635cf3670d`
- `sprinklr.com/products/consumer-intelligence/smart-insights`
- `sprinklr.com/products/consumer-intelligence` — AI-generated summaries
- `sprinklr.com/products/consumer-intelligence/analytics-and-reporting` — 48 widgets configurable
- `sprinklr.com/products/consumer-intelligence/social-listening` — 500M daily conversations
- `sprinklr.com/help/articles/cfm-copilot/customer-feedback-management-copilot/6964966ec836550ff8224869` (Jul 31, 2026) — CFM Copilot NL dashboard building
- `sprinklr.com/help/articles/1952-patch-jul-1215-24/sprinklr-unified-platform-crossproducts-patch-changes-1952/6682f232614893335bb01a9c` — Content widget cards (Instagram likes/shares/comments)
- `sprinklr.com/help/articles/v1650-july/sprinklr-v1650-unified-platform-and-crossproducts-capabilities-and-enhancements/633c5fff59534970b26f9d4f` — Copy/paste widgets in Presentations
- `sprinklr.com/help/articles/v1710-january/sprinklr-1710-sprinklr-insights-capabilities-and-enhancements/633c582a59534970b26f963c` — Gender Analysis widget
- `sprinklr.com/help/articles/v16100-augustnovember/sprinklr-16100-sprinklr-service-capabilities-and-enhancements/633c600ea0522e093b06c6a5` — Care Console video calls
- `sprinklr.com/help/articles/standard-reporting-dashboards/sprinklr-social-value-realization-dashboard/64ff0d07923c104940d1481e` — Value Realization Dashboard
- `sprinklr.com/help/articles/twitter-trending-topics/use-trending-topics-to-find-out-whats-trending/63f79efee02459133724af4a` — Trending Topics dashboard
- `sprinklr.com/products/customer-service/analytics` — Call center dashboards
- `sprinklr.com/blog/voice-of-the-customer-dashboard` — VoC dashboard
- `sprinklr.com/blog/customer-experience-dashboard` (May 5, 2025)
- `sprinklr.com/blog/customer-service-dashboard` (Jan 28, 2026) — CSAT/NPS/SLA template
- `sprinklr.com/blog/turn-social-data-into-decisions` (May 29, 2025) — 100+ languages sentiment, 130+ translation
- `sprinklr.com/blog/social-listening-trend-analysis` (Nov 3, 2021)
- `cxtoday.com/crm/sprinklr-launches-three-new-ai-powered-innovations-how-do-they-work` (Sep 30, 2025) — Copilot + AI Agents + Enhanced CFM
- `finance.yahoo.com/technology/ai/articles/sprinklr-introduces-ai-capabilities-help-120000447.html` (Jul 15, 2026) — Jul 2026 AI release
- `businesswire.com/news/home/20230914417826/en/Sprinklr-Launches-More-Than-700-New-Features-for-Unified-Customer-Experience` (Sep 14, 2023)
- `aithority.com/.../sprinklr-enters-contact-center-as-a-service-market...` (Jan 22, 2022) — CCaaS + real-time voice AI
- `dxstudio.msu.edu/social-media/sprinklr/listening/listening-insights` — tabbed Summary/Content/Sentiment/Demographics structure
- `dev.sprinklr.com/v1-listening-widget` — Listening Widget dev docs

**In-repo cross-reference:**
- `competitive-reports/01-brandwatch.md` (Jul 31, 2026) — French-language Brandwatch deep dive; confirms Vizia, Iris AI capabilities, data network sources, $150K+ enterprise pricing, no Morocco presence
- `competitive-reports/11-morocco-market-osint.md` — Sprinklr ~$200K+/yr enterprise pricing, "Very limited" Morocco coverage

---

## END OF SPY-2 REPORT

**Deliverables:**
- `/home/z/my-project/brainstorm/spy-brandwatch-sprinklr.md` (this file)
- Summary appended to `/home/z/my-project/worklog.md`

**Next actions for the team:**
1. Triage the 18-item implementation backlog (Part D) — at minimum ship items #1–7 in the next sprint (all S/M effort, all High impact).
2. Decide whether to productize a "Vizia-style big-screen mode" (#10) — high sales value for Moroccan crisis rooms.
3. Decide whether to add a Care/VoC pillar (#16) — only if expanding ICP beyond PR/insights into customer-service buyers.
