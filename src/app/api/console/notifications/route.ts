import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";

// ═══════════════════════════════════════════════════════════════
//  /api/console/notifications
//
//  GET    — returns unread notifications for the current user
//  PATCH  — marks notifications as read
//             body: { id: "all" | "<notification-id>" }
//
//  Auth: requires a session (any accountType).
//  Notifications are scoped to the caller's userId — a user can
//  only read/mark-as-read their own notifications.
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const id = typeof body?.id === "string" ? body.id : null;

    if (!id) {
      return NextResponse.json({ error: "Missing 'id' field" }, { status: 400 });
    }

    if (id === "all") {
      const result = await prisma.notification.updateMany({
        where: { userId: session.user.id, read: false },
        data: { read: true },
      });
      return NextResponse.json({ marked: result.count, scope: "all" });
    }

    // Single notification — verify ownership before updating
    const updated = await prisma.notification.updateMany({
      where: { id, userId: session.user.id },
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
