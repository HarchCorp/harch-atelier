# Task ID: 28-figma-self
## Agent: full-stack-developer (figma rework · self)
## Task: Rework self role (SelfWatchView) UI to Figma-grade quality using the new design-system layer.

## File modified
- `src/components/dashboard/self-watch-view.tsx` (full rewrite, ~860 lines)

## What was reworked
- Hero banner: elevated glassmorphism (slate-900 → cyan-950) with 3 motion layers — breathing cyan glow blob, breathing emerald glow blob (offset 1s), slow diagonal shimmer sweep (9s loop). Premium avatar with breathing cyan-400 ring + cyan-500→cyan-700 gradient. Time-of-day greeting. 4 summary chips with backdrop-blur + Radix tooltips + LIVE pulse.
- Personal KPI row: 4 StatTiles with accent="cyan" + per-KPI semantic MiniSparkline (cyan/rose/violet/emerald) + delta (invertDelta-aware) + Radix tooltip.
- Pinned Entities: 4 motion.button cards in nested StaggerGrid. Each has: priority stripe (cyan/amber/slate) that widens w-1→w-1.5 on hover, MetricRing (size=44, INVERTED tone via riskTone() helper — score≥70=rose, ≥50=amber, else=emerald), sentiment delta with emerald/amber/rose tint, MiniSparkline, top news headline, priority Tag + "Open" affordance with chevron translate. Click → EntityProfileDialog (verified with HarchCorp).
- Alerts Digest: PanelCard (cyan accent) + PanelHeader (AlertTriangle icon chip + 3 severity Tags). 6-item list with Radix-tooltip-wrapped pulsing severity dots (animate-pulse on unack only), SLA Tag (negative if breach), severity Tag, quick-acknowledge button. EmptyState primitive for empty.
- Quick Actions: PanelCard (cyan accent) + "Self" Tag. 3 shortcut buttons with per-action tinted icon chips, scale-105 on hover, chevron translate. Fires toast.success.
- Saved Views: PanelCard (cyan accent) wrapping nested StaggerGrid of 4 preset motion.button cards with whileHover y:-2 spring lift, per-view tinted icon chips, chevron translate. Fires toast.success.
- Watchlist + Activity: reused existing components wrapped in motion.div for cascade participation (ChartCard chrome visually consistent with PanelCard).
- Stagger entrance: whole view wrapped in motion.div with local containerVariants (staggerChildren=0.05) + TooltipProvider delayDuration=150. Direct children use motion.div variants={itemVariants} for cascade.
- Loading skeleton: kept 380ms useReady gate; rewrote SelfWatchSkeleton with 7 shimmer Skeleton blocks (rounded-2xl) matching new PanelCard geometry.

## Design-system primitives adopted
- PanelCard (with accent rail = "cyan") — alerts digest, quick actions, saved views, pinned entity fallback
- PanelHeader — alerts digest, quick actions, saved views (icon chip + title + subtitle + action slot)
- StatTile — 4 KPIs (accent="cyan", MiniSparkline children, delta, hint)
- MetricRing — 4 pinned entity risk gauges (size=44, stroke=4, custom riskTone())
- Tag — severity badges, SLA chips, priority badges, "Self" badge
- MiniSparkline — KPI sparklines + pinned entity 12-pt slices
- StaggerGrid — whole-view container + nested KPI/pinned/saved-view sub-grids
- EmptyState — cyan-accented empty state for alerts digest
- motionVariants — item variant for cascade children
- Removed: ad-hoc Sparkline, RiskRing, EmptyState, SeverityBadge (replaced with Tag), ad-hoc bordered-div cards

## Verification (all passed, zero console errors)
- `bun run lint` → 0 errors, 0 warnings
- dev.log → only Fast Refresh compile messages (transient EADDRINUSE during system-initiated restart cleared after ~60s)
- agent-browser: SELF renders (h1 "My Watch", h2 "Burning the midnight oil, Bauer", 4 KPIs, 4 pinned cards, alerts, quick actions, saved views, watchlist, activity). 127 SVGs, 31 motion elements, 4 pulsing severity dots, 95 tabular instances.
- Pinned entity click → EntityProfileDialog opens (verified HarchCorp)
- Mobile (390×844): zero horizontal overflow, single-column KPI grid, hamburger present
- Footer sticky: mobile (footer at docHeight 5033), desktop short (footer at docHeight 2154), desktop tall (footer at viewportHeight 2400) — all correct
- Regression: admin Users & Roles (6 panels), trader BVC (6 panels), legal Regulatory (4 panels) — all render, zero errors

## Issues/risks
- Pre-existing entities/directory.tsx FilterChip Fast Refresh warning (NOT introduced by this task; production build unaffected)
- 380ms skeleton is a fixed timer (kept from V19 per spec)
- 3 framer-motion infinite loops in hero (transform/opacity only, GPU-accelerated, negligible perf)
- WatchlistSignals + ActivityFeed retain ChartCard chrome (per "reuse, don't rebuild" constraint — visually consistent but lack cyan accent rail)

## Screenshots
- `.qa/v14-self-watch.png` (desktop 1440×900)
- `.qa/v14-self-watch-full.png` (full page)
- `.qa/v14-self-watch-mobile.png` (390×844)
