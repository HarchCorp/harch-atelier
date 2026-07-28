/**
 * Harch Atelier — Data store (V28)
 *
 * Simple file-based store for agent-scraped data. Agents write JSON files here;
 * the dashboard + API routes read them. This is the "intelligence layer" —
 * real data scraped from Moroccan media, classified by GLM, scored by HarchIQ.
 *
 * Location: /home/z/my-project/data/
 * Files:
 *   - mentions.json     → media mentions (scraped + sentiment-classified)
 *   - alerts.json       → crisis alerts (negative-spike detection)
 *   - scores.json       → HarchIQ scores per brand
 *   - agent-status.json → agent heartbeat (last run, items processed)
 */
import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function read<T>(file: string, fallback: T): T {
  try {
    const p = path.join(DATA_DIR, file);
    if (!fs.existsSync(p)) return fallback;
    return JSON.parse(fs.readFileSync(p, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

function write<T>(file: string, data: T): void {
  ensureDir();
  const p = path.join(DATA_DIR, file);
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

/* --- Types --- */

export interface Mention {
  id: string;
  brand: string;
  title: string;
  url: string;
  source: string;
  snippet: string;
  date: string;
  sentiment: "positive" | "negative" | "neutral";
  pillar: "Regulatory" | "Cyber" | "Financial" | "ESG" | "Geopolitical" | "Reputational";
  scrapedAt: string;
}

export interface CrisisAlert {
  id: string;
  brand: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  source: string;
  url: string;
  snippet: string;
  detectedAt: string;
  timeToImpact: number;
  whatsappMessage: string;
}

export interface HarchIQEntry {
  brand: string;
  score: number;
  grade: string;
  trend: "up" | "down" | "stable";
  components: {
    mediaSentiment: number;
    aiVisibility: number;
    sourceDiversity: number;
    crisisExposure: number;
  };
  calculatedAt: string;
}

export interface AgentStatus {
  agentName: string;
  lastRun: string;
  status: "running" | "success" | "error";
  itemsProcessed: number;
  error?: string;
}

/* --- Store API --- */

export const store = {
  getMentions: (brand?: string) => {
    const all = read<Mention[]>("mentions.json", []);
    return brand ? all.filter((m) => m.brand.toLowerCase().includes(brand.toLowerCase())) : all;
  },
  addMentions: (mentions: Mention[]) => {
    const existing = read<Mention[]>("mentions.json", []);
    // Dedupe by url
    const urls = new Set(existing.map((m) => m.url));
    const fresh = mentions.filter((m) => !urls.has(m.url));
    write("mentions.json", [...fresh, ...existing].slice(0, 500)); // cap at 500
    return fresh.length;
  },

  getAlerts: (brand?: string) => {
    const all = read<CrisisAlert[]>("alerts.json", []);
    return brand ? all.filter((a) => a.brand.toLowerCase().includes(brand.toLowerCase())) : all;
  },
  setAlerts: (alerts: CrisisAlert[]) => {
    // Resilience: never overwrite with empty data — keep the last known good alerts.
    if (alerts.length === 0) {
      const existing = read<CrisisAlert[]>("alerts.json", []);
      if (existing.length > 0) return; // keep existing
    }
    write("alerts.json", alerts);
  },

  getScores: () => read<HarchIQEntry[]>("scores.json", []),
  setScores: (scores: HarchIQEntry[]) => {
    // Resilience: never overwrite with empty scores.
    if (scores.length === 0) {
      const existing = read<HarchIQEntry[]>("scores.json", []);
      if (existing.length > 0) return;
    }
    write("scores.json", scores);
  },

  getStatus: () => read<AgentStatus[]>("agent-status.json", []),
  setStatus: (s: AgentStatus) => {
    const all = read<AgentStatus[]>("agent-status.json", []);
    const idx = all.findIndex((a) => a.agentName === s.agentName);
    if (idx >= 0) all[idx] = s;
    else all.push(s);
    write("agent-status.json", all);
  },
};
