// ═══════════════════════════════════════════════════════════════
//  POST /api/console/migrate-account-types
//
//  Migration one-shot : convertit les valeurs legacy de accountType
//  (brand-monitor | market-competitor | investment-bank | harch-alpha)
//  vers le nouveau système canonique Harch Atelier
//  (essential | pro | enterprise | agency).
//
//  Pourquoi cette route existe :
//    - Le helper RBAC isAccountTypeAllowed() (P0-2) normalise à runtime
//      les valeurs legacy → nouveau, mais la base de données contient
//      encore les anciennes valeurs. Cette route corrige la source.
//    - La colonne accountType est `String` (pas une enum Prisma) donc
//      aucune migration de schéma n'est nécessaire — seule la valeur
//      des lignes existantes change.
//
//  Mappage (identique au LEGACY_TO_NEW de src/lib/auth/rbac.ts) :
//    brand-monitor      → essential
//    market-competitor  → pro
//    investment-bank    → enterprise
//    harch-alpha        → agency
//
//  Idempotence :
//    - Si aucune ligne User n'a une valeur legacy, la route retourne
//      { migrated: 0, details: [...] avec count: 0 pour chaque type }.
//    - Un second appel après migration réussie est donc safe.
//
//  Auth : admin uniquement (role === "admin" || "super_admin").
//
//  Réponse 200 :
//    {
//      success: true,
//      migrated: <number>,
//      details: [
//        { oldType: "brand-monitor",     newType: "essential",  count: <n> },
//        { oldType: "market-competitor", newType: "pro",        count: <n> },
//        { oldType: "investment-bank",   newType: "enterprise", count: <n> },
//        { oldType: "harch-alpha",       newType: "agency",     count: <n> }
//      ]
//    }
//
//  Task ID: P3-DB-MIGRATION
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { logInfo, logError } from "@/lib/logger";
import { extractIp, extractUserAgent } from "@/lib/harchiq/audit-log";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

// ─── MAPPING TABLE ────────────────────────────────────────────────
// Mirrors LEGACY_TO_NEW in src/lib/auth/rbac.ts. Duplicated locally
// to keep the migration route self-contained and avoid a circular
// import (rbac.ts pulls session helpers that don't matter here).
const LEGACY_TO_NEW: Record<string, string> = {
  "brand-monitor": "essential",
  "market-competitor": "pro",
  "investment-bank": "enterprise",
  "harch-alpha": "agency",
};

const LEGACY_TYPES = Object.keys(LEGACY_TO_NEW);

interface MigrationDetail {
  oldType: string;
  newType: string;
  count: number;
  errors: number;
}

interface MigrationResponse {
  success: true;
  migrated: number;
  details: MigrationDetail[];
}

interface MigrationErrorResponse {
  success: false;
  error: string;
  detail?: string;
}

// ─── ROUTE HANDLER ────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. AUTH — admin uniquement.
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  if (!session || (role !== "admin" && role !== "super_admin")) {
    return NextResponse.json(
      { success: false, error: "Forbidden — admin uniquement." } satisfies MigrationErrorResponse,
      { status: 403 },
    );
  }
  const adminId = session.user?.id ?? null;
  const adminEmail = session.user?.email ?? "unknown";

  logInfo(
    "console.migrate-account-types",
    `Démarrage migration accountType par ${adminEmail} (${adminId ?? "no-id"})`,
  );

  // 2. POUR CHAQUE TYPE LEGACY — find les Users et update individuel.
  //    On boucle par type legacy pour pouvoir grouper le compte-rendu
  //    et éviter de tout charger en mémoire (idempotence garantie par
  //    le where clause : seules les lignes legacy sont touchées).
  const details: MigrationDetail[] = [];
  let totalMigrated = 0;
  let totalErrors = 0;

  for (const oldType of LEGACY_TYPES) {
    const newType = LEGACY_TO_NEW[oldType];
    const detail: MigrationDetail = { oldType, newType, count: 0, errors: 0 };

    try {
      // findMany (pas updateMany) pour respecter la spec "prisma.user.update"
      // et pouvoir capter les erreurs individuelles sans tout abandonner.
      const users = await prisma.user.findMany({
        where: { accountType: oldType },
        select: { id: true, email: true },
      });

      for (const u of users) {
        try {
          await prisma.user.update({
            where: { id: u.id },
            data: { accountType: newType },
          });
          detail.count += 1;
          totalMigrated += 1;
        } catch (err) {
          detail.errors += 1;
          totalErrors += 1;
          const msg = err instanceof Error ? err.message : String(err);
          logError(
            "console.migrate-account-types",
            `Échec update user ${u.email} (${u.id}) ${oldType} → ${newType}: ${msg}`,
          );
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logError(
        "console.migrate-account-types",
        `Échec findMany pour ${oldType}: ${msg}`,
      );
      // On continue avec les autres types legacy — la réponse partielle
      // reste utile pour le debug.
    }

    details.push(detail);
  }

  // 3. LOG FINAL — pas d'AuditAction dédié à la migration dans le type
  //    union, on log via logInfo qui est le standard projet pour les
  //    opérations admin structurées. L'IP et le UA sont capturés pour
  //    traceabilité Loi 09-08.
  logInfo(
    "console.migrate-account-types",
    `Migration terminée — ${totalMigrated} user(s) migré(s), ${totalErrors} erreur(s). ` +
      `IP=${extractIp(req) ?? "n/a"} UA=${extractUserAgent(req) ?? "n/a"}. ` +
      `Détails: ${details.map((d) => `${d.oldType}→${d.newType}:${d.count}`).join(", ")}`,
  );

  const response: MigrationResponse = {
    success: true,
    migrated: totalMigrated,
    details,
  };

  return NextResponse.json(response, { status: 200 });
}

// ─── GET — utilitaire d'inspection (read-only, admin-only) ────────
// Retourne le compte actuel par accountType pour vérifier l'état de
// la migration sans lancer la mutation. Pratique pour un dry-run.

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  if (!session || (role !== "admin" && role !== "super_admin")) {
    return NextResponse.json(
      { success: false, error: "Forbidden — admin uniquement." } satisfies MigrationErrorResponse,
      { status: 403 },
    );
  }

  try {
    // groupBy sur accountType — Prisma supporte cette agrégation.
    const grouped = await prisma.user.groupBy({
      by: ["accountType"],
      _count: { accountType: true },
    });

    const legacyTypes = new Set(LEGACY_TYPES);
    const legacyRows = grouped.filter((g) => legacyTypes.has(g.accountType));
    const legacyTotal = legacyRows.reduce((acc, g) => acc + g._count.accountType, 0);

    return NextResponse.json(
      {
        success: true,
        legacyRemaining: legacyTotal,
        distribution: grouped.map((g) => ({
          accountType: g.accountType,
          count: g._count.accountType,
          isLegacy: legacyTypes.has(g.accountType),
        })),
      },
      { status: 200 },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError("console.migrate-account-types", `Échec groupBy: ${msg}`);
    return NextResponse.json(
      { success: false, error: "Échec de l'inspection.", detail: msg } satisfies MigrationErrorResponse,
      { status: 500 },
    );
  }
}
