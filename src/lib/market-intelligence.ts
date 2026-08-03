// ═══════════════════════════════════════════════════════════════
//  MARKET INTELLIGENCE ENGINE — Competitive analysis & strategy
//
//  Comprehensive market intelligence module for competitive
//  analysis, market positioning, threat assessment, and strategic
//  recommendation generation.
// ═══════════════════════════════════════════════════════════════

// ─── TYPES ─────────────────────────────────────────────────────

export interface CompetitorProfile {
  id: string;
  name: string;
  slug: string;
  sector: string;
  marketShare?: number;
  revenue?: number;
  employees?: number;
  foundedYear?: number;
  headquarters?: string;
  website?: string;
  strengths: string[];
  weaknesses: string[];
  strategy: CompetitorStrategy;
  positioning: MarketPosition;
  threat: ThreatAssessment;
}

export type CompetitorStrategy =
  | "market_leader"
  | "challenger"
  | "follower"
  | "nichers"
  | "disruptor"
  | "diversified"
  | "innovator"
  | "cost_leader";

export type MarketPosition =
  | "premium"
  | "mainstream"
  | "value"
  | "budget"
  | "luxury"
  | "specialist"
  | "generalist";

export interface ThreatAssessment {
  level: "low" | "medium" | "high" | "critical";
  score: number;
  factors: ThreatFactor[];
}

export interface ThreatFactor {
  factor: string;
  weight: number;
  score: number;
  description: string;
}

export interface MarketShareData {
  companyId: string;
  companyName: string;
  share: number;
  trend: "gaining" | "stable" | "losing";
  changePct: number;
  segment?: string;
}

export interface CompetitiveMatrix {
  dimensions: string[];
  companies: Array<{
    id: string;
    name: string;
    scores: Record<string, number>;
  }>;
}

export interface PositioningMap {
  xAxis: { label: string; min: number; max: number };
  yAxis: { label: string; min: number; max: number };
  points: Array<{
    companyId: string;
    companyName: string;
    x: number;
    y: number;
    size: number;
    color: string;
  }>;
  quadrants: PositioningQuadrant[];
}

export interface PositioningQuadrant {
  label: string;
  description: string;
  companies: string[];
}

export interface SWOTAnalysis {
  strengths: SWOTItem[];
  weaknesses: SWOTItem[];
  opportunities: SWOTItem[];
  threats: SWOTItem[];
  summary: string;
}

export interface SWOTItem {
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  evidence: string[];
}

export interface MarketEvent {
  id: string;
  date: string;
  type: "product_launch" | "acquisition" | "partnership" | "funding" | "regulatory" | "leadership_change" | "market_entry" | "market_exit" | "price_change" | "expansion" | "crisis" | "innovation";
  company: string;
  title: string;
  description: string;
  impact: "minimal" | "low" | "moderate" | "high" | "transformative";
  affectedCompanies: string[];
  affectedSectors: string[];
  sentimentScore: number;
}

export interface StrategicRecommendation {
  id: string;
  priority: "critical" | "high" | "medium" | "low";
  category: "offensive" | "defensive" | "strategic" | "operational" | "innovation" | "partnership" | "acquisition";
  title: string;
  description: string;
  rationale: string;
  timeline: string;
  expectedImpact: string;
  resourceRequirement: "low" | "medium" | "high";
  riskLevel: "low" | "medium" | "high";
  successMetrics: string[];
}

export interface MarketOpportunity {
  id: string;
  title: string;
  description: string;
  type: "market_gap" | "underserved_segment" | "emerging_trend" | "technology_shift" | "regulatory_change" | "competitive_weakness";
  marketSize: number;
  growthRate: number;
  timeToMarket: string;
  competition: "none" | "low" | "medium" | "high";
  feasibilityScore: number;
  attractivenessScore: number;
  priority: number;
}

export interface IndustryBenchmark {
  metric: string;
  companyValue: number;
  industryAverage: number;
  industryMedian: number;
  industryMax: number;
  industryMin: number;
  percentile: number;
  trend: "above" | "at" | "below";
}

export interface MarketTimeline {
  events: MarketEvent[];
  milestones: Array<{ date: string; title: string; description: string }>;
  trends: Array<{ period: string; trend: string; direction: "up" | "down" | "stable" }>;
}

// ─── COMPETITIVE MATRIX BUILDER ────────────────────────────────

export class CompetitiveMatrixBuilder {
  private dimensions: string[] = [];
  private companies: Map<string, { id: string; name: string; scores: Record<string, number> }> = new Map();

  addDimension(name: string): this {
    this.dimensions.push(name);
    return this;
  }

  addCompany(id: string, name: string): this {
    this.companies.set(id, { id, name, scores: {} });
    return this;
  }

  setScore(companyId: string, dimension: string, score: number): this {
    const company = this.companies.get(companyId);
    if (company) {
      company.scores[dimension] = Math.max(0, Math.min(100, score));
    }
    return this;
  }

  build(): CompetitiveMatrix {
    return {
      dimensions: this.dimensions,
      companies: [...this.companies.values()],
    };
  }

  getAverageScore(companyId: string): number {
    const company = this.companies.get(companyId);
    if (!company || this.dimensions.length === 0) return 0;
    const scores = this.dimensions.map(d => company.scores[d] || 0);
    return scores.reduce((sum, s) => sum + s, 0) / scores.length;
  }

  getRanking(): Array<{ id: string; name: string; averageScore: number; rank: number }> {
    const entries = [...this.companies.values()].map(c => ({
      id: c.id,
      name: c.name,
      averageScore: this.getAverageScore(c.id),
      rank: 0,
    }));
    entries.sort((a, b) => b.averageScore - a.averageScore);
    entries.forEach((entry, i) => { entry.rank = i + 1; });
    return entries;
  }

  getGapAnalysis(companyId: string, benchmarkId: string): Array<{ dimension: string; gap: number; status: "ahead" | "behind" | "parity" }> {
    const company = this.companies.get(companyId);
    const benchmark = this.companies.get(benchmarkId);
    if (!company || !benchmark) return [];
    return this.dimensions.map(d => {
      const gap = (company.scores[d] || 0) - (benchmark.scores[d] || 0);
      return {
        dimension: d,
        gap,
        status: gap > 5 ? "ahead" : gap < -5 ? "behind" : "parity",
      };
    });
  }
}

// ─── POSITIONING MAP BUILDER ───────────────────────────────────

export class PositioningMapBuilder {
  private xAxis: { label: string; min: number; max: number };
  private yAxis: { label: string; min: number; max: number };
  private points: PositioningMap["points"] = [];

  constructor(xLabel: string, yLabel: string) {
    this.xAxis = { label: xLabel, min: 0, max: 100 };
    this.yAxis = { label: yLabel, min: 0, max: 100 };
  }

  setXAxis(label: string, min: number, max: number): this {
    this.xAxis = { label, min, max };
    return this;
  }

  setYAxis(label: string, min: number, max: number): this {
    this.yAxis = { label, min, max };
    return this;
  }

  addPoint(companyId: string, companyName: string, x: number, y: number, size: number = 10, color: string = "#059669"): this {
    this.points.push({ companyId, companyName, x, y, size, color });
    return this;
  }

  build(): PositioningMap {
    const quadrants = this.calculateQuadrants();
    return {
      xAxis: this.xAxis,
      yAxis: this.yAxis,
      points: this.points,
      quadrants,
    };
  }

  private calculateQuadrants(): PositioningQuadrant[] {
    const xMid = (this.xAxis.min + this.xAxis.max) / 2;
    const yMid = (this.yAxis.min + this.yAxis.max) / 2;

    const q1 = this.points.filter(p => p.x >= xMid && p.y >= yMid);
    const q2 = this.points.filter(p => p.x < xMid && p.y >= yMid);
    const q3 = this.points.filter(p => p.x < xMid && p.y < yMid);
    const q4 = this.points.filter(p => p.x >= xMid && p.y < yMid);

    return [
      { label: "Leaders", description: `High ${this.xAxis.label}, High ${this.yAxis.label}`, companies: q1.map(p => p.companyName) },
      { label: "Challengers", description: `Low ${this.xAxis.label}, High ${this.yAxis.label}`, companies: q2.map(p => p.companyName) },
      { label: "Followers", description: `Low ${this.xAxis.label}, Low ${this.yAxis.label}`, companies: q3.map(p => p.companyName) },
      { label: "Innovators", description: `High ${this.xAxis.label}, Low ${this.yAxis.label}`, companies: q4.map(p => p.companyName) },
    ];
  }
}

// ─── SWOT GENERATOR ────────────────────────────────────────────

export class SWOTGenerator {
  static generate(
    companyName: string,
    data: {
      positiveArticles: number;
      negativeArticles: number;
      reputationScore: number;
      riskScore: number;
      innovationScore: number;
      marketShare: number;
      competitors: number;
      growthRate: number;
      alerts: number;
      aiVisibility: number;
      esgScore: number;
      financialStability: number;
    }
  ): SWOTAnalysis {
    const strengths: SWOTItem[] = [];
    const weaknesses: SWOTItem[] = [];
    const opportunities: SWOTItem[] = [];
    const threats: SWOTItem[] = [];

    // Strengths
    if (data.reputationScore >= 75) {
      strengths.push({
        title: "Strong Reputation",
        description: `${companyName} has a reputation score of ${data.reputationScore}/100, placing it in the top tier.`,
        impact: "high",
        evidence: [`Reputation score: ${data.reputationScore}/100`, `Positive articles: ${data.positiveArticles}`],
      });
    }
    if (data.innovationScore >= 70) {
      strengths.push({
        title: "Innovation Leadership",
        description: `Innovation score of ${data.innovationScore}/100 indicates strong R&D and digital capabilities.`,
        impact: "high",
        evidence: [`Innovation score: ${data.innovationScore}/100`],
      });
    }
    if (data.marketShare >= 20) {
      strengths.push({
        title: "Significant Market Share",
        description: `Market share of ${data.marketShare}% provides economies of scale and pricing power.`,
        impact: "high",
        evidence: [`Market share: ${data.marketShare}%`],
      });
    }
    if (data.aiVisibility >= 70) {
      strengths.push({
        title: "Strong AI Visibility",
        description: `AI visibility score of ${data.aiVisibility}/100 across 8 LLM engines.`,
        impact: "medium",
        evidence: [`AI visibility: ${data.aiVisibility}/100`],
      });
    }
    if (data.esgScore >= 70) {
      strengths.push({
        title: "ESG Excellence",
        description: `ESG score of ${data.esgScore}/100 demonstrates sustainability commitment.`,
        impact: "medium",
        evidence: [`ESG score: ${data.esgScore}/100`],
      });
    }
    if (data.financialStability >= 75) {
      strengths.push({
        title: "Financial Stability",
        description: `Financial stability score of ${data.financialStability}/100 indicates strong fundamentals.`,
        impact: "high",
        evidence: [`Financial stability: ${data.financialStability}/100`],
      });
    }

    // Weaknesses
    if (data.reputationScore < 60) {
      weaknesses.push({
        title: "Reputation Vulnerability",
        description: `Reputation score of ${data.reputationScore}/100 is below industry average.`,
        impact: "high",
        evidence: [`Reputation score: ${data.reputationScore}/100`, `Negative articles: ${data.negativeArticles}`],
      });
    }
    if (data.riskScore >= 60) {
      weaknesses.push({
        title: "Elevated Risk Profile",
        description: `Risk score of ${data.riskScore}/100 indicates significant exposure across risk categories.`,
        impact: "high",
        evidence: [`Risk score: ${data.riskScore}/100`, `Active alerts: ${data.alerts}`],
      });
    }
    if (data.innovationScore < 50) {
      weaknesses.push({
        title: "Innovation Gap",
        description: `Innovation score of ${data.innovationScore}/100 suggests lagging digital transformation.`,
        impact: "medium",
        evidence: [`Innovation score: ${data.innovationScore}/100`],
      });
    }
    if (data.marketShare < 10) {
      weaknesses.push({
        title: "Limited Market Share",
        description: `Market share of ${data.marketShare}% limits economies of scale.`,
        impact: "medium",
        evidence: [`Market share: ${data.marketShare}%`],
      });
    }
    if (data.aiVisibility < 50) {
      weaknesses.push({
        title: "Low AI Visibility",
        description: `AI visibility score of ${data.aiVisibility}/100 — brand is underrepresented in AI responses.`,
        impact: "medium",
        evidence: [`AI visibility: ${data.aiVisibility}/100`],
      });
    }
    if (data.esgScore < 50) {
      weaknesses.push({
        title: "ESG Deficit",
        description: `ESG score of ${data.esgScore}/100 may deter ESG-focused investors.`,
        impact: "medium",
        evidence: [`ESG score: ${data.esgScore}/100`],
      });
    }

    // Opportunities
    if (data.growthRate > 5) {
      opportunities.push({
        title: "Market Growth",
        description: `Industry growth rate of ${data.growthRate}% presents expansion opportunities.`,
        impact: "high",
        evidence: [`Growth rate: ${data.growthRate}%`],
      });
    }
    if (data.aiVisibility < 70) {
      opportunities.push({
        title: "AI Visibility Improvement",
        description: `Current AI visibility of ${data.aiVisibility}/100 can be improved through targeted content strategy.`,
        impact: "medium",
        evidence: [`AI visibility: ${data.aiVisibility}/100 (room for improvement)`],
      });
    }
    if (data.esgScore < 70) {
      opportunities.push({
        title: "ESG Enhancement",
        description: `Improving ESG score from ${data.esgScore}/100 can attract sustainability-focused investors.`,
        impact: "medium",
        evidence: [`ESG score: ${data.esgScore}/100`],
      });
    }
    opportunities.push({
      title: "Digital Transformation",
      description: "Investing in AI/ML capabilities can improve operational efficiency and customer experience.",
      impact: "high",
      evidence: ["Industry trend: AI adoption accelerating"],
    });
    opportunities.push({
      title: "Pan-African Expansion",
      description: "Moroccan companies have a unique positioning to expand into francophone African markets.",
      impact: "medium",
      evidence: ["Africa: fastest growing continent", "Morocco: gateway to Africa"],
    });

    // Threats
    if (data.competitors > 5) {
      threats.push({
        title: "Intense Competition",
        description: `${data.competitors} direct competitors create pricing pressure and market share erosion risk.`,
        impact: "high",
        evidence: [`Competitors: ${data.competitors}`],
      });
    }
    if (data.negativeArticles > 50) {
      threats.push({
        title: "Negative Media Coverage",
        description: `${data.negativeArticles} negative articles detected — risk of narrative shift.`,
        impact: "high",
        evidence: [`Negative articles: ${data.negativeArticles}`],
      });
    }
    if (data.alerts > 10) {
      threats.push({
        title: "Active Alert Volume",
        description: `${data.alerts} active alerts require immediate attention.`,
        impact: "medium",
        evidence: [`Active alerts: ${data.alerts}`],
      });
    }
    threats.push({
      title: "Regulatory Pressure",
      description: "Increasing regulatory requirements (AMMC, BAM, CNDP) may increase compliance costs.",
      impact: "medium",
      evidence: ["AMMC: new ESG reporting requirements", "BAM: open banking mandates", "CNDP: AI data protection guidelines"],
    });
    threats.push({
      title: "Geopolitical Risk",
      description: "Regional instability and global trade tensions may impact operations.",
      impact: "medium",
      evidence: ["MENA region: political uncertainty", "Global: trade tensions"],
    });

    const summary = `${companyName} SWOT Analysis: ${strengths.length} strengths, ${weaknesses.length} weaknesses, ${opportunities.length} opportunities, ${threats.length} threats. Overall position: ${data.reputationScore >= 70 ? "Strong" : data.reputationScore >= 50 ? "Moderate" : "Vulnerable"}.`;

    return { strengths, weaknesses, opportunities, threats, summary };
  }
}

// ─── MARKET SHARE CALCULATOR ───────────────────────────────────

export class MarketShareCalculator {
  static calculateRevenueShare(companies: Array<{ id: string; name: string; revenue: number }>): MarketShareData[] {
    const total = companies.reduce((sum, c) => sum + c.revenue, 0);
    if (total === 0) return [];
    return companies
      .map(c => ({
        companyId: c.id,
        companyName: c.name,
        share: (c.revenue / total) * 100,
        trend: "stable" as const,
        changePct: 0,
      }))
      .sort((a, b) => b.share - a.share);
  }

  static calculateVolumeShare(companies: Array<{ id: string; name: string; volume: number }>): MarketShareData[] {
    const total = companies.reduce((sum, c) => sum + c.volume, 0);
    if (total === 0) return [];
    return companies
      .map(c => ({
        companyId: c.id,
        companyName: c.name,
        share: (c.volume / total) * 100,
        trend: "stable" as const,
        changePct: 0,
      }))
      .sort((a, b) => b.share - a.share);
  }

  static calculateSentimentShare(companies: Array<{ id: string; name: string; positiveMentions: number; totalMentions: number }>): MarketShareData[] {
    const totalPositive = companies.reduce((sum, c) => sum + c.positiveMentions, 0);
    if (totalPositive === 0) return [];
    return companies
      .map(c => ({
        companyId: c.id,
        companyName: c.name,
        share: (c.positiveMentions / totalPositive) * 100,
        trend: "stable" as const,
        changePct: 0,
      }))
      .sort((a, b) => b.share - a.share);
  }

  static calculateShareWithTrend(
    current: Array<{ id: string; name: string; share: number }>,
    previous: Array<{ id: string; name: string; share: number }>
  ): MarketShareData[] {
    return current.map(c => {
      const prev = previous.find(p => p.id === c.id);
      const changePct = prev ? ((c.share - prev.share) / prev.share) * 100 : 0;
      return {
        companyId: c.id,
        companyName: c.name,
        share: c.share,
        trend: changePct > 2 ? "gaining" : changePct < -2 ? "losing" : "stable",
        changePct,
      };
    });
  }

  static calculateHHI(shares: number[]): number {
    return shares.reduce((sum, s) => sum + (s * s), 0);
  }

  static getMarketConcentration(hhi: number): "unconcentrated" | "moderately_concentrated" | "highly_concentrated" {
    if (hhi < 1500) return "unconcentrated";
    if (hhi < 2500) return "moderately_concentrated";
    return "highly_concentrated";
  }
}

// ─── INDUSTRY BENCHMARKING ─────────────────────────────────────

export class IndustryBenchmarking {
  static benchmark(
    companyMetrics: Record<string, number>,
    industryData: Array<Record<string, number>>,
    metrics: string[]
  ): IndustryBenchmark[] {
    return metrics.map(metric => {
      const companyValue = companyMetrics[metric] || 0;
      const industryValues = industryData.map(d => d[metric] || 0).filter(v => v !== 0);
      if (industryValues.length === 0) {
        return {
          metric,
          companyValue,
          industryAverage: 0,
          industryMedian: 0,
          industryMax: 0,
          industryMin: 0,
          percentile: 0,
          trend: "at" as const,
        };
      }
      const avg = industryValues.reduce((sum, v) => sum + v, 0) / industryValues.length;
      const sorted = [...industryValues].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      const max = Math.max(...industryValues);
      const min = Math.min(...industryValues);
      const belowCount = industryValues.filter(v => v < companyValue).length;
      const percentile = (belowCount / industryValues.length) * 100;
      const trend: "above" | "at" | "below" = companyValue > avg * 1.1 ? "above" : companyValue < avg * 0.9 ? "below" : "at";
      return {
        metric,
        companyValue,
        industryAverage: avg,
        industryMedian: median,
        industryMax: max,
        industryMin: min,
        percentile,
        trend,
      };
    });
  }

  static getPercentileRank(value: number, allValues: number[]): number {
    const sorted = [...allValues].sort((a, b) => a - b);
    const below = sorted.filter(v => v < value).length;
    return (below / sorted.length) * 100;
  }

  static getZScore(value: number, mean: number, stdDev: number): number {
    if (stdDev === 0) return 0;
    return (value - mean) / stdDev;
  }

  static normalize(value: number, min: number, max: number): number {
    if (max === min) return 0.5;
    return (value - min) / (max - min);
  }
}

// ─── THREAT ASSESSMENT ─────────────────────────────────────────

export class ThreatAssessor {
  static assess(competitor: CompetitorProfile): ThreatAssessment {
    const factors: ThreatFactor[] = [];

    factors.push({
      factor: "Market Position",
      weight: 0.25,
      score: competitor.strategy === "market_leader" ? 90 : competitor.strategy === "challenger" ? 70 : competitor.strategy === "disruptor" ? 80 : 40,
      description: `Competitor strategy: ${competitor.strategy}`,
    });

    factors.push({
      factor: "Innovation Capability",
      weight: 0.20,
      score: competitor.strengths.length * 15,
      description: `${competitor.strengths.length} identified strengths`,
    });

    factors.push({
      factor: "Resource Advantage",
      weight: 0.20,
      score: competitor.revenue ? Math.min(100, competitor.revenue / 10000000) : 30,
      description: competitor.revenue ? `Revenue: $${competitor.revenue.toLocaleString()}` : "Revenue unknown",
    });

    factors.push({
      factor: "Market Share",
      weight: 0.15,
      score: competitor.marketShare ? competitor.marketShare * 5 : 20,
      description: competitor.marketShare ? `Market share: ${competitor.marketShare}%` : "Market share unknown",
    });

    factors.push({
      factor: "Brand Strength",
      weight: 0.10,
      score: competitor.positioning === "premium" ? 80 : competitor.positioning === "mainstream" ? 60 : 40,
      description: `Positioning: ${competitor.positioning}`,
    });

    factors.push({
      factor: "Agility & Speed",
      weight: 0.10,
      score: competitor.employees ? (competitor.employees < 500 ? 80 : competitor.employees < 2000 ? 60 : 40) : 50,
      description: competitor.employees ? `${competitor.employees} employees` : "Size unknown",
    });

    const weightedScore = factors.reduce((sum, f) => sum + f.score * f.weight, 0);
    const level: ThreatAssessment["level"] = weightedScore >= 75 ? "critical" : weightedScore >= 55 ? "high" : weightedScore >= 35 ? "medium" : "low";

    return { level, score: Math.round(weightedScore), factors };
  }

  static assessMultiple(competitors: CompetitorProfile[]): Array<{ competitor: CompetitorProfile; threat: ThreatAssessment }> {
    return competitors.map(c => ({ competitor: c, threat: this.assess(c) }))
      .sort((a, b) => b.threat.score - a.threat.score);
  }

  static getTopThreats(competitors: CompetitorProfile[], limit: number = 5): Array<{ competitor: CompetitorProfile; threat: ThreatAssessment }> {
    return this.assessMultiple(competitors).slice(0, limit);
  }
}

// ─── OPPORTUNITY SCANNER ───────────────────────────────────────

export class OpportunityScanner {
  static scan(
    marketData: {
      segments: Array<{ name: string; size: number; growthRate: number; competition: "none" | "low" | "medium" | "high" }>;
      trends: Array<{ name: string; momentum: number; timeToMainstream: string }>;
      competitorWeaknesses: Array<{ competitor: string; weakness: string; severity: "high" | "medium" | "low" }>;
      regulatoryChanges: Array<{ title: string; impact: "positive" | "negative" | "neutral"; timeline: string }>;
      technologyShifts: Array<{ technology: string; adoptionRate: number; disruptionPotential: number }>;
    }
  ): MarketOpportunity[] {
    const opportunities: MarketOpportunity[] = [];
    let id = 1;

    // Market gaps (underserved segments)
    for (const segment of marketData.segments) {
      if (segment.competition === "none" || segment.competition === "low") {
        const feasibilityScore = segment.competition === "none" ? 90 : 70;
        const attractivenessScore = (segment.growthRate * 0.4 + (segment.size / 1000000) * 0.3 + feasibilityScore * 0.3);
        opportunities.push({
          id: `opp-${id++}`,
          title: `Underserved Segment: ${segment.name}`,
          description: `The ${segment.name} segment has ${segment.competition} competition with a market size of $${segment.size.toLocaleString()} and ${segment.growthRate}% growth rate.`,
          type: "underserved_segment",
          marketSize: segment.size,
          growthRate: segment.growthRate,
          timeToMarket: "6-12 months",
          competition: segment.competition,
          feasibilityScore,
          attractivenessScore,
          priority: attractivenessScore * 0.6 + feasibilityScore * 0.4,
        });
      }
    }

    // Emerging trends
    for (const trend of marketData.trends) {
      if (trend.momentum > 60) {
        opportunities.push({
          id: `opp-${id++}`,
          title: `Emerging Trend: ${trend.name}`,
          description: `${trend.name} is gaining momentum (${trend.momentum}%) with expected mainstream adoption in ${trend.timeToMainstream}.`,
          type: "emerging_trend",
          marketSize: 0,
          growthRate: trend.momentum,
          timeToMarket: trend.timeToMainstream,
          competition: "low",
          feasibilityScore: 65,
          attractivenessScore: trend.momentum,
          priority: trend.momentum * 0.7 + 65 * 0.3,
        });
      }
    }

    // Competitor weaknesses
    for (const weakness of marketData.competitorWeaknesses) {
      if (weakness.severity === "high") {
        opportunities.push({
          id: `opp-${id++}`,
          title: `Exploit ${weakness.competitor} Weakness: ${weakness.weakness}`,
          description: `${weakness.competitor} has a high-severity weakness in ${weakness.weakness}. Targeting this area could capture market share.`,
          type: "competitive_weakness",
          marketSize: 0,
          growthRate: 0,
          timeToMarket: "3-6 months",
          competition: "low",
          feasibilityScore: 80,
          attractivenessScore: 75,
          priority: 80 * 0.5 + 75 * 0.5,
        });
      }
    }

    // Regulatory changes (positive)
    for (const reg of marketData.regulatoryChanges) {
      if (reg.impact === "positive") {
        opportunities.push({
          id: `opp-${id++}`,
          title: `Regulatory Opportunity: ${reg.title}`,
          description: `Regulatory change "${reg.title}" creates new opportunities. Timeline: ${reg.timeline}.`,
          type: "regulatory_change",
          marketSize: 0,
          growthRate: 0,
          timeToMarket: reg.timeline,
          competition: "low",
          feasibilityScore: 70,
          attractivenessScore: 65,
          priority: 70 * 0.5 + 65 * 0.5,
        });
      }
    }

    // Technology shifts
    for (const tech of marketData.technologyShifts) {
      if (tech.disruptionPotential > 60) {
        opportunities.push({
          id: `opp-${id++}`,
          title: `Technology Disruption: ${tech.technology}`,
          description: `${tech.technology} has ${tech.adoptionRate}% adoption and ${tech.disruptionPotential}% disruption potential.`,
          type: "technology_shift",
          marketSize: 0,
          growthRate: tech.adoptionRate,
          timeToMarket: "12-24 months",
          competition: "medium",
          feasibilityScore: 55,
          attractivenessScore: tech.disruptionPotential,
          priority: tech.disruptionPotential * 0.6 + 55 * 0.4,
        });
      }
    }

    return opportunities.sort((a, b) => b.priority - a.priority);
  }

  static getTopOpportunities(opportunities: MarketOpportunity[], limit: number = 10): MarketOpportunity[] {
    return [...opportunities].sort((a, b) => b.priority - a.priority).slice(0, limit);
  }
}

// ─── STRATEGIC RECOMMENDATION ENGINE ──────────────────────────

export class StrategicRecommendationEngine {
  static generate(
    companyName: string,
    data: {
      swot: SWOTAnalysis;
      threats: Array<{ competitor: string; threat: ThreatAssessment }>;
      opportunities: MarketOpportunity[];
      benchmarks: IndustryBenchmark[];
      marketShare: number;
      reputationScore: number;
    }
  ): StrategicRecommendation[] {
    const recommendations: StrategicRecommendation[] = [];
    let id = 1;

    // Defensive recommendations based on threats
    const criticalThreats = data.threats.filter(t => t.threat.level === "critical");
    if (criticalThreats.length > 0) {
      recommendations.push({
        id: `rec-${id++}`,
        priority: "critical",
        category: "defensive",
        title: `Counter ${criticalThreats[0].competitor} threat`,
        description: `Develop a targeted defensive strategy against ${criticalThreats[0].competitor} who poses a critical threat (score: ${criticalThreats[0].threat.score}/100).`,
        rationale: `${criticalThreats[0].competitor} has been identified as a critical threat based on market position, innovation, and resource advantage.`,
        timeline: "0-3 months",
        expectedImpact: "Stabilize market position and prevent share erosion",
        resourceRequirement: "high",
        riskLevel: "medium",
        successMetrics: ["Maintain or increase market share", "Reduce threat score by 15%", "Increase defensive patent filings"],
      });
    }

    // Offensive recommendations based on opportunities
    const topOpportunities = data.opportunities.slice(0, 3);
    for (const opp of topOpportunities) {
      recommendations.push({
        id: `rec-${id++}`,
        priority: opp.priority > 70 ? "high" : opp.priority > 50 ? "medium" : "low",
        category: "offensive",
        title: `Pursue: ${opp.title}`,
        description: opp.description,
        rationale: `Opportunity priority score: ${opp.priority.toFixed(0)}/100. Type: ${opp.type}.`,
        timeline: opp.timeToMarket,
        expectedImpact: `Capture ${opp.type === "underserved_segment" ? "$" + opp.marketSize.toLocaleString() + " market" : "emerging market position"}`,
        resourceRequirement: opp.feasibilityScore > 75 ? "low" : opp.feasibilityScore > 50 ? "medium" : "high",
        riskLevel: opp.competition === "none" ? "low" : opp.competition === "low" ? "low" : "medium",
        successMetrics: ["Achieve target market penetration", "Generate revenue within timeline", "Establish competitive moat"],
      });
    }

    // Strategic recommendations based on SWOT
    if (data.swot.weaknesses.length > 0) {
      const topWeakness = data.swot.weaknesses[0];
      recommendations.push({
        id: `rec-${id++}`,
        priority: topWeakness.impact === "high" ? "high" : "medium",
        category: "strategic",
        title: `Address: ${topWeakness.title}`,
        description: topWeakness.description,
        rationale: `This weakness has ${topWeakness.impact} impact on ${companyName}'s competitive position.`,
        timeline: "3-6 months",
        expectedImpact: "Improve competitive position and reduce vulnerability",
        resourceRequirement: "medium",
        riskLevel: "low",
        successMetrics: [`Improve ${topWeakness.title.toLowerCase()} score by 20%`, "Reduce related alerts by 50%"],
      });
    }

    // Innovation recommendations
    if (data.reputationScore < 70) {
      recommendations.push({
        id: `rec-${id++}`,
        priority: "high",
        category: "innovation",
        title: "Invest in AI/ML capabilities",
        description: "Develop or acquire AI-powered analytics capabilities to improve reputation intelligence and operational efficiency.",
        rationale: "Current reputation score indicates need for improved monitoring and response capabilities.",
        timeline: "6-12 months",
        expectedImpact: "Improve reputation score by 15-20 points",
        resourceRequirement: "high",
        riskLevel: "medium",
        successMetrics: ["Reputation score > 80", "AI visibility score > 75", "Reduce negative article count by 30%"],
      });
    }

    // Partnership recommendations
    recommendations.push({
      id: `rec-${id++}`,
      priority: "medium",
      category: "partnership",
      title: "Explore strategic partnerships",
      description: "Identify and pursue partnerships with complementary technology providers, media outlets, or industry associations.",
      rationale: "Partnerships can expand reach, enhance capabilities, and create competitive barriers.",
      timeline: "3-9 months",
      expectedImpact: "Expand market reach by 15-25%",
      resourceRequirement: "medium",
      riskLevel: "low",
      successMetrics: ["Sign 2+ strategic partnerships", "Increase media reach by 20%", "Access new market segments"],
    });

    // Acquisition recommendations
    if (data.marketShare < 15) {
      recommendations.push({
        id: `rec-${id++}`,
        priority: "medium",
        category: "acquisition",
        title: "Evaluate acquisition targets",
        description: "Identify acquisition targets in complementary segments to accelerate market share growth.",
        rationale: `Current market share of ${data.marketShare}% can be accelerated through strategic acquisitions.`,
        timeline: "6-18 months",
        expectedImpact: "Increase market share by 5-10%",
        resourceRequirement: "high",
        riskLevel: "high",
        successMetrics: ["Complete 1 acquisition", "Increase market share by 5%+", "Achieve synergy targets within 12 months"],
      });
    }

    // Benchmarking recommendations
    const belowBenchmarks = data.benchmarks.filter(b => b.trend === "below");
    if (belowBenchmarks.length > 0) {
      recommendations.push({
        id: `rec-${id++}`,
        priority: "high",
        category: "operational",
        title: `Close performance gaps in ${belowBenchmarks.length} metrics`,
        description: `Below industry average in: ${belowBenchmarks.map(b => b.metric).join(", ")}.`,
        rationale: `Performance gaps identified through industry benchmarking.`,
        timeline: "3-12 months",
        expectedImpact: "Reach industry average or above on all metrics",
        resourceRequirement: "medium",
        riskLevel: "low",
        successMetrics: belowBenchmarks.map(b => `Improve ${b.metric} to >= ${b.industryAverage.toFixed(0)}`),
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  static getTopRecommendations(recommendations: StrategicRecommendation[], limit: number = 10): StrategicRecommendation[] {
    return recommendations.slice(0, limit);
  }

  static getRecommendationsByCategory(recommendations: StrategicRecommendation[], category: StrategicRecommendation["category"]): StrategicRecommendation[] {
    return recommendations.filter(r => r.category === category);
  }

  static getRecommendationsByPriority(recommendations: StrategicRecommendation[], priority: StrategicRecommendation["priority"]): StrategicRecommendation[] {
    return recommendations.filter(r => r.priority === priority);
  }
}

// ─── MARKET TIMELINE BUILDER ───────────────────────────────────

export class MarketTimelineBuilder {
  private events: MarketEvent[] = [];
  private milestones: Array<{ date: string; title: string; description: string }> = [];
  private trends: Array<{ period: string; trend: string; direction: "up" | "down" | "stable" }> = [];

  addEvent(event: MarketEvent): this {
    this.events.push(event);
    return this;
  }

  addMilestone(date: string, title: string, description: string): this {
    this.milestones.push({ date, title, description });
    return this;
  }

  addTrend(period: string, trend: string, direction: "up" | "down" | "stable"): this {
    this.trends.push({ period, trend, direction });
    return this;
  }

  build(): MarketTimeline {
    return {
      events: [...this.events].sort((a, b) => b.date.localeCompare(a.date)),
      milestones: [...this.milestones].sort((a, b) => b.date.localeCompare(a.date)),
      trends: [...this.trends],
    };
  }

  getEventsByType(type: MarketEvent["type"]): MarketEvent[] {
    return this.events.filter(e => e.type === type);
  }

  getEventsByImpact(impact: MarketEvent["impact"]): MarketEvent[] {
    return this.events.filter(e => e.impact === impact);
  }

  getEventsByCompany(company: string): MarketEvent[] {
    return this.events.filter(e => e.company === company || e.affectedCompanies.includes(company));
  }

  getEventsByDateRange(start: string, end: string): MarketEvent[] {
    return this.events.filter(e => e.date >= start && e.date <= end);
  }

  getHighImpactEvents(): MarketEvent[] {
    return this.events.filter(e => e.impact === "high" || e.impact === "transformative");
  }

  getEventStats(): {
    total: number;
    byType: Record<string, number>;
    byImpact: Record<string, number>;
    averageSentiment: number;
  } {
    const byType: Record<string, number> = {};
    const byImpact: Record<string, number> = {};
    let totalSentiment = 0;

    for (const event of this.events) {
      byType[event.type] = (byType[event.type] || 0) + 1;
      byImpact[event.impact] = (byImpact[event.impact] || 0) + 1;
      totalSentiment += event.sentimentScore;
    }

    return {
      total: this.events.length,
      byType,
      byImpact,
      averageSentiment: this.events.length > 0 ? totalSentiment / this.events.length : 0,
    };
  }
}

// ─── COMPETITIVE INTELLIGENCE ENGINE ───────────────────────────

export class CompetitiveIntelligenceEngine {
  private competitors: Map<string, CompetitorProfile> = new Map();
  private matrix: CompetitiveMatrixBuilder;
  private positioning: PositioningMapBuilder;
  private timeline: MarketTimelineBuilder;

  constructor() {
    this.matrix = new CompetitiveMatrixBuilder();
    this.positioning = new PositioningMapBuilder("Innovation", "Market Share");
    this.timeline = new MarketTimelineBuilder();
  }

  addCompetitor(profile: CompetitorProfile): this {
    this.competitors.set(profile.id, profile);
    this.matrix.addCompany(profile.id, profile.name);
    this.positioning.addPoint(profile.id, profile.name, 50, 50, 10, "#059669");
    return this;
  }

  getCompetitor(id: string): CompetitorProfile | undefined {
    return this.competitors.get(id);
  }

  getAllCompetitors(): CompetitorProfile[] {
    return [...this.competitors.values()];
  }

  getCompetitorCount(): number {
    return this.competitors.size;
  }

  assessThreats(): Array<{ competitor: CompetitorProfile; threat: ThreatAssessment }> {
    return ThreatAssessor.assessMultiple(this.getAllCompetitors());
  }

  getTopThreats(limit: number = 5): Array<{ competitor: CompetitorProfile; threat: ThreatAssessment }> {
    return ThreatAssessor.getTopThreats(this.getAllCompetitors(), limit);
  }

  getMatrix(): CompetitiveMatrix {
    return this.matrix.build();
  }

  getPositioning(): PositioningMap {
    return this.positioning.build();
  }

  getTimeline(): MarketTimeline {
    return this.timeline.build();
  }

  generateSWOT(companyName: string, data: Parameters<typeof SWOTGenerator.generate>[1]): SWOTAnalysis {
    return SWOTGenerator.generate(companyName, data);
  }

  scanOpportunities(marketData: Parameters<typeof OpportunityScanner.scan>[0]): MarketOpportunity[] {
    return OpportunityScanner.scan(marketData);
  }

  generateRecommendations(companyName: string, data: Parameters<typeof StrategicRecommendationEngine.generate>[1]): StrategicRecommendation[] {
    return StrategicRecommendationEngine.generate(companyName, data);
  }

  benchmark(metrics: string[], companyMetrics: Record<string, number>, industryData: Array<Record<string, number>>): IndustryBenchmark[] {
    return IndustryBenchmarking.benchmark(companyMetrics, industryData, metrics);
  }

  calculateMarketShare(companies: Array<{ id: string; name: string; revenue: number }>): MarketShareData[] {
    return MarketShareCalculator.calculateRevenueShare(companies);
  }

  getSummary(): {
    competitorCount: number;
    topThreat?: { competitor: string; score: number };
    matrixDimensions: number;
    timelineEvents: number;
    averageThreatScore: number;
  } {
    const threats = this.assessThreats();
    const avgScore = threats.length > 0 ? threats.reduce((sum, t) => sum + t.threat.score, 0) / threats.length : 0;
    return {
      competitorCount: this.competitors.size,
      topThreat: threats.length > 0 ? { competitor: threats[0].competitor.name, score: threats[0].threat.score } : undefined,
      matrixDimensions: this.matrix.build().dimensions.length,
      timelineEvents: this.timeline.build().events.length,
      averageThreatScore: avgScore,
    };
  }
}

// ─── FACTORY FUNCTIONS ─────────────────────────────────────────

export function createCompetitiveIntelligenceEngine(): CompetitiveIntelligenceEngine {
  return new CompetitiveIntelligenceEngine();
}

export function createSWOTGenerator(): typeof SWOTGenerator {
  return SWOTGenerator;
}

export function createMarketShareCalculator(): typeof MarketShareCalculator {
  return MarketShareCalculator;
}

export function createThreatAssessor(): typeof ThreatAssessor {
  return ThreatAssessor;
}

export function createOpportunityScanner(): typeof OpportunityScanner {
  return OpportunityScanner;
}

export function createStrategicRecommendationEngine(): typeof StrategicRecommendationEngine {
  return StrategicRecommendationEngine;
}

export function createMarketTimelineBuilder(): MarketTimelineBuilder {
  return new MarketTimelineBuilder();
}

export function createCompetitiveMatrixBuilder(): CompetitiveMatrixBuilder {
  return new CompetitiveMatrixBuilder();
}

export function createPositioningMapBuilder(xLabel: string = "Innovation", yLabel: string = "Market Share"): PositioningMapBuilder {
  return new PositioningMapBuilder(xLabel, yLabel);
}

// ─── CONSTANTS ─────────────────────────────────────────────────

export const STRATEGY_DESCRIPTIONS: Record<CompetitorStrategy, string> = {
  market_leader: "Dominant market position with largest share and brand recognition",
  challenger: "Aggressive competitor seeking to overtake the market leader",
  follower: "Follows market leader's strategy with slight differentiation",
  nichers: "Focuses on a specific market segment with specialized offerings",
  disruptor: "Challenges established players with innovative business models",
  diversified: "Operates across multiple segments with varied offerings",
  innovator: "Leads in technology and product innovation",
  cost_leader: "Competes on lowest cost structure and operational efficiency",
};

export const POSITIONING_DESCRIPTIONS: Record<MarketPosition, string> = {
  premium: "High-quality, high-price positioning targeting affluent customers",
  mainstream: "Mid-market positioning appealing to the broad customer base",
  value: "Good quality at competitive prices",
  budget: "Lowest-cost option targeting price-sensitive customers",
  luxury: "Exclusive, aspirational positioning",
  specialist: "Deep expertise in a narrow domain",
  generalist: "Broad capabilities across multiple domains",
};

export const THREAT_LEVEL_COLORS: Record<ThreatAssessment["level"], string> = {
  low: "#059669",
  medium: "#D97706",
  high: "#DC2626",
  critical: "#7F1D1D",
};

export const IMPACT_LABELS: Record<MarketEvent["impact"], string> = {
  minimal: "Minimal Impact",
  low: "Low Impact",
  moderate: "Moderate Impact",
  high: "High Impact",
  transformative: "Transformative",
};

export const OPPORTUNITY_TYPE_LABELS: Record<MarketOpportunity["type"], string> = {
  market_gap: "Market Gap",
  underserved_segment: "Underserved Segment",
  emerging_trend: "Emerging Trend",
  technology_shift: "Technology Shift",
  regulatory_change: "Regulatory Change",
  competitive_weakness: "Competitive Weakness",
};

export const RECOMMENDATION_PRIORITY_COLORS: Record<StrategicRecommendation["priority"], string> = {
  critical: "#7F1D1D",
  high: "#DC2626",
  medium: "#D97706",
  low: "#059669",
};

export const RECOMMENDATION_CATEGORY_LABELS: Record<StrategicRecommendation["category"], string> = {
  offensive: "Offensive Strategy",
  defensive: "Defensive Strategy",
  strategic: "Strategic Initiative",
  operational: "Operational Improvement",
  innovation: "Innovation Investment",
  partnership: "Partnership Opportunity",
  acquisition: "Acquisition Target",
};

// ─── HELPER FUNCTIONS ──────────────────────────────────────────

export function getCompetitorStrategyLabel(strategy: CompetitorStrategy): string {
  return STRATEGY_DESCRIPTIONS[strategy] || strategy;
}

export function getPositioningLabel(position: MarketPosition): string {
  return POSITIONING_DESCRIPTIONS[position] || position;
}

export function getThreatColor(level: ThreatAssessment["level"]): string {
  return THREAT_LEVEL_COLORS[level] || "#737373";
}

export function getImpactLabel(impact: MarketEvent["impact"]): string {
  return IMPACT_LABELS[impact] || impact;
}

export function getOpportunityTypeLabel(type: MarketOpportunity["type"]): string {
  return OPPORTUNITY_TYPE_LABELS[type] || type;
}

export function getRecommendationPriorityColor(priority: StrategicRecommendation["priority"]): string {
  return RECOMMENDATION_PRIORITY_COLORS[priority] || "#737373";
}

export function getRecommendationCategoryLabel(category: StrategicRecommendation["category"]): string {
  return RECOMMENDATION_CATEGORY_LABELS[category] || category;
}

export function formatMarketSize(size: number): string {
  if (size >= 1e9) return `$${(size / 1e9).toFixed(1)}B`;
  if (size >= 1e6) return `$${(size / 1e6).toFixed(1)}M`;
  if (size >= 1e3) return `$${(size / 1e3).toFixed(1)}K`;
  return `$${size}`;
}

export function formatGrowthRate(rate: number): string {
  return `${rate > 0 ? "+" : ""}${rate.toFixed(1)}%`;
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatScore(score: number, max: number = 100): string {
  return `${score.toFixed(0)}/${max}`;
}

export function getScoreGrade(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 85) return "A";
  if (score >= 80) return "A-";
  if (score >= 75) return "B+";
  if (score >= 70) return "B";
  if (score >= 65) return "B-";
  if (score >= 60) return "C+";
  if (score >= 55) return "C";
  if (score >= 50) return "C-";
  if (score >= 45) return "D+";
  if (score >= 40) return "D";
  return "F";
}

export function getThreatLevelLabel(level: ThreatAssessment["level"]): string {
  const labels: Record<string, string> = {
    low: "Low Threat",
    medium: "Medium Threat",
    high: "High Threat",
    critical: "Critical Threat",
  };
  return labels[level] || level;
}

export function getOpportunityPriorityLabel(priority: number): string {
  if (priority >= 75) return "High Priority";
  if (priority >= 50) return "Medium Priority";
  return "Low Priority";
}

export function getBenchmarkStatus(benchmark: IndustryBenchmark): string {
  if (benchmark.trend === "above") return "Above Industry Average";
  if (benchmark.trend === "below") return "Below Industry Average";
  return "At Industry Average";
}

export function sortRecommendationsByPriority(recommendations: StrategicRecommendation[]): StrategicRecommendation[] {
  const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  return [...recommendations].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

export function sortOpportunitiesByPriority(opportunities: MarketOpportunity[]): MarketOpportunity[] {
  return [...opportunities].sort((a, b) => b.priority - a.priority);
}

export function sortCompetitorsByThreat(competitors: CompetitorProfile[]): CompetitorProfile[] {
  return [...competitors].sort((a, b) => b.threat.score - a.threat.score);
}

export function filterOpportunitiesByType(opportunities: MarketOpportunity[], type: MarketOpportunity["type"]): MarketOpportunity[] {
  return opportunities.filter(o => o.type === type);
}

export function filterRecommendationsByCategory(recommendations: StrategicRecommendation[], category: StrategicRecommendation["category"]): StrategicRecommendation[] {
  return recommendations.filter(r => r.category === category);
}

export function getOpportunityCount(opportunities: MarketOpportunity[]): number {
  return opportunities.length;
}

export function getHighPriorityOpportunityCount(opportunities: MarketOpportunity[]): number {
  return opportunities.filter(o => o.priority >= 75).length;
}

export function getCriticalRecommendationCount(recommendations: StrategicRecommendation[]): number {
  return recommendations.filter(r => r.priority === "critical").length;
}

export function getAverageOpportunityPriority(opportunities: MarketOpportunity[]): number {
  if (opportunities.length === 0) return 0;
  return opportunities.reduce((sum, o) => sum + o.priority, 0) / opportunities.length;
}

export function getAverageThreatScore(competitors: CompetitorProfile[]): number {
  if (competitors.length === 0) return 0;
  return competitors.reduce((sum, c) => sum + c.threat.score, 0) / competitors.length;
}

export function getMarketConcentrationLabel(hhi: number): string {
  const concentration = MarketShareCalculator.getMarketConcentration(hhi);
  if (concentration === "highly_concentrated") return "Highly Concentrated (HHI ≥ 2500)";
  if (concentration === "moderately_concentrated") return "Moderately Concentrated (1500 ≤ HHI < 2500)";
  return "Unconcentrated (HHI < 1500)";
}

export function getSWOTSummary(swot: SWOTAnalysis): string {
  return `${swot.strengths.length}S · ${swot.weaknesses.length}W · ${swot.opportunities.length}O · ${swot.threats.length}T`;
}

export function getTopStrength(swot: SWOTAnalysis): SWOTItem | undefined {
  return swot.strengths.sort((a, b) => {
    const impactOrder = { high: 0, medium: 1, low: 2 };
    return impactOrder[a.impact] - impactOrder[b.impact];
  })[0];
}

export function getTopWeakness(swot: SWOTAnalysis): SWOTItem | undefined {
  return swot.weaknesses.sort((a, b) => {
    const impactOrder = { high: 0, medium: 1, low: 2 };
    return impactOrder[a.impact] - impactOrder[b.impact];
  })[0];
}

export function getTopOpportunity(swot: SWOTAnalysis): SWOTItem | undefined {
  return swot.opportunities.sort((a, b) => {
    const impactOrder = { high: 0, medium: 1, low: 2 };
    return impactOrder[a.impact] - impactOrder[b.impact];
  })[0];
}

export function getTopThreat(swot: SWOTAnalysis): SWOTItem | undefined {
  return swot.threats.sort((a, b) => {
    const impactOrder = { high: 0, medium: 1, low: 2 };
    return impactOrder[a.impact] - impactOrder[b.impact];
  })[0];
}

export function countHighImpactSWOTItems(swot: SWOTAnalysis): number {
  return [...swot.strengths, ...swot.weaknesses, ...swot.opportunities, ...swot.threats]
    .filter(item => item.impact === "high").length;
}

export function getSWOTBalanceScore(swot: SWOTAnalysis): number {
  const strengthWeight = swot.strengths.reduce((sum, s) => sum + (s.impact === "high" ? 3 : s.impact === "medium" ? 2 : 1), 0);
  const weaknessWeight = swot.weaknesses.reduce((sum, w) => sum + (w.impact === "high" ? 3 : w.impact === "medium" ? 2 : 1), 0);
  const opportunityWeight = swot.opportunities.reduce((sum, o) => sum + (o.impact === "high" ? 3 : o.impact === "medium" ? 2 : 1), 0);
  const threatWeight = swot.threats.reduce((sum, t) => sum + (t.impact === "high" ? 3 : t.impact === "medium" ? 2 : 1), 0);
  const positive = strengthWeight + opportunityWeight;
  const negative = weaknessWeight + threatWeight;
  if (positive + negative === 0) return 50;
  return Math.round((positive / (positive + negative)) * 100);
}

export function getCompetitivePositionLabel(score: number): string {
  if (score >= 80) return "Dominant";
  if (score >= 65) return "Strong";
  if (score >= 50) return "Competitive";
  if (score >= 35) return "Vulnerable";
  return "Weak";
}

export function getMarketPositionLabel(share: number): string {
  if (share >= 40) return "Market Leader";
  if (share >= 25) return "Market Challenger";
  if (share >= 15) return "Market Follower";
  if (share >= 5) return "Niche Player";
  return "Marginal Player";
}

export function getTimelineEventColor(event: MarketEvent): string {
  const typeColors: Record<string, string> = {
    product_launch: "#059669",
    acquisition: "#7C3AED",
    partnership: "#0369A1",
    funding: "#D97706",
    regulatory: "#DC2626",
    leadership_change: "#856914",
    market_entry: "#059669",
    market_exit: "#DC2626",
    price_change: "#D97706",
    expansion: "#059669",
    crisis: "#7F1D1D",
    innovation: "#7C3AED",
  };
  return typeColors[event.type] || "#737373";
}

export function getTimelineEventIcon(event: MarketEvent): string {
  const typeIcons: Record<string, string> = {
    product_launch: "🚀",
    acquisition: "🤝",
    partnership: "🤝",
    funding: "💰",
    regulatory: "⚖️",
    leadership_change: "👤",
    market_entry: "🌍",
    market_exit: "🚪",
    price_change: "📊",
    expansion: "📈",
    crisis: "🚨",
    innovation: "💡",
  };
  return typeIcons[event.type] || "📌";
}

export function getImpactColor(impact: MarketEvent["impact"]): string {
  const colors: Record<string, string> = {
    minimal: "#737373",
    low: "#856914",
    moderate: "#D97706",
    high: "#DC2626",
    transformative: "#7F1D1D",
  };
  return colors[impact] || "#737373";
}

export function getRecommendationCategoryIcon(category: StrategicRecommendation["category"]): string {
  const icons: Record<string, string> = {
    offensive: "⚔️",
    defensive: "🛡️",
    strategic: "🎯",
    operational: "⚙️",
    innovation: "💡",
    partnership: "🤝",
    acquisition: "🏢",
  };
  return icons[category] || "📌";
}

export function getOpportunityTypeIcon(type: MarketOpportunity["type"]): string {
  const icons: Record<string, string> = {
    market_gap: "🎯",
    underserved_segment: "👥",
    emerging_trend: "📈",
    technology_shift: "💡",
    regulatory_change: "⚖️",
    competitive_weakness: "🔍",
  };
  return icons[type] || "📌";
}

export function getResourceRequirementLabel(requirement: StrategicRecommendation["resourceRequirement"]): string {
  const labels: Record<string, string> = {
    low: "Low Resources",
    medium: "Medium Resources",
    high: "High Resources",
  };
  return labels[requirement] || requirement;
}

export function getRiskLevelLabel(risk: StrategicRecommendation["riskLevel"]): string {
  const labels: Record<string, string> = {
    low: "Low Risk",
    medium: "Medium Risk",
    high: "High Risk",
  };
  return labels[risk] || risk;
}

export function getCompetitionLabel(competition: MarketOpportunity["competition"]): string {
  const labels: Record<string, string> = {
    none: "No Competition",
    low: "Low Competition",
    medium: "Medium Competition",
    high: "High Competition",
  };
  return labels[competition] || competition;
}

export function calculateOverallCompetitiveScore(
  marketShare: number,
  reputationScore: number,
  innovationScore: number,
  financialStability: number,
  esgScore: number
): number {
  const weights = {
    marketShare: 0.30,
    reputation: 0.25,
    innovation: 0.20,
    financial: 0.15,
    esg: 0.10,
  };
  return Math.round(
    marketShare * weights.marketShare +
    reputationScore * weights.reputation +
    innovationScore * weights.innovation +
    financialStability * weights.financial +
    esgScore * weights.esg
  );
}

export function getCompetitiveScoreLabel(score: number): string {
  if (score >= 80) return "Market Leader";
  if (score >= 65) return "Strong Competitor";
  if (score >= 50) return "Solid Competitor";
  if (score >= 35) return "Vulnerable Competitor";
  return "Weak Competitor";
}

export function calculateMarketAttractiveness(
  marketSize: number,
  growthRate: number,
  competition: MarketOpportunity["competition"],
  feasibility: number
): number {
  const sizeScore = Math.min(100, marketSize / 100000);
  const growthScore = Math.min(100, growthRate * 5);
  const competitionScore = competition === "none" ? 100 : competition === "low" ? 75 : competition === "medium" ? 50 : 25;
  return Math.round(sizeScore * 0.3 + growthScore * 0.3 + competitionScore * 0.2 + feasibility * 0.2);
}

export function getAttractivenessLabel(score: number): string {
  if (score >= 75) return "Highly Attractive";
  if (score >= 50) return "Moderately Attractive";
  if (score >= 25) return "Marginally Attractive";
  return "Not Attractive";
}

export function prioritizeOpportunities(opportunities: MarketOpportunity[]): MarketOpportunity[] {
  return [...opportunities].sort((a, b) => {
    const aAttractiveness = calculateMarketAttractiveness(a.marketSize, a.growthRate, a.competition, a.feasibilityScore);
    const bAttractiveness = calculateMarketAttractiveness(b.marketSize, b.growthRate, b.competition, b.feasibilityScore);
    return bAttractiveness - aAttractiveness;
  });
}

export function getCompetitiveGap(
  companyScores: Record<string, number>,
  benchmarkScores: Record<string, number>
): Array<{ dimension: string; gap: number; percentage: number }> {
  const dimensions = Object.keys(companyScores);
  return dimensions.map(d => {
    const gap = (companyScores[d] || 0) - (benchmarkScores[d] || 0);
    const percentage = benchmarkScores[d] ? (gap / benchmarkScores[d]) * 100 : 0;
    return { dimension: d, gap, percentage };
  }).sort((a, b) => a.gap - b.gap);
}

export function getLargestGaps(
  companyScores: Record<string, number>,
  benchmarkScores: Record<string, number>,
  limit: number = 5
): Array<{ dimension: string; gap: number; percentage: number }> {
  return getCompetitiveGap(companyScores, benchmarkScores)
    .filter(g => g.gap < 0)
    .slice(0, limit);
}

export function getLargestAdvantages(
  companyScores: Record<string, number>,
  benchmarkScores: Record<string, number>,
  limit: number = 5
): Array<{ dimension: string; gap: number; percentage: number }> {
  return getCompetitiveGap(companyScores, benchmarkScores)
    .filter(g => g.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, limit);
}

export function getCompetitiveSummary(
  companyName: string,
  competitors: CompetitorProfile[],
  marketShare: number,
  reputationScore: number,
  overallScore: number
): string {
  const position = getMarketPositionLabel(marketShare);
  const competitiveLabel = getCompetitiveScoreLabel(overallScore);
  const topThreat = ThreatAssessor.getTopThreats(competitors, 1)[0];
  const threatText = topThreat ? ` Top threat: ${topThreat.competitor.name} (${topThreat.threat.score}/100).` : "";
  return `${companyName} is a ${position} with a ${competitiveLabel.toLowerCase()} position (score: ${overallScore}/100). Reputation: ${reputationScore}/100. Tracking ${competitors.length} competitors.${threatText}`;
}

export function getMarketSummary(
  companies: Array<{ name: string; share: number }>,
  totalMarketSize: number
): string {
  const leader = companies[0];
  const hhi = MarketShareCalculator.calculateHHI(companies.map(c => c.share));
  const concentration = MarketShareCalculator.getMarketConcentration(hhi);
  return `Market size: $${(totalMarketSize / 1e9).toFixed(1)}B. ${companies.length} competitors. Market leader: ${leader?.name || "Unknown"} (${leader?.share.toFixed(1) || 0}%). Concentration: ${concentration.replace(/_/g, " ")}.`;
}

export function getOpportunitySummary(opportunities: MarketOpportunity[]): string {
  if (opportunities.length === 0) return "No opportunities identified.";
  const highPriority = opportunities.filter(o => o.priority >= 75).length;
  const avgPriority = getAverageOpportunityPriority(opportunities);
  return `${opportunities.length} opportunities identified. ${highPriority} high-priority. Average priority: ${avgPriority.toFixed(0)}/100.`;
}

export function getRecommendationSummary(recommendations: StrategicRecommendation[]): string {
  if (recommendations.length === 0) return "No recommendations generated.";
  const critical = recommendations.filter(r => r.priority === "critical").length;
  const high = recommendations.filter(r => r.priority === "high").length;
  const offensive = recommendations.filter(r => r.category === "offensive").length;
  const defensive = recommendations.filter(r => r.category === "defensive").length;
  return `${recommendations.length} recommendations: ${critical} critical, ${high} high priority. ${offensive} offensive, ${defensive} defensive.`;
}

export function getThreatSummary(competitors: CompetitorProfile[]): string {
  if (competitors.length === 0) return "No competitors tracked.";
  const threats = ThreatAssessor.assessMultiple(competitors);
  const critical = threats.filter(t => t.threat.level === "critical").length;
  const high = threats.filter(t => t.threat.level === "high").length;
  const avgScore = getAverageThreatScore(competitors);
  return `${competitors.length} competitors tracked. ${critical} critical threats, ${high} high threats. Average threat score: ${avgScore.toFixed(0)}/100.`;
}

export function getSWOTSummaryText(swot: SWOTAnalysis, companyName: string): string {
  const balance = getSWOTBalanceScore(swot);
  const position = balance >= 65 ? "strong" : balance >= 45 ? "balanced" : "vulnerable";
  return `${companyName} has a ${position} strategic position (balance score: ${balance}/100). ${swot.strengths.length} strengths, ${swot.weaknesses.length} weaknesses, ${swot.opportunities.length} opportunities, ${swot.threats.length} threats identified.`;
}

export function getBenchmarkSummary(benchmarks: IndustryBenchmark[]): string {
  if (benchmarks.length === 0) return "No benchmarks available.";
  const above = benchmarks.filter(b => b.trend === "above").length;
  const at = benchmarks.filter(b => b.trend === "at").length;
  const below = benchmarks.filter(b => b.trend === "below").length;
  return `${benchmarks.length} metrics benchmarked. ${above} above average, ${at} at average, ${below} below average.`;
}

export function getTimelineSummary(timeline: MarketTimeline): string {
  const stats = {
    total: timeline.events.length,
    high: timeline.events.filter(e => e.impact === "high" || e.impact === "transformative").length,
  };
  return `${stats.total} events tracked. ${stats.high} high-impact events. ${timeline.milestones.length} milestones. ${timeline.trends.length} trends.`;
}

export function getPositioningSummary(positioning: PositioningMap): string {
  const quadrants = positioning.quadrants;
  const leaders = quadrants[0]?.companies.length || 0;
  const challengers = quadrants[1]?.companies.length || 0;
  const followers = quadrants[2]?.companies.length || 0;
  const innovators = quadrants[3]?.companies.length || 0;
  return `${positioning.points.length} companies mapped. ${leaders} leaders, ${challengers} challengers, ${followers} followers, ${innovators} innovators.`;
}

export function getMatrixSummary(matrix: CompetitiveMatrix): string {
  const rankings = new CompetitiveMatrixBuilder().build();
  return `${matrix.companies.length} companies × ${matrix.dimensions.length} dimensions.`;
}

export function formatTimeline(timeline: MarketTimeline): string {
  const lines: string[] = [];
  lines.push("Market Timeline");
  lines.push("==============");
  lines.push("");
  lines.push(`Events (${timeline.events.length}):`);
  for (const event of timeline.events.slice(0, 10)) {
    lines.push(`  ${event.date} [${event.impact}] ${event.company}: ${event.title}`);
  }
  lines.push("");
  lines.push(`Milestones (${timeline.milestones.length}):`);
  for (const milestone of timeline.milestones.slice(0, 10)) {
    lines.push(`  ${milestone.date}: ${milestone.title}`);
  }
  lines.push("");
  lines.push(`Trends (${timeline.trends.length}):`);
  for (const trend of timeline.trends) {
    lines.push(`  ${trend.period}: ${trend.trend} (${trend.direction})`);
  }
  return lines.join("\n");
}

export function formatSWOT(swot: SWOTAnalysis, companyName: string): string {
  const lines: string[] = [];
  lines.push(`SWOT Analysis: ${companyName}`);
  lines.push("=".repeat(40));
  lines.push("");
  lines.push("STRENGTHS:");
  for (const s of swot.strengths) {
    lines.push(`  [${s.impact.toUpperCase()}] ${s.title}: ${s.description}`);
  }
  lines.push("");
  lines.push("WEAKNESSES:");
  for (const w of swot.weaknesses) {
    lines.push(`  [${w.impact.toUpperCase()}] ${w.title}: ${w.description}`);
  }
  lines.push("");
  lines.push("OPPORTUNITIES:");
  for (const o of swot.opportunities) {
    lines.push(`  [${o.impact.toUpperCase()}] ${o.title}: ${o.description}`);
  }
  lines.push("");
  lines.push("THREATS:");
  for (const t of swot.threats) {
    lines.push(`  [${t.impact.toUpperCase()}] ${t.title}: ${t.description}`);
  }
  lines.push("");
  lines.push(`Summary: ${swot.summary}`);
  return lines.join("\n");
}

export function formatRecommendations(recommendations: StrategicRecommendation[]): string {
  const lines: string[] = [];
  lines.push("Strategic Recommendations");
  lines.push("=".repeat(40));
  lines.push("");
  for (const rec of recommendations) {
    lines.push(`[${rec.priority.toUpperCase()}] ${rec.title}`);
    lines.push(`  Category: ${rec.category}`);
    lines.push(`  Description: ${rec.description}`);
    lines.push(`  Timeline: ${rec.timeline}`);
    lines.push(`  Resources: ${rec.resourceRequirement} | Risk: ${rec.riskLevel}`);
    lines.push("");
  }
  return lines.join("\n");
}

export function formatOpportunities(opportunities: MarketOpportunity[]): string {
  const lines: string[] = [];
  lines.push("Market Opportunities");
  lines.push("=".repeat(40));
  lines.push("");
  for (const opp of opportunities) {
    lines.push(`[${getOpportunityPriorityLabel(opp.priority)}] ${opp.title}`);
    lines.push(`  Type: ${getOpportunityTypeLabel(opp.type)}`);
    lines.push(`  Description: ${opp.description}`);
    lines.push(`  Market Size: ${formatMarketSize(opp.marketSize)} | Growth: ${formatGrowthRate(opp.growthRate)}`);
    lines.push(`  Competition: ${getCompetitionLabel(opp.competition)} | Feasibility: ${opp.feasibilityScore}/100`);
    lines.push("");
  }
  return lines.join("\n");
}

export function formatThreats(threats: Array<{ competitor: CompetitorProfile; threat: ThreatAssessment }>): string {
  const lines: string[] = [];
  lines.push("Threat Assessment");
  lines.push("=".repeat(40));
  lines.push("");
  for (const { competitor, threat } of threats) {
    lines.push(`[${threat.level.toUpperCase()}] ${competitor.name} (Score: ${threat.score}/100)`);
    lines.push(`  Strategy: ${competitor.strategy}`);
    lines.push(`  Positioning: ${competitor.positioning}`);
    for (const factor of threat.factors) {
      lines.push(`  ${factor.factor}: ${factor.score}/100 (weight: ${(factor.weight * 100).toFixed(0)}%) — ${factor.description}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

export function formatBenchmarks(benchmarks: IndustryBenchmark[]): string {
  const lines: string[] = [];
  lines.push("Industry Benchmarks");
  lines.push("=".repeat(40));
  lines.push("");
  for (const b of benchmarks) {
    lines.push(`${b.metric}: ${b.companyValue.toFixed(0)} (industry avg: ${b.industryAverage.toFixed(0)}, percentile: ${b.percentile.toFixed(0)}%) — ${getBenchmarkStatus(b)}`);
  }
  return lines.join("\n");
}

export function formatMarketShare(shares: MarketShareData[]): string {
  const lines: string[] = [];
  lines.push("Market Share Distribution");
  lines.push("=".repeat(40));
  lines.push("");
  for (const s of shares) {
    lines.push(`${s.companyName}: ${s.share.toFixed(1)}% (${s.trend}, ${s.changePct > 0 ? "+" : ""}${s.changePct.toFixed(1)}%)`);
  }
  const hhi = MarketShareCalculator.calculateHHI(shares.map(s => s.share));
  lines.push("");
  lines.push(`HHI: ${hhi.toFixed(0)} — ${getMarketConcentrationLabel(hhi)}`);
  return lines.join("\n");
}

export function formatPositioningMap(positioning: PositioningMap): string {
  const lines: string[] = [];
  lines.push(`Positioning Map: ${positioning.xAxis.label} vs ${positioning.yAxis.label}`);
  lines.push("=".repeat(40));
  lines.push("");
  for (const q of positioning.quadrants) {
    lines.push(`${q.label}: ${q.description}`);
    lines.push(`  Companies: ${q.companies.join(", ") || "None"}`);
    lines.push("");
  }
  return lines.join("\n");
}

export function formatCompetitiveMatrix(matrix: CompetitiveMatrix): string {
  const lines: string[] = [];
  lines.push("Competitive Matrix");
  lines.push("=".repeat(40));
  lines.push("");
  lines.push(`Dimensions: ${matrix.dimensions.join(", ")}`);
  lines.push("");
  for (const company of matrix.companies) {
    lines.push(`${company.name}:`);
    for (const dim of matrix.dimensions) {
      lines.push(`  ${dim}: ${company.scores[dim] || 0}/100`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

export function formatMarketEvent(event: MarketEvent): string {
  return `[${event.date}] ${event.type.toUpperCase()} — ${event.company}: ${event.title} (Impact: ${event.impact})`;
}

export function formatOpportunity(opp: MarketOpportunity): string {
  return `[${getOpportunityPriorityLabel(opp.priority)}] ${opp.title} — Priority: ${opp.priority.toFixed(0)}/100`;
}

export function formatRecommendation(rec: StrategicRecommendation): string {
  return `[${rec.priority.toUpperCase()}] ${rec.title} — ${rec.category} (Timeline: ${rec.timeline})`;
}

export function formatThreat(threat: ThreatAssessment): string {
  return `[${threat.level.toUpperCase()}] Score: ${threat.score}/100 — ${threat.factors.length} factors assessed`;
}

export function formatBenchmark(benchmark: IndustryBenchmark): string {
  return `${benchmark.metric}: ${benchmark.companyValue.toFixed(0)} vs ${benchmark.industryAverage.toFixed(0)} (avg) — ${getBenchmarkStatus(benchmark)}`;
}

export function formatMarketShareItem(share: MarketShareData): string {
  return `${share.companyName}: ${share.share.toFixed(1)}% (${share.trend}, ${share.changePct > 0 ? "+" : ""}${share.changePct.toFixed(1)}%)`;
}

export function formatSWOTItem(item: SWOTItem): string {
  return `[${item.impact.toUpperCase()}] ${item.title}: ${item.description}`;
}

export function formatCompetitorProfile(profile: CompetitorProfile): string {
  const lines: string[] = [];
  lines.push(`${profile.name} (${profile.slug})`);
  lines.push(`  Sector: ${profile.sector}`);
  lines.push(`  Strategy: ${profile.strategy}`);
  lines.push(`  Positioning: ${profile.positioning}`);
  lines.push(`  Threat Level: ${profile.threat.level} (${profile.threat.score}/100)`);
  if (profile.marketShare) lines.push(`  Market Share: ${profile.marketShare}%`);
  if (profile.revenue) lines.push(`  Revenue: $${profile.revenue.toLocaleString()}`);
  if (profile.employees) lines.push(`  Employees: ${profile.employees}`);
  if (profile.headquarters) lines.push(`  HQ: ${profile.headquarters}`);
  lines.push(`  Strengths: ${profile.strengths.join(", ")}`);
  lines.push(`  Weaknesses: ${profile.weaknesses.join(", ")}`);
  return lines.join("\n");
}

export function formatPositioningPoint(point: PositioningMap["points"][0]): string {
  return `${point.companyName}: (${point.x.toFixed(0)}, ${point.y.toFixed(0)})`;
}

export function formatQuadrant(quadrant: PositioningQuadrant): string {
  return `${quadrant.label}: ${quadrant.companies.join(", ") || "None"}`;
}

export function formatTimelineEvent(event: MarketEvent): string {
  const lines: string[] = [];
  lines.push(`${event.date} — ${event.type.toUpperCase()}`);
  lines.push(`  Company: ${event.company}`);
  lines.push(`  Title: ${event.title}`);
  lines.push(`  Impact: ${event.impact}`);
  lines.push(`  Sentiment: ${event.sentimentScore}`);
  if (event.affectedCompanies.length > 0) lines.push(`  Affected: ${event.affectedCompanies.join(", ")}`);
  if (event.affectedSectors.length > 0) lines.push(`  Sectors: ${event.affectedSectors.join(", ")}`);
  return lines.join("\n");
}

export function formatMilestone(milestone: { date: string; title: string; description: string }): string {
  return `${milestone.date}: ${milestone.title} — ${milestone.description}`;
}

export function formatTrend(trend: { period: string; trend: string; direction: "up" | "down" | "stable" }): string {
  const arrow = trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "→";
  return `${trend.period}: ${trend.trend} ${arrow}`;
}
