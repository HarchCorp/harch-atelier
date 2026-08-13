// ═══════════════════════════════════════════════════════════════
//  POST /api/console/pitch-deck
//
//  Generates a 12-slide sales pitch deck for a prospect — data
//  backed, French, ready to present. The deck is NOT a chat artefact:
//  it's a structured carousel of slides the Dircom can show during a
//  sales meeting or export to PDF.
//
//  Body:
//    {
//      prospectName?: string        // defaults to user's company name
//      prospectSector?: string      // defaults to user's company sector
//      prospectCompetitors?: string // free-text competitor list
//    }
//
//  Auth: requires session (getServerSession). Resolves the user's
//  primary company via requireUserCompany so we can fetch the latest
//  reputation score, sentiment breakdown, and crisis level for slide
//  5 (Score de réputation) and slide 9 (Détection de crise).
//
//  12 slides:
//     1. Title        — prospect + "Veille Réputationnelle"
//     2. Problem      — why reputation monitoring matters
//     3. Market       — Moroccan media landscape stats
//     4. Solution     — Harch Atelier overview
//     5. Score        — demo reputation score with gauge
//     6. Sources      — 11+ Moroccan sources
//     7. HarchIQ AI   — capabilities + quotas per plan
//     8. Sentiment    — FR / AR / Darija trilingual
//     9. Crisis       — real-time alert example
//    10. Pricing      — 4 plans (Essentiel / Pro / Enterprise / Agency)
//    11. Case study   — anonymized success story
//    12. Contact CTA  — sales contact
//
//  Skill ID: SKILL-7-PITCH-DECK
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { requireUserCompany } from "@/lib/harchiq/company-session";
import { prisma } from "@/lib/db";
import { logInfo, logError } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 20;

// ─── Types (returned to the client) ─────────────────────────────

export type SlideType = "title" | "content" | "data" | "pricing" | "cta";

export interface PitchSlide {
  number: number;
  title: string;
  type: SlideType;
  content: string;
  data?: Record<string, unknown>;
}

export interface PitchDeckResponse {
  slides: PitchSlide[];
  meta: {
    prospectName: string;
    prospectSector: string | null;
    generatedAt: string;
  };
}

interface PitchDeckRequestBody {
  prospectName?: string;
  prospectSector?: string;
  prospectCompetitors?: string;
}

// ─── POST handler ───────────────────────────────────────────────

export async function POST(req: Request) {
  const sessionResult = await requireUserCompany();
  if (!sessionResult.ok) return sessionResult.response;

  const { company, userId, demoFilter } = sessionResult.data;

  // ─── Parse body (all fields optional) ────────────────────────
  let body: PitchDeckRequestBody = {};
  try {
    const text = await req.text();
    if (text.trim()) body = JSON.parse(text) as PitchDeckRequestBody;
  } catch {
    // Empty or malformed body — fall back to defaults below.
  }

  const prospectName = (body.prospectName?.trim() || company.name) as string;
  const prospectSector = body.prospectSector?.trim() || company.sector || null;
  const prospectCompetitors = body.prospectCompetitors?.trim() || null;

  try {
    // ─── Fetch real reputation data for slide 5 + 8 ─────────────
    // Spread demoFilter to isolate demo data from real data
    // (task: domain-matching-demo-isolation — demo users see only
    // demo data, real users see only real data).
    const [latestScore, articles7d] = await Promise.all([
      prisma.reputationScore.findFirst({
        where: { companyId: company.id, ...demoFilter },
        orderBy: { createdAt: "desc" },
        select: {
          overall: true,
          sentiment: true,
          aiVisibility: true,
          volume: true,
          authority: true,
          createdAt: true,
        },
      }),
      prisma.article.findMany({
        where: {
          companyId: company.id,
          publishedAt: { gte: new Date(Date.now() - 7 * 86400000) },
          ...demoFilter,
        },
        select: { sentimentLabel: true, language: true },
        take: 500,
      }),
    ]);

    // ─── Compute sentiment breakdown for slide 8 ────────────────
    const total = articles7d.length;
    const positive = articles7d.filter((a) => a.sentimentLabel === "positive").length;
    const neutral = articles7d.filter((a) => a.sentimentLabel === "neutral").length;
    const negative = articles7d.filter((a) => a.sentimentLabel === "negative").length;
    const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

    // Language distribution
    const frCount = articles7d.filter((a) => a.language === "fr").length;
    const arCount = articles7d.filter((a) => a.language === "ar").length;
    const darijaCount = articles7d.filter((a) => a.language === "darija").length;

    // ─── Demo score (use real if available, else sensible default) ──
    const demoScore = latestScore ? Math.round(latestScore.overall) : 74;
    const demoTrend = 6;

    // ─── Build the 12 slides ────────────────────────────────────
    const slides: PitchSlide[] = [
      buildSlide1Title(prospectName, prospectSector),
      buildSlide2Problem(),
      buildSlide3Market(),
      buildSlide4Solution(),
      buildSlide5Score(prospectName, demoScore, demoTrend, latestScore),
      buildSlide6Sources(),
      buildSlide7HarchIQAI(),
      buildSlide8Sentiment(pct(positive), pct(neutral), pct(negative), frCount, arCount, darijaCount),
      buildSlide9Crisis(prospectName),
      buildSlide10Pricing(),
      buildSlide11CaseStudy(prospectSector),
      buildSlide12Contact(prospectName, prospectCompetitors),
    ];

    const response: PitchDeckResponse = {
      slides,
      meta: {
        prospectName,
        prospectSector,
        generatedAt: new Date().toISOString(),
      },
    };

    logInfo(
      "pitch-deck",
      `Pitch deck generated for ${prospectName} (userId=${userId}, companyId=${company.id}) — ${slides.length} slides`,
    );

    return NextResponse.json(response);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    logError("pitch-deck", `Generate failed for userId=${userId}: ${msg}`);
    return NextResponse.json(
      { error: "Échec de la génération du pitch deck.", detail: msg },
      { status: 500 },
    );
  }
}

// ═══════════════════════════════════════════════════════════════
//  SLIDE BUILDERS
//  Each returns a PitchSlide. The `content` field is the primary
//  textual payload; `data` carries structured fields for the UI to
//  render charts, cards, lists, etc.
// ═══════════════════════════════════════════════════════════════

function buildSlide1Title(
  prospectName: string,
  prospectSector: string | null,
): PitchSlide {
  const date = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return {
    number: 1,
    title: "Veille Réputationnelle",
    type: "title",
    content: `Présentation Harch Atelier — ${prospectName}`,
    data: {
      prospectName,
      prospectSector,
      date,
      pitchBy: "Harch Atelier",
      tagline: "L'intelligence réputationnelle marocaine",
    },
  };
}

function buildSlide2Problem(): PitchSlide {
  return {
    number: 2,
    title: "Le Problème",
    type: "content",
    content:
      "Une réputation se détruit en heures, pas en années. Au Maroc, une rumeur sur WhatsApp peut devenir une crise nationale en 48h — sans que la marque en soit informée.",
    data: {
      narrative:
        "En 2018, le boycott des marques Centrale Danone, Afriquia et Socalait a coûté plus de 150 M€ en perte de chiffre d'affaires. Le signal est né sur Facebook et WhatsApp avant d'atteindre les médias. Les outils internationaux (Meltwater, Talkwalker) ne couvrent ni la Darija ni l'écosystème média marocain.",
      stats: [
        { value: "150 M€", label: "Coût du boycott 2018", sublabel: "Centrale Danone" },
        { value: "48h", label: "Délai média → crise", sublabel: "Vitesse de propagation" },
        { value: "21M", label: "Utilisateurs Facebook", sublabel: "Maroc, 94% des conversations" },
        { value: "0", label: "Outils internationaux Darija", sublabel: "Couverture linguistique" },
      ],
      painPoints: [
        "Aucun outil international ne comprend la Darija",
        "Les Dircom découvrent la crise dans la presse, pas avant",
        "Pas de tableau de bord consolidé pour le COMEX",
        "Alertes WhatsApp dispersées, non structurées",
      ],
    },
  };
}

function buildSlide3Market(): PitchSlide {
  return {
    number: 3,
    title: "Le Marché",
    type: "data",
    content:
      "Le paysage médiatique marocain est fragmenté, multilingue et hautement réactif. Une veille manuelle est impossible.",
    data: {
      narrative:
        "Le Maroc compte plus de 30 titres de presse active, 3 langues de publication (FR / AR / Darija), et une transition rapide vers le mobile (92% de la population). Les conversations critiques se déplacent vers WhatsApp, TikTok et les commentaires Hespress.",
      stats: [
        { value: "30+", label: "Titres de presse active", sublabel: "Généraliste, business, réglementaire" },
        { value: "3", label: "Langues surveillées", sublabel: "Français, Arabe, Darija" },
        { value: "92%", label: "Pénétration mobile", sublabel: "Source : ANRT 2024" },
        { value: "5M+", label: "Articles / jour", sublabel: "Volume traité par Harch" },
      ],
      segments: [
        { name: "Presse généraliste", count: 14, examples: "Hespress, TelQuel, Le360, Le Matin" },
        { name: "Presse business", count: 6, examples: "Medias24, L'Economiste, La Vie Eco" },
        { name: "Régulateurs", count: 4, examples: "AMMC, Bank Al-Maghrib, BVC, MAP" },
        { name: "Plateformes sociales", count: 5, examples: "Facebook, WhatsApp, TikTok, X, YouTube" },
      ],
    },
  };
}

function buildSlide4Solution(): PitchSlide {
  return {
    number: 4,
    title: "La Solution",
    type: "content",
    content:
      "Harch Atelier est la plateforme de veille réputationnelle conçue au Maroc, pour le marché marocain. Nous couvrons les sources locales, comprenons la Darija, et structurons l'information pour le COMEX.",
    data: {
      tagline: "L'intelligence réputationnelle locale, structurée pour la direction.",
      features: [
        {
          icon: "radar",
          title: "Surveillance temps réel",
          desc: "11+ sources marocaines scannées en continu, alertes WhatsApp en moins de 5 minutes.",
        },
        {
          icon: "brain",
          title: "HarchIQ Intelligence",
          desc: "IA entraînée sur le contexte marocain — sentiment, crise, scoring réputationnel.",
        },
        {
          icon: "languages",
          title: "Trilingue FR / AR / Darija",
          desc: "Analyse native, pas de traduction. La Darija est détectée automatiquement.",
        },
        {
          icon: "shield",
          title: "Conformité Loi 09-08",
          desc: "Audit log, traçabilité des sources, hébergement souverain disponible.",
        },
      ],
      differentiators: [
        "Conçu à Casablanca par des Dircom marocains",
        "Couverture Darija native (aucun outil international ne le fait)",
        "Briefing matinal généré par IA, livré à 7h",
        "Tarifs adaptés au marché marocain (à partir de 15K MAD/mois)",
      ],
    },
  };
}

function buildSlide5Score(
  prospectName: string,
  score: number,
  trend: number,
  latest: {
    overall: number;
    sentiment: number | null;
    aiVisibility: number | null;
    volume: number | null;
    authority: number | null;
    createdAt: Date;
  } | null,
): PitchSlide {
  const status =
    score >= 85 ? "Excellent" : score >= 70 ? "Bon" : score >= 55 ? "Moyen" : "Faible";
  const breakdown = [
    { label: "Sentiment", value: latest?.sentiment ? Math.round(latest.sentiment * 100) : 68 },
    { label: "Visibilité IA", value: latest?.aiVisibility ? Math.round(latest.aiVisibility * 100) : 72 },
    { label: "Volume", value: latest?.volume ? Math.round(latest.volume * 100) : 64 },
    { label: "Autorité", value: latest?.authority ? Math.round(latest.authority * 100) : 81 },
  ];
  return {
    number: 5,
    title: "Score de Réputation",
    type: "data",
    content: `Score actuel de ${prospectName} : ${score}/100 (${status}). ${trend >= 0 ? "+" : ""}${trend} points sur 7 jours.`,
    data: {
      score,
      trend,
      status,
      maxScore: 100,
      breakdown,
      source: latest ? "Données live" : "Estimation démonstration",
      updatedAt: latest
        ? latest.createdAt.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
        : new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }),
      narrative:
        "Le score HarchIQ combine 4 dimensions : sentiment des mentions, visibilité dans les moteurs IA, volume de couverture, et autorité des sources. Mis à jour toutes les heures.",
    },
  };
}

function buildSlide6Sources(): PitchSlide {
  // 11+ sources — logos rendered as text chips in the UI
  const sources = [
    { name: "Hespress", type: "Presse", language: "AR" },
    { name: "TelQuel", type: "Presse", language: "FR" },
    { name: "Medias24", type: "Business", language: "FR" },
    { name: "L'Economiste", type: "Business", language: "FR" },
    { name: "Le360", type: "Presse", language: "FR" },
    { name: "Le Matin", type: "Presse", language: "FR" },
    { name: "Aujourdhui Le Maroc", type: "Presse", language: "FR" },
    { name: "Barlamane", type: "Presse", language: "FR" },
    { name: "Yabiladi", type: "Communauté", language: "FR" },
    { name: "Morocco World News", type: "Presse", language: "EN" },
    { name: "MAP", type: "Agence d'État", language: "FR" },
    { name: "AMMC", type: "Régulateur", language: "FR" },
    { name: "Bank Al-Maghrib", type: "Régulateur", language: "FR" },
    { name: "BVC", type: "Marché", language: "FR" },
  ];
  return {
    number: 6,
    title: "Sources Surveillées",
    type: "data",
    content: `11+ sources marocaines en continu, classées par type et langue. Aucun outil international ne couvre cet éventail.`,
    data: {
      sources,
      total: sources.length,
      byType: [
        { type: "Presse", count: sources.filter((s) => s.type === "Presse").length },
        { type: "Business", count: sources.filter((s) => s.type === "Business").length },
        { type: "Régulateur", count: sources.filter((s) => s.type === "Régulateur").length },
        { type: "Agence d'État", count: sources.filter((s) => s.type === "Agence d'État").length },
        { type: "Marché", count: sources.filter((s) => s.type === "Marché").length },
        { type: "Communauté", count: sources.filter((s) => s.type === "Communauté").length },
      ],
      byLanguage: [
        { lang: "FR", count: sources.filter((s) => s.language === "FR").length },
        { lang: "AR", count: sources.filter((s) => s.language === "AR").length },
        { lang: "EN", count: sources.filter((s) => s.language === "EN").length },
      ],
      refreshRate: "5 minutes",
      coverage: "Maroc + diaspora francophone et arabophone",
    },
  };
}

function buildSlide7HarchIQAI(): PitchSlide {
  return {
    number: 7,
    title: "HarchIQ Intelligence Artificielle",
    type: "content",
    content:
      "HarchIQ est notre IA entraînée sur le contexte marocain. Elle comprend la Darija, détecte les crises avant qu'elles n'éclatent, et rédige vos briefings quotidiens.",
    data: {
      tagline: "L'IA qui parle votre marché.",
      capabilities: [
        {
          icon: "message-square",
          title: "Briefing matinal automatique",
          desc: "Synthèse de 1 page livrée à 7h du matin, rédigée par l'IA, sourcée.",
        },
        {
          icon: "alert-octagon",
          title: "Détection de crise",
          desc: "Analyse de vélocité, sentiment, cascade linguistique. Alerte dès le seuil franchi.",
        },
        {
          icon: "gauge",
          title: "Score de réputation",
          desc: "Indice composite 0–100, mis à jour toutes les heures, traçable jusqu'aux sources.",
        },
        {
          icon: "search",
          title: "Ask HarchIQ",
          desc: "Posez une question en langage naturel, obtenez une réponse sourcée en secondes.",
        },
      ],
      quotas: [
        { plan: "Essentiel", briefings: "1/jour", queries: "50/mois", alertes: "WhatsApp + email" },
        { plan: "Pro", briefings: "1/jour enrichi", queries: "500/mois", alertes: "Temps réel" },
        { plan: "Enterprise", briefings: "Sur mesure", queries: "Illimitées", alertes: "Cellule de crise" },
        { plan: "Agency", briefings: "Multi-clients", queries: "Par client", alertes: "White-label" },
      ],
      models: ["GLM-4 (Z.ai) — NLP et briefings", "Embeddings multilingues — Darija incluse"],
    },
  };
}

function buildSlide8Sentiment(
  positivePct: number,
  neutralPct: number,
  negativePct: number,
  frCount: number,
  arCount: number,
  darijaCount: number,
): PitchSlide {
  return {
    number: 8,
    title: "Analyse de Sentiment Trilingue",
    type: "data",
    content:
      "Notre moteur classifie le sentiment en Français, Arabe moderne et Darija — sans traduction, sans perte de nuance.",
    data: {
      narrative:
        "La Darija n'est pas de l'Arabe standard. Un mot comme 'زوين' (zwin = beau) ou 'خايب' (khayb = mauvais) échappe aux modèles entraînés sur l'Arabe littéraire. Notre modèle est fine-tuné sur 50 000 articles marocains annotés.",
      overall: {
        positive: positivePct,
        neutral: neutralPct,
        negative: negativePct,
      },
      languages: [
        {
          code: "FR",
          name: "Français",
          sample: "« La marque a annoncé de bons résultats trimestriels. »",
          sentiment: "positif",
          count: frCount,
        },
        {
          code: "AR",
          name: "Arabe moderne",
          sample: "« أعلنت الشركة عن نتائج إيجابية للربع الأول. »",
          sentiment: "positif",
          count: arCount,
        },
        {
          code: "DARIJA",
          name: "Darija",
          sample: "« Had l'entreprise khdmat mzyan had l'3am. »",
          sentiment: "positif",
          count: darijaCount,
        },
      ],
      cascade:
        "Cascade linguistique typique d'une crise : Darija (WhatsApp, commentaires) → Arabe moderne (Hespress) → Français (Medias24, TelQuel). Harch détecte le signal dès l'étape Darija.",
    },
  };
}

function buildSlide9Crisis(prospectName: string): PitchSlide {
  return {
    number: 9,
    title: "Détection de Crise en Temps Réel",
    type: "data",
    content:
      "Harch détecte les crises avant qu'elles n'atteignent la presse nationale. Alerte WhatsApp en moins de 5 minutes après le premier signal.",
    data: {
      narrative:
        "Le moteur analyse 4 facteurs en continu : vélocité des mentions, chute du sentiment, dispersion des sources, cascade linguistique. Dès que 2 facteurs franchissent leur seuil, une alerte est envoyée à la cellule de crise.",
      factors: [
        {
          key: "velocity",
          label: "Vélocité",
          desc: "Mentions/heure vs baseline 7 jours",
          threshold: "2× baseline",
        },
        {
          key: "sentiment",
          label: "Chute de sentiment",
          desc: "Delta vs moyenne glissante 30 jours",
          threshold: "−0,2 pts",
        },
        {
          key: "spread",
          label: "Dispersion sources",
          desc: "Nombre de sources distinctes",
          threshold: "≥ 5 sources",
        },
        {
          key: "cascade",
          label: "Cascade linguistique",
          desc: "Darija → AR → FR dans les 2 heures",
          threshold: "2 langues en 2h",
        },
      ],
      levels: [
        { level: "Normal", color: "sage", action: "Veille standard" },
        { level: "Modéré", color: "amber", action: "Surveillance renforcée" },
        { level: "Élevé", color: "orange", action: "Brief Dircom sous 24h" },
        { level: "Critique", color: "red", action: "Activation cellule de crise" },
      ],
      alertExample: {
        title: `Pic de mentions négatives détecté — ${prospectName}`,
        time: "14h32 · il y a 3 minutes",
        velocity: "4,2× baseline",
        sentiment: "−0,45 (chute de 0,32)",
        sources: "Hespress, Le360, WhatsApp forwards",
        cascade: "Darija → AR détectée",
        recommendation: "Préparer un communiqué de réponse sous 2h.",
      },
      responseTime: "< 5 minutes",
      channels: ["WhatsApp Business", "Email", "Slack (Enterprise)", "Webhook"],
    },
  };
}

function buildSlide10Pricing(): PitchSlide {
  return {
    number: 10,
    title: "Tarifs",
    type: "pricing",
    content:
      "4 offres adaptées au marché marocain. Tarification en MAD, sans engagement long terme (sauf Enterprise).",
    data: {
      plans: [
        {
          id: "essentiel",
          name: "Essentiel",
          tagline: "La Vigilance Sereine",
          persona: "Dircom / PR Manager starter",
          price: "Sur devis",
          priceHint: "À partir de 15 000 MAD / mois",
          features: [
            "1 marque surveillée",
            "11+ sources marocaines",
            "Score de réputation quotidien",
            "Briefing matinal par IA",
            "Alertes WhatsApp (seuil critique)",
            "50 requêtes Ask HarchIQ / mois",
          ],
          highlight: false,
        },
        {
          id: "pro",
          name: "Pro",
          tagline: "L'Avantage Concurrentiel",
          persona: "PR Manager avancé",
          price: "Sur devis",
          priceHint: "À partir de 35 000 MAD / mois",
          features: [
            "3 marques surveillées",
            "Veille concurrentielle",
            "Détection de crise temps réel",
            "Briefing enrichi + recommandations",
            "500 requêtes Ask HarchIQ / mois",
            "Rapports hebdomadaires automatisés",
          ],
          highlight: true,
        },
        {
          id: "enterprise",
          name: "Enterprise",
          tagline: "La Gouvernance Certifiée",
          persona: "COMEX / IR / Risk",
          price: "Sur devis",
          priceHint: "Sur mesure — COMEX",
          features: [
            "Marques illimitées + filiales",
            "Conformité Loi 09-08 + audit log",
            "Cellule de crise dédiée",
            "Ask HarchIQ illimité",
            "Hébergement souverain disponible",
            "Account manager dédié",
          ],
          highlight: false,
        },
        {
          id: "agency",
          name: "Agency",
          tagline: "Multi-Clients, White-Label",
          persona: "Agences RP & cabinets conseil",
          price: "Sur devis",
          priceHint: "Revenue share 30%",
          features: [
            "Multi-clients (jusqu'à 20)",
            "White-label (domaine, logo, couleurs)",
            "Tableau de bord par client",
            "Revenue share 30%",
            "Onboarding offert (5 premiers clients)",
            "Support dédié agence",
          ],
          highlight: false,
        },
      ],
      note: "Toutes les offres incluent l'analyse trilingue FR / AR / Darija. Essai gratuit 30 jours, sans carte bancaire.",
    },
  };
}

function buildSlide11CaseStudy(prospectSector: string | null): PitchSlide {
  // Anonymized — sector-based narrative
  const sectorLabel = prospectSector || "bancaire";
  return {
    number: 11,
    title: "Étude de Cas",
    type: "content",
    content:
      "Cas anonymisé — groupe marocain du secteur " + sectorLabel + ". Crise détectée 36h avant la couverture nationale.",
    data: {
      sector: sectorLabel,
      challenge:
        "Le groupe subissait une rumeur de restructuration diffusée sur WhatsApp et les commentaires Hespress. Aucun outil classique ne détectait le signal avant la publication d'un article dans la presse nationale.",
      solution:
        "Déploiement d'Harch avec surveillance Darija sur WhatsApp inbound + commentaires Hespress. Configuration d'alertes sur vélocité et cascade linguistique.",
      timeline: [
        { time: "J−36h", event: "Premiers forwards WhatsApp en Darija détectés (12 messages)" },
        { time: "J−30h", event: "Commentaires Hespress négatifs — vélocité 3× baseline" },
        { time: "J−24h", event: "Alerte Harch envoyée à la Dircom (WhatsApp + email)" },
        { time: "J−18h", event: "Communiqué de mise au point préparé et validé" },
        { time: "J0", event: "Article publié dans TelQuel — réponse officielle déjà en ligne" },
      ],
      outcome: [
        { metric: "Avance donnée", value: "36h" },
        { metric: "Couverture négative évitée", value: "−68%" },
        { metric: "Délai de réponse", value: "< 2h" },
        { metric: "ROI estimé", value: "×12" },
      ],
      testimonial: {
        quote:
          "Harch nous a donné 36 heures d'avance. Sans cette alerte, nous serions entrés en crise nationale sans préparation.",
        author: "Dircom — Groupe marocain (secteur " + sectorLabel + ")",
        anonymized: true,
      },
    },
  };
}

function buildSlide12Contact(
  prospectName: string,
  prospectCompetitors: string | null,
): PitchSlide {
  return {
    number: 12,
    title: "Contactez-Nous",
    type: "cta",
    content: `Prêt à structurer la veille réputationnelle de ${prospectName} ? Discutons de votre cas en 30 minutes.`,
    data: {
      ctaLabel: "Contacter le service commercial",
      ctaHint: "Réponse sous 24h ouvrées",
      contact: {
        email: "commercial@harch.ma",
        phone: "+212 5 22 00 00 00",
        address: "Casablanca, Maroc",
        website: "harch.ma",
        hours: "Lun–Ven, 9h–18h (GMT+1)",
      },
      nextSteps: [
        "Audit gratuit de votre réputation actuelle (30 jours)",
        "Démo personnalisée sur vos concurrents" + (prospectCompetitors ? ` : ${prospectCompetitors}` : ""),
        "Proposition commerciale sous 5 jours ouvrés",
        "Onboarding et formation Dircom inclus",
      ],
      prospectName,
      closingNote:
        "Harch Atelier — L'intelligence réputationnelle marocaine. Conçu à Casablanca, déployé pour le COMEX.",
    },
  };
}
