// ═══════════════════════════════════════════════════════════════
//  POST /api/console/geo-heatmap
//
//  Carte de Chaleur Géographique — Skill 25.
//  Montre d'où viennent les mentions : villes marocaines + 8 marchés
//  francophones (MA, FR, BE, CH, CA, TN, SN, CI).
//
//  Sortie POST (nouveau contrat — Skill 25) :
//    {
//      cities:  [{ name, lat, lng, mentionCount, avgSentiment }],
//      markets: [{ code, name, mentions, sentiment, crisisFlag }],
//      meta:    { companyName, sector, generatedAt, windowDays, source }
//    }
//
//  Sortie GET (legacy — conservée pour EssentialDashboard qui appelle
//  encore /api/console/geo-heatmap sans body) :
//    { company, range, cities, source }
//
//  Les deux handlers partagent `buildGeoHeatmap()` qui fait tout le
//  travail : résolution entreprise, requête articles 30j, agrégation
//  par ville (geo-mapper) et par marché (mapping source → ISO-2).
//
//  Villes : lat/lng viennent du geo-mapper (SOURCE_GEO). Quand
//  l'entreprise a un `headquarters` marocain connu, on l'ajoute en
//  grille fantôme (mentionCount=0) pour montrer la couverture.
//
//  Marchés : chaque article est mappté vers un code ISO-2 via
//  `detectMarket(source)` qui combine (a) les mots-clés éditoriaux
//  BE/CH/CA/TN et (b) le `region` renvoyé par getGeoForSource()
//  (France → FR, Senegal → SN, Côte d'Ivoire → CI, régions
//  marocaines → MA). Les sources non francophones non couvertes par
//  les 8 marchés (UK, US, Qatar) sont ignorées.
//
//  Crise : un marché est en crise si mentions >= 3 ET sentiment <= -0.3
//  (couverture négative soutenue sur la fenêtre 30j).
//
//  Auth : session + entreprise (requireUserCompany). demoFilter isolé
//  dans la clause where Article. Pas de bypass admin.
//
//  Skill ID : SKILL-25-GEO-HEATMAP
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { logInfo, logError } from "@/lib/logger";
import { isAccountTypeAllowed } from "@/lib/auth/rbac";
import {
  requireUserCompany,
  type UserCompanyOk,
} from "@/lib/harchiq/company-session";
import {
  aggregateAlertsByCity,
  getGeoForSource,
  knownCities,
  type GeoAlertInput,
  type GeoCoord,
} from "@/lib/harchiq/geo-mapper";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// ─── Constantes de fenêtre ────────────────────────────────────
const WINDOW_DAYS = 30;
const ARTICLE_TAKE = 5000;
const CRISIS_MIN_MENTIONS = 3;
const CRISIS_MAX_SENTIMENT = -0.3; // seuil ≤ -0.3

// ─── Types renvoyés au client (POST) ──────────────────────────

export interface GeoCity {
  name: string;
  lat: number;
  lng: number;
  mentionCount: number;
  avgSentiment: number | null; // -1..+1, null si aucun sentiment
}

export interface GeoMarket {
  code: string; // ISO-2 : MA, FR, BE, CH, CA, TN, SN, CI
  name: string; // nom français
  mentions: number;
  sentiment: number | null; // -1..+1, null si aucun sentiment
  crisisFlag: boolean;
}

export interface GeoHeatmapMeta {
  companyName: string;
  sector: string;
  generatedAt: string;
  windowDays: number;
  source: "real" | "demo";
}

export interface GeoHeatmapResponse {
  cities: GeoCity[];
  markets: GeoMarket[];
  meta: GeoHeatmapMeta;
}

// ─── Shape legacy GET (EssentialDashboard) ────────────────────
//  Conservée à l'identique pour ne pas casser l'appel existant.
interface GeoHeatmapLegacy {
  company: { name: string; slug: string } | null;
  range: string;
  cities: GeoCity[];
  source: "real" | "demo" | "fallback";
}

// ─── 8 marchés francophones (ordre canonique) ────────────────
//  L'ordre est figé — la carte International du popup l'utilise
//  pour aligner les 8 cellules dans la grille.
const MARKETS: Array<{ code: string; name: string }> = [
  { code: "MA", name: "Maroc" },
  { code: "FR", name: "France" },
  { code: "BE", name: "Belgique" },
  { code: "CH", name: "Suisse" },
  { code: "CA", name: "Canada" },
  { code: "TN", name: "Tunisie" },
  { code: "SN", name: "Sénégal" },
  { code: "CI", name: "Côte d'Ivoire" },
];

// ─── Mots-clés éditoriaux pour BE / CH / CA / TN ──────────────
//  Le geo-mapper ne couvre pas encore ces 4 marchés — on détecte
//  donc par mot-clé dans le nom de la source. Format : substrings
//  en minuscule matchées par .includes(). On reste strict pour
//  éviter les faux positifs ("le soir" matcherais "le soir info"
//  si on l'autorisait — on exige donc des marqueurs uniques).
const MARKET_KEYWORDS: Array<{ code: string; keywords: string[] }> = [
  {
    code: "BE",
    keywords: [
      "rtbf", "lalibre", "la libre belgique", "le vif", "levif",
      "trends-tendances", "trends.be", "knack",
    ],
  },
  {
    code: "CH",
    keywords: [
      "le temps suisse", "letemps.ch", "rts.ch", "swissinfo",
      "24heures.ch", "tdg.ch", "nzz", "neue zurcher zeitung",
    ],
  },
  {
    code: "CA",
    keywords: [
      "radio-canada", "le devoir", "ledevoir.com",
      "la presse canada", "lapresse.ca", "journal de montréal",
      "journaldequebec", "rci.ca",
    ],
  },
  {
    code: "TN",
    keywords: [
      "realites.tn", "business news tunisia", "kapitalis",
      "babnet", "tunisien", "lapresse.tn", "webdo.tn",
    ],
  },
];

// ─── Régions marocaines (12 régions officielles post-2015) ────
//  Toute région dans cette liste → marché MA. Le geo-mapper renvoie
//  déjà ces libellés exacts (Casablanca-Settat, etc.) pour toutes
//  les sources marocaines.
const MOROCCAN_REGIONS: ReadonlySet<string> = new Set([
  "Casablanca-Settat",
  "Rabat-Salé-Kénitra",
  "Tanger-Tétouan-Al Hoceïma",
  "Marrakech-Safi",
  "Fès-Meknès",
  "Souss-Massa",
  "Oriental",
  "Dakhla-Oued Ed-Dahab",
  "Drâa-Tafilalet",
  "Béni Mellal-Khénifra",
  "Guelmim-Oued Noun",
]);

// ─── 6 villes marocaines de fallback ──────────────────────────
//  Quand l'entreprise n'a aucun article localisé sur 30j, on renvoie
//  cette grille (mentionCount=0) pour que la carte affiche une
//  couverture géographique claire plutôt qu'un écran vide.
const FALLBACK_CITIES: GeoCity[] = [
  { name: "Casablanca", lat: 33.5731, lng: -7.5898, mentionCount: 0, avgSentiment: null },
  { name: "Rabat",      lat: 34.0209, lng: -6.8416, mentionCount: 0, avgSentiment: null },
  { name: "Marrakech",  lat: 31.6295, lng: -7.9811, mentionCount: 0, avgSentiment: null },
  { name: "Fès",        lat: 34.0181, lng: -5.0078, mentionCount: 0, avgSentiment: null },
  { name: "Tanger",     lat: 35.7595, lng: -5.8340, mentionCount: 0, avgSentiment: null },
  { name: "Agadir",     lat: 30.4278, lng: -9.5981, mentionCount: 0, avgSentiment: null },
];

// ─── Détection marché par source ─────────────────────────────
//  1. Mots-clés éditoriaux pour BE/CH/CA/TN (strict).
//  2. geo-mapper region pour MA/FR/SN/CI (et exclut UK/US/Qatar).
//  3. Fallback MA — la console est marocaine par défaut, et le
//     geo-mapper tombe déjà sur Casablanca pour les sources
//     inconnues, ce qui est cohérent.
function detectMarket(source: string): string {
  if (!source) return "MA";
  const s = source.toLowerCase().trim();

  // (1) Mots-clés éditoriaux — substrings strictes.
  for (const { code, keywords } of MARKET_KEYWORDS) {
    for (const k of keywords) {
      if (s.includes(k)) return code;
    }
  }

  // (2) geo-mapper region.
  const geo = getGeoForSource(source);
  if (MOROCCAN_REGIONS.has(geo.region)) return "MA";
  if (geo.region === "France") return "FR";
  if (geo.region === "Senegal") return "SN";
  if (geo.region === "Côte d'Ivoire") return "CI";

  // (3) Fallback.
  return "MA";
}

// ─── Helpers sentiment ───────────────────────────────────────
interface Sentimented {
  sentimentScore: number | null;
}

function avgSentiment<T extends Sentimented>(rows: T[]): number | null {
  const valid = rows.filter((r) => r.sentimentScore != null);
  if (valid.length === 0) return null;
  const sum = valid.reduce((s, r) => s + (r.sentimentScore as number), 0);
  return Math.round((sum / valid.length) * 1000) / 1000;
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

// ─── Conversion headquarters → coordonnées marocaine ────────
//  On accepte les 6 villes fallback + les 13 villes connues du
//  geo-mapper. Retourne null si le siège n'est pas marocain ou
//  ne matche aucune ville connue (la carte villes ne couvre que
//  le Maroc — pour l'international, c'est la carte marchés).
function hqToMoroccoCity(headquarters: string | null): GeoCoord | null {
  if (!headquarters) return null;
  const h = headquarters.toLowerCase().trim();

  // 1. Match direct sur les villes connues du geo-mapper.
  for (const c of knownCities()) {
    if (MOROCCAN_REGIONS.has(c.region) && c.city.toLowerCase() === h) {
      return c;
    }
  }
  // 2. Match partiel (le siège peut être "Casablanca, Maroc").
  for (const c of knownCities()) {
    if (MOROCCAN_REGIONS.has(c.region) && h.includes(c.city.toLowerCase())) {
      return c;
    }
  }
  // 3. Correspondances à la main pour les variations courantes.
  const MANUAL: Record<string, GeoCoord> = {
    "casablanca":   { city: "Casablanca", region: "Casablanca-Settat",         lat: 33.5731, lng: -7.5898 },
    "casa":         { city: "Casablanca", region: "Casablanca-Settat",         lat: 33.5731, lng: -7.5898 },
    "rabat":        { city: "Rabat",      region: "Rabat-Salé-Kénitra",        lat: 34.0209, lng: -6.8416 },
    "marrakech":    { city: "Marrakech",  region: "Marrakech-Safi",            lat: 31.6295, lng: -7.9811 },
    "marrakesh":    { city: "Marrakech",  region: "Marrakech-Safi",            lat: 31.6295, lng: -7.9811 },
    "fès":          { city: "Fès",        region: "Fès-Meknès",                lat: 34.0181, lng: -5.0078 },
    "fes":          { city: "Fès",        region: "Fès-Meknès",                lat: 34.0181, lng: -5.0078 },
    "tanger":       { city: "Tanger",     region: "Tanger-Tétouan-Al Hoceïma", lat: 35.7595, lng: -5.8340 },
    "tangier":      { city: "Tanger",     region: "Tanger-Tétouan-Al Hoceïma", lat: 35.7595, lng: -5.8340 },
    "agadir":       { city: "Agadir",     region: "Souss-Massa",               lat: 30.4278, lng: -9.5981 },
    "tétouan":      { city: "Tétouan",    region: "Tanger-Tétouan-Al Hoceïma", lat: 35.5889, lng: -5.3626 },
    "tetouan":      { city: "Tétouan",    region: "Tanger-Tétouan-Al Hoceïma", lat: 35.5889, lng: -5.3626 },
    "meknès":       { city: "Meknès",     region: "Fès-Meknès",                lat: 33.8935, lng: -5.5473 },
    "meknes":       { city: "Meknès",     region: "Fès-Meknès",                lat: 33.8935, lng: -5.5473 },
    "oujda":        { city: "Oujda",      region: "Oriental",                  lat: 34.6814, lng: -1.9086 },
    "dakhla":       { city: "Dakhla",     region: "Dakhla-Oued Ed-Dahab",      lat: 23.6848, lng: -15.9580 },
    "errachidia":   { city: "Errachidia", region: "Drâa-Tafilalet",            lat: 31.9314, lng: -4.4244 },
    "béni mellal":  { city: "Béni Mellal", region: "Béni Mellal-Khénifra",     lat: 32.3373, lng: -6.3498 },
    "beni mellal":  { city: "Béni Mellal", region: "Béni Mellal-Khénifra",     lat: 32.3373, lng: -6.3498 },
    "guelmim":      { city: "Guelmim",    region: "Guelmim-Oued Noun",         lat: 28.9870, lng: -10.0574 },
  };
  for (const [key, geo] of Object.entries(MANUAL)) {
    if (h === key || h.includes(key)) return geo;
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════
//  Logique partagée — renvoie le payload complet (POST shape +
//  éléments dont GET a besoin pour sa shape legacy).
// ═══════════════════════════════════════════════════════════════

interface BuiltHeatmap {
  cities: GeoCity[];
  markets: GeoMarket[];
  meta: GeoHeatmapMeta;
  // Champs legacy pour GET.
  legacySource: "real" | "demo" | "fallback";
  company: { name: string; slug: string } | null;
}

async function buildGeoHeatmap(
  sessionData: UserCompanyOk["data"],
): Promise<BuiltHeatmap> {
  // ─── 1. Paramètres entreprise ─────────────────────────────
  //  L'appelant (GET ou POST) a déjà résolu requireUserCompany
  //  et vérifié .ok. On reçoit donc la donnée typée directement,
  //  sans refaire un appel (qui doublerait les queries Prisma).
  const { company, demoFilter, isDemo } = sessionData;

  // ─── 2. Re-hydrate headquarters via prisma (requireUserCompany
  //     ne sélectionne que id/slug/name/sector/ticker). ────────
  const fullCompany = await prisma.company.findUnique({
    where: { id: company.id },
    select: {
      name: true,
      slug: true,
      sector: true,
      headquarters: true,
    },
  });

  // ─── 3. Articles 30j ───────────────────────────────────────
  const since = new Date();
  since.setDate(since.getDate() - WINDOW_DAYS);
  since.setHours(0, 0, 0, 0);

  const articles = await prisma.article.findMany({
    where: {
      companyId: company.id,
      publishedAt: { gte: since },
      ...demoFilter,
    },
    select: {
      source: true,
      sentimentScore: true,
    },
    orderBy: { publishedAt: "desc" },
    take: ARTICLE_TAKE,
  });

  logInfo(
    "console.geo-heatmap",
    `company=${company.slug} articles=${articles.length} window=${WINDOW_DAYS}d demo=${isDemo}`,
  );

  // ─── 4. Agrégation villes marocaines ──────────────────────
  //  On passe chaque article dans le geo-mapper (déjà utilisé par
  //  le GET existant) puis on filtre aux villes marocaines.
  const geoAlerts: GeoAlertInput[] = articles.map((a) => {
    let severity: GeoAlertInput["severity"] = "low";
    const s = a.sentimentScore;
    if (typeof s === "number") {
      if (s < -0.6) severity = "critical";
      else if (s < -0.3) severity = "high";
      else if (s < -0.1) severity = "medium";
    }
    return {
      source: a.source,
      sentimentScore: a.sentimentScore,
      severity,
    };
  });

  const allAggregates = aggregateAlertsByCity(geoAlerts);

  // Villes marocaines avec mentions (triées par mentionCount desc).
  const moroccoAggregates = allAggregates
    .filter((a) => MOROCCAN_REGIONS.has(a.region))
    .slice(0, 12);

  // ─── 5. Siège social (grille fantôme si non couvert) ──────
  //  On ajoute la ville du siège social marocain en mentionCount=0
  //  si elle n'est pas déjà dans la liste — pour que la carte
  //  montre toujours où est basée l'entreprise.
  const hqGeo = hqToMoroccoCity(fullCompany?.headquarters ?? null);

  // ─── 6. Construction du tableau cities ────────────────────
  let cities: GeoCity[];

  if (moroccoAggregates.length === 0) {
    // Aucun article localisé sur 30j → fallback 6 villes + siège.
    const seen = new Set(FALLBACK_CITIES.map((c) => c.name.toLowerCase()));
    const extras: GeoCity[] = [];
    if (hqGeo && !seen.has(hqGeo.city.toLowerCase())) {
      extras.push({
        name: hqGeo.city,
        lat: hqGeo.lat,
        lng: hqGeo.lng,
        mentionCount: 0,
        avgSentiment: null,
      });
    }
    cities = [...FALLBACK_CITIES, ...extras];
  } else {
    cities = moroccoAggregates.map((p) => ({
      name: p.city,
      lat: p.lat,
      lng: p.lng,
      mentionCount: p.alertCount,
      avgSentiment:
        typeof p.avgSentiment === "number" ? round3(p.avgSentiment) : null,
    }));

    // Ajout du siège s'il n'est pas déjà présent.
    if (hqGeo) {
      const present = cities.some(
        (c) => c.name.toLowerCase() === hqGeo.city.toLowerCase(),
      );
      if (!present) {
        cities.push({
          name: hqGeo.city,
          lat: hqGeo.lat,
          lng: hqGeo.lng,
          mentionCount: 0,
          avgSentiment: null,
        });
      }
    }
  }

  // ─── 7. Agrégation marchés (8 codes ISO-2) ────────────────
  //  Pour chaque article, on détecte le marché puis on accumule
  //  (count, somme sentiment) par code. On garde aussi les lignes
  //  pour le calcul de l'avgSentiment final.
  const marketBuckets = new Map<
    string,
    { mentions: number; sentimentSum: number; sentimentCount: number }
  >();
  for (const m of MARKETS) {
    marketBuckets.set(m.code, { mentions: 0, sentimentSum: 0, sentimentCount: 0 });
  }

  for (const a of articles) {
    const code = detectMarket(a.source);
    const bucket = marketBuckets.get(code);
    if (!bucket) continue; // code non dans les 8 marchés (impossible)
    bucket.mentions += 1;
    if (typeof a.sentimentScore === "number" && !Number.isNaN(a.sentimentScore)) {
      bucket.sentimentSum += a.sentimentScore;
      bucket.sentimentCount += 1;
    }
  }

  const markets: GeoMarket[] = MARKETS.map((m) => {
    const b = marketBuckets.get(m.code)!;
    const sentiment =
      b.sentimentCount > 0
        ? round3(b.sentimentSum / b.sentimentCount)
        : null;
    const crisisFlag =
      b.mentions >= CRISIS_MIN_MENTIONS &&
      sentiment != null &&
      sentiment <= CRISIS_MAX_SENTIMENT;
    return {
      code: m.code,
      name: m.name,
      mentions: b.mentions,
      sentiment,
      crisisFlag,
    };
  });

  // ─── 8. Meta ──────────────────────────────────────────────
  const meta: GeoHeatmapMeta = {
    companyName: fullCompany?.name ?? company.name,
    sector: fullCompany?.sector ?? company.sector,
    generatedAt: new Date().toISOString(),
    windowDays: WINDOW_DAYS,
    source: isDemo ? "demo" : "real",
  };

  const legacySource: "real" | "demo" | "fallback" =
    moroccoAggregates.length === 0
      ? "fallback"
      : isDemo
        ? "demo"
        : "real";

  return {
    cities,
    markets,
    meta,
    legacySource,
    company: { name: company.name, slug: company.slug },
  };
}

// ═══════════════════════════════════════════════════════════════
//  POST — Skill 25 Geo Heatmap Generator
// ═══════════════════════════════════════════════════════════════

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAccountTypeAllowed(session, ["essential", "pro", "enterprise", "agency"])) {
    return NextResponse.json(
      { error: "Forbidden — insufficient account permissions" },
      { status: 403 },
    );
  }

  // Résolution entreprise — échec = 401/403/404 structuré (POST
  // n'a pas de fast-path fallback comme GET : le popup affiche
  // l'erreur et l'utilisateur peut réessayer).
  const result = await requireUserCompany();
  if (!result.ok) {
    return result.response;
  }

  try {
    const built = await buildGeoHeatmap(result.data);

    const payload: GeoHeatmapResponse = {
      cities: built.cities,
      markets: built.markets,
      meta: built.meta,
    };

    logInfo(
      "console.geo-heatmap.post",
      `company=${built.company?.slug} cities=${built.cities.length} markets=${built.markets.length} crises=${built.markets.filter((m) => m.crisisFlag).length}`,
    );

    return NextResponse.json(payload);
  } catch (err) {
    logError("console.geo-heatmap.post", `Geo heatmap POST error: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}

// ═══════════════════════════════════════════════════════════════
//  GET — legacy EssentialDashboard compatibility
//  Same data, legacy shape { company, range, cities, source }.
// ═══════════════════════════════════════════════════════════════

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAccountTypeAllowed(session, ["essential", "pro", "enterprise", "agency"])) {
    return NextResponse.json(
      { error: "Forbidden — insufficient account permissions" },
      { status: 403 },
    );
  }

  // Tentative de résolution entreprise — si elle échoue (403
  // onboarding, 404 entreprise supprimée), on renvoie la grille
  // de fallback plutôt qu'une erreur, pour ne pas casser le
  // rendu du EssentialDashboard. C'est le fast-path hérité du
  // handler GET original.
  const result = await requireUserCompany();
  if (!result.ok) {
    const legacy: GeoHeatmapLegacy = {
      company: null,
      range: `${WINDOW_DAYS}d`,
      cities: FALLBACK_CITIES,
      source: "fallback",
    };
    return NextResponse.json(legacy);
  }

  try {
    const built = await buildGeoHeatmap(result.data);

    const legacy: GeoHeatmapLegacy = {
      company: built.company,
      range: `${WINDOW_DAYS}d`,
      cities: built.cities,
      source: built.legacySource,
    };

    return NextResponse.json(legacy);
  } catch (err) {
    logError("console.geo-heatmap.get", `Geo heatmap GET error: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
