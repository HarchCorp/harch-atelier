// Harch Atelier — shared constants and design tokens
// Used by all atelier pages

export const ATELIER_COLORS = {
  bg: "#FAFAFA",
  surface: "#FFFFFF",
  surfaceAlt: "#F4F4F5",
  border: "#E5E5E5",
  borderLight: "#F0F0F0",
  accent: "#8B9DAF",
  accentDark: "#4A5D6E",
  accentBright: "#B8C8D8",
  sage: "#4A7B5F",
  sageBright: "#6FA386",
  sageBg: "rgba(74,123,95,0.08)",
  sageDim: "#3D6650",
  textPrimary: "#0A0A0A",
  textSecondary: "#525252",
  textMuted: "#71717A",
  textFaint: "rgba(0,0,0,0.40)",
  red: "#A0524B",
  redBg: "rgba(160,82,75,0.08)",
} as const;

// ─── MEGA MENU NAV STRUCTURE (Signal AI style) ─────────────────
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
    label: "Expertise",
    dropdown: {
      title: "Expertise",
      sections: [
        {
          heading: "What we know",
          links: [
            { label: "Enterprise Risk", href: "/atelier/expertise/enterprise-risk", desc: "Identify operational, financial & strategic risks before they materialize" },
            { label: "Reputation Risk", href: "/atelier/expertise/reputation-risk", desc: "Monitor perception shifts that can damage brand value overnight" },
            { label: "PR & Comms", href: "/atelier/expertise/pr-comms", desc: "Augment Comms teams with real-time intelligence & measurement" },
            { label: "ESG", href: "/atelier/expertise/esg", desc: "Track sustainability narratives, greenwashing risks & investor sentiment" },
            { label: "Regulation", href: "/atelier/expertise/regulation", desc: "Stay ahead of regulatory changes across Moroccan & African jurisdictions" },
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
    label: "Approach",
    dropdown: {
      title: "Approach",
      sections: [
        {
          heading: "How we work",
          links: [
            { label: "Our AI", href: "/atelier/approach/our-ai", desc: "Meet HarchIQ — the trainable AI for reputation intelligence" },
            { label: "Our Data", href: "/atelier/approach/our-data", desc: "30+ media sources, 5M+ articles/day, 120+ languages" },
            { label: "Our Commitment", href: "/atelier/approach/our-commitment", desc: "Security, compliance & customer success guarantees" },
          ],
        },
      ],
    },
  },
  {
    label: "Insights",
    dropdown: {
      title: "Insights",
      sections: [
        {
          heading: "Content hub",
          links: [
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
    label: "Company",
    dropdown: {
      title: "Company",
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
  {
    label: "Industry Dashboards",
    dropdown: {
      title: "Industry Dashboards",
      sections: [
        {
          heading: "Live trackers",
          links: [
            { label: "Harch 100", href: "/atelier/harch-100", desc: "Morocco's reputation ranking — Signal AI 500 style" },
            { label: "Risk Tracker", href: "/atelier/risk-tracker", desc: "32 risk categories across 6 industries" },
            { label: "Reputation Tracker", href: "/atelier/reputation-tracker", desc: "Top 100 Moroccan companies ranked by reputation" },
            { label: "Comparison Tool", href: "/atelier/compare", desc: "Compare 2-3 companies side-by-side" },
          ],
        },
      ],
    },
  },
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
    { href: "/atelier/harch-100", label: "Harch 100 Ranking" },
    { href: "/atelier/risk-tracker", label: "Risk Tracker" },
    { href: "/atelier/dashboard", label: "Live Dashboard" },
    { href: "/atelier/templates", label: "Report Templates" },
    { href: "/atelier/templates/institutional-audit", label: "Institutional Audit" },
  ],
  ressources: [
    { href: "/atelier/resources", label: "All resources" },
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
    
    // Pricing
    pricingStarter: "Starter",
    pricingPro: "Pro",
    pricingEnterprise: "Enterprise",
    pricingStarterPrice: "5K",
    pricingProPrice: "15K",
    pricingEnterprisePrice: "50K",
    pricingCurrency: "MAD/mo",
    
    // CTA
    ctaTitle: "Get your free reputation audit",
    ctaSubhead: "5 minutes to fill. 7 days to deliver. No credit card. No commitment.",
    ctaButton: "Get my audit",
    
    // Footer
    footerTagline: "AI Reputation Intelligence for Africa",
    footerCountries: "8 markets covered",
    footerLegal: "Building in Public · Since 2024 · Casablanca, Morocco",
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
    heroCtaPrimary: "Obtenir un audit gratuit",
    heroCtaSecondary: "Voir comment ça marche",
    
    // Sections
    whatWeDo: "Ce qu'on fait",
    howItWorks: "Comment ça marche",
    pricing: "Tarifs",
    faq: "FAQ",
    about: "À propos",
    
    // Features
    featureMedia: "Veille Médias",
    featureMediaDesc: "30+ sources marocaines et africaines suivies 24/7",
    featureAi: "Visibilité IA",
    featureAiDesc: "Ce que ChatGPT, Perplexity, Google AI disent de vous",
    featureSentiment: "Analyse de Sentiment",
    featureSentimentDesc: "Positif, neutre, négatif — par entité, par article",
    featureAlerts: "Alertes Crise",
    featureAlertsDesc: "Alertes WhatsApp quand le sentiment négatif explose",
    
    // Pricing
    pricingStarter: "Starter",
    pricingPro: "Pro",
    pricingEnterprise: "Enterprise",
    pricingStarterPrice: "5K",
    pricingProPrice: "15K",
    pricingEnterprisePrice: "50K",
    pricingCurrency: "MAD/mois",
    
    // CTA
    ctaTitle: "Obtenez votre audit de réputation gratuit",
    ctaSubhead: "5 minutes à remplir. 7 jours pour livrer. Sans CB. Sans engagement.",
    ctaButton: "Obtenir mon audit",
    
    // Footer
    footerTagline: "Intelligence de Réputation IA pour l'Afrique",
    footerCountries: "8 marchés couverts",
    footerLegal: "Building in Public · Depuis 2024 · Casablanca, Maroc",
  },
} as const;
