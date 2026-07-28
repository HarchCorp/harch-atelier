// ═══════════════════════════════════════════════════════════════
//  SHARED COMPANY DATA — used by Harch 100, Compare, and other pages
//  Plain TS file (no "use client") — safe for server components
// ═══════════════════════════════════════════════════════════════

export interface CompanyData {
  rank: number;
  name: string;
  sector: string;
  score: number;
  prevScore: number;
  trend: "up" | "down" | "stable";
  change: string;
  innovation: { weight: number; score: number };
  performance: { weight: number; score: number };
  purpose: { weight: number; score: number };
  shareOfVoice: number;
  quarterly: number[];
  keyThemes: { theme: string; score: number; trend: number }[];
  sentiment: number;
  articles: number;
  aiRank: string;
  riskLevel: "low" | "moderate" | "elevated" | "high" | "critical";
  riskDimensions: {
    geopolitical: number;
    operational: number;
    financial: number;
    environmental: number;
    legal: number;
    consumer: number;
    technology: number;
  };
}

export const COMPANIES: CompanyData[] = [
  { rank: 1, name: "OCP Group", sector: "Mining & Phosphates", score: 91, prevScore: 89, trend: "up", change: "+2", innovation: { weight: 48, score: 88 }, performance: { weight: 35, score: 94 }, purpose: { weight: 17, score: 79 }, shareOfVoice: 31, quarterly: [85, 87, 89, 91], keyThemes: [{ theme: "Technology", score: 89, trend: 8 },{ theme: "Growth", score: 95, trend: 5 },{ theme: "Sustainability", score: 81, trend: 12 },{ theme: "Operations", score: 92, trend: 3 },{ theme: "CSR", score: 78, trend: 6 }], sentiment: 82, articles: 342, aiRank: "#1", riskLevel: "moderate", riskDimensions: { geopolitical: 58, operational: 75, financial: 52, environmental: 80, legal: 60, consumer: 50, technology: 48 } },
  { rank: 2, name: "Attijariwafa Bank", sector: "Banking", score: 84, prevScore: 85, trend: "down", change: "-1", innovation: { weight: 35, score: 79 }, performance: { weight: 41, score: 89 }, purpose: { weight: 24, score: 76 }, shareOfVoice: 27, quarterly: [82, 86, 85, 84], keyThemes: [{ theme: "Technology", score: 80, trend: 5 },{ theme: "Growth", score: 88, trend: -2 },{ theme: "Sustainability", score: 75, trend: 4 },{ theme: "Operations", score: 90, trend: 1 },{ theme: "Governance", score: 87, trend: -1 }], sentiment: 72, articles: 287, aiRank: "#1", riskLevel: "moderate", riskDimensions: { geopolitical: 35, operational: 58, financial: 81, environmental: 38, legal: 75, consumer: 55, technology: 82 } },
  { rank: 3, name: "Maroc Telecom", sector: "Telecommunications", score: 79, prevScore: 77, trend: "up", change: "+2", innovation: { weight: 52, score: 82 }, performance: { weight: 30, score: 81 }, purpose: { weight: 18, score: 70 }, shareOfVoice: 24, quarterly: [75, 76, 77, 79], keyThemes: [{ theme: "Technology", score: 84, trend: 9 },{ theme: "Products & services", score: 81, trend: 6 },{ theme: "Growth", score: 80, trend: 3 },{ theme: "Operations", score: 82, trend: 2 },{ theme: "CSR", score: 71, trend: 4 }], sentiment: 64, articles: 245, aiRank: "#1", riskLevel: "low", riskDimensions: { geopolitical: 48, operational: 62, financial: 55, environmental: 45, legal: 65, consumer: 60, technology: 78 } },
  { rank: 4, name: "Royal Air Maroc", sector: "Aviation", score: 76, prevScore: 78, trend: "down", change: "-2", innovation: { weight: 28, score: 72 }, performance: { weight: 47, score: 81 }, purpose: { weight: 25, score: 73 }, shareOfVoice: 19, quarterly: [80, 79, 78, 76], keyThemes: [{ theme: "Operations", score: 83, trend: -3 },{ theme: "Growth", score: 79, trend: -1 },{ theme: "Technology", score: 71, trend: 4 },{ theme: "CSR", score: 74, trend: 2 },{ theme: "Governance", score: 76, trend: -2 }], sentiment: 61, articles: 198, aiRank: "#2", riskLevel: "elevated", riskDimensions: { geopolitical: 65, operational: 78, financial: 58, environmental: 62, legal: 55, consumer: 70, technology: 65 } },
  { rank: 5, name: "Inwi", sector: "Telecommunications", score: 74, prevScore: 72, trend: "up", change: "+2", innovation: { weight: 56, score: 81 }, performance: { weight: 27, score: 75 }, purpose: { weight: 17, score: 68 }, shareOfVoice: 18, quarterly: [68, 70, 72, 74], keyThemes: [{ theme: "Technology", score: 84, trend: 11 },{ theme: "Products & services", score: 80, trend: 7 },{ theme: "Culture", score: 72, trend: 5 },{ theme: "Growth", score: 76, trend: 3 },{ theme: "Sustainability", score: 68, trend: 4 }], sentiment: 68, articles: 176, aiRank: "#3", riskLevel: "low", riskDimensions: { geopolitical: 42, operational: 55, financial: 48, environmental: 40, legal: 58, consumer: 52, technology: 72 } },
  { rank: 6, name: "Bank of Africa", sector: "Banking", score: 72, prevScore: 71, trend: "up", change: "+1", innovation: { weight: 38, score: 76 }, performance: { weight: 40, score: 78 }, purpose: { weight: 22, score: 71 }, shareOfVoice: 22, quarterly: [69, 70, 71, 72], keyThemes: [{ theme: "Growth", score: 81, trend: 6 },{ theme: "Operations", score: 79, trend: 3 },{ theme: "Technology", score: 75, trend: 5 },{ theme: "CSR", score: 72, trend: 4 },{ theme: "Collaborations", score: 70, trend: 7 }], sentiment: 68, articles: 247, aiRank: "#2", riskLevel: "moderate", riskDimensions: { geopolitical: 38, operational: 55, financial: 78, environmental: 35, legal: 70, consumer: 58, technology: 75 } },
  { rank: 7, name: "CIH Bank", sector: "Banking", score: 68, prevScore: 70, trend: "down", change: "-2", innovation: { weight: 42, score: 71 }, performance: { weight: 38, score: 73 }, purpose: { weight: 20, score: 65 }, shareOfVoice: 14, quarterly: [71, 71, 70, 68], keyThemes: [{ theme: "Technology", score: 73, trend: 4 },{ theme: "Operations", score: 74, trend: -1 },{ theme: "Growth", score: 72, trend: -2 },{ theme: "Sustainability", score: 64, trend: 2 },{ theme: "Governance", score: 70, trend: -3 }], sentiment: 65, articles: 145, aiRank: "#3", riskLevel: "moderate", riskDimensions: { geopolitical: 32, operational: 50, financial: 75, environmental: 30, legal: 68, consumer: 52, technology: 70 } },
  { rank: 8, name: "Managem", sector: "Mining", score: 66, prevScore: 64, trend: "up", change: "+2", innovation: { weight: 31, score: 68 }, performance: { weight: 44, score: 72 }, purpose: { weight: 25, score: 62 }, shareOfVoice: 12, quarterly: [60, 62, 64, 66], keyThemes: [{ theme: "Operations", score: 75, trend: 4 },{ theme: "Growth", score: 73, trend: 3 },{ theme: "Sustainability", score: 64, trend: 6 },{ theme: "Technology", score: 67, trend: 2 },{ theme: "CSR", score: 60, trend: 5 }], sentiment: 59, articles: 112, aiRank: "#2", riskLevel: "elevated", riskDimensions: { geopolitical: 55, operational: 72, financial: 50, environmental: 75, legal: 58, consumer: 48, technology: 45 } },
  { rank: 9, name: "LesieurCristal", sector: "Agro-industry", score: 64, prevScore: 65, trend: "down", change: "-1", innovation: { weight: 26, score: 62 }, performance: { weight: 46, score: 68 }, purpose: { weight: 28, score: 64 }, shareOfVoice: 10, quarterly: [66, 65, 65, 64], keyThemes: [{ theme: "Operations", score: 70, trend: -1 },{ theme: "Sustainability", score: 66, trend: 3 },{ theme: "Products & services", score: 64, trend: 1 },{ theme: "Growth", score: 67, trend: -2 },{ theme: "CSR", score: 63, trend: 2 }], sentiment: 62, articles: 89, aiRank: "#4", riskLevel: "low", riskDimensions: { geopolitical: 30, operational: 55, financial: 48, environmental: 52, legal: 45, consumer: 60, technology: 35 } },
  { rank: 10, name: "Cosumar", sector: "Agro-industry", score: 62, prevScore: 60, trend: "up", change: "+2", innovation: { weight: 23, score: 60 }, performance: { weight: 48, score: 66 }, purpose: { weight: 29, score: 63 }, shareOfVoice: 9, quarterly: [58, 59, 60, 62], keyThemes: [{ theme: "Operations", score: 68, trend: 3 },{ theme: "Sustainability", score: 65, trend: 5 },{ theme: "CSR", score: 64, trend: 4 },{ theme: "Growth", score: 63, trend: 2 },{ theme: "Products & services", score: 60, trend: 1 }], sentiment: 67, articles: 76, aiRank: "#3", riskLevel: "low", riskDimensions: { geopolitical: 25, operational: 50, financial: 45, environmental: 55, legal: 40, consumer: 55, technology: 30 } },
  { rank: 11, name: "Label'Vie", sector: "Retail", score: 59, prevScore: 58, trend: "up", change: "+1", innovation: { weight: 30, score: 61 }, performance: { weight: 42, score: 63 }, purpose: { weight: 28, score: 58 }, shareOfVoice: 8, quarterly: [55, 56, 58, 59], keyThemes: [{ theme: "Growth", score: 65, trend: 4 },{ theme: "Operations", score: 63, trend: 2 },{ theme: "Products & services", score: 60, trend: 3 },{ theme: "CSR", score: 58, trend: 2 },{ theme: "Sustainability", score: 57, trend: 3 }], sentiment: 64, articles: 67, aiRank: "#5", riskLevel: "low", riskDimensions: { geopolitical: 28, operational: 48, financial: 52, environmental: 45, legal: 42, consumer: 65, technology: 40 } },
  { rank: 12, name: "Marjane", sector: "Retail", score: 57, prevScore: 59, trend: "down", change: "-2", innovation: { weight: 28, score: 58 }, performance: { weight: 44, score: 61 }, purpose: { weight: 28, score: 55 }, shareOfVoice: 14, quarterly: [60, 59, 58, 57], keyThemes: [{ theme: "Operations", score: 62, trend: -2 },{ theme: "Products & services", score: 60, trend: 1 },{ theme: "Growth", score: 58, trend: -1 },{ theme: "CSR", score: 55, trend: 0 },{ theme: "Culture", score: 54, trend: -2 }], sentiment: 55, articles: 134, aiRank: "#4", riskLevel: "elevated", riskDimensions: { geopolitical: 30, operational: 50, financial: 55, environmental: 48, legal: 45, consumer: 70, technology: 42 } },
  { rank: 13, name: "Lydec", sector: "Utilities", score: 55, prevScore: 53, trend: "up", change: "+2", innovation: { weight: 32, score: 56 }, performance: { weight: 41, score: 58 }, purpose: { weight: 27, score: 54 }, shareOfVoice: 11, quarterly: [50, 51, 53, 55], keyThemes: [{ theme: "Operations", score: 60, trend: 3 },{ theme: "Technology", score: 56, trend: 4 },{ theme: "Sustainability", score: 55, trend: 3 },{ theme: "CSR", score: 53, trend: 2 },{ theme: "Governance", score: 52, trend: 1 }], sentiment: 48, articles: 98, aiRank: "#6", riskLevel: "elevated", riskDimensions: { geopolitical: 35, operational: 65, financial: 50, environmental: 60, legal: 55, consumer: 62, technology: 45 } },
  { rank: 14, name: "Risma", sector: "Hospitality", score: 53, prevScore: 54, trend: "down", change: "-1", innovation: { weight: 25, score: 52 }, performance: { weight: 47, score: 56 }, purpose: { weight: 28, score: 51 }, shareOfVoice: 7, quarterly: [55, 54, 54, 53], keyThemes: [{ theme: "Operations", score: 58, trend: -1 },{ theme: "Growth", score: 55, trend: 0 },{ theme: "CSR", score: 52, trend: 1 },{ theme: "Products & services", score: 50, trend: -2 },{ theme: "Sustainability", score: 49, trend: 2 }], sentiment: 58, articles: 56, aiRank: "#5", riskLevel: "moderate", riskDimensions: { geopolitical: 40, operational: 55, financial: 52, environmental: 45, legal: 42, consumer: 58, technology: 35 } },
  { rank: 15, name: "Disway", sector: "IT Distribution", score: 51, prevScore: 50, trend: "up", change: "+1", innovation: { weight: 45, score: 54 }, performance: { weight: 33, score: 53 }, purpose: { weight: 22, score: 48 }, shareOfVoice: 5, quarterly: [47, 48, 50, 51], keyThemes: [{ theme: "Technology", score: 56, trend: 5 },{ theme: "Operations", score: 54, trend: 2 },{ theme: "Products & services", score: 52, trend: 3 },{ theme: "Growth", score: 50, trend: 1 },{ theme: "Collaborations", score: 49, trend: 2 }], sentiment: 61, articles: 43, aiRank: "#4", riskLevel: "low", riskDimensions: { geopolitical: 25, operational: 45, financial: 48, environmental: 30, legal: 38, consumer: 50, technology: 55 } },
  { rank: 16, name: "Stokvis Nord Afrique", sector: "Industrial", score: 49, prevScore: 48, trend: "up", change: "+1", innovation: { weight: 22, score: 48 }, performance: { weight: 50, score: 52 }, purpose: { weight: 28, score: 46 }, shareOfVoice: 4, quarterly: [46, 47, 48, 49], keyThemes: [{ theme: "Operations", score: 54, trend: 2 },{ theme: "Growth", score: 51, trend: 1 },{ theme: "Sustainability", score: 47, trend: 1 },{ theme: "CSR", score: 46, trend: 0 },{ theme: "Technology", score: 45, trend: 2 }], sentiment: 57, articles: 38, aiRank: "#6", riskLevel: "low", riskDimensions: { geopolitical: 32, operational: 58, financial: 45, environmental: 50, legal: 42, consumer: 40, technology: 38 } },
  { rank: 17, name: "Sonasid", sector: "Steel", score: 47, prevScore: 49, trend: "down", change: "-2", innovation: { weight: 21, score: 46 }, performance: { weight: 49, score: 50 }, purpose: { weight: 30, score: 44 }, shareOfVoice: 5, quarterly: [50, 49, 48, 47], keyThemes: [{ theme: "Operations", score: 52, trend: -1 },{ theme: "Sustainability", score: 46, trend: 1 },{ theme: "Growth", score: 48, trend: -2 },{ theme: "CSR", score: 43, trend: 0 },{ theme: "Governance", score: 45, trend: -1 }], sentiment: 52, articles: 45, aiRank: "#5", riskLevel: "elevated", riskDimensions: { geopolitical: 38, operational: 65, financial: 55, environmental: 62, legal: 48, consumer: 45, technology: 35 } },
  { rank: 18, name: "Maghreb Oxygene", sector: "Industrial Gas", score: 45, prevScore: 44, trend: "up", change: "+1", innovation: { weight: 30, score: 46 }, performance: { weight: 42, score: 48 }, purpose: { weight: 28, score: 42 }, shareOfVoice: 3, quarterly: [42, 43, 44, 45], keyThemes: [{ theme: "Operations", score: 50, trend: 2 },{ theme: "Technology", score: 47, trend: 1 },{ theme: "Sustainability", score: 43, trend: 2 },{ theme: "Growth", score: 46, trend: 0 },{ theme: "CSR", score: 41, trend: 1 }], sentiment: 60, articles: 29, aiRank: "#7", riskLevel: "low", riskDimensions: { geopolitical: 30, operational: 55, financial: 42, environmental: 48, legal: 38, consumer: 35, technology: 32 } },
  { rank: 19, name: "LafargeHolcim Maroc", sector: "Cement", score: 43, prevScore: 45, trend: "down", change: "-2", innovation: { weight: 24, score: 44 }, performance: { weight: 46, score: 46 }, purpose: { weight: 30, score: 40 }, shareOfVoice: 7, quarterly: [46, 45, 44, 43], keyThemes: [{ theme: "Operations", score: 48, trend: -1 },{ theme: "Sustainability", score: 42, trend: 2 },{ theme: "Growth", score: 44, trend: -2 },{ theme: "CSR", score: 39, trend: 1 },{ theme: "Technology", score: 43, trend: 0 }], sentiment: 49, articles: 67, aiRank: "#5", riskLevel: "elevated", riskDimensions: { geopolitical: 42, operational: 68, financial: 52, environmental: 70, legal: 50, consumer: 48, technology: 40 } },
  { rank: 20, name: "Total Maroc", sector: "Energy", score: 41, prevScore: 42, trend: "down", change: "-1", innovation: { weight: 26, score: 42 }, performance: { weight: 44, score: 44 }, purpose: { weight: 30, score: 38 }, shareOfVoice: 6, quarterly: [43, 43, 42, 41], keyThemes: [{ theme: "Operations", score: 46, trend: -1 },{ theme: "Growth", score: 42, trend: -2 },{ theme: "Sustainability", score: 39, trend: 1 },{ theme: "CSR", score: 37, trend: 0 },{ theme: "Technology", score: 40, trend: -1 }], sentiment: 44, articles: 52, aiRank: "#6", riskLevel: "high", riskDimensions: { geopolitical: 60, operational: 70, financial: 55, environmental: 75, legal: 52, consumer: 50, technology: 45 } },
];

export const RISK_AXES = ["Geopolitical", "Operational", "Financial", "Environmental", "Legal", "Consumer", "Technology"];

export function getRiskValues(c: CompanyData): number[] {
  const rd = c.riskDimensions;
  return [rd.geopolitical, rd.operational, rd.financial, rd.environmental, rd.legal, rd.consumer, rd.technology];
}

export function getAvgRisk(c: CompanyData): number {
  return Math.round(getRiskValues(c).reduce((a, b) => a + b, 0) / 7);
}

// ─── API FETCH ────────────────────────────────────────────────────
// Fetches live company data from /api/companies and maps the response
// to the rich CompanyData interface. Hardcoded COMPANIES is used as
// the fallback for any company whose reputation details are not yet
// available in the database (and as the entire dataset if the fetch
// fails). This keeps the Compare page working identically whether or
// not the API is reachable.

interface ApiCompany {
  name: string;
  sector: string;
  [key: string]: unknown;
}

export async function fetchCompanies(): Promise<CompanyData[]> {
  const res = await fetch("/api/companies?page=1&limit=100", {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json?.success || !Array.isArray(json.data)) {
    throw new Error("Malformed API response");
  }
  const apiCompanies = json.data as ApiCompany[];
  const fallbackByName = new Map(COMPANIES.map((c) => [c.name.toLowerCase(), c]));

  const mapped: CompanyData[] = apiCompanies.map((api) => {
    const match = fallbackByName.get(api.name.toLowerCase());
    if (match) {
      // Preserve rich reputation data; refresh name/sector from API
      return { ...match, name: api.name, sector: api.sector };
    }
    // New company not present in fallback — synthesize neutral values
    return {
      rank: 0,
      name: api.name,
      sector: api.sector,
      score: 50,
      prevScore: 50,
      trend: "stable" as const,
      change: "0",
      innovation: { weight: 33, score: 50 },
      performance: { weight: 33, score: 50 },
      purpose: { weight: 34, score: 50 },
      shareOfVoice: 5,
      quarterly: [50, 50, 50, 50],
      keyThemes: [],
      sentiment: 50,
      articles: 0,
      aiRank: "#10",
      riskLevel: "moderate",
      riskDimensions: {
        geopolitical: 40,
        operational: 40,
        financial: 40,
        environmental: 40,
        legal: 40,
        consumer: 40,
        technology: 40,
      },
    };
  });

  // Re-rank by score descending so the comparison view is sensible
  mapped.sort((a, b) => b.score - a.score);
  mapped.forEach((c, i) => { c.rank = i + 1; });
  return mapped;
}
