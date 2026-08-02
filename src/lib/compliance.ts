// ═══════════════════════════════════════════════════════════════
//  COMPLIANCE & SCREENING ENGINE — Sanctions, AML, KYC, PEP
//
//  Comprehensive compliance screening system for the Investor Desk.
//  Handles sanctions list matching (OFAC/EU/UN), PEP screening,
//  adverse media detection, KYC/CDD scoring, and compliance
//  report generation.
// ═══════════════════════════════════════════════════════════════

import type { SanctionsEntry } from "@/lib/types/platform";

// ─── TYPES ─────────────────────────────────────────────────────

export interface ScreeningRequest {
  entityName: string;
  entityType?: "individual" | "entity" | "vessel" | "aircraft";
  aliases?: string[];
  dateOfBirth?: string;
  nationality?: string;
  lists: Array<"OFAC" | "EU" | "UN">;
  fuzzy?: boolean;
  threshold?: number;
}

export interface ScreeningResult {
  request: ScreeningRequest;
  matched: boolean;
  matches: SanctionsMatch[];
  checkedAt: string;
  durationMs: number;
  listsChecked: number;
  entriesScanned: number;
}

export interface SanctionsMatch {
  list: "OFAC" | "EU" | "UN";
  entry: SanctionsEntry;
  matchScore: number;
  matchType: "exact" | "fuzzy" | "alias";
  matchedField: string;
  matchedValue: string;
}

export interface PEPScreeningResult {
  entityName: string;
  isPEP: boolean;
  pepLevel: PEPTLevel;
  matches: PEPMatch[];
  checkedAt: string;
}

export type PEPTLevel = "none" | "low" | "medium" | "high" | "very_high";

export interface PEPMatch {
  name: string;
  title: string;
  country: string;
  position: string;
  matchScore: number;
  source: string;
}

export interface AdverseMediaResult {
  entityName: string;
  hasAdverseMedia: boolean;
  articles: AdverseMediaArticle[];
  riskScore: number;
  checkedAt: string;
}

export interface AdverseMediaArticle {
  title: string;
  source: string;
  date: string;
  sentiment: string;
  categories: string[];
  severity: "low" | "medium" | "high" | "critical";
  url?: string;
}

export interface KYCResult {
  entityName: string;
  overallRisk: KYCRiskLevel;
  score: number;
  sanctionsRisk: KYCRiskLevel;
  pepRisk: KYCRiskLevel;
  adverseMediaRisk: KYCRiskLevel;
  financialRisk: KYCRiskLevel;
  recommendations: string[];
  checkedAt: string;
}

export type KYCRiskLevel = "low" | "medium" | "high" | "prohibited";

export interface ComplianceReport {
  entityName: string;
  generatedAt: string;
  screening: ScreeningResult;
  pep: PEPScreeningResult;
  adverseMedia: AdverseMediaResult;
  kyc: KYCResult;
  summary: string;
  recommendations: string[];
  status: "clear" | "review" | "escalate" | "prohibited";
}

// ─── STRING MATCHING ───────────────────────────────────────────

export class StringMatcher {
  static levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    const aLen = a.length;
    const bLen = b.length;

    if (aLen === 0) return bLen;
    if (bLen === 0) return aLen;

    for (let i = 0; i <= bLen; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= aLen; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= bLen; i++) {
      for (let j = 1; j <= aLen; j++) {
        const cost = a[j - 1] === b[i - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    return matrix[bLen][aLen];
  }

  static similarity(a: string, b: string): number {
    const aNorm = a.toLowerCase().trim();
    const bNorm = b.toLowerCase().trim();
    if (aNorm === bNorm) return 1.0;
    const maxLen = Math.max(aNorm.length, bNorm.length);
    if (maxLen === 0) return 1.0;
    const distance = this.levenshteinDistance(aNorm, bNorm);
    return 1 - distance / maxLen;
  }

  static jaroWinkler(s1: string, s2: string): number {
    const jaro = this.jaro(s1, s2);
    const prefixLen = this.commonPrefix(s1, s2, 4);
    return jaro + prefixLen * 0.1 * (1 - jaro);
  }

  static jaro(s1: string, s2: string): number {
    const a = s1.toLowerCase();
    const b = s2.toLowerCase();
    if (a === b) return 1.0;
    if (a.length === 0 || b.length === 0) return 0.0;

    const matchDistance = Math.floor(Math.max(a.length, b.length) / 2) - 1;
    const aMatches = new Array(a.length).fill(false);
    const bMatches = new Array(b.length).fill(false);
    let matches = 0;

    for (let i = 0; i < a.length; i++) {
      const start = Math.max(0, i - matchDistance);
      const end = Math.min(i + matchDistance + 1, b.length);
      for (let j = start; j < end; j++) {
        if (bMatches[j] || a[i] !== b[j]) continue;
        aMatches[i] = true;
        bMatches[j] = true;
        matches++;
        break;
      }
    }

    if (matches === 0) return 0.0;

    let transpositions = 0;
    let k = 0;
    for (let i = 0; i < a.length; i++) {
      if (!aMatches[i]) continue;
      while (!bMatches[k]) k++;
      if (a[i] !== b[k]) transpositions++;
      k++;
    }

    return (matches / a.length + matches / b.length + (matches - transpositions / 2) / matches) / 3;
  }

  static commonPrefix(s1: string, s2: string, maxLen: number): number {
    const a = s1.toLowerCase();
    const b = s2.toLowerCase();
    let i = 0;
    while (i < Math.min(a.length, b.length, maxLen) && a[i] === b[i]) i++;
    return i;
  }

  static tokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter(t => t.length > 1);
  }

  static tokenSimilarity(a: string, b: string): number {
    const tokensA = new Set(this.tokenize(a));
    const tokensB = new Set(this.tokenize(b));
    if (tokensA.size === 0 && tokensB.size === 0) return 1.0;
    if (tokensA.size === 0 || tokensB.size === 0) return 0.0;
    const intersection = [...tokensA].filter(t => tokensB.has(t)).length;
    const union = tokensA.size + tokensB.size - intersection;
    return intersection / union;
  }

  static bestMatch(query: string, candidates: string[], threshold: number = 0.85): { match: string | null; score: number } {
    let bestScore = 0;
    let bestMatch: string | null = null;

    for (const candidate of candidates) {
      const score = Math.max(
        this.similarity(query, candidate),
        this.jaroWinkler(query, candidate),
        this.tokenSimilarity(query, candidate)
      );
      if (score > bestScore) {
        bestScore = score;
        bestMatch = candidate;
      }
    }

    if (bestScore >= threshold) {
      return { match: bestMatch, score: bestScore };
    }

    return { match: null, score: bestScore };
  }
}

// ─── SANCTIONS SCREENING ───────────────────────────────────────

export class SanctionsScreener {
  private ofacList: SanctionsEntry[] = [];
  private euList: SanctionsEntry[] = [];
  private unList: SanctionsEntry[] = [];
  private lastRefresh: Map<string, Date> = new Map();

  loadList(list: "OFAC" | "EU" | "UN", entries: SanctionsEntry[]): void {
    switch (list) {
      case "OFAC":
        this.ofacList = entries;
        break;
      case "EU":
        this.euList = entries;
        break;
      case "UN":
        this.unList = entries;
        break;
    }
    this.lastRefresh.set(list, new Date());
  }

  getList(list: "OFAC" | "EU" | "UN"): SanctionsEntry[] {
    switch (list) {
      case "OFAC": return this.ofacList;
      case "EU": return this.euList;
      case "UN": return this.unList;
      default: return [];
    }
  }

  getTotalEntries(): number {
    return this.ofacList.length + this.euList.length + this.unList.length;
  }

  screen(request: ScreeningRequest): ScreeningResult {
    const startTime = Date.now();
    const threshold = request.threshold ?? 0.85;
    const matches: SanctionsMatch[] = [];
    let entriesScanned = 0;

    const allNames = [request.entityName, ...(request.aliases || [])];

    for (const list of request.lists) {
      const entries = this.getList(list);
      entriesScanned += entries.length;

      for (const entry of entries) {
        const candidateNames = [entry.name, ...(entry.aliases || [])];

        for (const queryName of allNames) {
          for (const candidateName of candidateNames) {
            const score = Math.max(
              StringMatcher.similarity(queryName, candidateName),
              StringMatcher.jaroWinkler(queryName, candidateName)
            );

            if (score >= threshold) {
              const matchType: "exact" | "fuzzy" | "alias" =
                score === 1.0 ? "exact" :
                queryName !== request.entityName ? "alias" : "fuzzy";

              matches.push({
                list,
                entry,
                matchScore: score,
                matchType,
                matchedField: "name",
                matchedValue: candidateName,
              });
            }
          }
        }
      }
    }

    // Sort matches by score (highest first)
    matches.sort((a, b) => b.matchScore - a.matchScore);

    const durationMs = Date.now() - startTime;

    return {
      request,
      matched: matches.length > 0,
      matches,
      checkedAt: new Date().toISOString(),
      durationMs,
      listsChecked: request.lists.length,
      entriesScanned,
    };
  }

  quickScreen(entityName: string, lists: Array<"OFAC" | "EU" | "UN"> = ["OFAC", "EU", "UN"]): boolean {
    const result = this.screen({
      entityName,
      lists,
      fuzzy: false,
      threshold: 0.95,
    });
    return result.matched;
  }

  fuzzyScreen(entityName: string, threshold: number = 0.85, lists: Array<"OFAC" | "EU" | "UN"> = ["OFAC", "EU", "UN"]): SanctionsMatch[] {
    const result = this.screen({
      entityName,
      lists,
      fuzzy: true,
      threshold,
    });
    return result.matches;
  }

  isStale(list: "OFAC" | "EU" | "UN", maxAgeHours: number = 24): boolean {
    const lastRefresh = this.lastRefresh.get(list);
    if (!lastRefresh) return true;
    const ageMs = Date.now() - lastRefresh.getTime();
    return ageMs > maxAgeHours * 60 * 60 * 1000;
  }

  getStaleLists(): Array<"OFAC" | "EU" | "UN"> {
    const stale: Array<"OFAC" | "EU" | "UN"> = [];
    if (this.isStale("OFAC")) stale.push("OFAC");
    if (this.isStale("EU")) stale.push("EU");
    if (this.isStale("UN")) stale.push("UN");
    return stale;
  }

  getStats(): { ofac: number; eu: number; un: number; total: number; stale: string[] } {
    return {
      ofac: this.ofacList.length,
      eu: this.euList.length,
      un: this.unList.length,
      total: this.getTotalEntries(),
      stale: this.getStaleLists(),
    };
  }
}

// ─── PEP SCREENING ─────────────────────────────────────────────

export class PEPScreener {
  private pepList: PEPMatch[] = [];

  loadPEPs(peps: PEPMatch[]): void {
    this.pepList = peps;
  }

  screen(entityName: string): PEPScreeningResult {
    const matches: PEPMatch[] = [];
    const allNames = [entityName];

    for (const pep of this.pepList) {
      const score = Math.max(
        StringMatcher.similarity(entityName, pep.name),
        StringMatcher.jaroWinkler(entityName, pep.name)
      );

      if (score >= 0.85) {
        matches.push({ ...pep, matchScore: score });
      }
    }

    matches.sort((a, b) => b.matchScore - a.matchScore);

    const isPEP = matches.length > 0;
    const pepLevel: PEPTLevel = this.determinePEPLevel(matches);

    return {
      entityName,
      isPEP,
      pepLevel,
      matches,
      checkedAt: new Date().toISOString(),
    };
  }

  private determinePEPLevel(matches: PEPMatch[]): PEPTLevel {
    if (matches.length === 0) return "none";

    const bestScore = matches[0].matchScore;
    if (bestScore >= 0.95) return "very_high";
    if (bestScore >= 0.90) return "high";
    if (bestScore >= 0.87) return "medium";
    return "low";
  }

  getCount(): number {
    return this.pepList.length;
  }
}

// ─── ADVERSE MEDIA DETECTION ───────────────────────────────────

export class AdverseMediaDetector {
  private riskKeywords: Map<string, string[]> = new Map();

  constructor() {
    this.loadDefaultKeywords();
  }

  private loadDefaultKeywords(): void {
    this.riskKeywords.set("fraud", ["fraud", "embezzlement", "misappropriation", "wire fraud", "securities fraud", "accounting fraud"]);
    this.riskKeywords.set("corruption", ["corruption", "bribery", "kickback", "extortion", "graft", "payoff", "slush fund"]);
    this.riskKeywords.set("money_laundering", ["money laundering", "AML", "predicate offense", "structuring", "smurfing", "layering", "integration"]);
    this.riskKeywords.set("terrorism", ["terrorism", "terrorist", "extremist", "radicalization", "financing of terrorism"]);
    this.riskKeywords.set("narcotics", ["drug trafficking", "narcotics", "cartel", "drug smuggling", "controlled substance"]);
    this.riskKeywords.set("cybercrime", ["cybercrime", "hacking", "data breach", "ransomware", "phishing", "identity theft"]);
    this.riskKeywords.set("environmental", ["environmental violation", "pollution", "toxic waste", "illegal dumping", "EPA violation"]);
    this.riskKeywords.set("human_rights", ["human rights", "forced labor", "child labor", "human trafficking", "modern slavery"]);
    this.riskKeywords.set("financial", ["bankruptcy", "insolvency", "default", "foreclosure", "restructuring", "debt crisis"]);
    this.riskKeywords.set("regulatory", ["regulatory violation", "SEC", "AMMC", "fine", "penalty", "sanction", "enforcement action"]);
    this.riskKeywords.set("legal", ["lawsuit", "litigation", "indictment", "conviction", "guilty plea", "settlement", "class action"]);
    this.riskKeywords.set("reputational", ["scandal", "controversy", "backlash", "boycott", "protest", "outrage"]);
  }

  addKeywords(category: string, keywords: string[]): void {
    this.riskKeywords.set(category, keywords);
  }

  analyze(text: string): { categories: string[]; severity: "low" | "medium" | "high" | "critical"; score: number } {
    const lowerText = text.toLowerCase();
    const foundCategories: string[] = [];
    let totalMatches = 0;
    let maxSeverityScore = 0;

    for (const [category, keywords] of this.riskKeywords) {
      let categoryMatches = 0;
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          categoryMatches++;
          totalMatches++;
        }
      }
      if (categoryMatches > 0) {
        foundCategories.push(category);
        // Weight by category severity
        const severityWeights: Record<string, number> = {
          terrorism: 100,
          money_laundering: 80,
          corruption: 70,
          fraud: 60,
          narcotics: 60,
          human_rights: 50,
          cybercrime: 40,
          environmental: 30,
          legal: 25,
          regulatory: 20,
          financial: 15,
          reputational: 10,
        };
        maxSeverityScore = Math.max(maxSeverityScore, severityWeights[category] || 10);
      }
    }

    const severity = this.determineSeverity(maxSeverityScore, totalMatches);
    const score = Math.min(100, maxSeverityScore + totalMatches * 5);

    return { categories: foundCategories, severity, score };
  }

  private determineSeverity(maxSeverityScore: number, totalMatches: number): "low" | "medium" | "high" | "critical" {
    if (maxSeverityScore >= 80 || totalMatches >= 5) return "critical";
    if (maxSeverityScore >= 50 || totalMatches >= 3) return "high";
    if (maxSeverityScore >= 20 || totalMatches >= 1) return "medium";
    return "low";
  }

  screen(entityName: string, articles: Array<{ title: string; content?: string; source: string; date: string; sentiment?: string; url?: string }>): AdverseMediaResult {
    const adverseArticles: AdverseMediaArticle[] = [];
    let totalRiskScore = 0;

    for (const article of articles) {
      const text = `${article.title} ${article.content || ""}`;
      const analysis = this.analyze(text);

      if (analysis.categories.length > 0) {
        adverseArticles.push({
          title: article.title,
          source: article.source,
          date: article.date,
          sentiment: article.sentiment || "neutral",
          categories: analysis.categories,
          severity: analysis.severity,
          url: article.url,
        });
        totalRiskScore += analysis.score;
      }
    }

    const riskScore = adverseArticles.length > 0
      ? Math.min(100, totalRiskScore / adverseArticles.length)
      : 0;

    return {
      entityName,
      hasAdverseMedia: adverseArticles.length > 0,
      articles: adverseArticles.sort((a, b) => {
        const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      }),
      riskScore,
      checkedAt: new Date().toISOString(),
    };
  }
}

// ─── KYC / CDD SCORING ─────────────────────────────────────────

export class KYCScorer {
  private sanctionsScreener: SanctionsScreener;
  private pepScreener: PEPScreener;
  private adverseMediaDetector: AdverseMediaDetector;

  constructor(
    sanctionsScreener: SanctionsScreener,
    pepScreener: PEPScreener,
    adverseMediaDetector: AdverseMediaDetector
  ) {
    this.sanctionsScreener = sanctionsScreener;
    this.pepScreener = pepScreener;
    this.adverseMediaDetector = adverseMediaDetector;
  }

  assess(
    entityName: string,
    aliases: string[] = [],
    articles: Array<{ title: string; content?: string; source: string; date: string; sentiment?: string; url?: string }> = []
  ): KYCResult {
    // 1. Sanctions screening
    const sanctionsResult = this.sanctionsScreener.screen({
      entityName,
      aliases,
      lists: ["OFAC", "EU", "UN"],
      fuzzy: true,
      threshold: 0.85,
    });

    const sanctionsRisk: KYCRiskLevel = this.determineSanctionsRisk(sanctionsResult);

    // 2. PEP screening
    const pepResult = this.pepScreener.screen(entityName);
    const pepRisk: KYCRiskLevel = this.determinePEPRisk(pepResult.pepLevel);

    // 3. Adverse media
    const adverseResult = this.adverseMediaDetector.screen(entityName, articles);
    const adverseMediaRisk: KYCRiskLevel = this.determineAdverseMediaRisk(adverseResult.riskScore, adverseResult.articles);

    // 4. Financial risk (placeholder — would use financial data)
    const financialRisk: KYCRiskLevel = "low";

    // 5. Overall risk
    const { overallRisk, score } = this.calculateOverallRisk(sanctionsRisk, pepRisk, adverseMediaRisk, financialRisk);

    // 6. Recommendations
    const recommendations = this.generateRecommendations(overallRisk, sanctionsRisk, pepRisk, adverseMediaRisk, sanctionsResult, pepResult, adverseResult);

    return {
      entityName,
      overallRisk,
      score,
      sanctionsRisk,
      pepRisk,
      adverseMediaRisk,
      financialRisk,
      recommendations,
      checkedAt: new Date().toISOString(),
    };
  }

  private determineSanctionsRisk(result: ScreeningResult): KYCRiskLevel {
    if (result.matched) {
      const hasExactMatch = result.matches.some(m => m.matchType === "exact");
      if (hasExactMatch) return "prohibited";
      const highScoreMatches = result.matches.filter(m => m.matchScore >= 0.90);
      if (highScoreMatches.length > 0) return "high";
      return "medium";
    }
    return "low";
  }

  private determinePEPRisk(level: PEPTLevel): KYCRiskLevel {
    switch (level) {
      case "very_high": return "high";
      case "high": return "medium";
      case "medium": return "medium";
      case "low": return "low";
      default: return "low";
    }
  }

  private determineAdverseMediaRisk(riskScore: number, articles: AdverseMediaArticle[]): KYCRiskLevel {
    if (articles.some(a => a.severity === "critical")) return "high";
    if (articles.some(a => a.severity === "high")) return "medium";
    if (riskScore > 30) return "medium";
    if (articles.length > 0) return "low";
    return "low";
  }

  private calculateOverallRisk(
    sanctions: KYCRiskLevel,
    pep: KYCRiskLevel,
    adverseMedia: KYCRiskLevel,
    financial: KYCRiskLevel
  ): { overallRisk: KYCRiskLevel; score: number } {
    const riskScores: Record<KYCRiskLevel, number> = {
      low: 25,
      medium: 50,
      high: 75,
      prohibited: 100,
    };

    // Sanctions has highest weight
    const weights = {
      sanctions: 0.40,
      pep: 0.20,
      adverseMedia: 0.25,
      financial: 0.15,
    };

    const score = Math.round(
      riskScores[sanctions] * weights.sanctions +
      riskScores[pep] * weights.pep +
      riskScores[adverseMedia] * weights.adverseMedia +
      riskScores[financial] * weights.financial
    );

    let overallRisk: KYCRiskLevel;
    if (sanctions === "prohibited") overallRisk = "prohibited";
    else if (score >= 75) overallRisk = "high";
    else if (score >= 50) overallRisk = "medium";
    else overallRisk = "low";

    return { overallRisk, score };
  }

  private generateRecommendations(
    overall: KYCRiskLevel,
    sanctions: KYCRiskLevel,
    pep: KYCRiskLevel,
    adverse: KYCRiskLevel,
    sanctionsResult: ScreeningResult,
    pepResult: PEPScreeningResult,
    adverseResult: AdverseMediaResult
  ): string[] {
    const recommendations: string[] = [];

    if (overall === "prohibited") {
      recommendations.push("IMMEDIATE ACTION: Entity is on a sanctions list. All transactions must be blocked.");
      recommendations.push("File a Suspicious Activity Report (SAR) within 24 hours.");
      recommendations.push("Notify the compliance officer and legal department immediately.");
    } else if (overall === "high") {
      recommendations.push("Enhanced due diligence (EDD) required before any transaction.");
      recommendations.push("Obtain senior management approval for any business relationship.");
      recommendations.push("Conduct ongoing monitoring of the relationship.");
      recommendations.push("Consider filing a SAR if suspicious activity is detected.");
    } else if (overall === "medium") {
      recommendations.push("Standard due diligence with enhanced monitoring recommended.");
      recommendations.push("Review adverse media quarterly.");
      recommendations.push("Set up automated alerts for new sanctions matches.");
    } else {
      recommendations.push("Standard due diligence sufficient.");
      recommendations.push("Annual review recommended.");
    }

    if (sanctions === "medium" && sanctionsResult.matches.length > 0) {
      recommendations.push(`Review ${sanctionsResult.matches.length} potential sanctions matches manually.`);
    }

    if (pepResult.isPEP) {
      recommendations.push(`PEP identified (level: ${pepResult.pepLevel}). Enhanced due diligence required.`);
      recommendations.push("Obtain source of wealth and source of funds documentation.");
    }

    if (adverse !== "low" && adverseResult.hasAdverseMedia) {
      const criticalCount = adverseResult.articles.filter(a => a.severity === "critical").length;
      const highCount = adverseResult.articles.filter(a => a.severity === "high").length;
      if (criticalCount > 0) {
        recommendations.push(`${criticalCount} critical adverse media article(s) found. Immediate review required.`);
      }
      if (highCount > 0) {
        recommendations.push(`${highCount} high-severity adverse media article(s) found. Review within 48 hours.`);
      }
    }

    return recommendations;
  }
}

// ─── COMPLIANCE REPORT GENERATOR ───────────────────────────────

export class ComplianceReportGenerator {
  private kycScorer: KYCScorer;

  constructor(kycScorer: KYCScorer) {
    this.kycScorer = kycScorer;
  }

  generate(
    entityName: string,
    aliases: string[] = [],
    articles: Array<{ title: string; content?: string; source: string; date: string; sentiment?: string; url?: string }> = []
  ): ComplianceReport {
    const kyc = this.kycScorer.assess(entityName, aliases, articles);

    // Extract individual results from KYC (would normally call screeners directly)
    const screening = this.kycScorer["sanctionsScreener"].screen({
      entityName,
      aliases,
      lists: ["OFAC", "EU", "UN"],
      fuzzy: true,
      threshold: 0.85,
    });

    const pep = this.kycScorer["pepScreener"].screen(entityName);
    const adverseMedia = this.kycScorer["adverseMediaDetector"].screen(entityName, articles);

    const status = this.determineStatus(kyc);
    const summary = this.generateSummary(entityName, kyc, screening, pep, adverseMedia);
    const recommendations = kyc.recommendations;

    return {
      entityName,
      generatedAt: new Date().toISOString(),
      screening,
      pep,
      adverseMedia,
      kyc,
      summary,
      recommendations,
      status,
    };
  }

  private determineStatus(kyc: KYCResult): "clear" | "review" | "escalate" | "prohibited" {
    switch (kyc.overallRisk) {
      case "prohibited": return "prohibited";
      case "high": return "escalate";
      case "medium": return "review";
      default: return "clear";
    }
  }

  private generateSummary(
    entityName: string,
    kyc: KYCResult,
    screening: ScreeningResult,
    pep: PEPScreeningResult,
    adverseMedia: AdverseMediaResult
  ): string {
    const parts: string[] = [];

    parts.push(`Compliance screening for ${entityName} completed on ${new Date().toLocaleDateString("en-US")}.`);

    parts.push(`\nSanctions Screening: ${screening.matched ? `${screening.matches.length} match(es) found across ${screening.listsChecked} lists (${screening.entriesScanned.toLocaleString()} entries scanned)` : "No matches found"} (${screening.listsChecked} lists, ${screening.entriesScanned.toLocaleString()} entries).`);

    parts.push(`\nPEP Screening: ${pep.isPEP ? `Identified as PEP (level: ${pep.pepLevel}, ${pep.matches.length} match(es))` : "Not identified as PEP"}.`);

    parts.push(`\nAdverse Media: ${adverseMedia.hasAdverseMedia ? `${adverseMedia.articles.length} article(s) found (risk score: ${adverseMedia.riskScore.toFixed(0)}/100)` : "No adverse media found"}.`);

    parts.push(`\nOverall KYC Risk: ${kyc.overallRisk.toUpperCase()} (score: ${kyc.score}/100).`);

    if (kyc.overallRisk === "prohibited") {
      parts.push("\n⚠️ CRITICAL: This entity is on a sanctions list. All transactions must be blocked immediately.");
    } else if (kyc.overallRisk === "high") {
      parts.push("\n⚠️ Enhanced due diligence required. Senior management approval needed for any business relationship.");
    } else if (kyc.overallRisk === "medium") {
      parts.push("\nStandard due diligence with enhanced monitoring recommended.");
    } else {
      parts.push("\n✅ Standard due diligence sufficient. Entity cleared for standard business relationship.");
    }

    return parts.join(" ");
  }
}

// ─── MOCK DATA FOR TESTING ─────────────────────────────────────

export const MOCK_OFAC_ENTRIES: SanctionsEntry[] = [
  { list: "OFAC", name: "John Doe", aliases: ["J. Doe", "Johnny Doe"], program: "SDNTK", entityType: "individual", country: "Unknown" },
  { list: "OFAC", name: "Jane Smith", aliases: ["J. Smith"], program: "SDGT", entityType: "individual", country: "Unknown" },
  { list: "OFAC", name: "Example Corporation", aliases: ["Example Corp", "ExCorp"], program: "IRAN", entityType: "entity", country: "Iran" },
  { list: "OFAC", name: "Test Entity Ltd", aliases: ["Test Ltd"], program: "UKRAINE-EO13662", entityType: "entity", country: "Russia" },
  { list: "OFAC", name: "MV Example Vessel", aliases: ["Example Ship"], program: "DPRK2", entityType: "vessel", country: "North Korea" },
];

export const MOCK_PEP_ENTRIES: PEPMatch[] = [
  { name: "Abdellatif Jouahri", title: "Governor", country: "Morocco", position: "Central Bank Governor", matchScore: 0, source: "World Bank PEP Database" },
  { name: "Nadia Fettah Alaoui", title: "Minister", country: "Morocco", position: "Minister of Economy and Finance", matchScore: 0, source: "World Bank PEP Database" },
  { name: "Aziz Akhannouch", title: "Head of Government", country: "Morocco", position: "Prime Minister (2021-2026)", matchScore: 0, source: "World Bank PEP Database" },
  { name: "Nasser Bourita", title: "Minister", country: "Morocco", position: "Minister of Foreign Affairs", matchScore: 0, source: "World Bank PEP Database" },
  { name: "Ryad Mezzour", title: "Minister", country: "Morocco", position: "Minister of Industry and Trade", matchScore: 0, source: "World Bank PEP Database" },
];

// ─── SINGLETON INSTANCE ────────────────────────────────────────

let complianceInstance: { screener: SanctionsScreener; pep: PEPScreener; adverse: AdverseMediaDetector; kyc: KYCScorer; reportGen: ComplianceReportGenerator } | null = null;

export function getComplianceEngine() {
  if (!complianceInstance) {
    const screener = new SanctionsScreener();
    screener.loadList("OFAC", MOCK_OFAC_ENTRIES);

    const pep = new PEPScreener();
    pep.loadPEPs(MOCK_PEP_ENTRIES);

    const adverse = new AdverseMediaDetector();
    const kyc = new KYCScorer(screener, pep, adverse);
    const reportGen = new ComplianceReportGenerator(kyc);

    complianceInstance = { screener, pep, adverse, kyc, reportGen };
  }
  return complianceInstance;
}
