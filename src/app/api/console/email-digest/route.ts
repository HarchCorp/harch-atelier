// ═══════════════════════════════════════════════════════════════
//  POST /api/console/email-digest
//
//  Weekly / monthly email digest — generates a branded HTML email
//  from REAL data (brand-health, top articles, sentiment, top
//  sources) and sends it to a list of recipients via Resend.
//
//  Body:
//    {
//      recipients: string[],                          // email list
//      schedule: "weekly" | "monthly" | "custom",     // cadence
//      format:   "pdf" | "html",                      // delivery shape
//      mode?:    "preview" | "send",                  // default "send"
//      test?:    boolean                              // prefix [TEST]
//    }
//
//  Returns:
//    {
//      success: boolean,                              // true if sent or preview built
//      recipients: string[],                          // echoed back
//      preview: string,                               // full HTML email body
//      scheduledNext: string,                         // ISO datetime
//      schedule, format, source, sent, mode, subject
//    }
//
//  Auth: requires session. Company must be linked.
//  Design: white / sage / charcoal, Space Mono + Inter, French, NO emojis.
//  If RESEND_API_KEY is unset the route still returns the preview
//  (sent=false, source="preview") so the popup can render it.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { logInfo, logError } from "@/lib/logger";
import type { DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

// ─── Design tokens (mirror BriefingGenerator / brand-health) ─────
const SAGE = "#4A7B5F";
const SAGE_BG = "rgba(74,123,95,0.06)";
const SAGE_BORDER = "rgba(74,123,95,0.20)";
const CHARCOAL = "#0A0A0A";
const TEXT_BODY = "#525252";
const TEXT_MUTED = "#71717A";
const BORDER = "#F0F0F0";
const POSITIVE = "#10B981";
const NEGATIVE = "#EF4444";
const NEUTRAL_BAR = "#E5E5E5";

const FROM = "Harch Atelier <atelier@harchcorp.com>";
const REPLY_TO = "atelier@harchcorp.com";
const CONSOLE_URL = "https://atelier.harchcorp.com/atelier/console";

// ─── Body shape ─────────────────────────────────────────────────
interface EmailDigestBody {
  recipients: string[];
  schedule: "weekly" | "monthly" | "custom";
  format: "pdf" | "html";
  mode?: "preview" | "send";
  test?: boolean;
}

// ─── Email validation (RFC-lite, good enough for ops use) ────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function isValidEmail(v: unknown): v is string {
  return typeof v === "string" && EMAIL_RE.test(v) && v.length <= 254;
}

// ─── Digest data shape (built from Prisma rows) ─────────────────
interface DigestArticle {
  title: string;
  source: string;
  dateLabel: string;
  url: string;
  sentiment: "positive" | "neutral" | "negative";
  sentimentLabel: string;
}

interface DigestData {
  companyName: string;
  sector: string | null;
  dateLabel: string;          // "lundi 13 août 2024"
  weekStartLabel: string;     // "7 août"
  weekEndLabel: string;       // "13 août"
  schedule: "weekly" | "monthly" | "custom";
  scheduleLabel: string;      // "Hebdomadaire · Lundi 08h00"
  score: number;
  scoreColor: string;
  trend: number;
  trendLabel: string;
  trendColor: string;
  sentiment: { positive: number; neutral: number; negative: number };
  mentions24h: number;
  mentions7d: number;
  totalArticles: number;
  topArticles: DigestArticle[];
  topSources: Array<{ source: string; count: number }>;
  recommendation: string;
  status: "nominal" | "limited" | "no_data";
}

// ─── Main POST handler ──────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Auth
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const companyId = session.user.companyId;
  if (!companyId) {
    return NextResponse.json({ error: "No company linked" }, { status: 400 });
  }

  // 2. Parse + validate body
  let body: EmailDigestBody;
  try {
    const raw = await req.json();
    body = raw as EmailDigestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const schedule: EmailDigestBody["schedule"] =
    body.schedule === "monthly" ? "monthly" :
    body.schedule === "custom"  ? "custom"  : "weekly";
  const format: "pdf" | "html" = body.format === "pdf" ? "pdf" : "html";
  const mode: "preview" | "send" = body.mode === "preview" ? "preview" : "send";
  const test = body.test === true;

  const recipientsRaw = Array.isArray(body.recipients) ? body.recipients : [];
  let recipients = Array.from(
    new Set(recipientsRaw.filter(isValidEmail).map((e) => e.toLowerCase())),
  );

  // In preview mode, allow empty recipients (use a placeholder so the
  // popup can render the email mockup before the user has configured
  // its distribution list).
  if (recipients.length === 0 && mode === "preview") {
    recipients = ["apercu@harchcorp.com"];
  }
  if (recipients.length === 0) {
    return NextResponse.json(
      { error: "Aucun destinataire valide fourni." },
      { status: 400 },
    );
  }
  if (recipients.length > 50) {
    return NextResponse.json(
      { error: "Trop de destinataires (maximum 50 par envoi)." },
      { status: 400 },
    );
  }

  // 3. Fetch real data in parallel (brand-health, articles, sources)
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
  const oneDayAgo = new Date(now.getTime() - 86400000);

  try {
    const [
      company,
      reputationScore,
      articles24hCount,
      articles7dRaw,
      topArticlesRaw,
      topSourcesRaw,
      totalCompanyArticles,
    ] = await Promise.all([
      prisma.company.findUnique({
        where: { id: companyId },
        select: { name: true, sector: true },
      }),
      prisma.reputationScore.findFirst({
        where: { companyId },
        orderBy: { calculatedAt: "desc" },
      }),
      prisma.article.count({
        where: { companyId, publishedAt: { gte: oneDayAgo } },
      }),
      prisma.article.findMany({
        where: { companyId, publishedAt: { gte: sevenDaysAgo } },
        select: { sentimentLabel: true },
        take: 500,
      }),
      prisma.article.findMany({
        where: { companyId },
        orderBy: { publishedAt: "desc" },
        select: {
          title: true, source: true, publishedAt: true, url: true,
          sentimentLabel: true,
        },
        take: 10,
      }),
      prisma.article.groupBy({
        by: ["source"],
        where: { companyId, publishedAt: { gte: sevenDaysAgo } },
        _count: true,
        orderBy: { _count: { source: "desc" } },
        take: 5,
      }),
      prisma.article.count({ where: { companyId } }),
    ]);

    // 4. Compute sentiment
    const positive = articles7dRaw.filter((a) => a.sentimentLabel === "positive").length;
    const negative = articles7dRaw.filter((a) => a.sentimentLabel === "negative").length;
    const neutral  = articles7dRaw.filter((a) => a.sentimentLabel === "neutral").length;
    const totalSent = articles7dRaw.length || 1;
    const sentiment = {
      positive: Math.round((positive / totalSent) * 100),
      neutral:  Math.round((neutral  / totalSent) * 100),
      negative: Math.round((negative / totalSent) * 100),
    };

    const negativeShare = negative / totalSent;
    const crisisScore = Math.min(
      100,
      Math.round(negativeShare * 60 + Math.min(25, (articles24hCount / 50) * 25)),
    );
    const crisisLevel: "safe" | "watch" | "warning" | "critical" =
      crisisScore >= 75 ? "critical" :
      crisisScore >= 50 ? "warning"  :
      crisisScore >= 25 ? "watch"    : "safe";

    const score = reputationScore?.overall ?? 0;
    const trend =
      reputationScore?.trend === "up"   ? 2  :
      reputationScore?.trend === "down" ? -3 : 0;

    const scoreColor =
      score >= 70 ? SAGE :
      score >= 50 ? "#F59E0B" : NEGATIVE;

    const trendLabel =
      trend > 0 ? `Hausse +${trend} pts` :
      trend < 0 ? `Baisse ${trend} pts`  : "Stable";
    const trendColor =
      trend > 0 ? POSITIVE :
      trend < 0 ? NEGATIVE : TEXT_MUTED;

    // 5. Top articles (cap 5)
    const topArticles: DigestArticle[] = topArticlesRaw.slice(0, 5).map((a) => {
      const sent = (a.sentimentLabel ?? "neutral") as "positive" | "neutral" | "negative";
      return {
        title: a.title,
        source: a.source,
        dateLabel: a.publishedAt
          ? a.publishedAt.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
          : "—",
        url: a.url,
        sentiment: sent,
        sentimentLabel:
          sent === "positive" ? "positif" :
          sent === "negative" ? "négatif" : "neutre",
      };
    });

    // 6. Build digest data
    const companyName = company?.name ?? "Votre entreprise";
    const scheduleLabel =
      schedule === "weekly"  ? "Hebdomadaire · Lundi 08h00" :
      schedule === "monthly" ? "Mensuel · 1er du mois 08h00" :
                               "Personnalisé · Lundi 08h00";

    const digest: DigestData = {
      companyName,
      sector: company?.sector ?? null,
      dateLabel: now.toLocaleDateString("fr-FR", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      }),
      weekStartLabel: sevenDaysAgo.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
      weekEndLabel:   now.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
      schedule,
      scheduleLabel,
      score: totalCompanyArticles === 0 ? 0 : score,
      scoreColor: totalCompanyArticles === 0 ? TEXT_MUTED : scoreColor,
      trend,
      trendLabel,
      trendColor,
      sentiment,
      mentions24h: articles24hCount,
      mentions7d: articles7dRaw.length,
      totalArticles: totalCompanyArticles,
      topArticles,
      topSources: topSourcesRaw.map((s) => ({ source: s.source, count: s._count })),
      recommendation: buildRecommendation(score, crisisLevel, sentiment, totalCompanyArticles),
      status:
        totalCompanyArticles === 0 ? "no_data" :
        totalCompanyArticles < 10  ? "limited" : "nominal",
    };

    // 7. Build HTML email body (inline-styled, white/sage/charcoal)
    const subject = buildSubject(digest, test);
    const preview = buildHtmlEmail(digest);

    // 8. scheduledNext (Africa/Casablanca, 08:00 local → display label)
    const scheduledNext = computeScheduledNext(schedule);

    // 9. Send via Resend if mode=send AND key configured
    let sent = false;
    let sendError: string | null = null;
    let sendId: string | null = null;

    if (mode === "send") {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey || apiKey.trim() === "") {
        sendError = "RESEND_API_KEY non configuré — aperçu généré, aucun envoi.";
        logInfo("email-digest", `[DIGEST PREVIEW-ONLY] ${recipients.length} recipient(s) — no RESEND_API_KEY`);
      } else {
        try {
          const attachments: Array<{
            filename: string;
            content: string;
            contentType: string;
          }> = [];

          if (format === "pdf") {
            // Render a real PDF buffer using @react-pdf/renderer.
            // Loaded lazily so preview-mode requests never pay the cost.
            const pdfMod = await import("@react-pdf/renderer");
            const React = (await import("react")).default;
            const element = buildPdfDocument(React, pdfMod, digest) as ReactElement<DocumentProps>;
            const buffer = await pdfMod.renderToBuffer(element);
            attachments.push({
              filename: `synthese-hebdomadaire-${now.toISOString().slice(0, 10)}.pdf`,
              content: buffer.toString("base64"),
              contentType: "application/pdf",
            });
          }

          const payload: Record<string, unknown> = {
            from: FROM,
            to: recipients,
            reply_to: REPLY_TO,
            subject,
            html: format === "pdf" ? buildPdfIntroHtml(digest) : preview,
          };
          if (attachments.length > 0) {
            payload.attachments = attachments;
          }

          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(20_000),
          });

          if (!res.ok) {
            const errText = await res.text().catch(() => "");
            sendError = `Resend API ${res.status}: ${errText.slice(0, 200)}`;
            logError("email-digest", `[DIGEST SEND FAIL] ${sendError}`);
          } else {
            const data = (await res.json()) as { id?: string };
            sent = true;
            sendId = data.id ?? null;
            logInfo(
              "email-digest",
              `[DIGEST SENT] to=${recipients.length} format=${format} id=${sendId ?? "n/a"} schedule=${schedule}`,
            );
          }
        } catch (err) {
          sendError = err instanceof Error ? err.message : "unknown send error";
          logError("email-digest", `[DIGEST SEND EXCEPTION] ${sendError}`);
        }
      }
    } else {
      logInfo(
        "email-digest",
        `[DIGEST PREVIEW] company=${companyName} recipients=${recipients.length} format=${format}`,
      );
    }

    // 10. Response
    return NextResponse.json({
      success: mode === "preview" ? true : sent,
      recipients,
      preview,
      scheduledNext: scheduledNext.toISOString(),
      scheduledNextLabel: formatScheduledLabel(scheduledNext),
      schedule,
      format,
      scheduleLabel: digest.scheduleLabel,
      subject,
      source: mode === "preview" ? "preview" : sent ? "resend" : "preview",
      sent,
      sendError,
      sendId,
      mode,
      test,
      companyName: digest.companyName,
      status: digest.status,
    });
  } catch (err) {
    logError("email-digest", `POST failed: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}

// ═══════════════════════════════════════════════════════════════
//  HTML EMAIL BUILDER
//  Inline-styled, white/sage/charcoal, Space Mono + Inter, French.
//  NO emojis. Returns a full <!DOCTYPE html> document.
// ═══════════════════════════════════════════════════════════════

function buildSubject(d: DigestData, test: boolean): string {
  const prefix = test ? "[TEST] " : "";
  const period =
    d.schedule === "monthly" ? "Mensuelle" : "Hebdomadaire";
  return `${prefix}Synthèse ${period} — ${d.companyName} · ${d.weekStartLabel} → ${d.weekEndLabel}`;
}

function buildHtmlEmail(d: DigestData): string {
  const scoreDisplay = d.status === "no_data" ? "—" : String(d.score);

  const articlesHtml = d.topArticles.length > 0
    ? d.topArticles.map((a) => {
        const sentColor =
          a.sentiment === "positive" ? POSITIVE :
          a.sentiment === "negative" ? NEGATIVE : TEXT_MUTED;
        return `
          <div style="margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid ${BORDER};">
            <a href="${escapeHtml(a.url)}" style="font-size:14px;font-weight:600;color:${CHARCOAL};text-decoration:none;line-height:1.4;display:block;">${escapeHtml(a.title)}</a>
            <div style="font-size:11px;color:${TEXT_MUTED};margin-top:4px;font-family:'Inter',sans-serif;">
              ${escapeHtml(a.source)} · ${a.dateLabel} · <span style="color:${sentColor};font-weight:600;">${a.sentimentLabel}</span>
            </div>
          </div>`;
      }).join("")
    : `<p style="font-size:13px;color:${TEXT_MUTED};margin:0;">Collecte d'articles en cours. Vos premiers résultats apparaîtront sous 24 à 48 heures.</p>`;

  const sourcesHtml = d.topSources.length > 0
    ? d.topSources.map((s) =>
        `<span style="display:inline-block;padding:4px 10px;background:${SAGE_BG};border:1px solid ${SAGE_BORDER};border-radius:4px;font-size:12px;color:${SAGE};margin:0 6px 6px 0;font-family:'Inter',sans-serif;">${escapeHtml(s.source)} (${s.count})</span>`,
      ).join("")
    : "";

  const scoreTrendBlock = d.status === "no_data"
    ? `<span style="font-size:12px;color:${TEXT_MUTED};">Collecte en cours</span>`
    : `
      <div>
        <div style="font-size:14px;font-weight:600;color:${d.trendColor};font-family:'Inter',sans-serif;">${d.trendLabel}</div>
        <span style="font-size:12px;color:${TEXT_MUTED};">/ 100</span>
      </div>`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(buildSubject(d, false))}</title>
</head>
<body style="margin:0;padding:0;background:#FAFAFA;font-family:'Inter',system-ui,-apple-system,sans-serif;color:${CHARCOAL};">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

    <!-- Logo badge -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;padding:8px 16px;background:${SAGE};color:#FFFFFF;font-family:'Space Mono',monospace;font-size:14px;font-weight:700;letter-spacing:0.04em;border-radius:4px;">
        HARCH ATELIER
      </div>
    </div>

    <!-- Main card -->
    <div style="background:#FFFFFF;border:1px solid ${BORDER};border-radius:12px;padding:40px;">

      <div style="font-family:'Space Mono',monospace;font-size:11px;color:${SAGE};text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">Synthèse ${d.schedule === "monthly" ? "mensuelle" : "hebdomadaire"}</div>
      <h1 style="font-size:24px;font-weight:700;margin:0 0 4px;color:${CHARCOAL};letter-spacing:-0.01em;">Veille réputationnelle — ${escapeHtml(d.companyName)}</h1>
      <p style="font-size:13px;color:${TEXT_MUTED};margin:0 0 32px;font-family:'Space Mono',monospace;">
        ${d.schedule === "monthly" ? "Mois courant" : "Semaine"} du ${d.weekStartLabel} au ${d.weekEndLabel}
      </p>

      <!-- Score -->
      <div style="background:#FAFAFA;border:1px solid ${BORDER};border-radius:8px;padding:20px;margin-bottom:24px;">
        <div style="font-family:'Space Mono',monospace;font-size:10px;color:${TEXT_MUTED};text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">Score de réputation</div>
        <div style="display:flex;align-items:center;gap:16px;">
          <span style="font-size:48px;font-weight:700;color:${d.scoreColor};line-height:1;font-family:'Space Mono',monospace;">${scoreDisplay}</span>
          ${scoreTrendBlock}
        </div>
      </div>

      <!-- Sentiment bar -->
      <div style="margin-bottom:24px;">
        <div style="font-family:'Space Mono',monospace;font-size:10px;color:${TEXT_MUTED};text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">Sentiment (7 jours)</div>
        <div style="display:flex;gap:2px;height:8px;border-radius:4px;overflow:hidden;">
          <div style="flex:${d.sentiment.positive};background:${POSITIVE};"></div>
          <div style="flex:${d.sentiment.neutral};background:${NEUTRAL_BAR};"></div>
          <div style="flex:${d.sentiment.negative};background:${NEGATIVE};"></div>
        </div>
        <div style="display:flex;gap:16px;margin-top:8px;font-size:12px;font-family:'Inter',sans-serif;">
          <span style="color:${POSITIVE};">${d.sentiment.positive}% positif</span>
          <span style="color:${TEXT_MUTED};">${d.sentiment.neutral}% neutre</span>
          <span style="color:${NEGATIVE};">${d.sentiment.negative}% négatif</span>
        </div>
      </div>

      <!-- Mention counts -->
      <div style="display:flex;gap:12px;margin-bottom:24px;">
        <div style="flex:1;padding:16px;background:#FAFAFA;border:1px solid ${BORDER};border-radius:8px;">
          <div style="font-family:'Space Mono',monospace;font-size:10px;color:${TEXT_MUTED};text-transform:uppercase;letter-spacing:0.1em;">Mentions 24h</div>
          <div style="font-size:24px;font-weight:700;color:${CHARCOAL};font-family:'Space Mono',monospace;margin-top:4px;">${d.mentions24h}</div>
        </div>
        <div style="flex:1;padding:16px;background:#FAFAFA;border:1px solid ${BORDER};border-radius:8px;">
          <div style="font-family:'Space Mono',monospace;font-size:10px;color:${TEXT_MUTED};text-transform:uppercase;letter-spacing:0.1em;">Mentions 7j</div>
          <div style="font-size:24px;font-weight:700;color:${CHARCOAL};font-family:'Space Mono',monospace;margin-top:4px;">${d.mentions7d}</div>
        </div>
      </div>

      <!-- Top articles -->
      <div style="margin-bottom:24px;">
        <div style="font-family:'Space Mono',monospace;font-size:10px;color:${TEXT_MUTED};text-transform:uppercase;letter-spacing:0.1em;margin-bottom:12px;">Top articles</div>
        ${articlesHtml}
      </div>

      ${sourcesHtml ? `
      <!-- Top sources -->
      <div style="margin-bottom:24px;">
        <div style="font-family:'Space Mono',monospace;font-size:10px;color:${TEXT_MUTED};text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">Sources principales</div>
        <div style="display:flex;flex-wrap:wrap;">${sourcesHtml}</div>
      </div>` : ""}

      <!-- Recommendation -->
      <div style="background:${SAGE_BG};border:1px solid ${SAGE_BORDER};border-radius:8px;padding:16px;margin-bottom:24px;">
        <div style="font-family:'Space Mono',monospace;font-size:10px;color:${SAGE};text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;font-weight:700;">Recommandation HarchIQ</div>
        <p style="font-size:14px;color:${CHARCOAL};line-height:1.6;margin:0;font-family:'Inter',sans-serif;">${escapeHtml(d.recommendation)}</p>
      </div>

      <!-- CTA -->
      <a href="${CONSOLE_URL}" style="display:inline-block;padding:14px 28px;background:${CHARCOAL};color:#FFFFFF;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;font-family:'Inter',sans-serif;">Accéder à la console</a>

      <p style="font-size:13px;color:${TEXT_MUTED};margin:24px 0 0;line-height:1.5;font-family:'Inter',sans-serif;">
        Une question ? Répondez à cet email ou écrivez à
        <a href="mailto:${REPLY_TO}" style="color:${SAGE};">${REPLY_TO}</a>.
      </p>

    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:24px;">
      <p style="font-size:11px;color:#9CA3AF;font-family:'Space Mono',monospace;margin:0;">
        Harch Corp · Casablanca, Maroc · Conforme CNDP · Loi 09-08
      </p>
      <p style="font-size:10px;color:#D4D4D8;font-family:'Space Mono',monospace;margin:8px 0 0;">
        Cadence : ${escapeHtml(d.scheduleLabel)} · Prochaine échéance automatique
      </p>
    </div>

  </div>
</body>
</html>`;
}

// ─── Short HTML intro used when format=pdf (PDF attached separately) ─
function buildPdfIntroHtml(d: DigestData): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FAFAFA;font-family:'Inter',system-ui,sans-serif;color:${CHARCOAL};">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;padding:8px 16px;background:${SAGE};color:#FFFFFF;font-family:'Space Mono',monospace;font-size:14px;font-weight:700;letter-spacing:0.04em;border-radius:4px;">HARCH ATELIER</div>
    </div>
    <div style="background:#FFFFFF;border:1px solid ${BORDER};border-radius:12px;padding:40px;">
      <div style="font-family:'Space Mono',monospace;font-size:11px;color:${SAGE};text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">Synthèse ${d.schedule === "monthly" ? "mensuelle" : "hebdomadaire"} — PDF</div>
      <h1 style="font-size:22px;font-weight:700;margin:0 0 12px;color:${CHARCOAL};">Veille réputationnelle — ${escapeHtml(d.companyName)}</h1>
      <p style="font-size:14px;color:${TEXT_BODY};line-height:1.6;margin:0 0 16px;">
        Votre synthèse ${d.schedule === "monthly" ? "mensuelle" : "hebdomada"} est disponible en pièce jointe au format PDF.
        Score de réputation : <strong style="color:${d.scoreColor};font-family:'Space Mono',monospace;">${d.status === "no_data" ? "—" : d.score + "/100"}</strong>.
        Mentions 24h : <strong style="font-family:'Space Mono',monospace;">${d.mentions24h}</strong> · Mentions 7j : <strong style="font-family:'Space Mono',monospace;">${d.mentions7d}</strong>.
      </p>
      <p style="font-size:13px;color:${TEXT_MUTED};line-height:1.6;margin:0 0 24px;">
        Période couverte : ${d.weekStartLabel} → ${d.weekEndLabel}. Ouvrez la pièce jointe pour consulter le rapport complet.
      </p>
      <a href="${CONSOLE_URL}" style="display:inline-block;padding:14px 28px;background:${CHARCOAL};color:#FFFFFF;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;font-family:'Inter',sans-serif;">Accéder à la console</a>
    </div>
    <div style="text-align:center;margin-top:24px;">
      <p style="font-size:11px;color:#9CA3AF;font-family:'Space Mono',monospace;margin:0;">Harch Corp · Casablanca, Maroc · Conforme CNDP · Loi 09-08</p>
    </div>
  </div>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════
//  PDF DOCUMENT BUILDER (server-side, @react-pdf/renderer)
//  Uses React.createElement — no JSX, no extra .tsx file needed.
// ═══════════════════════════════════════════════════════════════

function buildPdfDocument(
  React: typeof import("react"),
  pdf: typeof import("@react-pdf/renderer"),
  d: DigestData,
): ReactElement {
  const { Document, Page, View, Text, StyleSheet } = pdf;

  const styles = StyleSheet.create({
    page: {
      paddingTop: 48, paddingBottom: 48, paddingHorizontal: 40,
      fontSize: 11, color: CHARCOAL, fontFamily: "Helvetica",
    },
    badge: {
      padding: "4px 12px", backgroundColor: SAGE, color: "#FFFFFF",
      fontFamily: "Courier", fontSize: 9, fontWeight: 700,
      letterSpacing: 1, alignSelf: "flex-start",
    },
    label: {
      fontFamily: "Courier", fontSize: 8, color: TEXT_MUTED,
      textTransform: "uppercase", letterSpacing: 1, marginBottom: 4,
    },
    h1: { fontSize: 20, fontWeight: 700, marginTop: 12, marginBottom: 2 },
    subtitle: { fontFamily: "Courier", fontSize: 9, color: TEXT_MUTED, marginBottom: 24 },
    card: {
      backgroundColor: "#FAFAFA", border: `1px solid ${BORDER}`,
      borderRadius: 6, padding: 14, marginBottom: 16,
    },
    scoreValue: { fontSize: 36, fontWeight: 700, fontFamily: "Courier" },
    row: { flexDirection: "row", alignItems: "baseline" } as const,
    article: {
      marginBottom: 8, paddingBottom: 8,
      borderBottom: `1px solid ${BORDER}`,
    },
    reco: {
      backgroundColor: SAGE_BG, border: `1px solid ${SAGE_BORDER}`,
      borderRadius: 6, padding: 12, marginTop: 16,
    },
    footer: {
      fontFamily: "Courier", fontSize: 8, color: "#9CA3AF",
      textAlign: "center", marginTop: 32,
    },
  });

  const scoreDisplay = d.status === "no_data" ? "—" : String(d.score);

  const articleViews = d.topArticles.length > 0
    ? d.topArticles.map((a, i) => {
        const sentColor =
          a.sentiment === "positive" ? POSITIVE :
          a.sentiment === "negative" ? NEGATIVE : TEXT_MUTED;
        return React.createElement(
          View,
          { key: i, style: styles.article, wrap: false },
          React.createElement(Text, { style: { fontSize: 11, fontWeight: 600 } }, a.title),
          React.createElement(
            Text,
            { style: { fontSize: 9, color: TEXT_MUTED, marginTop: 2 } },
            `${a.source} · ${a.dateLabel} · `,
          ),
          React.createElement(
            Text,
            { style: { fontSize: 9, color: sentColor, fontWeight: 600 } },
            a.sentimentLabel,
          ),
        );
      })
    : [
        React.createElement(
          Text,
          { style: { fontSize: 11, color: TEXT_MUTED } },
          "Collecte d'articles en cours. Vos premiers résultats apparaîtront sous 24 à 48 heures.",
        ),
      ];

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(View, null,
        React.createElement(Text, { style: styles.badge }, "HARCH ATELIER"),
      ),
      React.createElement(Text, { style: styles.h1 },
        `Synthèse ${d.schedule === "monthly" ? "mensuelle" : "hebdomadaire"} — ${d.companyName}`),
      React.createElement(Text, { style: styles.subtitle },
        `Semaine du ${d.weekStartLabel} au ${d.weekEndLabel} · ${d.scheduleLabel}`),

      // Score card
      React.createElement(View, { style: styles.card },
        React.createElement(Text, { style: styles.label }, "Score de réputation"),
        React.createElement(View, { style: styles.row },
          React.createElement(Text,
            { style: [styles.scoreValue, { color: d.scoreColor }] },
            scoreDisplay),
          React.createElement(Text,
            { style: { fontSize: 9, color: TEXT_MUTED, marginLeft: 6 } },
            d.status === "no_data" ? "Collecte en cours" : "/ 100"),
        ),
        React.createElement(Text,
          { style: { fontSize: 9, color: d.trendColor, marginTop: 4 } },
          d.trendLabel),
      ),

      // Sentiment
      React.createElement(Text, { style: styles.label }, "Sentiment (7 jours)"),
      React.createElement(View,
        { style: { flexDirection: "row", marginBottom: 12 } },
        React.createElement(Text,
          { style: { fontSize: 10, color: POSITIVE, marginRight: 12 } },
          `${d.sentiment.positive}% positif`),
        React.createElement(Text,
          { style: { fontSize: 10, color: TEXT_MUTED, marginRight: 12 } },
          `${d.sentiment.neutral}% neutre`),
        React.createElement(Text,
          { style: { fontSize: 10, color: NEGATIVE } },
          `${d.sentiment.negative}% négatif`),
      ),

      // Mentions
      React.createElement(View,
        { style: { flexDirection: "row", marginBottom: 16 } },
        React.createElement(View,
          { style: [styles.card, { flex: 1, marginBottom: 0, marginRight: 6 }] },
          React.createElement(Text, { style: styles.label }, "Mentions 24h"),
          React.createElement(Text,
            { style: { fontSize: 22, fontWeight: 700, fontFamily: "Courier" } },
            String(d.mentions24h)),
        ),
        React.createElement(View,
          { style: [styles.card, { flex: 1, marginBottom: 0, marginLeft: 6 }] },
          React.createElement(Text, { style: styles.label }, "Mentions 7j"),
          React.createElement(Text,
            { style: { fontSize: 22, fontWeight: 700, fontFamily: "Courier" } },
            String(d.mentions7d)),
        ),
      ),

      // Top articles
      React.createElement(Text, { style: styles.label }, "Top articles"),
      ...articleViews,

      // Recommendation
      React.createElement(View, { style: styles.reco },
        React.createElement(Text,
          { style: [styles.label, { color: SAGE, marginBottom: 4 }] },
          "Recommandation HarchIQ"),
        React.createElement(Text,
          { style: { fontSize: 11, lineHeight: 1.5 } },
          d.recommendation),
      ),

      // Footer
      React.createElement(Text, { style: styles.footer },
        "Harch Corp · Casablanca, Maroc · Conforme CNDP · Loi 09-08"),
    ),
  );
}

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════

function buildRecommendation(
  score: number,
  crisisLevel: "safe" | "watch" | "warning" | "critical",
  sentiment: { positive: number; neutral: number; negative: number },
  totalArticles: number,
): string {
  if (totalArticles === 0) {
    return "Collecte d'articles en cours. Votre score de réputation sera disponible dès que nous aurons suffisamment de données (24 à 48 heures).";
  }
  if (crisisLevel === "critical") {
    return `Attention — crise détectée. ${sentiment.negative}% des mentions sont négatives. Activez le Mode Crise, préparez un communiqué de réponse et contactez votre Dircom immédiatement.`;
  }
  if (crisisLevel === "warning") {
    return `Surveillance renforcée recommandée. ${sentiment.negative}% de sentiment négatif. Préparez un brief pour la direction et surveillez l'évolution dans les 48 heures.`;
  }
  if (score >= 70) {
    return `Réputation solide (${score}/100). Capitalisez sur le momentum positif (${sentiment.positive}% positif). Préparez un communiqué de succès et identifiez les sources favorables pour vos relations presse.`;
  }
  if (score >= 50) {
    return `Réputation stable (${score}/100). Amélioration possible. Concentrez-vous sur les narratifs négatifs (${sentiment.negative}%) et identifiez les sources critiques pour une stratégie de réponse.`;
  }
  return `Réputation fragile (${score}/100). Action requise. ${sentiment.negative}% de sentiment négatif. Audit recommandé : élaborez une stratégie de communication corrective.`;
}

function computeScheduledNext(schedule: "weekly" | "monthly" | "custom"): Date {
  // 08:00 Africa/Casablanca (UTC+1 year-round, no DST since 2019)
  // → 07:00 UTC.
  const now = new Date();

  if (schedule === "monthly") {
    // 1st of next month at 08:00 Casablanca = 07:00 UTC
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const firstOfThisMonth = new Date(Date.UTC(year, month, 1, 7, 0, 0, 0));
    if (now.getTime() < firstOfThisMonth.getTime()) {
      // Today is before 08:00 on the 1st → schedule this month's 1st
      return firstOfThisMonth;
    }
    // Otherwise → 1st of next month at 07:00 UTC
    return new Date(Date.UTC(year, month + 1, 1, 7, 0, 0, 0));
  }

  // weekly / custom → next Monday 08:00 Casablanca = 07:00 UTC
  const day = now.getUTCDay(); // 0 = Sunday ... 6 = Saturday
  const daysUntilMonday = ((8 - day) % 7) || 7; // 1..7
  const nextMonday = new Date(now);
  nextMonday.setUTCHours(7, 0, 0, 0);
  nextMonday.setUTCDate(now.getUTCDate() + daysUntilMonday);
  return nextMonday;
}

function formatScheduledLabel(d: Date): string {
  return d.toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Casablanca",
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
