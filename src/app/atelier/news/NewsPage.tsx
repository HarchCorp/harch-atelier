"use client";

import { useState, useMemo, useEffect } from "react";
import { AtelierNav } from "../components/AtelierNav";
import { AtelierFooter } from "../components/AtelierFooter";
import { ScrollProgress, CursorGlow, BackToTop } from "../components/shared";
import {
  BarChart,
  HorizontalBarChart,
  DonutChart,
  StatCard,
} from "../components/charts/Charts";

// ═══════════════════════════════════════════════════════════════
//  HARCH ATELIER — LIVE NEWS FEED (Signal AI style)
//  Real-time monitoring of 30+ Moroccan & African media sources
// ═══════════════════════════════════════════════════════════════

const C = {
  bg: "#FAFAFA", surface: "#FFFFFF", surfaceAlt: "#F4F4F5",
  border: "#E5E5E5", borderLight: "#F0F0F0",
  text: "#0A0A0A", textSec: "#525252", textMuted: "#71717A",
  accent: "#4A5D6E", accentBright: "#8B9DAF",
  sage: "#4A7B5F", sageBright: "#6FA386",
  red: "#A0524B", redBright: "#C77268",
  amber: "#B87333", amberBright: "#D49453",
  shadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
  shadowHover: "0 4px 16px rgba(74,93,110,0.12), 0 1px 3px rgba(0,0,0,0.06)",
};

type Sentiment = "positive" | "neutral" | "negative";
type Lang = "FR" | "AR" | "EN";

interface Article {
  id: number;
  title: string;
  summary: string;
  source: string;
  datetime: string; // ISO-like display string
  hoursAgo: number;
  lang: Lang;
  sentiment: Sentiment;
  sector: string;
  relevance: number; // 0-100
}

// ─── FILTER OPTIONS ─────────────────────────────────────────────
const SECTORS = ["All", "Banking", "Telecom", "Mining", "Aviation", "Retail", "Energy", "Agro-industry"];
const SENTIMENTS = ["All", "Positive", "Neutral", "Negative"];
const LANGS = ["All", "FR", "AR", "EN"];
const SOURCES = ["All", "TelQuel", "Medias24", "Hespress", "Financial Afrik", "Aujourd'hui Le Maroc", "Le Site Info", "Infomediaire", "Barlamane", "Africa News"];
const DATE_RANGES = ["Last 24h", "Last 7d", "Last 30d", "All"];

const SECTOR_OF: Record<string, string> = {
  "Banking": "Banking",
  "Telecom": "Telecom",
  "Mining": "Mining",
  "Aviation": "Aviation",
  "Retail": "Retail",
  "Energy": "Energy",
  "Agro-industry": "Agro-industry",
};

// ─── 36 REALISTIC MOROCCAN BUSINESS ARTICLES ────────────────────
const ARTICLES: Article[] = [
  { id: 1, title: "Bank of Africa announces record Q2 results with 12% profit growth", summary: "Bank of Africa reported a net income of MAD 1.84 billion for Q2 2025, up 12% year-on-year, driven by strong performance in retail banking and expansion across Sub-Saharan Africa. The bank confirmed its 2025 strategic roadmap remains on track.", source: "Financial Afrik", datetime: "2026-07-18 09:42", hoursAgo: 1, lang: "EN", sentiment: "positive", sector: SECTOR_OF.Banking, relevance: 96 },
  { id: 2, title: "OCP Group unveils $1.2B green ammonia plant in Jorf Lasfar", summary: "OCP Group inaugurated a green ammonia production facility at Jorf Lasfar, with a total investment of USD 1.2 billion. The plant aims to produce 1 million tonnes per year and reinforces Morocco's positioning in the green hydrogen value chain.", source: "Medias24", datetime: "2026-07-18 08:15", hoursAgo: 2, lang: "FR", sentiment: "positive", sector: SECTOR_OF.Mining, relevance: 94 },
  { id: 3, title: "Attijariwafa Bank launches new digital banking platform 'Attijari Pay'", summary: "Attijariwafa Bank officially launched Attijari Pay, a unified mobile banking platform targeting 4.5 million active users by end of 2026. The service integrates payments, transfers, and SME financing in a single interface.", source: "TelQuel", datetime: "2026-07-18 07:30", hoursAgo: 3, lang: "FR", sentiment: "positive", sector: SECTOR_OF.Banking, relevance: 91 },
  { id: 4, title: "Maroc Telecom rolls out 5G in Casablanca and Rabat", summary: "Maroc Telecom (IAM) activated its first commercial 5G sites in Casablanca and Rabat, covering key business districts. Full national rollout is planned in three phases through 2027, with MAD 8 billion in network investment.", source: "Aujourd'hui Le Maroc", datetime: "2026-07-18 06:50", hoursAgo: 4, lang: "FR", sentiment: "positive", sector: SECTOR_OF.Telecom, relevance: 89 },
  { id: 5, title: "Inwi leads positive sentiment among Moroccan telcos in Q2", summary: "According to Harch's sentiment index, Inwi captured 68% positive coverage in Q2 2025, ahead of Orange Maroc (61%) and Maroc Telecom (54%). Customer service improvements and 5G partnerships drove the perception uplift.", source: "Le Site Info", datetime: "2026-07-18 05:20", hoursAgo: 5, lang: "FR", sentiment: "positive", sector: SECTOR_OF.Telecom, relevance: 87 },
  { id: 6, title: "Royal Air Maroc announces three new routes to Asia", summary: "RAM will launch direct flights to Tokyo, Shanghai, and Singapore starting October 2025, using Boeing 787-9 Dreamliner aircraft. The expansion is part of the airline's 2024-2027 strategic plan to consolidate its African hub strategy.", source: "Africa News", datetime: "2026-07-18 04:10", hoursAgo: 6, lang: "EN", sentiment: "positive", sector: SECTOR_OF.Aviation, relevance: 85 },
  { id: 7, title: "Managem reports strong growth in gold production at Akka mine", summary: "Managem's gold output at the Akka mine rose 18% in H1 2025, supported by higher ore grades and process optimization. The company confirmed it is exploring two new deposits in the Anti-Atlas region.", source: "Financial Afrik", datetime: "2026-07-17 22:30", hoursAgo: 12, lang: "FR", sentiment: "positive", sector: SECTOR_OF.Mining, relevance: 83 },
  { id: 8, title: "LesieurCristal faces supply chain challenges on sunflower imports", summary: "LesieurCristal warned of temporary pressure on margins due to disruptions in sunflower oil imports from Eastern Europe. The company is diversifying suppliers and accelerating its local sourcing program.", source: "Infomediaire", datetime: "2026-07-17 20:15", hoursAgo: 14, lang: "FR", sentiment: "negative", sector: SECTOR_OF["Agro-industry"], relevance: 80 },
  { id: 9, title: "Cosumar launches new sugar product line for export markets", summary: "Cosumar introduced a premium refined sugar line targeting West African and European export markets. Initial production capacity is set at 120,000 tonnes per year, with first shipments expected in Q4 2025.", source: "Barlamane", datetime: "2026-07-17 18:45", hoursAgo: 16, lang: "FR", sentiment: "positive", sector: SECTOR_OF["Agro-industry"], relevance: 79 },
  { id: 10, title: "CIH Bank partners with Visa for SME digital card program", summary: "CIH Bank and Visa announced a co-branded digital card program for Moroccan SMEs, offering instant issuance and integrated spend analytics. The pilot will onboard 5,000 businesses before year-end.", source: "TelQuel", datetime: "2026-07-17 17:20", hoursAgo: 17, lang: "FR", sentiment: "positive", sector: SECTOR_OF.Banking, relevance: 78 },
  { id: 11, title: "Nareva commences construction on 230MW wind farm near Essaouira", summary: "Nareva Renewables began construction of the 230MW Tazoud wind farm, part of the 1GW wind program under the Kingdom's energy strategy. Commissioning is planned for late 2026.", source: "Medias24", datetime: "2026-07-17 16:00", hoursAgo: 18, lang: "FR", sentiment: "positive", sector: SECTOR_OF.Energy, relevance: 84 },
  { id: 12, title: "Marjane Group opens two new hypermarkets in northern Morocco", summary: "Marjane Group inaugurated two new hypermarkets in Tetouan and Al Hoceima, bringing its national network to 45 stores. The retailer expects 600 new direct jobs from the expansion.", source: "Aujourd'hui Le Maroc", datetime: "2026-07-17 14:30", hoursAgo: 20, lang: "FR", sentiment: "positive", sector: SECTOR_OF.Retail, relevance: 76 },
  { id: 13, title: "BMCE Bank of Africa extends African footprint with new subsidiary in Mozambique", summary: "BMCE Bank of Africa received regulatory approval to open a subsidiary in Maputo, marking its 33rd country of presence in Africa. The bank targets corporate and trade finance clients active in the SADC region.", source: "Financial Afrik", datetime: "2026-07-17 11:50", hoursAgo: 22, lang: "EN", sentiment: "positive", sector: SECTOR_OF.Banking, relevance: 82 },
  { id: 14, title: "OCP Africa signs fertilizer supply agreement with Nigeria", summary: "OCP Africa signed a 5-year fertilizer supply agreement with the Nigerian government worth USD 600 million, covering 1.2 million tonnes of blended fertilizer for local farmers.", source: "Africa News", datetime: "2026-07-17 10:15", hoursAgo: 23, lang: "EN", sentiment: "positive", sector: SECTOR_OF.Mining, relevance: 88 },
  { id: 15, title: "Hespress survey: 71% of readers optimistic on Moroccan economy", summary: "An online Hespress poll of 12,400 readers found 71% optimistic about Morocco's economic outlook for the next 12 months, with tourism, agriculture, and renewable energy cited as key growth drivers.", source: "Hespress", datetime: "2026-07-17 09:00", hoursAgo: 25, lang: "EN", sentiment: "positive", sector: SECTOR_OF.Retail, relevance: 70 },
  { id: 16, title: "Centrale Danone reports stable H1 revenue despite input cost pressure", summary: "Centrale Danone posted H1 2025 revenue of MAD 4.2 billion, broadly flat year-on-year, as price increases offset softer volume growth in dairy. Management reaffirmed full-year guidance.", source: "Infomediaire", datetime: "2026-07-16 22:40", hoursAgo: 36, lang: "FR", sentiment: "neutral", sector: SECTOR_OF["Agro-industry"], relevance: 74 },
  { id: 17, title: "Royal Air Maroc to join oneworld partnership program", summary: "RAM finalized its accession to the oneworld alliance, effective September 2025, granting passengers access to 1,000+ destinations and shared lounges across 14 member airlines.", source: "TelQuel", datetime: "2026-07-16 20:10", hoursAgo: 38, lang: "FR", sentiment: "positive", sector: SECTOR_OF.Aviation, relevance: 81 },
  { id: 18, title: "Holmarcom Finance Group completes acquisition of majority stake in Saham Insurance", summary: "Holmarcom Finance Group finalized the acquisition of a 65% stake in Saham Insurance, creating the largest insurance platform in Morocco with a combined gross written premium of MAD 11 billion.", source: "Medias24", datetime: "2026-07-16 18:25", hoursAgo: 40, lang: "FR", sentiment: "positive", sector: SECTOR_OF.Banking, relevance: 86 },
  { id: 19, title: "Renault Morocco exports 200,000th vehicle from Tangier plant", summary: "Renault's Tangier plant crossed the 200,000 vehicle export milestone for 2025, with Dacia Sandero and Sandero Stepway the top models. The plant now supplies 38 markets across Europe and Africa.", source: "Aujourd'hui Le Maroc", datetime: "2026-07-16 16:00", hoursAgo: 42, lang: "FR", sentiment: "positive", sector: SECTOR_OF.Retail, relevance: 77 },
  { id: 20, title: "Inwi extends fiber network to 1.4 million homes in 12 cities", summary: "Inwi announced its FTTH network now passes 1.4 million homes across 12 Moroccan cities, with 380,000 active subscribers. The operator plans to reach 2 million homes passed by mid-2026.", source: "Le Site Info", datetime: "2026-07-16 14:20", hoursAgo: 44, lang: "FR", sentiment: "positive", sector: SECTOR_OF.Telecom, relevance: 79 },
  { id: 21, title: "CDG Capital Real Estate launches MAD 3B mixed-use project in Rabat", summary: "CDG Capital Real Estate broke ground on the Hay Riad Garden mixed-use development, a MAD 3 billion project combining residential, retail, and office space over 18 hectares, with first delivery in 2028.", source: "Barlamane", datetime: "2026-07-16 11:30", hoursAgo: 47, lang: "FR", sentiment: "neutral", sector: SECTOR_OF.Retail, relevance: 72 },
  { id: 22, title: "ONEE signs power purchase agreement for 120MW solar plant near Ouarzazate", summary: "The National Office for Electricity and Drinking Water (ONEE) signed a 25-year PPA with a consortium led by ACWA Power for the 120MW Ouarzazate IV solar plant, at a record-low tariff of MAD 0.68/kWh.", source: "Infomediaire", datetime: "2026-07-16 09:45", hoursAgo: 49, lang: "FR", sentiment: "positive", sector: SECTOR_OF.Energy, relevance: 83 },
  { id: 23, title: "Air Arabia Maroc adds Marrakech-Lyon seasonal route", summary: "Air Arabia Maroc announced a new seasonal route connecting Marrakech to Lyon, operating twice weekly from October 2025 to March 2026, responding to strong demand from the French Moroccan diaspora.", source: "Africa News", datetime: "2026-07-15 22:00", hoursAgo: 61, lang: "EN", sentiment: "neutral", sector: SECTOR_OF.Aviation, relevance: 68 },
  { id: 24, title: "Bank Al-Maghrib maintains key rate at 2.75% amid contained inflation", summary: "Bank Al-Maghrib's Board voted to maintain the benchmark rate at 2.75%, citing contained inflation (1.8% y/y in June) and steady economic growth projected at 3.6% for 2025.", source: "Medias24", datetime: "2026-07-15 19:30", hoursAgo: 63, lang: "FR", sentiment: "neutral", sector: SECTOR_OF.Banking, relevance: 80 },
  { id: 25, title: "OCP Group and Fertiglobe sign green ammonia offtake agreement", summary: "OCP Group signed a long-term offtake agreement with Fertiglobe for 500,000 tonnes/year of green ammonia from Jorf Lasfar, marking one of the largest green ammonia contracts in Africa.", source: "Financial Afrik", datetime: "2026-07-15 17:10", hoursAgo: 65, lang: "EN", sentiment: "positive", sector: SECTOR_OF.Mining, relevance: 90 },
  { id: 26, title: "Maroc Telecom Q2 revenue up 3.2% on data and mobile money growth", summary: "Maroc Telecom reported Q2 2025 revenue of MAD 7.4 billion, up 3.2%, with mobile data revenue rising 11% and Mobile Money transactions up 28%. International subsidiaries contributed 38% of group revenue.", source: "TelQuel", datetime: "2026-07-15 15:00", hoursAgo: 67, lang: "FR", sentiment: "positive", sector: SECTOR_OF.Telecom, relevance: 85 },
  { id: 27, title: "Ciment du Maroc warns on H2 margin pressure from energy costs", summary: "Ciment du Maroc flagged pressure on H2 margins from rising petcoke and electricity costs, partially offset by efficiency gains. The company expects domestic cement demand to grow 2-3% in 2025.", source: "Le Site Info", datetime: "2026-07-15 12:20", hoursAgo: 70, lang: "FR", sentiment: "negative", sector: SECTOR_OF.Energy, relevance: 75 },
  { id: 28, title: "Lydec improves Casablanca water distribution efficiency to 78%", summary: "Lydec reported a 6-point improvement in water distribution efficiency in Casablanca, reaching 78%, following an aggressive leak-detection and pipe-renewal program. The utility targets 82% efficiency by 2027.", source: "Aujourd'hui Le Maroc", datetime: "2026-07-15 10:00", hoursAgo: 72, lang: "FR", sentiment: "positive", sector: SECTOR_OF.Energy, relevance: 73 },
  { id: 29, title: "Auto Hall posts 9% rise in H1 vehicle sales led by Ford and Hyundai", summary: "Auto Hall, the Moroccan automotive distributor, reported a 9% increase in H1 2025 vehicle sales, driven by strong demand for Ford pickups and Hyundai passenger cars. The company expects full-year growth of 7-8%.", source: "Infomediaire", datetime: "2026-07-14 22:15", hoursAgo: 84, lang: "FR", sentiment: "positive", sector: SECTOR_OF.Retail, relevance: 71 },
  { id: 30, title: "AFD grants EUR 200M loan to Morocco for green transition", summary: "The French Development Agency (AFD) signed a EUR 200 million budget-support loan with Morocco to accelerate its green transition, focused on renewable energy, energy efficiency, and sustainable agriculture.", source: "Barlamane", datetime: "2026-07-14 19:40", hoursAgo: 87, lang: "FR", sentiment: "positive", sector: SECTOR_OF.Energy, relevance: 78 },
  { id: 31, title: "Attijariwafa Bank Africa records 14% loan growth in H1", summary: "Attijariwafa Bank's African subsidiaries (ex-Morocco) posted 14% loan growth in H1 2025, with strong contributions from Côte d'Ivoire, Senegal, and Egypt. Net banking income from Africa now represents 39% of the group total.", source: "Financial Afrik", datetime: "2026-07-14 17:00", hoursAgo: 89, lang: "FR", sentiment: "positive", sector: SECTOR_OF.Banking, relevance: 86 },
  { id: 32, title: "Morocco tourism revenue hits MAD 56B in H1, up 17%", summary: "Morocco's tourism revenue reached MAD 56 billion in H1 2025, a 17% increase year-on-year, supported by record arrivals from France, Spain, and the UK. The tourism ministry confirmed its full-year target of 17.5 million tourists.", source: "Hespress", datetime: "2026-07-14 14:30", hoursAgo: 92, lang: "EN", sentiment: "positive", sector: SECTOR_OF.Retail, relevance: 82 },
  { id: 33, title: "Managem seals copper partnership with Zambian mining authority", summary: "Managem signed a partnership with the Zambian Mining Cadastre to explore copper deposits in the Copperbelt province, marking its first brownfield expansion outside Morocco and Côte d'Ivoire.", source: "Africa News", datetime: "2026-07-14 11:00", hoursAgo: 95, lang: "EN", sentiment: "positive", sector: SECTOR_OF.Mining, relevance: 80 },
  { id: 34, title: "Inwi and Huawei trial 5G fixed wireless access in Tangier", summary: "Inwi and Huawei conducted a successful 5G Fixed Wireless Access trial in Tangier, achieving peak throughput of 1.2 Gbps over a 7 km cell radius. Commercial launch is targeted for Q1 2026 in three Moroccan cities.", source: "Le Site Info", datetime: "2026-07-13 22:50", hoursAgo: 107, lang: "FR", sentiment: "positive", sector: SECTOR_OF.Telecom, relevance: 84 },
  { id: 35, title: "Cosumar signs strategic beet supply contracts with 4,200 farmers", summary: "Cosumar signed multi-year beet supply contracts with 4,200 farmers across the Gharb and Tadla plains, covering 52,000 hectares and securing 70% of the company's beet requirements through 2028.", source: "Aujourd'hui Le Maroc", datetime: "2026-07-13 19:15", hoursAgo: 111, lang: "FR", sentiment: "positive", sector: SECTOR_OF["Agro-industry"], relevance: 76 },
  { id: 36, title: "Royal Air Maroc takes delivery of first Boeing 737 MAX 8", summary: "RAM took delivery of its first Boeing 737 MAX 8 from a 2014 order, as part of its fleet renewal program. The aircraft will be deployed on medium-haul European and African routes from August.", source: "TelQuel", datetime: "2026-07-13 16:30", hoursAgo: 113, lang: "FR", sentiment: "positive", sector: SECTOR_OF.Aviation, relevance: 78 },
];

// ─── ARTICLES PER HOUR (last 24h) ──────────────────────────────
const ARTICLES_PER_HOUR = [
  { label: "00", value: 18 }, { label: "01", value: 12 }, { label: "02", value: 8 },
  { label: "03", value: 6 },  { label: "04", value: 9 },  { label: "05", value: 14 },
  { label: "06", value: 28 }, { label: "07", value: 42 }, { label: "08", value: 58 },
  { label: "09", value: 71 }, { label: "10", value: 64 }, { label: "11", value: 55 },
  { label: "12", value: 49 }, { label: "13", value: 53 }, { label: "14", value: 61 },
  { label: "15", value: 68 }, { label: "16", value: 72 }, { label: "17", value: 67 },
  { label: "18", value: 59 }, { label: "19", value: 51 }, { label: "20", value: 44 },
  { label: "21", value: 38 }, { label: "22", value: 31 }, { label: "23", value: 24 },
];

// ─── TOP SOURCES BY ARTICLE COUNT TODAY ─────────────────────────
const TOP_SOURCES = [
  { label: "TelQuel", value: 187, sublabel: "FR · daily", color: C.sage },
  { label: "Medias24", value: 162, sublabel: "FR · daily", color: C.accent },
  { label: "Hespress", value: 148, sublabel: "AR · daily", color: C.amber },
  { label: "Financial Afrik", value: 134, sublabel: "FR · daily", color: C.sage },
  { label: "Aujourd'hui Le Maroc", value: 121, sublabel: "FR · daily", color: C.accent },
  { label: "Le Site Info", value: 98, sublabel: "FR · daily", color: C.red },
  { label: "Infomediaire", value: 87, sublabel: "FR · weekly", color: C.sage },
  { label: "Barlamane", value: 76, sublabel: "FR · daily", color: C.amber },
  { label: "Africa News", value: 64, sublabel: "EN · daily", color: C.accent },
  { label: "L'Économiste", value: 51, sublabel: "FR · daily", color: C.red },
];

// ─── SENTIMENT HELPERS ──────────────────────────────────────────
const SENTIMENT_COLORS: Record<Sentiment, string> = {
  positive: C.sage,
  neutral: C.accent,
  negative: C.red,
};
const SENTIMENT_BG: Record<Sentiment, string> = {
  positive: "rgba(74,123,95,0.10)",
  neutral: "rgba(74,93,110,0.10)",
  negative: "rgba(160,82,75,0.10)",
};
const LANG_COLORS: Record<Lang, string> = {
  FR: C.accent,
  AR: C.amber,
  EN: C.sage,
};

// ═══════════════════════════════════════════════════════════════
//  PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function NewsPage() {
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("All");
  const [sentiment, setSentiment] = useState("All");
  const [lang, setLang] = useState("All");
  const [source, setSource] = useState("All");
  const [dateRange, setDateRange] = useState("Last 24h");
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimateIn(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Inject pulse keyframes once
  useEffect(() => {
    if (document.getElementById("news-pulse-style")) return;
    const s = document.createElement("style");
    s.id = "news-pulse-style";
    s.textContent = `
      @keyframes newsPulse {
        0% { transform: scale(0.95); opacity: 0.7; }
        70% { transform: scale(1.6); opacity: 0; }
        100% { transform: scale(1.6); opacity: 0; }
      }
      @keyframes newsPulseDot {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }
      @keyframes newsFadeUp {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(s);
  }, []);

  // Compute date cutoff (hours)
  const dateCutoffHours = useMemo(() => {
    switch (dateRange) {
      case "Last 24h": return 24;
      case "Last 7d": return 24 * 7;
      case "Last 30d": return 24 * 30;
      default: return Infinity;
    }
  }, [dateRange]);

  // Filtered articles
  const filtered = useMemo(() => {
    return ARTICLES.filter((a) => {
      if (sector !== "All" && a.sector !== sector) return false;
      if (sentiment !== "All" && a.sentiment.toLowerCase() !== sentiment.toLowerCase()) return false;
      if (lang !== "All" && a.lang !== lang) return false;
      if (source !== "All" && a.source !== source) return false;
      if (a.hoursAgo > dateCutoffHours) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        if (
          !a.title.toLowerCase().includes(q) &&
          !a.summary.toLowerCase().includes(q) &&
          !a.source.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [query, sector, sentiment, lang, source, dateCutoffHours]);

  // Live counts derived from filtered set
  const positiveCount = filtered.filter(a => a.sentiment === "positive").length;
  const neutralCount = filtered.filter(a => a.sentiment === "neutral").length;
  const negativeCount = filtered.filter(a => a.sentiment === "negative").length;
  const positivePct = filtered.length ? Math.round((positiveCount / filtered.length) * 100) : 0;

  // Sentiment donut data
  const sentimentData = [
    { label: "Positive", value: positiveCount, color: C.sage },
    { label: "Neutral", value: neutralCount, color: C.accent },
    { label: "Negative", value: negativeCount, color: C.red },
  ];

  // Sector filters
  const resetFilters = () => {
    setQuery(""); setSector("All"); setSentiment("All");
    setLang("All"); setSource("All"); setDateRange("Last 24h");
  };

  const hasActiveFilters =
    query || sector !== "All" || sentiment !== "All" || lang !== "All" || source !== "All" || dateRange !== "Last 24h";

  // ─── Select component ────────────────────────────────────────
  const Select = ({
    label, value, options, onChange,
  }: {
    label: string;
    value: string;
    options: string[];
    onChange: (v: string) => void;
  }) => (
    <label style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
      <span style={{
        fontSize: "10px", color: C.textMuted,
        fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: "0.08em", textTransform: "uppercase",
      }}>
        {label}
      </span>
      <div style={{ position: "relative" }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%", appearance: "none", WebkitAppearance: "none",
            padding: "10px 32px 10px 12px",
            background: C.surface, color: C.text,
            border: `1px solid ${C.border}`, borderRadius: "6px",
            fontSize: "13px", fontFamily: "'Inter', sans-serif",
            cursor: "pointer", fontWeight: 500,
          }}
        >
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <span style={{
          position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
          fontSize: "10px", color: C.textMuted, pointerEvents: "none",
        }}>▼</span>
      </div>
    </label>
  );

  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <AtelierNav />

      {/* ═══ HERO ═══════════════════════════════════════════════ */}
      <section style={{
        background: `linear-gradient(180deg, ${C.surface} 0%, ${C.bg} 100%)`,
        borderBottom: `1px solid ${C.border}`,
        padding: "100px 32px 72px",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px" }}>
          {/* Live badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            padding: "6px 14px", background: C.surface,
            border: `1px solid ${C.border}`, borderRadius: "100px",
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            color: C.sage, letterSpacing: "0.14em", textTransform: "uppercase",
            marginBottom: "24px",
          }}>
            <span style={{ position: "relative", display: "inline-block", width: "8px", height: "8px" }}>
              <span style={{
                position: "absolute", inset: 0, borderRadius: "50%", background: C.sage,
                animation: "newsPulseDot 1.6s ease-in-out infinite",
              }} />
              <span style={{
                position: "absolute", inset: 0, borderRadius: "50%", background: C.sage,
                animation: "newsPulse 2s ease-out infinite",
              }} />
            </span>
            Live News Feed · Real-time monitoring
          </div>

          <h1 style={{
            fontSize: "clamp(32px, 8vw, 48px)", fontWeight: 800,
            letterSpacing: "-0.04em", lineHeight: 1.02, color: C.text,
            margin: "0 0 24px", maxWidth: "1000px",
            opacity: animateIn ? 1 : 0,
            transform: animateIn ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}>
            Live News Feed across<br />
            <span style={{
              background: `linear-gradient(90deg, ${C.sage} 0%, ${C.sageBright} 100%)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>Moroccan &amp; African media.</span>
          </h1>

          <p style={{
            fontSize: "16px", color: C.textSec, lineHeight: 1.55,
            maxWidth: "780px", marginBottom: "40px",
            opacity: animateIn ? 1 : 0,
            transition: "opacity 0.6s ease 0.1s",
          }}>
            Real-time monitoring of 30+ Moroccan and African media sources in French, Arabic, and English.
            AI-classified sentiment, sector tagging, and relevance scoring on every article. Updated every 5 minutes.
          </p>

          {/* Stats row */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px", maxWidth: "1100px",
          }}>
            <StatCard
              value="36"
              label="Articles indexed today"
              sublabel="1,247 across universe"
              color={C.text}
              trend={{ direction: "up", value: "+96" }}
              sparklineData={[18, 22, 28, 24, 35, 42, 51, 48, 55, 67, 72, 68]}
            />
            <StatCard
              value="83%"
              label="Positive sentiment share"
              sublabel="68% universe avg"
              color={C.sage}
              trend={{ direction: "up", value: "+3 pts" }}
              sparklineData={[58, 61, 60, 63, 62, 65, 64, 66, 65, 67, 68, 68]}
            />
            <StatCard
              value="12"
              label="Active alerts triggered"
              sublabel="On tracked entities"
              color={C.amber}
              trend={{ direction: "down", value: "-2" }}
              sparklineData={[18, 16, 17, 15, 14, 16, 13, 14, 13, 12, 13, 12]}
            />
            <StatCard
              value="9"
              label="Media sources shown"
              sublabel="30+ across universe"
              color={C.accent}
              sparklineData={[22, 24, 25, 26, 28, 28, 29, 30, 30, 31, 31, 32]}
            />
          </div>
        </div>
      </section>

      {/* ═══ STICKY FILTER BAR ═══════════════════════════════════ */}
      <div style={{
        position: "sticky", top: 0, zIndex: 30,
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{
          maxWidth: "1200px", margin: "0 auto", padding: "16px 32px",
          display: "grid",
          gridTemplateColumns: "minmax(200px, 2fr) repeat(5, minmax(120px, 1fr))",
          gap: "12px", alignItems: "end",
        }}>
          {/* Search */}
          <label style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
            <span style={{
              fontSize: "10px", color: C.textMuted,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.08em", textTransform: "uppercase",
            }}>Search</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search titles, sources…"
              style={{
                width: "100%", padding: "10px 12px",
                background: C.surface, color: C.text,
                border: `1px solid ${C.border}`, borderRadius: "6px",
                fontSize: "13px", fontFamily: "'Inter', sans-serif",
              }}
            />
          </label>
          <Select label="Sector" value={sector} options={SECTORS} onChange={setSector} />
          <Select label="Sentiment" value={sentiment} options={SENTIMENTS} onChange={setSentiment} />
          <Select label="Language" value={lang} options={LANGS} onChange={setLang} />
          <Select label="Source" value={source} options={SOURCES} onChange={setSource} />
          <Select label="Date range" value={dateRange} options={DATE_RANGES} onChange={setDateRange} />
        </div>
      </div>

      {/* ═══ CHARTS GRID ════════════════════════════════════════ */}
      <section style={{
        padding: "40px 32px 24px",
        background: C.bg,
      }}>
        <div style={{
          maxWidth: "1200px", margin: "0 auto", padding: "0 16px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "20px",
        }}>
          {/* Sentiment distribution donut */}
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: "12px", padding: "28px",
            boxShadow: C.shadow,
          }}>
            <div style={{
              fontSize: "11px", color: C.textMuted,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.1em", textTransform: "uppercase",
              marginBottom: "6px",
            }}>01 · Sentiment distribution</div>
            <h3 style={{
              fontSize: "18px", fontWeight: 700, color: C.text,
              margin: "0 0 24px", letterSpacing: "-0.01em",
            }}>Across FR · AR · EN coverage</h3>
            <DonutChart
              data={sentimentData}
              size={180}
              thickness={26}
              centerValue={`${positivePct}%`}
              centerLabel="Positive"
            />
            <div style={{
              marginTop: "20px", paddingTop: "16px",
              borderTop: `1px solid ${C.borderLight}`,
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "12px",
            }}>
              {[
                { label: "Positive", val: positiveCount, color: C.sage },
                { label: "Neutral", val: neutralCount, color: C.accent },
                { label: "Negative", val: negativeCount, color: C.red },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{
                    fontSize: "22px", fontWeight: 800, color: s.color,
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: "-0.02em", lineHeight: 1,
                  }}>{s.val}</div>
                  <div style={{
                    fontSize: "10px", color: C.textMuted,
                    fontFamily: "'JetBrains Mono', monospace",
                    textTransform: "uppercase", letterSpacing: "0.08em",
                    marginTop: "4px",
                  }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Articles per hour bar chart */}
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: "12px", padding: "28px",
            boxShadow: C.shadow,
            gridColumn: "span 2",
          }}>
            <div style={{
              fontSize: "11px", color: C.textMuted,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.1em", textTransform: "uppercase",
              marginBottom: "6px",
            }}>02 · Article volume</div>
            <h3 style={{
              fontSize: "18px", fontWeight: 700, color: C.text,
              margin: "0 0 8px", letterSpacing: "-0.01em",
            }}>Articles indexed per hour (last 24h)</h3>
            <p style={{
              fontSize: "12px", color: C.textMuted,
              fontFamily: "'JetBrains Mono', monospace",
              margin: "0 0 24px",
            }}>Peak at 16:00 · 72 articles · rolling 5-min refresh</p>
            <div style={{ overflowX: "auto" }}>
              <div style={{ minWidth: "560px" }}>
                <BarChart
                  data={ARTICLES_PER_HOUR.map((h, i) => ({
                    ...h,
                    color: i === 16 ? C.amber : (h.value >= 50 ? C.sage : C.sageBright),
                  }))}
                  height={240}
                  showValues={false}
                  color={C.sage}
                />
              </div>
            </div>
            <div style={{
              display: "flex", gap: "20px", marginTop: "20px",
              paddingTop: "16px", borderTop: `1px solid ${C.borderLight}`,
              fontSize: "11px", color: C.textSec,
              fontFamily: "'JetBrains Mono', monospace",
              flexWrap: "wrap",
            }}>
              <span><strong style={{ color: C.text }}>1,002</strong> total</span>
              <span>·</span>
              <span><strong style={{ color: C.text }}>42</strong> avg / hour</span>
              <span>·</span>
              <span><strong style={{ color: C.text }}>72</strong> peak (16:00)</span>
              <span>·</span>
              <span><strong style={{ color: C.text }}>6</strong> low (03:00)</span>
            </div>
          </div>
        </div>

        {/* Top sources horizontal bar */}
        <div style={{
          maxWidth: "1200px", margin: "20px auto 0",
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: "12px", padding: "28px",
          boxShadow: C.shadow,
        }}>
          <div style={{
            fontSize: "11px", color: C.textMuted,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.1em", textTransform: "uppercase",
            marginBottom: "6px",
          }}>03 · Source leaderboard</div>
          <h3 style={{
            fontSize: "18px", fontWeight: 700, color: C.text,
            margin: "0 0 24px", letterSpacing: "-0.01em",
          }}>Top 10 sources by article count today</h3>
          <HorizontalBarChart data={TOP_SOURCES} color={C.sage} />
        </div>
      </section>

      {/* ═══ ARTICLE FEED ═══════════════════════════════════════ */}
      <section style={{
        padding: "48px 32px 80px",
        background: C.bg,
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px" }}>
          {/* Feed header */}
          <div style={{
            display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "24px",
          }}>
            <div>
              <div style={{
                fontSize: "11px", color: C.textMuted,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.1em", textTransform: "uppercase",
                marginBottom: "6px",
              }}>04 · Article feed</div>
              <h2 style={{
                fontSize: "28px", fontWeight: 700, color: C.text,
                margin: 0, letterSpacing: "-0.02em",
              }}>
                {filtered.length} article{filtered.length !== 1 ? "s" : ""} matching your filters
              </h2>
            </div>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                style={{
                  padding: "8px 14px", background: C.surface,
                  color: C.textSec, border: `1px solid ${C.border}`,
                  borderRadius: "6px", fontSize: "12px",
                  fontFamily: "'JetBrains Mono', monospace",
                  cursor: "pointer", fontWeight: 500,
                }}
              >
                ✕ Reset filters
              </button>
            )}
          </div>

          {/* Article list */}
          {filtered.length === 0 ? (
            <div style={{
              padding: "48px 16px", textAlign: "center",
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: "12px",
            }}>
              <div style={{
                fontSize: "48px", marginBottom: "12px", opacity: 0.3,
              }}>∅</div>
              <div style={{
                fontSize: "16px", fontWeight: 600, color: C.text,
                marginBottom: "6px",
              }}>No articles match your filters</div>
              <div style={{
                fontSize: "13px", color: C.textMuted,
                fontFamily: "'JetBrains Mono', monospace",
              }}>Try widening the date range or clearing filters.</div>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
              gap: "16px",
            }}>
              {filtered.map((a, idx) => (
                <article
                  key={a.id}
                  style={{
                    background: C.surface, border: `1px solid ${C.border}`,
                    borderRadius: "10px", padding: "22px",
                    boxShadow: C.shadow,
                    transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
                    cursor: "pointer",
                    display: "flex", flexDirection: "column",
                    opacity: animateIn ? 1 : 0,
                    transform: animateIn ? "translateY(0)" : "translateY(12px)",
                    animation: `newsFadeUp 0.5s ease ${Math.min(idx * 0.025, 0.4)}s both`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = C.shadowHover;
                    e.currentTarget.style.borderColor = C.accent;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = C.shadow;
                    e.currentTarget.style.borderColor = C.border;
                  }}
                >
                  {/* Header row: source + datetime + lang badge */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    marginBottom: "12px", flexWrap: "wrap",
                  }}>
                    <span style={{
                      fontSize: "11px", fontWeight: 700, color: C.text,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>{a.source}</span>
                    <span style={{
                      fontSize: "10px", color: C.textMuted,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>· {a.datetime}</span>
                    <span style={{
                      marginLeft: "auto",
                      fontSize: "10px", fontWeight: 700,
                      fontFamily: "'JetBrains Mono', monospace",
                      padding: "2px 7px", borderRadius: "3px",
                      color: LANG_COLORS[a.lang],
                      background: `${LANG_COLORS[a.lang]}14`,
                      border: `1px solid ${LANG_COLORS[a.lang]}33`,
                    }}>{a.lang}</span>
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontSize: "16px", fontWeight: 700, color: C.text,
                    lineHeight: 1.32, letterSpacing: "-0.01em",
                    margin: "0 0 10px",
                  }}>
                    {a.title}
                  </h3>

                  {/* Summary */}
                  <p style={{
                    fontSize: "13px", color: C.textSec, lineHeight: 1.55,
                    margin: "0 0 16px", flex: 1,
                  }}>
                    {a.summary}
                  </p>

                  {/* Tags row: sentiment + sector + relevance */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    flexWrap: "wrap", marginBottom: "14px",
                  }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: "5px",
                      fontSize: "10px", fontWeight: 700,
                      fontFamily: "'JetBrains Mono', monospace",
                      padding: "3px 8px", borderRadius: "3px",
                      textTransform: "uppercase", letterSpacing: "0.06em",
                      color: SENTIMENT_COLORS[a.sentiment],
                      background: SENTIMENT_BG[a.sentiment],
                    }}>
                      <span style={{
                        width: "5px", height: "5px", borderRadius: "50%",
                        background: SENTIMENT_COLORS[a.sentiment],
                      }} />
                      {a.sentiment}
                    </span>
                    <span style={{
                      fontSize: "10px", fontWeight: 600, color: C.textSec,
                      fontFamily: "'JetBrains Mono', monospace",
                      padding: "3px 8px", borderRadius: "3px",
                      background: C.surfaceAlt, textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}>{a.sector}</span>
                    <span style={{
                      marginLeft: "auto",
                      fontSize: "10px", color: C.textMuted,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>
                      Relevance
                    </span>
                    <span style={{
                      fontSize: "13px", fontWeight: 800,
                      fontFamily: "'JetBrains Mono', monospace",
                      color: a.relevance >= 85 ? C.sage : a.relevance >= 70 ? C.accent : C.amber,
                      letterSpacing: "-0.02em",
                    }}>{a.relevance}</span>
                  </div>

                  {/* Relevance bar */}
                  <div style={{
                    height: "3px", background: C.surfaceAlt,
                    borderRadius: "2px", overflow: "hidden", marginBottom: "14px",
                  }}>
                    <div style={{
                      width: `${a.relevance}%`, height: "100%",
                      background: a.relevance >= 85 ? C.sage : a.relevance >= 70 ? C.accent : C.amber,
                      borderRadius: "2px",
                      transition: "width 0.5s ease",
                    }} />
                  </div>

                  {/* Action */}
                  <button
                    style={{
                      alignSelf: "flex-start",
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      padding: "8px 14px",
                      background: "transparent", color: C.text,
                      border: `1px solid ${C.border}`,
                      borderRadius: "4px",
                      fontSize: "12px", fontWeight: 600,
                      fontFamily: "'Inter', sans-serif",
                      cursor: "pointer", transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = C.text;
                      e.currentTarget.style.color = C.surface;
                      e.currentTarget.style.borderColor = C.text;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = C.text;
                      e.currentTarget.style.borderColor = C.border;
                    }}
                  >
                    View analysis →
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══ METHODOLOGY NOTE ═══════════════════════════════════ */}
      <section style={{
        padding: "64px 32px",
        background: C.surface,
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{
          maxWidth: "900px", margin: "0 auto", padding: "0 16px",
          display: "grid", gridTemplateColumns: "auto 1fr",
          gap: "40px", alignItems: "start",
        }}>
          <div style={{
            width: "56px", height: "56px",
            borderRadius: "8px",
            background: C.surfaceAlt,
            border: `1px solid ${C.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "24px", color: C.accent,
            fontFamily: "'JetBrains Mono', monospace", fontWeight: 800,
            flexShrink: 0,
          }}>ⓘ</div>
          <div>
            <div style={{
              fontSize: "11px", color: C.textMuted,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.12em", textTransform: "uppercase",
              marginBottom: "10px",
            }}>Methodology note</div>
            <h3 style={{
              fontSize: "22px", fontWeight: 700, color: C.text,
              margin: "0 0 16px", letterSpacing: "-0.02em",
            }}>How Harch Atelier indexes and scores every article</h3>
            <div style={{
              fontSize: "14px", color: C.textSec, lineHeight: 1.65,
            }}>
              <p style={{ margin: "0 0 12px" }}>
                Our crawler monitors <strong style={{ color: C.text }}>30+ Moroccan and African media sources</strong> across
                three languages (FR, AR, EN), refreshing every 5 minutes. Each article is processed through our NLP
                pipeline which performs entity extraction, sector classification (7 sectors), and sentiment scoring
                (positive / neutral / negative) trained on a curated corpus of 50,000+ hand-labeled francophone business articles.
              </p>
              <p style={{ margin: "0 0 12px" }}>
                The <strong style={{ color: C.text }}>relevance score</strong> (0–100) combines entity salience,
                mention of tracked companies, source authority weight, and recency decay. Scores above 85 indicate
                high-impact coverage worth immediate attention. All metrics shown on this page are derived from
                the same pipeline that powers our alerting and report-generation systems.
              </p>
              <p style={{ margin: 0 }}>
                Sources include: <em>TelQuel, Medias24, Hespress, Financial Afrik, Aujourd'hui Le Maroc,
                Le Site Info, Infomediaire, Barlamane, Africa News, L'Économiste</em>, and 20+ additional
                regional publications. Coverage spans Morocco, Senegal, Côte d'Ivoire, Egypt, and the broader
                Francophone Africa region.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══════════════════════════════════════════════ */}
      <section style={{
        padding: "96px 32px",
        background: `linear-gradient(135deg, ${C.accent} 0%, ${C.sage} 100%)`,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: 0, right: 0, width: "60%", height: "100%",
          background: "radial-gradient(circle at 70% 50%, rgba(255,255,255,0.06), transparent 60%)",
          pointerEvents: "none",
        }} />
        <div style={{
          maxWidth: "900px", margin: "0 auto", padding: "0 16px", textAlign: "center",
          position: "relative", zIndex: 1,
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "6px 14px", background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.25)", borderRadius: "100px",
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            color: "#FFFFFF", letterSpacing: "0.14em", textTransform: "uppercase",
            marginBottom: "24px",
          }}>
            <span style={{
              width: "6px", height: "6px", borderRadius: "50%", background: "#FFFFFF",
              animation: "newsPulseDot 1.6s ease-in-out infinite",
            }} />
            Stay ahead · Real-time alerting
          </div>
          <h2 style={{
            fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800,
            color: "#FFFFFF", letterSpacing: "-0.03em", lineHeight: 1.05,
            margin: "0 0 20px",
          }}>
            Get personalized alerts →
          </h2>
          <p style={{
            fontSize: "18px", color: "rgba(255,255,255,0.85)",
            lineHeight: 1.55, maxWidth: "640px", margin: "0 auto 36px",
          }}>
            Receive WhatsApp, email, or Slack alerts the moment your company, sector, or competitor
            appears in any of the 30+ sources we monitor. Configure by sentiment, language, and relevance threshold.
          </p>
          <div style={{
            display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap",
          }}>
            <a
              href="/atelier/contact"
              style={{
                display: "inline-block",
                padding: "16px 32px",
                background: "#FFFFFF", color: C.accent,
                fontSize: "15px", fontWeight: 700,
                borderRadius: "4px", textDecoration: "none",
                fontFamily: "'Inter', sans-serif",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.18)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Configure my alerts →
            </a>
            <a
              href="/atelier/method"
              style={{
                display: "inline-block",
                padding: "16px 32px",
                background: "transparent", color: "#FFFFFF",
                fontSize: "15px", fontWeight: 600,
                border: "1px solid rgba(255,255,255,0.4)",
                borderRadius: "4px", textDecoration: "none",
                fontFamily: "'Inter', sans-serif",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.10)";
                e.currentTarget.style.borderColor = "#FFFFFF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)";
              }}
            >
              Read the methodology
            </a>
          </div>

          {/* Quick stats footer */}
          <div style={{
            marginTop: "56px", paddingTop: "32px",
            borderTop: "1px solid rgba(255,255,255,0.15)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "24px", maxWidth: "780px", margin: "56px auto 0",
          }}>
            {[
              { v: "< 5 min", l: "Alert latency" },
              { v: "30+", l: "Sources" },
              { v: "3", l: "Languages" },
              { v: "8", l: "Sectors" },
            ].map((s) => (
              <div key={s.l}>
                <div style={{
                  fontSize: "28px", fontWeight: 800, color: "#FFFFFF",
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: "-0.02em", lineHeight: 1,
                }}>{s.v}</div>
                <div style={{
                  fontSize: "10px", color: "rgba(255,255,255,0.7)",
                  fontFamily: "'JetBrains Mono', monospace",
                  textTransform: "uppercase", letterSpacing: "0.1em",
                  marginTop: "6px",
                }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AtelierFooter />
      <BackToTop />
    </>
  );
}
