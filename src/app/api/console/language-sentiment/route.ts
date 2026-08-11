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

// ═══════════════════════════════════════════════════════════════
//  GET /api/console/language-sentiment
//
//  Météo Sentiments par Langue — Section 17 du tableau de bord
//  Essentiel.  Regroupe les articles publiés dans les 30 derniers
//  jours par langue, et renvoie pour chaque langue le nombre
//  d'articles, le sentiment moyen et la répartition positive /
//  neutre / négative en pourcentage.
//
//  Normalisation des codes de langue:
//    fr | fre | fra | french      → fr  ("Français")
//    ar | ara | arb | arabic      → ar  ("Arabe / Darija")
//    en | eng | english           → en  ("Anglais")
//    darija | mixed | other       → other ("Autre")
//
//  Sortie: {
//    languages: [{ code, label, articleCount, avgSentiment,
//                  positivePct, neutralPct, negativePct }]
//  }
//
//  Auth: essential | pro | enterprise | agency (admin bypass).
//  Démo: retourne languages: [] — la carte affiche « Aucune donnée ».
//
//  Task ID: P3-ESSENTIAL-REAL-ROUTES
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

const DAYS = 30;

type LangCode = "fr" | "ar" | "en" | "other";

const LANG_META: Record<LangCode, { label: string }> = {
  fr: { label: "Français" },
  ar: { label: "Arabe / Darija" },
  en: { label: "Anglais" },
  other: { label: "Autre" },
};

function normalizeLangCode(raw: string | null | undefined): LangCode {
  if (!raw) return "other";
  const v = raw.toLowerCase().trim();
  if (["fr", "fre", "fra", "french", "français", "francais"].includes(v)) return "fr";
  if (["ar", "ara", "arb", "arabic", "arabe", "darija"].includes(v)) return "ar";
  if (["en", "eng", "english", "anglais"].includes(v)) return "en";
  return "other";
}

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
        languages: [],
        source: "empty",
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
        language: true,
        sentimentScore: true,
        sentimentLabel: true,
      },
      take: 10000,
    });

    // ─── Agrégation par langue normalisée ───────────────────────
    const agg = new Map<
      LangCode,
      {
        count: number;
        sum: number;
        scored: number;
        positive: number;
        neutral: number;
        negative: number;
      }
    >();

    for (const code of Object.keys(LANG_META) as LangCode[]) {
      agg.set(code, { count: 0, sum: 0, scored: 0, positive: 0, neutral: 0, negative: 0 });
    }

    for (const a of articles) {
      const code = normalizeLangCode(a.language);
      const b = agg.get(code)!;
      b.count += 1;
      if (typeof a.sentimentScore === "number" && !Number.isNaN(a.sentimentScore)) {
        b.sum += a.sentimentScore;
        b.scored += 1;
      }
      if (a.sentimentLabel === "positive") b.positive += 1;
      else if (a.sentimentLabel === "negative") b.negative += 1;
      else if (a.sentimentLabel === "neutral") b.neutral += 1;
    }

    // ─── Format de sortie ───────────────────────────────────────
    //  On ne renvoie que les langues avec au moins un article.
    //  L'ordre est fr → ar → en → other pour correspondre à l'ordre
    //  du graphique empilé du dashboard.
    const order: LangCode[] = ["fr", "ar", "en", "other"];
    const languages = order
      .map((code) => {
        const b = agg.get(code)!;
        const positivePct = b.count > 0 ? Math.round((b.positive / b.count) * 100) : 0;
        const neutralPct = b.count > 0 ? Math.round((b.neutral / b.count) * 100) : 0;
        const negativePct = b.count > 0 ? Math.round((b.negative / b.count) * 100) : 0;
        return {
          code,
          label: LANG_META[code].label,
          articleCount: b.count,
          avgSentiment:
            b.scored > 0 ? Math.round((b.sum / b.scored) * 1000) / 1000 : null,
          positivePct,
          neutralPct,
          negativePct,
        };
      })
      .filter((l) => l.articleCount > 0);

    return NextResponse.json({
      company: { name: company.name, slug: company.slug },
      range: "30d",
      languages,
      source: "neon",
    });
  } catch (err) {
    logError("console.language-sentiment", `Language sentiment API error: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
