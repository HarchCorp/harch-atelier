import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { logError } from "@/lib/logger";
import { isAccountTypeAllowed } from "@/lib/auth/rbac";
import {
  requireUserCompany,
  demoFilterFromSession,
} from "@/lib/harchiq/company-session";
import { aggregateAlertsByCity, knownCities, type GeoAlertInput } from "@/lib/harchiq/geo-mapper";

// ═══════════════════════════════════════════════════════════════
//  GET /api/console/geo-heatmap
//
//  Carte de Chaleur Géo — Section 14 du tableau de bord Essentiel.
//  Aggrège les articles publiés dans les 30 derniers jours par
//  ville de leur source (via le geo-mapper), et renvoie pour
//  chaque ville: nom, lat, lng, nombre de mentions, sentiment moyen.
//
//  Auth: essential | pro | enterprise | agency (admin bypass).
//  Démo: retourne un état vide (cities: []) — la carte affiche
//  les 6 villes marocaines principales avec un compte de 0.
//
//  Task ID: P3-ESSENTIAL-REAL-ROUTES
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

const DAYS = 30;

// Les 6 villes marocaines principales — utilisées comme grille de
// fallback quand l'entreprise n'a aucun article localisé sur la période.
const FALLBACK_CITIES = [
  { name: "Casablanca", lat: 33.5731, lng: -7.5898 },
  { name: "Rabat", lat: 34.0209, lng: -6.8416 },
  { name: "Marrakech", lat: 31.6295, lng: -7.9811 },
  { name: "Fès", lat: 34.0181, lng: -5.0078 },
  { name: "Tanger", lat: 35.7595, lng: -5.834 },
  { name: "Agadir", lat: 30.4278, lng: -9.5981 },
];

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

  try {
    const demoFilter = demoFilterFromSession(session);
    const result = await requireUserCompany();
    if (!result.ok) return result.response;
    const company = await prisma.company.findUnique({
      where: { id: result.data.company.id },
      select: { id: true, name: true, slug: true },
    });

    if (!company) {
      return NextResponse.json({
        company: null,
        range: "30d",
        cities: FALLBACK_CITIES.map((c) => ({
          name: c.name,
          lat: c.lat,
          lng: c.lng,
          mentionCount: 0,
          avgSentiment: null,
        })),
        source: "fallback",
      });
    }

    const since = new Date();
    since.setDate(since.getDate() - DAYS);
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
      take: 5000,
    });

    // ─── Agrégation par ville via le geo-mapper ─────────────────
    //  Chaque article est converti en GeoAlertInput, puis le mapper
    //  regroupe les alertes par ville du siège de la source.
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

    const points = aggregateAlertsByCity(geoAlerts);

    // ─── État vide : renvoyer les 6 villes principales à 0 ──────
    //  Quand l'entreprise n'a aucun article localisé sur la période,
    //  on renvoie une grille de fallback plutôt qu'un tableau vide
    //  pour que la carte affiche une couverture géographique claire.
    if (points.length === 0) {
      return NextResponse.json({
        company: { name: company.name, slug: company.slug },
        range: "30d",
        cities: FALLBACK_CITIES.map((c) => ({
          name: c.name,
          lat: c.lat,
          lng: c.lng,
          mentionCount: 0,
          avgSentiment: null,
        })),
        source: "fallback",
      });
    }

    // ─── Top 6 villes (les plus de mentions) ────────────────────
    //  On garde les 6 villes avec le plus de mentions pour que la
    //  heatmap reste lisible. Les villes connues sans alerte sont
    //  ajoutées en grille fantôme pour montrer la couverture.
    const top = points.slice(0, 6);
    const present = new Set(top.map((p) => p.city));
    const ghost = knownCities()
      .filter((c) => !present.has(c.city))
      .slice(0, Math.max(0, 6 - top.length))
      .map((c) => ({
        name: c.city,
        lat: c.lat,
        lng: c.lng,
        mentionCount: 0,
        avgSentiment: null,
      }));

    const cities = [
      ...top.map((p) => ({
        name: p.city,
        lat: p.lat,
        lng: p.lng,
        mentionCount: p.alertCount,
        avgSentiment:
          typeof p.avgSentiment === "number"
            ? Math.round(p.avgSentiment * 1000) / 1000
            : null,
      })),
      ...ghost,
    ];

    return NextResponse.json({
      company: { name: company.name, slug: company.slug },
      range: "30d",
      cities,
      source: "neon",
    });
  } catch (err) {
    logError("console.geo-heatmap", `Geo heatmap API error: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
