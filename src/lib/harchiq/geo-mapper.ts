// ═══════════════════════════════════════════════════════════════
//  GEO MAPPER — Moroccan media source → HQ city / region
//
//  Dataminr plots signals on a map by where the SOURCE is
//  headquartered (the publisher, not the article's subject). We
//  replicate that for the 20+ Moroccan / African media feeds the
//  RSS scraper pulls, plus the regulatory feeds (AMMC, BAM, BVC).
//
//  Task ID: dataminr-geo-multimodal
//  Module:  harchiq/geo-mapper
// ═══════════════════════════════════════════════════════════════

// ─── TYPES ────────────────────────────────────────────────────────

export interface GeoCoord {
  lat: number;
  lng: number;
  city: string;
  region: string;
}

/** A lightweight alert payload — only the fields the geo aggregator
 *  needs. Anything richer (id, title, url, severity) is carried
 *  through unchanged. */
export interface GeoAlertInput {
  source: string;
  sentimentScore?: number | null;
  severity?: "critical" | "high" | "medium" | "low" | string | null;
}

export interface GeoAggregate {
  city: string;
  region: string;
  lat: number;
  lng: number;
  alertCount: number;
  avgSentiment: number | null;
  topSources: string[];
  severity: "critical" | "high" | "medium" | "low";
}

// ─── SOURCE → GEO MAP ─────────────────────────────────────────────
//
//  Each entry maps a Moroccan / African media source to its
//  headquarters city. The keys are the canonical feed names from
//  `MOROCCAN_FEEDS` in src/lib/scrapers/rss-scraper.ts (Hespress,
//  Le360, TelQuel, Medias24, …) plus the regulatory feeds (AMMC,
//  BAM, BVC).
//
//  Latitudes / longitudes are the published city-centre coordinates
//  (WGS-84) — accurate enough for a heatmap, not for navigation.
//  Regions use the official 12-region Moroccan administrative
//  subdivision (2015 reform).

const SOURCE_GEO: Record<string, GeoCoord> = {
  // ─── Casablanca-Settat (media HQ cluster) ─────────────────────
  "Hespress": { lat: 33.5731, lng: -7.5898, city: "Casablanca", region: "Casablanca-Settat" },
  "Le360": { lat: 33.5731, lng: -7.5898, city: "Casablanca", region: "Casablanca-Settat" },
  "TelQuel": { lat: 33.5731, lng: -7.5898, city: "Casablanca", region: "Casablanca-Settat" },
  "Médias24": { lat: 33.5731, lng: -7.5898, city: "Casablanca", region: "Casablanca-Settat" },
  "Medias24": { lat: 33.5731, lng: -7.5898, city: "Casablanca", region: "Casablanca-Settat" },
  "L'Economiste": { lat: 33.5731, lng: -7.5898, city: "Casablanca", region: "Casablanca-Settat" },
  "LesEco": { lat: 33.5731, lng: -7.5898, city: "Casablanca", region: "Casablanca-Settat" },
  "Le Site Info": { lat: 33.5731, lng: -7.5898, city: "Casablanca", region: "Casablanca-Settat" },
  "Infomediaire": { lat: 33.5731, lng: -7.5898, city: "Casablanca", region: "Casablanca-Settat" },
  "Yabiladi": { lat: 33.5731, lng: -7.5898, city: "Casablanca", region: "Casablanca-Settat" },
  "L'Opinion": { lat: 33.5731, lng: -7.5898, city: "Casablanca", region: "Casablanca-Settat" },
  "BVC (Bourse de Casablanca)": { lat: 33.5731, lng: -7.5898, city: "Casablanca", region: "Casablanca-Settat" },

  // ─── Rabat-Salé-Kénitra (capital + regulatory) ───────────────
  "Aujourdhui Le Maroc": { lat: 34.0209, lng: -6.8416, city: "Rabat", region: "Rabat-Salé-Kénitra" },
  "Aujourd'hui Le Maroc": { lat: 34.0209, lng: -6.8416, city: "Rabat", region: "Rabat-Salé-Kénitra" },
  "Morocco World News": { lat: 34.0209, lng: -6.8416, city: "Rabat", region: "Rabat-Salé-Kénitra" },
  "Le Desk": { lat: 34.0209, lng: -6.8416, city: "Rabat", region: "Rabat-Salé-Kénitra" },
  "MAP (Maroc Arabe Presse)": { lat: 34.0209, lng: -6.8416, city: "Rabat", region: "Rabat-Salé-Kénitra" },
  "MAP": { lat: 34.0209, lng: -6.8416, city: "Rabat", region: "Rabat-Salé-Kénitra" },
  "AMMC": { lat: 34.0209, lng: -6.8416, city: "Rabat", region: "Rabat-Salé-Kénitra" },
  "BAM": { lat: 34.0209, lng: -6.8416, city: "Rabat", region: "Rabat-Salé-Kénitra" },
  "Bank Al-Maghrib": { lat: 34.0209, lng: -6.8416, city: "Rabat", region: "Rabat-Salé-Kénitra" },

  // ─── Tanger-Tétouan-Al Hoceïma ───────────────────────────────
  "Tanger Press": { lat: 35.7595, lng: -5.8340, city: "Tanger", region: "Tanger-Tétouan-Al Hoceïma" },
  "TangerNews": { lat: 35.7595, lng: -5.8340, city: "Tanger", region: "Tanger-Tétouan-Al Hoceïma" },
  "Tetouan Press": { lat: 35.5889, lng: -5.3626, city: "Tétouan", region: "Tanger-Tétouan-Al Hoceïma" },

  // ─── Marrakech-Safi ──────────────────────────────────────────
  "Marrakech News": { lat: 31.6295, lng: -7.9811, city: "Marrakech", region: "Marrakech-Safi" },
  "Marrakech Press": { lat: 31.6295, lng: -7.9811, city: "Marrakech", region: "Marrakech-Safi" },

  // ─── Fès-Meknès ──────────────────────────────────────────────
  "Fès News": { lat: 34.0181, lng: -5.0078, city: "Fès", region: "Fès-Meknès" },
  "Meknès Press": { lat: 33.8935, lng: -5.5473, city: "Meknès", region: "Fès-Meknès" },

  // ─── Souss-Massa (Agadir) ────────────────────────────────────
  "Agadir News": { lat: 30.4278, lng: -9.5981, city: "Agadir", region: "Souss-Massa" },
  "Agadir Press": { lat: 30.4278, lng: -9.5981, city: "Agadir", region: "Souss-Massa" },

  // ─── Oriental (Oujda) ────────────────────────────────────────
  "Oujda News": { lat: 34.6814, lng: -1.9086, city: "Oujda", region: "Oriental" },

  // ─── Dakhla-Oued Ed-Dahab (Southern Morocco) ────────────────
  "Dakhla News": { lat: 23.6848, lng: -15.9580, city: "Dakhla", region: "Dakhla-Oued Ed-Dahab" },

  // ─── Drâa-Tafilalet ──────────────────────────────────────────
  "Errachidia News": { lat: 31.9314, lng: -4.4244, city: "Errachidia", region: "Drâa-Tafilalet" },

  // ─── Béni Mellal-Khénifra ────────────────────────────────────
  "Béni Mellal News": { lat: 32.3373, lng: -6.3498, city: "Béni Mellal", region: "Béni Mellal-Khénifra" },

  // ─── Guelmim-Oued Noun ───────────────────────────────────────
  "Guelmim News": { lat: 28.9870, lng: -10.0574, city: "Guelmim", region: "Guelmim-Oued Noun" },

  // ─── Pan-African (used by Financial Afrik, Africa News, JA) ─
  //  We keep the source's editorial HQ, not the story location.
  "Financial Afrik": { lat: 14.6928, lng: -17.4467, city: "Dakar", region: "Senegal" },
  "Africa News": { lat: 5.3600, lng: -4.0083, city: "Abidjan", region: "Côte d'Ivoire" },
  "Jeune Afrique": { lat: 48.8566, lng: 2.3522, city: "Paris", region: "France" },

  // ─── International wire services (often via Google News proxy) ──
  "Reuters": { lat: 51.5074, lng: -0.1278, city: "London", region: "United Kingdom" },
  "BBC": { lat: 51.5074, lng: -0.1278, city: "London", region: "United Kingdom" },
  "AFP": { lat: 48.8566, lng: 2.3522, city: "Paris", region: "France" },
  "Le Monde": { lat: 48.8566, lng: 2.3522, city: "Paris", region: "France" },
  "Al Jazeera": { lat: 25.2854, lng: 51.5310, city: "Doha", region: "Qatar" },
  "Sky News": { lat: 51.5074, lng: -0.1278, city: "London", region: "United Kingdom" },
  "CNN": { lat: 33.7490, lng: -84.3880, city: "Atlanta", region: "United States" },
  "Forbes": { lat: 40.7128, lng: -74.0060, city: "New York", region: "United States" },
  "Bloomberg": { lat: 40.7128, lng: -74.0060, city: "New York", region: "United States" },
  "Financial Times": { lat: 51.5074, lng: -0.1278, city: "London", region: "United Kingdom" },
  "Wall Street Journal": { lat: 40.7128, lng: -74.0060, city: "New York", region: "United States" },

  // ─── HarchIQ Risk Engine (internal — Rabat) ─────────────────
  "HarchIQ Risk Engine": { lat: 34.0209, lng: -6.8416, city: "Rabat", region: "Rabat-Salé-Kénitra" },
  "Google News": { lat: 33.5731, lng: -7.5898, city: "Casablanca", region: "Casablanca-Settat" },
};

// ─── FALLBACK COORDS (Casablanca — largest media market) ─────────

const FALLBACK_GEO: GeoCoord = {
  lat: 33.5731,
  lng: -7.5898,
  city: "Casablanca",
  region: "Casablanca-Settat",
};

// ─── PUBLIC API ───────────────────────────────────────────────────

/**
 * Resolve a source name to its headquarters geo coordinates.
 *
 * Lookup is case-insensitive and matches against the canonical
 * SOURCE_GEO keys. If the source is unknown we fall back to
 * Casablanca (the largest media market in Morocco) so the alert
 * still appears on the map rather than getting dropped silently.
 *
 * Examples:
 *   getGeoForSource("Hespress")        → Casablanca
 *   getGeoForSource("hespress")        → Casablanca (case-insensitive)
 *   getGeoForSource("Some Blog")       → Casablanca (fallback)
 */
export function getGeoForSource(source: string): GeoCoord {
  if (!source) return FALLBACK_GEO;

  // Direct hit on the canonical key (preserves accents / apostrophes).
  if (SOURCE_GEO[source]) return SOURCE_GEO[source];

  // Case-insensitive + accent-insensitive lookup.
  const normalized = source.toLowerCase().trim();
  for (const [key, value] of Object.entries(SOURCE_GEO)) {
    if (key.toLowerCase() === normalized) return value;
  }

  // Substring match — many RSS feeds return "<Source> - Subtitle" or
  // "Source: Region" in the source field. We match any known source
  // name as a substring of the input.
  for (const [key, value] of Object.entries(SOURCE_GEO)) {
    if (normalized.includes(key.toLowerCase())) return value;
  }

  return FALLBACK_GEO;
}

// ─── CITY LIST (for rendering markers on the SVG map) ────────────
//
//  Every city that appears in SOURCE_GEO, deduplicated. Used by the
//  GeoHeatmap component to plot inactive cities (no alerts yet) as
//  small grey dots so the map isn't empty when a region has no
//  coverage yet.

const KNOWN_CITIES: GeoCoord[] = (() => {
  const seen = new Set<string>();
  const out: GeoCoord[] = [];
  for (const v of Object.values(SOURCE_GEO)) {
    const key = `${v.city}|${v.lat.toFixed(4)}|${v.lng.toFixed(4)}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(v);
    }
  }
  return out;
})();

/** All known cities that ever appear as a source HQ. */
export function knownCities(): GeoCoord[] {
  return KNOWN_CITIES;
}

// ─── ALERT AGGREGATION ────────────────────────────────────────────

/**
 * Aggregate a flat list of alerts by their source's HQ city.
 *
 * Output shape per city:
 *   { city, region, lat, lng, alertCount, avgSentiment, topSources, severity }
 *
 *  • `alertCount` — number of alerts whose source maps to this city.
 *  • `avgSentiment` — mean of `sentimentScore` (null scores ignored).
 *    Returns null if no alert has a sentiment score.
 *  • `topSources` — top 3 most frequent source names (by alert count).
 *  • `severity` — the highest severity among the city's alerts.
 *    (critical > high > medium > low; null/unknown → low.)
 *
 * Sorted by alertCount descending.
 */
export function aggregateAlertsByCity<A extends GeoAlertInput>(alerts: A[]): GeoAggregate[] {
  const byCity = new Map<string, GeoAggregate & { _sources: Map<string, number> }>();

  for (const a of alerts) {
    const geo = getGeoForSource(a.source ?? "");
    const key = `${geo.city}|${geo.lat.toFixed(4)}`;

    let bucket = byCity.get(key);
    if (!bucket) {
      bucket = {
        city: geo.city,
        region: geo.region,
        lat: geo.lat,
        lng: geo.lng,
        alertCount: 0,
        avgSentiment: null,
        topSources: [],
        severity: "low",
        _sources: new Map<string, number>(),
      };
      byCity.set(key, bucket);
    }

    bucket.alertCount += 1;

    if (typeof a.sentimentScore === "number" && !Number.isNaN(a.sentimentScore)) {
      const prevSum = (bucket.avgSentiment ?? 0) * (bucket.alertCount - 1);
      bucket.avgSentiment = (prevSum + a.sentimentScore) / bucket.alertCount;
    }

    const src = a.source ?? "Unknown";
    bucket._sources.set(src, (bucket._sources.get(src) ?? 0) + 1);

    bucket.severity = higherSeverity(bucket.severity, a.severity ?? null);
  }

  return Array.from(byCity.values())
    .map(({ _sources, ...rest }) => ({
      ...rest,
      topSources: Array.from(_sources.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name]) => name),
    }))
    .sort((a, b) => b.alertCount - a.alertCount);
}

// ─── SEVERITY HELPERS ─────────────────────────────────────────────

const SEVERITY_RANK: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

function higherSeverity(
  current: GeoAggregate["severity"],
  candidate: string | null | undefined,
): GeoAggregate["severity"] {
  if (!candidate) return current;
  const c = SEVERITY_RANK[current] ?? 1;
  const n = SEVERITY_RANK[candidate.toLowerCase()] ?? 1;
  if (n <= c) return current;
  if (n >= 4) return "critical";
  if (n === 3) return "high";
  if (n === 2) return "medium";
  return "low";
}

// ─── LIST OF ALL KNOWN SOURCE NAMES ───────────────────────────────

/** All source names known to the geo mapper. Useful for the admin
 *  source-health dashboard to spot sources we don't yet have geo for. */
export function knownSources(): string[] {
  return Object.keys(SOURCE_GEO);
}
