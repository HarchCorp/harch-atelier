import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { demoFilterFromSession } from "@/lib/harchiq/company-session";
import { isDemoEmail } from "@/lib/demo-session";
import { demoNotificationsResponse } from "@/lib/demo-console-api";

// ═══════════════════════════════════════════════════════════════
//  /api/console/notifications
//
//  GET    — returns unread notifications for the current user
//  PATCH  — marks notifications as read
//             body: { id: "all" | "<notification-id>" }
//
//  Auth: requires a session with a valid user.id (any accountType).
//  Notifications are scoped to the caller's userId — a user can
//  only read/mark-as-read their own notifications.
//
//  SECURITY: We hard-fail with 401 if `session.user.id` is missing.
//  Previously this route used an email-lookup band-aid to work around
//  the JWT not carrying `id`, but that is no longer necessary now that
//  auth.config.ts populates `token.id` → `session.user.id`. Allowing
//  the route to run without `user.id` would let Prisma treat
//  `where: { userId: undefined }` as "no filter" and leak every
//  notification in the DB (IDOR).
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized — session invalid" },
      { status: 401 },
    );
  }
  const userId = session.user.id;
  // Task: domain-matching-demo-isolation — demo users see only demo
  // notifications, real users see only real notifications.
  const demoFilter = demoFilterFromSession(session);

  // ─── DEMO BYPASS ─────────────────────────────────────────────
  if (session.user.isDemo || isDemoEmail(session.user.email)) {
    return demoNotificationsResponse();
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId, ...demoFilter },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        type: true,
        title: true,
        body: true,
        severity: true,
        read: true,
        link: true,
        createdAt: true,
      },
    });

    const unread = notifications.filter((n) => !n.read);

    return NextResponse.json({
      notifications,
      unreadCount: unread.length,
      total: notifications.length,
    });
  } catch (err) {
    console.error("Notifications GET error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized — session invalid" },
      { status: 401 },
    );
  }
  const userId = session.user.id;
  // Task: domain-matching-demo-isolation
  const demoFilter = demoFilterFromSession(session);

  try {
    const body = await req.json().catch(() => ({}));
    const id = typeof body?.id === "string" ? body.id : null;

    if (!id) {
      return NextResponse.json({ error: "Missing 'id' field" }, { status: 400 });
    }

    if (id === "all") {
      const result = await prisma.notification.updateMany({
        where: { userId, read: false, ...demoFilter },
        data: { read: true },
      });
      return NextResponse.json({ marked: result.count, scope: "all" });
    }

    // Single notification — verify ownership before updating
    const updated = await prisma.notification.updateMany({
      where: { id, userId, ...demoFilter },
      data: { read: true },
    });

    if (updated.count === 0) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ marked: 1, scope: "single", id });
  } catch (err) {
    console.error("Notifications PATCH error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
