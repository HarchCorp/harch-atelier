import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateSurgicalEmail, sendSurgicalEmail, type SurgicalEmailTarget } from "@/lib/email/surgical";
import { CRM_TARGETS } from "@/lib/crm/targets";
import { logInfo, logError } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

// ═══════════════════════════════════════════════════════════════
//  GET /api/cron/auto-surgical
//
//  Front 2: Automated surgical email — runs every hour via Vercel Cron.
//
//  1. Scans recent articles (last 2h) for negative sentiment spikes
//  2. If a CRM target company has a spike → generates retro-audit
//  3. Sends the surgical email to the Dircom within the hour
//
//  This automates the sales weapon: when a crisis hits a target
//  company, the Dircom receives the email BEFORE the crisis peaks.
//
//  Auth: CRON_SECRET header.
// ═══════════════════════════════════════════════════════════════

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  const results: Array<{ company: string; action: string; status: string }> = [];

  try {
    // 1. Find CRM targets that have a company in our DB
    const companies = await prisma.company.findMany({
      where: {
        slug: { in: CRM_TARGETS.filter((t) => t.crisisEvent).map((t) => slugify(t.companyName)) },
      },
      select: { id: true, slug: true, name: true },
    });

    // 2. For each company, check for negative sentiment spike in last 2h
    const twoHoursAgo = new Date(Date.now() - 2 * 3600000);

    for (const company of companies) {
      const recentNegative = await prisma.article.findMany({
        where: {
          companyId: company.id,
          sentimentLabel: "negative",
          publishedAt: { gte: twoHoursAgo },
        },
        orderBy: { publishedAt: "desc" },
        take: 5,
        select: { id: true, title: true, source: true, sentimentScore: true, publishedAt: true },
      });

      if (recentNegative.length >= 3) {
        // Spike detected: 3+ negative articles in 2h
        const crmTarget = CRM_TARGETS.find(
          (t) => t.companyName.toLowerCase() === company.name.toLowerCase(),
        );

        if (!crmTarget || crmTarget.status !== "NOT_CONTACTED") continue;

        // Generate the surgical email with current crisis
        const baseUrl = `${req.nextUrl.protocol}//${req.nextUrl.host}`;
        const retroUrl = `${baseUrl}/atelier/retro-audit?companySlug=${company.slug}&startDate=${new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)}&endDate=${new Date().toISOString().slice(0, 10)}`;

        const surgicalTarget: SurgicalEmailTarget = {
          companyName: company.name,
          companySlug: company.slug,
          dircomName: "Direction de la Communication",
          dircomEmail: crmTarget.emailPattern,
          dircomTitle: `Dircom ${company.name}`,
          crisisEvent: `Pic d'articles négatifs détecté (${recentNegative.length} articles en 2h)`,
          crisisStartDate: new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10),
          crisisEndDate: new Date().toISOString().slice(0, 10),
          crisisDescription: `${recentNegative.length} articles négatifs publiés dans les dernières 2h sur ${company.name}. Sources: ${recentNegative.map((a) => a.source).join(", ")}.`,
        };

        const email = generateSurgicalEmail(surgicalTarget, retroUrl);
        const sendResult = await sendSurgicalEmail(email);

        results.push({
          company: company.name,
          action: `Auto-surgical email sent — ${recentNegative.length} negative articles in 2h`,
          status: sendResult.ok ? "SENT" : `FAILED: ${sendResult.error}`,
        });

        logInfo("auto-surgical", `${company.name}: spike detected (${recentNegative.length} neg/2h) → email ${sendResult.ok ? "sent" : "failed"}`);
      }
    }

    const elapsed = Date.now() - startTime;
    logInfo("auto-surgical", `Scan complete in ${elapsed}ms — ${results.length} actions taken`);

    return NextResponse.json({
      ok: true,
      scanned: companies.length,
      actions: results.length,
      results,
      durationMs: elapsed,
    });
  } catch (err) {
    logError("auto-surgical", `Error: ${err}`);
    return NextResponse.json(
      { error: "Auto-surgical failed", detail: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}

function slugify(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
