import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import ZAI from "z-ai-web-dev-sdk";

// ═══════════════════════════════════════════════════════════════
//  POST /api/console/ask
//
//  HarchIQ GenAI Assistant — natural language Q&A over the user's
//  real Prisma data. The Brandwatch "Search Intelligence GenAI" and
//  Dataminr "LLM briefing" equivalent.
//
//  Flow:
//    1. Auth check (any accountType + admin allowed).
//    2. Validate body `{ question: string }`.
//    3. Fetch real recent data from Prisma (the same sources the
//       existing /api/console/* endpoints derive alerts, topics,
//       ai-visibility and neighbors from — there is no Alert/Topic/
//       Neighbor model in schema.prisma, those are computed views).
//    4. Build a grounded context prompt that forbids hallucination.
//    5. Call the LLM via `z-ai-web-dev-sdk` (server-side only).
//    6. Extract cited sources by matching alert/topic text back
//       against the LLM answer.
//    7. Return `{ answer, sources, generatedAt }`.
//
//  Note: z-ai-web-dev-sdk is imported statically here. It only
//  works in a server runtime (reads /etc/.z-ai-config in prod) and
//  MUST NEVER be imported from a client component.
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ─── TYPES ────────────────────────────────────────────────────────

interface AlertContext {
  id: string;
  type: "negative_article" | "risk_assessment";
  title: string;
  source: string;
  severity: "critical" | "high" | "medium" | "low";
  sentimentScore: number | null;
  publishedAt: Date | null;
}

interface TopicContext {
  label: string;
  count: number;
  type: "source" | "risk";
}

interface AiVisibilityContext {
  platform: string;
  cited: boolean;
  position: string | null;
  sentiment: string | null;
  summary: string | null;
}

interface NeighborContext {
  name: string;
  sector: string;
  rank: 1 | 2 | 3;
  reputationScore: number;
  delta: number;
  latestMove: string | null;
}

interface AskSource {
  type: "alert" | "topic" | "ai-visibility" | "neighbor";
  id: string;
  title: string;
}

interface AskResponse {
  answer: string;
  sources: AskSource[];
  generatedAt: string;
}

// ─── HELPERS ──────────────────────────────────────────────────────

function severityFor(score: number | null): "critical" | "high" {
  if (score === null) return "high";
  return score < -0.6 ? "critical" : "high";
}

function isoDate(d: Date | null): string {
  if (!d) return "unknown";
  return new Date(d).toISOString().split("T")[0];
}

// ─── ROUTE HANDLER ────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. AUTH — any logged-in user (any accountType) + admin.
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. BODY VALIDATION
  let question: string;
  try {
    const body = await req.json();
    question = typeof body.question === "string" ? body.question.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (question.length < 3) {
    return NextResponse.json({ error: "Question too short" }, { status: 400 });
  }
  if (question.length > 2000) {
    return NextResponse.json({ error: "Question too long (max 2000 chars)" }, { status: 400 });
  }

  const userId = session.user?.id;
  const accountType = session.user?.accountType ?? "unknown";

  if (!userId) {
    return NextResponse.json({ error: "No user id on session" }, { status: 401 });
  }

  try {
    // 3. FETCH REAL DATA — same primitives the existing console APIs use.
    //    Pick the primary company (first created, like the alerts API).
    const company = await prisma.company.findFirst({
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, slug: true, sector: true },
    });

    // Compute the 7-day window for "recent" alerts.
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Run all data fetches in parallel.
    const [negativeArticles, highRisks, aiVisibilityRaw, primaryScore, neighborsRaw, recentArticlesForTopics] =
      await Promise.all([
        // ALERTS (part 1) — recent negative articles.
        company
          ? prisma.article.findMany({
              where: {
                companyId: company.id,
                sentimentLabel: "negative",
                publishedAt: { gte: sevenDaysAgo },
              },
              orderBy: { publishedAt: "desc" },
              take: 30,
              select: {
                id: true,
                title: true,
                source: true,
                url: true,
                sentimentScore: true,
                publishedAt: true,
              },
            })
          : Promise.resolve([]),
        // ALERTS (part 2) — high/critical risk assessments.
        company
          ? prisma.riskAssessment.findMany({
              where: { companyId: company.id, riskLevel: { in: ["high", "critical"] } },
              orderBy: { riskScore: "desc" },
              take: 10,
              select: {
                id: true,
                category: true,
                riskLevel: true,
                riskScore: true,
                trajectory: true,
                articleCount: true,
              },
            })
          : Promise.resolve([]),
        // AI VISIBILITY — latest row per platform.
        company
          ? prisma.aIVisibility.findMany({
              where: { companyId: company.id },
              orderBy: { checkedAt: "desc" },
              select: {
                id: true,
                platform: true,
                cited: true,
                position: true,
                sentiment: true,
                summary: true,
                checkedAt: true,
              },
            })
          : Promise.resolve([]),
        // PRIMARY SCORE — for reputation trend questions.
        company
          ? prisma.reputationScore.findFirst({
              where: { companyId: company.id },
              orderBy: { calculatedAt: "desc" },
              select: {
                id: true,
                overall: true,
                sentiment: true,
                aiVisibility: true,
                volume: true,
                trend: true,
                calculatedAt: true,
              },
            })
          : Promise.resolve(null),
        // NEIGHBORS — same-sector companies + adjacent ones.
        company
          ? prisma.company.findMany({
              where: { id: { not: company.id } },
              include: {
                reputationScores: {
                  orderBy: { calculatedAt: "desc" },
                  take: 1,
                  select: { overall: true },
                },
              },
              take: 20,
            })
          : Promise.resolve([]),
        // TOPICS — recent article sources + risk categories (proxy topics).
        company
          ? prisma.article.findMany({
              where: {
                companyId: company.id,
                publishedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
              },
              select: { source: true, sentimentLabel: true },
              take: 500,
            })
          : Promise.resolve([]),
      ]);

    // 4. SHAPE THE CONTEXT OBJECTS — match the spec's vocabulary
    //    (alerts / topics / ai-visibility / neighbors) so the LLM
    //    prompt below reads naturally.

    const alerts: AlertContext[] = [
      ...negativeArticles.map<AlertContext>((a) => ({
        id: a.id,
        type: "negative_article" as const,
        title: a.title,
        source: a.source,
        severity: severityFor(a.sentimentScore ?? null),
        sentimentScore: a.sentimentScore ?? null,
        publishedAt: a.publishedAt,
      })),
      ...highRisks.map<AlertContext>((r) => ({
        id: r.id,
        type: "risk_assessment" as const,
        title: `${r.category} risk — ${r.riskLevel}`,
        source: "HarchIQ Risk Engine",
        severity: r.riskLevel === "critical" ? "critical" : "high",
        sentimentScore: null,
        publishedAt: null,
      })),
    ].slice(0, 50);

    // TOPICS — group recent articles by source + merge risk categories.
    const sourceMap = new Map<string, number>();
    for (const a of recentArticlesForTopics) {
      sourceMap.set(a.source, (sourceMap.get(a.source) ?? 0) + 1);
    }
    const topics: TopicContext[] = [
      ...Array.from(sourceMap.entries()).map<TopicContext>(([label, count]) => ({
        label,
        count,
        type: "source" as const,
      })),
      ...highRisks.map<TopicContext>((r) => ({
        label: r.category,
        count: r.articleCount ?? 0,
        type: "risk" as const,
      })),
    ]
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    // AI VISIBILITY — keep only the latest row per platform.
    const platformMap = new Map<string, AiVisibilityContext>();
    for (const av of aiVisibilityRaw) {
      if (!platformMap.has(av.platform)) {
        platformMap.set(av.platform, {
          platform: av.platform,
          cited: av.cited,
          position: av.position,
          sentiment: av.sentiment,
          summary: av.summary,
        });
      }
    }
    const aiVisibility: AiVisibilityContext[] = Array.from(platformMap.values());

    // NEIGHBORS — derive rank from reputation score proximity.
    const yourScore = primaryScore?.overall ?? 50;
    const neighbors: NeighborContext[] = await Promise.all(
      neighborsRaw.map(async (n) => {
        const theirScore = n.reputationScores[0]?.overall ?? 50;
        const delta = theirScore - yourScore;
        const rank: 1 | 2 | 3 =
          Math.abs(delta) <= 10 ? 1 : Math.abs(delta) <= 20 ? 2 : 3;

        // Get the latest article title for this neighbor (their latest "move").
        const latest = await prisma.article.findFirst({
          where: { companyId: n.id },
          orderBy: { publishedAt: "desc" },
          select: { title: true },
        });

        return {
          name: n.name,
          sector: n.sector,
          rank,
          reputationScore: theirScore,
          delta,
          latestMove: latest?.title ?? null,
        };
      }),
    );
    neighbors.sort((a, b) => a.rank - b.rank || Math.abs(b.delta) - Math.abs(a.delta));

    // 5. BUILD THE CONTEXT PROMPT — grounded, no-hallucination rules.
    const companyName = company?.name ?? "your company";
    const companySector = company?.sector ?? "unknown";

    const alertsBlock =
      alerts.length > 0
        ? alerts
            .map(
              (a) =>
                `- [${a.severity.toUpperCase()}] ${a.title} (source: ${a.source}, sentiment: ${a.sentimentScore ?? "n/a"}, date: ${isoDate(a.publishedAt)})`,
            )
            .join("\n")
        : "- No recent alerts recorded in the last 7 days.";

    const topicsBlock =
      topics.length > 0
        ? topics
            .map((t) => `- ${t.label}: ${t.count} mentions (type: ${t.type})`)
            .join("\n")
        : "- No topic data available.";

    const aiVisibilityBlock =
      aiVisibility.length > 0
        ? aiVisibility
            .map(
              (v) =>
                `- ${v.platform}: ${v.cited ? "cited" : "not cited"}, position ${v.position ?? "n/a"}, sentiment ${v.sentiment ?? "n/a"}${v.summary ? ` — ${v.summary.slice(0, 120)}` : ""}`,
            )
            .join("\n")
        : "- No AI engine visibility data available.";

    const neighborsBlock =
      neighbors.length > 0
        ? neighbors
            .slice(0, 10)
            .map(
              (n) =>
                `- ${n.name} (${n.sector}) — rank ${n.rank}, score ${n.reputationScore} (delta ${n.delta >= 0 ? "+" : ""}${n.delta} vs you)${n.latestMove ? ` — latest: ${n.latestMove.slice(0, 100)}` : ""}`,
            )
            .join("\n")
        : "- No competitor data available.";

    const reputationBlock = primaryScore
      ? `Reputation score: ${primaryScore.overall.toFixed(1)}/100 (trend: ${primaryScore.trend ?? "stable"}). Components — sentiment: ${primaryScore.sentiment?.toFixed(1) ?? "n/a"}, AI visibility: ${primaryScore.aiVisibility?.toFixed(1) ?? "n/a"}, volume: ${primaryScore.volume?.toFixed(1) ?? "n/a"}.`
      : "No reputation score recorded yet.";

    const contextPrompt = `You are HarchIQ, the AI intelligence assistant for Harch Atelier.
Answer the user's question based ONLY on the real data below.
If the data doesn't contain the answer, say "I don't have enough data to answer this."
Cite sources by referencing alert titles, topic labels, AI engine names, or competitor names.
Do not invent numbers, sources, or events that are not in the data.

USER ACCOUNT TYPE: ${accountType}
PRIMARY COMPANY: ${companyName} (sector: ${companySector})

CURRENT REPUTATION:
${reputationBlock}

RECENT ALERTS (last 50 — negative articles + high/critical risk assessments):
${alertsBlock}

TOP TOPICS (top 20 — sources + risk categories):
${topicsBlock}

AI VISIBILITY (latest per engine):
${aiVisibilityBlock}

COMPETITORS / NEIGHBORS (top 10 by rank):
${neighborsBlock}

USER QUESTION: ${question}

Answer concisely (max 3 paragraphs). Cite specific alerts/topics/AI engines/competitors when relevant. Use plain English, no emojis.`;

    // 6. CALL THE LLM via z-ai-web-dev-sdk (server-side only).
    let answer: string;
    try {
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: [{ role: "user", content: contextPrompt }],
        temperature: 0.3,
        max_tokens: 500,
        thinking: { type: "disabled" as const },
      });
      answer =
        (completion?.choices?.[0]?.message?.content as string | undefined) ||
        "No response generated.";
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[/api/console/ask] LLM call failed:", message);
      return NextResponse.json(
        { error: "AI request failed", detail: message },
        { status: 502 },
      );
    }

    // 7. EXTRACT CITED SOURCES — simple text-match against the answer.
    const sources: AskSource[] = [];
    const seenSourceIds = new Set<string>();

    // Match alerts by title prefix (first 30 chars, lowercase compare).
    const answerLower = answer.toLowerCase();
    for (const a of alerts) {
      const key = a.title.slice(0, 30).toLowerCase();
      if (key.length > 5 && answerLower.includes(key) && !seenSourceIds.has(a.id)) {
        sources.push({ type: "alert", id: a.id, title: a.title });
        seenSourceIds.add(a.id);
      }
      if (sources.length >= 5) break;
    }

    // Match AI engines by platform name (case-insensitive, word-ish).
    if (sources.length < 5) {
      for (const v of aiVisibility) {
        const p = v.platform.toLowerCase();
        if (p.length > 2 && answerLower.includes(p)) {
          const sid = `aivis-${v.platform}`;
          if (!seenSourceIds.has(sid)) {
            sources.push({
              type: "ai-visibility",
              id: sid,
              title: `${v.platform} — ${v.cited ? "cited" : "not cited"}`,
            });
            seenSourceIds.add(sid);
          }
        }
        if (sources.length >= 5) break;
      }
    }

    // Match neighbors by name.
    if (sources.length < 5) {
      for (const n of neighbors) {
        const nm = n.name.toLowerCase();
        if (nm.length > 2 && answerLower.includes(nm)) {
          const sid = `nb-${n.name}`;
          if (!seenSourceIds.has(sid)) {
            sources.push({
              type: "neighbor",
              id: sid,
              title: `${n.name} (rank ${n.rank}, score ${n.reputationScore})`,
            });
            seenSourceIds.add(sid);
          }
        }
        if (sources.length >= 5) break;
      }
    }

    // Match topics by label.
    if (sources.length < 5) {
      for (const t of topics) {
        const lb = t.label.toLowerCase();
        if (lb.length > 2 && answerLower.includes(lb)) {
          const sid = `tp-${t.label}`;
          if (!seenSourceIds.has(sid)) {
            sources.push({
              type: "topic",
              id: sid,
              title: `${t.label} (${t.count} mentions)`,
            });
            seenSourceIds.add(sid);
          }
        }
        if (sources.length >= 5) break;
      }
    }

    const response: AskResponse = {
      answer,
      sources,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/console/ask] Unexpected error:", message);
    return NextResponse.json(
      { error: "Internal server error", detail: message },
      { status: 500 },
    );
  }
}
