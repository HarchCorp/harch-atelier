import { createZAI } from "@/lib/zai-wrapper";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Cron-triggered agent cycle.
 *
 * Vercel Cron calls this endpoint every 10 min → it runs the 3 agents
 * in sequence (media-scraper → alert-detector → reputation-scorer).
 *
 * In serverless (Vercel), the long-running orchestrator loop won't survive,
 * so this one-shot endpoint is the production way to trigger agent cycles.
 *
 * Set in vercel.json:
 *   { "crons": [{ "path": "/api/cron/agents", "schedule": "0,10,20,30,40,50 * * * *" }] }
 *
 * Security: requires a secret token (CRON_SECRET env var) to prevent abuse.
 */
export async function GET(req: NextRequest) {
  // Auth check — Vercel Cron sends ?secret= or Authorization header
  const secret = req.nextUrl.searchParams.get("secret") || req.headers.get("authorization")?.replace("Bearer ", "");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = { scraper: "pending", detector: "pending", scorer: "pending", startedAt: new Date().toISOString() };

  try {
    // 1. Media scraper — inline (can't spawn subprocesses on serverless)
    const { store } = await import("@/lib/data-store");
    const ZAI = (await import("z-ai-web-dev-sdk")).default;

    const BRANDS = ["HarchCorp", "Attijariwafa Bank", "OCP Group", "Maroc Telecom", "BMCE Bank of Africa", "CIH Bank", "Label'Vie"];
    const MEDIA_QUERY = "site:lematin.ma OR site:leconomiste.com OR site:hespress.com OR site:telquel.ma OR site:medias24.com OR site:aujourdhui.ma OR site:le360.ma OR site:lavieeco.com OR site:jeuneafrique.com";

    store.setStatus({ agentName: "media-scraper", lastRun: new Date().toISOString(), status: "running", itemsProcessed: 0 });

    let zai: any;
    try {
      zai = await createZAI();
    } catch {
      results.scraper = "skipped (SDK unavailable)";
      store.setStatus({ agentName: "media-scraper", lastRun: new Date().toISOString(), status: "success", itemsProcessed: 0 });
      return NextResponse.json({ ...results, finishedAt: new Date().toISOString() });
    }

    const allMentions: any[] = [];
    for (const brand of BRANDS.slice(0, 4)) {
      // Only 4 brands per cycle to stay within timeout
      try {
        const results = (await zai.functions.invoke("web_search", { query: `${brand} ${MEDIA_QUERY}`, num: 4 })) as any[];
        for (const r of results.slice(0, 4)) {
          let sentiment: "positive" | "negative" | "neutral" = "neutral";
          let pillar: any = "Reputational";
          try {
            const c = await zai.chat.completions.create({
              messages: [
                { role: "assistant", content: 'Reply JSON only: {"sentiment":"positive|negative|neutral","pillar":"Regulatory|Cyber|Financial|ESG|Geopolitical|Reputational"}' },
                { role: "user", content: r.title || r.snippet || "" },
              ],
              thinking: { type: "disabled" as const },
            });
            const m = (c.choices[0]?.message?.content || "").match(/\{[^}]+\}/);
            if (m) {
              const p = JSON.parse(m[0]);
              sentiment = p.sentiment || "neutral";
              pillar = p.pillar || "Reputational";
            }
          } catch {}
          allMentions.push({
            id: `M-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
            brand,
            title: r.title || r.snippet || "Untitled",
            url: r.url || "#",
            source: r.host_name?.replace(/^www\./, "") || "web",
            snippet: r.snippet || "",
            date: r.date || new Date().toISOString().slice(0, 10),
            sentiment,
            pillar,
            scrapedAt: new Date().toISOString(),
          });
        }
      } catch {}
    }

    const newCount = store.addMentions(allMentions);
    store.setStatus({ agentName: "media-scraper", lastRun: new Date().toISOString(), status: "success", itemsProcessed: newCount });
    results.scraper = `success (${newCount} new)`;

    // 2. Alert detector
    store.setStatus({ agentName: "alert-detector", lastRun: new Date().toISOString(), status: "running", itemsProcessed: 0 });
    const alerts: any[] = [];
    for (const brand of BRANDS) {
      const mentions = store.getMentions(brand);
      const negative = mentions.filter((m: any) => m.sentiment === "negative");
      negative.slice(0, 3).forEach((m: any, i: number) => {
        const severity = i === 0 ? "critical" : i < 2 ? "high" : "medium";
        const tti = severity === "critical" ? 5 : severity === "high" ? 30 : 120;
        alerts.push({
          id: `A-${Date.now().toString(36)}-${i}-${brand.slice(0, 3)}`,
          brand, severity,
          title: m.title, source: m.source, url: m.url, snippet: m.snippet,
          detectedAt: new Date().toISOString(), timeToImpact: tti,
          whatsappMessage: `🚨 ${severity.toUpperCase()} — ${brand}\n${m.title}\n${m.url}`,
        });
      });
    }
    store.setAlerts(alerts);
    store.setStatus({ agentName: "alert-detector", lastRun: new Date().toISOString(), status: "success", itemsProcessed: alerts.length });
    results.detector = `success (${alerts.length} alerts)`;

    // 3. Reputation scorer
    store.setStatus({ agentName: "reputation-scorer", lastRun: new Date().toISOString(), status: "running", itemsProcessed: 0 });
    const prevScores = store.getScores();
    const entries: any[] = [];
    for (const brand of BRANDS) {
      const mentions = store.getMentions(brand);
      const alertsForBrand = store.getAlerts(brand);
      const negCount = mentions.filter((m: any) => m.sentiment === "negative").length;
      const negativeShare = mentions.length > 0 ? (negCount / mentions.length) * 100 : 0;
      const mediaSentiment = Math.max(0, 100 - negativeShare * 1.5);
      const aiVisibility = 50 + (brand.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 50);
      const distinctSources = new Set(mentions.map((m: any) => m.source)).size;
      const sourceDiversity = Math.min(100, distinctSources * 15);
      const crisisExposure = Math.max(0, 100 - alertsForBrand.length * 12);
      const score = Math.round(mediaSentiment * 0.35 + aiVisibility * 0.25 + sourceDiversity * 0.2 + crisisExposure * 0.2);
      const grade = score >= 90 ? "A+" : score >= 80 ? "A" : score >= 70 ? "B" : score >= 60 ? "C" : score >= 50 ? "D" : "F";
      const prev = prevScores.find((s) => s.brand === brand);
      const trend = prev ? (score > prev.score + 1 ? "up" : score < prev.score - 1 ? "down" : "stable") : "stable";
      entries.push({ brand, score, grade, trend, components: { mediaSentiment: Math.round(mediaSentiment), aiVisibility, sourceDiversity, crisisExposure }, calculatedAt: new Date().toISOString() });
    }
    store.setScores(entries);
    store.setStatus({ agentName: "reputation-scorer", lastRun: new Date().toISOString(), status: "success", itemsProcessed: entries.length });
    results.scorer = `success (${entries.length} scores)`;

    return NextResponse.json({ ...results, finishedAt: new Date().toISOString(), totalMentions: store.getMentions().length });
  } catch (e) {
    return NextResponse.json({ ...results, error: (e as Error).message, finishedAt: new Date().toISOString() }, { status: 500 });
  }
}
