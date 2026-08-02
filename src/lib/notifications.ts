// ═══════════════════════════════════════════════════════════════
//  NOTIFICATION SYSTEM — Multi-channel alert delivery
//
//  Handles delivery of notifications across 7 channels:
//  - Dashboard (in-app)
//  - Email (via SMTP/SendGrid)
//  - WhatsApp (via Twilio)
//  - Push (via Firebase/APNs)
//  - Webhook (HTTP POST)
//  - Slack (via Slack API)
//  - Microsoft Teams (via Teams webhook)
//
//  Each channel has its own delivery logic, retry strategy,
//  and template system. The NotificationDispatcher orchestrates
//  delivery across channels based on user preferences.
// ═══════════════════════════════════════════════════════════════

import type {
  Alert,
  AlertSeverity,
  AlertType,
  Notification,
  NotificationChannel,
  NotificationType,
  User,
  WhatsAppMessage,
} from "@/lib/types/platform";

// ─── TYPES ─────────────────────────────────────────────────────

export interface NotificationRequest {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  severity: AlertSeverity;
  link?: string;
  channels: NotificationChannel[];
  metadata?: Record<string, unknown>;
  scheduledFor?: Date;
}

export interface DeliveryResult {
  channel: NotificationChannel;
  success: boolean;
  messageId?: string;
  error?: string;
  deliveredAt: Date;
  retryCount: number;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  channels: NotificationChannel[];
  subjectTemplate: string;
  bodyTemplate: string;
  variables: string[];
  locale: string;
}

export interface ChannelConfig {
  channel: NotificationChannel;
  enabled: boolean;
  priority: number;
  retryStrategy: {
    maxRetries: number;
    backoffMultiplier: number;
    initialDelayMs: number;
  };
  rateLimit: {
    maxPerMinute: number;
    maxPerHour: number;
    maxPerDay: number;
  };
}

// ─── CHANNEL CONFIGURATIONS ────────────────────────────────────

export const CHANNEL_CONFIGS: Record<NotificationChannel, ChannelConfig> = {
  dashboard: {
    channel: "dashboard",
    enabled: true,
    priority: 1,
    retryStrategy: { maxRetries: 0, backoffMultiplier: 1, initialDelayMs: 0 },
    rateLimit: { maxPerMinute: 100, maxPerHour: 1000, maxPerDay: 10000 },
  },
  email: {
    channel: "email",
    enabled: true,
    priority: 2,
    retryStrategy: { maxRetries: 3, backoffMultiplier: 2, initialDelayMs: 5000 },
    rateLimit: { maxPerMinute: 10, maxPerHour: 100, maxPerDay: 500 },
  },
  whatsapp: {
    channel: "whatsapp",
    enabled: true,
    priority: 3,
    retryStrategy: { maxRetries: 2, backoffMultiplier: 3, initialDelayMs: 10000 },
    rateLimit: { maxPerMinute: 5, maxPerHour: 30, maxPerDay: 100 },
  },
  push: {
    channel: "push",
    enabled: true,
    priority: 4,
    retryStrategy: { maxRetries: 2, backoffMultiplier: 2, initialDelayMs: 3000 },
    rateLimit: { maxPerMinute: 20, maxPerHour: 200, maxPerDay: 1000 },
  },
  webhook: {
    channel: "webhook",
    enabled: true,
    priority: 5,
    retryStrategy: { maxRetries: 5, backoffMultiplier: 2, initialDelayMs: 2000 },
    rateLimit: { maxPerMinute: 30, maxPerHour: 500, maxPerDay: 5000 },
  },
  slack: {
    channel: "slack",
    enabled: true,
    priority: 6,
    retryStrategy: { maxRetries: 3, backoffMultiplier: 2, initialDelayMs: 3000 },
    rateLimit: { maxPerMinute: 5, maxPerHour: 50, maxPerDay: 200 },
  },
  teams: {
    channel: "teams",
    enabled: true,
    priority: 7,
    retryStrategy: { maxRetries: 3, backoffMultiplier: 2, initialDelayMs: 3000 },
    rateLimit: { maxPerMinute: 5, maxPerHour: 50, maxPerDay: 200 },
  },
};

// ─── NOTIFICATION TEMPLATES ────────────────────────────────────

export const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: "tpl-alert-critical",
    name: "Critical Alert",
    type: "alert",
    channels: ["dashboard", "email", "whatsapp", "push", "webhook", "slack"],
    subjectTemplate: "🚨 CRITICAL: {{alertTitle}}",
    bodyTemplate: "A critical alert has been triggered for {{companyName}}.\n\nAlert: {{alertTitle}}\nSeverity: CRITICAL\nTime: {{timestamp}}\n\nView details: {{dashboardUrl}}/alerts/{{alertId}}",
    variables: ["alertTitle", "companyName", "timestamp", "dashboardUrl", "alertId"],
    locale: "en",
  },
  {
    id: "tpl-alert-high",
    name: "High Priority Alert",
    type: "alert",
    channels: ["dashboard", "email", "whatsapp", "push"],
    subjectTemplate: "⚠️ HIGH: {{alertTitle}}",
    bodyTemplate: "A high-priority alert has been triggered for {{companyName}}.\n\nAlert: {{alertTitle}}\nSeverity: HIGH\nTime: {{timestamp}}\n\nView details: {{dashboardUrl}}/alerts/{{alertId}}",
    variables: ["alertTitle", "companyName", "timestamp", "dashboardUrl", "alertId"],
    locale: "en",
  },
  {
    id: "tpl-alert-medium",
    name: "Medium Priority Alert",
    type: "alert",
    channels: ["dashboard", "email"],
    subjectTemplate: "Alert: {{alertTitle}}",
    bodyTemplate: "An alert has been triggered for {{companyName}}.\n\nAlert: {{alertTitle}}\nSeverity: MEDIUM\nTime: {{timestamp}}\n\nView details: {{dashboardUrl}}/alerts/{{alertId}}",
    variables: ["alertTitle", "companyName", "timestamp", "dashboardUrl", "alertId"],
    locale: "en",
  },
  {
    id: "tpl-alert-low",
    name: "Low Priority Alert",
    type: "alert",
    channels: ["dashboard"],
    subjectTemplate: "Info: {{alertTitle}}",
    bodyTemplate: "An informational alert has been triggered for {{companyName}}.\n\nAlert: {{alertTitle}}\nSeverity: LOW\nTime: {{timestamp}}",
    variables: ["alertTitle", "companyName", "timestamp"],
    locale: "en",
  },
  {
    id: "tpl-report-ready",
    name: "Report Ready",
    type: "report",
    channels: ["dashboard", "email", "push"],
    subjectTemplate: "📊 Report Ready: {{reportTitle}}",
    bodyTemplate: "Your report \"{{reportTitle}}\" is ready for download.\n\nPeriod: {{reportPeriod}}\nGenerated: {{timestamp}}\n\nDownload: {{dashboardUrl}}/reports/{{reportId}}",
    variables: ["reportTitle", "reportPeriod", "timestamp", "dashboardUrl", "reportId"],
    locale: "en",
  },
  {
    id: "tpl-report-failed",
    name: "Report Generation Failed",
    type: "report",
    channels: ["dashboard", "email"],
    subjectTemplate: "❌ Report Failed: {{reportTitle}}",
    bodyTemplate: "Your report \"{{reportTitle}}\" could not be generated.\n\nError: {{errorMessage}}\nTime: {{timestamp}}\n\nPlease try again or contact support.",
    variables: ["reportTitle", "errorMessage", "timestamp"],
    locale: "en",
  },
  {
    id: "tpl-briefing-morning",
    name: "Morning WhatsApp Briefing",
    type: "briefing",
    channels: ["whatsapp"],
    subjectTemplate: "🌅 HarchIQ Morning Briefing",
    bodyTemplate: "Good morning {{userName}}! Here's your reputation briefing for {{date}}:\n\n📊 Reputation Score: {{reputationScore}}/100 ({{reputationTrend}})\n📰 Articles: {{articleCount}} ({{negativeCount}} negative)\n⚠️ Alerts: {{alertCount}} active\n🤖 AI Visibility: {{aiVisibilityScore}}/100\n\nTop story: {{topStory}}\n\nView full dashboard: {{dashboardUrl}}",
    variables: ["userName", "date", "reputationScore", "reputationTrend", "articleCount", "negativeCount", "alertCount", "aiVisibilityScore", "topStory", "dashboardUrl"],
    locale: "en",
  },
  {
    id: "tpl-sentiment-drop",
    name: "Sentiment Drop Alert",
    type: "threshold",
    channels: ["dashboard", "email", "whatsapp", "push"],
    subjectTemplate: "📉 Sentiment Drop: {{companyName}}",
    bodyTemplate: "Sentiment for {{companyName}} has dropped significantly.\n\nPrevious: {{previousScore}}\nCurrent: {{currentScore}}\nChange: {{delta}} ({{deltaPct}}%)\n\nThis drop was detected from {{articleCount}} recent articles.\n\nView sentiment trend: {{dashboardUrl}}/sentiment",
    variables: ["companyName", "previousScore", "currentScore", "delta", "deltaPct", "articleCount", "dashboardUrl"],
    locale: "en",
  },
  {
    id: "tpl-risk-breach",
    name: "Risk Score Breach",
    type: "threshold",
    channels: ["dashboard", "email", "whatsapp", "push", "webhook"],
    subjectTemplate: "⚠️ Risk Breach: {{companyName}} — {{riskCategory}}",
    bodyTemplate: "Risk score for {{companyName}} has breached the threshold.\n\nCategory: {{riskCategory}}\nScore: {{riskScore}}/100\nLevel: {{riskLevel}}\nTrajectory: {{riskTrajectory}}\nThreshold: {{threshold}}\n\nRecommended action: {{recommendation}}\n\nView risk dashboard: {{dashboardUrl}}/risk",
    variables: ["companyName", "riskCategory", "riskScore", "riskLevel", "riskTrajectory", "threshold", "recommendation", "dashboardUrl"],
    locale: "en",
  },
  {
    id: "tpl-ai-visibility-change",
    name: "AI Visibility Change",
    type: "threshold",
    channels: ["dashboard", "email"],
    subjectTemplate: "🤖 AI Visibility Update: {{companyName}}",
    bodyTemplate: "AI visibility for {{companyName}} has changed.\n\nEngine: {{aiEngine}}\nPrevious: {{previousStatus}}\nCurrent: {{currentStatus}}\nRank: {{rank}}\nSentiment: {{aiSentiment}}\n\nView AI visibility: {{dashboardUrl}}/ai-visibility",
    variables: ["companyName", "aiEngine", "previousStatus", "currentStatus", "rank", "aiSentiment", "dashboardUrl"],
    locale: "en",
  },
  {
    id: "tpl-sanctions-match",
    name: "Sanctions Match Found",
    type: "threshold",
    channels: ["dashboard", "email", "whatsapp", "push", "webhook"],
    subjectTemplate: "🚨 SANCTIONS MATCH: {{entityName}}",
    bodyTemplate: "A sanctions match has been found during screening.\n\nEntity: {{entityName}}\nList: {{sanctionsList}}\nMatch confidence: {{confidence}}%\nProgram: {{sanctionsProgram}}\n\nIMMEDIATE ACTION REQUIRED.\nView screening results: {{dashboardUrl}}/screening/{{screeningId}}",
    variables: ["entityName", "sanctionsList", "confidence", "sanctionsProgram", "dashboardUrl", "screeningId"],
    locale: "en",
  },
  {
    id: "tpl-price-threshold",
    name: "Price Threshold Alert",
    type: "threshold",
    channels: ["dashboard", "whatsapp", "push"],
    subjectTemplate: "📈 Price Alert: {{ticker}} — {{price}} {{currency}}",
    bodyTemplate: "Price threshold triggered for {{ticker}} ({{companyName}}).\n\nCurrent price: {{price}} {{currency}}\nChange: {{changePct}}%\nThreshold: {{thresholdType}} {{thresholdValue}}\n\nView chart: {{dashboardUrl}}/alpha/{{ticker}}",
    variables: ["ticker", "companyName", "price", "currency", "changePct", "thresholdType", "thresholdValue", "dashboardUrl"],
    locale: "en",
  },
  {
    id: "tpl-mention-spike",
    name: "Mention Volume Spike",
    type: "threshold",
    channels: ["dashboard", "email", "push"],
    subjectTemplate: "📊 Mention Spike: {{companyName}}",
    bodyTemplate: "Mention volume for {{companyName}} has spiked.\n\nNormal daily average: {{avgMentions}}\nToday: {{todayMentions}}\nIncrease: {{spikeMultiplier}}x\n\nView mention feed: {{dashboardUrl}}/signals",
    variables: ["companyName", "avgMentions", "todayMentions", "spikeMultiplier", "dashboardUrl"],
    locale: "en",
  },
  {
    id: "tpl-system-update",
    name: "System Update",
    type: "system",
    channels: ["dashboard"],
    subjectTemplate: "System: {{systemMessage}}",
    bodyTemplate: "{{systemMessage}}\n\nTime: {{timestamp}}",
    variables: ["systemMessage", "timestamp"],
    locale: "en",
  },
  {
    id: "tpl-mention-key-person",
    name: "Key Person Mentioned",
    type: "mention",
    channels: ["dashboard", "email"],
    subjectTemplate: "👤 {{personName}} mentioned in coverage about {{companyName}}",
    bodyTemplate: "{{personName}} ({{personRole}}) was mentioned in a recent article about {{companyName}}.\n\nArticle: {{articleTitle}}\nSource: {{articleSource}}\nSentiment: {{articleSentiment}}\nDate: {{articleDate}}\n\nRead article: {{articleUrl}}",
    variables: ["personName", "personRole", "companyName", "articleTitle", "articleSource", "articleSentiment", "articleDate", "articleUrl"],
    locale: "en",
  },
];

// ─── TEMPLATE FUNCTIONS ────────────────────────────────────────

export function getTemplate(id: string): NotificationTemplate | undefined {
  return NOTIFICATION_TEMPLATES.find(t => t.id === id);
}

export function getTemplateByType(type: NotificationType): NotificationTemplate | undefined {
  return NOTIFICATION_TEMPLATES.find(t => t.type === type);
}

export function renderTemplate(
  template: NotificationTemplate,
  variables: Record<string, string>
): { subject: string; body: string } {
  let subject = template.subjectTemplate;
  let body = template.bodyTemplate;

  for (const [key, value] of Object.entries(variables)) {
    const placeholder = new RegExp(`{{${key}}}`, "g");
    subject = subject.replace(placeholder, value);
    body = body.replace(placeholder, value);
  }

  return { subject, body };
}

// ─── SEVERITY-BASED CHANNEL SELECTION ──────────────────────────

export function getChannelsForSeverity(
  severity: AlertSeverity,
  userPreferences?: Partial<User>
): NotificationChannel[] {
  // Default channel selection based on severity
  const severityChannels: Record<AlertSeverity, NotificationChannel[]> = {
    info: ["dashboard"],
    low: ["dashboard"],
    medium: ["dashboard", "email"],
    high: ["dashboard", "email", "whatsapp", "push"],
    critical: ["dashboard", "email", "whatsapp", "push", "webhook"],
  };

  let channels = severityChannels[severity] || ["dashboard"];

  // Filter by user preferences
  if (userPreferences) {
    // WhatsApp requires user opt-in and phone number
    if (channels.includes("whatsapp")) {
      if (!userPreferences.whatsappAlerts || !userPreferences.whatsappNumber) {
        channels = channels.filter(c => c !== "whatsapp");
      }
    }

    // Check severity threshold
    const severityOrder: Record<AlertSeverity, number> = {
      info: 0, low: 1, medium: 2, high: 3, critical: 4,
    };
    const threshold = userPreferences.alertSeverityThreshold || "high";
    const thresholdLevel = severityOrder[threshold as AlertSeverity] || 3;
    const alertLevel = severityOrder[severity];

    if (alertLevel < thresholdLevel) {
      // Below threshold — only dashboard
      channels = ["dashboard"];
    }
  }

  return channels;
}

// ─── ALERT TYPE → NOTIFICATION TYPE MAPPING ────────────────────

export function alertTypeToNotificationType(alertType: AlertType): NotificationType {
  const mapping: Record<AlertType, NotificationType> = {
    sentiment_drop: "threshold",
    risk_breach: "threshold",
    volume_spike: "threshold",
    ai_visibility: "threshold",
    regulatory: "alert",
    price_threshold: "threshold",
    sanctions_match: "threshold",
    entity_mention: "mention",
    trend_detection: "alert",
    anomaly: "alert",
  };
  return mapping[alertType] || "alert";
}

// ─── ALERT → NOTIFICATION REQUEST CONVERTER ────────────────────

export function alertToNotificationRequest(
  alert: Alert,
  user: User,
  companyName?: string
): NotificationRequest {
  const channels = getChannelsForSeverity(alert.severity as AlertSeverity, user);
  const type = alertTypeToNotificationType(alert.type as AlertType);

  return {
    userId: user.id,
    type,
    title: alert.title,
    body: alert.body,
    severity: alert.severity as AlertSeverity,
    link: `/atelier/console/alerts?id=${alert.id}`,
    channels,
    metadata: {
      alertId: alert.id,
      alertType: alert.type,
      companyId: alert.companyId,
      companyName,
      triggeredAt: alert.triggeredAt,
    },
  };
}

// ─── WHATSAPP MESSAGE BUILDER ──────────────────────────────────

export function buildWhatsAppMessage(
  request: NotificationRequest,
  user: User
): WhatsAppMessage | null {
  if (!user.whatsappNumber) return null;

  const severityEmoji: Record<AlertSeverity, string> = {
    info: "ℹ️",
    low: "ℹ️",
    medium: "⚠️",
    high: "⚠️",
    critical: "🚨",
  };

  const emoji = severityEmoji[request.severity as AlertSeverity] || "ℹ️";

  // WhatsApp messages have a 4096 character limit
  const body = `${emoji} ${request.title}\n\n${request.body}\n\n— Harch Atelier`;

  return {
    to: user.whatsappNumber,
    from: process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+1234567890",
    body: body.slice(0, 4000), // Leave room for signature
  };
}

// ─── EMAIL MESSAGE BUILDER ─────────────────────────────────────

export interface EmailMessage {
  to: string;
  from: string;
  subject: string;
  body: string;
  html?: string;
  replyTo?: string;
}

export function buildEmailMessage(
  request: NotificationRequest,
  user: User
): EmailMessage | null {
  if (!user.email) return null;

  const severityPrefix: Record<AlertSeverity, string> = {
    info: "[Harch Atelier]",
    low: "[Harch Atelier]",
    medium: "[Harch Atelier] ⚠️",
    high: "[Harch Atelier] ⚠️ HIGH",
    critical: "[Harch Atelier] 🚨 CRITICAL",
  };

  const prefix = severityPrefix[request.severity as AlertSeverity] || "[Harch Atelier]";

  return {
    to: user.email,
    from: process.env.SMTP_FROM || "alerts@harch.atelier",
    subject: `${prefix} ${request.title}`,
    body: `${request.body}\n\n— Harch Atelier\n${request.link || ""}`,
    html: `<html><body style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
<h2 style="color: ${request.severity === "critical" ? "#dc2626" : "#059669"}">${request.title}</h2>
<p style="color: #525252; line-height: 1.6;">${request.body.replace(/\n/g, "<br>")}</p>
${request.link ? `<p><a href="${request.link}" style="background: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">View Details</a></p>` : ""}
<p style="color: #71717a; font-size: 12px; margin-top: 20px;">— Harch Atelier | AI Reputation Intelligence for Africa</p>
</body></html>`,
    replyTo: process.env.SMTP_REPLY_TO || "support@harch.atelier",
  };
}

// ─── PUSH NOTIFICATION BUILDER ─────────────────────────────────

export interface PushMessage {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  badge?: number;
  sound?: string;
}

export function buildPushMessage(
  request: NotificationRequest,
  deviceToken: string
): PushMessage {
  return {
    token: deviceToken,
    title: request.title.slice(0, 100),
    body: request.body.slice(0, 200),
    data: {
      type: request.type,
      severity: request.severity,
      link: request.link || "",
      ...(request.metadata as Record<string, string>),
    },
    badge: 1,
    sound: request.severity === "critical" ? "critical.wav" : "default",
  };
}

// ─── WEBHOOK PAYLOAD BUILDER ───────────────────────────────────

export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: Record<string, unknown>;
  signature?: string;
}

export function buildWebhookPayload(
  request: NotificationRequest
): WebhookPayload {
  return {
    event: `${request.type}.${request.severity}`,
    timestamp: new Date().toISOString(),
    data: {
      title: request.title,
      body: request.body,
      severity: request.severity,
      type: request.type,
      link: request.link,
      metadata: request.metadata,
    },
  };
}

// ─── SLACK MESSAGE BUILDER ─────────────────────────────────────

export interface SlackMessage {
  channel: string;
  text: string;
  blocks?: Array<Record<string, unknown>>;
  attachments?: Array<Record<string, unknown>>;
}

export function buildSlackMessage(
  request: NotificationRequest,
  channel: string = "#alerts"
): SlackMessage {
  const severityColor: Record<AlertSeverity, string> = {
    info: "#737373",
    low: "#856914",
    medium: "#D97706",
    high: "#DC2626",
    critical: "#7F1D1D",
  };

  const color = severityColor[request.severity as AlertSeverity] || "#737373";

  return {
    channel,
    text: `${request.severity.toUpperCase()}: ${request.title}`,
    attachments: [
      {
        color,
        fields: [
          { title: "Severity", value: request.severity.toUpperCase(), short: true },
          { title: "Type", value: request.type, short: true },
          { title: "Description", value: request.body, short: false },
        ],
        footer: "Harch Atelier",
        ts: Math.floor(Date.now() / 1000).toString(),
      },
    ],
  };
}

// ─── TEAMS MESSAGE BUILDER ─────────────────────────────────────

export interface TeamsMessage {
  "@type": string;
  "@context": string;
  title: string;
  text: string;
  themeColor: string;
  potentialAction?: Array<{
    "@type": string;
    name: string;
    target: Array<{ os: string; uri: string }>;
  }>;
}

export function buildTeamsMessage(request: NotificationRequest): TeamsMessage {
  const themeColors: Record<AlertSeverity, string> = {
    info: "737373",
    low: "856914",
    medium: "D97706",
    high: "DC2626",
    critical: "7F1D1D",
  };

  const themeColor = themeColors[request.severity as AlertSeverity] || "737373";

  return {
    "@type": "MessageCard",
    "@context": "http://schema.org/extensions",
    title: `${request.severity.toUpperCase()}: ${request.title}`,
    text: request.body,
    themeColor,
    potentialAction: request.link
      ? [{
          "@type": "OpenUri",
          name: "View Details",
          target: [{ os: "default", uri: `https://atelier.harchcorp.com${request.link}` }],
        }]
      : undefined,
  };
}

// ─── RATE LIMITER ──────────────────────────────────────────────

export class RateLimiter {
  private counts: Map<string, { minute: number; hour: number; day: number; lastReset: Date }> = new Map();

  constructor() {
    this.counts = new Map();
  }

  canSend(channel: NotificationChannel): boolean {
    const config = CHANNEL_CONFIGS[channel];
    if (!config) return false;

    const now = new Date();
    const key = channel;
    let entry = this.counts.get(key);

    if (!entry) {
      entry = { minute: 0, hour: 0, day: 0, lastReset: now };
      this.counts.set(key, entry);
    }

    // Reset counters based on time elapsed
    const elapsed = now.getTime() - entry.lastReset.getTime();
    if (elapsed >= 60000) entry.minute = 0;
    if (elapsed >= 3600000) entry.hour = 0;
    if (elapsed >= 86400000) entry.day = 0;
    entry.lastReset = now;

    // Check rate limits
    if (entry.minute >= config.rateLimit.maxPerMinute) return false;
    if (entry.hour >= config.rateLimit.maxPerHour) return false;
    if (entry.day >= config.rateLimit.maxPerDay) return false;

    // Increment counters
    entry.minute++;
    entry.hour++;
    entry.day++;

    return true;
  }

  reset(channel?: NotificationChannel) {
    if (channel) {
      this.counts.delete(channel);
    } else {
      this.counts.clear();
    }
  }

  getCounts(channel: NotificationChannel): { minute: number; hour: number; day: number } {
    const entry = this.counts.get(channel);
    return entry ? { minute: entry.minute, hour: entry.hour, day: entry.day } : { minute: 0, hour: 0, day: 0 };
  }
}

// ─── RETRY LOGIC ───────────────────────────────────────────────

export async function withRetry<T>(
  fn: () => Promise<T>,
  config: { maxRetries: number; backoffMultiplier: number; initialDelayMs: number }
): Promise<{ result: T; retryCount: number } | { result: null; retryCount: number; error: string }> {
  let lastError: string = "";
  let delay = config.initialDelayMs;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const result = await fn();
      return { result, retryCount: attempt };
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Unknown error";
      if (attempt < config.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= config.backoffMultiplier;
      }
    }
  }

  return { result: null, retryCount: config.maxRetries, error: lastError };
}

// ─── NOTIFICATION DISPATCHER ───────────────────────────────────

export class NotificationDispatcher {
  private rateLimiter: RateLimiter;

  constructor() {
    this.rateLimiter = new RateLimiter();
  }

  async dispatch(request: NotificationRequest): Promise<DeliveryResult[]> {
    const results: DeliveryResult[] = [];

    for (const channel of request.channels) {
      const config = CHANNEL_CONFIGS[channel];
      if (!config || !config.enabled) {
        results.push({
          channel,
          success: false,
          error: "Channel disabled or not configured",
          deliveredAt: new Date(),
          retryCount: 0,
        });
        continue;
      }

      // Check rate limit
      if (!this.rateLimiter.canSend(channel)) {
        results.push({
          channel,
          success: false,
          error: "Rate limit exceeded",
          deliveredAt: new Date(),
          retryCount: 0,
        });
        continue;
      }

      // Deliver with retry
      const retryResult = await withRetry(
        () => this.deliverToChannel(channel, request),
        config.retryStrategy
      );

      results.push({
        channel,
        success: retryResult.result !== null,
        messageId: retryResult.result?.messageId,
        error: "error" in retryResult ? retryResult.error : undefined,
        deliveredAt: new Date(),
        retryCount: retryResult.retryCount,
      });
    }

    return results;
  }

  private async deliverToChannel(
    channel: NotificationChannel,
    request: NotificationRequest
  ): Promise<{ messageId: string }> {
    switch (channel) {
      case "dashboard":
        return this.deliverDashboard(request);
      case "email":
        return this.deliverEmail(request);
      case "whatsapp":
        return this.deliverWhatsApp(request);
      case "push":
        return this.deliverPush(request);
      case "webhook":
        return this.deliverWebhook(request);
      case "slack":
        return this.deliverSlack(request);
      case "teams":
        return this.deliverTeams(request);
      default:
        throw new Error(`Unknown channel: ${channel}`);
    }
  }

  private async deliverDashboard(request: NotificationRequest): Promise<{ messageId: string }> {
    // In production, this would write to the Notification table via Prisma
    const messageId = `dash-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return { messageId };
  }

  private async deliverEmail(request: NotificationRequest): Promise<{ messageId: string }> {
    // In production, this would call the email service (SendGrid/SES)
    const messageId = `email-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return { messageId };
  }

  private async deliverWhatsApp(request: NotificationRequest): Promise<{ messageId: string }> {
    // In production, this would call Twilio WhatsApp API
    const messageId = `wa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return { messageId };
  }

  private async deliverPush(request: NotificationRequest): Promise<{ messageId: string }> {
    // In production, this would call FCM/APNs
    const messageId = `push-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return { messageId };
  }

  private async deliverWebhook(request: NotificationRequest): Promise<{ messageId: string }> {
    // In production, this would POST to the webhook URL
    const messageId = `wh-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return { messageId };
  }

  private async deliverSlack(request: NotificationRequest): Promise<{ messageId: string }> {
    // In production, this would call Slack Webhook API
    const messageId = `slack-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return { messageId };
  }

  private async deliverTeams(request: NotificationRequest): Promise<{ messageId: string }> {
    // In production, this would call Teams Webhook
    const messageId = `teams-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return { messageId };
  }
}

// ─── BATCH DISPATCH ────────────────────────────────────────────

export async function dispatchBatch(
  requests: NotificationRequest[]
): Promise<Array<{ request: NotificationRequest; results: DeliveryResult[] }>> {
  const dispatcher = new NotificationDispatcher();
  const results: Array<{ request: NotificationRequest; results: DeliveryResult[] }> = [];

  for (const request of requests) {
    const deliveryResults = await dispatcher.dispatch(request);
    results.push({ request, results: deliveryResults });
  }

  return results;
}

// ─── NOTIFICATION HISTORY ──────────────────────────────────────

export interface NotificationHistoryEntry {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  severity: AlertSeverity;
  channels: NotificationChannel[];
  deliveryResults: DeliveryResult[];
  createdAt: string;
  read: boolean;
}

export function formatNotificationForDashboard(
  notification: Notification
): NotificationHistoryEntry {
  return {
    id: notification.id,
    userId: notification.userId,
    type: notification.type as NotificationType,
    title: notification.title,
    body: notification.body,
    severity: notification.severity as AlertSeverity,
    channels: ["dashboard"],
    deliveryResults: [{
      channel: "dashboard",
      success: true,
      deliveredAt: new Date(notification.createdAt),
      retryCount: 0,
    }],
    createdAt: notification.createdAt,
    read: notification.read,
  };
}

// ─── DIGEST BUILDER ────────────────────────────────────────────

export interface DigestEntry {
  type: NotificationType;
  title: string;
  body: string;
  severity: AlertSeverity;
  timestamp: string;
}

export interface Digest {
  userId: string;
  period: "daily" | "weekly" | "monthly";
  startDate: string;
  endDate: string;
  totalNotifications: number;
  unreadCount: number;
  criticalCount: number;
  highCount: number;
  entries: DigestEntry[];
}

export function buildDigest(
  userId: string,
  notifications: Notification[],
  period: "daily" | "weekly" | "monthly"
): Digest {
  const entries: DigestEntry[] = notifications.map(n => ({
    type: n.type as NotificationType,
    title: n.title,
    body: n.body,
    severity: n.severity as AlertSeverity,
    timestamp: n.createdAt,
  }));

  const unreadCount = notifications.filter(n => !n.read).length;
  const criticalCount = notifications.filter(n => n.severity === "critical").length;
  const highCount = notifications.filter(n => n.severity === "high").length;

  const now = new Date();
  const periodDays = period === "daily" ? 1 : period === "weekly" ? 7 : 30;
  const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

  return {
    userId,
    period,
    startDate: startDate.toISOString(),
    endDate: now.toISOString(),
    totalNotifications: notifications.length,
    unreadCount,
    criticalCount,
    highCount,
    entries,
  };
}

// ─── PREFERENCES MANAGER ───────────────────────────────────────

export interface NotificationPreferences {
  userId: string;
  channels: {
    dashboard: boolean;
    email: boolean;
    whatsapp: boolean;
    push: boolean;
    webhook: boolean;
    slack: boolean;
    teams: boolean;
  };
  severityThreshold: AlertSeverity;
  quietHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string; // "07:00"
    timezone: string;
  };
  digest: {
    enabled: boolean;
    frequency: "daily" | "weekly" | "monthly";
    time: string; // "08:00"
  };
  categoryOverrides: Array<{
    category: string;
    channels: NotificationChannel[];
    severityThreshold: AlertSeverity;
  }>;
}

export function getDefaultPreferences(userId: string): NotificationPreferences {
  return {
    userId,
    channels: {
      dashboard: true,
      email: true,
      whatsapp: false,
      push: false,
      webhook: false,
      slack: false,
      teams: false,
    },
    severityThreshold: "medium",
    quietHours: {
      enabled: false,
      start: "22:00",
      end: "07:00",
      timezone: "Africa/Casablanca",
    },
    digest: {
      enabled: true,
      frequency: "daily",
      time: "08:00",
    },
    categoryOverrides: [],
  };
}

export function isQuietTime(prefs: NotificationPreferences, now: Date = new Date()): boolean {
  if (!prefs.quietHours.enabled) return false;

  const hour = now.getHours();
  const startHour = parseInt(prefs.quietHours.start.split(":")[0], 10);
  const endHour = parseInt(prefs.quietHours.end.split(":")[0], 10);

  if (startHour > endHour) {
    // Crosses midnight (e.g., 22:00 - 07:00)
    return hour >= startHour || hour < endHour;
  } else {
    return hour >= startHour && hour < endHour;
  }
}

export function shouldDeliver(
  prefs: NotificationPreferences,
  severity: AlertSeverity,
  now: Date = new Date()
): boolean {
  // Critical alerts always deliver, even during quiet hours
  if (severity === "critical") return true;

  // Check quiet hours
  if (isQuietTime(prefs, now)) return false;

  // Check severity threshold
  const severityOrder: Record<AlertSeverity, number> = {
    info: 0, low: 1, medium: 2, high: 3, critical: 4,
  };
  return severityOrder[severity] >= severityOrder[prefs.severityThreshold];
}

// ─── STATISTICS ────────────────────────────────────────────────

export interface NotificationStats {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  deliveryRate: number;
  byChannel: Record<string, { sent: number; delivered: number; failed: number }>;
  bySeverity: Record<string, number>;
  byType: Record<string, number>;
  averageRetries: number;
}

export function calculateStats(results: Array<{ request: NotificationRequest; results: DeliveryResult[] }>): NotificationStats {
  let totalSent = 0;
  let totalDelivered = 0;
  let totalFailed = 0;
  let totalRetries = 0;
  const byChannel: Record<string, { sent: number; delivered: number; failed: number }> = {};
  const bySeverity: Record<string, number> = {};
  const byType: Record<string, number> = {};

  for (const { request, results: deliveryResults } of results) {
    bySeverity[request.severity] = (bySeverity[request.severity] || 0) + 1;
    byType[request.type] = (byType[request.type] || 0) + 1;

    for (const result of deliveryResults) {
      totalSent++;
      totalRetries += result.retryCount;

      if (!byChannel[result.channel]) {
        byChannel[result.channel] = { sent: 0, delivered: 0, failed: 0 };
      }
      byChannel[result.channel].sent++;

      if (result.success) {
        totalDelivered++;
        byChannel[result.channel].delivered++;
      } else {
        totalFailed++;
        byChannel[result.channel].failed++;
      }
    }
  }

  return {
    totalSent,
    totalDelivered,
    totalFailed,
    deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
    byChannel,
    bySeverity,
    byType,
    averageRetries: totalSent > 0 ? totalRetries / totalSent : 0,
  };
}
