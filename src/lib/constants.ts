// ═══════════════════════════════════════════════════════════════
//  CONSTANTS & ENUMS — Platform-wide constants
//
//  All hardcoded values, enums, mappings, and configuration
//  constants used across the Harch Atelier platform.
// ═══════════════════════════════════════════════════════════════

// ─── PLATFORM CONSTANTS ────────────────────────────────────────

export const PLATFORM_NAME = "Harch Atelier";
export const PLATFORM_VERSION = "1.0.0";
export const PLATFORM_TAGLINE = "AI Reputation Intelligence for Africa";
export const PLATFORM_DOMAIN = "atelier.harchcorp.com";
export const PLATFORM_URL = "https://atelier.harchcorp.com";
export const PLATFORM_EMAIL = "atelier@harchcorp.com";
export const PLATFORM_PHONE = "+212 684 440 682";
export const PLATFORM_TIMEZONE = "Africa/Casablanca";
export const PLATFORM_CURRENCY = "MAD";
export const PLATFORM_LOCALE = "fr-MA";

// ─── SOCIAL MEDIA ──────────────────────────────────────────────

export const SOCIAL_LINKS = {
  linkedin: "https://www.linkedin.com/company/harch-atelier",
  twitter: "https://twitter.com/harchatelier",
  github: "https://github.com/HarchCorp/harch-atelier",
  youtube: "https://www.youtube.com/@harchatelier",
} as const;

// ─── NAVIGATION ────────────────────────────────────────────────

export const NAV_STRUCTURE = {
  main: ["Expertise", "Solutions", "Approach", "Insights", "Company", "Industry Dashboards"],
  expertise: [
    { label: "PR & Comms", href: "/atelier/expertise/pr-comms", desc: "Media monitoring + reputation tracking" },
    { label: "Reputation Risk", href: "/atelier/expertise/reputation-risk", desc: "32-category risk framework" },
    { label: "Enterprise Risk", href: "/atelier/expertise/enterprise-risk", desc: "Pan-African risk intelligence" },
    { label: "ESG", href: "/atelier/expertise/esg", desc: "Environmental, Social, Governance monitoring" },
    { label: "Regulation", href: "/atelier/expertise/regulation", desc: "AMMC, BAM, BVC regulatory intelligence" },
  ],
  solutions: [
    { label: "Reputation Intelligence Platform", href: "/atelier/products", desc: "AI-powered brand health dashboard" },
    { label: "API & MCP Integrations", href: "/atelier/products/api-mcp", desc: "Integrate Harch data into your BI" },
    { label: "Insight Reports", href: "/atelier/insight-reports", desc: "PDF + executive deck + workshop" },
    { label: "Advanced Dashboards", href: "/atelier/products/reputation-dashboards", desc: "Drag-and-drop visualization builder" },
    { label: "Newsletters & Briefings", href: "/atelier/products", desc: "Daily WhatsApp + weekly exec + monthly board" },
  ],
  reports: [
    { label: "Flagship Report 2026", href: "/atelier/flagship-report", desc: "8 companies · 20 people · 1,858 articles · 365-day analysis", featured: true },
    { label: "Risk Reports", href: "/atelier/insight-reports/risk", desc: "32-category risk assessment + mitigation plan" },
    { label: "Reputation Risk Reports", href: "/atelier/insight-reports/reputation-risk", desc: "Reputation exposure analysis" },
    { label: "Reputation Reports", href: "/atelier/insight-reports/reputation", desc: "Full reputation audit with score & pillars" },
    { label: "Media Impact Reports", href: "/atelier/insight-reports/media-impact", desc: "PR campaign measurement & share of voice" },
    { label: "Deep Dive Reports", href: "/atelier/insight-reports/deep-dive", desc: "Bespoke research on any topic" },
  ],
  insights: [
    { label: "Flagship Report 2026", href: "/atelier/flagship-report", desc: "8 companies · 20 people · 1,858 articles · 365-day analysis", featured: true },
    { label: "All Insights", href: "/atelier/insights", desc: "Whitepapers, reports, case studies" },
    { label: "Blog", href: "/atelier/blog", desc: "15+ articles on Moroccan & African reputation" },
    { label: "Live News Feed", href: "/atelier/news", desc: "Real-time media monitoring with filters" },
    { label: "2026 Media Report", href: "/atelier/media-intelligence", desc: "61,218 articles analyzed" },
    { label: "Harch 100", href: "/atelier/harch-100", desc: "Morocco's reputation ranking" },
  ],
  industries: [
    { label: "Banking", href: "/atelier/industries/banking", desc: "8 banks, 1,842 data points" },
    { label: "Telecommunications", href: "/atelier/industries/telecom", desc: "3 telcos, 5G rollout tracking" },
    { label: "Mining & Phosphates", href: "/atelier/industries/mining", desc: "OCP, Managem, ESG leadership" },
    { label: "Aviation", href: "/atelier/industries/aviation", desc: "Royal Air Maroc, oneworld alliance" },
    { label: "Retail", href: "/atelier/industries/retail", desc: "Marjane, Label'Vie, boycott risks" },
    { label: "Energy", href: "/atelier/industries/energy", desc: "Total, Nareva, energy transition" },
  ],
  companies: [
    { label: "OCP Group", href: "/atelier/companies/ocp-group", desc: "Score 91 · #1 in Harch 100" },
    { label: "Attijariwafa Bank", href: "/atelier/companies/attijariwafa-bank", desc: "Score 84 · #2 · Banking leader" },
    { label: "Maroc Telecom", href: "/atelier/companies/maroc-telecom", desc: "Score 79 · #3 · Telco leader" },
    { label: "Royal Air Maroc", href: "/atelier/companies/royal-air-maroc", desc: "Score 76 · #4 · Aviation" },
    { label: "Bank of Africa", href: "/atelier/companies/bank-of-africa", desc: "Score 72 · #6 · Pan-African expansion" },
  ],
  approach: [
    { label: "Our AI", href: "/atelier/approach/our-ai", desc: "Meet HarchIQ — trainable AI for reputation" },
    { label: "Our Data", href: "/atelier/approach/our-data", desc: "30+ media sources, 5M+ articles/day" },
    { label: "Our Commitment", href: "/atelier/approach/our-commitment", desc: "Security, compliance & customer success" },
  ],
  company: [
    { label: "About", href: "/atelier/about", desc: "Harch Atelier story and team" },
    { label: "Customers", href: "/atelier/customers", desc: "Case studies and testimonials" },
    { label: "Partners", href: "/atelier/partners", desc: "Strategic partnerships" },
    { label: "Careers", href: "/atelier/careers", desc: "Join the team" },
    { label: "Contact", href: "/atelier/contact", desc: "Get in touch" },
    { label: "Pricing", href: "/atelier/pricing", desc: "15K-75K MAD/month" },
    { label: "Audit", href: "/atelier/audit", desc: "Request a demo" },
    { label: "News", href: "/atelier/news", desc: "Latest updates" },
    { label: "Blog", href: "/atelier/blog", desc: "Articles and insights" },
    { label: "Resources", href: "/atelier/resources", desc: "Documentation and guides" },
    { label: "Method", href: "/atelier/method", desc: "Our methodology" },
    { label: "Trust", href: "/atelier/trust", desc: "Security and compliance" },
    { label: "Security", href: "/atelier/security", desc: "Security overview" },
    { label: "Legal", href: "/atelier/legal", desc: "Legal information" },
    { label: "FAQ", href: "/atelier/faq", desc: "Frequently asked questions" },
    { label: "Access", href: "/atelier/access", desc: "Request access" },
    { label: "Console", href: "/atelier/console", desc: "Dashboard login" },
    { label: "Login", href: "/atelier/login", desc: "Sign in" },
    { label: "Demo", href: "/atelier/demo", desc: "Executive demo" },
    { label: "Changelog", href: "/atelier/changelog", desc: "Product updates" },
    { label: "API Docs", href: "/atelier/api-docs", desc: "Developer documentation" },
    { label: "Intelligence", href: "/atelier/intelligence", desc: "Intelligence overview" },
    { label: "Compare", href: "/atelier/compare", desc: "Compare companies" },
    { label: "Templates", href: "/atelier/templates", desc: "Report templates" },
    { label: "Risk Tracker", href: "/atelier/risk-tracker", desc: "Risk monitoring" },
    { label: "Reputation Tracker", href: "/atelier/reputation-tracker", desc: "Reputation monitoring" },
    { label: "Decision Augmentation", href: "/atelier/decision-augmentation", desc: "AI-powered decision support" },
    { label: "Onboarding", href: "/atelier/onboarding", desc: "Get started" },
    { label: "Ask HarchIQ", href: "/atelier/ask-harchiq", desc: "Conversational AI assistant" },
    { label: "Glossary", href: "/atelier/glossary", desc: "Terms and definitions" },
    { label: "Insight Reports", href: "/atelier/insight-reports", desc: "All reports" },
    { label: "Deep Dive", href: "/atelier/insight-reports/deep-dive", desc: "Bespoke research" },
    { label: "Media Impact", href: "/atelier/insight-reports/media-impact", desc: "PR campaign measurement" },
    { label: "Reputation", href: "/atelier/insight-reports/reputation", desc: "Reputation audit" },
    { label: "Reputation Risk", href: "/atelier/insight-reports/reputation-risk", desc: "Reputation risk analysis" },
    { label: "Risk", href: "/atelier/insight-reports/risk", desc: "Risk assessment" },
    { label: "Institutional Audit", href: "/atelier/templates/institutional-audit", desc: "Institutional audit template" },
    { label: "Request Access", href: "/atelier/request-access", desc: "Request platform access" },
    { label: "Admin", href: "/atelier/admin", desc: "Admin dashboard" },
  ],
} as const;

// ─── ACCOUNT TYPES ─────────────────────────────────────────────

export const ACCOUNT_TYPES = [
  {
    id: "brand-monitor",
    name: "Brand Monitor",
    nameFr: "Veille de Marque",
    persona: "Dircom / PR Manager",
    tagline: "The Calm Shield",
    color: "#4A7B5F",
    bgColor: "#F0F7F4",
    sections: ["Weather", "Signals", "Sentiment", "AI Visibility", "Influencers", "Reports"],
    description: "Your reputation, monitored 24/7",
    icon: "shield",
  },
  {
    id: "market-competitor",
    name: "Competitor Intel",
    nameFr: "Intelligence Concurrentielle",
    persona: "CMO / Strategy Director",
    tagline: "The Predator Radar",
    color: "#856914",
    bgColor: "#FAF6F0",
    sections: ["Battlefield", "Intel", "Weapons", "Campaigns", "Bad Buzz"],
    description: "Know your rivals' every move",
    icon: "radar",
  },
  {
    id: "investment-bank",
    name: "Investor Desk",
    nameFr: "Desk Investisseur",
    persona: "CRO / Investment Committee",
    tagline: "The Forensic Terminal",
    color: "#0369A1",
    bgColor: "#F0F6FA",
    sections: ["Screening", "Dossiers", "Compliance", "Risk Map", "Red Flags"],
    description: "Due diligence, certified",
    icon: "terminal",
  },
  {
    id: "harch-alpha",
    name: "Alpha Desk",
    nameFr: "Desk Trading",
    persona: "Trader / Portfolio Manager",
    tagline: "The Quant Cockpit",
    color: "#7C3AED",
    bgColor: "#F6F0FA",
    sections: ["Pulse", "Signal", "Depth", "Alerts", "Positions"],
    description: "Be first. Be fast. Be right.",
    icon: "cockpit",
  },
] as const;

// ─── MOROCCAN SECTORS ──────────────────────────────────────────

export const SECTORS = [
  "Banking",
  "Telecommunications",
  "Mining & Phosphates",
  "Construction Materials",
  "Consumer Goods",
  "Aviation",
  "Retail",
  "Energy",
  "Insurance",
  "Real Estate",
  "Transportation",
  "Agriculture",
  "Pharmaceuticals",
  "Textiles",
  "Automotive",
  "Aerospace",
  "Electronics",
  "Tourism",
  "Media",
  "Technology",
] as const;

// ─── BVC TICKERS ───────────────────────────────────────────────

export const BVC_TICKERS_FULL = [
  { ticker: "OCP", name: "OCP Group", sector: "Mining & Phosphates", base: 850, volatility: 0.02 },
  { ticker: "IAM", name: "Maroc Telecom", sector: "Telecommunications", base: 92, volatility: 0.015 },
  { ticker: "ATW", name: "Attijariwafa Bank", sector: "Banking", base: 540, volatility: 0.025 },
  { ticker: "BAO", name: "Bank of Africa", sector: "Banking", base: 262, volatility: 0.03 },
  { ticker: "BCP", name: "Banque Centrale Populaire", sector: "Banking", base: 180, volatility: 0.02 },
  { ticker: "CIH", name: "CIH Bank", sector: "Banking", base: 280, volatility: 0.03 },
  { ticker: "CFG", name: "CFG Bank", sector: "Banking", base: 220, volatility: 0.025 },
  { ticker: "LAS", name: "LesieurCristal", sector: "Consumer Goods", base: 95, volatility: 0.02 },
  { ticker: "CSU", name: "Cosumar", sector: "Consumer Goods", base: 180, volatility: 0.02 },
  { ticker: "MNG", name: "Managem", sector: "Mining & Phosphates", base: 70, volatility: 0.035 },
  { ticker: "LHM", name: "LafargeHolcim Maroc", sector: "Construction Materials", base: 1200, volatility: 0.015 },
  { ticker: "WAA", name: "Wafacash", sector: "Financial Services", base: 240, volatility: 0.02 },
  { ticker: "DHO", name: "Diacap", sector: "Financial Services", base: 120, volatility: 0.025 },
] as const;

// ─── MOROCCAN CITIES ───────────────────────────────────────────

export const MOROCCAN_CITIES_FULL = [
  { name: "Casablanca", region: "Casablanca-Settat", lat: 33.5731, lng: -7.5898, population: 3359818 },
  { name: "Rabat", region: "Rabat-Salé-Kénitra", lat: 34.0209, lng: -6.8416, population: 577827 },
  { name: "Marrakech", region: "Marrakech-Safi", lat: 31.6295, lng: -7.9811, population: 928850 },
  { name: "Fès", region: "Fès-Meknès", lat: 34.0181, lng: -5.0078, population: 1112072 },
  { name: "Tanger", region: "Tanger-Tétouan-Al Hoceïma", lat: 35.7595, lng: -5.8340, population: 947952 },
  { name: "Agadir", region: "Souss-Massa", lat: 30.4278, lng: -9.5981, population: 421844 },
  { name: "Meknès", region: "Fès-Meknès", lat: 33.8935, lng: -5.5473, population: 632079 },
  { name: "Oujda", region: "Oriental", lat: 34.6814, lng: -1.9086, population: 494252 },
  { name: "Kénitra", region: "Rabat-Salé-Kénitra", lat: 34.2610, lng: -6.5802, population: 431282 },
  { name: "Tétouan", region: "Tanger-Tétouan-Al Hoceïma", lat: 35.5889, lng: -5.3626, population: 380757 },
  { name: "Safi", region: "Marrakech-Safi", lat: 32.2994, lng: -9.2372, population: 308596 },
  { name: "Mohammedia", region: "Casablanca-Settat", lat: 33.6867, lng: -7.3926, population: 208476 },
  { name: "Khouribga", region: "Béni Mellal-Khénifra", lat: 32.9053, lng: -6.9067, population: 196006 },
  { name: "El Jadida", region: "Casablanca-Settat", lat: 33.2316, lng: -8.5007, population: 194580 },
  { name: "Beni Mellal", region: "Béni Mellal-Khénifra", lat: 32.3373, lng: -6.3498, population: 192832 },
  { name: "Nador", region: "Oriental", lat: 35.1681, lng: -2.9330, population: 161726 },
  { name: "Taza", region: "Fès-Meknès", lat: 34.2130, lng: -4.0100, population: 148166 },
  { name: "Settat", region: "Casablanca-Settat", lat: 33.0010, lng: -7.6170, population: 142784 },
  { name: "Berrechid", region: "Casablanca-Settat", lat: 33.2650, lng: -7.5860, population: 136000 },
  { name: "Khemisset", region: "Rabat-Salé-Kénitra", lat: 33.8240, lng: -6.0650, population: 131000 },
  { name: "Larache", region: "Tanger-Tétouan-Al Hoceïma", lat: 35.1930, lng: -6.0570, population: 125000 },
  { name: "Guelmim", region: "Guelmim-Oued Noun", lat: 28.9870, lng: -10.0570, population: 118000 },
  { name: "Laâyoune", region: "Laâyoune-Sakia El Hamra", lat: 27.1250, lng: -13.1620, population: 217000 },
  { name: "Dakhla", region: "Dakhla-Oued Ed-Dahab", lat: 23.6840, lng: -15.9580, population: 106000 },
  { name: "Essaouira", region: "Marrakech-Safi", lat: 31.5125, lng: -9.7700, population: 78000 },
  { name: "Ouarzazate", region: "Drâa-Tafilalet", lat: 30.9180, lng: -6.8930, population: 71000 },
  { name: "Errachidia", region: "Drâa-Tafilalet", lat: 31.9310, lng: -4.4240, population: 95000 },
  { name: "Oued Zem", region: "Béni Mellal-Khénifra", lat: 32.8630, lng: -6.5730, population: 95000 },
  { name: "Sidi Slimane", region: "Rabat-Salé-Kénitra", lat: 34.2650, lng: -5.9260, population: 92000 },
  { name: "Sidi Kacem", region: "Rabat-Salé-Kénitra", lat: 34.2210, lng: -5.7080, population: 83000 },
  { name: "Ifrane", region: "Fès-Meknès", lat: 33.5228, lng: -5.1106, population: 73000 },
  { name: "Chefchaouen", region: "Tanger-Tétouan-Al Hoceïma", lat: 35.1715, lng: -5.2696, population: 43000 },
] as const;

// ─── AI ENGINES ────────────────────────────────────────────────

export const AI_ENGINES_FULL = [
  { name: "ChatGPT", provider: "OpenAI", model: "gpt-4-turbo", color: "#10A37F", marketShare: 54.5 },
  { name: "Claude", provider: "Anthropic", model: "claude-sonnet-4-20250514", color: "#D4A27F", marketShare: 12.3 },
  { name: "Gemini", provider: "Google", model: "gemini-2.5-flash", color: "#4285F4", marketShare: 8.7 },
  { name: "Perplexity", provider: "Perplexity AI", model: "pplx-70b-online", color: "#20808D", marketShare: 5.2 },
  { name: "Copilot", provider: "Microsoft", model: "gpt-4-turbo", color: "#0078D4", marketShare: 7.8 },
  { name: "Mistral", provider: "Mistral AI", model: "mistral-large-latest", color: "#FF7000", marketShare: 3.1 },
  { name: "Grok", provider: "xAI", model: "grok-beta", color: "#1DA1F2", marketShare: 2.4 },
  { name: "Llama", provider: "Meta", model: "llama-3.2-3b-instruct", color: "#0866FF", marketShare: 6.0 },
] as const;

// ─── DATA SOURCES ──────────────────────────────────────────────

export const DATA_SOURCES = [
  { id: "hespress", name: "Hespress", type: "RSS", language: "ar", category: "General News", url: "https://www.hespress.com" },
  { id: "telquel", name: "TelQuel", type: "RSS", language: "fr", category: "General News", url: "https://telquel.ma" },
  { id: "medias24", name: "Medias24", type: "RSS", language: "fr", category: "Business News", url: "https://www.medias24.com" },
  { id: "leconomiste", name: "L'Economiste", type: "RSS", language: "fr", category: "Business News", url: "https://www.leconomiste.com" },
  { id: "le360", name: "Le360", type: "RSS", language: "fr", category: "General News", url: "https://www.le360.ma" },
  { id: "aujourdhui", name: "Aujourdhui Le Maroc", type: "RSS", language: "fr", category: "General News", url: "https://www.aujourdhui.ma" },
  { id: "lematin", name: "Le Matin", type: "RSS", language: "fr", category: "General News", url: "https://www.lematin.ma" },
  { id: "leseco", name: "LesEco", type: "RSS", language: "fr", category: "Business News", url: "https://www.leseco.ma" },
  { id: "jeuneafrique", name: "Jeune Afrique", type: "RSS", language: "fr", category: "Pan-African News", url: "https://www.jeuneafrique.com" },
  { id: "lavieeco", name: "La Vie Eco", type: "RSS", language: "fr", category: "Business News", url: "https://www.lavieeco.com" },
  { id: "lopinion", name: "L'Opinion", type: "RSS", language: "fr", category: "General News", url: "https://www.lopinion.ma" },
  { id: "albayane", name: "Al Bayane", type: "RSS", language: "fr", category: "General News", url: "https://www.albayane.ma" },
  { id: "barlamane", name: "Barlamane", type: "RSS", language: "fr", category: "General News", url: "https://www.barlamane.com" },
  { id: "moroccoworldnews", name: "Morocco World News", type: "RSS", language: "en", category: "General News", url: "https://www.moroccoworldnews.com" },
  { id: "yabiladi", name: "Yabiladi", type: "RSS", language: "fr", category: "General News", url: "https://www.yabiladi.com" },
  { id: "map", name: "MAP", type: "RSS", language: "fr", category: "State Media", url: "https://www.mapnews.ma" },
  { id: "ammc", name: "AMMC", type: "Regulatory", language: "fr", category: "Regulatory", url: "https://www.ammc.ma" },
  { id: "bam", name: "Bank Al-Maghrib", type: "Regulatory", language: "fr", category: "Regulatory", url: "https://www.bkam.ma" },
  { id: "bvc", name: "BVC", type: "Regulatory", language: "fr", category: "Market", url: "https://www.casablanca-bourse.com" },
] as const;

// ─── SENTIMENT THRESHOLDS ──────────────────────────────────────

export const SENTIMENT_THRESHOLDS = {
  POSITIVE: 0.1,
  NEGATIVE: -0.1,
  CRITICAL: -0.5,
  EXCELLENT: 0.5,
} as const;

export const RISK_THRESHOLDS = {
  LOW: 29,
  MODERATE: 44,
  ELEVATED: 59,
  HIGH: 79,
  CRITICAL: 80,
} as const;

export const REPUTATION_THRESHOLDS = {
  POOR: 40,
  FAIR: 55,
  GOOD: 70,
  EXCELLENT: 85,
  WORLD_CLASS: 90,
} as const;

// ─── COLOR PALETTE ─────────────────────────────────────────────

export const COLORS = {
  // Brand
  sage: "#4A7B5F",
  sageBright: "#6FA386",
  sageLight: "#E8F0EB",
  accent: "#4A5D6E",
  gold: "#856914",
  goldLight: "#FAF6F0",

  // Status
  success: "#059669",
  successLight: "#D1FAE5",
  warning: "#D97706",
  warningLight: "#FEF3C7",
  danger: "#DC2626",
  dangerLight: "#FEE2E2",
  info: "#0369A1",
  infoLight: "#DBEAFE",

  // Neutrals
  black: "#0A0A0A",
  white: "#FFFFFF",
  gray50: "#FAFAFA",
  gray100: "#F4F4F5",
  gray200: "#E5E5E5",
  gray300: "#D4D4D8",
  gray400: "#A1A1AA",
  gray500: "#71717A",
  gray600: "#52525B",
  gray700: "#3F3F46",
  gray800: "#27272A",
  gray900: "#18181B",

  // Text
  text: "#0A0A0A",
  textSecondary: "#525252",
  textMuted: "#71717A",
  textFaint: "#A1A1AA",
  textOnDark: "#FAFAFA",
  textOnDarkMuted: "#A3A3A3",

  // Surfaces
  bg: "#FAFAFA",
  surface: "#FFFFFF",
  surfaceAlt: "#F4F4F5",
  border: "#E5E5E5",
  borderLight: "#F0F0F0",

  // Dark mode
  darkBg: "#0A0A0A",
  darkSurface: "#171717",
  darkSurfaceAlt: "#1F1F1F",
  darkBorder: "#262626",
} as const;

// ─── TYPOGRAPHY ────────────────────────────────────────────────

export const FONTS = {
  sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace",
  serif: "'Georgia', 'Times New Roman', serif",
} as const;

export const FONT_SIZES = {
  xs: "10px",
  sm: "12px",
  base: "14px",
  md: "15px",
  lg: "17px",
  xl: "20px",
  "2xl": "24px",
  "3xl": "28px",
  "4xl": "32px",
  "5xl": "40px",
  "6xl": "48px",
  "7xl": "56px",
  "8xl": "64px",
} as const;

export const FONT_WEIGHTS = {
  thin: 100,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
} as const;

// ─── SPACING ───────────────────────────────────────────────────

export const SPACING_SCALE = {
  0: "0px",
  px: "1px",
  0.5: "2px",
  1: "4px",
  1.5: "6px",
  2: "8px",
  2.5: "10px",
  3: "12px",
  3.5: "14px",
  4: "16px",
  5: "20px",
  6: "24px",
  7: "28px",
  8: "32px",
  9: "36px",
  10: "40px",
  12: "48px",
  14: "56px",
  16: "64px",
  20: "80px",
  24: "96px",
  28: "112px",
  32: "128px",
} as const;

// ─── BORDER RADIUS ─────────────────────────────────────────────

export const BORDER_RADIUS = {
  none: "0px",
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  "2xl": "24px",
  "3xl": "32px",
  full: "9999px",
} as const;

// ─── SHADOWS ───────────────────────────────────────────────────

export const SHADOWS = {
  none: "none",
  sm: "0 1px 2px 0 rgba(0,0,0,0.05)",
  md: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
  lg: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
  xl: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
  "2xl": "0 25px 50px -12px rgba(0,0,0,0.25)",
  inner: "inset 0 2px 4px 0 rgba(0,0,0,0.06)",
} as const;

// ─── Z-INDEX ───────────────────────────────────────────────────

export const Z_INDEX_SCALE = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  backdrop: 1040,
  modal: 1050,
  drawer: 1060,
  popover: 1070,
  tooltip: 1080,
  toast: 1090,
  commandPalette: 1100,
  notification: 1110,
  max: 9999,
} as const;

// ─── ANIMATIONS ────────────────────────────────────────────────

export const ANIMATION_DURATIONS = {
  instant: "0ms",
  fast: "150ms",
  normal: "300ms",
  slow: "500ms",
  slower: "750ms",
  slowest: "1000ms",
} as const;

export const ANIMATION_EASINGS = {
  linear: "linear",
  ease: "ease",
  easeIn: "ease-in",
  easeOut: "ease-out",
  easeInOut: "ease-in-out",
  bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
} as const;

// ─── BREAKPOINTS ───────────────────────────────────────────────

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

// ─── API ENDPOINTS ─────────────────────────────────────────────

export const API_ENDPOINTS = {
  // Companies
  companies: "/api/companies",
  company: (slug: string) => `/api/companies/${slug}`,
  companyArticles: (slug: string) => `/api/companies/${slug}/articles`,
  companyEntities: (slug: string) => `/api/companies/${slug}/entities`,
  companySentiment: (slug: string) => `/api/companies/${slug}/sentiment`,
  companyRisks: (slug: string) => `/api/companies/${slug}/risks`,
  companyReputation: (slug: string) => `/api/companies/${slug}/reputation`,
  companyAIVisibility: (slug: string) => `/api/companies/${slug}/ai-visibility`,

  // Console
  alerts: "/api/console/alerts",
  weather: "/api/console/weather",
  topics: "/api/console/topics",
  aiVisibility: "/api/console/ai-visibility",
  crisis: "/api/console/crisis",
  geoSignals: "/api/console/geo-signals",
  insights: "/api/console/insights",
  neighbors: "/api/console/neighbors",
  narratives: "/api/console/narratives",
  regulatory: "/api/console/regulatory",
  notifications: "/api/console/notifications",
  exportLog: "/api/console/export-log",
  reports: "/api/console/reports/list",
  darijaAnalyze: "/api/console/darija-analyze",

  // Investor
  dossiers: "/api/investor/dossiers",
  screen: "/api/investor/screen",
  portfolios: "/api/investor/portfolios",

  // Trader
  assets: "/api/trader/assets",
  assetHistory: (ticker: string) => `/api/trader/assets/${ticker}/history`,
  assetCorrelation: (ticker: string) => `/api/trader/assets/${ticker}/correlation`,
  traderStats: "/api/trader/stats",
  traderStream: "/api/trader/stream",

  // API Keys & Webhooks
  apiKeys: "/api/api-keys",
  webhooks: "/api/webhooks",
  webhookTest: (id: string) => `/api/webhooks/${id}/test`,

  // V1 Public API
  v1Reputation: "/api/v1/reputation",
  v1Alerts: "/api/v1/alerts",
  v1Sentiment: "/api/v1/sentiment",
  v1Screen: "/api/v1/screen",

  // Flagship Report
  flagshipReport: "/api/flagship-report",

  // Auth
  session: "/api/auth/session",
  providers: "/api/auth/providers",

  // Cron
  cronHealth: "/api/cron/health",

  // Health
  health: "/api/health",

  // Contact
  contact: "/api/contact",

  // Access Request
  accessRequest: "/api/access-request",

  // Webhooks (inbound)
  webhooksInbound: "/api/webhooks",
} as const;

// ─── PAGINATION DEFAULTS ───────────────────────────────────────

export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
  maxLimit: 100,
  sort: "createdAt",
  order: "desc" as const,
} as const;

// ─── CACHE TTL ─────────────────────────────────────────────────

export const CACHE_TTL = {
  SHORT: 60000,         // 1 minute
  MEDIUM: 300000,       // 5 minutes
  LONG: 3600000,        // 1 hour
  VERY_LONG: 86400000,  // 24 hours
} as const;

// ─── TIMEOUTS ──────────────────────────────────────────────────

export const TIMEOUTS = {
  API_REQUEST: 30000,
  SEARCH: 30000,
  EXPORT: 120000,
  CRON_JOB: 600000,
  BVC_REFRESH: 60000,
  SANCTIONS_REFRESH: 300000,
  NLP_PROCESS: 90000,
  AI_VISIBILITY_PROBE: 300000,
  BRIEFING_GENERATION: 300000,
  REPORT_GENERATION: 600000,
} as const;

// ─── RATE LIMITS ───────────────────────────────────────────────

export const RATE_LIMITS = {
  API_PER_MINUTE: 100,
  API_PER_HOUR: 1000,
  API_PER_DAY: 10000,
  AUTH_PER_15_MIN: 10,
  SEARCH_PER_MINUTE: 30,
  EXPORT_PER_HOUR: 10,
  CRON_PER_MINUTE: 5,
} as const;

// ─── FILE SIZE LIMITS ──────────────────────────────────────────

export const FILE_SIZE_LIMITS = {
  AVATAR: 2 * 1024 * 1024,        // 2MB
  LOGO: 5 * 1024 * 1024,          // 5MB
  DOCUMENT: 10 * 1024 * 1024,     // 10MB
  EXPORT: 100 * 1024 * 1024,      // 100MB
  ARTICLE_CONTENT: 100000,         // 100K chars
} as const;

// ─── LIMITS ────────────────────────────────────────────────────

export const LIMITS = {
  MAX_COMPANIES_PER_TENANT: 10,
  MAX_USERS_PER_TENANT: 50,
  MAX_API_KEYS_PER_USER: 10,
  MAX_WEBHOOKS_PER_USER: 20,
  MAX_PORTFOLIOS_PER_USER: 10,
  MAX_HOLDINGS_PER_PORTFOLIO: 100,
  MAX_DOSSIERS_PER_USER: 50,
  MAX_NOTIFICATIONS_PER_USER: 1000,
  MAX_BRIEFINGS_PER_USER: 365,
  MAX_REPORTS_PER_USER: 100,
  MAX_ALERTS_PER_COMPANY: 500,
  MAX_ARTICLES_PER_COMPANY: 100000,
  MAX_ENTITIES_PER_COMPANY: 1000,
  MAX_RISK_ASSESSMENTS_PER_COMPANY: 100,
  MAX_AI_VISIBILITY_PER_COMPANY: 100,
  MAX_SENTIMENT_SCORES_PER_COMPANY: 520, // 10 years × 52 weeks
  MAX_ASSET_PRICES_PER_ASSET: 3650,     // 10 years × 365 days
  MAX_INFLUENCERS: 1000,
  MAX_SANCTIONS_LISTS: 3,
  MAX_FEED_SOURCES: 50,
  MAX_WIDGETS_PER_DASHBOARD: 50,
  MAX_DASHBOARD_TEMPLATES: 20,
  MAX_REPORT_SECTIONS: 20,
  MAX_EXPORT_RECORDS: 10000,
  MAX_BATCH_SIZE: 100,
  MAX_SEARCH_RESULTS: 100,
  MAX_FILTER_CONDITIONS: 20,
  MAX_SORT_FIELDS: 5,
} as const;

// ─── REGEX PATTERNS ────────────────────────────────────────────

export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/[^\s]+$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  CUID: /^c[a-z0-9]{24}$/i,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  ISIN: /^[A-Z]{2}[A-Z0-9]{9}\d$/,
  TICKER: /^[A-Z]{2,5}$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  IPV4: /^(\d{1,3}\.){3}\d{1,3}$/,
  IPV6: /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
  MAC_ADDRESS: /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/,
  DATE_ISO: /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/,
  TIME_24H: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  POSTAL_CODE_MA: /^\d{5}$/,
  PHONE_MA: /^(\+212|0)([5-7])\d{8}$/,
} as const;

// ─── ERROR MESSAGES ────────────────────────────────────────────

export const ERROR_MESSAGES = {
  UNAUTHORIZED: "You are not authorized to perform this action",
  FORBIDDEN: "You do not have permission to access this resource",
  NOT_FOUND: "The requested resource was not found",
  RATE_LIMITED: "Too many requests. Please try again later",
  INTERNAL_ERROR: "An internal server error occurred",
  VALIDATION_ERROR: "The provided data is invalid",
  NETWORK_ERROR: "Network error. Please check your connection",
  TIMEOUT: "The request timed out",
  CONFLICT: "A conflict occurred with the current state of the resource",
  GONE: "The requested resource is no longer available",
  PAYLOAD_TOO_LARGE: "The request payload is too large",
  UNSUPPORTED_MEDIA_TYPE: "The media type is not supported",
  TOO_MANY_REQUESTS: "Too many requests. Please slow down",
  SERVICE_UNAVAILABLE: "The service is temporarily unavailable",
  GATEWAY_TIMEOUT: "The gateway timed out",
} as const;

// ─── SUCCESS MESSAGES ──────────────────────────────────────────

export const SUCCESS_MESSAGES = {
  CREATED: "Created successfully",
  UPDATED: "Updated successfully",
  DELETED: "Deleted successfully",
  SAVED: "Saved successfully",
  SUBMITTED: "Submitted successfully",
  EXPORTED: "Exported successfully",
  GENERATED: "Generated successfully",
  SENT: "Sent successfully",
  APPROVED: "Approved successfully",
  REJECTED: "Rejected successfully",
  ACTIVATED: "Activated successfully",
  DEACTIVATED: "Deactivated successfully",
  CONNECTED: "Connected successfully",
  DISCONNECTED: "Disconnected successfully",
} as const;

// ─── LABELS ────────────────────────────────────────────────────

export const LABELS = {
  // Common
  loading: "Loading...",
  saving: "Saving...",
  submitting: "Submitting...",
  generating: "Generating...",
  exporting: "Exporting...",
  searching: "Searching...",
  filtering: "Filtering...",
  refreshing: "Refreshing...",
  connecting: "Connecting...",
  uploading: "Uploading...",
  downloading: "Downloading...",

  // Empty states
  noData: "No data available",
  noResults: "No results found",
  noArticles: "No articles found",
  noAlerts: "No alerts to display",
  noReports: "No reports generated yet",
  noNotifications: "No notifications",
  noCompanies: "No companies tracked",
  noPeople: "No people found",
  noRisks: "No risk assessments",
  noSentiment: "No sentiment data",
  noPrices: "No price data",
  noEntities: "No entities found",
  noInfluencers: "No influencers tracked",

  // Actions
  view: "View",
  edit: "Edit",
  delete: "Delete",
  create: "Create",
  save: "Save",
  cancel: "Cancel",
  confirm: "Confirm",
  close: "Close",
  retry: "Retry",
  refresh: "Refresh",
  export: "Export",
  import: "Import",
  download: "Download",
  upload: "Upload",
  share: "Share",
  copy: "Copy",
  select: "Select",
  deselect: "Deselect",
  selectAll: "Select All",
  clearAll: "Clear All",
  apply: "Apply",
  reset: "Reset",
  search: "Search",
  filter: "Filter",
  sort: "Sort",
  next: "Next",
  previous: "Previous",
  first: "First",
  last: "Last",
  more: "More",
  less: "Less",
  expand: "Expand",
  collapse: "Collapse",
  show: "Show",
  hide: "Hide",
  enable: "Enable",
  disable: "Disable",
  activate: "Activate",
  deactivate: "Deactivate",
  approve: "Approve",
  reject: "Reject",
  accept: "Accept",
  decline: "Decline",
  submit: "Submit",
  publish: "Publish",
  unpublish: "Unpublish",
  archive: "Archive",
  restore: "Restore",
  duplicate: "Duplicate",
  move: "Move",
  rename: "Rename",
} as const;
