// ═══════════════════════════════════════════════════════════════
//  POST /api/console/team-performance
//
//  Skill 20 — Team Performance Dashboard.
//
//  Returns per-team-member performance stats for the caller's
//  company (users sharing the same companyId). For each member we
//  compute:
//    • questions       — HarchIQ questions asked (AuditLog action
//                        "harchiq_ask", tracked by the quota module
//                        each time /api/console/ask succeeds).
//    • reports         — Reports generated (Report rows authored by
//                        the user; mirrors the "report_export" audit
//                        action but counts the durable artefact).
//    • lastLogin       — User.lastLoginAt (ISO string or null).
//    • responseTime    — Median minutes between consecutive audit
//                        log entries over the last 30 days. A proxy
//                        for the member's activity cadence: shorter
//                        gaps = more responsive. null if fewer than
//                        2 audit entries in the window.
//    • performanceScore — Composite 0-100 rubric:
//                        questions (max 35) + reports (max 25)
//                        + login recency (max 20) + responsiveness
//                        (max 20). See computePerformanceScore().
//
//  Response shape:
//    {
//      members: [{
//        id, name, email, role, status,
//        questions, reports, lastLogin, responseTime,
//        performanceScore, isTopPerformer
//      }],
//      meta: { companyName, generatedAt, totalMembers,
//              totalQuestions, totalReports, source }
//    }
//
//  Auth: any signed-in user with a companyId. Users without a
//  companyId get an empty member list (they have no team yet).
//
//  Skill ID: SKILL-20-TEAM-PERF
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ─── Types ───────────────────────────────────────────────────────

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  questions: number;
  reports: number;
  lastLogin: string | null;
  responseTime: number | null; // median minutes between audit actions
  performanceScore: number; // 0-100
  isTopPerformer: boolean;
}

interface TeamPerformanceResponse {
  members: TeamMember[];
  meta: {
    companyName: string;
    generatedAt: string;
    totalMembers: number;
    totalQuestions: number;
    totalReports: number;
    source: "neon" | "empty";
  };
}

// ─── Helpers ─────────────────────────────────────────────────────

/**
 * Map the raw DB role to a French human-readable label.
 * The DB stores: user | admin | company-admin | agency-admin | super_admin.
 */
function roleLabel(role: string): string {
  switch (role) {
    case "super_admin":
      return "Super Administrateur";
    case "admin":
      return "Administrateur";
    case "company-admin":
      return "Responsable d'équipe";
    case "agency-admin":
      return "Responsable d'agence";
    case "user":
    default:
      return "Membre";
  }
}

/**
 * Median of an array of numbers. Returns null for empty input.
 * Used to compute the typical gap between a member's audit actions.
 */
function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1]! + sorted[mid]!) / 2
    : sorted[mid]!;
}

/**
 * Composite performance score, 0-100.
 *
 * Rubric (max 100):
 *   • Questions HarchIQ  — 2 pts each, capped at 35      (max 35)
 *   • Rapports générés   — 5 pts each, capped at 25      (max 25)
 *   • Dernière connexion — within 24h=20, 7d=15, 30d=8   (max 20)
 *   • Réactivité         — median gap < 60min=20, < 4h=12,
 *                          < 24h=6, else 0; null=0       (max 20)
 */
function computePerformanceScore(params: {
  questions: number;
  reports: number;
  lastLogin: Date | null;
  responseTime: number | null; // minutes
}): number {
  const qPts = Math.min(35, params.questions * 2);
  const rPts = Math.min(25, params.reports * 5);

  let loginPts = 0;
  if (params.lastLogin) {
    const ageMs = Date.now() - params.lastLogin.getTime();
    const dayMs = 24 * 60 * 60 * 1000;
    if (ageMs < 1 * dayMs) loginPts = 20;
    else if (ageMs < 7 * dayMs) loginPts = 15;
    else if (ageMs < 30 * dayMs) loginPts = 8;
  }

  let respPts = 0;
  if (params.responseTime !== null) {
    const rt = params.responseTime;
    if (rt < 60) respPts = 20;
    else if (rt < 240) respPts = 12;
    else if (rt < 1440) respPts = 6;
  }

  return Math.round(qPts + rPts + loginPts + respPts);
}

// ─── Route handler ───────────────────────────────────────────────

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Resolve the caller to find their companyId.
    const caller = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        role: true,
        companyId: true,
      },
    });
    if (!caller) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // No company → no team. Return an empty (but well-formed) payload
    // so the popup can render the "no team yet" empty state.
    if (!caller.companyId) {
      return NextResponse.json(buildEmpty());
    }

    // Privileged roles (admin / super_admin) see every user in the
    // tenant. company-admin / agency-admin / regular users see only
    // their own company's members.
    const isSuper =
      caller.role === "admin" || caller.role === "super_admin";

    const userWhere = isSuper ? {} : { companyId: caller.companyId };

    // 1. Fetch all team members.
    const users = await prisma.user.findMany({
      where: userWhere,
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        lastLoginAt: true,
        companyId: true,
      },
    });

    // For super_admin without a companyId filter, restrict the team
    // roster to the caller's own company for the score computation —
    // a super_admin viewing "team performance" expects their team,
    // not the entire user base. If they have no companyId, fall back
    // to the users already fetched (which is everyone).
    const teamUsers =
      isSuper && caller.companyId
        ? users.filter((u) => u.companyId === caller.companyId)
        : users;

    if (teamUsers.length === 0) {
      return NextResponse.json(buildEmpty());
    }

    const userIds = teamUsers.map((u) => u.id);

    // 2. Fetch company name for the meta block.
    const company = caller.companyId
      ? await prisma.company.findUnique({
          where: { id: caller.companyId },
          select: { name: true },
        })
      : null;

    // 3. Batch-fetch audit log entries for every team member over the
    //    last 30 days. We pull only the columns we need (userId,
    //    action, createdAt) and group in memory — a single Prisma
    //    query keeps this O(1) round-trips regardless of team size.
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        userId: { in: userIds },
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        userId: true,
        action: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Group audit entries per user, and per action type.
    //  • questions = count of action "harchiq_ask"
    //  • responseTime = median of gaps between consecutive entries
    const auditByUser = new Map<
      string,
      { questions: number; timestamps: Date[] }
    >();
    for (const u of userIds) {
      auditByUser.set(u, { questions: 0, timestamps: [] });
    }
    for (const log of auditLogs) {
      if (!log.userId) continue;
      const bucket = auditByUser.get(log.userId);
      if (!bucket) continue;
      if (log.action === "harchiq_ask") bucket.questions += 1;
      bucket.timestamps.push(log.createdAt);
    }

    // 4. Batch-fetch report counts per user. The Report model carries
    //    userId directly so a single groupBy gives us the totals.
    const reportGroups = await prisma.report.groupBy({
      by: ["userId"],
      where: { userId: { in: userIds } },
      _count: { _all: true },
    });
    const reportsByUser = new Map<string, number>();
    for (const g of reportGroups) {
      reportsByUser.set(g.userId, g._count._all);
    }

    // 5. Assemble the member rows.
    const members: TeamMember[] = teamUsers.map((u) => {
      const audit = auditByUser.get(u.id) ?? { questions: 0, timestamps: [] };
      const questions = audit.questions;
      const reports = reportsByUser.get(u.id) ?? 0;
      const lastLogin = u.lastLoginAt;

      // Compute median gap (minutes) between consecutive audit
      // timestamps. Need at least 2 entries for a meaningful gap.
      let responseTime: number | null = null;
      if (audit.timestamps.length >= 2) {
        const gaps: number[] = [];
        for (let i = 1; i < audit.timestamps.length; i++) {
          const prev = audit.timestamps[i - 1]!.getTime();
          const curr = audit.timestamps[i]!.getTime();
          const gapMin = (curr - prev) / 60000;
          if (gapMin >= 0) gaps.push(gapMin);
        }
        responseTime = median(gaps);
      }

      const performanceScore = computePerformanceScore({
        questions,
        reports,
        lastLogin,
        responseTime,
      });

      return {
        id: u.id,
        name: u.name?.trim() || u.email.split("@")[0] || "Membre",
        email: u.email,
        role: roleLabel(u.role),
        status: u.status,
        questions,
        reports,
        lastLogin: lastLogin ? lastLogin.toISOString() : null,
        responseTime:
          responseTime === null ? null : Math.round(responseTime),
        performanceScore,
        isTopPerformer: false, // set in pass 2 below
      };
    });

    // 6. Tag the top performer — highest performanceScore wins. Ties
    //    are broken by questions asked, then reports. If everyone is
    //    at 0, no top performer is awarded (the badge stays hidden).
    let topMember: TeamMember | null = null;
    for (const m of members) {
      if (topMember === null) {
        topMember = m;
        continue;
      }
      if (
        m.performanceScore > topMember.performanceScore ||
        (m.performanceScore === topMember.performanceScore &&
          m.questions > topMember.questions)
      ) {
        topMember = m;
      }
    }
    if (topMember && topMember.performanceScore > 0) {
      topMember.isTopPerformer = true;
    }

    // 7. Sort by performanceScore desc for the default view — the
    //    popup's sort selector can re-sort on the client.
    members.sort((a, b) => {
      if (b.performanceScore !== a.performanceScore) {
        return b.performanceScore - a.performanceScore;
      }
      return b.questions - a.questions;
    });

    const response: TeamPerformanceResponse = {
      members,
      meta: {
        companyName: company?.name ?? "Équipe",
        generatedAt: new Date().toISOString(),
        totalMembers: members.length,
        totalQuestions: members.reduce((s, m) => s + m.questions, 0),
        totalReports: members.reduce((s, m) => s + m.reports, 0),
        source: "neon",
      },
    };

    return NextResponse.json(response);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError(
      "console.team-performance",
      `[/api/console/team-performance] POST failed: ${msg}`,
    );
    return NextResponse.json(
      { error: "Failed to compute team performance", detail: msg },
      { status: 500 },
    );
  }
}

function buildEmpty(): TeamPerformanceResponse {
  return {
    members: [],
    meta: {
      companyName: "Équipe",
      generatedAt: new Date().toISOString(),
      totalMembers: 0,
      totalQuestions: 0,
      totalReports: 0,
      source: "empty",
    },
  };
}
