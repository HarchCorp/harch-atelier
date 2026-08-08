import { NextRequest, NextResponse } from "next/server";
import {
  getAllCrises,
  getCrisesByCompany,
  getCrisesBySector,
  getCrisesByType,
  getSimilarCrises,
  getRegistryStats,
} from "@/lib/registry/morocco-crises";

export const dynamic = "force-dynamic";

// ═══════════════════════════════════════════════════════════════
//  GET /api/registry
//
//  Le Registre National des Crises Réputationnelles du Maroc.
//  La mémoire. Le moat.
//
//  Query params:
//    ?company=OCP         — crises par entreprise
//    ?sector=Banque       — crises par secteur
//    ?type=boycott        — crises par type
//    ?similar=crisis-001  — crises similaires
//    ?stats=true          — statistiques du registre
// ═══════════════════════════════════════════════════════════════

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const company = url.searchParams.get("company");
  const sector = url.searchParams.get("sector");
  const type = url.searchParams.get("type");
  const similar = url.searchParams.get("similar");
  const stats = url.searchParams.get("stats");

  if (stats === "true") {
    return NextResponse.json(getRegistryStats());
  }

  if (similar) {
    return NextResponse.json({
      crises: getSimilarCrises(similar),
      message: "Crises similaires — pattern matching basé sur l'historique marocain",
    });
  }

  if (company) {
    return NextResponse.json({
      crises: getCrisesByCompany(company),
      message: `Crises documentées pour ${company}`,
    });
  }

  if (sector) {
    return NextResponse.json({
      crises: getCrisesBySector(sector),
      message: `Crises dans le secteur ${sector}`,
    });
  }

  if (type) {
    return NextResponse.json({
      crises: getCrisesByType(type as any),
      message: `Crises de type ${type}`,
    });
  }

  return NextResponse.json({
    crises: getAllCrises(),
    stats: getRegistryStats(),
    message: "Registre National des Crises Réputationnelles du Maroc — la mémoire institutionnelle de Harch Atelier",
  });
}
