# Harch Atelier — Competitive Analysis

## 1. Bloomberg Terminal
**Layout:** Ultra-dense, multi-panel. Command line + 4-quad grid. Color-coded (green/red for up/down).
**Key patterns:**
- Fixed left rail with function codes
- Data density: 32px rows, monospace numbers, minimal whitespace
- Real-time updates with visual pulse on changing values
- Color semantics: green=positive, red=negative, amber=warning, white=neutral
- No empty states — always shows last known value

## 2. Signal AI (closest competitor)
**Layout:** Clean corporate dashboard. White cards on light background.
**Key patterns:**
- Risk Dashboard with 15 risk pillars (Geopolitical, Supply Chain, Regulatory, etc.)
- Risk Matrix: scatter plot with quadrants (Code Red, Constant Threats, Emerging, Monitor)
- Company summary bar: horizontal segmented bar showing risk counts per entity
- Filters: Company, Risk Level, Risk Category, Keywords, Time Period — all in header
- Data tables with severity color-coding
- Bubble size = article volume, color = negative % share
- 30+ risk event types tracked in 120+ languages

## 3. Recorded Future
**Layout:** Intelligence graph + temporal timeline. Dark theme option.
**Key patterns:**
- Network/graph visualization for entity relationships
- Impact & Metrics dashboard: pulls from alerts, integrations, threat detections
- Temporal risk timeline with annotated events
- Confidence scoring on intelligence assessments
- Source attribution on every data point

## 4. Meltwater
**Layout:** Media intelligence dashboard. Clean, marketing-friendly.
**Key patterns:**
- Brand Analytics Tab: AI-generated snapshot of brand performance
- Sentiment analysis with positive/neutral/negative breakdown
- Share of Voice: donut chart comparing brand vs competitors
- Social listening feed: real-time mentions with sentiment tags
- Export to PDF for board presentations

## 5. Sayari
**Layout:** Due diligence workspace. Graph-based.
**Key patterns:**
- Corporate registry data from 400+ jurisdictions
- Beneficial ownership graph visualization
- Sanctions screening: CLEAR/ELEVATED/PROHIBITED status
- Adverse media scanner with severity tags
- Export to regulatory-format PDF

## 6. Blackbird.AI
**Layout:** Narrative intelligence. Constellation dashboard.
**Key patterns:**
- Narrative tracking: identify and follow emerging narratives
- Bot detection and coordinated influence detection
- Narrative attribution to actors/campaigns
- Crisis level indicator: GREEN/ORANGE/RED
- Sentiment velocity metric (rate of change, not just absolute)

## Design Principles Extracted

### Information Architecture
1. **Top:** Global KPIs (risk score, coverage volume, alert count)
2. **Upper middle:** Temporal overview (timeline/trend)
3. **Middle:** Analytical cross-sections (matrix, sentiment, share of voice)
4. **Lower middle:** Qualitative detail (sources, influencers, entities)
5. **Bottom:** Raw data table (filterable, sortable, actionable)

### Empty State Design
- Signal AI: "No risks detected in this period" with a subtle illustration
- Sayari: "Screening complete — no matches found" with green checkmark
- Blackbird.AI: "No active narratives" with suggestion to adjust filters
- **Harch Atelier standard:** Professional empty state with icon, message, and suggested action. No fake data. No loading skeleton that looks like data.

### Color Semantics
- Critical/Prohibited: Rose (#e11d48)
- High/Elevated: Orange (#ea580c)
- Medium/Warning: Amber (#d97706)
- Low/Monitor: Slate (#64748b)
- Positive/Clear: Emerald (#10b981)
- Neutral: Slate (#94a3b8)

### Typography
- Headlines: Inter, 11px uppercase, slate-500, tracking-wider
- Data values: JetBrains Mono, tabular-nums
- Body: Inter, 12-13px, slate-700
- Table rows: 32px height, text-xs
