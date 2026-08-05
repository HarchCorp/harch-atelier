// ═══════════════════════════════════════════════════════════════
//  DEMO CONSOLE API — response shapes for /api/console/* and /api/company/*
//
//  Used when the session is a demo-*@harch.atelier user. Returns
//  NextResponse objects with the same shape the real Prisma-backed
//  routes return, so ConsoleShell and EnterpriseAdminPanel render
//  without modification.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import {
  getDemoWeather,
  getDemoAlerts,
  getDemoArticles,
  getDemoReputation,
  getDemoReports,
  getDemoCompany,
  getDemoCompanySettings,
  getDemoTeam,
  getDemoInvitations,
  getDemoNotifications,
} from "@/lib/demo-session";

// ─── /api/console/weather ──────────────────────────────────────
export function demoWeatherResponse() {
  const w = getDemoWeather();
  const articles = getDemoArticles();
  const rep = getDemoReputation();
  const score = rep.overall;
  const sky = score >= 80 ? "Clear skies" : score >= 65 ? "Partly cloudy" : score >= 50 ? "Cloudy" : "Severe weather";
  const skyDescription =
    score >= 80
      ? "Strong positive sentiment across all monitored sources."
      : score >= 65
      ? "Overall positive sentiment, with a few areas of attention."
      : "Mixed sentiment. Watch for emerging negative narratives.";

  const positive = articles.filter((a) => a.sentiment === "positive").length;
  const negative = articles.filter((a) => a.sentiment === "negative").length;
  const neutral = articles.filter((a) => a.sentiment === "neutral").length;
  const total = articles.length || 1;

  const company = getDemoCompany();
  return NextResponse.json({
    company: { id: company.id, slug: company.slug, name: company.name, sector: company.sector },
    score,
    trend: w.trend >= 0 ? "up" : "down",
    trendValue: `${w.trend >= 0 ? "+" : ""}${w.trend} pts vs last month`,
    sky,
    skyDescription,
    breakdown: {
      positive: Math.round((positive / total) * 100),
      neutral: Math.round((neutral / total) * 100),
      negative: Math.round((negative / total) * 100),
    },
    todaySignals: articles.slice(0, 5).map((a) => ({
      time: new Date(a.publishedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
      source: a.source,
      title: a.title,
      weight: Math.abs(a.score) > 0.6 ? "strong" : Math.abs(a.score) > 0.3 ? "medium" : "low",
      sentiment: a.sentiment,
    })),
    mainSources: [
      { name: "hespress", articles: 42, sentiment: "negative" },
      { name: "le360", articles: 31, sentiment: "neutral" },
      { name: "telquel", articles: 28, sentiment: "positive" },
      { name: "medias24", articles: 19, sentiment: "positive" },
      { name: "leseco", articles: 12, sentiment: "negative" },
    ],
    articleCount: 142,
  });
}

// ─── /api/console/alerts ───────────────────────────────────────
export function demoAlertsResponse() {
  const alerts = getDemoAlerts();
  const company = getDemoCompany();
  return NextResponse.json({
    company: { id: company.id, name: company.name, slug: company.slug },
    alerts: alerts.map((a) => ({
      id: a.id,
      severity: a.severity,
      title: a.title,
      summary: a.summary,
      source: a.source,
      publishedAt: a.at,
      status: a.status,
      sentimentScore: a.severity === "critical" ? -0.85 : a.severity === "high" ? -0.6 : a.severity === "medium" ? 0.3 : 0.1,
    })),
    count: alerts.length,
    criticalCount: alerts.filter((a) => a.severity === "critical").length,
  });
}

// ─── /api/console/reports/list ─────────────────────────────────
export function demoReportsListResponse() {
  const reports = getDemoReports();
  const company = getDemoCompany();
  return NextResponse.json({
    reports: reports.map((r) => ({
      id: r.id,
      title: r.title,
      period: r.period,
      summary: r.title,
      status: r.status,
      createdAt: r.createdAt,
      company: { name: company.name, slug: company.slug },
    })),
  });
}

// ─── /api/console/reports ──────────────────────────────────────
export function demoReportsResponse() {
  return demoReportsListResponse();
}

// ─── /api/console/neighbors ────────────────────────────────────
export function demoNeighborsResponse() {
  return NextResponse.json({
    competitors: [
      { name: "Bank of Africa", score: 74, delta: 2, shareOfVoice: 22 },
      { name: "Banque Centrale Populaire", score: 71, delta: -1, shareOfVoice: 19 },
      { name: "CIH Bank", score: 68, delta: 3, shareOfVoice: 11 },
      { name: "Crédit du Maroc", score: 65, delta: 0, shareOfVoice: 8 },
    ],
    yourScore: 82,
    yourShareOfVoice: 34,
  });
}

// ─── /api/console/ai-visibility ────────────────────────────────
export function demoAiVisibilityResponse() {
  return NextResponse.json({
    overallScore: 67,
    trend: 5,
    engines: [
      { name: "ChatGPT", score: 72, mentions: 142, trend: 8 },
      { name: "Claude", score: 68, mentions: 98, trend: 5 },
      { name: "Gemini", score: 64, mentions: 87, trend: 3 },
      { name: "Perplexity", score: 71, mentions: 76, trend: 6 },
      { name: "Copilot", score: 58, mentions: 54, trend: -2 },
      { name: "Grok", score: 69, mentions: 41, trend: 4 },
    ],
  });
}

// ─── /api/console/topics ───────────────────────────────────────
export function demoTopicsResponse() {
  return NextResponse.json({
    topics: [
      { name: "Service client", mentions: 342, sentiment: -0.32, trend: -8 },
      { name: "Frais bancaires", mentions: 287, sentiment: -0.58, trend: -15 },
      { name: "Digitalisation", mentions: 234, sentiment: 0.42, trend: 12 },
      { name: "Agences", mentions: 198, sentiment: 0.08, trend: 2 },
      { name: "Panafrican", mentions: 156, sentiment: 0.61, trend: 8 },
      { name: "Résultats financiers", mentions: 134, sentiment: 0.74, trend: 5 },
    ],
  });
}

// ─── /api/console/notifications ────────────────────────────────
export function demoNotificationsResponse() {
  return NextResponse.json({ notifications: getDemoNotifications() });
}

// ─── /api/console/crisis ───────────────────────────────────────
export function demoCrisisResponse() {
  return NextResponse.json({
    score: 12,
    level: "safe",
    trend: -5,
    factors: [
      { name: "Sentiment velocity", value: 0.18, status: "nominal" },
      { name: "Mention volume", value: 0.22, status: "nominal" },
      { name: "Negative share", value: 0.31, status: "watch" },
      { name: "Influencer activity", value: 0.08, status: "nominal" },
      { name: "Cross-source coherence", value: 0.12, status: "nominal" },
    ],
    contributingAlerts: 1,
    recommendation: "No crisis detected. Sentiment is stable with a slight negative tilt on service-client topics.",
  });
}

// ─── /api/console/geo-signals ──────────────────────────────────
export function demoGeoSignalsResponse() {
  return NextResponse.json({
    range: "7d",
    cities: [
      { city: "Casablanca", lat: 33.5731, lng: -7.5898, alerts: 47, sentiment: -0.12, topSource: "hespress" },
      { city: "Rabat", lat: 34.0209, lng: -6.8416, alerts: 23, sentiment: 0.08, topSource: "le360" },
      { city: "Marrakech", lat: 31.6295, lng: -7.9811, alerts: 18, sentiment: 0.21, topSource: "telquel" },
      { city: "Tanger", lat: 35.7595, lng: -5.834, alerts: 14, sentiment: -0.05, topSource: "medias24" },
      { city: "Fès", lat: 34.0181, lng: -5.0078, alerts: 9, sentiment: 0.15, topSource: "leseco" },
      { city: "Agadir", lat: 30.4278, lng: -9.5981, alerts: 6, sentiment: 0.32, topSource: "aujourdhui" },
    ],
    totalAlerts: 117,
    hotspotCity: "Casablanca",
  });
}

// ─── /api/console/insights ─────────────────────────────────────
export function demoInsightsResponse() {
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    persona: "brand-monitor",
    dataPoints: 34,
    model: "glm-4",
    cached: false,
    insights: [
      {
        id: "insight-1",
        type: "opportunity",
        priority: "high",
        title: "Pic positif sur la digitalisation",
        body: "Le lancement du nouveau mobile banking a généré 234 mentions positives en 48h. Capitaliser avec une campagne de communication sur les réseaux sociaux.",
        confidence: 0.82,
      },
      {
        id: "insight-2",
        type: "risk",
        priority: "critical",
        title: "Bad buzz sur les frais bancaires",
        body: "142 mentions négatives en 2h sur Hespress et Le360. Une vidéo TikTok atteint 80K vues. Recommandation : réponse publique dans l'heure.",
        confidence: 0.91,
      },
      {
        id: "insight-3",
        type: "trend",
        priority: "medium",
        title: "Image panafricaine se renforce",
        body: "La couverture de l'expansion africaine génère un sentiment positif de +0.61. Angle à exploiter pour le prochain rapport annuel.",
        confidence: 0.74,
      },
    ],
  });
}

// ─── /api/console/sentiment-trend ──────────────────────────────
export function demoSentimentTrendResponse() {
  const now = Date.now();
  const days = 30;
  const series = Array.from({ length: days }, (_, i) => {
    const d = new Date(now - (days - 1 - i) * 86400_000);
    const base = 0.3 + Math.sin(i / 4) * 0.25 + (i / days) * 0.1;
    return {
      date: d.toISOString().slice(0, 10),
      score: Number(base.toFixed(3)),
      mentions: Math.round(40 + Math.random() * 30 + Math.sin(i / 3) * 15),
    };
  });
  return NextResponse.json({ series, trend: "up", delta: 0.08 });
}

// ─── /api/company/settings (GET) ───────────────────────────────
export function demoCompanySettingsResponse() {
  const company = getDemoCompany();
  const settings = getDemoCompanySettings();
  return NextResponse.json({
    company: {
      id: company.id,
      name: company.name,
      slug: company.slug,
      sector: company.sector,
      iceNumber: "001234567000045",
      rcNumber: "78945",
      website: company.website,
      headquarters: company.headquarters,
      aliases: company.aliases,
      parent: null,
      subsidiaries: [],
    },
    settings: {
      plan: settings.plan,
      seats: settings.seats,
      topics: ["service-client", "frais-bancaires", "digital", "agences", "panafrican"],
      competitors: ["Bank of Africa", "Banque Centrale Populaire", "CIH Bank"],
      monitoredSources: settings.sources,
      alertThresholds: { sentimentDrop: -0.3, riskLevel: "high", minMentions: 5 },
      whatsappEnabled: settings.whatsappEnabled,
      briefingSchedule: settings.briefingSchedule,
    },
  });
}

// ─── /api/company/settings (PATCH) ─────────────────────────────
export function demoCompanySettingsPatchResponse(body: Record<string, unknown>) {
  // Acknowledge the update — in-memory, so just echo back what was sent
  return NextResponse.json({
    ok: true,
    updated: true,
    message: "Demo settings updated (in-memory, not persisted).",
    received: body,
  });
}

// ─── /api/company/team (GET) ───────────────────────────────────
export function demoCompanyTeamResponse() {
  const team = getDemoTeam();
  const invitations = getDemoInvitations();
  return NextResponse.json({
    users: team.map((m) => ({
      id: m.id,
      email: m.email,
      name: m.name,
      role: m.role,
      accountType: "brand-monitor",
      status: m.status,
      lastLoginAt: m.lastLoginAt,
      createdAt: new Date(Date.now() - 90 * 86400_000).toISOString(),
      whatsappAlerts: m.role === "company-admin",
      whatsappNumber: m.role === "company-admin" ? "+212600000000" : null,
    })),
    invitations,
    pendingInvitations: invitations.filter((i) => i.status === "pending").length,
  });
}

// ─── /api/company/team (PATCH) ─────────────────────────────────
export function demoCompanyTeamPatchResponse(body: Record<string, unknown>) {
  return NextResponse.json({
    ok: true,
    updated: true,
    message: "Demo team member updated (in-memory).",
    received: body,
  });
}

// ─── /api/company/team (DELETE) ────────────────────────────────
export function demoCompanyTeamDeleteResponse() {
  return NextResponse.json({ ok: true, suspended: true, message: "Demo member suspended (in-memory)." });
}

// ─── /api/company/invite (GET) ─────────────────────────────────
export function demoCompanyInviteListResponse() {
  return NextResponse.json({ invitations: getDemoInvitations() });
}

// ─── /api/company/invite (POST) ────────────────────────────────
export function demoCompanyInvitePostResponse(body: Record<string, unknown>) {
  const email = (body.email as string) || "invited@attijariwafa.com";
  const name = (body.name as string) || "Invited User";
  const role = (body.role as string) || "user";
  const accountType = (body.accountType as string) || "brand-monitor";
  return NextResponse.json({
    ok: true,
    invitation: {
      id: `demo-inv-${Date.now()}`,
      token: `demo-token-${Date.now().toString(36)}`,
      url: `/atelier/access?token=demo-token-${Date.now().toString(36)}`,
      email,
      name,
      accountType,
      role,
      expiresAt: new Date(Date.now() + 7 * 86400_000).toISOString(),
    },
    message: "Demo invitation created (in-memory, not emailed).",
  });
}
