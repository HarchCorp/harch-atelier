# AUDIT-AGENCY — Exhaustive Value-to-UI Audit · Plan "Agences"

**Agent**: VORTEX (Principal Systems & Data Auditor)
**Task ID**: AUDIT-AGENCY
**Mode**: RESEARCH ONLY — no code modified
**Date**: 2025

---

## 0. Executive Summary

The "Agences" plan is promised as the most feature-rich of the 4 pricing plans (Essentiel / Pro / Grandes Entreprises / Agences), with multi-client governance, white-label, API/MCP integration, and a 3-tier commission system (20% / 25% / 30%).

**Three distinct agency UI surfaces coexist in the codebase** — and they don't all agree:

| # | Path | File | Status | Lines | Sections |
|---|------|------|--------|-------|----------|
| A | `/atelier/agency` | `atelier/agency/AgencyDashboard.tsx` + `agency/clients/[id]/AgencyClientDetail.tsx` | **MOUNTED** (SSR-gated to `agency-admin` role) | 1 193 + 808 | "Brick 8 White-Label Engine" — reseller control plane |
| B | `/atelier/console/agency` | `atelier/console/agency/page.tsx` → shared `Dashboard` + `AgencyConsole.tsx` | **MOUNTED** (any logged-in agency user) | 2 302 | 5 agency-specific sections appended below the shared dashboard |
| C | `/atelier/console/agency/AgencyDashboard.tsx` | standalone file | **ORPHAN — never imported anywhere** | **16 898** | Task ID `FINAL-AGENCY` — 25 base sections + 6 ENV-AGENCY + 3 R2-AGENCY-A + 3 R2-AGENCY-B + 3 R3-AGENCY-A + 3 R4-AGENCY-A = **~43 sections** (file footer claims "34 sections") |

**Critical findings**

1. The 16 898-line `AgencyDashboard.tsx` (the file explicitly called out in the audit task as "the largest") is **NOT imported by any page** — grep confirms zero importers. It is dead code, yet represents the most elaborate vision of the product. Any feature only present in this orphan file is **invisible to users**.
2. The **3 agency sub-levels (Débutant / Croissance / Entreprise) are defined with two different threshold systems in the same file** (6/50 vs 5/20), and the AgencyConsole (the actually-mounted version) uses yet a third definition (6/50, matching one of the orphan's). The pricing page itself gives no thresholds at all — only narrative labels.
3. Many "advanced analytics" sections in the orphan file (Revenue Tracker, Client Health, Churn Risk, Lifecycle, Upsell, Benchmark) compute deterministic-but-fake values from `hashStr(clientId + ":something")` — they look real, persist to `localStorage`, but the underlying setup fees, overage charges, churn factors, NPS, onboarding time, and 6-month trend lines are **derived from string hashing**, not from any database or scraping source.
4. The actually-mounted `/atelier/agency` page features a **GLM-4-powered WhatsApp Import → auto-create sub-client** flow (with prompt-injection Zod-validation) that the orphan file does NOT have — and vice-versa.

---

## 1. Pricing Page — Verbatim Extraction

**Source**: `/home/z/my-project/src/app/atelier/pricing/PricingPage.tsx` (lines 91-114)

### 1.1 Agences plan object (verbatim)

```ts
{
  name: "Agences",
  tagline:
    "Pour les agences RP et cabinets de conseil qui gèrent plusieurs clients en portefeuille avec white-label et gouvernance multi-comptes.",
  capabilities: [
    "Veille médiatique",
    "Social listening",
    "Suivi de la visibilité IA (GenAI Lens)",
    "Marketing d'influence",
    "Relations médias",
  ],
  bestFor: [
    "Débutants (petites agences / peu de clients)",
    "Croissance (équipes gérant plusieurs clients)",
    "Entreprise Agence (portfolios importants, envergure internationale)",
  ],
  keyFeatures: [
    "HarchIQ AI — Avancé",
    "Intégrations API et MCP",
    "Gouvernance, workflows et autorisations",
    "Multi-clients + White-label",
  ],
  note: "3 niveaux disponibles selon la taille de l'agence",
}
```

### 1.2 Comparison matrix — Agences column (verbatim, PricingPage.tsx lines 153-177)

| Category | Row | Essentiel | Pro | Grandes Entreprises | **Agences** |
|---|---|---|---|---|---|
| Capacités incluses | Veille médiatique | ✓ | ✓ | ✓ | **✓** |
| Capacités incluses | Social listening | ✓ | ✓ | ✓ | **✓** |
| Capacités incluses | Suivi de la visibilité IA (GenAI Lens) | ✓ | ✓ | ✓ | **✓** |
| Capacités incluses | Relations médias | ✓ | ✓ | ✓ | **✓** |
| Capacités incluses | Marketing d'influence | — | — | ✓ | **✓** |
| HarchIQ AI | Niveau HarchIQ AI | Standard | Avancé | Entreprise | **Avancé** |
| HarchIQ AI | Questions par jour | 50 | 200 | Illimité | **200** |
| Analyse & rapports | Alertes et rapports | ✓ | ✓ | ✓ | **✓** |
| Analyse & rapports | Tableaux de bord prédéfinis | ✓ | ✓ | ✓ | **✓** |
| Analyse & rapports | Benchmarking concurrentiel | — | ✓ | ✓ | **✓** |
| Analyse & rapports | Tableaux de bord et rapports personnalisés | — | ✓ | ✓ | **✓** |
| Analyse & rapports | Rapports board-ready | — | — | ✓ | **✓** |
| Intégrations & gouvernance | Intégrations API et MCP | — | — | ✓ | **✓** |
| Intégrations & gouvernance | Gouvernance, workflows et autorisations | — | — | ✓ | **✓** |
| Intégrations & gouvernance | SSO / SAML | — | — | ✓ | **✓** |
| Multi-clients | Multi-clients | — | — | — | **✓** |
| Multi-clients | White-label | — | — | — | **✓** |
| Multi-clients | Facturation par compte | — | — | — | **✓** |

> **Note**: "Agences" is the only plan with a `note` field; it is rendered verbatim as a small caption below the card (lines 599-617).

### 1.3 Pricing FAQ (verbatim, PricingPage.tsx lines 179-200)

The "Quelle est la durée d'engagement ?" answer states:
> "Plans Essentiel et Pro : engagement annuel avec paiement mensuel. **Grandes Entreprises et Agences : contrat-cadre 12 ou 24 mois avec clauses de révision trimestrielle.** Un essai pilote de 30 jours est possible pour les plans Pro et supérieurs."

No other FAQ entry is agency-specific.

---

## 2. The 3 Agency Sub-Levels — Conflicting Definitions

The pricing page promises "3 niveaux disponibles selon la taille de l'agence" but does NOT specify thresholds. The codebase contains **THREE different definitions** of the same 3 levels — they disagree on client-count thresholds, commission rates, and benefit copy.

### 2.1 Definition A — `agencySubLevel()` (the one actually rendered in the live console)

**Source**: `atelier/console/agency/AgencyConsole.tsx` lines 333-341 (also duplicated at `AgencyDashboard.tsx` line 962 for sidebar footer).

```ts
function agencySubLevel(clientCount: number) {
  if (clientCount >= 50) return { label: "Entreprise",  ... };
  if (clientCount >= 6)  return { label: "Croissance",  ... };
  return                       { label: "Débutant",    ... };
}
```

| Tier | Threshold | Color | Where rendered |
|---|---|---|---|
| Débutant | 1-5 clients | stone-500 / bgHover | Pill on `ClientSwitcherSection` (live) + Sidebar footer (orphan) |
| Croissance | 6-49 clients | amber-700 / amber-bg | same |
| Entreprise | 50+ clients | emerald-700 / sage-bg | same |

**No commission % attached to this definition.** It's purely a label.

### 2.2 Definition B — `getTierInfo()` / `tierFromClientCount()` (orphan file only)

**Source**: `atelier/console/agency/AgencyDashboard.tsx` lines 978-1041. Used by `AgencyTierBadgeCard`, `CommissionCalculatorCard`, `RevenueForecastingCard`.

```ts
function tierFromClientCount(count: number) {
  if (count >= 20) return "entreprise";
  if (count >= 5)  return "croissance";
  return "debutant";
}
```

| Tier | Threshold | Commission | Benefits (verbatim) |
|---|---|---|---|
| **Débutant** | 1-5 clients | **20 %** | "1 à 5 clients", "Commission 20%", "Équipe 1-3 membres", "White-label basique" |
| **Croissance** | 5-20 clients | **25 %** | "5 à 20 clients", "Commission 25%", "Équipe 3-10 membres", "White-label avancé + API", "Pitch deck generator" |
| **Entreprise** | 20+ clients | **30 %** | "20+ clients", "Commission 30%", "Équipe 10+ multi-pays", "White-label total + MCP", "Gouvernance RBAC", "SLA dédié" |

**Only this definition carries commission %.** Manual override is possible via the `AgencyTierBadgeCard` (persisted to `localStorage["agency:tier-level"]`).

### 2.3 Definition C — narrative on pricing page (no thresholds)

From `bestFor` array (verbatim, PricingPage.tsx lines 102-106):
- "Débutants (petites agences / peu de clients)"
- "Croissance (équipes gérant plusieurs clients)"
- "Entreprise Agence (portfolios importants, envergure internationale)"

### 2.4 Conflict matrix

| Question | Definition A (live) | Definition B (orphan) | Definition C (pricing) |
|---|---|---|---|
| Croissance threshold | 6 clients | **5 clients** | "plusieurs clients" |
| Entreprise threshold | 50 clients | **20 clients** | "portfolios importants" |
| Commission % attached? | NO | YES (20/25/30) | NO |
| Where rendered? | Pill on live ClientSwitcher + sidebar footer | Tier Badge card + Commission Calc + Revenue Forecast (orphan only) | Pricing page card only |

### 2.5 Cross-references outside the console

- **FAQ** (`atelier/faq/faq-data.ts` line 831): "remise partenaire (15 à 30 % selon le volume)" — adds a 15% floor not seen elsewhere.
- **PartnersPage** (`atelier/partners/PartnersPage.tsx` line 23): "20% recurring commission on every client" — matches only the **Débutant** tier.
- **PartnersPage** line 83: Referral partners get 15% for 12 months.
- **`agency.commissionPct`** (DB column on Agency table, e.g. `quota.monthlyPriceMAD × agency.commissionPct / 100`): the live Revenue Tracker reads the agency's configured commission — which is a single value per agency, NOT a tier-driven 20/25/30.

> **GAP**: There is no API endpoint that returns the 3-tier commission logic. The 20/25/30% ladder only exists in client-side orphan code. The DB has a single `Agency.commissionPct` field, so a real agency at the "Croissance" tier would still see their actual `commissionPct` (e.g. 20%) regardless of client count.

---

## 3. Surface A — `/atelier/agency` (Brick 8 White-Label Engine, MOUNTED)

**Entry**: `atelier/agency/page.tsx` (82 lines, SSR).
**Auth gate**: requires `role ∈ {agency-admin, admin, super_admin}` AND `user.agencyId` AND `agency.status === "active"`. Calls `getAgencyContext(session)` to resolve the active workspace.
**Renders**: `<AgencyDashboard agency={user.agency} userName={...} activeAgencyClientId={ctx?.activeAgencyClientId ?? null} />`.

### Feature A-1: Header — Agency identity banner
**Axe 1 — Promesse & Origine Commerciale**
- URL source: `atelier/agency/AgencyDashboard.tsx` lines 182-235
- Pitch verbatim: "AGENCY MASTER · {agency.slug.toUpperCase()}" badge + "{agency.name} white-label control plane" h1 + "Welcome back, {userName}. Manage your sub-clients, branding, and quotas from here."
- Niveau service: White-label control plane (Brick 8, Tier 4)

**Axe 2 — Route & Ingestion**
- Source brute: Prisma `Agency` row (server-side, passed as prop from page.tsx that selected `id, name, slug, commissionPct, primaryColor, logoUrl, status`)
- Route API: SSR direct Prisma — no fetch.
- Mock? NON.

**Axe 3 — Traitement & Logique**
- Aucune transformation : affichage direct des champs.

**Axe 4 — Rendu UI**
- Composant: header statique avec badge de statut (`{agency.status}`) et h1 32px.
- États: aucun.

### Feature A-2: KPI Strip — 4 cards
**Axe 1 — Promesse & Origine Commerciale**
- URL source: `atelier/agency/AgencyDashboard.tsx` lines 237-275
- Pitch verbatim: "Active sub-clients / Monthly revenue / Your commission / Active workspace" (English copy)
- Niveau service: Multi-clients + commission.

**Axe 2 — Route & Ingestion**
- Source brute: Prisma — calculé à partir de `clients[]` array (state, fetched from `/api/agency/clients`).
- Route API: GET `/api/agency/clients` (REAL).
- Mock? NON.

**Axe 3 — Traitement & Logique**
- `totalMonthlyRevenue = clients.reduce((s, c) => s + (c.quota?.monthlyPriceMAD ?? 0), 0)`
- `agencyCommission = Math.round(totalMonthlyRevenue * agency.commissionPct / 100)` — uses the **single** `agency.commissionPct` (DB), not the 20/25/30 ladder.
- Active workspace: derived from `activeAgencyClientId` prop (cookie-resolved server-side).

**Axe 4 — Rendu UI**
- Composant: 4 × `<KpiCard>` (line 684) — responsive grid `repeat(auto-fit, minmax(min(100%, 200px), 1fr))`.
- États: skeleton via `loading` flag.

### Feature A-3: Toolbar — Create sub-client + WhatsApp Import
**Axe 1 — Promesse & Origine Commerciale**
- URL source: `atelier/agency/AgencyDashboard.tsx` lines 277-334
- Pitch verbatim: "+ Create sub-client" / "💬 WhatsApp Import"
- Niveau service: Multi-clients (creation) + AI-assisted onboarding.

**Axe 2 — Route & Ingestion**
- Buttons only; modals trigger further APIs.

**Axe 3 — Traitement & Logique**
- `setShowCreate(true)` → opens `<CreateClientModal>`.
- `setShowWhatsAppImport(true)` → opens `<WhatsAppImportModal>`.

**Axe 4 — Rendu UI**
- Composant: 2 buttons in a flex toolbar.

### Feature A-4: Sub-client grid
**Axe 1 — Promesse & Origine Commerciale**
- URL source: `atelier/agency/AgencyDashboard.tsx` lines 336-390
- Pitch verbatim: "Sub-clients ({clients.length})" h2.
- Niveau service: Multi-clients.

**Axe 2 — Route & Ingestion**
- Source brute: GET `/api/agency/clients` → real Prisma rows.
- Mock? NON.

**Axe 3 — Traitement & Logique**
- Aucun filtrage, tri ou pagination. Affichage brute des cartes.

**Axe 4 — Rendu UI**
- Composant: grid `repeat(auto-fill, minmax(min(100%, 360px), 1fr))` de `<SubClientCard>`.
- États: loading, error, empty.

### Feature A-5: SubClientCard (individual card)
**Axe 1 — Promesse & Origine Commerciale**
- URL source: `atelier/agency/AgencyDashboard.tsx` lines 745-893
- Niveau service: Multi-clients + White-label + Quotas.

**Axe 2 — Route & Ingestion**
- Données: `client` prop (depuis le state alimenté par `/api/agency/clients`).

**Axe 3 — Traitement & Logique**
- Affiche: displayName, company.name, status tag, planTier tag, 5 × `<UsageBar>` (apiRequests, whatsappAlerts, keywords, sources, users) — chacune avec `used / max` et `pct`.
- 2 actions: View (router.push `/atelier/agency/clients/${c.id}`), Switch (POST `/api/agency/switch`).

**Axe 4 — Rendu UI**
- Composant: card 360px avec header, badges, 5 barres de progression, 2 boutons.
- États: `switching` (spinner), `isActive` (highlight si `c.id === activeAgencyClientId`).

### Feature A-6: CreateClientModal
**Axe 1 — Promesse & Origine Commerciale**
- URL source: `atelier/agency/AgencyDashboard.tsx` lines 968-1152
- Pitch verbatim: "Create sub-client" / "White-label URL: iq.{sub}.harchcorp.com" hint.
- Niveau service: Multi-clients + White-label.

**Axe 2 — Route & Ingestion**
- Companies dropdown: GET `/api/companies` (REAL).
- Submit: POST `/api/agency/clients` (REAL).

**Axe 3 — Traitement & Logique**
- Champs: companyId (required), displayName, subdomain, planTier (`emergence`/`corporate`/`sovereign` — 15K/40K/75K MAD/mo).
- Subdomain sanitized: `e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")`.
- POST → toast success → `onCreated()` → `fetchClients()` re-fetch.

**Axe 4 — Rendu UI**
- Composant: modal centré 480px, overlay sombre.
- États: loadingCompanies, submitting, validation (companyId requis).

### Feature A-7: WhatsAppImportModal — GLM-4 AI Account Creation
**Axe 1 — Promesse & Origine Commerciale**
- URL source: `atelier/agency/AgencyDashboard.tsx` lines 428-680
- Pitch verbatim: "WhatsApp Import → AI Account Creation. Paste a WhatsApp conversation with your client prospect. GLM-4 will extract the company name, contact, plan, pricing, and topics — then create the sub-client workspace automatically."
- Niveau service: Multi-clients + AI onboarding (B2B2B).

**Axe 2 — Route & Ingestion**
- Source brute: texte collé par l'agence (WhatsApp paste) → envoyé à GLM-4 via `z-ai-web-dev-sdk`.
- Route API: POST `/api/agency/whatsapp-import` (REAL, 2-step: extract then createAccount).
- Mock? NON — réel appel LLM.

**Axe 3 — Traitement & Logique**
- **Step 1**: GLM-4 system prompt (lines 154-168 of route): "extract company_name, contact_name, email, phone, plan_tier (emergence/corporate/sovereign/custom), pricing_mad, topics[], competitors[], use_case, notes".
- **Prompt-injection defense**: Zod schema `ExtractedDataSchema` (route.ts lines 57-72) — `.strict()` rejects unknown keys, `plan_tier` whitelisted to 4 values, `pricing_mad` clamped to `[PLAN_MIN_PRICE[tier], 1_000_000]` (emergence=15K, corporate=40K, sovereign=75K). Min price enforced per tier — blocks "sovereign at 0" attack.
- **Step 2** (`createAccount: true`): creates `Company` (if not found by slug or case-insensitive name), `AgencyClient`, `AgencyBranding` (default colors `#0A0A0A` + `#10b981`), `AgencyQuota` (defaults per tier), optional `User` (with random 14-char temp password, status `invited`).
- **Audit log**: `logAudit({ action: "agency_subclient_created", resource: "agency:${agencyId}:client:${id}", metadata: { source: "whatsapp_import", ... } })`.

**Axe 4 — Rendu UI**
- Composant: modal 680px avec textarea 200px min, bouton "✨ Analyze with AI", then extracted-fields grid (Company, Contact, Email, Phone, Plan, Pricing, Topics, Competitors, Use case, Notes — read-only inputs), then "Create sub-client" button.
- États: loading ("Analyzing with GLM-4…"), creating, success message.

### Feature A-8: Sub-client detail page (`/atelier/agency/clients/[id]`)
**Axe 1 — Promesse & Origine Commerciale**
- URL source: `atelier/agency/clients/[id]/page.tsx` (76 lines) + `AgencyClientDetail.tsx` (808 lines)
- Niveau service: White-label + Quota management.

**Axe 2 — Route & Ingestion**
- SSR prefetch of `AgencyClient` (server-side ownership check).
- Client-side: GET `/api/agency/clients/${clientId}` (REAL, returns `client` + `stats`).
- Switch: POST `/api/agency/switch` → redirect `/atelier/console/brand-monitor`.

**Axe 3 — Traitement & Logique**
- 3 tabs: **Branding** (logoUrl, primaryColor, accentColor, fontFamily, faviconUrl, loginTitle, loginSubtitle, footerText, hideHarchBadge + live preview), **Quota** (max limits + planTier + monthlyPriceMAD + current usage bars), **Usage** (historical `AgencyUsage` rows by month).
- PATCH `/api/agency/clients/${clientId}` saves changes (transactional: client + branding upsert + quota upsert).

**Axe 4 — Rendu UI**
- Composant: page with breadcrumb, header, tab switcher, content per tab, switch button.
- États: loading, saving, switching.

---

## 4. Surface B — `/atelier/console/agency` (MOUNTED, current production)

**Entry**: `atelier/console/agency/page.tsx` (46 lines).
**Auth gate**: standard session check (any logged-in user — no role enforcement at this level; the underlying APIs enforce `agency-admin`).
**Renders**: shared `<Dashboard plan="agency" />` + `<AgencyConsole />` wrapper.

The shared `Dashboard` (from `../Dashboard`) is identical for all 4 plans (Essentiel / Pro / Grandes Entreprises / Agency) — it takes `plan="agency"` as a prop and renders the sidebar, KPIs, topics, AI visibility, etc. That shared surface is **not agency-specific** and is audited elsewhere.

**AgencyConsole.tsx** (2 302 lines) appends 5 agency-specific sections below the shared dashboard. Its header comment (lines 16-22) claims:
> "Data sources (all REAL — no mock data):
>  • GET  /api/agency/clients       — list of sub-clients + usage
>  • POST /api/agency/switch        — switch active workspace
>  • GET  /api/console/reports/list — recent generated reports
>  • POST /api/console/ask          — HarchIQ AI for pitch decks + ROI narrative"

### Feature B-1: Client Switcher (Section 1)
**Axe 1 — Promesse & Origine Commerciale**
- URL source: `AgencyConsole.tsx` lines 391-691 (`ClientSwitcherSection`)
- Pitch verbatim: eyebrow "Espace de travail", title "Sélecteur de client", pill "Niveau {level.label}" (Débutant/Croissance/Entreprise per Definition A above), pill "{clients.length} client(s)".
- Niveau service: Multi-clients.

**Axe 2 — Route & Ingestion**
- Source brute: GET `/api/agency/clients` (REAL — Prisma).
- Route API: see Section 6.1 below.
- Mock? NON.

**Axe 3 — Traitement & Logique**
- Search box filters by `displayName / company.name / company.sector` (case-insensitive).
- "Vue agrégée (tous les clients)" option = `onSwitch(null)` → POST `/api/agency/switch` with `agencyClientId: null`.
- Active client resolved via `activeClientId` state (initially `null` = aggregate view).

**Axe 4 — Rendu UI**
- Composant: `<Card>` avec dropdown panel absolu (z-50), maxHeight 420px, search input + list of buttons.
- États: loading (disabled), switching (sage-bg banner with spinner), empty (no clients), search filter, active highlight (`●` sage marker).

### Feature B-2: Portfolio Table (Section 2)
**Axe 1 — Promesse & Origine Commerciale**
- URL source: `AgencyConsole.tsx` lines 693-1025 (`PortfolioTableSection`)
- Pitch verbatim: eyebrow "Portefeuille", title "Tableau des clients", button "+ Ajouter un client".
- Niveau service: Multi-clients + Facturation par compte.

**Axe 2 — Route & Ingestion**
- Données: `clients[]` (depuis le state partagé, REAL).
- Mock? NON.

**Axe 3 — Traitement & Logique**
- Filtres: search (displayName, company.name) + sector dropdown (extrait des clients).
- Pagination: PAGE_SIZE = 20, prev/next buttons, page reset on filter change.
- Colonnes: Client (avatar + name + subdomain), Secteur, Plan (pill: Sovereign/Corporate/Émergence), Sentiment (**toujours "—"** — colonne vide), Alertes (red pill if whatsappAlerts > 0), Dernier rapport (`fmtRelative(updatedAt)`), Actions ("Ouvrir →" button).

**Axe 4 — Rendu UI**
- Composant: `<Card>` + toolbar (input + select) + table 720px min-width + pagination.
- États: loading (5 skeleton rows), empty (2 messages: no clients vs no match), hover (row background).

### Feature B-3: ROI Calculator (Section 3)
**Axe 1 — Promesse & Origine Commerciale**
- URL source: `AgencyConsole.tsx` lines 1027-1416 (`ROICalculatorSection` + `ROIGauge`)
- Pitch verbatim: eyebrow "Calculateur", title "ROI de campagne", pill "Client : {name}" or "Vue agrégée".
- Niveau service: HarchIQ AI Avancé (génère un rapport ROI).

**Axe 2 — Route & Ingestion**
- Inputs: 8 champs texte (budget, teamHours, teamRate, mediaBuy, reach, cpm, leads, leadValue) — defaults hardcoded (50K MAD, 40h, 350 MAD/h, 25K MAD, 500K reach, 45 CPM, 120 leads, 800 MAD/lead).
- AI: POST `/api/console/ask` (REAL — HarchIQ chat completion).

**Axe 3 — Traitement & Logique**
- `investment = budget + teamHours × teamRate + mediaBuy`
- `ave = (reach × cpm) / 1000`
- `returns = ave + leads × leadValue`
- `roi = ((returns - investment) / investment) × 100`
- `ROIGauge` SVG semi-circle: red [-100, 0], amber [0, 100], green [100, 200]. Needle angle mapped from clamped ROI.
- "Générer le rapport ROI" → envoie un prompt à HarchIQ AI (question + tous les chiffres fmtMAD), réponse affichée dans un bloc sage-bg.

**Axe 4 — Rendu UI**
- Composant: grid 3-col (Investissement / Retours / Jauge ROI) + AI result block.
- États: aiLoading (spinner + "Génération…"), aiError (red banner), aiResult (sage-bg block, white-space pre-wrap).

### Feature B-4: Pitch Deck Generator (Section 4)
**Axe 1 — Promesse & Origine Commerciale**
- URL source: `AgencyConsole.tsx` lines 1482-1743 (`PitchDeckSection`)
- Pitch verbatim: eyebrow "Générateur de pitch", title "Outils pitch deck", 3 tools (Analyses paysage / Benchmark concurrence / Génère pitch deck 10 slides).
- Niveau service: HarchIQ AI Avancé.

**Axe 2 — Route & Ingestion**
- 3 prompts prédéfinis (PITCH_TOOLS array, line 1494).
- AI: POST `/api/console/ask` (REAL).

**Axe 3 — Traitement & Logique**
- 3 outils lancables en parallèle (résultats stockés dans `results[toolId]`).
- Chaque résultat affiché avec son titre + timestamp relatif + bouton "Lancer →".

**Axe 4 — Rendu UI**
- Composant: grid 260px min de cards outils + bloc résultat actif.
- États: loading per-tool (spinner), error per-tool (red banner), result (sage-bg block, maxHeight 400px scrollable).

### Feature B-5: Automated Reports Panel (Section 5)
**Axe 1 — Promesse & Origine Commerciale**
- URL source: `AgencyConsole.tsx` lines 1745-1951 (`ReportsPanelSection`)
- Pitch verbatim: eyebrow "Rapports automatisés", title "Centre de rapports", 2 buttons "+ Créer un template" + "Programmer un rapport".
- Niveau service: Alertes et rapports + Rapports board-ready.

**Axe 2 — Route & Ingestion**
- Reports: GET `/api/console/reports/list` (REAL, shared endpoint).
- Mock? NON pour la liste. **OUI pour les stats dérivées** (voir Axe 3).

**Axe 3 — Traitement & Logique**
- 4 stats cards: "Rapports programmés" (count of `status === "generating" || "draft"`), "Rapports ce mois" (filter createdAt this month), "Templates" (`new Set(reports.map(r => r.title)).size` — proxy, **no real templates API**), "Distribution auto" (count of clients with whatsappAlerts > 0 — **proxy**).
- Recent reports: 3 most recent, displayed with PDF download link.
- **Buttons "+ Créer un template" and "Programmer un rapport" only fire toasts**: "Le constructeur de templates sera disponible prochainement." / "Assistant de programmation de rapport ouvert." — **no actual creation flow**.

**Axe 4 — Rendu UI**
- Composant: 4 stat cards grid + "Rapports récents" list.
- États: loading (3 skeleton blocks), empty (EmptyState), report item (icon + title + meta + status pill + PDF download link).

### Feature B-6: Forbidden gate
**Axe 1 — Promesse & Origine Commerciale**
- URL source: `AgencyConsole.tsx` lines 2185-2203
- Pitch verbatim: "Accès restreint" / "Console Agences — Accès requis" / "Cette console est réservée aux administrateurs d'agence."

**Axe 2-4**: triggers when `/api/agency/clients` returns 403 — renders a single `<Card>` with `<EmptyState>`.

---

## 5. Surface C — `/atelier/console/agency/AgencyDashboard.tsx` (ORPHAN, 16 898 lines, Task ID: FINAL-AGENCY)

> **CRITICAL**: This file is **NOT imported by any page**. Verified by grep — no file in `/home/z/my-project/src` contains `from "....AgencyDashboard"` for this path. Its default export `AgencyDashboard` is referenced only inside the file itself (line 15924). All 43 sections below are **dead code from the user's perspective** — they exist but never render.

The file's header (lines 1-86) describes its intent:
- "The ULTIMATE multi-client powerhouse dashboard — 25 sections."
- "« Un seul comme un tableau de Picasso. »"
- Footer (line 16879) claims "34 sections · 6 ENV-AGENCY features · 3 R2-AGENCY features · 3 R2-AGENCY-B features · 3 R3-AGENCY-A features · 3 R4-AGENCY-A features".

The file uses a different design language than Surface B: **white bg + sage green (#4A7B5F) accents + charcoal text + Lucide icons + recharts + framer-motion + TanStack Table + shadcn/ui + sonner toasts**. It has its own self-contained sidebar, header, and mobile drawer — it's a complete dashboard shell, not a section appended to a shared dashboard.

**Real APIs (per file header lines 68-83, and confirmed by grep):**
- `/api/agency/clients` — list (REAL Prisma)
- `/api/agency/switch` — POST switch (REAL)
- `/api/console/brand-health` — score, sentiment, crisis (REAL, shared)
- `/api/console/crisis-alerts` — alerts feed (REAL, shared)
- `/api/console/insights` — HarchIQ weekly summary (REAL, shared)
- `/api/console/ai-visibility` — LLM citations (REAL, shared)
- `/api/console/sentiment-trend` — daily sentiment series (REAL, shared)
- `/api/console/topics` — top topics (REAL, shared)
- `/api/console/source-distribution` — top sources (REAL, shared)
- `/api/console/share-of-voice` — competitor SOV (claimed but no fetch found in this file)
- `/api/console/reports/list` — recent reports (REAL, shared)
- `/api/console/ask` — HarchIQ chat completion POST (REAL, shared) — called at lines 2411, 5515, 6093
- `/api/console/settings/users` — team members (REAL, shared)
- `/api/console/export-csv?type=agency-portfolio&days=90` — CSV download (REAL, shared)
- `/api/agency/clients/[id]` PATCH — white-label branding update (REAL)

### Section C-0 (ENV-AGENCY F1): AgencyTierBadgeCard
- Line 8050. Full-width banner.
- Shows current tier label (Débutant/Croissance/Entreprise per Definition B), client count, progress bar to next tier, manual override buttons (3 buttons to force any tier).
- Persisted: `localStorage["agency:tier-level"]`.
- Data: `clientCount` (REAL) + `agencyCommissionPct` (REAL) + manual override (client-side).

### Section C-1L: ClientSwitcherSplit (left 30%)
- Line 1948. Variant of B-1 with the split-layout treatment. Same data source (REAL).

### Section C-1R: HarchIQAgencyWorkspace (right 70%)
- Line 2315. Full chat UI with 8 prompt cards (AGENCY_PROMPT_LIBRARY lines 1372-1493).
- 5 follow-up chips per AI response (generateAgencyFollowUps lines 1499-1562 — keyword-based: pitch/roi/compar/crise/rapport/satisfaction).
- Source-backed responses (AskSource type with 7 source types: alert, topic, ai-visibility, neighbor, client, campaign, report).
- Conversation history: 50 conversations persisted in `localStorage["harchiq:agency:workspace-history"]`.
- Export: 1-click PDF / PPT / Copy per message — **PPT and PDF exports are simulated toasts** (line 2507-2512: "Export PowerPoint lancé — vous recevrez le fichier par email." — no actual file generated).
- POST `/api/console/ask` with `accountType: "agency"` payload.

### Section C-2: ScoreReputationHero
- Line 3145. RadialBarChart gauge (220° → -40°) with score / 100, trend pts, sentiment split (pos/neu/neg), 6 MiniStats.
- Data: REAL `health.score` (from `/api/console/brand-health`) when a client is selected; **derived proxy** (`derivedClientScore` line 1073) when in aggregate view (derived from `bars.apiRequests.pct` bands: >100→50, ≥80→90, ≥40→75, >0→60, else 55).
- Trend: hardcoded `2` (proxy — "average portfolio lift") in aggregate.
- AiCommentary: templated text using best/worst client names.

### Sections C-3 to C-8: KPI Strip (6 cards)
- C-3 KpiClientsActifs (line 3423): active/suspended/terminated counts from `clients[].status`. REAL.
- C-4 KpiAlertesCrisis (line 3461): alerts count from `alerts?.count ?? alerts?.alerts?.length` (REAL) or aggregate `clients.reduce(whatsappAlerts)`. Critical: `>= 5` whatsappAlerts per client in aggregate.
- C-5 KpiScoreMoyen (line 3514): `health?.score ?? derivedClientScore`. Delta hardcoded `2` in aggregate.
- C-6 KpiSentimentGlobal (line 3559): `health?.sentiment ?? derivedClientSentiment` — derived from `whatsappAlerts` bands (0→65/25/10, ≤2→50/30/20, ≤5→35/30/35, else 20/30/50).
- C-7 KpiArticles30J (line 3622): `health.mentionCount24h × 30` for active client; `clients.reduce(apiRequests)` for aggregate (proxy). Delta hardcoded `8`.
- C-8 KpiRapportsGeneres (line 3663): REAL count from `reports[]` filtered this month.

### Section C-9: PortfolioClientsTable
- Line 3720. TanStack Table (`useReactTable`, sorting state, filter, 8 columns).
- Columns: Client (avatar + name + slug), Secteur, Plan (sovereign/corporate/emergence pill), Score (`derivedClientScore`), Sentiment (3-color bar), Alertes, Dernier rapport (from `reports[]` cross-ref by companyName), Actions.
- Row click → `onSwitch(row.original.id)`.
- Cap: displays top 20 rows; rest hidden with "affinez la recherche" hint.
- Keyboard a11y (tabIndex, Enter/Space, aria-label).

### Section C-10: CampaignTrackerCard + RoiGauge
- Line 4209. 3 campaigns derived from `clients[]` top 3 by `apiRequests`.
- `deriveCampaigns()` (line 4135): **DERIVED — not real campaigns**. Each derived campaign has:
  - `name = "Campagne {sector} {year}"` (synthetic)
  - `budgetMAD = max(8000, round(monthlyPriceMAD × 0.6))`
  - `reachProxy = apiRequests × 12 + 400`
  - `roiPct = clamp(-15, 220, round(reachProxy / budgetMAD × 100 - 30 - alerts × 8))`
  - `status`: active/active/scheduled (deterministic from index + alerts)
  - `startDate / endDate`: deterministic offsets from now (18-7d ago, 12+6d ahead)
- "Nouvelle campagne" button → toast only ("configurateur ouvert").

### Section C-11: RevenueTrackerCard
- Line 4395. Per-client commission + LineChart (6-month trend) + BarChart (top 5 clients).
- Per-client commission: REAL — `Math.round(c.quota.monthlyPriceMAD × commissionPct / 100)`.
- 6-month trend: **DERIVED** — `totalMonthly × factor` where `factor = 1 - i × 0.05` for i = 5..0. So 5 months ago was 75% of today, linearly growing. Not from any DB history.
- "Exporter" button → `onExport` → toast "Rapport financier exporté (PDF)." — **simulated**.

### Section C-12: ClientComparisonCard (3 clients side-by-side)
- Line 4625. Top 3 clients by `derivedClientScore`.
- 6 metrics: Score, Positif %, Articles 30J, Alertes, Visibilité IA ("Cité"/"Absent" based on `bars.apiRequests.pct > 50`), Tendance ("+croissante"/"−en baisse"/"stable" from `apiRequests > 200 || alerts > 2`).
- "Comparer d'autres" button → toast only.

### Section C-12b (R4-AGENCY-A F3): MultiClientComparisonCard
- Line 4922. Side-by-side up to 5 clients across 9 metrics + Radar overlay (6 axes).
- 9 metrics: Score, Sentiment, Mentions 30d, Crisis alerts (HASH-DERIVED: `hashStr(c.id + ":crisis") % 4` — 0-3 deterministic), Health band, MRR, Plan, Retention months, HarchIQ usage.
- Radar: 6 axes (Score, Sentiment, Mentions, MRR, Rétention, HarchIQ) normalized 0-100.
- "Exporter la comparaison" → toast only. "Sauvegarder la vue" → persisted in `localStorage["agency:comparison-views"]` (max 5 views).
- Default: top 3 by MRR.

### Section C-13: HarchIQChatCard
- Line 5420. **Second** chat UI (in addition to C-1R). Welcome message pre-seeded with `weeklyInsight.body` from `/api/console/insights`.
- 5 suggestion chips (`AGENCY_SUGGESTION_CHIPS`).
- Conversation history persisted in `localStorage["harchiq:agency:chat-history"]` (cap 50).
- "Génère un rapport client mensuel" button → `send("Génère un rapport client mensuel pour {target}.")`.
- PDF/PPT export per message → simulated toasts.
- Same `/api/console/ask` endpoint as C-1R — **so C-1R and C-13 are 2 chat UIs pointing to the same backend**. Only difference: C-1R has 8 prompt cards + workspace history; C-13 has 5 chips + welcome pre-seeded with weekly insight.

### Section C-14: RapportsAutomatisesCard
- Line 5904. 4 stat cards (programmés / ce mois / templates / distribution auto) + recent reports list.
- Same proxy logic as B-5. "+ Créer un template" / "Programmer un rapport" → toast only.

### Section C-15: PitchDeckCard
- Line 6048. 3 tools (landscape / benchmark / pitch) with inline results.
- Same prompts as B-4 but different UI (vertical list instead of grid).
- POST `/api/console/ask`.
- "Copier" button on each result.

### Section C-16: WhiteLabelCard
- Line 6264. Settings panel for active client's branding.
- Toggle "Activer la marque blanche" (hideHarchBadge), Logo URL input, Primary color picker, Accent color picker, Domain input.
- Save: PATCH `/api/agency/clients/${activeClient.id}` (REAL — writes to `AgencyBranding` + `AgencyClient.customDomain`).
- Live preview panel (line 6503+).

### Section C-17: TeamAssignationsCard
- Line 6638. TanStack Table of team members.
- Data: GET `/api/console/settings/users` (REAL, shared).
- Columns: Membre (avatar + name + email), Rôle, Statut, Dernière connexion, Clients assignés (count), Actions.
- "Inviter" button → toast only ("Invitation envoyée — l'email arrivera dans quelques minutes.").

### Section C-18: MatriceAssignationCard
- Line 6900. Grid users × clients with checkboxes.
- Data: REAL `users[]` + `clients[]`.
- Click checkbox → toast only ("{user} → {client} : assignation mise à jour.") — **no actual API call to persist assignment**.

### Section C-19: TendanceSentimentCard
- Line 7138. ComposedChart (Area + 3 Lines: positive/neutral/negative) with range selector 7j/30j/90j.
- Data: REAL `/api/console/sentiment-trend?range={range}` (shared endpoint).

### Section C-20: DiversiteSourcesCard
- Line 7261. Horizontal BarChart of top sources.
- Data: REAL `/api/console/source-distribution` (shared endpoint).

### Section C-21: AlertesCrisisCard
- Line 7374. Feed of 8 most critical alerts.
- Data: REAL `/api/console/crisis-alerts` when a client is selected; in aggregate mode, synthesizes "alert" objects from `clients[].whatsappAlerts` counts (each client with alerts > 0 becomes a synthetic alert).
- "Voir toutes" button → toast only ("Vue complète des alertes — bientôt disponible.").

### Section C-22: TopSujetsCard
- Line 7510. Horizontal bars with sentiment split.
- Data: REAL `/api/console/topics` when a client is selected; in aggregate, derives top 5 from `clients[].company.sector` grouped + `apiRequests + 20` as count (proxy).

### Section C-23: VisibiliteIaCard
- Line 7612. 3 LLM cards (ChatGPT, Perplexity, Gemini).
- Data: REAL `/api/console/ai-visibility` when a client is selected; in aggregate, **synthesizes 3 LLM cards from `citedCount = clients.filter(c => c.usage.apiRequests > 100).length`** (proxy — clients with >100 API calls are assumed to be cited).
- `trend` per LLM is hardcoded (1, 0, -1 for i=0,1,2 — ChatGPT up, Perplexity stable, Gemini down).

### Section C-24: ActiviteReseauCard
- Line 7798. Stacked AreaChart, 4 series.
- Data: REAL `trend` (sentiment-trend) repurposed.

### Section C-25: BoiteOutilsAgenceCard
- Line 7925. 4 action cards full-width.
- Actions: Export CSV (REAL `/api/console/export-csv?type=agency-portfolio&days=90`), Générer rapport global (toast only), Ajouter un client (opens wizard C-ENV2), Configurer les alertes WhatsApp (toast only).

### Section C-ENV2: ClientOnboardingWizard (4-step modal)
- Line 8249. 4 steps: Infos client, Branding white-label, Quota & plan, Team assignment.
- On finish: creates a `PendingClient` object → pushes to `pendingClients[]` state → persisted in `localStorage["agency:pending-clients"]` (cap 50).
- **No API call to actually create the client** — only adds to a pending list with toast "Client « {name} » ajouté au portefeuille (en attente de validation)."

### Section C-ENV3: CommissionCalculatorCard
- Line 8737. Inputs: monthlyRetainer (default 6500 MAD), clientCount (default 8).
- Outputs: totalRevenue, agencyShare (commissionPct from tier — Definition B), harchShare, projection annuelle, uplift to next tier.
- Chart: stacked BarChart (5 sample clients A-E with deterministic retainers: 1×, 1.4×, 0.7×, 1.8×, 1×).
- Persisted: `localStorage["agency:commission-calc"]`.
- "Simuler tier supérieur" toggle.

### Section C-ENV4: ClientPortalPreviewCard
- Line 8967. Live preview of what the client sees.
- Toggle: Vue agence / Vue client (in client view, hides agency-specific features).
- "Envoyer l'accès client" button → toast only.
- Persisted: `localStorage["agency:portal-preview"]`.

### Section C-ENV5: PitchPipelineCard (Kanban)
- Line 9258. 3 columns: Prospect / Proposition / Won.
- Items persisted in `localStorage["agency:pitch-pipeline"]`.
- Add prospect form (name, sector, estimatedValue, probability, nextActionDate).
- Drag-drop between columns → updates `stage` field.
- **No API call** — pure client-side kanban.

### Section C-ENV6: TeamWorkloadBalancerCard
- Line 9548. Per-member workload bars.
- Data: REAL `users[]` + `clients[]` + `localStorage["agency:workload-balancer"]` for manual capacity overrides.
- Members deterministically assigned clients if none assigned yet (line 10055).
- "Inviter" button → toast only.

### Section C-R2B1: TeamPerformanceDashboardCard
- Line 10041. Per-member score (composite: clients, reports, harchiqQuestions, responseTime).
- Data: REAL `clients[]` + `localStorage["agency:team-perf"]` for manual overrides (`manualScoreAdjust`).
- Sort: score / clients / reports / response.
- `computeTeamPerfScore()` (line 10019) — composite formula.
- **`harchiqQuestionsUsed`, `reportsThisMonth`, `responseTimeHours` are not fetched from any API — they default to deterministic values from `hashStr(member.id)`** and can be manually overridden.

### Section C-R2B2: PitchDeckAnalyticsCard
- Line 10697. Funnel + sources + monthly wins.
- Data: READS from `localStorage["agency:pitch-pipeline"]` (the C-ENV5 kanban) — `computePitchAnalytics(items)` (line 10605).
- Funnel stages: prospects / propositions / meetings / won.
- Sources: LinkedIn / Referral / Cold outreach / Inbound — `derivePitchSource(name)` uses `hashStr(name) % 4` to deterministically assign a source.
- Monthly wins: deterministic fallback `hashStr("label-i")` if no dates match.

### Section C-R2B3: WhiteLabelThemeEditorCard
- Line 11654. Full white-label theme editor.
- Fields: primaryColor, logoDataUrl (file upload → base64), fontFamily (inter/space-mono/system), borderRadius (0-16px), hideHarchBadge, loginTitle, faviconColor.
- Live preview mini-dashboard mockup (line 11753).
- Persisted: `localStorage["agency:wlabel-theme"]`.
- **No API call** to persist the theme — purely client-side preview. The actual save is via C-16 (WhiteLabelCard) which only saves 3 fields (logoUrl, primaryColor, hideHarchBadge) + customDomain.

### Section C-R4A1: ClientRevenueTrackerCard
- Line 13492. Per-client MRR + setup fee + overage + commission + YTD.
- Data: REAL `clients[]` (for `quota.monthlyPriceMAD`, `createdAt`) + `localStorage["agency:revenue-tracker"]` for manual overrides.
- **`setupFee = setupFeeFromHash(clientId, tier)`** (line 13442): `base × (100 + (hashStr(clientId + ":setup") % 60) - 30) / 100` — ±30% variance from base. **DETERMINISTIC MOCK.**
- **`overageCharges = overageChargesFromHash(client)`** (line 13449): `base × (pct - 80) / 20 + hashStr(client.id + ":overage") % 200` — only if `pct > 80`. **DETERMINISTIC MOCK.**
- `commissionEarned = (mrr × monthsElapsed + setupFee + overage) × commissionPct / 100`.
- 4 summary KPIs + BarChart (top 10) + PieChart (by tier).
- "Facturer" button → toast only ("Facture générée · PDF simulé").
- "Ajuster" dialog → persists MRR / setup / commission overrides.

### Section C-R2A1: ClientHealthScoringCard
- Line 12367. Per-client health score 0-100.
- `computeClientHealth(client)` (line 12292): 5 factors with weights:
  - Sentiment (0.3): `derivedClientSentiment.positive × 0.7 + neutral × 0.3`
  - Velocity (0.15): `bars.apiRequests.pct` clamped 0-100
  - Crisis (0.25): `max(0, 100 - alerts × 15)`
  - Engagement (0.15): `min(100, apiReq / 5000 × 100)`
  - Retention (0.15): `min(100, retention / 24 × 100)`
- **6-month trend is HASH-DERIVED**: `seed = hashStr(client.id)`, `wobble = ((seed >> (i × 2)) & 0x0f) - 8`, `drift = score < 60 ? -i × 2 : score > 80 ? i × 1 : 0`. Pushed to `trend[]`. **NOT REAL HISTORY.**
- 4 health bands: excellent (≥80) / bon (≥60) / surveiller (≥40) / risque (<40).
- Manual override: ±5 / ±10 buttons, persisted in `localStorage["agency:client-health-overrides"]`.
- Per-client expandable: top 3 risk factors + action plan (`actionPlanFor(score)` — 4 hardcoded action lists).
- "Lancer le plan d'action" button → toast only.

### Section C-R2A2: ChurnRiskIndicatorCard
- Line 12752. Per-client churn risk 0-100%.
- `computeChurnRisk(client)` (line 12700): 4 factors with weights:
  - declineRisk (0.3): `100 - apiPct` (low usage = high risk)
  - dropRisk (0.3): `min(100, sentiment.negative × 2)`
  - ticketRisk (0.2): `min(100, alerts × 20)`
  - proxRisk (0.2): `(cycleMonth / 11) × 100` — cycleMonth = retention % 12 (proximity to contract end)
- 4 bands: fidele (<25) / stable (<50) / volatile (<75) / imminent (≥75).
- `contractEndDate = createdAt + 12 + floor(retention/12) × 12 months` — **assumes 12-month contracts, not from any DB field**.
- `recommendedAction` — hardcoded per band.
- "Lancer campagne de rétention" → persisted in `localStorage["agency:churn-risk"]` (campaignLaunchedAt timestamp + acknowledgedClientIds[]). Toast only.
- Forecast: `entries.filter(e => e.riskPct >= 76).length` (≥76% = "churn ce mois").
- Revenue at risk: `entries.filter(e => e.riskPct >= 51).reduce(monthlyRevenueMAD)`.

### Section C-R2A3: RevenueForecastingCard
- Line 13096. 12-month projection LineChart (3 scenarios: conservateur / réaliste / optimiste).
- `simulateForecast(inputs)` (line 13058):
  - `cons = currentMRR × (1 - churn)` each month (no growth)
  - `real = currentMRR × (1 - churn) + monthlyPipeline`
  - `opt = currentMRR × (1 - churn) + monthlyPipeline + opt × upsell`
- 5 inputs (sliders): currentMRR (default 52000 MAD), pipelineValue (47000), churnRatePct (5), winRatePct (30), upsellPct (15).
- One-shot sync: derived MRR from REAL `clients[].quota.monthlyPriceMAD` summed → updates `currentMRR` if user hasn't manually changed it.
- ReferenceLine at `thresholdMRR = nextTier.minClients × avgRetainer` — shows when tier upgrade is reachable.
- "monthsToUpgrade" badge if realistic scenario crosses threshold.
- Persisted: `localStorage["agency:revenue-forecast"]`.

### Section C-R3A1: ClientLifecycleCard
- Line 14013. Pipeline of clients across 5 lifecycle stages: prospect / onboarding / actif / renouvellement / fidele.
- `seedLifecycleClients(clients)` (line 13995): distributes clients across stages using `hashStr(clientId) % 10` (0-1 → prospect, 2-3 → onboarding, 4-6 → actif, 7-8 → renouvellement, 9 → fidele). **DETERMINISTIC MOCK.**
- `daysInStageFromHash(clientId, stage)` (line 13978): `hashStr(clientId + ":" + stage) % 30 + 1` (1-30 days). **MOCK.**
- `nextActionDateFromHash(clientId)` (line 13989): deterministic ISO date. **MOCK.**
- Persisted: `localStorage["agency:client-lifecycle"]`.
- "Faire progresser" button → advances stage, persists.

### Section C-R3A2: UpsellOpportunityTrackerCard
- Line 14480. Identifies clients with upsell potential.
- `computeUpsellOpportunity(client)` (line 14412): generates an upsell recommendation if client is on `emergence` or `corporate` plan AND meets certain factors (apiPct, retention, alerts).
- 3 factors with thresholds: Usage quota (≥70%), Ancienneté (≥6 mois), Stability (alerts ≤2).
- Probability: 50% base + 15% per met factor.
- `monthlyRevenueUplift`: difference between current tier's monthlyPriceMAD and next tier's.
- "Recommander" button → toast only.
- "Ignorer" button → persists ignoredClientIds[] in `localStorage["agency:upsell-opportunities"]`.
- "Lancer campagne d'upsell" → persists campaignSentAt timestamp. Toast only.

### Section C-R3A3: AgencyBenchmarkCard
- Line 14916. Radar chart comparing your agency vs médiane vs top 10% across 6 metrics.
- 6 metrics (`BENCHMARK_METRICS` line 14807):
  1. **Clients/AM**: median=8, top10=15. Source claimed: "Enquête ANAE Maurice 2024 (n=42 agences RP)". Compute: `clients.length / max(1, users.length)`. REAL.
  2. **Revenu/client (MAD/mois)**: median=5500, top10=9500. Source claimed: "Benchmark Harch Agency Q3 2024 (n=64 agences)". REAL compute.
  3. **Rétention 12 mois (%)**: median=82, top10=94. Source claimed: "SaaS Retention Benchmark 2024 (OpenView Partners)". REAL compute.
  4. **Taille contrat (MAD/mois)**: median=5200, top10=12000. Source claimed: "Harch Agency Sales Report 2024". REAL compute (same as #2 — duplicate).
  5. **Temps onboarding (jours)**: median=21, top10=7 (inverted). Source claimed: "PSA Industry Report 2024". Compute: `14 + hashStr("onboard:" + clients.length + ":" + users.length) % 21` (14-34 days). **DETERMINISTIC MOCK.**
  6. **NPS**: median=32, top10=65. Source claimed: "Harch NPS Survey Q3 2024 (n=128 agences)". Compute: `25 + hashStr("nps:" + clients.length + ":" + users.length) % 50` (25-74). **DETERMINISTIC MOCK.**
- The "source" labels (ANAE Maurice, Harch Agency Q3 2024, OpenView Partners, PSA Industry Report, Harch NPS Survey Q3 2024) **appear fabricated** — they cite specific sample sizes (n=42, n=64, n=128) but the underlying values are either computed from real data or hashed mock.
- Manual override: ± buttons per metric, persisted `localStorage["agency:benchmark-overrides"]`.
- Global score = average of normalized scores (0-100).
- Forces list (above median) + Axes d'amélioration list (below median).

### Section C-R4A2: PitchTemplateLibraryCard
- Line 11088. 6 built-in templates + up to 3 custom templates.
- Built-in templates (`kind`: audit, benchmark, crisis, esg, influence, monthly) with `winProbabilityPct` (deterministic per template id).
- "Use" button → increments `timesUsed` and probabilistically increments `wins` (roll = `hashStr(tpl.id + ":" + (timesUsed+1) + ":" + Date.now()) % 100` < winProbabilityPct).
- "Create custom" form (name, description, sections textarea, estimatedSlides).
- Persisted: `localStorage["agency:pitch-templates"]` (customTemplates + usage map).
- **No API call** to persist templates or track usage — purely client-side.

---

## 6. API Routes — Agency-Specific

**Base path**: `/home/z/my-project/src/app/api/agency/`

| Route | Method | Auth | Source | Mock? | Used by |
|---|---|---|---|---|---|
| `/api/agency/clients` | GET | `agency-admin` (cookie session) | Prisma `AgencyClient.findMany` + `AgencyUsage.findMany` for current period | NO | Surfaces A, B, C |
| `/api/agency/clients` | POST | `agency-admin` | Prisma transaction: `AgencyClient` + `AgencyBranding` + `AgencyQuota` + `AgencyUsage` (zeroed) | NO | Surface A (CreateClientModal) |
| `/api/agency/clients/[id]` | GET | `agency-admin` + ownership | Prisma `AgencyClient.findUnique` + `getUsageStats()` | NO | Surface A (AgencyClientDetail) |
| `/api/agency/clients/[id]` | PATCH | `agency-admin` + ownership | Prisma transaction: `AgencyClient` + `AgencyBranding` upsert + `AgencyQuota` upsert | NO | Surfaces A, C (WhiteLabelCard) |
| `/api/agency/switch` | POST | `agency-admin` | `switchActiveClient()` / `clearActiveClient()` — sets `activeAgencyClientId` cookie (30-day, httpOnly, sameSite=lax) | NO | Surfaces A, B, C |
| `/api/agency/quota` | GET | `agency-admin` | `getUsageStats(activeAgencyClientId)` | NO | Not used by any UI (no fetch found) |
| `/api/agency/branding` | GET | **PUBLIC** (no auth) | `getBrandingFromHost()` — resolves host → AgencyClient → branding payload | NO | Login page (public) |
| `/api/agency/whatsapp-import` | POST | `agency-admin` | GLM-4 (z-ai-web-dev-sdk) → Zod-validated extraction → Prisma creates `Company`, `AgencyClient`, `AgencyBranding`, `AgencyQuota`, optional `User` | NO (real LLM call) | Surface A only |

### 6.1 `GET /api/agency/clients` — Detailed
- Returns: `{ agency: AgencyMeta, clients: AgencyClient[], count }`.
- Each client is enriched with `usage` (current period) + `bars` (5 utilization bars: apiRequests, whatsappAlerts, keywords, sources, users, each with `used / max / pct`).
- `AgencyMeta` includes `commissionPct` (single value per agency — NOT tier-driven).
- Plan tiers in DB: `emergence` (15K MAD/mo, 10K API, 100 WA, 50 kw, 30 src, 5 usr), `corporate` (40K MAD/mo, 50K API, 500 WA, 200 kw, 80 src, 15 usr), `sovereign` (75K MAD/mo, 250K API, 2K WA, 1K kw, 250 src, 50 usr).

### 6.2 `POST /api/agency/switch` — Detailed
- Body: `{ agencyClientId: string | null }`.
- If `null` → `clearActiveClient()` (clears cookie).
- Else → `switchActiveClient(id)` verifies the client belongs to the admin's agency.
- Sets cookie `activeAgencyClientId` (30-day, httpOnly, sameSite=lax).
- Does NOT re-issue JWT — workspace switches are cheap.
- Returns: `{ ok, activeAgencyClientId, companyId, agencyId, message }`.

### 6.3 `POST /api/agency/whatsapp-import` — Detailed (the B2B2B killer feature)
- Body: `{ conversation: string, createAccount?: boolean }`.
- Auth: requires `role ∈ {agency-admin, admin}` AND `agencyId` linked.
- **Step 1**: GLM-4 extraction with system prompt (lines 154-168 of route.ts):
  - "Extract: company_name, contact_name, email, phone, plan_tier (emergence/corporate/sovereign/custom), pricing_mad, topics[], competitors[], use_case, notes. Return ONLY valid JSON."
- **Prompt-injection defense** (Zod schema, route.ts lines 57-72):
  - `.strict()` — rejects unknown keys (prototype pollution defense).
  - `plan_tier` whitelisted to 4 values via `z.enum(VALID_PLAN_TIERS)`.
  - `pricing_mad` clamped to `[PLAN_MIN_PRICE[tier], 1_000_000]` — prevents "sovereign at 0".
  - All strings length-capped; topics/competitors arrays capped at 50.
  - If GLM-4 returns garbage → minimal empty ExtractedData returned (no crash).
- **Step 2** (if `createAccount: true` AND `company_name` extracted):
  - Slugifies company name, checks for existing `Company` by slug or case-insensitive name, creates if not found.
  - Creates `AgencyClient` (active), `AgencyBranding` (default colors `#0A0A0A` + `#10b981`), `AgencyQuota` (defaults per tier).
  - If email extracted → creates `User` with random 14-char temp password (bcrypt-hashed), role `user`, accountType `brand-monitor`, status `invited`.
  - Logs to audit trail: `action: "agency_subclient_created"`, `metadata: { source: "whatsapp_import", company, planTier, monthlyPriceMAD }`.
  - Returns: `{ extracted, created: true, agencyClientId, displayName, monthlyPriceMAD, planTier, message }`.

### 6.4 Missing endpoints (promised but absent)
- **No `/api/agency/commission`** — commission is computed client-side from `agency.commissionPct` (single value) or `tier.commissionPct` (Definition B, orphan only). The 20/25/30 ladder is client-side fiction.
- **No `/api/agency/templates`** — Pitch Template Library (C-R4A2) is purely client-side (localStorage).
- **No `/api/agency/campaigns`** — Campaign Tracker (C-10) derives campaigns from `clients[]` data; there is no `Campaign` table or route.
- **No `/api/agency/health`** — Client Health (C-R2A1) is computed client-side from `clients[]` + `hashStr(clientId)` for trend.
- **No `/api/agency/churn`** — Churn Risk (C-R2A2) is computed client-side with hardcoded 12-month contract assumption.
- **No `/api/agency/benchmark`** — Benchmark (C-R3A3) uses hardcoded median/top10 values with claimed sources (ANAE Maurice, OpenView Partners, PSA Industry Report, Harch NPS Survey Q3 2024) that appear fabricated.
- **No `/api/agency/upsell`** — Upsell Tracker (C-R3A2) is computed client-side.
- **No `/api/agency/lifecycle`** — Lifecycle (C-R3A1) is client-side with hash-based stage distribution.
- **No `/api/agency/forecast`** — Revenue Forecasting (C-R2A3) is a pure client-side simulation.
- **No `/api/agency/team-performance`** — Team Perf (C-R2B1) uses hash-derived defaults for `harchiqQuestionsUsed`, `reportsThisMonth`, `responseTimeHours`.
- **No `/api/agency/pitch-analytics`** — Pitch Analytics (C-R2B2) reads the localStorage kanban (C-ENV5).
- **No `/api/agency/wlabel-theme`** — White-Label Theme Editor (C-R2B3) persists to localStorage only; the actual save is via the simpler WhiteLabelCard (C-16) which only handles 3 fields.

---

## 7. Shared Console APIs Used by Agency

The agency surfaces also consume these shared endpoints (audited separately, listed here for completeness):

| Endpoint | Used by | Mock? |
|---|---|---|
| `/api/console/brand-health` | C-2, C-3 to C-8, C-9 | NO (shared, real) |
| `/api/console/crisis-alerts` | C-4, C-21 | NO (shared, real) |
| `/api/console/insights` | C-13 (welcome pre-seed) | NO (shared, real) |
| `/api/console/ai-visibility` | C-23 | NO (shared, real) |
| `/api/console/sentiment-trend` | C-19, C-24 | NO (shared, real) |
| `/api/console/topics` | C-22 | NO (shared, real) |
| `/api/console/source-distribution` | C-20 | NO (shared, real) |
| `/api/console/reports/list` | B-5, C-8, C-14 | NO (shared, real) |
| `/api/console/ask` | B-3, B-4, C-1R, C-13, C-15 | NO (real LLM via shared endpoint) |
| `/api/console/settings/users` | C-17, C-18, C-ENV6, C-R2B1 | NO (shared, real) |
| `/api/console/export-csv?type=agency-portfolio&days=90` | C-25 | NO (shared, real CSV) |
| `/api/companies` | A-6 (CreateClientModal) | NO (shared, real) |

---

## 8. Other Agency Touchpoints

### 8.1 `AtelierHome.tsx` (landing page)
- **No dedicated agency section**. Grep for "agenc" only returns generic mentions (AI engines, "agences de notation", media-source lists).
- The 4-plan pricing is not surfaced on the home page.

### 8.2 `AboutPage.tsx`
- **No agency mentions**. Grep returns zero hits.

### 8.3 `ChangelogPage.tsx`
- Mentions Agency-specific fixes (lines 30-44):
  - "Hook usePersistentState<T> — localStorage-backed state pour HarchIQ history (Agency, Pro, Enterprise)"
  - "Char counter sur le chat HarchIQ Agency (textarea) — 'N / 2000' avec couleur amber si >1800"
  - "Tooltip Recharts sur le gauge RadialBarChart Score de Réputation (Agency)"
  - "Bouton Copy sur les résultats du Pitch Deck Generator (Agency)"
  - "HarchIQ Agency Section 13 : <input> single-line → <textarea> auto-grow avec Shift+Enter pour newline (parité restaurée vs Section 1)"
  - "Historique des conversations HarchIQ : cap 5/10 → 50, persistance localStorage (survit refresh/switch client) sur Agency, Pro, Enterprise"
  - "Pitch Deck Generator : serial-lock supprimé (3 outils en parallèle au lieu de séquentiel)"
  - "Portfolio Clients table (Agency) : keyboard a11y — tabIndex, onKeyDown (Enter/Space), aria-label, focus-visible ring (WCAG 2.1 Level A)"
  - "Footer 'Dernière maj' (Agency Score hero) : span non-cliquable → button cliquable qui déclenche handleRefresh"

> **NOTE**: These changelog entries reference features from the **orphan** AgencyDashboard.tsx (Section 1 chat, Section 13 chat, Portfolio table with a11y, Score hero with refresh button). The orphan file is the one referenced by these changelog entries — but the file is NOT mounted, so users see none of these improvements.

### 8.4 `faq-data.ts`
- Multiple agency-specific Q&As (lines 380, 388, 399, 403, 433, 438, 450, 456, 780, 784, 797, 803, 814, 817, 823, 831, 834, 848, 857, 863, 874, 882, 916).
- Key promises (verbatim):
  - "Multi-tenant : agences et groupes peuvent créer un dashboard par client/filiale" (line 145)
  - "Agences : multi-clients, white-label, gouvernance multi-comptes, quota flexible" (line 388)
  - "Le programme partenaire Harch Atelier est ouvert aux agences RP, cabinets de conseil en communication et freelances senior... Le programme inclut : un compte Agence avec multi-clients, **une remise partenaire (15 à 30 % selon le volume)**, une formation certifiante de 2 jours..." (line 831)
  - "Le plan Agences est conçu pour les agences qui gèrent entre 3 et 50 clients. Au-delà, nous proposons des contrats-cadres spécifiques avec pricing dégressif." (line 874) — **NOTE**: this introduces a "3 client minimum" not seen elsewhere.
  - "Le white-label est inclus dans le plan Agences et peut être configuré en self-service depuis la console partenaire." (line 848)
  - "Le plan Agences fournit une console multi-clients dédiée. Vous créez un « workspace » par client... Vous basculez d'un client à l'autre en un clic depuis le sélecteur en haut de la console. Un tableau de bord de pilotage agrège les KPIs de tous vos clients..." (line 865)

### 8.5 `PartnersPage.tsx` (`/atelier/partners`)
- 4 partner types: PR & Comms Agencies, Technology Partners, Strategic Allies, Referral Partners.
- PR & Comms Agencies: "20% recurring commission on every client", "White-label dashboards and reports (your brand)", requirements: "Established PR or comms agency (3+ years)", "Minimum 5 active enterprise clients".
- **Inconsistency**: 20% flat for PR agencies here vs 20/25/30% tier ladder in orphan code vs 15-30% range in FAQ vs 15% for 12 months for Referral Partners.

### 8.6 `PartnerRegistration.tsx` (`/atelier/partners/apply`)
- Partner type dropdown includes `"pr-agency"` labeled "Agence RP & Communication".

### 8.7 `tokens.ts` (line 115)
- Top nav dropdown: `{ label: "Agences", href: "/atelier/pricing#agency", desc: "Pour les multi-clients" }`.

### 8.8 `request-access/RequestAccessPage.tsx`
- Plan selector includes `{ id: "agences", label: "Agences", desc: "Pour les multi-clients" }`.

### 8.9 `products/ProductHubPage.tsx`
- 4-plan grid includes `name: "Agences"`, `tagline: "Pour l'agence qui multi-clients et white-label."`, `bestFor: "Agences RP, cabinets de conseil, intégrateurs."`.

### 8.10 `console/Dashboard.tsx` (shared)
- Line 93: `agency: "Agences"` in a plan-label map.

### 8.11 `console/settings/users/UserManagement.tsx`
- Line 93: `{ label: "Agences", ... }` in a plan/role dropdown.

---

## 9. Mocked vs Real — Tally

### 9.1 Surface A (`/atelier/agency`) — ALL REAL
- All data from real Prisma queries via `/api/agency/clients`, `/api/companies`, `/api/agency/switch`, `/api/agency/whatsapp-import` (real GLM-4 call).
- No localStorage, no deterministic hashing, no fake trend.

### 9.2 Surface B (`/atelier/console/agency` — actually mounted production) — ALL REAL with toast-only gaps
- All data from real APIs (`/api/agency/clients`, `/api/console/reports/list`, `/api/console/ask`).
- ROI calculator: real client-side math + real LLM call for the report.
- Pitch deck generator: real LLM call.
- Reports panel: real list, but **stat proxies** (templates count = `new Set(reports.map(r => r.title)).size`, distribution auto = clients with alerts > 0).
- **Toast-only buttons (no backend)**: "+ Ajouter un client" (B-2), "+ Créer un template" (B-5), "Programmer un rapport" (B-5).

### 9.3 Surface C (orphan 16 898-line file) — MIXED, leans MOCK

**REAL** (data sourced from real APIs):
- Client list, agency meta, switching (Sections C-0, C-1L, C-9, C-17, C-18, C-ENV6, C-25)
- Brand health, alerts, sentiment trend, AI visibility, topics, source distribution, insights, reports (C-2 to C-8, C-19, C-20, C-21, C-22, C-23, C-24, C-13 welcome pre-seed)
- White-label save (C-16 — PATCH `/api/agency/clients/[id]`)
- HarchIQ chat (C-1R, C-13, C-15 — POST `/api/console/ask`)
- CSV export (C-25 — GET `/api/console/export-csv`)

**DETERMINISTIC MOCK** (real clientId + `hashStr()` to fabricate values that look real):
- Campaign Tracker (C-10): campaigns derived from `clients[]` API usage
- Revenue Tracker 6-month trend (C-11): `totalMonthly × (1 - i × 0.05)`
- Multi-Client Comparison crisis alerts (C-12b): `hashStr(c.id + ":crisis") % 4`
- Client Health 6-month trend (C-R2A1): `hashStr(client.id)` → wobble + drift
- Churn Risk contractEndDate (C-R2A2): assumes 12-month contracts from `createdAt`
- Client Revenue Tracker setupFee + overage (C-R4A1): `hashStr(clientId + ":setup")`, `hashStr(client.id + ":overage")`
- Client Lifecycle stage + daysInStage + nextActionDate (C-R3A1): `hashStr(clientId)`, `hashStr(clientId + ":" + stage)`, `hashStr(clientId + ":action")`
- Agency Benchmark onboarding time + NPS (C-R3A3): `hashStr("onboard:" + ...) % 21`, `hashStr("nps:" + ...) % 50`
- Team Performance defaults (C-R2B1): `harchiqQuestionsUsed`, `reportsThisMonth`, `responseTimeHours` not fetched — deterministic defaults
- Pitch Analytics source attribution + monthly wins fallback (C-R2B2): `hashStr(name) % 4`, `hashStr("label-i")`

**PURE CLIENT-SIDE FICTION** (no API, persisted to localStorage only):
- Pitch Pipeline kanban (C-ENV5): `localStorage["agency:pitch-pipeline"]`
- White-Label Theme Editor (C-R2B3): `localStorage["agency:wlabel-theme"]` (the 6-field theme is never saved to DB — only the 3-field subset via C-16)
- Pitch Template Library (C-R4A2): `localStorage["agency:pitch-templates"]`
- Client Onboarding Wizard (C-ENV2): `localStorage["agency:pending-clients"]` — clients stay "pending" forever, no API to promote them
- Tier override (C-0): `localStorage["agency:tier-level"]` — override is purely cosmetic
- Commission Calculator inputs (C-ENV3): `localStorage["agency:commission-calc"]`
- Portal Preview config (C-ENV4): `localStorage["agency:portal-preview"]`
- Revenue Forecast inputs (C-R2A3): `localStorage["agency:revenue-forecast"]`
- Revenue Tracker overrides (C-R4A1): `localStorage["agency:revenue-tracker"]`
- Client Health overrides (C-R2A1): `localStorage["agency:client-health-overrides"]`
- Churn Risk campaign state (C-R2A2): `localStorage["agency:churn-risk"]`
- Upsell Tracker ignored list + campaign (C-R3A2): `localStorage["agency:upsell-opportunities"]`
- Benchmark overrides (C-R3A3): `localStorage["agency:benchmark-overrides"]`
- Comparison saved views (C-12b): `localStorage["agency:comparison-views"]`
- Team Workload Balancer capacity overrides (C-ENV6): `localStorage["agency:workload-balancer"]`
- Team Performance manual overrides (C-R2B1): `localStorage["agency:team-perf"]`
- HarchIQ chat history (C-1R, C-13): `localStorage["harchiq:agency:workspace-history"]`, `localStorage["harchiq:agency:chat-history"]`

**TOAST-ONLY (button exists, no backend)**:
- "Nouvelle campagne" (C-10)
- "Exporter" financial PDF (C-11)
- "Comparer d'autres" (C-12)
- "Voir toutes" alerts (C-21)
- "Générer rapport global" (C-25)
- "Configurer les alertes WhatsApp" (C-25)
- "Inviter" team member (C-17, C-ENV6)
- Matrice d'assignation checkbox click (C-18)
- "Lancer le plan d'action" (C-R2A1)
- "Lancer campagne de rétention" (C-R2A2 — only persists a timestamp, no actual campaign)
- "Recommander" upsell (C-R3A2)
- "Facturer" (C-R4A1 — "PDF simulé")
- PDF / PPT export per HarchIQ message (C-1R, C-13) — "vous recevrez le fichier par email"
- "+ Créer un template" (C-14)
- "Programmer un rapport" (C-14)
- "Envoyer l'accès client" (C-ENV4)

---

## 10. Feature Tally & Gaps

### 10.1 Feature count

| Surface | Mounted? | Distinct features | Real | Mock | Toast-only buttons |
|---|---|---|---|---|---|
| A — `/atelier/agency` | YES | 8 (header, 4 KPI, toolbar, sub-client grid, SubClientCard, CreateClientModal, WhatsAppImportModal, AgencyClientDetail 3 tabs) | 8 | 0 | 0 |
| B — `/atelier/console/agency` (AgencyConsole.tsx) | YES | 5 (Client Switcher, Portfolio Table, ROI Calculator, Pitch Deck Generator, Reports Panel) | 5 | 0 (1 stat proxy) | 3 (+ Ajouter / + Créer template / Programmer) |
| C — `AgencyDashboard.tsx` (orphan) | **NO** | ~43 (25 base + 6 ENV + 3 R2A + 3 R2B + 3 R3A + 3 R4A) | ~15 | ~16 deterministic-mock | ~15 client-side fiction + ~15 toast-only |
| **TOTAL** | — | **~56 distinct features** | ~28 | ~16 | ~18 |

### 10.2 Top gaps

1. **ORPHAN CODE**: 43 features in `AgencyDashboard.tsx` (16 898 lines) are never rendered. The changelog references these features as if they were live. Decision needed: either mount this file (replace `Dashboard + AgencyConsole` with `AgencyDashboard`) or delete it and update the changelog.
2. **3-tier commission ladder is fiction**: The 20/25/30% commission based on client count (Débutant/Croissance/Entreprise) exists only in client-side orphan code (Definition B). The DB has a single `Agency.commissionPct` field. Real agencies see their actual commission (e.g. 20%) regardless of tier.
3. **Conflicting tier thresholds**: 6/50 (Definition A, live) vs 5/20 (Definition B, orphan). FAQ mentions "3 to 50 clients" range. Pricing page gives no thresholds. Partners page says 20% flat for PR agencies.
4. **No backend for**: campaigns, templates, team assignments, pitch pipeline, white-label theme (full), client lifecycle, upsell tracker, churn risk, benchmark, revenue forecast, team performance, pitch analytics, client health trend, revenue tracker setup/overage. All client-side localStorage.
5. **Sentiment column always "—"**: The Portfolio Table (B-2) has a "Sentiment" column that's hardcoded to display "—" — the data isn't fetched for the aggregate view.
6. **WhatsApp Import is only on Surface A**: The actually-mounted Surface B (`/atelier/console/agency`) does not expose the GLM-4 WhatsApp import feature.
7. **Two parallel chat UIs in orphan** (C-1R `HarchIQAgencyWorkspace` and C-13 `HarchIQChatCard`): both hit `/api/console/ask` with `accountType: "agency"`. The only difference is the prompt library size (8 vs 5) and the welcome-message pre-seed (C-13 uses weekly insight). One of them is redundant.
8. **No API for share-of-voice**: The orphan's header (line 78) claims `/api/console/share-of-voice` is consumed, but grep finds no fetch to that endpoint in the file.
9. **Simulated PDF/PPT exports**: Every "Export PDF" / "Export PowerPoint" button in the orphan fires only a toast ("vous recevrez le fichier par email") — no actual file is generated or emailed.
10. **Quota endpoint unused**: `GET /api/agency/quota` exists and works (returns active client's quota + usage), but no UI fetches it — the quota info is already embedded in the `/api/agency/clients` response.

### 10.3 Orphan features (present only in the unmounted 16 898-line file, invisible to users)

All R2-AGENCY-A, R2-AGENCY-B, R3-AGENCY-A, R4-AGENCY-A, and ENV-AGENCY features:
- AgencyTierBadgeCard (3-tier badge with override)
- ClientOnboardingWizard (4-step modal)
- CommissionCalculatorCard (with tier-uplift simulation)
- ClientPortalPreviewCard (agency/client view toggle)
- PitchPipelineCard (kanban)
- TeamWorkloadBalancerCard
- TeamPerformanceDashboardCard
- PitchDeckAnalyticsCard
- WhiteLabelThemeEditorCard (6-field theme editor with live preview)
- ClientHealthScoringCard (5-factor health score with 6-month trend)
- ChurnRiskIndicatorCard (4-factor churn risk with retention campaign)
- RevenueForecastingCard (12-month 3-scenario projection)
- ClientRevenueTrackerCard (per-client MRR + setup + overage + commission + YTD)
- ClientLifecycleCard (5-stage pipeline)
- UpsellOpportunityTrackerCard
- AgencyBenchmarkCard (6-metric radar vs sector median/top 10%)
- PitchTemplateLibraryCard (6 built-in + 3 custom templates with usage analytics)
- MultiClientComparisonCard (5-client side-by-side + radar overlay + saved views)
- HarchIQAgencyWorkspace (8-prompt chat with conversation history)
- ScoreReputationHero (RadialBarChart gauge)
- CampaignTrackerCard (3 derived campaigns + ROI gauges)
- RevenueTrackerCard (commission per client + 6-month trend + top 5 BarChart)
- ClientComparisonCard (3-client side-by-side table)
- HarchIQChatCard (chat with weekly-insight pre-seed)
- RapportsAutomatisesCard (4 stats + recent)
- PitchDeckCard (3 tools inline)
- WhiteLabelCard (3-field save via PATCH)
- TeamAssignationsCard (TanStack Table)
- MatriceAssignationCard (users × clients grid)
- TendanceSentimentCard (ComposedChart 7j/30j/90j)
- DiversiteSourcesCard (horizontal BarChart)
- AlertesCrisisCard (8-alert feed)
- TopSujetsCard (5 topics with sentiment split)
- VisibiliteIaCard (3 LLM cards)
- ActiviteReseauCard (stacked AreaChart)
- BoiteOutilsAgenceCard (4 action cards)

---

## 11. Recommendations (advisory only — no code changes made)

1. **Decide the fate of `AgencyDashboard.tsx` (16 898 lines)**. Either:
   - Wire it up (replace `Dashboard + AgencyConsole` in `/atelier/console/agency/page.tsx`), OR
   - Delete it and update the changelog to remove references to features that don't exist.
   The current state — 43 features referenced in changelog but invisible to users — is the worst of both worlds.
2. **Reconcile the 3-tier system**. Pick one definition (5/20 or 6/50), apply it consistently across all surfaces (live + orphan + pricing FAQ + partners page), and surface the commission % on the live console (currently only the orphan shows it).
3. **Add a `/api/agency/commission` endpoint** that returns the tier + commission % based on client count, so the live console can display the 20/25/30% ladder without client-side fiction.
4. **Move localStorage-only features to backend**: Pitch Pipeline, White-Label Theme Editor, Pitch Templates, Client Health overrides, Churn campaign state, Revenue Tracker overrides, Benchmark overrides. Otherwise users lose all their work on browser cache clear.
5. **Wire the WhatsApp Import feature** into Surface B (the actually-mounted agency console) — it's the B2B2B killer feature and currently only accessible via the older `/atelier/agency` page that agency admins may not discover.
6. **Fix the "Sentiment" column** in B-2 Portfolio Table — either fetch sentiment per client or remove the column.
7. **Implement real PDF/PPT exports** or remove the buttons. Toast-only exports erode trust.
8. **Implement real team assignment persistence** (C-18 MatriceAssignationCard checkbox currently does nothing).
9. **Validate benchmark sources** (ANAE Maurice 2024, Harch NPS Survey Q3 2024, OpenView Partners, PSA Industry Report) — if these studies exist, cite them properly; if not, replace with real benchmark data or remove the source labels.

---

**End of audit.**
