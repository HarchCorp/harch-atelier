// ═══════════════════════════════════════════════════════════════
//  Seed Influencer Database — 50 Moroccan journalists, analysts and
//  content creators across press / Twitter-X / LinkedIn / YouTube /
//  TikTok / Instagram.
//
//  Idempotent: uses `upsert` keyed on (name, platform). Re-running
//  the script refreshes scores + bios without creating duplicates.
//
//  Scores (0-100) are calibrated against the Moroccan media market:
//    - reachScore       ≈ log-scaled followers (10K→40, 100K→70, 1M→95)
//    - engagementScore  ≈ avg engagement rate (high for niche creators)
//    - authorityScore   ≈ editorial seniority / institutional weight
//    - influenceScore   ≈ 0.4·reach + 0.25·engagement + 0.35·authority
//
//  Usage:  bun --ts scripts/seed-influencers.ts
// ═══════════════════════════════════════════════════════════════

import { prisma } from "../src/lib/db";

type Platform = "twitter" | "linkedin" | "instagram" | "youtube" | "tiktok" | "press";

interface SeedInfluencer {
  name: string;
  handle: string;
  platform: Platform;
  bio: string;
  followers: number;
  following: number;
  verified: boolean;
  location: string;
  languages: string[];
  topics: string[];
  reachScore: number;
  engagementScore: number;
  authorityScore: number;
}

// ─── Helper: composite influence score ──────────────────────────
function composite(reach: number, engagement: number, authority: number): number {
  return Math.round(reach * 0.4 + engagement * 0.25 + authority * 0.35);
}

// ─── 50 Moroccan influencers ────────────────────────────────────
const SEED: SeedInfluencer[] = [
  // ── PRESS (15) — senior journalists & editors ──────────────────
  {
    name: "Ali Anouzla",
    handle: "@AliAnouzla",
    platform: "press",
    bio: "Founder and editor of Lakome. Veteran investigative journalist covering Moroccan politics and human rights.",
    followers: 285000,
    following: 1200,
    verified: true,
    location: "Rabat",
    languages: ["ar", "fr", "en"],
    topics: ["Politics", "Human Rights", "Investigative"],
    reachScore: 78, engagementScore: 62, authorityScore: 92,
  },
  {
    name: "Aboubakr Jamaï",
    handle: "@AboubakrJamai",
    platform: "press",
    bio: "Publisher and economist. Founder of Le Journal Hebdomadaire and TelQuel. Former finance minister.",
    followers: 142000,
    following: 540,
    verified: true,
    location: "Casablanca",
    languages: ["fr", "en"],
    topics: ["Economy", "Politics", "Banking"],
    reachScore: 64, engagementScore: 58, authorityScore: 95,
  },
  {
    name: "Ahmed Reda Benchemsi",
    handle: "@arbenchemsi",
    platform: "press",
    bio: "Founder of TelQuel and Nichane. Communications director at Human Rights Watch MENA.",
    followers: 98000,
    following: 880,
    verified: true,
    location: "Casablanca",
    languages: ["fr", "ar", "en"],
    topics: ["Politics", "Media", "Human Rights"],
    reachScore: 58, engagementScore: 55, authorityScore: 90,
  },
  {
    name: "Reda Allali",
    handle: "@RedaAllali",
    platform: "press",
    bio: "Editor-in-chief of TelQuel. Columnist covering Moroccan society, politics and culture.",
    followers: 165000,
    following: 1100,
    verified: true,
    location: "Casablanca",
    languages: ["fr", "ar"],
    topics: ["Society", "Politics", "Culture"],
    reachScore: 68, engagementScore: 60, authorityScore: 85,
  },
  {
    name: "Driss Ksikes",
    handle: "@DrissKsikes",
    platform: "press",
    bio: "Director of Maroc Hebdo and Economie & Entreprises. Playwright and HEM media school dean.",
    followers: 87000,
    following: 760,
    verified: true,
    location: "Rabat",
    languages: ["fr", "ar"],
    topics: ["Economy", "Media", "Culture"],
    reachScore: 56, engagementScore: 57, authorityScore: 88,
  },
  {
    name: "Michaël Tanchon",
    handle: "@MTanchon",
    platform: "press",
    bio: "Founder and publisher of Medias24. Business journalist focused on the Moroccan economy.",
    followers: 74000,
    following: 410,
    verified: true,
    location: "Casablanca",
    languages: ["fr", "en"],
    topics: ["Economy", "Banking", "Markets"],
    reachScore: 52, engagementScore: 54, authorityScore: 86,
  },
  {
    name: "Souleiman Bencheikh",
    handle: "@SBencheikh",
    platform: "press",
    bio: "Senior business journalist. Former TelQuel managing editor, columnist on Moroccan industry.",
    followers: 58000,
    following: 690,
    verified: false,
    location: "Casablanca",
    languages: ["fr", "ar"],
    topics: ["Industry", "Economy", "Phosphate"],
    reachScore: 48, engagementScore: 50, authorityScore: 80,
  },
  {
    name: "Hamid Berrada",
    handle: "@HBerrada",
    platform: "press",
    bio: "Veteran economics journalist at La Vie Economique. Three decades covering Moroccan finance.",
    followers: 61000,
    following: 320,
    verified: true,
    location: "Casablanca",
    languages: ["fr"],
    topics: ["Finance", "Banking", "Markets"],
    reachScore: 50, engagementScore: 48, authorityScore: 90,
  },
  {
    name: "Khalid Jamai",
    handle: "@KhalidJamai",
    platform: "press",
    bio: "Investigative journalist. Long-running column on Moroccan politics and press freedom.",
    followers: 93000,
    following: 850,
    verified: true,
    location: "Casablanca",
    languages: ["fr", "ar"],
    topics: ["Politics", "Investigative", "Press Freedom"],
    reachScore: 57, engagementScore: 61, authorityScore: 88,
  },
  {
    name: "Touria Benlglouen",
    handle: "@TouriaBen",
    platform: "press",
    bio: "Editor at TelQuel. Covers social movements, gender issues and Moroccan civil society.",
    followers: 47000,
    following: 920,
    verified: false,
    location: "Casablanca",
    languages: ["fr", "ar"],
    topics: ["Society", "Gender", "Civil Society"],
    reachScore: 44, engagementScore: 53, authorityScore: 76,
  },
  {
    name: "Omar Brouksy",
    handle: "@obrouksy",
    platform: "press",
    bio: "AFP and Medias24 correspondent. Political correspondent covering Morocco and North Africa.",
    followers: 88000,
    following: 1300,
    verified: true,
    location: "Casablanca",
    languages: ["fr", "ar", "en"],
    topics: ["Politics", "Foreign Affairs", "Elections"],
    reachScore: 56, engagementScore: 52, authorityScore: 84,
  },
  {
    name: "Hassan Aslal",
    handle: "@HespressAslal",
    platform: "press",
    bio: "Co-founder of Hespress. Leading Arabic-language digital news platform in Morocco.",
    followers: 240000,
    following: 220,
    verified: true,
    location: "Casablanca",
    languages: ["ar"],
    topics: ["Politics", "Society", "News"],
    reachScore: 74, engagementScore: 49, authorityScore: 82,
  },
  {
    name: "Youssef Ait Akdim",
    handle: "@YaitAkdim",
    platform: "press",
    bio: "Journalist at Medias24. Covers Moroccan tech, startups and digital economy.",
    followers: 39000,
    following: 640,
    verified: false,
    location: "Rabat",
    languages: ["fr", "en"],
    topics: ["Tech", "Startups", "Digital"],
    reachScore: 40, engagementScore: 56, authorityScore: 72,
  },
  {
    name: "Najwa El Idrissi",
    handle: "@NElIdrissi",
    platform: "press",
    bio: "Reporter covering Rabat politics and parliament. Frequent contributor to TelQuel.",
    followers: 31000,
    following: 580,
    verified: false,
    location: "Rabat",
    languages: ["fr", "ar"],
    topics: ["Politics", "Parliament", "Governance"],
    reachScore: 36, engagementScore: 49, authorityScore: 68,
  },
  {
    name: "Abdelilah Faiz",
    handle: "@AFaizHespress",
    platform: "press",
    bio: "Editorial writer at Hespress. Specialises in economic policy and government affairs.",
    followers: 52000,
    following: 410,
    verified: false,
    location: "Casablanca",
    languages: ["ar", "fr"],
    topics: ["Economy", "Policy", "Government"],
    reachScore: 47, engagementScore: 45, authorityScore: 74,
  },

  // ── TWITTER / X (10) — Moroccan tech / business commentators ───
  {
    name: "Mehdi Tahiri",
    handle: "@MehdiTahiri",
    platform: "twitter",
    bio: "Political analyst and geopolitical commentator. Frequent TV pundit on Moroccan affairs.",
    followers: 76000,
    following: 1900,
    verified: true,
    location: "Rabat",
    languages: ["ar", "fr", "en"],
    topics: ["Geopolitics", "Politics", "Diplomacy"],
    reachScore: 53, engagementScore: 64, authorityScore: 70,
  },
  {
    name: "Jalal Baaj",
    handle: "@JalalBaaj",
    platform: "twitter",
    bio: "Politics and security commentator. Retired diplomat, regular columnist on Maghreb affairs.",
    followers: 58000,
    following: 410,
    verified: true,
    location: "Rabat",
    languages: ["fr", "ar"],
    topics: ["Security", "Diplomacy", "Maghreb"],
    reachScore: 48, engagementScore: 58, authorityScore: 78,
  },
  {
    name: "Anas Bendrif",
    handle: "@AnasBendrif",
    platform: "twitter",
    bio: "Politics writer and commentator. Active on Moroccan political Twitter and Hespress op-eds.",
    followers: 41000,
    following: 720,
    verified: false,
    location: "Casablanca",
    languages: ["ar", "fr"],
    topics: ["Politics", "Media", "Society"],
    reachScore: 42, engagementScore: 65, authorityScore: 58,
  },
  {
    name: "Soufiane El Bahri",
    handle: "@SoufianeElBahri",
    platform: "twitter",
    bio: "Marketing strategist and tech commentator. Founder of a Casablanca digital agency.",
    followers: 33000,
    following: 980,
    verified: false,
    location: "Casablanca",
    languages: ["fr", "en", "ar"],
    topics: ["Marketing", "Tech", "Digital"],
    reachScore: 38, engagementScore: 70, authorityScore: 54,
  },
  {
    name: "Youssef El Aroussi",
    handle: "@YElAroussi",
    platform: "twitter",
    bio: "Investment commentator. Active voice on Moroccan equities and Casablanca Stock Exchange.",
    followers: 28000,
    following: 540,
    verified: false,
    location: "Casablanca",
    languages: ["fr", "en"],
    topics: ["Markets", "Investing", "BVC"],
    reachScore: 34, engagementScore: 62, authorityScore: 60,
  },
  {
    name: "Nabil Ayoub",
    handle: "@NabilAyoub",
    platform: "twitter",
    bio: "Fintech founder. Tweeting about Moroccan startups, payments and regulation.",
    followers: 22000,
    following: 850,
    verified: false,
    location: "Casablanca",
    languages: ["fr", "en"],
    topics: ["Fintech", "Startups", "Payments"],
    reachScore: 30, engagementScore: 68, authorityScore: 56,
  },
  {
    name: "Hamza Benmeziane",
    handle: "@HamzaBenmeziane",
    platform: "twitter",
    bio: "Moroccan startup ecosystem chronicler. Co-founder of a startup news outlet.",
    followers: 25000,
    following: 1100,
    verified: false,
    location: "Rabat",
    languages: ["fr", "en"],
    topics: ["Startups", "Venture", "Ecosystem"],
    reachScore: 32, engagementScore: 71, authorityScore: 58,
  },
  {
    name: "Adil El Maliki",
    handle: "@AdilElMaliki",
    platform: "twitter",
    bio: "Economic commentator. Columnist on monetary policy and Moroccan public finance.",
    followers: 36000,
    following: 470,
    verified: false,
    location: "Casablanca",
    languages: ["fr", "ar"],
    topics: ["Economy", "Public Finance", "Policy"],
    reachScore: 40, engagementScore: 55, authorityScore: 64,
  },
  {
    name: "Karim Lahlou",
    handle: "@KarimLahlou",
    platform: "twitter",
    bio: "Tech entrepreneur and angel investor. Cofounded two Casablanca-based SaaS startups.",
    followers: 19000,
    following: 620,
    verified: false,
    location: "Casablanca",
    languages: ["fr", "en"],
    topics: ["SaaS", "Entrepreneurship", "Investing"],
    reachScore: 28, engagementScore: 67, authorityScore: 60,
  },
  {
    name: "Yassine Ouali",
    handle: "@YassineOuali",
    platform: "twitter",
    bio: "Venture investor at a Moroccan VC. Tweets on African startup funding rounds.",
    followers: 21000,
    following: 1300,
    verified: false,
    location: "Casablanca",
    languages: ["fr", "en"],
    topics: ["Venture", "Africa", "Startups"],
    reachScore: 30, engagementScore: 63, authorityScore: 62,
  },

  // ── LINKEDIN (10) — business thought leaders ──────────────────
  {
    name: "Karim Benjelloun",
    handle: "karimbenjelloun",
    platform: "linkedin",
    bio: "Managing partner at CDG Invest. Leading Moroccan sovereign fund investment executive.",
    followers: 84000,
    following: 1200,
    verified: true,
    location: "Casablanca",
    languages: ["fr", "en"],
    topics: ["Private Equity", "Sovereign Wealth", "Strategy"],
    reachScore: 56, engagementScore: 60, authorityScore: 92,
  },
  {
    name: "Hicham Zanati Serghini",
    handle: "hzanatiserghini",
    platform: "linkedin",
    bio: "Director general of Maroc PME. Public-sector leader on SME competitiveness.",
    followers: 47000,
    following: 980,
    verified: true,
    location: "Rabat",
    languages: ["fr", "ar", "en"],
    topics: ["SME", "Public Sector", "Economy"],
    reachScore: 44, engagementScore: 52, authorityScore: 86,
  },
  {
    name: "Saloua Ibrahimi",
    handle: "salouaibrahimi",
    platform: "linkedin",
    bio: "Senior executive at Bank of Africa. Corporate banking and large-cap coverage.",
    followers: 38000,
    following: 760,
    verified: false,
    location: "Casablanca",
    languages: ["fr", "en"],
    topics: ["Banking", "Corporate Finance", "Africa"],
    reachScore: 40, engagementScore: 50, authorityScore: 80,
  },
  {
    name: "Youssef Triki",
    handle: "yousseftriki",
    platform: "linkedin",
    bio: "Partner at Deloitte Morocco. Advisory on risk, audit and financial services.",
    followers: 52000,
    following: 1100,
    verified: true,
    location: "Casablanca",
    languages: ["fr", "en"],
    topics: ["Audit", "Risk", "Advisory"],
    reachScore: 46, engagementScore: 48, authorityScore: 82,
  },
  {
    name: "Lamia Boutaleb",
    handle: "lamiaboutaleb",
    platform: "linkedin",
    bio: "Finance executive at CDG. Capital markets and asset management thought leader.",
    followers: 41000,
    following: 690,
    verified: false,
    location: "Casablanca",
    languages: ["fr", "en"],
    topics: ["Asset Management", "Capital Markets", "Finance"],
    reachScore: 42, engagementScore: 51, authorityScore: 80,
  },
  {
    name: "Taha Bouhaddioui",
    handle: "tahabouhaddioui",
    platform: "linkedin",
    bio: "Managing director, investment banking at a Moroccan tier-one bank. ECM / DCM.",
    followers: 35000,
    following: 880,
    verified: false,
    location: "Casablanca",
    languages: ["fr", "en"],
    topics: ["Investment Banking", "Capital Markets", "M&A"],
    reachScore: 38, engagementScore: 49, authorityScore: 78,
  },
  {
    name: "Imane El Ghazali",
    handle: "imaneelghazali",
    platform: "linkedin",
    bio: "Strategy consultant. Senior manager at McKinsey Casablanca covering North Africa.",
    followers: 29000,
    following: 540,
    verified: false,
    location: "Rabat",
    languages: ["fr", "en"],
    topics: ["Strategy", "Consulting", "Public Sector"],
    reachScore: 34, engagementScore: 53, authorityScore: 76,
  },
  {
    name: "Mehdi Alaoui",
    handle: "mehdialaoui",
    platform: "linkedin",
    bio: "Founder and CEO of PayZone. Moroccan fintech payments entrepreneur.",
    followers: 24000,
    following: 410,
    verified: false,
    location: "Casablanca",
    languages: ["fr", "en"],
    topics: ["Fintech", "Payments", "Entrepreneurship"],
    reachScore: 30, engagementScore: 65, authorityScore: 70,
  },
  {
    name: "Othman El Ferdaoussi",
    handle: "othmanelferdaoussi",
    platform: "linkedin",
    bio: "Corporate partner at a leading Moroccan law firm. M&A and capital markets counsel.",
    followers: 22000,
    following: 380,
    verified: false,
    location: "Casablanca",
    languages: ["fr", "en"],
    topics: ["M&A", "Law", "Capital Markets"],
    reachScore: 28, engagementScore: 47, authorityScore: 80,
  },
  {
    name: "Yasmine Tahiri",
    handle: "yasminetahiri",
    platform: "linkedin",
    bio: "Head of communications at OCP Group. Corporate reputation and ESG narratives.",
    followers: 31000,
    following: 720,
    verified: true,
    location: "Rabat",
    languages: ["fr", "en", "ar"],
    topics: ["Comms", "ESG", "Corporate"],
    reachScore: 36, engagementScore: 54, authorityScore: 78,
  },

  // ── YOUTUBE (8) — Moroccan business / tech creators ────────────
  {
    name: "Amine Gouzrou",
    handle: "@AmineGouzrou",
    platform: "youtube",
    bio: "Moroccan tech YouTuber. Reviews of consumer electronics, startups and digital trends.",
    followers: 138000,
    following: 0,
    verified: true,
    location: "Casablanca",
    languages: ["ar", "fr"],
    topics: ["Tech", "Reviews", "Digital"],
    reachScore: 64, engagementScore: 72, authorityScore: 56,
  },
  {
    name: "Youssef Slassi",
    handle: "@YoussefSlassi",
    platform: "youtube",
    bio: "Business and personal finance channel. Moroccan market commentary and investing basics.",
    followers: 96000,
    following: 0,
    verified: false,
    location: "Casablanca",
    languages: ["ar"],
    topics: ["Finance", "Investing", "Business"],
    reachScore: 58, engagementScore: 70, authorityScore: 50,
  },
  {
    name: "Karim Ben Salah",
    handle: "@KarimBenSalah",
    platform: "youtube",
    bio: "Economic analysis channel. Weekly deep dives on Moroccan macroeconomics and policy.",
    followers: 71000,
    following: 0,
    verified: false,
    location: "Rabat",
    languages: ["fr", "ar"],
    topics: ["Economy", "Macro", "Policy"],
    reachScore: 52, engagementScore: 66, authorityScore: 60,
  },
  {
    name: "Salim Berrada",
    handle: "@SalimBerrada",
    platform: "youtube",
    bio: "Startup news channel. Interviews with Moroccan founders and ecosystem coverage.",
    followers: 58000,
    following: 0,
    verified: false,
    location: "Casablanca",
    languages: ["fr", "en"],
    topics: ["Startups", "Founders", "Ecosystem"],
    reachScore: 48, engagementScore: 74, authorityScore: 58,
  },
  {
    name: "Hicham Rguig",
    handle: "@HichamRguig",
    platform: "youtube",
    bio: "Tech reviews and entrepreneurship. Long-form interviews with Moroccan operators.",
    followers: 49000,
    following: 0,
    verified: false,
    location: "Rabat",
    languages: ["ar", "fr"],
    topics: ["Tech", "Entrepreneurship", "Reviews"],
    reachScore: 44, engagementScore: 71, authorityScore: 50,
  },
  {
    name: "Mehdi Tazi",
    handle: "@MehdiTazi",
    platform: "youtube",
    bio: "Entrepreneur channel. Documentaries on Moroccan family businesses and SMEs.",
    followers: 67000,
    following: 0,
    verified: false,
    location: "Casablanca",
    languages: ["fr", "ar"],
    topics: ["Business", "SME", "Documentaries"],
    reachScore: 50, engagementScore: 65, authorityScore: 56,
  },
  {
    name: "Anas Sefiani",
    handle: "@AnasSefiani",
    platform: "youtube",
    bio: "Finance and economy explained. Educational content on Moroccan banking and markets.",
    followers: 82000,
    following: 0,
    verified: false,
    location: "Fes",
    languages: ["ar"],
    topics: ["Finance", "Banking", "Education"],
    reachScore: 55, engagementScore: 73, authorityScore: 54,
  },
  {
    name: "Yassine Benmoussa",
    handle: "@YBenmoussa",
    platform: "youtube",
    bio: "Financial literacy channel. Budgeting, saving and investing for Moroccan audiences.",
    followers: 113000,
    following: 0,
    verified: true,
    location: "Casablanca",
    languages: ["ar", "fr"],
    topics: ["Financial Literacy", "Investing", "Education"],
    reachScore: 60, engagementScore: 75, authorityScore: 52,
  },

  // ── TIKTOK (4) — short-form finance / business ─────────────────
  {
    name: "Soukaina Idrissi",
    handle: "@soukaina.idrissi",
    platform: "tiktok",
    bio: "Finance TikTok creator. Personal finance, saving and investing tips for Gen-Z Moroccans.",
    followers: 215000,
    following: 180,
    verified: true,
    location: "Casablanca",
    languages: ["ar", "fr"],
    topics: ["Personal Finance", "Investing", "Gen-Z"],
    reachScore: 72, engagementScore: 84, authorityScore: 48,
  },
  {
    name: "Othmane Marrakh",
    handle: "@othmane.marrakh",
    platform: "tiktok",
    bio: "Startup and tech TikTok. Bite-sized explainers on Moroccan entrepreneurship.",
    followers: 164000,
    following: 220,
    verified: false,
    location: "Rabat",
    languages: ["ar", "fr", "en"],
    topics: ["Startups", "Tech", "Gen-Z"],
    reachScore: 66, engagementScore: 81, authorityScore: 50,
  },
  {
    name: "Leila Benali",
    handle: "@leila.benali",
    platform: "tiktok",
    bio: "Economics TikTok. Explains monetary policy and inflation to Moroccan audiences.",
    followers: 98000,
    following: 140,
    verified: false,
    location: "Casablanca",
    languages: ["ar", "fr"],
    topics: ["Economy", "Inflation", "Education"],
    reachScore: 58, engagementScore: 78, authorityScore: 54,
  },
  {
    name: "Anas El Fassi",
    handle: "@anas.elfassi",
    platform: "tiktok",
    bio: "Business commentary TikTok. Reacts to Moroccan corporate news and earnings.",
    followers: 76000,
    following: 95,
    verified: false,
    location: "Marrakech",
    languages: ["ar", "fr"],
    topics: ["Business", "Earnings", "Markets"],
    reachScore: 53, engagementScore: 76, authorityScore: 48,
  },

  // ── INSTAGRAM (3) — business lifestyle creators ────────────────
  {
    name: "Aya El Haddioui",
    handle: "@aya.elhaddioui",
    platform: "instagram",
    bio: "Corporate lifestyle creator. Casablanca finance scene and women-in-business content.",
    followers: 142000,
    following: 540,
    verified: true,
    location: "Casablanca",
    languages: ["fr", "ar", "en"],
    topics: ["Business", "Lifestyle", "Women"],
    reachScore: 64, engagementScore: 70, authorityScore: 52,
  },
  {
    name: "Oumaima Cherkaoui",
    handle: "@oumaima.cherkaoui",
    platform: "instagram",
    bio: "Corporate communications director. Behind-the-scenes of Moroccan boardrooms.",
    followers: 88000,
    following: 410,
    verified: false,
    location: "Rabat",
    languages: ["fr", "ar"],
    topics: ["Comms", "Corporate", "Lifestyle"],
    reachScore: 56, engagementScore: 66, authorityScore: 60,
  },
  {
    name: "Ghita Aithmansour",
    handle: "@ghita.aithmansour",
    platform: "instagram",
    bio: "Finance lifestyle creator. Investing basics and Casablanca business network content.",
    followers: 104000,
    following: 380,
    verified: false,
    location: "Casablanca",
    languages: ["fr", "ar", "en"],
    topics: ["Finance", "Lifestyle", "Investing"],
    reachScore: 60, engagementScore: 68, authorityScore: 50,
  },
];

// ─── Generate synthetic mention history for each influencer ─────
// Light realism: 0-8 mentions per influencer over the last 30 days,
// with sentiment skewed positive for analysts / niche creators,
// neutral for legacy press, mixed for political writers.

interface SeedMention {
  title: string;
  url: string | null;
  sentiment: "positive" | "neutral" | "negative";
  reach: number;
  daysAgo: number;
}

const MENTION_TEMPLATES: Record<Platform, string[]> = {
  press: [
    "Published investigation on Moroccan industry",
    "Editorial on government reform",
    "Op-ed on Casablanca finance",
    "Covered phosphate market developments",
    "Reported on parliamentary session",
    "Wrote profile of banking CEO",
    "Broke story on SME financing",
    "Analyzed Q2 corporate results",
  ],
  twitter: [
    "Thread on Moroccan startup funding",
    "Hot take on monetary policy",
    "Live commentary on BVC session",
    "Quoted on regulatory reform",
    "Viral thread on fintech",
    "Refuted market rumor",
    "Cited in industry newsletter",
    "Reply chain on economic data",
  ],
  linkedin: [
    "Published long-form on African markets",
    "Announced new mandate",
    "Shared quarterly insights",
    "Keynote at Casablanca conference",
    "Promoted portfolio company",
    "Commentary on sovereign rating",
    "Posted on SME ecosystem",
    "Recap of investor roadshow",
  ],
  youtube: [
    "Released documentary episode",
    "Interview with Moroccan founder",
    "Market recap video",
    "Tech review of new product",
    "Tutorial on investing basics",
    "Live Q&A with subscribers",
    "Reaction to earnings call",
    "Collaboration video",
  ],
  tiktok: [
    "Viral finance explainer",
    "Trending business reaction",
    "Day-in-the-life corporate post",
    "Money tip series",
    "Earnings reaction clip",
    "Startup pitch breakdown",
    "Debunked finance myth",
    "Q&A with followers",
  ],
  instagram: [
    "Behind-the-scenes boardroom post",
    "Conference speaker feature",
    "Career milestone announcement",
    "Industry event coverage",
    "Branded partnership content",
    "Networking recap",
    "Quote card from keynote",
    "Mentorship announcement",
  ],
};

function pickSentiment(influencer: SeedInfluencer, idx: number): "positive" | "neutral" | "negative" {
  // Press political writers — mixed sentiment
  if (influencer.platform === "press") {
    const cycle = ["neutral", "positive", "neutral", "negative", "neutral", "positive"];
    return cycle[idx % cycle.length] as "positive" | "neutral" | "negative";
  }
  // Twitter political — higher volatility
  if (influencer.platform === "twitter") {
    const cycle = ["neutral", "negative", "positive", "neutral", "negative", "positive"];
    return cycle[idx % cycle.length] as "positive" | "neutral" | "negative";
  }
  // LinkedIn / YouTube / TikTok / Instagram — mostly positive
  const cycle = ["positive", "neutral", "positive", "positive", "neutral", "positive"];
  return cycle[idx % cycle.length] as "positive" | "neutral" | "negative";
}

function mentionsFor(influencer: SeedInfluencer): SeedMention[] {
  const templates = MENTION_TEMPLATES[influencer.platform];
  // Authority-weighted count: senior press/journalists have more mentions
  const baseCount =
    influencer.platform === "press" ? 6 :
    influencer.platform === "twitter" ? 5 :
    influencer.platform === "linkedin" ? 4 :
    influencer.platform === "youtube" ? 5 :
    influencer.platform === "tiktok" ? 7 :
    4;
  const count = Math.max(0, baseCount + (influencer.authorityScore % 3) - 1);
  const out: SeedMention[] = [];
  for (let i = 0; i < count; i++) {
    const daysAgo = Math.min(29, i * Math.max(1, Math.floor(30 / (count + 1))) + (i % 3));
    out.push({
      title: templates[i % templates.length] ?? "Published content",
      url: null,
      sentiment: pickSentiment(influencer, i),
      reach: Math.round(influencer.followers * (0.05 + (i % 4) * 0.04)),
      daysAgo,
    });
  }
  return out.sort((a, b) => a.daysAgo - b.daysAgo);
}

// ─── Main ───────────────────────────────────────────────────────
async function main() {
  console.log(`\nSeeding ${SEED.length} Moroccan influencers…\n`);

  let created = 0;
  let updated = 0;
  let mentionsCreated = 0;

  for (const seed of SEED) {
    const influenceScore = composite(seed.reachScore, seed.engagementScore, seed.authorityScore);
    const lastAnalyzed = new Date();

    const result = await prisma.influencer.upsert({
      where: {
        id: `${seed.platform}-${seed.handle.replace(/^@/, "")}`,
      },
      update: {
        name: seed.name,
        handle: seed.handle,
        platform: seed.platform,
        bio: seed.bio,
        followers: seed.followers,
        following: seed.following,
        verified: seed.verified,
        location: seed.location,
        languages: JSON.stringify(seed.languages),
        topics: JSON.stringify(seed.topics),
        reachScore: seed.reachScore,
        engagementScore: seed.engagementScore,
        authorityScore: seed.authorityScore,
        influenceScore,
        lastAnalyzed,
      },
      create: {
        id: `${seed.platform}-${seed.handle.replace(/^@/, "")}`,
        name: seed.name,
        handle: seed.handle,
        platform: seed.platform,
        bio: seed.bio,
        followers: seed.followers,
        following: seed.following,
        verified: seed.verified,
        location: seed.location,
        languages: JSON.stringify(seed.languages),
        topics: JSON.stringify(seed.topics),
        reachScore: seed.reachScore,
        engagementScore: seed.engagementScore,
        authorityScore: seed.authorityScore,
        influenceScore,
        lastAnalyzed,
      },
    });

    if (result.createdAt.getTime() === result.updatedAt.getTime()) created++;
    else updated++;

    // Replace mention history (idempotent)
    await prisma.influencerMention.deleteMany({
      where: { influencerId: result.id },
    });

    const mentions = mentionsFor(seed);
    for (const m of mentions) {
      await prisma.influencerMention.create({
        data: {
          influencerId: result.id,
          title: m.title,
          url: m.url,
          sentiment: m.sentiment,
          reach: m.reach,
          publishedAt: new Date(Date.now() - m.daysAgo * 24 * 60 * 60 * 1000),
        },
      });
      mentionsCreated++;
    }

    console.log(
      `  ${result.platform.padEnd(10)} ${result.name.padEnd(28)} infl=${influenceScore.toString().padStart(3)}  mentions=${mentions.length}`,
    );
  }

  console.log(`\nDone. Created: ${created} · Updated: ${updated} · Mentions: ${mentionsCreated}`);
  console.log(`Total influencers in DB: ${await prisma.influencer.count()}`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
