# Task 24-figma-trader — Agent Work Record

**Agent:** full-stack-developer (figma rework · trader)
**Task ID:** 24-figma-trader
**Scope:** Rework all 7 trader-role section UIs to Figma-grade quality using the new shared design-system primitives (`PanelCard`, `PanelHeader`, `StatTile`, `MetricRing`, `Tag`, `ProgressBar`, `StaggerGrid`, `MiniSparkline`, `Divider`, `EmptyState`).

## Files modified (ONLY `src/components/sections/trader/`)

1. `bvc-overview.tsx` — flagship showcase, full rewrite
2. `equities-screener.tsx` — full rewrite
3. `positions-blotter.tsx` — full rewrite
4. `indices-view.tsx` — full rewrite
5. `fx-rates.tsx` — full rewrite
6. `commodities-board.tsx` — full rewrite
7. `fixed-income.tsx` — full rewrite

No other files touched. Dispatcher, section-registry, design-system.tsx, section-header.tsx, chart-card.tsx, page.tsx, dashboard-shell, sidebar, topbar — all untouched.

## Design-system primitives adopted

- `PanelCard` (+ optional `accent` rail) — replaced every ad-hoc bordered div / `ChartCard` for premium hover-lift + accent rail
- `PanelHeader` — consistent icon chip + title + subtitle + action slot per panel
- `StatTile` — replaced every `KpiTile` in the KPI grids (with `accent="emerald"` for trader)
- `MetricRing` — animated SVG gauges for session stats (adv/dec/flat %), BAM key rate, MAD strength, curve slope
- `Tag` — replaced every ad-hoc badge (P&L %, side, sector, rating, "Live", counts)
- `ProgressBar` — animated horizontal bars for 52-week range, inflation vs target, sector exposure, curve term spreads
- `StaggerGrid` — wrapped KPI grids + heatmap grids + index-card grids + commodity-card grids for cascade entrance
- `MiniSparkline` — pure-SVG sparklines in mover rows, index cards, commodity cards (replaced recharts mini-charts for lightweight rendering)
- `Divider` — labeled dividers in session stats + curve stats panels
- `RoleAccent` type + `accentTokens` — trader accent = "emerald" applied to every PanelCard/StatTile/PanelHeader

## Premium UX features added

- **Brief mount skeleton** (300-320ms) on every section's KPI grid via `useReady()` + `KpiSkeleton` shimmer — premium first-paint feel
- **Hover tooltips** on BVC sector heatmap tiles (custom absolute-positioned tooltip with prev close + Δ)
- **Animated bars** for breadth (adv/flat/dec) and diverging sector performance bars
- **Gradient fills** on MASI intraday area, EUR/MAD area, USD/MAD area
- **Live pulse** indicator on BVC intraday header
- **Animated MetricRings** for session stats, BAM key rate, curve slope
- **Tabular-nums** everywhere (`tabular` class) for Bloomberg-terminal feel
- **Directional coloring**: emerald (up/positive), rose (down/negative), amber (warning/BAM/gold), sky (EUR/USD), slate (neutral)
- **Stagger entrance** via `StaggerGrid` + per-card `delay` for cascade effect
- **Hover lift** on every `PanelCard` (framer-motion spring)
- **Premium tables**: shadcn `Table` with sticky headers, `harch-scroll` slim scrollbars, hover rows (`hover:bg-slate-50`), directional P&L coloring, `Tag` badges for chg/side/rating

## Per-section highlights

### BVC (flagship)
- 6 StatTile KPIs (MASI, MASI 20, Advancers, Decliners, Turnover, Session Range) with emerald accent + skeleton
- MASI Intraday area chart (gradient fill, live pulse, open reference line, footer legend with Δ)
- MASI 30-day dual-axis line chart
- Sector Heatmap with 8 tiles + custom hover tooltips
- Session Statistics with 3 MetricRings (adv/dec/flat), animated breadth bar, range ProgressBar, breadth tilt indicator
- Sector Performance diverging bars (emerald/rose from center axis)
- Session Movers tabs (Gainers/Losers/Most Active) with 30-day MiniSparkline per row

### Equities Screener
- 5 StatTile KPIs (Total Mkt Cap, Gainers, Losers, Avg P/E, Sectors)
- Screener table with sticky header, sort icons, emerald active-row highlight, sector filter chips (All + 9 sectors, emerald active)
- Equity Detail panel: MetricRing-style layout, 30-day Sparkline (recharts), 8 DetailStat tiles, 52-week range ProgressBar with threshold at 50%
- Sector Market Cap Distribution: stacked horizontal bar + 8 sector legend chips with MiniSparkline-ready layout

### Positions Blotter
- 5 StatTile KPIs (Gross Exposure, Net M2M P&L, Long, Short, Win Rate)
- P&L by Position bar chart with gradient fills (emerald up / rose down), Tag side badges in tooltip
- Long/Short split with animated proportional bar + dual StatTile-style cards
- Sector Exposure panel with ProgressBar (emerald/rose tone by P&L) + sector color dots
- Premium blotter table: 9 sortable columns, sticky header, hover rows, Tag for side + % P&L, directional P&L coloring

### Indices View
- 4 StatTile KPIs (MASI, MASI 20, Best Sector, Worst Sector)
- 30-day comparison line chart with legend toggles (click to hide/show series), baseline ReferenceLine at 100
- 8 IndexCards (PanelCard) with MiniSparkline + sector color dot + Tag for chg%
- Index Performance Summary table: 7 columns with sector color dots, Tag for chg%, directional YTD coloring

### FX & Rates
- 5 StatTile KPIs (EUR/MAD, USD/MAD, GBP/MAD, MAD Strength) — all emerald accent
- MAD Crosses 30-day multi-line chart (sky/emerald/amber for EUR/USD/GBP)
- Bank Al-Maghrib panel: MetricRing (key rate as % of 5%), inflation ProgressBar with target threshold, next meeting card, MAD Strength card with Tag
- EUR/MAD + USD/MAD 30-day area charts with gradient fills, prev-close reference lines, Tag for chg%

### Commodities Board
- 5 StatTile KPIs (Total Notional, Largest Exposure, Best, Worst, Phosphate)
- 6 CommodityCards (PanelCard) with per-commodity semantic icon chips, MiniSparkline, Tag for chg%, YTD directional color
- HarchCorp Notional Exposure horizontal bar chart with per-commodity colors + custom tooltip
- Commodities Detail table: 5 columns with color dots, Tag for chg%, directional YTD

### Fixed Income
- 5 StatTile KPIs (13W, 10Y, 2s10s Spread, Avg Yield, Corporate Outstanding)
- BAM Treasury Yield Curve line chart (emerald current + slate dashed previous, 3% reference line)
- Curve Stats panel: MetricRing for slope score, 5 term-spread rows with ProgressBar (emerald/rose by direction) + bps labels, curve shape indicator
- Corporate Bonds table: 9 columns with sector chips, Tag for rating (positive/warning/negative by A/BBB/lower), hover rows

## Verification

- `bun run lint` → **0 errors, 0 warnings**
- `dev.log` → all GET / return 200, no runtime errors, no compile errors
- **agent-browser** sweep across all 7 trader sections (BVC, Indices, Equities, Positions, FX & Rates, Commodities, Fixed Income) → all render with correct headings + panels + charts
- **Mobile responsive** (390×844) verified on BVC → all 7 panels stack correctly
- **Footer sticky** verified: layout uses `min-h-screen flex flex-col` + `main flex-1` + footer as sibling → correct sticky pattern
- **Zero console errors** (only pre-existing DialogContent aria-describedby warning, not introduced by this task)
- **No regression**: admin Users & Roles renders (6 headings: Seat Usage, Role Distribution, Access Highlights, Workspace Security Posture, Users, RBAC Matrix); legal Regulatory Risk renders (5 headings: Regulator × Status Heatmap, Filing Risk Distribution, Upcoming Filing Calendar, Regulatory Obligations Register)
- Screenshots saved: `.qa/v14-trader-bvc.png`, `v14-trader-bvc-fresh.png`, `v14-trader-bvc-mobile.png`, `v14-trader-indices.png`, `v14-trader-equities.png`, `v14-trader-positions.png`, `v14-trader-fx.png`, `v14-trader-commodities.png`, `v14-trader-fixed-income.png`, `v14-admin-users.png`, `v14-legal-regulatory.png`

## Issues / risks

- None. All 7 trader sections compile, render, and pass lint. Trader accent = emerald applied consistently. Data imports from `market-data.ts` unchanged. Dispatcher + section-registry untouched.
- Note: the pre-existing `Warning: Missing Description for DialogContent` console warning is from shadcn dialog (not introduced here) and is cosmetic.
