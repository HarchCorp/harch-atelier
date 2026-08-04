// ═══════════════════════════════════════════════════════════════
//  LINGUISTIC MATRIX — Harch IQ NLP Engine
//
//  The definitive linguistic cartography of the Moroccan digital street.
//  Monolingualism doesn't exist in our target audience; code-switching
//  is permanent. This matrix weights every UGC flow (comments, social,
//  forums, WhatsApp) according to the real volumetry of the Moroccan
//  online expression space.
//
//  Task ID: BRICK-9-linguistic-matrix
//  Founder directive: "C'est l'exacte cartographie linguistique de la
//  rue numérique marocaine."
// ═══════════════════════════════════════════════════════════════

export type LanguageCode = "msa" | "french" | "english" | "darija";

export interface LanguageWeight {
  code: LanguageCode;
  label: string;
  labelFr: string;
  weight: number; // 0..1 (35% = 0.35)
  color: string; // hex for dashboard
  usage: string;
  nlpTreatment: string;
  sources: string[];
}

// ─── THE DEFINITIVE MATRIX (35 / 35 / 20 / 10) ─────────────────

export const LINGUISTIC_MATRIX: Record<LanguageCode, LanguageWeight> = {
  msa: {
    code: "msa",
    label: "Modern Standard Arabic",
    labelFr: "Arabe Standard (MSA)",
    weight: 0.35,
    color: "#1e3a5f", // navy
    usage:
      "Dépêches officielles, communiqués institutionnels (OCP, Bank Al-Maghrib), articles de presse institutionnelle, déclarations ministérielles, commentaires formels.",
    nlpTreatment:
      "Analyse sémantique lourde, extraction d'entités nommées (NER) institutionnelles, détection de conformité réglementaire.",
    sources: ["MAP", "BAM", "AMMC", "Hespress (articles)", "Sabah Press", "Al Maghrib Today"],
  },
  french: {
    code: "french",
    label: "French",
    labelFr: "Français",
    weight: 0.35,
    color: "#4a7b5f", // sage green
    usage:
      "Presse économique (L'Économiste, Médias24), communication corporative des multinationales et banques (Attijariwafa, BoA), sphère professionnelle (LinkedIn), commentaires corporate.",
    nlpTreatment:
      "Analyse de sentiment standard, classification des risques réputationnels B2B.",
    sources: ["L'Économiste", "Médias24", "TelQuel", "Le360", "Aujourd'hui Le Maroc", "Le Matin", "La Vie Éco"],
  },
  english: {
    code: "english",
    label: "English",
    labelFr: "Anglais",
    weight: 0.20,
    color: "#8b6914", // gold/amber
    usage:
      "Tech, startups, investisseurs internationaux, discussions macroéconomiques, frange jeune/corporate globalisée sur X (Twitter) et LinkedIn.",
    nlpTreatment:
      "Veille technologique, signaux faibles internationaux touchant le marché marocain, analyse d'impact des marchés globaux (matières premières, énergie).",
    sources: ["Morocco World News", "Financial Afrik", "The Africa Report", "LinkedIn", "X (Twitter)"],
  },
  darija: {
    code: "darija",
    label: "Darija (Moroccan Dialectal)",
    labelFr: "Darija (Dialectal Marocain)",
    weight: 0.10,
    color: "#a0524b", // terracotta/red
    usage:
      "L'artillerie lourde de l'UGC. Commentaires sous les articles Hespress, threads TikTok, groupes Facebook, messages WhatsApp. Foyer des bad buzz, ironie, colère brute, mouvements de foule.",
    nlpTreatment:
      "Dictionnaire phonétique spécifique, détection d'ironie/sarcasme (ex: 'Tbarkellah 3la service' détourné), scoring de viralité émotionnelle.",
    sources: ["Hespress (commentaires)", "TikTok", "Facebook Groups", "WhatsApp inbound", "Yabiladi forums", "Bladi.net"],
  },
};

export const LINGUISTIC_WEIGHTS_SUMMARY = Object.values(LINGUISTIC_MATRIX).map((l) => ({
  code: l.code,
  label: l.labelFr,
  weight: l.weight,
  pct: Math.round(l.weight * 100),
  color: l.color,
}));

// ─── CONTENT TYPE → APPLICABLE LANGUAGES ───────────────────────
//
//  CRITICAL: Darija is NOT applied to press articles. It over-indexes
//  on UGC (comments, social, forums, WhatsApp). This was polluting
//  scores before — the engine no longer looks for Darija in articles.

export type ContentType = "article" | "comment" | "social_post" | "whatsapp_inbound" | "forum_post" | "regulatory";

export const CONTENT_LANGUAGE_APPLICABILITY: Record<ContentType, Array<LanguageCode | "mixed">> = {
  article: ["msa", "french", "english"], // NO darija — articles are formal
  comment: ["darija", "msa", "french", "mixed"], // darija over-indexed here
  social_post: ["darija", "french", "english", "msa", "mixed"], // darija heavy on TikTok/FB
  whatsapp_inbound: ["darija", "french", "msa", "mixed"], // raw UGC
  forum_post: ["darija", "msa", "french", "mixed"], // Yabiladi/Bladi mix
  regulatory: ["msa", "french"], // BAM/AMMC only
};

// ─── GLOBAL RISK INDEX (GRI) ───────────────────────────────────
//
//  The GRI is a 0-100 score representing the overall reputation risk
//  for a brand, weighted by the linguistic matrix. A bad buzz that
//  emerges in Darija (10%) but is picked up in Arabic/French (70%)
//  triggers a CRITICAL cascade alert — the risk has crossed from
//  the UGC underground into the institutional mainstream.

export interface LanguageSentimentSnapshot {
  language: LanguageCode;
  mentionCount: number;
  avgSentiment: number; // -1..+1
  negativeShare: number; // 0..1
  velocity: number; // mentions per hour
  trend: "up" | "down" | "stable";
}

export interface CascadeAlert {
  detected: boolean;
  severity: "none" | "watch" | "warning" | "critical";
  originLanguage: LanguageCode;
  crossedTo: LanguageCode[];
  description: string;
  darijaVelocity: number;
  mainstreamVelocity: number;
}

export interface GlobalRiskIndex {
  score: number; // 0-100 (100 = maximum risk)
  level: "safe" | "watch" | "warning" | "critical";
  perLanguage: Array<{
    language: LanguageCode;
    label: string;
    color: string;
    weight: number;
    weightedRisk: number;
    rawRisk: number;
    mentionCount: number;
    avgSentiment: number;
    velocity: number;
  }>;
  cascade: CascadeAlert;
  computedAt: string;
  recommendation: string;
}

// ─── GRI CALCULATION ───────────────────────────────────────────

export function calculateGlobalRiskIndex(
  snapshots: LanguageSentimentSnapshot[],
): GlobalRiskIndex {
  let totalWeightedRisk = 0;
  let totalWeight = 0;

  const perLanguage: GlobalRiskIndex["perLanguage"] = [];

  for (const lang of Object.values(LINGUISTIC_MATRIX)) {
    const snap = snapshots.find((s) => s.language === lang.code);
    if (!snap) {
      perLanguage.push({
        language: lang.code,
        label: lang.labelFr,
        color: lang.color,
        weight: lang.weight,
        weightedRisk: 0,
        rawRisk: 0,
        mentionCount: 0,
        avgSentiment: 0,
        velocity: 0,
      });
      continue;
    }

    // Raw risk for this language: combination of negative share + velocity + sentiment inversion
    // Range: 0-100
    const negativeRisk = snap.negativeShare * 60; // up to 60 points from negative share
    const velocityRisk = Math.min(25, (snap.velocity / 50) * 25); // up to 25 points from velocity (50 mentions/hour = max)
    const sentimentRisk = Math.max(0, (-snap.avgSentiment) * 15); // up to 15 points from negative sentiment
    const rawRisk = Math.min(100, negativeRisk + velocityRisk + sentimentRisk);

    // Weighted risk: rawRisk × language weight
    const weightedRisk = rawRisk * lang.weight;
    totalWeightedRisk += weightedRisk;
    totalWeight += lang.weight;

    perLanguage.push({
      language: lang.code,
      label: lang.labelFr,
      color: lang.color,
      weight: lang.weight,
      weightedRisk,
      rawRisk,
      mentionCount: snap.mentionCount,
      avgSentiment: snap.avgSentiment,
      velocity: snap.velocity,
    });
  }

  // GRI is the sum of weighted risks (since weights sum to 1.0, max GRI = 100)
  let score = Math.round(totalWeightedRisk);

  // Cascade detection: Darija bad buzz crossing into MSA/French
  const darijaSnap = snapshots.find((s) => s.language === "darija");
  const cascade = detectCascade(darijaSnap, snapshots);

  // If cascade is critical, bump the score
  if (cascade.severity === "critical") {
    score = Math.min(100, score + 20);
  } else if (cascade.severity === "warning") {
    score = Math.min(100, score + 10);
  }

  const level: GlobalRiskIndex["level"] =
    score >= 75 ? "critical" : score >= 50 ? "warning" : score >= 25 ? "watch" : "safe";

  const recommendation = generateRecommendation(level, cascade, perLanguage);

  return {
    score,
    level,
    perLanguage,
    cascade,
    computedAt: new Date().toISOString(),
    recommendation,
  };
}

// ─── CASCADE DETECTION ─────────────────────────────────────────
//
//  A bad buzz that emerges in Darija (the UGC underground) but is
//  picked up in Arabic/French (the institutional mainstream) is the
//  most dangerous pattern. It means the crisis has crossed the
//  membrane from anonymous comments into formal media coverage.

function detectCascade(
  darijaSnap: LanguageSentimentSnapshot | undefined,
  allSnaps: LanguageSentimentSnapshot[],
): CascadeAlert {
  if (!darijaSnap) {
    return {
      detected: false,
      severity: "none",
      originLanguage: "darija",
      crossedTo: [],
      description: "No Darija signal detected.",
      darijaVelocity: 0,
      mainstreamVelocity: 0,
    };
  }

  const darijaVelocity = darijaSnap.velocity;
  const darijaNegative = darijaSnap.negativeShare > 0.4; // >40% negative = bad buzz
  const darijaSpike = darijaVelocity > 10; // >10 mentions/hour = spike

  // Check if MSA and/or French are picking up the same topic
  const msaSnap = allSnaps.find((s) => s.language === "msa");
  const frenchSnap = allSnaps.find((s) => s.language === "french");

  const crossedTo: LanguageCode[] = [];
  if (msaSnap && msaSnap.negativeShare > 0.3 && msaSnap.velocity > 5) crossedTo.push("msa");
  if (frenchSnap && frenchSnap.negativeShare > 0.3 && frenchSnap.velocity > 5) crossedTo.push("french");

  const mainstreamVelocity = (msaSnap?.velocity ?? 0) + (frenchSnap?.velocity ?? 0);

  if (darijaNegative && darijaSpike && crossedTo.length > 0) {
    return {
      detected: true,
      severity: "critical",
      originLanguage: "darija",
      crossedTo,
      description: `CRITICAL CASCADE — Bad buzz émerge en Darija (${darijaVelocity} mentions/h, ${Math.round(darijaSnap.negativeShare * 100)}% négatif) et a traversé la membrane vers ${crossedTo.map((c) => LINGUISTIC_MATRIX[c].labelFr).join(" + ")}. Le crisis est maintenant dans la presse mainstream. Action immédiate requise.`,
      darijaVelocity,
      mainstreamVelocity,
    };
  }

  if (darijaNegative && darijaSpike) {
    return {
      detected: true,
      severity: "warning",
      originLanguage: "darija",
      crossedTo: [],
      description: `WARNING — Bad buzz Darija détecté (${darijaVelocity} mentions/h, ${Math.round(darijaSnap.negativeShare * 100)}% négatif). Pas encore repris dans la presse mainstream. Fenêtre d'action de 2-4h avant cascade.`,
      darijaVelocity,
      mainstreamVelocity,
    };
  }

  if (darijaNegative || darijaSpike) {
    return {
      detected: true,
      severity: "watch",
      originLanguage: "darija",
      crossedTo: [],
      description: `WATCH — Signal Darija à surveiller (${darijaVelocity} mentions/h, ${Math.round(darijaSnap.negativeShare * 100)}% négatif). Pas encore critique mais vélocité anormale.`,
      darijaVelocity,
      mainstreamVelocity,
    };
  }

  return {
    detected: false,
    severity: "none",
    originLanguage: "darija",
    crossedTo: [],
    description: "No cascade pattern detected. Darija signal is nominal.",
    darijaVelocity,
    mainstreamVelocity,
  };
}

function generateRecommendation(
  level: GlobalRiskIndex["level"],
  cascade: CascadeAlert,
  perLanguage: GlobalRiskIndex["perLanguage"],
): string {
  if (cascade.severity === "critical") {
    return "CASCADE CRITIQUE — Déclencher le comité de crise. Préparer une déclaration publique dans l'heure. Le bad buzz a quitté l'UGC underground et est maintenant dans la presse mainstream. Chaque minute compte.";
  }

  if (cascade.severity === "warning") {
    return "Fenêtre d'action de 2-4h. Préparer un message de clarification. Surveiller la vélocité MSA/Français toutes les 15min. Si cascade détectée, passer en mode crise.";
  }

  if (level === "critical") {
    const topRisk = perLanguage.reduce((max, p) => (p.weightedRisk > max.weightedRisk ? p : max), perLanguage[0]);
    return `Risque critique concentré en ${topRisk.label}. Activer le monitoring renforcé et préparer une communication ciblée.`;
  }

  if (level === "warning") {
    return "Risque élevé. Surveiller l'évolution sur 24h. Préparer un brief Dircom.";
  }

  if (level === "watch") {
    return "Risque modéré. Monitoring standard. Pas d'action immédiate requise.";
  }

  return "Risque nominal. Aucune action requise.";
}

// ─── LINGUISTIC ROUTER ─────────────────────────────────────────
//
//  Routes content to the correct NLP pipeline based on content type.
//  Articles NEVER go through the Darija pipeline. Comments/social
//  ALWAYS go through Darija detection first.

export interface RoutingResult {
  detectedLanguage: LanguageCode | "mixed";
  applicableLanguages: LanguageCode[];
  pipeline: "formal" | "ugc" | "regulatory";
  darijaOverIndexed: boolean;
}

export function routeContent(
  contentType: ContentType,
  detectedLanguage: LanguageCode | "mixed",
): RoutingResult {
  const applicable = CONTENT_LANGUAGE_APPLICABILITY[contentType] || ["french"];

  const pipeline: RoutingResult["pipeline"] =
    contentType === "regulatory"
      ? "regulatory"
      : contentType === "article"
      ? "formal"
      : "ugc";

  const darijaOverIndexed =
    (contentType === "comment" || contentType === "social_post" || contentType === "whatsapp_inbound" || contentType === "forum_post") &&
    (detectedLanguage === "darija" || detectedLanguage === "mixed");

  return {
    detectedLanguage,
    applicableLanguages: applicable.filter((l) => l !== "mixed") as LanguageCode[],
    pipeline,
    darijaOverIndexed,
  };
}
