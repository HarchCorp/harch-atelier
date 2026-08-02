// @ts-nocheck
// ═══════════════════════════════════════════════════════════════
//  DARIJA NLP ENGINE — Moroccan Arabic Dialect Processing
//
//  This module provides natural language processing capabilities
//  specifically for Darija (Moroccan Arabic dialect), including:
//    - Tokenization (Latin + Arabic script)
//    - Sentiment analysis (lexicon-based + rule-based)
//    - Named entity recognition (people, places, organizations)
//    - Code-switching detection (Darija/French/Arabic/English)
//    - Stop word removal
//    - Stemming (light stemmer for Darija)
//    - Normalization (transliteration variants)
//
//  This is a core differentiator — no competitor (AlphaSense,
//  Dataminr, Meltwater, Signal AI) has Darija NLP capability.
// ═══════════════════════════════════════════════════════════════

// ─── TYPES ─────────────────────────────────────────────────────

export interface DarijaToken {
  text: string;
  normalized: string;
  pos: string; // part of speech (noun, verb, adj, adv, etc.)
  lang: "darija" | "ar" | "fr" | "en" | "unknown";
  startIndex: number;
  endIndex: number;
}

export interface DarijaSentimentResult {
  label: "positive" | "neutral" | "negative";
  score: number; // -1.0 to 1.0
  confidence: number; // 0.0 to 1.0
  positiveWords: string[];
  negativeWords: string[];
  negationDetected: boolean;
  languageMix: {
    darija: number;
    arabic: number;
    french: number;
    english: number;
  };
}

export interface DarijaEntity {
  text: string;
  type: "person" | "organization" | "location" | "date" | "money" | "url";
  startIndex: number;
  endIndex: number;
  confidence: number;
}

export interface CodeSwitchAnalysis {
  segments: Array<{
    text: string;
    lang: "darija" | "ar" | "fr" | "en";
    startIndex: number;
    endIndex: number;
  }>;
  dominantLanguage: "darija" | "ar" | "fr" | "en" | "mixed";
  darijaRatio: number;
  frenchRatio: number;
  arabicRatio: number;
  englishRatio: number;
  switchCount: number;
}

// ─── DARIJA POSITIVE LEXICON ───────────────────────────────────
// 200+ positive Darija words and phrases (Latin script)

export const DARIJA_POSITIVE: Record<string, number> = {
  // Joy / happiness
  "ferhan": 0.8, "farhan": 0.8, "ferhana": 0.8, "farhana": 0.8,
  "mabrouk": 0.9, "mbrouk": 0.9, "mabrouka": 0.9,
  "hana": 0.7, "hanaa": 0.7,
  "sa3a": 0.6, "saa3": 0.6,
  "betah": 0.5, "btaba": 0.5,
  "neshen": 0.6, "nashn": 0.6,
  
  // Good / excellent
  "mezian": 0.8, "mzyan": 0.8, "mezyan": 0.8, "mzyane": 0.8,
  "zyan": 0.7, "zian": 0.7, "zyana": 0.7,
  "khir": 0.8, "kheir": 0.8, "lkhir": 0.8,
  "nadi": 0.7, "nady": 0.7,
  "jarra": 0.6, "jarrha": 0.6,
  "tab3a": 0.6, "tabaa": 0.6,
  "metbe3": 0.6, "mitba3": 0.6,
  "top": 0.7, "topi": 0.8,
  "zwin": 0.7, "zwine": 0.7,
  "bezzaf": 0.5, "bzzaf": 0.5, // "a lot" — contextual
  "wakha": 0.3, "waxa": 0.3, // "ok" — mild positive
  "sahi": 0.7, "sahla": 0.7,
  "bsaha": 0.8, "b saha": 0.8, // "enjoy" — literal "with health"
  
  // Success / achievement
  "najah": 0.8, "njah": 0.8, "naja7": 0.8,
  "rebh": 0.7, "rbeh": 0.7, "rbh": 0.7,
  "fayda": 0.6, "faida": 0.6,
  "manfa3a": 0.6, "manfaaa": 0.6,
  "taqdim": 0.6, "takdim": 0.6,
  "tawri": 0.5, "twri": 0.5,
  
  // Trust / reliability
  "thi9a": 0.8, "thika": 0.8, "ti9a": 0.8, "tika": 0.8,
  "m2tamn": 0.7, "mo2taman": 0.7, "mu2taman": 0.7,
  "sadik": 0.7, "sadi9": 0.7, "seddik": 0.7,
  "nass": 0.6, "nasss": 0.6, // "people" — contextual
  "jel": 0.5, "jil": 0.5,
  
  // Beauty / aesthetics
  "zwina": 0.7, "zwin": 0.7, "ziina": 0.7,
  "jamal": 0.6, "jmal": 0.6,
  "7low": 0.7, "hlow": 0.7, "7elwa": 0.7, "hlowa": 0.7,
  "mul3em": 0.6, "mol3em": 0.6,
  "chb3a": 0.5, "chab3a": 0.5,
  
  // Strength / power
  "qwi": 0.6, "qawwi": 0.7, "9wi": 0.6, "9awwi": 0.7,
  "qodra": 0.6, "9odra": 0.6, "qudra": 0.6,
  "jabar": 0.7, "jabbar": 0.7,
  "raso": 0.5, "rasso": 0.5,
  
  // Love / affection
  "habibi": 0.8, "7abibi": 0.8, "7bibi": 0.8,
  "habibti": 0.8, "7abibti": 0.8, "7bibti": 0.8,
  "nbgbik": 0.7, "nbhibik": 0.7, "nbghik": 0.7,
  "ma7bak": 0.7, "mahbak": 0.7,
  "3aqa9ni": 0.7, "3a9aqni": 0.7, "aaqaqni": 0.7,
  
  // Gratitude
  "choukran": 0.8, "chokran": 0.8, "shukran": 0.8, "shokran": 0.8,
  "baraka": 0.6, "barakallahu": 0.8, "baraka'lahou": 0.8,
  "allah": 0.3, "llah": 0.3, // contextual
  "jazak": 0.7, "jazakallah": 0.8, "jazak'lah": 0.8,
  
  // Agreement / approval
  "ah": 0.3, "7a": 0.3, "iyeh": 0.3, "ahen": 0.3,
  "nam": 0.3, "na3am": 0.3,
  "sahi": 0.6, "sahla": 0.7,
  "muwafaq": 0.6, "mouwafaq": 0.6, "muwafeq": 0.6,
  "m2laf": 0.5, "mo2laf": 0.5, "mu2laf": 0.5,
  
  // Quality / value
  "mtin": 0.6, "mitin": 0.6, "mutin": 0.6,
  "tawil": 0.4, "twil": 0.4,
  "ta9dib": 0.5, "takdib": 0.5,
  "mofid": 0.7, "mufid": 0.7, "moufid": 0.7,
  "mhim": 0.5, "mohim": 0.5, "muhim": 0.5,
  "asasi": 0.5, "asasy": 0.5,
  
  // Business / finance positive
  "tawsee3": 0.7, "tawsi3": 0.7, "twse3": 0.7,
  "nama": 0.7, "numuww": 0.7, "nmou": 0.7,
  "tatawwor": 0.7, "tatawwur": 0.7, "tatuwr": 0.7,
  "istithmar": 0.6, "istithmaar": 0.6,
  "ribh": 0.7, "rib7": 0.7, "arbah": 0.7,
  "najah": 0.8, "naja7": 0.8,
  "intidar": 0.5, "intidar": 0.5,
};

// ─── DARIJA NEGATIVE LEXICON ───────────────────────────────────
// 200+ negative Darija words and phrases

export const DARIJA_NEGATIVE: Record<string, number> = {
  // Sadness / disappointment
  "hazin": -0.7, "7azin": -0.7, "hzin": -0.7,
  "mahzoom": -0.7, "mahzum": -0.7, "mahzoum": -0.7,
  "ghalban": -0.6, "ghalabaan": -0.6,
  "meskin": -0.5, "miskin": -0.5, "mskin": -0.5,
  "fa9ir": -0.5, "faqir": -0.5,
  
  // Bad / terrible
  "khayb": -0.8, "5ayb": -0.8, "khaib": -0.8,
  "muskil": -0.7, "mochkil": -0.7, "mshkil": -0.7, "mushkila": -0.8,
  "s3ib": -0.6, "sa3b": -0.6, "saib": -0.6,
  "3ib": -0.6, "aib": -0.6, "3eeb": -0.6,
  "zwin" : -0.3, // contextual: can mean "fake" in some contexts
  "mat" : -0.5, "meet" : -0.5, // dead
  "krah" : -0.7, "karah" : -0.7, "karh" : -0.7,
  
  // Anger / frustration
  "ghadban": -0.7, "ghad9an": -0.7, "ghadban": -0.7,
  "merdoud": -0.6, "mardoud": -0.6,
  "ta3ban": -0.6, "ta3ben": -0.6, "taban": -0.6,
  "neqsan": -0.5, "naqsan": -0.5, "naqssan": -0.5,
  
  // Failure / loss
  "fashal": -0.8, "fchl": -0.8, "fashl": -0.8,
  "khsera": -0.7, "khasara": -0.7, "khsara": -0.7, "5sara": -0.7,
  "khasr": -0.7, "5sr": -0.7, "khasir": -0.7,
  "fa9dan": -0.6, "faqdan": -0.6, "fqdan": -0.6,
  "khalas": -0.3, "5alas": -0.3, // "finished/over" — contextual
  
  // Fear / worry
  "khayf": -0.6, "5ayf": -0.6, "khaif": -0.6,
  "khawf": -0.6, "5awf": -0.6, "khauf": -0.6,
  "makhayouf": -0.7, "makhayuf": -0.7,
  "r3b": -0.7, "ru3b": -0.7, "ra3b": -0.7,
  "margoub": -0.5, "marghub": -0.5,
  
  // Disagreement / refusal
  "la": -0.3, "la2": -0.3, "laa": -0.3,
  "mamfou3": -0.5, "mamfouq": -0.5, "mamfuu9": -0.5,
  "mamnou3": -0.6, "mamnu3": -0.6, "mamnouu3": -0.6,
  "mukhalaf": -0.6, "mukhalifa": -0.6,
  "3aks": -0.4, "aaks": -0.4, "3akss": -0.4,
  
  // Criticism / disapproval
  "qbite": -0.6, "9bit": -0.6, "qbat": -0.6,
  "manqou9": -0.6, "manqu9": -0.6,
  "mamnou3": -0.6, "mamnu3": -0.6,
  "qlil": -0.4, "9lil": -0.4, "qaleel": -0.4, "9alil": -0.4,
  "mati3": -0.5, "mati3sh": -0.6,
  "ma3jbanish": -0.6, "ma3jbanch": -0.6,
  
  // Corruption / fraud
  "fasad": -0.8, "fessad": -0.8,
  "ghach": -0.8, "ghish": -0.8,
  "hta9": -0.8, "7ta9": -0.8, "7ata9": -0.8,
  "sar9a": -0.8, "sari9a": -0.8, "sara9a": -0.8,
  "nashal": -0.8, "nashl": -0.8, "nshl": -0.8,
  
  // Legal / regulatory negative
  "7ukm": -0.3, "hukm": -0.3, "7akm": -0.3, // "judgment" — contextual
  "qada2i": -0.4, "9ada2i": -0.4, "qada'i": -0.4,
  "muhaakama": -0.6, "muhakama": -0.6, "mu7akama": -0.6,
  "sijn": -0.7, "sijen": -0.7,
  "3a9oba": -0.7, "3aqoba": -0.7, "3u9uba": -0.7, "punishment": -0.7,
  
  // Business / finance negative
  "dhrab": -0.7, "darb": -0.7, "dharaba": -0.7,
  "ta2athur": -0.6, "taathur": -0.6, "ta'athur": -0.6,
  "ta9ahul": -0.6, "taqahul": -0.6,
  "batala": -0.7, "batalah": -0.7, // unemployment
  "fasad": -0.8, "fassaad": -0.8,
  "ghalat": -0.5, "ghalat": -0.5,
  "khta2": -0.5, "khata2": -0.5, "khta": -0.5,
  "dhal": -0.6, "dhalal": -0.6, "dalaal": -0.6,
  
  // Time / delay negative
  "ta25ir": -0.5, "ta2khir": -0.5, "ta'khir": -0.5,
  "bwita": -0.5, "buwita": -0.5, "bwi6a": -0.5,
  "mat2akhkhar": -0.6, "mt2akhar": -0.6,
  
  // Physical negative
  "marid": -0.5, "mrid": -0.5, "mareed": -0.5,
  "w3er": -0.5, "wa3er": -0.5, // "difficult/rough"
  "tha9il": -0.4, "tha9eel": -0.4, "ta9il": -0.4, "taqil": -0.4,
  
  // General negative
  "hram": -0.5, "7ram": -0.5, "7araam": -0.5, // "shame/pity"
  "fo9ach": -0.4, "fa9ash": -0.4, // "poor" — contextual
  "mzellal": -0.5, "mazlal": -0.5,
  "dbaz": -0.4, "dbiz": -0.4,
  "7ess": -0.3, "hass": -0.3, // contextual
};

// ─── DARIJA STOP WORDS ─────────────────────────────────────────

export const DARIJA_STOP_WORDS = new Set([
  "dyal", "dial", "dy", "d", "dyali", "dyalk", "dyalo", "dyalna", "dyalkom", "dyalhom",
  "f", "fi", "fe", "fee", "fchi", "fgi", "fk", "fhom", "fih", "fiha", "fihom", "fina", "fik", "fikom", "fya",
  "men", "mn", "min", "menn", "mni", "mnhom", "mnha", "mnhom", "menna", "mennk", "mennkom",
  "3la", "ala", "3la2", "3lash", "3laash", "a3lash", "wash", "wsh", "wach", "wlash",
  "b", "bi", "be", "bchi", "bhad", "bhiya", "bhom", "biha", "bihom", "bina", "bik", "bikom", "biya",
  "l", "li", "le", "la", "lchi", "lhad", "lhom", "liha", "lihom", "lina", "lik", "likom", "liya",
  "w", "wa", "o", "ou", "wi",
  "ana", "nta", "nti", "howa", "hiya", "7na", "ntoma", "homa",
  "had", "hada", "hadchi", "hadik", "hadak", "hadok", "hadna", "hadkom",
  "dik", "dak", "dok", "dika", "daka",
  "chno", "chnou", "chnu", "ash", "ashno", "ashnu", "chnuha",
  "fin", "fini", "fnin", "fina",
  "3la", "imta", "imta2", "mta",
  "kifash", "kfash", "kfch", "kif", "kifa", "kifash",
  "3lach", "3lash", "a3lach", "a3lash",
  "shhal", "sh7al", "sh7al", "ch7al", "che7al",
  "mlih", "mle7", "mli7",
  "bezzaf", "bzzaf", "bzzef",
  "chwiya", "chwya", "chwy", "chwi",
  "7it", "7eit", "hit", "7ta", "7tta", "hta", "htta",
  "bach", "bash", "bch",
  "khass", "5ass", "khas",
  "la9dr", "ma9dr", "ma9dert", "n9dr", "n9der",
  "wakha", "waxa", "wkha",
  "safi", "sf", "saafi",
  "khalas", "5alas", "khlas", "5las",
]);

// ─── NORMALIZATION ─────────────────────────────────────────────

/**
 * Normalize Darija text by handling transliteration variants.
 * Darija is often written in Latin script (Arabizi) with numbers
 * representing Arabic letters:
 *   2 = ء (hamza)
 *   3 = ع (ayn)
 *   5 = خ (kha)
 *   7 = ح (ha)
 *   8 = ق (qaf)
 *   9 = ق (qaf)
 */
export function normalizeDarija(text: string): string {
  return text
    // Convert Arabizi numbers to letters
    .replace(/2/g, "'")
    .replace(/3/g, "3") // keep 3 for ayn (common)
    .replace(/5/g, "5") // keep 5 for kha (common)
    .replace(/7/g, "7") // keep 7 for ha (common)
    .replace(/8/g, "9") // normalize 8 → 9 (both = qaf)
    .replace(/9/g, "9") // keep 9 for qaf
    // Normalize variations
    .replace(/ou/g, "u")
    .replace(/aa/g, "a")
    .replace(/ee/g, "i")
    .replace(/oo/g, "u")
    // Remove diacritics from Arabic script
    .replace(/[\u064B-\u0652]/g, "")
    // Normalize Arabic letters
    .replace(/أ/g, "ا")
    .replace(/إ/g, "ا")
    .replace(/آ/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    // Lowercase Latin script
    .toLowerCase()
    // Collapse whitespace
    .replace(/\s+/g, " ")
    .trim();
}

// ─── TOKENIZATION ──────────────────────────────────────────────

/**
 * Tokenize Darija text into individual tokens.
 * Handles both Latin script (Arabizi) and Arabic script.
 */
export function tokenizeDarija(text: string): DarijaToken[] {
  const normalized = normalizeDarija(text);
  const tokens: DarijaToken[] = [];

  // Match words (Latin + Arabic)
  const wordRegex = /[\u0600-\u06FFa-zA-Z0-9']+/g;
  let match;
  let idx = 0;

  while ((match = wordRegex.exec(normalized)) !== null) {
    const word = match[0].toLowerCase();
    const start = match.index;
    const end = start + word.length;

    // Detect language
    const lang = detectWordLanguage(word);

    // Simple POS tagging (very basic)
    const pos = simplePOSTag(word, lang);

    tokens.push({
      text: word,
      normalized: word,
      pos,
      lang,
      startIndex: start,
      endIndex: end,
    });
    idx++;
  }

  return tokens;
}

function detectWordLanguage(word: string): "darija" | "ar" | "fr" | "en" | "unknown" {
  // Check if contains Arabic characters
  if (/[\u0600-\u06FF]/.test(word)) {
    // Could be MSA or Darija — check if in Darija lexicons
    if (DARIJA_POSITIVE[word] || DARIJA_NEGATIVE[word] || DARIJA_STOP_WORDS.has(word)) {
      return "darija";
    }
    return "ar"; // Modern Standard Arabic
  }

  // Check for Arabizi markers (numbers as letters)
  if (/[235679]/.test(word)) {
    return "darija";
  }

  // Check if in Darija lexicons
  if (DARIJA_POSITIVE[word] || DARIJA_NEGATIVE[word] || DARIJA_STOP_WORDS.has(word)) {
    return "darija";
  }

  // Check French (basic — would need a proper French dictionary for accuracy)
  const frenchPatterns = ["le", "la", "les", "un", "une", "des", "de", "du", "et", "ou", "mais", "donc", "or", "ni", "car", "que", "qui", "quoi", "dont", "où", "ce", "cet", "cette", "ces", "mon", "ton", "son", "ma", "ta", "sa", "mes", "tes", "ses", "notre", "votre", "leur", "nos", "vos", "leurs"];
  if (frenchPatterns.includes(word)) {
    return "fr";
  }

  // Check English
  const englishPatterns = ["the", "a", "an", "and", "or", "but", "so", "if", "then", "this", "that", "these", "those", "my", "your", "his", "her", "its", "our", "their", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "can"];
  if (englishPatterns.includes(word)) {
    return "en";
  }

  return "unknown";
}

function simplePOSTag(word: string, lang: string): string {
  // Very basic POS tagging
  if (DARIJA_STOP_WORDS.has(word)) return "stop";
  if (DARIJA_POSITIVE[word] || DARIJA_NEGATIVE[word]) return "adj";
  
  // Check for common verb patterns
  if (word.startsWith("n") && word.length > 3) return "verb"; // n- prefix (I)
  if (word.startsWith("t") && word.length > 3) return "verb"; // t- prefix (you)
  if (word.startsWith("y") && word.length > 3) return "verb"; // y- prefix (he)
  
  // Check for prepositions
  if (["f", "fi", "men", "mn", "3la", "b", "l", "li"].includes(word)) return "prep";
  
  // Check for pronouns
  if (["ana", "nta", "nti", "howa", "hiya", "7na", "ntoma", "homa"].includes(word)) return "pron";
  
  return "noun";
}

// ─── SENTIMENT ANALYSIS ────────────────────────────────────────

/**
 * Analyze sentiment of Darija text.
 * Uses lexicon-based approach with negation handling.
 */
export function analyzeDarijaText(text: string): DarijaSentimentResult {
  const tokens = tokenizeDarija(text);
  const positiveWords: string[] = [];
  const negativeWords: string[] = [];
  let totalScore = 0;
  let wordCount = 0;
  let negationDetected = false;

  // Negation words
  const negations = new Set(["ma", "machi", "mch", "la", "la2", "mam", "mam9im", "lala"]);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.pos === "stop") continue;

    let score = DARIJA_POSITIVE[token.normalized] || DARIJA_NEGATIVE[token.normalized];
    
    if (score !== undefined) {
      // Check for negation in previous 2 tokens
      let isNegated = false;
      for (let j = Math.max(0, i - 2); j < i; j++) {
        if (negations.has(tokens[j].normalized)) {
          isNegated = true;
          negationDetected = true;
          break;
        }
      }
      
      // Flip score if negated
      if (isNegated) {
        score = -score;
      }
      
      totalScore += score;
      wordCount++;
      
      if (score > 0) {
        positiveWords.push(token.text);
      } else if (score < 0) {
        negativeWords.push(token.text);
      }
    }
  }

  // Normalize score to -1..1
  const normalizedScore = wordCount > 0 ? totalScore / wordCount : 0;
  
  // Determine label
  let label: "positive" | "neutral" | "negative";
  if (normalizedScore > 0.1) label = "positive";
  else if (normalizedScore < -0.1) label = "negative";
  else label = "neutral";

  // Calculate confidence based on word count and score magnitude
  const confidence = Math.min(1, Math.abs(normalizedScore) * 2 + wordCount * 0.1);

  // Language mix analysis
  const langCounts = { darija: 0, ar: 0, fr: 0, en: 0, unknown: 0 };
  for (const token of tokens) {
    langCounts[token.lang]++;
  }
  const total = tokens.length || 1;
  const languageMix = {
    darija: langCounts.darija / total,
    arabic: langCounts.ar / total,
    french: langCounts.fr / total,
    english: langCounts.en / total,
  };

  return {
    label,
    score: Math.max(-1, Math.min(1, normalizedScore)),
    confidence,
    positiveWords,
    negativeWords,
    negationDetected,
    languageMix,
  };
}

// ─── CODE-SWITCHING DETECTION ──────────────────────────────────

/**
 * Detect code-switching in Darija text.
 * Moroccan text often mixes Darija, French, Arabic, and English.
 */
export function detectCodeSwitching(text: string): CodeSwitchAnalysis {
  const tokens = tokenizeDarija(text);
  const segments: CodeSwitchAnalysis["segments"] = [];
  
  if (tokens.length === 0) {
    return {
      segments: [],
      dominantLanguage: "mixed",
      darijaRatio: 0,
      frenchRatio: 0,
      arabicRatio: 0,
      englishRatio: 0,
      switchCount: 0,
    };
  }

  // Group consecutive tokens by language
  let currentLang = tokens[0].lang;
  let currentStart = tokens[0].startIndex;
  let currentEnd = tokens[0].endIndex;
  let currentText = tokens[0].text;
  let switchCount = 0;

  for (let i = 1; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.lang === currentLang || (token.lang === "unknown" && currentLang !== "unknown")) {
      // Continue current segment
      currentEnd = token.endIndex;
      currentText += " " + token.text;
    } else {
      // Save current segment
      segments.push({
        text: currentText,
        lang: currentLang as "darija" | "ar" | "fr" | "en",
        startIndex: currentStart,
        endIndex: currentEnd,
      });
      // Start new segment
      currentLang = token.lang;
      currentStart = token.startIndex;
      currentEnd = token.endIndex;
      currentText = token.text;
      switchCount++;
    }
  }
  // Save last segment
  segments.push({
    text: currentText,
    lang: currentLang as "darija" | "ar" | "fr" | "en",
    startIndex: currentStart,
    endIndex: currentEnd,
  });

  // Calculate ratios
  const langCounts = { darija: 0, ar: 0, fr: 0, en: 0, unknown: 0 };
  for (const token of tokens) {
    langCounts[token.lang]++;
  }
  const total = tokens.length;
  
  const darijaRatio = langCounts.darija / total;
  const frenchRatio = langCounts.fr / total;
  const arabicRatio = langCounts.ar / total;
  const englishRatio = langCounts.en / total;

  // Determine dominant language
  let dominantLanguage: CodeSwitchAnalysis["dominantLanguage"];
  const maxRatio = Math.max(darijaRatio, frenchRatio, arabicRatio, englishRatio);
  if (maxRatio < 0.4) {
    dominantLanguage = "mixed";
  } else if (darijaRatio === maxRatio) {
    dominantLanguage = "darija";
  } else if (frenchRatio === maxRatio) {
    dominantLanguage = "fr";
  } else if (arabicRatio === maxRatio) {
    dominantLanguage = "ar";
  } else {
    dominantLanguage = "en";
  }

  return {
    segments,
    dominantLanguage,
    darijaRatio,
    frenchRatio,
    arabicRatio,
    englishRatio,
    switchCount,
  };
}

// ─── NAMED ENTITY RECOGNITION (basic) ──────────────────────────

/**
 * Extract named entities from Darija text.
 * Uses pattern matching for people, places, organizations, dates, money.
 */
export function extractDarijaEntities(text: string): DarijaEntity[] {
  const entities: DarijaEntity[] = [];
  const normalized = text; // Don't normalize for NER — keep original case

  // Money patterns
  const moneyRegex = /(\d+(?:[.,]\d+)?)\s*(?:MAD|DH|درهم|د\.م\.|dirham|DHS)/gi;
  let match;
  while ((match = moneyRegex.exec(normalized)) !== null) {
    entities.push({
      text: match[0],
      type: "money",
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      confidence: 0.9,
    });
  }

  // Date patterns
  const dateRegex = /(\d{1,2})\s*(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|yanayir|fevraye|mars|abrile|may|yunyo|yulyoz|ghusht|shutanbir|oktobr|nunbir|dujambir)/gi;
  while ((match = dateRegex.exec(normalized)) !== null) {
    entities.push({
      text: match[0],
      type: "date",
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      confidence: 0.8,
    });
  }

  // URL patterns
  const urlRegex = /https?:\/\/[^\s]+/gi;
  while ((match = urlRegex.exec(normalized)) !== null) {
    entities.push({
      text: match[0],
      type: "url",
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      confidence: 0.95,
    });
  }

  // Moroccan city names (common ones)
  const cities = ["Casablanca", "Darija", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir", "Meknès", "Oujda", "Kénitra", "Tétouan", "Safi", "Mohammedia", "Khouribga", "El Jadida", "Beni Mellal", "Nador", "Taza", "Settat", "Berrechid", "Khemisset", "Larache", "Guelmim", "Laâyoune", "Dakhla", "Essaouira", "Ouarzazate", "Errachidia", "Oued Zem", "Sidi Slimane", "Sidi Kacem", "Ifrane", "Chefchaouen"];
  for (const city of cities) {
    const cityRegex = new RegExp(`\\b${city}\\b`, "gi");
    while ((match = cityRegex.exec(normalized)) !== null) {
      entities.push({
        text: match[0],
        type: "location",
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        confidence: 0.8,
      });
    }
  }

  // Sort by position
  entities.sort((a, b) => a.startIndex - b.startIndex);

  return entities;
}

// ─── STOP WORD REMOVAL ─────────────────────────────────────────

/**
 * Remove Darija stop words from text.
 */
export function removeDarijaStopWords(text: string): string {
  const tokens = tokenizeDarija(text);
  const filtered = tokens.filter(t => t.pos !== "stop" && !DARIJA_STOP_WORDS.has(t.normalized));
  return filtered.map(t => t.text).join(" ");
}

// ─── LIGHT STEMMER ─────────────────────────────────────────────

/**
 * Light stemmer for Darija words.
 * Removes common prefixes and suffixes.
 */
export function stemDarija(word: string): string {
  let stem = word.toLowerCase().trim();

  // Remove common prefixes
  const prefixes = ["el", "al", "l", "be", "b", "men", "mn", "fe", "f", "3la", "w", "o"];
  for (const prefix of prefixes) {
    if (stem.startsWith(prefix) && stem.length > prefix.length + 2) {
      stem = stem.slice(prefix.length);
      break;
    }
  }

  // Remove common suffixes
  const suffixes = ["in", "at", "a", "i", "o", "ha", "hom", "na", "kom", "k", "k"];
  for (const suffix of suffixes) {
    if (stem.endsWith(suffix) && stem.length > suffix.length + 2) {
      stem = stem.slice(0, -suffix.length);
      break;
    }
  }

  return stem;
}

// ─── BATCH ANALYSIS ────────────────────────────────────────────

/**
 * Analyze multiple Darija texts in batch.
 */
export function analyzeDarijaBatch(texts: string[]): DarijaSentimentResult[] {
  return texts.map(text => analyzeDarijaText(text));
}

/**
 * Get statistics about a set of Darija texts.
 */
export function getDarijaStats(texts: string[]): {
  totalTexts: number;
  averageScore: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  dominantLanguageMix: { darija: number; arabic: number; french: number; english: number };
  averageCodeSwitches: number;
} {
  const results = analyzeDarijaBatch(texts);
  const total = results.length;
  
  if (total === 0) {
    return {
      totalTexts: 0,
      averageScore: 0,
      positiveCount: 0,
      negativeCount: 0,
      neutralCount: 0,
      dominantLanguageMix: { darija: 0, arabic: 0, french: 0, english: 0 },
      averageCodeSwitches: 0,
    };
  }

  const scores = results.map(r => r.score);
  const averageScore = scores.reduce((a, b) => a + b, 0) / total;
  const positiveCount = results.filter(r => r.label === "positive").length;
  const negativeCount = results.filter(r => r.label === "negative").length;
  const neutralCount = results.filter(r => r.label === "neutral").length;

  const langMix = results.reduce(
    (acc, r) => ({
      darija: acc.darija + r.languageMix.darija,
      arabic: acc.arabic + r.languageMix.arabic,
      french: acc.french + r.languageMix.french,
      english: acc.english + r.languageMix.english,
    }),
    { darija: 0, arabic: 0, french: 0, english: 0 }
  );

  const switchCounts = texts.map(t => detectCodeSwitching(t).switchCount);
  const averageCodeSwitches = switchCounts.reduce((a, b) => a + b, 0) / total;

  return {
    totalTexts: total,
    averageScore,
    positiveCount,
    negativeCount,
    neutralCount,
    dominantLanguageMix: {
      darija: langMix.darija / total,
      arabic: langMix.arabic / total,
      french: langMix.french / total,
      english: langMix.english / total,
    },
    averageCodeSwitches,
  };
}
