// ═══════════════════════════════════════════════════════════════
//  RESILIENCE ENGINE — ENTITY MODULE
//  Handles HarchAtelier Stress-Cases 043, 044, 097
//
//  Pure functions. Covers: fuzzy name matching with transliteration
//  normalization (044), OFAC false-positive disambiguation via
//  context fields (043), CEO homonym resolution by tenure window (097).
// ═══════════════════════════════════════════════════════════════

// ─── Case 044: Jaro-Winkler fuzzy matcher ───────────────────────

function jaro(s1: string, s2: string): number {
  if (s1 === s2) return 1;
  const len1 = s1.length;
  const len2 = s2.length;
  if (len1 === 0 || len2 === 0) return 0;

  const matchDistance = Math.max(Math.floor(Math.max(len1, len2) / 2) - 1, 0);
  const s1Matches = new Array(len1).fill(false);
  const s2Matches = new Array(len2).fill(false);
  let matches = 0;

  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, len2);
    for (let j = start; j < end; j++) {
      if (s2Matches[j]) continue;
      if (s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }
  if (matches === 0) return 0;

  let transpositions = 0;
  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }
  transpositions /= 2;

  return (
    (matches / len1 + matches / len2 + (matches - transpositions) / matches) / 3
  );
}

function jaroWinkler(s1: string, s2: string): number {
  const j = jaro(s1, s2);
  // common prefix up to 4 chars
  let prefix = 0;
  const maxPrefix = Math.min(4, Math.min(s1.length, s2.length));
  for (let i = 0; i < maxPrefix; i++) {
    if (s1[i] === s2[i]) prefix++;
    else break;
  }
  return j + prefix * 0.1 * (1 - j);
}

// ─── Transliteration normalization (Arabic → Latin variants) ───

function normalizeName(name: string): string {
  let n = name.toLowerCase().trim();
  // Unified transliteration variants
  const replacements: Array<[RegExp, string]> = [
    [/\bmohammed\b/g, "mohamed"],
    [/\bmouhammed\b/g, "mohamed"],
    [/\bmohamad\b/g, "mohamed"],
    [/\bmuhammed\b/g, "mohamed"],
    [/\bmuhammad\b/g, "mohamed"],
    [/\bel[- ]/g, "al"],
    [/\bal[- ]/g, "al"],
    [/\babdell?ah\b/g, "abdellah"],
    [/\babdell?ah\b/g, "abdellah"],
    [/\bkhalfan\b/g, "khalfan"],
    [/\byou?ssef\b/g, "youssef"],
    [/\bidriss?i\b/g, "idrissi"],
    [/\bbenn?ani\b/g, "bennani"],
    [/\bben[- ]?ali\b/g, "benali"],
    [/\bou?ali\b/g, "ouali"],
    [/[\u0600-\u06FF]/g, ""], // strip Arabic glyphs (keep transliteration)
    [/[^\p{L}\p{N}\s]/gu, ""], // strip punctuation
    [/\s+/g, " "],
  ];
  for (const [re, rep] of replacements) n = n.replace(re, rep);
  return n.trim();
}

export interface FuzzyMatchResult {
  similarity: number;
  matched: boolean;
  threshold: number;
  normalizedA: string;
  normalizedB: string;
}

export function fuzzyNameMatch(a: string, b: string, threshold = 0.92): FuzzyMatchResult {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  const similarity = jaroWinkler(na, nb);
  return {
    similarity,
    matched: similarity >= threshold,
    threshold,
    normalizedA: na,
    normalizedB: nb,
  };
}

// ─── Case 043: OFAC false-positive disambiguation ───────────────

export interface OfacCandidate {
  name: string;
  dob?: string; // ISO date
  nationality?: string;
  occupation?: string;
  program?: string; // SDN program code e.g. "SDGT"
  aliases?: string[];
}

export interface OfacScreenResult {
  nameMatched: boolean;
  isFalsePositive: boolean;
  confidence: number;
  matchScore: number;
  contextMatches: string[];
  contextMismatches: string[];
  verdict: string;
}

export function screenOfac(
  subject: OfacCandidate,
  watchlist: OfacCandidate[],
  opts: { nameThreshold?: number; requireContextFields?: number } = {}
): OfacScreenResult {
  const nameThreshold = opts.nameThreshold ?? 0.92;
  const requireContextFields = opts.requireContextFields ?? 2;

  let best: { cand: OfacCandidate; score: number } | null = null;
  for (const cand of watchlist) {
    const r = fuzzyNameMatch(subject.name, cand.name, nameThreshold);
    if (r.matched && (!best || r.similarity > best.score)) {
      best = { cand, score: r.similarity };
    }
  }

  if (!best) {
    return {
      nameMatched: false,
      isFalsePositive: false,
      confidence: 1,
      matchScore: 0,
      contextMatches: [],
      contextMismatches: [],
      verdict: "No name match — subject is clear.",
    };
  }

  const matches: string[] = [];
  const mismatches: string[] = [];

  if (subject.dob && best.cand.dob) {
    if (subject.dob === best.cand.dob) matches.push(`DOB identical (${subject.dob})`);
    else mismatches.push(`DOB differs (subject ${subject.dob} vs watchlist ${best.cand.dob})`);
  }
  if (subject.nationality && best.cand.nationality) {
    if (subject.nationality.toLowerCase() === best.cand.nationality.toLowerCase()) {
      matches.push(`Nationality identical (${subject.nationality})`);
    } else {
      mismatches.push(`Nationality differs (${subject.nationality} vs ${best.cand.nationality})`);
    }
  }
  if (subject.occupation && best.cand.occupation) {
    const occMatch = jaroWinkler(subject.occupation.toLowerCase(), best.cand.occupation.toLowerCase()) > 0.7;
    if (occMatch) matches.push(`Occupation similar (${subject.occupation} ≈ ${best.cand.occupation})`);
    else mismatches.push(`Occupation differs (${subject.occupation} vs ${best.cand.occupation})`);
  }

  // A true OFAC hit requires name match + at least N context fields matching
  // AND no hard mismatches on DOB/nationality.
  const isFalsePositive =
    matches.length < requireContextFields || mismatches.some((m) => m.startsWith("DOB differs"));

  const confidence = isFalsePositive
    ? Math.max(0, 1 - matches.length * 0.2)
    : Math.min(1, 0.5 + matches.length * 0.2);

  const verdict = isFalsePositive
    ? `FALSE POSITIVE — name "${subject.name}" matches watchlist entry "${best.cand.name}" (score ${best.score.toFixed(3)}) but ${matches.length} context field(s) agree and ${mismatches.length} disagree. Homonym, not the sanctioned individual.`
    : `TRUE HIT — name "${subject.name}" matches "${best.cand.name}" (score ${best.score.toFixed(3)}) with ${matches.length} corroborating context fields. Escalate to compliance.`;

  return {
    nameMatched: true,
    isFalsePositive,
    confidence,
    matchScore: best.score,
    contextMatches: matches,
    contextMismatches: mismatches,
    verdict,
  };
}

// ─── Case 097: CEO homonym resolution by tenure ─────────────────

export interface Tenure {
  personName: string;
  role: string;
  company: string;
  start: string; // ISO date
  end: string | null; // null = current
  normalizedKey: string; // e.g. "benjelloun" for homonym grouping
}

export interface CeoResolutionResult {
  resolved: Tenure | null;
  ambiguous: boolean;
  candidates: Tenure[];
  reason: string;
}

export function resolveCeoByDate(
  candidates: Tenure[],
  articleDate: string,
  company: string
): CeoResolutionResult {
  const filtered = candidates.filter((c) => c.company.toLowerCase() === company.toLowerCase());
  if (filtered.length === 0) {
    return { resolved: null, ambiguous: false, candidates: [], reason: `No CEO tenures found for "${company}".` };
  }

  const inWindow = filtered.filter((c) => {
    const afterStart = articleDate >= c.start;
    const beforeEnd = c.end === null || articleDate <= c.end;
    return afterStart && beforeEnd;
  });

  if (inWindow.length === 1) {
    return {
      resolved: inWindow[0],
      ambiguous: false,
      candidates: inWindow,
      reason: `Article date ${articleDate} falls within the tenure of ${inWindow[0].personName} (${inWindow[0].start} → ${inWindow[0].end ?? "current"}).`,
    };
  }
  if (inWindow.length > 1) {
    return {
      resolved: inWindow[0],
      ambiguous: true,
      candidates: inWindow,
      reason: `Article date ${articleDate} overlaps ${inWindow.length} tenures (${inWindow.map((c) => c.personName).join(", ")}). Manual review required — disambiguating using article context (board members, deals mentioned).`,
    };
  }

  // No tenure covers the date — find the closest one
  const closest = filtered.reduce((best, c) => {
    const bestDist = Math.min(
      Math.abs(new Date(articleDate).getTime() - new Date(best.start).getTime()),
      best.end ? Math.abs(new Date(articleDate).getTime() - new Date(best.end).getTime()) : Infinity
    );
    const cDist = Math.min(
      Math.abs(new Date(articleDate).getTime() - new Date(c.start).getTime()),
      c.end ? Math.abs(new Date(articleDate).getTime() - new Date(c.end).getTime()) : Infinity
    );
    return cDist < bestDist ? c : best;
  });

  return {
    resolved: null,
    ambiguous: true,
    candidates: filtered,
    reason: `Article date ${articleDate} does not fall within any recorded tenure for "${company}". Closest tenure: ${closest.personName} (${closest.start} → ${closest.end ?? "current"}). Likely a former CEO — verify the article refers to the historical figure, not the current one.`,
  };
}
