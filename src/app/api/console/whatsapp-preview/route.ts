// ═══════════════════════════════════════════════════════════════
//  POST /api/console/whatsapp-preview
//
//  Returns the WhatsApp alert preview payload — what the Dircom
//  would actually receive on their phone. Three sample alerts
//  (crisis / daily / weekly) driven by REAL data when available,
//  with a deterministic demo fallback.
//
//  Request body (optional):
//    { phoneNumber?: string,
//      alertTypes?: { crisis?: boolean, daily?: boolean, weekly?: boolean } }
//
//  Response:
//    { alerts: [{ type, message, timestamp, severity }],
//      config: { phoneNumber, alertTypes: { crisis, daily, weekly }, enabled } }
//
//  NO emojis. French. Deterministic.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { isDemoEmail } from "@/lib/demo-session";
import { prisma } from "@/lib/db";
import { logInfo } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

type AlertType = "crisis" | "daily" | "weekly";
type Severity = "critical" | "warning" | "info";

interface AlertItem {
  type: AlertType;
  message: string;
  timestamp: string;
  severity: Severity;
}

interface PreviewConfig {
  phoneNumber: string;
  alertTypes: { crisis: boolean; daily: boolean; weekly: boolean };
  enabled: boolean;
}

interface PreviewResponse {
  alerts: AlertItem[];
  config: PreviewConfig;
  source: "neon" | "demo";
  companyName: string;
}

const DEFAULT_PHONE = "+212 6 00 00 00 00";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse optional config from body
  let bodyPhoneNumber: string | undefined;
  let bodyAlertTypes: Partial<Record<AlertType, boolean>> | undefined;
  try {
    const body = await req.json();
    bodyPhoneNumber = typeof body?.phoneNumber === "string" ? body.phoneNumber : undefined;
    bodyAlertTypes = body?.alertTypes && typeof body.alertTypes === "object" ? body.alertTypes : undefined;
  } catch {
    // Empty / invalid body is fine — we fall back to defaults
  }

  const alertTypes = {
    crisis: bodyAlertTypes?.crisis ?? true,
    daily: bodyAlertTypes?.daily ?? true,
    weekly: bodyAlertTypes?.weekly ?? true,
  };
  const phoneNumber = (bodyPhoneNumber && bodyPhoneNumber.trim().length > 0)
    ? bodyPhoneNumber.trim()
    : DEFAULT_PHONE;

  // Demo users and missing companyId → deterministic demo payload
  const isDemo = session.user.isDemo || isDemoEmail(session.user.email);
  const companyId = session.user.companyId;
  if (isDemo || !companyId) {
    const demo = buildDemo(alertTypes, phoneNumber);
    logInfo("whatsapp-preview", `demo preview rendered (alerts=${demo.alerts.length})`);
    return NextResponse.json(demo);
  }

  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 86400000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);

    const [company, reputationScore, articles24h, articles7d, negativeCount] = await Promise.all([
      prisma.company.findUnique({
        where: { id: companyId },
        select: { name: true, sector: true },
      }),
      prisma.reputationScore.findFirst({
        where: { companyId },
        orderBy: { calculatedAt: "desc" },
      }),
      prisma.article.findMany({
        where: { companyId, publishedAt: { gte: oneDayAgo } },
        orderBy: { publishedAt: "desc" },
        take: 5,
        select: { title: true, source: true, sentimentLabel: true, publishedAt: true },
      }),
      prisma.article.findMany({
        where: { companyId, publishedAt: { gte: sevenDaysAgo } },
        select: { sentimentLabel: true },
      }),
      prisma.article.count({
        where: { companyId, sentimentLabel: "negative", publishedAt: { gte: oneDayAgo } },
      }),
    ]);

    const companyName = company?.name ?? "Votre entreprise";

    const pos = articles7d.filter(a => a.sentimentLabel === "positive").length;
    const neg = articles7d.filter(a => a.sentimentLabel === "negative").length;
    const neu = articles7d.filter(a => a.sentimentLabel === "neutral").length;
    const total = articles7d.length || 1;

    const posPct = Math.round((pos / total) * 100);
    const neuPct = Math.round((neu / total) * 100);
    const negPct = Math.round((neg / total) * 100);
    const score = reputationScore?.overall ?? 50;
    const trend = reputationScore?.trend === "up" ? "+2" : reputationScore?.trend === "down" ? "-3" : "0";

    const alerts: AlertItem[] = [];

    // CRISIS — only if negative pressure crosses threshold
    if (alertTypes.crisis) {
      if (negativeCount >= 5) {
        alerts.push({
          type: "crisis",
          severity: negativeCount >= 10 ? "critical" : "warning",
          timestamp: now.toISOString(),
          message: buildCrisisMessage(companyName, negativeCount, articles24h[0]?.title ?? null),
        });
      } else {
        // Even with no crisis, show a calm info-level crisis card so the preview
        // always demonstrates the format.
        alerts.push({
          type: "crisis",
          severity: "info",
          timestamp: now.toISOString(),
          message: `Aucune alerte critique détectée pour ${companyName}. Veille maintenue.`,
        });
      }
    }

    // DAILY — every morning at 07h00
    if (alertTypes.daily) {
      alerts.push({
        type: "daily",
        severity: score < 50 ? "warning" : "info",
        timestamp: now.toISOString(),
        message: buildDailyMessage(companyName, score, trend, articles24h.length, posPct, neuPct, negPct, articles24h[0]?.title ?? null),
      });
    }

    // WEEKLY — every Monday at 08h00
    if (alertTypes.weekly) {
      alerts.push({
        type: "weekly",
        severity: "info",
        timestamp: now.toISOString(),
        message: buildWeeklyMessage(companyName, score, articles7d.length, posPct, negPct),
      });
    }

    const config: PreviewConfig = {
      phoneNumber,
      alertTypes,
      enabled: alertTypes.crisis || alertTypes.daily || alertTypes.weekly,
    };

    const response: PreviewResponse = {
      alerts,
      config,
      source: "neon",
      companyName,
    };

    logInfo("whatsapp-preview", `preview built for ${companyName}: ${alerts.length} alerts, score=${score}, neg24h=${negativeCount}`);
    return NextResponse.json(response);
  } catch (err) {
    logInfo("whatsapp-preview", `neon build failed, returning demo: ${err}`);
    return NextResponse.json(buildDemo(alertTypes, phoneNumber));
  }
}

// ───────────────────────────────────────────────────────────────
//  Message builders — French, NO emojis, plain-text WhatsApp style
// ───────────────────────────────────────────────────────────────

function buildCrisisMessage(companyName: string, negCount: number, topTitle: string | null): string {
  const lines: string[] = [];
  lines.push(`ALERTE CRISE — ${companyName}`);
  lines.push(`${negCount} mentions négatives détectées ces 24h.`);
  if (topTitle) {
    lines.push(`Signal dominant: ${truncate(topTitle, 80)}`);
  }
  lines.push(`Action requise: activer le mode crise, préparer communiqué.`);
  lines.push(`Console: /atelier/console`);
  return lines.join("\n");
}

function buildDailyMessage(
  companyName: string,
  score: number,
  trend: string,
  mentionCount: number,
  posPct: number,
  neuPct: number,
  negPct: number,
  topTitle: string | null,
): string {
  const dateStr = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  const lines: string[] = [];
  lines.push(`Briefing du ${dateStr}`);
  lines.push(`${companyName} — Score: ${score}/100 (${trend} pts)`);
  lines.push(`Mentions 24h: ${mentionCount}`);
  lines.push(`Positif ${posPct}% · Neutre ${neuPct}% · Négatif ${negPct}%`);
  if (topTitle) {
    lines.push(`Top: ${truncate(topTitle, 70)}`);
  }
  lines.push(`— HarchIQ`);
  return lines.join("\n");
}

function buildWeeklyMessage(
  companyName: string,
  score: number,
  total7d: number,
  posPct: number,
  negPct: number,
): string {
  const monday = new Date();
  monday.setDate(monday.getDate() - 7);
  const start = monday.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  const end = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  const lines: string[] = [];
  lines.push(`Synthèse hebdo — ${start} au ${end}`);
  lines.push(`${companyName} — Score moyen: ${score}/100`);
  lines.push(`${total7d} mentions analysées sur 7 jours.`);
  lines.push(`Positif ${posPct}% · Négatif ${negPct}%`);
  lines.push(`Rapport complet: /atelier/console`);
  lines.push(`— HarchIQ`);
  return lines.join("\n");
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1).trimEnd() + "…";
}

// ───────────────────────────────────────────────────────────────
//  Demo fallback — deterministic, no random
// ───────────────────────────────────────────────────────────────

function buildDemo(alertTypes: PreviewConfig["alertTypes"], phoneNumber: string): PreviewResponse {
  const now = new Date().toISOString();
  const alerts: AlertItem[] = [];

  if (alertTypes.crisis) {
    alerts.push({
      type: "crisis",
      severity: "critical",
      timestamp: now,
      message: [
        "ALERTE CRISE — Attijariwafa Bank",
        "12 mentions négatives détectées ces 24h.",
        "Signal dominant: Frais bancaires excessifs — cascade Darija",
        "Vélocité: 35/h · 65% négatif",
        "Action requise: activer le mode crise, préparer communiqué.",
        "Console: /atelier/console",
      ].join("\n"),
    });
  }

  if (alertTypes.daily) {
    alerts.push({
      type: "daily",
      severity: "warning",
      timestamp: now,
      message: [
        `Briefing du ${new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}`,
        "Attijariwafa Bank — Score: 74/100 (-3 pts)",
        "Mentions 24h: 1247",
        "Positif 42% · Neutre 28% · Négatif 30%",
        "Top: Bad buzz frais bancaires — cascade Darija",
        "— HarchIQ",
      ].join("\n"),
    });
  }

  if (alertTypes.weekly) {
    alerts.push({
      type: "weekly",
      severity: "info",
      timestamp: now,
      message: [
        "Synthèse hebdo — 7 derniers jours",
        "Attijariwafa Bank — Score moyen: 76/100",
        "6842 mentions analysées sur 7 jours.",
        "Positif 45% · Négatif 28%",
        "Rapport complet: /atelier/console",
        "— HarchIQ",
      ].join("\n"),
    });
  }

  return {
    alerts,
    config: {
      phoneNumber,
      alertTypes,
      enabled: alertTypes.crisis || alertTypes.daily || alertTypes.weekly,
    },
    source: "demo",
    companyName: "Attijariwafa Bank",
  };
}
