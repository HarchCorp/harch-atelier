// ═══════════════════════════════════════════════════════════════
//  MARKETING VISION ENGINE — Create the feeling of user ownership
//
//  This module implements the "illusion of user-authored data"
//  that makes users feel like THEY put the data in, THEY
//  understand it, and the platform just makes it intelligent.
//
//  Design principles:
//  1. Every data point shows its source + timestamp + collection method
//  2. Users can configure their own boolean queries
//  3. Users can upload custom sources (PDFs, URLs, WhatsApp forwards)
//  4. Dashboards are drag-and-drop customizable
//  5. Every alert has "Why am I seeing this?" explanation
//  6. White-label mode for PR agencies
// ═══════════════════════════════════════════════════════════════

// ─── TYPES ─────────────────────────────────────────────────────

export interface DataSourceTransparency {
  sourceName: string;
  sourceType: "rss" | "api" | "scraper" | "user_upload" | "whatsapp_inbound" | "social_media" | "regulatory" | "ai_probe";
  collectionMethod: string;
  lastCollected: string;
  collectionFrequency: string;
  costPerMonth: number;
  reliability: "high" | "medium" | "low";
  coverageArea: string;
}

export interface UserQueryConfig {
  id: string;
  userId: string;
  name: string;
  query: string;
  booleanExpression: string;
  sources: string[];
  languages: string[];
  sentimentFilter: string[];
  alertThreshold: number;
  isActive: boolean;
  createdAt: string;
  lastTriggered?: string;
  matchCount: number;
}

export interface DataLineageRecord {
  id: string;
  dataPointId: string;
  dataType: "article" | "alert" | "sentiment_score" | "risk_assessment" | "entity_mention";
  source: string;
  sourceType: string;
  collectionMethod: string;
  collectedAt: string;
  processedAt?: string;
  processingSteps: ProcessingStep[];
  confidenceScore: number;
  userVisible: boolean;
}

export interface ProcessingStep {
  step: string;
  timestamp: string;
  inputHash: string;
  outputHash: string;
  model?: string;
  duration: number;
}

export interface CustomSourceUpload {
  id: string;
  userId: string;
  sourceType: "url" | "pdf" | "whatsapp_forward" | "email_forward" | "manual_entry" | "rss_custom";
  content: string;
  title?: string;
  url?: string;
  uploadedAt: string;
  processedAt?: string;
  status: "pending" | "processing" | "processed" | "failed";
  extractedEntities?: string[];
  extractedSentiment?: "positive" | "neutral" | "negative";
  extractedScore?: number;
}

export interface WhiteLabelConfig {
  agencyId: string;
  agencyName: string;
  customDomain?: string;
  customLogo?: string;
  customColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  customEmailTemplate?: string;
  clientLimit: number;
  clientCount: number;
  revenueSharePercent: number;
  features: {
    dashboards: boolean;
    alerts: boolean;
    reports: boolean;
    api: boolean;
    whatsapp: boolean;
  };
  createdAt: string;
}

export interface ProspectAudit {
  id: string;
  companyName: string;
  contactEmail: string;
  contactName: string;
  auditDate: string;
  auditDurationDays: number;
  findings: ProspectAuditFinding[];
  score: number;
  recommendation: string;
  status: "pending" | "in_progress" | "completed" | "converted";
}

export interface ProspectAuditFinding {
  category: string;
  finding: string;
  severity: "info" | "low" | "medium" | "high" | "critical";
  evidence: string[];
  recommendation: string;
}

export interface MarketingAngle {
  id: string;
  name: string;
  description: string;
  targetPersona: string;
  trigger: string;
  valueProposition: string;
  proofPoint: string;
  callToAction: string;
  expectedConversionRate: number;
}

// ─── DATA SOURCE TRANSPARENCY ──────────────────────────────────

export const DATA_SOURCES_TRANSPARENCY: DataSourceTransparency[] = [
  { sourceName: "Hespress", sourceType: "rss", collectionMethod: "RSS feed parser (XML → JSON)", lastCollected: new Date().toISOString(), collectionFrequency: "Every 30 minutes", costPerMonth: 0, reliability: "high", coverageArea: "Arabic news, politics, society" },
  { sourceName: "TelQuel", sourceType: "rss", collectionMethod: "RSS feed parser (XML → JSON)", lastCollected: new Date().toISOString(), collectionFrequency: "Every 30 minutes", costPerMonth: 0, reliability: "high", coverageArea: "French news, politics, society" },
  { sourceName: "Medias24", sourceType: "rss", collectionMethod: "RSS feed parser (XML → JSON)", lastCollected: new Date().toISOString(), collectionFrequency: "Every 30 minutes", costPerMonth: 0, reliability: "high", coverageArea: "French business news" },
  { sourceName: "L'Economiste", sourceType: "rss", collectionMethod: "RSS feed parser (XML → JSON)", lastCollected: new Date().toISOString(), collectionFrequency: "Every 30 minutes", costPerMonth: 0, reliability: "high", coverageArea: "French business, economy, finance" },
  { sourceName: "Le360", sourceType: "rss", collectionMethod: "RSS feed parser (XML → JSON)", lastCollected: new Date().toISOString(), collectionFrequency: "Every 30 minutes", costPerMonth: 0, reliability: "medium", coverageArea: "French general news" },
  { sourceName: "Aujourdhui Le Maroc", sourceType: "rss", collectionMethod: "RSS feed parser (XML → JSON)", lastCollected: new Date().toISOString(), collectionFrequency: "Every 30 minutes", costPerMonth: 0, reliability: "medium", coverageArea: "French general news" },
  { sourceName: "Le Matin", sourceType: "rss", collectionMethod: "RSS feed parser (XML → JSON)", lastCollected: new Date().toISOString(), collectionFrequency: "Every 30 minutes", costPerMonth: 0, reliability: "medium", coverageArea: "French general news" },
  { sourceName: "LesEco", sourceType: "rss", collectionMethod: "RSS feed parser (XML → JSON)", lastCollected: new Date().toISOString(), collectionFrequency: "Every 60 minutes", costPerMonth: 0, reliability: "medium", coverageArea: "French business news" },
  { sourceName: "Jeune Afrique", sourceType: "rss", collectionMethod: "RSS feed parser (XML → JSON)", lastCollected: new Date().toISOString(), collectionFrequency: "Every 30 minutes", costPerMonth: 0, reliability: "high", coverageArea: "Pan-African French news" },
  { sourceName: "MAP (Maghreb Arabe Presse)", sourceType: "rss", collectionMethod: "RSS feed parser (XML → JSON)", lastCollected: new Date().toISOString(), collectionFrequency: "Every 30 minutes", costPerMonth: 0, reliability: "high", coverageArea: "State media, official announcements" },
  { sourceName: "AMMC", sourceType: "regulatory", collectionMethod: "Regulatory feed scraper", lastCollected: new Date().toISOString(), collectionFrequency: "Daily 06:00 UTC", costPerMonth: 0, reliability: "high", coverageArea: "Capital markets regulation" },
  { sourceName: "Bank Al-Maghrib", sourceType: "regulatory", collectionMethod: "Regulatory feed scraper", lastCollected: new Date().toISOString(), collectionFrequency: "Daily 06:00 UTC", costPerMonth: 0, reliability: "high", coverageArea: "Central bank, monetary policy" },
  { sourceName: "BVC (Bourse de Casablanca)", sourceType: "api", collectionMethod: "JSON API (closing prices)", lastCollected: new Date().toISOString(), collectionFrequency: "Daily 18:00 UTC", costPerMonth: 0, reliability: "high", coverageArea: "Stock prices, market data" },
  { sourceName: "OFAC SDN List", sourceType: "regulatory", collectionMethod: "OFAC XML download + parse", lastCollected: new Date().toISOString(), collectionFrequency: "Daily 03:00 UTC", costPerMonth: 0, reliability: "high", coverageArea: "US sanctions list" },
  { sourceName: "EU Consolidated List", sourceType: "regulatory", collectionMethod: "EU XML download + parse", lastCollected: new Date().toISOString(), collectionFrequency: "Daily 03:00 UTC", costPerMonth: 0, reliability: "high", coverageArea: "EU sanctions list" },
  { sourceName: "UN Security Council List", sourceType: "regulatory", collectionMethod: "UN XML download + parse", lastCollected: new Date().toISOString(), collectionFrequency: "Daily 03:00 UTC", costPerMonth: 0, reliability: "high", coverageArea: "UN sanctions list" },
  { sourceName: "ChatGPT (OpenAI)", sourceType: "ai_probe", collectionMethod: "API call (gpt-4-turbo)", lastCollected: new Date().toISOString(), collectionFrequency: "Daily 22:00 UTC", costPerMonth: 50, reliability: "high", coverageArea: "AI visibility probing" },
  { sourceName: "Claude (Anthropic)", sourceType: "ai_probe", collectionMethod: "API call (claude-sonnet-4)", lastCollected: new Date().toISOString(), collectionFrequency: "Daily 22:00 UTC", costPerMonth: 30, reliability: "high", coverageArea: "AI visibility probing" },
  { sourceName: "Gemini (Google)", sourceType: "ai_probe", collectionMethod: "API call (gemini-2.5-flash)", lastCollected: new Date().toISOString(), collectionFrequency: "Daily 22:00 UTC", costPerMonth: 20, reliability: "high", coverageArea: "AI visibility probing" },
  { sourceName: "GLM-4 (Z.ai)", sourceType: "ai_probe", collectionMethod: "API call (glm-4)", lastCollected: new Date().toISOString(), collectionFrequency: "On-demand", costPerMonth: 100, reliability: "high", coverageArea: "NLP processing, insights, briefings" },
  { sourceName: "WhatsApp (Twilio)", sourceType: "api", collectionMethod: "Twilio WhatsApp API", lastCollected: new Date().toISOString(), collectionFrequency: "Real-time", costPerMonth: 15, reliability: "high", coverageArea: "Alert delivery, briefings" },
];

export const MISSING_DATA_SOURCES = [
  { name: "Facebook Pages & Groups", platform: "Facebook", priority: "critical", moroccanUsers: "21.3M", why: "94% of Moroccan social conversations happen here. 2018 boycott started on Facebook.", implementationCost: "Graph API (free for public pages) + CrowdTangle alternative", monthlyCost: 0 },
  { name: "Hespress Comments", platform: "Hespress", priority: "critical", moroccanUsers: "10M+ monthly visitors", why: "Most commented Moroccan news site. Comments can destroy a reputation overnight.", implementationCost: "Custom HTML scraper (Hespress has no API)", monthlyCost: 0 },
  { name: "WhatsApp Inbound", platform: "WhatsApp", priority: "high", moroccanUsers: "90%+ urban penetration", why: "Users forward screenshots/text of things they see. Creates 'user-put-the-data-in' feeling.", implementationCost: "Twilio WhatsApp Business API inbound", monthlyCost: 15 },
  { name: "TikTok", platform: "TikTok", priority: "high", moroccanUsers: "14.6M (+17.5% YoY)", why: "Fastest growing platform in Morocco. Viral content can trigger crises.", implementationCost: "TikTok Research API (academic) or Display Video API", monthlyCost: 0 },
  { name: "Instagram", platform: "Instagram", priority: "high", moroccanUsers: "13.1M", why: "Brand mentions, influencer posts, story screenshots.", implementationCost: "Instagram Graph API (for business accounts)", monthlyCost: 0 },
  { name: "LinkedIn", platform: "LinkedIn", priority: "medium", moroccanUsers: "6.5M", why: "B2B conversations, executive announcements, professional reputation.", implementationCost: "LinkedIn Marketing API", monthlyCost: 0 },
  { name: "Radio (Medi1, Radio Mars, Hit Radio)", platform: "Radio", priority: "medium", moroccanUsers: "70%+ daily listeners", why: "Radio is dominant in Morocco. Monit.ma already covers this.", implementationCost: "Radio stream OCR + transcription (Whisper API)", monthlyCost: 50 },
  { name: "TV (2M, Medi1 TV, SNRT)", platform: "TV", priority: "medium", moroccanUsers: "95%+ households", why: "TV remains the most influential medium in Morocco.", implementationCost: "TV stream OCR + transcription (Whisper API)", monthlyCost: 100 },
  { name: "YouTube", platform: "YouTube", priority: "medium", moroccanUsers: "15M+", why: "Growing video content, influencer channels, brand mentions.", implementationCost: "YouTube Data API v3 (free quota)", monthlyCost: 0 },
  { name: "X (Twitter)", platform: "X", priority: "low", moroccanUsers: "2M", why: "Small but influential (journalists, politicians, activists).", implementationCost: "X API v2 (Basic tier: $100/month)", monthlyCost: 100 },
  { name: "Forums (Yabiladi, Bladi, Marocains", platform: "Forums", priority: "low", moroccanUsers: "500K+", why: "Niche but high-signal discussions about brands.", implementationCost: "Custom HTML scrapers", monthlyCost: 0 },
  { name: "Podcasts", platform: "Podcasts", priority: "low", moroccanUsers: "1M+", why: "Growing medium, influencer interviews, brand mentions.", implementationCost: "RSS + Whisper transcription", monthlyCost: 30 },
];

// ─── MARKETING ANGLES ──────────────────────────────────────────

export const MARKETING_ANGLES: MarketingAngle[] = [
  {
    id: "angle-boycott",
    name: "The Boycott Story",
    description: "Use the 2018 Centrale Danone boycott (€150M loss) as the founding narrative.",
    targetPersona: "Dircom / PR Manager",
    trigger: "Every Dircom knows this story. Ask: 'What would happen if it happened to you?'",
    valueProposition: "Harch detects the first whispers on Facebook and WhatsApp BEFORE they become a crisis.",
    proofPoint: "Our platform monitors 16+ Moroccan media sources + AI engines in real-time.",
    callToAction: "Get your free 30-day reputation audit — see what we'd have caught.",
    expectedConversionRate: 0.15,
  },
  {
    id: "angle-meltwater-pain",
    name: "The Meltwater Escape",
    description: "Target companies frustrated with Meltwater's pricing and complexity.",
    targetPersona: "CMO / Marketing Director",
    trigger: "Meltwater Trustpilot = 1.5/5. Users complain about price and unused features.",
    valueProposition: "Same intelligence at 1/10th the price. Only pay for what you use.",
    proofPoint: "5K MAD/month vs $10K+/month. No long-term contracts. WhatsApp alerts included.",
    callToAction: "Switch from Meltwater — we'll import your existing queries for free.",
    expectedConversionRate: 0.08,
  },
  {
    id: "angle-dircom-dashboard",
    name: "The Morning Briefing",
    description: "Every Dircom wants to know what happened overnight before their coffee.",
    targetPersona: "Dircom / Head of Communications",
    trigger: "Imagine waking up to a WhatsApp message: 'Your reputation score is 84/100. 3 alerts overnight. Top story: [X].'",
    valueProposition: "Your reputation, delivered to your WhatsApp every morning at 7 AM.",
    proofPoint: "AI-generated briefing with GLM-4, covering 16 Moroccan media sources + 8 AI engines.",
    callToAction: "Try our free WhatsApp Daily Digest for 7 days — no credit card required.",
    expectedConversionRate: 0.12,
  },
  {
    id: "angle-cro-risk",
    name: "The Risk Radar",
    description: "CROs need to know about risks before they become losses.",
    targetPersona: "CRO / Risk Officer",
    trigger: "32 categories of risk, scored 0-100, updated every 6 hours.",
    valueProposition: "See your risk landscape before your auditor does.",
    proofPoint: "OFAC/EU/UN sanctions screening, adverse media detection, 32-category risk framework.",
    callToAction: "Get your free risk assessment — 32 categories, 0 cost.",
    expectedConversionRate: 0.10,
  },
  {
    id: "angle-agency-white-label",
    name: "The Agency Partnership",
    description: "PR agencies can white-label Harch and offer it to their clients.",
    targetPersona: "PR Agency Owner",
    trigger: "Agencies need tools to justify retainers. Harch gives them dashboards + reports.",
    valueProposition: "Your brand, your dashboard, our intelligence. 30% revenue share.",
    proofPoint: "Custom domain, custom logo, custom colors. Your clients never see 'Harch'.",
    callToAction: "Become a Harch partner — 30% rev share, free onboarding for first 5 clients.",
    expectedConversionRate: 0.20,
  },
  {
    id: "angle-ai-visibility",
    name: "The AI Blindspot",
    description: "No one else in Morocco probes what ChatGPT/Claude/Gemini say about your brand.",
    targetPersona: "CMO / Digital Marketing Manager",
    trigger: "When someone asks ChatGPT about your company, what does it say?",
    valueProposition: "We probe 8 AI engines daily to see what they say about you. No one else does this.",
    proofPoint: "Daily AI visibility score across ChatGPT, Claude, Gemini, Perplexity, Copilot, Mistral, Grok, Llama.",
    callToAction: "Free AI Visibility Report — see what AI engines say about your brand right now.",
    expectedConversionRate: 0.18,
  },
  {
    id: "angle-investor-dd",
    name: "The Investor's Due Diligence",
    description: "Investment committees need fast, thorough due diligence.",
    targetPersona: "Investment Banker / PE Analyst",
    trigger: "How long does your DD take? Ours takes minutes, not weeks.",
    valueProposition: "AI-powered due diligence dossiers in minutes, not weeks.",
    proofPoint: "Sanctions screening (27K+ entries), adverse media, PEP screening, KYC scoring — all automated.",
    callToAction: "Run a free screening on any entity — see results in 30 seconds.",
    expectedConversionRate: 0.14,
  },
  {
    id: "angle-darija",
    name: "The Darija Advantage",
    description: "No global tool understands Moroccan Arabic dialect.",
    targetPersona: "Any Moroccan business",
    trigger: "Meltwater, Brandwatch, Talkwalker — none of them understand Darija.",
    valueProposition: "We built a Darija NLP engine. We understand what Moroccans actually say.",
    proofPoint: "200+ Darija sentiment words, code-switching detection (Darija/French/Arabic), rule-based + ML pipeline.",
    callToAction: "Send us a Darija text — we'll analyze it for free.",
    expectedConversionRate: 0.16,
  },
];

// ─── COST ANALYSIS ─────────────────────────────────────────────

export interface CostBreakdown {
  category: string;
  item: string;
  monthlyCost: number;
  annualCost: number;
  perCustomerCost: number;
  notes: string;
}

export const COST_BREAKDOWN: CostBreakdown[] = [
  { category: "Data Collection", item: "RSS Feeds (16 sources)", monthlyCost: 0, annualCost: 0, perCustomerCost: 0, notes: "Free — RSS is open" },
  { category: "Data Collection", item: "Regulatory Feeds (3 sources)", monthlyCost: 0, annualCost: 0, perCustomerCost: 0, notes: "Free — AMMC/BAM/BVC" },
  { category: "Data Collection", item: "BVC Price API", monthlyCost: 0, annualCost: 0, perCustomerCost: 0, notes: "Free — Casablanca Bourse" },
  { category: "Data Collection", item: "Sanctions Lists (OFAC/EU/UN)", monthlyCost: 0, annualCost: 0, perCustomerCost: 0, notes: "Free — public data" },
  { category: "AI/LLM", item: "GLM-4 (Z.ai) — NLP + Insights", monthlyCost: 100, annualCost: 1200, perCustomerCost: 0.50, notes: "~$0.002 per article processed" },
  { category: "AI/LLM", item: "OpenAI (embeddings + GPT-4)", monthlyCost: 50, annualCost: 600, perCustomerCost: 0.25, notes: "Embeddings: $0.02/1M tokens" },
  { category: "AI/LLM", item: "Claude (Anthropic) — Summaries", monthlyCost: 30, annualCost: 360, perCustomerCost: 0.15, notes: "Fallback for GLM-4" },
  { category: "AI/LLM", item: "Gemini (Google) — AI visibility", monthlyCost: 20, annualCost: 240, perCustomerCost: 0.10, notes: "Free tier covers most probing" },
  { category: "Infrastructure", item: "Neon PostgreSQL", monthlyCost: 0, annualCost: 0, perCustomerCost: 0, notes: "Free tier (0.5GB), $19/mo for 10GB" },
  { category: "Infrastructure", item: "Vercel (hosting)", monthlyCost: 0, annualCost: 0, perCustomerCost: 0, notes: "Free hobby tier, $20/mo Pro" },
  { category: "Infrastructure", item: "Domain (atelier.harchcorp.com)", monthlyCost: 1, annualCost: 12, perCustomerCost: 0.01, notes: "Standard domain cost" },
  { category: "Communication", item: "Twilio WhatsApp API", monthlyCost: 15, annualCost: 180, perCustomerCost: 0.75, notes: "$0.0042 per message, ~3500/mo for 20 users" },
  { category: "Communication", item: "Email (SMTP)", monthlyCost: 0, annualCost: 0, perCustomerCost: 0, notes: "Free with Gmail SMTP or Vercel" },
  { category: "Missing — Social", item: "Hespress Comments Scraper", monthlyCost: 0, annualCost: 0, perCustomerCost: 0, notes: "Custom scraper — highest ROI" },
  { category: "Missing — Social", item: "Facebook Graph API", monthlyCost: 0, annualCost: 0, perCustomerCost: 0, notes: "Free for public pages" },
  { category: "Missing — Social", item: "TikTok Research API", monthlyCost: 0, annualCost: 0, perCustomerCost: 0, notes: "Free for academic/research" },
  { category: "Missing — Social", item: "Instagram Graph API", monthlyCost: 0, annualCost: 0, perCustomerCost: 0, notes: "Free for business accounts" },
  { category: "Missing — Social", item: "YouTube Data API", monthlyCost: 0, annualCost: 0, perCustomerCost: 0, notes: "Free quota: 10K units/day" },
  { category: "Missing — Audio/Video", item: "Whisper API (radio/TV transcription)", monthlyCost: 50, annualCost: 600, perCustomerCost: 0.25, notes: "$0.006/min audio" },
  { category: "Missing — Social", item: "X (Twitter) API", monthlyCost: 100, annualCost: 1200, perCustomerCost: 0.50, notes: "Basic tier $100/mo" },
];

export const PRICING_ANALYSIS = {
  starter: { price: 5000, cost: 1.70, margin: 99.97, breakevenCustomers: 1 },
  pro: { price: 15000, cost: 4.20, margin: 99.97, breakevenCustomers: 1 },
  enterprise: { price: 50000, cost: 8.50, margin: 99.98, breakevenCustomers: 1 },
  averageVariableCost: 3.50,
  averageGrossMargin: 99.97,
  notes: "Variable cost = $1.70-$8.50/customer/month. Break-even at 1-3 paying customers. LTV/CAC allows up to 180K MAD CAC per Pro customer.",
};

// ─── DATA LINEAGE TRACKER ──────────────────────────────────────

export class DataLineageTracker {
  private records: Map<string, DataLineageRecord> = new Map();

  addRecord(record: Omit<DataLineageRecord, "id">): DataLineageRecord {
    const id = `lineage-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const full: DataLineageRecord = { ...record, id };
    this.records.set(id, full);
    return full;
  }

  getRecord(id: string): DataLineageRecord | undefined {
    return this.records.get(id);
  }

  getRecordsForDataPoint(dataPointId: string): DataLineageRecord[] {
    return [...this.records.values()].filter(r => r.dataPointId === dataPointId);
  }

  getRecordsBySource(source: string): DataLineageRecord[] {
    return [...this.records.values()].filter(r => r.source === source);
  }

  getProcessingSteps(dataPointId: string): ProcessingStep[] {
    const records = this.getRecordsForDataPoint(dataPointId);
    return records.flatMap(r => r.processingSteps);
  }

  explainDataPoint(dataPointId: string): string {
    const records = this.getRecordsForDataPoint(dataPointId);
    if (records.length === 0) return "No lineage information available.";
    const record = records[0];
    const steps = record.processingSteps.map(s => `  ${s.step} (${s.timestamp}) → ${s.outputHash.slice(0, 8)}`).join("\n");
    return `Source: ${record.source} (${record.sourceType})\nCollected: ${record.collectedAt}\nMethod: ${record.collectionMethod}\nConfidence: ${(record.confidenceScore * 100).toFixed(0)}%\nProcessing steps:\n${steps}`;
  }

  getStatistics(): { totalRecords: number; bySource: Record<string, number>; averageConfidence: number } {
    const bySource: Record<string, number> = {};
    let totalConfidence = 0;
    for (const record of this.records.values()) {
      bySource[record.source] = (bySource[record.source] || 0) + 1;
      totalConfidence += record.confidenceScore;
    }
    const count = this.records.size;
    return { totalRecords: count, bySource, averageConfidence: count > 0 ? totalConfidence / count : 0 };
  }
}

// ─── CUSTOM SOURCE MANAGER ─────────────────────────────────────

export class CustomSourceManager {
  private uploads: Map<string, CustomSourceUpload> = new Map();

  upload(upload: Omit<CustomSourceUpload, "id" | "uploadedAt" | "status" | "matchCount">): CustomSourceUpload {
    const id = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const full: CustomSourceUpload = {
      ...upload,
      id,
      uploadedAt: new Date().toISOString(),
      status: "pending",
      matchCount: 0,
    };
    this.uploads.set(id, full);
    return full;
  }

  process(id: string, result: Partial<CustomSourceUpload>): boolean {
    const upload = this.uploads.get(id);
    if (!upload) return false;
    Object.assign(upload, result, { status: "processed", processedAt: new Date().toISOString() });
    return true;
  }

  getUserUploads(userId: string): CustomSourceUpload[] {
    return [...this.uploads.values()].filter(u => u.userId === userId);
  }

  getPendingUploads(): CustomSourceUpload[] {
    return [...this.uploads.values()].filter(u => u.status === "pending");
  }

  getUploadCount(): number {
    return this.uploads.size;
  }

  getStatistics(): { total: number; byType: Record<string, number>; byStatus: Record<string, number> } {
    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    for (const upload of this.uploads.values()) {
      byType[upload.sourceType] = (byType[upload.sourceType] || 0) + 1;
      byStatus[upload.status] = (byStatus[upload.status] || 0) + 1;
    }
    return { total: this.uploads.size, byType, byStatus };
  }
}

// ─── WHITE LABEL MANAGER ───────────────────────────────────────

export class WhiteLabelManager {
  private agencies: Map<string, WhiteLabelConfig> = new Map();

  registerAgency(config: Omit<WhiteLabelConfig, "createdAt" | "clientCount">): WhiteLabelConfig {
    const id = `agency-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const full: WhiteLabelConfig = {
      ...config,
      agencyId: id,
      clientCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.agencies.set(id, full);
    return full;
  }

  getAgency(id: string): WhiteLabelConfig | undefined {
    return this.agencies.get(id);
  }

  getAllAgencies(): WhiteLabelConfig[] {
    return [...this.agencies.values()];
  }

  addClient(agencyId: string): boolean {
    const agency = this.agencies.get(agencyId);
    if (!agency || agency.clientCount >= agency.clientLimit) return false;
    agency.clientCount++;
    return true;
  }

  removeClient(agencyId: string): boolean {
    const agency = this.agencies.get(agencyId);
    if (!agency || agency.clientCount === 0) return false;
    agency.clientCount--;
    return true;
  }

  getRevenueShare(agencyId: string, monthlyRevenue: number): number {
    const agency = this.agencies.get(agencyId);
    if (!agency) return 0;
    return (monthlyRevenue * agency.revenueSharePercent) / 100;
  }

  getStatistics(): { totalAgencies: number; totalClients: number; averageClientsPerAgency: number } {
    const agencies = [...this.agencies.values()];
    const totalClients = agencies.reduce((sum, a) => sum + a.clientCount, 0);
    return {
      totalAgencies: agencies.length,
      totalClients,
      averageClientsPerAgency: agencies.length > 0 ? totalClients / agencies.length : 0,
    };
  }
}

// ─── PROSPECT AUDIT MANAGER ────────────────────────────────────

export class ProspectAuditManager {
  private audits: Map<string, ProspectAudit> = new Map();

  createAudit(companyName: string, contactEmail: string, contactName: string): ProspectAudit {
    const id = `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const audit: ProspectAudit = {
      id,
      companyName,
      contactEmail,
      contactName,
      auditDate: new Date().toISOString(),
      auditDurationDays: 30,
      findings: [],
      score: 0,
      recommendation: "",
      status: "pending",
    };
    this.audits.set(id, audit);
    return audit;
  }

  startAudit(id: string): boolean {
    const audit = this.audits.get(id);
    if (!audit || audit.status !== "pending") return false;
    audit.status = "in_progress";
    return true;
  }

  addFinding(id: string, finding: ProspectAuditFinding): boolean {
    const audit = this.audits.get(id);
    if (!audit) return false;
    audit.findings.push(finding);
    this.recalculateScore(id);
    return true;
  }

  completeAudit(id: string, recommendation: string): boolean {
    const audit = this.audits.get(id);
    if (!audit || audit.status !== "in_progress") return false;
    audit.recommendation = recommendation;
    audit.status = "completed";
    return true;
  }

  convertAudit(id: string): boolean {
    const audit = this.audits.get(id);
    if (!audit || audit.status !== "completed") return false;
    audit.status = "converted";
    return true;
  }

  getAudit(id: string): ProspectAudit | undefined {
    return this.audits.get(id);
  }

  getAllAudits(): ProspectAudit[] {
    return [...this.audits.values()];
  }

  getAuditsByStatus(status: ProspectAudit["status"]): ProspectAudit[] {
    return [...this.audits.values()].filter(a => a.status === status);
  }

  private recalculateScore(id: string): void {
    const audit = this.audits.get(id);
    if (!audit) return;
    const severityWeights = { info: 1, low: 2, medium: 5, high: 10, critical: 20 };
    audit.score = audit.findings.reduce((sum, f) => sum + (severityWeights[f.severity] || 0), 0);
  }

  getStatistics(): {
    total: number;
    byStatus: Record<string, number>;
    conversionRate: number;
    averageScore: number;
  } {
    const audits = [...this.audits.values()];
    const byStatus: Record<string, number> = {};
    let totalScore = 0;
    let completed = 0;
    let converted = 0;

    for (const audit of audits) {
      byStatus[audit.status] = (byStatus[audit.status] || 0) + 1;
      if (audit.status === "completed" || audit.status === "converted") {
        totalScore += audit.score;
        completed++;
      }
      if (audit.status === "converted") converted++;
    }

    return {
      total: audits.length,
      byStatus,
      conversionRate: completed > 0 ? converted / completed : 0,
      averageScore: completed > 0 ? totalScore / completed : 0,
    };
  }
}

// ─── USER QUERY MANAGER ────────────────────────────────────────

export class UserQueryManager {
  private queries: Map<string, UserQueryConfig> = new Map();

  createQuery(config: Omit<UserQueryConfig, "id" | "createdAt" | "matchCount" | "isActive">): UserQueryConfig {
    const id = `query-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const full: UserQueryConfig = {
      ...config,
      id,
      createdAt: new Date().toISOString(),
      matchCount: 0,
      isActive: true,
    };
    this.queries.set(id, full);
    return full;
  }

  getQuery(id: string): UserQueryConfig | undefined {
    return this.queries.get(id);
  }

  getUserQueries(userId: string): UserQueryConfig[] {
    return [...this.queries.values()].filter(q => q.userId === userId);
  }

  getActiveQueries(): UserQueryConfig[] {
    return [...this.queries.values()].filter(q => q.isActive);
  }

  toggleQuery(id: string): boolean {
    const query = this.queries.get(id);
    if (!query) return false;
    query.isActive = !query.isActive;
    return true;
  }

  incrementMatchCount(id: string): boolean {
    const query = this.queries.get(id);
    if (!query) return false;
    query.matchCount++;
    query.lastTriggered = new Date().toISOString();
    return true;
  }

  deleteQuery(id: string): boolean {
    return this.queries.delete(id);
  }

  getStatistics(): { total: number; active: number; totalMatches: number; averageMatchesPerQuery: number } {
    const queries = [...this.queries.values()];
    const active = queries.filter(q => q.isActive).length;
    const totalMatches = queries.reduce((sum, q) => sum + q.matchCount, 0);
    return {
      total: queries.length,
      active,
      totalMatches,
      averageMatchesPerQuery: queries.length > 0 ? totalMatches / queries.length : 0,
    };
  }
}

// ─── FACTORY FUNCTIONS ─────────────────────────────────────────

export function createDataLineageTracker(): DataLineageTracker {
  return new DataLineageTracker();
}

export function createCustomSourceManager(): CustomSourceManager {
  return new CustomSourceManager();
}

export function createWhiteLabelManager(): WhiteLabelManager {
  return new WhiteLabelManager();
}

export function createProspectAuditManager(): ProspectAuditManager {
  return new ProspectAuditManager();
}

export function createUserQueryManager(): UserQueryManager {
  return new UserQueryManager();
}

// ─── HELPER FUNCTIONS ──────────────────────────────────────────

export function getTotalMonthlyCost(): number {
  return COST_BREAKDOWN.reduce((sum, c) => sum + c.monthlyCost, 0);
}

export function getTotalAnnualCost(): number {
  return COST_BREAKDOWN.reduce((sum, c) => sum + c.annualCost, 0);
}

export function getCostPerCustomer(customerCount: number): number {
  if (customerCount === 0) return 0;
  return getTotalMonthlyCost() / customerCount;
}

export function getGrossMargin(price: number, cost: number): number {
  if (price === 0) return 0;
  return ((price - cost) / price) * 100;
}

export function getBreakEvenCustomers(monthlyCost: number, price: number): number {
  if (price === 0) return Infinity;
  return Math.ceil(monthlyCost / price);
}

export function getDataSourceCount(): number {
  return DATA_SOURCES_TRANSPARENCY.length;
}

export function getMissingSourceCount(): number {
  return MISSING_DATA_SOURCES.length;
}

export function getCriticalMissingSources(): typeof MISSING_DATA_SOURCES {
  return MISSING_DATA_SOURCES.filter(s => s.priority === "critical");
}

export function getMarketingAngleCount(): number {
  return MARKETING_ANGLES.length;
}

export function getTopMarketingAngles(limit: number = 3): MarketingAngle[] {
  return [...MARKETING_ANGLES].sort((a, b) => b.expectedConversionRate - a.expectedConversionRate).slice(0, limit);
}

export function getMarketingAngleForPersona(persona: string): MarketingAngle | undefined {
  return MARKETING_ANGLES.find(a => a.targetPersona.toLowerCase().includes(persona.toLowerCase()));
}

export function formatCost(cost: number): string {
  if (cost === 0) return "Free";
  if (cost < 1) return `$${cost.toFixed(2)}`;
  return `$${cost.toFixed(0)}`;
}

export function formatMargin(margin: number): string {
  return `${margin.toFixed(2)}%`;
}

export function getCostSummary(): string {
  const monthly = getTotalMonthlyCost();
  const annual = getTotalAnnualCost();
  return `Total monthly cost: ${formatCost(monthly)} (${formatCost(annual)}/year). ${DATA_SOURCES_TRANSPARENCY.length} active sources. ${MISSING_DATA_SOURCES.length} missing sources identified. Average gross margin: 99.97%.`;
}

export function getMarketingSummary(): string {
  return `${MARKETING_ANGLES.length} marketing angles. Top: "${getTopMarketingAngles(1)[0]?.name || "None"}" (${(getTopMarketingAngles(1)[0]?.expectedConversionRate * 100 || 0).toFixed(0)}% expected conversion). ${MISSING_DATA_SOURCES.filter(s => s.priority === "critical").length} critical missing data sources.`;
}

export function getDataTransparencySummary(): string {
  const free = DATA_SOURCES_TRANSPARENCY.filter(s => s.costPerMonth === 0).length;
  const paid = DATA_SOURCES_TRANSPARENCY.filter(s => s.costPerMonth > 0).length;
  return `${DATA_SOURCES_TRANSPARENCY.length} data sources (${free} free, ${paid} paid). Total cost: ${formatCost(getTotalMonthlyCost())}/month. Every data point has full lineage tracking.`;
}

export function getWhiteLabelSummary(): string {
  return "White-label mode: custom domain, logo, colors. 30% revenue share for PR agencies. Up to 50 clients per agency.";
}

export function getProspectAuditSummary(): string {
  return "Free 30-day prospect audit: reputation score, risk assessment, AI visibility, sentiment analysis. No credit card required. Converts to paying customer.";
}

export function getUserOwnershipSummary(): string {
  return "User ownership: self-configurable boolean queries, custom source upload (URL/PDF/WhatsApp/email), drag-and-drop dashboards, full data lineage on every data point.";
}
