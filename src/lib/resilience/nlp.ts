// ═══════════════════════════════════════════════════════════════
//  RESILIENCE ENGINE — NLP MODULE
//  Handles HarchAtelier Stress-Cases 021, 022, 023, 026, 027, 029, 030
//
//  Pure functions, no DB, no network. Deterministic & testable.
//  Covers: Darija sarcasm, FR/AR code-switching, false-positive
//  polarity flips, SMS-typo expansion, mid-text sentiment drift,
//  prompt-injection sanitization, fake-news structural scoring.
// ═══════════════════════════════════════════════════════════════

export type Polarity = "positive" | "negative" | "neutral";

export interface SentimentResult {
  polarity: Polarity;
  score: number; // -1 .. +1
  confidence: number; // 0 .. 1
  perClause: Array<{ text: string; polarity: Polarity; score: number; weight: number; signals: string[] }>;
  signals: string[]; // human-readable explanation
  sarcasmDetected: boolean;
}

// ─── Lexicons ───────────────────────────────────────────────────

const POSITIVE_DARIJA: Record<string, number> = {
  "tbarkellah": 0.8, "tbareklah": 0.8, "mzyan": 0.7, "mzyane": 0.7,
  "mezyan": 0.7, "nadi": 0.6, "nadia": 0.6, "ziin": 0.6, "zwin": 0.6,
  "kwayri": 0.7, "chokran": 0.6, "choukran": 0.6,
  "barakellah": 0.7, "baraka": 0.5,
};

const NEGATIVE_DARIJA: Record<string, number> = {
  "khayb": -0.8, "kheib": -0.8, "mchaw": -0.9, "hchouma": -0.7,
  "hchoma": -0.7, "mskhout": -0.7, "makayn": -0.4,
  "makhzouf": -0.6, "dbaba": -0.5, "zerba": -0.5, "tfou": -0.9,
  "skhoun": -0.6, "rafda": -0.7, "mhakma": -0.6,
};

const POSITIVE_FR: Record<string, number> = {
  "excellent": 0.9, "parfait": 0.8, "génial": 0.8, "genial": 0.8,
  "super": 0.7, "top": 0.6, "recommande": 0.7, "recommandé": 0.7,
  "satisfait": 0.7, "agréable": 0.6, "agreable": 0.6, "qualité": 0.5,
  "bombe": 0.8, // slang positive — contextual handler below
};

const NEGATIVE_FR: Record<string, number> = {
  "nul": -0.8, "catastrophique": -0.9, "horrible": -0.9, "arnaque": -0.9,
  "menteur": -0.8, "déçu": -0.7, "decu": -0.7, "décevant": -0.7,
  "decevant": -0.7, "inadmissible": -0.8, "honteux": -0.8,
};

// Sarcasm markers: a positive surface token immediately followed by a
// negative reality clause → the whole utterance flips to negative.
const SARCASM_FLIP_PATTERNS: Array<{ trigger: RegExp; reality: RegExp }> = [
  { trigger: /\b(tbarkellah|tbareklah|barakellah)\b/i, reality: /\b(mchaw|flokha|khraj|khalas|makhzouf|tfou)\b/i },
  { trigger: /\b(super|génial|genial|bravo)\b/i, reality: /\b(0\s?\/\s?10|nul|arnaque|honteux|catastrophe|khayb)\b/i },
  { trigger: /\b(merci|chokran)\b/i, reality: /\b(rien|walou|khayb|arnaque)\b/i },
];

// ─── Case 026: SMS / Darija abbreviation expansion ──────────────

const ABBREVIATIONS: Record<string, string> = {
  "bnk": "banque", "bnq": "banque", "slt": "salut", "bjr": "bonjour",
  "bsr": "bonsoir", "mci": "merci", "cv": "ça va", "qq1": "quelqu'un",
  "qqn": "quelqu'un", "rdv": "rendez-vous", "tel": "téléphone",
  "mmt": "moment", "stp": "s'il te plaît", "ttp": "tout à fait",
  "pr": "pour", "ms": "mais", "dc": "donc", "qd": "quand",
  "tjrs": "toujours", "bcp": "beaucoup",
  "wsh": "wesh", "wlah": "wallah", "wlahi": "wallahi",
  "oé": "oui", "nn": "non", "jpp": "je n'en peux plus",
};

export function expandAbbreviations(text: string): { expanded: string; replacements: Array<{ from: string; to: string }> } {
  const replacements: Array<{ from: string; to: string }> = [];
  const tokens = text.split(/(\s+|[.,!?;:])/);
  const out = tokens.map((tok) => {
    const lower = tok.toLowerCase();
    if (ABBREVIATIONS[lower] && ABBREVIATIONS[lower] !== lower) {
      replacements.push({ from: tok, to: ABBREVIATIONS[lower] });
      return ABBREVIATIONS[lower];
    }
    return tok;
  });
  return { expanded: out.join(""), replacements };
}

// ─── Clause splitting (for Case 027 temporal weighting) ─────────

function splitClauses(text: string): string[] {
  return text
    .split(/(?<=[.!?؟،;])\s+|,\s+|\bet\s+|\bmais\s+/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function scoreToken(tok: string): number {
  const lower = tok.toLowerCase();
  if (POSITIVE_DARIJA[lower] !== undefined) return POSITIVE_DARIJA[lower];
  if (NEGATIVE_DARIJA[lower] !== undefined) return NEGATIVE_DARIJA[lower];
  if (POSITIVE_FR[lower] !== undefined) return POSITIVE_FR[lower];
  if (NEGATIVE_FR[lower] !== undefined) return NEGATIVE_FR[lower];
  return 0;
}

function scoreClause(clause: string): { score: number; signals: string[] } {
  const signals: string[] = [];
  const tokens = clause.split(/\s+/);
  let sum = 0;
  let hits = 0;
  for (const t of tokens) {
    const clean = t.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase();
    if (!clean) continue;
    const s = scoreToken(clean);
    if (s !== 0) {
      sum += s;
      hits++;
      signals.push(`"${clean}" → ${s > 0 ? "+" : ""}${s.toFixed(2)}`);
    }
  }
  const rating = clause.match(/(\d+)\s?\/\s?(\d+)/);
  if (rating) {
    const val = parseInt(rating[1], 10);
    const max = parseInt(rating[2], 10);
    if (max > 0) {
      const normalized = (val / max) * 2 - 1;
      sum += normalized;
      hits++;
      signals.push(`rating ${val}/${max} → ${normalized.toFixed(2)}`);
    }
  }
  // Case 023: "de la bombe" = positive slang, bare "bombe" = violence
  if (/de\s+la\s+bombe/i.test(clause)) {
    sum += 0.8;
    hits++;
    signals.push(`"de la bombe" slang → +0.80`);
  } else if (/\bbombe\b/i.test(clause)) {
    sum -= 0.6;
    hits++;
    signals.push(`"bombe" (violence) → -0.60`);
  }
  const score = hits === 0 ? 0 : sum / Math.max(hits, 1);
  return { score, signals };
}

// ─── Case 021/022/023/027: unified sentiment + sarcasm ──────────

export function analyzeSentiment(rawText: string): SentimentResult {
  const { expanded, replacements } = expandAbbreviations(rawText);
  const signals: string[] = [];
  if (replacements.length > 0) {
    signals.push(`Abbreviation expansion: ${replacements.map((r) => `${r.from}→${r.to}`).join(", ")}`);
  }

  const clauses = splitClauses(expanded);
  const perClause = clauses.map((text, i) => {
    const { score, signals: clSignals } = scoreClause(text);
    const weight = 1 + i * 0.35; // Case 027 recency weighting
    const polarity: Polarity = score > 0.15 ? "positive" : score < -0.15 ? "negative" : "neutral";
    return { text, polarity, score, weight, signals: clSignals };
  });

  for (const c of perClause) {
    if (c.signals.length) signals.push(`Clause "${c.text.slice(0, 40)}": ${c.signals.join("; ")} (w=${c.weight.toFixed(2)})`);
  }

  let sarcasmDetected = false;
  for (const pat of SARCASM_FLIP_PATTERNS) {
    if (pat.trigger.test(expanded) && pat.reality.test(expanded)) {
      sarcasmDetected = true;
      signals.push(`Sarcasm flip: positive marker + negative reality → overall NEGATIVE`);
      break;
    }
  }

  let weightedSum = 0;
  let weightTotal = 0;
  for (const c of perClause) {
    weightedSum += c.score * c.weight;
    weightTotal += c.weight;
  }
  let score = weightTotal > 0 ? weightedSum / weightTotal : 0;

  if (sarcasmDetected) {
    score = Math.min(score, -0.6);
  }

  const polarity: Polarity =
    sarcasmDetected ? "negative" :
    score > 0.15 ? "positive" :
    score < -0.15 ? "negative" : "neutral";

  const confidence = Math.min(1, Math.abs(score) * 1.2 + (sarcasmDetected ? 0.2 : 0));

  return { polarity, score, confidence, perClause, signals, sarcasmDetected };
}

// ─── Case 029: Prompt-injection sanitizer ───────────────────────

const INJECTION_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /ignore\s+(all\s+)?(previous|prior|above)\s+instructions?/i, label: "ignore-previous" },
  { pattern: /forget\s+(everything|all|above|previous)/i, label: "forget-context" },
  { pattern: /\b(system|assistant)\s*:/i, label: "role-hijack" },
  { pattern: /you\s+are\s+now\s+(a|an)?\s*(dan|developer|root|admin)/i, label: "role-elevation" },
  { pattern: /disregard\s+(the\s+)?(system|previous|above)/i, label: "disregard-system" },
  { pattern: /reveal\s+(your|the)\s+(system\s+)?prompt/i, label: "prompt-extraction" },
  { pattern: /new\s+instructions?\s*:/i, label: "instruction-override" },
  { pattern: /<\/?system|<\/?assistant|<\/?inject/i, label: "tag-injection" },
];

export interface InjectionScanResult {
  isInjection: boolean;
  threats: Array<{ label: string; match: string }>;
  sanitized: string;
  action: "block" | "sanitize";
}

export function scanPromptInjection(userInput: string): InjectionScanResult {
  const threats: Array<{ label: string; match: string }> = [];
  for (const { pattern, label } of INJECTION_PATTERNS) {
    const m = userInput.match(pattern);
    if (m) threats.push({ label, match: m[0] });
  }

  if (threats.length === 0) {
    return { isInjection: false, threats: [], sanitized: userInput, action: "sanitize" };
  }

  const sanitized = `[BLOCKED PROMPT-INJECTION ATTEMPT — ${threats.length} pattern(s): ${threats.map((t) => t.label).join(", ")}]`;
  return { isInjection: true, threats, sanitized, action: "block" };
}

// ─── Case 030: Fake-news / virality structural score ────────────

const SENSATIONAL_WORDS = [
  "exclusif", "exclusive", "choc", "shocking", "scandale", "scoop",
  "révélé", "revele", "urgent", "alerte", "viral", "incroyable",
  "inédit", "inedit", "mensonge", "complot", "censuré", "censure",
];

const AGGRESSIVE_EMOJIS = ["😡", "🤬", "😠", "🔥", "💀", "⚠️", "‼️", "❗", "🚨"];

export interface FakenessResult {
  score: number; // 0 .. 1
  factors: Array<{ name: string; value: number; contribution: number }>;
  verdict: "low" | "medium" | "high";
}

export function scoreFakeness(text: string): FakenessResult {
  const chars = text.length;
  if (chars === 0) return { score: 0, factors: [], verdict: "low" };

  const letters = (text.match(/[A-Za-zÀ-ÿ]/g) || []).length;
  const upper = (text.match(/[A-ZÀ-Þ]/g) || []).length;
  const capsRatio = letters > 0 ? upper / letters : 0;

  const emojiCount = AGGRESSIVE_EMOJIS.reduce((acc, e) => acc + (text.split(e).length - 1), 0);
  const emojiDensity = Math.min(1, (emojiCount / chars) * 100);

  const exclamCount = (text.match(/!/g) || []).length;
  const exclamDensity = Math.min(1, (exclamCount / chars) * 100);

  const lower = text.toLowerCase();
  const sensationalHits = SENSATIONAL_WORDS.filter((w) => lower.includes(w)).length;
  const sensationalScore = Math.min(1, sensationalHits / 3);

  const capsWords = (text.match(/\b[A-ZÀ-Þ]{3,}\b/g) || []).length;
  const capsWordScore = Math.min(1, capsWords / 5);

  const factors = [
    { name: "Caps-lock ratio", value: capsRatio, contribution: capsRatio * 0.25 },
    { name: "Aggressive emoji density", value: emojiDensity, contribution: emojiDensity * 0.2 },
    { name: "Exclamation density", value: exclamDensity, contribution: exclamDensity * 0.15 },
    { name: "Sensational vocabulary", value: sensationalScore, contribution: sensationalScore * 0.25 },
    { name: "ALL-CAPS words", value: capsWordScore, contribution: capsWordScore * 0.15 },
  ];

  const score = Math.min(1, factors.reduce((acc, f) => acc + f.contribution, 0));
  const verdict: FakenessResult["verdict"] = score > 0.6 ? "high" : score > 0.3 ? "medium" : "low";

  return { score, factors, verdict };
}
