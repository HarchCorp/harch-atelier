import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { SURGICAL_TARGETS, generateSurgicalEmail, sendSurgicalEmail } from "@/lib/email/surgical";
import { logAudit, extractIp, extractUserAgent } from "@/lib/harchiq/audit-log";
import { logInfo, logError } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

// ═══════════════════════════════════════════════════════════════
//  POST /api/sales/send-surgical
//
//  Body options:
//    {}                     → send to ALL 5 targets
//    { slug: "ocp-group" }  → send to ONE target
//
//  Auth: super_admin only. This is the nuclear button.
//  Each email is logged in the audit trail.
// ═══════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden — super_admin only" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const baseUrl = `${req.nextUrl.protocol}//${req.nextUrl.host}`;

  // Filter targets if a specific slug is requested
  const targets = body.slug
    ? SURGICAL_TARGETS.filter((t) => t.companySlug === body.slug)
    : SURGICAL_TARGETS;

  if (targets.length === 0) {
    return NextResponse.json({ error: "No targets found for slug: " + body.slug }, { status: 404 });
  }

  logInfo("surgical-email", `Initiating surgical batch: ${targets.length} targets`);

  const results: Array<{ company: string; email: string; subject: string; status: "SENT" | "FAILED"; id?: string; error?: string }> = [];

  for (const target of targets) {
    const retroUrl = `${baseUrl}/atelier/retro-audit?companySlug=${target.companySlug}&startDate=${target.crisisStartDate}&endDate=${target.crisisEndDate}`;
    const email = generateSurgicalEmail(target, retroUrl);
    const result = await sendSurgicalEmail(email);

    results.push({
      company: target.companyName,
      email: target.dircomEmail,
      subject: email.subject,
      status: result.ok ? "SENT" : "FAILED",
      id: result.id,
      error: result.error,
    });

    await logAudit({
      userId: session.user.id,
      action: "surgical_email_sent",
      resource: `email:${target.dircomEmail}`,
      result: result.ok ? "success" : "error",
      ipAddress: extractIp(req),
      userAgent: extractUserAgent(req),
      metadata: {
        company: target.companyName,
        crisisEvent: target.crisisEvent,
        resendId: result.id,
      },
    });

    if (!result.ok) {
      logError("surgical-email", `Failed for ${target.companyName}: ${result.error}`);
    } else {
      logInfo("surgical-email", `Sent to ${target.companyName} (${target.dircomEmail}) — Resend ID: ${result.id}`);
    }

    // Rate limit: 3s between sends
    if (targets.length > 1) {
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  const sent = results.filter((r) => r.status === "SENT").length;
  const failed = results.filter((r) => r.status === "FAILED").length;

  return NextResponse.json({
    ok: failed === 0,
    total: results.length,
    sent,
    failed,
    results,
    message: sent > 0
      ? `${sent} email(s) envoyé(s). Vérifiez Resend dashboard pour le statut de délivrabilité.`
      : "Aucun email envoyé. RESEND_API_KEY manquant ? Configurez-le sur Vercel.",
  });
}
