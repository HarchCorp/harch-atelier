# Mobile Responsiveness Audit Report

**Task ID:** MOBILE-AUDIT
**Agent:** AURA (Lead Product & UX Strategist)
**Scope:** 6 key files — 4 plan-tier dashboards + Admin + public home
**Method:** Static pattern analysis (Tailwind breakpoint usage, inline-style widths, `@media` queries, touch-target sizing, table-overflow wrappers, sidebar collapse, modal sizing, font-sizing)
**Read-only:** No code was modified.

---

## Section 1 — Per-File Audit

### 1.1 `src/app/atelier/console/essential/EssentialDashboard.tsx` (~11,626 lines)

| # | Issue Type | Severity | Line(s) | Description |
|---|---|---|---|---|
| E-1 | Sidebar / drawer | ✅ OK | 11271-11313 | Desktop sidebar `hidden lg:block sticky top-0 w-[240px]`. Mobile uses AnimatePresence drawer (`width: 280, maxWidth: "85vw"`). Correct pattern. |
| E-2 | Grid layout | ✅ OK | 11351 | Main grid is `grid-cols-12 gap-4 lg:gap-6`. All `CardShell` use `lg:col-span-X` → on `<lg` they collapse to full width. |
| E-3 | Charts | ✅ OK | 2671, 2844, 2930, 3229, 3426, 4088, 4499, 4687, 4847, 5025, 5114, 5242 | Every chart uses `<ResponsiveContainer width="100%" height="100%">`. Resizes correctly. |
| E-4 | Tables | ✅ OK | — | No raw `<table>` elements; data uses CSS-grid layouts with `truncate` for overflow safety. |
| E-5 | Touch targets | 🟠 WARNING | 1696 | Hamburger button `style={{ width: 32, height: 32 }}` — 32 px, below 44 px Apple/Google minimum. |
| E-6 | Touch targets | 🟠 WARNING | 2653, 3790, 3870, 8295 | Multiple action buttons use `className="h-7 px-2"` → 28 px tall, ~28-36 px wide. Hard to tap with thumb. |
| E-7 | Inner grids (no breakpoints) | 🟠 WARNING | 3937, 3941, 4348, 4637, 4907 | Inner content uses raw `grid grid-cols-3` / `grid-cols-2` (no `sm:`/`md:` prefix). On 320 px viewport these force 2-3 tiny columns side-by-side instead of stacking. |
| E-8 | Font sizes (fixed px) | 🟡 MINOR | throughout (e.g. 5454, 9924) | Many `fontSize: 9` / `fontSize: 10` / `fontSize: 11` inline — below WCAG-readable on mobile (but they're labels/metadata, not body copy). |
| E-9 | Modals | ✅ OK | 8295 | `<DialogContent className="sm:max-w-md">` — proper `sm:` prefix, so on mobile falls back to default `w-full` and respects viewport. |
| E-10 | Padding | ✅ OK | 1683 | Header `px-4 lg:px-6 py-3` — responsive horizontal padding. |
| E-11 | Horizontal scroll | ✅ OK | — | No forced horizontal scroll detected. |
| E-12 | Images | N/A | — | No `<img>`/`<Image>` tags; uses inline SVGs which scale via `viewBox`. |

### 1.2 `src/app/atelier/console/pro/ProDashboard.tsx` (~14,883 lines)

| # | Issue Type | Severity | Line(s) | Description |
|---|---|---|---|---|
| P-1 | Sidebar / drawer | ✅ OK | 14682-14725 | Same pattern as Essential: `hidden lg:block` aside + `lg:hidden` drawer overlay. |
| P-2 | Grid layout | ✅ OK | 14807 | Main grid `grid-cols-12 gap-4 lg:gap-6`. All `CardShell` use `lg:col-span-X`. |
| P-3 | Charts | ✅ OK | 5080, 5254, 5318, 5498, 5840, 5915, 6365, 6491, 7598, 7695 | All charts use `ResponsiveContainer width="100%"`. |
| P-4 | Tables | ✅ OK | 6183-6184, 7448-7449 | Tables wrapped in `<div className="overflow-x-auto -mx-1">`. Horizontal scroll contained. |
| P-5 | Touch targets | 🟠 WARNING | 3916 | Hamburger `width: 32` — below 44 px. |
| P-6 | Touch targets | 🟠 WARNING | 7194, 7211, 7221, 7300, 7341 | Mini action buttons `h-6 px-1.5` (24 px) with `fontSize: 9`. Report "PDF", "Partager", etc. — virtually impossible to tap reliably on touch. |
| P-7 | Touch targets | 🟠 WARNING | 2524, 5063, 5172, 5183 | Tabs/action buttons `h-7` (28 px). |
| P-8 | Modals | 🟠 WARNING | 9749 | `<DialogContent className="max-w-2xl">` — **no `sm:` prefix**, locks modal to 672 px max-width even on small screens. Works due to default `w-full` but inconsistent with other modals in the same file (which use `sm:max-w-[560px]`, `sm:max-w-[860px]`, `sm:max-w-[400px]`). Risk of regression if `w-full` is ever removed. |
| P-9 | Modals | ✅ OK | 11528, 12744, 13307, 13969 | Other modals correctly use `sm:max-w-[X]`. |
| P-10 | Inner grids (no breakpoints) | 🟠 WARNING | 3349, 3386, 3437, 7575, 9252, 10440, 12460, 12657, 12753, 13165, 13342, 13788, 13822, 14137 | Many `grid grid-cols-2` / `grid-cols-3` without `sm:`/`md:` prefix — content forced into 2-3 columns on mobile. |
| P-11 | Padding | ✅ OK | — | Header uses responsive `px-4 lg:px-6`. |
| P-12 | Horizontal scroll | ✅ OK | — | Tables wrapped in `overflow-x-auto`. |

### 1.3 `src/app/atelier/console/enterprise/EnterpriseDashboard.tsx` (~15,263 lines)

| # | Issue Type | Severity | Line(s) | Description |
|---|---|---|---|---|
| EN-1 | Sidebar / drawer | ✅ OK | 14885-14920 | Same correct pattern. |
| EN-2 | Grid layout | ✅ OK | 14989 | Main grid `grid-cols-12 gap-4 lg:gap-6`. All `CardShell` use `lg:col-span-X`. |
| EN-3 | Charts | ✅ OK | 3004, 3238, 3389, 3530, 3588, 3715, 3864, 4273, 4367, 4892, 4944 | All `ResponsiveContainer`. |
| EN-4 | Tables | ✅ OK | 4134-4135, 5009-5010, 5197-5198 | Tables wrapped in `<div className="overflow-x-auto rounded-lg">`. |
| EN-5 | Touch targets | 🟠 WARNING | 1806 | Hamburger `width: 32` — below 44 px. |
| EN-6 | Touch targets | 🟠 WARNING | 4819, 8976, 9403 | Mini buttons `h-6 px-2` / `width: 22 height: 22` (24-22 px). |
| EN-7 | **Sessions table** | 🟠 WARNING | 8948-9029 | Active sessions table uses `grid grid-cols-12 gap-2` with raw `col-span-4`/`col-span-2`/`col-span-2`/`col-span-2`/`col-span-1`/`col-span-1` (no breakpoint prefix) and **no `overflow-x-auto` wrapper**. On 375 px mobile, each column gets ~24 px — emails/IPs/dates get truncated with `truncate` class, user can't see full data and can't swipe horizontally to reveal it. |
| EN-8 | Modals | ✅ OK | 12190, 14654 | Custom modals use `max-w-3xl w-full` with `padding: "16px"` wrapper. `w-full` constrains to viewport on mobile. |
| EN-9 | Inner grids (no breakpoints) | 🟠 WARNING | 4617, 5407, 5637, 5665, 6799, 10380, 10467, 10658, 11043, 12215, 12679, 13119, 13327, 13388 | Multiple `grid grid-cols-2/3/4/5` without `sm:`/`md:`. |
| EN-10 | Horizontal scroll | 🟠 WARNING | 8948 | Sessions table (see EN-7) — content gets clipped, not scrollable. |
| EN-11 | Padding | ✅ OK | — | Header uses responsive `px-4 lg:px-6`. |

### 1.4 `src/app/atelier/console/agency/AgencyDashboard.tsx` (~18,291 lines)

| # | Issue Type | Severity | Line(s) | Description |
|---|---|---|---|---|
| AG-1 | Sidebar / drawer | ✅ OK | 17637-17680 | Same correct pattern. |
| AG-2 | Grid layout | ✅ OK | 17717, 17724 | Main grid `grid-cols-12 gap-4 mt-6`. All `CardShell` use `lg:col-span-X` (or `lg:col-span-X md:col-span-Y sm:col-span-Z`). |
| AG-3 | Charts | ✅ OK | 3627, 4892, 4944, 5700, 7558, 7695, 8227 | All `ResponsiveContainer`. |
| AG-4 | Tables | ✅ OK | 4390-4391, 5073-5074, 5616-5617, 7199-7200, 7362-7363, 15060 | Tables wrapped in `<div className="overflow-x-auto -mx-1 px-1">` with explicit `minWidth` (720, 540, 480, 880, 420, 540). Good pattern — horizontal scroll contained. |
| AG-5 | Touch targets | 🟠 WARNING | 17117 | Hamburger `w-9 h-9` (36 px) — better than other dashboards but still below 44 px. |
| AG-6 | Touch targets | 🟠 WARNING | 2046, 2132, 6364, 6517, 7045 | `w-7 h-7` and `w-8 h-8` icon buttons (28-32 px). |
| AG-7 | Modals | ✅ OK | 5748, 8988, 9594, 11676, 12795, 12859, 13500, 15187 | DialogContent uses `sm:max-w-md` / `sm:max-w-lg`; custom modals use `fixed inset-0 z-[100] flex items-center justify-center p-4` with `max-w-2xl w-full` — proper. |
| AG-8 | Inner grids (no breakpoints) | 🟠 WARNING | 3732, 10626, 11502, 12107, 13685, 14099, 14685, 14962, 15471, 15664, 15929, 16680, 17752 | Many `grid grid-cols-2/3/4/5/6` without `sm:`/`md:` prefix. |
| AG-9 | Padding | ✅ OK | 17717 | `<main className="mx-auto max-w-[1440px] w-full px-4 sm:px-6 py-6">` — proper responsive padding. |
| AG-10 | Horizontal scroll | ✅ OK | — | Tables contained. |

### 1.5 `src/app/atelier/admin/AdminDashboard.tsx` (~11,136 lines) — **WORST OFFENDER**

| # | Issue Type | Severity | Line(s) | Description |
|---|---|---|---|---|
| A-1 | **Sidebar collapse** | 🔴 CRITICAL | 424-586 | Fixed `<aside style={{ width: "248px", position: "sticky" }}>` — **no `hidden lg:block`**, no hamburger, no mobile drawer. On a 375 px iPhone, sidebar eats 66 % of the viewport, leaving only ~127 px for content. Admin is essentially unusable on mobile. |
| A-2 | **No `@media` queries at all** | 🔴 CRITICAL | entire file | `grep "@media"` returns ZERO matches in this file. The dashboard is rendered with a single fixed-width layout regardless of viewport. (Only `@keyframes pulse` is present, line 4836/4955.) |
| A-3 | **Header padding** | 🔴 CRITICAL | 595 | Top bar `<header style={{ padding: "16px 32px" }}>` — fixed 32 px horizontal padding on all viewports. On 375 px mobile, that's 64 px lost → ~243 px remaining, and the bar also holds title + Refresh + New Account buttons. Will overflow / push buttons off-screen. |
| A-4 | **Main content padding** | 🔴 CRITICAL | 690 | `<main style={{ padding: "28px 32px 64px" }}>` — fixed 32 px horizontal padding + 248 px sidebar + ~16 px scrollbar = content width collapses to ~63 px on 375 px mobile. Text wraps to one word per line, tables overflow, charts shrink to unreadable. |
| A-5 | Tables (no `<table>` tags) | ✅ N/A | — | No raw HTML tables; data uses flex/grid divs. But the divs themselves have fixed `minWidth` (e.g., line 9496 `minWidth: 260`, line 11339 `minWidth: 220`, line 13050 `minWidth: 160`) and **no `overflow-x-auto` wrapper**. Will cause horizontal page-scroll on mobile. |
| A-6 | Touch targets (top bar buttons) | 🟠 WARNING | 628, 648 | `padding: "8px 12px"` / `padding: "8px 14px"` → ~30 px tall. |
| A-7 | Touch targets (sidebar items) | 🟠 WARNING | 782 | `padding: "9px 12px"` → ~31 px tall. |
| A-8 | Touch targets (inline action buttons) | 🟠 WARNING | 1657, 1712, 1728, 1804, 3521, 3580, 3598, 6283, 6305, 6327 | All `padding: "8px 12px"` or `padding: "6px 12px"` (24-30 px). |
| A-9 | Modals | ✅ OK | 4230-4258 | CreateAccountModal wrapper uses `position: fixed, inset: 0, padding: "16px"` and inner `maxWidth: "640px", width: "100%", maxHeight: "92vh", overflowY: "auto"`. Proper mobile behavior. |
| A-10 | Drawer (request detail) | ✅ OK | 2542-2553 | `position: fixed, top: 0, right: 0, width: drawerWidth, maxWidth: "100vw"`. Proper. |
| A-11 | Font sizes (fixed px, very small) | 🟡 MINOR | 249, 462, 878, 892, 1256, 1270, 1662, 1678, 1878, 2049, 2054, 2059, 2068, 2154 | Many `fontSize: 9/10/11` for mono labels. Already tiny on desktop, worse on mobile. |

### 1.6 `src/app/atelier/AtelierHome.tsx` (~5,125 lines) — **BEST IN CLASS**

| # | Issue Type | Severity | Line(s) | Description |
|---|---|---|---|---|
| H-1 | Grid layouts | ✅ OK | 4972-5060 | Comprehensive scoped CSS with `@media (max-width: 1024px)`, `900px`, `640px` breakpoints. `hero-grid`, `feature-grid`, `how-grid`, `pricing-grid`, `cta-form-grid`, `logo-wall-grid`, `dash-layout` all collapse properly. |
| H-2 | `dash-layout` sidebar | 🟠 WARNING | 1996, 2043, 5017, 5042-5043 | `.dash-sidebar { display: none; }` at `≤900px`. Sidebar is hidden on mobile but **no replacement drawer / hamburger** is provided in the home-page demo. Users on mobile lose the demo navigation entirely (cosmetic-only loss since this is a marketing page, but still a UX gap). |
| H-3 | Tables (demo) | ✅ OK | 4996-4998, 5052-5057 | `.harch-table-head` / `.harch-table-row` reduce columns at `≤640px` (drops the 5th column, switches to `50px 1fr 90px 100px`). Smart responsive table strategy. |
| H-4 | Font sizes | ✅ OK | 335, 610, 2806, 4708 | Hero headings use `clamp(30px, 4vw, 46px)`, `clamp(40px, 5.5vw, 68px)`, `clamp(22px, 4vw, 28px)`, `clamp(32px, 4.5vw, 48px)`. Modern responsive typography. |
| H-5 | Padding (section wrappers) | ✅ OK | 1109, 1116, 1238, 1246, 1402, 1410, 1860, 1868, 2675, 2683, 3035, 3043 | All section wrappers use `padding: "48px 16px"` with inner `padding: "0 16px"` — proper mobile-friendly horizontal padding. |
| H-6 | Padding (cards) | 🟡 MINOR | 3098, 3180, 3908 | Cards use `padding: "24px 28px"` / `padding: "32px 28px"` — no media-query reduction. On 320 px mobile, content area shrinks to ~232 px after parent + card padding. Tight but content fits. |
| H-7 | Touch targets (buttons) | ✅ OK | 1913, 2712, 4025 | CTA buttons `padding: "12px 20px"` (~40 px) and `padding: "14px 24px"` (~44 px). Acceptable. |
| H-8 | Touch targets (dash nav) | 🟠 WARNING | 2023 | `.dash-sidebar` nav items `padding: "10px 20px"` (~33 px). Below 44 px but hidden on mobile anyway (see H-2). |
| H-9 | Images | N/A | — | No `<img>`/`<Image>` tags; uses inline SVGs (line 394-526, 875) with `viewBox` — scale naturally. |
| H-10 | `maxWidth: "1280px"` containers | ✅ OK | 595, 1114, 1244, 1408, 1866, 2681, 3041, 3829, 4156 | All major section wrappers cap at 1280 px and center with `margin: "0 auto"`. |
| H-11 | Horizontal scroll | ✅ OK | — | All grids collapse to 1-column at small breakpoints. No forced horizontal scroll. |

---

## Section 2 — Critical Issues (Must Fix)

> 🔴 = layout broken on mobile — content invisible, overflows, or cannot be used.

### C-1. AdminDashboard — fixed 248 px sidebar never collapses
**File:** `src/app/atelier/admin/AdminDashboard.tsx`
**Lines:** 424-586
**Impact:** On any mobile viewport (≤768 px), the admin sidebar consumes 60-75 % of screen width. Content area shrinks to 60-130 px — text wraps to one word per line, buttons stack/overflow, charts become illegible. The admin dashboard is effectively unusable on phones and most tablets in portrait.
**Fix pattern (reference):** Mirror what Essential/Pro/Enterprise/Agency dashboards already do:
```tsx
<aside className="hidden lg:block sticky top-0 h-screen shrink-0" style={{ width: 248 }}>
  ...
</aside>
<AnimatePresence>
  {mobileNavOpen && (
    <motion.div className="fixed inset-0 z-50 lg:hidden" ...>
      <div className="absolute inset-0 bg-black/40" onClick={close} />
      <motion.div className="absolute left-0 top-0 h-full bg-white shadow-xl"
        style={{ width: 280, maxWidth: "85vw" }} ...>
        <SidebarContent onNavigate={close} />
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```
Plus a hamburger button in `<header>` with `className="lg:hidden"`.

### C-2. AdminDashboard — zero `@media` queries
**File:** `src/app/atelier/admin/AdminDashboard.tsx`
**Impact:** The whole file has no responsive breakpoints. Every fixed dimension (`width: 248px`, `padding: 16px 32px`, `padding: 28px 32px 64px`, `minWidth: 260px` on inner panels) is enforced identically on a 320 px iPhone and a 2560 px iMac.
**Fix:** Inject a scoped `<style>` block (like `AtelierHome.tsx` and `ConsoleShell.tsx` already do) with at least:
```css
@media (max-width: 1024px) { /* collapse sidebar to drawer */ }
@media (max-width: 768px)  { /* stack header buttons, reduce padding to 16px */ }
@media (max-width: 640px)  { /* single-column stat grids, full-width tables in overflow-x-auto */ }
```

### C-3. AdminDashboard — fixed header / main padding will cause horizontal overflow
**File:** `src/app/atelier/admin/AdminDashboard.tsx`
**Lines:** 595 (header `padding: "16px 32px"`), 690 (main `padding: "28px 32px 64px"`)
**Impact:** Combined with C-1, the admin page on mobile shows a 248 px sidebar + 64 px header padding + 64 px main padding = 376 px of chrome on a 375 px viewport. The actual content area is negative — page scrolls horizontally, header buttons (Refresh + New Account) get pushed off-screen.
**Fix:** Replace inline padding with Tailwind responsive classes:
```tsx
<header className="... px-4 lg:px-8 py-3 lg:py-4">
<main className="... px-4 lg:px-8 py-6 lg:py-8">
```

---

## Section 3 — Warnings (Should Fix)

> 🟠 = suboptimal but usable — tiny text, cramped, hard to tap.

### W-1. Touch-target sizes below 44 px (all 5 dashboard files)
**Files:** All four plan dashboards + AdminDashboard
**Lines (sample):**
- EssentialDashboard: 1696 (hamburger 32×32), 2653/3790/3870 (h-7 buttons)
- ProDashboard: 3916 (hamburger 32×32), 7194/7211/7221/7300/7341 (h-6 = 24 px, fontSize: 9 — "PDF" / "Partager" / etc.)
- EnterpriseDashboard: 1806 (hamburger 32×32), 4819/8976 (h-6 buttons)
- AgencyDashboard: 17117 (hamburger w-9 h-9 = 36 px), 2046/2132 (w-7 h-7)
- AdminDashboard: 628/648 (top-bar buttons 30 px), 782 (sidebar items 31 px), 1657/1712/1728/1804/3521/3580/3598/6283/6305/6327 (8-12 px padding)

**Standard:** Apple HIG and Google Material require ≥44×44 px touch targets; WCAG 2.5.5 (AAA) requires 44×44 px.
**Impact:** Users with motor impairments or on bumpy commutes will mis-tap. The "PDF" / "Partager" buttons in ProDashboard (line 7194 etc.) are particularly bad — 24 px tall with `fontSize: 9`, barely larger than a fingernail.
**Fix:** Add `min-h-[44px] min-w-[44px]` to all interactive buttons, or `className="h-11"` (Tailwind 11 = 44 px) for square icon buttons. For dense action rows, allow wrapping or switch to a kebab menu.

### W-2. Inner CSS grids without breakpoint prefixes
**Files:** EssentialDashboard (3937, 3941, 4348, 4637, 4907), ProDashboard (3349, 3386, 3437, 7575, 9252, 10440, 12460, 12657, 12753, 13165, 13342, 13788, 13822, 14137), EnterpriseDashboard (4617, 5407, 5637, 5665, 6799, 10380, 10467, 10658, 11043, 12215, 12679, 13119, 13327, 13388), AgencyDashboard (3732, 10626, 11502, 12107, 13685, 14099, 14685, 14962, 15471, 15664, 15929, 16680, 17752)
**Impact:** `grid grid-cols-3` (no `sm:`/`md:`) forces 3 equal columns at 320 px → each column gets ~80-100 px. Used for KPI mini-tiles, action button rows, comparison columns. Cramped but not broken (content truncates/wraps).
**Fix:** Add `grid-cols-2 sm:grid-cols-3` or `grid-cols-1 sm:grid-cols-3` to all these — let them stack on mobile.

### W-3. EnterpriseDashboard sessions table — clipped content, not horizontally scrollable
**File:** `src/app/atelier/console/enterprise/EnterpriseDashboard.tsx`
**Lines:** 8948-9029
**Impact:** Active sessions table uses `grid grid-cols-12 gap-2` with raw `col-span-4/2/2/2/1/1` and no `overflow-x-auto` wrapper. On mobile, emails (e.g., `karim.benani@harchcorp.com`) and IPs (`196.217.45.12`) get clipped by `truncate` — user can't see full value and can't swipe horizontally.
**Fix:** Wrap in `<div className="overflow-x-auto -mx-1 px-1">` and add `min-w-[640px]` to the inner grid, OR switch to a stacked card layout on mobile (`grid-cols-1 sm:grid-cols-12`).

### W-4. ProDashboard competitor-setup modal — missing `sm:` prefix
**File:** `src/app/atelier/console/pro/ProDashboard.tsx`
**Line:** 9749
**Code:** `<DialogContent className="max-w-2xl">`
**Impact:** Currently works only because shadcn's default `DialogContent` includes `w-full`, so the modal is constrained to viewport width. But the `max-w-2xl` (672 px) overrides the default `sm:max-w-lg`. If the default `w-full` is ever removed in a refactor, the modal will overflow mobile screens. Other modals in the same file correctly use `sm:max-w-[560px]`, `sm:max-w-[860px]` — this one is inconsistent.
**Fix:** Change to `<DialogContent className="sm:max-w-2xl">` for consistency.

### W-5. AtelierHome demo sidebar — hidden on mobile, no replacement
**File:** `src/app/atelier/AtelierHome.tsx`
**Lines:** 1996-2064 (SidebarContent), 5043 (`@media (max-width: 900px) .dash-sidebar { display: none; }`)
**Impact:** On the marketing page, the "demo dashboard" navigation sidebar vanishes below 900 px and there is no hamburger menu to open it. Users on mobile cannot interact with the demo navigation. (Functionally low-impact since it's a marketing demo, but a UX gap.)
**Fix:** Add a small "Menu" button in the demo's top bar that toggles a slide-in drawer (mirror the ConsoleShell pattern at line 1767).

### W-6. DialogContent default `p-6` (24 px) padding is tight on mobile forms
**Files:** All 4 plan dashboards (using shadcn `DialogContent`)
**Impact:** shadcn's `DialogContent` ships with `p-6` (24 px) padding on all breakpoints. For the multi-field CreateAccount-style modals (e.g., ProDashboard 13307 `sm:max-w-[860px]`), the inner form on a 375 px mobile screen has ~327 px content area (375 - 24*2). Input fields with `padding: 8px 10px` get cramped.
**Fix:** Add a responsive padding override:
```css
@media (max-width: 640px) {
  [role="dialog"] > div { padding: 16px !important; }
}
```
Or pass `className="p-4 sm:p-6"` to each `DialogContent`.

---

## Section 4 — Recommended Fixes (Priority Ordered)

| Priority | Fix | Files | Effort | Severity Addressed |
|---|---|---|---|---|
| **P0** | Add mobile sidebar drawer + hamburger to AdminDashboard (mirror Essential pattern) | `AdminDashboard.tsx` | 2-3 h | 🔴 C-1 |
| **P0** | Add `@media` queries (1024 / 768 / 640) to AdminDashboard — collapse sidebar, reduce header/main padding to 16 px, stack stat grids | `AdminDashboard.tsx` | 2 h | 🔴 C-2, C-3 |
| **P0** | Wrap Enterprise sessions table in `overflow-x-auto` with `min-w-[640px]` (or restack on mobile) | `EnterpriseDashboard.tsx` (line 8948) | 30 min | 🟠 W-3 |
| **P1** | Bring all hamburger buttons to ≥44×44 px (currently 32 px Essential/Pro/Enterprise, 36 px Agency) | 4 dashboard files | 30 min | 🟠 W-1 |
| **P1** | Bring all `h-6` / `h-7` action buttons to `h-9` (36 px) minimum, ideally `h-11` (44 px); reduce visual density via kebab menus where needed | 4 dashboard files + Admin | 3-4 h | 🟠 W-1 |
| **P1** | Add `sm:` / `md:` prefixes to all bare `grid-cols-2/3/4/5` in dashboard inner content (let them stack on mobile) | 4 dashboard files (~50 occurrences total) | 2 h | 🟠 W-2 |
| **P2** | Add `sm:` prefix to ProDashboard competitor-setup modal `max-w-2xl` | `ProDashboard.tsx` (line 9749) | 1 min | 🟠 W-4 |
| **P2** | Add responsive padding override (`p-4 sm:p-6`) to all `DialogContent` instances | 4 dashboard files | 1 h | 🟠 W-6 |
| **P2** | Add a "Menu" button + slide-in drawer to AtelierHome demo sidebar (replaces hidden `.dash-sidebar` on mobile) | `AtelierHome.tsx` | 1-2 h | 🟠 W-5 |
| **P3** | Audit & increase `fontSize: 9` / `fontSize: 10` mono labels to ≥11 px on mobile (or use `clamp()`) | All files | 1 h | 🟡 Minor |
| **P3** | Reduce AtelierHome card padding from `32px 28px` to `24px 20px` below 640 px | `AtelierHome.tsx` (lines 3098, 3180, 3908) | 30 min | 🟡 Minor |

---

## Section 5 — Overall Verdict

| File | Mobile Readiness | Notes |
|---|---|---|
| `AtelierHome.tsx` | 🟢 **GOOD** | Comprehensive `@media` queries, `clamp()` typography, responsive grids. Only gap: demo sidebar hidden on mobile with no replacement. Reference implementation for the rest of the codebase. |
| `EssentialDashboard.tsx` | 🟡 **MOSTLY OK** | Sidebar drawer + responsive main grid + `ResponsiveContainer` charts + `overflow-x-auto` tables. Touch targets too small; some inner grids need breakpoints. |
| `ProDashboard.tsx` | 🟡 **MOSTLY OK** | Same scaffold as Essential. Tables correctly wrapped. Mini action buttons (h-6, fontSize 9) are a real usability problem. One inconsistent modal `max-w-2xl`. |
| `EnterpriseDashboard.tsx` | 🟡 **MOSTLY OK** | Same scaffold. Sessions table at line 8948 is the standout issue — clipped content with no horizontal scroll. |
| `AgencyDashboard.tsx` | 🟡 **MOSTLY OK** | Best of the four dashboards for touch targets (hamburger is 36 px instead of 32 px). Tables properly wrapped with `minWidth`. Inner grids still need breakpoint prefixes. |
| `AdminDashboard.tsx` | 🔴 **BROKEN ON MOBILE** | Zero `@media` queries, fixed 248 px sidebar never collapses, fixed 32 px padding causes horizontal overflow. **Admin is unusable on phones.** Needs urgent P0 work. |

### Aggregate issue counts

| Severity | Count | Files |
|---|---|---|
| 🔴 CRITICAL | **3** | AdminDashboard (3) |
| 🟠 WARNING | **9 categories** (~70 individual occurrences across files) | All 6 files |
| 🟡 MINOR | **2 categories** (~20 individual occurrences) | All 6 files |

**Bottom line:** The 4 plan-tier dashboards share a well-designed responsive scaffold (mobile drawer + `lg:col-span-X` grids + `ResponsiveContainer` charts + `overflow-x-auto` table wrappers). Their issues are *polish-level* — small touch targets, bare `grid-cols-N` without prefixes, one inconsistent modal. **`AdminDashboard.tsx` is the only file that is fundamentally broken on mobile** and needs immediate P0 attention. `AtelierHome.tsx` is the gold standard — its patterns (`clamp()` typography, scoped `@media` queries, column-reduction at 640 px for tables) should be replicated in the admin file.
