// Harch Atelier — shared constants and design tokens
// Used by all atelier pages
//
// Source unique de vérité — Design System V2
// Mapping direct vers les classes Tailwind neutral-* / stone-* / emerald-*
// Toute page atelier devrait importer { C } from "./components/tokens" plutôt
// que de répéter des hex custom.

// ─── DESIGN SYSTEM V2 — TOKENS ──────────────────────────────────────
// Toutes les valeurs sont les équivalents hex des classes Tailwind
// obligatoires définies dans HARCH_DESIGN_SYSTEM_V2.md.
// Ne pas éditer ces valeurs sans valider le DS V2.
export const C = {
  // Backgrounds (Tailwind neutral-*)
  bg: "#ffffff",          // bg-white
  bgSubtle: "#fafafa",    // bg-neutral-50
  bgHover: "#f5f5f5",     // bg-neutral-100 (hover on light surfaces)
  bgDark: "#171717",      // bg-neutral-900
  bgDarkest: "#0a0a0a",   // bg-neutral-950

  // Text on light
  text: "#0a0a0a",        // text-neutral-950 (primary)
  textBody: "#525252",    // text-neutral-600 (body)
  textMuted: "#737373",   // text-neutral-500 (muted)

  // Text on dark
  textOnDark: "#ffffff",          // text-white (primary)
  textOnDarkBody: "#a3a3a3",      // text-neutral-400 (secondary)
  textOnDarkMuted: "#737373",     // text-neutral-500 (muted)

  // Borders
  border: "#e5e5e5",        // border-neutral-200 (light)
  borderStrong: "#d4d4d4",  // border-neutral-300 (secondary CTA on light)
  borderDark: "#262626",    // border-neutral-800 (dark)

  // Accents (Atelier = stone-500)
  accent: "#78716c",       // stone-500 (Atelier accent — labels/stats/icons ONLY)
  accentHover: "#57534e",  // stone-600
  accentBright: "#a8a29e", // stone-400

  // CTA (emerald-500 — Harch primary CTA, ALWAYS)
  cta: "#10b981",          // emerald-500
  ctaHover: "#34d399",     // emerald-400

  // Status colors
  warning: "#f59e0b",      // amber-500
  warningBg: "#fffbeb",    // amber-50
  warningBorder: "#fcd34d",// amber-300
  warningText: "#b45309",  // amber-700
  danger: "#ef4444",       // red-500
  dangerBg: "#fef2f2",     // red-50
  success: "#10b981",      // emerald-500
  successBg: "#ecfdf5",    // emerald-50

  // Fonts (FIXES — JAMAIS CHANGER)
  fontSans: "'Inter', system-ui, sans-serif",
  fontMono: "'Space Mono', monospace",

  // Shadows
  shadowSm: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
  shadowMd: "0 4px 6px rgba(0,0,0,0.05), 0 10px 15px rgba(0,0,0,0.05)",
} as const;

// ─── LEGACY COLOR OBJECT (deprecated — use C instead) ────────────────
// Conservé pour compat arrière. Valeurs alignées sur DS V2.
// Ne pas référencer dans le nouveau code.
export const ATELIER_COLORS = {
  bg: C.bgSubtle,
  surface: C.bg,
  surfaceAlt: C.bgSubtle,
  border: C.border,
  borderLight: C.border,
  accent: C.accent,
  accentDark: C.accentHover,
  accentBright: C.accentBright,
  sage: C.accent,        // alias rétro-compatible (sage → stone-500)
  sageBright: C.accentBright,
  sageBg: "rgba(120,113,108,0.08)", // stone-500 @ 8%
  sageDim: C.accentHover,
  textPrimary: C.text,
  textSecondary: C.textBody,
  textMuted: C.textMuted,
  textFaint: "rgba(0,0,0,0.40)",
  red: C.danger,
  redBg: C.dangerBg,
} as const;

// ─── MEGA MENU NAV STRUCTURE (Signal AI style) ─────────────────────
// Each top-level item can have a dropdown with grouped sections

export interface NavItem {
  label: string;
  href?: string;
  dropdown?: {
    title: string;
    sections: {
      heading: string;
      links: { label: string; href: string; desc?: string }[];
    }[];
  };
}

export const ATELIER_NAV_LINKS: NavItem[] = [
  {
    label: "Plateforme",
    dropdown: {
      title: "Plateforme",
      sections: [
        {
          heading: "Plans",
          links: [
            { label: "Essentiel", href: "/atelier/pricing#essential", desc: "Pour vous lancer dans la veille" },
            { label: "Pro", href: "/atelier/pricing#pro", desc: "Pour les marques en croissance" },
            { label: "Grandes Entreprises", href: "/atelier/pricing#enterprise", desc: "Pour les leaders internationaux" },
            { label: "Agences", href: "/atelier/pricing#agency", desc: "Pour les multi-clients" },
          ],
        },
        {
          heading: "Outils",
          links: [
            { label: "Harch 100", href: "/atelier/harch-100", desc: "Classement des 100 entreprises marocaines" },
            { label: "Registre des Crises", href: "/atelier/registry", desc: "8 crises réputationnelles marocaines" },
            { label: "Rétro-audit", href: "/atelier/retro-audit", desc: "48h avant le pic médiatique" },
            { label: "Comparateur", href: "/atelier/compare", desc: "Comparez les entreprises côte à côte" },
          ],
        },
      ],
    },
  },
  {
    label: "Solutions",
    dropdown: {
      title: "Solutions",
      sections: [
        {
          heading: "Platform",
          links: [
            { label: "Enterprise Risk Intelligence", href: "/atelier/products/enterprise-risk-intelligence", desc: "Anticipate. Protect. Act. — 32 risk categories, real-time alerts" },
            { label: "Reputation Dashboards", href: "/atelier/products/reputation-dashboards", desc: "AI-powered brand health, scoring, materiality matrix" },
            { label: "API & MCP", href: "/atelier/products/api-mcp", desc: "Integrate Harch data into your BI & AI agents" },
          ],
        },
        {
          heading: "Insight Reports",
          links: [
            { label: "★ Flagship Report 2026", href: "/atelier/flagship-report", desc: "The biggest report — 8 companies, 20 people, 1-year analysis" },
            { label: "Risk Reports", href: "/atelier/insight-reports/risk", desc: "32-category risk assessment + mitigation plan" },
            { label: "Reputation Risk Reports", href: "/atelier/insight-reports/reputation-risk", desc: "Reputation exposure analysis & narrative detection" },
            { label: "Reputation Reports", href: "/atelier/insight-reports/reputation", desc: "Full reputation audit with score & pillars" },
            { label: "Media Impact Reports", href: "/atelier/insight-reports/media-impact", desc: "PR campaign measurement & share of voice" },
            { label: "Deep Dive Reports", href: "/atelier/insight-reports/deep-dive", desc: "Bespoke research on any topic, competitor, or market" },
          ],
        },
        {
          heading: "More",
          links: [
            { label: "Ask HarchIQ", href: "/atelier/ask-harchiq", desc: "Conversational AI for instant reputation intelligence" },
            { label: "Advanced Dashboards", href: "/atelier/products/reputation-dashboards", desc: "Drag-and-drop visualization builder" },
            { label: "Newsletters & Briefings", href: "/atelier/products", desc: "Daily WhatsApp + weekly exec + monthly board" },
          ],
        },
      ],
    },
  },
  {
    label: "Expertise",
    dropdown: {
      title: "Expertise",
      sections: [
        {
          heading: "How we work",
          links: [
            { label: "Our AI", href: "/atelier/approach/our-ai", desc: "Meet HarchIQ — the trainable AI for reputation intelligence" },
            { label: "Our Data", href: "/atelier/approach/our-data", desc: "30+ media sources, 5M+ articles/day, 120+ languages" },
            { label: "Our Commitment", href: "/atelier/approach/our-commitment", desc: "Security, compliance & customer success guarantees" },
            { label: "Resilience Matrix", href: "/atelier/resilience", desc: "100 stress-cases the system handles — interactive live demos" },
          ],
        },
      ],
    },
  },
  {
    label: "Ressources",
    dropdown: {
      title: "Ressources",
      sections: [
        {
          heading: "Content hub",
          links: [
            { label: "★ Flagship Report 2026", href: "/atelier/flagship-report", desc: "8 companies · 20 people · 1,858 articles · 365-day analysis" },
            { label: "All Insights", href: "/atelier/insights", desc: "Whitepapers, reports, case studies, methodology" },
            { label: "Blog", href: "/atelier/blog", desc: "15+ articles on Moroccan & African reputation intelligence" },
            { label: "Live News Feed", href: "/atelier/news", desc: "Real-time media monitoring with filters" },
            { label: "2026 Media Report", href: "/atelier/media-intelligence", desc: "61,218 articles analyzed" },
          ],
        },
        {
          heading: "Industry profiles",
          links: [
            { label: "Banking", href: "/atelier/industries/banking", desc: "8 banks, 1,842 data points" },
            { label: "Telecommunications", href: "/atelier/industries/telecom", desc: "3 telcos, 5G rollout tracking" },
            { label: "Mining & Phosphates", href: "/atelier/industries/mining", desc: "OCP, Managem, ESG leadership" },
            { label: "Aviation", href: "/atelier/industries/aviation", desc: "Royal Air Maroc, oneworld alliance" },
            { label: "Retail", href: "/atelier/industries/retail", desc: "Marjane, Label'Vie, boycott risks" },
            { label: "Energy", href: "/atelier/industries/energy", desc: "Total, Nareva, energy transition" },
          ],
        },
        {
          heading: "Company profiles",
          links: [
            { label: "OCP Group", href: "/atelier/companies/ocp-group", desc: "Score 91 · #1 in Harch 100" },
            { label: "Attijariwafa Bank", href: "/atelier/companies/attijariwafa-bank", desc: "Score 84 · #2 · Banking leader" },
            { label: "Maroc Telecom", href: "/atelier/companies/maroc-telecom", desc: "Score 79 · #3 · Telco leader" },
            { label: "Royal Air Maroc", href: "/atelier/companies/royal-air-maroc", desc: "Score 76 · #4 · Aviation" },
            { label: "Bank of Africa", href: "/atelier/companies/bank-of-africa", desc: "Score 72 · #6 · Pan-African expansion" },
          ],
        },
      ],
    },
  },
  {
    label: "Entreprise",
    dropdown: {
      title: "Entreprise",
      sections: [
        {
          heading: "About Harch",
          links: [
            { label: "About", href: "/atelier/about", desc: "Our mission, team & story" },
            { label: "Partnerships", href: "/atelier/partners", desc: "Agencies, tech partners, strategic allies, referrals" },
            { label: "Careers", href: "/atelier/careers", desc: "Join the team — 8 open roles" },
            { label: "Contact", href: "/atelier/contact", desc: "Sales, support, security, press" },
          ],
        },
      ],
    },
  },
  // REMOVED: "Industry Dashboards", "Lab", "Registre" as top-level nav items
  // These are now accessible via the "Ressources" dropdown and internal links
  // Harch 100 → moved to Plateforme dropdown
  // Lab → accessible via footer + direct URL
  // Registry → accessible via footer + direct URL
];

export const ATELIER_FOOTER_LINKS = {
  navigation: [
    { href: "/atelier/products", label: "Products" },
    { href: "/atelier/solutions", label: "Solutions" },
    { href: "/atelier/decision-augmentation", label: "Decision Augmentation" },
    { href: "/atelier/pricing", label: "Pricing" },
    { href: "/atelier/audit", label: "Request demo" },
    { href: "/atelier/about", label: "About" },
  ],
  produits: [
    { href: "/atelier/products", label: "Reputation Intelligence Platform" },
    { href: "/atelier/products", label: "API & MCP Integrations" },
    { href: "/atelier/products", label: "Insight Reports" },
    { href: "/atelier/products", label: "Advanced Dashboards" },
    { href: "/atelier/products", label: "Newsletters & Briefings" },
  ],
  outils: [
    { href: "/atelier/flagship-report", label: "★ Flagship Report 2026" },
    { href: "/atelier/harch-100", label: "Harch 100 Ranking" },
    { href: "/atelier/risk-tracker", label: "Risk Tracker" },
    { href: "/atelier/console", label: "Console" },
    { href: "/atelier/templates", label: "Report Templates" },
    { href: "/atelier/templates/institutional-audit", label: "Institutional Audit" },
  ],
  ressources: [
    { href: "/atelier/resources", label: "All resources" },
    { href: "/atelier/flagship-report", label: "Flagship Report 2026" },
    { href: "/atelier/media-intelligence", label: "2026 Media Report" },
    { href: "/atelier/customers", label: "Case studies" },
    { href: "/atelier/method", label: "Methodology" },
    { href: "/atelier/faq", label: "FAQ" },
  ],
  entreprise: [
    { href: "/atelier/about", label: "About us" },
    { href: "/atelier/careers", label: "Careers" },
    { href: "/atelier/partners", label: "Partners" },
    { href: "/atelier/contact", label: "Contact" },
    { href: "/atelier/trust", label: "Trust Center" },
    { href: "/atelier/resilience", label: "Resilience Matrix" },
    { href: "/atelier/legal", label: "Legal" },
  ],
};

export const ATELIER_COUNTRIES = [
  { code: "FR", name: "France", cities: "Paris · Lyon · Marseille" },
  { code: "MA", name: "Morocco", cities: "Casablanca · Rabat · Marrakech" },
  { code: "BE", name: "Belgium", cities: "Brussels · Antwerp" },
  { code: "CH", name: "Switzerland", cities: "Geneva · Lausanne · Zurich" },
  { code: "QC", name: "Quebec", cities: "Montreal · Quebec City" },
  { code: "TN", name: "Tunisia", cities: "Tunis · Sfax" },
  { code: "LB", name: "Lebanon", cities: "Beirut" },
  { code: "SN", name: "Senegal", cities: "Dakar" },
];

export const ATELIER_ENGINES = [
  "ChatGPT", "Perplexity", "Google AI Overviews", "Gemini",
  "Claude", "Copilot", "Mistral", "Grok"
];

// i18n strings — FR and EN
export const I18N = {
  en: {
    // Nav
    navPlatform: "Platform",
    navHowItWorks: "How it works",
    navIndustries: "Industries",
    navPricing: "Pricing",
    navFaq: "FAQ",
    navAbout: "About",
    navCta: "Get started",

    // Hero
    heroEyebrow: "AI Reputation Intelligence",
    heroTitle: "What does the world say about you?",
    heroSubhead: "We monitor 30+ media sources and 4 AI engines 24/7. You get sentiment analysis, crisis alerts on WhatsApp, and a monthly board-ready PDF. No engineers needed.",
    heroCtaPrimary: "Get your free audit",
    heroCtaSecondary: "See how it works",

    // Sections
    whatWeDo: "What we do",
    howItWorks: "How it works",
    pricing: "Pricing",
    faq: "FAQ",
    about: "About",

    // Features
    featureMedia: "Media Monitoring",
    featureMediaDesc: "30+ Moroccan and African media sources tracked 24/7",
    featureAi: "AI Visibility",
    featureAiDesc: "What ChatGPT, Perplexity, Google AI say about you",
    featureSentiment: "Sentiment Analysis",
    featureSentimentDesc: "Positive, neutral, negative — per entity, per article",
    featureAlerts: "Crisis Alerts",
    featureAlertsDesc: "WhatsApp alerts when negative sentiment spikes",

    // Pricing — Corporate & Sovereign grade (renamed Q3 2026)
    pricingEmergence: "Émergence",
    pricingCorporate: "Corporate",
    pricingSovereign: "Sovereign",
    pricingEmergencePrice: "15K",
    pricingCorporatePrice: "40K",
    pricingSovereignPrice: "75K",
    pricingCurrency: "MAD/mo",

    // CTA
    ctaTitle: "Get your free reputation audit",
    ctaSubhead: "5 minutes to fill. 7 days to deliver. No credit card. No commitment.",
    ctaButton: "Get my audit",

    // Footer
    footerTagline: "AI Reputation Intelligence for Africa",
    footerCountries: "8 markets covered",
    footerLegal: "Building in Public · Since 2026 · Casablanca, Morocco",
  },
  fr: {
    // Nav
    navPlatform: "Plateforme",
    navHowItWorks: "Méthode",
    navIndustries: "Secteurs",
    navPricing: "Tarifs",
    navFaq: "FAQ",
    navAbout: "À propos",
    navCta: "Démarrer",

    // Hero
    heroEyebrow: "Intelligence de Réputation IA",
    heroTitle: "Que dit le monde de vous ?",
    heroSubhead: "On surveille 30+ sources médias et 4 moteurs IA 24/7. Vous recevez l'analyse de sentiment, les alertes crise sur WhatsApp, et un PDF mensuel board-ready. Aucun ingénieur requis.",
    heroCtaPrimary: "Get a free audit",
    heroCtaSecondary: "Voir comment ça marche",

    // Sections
    whatWeDo: "Ce qu'on fait",
    howItWorks: "Comment ça marche",
    pricing: "Tarifs",
    faq: "FAQ",
    about: "À propos",

    // Features
    featureMedia: "Media Monitoring",
    featureMediaDesc: "30+ sources marocaines et africaines suivies 24/7",
    featureAi: "Visibilité IA",
    featureAiDesc: "Ce que ChatGPT, Perplexity, Google AI disent de vous",
    featureSentiment: "Analyse de Sentiment",
    featureSentimentDesc: "Positif, neutre, négatif — par entité, par article",
    featureAlerts: "Crisis Alerts",
    featureAlertsDesc: "WhatsApp alerts when negative sentiment spikes",

    // Pricing — Corporate & Sovereign grade (renamed Q3 2026)
    pricingEmergence: "Émergence",
    pricingCorporate: "Corporate",
    pricingSovereign: "Sovereign",
    pricingEmergencePrice: "15K",
    pricingCorporatePrice: "40K",
    pricingSovereignPrice: "75K",
    pricingCurrency: "MAD/month",

    // CTA
    ctaTitle: "Get your free reputation audit",
    ctaSubhead: "5 minutes to fill. 7 days to deliver. No credit card. No commitment.",
    ctaButton: "Get my audit",

    // Footer
    footerTagline: "Intelligence de Réputation IA pour l'Afrique",
    footerCountries: "8 marchés couverts",
    footerLegal: "Building in Public · Depuis 2026 · Casablanca, Maroc",
  },
} as const;
