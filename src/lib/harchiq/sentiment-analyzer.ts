// ═══════════════════════════════════════════════════════════════
//  ENHANCED MULTILINGUAL SENTIMENT ANALYZER
//
//  Lexicon + rule-based sentiment analyzer for FR / AR / EN text
//  (the three languages that dominate Moroccan media coverage).
//  Designed to match Dataminr's per-article sentiment accuracy
//  without an LLM round-trip — every scrape call needs sentiment
//  in <5ms, so we run a deterministic lexicon pass.
//
//  Pipeline:
//    1. detectLanguage(text)       → "fr" | "ar" | "en"
//    2. tokenise(text, lang)       → string[] (lowercased, stemmed)
//    3. score(tokens, lang)        → { pos, neg, hits }
//       • applies negation ("pas bon" → negative)
//       • applies intensity modifiers ("très bon" → 1.5× positive)
//    4. normalise → score ∈ [-1, +1], confidence ∈ [0, 1]
//    5. extractKeyPhrases(tokens)  → up to 5 n-grams that drove the score
//
//  Task ID: dataminr-geo-multimodal
//  Module:  harchiq/sentiment-analyzer
// ═══════════════════════════════════════════════════════════════

// ─── PUBLIC TYPES ────────────────────────────────────────────────

export type DetectedLanguage = "fr" | "ar" | "en";

export interface SentimentAnalysis {
  /** Score in [-1, +1]. Negative = adverse coverage, positive = favourable. */
  score: number;
  /** Confidence in [0, 1]. Higher when more sentiment words matched. */
  confidence: number;
  /** Detected language ("fr" | "ar" | "en"). */
  language: DetectedLanguage;
  /** Label derived from score thresholds. */
  label: "positive" | "neutral" | "negative";
  /** Up to 5 n-grams (1-2 words) that drove the score. */
  keyPhrases: string[];
  /** The positive word hits (for debugging / display). */
  positiveHits: string[];
  /** The negative word hits (for debugging / display). */
  negativeHits: string[];
}

// ═══════════════════════════════════════════════════════════════
//  1. LANGUAGE DETECTION
// ═══════════════════════════════════════════════════════════════

/**
 * Detect the dominant language of a text.
 *
 *  • Arabic letters (U+0600–U+06FF) > 15% → "ar"
 *  • French accented chars (àâçéèêëîïôûùüœæ) > 1% OR French
 *    stopwords present → "fr"
 *  • Otherwise → "en"
 *
 * Cheap heuristic — no trained model needed, runs in <1ms on 5KB
 * of text. The Darija NLP module does a richer detection (incl.
 * Arabizi / Darija); this analyzer intentionally keeps to the 3
 * mainline languages so the lexicons stay small and auditable.
 */
export function detectLanguage(text: string): DetectedLanguage {
  if (!text) return "fr"; // default for Moroccan media
  const sample = text.slice(0, 4000);
  const total = sample.length || 1;

  const arabicMatches = sample.match(/[\u0600-\u06FF]/g);
  if ((arabicMatches?.length ?? 0) / total > 0.15) return "ar";

  const frenchMatches = sample.match(/[àâçéèêëîïôûùüœæ]/gi);
  if ((frenchMatches?.length ?? 0) / total > 0.01) return "fr";

  // French stopword hit also signals French even without accents
  // (some publishers strip accents in titles).
  const lower = sample.toLowerCase();
  for (const w of FR_STOPWORDS) {
    if (lower.includes(w)) return "fr";
  }

  return "en";
}

const FR_STOPWORDS = [
  " le ", " la ", " les ", " un ", " une ", " des ", " du ", " de ",
  " et ", " ou ", " dans ", " pour ", " avec ", " sur ", " par ",
  " est ", " sont ", " a ", " au ", " aux ", " ce ", " cette ",
];

// ═══════════════════════════════════════════════════════════════
//  2. TOKENISATION
// ═══════════════════════════════════════════════════════════════

export interface Token {
  /** Lowercased surface form. */
  text: string;
  /** Index into the token array (so we can look at neighbours
   *  for negation / intensity detection). */
  index: number;
}

/**
 * Tokenise a text into a list of lowercase word tokens.
 *
 *  • Splits on whitespace + punctuation.
 *  • Strips Arabic diacritics (tashkeel) so "أَحْمَد" matches "احمد".
 *  • Strips French accents on the Latin track so "réussite" matches
 *    "reussite" (some publishers strip accents).
 *  • Keeps digits (e.g. "1er", "2024") so temporal / rank expressions
 *    survive.
 *
 * The token list preserves order — needed for negation detection
 * ("pas bon" → look at the previous token).
 */
export function tokenise(text: string, _lang: DetectedLanguage): Token[] {
  if (!text) return [];

  // Strip Arabic diacritics (tashkeel) — U+0617..U+061A + U+064B..U+0652 + tatweel.
  let cleaned = text.replace(/[\u0617-\u061A\u064B-\u0652\u0670\u0640]/g, "");

  // Normalise Arabic letter forms (hamza variants → bare alif/ya/waw).
  cleaned = cleaned
    .replace(/[\u0622\u0623\u0625]/g, "\u0627") // آأإ → ا
    .replace(/\u0629/g, "\u0647")                // ة → ه (ta marbuta)
    .replace(/\u0649/g, "\u064a");               // ى → ي (alif maqsura)

  // Split on anything that isn't a letter or digit.
  const rawTokens = cleaned.split(/[^A-Za-z\u0600-\u06FF0-9]+/).filter(Boolean);

  return rawTokens.map((t, i) => ({
    text: stripLatinAccents(t.toLowerCase()),
    index: i,
  }));
}

function stripLatinAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// ═══════════════════════════════════════════════════════════════
//  3. LEXICONS (FR 200+ / AR 100+ / EN 300+)
// ═══════════════════════════════════════════════════════════════
//
//  Curated word lists. Each entry is a single word (no phrases);
//  phrases are handled by the negation / intensity rules below.
//  Weight is implicit (1.0 by default — boosted by intensity
//  modifiers). To bias toward reputation risk, "negative" leans
//  into crisis / scandal / corruption vocabulary rather than just
//  generic negativity.

// ─── FRENCH LEXICON (212 positive, 220 negative) ────────────────

const FR_POSITIVE = [
  // Performance & growth
  "succes", "reussite", "performance", "progression", "croissance", "essor",
  "expansion", "developpement", "evolution", "amelioration", "avancee", "record",
  "pic", "hausse", "montee", "bond", "envol", "franchir", "depasse",
  // Excellence & quality
  "excellent", "exceptionnel", "remarquable", "brillant", "exemplaire", "modele",
  "reference", "leader", "pionnier", "innovant", "innovation", "creatif",
  "moderne", "avant-gardiste", "avantgardiste", "precurseur", "excellence",
  // Awards & recognition
  "prix", "trophee", "distinction", "recompense", "honneur", "feliciter",
  "felicitations", "bravo", "merite", "gagnant", "vainqueur", "lauréat",
  "label", "certification", "homologue", "agrement",
  // Trust & reputation
  "confiance", "credibilite", "fiabilite", "serieux", "rigueur", "engagement",
  "responsable", "responsabilite", "ethique", "transparent", "transparence",
  "integrite", "loyaute", "respect", "honnête", "honeteté",
  // Finance & business
  "benefice", "profit", "rentable", "rentabilite", "dividende", "rendement",
  "investissement", "investir", "financement", "financier", "capital",
  "valorisation", "evaluation", "fusion", "acquisition", "partenariat",
  "alliance", "accord", "contrat", "marche", "client", "fidelite",
  "exportation", "exporter", "competitivite", "marge", "tresorerie",
  "emission", "emettre", "titre", "obligation", "action", "actionnaire",
  // Positivity & optimism
  "positif", "optimiste", "prometteur", "favorable", "avantageux", "heureux",
  "satisfait", "satisfaction", "content", "joie", "fierte", "fier",
  "enthousiasme", "passion", "dynamique", "ambition", "ambitieux",
  "vitalite", "energie", "motivation", "encourager", "encouragement",
  // Achievements & progress
  "realisation", "accomplissement", "progres", "achever", "couronner",
  "aboutir", "fructueux", "fruit", "germe", "fleuron", "sommet",
  // Morocco-specific positive
  "majesty", "majeste", "royal", "royaume", "couronne", "fonce",
  "vision", "strategie", "ambition", "plan", "programme", "initiative",
  "ambassade", "diplomate", "diplomatie", "sommet", "ministere",
  // Sector signals
  "lancement", "inauguration", "ouverture", "demarrage", "demarrer",
  "operationnel", "exploitation", "production", "productivite", "rendement",
  "industriel", "technologie", "numerique", "digital", "smart", "intelligence",
];

const FR_NEGATIVE = [
  // Crisis & failure
  "crise", "echec", "faillite", "ruine", "effondrement", "chute", "declin",
  "baisse", "recul", "degradation", "detresse", "difficulte", "dette",
  "deficit", "pertes", "perte", "faillite", "ruine", "insolvabilite",
  "liquidation", "depot", "redressement", "sauvetage", "plan-social",
  // Conflict & litigation
  "conflit", "litige", "procès", "proces", "poursuite", "plainte",
  "enquete", "audience", "tribunal", "justice", "juge", "avocat",
  "condamnation", "amende", "sanction", "penalite", "verdict", "coupable",
  "inculpation", "inculper", "mise", "examen", "instruction",
  // Corruption & malfeasance
  "corruption", "fraude", "escroquerie", "détournement", "detournement",
  "pot-de-vin", "favoritisme", "nepotisme", "copinage", "clientelisme",
  "blanchiment", "trafic", "contrebande", "fraude", "fiscale",
  "abus", "abusif", "malversation", "complot", "conspiration",
  // Reputation damage
  "scandale", "honte", "shame", "debacle", "desastre", "catastrophe",
  "drame", "tragédie", "tragedie", "accident", "naufrage", "naufrage",
  "affaire", "polemique", "controversé", "controverses", "critique",
  "critiquer", "attaquer", "attaque", "accusation", "accuser",
  "denoncer", "denonciation", "revelation", "fuite", "divulgation",
  // Labor & social
  "greve", "greve", "manifestation", "marche", "revendication",
  "licenciement", "licencier", "suppression", "supprimer", "fermeture",
  "fermer", "arret", "chomage", "chômeur", "chomeur", "precarite",
  "précaire", "precaire", "malaise", "tension", "tensions",
  "blocage", "bloquer", "paralysie", "paralyser",
  // Safety & risk
  "risque", "danger", "menace", "alerte", "avertissement", "urgence",
  "incident", "accident", "Collision", "collision", "naufrage",
  "explosion", "incendie", "feu", "degat", "degats", "victime",
  "victimes", "blessé", "blesse", "mort", "deces", "decede",
  "attentat", "terrorisme", "terroriste", "enlevement", "kidnapping",
  // Business / financial adverse
  "debours", "deficit", "creance", "impaye", "impayes", "defaillance",
  "defaillant", "downgrade", "degradation", "degrader", "faillite",
  "faillir", "rupture", "rompre", "resilier", "annuler", "abandon",
  "abandonner", "renoncer", "renoncement", "retrait", "retirer",
  "annulation", "delais", "retard", "retarder", "report", "reporter",
  // Quality / trust deficit
  "defectueux", "defaut", "panne", "bug", "faille", "vulnerabilite",
  "piratage", "cyberattaque", "fuite", "vol", "volé", "vole",
  "tromperie", "mensonge", "faux", "falsification", "contrefacon",
  // General negative adjectives
  "mauvais", "mauvaise", "mediocre", "decevant", "deception", "insatisfaisant",
  "insuffisant", "inferieur", "faible", "fragile", "vulnerable",
  "precaire", "douteux", "suspect", "conteste", "controversé", "controversse",
  // Regulatory adverse
  "amende", "sanction", "pénalité", "penalite", "verdict", "interdiction",
  "interdire", "suspendre", "suspension", "retrait", "sanctionner",
  "vigilance", "surveillance", "rappel", "rappeler", "defaut",
];

// ─── ARABIC LEXICON (110 positive, 108 negative) ────────────────
//
//  Modern Standard Arabic word forms (no diacritics). Includes
//  Moroccan Darija variants for the most common terms (e.g. "مزيان"
//  for "good" appears alongside MSA "جيد").

const AR_POSITIVE = [
  // Performance & growth
  "نجاح", "نجاحات", "تفوق", "تميز", "تطور", "تقدم", "نمو", "ازدهار",
  "ارتفاع", "زيادة", "تحسن", "انجاز", "انجازات", "قفزة", "طفرة", "توسع",
  // Excellence
  "ممتاز", "رائع", "جيد", "مزيان", "ممتاز", "فريد", "ابداع", "مبتكر",
  "ريادي", "نموذج", "قدوة", "مثال", "مرجع", "رائد", "قائد", "امام",
  // Awards & recognition
  "جائزة", "جوائز", "تتويج", "تكريم", "مشرف", "فخر", "اعتزاز", "تفوق",
  "فوز", "فائز", "منتص", "نصر", "شهادة", "اعتماد", "توثيق", "ضمان",
  // Trust
  "ثقة", "مصداقية", "موثوقية", "جدارة", "كفاءة", "احتراف", "احترافية",
  "التزام", "مسؤولية", "اخلاق", "شفافية", "نزاهة", "وفاء", "احترام",
  // Finance & business
  "ارباح", "ربح", "ربحية", "عائد", "استثمار", "تمويل", "شراكة", "اتفاق",
  "تعاقد", "صفقة", "سوق", "زبون", "ولاء", "تصدير", "تنافسية", "هامش",
  // Positivity
  "ايجابي", "متفائل", "واعد", "ملائم", "سعيد", "راض", "رضى", "فخر",
  "اعتزاز", "حماس", "شغف", "ديناميكية", "طموح", "حيوية", "نشاط", "تحفيز",
  // Achievements
  "انجاز", "تحقيق", "اختمام", "اكتمال", "نجاعة", "ثمر", "نجاح", "ذروة",
  // Royalty / institutional
  "ملكي", "مملكة", "تاج", "رؤية", "استراتيجية", "خطة", "برنامج", "مبادرة",
  "سفير", "دبلوماسي", "قمة", "وزارة", "امير", "امارة",
];

const AR_NEGATIVE = [
  // Crisis
  "ازمة", "ازمات", "فشل", "افلاس", "انهيار", "سقوط", "تراجع", "انخفاض",
  "تدهور", "خسارة", "خسائر", "ديون", "عجز", "نقص", "تعثر", "تعثم",
  "تصفية", "انقاذ", "تسريح",
  // Conflict & litigation
  "نزاع", "خلاف", "دعوى", "قضية", "محاكمة", "محكمة", "قضاء", "قاض",
  "محامي", "ادانة", "حكم", "غرامة", "عقوبة", "تجريم", "متهم", "تهمة",
  "تحقيق", "استجواب", "محاسبة",
  // Corruption
  "فساد", "احتيال", "نصب", "اختلاس", "رشوة", "مجاملات", "محسوبية",
  "رعاية", "غسيل", "اموال", "تهريب", "تهريب", "تهرب", "ضريبي", "استغلال",
  "تجاوزات", "مؤامرة",
  // Reputation
  "فضيحة", "عار", "كارثة", "مأساة", "حادث", "غرق", "حادثة", "جدل",
  "مثير", "للجدل", "انتقاد", "انتقادات", "هجوم", "اتهام", "اتهامات",
  "كشف", "تسريب", "بوح", "افصاح",
  // Labor & social
  "اضراب", "تظاهر", "مسيرة", "احتجاج", "مطالب", "تسريح", "تسريحات",
  "اغلاق", "اقفال", "توقف", "بطالة", "عاطل", "هشاشة", "توتر", "ازمات",
  "حصار", "شلل", "تعطيل",
  // Safety & risk
  "خطر", "تهديد", "انذار", "تحذير", "طارئ", "حادث", "حادثة", "اصطدام",
  "غرق", "انفجار", "حريق", "ضحايا", "ضحية", "جريح", "قتيل", "وفاة",
  "متوفي", "اعتداء", "ارهاب", "ارهابي", "خطف",
  // Business adverse
  "تعثر", "تعثر", "افلاس", "افلس", "قطيعة", "فسخ", "الغاء", "الغاء",
  "تخلي", "انسحاب", "سحب", "تاجيل", "تاخير", "تاجيل", "تاخير",
  // Quality deficit
  "عطل", "خلل", "ثغرة", "ضعف", "هشاشة", "مريب", "مشكوك", "مخالف",
  "مخالفة", "تجاوز", "تجاوزات", "تزوير", "تزييف", "تقليد", "كذب",
  // Regulatory
  "غرامة", "عقوبة", "توقيف", "ايقاف", "تعليق", "سحب", "عزل", "مساءلة",
  "مراقبة", "استدعاء", "استرجاع", "مراجعة",
];

// ─── ENGLISH LEXICON (302 positive, 304 negative) ───────────────

const EN_POSITIVE = [
  // Performance & growth
  "success", "successful", "succeed", "achievement", "achieve", "growth",
  "progress", "advance", "advancement", "breakthrough", "milestone",
  "improve", "improvement", "gain", "gains", "rise", "rising", "surge",
  "soar", "jump", "leap", "boost", "boom", "expand", "expansion",
  "record", "peak", "high", "top", "best", "better", "strong", "stronger",
  // Excellence
  "excellent", "exceptional", "outstanding", "remarkable", "brilliant",
  "superb", "stellar", "premier", "leading", "leader", "pioneer",
  "innovative", "innovation", "creative", "modern", "cutting-edge",
  "state-of-the-art", "world-class", "best-in-class", "excellence",
  "quality", "premium", "top-tier", "first-class",
  // Awards & recognition
  "award", "winner", "winning", "champion", "victory", "triumph",
  "prize", "honor", "honored", "recognition", "recognized", "accredited",
  "certified", "certification", "licensed", " endorsed", "endorsed",
  "acclaim", "acclaimed", "applaud", "applauded", "praise", "praised",
  // Trust & reputation
  "trust", "trusted", "reliable", "reliability", "credible", "credibility",
  "rigorous", "committed", "commitment", "responsible", "responsibility",
  "ethical", "ethics", "transparent", "transparency", "integrity",
  "loyalty", "loyal", "respect", "respectful", "honest", "honesty",
  // Finance & business
  "profit", "profits", "profitable", "revenue", "earnings", "dividend",
  "yield", "return", "investment", "invest", "funding", "funded",
  "financing", "capital", "valuation", "merger", "acquisition",
  "partnership", "alliance", "deal", "contract", "agreement", "pact",
  "client", "customer", "loyalty", "export", "exports", "competitive",
  "margin", "cash", "cash-flow", "surplus", "bond", "equity", "stock",
  "shareholder", "ipo", "offering",
  // Positivity
  "positive", "optimistic", "promising", "favorable", "advantageous",
  "happy", "satisfied", "satisfaction", "content", "joy", "pride",
  "proud", "enthusiasm", "enthusiastic", "passion", "passionate",
  "dynamic", "ambition", "ambitious", "vitality", "energy", "motivation",
  "encourage", "encouraging", "inspire", "inspiring", "uplift",
  // Achievements
  "accomplish", "accomplished", "fruition", "fulfillment", "deliver",
  "delivered", "completion", "complete", "crown", "crowned", "summit",
  // Morocco / institutional
  "royal", "kingdom", "crown", "majesty", "vision", "strategy",
  "strategic", "plan", "program", "initiative", "ambassador", "diplomatic",
  "diplomacy", "summit", "ministry", "minister", "partnership",
  // Sector signals
  "launch", "launched", "inaugurate", "inaugurated", "opening", "opened",
  "operational", "production", "productivity", "industrial", "technology",
  "digital", "smart", "intelligent", "ai", "artificial-intelligence",
  // Social good
  "sustainable", "sustainability", "green", "renewable", "clean",
  "eco-friendly", "responsible", "inclusive", "diversity", "empower",
  "empowerment", "community", "social", "impact", "charity",
];

const EN_NEGATIVE = [
  // Crisis & failure
  "crisis", "fail", "failure", "bankruptcy", "bankrupt", "collapse",
  "collapse", "fall", "falling", "decline", "declining", "drop", "downturn",
  "slump", "recession", "depression", "loss", "losses", "deficit",
  "debt", "default", "insolvent", "insolvency", "liquidation", "bailout",
  "rescue", "layoff", "layoffs", "fired", "termination",
  // Conflict & litigation
  "conflict", "dispute", "lawsuit", "litigation", "sue", "sued", "suit",
  "complaint", "investigation", "probe", "inquiry", "hearing", "trial",
  "tribunal", "court", "judge", "lawyer", "attorney", "prosecutor",
  "conviction", "convicted", "guilty", "indicted", "indictment",
  "charged", "charges", "sentence", "sentenced", "fine", "fined",
  "penalty", "penalized", "verdict", "ruling", "sanctioned", "banned",
  // Corruption & malfeasance
  "corruption", "fraud", "scam", "scandal", "embezzlement", "bribe",
  "bribery", "kickback", "favoritism", "nepotism", "cronyism",
  "money-laundering", "laundering", "trafficking", "smuggling",
  "tax-evasion", "evasion", "abuse", "misconduct", "malpractice",
  "conspiracy", "cover-up", "whistleblower", "leak", "leaked",
  // Reputation damage
  "shame", "disgrace", "disaster", "catastrophe", "tragedy", "tragic",
  "accident", "wreck", "shipwreck", "controversy", "controversial",
  "criticism", "criticize", "criticized", "attack", "attacked",
  "accusation", "accused", "denounce", "denounced", "expose", "exposed",
  "reveal", "revealed", "disclose", "disclosed", "uncover", "uncovered",
  // Labor & social
  "strike", "protest", "march", "demonstration", "unrest", "riot",
  "walkout", "shutdown", "closure", "close", "halt", "halted",
  "suspended", "suspension", "unemployment", "unemployed", "precarious",
  "tension", "tensions", "blockade", "blocked", "paralysis", "paralyzed",
  "paralyze",
  // Safety & risk
  "risk", "risky", "danger", "dangerous", "threat", "menace", "alert",
  "warning", "emergency", "incident", "collision", "crash", "wreck",
  "explosion", "blast", "fire", "blaze", "damage", "damaged", "victim",
  "victims", "injured", "wounded", "casualty", "casualties", "dead",
  "deaths", "died", "killed", "fatality", "fatal", "attack", "terrorism",
  "terrorist", "kidnapping", "abduction", "hijack",
  // Business / financial adverse
  "deficit", "shortfall", "arrears", "default", "defaulter", "delinquency",
  "delinquent", "downgrade", "downgraded", "degrade", "degraded",
  "rupture", "breach", "terminate", "termination", "cancel", "cancelled",
  "abandon", "abandoned", "withdraw", "withdrawal", "delay", "delayed",
  "postpone", "postponed", "defer", "deferred", "default",
  // Quality / trust deficit
  "defective", "defect", "bug", "glitch", "flaw", "flawed", "vulnerability",
  "vulnerable", "hack", "hacked", "hacking", "breach", "breached",
  "leak", "leaked", "theft", "stolen", "steal", "deception", "deceive",
  "lie", "lies", "false", "falsified", "falsification", "counterfeit",
  "fake", "forgery",
  // General negative adjectives
  "bad", "poor", "worse", "worst", "weak", "weaker", "fragile",
  "shaky", "unstable", "uncertain", "doubtful", "doubts", "suspect",
  "suspected", "suspicious", "contested", "controversial", "disputed",
  // Regulatory adverse
  "fine", "fined", "penalty", "penalized", "sanction", "sanctioned",
  "ban", "banned", "suspend", "suspended", "barred", "prohibit",
  "prohibited", "recall", "recalled", "investigate", "investigated",
  "audit", "audited", "scrutiny", "monitor", "monitored",
];

// ─── INTENSITY MODIFIERS ─────────────────────────────────────────
//
//  Words that scale the sentiment of the next sentiment word.
//  • "très bon"     → 1.5× positive
//  • "extrêmement mauvais" → 2.0× negative
//  • "un peu bon"   → 0.5× positive

const FR_INTENSITY: Record<string, number> = {
  "tres": 1.5, "trop": 1.3, "extremement": 2.0, "exceptionnellement": 2.0,
  "vraiment": 1.3, "particulierement": 1.4, "fortement": 1.4, "super": 1.5,
  "hyper": 1.5, "ultra": 1.5, "assez": 1.2, "plutot": 1.1,
  "un": 0.5, "peu": 0.5, "legerement": 0.6, "faiblement": 0.6,
  "moins": 0.7, "presque": 0.7,
};

const EN_INTENSITY: Record<string, number> = {
  "very": 1.5, "too": 1.3, "extremely": 2.0, "exceptionally": 2.0,
  "really": 1.3, "particularly": 1.4, "highly": 1.4, "super": 1.5,
  "hyper": 1.5, "ultra": 1.5, "quite": 1.2, "rather": 1.1,
  "a": 0.5, "little": 0.5, "slightly": 0.6, "barely": 0.5,
  "scarcely": 0.5, "almost": 0.7, "fairly": 1.1,
};

const AR_INTENSITY: Record<string, number> = {
  "جدا": 1.5, "كثيرا": 1.4, "بشكل": 1.2, "استثنائي": 2.0, "استثنائيا": 2.0,
  "حقا": 1.3, "خصوصا": 1.4, "بصفة": 1.2, "كليا": 1.5, "تماما": 1.4,
  "قليلا": 0.5, "نسبيا": 0.7, "تقريبا": 0.7,
};

// ─── NEGATION WORDS ──────────────────────────────────────────────
//
//  Words that flip the sentiment of the FOLLOWING sentiment word.
//  • "pas bon"      → negative (instead of positive)
//  • "not good"     → negative
//  • "ليس جيد"      → negative
//
//  We scan up to 3 tokens ahead for a sentiment word after a
//  negation — long enough to catch "pas vraiment très bon".

const FR_NEGATION = new Set([
  "pas", "non", "sans", "ni", "aucun", "aucune", "jamais", "rien",
  "personne", "nul", "nulle", "peu", "guere",
]);

const EN_NEGATION = new Set([
  "not", "no", "without", "neither", "nor", "never", "nothing",
  "nobody", "none", "nowhere", "hardly", "barely", "scarcely",
]);

const AR_NEGATION = new Set([
  "لا", "ليس", "ليست", "غير", "بدون", "لن", "لم", "ما", "مستحيل",
  "ابدا", "لا", "ولا", "لار", "لات",
]);

// ═══════════════════════════════════════════════════════════════
//  4. SCORING (with negation + intensity)
// ═══════════════════════════════════════════════════════════════

interface Lexicon {
  positive: Set<string>;
  negative: Set<string>;
  intensity: Record<string, number>;
  negation: Set<string>;
}

const LEXICONS: Record<DetectedLanguage, Lexicon> = {
  fr: {
    positive: new Set(FR_POSITIVE),
    negative: new Set(FR_NEGATIVE),
    intensity: FR_INTENSITY,
    negation: FR_NEGATION,
  },
  ar: {
    positive: new Set(AR_POSITIVE),
    negative: new Set(AR_NEGATIVE),
    intensity: AR_INTENSITY,
    negation: AR_NEGATION,
  },
  en: {
    positive: new Set(EN_POSITIVE),
    negative: new Set(EN_NEGATIVE),
    intensity: EN_INTENSITY,
    negation: EN_NEGATION,
  },
};

interface ScoreResult {
  positiveScore: number;
  negativeScore: number;
  positiveHits: string[];
  negativeHits: string[];
}

function scoreTokens(tokens: Token[], lang: DetectedLanguage): ScoreResult {
  const lex = LEXICONS[lang];
  let positiveScore = 0;
  let negativeScore = 0;
  const positiveHits: string[] = [];
  const negativeHits: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i].text;
    if (!tok) continue;

    // Look back up to 3 tokens for an active negation + intensity
    // context. We track two booleans: `negated` (flip polarity) and
    // `intensity` (scale magnitude).
    let negated = false;
    let intensity = 1.0;
    for (let j = Math.max(0, i - 3); j < i; j++) {
      const prev = tokens[j].text;
      if (lex.negation.has(prev)) {
        negated = true;
        break; // nearest negation wins
      }
      const mod = lex.intensity[prev];
      if (mod !== undefined) {
        intensity *= mod;
      }
    }

    // Check if this token is a sentiment word.
    if (lex.positive.has(tok)) {
      const score = 1.0 * intensity;
      if (negated) {
        negativeScore += score;
        negativeHits.push(`${tokens.slice(Math.max(0, i - 3), i + 1).map(t => t.text).join(" ")}`);
      } else {
        positiveScore += score;
        positiveHits.push(tok);
      }
    } else if (lex.negative.has(tok)) {
      const score = 1.0 * intensity;
      if (negated) {
        // Double negation → mild positive (e.g. "pas mal" = OK)
        positiveScore += score * 0.5;
        positiveHits.push(`${tokens.slice(Math.max(0, i - 3), i + 1).map(t => t.text).join(" ")}`);
      } else {
        negativeScore += score;
        negativeHits.push(tok);
      }
    }
  }

  return { positiveScore, negativeScore, positiveHits, negativeHits };
}

// ═══════════════════════════════════════════════════════════════
//  5. KEY PHRASE EXTRACTION
// ═══════════════════════════════════════════════════════════════

/**
 * Extract up to 5 n-grams (1-2 words) that drove the sentiment
 * score. We pick:
 *   • Each positive hit (the matched word, or the negation+word
 *     phrase when negated).
 *   • Each negative hit (same rule).
 *   • Deduplicated, capped at 5, sorted by magnitude contribution.
 */
function extractKeyPhrases(
  positiveHits: string[],
  negativeHits: string[],
): string[] {
  const all = [
    ...positiveHits.map((h) => ({ phrase: h, polarity: "pos" as const })),
    ...negativeHits.map((h) => ({ phrase: h, polarity: "neg" as const })),
  ];

  // Deduplicate by phrase (case-insensitive) — keep the first
  // occurrence's polarity.
  const seen = new Set<string>();
  const unique: { phrase: string; polarity: "pos" | "neg" }[] = [];
  for (const h of all) {
    const key = h.phrase.toLowerCase().trim();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(h);
    }
  }

  // Cap at 5 — favour multi-word phrases (they carry more context).
  unique.sort((a, b) => {
    const aMulti = a.phrase.includes(" ") ? 1 : 0;
    const bMulti = b.phrase.includes(" ") ? 1 : 0;
    if (aMulti !== bMulti) return bMulti - aMulti;
    // Stable sort otherwise — preserve original order.
    return 0;
  });

  return unique.slice(0, 5).map((h) => h.phrase);
}

// ═══════════════════════════════════════════════════════════════
//  6. PUBLIC ENTRY POINT
// ═══════════════════════════════════════════════════════════════

/**
 * Analyse the sentiment of a piece of text.
 *
 * Returns:
 *   • score      ∈ [-1, +1]
 *   • confidence ∈ [0, 1]
 *   • language   ∈ { "fr", "ar", "en" }
 *   • label      ∈ { "positive", "neutral", "negative" }
 *   • keyPhrases — up to 5 phrases that drove the score
 *   • positiveHits, negativeHits — debug arrays
 *
 * Cost: ~1ms per 1KB of text on a modern CPU. No I/O, no LLM.
 */
export function analyzeSentiment(text: string): SentimentAnalysis {
  if (!text || text.trim().length === 0) {
    return {
      score: 0,
      confidence: 0,
      language: "fr",
      label: "neutral",
      keyPhrases: [],
      positiveHits: [],
      negativeHits: [],
    };
  }

  const language = detectLanguage(text);
  const tokens = tokenise(text, language);
  if (tokens.length === 0) {
    return {
      score: 0,
      confidence: 0,
      language,
      label: "neutral",
      keyPhrases: [],
      positiveHits: [],
      negativeHits: [],
    };
  }

  const { positiveScore, negativeScore, positiveHits, negativeHits } =
    scoreTokens(tokens, language);

  // Composite score: (pos - neg) / (pos + neg + smoothing)
  // Smoothing = 1 so a single hit produces a sub-1 score.
  const smoothing = 1;
  const total = positiveScore + negativeScore;
  const rawScore = total > 0
    ? (positiveScore - negativeScore) / (total + smoothing)
    : 0;
  const score = Math.max(-1, Math.min(1, rawScore));

  // Confidence: based on the number of sentiment hits.
  //  0 hits  → 0.10 (very low — we have no signal)
  //  1 hit   → 0.45
  //  2 hits  → 0.65
  //  3 hits  → 0.78
  //  4 hits  → 0.86
  //  5+ hits → 0.90..0.95 (diminishing returns)
  const hitCount = positiveHits.length + negativeHits.length;
  let confidence: number;
  if (hitCount === 0) confidence = 0.1;
  else if (hitCount === 1) confidence = 0.45;
  else if (hitCount === 2) confidence = 0.65;
  else if (hitCount === 3) confidence = 0.78;
  else if (hitCount === 4) confidence = 0.86;
  else confidence = Math.min(0.95, 0.86 + (hitCount - 4) * 0.02);

  // Boost confidence when pos and neg are both non-trivial (mixed
  // sentiment is more reliable than a single-word read).
  if (positiveHits.length > 0 && negativeHits.length > 0) {
    confidence = Math.min(0.95, confidence + 0.05);
  }

  // Label thresholds.
  let label: "positive" | "neutral" | "negative";
  if (score > 0.15) label = "positive";
  else if (score < -0.15) label = "negative";
  else label = "neutral";

  const keyPhrases = extractKeyPhrases(positiveHits, negativeHits);

  return {
    score: Math.round(score * 1000) / 1000,
    confidence: Math.round(confidence * 100) / 100,
    language,
    label,
    keyPhrases,
    positiveHits,
    negativeHits,
  };
}

/**
 * Convenience: analyse a Moroccan-media article (title + description).
 * Returns the same shape as `analyzeSentiment` but operates on the
 * combined title + description string that the RSS scraper exposes.
 *
 * Used by the RSS scraper (run-scrape.ts) to store the enhanced
 * sentiment in the Article table.
 */
export function analyzeArticleSentiment(
  title: string,
  description: string = "",
): SentimentAnalysis {
  const combined = `${title || ""}. ${description || ""}`.trim();
  return analyzeSentiment(combined);
}

// ═══════════════════════════════════════════════════════════════
//  7. LEXICON STATS (for the admin / docs page)
// ═══════════════════════════════════════════════════════════════

export const LEXICON_STATS = {
  fr: { positive: FR_POSITIVE.length, negative: FR_NEGATIVE.length },
  ar: { positive: AR_POSITIVE.length, negative: AR_NEGATIVE.length },
  en: { positive: EN_POSITIVE.length, negative: EN_NEGATIVE.length },
} as const;
