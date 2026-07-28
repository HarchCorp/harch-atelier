// ═══════════════════════════════════════════════════════════════
//  SOURCES CONFIG — AEGIS-SCRAPER reinforced source registry
//
//  This is the single source of truth for:
//  • 10 curated RSS feeds (Moroccan + African business / regulatory media)
//  • 18 Moroccan listed companies with rich metadata + Arabic aliases
//  • Helper functions consumed by the reinforced rss-scraper.ts
//
//  The legacy sources.ts file is kept as a thin backward-compat shim
//  that derives COMPANY_ALIASES / COMPANY_CATEGORIES / COMPANY_COMPETITORS
//  from the COMPANIES array below — so orchestrator-v2.ts and
//  orchestrator.ts keep working unchanged.
// ═══════════════════════════════════════════════════════════════

// ─── RSS SOURCE DEFINITION ────────────────────────────────────────

export type SourceLanguage = "fr" | "ar" | "en";
export type SourceReliability = "high" | "medium" | "low";
export type SourceCategory =
  | "general"
  | "business"
  | "finance"
  | "regulatory"
  | "tech";

export interface RSSSource {
  /** Stable slug, used as DB key (e.g. "telquel"). */
  id: string;
  /** Human-readable publisher name. */
  name: string;
  /** Full RSS endpoint URL. May contain {QUERY} for Google News. */
  url: string;
  language: SourceLanguage;
  region: string; // e.g. "Morocco", "Africa"
  category: SourceCategory;
  reliability: SourceReliability;
  /** Polite delay between requests (ms). */
  rateLimitMs: number;
  isActive: boolean;
  /** Free-form ops notes (known 403s, anti-bot notes, etc.). */
  notes?: string;
}

// ─── COMPANY DEFINITION ───────────────────────────────────────────

export interface CompanyConfig {
  id: string;
  name: string;
  slug: string;
  /** All searchable aliases — must include the legal name, common short
   *  forms, tickers, and the Arabic spelling so scrapeDirectRSS can
   *  match articles written in either script. */
  aliases: string[];
  sector: string;
  /** Casablanca Stock Exchange ticker, if listed. */
  ticker?: string;
  foundedYear?: number;
  headquarters?: string;
  employees?: number;
  /** Annual revenue in USD. */
  revenue?: number;
  website?: string;
  logoUrl?: string;
  description?: string;
}

// ─── 10 CURATED RSS SOURCES ───────────────────────────────────────

export const RSS_SOURCES: RSSSource[] = [
  {
    id: "google-news-ma",
    name: "Google News Morocco",
    url: "https://news.google.com/rss/search?q={QUERY}&hl=fr&gl=MA&ceid=MA:fr",
    language: "fr",
    region: "Morocco",
    category: "general",
    reliability: "high",
    rateLimitMs: 1000,
    isActive: true,
    notes:
      "Aggregator — query template uses {QUERY} placeholder; covers Hespress, Le360, Medias24, TelQuel, etc.",
  },
  {
    id: "telquel",
    name: "TelQuel",
    url: "https://telquel.ma/feed",
    language: "fr",
    region: "Morocco",
    category: "general",
    reliability: "high",
    rateLimitMs: 3000,
    isActive: true,
    notes: "Frequent 403 errors — Cloudflare bot rule, rotates UA.",
  },
  {
    id: "medias24",
    name: "Medias24",
    url: "https://www.medias24.com/feed",
    language: "fr",
    region: "Morocco",
    category: "business",
    reliability: "high",
    rateLimitMs: 3000,
    isActive: true,
    notes: "Business / financial news — high signal for listed companies.",
  },
  {
    id: "aujourdhui",
    name: "Aujourd'hui Le Maroc",
    url: "https://aujourdhui.ma/feed",
    language: "fr",
    region: "Morocco",
    category: "general",
    reliability: "medium",
    rateLimitMs: 2000,
    isActive: true,
  },
  {
    id: "lesiteinfo",
    name: "Le Site Info",
    url: "https://lesiteinfo.com/feed/",
    language: "fr",
    region: "Morocco",
    category: "general",
    reliability: "medium",
    rateLimitMs: 2000,
    isActive: true,
  },
  {
    id: "financial-afrik",
    name: "Financial Afrik",
    url: "https://www.financialafrik.com/feed",
    language: "fr",
    region: "Africa",
    category: "finance",
    reliability: "high",
    rateLimitMs: 2000,
    isActive: true,
    notes: "Pan-African financial coverage — good for cross-listed groups.",
  },
  {
    id: "infomediaire",
    name: "Infomediaire",
    url: "https://www.infomediaire.net/feed/",
    language: "fr",
    region: "Morocco",
    category: "general",
    reliability: "medium",
    rateLimitMs: 2000,
    isActive: true,
  },
  {
    id: "africa-news",
    name: "Africa News",
    url: "https://www.africanews.com/feed/",
    language: "en",
    region: "Africa",
    category: "general",
    reliability: "high",
    rateLimitMs: 2000,
    isActive: true,
    notes: "English-language pan-African coverage.",
  },
  {
    id: "bam",
    name: "Bank Al-Maghrib",
    url: "https://www.bkam.ma/rss",
    language: "fr",
    region: "Morocco",
    category: "regulatory",
    reliability: "high",
    rateLimitMs: 5000,
    isActive: true,
    notes: "Regulatory filings — central bank circulars, banking supervision.",
  },
  {
    id: "ammc",
    name: "AMMC",
    url: "https://www.ammc.ma/rss",
    language: "fr",
    region: "Morocco",
    category: "regulatory",
    reliability: "high",
    rateLimitMs: 5000,
    isActive: true,
    notes: "Capital markets regulatory filings (AMMC = Autorité Marocaine du Marché des Capitaux).",
  },
];

// ─── 18 MOROCCAN COMPANIES ────────────────────────────────────────

export const COMPANIES: CompanyConfig[] = [
  {
    id: "attijariwafa-bank",
    name: "Attijariwafa Bank",
    slug: "attijariwafa-bank",
    aliases: [
      "Attijariwafa",
      "Attijari",
      "Wafa Bank",
      "AWB",
      "CIBM",
      "التجاري وفا بنك",
      "بنك التجاري وفا",
    ],
    sector: "Banking",
    ticker: "ATW",
    foundedYear: 1904,
    headquarters: "Casablanca, Morocco",
    employees: 20000,
    website: "https://www.attijariwafabank.com",
    description:
      "Largest banking group in Morocco and a leading pan-African financial institution.",
  },
  {
    id: "ocp-group",
    name: "OCP Group",
    slug: "ocp-group",
    aliases: [
      "OCP",
      "Office Chérifien des Phosphates",
      "Office Cherifien des Phosphates",
      "المكتب الشريف للفوسفاط",
    ],
    sector: "Mining",
    ticker: "OCP",
    foundedYear: 1920,
    headquarters: "Casablanca, Morocco",
    employees: 21000,
    website: "https://www.ocp.com",
    description:
      "World's largest phosphate producer and a strategic pillar of the Moroccan economy.",
  },
  {
    id: "maroc-telecom",
    name: "Maroc Telecom",
    slug: "maroc-telecom",
    aliases: [
      "Maroc Telecom",
      "Itissalat Al-Maghrib",
      "IAM",
      "اتصالات المغرب",
      "اتصالات المغرب",
    ],
    sector: "Telecommunications",
    ticker: "IAM",
    foundedYear: 1998,
    headquarters: "Rabat, Morocco",
    employees: 12000,
    website: "https://www.iam.ma",
    description:
      "Morocco's incumbent telecom operator with subsidiaries across West Africa.",
  },
  {
    id: "bank-of-africa",
    name: "Bank of Africa",
    slug: "bank-of-africa",
    aliases: [
      "BMCE",
      "BOA",
      "BMCE Bank",
      "Bank of Africa",
      "بنك إفريقيا",
      "بنك المغرب التجاري الخارجي",
    ],
    sector: "Banking",
    ticker: "BOA",
    foundedYear: 1959,
    headquarters: "Casablanca, Morocco",
    employees: 13000,
    website: "https://www.bankofafrica.ma",
    description:
      "Pan-African banking group formerly known as BMCE Bank of Africa.",
  },
  {
    id: "cih-bank",
    name: "CIH Bank",
    slug: "cih-bank",
    aliases: [
      "CIH",
      "CIH Bank",
      "Crédit Immobilier et Hôtelier",
      "Credit Immobilier et Hotelier",
      "القرض العقاري والسياحي",
    ],
    sector: "Banking",
    ticker: "CIH",
    foundedYear: 1920,
    headquarters: "Casablanca, Morocco",
    employees: 2000,
    website: "https://www.cihbank.ma",
    description:
      "Moroccan bank historically focused on real-estate and hospitality financing.",
  },
  {
    id: "royal-air-maroc",
    name: "Royal Air Maroc",
    slug: "royal-air-maroc",
    aliases: [
      "RAM",
      "RoyalAirMaroc",
      "Royal Air Maroc",
      "الخطوط الملكية المغربية",
    ],
    sector: "Aviation",
    ticker: "RAM",
    foundedYear: 1957,
    headquarters: "Casablanca, Morocco",
    employees: 7000,
    website: "https://www.royalairmaroc.com",
    description:
      "Morocco's flag carrier and Oneworld alliance member.",
  },
  {
    id: "managem",
    name: "Managem",
    slug: "managem",
    aliases: [
      "Managem",
      "Managem Group",
      "مناجم",
      "شركة مناجم",
    ],
    sector: "Mining",
    ticker: "MNG",
    foundedYear: 1928,
    headquarters: "Casablanca, Morocco",
    employees: 5000,
    website: "https://www.managemgroup.com",
    description:
      "Mining and hydrometallurgy group active in cobalt, copper, gold and precious metals.",
  },
  {
    id: "cosumar",
    name: "Cosumar",
    slug: "cosumar",
    aliases: [
      "Cosumar",
      "Cosumar Group",
      "Compagnie Sucrière Marocaine",
      "Compagnie Sucriere Marocaine",
      "كوسومار",
    ],
    sector: "Agro-industry",
    ticker: "CSU",
    foundedYear: 1929,
    headquarters: "Casablanca, Morocco",
    employees: 4000,
    website: "https://www.cosumar.co.ma",
    description:
      "Morocco's sugar refiner — covers the full cane and beet value chain.",
  },
  {
    id: "label-vie",
    name: "Label'Vie",
    slug: "label-vie",
    aliases: [
      "Label Vie",
      "Label'Vie",
      "Carrefour Maroc",
      "Carrefour Maroc Label'Vie",
      "لابيل في",
    ],
    sector: "Retail",
    ticker: "LBV",
    foundedYear: 1985,
    headquarters: "Casablanca, Morocco",
    employees: 6000,
    website: "https://www.labelvie.ma",
    description:
      "Exclusive Carrefour franchisee in Morocco — leading food retailer.",
  },
  {
    id: "inwi",
    name: "Inwi",
    slug: "inwi",
    aliases: [
      "Inwi",
      "Wana Corporate",
      "Wana",
      "إنوي",
    ],
    sector: "Telecommunications",
    foundedYear: 2010,
    headquarters: "Casablanca, Morocco",
    employees: 3500,
    website: "https://www.inwi.ma",
    description:
      "Moroccan mobile and fixed-line telecom operator, subsidiary of SNI / Al Mada.",
  },
  {
    id: "axa-assurance-maroc",
    name: "AXA Assurance Maroc",
    slug: "axa-assurance-maroc",
    aliases: [
      "AXA Maroc",
      "AXA Assurance Maroc",
      "AXA Assurance",
      "أكسا المغرب",
    ],
    sector: "Insurance",
    ticker: "AXA",
    foundedYear: 1931,
    headquarters: "Casablanca, Morocco",
    employees: 1200,
    website: "https://www.axa.ma",
    description:
      "Moroccan leader in life and non-life insurance, part of the AXA Group.",
  },
  {
    id: "wafa-assurance",
    name: "Wafa Assurance",
    slug: "wafa-assurance",
    aliases: [
      "WafaAssurance",
      "Wafa Assurance",
      "Wafa Assurances",
      "وفا للتأمين",
    ],
    sector: "Insurance",
    ticker: "WAA",
    foundedYear: 2004,
    headquarters: "Casablanca, Morocco",
    employees: 1500,
    website: "https://www.wafa-assurance.ma",
    description:
      "Insurance subsidiary of Attijariwafa Bank — leading life insurer in Morocco.",
  },
  {
    id: "delassenza-holding",
    name: "Delassenza Holding",
    slug: "delassenza-holding",
    aliases: [
      "Delassenza",
      "Delassenza Holding",
      "SNI",
      "Société Nationale d'Investissement",
      "Al Mada",
      "المملكة",
    ],
    sector: "Conglomerate",
    foundedYear: 1966,
    headquarters: "Casablanca, Morocco",
    website: "https://www.almada.ma",
    description:
      "Moroccan private investment holding (formerly SNI / Al Mada) — the royal investment vehicle.",
  },
  {
    id: "lafargeholcim-maroc",
    name: "LafargeHolcim Maroc",
    slug: "lafargeholcim-maroc",
    aliases: [
      "Lafarge Maroc",
      "Holcim Maroc",
      "LafargeHolcim Maroc",
      "LafargeHolcim",
      "لافارج هولسيم المغرب",
    ],
    sector: "Construction Materials",
    ticker: "LHC",
    foundedYear: 1939,
    headquarters: "Casablanca, Morocco",
    employees: 2000,
    website: "https://www.lafargeholcim.ma",
    description:
      "Morocco's largest cement producer — part of the global Holcim Group.",
  },
  {
    id: "disway",
    name: "Disway",
    slug: "disway",
    aliases: [
      "Disway",
      "Distributeur Information Systems",
      "Distributeur Information Systems Maroc",
      "ديسواي",
    ],
    sector: "Technology Distribution",
    ticker: "DSY",
    foundedYear: 1990,
    headquarters: "Casablanca, Morocco",
    employees: 600,
    website: "https://www.disway.ma",
    description:
      "Leading IT distributor in Morocco — covers hardware, software and services.",
  },
  {
    id: "m2m-group",
    name: "M2M Group",
    slug: "m2m-group",
    aliases: [
      "M2M",
      "M2M MA",
      "M2M Group",
    ],
    sector: "Technology",
    ticker: "M2M",
    foundedYear: 1987,
    headquarters: "Casablanca, Morocco",
    employees: 500,
    website: "https://www.m2mgroup.ma",
    description:
      "IT services and payment systems integrator listed on the Casablanca Stock Exchange.",
  },
  {
    id: "auto-nejma",
    name: "Auto Nejma",
    slug: "auto-nejma",
    aliases: [
      "AutoNejma",
      "Auto Nejma",
      "نيجمة أوتو",
    ],
    sector: "Automotive Distribution",
    ticker: "ANJ",
    foundedYear: 1962,
    headquarters: "Casablanca, Morocco",
    employees: 400,
    website: "https://www.autonejma.ma",
    description:
      "Authorized distributor of luxury automotive brands (Jaguar, Land Rover, Ford) in Morocco.",
  },
  {
    id: "lesieurcristal",
    name: "LesieurCristal",
    slug: "lesieurcristal",
    aliases: [
      "Lesieur Cristal",
      "LesieurCristal",
      "Lesieur",
      "Cristal",
      "ليسيور كريستال",
    ],
    sector: "Agro-industry",
    ticker: "LCR",
    foundedYear: 1929,
    headquarters: "Casablanca, Morocco",
    employees: 1500,
    website: "https://www.lesieurcristal.ma",
    description:
      "Morocco's leading edible-oil producer (sunflower, soya, olive).",
  },
];

// ─── HELPER FUNCTIONS ─────────────────────────────────────────────

/**
 * Return only active RSS sources (isActive === true).
 * Used by the reinforced rss-scraper.ts to skip disabled feeds.
 */
export function getActiveSources(): RSSSource[] {
  return RSS_SOURCES.filter((s) => s.isActive);
}

/**
 * Find a company by its URL slug. Returns undefined if not found.
 */
export function getCompanyBySlug(slug: string): CompanyConfig | undefined {
  return COMPANIES.find((c) => c.slug === slug);
}

/**
 * Find a company by its stable id. Returns undefined if not found.
 */
export function getCompanyById(id: string): CompanyConfig | undefined {
  return COMPANIES.find((c) => c.id === id);
}

/**
 * Return all companies whose aliases appear in `text`.
 * Case-insensitive, word-boundary aware where possible.
 *
 * Used by the orchestrator to attribute scraped articles to tracked
 * companies without needing a separate alias map.
 */
export function matchCompanyInText(text: string): CompanyConfig[] {
  if (!text) return [];
  const haystack = text.toLowerCase();
  const matches: CompanyConfig[] = [];

  for (const company of COMPANIES) {
    const hit = company.aliases.some((alias) => {
      const a = alias.toLowerCase().trim();
      if (!a) return false;
      return haystack.includes(a);
    });
    if (hit) matches.push(company);
  }

  return matches;
}
