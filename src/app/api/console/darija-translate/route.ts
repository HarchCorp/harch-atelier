// ═══════════════════════════════════════════════════════════════
//  POST /api/console/darija-translate
//
//  Skill 31 — HarchIQ Darija Translator
//
//  Translates Hespress comments from Darija (Moroccan Arabic + French
//  mixed) into professional French. Two-stage pipeline:
//
//    Stage 1 — LEXICON (always runs)
//      • Detect language (darija | arabic | french | mixed)
//      • Walk the text, match each token against a 130+ entry
//        Darija→French lexicon (Arabic-script + Latin Arabizi
//        variants), replace matched tokens with French equivalents.
//      • Returns detectedWords[], translated baseline, confidence.
//
//    Stage 2 — LLM POLISH (only if ZAI_API_KEY is set)
//      • Send the original text + the lexicon-detected word pairs
//        as context to GLM-4 and ask for a polished professional
//        French translation.
//      • Replace the lexicon-translated string with the LLM output
//        and bump confidence to 0.9.
//
//  Body:     { text: string }
//  Auth:     NextAuth session required (any accountType).
//  Returns:  {
//    original:      string,
//    translated:    string,
//    language:      "darija" | "arabic" | "french" | "mixed",
//    confidence:    number,        // 0..1
//    detectedWords: Array<{ darija: string; french: string }>,
//    enhancedByLLM: boolean,
//  }
//
//  Task ID: SKILL-31-DARIJA
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { logInfo, logError } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// ─── PUBLIC TYPES (returned to client) ───────────────────────────

export type DarijaLanguage = "darija" | "arabic" | "french" | "mixed";

export interface DetectedWord {
  darija: string;
  french: string;
}

export interface DarijaTranslateResponse {
  original: string;
  translated: string;
  language: DarijaLanguage;
  confidence: number;
  detectedWords: DetectedWord[];
  enhancedByLLM: boolean;
}

// ─── 1. DARIJA → FRENCH LEXICON ──────────────────────────────────
//
//  Each entry has:
//    • darija   — canonical display form (used in detectedWords)
//    • french   — professional French translation
//    • variants — lowercase tokens that should match this entry
//                 (covers Arabic script + Latin Arabizi spellings)
//
//  Arabizi convention: 3=ع, 7=ح, 9=ق, 2=ء/أ, 5=خ, 6=ط, 8=غ.
//  Matching is case-insensitive on the Latin variants and
//  exact on the Arabic variants (Arabic has no case).

interface LexiconEntry {
  darija: string;
  french: string;
  variants: string[];
}

const LEXICON: LexiconEntry[] = [
  // — Greetings & polite formulas ———————————————
  { darija: "salam",        french: "bonjour",                variants: ["salam", "salaam", "السلام", "سلام"] },
  { darija: "sbah lkhir",   french: "bon matin",              variants: ["sbah lkhir", "sba7 lkhir", "sba7 l5ir", "صباح الخير"] },
  { darija: "msa lkhir",    french: "bonsoir",                variants: ["msa lkhir", "msa elkhir", "مساء الخير"] },
  { darija: "layla sa3ida", french: "bonne nuit",             variants: ["layla sa3ida", "ليلة سعيدة"] },
  { darija: "bslama",       french: "au revoir",              variants: ["bslama", "b slama", "بسلامة"] },
  { darija: "chokran",      french: "merci",                  variants: ["chokran", "choukran", "chokrane", "choukrane", "شكرا"] },
  { darija: "3afak",        french: "s'il te plaît",          variants: ["3afak", "3afaka", "عافاك"] },
  { darija: "3afakum",      french: "s'il vous plaît",        variants: ["3afakum", "عافاكم"] },
  { darija: "yallah",       french: "allons-y",               variants: ["yallah", "yala", "يلا"] },
  { darija: "inchallah",    french: "si Dieu le veut",        variants: ["inchallah", "inshallah", "inchAllah", "إن شاء الله"] },
  { darija: "hamdulah",     french: "loué soit Dieu",         variants: ["hamdulah", "hamdullah", "elhamdulillah", "الحمد لله"] },
  { darija: "lah y3awnek",  french: "que Dieu t'aide",        variants: ["lah y3awnek", "lah y3awnak", "الله يعاونك"] },
  { darija: "lah yrhamo",   french: "que Dieu ait son âme",   variants: ["lah yrhamo", "lah yrahmo", "الله يرحمو"] },
  { darija: "mabrouk",      french: "félicitations",          variants: ["mabrouk", "mabrhouk", "مبروك"] },

  // — Common verbs —————————————————————————————
  { darija: "bghit",        french: "je veux",                variants: ["bghit", "بغيت"] },
  { darija: "bghina",       french: "nous voulons",           variants: ["bghina", "بغينا"] },
  { darija: "mabghitch",    french: "je ne veux pas",         variants: ["mabghitch", "mabghitsh", "مابغيتش"] },
  { darija: "kanbghi",      french: "je voulais",             variants: ["kanbghi", "كنت بغيت"] },
  { darija: "fhemt",        french: "j'ai compris",           variants: ["fhemt", "fhamt", "فهمت"] },
  { darija: "mafhemtch",    french: "je n'ai pas compris",    variants: ["mafhemtch", "mafhamtsh", "مافهمتش"] },
  { darija: "gal",          french: "il a dit",               variants: ["gal", "gual", "قال"] },
  { darija: "galt",         french: "elle a dit",             variants: ["galt", "galet", "قالت"] },
  { darija: "kaygoul",      french: "il dit",                 variants: ["kaygoul", "kaygul", "كيقول"] },
  { darija: "chft",         french: "j'ai vu",                variants: ["chft", "chfet", "شفت"] },
  { darija: "machftch",     french: "je n'ai pas vu",         variants: ["machftch", "machftsh", "ماشفتش"] },
  { darija: "sm3t",         french: "j'ai entendu",           variants: ["sm3t", "smaat", "سمعت"] },
  { darija: "ja",           french: "il est venu",            variants: ["ja", "jaa", "جا"] },
  { darija: "jat",          french: "elle est venue",         variants: ["jat", "جات"] },
  { darija: "mcha",         french: "il est parti",           variants: ["mcha", "مشى"] },
  { darija: "mchit",        french: "je suis allé",           variants: ["mchit", "مشيت"] },
  { darija: "bqa",          french: "il est resté",           variants: ["bqa", "ba9a", "بقى"] },
  { darija: "rda",          french: "il a accepté",           variants: ["rda", "رضى"] },
  { darija: "skht",         french: "il s'est fâché",         variants: ["skht", "سخط"] },
  { darija: "talab",        french: "il a demandé",           variants: ["talab", "طلب"] },
  { darija: "3tani",        french: "il m'a donné",           variants: ["3tani", "أعطاني"] },
  { darija: "khdmt",        french: "j'ai travaillé",         variants: ["khdmt", "خدمت"] },

  // — Family & people ———————————————————————————
  { darija: "khoya",        french: "mon frère",              variants: ["khoya", "خويا"] },
  { darija: "khti",         french: "ma sœur",                variants: ["khti", "ختي"] },
  { darija: "lwalid",       french: "le père",                variants: ["lwalid", "لواليد"] },
  { darija: "lwalida",      french: "la mère",                variants: ["lwalida", "لواليدة"] },
  { darija: "lwalidin",     french: "les parents",            variants: ["lwalidin", "الوالدين"] },
  { darija: "3mmy",         french: "mon oncle",              variants: ["3mmy", "عمي"] },
  { darija: "drari",        french: "les enfants",            variants: ["drari", "دراري"] },
  { darija: "wlad",         french: "les fils",               variants: ["wlad", "ولاد"] },
  { darija: "bnat",         french: "les filles",             variants: ["bnat", "بنات"] },
  { darija: "rajel",        french: "l'homme",                variants: ["rajel", "راجل"] },
  { darija: "mra",          french: "la femme",               variants: ["mra", "مرا"] },
  { darija: "sa7bi",        french: "mon ami",                variants: ["sa7bi", "s7abi", "صاحبي"] },
  { darija: "nass",         french: "les gens",               variants: ["nass", "ناس"] },
  { darija: "bnadem",       french: "les gens",               variants: ["bnadem", "بنادم"] },
  { darija: "s7ab",         french: "les amis",               variants: ["s7ab", "صحاب"] },

  // — Common nouns ——————————————————————————————
  { darija: "darija",       french: "dialecte",               variants: ["darija", "دارجة"] },
  { darija: "blassa",       french: "la place",               variants: ["blassa", "بلاصة"] },
  { darija: "darna",        french: "notre maison",           variants: ["darna", "دارنا"] },
  { darija: "darek",        french: "ta maison",              variants: ["darek", "دارك"] },
  { darija: "machakil",     french: "les problèmes",          variants: ["machakil", "مشاكل"] },
  { darija: "moshkil",      french: "le problème",            variants: ["moshkil", "machkil", "مشكل"] },
  { darija: "khedma",       french: "le travail",             variants: ["khedma", "خدمة"] },
  { darija: "flous",        french: "l'argent",               variants: ["flos", "flous", "فلوس"] },
  { darija: "drahem",       french: "l'argent",               variants: ["drahem", "دراهم"] },
  { darija: "lmaghrib",     french: "le Maroc",               variants: ["lmaghrib", "لمغرب"] },
  { darija: "maghribi",     french: "marocain",               variants: ["maghribi", "مغربي"] },
  { darija: "maghariba",    french: "marocains",              variants: ["maghariba", "مغاربة"] },
  { darija: "bled",         french: "le pays",                variants: ["bled", "بلاد"] },
  { darija: "madina",       french: "la ville",               variants: ["madina", "mdina", "مدينة"] },
  { darija: "denia",        french: "la vie",                 variants: ["denia", "دنيا"] },
  { darija: "7yati",        french: "ma vie",                 variants: ["7yati", "hyati", "حياتي"] },
  { darija: "mowt",         french: "la mort",                variants: ["mowt", "moot", "موت"] },
  { darija: "sa3a",         french: "l'heure",                variants: ["sa3a", "ساعة"] },

  // — Time expressions ——————————————————————————
  { darija: "lyouma",       french: "aujourd'hui",            variants: ["lyouma", "اليومة"] },
  { darija: "lbar7",        french: "hier",                   variants: ["lbar7", "lbarh", "البارح"] },
  { darija: "ghedda",       french: "demain",                 variants: ["ghedda", "gheda", "غدا"] },
  { darija: "daba",         french: "maintenant",             variants: ["daba", "دابا"] },
  { darija: "ldouk",        french: "maintenant",             variants: ["ldouk", "هدوك"] },
  { darija: "sba7",         french: "le matin",               variants: ["sba7", "sbah", "صباح"] },
  { darija: "l3achiya",     french: "le soir",                variants: ["l3achiya", "لعشية"] },

  // — Question words ————————————————————————————
  { darija: "mli",          french: "quand",                  variants: ["mli", "ملي"] },
  { darija: "imta",         french: "quand",                  variants: ["imta", "إمتى"] },
  { darija: "chno",         french: "quoi",                   variants: ["chno", "chnou", "achnou", "شنو"] },
  { darija: "3lach",        french: "pourquoi",               variants: ["3lach", "3lash", "علاش"] },
  { darija: "chhal",        french: "combien",                variants: ["chhal", "sh7al", "شحال"] },
  { darija: "fin",          french: "où",                     variants: ["fin", "فين"] },
  { darija: "kidayer",      french: "comment vas-tu",         variants: ["kidayer", "kidayr", "كيداير"] },
  { darija: "kidayra",      french: "comment vas-tu",         variants: ["kidayra", "كدايرة"] },
  { darija: "labas",        french: "ça va",                  variants: ["labas", "لاباس"] },

  // — Adjectives ————————————————————————————————
  { darija: "zwin",         french: "beau",                   variants: ["zwin", "zwine", "زوين"] },
  { darija: "zwina",        french: "belle",                  variants: ["zwina", "زوينة"] },
  { darija: "khayb",        french: "mauvais",                variants: ["khayb", "خايب"] },
  { darija: "mezian",       french: "bon",                    variants: ["mezian", "mzyan", "مزيان"] },
  { darija: "meziana",      french: "bonne",                  variants: ["meziana", "مزيانة"] },
  { darija: "nadi",         french: "propre",                 variants: ["nadi", "ناضي"] },
  { darija: "moskhin",      french: "pauvre",                 variants: ["moskhin", "miskin", "مسكين"] },
  { darija: "sghir",        french: "petit",                  variants: ["sghir", "صغير"] },
  { darija: "kbir",         french: "grand",                  variants: ["kbir", "كبير"] },
  { darija: "jdid",         french: "neuf",                   variants: ["jdid", "جديد"] },
  { darija: "qdim",         french: "ancien",                 variants: ["qdim", "9dim", "قديم"] },
  { darija: "khdar",        french: "vert",                   variants: ["khdar", "خضر"] },
  { darija: "7mar",         french: "rouge",                  variants: ["7mar", "حمر"] },
  { darija: "khol",         french: "bleu",                   variants: ["khol", "كحل"] },
  { darija: "abyad",        french: "blanc",                  variants: ["abyad", "أبيض"] },
  { darija: "k7el",         french: "noir",                   variants: ["k7el", "k7al", "كحل"] },

  // — Adverbs & connectors ————————————————————————
  { darija: "bzaf",         french: "beaucoup",               variants: ["bzaf", "bzaaf", "بزاف"] },
  { darija: "chwiya",       french: "un peu",                 variants: ["chwiya", "chwia", "شوية"] },
  { darija: "mli7",         french: "bien",                   variants: ["mli7", "mlihh", "مليح"] },
  { darija: "7san",         french: "mieux",                  variants: ["7san", "hsan", "حسن"] },
  { darija: "7it",          french: "parce que",              variants: ["7it", "hit", "حيت"] },
  { darija: "bach",         french: "pour",                   variants: ["bach", "باش"] },
  { darija: "wlla",         french: "ou",                     variants: ["wlla", "wla", "ولا"] },
  { darija: "dima",         french: "toujours",               variants: ["dima", "ديما"] },
  { darija: "m3a",          french: "avec",                   variants: ["m3a", "معا"] },
  { darija: "bla",          french: "sans",                   variants: ["bla", "بلا"] },
  { darija: "dyal",         french: "de",                     variants: ["dyal", "ديال"] },
  { darija: "dyali",        french: "à moi",                  variants: ["dyali", "ديالي"] },
  { darija: "dyalek",       french: "à toi",                  variants: ["dyalek", "ديالك"] },

  // — Possession & existence (3and- family) ————————————
  { darija: "3andi",        french: "j'ai",                   variants: ["3andi", "عندي"] },
  { darija: "3andek",       french: "tu as",                  variants: ["3andek", "عندك"] },
  { darija: "3ando",        french: "il a",                   variants: ["3ando", "عندو"] },
  { darija: "3andha",       french: "elle a",                 variants: ["3andha", "عندها"] },
  { darija: "3andna",       french: "nous avons",             variants: ["3andna", "عندنا"] },

  // — Affirmation / negation ————————————————————
  { darija: "wakha",        french: "d'accord",               variants: ["wakha", "واخا"] },
  { darija: "iyeh",         french: "oui",                    variants: ["iyeh", "إيه"] },
  { darija: "la",           french: "non",                    variants: ["la", "لا"] },
  { darija: "machi",        french: "non",                    variants: ["machi", "ماشي"] },
  { darija: "sahi7",        french: "vrai",                   variants: ["sahi7", "s7i7", "صحيح"] },
  { darija: "ghalat",       french: "faux",                   variants: ["ghalat", "غالط"] },
  { darija: "tab3an",       french: "bien sûr",               variants: ["tab3an", "tbi3an", "طبعا"] },

  // — Modal / obligation ————————————————————————
  { darija: "khass",        french: "il faut",                variants: ["khass", "خاص"] },
  { darija: "lazem",        french: "il faut",                variants: ["lazem", "لازم"] },
  { darija: "lazmni",       french: "j'ai besoin",            variants: ["lazmni", "لازمني"] },
  { darija: "wajib",        french: "devoir",                 variants: ["wajib", "واجب"] },

  // — Moral / cultural terms ————————————————————
  { darija: "7chouma",      french: "honte",                  variants: ["7chouma", "hchouma", "حشومة"] },
  { darija: "7ram",         french: "interdit",               variants: ["7ram", "hram", "حرام"] },
  { darija: "3ib",          french: "honte",                  variants: ["3ib", "عيب"] },
  { darija: "z3ma",         french: "soi-disant",             variants: ["z3ma", "زعمة"] },

  // — Politics / news (Hespress context) ———————————————
  { darija: "hokouma",      french: "le gouvernement",        variants: ["hokouma", "7okouma", "حكومة"] },
  { darija: "malik",        french: "le roi",                 variants: ["malik", "ملك"] },
  { darija: "wazir",        french: "le ministre",            variants: ["wazir", "وزير"] },
  { darija: "wizarat",      french: "le ministère",           variants: ["wizarat", "وزارة"] },
  { darija: "intikhabat",   french: "les élections",          variants: ["intikhabat", "انتخابات"] },
  { darija: "mizaniya",     french: "le budget",              variants: ["mizaniya", "ميزانية"] },
  { darija: "i9tisad",      french: "l'économie",             variants: ["i9tisad", "igtisad", "اقتصاد"] },
  { darija: "batala",       french: "le chômage",             variants: ["batala", "بطالة"] },
  { darija: "t3lim",        french: "l'éducation",            variants: ["t3lim", "talim", "تعليم"] },
  { darija: "ssi7a",        french: "la santé",               variants: ["ssi7a", "siha", "صحة"] },
  { darija: "9anoun",       french: "la loi",                 variants: ["9anoun", "9anun", "قانون"] },
  { darija: "7ou9ou9",      french: "les droits",             variants: ["7ou9ou9", "huquq", "حقوق"] },
  { darija: "mowaten",      french: "le citoyen",             variants: ["mowaten", "مواطن"] },
  { darija: "mahkama",      french: "le tribunal",            variants: ["mahkama", "محكمة"] },
  { darija: "maktab",       french: "le bureau",              variants: ["maktab", "مكتب"] },
  { darija: "madrasa",      french: "l'école",                variants: ["madrasa", "مدرسة"] },
  { darija: "jami3a",       french: "l'université",           variants: ["jami3a", "jamia", "جامعة"] },
  { darija: "matar",        french: "l'aéroport",             variants: ["matar", "مطار"] },
  { darija: "watan",        french: "la patrie",              variants: ["watan", "وطن"] },
  { darija: "sulta",        french: "l'autorité",             variants: ["sulta", "سلطة"] },
];

// Build a fast lookup: lowercased variant → LexiconEntry (first match wins).
const VARIANT_MAP: Map<string, LexiconEntry> = (() => {
  const m = new Map<string, LexiconEntry>();
  for (const entry of LEXICON) {
    for (const v of entry.variants) {
      const key = v.toLowerCase();
      if (!m.has(key)) m.set(key, entry);
    }
  }
  return m;
})();

// Multi-word variants sorted by token-count descending so that
// "sbah lkhir" matches before "sbah" + "lkhir" individually.
const MULTI_WORD_VARIANTS: Array<{ entry: LexiconEntry; variant: string; tokens: string[] }> = (() => {
  const list: Array<{ entry: LexiconEntry; variant: string; tokens: string[] }> = [];
  for (const entry of LEXICON) {
    for (const v of entry.variants) {
      if (v.includes(" ")) {
        list.push({
          entry,
          variant: v,
          tokens: v.toLowerCase().split(/\s+/).filter(Boolean),
        });
      }
    }
  }
  return list.sort((a, b) => b.tokens.length - a.tokens.length);
})();

// ─── 2. LANGUAGE DETECTION ───────────────────────────────────────

const ARABIC_RE = /[\u0600-\u06FF\u0750-\u077F]/;
const ARABIZI_RE = /[37925]/; // digits used as letters in Latin Arabizi
const FRENCH_STOPWORDS = new Set([
  "le", "la", "les", "un", "une", "de", "du", "des", "et", "ou", "mais",
  "donc", "car", "que", "qui", "dans", "pour", "avec", "sans", "sur",
  "sous", "ce", "cette", "ces", "mon", "ma", "mes", "ton", "ta", "tes",
  "son", "sa", "ses", "nous", "vous", "ils", "elles", "est", "sont",
  "etre", "avoir", "pas", "ne", "plus", "tres", "bien", "tout", "tous",
]);

interface LanguageDetectionResult {
  language: DarijaLanguage;
  confidence: number;
  markers: string[];
}

function detectLanguage(text: string): LanguageDetectionResult {
  const markers: string[] = [];
  const tokens = text.toLowerCase().split(/[\s,.!?;:()«»"'-]+/).filter(Boolean);

  const hasArabic = ARABIC_RE.test(text);
  const arabicChars = (text.match(/[\u0600-\u06FF]/g) ?? []).length;
  const arabiziHits = tokens.filter((t) => ARABIZI_RE.test(t));
  const frenchHits = tokens.filter((t) => FRENCH_STOPWORDS.has(t));
  const darijaLexHits = tokens.filter((t) => VARIANT_MAP.has(t));

  let darijaScore = 0;
  if (hasArabic) { darijaScore += 2; markers.push("script arabe"); }
  if (arabiziHits.length > 0) { darijaScore += 1; markers.push(`arabizi (${arabiziHits.length})`); }
  if (darijaLexHits.length > 0) { darijaScore += 2; markers.push(`lexique darija (${darijaLexHits.length})`); }

  let frenchScore = 0;
  if (frenchHits.length >= 2) { frenchScore += 2; markers.push(`mots français (${frenchHits.length})`); }
  else if (frenchHits.length === 1) { frenchScore += 1; markers.push("1 mot français"); }

  // Decide language + confidence
  let language: DarijaLanguage;
  let confidence: number;

  if (darijaScore >= 4 && frenchScore >= 2) {
    language = "mixed";
    confidence = 0.85;
  } else if (darijaScore >= 4) {
    // Disambiguate darija vs arabic: pure Arabic script without
    // any Darija lexicon hit leans toward MSA (arabic); else darija.
    if (darijaLexHits.length === 0 && hasArabic && arabicChars > 5 && frenchScore === 0) {
      language = "arabic";
      confidence = 0.6;
    } else {
      language = "darija";
      confidence = Math.min(0.95, 0.7 + darijaLexHits.length * 0.03);
    }
  } else if (frenchScore >= 2) {
    language = "french";
    confidence = 0.8;
  } else if (darijaScore >= 2) {
    language = "darija";
    confidence = 0.65;
  } else if (hasArabic) {
    language = "arabic";
    confidence = 0.5;
  } else {
    language = "french";
    confidence = 0.4;
  }

  return { language, confidence, markers };
}

// ─── 3. LEXICON-BASED TRANSLATION ────────────────────────────────

interface LexiconTranslation {
  translated: string;
  detectedWords: DetectedWord[];
  matchedTokenCount: number;
  totalTokenCount: number;
}

// Normalize a single token for lookup: lowercase + strip surrounding
// punctuation. Arabic chars are kept as-is (no case folding needed).
function normalizeToken(t: string): string {
  return t
    .toLowerCase()
    .replace(/^[^\p{L}\p{N}3789]+/u, "")
    .replace(/[^\p{L}\p{N}3789]+$/u, "");
}

function translateWithLexicon(text: string): LexiconTranslation {
  // Split the input into whitespace-separated tokens while keeping
  // the original separators so we can rebuild the string faithfully.
  const parts = text.split(/(\s+)/);
  const detected: DetectedWord[] = [];
  const seen = new Set<string>();
  let matchedTokens = 0;
  let totalTokens = 0;

  // First, pre-scan for multi-word variants so they win over singletons.
  // We collapse the whole string to a normalized-token array indexed by
  // token position, then mark ranges as consumed.
  const tokenPositions: Array<{ raw: string; norm: string; isToken: boolean }> = parts.map((p) => {
    if (/^\s+$/.test(p)) return { raw: p, norm: "", isToken: false };
    const n = normalizeToken(p);
    totalTokens += 1;
    return { raw: p, norm: n, isToken: true };
  });

  const consumed: boolean[] = new Array(tokenPositions.length).fill(false);
  const output: string[] = new Array(tokenPositions.length);

  // Pass A: multi-word variants, left-to-right, longest-first.
  for (let i = 0; i < tokenPositions.length; i++) {
    if (!tokenPositions[i].isToken || consumed[i]) continue;
    for (const mv of MULTI_WORD_VARIANTS) {
      if (mv.tokens.length === 0) continue;
      // Check if tokens[i..i+mv.tokens.length-1] (ignoring whitespace
      // positions) match mv.tokens.
      const candidateIdxs: number[] = [];
      let k = i;
      for (const want of mv.tokens) {
        // Skip whitespace positions
        while (k < tokenPositions.length && !tokenPositions[k].isToken) k++;
        if (k >= tokenPositions.length) break;
        if (tokenPositions[k].norm !== want) break;
        candidateIdxs.push(k);
        k++;
      }
      if (candidateIdxs.length === mv.tokens.length) {
        // Only the FIRST matched token emits the French translation;
        // the remaining tokens collapse to an empty string so the
        // multi-word phrase renders once (not N times).
        for (let j = 0; j < candidateIdxs.length; j++) {
          const idx = candidateIdxs[j];
          consumed[idx] = true;
          output[idx] = j === 0 ? mv.entry.french : "";
        }
        matchedTokens += candidateIdxs.length;
        if (!seen.has(mv.entry.darija)) {
          seen.add(mv.entry.darija);
          detected.push({ darija: mv.entry.darija, french: mv.entry.french });
        }
        break;
      }
    }
  }

  // Pass B: single-token variants.
  for (let i = 0; i < tokenPositions.length; i++) {
    if (!tokenPositions[i].isToken || consumed[i]) continue;
    const norm = tokenPositions[i].norm;
    if (!norm) {
      output[i] = tokenPositions[i].raw;
      continue;
    }
    const entry = VARIANT_MAP.get(norm);
    if (entry) {
      output[i] = entry.french;
      consumed[i] = true;
      matchedTokens += 1;
      if (!seen.has(entry.darija)) {
        seen.add(entry.darija);
        detected.push({ darija: entry.darija, french: entry.french });
      }
    } else {
      output[i] = tokenPositions[i].raw;
    }
  }

  // Rebuild the string. Output array already preserves whitespace
  // positions (we never touched them — they have isToken=false and
  // output[i] is undefined for those). Fill undefined with raw.
  // Collapse any double-spaces left by multi-word variants that
  // collapsed their non-first tokens to "".
  const rebuilt = tokenPositions
    .map((p, i) => (output[i] !== undefined ? output[i] : p.raw))
    .join("")
    .replace(/\s{2,}/g, " ");

  return {
    translated: rebuilt.trim(),
    detectedWords: detected,
    matchedTokenCount: matchedTokens,
    totalTokenCount: totalTokens,
  };
}

// ─── 4. LLM POLISH (GLM-4 via ZAI, optional) ─────────────────────
//
//  Lazily imported so the route still works on environments without
//  ZAI_API_KEY configured. If the import fails or the call errors,
//  we silently fall back to the lexicon translation.

async function polishWithLLM(
  original: string,
  language: DarijaLanguage,
  lexiconTranslation: string,
  detectedWords: DetectedWord[],
): Promise<string | null> {
  if (!process.env.ZAI_API_KEY) return null;

  let zai: any;
  try {
    // Dynamic import keeps the route resilient when the SDK isn't
    // configured in the deployment env.
    const mod = await import("@/lib/zai-wrapper");
    zai = await mod.createZAI();
  } catch (err) {
    logError("darija-translate", `ZAI init failed: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }

  const detectedBlock = detectedWords.length > 0
    ? detectedWords.map((w) => `${w.darija} = ${w.french}`).join("\n")
    : "(aucun mot darija reconnu par le lexique)";

  const systemPrompt =
    "Tu es un traducteur expert en darija marocain (arabe dialectal + mélanges avec le français). " +
    "Tu traduis vers un français professionnel, clair et naturel, adapté à un usage professionnel (analyse réputationnelle). " +
    "Tu réponds UNIQUEMENT avec un JSON valide, aucun texte autour, aucun markdown.";

  const userPrompt = `Traduis le texte suivant vers un français professionnel. Conserve le sens, le ton et le niveau de politesse. Ne traduis pas littéralement les noms propres, les marques ou les lieux — adapte-les.

LANGUE DÉTECTÉE: ${language}
TEXTE ORIGINAL:
${original}

LEXIQUE DARIJA DÉTECTÉ (pour référence):
${detectedBlock}

Traduction lexique (baseline, à améliorer):
${lexiconTranslation || "(vide)"}

Réponds UNIQUEMENT avec un JSON de la forme:
{"translated": "traduction en français professionnel"}`;

  try {
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1200,
      thinking: { type: "disabled" as const },
    });

    const raw = (completion?.choices?.[0]?.message?.content as string | undefined)?.trim();
    if (!raw) return null;

    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned) as { translated?: unknown };
    if (typeof parsed.translated === "string" && parsed.translated.trim().length > 0) {
      return parsed.translated.trim();
    }
    return null;
  } catch (err) {
    logError("darija-translate", `LLM polish failed: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}

// ─── 5. POST HANDLER ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 5.1 AUTH — any logged-in user.
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 5.2 BODY VALIDATION
  let text = "";
  try {
    const body = await req.json();
    text = typeof body?.text === "string" ? body.text : "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return NextResponse.json({ error: "Le texte est requis" }, { status: 400 });
  }
  if (trimmed.length > 5000) {
    return NextResponse.json(
      { error: "Texte trop long (max 5000 caractères)" },
      { status: 400 },
    );
  }

  try {
    // 5.3 STAGE 1 — language detection + lexicon translation.
    const detection = detectLanguage(trimmed);
    const lex = translateWithLexicon(trimmed);

    // Confidence baseline derived from matched-token density, capped
    // by the language-detector's confidence ceiling.
    const tokenDensity = lex.totalTokenCount > 0
      ? lex.matchedTokenCount / lex.totalTokenCount
      : 0;
    // Lexicon confidence = language confidence weighted by how many
    // tokens we could actually translate (0.4 floor — we still return
    // a translation even if no Darija word was recognised).
    const lexiconConfidence = Math.max(
      0.4,
      Math.min(
        detection.confidence,
        0.4 + tokenDensity * 0.55,
      ),
    );

    let translated = lex.translated;
    let confidence = lexiconConfidence;
    let enhancedByLLM = false;

    // 5.4 STAGE 2 — optional GLM-4 polish.
    const polished = await polishWithLLM(
      trimmed,
      detection.language,
      lex.translated,
      lex.detectedWords,
    );
    if (polished) {
      translated = polished;
      confidence = 0.9;
      enhancedByLLM = true;
    }

    logInfo("darija-translate", `lang=${detection.language} conf=${confidence.toFixed(2)} llm=${enhancedByLLM} words=${lex.detectedWords.length} len=${trimmed.length}`);

    const response: DarijaTranslateResponse = {
      original: trimmed,
      translated,
      language: detection.language,
      confidence: Math.round(confidence * 100) / 100,
      detectedWords: lex.detectedWords,
      enhancedByLLM,
    };

    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logError("darija-translate", `[/api/console/darija-translate] error: ${message}`);
    return NextResponse.json(
      { error: "La traduction a échoué", detail: message },
      { status: 500 },
    );
  }
}
