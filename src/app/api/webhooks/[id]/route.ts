import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { logAudit, extractIp, extractUserAgent } from "@/lib/harchiq/audit-log";

// ═══════════════════════════════════════════════════════════════
//  DELETE /api/webhooks/[id]
//
//  Hard-deletes a webhook. We DO delete the row (unlike API keys,
//  which are soft-revoked) because webhooks are stateless endpoints
//  — there's nothing to audit after they're gone except the delivery
//  log, which is preserved via WebhookDelivery rows that cascade on
//  delete... actually no, the schema has `onDelete: Cascade` on
//  WebhookDelivery.webhook, so the deliveries ARE deleted. If you
//  need to preserve delivery history, soft-delete instead.
//
//  Auth: same ownership rules as API keys:
//    • webhook owner
//    • company-admin for the webhook's company
//    • super-admin
//
//  Task: signal-enterprise-platform
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const webhook = await prisma.webhook.findUnique({
    where: { id },
    select: {
      id: true,
      url: true,
      userId: true,
      companyId: true,
      user: { select: { companyId: true } },
    },
  });

  if (!webhook) {
    return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
  }

  const caller = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, companyId: true, role: true },
  });
  if (!caller) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isOwner = webhook.userId === caller.id;
  const isCompanyAdminForOwner =
    caller.role === "company-admin" && webhook.companyId === caller.companyId;
  const isSuperAdmin = caller.role === "admin";

  if (!isOwner && !isCompanyAdminForOwner && !isSuperAdmin) {
    return NextResponse.json(
      { error: "Forbidden — you can only delete your own webhooks." },
      { status: 403 },
    );
  }

  await prisma.webhook.delete({ where: { id: webhook.id } });

  await logAudit({
    userId: caller.id,
    action: "webhook.delete" as never,
    resource: `webhook:${webhook.id}`,
    result: "success",
    ipAddress: extractIp(req),
    userAgent: extractUserAgent(req),
    metadata: {
      url: webhook.url,
      ownerId: webhook.userId,
      selfDelete: isOwner,
    },
  });

  return NextResponse.json({ ok: true, id: webhook.id });
}
