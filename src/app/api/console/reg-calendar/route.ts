// ═══════════════════════════════════════════════════════════════
//  POST /api/console/reg-calendar
//
//  Returns the upcoming regulatory deadlines for the Moroccan
//  regulatory perimeter the console tracks:
//
//    • CNDP  — Commission Nationale de contrôle de la Protection
//               des Données à caractère Personnel (loi 09-08 +
//               RGPD-equivalent obligations)
//    • AMMC  — Autorité Marocaine du Marché des Capitaux
//    • BAM   — Bank Al-Maghrib
//    • ESG   — Reporting RSE / extra-financier (CSRD-aligned)
//    • GDPR  — Cadre RGPD européen (traitement transfrontalier)
//
//  Each deadline carries:
//    { id, date (YYYY-MM-DD), regulator, title, status,
//      requirement, documents[], team }
//
//  Status is computed relative to "today":
//    • date < today  → "dépassé"
//    • date = today  → "échéance"
//    • date > today  → "à venir"
//
//  Data source: The existing /api/console/regulatory-feed endpoint
//  serves AMMC / BAM / BVC *publications* (past items already
//  published by the regulator). Forward-looking *deadline*
//  obligations are a different concept — there is no dedicated
//  `regulatoryDeadline` Prisma model. Rather than coupling this
//  route to a non-existent schema, we seed a realistic dataset
//  anchored on the current date so the calendar is always populated
//  regardless of when it is opened. The seed spans the previous,
//  current, and next month, so the calendar UI can navigate
//  adjacent months without re-fetching.
//
//  Body (optional):
//    { "month": "YYYY-MM" }  — focus month echoed back as
//                              `focusMonth` for the UI's initial
//                              view. Deadlines are NOT filtered by
//                              this param (the UI filters client-
//                              side so month navigation is instant).
//
//  Auth: NextAuth session required.
//
//  Task ID: SKILL-12-REG-CALENDAR
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { logError, logInfo } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

type Regulator = "CNDP" | "AMMC" | "BAM" | "ESG" | "GDPR";
type Status = "à venir" | "échéance" | "dépassé";

interface Deadline {
  id: string;
  date: string; // YYYY-MM-DD
  regulator: Regulator;
  title: string;
  status: Status;
  requirement: string;
  documents: string[];
  team: string;
}

interface DeadlineTemplate {
  offset: number; // days from today
  regulator: Regulator;
  title: string;
  requirement: string;
  documents: string[];
  team: string;
}

// ─── SEED TEMPLATES ──────────────────────────────────────────────
//
//  Offsets span roughly -8 .. +33 days so the calendar always has
//  content in the previous, current, and next month. The seed is
//  deterministic per day (anchored on the current local date at
//  00:00) so re-fetches within the same day return stable data.

const TEMPLATES: DeadlineTemplate[] = [
  {
    offset: -8,
    regulator: "GDPR",
    title: "Notification de violation de données",
    requirement:
      "Déclaration d'une violation de données à caractère personnel auprès de l'autorité compétente dans les 72 heures suivant la détection.",
    documents: [
      "Rapport d'incident",
      "Journal d'audit système",
      "Liste des personnes affectées",
    ],
    team: "DSI",
  },
  {
    offset: -3,
    regulator: "CNDP",
    title: "Renouvellement de l'autorisation de traitement",
    requirement:
      "Dépôt du dossier de renouvellement annuel de l'autorisation de traitement auprès de la CNDP (loi 09-08).",
    documents: [
      "Formulaire CNDP-A1",
      "Analyse d'impact (DPIA) à jour",
      "Registre des traitements",
    ],
    team: "Juridique",
  },
  {
    offset: -1,
    regulator: "AMMC",
    title: "Déclaration des opérations d'initiés",
    requirement:
      "Déclaration mensuelle des transactions effectuées par les personnes détenant des informations privilégiées (règlement AMMC).",
    documents: ["Déclaration AMMC-IO", "Registre des transactions internes"],
    team: "Conformité",
  },
  {
    offset: 0,
    regulator: "BAM",
    title: "Déclaration des opérations de change",
    requirement:
      "Reporting mensuel des opérations de change effectuées par l'établissement, transmis à Bank Al-Maghrib.",
    documents: ["État BAM-FC", "Relevé des opérations de change"],
    team: "Finance",
  },
  {
    offset: 2,
    regulator: "ESG",
    title: "Reporting empreinte carbone — Scope 1 & 2",
    requirement:
      "Transmission trimestrielle des données d'émissions directes et indirectes de gaz à effet de serre.",
    documents: [
      "Tableau de bord carbone",
      "Factures d'énergie",
      "Rapport d'audit environnemental",
    ],
    team: "Développement Durable",
  },
  {
    offset: 4,
    regulator: "AMMC",
    title: "Dépôt du rapport financier trimestriel",
    requirement:
      "Dépôt du rapport financier trimestriel auprès de l'AMMC pour les sociétés cotées (règlement n° 13-14).",
    documents: [
      "Rapport financier T",
      "États financiers certifiés",
      "Note d'information",
    ],
    team: "Finance",
  },
  {
    offset: 6,
    regulator: "CNDP",
    title: "Mise à jour du registre des traitements",
    requirement:
      "Mise à jour mensuelle du registre des traitements et déclaration des nouveaux traitements mis en œuvre.",
    documents: [
      "Registre des traitements",
      "Analyses d'impact (DPIA)",
      "Accusé de réception CNDP",
    ],
    team: "Juridique",
  },
  {
    offset: 9,
    regulator: "BAM",
    title: "Reporting Bâle III — ratio de liquidité LCR",
    requirement:
      "Calcul et transmission du ratio de liquidité à court terme (Liquidity Coverage Ratio) selon les accords de Bâle III.",
    documents: [
      "Tableur LCR",
      "Justificatifs des actifs liquides",
      "Note méthodologique",
    ],
    team: "Conformité",
  },
  {
    offset: 11,
    regulator: "GDPR",
    title: "Revue trimestrielle des consentements",
    requirement:
      "Audit de la validité des consentements collectés auprès des utilisateurs (RGPD + loi 09-08).",
    documents: [
      "Journal des consentements",
      "Preuves de consentement",
      "Rapport d'audit interne",
    ],
    team: "Juridique",
  },
  {
    offset: 14,
    regulator: "ESG",
    title: "Audit social annuel",
    requirement:
      "Transmission du rapport d'audit social portant sur les conditions de travail, la diversité et l'égalité professionnelle.",
    documents: ["Rapport d'audit social", "Indicateurs RH", "Plan d'action"],
    team: "Ressources Humaines",
  },
  {
    offset: 17,
    regulator: "AMMC",
    title: "Publication des résultats semestriels",
    requirement:
      "Diffusion publique des résultats semestriels et mise en ligne du rapport détaillé sur le site de l'AMMC.",
    documents: [
      "Communiqué de résultats",
      "Rapport semestriel",
      "Présentation analystes",
    ],
    team: "Communication Financière",
  },
  {
    offset: 19,
    regulator: "BAM",
    title: "Déclaration IPC mensuelle",
    requirement:
      "Transmission des données de l'indice des prix à la consommation pour le mois écoulé.",
    documents: ["Tableau IPC", "Données brutes sectorielles"],
    team: "Finance",
  },
  {
    offset: 22,
    regulator: "GDPR",
    title: "Registre des activités de traitement — audit trimestriel",
    requirement:
      "Revue complète du registre des activités de traitement conformément à l'article 30 du RGPD.",
    documents: [
      "Registre ART",
      "Cartographie des données",
      "Revue de conformité",
    ],
    team: "Conformité",
  },
  {
    offset: 25,
    regulator: "CNDP",
    title: "Déclaration préalable d'un nouveau traitement",
    requirement:
      "Dépôt d'une déclaration préalable pour la mise en œuvre d'un nouveau traitement de données personnelles.",
    documents: [
      "Formulaire CNDP-DP",
      "Analyse d'impact (DPIA)",
      "Engagement de conformité",
    ],
    team: "Juridique",
  },
  {
    offset: 28,
    regulator: "ESG",
    title: "Publication du rapport RSE annuel",
    requirement:
      "Diffusion publique du rapport de responsabilité sociétale des entreprises (aligné sur les standards GRI).",
    documents: ["Rapport RSE", "Indicateurs GRI", "Lettre du PDG"],
    team: "Développement Durable",
  },
  {
    offset: 33,
    regulator: "AMMC",
    title: "Mise à jour du document de référence",
    requirement:
      "Dépôt de la mise à jour annuelle du document de référence (document de base enregistré auprès de l'AMMC).",
    documents: [
      "Document de référence",
      "États financiers consolidés",
      "Rapport des commissaires aux comptes",
    ],
    team: "Conformité",
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Format a Date as YYYY-MM-DD in local time (avoids UTC off-by-one). */
function formatDate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Build the full deadline list by anchoring templates on today. */
function buildDeadlines(): Deadline[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return TEMPLATES.map((t, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + t.offset);
    const dateStr = formatDate(d);

    // Status is computed from the offset to remain deterministic
    // even if the server clock and the client clock drift slightly.
    const status: Status =
      t.offset < 0 ? "dépassé" : t.offset === 0 ? "échéance" : "à venir";

    return {
      id: `dl-${i + 1}`,
      date: dateStr,
      regulator: t.regulator,
      title: t.title,
      status,
      requirement: t.requirement,
      documents: t.documents,
      team: t.team,
    };
  });
}

// ─── ROUTE HANDLER ───────────────────────────────────────────────

export async function POST(req: Request) {
  // 1. AUTH
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized — session invalid" },
      { status: 401 },
    );
  }

  // 2. OPTIONAL BODY PARSING
  //    Accept { month: "YYYY-MM" } as a focus hint. Ignore malformed
  //    bodies gracefully — the calendar can still render the current
  //    month when no body is provided.
  let focusMonth: string | null = null;
  try {
    const body = await req.json();
    if (
      body &&
      typeof body.month === "string" &&
      /^\d{4}-\d{2}$/.test(body.month)
    ) {
      focusMonth = body.month;
    }
  } catch {
    // Empty / non-JSON body is fine — fall back to current month below.
  }

  try {
    const deadlines = buildDeadlines();
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`;
    const echoedFocus = focusMonth ?? currentMonth;

    logInfo(
      "console.reg-calendar",
      `Returned ${deadlines.length} deadlines (focus=${echoedFocus}, source=seed)`,
    );

    return NextResponse.json({
      focusMonth: echoedFocus,
      deadlines,
      generatedAt: now.toISOString(),
      source: "seed",
      regulators: ["CNDP", "AMMC", "BAM", "ESG", "GDPR"] as Regulator[],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError("console.reg-calendar", `Failed to build deadlines: ${msg}`);
    return NextResponse.json(
      { error: "Failed to load regulatory deadlines", detail: msg },
      { status: 500 },
    );
  }
}
