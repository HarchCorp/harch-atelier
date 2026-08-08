// ═══════════════════════════════════════════════════════════════
//  GET /api/admin/audit-logs?page=1&limit=50&action=...&userId=...
//        &result=...&from=2026-07-01&to=2026-07-31&q=...
//
//  Admin-only paginated audit log viewer with filters.
//
//  Filters:
//    - action: AuditAction (single)
//    - userId: exact match
//    - result: "success" | "denied" | "error"
//    - from / to: ISO date strings (inclusive; from = >=, to = <=)
//    - q: free-text search on resource + ipAddress + userAgent
//
//  Returns:
//    {
//      logs: AuditLog[],          // joined with user email/name
//      total: number,             // total rows matching filters
//      page: number,
//      limit: number,
//      stats: {
//        today: number,           // count of events since 00:00 today
//        topActions: { action, count }[],
//        topUsers: { userId, email, name, count }[],
//      }
//    }
//
//  Auth: role === "admin" only.
//
//  Task: audit-log-enforcement (Loi 09-08 compliance)
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_ACTIONS = new Set([
  "sanctions_screen",
  "dossier_view",
  "report_export",
  "data_export_csv",
  "portfolio_import",
  "company_settings_update",
  "user_invite",
  "user_suspend",
  "demo_access",
  "login",
  "login_failed",
  "onboarding_complete",
  "ai_probe",
  "briefing_generate",
]);

const VALID_RESULTS = new Set(["success", "denied", "error"]);

function parsePage(v: string | null): number {
  const n = parseInt(v ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, 1000);
}

function parseLimit(v: string | null): number {
  const n = parseInt(v ?? "50", 10);
  if (!Number.isFinite(n) || n < 1) return 50;
  return Math.min(n, 500);
}

function parseDate(v: string | null, endOfDay = false): Date | undefined {
  if (!v) return undefined;
  // Accept YYYY-MM-DD or full ISO.
  const isoMatch = /^\d{4}-\d{2}-\d{2}(T[\d:.]+Z?)?$/;
  if (!isoMatch.test(v)) return undefined;
  const d = endOfDay
    ? new Date(`${v.slice(0, 10)}T23:59:59.999Z`)
    : new Date(v);
  if (Number.isNaN(d.getTime())) return undefined;
  return d;
}

export async function GET(req: NextRequest) {
  // ─── Auth ───────────────────────────────────────────────────────
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin" && session.user?.role !== "super_admin") {
    return NextResponse.json(
      { error: "Forbidden — admin only" },
      { status: 403 },
    );
  }

  const url = new URL(req.url);
  const page = parsePage(url.searchParams.get("page"));
  const limit = parseLimit(url.searchParams.get("limit"));
  const rawAction = url.searchParams.get("action");
  const action = rawAction && VALID_ACTIONS.has(rawAction) ? rawAction : undefined;
  const userId = url.searchParams.get("userId") || undefined;
  const rawResult = url.searchParams.get("result");
  const result = rawResult && VALID_RESULTS.has(rawResult) ? rawResult : undefined;
  const from = parseDate(url.searchParams.get("from"), false);
  const to = parseDate(url.searchParams.get("to"), true);
  const q = url.searchParams.get("q")?.trim() || undefined;

  // ─── Build the where clause ────────────────────────────────────
  const where: {
    action?: string;
    userId?: string;
    result?: string;
    createdAt?: { gte?: Date; lte?: Date };
    OR?: Array<{ resource?: { contains: string; mode: "insensitive" }; ipAddress?: { contains: string; mode: "insensitive" }; userAgent?: { contains: string; mode: "insensitive" } }>;
  } = {};

  if (action) where.action = action;
  if (userId) where.userId = userId;
  if (result) where.result = result;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = from;
    if (to) where.createdAt.lte = to;
  }
  if (q) {
    where.OR = [
      { resource: { contains: q, mode: "insensitive" } },
      { ipAddress: { contains: q, mode: "insensitive" } },
      { userAgent: { contains: q, mode: "insensitive" } },
    ];
  }

  try {
    // ─── Fetch page of logs + total count in parallel ────────────
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    // Fetch user info separately (AuditLog.userId is a plain string, not a relation)
    const userIds = [...new Set(logs.map((l) => l.userId).filter(Boolean))] as string[];
    const users = userIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, email: true, name: true },
        })
      : [];
    const userMap = new Map(users.map((u) => [u.id, u]));
    const logsWithUsers = logs.map((l) => ({
      ...l,
      user: l.userId ? userMap.get(l.userId) ?? null : null,
    }));

    // ─── Stats: today's count + top actions + top users ─────────
    // Run in parallel. "Today" is computed against UTC midnight so
    // the admin's view is deterministic across deployments.
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    const [todayCount, topActionsRaw, topUsersRaw] = await Promise.all([
      prisma.auditLog.count({
        where: { createdAt: { gte: startOfToday } },
      }),
      prisma.auditLog.groupBy({
        by: ["action"],
        _count: { _all: true },
        orderBy: { _count: { action: "desc" } },
        take: 10,
      }),
      prisma.auditLog.groupBy({
        by: ["userId"],
        _count: { _all: true },
        orderBy: { _count: { userId: "desc" } },
        take: 10,
      }),
    ]);

    // Hydrate top users with their email/name (groupBy only returns ids).
    const topUserIds = topUsersRaw
      .map((u) => u.userId)
      .filter((id): id is string => id !== null);
    const topUserRows = topUserIds.length
      ? await prisma.user.findMany({
          where: { id: { in: topUserIds } },
          select: { id: true, email: true, name: true },
        })
      : [];
    const userById = new Map(topUserRows.map((u) => [u.id, u]));

    const topUsers = topUsersRaw.map((u) => {
      const row = u.userId ? userById.get(u.userId) : undefined;
      return {
        userId: u.userId,
        email: row?.email ?? null,
        name: row?.name ?? null,
        count: u._count._all,
      };
    });

    const topActions = topActionsRaw.map((a) => ({
      action: a.action,
      count: a._count._all,
    }));

    return NextResponse.json({
      logs: logsWithUsers,
      total,
      page,
      limit,
      stats: {
        today: todayCount,
        topActions,
        topUsers,
      },
    });
  } catch (err) {
    logError("admin.audit-logs", `[audit-logs] GET failed: ${err}`);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
