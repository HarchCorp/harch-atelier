// ═══════════════════════════════════════════════════════════════
//  HARCHIQ DARIJA NLP — Real Moroccan Darija pipeline
//
//  The differentiating feature of Harch: nobody else in the
//  reputation-intelligence space runs a real Darija detector. We do.
//
//  Three stages, all lexicon + rule based (no trained model needed):
//    1. detectLanguage()  → darija | arabic | french | english | mixed
//    2. analyzeSentiment() → score [-1, +1], label, confidence
//    3. extractEntities()  → people, organizations, locations
//
//  Detection heuristics (priority order):
//    • Arabic script chars (\u0600-\u06FF) present → Arabic-family.
//      Disambiguate via Darija-specific markers (واش, شحال, فين…).
//    • Arabizi (Latin-script Darija with digits-as-letters:
//      3=ع, 7=ح, 9=ق, 2=ء, 5=خ) → Darija even with no Arabic script.
//    • French stopwords (le, la, les, de, du…) + no Arabic script
//      → French.
//    • English stopwords (the, a, is, are, was…) + no Arabic script
//      → English.
//    • CJK script chars (\u4E00-\u9FFF) → Chinese (counts toward
//      "mixed" when paired with another language).
//    • 2+ languages each > 30% confidence → "mixed".
//
//  Task ID: darija-nlp
//  Module:  harchiq/darija
// ═══════════════════════════════════════════════════════════════

// ─── PUBLIC TYPES ───────────────────────────────────────────────

export type LanguageLabel = "darija" | "arabic" | "french" | "english" | "mixed";

export interface LanguageDetection {
  language: LanguageLabel;
  confidence: number;          // 0..1
  markers: string[];           // human-readable signals that fired
}

export interface SentimentResult {
  score: number;               // -1..+1
  label: "positive" | "negative" | "neutral";
  confidence: number;          // 0..1
  positiveHits: string[];      // words that triggered the positive score
  negativeHits: string[];      // words that triggered the negative score
}

export interface EntityResult {
  people: string[];
  organizations: string[];
  locations: string[];
}

export interface DarijaAnalysis {
  text: string;
  language: LanguageDetection;
  sentiment: SentimentResult;
  entities: EntityResult;
  analyzedAt: string;
}

// ─── 1. LEXICONS (real Darija, not mock) ────────────────────────

// Moroccan-Darija-specific markers — these are the words/phrases
// that distinguish Darija from Modern Standard Arabic. Each entry
// is the Arabic-script form (the canonical written Darija), with
// the Latin transliteration in a comment for the maintainer.
const DARIJA_MARKERS_AR: string[] = [
  "واش",     // wash — est-ce que
  "شحال",    // shhal — combien
  "فين",     // fin — où
  "آش",      // ash — quoi
  "أش",      // ash (alt spelling)
  "بغيت",    // bghit — je veux
  "بغيتو",   // bghitou
  "بغينا",   // bghina
  "كيداير",  // kidayer — comment ça va
  "كيدايرة", // kidayra
  "كداير",   // kdayr
  "مزيان",   // mezian — bien
  "مزيانة",  // meziana
  "خويا",    // khoya — mon frère
  "ختي",     // khti — ma sœur
  "ڭال",     // qal — il a dit
  "ڭالت",    // qalat
  "ڭلت",     // qolt
  "ديال",    // dyal — de/à (possessive)
  "ديالي",   // dyali
  "ديالك",   // dyalek
  "بزاف",    // bzaf — beaucoup
  "دابا",    // daba — maintenant
  "تبا",     // taba
  "واخا",    // wakha — OK
  "يالله",   // yallah
  "سير",     // sir — va
  "سيرو",    // sirou
  "علاش",    // 3lash — pourquoi
  "كيفاش",   // kifash — comment
  "كاين",    // kayn — il y a
  "كاينة",   // kayna
  "كاينين",  // kaynin
  "عندي",    // 3andi — j'ai
  "عندو",    // 3andou — il a
  "عندها",   // 3andha
  "حيت",     // hit — parce que
  "حيتش",    // hitch
  "هاد",     // had — ce/cette
  "هادي",    // hadi
  "هادو",    // hadou
  "بصح",     // bsah — vraiment
  "بصحة",    // bsa7a
  "الصح",    // sa7
  "ايه",     // iyeh — oui
  "أيه",     // ayeh
  "لاه",     // lah — non
  "شوية",    // chwiya — un peu
  "برك",     // barak — seulement
  "غير",     // ghir — seulement
  "الزبناء", // zbbana — clients (Banking context!)
  "الخدا",   // service
  "الخدمة",  // service / job
  "شنو",     // shnoun — quoi (alt)
  "أشمن",    // ashmen
];

// Arabizi markers — Darija written in Latin script with the
// Moroccan convention of using digits for letters without a Latin
// equivalent (3=ع, 7=ح, 9=ق, 2=ء, 5=خ, 8=غ, 6=ط). Lower-cased.
const DARIJA_MARKERS_LATIN: string[] = [
  "wakha", "bzaf", "daba", "bghit", "3lash", "3la", "kifash", "kif",
  "wash", "sh7al", "shhal", "fin", "ach", "ash", "mezian", "meziana",
  "khoya", "khouya", "khti", "dyal", "dyali", "dyalek", "taba",
  "yallah", "sir", "kidayer", "kidayr", "3andi", "3andou", "3andha",
  "hit", "hitch", "had", "hadi", "hadou", "bsah", "bsa7a", "iyeh",
  "chwiya", "barak", "ghir", "shnoun", "9al", "qal", "ktar", "wsel",
  "mzyan", "mzyana", "n9ol", "machi", "wach", "chno",
];

// Map of Arabizi digit-to-letter for normalisation (3→ع etc.).
const ARABIZI_DIGIT_MAP: Record<string, string> = {
  "3": "ع", "7": "ح", "9": "ق", "2": "ء", "5": "خ", "8": "غ", "6": "ط", "4": "ذ",
};

// French words commonly code-switched into Darija speech. Their
// presence alongside Arabic script strongly suggests Darija (not
// MSA) — MSA speakers don't mix French.
const FRENCH_IN_DARIJA: string[] = [
  "la", "le", "les", "voiture", "patron", "merci", "bonjour",
  "au revoir", "ça va", "ça", "oui", "non", "_bank", "banque",
  "mon", "ma", "mes", "service", "facture", "agent", "bureau",
  "stage", "stagiaire", "directeur", "responsable", "patron",
  "client", "travail", "vacances", "weekend", "match", "mat",
];

// Standard French stopwords — when no Arabic script is present and
// these dominate, classify as French.
const FRENCH_STOPWORDS: string[] = [
  "le", "la", "les", "de", "du", "et", "est", "une", "des", "dans",
  "pour", "avec", "sur", "par", "que", "qui", "dans", "son", "sa",
  "ses", "ne", "pas", "au", "aux", "ce", "cette", "ces", "on",
  "nous", "vous", "il", "elle", "ils", "elles", "se", "comme",
];

// Standard English stopwords.
const ENGLISH_STOPWORDS: string[] = [
  "the", "a", "an", "is", "are", "was", "were", "in", "on", "at",
  "to", "for", "of", "and", "or", "with", "by", "from", "this",
  "that", "these", "those", "it", "its", "has", "have", "had",
  "be", "been", "being", "as", "not", "but", "they", "their",
];

// ─── SENTIMENT LEXICONS (real Darija words) ─────────────────────
//
// Each entry is keyed by the Arabic-script form. We also accept
// the Latin transliteration (case-insensitive) for Arabizi input.
// Weight is in [-1..+1]; magnitude expresses intensity.

interface LexiconEntry {
  ar: string;          // Arabic script form
  latin: string[];     // Latin/Arabizi transliterations
  weight: number;      // -1..+1
}

const POSITIVE_LEXICON: LexiconEntry[] = [
  { ar: "مزيان",       latin: ["mezian", "mzyan"],            weight: 0.6 },
  { ar: "مزيانة",      latin: ["meziana", "mzyana"],          weight: 0.6 },
  { ar: "زوين",        latin: ["zwin", "zwine"],              weight: 0.7 },
  { ar: "زوينة",       latin: ["zwina"],                      weight: 0.7 },
  { ar: "نبين",        latin: ["nbin", "nabin"],              weight: 0.5 },
  { ar: "ڭواع",        latin: ["guoa", "gwoaa"],              weight: 0.5 },
  { ar: "توب",         latin: ["toub", "top"],                weight: 0.6 },
  { ar: "هايلة",       latin: ["hayla", "hayla"],             weight: 0.8 },
  { ar: "رائعة",       latin: ["ra2i3a", "ra2ia"],            weight: 0.8 },
  { ar: "بركالة",      latin: ["baraka", "barakallah"],       weight: 0.7 },
  { ar: "شكرا",        latin: ["chokran", "choukran", "shukran"], weight: 0.6 },
  { ar: "ممتاز",       latin: ["momtaz"],                     weight: 0.9 },
  { ar: "ناجح",        latin: ["najeh", "najih"],             weight: 0.7 },
  { ar: "نجاح",        latin: ["najah"],                      weight: 0.8 },
  { ar: "خير",         latin: ["khir"],                       weight: 0.5 },
  { ar: "حب",          latin: ["heb", "hob"],                 weight: 0.6 },
  { ar: "فرح",         latin: ["farh"],                       weight: 0.7 },
  { ar: "كيف",         latin: ["kif"],                        weight: 0.4 },
  { ar: "صافي",        latin: ["safi"],                       weight: 0.3 },
  { ar: "تمام",        latin: ["tamam"],                      weight: 0.5 },
  { ar: "هاني",        latin: ["hani"],                       weight: 0.4 },
  { ar: "مبارك",       latin: ["mabrouk"],                    weight: 0.8 },
  { ar: "مبروك",       latin: ["mabrouk", "mabruk"],          weight: 0.8 },
  { ar: "نتائج",       latin: ["nataij"],                     weight: 0.5 },
  { ar: "نتائف",       latin: ["nataif"],                     weight: 0.5 }, // alt spelling
  { ar: "طالع",        latin: ["tale3"],                      weight: 0.6 }, // going up (stocks)
  { ar: "طالعو",       latin: ["tale3ou"],                    weight: 0.6 },
  { ar: "نمو",         latin: ["numuw"],                      weight: 0.7 },
  { ar: "تطور",        latin: ["tatawur"],                    weight: 0.7 },
  { ar: "أرباح",       latin: ["arbah"],                      weight: 0.7 },
  { ar: "ربح",         latin: ["rabh"],                       weight: 0.7 },
];

const NEGATIVE_LEXICON: LexiconEntry[] = [
  { ar: "خايب",        latin: ["khayb", "5ayb"],              weight: -0.8 },
  { ar: "مسخوط",       latin: ["maskhout"],                   weight: -0.7 },
  { ar: "حيت",         latin: ["hit"],                        weight: -0.3 }, // "because" — contextually often negative
  { ar: "زرف",         latin: ["zerf", "zerf"],               weight: -0.6 },
  { ar: "ڭيض",         latin: ["qidd", "qiyd"],               weight: -0.7 },
  { ar: "مغضوب",       latin: ["maghdoub"],                   weight: -0.8 },
  { ar: "سيء",         latin: ["sayyi2", "say2"],             weight: -0.8 },
  { ar: "مشكل",        latin: ["mochkil", "mushkil"],         weight: -0.7 },
  { ar: "مشكل كبير",   latin: ["mochkil kbir"],               weight: -0.9 },
  { ar: "فضيحة",       latin: ["fadi7a", "fadiha"],           weight: -0.9 },
  { ar: "كارثة",       latin: ["karitha", "karita"],          weight: -0.9 },
  { ar: "مضايقين",     latin: ["mdayqin"],                    weight: -0.7 },
  { ar: "مضايق",       latin: ["mdayq"],                      weight: -0.7 },
  { ar: "غاضب",        latin: ["ghadib"],                     weight: -0.8 },
  { ar: "غضب",         latin: ["ghadab"],                     weight: -0.7 },
  { ar: "خسارة",       latin: ["khasara"],                    weight: -0.8 },
  { ar: "خسر",         latin: ["khasar"],                     weight: -0.7 },
  { ar: "نزول",        latin: ["nuzul"],                      weight: -0.5 }, // going down (stocks)
  { ar: "نزل",         latin: ["nzel"],                       weight: -0.5 },
  { ar: "أزمة",        latin: ["azma"],                       weight: -0.8 },
  { ar: "أزمة كبيرة",  latin: ["azma kbira"],                 weight: -0.9 },
  { ar: "ديون",        latin: ["dyoun"],                      weight: -0.6 },
  { ar: "فشل",         latin: ["fachl", "fashl"],             weight: -0.9 },
  { ar: "تأخر",        latin: ["ta2akhkhur"],                 weight: -0.5 },
  { ar: "بطيء",        latin: ["bati2"],                      weight: -0.5 },
  { ar: "سيئة",        latin: ["sayyi2a"],                    weight: -0.8 },
  { ar: "ناقص",        latin: ["naqis"],                      weight: -0.5 },
  { ar: "نقص",         latin: ["nuqs"],                       weight: -0.6 },
  { ar: "مظلمة",       latin: ["mazlama"],                    weight: -0.7 },
  { ar: "احتجاج",      latin: ["ihtijaj"],                    weight: -0.6 },
  { ar: "إضراب",       latin: ["idrab"],                      weight: -0.6 },
  { ar: "فضيحة كبيرة", latin: ["fadi7a kbira"],               weight: -1.0 },
];

// ─── ENTITY LEXICONS ─────────────────────────────────────────────

// Moroccan cities — both Arabic script and Latin spellings.
const MOROCCAN_CITIES_AR: string[] = [
  "الدار البيضاء", "الدارلبيضاء", "كازا", "كازابلانكا",
  "الرباط", "مراكش", "طنجة", "فاس", "فès", "أكادير", "مكناس",
  "وجدة", "القنيطرة", "تطوان", "سلا", "العيون", "الجديدة",
  "بني ملال", "الناظور", "خريبكة", "ورزازات", "سطات",
  "المحمدية", "الصويرة", "تازة", "برشيد", "خنيفرة",
];

const MOROCCAN_CITIES_LATIN: string[] = [
  "Casablanca", "Casa", "Rabat", "Marrakech", "Tanger", "Tangier",
  "Fès", "Fes", "Agadir", "Meknès", "Meknes", "Oujda", "Kénitra",
  "Kenitra", "Tétouan", "Tetouan", "Salé", "Sale", "Laâyoune",
  "El Jadida", "Beni Mellal", "Nador", "Khouribga", "Ouarzazate",
  "Settat", "Mohammedia", "Essaouira", "Taza", "Berrechid",
];

// Words that signal an organization follows (or precedes).
const ORG_SIGNALS_AR: string[] = ["بانك", "بنك", "شركة", "مجموعة", "مؤسسة", "بنك"];
const ORG_SIGNALS_LATIN: string[] = ["Bank", "Group", "Corp", "Corporation", "Ltd", "SA", "S.A", "Holding"];

// Titles that signal a person follows.
const PERSON_TITLES_AR: string[] = ["السيد", "السيدة", "الأنسة", "الأستاذ"];
const PERSON_TITLES_LATIN: string[] = ["M.", "Mme", "Mlle", "Mr.", "Mr ", "Mrs.", "Ms.", "Dr.", "Pr."];

// Well-known Moroccan organizations (catch-all when the org signal
// doesn't fire but the name is recognisable).
const KNOWN_ORGS: string[] = [
  "Attijariwafa Bank", "Attijariwafa", "Banque Populaire", "Bank Populaire",
  "Bank of Africa", "BMCE", "BMCI", "CIH Bank", "CIH", "Crédit Agricole",
  "Crédit du Maroc", "OCP", "OCP Group", "Maroc Telecom", "IAM",
  "Royal Air Maroc", "RAM", "Lydec", "Redal", "ONEE", "Nareva",
  "Managem", "Cosumar", "Lesieur", "Centrale Danone", "LesieurCristal",
  "Inwi", "Wana", "Marjane", "Marjane Market", "Label'Vie", "Label Vie",
];

// ─── INTERNAL HELPERS ────────────────────────────────────────────

const ARABIC_SCRIPT_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
const ARABIC_SCRIPT_CHARS_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g;
const CJK_SCRIPT_RE = /[\u4E00-\u9FFF\u3400-\u4DBF]/;
const CJK_SCRIPT_CHARS_RE = /[\u4E00-\u9FFF\u3400-\u4DBF]/g;
const LATIN_WORD_RE = /[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9'’.-]*/g;

/** Count characters matching a regex (returns 0 if none). */
function countMatches(text: string, re: RegExp): number {
  const m = text.match(re);
  return m ? m.length : 0;
}

/** Tokenise Arabic-script text into whitespace-separated tokens,
 *  stripping common punctuation. */
function tokenizeArabic(text: string): string[] {
  // Remove punctuation/diacritics, keep Arabic letters.
  const cleaned = text
    .replace(/[\u064B-\u065F\u0670]/g, "") // diacritics
    .replace(/[.,!?;:()\[\]{}«»"'`~@#$%^&*+=|\\/<>]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return [];
  return cleaned.split(" ").filter((t) => t.length > 0);
}

/** Tokenise Latin text into words (lower-cased) for stopword checks. */
function tokenizeLatin(text: string): string[] {
  const matches = text.match(LATIN_WORD_RE);
  if (!matches) return [];
  return matches.map((w) => w.toLowerCase());
}

/** Normalise Arabizi digits in a Latin token to their Arabic-letter
 *  equivalent (3→ع, 7→ح, 9→ق, …) so "3lash" matches the "علاش"
 *  Arabic-form lexicon when we want cross-script matching. Returns
 *  the token lower-cased with digits substituted. */
function normaliseArabizi(token: string): string {
  let out = "";
  for (const ch of token.toLowerCase()) {
    out += ARABIZI_DIGIT_MAP[ch] ?? ch;
  }
  return out;
}

/** Build a single regex that matches any of the given literal strings.
 *  When `wordBoundary` is true (default), wraps the alternation in
 *  Unicode-aware word boundaries so "le" doesn't match inside
 *  "launched". Returns null if list is empty. */
function buildAlternationRe(
  words: string[],
  flags: "g" | "gi" = "gi",
  wordBoundary = true,
): RegExp | null {
  if (words.length === 0) return null;
  // Escape regex metachars in each word, then join (longest first
  // so the alternation prefers the longer match).
  const escaped = words
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .sort((a, b) => b.length - a.length);
  const inner = escaped.join("|");
  const pattern = wordBoundary
    ? `(?<![\\p{L}\\p{N}_])(?:${inner})(?![\\p{L}\\p{N}_])`
    : `(?:${inner})`;
  return new RegExp(pattern, `${flags}u`);
}

// Pre-built regexes for hot-path matching.
const DARIJA_AR_RE = buildAlternationRe(DARIJA_MARKERS_AR);
const DARIJA_LATIN_RE = buildAlternationRe(DARIJA_MARKERS_LATIN);
const FRENCH_STOP_RE = buildAlternationRe(FRENCH_STOPWORDS);
const ENGLISH_STOP_RE = buildAlternationRe(ENGLISH_STOPWORDS);
const FRENCH_IN_DARIJA_RE = buildAlternationRe(FRENCH_IN_DARIJA);
const MOROCCAN_CITIES_AR_RE = buildAlternationRe(MOROCCAN_CITIES_AR);
const MOROCCAN_CITIES_LATIN_RE = buildAlternationRe(MOROCCAN_CITIES_LATIN);
const KNOWN_ORGS_RE = buildAlternationRe(KNOWN_ORGS);

// ─── 2. LANGUAGE DETECTION ──────────────────────────────────────

interface LanguageScore {
  label: Exclude<LanguageLabel, "mixed">;
  confidence: number;        // 0..1
  markers: string[];         // human-readable
}

function scoreLanguages(text: string): LanguageScore[] {
  const scores: LanguageScore[] = [];
  const markers: string[] = [];

  // Script counts
  const arabicChars = countMatches(text, ARABIC_SCRIPT_CHARS_RE);
  const cjkChars = countMatches(text, CJK_SCRIPT_CHARS_RE);
  const totalChars = text.length || 1;

  const hasArabic = arabicChars > 0;
  const hasCjk = cjkChars > 0;

  // ─ Darija scoring ─
  let darijaMarkersFound = 0;

  // Arabic-script Darija markers
  if (DARIJA_AR_RE) {
    const arMatches = text.match(DARIJA_AR_RE);
    if (arMatches) {
      darijaMarkersFound += arMatches.length;
      // Deduplicate marker strings for the human-readable list.
      const uniqueAr = Array.from(new Set(arMatches));
      for (const m of uniqueAr) markers.push(`darija:${m}`);
    }
  }

  // Latin/Arabizi Darija markers
  const lowerText = text.toLowerCase();
  if (DARIJA_LATIN_RE) {
    const latMatches = lowerText.match(DARIJA_LATIN_RE);
    if (latMatches) {
      darijaMarkersFound += latMatches.length;
      const uniqueLat = Array.from(new Set(latMatches));
      for (const m of uniqueLat) markers.push(`darija-arabizi:${m}`);
    }
  }

  // French-in-Darija (code-switching signal)
  let frenchInDarijaCount = 0;
  if (FRENCH_IN_DARIJA_RE) {
    const fMatches = lowerText.match(FRENCH_IN_DARIJA_RE);
    if (fMatches) {
      frenchInDarijaCount = fMatches.length;
      const uniqueF = Array.from(new Set(fMatches));
      for (const m of uniqueF) markers.push(`french-borrow:${m}`);
    }
  }

  // Darija confidence model:
  //   0 markers → 0
  //   1 marker  → 0.70
  //   2 markers → 0.85
  //   3+        → 0.95
  // If French-borrow words are also present, nudge +0.05 (capped 0.99)
  // because French code-switching is itself a Darija tell.
  let darijaConf = 0;
  if (darijaMarkersFound > 0) {
    darijaConf = darijaMarkersFound >= 3
      ? 0.95
      : darijaMarkersFound === 2
        ? 0.85
        : 0.70;
    if (frenchInDarijaCount > 0 && hasArabic) {
      darijaConf = Math.min(0.99, darijaConf + 0.05);
    }
  } else if (frenchInDarijaCount > 0 && hasArabic) {
    // No hard Darija markers but French borrowings inside Arabic
    // text — still a Darija tell (MSA doesn't borrow French).
    darijaConf = 0.55;
  }
  if (darijaConf > 0) {
    scores.push({ label: "darija", confidence: darijaConf, markers });
  }

  // ─ Arabic (MSA) scoring ─
  // Arabic script present but no Darija markers → likely MSA.
  if (hasArabic) {
    const arabicFraction = arabicChars / totalChars;
    // Confidence scales with how much Arabic there is, but is
    // reduced when Darija markers are present (Darija wins).
    const msaConf = darijaMarkersFound === 0
      ? Math.min(0.9, 0.55 + arabicFraction * 1.5)
      : Math.max(0.05, 0.4 - darijaMarkersFound * 0.1);
    const msaMarkers: string[] = [`arabic-script:${arabicChars} chars`];
    if (msaConf > 0.1) {
      scores.push({ label: "arabic", confidence: msaConf, markers: msaMarkers });
    }
  }

  // ─ French scoring (only when no Arabic script) ─
  // We also let French compete when it appears in code-switch with
  // Arabic (Darija), but it doesn't get its own slot there because
  // the French-borrow signal already fed into the Darija score.
  if (!hasArabic) {
    const latinTokens = tokenizeLatin(text);
    const totalLatin = latinTokens.length || 1;
    let frenchStopHits = 0;
    if (FRENCH_STOP_RE) {
      const fMatches = lowerText.match(FRENCH_STOP_RE);
      frenchStopHits = fMatches ? fMatches.length : 0;
    }
    if (frenchStopHits > 0) {
      const ratio = frenchStopHits / totalLatin;
      const frConf = Math.min(0.95, 0.55 + ratio * 1.8);
      scores.push({
        label: "french",
        confidence: frConf,
        markers: [`french-stop:${frenchStopHits}×`],
      });
    }
  }

  // ─ English scoring ─
  // English can coexist with anything (it's the global lingua
  // franca of business news) — so we always score it.
  {
    const latinTokens = tokenizeLatin(text);
    const totalLatin = latinTokens.length || 1;
    let enStopHits = 0;
    if (ENGLISH_STOP_RE) {
      const eMatches = lowerText.match(ENGLISH_STOP_RE);
      enStopHits = eMatches ? eMatches.length : 0;
    }
    if (enStopHits > 0) {
      const ratio = enStopHits / totalLatin;
      const enConf = Math.min(0.95, 0.45 + ratio * 2.0);
      scores.push({
        label: "english",
        confidence: enConf,
        markers: [`english-stop:${enStopHits}×`],
      });
    }
  }

  // ─ Chinese (CJK) scoring ─
  // We don't have a full Chinese analyser, but we DO need to detect
  // CJK script so that English+CJK input classifies as "mixed"
  // rather than plain English (this is what the third sample text
  // exercises). The public LanguageLabel type doesn't include
  // "chinese" (the spec limits us to darija|arabic|french|english
  // |mixed), so we attach the CJK signal to the english slot but
  // tag it with a `cjk-script:` marker so the mixed-verdict logic
  // below can recognise it as a distinct language.
  if (hasCjk) {
    const cjkFraction = cjkChars / totalChars;
    const cnConf = Math.min(0.9, 0.4 + cjkFraction * 3);
    scores.push({
      label: "english",          // borrowed slot — see comment above
      confidence: cnConf,
      markers: [`cjk-script:${cjkChars} chars`],
    });
  }

  return scores;
}

export function detectLanguage(text: string): LanguageDetection {
  if (!text || text.trim().length === 0) {
    return { language: "english", confidence: 0, markers: ["empty-input"] };
  }

  const scores = scoreLanguages(text);
  if (scores.length === 0) {
    return { language: "english", confidence: 0.2, markers: ["no-signals"] };
  }

  // Sort by confidence desc.
  scores.sort((a, b) => b.confidence - a.confidence);

  // Collect ALL markers for the human-readable output.
  const allMarkers = scores.flatMap((s) => s.markers);

  // Mixed verdict: 2+ languages each > 0.30 confidence.
  // (CJK is encoded as a marker on an english-slot entry, so we
  // detect "mixed" specially when CJK markers coexist with a real
  // english entry that has its own non-CJK marker.)
  const topConfident = scores.filter((s) => s.confidence > 0.30);
  const hasCjkMarker = allMarkers.some((m) => m.startsWith("cjk-script:"));
  const hasRealEnglish = scores.some(
    (s) =>
      s.label === "english" &&
      s.confidence > 0.30 &&
      s.markers.some((m) => !m.startsWith("cjk-script:")),
  );
  const hasRealSecondLanguage =
    topConfident.filter(
      (s) =>
        s.label !== "english" ||
        s.markers.some((m) => !m.startsWith("cjk-script:")),
    ).length >= 2;

  if (
    (topConfident.length >= 2 && hasRealSecondLanguage) ||
    (hasCjkMarker && hasRealEnglish)
  ) {
    // Compute a synthetic "mixed" confidence: average of top 2.
    const top2 = topConfident.slice(0, 2);
    const mixedConf =
      top2.length === 2
        ? (top2[0].confidence + top2[1].confidence) / 2
        : top2[0].confidence;
    return {
      language: "mixed",
      confidence: Math.min(0.95, mixedConf),
      markers: allMarkers,
    };
  }

  // Single-language winner.
  const winner = scores[0];
  return {
    language: winner.label,
    confidence: winner.confidence,
    markers: allMarkers,
  };
}

// ─── 3. SENTIMENT ANALYSIS ──────────────────────────────────────

export function analyzeSentiment(
  text: string,
  _language: string,
): SentimentResult {
  if (!text || text.trim().length === 0) {
    return { score: 0, label: "neutral", confidence: 0, positiveHits: [], negativeHits: [] };
  }

  // Build a flat searchable surface: original text + an Arabizi-
  // normalised version (so "mzyan" matches the "مزيان" lexicon
  // entry's latin form, and so "3lash" matches "علاش").
  const lowerText = text.toLowerCase();
  const normalised = normaliseArabizi(lowerText);

  let positiveScore = 0;
  let negativeScore = 0;
  let totalWeight = 0;
  const positiveHits: string[] = [];
  const negativeHits: string[] = [];

  // Scan the lexicons. Each entry contributes its weight when any
  // of its surface forms (Arabic or Latin) appears in the text.
  const scanLexicon = (lex: LexiconEntry[], sinkPositive: boolean) => {
    for (const entry of lex) {
      let hit = false;
      // Arabic-script form
      if (entry.ar && text.includes(entry.ar)) hit = true;
      // Latin/Arabizi forms (try both raw and normalised)
      if (!hit) {
        for (const lat of entry.latin) {
          const latLow = lat.toLowerCase();
          // word-boundary match on the lowercased text
          const re = new RegExp(`(^|[^a-z0-9])${latLow.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`, "i");
          if (re.test(lowerText) || re.test(normalised)) {
            hit = true;
            break;
          }
        }
      }
      if (hit) {
        if (sinkPositive) {
          positiveScore += entry.weight;
          positiveHits.push(entry.ar);
        } else {
          negativeScore += Math.abs(entry.weight);
          negativeHits.push(entry.ar);
        }
        totalWeight += Math.abs(entry.weight);
      }
    }
  };

  scanLexicon(POSITIVE_LEXICON, true);
  scanLexicon(NEGATIVE_LEXICON, false);

  // Score = (positive - negative) / (total + smoothing).
  // Smoothing = 1 so a single hit still produces a sub-1 score.
  const smoothing = 1;
  const score = totalWeight > 0
    ? (positiveScore - negativeScore) / (totalWeight + smoothing)
    : 0;

  // Label thresholds (from spec).
  let label: "positive" | "negative" | "neutral";
  if (score > 0.1) label = "positive";
  else if (score < -0.1) label = "negative";
  else label = "neutral";

  // Confidence: more sentiment words = higher confidence.
  // 0 hits → 0.1 (very low), 1 hit → 0.45, 2 → 0.65, 3+ → 0.85.
  const hitCount = positiveHits.length + negativeHits.length;
  const confidence = hitCount === 0
    ? 0.1
    : hitCount === 1
      ? 0.45
      : hitCount === 2
        ? 0.65
        : Math.min(0.95, 0.65 + (hitCount - 2) * 0.1);

  return {
    score: Math.max(-1, Math.min(1, score)),
    label,
    confidence,
    positiveHits,
    negativeHits,
  };
}

// ─── 4. ENTITY EXTRACTION ───────────────────────────────────────

/** Drop strings that are strict substrings of another string in
 *  the list. Longer entries win; ties keep the first-seen order. */
function dedupeSubstrings(items: string[]): string[] {
  if (items.length <= 1) return items;
  const kept: string[] = [];
  for (const item of items) {
    const isSubstringOfAnother = items.some(
      (other) => other !== item && other.toLowerCase().includes(item.toLowerCase()),
    );
    if (!isSubstringOfAnother) kept.push(item);
  }
  return kept;
}

export function extractEntities(
  text: string,
  _language: string,
): EntityResult {
  const result: EntityResult = { people: [], organizations: [], locations: [] };

  if (!text || text.trim().length === 0) return result;

  const lowerText = text.toLowerCase();
  const seenPeople = new Set<string>();
  const seenOrgs = new Set<string>();
  const seenLocs = new Set<string>();

  // ─ LOCATIONS ─ Moroccan cities (Arabic + Latin) ─
  if (MOROCCAN_CITIES_AR_RE) {
    const m = text.match(MOROCCAN_CITIES_AR_RE);
    if (m) for (const c of m) if (!seenLocs.has(c)) { seenLocs.add(c); result.locations.push(c); }
  }
  if (MOROCCAN_CITIES_LATIN_RE) {
    // Latin city matching is case-sensitive (proper nouns) — use
    // the original text, not lowercased.
    const m = text.match(MOROCCAN_CITIES_LATIN_RE);
    if (m) for (const c of m) if (!seenLocs.has(c)) { seenLocs.add(c); result.locations.push(c); }
  }

  // ─ ORGANIZATIONS ─
  // Strategy 1: known orgs (highest precision).
  if (KNOWN_ORGS_RE) {
    const m = text.match(KNOWN_ORGS_RE);
    if (m) {
      for (const o of m) {
        if (!seenOrgs.has(o)) { seenOrgs.add(o); result.organizations.push(o); }
      }
    }
  }

  // Common stopwords to reject as org-name candidates (English +
  // French + Arabic). Prevents "Bank launched" / "Bank of" style
  // false positives where a signal word is followed by a verb or
  // preposition rather than a proper noun.
  const ORG_CANDIDATE_REJECT = new Set<string>([
    "of", "the", "and", "or", "for", "in", "on", "at", "to", "by",
    "with", "from", "is", "are", "was", "were", "has", "have",
    "had", "be", "been", "being", "this", "that", "launched",
    "announced", "reported", "started", "opened", "closed", "today",
    "yesterday", "tomorrow", "new", "old", "first", "last", "next",
    "de", "du", "le", "la", "les", "des", "une", "un", "et", "ou",
    "pour", "avec", "sans", "dans", "sur", "par", "qui", "que",
  ]);

  // Strategy 2: org-signal patterns. For each org-signal word,
  // capture the following token as part of the org name. Latin
  // candidates must start with an uppercase letter (so "Bank
  // launched" is rejected — "launched" is lowercase); Arabic
  // candidates are accepted as-is (Arabic has no case).
  //   POST: "<Signal> <Name>"  → "Banque Populaire", "شركة OCP"
  //   PRE:  "<Name> <Signal>"  → "Attijariwafa Bank"
  // For Arabic we also handle "البنك الشعبي" via Strategy 3 below.
  const allOrgSignals = [...ORG_SIGNALS_AR, ...ORG_SIGNALS_LATIN];
  for (const signal of allOrgSignals) {
    const isLatinSignal = /^[A-Za-z]/.test(signal);
    const candidateStart = isLatinSignal ? "[A-Z\u0600-\u06FF]" : "[\u0600-\u06FF]";
    const sigRe = new RegExp(
      `(^|[\\s,،])(${signal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})\\s+(${candidateStart}[\\w\u0600-\u06FF-]{1,30})`,
      "g",
    );
    let m: RegExpExecArray | null;
    while ((m = sigRe.exec(text)) !== null) {
      const candidate = m[3].replace(/[.,،;:]$/g, "");
      const candidateLower = candidate.toLowerCase();
      if (
        !candidate ||
        candidate.length < 2 ||
        seenOrgs.has(candidate) ||
        ORG_CANDIDATE_REJECT.has(candidateLower) ||
        MOROCCAN_CITIES_LATIN.includes(candidate)
      ) {
        continue;
      }
      const combined = `${signal} ${candidate}`;
      if (!seenOrgs.has(combined)) {
        seenOrgs.add(combined);
        result.organizations.push(combined);
      }
    }
  }

  // Strategy 3: Arabic definite-article org constructs.
  // "البنك الشعبي" → "البنك" + "الشعبي" — capture the full 2-word
  // span as the org name. Filters out when the modifier is itself
  // a Darija marker (would create noisy duplicates).
  const arDefiniteOrgRe = /((?:ال)?بنك|الشركة|المجموعة|المؤسسة)\s+([\u0600-\u06FF]{2,20})/g;
  let am: RegExpExecArray | null;
  while ((am = arDefiniteOrgRe.exec(text)) !== null) {
    const combined = `${am[1]} ${am[2]}`.replace(/[.,،;:]$/g, "");
    if (!seenOrgs.has(combined) && !DARIJA_MARKERS_AR.includes(am[2])) {
      seenOrgs.add(combined);
      result.organizations.push(combined);
    }
  }

  // Strategy 4: dedupe — drop entries that are strict substrings of
  // another entry (e.g., "OCP" is a substring of "OCP Group" → keep
  // the longer one; "Attijariwafa" is a substring of "Attijariwafa
  // Bank" → keep the longer one).
  result.organizations = dedupeSubstrings(result.organizations);

  // ─ PEOPLE ─ titles followed by a name token.
  // Latin candidates must start uppercase; Arabic candidates are
  // accepted as-is. Reject common stopwords as person names.
  const PERSON_CANDIDATE_REJECT = new Set<string>([
    "the", "and", "or", "of", "in", "on", "at", "to", "for", "is",
    "was", "are", "le", "la", "les", "de", "du", "et", "une", "un",
  ]);
  const allPersonTitles = [...PERSON_TITLES_AR, ...PERSON_TITLES_LATIN];
  for (const title of allPersonTitles) {
    const isLatinTitle = /^[A-Za-z]/.test(title);
    const candidateStart = isLatinTitle ? "[A-Z\u0600-\u06FF]" : "[\u0600-\u06FF]";
    const titleRe = new RegExp(
      `(${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})\\s+(${candidateStart}[\\w\u0600-\u06FF.-]{1,40})`,
      "g",
    );
    let m: RegExpExecArray | null;
    while ((m = titleRe.exec(text)) !== null) {
      const candidate = m[2].replace(/[.,،;:]$/g, "");
      const candidateLower = candidate.toLowerCase();
      if (
        candidate &&
        candidate.length >= 2 &&
        !seenPeople.has(candidate) &&
        !PERSON_CANDIDATE_REJECT.has(candidateLower)
      ) {
        seenPeople.add(candidate);
        result.people.push(candidate);
      }
    }
  }

  return result;
}

// ─── 5. COMBINED ANALYSIS (used by the API route) ──────────────

export function analyzeDarijaText(text: string): DarijaAnalysis {
  const language = detectLanguage(text);
  const sentiment = analyzeSentiment(text, language.language);
  const entities = extractEntities(text, language.language);
  return {
    text,
    language,
    sentiment,
    entities,
    analyzedAt: new Date().toISOString(),
  };
}
