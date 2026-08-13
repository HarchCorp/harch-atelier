// ═══════════════════════════════════════════════════════════════
//  GET  /api/console/campaign-tracker
//  POST /api/console/campaign-tracker
//
//  Skill 28 — Campaign Tracker.
//
//  Suivi des campagnes marketing & influence avec métriques de ROI.
//  Chaque campagne est rattachée à une marque, un influenceur,
//  une fenêtre temporelle (start/end) et un budget en MAD.
//  Le serveur calcule : statut (active/scheduled/completed),
//  progression (pourcentage temporel), portée estimée,
//  taux d'engagement et ROI en pourcentage.
//
//  Persistance : localStorage côté client (PAS de base de données).
//  Le serveur ne peut pas lire localStorage — ce routeur joue donc
//  deux rôles :
//    • GET  : renvoie un payload documentaire expliquant que la
//             liste réelle vit dans le navigateur (clé localStorage
//             `harchiq.campaign-tracker.v1`). Permet aux outils de
//             monitoring / Postman de constater que l'endpoint
//             répond sans erreur.
//    • POST : valide le payload { name, brand, influencer,
//             startDate, endDate, budgetMAD, ...}, génère un id
//             stable (crypto.randomUUID), calcule status et
//             progressPct côté serveur, et renvoie l'objet Campaign
//             normalisé. Le client est ensuite responsable de
//             l'écrire dans localStorage.
//
//  Body (POST) :
//    {
//      name:           string,                 // 1..120 chars
//      brand:          string,                 // 1..80 chars
//      influencer:     string,                 // 1..80 chars
//      startDate:      string,                 // YYYY-MM-DD
//      endDate:        string,                 // YYYY-MM-DD (> start)
//      budgetMAD:      number,                 // > 0, <= 1_000_000_000
//      reach?:         number,                 // >= 0 (défaut: dérivé)
//      engagementRate?:number,                 // 0..100 (défaut: dérivé)
//      roiPct?:        number                  // -100..1000 (défaut: dérivé)
//    }
//
//  Réponses :
//    200 GET  → { campaigns: [], storage: "client-localStorage",
//                 localStorageKey: "harchiq.campaign-tracker.v1" }
//    200 POST → Campaign normalisé (id + status + progressPct +
//               métriques dérivées si absentes)
//    400      → { error: "..." } (payload invalide)
//    401      → { error: "Unauthorized" }
//
//  Skill ID : SKILL-28-CAMPAIGN
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { isAccountTypeAllowed } from "@/lib/auth/rbac";
import { logInfo } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

// ─── Clé localStorage partagée avec le client ─────────────────
export const CAMPAIGN_TRACKER_LOCALSTORAGE_KEY = "harchiq.campaign-tracker.v1";

// ─── Types renvoyés au client ─────────────────────────────────

export type CampaignStatus = "active" | "scheduled" | "completed";

export interface Campaign {
  id: string;
  name: string;
  brand: string;
  influencer: string;
  status: CampaignStatus;
  startDate: string;        // YYYY-MM-DD
  endDate: string;          // YYYY-MM-DD
  budgetMAD: number;
  reach: number;
  engagementRate: number;   // percentage 0..100, 2 decimals
  roiPct: number;           // percentage, 2 decimals
  progressPct: number;      // 0..100, rounded
  createdAt: string;        // ISO 8601
}

// ─── Limites de validation ────────────────────────────────────

const NAME_MAX = 120;
const BRAND_MAX = 80;
const INFLUENCER_MAX = 80;
const BUDGET_MIN = 1;
const BUDGET_MAX = 1_000_000_000;
const REACH_MAX = 10_000_000_000;
const ENGAGEMENT_MAX = 100;
const ROI_MIN = -100;
const ROI_MAX = 1000;

// ─── Helpers de validation ────────────────────────────────────

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

// Valide une date au format YYYY-MM-DD et renvoie le Date à minuit
// UTC, ou null si invalide.
function parseDate(s: string): Date | null {
  // Format strict YYYY-MM-DD.
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  const d = new Date(Date.UTC(year, month - 1, day));
  // Vérifier que la date ne déborde pas (ex: 31 février).
  if (
    d.getUTCFullYear() !== year ||
    d.getUTCMonth() !== month - 1 ||
    d.getUTCDate() !== day
  ) {
    return null;
  }
  return d;
}

// ─── Calcul du statut & de la progression ─────────────────────
//
// Statut :
//   scheduled  : aujourd'hui < startDate
//   active     : startDate <= aujourd'hui <= endDate
//   completed  : aujourd'hui > endDate
//
// Progression : part temporelle écoulée entre start et end,
// arrondie au pourcentage entier, bornée 0..100.
function computeStatusAndProgress(
  startDate: string,
  endDate: string,
): { status: CampaignStatus; progressPct: number } {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (!start || !end) return { status: "scheduled", progressPct: 0 };

  const todayMidnight = new Date();
  todayMidnight.setUTCHours(0, 0, 0, 0);

  if (todayMidnight < start) return { status: "scheduled", progressPct: 0 };
  if (todayMidnight > end) return { status: "completed", progressPct: 100 };

  const totalMs = end.getTime() - start.getTime();
  const elapsedMs = todayMidnight.getTime() - start.getTime();
  if (totalMs <= 0) return { status: "active", progressPct: 0 };
  const progress = Math.min(
    100,
    Math.max(0, Math.round((elapsedMs / totalMs) * 100)),
  );
  return { status: "active", progressPct: progress };
}

// ─── Métriques dérivées (si absentes du payload) ──────────────
//
// reach         : portée estimée à partir du budget.
//                  Heuristique : ~35 impressions MAD investies.
//                  Plafonnée à 100M pour rester crédible.
// engagementRate: taux d'engagement moyen dérivé du budget,
//                  entre 2.5% et 6.0% (plage typique Instagram/TikTok).
// roiPct        : ROI estimé = (engagement * portée * 0.025 MAD par
//                  interaction engagée - budget) / budget * 100.
//                  Simplifié, sert de point de départ. L'utilisateur
//                  peut le surcharger via le calculateur ROI du modal.
function deriveMetrics(budgetMAD: number): {
  reach: number;
  engagementRate: number;
  roiPct: number;
} {
  const reach = Math.min(100_000_000, Math.max(1000, Math.round(budgetMAD * 35)));
  // Deterministe à partir du budget : évite le bruit de Math.random().
  const engagement = Math.round((2.5 + (budgetMAD % 7) * 0.5) * 100) / 100;
  const clampedEngagement = Math.min(ENGAGEMENT_MAX, Math.max(0, engagement));
  const interactions = reach * (clampedEngagement / 100);
  const revenue = interactions * 0.025; // 0.025 MAD de valeur par interaction engagée
  const roi = ((revenue - budgetMAD) / budgetMAD) * 100;
  const roiClamped = Math.min(ROI_MAX, Math.max(ROI_MIN, Math.round(roi * 100) / 100));
  return {
    reach,
    engagementRate: clampedEngagement,
    roiPct: roiClamped,
  };
}

// ═══════════════════════════════════════════════════════════════
//  GET — documentation / sentinel
// ═══════════════════════════════════════════════════════════════

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Le serveur ne peut pas lire localStorage — on renvoie un
  // payload documentaire. Le client lit directement localStorage
  // via la clé partagée `CAMPAIGN_TRACKER_LOCALSTORAGE_KEY`.
  return NextResponse.json({
    campaigns: [],
    storage: "client-localStorage",
    localStorageKey: CAMPAIGN_TRACKER_LOCALSTORAGE_KEY,
    note: "Les campagnes sont persistées côté client dans localStorage. Le serveur ne stocke aucune donnée.",
  });
}

// ═══════════════════════════════════════════════════════════════
//  POST — valider + normaliser + renvoyer
// ═══════════════════════════════════════════════════════════════

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (
    !isAccountTypeAllowed(session, [
      "essential",
      "pro",
      "enterprise",
      "agency",
    ])
  ) {
    return NextResponse.json(
      { error: "Forbidden — insufficient account permissions" },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête invalide (JSON attendu)" },
      { status: 400 },
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Payload invalide" },
      { status: 400 },
    );
  }

  const obj = body as Record<string, unknown>;

  // ─── Champs requis ──────────────────────────────────────────
  const name = obj.name;
  if (!isNonEmptyString(name)) {
    return NextResponse.json(
      { error: "Champ 'name' requis (chaîne non vide)" },
      { status: 400 },
    );
  }
  if (name.trim().length > NAME_MAX) {
    return NextResponse.json(
      { error: `Champ 'name' trop long (max ${NAME_MAX} caractères)` },
      { status: 400 },
    );
  }

  const brand = obj.brand;
  if (!isNonEmptyString(brand)) {
    return NextResponse.json(
      { error: "Champ 'brand' requis (chaîne non vide)" },
      { status: 400 },
    );
  }
  if (brand.trim().length > BRAND_MAX) {
    return NextResponse.json(
      { error: `Champ 'brand' trop long (max ${BRAND_MAX} caractères)` },
      { status: 400 },
    );
  }

  const influencer = obj.influencer;
  if (!isNonEmptyString(influencer)) {
    return NextResponse.json(
      { error: "Champ 'influencer' requis (chaîne non vide)" },
      { status: 400 },
    );
  }
  if (influencer.trim().length > INFLUENCER_MAX) {
    return NextResponse.json(
      {
        error: `Champ 'influencer' trop long (max ${INFLUENCER_MAX} caractères)`,
      },
      { status: 400 },
    );
  }

  const startDateRaw = obj.startDate;
  if (!isNonEmptyString(startDateRaw) || !parseDate(startDateRaw)) {
    return NextResponse.json(
      { error: "Champ 'startDate' invalide (format YYYY-MM-DD attendu)" },
      { status: 400 },
    );
  }
  const startDate = startDateRaw;

  const endDateRaw = obj.endDate;
  if (!isNonEmptyString(endDateRaw) || !parseDate(endDateRaw)) {
    return NextResponse.json(
      { error: "Champ 'endDate' invalide (format YYYY-MM-DD attendu)" },
      { status: 400 },
    );
  }
  const endDate = endDateRaw;

  if (parseDate(endDate)!.getTime() <= parseDate(startDate)!.getTime()) {
    return NextResponse.json(
      { error: "'endDate' doit être postérieure à 'startDate'" },
      { status: 400 },
    );
  }

  // ─── Budget ────────────────────────────────────────────────
  const budgetRaw = obj.budgetMAD;
  if (!isFiniteNumber(budgetRaw)) {
    return NextResponse.json(
      { error: "Champ 'budgetMAD' requis (nombre fini)" },
      { status: 400 },
    );
  }
  if (budgetRaw < BUDGET_MIN || budgetRaw > BUDGET_MAX) {
    return NextResponse.json(
      {
        error: `Champ 'budgetMAD' hors plage (entre ${BUDGET_MIN} et ${BUDGET_MAX} MAD)`,
      },
      { status: 400 },
    );
  }
  const budgetMAD = Math.round(budgetRaw * 100) / 100;

  // ─── Métriques optionnelles ────────────────────────────────
  const derived = deriveMetrics(budgetMAD);

  let reach = derived.reach;
  if (obj.reach !== undefined && obj.reach !== null) {
    if (!isFiniteNumber(obj.reach) || obj.reach < 0 || obj.reach > REACH_MAX) {
      return NextResponse.json(
        {
          error: `Champ 'reach' invalide (nombre >= 0, <= ${REACH_MAX})`,
        },
        { status: 400 },
      );
    }
    reach = Math.round(obj.reach);
  }

  let engagementRate = derived.engagementRate;
  if (
    obj.engagementRate !== undefined &&
    obj.engagementRate !== null
  ) {
    if (
      !isFiniteNumber(obj.engagementRate) ||
      obj.engagementRate < 0 ||
      obj.engagementRate > ENGAGEMENT_MAX
    ) {
      return NextResponse.json(
        {
          error: `Champ 'engagementRate' invalide (0..${ENGAGEMENT_MAX})`,
        },
        { status: 400 },
      );
    }
    engagementRate = Math.round(obj.engagementRate * 100) / 100;
  }

  let roiPct = derived.roiPct;
  if (obj.roiPct !== undefined && obj.roiPct !== null) {
    if (
      !isFiniteNumber(obj.roiPct) ||
      obj.roiPct < ROI_MIN ||
      obj.roiPct > ROI_MAX
    ) {
      return NextResponse.json(
        {
          error: `Champ 'roiPct' invalide (${ROI_MIN}..${ROI_MAX})`,
        },
        { status: 400 },
      );
    }
    roiPct = Math.round(obj.roiPct * 100) / 100;
  }

  // ─── Statut & progression (calculés serveur) ───────────────
  const { status, progressPct } = computeStatusAndProgress(startDate, endDate);

  const now = new Date().toISOString();
  const campaign: Campaign = {
    id: crypto.randomUUID(),
    name: name.trim(),
    brand: brand.trim(),
    influencer: influencer.trim(),
    status,
    startDate,
    endDate,
    budgetMAD,
    reach,
    engagementRate,
    roiPct,
    progressPct,
    createdAt: now,
  };

  logInfo(
    "campaign-tracker",
    `Campaign normalized: "${campaign.name}" (id=${campaign.id}, brand=${campaign.brand}, status=${status}, budget=${budgetMAD} MAD)`,
  );

  return NextResponse.json(campaign);
}
